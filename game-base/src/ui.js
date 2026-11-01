/* ============================================================
   БАЗА — HUD (ui.js): topbar, панель, чипы, тосты, модалки, клавиши.
   Новая игра на базе БАЗЫ почти не трогает этот файл —
   меняются только тексты и состав статистики.
   ============================================================ */
(function () {
  const U = () => GB.util;

  const ui = {
    els: {},
    hudCache: {},
    comboFlashTimer: 0,

    init() {
      const ids = ['hud-score', 'hud-best', 'hud-combo', 'hud-time', 'hint', 'news',
        'pause-flag', 'toasts', 'modal-root', 'side', 'save-indicator',
        'btn-pause', 'btn-restart', 'btn-sound', 'btn-save', 'btn-help'];
      for (const id of ids) ui.els[id] = U().el(id);

      U().on(ui.els['btn-pause'], 'click', () => { GB.audio.unlock(); GB.game.togglePause(); });
      U().on(ui.els['btn-restart'], 'click', () => { GB.audio.unlock(); GB.audio.play('click'); GB.game.restart(); });
      U().on(ui.els['btn-save'], 'click', () => ui.saveNow());
      U().on(ui.els['btn-help'], 'click', () => { GB.audio.play('click'); ui.openHelp(); });
      U().on(ui.els['btn-sound'], 'click', () => ui.toggleSound());

      // клики по полю
      U().on(GB.render.canvas, 'pointerdown', (e) => {
        GB.audio.unlock();
        if (GB.render.mouse !== undefined) GB.render.mouse = { x: e.clientX, y: e.clientY };
        if (ui.els['modal-root'].classList.contains('open')) return;
        GB.game.click(e.clientX, e.clientY);
      });

      // клавиатура — общая для всех игр раскладка
      U().on(window, 'keydown', (e) => {
        if (e.repeat) return;
        const k = e.key.toLowerCase();
        if (k === ' ') { e.preventDefault(); GB.game.togglePause(); }
        else if (k === 'r') GB.game.restart();
        else if (k === 'h') ui.openHelp();
        else if (k === 'm') ui.toggleSound();
        else if (k === 's') ui.saveNow();
        else if (k === 'escape') ui.closeModal();
      });

      // автосохранение при уходе со страницы
      U().on(window, 'beforeunload', () => ui.persist());
      U().on(document, 'visibilitychange', () => {
        if (document.hidden) {
          ui.persist();
          const s = GB.game.state;
          if (s && s.running && !s.paused && !s.over) GB.game.togglePause(true);
        }
      });

      ui.syncSoundBtn();
    },

    persist() {
      const s = GB.game.state;
      if (!s) return;
      GB.save.write({
        best: Math.max(s.best || 0, s.score),
        totalCaught: (GB.save.load().totalCaught || 0),
        muted: GB.audio.isMuted(),
      });
    },

    saveNow() {
      const s = GB.game.state;
      if (s) s.best = Math.max(s.best || 0, s.score);
      ui.persist();
      GB.audio.play('click');
      ui.toast('Записал в блокнот (localStorage)', 'good', '✎');
      ui.flashSave();
    },

    flashSave() {
      const el = ui.els['save-indicator'];
      el.classList.add('flash');
      setTimeout(() => el.classList.remove('flash'), 900);
    },

    toggleSound() {
      const m = !GB.audio.isMuted();
      GB.audio.setMuted(m);
      ui.syncSoundBtn();
      ui.persist();
      ui.toast(m ? 'Звук выключил' : 'Звук включил', '', m ? '🔇' : '🔊');
      if (!m) GB.audio.play('click');
    },

    syncSoundBtn() {
      ui.els['btn-sound'].textContent = GB.audio.isMuted() ? '🔇' : '🔊';
      ui.els['btn-sound'].classList.toggle('on', !GB.audio.isMuted());
    },

    setPauseFlag(show) {
      ui.els['pause-flag'].classList.toggle('show', !!show);
      ui.els['btn-pause'].classList.toggle('on', !!show);
      ui.els['btn-pause'].textContent = show ? '▶' : '⏸';
    },

    setHint(text) { ui.els.hint.textContent = text; },
    setNews(text) { ui.els.news.textContent = text || ''; },

    toast(text, cls, icon) {
      const box = ui.els.toasts;
      const t = document.createElement('div');
      t.className = 'toast' + (cls ? ' ' + cls : '');
      t.innerHTML = (icon ? `<span class="toast-icon">${icon}</span>` : '') + `<span></span>`;
      t.lastChild.textContent = text;
      box.appendChild(t);
      while (box.children.length > 4) box.removeChild(box.firstChild);
      setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 400); }, 2600);
    },

    flashCombo() {
      const el = ui.els['hud-combo'];
      el.classList.add('hot');
      clearTimeout(ui.comboFlashTimer);
      ui.comboFlashTimer = setTimeout(() => el.classList.remove('hot'), 350);
    },

    // --- HUD: обновляем только изменившиеся значения ---
    updateHud() {
      const s = GB.game.state;
      if (!s) return;
      const set = (id, val) => {
        if (ui.hudCache[id] !== val) { ui.hudCache[id] = val; ui.els[id].textContent = val; }
      };
      const score = U().fmt(s.score);
      if (ui.hudCache['hud-score'] !== score) {
        ui.hudCache['hud-score'] = score;
        const el = ui.els['hud-score'];
        el.textContent = score;
        // «прыгаем» при каждом изменении счёта
        el.classList.remove('pop');
        void el.offsetWidth;
        el.classList.add('pop');
      }
      set('hud-best', U().fmt(s.best || 0));
      set('hud-combo', '×' + s.combo);
      set('hud-time', String(Math.ceil(s.timeLeftMs / 1000)));
    },

    renderSide() {
      const s = GB.game.state;
      if (!s) return;
      const c = GB.CONFIG;
      const left = Math.max(0, s.timeLeftMs / 1000);
      const pct = Math.round(100 * left / c.roundSeconds);
      ui.els.side.innerHTML = `
        <div class="side-head"><h3>Раунд · ${Math.ceil(left)} с</h3><span class="sticker">ручная сборка</span></div>
        <div class="bar"><i style="width:${pct}%"></i></div>
        <div class="side-stats">
          <div><span>Поймано</span><b class="gold">${s.caught}</b></div>
          <div><span>Сбежало</span><b>${s.missed}</b></div>
          <div><span>Комбо</span><b class="gold">×${s.combo}</b></div>
          <div><span>Рекорд</span><b>${U().fmt(s.best || 0)}</b></div>
        </div>
        <p class="side-note">Лови подряд — комбо растёт до ×${c.comboMax}. Один промах — и всё сгорает.</p>
        <button class="btn btn-primary" id="btn-new-round">Ещё раунд!</button>`;
      U().on(U().el('btn-new-round'), 'click', () => { GB.audio.play('click'); GB.game.restart(); });
    },

    // --- модальные окна ---
    openModal(html, wide) {
      const root = ui.els['modal-root'];
      root.innerHTML = `<div class="modal-backdrop"><div class="modal${wide ? ' wide' : ''}">${html}</div></div>`;
      root.classList.add('open');
      U().on(root.querySelector('.modal-backdrop'), 'pointerdown', (e) => {
        if (e.target === e.currentTarget) ui.closeModal();
      });
    },

    closeModal() {
      const root = ui.els['modal-root'];
      if (!root.classList.contains('open')) return;
      root.classList.remove('open');
      root.innerHTML = '';
    },

    openHelp() {
      ui.openModal(`
        <div class="modal-head"><h2>Как играть <span class="sticker">инструкция</span></h2><button class="icon-btn x" id="m-close">✕</button></div>
        <div class="modal-title-row">
          <svg class="doodle" width="46" height="46" viewBox="0 0 64 64" aria-hidden="true">
            <circle cx="32" cy="34" r="17" fill="rgba(255,207,125,.16)"/>
            <ellipse cx="21" cy="24" rx="9.5" ry="4.5" fill="none" stroke="#ffcf7d" stroke-width="2.2" transform="rotate(-28 21 24)"/>
            <ellipse cx="43" cy="24" rx="9.5" ry="4.5" fill="none" stroke="#ffcf7d" stroke-width="2.2" transform="rotate(28 43 24)"/>
            <ellipse cx="32" cy="37" rx="6.5" ry="9.5" fill="#ffd98a"/>
            <path d="M28 28 q-3 -6 -8 -7 M36 28 q3 -6 8 -7" fill="none" stroke="#ffcf7d" stroke-width="2.2" stroke-linecap="round"/>
          </svg>
          <h1 class="hand">Светлячки</h1>
        </div>
        <p>На тёмном поле вспыхивают светлячки и медленно дрейфуют — <b style="color:var(--accent-2)">они не любят ждать</b>.
        Лови их кликом, пока не погасли.</p>
        <ul>
          <li>Ловишь подряд быстрее ${GB.CONFIG.comboWindowMs / 1000} с — комбо растёт до ×${GB.CONFIG.comboMax}, очки умножаются.</li>
          <li>Промах или сбежавший светлячок сбрасывают комбо.</li>
          <li>Раунд длится ${GB.CONFIG.roundSeconds} секунд. Рекорд лежит в браузере и не пропадёт.</li>
        </ul>
        <table class="tbl">
          <tr><td><span class="kbd">Пробел</span></td><td>пауза</td></tr>
          <tr><td><span class="kbd">R</span></td><td>новый раунд</td></tr>
          <tr><td><span class="kbd">M</span></td><td>звук вкл/выкл</td></tr>
          <tr><td><span class="kbd">S</span></td><td>сохранить рекорд</td></tr>
          <tr><td><span class="kbd">H</span></td><td>это окно</td></tr>
          <tr><td><span class="kbd">Esc</span></td><td>закрыть окно</td></tr>
        </table>
        <div class="modal-actions"><button class="btn btn-primary" id="m-ok">Играть</button></div>
      `);
      U().on(U().el('m-close'), 'click', () => ui.closeModal());
      U().on(U().el('m-ok'), 'click', () => { GB.audio.play('click'); ui.closeModal(); });
    },

    onRoundEnd(s, prevBest) {
      const rec = s.isNewRecord && s.score > 0;
      const verdict =
        s.score >= 400 ? 'Невероятно! Настоящий ловец светлячков!' :
        s.score >= 250 ? 'Ого, почти идеальный улов!' :
        s.score >= 120 ? 'Хороший результат, рука набита!' :
        s.score >= 40 ? 'Неплохо для начала!' :
        'В следующий раз точно получится!';
      ui.renderSide();
      ui.setHint('Раунд окончен — «Ещё раунд!» или клавиша R');
      ui.openModal(`
        <div class="modal-head"><h2>Время вышло</h2><button class="icon-btn x" id="m-close">✕</button></div>
        <div class="end-score"><span class="hand">твой улов</span><b>${U().fmt(s.score)}</b></div>
        ${rec ? '<span class="new-record">★ новый рекорд! ★</span>' : ''}
        <p class="end-verdict">${verdict}</p>
        <p class="end-best">Рекорд: <b>${U().fmt(s.best)}</b>${prevBest < s.best ? ` (было ${U().fmt(prevBest)})` : ''} · поймано ${s.caught}, сбежало ${s.missed}</p>
        <div class="modal-actions">
          <button class="btn" id="m-help">Как играть</button>
          <button class="btn btn-primary" id="m-again">Ещё разок!</button>
        </div>
      `);
      U().on(U().el('m-close'), 'click', () => ui.closeModal());
      U().on(U().el('m-again'), 'click', () => { GB.audio.play('click'); GB.game.restart(); });
      U().on(U().el('m-help'), 'click', () => ui.openHelp());
      ui.toast(rec ? 'Новый рекорд — красавчик! ★' : 'Раунд окончен', rec ? 'win' : '', rec ? '★' : '🏁');
    },
  };

  GB.ui = ui;
})();
