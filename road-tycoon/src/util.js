/* Утилиты: математика, формат, генератор случайных чисел, геометрия дорог. */
(function () {
  const TR = (window.TR = window.TR || {});
  const U = (TR.Util = {});

  U.clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  U.lerp = (a, b, t) => a + (b - a) * t;
  U.dist = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);
  U.toRad = (deg) => (deg * Math.PI) / 180;

  U.money = function (n) {
    const v = Math.round(n);
    const sign = v < 0 ? '−' : '';
    return sign + Math.abs(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₽';
  };
  U.num = function (n) {
    return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };
  U.compact = function (n) {
    const abs = Math.abs(n);
    if (abs >= 1000000) return (n / 1000000).toFixed(abs >= 10000000 ? 0 : 1).replace('.', ',') + ' млн';
    if (abs >= 10000) return Math.round(n / 1000) + ' тыс.';
    return U.num(n);
  };
  U.km = (n) => (n < 10 ? n.toFixed(1) : Math.round(n)) + ' км';
  U.plural = function (n, one, few, many) {
    const a = Math.abs(n) % 100, b = a % 10;
    if (a > 10 && a < 20) return many;
    if (b > 1 && b < 5) return few;
    if (b === 1) return one;
    return many;
  };

  /* Детерминированный ГПСЧ */
  U.mulberry32 = function (seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  U.hashInt = function (n) {
    let x = Math.imul((n | 0) ^ 0x9e3779b9, 0x85ebca6b);
    x = (x ^ (x >>> 13)) >>> 0;
    return x / 4294967296;
  };

  /* Гладкий 2D-шум для рельефа */
  U.makeNoise = function (seed) {
    const perm = new Uint8Array(512);
    const rand = U.mulberry32(seed);
    const p = [];
    for (let i = 0; i < 256; i++) p[i] = i;
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      const t = p[i]; p[i] = p[j]; p[j] = t;
    }
    for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
    const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
    const grad = (h, x, y) => {
      const g = h & 7;
      const u = g < 4 ? x : y;
      const v = g < 4 ? y : x;
      return ((g & 1) ? -u : u) + ((g & 2) ? -2 * v : 2 * v);
    };
    return function (x, y) {
      const xi = Math.floor(x) & 255, yi = Math.floor(y) & 255;
      const xf = x - Math.floor(x), yf = y - Math.floor(y);
      const u = fade(xf), v = fade(yf);
      const aa = perm[perm[xi] + yi], ab = perm[perm[xi] + yi + 1];
      const ba = perm[perm[xi + 1] + yi], bb = perm[perm[xi + 1] + yi + 1];
      const x1 = U.lerp(grad(aa, xf, yf), grad(ba, xf - 1, yf), u);
      const x2 = U.lerp(grad(ab, xf, yf - 1), grad(bb, xf - 1, yf - 1), u);
      return U.lerp(x1, x2, v);
    };
  };

  /* Геометрия дороги: квадратичная кривая, смещённая от прямой */
  const curveCache = new Map();
  U.curve = function (road) {
    const key = road.id + ':' + road.a + ':' + road.b + ':' + road.totalKm;
    if (curveCache.has(key)) return curveCache.get(key);
    const A = TR.CONFIG.cities[road.a], B = TR.CONFIG.cities[road.b];
    const dx = B.x - A.x, dy = B.y - A.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len, ny = dx / len;
    const h = U.hashInt((road.id + 1) * 977 + road.a * 31 + road.b * 17);
    const bend = (h - 0.5) * 0.24 * len;
    const m = { x: (A.x + B.x) / 2 + nx * bend, y: (A.y + B.y) / 2 + ny * bend };
    const res = { ax: A.x, ay: A.y, cx: m.x, cy: m.y, bx: B.x, by: B.y };
    curveCache.set(key, res);
    return res;
  };
  U.clearCurveCache = () => curveCache.clear();

  U.curvePoint = function (c, t) {
    const it = 1 - t;
    return {
      x: it * it * c.ax + 2 * it * t * c.cx + t * t * c.bx,
      y: it * it * c.ay + 2 * it * t * c.cy + t * t * c.by,
    };
  };
  U.curveAngle = function (c, t) {
    const dx = 2 * (1 - t) * (c.cx - c.ax) + 2 * t * (c.bx - c.cx);
    const dy = 2 * (1 - t) * (c.cy - c.ay) + 2 * t * (c.by - c.cy);
    return Math.atan2(dy, dx);
  };

  /* Ближайшая точка на дороге: возвращает t, расстояние и сторону */
  U.roadProjection = function (road, x, y) {
    const c = U.curve(road);
    let best = { t: 0, d: Infinity };
    const steps = 40;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const p = U.curvePoint(c, t);
      const d = (p.x - x) * (p.x - x) + (p.y - y) * (p.y - y);
      if (d < best.d) best = { t, d, p };
    }
    // уточнение
    let lo = Math.max(0, best.t - 1 / steps), hi = Math.min(1, best.t + 1 / steps);
    for (let k = 0; k < 14; k++) {
      const m1 = lo + (hi - lo) / 3, m2 = hi - (hi - lo) / 3;
      const p1 = U.curvePoint(c, m1), p2 = U.curvePoint(c, m2);
      const d1 = (p1.x - x) * (p1.x - x) + (p1.y - y) * (p1.y - y);
      const d2 = (p2.x - x) * (p2.x - x) + (p2.y - y) * (p2.y - y);
      if (d1 < d2) hi = m2; else lo = m1;
    }
    const t = (lo + hi) / 2;
    const p = U.curvePoint(c, t);
    const ang = U.curveAngle(c, t);
    const cross = Math.cos(ang) * (y - p.y) - Math.sin(ang) * (x - p.x);
    return { t, dist: U.dist(p.x, p.y, x, y), point: p, angle: ang, side: cross > 0 ? 1 : -1 };
  };

  U.timeHours = function (timeDays) {
    const f = timeDays - Math.floor(timeDays);
    return f * 24;
  };
  U.clock = function (timeDays) {
    const h = U.timeHours(timeDays);
    const hh = Math.floor(h);
    const mm = Math.floor((h - hh) * 60);
    return String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0');
  };
  U.dayNumber = (timeDays) => Math.floor(timeDays) + 1;

  U.isNight = function (timeDays) {
    const h = U.timeHours(timeDays);
    return h < 6 || h >= 21;
  };

  U.shade = function (hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    r = U.clamp(Math.round(r + amt), 0, 255);
    g = U.clamp(Math.round(g + amt), 0, 255);
    b = U.clamp(Math.round(b + amt), 0, 255);
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  };

  U.roundRect = function (ctx, x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  };

  /* Склонение названий объектов */
  U.facilityTitle = function (typeKey) {
    const f = TR.CONFIG.facilityByKey[typeKey];
    return f ? f.name : typeKey;
  };
})();
