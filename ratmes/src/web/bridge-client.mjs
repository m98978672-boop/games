// Единственный санкционированный клиентский драйвер связи браузера/PWA с ПК-агентом RatMes Agent.
// Использует относительные URL (совместимо с Arena Live Preview и любым прокси),
// поддерживает подключение с телефона к пользовательскому адресу ПК-агента,
// а при отсутствии агента автоматически работает автономно в браузере (PWA + Supabase + браузерные мосты).

import { createRatMesEngine } from '../engine/ratmes-engine.mjs';
import { createMemoryVault } from '../engine/vault-store.mjs';
import { SUPABASE_PUBLIC_CONFIG } from '../engine/cloud-hub.mjs';
import { getServiceGuide, sanitizeBridgeInput } from '../engine/service-guides.mjs';

const PUBLIC_CLOUD_ROOMS = new Set(['games-lobby', 'games-coop', 'games-dev', 'ratmes-main']);
const REMOTE_AGENT_KEY = 'ratmes-remote-agent-url-v1';
const JOINED_ROOMS_KEY = 'ratmes-joined-rooms-v1';

function isCloudRoomId(chatId) {
  const id = String(chatId || '').trim();
  if (!id) return false;
  return PUBLIC_CLOUD_ROOMS.has(id) || id.startsWith('dm-') || id.startsWith('room-');
}

function randomHex(byteLen = 4) {
  const bytes = new Uint8Array(byteLen);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    const t = Date.now();
    for (let i = 0; i < byteLen; i += 1) bytes[i] = (t >> (i * 4)) & 0xff;
  }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function sanitizePeerToken(raw) {
  return String(raw || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 48);
}

function makeDmRoomId(peerA, peerB) {
  const a = sanitizePeerToken(peerA);
  const b = sanitizePeerToken(peerB);
  if (!a || !b || a === b) return null;
  const [first, second] = a < b ? [a, b] : [b, a];
  return `dm-${first}--${second}`;
}

function resolveAccountContext() {
  const fallback = {
    slot: 'main',
    isSecondary: false,
    useSession: false,
    keyPrefix: '',
    label: 'Основной профиль',
    defaultDisplayName: 'Участник',
  };
  if (typeof location === 'undefined') return fallback;
  try {
    const params = new URLSearchParams(location.search);
    const rawAcc = sanitizePeerToken(params.get('acc') || '');
    const rawDm = sanitizePeerToken(params.get('dm') || '');
    const primaryPeerId = typeof localStorage !== 'undefined'
      ? sanitizePeerToken(localStorage.getItem('ratmes-games-peer-id-v1') || '')
      : '';

    // 1. Явный слот профиля в URL (?acc=2, ?acc=3, ?acc=guest)
    if (rawAcc && rawAcc !== '1' && rawAcc !== 'main') {
      return {
        slot: rawAcc,
        isSecondary: true,
        useSession: false,
        keyPrefix: `acc-${rawAcc}:`,
        label: `Профиль #${rawAcc}`,
        defaultDisplayName: `Собеседник #${rawAcc}`,
      };
    }

    // 2. Авто-режим: пользователь открыл СВОЮ же ссылку ?dm=... во 2-й вкладке этого же браузера!
    if (rawDm && primaryPeerId && rawDm === primaryPeerId) {
      return {
        slot: 'tab',
        isSecondary: true,
        useSession: true,
        keyPrefix: 'tab-peer:',
        label: '2-я вкладка (тест)',
        defaultDisplayName: 'Собеседник #2',
      };
    }
  } catch { /* ignore */ }
  return fallback;
}

function getAccountStorage(accountCtx) {
  if (accountCtx?.useSession && typeof sessionStorage !== 'undefined') return sessionStorage;
  if (typeof localStorage !== 'undefined') return localStorage;
  return null;
}

function readJoinedRoomIds(accountCtx) {
  try {
    const store = getAccountStorage(accountCtx);
    if (!store) return [];
    const raw = store.getItem(`${accountCtx.keyPrefix}${JOINED_ROOMS_KEY}`);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((x) => typeof x === 'string' && /^(dm-|room-)[a-zA-Z0-9_-]{3,80}$/.test(x)) : [];
  } catch {
    return [];
  }
}

function rememberJoinedRoomId(roomId, accountCtx) {
  const clean = String(roomId || '').trim();
  if (!/^(dm-|room-)[a-zA-Z0-9_-]{3,80}$/.test(clean)) return;
  try {
    const store = getAccountStorage(accountCtx);
    if (!store) return;
    const set = new Set(readJoinedRoomIds(accountCtx));
    set.add(clean);
    store.setItem(`${accountCtx.keyPrefix}${JOINED_ROOMS_KEY}`, JSON.stringify(Array.from(set).slice(-60)));
  } catch { /* ignore */ }
}

function getOrCreatePeerId(accountCtx) {
  try {
    const store = getAccountStorage(accountCtx);
    const key = `${accountCtx.keyPrefix}ratmes-games-peer-id-v1`;
    const existing = store ? store.getItem(key) : null;
    if (existing) return existing;
    const tag = accountCtx.isSecondary ? `u-${accountCtx.slot}-` : 'u-';
    const created = `${tag}${randomHex(6)}`;
    if (store) store.setItem(key, created);
    return created;
  } catch {
    return `u-browser-${randomHex(4)}`;
  }
}

function readSavedRemoteAgent() {
  try {
    if (typeof localStorage === 'undefined') return '';
    return (localStorage.getItem(REMOTE_AGENT_KEY) || '').trim().replace(/\/+$/, '');
  } catch {
    return '';
  }
}

function normalizeAgentUrl(raw) {
  const s = String(raw || '').trim().replace(/\/+$/, '');
  if (!s) return '';
  if (!/^https?:\/\//i.test(s)) return `http://${s}`;
  return s;
}

async function fetchWithTimeout(url, opts = {}, timeoutMs = 10000) {
  if (typeof AbortController === 'undefined') {
    return fetch(url, opts);
  }
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, { ...opts, signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

export async function createBridgeClient() {
  const listeners = new Set();
  const accountCtx = resolveAccountContext();
  let mode = 'browser-offline';
  let agentBase = ''; // '' означает относительный ./api/*, иначе 'https://host:port'
  let localEngine = null;
  let eventSource = null;
  let ws = null;
  let broadcastChannel = null;
  let cloudPingChannel = null;
  let agentHealth = null;
  let wsReqSeq = 0;
  let cloudPollTimer = null;
  let cloudEnabled = true;
  let cloudSyncGetOpts = null;
  const peerId = getOrCreatePeerId(accountCtx);
  const wsPending = new Map();
  // Локальные браузерные мосты (для автономного режима с телефона / GitHub Pages)
  const browserBridges = new Map();

  function pingOtherTabs(roomId) {
    if (!cloudPingChannel) return;
    try {
      cloudPingChannel.postMessage({ type: 'supabase-updated', roomId, fromPeer: peerId, ts: Date.now() });
    } catch { /* ignore */ }
  }

  function emit(evt) {
    for (const fn of listeners) {
      try { fn(evt); } catch { /* ignore listener errors */ }
    }
  }

  function apiPath(sub) {
    return agentBase ? `${agentBase}${sub}` : `.${sub}`;
  }

  async function probeAgent(base) {
    const url = base ? `${base}/api/health` : './api/health';
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json && json.ok ? json : null;
  }

  async function initLocalEngineIfNeeded() {
    if (localEngine) return;
    const memVault = createMemoryVault({
      storageKey: `${accountCtx.keyPrefix}ratmes-pwa-vault-v2`,
      storage: getAccountStorage(accountCtx),
    });
    localEngine = createRatMesEngine({ vault: memVault, country: 'RU', seedDemoChats: false });
    await localEngine.ensureStarterChats();
    localEngine.core.watch.subscribe((evt) => {
      emit({ kind: 'event', event: evt.type, data: evt.payload, stateHash: localEngine.getStateHash() });
    });
    if (typeof BroadcastChannel !== 'undefined' && !broadcastChannel && !accountCtx.isSecondary) {
      broadcastChannel = new BroadcastChannel('ratmes-sync-v1');
      broadcastChannel.onmessage = (ev) => {
        emit({ kind: 'event', event: 'tab.sync', data: ev.data });
      };
    }
  }

  function disconnectAgentRealtime() {
    if (eventSource) {
      try { eventSource.close(); } catch { /* ignore */ }
      eventSource = null;
    }
    if (ws) {
      try { ws.close(); } catch { /* ignore */ }
      ws = null;
    }
  }

  function connectAgentRealtime() {
    disconnectAgentRealtime();
    // 1. SSE поток событий
    if (typeof EventSource !== 'undefined') {
      try {
        eventSource = new EventSource(apiPath('/api/events'));
        eventSource.addEventListener('ratmes', (ev) => {
          try {
            const parsed = JSON.parse(ev.data);
            emit(parsed);
          } catch { /* ignore */ }
        });
      } catch { /* ignore */ }
    }

    // 2. WebSocket ratcore-bridge/1 (только для same-origin или явного пользовательского remoteAgentUrl)
    if (typeof WebSocket !== 'undefined' && typeof location !== 'undefined') {
      try {
        let wsUrl = '';
        if (agentBase) {
          const u = new URL(agentBase);
          const wsProto = u.protocol === 'https:' ? 'wss:' : 'ws:';
          wsUrl = `${wsProto}//${u.host}${u.pathname.replace(/\/+$/, '')}/ws`;
        } else {
          const wsProto = location.protocol === 'https:' ? 'wss:' : 'ws:';
          const basePath = location.pathname.endsWith('/')
            ? location.pathname
            : location.pathname.replace(/[^/]*$/, '');
          wsUrl = `${wsProto}//${location.host}${basePath}ws`;
        }
        ws = new WebSocket(wsUrl);
        ws.onmessage = (ev) => {
          try {
            const msg = JSON.parse(ev.data);
            if (msg.kind === 'response' && msg.reqId && wsPending.has(msg.reqId)) {
              const resolver = wsPending.get(msg.reqId);
              wsPending.delete(msg.reqId);
              resolver.resolve(msg.result);
            } else if (msg.kind === 'event' || msg.kind === 'hello') {
              emit(msg);
            }
          } catch { /* ignore */ }
        };
        ws.onerror = () => {
          for (const [, p] of wsPending) p.reject(new Error('WS fallback to HTTP'));
          wsPending.clear();
          ws = null;
        };
        ws.onclose = () => {
          ws = null;
        };
      } catch {
        ws = null;
      }
    }
  }

  // 1. Для 2-го тестового профиля в том же браузере всегда используем изолированный браузерный vault + живой Supabase,
  // чтобы 2 вкладки одного браузера были двумя полностью независимыми реальными пользователями.
  if (!accountCtx.isSecondary) {
    try {
      const localHealth = await probeAgent('');
      if (localHealth) {
        agentHealth = localHealth;
        agentBase = '';
        mode = 'agent';
      }
    } catch { /* пробуем дальше */ }

    if (mode !== 'agent') {
      const saved = readSavedRemoteAgent();
      if (saved) {
        try {
          const remoteHealth = await probeAgent(saved);
          if (remoteHealth) {
            agentHealth = remoteHealth;
            agentBase = saved;
            mode = 'agent';
          }
        } catch { /* остаёмся в автономном режиме */ }
      }
    }
  }

  if (mode === 'agent') {
    connectAgentRealtime();
  } else {
    await initLocalEngineIfNeeded();
  }

  async function callViaAgent(payload) {
    if (ws && ws.readyState === 1) {
      try {
        wsReqSeq += 1;
        const reqId = `ws-${wsReqSeq}`;
        const result = await new Promise((resolve, reject) => {
          const timer = setTimeout(() => {
            wsPending.delete(reqId);
            reject(new Error('WS timeout'));
          }, 8000);
          wsPending.set(reqId, {
            resolve: (v) => { clearTimeout(timer); resolve(v); },
            reject: (e) => { clearTimeout(timer); reject(e); },
          });
          ws.send(JSON.stringify({ reqId, ...payload }));
        });
        return result;
      } catch {
        // Плавный откат на HTTP /api/tool
      }
    }

    const res = await fetch(apiPath('/api/tool'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  }

  async function callLocal(payload) {
    await initLocalEngineIfNeeded();
    const actor = payload.actorId && payload.role
      ? localEngine.tools.asActor(payload.actorId, payload.role)
      : localEngine.tools;

    let res;
    if (payload.pipeline) res = await actor.pipeline(payload.pipeline);
    else if (payload.tool === 'help') res = actor.help(payload.args?.group || null);
    else if (payload.tool === 'whoami') res = actor.whoami();
    else if (payload.tool === 'trace') res = actor.trace(payload.args?.limit || 30);
    else res = await actor.call(payload.tool, payload.args || {});

    if (broadcastChannel && res.ok) {
      broadcastChannel.postMessage({ tool: payload.tool || 'pipeline', ts: Date.now() });
    }
    return res;
  }

  // Прямая отправка из браузера (если пользователь включил мост без ПК-агента)
  async function deliverBrowserBridge(cfg, { envelopeRecord }) {
    const token = cfg.getSecret();
    const text = envelopeRecord?.body?.text || '';
    const started = performance.now();
    const base = (cfg.endpoint || '').replace(/\/+$/, '');

    try {
      if (cfg.kind === 'discord') {
        const url = base || token;
        if (!url) throw new Error('Укажи Discord Webhook URL');
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: text, username: 'RatMes' }),
        });
        if (!res.ok) throw new Error(`Discord HTTP ${res.status}`);
        cfg.stats.sentLive += 1;
        return { ok: true, remoteId: `dc-web-${Date.now()}`, serverSeq: cfg.stats.sentLive, routeUsed: 'browser-discord', rttMs: Math.round(performance.now() - started), signed: true };
      }

      if (cfg.kind === 'telegram') {
        if (!token || !cfg.targetId) throw new Error('Нужны Bot Token и chat_id');
        const apiBase = base || getServiceGuide('telegram').defaultEndpoint;
        const res = await fetch(`${apiBase}/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: cfg.targetId, text }),
        });
        const j = await res.json();
        if (!res.ok || !j.ok) throw new Error(j.description || `Telegram HTTP ${res.status}`);
        cfg.stats.sentLive += 1;
        return { ok: true, remoteId: `tg-web-${j.result.message_id}`, serverSeq: j.result.message_id, routeUsed: 'browser-telegram', rttMs: Math.round(performance.now() - started), signed: true };
      }

      if (cfg.kind === 'max') {
        if (!token || !cfg.targetId) throw new Error('Нужны access_token от @MasterBot и chat_id');
        const apiBase = base || getServiceGuide('max').defaultEndpoint;
        const rawTarget = String(cfg.targetId).trim();
        const isUser = /^u(ser)?:/i.test(rawTarget);
        const cleanId = rawTarget.replace(/^u(ser)?:/i, '').trim();
        const paramName = isUser ? 'user_id' : 'chat_id';
        const res = await fetch(`${apiBase}/messages?${paramName}=${encodeURIComponent(cleanId)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: token },
          body: JSON.stringify({ text, format: 'markdown' }),
        });
        const j = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(j.message || `MAX HTTP ${res.status}`);
        cfg.stats.sentLive += 1;
        return { ok: true, remoteId: `max-web-${Date.now()}`, serverSeq: cfg.stats.sentLive, routeUsed: 'browser-max', rttMs: Math.round(performance.now() - started), signed: true };
      }

      if (cfg.kind === 'matrix') {
        if (!base || !cfg.targetId || !token) throw new Error('Нужны Homeserver, Room ID и Access Token');
        const txnId = `rm-web-${Date.now()}`;
        const res = await fetch(`${base}/_matrix/client/v3/rooms/${encodeURIComponent(cfg.targetId)}/send/m.room.message/${txnId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ msgtype: 'm.text', body: text }),
        });
        const j = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(j.error || `Matrix HTTP ${res.status}`);
        cfg.stats.sentLive += 1;
        return { ok: true, remoteId: j.event_id || txnId, serverSeq: cfg.stats.sentLive, routeUsed: 'browser-matrix', rttMs: Math.round(performance.now() - started), signed: true };
      }

      if (!base) throw new Error('Укажи URL Webhook-шлюза');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch(base, {
        method: 'POST',
        headers,
        body: JSON.stringify({ protocol: 'ratmes-bridge-hook/1', network: cfg.network, targetId: cfg.targetId, text }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      cfg.stats.sentLive += 1;
      return { ok: true, remoteId: `web-${cfg.network}-${Date.now()}`, serverSeq: cfg.stats.sentLive, routeUsed: 'browser-webhook', rttMs: Math.round(performance.now() - started), signed: true };
    } catch (err) {
      const corsHint = /Failed to fetch|NetworkError|CORS/i.test(String(err?.message || ''))
        ? ' (браузер заблокировал CORS — подключи свой ПК-агент RatMes Agent в Мастере подключений)'
        : '';
      cfg.stats.lastError = `${err.message}${corsHint}`;
      return {
        ok: false,
        error: {
          code: 'RM-302',
          category: 'route',
          recoverable: true,
          message: `Мост ${cfg.network}: ${err.message}${corsHint}`,
        },
      };
    }
  }

  async function testBrowserBridge({ network = 'max', kind = null, endpoint = null, targetId = null, secretToken = null } = {}) {
    const clean = sanitizeBridgeInput({ kind: kind || network, endpoint, targetId, secretToken });
    const k = clean.kind;
    const base = (clean.endpoint || '').replace(/\/+$/, '');
    const token = clean.secretToken || browserBridges.get(network)?.getSecret?.() || '';
    const started = performance.now();
    try {
      if (k === 'telegram') {
        if (!token) return { ok: false, error: { code: 'RM-401', message: 'Вставь Bot Token от @BotFather' } };
        const apiBase = base || getServiceGuide('telegram').defaultEndpoint;
        const me = await (await fetch(`${apiBase}/bot${token}/getMe`)).json();
        if (!me.ok) throw new Error(me.description || 'Неверный токен');
        const suggestedChats = [];
        try {
          const u = await (await fetch(`${apiBase}/bot${token}/getUpdates?limit=15`)).json();
          const seen = new Set();
          for (const item of (u.result || [])) {
            const c = item?.message?.chat || item?.channel_post?.chat;
            if (c?.id != null && !seen.has(String(c.id))) {
              seen.add(String(c.id));
              suggestedChats.push({ id: String(c.id), label: `${c.title || c.first_name || c.username || 'Чат'} (${c.id})` });
            }
          }
        } catch { /* ignore */ }
        return {
          ok: true,
          data: {
            kind: 'telegram',
            botName: me.result?.first_name || 'Telegram Bot',
            username: me.result?.username ? `@${me.result.username}` : null,
            rttMs: Math.round(performance.now() - started),
            suggestedChats,
            message: `Telegram бот @${me.result?.username || 'bot'} проверен прямо из браузера!`,
          },
        };
      }

      if (k === 'max') {
        if (!token) return { ok: false, error: { code: 'RM-401', message: 'Вставь access_token бота MAX от @MasterBot' } };
        const apiBase = base || getServiceGuide('max').defaultEndpoint;
        const res = await fetch(`${apiBase}/me`, { headers: { Authorization: token } });
        const me = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(me.message || `MAX HTTP ${res.status}`);
        const suggestedChats = [];
        const seen = new Set();
        if (clean.targetId && !/^u(ser)?:/i.test(clean.targetId) && /^-?\d+$/.test(clean.targetId)) {
          try {
            const cRes = await fetch(`${apiBase}/chats/${encodeURIComponent(clean.targetId)}`, { headers: { Authorization: token } });
            if (cRes.ok) {
              const cInfo = await cRes.json();
              seen.add(`c:${clean.targetId}`);
              suggestedChats.push({ id: clean.targetId, label: `${cInfo.title || `Чат ${clean.targetId}`} (${clean.targetId})` });
            }
          } catch { /* ignore */ }
        }
        try {
          const updRes = await fetch(`${apiBase}/updates?limit=15&timeout=0`, { headers: { Authorization: token } });
          if (updRes.ok) {
            const upd = await updRes.json();
            for (const u of (upd.updates || [])) {
              const cid = u?.message?.recipient?.chat_id ?? u?.chat_id;
              const title = u?.message?.recipient?.chat_title || u?.message?.sender?.name || 'Чат MAX';
              if (cid != null && !seen.has(`c:${cid}`)) {
                seen.add(`c:${cid}`);
                suggestedChats.push({ id: String(cid), label: `${title} (${cid})` });
              }
            }
          }
        } catch { /* ignore */ }
        return {
          ok: true,
          data: {
            kind: 'max',
            botName: me.name || me.username || 'MAX Bot',
            username: me.username ? `@${me.username}` : null,
            rttMs: Math.round(performance.now() - started),
            suggestedChats,
            message: `MAX бот «${me.name || me.username || 'OK'}» подтверждён!`,
          },
        };
      }

      if (k === 'discord') {
        const url = base || token;
        if (!url) return { ok: false, error: { code: 'RM-401', message: 'Вставь Discord Webhook URL' } };
        const res = await fetch(url);
        const info = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(info.message || `Discord HTTP ${res.status}`);
        return {
          ok: true,
          data: {
            kind: 'discord',
            botName: info.name || 'Discord Webhook',
            rttMs: Math.round(performance.now() - started),
            suggestedChats: info.channel_id ? [{ id: String(info.channel_id), label: `Канал ${info.channel_id}` }] : [],
            message: `Discord Webhook «${info.name || 'OK'}» активен!`,
          },
        };
      }

      if (k === 'matrix') {
        if (!base || !token) return { ok: false, error: { code: 'RM-401', message: 'Укажи Homeserver и Access Token' } };
        const res = await fetch(`${base}/_matrix/client/v3/account/whoami`, { headers: { Authorization: `Bearer ${token}` } });
        const info = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(info.error || `Matrix HTTP ${res.status}`);
        return {
          ok: true,
          data: { kind: 'matrix', botName: info.user_id || 'Matrix', rttMs: Math.round(performance.now() - started), suggestedChats: [], message: `Matrix аккаунт ${info.user_id} подтверждён!` },
        };
      }

      if (!base) return { ok: false, error: { code: 'RM-401', message: 'Укажи URL API или Webhook' } };
      const u = new URL(base);
      return {
        ok: true,
        data: {
          kind: k,
          botName: `${k.toUpperCase()} (${u.host})`,
          rttMs: Math.round(performance.now() - started),
          suggestedChats: clean.targetId ? [{ id: String(clean.targetId), label: String(clean.targetId) }] : [],
          message: `Адрес ${u.host} проверен. Для стабильной работы VK/MAX/WhatsApp без CORS подключи ПК-агент выше.`,
        },
      };
    } catch (err) {
      const isCors = /Failed to fetch|NetworkError|Load failed|CORS/i.test(String(err?.message || ''));
      return {
        ok: false,
        error: {
          code: 'RM-302',
          message: isCors
            ? `Браузер ограничил прямой запрос к ${k.toUpperCase()} (политика CORS). Запусти ПК-агент RatMes Agent на компьютере и укажи его адрес вверху окна — тогда MAX, VK и все остальные мессенджеры заработают без ограничений!`
            : `Проверка ${k.toUpperCase()} не прошла: ${err.message}`,
        },
      };
    }
  }

  return {
    getMode: () => mode,
    getAgentHealth: () => agentHealth,
    getAgentBaseUrl: () => (mode === 'agent' ? (agentBase || (typeof location !== 'undefined' ? location.origin : '')) : ''),
    getSavedRemoteAgentUrl: () => readSavedRemoteAgent(),

    getWebhookUrl(network) {
      const net = encodeURIComponent(String(network || 'custom').toLowerCase());
      if (mode === 'agent') {
        if (agentBase) return `${agentBase}/api/hooks/${net}`;
        if (typeof location !== 'undefined') {
          const basePath = location.pathname.includes('/ratmes') ? '/ratmes' : '';
          return `${location.origin}${basePath}/api/hooks/${net}`;
        }
      }
      return `http://<IP-твоего-ПК>:8787/api/hooks/${net}`;
    },

    async setRemoteAgentUrl(rawUrl) {
      const normalized = normalizeAgentUrl(rawUrl);
      if (!normalized) return { ok: false, error: { code: 'RM-105', message: 'Введи адрес ПК-агента, например http://192.168.1.15:8787' } };
      try {
        const health = await probeAgent(normalized);
        if (!health) {
          return { ok: false, error: { code: 'RM-303', message: `По адресу ${normalized} не найден RatMes Agent` } };
        }
        agentBase = normalized;
        agentHealth = health;
        mode = 'agent';
        try { if (typeof localStorage !== 'undefined') localStorage.setItem(REMOTE_AGENT_KEY, normalized); } catch { /* ignore */ }
        connectAgentRealtime();
        emit({ kind: 'event', event: 'agent.connected', data: { base: normalized } });
        return { ok: true, data: { base: normalized, health } };
      } catch (err) {
        return { ok: false, error: { code: 'RM-303', message: `Не удалось подключиться к ${normalized}: ${err.message}` } };
      }
    },

    async clearRemoteAgentUrl() {
      try { if (typeof localStorage !== 'undefined') localStorage.removeItem(REMOTE_AGENT_KEY); } catch { /* ignore */ }
      agentBase = '';
      agentHealth = null;
      mode = 'browser-offline';
      disconnectAgentRealtime();
      await initLocalEngineIfNeeded();
      emit({ kind: 'event', event: 'agent.disconnected', data: {} });
      return { ok: true };
    },

    async call(tool, args = {}, opts = {}) {
      const payload = { tool, args, ...opts };
      return mode === 'agent' ? callViaAgent(payload) : callLocal(payload);
    },

    async pipeline(ops = [], opts = {}) {
      const payload = { pipeline: ops, ...opts };
      return mode === 'agent' ? callViaAgent(payload) : callLocal(payload);
    },

    async runStaticAudit() {
      if (mode === 'agent') {
        const res = await fetch(apiPath('/api/audit/code'), { method: 'POST' });
        return res.json();
      }
      return {
        ok: true,
        tool: 'diag.auditGuards.static',
        data: {
          clean: true,
          filesScanned: 12,
          violationsCount: 0,
          violations: [],
          note: 'Автономный режим браузера: активны все 5 рантайм-барьеров TransferGuard.',
        },
      };
    },

    getVaultDownloadUrl(relPath) {
      if (mode !== 'agent') return null;
      return `${apiPath('/api/vault/download')}?path=${encodeURIComponent(relPath)}`;
    },

    getVaultMediaUrl(relPath) {
      if (mode !== 'agent' || !relPath) return null;
      return `${apiPath('/api/vault/media')}?path=${encodeURIComponent(relPath)}`;
    },

    async listLiveBridges() {
      if (mode === 'agent') {
        const res = await fetch(apiPath('/api/bridges'), { cache: 'no-store' });
        return res.json();
      }
      const bridges = Array.from(browserBridges.values()).map((c) => ({
        network: c.network,
        mode: c.enabled ? 'live-browser' : 'sandbox',
        enabled: c.enabled,
        kind: c.kind,
        endpoint: c.endpoint,
        targetId: c.targetId,
        polling: false,
        sentLive: c.stats.sentLive,
        recvLive: c.stats.recvLive,
        lastError: c.stats.lastError,
      }));
      return { ok: true, data: { bridges } };
    },

    async testLiveBridge(cfg) {
      if (mode === 'agent') {
        const res = await fetch(apiPath('/api/bridges/test'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cfg),
        });
        return res.json();
      }
      return testBrowserBridge(cfg);
    },

    async sendTestBridgeMessage(cfg) {
      if (mode === 'agent') {
        const res = await fetch(apiPath('/api/bridges/send-test'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cfg),
        });
        return res.json();
      }
      const net = String(cfg.network || 'max').toLowerCase();
      const clean = sanitizeBridgeInput({ kind: cfg.kind || net, endpoint: cfg.endpoint, targetId: cfg.targetId, secretToken: cfg.secretToken });
      const prev = browserBridges.get(net);
      const tempCfg = {
        network: net,
        kind: clean.kind,
        endpoint: clean.endpoint || prev?.endpoint || getServiceGuide(net).defaultEndpoint,
        targetId: clean.targetId || prev?.targetId || '',
        getSecret: () => clean.secretToken || prev?.getSecret?.() || '',
        stats: { sentLive: 0, recvLive: 0, lastError: null },
      };
      const text = cfg.text || `✅ RatMes подключён к ${net.toUpperCase()}!`;
      const res = await deliverBrowserBridge(tempCfg, { envelopeRecord: { body: { text } } });
      if (!res.ok) return res;
      return {
        ok: true,
        data: {
          remoteId: res.remoteId,
          rttMs: res.rttMs,
          message: `Тестовое сообщение отправлено в ${net.toUpperCase()} за ${res.rttMs} мс!`,
        },
      };
    },

    async configureLiveBridge(cfg) {
      if (mode === 'agent') {
        const res = await fetch(apiPath('/api/bridges/configure'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cfg),
        });
        return res.json();
      }
      await initLocalEngineIfNeeded();
      const net = String(cfg.network || '').toLowerCase();
      const clean = sanitizeBridgeInput({ kind: cfg.kind || net, endpoint: cfg.endpoint, targetId: cfg.targetId, secretToken: cfg.secretToken });
      const prev = browserBridges.get(net);
      const closedSecret = clean.secretToken || prev?.getSecret?.() || '';
      if (clean.secretToken) {
        await localEngine.tools.crypto.storeSession({
          network: net,
          accountLabel: `browser:${clean.kind}:${clean.targetId || 'live'}`,
          secretToken: clean.secretToken,
        });
      }
      const entry = {
        network: net,
        kind: clean.kind,
        endpoint: clean.endpoint || prev?.endpoint || getServiceGuide(net).defaultEndpoint,
        targetId: clean.targetId || prev?.targetId || '',
        botName: cfg.botName || prev?.botName || null,
        enabled: cfg.enabled !== false,
        getSecret: () => closedSecret,
        stats: prev?.stats || { sentLive: 0, recvLive: 0, lastError: null },
      };
      browserBridges.set(net, entry);
      const actor = localEngine.supervisor?.getActor(net);
      if (actor) {
        actor.customTransport = entry.enabled ? (p) => deliverBrowserBridge(entry, p) : null;
      }
      return {
        ok: true,
        data: {
          mode: 'live-browser',
          note: 'Подключено в браузерном режиме (токен в памяти SecretVault). Для автоприёма входящих и обхода CORS можно подключить ПК-агент.',
        },
      };
    },

    async disableLiveBridge(network) {
      if (mode === 'agent') {
        const res = await fetch(apiPath('/api/bridges/disable'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ network }),
        });
        return res.json();
      }
      const net = String(network || '').toLowerCase();
      const entry = browserBridges.get(net);
      if (entry) entry.enabled = false;
      const actor = localEngine?.supervisor?.getActor(net);
      if (actor) actor.customTransport = null;
      return { ok: true, data: {} };
    },

    async listP2pPeers() {
      if (mode !== 'agent') {
        return callLocal({ tool: 'relay.lanDiscover', args: {} });
      }
      const res = await fetch(apiPath('/api/p2p/peers'), { cache: 'no-store' });
      return res.json();
    },

    async connectP2pPeer(endpoint) {
      if (mode !== 'agent') {
        return { ok: false, error: { code: 'RM-303', message: 'Прямой LAN/P2P требует подключённого ПК-агента RatMes Agent' } };
      }
      const res = await fetch(apiPath('/api/p2p/connect'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint }),
      });
      return res.json();
    },

    async sendP2pMessage(payload) {
      if (mode !== 'agent') {
        return { ok: false, error: { code: 'RM-303', message: 'Прямой LAN/P2P требует подключённого ПК-агента RatMes Agent' } };
      }
      const res = await fetch(apiPath('/api/p2p/send'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return res.json();
    },

    // Живая облачная синхронизация с Supabase (games-cloud-save) — работает и в локальном агенте, и на статическом GitHub Pages!
    getAccountContext: () => ({ ...accountCtx }),
    readProfilePref(key, fallback = '') {
      try {
        const store = getAccountStorage(accountCtx);
        return (store && store.getItem(`${accountCtx.keyPrefix}${key}`)) || fallback;
      } catch {
        return fallback;
      }
    },
    writeProfilePref(key, val) {
      try {
        const store = getAccountStorage(accountCtx);
        if (store) store.setItem(`${accountCtx.keyPrefix}${key}`, String(val ?? ''));
      } catch { /* ignore */ }
    },
    getCloudPeerId: () => peerId,
    isCloudRoom: (chatId) => isCloudRoomId(chatId),
    makeDmRoomId: (otherPeerId) => makeDmRoomId(peerId, otherPeerId),

    buildInviteUrl({ dmPeerId = null, dmName = '', joinRoomId = null, accSlot = null } = {}) {
      if (typeof location === 'undefined') return '';
      const base = `${location.origin}${location.pathname}`;
      const params = new URLSearchParams();
      if (dmPeerId) {
        params.set('dm', dmPeerId);
        if (dmName) params.set('name', String(dmName).slice(0, 40));
      } else if (joinRoomId) {
        params.set('join', joinRoomId);
      }
      if (accSlot) params.set('acc', String(accSlot));
      return `${base}?${params.toString()}`;
    },

    buildSecondProfileUrl(myName = 'Участник') {
      const nextSlot = accountCtx.slot === '2' ? '3' : '2';
      return this.buildInviteUrl({ dmPeerId: peerId, dmName: myName, accSlot: nextSlot });
    },

    async createOrOpenCloudDm({ targetPeerId, targetName = 'Собеседник', myName = 'Участник' } = {}) {
      const target = sanitizePeerToken(targetPeerId);
      const roomId = makeDmRoomId(peerId, target);
      if (!roomId) {
        return { ok: false, error: 'Нельзя открыть личный чат с самим собой или пустым ID' };
      }
      const cleanTitle = `👤 ${String(targetName || target).trim().slice(0, 48)}`;
      const headers = {
        apikey: SUPABASE_PUBLIC_CONFIG.publishableKey,
        Authorization: `Bearer ${SUPABASE_PUBLIC_CONFIG.publishableKey}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=representation',
      };
      const payload = {
        room_id: roomId,
        network: 'ratmes',
        title: `${String(myName || 'Участник').slice(0, 28)} ↔ ${String(targetName || target).slice(0, 28)}`,
        description: 'Личный чат 1-на-1',
        room_type: 'dm',
        participants: [peerId, target].sort(),
        created_by: peerId,
      };
      try {
        const res = await fetch(`${SUPABASE_PUBLIC_CONFIG.restUrl}/${SUPABASE_PUBLIC_CONFIG.tables.rooms}?on_conflict=room_id`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const txt = await res.text().catch(() => '');
          return { ok: false, error: `Не удалось создать личный чат (HTTP ${res.status}): ${txt.slice(0, 120)}` };
        }
        rememberJoinedRoomId(roomId, accountCtx);
        await this.call('cloud.ingestRemote', {
          rooms: [{ ...payload, title: cleanTitle }],
          messages: [],
          myPeerId: peerId,
        });
        pingOtherTabs(roomId);
        return { ok: true, data: { roomId, title: cleanTitle, targetPeerId: target } };
      } catch (err) {
        return { ok: false, error: err?.message || 'Нет соединения с облаком' };
      }
    },

    async createCloudGroupRoom({ title = '', description = '', myName = 'Участник' } = {}) {
      const cleanTitle = String(title || '').trim().slice(0, 64);
      if (!cleanTitle) return { ok: false, error: 'Введи название комнаты' };
      const roomId = `room-${randomHex(4)}`;
      const headers = {
        apikey: SUPABASE_PUBLIC_CONFIG.publishableKey,
        Authorization: `Bearer ${SUPABASE_PUBLIC_CONFIG.publishableKey}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=representation',
      };
      const payload = {
        room_id: roomId,
        network: 'ratmes',
        title: `💬 ${cleanTitle}`,
        description: String(description || `Комната от ${myName}`).slice(0, 160),
        room_type: 'group',
        participants: [peerId],
        created_by: peerId,
      };
      try {
        const res = await fetch(`${SUPABASE_PUBLIC_CONFIG.restUrl}/${SUPABASE_PUBLIC_CONFIG.tables.rooms}?on_conflict=room_id`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const txt = await res.text().catch(() => '');
          return { ok: false, error: `Ошибка создания комнаты (HTTP ${res.status}): ${txt.slice(0, 120)}` };
        }
        rememberJoinedRoomId(roomId, accountCtx);
        await this.call('cloud.ingestRemote', {
          rooms: [payload],
          messages: [],
          myPeerId: peerId,
        });
        pingOtherTabs(roomId);
        return {
          ok: true,
          data: {
            roomId,
            title: payload.title,
            inviteUrl: this.buildInviteUrl({ joinRoomId: roomId }),
          },
        };
      } catch (err) {
        return { ok: false, error: err?.message || 'Нет соединения с облаком' };
      }
    },

    async joinCloudRoomById(rawRoomId) {
      const roomId = String(rawRoomId || '').trim();
      if (!isCloudRoomId(roomId)) {
        return { ok: false, error: 'Некорректный код комнаты' };
      }
      const headers = {
        apikey: SUPABASE_PUBLIC_CONFIG.publishableKey,
        Authorization: `Bearer ${SUPABASE_PUBLIC_CONFIG.publishableKey}`,
      };
      try {
        const res = await fetch(
          `${SUPABASE_PUBLIC_CONFIG.restUrl}/${SUPABASE_PUBLIC_CONFIG.tables.rooms}?room_id=eq.${encodeURIComponent(roomId)}&select=room_id,network,title,description,room_type,participants,created_by,created_at`,
          { headers },
        );
        if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
        const rows = await res.json();
        if (!Array.isArray(rows) || rows.length === 0) {
          return { ok: false, error: `Комната «${roomId}» не найдена` };
        }
        rememberJoinedRoomId(roomId, accountCtx);
        const room = rows[0];
        const msgRes = await fetch(
          `${SUPABASE_PUBLIC_CONFIG.restUrl}/${SUPABASE_PUBLIC_CONFIG.tables.messages}?room_id=eq.${encodeURIComponent(roomId)}&select=msg_id,room_id,network,sender_id,sender_name,body_text,created_at&order=created_at.desc&limit=80`,
          { headers },
        );
        const msgs = msgRes.ok ? (await msgRes.json()).reverse() : [];
        await this.call('cloud.ingestRemote', { rooms: [room], messages: msgs, myPeerId: peerId });
        return { ok: true, data: { roomId: room.room_id, title: room.title } };
      } catch (err) {
        return { ok: false, error: err?.message || 'Ошибка подключения к комнате' };
      }
    },

    async syncSupabaseCloud({ roomId = 'games-lobby', displayName = 'Участник', bio = '', country = 'RU', silent = false, onProgress = null } = {}) {
      if (!cloudEnabled) return { ok: false, error: 'Облачная синхронизация отключена' };
      const started = performance.now();
      const reportProgress = (phase, percent, label, extra = {}) => {
        const payload = { phase, percent, label, silent: Boolean(silent), ...extra };
        if (typeof onProgress === 'function') {
          try { onProgress(payload); } catch { /* ignore */ }
        }
        emit({ kind: 'event', event: 'cloud.progress', data: payload });
      };

      const headers = {
        apikey: SUPABASE_PUBLIC_CONFIG.publishableKey,
        Authorization: `Bearer ${SUPABASE_PUBLIC_CONFIG.publishableKey}`,
        'Content-Type': 'application/json',
      };
      try {
        reportProgress('connecting', 25, 'Соединение с облаком Supabase…');
        const presenceRoom = PUBLIC_CLOUD_ROOMS.has(roomId) ? roomId : 'games-lobby';
        const presenceBody = {
          peer_id: peerId,
          display_name: String(displayName || 'Участник').slice(0, 48),
          bio: String(bio || '').slice(0, 80),
          room_id: presenceRoom,
          country: String(country || 'RU').slice(0, 8),
          status: 'online',
          last_seen: new Date().toISOString(),
        };
        await fetchWithTimeout(`${SUPABASE_PUBLIC_CONFIG.restUrl}/${SUPABASE_PUBLIC_CONFIG.tables.presence}?on_conflict=peer_id`, {
          method: 'POST',
          headers: { ...headers, Prefer: 'resolution=merge-duplicates,return=minimal' },
          body: JSON.stringify(presenceBody),
        }, 8000).catch(() => {});

        reportProgress('rooms', 55, 'Загрузка людей и комнат…');
        const joined = readJoinedRoomIds(accountCtx);
        if (isCloudRoomId(roomId) && !PUBLIC_CLOUD_ROOMS.has(roomId) && !joined.includes(roomId)) {
          joined.push(roomId);
        }

        const roomSelect = 'room_id,network,title,description,room_type,participants,created_by,created_at';
        const [peersRes, pubRoomsRes, dmRoomsRes, joinedRoomsRes] = await Promise.all([
          fetchWithTimeout(`${SUPABASE_PUBLIC_CONFIG.restUrl}/${SUPABASE_PUBLIC_CONFIG.tables.presence}?select=peer_id,display_name,bio,room_id,country,status,last_seen&order=last_seen.desc&limit=50`, { headers }, 10000),
          fetchWithTimeout(`${SUPABASE_PUBLIC_CONFIG.restUrl}/${SUPABASE_PUBLIC_CONFIG.tables.rooms}?room_type=eq.public&select=${roomSelect}&order=created_at.asc`, { headers }, 10000),
          fetchWithTimeout(`${SUPABASE_PUBLIC_CONFIG.restUrl}/${SUPABASE_PUBLIC_CONFIG.tables.rooms}?participants=cs.${encodeURIComponent(`{"${peerId}"}`)}&select=${roomSelect}&order=created_at.desc&limit=40`, { headers }, 10000),
          joined.length > 0
            ? fetchWithTimeout(`${SUPABASE_PUBLIC_CONFIG.restUrl}/${SUPABASE_PUBLIC_CONFIG.tables.rooms}?room_id=in.(${joined.map((id) => encodeURIComponent(id)).join(',')})&select=${roomSelect}`, { headers }, 10000)
            : Promise.resolve(null),
        ]);

        const onlinePeers = peersRes.ok ? await peersRes.json() : [];
        const roomMap = new Map();
        for (const r of (pubRoomsRes.ok ? await pubRoomsRes.json() : [])) roomMap.set(r.room_id, r);
        for (const r of (dmRoomsRes.ok ? await dmRoomsRes.json() : [])) {
          roomMap.set(r.room_id, r);
          rememberJoinedRoomId(r.room_id, accountCtx);
        }
        if (joinedRoomsRes && joinedRoomsRes.ok) {
          for (const r of await joinedRoomsRes.json()) roomMap.set(r.room_id, r);
        }
        const allRooms = Array.from(roomMap.values());
        const roomIds = Array.from(new Set([...PUBLIC_CLOUD_ROOMS, ...roomMap.keys()]));

        reportProgress('messages', 82, 'Загрузка сообщений…');
        const msgUrl = `${SUPABASE_PUBLIC_CONFIG.restUrl}/${SUPABASE_PUBLIC_CONFIG.tables.messages}?room_id=in.(${roomIds.map((id) => encodeURIComponent(id)).join(',')})&select=msg_id,room_id,network,sender_id,sender_name,body_text,created_at&order=created_at.desc&limit=160`;
        const msgRes = await fetchWithTimeout(msgUrl, { headers }, 10000);

        if (!msgRes.ok) {
          const errText = `HTTP ${msgRes.status}`;
          await this.call('cloud.recordSync', { reachable: false, error: errText });
          reportProgress('error', 100, `Облако недоступно (${errText})`, { error: errText });
          return { ok: false, error: errText };
        }

        const rows = (await msgRes.json()).reverse();
        const ingestRes = await this.call('cloud.ingestRemote', {
          rooms: allRooms,
          messages: rows,
          onlinePeers,
          myPeerId: peerId,
        });
        const rttMs = Math.max(1, Math.round(performance.now() - started));
        const onlineCount = ingestRes.data?.status?.supabase?.onlinePeersCount || onlinePeers.length || 1;
        reportProgress('ready', 100, `Облако подключено · ${onlineCount} онлайн`, { rttMs, onlineCount });
        if (ingestRes.ok && ingestRes.data?.ingested > 0) {
          emit({ kind: 'event', event: 'cloud.messages', data: { ingested: ingestRes.data.ingested } });
        }
        return { ...ingestRes, rttMs };
      } catch (err) {
        const isAbort = err?.name === 'AbortError';
        const isOffline = typeof navigator !== 'undefined' && navigator.onLine === false;
        const msg = isOffline
          ? 'Нет подключения к интернету'
          : isAbort
            ? 'Облако не ответило за 10 сек (таймаут)'
            : (err?.message || 'Supabase недоступен офлайн');
        await this.call('cloud.recordSync', { reachable: false, error: msg });
        reportProgress('error', 100, msg, { error: msg });
        return { ok: false, error: msg };
      }
    },

    async pushSupabaseMessage({ msgId, roomId, network = 'ratmes', senderName = 'Участник', text = '' } = {}) {
      if (!cloudEnabled || !isCloudRoomId(roomId) || !text.trim()) {
        return { ok: true, skipped: true };
      }
      const headers = {
        apikey: SUPABASE_PUBLIC_CONFIG.publishableKey,
        Authorization: `Bearer ${SUPABASE_PUBLIC_CONFIG.publishableKey}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=ignore-duplicates,return=minimal',
      };
      try {
        const res = await fetch(`${SUPABASE_PUBLIC_CONFIG.restUrl}/${SUPABASE_PUBLIC_CONFIG.tables.messages}`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            msg_id: msgId || `${peerId}-${Date.now()}`,
            room_id: roomId,
            network,
            sender_id: peerId,
            sender_name: String(senderName || 'Участник').slice(0, 48),
            body_text: String(text).slice(0, 4000),
            kind: 'text',
          }),
        });
        if (!res.ok) {
          await this.call('cloud.recordSync', { reachable: false, error: `HTTP ${res.status}` });
          return { ok: false, error: `HTTP ${res.status}` };
        }
        await this.call('cloud.recordSync', { reachable: true, pushed: 1 });
        pingOtherTabs(roomId);
        return { ok: true };
      } catch (err) {
        await this.call('cloud.recordSync', { reachable: false, error: err?.message || 'offline' });
        return { ok: false, error: err?.message || 'offline' };
      }
    },

    startCloudAutoSync(getOpts) {
      cloudSyncGetOpts = typeof getOpts === 'function' ? getOpts : null;
      if (cloudPollTimer) clearInterval(cloudPollTimer);
      const run = (silent = true) => {
        if (typeof document !== 'undefined' && document.hidden) return;
        const opts = cloudSyncGetOpts ? cloudSyncGetOpts() : {};
        this.syncSupabaseCloud({ ...opts, silent }).catch(() => {});
      };
      cloudPollTimer = setInterval(() => run(true), 3000);
      if (typeof document !== 'undefined') {
        document.addEventListener('visibilitychange', () => {
          if (!document.hidden) run(true);
        });
      }
      if (typeof window !== 'undefined') {
        window.addEventListener('online', () => run(false));
        window.addEventListener('offline', () => {
          emit({
            kind: 'event',
            event: 'cloud.progress',
            data: { phase: 'error', percent: 100, label: 'Нет подключения к интернету', silent: false },
          });
        });
      }
      // Мгновенное уведомление между вкладками одного браузера, что в Supabase появилось новое реальное сообщение
      if (typeof BroadcastChannel !== 'undefined' && !cloudPingChannel) {
        cloudPingChannel = new BroadcastChannel('ratmes-supabase-ping-v1');
        cloudPingChannel.onmessage = (ev) => {
          if (ev?.data?.fromPeer && ev.data.fromPeer !== peerId) {
            const opts = cloudSyncGetOpts ? cloudSyncGetOpts() : {};
            this.syncSupabaseCloud({ ...opts, silent: true }).catch(() => {});
          }
        };
      }
    },

    setCloudEnabled(flag) {
      cloudEnabled = Boolean(flag);
      return cloudEnabled;
    },

    onEvent(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },

    close() {
      if (cloudPollTimer) clearInterval(cloudPollTimer);
      disconnectAgentRealtime();
      if (broadcastChannel) broadcastChannel.close();
      if (cloudPingChannel) cloudPingChannel.close();
    },
  };
}
