// Переключатель вкладок портала Games:
// «Магазин / Игры», отдельный отдел «Новости» (Games News в iframe + 8 облаков)
// и отдельный мессенджер «Общение» (RatMes в iframe + 9 облаков).
(function () {
  const TAB_GAMES = 'games';
  const TAB_NEWS = 'news';
  const TAB_CHAT = 'chat';

  const navButtons = Array.from(document.querySelectorAll('[data-portal-tab]'));
  const storeNavLinks = Array.from(document.querySelectorAll('[data-store-nav]'));
  const chatTriggers = Array.from(document.querySelectorAll('[data-open-chat]'));
  const newsTriggers = Array.from(document.querySelectorAll('[data-open-news]'));
  const storeSections = Array.from(document.querySelectorAll('[data-portal-store-section]'));

  const chatView = document.getElementById('portal-chat-panel');
  const frame = document.getElementById('ratmesEmbedFrame');
  const roomButtons = Array.from(document.querySelectorAll('[data-ratmes-room]'));
  const cloudsToggle = document.getElementById('btnToggleCloudsStrip');
  const cloudsStrip = document.getElementById('portalCloudsStrip');
  const connectBtn = document.getElementById('btnPortalConnectServices');
  const fullscreenBtn = document.getElementById('btnChatFullscreen');

  const newsView = document.getElementById('portal-news-panel');
  const newsFrame = document.getElementById('newsEmbedFrame');
  const newsCatButtons = Array.from(document.querySelectorAll('[data-news-cat-btn]'));
  const newsCloudsToggle = document.getElementById('btnToggleNewsCloudsStrip');
  const newsCloudsStrip = document.getElementById('portalNewsCloudsStrip');
  const newsComposeBtn = document.getElementById('btnPortalNewsCompose');
  const newsFullscreenBtn = document.getElementById('btnNewsFullscreen');

  if (!storeSections.length || !chatView || !frame) return;

  const baseChatSrc = frame.getAttribute('data-src') || 'ratmes/index.html?embed=games';
  const baseNewsSrc = newsFrame?.getAttribute('data-src') || 'news/index.html?embed=games';

  let chatLoaded = false;
  let chatReady = false;
  let pendingChatMsg = null;

  let newsLoaded = false;
  let newsReady = false;
  let pendingNewsMsg = null;

  function safePostMessage(win, msg) {
    try {
      win?.postMessage(msg, '*');
    } catch (err) {
      return Boolean(err && false);
    }
    return true;
  }

  function safeReplaceHash(hash) {
    try {
      window.history.replaceState(null, '', hash);
    } catch (err) {
      return Boolean(err && false);
    }
    return true;
  }

  frame.addEventListener('load', () => {
    chatReady = true;
    if (pendingChatMsg) {
      safePostMessage(frame.contentWindow, pendingChatMsg);
      pendingChatMsg = null;
    }
  });

  newsFrame?.addEventListener('load', () => {
    newsReady = true;
    if (pendingNewsMsg) {
      safePostMessage(newsFrame.contentWindow, pendingNewsMsg);
      pendingNewsMsg = null;
    }
  });

  function postToChatFrame(msg) {
    if (chatReady && frame.contentWindow) {
      safePostMessage(frame.contentWindow, msg);
    } else {
      pendingChatMsg = msg;
    }
  }

  function postToNewsFrame(msg) {
    if (!newsFrame) return;
    if (newsReady && newsFrame.contentWindow) {
      safePostMessage(newsFrame.contentWindow, msg);
    } else {
      pendingNewsMsg = msg;
    }
  }

  function loadChatFrame(opts) {
    const o = opts || {};
    const params = [];
    if (o.room) params.push(`room=${encodeURIComponent(o.room)}`);
    if (o.connect) params.push(`connect=${encodeURIComponent(o.connect)}`);
    const suffix = params.length ? `&${params.join('&')}` : '';
    const url = `${baseChatSrc}${suffix}`;

    if (!chatLoaded) {
      frame.setAttribute('src', url);
      chatLoaded = true;
      return;
    }
    if (o.connect) {
      postToChatFrame({ type: 'ratmes:openConnectHub', service: o.connect === '1' ? 'max' : o.connect });
    } else if (o.room) {
      postToChatFrame({ type: 'ratmes:selectRoom', room: o.room });
    }
  }

  function loadNewsFrame(opts) {
    if (!newsFrame) return;
    const o = opts || {};
    const params = [];
    if (o.category && o.category !== 'all') params.push(`cat=${encodeURIComponent(o.category)}`);
    if (o.articleId) params.push(`code=${encodeURIComponent(o.articleId)}`);
    const suffix = params.length ? `&${params.join('&')}` : '';
    const url = `${baseNewsSrc}${suffix}`;

    if (!newsLoaded) {
      newsFrame.setAttribute('src', url);
      newsLoaded = true;
      if (o.compose) pendingNewsMsg = { type: 'news:openCompose' };
      return;
    }
    if (o.compose) {
      postToNewsFrame({ type: 'news:openCompose' });
    } else if (o.articleId) {
      postToNewsFrame({ type: 'news:openArticle', articleId: o.articleId });
    } else if (o.category) {
      postToNewsFrame({ type: 'news:selectCategory', category: o.category });
    }
  }

  function updateNewsBadge(unreadCount) {
    const n = Number(unreadCount);
    document.querySelectorAll('[data-news-badge]').forEach((badge) => {
      if (Number.isFinite(n) && n > 0) {
        badge.textContent = n > 9 ? '9+' : String(n);
        badge.hidden = false;
      } else {
        badge.textContent = '0';
        badge.hidden = true;
      }
    });
  }

  function highlightNewsCat(catId) {
    const activeCat = catId || 'all';
    for (const b of newsCatButtons) {
      b.classList.toggle('is-active', b.getAttribute('data-news-cat-btn') === activeCat);
    }
  }

  function setTab(tab, opts) {
    const options = opts || {};
    const normalized = tab === TAB_CHAT ? TAB_CHAT : (tab === TAB_NEWS && newsView ? TAB_NEWS : TAB_GAMES);
    const isChat = normalized === TAB_CHAT;
    const isNews = normalized === TAB_NEWS;
    const isGames = normalized === TAB_GAMES;

    for (const sec of storeSections) sec.hidden = !isGames;
    chatView.hidden = !isChat;
    if (newsView) newsView.hidden = !isNews;

    document.body.classList.toggle('portal-chat-active', isChat);
    document.body.classList.toggle('portal-news-active', isNews);
    if (!isChat) {
      document.body.classList.remove('chat-fullscreen');
      if (fullscreenBtn) {
        fullscreenBtn.setAttribute('aria-pressed', 'false');
        fullscreenBtn.textContent = '⛶';
      }
    }
    if (!isNews) {
      document.body.classList.remove('news-fullscreen');
      if (newsFullscreenBtn) {
        newsFullscreenBtn.setAttribute('aria-pressed', 'false');
        newsFullscreenBtn.textContent = '⛶';
      }
    }

    for (const btn of navButtons) {
      const target = btn.getAttribute('data-portal-tab');
      const active = target === normalized;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    }

    if (isChat) {
      loadChatFrame({ room: options.room || null, connect: options.connect || null });
      if (!options.keepScroll) window.scrollTo({ top: 0, behavior: 'auto' });
      if (options.updateHash !== false && window.location.hash !== '#chat') {
        safeReplaceHash('#chat');
      }
    } else if (isNews) {
      loadNewsFrame({
        category: options.category || null,
        articleId: options.articleId || null,
        compose: Boolean(options.compose),
      });
      if (!options.keepScroll) window.scrollTo({ top: 0, behavior: 'auto' });
      if (options.updateHash !== false) {
        const targetHash = options.articleId ? `#news=${encodeURIComponent(options.articleId)}` : '#news';
        if (window.location.hash !== targetHash) safeReplaceHash(targetHash);
      }
    } else if (options.updateHash !== false) {
      const cur = (window.location.hash || '').toLowerCase();
      if (cur === '#chat' || cur === '#obshchenie' || cur === '#ratmes' || cur.startsWith('#news') || cur === '#novosti') {
        safeReplaceHash('#top');
      }
    }
  }

  for (const btn of navButtons) {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      setTab(btn.getAttribute('data-portal-tab'));
    });
  }

  for (const link of storeNavLinks) {
    link.addEventListener('click', () => {
      if (document.body.classList.contains('portal-chat-active') || document.body.classList.contains('portal-news-active')) {
        setTab(TAB_GAMES, { updateHash: false });
      }
    });
  }

  for (const trigger of chatTriggers) {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const room = trigger.getAttribute('data-open-chat');
      setTab(TAB_CHAT, { room: room && room !== 'true' ? room : null });
    });
  }

  for (const trigger of newsTriggers) {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const articleId = trigger.getAttribute('data-open-news');
      setTab(TAB_NEWS, { articleId: articleId && articleId !== 'true' ? articleId : null });
    });
  }

  for (const rBtn of roomButtons) {
    rBtn.addEventListener('click', () => {
      const room = rBtn.getAttribute('data-ratmes-room');
      for (const b of roomButtons) b.classList.toggle('is-active', b === rBtn);
      setTab(TAB_CHAT, { room, keepScroll: true });
    });
  }

  for (const cBtn of newsCatButtons) {
    cBtn.addEventListener('click', () => {
      const category = cBtn.getAttribute('data-news-cat-btn') || 'all';
      highlightNewsCat(category);
      setTab(TAB_NEWS, { category, keepScroll: true });
    });
  }

  if (connectBtn) {
    connectBtn.addEventListener('click', () => {
      setTab(TAB_CHAT, { connect: 'max', keepScroll: true });
    });
  }

  if (newsComposeBtn) {
    newsComposeBtn.addEventListener('click', () => {
      setTab(TAB_NEWS, { compose: true, keepScroll: true });
    });
  }

  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', () => {
      const active = document.body.classList.toggle('chat-fullscreen');
      fullscreenBtn.setAttribute('aria-pressed', active ? 'true' : 'false');
      fullscreenBtn.textContent = active ? '✕' : '⛶';
    });
  }

  if (newsFullscreenBtn) {
    newsFullscreenBtn.addEventListener('click', () => {
      const active = document.body.classList.toggle('news-fullscreen');
      newsFullscreenBtn.setAttribute('aria-pressed', active ? 'true' : 'false');
      newsFullscreenBtn.textContent = active ? '✕' : '⛶';
    });
  }

  if (cloudsToggle && cloudsStrip) {
    cloudsToggle.addEventListener('click', () => {
      const willOpen = cloudsStrip.hidden;
      cloudsStrip.hidden = !willOpen;
      cloudsToggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
    });
  }

  if (newsCloudsToggle && newsCloudsStrip) {
    newsCloudsToggle.addEventListener('click', () => {
      const willOpen = newsCloudsStrip.hidden;
      newsCloudsStrip.hidden = !willOpen;
      newsCloudsToggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
    });
  }

  window.addEventListener('message', (ev) => {
    const data = ev.data;
    if (!data || typeof data !== 'object') return;
    if (data.type === 'news:unreadCount') {
      updateNewsBadge(data.count);
    } else if (data.type === 'news:categoryChanged') {
      highlightNewsCat(data.category);
    }
  });

  function syncFromHash() {
    const raw = window.location.hash || '';
    const h = raw.toLowerCase();
    const params = new URLSearchParams(window.location.search || '');
    const qTab = (params.get('tab') || '').toLowerCase();
    const qNews = params.get('news') || params.get('code') || '';

    if (h === '#chat' || h === '#obshchenie' || h === '#ratmes' || h === '#connect' || qTab === 'chat') {
      setTab(TAB_CHAT, { updateHash: false, connect: h === '#connect' ? 'max' : null });
    } else if (h === '#news' || h === '#novosti' || h.startsWith('#news=') || qTab === 'news' || Boolean(qNews)) {
      const articleId = h.startsWith('#news=') ? decodeURIComponent(raw.slice(6)) : (qNews || null);
      setTab(TAB_NEWS, { updateHash: false, articleId });
    } else {
      setTab(TAB_GAMES, { updateHash: false });
    }
  }

  window.GamesPortalTabs = { setTab };

  window.addEventListener('hashchange', syncFromHash);
  syncFromHash();
})();
