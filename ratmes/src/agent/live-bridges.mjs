// Санкционированный транспортный драйвер живых мостов ПК-агента:
// MAX Bot API, Telegram Bot API, Discord Webhook, VK Messages API, WhatsApp Cloud API,
// Matrix Client-Server API, Viber Bot API, Signal (signal-cli REST API) и Custom HTTP Webhook.
// Секретные токены НИКОГДА не возвращаются в UI — драйвер подписывает запросы напрямую,
// а наружу отдаёт только статус соединения, маску конфигурации и метрики доставки.

export function createLiveBridgeManager({ engine }) {
  // network -> { enabled, kind, endpoint, targetId, getSecret, pollTimer, lastOffset, lastMarker, stats }
  const configs = new Map();

  function getStatus(network) {
    const cfg = configs.get(network);
    if (!cfg) {
      return {
        network,
        mode: 'sandbox',
        enabled: false,
        kind: defaultKindFor(network),
        endpoint: defaultEndpointFor(defaultKindFor(network)),
        targetId: null,
        polling: false,
        sentLive: 0,
        recvLive: 0,
        lastError: null,
      };
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
    const allNets = ['max', 'telegram', 'discord', 'vk', 'whatsapp', 'matrix', 'viber', 'signal', 'wechat', 'line', 'kakaotalk', 'zalo'];
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
    const bridgeKind = kind || defaultKindFor(net);

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
      lastMarker: prev?.lastMarker || null,
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

    if (cfg.enabled && enablePolling && closedSecret) {
      if (bridgeKind === 'telegram') startTelegramPolling(cfg);
      if (bridgeKind === 'max') startMaxPolling(cfg);
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

  // Проверка подключения и автопоиск доступных chat_id ДО сохранения (секрет не возвращается наружу!)
  async function testBridge({ network = 'max', kind = null, endpoint = null, targetId = null, secretToken = null } = {}) {
    const net = String(network || '').toLowerCase();
    const bridgeKind = kind || defaultKindFor(net);
    const prev = configs.get(net);
    const token = secretToken || prev?.getSecret?.() || '';
    const base = (endpoint || prev?.endpoint || defaultEndpointFor(bridgeKind)).replace(/\/$/, '');
    const started = performance.now();

    try {
      if (bridgeKind === 'max') {
        if (!token) return { ok: false, error: { code: 'RM-401', message: 'Вставь access_token бота MAX от @MasterBot' } };
        const meRes = await fetch(`${base}/me`, {
          headers: { Authorization: token },
        });
        const me = await meRes.json().catch(() => ({}));
        if (!meRes.ok) {
          throw new Error(me.message || me.code || `MAX HTTP ${meRes.status}`);
        }
        // Пытаемся подсказать найденные chat_id из последних обновлений (/updates)
        const suggestedChats = [];
        try {
          const updRes = await fetch(`${base}/updates?limit=10&timeout=0`, {
            headers: { Authorization: token },
          });
          if (updRes.ok) {
            const updJson = await updRes.json();
            const seen = new Set();
            for (const u of (updJson.updates || [])) {
              const cid = u?.message?.recipient?.chat_id ?? u?.chat_id;
              const uid = u?.message?.sender?.user_id ?? u?.user?.user_id;
              const title = u?.message?.sender?.name || u?.user?.name || (cid ? `Чат ${cid}` : '');
              if (cid != null && !seen.has(`c:${cid}`)) {
                seen.add(`c:${cid}`);
                suggestedChats.push({ id: String(cid), label: `${title || 'Чат MAX'} (chat_id: ${cid})` });
              } else if (uid != null && !seen.has(`u:${uid}`)) {
                seen.add(`u:${uid}`);
                suggestedChats.push({ id: `user:${uid}`, label: `${title || 'Пользователь MAX'} (user:${uid})` });
              }
            }
          }
        } catch { /* опциональный поиск чатов */ }

        return {
          ok: true,
          data: {
            kind: 'max',
            botName: me.name || me.username || `MAX Bot #${me.user_id || ''}`,
            username: me.username ? `@${me.username}` : null,
            rttMs: Math.round(performance.now() - started),
            suggestedChats,
            message: `MAX бот подключён: ${me.name || me.username || 'OK'}${suggestedChats.length ? ` · найдено чатов: ${suggestedChats.length}` : ' · напиши боту в MAX, чтобы увидеть chat_id'}`,
          },
        };
      }

      if (bridgeKind === 'telegram') {
        if (!token) return { ok: false, error: { code: 'RM-401', message: 'Вставь Bot Token от @BotFather' } };
        const meRes = await fetch(`${base}/bot${token}/getMe`);
        const me = await meRes.json().catch(() => ({}));
        if (!meRes.ok || !me.ok) {
          throw new Error(me.description || `Telegram HTTP ${meRes.status}`);
        }
        const suggestedChats = [];
        try {
          const updRes = await fetch(`${base}/bot${token}/getUpdates?limit=10`);
          const updJson = await updRes.json().catch(() => ({}));
          const seen = new Set();
          for (const u of (updJson.result || [])) {
            const c = u?.message?.chat || u?.channel_post?.chat;
            if (c?.id != null && !seen.has(String(c.id))) {
              seen.add(String(c.id));
              const label = c.title || [c.first_name, c.last_name].filter(Boolean).join(' ') || (c.username ? `@${c.username}` : `Чат ${c.id}`);
              suggestedChats.push({ id: String(c.id), label: `${label} (${c.id})` });
            }
          }
        } catch { /* опционально */ }

        return {
          ok: true,
          data: {
            kind: 'telegram',
            botName: me.result?.first_name || 'Telegram Bot',
            username: me.result?.username ? `@${me.result.username}` : null,
            rttMs: Math.round(performance.now() - started),
            suggestedChats,
            message: `Telegram бот @${me.result?.username || 'bot'} проверен${suggestedChats.length ? ` · найдено чатов: ${suggestedChats.length}` : ' · напиши боту «привет», чтобы получить chat_id'}`,
          },
        };
      }

      if (bridgeKind === 'discord') {
        const webhookUrl = base || token;
        if (!webhookUrl) return { ok: false, error: { code: 'RM-401', message: 'Вставь ссылку Discord Webhook URL' } };
        const res = await fetch(webhookUrl);
        const info = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(info.message || `Discord HTTP ${res.status}`);
        return {
          ok: true,
          data: {
            kind: 'discord',
            botName: info.name || 'Discord Webhook',
            rttMs: Math.round(performance.now() - started),
            suggestedChats: info.channel_id ? [{ id: String(info.channel_id), label: `Канал ${info.channel_id}` }] : [],
            message: `Discord Webhook «${info.name || 'OK'}» активен и готов к отправке!`,
          },
        };
      }

      if (bridgeKind === 'matrix') {
        if (!base || !token) return { ok: false, error: { code: 'RM-401', message: 'Укажи Homeserver и Access Token' } };
        const res = await fetch(`${base}/_matrix/client/v3/account/whoami`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const info = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(info.error || `Matrix HTTP ${res.status}`);
        return {
          ok: true,
          data: {
            kind: 'matrix',
            botName: info.user_id || 'Matrix Account',
            rttMs: Math.round(performance.now() - started),
            suggestedChats: [],
            message: `Matrix аккаунт ${info.user_id || 'OK'} подтверждён!`,
          },
        };
      }

      if (bridgeKind === 'vk') {
        if (!token) return { ok: false, error: { code: 'RM-401', message: 'Вставь ключ доступа сообщества VK (access_token)' } };
        const params = new URLSearchParams({ access_token: token, v: '5.199' });
        const res = await fetch(`${base}/method/groups.getById`, { method: 'POST', body: params });
        const info = await res.json().catch(() => ({}));
        if (info.error) throw new Error(info.error.error_msg || 'VK API error');
        const g = info.response?.groups?.[0] || info.response?.[0];
        return {
          ok: true,
          data: {
            kind: 'vk',
            botName: g?.name || 'VK API',
            rttMs: Math.round(performance.now() - started),
            suggestedChats: [],
            message: `Ключ VK подтверждён${g?.name ? ` (${g.name})` : ''}!`,
          },
        };
      }

      // Для WhatsApp / Viber / Signal / Custom Webhook проверяем корректность URL
      if (!base) {
        return { ok: false, error: { code: 'RM-401', message: 'Укажи URL API или Webhook-шлюза' } };
      }
      const parsed = new URL(base);
      return {
        ok: true,
        data: {
          kind: bridgeKind,
          botName: `${bridgeKind.toUpperCase()} (${parsed.host})`,
          rttMs: Math.round(performance.now() - started),
          suggestedChats: targetId ? [{ id: String(targetId), label: String(targetId) }] : [],
          message: `Адрес ${parsed.host} корректен — можно сохранять подключение и отправлять тестовое сообщение.`,
        },
      };
    } catch (err) {
      return {
        ok: false,
        error: {
          code: 'RM-302',
          message: `Проверка ${bridgeKind.toUpperCase()} не прошла: ${err.message}`,
        },
      };
    }
  }

  async function deliverLive(cfg, { envelopeRecord, routePlan }) {
    const token = cfg.getSecret();
    const text = envelopeRecord?.body?.text || '';
    const started = performance.now();

    try {
      // 1. MAX Bot API (https://platform-api.max.ru)
      if (cfg.kind === 'max') {
        if (!token || !cfg.targetId) {
          throw new Error('Для живого MAX нужны access_token от @MasterBot и chat_id (или user:ID)');
        }
        const rawTarget = String(cfg.targetId).trim();
        const isUser = /^u(ser)?:/i.test(rawTarget);
        const cleanId = rawTarget.replace(/^u(ser)?:/i, '').trim();
        const paramName = isUser ? 'user_id' : 'chat_id';
        const url = `${cfg.endpoint.replace(/\/$/, '')}/messages?${paramName}=${encodeURIComponent(cleanId)}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token,
          },
          body: JSON.stringify({ text }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json.message || json.code || `MAX HTTP ${res.status}`);
        cfg.stats.sentLive += 1;
        cfg.stats.lastLiveAt = Date.now();
        cfg.stats.lastError = null;
        return {
          ok: true,
          remoteId: `max-live-${json.message?.body?.mid || Date.now()}`,
          serverSeq: Number(json.message?.body?.seq) || cfg.stats.sentLive,
          routeUsed: `live-max (${routePlan?.activeRoute || 'direct'})`,
          rttMs: Math.round(performance.now() - started),
          signed: true,
        };
      }

      // 2. Telegram Bot API
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

      // 3. Discord Webhook
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

      // 4. Matrix Client-Server API
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

      // 5. VK Messages API
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

      // 6. WhatsApp Cloud API (Meta)
      if (cfg.kind === 'whatsapp') {
        if (!cfg.endpoint || !token || !cfg.targetId) {
          throw new Error('Для WhatsApp Cloud API нужны URL с PHONE_NUMBER_ID, Access Token и номер получателя');
        }
        const url = cfg.endpoint.endsWith('/messages') ? cfg.endpoint : `${cfg.endpoint.replace(/\/$/, '')}/messages`;
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: String(cfg.targetId).replace(/[^\d]/g, ''),
            type: 'text',
            text: { body: text },
          }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json.error?.message || `WhatsApp HTTP ${res.status}`);
        cfg.stats.sentLive += 1;
        cfg.stats.lastLiveAt = Date.now();
        cfg.stats.lastError = null;
        return {
          ok: true,
          remoteId: `wa-live-${json.messages?.[0]?.id || Date.now()}`,
          serverSeq: cfg.stats.sentLive,
          routeUsed: `live-whatsapp (${routePlan?.activeRoute || 'direct'})`,
          rttMs: Math.round(performance.now() - started),
          signed: true,
        };
      }

      // 7. Viber Bot API
      if (cfg.kind === 'viber') {
        if (!token || !cfg.targetId) throw new Error('Для Viber нужны Auth Token и Receiver ID');
        const url = `${cfg.endpoint.replace(/\/$/, '')}/pa/send_message`;
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Viber-Auth-Token': token,
          },
          body: JSON.stringify({
            receiver: cfg.targetId,
            type: 'text',
            text,
            sender: { name: 'RatMes' },
          }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || (json.status && json.status !== 0)) {
          throw new Error(json.status_message || `Viber HTTP ${res.status}`);
        }
        cfg.stats.sentLive += 1;
        cfg.stats.lastLiveAt = Date.now();
        cfg.stats.lastError = null;
        return {
          ok: true,
          remoteId: `vb-live-${json.message_token || Date.now()}`,
          serverSeq: cfg.stats.sentLive,
          routeUsed: `live-viber (${routePlan?.activeRoute || 'direct'})`,
          rttMs: Math.round(performance.now() - started),
          signed: true,
        };
      }

      // 8. Signal (signal-cli-rest-api)
      if (cfg.kind === 'signal') {
        if (!cfg.endpoint || !cfg.targetId) throw new Error('Для Signal нужны URL signal-cli и номера «отправитель,получатель»');
        const [senderNum, recipientNum] = String(cfg.targetId).split(',').map((s) => s.trim());
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers.Authorization = `Bearer ${token}`;
        const res = await fetch(`${cfg.endpoint.replace(/\/$/, '')}/v2/send`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            message: text,
            number: senderNum,
            recipients: [recipientNum || senderNum],
          }),
        });
        if (!res.ok) throw new Error(`Signal HTTP ${res.status}`);
        cfg.stats.sentLive += 1;
        cfg.stats.lastLiveAt = Date.now();
        cfg.stats.lastError = null;
        return {
          ok: true,
          remoteId: `sg-live-${Date.now()}`,
          serverSeq: cfg.stats.sentLive,
          routeUsed: `live-signal (${cfg.endpoint})`,
          rttMs: Math.round(performance.now() - started),
          signed: true,
        };
      }

      // 9. Универсальный HTTP Webhook-мост (подходит для локальных шлюзов, n8n, WeChat, LINE, KakaoTalk, Zalo)
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

  function startMaxPolling(cfg) {
    cfg.pollTimer = setInterval(async () => {
      try {
        const token = cfg.getSecret();
        if (!token || !cfg.enabled) return;
        const qs = new URLSearchParams({ timeout: '5', limit: '25' });
        if (cfg.lastMarker != null) qs.set('marker', String(cfg.lastMarker));
        const url = `${cfg.endpoint.replace(/\/$/, '')}/updates?${qs.toString()}`;
        const res = await fetch(url, { headers: { Authorization: token } });
        const json = await res.json();
        if (json.marker != null) cfg.lastMarker = json.marker;
        if (!Array.isArray(json.updates)) return;
        for (const upd of json.updates) {
          if (upd.update_type === 'message_created' || upd.message) {
            await ingestWebhook('max', upd);
          }
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

    if (net === 'max' && (payload.message || payload.body)) {
      const m = payload.message || payload;
      const cid = m.recipient?.chat_id ?? m.chat_id ?? 'live';
      chatId = `max-${cid}`;
      chatTitle = m.recipient?.chat_title || m.sender?.name || `MAX · чат ${cid}`;
      senderName = m.sender?.name || (m.sender?.username ? `@${m.sender.username}` : 'MAX');
      text = m.body?.text || m.text || '[вложение MAX]';
      msgId = m.body?.mid ? `max-in-${m.body.mid}` : null;
    } else if (net === 'telegram' && payload.message) {
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
    } else if (net === 'whatsapp' && payload.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
      const m = payload.entry[0].changes[0].value.messages[0];
      chatId = `wa-${m.from || 'live'}`;
      chatTitle = `WhatsApp · ${m.from || 'Live'}`;
      senderName = m.from || 'WhatsApp';
      text = m.text?.body || '[медиа WhatsApp]';
      msgId = m.id ? `wa-in-${m.id}` : null;
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
    testBridge,
    getStatus,
    listStatuses,
    ingestWebhook,
    closeAll,
  };
}

function defaultKindFor(net) {
  if (['max', 'telegram', 'discord', 'matrix', 'vk', 'whatsapp', 'viber', 'signal'].includes(net)) {
    return net;
  }
  return 'webhook';
}

function defaultEndpointFor(kind) {
  if (kind === 'max') return 'https://platform-api.max.ru';
  if (kind === 'telegram') return 'https://api.telegram.org';
  if (kind === 'vk') return 'https://api.vk.com';
  if (kind === 'matrix') return 'https://matrix-client.matrix.org';
  if (kind === 'whatsapp') return 'https://graph.facebook.com/v21.0';
  if (kind === 'viber') return 'https://chatapi.viber.com';
  return '';
}
