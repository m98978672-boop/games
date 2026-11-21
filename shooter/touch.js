/* Тач-управление шутером (shooter/touch.js)

   Раньше игра требовала мышь с захватом курсора: на телефоне и планшете
   она не запускалась вообще — ни ходить, ни стрелять. Здесь управление
   для пальцев, и оно не трогает логику игры: стик и кнопки пишут в те же
   флаги, что клавиатура и мышь.

   Что где:
   * слева внизу — стик ходьбы (аналог W A S D);
   * справа в любом месте — свайп обзора (аналог движения мыши);
   * «ОГОНЬ» — стрельба, «ПРЫЖОК» — прыжок, «ПЕРЕЗАРЯД» — перезарядка.

   Скрипт подключается после основного и берёт у игры три вещи через
   window: __shooterKeys (флаги клавиш), __shooterLook (поворот камеры)
   и __shooterReload (перезарядка). Если игра их не выставила, скрипт
   молчит и ничего не ломает. */
(function setupTouch() {
  'use strict';

  var isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints || 0) > 0;
  if (!isTouch) return;

  var stick = document.getElementById('touch-stick');
  var knob = document.getElementById('touch-knob');
  var fire = document.getElementById('touch-fire');
  var reload = document.getElementById('touch-reload');
  var jump = document.getElementById('touch-jump');
  if (!stick || !knob || !fire || !reload || !jump) return;

  document.body.classList.add('touch');
  document.getElementById('touch-ui').setAttribute('aria-hidden', 'false');

  var stickPointer = null;
  var stickCx = 0;
  var stickCy = 0;
  var RADIUS = 48;

  function keys() {
    return window.__shooterKeys || null;
  }

  /* Стик переводим в те же флаги, что клавиатура: игра не знает, чем
     именно нажали. Мёртвая зона 0.28, чтобы дрожание пальца не вело
     персонажа. */
  function setMove(dx, dy) {
    var k = keys();
    if (!k) return;
    var nx = dx / RADIUS;
    var ny = dy / RADIUS;
    var len = Math.hypot(nx, ny);
    if (len > 1) { nx /= len; ny /= len; }
    k['KeyA'] = nx < -0.28;
    k['KeyD'] = nx > 0.28;
    k['KeyW'] = ny < -0.28;
    k['KeyS'] = ny > 0.28;
  }

  stick.addEventListener('pointerdown', function (e) {
    stickPointer = e.pointerId;
    var r = stick.getBoundingClientRect();
    stickCx = r.left + r.width / 2;
    stickCy = r.top + r.height / 2;
    if (stick.setPointerCapture) stick.setPointerCapture(e.pointerId);
    e.preventDefault();
  });

  stick.addEventListener('pointermove', function (e) {
    if (e.pointerId !== stickPointer) return;
    var dx = Math.max(-RADIUS, Math.min(RADIUS, e.clientX - stickCx));
    var dy = Math.max(-RADIUS, Math.min(RADIUS, e.clientY - stickCy));
    knob.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
    setMove(dx, dy);
    e.preventDefault();
  });

  function stickEnd(e) {
    if (e.pointerId !== stickPointer) return;
    stickPointer = null;
    knob.style.transform = '';
    setMove(0, 0);
  }
  stick.addEventListener('pointerup', stickEnd);
  stick.addEventListener('pointercancel', stickEnd);

  /* Обзор: свайп в любом месте, кроме стика и кнопок. Чувствительность
     ниже мышиной: палец проходит больший путь, чем рука на мыши. */
  var lookPointer = null;
  var lookX = 0;
  var lookY = 0;
  var LOOK_SPEED = 0.0035;

  function isControl(target) {
    return !!(target && target.closest && target.closest('#touch-stick, .touch-btn'));
  }

  document.addEventListener('pointerdown', function (e) {
    if (lookPointer !== null || isControl(e.target)) return;
    lookPointer = e.pointerId;
    lookX = e.clientX;
    lookY = e.clientY;
  }, true);

  document.addEventListener('pointermove', function (e) {
    if (e.pointerId !== lookPointer) return;
    var dx = e.clientX - lookX;
    var dy = e.clientY - lookY;
    lookX = e.clientX;
    lookY = e.clientY;
    if (typeof window.__shooterLook === 'function') {
      window.__shooterLook(dx * LOOK_SPEED, dy * LOOK_SPEED);
    }
  }, true);

  function lookEnd(e) {
    if (e.pointerId === lookPointer) lookPointer = null;
  }
  document.addEventListener('pointerup', lookEnd, true);
  document.addEventListener('pointercancel', lookEnd, true);

  /* Кнопки держат флаг, пока палец на кнопке. */
  function hold(el, code) {
    el.addEventListener('pointerdown', function (e) {
      var k = keys();
      if (k) k[code] = true;
      if (el.setPointerCapture) el.setPointerCapture(e.pointerId);
      e.preventDefault();
    });
    function release() {
      var k = keys();
      if (k) k[code] = false;
    }
    el.addEventListener('pointerup', release);
    el.addEventListener('pointercancel', release);
    el.addEventListener('pointerleave', release);
  }
  hold(fire, 'MouseDown');
  hold(jump, 'Space');

  reload.addEventListener('pointerdown', function (e) {
    if (typeof window.__shooterReload === 'function') window.__shooterReload();
    e.preventDefault();
  });

  /* Кнопка P в тач-режиме не нужна, а вот пауза нужна: двойной тап по
     верхнему краю ставит игру на паузу. */
  var lastTap = 0;
  document.addEventListener('pointerdown', function (e) {
    if (e.clientY > 70 || isControl(e.target)) return;
    var now = Date.now();
    if (now - lastTap < 320 && typeof window.__shooterPause === 'function') {
      window.__shooterPause();
    }
    lastTap = now;
  }, true);
})();
