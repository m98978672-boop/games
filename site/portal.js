/* ==========================================================================
   Games — движок витрины в стиле Steam + Мастерская добавления игр для всех.
   Объединяет официальный каталог (17 игр) и пользовательские игры (GamesUserHub),
   поддерживает поиск, фильтры, избранное, недавние, предпросмотр, безопасный
   sandbox-плеер, менеджер сохранений (Save Hub), prefetch и офлайн Service Worker.
   ========================================================================== */
(function () {
  'use strict';

  const baseCatalog = Array.isArray(window.GAMES_CATALOG) ? window.GAMES_CATALOG : [];
  const baseCategories = Array.isArray(window.GAMES_CATEGORIES) ? window.GAMES_CATEGORIES : [];
  const spotlightIds = Array.isArray(window.GAMES_SPOTLIGHT_IDS) ? window.GAMES_SPOTLIGHT_IDS : [];
  const userHub = window.GamesUserHub || null;
  if (!baseCatalog.length) return;

  const rootPrefix = (document.body && document.body.getAttribute('data-root')) || '';
  let lastNonFatalNote = '';
  function recordNonFatal(tag, err) { lastNonFatalNote = tag + ':' + String(err || ''); return lastNonFatalNote; }

  const STORAGE_FAVS = 'games_portal_favs_v1';
  const STORAGE_RECENT = 'games_portal_recent_v1';
  const STORAGE_VIEW = 'games_portal_view_v1';

  const prefersReducedMotion =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const categories = baseCategories.slice();
  if (!categories.some((c) => c.id === 'user')) {
    categories.push({ id: 'user', label: 'От игроков' });
  }

  function resolvePath(rel) {
    if (!rel) return '#';
    if (/^(?:https?:|data:|#|mailto:)/i.test(rel)) return rel;
    return rootPrefix + rel;
  }

  function safeReadJson(key, fallback) {
    try {
      const raw = window.localStorage && window.localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return parsed == null ? fallback : parsed;
    } catch (err) {
      recordNonFatal();
      return fallback;
    }
  }

  function safeWriteJson(key, value) {
    try {
      if (window.localStorage) window.localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      recordNonFatal();
    }
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = String(text);
    return node;
  }

  function showToast(msg) {
    const host = document.getElementById('toast-host');
    if (!host) return;
    const item = el('div', 'toast-msg', msg);
    host.appendChild(item);
    setTimeout(() => item.remove(), 3200);
  }

  // ---------------------------- Объединённый каталог ----------------------------
  let catalog = [];
  let byId = new Map();
  let searchIndex = new Map();

  function rebuildCatalog() {
    const userGames = userHub ? userHub.getAll() : [];
    catalog = [...baseCatalog, ...userGames];
    byId = new Map(catalog.map((g) => [g.id, g]));
    searchIndex = new Map();
    for (const game of catalog) {
      const hay = [
        game.title,
        game.subtitle,
        game.description,
        game.dim,
        game.badge,
        game.author,
        game.updateNote,
        ...(game.categories || []),
        ...(game.features || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      searchIndex.set(game.id, hay);
    }
  }

  rebuildCatalog();

  function createCoverPicture(game, eager) {
    const picture = document.createElement('picture');
    const cover = game.cover || {};
    if (cover.webp) {
      const source = document.createElement('source');
      source.type = 'image/webp';
      source.srcset = resolvePath(cover.webp);
      picture.appendChild(source);
    }
    const img = document.createElement('img');
    img.src = resolvePath(cover.src || '');
    img.alt = cover.alt || game.title;
    img.width = 1280;
    img.height = 720;
    img.decoding = 'async';
    img.loading = eager ? 'eager' : 'lazy';
    if (eager) img.setAttribute('fetchpriority', 'high');
    picture.appendChild(img);
    return picture;
  }

  // ---------------------------- Состояние ----------------------------
  const state = {
    query: '',
    category: 'all',
    sort: 'new',
    view: safeReadJson(STORAGE_VIEW, 'grid') === 'list' ? 'list' : 'grid',
    favs: new Set(
      (Array.isArray(safeReadJson(STORAGE_FAVS, [])) ? safeReadJson(STORAGE_FAVS, []) : [])
        .filter((id) => byId.has(id))
    ),
    recent: (Array.isArray(safeReadJson(STORAGE_RECENT, [])) ? safeReadJson(STORAGE_RECENT, []) : [])
      .filter((id) => byId.has(id))
      .slice(0, 6),
    spotlightIdx: 0,
    modalGameId: null,
    pendingImportGame: null,
    studioSourceMode: 'url',
    studioCustomCover: '',
  };

  // Читаем параметры URL (?q=&cat=&sort=&importGame=)
  try {
    if (window.location && typeof URLSearchParams === 'function') {
      const params = new URLSearchParams(window.location.search || '');
      const q = params.get('q');
      const cat = params.get('cat');
      const sort = params.get('sort');
      const imp = params.get('importGame');
      if (q) state.query = q.slice(0, 80);
      if (cat && categories.some((c) => c.id === cat)) state.category = cat;
      if (sort && ['new', 'featured', 'alpha', 'recent'].includes(sort)) state.sort = sort;
      if (imp && userHub) {
        state.pendingImportGame = userHub.decodeShareParam(imp);
      }
    }
  } catch (err) {
    recordNonFatal();
  }

  function syncUrl() {
    try {
      if (!window.history || typeof window.history.replaceState !== 'function') return;
      if (window.location.protocol !== 'http:' && window.location.protocol !== 'https:') return;
      const params = new URLSearchParams();
      if (state.query.trim()) params.set('q', state.query.trim());
      if (state.category !== 'all') params.set('cat', state.category);
      if (state.sort !== 'new') params.set('sort', state.sort);
      const qs = params.toString();
      const next = window.location.pathname + (qs ? '?' + qs : '') + (window.location.hash || '');
      window.history.replaceState(null, '', next);
    } catch (err) {
      recordNonFatal();
    }
  }

  // ---------------------------- Prefetch при наведении ----------------------------
  const prefetchedUrls = new Set();
  function prefetchGame(game) {
    if (!game || game.isUserGame) return;
    if (window.location.protocol !== 'http:' && window.location.protocol !== 'https:') return;
    const href = resolvePath(game.play);
    if (!href || href === '#' || prefetchedUrls.has(href)) return;
    prefetchedUrls.add(href);
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    document.head.appendChild(link);
  }

  // ---------------------------- Запуск игры ----------------------------
  function recordPlay(gameId) {
    if (!byId.has(gameId)) return;
    state.recent = [gameId, ...state.recent.filter((id) => id !== gameId)].slice(0, 6);
    safeWriteJson(STORAGE_RECENT, state.recent);
    renderRecent();
  }

  function launchGame(game) {
    if (!game) return;
    recordPlay(game.id);
    if (game.isUserGame && game.sourceType === 'html') {
      openSandboxPlayer(game);
      return;
    }
    const url = game.isUserGame ? game.playUrl : resolvePath(game.play);
    if (game.isUserGame) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = url;
    }
  }

  function toggleFav(gameId) {
    if (!byId.has(gameId)) return;
    if (state.favs.has(gameId)) state.favs.delete(gameId);
    else state.favs.add(gameId);
    safeWriteJson(STORAGE_FAVS, Array.from(state.favs));
    updateCounters();
    renderCategoryPills();
    renderSidebarCategories();
    renderCatalog();
    renderSpotlight();
    if (state.modalGameId === gameId) renderModalBody(byId.get(gameId));
  }

  // ---------------------------- Счётчики и устройство ----------------------------
  function updateCounters() {
    const userCount = userHub ? userHub.getAll().length : 0;
    const newCount = baseCatalog.filter((g) => g.isNew).length;
    document.querySelectorAll('[data-games-total]').forEach((n) => {
      n.textContent = String(catalog.length);
    });
    document.querySelectorAll('[data-games-new]').forEach((n) => {
      n.textContent = String(newCount);
    });
    document.querySelectorAll('[data-user-games-count]').forEach((n) => {
      n.textContent = String(userCount);
    });
    document.querySelectorAll('[data-fav-count]').forEach((n) => {
      n.textContent = String(state.favs.size);
    });
    const deviceBadge = document.getElementById('device-mode-badge');
    if (deviceBadge) {
      const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
      deviceBadge.textContent = isTouch && window.innerWidth < 900 ? 'Телефон' : 'ПК';
    }
  }

  // ---------------------------- Главная карусель Steam ----------------------------
  const spotlightGames = spotlightIds.map((id) => byId.get(id)).filter(Boolean);
  let spotTimer = null;

  function renderSpotlight() {
    if (!spotlightGames.length) return;
    const game = spotlightGames[state.spotlightIdx % spotlightGames.length];
    const artHost = document.querySelector('[data-spot-art]');
    const artLink = document.querySelector('[data-spot-art-link]');
    const badge = document.querySelector('[data-spot-badge]');
    const dim = document.querySelector('[data-spot-dim]');
    const title = document.querySelector('[data-spot-title]');
    const sub = document.querySelector('[data-spot-sub]');
    const note = document.querySelector('[data-spot-note]');
    const tiles = document.querySelector('[data-spot-tiles]');
    const play = document.querySelector('[data-spot-play]');
    const info = document.querySelector('[data-spot-info]');
    const favBtn = document.querySelector('[data-spot-fav]');
    const dots = document.querySelector('[data-spot-dots]');
    const ambient = document.getElementById('hero-ambient');

    if (artHost) {
      artHost.replaceChildren(createCoverPicture(game, true));
    }
    const href = resolvePath(game.play);
    if (artLink) {
      artLink.href = href;
      artLink.setAttribute('data-track-game', game.id);
    }
    if (badge) {
      badge.textContent = game.badge || 'Новинка';
      badge.className = 'gcard-badge ' + (game.badgeTone || 'is-new');
    }
    if (dim) dim.textContent = game.dim || '';
    if (title) title.textContent = game.title;
    if (sub) sub.textContent = game.subtitle;
    if (note) note.textContent = game.updateNote || game.description;

    if (tiles) {
      tiles.replaceChildren(
        ...(game.features || []).slice(0, 4).map((f) => el('div', 'spot-tile', f))
      );
    }

    if (play) {
      play.href = href;
      play.setAttribute('data-track-game', game.id);
    }
    if (info) info.setAttribute('data-open-modal', game.id);

    if (favBtn) {
      const isFav = state.favs.has(game.id);
      favBtn.textContent = isFav ? '★' : '♡';
      favBtn.setAttribute('aria-pressed', String(isFav));
      favBtn.setAttribute('data-fav-toggle', game.id);
    }

    if (ambient && game.accent) {
      ambient.style.background = `radial-gradient(760px 360px at 38% 45%, ${game.accent}33, transparent 70%)`;
    }

    if (dots) {
      dots.replaceChildren(
        ...spotlightGames.map((g, idx) => {
          const btn = el('button', 'spot-dot' + (idx === state.spotlightIdx ? ' active' : ''));
          btn.type = 'button';
          btn.setAttribute('aria-label', g.title);
          btn.addEventListener('click', () => {
            state.spotlightIdx = idx;
            renderSpotlight();
            restartSpotTimer();
          });
          return btn;
        })
      );
    }
  }

  function stepSpotlight(delta) {
    if (!spotlightGames.length) return;
    state.spotlightIdx = (state.spotlightIdx + delta + spotlightGames.length) % spotlightGames.length;
    renderSpotlight();
  }

  function restartSpotTimer() {
    if (spotTimer) clearInterval(spotTimer);
    if (prefersReducedMotion || spotlightGames.length < 2) return;
    spotTimer = setInterval(() => {
      if (!document.hidden) stepSpotlight(1);
    }, 7500);
  }

  // ---------------------------- Недавние / Продолжить ----------------------------
  function renderRecent() {
    const sec = document.getElementById('recent-section');
    const listEl = document.getElementById('recent-list');
    if (!sec || !listEl) return;
    const valid = state.recent.map((id) => byId.get(id)).filter(Boolean);
    sec.hidden = valid.length === 0;
    if (!valid.length) return;

    listEl.replaceChildren(
      ...valid.map((game) => {
        const chip = el('a', 'recent-chip');
        chip.href = game.isUserGame && game.sourceType === 'html' ? '#play-user-' + game.id : (game.isUserGame ? game.playUrl : resolvePath(game.play));
        if (game.isUserGame && game.sourceType === 'url') {
          chip.target = '_blank';
          chip.rel = 'noopener noreferrer';
        }
        chip.addEventListener('click', (e) => {
          if (game.isUserGame && game.sourceType === 'html') {
            e.preventDefault();
            launchGame(game);
          } else {
            recordPlay(game.id);
          }
        });
        const img = document.createElement('img');
        img.src = resolvePath(game.cover?.webp || game.cover?.src || '');
        img.alt = '';
        img.width = 48;
        img.height = 27;
        chip.append(img, el('span', '', game.title), el('span', 'rc-play', '▶'));
        return chip;
      })
    );
  }

  // ---------------------------- Новинки ----------------------------
  function renderNewReleases() {
    const grid = document.getElementById('new-releases-grid');
    if (!grid) return;
    const items = baseCatalog.filter((g) => g.isNew).slice(0, 6);
    grid.replaceChildren(
      ...items.map((game) => {
        const card = el('article', 'rel-card');
        card.addEventListener('mouseenter', () => prefetchGame(game), { once: true });

        const media = el('a', 'rel-media');
        media.href = resolvePath(game.play);
        media.setAttribute('data-track-game', game.id);
        media.append(
          createCoverPicture(game, false),
          el('span', 'gcard-badge ' + (game.badgeTone || 'is-new'), game.badge || 'Новинка'),
          el('span', 'gcard-dim', game.dim || '')
        );

        const body = el('div', 'rel-body');
        body.append(
          el('h3', 'rel-title', game.title),
          el('p', 'rel-note', game.updateNote || game.subtitle)
        );

        const foot = el('div', 'rel-foot');
        const left = el('span', 'steam-free-pill', 'БЕСПЛАТНО');
        const actions = el('div', 'gcard-actions');
        const infoBtn = el('button', 'btn btn-steam-ghost btn-sm', 'Инфо');
        infoBtn.type = 'button';
        infoBtn.setAttribute('data-open-modal', game.id);
        const playLink = el('a', 'btn btn-steam-play btn-sm', '▶ Играть');
        playLink.href = resolvePath(game.play);
        playLink.setAttribute('data-track-game', game.id);
        actions.append(infoBtn, playLink);
        foot.append(left, actions);
        body.append(foot);

        card.append(media, body);
        return card;
      })
    );
  }

  // ---------------------------- Фильтрация и категории ----------------------------
  function matchesCategory(game, catId) {
    if (catId === 'all') return true;
    if (catId === 'new') return !!game.isNew && !game.isUserGame;
    if (catId === 'fav') return state.favs.has(game.id);
    if (catId === 'user') return !!game.isUserGame;
    return Array.isArray(game.categories) && game.categories.includes(catId);
  }

  function countForCategory(catId) {
    let n = 0;
    for (const g of catalog) if (matchesCategory(g, catId)) n++;
    return n;
  }

  function renderCategoryPills() {
    const host = document.getElementById('category-pills');
    if (!host) return;
    host.replaceChildren(
      ...categories.map((cat) => {
        const cnt = countForCategory(cat.id);
        const btn = el('button', 'cat-pill' + (state.category === cat.id ? ' active' : ''));
        btn.type = 'button';
        btn.setAttribute('aria-pressed', String(state.category === cat.id));
        btn.append(el('span', '', cat.label), el('span', 'cat-pill-count', String(cnt)));
        btn.addEventListener('click', () => {
          state.category = cat.id;
          syncUrl();
          renderCategoryPills();
          renderSidebarCategories();
          renderRibbonActive();
          renderCatalog();
        });
        return btn;
      })
    );
  }

  function renderSidebarCategories() {
    const host = document.getElementById('sidebar-categories');
    if (!host) return;
    host.replaceChildren(
      ...categories
        .filter((c) => c.id !== 'fav' && c.id !== 'user')
        .map((cat) => {
          const btn = el('button', 'side-link' + (state.category === cat.id ? ' is-active' : ''));
          btn.type = 'button';
          btn.append(el('span', '', cat.label), el('span', 'side-badge', String(countForCategory(cat.id))));
          btn.addEventListener('click', () => selectCategoryAndScroll(cat.id));
          return btn;
        })
    );
  }

  function renderRibbonActive() {
    document.querySelectorAll('[data-quick-cat]').forEach((btn) => {
      const cat = btn.getAttribute('data-quick-cat');
      btn.classList.toggle('is-active', cat === state.category);
    });
  }

  function selectCategoryAndScroll(catId) {
    state.category = catId;
    syncUrl();
    renderCategoryPills();
    renderSidebarCategories();
    renderRibbonActive();
    renderCatalog();
    const gamesEl = document.getElementById('games');
    if (gamesEl) gamesEl.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
  }

  function buildGameCard(game) {
    const card = el('article', 'gcard');
    card.addEventListener('mouseenter', () => prefetchGame(game), { once: true });

    const media = el('div', 'gcard-media');
    const coverLink = el('a', '');
    if (game.isUserGame && game.sourceType === 'html') {
      coverLink.href = '#play-user-' + game.id;
      coverLink.addEventListener('click', (e) => {
        e.preventDefault();
        launchGame(game);
      });
    } else if (game.isUserGame) {
      coverLink.href = game.playUrl;
      coverLink.target = '_blank';
      coverLink.rel = 'noopener noreferrer';
      coverLink.addEventListener('click', () => recordPlay(game.id));
    } else {
      coverLink.href = resolvePath(game.play);
      coverLink.setAttribute('data-track-game', game.id);
    }
    coverLink.setAttribute('aria-label', `Играть: ${game.title}`);
    coverLink.append(createCoverPicture(game, false));

    const favBtn = el('button', 'gcard-fav' + (state.favs.has(game.id) ? ' is-fav' : ''), state.favs.has(game.id) ? '★' : '♡');
    favBtn.type = 'button';
    favBtn.setAttribute('aria-label', state.favs.has(game.id) ? 'Убрать из избранного' : 'В избранное');
    favBtn.setAttribute('aria-pressed', String(state.favs.has(game.id)));
    favBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFav(game.id);
    });

    media.append(
      coverLink,
      el('span', 'gcard-badge ' + (game.badgeTone || ''), game.badge || (game.isUserGame ? 'Сообщество' : 'Игра')),
      el('span', 'gcard-dim', game.dim || ''),
      favBtn
    );

    const body = el('div', 'gcard-body');
    body.append(
      el('h3', 'gcard-title', game.title),
      el('p', 'gcard-sub', game.subtitle),
      el('p', 'gcard-desc', game.description)
    );

    const tags = el('div', 'gcard-tags');
    for (const f of (game.features || []).slice(0, 3)) {
      tags.append(el('span', 'gcard-tag', f.length > 26 ? f.slice(0, 25) + '…' : f));
    }
    body.append(tags);

    const foot = el('div', 'gcard-foot');
    foot.append(el('span', 'steam-free-pill', game.isUserGame ? (game.sourceType === 'html' ? 'SANDBOX' : 'ВЕБ') : 'БЕСПЛАТНО'));

    const actions = el('div', 'gcard-actions');
    const infoBtn = el('button', 'btn btn-steam-ghost btn-sm', 'Подробнее');
    infoBtn.type = 'button';
    infoBtn.setAttribute('data-open-modal', game.id);

    let playBtn;
    if (game.isUserGame && game.sourceType === 'html') {
      playBtn = el('button', 'btn btn-steam-play btn-sm', '▶ Играть');
      playBtn.type = 'button';
      playBtn.addEventListener('click', () => launchGame(game));
    } else if (game.isUserGame) {
      playBtn = el('a', 'btn btn-steam-play btn-sm', '▶ Открыть ↗');
      playBtn.href = game.playUrl;
      playBtn.target = '_blank';
      playBtn.rel = 'noopener noreferrer';
      playBtn.addEventListener('click', () => recordPlay(game.id));
    } else {
      playBtn = el('a', 'btn btn-steam-play btn-sm', '▶ Играть');
      playBtn.href = resolvePath(game.play);
      playBtn.setAttribute('data-track-game', game.id);
    }

    actions.append(infoBtn, playBtn);
    foot.append(actions);
    body.append(foot);

    card.append(media, body);
    return card;
  }

  function getFilteredGames() {
    const q = state.query.trim().toLowerCase();
    const tokens = q ? q.split(/\s+/).filter(Boolean) : [];
    const list = catalog.filter((game) => {
      if (!matchesCategory(game, state.category)) return false;
      if (!tokens.length) return true;
      const hay = searchIndex.get(game.id) || '';
      return tokens.every((t) => hay.includes(t));
    });

    list.sort((a, b) => {
      if (state.sort === 'alpha') return a.title.localeCompare(b.title, 'ru');
      if (state.sort === 'recent') {
        const ia = state.recent.indexOf(a.id);
        const ib = state.recent.indexOf(b.id);
        if (ia !== -1 || ib !== -1) return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
      }
      if (state.sort === 'featured') {
        return (a.featuredRank || 99) - (b.featuredRank || 99);
      }
      // 'new'
      const newDiff = Number(!!b.isNew) - Number(!!a.isNew);
      if (newDiff !== 0) return newDiff;
      return (a.featuredRank || 99) - (b.featuredRank || 99);
    });
    return list;
  }

  function renderCatalog() {
    const grid = document.getElementById('catalog-grid');
    const empty = document.getElementById('catalog-empty');
    const status = document.getElementById('catalog-status');
    if (!grid) return;

    grid.classList.toggle('is-list', state.view === 'list');
    const items = getFilteredGames();
    grid.replaceChildren(...items.map(buildGameCard));
    if (empty) empty.hidden = items.length > 0;
    if (status) status.textContent = `Показано ${items.length} из ${catalog.length}`;
  }

  // ---------------------------- Секция пользовательских игр ----------------------------
  function renderUserGamesSection() {
    const grid = document.getElementById('user-games-grid');
    const empty = document.getElementById('user-games-empty');
    const exportBtn = document.getElementById('export-user-pack-btn');
    if (!grid || !userHub) return;

    const list = userHub.getAll();
    if (empty) empty.hidden = list.length > 0;
    if (exportBtn) exportBtn.hidden = list.length === 0;
    grid.replaceChildren(...list.map(buildGameCard));
  }

  // ---------------------------- Модалка Quick Inspect ----------------------------
  function renderModalBody(game) {
    const content = document.getElementById('game-modal-content');
    if (!content || !game) return;

    const frag = document.createDocumentFragment();
    const hero = el('div', 'gmodal-hero');
    hero.append(
      createCoverPicture(game, true),
      el('span', 'gcard-badge ' + (game.badgeTone || ''), game.badge || 'Игра'),
      el('span', 'gcard-dim', game.dim || '')
    );

    const body = el('div', 'gmodal-body');
    const h2 = el('h2', '', game.title);
    h2.id = 'game-modal-title';
    body.append(h2, el('p', 'gmodal-sub', game.subtitle), el('p', 'gmodal-desc', game.description));

    if (game.features && game.features.length) {
      const ul = el('ul', 'gmodal-features');
      for (const f of game.features) ul.append(el('li', '', f));
      body.append(ul);
    }

    if (game.controls) {
      const ctrl = el('div', 'gmodal-controls');
      ctrl.append(el('strong', '', 'Управление: '), document.createTextNode(game.controls));
      body.append(ctrl);
    }

    const actions = el('div', 'gmodal-actions');

    if (game.isUserGame && game.sourceType === 'html') {
      const playBtn = el('button', 'btn btn-steam-play', '▶ Запустить в плеере');
      playBtn.type = 'button';
      playBtn.addEventListener('click', () => {
        closeGameModal();
        launchGame(game);
      });
      actions.append(playBtn);
    } else if (game.isUserGame) {
      const playLink = el('a', 'btn btn-steam-play', '▶ Открыть игру ↗');
      playLink.href = game.playUrl;
      playLink.target = '_blank';
      playLink.rel = 'noopener noreferrer';
      playLink.addEventListener('click', () => recordPlay(game.id));
      actions.append(playLink);
    } else {
      const playLink = el('a', 'btn btn-steam-play', '▶ Играть сейчас');
      playLink.href = resolvePath(game.play);
      playLink.setAttribute('data-track-game', game.id);
      actions.append(playLink);
    }

    const favBtn = el('button', 'btn btn-steam-ghost', state.favs.has(game.id) ? '★ В избранном' : '♡ В избранное');
    favBtn.type = 'button';
    favBtn.addEventListener('click', () => toggleFav(game.id));
    actions.append(favBtn);

    if (!game.isUserGame && game.info) {
      const readmeLink = el('a', 'btn btn-steam-ghost', 'Документация ↗');
      readmeLink.href = resolvePath(game.info);
      actions.append(readmeLink);
    }

    if (game.isUserGame && userHub) {
      const shareBtn = el('button', 'btn btn-steam-blue', '🔗 Поделиться');
      shareBtn.type = 'button';
      shareBtn.addEventListener('click', () => shareUserGame(game));

      const pubBtn = el('button', 'btn btn-steam-ghost', '🌍 Опубликовать всем');
      pubBtn.type = 'button';
      pubBtn.addEventListener('click', () => {
        closeGameModal();
        openAddGameModal('publish', game);
      });

      const editBtn = el('button', 'btn btn-steam-ghost', '✎ Изменить');
      editBtn.type = 'button';
      editBtn.addEventListener('click', () => {
        closeGameModal();
        openAddGameModal('create', game);
      });

      const delBtn = el('button', 'btn btn-danger', 'Удалить');
      delBtn.type = 'button';
      delBtn.addEventListener('click', () => {
        userHub.remove(game.id);
        closeGameModal();
        showToast(`Игра «${game.title}» удалена из локальной библиотеки`);
      });

      actions.append(shareBtn, pubBtn, editBtn, delBtn);
    }

    body.append(actions);
    frag.append(hero, body);
    content.replaceChildren(frag);
  }

  function openGameModal(gameId) {
    const game = byId.get(gameId);
    const root = document.getElementById('game-modal');
    if (!game || !root) return;
    state.modalGameId = gameId;
    renderModalBody(game);
    root.hidden = false;
    document.body.classList.add('modal-open');
  }

  function closeGameModal() {
    const root = document.getElementById('game-modal');
    if (!root || root.hidden) return;
    root.hidden = true;
    state.modalGameId = null;
    syncModalScrollLock();
  }

  function syncModalScrollLock() {
    const anyOpen = ['game-modal', 'add-game-modal', 'sandbox-player-modal', 'save-hub-modal']
      .some((id) => {
        const n = document.getElementById(id);
        return n && !n.hidden;
      });
    document.body.classList.toggle('modal-open', anyOpen);
  }

  // ---------------------------- Поделиться пользовательской игрой ----------------------------
  function shareUserGame(game) {
    if (!userHub) return;
    const shareUrl = userHub.encodeShareLink(game);
    if (shareUrl && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      navigator.clipboard.writeText(shareUrl)
        .then(() => showToast('Ссылка на игру скопирована! Отправь её другу — он добавит игру в 1 клик.'))
        .catch(() => {
          userHub.triggerDownload(`${game.slug}.gamespack.json`, userHub.exportPack([game]), 'application/json');
          showToast('Скачан файл .gamespack.json — отправь его другу!');
        });
      return;
    }
    userHub.triggerDownload(`${game.slug}.gamespack.json`, userHub.exportPack([game]), 'application/json');
    showToast('Скачан файл .gamespack.json — его можно импортировать в 1 клик!');
  }

  // ---------------------------- Безопасный Sandbox-плеер ----------------------------
  function openSandboxPlayer(game) {
    const root = document.getElementById('sandbox-player-modal');
    const iframe = document.getElementById('sandbox-iframe');
    const title = document.getElementById('sandbox-player-title');
    const author = document.getElementById('sandbox-player-author');
    if (!root || !iframe || !game || !game.htmlCode) return;

    if (title) title.textContent = game.title;
    if (author) author.textContent = `Автор: ${game.author || 'Сообщество'}`;
    iframe.srcdoc = game.htmlCode;
    root.hidden = false;
    document.body.classList.add('modal-open');
  }

  function closeSandboxPlayer() {
    const root = document.getElementById('sandbox-player-modal');
    const iframe = document.getElementById('sandbox-iframe');
    if (!root || root.hidden) return;
    if (iframe) iframe.srcdoc = '';
    root.hidden = true;
    syncModalScrollLock();
  }

  // ---------------------------- Студия добавления игр (для всех!) ----------------------------
  function readStudioDraft() {
    const title = (document.getElementById('ug-title')?.value || '').trim();
    const author = (document.getElementById('ug-author')?.value || '').trim();
    const subtitle = (document.getElementById('ug-subtitle')?.value || '').trim();
    const category = document.getElementById('ug-category')?.value || '2d';
    const description = (document.getElementById('ug-desc')?.value || '').trim();
    const features = (document.getElementById('ug-features')?.value || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 4);
    const playUrl = (document.getElementById('ug-url')?.value || '').trim();
    const htmlCode = document.getElementById('ug-html-code')?.value || '';
    const theme = document.getElementById('ug-theme')?.value || 'steam';
    const icon = (document.getElementById('ug-icon')?.value || '🎮').trim() || '🎮';
    const editId = document.getElementById('ug-edit-id')?.value || '';

    return {
      id: editId || undefined,
      title: title || 'Ваша игра',
      author: author || 'Автор сообщества',
      subtitle: subtitle || 'Браузерная игра сообщества',
      category,
      description: description || 'Описание появится здесь в реальном времени.',
      features: features.length ? features : ['Добавлено игроком', 'Браузерная', 'Бесплатно'],
      sourceType: state.studioSourceMode === 'url' ? 'url' : 'html',
      playUrl,
      htmlCode,
      theme,
      icon,
      customCoverData: state.studioCustomCover,
    };
  }

  function refreshStudioPreviewAndPublish() {
    if (!userHub) return;
    const draft = readStudioDraft();
    const svg = userHub.generateCoverSvg(draft);
    const coverSrc = draft.customCoverData || userHub.svgToDataUri(svg);

    const img = document.getElementById('ug-preview-img');
    const dim = document.getElementById('ug-preview-dim');
    const title = document.getElementById('ug-preview-title');
    const sub = document.getElementById('ug-preview-sub');
    const desc = document.getElementById('ug-preview-desc');
    const tags = document.getElementById('ug-preview-tags');

    if (img) img.src = coverSrc;
    if (dim) dim.textContent = (userHub.CATEGORY_MAP[draft.category] || userHub.CATEGORY_MAP['2d']).dim;
    if (title) title.textContent = draft.title;
    if (sub) sub.textContent = draft.subtitle;
    if (desc) desc.textContent = draft.description;
    if (tags) tags.replaceChildren(...draft.features.slice(0, 3).map((t) => el('span', 'gcard-tag', t)));

    // Обновляем вкладку публикации для всех
    const slug = userHub.slugify(draft.title);
    const entry = userHub.buildCommunityJsonEntry({ ...draft, slug });
    const jsonEl = document.getElementById('ug-publish-json');
    const slugEl = document.getElementById('ug-publish-slug');
    const issueLink = document.getElementById('ug-github-issue-link');
    const dlHtml = document.getElementById('ug-dl-html');

    if (jsonEl) jsonEl.textContent = JSON.stringify(entry, null, 2);
    if (slugEl) slugEl.textContent = `${slug}/`;
    if (issueLink) issueLink.href = userHub.buildGitHubIssueUrl({ ...draft, slug });
    if (dlHtml) dlHtml.hidden = !draft.htmlCode.trim();
  }

  function setStudioTab(tabName) {
    document.querySelectorAll('[data-studio-tab]').forEach((btn) => {
      const on = btn.getAttribute('data-studio-tab') === tabName;
      btn.classList.toggle('active', on);
      btn.setAttribute('aria-selected', String(on));
    });
    document.querySelectorAll('[data-studio-panel]').forEach((panel) => {
      panel.hidden = panel.getAttribute('data-studio-panel') !== tabName;
    });
    refreshStudioPreviewAndPublish();
  }

  function setStudioSourceMode(mode) {
    state.studioSourceMode = mode;
    document.querySelectorAll('[data-source-mode]').forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-source-mode') === mode);
    });
    document.querySelectorAll('[data-source-pane]').forEach((pane) => {
      pane.hidden = pane.getAttribute('data-source-pane') !== mode;
    });
  }

  function openAddGameModal(initialTab, existingGame) {
    const root = document.getElementById('add-game-modal');
    if (!root) return;
    const status = document.getElementById('ug-form-status');
    if (status) {
      status.textContent = '';
      status.classList.remove('is-error');
    }

    if (existingGame) {
      document.getElementById('ug-edit-id').value = existingGame.id || '';
      document.getElementById('ug-title').value = existingGame.title || '';
      document.getElementById('ug-author').value = existingGame.author || '';
      document.getElementById('ug-subtitle').value = existingGame.subtitle || '';
      document.getElementById('ug-category').value = existingGame.category || '2d';
      document.getElementById('ug-desc').value = existingGame.description || '';
      document.getElementById('ug-features').value = (existingGame.features || []).join(', ');
      document.getElementById('ug-url').value = existingGame.playUrl || '';
      document.getElementById('ug-html-code').value = existingGame.htmlCode || '';
      document.getElementById('ug-theme').value = existingGame.theme || 'steam';
      document.getElementById('ug-icon').value = existingGame.icon || '🎮';
      state.studioCustomCover = existingGame.customCoverData || '';
      setStudioSourceMode(existingGame.sourceType === 'html' ? 'code' : 'url');
      document.getElementById('ug-submit-btn').textContent = '✓ Сохранить изменения';
    } else {
      document.getElementById('ug-edit-id').value = '';
      document.getElementById('ug-submit-btn').textContent = '▶ Добавить на витрину';
    }

    const resetBtn = document.getElementById('ug-cover-reset');
    if (resetBtn) resetBtn.hidden = !state.studioCustomCover;

    setStudioTab(initialTab === 'publish' ? 'publish' : 'create');
    root.hidden = false;
    document.body.classList.add('modal-open');
    refreshStudioPreviewAndPublish();
  }

  function closeAddGameModal() {
    const root = document.getElementById('add-game-modal');
    if (!root || root.hidden) return;
    root.hidden = true;
    syncModalScrollLock();
  }

  // ---------------------------- Save Hub (Менеджер сохранений) ----------------------------
  function collectLocalStorageSnapshot() {
    const entries = {};
    let totalBytes = 0;
    try {
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (!key) continue;
        const val = window.localStorage.getItem(key) || '';
        entries[key] = val;
        totalBytes += key.length + val.length;
      }
    } catch (err) {
      recordNonFatal();
    }
    return { entries, totalBytes };
  }

  function renderSaveHub() {
    const statsEl = document.getElementById('savehub-stats');
    const listEl = document.getElementById('savehub-list');
    if (!statsEl || !listEl) return;

    const { entries, totalBytes } = collectLocalStorageSnapshot();
    const keys = Object.keys(entries).sort();
    statsEl.replaceChildren(
      el('span', 'hstat', `Ключей: ${keys.length}`),
      el('span', 'hstat', `Объём: ${(totalBytes / 1024).toFixed(1)} КБ`),
      el('span', 'hstat', `Моих игр: ${userHub ? userHub.getAll().length : 0}`)
    );

    if (!keys.length) {
      listEl.replaceChildren(el('p', 'field-hint', 'Пока нет сохранённых данных в этом браузере.'));
      return;
    }

    listEl.replaceChildren(
      ...keys.map((key) => {
        const row = el('div', 'savehub-row');
        const kb = ((entries[key].length + key.length) / 1024).toFixed(1);
        row.append(el('code', '', key), el('span', '', `${kb} КБ`));
        return row;
      })
    );
  }

  function openSaveHub() {
    const root = document.getElementById('save-hub-modal');
    if (!root) return;
    const status = document.getElementById('savehub-status');
    if (status) status.textContent = '';
    renderSaveHub();
    root.hidden = false;
    document.body.classList.add('modal-open');
  }

  function closeSaveHub() {
    const root = document.getElementById('save-hub-modal');
    if (!root || root.hidden) return;
    root.hidden = true;
    syncModalScrollLock();
  }

  // ---------------------------- Баннер импорта ?importGame=... ----------------------------
  function renderImportBanner() {
    const banner = document.getElementById('import-banner');
    const titleEl = document.getElementById('import-banner-title');
    const metaEl = document.getElementById('import-banner-meta');
    if (!banner || !state.pendingImportGame) return;

    if (titleEl) titleEl.textContent = state.pendingImportGame.title;
    if (metaEl) metaEl.textContent = `Автор: ${state.pendingImportGame.author} — ${state.pendingImportGame.description}`;
    banner.hidden = false;
  }

  // ---------------------------- Атмосферный фон Steam (оптимизированный) ----------------------------
  function initHeroCanvas() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas || prefersReducedMotion) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const nodes = [];
    const COUNT = 28;
    let w = 0;
    let h = 0;
    let rafId = 0;

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = Math.max(300, Math.floor(rect.width));
      h = Math.max(240, Math.floor(rect.height));
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!nodes.length) {
        for (let i = 0; i < COUNT; i++) {
          nodes.push({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 16,
            vy: (Math.random() - 0.5) * 12,
            r: 1.2 + Math.random() * 1.8,
          });
        }
      }
    }

    let last = performance.now();
    function tick(now) {
      rafId = 0;
      if (document.hidden) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < nodes.length; i++) {
        const p = nodes[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.x < 0) p.x += w;
        else if (p.x > w) p.x -= w;
        if (p.y < 0) p.y += h;
        else if (p.y > h) p.y -= h;

        ctx.fillStyle = 'rgba(102, 192, 244, 0.45)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();

        for (let j = i + 1; j < nodes.length; j++) {
          const q = nodes[j];
          const dist = Math.hypot(p.x - q.x, p.y - q.y);
          if (dist < 130) {
            ctx.strokeStyle = `rgba(102, 192, 244, ${(1 - dist / 130) * 0.16})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      }
      rafId = requestAnimationFrame(tick);
    }

    resize();
    window.addEventListener('resize', resize, { passive: true });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = 0;
        }
      } else if (!rafId) {
        last = performance.now();
        rafId = requestAnimationFrame(tick);
      }
    });
    rafId = requestAnimationFrame(tick);
  }

  // ---------------------------- Привязка всех событий ----------------------------
  function bindEvents() {
    const searchInput = document.getElementById('catalog-search');
    const searchClear = document.getElementById('catalog-search-clear');
    const sortSelect = document.getElementById('catalog-sort');

    if (searchInput) {
      searchInput.value = state.query;
      if (searchClear) searchClear.hidden = !state.query;
      searchInput.addEventListener('input', () => {
        state.query = searchInput.value;
        if (searchClear) searchClear.hidden = !state.query;
        syncUrl();
        renderCatalog();
      });
    }
    if (searchClear) {
      searchClear.addEventListener('click', () => {
        state.query = '';
        if (searchInput) {
          searchInput.value = '';
          searchInput.focus();
        }
        searchClear.hidden = true;
        syncUrl();
        renderCatalog();
      });
    }
    if (sortSelect) {
      sortSelect.value = state.sort;
      sortSelect.addEventListener('change', () => {
        state.sort = sortSelect.value;
        syncUrl();
        renderCatalog();
      });
    }

    document.querySelectorAll('[data-view-mode]').forEach((btn) => {
      const mode = btn.getAttribute('data-view-mode');
      btn.classList.toggle('active', mode === state.view);
      btn.setAttribute('aria-pressed', String(mode === state.view));
      btn.addEventListener('click', () => {
        state.view = mode === 'list' ? 'list' : 'grid';
        safeWriteJson(STORAGE_VIEW, state.view);
        document.querySelectorAll('[data-view-mode]').forEach((b) => {
          const on = b.getAttribute('data-view-mode') === state.view;
          b.classList.toggle('active', on);
          b.setAttribute('aria-pressed', String(on));
        });
        renderCatalog();
      });
    });

    const resetBtn = document.getElementById('catalog-reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        state.query = '';
        state.category = 'all';
        if (searchInput) searchInput.value = '';
        if (searchClear) searchClear.hidden = true;
        syncUrl();
        renderCategoryPills();
        renderSidebarCategories();
        renderRibbonActive();
        renderCatalog();
      });
    }

    const recentClear = document.getElementById('recent-clear');
    if (recentClear) {
      recentClear.addEventListener('click', () => {
        state.recent = [];
        safeWriteJson(STORAGE_RECENT, []);
        renderRecent();
      });
    }

    // Делегирование кликов
    document.addEventListener('click', (e) => {
      const target = e.target instanceof Element ? e.target : null;
      if (!target) return;

      const track = target.closest('[data-track-game]');
      if (track) recordPlay(track.getAttribute('data-track-game'));

      const modalTrigger = target.closest('[data-open-modal]');
      if (modalTrigger) {
        e.preventDefault();
        openGameModal(modalTrigger.getAttribute('data-open-modal'));
        return;
      }

      const favTrigger = target.closest('[data-fav-toggle]');
      if (favTrigger) {
        e.preventDefault();
        toggleFav(favTrigger.getAttribute('data-fav-toggle'));
        return;
      }

      const addTrigger = target.closest('[data-open-add-game]');
      if (addTrigger) {
        e.preventDefault();
        openAddGameModal(addTrigger.getAttribute('data-open-add-game') || 'create', null);
        return;
      }

      if (target.closest('[data-open-save-hub]')) {
        e.preventDefault();
        openSaveHub();
        return;
      }

      if (target.closest('[data-focus-search]')) {
        e.preventDefault();
        const input = document.getElementById('catalog-search');
        if (input) {
          input.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'center' });
          setTimeout(() => input.focus(), 120);
        }
        return;
      }

      if (target.closest('[data-random-game]')) {
        e.preventDefault();
        const pick = catalog[Math.floor(Math.random() * catalog.length)];
        if (pick) openGameModal(pick.id);
        return;
      }

      const quickCat = target.closest('[data-quick-cat]');
      if (quickCat) {
        e.preventDefault();
        selectCategoryAndScroll(quickCat.getAttribute('data-quick-cat'));
        return;
      }

      if (target.closest('[data-spot-prev]')) {
        stepSpotlight(-1);
        restartSpotTimer();
        return;
      }
      if (target.closest('[data-spot-next]')) {
        stepSpotlight(1);
        restartSpotTimer();
        return;
      }

      if (target.closest('[data-modal-backdrop]') || target.closest('#game-modal-close')) {
        closeGameModal();
        return;
      }
      if (target.closest('[data-close-add-modal]')) {
        closeAddGameModal();
        return;
      }
      if (target.closest('[data-close-sandbox]')) {
        closeSandboxPlayer();
        return;
      }
      if (target.closest('[data-close-save-hub]')) {
        closeSaveHub();
        return;
      }

      const tabBtn = target.closest('[data-studio-tab]');
      if (tabBtn) {
        setStudioTab(tabBtn.getAttribute('data-studio-tab'));
        return;
      }

      const srcBtn = target.closest('[data-source-mode]');
      if (srcBtn) {
        setStudioSourceMode(srcBtn.getAttribute('data-source-mode'));
        refreshStudioPreviewAndPublish();
      }
    });

    // Горячие клавиши: / поиск, R случайная игра, Esc закрыть окна
    document.addEventListener('keydown', (e) => {
      const tag = (e.target && e.target.tagName) || '';
      const inField = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
      if (e.key === 'Escape') {
        closeSandboxPlayer();
        closeAddGameModal();
        closeSaveHub();
        closeGameModal();
        return;
      }
      if (inField || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === '/') {
        e.preventDefault();
        const input = document.getElementById('catalog-search');
        if (input) {
          input.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'center' });
          input.focus();
        }
      } else if (e.key === 'r' || e.key === 'R' || e.key === 'к' || e.key === 'К') {
        const pick = catalog[Math.floor(Math.random() * catalog.length)];
        if (pick) openGameModal(pick.id);
      }
    });

    // Форма добавления игры
    const addForm = document.getElementById('add-game-form');
    if (addForm && userHub) {
      addForm.addEventListener('input', refreshStudioPreviewAndPublish);
      addForm.addEventListener('change', refreshStudioPreviewAndPublish);

      addForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const status = document.getElementById('ug-form-status');
        const titleVal = (document.getElementById('ug-title')?.value || '').trim();
        const descVal = (document.getElementById('ug-desc')?.value || '').trim();
        const urlVal = (document.getElementById('ug-url')?.value || '').trim();
        const htmlVal = document.getElementById('ug-html-code')?.value || '';

        if (!titleVal || !descVal) {
          if (status) {
            status.textContent = 'Укажите название и описание игры.';
            status.classList.add('is-error');
          }
          return;
        }
        if (state.studioSourceMode === 'url' && !userHub.validatePlayUrl(urlVal)) {
          if (status) {
            status.textContent = 'Укажите корректную ссылку, начинающуюся с https:// (или загрузите HTML-файл).';
            status.classList.add('is-error');
          }
          return;
        }
        if (state.studioSourceMode !== 'url' && !htmlVal.trim()) {
          if (status) {
            status.textContent = 'Загрузите .html файл или вставьте HTML/JS код (можно нажать «Вставить шаблон мини-игры»).';
            status.classList.add('is-error');
          }
          return;
        }

        const draft = readStudioDraft();
        const res = userHub.upsert(draft);
        if (!res.ok) {
          if (status) {
            status.textContent = res.error || 'Не удалось сохранить игру.';
            status.classList.add('is-error');
          }
          return;
        }
        if (status) {
          status.textContent = `Игра «${res.game.title}» добавлена на витрину!`;
          status.classList.remove('is-error');
        }
        state.studioCustomCover = '';
        addForm.reset();
        closeAddGameModal();
        showToast(`✓ Игра «${res.game.title}» добавлена в каталог!`);
      });

      document.getElementById('ug-to-publish-btn')?.addEventListener('click', () => setStudioTab('publish'));

      document.getElementById('ug-insert-template')?.addEventListener('click', () => {
        const titleEl = document.getElementById('ug-title');
        const authorEl = document.getElementById('ug-author');
        const subEl = document.getElementById('ug-subtitle');
        const descEl = document.getElementById('ug-desc');
        const codeEl = document.getElementById('ug-html-code');
        if (titleEl && !titleEl.value.trim()) titleEl.value = 'Охотник за звёздами';
        if (authorEl && !authorEl.value.trim()) authorEl.value = 'Игрок';
        if (subEl && !subEl.value.trim()) subEl.value = 'Быстрая аркада на Canvas прямо в браузере';
        if (descEl && !descEl.value.trim()) descEl.value = 'Лови светящиеся звёзды кликом и набирай очки. Работает в безопасном sandbox-плеере.';
        if (codeEl) codeEl.value = userHub.STARTER_MINI_GAME;
        setStudioSourceMode('code');
        refreshStudioPreviewAndPublish();
        showToast('Готовый шаблон мини-игры вставлен — жми «Добавить на витрину»!');
      });

      document.getElementById('ug-html-file')?.addEventListener('change', (ev) => {
        const file = ev.target.files && ev.target.files[0];
        if (!file) return;
        const label = document.getElementById('ug-html-file-label');
        const reader = new FileReader();
        reader.onload = () => {
          const text = String(reader.result || '');
          const codeEl = document.getElementById('ug-html-code');
          if (codeEl) codeEl.value = text;
          if (label) label.textContent = `Загружен файл: ${file.name} (${(file.size / 1024).toFixed(1)} КБ)`;
          const titleEl = document.getElementById('ug-title');
          if (titleEl && !titleEl.value.trim()) {
            titleEl.value = file.name.replace(/\.(?:html|htm)$/i, '').slice(0, 60);
          }
          refreshStudioPreviewAndPublish();
        };
        reader.readAsText(file);
      });

      document.getElementById('ug-cover-file')?.addEventListener('change', (ev) => {
        const file = ev.target.files && ev.target.files[0];
        if (!file) return;
        userHub.compressImageFile(file)
          .then((dataUrl) => {
            state.studioCustomCover = dataUrl;
            const resetCover = document.getElementById('ug-cover-reset');
            if (resetCover) resetCover.hidden = false;
            refreshStudioPreviewAndPublish();
            showToast('Обложка сжата и применена!');
          })
          .catch((err) => showToast(err.message || 'Не удалось загрузить картинку.'));
      });

      document.getElementById('ug-cover-reset')?.addEventListener('click', () => {
        state.studioCustomCover = '';
        const resetCover = document.getElementById('ug-cover-reset');
        if (resetCover) resetCover.hidden = true;
        refreshStudioPreviewAndPublish();
      });

      document.getElementById('ug-copy-json')?.addEventListener('click', () => {
        const txt = document.getElementById('ug-publish-json')?.textContent || '';
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(txt)
            .then(() => showToast('JSON-запись для community-games.json скопирована!'))
            .catch(() => showToast('Выделите и скопируйте JSON из окна вручную.'));
        }
      });

      document.getElementById('ug-dl-svg')?.addEventListener('click', () => {
        const draft = readStudioDraft();
        userHub.triggerDownload('cover.svg', userHub.generateCoverSvg(draft), 'image/svg+xml');
      });

      document.getElementById('ug-dl-readme')?.addEventListener('click', () => {
        const draft = readStudioDraft();
        userHub.triggerDownload('README.md', userHub.buildReadmeMarkdown(draft), 'text/markdown');
      });

      document.getElementById('ug-dl-html')?.addEventListener('click', () => {
        const draft = readStudioDraft();
        if (draft.htmlCode) userHub.triggerDownload('index.html', draft.htmlCode, 'text/html');
      });
    }

    // Экспорт / импорт пакетов .gamespack.json
    document.getElementById('export-user-pack-btn')?.addEventListener('click', () => {
      if (!userHub) return;
      userHub.triggerDownload('my-games.gamespack.json', userHub.exportPack(), 'application/json');
      showToast('Пакет пользовательских игр скачан!');
    });

    const packBtn = document.getElementById('import-pack-btn');
    const packInput = document.getElementById('import-pack-input');
    if (packBtn && packInput && userHub) {
      packBtn.addEventListener('click', () => packInput.click());
      packInput.addEventListener('change', (ev) => {
        const file = ev.target.files && ev.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          const res = userHub.importPack(String(reader.result || ''));
          showToast(res.ok ? `Импортировано игр: ${res.added}!` : (res.error || 'Ошибка импорта.'));
          packInput.value = '';
        };
        reader.readAsText(file);
      });
    }

    // Баннер импорта из ссылки друга
    document.getElementById('import-banner-accept')?.addEventListener('click', () => {
      if (!userHub || !state.pendingImportGame) return;
      const res = userHub.upsert(state.pendingImportGame);
      const banner = document.getElementById('import-banner');
      if (banner) banner.hidden = true;
      state.pendingImportGame = null;
      if (res.ok) showToast(`Игра «${res.game.title}» от друга добавлена в каталог!`);
    });
    document.getElementById('import-banner-dismiss')?.addEventListener('click', () => {
      const banner = document.getElementById('import-banner');
      if (banner) banner.hidden = true;
      state.pendingImportGame = null;
    });

    // Полный экран в sandbox-плеере
    document.getElementById('sandbox-fullscreen-btn')?.addEventListener('click', () => {
      const iframe = document.getElementById('sandbox-iframe');
      if (iframe && typeof iframe.requestFullscreen === 'function') {
        iframe.requestFullscreen().catch((err) => {
          recordNonFatal();
        });
      }
    });

    // Save Hub экспорт / импорт
    document.getElementById('savehub-export')?.addEventListener('click', () => {
      if (!userHub) return;
      const snap = collectLocalStorageSnapshot();
      const dump = JSON.stringify({
        schema: 'games-save-backup/1',
        exportedAt: new Date().toISOString(),
        entries: snap.entries,
      }, null, 2);
      userHub.triggerDownload('games-saves-backup.json', dump, 'application/json');
      const st = document.getElementById('savehub-status');
      if (st) st.textContent = 'Полный бэкап сохранений скачан!';
    });

    const shBtn = document.getElementById('savehub-import-btn');
    const shInput = document.getElementById('savehub-import-input');
    if (shBtn && shInput) {
      shBtn.addEventListener('click', () => shInput.click());
      shInput.addEventListener('change', (ev) => {
        const file = ev.target.files && ev.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          const st = document.getElementById('savehub-status');
          try {
            const parsed = JSON.parse(String(reader.result || ''));
            const entries = parsed && parsed.entries && typeof parsed.entries === 'object' ? parsed.entries : null;
            if (!entries) throw new Error('Неверный формат файла бэкапа.');
            let count = 0;
            for (const [k, v] of Object.entries(entries)) {
              if (typeof v === 'string' && k.length < 120) {
                try {
                  window.localStorage.setItem(k, v);
                  count++;
                } catch (writeErr) {
                  recordNonFatal();
                }
              }
            }
            if (st) st.textContent = `Восстановлено записей: ${count}. Обновляю витрину…`;
            setTimeout(() => window.location.reload(), 650);
          } catch (err) {
            if (st) st.textContent = err.message || 'Не удалось прочитать файл бэкапа.';
          }
          shInput.value = '';
        };
        reader.readAsText(file);
      });
    }

    // Реакция на добавление/удаление пользовательских игр
    if (userHub) {
      userHub.onChange(() => {
        rebuildCatalog();
        updateCounters();
        renderCategoryPills();
        renderSidebarCategories();
        renderCatalog();
        renderUserGamesSection();
        renderRecent();
      });
    }
  }

  // ---------------------------- Service Worker (PWA офлайн) ----------------------------
  function registerServiceWorker() {
    try {
      if (!('serviceWorker' in navigator)) return;
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') return;
      navigator.serviceWorker.register(resolvePath('sw.js')).catch((err) => {
        recordNonFatal();
      });
    } catch (err) {
      recordNonFatal();
    }
  }

  // ---------------------------- Старт ----------------------------
  updateCounters();
  renderSpotlight();
  renderRecent();
  renderNewReleases();
  renderCategoryPills();
  renderSidebarCategories();
  renderRibbonActive();
  renderCatalog();
  renderUserGamesSection();
  renderImportBanner();
  bindEvents();
  restartSpotTimer();
  initHeroCanvas();
  registerServiceWorker();
})();
