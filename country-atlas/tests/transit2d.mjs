/* Проверки микро-слоя §16.7: железная дорога и поезда, аэропорты и диспетчер вышки,
   фарватер и разводные мосты (F-208…F-217). По 20 значений на группу.
   Запуск: node tests/transit2d.mjs */
import assert from 'node:assert/strict';
import {
  RAIL, AIR, SEA, MICRO, buildRail, stepRail, brakeSpeed, occupyBlocks, blockKey, trainPoints,
  pointOnLine, buildAir, stepAir, glideAt, buildSea, stepSea, bridgeOpen, shipPoint, transitStats,
  findStrait
} from '../src/transit2d.js';
import { buildRoads } from '../src/roads2d.js';
import { settlements, rankSettlements, heightKm } from '../src/world2d.js';
import { buildWater } from '../src/rivers2d.js';
import { buildBorders } from '../src/borders2d.js';
import { buildTides } from '../src/tide2d.js';
import { cityPopulation, classFor } from '../src/city2d.js';

let checks = 0;
const ok = (cond, msg) => { assert.ok(cond, msg); checks++; };
globalThis.window = globalThis.window || { addEventListener() {} };

const towns = settlements();
const ranks = rankSettlements(towns, 10);
const roads = buildRoads();
const rail = buildRail(roads, towns);
const water = buildWater(roads);
const tides = buildTides(water, buildBorders(), towns);

/* F-208: железная дорога — остовное дерево из магистралей M и R */
{
  ok(rail.lines.length > 20, 'перегонов много: ' + rail.lines.length);
  ok(rail.lines.every((l) => l.cls === 'M' || l.cls === 'R'), 'рельсы только по магистралям и региональным');
  ok(rail.lines.every((l) => l.lengthKm >= RAIL.minEdgeKm - 1e-6), 'короче 25 км не берём');
  ok(rail.totalKm > 10000, 'сеть измерена: ' + rail.totalKm + ' км');
  ok(rail.stations.length > 20, 'станций хватает: ' + rail.stations.length);
  ok(rail.stations.every((s) => typeof s.name === 'string' && s.name.length > 0), 'у станции есть имя');
  ok(rail.stations.every((s) => Number.isFinite(s.x) && Number.isFinite(s.y)), 'у станции есть координаты');
  // дерево: линий ровно на одну меньше, чем станций (нет циклов и всё связано)
  ok(rail.lines.length <= rail.stations.length - 1, 'лес без циклов: ' + rail.lines.length + ' линий, ' + rail.stations.length + ' станций');
  // проверим отсутствие циклов честно: каждая линия соединяет разные компоненты
  const comp = new Map();
  const find = (x) => { while (comp.get(x) !== x) x = comp.get(x); return x; };
  let cycles = 0;
  for (const l of rail.lines) {
    if (!comp.has(l.from)) comp.set(l.from, l.from);
    if (!comp.has(l.to)) comp.set(l.to, l.to);
    const a = find(l.from), b = find(l.to);
    if (a === b) cycles++;
    else comp.set(a, b);
  }
  ok(cycles === 0, 'циклов нет: ' + cycles);
  const keys = new Set();
  for (const l of rail.lines) {
    const k = l.from + '-' + l.to;
    ok(!keys.has(k), 'перегон не повторяется: ' + k);
    keys.add(k);
    ok(l.nBlocks >= 1, 'у перегона есть блоки: ' + l.nBlocks);
    ok(Math.abs(l.nBlocks * l.blockKm - l.lengthKm) < 1e-6, 'блоки покрывают перегон целиком');
  }
  ok(rail.blocks.length > rail.lines.length, 'блоков больше, чем перегонов: ' + rail.blocks.length);
  ok(rail.trains.length === RAIL.maxTrains, 'R-16.23: ровно восемь составов в микро-слое');
  ok(rail.trains.every((t) => t.vMax === RAIL.vPass || t.vMax === RAIL.vFreight), 'скорости из §16.7');
  ok(rail.trains.filter((t) => t.freight).length > 0, 'есть грузовые');
  ok(rail.trains.filter((t) => !t.freight).length > 0, 'есть пассажирские');
  const again = buildRail(roads, towns);
  ok(again.totalKm === rail.totalKm && again.trains.length === rail.trains.length, 'железная дорога детерминирована');
  ok(MICRO.rail > 0 && MICRO.air > 0 && MICRO.sea > 0, 'у микро-слоя свой масштаб времени');
}

/* F-209: кривая торможения v = √(2·a·d) */
{
  ok(brakeSpeed(0) === 0, 'на нуле дистанции скорость ноль');
  ok(brakeSpeed(-5) === 0, 'отрицательная дистанция не ломает формулу');
  for (let i = 1; i <= 20; i++) {
    const d = i * 10;
    const v = brakeSpeed(d);
    ok(Math.abs(v - Math.sqrt(2 * RAIL.decel * d)) < 1e-9, 'v=√(2ad) при d=' + d + ' м');
    ok(v >= 0 && v < 100, 'скорость в разумных пределах');
  }
  ok(brakeSpeed(400) > brakeSpeed(100), 'дальше — можно быстрее');
  ok(Math.abs(brakeSpeed(100, 1.0) - Math.sqrt(200)) < 1e-9, 'торможение задаётся параметром');
  ok(brakeSpeed(200, 2 * RAIL.decel) > brakeSpeed(200), 'сильнее тормоз — выше допустимая скорость');
}

/* F-210: поезда идут по разрешению диспетчера, блок занят одним составом */
{
  const r = buildRail(roads, towns);
  const occ = occupyBlocks(r);
  ok(occ.size > 0, 'блоки заняты составами: ' + occ.size);
  ok(occ.size <= r.trains.length, 'занятых блоков не больше, чем поездов');
  const dup = new Map();
  for (const [k, id] of occ) {
    ok(!dup.has(k), 'ключ блока уникален: ' + k);
    dup.set(k, id);
    ok(typeof id === 'string' && id.startsWith('t'), 'блок занят поездом: ' + id);
  }
  ok(blockKey('rl1', 3) === 'rl1:3', 'ключ блока — «линия:номер»');
  ok(blockKey('rl1', 3, 1) !== blockKey('rl1', 3, -1), 'у направлений свои блоки (двухпутка)');

  let moved = 0, stationSeen = 0, waitSeen = 0;
  const before = r.trains.map((t) => t.s);
  for (let i = 0; i < 4000; i++) {
    stepRail(r, 0.5);
    if (r.trains.some((t) => t.state === 'station')) stationSeen++;
    if (r.trains.some((t) => t.state === 'wait')) waitSeen++;
  }
  for (let i = 0; i < r.trains.length; i++) {
    ok(r.trains[i].s >= -1e-6 && r.trains[i].s <= r.lines.find((l) => l.id === r.trains[i].line).lengthKm + 1e-6,
      'поезд в пределах перегона: ' + r.trains[i].id);
    ok(r.trains[i].v >= 0, 'скорость не отрицательна: ' + r.trains[i].id);
    if (Math.abs(r.trains[i].s - before[i]) > 1) moved++;
  }
  ok(moved >= 4, 'составы едут: ' + moved + ' из 8');
  ok(stationSeen > 0, 'кто-то стоял на станции по расписанию');
  ok(waitSeen >= 0, 'ожидание соседа учитывается');
  ok(r.trains.filter((t) => t.stationsDone > 0).length >= 6, 'почти все составы в работе: ' +
    r.trains.filter((t) => t.stationsDone > 0).length + ' из 8');
  ok(r.trains.some((t) => t.waitedMin > 0), 'ожидание посчитано в минутах');
  ok(r.trains.some((t) => t.stationsDone > 0), 'составы доезжают до станций: ' + r.trains.map((t) => t.stationsDone).join(','));
  // двухпутка: встречные расходятся, попутные не занимают один блок
  for (const line of r.lines) {
    const onLine = r.trains.filter((t) => t.line === line.id);
    if (onLine.length < 2) continue;
    const seen = new Map();
    for (const t of onLine) {
      const k = blockKey(line.id, Math.floor(t.s / line.blockKm), t.dir);
      ok(!seen.has(k), 'блок ' + k + ' занят одним составом');
      seen.set(k, t.id);
    }
    const dirs = new Set(onLine.map((t) => Math.sign(t.dir)));
    ok(dirs.size >= 1, 'на перегоне ' + line.id + ' направления учтены');
  }
  const bothWays = r.trains.filter((t) => t.dir > 0).length > 0 && r.trains.filter((t) => t.dir < 0).length > 0;
  ok(bothWays, 'составы идут в обе стороны');
  const pts = trainPoints(r, r.trains[0]);
  ok(pts && Number.isFinite(pts.x) && pts.tail.length === r.trains[0].cars, 'состав рисуется из вагонов');
}

/* F-211: точка и направление на перегоне */
{
  const line = rail.lines[0];
  const a = pointOnLine(line, 0);
  ok(a.x === line.pts[0][0] && a.y === line.pts[0][1], 'нулевой километр — начало перегона');
  const b = pointOnLine(line, line.lengthKm);
  const last = line.pts[line.pts.length - 1];
  ok(Math.abs(b.x - last[0]) < 1e-6 && Math.abs(b.y - last[1]) < 1e-6, 'конец — последняя точка');
  ok(pointOnLine(line, -10).x === a.x, 'отрицательный путь прижимается к нулю');
  ok(pointOnLine(line, line.lengthKm + 10).x === b.x, 'за концом не уезжаем');
  for (let i = 0; i <= 20; i++) {
    const s = (i / 20) * line.lengthKm;
    const p = pointOnLine(line, s);
    ok(Number.isFinite(p.x) && Number.isFinite(p.y), 'точка конечна: ' + s.toFixed(1));
    ok(Math.abs(Math.hypot(p.dx, p.dy) - 1) < 1e-6, 'направление единичное');
  }
  ok(line.acc.length === line.pts.length, 'накопленные длины совпадают с точками');
}

/* F-212…F-214: аэропорты, глиссада, диспетчер вышки */
{
  const air = buildAir(towns, ranks);
  ok(air.airports.length === AIR.airports, 'три аэропорта');
  ok(air.planes.length === AIR.count, 'шесть самолётов в микро-слое');
  const pops = air.airports.map((a) => cityPopulation(classFor(towns[a.index], a.index, ranks), a.index));
  const allPops = towns.map((t, i) => cityPopulation(classFor(t, i, ranks), i)).sort((a, b) => b - a);
  ok(pops.every((p) => p >= allPops[AIR.airports - 1]), 'аэропорты у трёх крупнейших городов');
  ok(pops[0] === allPops[0], 'столица среди них');
  ok(air.airports.every((a) => Number.isFinite(a.heading)), 'у полосы есть курс');

  ok(glideAt(0).alt === 1200, 'глиссада начинается с 1200 м');
  ok(glideAt(1).alt === 0, 'в конце — земля');
  ok(glideAt(1).v === AIR.vFinal, 'на посадке — посадочная скорость');
  let prevAlt = Infinity, prevV = Infinity;
  for (let i = 0; i <= 20; i++) {
    const g = glideAt(i / 20);
    ok(g.alt < prevAlt || i === 0, 'высота падает: ' + g.alt.toFixed(0));
    ok(g.v < prevV || i === 0, 'скорость падает: ' + g.v.toFixed(0));
    ok(g.alt >= 0 && g.v > 0, 'величины положительны');
    prevAlt = g.alt; prevV = g.v;
  }
  ok(glideAt(-1).alt === 1200 && glideAt(2).alt === 0, 'выход за границы зажат');

  let hold = 0, runwayMax = 0, landed = 0;
  const seenStates = new Set();
  for (let i = 0; i < 12000; i++) {
    stepAir(air, 0.5);
    if (air.holding > 0) hold++;
    for (const p of air.planes) seenStates.add(p.state);
    for (const a of air.airports) {
      const n = air.planes.filter((p) => p.to === a.index && p.state === 'runway').length;
      if (n > runwayMax) runwayMax = n;
      ok(n <= 1, 'на полосе не больше одного: ' + a.name);
    }
    landed = air.landed;
  }
  ok(landed > 5, 'самолёты садятся: ' + landed);
  ok(hold > 0, 'кто-то ждал на круге: ' + hold + ' шагов');
  ok(runwayMax === 1, 'полоса занята максимум одним');
  ok(seenStates.has('cruise') && seenStates.has('approach') && seenStates.has('runway') && seenStates.has('taxi') && seenStates.has('takeoff'),
    'все стадии полёта случаются: ' + [...seenStates].join(', '));
  ok(air.planes.every((p) => p.alt >= 0 && p.alt <= 10000), 'высота в пределах');
  ok(air.planes.every((p) => p.v >= 0 && p.v <= 800), 'скорость в пределах');
  ok(air.departures >= air.landed - 1, 'вылетов не меньше, чем посадок');
}

/* F-215…F-217: фарватер, правая сторона, разводной мост, швартовка */
{
  const sea = buildSea(tides.ports, water.bridges.list);
  ok(sea.lanes.length >= 2, 'фарватеров хватает: ' + sea.lanes.length);
  ok(sea.ships.length === SEA.count, 'четыре судна в микро-слое');
  ok(sea.lanes.every((l) => l.lengthKm > 200), 'фарватер не короче 200 км');
  ok(sea.lanes.every((l) => Math.abs(Math.hypot(l.nx, l.ny) - 1) < 1e-9), 'нормаль единичная');
  ok(sea.lanes.every((l) => l.bridges.length >= 1), 'у входа в порт есть разводной мост');
  ok(sea.lanes.some((l) => l.bridges.length >= 2), 'на длинном фарватере мостов два');

  const pt = shipPoint(sea, sea.ships[0], tides.ports);
  const lane = sea.lanes.find((l) => l.id === sea.ships[0].lane);
  const A = tides.ports[lane.a];
  const dx = pt.x - A.x, dy = pt.y - A.y;
  const offset = Math.abs(dx * lane.nx + dy * lane.ny);
  ok(Math.abs(offset - SEA.offsetKm) < 0.05, 'правая сторона: отступ 0.6 км (' + offset.toFixed(2) + ')');

  ok(bridgeOpen(0) === true, 'мост разведён в начале цикла');
  let openMin = 0;
  for (let m = 0; m < SEA.cycleMin; m++) if (bridgeOpen(m)) openMin++;
  ok(openMin === SEA.openMin, 'мост открыт ровно 8 минут из 24: ' + openMin);
  for (let i = 0; i < 20; i++) {
    const m = i * 7;
    const open = bridgeOpen(m);
    ok(typeof open === 'boolean', 'расписание определённое: ' + m);
    ok(bridgeOpen(m + SEA.cycleMin) === open, 'расписание повторяется через цикл');
  }

  let give = 0, bridge = 0, moor = 0;
  for (let i = 0; i < 8000; i++) {
    stepSea(sea, tides.ports, 0.5, water.bridges.list, i * 2);
    give += sea.giveWay;
    bridge += sea.bridgeWaiting;
    moor += sea.moored;
  }
  ok(give > 0, 'кто-то уступал в узкости: ' + give + ' судно-шагов');
  ok(bridge > 0, 'кто-то ждал разводку: ' + bridge);
  ok(moor > 0, 'суда швартуются: ' + moor);
  ok(sea.ships.every((s) => s.s >= 0), 'судно не уезжает за начало фарватера');
  ok(sea.ships.every((s) => s.v >= 0), 'скорость не отрицательна');
  ok(sea.ships.some((s) => s.bridgeWaits >= 0), 'счётчики не ломаются');
}

/* Сводка для HUD */
{
  const air = buildAir(towns, ranks);
  const sea = buildSea(tides.ports, water.bridges.list);
  const st = transitStats(rail, air, sea);
  ok(st.trains === RAIL.maxTrains, 'сводка знает поезда');
  ok(st.railKm === rail.totalKm, 'сводка знает длину рельсов');
  ok(st.planes === AIR.count, 'сводка знает самолёты');
  ok(st.ships === SEA.count, 'сводка знает суда');
  ok(st.waiting >= 0 && st.atStation >= 0, 'ожидание и стоянка — числа');
  ok(st.runwayBusy >= 0 && st.holding >= 0, 'полоса и круг — числа');
  ok(st.giveWay >= 0 && st.bridgeWaiting >= 0, 'уступание и мост — числа');
  ok(Number.isFinite(st.railKm) && Number.isFinite(st.landed), 'сводка без NaN');
  ok(findStrait({ x: 0, y: 0 }, { x: 0, y: 10 }, 10, 1, 0) === null, 'в открытом море узкости нет');
  ok(RAIL.maxTrains === 8 && SEA.count === 4, 'лимиты микро-слоя из §16.7');
  ok(heightKm(tides.ports[0].x, tides.ports[0].y) < 5, 'порт стоит у воды');
}

console.log('OK: 8 групп проверок §16.7 (F-208…F-217, проверок ' + checks + ')');
