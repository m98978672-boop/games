/* Мир: генерация рельефа (леса, поля, реки, холмы) и стоимость прокладки. */
(function () {
  const TR = (window.TR = window.TR || {});
  const U = TR.Util;
  const C = TR.CONFIG;
  const W = (TR.World = {});

  const RIVERS = [
    [[-3, 78], [14, 73], [29, 71], [42.5, 76], [56, 70], [74, 74], [103, 66]],
    [[37.5, -4], [35, 16], [33, 30], [38, 44], [36, 60], [41, 72], [44, 84], [47.5, 104]],
    [[103, 20], [90, 24], [80, 30], [72, 44], [76, 58], [74, 74]],
  ];

  const LAKES = [
    { x: 72, y: 16, rx: 6.4, ry: 5.5, rot: -0.3 },
    { x: 16, y: 90, rx: 5.2, ry: 4.2, rot: 0.2 },
    { x: 52, y: 46, rx: 3.6, ry: 3.2, rot: 0.5 },
  ];

  function distToPolyline(px, py, pts) {
    let best = Infinity;
    for (let i = 0; i < pts.length - 1; i++) {
      const ax = pts[i][0], ay = pts[i][1], bx = pts[i + 1][0], by = pts[i + 1][1];
      const dx = bx - ax, dy = by - ay;
      const l2 = dx * dx + dy * dy || 1;
      let t = ((px - ax) * dx + (py - ay) * dy) / l2;
      t = U.clamp(t, 0, 1);
      const d = U.dist(px, py, ax + dx * t, ay + dy * t);
      if (d < best) best = d;
    }
    return best;
  }

  W.build = function (seed) {
    const rand = U.mulberry32(seed * 7919 + 13);
    const world = {
      seed,
      rivers: RIVERS.map((pts) => pts.map((p) => ({ x: p[0], y: p[1] }))),
      lakes: LAKES.map((l) => Object.assign({}, l)),
      forests: [],
      fields: [],
      hills: [],
      noise: U.makeNoise(seed),
    };

    // леса
    let guard = 0;
    while (world.forests.length < 54 && guard++ < 900) {
      const x = 4 + rand() * (C.worldW - 8);
      const y = 4 + rand() * (C.worldH - 8);
      if (C.cities.some((c) => U.dist(c.x, c.y, x, y) < 13)) continue;
      if (world.lakes.some((l) => Math.hypot((x - l.x) / l.rx, (y - l.y) / l.ry) < 1.9)) continue;
      const r = 3.4 + rand() * 5.4;
      world.forests.push({ x, y, r, seed: Math.floor(rand() * 1e6), type: rand() < 0.25 ? 'pine' : 'mixed' });
    }

    // поля
    guard = 0;
    while (world.fields.length < 24 && guard++ < 500) {
      const x = 8 + rand() * (C.worldW - 16);
      const y = 8 + rand() * (C.worldH - 16);
      if (C.cities.some((c) => U.dist(c.x, c.y, x, y) < 12)) continue;
      if (world.forests.some((f) => U.dist(f.x, f.y, x, y) < f.r + 5)) continue;
      world.fields.push({
        x, y, w: 7 + rand() * 12, h: 5 + rand() * 8,
        rot: rand() * Math.PI, kind: Math.floor(rand() * 3),
        seed: Math.floor(rand() * 1e6),
      });
    }

    // холмы
    guard = 0;
    while (world.hills.length < 11 && guard++ < 300) {
      const x = rand() * C.worldW;
      const y = rand() * C.worldH;
      if (C.cities.some((c) => U.dist(c.x, c.y, x, y) < 10)) continue;
      world.hills.push({ x, y, r: 6 + rand() * 9, h: 0.4 + rand() * 0.6 });
    }
    return world;
  };

  W.riverDist = function (world, x, y) {
    let d = Infinity;
    for (const r of world.rivers) d = Math.min(d, distToPolyline(x, y, r.map((p) => [p.x, p.y])));
    return d;
  };

  W.lakeFactor = function (world, x, y) {
    let f = 0;
    for (const l of world.lakes) {
      const dx = (x - l.x) / l.rx, dy = (y - l.y) / l.ry;
      const rr = Math.hypot(dx, dy);
      if (rr < 1.7) f = Math.max(f, 1 - rr / 1.7);
    }
    return f;
  };

  /* Во сколько раз дороже прокладывать дорогу в этой точке */
  W.terrainFactor = function (world, x, y) {
    let f = 1;
    for (const forest of world.forests) {
      const d = U.dist(forest.x, forest.y, x, y);
      if (d < forest.r) f += 0.14 * (1 - d / forest.r);
    }
    for (const hill of world.hills) {
      const d = U.dist(hill.x, hill.y, x, y);
      if (d < hill.r) f += 0.34 * hill.h * (1 - d / hill.r);
    }
    const rd = W.riverDist(world, x, y);
    if (rd < 3.2) f += 0.62 * (1 - rd / 3.2);
    const lf = W.lakeFactor(world, x, y);
    if (lf > 0) f += 0.9 * lf;
    return U.clamp(f, 1, 1.9);
  };

  /* Средний коэффициент сложности для участка (для расчёта стоимости) */
  W.roadFactor = function (world, a, b) {
    const A = C.cities[a], B = C.cities[b];
    const steps = 26;
    let sum = 0;
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      sum += W.terrainFactor(world, U.lerp(A.x, B.x, t), U.lerp(A.y, B.y, t));
    }
    return sum / (steps - 1);
  };

  W.terrainLabel = function (f) {
    if (f >= 1.55) return 'сложный рельеф';
    if (f >= 1.28) return 'пересечённая местность';
    if (f >= 1.1) return 'лес/поле';
    return 'ровная местность';
  };

  W.biome = function (world, x, y) {
    if (W.riverDist(world, x, y) < 1.5) return 'river';
    if (W.lakeFactor(world, x, y) > 0.55) return 'lake';
    if (world.forests.some((f) => U.dist(f.x, f.y, x, y) < f.r * 0.85)) return 'forest';
    if (world.fields.some((f) => Math.hypot((x - f.x) / f.w, (y - f.y) / f.h) < 0.8)) return 'field';
    if (world.hills.some((h) => U.dist(h.x, h.y, x, y) < h.r * 0.7)) return 'hill';
    return 'meadow';
  };
})();
