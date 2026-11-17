// Переключатель вкладок портала Games: «Магазин / Игры», «Новости» (автопост по категориям)
// и «Общение» (встроенный мессенджер RatMes + 9 облаков + Мастер MAX).
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
  const newsView = document.getElementById('portal-news-panel');
  const frame = document.getElementById('ratmesEmbedFrame');
  const roomButtons = Array.from(document.querySelectorAll('[data-ratmes-room]'));
  const cloudsToggle = document.getElementById('btnToggleCloudsStrip');
  const cloudsStrip = document.getElementById('portalCloudsStrip');
  const connectBtn = document.getElementById('btnPortalConnectServices');
  const fullscreenBtn = document.getElementById('btnChatFullscreen');

  if (!storeSections.length || !chatView || !frame) return;

  const baseSrc = frame.getAttribute('data-src') || 'ratmes/index.html?embed=games';
  let loaded = false;
  let frameReady = false;
  let pendingPostMsg = null;

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
    frameReady = true;
    if (pendingPostMsg) {
      safePostMessage(frame.contentWindow, pendingPostMsg);
      pendingPostMsg = null;
    }
  });

  function postToFrame(msg) {
    if (frameReady && frame.contentWindow) {
      safePostMessage(frame.contentWindow, msg);
    } else {
      pendingPostMsg = msg;
    }
  }

  function loadFrame(opts) {
    const o = opts || {};
    const params = [];
    if (o.room) params.push(`room=${encodeURIComponent(o.room)}`);
    if (o.connect) params.push(`connect=${encodeURIComponent(o.connect)}`);
    const suffix = params.length ? `&${params.join('&')}` : '';
    const url = `${baseSrc}${suffix}`;

    if (!loaded) {
      frame.setAttribute('src', url);
      loaded = true;
      return;
    }
    if (o.connect) {
      postToFrame({ type: 'ratmes:openConnectHub', service: o.connect === '1' ? 'max' : o.connect });
    } else if (o.room) {
      postToFrame({ type: 'ratmes:selectRoom', room: o.room });
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
      if (fullscreenBtn) fullscreenBtn.setAttribute('aria-pressed', 'false');
    }

    for (const btn of navButtons) {
      const target = btn.getAttribute('data-portal-tab');
      const active = target === normalized;
      btn.classList.toggle('is-active', active);
      if (btn.getAttribute('role') === 'tab') {
        btn.setAttribute('aria-selected', active ? 'true' : 'false');
        btn.tabIndex = active ? 0 : -1;
      } else {
        btn.setAttribute('aria-pressed', active ? 'true' : 'false');
      }
    }

    if (isChat) {
      loadFrame({ room: options.room || null, connect: options.connect || null });
      if (!options.keepScroll) window.scrollTo({ top: 0, behavior: 'auto' });
      if (options.updateHash !== false && window.location.hash !== '#chat') {
        safeReplaceHash('#chat');
      }
    } else if (isNews) {
      if (!options.keepScroll) window.scrollTo({ top: 0, behavior: 'auto' });
      if (options.updateHash !== false && !String(window.location.hash || '').startsWith('#news')) {
        safeReplaceHash('#news');
      }
      if (options.articleId && window.GamesNewsHub && typeof window.GamesNewsHub.openArticle === 'function') {
        window.GamesNewsHub.openArticle(options.articleId, { updateHash: false });
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

  if (connectBtn) {
    connectBtn.addEventListener('click', () => {
      setTab(TAB_CHAT, { connect: 'max', keepScroll: true });
    });
  }

  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', () => {
      const active = document.body.classList.toggle('chat-fullscreen');
      fullscreenBtn.setAttribute('aria-pressed', active ? 'true' : 'false');
      fullscreenBtn.textContent = active ? '✕' : '⛶';
    });
  }

  if (cloudsToggle && cloudsStrip) {
    cloudsToggle.addEventListener('click', () => {
      const willOpen = cloudsStrip.hidden;
      cloudsStrip.hidden = !willOpen;
      cloudsToggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
    });
  }

  const tablistEl = document.querySelector('.portal-main-tabs[role="tablist"]');
  if (tablistEl) {
    const tabEls = Array.from(tablistEl.querySelectorAll('[role="tab"][data-portal-tab]'));
    tablistEl.addEventListener('keydown', (e) => {
      const idx = tabEls.indexOf(document.activeElement);
      if (idx < 0) return;
      let nextIdx = -1;
      if (e.key === 'ArrowRight') nextIdx = (idx + 1) % tabEls.length;
      else if (e.key === 'ArrowLeft') nextIdx = (idx - 1 + tabEls.length) % tabEls.length;
      else if (e.key === 'Home') nextIdx = 0;
      else if (e.key === 'End') nextIdx = tabEls.length - 1;
      if (nextIdx >= 0) {
        e.preventDefault();
        const nextBtn = tabEls[nextIdx];
        nextBtn.focus();
        setTab(nextBtn.getAttribute('data-portal-tab'));
      }
    });
  }

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
