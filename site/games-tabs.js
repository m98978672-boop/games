// Переключатель вкладок портала Games:
// «Магазин / Игры», отдельный отдел «Новости» (Games News в iframe + 8 облаков),
// отдельный мессенджер «Общение» (RatMes в iframe + 9 облаков)
// и «Общение с ИИ» (Квеня из папки qwen-home в iframe).
(function () {
  const TAB_GAMES = 'games';
  const TAB_NEWS = 'news';
  const TAB_CHAT = 'chat';
  const TAB_TORRENT = 'torrent';
  const TAB_AI = 'ai';

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

  const torrentView = document.getElementById('portal-torrent-panel');
  const torrentFrame = document.getElementById('torrentEmbedFrame');
  const torrentQuickButtons = Array.from(document.querySelectorAll('[data-torrent-quick]'));
  const torrentOpenBtn = document.getElementById('btnTorrentOpen');
  const torrentFullscreenBtn = document.getElementById('btnTorrentFullscreen');

  const aiView = document.getElementById('portal-ai-panel');
  const aiFrame = document.getElementById('aiEmbedFrame');
  const aiFullscreenBtn = document.getElementById('btnAiFullscreen');

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
  const baseTorrentSrc = torrentFrame?.getAttribute('data-src') || 'torrent/index.html?embed=games';
  const baseAiSrc = aiFrame?.getAttribute('data-src') || 'kvenya/index.html?embed=games';

  let aiLoaded = false;

  function loadAiFrame() {
    if (!aiFrame || aiLoaded) return;
    aiFrame.setAttribute('src', baseAiSrc);
    aiLoaded = true;
  }

  let chatLoaded = false;
  let chatReady = false;
  let pendingChatMsg = null;

  let newsLoaded = false;
  let newsReady = false;
  let pendingNewsMsg = null;

  let torrentLoaded = false;
  let torrentReady = false;
  let pendingTorrentMsg = null;

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

  torrentFrame?.addEventListener('load', () => {
    torrentReady = true;
    if (pendingTorrentMsg) {
      safePostMessage(torrentFrame.contentWindow, pendingTorrentMsg);
      pendingTorrentMsg = null;
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

  function postToTorrentFrame(msg) {
    if (!torrentFrame) return;
    if (torrentReady && torrentFrame.contentWindow) {
      safePostMessage(torrentFrame.contentWindow, msg);
    } else {
      pendingTorrentMsg = msg;
    }
  }

  function loadTorrentFrame(opts) {
    if (!torrentFrame) return;
    const o = opts || {};
    const query = o.query ? `&q=${encodeURIComponent(o.query)}` : '';
    const url = `${baseTorrentSrc}${query}`;
    if (!torrentLoaded) {
      torrentFrame.setAttribute('src', url);
      torrentLoaded = true;
      if (o.query) pendingTorrentMsg = { type: 'torrent:search', query: o.query };
      return;
    }
    if (o.query) postToTorrentFrame({ type: 'torrent:search', query: o.query });
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
    const normalized = tab === TAB_CHAT
      ? TAB_CHAT
      : tab === TAB_TORRENT && torrentView
        ? TAB_TORRENT
        : tab === TAB_AI && aiView
          ? TAB_AI
          : (tab === TAB_NEWS && newsView ? TAB_NEWS : TAB_GAMES);
    const isChat = normalized === TAB_CHAT;
    const isNews = normalized === TAB_NEWS;
    const isTorrent = normalized === TAB_TORRENT;
    const isAi = normalized === TAB_AI;
    const isGames = normalized === TAB_GAMES;

    for (const sec of storeSections) sec.hidden = !isGames;
    chatView.hidden = !isChat;
    if (newsView) newsView.hidden = !isNews;
    if (torrentView) torrentView.hidden = !isTorrent;
    if (aiView) aiView.hidden = !isAi;

    document.body.classList.toggle('portal-chat-active', isChat);
    document.body.classList.toggle('portal-news-active', isNews);
    document.body.classList.toggle('portal-torrent-active', isTorrent);
    document.body.classList.toggle('portal-ai-active', isAi);
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
    if (!isTorrent) {
      document.body.classList.remove('torrent-fullscreen');
      if (torrentFullscreenBtn) {
        torrentFullscreenBtn.setAttribute('aria-pressed', 'false');
        torrentFullscreenBtn.textContent = '⛶';
      }
    }
    if (!isAi) {
      document.body.classList.remove('ai-fullscreen');
      if (aiFullscreenBtn) {
        aiFullscreenBtn.setAttribute('aria-pressed', 'false');
        aiFullscreenBtn.textContent = '⛶';
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
    } else if (isTorrent) {
      loadTorrentFrame({ query: options.query || null });
      if (!options.keepScroll) window.scrollTo({ top: 0, behavior: 'auto' });
      if (options.updateHash !== false && window.location.hash !== '#torrent') {
        safeReplaceHash('#torrent');
      }
    } else if (isAi) {
      loadAiFrame();
      if (!options.keepScroll) window.scrollTo({ top: 0, behavior: 'auto' });
      if (options.updateHash !== false && window.location.hash !== '#ai') {
        safeReplaceHash('#ai');
      }
    } else if (options.updateHash !== false) {
      const cur = (window.location.hash || '').toLowerCase();
      if (cur === '#chat' || cur === '#obshchenie' || cur === '#ratmes' || cur.startsWith('#news') || cur === '#novosti' || cur === '#torrent' || cur === '#ai' || cur === '#kvenya') {
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
      if (document.body.classList.contains('portal-chat-active') || document.body.classList.contains('portal-news-active') || document.body.classList.contains('portal-torrent-active') || document.body.classList.contains('portal-ai-active')) {
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

  if (torrentFullscreenBtn) {
    torrentFullscreenBtn.addEventListener('click', () => {
      const active = document.body.classList.toggle('torrent-fullscreen');
      torrentFullscreenBtn.setAttribute('aria-pressed', active ? 'true' : 'false');
      torrentFullscreenBtn.textContent = active ? '✕' : '⛶';
    });
  }

  if (aiFullscreenBtn) {
    aiFullscreenBtn.addEventListener('click', () => {
      const active = document.body.classList.toggle('ai-fullscreen');
      aiFullscreenBtn.setAttribute('aria-pressed', active ? 'true' : 'false');
      aiFullscreenBtn.textContent = active ? '✕' : '⛶';
    });
  }

  for (const qBtn of torrentQuickButtons) {
    qBtn.addEventListener('click', () => {
      const quick = qBtn.getAttribute('data-torrent-quick');
      for (const b of torrentQuickButtons) b.classList.toggle('is-active', b === qBtn);
      setTab(TAB_TORRENT, { keepScroll: true, query: quick === 'all' ? null : quick });
    });
  }

  if (torrentOpenBtn) {
    torrentOpenBtn.addEventListener('click', (e) => {
      e.preventDefault();
      setTab(TAB_TORRENT, { keepScroll: true });
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

    if (h === '#torrent' || h === '#торрент' || qTab === 'torrent') {
      setTab(TAB_TORRENT, { updateHash: false });
    } else if (h === '#ai' || h === '#kvenya' || h === '#ии' || qTab === 'ai') {
      setTab(TAB_AI, { updateHash: false });
    } else if (h === '#chat' || h === '#obshchenie' || h === '#ratmes' || h === '#connect' || qTab === 'chat') {
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
