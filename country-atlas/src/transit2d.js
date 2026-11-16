/* §16.7: поезда, самолёты и суда — микро-слой с диспетчерами (R-16.23…R-16.25).
   Поезда идут по железной дороге, которую строим из магистралей §8: перегоны делятся
   на блоки, и в блок пускают одного — остальные тормозят по кривой `v = √(2·a·d)` и стоят
   на разъезде. Самолёты заходят по глиссаде, а при занятой полосе ждут на круге.
   Суда идут по фарватеру правой стороной, уступают в узкости, ждут разводки моста
   и швартуются к причалу по кривой. Всё детерминировано и тикает по игровым часам. */
import { rng } from './transport2d.js';
import { heightKm } from './world2d.js';
import { cityPopulation, classFor } from './city2d.js';

/* Микро-слой §16.7 идёт в своём масштабе: 1 реальная секунда = `scale` секунд микромира.
   С общим TIME_SCALE (×360) поезд проскакивал перегон за один кадр, а самолёт — за три;
   в микро-слое важно видеть разгон, торможение, стоянку и круг ожидания, а не телепорт. */
export const MICRO = { rail: 60, air: 60, sea: 240 };

export const RAIL = {
  minEdgeKm: 25,        // короче — не перегон, а ветка на завод
  blockKm: 18,          // блок-участок: один поезд
  maxTrains: 8,         // R-16.23: не больше восьми в микро-слое
  accel: 0.45,          // м/с² — разгон грузового состава
  decel: 0.5,           // м/с² — служебное торможение
  vPass: 120,           // км/ч пассажирский
  vFreight: 72,         // км/ч грузовой
  dwellMin: 2,          // стоянка на станции, игровых минут
  carLen: 18,           // вагон, метров
  cars: 4,              // вагонов в составе
  offsetKm: 0.055       // железная дорога идёт вдоль трассы, в 55 м от оси
};

export const AIR = {
  count: 6,
  airports: 3,
  holdKm: 9,            // радиус круга ожидания
  approachKm: 28,       // откуда начинается заход
  glideKm: 7,           // длина глиссады
  runwaySec: 42,        // полоса занята одним самолётом, игровых секунд
  taxiSec: 25,
  turnMin: 25,          // разворот на земле, игровых минут
  vCruise: 780,
  vFinal: 260,
  runwayKm: 2.6,
  runwayM: 45
};

export const SEA = {
  count: 4,
  offsetKm: 0.6,        // правило правой стороны: своя половина фарватера
  giveWayKm: 3.2,       // ближе — уступаем в узкости
  slow: 0.55,
  bridgeKm: 2.5,        // мост на фарватере — ждём разводку
  cycleMin: 24,         // разводка раз в 24 игровых минуты
  openMin: 8,           // и стоит открытой 8 минут
  moorMin: 20,          // швартовка у причала
  vKmh: 34
};

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const gameMin = (dtSec, scale = MICRO.rail) => (dtSec * scale) / 60;
const microSec = (dtSec, scale) => dtSec * scale;

/* ---------- железная дорога ---------- */

class Union {
  constructor(n) { this.p = Array.from({ length: n }, (_, i) => i); }
  find(x) { while (this.p[x] !== x) { this.p[x] = this.p[this.p[x]]; x = this.p[x]; } return x; }
  union(a, b) { const ra = this.find(a), rb = this.find(b); if (ra === rb) return false; this.p[ra] = rb; return true; }
}

/* Кривая торможения (R-16.23): на расстоянии d метров скорость не выше √(2·a·d). */
export function brakeSpeed(dM, decel = RAIL.decel) {
  return Math.sqrt(Math.max(0, 2 * decel * Math.max(0, dM)));
}

/* F-208: полотно железной дороги из магистралей. Берём рёбра M и R длиной от 25 км
   и оставляем только те, что соединяют новые города (остовное дерево) — рельсы не петляют. */
export function buildRail(roads, towns) {
  const edges = (roads.edges || []).filter((e) => (e.cls === 'M' || e.cls === 'R') && e.lengthKm >= RAIL.minEdgeKm);
  edges.sort((a, b) => a.lengthKm - b.lengthKm || (a.id < b.id ? -1 : 1));
  const uf = new Union(towns.length);
  const picked = [];
  for (const e of edges) {
    if (uf.union(e.from, e.to)) picked.push(e);
  }
  const lines = [];
  const blocks = [];
  const lineToken = new Map();          // линия → поезд, которому разрешён перегон
  picked.forEach((e, idx) => {
    const pts = e.points.map((p) => [p[0] + RAIL.offsetKm, p[1]]);
    const acc = [0];
    for (let i = 1; i < pts.length; i++) acc.push(acc[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const lengthKm = acc[acc.length - 1];
    const nBlocks = Math.max(1, Math.round(lengthKm / RAIL.blockKm));
    const line = { id: 'rl' + idx, from: e.from, to: e.to, cls: e.cls, pts, acc, lengthKm, nBlocks, blockKm: lengthKm / nBlocks };
    lines.push(line);
    for (let k = 0; k < nBlocks; k++) blocks.push({ line: line.id, k, fromKm: k * line.blockKm, toKm: (k + 1) * line.blockKm });
  });
  // станции: города на концах перегонов
  const stations = [];
  const seen = new Set();
  for (const l of lines) {
    for (const t of [l.from, l.to]) {
      if (seen.has(t)) continue;
      seen.add(t);
      stations.push({ index: t, name: towns[t].name, x: towns[t].x, y: towns[t].y });
    }
  }
  const rail = {
    lines, blocks, stations, lineToken,
    totalKm: Math.round(lines.reduce((a, l) => a + l.lengthKm, 0)),
    trains: []
  };
  buildTrains(rail, towns);
  return rail;
}

/* Составы: по одному на длинные перегоны, два — на самый длинный (там и бывает разъезд). */
function buildTrains(rail, towns) {
  const rand = rng(424242 ^ 0x7a11);
  // для микро-слоя берём перегоны 80…400 км: на них видно и разгон, и станцию, и разъезд
  const byLen = [...rail.lines]
    .filter((l) => l.lengthKm >= 60 && l.lengthKm <= 420)
    .sort((a, b) => b.lengthKm - a.lengthKm);
  const trains = [];
  for (const line of byLen) {
    if (trains.length >= RAIL.maxTrains) break;
    const freight = (trains.length % 2 === 1);
    trains.push(makeTrain(rail, line, towns, freight, trains.length, rand));
    if (line.lengthKm > 220 && trains.length < RAIL.maxTrains) {
      trains.push(makeTrain(rail, line, towns, !freight, trains.length, rand));
    }
  }
  rail.trains = trains;
  return trains;
}

function makeTrain(rail, line, towns, freight, index, rand) {
  return {
    id: 't' + index, line: line.id, freight,
    vMax: freight ? RAIL.vFreight : RAIL.vPass,
    dir: 1,
    s: 0,
    v: 0,
    state: 'station',             // run | station | wait
    dwellMin: 0,
    waitedMin: 0,
    waits: 0,
    stationsDone: 0,
    cars: RAIL.cars + (freight ? 6 : 0),
    fromName: towns[line.from].name,
    toName: towns[line.to].name,
    tone: freight ? '#8a7a5e' : '#d8dde2'
  };
}

/* F-209: занятость блока. Ключ «линия:блок» — один поезд, как на настоящей дороге. */
/* R-70.3: путь двухпутный — блок резервируется отдельно для каждого направления,
   поэтому встречные составы расходятся, а попутные держат дистанцию. */
export function blockKey(lineId, k, dir = 0) {
  return lineId + ':' + k + (dir ? (dir > 0 ? '+' : '-') : '');
}

export function occupyBlocks(rail) {
  const map = new Map();
  for (const t of rail.trains) {
    const line = rail.lines.find((l) => l.id === t.line);
    if (!line) continue;
    const k = clamp(Math.floor(t.s / line.blockKm), 0, line.nBlocks - 1);
    map.set(blockKey(line.id, k, t.dir), t.id);
    // состав длиннее блока — занимаем и следующий по ходу
    const tailKm = (t.cars * RAIL.carLen) / 1000;
    if (tailKm > line.blockKm) {
      const k2 = clamp(k + (t.dir > 0 ? 1 : -1), 0, line.nBlocks - 1);
      const key2 = blockKey(line.id, k2, t.dir);
      if (!map.has(key2)) map.set(key2, t.id);
    }
  }
  return map;
}

/* F-210: шаг поездов. Разрешение на перегон выдаёт диспетчер: на линии в один момент
   идёт только один состав (жезловое разрешение), а внутри перегона блоки держат дистанцию.
   Если следующий блок занят — тормозим по кривой `√(2·a·d)` и стоим у границы блока. */
export function stepRail(rail, dtSec) {
  const minutes = gameMin(dtSec, MICRO.rail);
  const occ = occupyBlocks(rail);
  for (const t of rail.trains) {
    const line = rail.lines.find((l) => l.id === t.line);
    if (!line) continue;
    if (t.state === 'station' || t.state === 'wait') {
      t.dwellMin -= minutes;
      t.v = 0;
      if (t.dwellMin > 0) continue;
      t.state = 'run';
      t.dwellMin = 0;
      continue;
    }
    const vMaxMs = (t.vMax * 1000) / 3600;
    const ahead = t.dir > 0 ? line.lengthKm - t.s : t.s;       // до конца перегона, км
    const inBlock = clamp(Math.floor(t.s / line.blockKm), 0, line.nBlocks - 1);
    const nextIdx = t.dir > 0 ? Math.min(line.nBlocks - 1, inBlock + 1) : Math.max(0, inBlock - 1);
    const occupant = occ.get(blockKey(line.id, nextIdx, t.dir));
    const busyNext = !!occupant && occupant !== t.id;
    const toBoundaryM = t.dir > 0
      ? Math.max(0, (nextIdx * line.blockKm - t.s) * 1000)
      : Math.max(0, (t.s - (nextIdx + 1) * line.blockKm) * 1000);

    let vTarget = vMaxMs;
    if (busyNext) vTarget = Math.min(vTarget, brakeSpeed(toBoundaryM));
    vTarget = Math.min(vTarget, brakeSpeed(ahead * 1000) + 1.5);   // перед станцией тормозим
    if (busyNext && toBoundaryM < 2) {
      t.state = 'wait';
      t.v = 0;
      t.waitedMin += minutes;
      continue;
    }
    t.state = 'run';
    const dv = clamp(vTarget - t.v, -RAIL.decel * dtSec, RAIL.accel * dtSec * 1.6);
    t.v = clamp(t.v + dv, 0, vMaxMs);
    t.s += (t.dir * t.v * microSec(dtSec, MICRO.rail)) / 1000;
    const hitEnd = t.dir > 0 ? t.s >= line.lengthKm - 0.001 : t.s <= 0.001;
    if (hitEnd) {
      t.s = t.dir > 0 ? line.lengthKm : 0;
      t.dir = -t.dir;
      t.state = 'station';
      t.dwellMin = RAIL.dwellMin;
      t.stationsDone++;
    }
  }
  return rail;
}

/* Положение поезда: голова состава и вагоны позади. */
export function trainPoints(rail, train) {
  const line = rail.lines.find((l) => l.id === train.line);
  if (!line) return null;
  const head = pointOnLine(line, train.s);
  const tail = [];
  for (let k = 1; k <= train.cars; k++) {
    const s = clamp(train.s - (k * RAIL.carLen) / 1000, 0, line.lengthKm);
    tail.push(pointOnLine(line, s));
  }
  return { x: head.x, y: head.y, dx: head.dx * train.dir, dy: head.dy * train.dir, tail };
}

/* F-211: точка и направление на перегоне по пройденным километрам. */
export function pointOnLine(line, sKm) {
  const s = clamp(sKm, 0, line.lengthKm);
  let i = 1;
  while (i < line.acc.length - 1 && line.acc[i] < s) i++;
  const a = line.pts[i - 1], b = line.pts[i];
  const seg = Math.max(1e-9, line.acc[i] - line.acc[i - 1]);
  const u = clamp((s - line.acc[i - 1]) / seg, 0, 1);
  // в данных дороги бывают слипшиеся точки: направление берём с ближайшего живого отрезка
  let dx = (b[0] - a[0]) / seg, dy = (b[1] - a[1]) / seg;
  if (Math.hypot(dx, dy) < 1e-6) {
    for (let k = i + 1; k < line.pts.length; k++) {
      const ddx = line.pts[k][0] - line.pts[k - 1][0], ddy = line.pts[k][1] - line.pts[k - 1][1];
      const l = Math.hypot(ddx, ddy);
      if (l > 1e-6) { dx = ddx / l; dy = ddy / l; break; }
    }
  }
  return { x: a[0] + (b[0] - a[0]) * u, y: a[1] + (b[1] - a[1]) * u, dx, dy };
}

/* ---------- самолёты ---------- */

/* F-212: аэропорты — три крупнейших города; полоса ориентирована детерминированно. */
export function buildAir(towns, ranks) {
  // аэропорты — у самых населённых городов: столица и два крупнейших
  const scored = towns.map((t, i) => ({ i, pop: cityPopulation(classFor(t, i, ranks), i) }));
  scored.sort((a, b) => b.pop - a.pop);
  const order = scored.slice(0, AIR.airports).map((x) => x.i);
  const airports = order.map((idx, k) => ({
    index: idx, name: towns[idx].name, x: towns[idx].x, y: towns[idx].y,
    heading: 0.6 + k * 1.1, runwayKm: AIR.runwayKm, busy: null, landed: 0, departures: 0
  }));
  const rand = rng(0x3f19 ^ 424242);
  const planes = [];
  for (let i = 0; i < AIR.count; i++) {
    const a = i % airports.length;
    const b = (i + 1) % airports.length;
    planes.push({
      id: 'p' + i, from: airports[a].index, to: airports[b].index,
      state: 'cruise', prog: 0.02 + rand() * 0.5, x: airports[a].x, y: airports[a].y,
      alt: 9800, v: AIR.vCruise, holdAngle: rand() * Math.PI * 2, holding: 0,
      flights: 0, timer: 0, tone: '#f4f6f8'
    });
  }
  return { airports, planes, runwayBusy: 0, holding: 0, landed: 0, departures: 0 };
}

/* F-213: заход по глиссаде: высота падает линейно, скорость — от крейсерской к посадочной. */
export function glideAt(t01) {
  const t = clamp(t01, 0, 1);
  return { alt: 1200 * (1 - t), v: AIR.vCruise + (AIR.vFinal - AIR.vCruise) * t };
}

/* F-214: шаг самолётов и диспетчера вышки. Полоса — один самолёт за раз: если она занята,
   заходящий уходит на круг ожидания над аэродромом и ждёт своей очереди. */
export function stepAir(air, dtSec) {
  const sec = microSec(dtSec, MICRO.air);
  const minutes = sec / 60;
  let holding = 0, busy = 0;
  for (const p of air.planes) {
    const from = air.airports.find((a) => a.index === p.from);
    const to = air.airports.find((a) => a.index === p.to);
    if (!from || !to) continue;
    const dist = Math.max(1, Math.hypot(to.x - from.x, to.y - from.y));

    if (p.state === 'cruise') {
      p.prog += (p.v * sec) / 3600 / dist;
      p.alt = 9800;
      p.v = AIR.vCruise;
      p.x = from.x + (to.x - from.x) * p.prog;
      p.y = from.y + (to.y - from.y) * p.prog;
      if (p.prog >= 0.55) { p.state = 'approach'; }
      continue;
    }
    if (p.state === 'approach') {
      p.prog += (p.v * sec) / 3600 / dist;
      const t01 = clamp((p.prog - 0.55) / 0.45, 0, 1);
      const g = glideAt(t01);
      p.alt = g.alt;
      p.v = g.v;
      p.x = from.x + (to.x - from.x) * p.prog;
      p.y = from.y + (to.y - from.y) * p.prog;
      if (t01 >= 1) {
        if (to.busy && to.busy !== p.id) { p.state = 'hold'; p.holding++; }
        else { to.busy = p.id; p.state = 'runway'; p.timer = 0; }
      }
      continue;
    }
    if (p.state === 'hold') {
      p.holdAngle += (sec / 240) * Math.PI * 2;
      p.x = to.x + Math.cos(p.holdAngle) * AIR.holdKm;
      p.y = to.y + Math.sin(p.holdAngle) * AIR.holdKm * 0.7;
      p.alt = 1500;
      p.v = 480;
      holding++;
      if (!to.busy || to.busy === p.id) { to.busy = p.id; p.state = 'runway'; p.timer = 0; }
      continue;
    }
    if (p.state === 'runway') {
      p.v = 0;
      p.alt = 0;
      p.x = to.x;
      p.y = to.y;
      p.timer += sec;
      busy++;
      if (p.timer >= AIR.runwaySec) {
        p.state = 'taxi';
        p.timer = 0;
        p.landed = true;
        to.landed++;
        air.landed++;
      }
      continue;
    }
    if (p.state === 'taxi') {
      p.v = 10;
      p.timer += sec;
      if (p.timer >= AIR.taxiSec + AIR.turnMin * 60) {
        p.state = 'takeoff';
        p.timer = 0;
        p.alt = 0;
      }
      continue;
    }
    if (p.state === 'takeoff') {
      p.timer += sec;
      const t01 = clamp(p.timer / 120, 0, 1);
      p.alt = 2200 * t01;
      p.v = 280 + 400 * t01;
      p.x = to.x + Math.cos(to.heading) * t01 * 10;
      p.y = to.y + Math.sin(to.heading) * t01 * 10;
      if (t01 >= 1) {
        if (to.busy === p.id) to.busy = null;
        to.departures++;
        air.departures++;
        // летим обратно: из «to» в «from»
        const swap = p.from;
        p.from = p.to;
        p.to = swap;
        p.state = 'cruise';
        p.prog = 0;
        p.timer = 0;
        p.alt = 9800;
        p.v = AIR.vCruise;
      }
      continue;
    }
  }
  for (const a of air.airports) {
    const owner = air.planes.find((p) => p.id === a.busy);
    if (!owner || (owner.state !== 'runway' && owner.state !== 'taxi' && owner.state !== 'takeoff')) a.busy = null;
  }
  air.holding = holding;
  air.runwayBusy = busy;
  return air;
}

/* ---------- суда ---------- */

/* F-215: разводной мост через узкость. Идём по фарватеру и ищем точку, где по обе стороны
   от него суша ближе 5 км — там и стоит мост, который разводят по расписанию. */
export function findStrait(A, B, lengthKm, nx, ny) {
  const N = 24;
  for (let k = 0; k < N; k++) {
    const t = 0.2 + (k / N) * 0.6;
    const x = A.x + (B.x - A.x) * t, y = A.y + (B.y - A.y) * t;
    if (heightKm(x, y) >= 0) continue;                     // сам фарватер должен быть в воде
    let left = Infinity, right = Infinity;
    for (let d = 0.4; d <= 5; d += 0.4) {
      if (heightKm(x + nx * d, y + ny * d) >= 0) { left = Math.min(left, d); break; }
    }
    for (let d = 0.4; d <= 5; d += 0.4) {
      if (heightKm(x - nx * d, y - ny * d) >= 0) { right = Math.min(right, d); break; }
    }
    if (left < 5 && right < 5) {
      return { sKm: t * lengthKm, x, y, spanKm: left + right, name: 'разводной' };
    }
  }
  return null;
}

/* F-215: фарватер между портами, правая сторона движения. */
export function buildSea(ports, bridges = []) {
  const flights = [];
  for (let i = 0; i < ports.length; i++) {
    for (let j = i + 1; j < ports.length; j++) {
      const A = ports[i], B = ports[j];
      const d = Math.hypot(A.x - B.x, A.y - B.y);
      if (d < 200) continue;
      flights.push({ a: i, b: j, d });
    }
  }
  flights.sort((x, y) => y.d - x.d);
  const lanes = flights.slice(0, 4).map((f, k) => {
    const A = ports[f.a], B = ports[f.b];
    const nx = -(B.y - A.y) / f.d, ny = (B.x - A.x) / f.d;   // нормаль: правая сторона
    // разводной мост: там, где фарватер проходит узкостью — суша по обе стороны
    // разводные мосты — у входа в порт: там река впадает в море и мост сведён над устьем
    const onLane = [];
    for (const [port, sKm] of [[A, 1.4], [B, f.d - 1.4]]) {
      let land = Infinity;
      for (let d = 0.4; d <= 4; d += 0.4) {
        if (heightKm(port.x + nx * d, port.y + ny * d) >= 0 || heightKm(port.x - nx * d, port.y - ny * d) >= 0) { land = d; break; }
      }
      if (land < 4) onLane.push({ sKm, x: port.x, y: port.y, spanKm: land * 2, name: 'разводной у входа в порт', port: port.name });
    }
    for (const br of bridges) {
      const t = ((br.x - A.x) * (B.x - A.x) + (br.y - A.y) * (B.y - A.y)) / (f.d * f.d);
      if (t < 0.04 || t > 0.96) continue;
      const px = A.x + (B.x - A.x) * t, py = A.y + (B.y - A.y) * t;
      if (Math.hypot(br.x - px, br.y - py) <= SEA.bridgeKm) onLane.push({ sKm: t * f.d, x: br.x, y: br.y, name: br.river });
    }
    return {
      id: 'sl' + k, a: f.a, b: f.b, lengthKm: f.d,
      points: [[A.x, A.y], [B.x, B.y]],
      nx, ny,                                             // нормаль: правая сторона
      portA: A.name, portB: B.name, bridges: onLane
    };
  });
  const rand = rng(0x5ea ^ 424242);
  const ships = [];
  const busiest = lanes.slice(0, Math.max(1, Math.min(2, lanes.length)));
  const perLane = new Map();
  for (let i = 0; i < SEA.count && busiest.length; i++) {
    const lane = busiest[i % busiest.length];
    const seen = perLane.get(lane.id) || 0;
    perLane.set(lane.id, seen + 1);
    ships.push({
      id: 's' + i, lane: lane.id,
      dir: (perLane.get(lane.id) - 1) % 2 === 0 ? 1 : -1,
      s: rand() * lane.lengthKm, v: SEA.vKmh, state: 'run',
      moorMin: 0, waitedMin: 0, giveWay: 0, bridgeWaits: 0
    });
  }
  return { lanes, ships, giveWay: 0, bridgeWaiting: 0, moored: 0 };
}

/* Мост закрыт или открыт — детерминированное расписание (R-16.25). */
export function bridgeOpen(minutes) {
  const phase = ((minutes % SEA.cycleMin) + SEA.cycleMin) % SEA.cycleMin;
  return phase < SEA.openMin;
}

/* F-216: шаг судов: правая сторона, уступание в узкости, разводка моста, швартовка. */
export function stepSea(sea, ports, dtSec, bridges = [], minutes = 0) {
  const gm = gameMin(dtSec, MICRO.sea);
  const msec = microSec(dtSec, MICRO.sea);
  const open = bridgeOpen(minutes);
  let giveWay = 0, bridgeWaiting = 0, moored = 0;
  for (const s of sea.ships) {
    const lane = sea.lanes.find((l) => l.id === s.lane);
    if (!lane) continue;
    if (s.state === 'moor') {
      s.v = 0;
      s.moorMin -= gm;
      moored++;
      if (s.moorMin <= 0) { s.state = 'run'; s.dir = -s.dir; s.moorMin = 0; }
      continue;
    }
    // уступание в узкости: другое судно в 3.2 км навстречу
    let yieldNow = false;
    for (const o of sea.ships) {
      if (o === s || o.lane !== s.lane) continue;
      if (Math.abs(o.s - s.s) < SEA.giveWayKm && o.dir !== s.dir) yieldNow = true;
    }
    let v = SEA.vKmh * (yieldNow ? SEA.slow : 1);
    if (yieldNow) { giveWay++; s.giveWay++; }
    // мост: если впереди мост и он закрыт — стоим и ждём разводку
    const A = ports[lane.a], B = ports[lane.b];
    let bridgeAhead = false;
    for (const br of lane.bridges || []) {
      if (Math.abs(br.sKm - s.s) < SEA.bridgeKm) bridgeAhead = true;
    }
    if (bridgeAhead && !open) {
      s.state = 'bridge';
      s.v = 0;
      s.waitedMin += gm;
      bridgeWaiting++;
      continue;
    }
    if (s.state === 'bridge') s.state = 'run';
    s.v = v;
    s.s += (s.dir * s.v * msec) / 3600;
    if (s.s >= lane.lengthKm) { s.s = lane.lengthKm; s.state = 'moor'; s.moorMin = SEA.moorMin; }
    else if (s.s <= 0) { s.s = 0; s.state = 'moor'; s.moorMin = SEA.moorMin; }
  }
  sea.giveWay = giveWay;
  sea.bridgeWaiting = bridgeWaiting;
  sea.moored = moored;
  return sea;
}

/* F-217: положение судна с правилом правой стороны (отступ на свою половину). */
export function shipPoint(sea, ship, ports) {
  const lane = sea.lanes.find((l) => l.id === ship.lane);
  if (!lane) return null;
  const A = ports[lane.a], B = ports[lane.b];
  const t = lane.lengthKm ? ship.s / lane.lengthKm : 0;
  const side = ship.dir > 0 ? 1 : -1;
  return {
    x: A.x + (B.x - A.x) * t + lane.nx * SEA.offsetKm * side,
    y: A.y + (B.y - A.y) * t + lane.ny * SEA.offsetKm * side,
    t
  };
}

/* Сводка для HUD: где стоим и почему. */
export function transitStats(rail, air, sea) {
  const waiting = rail.trains.filter((t) => t.state === 'wait').length;
  const atStation = rail.trains.filter((t) => t.state === 'station').length;
  return {
    trains: rail.trains.length, waiting, atStation, railKm: rail.totalKm,
    planes: air ? air.planes.length : 0,
    holding: air ? air.holding : 0,
    runwayBusy: air ? air.runwayBusy : 0,
    landed: air ? air.landed : 0,
    ships: sea ? sea.ships.length : 0,
    giveWay: sea ? sea.giveWay : 0,
    bridgeWaiting: sea ? sea.bridgeWaiting : 0,
    moored: sea ? sea.moored : 0
  };
}
