/* §86: карта мира (R-86.1…R-86.8, F-287…F-300).
   Наша страна — не весь мир. Здесь считаются соседи: у каждой страны своя форма, столица,
   города, дороги и отметки рельефа (лес, болото, горы, пустыня, тундра). Игрок ничего
   не решает: войны начинаются и идут сами, он только смотрит — как со спутника, если
   у страны есть спутник.

   Модуль не знает про канву: считает мир, фронты, взрывы, разрушения и оккупацию.
   Всё детерминировано: один и тот же сид всегда даёт ту же планету и ту же войну. */
import { hash01, idToInt } from './accidents2d.js';

export const WM = {
  sizeKm: 24000,             // сторона карты мира
  ownKm: 7000,               // наша страна — квадрат в центре
  countries: 18,             // всего стран, включая нашу
  citiesPer: [7, 13],        // городов в стране, включая два пограничных
  marksPer: 900,             // отметок рельефа на карту (лес, болото, горы…)
  roadKm: [420, 1300],       // длина дороги между городами
  satellite: { minimal: 0 },
  war: {
    firstWarMin: 60 * 24 * 3,   // первая война — не раньше третьих суток
    gapMin: 60 * 24 * 12,       // между войнами
    battleMin: 45,              // шаг боя, игровых минут
    explosionMin: 40,           // сколько живёт взрыв на карте
    frontSpeedKm: 26,           // сколько фронт сдвигается за шаг
    occupationKm: 180,          // ширина оккупированной полосы
    maxWars: 3,
    bigEvery: 4                 // каждый четвёртый взрыв — большой
  },
  capitalNames: ['Ратвер', 'Оствей', 'Камдор', 'Мирн', 'Сольв', 'Тарх', 'Вельд', 'Норск',
    'Ирбен', 'Ярга', 'Дорн', 'Скальд', 'Арвей', 'Турн', 'Керн', 'Лад', 'Морн'],
  syllables: ['ра', 'вел', 'дор', 'кам', 'мир', 'сол', 'тар', 'нор', 'ир', 'яр', 'ска', 'ар', 'тур', 'кер', 'лад', 'мор', 'гар', 'тин', 'бург', 'поль']
};

export const MARK = {
  forest: { id: 'forest', name: 'лес', tone: '#2f4f36' },
  swamp: { id: 'swamp', name: 'болото', tone: '#3d4a3a' },
  mountain: { id: 'mountain', name: 'горы', tone: '#6a6459' },
  desert: { id: 'desert', name: 'пустыня', tone: '#8f8560' },
  tundra: { id: 'tundra', name: 'тундра', tone: '#7f8a8f' },
  steppe: { id: 'steppe', name: 'степь', tone: '#7c8158' }
};

/* F-287: имя страны из слогов — детерминированно и по-русски. */
export function countryName(seed, i) {
  const n = 2 + Math.floor(hash01(seed + i * 7919, 11) * 2);
  let out = '';
  for (let k = 0; k < n; k++) {
    const idx = Math.floor(hash01(seed + i * 131 + k * 17, 7 + k) * WM.syllables.length) % WM.syllables.length;
    out += WM.syllables[idx];
  }
  const cap = out.charAt(0).toUpperCase() + out.slice(1);
  return cap + 'ия';
}

/* F-288: страны делят континент по-настоящему. Границы — серединные перпендикуляры
   между столицами (ячейки Вороного), поэтому у стран есть общие границы, а не
   «острова» в океане. Наша страна стоит в центре, остальные — кольцами вокруг. */
export function sitesFor(count, seed = 424242) {
  const out = [{ id: 'own', x: 0, y: 0, ring: -1 }];
  const rings = [
    { r: 7500, n: 6 },
    { r: 10200, n: Math.max(0, count - 7) }
  ];
  let id = 0;
  for (let ring = 0; ring < rings.length; ring++) {
    const { r, n } = rings[ring];
    for (let k = 0; k < n && out.length < count; k++) {
      // небольшой сдвиг, чтобы кольца не выглядели циркулем
      const a = (k / n) * Math.PI * 2 + ring * 0.31 + (hash01(seed + ring * 97 + k, 13) - 0.5) * 0.12;
      const rr = r * (1 + (hash01(seed + ring * 211 + k, 19) - 0.5) * 0.1);
      out.push({ id: 'c' + (++id), x: Math.cos(a) * rr, y: Math.sin(a) * rr, ring });
    }
  }
  return out;
}

/* Побережье: континент — правильный многоугольник, за его край страны не выходят. */
export function coastPolygon(radiusKm = 11600, sides = 72) {
  const pts = [];
  for (let i = 0; i < sides; i++) {
    const a = (i / sides) * Math.PI * 2;
    pts.push([Math.cos(a) * radiusKm, Math.sin(a) * radiusKm]);
  }
  return pts;
}

/* Отсечение многоугольника полуплоскостью: оставляем то, что ближе к своей столице. */
export function clipHalfPlane(poly, mx, my, dx, dy) {
  const out = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    const da = (a[0] - mx) * dx + (a[1] - my) * dy;
    const db = (b[0] - mx) * dx + (b[1] - my) * dy;
    if (da <= 0) out.push(a);
    if ((da < 0 && db > 0) || (da > 0 && db < 0)) {
      const t = da / (da - db);
      out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
    }
  }
  return out;
}

/* F-289: ячейка страны. Начинаем с побережья и отрезаем всё, что ближе к соседу. */
export function voronoiPoly(site, sites, clip = coastPolygon()) {
  let poly = clip.map((p) => [p[0], p[1]]);
  for (const other of sites) {
    if (other === site || (other.id === site.id)) continue;
    const mx = (site.x + other.x) / 2, my = (site.y + other.y) / 2;
    poly = clipHalfPlane(poly, mx, my, other.x - site.x, other.y - site.y);
    if (poly.length < 3) return [];
  }
  return poly;
}

/* Центр страны: точка, максимально удалённая от границ (поиск по сетке с уточнением).
   Столица ставится туда — даже у вытянутой страны она оказывается в середине. */
export function poleOfInaccessibility(poly) {
  if (!poly.length) return { x: 0, y: 0, r: 0 };
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const [x, y] of poly) {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  let best = { x: (minX + maxX) / 2, y: (minY + maxY) / 2, r: 0 };
  let x0 = minX, x1 = maxX, y0 = minY, y1 = maxY;
  for (let step = 0; step < 3; step++) {
    const n = 9;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const x = x0 + ((x1 - x0) * i) / (n - 1);
        const y = y0 + ((y1 - y0) * j) / (n - 1);
        if (!pointInPolygon(x, y, poly)) continue;
        const r = cellRadius(poly, { x, y });
        if (r > best.r) best = { x, y, r };
      }
    }
    // сужаем окно вокруг лучшей точки
    const w = (x1 - x0) * 0.25, h = (y1 - y0) * 0.25;
    x0 = best.x - w; x1 = best.x + w; y0 = best.y - h; y1 = best.y + h;
  }
  return best;
}

/* Радиус страны — расстояние от столицы до ближайшей границы. */
export function cellRadius(poly, site = { x: 0, y: 0 }) {
  let best = Infinity;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    best = Math.min(best, segmentDistance(site.x, site.y, a[0], a[1], b[0], b[1]));
  }
  return Number.isFinite(best) ? best : 0;
}

export function polygonArea(poly) {
  let a = 0;
  for (let i = 0; i < poly.length; i++) {
    const [x1, y1] = poly[i], [x2, y2] = poly[(i + 1) % poly.length];
    a += x1 * y2 - x2 * y1;
  }
  return Math.abs(a) / 2;
}

export function pointInPolygon(x, y, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/* F-290: где ставить соседей. Наша страна в центре, остальные — кольцами вокруг,
   чтобы карта мира была заполнена, а не пуста по краям. */
export function neighbourSlots(count, seed = 424242) {
  const out = [];
  // два кольца вокруг нашей страны; радиусы подобраны так, чтобы страны целиком
  // лежали в пределах карты (24000 км), а центры не сближались ближе 2000 км
  const rings = [
    { r: 7600, n: 9, rad: [1500, 800] },
    { r: 10000, n: 8, rad: [900, 600] }
  ];
  let id = 0;
  for (let ring = 0; ring < rings.length; ring++) {
    const { r, n, rad } = rings[ring];
    for (let k = 0; k < n && id < count; k++) {
      const a = (k / n) * Math.PI * 2 + ring * 0.37 + hash01(seed + ring * 97 + k, 13) * 0.2;
      out.push({
        id: 'c' + (id + 1),
        x: Math.cos(a) * r,
        y: Math.sin(a) * r,
        ring,
        radiusKm: rad[0] + hash01(seed + id * 71, 17) * rad[1]
      });
      id++;
    }
  }
  return out;
}

/* F-291: города страны — столица и точки вокруг неё, детерминированно. */
export function countryCities(country, seed) {
  const [lo, hi] = WM.citiesPer;
  const n = lo + Math.floor(hash01(seed + idToInt(country.id), 41) * (hi - lo + 1));
  const cities = [{
    id: country.id + '-cap', name: country.capitalName, x: country.capital.x, y: country.capital.y,
    capital: true, pop: 900 + Math.floor(hash01(seed + idToInt(country.id), 43) * 900)
  }];
  for (let i = 1; i < n; i++) {
    const a = hash01(seed + idToInt(country.id) * 7 + i, 47) * Math.PI * 2;
    let r = Math.sqrt(hash01(seed + idToInt(country.id) * 11 + i, 53)) * country.radiusKm * 0.82;
    // если точка вышла за границу — подтягиваем её к столице, пока не окажется внутри
    let x = country.capital.x + Math.cos(a) * r;
    let y = country.capital.y + Math.sin(a) * r;
    for (let guard = 0; guard < 8 && !pointInPolygon(x, y, country.poly); guard++) {
      r *= 0.78;
      x = country.capital.x + Math.cos(a) * r;
      y = country.capital.y + Math.sin(a) * r;
    }
    cities.push({
      id: country.id + '-' + i,
      name: country.capitalName.slice(0, -2) + 'ск' + (i > 1 ? ' ' + i : ''),
      x, y,
      capital: false,
      pop: 80 + Math.floor(hash01(seed + i * 31 + idToInt(country.id), 59) * 320)
    });
  }
  return cities;
}

/* F-291: пограничные городки. Стоят у самой границы — именно они первыми попадают
   под удар, и по ним на карте видно, где прошла война. */
export function borderTowns(country, seed, n = 2) {
  const out = [];
  const poly = country.poly;
  if (!poly || poly.length < 3) return out;
  const used = new Set();
  for (let i = 0; i < n; i++) {
    // берём случайное ребро границы и ставим городок в 93 % пути к его середине:
    // так он точно у самой границы, с какой бы стороны она ни лежала
    let idx = Math.floor(hash01(seed + idToInt(country.id) * 13 + i, 61) * poly.length) % poly.length;
    for (let guard = 0; guard < 6 && used.has(idx); guard++) idx = (idx + 1) % poly.length;
    used.add(idx);
    const p1 = poly[idx], p2 = poly[(idx + 1) % poly.length];
    const mx = (p1[0] + p2[0]) / 2, my = (p1[1] + p2[1]) / 2;
    let k = 0.965;
    let x = country.capital.x + (mx - country.capital.x) * k;
    let y = country.capital.y + (my - country.capital.y) * k;
    for (let guard = 0; guard < 8 && !pointInPolygon(x, y, poly); guard++) {
      k *= 0.9;
      x = country.capital.x + (mx - country.capital.x) * k;
      y = country.capital.y + (my - country.capital.y) * k;
    }
    if (!pointInPolygon(x, y, poly)) continue;
    out.push({
      id: country.id + '-b' + i,
      name: country.capitalName.slice(0, -2) + 'ец' + (i ? ' ' + (i + 1) : ''),
      x, y, capital: false, border: true,
      pop: 40 + Math.floor(hash01(seed + i * 23 + idToInt(country.id), 67) * 90)
    });
  }
  return out;
}

/* F-292: дороги — цепочка между городами страны плюс два международных коридора. */
export function countryRoads(country, cities) {
  const roads = [];
  for (let i = 1; i < cities.length; i++) {
    roads.push({ id: country.id + '-r' + i, country: country.id, a: cities[i - 1].id, b: cities[i].id, x1: cities[i - 1].x, y1: cities[i - 1].y, x2: cities[i].x, y2: cities[i].y, kind: i === 1 ? 'main' : 'local', bridge: i === 1 });
  }
  // замыкаем кольцо: страна не висит на одной нитке
  if (cities.length > 3) {
    const last = cities[cities.length - 1], first = cities[0];
    roads.push({ id: country.id + '-ring', country: country.id, a: last.id, b: first.id, x1: last.x, y1: last.y, x2: first.x, y2: first.y, kind: 'local', bridge: false });
  }
  return roads;
}

/* F-293: отметки рельефа — то, что на настоящих картах рисуют значками, а не цветом.
   Тип зависит от широты и высоты шума: к северу тундра, у экватора пустыня и степь. */
export function buildMarks(seed, sizeKm = WM.sizeKm, count = WM.marksPer) {
  const marks = new Float32Array(count * 3);          // x, y, тип — плотный массив, не объекты
  const types = ['forest', 'forest', 'forest', 'swamp', 'mountain', 'steppe', 'steppe', 'desert', 'tundra'];
  const half = sizeKm / 2;
  for (let i = 0; i < count; i++) {
    const u = hash01(seed + i * 13, 61), v = hash01(seed + i * 17, 67);
    const x = (u * 2 - 1) * half, y = (v * 2 - 1) * half;
    const cold = Math.abs(y) / half;                  // 0 — экватор, 1 — полюс
    let t = types[Math.floor(hash01(seed + i * 19, 71) * types.length) % types.length];
    if (cold > 0.75) t = 'tundra';
    else if (cold < 0.3 && t === 'forest') t = 'steppe';
    marks[i * 3] = x; marks[i * 3 + 1] = y; marks[i * 3 + 2] = types.indexOf(t);
  }
  return marks;
}

/* F-294: армии. У каждой страны одна-две группы у границы; видны, только если
   у наблюдателя есть спутник (R-86.4), иначе — только свои. */
export function buildArmies(country, seed) {
  const n = 1 + Math.floor(hash01(seed + idToInt(country.id), 79) * 2);
  const out = [];
  for (let i = 0; i < n; i++) {
    const a = hash01(seed + idToInt(country.id) * 3 + i, 83) * Math.PI * 2;
    out.push({
      id: country.id + '-a' + i,
      country: country.id,
      x: country.capital.x + Math.cos(a) * country.radiusKm * 0.86,
      y: country.capital.y + Math.sin(a) * country.radiusKm * 0.86,
      size: 600 + Math.floor(hash01(seed + i * 37 + idToInt(country.id), 89) * 1400),   // человек
      side: 'home',                                                                    // дома или на фронте
      at: 0
    });
  }
  return out;
}

/* F-295: видно ли армии чужой страны. Спутник есть у сильной страны — тогда видно всех. */
export function canSeeArmies(world, observerId = 'own') {
  const obs = world.countries.find((c) => c.id === observerId);
  return !!(obs && obs.satellite);
}

/* Сборка мира: наша страна + соседи + города + дороги + отметки + армии. */
export function buildWorld(seed = 424242) {
  const sites = sitesFor(WM.countries, seed);
  const clip = coastPolygon();
  const ownSite = sites[0];
  const ownPoly = voronoiPoly(ownSite, sites, clip);
  const own = {
    id: 'own',
    name: 'Ратград',
    own: true,
    capitalName: 'Валград',
    capital: { x: 0, y: 0 },
    radiusKm: cellRadius(ownPoly, ownSite) * 0.95,
    poly: ownPoly,
    satellite: true,           // у нашей страны спутник есть — иначе смотреть было бы не на что
    strength: 1.0
  };
  const countries = [own];
  for (let i = 1; i < sites.length; i++) {
    const site = sites[i];
    const poly = voronoiPoly(site, sites, clip);
    // столица — в самом просторном месте страны, а не там, где легла точка-семя
    const pole = poleOfInaccessibility(poly);
    const capital = { x: Number.isFinite(pole.x) ? pole.x : site.x, y: Number.isFinite(pole.y) ? pole.y : site.y };
    countries.push({
      id: site.id,
      name: countryName(seed, i),
      own: false,
      capitalName: WM.capitalNames[i % WM.capitalNames.length],
      capital,
      radiusKm: Math.max(120, cellRadius(poly, capital) * 0.95),
      poly,
      satellite: hash01(seed + i * 211, 97) < 0.25,
      strength: 0.5 + hash01(seed + i * 311, 101) * 1.4
    });
  }
  // свои города — та же столица плюс крупные поселения игры, приведённые к центру
  own.cities = [{
    id: 'own-cap', name: own.capitalName, x: 0, y: 0, capital: true, pop: 1800
  }];
  const ownTownNames = ['Оствей', 'Камдор', 'Мирн', 'Сольв', 'Тарх', 'Вельд', 'Норск', 'Ирбен', 'Ярга', 'Дорн'];
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + 0.3;
    const r = 900 + (i % 3) * 700;
    own.cities.push({ id: 'own-' + i, name: ownTownNames[i], x: Math.cos(a) * r, y: Math.sin(a) * r, capital: false, pop: 220 + i * 40 });
  }
  own.cities.push(...borderTowns(own, seed));
  const allCities = [...own.cities];
  const allRoads = countryRoads(own, own.cities);
  for (const c of countries) {
    if (c.own) continue;
    c.cities = countryCities(c, seed).concat(borderTowns(c, seed));
    c.roads = countryRoads(c, c.cities);
    allCities.push(...c.cities);
    allRoads.push(...c.roads);
  }
  // два международных коридора: наша страна связана с двумя соседями
  const near = countries.filter((c) => !c.own)
    .sort((a, b) => Math.hypot(a.capital.x, a.capital.y) - Math.hypot(b.capital.x, b.capital.y))
    .slice(0, 2);
  for (const c of near) {
    allRoads.push({
      id: 'int-' + c.id, country: 'own', a: 'own-cap', b: c.cities[0].id, x1: 0, y1: 0, x2: c.cities[0].x, y2: c.cities[0].y, kind: 'international', bridge: true
    });
  }
  // каждый город помнит свою страну — так проще и проверять, и рисовать
  for (const c of countries) for (const city of c.cities) city.country = c.id;
  const armies = [];
  for (const c of countries) armies.push(...buildArmies(c, seed));

  const w = {
    seed,
    sizeKm: WM.sizeKm,
    minutes: 0,
    countries,
    own,
    cities: allCities,
    roads: allRoads,
    marks: buildMarks(seed),
    armies,
    wars: [],
    pairs: adjacency(countries),
    explosions: [],
    destroyed: { cities: [], roads: [], bridges: [] },
    occupied: [],
    stats: { battles: 0, explosions: 0, killed: 0, big: 0 },
    rev: 0,                 // сколько раз мир менялся — по нему перерисовывается слой подробностей
    firstWarAt: null
  };
  // сводные числа читаются из stats: одно место правды, никаких рассинхронов
  Object.defineProperties(w, {
    battles: { get() { return this.stats.battles; }, enumerable: true },
    killed: { get() { return this.stats.killed; }, enumerable: true },
    warsTotal: { get() { return this.wars.length; }, enumerable: true },
    explosionsTotal: { get() { return this.stats.explosions; }, enumerable: true },
    bigExplosions: { get() { return this.stats.big; }, enumerable: true }
  });
  return w;
}

/* F-295: кто с кем граничит. Война возможна только между соседями — через голову
   соседа армия не ходит. Соседство считается по расстоянию между границами. */
export function adjacency(countries, maxKm = 130) {
  const pairs = [];
  for (let i = 0; i < countries.length; i++) {
    for (let j = i + 1; j < countries.length; j++) {
      const a = countries[i], b = countries[j];
      let best = Infinity;
      for (const [ax, ay] of a.poly) {
        for (let k = 0; k < b.poly.length; k++) {
          const p1 = b.poly[k], p2 = b.poly[(k + 1) % b.poly.length];
          const d = segmentDistance(ax, ay, p1[0], p1[1], p2[0], p2[1]);
          if (d < best) best = d;
          if (best <= maxKm) break;
        }
        if (best <= maxKm) break;
      }
      if (best <= maxKm) pairs.push({ a: a.id, b: b.id, km: Math.round(best) });
    }
  }
  return pairs;
}

/* F-296: где проходит граница между двумя странами — пара ближайших вершин
   полигонов. Фронт ставится там, а не между столицами: иначе бои шли бы в пустом поле. */
export function borderPoint(a, b) {
  const closestOnSegment = (px, py, x1, y1, x2, y2) => {
    const dx = x2 - x1, dy = y2 - y1;
    const len2 = dx * dx + dy * dy || 1;
    const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / len2));
    return { x: x1 + dx * t, y: y1 + dy * t };
  };
  // все точки соприкосновения границ — фронт ставится там, где он задевает города
  const contacts = [];
  const scan = (fromPoly, toPoly) => {
    for (const [px, py] of fromPoly) {
      for (let i = 0; i < toPoly.length; i++) {
        const p1 = toPoly[i], p2 = toPoly[(i + 1) % toPoly.length];
        const q = closestOnSegment(px, py, p1[0], p1[1], p2[0], p2[1]);
        const d = Math.hypot(px - q.x, py - q.y);
        if (d <= 260) contacts.push({ x: (px + q.x) / 2, y: (py + q.y) / 2, km: d });
      }
    }
  };
  scan(a.poly, b.poly);
  scan(b.poly, a.poly);
  const cities = [...(a.cities || []), ...(b.cities || [])];
  let best = null;
  const distToCities = (x, y) => {
    let m = Infinity;
    for (const c of cities) {
      const d = Math.hypot(c.x - x, c.y - y);
      if (d < m) m = d;
    }
    return m;
  };
  if (contacts.length) {
    let bestScore = Infinity;
    for (const c of contacts) {
      const s = distToCities(c.x, c.y);
      if (s < bestScore) { bestScore = s; best = c; }
    }
  } else {
    // границы не соприкасаются — берём середину между столицами
    best = { x: (a.capital.x + b.capital.x) / 2, y: (a.capital.y + b.capital.y) / 2, km: Infinity };
  }
  const dx = b.capital.x - a.capital.x, dy = b.capital.y - a.capital.y;
  const len = Math.hypot(dx, dy) || 1;
  best.ax = dx / len;
  best.ay = dy / len;
  return best;
}

/* F-296: объявление войны. Пары выбираются хешем от окна времени — детерминированно. */
export function maybeStartWar(world, minutes = world.minutes) {
  const active = world.wars.filter((w) => w.to === null);
  if (active.length >= WM.war.maxWars) return null;
  if (minutes < WM.war.firstWarMin) return null;
  const window = Math.floor(minutes / WM.war.gapMin);
  if (window <= 0) return null;
  const u = hash01(world.seed + window * 977, 103);
  if (u > 0.55) return null;
  const pairs = world.pairs.filter((p) => !active.some((w) => (w.a === p.a && w.b === p.b) || (w.a === p.b && w.b === p.a)));
  if (!pairs.length) return null;
  const pair = pairs[Math.floor(hash01(world.seed + window * 31, 107) * pairs.length) % pairs.length];
  const a = world.countries.find((c) => c.id === pair.a);
  const b = world.countries.find((c) => c.id === pair.b);
  if (!a || !b) return null;
  const bp = borderPoint(a, b);
  const war = {
    id: 'w' + window,
    a: a.id, b: b.id,
    from: minutes, to: null,
    // фронт стоит на границе двух стран и качается вдоль линии столиц
    x: bp.x,
    y: bp.y,
    baseX: bp.x, baseY: bp.y,
    ax: bp.ax, ay: bp.ay,
    borderKm: Math.round(bp.km),
    sway: 0,
    drift: 0,          // медленное продвижение вглубь слабейшей страны
    winner: null,
    battles: 0,
    lastStep: -1
  };
  world.wars.push(war);
  if (world.firstWarAt === null) world.firstWarAt = minutes;
  return war;
}

/* F-297: шаг войны. Фронт качается, рождаются взрывы, гибнут города и дороги,
   занятая полоса превращается в буфер (оккупацию) — её игрок только видит. */
export function advanceWars(world, minutes) {
  world.minutes = minutes;
  const started = maybeStartWar(world, minutes);
  let fresh = started ? 1 : 0;
  for (const war of world.wars) {
    if (war.to !== null) continue;
    const a = world.countries.find((c) => c.id === war.a);
    const b = world.countries.find((c) => c.id === war.b);
    if (!a || !b) { war.to = minutes; continue; }
    const k = Math.floor((minutes - war.from) / WM.war.battleMin);
    if (k <= war.lastStep) { continue; }
    war.lastStep = k;
    // F-297: перевес — из силы стран и хеша: война идёт рывками
    const balance = (a.strength - b.strength) + (hash01(world.seed + k * 13 + idToInt(war.id), 113) * 2 - 1) * 0.8;
    war.sway += balance * WM.war.frontSpeedKm * 0.35;
    // сильная страна теснит слабую: фронт не топчется на месте, а ползёт вглубь
    war.drift += (a.strength - b.strength) * 9;
    war.x = war.baseX + (war.ax || 1) * (war.sway + war.drift);
    war.y = war.baseY + (war.ay || 0) * (war.sway + war.drift);
    war.battles++;
    world.stats.battles++;
    // взрыв: большой — каждый четвёртый
    const big = k % WM.war.bigEvery === 0;
    const ex = {
      id: war.id + '-e' + k,
      x: war.x + (hash01(world.seed + k, 127) * 2 - 1) * 260,
      y: war.y + (hash01(world.seed + k, 131) * 2 - 1) * 260,
      at: minutes,
      big,
      rKm: big ? 26 : 9
    };
    world.explosions.push(ex);
    world.stats.explosions++;
    if (big) world.stats.big++;
    world.stats.killed += big ? 40 + Math.floor(hash01(world.seed + k, 137) * 60) : 3 + Math.floor(hash01(world.seed + k, 139) * 8);
    // разрушения: город рядом с фронтом — раз в несколько шагов; дорога — тоже
    if (k % 3 === 0) {
      const victim = nearestCity(world, ex.x, ex.y, 800);
      if (victim && !world.destroyed.cities.includes(victim.id)) { world.destroyed.cities.push(victim.id); world.rev++; }
      const road = nearestRoad(world, ex.x, ex.y, 600);
      if (road && !world.destroyed.roads.includes(road.id)) {
        world.destroyed.roads.push(road.id);
        // дорога с мостом, разорванная войной, — это ещё и разрушенный мост
        if (road.bridge && !world.destroyed.bridges.includes(road.id)) world.destroyed.bridges.push(road.id);
        world.rev++;
      }
    }
    // оккупация: полоса вокруг сместившегося фронта
    if (Math.abs(war.sway + war.drift) > WM.war.occupationKm) {
      const by = war.sway + war.drift > 0 ? war.a : war.b;
      world.occupied.push({
        id: war.id + '-o' + k,
        war: war.id,
        x: war.x, y: war.y,
        // ширина полосы растёт с продвижением фронта, но выше 220 км не поднимается
        rKm: Math.min(220, WM.war.occupationKm + Math.abs(war.sway + war.drift) * 0.4),
        by, of: by === war.a ? war.b : war.a,
        side: war.sway + war.drift > 0 ? war.a : war.b,
        from: minutes
      });
      if (world.occupied.length > 24) world.occupied.shift();
      world.rev++;
    }
    // конец войны: фронт ушёл слишком далеко или война идёт долго
    if (Math.abs(war.sway + war.drift) > 900 || minutes - war.from > WM.war.gapMin * 0.8) {
      war.to = minutes;
      war.winner = war.sway + war.drift > 0 ? war.b : war.a;
    }
  }
  // F-297: армии воюющих стран подтягиваются к своим фронтам, остальные стоят дома
  const byCountry = new Map();
  for (const war of world.wars) {
    if (war.to !== null) continue;
    if (!byCountry.has(war.a)) byCountry.set(war.a, []);
    if (!byCountry.has(war.b)) byCountry.set(war.b, []);
    byCountry.get(war.a).push(war);
    byCountry.get(war.b).push(war);
  }
  for (const army of world.armies) {
    const wars = byCountry.get(army.country);
    if (!wars || !wars.length) {
      army.side = 'home';
      continue;
    }
    const war = wars[0];
    army.side = 'front';
    // фронт у своей стороны: смещение к своему краю полосы
    const sign = army.country === war.a ? -1 : 1;
    const tx = war.x + sign * 90, ty = war.y + sign * 90;
    army.x += (tx - army.x) * 0.25;
    army.y += (ty - army.y) * 0.25;
  }
  // взрывы гаснут
  world.explosions = world.explosions.filter((e) => minutes - e.at <= WM.war.explosionMin);
  return fresh;
}

export function nearestCity(world, x, y, maxKm = Infinity) {
  let best = null, bestD = maxKm;
  for (const c of world.cities) {
    const d = Math.hypot(c.x - x, c.y - y);
    if (d < bestD) { bestD = d; best = c; }
  }
  return best;
}

export function nearestRoad(world, x, y, maxKm = Infinity) {
  let best = null, bestD = maxKm;
  for (const r of world.roads) {
    const d = segmentDistance(x, y, r.x1, r.y1, r.x2, r.y2);
    if (d < bestD) { bestD = d; best = r; }
  }
  return best;
}

export function segmentDistance(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1;
  const len2 = dx * dx + dy * dy || 1;
  let t = ((px - x1) * dx + (py - y1) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + dx * t), py - (y1 + dy * t));
}

/* F-298: страна под точкой — для подписи и подсветки своей. */
export function countryAt(world, x, y) {
  for (const c of world.countries) if (pointInPolygon(x, y, c.poly)) return c;
  return null;
}

/* F-299: сводка для панели: страны, войны, взрывы, разрушения, оккупация. */
export function worldStats(world, observerId = 'own') {
  const active = world.wars.filter((w) => w.to === null);
  const occupiedKm2 = world.occupied.reduce((a, o) => a + Math.PI * o.rKm * o.rKm * 0.5, 0);
  return {
    countries: world.countries.length,
    wars: active.length,
    warsTotal: world.wars.length,
    battles: world.stats.battles,
    explosions: world.explosions.length,
    explosionsTotal: world.stats.explosions,
    destroyedCities: world.destroyed.cities.length,
    destroyedRoads: world.destroyed.roads.length,
    destroyedBridges: world.destroyed.bridges.length,
    occupiedZones: world.occupied.length,
    occupiedKm2: Math.round(occupiedKm2),
    killed: world.stats.killed,
    satellite: canSeeArmies(world, observerId),
    armiesVisible: canSeeArmies(world, observerId) ? world.armies.length : world.armies.filter((a) => a.country === observerId).length,
    ownAtWar: active.some((w) => w.a === 'own' || w.b === 'own')
  };
}

/* F-300: где сейчас идут бои — для заголовка карты мира. */
export function hottestWar(world) {
  const active = world.wars.filter((w) => w.to === null);
  if (!active.length) return null;
  const byFront = active.slice().sort((a, b) => Math.abs(b.sway) - Math.abs(a.sway));
  const w = byFront[0];
  const a = world.countries.find((c) => c.id === w.a);
  const b = world.countries.find((c) => c.id === w.b);
  return { id: w.id, a: a ? a.name : w.a, b: b ? b.name : w.b, battles: w.battles, swayKm: Math.round(Math.abs(w.sway)) };
}
