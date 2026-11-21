/* ============================================================
   БАЗА — точка входа (main.js): инициализация и игровой цикл.
   ============================================================ */
(function () {
  function boot() {
    const C = GB.CONFIG;

    // загружаем сохранение
    const data = GB.save.load();
    GB.audio.setMuted(!!data.muted);

    // инициализация модулей
    GB.render.init(GB.util.el('game'));
    GB.ui.init();

    // новый раунд в выбранном режиме (по умолчанию — прошлый)
    const savedMode = data.mode || localStorage.getItem('gb-base-mode') || 'fireflies';
    GB.game.newRound(savedMode);
    if (data.best) GB.game.state.best = data.best;
    GB.ui.renderSide();
    GB.ui.setHint(GB.game.MODES[GB.game.state.mode].note);
    GB.ui.setNews('');
    GB.ui.updateHud();

    // первое посещение — показываем «Как играть»
    if (!data.best && !data.totalCaught) {
      setTimeout(() => GB.ui.openHelp(), 350);
    } else {
      GB.ui.toast('С возвращением! Лови светлячков 👋', 'win', '✨');
    }

    // Тень в режиме «Поймай тень» убегает от указателя: слушаем поле.
    const field = GB.util.el('game');
    if (field && field.addEventListener) {
      field.addEventListener('pointermove', (e) => {
        const rect = field.getBoundingClientRect ? field.getBoundingClientRect() : { left: 0, top: 0 };
        GB.game.dodgeShadows(e.clientX - rect.left, e.clientY - rect.top, GB.render.w, GB.render.h);
      });
    }

    // игровой цикл
    let last = performance.now();
    function frame(now) {
      // Битая отметка времени не должна отравлять раунд: NaN в dt остановил бы игру.
      const stamp = Number.isFinite(now) ? now : (performance.now() || last);
      let dt = stamp - last;
      if (!Number.isFinite(dt) || dt < 0) dt = 0;
      dt = Math.min(100, dt);
      last = stamp;
      GB.game.update(dt, GB.render.w, GB.render.h);
      GB.render.draw(now);
      GB.ui.updateHud();
      // панель обновляем не каждый кадр, а 4 раза в секунду
      if ((frame.tick = (frame.tick || 0) + dt) > 250) {
        frame.tick = 0;
        GB.ui.renderSide();
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
