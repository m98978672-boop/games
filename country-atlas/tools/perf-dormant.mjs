/* Замер §79: пешеходы невидимых городов больше не тикают по шагам.
   Сравниваем два одинаковых прогона — «как раньше» (все города каждый кадр) и «со сном» —
   и проверяем, что положение пешеходов в спящих городах совпадает до нанометра.
   Запуск: node tools/perf-dormant.mjs */
import { settlements, rankSettlements } from '../src/world2d.js';
import { buildCity } from '../src/city2d.js';
import { buildPedestrians, advancePeds } from '../src/ped2d.js';
import { buildCrowd } from '../src/pedsoc2d.js';
import { Dormancy, DORMANT } from '../src/dormant2d.js';

const towns = settlements();
const ranks = rankSettlements(towns, 10);
const N = 18;                          // столько городов «в памяти» — как при долгой игре

const cityCache = new Map();
const cityOf = (i) => {
  if (!cityCache.has(i)) cityCache.set(i, buildCity(towns[i], i, ranks));
  return cityCache.get(i);
};

const packsA = [], packsB = [];
for (let i = 0; i < N; i++) {
  packsA.push(buildPedestrians(cityOf(i), i));
  packsB.push(buildPedestrians(cityOf(i), i));
}
const peds = packsA.reduce((a, p) => a + p.peds.length, 0);

/* камера смотрит на два города: 0 и 1 */
const view = { w: 900, h: 640 };
const makeMap = (packs) => ({
  center: { x: towns[0].x, y: towns[0].y }, scale: 45, showPeds: true, view,
  settlements: towns.slice(0, N), pedCache: new Map(packs.map((p, i) => [i, p])),
  crowds: new Map(),
  cityAt: cityOf,
  // как в жизни: город, поднятый из архива, собирается заново из того же сида
  pedsAt(i) {
    if (!this.pedCache.has(i)) this.pedCache.set(i, buildPedestrians(cityOf(i), i));
    return this.pedCache.get(i);
  },
  crowdAt(i) {
    if (!this.crowds.has(i)) this.crowds.set(i, buildCrowd(this.pedCache.get(i), 424242 + i));
    return this.crowds.get(i);
  }
});

const mapA = makeMap(packsA);
const mapB = makeMap(packsB);
const dorm = new Dormancy();

/* «как раньше»: все города шагают каждый кадр */
const frames = 3600;                      // 60 с: успевает сработать архив (45 с)
const dt = 1 / 60;
let t0 = performance.now();
for (let f = 0; f < frames; f++) for (const p of mapA.pedCache.values()) advancePeds(p, dt);
const msOld = performance.now() - t0;

/* §79: шагают только видимые */
t0 = performance.now();
let stats = null;
for (let f = 0; f < frames; f++) stats = dorm.step(mapB, dt);
const msNew = performance.now() - t0;

/* совпадение: будим все города и сравниваем с непрерывным ходом.
   Спящий город по определению отстал — сверяем после догона, иначе сравниваем тёплое с мягким. */
mapB.center = { x: towns[0].x, y: towns[0].y };
mapB.scale = 0.02;                       // весь мир в кадре — все города просыпаются
const before = { sleep: dorm.sleep.size, arch: dorm.arch.size };
const after = dorm.step(mapB, dt);
let worst = 0, compared = 0;
for (let i = 0; i < N; i++) {
  const a = mapA.pedCache.get(i), b = mapB.pedCache.get(i);
  if (!a || !b || a.peds.length !== b.peds.length) continue;
  compared++;
  for (let k = 0; k < a.peds.length; k++) worst = Math.max(worst, Math.abs(a.peds[k].t - b.peds[k].t));
}
if (compared < N) { console.error('ПРОВАЛ: сравнили только ' + compared + ' городов из ' + N); process.exit(1); }

const perFrame = (ms) => (ms / frames).toFixed(4);
const speedup = (msOld / Math.max(1e-9, msNew)).toFixed(1);

console.log('городов в памяти: ' + N + ' · пешеходов: ' + peds);
console.log('раньше: ' + perFrame(msOld) + ' мс/кадр · сейчас: ' + perFrame(msNew) + ' мс/кадр · ускорение ' + speedup + '×');
console.log('до пробуждения: спят ' + before.sleep + ' городов · в архиве ' + before.arch +
  ' · сжато ' + Math.round((stats ? stats.savedBytes : 0) / 1024) + ' КБ (' + (stats ? stats.archivedPeds : 0) + ' пешеходов)');
console.log('после пробуждения: поднято ' + after.restored + ' · догон ' + after.restSec.toFixed(1) + ' с · в кадре ' + after.awake + ' городов');
console.log('расхождение положения: ' + worst.toExponential(2) + ' км (порог 1e-6)');
if (!(worst < 1e-6)) { console.error('ПРОВАЛ: сжатие изменило положение пешеходов'); process.exit(1); }
console.log('ok · квитанция архива ' + (DORMANT.bytesPerPed) + ' Б на живого против 4 Б в архиве');
