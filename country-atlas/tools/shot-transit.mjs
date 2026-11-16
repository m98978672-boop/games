/* Настоящие кадры §16.7: поезд у станции, аэродром с бортами, порт у разводного моста.
   Рисует тот же код карты, что и в браузере, только на canvas из @napi-rs/canvas.
   Запуск: npm i --no-save @napi-rs/canvas && node tools/shot-transit.mjs → docs/transit.png */
import { createCanvas } from '@napi-rs/canvas';
import { writeFileSync } from 'node:fs';
import { settlements, rankSettlements } from '../src/world2d.js';
import { buildRoads } from '../src/roads2d.js';
import { buildWater } from '../src/rivers2d.js';
import { buildBorders } from '../src/borders2d.js';
import { buildRail, stepRail, pointOnLine, trainPoints, shipPoint } from '../src/transit2d.js';

const noop = () => {};
const hudMock = () => new Proxy({}, {
  get: () => ({ textContent: '', innerHTML: '', style: {}, classList: { add: noop, remove: noop }, textContentSet: true }),
  set: () => true
});

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
const rail = buildRail(roads, towns);

const SW = 312, SH = 440;
const out = createCanvas(SW * 3 + 40, SH + 28);
const octx = out.getContext('2d');
octx.fillStyle = '#161c1a';
octx.fillRect(0, 0, out.width, out.height);

/* одна «холостая» карта, чтобы построить воздух и море и взять из них координаты */
const mkMap = (w = SW, h = SH) => {
  const canvas = createCanvas(w, h);
  canvas.getBoundingClientRect = () => ({ left: 0, top: 0, width: w, height: h });
  const map = new Map2D(canvas, hudMock());
  map.resize();
  map.settlements = towns;
  map.ranks = ranks;
  map.roads = roads;
  map.water = water;
  map.borders = borders;
  map.rail = rail;
  map.hour = 11;
  map.showPlay = false;          // панель полигона в кадр не берём
  map.showCities = false;        // в кадре только микро-слой, без застройки
  map.showPeds = false;
  map.buildTransport();
  map.buildEconomy();
  map.buildAirLayer();
  map.buildSeaLayer();
  return { map, canvas };
};

const base = mkMap().map;
for (let i = 0; i < 600; i++) base.tick(0.5);   // мир живёт: борта в воздухе, суда в пути

const drawScene = (index, center, scale, ticks, tune) => {
  const { map, canvas } = mkMap();
  map.air = base.air;
  map.seaTraffic = base.seaTraffic;
  map.center = center;
  map.scale = scale;
  if (tune) tune(map);
  for (let i = 0; i < ticks; i++) map.tick(0.5);
  map.draw();
  octx.drawImage(canvas, 10 + index * (SW + 10), 18);
  return map;
};

/* 1. железная дорога: ставим состав у станции и смотрим вблизи */
const station = rail.stations[4];
let chosen = null;
for (const t of rail.trains) {
  const line = rail.lines.find((l) => l.id === t.line);
  const pts = [pointOnLine(line, 1), pointOnLine(line, line.lengthKm - 1)];
  for (const p of pts) {
    const d = Math.hypot(p.x - station.x, p.y - station.y);
    if (!chosen || d < chosen.d) chosen = { t, line, d, atEnd: p === pts[1] };
  }
}
if (chosen) {
  chosen.t.s = chosen.atEnd ? chosen.line.lengthKm - 3 : 3;
  chosen.t.state = 'run';
  chosen.t.v = 20;
}
const railHead = chosen ? pointOnLine(chosen.line, chosen.t.s) : station;
const railMap = drawScene(0, { x: railHead.x, y: railHead.y }, 90, 30);

/* 2. аэродром: ждём, пока борт пойдёт на посадку */
const airport = base.air.airports[0];
const airMap = drawScene(1, { x: airport.x, y: airport.y }, 42, 900);

/* 3. порт: судно, ближайшее к разводному мосту */
let bestShip = null;
for (const ship of base.seaTraffic.ships) {
  const lane = base.seaTraffic.lanes.find((l) => l.id === ship.lane);
  const br = (lane.bridges || [])[0];
  if (!br) continue;
  const d = Math.abs(ship.s - br.sKm);
  if (!bestShip || d < bestShip.d) bestShip = { ship, lane, br, d };
}
const seaMap = drawScene(2, bestShip ? { x: bestShip.br.x, y: bestShip.br.y } : { x: 0, y: 0 }, 14, 600);

writeFileSync(new URL('../docs/transit.png', import.meta.url), out.toBuffer('image/png'));
const told = chosen ? rail.trains.indexOf(chosen.t) : 0;
console.log('transit.png · кадры §16.7: станция ' + station.name + ', аэродром ' + airport.name +
  ', порт ' + (bestShip ? seaMap.tides.ports[bestShip.lane.a].name : '—') +
  ' · поезд ' + rail.trains[told].id + ', судно ' + (bestShip ? bestShip.ship.id : '—'));
