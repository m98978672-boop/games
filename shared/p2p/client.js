/* ============================================================
   Games P2P — КЛИЕНТ (shared/p2p/client.js)
   ------------------------------------------------------------
   Настоящий P2P: браузеры соединяются напрямую по WebRTC
   DataChannel и обмениваются частью (чанками) игры. Сервер
   (Supabase Edge Function `p2p-torrent`) работает как:

     • трекер  — кто в раздаче, какой у кого прогресс;
     • сигналинг — передача offer/answer/ice между пирами;
     • резервный сид — отдаёт чанк, если живых пиров нет.

   Если WebRTC не поднялся (строгий NAT, нет сервера), клиент
   автоматически качает через HTTPS-«сид» сервера, поэтому игра
   скачается всегда. Режим виден в интерфейсе.

   Подключение:
     <script src="shared/p2p/manifest.js"></script>
     <script src="shared/p2p/client.js"></script>
     const net = GamesP2P.createClient({ endpoint, apiKey });
   ============================================================ */
(function (root) {
  'use strict';
  const P2P = (root.GamesP2P = root.GamesP2P || {});

  const DEFAULT_ENDPOINT = 'https://cuhfnzgytndyntpbnbda.supabase.co/functions/v1/p2p-torrent';
  // Публичный (publishable) ключ Supabase — он и так стоит в HTML витрины.
  const DEFAULT_API_KEY = 'sb_publishable_e_wAa_4GG_81zYOcpGE1-A_j6iNnoKn';

  const RTC_CONFIG = {
    iceServers: [
      { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] },
    ],
  };

  const POLL_MS = 1500;
  const ANNOUNCE_MS = 5000;
  const MAX_PEERS = 4;

  function randomId(prefix) {
    const bytes = new Uint8Array(9);
    (root.crypto || {}).getRandomValues?.(bytes);
    const hex = [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
    return `${prefix || 'peer'}-${hex || Math.random().toString(36).slice(2, 14)}`;
  }

  function toBase64(bytes) {
    let bin = '';
    const arr = new Uint8Array(bytes);
    for (let i = 0; i < arr.length; i += 0x8000) {
      bin += String.fromCharCode.apply(null, arr.subarray(i, i + 0x8000));
    }
    return root.btoa ? root.btoa(bin) : Buffer.from(bin, 'binary').toString('base64');
  }

  function fromBase64(text) {
    const bin = root.atob ? root.atob(text) : Buffer.from(text, 'base64').toString('binary');
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i);
    return out;
  }

  function createClient(options) {
    const cfg = options || {};
    const endpoint = cfg.endpoint || DEFAULT_ENDPOINT;
    const apiKey = cfg.apiKey || DEFAULT_API_KEY;
    const peerId = cfg.peerId || randomId('peer');
    const log = typeof cfg.onLog === 'function' ? cfg.onLog : () => {};

    const state = {
      connected: false,
      mode: 'offline', // 'p2p' | 'relay' | 'offline'
      peers: new Map(), // peerId -> { pc, channel, bitmap, uploaded, downloaded, role }
      polling: null,
      announcing: null,
      lastSignalId: 0,
      stats: { uploaded: 0, downloaded: 0, fromPeers: 0, fromRelay: 0 },
      manifest: null,
      have: null,
      transferring: false,
    };

    async function call(action, payload) {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: apiKey,
          Authorization: `Bearer ${apiKey}`,
          'x-peer-id': peerId,
        },
        body: JSON.stringify({ action, peerId, ...(payload || {}) }),
      });
      const text = await res.text();
      let data = null;
      try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }
      if (!res.ok) throw new Error((data && (data.error || data.message)) || `HTTP ${res.status}`);
      return data;
    }

    // ------------------------------------------------------- трекер
    async function announce(extra) {
      if (!state.manifest) return null;
      const progress = state.have ? P2P.progressOf(state.have) : { percent: 0, complete: false };
      const data = await call('announce', {
        gameId: state.manifest.gameId,
        role: progress.complete ? 'seeder' : 'leecher',
        haveBitmap: state.have ? P2P.bitmapToString((i) => state.have[i], state.have.length) : '',
        uploaded: state.stats.uploaded,
        downloaded: state.stats.downloaded,
        client: 'games-web-p2p/1.0',
        ...(extra || {}),
      });
      state.connected = true;
      if (state.mode === 'offline') state.mode = 'relay';
      return data;
    }

    // Ищем соседей и поднимаем соединения с теми, у кого есть нужные чанки.
    async function connectToPeers() {
      const data = await announce();
      const peers = (data && data.peers) || [];
      for (const peer of peers) {
        if (state.peers.size >= MAX_PEERS) break;
        if (state.peers.has(peer.peer_id)) continue;
        if (!peer.have_bitmap || peer.have_bitmap.indexOf('1') === -1) continue;
        openPeerConnection(peer.peer_id, peer.have_bitmap).catch((err) => log('p2p: ' + err.message));
      }
    }

    // ------------------------------------------------ WebRTC-соединение
    async function openPeerConnection(remoteId, remoteBitmap) {
      const pc = new root.RTCPeerConnection(RTC_CONFIG);
      const channel = pc.createDataChannel('chunks', { ordered: true });
      const entry = { pc, channel, bitmap: P2P.bitmapFromString(remoteBitmap, state.manifest?.chunkCount || 0), uploaded: 0, downloaded: 0, role: 'peer' };
      state.peers.set(remoteId, entry);

      channel.binaryType = 'arraybuffer';
      channel.onopen = () => {
        state.mode = 'p2p';
        log(`p2p: канал с ${remoteId.slice(0, 14)} открыт`);
      };
      channel.onmessage = (ev) => handlePeerMessage(remoteId, ev.data);
      channel.onclose = () => {
        state.peers.delete(remoteId);
        if (!state.peers.size && state.mode === 'p2p') state.mode = 'relay';
      };

      pc.onicecandidate = (ev) => {
        if (ev.candidate) {
          sendSignal(remoteId, 'ice', { candidate: ev.candidate.toJSON ? ev.candidate.toJSON() : ev.candidate });
        }
      };
      pc.onconnectionstatechange = () => {
        if (['failed', 'disconnected', 'closed'].includes(pc.connectionState)) {
          state.peers.delete(remoteId);
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await sendSignal(remoteId, 'offer', { sdp: pc.localDescription });
      return entry;
    }

    async function sendSignal(toPeer, kind, payload) {
      return call('signal', { gameId: state.manifest.gameId, toPeer, kind, payload });
    }

    // Разбор входящих сообщений по DataChannel.
    async function handlePeerMessage(remoteId, raw) {
      let msg = raw;
      if (typeof raw === 'string') {
        try { msg = JSON.parse(raw); } catch { return; }
      } else if (raw instanceof ArrayBuffer) {
        // Бинарный формат: [4 байта индекс][данные]
        const view = new DataView(raw);
        const index = view.getUint32(0);
        const bytes = new Uint8Array(raw, 4);
        return acceptChunk(index, bytes, 'p2p');
      }
      if (!msg || !msg.type) return;
      const entry = state.peers.get(remoteId);

      if (msg.type === 'request') {
        // Сосед просит чанк — отдаём, если он у нас есть.
        const index = Number(msg.index) || 0;
        if (state.chunks && state.chunks.get(index)) {
          const bytes = state.chunks.get(index);
          const buf = new Uint8Array(4 + bytes.length);
          new DataView(buf.buffer).setUint32(0, index);
          buf.set(bytes, 4);
          entry.channel.send(buf.buffer);
          entry.uploaded += bytes.length;
          state.stats.uploaded += bytes.length;
        }
      } else if (msg.type === 'have') {
        if (entry) entry.bitmap = P2P.bitmapFromString(msg.bitmap, state.manifest.chunkCount);
      }
    }

    // ------------------------------------------- приём и проверка чанков
    async function acceptChunk(index, bytes, source) {
      if (!state.manifest || !state.have) return false;
      if (state.have[index]) return false;
      // Проверяем контрольную сумму: битый/подменённый чанк не принимаем.
      const expected = state.chunkHashes && state.chunkHashes[index];
      if (expected) {
        const hex = await P2P.sha256Hex(bytes);
        if (hex !== expected) {
          log(`p2p: чанк ${index} не прошёл проверку sha256 — отброшен`);
          return false;
        }
      }
      state.chunks.set(index, bytes);
      state.have[index] = 1;
      state.stats.downloaded += bytes.length;
      if (source === 'p2p') state.stats.fromPeers += bytes.length;
      else state.stats.fromRelay += bytes.length;
      // Сообщаем соседям, что кусок теперь есть у нас (have), чтобы они
      // могли его у нас запросить — это и есть полноценный обмен.
      broadcastHave(index);
      if (typeof cfg.onProgress === 'function') {
        cfg.onProgress(P2P.progressOf(state.have), state.stats);
      }
      return true;
    }

    function broadcastHave(index) {
      let text = '';
      for (let i = 0; i < state.have.length; i += 1) text += state.have[i] ? '1' : '0';
      for (const [, entry] of state.peers) {
        try {
          if (entry.channel && entry.channel.readyState === 'open') {
            entry.channel.send(JSON.stringify({ type: 'have', index, bitmap: text }));
          }
        } catch { /* канал закрылся — не критично */ }
      }
    }

    // ------------------------------------------------ загрузка с сервера
    async function fetchChunkFromRelay(index) {
      const data = await call('fetchChunk', { gameId: state.manifest.gameId, chunkIndex: index });
      const chunk = data && data.chunk;
      if (!chunk) return false;
      const bytes = fromBase64(chunk.data);
      return acceptChunk(index, bytes, 'relay');
    }

    // ---------------------------------------- полный цикл скачивания
    async function download(manifest, hooks) {
      const h = hooks || {};
      state.manifest = manifest;
      state.have = new Uint8Array(manifest.chunkCount);
      state.chunks = new Map();
      // Хеши кусков: берём из .torrent (если пришёл) — иначе проверяем по файлам.
      state.chunkHashes = h.chunkHashes || (Array.isArray(manifest.pieces)
        ? manifest.pieces.map((p) => p.sha256)
        : null);
      state.transferring = true;
      state.stats = { uploaded: 0, downloaded: 0, fromPeers: 0, fromRelay: 0 };

      const meter = P2P.createMeter();
      let relayOnly = false;

      // 1. Встаём в раздачу и знакомимся с пирами (не блокируем старт).
      try {
        await connectToPeers();
      } catch (err) {
        log('трекер недоступен, качаю с сервера: ' + err.message);
        state.mode = 'relay';
        relayOnly = true;
      }

      // 2. Качаем чанки: сначала спрашиваем пиров, потом сервер.
      const order = P2P.planChunks(
        state.have,
        [...state.peers.values()].map((p) => p.bitmap),
        manifest.chunkCount,
      );

      for (const index of order) {
        if (state.have[index]) continue;
        let ok = false;

        // Попытка через живой канал пира.
        if (!relayOnly && state.peers.size) {
          for (const [remoteId, entry] of state.peers) {
            if (!entry.bitmap || !entry.bitmap[index]) continue;
            if (!entry.channel || entry.channel.readyState !== 'open') continue;
            try {
              entry.channel.send(JSON.stringify({ type: 'request', index }));
              ok = await waitForChunk(index, 4000);
              if (ok) {
                entry.downloaded += manifest.chunkSize;
                state.mode = 'p2p';
                break;
              }
            } catch (err) {
              log('p2p: ' + err.message);
            }
          }
        }

        // Резерв: тот же чанк с сервера-сида.
        if (!ok) {
          try {
            ok = await fetchChunkFromRelay(index);
            if (ok && state.mode !== 'p2p') state.mode = 'relay';
          } catch (err) {
            log(`сид: чанк ${index} недоступен (${err.message})`);
          }
        }

        if (!ok) {
          state.transferring = false;
          return { ok: false, missing: index, progress: P2P.progressOf(state.have) };
        }

        meter.add(manifest.chunkSize, Date.now());
        if (typeof h.onChunk === 'function') {
          h.onChunk(P2P.progressOf(state.have), {
            speed: meter.bytesPerSecond(),
            eta: meter.etaSeconds((manifest.chunkCount - P2P.countBits(state.have)) * manifest.chunkSize),
            stats: state.stats,
            mode: state.mode,
          });
        }
      }

      // 3. Стали сидом: теперь и мы отдаём эту игру другим.
      state.transferring = false;
      try {
        await announce();
      } catch { /* офлайн — не критично */ }

      const result = {
        ok: true,
        mode: state.mode,
        progress: P2P.progressOf(state.have),
        stats: state.stats,
        chunks: state.chunks,
      };
      if (typeof h.onDone === 'function') h.onDone(result);
      return result;
    }

    // Ожидание конкретного чанка от пира (короткий таймаут).
    function waitForChunk(index, timeoutMs) {
      return new Promise((resolve) => {
        const started = Date.now();
        const tick = () => {
          if (state.have[index]) return resolve(true);
          if (Date.now() - started > timeoutMs) return resolve(false);
          setTimeout(tick, 100);
        };
        tick();
      });
    }

    // ------------------------------------------------- опрос сигналов
    async function pollSignals() {
      if (!state.manifest) return;
      try {
        const data = await call('poll', { since: state.lastSignalId });
        for (const signal of (data && data.signals) || []) {
          state.lastSignalId = Math.max(state.lastSignalId, Number(signal.id) || 0);
          await handleSignal(signal);
        }
      } catch (err) {
        log('сигналинг: ' + err.message);
      }
    }

    async function handleSignal(signal) {
      const from = signal.from_peer;
      const payload = signal.payload || {};
      let entry = state.peers.get(from);

      if (signal.kind === 'offer') {
        const pc = new root.RTCPeerConnection(RTC_CONFIG);
        entry = entry || { uploaded: 0, downloaded: 0, role: 'peer' };
        entry.pc = pc;
        state.peers.set(from, entry);
        pc.ondatachannel = (ev) => {
          entry.channel = ev.channel;
          entry.channel.binaryType = 'arraybuffer';
          entry.channel.onmessage = (e) => handlePeerMessage(from, e.data);
          entry.channel.onopen = () => { state.mode = 'p2p'; };
        };
        pc.onicecandidate = (ev) => {
          if (ev.candidate) sendSignal(from, 'ice', { candidate: ev.candidate.toJSON ? ev.candidate.toJSON() : ev.candidate });
        };
        await pc.setRemoteDescription(payload.sdp);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        await sendSignal(from, 'answer', { sdp: pc.localDescription });
      } else if (signal.kind === 'answer' && entry && entry.pc) {
        await entry.pc.setRemoteDescription(payload.sdp);
      } else if (signal.kind === 'ice' && entry && entry.pc) {
        try { await entry.pc.addIceCandidate(payload.candidate); } catch { /* кандидат устарел */ }
      }
    }

    // ------------------------------------------------------ управление
    async function start() {
      if (state.polling) return;
      state.polling = setInterval(() => pollSignals(), POLL_MS);
      state.announcing = setInterval(() => {
        connectToPeers().catch(() => {});
      }, ANNOUNCE_MS);
      await connectToPeers().catch(() => {});
    }

    function stop() {
      clearInterval(state.polling);
      clearInterval(state.announcing);
      state.polling = null;
      state.announcing = null;
      for (const [, entry] of state.peers) {
        try { entry.channel && entry.channel.close(); } catch { /* уже закрыт */ }
        try { entry.pc && entry.pc.close(); } catch { /* уже закрыт */ }
      }
      state.peers.clear();
      state.mode = 'offline';
    }

    async function leave() {
      stop();
      try { await call('leave', {}); } catch { /* сервер недоступен */ }
    }

    // ----------------------------------------------------- публичный API
    return {
      peerId,
      endpoint,
      state,
      call,
      start,
      stop,
      leave,
      announce,
      download,
      fetchChunkFromRelay,
      pollSignals,
      connectToPeers,
      isSupported: () => typeof root.RTCPeerConnection === 'function',
      status: () => ({
        peerId,
        mode: state.mode,
        peers: state.peers.size,
        connected: state.connected,
        stats: { ...state.stats },
        transfer: state.transferring,
      }),
      // Сборка файлов из скачанных чанков — обратный путь к игре.
      assembleFiles(manifest) {
        const out = [];
        const encoder = new TextEncoder();
        let globalChunk = 0;
        for (const file of manifest.files) {
          const parts = [];
          let remaining = file.size;
          while (remaining > 0) {
            const chunk = state.chunks.get(globalChunk);
            if (!chunk) return { ok: false, missing: globalChunk };
            const need = Math.min(remaining, manifest.chunkSize);
            parts.push(chunk.subarray(0, need));
            remaining -= need;
            globalChunk += 1;
          }
          const total = parts.reduce((n, p) => n + p.length, 0);
          const merged = new Uint8Array(total);
          let offset = 0;
          for (const p of parts) { merged.set(p, offset); offset += p.length; }
          out.push({ path: file.path, bytes: merged, size: total });
          if (file.size === 0) { /* пустой файл — путь сохраняется */ }
          void encoder;
        }
        return { ok: true, files: out };
      },
    };
  }

  P2P.DEFAULT_ENDPOINT = DEFAULT_ENDPOINT;
  P2P.DEFAULT_API_KEY = DEFAULT_API_KEY;
  P2P.randomId = randomId;
  P2P.toBase64 = toBase64;
  P2P.fromBase64 = fromBase64;
  P2P.createClient = createClient;
})(typeof globalThis !== 'undefined' ? globalThis : this);
