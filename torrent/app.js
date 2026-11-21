/* ==========================================================================
   Games Torrent — логика вкладки P2P-раздачи (torrent/app.js)
   --------------------------------------------------------------------------
   Что делает:
   1. Читает каталог раздач site/torrent-catalog.json (манифесты с info_hash).
   2. Находит сервер: свой (localhost/LAN/ссылка ?p2p=) или работает без него.
   3. Поднимает P2P-клиент: трекер, сигналинг, обмен кусками по WebRTC.
   4. Качает игру кусками: сначала у живых пиров, затем у резервного сида.
      Каждый кусок проверяется по sha256 из .torrent — подмена не проходит.
   5. Собирает поток обратно в файлы, гоняет автоудаление плохих файлов.
   6. Если P2P не поднялся — качает те же файлы напрямую по HTTPS
      и всё равно прогоняет автоочистку. Режим виден в интерфейсе.
   7. Собирает чистый набор в один HTML-файл — игра открывается двойным щелчком.
   8. Даёт скачать .torrent и magnet-ссылку для любого торрент-клиента.
   ========================================================================== */
(function () {
  'use strict';

  const P2P = window.GamesP2P || {};
  const el = (id) => document.getElementById(id);
  const listEl = el('torrentList');
  const logEl = el('sanitizeLog');

  const state = {
    catalog: null,
    games: [],
    query: '',
    sort: 'size',
    quick: 'all',
    online: false,
    server: null, // { endpoint, source, online }
    netStats: null,
    running: new Map(), // gameId -> { percent, speed, eta, mode, done }
    held: new Set(), // игры, которые мы держим в раздаче
    hashes: new Map(), // gameId -> .torrent (куски + хеши)
    peerCache: new Map(), // gameId -> скачанные куски (чтобы раздавать дальше)
    client: null,
  };

  // ------------------------------------------------------------- утилиты
  function bytes(n) {
    return P2P.formatBytes ? P2P.formatBytes(n) : `${n} Б`;
  }

  function escapeHtml(text) {
    return String(text == null ? '' : text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function shortHash(hash) {
    const h = String(hash || '');
    return h ? `${h.slice(0, 10)}…${h.slice(-6)}` : '—';
  }

  function setText(id, value) {
    const node = el(id);
    if (node) node.textContent = value;
  }

  // ------------------------------------------------------------- журнал
  const LOG_LIMIT = 80;
  function pushLog(kind, text, detail) {
    if (!logEl) return;
    const li = document.createElement('li');
    li.className = kind === 'removed' ? 'log-removed' : kind === 'sanitized' ? 'log-sanitized' : kind === 'kept' ? 'log-kept' : '';
    li.innerHTML = `<code>${escapeHtml(detail || '')}</code><span>${escapeHtml(text)}</span>`;
    logEl.prepend(li);
    while (logEl.children.length > LOG_LIMIT) logEl.lastElementChild.remove();
  }

  // ------------------------------------------------------------ каталог
  async function loadCatalog() {
    const candidates = ['../site/torrent-catalog.json', 'site/torrent-catalog.json'];
    // Если есть свой сервер — каталог берём с него (он всегда свежий).
    if (state.server && state.server.online) candidates.unshift(`${state.server.endpoint.replace(/\/api\/p2p$/, '')}/torrent-catalog.json`);
    for (const url of candidates) {
      try {
        const res = await fetch(url, { cache: 'no-cache' });
        if (!res.ok) continue;
        const data = await res.json();
        if (!data || !Array.isArray(data.games)) continue;
        state.catalog = data;
        state.games = data.games;
        return true;
      } catch {
        /* пробуем следующий путь */
      }
    }
    return false;
  }

  // ------------------------------------------------------- .torrent/хеши
  async function loadTorrent(game) {
    if (state.hashes.has(game.gameId)) return state.hashes.get(game.gameId);
    // 1. Родной .torrent со своего сервера (с готовыми хешами кусков).
    if (state.server && state.server.online) {
      const base = state.server.endpoint.replace(/\/api\/p2p$/, '');
      try {
        const res = await fetch(`${base}/torrent/${game.gameId}.torrent`, { cache: 'no-store' });
        if (res.ok) {
          const torrent = await res.json();
          if (P2P.validateTorrent && P2P.validateTorrent(torrent).ok) {
            state.hashes.set(game.gameId, torrent);
            return torrent;
          }
        }
      } catch { /* остаёмся на локальном варианте */ }
    }
    // 2. Без сервера хешей нет — проверка пойдёт по sha256 самих файлов.
    return null;
  }

  function renderStats() {
    const games = state.games;
    const totalBytes = games.reduce((n, g) => n + (g.totalSize || 0), 0);
    const files = games.reduce((n, g) => n + (g.fileCount || 0), 0);
    const seeders = state.netStats ? (state.netStats.totals ? state.netStats.totals.seeders : netSeeders()) : 0;
    setText('statGames', String(games.length));
    const collectionCount = games.filter((g) => g.source === 'collection').length;
    if (el('statCollection')) {
      setText('statCollection', collectionCount ? `${collectionCount} из коллекции` : 'только витрина');
    }
    setText('statSize', bytes(totalBytes));
    setText('statFiles', String(files));
    setText('statSeeders', String(seeders));
    const stats = state.client ? state.client.status().stats : { uploaded: 0, downloaded: 0 };
    setText('statTraffic', `${bytes(stats.uploaded)} / ${bytes(stats.downloaded)}`);
  }

  function netSeeders() {
    return (state.netStats && Array.isArray(state.netStats.games))
      ? state.netStats.games.reduce((n, g) => n + (g.seeders || 0), 0)
      : 0;
  }

  function visibleGames() {
    const q = state.query.trim().toLowerCase();
    let list = state.games.slice();
    if (state.quick === 'heavy') list = list.filter((g) => (g.totalSize || 0) >= 5 * 1024 * 1024);
    if (state.quick === 'light') list = list.filter((g) => (g.totalSize || 0) < 5 * 1024 * 1024);
    if (q) {
      list = list.filter((g) => {
        const hay = `${g.title} ${g.subtitle} ${g.gameId} ${g.infoHash} ${bytes(g.totalSize)}`.toLowerCase();
        return hay.includes(q);
      });
    }
    const byPeers = (g) => {
      const stat = (state.netStats?.games || []).find((x) => x.gameId === g.gameId);
      return stat ? stat.peers : 0;
    };
    list.sort((a, b) => {
      if (state.sort === 'title') return String(a.title).localeCompare(String(b.title), 'ru');
      if (state.sort === 'size-asc') return a.totalSize - b.totalSize;
      if (state.sort === 'peers') return byPeers(b) - byPeers(a);
      return b.totalSize - a.totalSize;
    });
    return list;
  }

  function netStatOf(gameId) {
    return (state.netStats?.games || []).find((g) => g.gameId === gameId) || null;
  }

  function renderList() {
    if (!listEl) return;
    const games = visibleGames();
    if (!games.length) {
      listEl.innerHTML = '<div class="empty-state"><strong>Ничего не найдено</strong><span>Попробуйте другое название или очистите поиск.</span></div>';
      return;
    }

    listEl.innerHTML = games.map((g) => {
      const net = netStatOf(g.gameId);
      const run = state.running.get(g.gameId);
      const peers = net ? net.peers : 0;
      const seeds = net ? net.seeders : 0;
      const cover = g.cover ? `../${escapeHtml(String(g.cover).replace(/^\.\.\//, ''))}` : '';
      const health = seeds > 0
        ? `<span class="pill pill-good"><span class="dot on"></span> сид ${seeds}</span>`
        : peers > 0
          ? `<span class="pill pill-warn"><span class="dot warn"></span> пиры ${peers}</span>`
          : '<span class="pill"><span class="dot"></span> только сервер</span>';

      const progress = run
        ? `<div class="progress-wrap" data-progress="${escapeHtml(g.gameId)}">
             <div class="progress-bar"><div class="progress-fill ${run.done ? 'is-done' : ''}" style="width:${run.percent || 0}%"></div></div>
             <div class="progress-line">
               <span>${run.done ? '✅ готово' : `${run.percent || 0}% · ${bytes(run.doneBytes || 0)} из ${bytes(g.totalSize)}`}</span>
               <span>${run.done ? escapeHtml(run.mode || '') : `${bytes(run.speed || 0)}/с · осталось ${run.eta || '—'} · ${run.mode === 'p2p' ? 'пиры' : run.mode === 'relay' ? 'сервер' : 'HTTPS'}`}</span>
             </div>
           </div>`
        : '';

      const held = state.held.has(g.gameId);
      const magnet = g.infoHash ? `magnet:?xt=urn:btih:${g.infoHash}&dn=${encodeURIComponent(g.title || g.gameId)}` : '';

      return `<article class="torrent-card" data-game="${escapeHtml(g.gameId)}">
        ${cover ? `<img class="torrent-cover" src="${cover}" alt="" loading="lazy" onerror="this.style.visibility='hidden'">` : '<div class="torrent-cover"></div>'}
        <div class="torrent-info">
          <h3>${escapeHtml(g.title)} <small>${escapeHtml(g.version || '')}</small>
            ${g.source === 'collection' ? `<span class="src-tag" title="${escapeHtml(`${g.license || 'открытая'} · ${g.author || 'открытая коллекция'}`)}">🧩 коллекция${g.license ? ' · ' + escapeHtml(g.license) : ''}</span>` : ''}
          </h3>
          <div class="torrent-meta">
            <span><b>${bytes(g.totalSize)}</b></span>
            <span><b>${g.fileCount}</b> файлов</span>
            <span><b>${g.chunkCount}</b> частей</span>
            <span>${g.blockedCount ? `<b class="warn-text">${g.blockedCount}</b> плохих удалено` : '🛡️ файлы чистые'}</span>
          </div>
          <div class="torrent-hash" title="info_hash — отпечаток раздачи">info_hash ${shortHash(g.infoHash)}</div>
        </div>
        <div class="torrent-side">
          ${health}
          <div class="torrent-health">
            <button class="btn btn-sm btn-primary" type="button" data-download="${escapeHtml(g.gameId)}" ${run && !run.done ? 'disabled' : ''}>
              ${run && run.done ? '⬇ Скачать снова' : '⬇ Скачать'}
            </button>
            <button class="btn btn-sm ${held ? 'btn-danger' : ''}" type="button" data-hold="${escapeHtml(g.gameId)}" title="${held ? 'Перестать раздавать' : 'Держать игру в раздаче'}">
              ${held ? '■' : '📡'}
            </button>
            <a class="btn btn-sm" href="${escapeHtml(magnet)}" data-magnet="${escapeHtml(g.gameId)}" title="Скопировать magnet-ссылку">🧲</a>
            <button class="btn btn-sm" type="button" data-torrent="${escapeHtml(g.gameId)}" title="Скачать .torrent">.torrent</button>
          </div>
        </div>
        ${progress}
      </article>`;
    }).join('');
  }

  // ------------------------------------------------------ сеть: статус
  async function refreshNetwork() {
    // 1. Ищем сервер (свой / сохранённый / публичный).
    if (!state.server) {
      state.server = P2P.resolveServer ? await P2P.resolveServer({}) : { online: false, source: 'нет модуля', endpoint: '' };
      if (state.server.online) {
        pushLog('net', `Сервер найден: ${state.server.source}`);
      } else {
        pushLog('net', 'Свой сервер не найден — работаю напрямую через HTTPS-сид');
      }
    }

    if (!state.client) {
      state.client = P2P.createClient
        ? P2P.createClient({
          endpoint: state.server.online ? state.server.endpoint : undefined,
          onLog: (msg) => pushLog('net', msg),
          onProgress: (progress) => {
            const run = state.running.get(state.activeGameId);
            if (run) {
              run.percent = progress.percent;
              updateProgress(run);
            }
          },
        })
        : null;
    }

    if (!state.client || !state.server.online) {
      state.online = false;
      setText('netLabel', 'сеть: автономно');
      setText('netServer', 'нет — качаю напрямую');
      setText('netTransport', 'HTTPS-сид (GitHub Pages)');
      if (el('netDot')) el('netDot').className = 'dot off';
      setText('peerBadge', 'пиры: 0');
      setText('netPeer', '—');
      setText('netSource', state.server ? state.server.source : 'нет');
      renderStats();
      renderList();
      return;
    }

    try {
      const data = await state.client.call('stats', {});
      state.online = true;
      state.netStats = data;
      const totals = data.totals || { peers: data.peers || 0, seeders: netSeeders() };
      setText('netLabel', `сеть: онлайн · ${totals.seeders || 0} сидов`);
      if (el('netDot')) el('netDot').className = 'dot on';
      setText('peerBadge', `пиры: ${totals.peers || 0}`);
      setText('netServer', `${state.server.source} ✓`);
      setText('netTransport', state.client.isSupported() ? 'WebRTC P2P + сервер' : 'HTTPS-сид (WebRTC недоступен)');
      setText('netPeer', state.client.peerId.slice(0, 18));
      setText('netSource', state.server.source || '—');
      setText('netFromPeers', bytes(state.client.status().stats.fromPeers || 0));
      setText('netFromRelay', bytes(state.client.status().stats.fromRelay || 0));
      const chips = el('netGames');
      if (chips) {
        chips.innerHTML = (data.games || []).slice(0, 8)
          .map((g) => `<span class="chip">${escapeHtml(g.title || g.gameId)} <b>${g.peers}</b>/${g.seeders}</span>`)
          .join('');
      }
      renderStats();
      renderList();
    } catch (err) {
      state.online = false;
      setText('netLabel', 'сеть: сервер не отвечает');
      setText('netServer', 'нет ответа — качаю напрямую');
      setText('netTransport', 'HTTPS-сид (GitHub Pages)');
      if (el('netDot')) el('netDot').className = 'dot off';
      pushLog('net', 'Сервер перестал отвечать: ' + (err && err.message ? err.message : ''));
      renderStats();
    }
  }

  // ------------------------------------------------ скачивание кусками
  async function fetchPiece(game, index) {
    // 1. Через P2P-клиент (пиры → сервер).
    if (state.client && state.online) {
      try {
        const data = await state.client.call('fetchChunk', { gameId: game.gameId, chunkIndex: index });
        if (data && data.chunk && data.chunk.data && P2P.fromBase64) {
          return { bytes: P2P.fromBase64(data.chunk.data), source: 'relay', sha256: data.sha256 };
        }
      } catch { /* переключаемся на прямой HTTPS */ }
    }
    // 2. Прямой HTTPS с сервера (если он есть).
    if (state.server && state.server.online) {
      const base = state.server.endpoint.replace(/\/api\/p2p$/, '');
      const res = await fetch(`${base}/chunk/${game.gameId}/${index}`, { cache: 'no-store' });
      if (res.ok) {
        const buf = new Uint8Array(await res.arrayBuffer());
        return { bytes: buf, source: 'relay', sha256: res.headers.get('x-chunk-sha256') || '' };
      }
    }
    return null;
  }

  // Загрузка всего потока игры кусками с проверкой каждого куска.
  async function downloadPieces(game, run, torrent) {
    const chunkSize = game.chunkSize || (torrent && torrent.chunkSize) || 262144;
    const total = game.totalSize || 0;
    const count = game.chunkCount || (torrent ? torrent.pieceCount : Math.ceil(total / chunkSize));
    const pieces = new Map();
    const started = Date.now();

    for (let i = 0; i < count; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      const piece = await fetchPiece(game, i);
      if (!piece) throw new Error(`кусок ${i} недоступен`);
      // Проверка целостности: сверяем с хешем из .torrent.
      const expected = torrent && torrent.pieces && torrent.pieces[i] ? torrent.pieces[i].sha256 : '';
      if (expected && P2P.sha256Hex) {
        // eslint-disable-next-line no-await-in-loop
        const actual = await P2P.sha256Hex(piece.bytes);
        if (actual !== expected) throw new Error(`кусок ${i} не прошёл проверку sha256 — отброшен`);
      }
      pieces.set(i, piece.bytes);
      run.doneBytes = Math.min(total, (i + 1) * chunkSize);
      run.percent = Math.round(((i + 1) / Math.max(1, count)) * 1000) / 10;
      run.mode = piece.source;
      const elapsed = Math.max(0.001, (Date.now() - started) / 1000);
      run.speed = Math.round(run.doneBytes / elapsed);
      run.eta = P2P.formatEta ? P2P.formatEta((total - run.doneBytes) / Math.max(1, run.speed)) : '—';
      updateProgress(run);
    }
    return pieces;
  }

  // Сборка потока обратно в файлы по раскладке манифеста.
  function assembleFiles(game, pieces) {
    if (P2P.assembleFromPieces) {
      const out = P2P.assembleFromPieces(game, (i) => pieces.get(i));
      if (!out.ok) throw new Error(`после загрузки не хватает куска ${out.missing}`);
      return out.files;
    }
    // Резерв: «наивная» склейка (если модуль торрент-файла не подключён).
    const all = [...pieces.entries()].sort((a, b) => a[0] - b[0]).map(([, v]) => v);
    const total = all.reduce((n, p) => n + p.length, 0);
    const stream = new Uint8Array(total);
    let offset = 0;
    for (const part of all) { stream.set(part, offset); offset += part.length; }
    let cursor = 0;
    return (game.files || []).map((file) => {
      const bytes = stream.subarray(cursor, cursor + file.size);
      cursor += file.size;
      return { path: file.path, bytes, size: bytes.length, sha256: file.sha256 };
    });
  }

  // ------------------------------------ резервный путь: прямые файлы
  async function downloadDirect(game, run) {
    if (!P2P.fetchAndSanitize) return null;
    return P2P.fetchAndSanitize(game, {
      onProgress(done, total) {
        run.percent = Math.round((done / Math.max(1, total)) * 1000) / 10;
        run.doneBytes = Math.round((done / Math.max(1, total)) * (game.totalSize || 0));
        run.mode = 'https';
        updateProgress(run);
      },
    });
  }

  // ------------------------------------------------------- скачивание
  async function downloadGame(gameId) {
    const game = state.games.find((g) => g.gameId === gameId);
    if (!game) return;

    const run = { percent: 0, speed: 0, eta: '—', mode: 'relay', done: false, doneBytes: 0 };
    state.running.set(gameId, run);
    state.activeGameId = gameId;
    renderList();
    document.querySelectorAll('#sanitizeLog').forEach((node) => { node.innerHTML = ''; });
    pushLog('net', `Начинаю загрузку «${game.title}» — ${bytes(game.totalSize)}, ${game.fileCount} файлов`, game.gameId);

    try {
      const torrent = await loadTorrent(game);
      let files = null;
      let mode = 'p2p';

      // 1. Куски + проверка + сборка (настоящий торрент-путь).
      if (state.online && (state.server?.online)) {
        if (torrent) {
          pushLog('net', `info_hash ${String(torrent.infoHash).slice(0, 16)}… · кусков ${torrent.pieceCount} · проверка sha256`, game.gameId);
          const pieces = await downloadPieces(game, run, torrent);
          files = assembleFiles(game, pieces);
          state.peerCache.set(gameId, pieces);
          mode = run.mode === 'relay' ? 'сервер' : 'пиры';
        }
      }

      // 2. Если кусков нет — прямые файлы с HTTPS-сида.
      let result = null;
      if (!files) {
        result = await downloadDirect(game, run);
        if (!result) throw new Error('нет ни сервера, ни прямых файлов');
        files = result.files.map((f) => ({ path: f.path, bytes: f.bytes, size: f.size, sha256: f.sha256 }));
        mode = 'HTTPS';
      }

      // 3. Автоудаление плохих файлов — по КАЖДОМУ файлу, до сборки.
      const removed = [];
      const sanitized = [];
      const clean = [];
      for (const file of files) {
        const isText = /\.(js|mjs|cjs|json|html?|css|svg|txt|md|xml|csv|glsl|wgsl)$/i.test(file.path);
        const text = isText ? new TextDecoder().decode(file.bytes) : null;
        const verdict = P2P.judgeFile ? P2P.judgeFile({ path: file.path, size: file.size, text }) : { action: 'allow' };
        if (verdict.action === 'block') {
          removed.push({ path: file.path, rule: verdict.rule, kind: verdict.kind, reasons: verdict.reasons, size: file.size, sha256: file.sha256 });
          continue;
        }
        if (verdict.action === 'strip') {
          const cleaned = new TextEncoder().encode(verdict.cleaned);
          sanitized.push({ path: file.path, rule: verdict.rule, sha256: file.sha256, size: cleaned.length });
          clean.push({ path: file.path, bytes: cleaned, size: cleaned.length, sha256: file.sha256 });
          continue;
        }
        clean.push(file);
      }

      const playable = P2P.assertPlayable ? P2P.assertPlayable(clean.map((f) => ({ path: f.path }))) : { ok: true };
      if (!playable.ok) throw new Error(playable.reason);

      // 4. Журнал автоочистки.
      removed.forEach((r) => pushLog('removed', `Удалён: ${r.rule}`, r.path));
      sanitized.forEach((r) => pushLog('sanitized', `Почищен: ${r.rule}`, r.path));
      pushLog('kept', `Оставлено игровых файлов: ${clean.length} из ${files.length}`, game.gameId);
      const badge = el('sanitizeBadge');
      if (badge) {
        badge.textContent = removed.length ? `${removed.length} удалено` : 'чисто';
        badge.className = `pill ${removed.length ? 'pill-warn' : 'pill-good'}`;
      }
      setText('sanitizeSummary',
        `Проверено ${files.length} файлов · оставлено ${clean.length} · ` +
        `удалено ${removed.length} · починено ${sanitized.length}. ` +
        'Игровые файлы (index.html, скрипты, ассеты, сохранения) не удаляются никогда.');

      // 5. Собираем один HTML-файл игры.
      const pack = P2P.packAsStandalone ? P2P.packAsStandalone({ files: clean }) : null;

      // 5b. Скачанная игра переходит в библиотеку Games.
      // Правило владельца: коллекция живёт в торренте, а в библиотеке
      // появляется ТОЛЬКО то, что игрок реально скачал. Импорт идёт тем же
      // путём, что и кнопка «Добавить свою игру»: html-пакет + 10 проходов
      // антивируса — поэтому в библиотеке не может оказаться непроверенное.
      let libraryNote = '';
      if (pack && pack.ok) {
        const saved = saveToLibrary(game, pack.html);
        libraryNote = saved.ok
          ? ' · 🎮 добавлено в библиотеку Games'
          : ` · в библиотеку не добавлено: ${saved.error}`;
        pushLog(saved.ok ? 'kept' : 'removed',
          saved.ok ? `Игра перешла в библиотеку Games: ${saved.game.title}` : `Импорт в библиотеку: ${saved.error}`,
          game.gameId);
      }

      // 5c. Отдаём игру файлом — она открывается двойным щелчком.
      if (pack && pack.ok) {
        const blob = new Blob([pack.html], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${game.gameId}-${game.version || 'v1'}.html`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 30000);
        pushLog('kept', `Готово: ${link.download} (${bytes(pack.bytes)}), режим: ${mode}${libraryNote}`, game.gameId);
      } else {
        // Не удалось собрать одиночный файл — отдаём .torrent, чтобы игра качалась клиентом.
        pushLog('sanitized', 'Одиночный файл не собрался: игра доступна через .torrent', game.gameId);
      }

      // 6. Раздаём скачанное дальше и сообщаем серверу, что удалили.
      if (state.client && state.online) {
        state.client.announce().catch(() => {});
        const rows = [...removed, ...sanitized].map((r) => ({
          path: r.path, rule: r.rule, severity: r.kind === 'sanitized' ? 'clean' : 'block', sha256: r.sha256,
        }));
        if (rows.length) state.client.call('reject', { gameId: game.gameId, files: rows }).catch(() => {});
      }

      run.done = true;
      run.percent = 100;
      run.mode = mode;
      state.held.add(game.gameId);
      renderStats();
      renderList();
    } catch (err) {
      pushLog('removed', 'Ошибка загрузки: ' + (err && err.message ? err.message : String(err)), gameId);
      run.done = true;
      renderList();
    }
  }

  // ------------------------------------------------- импорт в библиотеку
  // Скачал игру — она появляется в витрине Games («Мои добавленные игры»).
  // Коллекция сама по себе в библиотеку НЕ попадает: только скачанное.
  //
  // Хранилище витрины — localStorage (~5 МБ), а игра весит до 700 КБ, поэтому:
  //   • при нехватке места убираем САМУЮ СТАРУЮ импортированную игру (не чужую:
  //     трогаем только записи с пометкой fromTorrent);
  //   • если места всё равно нет — честно говорим об этом в журнале.
  function saveToLibrary(game, html) {
    const hub = window.GamesUserHub;
    if (!hub || typeof hub.upsert !== 'function') {
      return { ok: false, error: 'витрина Games не подключена на этой странице' };
    }
    if (!html || html.length < 200) return { ok: false, error: 'пустой пакет игры' };
    if (html.length > 740000) {
      return { ok: false, error: 'игра больше лимита библиотеки (740 КБ) — открывайте файлом' };
    }

    const record = {
      id: `usr-torrent-${game.gameId}`.slice(0, 52),
      slug: game.gameId.slice(0, 48),
      sourceType: 'html',
      htmlCode: html,
      title: game.title || game.gameId,
      subtitle: game.subtitle || 'Скачано из торрента Games',
      description: `Скачано из P2P-раздачи «Торрент» · ${game.fileCount || 0} файлов · ` +
        `${bytes(game.totalSize || 0)} · каждый кусок сверен по SHA-256.` +
        (game.license ? ` Лицензия: ${game.license}.` : ''),
      author: game.author || 'Открытая коллекция Games',
      version: (game.version || 'v1').toString(),
      category: '2d',
      icon: '🧲',
      features: ['Скачано из торрента', 'Проверено по SHA-256', 'Работает офлайн'],
    };

    let result = hub.upsert(record);
    if (result.ok) return result;

    // Место кончилось? Освобождаем предыдущие импорты (сначала самый старый).
    if (/места|quota|storage|переполн/i.test(String(result.error || ''))) {
      const mine = hub.getAll().filter((g) => String(g.id).startsWith('usr-torrent-'));
      for (const old of mine) {
        hub.remove(old.id);
        pushLog('sanitized', `Освободил место в библиотеке: убрал «${old.title}»`, old.id);
        result = hub.upsert(record);
        if (result.ok) break;
      }
    }
    return result;
  }

  function updateProgress(run) {
    const wrap = listEl && listEl.querySelector('.progress-wrap');
    if (!wrap) return;
    const fill = wrap.querySelector('.progress-fill');
    if (fill) {
      fill.style.width = `${run.percent || 0}%`;
      fill.classList.toggle('is-done', Boolean(run.done));
    }
    const line = wrap.querySelector('.progress-line');
    if (line) {
      const first = line.firstElementChild;
      const last = line.lastElementChild;
      if (first) first.textContent = run.done ? '✅ готово' : `${run.percent || 0}%`;
      if (last) last.textContent = `${bytes(run.speed || 0)}/с · ${run.mode || ''}`;
    }
  }

  // ------------------------------------------------ держим игру в раздаче
  async function toggleHold(gameId) {
    const game = state.games.find((g) => g.gameId === gameId);
    if (!state.held.has(gameId)) {
      state.held.add(gameId);
      if (state.client && state.online && game) {
        const torrent = await loadTorrent(game);
        const count = torrent ? torrent.pieceCount : game.chunkCount;
        const bitmap = '1'.repeat(count || 0); // мы держим полную копию на сервере/в кеше
        state.client.announce({ role: 'seeder', haveBitmap: bitmap }).catch(() => {});
        pushLog('kept', 'Встал на раздачу (сид)', gameId);
      } else {
        pushLog('kept', 'Раздача отмечена локально: сервер недоступен', gameId);
      }
    } else {
      state.held.delete(gameId);
      pushLog('net', 'Снят с раздачи', gameId);
    }
    renderList();
  }

  // --------------------------------------------------.torrent и magnet
  function downloadTorrentFile(gameId) {
    const game = state.games.find((g) => g.gameId === gameId);
    if (!game) return;
    const payload = {
      schema: 'games-torrent-ref/1',
      gameId: game.gameId,
      title: game.title,
      version: game.version,
      infoHash: game.infoHash,
      totalSize: game.totalSize,
      chunkSize: game.chunkSize,
      pieceCount: game.chunkCount,
      files: game.files,
      announce: state.server && state.server.online ? [state.server.endpoint] : [],
      note: 'Полный .torrent с хешами кусков отдаёт сервер: /torrent/<gameId>.torrent',
    };
    const blob = new Blob([`${JSON.stringify(payload, null, 2)}\n`], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${game.gameId}.torrent`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
    pushLog('net', 'Скачан каркас .torrent (полный — с сервера)', gameId);
  }

  async function copyMagnet(gameId) {
    const game = state.games.find((g) => g.gameId === gameId);
    if (!game) return;
    let magnet = `magnet:?xt=urn:btih:${game.infoHash}&dn=${encodeURIComponent(game.title || game.gameId)}`;
    if (state.server && state.server.online) {
      try {
        const base = state.server.endpoint.replace(/\/api\/p2p$/, '');
        const res = await fetch(`${base}/magnet/${game.gameId}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.magnet) magnet = data.magnet;
        }
      } catch { /* хватит и локальной ссылки */ }
    }
    try {
      await navigator.clipboard.writeText(magnet);
      pushLog('net', 'magnet-ссылка скопирована', gameId);
    } catch {
      pushLog('net', magnet, gameId);
    }
  }

  // -------------------------------------------------------------- события
  function bind() {
    el('searchInput')?.addEventListener('input', (e) => {
      state.query = e.target.value || '';
      renderList();
    });
    el('sortSelect')?.addEventListener('change', (e) => {
      state.sort = e.target.value;
      renderList();
    });
    el('btnRefresh')?.addEventListener('click', async () => {
      pushLog('net', 'Обновляю каталог и сеть…');
      state.server = null;
      await refreshNetwork();
      await loadCatalog();
      renderStats();
      renderList();
    });
    el('btnSeedAll')?.addEventListener('click', async () => {
      for (const g of state.games) {
        if (!state.held.has(g.gameId)) await toggleHold(g.gameId);
      }
    });
    el('btnSetServer')?.addEventListener('click', async () => {
      const input = el('serverInput');
      const value = input ? input.value.trim() : '';
      if (!P2P.saveEndpoint || !P2P.normalizeEndpoint) return;
      const url = P2P.saveEndpoint(value);
      if (!url) {
        pushLog('net', 'Адрес сервера не распознан. Пример: http://192.168.1.10:8787');
        return;
      }
      state.server = null;
      pushLog('net', `Адрес сервера сохранён: ${url}`);
      await refreshNetwork();
    });
    el('btnForgetServer')?.addEventListener('click', async () => {
      if (P2P.forgetEndpoint) P2P.forgetEndpoint();
      state.server = null;
      pushLog('net', 'Адрес сервера забыт — ищу заново');
      await refreshNetwork();
    });

    document.querySelectorAll('[data-torrent-quick]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.quick = btn.getAttribute('data-torrent-quick') || 'all';
        document.querySelectorAll('[data-torrent-quick]').forEach((b) => {
          b.classList.toggle('is-active', b === btn);
        });
        renderList();
      });
    });

    listEl?.addEventListener('click', (e) => {
      const dl = e.target.closest('[data-download]');
      if (dl) {
        downloadGame(dl.getAttribute('data-download'));
        return;
      }
      const hold = e.target.closest('[data-hold]');
      if (hold) { toggleHold(hold.getAttribute('data-hold')); return; }
      const tor = e.target.closest('[data-torrent]');
      if (tor) { downloadTorrentFile(tor.getAttribute('data-torrent')); return; }
      const mag = e.target.closest('[data-magnet]');
      if (mag) {
        e.preventDefault();
        copyMagnet(mag.getAttribute('data-magnet'));
      }
    });

    // Сообщения от витрины: поиск из шапки портала.
    window.addEventListener('message', (event) => {
      const data = event.data || {};
      if (data.type === 'torrent:search' && typeof data.query === 'string') {
        state.query = data.query;
        if (el('searchInput')) el('searchInput').value = data.query;
        renderList();
      }
    });
  }

  // ---------------------------------------------------------------- старт
  async function start() {
    bind();
    await refreshNetwork();
    const ok = await loadCatalog();
    if (!ok) {
      const box = el('catalogState');
      if (box) box.hidden = false;
      pushLog('removed', 'Каталог site/torrent-catalog.json не найден. Запустите node tools/torrent/build-catalog.mjs');
    } else if (state.catalog) {
      pushLog('kept', `Каталог раздач: ${state.games.length} игр, ${state.catalog.stats.files} файлов, ${bytes(state.catalog.stats.totalBytes)}`);
    }
    renderStats();
    renderList();

    // P2P-клиент поднимаем только при живом сервере.
    if (state.client && state.online) {
      try {
        await state.client.start();
        pushLog('net', 'P2P-клиент запущен: ' + state.client.peerId.slice(0, 16));
      } catch (err) {
        pushLog('net', 'P2P не поднялся, остаётся HTTPS-сид: ' + err.message);
      }
    } else {
      pushLog('net', 'Работаю без сервера: прямые файлы + автоочистка');
    }

    // Периодически обновляем статистику сети и держим раздачи живыми.
    setInterval(() => {
      refreshNetwork().catch(() => {});
      if (state.client && state.online && state.held.size) state.client.announce().catch(() => {});
    }, 15000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

  window.GamesTorrent = { state, downloadGame, toggleHold, refreshNetwork, downloadTorrentFile, copyMagnet };
})();
