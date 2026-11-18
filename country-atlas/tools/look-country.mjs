/* Кадр карты страны (основная игра) — чтобы сравнивать её с картой мира.
   Запуск: node tools/look-country.mjs [1600x960] [файл] [country|city|region]
   Нужен @napi-rs/canvas: npm i --no-save @napi-rs/canvas gifenc */
import { createCanvas } from '@napi-rs/canvas';
import { writeFileSync } from 'node:fs';
import { settlements, rankSettlements } from '../src/world2d.js';
import { buildRoads } from '../src/roads2d.js';
import { buildWater } from '../src/rivers2d.js';
import { buildBorders } from '../src/borders2d.js';
import { autoScale, startCenter } from '../src/fit2d.js';

const noop = () => {};
const hudMock = () => new Proxy({}, { get: () => ({ textContent: '', innerHTML: '', style: {}, classList: { add: noop, remove: noop }, addEventListener: noop, setAttribute: noop }), set: () => true });

const arg = process.argv[2] || '1600x960';
const [w, h] = arg.split('x').map(Number);
const out = process.argv[3] || 'docs/look-country.png';
const mode = process.argv[4] || 'country';

globalThis.window = { devicePixelRatio: 1, addEventListener: noop, innerWidth: w, innerHeight: h };
globalThis.document = {
  createElement: () => {
    const c = createCanvas(w, h);
    c.getBoundingClientRect = () => ({ left: 0, top: 0, width: w, height: h });
    return c;
  },
  getElementById: () => null,
  addEventListener: noop,
  hidden: false,
  body: { appendChild: noop }
};

const { Map2D } = await import('../src/map2d.js');
const towns = settlements();
const ranks = rankSettlements(towns, 10);
const roads = buildRoads();
const water = buildWater(roads);
const borders = buildBorders(towns, ranks);

const canvas = createCanvas(w, h);
canvas.getBoundingClientRect = () => ({ left: 0, top: 0, width: w, height: h });
const map = new Map2D(canvas, hudMock());
map.resize();
map.view.w = w; map.view.h = h;
map.settlements = towns;
map.ranks = ranks;
map.roads = roads;
map.water = water;
map.borders = borders;
map.buildTransport();
map.buildEconomy();
map.buildRailLayer();
map.buildAirLayer();
map.buildSeaLayer();
map.autoFit = true;
map.fitMode = mode;
map.scale = autoScale({ w, h }, mode, false);
map.center = startCenter(towns, mode);
map.transport.minutes = 100 * 1440 + 11 * 60;
map.overviewLocal(700);   // рельеф: без него карта страны рисуется одним тёмным фоном
map.light = null;
map.updateLight();
for (let i = 0; i < 4; i++) map.tick(0.4);
map.draw();
writeFileSync(out, canvas.toBuffer('image/png'));
console.log('ok ' + w + '×' + h + ' · ' + mode + ' · масштаб ' + map.scale.toFixed(3) + ' px/км → ' + out);
