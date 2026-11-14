/* Города 2D по §9–§10: класс поселения, улицы, кварталы и здания из библиотеки §10.
   Всё процедурное и детерминированное — один и тот же город собирается одинаково при каждом
   подходе камеры; Math.random не используется (§16.1). */
import { WORLD2D, heightKm, settlements, rankSettlements } from './world2d.js';
import { rng } from './transport2d.js';

/* R-9.1: классы поселений. Население — из таблицы, радиус — от населения (F-125). */
export const CITY_CLASS = {
  capital: { id: 'capital', name: 'столица',       pop: 12000000, floors: [5, 24], blockM: 260, tone: '#d9d4c8' },
  city:    { id: 'city',    name: 'крупный город', pop: 2500000,  floors: [3, 12], blockM: 300, tone: '#d5d0c4' },
  town:    { id: 'town',    name: 'средний город', pop: 400000,   floors: [2, 6],  blockM: 340, tone: '#d2ccbd' },
  small:   { id: 'small',   name: 'малый город',   pop: 60000,    floors: [1, 4],  blockM: 380, tone: '#cec8b8' },
  village: { id: 'village', name: 'деревня',       pop: 3000,     floors: [1, 2],  blockM: 460, tone: '#c9c3b2' }
};

/* §9.1: в городах живёт примерно четверть страны, остальные — в сельской местности. */
export const RURAL_PER_URBAN = 3.2;

/* §10.2: библиотека зданий — тип, этажность, цвет стен и крыши, размер пятна. */
export const BUILDING = {
  panel9:   { name: 'панельная 9-этажка', wM: 42, dM: 14, floors: 9,  wall: '#b9bcc0', roof: '#8d9196' },
  brick5:   { name: 'кирпичная 5-этажка', wM: 34, dM: 13, floors: 5,  wall: '#b98b6e', roof: '#8a6250' },
  stalinka: { name: 'сталинка',           wM: 30, dM: 15, floors: 6,  wall: '#d8c9a8', roof: '#6f6355' },
  tower:    { name: 'башня',              wM: 20, dM: 20, floors: 22, wall: '#9fb4c4', roof: '#6c7d8b' },
  house:    { name: 'частный дом',        wM: 11, dM: 9,  floors: 2,  wall: '#d9cfae', roof: '#a3523c' },
  dacha:    { name: 'дача',               wM: 8,  dM: 7,  floors: 1,  wall: '#cfc7a8', roof: '#8a6a45' },
  school:   { name: 'школа',              wM: 46, dM: 20, floors: 3,  wall: '#e0d6c0', roof: '#7a7f74' },
  shop:     { name: 'магазин',            wM: 18, dM: 12, floors: 1,  wall: '#e2d8c2', roof: '#6f7a72' },
  plant:    { name: 'завод',              wM: 64, dM: 34, floors: 2,  wall: '#a9a49a', roof: '#7c8078' },
  church:   { name: 'церковь',            wM: 12, dM: 12, floors: 1,  wall: '#efe6cf', roof: '#8f7f5c' }
};

/* F-125: радиус застройки — от населения: r = 0.8 + 1.5·log10(население/1000) км, 0.5…7 км. */
export function cityRadiusKm(pop) {
  const r = 0.8 + 1.5 * Math.log10(Math.max(200, pop) / 1000);
  return Math.max(0.5, Math.min(9, r));
}

/* Ранг поселения по §42.2: столица → хаб → прочие. */
export function classFor(town, index, ranks) {
  if (index === ranks.capital) return 'capital';
  if (ranks.hubSet.has(index)) return 'city';
  const h = heightKm(town.x, town.y);
  const near = town.pop ? 'town' : null;
  const k = ((index * 37) % 11) / 11;           // детерминированная «крупность»
  if (k < 0.22) return 'town';
  if (k < 0.6) return 'small';
  return near || 'village';
}

/* F-126: население класса — с разбросом ±35 %, детерминированным номером поселения. */
export function cityPopulation(cls, index) {
  const base = CITY_CLASS[cls].pop;
  const k = ((index * 61) % 17) / 17;            // 0…1
  return Math.round(base * (0.65 + 0.7 * k));
}

/* Город целиком: улицы, кварталы, здания. Кэшируется вызывающим по номеру поселения. */
export function buildCity(town, index, ranks) {
  const cls = classFor(town, index, ranks);
  const spec = CITY_CLASS[cls];
  const pop = cityPopulation(cls, index);
  const radiusKm = cityRadiusKm(pop);
  const rand = rng(0x51ed + index * 7919);
  const angle = rand() * Math.PI;                       // своя ориентация сетки
  const ca = Math.cos(angle), sa = Math.sin(angle);

  // координаты: u — вдоль главной оси, v — поперёк, в километрах от центра
  const toWorld = (u, v) => [town.x + u * ca - v * sa, town.y + u * sa + v * ca];

  const streets = [];
  const blocks = [];
  const buildings = [];
  const blockKm = spec.blockM / 1000;
  const half = radiusKm;
  const n = Math.max(2, Math.min(26, Math.round((half * 2) / blockKm)));

  // граница города не круглая: радиус «дышит» по углам (лесопарки, овраги, река)
  const lobes = [rand() * 6.28, rand() * 6.28, rand() * 6.28];
  const radiusAt = (ang) => half * (0.72 + 0.14 * Math.sin(ang * 2 + lobes[0]) + 0.1 * Math.sin(ang * 3 + lobes[1]) + 0.06 * Math.sin(ang * 5 + lobes[2]));

  // сетка улиц: режем плоскость линиями u = const и v = const в пределах круга
  const lines = [];
  // шаг кварталов растёт к окраине: в центре плотно, на выезде — частный сектор
  const jitter = () => (rand() - 0.5) * blockKm * 0.22;
  const uLines = [];
  for (let i = -n; i <= n; i++) {
    const u = i * blockKm + jitter();
    if (Math.abs(u) > half) continue;
    const halfChord = Math.sqrt(Math.max(0, half * half - u * u));
    if (halfChord < blockKm * 0.4) continue;
    uLines.push({ at: u, from: -halfChord, to: halfChord });
  }
  const vLines = [];
  for (let j = -n; j <= n; j++) {
    const v = j * blockKm + jitter();
    if (Math.abs(v) > half) continue;
    const halfChord = Math.sqrt(Math.max(0, half * half - v * v));
    if (halfChord < blockKm * 0.4) continue;
    vLines.push({ at: v, from: -halfChord, to: halfChord });
  }
  for (const L of uLines) lines.push({ dir: 0, ...L });
  for (const L of vLines) lines.push({ dir: 1, ...L });
  for (const L of lines) {
    // концы улицы подрезаем по «дышащей» границе города
    const angA = L.dir === 0 ? Math.atan2(L.from, L.at) : Math.atan2(L.at, L.from);
    const angB = L.dir === 0 ? Math.atan2(L.to, L.at) : Math.atan2(L.at, L.to);
    const chordA = Math.hypot(L.dir === 0 ? L.at : L.from, L.dir === 0 ? L.from : L.at);
    const chordB = Math.hypot(L.dir === 0 ? L.at : L.to, L.dir === 0 ? L.to : L.at);
    const kA = Math.min(1, radiusAt(angA) / Math.max(1e-6, chordA));
    const kB = Math.min(1, radiusAt(angB) / Math.max(1e-6, chordB));
    const from = L.from * kA, to = L.to * kB;
    if (Math.abs(to - from) < blockKm * 0.5) continue;
    const a = L.dir === 0 ? toWorld(L.at, from) : toWorld(from, L.at);
    const b = L.dir === 0 ? toWorld(L.at, to) : toWorld(to, L.at);
    L.from = from; L.to = to;
    // R-9.6: главные улицы шире, переулки уже
    const major = L.dir === 0 ? Math.abs(L.at) < blockKm * 0.6 : Math.abs(L.at) < blockKm * 0.6;
    streets.push({ a, b, widthM: major ? 18 : 9, major, cls: major ? 'street' : 'lane' });
  }

  // радиальные проспекты: 3–4 луча из центра (R-9.6: иерархия улиц)
  const rays = cls === 'capital' || cls === 'city' ? 4 : 2;
  for (let r = 0; r < rays; r++) {
    const ang = angle + (r / rays) * Math.PI + 0.3 * rand();
    const len = radiusAt(ang) * 0.98;
    streets.push({
      a: toWorld(0, 0),
      b: toWorld(Math.cos(ang) * len, Math.sin(ang) * len),
      widthM: 24, major: true, cls: 'avenue'
    });
  }

  // кварталы: в каждой клетке между соседними улицами (§10.1)
  const maxFloors = spec.floors[1];
  const minFloors = spec.floors[0];
  for (let i = -n; i < n; i++) {
    for (let j = -n; j < n; j++) {
      const u0 = i * blockKm, v0 = j * blockKm;
      const uc = u0 + blockKm / 2, vc = v0 + blockKm / 2;
      const angc = Math.atan2(vc, uc);
      const dc = Math.hypot(uc, vc);
      const rim = radiusAt(angc);
      if (dc > rim - blockKm * 0.45) continue;
      const edge = 1 - dc / Math.max(1e-6, rim);              // 1 в центре, 0 на краю
      if (rand() > 0.25 + 0.7 * edge) continue;               // к краю застройка реже
      const w = blockKm * (0.62 + 0.16 * rand());
      const h = blockKm * (0.62 + 0.16 * rand());
      const cu = uc + (rand() - 0.5) * blockKm * 0.12;
      const cv = vc + (rand() - 0.5) * blockKm * 0.12;
      const corners = [toWorld(cu - w / 2, cv - h / 2), toWorld(cu + w / 2, cv - h / 2), toWorld(cu + w / 2, cv + h / 2), toWorld(cu - w / 2, cv + h / 2)];
      blocks.push({ corners, center: toWorld(cu, cv), floors: Math.round(minFloors + (maxFloors - minFloors) * edge), w, h, cu, cv, edge });
    }
  }

  // здания: застройка по периметру квартала с двором внутри (R-10.2), бюджет на город
  const budget = cls === 'capital' ? 2100 : cls === 'city' ? 1300 : cls === 'town' ? 620 : 340;
  const perBlock = Math.max(2, Math.min(18, Math.round(budget / Math.max(1, blocks.length))));
  const emit = (type, bu, bv, bw, bd, turn) => {
    const sp = BUILDING[type];
    const cos = Math.cos(turn), sin = Math.sin(turn);
    const pt = (du, dv) => toWorld(bu + du * cos - dv * sin, bv + du * sin + dv * cos);
    buildings.push({
      type, corners: [pt(-bw / 2, -bd / 2), pt(bw / 2, -bd / 2), pt(bw / 2, bd / 2), pt(-bw / 2, bd / 2)],
      center: toWorld(bu, bv), floors: sp.floors, wall: sp.wall, roof: sp.roof, wM: bw * 1000, dM: bd * 1000,
      name: sp.name
    });
  };
  for (const bl of blocks) {
    const { cu, cv, w, h, edge } = bl;
    if (perBlock <= 1) {
      const type = pickBuilding(cls, edge, rand);
      const sp = BUILDING[type];
      const bw = Math.min(w * 0.8, (sp.wM / 1000) * (0.9 + 0.3 * rand()));
      const bd = Math.min(h * 0.8, (sp.dM / 1000) * (0.9 + 0.3 * rand()));
      emit(type, cu + (rand() - 0.5) * (w - bw), cv + (rand() - 0.5) * (h - bd), bw, bd, angle);
      continue;
    }
    // обход периметра: дома ставятся лицом к улице, двор остаётся пустым
    const per = 2 * (w + h);
    for (let k = 0; k < perBlock; k++) {
      const t = ((k + 0.5) / perBlock) * per;
      let pu, pv, turn;
      if (t < w) { pu = cu - w / 2 + t; pv = cv - h / 2; turn = 0; }
      else if (t < w + h) { pu = cu + w / 2; pv = cv - h / 2 + (t - w); turn = Math.PI / 2; }
      else if (t < 2 * w + h) { pu = cu + w / 2 - (t - w - h); pv = cv + h / 2; turn = 0; }
      else { pu = cu - w / 2; pv = cv + h / 2 - (t - 2 * w - h); turn = Math.PI / 2; }
      const type = pickBuilding(cls, edge, rand);
      const sp = BUILDING[type];
      const span = (per / perBlock) * 0.94;
      const bw = Math.min(span, (sp.wM / 1000) * (0.9 + 0.25 * rand()));
      const bd = Math.min(h * 0.42, (sp.dM / 1000) * (0.9 + 0.25 * rand()));
      // внутрь квартала: нормаль к стороне
      const nu = (cu - pu), nv = (cv - pv);
      const nl = Math.hypot(nu, nv) || 1;
      const off = bd / 2 + Math.min(w, h) * 0.04;
      emit(type, pu + (nu / nl) * off, pv + (nv / nl) * off, bw, bd, angle + turn);
    }
    // редкие общественные здания во дворе
    if (rand() < 0.12 + 0.2 * (1 - edge)) {
      const type = rand() < 0.45 ? 'school' : rand() < 0.6 ? 'shop' : 'church';
      const sp = BUILDING[type];
      const bw = Math.min(w * 0.5, sp.wM / 1000), bd = Math.min(h * 0.5, sp.dM / 1000);
      emit(type, cu, cv, bw, bd, angle);
    }
  }

  // деревня не влезает в сетку — ставим дома вдоль одной улицы (§9.1: «одна главная улица»)
  if (buildings.length < 3) {
    const len = Math.max(0.35, radiusKm * 1.6);
    const count = 6 + Math.floor(rand() * 8);
    streets.length = 0;
    streets.push({ a: toWorld(-len, 0), b: toWorld(len, 0), widthM: 8, major: true, cls: 'street' });
    for (let k = 0; k < count; k++) {
      const u = -len + (2 * len) * (k / count) + (rand() - 0.5) * 0.05;
      const side = k % 2 === 0 ? 1 : -1;
      const type = rand() < 0.8 ? 'house' : 'dacha';
      const spec2 = BUILDING[type];
      const bw = spec2.wM / 1000, bd = spec2.dM / 1000;
      const v = side * (bd * 0.9 + 0.012);
      buildings.push({
        type, corners: [toWorld(u - bw / 2, v - bd / 2), toWorld(u + bw / 2, v - bd / 2), toWorld(u + bw / 2, v + bd / 2), toWorld(u - bw / 2, v + bd / 2)],
        center: toWorld(u, v), floors: spec2.floors, wall: spec2.wall, roof: spec2.roof, wM: spec2.wM, dM: spec2.dM
      });
    }
  }

  // потолок на город: при 18 px/км мельче 1 px всё равно не различить (R-10.3)
  const hardCap = cls === 'capital' ? 2400 : cls === 'city' ? 1500 : 700;
  if (buildings.length > hardCap) buildings.length = hardCap;

  return { index, name: town.name, x: town.x, y: town.y, cls, clsName: spec.name, pop, radiusKm, angle, streets, blocks, buildings, h: heightKm(town.x, town.y) };
}

function pickBuilding(cls, edge, rand) {
  const r = rand();
  if (cls === 'capital') {
    if (edge > 0.75) return r < 0.45 ? 'tower' : r < 0.8 ? 'panel9' : 'shop';
    if (edge > 0.4) return r < 0.5 ? 'panel9' : r < 0.7 ? 'brick5' : r < 0.85 ? 'school' : 'shop';
    return r < 0.55 ? 'house' : r < 0.75 ? 'brick5' : r < 0.9 ? 'plant' : 'dacha';
  }
  if (cls === 'city') {
    if (edge > 0.7) return r < 0.5 ? 'panel9' : r < 0.8 ? 'brick5' : 'shop';
    if (edge > 0.35) return r < 0.45 ? 'brick5' : r < 0.7 ? 'stalinka' : r < 0.85 ? 'school' : 'shop';
    return r < 0.6 ? 'house' : r < 0.85 ? 'dacha' : 'plant';
  }
  if (cls === 'town') {
    if (edge > 0.7) return r < 0.4 ? 'brick5' : r < 0.6 ? 'stalinka' : r < 0.8 ? 'shop' : 'school';
    return r < 0.65 ? 'house' : r < 0.85 ? 'dacha' : 'plant';
  }
  if (cls === 'small') return r < 0.6 ? 'house' : r < 0.8 ? 'dacha' : r < 0.92 ? 'shop' : 'school';
  return r < 0.75 ? 'house' : r < 0.9 ? 'dacha' : 'church';
}

/* F-127: масштаб, с которого город раскрывается. Кварталы и улицы — с 3 px/км (квартал 260 м
   это уже 0.8 px), отдельные здания — с 18 px/км (дом 42 м это 0.8 px, с обводкой читается). */
export const CITY_STREET_SCALE = 3;
export const CITY_BUILDING_SCALE = 18;
export function cityLod(scale) {
  return scale >= CITY_BUILDING_SCALE ? 2 : scale >= CITY_STREET_SCALE ? 1 : 0;
}

/* Сводка по стране: сколько городов каждого класса и сколько жителей. */
export function cityCensus(towns = settlements(), hubCount = 10) {
  const ranks = rankSettlements(towns, hubCount);
  const byClass = { capital: 0, city: 0, town: 0, small: 0, village: 0 };
  let urban = 0;
  for (let i = 0; i < towns.length; i++) {
    const cls = classFor(towns[i], i, ranks);
    byClass[cls]++;
    urban += cityPopulation(cls, i);
  }
  return { byClass, urban, rural: Math.round(urban * RURAL_PER_URBAN), population: Math.round(urban * (1 + RURAL_PER_URBAN)), towns: towns.length };
}
