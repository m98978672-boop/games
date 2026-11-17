// Облачный узел экосистемы RatMes в портале Games (вкладка «Общение»).
// Содержит ТОЛЬКО публичные метаданные подключённых сервисов и publishable-ключ Supabase
// (секретные ключи и приватные OAuth-токены никогда не хранятся в клиентском коде).
// Модуль чистый и детерминированный: не выполняет прямых сетевых вызовов (TransferGuard RM-107).

export const SUPABASE_PUBLIC_CONFIG = Object.freeze({
  projectRef: 'cuhfnzgytndyntpbnbda',
  projectName: 'games-cloud-save',
  region: 'eu-central-1',
  url: 'https://cuhfnzgytndyntpbnbda.supabase.co',
  restUrl: 'https://cuhfnzgytndyntpbnbda.supabase.co/rest/v1',
  publishableKey: 'sb_publishable_e_wAa_4GG_81zYOcpGE1-A_j6iNnoKn',
  tables: Object.freeze({
    rooms: 'ratmes_rooms',
    messages: 'ratmes_messages',
    presence: 'ratmes_presence',
    cloudLinks: 'ratmes_cloud_links',
  }),
});

export const GAMES_CHAT_ROOMS = Object.freeze([
  Object.freeze({
    chatId: 'games-lobby',
    network: 'ratmes',
    title: '🎮 Общий чат Games',
    description: 'Главный канал игроков портала Games с облачной синхронизацией Supabase',
    cloudSynced: true,
    starterMessages: [
      {
        author: 'Games Bot',
        text: 'Добро пожаловать во вкладку «Общение» портала Games! Здесь работает RatMes: локальный файловый резерв RatMes-Vault/, облачная синхронизация Supabase (games-cloud-save) и подключённые облачные сервисы.',
      },
      {
        author: 'Алексей (Dead District)',
        text: 'Кто-нибудь пробовал выживать 7 ночей в Dead District или строить каскад ГЭС в «Каскаде»? Кидайте скриншоты и советы сюда!',
      },
    ],
  }),
  Object.freeze({
    chatId: 'games-coop',
    network: 'ratmes',
    title: '🤝 Кооператив и напарники',
    description: 'Поиск команды, обсуждение стратегий Frontline: Command, Ратград, Last Shore и PLAYBRIDGE',
    cloudSynced: true,
    starterMessages: [
      {
        author: 'Мария (Ратград)',
        text: 'Собрала связную сеть всех 120 поселений и 4 паромов в Ратграде. Можно кинуть файл маршрута прямо через RatMes с докачкой RM-302!',
      },
    ],
  }),
  Object.freeze({
    chatId: 'games-dev',
    network: 'ratmes',
    title: '🛠 Разработчики Games',
    description: 'Идеи новых браузерных игр, баг-репорты, задачи Linear GAM-5..7 и документация Notion/Docs',
    cloudSynced: true,
    starterMessages: [
      {
        author: 'Максим (Gamebobli)',
        text: 'Задачи по RatMes и вкладке «Общение» заведены в Linear (GAM-5, GAM-6, GAM-7), ТЗ и матрица стран лежат в Google Drive, Dropbox, Notion, Docs и Sheets.',
      },
    ],
  }),
]);

export const CONNECTED_CLOUD_SERVICES = Object.freeze([
  Object.freeze({
    id: 'supabase',
    name: 'Supabase',
    category: 'БД и Realtime-синхронизация',
    status: 'connected',
    resourceName: 'games-cloud-save (eu-central-1)',
    resourceId: 'cuhfnzgytndyntpbnbda',
    url: 'https://supabase.com/dashboard/project/cuhfnzgytndyntpbnbda',
    role: 'Живые комнаты, сообщения, присутствие игроков и реестр облаков вкладки «Общение» (publishable key + RLS)',
  }),
  Object.freeze({
    id: 'google_drive',
    name: 'Google Drive',
    category: 'Облачный резерв RatMes-Vault',
    status: 'connected',
    resourceName: 'RatMes-Vault (Games Общение)',
    resourceId: '1tQi82o2fHBMpBDq-0Zg5hSM4DkLOANxB',
    url: 'https://drive.google.com/drive/folders/1tQi82o2fHBMpBDq-0Zg5hSM4DkLOANxB',
    role: 'Папка резервного копирования RatMes-Vault, загружены ratmes-tz.md и ratmes-tools.md',
  }),
  Object.freeze({
    id: 'dropbox',
    name: 'Dropbox',
    category: 'Второй облачный резерв',
    status: 'connected',
    resourceName: '/RatMes-Vault',
    resourceId: 'id:5evzGBn_APMAAAAAAAAABQ',
    url: 'https://www.dropbox.com/home/RatMes-Vault',
    role: 'Зеркальный резерв документации и архивов переписки (ratmes-tz.md, ratmes-tools.md)',
  }),
  Object.freeze({
    id: 'notion',
    name: 'Notion',
    category: 'Центр управления',
    status: 'connected',
    resourceName: 'RatMes — Центр управления (Games · Общение)',
    resourceId: '41b5c620-35e4-8187-8f46-e7c171e6fd09',
    url: 'https://app.notion.com/p/RatMes-Games-41b5c62035e481878f46e7c171e6fd09',
    role: 'База знаний, архитектура 15 веток инструментов и сводка ссылок экосистемы',
  }),
  Object.freeze({
    id: 'linear',
    name: 'Linear',
    category: 'Трекер разработки',
    status: 'connected',
    resourceName: 'RatMes · Общение в Games (GAM-5, GAM-6, GAM-7)',
    resourceId: '0ab5a4c9-6704-403c-b94f-fc031b6488f9',
    url: 'https://linear.app/gamebobli/issue/GAM-6/podklyuchit-oblachnuyu-sinhronizaciyu-supabase-dlya-vkladki-obshenie-v',
    role: 'Проект команды Gamebobli и отслеживаемые задачи по синхронизации и бэкапам',
  }),
  Object.freeze({
    id: 'google_docs',
    name: 'Google Docs',
    category: 'Технический документ',
    status: 'connected',
    resourceName: 'RatMes — Архитектура мессенджера в Games (Общение)',
    resourceId: '1VOo2S1G5Q4NU-gM87zdEdy0uhIVkJ4-emWveXL5OwTM',
    url: 'https://docs.google.com/document/d/1VOo2S1G5Q4NU-gM87zdEdy0uhIVkJ4-emWveXL5OwTM/edit',
    role: 'Подробный документ по TransferGuard, RatMes-Vault и облачному стеку',
  }),
  Object.freeze({
    id: 'google_sheets',
    name: 'Google Sheets',
    category: 'Реестр сетей и инструментов',
    status: 'connected',
    resourceName: 'RatMes — Реестр сетей, стран и 14+ веток инструментов',
    resourceId: '1hrJnWI0YjM9RWzMX0ORYF46Xaz_Y-NeaGZ2y9xQ23QM',
    url: 'https://docs.google.com/spreadsheets/d/1hrJnWI0YjM9RWzMX0ORYF46Xaz_Y-NeaGZ2y9xQ23QM/edit',
    role: 'Таблица матрицы стран 2026 (RU/мир) и полного каталога RatMes.tools.*',
  }),
  Object.freeze({
    id: 'google_calendar',
    name: 'Google Calendar',
    category: 'Контроль релиза',
    status: 'connected',
    resourceName: 'RatMes v1.0 · Проверка синхронизации «Общение» в Games',
    resourceId: 'mi5dnk3ss47csbdgh4girdf0qo',
    url: 'https://www.google.com/calendar/event?eid=bWk1ZG5rM3NzNDdjc2JkZ2g0Z2lyZGYwcW8gbTk4OTc4NjcyQG0',
    role: 'Запланированная веха проверки синхронизации и резервных копий (UTC)',
  }),
  Object.freeze({
    id: 'gmail',
    name: 'Gmail',
    category: 'Сводка экосистемы',
    status: 'connected',
    resourceName: 'Черновик сводки подключённых сервисов (m98978672@gmail.com)',
    resourceId: 'r-7359848319671787649',
    url: 'https://mail.google.com/mail/u/0/#drafts',
    role: 'Готовый черновик-шпаргалка со всеми ссылками (без автоотправки)',
  }),
]);

export function createCloudHub({ core }) {
  const syncState = {
    supabaseReachable: null,
    lastSyncAt: null,
    pulledCount: 0,
    pushedCount: 0,
    onlinePeers: [],
    lastError: null,
    syncRounds: 0,
    displayName: 'Игрок Games',
  };

  function getStatus() {
    return {
      totalConnected: CONNECTED_CLOUD_SERVICES.length,
      services: CONNECTED_CLOUD_SERVICES.map((s) => ({ ...s })),
      supabase: {
        projectRef: SUPABASE_PUBLIC_CONFIG.projectRef,
        projectName: SUPABASE_PUBLIC_CONFIG.projectName,
        region: SUPABASE_PUBLIC_CONFIG.region,
        url: SUPABASE_PUBLIC_CONFIG.url,
        tables: { ...SUPABASE_PUBLIC_CONFIG.tables },
        reachable: syncState.supabaseReachable,
        lastSyncAt: syncState.lastSyncAt,
        pulledCount: syncState.pulledCount,
        pushedCount: syncState.pushedCount,
        syncRounds: syncState.syncRounds,
        onlinePeersCount: syncState.onlinePeers.length,
        onlinePeers: syncState.onlinePeers.slice(0, 24),
        lastError: syncState.lastError,
      },
      displayName: syncState.displayName,
      gamesRooms: GAMES_CHAT_ROOMS.map((r) => ({
        chatId: r.chatId,
        network: r.network,
        title: r.title,
        description: r.description,
        cloudSynced: r.cloudSynced,
      })),
    };
  }

  function recordSync({
    reachable = true,
    pulled = 0,
    pushed = 0,
    onlinePeers = null,
    error = null,
    at = null,
  } = {}) {
    syncState.supabaseReachable = Boolean(reachable);
    syncState.lastSyncAt = at || new Date().toISOString();
    syncState.pulledCount += Math.max(0, Number(pulled) || 0);
    syncState.pushedCount += Math.max(0, Number(pushed) || 0);
    syncState.syncRounds += 1;
    syncState.lastError = error ? String(error) : null;
    if (Array.isArray(onlinePeers)) {
      syncState.onlinePeers = onlinePeers.slice(0, 32).map((p) => ({
        peerId: String(p.peerId || p.peer_id || ''),
        displayName: String(p.displayName || p.display_name || 'Игрок'),
        roomId: String(p.roomId || p.room_id || 'games-lobby'),
        status: String(p.status || 'online'),
        lastSeen: p.lastSeen || p.last_seen || null,
      }));
    }
    return getStatus();
  }

  function setDisplayName(name) {
    const clean = String(name || '').trim().slice(0, 48);
    if (clean) syncState.displayName = clean;
    return { displayName: syncState.displayName };
  }

  function buildBackupManifest({ chats = [], stats = {} } = {}) {
    return {
      schema: 'ratmes-cloud-backup/1',
      generatedAt: new Date().toISOString(),
      portal: 'Games · Вкладка «Общение»',
      supabaseProject: SUPABASE_PUBLIC_CONFIG.projectRef,
      tick: core?.clock?.tick || 0,
      targets: {
        googleDriveFolderId: '1tQi82o2fHBMpBDq-0Zg5hSM4DkLOANxB',
        dropboxFolderPath: '/RatMes-Vault',
        notionHubPageId: '41b5c620-35e4-8187-8f46-e7c171e6fd09',
        linearProjectId: '0ab5a4c9-6704-403c-b94f-fc031b6488f9',
      },
      chatCount: chats.length,
      chats: chats.map((c) => ({
        chatId: c.chatId,
        network: c.network,
        title: c.title,
        messageCount: c.messageCount || 0,
      })),
      stats,
    };
  }

  return {
    getStatus,
    recordSync,
    setDisplayName,
    buildBackupManifest,
    getPublicConfig: () => ({ ...SUPABASE_PUBLIC_CONFIG }),
    listArtifacts: () => CONNECTED_CLOUD_SERVICES.map((s) => ({ ...s })),
    getGamesRooms: () => GAMES_CHAT_ROOMS.map((r) => ({ ...r })),
  };
}
