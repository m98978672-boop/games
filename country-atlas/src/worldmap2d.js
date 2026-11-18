/* §86: карта мира (R-86.1…R-86.8, F-287…F-300).
   Наша страна — не весь мир. Здесь считаются соседи: у каждой страны своя форма, столица,
   города, дороги и отметки рельефа (лес, болото, горы, пустыня, тундра). Игрок ничего
   не решает: войны начинаются и идут сами, он только смотрит — как со спутника, если
   у страны есть спутник.

   Модуль не знает про канву: считает мир, фронты, взрывы, разрушения и оккупацию.
   Всё детерминировано: один и тот же сид всегда даёт ту же планету и ту же войну. */
import { hash01, idToInt } from './accidents2d.js';
import {
  TECH, buildTech, advanceTech, techRate, nextTech, techEffects, techStats,
  armyPower, missileSpread, missileReach
} from './tech2d.js';
import { AUTONOMY, buildAutonomy, advanceAutonomy, incomePerDay } from './autonomy2d.js';
import {
  PLANET, buildLands, sitesInLand, splitCountries, landAt, inAnyLand, oceanSpots,
  geoOf, formatLat, formatLon, insidePoly
} from './planet2d.js';
import {
  REGIONS, buildRegions, regionAt as findRegion, nearestRegion, regionsOf,
  regionIncome, pressRegion, regionsStats
} from './regions2d.js';
import { buildBiomes, paintArea, passabilityAt, biomeAt, BIOMES } from './biome2d.js';
import { STENCIL, countryShore, graftShore, countryKindAt } from './stencil2d.js';

export const WM = {
  // F-372: сторона карты мира. В квадрате 24 000 суша срезалась его же краем —
  // города у мыса висели на воде. 40 000 даёт место вокруг континента: океан,
  // острова и полярные льды, то есть мир, а не один блин на чёрном фоне.
  sizeKm: 40000,
  ownKm: 7000,               // наша страна — квадрат в центре
  countries: 18,             // всего стран, включая нашу
  citiesPer: [7, 13],        // городов в стране, включая два пограничных
  marksPer: 5200,            // отметок рельефа на карту (лес, болото, горы…); на суше остаётся около 720
  islands: 9,                // островов в океане вокруг континента
  islandKm: [380, 900],       // радиус острова в км
  islandRing: [15800, 16400], // на каком удалении от центра лежат острова: за берегом, но до льдов
  capKm: 18200,              // с этой широты начинаются полярные льды
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

/* §88: отношения стран. Игрок и здесь только смотрит: посольства открываются сами,
   помощь союзнику уходит сама, вражда после войны держится сама. */
export const DIPLO = {
  levels: [
    { id: 'union', name: 'союз', from: 60 },
    { id: 'friend', name: 'дружба', from: 20 },
    { id: 'neutral', name: 'нейтралитет', from: -20 },
    { id: 'tension', name: 'напряжение', from: -60 },
    { id: 'enmity', name: 'вражда', from: -101 }
  ],
  embassyFrom: 20,          // с дружбы открывается посольство
  aidFrom: 20,              // помощь шлёт друг: с уровня дружбы
  aidKm: 4000,              // и только если может дотянуться
  aidEveryMin: 60 * 24 * 3, // окно поставок — раз в три игровых дня
  aidTons: [400, 2400],
  warHit: 80,               // война обрушивает отношения до вражды
  neighbourBonus: 15,       // соседи и без войны ближе друг к другу
  drift: 0.02,              // насколько быстро отношения возвращаются к своим
  cap: 100,
  keepAid: 40
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
/* F-355: берег континента — не циркуль. Несколько волн разной длины дают заливы,
   мысы и полуострова; многоугольник остаётся простым, поэтому ячейки стран режутся
   по нему как раньше. Радиус средней линии тот же 11 600 км. */
export function coastPolygon(radiusKm = 11600, sides = 180) {
  const wave = (a) => 0.10 * Math.sin(a * 2 - 1.2)     // длинная волна: континент вытянут, а не круг
    + 0.10 * Math.sin(a * 3 + 0.7)
    + 0.06 * Math.sin(a * 5 - 1.9)
    + 0.04 * Math.sin(a * 7 + 0.3)
    + 0.03 * Math.sin(a * 11 + 2.6)
    + 0.02 * Math.sin(a * 17 - 0.4);
  // F-361: считаем волну на всех углах и растягиваем её в коридор [0.965R … 1.33R].
  // Иначе в «заливах» берег подходил к центру ближе кольца стран, крайняя страна
  // оказывалась в море, и её границы рисовались по воде (а карта выглядела дырявой).
  let lo = Infinity, hi = -Infinity;
  const raw = [];
  for (let i = 0; i < sides; i++) {
    const a = (i / sides) * Math.PI * 2;
    const k = 1 + wave(a);
    raw.push([a, k]);
    if (k < lo) lo = k;
    if (k > hi) hi = k;
  }
  const span = hi - lo || 1;
  const rMin = radiusKm * 0.965, rMax = radiusKm * 1.33;
  const pts = [];
  for (const [a, k] of raw) {
    const r = rMin + ((k - lo) / span) * (rMax - rMin);
    pts.push([Math.cos(a) * r, Math.sin(a) * r]);
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
      name: townName(seed + idToInt(country.id) * 7, i),
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
      name: townName(seed + idToInt(country.id) * 13, 40 + i),
      x, y, capital: false, border: true,
      pop: 40 + Math.floor(hash01(seed + i * 23 + idToInt(country.id), 67) * 90)
    });
  }
  return out;
}


/* §96: имена городков. Раньше все города страны звались «Оствск 2», «Оствск 3» —
   цифры в названии на карте читаются как недоделка. Теперь основа и окончание
   берутся из своих списков, а повторы разводятся приставкой. */
export const TOWN = {
  stems: ['Валг', 'Оств', 'Камд', 'Мирн', 'Сольв', 'Тарх', 'Вельд', 'Норск', 'Ирбен', 'Ярг',
    'Дорн', 'Липен', 'Ратн', 'Зарн', 'Горн', 'Плес', 'Свет', 'Тихв', 'Вышн', 'Усть',
    'Красн', 'Бел', 'Мст', 'Креч', 'Лад', 'Русс', 'Сузд', 'Твер'],
  ends: ['град', 'ск', 'ец', 'ов', 'ин', 'ель', 'ань', 'ица', 'овск', 'инск', 'город',
    'поль', 'ино', 'яна', 'овец', 'уша'],
  prefixes: ['Верхний', 'Нижний', 'Старый', 'Новый', 'Большой', 'Малый', 'Красный', 'Тёмный']
};

export function townName(seed, k) {
  const st = TOWN.stems[Math.floor(hash01(seed + k * 97, 701) * TOWN.stems.length) % TOWN.stems.length];
  const en = TOWN.ends[Math.floor(hash01(seed + k * 131, 703) * TOWN.ends.length) % TOWN.ends.length];
  return st + en;
}

/* Свободное имя городка: сначала основа с окончанием, потом с приставкой. */
export function freeTownName(seed, k, used) {
  for (let attempt = 0; attempt < 80; attempt++) {
    const name = townName(seed + attempt * 17, k + attempt);
    if (!used.has(name)) return name;
  }
  for (const pre of TOWN.prefixes) {
    for (let attempt = 0; attempt < 12; attempt++) {
      const name = pre + ' ' + townName(seed + attempt * 29, k + pre.length + attempt);
      if (!used.has(name)) return name;
    }
  }
  return townName(seed, k) + ' Полевой';
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

/* F-373: острова. Раньше весь мир был одним континентом на пустом океане, и карта
   читалась как «блин». Острова лежат кольцом за берегом, стран на них нет — только
   земля, отмель и берег. Генерируются от сида: тот же сид — те же острова. */
export function buildIslands(seed = 424242, count = WM.islands, lands = null) {
  const list = lands || [];
  // §95: материки вытянуты и повёрнуты, поэтому остров проверяем по самому берегу,
  // а не по кругу вокруг центра — иначе он садился на мыс материка
  const near = (x, y, size) => list.some((l) => l.poly.some(([px, py]) => Math.hypot(px - x, py - y) < size * 1.5 + 260));
  const out = [];
  for (let i = 0; i < count * 6 && out.length < count; i++) {
    const a = ((out.length + i) / count) * Math.PI * 2 + hash01(seed + i * 311, 251) * 0.62;
    const r = WM.islandRing[0] + hash01(seed + i * 613, 257) * (WM.islandRing[1] - WM.islandRing[0]);
    const size = WM.islandKm[0] + hash01(seed + i * 877, 263) * (WM.islandKm[1] - WM.islandKm[0]);
    const cx = Math.cos(a) * r, cy = Math.sin(a) * r;
    // остров не садится на материк и не уходит в лёд
    if (near(cx, cy, size) || Math.hypot(cx, cy) + size * 1.4 > WM.capKm - 200) continue;
    const sides = 42 + (out.length % 3) * 6;
    const poly = [];
    for (let k = 0; k < sides; k++) {
      const b = (k / sides) * Math.PI * 2;
      const w = 1
        + 0.20 * Math.sin(b * 2 + i * 1.7)
        + 0.12 * Math.sin(b * 3 - i * 0.9)
        + 0.07 * Math.sin(b * 5 + i * 2.3);
      poly.push([cx + Math.cos(b) * size * w, cy + Math.sin(b) * size * w]);
    }
    out.push({ id: 'i' + out.length, name: 'остров', x: cx, y: cy, rKm: size, poly });
  }
  return out;
}

/* F-374: полярные льды. Две волнистые полосы у краёв карты — по ним видно, что мир
   круглый, а не обрезан рамкой. */
export function buildIceCaps(sizeKm = WM.sizeKm, edgeKm = WM.capKm) {
  const half = sizeKm / 2;
  const make = (sign) => {
    const poly = [];
    const n = 48;
    for (let i = 0; i <= n; i++) {
      const x = -half + (i / n) * sizeKm;
      const wobble = Math.sin((i / n) * Math.PI * 4) * 420 + Math.sin((i / n) * Math.PI * 9 + 1.1) * 180;
      poly.push([x, sign * (edgeKm + wobble)]);
    }
    poly.push([half, sign * half], [-half, sign * half]);
    return poly;
  };
  return [{ id: 'north', poly: make(-1) }, { id: 'south', poly: make(1) }];
}

/* F-362: рельеф бывает только на суше. Отметки рождаются на квадрате карты,
   поэтому часть попадала в океан и читалась там как мусор. Фильтр детерминирован
   (тот же seed — те же отметки) и заодно разрежает массив: рисовать дешевле. */
export function landMarks(marks, clip) {
  if (!marks || !clip || !clip.length) return marks;
  const keep = [];
  for (let i = 0; i < marks.length; i += 3) {
    if (pointInPolygon(marks[i], marks[i + 1], clip)) keep.push(marks[i], marks[i + 1], marks[i + 2]);
  }
  return Float32Array.from(keep);
}

/* §95: отметки рельефа — только на суше, а суши теперь несколько материков.
   Отметка остаётся, если попала на любой из них. */
export function marksOnLands(marks, lands) {
  if (!marks || !lands || !lands.length) return marks;
  // рамки материков: отметка сначала проверяется по рамке, и только потом по берегу
  const boxes = lands.map((l) => {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const [x, y] of l.poly) {
      if (x < x0) x0 = x;
      if (y < y0) y0 = y;
      if (x > x1) x1 = x;
      if (y > y1) y1 = y;
    }
    return [x0, y0, x1, y1];
  });
  const keep = [];
  for (let i = 0; i < marks.length; i += 3) {
    const x = marks[i], y = marks[i + 1];
    for (let k = 0; k < lands.length; k++) {
      const b = boxes[k];
      if (x < b[0] || y < b[1] || x > b[2] || y > b[3]) continue;
      if (insidePoly(x, y, lands[k].poly)) { keep.push(x, y, marks[i + 2]); break; }
    }
  }
  return Float32Array.from(keep);
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
      at: 0,
      morale: 0.7                          // боеготовность — длина полоски у метки (§89)
    });
  }
  return out;
}

/* F-295: видно ли армии чужой страны. Спутник есть у сильной страны — тогда видно всех. */
export function canSeeArmies(world, observerId = 'own') {
  const obs = world.countries.find((c) => c.id === observerId);
  if (!obs || !obs.satellite) return false;
  // F-327: спутник не рисуется сам по себе — его нужно доработать до третьего поколения
  return obs.tech && obs.tech.eff ? obs.tech.eff.satellite === true : true;
}

/* F-392: чьи армии видит наблюдатель. Свои — всегда: страна знает, где стоят её
   полки. Чужие — только если космос дошёл до спутника. Раньше без спутника не было
   видно вообще ничего, и на карте мира нельзя было увидеть собственную армию. */
export function visibleArmiesFor(world, observerId = 'own') {
  if (!world || !world.armies) return [];
  const all = canSeeArmies(world, observerId);
  return all ? world.armies.slice() : world.armies.filter((a) => a.country === observerId);
}

/* F-312: ключ пары — порядок стран не важен, отношения всегда взаимные. */
export function relationKey(a, b) {
  return a < b ? a + '|' + b : b + '|' + a;
}

/* F-313: уровень отношений по числу −100…100. */
export function relationLevel(score) {
  for (const l of DIPLO.levels) if (score >= l.from) return l;
  return DIPLO.levels[DIPLO.levels.length - 1];
}

/* F-314: стартовые отношения. Детерминированы сидом: та же планета — те же друзья. */
export function buildRelations(countries, seed, pairs = []) {
  const rel = new Map();
  for (let i = 0; i < countries.length; i++) {
    for (let j = i + 1; j < countries.length; j++) {
      const a = countries[i].id, b = countries[j].id;
      const base = Math.round((hash01(seed + i * 91 + j * 37, 71) * 2 - 1) * 70);
      rel.set(relationKey(a, b), { a: a < b ? a : b, b: a < b ? b : a, base, score: base, aid: 0, aidAt: null });
    }
  }
  // соседи начинают теплее: у них общая граница и общая торговля
  for (const p of pairs) {
    const r = rel.get(relationKey(p.a, p.b));
    if (!r) continue;
    const boost = Math.max(-DIPLO.cap, Math.min(DIPLO.cap, r.base + DIPLO.neighbourBonus));
    r.base = boost;
    r.score = boost;
  }
  return rel;
}

/* F-315: отношения двух стран в любой момент. */
export function relationOf(world, a, b) {
  if (!world.relations || a === b) return null;
  const r = world.relations.get(relationKey(a, b));
  if (!r) return null;
  return { score: Math.round(r.score), level: relationLevel(r.score), aid: r.aid, aidAt: r.aidAt };
}

/* F-316: контакты одной страны — с кем дружим, с кем воюем, где посольства. */
export function contactsOf(world, id = 'own') {
  if (!world.relations) return [];
  const out = [];
  const atWar = new Set();
  for (const w of world.wars) {
    if (w.to !== null) continue;
    if (w.a === id) atWar.add(w.b);
    if (w.b === id) atWar.add(w.a);
  }
  for (const [key, r] of world.relations) {
    void key;
    if (r.a !== id && r.b !== id) continue;
    const otherId = r.a === id ? r.b : r.a;
    const country = world.countries.find((c) => c.id === otherId);
    if (!country) continue;
    const level = relationLevel(r.score);
    out.push({
      id: otherId,
      name: country.name,
      score: Math.round(r.score),
      level: level.name,
      levelId: level.id,
      embassy: r.score >= DIPLO.embassyFrom,
      war: atWar.has(otherId),
      aid: r.aid,
      neighbour: world.pairs.some((p) => (p.a === id && p.b === otherId) || (p.b === id && p.a === otherId)),
      km: Math.round(Math.hypot(country.capital.x - (world.countries.find((c) => c.id === id) || { capital: { x: 0, y: 0 } }).capital.x,
        country.capital.y - (world.countries.find((c) => c.id === id) || { capital: { x: 0, y: 0 } }).capital.y))
    });
  }
  return out.sort((x, y) => y.score - x.score);
}

/* F-330: соседи по стране. Считается лениво и один раз — для шага дипломатии. */
function neighboursOf(world) {
  if (world.neighbours) return world.neighbours;
  const nb = new Map(world.countries.map((c) => [c.id, []]));
  for (const p of world.pairs) {
    if (!nb.has(p.a) || !nb.has(p.b)) continue;
    nb.get(p.a).push(p.b);
    nb.get(p.b).push(p.a);
  }
  try { Object.defineProperty(world, 'neighbours', { value: nb, enumerable: false }); } catch (err) { /* мир может быть заморожен — тогда просто посчитаем снова */ }
  return nb;
}

/* F-317: шаг дипломатии. Война обрушивает отношения, союзник посылает помощь,
   в остальное время отношения медленно возвращаются к своим. */
export function advanceDiplomacy(world, minutes = world.minutes) {
  if (!world.relations) return null;
  // F-330: война помечает сами записи отношений, а не их ключи: на каждом шаге экономится
  // сотня склеек строк, а числа остаются ровно те же
  const warring = new Set();
  for (const w of world.wars) {
    if (w.to !== null) continue;
    const r = world.relations.get(relationKey(w.a, w.b));
    if (!r) continue;
    warring.add(r);
    r.score = Math.min(r.score - 2, -DIPLO.warHit);
    // соседям воюющих тоже неуютно — обходим только соседей, а не все 153 пары мира
    const nb = world.neighbours || neighboursOf(world);
    for (const side of [w.a, w.b]) {
      const list = nb.get(side) || [];
      for (const other of list) {
        if (other === w.a || other === w.b) continue;
        const rr = world.relations.get(relationKey(side, other));
        if (rr) rr.score = Math.max(-DIPLO.cap, rr.score - 0.4);
      }
    }
  }
  for (const [, r] of world.relations) {
    if (warring.has(r)) continue;
    r.score += (r.base - r.score) * DIPLO.drift;
    r.score = Math.max(-DIPLO.cap, Math.min(DIPLO.cap, r.score));
  }
  // поставка помощи: пока идёт война, раз в три дня один друг помогает воюющей стороне
  const sinceAid = minutes - (world.lastAidAt || 0);
  const wars = world.wars.filter((w) => w.to === null);
  if (wars.length && sinceAid >= DIPLO.aidEveryMin) {
    const n = world.stats.aid + 1;
    const u = hash01(world.seed + n * 733, 149);
    if (u < 0.85) {
      const war = wars[Math.floor(hash01(world.seed + n * 17, 151) * wars.length) % wars.length];
      const front = { x: war.x, y: war.y };
      let best = null;
      for (const [, r] of world.relations) {
        for (const side of [war.a, war.b]) {
          const other = r.a === side ? r.b : r.b === side ? r.a : null;
          if (!other || other === war.a || other === war.b) continue;
          if (r.score < DIPLO.aidFrom) continue;
          const c = world.byId ? world.byId.get(other) : world.countries.find((k) => k.id === other);
          if (!c) continue;
          const km = Math.hypot(c.capital.x - front.x, c.capital.y - front.y);
          if (km > DIPLO.aidKm) continue;
          if (!best || km < best.km) best = { from: other, to: side, km };
        }
      }
      if (best) {
        const tons = DIPLO.aidTons[0] + Math.floor(hash01(world.seed + n * 29, 157) * (DIPLO.aidTons[1] - DIPLO.aidTons[0]));
        const ev = { kind: 'aid', from: best.from, to: best.to, at: minutes, tons, km: Math.round(best.km) };
        world.aid.push(ev);
        if (world.aid.length > DIPLO.keepAid) world.aid.shift();
        world.stats.aid++;
        const r = world.relations.get(relationKey(best.from, best.to));
        if (r) { r.aid++; r.aidAt = minutes; r.score = Math.min(DIPLO.cap, r.score + 4); }
      }
    }
    world.lastAidAt = minutes;
  }
  return world.aid;
}

/* F-318: сводка контактов для панели. */
export function diplomacyStats(world, observerId = 'own') {
  const list = contactsOf(world, observerId);
  const count = (id2) => list.filter((c) => c.levelId === id2).length;
  const lastAid = world.aid.length ? world.aid[world.aid.length - 1] : null;
  const fromName = (id2) => (world.countries.find((c) => c.id === id2) || { name: id2 }).name;
  return {
    contacts: list.length,
    union: count('union'),
    friend: count('friend'),
    neutral: count('neutral'),
    tension: count('tension'),
    enmity: count('enmity'),
    embassies: list.filter((c) => c.embassy).length,
    warring: list.filter((c) => c.war).length,
    aidTotal: world.stats.aid,
    aidLast: lastAid ? fromName(lastAid.from) + ' → ' + fromName(lastAid.to) : null,
    aidLastTons: lastAid ? lastAid.tons : 0,
    list
  };
}

/* Сборка мира: материки + страны + города + дороги + отметки + армии.
   §95: мир — не один континент. Материки собирает planet2d, страны живут на них:
   на нашем материке наша страна и его соседи, на остальных — свои страны и свои войны. */
export function buildWorld(seed = 424242) {
  const lands = buildLands(seed);
  // §103: берег нашей страны — трафарет с карты страны, один к одному. Трафарет
  // садится на ближний к нам берег своего материка: концы его встают ровно в две
  // вершины берега, а между ними — настоящая береговая линия с карты страны.
  // Дальше своя страна живёт уже на этом берегу, и её берег видно на карте мира.
  const shore = countryShore();
  if (lands[0]) {
    const graft = graftShore(lands[0], shore, { x: 0, y: 0 });
    if (graft) lands[0].ownSite = graft.site;
  }
  const counts = splitCountries(lands, WM.countries);
  const countries = [];
  let serial = 0;
  lands.forEach((land, li) => {
    const sites = sitesInLand(land, counts[li], seed, li === 0);
    land.countries = [];
    const local = sites.map((site) => {
      const id = li === 0 && site.ring === 0 ? 'own' : 'c' + (++serial);
      return Object.assign({}, site, { id });
    });
    for (const site of local) {
      const poly = voronoiPoly(site, local, land.poly);
      if (poly.length < 3) continue;
      const pole = poleOfInaccessibility(poly);
      const own = site.id === 'own';
      // §103: столица — в самой просторной точке страны и у своей, и у чужой.
      // Раньше своя столица стояла ровно в центре мира; теперь страна стоит на
      // берегу, и центр её страны — не центр мира: столицу ставим по месту.
      const capital = { x: Number.isFinite(pole.x) ? pole.x : site.x, y: Number.isFinite(pole.y) ? pole.y : site.y };
      const ctry = {
        id: site.id,
        name: own ? 'Ратград' : countryName(seed, countries.length),
        own,
        land: land.id,
        capitalName: own ? 'Валград' : WM.capitalNames[countries.length % WM.capitalNames.length],
        capital,
        radiusKm: Math.max(90, cellRadius(poly, capital) * 0.95),
        poly,
        satellite: own ? true : hash01(seed + countries.length * 211, 97) < 0.25,
        // §96: своя страна сильна по уставу — иначе войны только проигрываются и захватов не видно
        strength: own ? 1.45 : 0.5 + hash01(seed + countries.length * 311, 101) * 1.4
      };
      countries.push(ctry);
      land.countries.push(ctry.id);
    }
  });
  const own = countries.find((c) => c.own) || countries[0];
  // свои города — та же столица плюс крупные поселения игры
  own.cities = [{
    id: 'own-cap', name: own.capitalName, x: own.capital.x, y: own.capital.y, capital: true, pop: 1800
  }];
  const ownTownNames = ['Оствей', 'Камдор', 'Мирн', 'Сольв', 'Тарх', 'Вельд', 'Норск', 'Ирбен', 'Ярга', 'Дорн'];
  const ownReach = cellRadius(own.poly, own.capital) * 0.78;
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + 0.3;
    // §95: свои города — внутри своей страны: мир стал больше, и старый круг
    // радиусом 2 300 км выносил половину городов за границу
    let r = ownReach * (0.35 + 0.16 * (i % 4));
    let x = own.capital.x + Math.cos(a) * r;
    let y = own.capital.y + Math.sin(a) * r;
    // §103: страна теперь стоит на берегу и вытянута вдоль него — круг вокруг
    // столицы выносил города за берег. Подтягиваем их к столице, пока не окажутся
    // внутри своей страны.
    for (let guard = 0; guard < 10 && !pointInPolygon(x, y, own.poly); guard++) {
      r *= 0.8;
      x = own.capital.x + Math.cos(a) * r;
      y = own.capital.y + Math.sin(a) * r;
    }
    own.cities.push({ id: 'own-' + i, name: ownTownNames[i], x, y, capital: false, pop: 220 + i * 40 });
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
  // §96: шоссе между странами идут не «по прямой через всё», а через пограничный переход:
  // столица — перекрёсток на границе — столица соседа. Две половины одного шоссе,
  // поэтому на карте видно, где именно дорога пересекает границу.
  const highways = [];
  const seenPairs = new Set();
  for (const pair of adjacency(countries)) {
    const a = countries.find((c) => c.id === pair.a);
    const b = countries.find((c) => c.id === pair.b);
    if (!a || !b) continue;
    const key = pair.a + '|' + pair.b;
    if (seenPairs.has(key)) continue;
    seenPairs.add(key);
    const gate = snapGate(borderPoint(a, b), a, b, lands);
    if (!gate) continue;
    const id = 'hw-' + key;
    highways.push({
      id: id + '-a', country: a.id, a: a.cities[0].id, b: b.cities[0].id,
      x1: a.capital.x, y1: a.capital.y, x2: gate.x, y2: gate.y,
      kind: 'highway', bridge: false, pair: key, half: 'a'
    });
    highways.push({
      id: id + '-b', country: b.id, a: b.cities[0].id, b: a.cities[0].id,
      x1: gate.x, y1: gate.y, x2: b.capital.x, y2: b.capital.y,
      kind: 'highway', bridge: true, pair: key, half: 'b'
    });
  }
  allRoads.push(...highways);
  // каждый город помнит свою страну — так проще и проверять, и рисовать
  for (const c of countries) for (const city of c.cities) city.country = c.id;
  // §96: имена городов не повторяются на карте — повторы разводим свободным именем
  const usedNames = new Set();
  for (const city of allCities) {
    if (usedNames.has(city.name)) {
      city.name = freeTownName(seed + idToInt(city.country || 'c'), allCities.indexOf(city), usedNames);
    }
    usedNames.add(city.name);
  }
  // §89: у каждой страны своя наука; наша начинает со спутника и пары готовых сфер
  for (const c of countries) {
    c.tech = buildTech(c, seed);
    c.tech.rate = techRate(c);
  }
  const armies = [];
  for (const c of countries) armies.push(...buildArmies(c, seed));

  // §96: страна делится на области и республики — у каждой свой центр, ресурс и доход
  const byCountry = new Map();
  for (const c of allCities) {
    if (!byCountry.has(c.country)) byCountry.set(c.country, []);
    byCountry.get(c.country).push(c);
  }
  const regions = buildRegions(countries, seed);
  const usedCities = new Set();
  // §96: центр области — свой город страны, и у двух областей он не повторяется:
  // сначала берём ближайший свободный, потом уже любой ближайший
  for (const pass of [0, 1]) {
    for (const r of regions) {
      if (pass === 0 && r.cityId) continue;
      let best = null, bestD = Infinity;
      for (const c of (byCountry.get(r.country) || [])) {
        if (pass === 0 && usedCities.has(c.id)) continue;
        const d = Math.hypot(c.x - r.capital.x, c.y - r.capital.y);
        if (d < bestD) { bestD = d; best = c; }
      }
      if (best) {
        r.cityId = best.id;
        r.cityName = best.name;
        r.capital = { x: best.x, y: best.y };
        usedCities.add(best.id);
      }
    }
  }
  // §99: покров земли — леса, болота, горы, степи, пустыни и тундра. По нему видно,
  // где технике тяжело, а где она проходит ходом.
  const biomes = buildBiomes(lands, seed);
  // §103: внутри своей страны — её собственный рельеф с карты страны. Берег уже
  // трафаретный; теперь и покров за берегом тот же: где на карте страны горы,
  // лес или болото, там и на карте мира. За границей страны рельеф обычный,
  // мировой, поэтому за краем страны он продолжается как ни в чём не бывало.
  const shoreMap = lands[0] && lands[0].shore && lands[0].shore.toCountry;
  if (shoreMap && own && own.poly) {
    paintArea(biomes, own.poly, (x, y) => {
      const [cx, cy] = shoreMap(x, y);
      return countryKindAt(cx, cy);
    });
  }
  // §103: мировой рельеф внутри своей страны заменяем своим — иначе в стране стояли
  // бы отметки чужой погоды, а не её собственной
  const ownMarks = (() => {
    const base = marksOnLands(buildMarks(seed), lands);
    if (!own || !own.poly || !shoreMap) return base;
    const keep = [];
    for (let i = 0; i < base.length; i += 3) {
      if (pointInPolygon(base[i], base[i + 1], own.poly)) continue;
      keep.push(base[i], base[i + 1], base[i + 2]);
    }
    return Float32Array.from(keep);
  })();
  const w = {
    seed,
    sizeKm: WM.sizeKm,
    biomes,                  // §99: пятна покрова и их проходимость
    lands,                   // F-397: материки планеты — у каждого свой берег и свои страны
    regions,                 // §96: области и республики стран
    captures: [],            // §96: журнал захватов и отбитых областей
    coast: lands[0].poly,    // §95: наш материк — самый большой, он же в центре мира
    minutes: 0,
    countries,
    own,
    cities: allCities,
    roads: allRoads,
    marks: ownMarks, // F-362: отметки рельефа только на суше
    islands: buildIslands(seed, WM.islands, lands), // F-373: острова в океане, мимо материков
    oceans: oceanSpots(lands, WM.sizeKm),         // F-400: где подписывать океан
    caps: buildIceCaps(),                        // F-374: полярные льды
    armies,
    wars: [],
    pairs: adjacency(countries),
    explosions: [],
    destroyed: { cities: [], roads: [], bridges: [] },
    occupied: [],
    relations: null,        // заполняется ниже: до стран нужен adjacency
    aid: [],
    lastAidAt: 0,
    stats: { battles: 0, explosions: 0, killed: 0, big: 0, aid: 0, tech: 0 },
    rev: 0,                 // сколько раз мир менялся — по нему перерисовывается слой подробностей
    firstWarAt: null,
    techAt: 0               // до какой минуты наука уже досчитана
  };
  w.relations = buildRelations(countries, seed, w.pairs);
  buildAutonomy(w);                        // F-384: казна и правительство страны
  // быстрые индексы: страны по коду и соседи по стране. Не попадают в перебор и в JSON —
  // это ускорители шага войны (F-330), а не новые данные мира.
  Object.defineProperty(w, 'byId', {
    value: new Map(countries.map((c) => [c.id, c])), enumerable: false
  });
  const nb = new Map(countries.map((c) => [c.id, []]));
  for (const p of w.pairs) {
    nb.get(p.a).push(p.b);
    nb.get(p.b).push(p.a);
  }
  Object.defineProperty(w, 'neighbours', { value: nb, enumerable: false });
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
  // §95: страны на разных материках соседями быть не могут — их разделяет океан.
  // Заодно это главная экономия времени сборки мира.
  const box = (c) => {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const [x, y] of c.poly) {
      if (x < x0) x0 = x;
      if (y < y0) y0 = y;
      if (x > x1) x1 = x;
      if (y > y1) y1 = y;
    }
    return [x0, y0, x1, y1];
  };
  const boxes = countries.map(box);
  for (let i = 0; i < countries.length; i++) {
    for (let j = i + 1; j < countries.length; j++) {
      const a = countries[i], b = countries[j];
      if (a.land && b.land && a.land !== b.land) continue;
      const ba = boxes[i], bb = boxes[j];
      if (ba[0] > bb[2] + maxKm || bb[0] > ba[2] + maxKm
        || ba[1] > bb[3] + maxKm || bb[1] > ba[3] + maxKm) continue;
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

/* §96: пограничный переход должен стоять на суше: страны разделяет пролив,
   и середина между границами попадает в море. Если точка в воде — идём по линии
   к столице, пока не окажемся внутри своей или соседней страны; не нашли — пары нет. */
export function snapGate(gate, a, b, lands) {
  if (!gate || !Number.isFinite(gate.x) || !Number.isFinite(gate.y)) return null;
  const inLand = (x, y) => (lands || []).some((l) => pointInPolygon(x, y, l.poly));
  const onCountry = (x, y) => pointInPolygon(x, y, a.poly) || pointInPolygon(x, y, b.poly);
  if (inLand(gate.x, gate.y) && onCountry(gate.x, gate.y)) return gate;
  for (const cap of [a.capital, b.capital]) {
    for (let t = 0.05; t <= 1.001; t += 0.05) {
      const x = gate.x + (cap.x - gate.x) * t;
      const y = gate.y + (cap.y - gate.y) * t;
      if (inLand(x, y) && onCountry(x, y)) return { x, y };
    }
  }
  return null;
}

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
  const by = world.byId;
  for (const war of world.wars) {
    if (war.to !== null) continue;
    const a = by ? by.get(war.a) : world.countries.find((c) => c.id === war.a);
    const b = by ? by.get(war.b) : world.countries.find((c) => c.id === war.b);
    if (!a || !b) { war.to = minutes; continue; }
    const k = Math.floor((minutes - war.from) / WM.war.battleMin);
    if (k <= war.lastStep) { continue; }
    war.lastStep = k;
    // §89: технологии стран идут в бой — броня, связь и выучка сильнее голой численности
    const ea = a.tech && a.tech.eff ? a.tech.eff : null;
    const eb = b.tech && b.tech.eff ? b.tech.eff : null;
    const sa = a.strength * (ea ? ea.army : 1);
    const sb = b.strength * (eb ? eb.army : 1);
    // F-297: перевес — из силы стран и хеша: война идёт рывками
    const balance = (sa - sb) + (hash01(world.seed + k * 13 + idToInt(war.id), 113) * 2 - 1) * 0.8;
    war.sway += balance * WM.war.frontSpeedKm * 0.35;
    // сильная страна теснит слабую: фронт не топчется на месте, а ползёт вглубь
    war.drift += (sa - sb) * 9;
    // F-328: точность ракет — общая на пару воюющих: выше точность, кучнее взрывы и дальше цель
    const acc = ((ea ? ea.accuracy : 1) + (eb ? eb.accuracy : 1)) / 2;
    const spread = missileSpread(acc);
    const reach = missileReach(acc);
    war.x = war.baseX + (war.ax || 1) * (war.sway + war.drift);
    war.y = war.baseY + (war.ay || 0) * (war.sway + war.drift);
    war.battles++;
    world.stats.battles++;
    // взрыв: большой — каждый четвёртый
    const big = k % WM.war.bigEvery === 0;
    const ex = {
      id: war.id + '-e' + k,
      x: war.x + (hash01(world.seed + k, 127) * 2 - 1) * spread,
      y: war.y + (hash01(world.seed + k, 131) * 2 - 1) * spread,
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
      const victim = nearestCity(world, ex.x, ex.y, reach);
      if (victim && !world.destroyed.cities.includes(victim.id)) { world.destroyed.cities.push(victim.id); world.rev++; }
      const road = nearestRoad(world, ex.x, ex.y, Math.round(reach * 0.75));
      if (road && !world.destroyed.roads.includes(road.id)) {
        world.destroyed.roads.push(road.id);
        // дорога с мостом, разорванная войной, — это ещё и разрушенный мост
        if (road.bridge && !world.destroyed.bridges.includes(road.id)) world.destroyed.bridges.push(road.id);
        world.rev++;
      }
    }
    // §96: война забирает области. Фронт давит на ближайшую область проигрывающей
    // стороны; когда давление перевесит — область переходит победителю вместе с ресурсом,
    // а если хозяин оттеснит фронт обратно, он её отобьёт.
    {
      // ближайшая область одной из воюющих стран: фронт давит на неё, даже если ушёл вглубь.
      // Дальняя область давится медленнее — фронт теряет силу на расстоянии.
      const near = nearestRegion(world.regions, war.x, war.y, (r) => r.owner === war.a || r.owner === war.b);
      if (near) {
        const winner = balance > 0 ? war.a : war.b;
        const close = near.km < 700 ? 1 : Math.max(0.35, 1 - (near.km - 700) / 3200);
        const ev = pressRegion(near.region, winner, balance * close, minutes);
        if (ev) {
          world.captures.push({
            id: ev.kind + '-' + ev.region.id + '-' + minutes,
            kind: ev.kind, region: ev.region.id, name: ev.region.name,
            from: ev.from, to: ev.to, at: minutes
          });
          if (world.captures.length > 30) world.captures.shift();
          world.rev++;
        }
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
    const home = by ? by.get(army.country) : world.countries.find((c) => c.id === army.country);
    // F-329: боеготовность считается от технологий и затянутости войны — не от кадров экрана
    army.morale = armyPower(home, world);
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
  // §88: отношения живут тем же шагом, что и война
  advanceDiplomacy(world, minutes);
  // §89: наука стран идёт тем же шагом — баллы копятся по игровым минутам
  advanceTech(world, minutes);
  // F-389: страна живёт сама — казна, города, армии и ремонт идут вместе с часами игры,
  // в том числе когда окно не в фокусе (часы тикают без отрисовки)
  advanceAutonomy(world, minutes);
  return fresh;
}

/* §96: какая область накрывает мировую точку. */
/* §99: страна под точкой — по границам, без канвы. */
export function countryAtWorld(world, x, y) {
  if (!world || !world.countries) return null;
  for (const c of world.countries) if (pointInPolygon(x, y, c.poly)) return c;
  return null;
}

/* §99: насколько тяжело технике в точке — 1 сухо и ровно, 0,25 болото, 0 вода. */
export function passabilityAtWorld(world, x, y) {
  if (!world || !world.biomes) return 0;
  const land = (world.lands || []).find((l) => pointInPolygon(x, y, l.poly));
  return passabilityAt(world.biomes, x, y, land || null);
}

/* §99: какой покров под точкой — «лес», «болото», «горы» и так далее. */
export function biomeAtWorld(world, x, y) {
  if (!world || !world.biomes) return null;
  const b = biomeAt(world.biomes, x, y);
  return b ? { kind: b.kind, name: BIOMES.kinds[b.kind].name, pass: BIOMES.kinds[b.kind].pass, blob: b } : null;
}

export function regionAt(world, x, y) {
  if (!world || !world.regions) return null;
  return findRegion(world.regions, x, y);
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
  const see = canSeeArmies(world, observerId);       // F-330: один раз, а не два
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
    satellite: see,
    armiesVisible: see ? world.armies.length : world.armies.filter((a) => a.country === observerId).length,
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
