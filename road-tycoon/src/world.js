/* Мир: генерация рельефа (леса, поля, реки, холмы) и стоимость прокладки. */
(function () {
  const TR = (window.TR = window.TR || {});
  const U = TR.Util;
  const C = TR.CONFIG;
  const W = (TR.World = {});

  const RIVERS = [
    [[-30, 780], [140, 730], [290, 710], [425, 760], [560, 700], [740, 740], [1030, 660]],
    [[375, -40], [350, 160], [330, 300], [380, 440], [360, 600], [410, 720], [440, 840], [475, 1040]],
    [[1030, 200], [900, 240], [800, 300], [720, 440], [760, 580], [740, 740]],
  ];

  const LAKES = [
    { x: 720, y: 160, rx: 64, ry: 55, rot: -0.3 },
    { x: 160, y: 900, rx: 52, ry: 42, rot: 0.2 },
    { x: 520, y: 460, rx: 36, ry: 32, rot: 0.5 },
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
    while (world.forests.length < 120 && guard++ < 2400) {
      const x = 4 + rand() * (C.worldW - 8);
      const y = 4 + rand() * (C.worldH - 8);
      if (C.cities.some((c) => U.dist(c.x, c.y, x, y) < 70)) continue;
      if (world.lakes.some((l) => Math.hypot((x - l.x) / l.rx, (y - l.y) / l.ry) < 1.9)) continue;
      const r = 28 + rand() * 48;
      world.forests.push({ x, y, r, seed: Math.floor(rand() * 1e6), type: rand() < 0.25 ? 'pine' : 'mixed' });
    }

    // поля
    guard = 0;
    while (world.fields.length < 46 && guard++ < 1200) {
      const x = 8 + rand() * (C.worldW - 16);
      const y = 8 + rand() * (C.worldH - 16);
      if (C.cities.some((c) => U.dist(c.x, c.y, x, y) < 60)) continue;
      if (world.forests.some((f) => U.dist(f.x, f.y, x, y) < f.r + 25)) continue;
      world.fields.push({
        x, y, w: 60 + rand() * 130, h: 45 + rand() * 90,
        rot: rand() * Math.PI, kind: Math.floor(rand() * 3),
        seed: Math.floor(rand() * 1e6),
      });
    }

    // холмы
    guard = 0;
    while (world.hills.length < 30 && guard++ < 900) {
      const x = rand() * C.worldW;
      const y = rand() * C.worldH;
      if (C.cities.some((c) => U.dist(c.x, c.y, x, y) < 55)) continue;
      world.hills.push({ x, y, r: 55 + rand() * 90, h: 8 + rand() * 14 });
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
    if (rd < 12) f += 0.62 * (1 - rd / 12);
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
    if (W.riverDist(world, x, y) < 4) return 'river';
    if (W.lakeFactor(world, x, y) > 0.55) return 'lake';
    if (world.forests.some((f) => U.dist(f.x, f.y, x, y) < f.r * 0.85)) return 'forest';
    if (world.fields.some((f) => Math.hypot((x - f.x) / f.w, (y - f.y) / f.h) < 0.8)) return 'field';
    if (world.hills.some((h) => U.dist(h.x, h.y, x, y) < h.r * 0.7)) return 'hill';
    return 'meadow';
  };
})();
