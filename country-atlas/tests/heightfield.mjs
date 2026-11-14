/* Проверки рельефа A28 без браузера: node tests/heightfield.mjs */
import assert from 'node:assert/strict';
import { generateChunk, WORLD, heightRaw, ridge } from '../src/heightfield.js';

// 1. детерминизм
const a = generateChunk(2, 3), b = generateChunk(2, 3);
assert.equal(a.heights.length, (WORLD.cells + 1) ** 2, 'чанк должен быть 65×65');
assert.ok(a.heights.every((v, i) => v === b.heights[i]), 'два вызова дают одинаковый рельеф');

// 2. диапазон и конечность
for (const c of [generateChunk(0, 0), generateChunk(5, 5), generateChunk(1, 4)]) {
  assert.ok(Number.isFinite(c.min) && Number.isFinite(c.max), 'min/max конечны');
  assert.ok(c.min >= -6.001, 'ниже дна не бывает: ' + c.min);
  assert.ok(c.max <= 140, 'выше 140 м не бывает: ' + c.max);
}

// 3. вода есть, но не всюду
let total = 0, water = 0;
for (let cy = 0; cy < WORLD.chunks; cy++) for (let cx = 0; cx < WORLD.chunks; cx++) {
  const c = generateChunk(cx, cy);
  for (const h of c.heights) { total++; if (h < WORLD.waterLevel) water++; }
}
const share = water / total;
assert.ok(share > 0.03 && share < 0.3, 'вода занимает 3–30 % мира, а не ' + (share * 100).toFixed(1) + '%');

// 4. эрозия сглаживает склон
const rough = (c) => {
  let s = 0;
  for (let j = 0; j < c.n; j++) for (let i = 0; i < c.n - 1; i++) s += Math.abs(c.heights[j * c.n + i] - c.heights[j * c.n + i + 1]);
  return s;
};
const noErosion = generateChunk(2, 2, { erosion: 0 });
const withErosion = generateChunk(2, 2, { erosion: WORLD.erosion });
assert.ok(rough(withErosion) <= rough(noErosion) + 1e-3, 'эрозия не увеличивает крутизну');

// 5. высота точки на краю мира не ломается
assert.ok(Number.isFinite(heightRaw(-299.5, 299.5)), 'край мира считается');

// 6. гребень по F-79 в диапазоне [0,1]
for (let i = 0; i <= 20; i++) {
  const r = ridge(i / 20);
  assert.ok(r >= 0 && r <= 1, 'ridge вне [0,1]: ' + r);
}

console.log('рельеф: чанк ' + a.heights.length + ' точек, мир ' + (WORLD.chunks * WORLD.chunkSize) + ' м');
console.log('высота: ' + a.min.toFixed(1) + '…' + a.max.toFixed(1) + ' м, вода ' + (share * 100).toFixed(1) + ' %');
console.log('эрозия: шероховатость ' + rough(noErosion).toFixed(0) + ' → ' + rough(withErosion).toFixed(0));
console.log('OK: 6 групп проверок рельефа');
