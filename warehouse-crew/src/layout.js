// Автомасштаб и адаптив. Один источник правды о размерах экрана:
// телефон / планшет / десктоп, ориентация, безопасные отступы, --ui.
// Размеры HUD считаются от --ui: он адаптируется и на ПК, и на телефоне.
window.WC = window.WC || {};

WC.layout = (function () {
  'use strict';

  var state = {
    w: 390,
    h: 780,
    ui: 1,
    device: 'desktop',
    orient: 'portrait',
    touch: false,
    dpr: 1,
    safeBottom: 0,
  };

  var listeners = [];

  function mq(query) {
    if (typeof window.matchMedia !== 'function') return false;
    try { return window.matchMedia(query).matches; } catch (e) { return false; }
  }

  function viewport() {
    var vv = window.visualViewport;
    var w = vv && vv.width ? vv.width : window.innerWidth;
    var h = vv && vv.height ? vv.height : window.innerHeight;
    return { w: Math.max(240, Math.round(w)), h: Math.max(280, Math.round(h)) };
  }

  // Выбор раскладки совпадает с CSS media queries. Маленькое окно ПК не
  // становится телефоном только из-за высоты; узкое окно использует шторку.
  function classify(w, h, coarse) {
    var compact = w <= 900 || w / h <= 0.75 || (w <= 1180 && coarse) ||
      (h <= 560 && w > h && w <= 1000);
    if (!compact) return 'desktop';
    return Math.min(w, h) <= 520 ? 'phone' : 'tablet';
  }

  // Размеры в CSS-пикселях (включая масштаб браузера), не физические пиксели.
  // На больших мониторах элементы становятся крупнее; на низком/узком окне
  // не разрастаются. Границы защищают от экстремальных размеров и zoom.
  function scaleFor(device, w, h) {
    var short = Math.min(w, h);
    var long = Math.max(w, h);
    var raw;
    if (device === 'phone') raw = Math.min(short / 390, long / 800);
    else if (device === 'tablet') raw = Math.min(short / 720, long / 1000);
    else raw = 1 + 0.5 * (Math.min(w / 1440, h / 900) - 1);
    var lo = device === 'phone' ? 0.84 : device === 'tablet' ? 0.9 : 0.85;
    var hi = device === 'phone' ? 1.18 : device === 'tablet' ? 1.12 : 1.35;
    return Math.round(Math.max(lo, Math.min(hi, raw)) * 1000) / 1000;
  }

  function apply() {
    var vp = viewport();
    state.w = vp.w;
    state.h = vp.h;
    state.touch = mq('(pointer: coarse)') || 'ontouchstart' in window || (window.navigator && window.navigator.maxTouchPoints > 0);
    // CSS media queries относятся к layout viewport, а не к visualViewport
    // (при pinch zoom последний может стать меньше без смены раскладки).
    state.device = classify(window.innerWidth || vp.w, window.innerHeight || vp.h, mq('(pointer: coarse)'));
    state.orient = vp.w >= vp.h ? 'landscape' : 'portrait';
    state.ui = scaleFor(state.device, vp.w, vp.h);
    state.dpr = Math.min(window.devicePixelRatio || 1, state.device === 'phone' ? 2 : 2.5);

    var root = document.documentElement;
    root.style.setProperty('--ui', String(state.ui));
    root.style.setProperty('--app-w', vp.w + 'px');
    root.style.setProperty('--app-h', vp.h + 'px');
    root.setAttribute('data-device', state.device);
    root.setAttribute('data-orient', state.orient);
    root.setAttribute('data-touch', state.touch ? 'on' : 'off');
    document.body.classList.toggle('is-touch', state.touch);
    document.body.classList.toggle('is-phone', state.device === 'phone');
    document.body.classList.toggle('is-tablet', state.device === 'tablet');
    document.body.classList.toggle('is-landscape', state.orient === 'landscape');

    listeners.forEach(function (fn) {
      try { fn(state); } catch (err) { /* слушатель не должен ломать раскладку */ }
    });
    return state;
  }

  var scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    var run = function () { scheduled = false; apply(); };
    if (window.requestAnimationFrame) window.requestAnimationFrame(run);
    else setTimeout(run, 16);
  }

  var inited = false;
  function init() {
    if (inited) return apply();
    inited = true;
    apply();
    window.addEventListener('resize', schedule);
    window.addEventListener('orientationchange', function () { setTimeout(schedule, 260); });
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', schedule);
      window.visualViewport.addEventListener('scroll', schedule);
    }
    if (typeof window.matchMedia === 'function') {
      try {
        var q = window.matchMedia('(pointer: coarse)');
        if (q.addEventListener) q.addEventListener('change', schedule);
      } catch (e) { /* старый браузер — хватит resize */ }
    }
    return state;
  }

  function onChange(fn) {
    if (typeof fn === 'function') listeners.push(fn);
    return function () {
      var i = listeners.indexOf(fn);
      if (i >= 0) listeners.splice(i, 1);
    };
  }

  // Высоты нижней шторки пульта (px). Читаются из CSS-переменных, чтобы
  // правки темы не разъезжались с логикой.
  function sheetHeights() {
    var h = state.h;
    var peek = Math.round(94 * state.ui + state.safeBottom);
    return {
      peek: peek,
      half: Math.round(Math.min(h * 0.56, 520)),
      full: Math.round(h - Math.max(56, 62 * state.ui) - 8),
    };
  }

  return {
    init: init,
    refresh: apply,
    onChange: onChange,
    sheetHeights: sheetHeights,
    get state() { return state; },
  };
})();
