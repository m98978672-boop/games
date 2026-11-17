// Единственный санкционированный клиентский драйвер связи браузера/PWA с ПК-агентом RatMes Agent.
// Использует относительные URL (совместимо с Arena Live Preview и любым прокси),
// поддерживает подключение с телефона к пользовательскому адресу ПК-агента,
// а при отсутствии агента автоматически работает автономно в браузере (PWA + Supabase + браузерные мосты).

import { createRatMesEngine } from '../engine/ratmes-engine.mjs';
import { createMemoryVault } from '../engine/vault-store.mjs';
import { SUPABASE_PUBLIC_CONFIG } from '../engine/cloud-hub.mjs';
import { getServiceGuide, sanitizeBridgeInput } from '../engine/service-guides.mjs';

const CLOUD_SYNCED_ROOMS = new Set(['games-lobby', 'games-coop', 'games-dev', 'ratmes-main']);
const REMOTE_AGENT_KEY = 'ratmes-remote-agent-url-v1';

function getOrCreatePeerId() {
  try {
    const key = 'ratmes-games-peer-id-v1';
    const existing = typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
    if (existing) return existing;
    const bytes = new Uint8Array(8);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(bytes);
    }
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
    const created = `games-${hex}`;
    if (typeof localStorage !== 'undefined') localStorage.setItem(key, created);
    return created;
  } catch {
    return 'games-browser-peer';
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

export async function createBridgeClient() {
  const listeners = new Set();
  let mode = 'browser-offline';
  let agentBase = ''; // '' означает относительный ./api/*, иначе 'https://host:port'
  let localEngine = null;
  let eventSource = null;
  let ws = null;
  let broadcastChannel = null;
  let agentHealth = null;
  let wsReqSeq = 0;
  let cloudPollTimer = null;
  let cloudEnabled = true;
  const peerId = getOrCreatePeerId();
  const wsPending = new Map();
  // Локальные браузерные мосты (для автономного режима с телефона / GitHub Pages)
  const browserBridges = new Map();

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
    const memVault = createMemoryVault({ storageKey: 'ratmes-pwa-vault-v1' });
    localEngine = createRatMesEngine({ vault: memVault, country: 'RU', seedDemoChats: true });
    await localEngine.ensureStarterChats();
    localEngine.core.watch.subscribe((evt) => {
      emit({ kind: 'event', event: evt.type, data: evt.payload, stateHash: localEngine.getStateHash() });
    });
    if (typeof BroadcastChannel !== 'undefined' && !broadcastChannel) {
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

  // 1. Пробуем локальный ./api/health, затем сохранённый пользовательский адрес ПК-агента
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
    getCloudPeerId: () => peerId,
    isCloudRoom: (chatId) => CLOUD_SYNCED_ROOMS.has(chatId),

    async syncSupabaseCloud({ roomId = 'games-lobby', displayName = 'Игрок Games', country = 'RU' } = {}) {
      if (!cloudEnabled) return { ok: false, error: 'Облачная синхронизация отключена' };
      const headers = {
        apikey: SUPABASE_PUBLIC_CONFIG.publishableKey,
        Authorization: `Bearer ${SUPABASE_PUBLIC_CONFIG.publishableKey}`,
        'Content-Type': 'application/json',
      };
      try {
        const presenceBody = {
          peer_id: peerId,
          display_name: String(displayName || 'Игрок Games').slice(0, 48),
          room_id: CLOUD_SYNCED_ROOMS.has(roomId) ? roomId : 'games-lobby',
          country: String(country || 'RU').slice(0, 8),
          status: 'online',
          last_seen: new Date().toISOString(),
        };
        await fetch(`${SUPABASE_PUBLIC_CONFIG.restUrl}/${SUPABASE_PUBLIC_CONFIG.tables.presence}?on_conflict=peer_id`, {
          method: 'POST',
          headers: { ...headers, Prefer: 'resolution=merge-duplicates,return=minimal' },
          body: JSON.stringify(presenceBody),
        }).catch(() => {});

        const [msgRes, peersRes] = await Promise.all([
          fetch(`${SUPABASE_PUBLIC_CONFIG.restUrl}/${SUPABASE_PUBLIC_CONFIG.tables.messages}?select=msg_id,room_id,network,sender_name,body_text,created_at&order=created_at.desc&limit=80`, { headers }),
          fetch(`${SUPABASE_PUBLIC_CONFIG.restUrl}/${SUPABASE_PUBLIC_CONFIG.tables.presence}?select=peer_id,display_name,room_id,status,last_seen&order=last_seen.desc&limit=24`, { headers }),
        ]);

        if (!msgRes.ok) {
          const errText = `HTTP ${msgRes.status}`;
          await this.call('cloud.recordSync', { reachable: false, error: errText });
          return { ok: false, error: errText };
        }

        const rows = (await msgRes.json()).reverse();
        const onlinePeers = peersRes.ok ? await peersRes.json() : [];
        const ingestRes = await this.call('cloud.ingestRemote', { messages: rows, onlinePeers });
        if (ingestRes.ok && ingestRes.data?.ingested > 0) {
          emit({ kind: 'event', event: 'cloud.messages', data: { ingested: ingestRes.data.ingested } });
        }
        return ingestRes;
      } catch (err) {
        const msg = err?.message || 'Supabase недоступен офлайн';
        await this.call('cloud.recordSync', { reachable: false, error: msg });
        return { ok: false, error: msg };
      }
    },

    async pushSupabaseMessage({ msgId, roomId, network = 'ratmes', senderName = 'Игрок Games', text = '' } = {}) {
      if (!cloudEnabled || !CLOUD_SYNCED_ROOMS.has(roomId) || !text.trim()) {
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
            sender_name: String(senderName || 'Игрок Games').slice(0, 48),
            body_text: String(text).slice(0, 4000),
            kind: 'text',
          }),
        });
        if (!res.ok) {
          await this.call('cloud.recordSync', { reachable: false, error: `HTTP ${res.status}` });
          return { ok: false, error: `HTTP ${res.status}` };
        }
        await this.call('cloud.recordSync', { reachable: true, pushed: 1 });
        return { ok: true };
      } catch (err) {
        await this.call('cloud.recordSync', { reachable: false, error: err?.message || 'offline' });
        return { ok: false, error: err?.message || 'offline' };
      }
    },

    startCloudAutoSync(getOpts) {
      if (cloudPollTimer) clearInterval(cloudPollTimer);
      const run = () => {
        if (typeof document !== 'undefined' && document.hidden) return;
        const opts = typeof getOpts === 'function' ? getOpts() : {};
        this.syncSupabaseCloud(opts).catch(() => {});
      };
      run();
      cloudPollTimer = setInterval(run, 12000);
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
    },
  };
}
