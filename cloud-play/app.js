const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const elements = {
  sidebarStatus: $('#sidebarStatus'),
  sidebarStatusTitle: $('#sidebarStatusTitle'),
  sidebarStatusText: $('#sidebarStatusText'),
  updateStatus: $('#updateStatus'),
  installAppButton: $('#installAppButton'),
  localSettingsButton: $('#localSettingsButton'),
  localSettingsDialog: $('#localSettingsDialog'),
  localSettingsForm: $('#localSettingsForm'),
  steamApiKeyInput: $('#steamApiKeyInput'),
  localSettingsFeedback: $('#localSettingsFeedback'),
  autoLoginCheckbox: $('#autoLoginCheckbox'),
  clearSteamApiKeyButton: $('#clearSteamApiKeyButton'),
  saveLocalSettingsButton: $('#saveLocalSettingsButton'),
  closeLocalSettingsButton: $('#closeLocalSettingsButton'),
  closeLocalSettingsFooter: $('#closeLocalSettingsFooter'),
  serverBadge: $('#serverBadge'),
  serviceNotice: $('#serviceNotice'),
  noticeIcon: $('#noticeIcon'),
  noticeTitle: $('#noticeTitle'),
  noticeText: $('#noticeText'),
  connectButton: $('#connectButton'),
  logoutButton: $('#logoutButton'),
  dropboxPanel: $('#dropboxPanel'),
  dropboxText: $('#dropboxText'),
  connectDropboxButton: $('#connectDropboxButton'),
  saveDropboxButton: $('#saveDropboxButton'),
  loadDropboxButton: $('#loadDropboxButton'),
  disconnectDropboxButton: $('#disconnectDropboxButton'),
  refreshGamesButton: $('#refreshGamesButton'),
  profileAvatar: $('#profileAvatar'),
  profileTitle: $('#profileTitle'),
  profileSub: $('#profileSub'),
  cloudState: $('#cloudState'),
  cloudButton: $('#cloudButton'),
  libraryState: $('#libraryState'),
  librarySub: $('#librarySub'),
  gameCount: $('#gameCount'),
  navGameCount: $('#navGameCount'),
  librarySource: $('#librarySource'),
  librarySourceWrap: $('.library-source'),
  gameGrid: $('#gameGrid'),
  gameSearch: $('#gameSearch'),
  loadMoreButton: $('#loadMoreButton'),
  filterButtons: $$('.filter-tab'),
  remoteHostCard: $('#remoteHostCard'),
  remoteHostPill: $('#remoteHostPill'),
  remoteHostCopy: $('#remoteHostCopy'),
  remoteToggleButton: $('#remoteToggleButton'),
  remoteNewCodeButton: $('#remoteNewCodeButton'),
  remoteCodeBox: $('#remoteCodeBox'),
  remoteCode: $('#remoteCode'),
  remoteCodeTimer: $('#remoteCodeTimer'),
  remoteUrls: $('#remoteUrls'),
  remoteRequests: $('#remoteRequests'),
  remoteRequestItems: $('#remoteRequestItems'),
  remoteSessions: $('#remoteSessions'),
  remoteSessionItems: $('#remoteSessionItems'),
  remoteGuestCard: $('#remoteGuestCard'),
  remoteGuestPill: $('#remoteGuestPill'),
  pairForm: $('#pairForm'),
  pairCodeInput: $('#pairCodeInput'),
  pairButton: $('#pairButton'),
  pairStatus: $('#pairStatus'),
  remoteViewer: $('#remoteViewer'),
  remoteStage: $('#remoteStage'),
  remoteScreen: $('#remoteScreen'),
  remoteStageBadge: $('#remoteStageBadge'),
  remoteBigPictureButton: $('#remoteBigPictureButton'),
  remoteLeaveButton: $('#remoteLeaveButton'),
  remoteKeys: $$('[data-remote-key]'),
};

const PAGE_SIZE = 48;
let backendStatus = null;
let deferredInstallPrompt = null;
let games = [];
let steamGames = [];
let steamTotalCount = 0;
let hasSteamLibrary = false;
let activeLibrarySource = 'steam';
let currentSession = { authenticated: false };
let dropboxStatus = { enabled: false, connected: false };
let dropboxFeedback = null;
let dropboxActionInProgress = false;
let gameLoadInProgress = false;
let activeFilter = 'all';
let visibleLimit = PAGE_SIZE;
const UPDATE_RESUME_KEY = 'playbridge:update-resume:v1';
const AUTO_LOGIN_ATTEMPT_KEY = 'playbridge:auto-steam-login:v1';
const AUTO_LOGIN_RETRY_MS = 10 * 60 * 1000;
const GITHUB_MANIFEST_URL = 'https://api.github.com/repos/m98978672-boop/games/contents/cloud-play/manifest.webmanifest?ref=main';
const GITHUB_VERSION_CACHE_KEY = 'playbridge:github-version:v1';
const GITHUB_VERSION_CACHE_TTL_MS = 15 * 60 * 1000;

function parseAppVersion(version) {
  if (typeof version !== 'string') return null;
  const match = version.trim().match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!match) return null;
  const parts = match.slice(1).map(Number);
  return parts.every(Number.isSafeInteger) ? parts : null;
}

function compareAppVersions(left, right) {
  const a = parseAppVersion(left);
  const b = parseAppVersion(right);
  if (!a || !b) return null;
  for (let index = 0; index < 3; index += 1) {
    if (a[index] !== b[index]) return a[index] > b[index] ? 1 : -1;
  }
  return 0;
}

function readCachedGithubVersion() {
  try {
    const cache = JSON.parse(window.localStorage.getItem(GITHUB_VERSION_CACHE_KEY) || 'null');
    if (parseAppVersion(cache?.version) && Number.isFinite(cache.checkedAt)) return cache;
  } catch {
    // GitHub checks still work when local storage is disabled.
  }
  return null;
}

async function getGithubAppVersion(force = false) {
  const cached = readCachedGithubVersion();
  if (!force && cached && Date.now() - cached.checkedAt < GITHUB_VERSION_CACHE_TTL_MS) return cached.version;

  const response = await fetch(GITHUB_MANIFEST_URL, {
    method: 'GET',
    mode: 'cors',
    credentials: 'omit',
    cache: 'no-store',
    headers: { Accept: 'application/vnd.github.raw+json' },
    signal: AbortSignal.timeout(10_000),
    redirect: 'error',
  });
  if (!response.ok) {
    throw new Error(response.status === 403
      ? 'GitHub API rate limit or access error.'
      : `GitHub API returned ${response.status}.`);
  }
  const manifest = await response.json();
  if (!parseAppVersion(manifest?.version)) throw new Error('GitHub manifest has no valid version.');
  try {
    window.localStorage.setItem(GITHUB_VERSION_CACHE_KEY, JSON.stringify({ version: manifest.version, checkedAt: Date.now() }));
  } catch {
    // The next scheduled check can fetch GitHub again.
  }
  return manifest.version;
}

async function getInstalledAppVersion(appScope) {
  const response = await fetch(new URL('manifest.webmanifest', appScope), {
    credentials: 'same-origin',
    cache: 'no-store',
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error('Could not read the installed app manifest.');
  const manifest = await response.json();
  if (!parseAppVersion(manifest?.version)) throw new Error('Installed app manifest has no valid version.');
  return manifest.version;
}

function consumeUpdateResumeState() {
  try {
    const raw = window.sessionStorage.getItem(UPDATE_RESUME_KEY);
    if (!raw) return null;
    window.sessionStorage.removeItem(UPDATE_RESUME_KEY);
    const saved = JSON.parse(raw);
    if (!saved || saved.version !== 1) return null;
    return {
      search: typeof saved.search === 'string' ? saved.search.slice(0, 200) : '',
      filter: saved.filter === 'played' ? 'played' : 'all',
      visibleLimit: Number.isSafeInteger(saved.visibleLimit) ? Math.max(PAGE_SIZE, Math.min(saved.visibleLimit, 10_000)) : PAGE_SIZE,
      scrollY: Number.isFinite(saved.scrollY) ? Math.max(0, saved.scrollY) : 0,
    };
  } catch {
    return null;
  }
}

const updateResumeState = consumeUpdateResumeState();
if (updateResumeState) {
  elements.gameSearch.value = updateResumeState.search;
  activeFilter = updateResumeState.filter;
  visibleLimit = updateResumeState.visibleLimit;
  elements.filterButtons.forEach((button) => {
    const active = button.dataset.filter === activeFilter;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}

function saveUpdateResumeState() {
  try {
    window.sessionStorage.setItem(UPDATE_RESUME_KEY, JSON.stringify({
      version: 1,
      search: elements.gameSearch.value,
      filter: activeFilter,
      visibleLimit,
      scrollY: window.scrollY,
    }));
  } catch {
    // Updates still apply if the browser has disabled session storage.
  }
}

class ApiError extends Error {
  constructor(code, message, status = 0) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

function setUpdateStatus(state, message) {
  if (!elements.updateStatus) return;
  elements.updateStatus.dataset.state = state;
  elements.updateStatus.textContent = message;
  elements.updateStatus.disabled = ['checking', 'updating', 'unsupported'].includes(state);
  elements.updateStatus.setAttribute('aria-busy', String(state === 'checking' || state === 'updating'));
  elements.updateStatus.setAttribute('aria-label', state === 'ready'
    ? 'Проверить обновления PLAYBRIDGE: приложение актуально'
    : `${message}. Статус обновлений PLAYBRIDGE`);
  elements.updateStatus.title = state === 'ready'
    ? 'Приложение актуально. Нажми, чтобы проверить GitHub и обновления сейчас.'
    : state === 'available'
      ? 'GitHub сообщает о новой версии. Нажми, чтобы повторить проверку и применить её после публикации сайта.'
      : state === 'ahead'
        ? 'Установленная версия новее версии в ветке main GitHub.'
        : state === 'error'
          ? 'Проверка не удалась. Нажми, чтобы повторить.'
          : message;
}

function setupAppInstall() {
  const button = elements.installAppButton;
  if (!button) return;
  const displayMode = window.matchMedia?.('(display-mode: standalone)');
  const isInstalled = Boolean(displayMode?.matches || window.navigator.standalone === true);
  if (isInstalled) return;

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    button.hidden = false;
  });
  button.addEventListener('click', async () => {
    if (!deferredInstallPrompt) return;
    const promptEvent = deferredInstallPrompt;
    deferredInstallPrompt = null;
    try {
      await promptEvent.prompt();
      await promptEvent.userChoice;
      button.hidden = true;
    } catch {
      button.hidden = true;
    }
  });
  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    button.hidden = true;
  });
}

async function setupAppUpdates() {
  if (!window.isSecureContext || !('serviceWorker' in navigator)) {
    setUpdateStatus('unsupported', 'PWA НЕДОСТУПНА');
    return;
  }

  let pageWasControlled = Boolean(navigator.serviceWorker.controller);
  let reloadingForUpdate = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    const wasAlreadyControlled = pageWasControlled;
    pageWasControlled = true;
    if (wasAlreadyControlled && !reloadingForUpdate) {
      reloadingForUpdate = true;
      setUpdateStatus('updating', 'ПРИМЕНЯЮ ОБНОВЛЕНИЕ');
      saveUpdateResumeState();
      window.location.reload();
    }
  });

  try {
    const appScope = new URL('./', document.baseURI);
    const registration = await navigator.serviceWorker.register(new URL('sw.js', appScope), {
      scope: appScope.pathname,
      updateViaCache: 'none',
    });
    const observedWorkers = new WeakSet();
    const observeWorker = (worker) => {
      if (!worker || observedWorkers.has(worker)) return;
      observedWorkers.add(worker);
      setUpdateStatus('updating', 'УСТАНАВЛИВАЮ ОБНОВЛЕНИЕ');
      const applyWorkerState = () => {
        if (worker.state === 'installed') {
          if (navigator.serviceWorker.controller) {
            setUpdateStatus('updating', 'ПРИМЕНЯЮ ОБНОВЛЕНИЕ');
            worker.postMessage({ type: 'SKIP_WAITING' });
          } else {
            setUpdateStatus('ready', 'АВТООБНОВЛЕНИЕ ВКЛЮЧЕНО');
          }
        } else if (worker.state === 'redundant') {
          setUpdateStatus('error', 'НЕ УДАЛОСЬ УСТАНОВИТЬ ОБНОВЛЕНИЕ');
        } else if (worker.state === 'activated' && !reloadingForUpdate) {
          setUpdateStatus('ready', 'АВТООБНОВЛЕНИЕ ВКЛЮЧЕНО');
        }
      };
      worker.addEventListener('statechange', applyWorkerState);
      applyWorkerState();
    };
    registration.addEventListener('updatefound', () => observeWorker(registration.installing));
    observeWorker(registration.installing);

    let currentCheck = null;
    const checkForUpdates = (manual = false) => {
      if (currentCheck) return currentCheck;
      setUpdateStatus('checking', manual ? 'ПРОВЕРЯЮ GITHUB' : 'ПРОВЕРКА ВЕРСИИ GITHUB');
      currentCheck = (async () => {
        let githubVersion = null;
        let installedVersion = null;
        let githubError = false;
        try {
          githubVersion = await getGithubAppVersion(manual);
        } catch {
          githubError = true;
        }
        try {
          installedVersion = await getInstalledAppVersion(appScope);
        } catch {
          // Service-worker updates can still proceed even if the manifest is unavailable.
        }
        const comparison = githubVersion && installedVersion
          ? compareAppVersions(githubVersion, installedVersion)
          : null;
        if (comparison === 1) setUpdateStatus('available', `GITHUB v${githubVersion} · ИЩУ ОБНОВЛЕНИЕ`);

        try {
          await registration.update();
          if (registration.waiting) {
            setUpdateStatus('updating', 'НАЙДЕНО ОБНОВЛЕНИЕ · ПРИМЕНЯЮ');
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            return;
          }
          if (registration.installing) {
            setUpdateStatus('updating', 'УСТАНАВЛИВАЮ ОБНОВЛЕНИЕ');
            observeWorker(registration.installing);
            return;
          }
          if (comparison === 1) {
            setUpdateStatus('available', `GITHUB v${githubVersion} · САЙТ ЕЩЁ НЕ ОБНОВЛЁН`);
          } else if (githubError) {
            setUpdateStatus('error', 'GITHUB НЕДОСТУПЕН · ПОВТОРИТЬ');
          } else if (comparison === -1) {
            setUpdateStatus('ahead', `УСТАНОВЛЕНА v${installedVersion} · MAIN v${githubVersion}`);
          } else if (githubVersion && installedVersion) {
            setUpdateStatus('ready', `GITHUB v${githubVersion} · АКТУАЛЬНО`);
          } else {
            setUpdateStatus('ready', 'АВТООБНОВЛЕНИЕ ВКЛЮЧЕНО');
          }
        } catch {
          if (comparison === 1) {
            setUpdateStatus('available', `GITHUB v${githubVersion} · НЕТ СВЯЗИ С САЙТОМ`);
          } else if (githubError) {
            setUpdateStatus('error', 'GITHUB НЕДОСТУПЕН · ПОВТОРИТЬ');
          } else {
            setUpdateStatus('error', 'НЕ УДАЛОСЬ ПРОВЕРИТЬ ОБНОВЛЕНИЕ');
          }
        }
      })().finally(() => { currentCheck = null; });
      return currentCheck;
    };

    elements.updateStatus.addEventListener('click', () => { void checkForUpdates(true); });
    await checkForUpdates();
    window.addEventListener('focus', () => { void checkForUpdates(); });
    window.addEventListener('online', () => { void checkForUpdates(); });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') void checkForUpdates();
    });
    window.setInterval(() => { void checkForUpdates(); }, 15 * 60 * 1000);
  } catch {
    setUpdateStatus('error', 'PWA ОБНОВЛЕНИЕ НЕДОСТУПНО');
  }
}

async function api(path, options = {}) {
  let response;
  try {
    response = await fetch(path, {
      credentials: 'same-origin',
      cache: 'no-store',
      ...options,
      headers: { Accept: 'application/json', ...(options.headers || {}) },
    });
  } catch {
    throw new ApiError('backend_unreachable', 'Сервер Playbridge недоступен.');
  }

  let body;
  try {
    body = await response.json();
  } catch {
    throw new ApiError('backend_unreachable', 'По этому адресу не найден API Playbridge.');
  }
  if (!response.ok) {
    throw new ApiError(body?.error?.code || 'request_failed', body?.error?.message || 'Запрос не выполнен.', response.status);
  }
  return body;
}

function setNotice(state, title, text) {
  elements.serviceNotice.dataset.state = state;
  elements.noticeIcon.textContent = state === 'online' ? '✓' : state === 'offline' ? '!' : '…';
  elements.noticeTitle.textContent = title;
  elements.noticeText.textContent = text;
}

function setLibraryState(state, title, message) {
  elements.libraryState.dataset.state = state;
  elements.libraryState.replaceChildren();
  const heading = document.createElement('strong');
  heading.textContent = title;
  const paragraph = document.createElement('p');
  paragraph.textContent = message;
  elements.libraryState.append(heading, paragraph);
  elements.libraryState.hidden = false;
  elements.gameGrid.replaceChildren();
}

function setBackendUnavailable(error) {
  elements.serverBadge.dataset.state = 'offline';
  elements.serverBadge.innerHTML = '<i></i> API OFFLINE';
  elements.sidebarStatus.dataset.state = 'offline';
  elements.sidebarStatusTitle.textContent = 'BACKEND OFFLINE';
  elements.sidebarStatusText.textContent = 'Нужен Node-сервер';
  elements.connectButton.disabled = true;
  elements.connectButton.textContent = 'Вход недоступен';
  elements.localSettingsButton.hidden = true;
  elements.profileTitle.textContent = 'Не подключено';
  elements.profileSub.textContent = 'API не найден';
  elements.logoutButton.hidden = true;
  setNotice('offline', 'Серверная часть не запущена', `${error.message} GitHub Pages отдаёт только файлы сайта; Steam-вход и библиотека требуют backend. Инструкция — по ссылке «Настроить сервер».`);
  elements.librarySourceWrap.dataset.state = 'offline';
  elements.librarySource.textContent = 'BACKEND OFFLINE';
  elements.gameSearch.disabled = true;
  elements.filterButtons.forEach((button) => { button.disabled = true; });
  elements.refreshGamesButton.disabled = true;
  setLibraryState('offline', 'Подключение к библиотеке недоступно', 'Запусти локальный backend командой из README или разверни его за HTTPS reverse proxy. Демо-игры больше не подставляются.');
  updateCloudStatus(null);
  dropboxFeedback = null;
  updateDropboxPanel({ enabled: false, connected: false });
}

function updateCloudStatus(status) {
  elements.cloudState.dataset.state = 'offline';
  $('strong', elements.cloudState).textContent = 'GPU-хост не подключён';
  $('small', elements.cloudState).textContent = 'Нужны безопасное сопряжение и реальный видеопоток';
  elements.cloudButton.disabled = true;
  elements.cloudButton.textContent = 'Облачный запуск недоступен';
}

function applyBackendStatus(status) {
  backendStatus = status;
  elements.serverBadge.dataset.state = 'online';
  elements.serverBadge.innerHTML = '<i></i> API ONLINE';
  elements.sidebarStatus.dataset.state = 'online';
  elements.sidebarStatusTitle.textContent = 'BACKEND ONLINE';
  elements.sidebarStatusText.textContent = status.steam?.loginReady ? 'Steam OpenID настроен' : 'Нужна настройка входа';
  elements.localSettingsButton.hidden = !status.settings?.localSetupAvailable || Boolean(status.remoteContext);
  elements.localSettingsButton.textContent = status.steam?.libraryReady ? 'Настройки' : 'Настроить API';
  elements.localSettingsButton.title = status.steam?.libraryReady
    ? 'Заменить или удалить локально сохранённый Steam Web API key'
    : 'Ввести Steam Web API key в локальное приложение';
  updateCloudStatus(status);

  if (status.remoteContext) {
    elements.connectButton.disabled = true;
    elements.connectButton.textContent = 'Steam-вход только на ПК';
    setNotice('online', 'Телефон подключён к домашнему ПК', 'Steam-вход, библиотека и настройки ключа доступны только на самом компьютере. Здесь работает «Пульт»: экран и управление.');
    return;
  }
  if (!status.steam?.loginReady) {
    elements.connectButton.disabled = true;
    elements.connectButton.textContent = 'Настрой Steam-вход';
    setNotice('checking', 'Backend работает, Steam-вход не настроен', 'Задай PUBLIC_ORIGIN и случайный SESSION_SECRET не короче 32 символов. Секрет остаётся только на сервере.');
  } else if (!status.steam?.libraryReady) {
    elements.connectButton.disabled = false;
    elements.connectButton.textContent = 'Войти через Steam';
    setNotice('online', 'Steam OpenID готов; список игр пока закрыт', 'Для чтения публичной библиотеки добавь STEAM_WEB_API_KEY в окружение backend. Ключ не отправляется в браузер.');
  } else {
    elements.connectButton.disabled = false;
    elements.connectButton.textContent = 'Войти через Steam';
    setNotice('online', 'Backend готов к подключению', 'Вход пойдёт через официальный Steam OpenID; список игр — через Steam Web API с учётом настроек приватности.');
  }
}

function openLocalSettings() {
  if (!backendStatus?.settings?.localSetupAvailable || !elements.localSettingsDialog?.showModal) return;
  elements.localSettingsFeedback.textContent = backendStatus.steam?.libraryReady
    ? 'Ключ уже сохранён локально. Введи новый для замены или нажми «Удалить ключ».'
    : 'Ключ будет сохранён только в локальной папке данных приложения.';
  elements.steamApiKeyInput.value = '';
  elements.autoLoginCheckbox.checked = Boolean(backendStatus.settings?.autoLoginEnabled);
  elements.clearSteamApiKeyButton.hidden = !backendStatus.steam?.libraryReady;
  elements.localSettingsDialog.showModal();
}

async function saveLocalSteamApiKey(event) {
  event.preventDefault();
  const steamApiKey = elements.steamApiKeyInput.value.trim();
  if (steamApiKey && !/^[a-f0-9]{32}$/i.test(steamApiKey)) {
    elements.localSettingsFeedback.textContent = 'Ключ должен состоять ровно из 32 шестнадцатеричных символов.';
    elements.steamApiKeyInput.focus();
    return;
  }
  elements.saveLocalSettingsButton.disabled = true;
  elements.localSettingsFeedback.textContent = 'Сохраняю ключ локально…';
  try {
    const settings = { autoLoginEnabled: elements.autoLoginCheckbox.checked };
    if (steamApiKey) settings.steamApiKey = steamApiKey;
    await api('/api/settings/steam', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    elements.localSettingsDialog.close();
    window.location.reload();
  } catch (error) {
    elements.localSettingsFeedback.textContent = error.message || 'Не удалось сохранить настройки.';
  } finally {
    elements.saveLocalSettingsButton.disabled = false;
  }
}

async function clearLocalSteamApiKey() {
  if (!window.confirm('Удалить сохранённый на этом компьютере ключ Steam Web API?')) return;
  elements.clearSteamApiKeyButton.disabled = true;
  elements.localSettingsFeedback.textContent = 'Удаляю ключ из локальной папки данных…';
  try {
    await api('/api/settings/steam', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ steamApiKey: '', autoLoginEnabled: elements.autoLoginCheckbox.checked }),
    });
    elements.localSettingsDialog.close();
    window.location.reload();
  } catch (error) {
    elements.localSettingsFeedback.textContent = error.message || 'Не удалось удалить ключ.';
  } finally {
    elements.clearSteamApiKeyButton.disabled = false;
  }
}

function updateProfile(session) {
  currentSession = session || { authenticated: false };
  elements.refreshGamesButton.disabled = !currentSession.authenticated || !backendStatus?.steam?.libraryReady;
  if (session?.authenticated) {
    const shortId = session.steamId;
    elements.profileAvatar.textContent = 'S';
    elements.profileTitle.textContent = `Steam · ${shortId}`;
    elements.profileSub.textContent = 'Аккаунт подтверждён OpenID';
    elements.connectButton.hidden = true;
    elements.logoutButton.hidden = false;
  } else {
    elements.profileAvatar.textContent = '?';
    elements.profileTitle.textContent = 'Не подключено';
    elements.profileSub.textContent = 'Вход через Steam OpenID';
    elements.connectButton.hidden = false;
    elements.logoutButton.hidden = true;
  }
}

function updateDropboxPanel(status, feedback = undefined) {
  if (status) dropboxStatus = { enabled: Boolean(status.enabled), connected: Boolean(status.connected) };
  if (feedback !== undefined) dropboxFeedback = feedback;
  if (!elements.dropboxPanel) return;
  const authenticated = Boolean(currentSession?.authenticated);
  const connected = dropboxStatus.enabled && dropboxStatus.connected && authenticated;

  elements.connectDropboxButton.hidden = connected;
  elements.connectDropboxButton.disabled = !dropboxStatus.enabled || !authenticated || dropboxActionInProgress;
  elements.connectDropboxButton.textContent = authenticated ? 'Подключить Dropbox' : 'Сначала войти в Steam';
  elements.saveDropboxButton.hidden = !connected;
  elements.saveDropboxButton.disabled = !hasSteamLibrary || gameLoadInProgress || dropboxActionInProgress;
  elements.loadDropboxButton.hidden = !connected;
  elements.loadDropboxButton.disabled = gameLoadInProgress || dropboxActionInProgress;
  elements.disconnectDropboxButton.hidden = !connected;
  elements.disconnectDropboxButton.disabled = dropboxActionInProgress;

  if (dropboxFeedback) {
    elements.dropboxPanel.dataset.state = dropboxFeedback.state || 'ready';
    elements.dropboxText.textContent = dropboxFeedback.message;
  } else if (!dropboxStatus.enabled) {
    elements.dropboxPanel.dataset.state = 'offline';
    elements.dropboxText.textContent = 'Dropbox пока не настроен на backend. Нужны Dropbox App credentials и секрет шифрования; эти данные должны храниться только в окружении сервера.';
  } else if (!authenticated) {
    elements.dropboxPanel.dataset.state = 'idle';
    elements.dropboxText.textContent = 'Сначала войди через Steam. Dropbox будет привязан к подтверждённому SteamID; пароль Steam PLAYBRIDGE не получает.';
  } else if (connected) {
    elements.dropboxPanel.dataset.state = 'ready';
    elements.dropboxText.textContent = 'Dropbox подключён. Можно сохранить актуальный список Steam или показать ранее сохранённый снимок.';
  } else {
    elements.dropboxPanel.dataset.state = 'idle';
    elements.dropboxText.textContent = 'Подключи Dropbox для резервной копии в закрытой App Folder. Запуск игр и Steam-сейвы здесь не хранятся.';
  }
}

function setDropboxFeedback(message, state = 'ready') {
  updateDropboxPanel(null, { message, state });
}

function createGameCard(game) {
  const appId = Number(game.appId);
  const card = document.createElement('article');
  card.className = 'game-card';

  const cover = document.createElement('div');
  cover.className = `game-cover cover-tone-${appId % 4}`;
  cover.setAttribute('role', 'img');
  cover.setAttribute('aria-label', `Карточка игры ${game.name}`);
  const kicker = document.createElement('span');
  kicker.className = 'cover-kicker';
  kicker.textContent = activeLibrarySource === 'dropbox' ? 'DROPBOX SNAPSHOT' : 'STEAM LIBRARY';
  const mark = document.createElement('span');
  mark.className = 'cover-mark';
  mark.textContent = `APP ${appId}`;
  const coverTitle = document.createElement('span');
  coverTitle.className = 'cover-title';
  coverTitle.textContent = game.name;
  cover.append(kicker, mark, coverTitle);

  const body = document.createElement('div');
  body.className = 'game-card-body';
  const meta = document.createElement('div');
  meta.className = 'game-meta';
  const idLabel = document.createElement('span');
  idLabel.className = 'game-id';
  idLabel.textContent = `APPID ${appId}`;
  const playtime = document.createElement('span');
  playtime.className = 'game-playtime';
  playtime.textContent = Number.isFinite(game.playtimeMinutes) ? `${Math.floor(game.playtimeMinutes / 60)} ч.` : '—';
  playtime.title = 'Время игры по данным Steam API';
  meta.append(idLabel, playtime);

  const title = document.createElement('h3');
  title.className = 'game-title';
  title.textContent = game.name;
  const subtitle = document.createElement('p');
  subtitle.className = 'game-subtitle';
  subtitle.textContent = activeLibrarySource === 'dropbox' ? 'Восстановлено из резервной копии' : 'Получено от Steam Web API';

  const statusRow = document.createElement('div');
  statusRow.className = 'game-status-row';
  const ownedStatus = document.createElement('span');
  ownedStatus.className = 'game-status';
  ownedStatus.innerHTML = '<i></i>Есть в ответе API';
  const cloudStatus = document.createElement('span');
  cloudStatus.className = 'game-status is-unavailable';
  cloudStatus.innerHTML = '<i></i>Cloud не настроен';
  statusRow.append(ownedStatus, cloudStatus);

  const actions = document.createElement('div');
  actions.className = 'game-actions';
  const install = document.createElement('a');
  install.className = 'game-action';
  install.href = `steam://install/${appId}`;
  install.textContent = 'Установить в Steam';
  install.setAttribute('aria-label', `Открыть установку ${game.name} в Steam`);
  const store = document.createElement('a');
  store.className = 'game-action secondary';
  store.href = `https://store.steampowered.com/app/${appId}/`;
  store.target = '_blank';
  store.rel = 'noopener noreferrer';
  store.textContent = 'Страница Steam';
  actions.append(install, store);

  body.append(meta, title, subtitle, statusRow, actions);
  card.append(cover, body);
  return card;
}

function renderGames() {
  const query = elements.gameSearch.value.trim().toLocaleLowerCase('ru');
  const filtered = games.filter((game) => {
    const matchesSearch = game.name.toLocaleLowerCase('ru').includes(query) || String(game.appId).includes(query);
    const matchesFilter = activeFilter === 'all' || Number(game.playtimeMinutes) > 0;
    return matchesSearch && matchesFilter;
  });

  const displayed = filtered.slice(0, visibleLimit);
  elements.gameGrid.replaceChildren(...displayed.map(createGameCard));
  elements.gameGrid.hidden = displayed.length === 0;
  elements.loadMoreButton.hidden = displayed.length >= filtered.length;
  elements.loadMoreButton.textContent = `Показать ещё (${filtered.length - displayed.length})`;
  elements.libraryState.hidden = filtered.length > 0;
  if (filtered.length === 0) {
    const emptyLibrary = games.length === 0;
    const title = emptyLibrary
      ? (activeLibrarySource === 'dropbox' ? 'В снимке Dropbox нет игр' : 'Steam API вернул пустой список')
      : 'По запросу игр не найдено';
    const message = emptyLibrary
      ? (activeLibrarySource === 'dropbox'
        ? 'Снимок хранится в Dropbox, но в нём нет игр. Обнови библиотеку Steam и сохрани новый снимок.'
        : 'Это может означать пустую библиотеку или закрытые настройки «Сведения об играх». Сделай их публичными и обнови список.')
      : 'Измени запрос или переключи фильтр библиотеки.';
    setLibraryState('empty', title, message);
  }
}

async function loadGames() {
  if (!currentSession?.authenticated) return false;
  gameLoadInProgress = true;
  elements.refreshGamesButton.disabled = true;
  elements.refreshGamesButton.textContent = 'Загружаю…';
  elements.profileSub.textContent = 'SteamID подтверждён · загружаю библиотеку';
  setNotice('checking', 'Steam-вход подтверждён — загружаю библиотеку', 'Сессия проверена на backend. Запрашиваю актуальный список у Steam Web API.');
  elements.saveDropboxButton.disabled = true;
  elements.gameSearch.disabled = false;
  elements.filterButtons.forEach((button) => { button.disabled = false; });
  elements.gameGrid.hidden = true;
  elements.libraryState.hidden = false;
  elements.libraryState.dataset.state = 'loading';
  $('strong', elements.libraryState).textContent = 'Запрашиваю библиотеку у Steam';
  $('p', elements.libraryState).textContent = 'Steam-вход подтверждён. Загружаю список, который API разрешает этому приложению видеть.';
  elements.librarySourceWrap.dataset.state = 'pending';
  elements.librarySource.textContent = 'STEAM API';

  let loaded = false;
  try {
    const result = await api('/api/games');
    games = Array.isArray(result.games) ? result.games : [];
    steamGames = [...games];
    hasSteamLibrary = true;
    steamTotalCount = Number.isFinite(result.totalCount) ? result.totalCount : games.length;
    activeLibrarySource = 'steam';
    elements.gameCount.textContent = String(steamTotalCount);
    elements.navGameCount.textContent = String(steamTotalCount).padStart(2, '0');
    elements.librarySub.textContent = result.notice || 'Показаны игры, которые Steam API разрешил этому приложению увидеть.';
    elements.librarySourceWrap.dataset.state = 'ready';
    elements.librarySource.textContent = 'STEAM WEB API';
    elements.profileSub.textContent = 'Steam OpenID · библиотека обновлена';
    renderGames();
    setNotice('online', 'Библиотека Steam загружена', `Steam API передал ${steamTotalCount} записей. Нажми «Обновить из Steam», чтобы проверить список ещё раз.`);
    loaded = true;
  } catch (error) {
    elements.gameCount.textContent = '—';
    elements.navGameCount.textContent = '—';
    elements.librarySourceWrap.dataset.state = 'offline';
    elements.librarySource.textContent = 'API ERROR';
    elements.profileSub.textContent = 'SteamID подтверждён · API недоступен';
    if (error.code === 'steam_web_api_key_missing') {
      setLibraryState('error', 'Не задан Steam Web API key', 'Добавь STEAM_WEB_API_KEY на сервере и перезапусти его. Не вставляй ключ на эту страницу.');
    } else if (error.code === 'games_not_public') {
      setLibraryState('error', 'Steam не отдал список игр', 'Проверь приватность «Сведения об играх» в профиле Steam. Частный список нельзя безопасно обойти.');
    } else {
      setLibraryState('error', 'Не удалось получить библиотеку', error.message);
    }
    setNotice('offline', 'Не удалось обновить библиотеку Steam', error.message);
  } finally {
    gameLoadInProgress = false;
    elements.refreshGamesButton.disabled = !currentSession?.authenticated || !backendStatus?.steam?.libraryReady;
    elements.refreshGamesButton.textContent = '↻ Обновить из Steam';
    updateDropboxPanel(null);
  }
  return loaded;
}

function dropboxErrorMessage(error) {
  if (error.code === 'dropbox_snapshot_missing') return 'В Dropbox пока нет снимка. Сначала сохрани свежую библиотеку Steam.';
  if (error.code === 'dropbox_not_linked') return 'Сначала подключи Dropbox к этому Steam-аккаунту.';
  if (error.code === 'dropbox_reconnect_required') return 'Dropbox-токен больше не работает. Подключи Dropbox заново.';
  if (error.code === 'dropbox_not_configured') return 'Dropbox OAuth ещё не настроен на сервере.';
  if (error.code === 'dropbox_snapshot_account_mismatch') return 'Снимок привязан к другому Steam-аккаунту и не будет показан.';
  return error.message || 'Операция с Dropbox не выполнена.';
}

async function refreshDropboxStatus(feedback = undefined) {
  try {
    const status = await api('/api/dropbox/status');
    updateDropboxPanel(status, feedback);
  } catch (error) {
    updateDropboxPanel({ enabled: false, connected: false }, {
      state: 'error',
      message: `Не удалось проверить Dropbox: ${error.message}`,
    });
  }
}

async function saveDropboxSnapshot() {
  if (!hasSteamLibrary || !currentSession?.authenticated || dropboxActionInProgress) return;
  dropboxActionInProgress = true;
  elements.saveDropboxButton.disabled = true;
  setDropboxFeedback('Сохраняю снимок библиотеки в Dropbox App Folder…', 'checking');
  try {
    const result = await api('/api/dropbox/snapshot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ games: steamGames, totalCount: steamTotalCount }),
    });
    setDropboxFeedback(`Снимок сохранён: ${result.gameCount} игр, обновлено ${new Date(result.updatedAt).toLocaleString('ru-RU')}. Файл закрыт внутри Dropbox App Folder.`, 'ready');
  } catch (error) {
    if (error.code === 'dropbox_reconnect_required') await refreshDropboxStatus();
    setDropboxFeedback(dropboxErrorMessage(error), 'error');
  } finally {
    dropboxActionInProgress = false;
    updateDropboxPanel(null);
  }
}

async function showDropboxSnapshot() {
  if (dropboxActionInProgress) return;
  dropboxActionInProgress = true;
  elements.loadDropboxButton.disabled = true;
  setDropboxFeedback('Загружаю сохранённый снимок из Dropbox…', 'checking');
  try {
    const result = await api('/api/dropbox/snapshot');
    const snapshot = result.snapshot;
    games = snapshot.games;
    activeLibrarySource = 'dropbox';
    visibleLimit = PAGE_SIZE;
    elements.gameCount.textContent = String(snapshot.totalCount);
    elements.navGameCount.textContent = String(snapshot.totalCount).padStart(2, '0');
    elements.librarySub.textContent = `Снимок Dropbox от ${new Date(snapshot.updatedAt).toLocaleString('ru-RU')}. Это просмотр резервной копии; данные Steam не изменяются.`;
    elements.librarySourceWrap.dataset.state = 'ready';
    elements.librarySource.textContent = 'DROPBOX SNAPSHOT';
    elements.gameSearch.disabled = false;
    elements.filterButtons.forEach((button) => { button.disabled = false; });
    renderGames();
    setDropboxFeedback(`Показан снимок от ${new Date(snapshot.updatedAt).toLocaleString('ru-RU')}. Для возврата к свежим данным нажми «Обновить из Steam».`, 'ready');
    document.querySelector('#library')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (error) {
    if (error.code === 'dropbox_reconnect_required') await refreshDropboxStatus();
    setDropboxFeedback(dropboxErrorMessage(error), 'error');
  } finally {
    dropboxActionInProgress = false;
    updateDropboxPanel(null);
  }
}

async function disconnectDropbox() {
  if (dropboxActionInProgress) return;
  dropboxActionInProgress = true;
  elements.disconnectDropboxButton.disabled = true;
  setDropboxFeedback('Отключаю Dropbox от этого браузера…', 'checking');
  try {
    await api('/api/dropbox/disconnect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    });
    await refreshDropboxStatus({ state: 'idle', message: 'Локальная связь Dropbox удалена. Файл снимка в Dropbox не удалён.' });
  } catch (error) {
    setDropboxFeedback(error.message, 'error');
  } finally {
    dropboxActionInProgress = false;
    updateDropboxPanel(null);
  }
}

async function boot() {
  const params = new URLSearchParams(window.location.search);
  const hadAuthError = params.has('auth_error');
  let callbackFeedback;
  if (params.get('dropbox') === 'connected') {
    callbackFeedback = { state: 'ready', message: 'Dropbox подключён к этому Steam-аккаунту. Теперь можно сохранить резервную копию списка игр.' };
  } else if (params.has('dropbox_error')) {
    const messages = {
      denied: 'Подключение Dropbox отменено. Аккаунт не связан с PLAYBRIDGE.',
      invalid_state: 'Не удалось проверить запрос Dropbox. Начни подключение заново.',
      authorization_failed: 'Dropbox не завершил авторизацию. Проверь App key, callback URL и разрешения приложения.',
      not_configured: 'Dropbox OAuth ещё не настроен на backend.',
    };
    callbackFeedback = { state: 'error', message: messages[params.get('dropbox_error')] || 'Dropbox не удалось подключить.' };
  }
  if (params.has('auth_error') || params.has('dropbox') || params.has('dropbox_error')) {
    window.history.replaceState({}, '', window.location.pathname + window.location.hash);
  }

  try {
    const status = await api('/api/status');
    applyBackendStatus(status);
    if (hadAuthError) setNotice('offline', 'Steam не подтвердил вход', 'Вход не завершился. Нажми кнопку Steam, чтобы попробовать ещё раз.');
    const session = await api('/api/session');
    updateProfile(session);
    if (session.authenticated) {
      try { window.sessionStorage.removeItem(AUTO_LOGIN_ATTEMPT_KEY); } catch {}
      elements.librarySource.textContent = 'STEAM API';
      await Promise.all([loadGames(), refreshDropboxStatus(callbackFeedback)]);
    } else {
      if (!status.remoteContext && status.settings?.localSetupAvailable && status.settings?.autoLoginEnabled && status.steam?.loginReady && !hadAuthError) {
        let shouldStartSteamLogin = false;
        try {
          const lastAttempt = Number(window.sessionStorage.getItem(AUTO_LOGIN_ATTEMPT_KEY));
          shouldStartSteamLogin = !Number.isFinite(lastAttempt) || Date.now() - lastAttempt >= AUTO_LOGIN_RETRY_MS;
          if (shouldStartSteamLogin) window.sessionStorage.setItem(AUTO_LOGIN_ATTEMPT_KEY, String(Date.now()));
        } catch {
          shouldStartSteamLogin = false;
        }
        if (shouldStartSteamLogin) {
          window.location.assign('/auth/steam/start');
          return;
        }
      }
      elements.gameCount.textContent = '—';
      elements.navGameCount.textContent = '—';
      elements.librarySub.textContent = status.steam?.libraryReady
        ? 'Войди через Steam OpenID, чтобы запросить видимую библиотеку.'
        : 'Сначала настрой сервер и Steam Web API key; никакие демо-игры не подставляются.';
      elements.librarySource.textContent = 'ОЖИДАЕТ ВХОД';
      setLibraryState('idle', 'Библиотека не загружена', 'Нажми «Войти через Steam» после настройки backend. При закрытых настройках игр Steam может вернуть пустой список.');
      await refreshDropboxStatus(callbackFeedback);
    }
  } catch (error) {
    setBackendUnavailable(error);
  }

  if (updateResumeState) {
    window.requestAnimationFrame(() => window.scrollTo(0, updateResumeState.scrollY));
  }
}

elements.localSettingsButton.addEventListener('click', openLocalSettings);
elements.localSettingsForm.addEventListener('submit', (event) => { void saveLocalSteamApiKey(event); });
elements.clearSteamApiKeyButton.addEventListener('click', () => { void clearLocalSteamApiKey(); });
elements.closeLocalSettingsButton.addEventListener('click', () => elements.localSettingsDialog.close());
elements.closeLocalSettingsFooter.addEventListener('click', () => elements.localSettingsDialog.close());
elements.localSettingsDialog.addEventListener('click', (event) => {
  if (event.target === elements.localSettingsDialog) elements.localSettingsDialog.close();
});

elements.connectButton.addEventListener('click', () => {
  if (!elements.connectButton.disabled && backendStatus?.steam?.loginReady) {
    window.location.assign('/auth/steam/start');
  }
});

elements.connectDropboxButton.addEventListener('click', () => {
  if (!elements.connectDropboxButton.disabled && currentSession?.authenticated && dropboxStatus.enabled) {
    const returnTo = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    window.location.assign(`/auth/dropbox/start?return_to=${encodeURIComponent(returnTo)}`);
  }
});

elements.saveDropboxButton.addEventListener('click', () => { void saveDropboxSnapshot(); });
elements.loadDropboxButton.addEventListener('click', () => { void showDropboxSnapshot(); });
elements.disconnectDropboxButton.addEventListener('click', () => { void disconnectDropbox(); });
elements.refreshGamesButton.addEventListener('click', () => { void loadGames(); });

elements.logoutButton.addEventListener('click', async () => {
  elements.logoutButton.disabled = true;
  try {
    if (backendStatus?.settings?.localSetupAvailable) {
      await api('/api/settings/steam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ autoLoginEnabled: false }),
      }).catch(() => {});
    }
    try { window.sessionStorage.setItem(AUTO_LOGIN_ATTEMPT_KEY, String(Date.now())); } catch {}
    await api('/api/logout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    window.location.reload();
  } catch (error) {
    setNotice('offline', 'Не удалось завершить сеанс', error.message);
    elements.logoutButton.disabled = false;
  }
});

elements.gameSearch.addEventListener('input', () => {
  visibleLimit = PAGE_SIZE;
  renderGames();
});

elements.loadMoreButton.addEventListener('click', () => {
  visibleLimit += PAGE_SIZE;
  renderGames();
});

elements.filterButtons.forEach((button) => button.addEventListener('click', () => {
  activeFilter = button.dataset.filter;
  visibleLimit = PAGE_SIZE;
  elements.filterButtons.forEach((candidate) => {
    const active = candidate === button;
    candidate.classList.toggle('is-active', active);
    candidate.setAttribute('aria-pressed', String(active));
  });
  renderGames();
}));

const navigationLinks = $$('[data-nav]');
function setActiveNavigation(activeLink) {
  navigationLinks.forEach((candidate) => {
    const active = candidate === activeLink;
    candidate.classList.toggle('is-active', active);
    if (active) candidate.setAttribute('aria-current', 'location');
    else candidate.removeAttribute('aria-current');
  });
}

navigationLinks.forEach((link) => link.addEventListener('click', () => setActiveNavigation(link)));
if ('IntersectionObserver' in window) {
  const navigationSections = navigationLinks
    .map((link) => document.getElementById(link.dataset.nav))
    .filter(Boolean);
  const navigationObserver = new IntersectionObserver((entries) => {
    const currentSection = entries
      .filter((entry) => entry.isIntersecting)
      .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];
    if (!currentSection) return;
    const currentLink = navigationLinks.find((link) => link.dataset.nav === currentSection.target.id);
    if (currentLink) setActiveNavigation(currentLink);
  }, { rootMargin: '-8% 0px -72% 0px', threshold: [0, 0.1, 0.25, 0.5] });
  navigationSections.forEach((section) => navigationObserver.observe(section));
}

document.addEventListener('keydown', (event) => {
  const target = event.target;
  const isTyping = target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));
  if (event.key === '/' && !isTyping) {
    event.preventDefault();
    elements.gameSearch.focus();
  }
});

/* ---- Remote control: pairing a phone with this PC ---- */
const remoteState = {
  host: null,
  hostTimer: null,
  pair: null,
  pairTimer: null,
  connected: false,
  streaming: false,
  frameTimer: null,
  frameUrl: null,
  capabilities: { screen: false, input: false },
};

function setPairStatus(message, state = 'idle') {
  elements.pairStatus.textContent = message;
  elements.pairStatus.dataset.state = state;
}

function remotePost(path, body) {
  return api(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
  });
}

function formatClock(timestamp) {
  if (!Number.isFinite(timestamp)) return '';
  return new Date(timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

function renderRemoteHost(status) {
  remoteState.host = status;
  const enabled = Boolean(status?.enabled);
  elements.remoteHostPill.dataset.state = enabled ? 'on' : 'off';
  elements.remoteHostPill.textContent = enabled ? 'ВКЛЮЧЕНО' : 'ВЫКЛЮЧЕНО';
  elements.remoteToggleButton.textContent = enabled ? 'Выключить доступ' : 'Включить доступ с телефона';
  elements.remoteNewCodeButton.hidden = !enabled;
  elements.remoteCodeBox.hidden = !enabled;

  if (enabled) {
    elements.remoteCode.textContent = status.code || '······';
    elements.remoteCodeTimer.textContent = status.codeExpiresAt
      ? `Действует до ${formatClock(status.codeExpiresAt)}`
      : 'Нажми «Новый код»';
    const urls = Array.isArray(status.urls) ? status.urls : [];
    elements.remoteUrls.replaceChildren();
    if (urls.length) {
      for (const url of urls) {
        const link = document.createElement('a');
        link.href = url;
        link.textContent = url.replace(/^https?:\/\//, '');
        link.target = '_blank';
        link.rel = 'noreferrer noopener';
        elements.remoteUrls.append(link);
      }
    } else {
      const empty = document.createElement('span');
      empty.textContent = 'Сетевой адрес не найден — проверь подключение к Wi-Fi.';
      elements.remoteUrls.append(empty);
    }
    elements.remoteUrls.hidden = false;
    elements.remoteHostCopy.textContent = 'Открой этот адрес на телефоне в той же сети, введи код — запрос появится ниже.';
  } else {
    elements.remoteUrls.hidden = true;
    elements.remoteHostCopy.textContent = 'Включи доступ — на этом экране появятся код и адрес для телефона. Пока доступ выключен, сеть компьютера не используется.';
  }

  const pending = Array.isArray(status?.pending) ? status.pending : [];
  elements.remoteRequests.hidden = !enabled || pending.length === 0;
  elements.remoteRequestItems.replaceChildren();
  for (const request of pending) {
    const row = document.createElement('div');
    row.className = 'remote-request-row';
    const label = document.createElement('span');
    label.textContent = request.device;
    const meta = document.createElement('small');
    meta.textContent = `${request.ip || 'устройство'} · ${formatClock(request.createdAt)}`;
    label.append(meta);
    const actions = document.createElement('div');
    actions.className = 'remote-row-actions';
    const approve = document.createElement('button');
    approve.type = 'button';
    approve.dataset.approve = request.id;
    approve.textContent = 'Разрешить';
    const deny = document.createElement('button');
    deny.type = 'button';
    deny.dataset.deny = request.id;
    deny.textContent = 'Нет';
    actions.append(approve, deny);
    row.append(label, actions);
    elements.remoteRequestItems.append(row);
  }

  const sessions = Array.isArray(status?.sessions) ? status.sessions : [];
  elements.remoteSessions.hidden = !enabled || sessions.length === 0;
  elements.remoteSessionItems.replaceChildren();
  for (const session of sessions) {
    const row = document.createElement('div');
    row.className = 'remote-session-row';
    const label = document.createElement('span');
    label.textContent = session.device;
    const meta = document.createElement('small');
    meta.textContent = `подключено ${formatClock(session.createdAt)} · до ${formatClock(session.expiresAt)}`;
    label.append(meta);
    const actions = document.createElement('div');
    actions.className = 'remote-row-actions';
    const end = document.createElement('button');
    end.type = 'button';
    end.dataset.endSession = session.tokenHint;
    end.textContent = 'Завершить';
    actions.append(end);
    row.append(label, actions);
    elements.remoteSessionItems.append(row);
  }
}

async function refreshRemoteHost() {
  if (!elements.remoteHostCard || !backendStatus?.remote?.managementAvailable) {
    if (elements.remoteHostCard) elements.remoteHostCard.hidden = true;
    return;
  }
  elements.remoteHostCard.hidden = false;
  try {
    renderRemoteHost(await api('/api/remote/status'));
  } catch (error) {
    elements.remoteHostPill.dataset.state = 'off';
    elements.remoteHostPill.textContent = 'НЕДОСТУПНО';
    elements.remoteHostCopy.textContent = error.message;
  }
}

function scheduleRemoteHostRefresh() {
  if (remoteState.hostTimer) window.clearInterval(remoteState.hostTimer);
  remoteState.hostTimer = window.setInterval(() => {
    if (document.hidden) return;
    void refreshRemoteHost();
  }, 4000);
}

async function toggleRemoteAccess() {
  const enabled = Boolean(remoteState.host?.enabled);
  elements.remoteToggleButton.disabled = true;
  try {
    renderRemoteHost(await remotePost(enabled ? '/api/remote/stop' : '/api/remote/start'));
  } catch (error) {
    elements.remoteHostCopy.textContent = error.message;
  } finally {
    elements.remoteToggleButton.disabled = false;
  }
}

async function requestRemoteCode() {
  elements.remoteNewCodeButton.disabled = true;
  try {
    renderRemoteHost(await remotePost('/api/remote/code'));
  } catch (error) {
    elements.remoteHostCopy.textContent = error.message;
  } finally {
    elements.remoteNewCodeButton.disabled = false;
  }
}

async function answerRemoteRequest(id, approve) {
  try {
    renderRemoteHost(await remotePost(`/api/remote/requests/${id}/${approve ? 'approve' : 'deny'}`));
  } catch (error) {
    elements.remoteHostCopy.textContent = error.message;
  }
}

async function endRemoteSession(tokenHint) {
  try {
    renderRemoteHost(await remotePost('/api/remote/end', { tokenHint }));
  } catch (error) {
    elements.remoteHostCopy.textContent = error.message;
  }
}

function stopRemoteStream() {
  remoteState.streaming = false;
  if (remoteState.frameTimer) {
    window.clearTimeout(remoteState.frameTimer);
    remoteState.frameTimer = null;
  }
  if (remoteState.frameUrl) {
    URL.revokeObjectURL(remoteState.frameUrl);
    remoteState.frameUrl = null;
  }
  elements.remoteScreen.removeAttribute('src');
}

function setStageBadge(text, state = 'idle') {
  elements.remoteStageBadge.textContent = text;
  elements.remoteStageBadge.dataset.state = state;
}

function scheduleRemoteFrame(delay) {
  if (!remoteState.streaming) return;
  if (remoteState.frameTimer) window.clearTimeout(remoteState.frameTimer);
  remoteState.frameTimer = window.setTimeout(() => { void pullRemoteFrame(); }, delay);
}

async function pullRemoteFrame() {
  if (!remoteState.streaming) return;
  if (document.hidden) {
    setStageBadge('ПАУЗА', 'idle');
    scheduleRemoteFrame(1500);
    return;
  }
  try {
    const response = await fetch(`/api/remote/screen?ts=${Date.now()}`, {
      credentials: 'same-origin',
      cache: 'no-store',
      headers: { Accept: 'image/jpeg' },
    });
    if (!response.ok) {
      let code = '';
      try { code = (await response.json())?.error?.code || ''; } catch { /* ignore */ }
      if (response.status === 401) {
        stopRemoteStream();
        await refreshRemoteSession();
        setPairStatus('Сессия завершена на компьютере. Введи новый код, чтобы продолжить.', 'error');
        return;
      }
      setStageBadge(code === 'slow_down' ? 'ЖДУ КАДР' : 'ЭКРАН НЕДОСТУПЕН', 'error');
      scheduleRemoteFrame(code === 'slow_down' ? 1200 : 4000);
      return;
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    elements.remoteScreen.src = url;
    if (remoteState.frameUrl) URL.revokeObjectURL(remoteState.frameUrl);
    remoteState.frameUrl = url;
    setStageBadge('ЭКРАН ПК', 'live');
    scheduleRemoteFrame(900);
  } catch {
    setStageBadge('НЕТ СВЯЗИ', 'error');
    scheduleRemoteFrame(3500);
  }
}

function startRemoteStream() {
  if (remoteState.streaming) return;
  if (!remoteState.capabilities.screen) {
    setStageBadge('ЗАХВАТ НЕДОСТУПЕН', 'error');
    return;
  }
  remoteState.streaming = true;
  void pullRemoteFrame();
}

function updateRemoteGuest(info) {
  remoteState.capabilities = info?.capabilities || { screen: false, input: false };
  remoteState.connected = Boolean(info?.connected);
  elements.remoteGuestPill.dataset.state = remoteState.connected ? 'on' : 'off';
  elements.remoteGuestPill.textContent = remoteState.connected ? 'ПОДКЛЮЧЕНО' : 'НЕ ПОДКЛЮЧЕНО';
  elements.remoteViewer.hidden = !remoteState.connected;
  elements.pairForm.hidden = remoteState.connected;
  for (const button of elements.remoteKeys) button.disabled = !remoteState.capabilities.input;
  elements.remoteBigPictureButton.disabled = !remoteState.capabilities.input;
  if (remoteState.connected) {
    setPairStatus(`Управление компьютером активно: ${info.session.device}.`, 'ok');
    startRemoteStream();
  } else {
    stopRemoteStream();
  }
}

async function refreshRemoteSession() {
  if (!elements.remoteGuestCard) return;
  try {
    updateRemoteGuest(await api('/api/remote/session'));
  } catch {
    elements.remoteGuestPill.dataset.state = 'off';
    elements.remoteGuestPill.textContent = 'НЕТ BACKEND';
    elements.remoteViewer.hidden = true;
  }
}

function stopPairPolling() {
  if (remoteState.pairTimer) {
    window.clearInterval(remoteState.pairTimer);
    remoteState.pairTimer = null;
  }
  remoteState.pair = null;
}

async function pollPairing() {
  if (!remoteState.pair) return;
  const { id, token } = remoteState.pair;
  try {
    const result = await api(`/api/remote/pair/status?id=${encodeURIComponent(id)}&token=${encodeURIComponent(token)}`);
    if (result.status === 'pending') {
      setPairStatus('Компьютер получил запрос. Подтверди подключение на его экране.', 'waiting');
      return;
    }
    stopPairPolling();
    if (result.status === 'approved') {
      setPairStatus('Готово: телефон подключён к компьютеру.', 'ok');
      elements.pairCodeInput.value = '';
      await refreshRemoteSession();
    } else {
      setPairStatus('Компьютер отклонил запрос. Попроси новый код и попробуй снова.', 'error');
    }
  } catch (error) {
    stopPairPolling();
    setPairStatus(error.message, 'error');
  }
}

async function startPairing(event) {
  event.preventDefault();
  const code = elements.pairCodeInput.value.replace(/\D+/g, '').slice(0, 6);
  if (code.length !== 6) {
    setPairStatus('Код состоит из шести цифр — посмотри его на компьютере.', 'error');
    elements.pairCodeInput.focus();
    return;
  }
  stopPairPolling();
  elements.pairButton.disabled = true;
  setPairStatus('Отправляю запрос компьютеру…', 'waiting');
  try {
    const device = navigator.userAgent.includes('Android') ? 'Android-устройство'
      : /iPhone|iPad|iPod/.test(navigator.userAgent) ? 'iPhone или iPad'
        : 'Браузер на телефоне';
    const created = await remotePost('/api/remote/pair', { code, device });
    remoteState.pair = { id: created.id, token: created.pollToken };
    setPairStatus('Компьютер получил запрос. Подтверди подключение на его экране.', 'waiting');
    remoteState.pairTimer = window.setInterval(() => { void pollPairing(); }, 2000);
    void pollPairing();
  } catch (error) {
    setPairStatus(error.message, 'error');
  } finally {
    elements.pairButton.disabled = false;
  }
}

async function sendRemoteKey(action) {
  if (!remoteState.connected || !remoteState.capabilities.input) return;
  try {
    await remotePost('/api/remote/input', { action });
    if (navigator.vibrate) navigator.vibrate(8);
  } catch (error) {
    setPairStatus(error.message, 'error');
    if (error.status === 401) await refreshRemoteSession();
  }
}

async function sendRemoteClick(event) {
  if (!remoteState.connected || !remoteState.capabilities.input) return;
  const image = elements.remoteScreen;
  const rect = image.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const naturalWidth = image.naturalWidth || rect.width;
  const naturalHeight = image.naturalHeight || rect.height;
  const scale = Math.min(rect.width / naturalWidth, rect.height / naturalHeight);
  const drawnWidth = naturalWidth * scale;
  const drawnHeight = naturalHeight * scale;
  const left = rect.left + (rect.width - drawnWidth) / 2;
  const top = rect.top + (rect.height - drawnHeight) / 2;
  const x = (event.clientX - left) / drawnWidth;
  const y = (event.clientY - top) / drawnHeight;
  if (x < 0 || x > 1 || y < 0 || y > 1) return;
  try {
    await remotePost('/api/remote/input', { action: 'click', x: Number(x.toFixed(4)), y: Number(y.toFixed(4)) });
    if (navigator.vibrate) navigator.vibrate(8);
  } catch (error) {
    setPairStatus(error.message, 'error');
  }
}

async function launchRemoteBigPicture() {
  if (!remoteState.connected || !remoteState.capabilities.input) return;
  try {
    await remotePost('/api/remote/launch', { target: 'bigpicture' });
    setPairStatus('Steam Big Picture запускается на компьютере.', 'ok');
  } catch (error) {
    setPairStatus(error.message, 'error');
  }
}

async function leaveRemoteSession() {
  stopRemoteStream();
  try {
    await remotePost('/api/remote/leave');
  } catch {
    // The local server may already have dropped the session.
  }
  setPairStatus('Сессия завершена. Введи новый код с компьютера, чтобы подключиться снова.', 'idle');
  await refreshRemoteSession();
}

async function initRemote() {
  if (!elements.remoteGuestCard) return;
  if (backendStatus?.remote?.managementAvailable) {
    elements.remoteHostCard.hidden = false;
    await refreshRemoteHost();
    scheduleRemoteHostRefresh();
  }
  await refreshRemoteSession();
  if (remoteState.connected) scheduleRemoteHostRefresh();
}

elements.pairForm.addEventListener('submit', (event) => { void startPairing(event); });
elements.pairCodeInput.addEventListener('input', () => {
  elements.pairCodeInput.value = elements.pairCodeInput.value.replace(/\D+/g, '').slice(0, 6);
});
elements.remoteToggleButton.addEventListener('click', () => { void toggleRemoteAccess(); });
elements.remoteNewCodeButton.addEventListener('click', () => { void requestRemoteCode(); });
elements.remoteRequestItems.addEventListener('click', (event) => {
  const target = event.target instanceof HTMLElement ? event.target : null;
  if (!target) return;
  if (target.dataset.approve) void answerRemoteRequest(target.dataset.approve, true);
  if (target.dataset.deny) void answerRemoteRequest(target.dataset.deny, false);
});
elements.remoteSessionItems.addEventListener('click', (event) => {
  const target = event.target instanceof HTMLElement ? event.target : null;
  if (target?.dataset.endSession) void endRemoteSession(target.dataset.endSession);
});
elements.remoteKeys.forEach((button) => button.addEventListener('click', () => { void sendRemoteKey(button.dataset.remoteKey); }));
elements.remoteStage.addEventListener('click', (event) => { void sendRemoteClick(event); });
elements.remoteBigPictureButton.addEventListener('click', () => { void launchRemoteBigPicture(); });
elements.remoteLeaveButton.addEventListener('click', () => { void leaveRemoteSession(); });
document.addEventListener('visibilitychange', () => {
  if (!remoteState.connected) return;
  if (document.hidden) {
    if (remoteState.frameTimer) window.clearTimeout(remoteState.frameTimer);
  } else {
    scheduleRemoteFrame(200);
  }
});

setupAppInstall();
void setupAppUpdates();
boot().finally(() => { void initRemote(); });
