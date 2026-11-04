const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const elements = {
  sidebarStatus: $('#sidebarStatus'),
  sidebarStatusTitle: $('#sidebarStatusTitle'),
  sidebarStatusText: $('#sidebarStatusText'),
  serverBadge: $('#serverBadge'),
  serviceNotice: $('#serviceNotice'),
  noticeIcon: $('#noticeIcon'),
  noticeTitle: $('#noticeTitle'),
  noticeText: $('#noticeText'),
  connectButton: $('#connectButton'),
  logoutButton: $('#logoutButton'),
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
};

const PAGE_SIZE = 48;
let backendStatus = null;
let games = [];
let activeFilter = 'all';
let visibleLimit = PAGE_SIZE;

class ApiError extends Error {
  constructor(code, message, status = 0) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
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
  elements.profileTitle.textContent = 'Не подключено';
  elements.profileSub.textContent = 'API не найден';
  elements.logoutButton.hidden = true;
  setNotice('offline', 'Серверная часть не запущена', `${error.message} GitHub Pages отдаёт только файлы сайта; Steam-вход и библиотека требуют backend. Инструкция — по ссылке «Настроить сервер».`);
  elements.librarySourceWrap.dataset.state = 'offline';
  elements.librarySource.textContent = 'BACKEND OFFLINE';
  elements.gameSearch.disabled = true;
  elements.filterButtons.forEach((button) => { button.disabled = true; });
  setLibraryState('offline', 'Подключение к библиотеке недоступно', 'Запусти локальный backend командой из README или разверни его за HTTPS reverse proxy. Демо-игры больше не подставляются.');
  updateCloudStatus(null);
}

function updateCloudStatus(status) {
  elements.cloudState.dataset.state = 'offline';
  $('strong', elements.cloudState).textContent = 'Провайдер не подключён';
  $('small', elements.cloudState).textContent = status?.cloud?.provider ? 'Провайдер ожидает проверки' : 'Нужны GPU-провайдер и договор';
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
  updateCloudStatus(status);

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

function updateProfile(session) {
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
  kicker.textContent = 'STEAM LIBRARY';
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
  subtitle.textContent = 'Получено от Steam Web API';

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
    const title = games.length === 0 ? 'Steam API вернул пустой список' : 'По запросу игр не найдено';
    const message = games.length === 0
      ? 'Это может означать пустую библиотеку или закрытые настройки «Сведения об играх». Сделай их публичными и обнови список.'
      : 'Измени запрос или переключи фильтр библиотеки.';
    setLibraryState('empty', title, message);
  }
}

async function loadGames() {
  elements.gameSearch.disabled = false;
  elements.filterButtons.forEach((button) => { button.disabled = false; });
  elements.libraryState.hidden = false;
  elements.libraryState.dataset.state = 'loading';
  $('strong', elements.libraryState).textContent = 'Запрашиваю библиотеку у Steam';
  $('p', elements.libraryState).textContent = 'Игры и время запуска читаются из Steam Web API.';
  elements.librarySourceWrap.dataset.state = 'pending';
  elements.librarySource.textContent = 'STEAM API';

  try {
    const result = await api('/api/games');
    games = Array.isArray(result.games) ? result.games : [];
    const count = Number.isFinite(result.totalCount) ? result.totalCount : games.length;
    elements.gameCount.textContent = String(count);
    elements.navGameCount.textContent = String(count).padStart(2, '0');
    elements.librarySub.textContent = result.notice || 'Показаны игры, которые Steam API разрешил этому приложению увидеть.';
    elements.librarySourceWrap.dataset.state = 'ready';
    elements.librarySource.textContent = 'STEAM WEB API';
    renderGames();
  } catch (error) {
    elements.gameCount.textContent = '—';
    elements.navGameCount.textContent = '—';
    elements.librarySourceWrap.dataset.state = 'offline';
    elements.librarySource.textContent = 'API ERROR';
    if (error.code === 'steam_web_api_key_missing') {
      setLibraryState('error', 'Не задан Steam Web API key', 'Добавь STEAM_WEB_API_KEY на сервере и перезапусти его. Не вставляй ключ на эту страницу.');
    } else if (error.code === 'games_not_public') {
      setLibraryState('error', 'Steam не отдал список игр', 'Проверь приватность «Сведения об играх» в профиле Steam. Частный список нельзя безопасно обойти.');
    } else {
      setLibraryState('error', 'Не удалось получить библиотеку', error.message);
    }
  }
}

async function boot() {
  const params = new URLSearchParams(window.location.search);
  if (params.has('auth_error')) {
    setNotice('offline', 'Steam не подтвердил вход', 'Авторизация не завершилась. Проверь callback URL и вернись к настройке backend.');
    window.history.replaceState({}, '', window.location.pathname + window.location.hash);
  }

  try {
    const status = await api('/api/status');
    applyBackendStatus(status);
    const session = await api('/api/session');
    updateProfile(session);
    if (session.authenticated) {
      elements.librarySource.textContent = 'STEAM API';
      await loadGames();
    } else {
      elements.gameCount.textContent = '—';
      elements.navGameCount.textContent = '—';
      elements.librarySub.textContent = status.steam?.libraryReady
        ? 'Войди через Steam OpenID, чтобы запросить видимую библиотеку.'
        : 'Сначала настрой сервер и Steam Web API key; никакие демо-игры не подставляются.';
      elements.librarySource.textContent = 'ОЖИДАЕТ ВХОД';
      setLibraryState('idle', 'Библиотека не загружена', 'Нажми «Войти через Steam» после настройки backend. При закрытых настройках игр Steam может вернуть пустой список.');
    }
  } catch (error) {
    setBackendUnavailable(error);
  }
}

elements.connectButton.addEventListener('click', () => {
  if (!elements.connectButton.disabled && backendStatus?.steam?.loginReady) {
    window.location.assign('/auth/steam/start');
  }
});

elements.logoutButton.addEventListener('click', async () => {
  elements.logoutButton.disabled = true;
  try {
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

$$('[data-nav]').forEach((link) => link.addEventListener('click', () => {
  $$('[data-nav]').forEach((candidate) => candidate.classList.toggle('is-active', candidate === link));
}));

document.addEventListener('keydown', (event) => {
  const target = event.target;
  const isTyping = target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));
  if (event.key === '/' && !isTyping) {
    event.preventDefault();
    elements.gameSearch.focus();
  }
});

boot();
