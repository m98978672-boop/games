/* Кадры §76: дождь в городе, туман в низине, снег зимой и облака над страной.
   Рисует тот же код карты, что и в браузере. Запуск: node tools/shot-weather.mjs → docs/weather.png */
import { createCanvas } from '@napi-rs/canvas';
import { writeFileSync } from 'node:fs';
import { settlements, rankSettlements } from '../src/world2d.js';
import { buildRoads } from '../src/roads2d.js';
import { buildWater } from '../src/rivers2d.js';
import { buildBorders } from '../src/borders2d.js';
import { weatherAt } from '../src/weather2d.js';

const noop = () => {};
const hudMock = () => new Proxy({}, { get: () => ({ textContent: '', innerHTML: '', style: {}, classList: { add: noop, remove: noop }, addEventListener: noop, setAttribute: noop }), set: () => true });

globalThis.window = { devicePixelRatio: 1, addEventListener: noop, innerWidth: 1200, innerHeight: 900 };
globalThis.document = {
  createElement: (tag) => {
    const c = createCanvas(320, 460);
    c.getBoundingClientRect = () => ({ left: 0, top: 0, width: c.width, height: c.height });
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

const SW = 312, SH = 440;
const out = createCanvas(SW * 4 + 50, SH + 28);
const octx = out.getContext('2d');
octx.fillStyle = '#161c1a';
octx.fillRect(0, 0, out.width, out.height);

/* ищем точки мира, где сейчас нужная погода */
const want = { rain: null, fog: null, snow: null, cloudy: null };
for (const day of [0, 230]) {
  // кадры делаем днём: ночью и дождь, и снег читаются хуже
  for (let mins = 7 * 60; mins <= 20 * 60; mins += 30) {
    for (const t of towns) {
      const w = weatherAt(t.x, t.y, mins, day);
      if (!want[w.kind] && w.intensity > 0.35) want[w.kind] = { t, mins, day, w };
    }
  }
  if (want.snow) break;
}

const frame = (index, spot, scale, ticks = 6) => {
  const canvas = createCanvas(SW, SH);
  canvas.getBoundingClientRect = () => ({ left: 0, top: 0, width: SW, height: SH });
  const map = new Map2D(canvas, hudMock());
  map.resize();
  map.settlements = towns;
  map.ranks = ranks;
  map.roads = roads;
  map.water = water;
  map.borders = borders;
  map.showPlay = false;
  map.buildTransport();
  map.buildEconomy();
  map.buildRailLayer();
  map.buildAirLayer();
  map.buildSeaLayer();
  map.scale = scale;
  map.center = { x: spot.t.x, y: spot.t.y };
  map.transport.minutes = spot.day * 1440 + spot.mins;
  map.light = null;
  map.updateLight();
  for (let i = 0; i < ticks; i++) map.tick(0.4);
  map.draw();
  octx.drawImage(canvas, 10 + index * (SW + 10), 18);
  return map;
};

const shots = [
  ['rain', 62], ['fog', 62], ['snow', 62], ['cloudy', 0.16]
];
const made = [];
for (let i = 0; i < shots.length; i++) {
  const [kind, scale] = shots[i];
  const spot = want[kind] || want[shots[0][0]];
  const map = frame(i, spot, scale, kind === 'cloudy' ? 2 : 8);
  made.push(kind + ' @ ' + spot.t.name);
  if (kind === 'cloudy') {
    // на обзоре страны туман и дождь не читаются, поэтому кадр рисуем на весь мир
    map.showWeather = true;
  }
}
writeFileSync(new URL('../docs/weather.png', import.meta.url), out.toBuffer('image/png'));
console.log('weather.png · ' + made.join(' · '));
