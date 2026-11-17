// Санкционированный транспортный драйвер живых мостов ПК-агента (Telegram Bot API, Discord Webhook/Bot, Matrix C-S API, VK API, Custom Webhook).
// Секретные токены НИКОГДА не возвращаются в UI — драйвер подписывает запросы напрямую,
// а наружу отдаёт только статус соединения, маску конфигурации и метрики доставки.

export function createLiveBridgeManager({ engine }) {
  // network -> { enabled, kind, endpoint, targetId, tokenReader, pollTimer, lastOffset, stats }
  const configs = new Map();

  function getStatus(network) {
    const cfg = configs.get(network);
    if (!cfg) {
      return { network, mode: 'sandbox', enabled: false, endpoint: null, targetId: null, sentLive: 0, recvLive: 0, lastError: null };
    }
    return {
      network,
      mode: cfg.enabled ? 'live' : 'sandbox',
      enabled: cfg.enabled,
      kind: cfg.kind,
      endpoint: cfg.endpoint,
      targetId: cfg.targetId,
      polling: Boolean(cfg.pollTimer),
      sentLive: cfg.stats.sentLive,
      recvLive: cfg.stats.recvLive,
      lastLiveAt: cfg.stats.lastLiveAt,
      lastError: cfg.stats.lastError,
    };
  }

  function listStatuses() {
    const allNets = ['telegram', 'discord', 'vk', 'max', 'whatsapp', 'signal', 'viber', 'matrix'];
    return allNets.map((n) => getStatus(n));
  }

  async function configureBridge({
    network,
    kind = null,
    endpoint = null,
    targetId = null,
    secretToken = null,
    enabled = true,
    enablePolling = false,
  }) {
    const net = String(network || '').toLowerCase();
    const bridgeKind = kind || net;

    // Если передан секрет — кладём его строго в SecretVault!
    let sessionHandle = null;
    if (secretToken) {
      const stored = await engine.tools.crypto.storeSession({
        network: net,
        accountLabel: `${bridgeKind}:${targetId || 'live'}`,
        secretToken,
      });
      if (!stored.ok) return stored;
      sessionHandle = stored.data.sessionHandle;
    }

    const prev = configs.get(net);
    if (prev?.pollTimer) clearInterval(prev.pollTimer);

    // Секрет хранится только в замыкании драйвера (никогда не сериализуется наружу!)
    const closedSecret = secretToken || prev?.getSecret?.() || '';
    const cfg = {
      network: net,
      kind: bridgeKind,
      endpoint: endpoint || defaultEndpointFor(bridgeKind),
      targetId: targetId || prev?.targetId || '',
      enabled: Boolean(enabled),
      sessionHandleId: sessionHandle?.handleId || prev?.sessionHandleId || null,
      getSecret: () => closedSecret,
      pollTimer: null,
      lastOffset: prev?.lastOffset || 0,
      stats: prev?.stats || { sentLive: 0, recvLive: 0, lastLiveAt: null, lastError: null },
    };
    configs.set(net, cfg);

    // Привязываем живой транспорт к актору моста в BridgeSupervisor
    const actor = engine.supervisor?.getActor(net);
    if (actor) {
      actor.customTransport = cfg.enabled
        ? (payload) => deliverLive(cfg, payload)
        : null;
    }

    if (cfg.enabled && enablePolling && bridgeKind === 'telegram' && closedSecret) {
      startTelegramPolling(cfg);
    }

    return { ok: true, data: { status: getStatus(net), sessionHandle } };
  }

  function disableBridge(network) {
    const net = String(network || '').toLowerCase();
    const cfg = configs.get(net);
    if (cfg) {
      cfg.enabled = false;
      if (cfg.pollTimer) {
        clearInterval(cfg.pollTimer);
        cfg.pollTimer = null;
      }
    }
    const actor = engine.supervisor?.getActor(net);
    if (actor) actor.customTransport = null;
    return { ok: true, data: { status: getStatus(net) } };
  }

  async function deliverLive(cfg, { envelopeRecord, routePlan }) {
    const token = cfg.getSecret();
    const text = envelopeRecord?.body?.text || '';
    const started = performance.now();

    try {
      if (cfg.kind === 'telegram') {
        if (!token || !cfg.targetId) throw new Error('Для живого Telegram нужны Bot Token и targetId (chat_id)');
        const url = `${cfg.endpoint.replace(/\/$/, '')}/bot${token}/sendMessage`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: cfg.targetId, text }),
        });
        const json = await res.json();
        if (!res.ok || !json.ok) throw new Error(json.description || `HTTP ${res.status}`);
        cfg.stats.sentLive += 1;
        cfg.stats.lastLiveAt = Date.now();
        cfg.stats.lastError = null;
        return {
          ok: true,
          remoteId: `tg-live-${json.result.message_id}`,
          serverSeq: Number(json.result.message_id) || Date.now(),
          routeUsed: `live-telegram (${routePlan?.activeRoute || 'direct'})`,
          rttMs: Math.round(performance.now() - started),
          signed: true,
        };
      }

      if (cfg.kind === 'discord') {
        const webhookUrl = cfg.endpoint || token;
        if (!webhookUrl) throw new Error('Для живого Discord укажи Webhook URL');
        const res = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: text, username: 'RatMes Bridge' }),
        });
        if (!res.ok) throw new Error(`Discord HTTP ${res.status}`);
        cfg.stats.sentLive += 1;
        cfg.stats.lastLiveAt = Date.now();
        cfg.stats.lastError = null;
        return {
          ok: true,
          remoteId: `dc-live-${Date.now()}`,
          serverSeq: cfg.stats.sentLive,
          routeUsed: `live-discord (${routePlan?.activeRoute || 'direct'})`,
          rttMs: Math.round(performance.now() - started),
          signed: true,
        };
      }

      if (cfg.kind === 'matrix') {
        if (!cfg.endpoint || !cfg.targetId || !token) throw new Error('Для Matrix нужны homeserver endpoint, roomId и access_token');
        const txnId = `rm-${Date.now()}-${cfg.stats.sentLive + 1}`;
        const url = `${cfg.endpoint.replace(/\/$/, '')}/_matrix/client/v3/rooms/${encodeURIComponent(cfg.targetId)}/send/m.room.message/${txnId}`;
        const res = await fetch(url, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ msgtype: 'm.text', body: text }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || `Matrix HTTP ${res.status}`);
        cfg.stats.sentLive += 1;
        cfg.stats.lastLiveAt = Date.now();
        cfg.stats.lastError = null;
        return {
          ok: true,
          remoteId: json.event_id || txnId,
          serverSeq: cfg.stats.sentLive,
          routeUsed: `live-matrix (${cfg.endpoint})`,
          rttMs: Math.round(performance.now() - started),
          signed: true,
        };
      }

      if (cfg.kind === 'vk') {
        if (!token || !cfg.targetId) throw new Error('Для живого VK нужны access_token и peer_id');
        const params = new URLSearchParams({
          peer_id: String(cfg.targetId),
          random_id: String(Date.now() & 0x7fffffff),
          message: text,
          access_token: token,
          v: '5.199',
        });
        const res = await fetch(`${cfg.endpoint.replace(/\/$/, '')}/method/messages.send`, {
          method: 'POST',
          body: params,
        });
        const json = await res.json();
        if (json.error) throw new Error(json.error.error_msg || 'VK API error');
        cfg.stats.sentLive += 1;
        cfg.stats.lastLiveAt = Date.now();
        cfg.stats.lastError = null;
        return {
          ok: true,
          remoteId: `vk-live-${json.response}`,
          serverSeq: Number(json.response) || cfg.stats.sentLive,
          routeUsed: 'live-vk (direct)',
          rttMs: Math.round(performance.now() - started),
          signed: true,
        };
      }

      // Универсальный HTTP Webhook-мост (подходит для локальных шлюзов, n8n, self-hosted мостов)
      if (!cfg.endpoint) throw new Error('Не указан endpoint webhook-моста');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch(cfg.endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          protocol: 'ratmes-bridge-hook/1',
          network: cfg.network,
          chatId: envelopeRecord.chatId,
          targetId: cfg.targetId,
          msgId: envelopeRecord.body.msgId,
          text,
          ts: envelopeRecord.body.ts,
        }),
      });
      if (!res.ok) throw new Error(`Webhook HTTP ${res.status}`);
      cfg.stats.sentLive += 1;
      cfg.stats.lastLiveAt = Date.now();
      cfg.stats.lastError = null;
      return {
        ok: true,
        remoteId: `hook-${cfg.network}-${Date.now()}`,
        serverSeq: cfg.stats.sentLive,
        routeUsed: `live-webhook (${cfg.endpoint})`,
        rttMs: Math.round(performance.now() - started),
        signed: true,
      };
    } catch (err) {
      cfg.stats.lastError = err.message;
      return {
        ok: false,
        error: {
          code: 'RM-302',
          category: 'route',
          recoverable: true,
          message: `Живой мост ${cfg.network}: ${err.message}`,
        },
      };
    }
  }

  function startTelegramPolling(cfg) {
    cfg.pollTimer = setInterval(async () => {
      try {
        const token = cfg.getSecret();
        if (!token || !cfg.enabled) return;
        const url = `${cfg.endpoint.replace(/\/$/, '')}/bot${token}/getUpdates?timeout=5&offset=${cfg.lastOffset + 1}`;
        const res = await fetch(url);
        const json = await res.json();
        if (!json.ok || !Array.isArray(json.result)) return;
        for (const upd of json.result) {
          cfg.lastOffset = Math.max(cfg.lastOffset, upd.update_id || 0);
          await ingestWebhook('telegram', upd);
        }
      } catch (err) {
        cfg.stats.lastError = err.message;
      }
    }, 4500);
    if (cfg.pollTimer.unref) cfg.pollTimer.unref();
  }

  // Приём входящего webhook от внешней сети и прогон строго через engine.tools.transfer.receive()!
  async function ingestWebhook(network, payload = {}) {
    const net = String(network || 'custom').toLowerCase();
    let chatId = `${net}-live`;
    let chatTitle = `${net.toUpperCase()} · Живой мост`;
    let senderName = 'Внешний собеседник';
    let text = '';
    let msgId = null;

    if (net === 'telegram' && payload.message) {
      const m = payload.message;
      chatId = `tg-${m.chat?.id || 'live'}`;
      chatTitle = m.chat?.title || m.from?.first_name || 'Telegram Live';
      senderName = m.from?.username ? `@${m.from.username}` : (m.from?.first_name || 'Telegram');
      text = m.text || m.caption || '[медиа]';
      msgId = `tg-in-${m.message_id}`;
    } else if (net === 'vk' && payload.object?.message) {
      const m = payload.object.message;
      chatId = `vk-${m.peer_id || 'live'}`;
      chatTitle = `VK · peer ${m.peer_id || 'live'}`;
      senderName = `vk_id${m.from_id || 0}`;
      text = m.text || '[вложение]';
      msgId = `vk-in-${m.id}`;
    } else if (net === 'discord') {
      chatId = `dc-${payload.channel_id || 'live'}`;
      chatTitle = payload.channel_name || 'Discord Live';
      senderName = payload.author?.username || payload.username || 'Discord';
      text = payload.content || payload.text || '';
      msgId = payload.id ? `dc-in-${payload.id}` : null;
    } else {
      chatId = payload.chatId || `${net}-live`;
      chatTitle = payload.chatTitle || `${net.toUpperCase()} Live`;
      senderName = payload.senderName || net.toUpperCase();
      text = payload.text || payload.body || JSON.stringify(payload).slice(0, 200);
      msgId = payload.msgId || null;
    }

    if (!text) return { ok: false, error: { code: 'RM-105', message: 'Пустой входящий webhook' } };
    const cfg = configs.get(net);
    if (cfg) {
      cfg.stats.recvLive += 1;
      cfg.stats.lastLiveAt = Date.now();
    }
    return engine.tools.transfer.receive({
      sourceChannel: `live-${net}`,
      network: net,
      chatId,
      chatTitle,
      senderName,
      text,
      msgId,
    });
  }

  function closeAll() {
    for (const cfg of configs.values()) {
      if (cfg.pollTimer) clearInterval(cfg.pollTimer);
    }
  }

  return {
    configureBridge,
    disableBridge,
    getStatus,
    listStatuses,
    ingestWebhook,
    closeAll,
  };
}

function defaultEndpointFor(kind) {
  if (kind === 'telegram') return 'https://api.telegram.org';
  if (kind === 'vk') return 'https://api.vk.com';
  if (kind === 'matrix') return 'https://matrix-client.matrix.org';
  return '';
}
