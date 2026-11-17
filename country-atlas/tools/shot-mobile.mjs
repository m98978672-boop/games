/* Кадры §83: телефон книзу (страна и город) и боком — с авто-масштабом и зонами панелей.
   Запуск: node tools/shot-mobile.mjs → docs/mobile.png */
import { createCanvas } from '@napi-rs/canvas';
import { writeFileSync } from 'node:fs';
import { settlements, rankSettlements } from '../src/world2d.js';
import { buildRoads } from '../src/roads2d.js';
import { buildWater } from '../src/rivers2d.js';
import { buildBorders } from '../src/borders2d.js';
import { autoScale, layoutFor, startCenter, spanKmAt, isPhone } from '../src/fit2d.js';

const noop = () => {};
const hudMock = () => new Proxy({}, { get: () => ({ textContent: '', innerHTML: '', style: {}, classList: { add: noop, remove: noop }, addEventListener: noop, setAttribute: noop }), set: () => true });
globalThis.window = { devicePixelRatio: 2, addEventListener: noop, innerWidth: 390, innerHeight: 844 };
globalThis.document = {
  createElement: () => {
    const c = createCanvas(390, 844);
    c.getBoundingClientRect = () => ({ left: 0, top: 0, width: c.width / 2, height: c.height / 2 });
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

const frames = [
  { label: 'телефон · страна', w: 390, h: 844, mode: 'country' },
  { label: 'телефон · город', w: 390, h: 844, mode: 'city' },
  { label: 'телефон боком · область', w: 844, h: 390, mode: 'region' }
];
const pad = 14, titleH = 22, colX = pad;

const makeFrame = (f) => {
  const k = 2;
  const canvas = createCanvas(f.w * k, f.h * k);
  canvas.getBoundingClientRect = () => ({ left: 0, top: 0, width: f.w, height: f.h });
  const map = new Map2D(canvas, hudMock());
  map.resize();
  map.view.w = f.w; map.view.h = f.h;
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
  map.fitMode = f.mode;
  map.scale = autoScale({ w: f.w, h: f.h }, f.mode, isPhone(f.w, f.h));
  map.center = startCenter(towns, f.mode);
  map.transport.minutes = 100 * 1440 + 11 * 60;
  map.light = null;
  map.updateLight();
  for (let i = 0; i < 4; i++) map.tick(0.4);
  map.draw();
  return map;
};

/* зоны панелей из той же функции, что в игре — ничего не выдумываем */
const drawZones = (octx, x, y, f) => {
  const L = layoutFor(f.w, f.h);
  const topH = f.h * L.rightMaxVh / 100;
  const botH = f.h * L.hudMaxVh / 100;
  octx.fillStyle = 'rgba(247,244,238,0.10)';
  octx.strokeStyle = 'rgba(247,244,238,0.55)';
  octx.lineWidth = 1;
  octx.setLineDash([5, 5]);
  octx.fillRect(x + 6, y + 6, f.w - 12, topH - 6);
  octx.strokeRect(x + 6.5, y + 6.5, f.w - 13, topH - 7);
  octx.fillRect(x + 6, y + f.h - botH + 6, f.w - 12, botH - 12);
  octx.strokeRect(x + 6.5, y + f.h - botH + 6.5, f.w - 13, botH - 13);
  octx.setLineDash([]);
  octx.fillStyle = 'rgba(247,244,238,0.75)';
  octx.font = '11px sans-serif';
  octx.fillText('тумблеры', x + 14, y + 24);
  octx.fillText('HUD и легенда', x + 14, y + f.h - 14);
};

const rows = [
  frames.slice(0, 2),
  frames.slice(2)
];
const rowH = rows.map((r) => Math.max(...r.map((f) => f.h)) + titleH + pad);
const outW = colX * 2 + 390 * 2 + pad + 12;
const outH = rowH[0] + rowH[1] + pad * 2;
const out = createCanvas(outW, outH);
const octx = out.getContext('2d');
octx.fillStyle = '#161c1a';
octx.fillRect(0, 0, out.width, out.height);

const made = [];
let y = pad;
for (const row of rows) {
  let x = colX;
  for (const f of row) {
    const map = makeFrame(f);
    const drawW = row.length === 1 ? 844 : 390;
    octx.drawImage(map.canvas, x, y + titleH, drawW, f.h * (drawW / f.w));
    drawZones(octx, x, y + titleH, { ...f, w: drawW, h: f.h * (drawW / f.w) });
    octx.fillStyle = 'rgba(232,238,244,0.92)';
    octx.font = '12px sans-serif';
    octx.fillText(f.label, x, y + 12);
    const span = Math.round(spanKmAt(map.scale, { w: f.w, h: f.h }, 16));
    octx.fillStyle = 'rgba(232,238,244,0.65)';
    octx.font = '11px sans-serif';
    octx.fillText(map.scale.toFixed(2) + ' px/км · ' + span + ' км', x + 2, y + titleH + f.h * (drawW / f.w) + 12);
    x += drawW + pad;
    made.push(f.label + ' · ' + map.scale.toFixed(2) + ' px/км · ' + span + ' км');
  }
  y += Math.max(...row.map((f) => f.h)) + titleH + pad;
}
writeFileSync(new URL('../docs/mobile.png', import.meta.url), out.toBuffer('image/png'));
console.log('mobile.png · ' + made.join(' · '));
