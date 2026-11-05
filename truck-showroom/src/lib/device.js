// ============================================================
// Устройства и способы ввода.
// Одна и та же сцена должна работать на большом десктопе, на ноутбуке
// с тачпадом, на планшете и на телефоне. Здесь собрано всё, что для этого
// нужно: определение класса устройства, жесты (свайп, пинч, тап),
// тактильный отклик, адаптивное качество рендера и режим энергосбережения.
// ============================================================

/** Что умеет конкретный браузер. */
export function deviceProfile(win = window, nav = navigator) {
  const mm = (q) => {
    try { return !!win.matchMedia?.(q).matches; } catch { return false; }
  };
  const ua = (nav?.userAgent || '').toLowerCase();
  const touchPoints = nav?.maxTouchPoints || 0;
  const coarse = mm('(pointer: coarse)');
  const noHover = mm('(hover: none)');
  // Важно не полагаться на 'ontouchstart' в window: jsdom и часть
  // десктопных браузеров объявляют его просто так, из-за чего мышь
  // принималась за палец. Опираемся на реальные сигналы.
  const touch = touchPoints > 0 || coarse || noHover;
  const mobileUA = /android|iphone|ipad|ipod|mobile|windows phone|opera mini/.test(ua);
  // планшет отличаем от телефона по размеру экрана и числу точек
  // Телефон — это узкий короткий экран (390–620 px), планшет — заметно
  // шире (от 620 до 1100). Раньше условие «тач и не mobile UA» ловило
  // даже телефон 390 px и он определялся как планшет.
  const shortSide = Math.min(win.innerWidth || 1024, win.innerHeight || 768);
  const phone = touch && (shortSide <= 620 || (/iphone|android.*mobile|mobile/.test(ua) && shortSide <= 900));
  const tablet = touch && !phone && (shortSide <= 1100 || /ipad|tablet/.test(ua));
  const desktop = !touch && !phone;
  return {
    touch,
    coarse,
    noHover,
    phone,
    tablet,
    desktop,
    mobile: phone || tablet,
    standalone: mm('(display-mode: standalone)') || nav?.standalone === true,
    reducedMotion: mm('(prefers-reduced-motion: reduce)'),
    portrait: (win.innerHeight || 0) >= (win.innerWidth || 0),
    dpr: win.devicePixelRatio || 1,
    // на слабых устройствах меньше пикселей и мягче тени
    cores: nav?.hardwareConcurrency || 4,
    memory: nav?.deviceMemory || 4,
  };
}

/** Тяжёлое ли устройство: для него режем разрешение рендера. */
export function isLowPower(p = deviceProfile()) {
  return p.phone || p.cores <= 4 || p.memory <= 4;
}

/**
 * Жесты по сцене. Не отменяет OrbitControls (он сам умеет тач):
 * здесь только то, чего у орбиты нет — свайп влево/вправо для листания
 * моделей, двойной тап для салона и «щипок» для сброса зума.
 */
export function installGestures(el, handlers = {}, opts = {}) {
  const win = opts.win || (typeof window !== 'undefined' ? window : null);
  const swipeMin = opts.swipeMin ?? 46;
  const onSwipe = handlers.onSwipe;
  const onDoubleTap = handlers.onDoubleTap;
  const onPinch = handlers.onPinch;
  const onInteraction = handlers.onInteraction;

  let startX = 0;
  let startY = 0;
  let startT = 0;
  let moved = false;
  let multi = false;
  let lastTap = 0;
  let pinchStart = 0;

  const dist = (touches) => {
    const [a, b] = touches;
    return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
  };

  function onTouchStart(e) {
    if (e.touches.length === 1) {
      multi = false;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      startT = performance.now();
      moved = false;
    } else if (e.touches.length === 2) {
      multi = true;
      pinchStart = dist(e.touches);
    }
    onInteraction?.();
  }

  function onTouchMove(e) {
    if (e.touches.length !== 1 || multi) return;
    const dx = e.touches[0].clientX - startX;
    const dy = e.touches[0].clientY - startY;
    if (Math.hypot(dx, dy) > 10) moved = true;
  }

  function onTouchEnd(e) {
    if (multi) {
      if (e.touches.length === 0) multi = false;
      return;
    }
    const t = e.changedTouches?.[0];
    if (!t) return;
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;
    const dt = performance.now() - startT;
    // свайп: короткий, быстрый, почти горизонтальный
    if (onSwipe && dt < 550 && Math.abs(dx) > swipeMin && Math.abs(dx) > Math.abs(dy) * 1.6) {
      onSwipe(Math.sign(dx));
      return;
    }
    // двойной тап — в салон / обратно
    if (!moved && onDoubleTap) {
      const now = performance.now();
      if (now - lastTap < 320) {
        onDoubleTap();
        lastTap = 0;
      } else {
        lastTap = now;
      }
    }
  }

  function onTouchMovePinch(e) {
    if (e.touches.length !== 2 || !pinchStart) return;
    const d = dist(e.touches);
    if (Math.abs(d - pinchStart) > 70) {
      onPinch?.(d > pinchStart ? 'out' : 'in');
      pinchStart = d;
    }
  }

  el.addEventListener('touchstart', onTouchStart, { passive: true });
  el.addEventListener('touchmove', onTouchMove, { passive: true });
  el.addEventListener('touchmove', onTouchMovePinch, { passive: true });
  el.addEventListener('touchend', onTouchEnd, { passive: true });
  // в полноэкранном режиме iOS Safari сам масштабирует страницу щипком —
  // внутри сцены это лишнее, жест отдаём камере
  const stopGesture = (e) => { if (e.touches?.length > 1) e.preventDefault(); };
  el.addEventListener('gesturestart', (e) => e.preventDefault(), { passive: false });

  return () => {
    el.removeEventListener('touchstart', onTouchStart);
    el.removeEventListener('touchmove', onTouchMove);
    el.removeEventListener('touchmove', onTouchMovePinch);
    el.removeEventListener('touchend', onTouchEnd);
    el.removeEventListener('gesturestart', stopGesture);
    void win;
  };
}

/** Короткая вибрация-отклик на действия: только там, где она есть. */
export function haptic(pattern = 8) {
  try {
    navigator.vibrate?.(pattern);
  } catch { /* не поддерживается — молчим */ }
}

/**
 * Адаптивное качество: считаем разрешение рендера по площади экрана,
 * классу устройства и текущему FPS. Вызывается на старте, при resize
 * и при смене ориентации.
 */
export function rendererCaps(profile = deviceProfile(), fps = 60, win = window) {
  // win передаётся явно в тестах: модуль должен работать и вне браузера
  const area = (win?.innerWidth || 1280) * (win?.innerHeight || 720);
  const low = isLowPower(profile);
  let pixelRatio = Math.min(profile.dpr || 1, low ? 1.35 : 2);
  // очень большой монитор + дискретная карта: не гонимся за 4К
  if (area > 2.6e6) pixelRatio = Math.min(pixelRatio, 1.6);
  // уронили FPS ниже 40 — сразу опускаем разрешение
  if (fps < 40) pixelRatio = Math.min(pixelRatio, 1);
  // площадь сама по себе не приговор: 2К-монитор на мощной машине тянет
  // и мягкие тени; режем их только у слабых или очень больших экранов
  const strong = !low && (profile.cores ?? 4) >= 8 && (profile.memory ?? 4) >= 8;
  return {
    pixelRatio,
    shadows: !low && (strong || area < 3.4e6),
    antialias: !low,
    powerPreference: low ? 'default' : 'high-performance',
  };
}

/** Встряхивание телефона — случайная модель (по желанию пользователя). */
export function installShake(handler, opts = {}) {
  if (!('DeviceMotionEvent' in window)) return () => {};
  const threshold = opts.threshold ?? 22;
  let last = 0;
  const onMotion = (e) => {
    const a = e.accelerationIncludingGravity;
    if (!a) return;
    const magnitude = Math.hypot(a.x || 0, a.y || 0, a.z || 0);
    if (magnitude > threshold && performance.now() - last > 1200) {
      last = performance.now();
      handler();
    }
  };
  window.addEventListener('devicemotion', onMotion);
  return () => window.removeEventListener('devicemotion', onMotion);
}

/** Плавная ориентация: помогаем вёрстке на смене portrait/landscape. */
export function watchOrientation(cb) {
  const read = () => cb(deviceProfile());
  window.addEventListener('resize', read);
  window.addEventListener('orientationchange', () => setTimeout(read, 120));
  try { window.matchMedia?.('(orientation: portrait)')?.addEventListener?.('change', read); } catch { /* старые браузеры */ }
  return read;
}
