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

  // Озёра по размеру сопоставимы с городами (город — 18–40 км поперёк),
  // а не втрое больше: раньше озёра были 60+ км и закрывали полкарты.
  // Реальные пропорции: город — это агломерация 18–100 км поперёк,
  // а озеро рядом с ним — 2–7 км. Раньше озёра были 30+ км, то есть крупнее города.
  const LAKES = [
    { x: 722, y: 158, rx: 2.6, ry: 2.0, rot: -0.3 },   // ~5 км
    { x: 158, y: 898, rx: 1.6, ry: 1.2, rot: 0.2 },    // ~3 км
    { x: 520, y: 462, rx: 3.4, ry: 2.6, rot: 0.5 },    // ~6.5 км
    { x: 302, y: 332, rx: 1.1, ry: 0.9, rot: 0.9 },    // ~2 км
    { x: 858, y: 642, rx: 2.0, ry: 1.5, rot: -0.6 },   // ~3.5 км
    { x: 620, y: 880, rx: 1.3, ry: 1.0, rot: 0.15 },   // ~2.5 км
    { x: 430, y: 210, rx: 0.7, ry: 0.5, rot: 0.4 },    // маленький пруд
    { x: 760, y: 470, rx: 0.9, ry: 0.7, rot: -0.2 },   // маленький пруд
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

  // rr = 1 на берегу, <1 в воде, >1 на суше (эллиптическое расстояние до озера)
  W.lakeRR = function (world, x, y) {
    let best = Infinity;
    for (const l of world.lakes || []) {
      const rr = Math.hypot((x - l.x) / l.rx, (y - l.y) / l.ry);
      if (rr < best) best = rr;
    }
    return best;
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

  /* Обход озёр: если отрезок трассы заходит в озеро — ведём его по берегу.
     Возвращает новый список точек (вход-выход + дуга по кромке с запасом 18 %). */
  W.routeAroundLakes = function (world, pts) {
    if (!pts || pts.length < 2 || !world.lakes || !world.lakes.length) return pts ? pts.slice() : [];
    let out = [pts[0]];
    for (let i = 1; i < pts.length; i++) {
      const seg = avoidLakesInSegment(world, out[out.length - 1], pts[i]);
      for (const p of seg) out.push(p);
    }
    return out;
  };

  function avoidLakesInSegment(world, a, b) {
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    if (len < 1) return [{ x: b.x, y: b.y }];
    const steps = Math.max(6, Math.ceil(len));
    // ищем первое озеро, в которое заходит отрезок
    let hit = null;
    for (const l of world.lakes) {
      let first = -1, last = -1;
      for (let k = 0; k <= steps; k++) {
        const t = k / steps;
        const x = a.x + (b.x - a.x) * t, y = a.y + (b.y - a.y) * t;
        const rr = Math.hypot((x - l.x) / l.rx, (y - l.y) / l.ry);
        if (rr < 1.02) { if (first < 0) first = t; last = t; }
      }
      if (first >= 0 && (!hit || first < hit.first)) hit = { l, first, last };
    }
    if (!hit) return [{ x: b.x, y: b.y }];
    const l = hit.l;
    const p1 = { x: a.x + (b.x - a.x) * hit.first, y: a.y + (b.y - a.y) * hit.first };
    const p2 = { x: a.x + (b.x - a.x) * hit.last, y: a.y + (b.y - a.y) * hit.last };
    let a1 = Math.atan2((p1.y - l.y) / l.ry, (p1.x - l.x) / l.rx);
    let a2 = Math.atan2((p2.y - l.y) / l.ry, (p2.x - l.x) / l.rx);
    let d = a2 - a1;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    const arc = Math.max(6, Math.ceil(Math.abs(d) * 7));
    const k2 = 1.18;   // запас от воды
    const detour = [];
    for (let k = 0; k <= arc; k++) {
      const ang = a1 + (d * k) / arc;
      const px = l.x + Math.cos(ang) * l.rx * k2;
      const py = l.y + Math.sin(ang) * l.ry * k2;
      detour.push({ x: px, y: py });
    }
    // то, что осталось до конца отрезка после выхода с озера
    detour.push({ x: b.x, y: b.y });
    return detour;
  }

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
    if (W.riverDist(world, x, y) < 3) return 'river';
    if (W.lakeRR(world, x, y) < 1.0) return 'lake';
    // Пойма: широкая заливная полоса вдоль рек — свои травы, старицы, ивняк
    const rd = W.riverDist(world, x, y);
    if (rd < 16 && world.noise(x * 0.02, y * 0.02) > 0.33) return 'floodplain';
    // Болото: низкие места у воды на севере карты
    if (rd < 26 && y < C.worldH * 0.45 && world.noise(x * 0.013 + 40, y * 0.013) > 0.62) return 'bog';
    if (world.hills.some((h) => U.dist(h.x, h.y, x, y) < h.r * 0.62)) return 'hill';
    if (world.forests.some((f) => U.dist(f.x, f.y, x, y) < f.r * 0.85)) {
      // тайга на севере, смешанный лес в средней полосе
      return y < C.worldH * 0.42 ? 'taiga' : 'forest';
    }
    if (world.fields.some((f) => Math.hypot((x - f.x) / f.w, (y - f.y) / f.h) < 0.8)) return 'field';
    // степь на юге — сухая трава
    if (y > C.worldH * 0.62 && world.noise(x * 0.008 + 90, y * 0.008) > 0.42) return 'steppe';
    return 'meadow';
  };
})();
