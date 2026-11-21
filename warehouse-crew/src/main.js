// Точка входа: грузим мозги и движок, собираем склад, запускаем кадры.
window.WC = window.WC || {};
(function (global) {
  'use strict';

  var bootPromise = null;

  function showFatal(message) {
    var host = document.getElementById('modal-root');
    if (!host) return;
    host.innerHTML = '';
    var modal = document.createElement('div');
    modal.className = 'modal';
    var where = location.protocol === 'file:' ? 'файл с диска (file://)' : location.href;
    modal.innerHTML = '<h2>Не удалось запустить склад</h2>' +
      '<p style="color:#a9a294;font-size:12px;line-height:1.6">' +
      '<b>Ошибка:</b> ' + String(message || 'неизвестно') +
      '<br><b>Откуда открыто:</b> ' + where +
      '<br><br>Что делать:' +
      '<br>1. Распакуйте архив целиком — рядом с <code>warehouse-crew/</code> должны лежать папки <code>shared/</code>, <code>shooter/</code> и <code>ratcore/</code>.' +
      '<br>2. Открывайте <code>warehouse-crew/index.html</code>, а не отдельный файл из архива (не перетаскивайте один html).' +
      '<br>3. Если браузер блокирует локальные данные — запустите из папки: <code>python3 -m http.server 8000</code> и откройте <code>http://localhost:8000/warehouse-crew/</code>.' +
      '<br>4. Онлайн-версия: <code>https://m98978672-boop.github.io/games/warehouse-crew/</code></p>';
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
    // Повторный вызов возвращает тот же промис: раньше он отдавал ещё не готовый api
    if (bootPromise) return bootPromise;
    var GE = global.GamesEngine;
    if (!GE) {
      showFatal('Движок shared/engine.js не найден.');
      bootPromise = Promise.reject(new Error('Нет GamesEngine'));
      return bootPromise;
    }
    // Сторож: если через 8 секунд склад так и не поднялся — показываем причину,
    // а не пустой экран
    window.__wcWatchdog = setTimeout(function () {
      if (document.body.classList.contains('ready')) return;
      showFatal('Игра не дошла до первого кадра за 8 секунд. Откройте консоль браузера (F12) — там будет ошибка. ' +
        'Чаще всего помогает открыть папку целиком и запустить локальный сервер: python3 -m http.server 8000');
    }, 8000);
    if (global.WC.layout) global.WC.layout.init();
    bootPromise = GE.ready()
      .then(function () { return global.WC.game.boot(); })
      .then(function () {
        global.WC.render.initStage();
        global.WC.ui.init();
        document.querySelectorAll('#speed-seg button').forEach(function (button) {
          button.classList.toggle('on', Number(button.getAttribute('data-speed')) === global.WC.game.state.speed);
        });
        global.WC.render.start();
        var status = global.WC.game.api.resumeStatus;
        document.getElementById('save-indicator').textContent = status === 'failed' ? '● сохранение защищено' : '● автосохранение';
        if (status === 'failed') global.WC.util.toast('Сохранение повреждено. Автозапись отключена, чтобы не потерять данные.', 'bad', 8000);
        else if (status === 'restored') global.WC.util.toast('Смена восстановлена', 'good', 3000);
        if (global.WC.game.state.shiftEnded && global.WC.game.api.onShiftEnd) global.WC.game.api.onShiftEnd(global.WC.game.summary());
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
        // Смена размера (поворот телефона, адресная строка) — пересчитываем камеру
        if (global.WC.layout) {
          global.WC.layout.onChange(function () {
            if (global.WC.world && global.WC.world.state && global.WC.world.state.ready) global.WC.world.resize();
          });
        }
        window.addEventListener('orientationchange', function () {
          setTimeout(function () { if (global.WC.world && global.WC.world.state.ready) global.WC.world.resize(); }, 320);
        });
        document.body.classList.add('ready');
        if (window.__wcWatchdog) { clearTimeout(window.__wcWatchdog); window.__wcWatchdog = null; }
      })
      .catch(function (err) {
        console.error('[warehouse-crew] запуск не удался:', err);
        showFatal(err && err.message ? err.message : err);
        throw err;
      });
    return bootPromise;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  global.WC.main = { boot: boot };
})(typeof window !== 'undefined' ? window : globalThis);
