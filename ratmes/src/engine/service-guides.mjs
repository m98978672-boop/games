// Пошаговые инструкции, актуальные протоколы API 2026 и пресеты подключения для всех мессенджеров в RatMes.
// Чистый декларативный модуль без сетевых вызовов (TransferGuard RM-107).

export const SERVICE_GUIDES = Object.freeze([
  Object.freeze({
    id: 'max',
    name: 'MAX',
    short: 'MX',
    group: 'ru',
    color: '#8b5cf6',
    featured: true,
    difficulty: '2 мин',
    protocolLabel: 'MAX Bot API v2 (platform-api2.max.ru)',
    driverKind: 'max',
    supportsPolling: true,
    hideEndpointByDefault: true,
    directBrowserHint: 'Для MAX Bot API (platform-api2.max.ru) рекомендуем ПК-агент RatMes Agent: он обходит CORS, принимает входящие (Long Polling) и при необходимости работает с сертификатом Минцифры.',
    defaultEndpoint: 'https://platform-api2.max.ru',
    webAppUrl: 'https://web.max.ru/',
    docsUrl: 'https://dev.max.ru/docs-api',
    e2eeWarning: 'MAX не использует сквозное шифрование E2EE (RM-603). Для секретной переписки выбирай родной RatMes.',
    summary: 'Российский мессенджер (прямой доступ в РФ без VPN). Подключается через официальный MAX Bot API 2026 (домен platform-api2.max.ru, заголовок Authorization).',
    webhookPath: '/api/hooks/max',
    presets: Object.freeze([
      { id: 'max', label: '🤖 Официальный MAX Bot API', endpoint: 'https://platform-api2.max.ru', hint: 'Домен platform-api2.max.ru (актуально с июля 2026), токен от @MasterBot в заголовке Authorization.' },
      { id: 'webhook', label: '🔗 Свой Webhook-шлюз (n8n / мост)', endpoint: '', hint: 'Отправка и приём через твой собственный HTTP-мост.' },
    ]),
    fields: Object.freeze({
      showEndpoint: true,
      endpointLabel: 'Домен MAX Bot API (актуально: platform-api2.max.ru)',
      endpointPlaceholder: 'https://platform-api2.max.ru',
      showTargetId: true,
      targetLabel: 'ID чата или пользователя (chat_id / user:12345)',
      targetPlaceholder: 'Например: -70123456789 или user:123456',
      showToken: true,
      tokenLabel: 'Токен бота MAX (access_token от @MasterBot)',
      tokenPlaceholder: 'Вставь токен из @MasterBot / MAX для партнёров',
    }),
    steps: Object.freeze([
      'Открой MAX на телефоне или web.max.ru, найди официального бота @MasterBot (или кабинет dev.max.ru) и создай бота.',
      'Скопируй выданный access_token и вставь его в поле «Токен бота MAX» ниже (передаётся строго в заголовке Authorization).',
      'Напиши своему боту в MAX или добавь его в нужный чат, затем нажми «🔍 Проверить токен» — RatMes проверит GET /me и сам покажет chat_id из /updates кнопкой.',
      'Оставь включённым «Автоприём входящих (Long Polling)», нажми «✉ Тест в чат» для проверки и затем «✅ Подключить MAX».',
    ]),
  }),

  Object.freeze({
    id: 'telegram',
    name: 'Telegram',
    short: 'TG',
    group: 'ru',
    color: '#38bdf8',
    featured: true,
    difficulty: '2 мин',
    protocolLabel: 'Telegram Bot API (getUpdates + sendMessage)',
    driverKind: 'telegram',
    supportsPolling: true,
    hideEndpointByDefault: true,
    directBrowserHint: 'Telegram Bot API часто работает даже напрямую с телефона; через ПК-агент добавляется автоприём входящих (Long Polling) и локальный архив.',
    defaultEndpoint: 'https://api.telegram.org',
    webAppUrl: 'https://web.telegram.org/',
    docsUrl: 'https://core.telegram.org/bots/api',
    summary: 'Двустороннее подключение через официальный Telegram Bot API с автопоиском chat_id, проверкой старых webhook-ов и Long Polling.',
    webhookPath: '/api/hooks/telegram',
    presets: Object.freeze([
      { id: 'telegram', label: '✈ Официальный Bot API (@BotFather)', endpoint: 'https://api.telegram.org', hint: 'Автопоиск chat_id, проверка getMe + getWebhookInfo и Long Polling.' },
      { id: 'webhook', label: '🔗 Свой прокси / Webhook-шлюз', endpoint: '', hint: 'Укажи собственный прокси-сервер или шлюз n8n.' },
    ]),
    fields: Object.freeze({
      showEndpoint: true,
      endpointLabel: 'Адрес Telegram Bot API (или свой прокси)',
      endpointPlaceholder: 'https://api.telegram.org',
      showTargetId: true,
      targetLabel: 'Chat ID (куда отправлять сообщения)',
      targetPlaceholder: 'Нажми «Проверить токен» — найдётся автоматически',
      showToken: true,
      tokenLabel: 'Bot Token от @BotFather',
      tokenPlaceholder: '123456789:AAHxxxxxxxxxxxxxxxxxxxxxxxx',
    }),
    steps: Object.freeze([
      'Открой @BotFather в Telegram, отправь /newbot, задай имя бота и скопируй Bot Token.',
      'Открой своего нового бота и нажми «Запустить» (отправь ему любое слово «привет»).',
      'Вставь токен ниже и нажми «🔍 Проверить токен» — RatMes проверит бота и покажет найденные чаты кнопками для подстановки chat_id.',
      'Если в твоей стране Telegram требует VPN — привяжи VPN-маршрут, проверь «✉ Тест в чат» и нажми «✅ Подключить Telegram».',
    ]),
  }),

  Object.freeze({
    id: 'discord',
    name: 'Discord',
    short: 'DC',
    group: 'ru',
    color: '#818cf8',
    featured: true,
    difficulty: '30 сек',
    protocolLabel: 'Discord Channel Webhook (1 ссылка)',
    driverKind: 'discord',
    supportsPolling: false,
    hideEndpointByDefault: false,
    directBrowserHint: 'Самый быстрый способ: достаточно одной ссылки Webhook из настроек канала Discord — без токенов и ботов.',
    defaultEndpoint: '',
    webAppUrl: 'https://discord.com/app',
    docsUrl: 'https://discord.com/developers/docs/resources/webhook',
    summary: 'Мгновенное подключение к любому каналу Discord: нужна всего одна ссылка Webhook, без регистрации бота.',
    webhookPath: '/api/hooks/discord',
    presets: Object.freeze([
      { id: 'discord', label: '🎮 Discord Channel Webhook (1 ссылка)', endpoint: '', hint: 'Скопируй URL вебхука из настроек канала → Интеграции → Вебхуки.' },
      { id: 'webhook', label: '🔗 Свой Webhook-шлюз / бот', endpoint: '', hint: 'Промежуточный сервер для двустороннего обмена.' },
    ]),
    fields: Object.freeze({
      showEndpoint: true,
      endpointLabel: 'Ссылка Discord Webhook URL',
      endpointPlaceholder: 'https://discord.com/api/webhooks/123456789/abcdef...',
      showTargetId: false,
      targetLabel: 'ID канала (определится сам)',
      targetPlaceholder: '',
      showToken: false,
      tokenLabel: 'Токен (уже встроен в ссылку Webhook)',
      tokenPlaceholder: '',
    }),
    steps: Object.freeze([
      'Открой Discord → Настройки нужного текстового канала (шестерёнка) → «Интеграции» → «Вебхуки».',
      'Нажми «Новый вебхук» → «Копировать URL вебхука».',
      'Вставь ссылку в поле ниже → нажми «🔍 Проверить» → «✉ Тест в чат» → «✅ Подключить Discord».',
    ]),
  }),

  Object.freeze({
    id: 'vk',
    name: 'VK Мессенджер',
    short: 'VK',
    group: 'ru',
    color: '#3b82f6',
    featured: true,
    difficulty: '3 мин',
    protocolLabel: 'VK Messages API v5.199 + Callback API',
    driverKind: 'vk',
    supportsPolling: false,
    hideEndpointByDefault: true,
    directBrowserHint: 'Прямой доступ в РФ без VPN. Из-за ограничений CORS VK API требуется запущенный ПК-агент RatMes Agent.',
    defaultEndpoint: 'https://api.vk.com',
    webAppUrl: 'https://vk.com/im',
    docsUrl: 'https://dev.vk.com/ru/api/bots/getting-started',
    summary: 'Прямой доступ в РФ без VPN. Отправка через VK Messages API (v5.199), входящие через Callback API (/api/hooks/vk).',
    webhookPath: '/api/hooks/vk',
    presets: Object.freeze([
      { id: 'vk', label: '💬 VK API сообщества (v5.199)', endpoint: 'https://api.vk.com', hint: 'Ключ доступа сообщества с правом messages + peer_id диалога или беседы.' },
      { id: 'webhook', label: '🔗 Свой Callback / Webhook-мост', endpoint: '', hint: 'Подходит для n8n или своего бота.' },
    ]),
    fields: Object.freeze({
      showEndpoint: true,
      endpointLabel: 'Адрес VK API',
      endpointPlaceholder: 'https://api.vk.com',
      showTargetId: true,
      targetLabel: 'peer_id пользователя или беседы',
      targetPlaceholder: 'ID пользователя (напр. 12345678) или беседа 2000000001',
      showToken: true,
      tokenLabel: 'Ключ доступа сообщества (access_token с правом messages)',
      tokenPlaceholder: 'vk1.a.xxxxxxxxxxxxxxxxxxxx',
    }),
    steps: Object.freeze([
      'Открой своё сообщество VK → Управление → Настройки → Работа с API → «Создать ключ».',
      'Включи разрешение «Доступ к сообщениям сообщества» и скопируй ключ (начинается с vk1.a....).',
      'Вставь ключ и peer_id получателя, нажми «🔍 Проверить токен» (проверит имя сообщества) и «✅ Подключить VK».',
      'Для входящих сообщений в разделе «Callback API» укажи адрес вебхука /api/hooks/vk.',
    ]),
  }),

  Object.freeze({
    id: 'whatsapp',
    name: 'WhatsApp',
    short: 'WA',
    group: 'ru',
    color: '#4ade80',
    featured: true,
    difficulty: '5 мин',
    protocolLabel: 'WhatsApp Cloud API / шлюз Evolution',
    driverKind: 'whatsapp',
    supportsPolling: false,
    hideEndpointByDefault: false,
    directBrowserHint: 'Выбери официальный Meta Cloud API либо простой шлюз для личного номера (Evolution API / WAHA / Green-API / n8n).',
    defaultEndpoint: 'https://graph.facebook.com/v21.0/PHONE_NUMBER_ID/messages',
    webAppUrl: 'https://web.whatsapp.com/',
    docsUrl: 'https://developers.facebook.com/docs/whatsapp/cloud-api',
    summary: 'Два способа подключения: официальный WhatsApp Cloud API (Meta) или шлюз для личного номера (Evolution API / WAHA / n8n).',
    webhookPath: '/api/hooks/whatsapp',
    presets: Object.freeze([
      { id: 'whatsapp', label: '🏢 Официальный WhatsApp Cloud API', endpoint: 'https://graph.facebook.com/v21.0/PHONE_NUMBER_ID/messages', hint: 'Укажи свой PHONE_NUMBER_ID в адресе, Permanent Token и номер получателя.' },
      { id: 'webhook', label: '📱 Шлюз личного номера (Evolution / WAHA / n8n)', endpoint: '', hint: 'Подключи собственный шлюз, привязанный по QR-коду к личному WhatsApp.' },
    ]),
    fields: Object.freeze({
      showEndpoint: true,
      endpointLabel: 'URL Cloud API (замени PHONE_NUMBER_ID) или URL шлюза',
      endpointPlaceholder: 'https://graph.facebook.com/v21.0/10987654321/messages',
      showTargetId: true,
      targetLabel: 'Номер получателя (международный формат)',
      targetPlaceholder: '+7 999 123-45-67 (формат очистится сам)',
      showToken: true,
      tokenLabel: 'Access Token (Meta / ключ шлюза)',
      tokenPlaceholder: 'EAAGxxxxxxxxxxxxxxxxxxxx',
    }),
    steps: Object.freeze([
      'Если ты в РФ — сначала привяжи VPN-маршрут кнопкой выше (иначе WhatsApp задержится в Outbox с кодом RM-301).',
      'Выбери режим: «Официальный Cloud API» (из кабинета Meta developers.facebook.com) или «Шлюз личного номера» (Evolution API / WAHA / Green-API / n8n).',
      'Вставь URL, токен и номер получателя (лишние символы «+», пробелы и скобки уберутся автоматически).',
      'Нажми «🔍 Проверить» → «✅ Подключить WhatsApp».',
    ]),
  }),

  Object.freeze({
    id: 'matrix',
    name: 'Matrix / Element',
    short: 'MXT',
    group: 'global',
    color: '#34d399',
    featured: false,
    difficulty: '2 мин',
    protocolLabel: 'Matrix Client-Server API v3',
    driverKind: 'matrix',
    supportsPolling: false,
    hideEndpointByDefault: false,
    directBrowserHint: 'Большинство Matrix homeserver-ов поддерживают CORS — работает даже напрямую с телефона!',
    defaultEndpoint: 'https://matrix-client.matrix.org',
    webAppUrl: 'https://app.element.io/',
    docsUrl: 'https://spec.matrix.org/latest/client-server-api/',
    summary: 'Открытый федеративный мессенджер (Element, Cinny, собственный сервер Synapse / Conduit).',
    webhookPath: '/api/hooks/matrix',
    presets: Object.freeze([
      { id: 'matrix', label: '🟢 Matrix Homeserver (Element)', endpoint: 'https://matrix-client.matrix.org', hint: 'Укажи свой homeserver, Room ID (!room:domain) и Access Token.' },
    ]),
    fields: Object.freeze({
      showEndpoint: true,
      endpointLabel: 'Адрес Homeserver',
      endpointPlaceholder: 'https://matrix-client.matrix.org',
      showTargetId: true,
      targetLabel: 'Внутренний ID комнаты (Room ID)',
      targetPlaceholder: '!abcdef123456:matrix.org',
      showToken: true,
      tokenLabel: 'Access Token (Element → Настройки → Справка)',
      tokenPlaceholder: 'syt_xxxxxxxxxxxxxxxxxxxx',
    }),
    steps: Object.freeze([
      'Открой Element (app.element.io) → Настройки → «Справка и сведения» → скопируй Access Token.',
      'В нужной комнате открой Настройки → «Дополнительно» → скопируй Внутренний ID (!...:matrix.org).',
      'Нажми «🔍 Проверить токен» (проверит /account/whoami) → «✅ Подключить Matrix».',
    ]),
  }),

  Object.freeze({
    id: 'viber',
    name: 'Viber',
    short: 'VB',
    group: 'ru',
    color: '#a855f7',
    featured: false,
    difficulty: '3 мин',
    protocolLabel: 'Viber REST Bot API',
    driverKind: 'viber',
    supportsPolling: false,
    hideEndpointByDefault: true,
    directBrowserHint: 'Отправка идёт через Viber Bot API (X-Viber-Auth-Token) через ПК-агент.',
    defaultEndpoint: 'https://chatapi.viber.com',
    webAppUrl: 'https://www.viber.com/',
    docsUrl: 'https://developers.viber.com/docs/api/rest-bot-api/',
    summary: 'Подключение через Viber Bot API (заголовок X-Viber-Auth-Token) и входящие на /api/hooks/viber.',
    webhookPath: '/api/hooks/viber',
    presets: Object.freeze([
      { id: 'viber', label: '📞 Viber REST Bot API', endpoint: 'https://chatapi.viber.com', hint: 'Auth Token из partners.viber.com и Receiver ID.' },
    ]),
    fields: Object.freeze({
      showEndpoint: true,
      endpointLabel: 'Адрес Viber API',
      endpointPlaceholder: 'https://chatapi.viber.com',
      showTargetId: true,
      targetLabel: 'Receiver ID получателя',
      targetPlaceholder: '01234567890A=',
      showToken: true,
      tokenLabel: 'Auth Token бота Viber',
      tokenPlaceholder: '445da6az1s345z78-...',
    }),
    steps: Object.freeze([
      'Создай бота на partners.viber.com и скопируй Auth Token.',
      'Привяжи VPN-маршрут (если нужно в твоей стране), вставь Auth Token и Receiver ID.',
      'Для входящих сообщений укажи webhook /api/hooks/viber.',
    ]),
  }),

  Object.freeze({
    id: 'signal',
    name: 'Signal',
    short: 'SG',
    group: 'ru',
    color: '#60a5fa',
    featured: false,
    difficulty: 'Локальный мост',
    protocolLabel: 'signal-cli REST API (PQXDH)',
    driverKind: 'signal',
    supportsPolling: false,
    hideEndpointByDefault: false,
    directBrowserHint: 'Работает через твой собственный Docker-контейнер signal-cli-rest-api — ключи E2EE остаются только у тебя.',
    defaultEndpoint: 'http://192.168.1.10:8080',
    webAppUrl: 'https://signal.org/',
    docsUrl: 'https://github.com/bbernhard/signal-cli-rest-api',
    summary: 'Приватный мост к Signal через собственный локальный шлюз signal-cli-rest-api (POST /v2/send).',
    webhookPath: '/api/hooks/signal',
    presets: Object.freeze([
      { id: 'signal', label: '🛡 signal-cli REST API (Docker)', endpoint: 'http://192.168.1.10:8080', hint: 'Твой локальный шлюз, привязанный по QR-коду к приложению Signal.' },
    ]),
    fields: Object.freeze({
      showEndpoint: true,
      endpointLabel: 'Адрес твоего signal-cli-rest-api',
      endpointPlaceholder: 'http://192.168.1.10:8080',
      showTargetId: true,
      targetLabel: 'Номера: отправитель,получатель',
      targetPlaceholder: '+79990001122,+79993334455',
      showToken: false,
      tokenLabel: 'Bearer-ключ прокси (необязательно)',
      tokenPlaceholder: '',
    }),
    steps: Object.freeze([
      'Запусти контейнер bbernhard/signal-cli-rest-api дома и отсканируй QR-код в приложении Signal.',
      'Укажи адрес шлюза (например http://192.168.1.10:8080) и пару номеров «отправитель,получатель».',
      'Нажми «✅ Подключить Signal».',
    ]),
  }),

  Object.freeze({
    id: 'wechat',
    name: 'WeChat',
    short: 'WC',
    group: 'global',
    color: '#4ade80',
    featured: false,
    difficulty: 'Webhook',
    protocolLabel: 'WeCom / Webhook-шлюз',
    driverKind: 'webhook',
    supportsPolling: false,
    hideEndpointByDefault: false,
    directBrowserHint: 'Подключается через WeCom Group Bot Webhook или мост Wechaty / n8n.',
    defaultEndpoint: '',
    webAppUrl: 'https://www.wechat.com/',
    docsUrl: 'https://developers.weixin.qq.com/doc/',
    summary: 'Интеграция через Webhook-бот WeCom / WeChat Official Account или мост Wechaty.',
    webhookPath: '/api/hooks/wechat',
    presets: Object.freeze([
      { id: 'webhook', label: '🔗 WeCom / Wechaty Webhook', endpoint: '', hint: 'Вставь URL группового бота WeCom или своего шлюза.' },
    ]),
    fields: Object.freeze({
      showEndpoint: true,
      endpointLabel: 'URL Webhook-шлюза WeChat / WeCom',
      endpointPlaceholder: 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=...',
      showTargetId: true,
      targetLabel: 'ID чата / тег (необязательно)',
      targetPlaceholder: 'wechat-main',
      showToken: true,
      tokenLabel: 'Bearer / секрет шлюза (если нужен)',
      tokenPlaceholder: '',
    }),
    steps: Object.freeze([
      'Создай группового бота в WeCom (или подними мост Wechaty / n8n) и скопируй Webhook URL.',
      'Вставь адрес ниже и нажми «✅ Подключить WeChat».',
    ]),
  }),

  Object.freeze({
    id: 'line',
    name: 'LINE',
    short: 'LN',
    group: 'global',
    color: '#22c55e',
    featured: false,
    difficulty: 'Messaging API',
    protocolLabel: 'LINE Messaging API / Webhook',
    driverKind: 'webhook',
    supportsPolling: false,
    hideEndpointByDefault: false,
    directBrowserHint: 'Подключается через LINE Developers Messaging API или шлюз Webhook.',
    defaultEndpoint: 'https://api.line.me/v2/bot/message/push',
    webAppUrl: 'https://line.me/',
    docsUrl: 'https://developers.line.biz/en/docs/messaging-api/',
    summary: 'Подключение через LINE Developers Messaging API или собственный шлюз.',
    webhookPath: '/api/hooks/line',
    presets: Object.freeze([
      { id: 'webhook', label: '💬 LINE Messaging API / шлюз', endpoint: 'https://api.line.me/v2/bot/message/push', hint: 'Channel Access Token и LINE User/Group ID.' },
    ]),
    fields: Object.freeze({
      showEndpoint: true,
      endpointLabel: 'URL LINE API / шлюза',
      endpointPlaceholder: 'https://api.line.me/v2/bot/message/push',
      showTargetId: true,
      targetLabel: 'LINE User / Group ID',
      targetPlaceholder: 'U4af4980629...',
      showToken: true,
      tokenLabel: 'Channel Access Token',
      tokenPlaceholder: '',
    }),
    steps: Object.freeze([
      'В LINE Developers Console создай канал Messaging API и выпусти Channel Access Token.',
      'Вставь User/Group ID и нажми «✅ Подключить LINE».',
    ]),
  }),

  Object.freeze({
    id: 'kakaotalk',
    name: 'KakaoTalk',
    short: 'KT',
    group: 'global',
    color: '#facc15',
    featured: false,
    difficulty: 'Webhook',
    protocolLabel: 'Kakao REST / Webhook-шлюз',
    driverKind: 'webhook',
    supportsPolling: false,
    hideEndpointByDefault: false,
    directBrowserHint: 'Подключается через Kakao Developers / Webhook-шлюз.',
    defaultEndpoint: '',
    webAppUrl: 'https://www.kakaocorp.com/page/service/service/KakaoTalk',
    docsUrl: 'https://developers.kakao.com/docs/latest/en/message/rest-api',
    summary: 'Подключение через Kakao Developers API или локальный шлюз Webhook.',
    webhookPath: '/api/hooks/kakaotalk',
    presets: Object.freeze([
      { id: 'webhook', label: '💛 Kakao Webhook-шлюз', endpoint: '', hint: 'Укажи адрес своего шлюза и Access Token.' },
    ]),
    fields: Object.freeze({
      showEndpoint: true,
      endpointLabel: 'URL Webhook-шлюза KakaoTalk',
      endpointPlaceholder: 'https://your-gateway.example/kakao',
      showTargetId: true,
      targetLabel: 'ID канала / чата',
      targetPlaceholder: 'kakao-room',
      showToken: true,
      tokenLabel: 'Access Token / секрет',
      tokenPlaceholder: '',
    }),
    steps: Object.freeze([
      'Настрой приложение в Kakao Developers (или шлюз n8n) и скопируй адрес Webhook.',
      'Вставь данные ниже и нажми «✅ Подключить KakaoTalk».',
    ]),
  }),

  Object.freeze({
    id: 'zalo',
    name: 'Zalo',
    short: 'ZL',
    group: 'global',
    color: '#0068ff',
    featured: false,
    difficulty: 'Zalo OA API',
    protocolLabel: 'Zalo Official Account API',
    driverKind: 'webhook',
    supportsPolling: false,
    hideEndpointByDefault: false,
    directBrowserHint: 'Подключается через Zalo Official Account API / Webhook-шлюз.',
    defaultEndpoint: 'https://openapi.zalo.me/v3.0/oa/message/cs',
    webAppUrl: 'https://chat.zalo.me/',
    docsUrl: 'https://developers.zalo.me/docs/official-account',
    summary: 'Подключение через Zalo Official Account API или шлюз Webhook.',
    webhookPath: '/api/hooks/zalo',
    presets: Object.freeze([
      { id: 'webhook', label: '💙 Zalo OA API / шлюз', endpoint: 'https://openapi.zalo.me/v3.0/oa/message/cs', hint: 'OA Access Token и Zalo User ID.' },
    ]),
    fields: Object.freeze({
      showEndpoint: true,
      endpointLabel: 'URL Zalo OA API / шлюза',
      endpointPlaceholder: 'https://openapi.zalo.me/v3.0/oa/message/cs',
      showTargetId: true,
      targetLabel: 'Zalo User ID',
      targetPlaceholder: '',
      showToken: true,
      tokenLabel: 'OA Access Token',
      tokenPlaceholder: '',
    }),
    steps: Object.freeze([
      'В Zalo Developers создай Official Account и выпусти OA Access Token.',
      'Вставь User ID и нажми «✅ Подключить Zalo».',
    ]),
  }),
]);

export function getServiceGuide(networkId) {
  const id = String(networkId || '').toLowerCase();
  return SERVICE_GUIDES.find((g) => g.id === id) || SERVICE_GUIDES[0];
}

export function listServiceGuides() {
  return SERVICE_GUIDES;
}

// Умная очистка и предварительная валидация введённых полей (помогает избежать опечаток)
export function sanitizeBridgeInput({ kind, endpoint = '', targetId = '', secretToken = '' } = {}) {
  const k = String(kind || 'webhook').toLowerCase();
  let ep = String(endpoint || '').trim();
  let tok = String(secretToken || '').trim();
  let tid = String(targetId || '').trim();

  // Убираем случайный префикс "Bearer " или "Authorization: "
  tok = tok.replace(/^Authorization:\s*/i, '').replace(/^Bearer\s+/i, '').trim();
  // Для Telegram: если пользователь вставил "bot123456:AAH...", убираем лишнее "bot"
  if (k === 'telegram') {
    tok = tok.replace(/^bot(?=\d+:)/i, '');
  }
  // Для Discord: если пользователь вставил Webhook URL в поле токена, переносим в endpoint
  if (k === 'discord' && !ep && /^https:\/\/(discord|discordapp)\.com\/api\/webhooks\//i.test(tok)) {
    ep = tok;
    tok = '';
  }
  // Для MAX: автоматически обновляем устаревший домен platform-api.max.ru -> platform-api2.max.ru
  if (k === 'max' && /^https?:\/\/platform-api\.max\.ru\/?$/i.test(ep)) {
    ep = 'https://platform-api2.max.ru';
  }
  // Для WhatsApp: очищаем форматирование номера телефона
  if (k === 'whatsapp' && tid && /^[\d+\s()-]+$/.test(tid)) {
    tid = tid.replace(/[^\d]/g, '');
  }

  return { kind: k, endpoint: ep, targetId: tid, secretToken: tok };
}
