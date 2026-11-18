/* Кадр карты мира в PNG — чтобы смотреть вид кода, а не гадать.
   Запуск: node tools/look-world.mjs [1600x960 | phone] [файл]
   Нужен @napi-rs/canvas: npm i --no-save @napi-rs/canvas gifenc */
import { createCanvas } from '@napi-rs/canvas';
import { writeFileSync } from 'node:fs';
import { buildWorld, advanceWars } from '../src/worldmap2d.js';
import { WorldView } from '../src/worldview.js';

globalThis.document = { createElement: (t) => (t === 'canvas' ? createCanvas(1, 1) : { style: {} }) };
globalThis.window = { devicePixelRatio: 1 };

const arg = process.argv[2] || '1600x960';
const [w, h] = arg === 'phone' ? [390, 844] : arg.split('x').map(Number);
const out = process.argv[3] || (arg === 'phone' ? 'docs/world-map-phone.png' : 'docs/world-map.png');

const world = buildWorld(424242);
for (let t = 0; t <= 60 * 24 * 11; t += 45) advanceWars(world, 9000 + t);

const cv = createCanvas(w, h);
cv.getBoundingClientRect = () => ({ left: 0, top: 0, width: w, height: h });
const view = new WorldView(cv, { createCanvas: (a, b) => createCanvas(a, b) });
view.resize(); view.setWorld(world);
view.step(0.02); view.step(0.02);      // два прохода базового слоя — как в игре
view.open();
view.alpha = 1;
view.draw();
writeFileSync(out, cv.toBuffer('image/png'));
console.log('ok ' + w + '×' + h + ' · масштаб ' + view.cam.scale.toFixed(4) + ' · ' + view.lastDrawMs.toFixed(1) + ' мс → ' + out);
