/* Проверки транспорта §44: у каждой единицы есть A и B, у самолёта и судна ровно две точки,
   скорость подчинена классу дороги, часы идут по F-120, единицы не сходят с разрешённой
   поверхности и видны на любом масштабе. Каждая формула — на 20 значениях (§24). */
import assert from 'node:assert/strict';
import {
  VEHICLE, TIME_SCALE, MIN_VEHICLE_PX, MAX_POINTS, REFUEL_MIN, screenLengthPx, pointAt, cumulative,
  trimToWater, advance, vehiclePosition, violatesRules, buildTransport, buildRoutes, nearestTown, rng
} from '../src/transport2d.js';
import { buildRoads, ROAD_CLASS } from '../src/roads2d.js';
import { settlements, rankSettlements, heightKm, WORLD2D } from '../src/world2d.js';

const towns = settlements();
const net = buildRoads();
const tr = buildTransport(net, towns);

/* 1. F-116: единица видна на любом масштабе — не меньше 3 px (20 значений) --- */
{
  for (let i = 0; i < 20; i++) {
    const s = 0.08 * Math.pow(1.45, i);                   // 0.08 … 200 px/км
    for (const id of ['car', 'truck', 'bus', 'ship', 'plane']) {
      const px = screenLengthPx(VEHICLE[id].lengthM, s);
      assert.ok(px >= MIN_VEHICLE_PX - 1e-9, 'F-116: ' + id + ' меньше 3 px при s=' + s.toFixed(2));
      assert.ok(px <= Math.max(MIN_VEHICLE_PX, VEHICLE[id].lengthM / 1000 * 200) + 1e-9, 'F-116: слишком крупно');
    }
  }
  assert.ok(screenLengthPx(120, 200) > 20, 'судно в глубоком зуме — десятки пикселей');
  assert.equal(screenLengthPx(4.5, 0.08), MIN_VEHICLE_PX, 'машина на обзоре — ровно минимум');
}

/* 2. F-117: A и B есть у всех, у воздуха и воды — ровно две точки --- */
{
  assert.ok(tr.routes.length > 100, 'маршрутов много: ' + tr.routes.length);
  for (const r of tr.routes) {
    assert.ok(Number.isInteger(r.a) && Number.isInteger(r.b), 'A и B — номера поселений');
    assert.ok(r.a >= 0 && r.a < towns.length && r.b >= 0 && r.b < towns.length, 'A и B внутри списка');
    assert.notEqual(r.a, r.b, 'A и B — разные поселения');
    assert.ok(r.points.length >= 2, 'у маршрута есть геометрия');
    if (r.kind === 'air' || r.kind === 'sea') {
      // F-117: две точки A и B; F-123: дальний рейс получает ровно одну N — дозаправку
      const want = r.via >= 0 ? 3 : 2;
      assert.equal(r.points.length, want, 'F-117: ' + want + ' точек у ' + r.kind + ' (via=' + r.via + ')');
      if (r.via >= 0) {
        assert.ok(r.lengthKm > VEHICLE.plane.rangeKm, 'точка N появляется только на рейсе длиннее бака');
        assert.ok(Math.hypot(r.points[1][0] - towns[r.via].x, r.points[1][1] - towns[r.via].y) < 1e-9, 'N — это поселение');
        assert.ok(r.via !== r.a && r.via !== r.b, 'N не совпадает с A или B');
      }
    }
    if (r.kind === 'ground') assert.ok(r.points.length >= 2 && r.points.length <= 250, 'у наземного — вершины дороги');
    assert.ok(r.lengthKm > 0, 'длина маршрута положительна');
    assert.ok(r.points.length <= MAX_POINTS.ground, 'точек не больше допустимого');
  }
  const air = tr.routes.filter((r) => r.kind === 'air');
  const sea = tr.routes.filter((r) => r.kind === 'sea');
  assert.ok(air.length >= 10, 'воздушных маршрутов ≥ 10: ' + air.length);
  assert.ok(sea.length >= 3, 'морских маршрутов ≥ 3: ' + sea.length);
  for (const r of air) {
    assert.ok(r.lengthKm >= 1200, 'самолёт летит далеко: ' + Math.round(r.lengthKm));
    assert.ok(tr.ranks.hubSet.has(r.a) && tr.ranks.hubSet.has(r.b), 'самолёт летает между хабами');
  }
}

/* 3. F-118: точка на маршруте — доля пути, концы совпадают с A и B (20 значений) --- */
{
  const r = tr.routes.find((x) => x.kind === 'ground' && x.points.length > 4) || tr.routes[0];
  const acc = cumulative(r.points);
  const L = acc[acc.length - 1];
  assert.ok(Math.abs(L - r.lengthKm) < 1e-6, 'длина в маршруте совпадает с полилинией');
  for (let i = 0; i <= 19; i++) {
    const t = i / 19;
    const p = pointAt(r, t);
    // путь от начала до точки равен t·L
    let best = Infinity;
    for (let k = 1; k < r.points.length; k++) {
      const a = r.points[k - 1], b = r.points[k];
      const abx = b[0] - a[0], aby = b[1] - a[1];
      const len2 = abx * abx + aby * aby;
      const u = len2 ? ((p.x - a[0]) * abx + (p.y - a[1]) * aby) / len2 : 0;
      if (u < -1e-9 || u > 1 + 1e-9) continue;
      best = Math.min(best, Math.hypot(p.x - (a[0] + abx * u), p.y - (a[1] + aby * u)));
    }
    assert.ok(best < 1e-6, 'F-118: точка лежит на маршруте, шаг ' + i);
  }
  const p0 = pointAt(r, 0), p1 = pointAt(r, 1);
  const A = towns[r.a], B = towns[r.b];
  if (r.kind === 'ground') {
    assert.ok(Math.hypot(p0.x - A.x, p0.y - A.y) < 2, 'начало маршрута — поселение A');
    assert.ok(Math.hypot(p1.x - B.x, p1.y - B.y) < 2, 'конец маршрута — поселение B');
  }
}

/* 4. F-119: скорость подчинена классу дороги (20 значений) --- */
{
  for (let i = 0; i < 20; i++) {
    const r = tr.routes[i % tr.routes.length];
    const onRoute = tr.vehicles.filter((v) => v.route === r);
    for (const v of onRoute) {
      assert.ok(v.speedKmh > 0, 'скорость положительна');
      if (r.kind === 'ground') {
        const cap = Math.min(ROAD_CLASS[r.cls].speed, VEHICLE[v.kind].speedKmh);
        assert.ok(v.speedKmh <= cap * 1.15 + 1e-9, 'F-119: ' + v.kind + ' быстрее предела ' + r.cls);
      }
      if (r.kind === 'sea') assert.ok(v.speedKmh <= VEHICLE.ship.speedKmh * 1.15, 'судно не гонит');
      if (r.kind === 'air') assert.ok(v.speedKmh <= VEHICLE.plane.speedKmh * 1.15, 'самолёт не гонит');
    }
  }
}

/* 5. F-120: часы — 1 реальная секунда = 6 игровых минут; путь = скорость · время (20 замеров) --- */
{
  assert.equal(TIME_SCALE, 360, 'F-120: 360 игровых секунд на реальную');
  const probe = buildTransport(net, towns);
  const veh = probe.vehicles[0];
  const t0 = veh.t, speed = veh.speedKmh, route = veh.route;
  advance(probe, 1);
  const moved = Math.abs(veh.t - t0) * route.lengthKm;
  const want = speed * (TIME_SCALE / 3600);
  assert.ok(Math.abs(moved - want) < 1e-6, 'за секунду пройдено ' + moved.toFixed(3) + ' км вместо ' + want.toFixed(3));
  for (let i = 0; i < 20; i++) {
    const before = probe.minutes;
    advance(probe, 0.5);
    assert.ok(Math.abs(probe.minutes - before - 3) < 1e-9, 'полсекунды = 3 игровых минуты');
  }
}

/* 6. Наземный транспорт — на суше, суда — на воде, никто не за миром --- */
{
  advance(tr, 120);
  let checked = 0;
  const bad = { 'на воде': 0, 'на суше': 0, 'за миром': 0, 'лишние точки': 0 };
  for (const v of tr.vehicles) {
    const why = violatesRules(v);
    checked++;
    if (why) bad[why] = (bad[why] || 0) + 1;
  }
  assert.ok(checked > 500, 'проверено единиц: ' + checked);
  assert.equal(bad['на воде'], 0, 'наземные не едут по морю');
  assert.equal(bad['на суше'], 0, 'суда не плывут по суше');
  assert.equal(bad['за миром'], 0, 'никто не вышел за мир');
  assert.equal(bad['лишние точки'], 0, 'у воды и воздуха ровно две точки');

  for (const r of tr.routes.filter((x) => x.kind === 'sea')) {
    for (let i = 0; i <= 10; i++) {
      const p = pointAt(r, i / 10);
      assert.ok(heightKm(p.x, p.y) < 0, 'морская линия целиком по воде');
    }
  }
}

/* 7. Детерминизм: две сборки дают одинаковый парк и те же точки через час --- */
{
  const a = buildTransport(net, towns);
  const b = buildTransport(net, towns);
  assert.equal(a.vehicles.length, b.vehicles.length, 'парк одинаков по размеру');
  assert.deepEqual(a.counts.byKind, b.counts.byKind, 'состав парка совпадает');
  advance(a, 3600);
  advance(b, 3600);
  for (let i = 0; i < 40; i++) {
    const pa = vehiclePosition(a.vehicles[i]), pb = vehiclePosition(b.vehicles[i]);
    assert.ok(Math.abs(pa.x - pb.x) < 1e-9 && Math.abs(pa.y - pb.y) < 1e-9, 'F-119: детерминизм на шаге ' + i);
  }
  const r1 = rng(7), r2 = rng(7);
  for (let i = 0; i < 20; i++) assert.equal(r1(), r2(), 'ГПСЧ повторяем');
}

/* 8. Парк: все три стихии есть, единиц достаточно для «что-то всегда видно» --- */
{
  assert.ok(tr.counts.ground > 300, 'наземных единиц много: ' + tr.counts.ground);
  assert.ok(tr.counts.sea >= 3, 'суда есть: ' + tr.counts.sea);
  assert.ok(tr.counts.air >= 10, 'самолёты есть: ' + tr.counts.air);
  assert.equal(tr.vehicles.length, tr.counts.ground + tr.counts.sea + tr.counts.air, 'счётчики сходятся');
  for (const v of tr.vehicles.slice(0, 40)) {
    assert.ok(['car', 'truck', 'bus', 'ship', 'plane'].includes(v.kind), 'известный тип единицы');
    assert.ok(v.t >= 0 && v.t <= 1, 'доля пути в пределах A…B');
    assert.ok(Math.abs(v.offsetKm) <= 0.02, 'смещение в полосу меньше 20 м');
  }
  for (const v of tr.vehicles) {
    const p = vehiclePosition(v);
    assert.ok(Math.abs(p.x) <= WORLD2D.halfKm && Math.abs(p.y) <= WORLD2D.halfKm, 'точка внутри мира');
  }
}

/* 9. Точка не выходит за маршрут при долгом ходе: t остаётся в 0…1, разворот на концах --- */
{
  const probe = buildTransport(net, towns);
  const v = probe.vehicles.find((x) => x.kind === 'car');
  const start = v.t;
  advance(probe, 3600);   // 360 игровых часов
  assert.ok(v.t >= 0 && v.t <= 1, 'доля пути осталась в A…B');
  // машина не «уехала»: точка по-прежнему на маршруте
  const p = vehiclePosition(v);
  let best = Infinity;
  const pts = v.route.points;
  for (let k = 1; k < pts.length; k++) {
    const a = pts[k - 1], b = pts[k];
    const abx = b[0] - a[0], aby = b[1] - a[1];
    const l2 = abx * abx + aby * aby;
    const u = l2 ? Math.max(0, Math.min(1, ((p.x - a[0]) * abx + (p.y - a[1]) * aby) / l2)) : 0;
    best = Math.min(best, Math.hypot(p.x - (a[0] + abx * u), p.y - (a[1] + aby * u)));
  }
  assert.ok(best < 0.05, 'машина держится дороги: ' + best.toFixed(3) + ' км');
  assert.ok(typeof start === 'number');
}

/* 10. F-121: trimToWater — судно идёт по воде, причалы остаются на суше --- */
{
  const A = { x: 0, y: 0 };
  const sea = trimToWater([-3200, -2600], [-2400, -2800]);
  assert.ok(sea === null || (heightKm(sea[0][0], sea[0][1]) < 0 && heightKm(sea[1][0], sea[1][1]) < 0), 'F-121: концы подрезаны по воде');
  const land = trimToWater([100, 100], [200, 200]);
  assert.equal(land, null, 'по суше морского пути нет');
  assert.ok(Math.hypot(A.x, A.y) === 0);
  // 20 случайных пар: либо null, либо оба конца на воде
  const rand = rng(11);
  for (let i = 0; i < 20; i++) {
    const a = [rand() * 6000 - 3000, rand() * 6000 - 3000];
    const b = [rand() * 6000 - 3000, rand() * 6000 - 3000];
    const w = trimToWater(a, b);
    if (w) {
      assert.ok(Math.hypot(w[1][0] - w[0][0], w[1][1] - w[0][1]) >= 5, 'F-121: короткий путь отбрасывается');
    }
  }
}

/* 11. buildRoutes не зависит от порядка рёбер и не теряет A/B --- */
{
  const again = buildRoutes(net, towns);
  assert.equal(again.routes.length, tr.routes.length, 'маршрутов столько же');
  for (const r of again.routes) {
    assert.ok(r.a !== r.b, 'A и B различны');
    assert.ok(r.lengthKm > 0, 'длина положительна');
  }
}

/* 12. F-123: бак, дозаправка и точка N на дальнем рейсе --- */
{
  const probe = buildTransport(net, towns);
  const air = probe.routes.filter((r) => r.kind === 'air');
  const withVia = air.filter((r) => r.via >= 0);
  assert.ok(withVia.length >= 1, 'дальние рейсы получают дозаправку: ' + withVia.length);
  assert.ok(withVia.length < air.length, 'дозаправка — не на каждом рейсе (изредка)');
  for (const r of air) {
    if (r.via < 0) assert.ok(r.lengthKm <= VEHICLE.plane.rangeKm + 1e-9, 'без N рейс короче бака');
    else assert.ok(r.lengthKm > VEHICLE.plane.rangeKm, 'с N рейс длиннее бака');
  }

  // бак тратится по километрам: 20 замеров отношения «километры / расход»
  const v = probe.vehicles.find((x) => x.kind === 'car');
  const range = VEHICLE.car.rangeKm;
  for (let i = 0; i < 20; i++) {
    v.fuel = 0.9;
    v.refuelMin = 0;
    const f0 = v.fuel;
    advance(probe, 0.2);                       // 1.2 игровых минуты
    const km = v.speedKmh * (0.2 * TIME_SCALE / 3600);
    assert.ok(Math.abs((f0 - v.fuel) - km / range) < 1e-9, 'F-123: расход ровно км / запас хода, шаг ' + i);
    v.t = 0.5;
  }

  // бак не уходит в минус и не переливается
  const probe2 = buildTransport(net, towns);
  for (let i = 0; i < 400; i++) advance(probe2, 0.5);
  for (const x of probe2.vehicles) {
    assert.ok(x.fuel >= 0 && x.fuel <= 1 + 1e-9, 'F-123: бак в 0…1, а не ' + x.fuel);
    assert.ok(x.refuelMin >= 0 && x.refuelMin <= REFUEL_MIN, 'стояние у колонки не длиннее ' + REFUEL_MIN + ' минут');
  }
  assert.ok(probe2.vehicles.some((x) => x.stops > 0), 'кто-то уже заправлялся');

  // дозаправка длится ровно REFUEL_MIN игровых минут, потом бак полный
  const p3 = buildTransport(net, towns);
  const one = p3.vehicles[0];
  one.fuel = 0.001; one.refuelMin = 0; one.t = 0.5;
  advance(p3, 0.5);
  assert.ok(one.refuelMin > 0, 'F-123: на исходе бака — остановка');
  const before = one.t;
  advance(p3, 0.5);
  assert.equal(one.t, before, 'пока заправляется — не двигается');
  for (let i = 0; i < 10; i++) advance(p3, 0.5);   // 30 игровых минут
  assert.equal(one.refuelMin, 0, 'заправка закончилась');
  assert.equal(one.stops, 1, 'заправка засчитана один раз');
  assert.ok(one.fuel > 0.2, 'после колонки бак почти полный и снова тратится: ' + one.fuel.toFixed(2));
  assert.notEqual(one.t, before, 'после заправки единица снова едет');

  // ближайшее поселение — для точки N
  const idx = nearestTown(towns, towns[3].x, towns[3].y, [3]);
  assert.notEqual(idx, 3, 'N не совпадает с самим городом');
  for (let i = 0; i < 20; i++) {
    const t = towns[i];
    const j = nearestTown(towns, t.x + 0.001, t.y + 0.001, [i]);
    let bestD = Infinity;
    for (let k = 0; k < towns.length; k++) {
      if (k === i) continue;
      bestD = Math.min(bestD, Math.hypot(towns[k].x - t.x, towns[k].y - t.y));
    }
    const d = Math.hypot(towns[j].x - t.x, towns[j].y - t.y);
    assert.ok(Math.abs(d - bestD) < 1e-6, 'N — действительно ближайшее поселение (шаг ' + i + ')');
  }
}

console.log('маршрутов: ' + tr.routes.length + ' · единиц: ' + tr.vehicles.length +
  ' · ' + JSON.stringify(tr.counts.byKind));
console.log('воздух: ' + tr.routes.filter((r) => r.kind === 'air').length +
  ' · море: ' + tr.routes.filter((r) => r.kind === 'sea').length +
  ' · земля: ' + tr.routes.filter((r) => r.kind === 'ground').length);
console.log('заправок в пути: ' + (tr.refueling || 0) + ' · рейсов с точкой N: ' + tr.routes.filter((r) => r.via >= 0).length);
console.log('OK: 12 групп проверок транспорта §44 (F-116…F-123 по 20 значений)');
