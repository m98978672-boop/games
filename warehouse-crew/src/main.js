// Точка входа: грузим мозги и движок, собираем склад, запускаем кадры.
window.WC = window.WC || {};
(function (global) {
  'use strict';

  var booted = false;

  function showFatal(message) {
    var host = document.getElementById('modal-root');
    if (!host) return;
    host.innerHTML = '';
    var modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = '<h2>Не удалось запустить склад</h2>' +
      '<p style="color:#a9a294;font-size:12px;line-height:1.6">' + String(message || '') +
      '<br><br>Проверь, что папка открыта целиком: нужны <code>ratcore/</code>, <code>shared/</code> и <code>warehouse-crew/data/</code>.</p>';
    var backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.appendChild(modal);
    host.appendChild(backdrop);
    host.classList.add('open');
  }

  function unlockAudio() {
    window.WC.audio.unlock();
    window.removeEventListener('pointerdown', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
  }

  function boot() {
    if (booted) return Promise.resolve(global.WC.game.api);
    booted = true;
    var GE = global.GamesEngine;
    if (!GE) {
      showFatal('Движок shared/engine.js не найден.');
      return Promise.reject(new Error('Нет GamesEngine'));
    }
    return GE.ready()
      .then(function () { return global.WC.game.boot(); })
      .then(function () {
        global.WC.render.initStage();
        global.WC.ui.init();
        global.WC.render.start();
        document.getElementById('save-indicator').textContent = '● автосохранение';
        window.addEventListener('pointerdown', unlockAudio);
        window.addEventListener('keydown', unlockAudio);
        document.addEventListener('visibilitychange', function () {
          if (document.hidden) {
            global.WC.game.setPaused(true);
          }
        });
        window.addEventListener('beforeunload', function () {
          global.WC.save.save(global.WC.game);
        });
        document.body.classList.add('ready');
      })
      .catch(function (err) {
        console.error('[warehouse-crew] запуск не удался:', err);
        showFatal(err && err.message ? err.message : err);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  global.WC.main = { boot: boot };
})(typeof window !== 'undefined' ? window : globalThis);
