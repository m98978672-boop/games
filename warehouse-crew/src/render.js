// Кадровый цикл: обновление симуляции, рендер склада, интерфейс, инспектор.
window.WC = window.WC || {};

WC.render = (function () {
  'use strict';

  var running = false;
  var last = 0;
  var frameCount = 0;
  var fps = { value: 60, acc: 0, frames: 0 };
  var errors = 0;

  function start() {
    if (running) return;
    running = true;
    last = 0;
    var step = function (now) {
      if (!running) return;
      var dt = last ? (now - last) / 1000 : 1 / 60;
      last = now;
      dt = Math.min(0.12, dt);
      frame(dt);
      window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }

  function stop() {
    running = false;
  }

  function frame(dt) {
    try {
      WC.game.update(dt);
      WC.world.render(dt, WC.game);
      WC.ui.frame(dt);
      frameCount += 1;
      fps.acc += dt;
      fps.frames += 1;
      if (fps.acc >= 0.5) {
        fps.value = Math.round(fps.frames / fps.acc);
        fps.acc = 0;
        fps.frames = 0;
        var tick = document.getElementById('ctl-tick');
        if (tick) {
          var stats = WC.meshes.stats;
          tick.textContent = fps.value + ' fps · ' + stats.meshes + ' мешей/' + stats.triangles + ' тр.';
        }
      }
    } catch (err) {
      errors += 1;
      if (errors < 4) console.error('[warehouse-crew] кадр упал:', err);
      if (errors === 4) {
        WC.util.toast('Ошибка кадра: ' + (err && err.message ? err.message : err), 'bad', 6000);
      }
    }
  }

  function initStage() {
    var canvas = document.getElementById('scene');
    if (!canvas) throw new Error('Нет canvas#scene');
    try {
      WC.world.init(canvas, WC.game.api.engine);
    } catch (err) {
      // Самая частая причина — браузер не дал контекст WebGL
      if (/webgl|context/i.test(String(err && err.message))) {
        throw new Error('Браузер не дал WebGL (' + err.message + '). Включите аппаратное ускорение в настройках браузера или откройте игру в Chrome/Edge/Firefox.');
      }
      throw err;
    }
    WC.world.attachCrew(WC.game);
    WC.world.setFocus(WC.game.api.activeWorkerId);
    WC.world.setMode('third');
    document.body.classList.add('view-third');
  }

  return {
    start: start,
    stop: stop,
    frame: frame,
    initStage: initStage,
    fps: fps,
    get frames() { return frameCount; },
    get errors() { return errors; },
  };
})();
