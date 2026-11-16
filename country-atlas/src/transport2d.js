/* Транспорт 2D по §44: у любой единицы есть точка A и точка B, между ними — сколько угодно
   точек N (наземный транспорт идёт по вершинам дороги), а самолёт и судно имеют ровно две
   точки — A и B (F-117). Всё детерминировано: только сид мира, ни одного Math.random. */
import { WORLD2D, heightKm, settlements, rankSettlements } from './world2d.js';
import { buildRoads, ROAD_CLASS } from './roads2d.js';
import { DRIVER, pickProfile, speedLimitKmh } from './ai2d.js';

/* Типы единиц §44.6: длина в метрах, своя скорость, запас хода и цвет. */
export const VEHICLE = {
  car:   { id: 'car',   name: 'легковая',  lengthM: 4.5,   speedKmh: 110, kind: 'ground', tone: '#f4f6f8', weight: 6,   rangeKm: 700 },
  truck: { id: 'truck', name: 'грузовик',  lengthM: 12,    speedKmh: 85,  kind: 'ground', tone: '#e8a24a', weight: 2.4, rangeKm: 1200 },
  bus:   { id: 'bus',   name: 'автобус',   lengthM: 12,    speedKmh: 80,  kind: 'ground', tone: '#8fd0a0', weight: 1.2, rangeKm: 900 },
  ship:  { id: 'ship',  name: 'судно',     lengthM: 120,   speedKmh: 34,  kind: 'sea',    tone: '#e6f2f8', weight: 1,   rangeKm: 1800 },
  plane: { id: 'plane', name: 'самолёт',   lengthM: 38,    speedKmh: 780, kind: 'air',    tone: '#ffffff', weight: 1,   rangeKm: 5500 }
};

/* F-123: дозаправка. Бак рассчитан на запас хода; кончился — 12 игровых минут у колонки.
   Дальний рейс (длиннее бака) получает ровно одну промежуточную точку N — там и заправляется. */
export const REFUEL_MIN = 12;
export const FUEL_LOW = 0.02;

/* Порядок точек маршрута: у наземного — любое число N, у воздушного и водного — ровно две (A и B). */
export const MAX_POINTS = { ground: Infinity, sea: 2, air: 2 };

export const TIME_SCALE = 360;        // F-120: 1 реальная секунда = 6 игровых минут
export const MIN_VEHICLE_PX = 3;      // F-116: транспорт виден на любом масштабе
export const VEHICLES_PER_1000KM = { M: 12, R: 7, L: 3, G: 1.2, F: 1 };
export const MAX_PER_ROUTE = 26;      // чтобы магистраль на 5000 км не рождала 130 машин

/* mulberry32: маленький детерминированный ГПСЧ */
export function rng(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const polyLength = (pts) => {
  let L = 0;
  for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  return L;
};

/* Кумулятивные длины — чтобы находить точку по доле пути за O(log n). */
export function cumulative(pts) {
  const acc = [0];
  for (let i = 1; i < pts.length; i++) {
    acc.push(acc[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  }
  return acc;
}

/* F-121: подрезать отрезок до воды — судно не должно «плыть» по суше у причала. */
export function trimToWater(a, b) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
  if (L < 2) return null;
  const steps = Math.max(2, Math.ceil(L));
  // ищем самый длинный непрерывный мокрый участок: судно не пересекает сушу
  let first = -1, last = -1, runStart = -1, bestFirst = -1, bestLen = 0;
  for (let i = 0; i <= steps; i++) {
    const k = i / steps;
    const h = heightKm(a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k);
    if (h < 0) {
      if (runStart < 0) runStart = i;
      if (i - runStart + 1 > bestLen) { bestLen = i - runStart + 1; bestFirst = runStart; }
      first = runStart; last = i;
    } else runStart = -1;
  }
  if (bestFirst < 0 || bestLen < 5) return null;
  first = bestFirst; last = bestFirst + bestLen - 1;
  const k0 = first / steps, k1 = last / steps;
  const p0 = [a[0] + (b[0] - a[0]) * k0, a[1] + (b[1] - a[1]) * k0];
  const p1 = [a[0] + (b[0] - a[0]) * k1, a[1] + (b[1] - a[1]) * k1];
  if (Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) < 5) return null;
  return [p0, p1];
}

/* F-118: точка на маршруте по доле t ∈ [0;1]; возвращает { x, y, angle } — угол в радианах. */
export function pointAt(route, t) {
  const pts = route.points, acc = route.acc, L = route.lengthKm;
  if (pts.length === 1 || L <= 0) return { x: pts[0][0], y: pts[0][1], angle: 0 };
  const d = Math.max(0, Math.min(1, t)) * L;
  let lo = 0, hi = acc.length - 1;
  while (lo + 1 < hi) {
    const mid = (lo + hi) >> 1;
    if (acc[mid] <= d) lo = mid; else hi = mid;
  }
  const a = pts[lo], b = pts[Math.min(lo + 1, pts.length - 1)];
  const seg = Math.max(1e-9, acc[lo + 1] - acc[lo]);
  const k = Math.max(0, Math.min(1, (d - acc[lo]) / seg));
  return {
    x: a[0] + (b[0] - a[0]) * k,
    y: a[1] + (b[1] - a[1]) * k,
    angle: Math.atan2(b[1] - a[1], b[0] - a[0])
  };
}

/* F-116: размер на экране — не меньше 3 px, иначе настоящая длина в пикселях. */
export function screenLengthPx(lengthM, scale) {
  return Math.max(MIN_VEHICLE_PX, (lengthM / 1000) * scale);
}

/* Ближайшее поселение к точке — для точки N (дозаправки). */
export function nearestTown(towns, x, y, except = []) {
  let best = -1, bestD = Infinity;
  for (let i = 0; i < towns.length; i++) {
    if (except.includes(i)) continue;
    const d = Math.hypot(towns[i].x - x, towns[i].y - y);
    if (d < bestD) { bestD = d; best = i; }
  }
  return best;
}

/* Маршруты: наземные — по рёбрам дорог, водные — паромы, воздушные — между хабами. */
export function buildRoutes(net, towns, hubCount = 10) {
  const routes = [];
  const ranks = rankSettlements(towns, hubCount);
  let id = 0;

  for (const e of net.edges) {
    const pts = e.points.map((p) => [p[0], p[1]]);
    const kind = e.ferry ? 'sea' : 'ground';
    // F-117: у воды и воздуха ровно две точки — A и B
    let kept = kind === 'ground' ? pts : [pts[0], pts[pts.length - 1]];
    // F-121: судно идёт только по воде — концы подрезаем до первой мокрой точки
    if (kind === 'sea') {
      kept = trimToWater(kept[0], kept[1]);
      if (!kept) continue;
    }
    const route = {
      id: 'r' + (id++), kind, cls: e.cls,
      a: e.from, b: e.to, points: kept, edge: e,
      speedKmh: e.ferry ? ROAD_CLASS.F.speed : ROAD_CLASS[e.cls].speed,
      acc: cumulative(kept)
    };
    route.lengthKm = route.acc[route.acc.length - 1];
    if (route.lengthKm < 1) continue;
    routes.push(route);
  }

  // морские линии: пары прибрежных поселений, у которых прямой путь целиком по воде
  const coastal = [];
  for (let i = 0; i < towns.length; i++) {
    const t = towns[i];
    let water = false;
    for (let a = 0; a < 12 && !water; a++) {
      const ang = (a * Math.PI) / 6;
      if (heightKm(t.x + Math.cos(ang) * 25, t.y + Math.sin(ang) * 25) < 0) water = true;
    }
    if (water) coastal.push(i);
  }
  const lanes = [];
  for (let i = 0; i < coastal.length; i++) {
    for (let j = i + 1; j < coastal.length; j++) {
      const A = towns[coastal[i]], B = towns[coastal[j]];
      const d = Math.hypot(A.x - B.x, A.y - B.y);
      if (d < 300) continue;
      const wet = trimToWater([A.x, A.y], [B.x, B.y]);
      if (!wet) continue;
      const run = Math.hypot(wet[1][0] - wet[0][0], wet[1][1] - wet[0][1]);
      if (run < d * 0.6 || run < 250) continue;   // линия должна быть в основном по воде и не короче 250 км
      lanes.push({ i: coastal[i], j: coastal[j], d, pts: wet });
    }
  }
  lanes.sort((x, y) => y.d - x.d);
  for (const lane of lanes.slice(0, 8)) {
    const route = {
      id: 'r' + (id++), kind: 'sea', cls: 'F', a: lane.i, b: lane.j,
      points: lane.pts, edge: null, speedKmh: VEHICLE.ship.speedKmh, acc: cumulative(lane.pts)
    };
    route.lengthKm = route.acc[route.acc.length - 1];
    routes.push(route);
  }

  // воздух: пары хабов подальше — 15 самых длинных (30 рейсов туда и обратно)
  const hubs = [...ranks.hubSet].sort((x, y) => x - y);
  const pairs = [];
  for (let i = 0; i < hubs.length; i++) {
    for (let j = i + 1; j < hubs.length; j++) {
      const A = towns[hubs[i]], B = towns[hubs[j]];
      pairs.push({ i: hubs[i], j: hubs[j], d: Math.hypot(A.x - B.x, A.y - B.y) });
    }
  }
  pairs.sort((x, y) => y.d - x.d);
  for (const p of pairs.slice(0, 15)) {
    const A = towns[p.i], B = towns[p.j];
    // F-123: рейс длиннее бака получает одну точку N — дозаправку по пути
    const via = p.d > VEHICLE.plane.rangeKm ? nearestTown(towns, (A.x + B.x) / 2, (A.y + B.y) / 2, [p.i, p.j]) : -1;
    const pts = via >= 0 ? [[A.x, A.y], [towns[via].x, towns[via].y], [B.x, B.y]] : [[A.x, A.y], [B.x, B.y]];
    const route = { id: 'r' + (id++), kind: 'air', cls: 'A', a: p.i, b: p.j, via, points: pts, edge: null, speedKmh: VEHICLE.plane.speedKmh, acc: cumulative(pts) };
    route.lengthKm = route.acc[route.acc.length - 1];
    routes.push(route);
  }
  return { routes, ranks };
}

/* F-119: сколько единиц на ребре — по длине и классу; детерминировано сидом. */
export function vehiclesOnRoute(route, rand) {
  const out = [];
  if (route.kind === 'air') {
    out.push(makeVehicle('plane', route, rand, 0));          // A → B
    out.push(makeVehicle('plane', route, rand, 1));          // B → A
    return out;
  }
  if (route.kind === 'sea') {
    const n = Math.min(3, Math.max(1, Math.round(route.lengthKm / 900)));
    for (let i = 0; i < n; i++) out.push(makeVehicle('ship', route, rand, i));
    return out;
  }
  const per = VEHICLES_PER_1000KM[route.cls] || 2;
  const n = Math.min(MAX_PER_ROUTE, Math.round((route.lengthKm / 1000) * per * (0.75 + 0.5 * rand())));
  for (let i = 0; i < n; i++) {
    const kind = route.cls === 'G' ? (rand() < 0.7 ? 'truck' : 'car') : pickGround(rand);
    out.push(makeVehicle(kind, route, rand, i));
  }
  return out;
}

function pickGround(rand) {
  const r = rand() * (VEHICLE.car.weight + VEHICLE.truck.weight + VEHICLE.bus.weight);
  if (r < VEHICLE.car.weight) return 'car';
  if (r < VEHICLE.car.weight + VEHICLE.truck.weight) return 'truck';
  return 'bus';
}

/* F-192: полоса, в которой человек держит скорость относительно предела класса. */
const PROFILE_BAND = {
  calm: [0.86, 0.98],
  normal: [0.94, 1.06],
  aggressive: [1.02, 1.14],
  novice: [0.8, 0.94],
  truck: [0.9, 1.0]
};

function makeVehicle(kind, route, rand, index) {
  const spec = VEHICLE[kind];
  const dir = kind === 'plane' ? (index % 2 === 0 ? 1 : -1) : (rand() < 0.5 ? 1 : -1);
  // F-119: скорость — минимум из класса дороги и предела машины
  const cap = route.kind === 'ground' ? Math.min(spec.speedKmh, route.speedKmh) : spec.speedKmh;
  const lane = route.kind === 'ground' ? (ROAD_CLASS[route.cls].widthM / 2000) : 0;
  // F-192: за рулём живой человек — агрессивный жмёт к пределу, новичок отстаёт
  const profile = route.kind === 'ground' ? pickProfile(kind, index, rand) : DRIVER.truck;
  const band = PROFILE_BAND[profile.id] || PROFILE_BAND.normal;
  const factor = route.kind === 'ground' ? band[0] + (band[1] - band[0]) * rand() : 0.85 + 0.3 * rand();
  return {
    kind, route, dir,
    fuel: 0.35 + 0.65 * rand(),                 // F-123: кто-то только заправился, кто-то на исходе
    refuelMin: 0,                               // сколько игровых минут ещё стоять у колонки
    stops: 0,                                   // сколько раз заправлялся
    t: rand(),                                  // доля пройденного пути A → B
    speedKmh: cap * factor,                     // живая скорость вокруг предела, по характеру
    profile,                                    // характер водителя — для слоя ИИ §16
    limitKmh: route.kind === 'ground' ? speedLimitKmh(route.cls, profile) : spec.speedKmh,
    offsetKm: dir > 0 ? lane : -lane,           // своя половина дороги
    lengthM: spec.lengthM,
    tone: spec.tone
  };
}

/* Сборка всего парка: маршруты + единицы. */
export function buildTransport(net = buildRoads(), towns = settlements(), seed = 424242) {
  const { routes, ranks } = buildRoutes(net, towns);
  const rand = rng(seed ^ 0x9e3779b9);
  const vehicles = [];
  let vid = 0;
  for (const route of routes) {
    for (const v of vehiclesOnRoute(route, rand)) {
      v.id = 'v' + (vid++);
      vehicles.push(v);
    }
  }
  const counts = { ground: 0, sea: 0, air: 0, byKind: { car: 0, truck: 0, bus: 0, ship: 0, plane: 0 },
    byProfile: { calm: 0, normal: 0, aggressive: 0, novice: 0, truck: 0 } };
  for (const v of vehicles) {
    counts[VEHICLE[v.kind].kind]++;
    counts.byKind[v.kind]++;
    counts.byProfile[v.profile.id]++;
  }
  return { routes, vehicles, counts, towns, ranks, minutes: 8 * 60 };   // мир стартует в 8:00
}

/* F-119: шаг мира. dtSec — реальные секунды, часы игры идут в TIME_SCALE раз быстрее.
   Большой шаг режется на куски не длиннее 2 с: иначе единица «сжигала» весь бак за один вызов. */
export function advance(transport, dtSec) {
  let left = Math.max(0, dtSec);
  while (left > 1e-9) {
    const dt = Math.min(2, left);
    stepOnce(transport, dt);
    left -= dt;
  }
  return transport;
}

function stepOnce(transport, dtSec) {
  const hours = (dtSec * TIME_SCALE) / 3600;
  transport.minutes += dtSec * TIME_SCALE / 60;
  const minutes = dtSec * TIME_SCALE / 60;
  transport.refueling = 0;
  for (const v of transport.vehicles) {
    const r = v.route;
    if (!r.lengthKm) continue;
    // F-123: стоит у колонки — мир идёт, машина нет
    if (v.refuelMin > 0) {
      v.refuelMin -= minutes;
      if (v.refuelMin <= 0) { v.refuelMin = 0; v.fuel = 1; }
      transport.refueling++;
      continue;
    }
    const range = VEHICLE[v.kind].rangeKm;
    // за один шаг нельзя уехать дальше, чем осталось в баке
    const step = Math.min((v.speedKmh * hours) / r.lengthKm, (v.fuel * range) / r.lengthKm);
    const km = step * r.lengthKm;
    v.fuel -= km / range;
    if (v.fuel <= FUEL_LOW) {
      v.fuel = Math.max(0, v.fuel);
      v.refuelMin = REFUEL_MIN;
      v.stops++;
      transport.refueling++;
      continue;
    }
    // «фаза» растёт всегда: 0…1 — путь A→B, 1…2 — обратно B→A. Точки A и B не меняются.
    const phase = v.dir > 0 ? v.t : 2 - v.t;
    const next = (phase + step) % 2;
    v.dir = next <= 1 ? 1 : -1;
    v.t = next <= 1 ? next : 2 - next;
  }
}

/* Положение единицы на карте в километрах (со смещением в свою полосу). */
export function vehiclePosition(v) {
  const p = pointAt(v.route, v.t);
  if (!v.offsetKm) return p;
  const nx = -Math.sin(p.angle), ny = Math.cos(p.angle);
  const sign = v.dir > 0 ? 1 : -1;
  return { x: p.x + nx * v.offsetKm * sign, y: p.y + ny * v.offsetKm * sign, angle: p.angle };
}

/* Правила §44.8: проверка, что единица стоит там, где ей можно. */
export function violatesRules(v) {
  const p = vehiclePosition(v);
  if (Math.abs(p.x) > WORLD2D.halfKm || Math.abs(p.y) > WORLD2D.halfKm) return 'за миром';
  const h = heightKm(p.x, p.y);
  // мост короче 20 км допускается: дорожный слой сам держит мокрый участок не длиннее двух клеток
  if (v.route.kind === 'ground' && h < -20) return 'на воде';
  if (v.route.kind === 'sea' && h >= 0) return 'на суше';
  // F-117 + F-123: у воздуха и воды две точки A и B, а дальний рейс получает ровно одну N
  const allowed = v.route.via >= 0 ? 3 : 2;
  if (v.route.kind !== 'ground' && v.route.points.length !== allowed) return 'лишние точки';
  return null;
}
