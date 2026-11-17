/* ==========================================================================
   Games — Вкладка «Новости» (site/news-hub.js)
   Мультикатегорийная лента (игры, технологии/ИИ, наука/космос, мир,
   кибербезопасность, факты), тизер на главной, читалка, закладки, лайки,
   живой статус автопоста и антивирусная проверка пользовательских постов.
   ========================================================================== */
(function () {
  'use strict';

  const STORAGE_BOOKMARKS = 'games_news_bookmarks_v1';
  const STORAGE_LIKES = 'games_news_likes_v1';
  const STORAGE_READ = 'games_news_read_v1';
  const STORAGE_LOCAL_POSTS = 'games_news_local_posts_v1';

  const DEFAULT_CATEGORIES = [
    { id: 'all', label: 'Все темы', icon: '✨' },
    { id: 'games', label: 'Игры и релизы', icon: '🎮' },
    { id: 'tech', label: 'Технологии и ИИ', icon: '🤖' },
    { id: 'science', label: 'Наука и космос', icon: '🚀' },
    { id: 'world', label: 'Мир и культура', icon: '🌍' },
    { id: 'security', label: 'Кибербезопасность', icon: '🛡️' },
    { id: 'facts', label: 'Факты и подборки', icon: '⚡' },
  ];

  const CATEGORY_ACCENT = {
    games: 'blue',
    tech: 'violet',
    science: 'indigo',
    world: 'amber',
    security: 'emerald',
    facts: 'cyan',
  };

  function safeReadJson(key, fallback) {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function safeWriteJson(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      return Boolean(err && false);
    }
    return true;
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = String(text);
    return node;
  }

  function formatRelativeDate(isoStr) {
    const ts = Date.parse(isoStr || '');
    if (!Number.isFinite(ts)) return 'Недавно';
    const diffMin = Math.floor((Date.now() - ts) / 60000);
    if (diffMin < 2) return 'Только что';
    if (diffMin < 60) return `${diffMin} мин назад`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `${diffH} ч назад`;
    const diffD = Math.floor(diffH / 24);
    if (diffD === 1) return 'Вчера';
    if (diffD < 7) return `${diffD} дн назад`;
    try {
      return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' }).format(new Date(ts));
    } catch {
      return String(isoStr).slice(0, 10);
    }
  }

  function safeExternalUrl(url) {
    const raw = String(url || '').trim();
    if (!raw) return '';
    try {
      const u = new URL(raw);
      return u.protocol === 'https:' ? u.href : '';
    } catch {
      return '';
    }
  }

  const rootPrefix = document.body?.getAttribute('data-root') || '';
  const feedUrl = `${rootPrefix}site/news-feed.json`;

  const state = {
    categories: DEFAULT_CATEGORIES.slice(),
    remoteItems: [],
    localPosts: Array.isArray(safeReadJson(STORAGE_LOCAL_POSTS, [])) ? safeReadJson(STORAGE_LOCAL_POSTS, []) : [],
    autoPost: null,
    updatedAt: '',
    activeCategory: 'all',
    query: '',
    sort: 'fresh',
    bookmarks: new Set(Array.isArray(safeReadJson(STORAGE_BOOKMARKS, [])) ? safeReadJson(STORAGE_BOOKMARKS, []) : []),
    likes: new Set(Array.isArray(safeReadJson(STORAGE_LIKES, [])) ? safeReadJson(STORAGE_LIKES, []) : []),
    readIds: new Set(Array.isArray(safeReadJson(STORAGE_READ, [])) ? safeReadJson(STORAGE_READ, []) : []),
    activeArticleId: null,
    loaded: false,
  };

  function getAllItems() {
    const combined = [...state.localPosts, ...state.remoteItems];
    const seen = new Set();
    const out = [];
    for (const item of combined) {
      if (!item || !item.id || seen.has(item.id)) continue;
      seen.add(item.id);
      out.push(item);
    }
    return out;
  }

  function getCategoryMeta(catId) {
    return state.categories.find((c) => c.id === catId) || { id: catId, label: 'Новости', icon: '📰' };
  }

  function getFilteredItems() {
    const q = state.query.trim().toLowerCase();
    let list = getAllItems();

    if (state.activeCategory === 'bookmarks') {
      list = list.filter((it) => state.bookmarks.has(it.id));
    } else if (state.activeCategory !== 'all') {
      list = list.filter((it) => it.category === state.activeCategory);
    }

    if (q) {
      list = list.filter((it) => {
        const hay = [
          it.title || '',
          it.summary || '',
          ...(Array.isArray(it.tags) ? it.tags : []),
          it.sourceName || '',
        ].join(' ').toLowerCase();
        return hay.includes(q);
      });
    }

    if (state.sort === 'popular') {
      list = list.slice().sort((a, b) => {
        const scoreA = (state.likes.has(a.id) ? 3 : 0) + (a.featured ? 2 : 0) + (a.pinned ? 1 : 0);
        const scoreB = (state.likes.has(b.id) ? 3 : 0) + (b.featured ? 2 : 0) + (b.pinned ? 1 : 0);
        if (scoreB !== scoreA) return scoreB - scoreA;
        return Date.parse(b.publishedAt || 0) - Date.parse(a.publishedAt || 0);
      });
    } else {
      list = list.slice().sort((a, b) => Date.parse(b.publishedAt || 0) - Date.parse(a.publishedAt || 0));
    }

    return list;
  }

  function updateUnreadBadges() {
    const items = getAllItems();
    const unreadCount = items.filter((it) => !state.readIds.has(it.id)).length;
    document.querySelectorAll('[data-news-badge]').forEach((badge) => {
      if (unreadCount > 0) {
        badge.textContent = unreadCount > 9 ? '9+' : String(unreadCount);
        badge.hidden = false;
      } else {
        badge.textContent = '0';
        badge.hidden = true;
      }
    });
  }

  function renderStatusBar() {
    const statusEl = document.getElementById('news-autopost-status');
    if (!statusEl) return;
    const total = getAllItems().length;
    const ap = state.autoPost || {};
    const interval = ap.intervalHours || 6;
    const updated = formatRelativeDate(ap.lastRunAt || state.updatedAt);
    const sources = ap.sourcesCount || 11;
    statusEl.textContent = `⚡ Автопост каждые ${interval} ч · ${sources} источников · ${total} материалов · обновлено: ${updated}`;
  }

  function renderTeaserStrip() {
    const host = document.getElementById('news-teaser-items');
    const strip = document.getElementById('news-teaser-strip');
    if (!host || !strip) return;

    const all = getAllItems();
    if (!all.length) {
      strip.hidden = true;
      return;
    }

    // Берём 3 самые свежие статьи из разных категорий, чтобы тизер на главной сразу показывал разнообразие
    const picked = [];
    const usedCats = new Set();
    for (const item of all) {
      if (picked.length >= 3) break;
      if (!usedCats.has(item.category)) {
        picked.push(item);
        usedCats.add(item.category);
      }
    }
    for (const item of all) {
      if (picked.length >= 3) break;
      if (!picked.includes(item)) picked.push(item);
    }

    strip.hidden = false;
    host.replaceChildren(
      ...picked.map((item) => {
        const cat = getCategoryMeta(item.category);
        const card = el('button', 'news-teaser-card');
        card.type = 'button';
        card.setAttribute('data-open-news-article', item.id);

        const top = el('span', 'news-teaser-top');
        top.appendChild(el('span', `news-cat-chip accent-${item.accent || CATEGORY_ACCENT[item.category] || 'blue'}`, `${cat.icon} ${cat.label}`));
        top.appendChild(el('span', 'news-teaser-time', `${item.readMin || 2} мин`));

        const title = el('strong', 'news-teaser-title', item.title);
        card.append(top, title);
        return card;
      })
    );
  }

  function renderCategoryPills() {
    const host = document.getElementById('news-category-pills');
    if (!host) return;

    const all = getAllItems();
    const counts = new Map();
    for (const it of all) {
      counts.set(it.category, (counts.get(it.category) || 0) + 1);
    }

    const pills = [
      ...state.categories.map((cat) => ({
        id: cat.id,
        label: `${cat.icon} ${cat.label}`,
        count: cat.id === 'all' ? all.length : (counts.get(cat.id) || 0),
      })),
      {
        id: 'bookmarks',
        label: '🔖 Закладки',
        count: state.bookmarks.size,
      },
    ];

    host.replaceChildren(
      ...pills.map((p) => {
        const btn = el('button', `news-cat-pill${state.activeCategory === p.id ? ' is-active' : ''}`);
        btn.type = 'button';
        btn.setAttribute('data-news-cat', p.id);
        btn.append(document.createTextNode(`${p.label} `), el('span', 'news-cat-count', String(p.count)));
        return btn;
      })
    );
  }

  function buildNewsCard(item, isHero) {
    const cat = getCategoryMeta(item.category);
    const accent = item.accent || CATEGORY_ACCENT[item.category] || 'blue';
    const isLiked = state.likes.has(item.id);
    const isSaved = state.bookmarks.has(item.id);
    const isRead = state.readIds.has(item.id);

    const card = el('article', `${isHero ? 'news-hero-card' : 'news-card'} accent-${accent}${isRead ? ' is-read' : ''}`);

    const banner = el('div', 'news-card-banner');
    banner.appendChild(el('span', 'news-card-icon', item.icon || cat.icon));
    const bannerBadges = el('div', 'news-banner-badges');
    bannerBadges.appendChild(el('span', `news-cat-chip accent-${accent}`, `${cat.icon} ${cat.label}`));
    if (item.autoPosted) {
      bannerBadges.appendChild(el('span', 'news-auto-chip', '⚡ Автопост'));
    } else if (item.isLocal) {
      bannerBadges.appendChild(el('span', 'news-auto-chip is-local', '✍ Мой пост'));
    }
    banner.appendChild(bannerBadges);

    const body = el('div', 'news-card-body');
    const meta = el('div', 'news-card-meta');
    meta.append(
      el('span', '', item.sourceName || 'Games'),
      el('span', '', '·'),
      el('span', '', formatRelativeDate(item.publishedAt)),
      el('span', '', '·'),
      el('span', '', `${item.readMin || 2} мин чтения`)
    );

    const heading = el(isHero ? 'h2' : 'h3', 'news-card-title', item.title);
    const summary = el('p', 'news-card-summary', item.summary);

    const tagsRow = el('div', 'news-tags-row');
    (Array.isArray(item.tags) ? item.tags.slice(0, 4) : []).forEach((t) => {
      tagsRow.appendChild(el('span', 'news-tag', `#${t}`));
    });

    const foot = el('div', 'news-card-foot');
    const readBtn = el('button', 'btn btn-steam-blue btn-sm', isHero ? '📖 Читать статью →' : 'Читать →');
    readBtn.type = 'button';
    readBtn.setAttribute('data-open-news-article', item.id);

    const actions = el('div', 'news-card-actions');
    const likeBtn = el('button', `news-mini-btn${isLiked ? ' is-active' : ''}`, isLiked ? '👍 1' : '👍');
    likeBtn.type = 'button';
    likeBtn.title = 'Нравится';
    likeBtn.setAttribute('aria-label', 'Отметить новость интересной');
    likeBtn.setAttribute('data-news-like', item.id);

    const bmBtn = el('button', `news-mini-btn${isSaved ? ' is-active' : ''}`, isSaved ? '🔖' : '📑');
    bmBtn.type = 'button';
    bmBtn.title = isSaved ? 'Убрать из закладок' : 'Сохранить в закладки';
    bmBtn.setAttribute('aria-label', 'Сохранить в закладки');
    bmBtn.setAttribute('data-news-bookmark', item.id);

    actions.append(likeBtn, bmBtn);
    foot.append(readBtn, actions);

    body.append(meta, heading, summary, tagsRow, foot);
    card.append(banner, body);

    card.addEventListener('click', (ev) => {
      if (ev.target.closest('button, a')) return;
      openArticle(item.id);
    });

    return card;
  }

  function renderNewsView() {
    renderStatusBar();
    renderCategoryPills();
    updateUnreadBadges();

    const heroHost = document.getElementById('news-hero-slot');
    const gridHost = document.getElementById('news-cards-grid');
    const emptyEl = document.getElementById('news-empty-state');
    if (!heroHost || !gridHost) return;

    const list = getFilteredItems();
    if (!list.length) {
      heroHost.replaceChildren();
      gridHost.replaceChildren();
      if (emptyEl) emptyEl.hidden = false;
      return;
    }

    if (emptyEl) emptyEl.hidden = true;
    const showHero = !state.query.trim() && state.activeCategory !== 'bookmarks' && list.length >= 2;
    if (showHero) {
      const heroItem = list.find((it) => it.featured) || list[0];
      const rest = list.filter((it) => it.id !== heroItem.id);
      heroHost.replaceChildren(buildNewsCard(heroItem, true));
      gridHost.replaceChildren(...rest.map((it) => buildNewsCard(it, false)));
    } else {
      heroHost.replaceChildren();
      gridHost.replaceChildren(...list.map((it) => buildNewsCard(it, false)));
    }
  }

  function openArticle(articleId, opts) {
    const items = getAllItems();
    const idx = items.findIndex((it) => it.id === articleId);
    if (idx < 0) return;

    const item = items[idx];
    state.activeArticleId = item.id;
    state.readIds.add(item.id);
    safeWriteJson(STORAGE_READ, [...state.readIds]);
    updateUnreadBadges();

    const modal = document.getElementById('news-reader-modal');
    const content = document.getElementById('news-reader-content');
    if (!modal || !content) return;

    const cat = getCategoryMeta(item.category);
    const accent = item.accent || CATEGORY_ACCENT[item.category] || 'blue';
    const isLiked = state.likes.has(item.id);
    const isSaved = state.bookmarks.has(item.id);
    const safeUrl = safeExternalUrl(item.sourceUrl);

    const wrap = el('div', 'news-reader-wrap');

    const header = el('div', `news-reader-head accent-${accent}`);
    const topMeta = el('div', 'news-reader-meta');
    topMeta.append(
      el('span', `news-cat-chip accent-${accent}`, `${cat.icon} ${cat.label}`),
      el('span', '', `${item.sourceName || 'Games'} · ${formatRelativeDate(item.publishedAt)} · ${item.readMin || 2} мин чтения`)
    );
    const h2 = el('h2', 'news-reader-title', item.title);
    h2.id = 'news-reader-title';
    header.append(topMeta, h2);

    const articleBody = el('div', 'news-reader-body');
    const paragraphs = Array.isArray(item.body) && item.body.length ? item.body : [item.summary || ''];
    paragraphs.forEach((p) => {
      articleBody.appendChild(el('p', '', p));
    });

    const tags = el('div', 'news-tags-row');
    (Array.isArray(item.tags) ? item.tags : []).forEach((t) => tags.appendChild(el('span', 'news-tag', `#${t}`)));

    const toolbar = el('div', 'news-reader-actions');
    const likeBtn = el('button', `btn btn-steam-ghost btn-sm${isLiked ? ' is-active' : ''}`, isLiked ? '👍 Понравилось' : '👍 Интересно');
    likeBtn.type = 'button';
    likeBtn.addEventListener('click', () => {
      toggleLike(item.id);
      openArticle(item.id, { updateHash: false });
    });

    const bmBtn = el('button', `btn btn-steam-ghost btn-sm${isSaved ? ' is-active' : ''}`, isSaved ? '🔖 В закладках' : '📑 В закладки');
    bmBtn.type = 'button';
    bmBtn.addEventListener('click', () => {
      toggleBookmark(item.id);
      openArticle(item.id, { updateHash: false });
    });

    const copyBtn = el('button', 'btn btn-steam-ghost btn-sm', '🔗 Скопировать ссылку');
    copyBtn.type = 'button';
    copyBtn.addEventListener('click', () => {
      const shareUrl = `${window.location.origin}${window.location.pathname}#news=${encodeURIComponent(item.id)}`;
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        navigator.clipboard.writeText(shareUrl).then(() => {
          copyBtn.textContent = '✓ Ссылка скопирована';
        }).catch(() => {
          copyBtn.textContent = shareUrl;
        });
      }
    });

    toolbar.append(likeBtn, bmBtn, copyBtn);
    if (safeUrl) {
      const srcLink = el('a', 'btn btn-steam-blue btn-sm', `Первоисточник (${item.sourceName || 'сайт'}) ↗`);
      srcLink.href = safeUrl;
      srcLink.target = '_blank';
      srcLink.rel = 'noopener noreferrer';
      toolbar.appendChild(srcLink);
    }

    const pager = el('div', 'news-reader-pager');
    const prevItem = idx > 0 ? items[idx - 1] : null;
    const nextItem = idx < items.length - 1 ? items[idx + 1] : null;
    if (prevItem) {
      const prevBtn = el('button', 'btn btn-steam-ghost btn-sm', `← ${prevItem.title.slice(0, 36)}…`);
      prevBtn.type = 'button';
      prevBtn.addEventListener('click', () => openArticle(prevItem.id));
      pager.appendChild(prevBtn);
    } else {
      pager.appendChild(el('span'));
    }
    if (nextItem) {
      const nextBtn = el('button', 'btn btn-steam-ghost btn-sm', `${nextItem.title.slice(0, 36)}… →`);
      nextBtn.type = 'button';
      nextBtn.addEventListener('click', () => openArticle(nextItem.id));
      pager.appendChild(nextBtn);
    }

    wrap.append(header, articleBody, tags, toolbar, pager);
    content.replaceChildren(wrap);

    modal.hidden = false;
    document.body.style.overflow = 'hidden';

    if (!opts || opts.updateHash !== false) {
      try {
        window.history.replaceState(null, '', `#news=${encodeURIComponent(item.id)}`);
      } catch (err) {
        if (err && typeof console !== 'undefined') console.debug(err.message);
      }
    }
    renderNewsView();
  }

  function closeArticle() {
    const modal = document.getElementById('news-reader-modal');
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    document.body.style.overflow = '';
    state.activeArticleId = null;
    if ((window.location.hash || '').startsWith('#news=')) {
      try {
        window.history.replaceState(null, '', '#news');
      } catch (err) {
        if (err && typeof console !== 'undefined') console.debug(err.message);
      }
    }
  }

  function toggleLike(id) {
    if (state.likes.has(id)) state.likes.delete(id);
    else state.likes.add(id);
    safeWriteJson(STORAGE_LIKES, [...state.likes]);
    renderNewsView();
  }

  function toggleBookmark(id) {
    if (state.bookmarks.has(id)) state.bookmarks.delete(id);
    else state.bookmarks.add(id);
    safeWriteJson(STORAGE_BOOKMARKS, [...state.bookmarks]);
    renderNewsView();
  }

  function openComposeModal() {
    const modal = document.getElementById('news-compose-modal');
    if (!modal) return;
    const status = document.getElementById('news-compose-status');
    if (status) {
      status.textContent = '';
      status.className = 'form-status';
    }
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeComposeModal() {
    const modal = document.getElementById('news-compose-modal');
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    document.body.style.overflow = '';
  }

  async function loadFeed(forceFresh) {
    const refreshBtn = document.getElementById('btn-news-refresh');
    if (refreshBtn) refreshBtn.disabled = true;
    try {
      const url = forceFresh ? `${feedUrl}?t=${Date.now()}` : feedUrl;
      const res = await fetch(url, { cache: forceFresh ? 'no-store' : 'default' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data.categories) && data.categories.length) {
        state.categories = data.categories;
      }
      const av = window.GamesAntivirus;
      const rawItems = Array.isArray(data.items) ? data.items : [];
      state.remoteItems = av && typeof av.scanNewsItemSync === 'function'
        ? rawItems.filter((it) => av.scanNewsItemSync(it).ok)
        : rawItems;
      state.autoPost = data.autoPost || null;
      state.updatedAt = data.updatedAt || '';
      state.loaded = true;
      renderTeaserStrip();
      renderNewsView();

      const h = window.location.hash || '';
      if (h.startsWith('#news=')) {
        const targetId = decodeURIComponent(h.slice(6));
        if (targetId) openArticle(targetId, { updateHash: false });
      }
    } catch {
      renderTeaserStrip();
      renderNewsView();
    } finally {
      if (refreshBtn) refreshBtn.disabled = false;
    }
  }

  function bindEvents() {
    document.addEventListener('click', (ev) => {
      const target = ev.target;
      if (!(target instanceof Element)) return;

      const openArtBtn = target.closest('[data-open-news-article]');
      if (openArtBtn) {
        ev.preventDefault();
        const artId = openArtBtn.getAttribute('data-open-news-article');
        if (window.GamesPortalTabs && typeof window.GamesPortalTabs.setTab === 'function') {
          window.GamesPortalTabs.setTab('news', { updateHash: false });
        }
        openArticle(artId);
        return;
      }

      const catBtn = target.closest('[data-news-cat]');
      if (catBtn) {
        state.activeCategory = catBtn.getAttribute('data-news-cat') || 'all';
        renderNewsView();
        return;
      }

      const likeBtn = target.closest('[data-news-like]');
      if (likeBtn) {
        ev.stopPropagation();
        toggleLike(likeBtn.getAttribute('data-news-like'));
        return;
      }

      const bmBtn = target.closest('[data-news-bookmark]');
      if (bmBtn) {
        ev.stopPropagation();
        toggleBookmark(bmBtn.getAttribute('data-news-bookmark'));
        return;
      }

      if (target.closest('[data-close-news-reader]')) {
        closeArticle();
        return;
      }

      if (target.closest('[data-close-news-compose]')) {
        closeComposeModal();
        return;
      }
    });

    document.getElementById('news-search')?.addEventListener('input', (ev) => {
      state.query = String(ev.target.value || '');
      renderNewsView();
    });

    document.getElementById('news-sort')?.addEventListener('change', (ev) => {
      state.sort = ev.target.value === 'popular' ? 'popular' : 'fresh';
      renderNewsView();
    });

    document.getElementById('btn-news-refresh')?.addEventListener('click', () => {
      loadFeed(true);
    });

    document.getElementById('btn-news-compose')?.addEventListener('click', () => {
      openComposeModal();
    });

    document.getElementById('news-compose-form')?.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const title = (document.getElementById('nc-title')?.value || '').trim();
      const category = document.getElementById('nc-category')?.value || 'games';
      const summary = (document.getElementById('nc-summary')?.value || '').trim();
      const bodyRaw = (document.getElementById('nc-body')?.value || '').trim();
      const sourceUrl = (document.getElementById('nc-url')?.value || '').trim();
      const status = document.getElementById('news-compose-status');

      if (title.length < 6 || bodyRaw.length < 20) {
        if (status) {
          status.textContent = 'Заполните заголовок (от 6 симв.) и текст новости (от 20 симв.).';
          status.className = 'form-status is-error';
        }
        return;
      }

      const catMeta = getCategoryMeta(category);
      const paragraphs = bodyRaw.split(/\n+/).map((p) => p.trim()).filter(Boolean).slice(0, 6);
      const candidate = {
        id: `local-${Date.now().toString(36)}`,
        category,
        title: title.slice(0, 140),
        summary: (summary || paragraphs[0] || title).slice(0, 220),
        body: paragraphs,
        tags: [catMeta.label, 'Пост читателя'],
        sourceName: 'Ваш пост',
        sourceUrl,
        publishedAt: new Date().toISOString(),
        readMin: Math.max(1, Math.round(bodyRaw.split(/\s+/).length / 130) || 1),
        icon: catMeta.icon,
        accent: CATEGORY_ACCENT[category] || 'blue',
        isLocal: true,
        autoPosted: false,
      };

      const av = window.GamesAntivirus;
      if (av && typeof av.scanNewsItemSync === 'function') {
        const check = av.scanNewsItemSync(candidate);
        if (!check.ok) {
          if (status) {
            status.textContent = `🛑 Антивирус заблокировал публикацию: ${check.reasons.join('; ')}`;
            status.className = 'form-status is-error';
          }
          return;
        }
      }

      state.localPosts.unshift(candidate);
      state.localPosts = state.localPosts.slice(0, 30);
      safeWriteJson(STORAGE_LOCAL_POSTS, state.localPosts);

      ev.target.reset();
      closeComposeModal();
      renderTeaserStrip();
      renderNewsView();
    });

    document.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape') {
        closeArticle();
        closeComposeModal();
      }
    });
  }

  window.GamesNewsHub = {
    loadFeed,
    openArticle,
    closeArticle,
    getAllItems,
  };

  bindEvents();
  loadFeed(false);
})();
