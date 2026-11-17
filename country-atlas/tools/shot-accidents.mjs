/* Кадры §78/§79: место ДТП в городе, затор позади, ночь с мигалкой и зимний день.
   Рисует тот же код карты, что и в браузере. Запуск: node tools/shot-accidents.mjs → docs/accidents.png */
import { createCanvas } from '@napi-rs/canvas';
import { writeFileSync } from 'node:fs';
import { settlements, rankSettlements } from '../src/world2d.js';
import { buildRoads } from '../src/roads2d.js';
import { buildWater } from '../src/rivers2d.js';
import { buildBorders } from '../src/borders2d.js';
import { vehiclePosition } from '../src/transport2d.js';
import { stepAccidents } from '../src/accidents2d.js';
import { weatherAt } from '../src/weather2d.js';

const noop = () => {};
const hudMock = () => new Proxy({}, { get: () => ({ textContent: '', innerHTML: '', style: {}, classList: { add: noop, remove: noop }, addEventListener: noop, setAttribute: noop }), set: () => true });

globalThis.window = { devicePixelRatio: 1, addEventListener: noop, innerWidth: 1200, innerHeight: 900 };
globalThis.document = {
  createElement: () => {
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

const makeMap = () => {
  const canvas = createCanvas(SW, SH);
  canvas.getBoundingClientRect = () => ({ left: 0, top: 0, width: SW, height: SH });
  const map = new Map2D(canvas, hudMock());
  map.resize();
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
  return map;
};

/* Гоняем мир, пока не случится ДТП на земле рядом с городом — иначе в кадре пустая трасса. */
const seedMap = makeMap();
seedMap.transport.minutes = 100 * 1440 + 9 * 60;
seedMap.light = null; seedMap.updateLight();
const nearestTown = (x, y) => towns.reduce((best, t) => {
  const d = Math.hypot(t.x - x, t.y - y);
  return d < best.d ? { t, d } : best;
}, { t: towns[0], d: Infinity });
let spot = null;
for (let s = 0; s < 3000 && !spot; s++) {
  seedMap.tick(0.4);
  for (const v of seedMap.transport.vehicles) {
    if (!(v.blockedMin > 0) || v.kind === 'plane' || v.kind === 'ship') continue;
    const p = vehiclePosition(v);
    const near = nearestTown(p.x, p.y);
    if (near.d < 8) { spot = { p, town: near.t, minutes: seedMap.transport.minutes, kind: v.accident && v.accident.name }; break; }
  }
}
if (!spot) {
  const town = towns[5];
  spot = { p: { x: town.x, y: town.y }, town, minutes: 100 * 1440 + 9 * 60, kind: 'сзади в бампер' };
}

/* ставим ДТП на ту машину, что ближе всех к центру кадра — она точно попадёт в кадр */
const stage = (map, n = 1) => {
  const list = [];
  for (const v of map.transport.vehicles) {
    if (v.kind === 'plane' || v.kind === 'ship') continue;
    const p = vehiclePosition(v);
    list.push({ v, d: Math.hypot(p.x - map.center.x, p.y - map.center.y) });
  }
  list.sort((a, b) => a.d - b.d);
  const picked = list.slice(0, Math.max(1, n)).map((x) => x.v);
  for (const v of picked) {
    v.blockedMin = 60;
    v.accident = { kind: 'rear', name: 'сзади в бампер', minutes: 60 };
    v.slow = 0.35;
  }
  return picked.length ? vehiclePosition(picked[0]) : null;
};

/* для четвёртого кадра ищем дождь в этой же точке: мокро — риск выше (§76) */
let rainAbs = null, rainKind = 'дожде', best = 0, snowAbs = null, bestSnow = 0;
for (let day = 0; day < 360; day += 5) {
  for (let mins = 8 * 60; mins <= 18 * 60; mins += 60) {
    const w = weatherAt(spot.p.x, spot.p.y, mins, day);
    if (w.kind === 'rain' && w.intensity > best) { best = w.intensity; rainAbs = day * 1440 + mins; }
    if (w.kind === 'snow' && w.intensity > bestSnow) { bestSnow = w.intensity; snowAbs = day * 1440 + mins; }
  }
}
if (rainAbs === null || best < 0.05) { rainAbs = snowAbs; rainKind = 'снеге'; }
const wetAbs = rainAbs !== null && (best > 0.05 || bestSnow > 0.05) ? rainAbs : null;

const shots = [
  ['ДТП вблизи', 62, spot.p, 0, 8, false, 1],
  ['ДТП у города', 12, spot.p, 0, 12, false, 1],
  ['то же ночью', 12, spot.p, 15 * 60, 12, false, 1],
  ['три ДТП на трассе', 12, spot.p, 0, 12, false, 3]
];
const made = [];
for (let i = 0; i < shots.length; i++) {
  const [label, scale, center, addMin, ticks, absolute, count] = shots[i];
  const map = makeMap();
  map.scale = scale;
  map.center = { x: center.x, y: center.y };
  map.transport.minutes = absolute ? addMin : spot.minutes + addMin;
  map.light = null; map.updateLight();
  const at = stage(map, count || 1);
  if (at) map.center = { x: at.x, y: at.y };     // камера — на само место ДТП
  for (let t = 0; t < ticks; t++) map.tick(0.4);
  map.draw();
  octx.drawImage(map.canvas, 10 + i * (SW + 10), 18);
  octx.fillStyle = 'rgba(232,238,244,0.92)';
  octx.font = '12px sans-serif';
  octx.fillText(label, 14 + i * (SW + 10), 14);
  made.push(label + ' у ' + spot.town.name + ' · меток в кадре ' + (map.accidentsInFrame || 0));
}
writeFileSync(new URL('../docs/accidents.png', import.meta.url), out.toBuffer('image/png'));
console.log('accidents.png · ' + made.join(' · '));
