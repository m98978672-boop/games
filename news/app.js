/* ==========================================================================
   Games News — Автономный движок отдельного отдела новостей (news/app.js)
   Работает и как самостоятельный портал (/games/news/), и встроенным
   внутрь вкладки «📰 Новости» на Games (?embed=games) через postMessage —
   по той же архитектуре, что и мессенджер RatMes.
   ========================================================================== */
(function () {
  'use strict';

  const STORAGE_BOOKMARKS = 'games_news_bookmarks_v1';
  const STORAGE_LIKES = 'games_news_likes_v1';
  const STORAGE_READ = 'games_news_read_v1';
  const STORAGE_LOCAL_POSTS = 'games_news_local_posts_v1';
  const STORAGE_USER_COMMENTS = 'games_news_comments_v1';

  const DEFAULT_CATEGORIES = [
    { id: 'all', label: 'Все новости', icon: '✨' },
    { id: 'games', label: 'Игры и релизы', icon: '🎮' },
    { id: 'tech', label: 'Технологии и ИИ', icon: '🤖' },
    { id: 'science', label: 'Наука и космос', icon: '🚀' },
    { id: 'world', label: 'Мир и культура', icon: '🌍' },
    { id: 'security', label: 'Кибербезопасность', icon: '🛡️' },
    { id: 'facts', label: 'Факты и рекорды', icon: '⚡' },
  ];

  const CATEGORY_ACCENT = {
    games: 'blue',
    tech: 'violet',
    science: 'indigo',
    world: 'amber',
    security: 'emerald',
    facts: 'cyan',
  };

  const urlParams = new URLSearchParams(window.location.search || '');
  const isEmbed = urlParams.get('embed') === 'games';
  if (isEmbed) {
    document.body.classList.add('is-embed');
  }

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

  function notifyParent(msg) {
    if (!isEmbed || window.parent === window) return;
    try {
      window.parent.postMessage(msg, '*');
    } catch (err) {
      return Boolean(err && false);
    }
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
    if (diffMin < 0) {
      try {
        return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(ts));
      } catch {
        return String(isoStr).slice(0, 10);
      }
    }
    if (diffMin < 2) return 'Только что';
    if (diffMin < 60) return `${diffMin} мин назад`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `${diffH} ч назад`;
    const diffD = Math.floor(diffH / 24);
    if (diffD === 1) return 'Вчера';
    if (diffD < 7) return `${diffD} дн назад`;
    try {
      return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(ts));
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

  function normalizeCode(val) {
    return String(val || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  }

  function resolveAssetUrl(relPath) {
    const raw = String(relPath || '').trim();
    if (!raw) return '';
    if (!/^site\/assets\/[a-z0-9/_.-]+\.(jpg|jpeg|png|webp|svg)$/i.test(raw)) return '';
    return `../${raw}`;
  }

  const storedComments = safeReadJson(STORAGE_USER_COMMENTS, {});
  const state = {
    categories: DEFAULT_CATEGORIES.slice(),
    remoteItems: [],
    localPosts: Array.isArray(safeReadJson(STORAGE_LOCAL_POSTS, [])) ? safeReadJson(STORAGE_LOCAL_POSTS, []) : [],
    userComments: storedComments && typeof storedComments === 'object' && !Array.isArray(storedComments) ? storedComments : {},
    autoPost: null,
    updatedAt: '',
    activeCategory: urlParams.get('cat') || 'all',
    query: '',
    sort: 'fresh',
    bookmarks: new Set(Array.isArray(safeReadJson(STORAGE_BOOKMARKS, [])) ? safeReadJson(STORAGE_BOOKMARKS, []) : []),
    likes: new Set(Array.isArray(safeReadJson(STORAGE_LIKES, [])) ? safeReadJson(STORAGE_LIKES, []) : []),
    readIds: new Set(Array.isArray(safeReadJson(STORAGE_READ, [])) ? safeReadJson(STORAGE_READ, []) : []),
    activeArticleId: null,
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
    if (catId === 'bookmarks') return { id: 'bookmarks', label: 'Мои закладки', icon: '🔖' };
    return state.categories.find((c) => c.id === catId) || { id: catId, label: 'Новости', icon: '📰' };
  }

  function getItemComments(item) {
    // Только реальные комментарии читателей из localStorage: заготовленных/симулированных нет.
    const seeded = [];
    const byId = state.userComments[item?.id];
    const byCode = item?.code ? state.userComments[item.code] : null;
    const local = [
      ...(Array.isArray(byId) ? byId : []),
      ...(Array.isArray(byCode) ? byCode : []),
    ];
    const seen = new Set();
    const out = [];
    for (const c of [...seeded, ...local]) {
      if (!c || !c.text) continue;
      const cid = c.id || `${c.author}|${c.createdAt}|${c.text.slice(0, 24)}`;
      if (seen.has(cid)) continue;
      seen.add(cid);
      out.push(c);
    }
    return out;
  }

  function findArticleByIdOrCode(idOrCode) {
    const raw = String(idOrCode || '').trim();
    if (!raw) return null;
    const items = getAllItems();
    const byId = items.find((it) => it.id === raw);
    if (byId) return byId;
    const norm = normalizeCode(raw);
    if (!norm) return null;
    return items.find((it) => normalizeCode(it.code) === norm) || null;
  }

  function getFilteredItems() {
    const q = state.query.trim().toLowerCase();
    const qCode = normalizeCode(state.query);
    let list = getAllItems();

    if (state.activeCategory === 'bookmarks') {
      list = list.filter((it) => state.bookmarks.has(it.id));
    } else if (state.activeCategory !== 'all') {
      list = list.filter((it) => it.category === state.activeCategory);
    }

    if (q) {
      list = list.filter((it) => {
        const cNorm = normalizeCode(it.code);
        if (qCode && cNorm && cNorm.includes(qCode)) return true;
        const hay = [
          it.code || '',
          it.title || '',
          it.summary || '',
          ...(Array.isArray(it.tags) ? it.tags : []),
          it.sourceName || '',
        ].join(' ').toLowerCase();
        return hay.includes(q);
      });
      if (qCode) {
        return list.slice().sort((a, b) => {
          const scoreA = normalizeCode(a.code) === qCode ? 2 : (normalizeCode(a.code).startsWith(qCode) ? 1 : 0);
          const scoreB = normalizeCode(b.code) === qCode ? 2 : (normalizeCode(b.code).startsWith(qCode) ? 1 : 0);
          if (scoreB !== scoreA) return scoreB - scoreA;
          return Date.parse(b.publishedAt || 0) - Date.parse(a.publishedAt || 0);
        });
      }
    }

    if (state.sort === 'popular') {
      return list.slice().sort((a, b) => {
        const sA = (state.likes.has(a.id) ? 3 : 0) + getItemComments(a).length + (a.featured ? 2 : 0);
        const sB = (state.likes.has(b.id) ? 3 : 0) + getItemComments(b).length + (b.featured ? 2 : 0);
        if (sB !== sA) return sB - sA;
        return Date.parse(b.publishedAt || 0) - Date.parse(a.publishedAt || 0);
      });
    }
    return list.slice().sort((a, b) => Date.parse(b.publishedAt || 0) - Date.parse(a.publishedAt || 0));
  }

  function copyCodeText(code, btn) {
    const clean = String(code || '').trim();
    if (!clean) return;
    const orig = btn.textContent;
    const done = () => {
      btn.textContent = `✓ ${clean}`;
      setTimeout(() => { btn.textContent = orig; }, 1500);
    };
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      navigator.clipboard.writeText(clean).then(done).catch(done);
    } else {
      done();
    }
  }

  function closeMobileSidebar() {
    document.getElementById('newsSidebar')?.classList.remove('is-open');
    const bd = document.getElementById('sidebarBackdrop');
    if (bd) bd.hidden = true;
  }

  function openMobileSidebar() {
    document.getElementById('newsSidebar')?.classList.add('is-open');
    const bd = document.getElementById('sidebarBackdrop');
    if (bd) bd.hidden = false;
  }

  function syncUnreadCount() {
    const all = getAllItems();
    const unread = all.filter((it) => !state.readIds.has(it.id)).length;
    notifyParent({ type: 'news:unreadCount', count: unread });
  }

  function renderStatus() {
    const all = getAllItems();
    const verified = all.filter((it) => it.factCheck && it.factCheck.verified).length;
    const interval = state.autoPost?.intervalHours || 6;
    const updated = formatRelativeDate(state.autoPost?.lastRunAt || state.updatedAt);

    const statusEl = document.getElementById('newsStatusText');
    if (statusEl) {
      statusEl.textContent = `✓ ${verified} проверенных статей с кодами и фото · ⚡ Автопост каждые ${interval} ч · обновлено: ${updated}`;
    }
    const brandSub = document.getElementById('brandSub');
    if (brandSub) {
      brandSub.textContent = `${all.length} статей · 6 тем · 8 облаков`;
    }
    const totalBadge = document.getElementById('totalArticlesBadge');
    if (totalBadge) totalBadge.textContent = String(all.length);
  }

  function renderSidebarAndMobileCats() {
    const all = getAllItems();
    const counts = new Map();
    for (const it of all) {
      counts.set(it.category, (counts.get(it.category) || 0) + 1);
    }

    const cats = [
      ...state.categories.map((c) => ({
        id: c.id,
        icon: c.icon,
        label: c.label,
        count: c.id === 'all' ? all.length : (counts.get(c.id) || 0),
      })),
      { id: 'bookmarks', icon: '🔖', label: 'Мои закладки', count: state.bookmarks.size },
    ];

    const sideHost = document.getElementById('sidebarCategoryList');
    if (sideHost) {
      sideHost.replaceChildren(
        ...cats.map((c) => {
          const btn = el('button', `cat-btn${state.activeCategory === c.id ? ' is-active' : ''}`);
          btn.type = 'button';
          btn.setAttribute('data-select-cat', c.id);
          btn.append(el('span', '', `${c.icon} ${c.label}`), el('span', 'cat-btn-count', String(c.count)));
          return btn;
        })
      );
    }

    const mobHost = document.getElementById('mobileCategoryStrip');
    if (mobHost) {
      mobHost.replaceChildren(
        ...cats.map((c) => {
          const btn = el('button', `mobile-cat-pill${state.activeCategory === c.id ? ' is-active' : ''}`, `${c.icon} ${c.label} (${c.count})`);
          btn.type = 'button';
          btn.setAttribute('data-select-cat', c.id);
          return btn;
        })
      );
    }

    const codesHost = document.getElementById('quickCodesGrid');
    const codesBadge = document.getElementById('codesCountBadge');
    const codedItems = all.filter((it) => Boolean(it.code));
    if (codesBadge) codesBadge.textContent = String(codedItems.length);
    if (codesHost) {
      codesHost.replaceChildren(
        ...codedItems.map((it) => {
          const btn = el('button', `quick-code-btn${state.readIds.has(it.id) ? ' is-read' : ''}`, it.code);
          btn.type = 'button';
          btn.title = `${it.code} — ${it.title}`;
          btn.setAttribute('data-open-article', it.code);
          return btn;
        })
      );
    }
  }

  function buildCard(item, isHero) {
    const cat = getCategoryMeta(item.category);
    const accent = item.accent || CATEGORY_ACCENT[item.category] || 'blue';
    const imgSrc = resolveAssetUrl(item.image);
    const commentsCount = getItemComments(item).length;
    const proofsCount = Array.isArray(item.proofs) ? item.proofs.length : 0;
    const isLiked = state.likes.has(item.id);
    const isSaved = state.bookmarks.has(item.id);
    const isRead = state.readIds.has(item.id);

    const card = el('article', `${isHero ? 'hero-card' : 'article-card'}${isRead ? ' is-read' : ''}`);
    if (item.code) card.setAttribute('data-code', item.code);

    const media = el('div', 'card-media');
    if (imgSrc) {
      const img = document.createElement('img');
      img.className = 'card-photo';
      img.src = imgSrc;
      img.alt = item.imageCaption || item.title;
      img.loading = isHero ? 'eager' : 'lazy';
      img.decoding = 'async';
      media.append(img, el('div', 'card-photo-scrim'));
    }

    const top = el('div', 'card-media-top');
    if (item.code) {
      const codeBtn = el('button', 'code-pill', `🔑 ${item.code}`);
      codeBtn.type = 'button';
      codeBtn.title = `Скопировать короткий код ${item.code}`;
      codeBtn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        copyCodeText(item.code, codeBtn);
      });
      top.appendChild(codeBtn);
    }
    if (item.factCheck && item.factCheck.verified) {
      top.appendChild(el('span', 'verified-pill', proofsCount ? `✓ Фактчек (${proofsCount})` : '✓ Фактчек'));
    }

    const bottom = el('div', 'card-media-bottom');
    bottom.appendChild(el('span', `cat-chip accent-${accent}`, `${cat.icon} ${cat.label}`));
    media.append(top, bottom);

    const body = el('div', 'card-body');
    const meta = el('div', 'card-meta');
    meta.append(
      el('span', '', item.sourceName || 'Games News'),
      el('span', '', '·'),
      el('span', '', formatRelativeDate(item.publishedAt)),
      el('span', '', '·'),
      el('span', '', `${item.readMin || 2} мин`)
    );

    const title = el(isHero ? 'h2' : 'h3', 'card-title', item.title);
    const summary = el('p', 'card-summary', item.summary);

    const tags = el('div', 'tags-row');
    (Array.isArray(item.tags) ? item.tags.slice(0, 4) : []).forEach((t) => {
      tags.appendChild(el('span', 'tag-chip', `#${t}`));
    });

    const foot = el('div', 'card-foot');
    const readBtn = el('button', 'btn-accent', isHero ? '📖 Читать и доказательства →' : 'Читать →');
    readBtn.type = 'button';
    readBtn.setAttribute('data-open-article', item.code || item.id);

    const actions = el('div', 'card-actions');
    const comBtn = el('button', 'mini-btn', `💬 ${commentsCount}`);
    comBtn.type = 'button';
    comBtn.title = 'Комментарии';
    comBtn.setAttribute('data-open-article', item.code || item.id);

    const likeBtn = el('button', `mini-btn${isLiked ? ' is-active' : ''}`, isLiked ? '👍 1' : '👍');
    likeBtn.type = 'button';
    likeBtn.title = 'Нравится';
    likeBtn.setAttribute('data-like-id', item.id);

    const bmBtn = el('button', `mini-btn${isSaved ? ' is-active' : ''}`, isSaved ? '🔖' : '📑');
    bmBtn.type = 'button';
    bmBtn.title = isSaved ? 'Убрать из закладок' : 'В закладки';
    bmBtn.setAttribute('data-bookmark-id', item.id);

    actions.append(comBtn, likeBtn, bmBtn);
    foot.append(readBtn, actions);
    body.append(meta, title, summary, tags, foot);
    card.append(media, body);

    card.addEventListener('click', (ev) => {
      if (ev.target.closest('button, a')) return;
      openArticle(item.code || item.id);
    });

    return card;
  }

  function renderMainView() {
    renderStatus();
    renderSidebarAndMobileCats();
    syncUnreadCount();

    const catMeta = getCategoryMeta(state.activeCategory);
    const titleEl = document.getElementById('workspaceTitle');
    if (titleEl) {
      titleEl.textContent = state.query.trim()
        ? `🔎 Поиск: «${state.query.trim()}»`
        : `${catMeta.icon} ${catMeta.label}`;
    }

    const heroSlot = document.getElementById('heroArticleSlot');
    const gridSlot = document.getElementById('articlesGrid');
    const emptyEl = document.getElementById('emptyState');
    if (!heroSlot || !gridSlot) return;

    const list = getFilteredItems();
    if (!list.length) {
      heroSlot.replaceChildren();
      gridSlot.replaceChildren();
      if (emptyEl) emptyEl.hidden = false;
      return;
    }

    if (emptyEl) emptyEl.hidden = true;
    const showHero = !state.query.trim() && state.activeCategory !== 'bookmarks' && list.length >= 2;
    if (showHero) {
      const hero = list.find((it) => it.featured) || list[0];
      const rest = list.filter((it) => it.id !== hero.id);
      heroSlot.replaceChildren(buildCard(hero, true));
      gridSlot.replaceChildren(...rest.map((it) => buildCard(it, false)));
    } else {
      heroSlot.replaceChildren();
      gridSlot.replaceChildren(...list.map((it) => buildCard(it, false)));
    }
  }

  function addComment(item, authorRaw, textRaw) {
    const author = String(authorRaw || '').trim().slice(0, 48) || 'Читатель Games';
    const text = String(textRaw || '').trim().slice(0, 600);
    if (text.length < 3) {
      return { ok: false, error: 'Напишите комментарий минимум из 3 символов.' };
    }
    const av = window.GamesAntivirus;
    if (av && typeof av.scanNewsItemSync === 'function') {
      const check = av.scanNewsItemSync({
        title: `Комментарий ${author} к ${item.code || item.id}`,
        summary: text,
        body: [text],
        sourceUrl: '',
      });
      if (!check.ok) {
        return { ok: false, error: `🛑 Антивирус заблокировал комментарий: ${check.reasons.join('; ')}` };
      }
    }

    const entry = {
      id: `ucom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      author,
      tool: 'Games News',
      toolUrl: '',
      text,
      createdAt: new Date().toISOString(),
    };
    const list = Array.isArray(state.userComments[item.id]) ? state.userComments[item.id].slice() : [];
    list.push(entry);
    state.userComments[item.id] = list.slice(-50);
    safeWriteJson(STORAGE_USER_COMMENTS, state.userComments);
    return { ok: true, entry };
  }

  function openArticle(idOrCode) {
    const items = getAllItems();
    const item = findArticleByIdOrCode(idOrCode);
    if (!item) return;
    const idx = items.findIndex((it) => it.id === item.id);

    state.activeArticleId = item.id;
    state.readIds.add(item.id);
    safeWriteJson(STORAGE_READ, [...state.readIds]);

    const modal = document.getElementById('readerModal');
    const stickyMeta = document.getElementById('readerStickyMeta');
    const content = document.getElementById('readerContent');
    if (!modal || !stickyMeta || !content) return;

    const cat = getCategoryMeta(item.category);
    const accent = item.accent || CATEGORY_ACCENT[item.category] || 'blue';
    const imgSrc = resolveAssetUrl(item.image);
    const safeUrl = safeExternalUrl(item.sourceUrl);
    const isLiked = state.likes.has(item.id);
    const isSaved = state.bookmarks.has(item.id);

    stickyMeta.replaceChildren();
    if (item.code) {
      const cBtn = el('button', 'code-pill', `🔑 ${item.code}`);
      cBtn.type = 'button';
      cBtn.addEventListener('click', () => copyCodeText(item.code, cBtn));
      stickyMeta.appendChild(cBtn);
    }
    stickyMeta.appendChild(el('span', `cat-chip accent-${accent}`, `${cat.icon} ${cat.label}`));
    if (item.factCheck?.verified) {
      stickyMeta.appendChild(el('span', 'verified-pill', '✓ Проверено'));
    }

    content.replaceChildren();
    const h2 = el('h2', 'reader-title', item.title);
    h2.id = 'readerArticleTitle';
    const sub = el('div', 'reader-submeta', `${item.sourceName || 'Games News'} · ${formatRelativeDate(item.publishedAt)} · ${item.readMin || 2} мин чтения`);
    content.append(h2, sub);

    if (imgSrc) {
      const fig = el('figure', 'reader-figure');
      const img = document.createElement('img');
      img.className = 'reader-photo';
      img.src = imgSrc;
      img.alt = item.imageCaption || item.title;
      fig.appendChild(img);
      if (item.imageCaption || item.imageCredit) {
        const cap = el('figcaption', 'reader-figcaption');
        if (item.imageCaption) cap.appendChild(el('span', '', item.imageCaption));
        if (item.imageCredit) cap.appendChild(el('span', 'reader-credit', `Фото: ${item.imageCredit}`));
        fig.appendChild(cap);
      }
      content.appendChild(fig);
    }

    const body = el('div', 'reader-body');
    const paras = Array.isArray(item.body) && item.body.length ? item.body : [item.summary || ''];
    paras.forEach((p) => body.appendChild(el('p', '', p)));
    content.appendChild(body);

    const proofs = (Array.isArray(item.proofs) ? item.proofs : [])
      .map((p) => ({ label: String(p?.label || '').trim(), url: safeExternalUrl(p?.url) }))
      .filter((p) => p.url);
    if (item.factCheck?.verified || proofs.length) {
      const pBox = el('section', 'proofs-box');
      const pHead = el('div', 'proofs-head');
      pHead.append(
        el('strong', '', '✓ Проверка фактов и доказательства'),
        item.factCheck?.checkedAt ? el('span', 'proofs-date', `Проверено: ${item.factCheck.checkedAt}`) : el('span')
      );
      pBox.appendChild(pHead);
      if (item.factCheck?.method) pBox.appendChild(el('p', 'proofs-method', item.factCheck.method));
      if (proofs.length) {
        const ul = el('ul', 'proofs-list');
        proofs.forEach((p) => {
          const li = el('li');
          const a = el('a', 'proof-link', `${p.label || p.url} ↗`);
          a.href = p.url;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          li.appendChild(a);
          ul.appendChild(li);
        });
        pBox.appendChild(ul);
      }
      content.appendChild(pBox);
    }

    const tags = el('div', 'tags-row');
    (Array.isArray(item.tags) ? item.tags : []).forEach((t) => tags.appendChild(el('span', 'tag-chip', `#${t}`)));
    content.appendChild(tags);

    const toolbar = el('div', 'reader-toolbar');
    const likeBtn = el('button', `btn-ghost${isLiked ? ' is-active' : ''}`, isLiked ? '👍 Понравилось' : '👍 Интересно');
    likeBtn.type = 'button';
    likeBtn.addEventListener('click', () => {
      toggleLike(item.id);
      openArticle(item.code || item.id);
    });
    const bmBtn = el('button', `btn-ghost${isSaved ? ' is-active' : ''}`, isSaved ? '🔖 В закладках' : '📑 В закладки');
    bmBtn.type = 'button';
    bmBtn.addEventListener('click', () => {
      toggleBookmark(item.id);
      openArticle(item.code || item.id);
    });
    const shareSlug = item.code || item.id;
    const copyBtn = el('button', 'btn-ghost', item.code ? `🔗 Ссылка #${item.code}` : '🔗 Скопировать ссылку');
    copyBtn.type = 'button';
    copyBtn.addEventListener('click', () => {
      const shareUrl = `${window.location.origin}${window.location.pathname}?code=${encodeURIComponent(shareSlug)}`;
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        navigator.clipboard.writeText(shareUrl).then(() => { copyBtn.textContent = `✓ Скопировано (${shareSlug})`; }).catch(() => {});
      }
    });
    toolbar.append(likeBtn, bmBtn, copyBtn);
    if (safeUrl) {
      const srcA = el('a', 'btn-accent', `Первоисточник (${item.sourceName || 'сайт'}) ↗`);
      srcA.href = safeUrl;
      srcA.target = '_blank';
      srcA.rel = 'noopener noreferrer';
      toolbar.appendChild(srcA);
    }
    content.appendChild(toolbar);

    // Комментарии
    const comments = getItemComments(item);
    const cSec = el('section', 'comments-section');
    const cHead = el('div', 'comments-head');
    cHead.append(
      el('h3', '', `💬 Комментарии (${comments.length})`),
      el('span', 'comments-note', 'Пишут только читатели · проверка GamesAntivirus v1.1')
    );
    cSec.appendChild(cHead);

    const cList = el('div', 'comments-list');
    if (!comments.length) {
      cList.appendChild(el('p', 'comments-empty', 'Пока никто не комментировал. Будьте первым — комментарий появится сразу после антивирусной проверки.'));
    }
    comments.forEach((c) => {
      const card = el('div', 'comment-card');
      const top = el('div', 'comment-top');
      top.appendChild(el('strong', 'comment-author', c.author || 'Читатель Games'));
      const tUrl = safeExternalUrl(c.toolUrl);
      if (c.tool) {
        if (tUrl) {
          const a = el('a', 'comment-tool-badge', `☁ ${c.tool} ↗`);
          a.href = tUrl;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          top.appendChild(a);
        } else {
          top.appendChild(el('span', 'comment-tool-badge', `💬 ${c.tool}`));
        }
      }
      top.appendChild(el('span', 'comment-time', formatRelativeDate(c.createdAt)));
      card.append(top, el('p', 'comment-text', c.text));
      cList.appendChild(card);
    });
    cSec.appendChild(cList);

    const form = el('form', 'comment-form');
    const ta = document.createElement('textarea');
    ta.className = 'text-input';
    ta.rows = 2;
    ta.maxLength = 600;
    ta.placeholder = `Добавить комментарий к новости ${item.code || ''}…`;

    const row = el('div', 'comment-form-row');
    const nameIn = document.createElement('input');
    nameIn.type = 'text';
    nameIn.className = 'text-input';
    nameIn.maxLength = 48;
    nameIn.placeholder = 'Ваше имя (например, Максим)';
    const subBtn = el('button', 'btn-accent', '💬 Отправить');
    subBtn.type = 'submit';
    row.append(nameIn, subBtn);

    const st = el('p', 'form-status');
    form.append(ta, row, st);
    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const res = addComment(item, nameIn.value, ta.value);
      if (!res.ok) {
        st.textContent = res.error;
        st.className = 'form-status is-error';
        return;
      }
      openArticle(item.code || item.id);
    });
    cSec.appendChild(form);
    content.appendChild(cSec);

    const pager = el('div', 'reader-pager');
    const prev = idx > 0 ? items[idx - 1] : null;
    const next = idx >= 0 && idx < items.length - 1 ? items[idx + 1] : null;
    if (prev) {
      const pBtn = el('button', 'btn-ghost', `← [${prev.code || ''}] ${prev.title.slice(0, 34)}…`);
      pBtn.type = 'button';
      pBtn.addEventListener('click', () => openArticle(prev.code || prev.id));
      pager.appendChild(pBtn);
    } else {
      pager.appendChild(el('span'));
    }
    if (next) {
      const nBtn = el('button', 'btn-ghost', `[${next.code || ''}] ${next.title.slice(0, 34)}… →`);
      nBtn.type = 'button';
      nBtn.addEventListener('click', () => openArticle(next.code || next.id));
      pager.appendChild(nBtn);
    }
    content.appendChild(pager);

    modal.hidden = false;
    content.scrollTop = 0;
    closeMobileSidebar();
    renderMainView();
  }

  function closeReader() {
    const modal = document.getElementById('readerModal');
    if (modal) modal.hidden = true;
    state.activeArticleId = null;
  }

  function openCompose() {
    const modal = document.getElementById('composeModal');
    if (!modal) return;
    const st = document.getElementById('composeStatus');
    if (st) {
      st.textContent = '';
      st.className = 'form-status';
    }
    modal.hidden = false;
    closeMobileSidebar();
  }

  function closeCompose() {
    const modal = document.getElementById('composeModal');
    if (modal) modal.hidden = true;
  }

  function toggleLike(id) {
    if (state.likes.has(id)) state.likes.delete(id);
    else state.likes.add(id);
    safeWriteJson(STORAGE_LIKES, [...state.likes]);
    renderMainView();
  }

  function toggleBookmark(id) {
    if (state.bookmarks.has(id)) state.bookmarks.delete(id);
    else state.bookmarks.add(id);
    safeWriteJson(STORAGE_BOOKMARKS, [...state.bookmarks]);
    renderMainView();
  }

  function selectCategory(catId) {
    state.activeCategory = catId || 'all';
    closeMobileSidebar();
    renderMainView();
    const sc = document.getElementById('newsScrollArea');
    if (sc) sc.scrollTop = 0;
    notifyParent({ type: 'news:categoryChanged', category: state.activeCategory });
  }

  async function loadFeed(forceFresh) {
    const btn = document.getElementById('btnRefreshFeed');
    if (btn) btn.disabled = true;
    try {
      const url = forceFresh ? `../site/news-feed.json?t=${Date.now()}` : '../site/news-feed.json';
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
      renderMainView();

      const initialCode = urlParams.get('code')
        || urlParams.get('news')
        || (window.location.hash || '').replace(/^#(news=)?/i, '').trim();
      if (initialCode) {
        openArticle(decodeURIComponent(initialCode));
      }
    } catch {
      renderMainView();
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  function bindEvents() {
    document.addEventListener('click', (ev) => {
      const target = ev.target;
      if (!(target instanceof Element)) return;

      const catBtn = target.closest('[data-select-cat]');
      if (catBtn) {
        selectCategory(catBtn.getAttribute('data-select-cat'));
        return;
      }

      const artBtn = target.closest('[data-open-article]');
      if (artBtn) {
        ev.preventDefault();
        openArticle(artBtn.getAttribute('data-open-article'));
        return;
      }

      const likeBtn = target.closest('[data-like-id]');
      if (likeBtn) {
        ev.stopPropagation();
        toggleLike(likeBtn.getAttribute('data-like-id'));
        return;
      }

      const bmBtn = target.closest('[data-bookmark-id]');
      if (bmBtn) {
        ev.stopPropagation();
        toggleBookmark(bmBtn.getAttribute('data-bookmark-id'));
        return;
      }

      if (target.closest('[data-close-reader]')) {
        closeReader();
        return;
      }

      if (target.closest('[data-close-compose]')) {
        closeCompose();
        return;
      }
    });

    const searchInput = document.getElementById('newsSearchInput');
    const clearBtn = document.getElementById('btnClearSearch');
    searchInput?.addEventListener('input', (ev) => {
      state.query = String(ev.target.value || '');
      if (clearBtn) clearBtn.hidden = !state.query;
      renderMainView();
    });
    searchInput?.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') {
        const exact = findArticleByIdOrCode(state.query);
        if (exact) {
          ev.preventDefault();
          openArticle(exact.code || exact.id);
        }
      }
    });
    clearBtn?.addEventListener('click', () => {
      state.query = '';
      if (searchInput) searchInput.value = '';
      clearBtn.hidden = true;
      renderMainView();
    });

    document.getElementById('newsSortSelect')?.addEventListener('change', (ev) => {
      state.sort = ev.target.value === 'popular' ? 'popular' : 'fresh';
      renderMainView();
    });

    document.getElementById('btnRefreshFeed')?.addEventListener('click', () => loadFeed(true));
    document.getElementById('btnOpenCompose')?.addEventListener('click', openCompose);
    document.getElementById('btnComposeMain')?.addEventListener('click', openCompose);
    document.getElementById('btnMobileMenu')?.addEventListener('click', openMobileSidebar);
    document.getElementById('sidebarBackdrop')?.addEventListener('click', closeMobileSidebar);
    document.getElementById('btnResetFilters')?.addEventListener('click', () => {
      state.query = '';
      state.activeCategory = 'all';
      if (searchInput) searchInput.value = '';
      if (clearBtn) clearBtn.hidden = true;
      renderMainView();
    });

    document.getElementById('composeForm')?.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const title = (document.getElementById('composeTitle')?.value || '').trim();
      const category = document.getElementById('composeCategory')?.value || 'games';
      const summary = (document.getElementById('composeSummary')?.value || '').trim();
      const bodyRaw = (document.getElementById('composeBody')?.value || '').trim();
      const sourceUrl = (document.getElementById('composeUrl')?.value || '').trim();
      const st = document.getElementById('composeStatus');

      if (title.length < 6 || bodyRaw.length < 20) {
        if (st) {
          st.textContent = 'Заполните заголовок (от 6 симв.) и текст статьи (от 20 симв.).';
          st.className = 'form-status is-error';
        }
        return;
      }

      const catMeta = getCategoryMeta(category);
      const paragraphs = bodyRaw.split(/\n+/).map((p) => p.trim()).filter(Boolean).slice(0, 6);
      const candidate = {
        id: `local-${Date.now().toString(36)}`,
        code: `U-${901 + state.localPosts.length}`,
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
        comments: [],
        isLocal: true,
      };

      const av = window.GamesAntivirus;
      if (av && typeof av.scanNewsItemSync === 'function') {
        const check = av.scanNewsItemSync(candidate);
        if (!check.ok) {
          if (st) {
            st.textContent = `🛑 Антивирус заблокировал публикацию: ${check.reasons.join('; ')}`;
            st.className = 'form-status is-error';
          }
          return;
        }
      }

      state.localPosts.unshift(candidate);
      state.localPosts = state.localPosts.slice(0, 30);
      safeWriteJson(STORAGE_LOCAL_POSTS, state.localPosts);
      ev.target.reset();
      closeCompose();
      renderMainView();
    });

    document.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape') {
        closeReader();
        closeCompose();
        closeMobileSidebar();
      }
    });

    // Сообщения от родительского портала Games (как у RatMes)
    window.addEventListener('message', (ev) => {
      const data = ev.data;
      if (!data || typeof data !== 'object') return;
      if (data.type === 'news:selectCategory') {
        selectCategory(data.category || 'all');
      } else if (data.type === 'news:openArticle' && data.articleId) {
        openArticle(data.articleId);
      } else if (data.type === 'news:openCompose') {
        openCompose();
      } else if (data.type === 'news:refresh') {
        loadFeed(true);
      }
    });
  }

  window.GamesNewsApp = {
    loadFeed,
    openArticle,
    selectCategory,
    findArticleByIdOrCode,
    getAllItems,
  };

  bindEvents();
  loadFeed(false);
})();
