// Переключатель вкладок портала Games: «Игры» и «Общение» (встроенный мессенджер RatMes + 9 подключённых облаков).
(function () {
  const TAB_GAMES = 'games';
  const TAB_CHAT = 'chat';

  const navButtons = Array.from(document.querySelectorAll('[data-portal-tab]'));
  const chatTriggers = Array.from(document.querySelectorAll('[data-open-chat]'));
  const gamesView = document.getElementById('portal-games-view');
  const chatView = document.getElementById('portal-chat-panel');
  const hero = document.querySelector('header.hero');
  const frame = document.getElementById('ratmesEmbedFrame');
  const roomButtons = Array.from(document.querySelectorAll('[data-ratmes-room]'));
  const cloudsToggle = document.getElementById('btnToggleCloudsStrip');
  const cloudsStrip = document.getElementById('portalCloudsStrip');

  if (!gamesView || !chatView || !frame) return;

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

    gamesView.hidden = isChat;
    chatView.hidden = !isChat;
    if (hero) hero.hidden = isChat;
    document.body.classList.toggle('portal-chat-active', isChat);

    for (const btn of navButtons) {
      const active = btn.getAttribute('data-portal-tab') === (isChat ? TAB_CHAT : TAB_GAMES);
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
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
    } else if (options.updateHash !== false && (window.location.hash === '#chat' || window.location.hash === '#obshchenie')) {
      try {
        window.history.replaceState(null, '', '#games');
      } catch {
        // ignore
      }
    }
  }

  for (const btn of navButtons) {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      setTab(btn.getAttribute('data-portal-tab'));
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
