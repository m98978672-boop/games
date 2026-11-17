// Переключатель вкладок портала Games: «Магазин / Игры» и «Общение» (встроенный мессенджер RatMes + 9 облаков + Мастер MAX).
(function () {
  const TAB_GAMES = 'games';
  const TAB_CHAT = 'chat';

  const navButtons = Array.from(document.querySelectorAll('[data-portal-tab]'));
  const storeNavLinks = Array.from(document.querySelectorAll('[data-store-nav]'));
  const chatTriggers = Array.from(document.querySelectorAll('[data-open-chat]'));
  const storeSections = Array.from(document.querySelectorAll('[data-portal-store-section]'));
  const chatView = document.getElementById('portal-chat-panel');
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

  frame.addEventListener('load', () => {
    frameReady = true;
    if (pendingPostMsg) {
      try { frame.contentWindow?.postMessage(pendingPostMsg, '*'); } catch { /* ignore */ }
      pendingPostMsg = null;
    }
  });

  function postToFrame(msg) {
    if (frameReady && frame.contentWindow) {
      try { frame.contentWindow.postMessage(msg, '*'); } catch { /* ignore */ }
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
    const isChat = tab === TAB_CHAT;

    for (const sec of storeSections) sec.hidden = isChat;
    chatView.hidden = !isChat;
    document.body.classList.toggle('portal-chat-active', isChat);
    if (!isChat) {
      document.body.classList.remove('chat-fullscreen');
      if (fullscreenBtn) fullscreenBtn.setAttribute('aria-pressed', 'false');
    }

    for (const btn of navButtons) {
      const target = btn.getAttribute('data-portal-tab');
      const active = target === (isChat ? TAB_CHAT : TAB_GAMES);
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    }

    if (isChat) {
      loadFrame({ room: options.room || null, connect: options.connect || null });
      if (!options.keepScroll) {
        window.scrollTo({ top: 0, behavior: 'auto' });
      }
      if (options.updateHash !== false && window.location.hash !== '#chat') {
        try {
          window.history.replaceState(null, '', '#chat');
        } catch {
          // ignore history restrictions
        }
      }
    } else if (options.updateHash !== false) {
      const cur = (window.location.hash || '').toLowerCase();
      if (cur === '#chat' || cur === '#obshchenie' || cur === '#ratmes') {
        try {
          window.history.replaceState(null, '', '#top');
        } catch {
          // ignore
        }
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
      if (document.body.classList.contains('portal-chat-active')) {
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

  function syncFromHash() {
    const h = (window.location.hash || '').toLowerCase();
    if (h === '#chat' || h === '#obshchenie' || h === '#ratmes' || h === '#connect') {
      setTab(TAB_CHAT, { updateHash: false, connect: h === '#connect' ? 'max' : null });
    } else {
      setTab(TAB_GAMES, { updateHash: false });
    }
  }

  window.addEventListener('hashchange', syncFromHash);
  syncFromHash();
})();
