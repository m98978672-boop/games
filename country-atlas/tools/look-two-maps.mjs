/* Одна картинка из двух карт: страна сверху, мир снизу. По ней видно, что палитра
   у обеих одна (§101). Запуск: node tools/look-two-maps.mjs → docs/map-two-views.png
   Нужен @napi-rs/canvas: npm i --no-save @napi-rs/canvas gifenc */
import { createCanvas } from '@napi-rs/canvas';
import { writeFileSync } from 'node:fs';

const W = 1200, H = 700, titleH = 24;
const country = createCanvas(W, H);
country.getBoundingClientRect = () => ({ left: 0, top: 0, width: W, height: H });
const world = createCanvas(W, H);
world.getBoundingClientRect = () => ({ left: 0, top: 0, width: W, height: H });

const noop = () => {};
const hudMock = () => new Proxy({}, { get: () => ({ textContent: '', innerHTML: '', style: {}, classList: { add: noop, remove: noop }, addEventListener: noop, setAttribute: noop }), set: () => true });
globalThis.window = { devicePixelRatio: 1, addEventListener: noop, innerWidth: W, innerHeight: H };
globalThis.document = {
  createElement: () => {
    const c = createCanvas(W, H);
    c.getBoundingClientRect = () => ({ left: 0, top: 0, width: W, height: H });
    return c;
  },
  getElementById: () => null,
  addEventListener: noop,
  hidden: false,
  body: { appendChild: noop }
};

const { settlements, rankSettlements } = await import('../src/world2d.js');
const { buildRoads } = await import('../src/roads2d.js');
const { buildWater } = await import('../src/rivers2d.js');
const { buildBorders } = await import('../src/borders2d.js');
const { autoScale, startCenter } = await import('../src/fit2d.js');
const { Map2D } = await import('../src/map2d.js');

const towns = settlements();
const ranks = rankSettlements(towns, 10);
const roads = buildRoads();
const water = buildWater(roads);
const borders = buildBorders(towns, ranks);

const map = new Map2D(country, hudMock());
map.resize();
map.view.w = W; map.view.h = H;
map.settlements = towns; map.ranks = ranks; map.roads = roads; map.water = water; map.borders = borders;
map.buildTransport(); map.buildEconomy(); map.buildRailLayer(); map.buildAirLayer(); map.buildSeaLayer();
map.autoFit = true; map.fitMode = 'country';
map.scale = autoScale({ w: W, h: H }, 'country', false);
map.center = startCenter(towns, 'country');
map.overviewLocal(700);   // рельеф: без него карта страны рисуется одним тёмным фоном
map.light = null; map.updateLight();
for (let i = 0; i < 4; i++) map.tick(0.4);
map.draw();

const { buildWorld } = await import('../src/worldmap2d.js');
const { WorldView } = await import('../src/worldview.js');
const gameWorld = buildWorld(424242);
const wv = new WorldView(world, { createCanvas: (a, b) => createCanvas(a, b) });
wv.resize(); wv.setWorld(gameWorld); wv.step(0.02); wv.step(0.02); wv.open();
wv.transition = null; wv.alpha = 1;
wv.draw();

const out = createCanvas(W, H * 2 + titleH * 2 + 12);
const o = out.getContext('2d');
o.fillStyle = '#12181a';
o.fillRect(0, 0, out.width, out.height);
o.fillStyle = '#dfe6ea';
o.font = '13px sans-serif';
o.fillText('карта страны — основная игра', 8, 17);
o.drawImage(country, 0, titleH, W, H);
o.fillText('карта мира — тот же мир сверху (§101)', 8, titleH + H + titleH - 6);
o.drawImage(world, 0, titleH + H + titleH, W, H);
writeFileSync(new URL('../docs/map-two-views.png', import.meta.url), out.toBuffer('image/png'));
console.log('ok → docs/map-two-views.png');
