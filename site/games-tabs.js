// Переключатель вкладок портала Games: «Магазин / Игры» и «Общение» (встроенный мессенджер RatMes + 9 облаков).
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

  if (!storeSections.length || !chatView || !frame) return;

  const baseSrc = frame.getAttribute('data-src') || 'ratmes/index.html?embed=games';
  let loaded = false;

  function loadFrame(roomId) {
    const url = roomId ? `${baseSrc}&room=${encodeURIComponent(roomId)}` : baseSrc;
    if (!loaded || (roomId && frame.getAttribute('src') !== url)) {
      frame.setAttribute('src', url);
      loaded = true;
    }
  }

  function setTab(tab, opts) {
    const options = opts || {};
    const isChat = tab === TAB_CHAT;

    for (const sec of storeSections) sec.hidden = isChat;
    chatView.hidden = !isChat;
    document.body.classList.toggle('portal-chat-active', isChat);

    for (const btn of navButtons) {
      const target = btn.getAttribute('data-portal-tab');
      const active = target === (isChat ? TAB_CHAT : TAB_GAMES);
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    }

    if (isChat) {
      loadFrame(options.room || null);
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

  if (cloudsToggle && cloudsStrip) {
    cloudsToggle.addEventListener('click', () => {
      const willOpen = cloudsStrip.hidden;
      cloudsStrip.hidden = !willOpen;
      cloudsToggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
    });
  }

  function syncFromHash() {
    const h = (window.location.hash || '').toLowerCase();
    if (h === '#chat' || h === '#obshchenie' || h === '#ratmes') {
      setTab(TAB_CHAT, { updateHash: false });
    } else {
      setTab(TAB_GAMES, { updateHash: false });
    }
  }

  window.addEventListener('hashchange', syncFromHash);
  syncFromHash();
})();
