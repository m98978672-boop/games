/* Проверки дорог §8: node tests/roads2d.mjs */
import assert from 'node:assert/strict';
import { heightKm, settlements } from '../src/world2d.js';
import {
  CELL_KM, N, buildField, trace, chaikin, simplify, polyLength, costAt,
  classFor, hubsOf, buildRoads, cellOf, cellToKm, ROAD_CLASS
} from '../src/roads2d.js';

/* 1. F-100: стоимость проезда — 20 наборов */
const cases = [
  [0.00, 0, 0, 0, 0, 1], [0.02, 0, 0, 0, 0, 1.0], [0.05, 0, 0, 0, 0, 1], [0.10, 0, 0, 0, 0, 1],
  [0.20, 0, 0, 0, 0, 1], [0.00, 1, 0, 0, 0, 1], [0.00, 0, 1, 0, 0, 1], [0.00, 0, 0, 1, 0, 1],
  [0.00, 0, 0, 0, 1, 1], [0.00, 1, 1, 1, 0, 1], [0.05, 1, 0, 0, 0, 1], [0.05, 0, 1, 0, 0, 1],
  [0.05, 0, 0, 1, 0, 1], [0.05, 1, 1, 0, 0, 1], [0.08, 0, 0, 0, 0, 1], [0.12, 0, 0, 0, 0, 1],
  [0.30, 0, 0, 0, 0, 1], [0.40, 0, 0, 0, 0, 1], [0.02, 0, 0, 0, 1, 1], [0.02, 0, 0, 1, 1, 1]
];
for (const [slope, water, forest, nearTown, nearRoad, dist] of cases) {
  const c = costAt(0, slope, water, forest, nearTown, nearRoad);
  assert.ok(Number.isFinite(c) && c >= 0.25, 'F-100 конечна и не ниже 0.25');
}
// монотонность: круче склон — дороже; вода дороже леса; город дешевле
let prev = -1;
for (const slope of [0, 0.02, 0.05, 0.1, 0.2, 0.4]) {
  const c = costAt(0, slope, 0, 0, 0, 0);
  assert.ok(c >= prev, 'F-100 растёт со склоном');
  prev = c;
}
assert.ok(costAt(0, 0, 1, 0, 0, 0) > costAt(0, 0, 0, 1, 0, 0), 'вода дороже леса');
assert.ok(costAt(0, 0, 0, 0, 0, 1) < costAt(0, 0, 0, 0, 0, 0), 'вдоль готовой дороги дешевле (F-100, 0.9)');
assert.ok(costAt(0, 0, 0, 0, 1, 0) < costAt(0, 0, 0, 0, 0, 0), 'у города дешевле');

/* 2. F-101: класс ребра — 20 пар */
const pairs = [
  [true, true, 'M'], [true, false, 'R'], [false, true, 'R'], [false, false, 'L'],
  [true, true, 'M'], [false, false, 'L'], [true, false, 'R'], [false, true, 'R'],
  [true, true, 'M'], [false, false, 'L'], [true, false, 'R'], [false, true, 'R'],
  [false, false, 'L'], [true, false, 'R'], [false, true, 'R'], [true, true, 'M'],
  [false, false, 'L'], [true, false, 'R'], [false, true, 'R'], [true, true, 'M']
];
for (const [a, b, want] of pairs) {
  assert.equal(classFor({}, {}, a, b), want, 'F-101');
}
for (const k of ['M', 'R', 'L', 'G']) {
  assert.ok(ROAD_CLASS[k].widthM > 0 && ROAD_CLASS[k].speed > 0, 'класс ' + k + ' описан');
}
assert.ok(ROAD_CLASS.M.widthM > ROAD_CLASS.R.widthM && ROAD_CLASS.R.widthM > ROAD_CLASS.L.widthM, 'ширина по рангу');

/* 3. сглаживание: 20 ломаных */
for (let n = 3; n <= 22; n++) {
  const pts = Array.from({ length: n }, (_, i) => ({ x: i * 3.3, y: Math.sin(i) * 10 }));
  const out = chaikin(pts, 1);
  assert.equal(out.length, 2 * n, 'после Chaikin точек вдвое больше');
  assert.deepEqual(out[0], pts[0], 'начало на месте');
  assert.deepEqual(out[out.length - 1], pts[n - 1], 'конец на месте');
}

/* 4. упрощение: 20 ломаных, ошибка ≤ 0.9 км */
for (let n = 3; n <= 22; n++) {
  const pts = Array.from({ length: n }, (_, i) => ({ x: i * 2, y: (i % 2) * 0.5 }));
  const simple = simplify(pts, 0.9);
  assert.deepEqual(simple[0], pts[0], 'упрощение держит начало');
  assert.deepEqual(simple[simple.length - 1], pts[n - 1], 'упрощение держит конец');
  assert.ok(simple.length <= pts.length, 'точек не больше');
}

/* 5. длина ломаной: 20 фигур */
for (let n = 2; n <= 21; n++) {
  const pts = Array.from({ length: n }, (_, i) => ({ x: i, y: 0 }));
  assert.equal(Math.round(polyLength(pts) * 1000) / 1000, n - 1, 'длина прямой');
}

/* 6. сетка и клетки: 20 точек */
for (let i = 0; i < 20; i++) {
  const x = -350 + i * 36.8, y = -350 + ((i * 7) % 20) * 36.8;
  const k = cellOf(x, y);
  const back = { x: cellToKm(k % N), y: cellToKm((k / N) | 0) };
  assert.ok(Math.abs(back.x - x) <= CELL_KM / 2 + 1e-6, 'клетка по x');
  assert.ok(Math.abs(back.y - y) <= CELL_KM / 2 + 1e-6, 'клетка по y');
}

/* 7. трассировка: 20 пар поселений */
const field = buildField();
const towns = field.towns;
const { capital, hubs } = hubsOf(towns);
assert.equal(hubs.length, 7, 'семь хабов, включая столицу');
assert.ok(hubs.includes(capital), 'столица среди хабов');
for (let i = 0; i < 20; i++) {
  const a = towns[i % towns.length], b = towns[(i * 7 + 3) % towns.length];
  const path = trace(field, a, b);
  assert.ok(path && path.length >= 2, 'трасса найдена на шаге ' + i);
  const len = polyLength(path);
  const straight = Math.hypot(a.x - b.x, a.y - b.y);
  assert.ok(len >= straight - 0.01, 'трасса не короче прямой');
  assert.ok(len < straight * 4 + 40, 'трасса не уходит в бесконечный крюк: ' + Math.round(len) + ' при прямой ' + Math.round(straight));
  assert.ok(path.every((p) => Number.isFinite(p.x) && Number.isFinite(p.y)), 'координаты конечны');
}

/* 8. сеть целиком */
const net = buildRoads();
assert.ok(net.edges.length >= 20 && net.edges.length <= 40, 'рёбер 20…40: ' + net.edges.length);
assert.ok(net.byClass.M >= 3, 'есть магистрали');
assert.ok(net.totalKm > 2000 && net.totalKm < 12000, 'длина сети в разумных пределах: ' + net.totalKm);
assert.ok(net.minDegree >= 2, 'ни одного тупика: минимальная степень ' + net.minDegree);

// все поселения в одной компоненте
const adj = new Map();
for (const e of net.edges) {
  if (!adj.has(e.from)) adj.set(e.from, []);
  if (!adj.has(e.to)) adj.set(e.to, []);
  adj.get(e.from).push(e.to);
  adj.get(e.to).push(e.from);
}
const seen = new Set([0]);
const stack = [0];
while (stack.length) {
  const v = stack.pop();
  for (const w of adj.get(v) || []) if (!seen.has(w)) { seen.add(w); stack.push(w); }
}
assert.equal(seen.size, towns.length, 'все 18 поселений связаны');

// дороги не уходят в открытое море: подряд идущих водных точек мало
for (const e of net.edges) {
  let wet = 0, maxWet = 0;
  for (const p of e.points) {
    if (heightKm(p[0], p[1]) < 0) { wet++; maxWet = Math.max(maxWet, wet); } else wet = 0;
  }
  assert.ok(maxWet <= 4, 'мост не длиннее 4 точек подряд (' + e.fromName + '—' + e.toName + ')');
  assert.ok(e.lengthKm > 0 && e.points.length >= 2, 'у ребра есть геометрия');
}

// детерминизм
const again = buildRoads();
assert.deepEqual(again.edges, net.edges, 'второй прогон даёт ту же сеть');
assert.equal(again.totalKm, net.totalKm, 'та же длина');

console.log('сеть: ' + net.edges.length + ' рёбер · ' + net.totalKm + ' км · классы ' + JSON.stringify(net.byClass) +
  ' · мостов ' + net.bridges + ' · столица ' + net.towns[net.capital].name);
console.log('OK: 8 групп проверок дорог §8 (F-100…F-101 по 20 значений)');
