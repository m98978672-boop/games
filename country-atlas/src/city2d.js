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

/* R-52.7: обводка дома. Дом мельче 1.6 px читается светлой точкой на светлом квартале,
   поэтому его всегда обводим; крышу рисуем, только когда пятно ≥ 3 px. */
export function buildingOutlinePx(spanPx) {
  if (!(spanPx >= 1.6)) return 0;
  return spanPx >= 3 ? 0.6 : 0.35;
}

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
/* §9.9: зонирование кварталов — тип, цвет заливки и правила застройки. */
export const ZONE = {
  plaza:      { name: 'площадь',        fill: 'rgba(216,206,184,0.72)' },
  center:     { name: 'центр',          fill: 'rgba(200,187,163,0.64)' },
  mid:        { name: 'жилой',          fill: 'rgba(190,181,159,0.52)' },
  private:    { name: 'частный сектор', fill: 'rgba(178,172,148,0.40)' },
  park:       { name: 'парк',           fill: 'rgba(96,132,80,0.68)'   },
  industrial: { name: 'промзона',       fill: 'rgba(148,146,138,0.56)' }
};

/* R-10.1: пятно здания — прямоугольник, Г или П. Возвращает контур в локальных осях:
   x — вдоль фасада (ширина), y — в глубину квартала. */
export function footprint(shape, w, d) {
  const hw = w / 2, hd = d / 2;
  if (shape === 'L') {
    return [[-hw, -hd], [hw, -hd], [hw, -hd + d * 0.45], [-hw + w * 0.45, -hd + d * 0.45], [-hw + w * 0.45, hd], [-hw, hd]];
  }
  if (shape === 'U') {
    return [[-hw, -hd], [hw, -hd], [hw, hd], [hw - w * 0.32, hd], [hw - w * 0.32, hd - d * 0.5],
      [-hw + w * 0.32, hd - d * 0.5], [-hw + w * 0.32, hd], [-hw, hd]];
  }
  if (shape === 'T') {
    return [[-hw, -hd], [hw, -hd], [hw, -hd + d * 0.4], [w * 0.18, -hd + d * 0.4], [w * 0.18, hd], [-w * 0.18, hd], [-w * 0.18, -hd + d * 0.4], [-hw, -hd + d * 0.4]];
  }
  return [[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd]];
}

/* Тип здания по зоне квартала (§9.9–§9.11, §10.4–§10.6). */
function pickByZone(zone, rand) {
  const r = rand();
  if (zone === 'center') return r < 0.3 ? 'tower' : r < 0.55 ? 'panel9' : r < 0.72 ? 'stalinka' : r < 0.85 ? 'brick5' : r < 0.93 ? 'shop' : 'school';
  if (zone === 'mid') return r < 0.42 ? 'panel9' : r < 0.68 ? 'brick5' : r < 0.8 ? 'stalinka' : r < 0.9 ? 'school' : 'shop';
  if (zone === 'private') return r < 0.72 ? 'house' : r < 0.9 ? 'dacha' : 'shop';
  if (zone === 'industrial') return r < 0.62 ? 'plant' : 'shop';
  if (zone === 'plaza') return r < 0.5 ? 'church' : r < 0.8 ? 'stalinka' : 'shop';
  return 'house';
}

function shapeFor(zone, rand) {
  const r = rand();
  if (zone === 'center') return r < 0.55 ? 'rect' : r < 0.75 ? 'L' : r < 0.9 ? 'T' : 'U';
  if (zone === 'mid') return r < 0.7 ? 'rect' : r < 0.88 ? 'L' : 'U';
  if (zone === 'industrial') return r < 0.5 ? 'rect' : r < 0.8 ? 'L' : 'U';
  return r < 0.92 ? 'rect' : 'L';
}

/* Планировка города (§9.4–§9.5): основа — сетка кварталов с неровным шагом,
   поверх неё бульварное кольцо и радиальные проспекты, в центре — площадь,
   по краям — частный сектор, отдельным сектором — промзона, плюс парки.
   Кварталы застраиваются по периметру зданиями формы прямоугольник / Г / П / Т (§10.1). */
export function buildCity(town, index, ranks) {
  const cls = classFor(town, index, ranks);
  const spec = CITY_CLASS[cls];
  const pop = cityPopulation(cls, index);
  const radiusKm = cityRadiusKm(pop);
  const rand = rng(0x51ed + index * 7919);
  const angle = rand() * Math.PI;
  const ca = Math.cos(angle), sa = Math.sin(angle);
  const toWorld = (u, v) => [town.x + u * ca - v * sa, town.y + u * sa + v * ca];

  const streets = [];
  const blocks = [];
  const buildings = [];
  const blockKm = spec.blockM / 1000;
  const half = radiusKm;
  const lobes = [rand() * 6.28, rand() * 6.28, rand() * 6.28];
  // граница застройки «дышит» — город не круг и не квадрат
  const radiusAt = (ang) => half * (0.76 + 0.12 * Math.sin(ang * 2 + lobes[0]) + 0.08 * Math.sin(ang * 3 + lobes[1]) + 0.05 * Math.sin(ang * 5 + lobes[2]));
  const cap = cls === 'capital' ? 12000 : cls === 'city' ? 8000 : cls === 'town' ? 2600 : cls === 'small' ? 900 : 240;
  const isBig = cls === 'capital' || cls === 'city' || cls === 'town';

  const pushBuilding = (type, corners, center, floors, wM, dM, shape, zone) => {
    if (buildings.length >= cap) return;
    const sp = BUILDING[type];
    buildings.push({ type, shape, zone, corners, center, floors, wall: sp.wall, roof: sp.roof, wM, dM, name: sp.name });
  };

  /* --- 1. Сетка улиц: неровный шаг, лёгкая волна — вместо чертёжной доски --- */
  const n = Math.max(2, Math.min(26, Math.round((half * 1.55) / blockKm)));
  const jitter = () => (rand() - 0.5) * blockKm * 0.3;
  const uLines = [], vLines = [];
  for (let i = -n; i <= n; i++) {
    const at = i * blockKm + jitter();
    if (Math.abs(at) > half * 1.05) continue;
    uLines.push(at);
  }
  for (let j = -n; j <= n; j++) {
    const at = j * blockKm + jitter();
    if (Math.abs(at) > half * 1.05) continue;
    vLines.push(at);
  }
  const wave = (fixed, dir) => {
    // улица — не идеальная прямая: 5 точек со слабой волной (радиус поворота ≥ 6 м, R-9.5)
    const pts = [];
    const len = radiusAt(0) * 1.05;
    const phase = rand() * 6.28;
    for (let k = 0; k <= 6; k++) {
      const t = -1 + (2 * k) / 6;
      const s = t * len;
      const off = Math.sin(t * Math.PI * 1.2 + phase) * blockKm * 0.06;
      const u = dir === 0 ? fixed + off : s;
      const v = dir === 0 ? s : fixed + off;
      const d = Math.hypot(u, v);
      const rim = radiusAt(Math.atan2(v, u)) * 0.99;
      const kk = Math.min(1, rim / Math.max(1e-6, d));
      pts.push(toWorld(u * kk, v * kk));
    }
    return pts;
  };
  for (const at of uLines) {
    const major = Math.abs(at) < blockKm * 0.7 || Math.abs(Math.abs(at) - blockKm * 4) < blockKm * 0.4;
    streets.push({ pts: wave(at, 0), widthM: major ? 22 : 10, major, cls: major ? 'street' : 'lane' });
  }
  for (const at of vLines) {
    const major = Math.abs(at) < blockKm * 0.7 || Math.abs(Math.abs(at) - blockKm * 3) < blockKm * 0.4;
    streets.push({ pts: wave(at, 1), widthM: major ? 22 : 10, major, cls: major ? 'street' : 'lane' });
  }

  /* --- 2. Бульварные кольца и радиальные проспекты (R-9.4: город растёт кольцами) --- */
  if (isBig) {
    const rings = cls === 'capital' ? [2.3, 4.6] : cls === 'city' ? [2.6] : [3.2];
    for (const mult of rings) {
      const r = blockKm * mult;
      const pts = [];
      const N = Math.max(28, Math.round((2 * Math.PI * r) / 0.6));
      for (let i = 0; i <= N; i++) {
        const ang = (i / N) * Math.PI * 2;
        const rr = r * (1 + 0.05 * Math.sin(ang * 3 + lobes[0]) + 0.03 * Math.sin(ang * 5 + lobes[1]));
        if (rr > radiusAt(ang) * 0.99) continue;
        pts.push(toWorld(Math.cos(ang) * rr, Math.sin(ang) * rr));
      }
      if (pts.length > 4) streets.push({ pts, widthM: 28, major: true, cls: 'avenue' });
    }
    const rays = cls === 'capital' ? 6 : cls === 'city' ? 5 : 3;
    for (let s2 = 0; s2 <= rays; s2++) {
      const ang = (s2 / rays) * Math.PI * 2 + (rand() - 0.5) * 0.25;
      const rEnd = radiusAt(ang) * 0.96;
      const pts = [];
      for (let i = 0; i <= 6; i++) {
        const t = i / 6;
        const r = blockKm * 0.4 + (rEnd - blockKm * 0.4) * t;
        const a = ang + Math.sin(t * Math.PI) * (rand() - 0.5) * 0.12;
        pts.push(toWorld(Math.cos(a) * r, Math.sin(a) * r));
      }
      streets.push({ pts, widthM: 30, major: true, cls: 'avenue' });
    }
  }

  /* --- 3. Кварталы: клетки сетки с зонированием (§9.9) --- */
  const industrialSector = Math.floor(rand() * 6);
  for (let i = 0; i < uLines.length - 1; i++) {
    for (let j = 0; j < vLines.length - 1; j++) {
      const u0 = uLines[i], u1 = uLines[i + 1], v0 = vLines[j], v1 = vLines[j + 1];
      const uc = (u0 + u1) / 2, vc = (v0 + v1) / 2;
      const dc = Math.hypot(uc, vc);
      const angc = Math.atan2(vc, uc);
      const rim = radiusAt(angc);
      if (dc > rim - blockKm * 0.5) continue;                  // за границей застройки
      const outside = dc / Math.max(1e-6, rim);                // 0 в центре, 1 на краю
      const sector = Math.floor(((angc + Math.PI * 2) % (Math.PI * 2)) / (Math.PI / 3));
      let zone;
      const rr = rand();
      if (dc < blockKm * 1.2 && isBig) zone = rr < 0.55 ? 'plaza' : 'center';
      else if (sector === industrialSector && outside > 0.45) zone = 'industrial';
      else if (rr < 0.06) zone = 'park';
      else if (outside > 0.72) zone = 'private';
      else if (outside > 0.4) zone = 'mid';
      else zone = 'center';
      // квартал — прямоугольник, но с подрезанным углом, если выходит за границу
      const corners = [];
      const inset = 0.06 * blockKm;
      const quad = [
        [u0 + inset, v0 + inset], [u1 - inset, v0 + inset],
        [u1 - inset, v1 - inset], [u0 + inset, v1 - inset]
      ];
      for (const [u, v] of quad) {
        const d = Math.hypot(u, v);
        const lim = radiusAt(Math.atan2(v, u)) * 0.995;
        const kk = Math.min(1, lim / Math.max(1e-6, d));
        corners.push(toWorld(u * kk, v * kk));
      }
      const floors = Math.max(1, Math.round(spec.floors[0] + (spec.floors[1] - spec.floors[0]) * Math.pow(1 - outside, 1.4)));
      blocks.push({ corners, center: toWorld(uc, vc), zone, floors, outside, uc, vc, blockKm });
    }
  }

  /* --- 4. Застройка кварталов по периметру, двор внутри (§10.1).
     Бюджет дома делится на все кварталы сразу, иначе он кончается в первом углу карты. --- */
  const buildable = blocks.filter((b) => b.zone !== 'park');
  const spacingFor = { center: 0.05, mid: 0.055, private: 0.032, industrial: 0.11, plaza: 0.09 };
  // считаем, сколько домов дала бы сплошная застройка, и подрезаем шаг равномерно по всему городу
  let wanted = 0;
  for (const b of buildable) {
    let per = 0;
    for (let e = 0; e < 4; e++) { const a = b.corners[e], c2 = b.corners[(e + 1) % 4]; per += Math.hypot(c2[0] - a[0], c2[1] - a[1]); }
    wanted += Math.max(2, Math.min(48, Math.round(per / (spacingFor[b.zone] || 0.06))));
  }
  const fit = wanted > cap ? cap / wanted : 1;
  for (const blk of buildable) {
    const { corners, zone, uc, vc } = blk;
    {
      /* периметр квартала */
      const per = [];
      for (let e = 0; e < 4; e++) {
        const a = corners[e], b = corners[(e + 1) % 4];
        const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
        if (len < 0.01) continue;
        per.push({ a, b, len });
      }
      const totalPer = per.reduce((s2, e) => s2 + e.len, 0);
      // шаг застройки — по длине дома: дома стоят стеной к улице, как в настоящем городе
      const count = Math.max(1, Math.round(Math.min(48, totalPer / (spacingFor[zone] || 0.06)) * fit));
      for (let k = 0; k < count; k++) {
        if (rand() < 0.1) continue;                             // разрывы в застройке
        const t = ((k + 0.5) / count) * totalPer;
        let acc = 0, seg = per[0];
        for (const e of per) { if (t <= acc + e.len) { seg = e; break; } acc += e.len; }
        const tt = Math.min(1, Math.max(0, (t - acc) / seg.len));
        const px2 = seg.a[0] + (seg.b[0] - seg.a[0]) * tt;
        const py2 = seg.a[1] + (seg.b[1] - seg.a[1]) * tt;
        const nx = seg.b[1] - seg.a[1], ny = -(seg.b[0] - seg.a[0]);
        const nl = Math.hypot(nx, ny) || 1;
        // нормаль внутрь квартала
        const cx2 = (corners[0][0] + corners[2][0]) / 2, cy2 = (corners[0][1] + corners[2][1]) / 2;
        const inward = (cx2 - px2) * nx + (cy2 - py2) * ny > 0 ? 1 : -1;
        const type = pickByZone(zone, rand);
        const shape = shapeFor(zone, rand);
        const sp = BUILDING[type];
        const w = Math.min((totalPer / count) * 0.9, (sp.wM / 1000) * (0.85 + 0.3 * rand()));
        const d = Math.min(blockKm * 0.34, (sp.dM / 1000) * (0.85 + 0.3 * rand()));
        const off = d * 0.55 + 0.008;
        const bu = px2 + (nx / nl) * off * inward, bv = py2 + (ny / nl) * off * inward;
        const turn = Math.atan2(seg.b[1] - seg.a[1], seg.b[0] - seg.a[0]);
        const cosT = Math.cos(turn), sinT = Math.sin(turn);
        const cu = bu - town.x, cv = bv - town.y;               // обратно в локальные оси
        const lu = cu * ca + cv * sa, lv = -cu * sa + cv * ca;
        const corners2 = footprint(shape, w, d).map(([du, dv]) => toWorld(lu + du * cosT - dv * sinT, lv + du * sinT + dv * cosT));
        pushBuilding(type, corners2, toWorld(lu, lv), Math.max(1, Math.round(sp.floors * (zone === 'center' ? 1.25 : 1))), w * 1000, d * 1000, shape, zone);
      }
      // центр и общественные зоны получают здание во дворе (школа, магазин, церковь)
      if (zone !== 'private' && rand() < 0.35) {
        const type = rand() < 0.5 ? 'school' : rand() < 0.65 ? 'shop' : 'church';
        const sp = BUILDING[type];
        const w = Math.min(blockKm * 0.4, sp.wM / 1000), d = Math.min(blockKm * 0.34, sp.dM / 1000);
        const turn = angle + rand() * Math.PI;
        const cosT = Math.cos(turn), sinT = Math.sin(turn);
        const corners2 = footprint('rect', w, d).map(([du, dv]) => toWorld(uc + du * cosT - dv * sinT, vc + du * sinT + dv * cosT));
        pushBuilding(type, corners2, toWorld(uc, vc), sp.floors, w * 1000, d * 1000, 'rect', zone);
      }
    }
  }

  // деревня не влезает в сетку — одна главная улица и дома по обе стороны (§9.1)
  if (buildings.length < 3) {
    const len = Math.max(0.35, radiusKm * 1.6);
    const count = 6 + Math.floor(rand() * 8);
    streets.length = 0;
    const a = toWorld(-len, 0), b = toWorld(len, 0);
    streets.push({ a, b, pts: [a, b], widthM: 8, major: true, cls: 'street' });
    for (let k = 0; k < count; k++) {
      const u = -len + (2 * len) * (k / count) + (rand() - 0.5) * 0.05;
      const side = k % 2 === 0 ? 1 : -1;
      const type = rand() < 0.78 ? 'house' : 'dacha';
      const sp = BUILDING[type];
      const bw = sp.wM / 1000, bd = sp.dM / 1000;
      const v = side * (bd * 0.9 + 0.012);
      const corners = [toWorld(u - bw / 2, v - bd / 2), toWorld(u + bw / 2, v - bd / 2), toWorld(u + bw / 2, v + bd / 2), toWorld(u - bw / 2, v + bd / 2)];
      pushBuilding(type, corners, toWorld(u, v), sp.floors, sp.wM, sp.dM, 'rect', 'private');
    }
  }

  const zones = {};
  for (const b of blocks) zones[b.zone] = (zones[b.zone] || 0) + 1;
  return {
    index, name: town.name, x: town.x, y: town.y, cls, clsName: spec.name, pop, radiusKm, angle,
    streets, blocks, buildings, zones, h: heightKm(town.x, town.y)
  };
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
