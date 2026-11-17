/* ==========================================================================
   Games — Вкладка «Новости» (site/news-hub.js)
   Мультикатегорийная лента с короткими кодами поиска (G-101..F-603),
   реальными локальными фото, блоком фактчека и доказательств,
   комментариями (включая синхронизацию с внешними инструментами + живую
   форму с проверкой GamesAntivirus), закладками, лайками и автопостом.
   ========================================================================== */
(function () {
  'use strict';

  const STORAGE_BOOKMARKS = 'games_news_bookmarks_v1';
  const STORAGE_LIKES = 'games_news_likes_v1';
  const STORAGE_READ = 'games_news_read_v1';
  const STORAGE_LOCAL_POSTS = 'games_news_local_posts_v1';
  const STORAGE_USER_COMMENTS = 'games_news_comments_v1';

  const DEFAULT_CATEGORIES = [
    { id: 'all', label: 'Все темы', icon: '✨' },
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

  const rootPrefix = document.body?.getAttribute('data-root') || '';
  const feedUrl = `${rootPrefix}site/news-feed.json`;

  function resolveAssetUrl(relPath) {
    const raw = String(relPath || '').trim();
    if (!raw) return '';
    if (!/^site\/assets\/[a-z0-9/_.-]+\.(jpg|jpeg|png|webp|svg)$/i.test(raw)) return '';
    if (rootPrefix === '../') {
      return raw.replace(/^site\//i, '');
    }
    return `${rootPrefix}${raw}`;
  }

  const storedComments = safeReadJson(STORAGE_USER_COMMENTS, {});
  const state = {
    categories: DEFAULT_CATEGORIES.slice(),
    remoteItems: [],
    localPosts: Array.isArray(safeReadJson(STORAGE_LOCAL_POSTS, [])) ? safeReadJson(STORAGE_LOCAL_POSTS, []) : [],
    userComments: storedComments && typeof storedComments === 'object' && !Array.isArray(storedComments) ? storedComments : {},
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

  function getItemComments(item) {
    const seeded = Array.isArray(item?.comments) ? item.comments : [];
    const keyById = state.userComments[item?.id];
    const keyByCode = item?.code ? state.userComments[item.code] : null;
    const local = [
      ...(Array.isArray(keyById) ? keyById : []),
      ...(Array.isArray(keyByCode) ? keyByCode : []),
    ];
    const seen = new Set();
    const all = [];
    for (const c of [...seeded, ...local]) {
      if (!c || !c.text) continue;
      const cid = c.id || `${c.author}|${c.createdAt}|${c.text.slice(0, 24)}`;
      if (seen.has(cid)) continue;
      seen.add(cid);
      all.push(c);
    }
    return all;
  }

  function findArticleByIdOrCode(idOrCode) {
    const raw = String(idOrCode || '').trim();
    if (!raw) return null;
    const items = getAllItems();
    const exactId = items.find((it) => it.id === raw);
    if (exactId) return exactId;
    const norm = normalizeCode(raw);
    if (!norm) return null;
    return items.find((it) => normalizeCode(it.code) === norm) || null;
  }

  function getCategoryMeta(catId) {
    return state.categories.find((c) => c.id === catId) || { id: catId, label: 'Новости', icon: '📰' };
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
        const itemCodeNorm = normalizeCode(it.code);
        if (qCode && itemCodeNorm && itemCodeNorm.includes(qCode)) {
          return true;
        }
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
        list = list.slice().sort((a, b) => {
          const exactA = normalizeCode(a.code) === qCode ? 2 : (normalizeCode(a.code).startsWith(qCode) ? 1 : 0);
          const exactB = normalizeCode(b.code) === qCode ? 2 : (normalizeCode(b.code).startsWith(qCode) ? 1 : 0);
          if (exactB !== exactA) return exactB - exactA;
          return Date.parse(b.publishedAt || 0) - Date.parse(a.publishedAt || 0);
        });
        return list;
      }
    }

    if (state.sort === 'popular') {
      list = list.slice().sort((a, b) => {
        const scoreA = (state.likes.has(a.id) ? 3 : 0) + getItemComments(a).length + (a.featured ? 2 : 0) + (a.pinned ? 1 : 0);
        const scoreB = (state.likes.has(b.id) ? 3 : 0) + getItemComments(b).length + (b.featured ? 2 : 0) + (b.pinned ? 1 : 0);
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
    const all = getAllItems();
    const total = all.length;
    const verifiedCount = all.filter((it) => it.factCheck && it.factCheck.verified).length;
    const ap = state.autoPost || {};
    const interval = ap.intervalHours || 6;
    const updated = formatRelativeDate(ap.lastRunAt || state.updatedAt);
    statusEl.textContent = `✓ ${verifiedCount} проверенных статей с кодами и фото · ⚡ Автопост каждые ${interval} ч · всего ${total} · обновлено: ${updated}`;
  }

  function copyCodeText(code, btn) {
    const clean = String(code || '').trim();
    if (!clean) return;
    const orig = btn.textContent;
    const done = () => {
      btn.textContent = `✓ ${clean}`;
      setTimeout(() => { btn.textContent = orig; }, 1600);
    };
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      navigator.clipboard.writeText(clean).then(done).catch(done);
    } else {
      done();
    }
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
        card.setAttribute('data-open-news-article', item.code || item.id);

        const top = el('span', 'news-teaser-top');
        const leftChips = el('span', 'news-teaser-chips');
        if (item.code) {
          leftChips.appendChild(el('span', 'news-code-chip is-compact', item.code));
        }
        leftChips.appendChild(el('span', `news-cat-chip accent-${item.accent || CATEGORY_ACCENT[item.category] || 'blue'}`, `${cat.icon} ${cat.label}`));
        top.append(leftChips, el('span', 'news-teaser-time', `${item.readMin || 2} мин`));

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
    const imgSrc = resolveAssetUrl(item.image);
    const commentsCount = getItemComments(item).length;
    const proofsCount = Array.isArray(item.proofs) ? item.proofs.length : 0;

    const card = el('article', `${isHero ? 'news-hero-card' : 'news-card'} accent-${accent}${isRead ? ' is-read' : ''}`);
    if (item.code) card.setAttribute('data-news-code', item.code);

    const banner = el('div', `news-card-banner${imgSrc ? ' has-photo' : ''}`);
    if (imgSrc) {
      const img = document.createElement('img');
      img.className = 'news-card-photo';
      img.src = imgSrc;
      img.alt = item.imageCaption || item.title;
      img.loading = isHero ? 'eager' : 'lazy';
      img.decoding = 'async';
      banner.appendChild(img);
      banner.appendChild(el('div', 'news-card-photo-scrim'));
    } else {
      banner.appendChild(el('span', 'news-card-icon', item.icon || cat.icon));
    }

    const topOverlay = el('div', 'news-banner-top');
    if (item.code) {
      const codeBtn = el('button', 'news-code-chip', `🔑 ${item.code}`);
      codeBtn.type = 'button';
      codeBtn.title = `Скопировать короткий код ${item.code} для быстрого поиска`;
      codeBtn.setAttribute('aria-label', `Скопировать код новости ${item.code}`);
      codeBtn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        copyCodeText(item.code, codeBtn);
      });
      topOverlay.appendChild(codeBtn);
    }
    if (item.factCheck && item.factCheck.verified) {
      topOverlay.appendChild(el('span', 'news-verified-chip', proofsCount > 0 ? `✓ Фактчек (${proofsCount})` : '✓ Фактчек'));
    }

    const bannerBadges = el('div', 'news-banner-badges');
    bannerBadges.appendChild(el('span', `news-cat-chip accent-${accent}`, `${cat.icon} ${cat.label}`));
    if (item.autoPosted) {
      bannerBadges.appendChild(el('span', 'news-auto-chip', '⚡ Автопост'));
    } else if (item.isLocal) {
      bannerBadges.appendChild(el('span', 'news-auto-chip is-local', '✍ Мой пост'));
    }
    banner.append(topOverlay, bannerBadges);

    const body = el('div', 'news-card-body');
    const meta = el('div', 'news-card-meta');
    meta.append(
      el('span', '', item.sourceName || 'Games'),
      el('span', '', '·'),
      el('span', '', formatRelativeDate(item.publishedAt)),
      el('span', '', '·'),
      el('span', '', `${item.readMin || 2} мин`)
    );

    const heading = el(isHero ? 'h2' : 'h3', 'news-card-title', item.title);
    const summary = el('p', 'news-card-summary', item.summary);

    const tagsRow = el('div', 'news-tags-row');
    (Array.isArray(item.tags) ? item.tags.slice(0, 4) : []).forEach((t) => {
      tagsRow.appendChild(el('span', 'news-tag', `#${t}`));
    });

    const foot = el('div', 'news-card-foot');
    const readBtn = el('button', 'btn btn-steam-blue btn-sm', isHero ? '📖 Читать и доказательства →' : 'Читать →');
    readBtn.type = 'button';
    readBtn.setAttribute('data-open-news-article', item.code || item.id);

    const actions = el('div', 'news-card-actions');
    const commentsPill = el('button', 'news-mini-btn', `💬 ${commentsCount}`);
    commentsPill.type = 'button';
    commentsPill.title = 'Открыть комментарии к новости';
    commentsPill.setAttribute('aria-label', `Комментарии: ${commentsCount}`);
    commentsPill.setAttribute('data-open-news-article', item.code || item.id);

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

    actions.append(commentsPill, likeBtn, bmBtn);
    foot.append(readBtn, actions);

    body.append(meta, heading, summary, tagsRow, foot);
    card.append(banner, body);

    card.addEventListener('click', (ev) => {
      if (ev.target.closest('button, a')) return;
      openArticle(item.code || item.id);
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

  function buildProofsSection(item) {
    const proofs = (Array.isArray(item.proofs) ? item.proofs : [])
      .map((p) => ({ label: String(p?.label || '').trim(), url: safeExternalUrl(p?.url) }))
      .filter((p) => p.url);
    const hasFactCheck = Boolean(item.factCheck && item.factCheck.verified);
    if (!hasFactCheck && !proofs.length) return null;

    const box = el('section', 'news-proofs-box');
    const head = el('div', 'news-proofs-head');
    head.append(
      el('strong', 'news-proofs-title', '✓ Проверка фактов и доказательства'),
      item.factCheck?.checkedAt ? el('span', 'news-proofs-date', `Проверено: ${item.factCheck.checkedAt}`) : el('span')
    );
    box.appendChild(head);

    if (item.factCheck?.method) {
      box.appendChild(el('p', 'news-proofs-method', item.factCheck.method));
    }

    if (proofs.length) {
      const list = el('ul', 'news-proofs-list');
      proofs.forEach((p) => {
        const li = el('li');
        const a = el('a', 'news-proof-link', `${p.label || p.url} ↗`);
        a.href = p.url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        li.appendChild(a);
        list.appendChild(li);
      });
      box.appendChild(list);
    }

    return box;
  }

  function addCommentForItem(item, authorRaw, textRaw) {
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
      tool: 'Games Портал',
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

  function buildCommentsSection(item) {
    const section = el('section', 'news-comments-section');
    const comments = getItemComments(item);

    const head = el('div', 'news-comments-head');
    head.append(
      el('h3', 'news-comments-title', `💬 Комментарии (${comments.length})`),
      el('span', 'news-comments-sync-note', 'Синхронизировано с облачными инструментами · проверено GamesAntivirus')
    );
    section.appendChild(head);

    const listWrap = el('div', 'news-comments-list');
    if (!comments.length) {
      listWrap.appendChild(el('p', 'news-comments-empty', 'Пока нет комментариев — будьте первым!'));
    } else {
      comments.forEach((c) => {
        const card = el('div', 'news-comment-card');
        const top = el('div', 'news-comment-top');
        top.appendChild(el('strong', 'news-comment-author', c.author || 'Читатель Games'));

        const toolLabel = String(c.tool || '').trim();
        const safeToolUrl = safeExternalUrl(c.toolUrl);
        if (toolLabel) {
          if (safeToolUrl) {
            const link = el('a', 'news-comment-tool-badge', `☁ ${toolLabel} ↗`);
            link.href = safeToolUrl;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            top.appendChild(link);
          } else {
            top.appendChild(el('span', 'news-comment-tool-badge', `💬 ${toolLabel}`));
          }
        }
        top.appendChild(el('span', 'news-comment-time', formatRelativeDate(c.createdAt)));

        const body = el('p', 'news-comment-text', c.text);
        card.append(top, body);
        listWrap.appendChild(card);
      });
    }
    section.appendChild(listWrap);

    const form = el('form', 'news-comment-form');
    const row = el('div', 'news-comment-form-row');
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'news-comment-input';
    nameInput.placeholder = 'Ваше имя (например, Максим)';
    nameInput.maxLength = 48;
    nameInput.setAttribute('aria-label', 'Ваше имя');

    const submitBtn = el('button', 'btn btn-steam-blue btn-sm', '💬 Отправить');
    submitBtn.type = 'submit';
    row.append(nameInput, submitBtn);

    const textArea = document.createElement('textarea');
    textArea.className = 'news-comment-textarea';
    textArea.rows = 2;
    textArea.maxLength = 600;
    textArea.placeholder = `Добавить комментарий к новости ${item.code || ''}…`;
    textArea.setAttribute('aria-label', 'Текст комментария');

    const status = el('div', 'form-status');
    form.append(textArea, row, status);

    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const res = addCommentForItem(item, nameInput.value, textArea.value);
      if (!res.ok) {
        status.textContent = res.error;
        status.className = 'form-status is-error';
        return;
      }
      openArticle(item.code || item.id, { updateHash: false });
    });

    section.appendChild(form);
    return section;
  }

  function openArticle(articleIdOrCode, opts) {
    const items = getAllItems();
    const found = findArticleByIdOrCode(articleIdOrCode);
    if (!found) return;
    const idx = items.findIndex((it) => it.id === found.id);
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
    const imgSrc = resolveAssetUrl(item.image);

    const wrap = el('div', 'news-reader-wrap');

    const header = el('div', `news-reader-head accent-${accent}`);
    const topMeta = el('div', 'news-reader-meta');
    if (item.code) {
      const codeBtn = el('button', 'news-code-chip', `🔑 Код: ${item.code}`);
      codeBtn.type = 'button';
      codeBtn.title = `Скопировать код ${item.code}`;
      codeBtn.addEventListener('click', () => copyCodeText(item.code, codeBtn));
      topMeta.appendChild(codeBtn);
    }
    topMeta.append(
      el('span', `news-cat-chip accent-${accent}`, `${cat.icon} ${cat.label}`),
      el('span', '', `${item.sourceName || 'Games'} · ${formatRelativeDate(item.publishedAt)} · ${item.readMin || 2} мин чтения`)
    );
    const h2 = el('h2', 'news-reader-title', item.title);
    h2.id = 'news-reader-title';
    header.append(topMeta, h2);
    wrap.appendChild(header);

    if (imgSrc) {
      const fig = el('figure', 'news-reader-figure');
      const img = document.createElement('img');
      img.className = 'news-reader-photo';
      img.src = imgSrc;
      img.alt = item.imageCaption || item.title;
      fig.appendChild(img);
      if (item.imageCaption || item.imageCredit) {
        const cap = el('figcaption', 'news-reader-figcaption');
        if (item.imageCaption) cap.appendChild(el('span', '', item.imageCaption));
        if (item.imageCredit) cap.appendChild(el('span', 'news-reader-credit', `Фото: ${item.imageCredit}`));
        fig.appendChild(cap);
      }
      wrap.appendChild(fig);
    }

    const articleBody = el('div', 'news-reader-body');
    const paragraphs = Array.isArray(item.body) && item.body.length ? item.body : [item.summary || ''];
    paragraphs.forEach((p) => {
      articleBody.appendChild(el('p', '', p));
    });
    wrap.appendChild(articleBody);

    const proofsBox = buildProofsSection(item);
    if (proofsBox) wrap.appendChild(proofsBox);

    const tags = el('div', 'news-tags-row');
    (Array.isArray(item.tags) ? item.tags : []).forEach((t) => tags.appendChild(el('span', 'news-tag', `#${t}`)));
    wrap.appendChild(tags);

    const toolbar = el('div', 'news-reader-actions');
    const likeBtn = el('button', `btn btn-steam-ghost btn-sm${isLiked ? ' is-active' : ''}`, isLiked ? '👍 Понравилось' : '👍 Интересно');
    likeBtn.type = 'button';
    likeBtn.addEventListener('click', () => {
      toggleLike(item.id);
      openArticle(item.code || item.id, { updateHash: false });
    });

    const bmBtn = el('button', `btn btn-steam-ghost btn-sm${isSaved ? ' is-active' : ''}`, isSaved ? '🔖 В закладках' : '📑 В закладки');
    bmBtn.type = 'button';
    bmBtn.addEventListener('click', () => {
      toggleBookmark(item.id);
      openArticle(item.code || item.id, { updateHash: false });
    });

    const hashSlug = item.code || item.id;
    const copyBtn = el('button', 'btn btn-steam-ghost btn-sm', item.code ? `🔗 Ссылка #${item.code}` : '🔗 Скопировать ссылку');
    copyBtn.type = 'button';
    copyBtn.addEventListener('click', () => {
      const shareUrl = `${window.location.origin}${window.location.pathname}#news=${encodeURIComponent(hashSlug)}`;
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        navigator.clipboard.writeText(shareUrl).then(() => {
          copyBtn.textContent = `✓ Скопировано (${hashSlug})`;
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
    wrap.appendChild(toolbar);

    wrap.appendChild(buildCommentsSection(item));

    const pager = el('div', 'news-reader-pager');
    const prevItem = idx > 0 ? items[idx - 1] : null;
    const nextItem = idx < items.length - 1 ? items[idx + 1] : null;
    if (prevItem) {
      const prevBtn = el('button', 'btn btn-steam-ghost btn-sm', `← ${prevItem.code ? `[${prevItem.code}] ` : ''}${prevItem.title.slice(0, 32)}…`);
      prevBtn.type = 'button';
      prevBtn.addEventListener('click', () => openArticle(prevItem.code || prevItem.id));
      pager.appendChild(prevBtn);
    } else {
      pager.appendChild(el('span'));
    }
    if (nextItem) {
      const nextBtn = el('button', 'btn btn-steam-ghost btn-sm', `${nextItem.code ? `[${nextItem.code}] ` : ''}${nextItem.title.slice(0, 32)}… →`);
      nextBtn.type = 'button';
      nextBtn.addEventListener('click', () => openArticle(nextItem.code || nextItem.id));
      pager.appendChild(nextBtn);
    }
    wrap.appendChild(pager);

    content.replaceChildren(wrap);

    modal.hidden = false;
    document.body.style.overflow = 'hidden';

    if (!opts || opts.updateHash !== false) {
      try {
        window.history.replaceState(null, '', `#news=${encodeURIComponent(hashSlug)}`);
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
      const params = new URLSearchParams(window.location.search || '');
      const qNews = params.get('news') || params.get('code') || '';
      if (h.startsWith('#news=')) {
        const targetId = decodeURIComponent(h.slice(6));
        if (targetId) openArticle(targetId, { updateHash: false });
      } else if (qNews) {
        openArticle(qNews, { updateHash: false });
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

    const searchInput = document.getElementById('news-search');
    searchInput?.addEventListener('input', (ev) => {
      state.query = String(ev.target.value || '');
      renderNewsView();
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
      const userNum = 901 + state.localPosts.length;
      const candidate = {
        id: `local-${Date.now().toString(36)}`,
        code: `U-${userNum}`,
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
    findArticleByIdOrCode,
    addCommentForItem,
    getAllItems,
  };

  bindEvents();
  loadFeed(false);
})();
