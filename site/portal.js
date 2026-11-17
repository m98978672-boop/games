/* ==========================================================================
   Games — движок витрины: поиск, фильтры, новинки, избранное, недавние,
   модальный предпросмотр и оптимизированный фон героя.
   Без внешних зависимостей; работает с file://, локально и на GitHub Pages.
   ========================================================================== */
(function () {
  'use strict';

  const catalog = Array.isArray(window.GAMES_CATALOG) ? window.GAMES_CATALOG : [];
  const categories = Array.isArray(window.GAMES_CATEGORIES) ? window.GAMES_CATEGORIES : [];
  const spotlightIds = Array.isArray(window.GAMES_SPOTLIGHT_IDS) ? window.GAMES_SPOTLIGHT_IDS : [];
  if (!catalog.length) return;

  const rootPrefix = (document.body && document.body.getAttribute('data-root')) || '';
  const byId = new Map(catalog.map((g) => [g.id, g]));

  const STORAGE_FAVS = 'games_portal_favs_v1';
  const STORAGE_RECENT = 'games_portal_recent_v1';
  const STORAGE_VIEW = 'games_portal_view_v1';

  const prefersReducedMotion =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
    } catch {
      return fallback;
    }
  }

  function safeWriteJson(key, value) {
    try {
      if (window.localStorage) window.localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      if (typeof console !== 'undefined' && console.debug) console.debug('storage write skipped', err);
    }
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = String(text);
    return node;
  }

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
    if (eager) {
      img.setAttribute('fetchpriority', 'high');
    }
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
    modalRandomMode: false,
  };

  // Читаем начальные фильтры из URL (если http/https)
  try {
    if (window.location && typeof URLSearchParams === 'function') {
      const params = new URLSearchParams(window.location.search || '');
      const q = params.get('q');
      const cat = params.get('cat');
      const sort = params.get('sort');
      if (q) state.query = q.slice(0, 80);
      if (cat && categories.some((c) => c.id === cat)) state.category = cat;
      if (sort && ['new', 'featured', 'alpha', 'recent'].includes(sort)) state.sort = sort;
    }
  } catch (err) {
    if (typeof console !== 'undefined' && console.debug) console.debug('url parse skipped', err);
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
      if (typeof console !== 'undefined' && console.debug) console.debug('url sync skipped', err);
    }
  }

  function recordPlay(gameId) {
    if (!byId.has(gameId)) return;
    state.recent = [gameId, ...state.recent.filter((id) => id !== gameId)].slice(0, 6);
    safeWriteJson(STORAGE_RECENT, state.recent);
    renderRecent();
  }

  function toggleFav(gameId) {
    if (!byId.has(gameId)) return;
    if (state.favs.has(gameId)) state.favs.delete(gameId);
    else state.favs.add(gameId);
    safeWriteJson(STORAGE_FAVS, Array.from(state.favs));
    renderCategoryPills();
    renderCatalog();
    if (state.modalGameId === gameId) renderModalBody(byId.get(gameId));
  }

  // ---------------------------- Поиск ----------------------------
  const searchIndex = new Map();
  for (const game of catalog) {
    const haystack = [
      game.title,
      game.subtitle,
      game.description,
      game.updateNote,
      game.dimension,
      game.tech,
      game.badge,
      game.keywords,
      ...(game.features || []),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    searchIndex.set(game.id, haystack);
  }

  function matchesCategory(game, catId) {
    if (catId === 'all') return true;
    if (catId === 'fav') return state.favs.has(game.id);
    if (catId === 'new') return Boolean(game.isNew);
    return Array.isArray(game.categories) && game.categories.includes(catId);
  }

  function matchesQuery(game, rawQuery) {
    const q = rawQuery.trim().toLowerCase();
    if (!q) return true;
    const text = searchIndex.get(game.id) || '';
    const tokens = q.split(/\s+/).filter(Boolean);
    return tokens.every((tok) => text.includes(tok));
  }

  function getFilteredGames() {
    const list = catalog.filter(
      (g) => matchesCategory(g, state.category) && matchesQuery(g, state.query)
    );
    const recentOrder = new Map(state.recent.map((id, i) => [id, i]));
    list.sort((a, b) => {
      if (state.sort === 'alpha') {
        return a.title.localeCompare(b.title, 'ru');
      }
      if (state.sort === 'featured') {
        return (b.featured || 0) - (a.featured || 0) || (b.releaseOrder || 0) - (a.releaseOrder || 0);
      }
      if (state.sort === 'recent') {
        const ra = recentOrder.has(a.id) ? recentOrder.get(a.id) : 999;
        const rb = recentOrder.has(b.id) ? recentOrder.get(b.id) : 999;
        if (ra !== rb) return ra - rb;
        return (b.releaseOrder || 0) - (a.releaseOrder || 0);
      }
      // default: 'new'
      return (b.releaseOrder || 0) - (a.releaseOrder || 0);
    });
    return list;
  }

  // ---------------------------- Счётчики в шапке ----------------------------
  const totalCountEls = document.querySelectorAll('[data-games-total]');
  totalCountEls.forEach((n) => { n.textContent = String(catalog.length); });
  const newCountEls = document.querySelectorAll('[data-games-new]');
  const newCount = catalog.filter((g) => g.isNew).length;
  newCountEls.forEach((n) => { n.textContent = String(newCount); });

  // ---------------------------- Hero Spotlight ----------------------------
  const spotlightGames = spotlightIds.map((id) => byId.get(id)).filter(Boolean);
  const spotlightRoot = document.getElementById('hero-spotlight');
  let spotlightTimer = null;
  let spotlightPaused = false;

  function renderSpotlight() {
    if (!spotlightRoot || !spotlightGames.length) return;
    const game = spotlightGames[state.spotlightIdx % spotlightGames.length];
    if (!game) return;

    const artBox = spotlightRoot.querySelector('[data-spot-art]');
    const badgeEl = spotlightRoot.querySelector('[data-spot-badge]');
    const dimEl = spotlightRoot.querySelector('[data-spot-dim]');
    const titleEl = spotlightRoot.querySelector('[data-spot-title]');
    const subEl = spotlightRoot.querySelector('[data-spot-sub]');
    const noteEl = spotlightRoot.querySelector('[data-spot-note]');
    const playEl = spotlightRoot.querySelector('[data-spot-play]');
    const infoEl = spotlightRoot.querySelector('[data-spot-info]');
    const dotsEl = spotlightRoot.querySelector('[data-spot-dots]');

    spotlightRoot.style.setProperty('--spot-accent', game.accent || '#e8b45a');

    if (artBox) {
      artBox.replaceChildren(createCoverPicture(game, true));
    }
    if (badgeEl) badgeEl.textContent = game.badge || game.version;
    if (dimEl) dimEl.textContent = game.dimension;
    if (titleEl) titleEl.textContent = game.title;
    if (subEl) subEl.textContent = game.subtitle;
    if (noteEl) noteEl.textContent = game.updateNote || game.description;
    if (playEl) {
      playEl.href = resolvePath(game.play);
      playEl.setAttribute('data-track-game', game.id);
    }
    if (infoEl) {
      infoEl.setAttribute('data-open-modal', game.id);
    }

    if (dotsEl) {
      const frag = document.createDocumentFragment();
      spotlightGames.forEach((sg, idx) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'spot-dot' + (idx === state.spotlightIdx ? ' active' : '');
        dot.setAttribute('aria-label', `Показать: ${sg.title}`);
        dot.setAttribute('aria-pressed', idx === state.spotlightIdx ? 'true' : 'false');
        dot.title = sg.title;
        dot.addEventListener('click', () => {
          state.spotlightIdx = idx;
          renderSpotlight();
          resetSpotlightTimer();
        });
        frag.appendChild(dot);
      });
      dotsEl.replaceChildren(frag);
    }
  }

  function stepSpotlight(delta) {
    if (!spotlightGames.length) return;
    state.spotlightIdx = (state.spotlightIdx + delta + spotlightGames.length) % spotlightGames.length;
    renderSpotlight();
  }

  function resetSpotlightTimer() {
    if (spotlightTimer) {
      clearInterval(spotlightTimer);
      spotlightTimer = null;
    }
    if (prefersReducedMotion || spotlightGames.length < 2) return;
    spotlightTimer = setInterval(() => {
      if (!spotlightPaused && !document.hidden) stepSpotlight(1);
    }, 6500);
  }

  if (spotlightRoot) {
    const prevBtn = spotlightRoot.querySelector('[data-spot-prev]');
    const nextBtn = spotlightRoot.querySelector('[data-spot-next]');
    if (prevBtn) prevBtn.addEventListener('click', () => { stepSpotlight(-1); resetSpotlightTimer(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { stepSpotlight(1); resetSpotlightTimer(); });
    spotlightRoot.addEventListener('mouseenter', () => { spotlightPaused = true; });
    spotlightRoot.addEventListener('mouseleave', () => { spotlightPaused = false; });
    spotlightRoot.addEventListener('focusin', () => { spotlightPaused = true; });
    spotlightRoot.addEventListener('focusout', () => { spotlightPaused = false; });
    renderSpotlight();
    resetSpotlightTimer();
  }

  // ---------------------------- Секция «Новинки» ----------------------------
  const newGrid = document.getElementById('new-releases-grid');

  function renderNewReleases() {
    if (!newGrid) return;
    const fresh = catalog.filter((g) => g.isNew).slice(0, 6);
    const frag = document.createDocumentFragment();
    for (const game of fresh) {
      const card = el('article', 'release-card');
      card.style.setProperty('--card-accent', game.accent || '#e8b45a');

      const artLink = el('a', 'release-art');
      artLink.href = resolvePath(game.play);
      artLink.setAttribute('data-track-game', game.id);
      artLink.setAttribute('aria-label', `Играть в ${game.title}`);
      artLink.appendChild(createCoverPicture(game, false));
      artLink.appendChild(el('span', 'release-ver', game.version));
      artLink.appendChild(el('span', 'release-dim', game.dimension));

      const body = el('div', 'release-body');
      const head = el('div', 'release-head');
      head.appendChild(el('h3', null, game.title));
      head.appendChild(el('span', 'release-pill', 'Новинка'));
      body.appendChild(head);
      body.appendChild(el('p', 'release-note', game.updateNote || game.subtitle));

      const actions = el('div', 'release-actions');
      const play = el('a', 'btn btn-primary btn-sm', 'Играть');
      play.href = resolvePath(game.play);
      play.setAttribute('data-track-game', game.id);

      const more = el('button', 'btn btn-ghost btn-sm', 'Подробнее');
      more.type = 'button';
      more.setAttribute('data-open-modal', game.id);

      actions.append(play, more);
      body.appendChild(actions);
      card.append(artLink, body);
      frag.appendChild(card);
    }
    newGrid.replaceChildren(frag);
  }

  // ---------------------------- Недавно открытые ----------------------------
  const recentSection = document.getElementById('recent-section');
  const recentList = document.getElementById('recent-list');
  const recentClearBtn = document.getElementById('recent-clear');

  function renderRecent() {
    if (!recentSection || !recentList) return;
    const items = state.recent.map((id) => byId.get(id)).filter(Boolean).slice(0, 4);
    recentSection.hidden = items.length === 0;
    if (!items.length) return;
    const frag = document.createDocumentFragment();
    for (const game of items) {
      const a = el('a', 'recent-pill');
      a.href = resolvePath(game.play);
      a.setAttribute('data-track-game', game.id);
      a.style.setProperty('--pill-accent', game.accent || '#e8b45a');
      a.appendChild(el('span', 'recent-dot'));
      a.appendChild(el('strong', null, game.title));
      a.appendChild(el('span', 'recent-meta', game.version));
      frag.appendChild(a);
    }
    recentList.replaceChildren(frag);
  }

  if (recentClearBtn) {
    recentClearBtn.addEventListener('click', () => {
      state.recent = [];
      safeWriteJson(STORAGE_RECENT, []);
      renderRecent();
      if (state.sort === 'recent') renderCatalog();
    });
  }

  // ---------------------------- Категории ----------------------------
  const catWrap = document.getElementById('category-pills');

  function renderCategoryPills() {
    if (!catWrap) return;
    const frag = document.createDocumentFragment();
    for (const cat of categories) {
      const count = catalog.filter(
        (g) => matchesCategory(g, cat.id) && matchesQuery(g, state.query)
      ).length;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cat-pill' + (state.category === cat.id ? ' active' : '');
      btn.setAttribute('aria-pressed', state.category === cat.id ? 'true' : 'false');
      btn.setAttribute('data-cat', cat.id);
      btn.appendChild(el('span', null, cat.label));
      btn.appendChild(el('em', 'cat-count', String(count)));
      btn.addEventListener('click', () => {
        state.category = cat.id;
        renderCategoryPills();
        renderCatalog();
        syncUrl();
      });
      frag.appendChild(btn);
    }
    catWrap.replaceChildren(frag);
  }

  // ---------------------------- Полный каталог ----------------------------
  const catalogGrid = document.getElementById('catalog-grid');
  const catalogStatus = document.getElementById('catalog-status');
  const catalogEmpty = document.getElementById('catalog-empty');

  function buildCatalogCard(game) {
    const isFav = state.favs.has(game.id);
    const article = el('article', 'gcard' + (game.isNew ? ' gcard-new' : ''));
    article.style.setProperty('--card-accent', game.accent || '#e8b45a');

    // Обложка
    const media = el('div', 'gcard-media');
    const coverLink = el('a', 'gcard-cover-link');
    coverLink.href = resolvePath(game.play);
    coverLink.setAttribute('data-track-game', game.id);
    coverLink.setAttribute('aria-label', `Запустить игру ${game.title}`);
    coverLink.appendChild(createCoverPicture(game, false));
    media.appendChild(coverLink);

    const topRow = el('div', 'gcard-media-top');
    topRow.appendChild(el('span', 'gcard-badge' + (game.isNew ? ' is-new' : ''), game.badge || game.version));

    const favBtn = el('button', 'fav-btn' + (isFav ? ' active' : ''), isFav ? '★' : '☆');
    favBtn.type = 'button';
    favBtn.setAttribute('aria-label', isFav ? `Убрать ${game.title} из избранного` : `Добавить ${game.title} в избранное`);
    favBtn.setAttribute('aria-pressed', isFav ? 'true' : 'false');
    favBtn.title = isFav ? 'В избранном' : 'В избранное';
    favBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleFav(game.id);
    });
    topRow.appendChild(favBtn);
    media.appendChild(topRow);

    const botRow = el('div', 'gcard-media-bottom');
    botRow.appendChild(el('span', 'gcard-dim', game.dimension));
    botRow.appendChild(el('span', 'gcard-ver', game.version));
    media.appendChild(botRow);

    // Контент
    const body = el('div', 'gcard-body');
    const titleWrap = el('div', 'gcard-title-wrap');
    const h3 = el('h3', null, game.title);
    const sub = el('p', 'gcard-sub', game.subtitle);
    titleWrap.append(h3, sub);
    body.appendChild(titleWrap);

    body.appendChild(el('p', 'gcard-desc', game.description));

    const feats = el('ul', 'gcard-features');
    const shownFeats = (game.features || []).slice(0, 3);
    for (const f of shownFeats) {
      feats.appendChild(el('li', null, f));
    }
    body.appendChild(feats);

    const actions = el('div', 'gcard-actions');
    const playLink = el('a', 'btn btn-primary', 'Играть');
    playLink.href = resolvePath(game.play);
    playLink.setAttribute('data-track-game', game.id);

    const detailsBtn = el('button', 'btn', 'Подробнее');
    detailsBtn.type = 'button';
    detailsBtn.setAttribute('data-open-modal', game.id);

    const docLink = el('a', 'btn btn-icon', '↗');
    docLink.href = resolvePath(game.info);
    docLink.title = game.infoLabel || 'Описание';
    docLink.setAttribute('aria-label', `${game.infoLabel || 'Описание'}: ${game.title}`);

    actions.append(playLink, detailsBtn, docLink);
    body.appendChild(actions);

    article.append(media, body);
    return article;
  }

  function renderCatalog() {
    if (!catalogGrid) return;
    catalogGrid.classList.toggle('is-list', state.view === 'list');
    const list = getFilteredGames();
    if (catalogStatus) {
      catalogStatus.textContent = `Показано ${list.length} из ${catalog.length}`;
    }
    if (catalogEmpty) {
      catalogEmpty.hidden = list.length > 0;
    }
    const frag = document.createDocumentFragment();
    for (const game of list) {
      frag.appendChild(buildCatalogCard(game));
    }
    catalogGrid.replaceChildren(frag);
  }

  // ---------------------------- Поиск, сортировка, вид ----------------------------
  const searchInput = document.getElementById('catalog-search');
  const searchClear = document.getElementById('catalog-search-clear');
  const sortSelect = document.getElementById('catalog-sort');
  const viewBtns = document.querySelectorAll('[data-view-mode]');
  const resetFiltersBtn = document.getElementById('catalog-reset-btn');

  function updateSearchClear() {
    if (searchClear) searchClear.hidden = !state.query;
  }

  function updateViewButtons() {
    viewBtns.forEach((btn) => {
      const active = btn.getAttribute('data-view-mode') === state.view;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  if (searchInput) {
    searchInput.value = state.query;
    updateSearchClear();
    let debounceTimer = null;
    searchInput.addEventListener('input', () => {
      state.query = searchInput.value;
      updateSearchClear();
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        renderCategoryPills();
        renderCatalog();
        syncUrl();
      }, 60);
    });
  }

  if (searchClear) {
    searchClear.addEventListener('click', () => {
      state.query = '';
      if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
      }
      updateSearchClear();
      renderCategoryPills();
      renderCatalog();
      syncUrl();
    });
  }

  if (sortSelect) {
    sortSelect.value = state.sort;
    sortSelect.addEventListener('change', () => {
      state.sort = sortSelect.value || 'new';
      renderCatalog();
      syncUrl();
    });
  }

  viewBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const mode = btn.getAttribute('data-view-mode');
      state.view = mode === 'list' ? 'list' : 'grid';
      safeWriteJson(STORAGE_VIEW, state.view);
      updateViewButtons();
      renderCatalog();
    });
  });

  if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener('click', () => {
      state.query = '';
      state.category = 'all';
      state.sort = 'new';
      if (searchInput) searchInput.value = '';
      if (sortSelect) sortSelect.value = 'new';
      updateSearchClear();
      renderCategoryPills();
      renderCatalog();
      syncUrl();
    });
  }

  // ---------------------------- Модальное окно «Подробнее» ----------------------------
  const modalRoot = document.getElementById('game-modal');
  const modalContent = document.getElementById('game-modal-content');
  const modalCloseBtn = document.getElementById('game-modal-close');
  let lastFocusedEl = null;

  function renderModalBody(game) {
    if (!modalContent || !game) return;
    const isFav = state.favs.has(game.id);
    modalContent.style.setProperty('--modal-accent', game.accent || '#e8b45a');

    const frag = document.createDocumentFragment();

    const hero = el('div', 'gmodal-hero');
    hero.appendChild(createCoverPicture(game, true));
    const badges = el('div', 'gmodal-badges');
    badges.appendChild(el('span', 'gcard-badge' + (game.isNew ? ' is-new' : ''), game.badge || game.version));
    badges.appendChild(el('span', 'gcard-dim', game.dimension));
    hero.appendChild(badges);
    frag.appendChild(hero);

    const body = el('div', 'gmodal-body');
    const head = el('div', 'gmodal-head');
    const titles = el('div');
    const h2 = el('h2', null, game.title);
    h2.id = 'game-modal-title';
    titles.append(h2, el('p', 'gmodal-sub', game.subtitle));
    head.appendChild(titles);

    const favToggle = el('button', 'btn btn-ghost' + (isFav ? ' is-fav' : ''), isFav ? '★ В избранном' : '☆ В избранное');
    favToggle.type = 'button';
    favToggle.addEventListener('click', () => toggleFav(game.id));
    head.appendChild(favToggle);
    body.appendChild(head);

    if (game.updateNote) {
      const note = el('div', 'gmodal-note');
      note.appendChild(el('span', 'gmodal-note-tag', game.version));
      note.appendChild(el('span', null, game.updateNote));
      body.appendChild(note);
    }

    body.appendChild(el('p', 'gmodal-desc', game.description));

    const specs = el('div', 'gmodal-specs');
    const techSpec = el('div', 'gmodal-spec');
    techSpec.append(el('span', null, 'Технологии'), el('strong', null, game.tech));
    const ctrlSpec = el('div', 'gmodal-spec');
    ctrlSpec.append(el('span', null, 'Управление'), el('strong', null, game.controls));
    specs.append(techSpec, ctrlSpec);
    body.appendChild(specs);

    if (game.features && game.features.length) {
      const ul = el('ul', 'gmodal-features');
      for (const f of game.features) ul.appendChild(el('li', null, f));
      body.appendChild(ul);
    }

    const actions = el('div', 'gmodal-actions');
    const play = el('a', 'btn btn-primary', 'Запустить игру');
    play.href = resolvePath(game.play);
    play.setAttribute('data-track-game', game.id);
    actions.appendChild(play);

    const doc = el('a', 'btn', game.infoLabel || 'Об игре');
    doc.href = resolvePath(game.info);
    actions.appendChild(doc);

    for (const extra of game.extraLinks || []) {
      const link = el('a', 'btn btn-ghost', extra.label);
      link.href = resolvePath(extra.href);
      actions.appendChild(link);
    }

    if (state.modalRandomMode) {
      const reroll = el('button', 'btn btn-ghost', 'Другая случайная 🎲');
      reroll.type = 'button';
      reroll.addEventListener('click', () => openRandomGame(game.id));
      actions.appendChild(reroll);
    }

    body.appendChild(actions);
    frag.appendChild(body);
    modalContent.replaceChildren(frag);
  }

  function openModal(gameId, randomMode) {
    const game = byId.get(gameId);
    if (!modalRoot || !game) return;
    lastFocusedEl = document.activeElement;
    state.modalGameId = gameId;
    state.modalRandomMode = Boolean(randomMode);
    renderModalBody(game);
    modalRoot.hidden = false;
    modalRoot.classList.add('open');
    document.body.classList.add('modal-open');
    if (modalCloseBtn && typeof modalCloseBtn.focus === 'function') {
      modalCloseBtn.focus();
    }
  }

  function closeModal() {
    if (!modalRoot || modalRoot.hidden) return;
    modalRoot.classList.remove('open');
    modalRoot.hidden = true;
    document.body.classList.remove('modal-open');
    state.modalGameId = null;
    state.modalRandomMode = false;
    if (lastFocusedEl && typeof lastFocusedEl.focus === 'function') {
      lastFocusedEl.focus();
    }
  }

  function openRandomGame(excludeId) {
    const pool = catalog.filter((g) => g.id !== excludeId && g.id !== 'truck-haul');
    const pick = pool[Math.floor(Math.random() * pool.length)] || catalog[0];
    if (pick) openModal(pick.id, true);
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (modalRoot) {
    modalRoot.addEventListener('click', (e) => {
      if (e.target === modalRoot || (e.target && e.target.hasAttribute('data-modal-backdrop'))) {
        closeModal();
      }
    });
  }

  // Делегирование кликов по карточкам, кнопкам «Подробнее» и «Случайная игра»
  document.addEventListener('click', (e) => {
    const target = e.target && e.target.closest ? e.target : null;
    if (!target) return;

    const modalTrigger = target.closest('[data-open-modal]');
    if (modalTrigger) {
      e.preventDefault();
      openModal(modalTrigger.getAttribute('data-open-modal'), false);
      return;
    }

    const randomTrigger = target.closest('[data-random-game]');
    if (randomTrigger) {
      e.preventDefault();
      openRandomGame(state.modalGameId);
      return;
    }

    const searchTrigger = target.closest('[data-focus-search]');
    if (searchTrigger && searchInput) {
      e.preventDefault();
      const catalogSection = document.getElementById('games');
      if (catalogSection && typeof catalogSection.scrollIntoView === 'function') {
        catalogSection.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
      }
      setTimeout(() => searchInput.focus(), 160);
      return;
    }

    const tracked = target.closest('[data-track-game]');
    if (tracked) {
      recordPlay(tracked.getAttribute('data-track-game'));
    }
  });

  // Клавиатурные шорткаты: "/" — фокус на поиск, "Esc" — закрыть окно или очистить поиск
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (state.modalGameId) {
        closeModal();
        return;
      }
      if (searchInput && document.activeElement === searchInput && state.query) {
        state.query = '';
        searchInput.value = '';
        updateSearchClear();
        renderCategoryPills();
        renderCatalog();
        syncUrl();
      }
      return;
    }
    if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const tag = document.activeElement && document.activeElement.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (searchInput) {
        e.preventDefault();
        searchInput.focus();
        searchInput.select();
      }
    }
  });

  // Плавный скролл по локальным якорям
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const dest = document.querySelector(id);
      if (dest && typeof dest.scrollIntoView === 'function') {
        e.preventDefault();
        dest.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
      }
    });
  });

  // ---------------------------- Первая отрисовка ----------------------------
  updateViewButtons();
  renderNewReleases();
  renderRecent();
  renderCategoryPills();
  renderCatalog();

  // ---------------------------- Оптимизированный фон героя ----------------------------
  (function initHeroCanvas() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas || typeof canvas.getContext !== 'function') return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let stars = [];
    let bgCanvas = null;
    let rafId = 0;
    let heroVisible = true;
    let t = 0;

    function buildStaticBackdrop() {
      bgCanvas = document.createElement('canvas');
      bgCanvas.width = Math.max(1, Math.floor(w * dpr));
      bgCanvas.height = Math.max(1, Math.floor(h * dpr));
      const bctx = bgCanvas.getContext('2d');
      if (!bctx) return;
      bctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Глубокий ночной градиент с тёплым золотым свечением у горизонта
      const sky = bctx.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, '#060809');
      sky.addColorStop(0.58, '#0b1416');
      sky.addColorStop(1, '#0c1d20');
      bctx.fillStyle = sky;
      bctx.fillRect(0, 0, w, h);

      // Тёплое золотое пятно за заголовком + бирюзовое справа за Spotlight
      const g1 = bctx.createRadialGradient(w * 0.18, h * 0.36, 10, w * 0.18, h * 0.36, Math.max(w, h) * 0.52);
      g1.addColorStop(0, 'rgba(232, 180, 90, 0.13)');
      g1.addColorStop(0.55, 'rgba(232, 180, 90, 0.03)');
      g1.addColorStop(1, 'rgba(0, 0, 0, 0)');
      bctx.fillStyle = g1;
      bctx.fillRect(0, 0, w, h);

      const g2 = bctx.createRadialGradient(w * 0.80, h * 0.35, 10, w * 0.80, h * 0.35, Math.max(w, h) * 0.45);
      g2.addColorStop(0, 'rgba(84, 198, 178, 0.12)');
      g2.addColorStop(1, 'rgba(0, 0, 0, 0)');
      bctx.fillStyle = g2;
      bctx.fillRect(0, 0, w, h);

      // Тонкая координатная сетка (отсылка к картам и игровым мирам)
      const step = 64;
      bctx.strokeStyle = 'rgba(242, 236, 223, 0.028)';
      bctx.lineWidth = 1;
      bctx.beginPath();
      for (let x = step; x < w; x += step) {
        bctx.moveTo(x + 0.5, 0);
        bctx.lineTo(x + 0.5, h);
      }
      for (let y = step; y < h; y += step) {
        bctx.moveTo(0, y + 0.5);
        bctx.lineTo(w, y + 0.5);
      }
      bctx.stroke();

      // Мягкая линия горизонта внизу
      const seaY = h * 0.78;
      const horizon = bctx.createLinearGradient(0, seaY, 0, h);
      horizon.addColorStop(0, 'rgba(24, 62, 70, 0.38)');
      horizon.addColorStop(1, 'rgba(7, 10, 10, 0.96)');
      bctx.fillStyle = horizon;
      bctx.fillRect(0, seaY, w, h - seaY);
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth || window.innerWidth || 1200;
      h = canvas.clientHeight || 580;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      buildStaticBackdrop();

      stars = [];
      const count = Math.min(110, Math.max(36, Math.round((w * h) / 14000)));
      for (let i = 0; i < count; i++) {
        const warm = i % 5 === 0;
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h * 0.74,
          r: 0.5 + Math.random() * 1.25,
          a: 0.16 + Math.random() * 0.52,
          phase: Math.random() * Math.PI * 2,
          color: warm ? '#ffd98a' : '#dbe8ff',
        });
      }
      drawFrame();
    }

    function drawFrame() {
      if (!w || !h) return;
      ctx.clearRect(0, 0, w, h);
      if (bgCanvas) {
        ctx.drawImage(bgCanvas, 0, 0, w, h);
      }

      // Мерцающие звёзды
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        const tw = 0.62 + Math.sin(t * 1.6 + s.phase) * 0.38;
        ctx.globalAlpha = s.a * tw;
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Лёгкие волны у нижней кромки (всего 8 линий вместо 26)
      const seaY = h * 0.78;
      for (let i = 0; i < 8; i++) {
        const k = i / 8;
        const y = seaY + k * (h - seaY);
        ctx.strokeStyle = `rgba(232, 180, 90, ${0.03 + k * 0.045})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = 0; x <= w; x += 28) {
          const yy = y + Math.sin(x * 0.008 + t * (1.2 + k * 1.4) + i * 1.1) * (2.5 + k * 4);
          if (x === 0) ctx.moveTo(x, yy);
          else ctx.lineTo(x, yy);
        }
        ctx.stroke();
      }
    }

    function tick() {
      if (!heroVisible || document.hidden) {
        rafId = 0;
        return;
      }
      t += 0.012;
      drawFrame();
      rafId = window.requestAnimationFrame(tick);
    }

    function startLoop() {
      if (prefersReducedMotion || rafId || !heroVisible || document.hidden) return;
      if (typeof window.requestAnimationFrame === 'function') {
        rafId = window.requestAnimationFrame(tick);
      }
    }

    function stopLoop() {
      if (rafId && typeof window.cancelAnimationFrame === 'function') {
        window.cancelAnimationFrame(rafId);
      }
      rafId = 0;
    }

    resize();
    let resizeTimer = null;
    window.addEventListener('resize', () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 120);
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopLoop();
      else startLoop();
    });

    if (typeof window.IntersectionObserver === 'function') {
      const heroEl = canvas.parentElement || canvas;
      const io = new IntersectionObserver(
        (entries) => {
          heroVisible = Boolean(entries[0] && entries[0].isIntersecting);
          if (heroVisible) startLoop();
          else stopLoop();
        },
        { threshold: 0.02 }
      );
      io.observe(heroEl);
    }

    startLoop();
  })();
})();
