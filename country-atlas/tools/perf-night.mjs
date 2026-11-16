/* Замер §98 для ночи: сколько стоит пересчитывать точки света каждый кадр и сколько — брать
   их из кэша. Рядом проверяется, что результат одинаковый: кэш не меняет ни пикселя.
   Запуск: node tools/perf-night.mjs */
import { settlements, rankSettlements } from '../src/world2d.js';
import { buildCity } from '../src/city2d.js';
import { lightPoints, buildLightPoints, lightsBudget, starField } from '../src/night2d.js';

globalThis.window = globalThis.window || { addEventListener() {} };
const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
const towns = settlements();
const ranks = rankSettlements(towns, 10);
const cities = [0, 1, 2, 3].map((i) => buildCity(towns[i], i, ranks));

const N = 400;
const artificial = { windows: 1, lamps: 1, full: true };

/* как было: каждый кадр — заново */
let t0 = now();
let freshCount = 0;
for (let f = 0; f < N; f++) {
  for (const [i, city] of cities.entries()) {
    const pts = buildLightPoints(city, i);
    const budget = lightsBudget(artificial, 60, cities.length);
    for (const w of pts.windows) if (w.on <= budget.windowsFrom) freshCount++;
  }
}
const cold = (now() - t0) / N;

/* как стало: точки света посчитаны один раз */
for (const [i, city] of cities.entries()) lightPoints(city, i);
t0 = now();
let cachedCount = 0;
for (let f = 0; f < N; f++) {
  for (const [i, city] of cities.entries()) {
    const pts = lightPoints(city, i);
    const budget = lightsBudget(artificial, 60, cities.length);
    for (const w of pts.windows) if (w.on <= budget.windowsFrom) cachedCount++;
  }
}
const warm = (now() - t0) / N;

const same = JSON.stringify(cities.map((c, i) => lightPoints(c, i))) ===
  JSON.stringify(cities.map((c, i) => buildLightPoints(c, i)));

console.log('город в кадре: ' + cities.length + ', кварталов ' + cities.reduce((a, c) => a + c.blocks.length, 0));
console.log('точек света «горит»: ' + freshCount + ' за ' + N + ' кадров');
console.log('без кэша: ' + cold.toFixed(2) + ' мс на кадр');
console.log('с кэшем:  ' + warm.toFixed(2) + ' мс на кадр, ускорение ' + (cold / Math.max(1e-6, warm)).toFixed(1) + '×');
console.log('результат одинаковый: ' + (same ? 'да' : 'НЕТ') + ', точек совпало: ' + (freshCount === cachedCount ? 'да' : 'НЕТ'));

/* звёзды: поле считается один раз и живёт на карте */
const s0 = now();
for (let i = 0; i < N; i++) starField();
const starsCold = (now() - s0) / N;
const field = starField();
t0 = now();
let acc = 0;
for (let i = 0; i < N; i++) for (const st of field) acc += st.b;
const starsWarm = (now() - t0) / N;
console.log('звёзды: без кэша ' + starsCold.toFixed(3) + ' мс, с кэшем ' + starsWarm.toFixed(3) + ' мс');

if (!same || freshCount !== cachedCount) {
  console.error('кэш изменил картинку — так нельзя');
  process.exitCode = 1;
}
