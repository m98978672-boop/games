const demoGames = [
  {
    id: 'emberline', title: 'EMBERLINE', display: 'Emberline', genre: 'ACTION / ADVENTURE', subtitle: 'Пепел помнит каждый выбор', size: '78.4 ГБ', art: 'ember', symbol: 'E—01', status: 'Пример: Steam CDN', statusClass: '', installAvailable: true, cloudReady: true,
  },
  {
    id: 'orbit', title: 'ORBIT CIRCUIT', display: 'Orbit Circuit', genre: 'RACING / SIM', subtitle: 'Ночная лига, сектор 07', size: '62.1 ГБ', art: 'orbit', symbol: 'OC / 7', status: 'Пример: источник LAN', statusClass: 'is-queued', installAvailable: true, cloudReady: true,
  },
  {
    id: 'citadel', title: 'CITADEL: GLASS', display: 'Citadel: Glass', genre: 'RPG / TACTICAL', subtitle: 'Город над облаками', size: '94.8 ГБ', art: 'citadel', symbol: 'CG ◇', status: 'Пример: Steam CDN', statusClass: '', installAvailable: true, cloudReady: false,
  },
  {
    id: 'tidebreaker', title: 'TIDEBREAKER', display: 'Tidebreaker', genre: 'SURVIVAL / CO-OP', subtitle: 'За пределами шторма', size: '48.3 ГБ', art: 'tide', symbol: 'TB // 4', status: 'Пример: источник LAN', statusClass: 'is-queued', installAvailable: true, cloudReady: true,
  },
];

const gameGrid = document.querySelector('#gameGrid');
const emptyState = document.querySelector('#emptyState');
const searchInput = document.querySelector('#gameSearch');
const dialog = document.querySelector('#appDialog');
const dialogContent = document.querySelector('#dialogContent');
const navLinks = [...document.querySelectorAll('[data-nav]')];
let activeFilter = 'all';
let launchTimers = [];

function renderGames() {
  const query = (searchInput?.value || '').trim().toLocaleLowerCase('ru');
  const visibleGames = demoGames.filter((game) => {
    const matchesFilter = activeFilter === 'all'
      || (activeFilter === 'install' && game.installAvailable)
      || (activeFilter === 'cloud' && game.cloudReady);
    const matchesSearch = `${game.title} ${game.genre} ${game.subtitle}`.toLocaleLowerCase('ru').includes(query);
    return matchesFilter && matchesSearch;
  });

  gameGrid.innerHTML = visibleGames.map((game) => `
    <article class="game-card">
      <div class="game-cover cover-${game.art}" role="img" aria-label="Декоративная обложка игры ${game.display}">
        <span class="cover-kicker">PLAYBRIDGE / DEMO</span>
        <span class="cover-sigil">${game.symbol}</span>
        <span class="cover-title">${game.title}</span>
      </div>
      <div class="game-card-body">
        <div class="game-meta"><span class="game-genre">${game.genre}</span><span class="game-size">${game.size}</span></div>
        <h3 class="game-title">${game.display}</h3>
        <p class="game-subtitle">${game.subtitle}</p>
        <div class="game-status-row">
          <span class="game-status ${game.statusClass}"><i></i>${game.status}</span>
          <span class="game-status ${game.cloudReady ? 'is-cloud' : 'is-queued'}"><i></i>${game.cloudReady ? 'Облако · демо' : 'Совместимость проверить'}</span>
        </div>
        <div class="game-actions">
          <button class="game-action" type="button" data-action="install" data-game-id="${game.id}">На свой ПК</button>
          <button class="game-action cloud-action" type="button" data-action="cloud" data-game-id="${game.id}" ${game.cloudReady ? '' : 'disabled'}>${game.cloudReady ? 'В облако' : 'Проверить игру'}</button>
        </div>
      </div>
    </article>
  `).join('');

  emptyState.hidden = visibleGames.length > 0;
}

function getGame(id) {
  return demoGames.find((game) => game.id === id) || demoGames[0];
}

function setDialog(eyebrow, title, body, options = {}) {
  clearLaunchTimers();
  dialogContent.innerHTML = `
    <div class="dialog-head">
      <div><div class="dialog-eyebrow">${eyebrow}</div><h2 class="dialog-title" id="dialogTitle">${title}</h2></div>
      <button class="dialog-close" type="button" data-close aria-label="Закрыть">×</button>
    </div>
    <div class="dialog-body">${body}</div>
  `;
  if (!dialog.open) dialog.showModal();
  if (options.focusSelector) dialog.querySelector(options.focusSelector)?.focus();
}

function closeDialog() {
  clearLaunchTimers();
  if (dialog.open) dialog.close();
}

function clearLaunchTimers() {
  launchTimers.forEach((timer) => window.clearTimeout(timer));
  launchTimers = [];
}

function openConnectDialog() {
  setDialog('ПОДКЛЮЧЕНИЕ АККАУНТА · ПЛАН', 'Вход только через официальный Steam', `
    <p class="dialog-lede">В этой демоверсии подключения нет. В рабочем сервисе вход должен проходить через Steam OpenID: PLAYBRIDGE получает SteamID, а не пароль.</p>
    <div class="dialog-list">
      <div class="dialog-list-item"><span>01</span><div><strong>Подтвердить личность</strong><small>Пользователь переходит на страницу Steam и возвращается на сайт. Никакого поля для пароля Steam здесь быть не должно.</small></div></div>
      <div class="dialog-list-item"><span>02</span><div><strong>Показать библиотеку, если это разрешено</strong><small>Список игр зависит от доступных Steam API и настроек приватности профиля. OpenID сам по себе файлы игр не открывает.</small></div></div>
      <div class="dialog-list-item"><span>03</span><div><strong>Запустить выбранный сценарий</strong><small>Установка остаётся у официального клиента/разрешённого источника; облачный запуск требует отдельной технической и правовой схемы.</small></div></div>
    </div>
    <div class="dialog-note">PLAYBRIDGE — независимый концепт, не связанный с Valve. Не вводи данные Steam на этой странице: реального входа здесь нет.</div>
    <div class="dialog-actions"><button class="button button-outline" type="button" data-close>Понятно</button></div>
  `);
}

function openInstallDialog(game) {
  setDialog('РЕЖИМ 01 · УСТАНОВКА НА УСТРОЙСТВО', `Маршрут для ${game.display}`, `
    <p class="dialog-lede">Цель режима — доставить игру на твой компьютер, не заменяя Steam и не раздавая чужие копии.</p>
    <div class="dialog-list">
      <div class="dialog-list-item"><span>LAN</span><div><strong>Передача с твоего устройства в той же сети</strong><small>Если Steam-клиент уже хранит игру на другом твоём ПК в локальной сети, Steam может передать файлы напрямую.</small></div></div>
      <div class="dialog-list-item"><span>CDN</span><div><strong>Официальная доставка Steam</strong><small>Если локального источника нет, загрузка идёт через систему доставки Steam. Выигрыш зависит от маршрута и скорости соединения.</small></div></div>
      <div class="dialog-list-item"><span>EDGE</span><div><strong>Партнёрский узел — только по договору</strong><small>Внешний кэш игровых файлов возможен лишь при разрешении Valve и соответствующих правообладателей.</small></div></div>
    </div>
    <div class="dialog-note">Демо: мы не подключаем Steam, не проверяем сеть и не передаём файлы. Для локальной передачи открой в Steam: Настройки → Загрузки → Передача файлов игр по локальной сети.</div>
    <div class="dialog-actions"><button class="button button-outline" type="button" data-close>Закрыть</button><button class="button button-primary" type="button" data-action="show-route">Показать схему</button></div>
    <div id="routeResult" hidden></div>
  `);
}

function showRouteSchema() {
  const result = dialogContent.querySelector('#routeResult');
  if (!result) return;
  result.hidden = false;
  result.className = 'launch-box route-result';
  result.innerHTML = `
    <div class="launch-top"><span>ПОРЯДОК ПРОВЕРКИ В РЕАЛЬНОМ ПРОДУКТЕ</span><b>СХЕМА · НЕ ЗАПУЩЕНО</b></div>
    <div class="progress-track"><span style="width:100%;background:linear-gradient(90deg,#91dc4c,#d0f58b)"></span></div>
    <ul class="launch-steps"><li class="is-done">Проверить право доступа через разрешённую интеграцию</li><li class="is-done">Предложить Steam LAN transfer, если источник рядом</li><li class="is-current">Иначе передать пользователя в официальный Steam CDN</li></ul>
    <p class="dialog-lede" style="margin:12px 0 0">В демо показана только схема: Steam не открыт, сеть не проверена, загрузка не началась.</p>
  `;
  result.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

function openCloudDialog(game) {
  setDialog('РЕЖИМ 02 · ОБЛАЧНЫЙ ЗАПУСК', `Запустить ${game.display}`, `
    <p class="dialog-lede">Выбери примерный регион для демонстрации. Значения задержки ниже — макетные, реального теста сети нет.</p>
    <span class="choice-label">РЕГИОН СЕРВЕРА <span class="demo-tag">ОЦЕНКИ ДЕМО</span></span>
    <div class="choice-grid" role="radiogroup" aria-label="Регион облачного сервера">
      <label class="choice-card"><input type="radio" name="region" value="Волгоград" checked><strong>Волгоград</strong><small>~18 ms · пример</small></label>
      <label class="choice-card"><input type="radio" name="region" value="Москва"><strong>Москва</strong><small>~27 ms · пример</small></label>
      <label class="choice-card"><input type="radio" name="region" value="Казань"><strong>Казань</strong><small>~31 ms · пример</small></label>
    </div>
    <span class="choice-label">КАЧЕСТВО ПОТОКА</span>
    <div class="choice-grid" role="radiogroup" aria-label="Качество видеопотока">
      <label class="choice-card"><input type="radio" name="quality" value="1080p · 60 FPS" checked><strong>1080p · 60 FPS</strong><small>Рекомендуемое</small></label>
      <label class="choice-card"><input type="radio" name="quality" value="1440p · 60 FPS"><strong>1440p · 60 FPS</strong><small>Нужен быстрый канал</small></label>
      <label class="choice-card"><input type="radio" name="quality" value="720p · 30 FPS"><strong>720p · 30 FPS</strong><small>Для слабой сети</small></label>
    </div>
    <div class="dialog-note">Реальная облачная игра требует GPU-серверов, низкой задержки, официального запуска Steam-клиента и совместимости выбранной игры. Видеопоток и игровой процесс здесь не запускаются.</div>
    <div class="dialog-actions"><button class="button button-outline" type="button" data-close>Отмена</button><button class="button button-primary" type="button" data-action="start-cloud">Показать запуск <span aria-hidden="true">↗</span></button></div>
  `);
}

function startCloudDemo() {
  const region = dialogContent.querySelector('input[name="region"]:checked')?.value || 'Волгоград';
  const quality = dialogContent.querySelector('input[name="quality"]:checked')?.value || '1080p · 60 FPS';
  setDialog('ОБЛАЧНАЯ СЕССИЯ · ДЕМОНСТРАЦИЯ', 'Подготовка облачного запуска', `
    <p class="dialog-lede">Показываем интерфейс будущего процесса. Ни GPU-сервер, ни игра сейчас не запускаются.</p>
    <div class="launch-box">
      <div class="launch-top"><span id="launchLabel">Инициализация сценария…</span><b id="launchPercent">00%</b></div>
      <div class="progress-track"><span id="launchProgress"></span></div>
      <ul class="launch-steps" id="launchSteps"><li class="is-current">Выбрать регион ${region}</li><li>Подготовить изолированную игровую сессию</li><li>Открыть канал видеопотока WebRTC</li></ul>
    </div>
    <div class="dialog-note">Симуляция интерфейса, а не реальная загрузка, авторизация или трансляция.</div>
  `);

  const stages = [
    { width: '34%', percent: '34%', label: 'Выбираем регион сервера…' },
    { width: '68%', percent: '68%', label: 'Проверяем готовность игровой сессии…' },
    { width: '100%', percent: '100%', label: 'Интерфейс потока подготовлен' },
  ];
  stages.forEach((stage, index) => {
    const timer = window.setTimeout(() => {
      if (!dialog.open) return;
      const progress = dialogContent.querySelector('#launchProgress');
      const percent = dialogContent.querySelector('#launchPercent');
      const label = dialogContent.querySelector('#launchLabel');
      const steps = [...dialogContent.querySelectorAll('#launchSteps li')];
      if (!progress || !percent || !label) return;
      progress.style.width = stage.width;
      percent.textContent = stage.percent;
      label.textContent = stage.label;
      steps.forEach((item, itemIndex) => {
        item.classList.toggle('is-done', itemIndex < index);
        item.classList.toggle('is-current', itemIndex === index);
      });
      if (index === stages.length - 1) {
        const finishTimer = window.setTimeout(() => showStreamPreview(region, quality), 560);
        launchTimers.push(finishTimer);
      }
    }, 550 * (index + 1));
    launchTimers.push(timer);
  });
}

function showStreamPreview(region, quality) {
  if (!dialog.open) return;
  setDialog('ОБЛАЧНАЯ СЕССИЯ · ДЕМО', 'Экран облачной игры', `
    <div class="stream-stage" role="img" aria-label="Декоративная заставка, видеопоток не подключён">
      <div class="stream-topline">DEMO STREAM · ${region.toUpperCase()}</div>
      <div class="stream-sun"></div><div class="stream-horizon"></div>
      <div class="stream-message">ЗДЕСЬ БУДЕТ ВИДЕОПОТОК<br><span style="color:#7b929f">WEBRTC · НЕ ПОДКЛЮЧЕНО</span></div>
      <div class="stream-bottomline">INPUT: НЕ ПОДКЛЮЧЁН</div>
    </div>
    <div class="session-info"><span>${region.toUpperCase()} · ДЕМО</span><span>${quality}</span><span>СТАТУС: МАКЕТ</span></div>
    <div class="dialog-note">Сессия нарисована только для показа идеи. Игра не запущена; видео, звук и управление не передаются.</div>
    <div class="dialog-actions"><button class="button button-outline" type="button" data-close>Завершить демо</button></div>
  `);
}

function handleAction(action, gameId) {
  const game = getGame(gameId);
  if (action === 'connect') openConnectDialog();
  if (action === 'install') openInstallDialog(game);
  if (action === 'cloud') openCloudDialog(game);
  if (action === 'show-route') showRouteSchema();
  if (action === 'start-cloud') startCloudDemo();
}

document.addEventListener('click', (event) => {
  const actionButton = event.target.closest('[data-action]');
  if (actionButton) {
    handleAction(actionButton.dataset.action, actionButton.dataset.gameId);
    return;
  }

  if (event.target.closest('[data-close]')) {
    closeDialog();
    return;
  }

  const filterButton = event.target.closest('[data-filter]');
  if (filterButton) {
    activeFilter = filterButton.dataset.filter;
    document.querySelectorAll('.filter-tab').forEach((button) => {
      const isActive = button === filterButton;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });
    renderGames();
    return;
  }

  const navLink = event.target.closest('[data-nav]');
  if (navLink) {
    navLinks.forEach((link) => link.classList.toggle('is-active', link === navLink));
  }
});

searchInput?.addEventListener('input', renderGames);
dialog.addEventListener('click', (event) => {
  if (event.target === dialog) closeDialog();
});
dialog.addEventListener('close', clearLaunchTimers);

// Keyboard shortcut / focuses the library search field, except while typing in a form control.
document.addEventListener('keydown', (event) => {
  const target = event.target;
  const isTyping = target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));
  if (event.key === '/' && !isTyping && !dialog.open) {
    event.preventDefault();
    searchInput?.focus();
  }
  if (event.key === 'Escape' && dialog.open) closeDialog();
});

// Keep the navigation state in sync while the user scrolls through the one-page concept.
if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    const sectionId = visible.target.id;
    const navId = sectionId === 'modes' ? 'install' : sectionId === 'overview' ? 'overview' : sectionId;
    navLinks.forEach((link) => link.classList.toggle('is-active', link.dataset.nav === navId));
  }, { rootMargin: '-20% 0px -65% 0px', threshold: [0, .15, .35] });
  ['overview', 'install', 'cloud', 'library', 'trust'].forEach((id) => {
    const section = document.getElementById(id);
    if (section) sectionObserver.observe(section);
  });
}

renderGames();
