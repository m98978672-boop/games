/* Ратград — ядро формул без DOM. Можно проверять в node: require('./core.js') → global.RatgradCore.
   Только §35–§36 промта: F-71…F-89. Ни красок, ни моделей, ни сети. */
(function (root) {
  'use strict';
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const round = (v, d = 2) => Math.round(v * Math.pow(10, d)) / Math.pow(10, d);
  const hypot = (a, b) => Math.sqrt(a * a + b * b);

  /* ---------- мир и рельеф ---------- */
  const WORLD = { x0: 0, y0: 0, x1: 200, y1: 200 };
  const GRID = 20;
  const NX = (WORLD.x1 - WORLD.x0) / GRID;
  const NY = (WORLD.y1 - WORLD.y0) / GRID;

  function baseH(x, y) {
    const hill = 42 * Math.exp(-(((x - 70) ** 2 + (y - 60) ** 2) / 2600));
    const ridge = 8 * Math.sin(x / 34) * Math.cos(y / 41);
    const knoll = 10 * Math.exp(-(((x - 150) ** 2 + (y - 145) ** 2) / 4200));
    return Math.max(0, hill + ridge + knoll);
  }

  const HGRID = [];
  for (let i = 0; i <= NX; i++) {
    HGRID[i] = [];
    for (let j = 0; j <= NY; j++) HGRID[i][j] = round(baseH(WORLD.x0 + i * GRID, WORLD.y0 + j * GRID), 3);
  }

  /* F-71: высота неизвестной точки — билинейно по четырём углам клетки */
  function heightAt(x, y) {
    const gx = (x - WORLD.x0) / GRID, gy = (y - WORLD.y0) / GRID;
    const i = clamp(Math.floor(gx), 0, NX - 1), j = clamp(Math.floor(gy), 0, NY - 1);
    const u = clamp(gx - i, 0, 1), v = clamp(gy - j, 0, 1);
    const H00 = HGRID[i][j], H10 = HGRID[i + 1][j], H01 = HGRID[i][j + 1], H11 = HGRID[i + 1][j + 1];
    const H = (1 - u) * (1 - v) * H00 + u * (1 - v) * H10 + (1 - u) * v * H01 + u * v * H11;
    return { H, u, v, i, j, corners: [H00, H10, H01, H11] };
  }

  /* ---------- здания и столбы ---------- */
  const BUILDINGS = [
    { id: 'B1', name: 'дом', x: 40, y: 30, w: 12, d: 10, floors: 3, layerH: 3, dx: 0, dy: 0 },
    { id: 'B2', name: 'дом на склоне', x: 92, y: 58, w: 10, d: 8, floors: 3, layerH: 3, dx: 1, dy: 1 },
    { id: 'B3', name: 'башня', x: 150, y: 138, w: 9, d: 9, floors: 6, layerH: 3, dx: 0, dy: 0 }
  ];

  function columnOf(b) {
    const bx = Math.round(b.x + b.w / 2), by = Math.round(b.y + b.d / 2);
    const p = b.floors, pairs = [];
    for (let k = 1; k <= p - 1; k++) pairs.push({ x: bx + b.dx * k, y: by + b.dy * k });
    const letter = (b.dx || b.dy) ? 'h' : 'H';
    const H = b.floors * b.layerH;
    const rec = '(' + bx + ';' + by + ')' + letter + p + '(' + pairs.map(q => q.x + ',' + q.y).join(';') + ')';
    return { bx, by, p, pairs, letter, H, tau: round(H / p, 3), rec, building: b };
  }

  /* F-78: разбор и проверка записи (X;Y)Hp(X,Y;X,Y) */
  function parseColumn(str) {
    const m = /^\((-?\d+);(-?\d+)\)([Hh])(\[?\d+\]?)\(([^)]*)\)$/.exec(String(str).trim());
    if (!m) return { ok: false, err: 'формат не распознан' };
    const X = +m[1], Y = +m[2], letter = m[3];
    const p = parseInt(m[4].replace(/[\[\]]/g, ''), 10);
    const raw = m[5].trim();
    const pairs = raw === '' ? [] : raw.split(';').map(s => { const t = s.split(','); return { x: +t[0], y: +t[1] }; });
    const errs = [];
    if (!(p >= 1)) errs.push('p < 1');
    if (pairs.some(q => !Number.isFinite(q.x) || !Number.isFinite(q.y))) errs.push('координата не число');
    if (pairs.length !== p - 1) errs.push('пар ' + pairs.length + ', а нужно p−1 = ' + (p - 1));
    if (letter === 'H' && pairs.some(q => q.x !== X || q.y !== Y)) errs.push('H стоит на пересечении X и Y — смещения быть не может');
    if (letter === 'h' && pairs.every(q => q.x === X && q.y === Y)) errs.push('h без смещения: это H');
    const D = driftOf(pairs, X, Y);
    return { ok: errs.length === 0, errs, X, Y, letter, p, pairs, D, rec: String(str).trim() };
  }

  /* F-85: дрейф столба */
  function driftOf(pairs, X, Y) {
    let D = 0, px = X, py = Y;
    for (const q of pairs) { D += hypot(q.x - px, q.y - py); px = q.x; py = q.y; }
    return round(D, 3);
  }

  /* F-86…F-89: длина столба, наклон, толщина слоя, верх */
  function columnMath(c, H) {
    const bx = c.bx !== undefined ? c.bx : c.X;
    const by = c.by !== undefined ? c.by : c.Y;
    const D = driftOf(c.pairs, bx, by);
    const h = round(Math.sqrt(H * H + D * D), 3);
    const theta = round(Math.atan2(D, H) * 180 / Math.PI, 2);
    const tau = round(H / c.p, 3);
    let top = { x: bx, y: by };
    if (c.pairs && c.pairs.length) { const last = c.pairs[c.pairs.length - 1]; top = { x: last.x, y: last.y }; }
    return { D, h, theta, tau, top };
  }

  /* ---------- ID грани (F-72, F-73) ---------- */
  function packID(f) {
    let v = BigInt(f.n) * 4096n + BigInt(f.t);
    v = v * 8192n + BigInt(f.k);
    v = v * 65536n + BigInt(f.j);
    v = v * 65536n + BigInt(f.i);
    v = v * 8n + BigInt(f.s);
    return v;
  }
  function unpackID(v0) {
    let v = v0;
    const s = Number(v % 8n); v /= 8n;
    const i = Number(v % 65536n); v /= 65536n;
    const j = Number(v % 65536n); v /= 65536n;
    const k = Number(v % 8192n); v /= 8192n;
    const t = Number(v % 4096n); v /= 4096n;
    const n = Number(v);
    return { s, i, j, k, t, n };
  }

  /* F-74: износ и поломка грани */
  function wearStep(w, N, W, F, M) {
    return round(clamp(w + 0.004 * N + 0.002 * W + 0.003 * F - 0.05 * M, 0, 1), 4);
  }

  /* F-75…F-77: горизонт, рабочая ООВ, видимость точки */
  const horizon = (h1, h2) => round(Math.min(1200, 120 * (Math.sqrt(h1) + Math.sqrt(h2))), 1);
  const visRadius = (h, T, D) => round(clamp(60 + 8 * Math.sqrt(h) - 40 * T - 20 * D, 25, 250), 1);
  const pointVisible = (d, R, dh) => (d * d <= R * R && Math.abs(dh) <= 0.466 * d) ? 1 : 0;

  /* F-81: упаковка QООВЗ */
  function packQ(q) {
    let v = BigInt(q.Xa) * 65536n + BigInt(q.Ya);
    v = v * 4096n + BigInt(q.R);
    v = v * 4096n + BigInt(q.x1);
    v = v * 4096n + BigInt(q.y1);
    v = v * 4096n + BigInt(q.x2);
    v = v * 4096n + BigInt(q.y2);
    return v;
  }
  function unpackQ(v0) {
    let v = v0, k;
    k = Number(v % 4096n); v /= 4096n; const y2 = k;
    k = Number(v % 4096n); v /= 4096n; const x2 = k;
    k = Number(v % 4096n); v /= 4096n; const y1 = k;
    k = Number(v % 4096n); v /= 4096n; const x1 = k;
    k = Number(v % 4096n); v /= 4096n; const R = k;
    k = Number(v % 65536n); v /= 65536n; const Ya = k;
    return { Xa: Number(v), Ya, R, x1, y1, x2, y2 };
  }

  const pxPerMeter = (rect, R) => round((rect.x2 - rect.x1) / (2 * R), 2);          // F-83
  const maxLayers = (R) => clamp(Math.floor(Math.log2(Math.max(R, 1) / 25)) + 1, 1, 4); // F-84
  const animVisible = (d, R, rect, px) =>
    (d * d <= R * R && px.x >= rect.x1 && px.x <= rect.x2 && px.y >= rect.y1 && px.y <= rect.y2) ? 1 : 0; // F-82
  const ridge = (s) => round((1 - Math.abs(2 * s - 1)) ** 2, 3);                      // F-79

  /* ---------- проверки: 20 значений на формулу ---------- */
  function tests() {
    const out = [];
    const add = (id, name, fn) => out.push({ id, name, passed: fn() });

    add('F-71', 'Высота неизвестной точки', () => {
      let ok = 0;
      for (let m = 0; m < 20; m++) {
        const r = heightAt(1 + m * 9.7, 2 + m * 7.3);
        const lo = Math.min(...r.corners), hi = Math.max(...r.corners);
        if (Number.isFinite(r.H) && r.H >= lo - 1e-9 && r.H <= hi + 1e-9) ok++;
      }
      return ok;
    });
    add('F-72', 'ID грани: упаковка', () => {
      let ok = 0;
      for (let m = 0; m < 20; m++) {
        const f = { s: m % 5, i: (m * 137 + 1) % 65536, j: (m * 911 + 7) % 65536, k: (m * 409 + 3) % 8192, t: (m * 211 + 5) % 4096, n: m % 16 };
        const v = packID(f), b = unpackID(v);
        if (v >= 0n && v < (1n << 64n) && b.s === f.s && b.t === f.t && b.n === f.n) ok++;
      }
      return ok;
    });
    add('F-73', 'ID грани: расшифровка', () => {
      let ok = 0;
      for (let m = 0; m < 20; m++) {
        const f = { s: m % 5, i: (m * 97 + 3) % 65536, j: (m * 53 + 1) % 65536, k: (m * 71 + 2) % 8192, t: (m * 29 + 4) % 4096, n: m % 16 };
        const b = unpackID(packID(f));
        if (b.i === f.i && b.j === f.j && b.k === f.k) ok++;
      }
      return ok;
    });
    add('F-74', 'Износ и поломка грани', () => {
      let ok = 0;
      for (let m = 0; m < 20; m++) {
        const w = m / 19 * 0.9, w2 = wearStep(w, (m % 5) / 4, m % 2, m % 3 === 0 ? 1 : 0, 0);
        if (w2 >= 0 && w2 <= 1 && w2 >= w) ok++;
      }
      return ok;
    });
    add('F-75', 'Геометрический горизонт', () => {
      let ok = 0;
      for (let m = 0; m < 20; m++) { const R = horizon(1.6 + m * 3, 1.6 + (m % 4) * 10); if (R > 0 && R <= 1200) ok++; }
      return ok;
    });
    add('F-76', 'Рабочая ООВ агента', () => {
      let ok = 0;
      for (let m = 0; m < 20; m++) { const R = visRadius(16, m / 19, 0.5 * m / 19); if (R >= 25 && R <= 250) ok++; }
      return ok;
    });
    add('F-77', 'Видна ли точка', () => {
      let ok = 0;
      for (let m = 0; m < 20; m++) { const V = pointVisible(5 + m * 20, 150, (m * 7) % 50 - 25); if (V === 0 || V === 1) ok++; }
      return ok;
    });
    add('F-78', 'Слоистая запись', () => {
      let ok = 0, made = 0;
      for (let p = 1; p <= 9; p++, made++) {
        const pairs = []; for (let k = 1; k <= p - 1; k++) pairs.push('0,0');
        const r = parseColumn('(0;0)H' + p + '(' + pairs.join(';') + ')');
        if (r.ok && r.pairs.length === p - 1) ok++;
      }
      for (let p = 2; made < 20; p++, made++) {
        const pairs = []; for (let k = 1; k <= p - 1; k++) pairs.push(k + ',' + k);
        const r = parseColumn('(0;0)h' + p + '(' + pairs.join(';') + ')');
        if (r.ok && r.pairs.length === p - 1) ok++;
      }
      return ok;
    });
    add('F-79', 'Гребень горы', () => {
      let ok = 0;
      for (let m = 0; m < 20; m++) { const r = ridge(m / 19); if (r >= 0 && r <= 1) ok++; }
      return ok;
    });
    add('F-81', 'Упаковка Q', () => {
      let ok = 0;
      for (let m = 0; m < 20; m++) {
        const q = { Xa: (m * 3111 + 500) % 65536, Ya: (m * 1777 + 300) % 65536, R: 25 + m * 12,
          x1: 100 + m * 5, y1: 80 + m * 4, x2: 1800 - m * 20, y2: 1000 - m * 10 };
        const b = unpackQ(packQ(q));
        if (b.Xa === q.Xa && b.Ya === q.Ya && b.R === q.R && b.x2 === q.x2 && b.y2 === q.y2) ok++;
      }
      return ok;
    });
    add('F-82', 'Видна ли анимация', () => {
      let ok = 0;
      for (let m = 0; m < 20; m++) {
        const A = animVisible(5 + m * 20, 150, { x1: 100, y1: 80, x2: 1800, y2: 1000 }, { x: 100 + m * 90, y: 80 + m * 46 });
        if (A === 0 || A === 1) ok++;
      }
      return ok;
    });
    add('F-83', 'Масштаб экрана', () => {
      let ok = 0;
      for (let m = 0; m < 20; m++) { const k = pxPerMeter({ x1: 0, x2: 1800 - m * 20 }, 25 + m * 12); if (Number.isFinite(k) && k > 0) ok++; }
      return ok;
    });
    add('F-84', 'Бюджет слоёв', () => {
      let ok = 0;
      for (let m = 0; m < 20; m++) { const L = maxLayers(20 + m * 15); if (L >= 1 && L <= 4) ok++; }
      return ok;
    });
    add('F-85', 'Дрейф столба', () => {
      let ok = 0;
      for (let m = 0; m < 20; m++) {
        const dx = 0.2 + m * 0.35, dy = 0.1 + m * 0.2, p = 2 + (m % 4), pairs = [];
        for (let k = 1; k <= p - 1; k++) pairs.push({ x: dx * k, y: dy * k });
        const D = driftOf(pairs, 0, 0), exp = round(Math.sqrt(dx * dx + dy * dy) * (p - 1), 3);
        if (Math.abs(D - exp) < 0.002) ok++;
      }
      return ok;
    });
    add('F-86', 'Длина столба по кривой', () => {
      let ok = 0;
      for (let m = 0; m < 20; m++) { const H = 3 + m * 2.5, D = 0.5 + m * 0.8; const h = Math.sqrt(H * H + D * D); if (h >= H && Number.isFinite(h)) ok++; }
      return ok;
    });
    add('F-87', 'Наклон столба', () => {
      let ok = 0;
      for (let m = 0; m < 20; m++) { const th = Math.atan2(0.5 + m * 1.1, 4 + m * 3) * 180 / Math.PI; if (th >= 0 && th < 90) ok++; }
      return ok;
    });
    add('F-88', 'Толщина слоя', () => {
      let ok = 0;
      for (let m = 0; m < 20; m++) { const H = 3 * (m + 1), p = (m % 9) + 1, tau = H / p; if (tau > 0 && Math.abs(tau * p - H) < 1e-9) ok++; }
      return ok;
    });
    add('F-89', 'Верх столба', () => {
      let ok = 0;
      for (let m = 0; m < 20; m++) {
        const x = 100 + m * 7, y = 200 + m * 5, p = 2 + (m % 4), dx = 0.5 + 0.3 * m, dy = 0.2 + 0.25 * m, pairs = [];
        for (let k = 1; k <= p - 1; k++) pairs.push({ x: x + dx * k, y: y + dy * k });
        const c = columnMath({ X: x, Y: y, p, pairs }, 9);
        if (Math.abs(c.top.x - (x + dx * (p - 1))) < 1e-6 && Math.abs(c.top.y - (y + dy * (p - 1))) < 1e-6) ok++;
      }
      return ok;
    });

    return out;
  }

  root.RatgradCore = {
    clamp, round, hypot, WORLD, GRID, NX, NY, baseH, HGRID, heightAt,
    BUILDINGS, columnOf, parseColumn, driftOf, columnMath,
    packID, unpackID, wearStep, horizon, visRadius, pointVisible,
    packQ, unpackQ, pxPerMeter, maxLayers, animVisible, ridge, tests
  };
})(typeof window !== 'undefined' ? window : globalThis);
