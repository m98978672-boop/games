/* Кадры ночи §74: обзор страны, город в глубоком зуме, порт с маяком — и день для сравнения.
   Рисует тот же код карты, что в браузере. Запуск: node tools/shot-night.mjs → docs/night.png */
import { createCanvas } from '@napi-rs/canvas';
import { writeFileSync } from 'node:fs';
import { settlements, rankSettlements } from '../src/world2d.js';
import { buildRoads } from '../src/roads2d.js';
import { buildWater } from '../src/rivers2d.js';
import { buildBorders } from '../src/borders2d.js';
import { lightAt, dayOfYearOf } from '../src/light2d.js';

const noop = () => {};
const hudMock = () => new Proxy({}, { get: () => ({ textContent: '', style: {}, classList: { add: noop, remove: noop }, addEventListener: noop }), set: () => true });
const el = () => ({ textContent: '', style: {}, addEventListener: noop, classList: { add: noop, remove: noop } });

globalThis.window = { devicePixelRatio: 1, addEventListener: noop, innerWidth: 1200, innerHeight: 900 };
globalThis.document = {
  createElement: () => { const c = createCanvas(320, 400); c.getBoundingClientRect = () => ({ left: 0, top: 0, width: c.width, height: c.height }); return c; },
  getElementById: el, addEventListener: noop, hidden: false, body: el()
};

const { Map2D } = await import('../src/map2d.js');
const towns = settlements();
const ranks = rankSettlements(towns, 10);
const roads = buildRoads();
const water = buildWater(roads);
const borders = buildBorders(towns, ranks);

const SW = 300, SH = 400;
const out = createCanvas(SW * 4 + 50, SH + 30);
const octx = out.getContext('2d');
octx.fillStyle = '#0b141c';
octx.fillRect(0, 0, out.width, out.height);

const scene = (index, center, scale, hour, ticks) => {
  const canvas = createCanvas(SW, SH);
  canvas.getBoundingClientRect = () => ({ left: 0, top: 0, width: SW, height: SH });
  const map = new Map2D(canvas, hudMock());
  map.resize();
  map.settlements = towns; map.ranks = ranks; map.roads = roads; map.water = water; map.borders = borders;
  map.center = center; map.scale = scale;
  map.showPeds = true;
  map.buildTransport(); map.buildEconomy(); map.buildRailLayer(); map.buildAirLayer(); map.buildSeaLayer();
  for (let i = 0; i < ticks; i++) map.tick(0.5);
  // часы ставим после прогона: тик двигает время на 3 игровых часа
  map.setClockHour(hour);
  map.light = lightAt(hour * 60, dayOfYearOf(Math.floor(map.transport.minutes / 1440)));
  map.draw();
  const px = map.ctx.getImageData(SW / 2, SH / 2, 1, 1).data;
  console.log('кадр ' + index + ': час ' + hour + ', сила света ' + map.light.strength.toFixed(2) +
    ', ночь ' + (1 - map.light.strength).toFixed(2) + ', центр ' + [...px].join(','));
  octx.drawImage(canvas, 10 + index * (SW + 10), 20);
  return map;
};

const capital = towns[0];
const port = null;
scene(0, { x: 0, y: 0 }, 0.12, 13, 30);                 // день, обзор
scene(1, { x: 0, y: 0 }, 0.12, 23, 30);                 // ночь, обзор
scene(2, { x: capital.x, y: capital.y }, 95, 23, 30);   // ночь, город
const seaMap = scene(3, { x: 0, y: 0 }, 0.9, 23, 200);  // ночь, море
writeFileSync(new URL('../docs/night.png', import.meta.url), out.toBuffer('image/png'));
console.log('night.png · ' + Math.round(out.width) + '×' + Math.round(out.height) + ' · портов ' + (seaMap.tides ? seaMap.tides.ports.length : 0));
