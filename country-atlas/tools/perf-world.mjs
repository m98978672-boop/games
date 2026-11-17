/* Замер §86: сколько стоит кадр карты мира и что даёт кэш слоя подробностей.
   Запуск: node tools/perf-world.mjs */
import { createCanvas } from '@napi-rs/canvas';
import { buildWorld, advanceWars } from '../src/worldmap2d.js';
import { WorldView, overviewScale } from '../src/worldview.js';

const cv = () => {
  const c = createCanvas(1280, 720);
  c.getBoundingClientRect = () => ({ left: 0, top: 0, width: 1280, height: 720 });
  return c;
};

const world = buildWorld(424242);
for (let t = 0; t <= 60 * 24 * 11; t += 45) advanceWars(world, 9000 + t);

const median = (a) => a.slice().sort((x, y) => x - y)[a.length >> 1].toFixed(3);

const view = new WorldView(cv(), { createCanvas });
view.resize();
const t0 = performance.now();
view.setWorld(world);
view.step(1 / 60); view.step(1 / 60);
const baseMs = performance.now() - t0;
console.log('базовый слой (2 прохода, 900 отметок):', baseMs.toFixed(1), 'мс, один раз');

const time = (label, paint) => {
  const times = [];
  for (let i = 0; i < 120; i++) { paint(); times.push(view.lastDrawMs); }
  console.log(label, 'медиана', median(times), 'мс ·', 'p90', times.slice().sort((a, b) => a - b)[108].toFixed(3));
  return Number(median(times));
};

// 1. камера стоит на обзоре мира — так карту и смотрят
view.cam = { x: 0, y: 0, scale: overviewScale(view.view) };
const staticNow = time('обзор, камера стоит (кэш работает)', () => view.draw());

// 2. то же, но кэш выключен: слой подробностей собирается каждый кадр
view.cam = { x: 0, y: 0, scale: overviewScale(view.view) };
const noCache = time('обзор, слой подробностей каждый кадр', () => { view.detail = null; view.draw(); });

// 3. глубокий зум на город
const city = world.cities[0];
view.cam = { x: city.x, y: city.y, scale: 0.5 };
const deep = time('город вблизи (0.5 px/км), камера стоит', () => view.draw());

// 4. панорамирование: слой пересобирается на сдвигах
const panTimes = [];
for (let i = 0; i < 60; i++) { view.panBy(4, 2); view.draw(); panTimes.push(view.lastDrawMs); }
console.log('панорама (сдвиг 4 px/кадр) медиана', median(panTimes), 'мс');

// 5. переход «пролёт к планете»
const v2 = new WorldView(cv(), { createCanvas });
v2.resize(); v2.setWorld(world); v2.step(1 / 60); v2.step(1 / 60);
v2.open({ x: 0, y: 0, scale: 26 });
const tr = [];
for (let i = 0; i < 60; i++) { v2.step(1 / 60); v2.draw(); tr.push(v2.lastDrawMs); }
console.log('переход 900 мс (60 кадров) медиана', median(tr), 'мс · всего', tr.reduce((a, b) => a + b, 0).toFixed(1), 'мс');

console.log('\nитог: кэш слоя подробностей ускоряет стоящий кадр в', (noCache / staticNow).toFixed(1), 'раз');
console.log('город вблизи:', deep.toFixed(3), 'мс — прежний порядок 1.2–1.7 мс у карты страны');
