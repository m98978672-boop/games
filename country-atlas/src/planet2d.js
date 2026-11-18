/* §95: планета, а не один блин.

   Владелец открыл карту и сказал: «почему на карте мира 1 материк? где нормальная карта?».
   До этого весь мир был одним круглым континентом с волнистым берегом и девятью
   островками — на карту мира это не похоже.

   Здесь планета собирается из нескольких материков: у каждого свой берег с заливами,
   полуостровами и мысами, своё имя и свои страны. Координаты — километры от центра
   мира (0; 0), карта квадратная 40 000 км, то есть равнопромежуточная проекция:
   x = долгота (−180°…180°), y = широта (−90°…90°).

   Всё детерминировано сидом: тот же сид — та же планета. */

export const PLANET = {
  // сколько материков и какие они. Наш — первый, самый большой и в центре мира.
  lands: 5,
  mainKm: 6300,             // средний радиус нашего материка
  landKm: [2600, 4300],     // средние радиусы остальных материков
  ringKm: [12900, 13400],   // запасной ориентир удаления, если считать не по лучу
  edgeKm: 17200,            // дальше этого от центра суша не заходит (там полярные льды)
  gapKm: 900,               // пролив между материками
  sides: 240,               // точек в береговой линии материка
  bays: [2, 4],             // заливов на материк
  capes: [1, 3],            // полуостровов на материк
  names: ['Ратгея', 'Оствея', 'Камдория', 'Мирния', 'Сольвен'],
  // сколько стран живёт на материках: наш получает половину, остальные делят остаток
  ownShare: 0.45
};

/* Детерминированное число 0…1 от двух целых: без Math.random, чтобы планета повторялась. */
export function pick(a, b) {
  const v = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453;
  return v - Math.floor(v);
}

export function insidePoly(x, y, poly) {
  if (!poly || poly.length < 3) return false;
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

export function polyArea(poly) {
  let a = 0;
  for (let i = 0; i < poly.length; i++) {
    const [x1, y1] = poly[i], [x2, y2] = poly[(i + 1) % poly.length];
    a += x1 * y2 - x2 * y1;
  }
  return Math.abs(a) / 2;
}

function angDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

/* Берег материка. Четыре длинные волны дают общий силуэт, заливы врезаются в сушу,
   полуострова выдвигаются в море, мелкая рябь делает кромку неровной — как на настоящей
   карте, а не как циркулем. Радиус остаётся положительным и непрерывным, поэтому
   многоугольник простой: страны и побережье режутся по нему без дыр. */
export function landPolygon(land, seed = 424242) {
  const R = land.rKm;
  const s = seed + land.i * 7919;
  const phase = [pick(s, 11) * 6.28, pick(s, 13) * 6.28, pick(s, 17) * 6.28, pick(s, 19) * 6.28];
  const waves = [
    [1 + (land.i % 3), 0.11, phase[0]],
    [3, 0.075, phase[1]],
    [5, 0.05, phase[2]],
    [8, 0.03, phase[3]]
  ];
  const bays = [];
  const bayCount = PLANET.bays[0] + Math.floor(pick(s, 23) * (PLANET.bays[1] - PLANET.bays[0] + 1));
  for (let k = 0; k < bayCount; k++) {
    bays.push({
      at: (k / bayCount) * Math.PI * 2 + pick(s + k * 31, 29) * 1.1,
      deep: 0.16 + pick(s + k * 37, 31) * 0.22,
      wide: 0.10 + pick(s + k * 41, 37) * 0.13
    });
  }
  const capes = [];
  const capeCount = PLANET.capes[0] + Math.floor(pick(s, 43) * (PLANET.capes[1] - PLANET.capes[0] + 1));
  for (let k = 0; k < capeCount; k++) {
    capes.push({
      at: (k / capeCount) * Math.PI * 2 + 0.9 + pick(s + k * 53, 47) * 1.3,
      high: 0.12 + pick(s + k * 59, 53) * 0.20,
      wide: 0.05 + pick(s + k * 61, 59) * 0.09
    });
  }
  // §96: материки вытянуты, как настоящие: Африка, Чили, Индокитай — не круги.
  // Вытянутость 0,52…0,9 и свой поворот; плюс перешеек, который делит материк на две части.
  const aspect = 0.52 + pick(s, 71) * 0.38;      // 0.52…0.90
  const tilt = pick(s, 73) * Math.PI;
  const neck = { at: pick(s, 79) * Math.PI * 2, deep: 0.10 + pick(s, 83) * 0.10, wide: 0.07 + pick(s, 89) * 0.05 };
  const ca = Math.cos(tilt), sa = Math.sin(tilt);
  const out = [];
  for (let i = 0; i < PLANET.sides; i++) {
    const a = (i / PLANET.sides) * Math.PI * 2;
    let k = 1;
    for (const [freq, amp, ph] of waves) k += amp * Math.sin(a * freq + ph);
    for (const b of bays) k -= b.deep * Math.exp(-(angDiff(a, b.at) ** 2) / (2 * b.wide ** 2));
    for (const c of capes) k += c.high * Math.exp(-(angDiff(a, c.at) ** 2) / (2 * c.wide ** 2));
    k -= neck.deep * Math.exp(-(angDiff(a, neck.at) ** 2) / (2 * neck.wide ** 2));
    k += 0.012 * Math.sin(a * 37 + phase[0]) + 0.007 * Math.sin(a * 61 - phase[1]);
    if (k < 0.6) k = 0.6;
    if (k > 1.34) k = 1.34;
    const px = Math.cos(a) * R * k * aspect;
    const py = Math.sin(a) * R * k / aspect;
    out.push([land.x + px * ca - py * sa, land.y + px * sa + py * ca]);
  }
  return out;
}

/* Насколько наш материк вытянут в заданную сторону: вдоль узкого места соседа
   можно поставить ближе, вдоль широкого — дальше. Так океан не выглядит пустым. */
export function mainReach(poly, angle) {
  const cx = Math.cos(angle), cy = Math.sin(angle);
  let last = 0;
  for (let t = 200; t <= 20000; t += 100) {
    if (insidePoly(cx * t, cy * t, poly)) last = t;
  }
  return last;
}

/* Материки. Наш стоит в центре мира (в его центре — наша столица), остальные —
   вокруг него: расстояние считается по вытянутости нашего берега в эту сторону,
   поэтому соседи стоят близко и мир не расползается по пустому океану. */
export function buildLands(seed = 424242) {
  const out = [];
  const main = { id: 'l0', i: 0, name: PLANET.names[0], x: 0, y: 0, rKm: PLANET.mainKm };
  main.poly = landPolygon(main, seed);
  out.push(main);
  const n = PLANET.lands - 1;
  for (let i = 1; i <= n; i++) {
    const a = (i / n) * Math.PI * 2 + pick(seed + i * 97, 61) * 0.34;
    const near = mainReach(main.poly, a);
    let rKm = PLANET.landKm[0] + pick(seed + i * 173, 71) * (PLANET.landKm[1] - PLANET.landKm[0]);
    // рамка: суша не заходит в льды и не вылезает за карту
    const roomOut = (PLANET.edgeKm - near - PLANET.gapKm) / 2.72;
    if (rKm > roomOut) rKm = Math.max(1400, roomOut);
    const extent = rKm * 1.36;
    const ring = near + PLANET.gapKm + extent;
    const x = Math.cos(a) * ring, y = Math.sin(a) * ring;
    out.push({ id: 'l' + i, i, name: PLANET.names[i % PLANET.names.length], x, y, rKm, angle: a });
    out[out.length - 1].poly = landPolygon(out[out.length - 1], seed);
  }
  // соседи не должны налезать друг на друга: если задевают, отодвигаем по своему лучу
  for (let i = 1; i < out.length; i++) {
    for (let k = 0; k < 40; k++) {
      let bad = false;
      for (let j = 1; j < out.length; j++) {
        if (i === j) continue;
        const need = (out[i].rKm + out[j].rKm) * 1.36 + 400;
        if (Math.hypot(out[i].x - out[j].x, out[i].y - out[j].y) < need) { bad = true; break; }
      }
      if (!bad) break;
      const k2 = k + 1;
      const a = Math.atan2(out[i].y, out[i].x) + (k2 % 2 ? 0.12 : -0.12) * k2;
      const ring = Math.hypot(out[i].x, out[i].y) + 140;
      out[i].x = Math.cos(a) * ring;
      out[i].y = Math.sin(a) * ring;
    }
    out[i].angle = Math.atan2(out[i].y, out[i].x);
    out[i].poly = landPolygon(out[i], seed);
  }
  // финальная проверка: суша внутри карты и вне льдов — иначе подрезаем материк.
  // Вытянутый материк вылетает дальше круглого, поэтому подрезка идёт в несколько проходов.
  for (let pass = 0; pass < 4; pass++) {
    let fixed = false;
    for (const land of out) {
      const far = Math.max(...land.poly.map(([x, y]) => Math.hypot(x, y)));
      if (far > PLANET.edgeKm) {
        land.rKm *= (PLANET.edgeKm / far) * 0.97;
        land.poly = landPolygon(land, seed);
        fixed = true;
      }
    }
    if (!fixed) break;
  }
  return out;
}

/* Точки-семена стран внутри материка. Наш материк получает столицу ровно в центре
   (там же центр мира), остальные — по сетке с отталкиванием: страны не липнут
   друг к другу и не выходят за берег. */
export function sitesInLand(land, count, seed = 424242, centerFirst = false) {
  const out = [];
  const minDist = land.rKm * (count > 6 ? 0.62 : 0.72);
  if (centerFirst) out.push({ id: 'own', x: land.x, y: land.y, ring: 0, land: land.id });
  let guard = 0;
  while (out.length < count && guard < 900) {
    guard++;
    const a = pick(seed + land.i * 311 + guard * 17, 73) * Math.PI * 2;
    const rr = land.rKm * (0.42 + 0.42 * Math.sqrt(pick(seed + land.i * 199 + guard * 29, 79)));
    const x = land.x + Math.cos(a) * rr;
    const y = land.y + Math.sin(a) * rr;
    if (!insidePoly(x, y, land.poly)) continue;
    let ok = true;
    for (const other of out) {
      const limit = minDist * (other.id === 'own' ? 1.05 : 1);
      if (Math.hypot(other.x - x, other.y - y) < limit) { ok = false; break; }
    }
    if (!ok) continue;
    out.push({ id: 'c' + (out.length + 1), x, y, ring: 1, land: land.id });
  }
  // если места не хватило — добираем без отталкивания, лишь бы внутри берега
  const fallback = count - out.length;
  for (let k = 0; k < fallback * 40 && out.length < count; k++) {
    const a = pick(seed + 7 + k * 13, 83) * Math.PI * 2;
    const rr = land.rKm * 0.5 * Math.sqrt(pick(seed + 11 + k * 19, 89));
    const x = land.x + Math.cos(a) * rr, y = land.y + Math.sin(a) * rr;
    if (!insidePoly(x, y, land.poly)) continue;
    out.push({ id: 'c' + (out.length + 1), x, y, ring: 1, land: land.id });
  }
  return out;
}

/* Сколько стран какому материку: наш получает долю, остальные делят остаток по площади. */
export function splitCountries(lands, total, ownShare = PLANET.ownShare) {
  const mainCount = Math.max(3, Math.round(total * ownShare));
  const rest = total - mainCount;
  const others = lands.slice(1);
  const weights = others.map((l) => l.rKm * l.rKm);
  const sum = weights.reduce((a, b) => a + b, 0) || 1;
  const counts = others.map((l, i) => {
    const raw = (rest * weights[i]) / sum;
    return Math.max(1, Math.floor(raw));
  });
  let left = rest - counts.reduce((a, b) => a + b, 0);
  // остаток раздаём самым «обделённым» по дробной части
  const frac = others.map((l, i) => ({ i, v: (rest * weights[i]) / sum - Math.floor((rest * weights[i]) / sum) }));
  frac.sort((a, b) => b.v - a.v);
  let k = 0;
  while (left > 0 && frac.length) { counts[frac[k % frac.length].i] += 1; left--; k++; }
  while (left < 0) { counts[counts.indexOf(Math.max(...counts))] -= 1; left++; }
  return [mainCount, ...counts];
}

/* Материк, на котором лежит точка (или null — там океан). */
export function landAt(lands, x, y) {
  for (const land of lands) if (insidePoly(x, y, land.poly)) return land;
  return null;
}

export function inAnyLand(lands, x, y) {
  return !!landAt(lands, x, y);
}

/* География: километры карты в градусы. Карта квадратная 40 000 км — это 360° по
   долготе и 180° по широте, то есть равнопромежуточная проекция. */
export function geoOf(world, x, y) {
  const size = (world && world.sizeKm) || 40000;
  const lon = (x / size) * 360;
  const lat = -(y / (size / 2)) * 90;
  return { lon, lat };
}

export function formatLat(lat) {
  const a = Math.abs(lat);
  if (a < 0.5) return 'экватор';
  const d = Math.round(a);
  return d + '° ' + (lat > 0 ? 'с. ш.' : 'ю. ш.');
}

export function formatLon(lon) {
  let l = lon;
  while (l > 180) l -= 360;
  while (l < -180) l += 360;
  const a = Math.abs(l);
  if (a < 0.5) return '0° меридиан';
  return Math.round(a) + '° ' + (l > 0 ? 'в. д.' : 'з. д.');
}

/* F-400: точки в открытом океане — для подписей «О К Е А Н». Раньше слово рисовалось
   в долях экрана и ползло по воде вместе с камерой; теперь у океана есть координаты. */
export function oceanSpots(lands, sizeKm = 40000, count = 3) {
  const half = sizeKm / 2;
  const distToLand = (x, y) => {
    let best = Infinity;
    for (const l of lands) {
      const d = Math.hypot(l.x - x, l.y - y) - l.rKm * 1.2;
      if (d < best) best = d;
    }
    return best;
  };
  const cands = [];
  for (let i = -3; i <= 3; i++) {
    for (let j = -3; j <= 3; j++) {
      const x = (i / 3) * half * 0.86;
      const y = (j / 3) * half * 0.86;
      if (Math.abs(y) > half * 0.72) continue;        // у полюсов лёд, там океан не подписывают
      if (inAnyLand(lands, x, y)) continue;
      cands.push({ x, y, d: distToLand(x, y) });
    }
  }
  cands.sort((a, b) => b.d - a.d);
  const out = [];
  for (const c of cands) {
    if (out.length >= count) break;
    if (out.some((o) => Math.hypot(o.x - c.x, o.y - c.y) < half * 0.5)) continue;
    out.push({ x: c.x, y: c.y, name: 'О К Е А Н' });
  }
  return out;
}
