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

    // новый раунд
    GB.game.newRound();
    if (data.best) GB.game.state.best = data.best;
    GB.ui.renderSide();
    GB.ui.setHint('Лови светлячков кликом — они не ждут!');
    GB.ui.setNews('');
    GB.ui.updateHud();

    // первое посещение — показываем «Как играть»
    if (!data.best && !data.totalCaught) {
      setTimeout(() => GB.ui.openHelp(), 350);
    } else {
      GB.ui.toast('С возвращением! Лови светлячков 👋', 'win', '✨');
    }

    // игровой цикл
    let last = performance.now();
    function frame(now) {
      const dt = Math.min(100, Math.max(0, now - last));
      last = now;
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
