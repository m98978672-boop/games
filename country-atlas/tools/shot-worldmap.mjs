/* Кадры §86 и §87: карта мира (обзор и фронт) и начальная сцена с пролётом.
   Запуск: node tools/shot-worldmap.mjs → docs/world-map.png */
import { createCanvas } from '@napi-rs/canvas';
import { writeFileSync } from 'node:fs';
import { buildWorld, advanceWars, worldStats, hottestWar, nearestCity, diplomacyStats, WM } from '../src/worldmap2d.js';
import { WorldView, overviewScale } from '../src/worldview.js';
import { Intro, INTRO, tourCam } from '../src/intro.js';

const W = 940, H = 560, GAP = 16, PAD = 16;

const world = buildWorld(424242);
// мир живёт 11 суток: войны уже идут, взрывы и разрушения есть
for (let t = 0; t <= 60 * 24 * 11; t += 45) advanceWars(world, 9000 + t);

function frameCanvas(w, h) {
  const cv = createCanvas(w, h);
  cv.getBoundingClientRect = () => ({ left: 0, top: 0, width: w, height: h });
  return cv;
}

function caption(ctx, x, y, text, sub) {
  ctx.fillStyle = 'rgba(240,244,246,0.95)';
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText(text, x, y);
  if (sub) {
    ctx.fillStyle = 'rgba(160,178,190,0.95)';
    ctx.font = '12px sans-serif';
    ctx.fillText(sub, x, y + 17);
  }
}

/* 1. обзор мира с войнами */
function overviewPanel() {
  const cv = frameCanvas(W, H);
  const v = new WorldView(cv, { createCanvas });
  v.resize();
  v.setWorld(world);
  v.step(0.02); v.step(0.02);
  v.cam = { x: 0, y: 0, scale: overviewScale(v.view) };
  v.alpha = 1;
  v.draw();
  const st = worldStats(world);
  const hot = hottestWar(world);
  const g = cv.getContext('2d');
  const y = H - 112;
  g.fillStyle = 'rgba(8,19,28,0.82)';
  g.fillRect(0, y, W, 112);
  caption(g, 16, y + 24, 'карта мира · вся планета', `${WM.countries} стран · войн сейчас ${st.wars} · боёв ${st.battles}`);
  g.font = '13px sans-serif';
  g.fillStyle = 'rgba(220,230,236,0.95)';
  g.fillText(hot ? `бои: ${hot.a} — ${hot.b} · фронт ${hot.swayKm} км` : 'сейчас тихо', 16, y + 58);
  const dip = diplomacyStats(world);
  g.fillText(`разрушено городов ${st.destroyedCities} · дорог ${st.destroyedRoads} · мостов ${st.destroyedBridges} · оккупация ${st.occupiedZones} зон`, 16, y + 78);
  g.fillStyle = 'rgba(190,206,215,0.95)';
  g.fillText(`контакты: союз ${dip.union} · дружба ${dip.friend} · вражда ${dip.enmity} · посольств ${dip.embassies} · помощь ${dip.aidTotal}`, 16, y + 94);
  return cv;
}

/* 2. фронт вблизи: самое горячее место карты — там и города, и взрывы, и оккупация */
function frontPanel() {
  // ищем окно 2000 × 1200 км, где событий больше всего: разрушения, оккупация, взрывы, армии
  let best = { x: 0, y: 0, score: -1 };
  const score = (x, y) => {
    let s0 = 0;
    for (const id of world.destroyed.cities) {
      const c = world.cities.find((k) => k.id === id);
      if (Math.hypot(c.x - x, c.y - y) < 500) s0 += 5;
    }
    for (const o of world.occupied) if (Math.hypot(o.x - x, o.y - y) < 500) s0 += 2;
    for (const e of world.explosions) if (Math.hypot(e.x - x, e.y - y) < 500) s0 += 4;
    for (const a of world.armies) if (Math.hypot(a.x - x, a.y - y) < 500) s0 += 6;
    return s0;
  };
  for (const c of world.cities) {
    const s0 = score(c.x, c.y);
    if (s0 > best.score) best = { x: c.x, y: c.y, score: s0 };
  }
  // камера — на сам фронт: там оккупация, взрывы и армии; города рядом видно подписями
  const hotWar = world.wars.filter((k) => k.to === null)[0] || world.wars[0];
  const cv = frameCanvas(W, H);
  const v = new WorldView(cv, { createCanvas });
  v.resize();
  v.setWorld(world);
  v.step(0.02); v.step(0.02);
  v.cam = hotWar ? { x: hotWar.x, y: hotWar.y, scale: 0.26 } : { x: best.x, y: best.y, scale: 0.2 };
  v.alpha = 1;
  v.draw();
  const st = worldStats(world);
  const hot = hottestWar(world);
  const g = cv.getContext('2d');
  const y = H - 96;
  g.fillStyle = 'rgba(8,19,28,0.82)';
  g.fillRect(0, y, W, 96);
  caption(g, 16, y + 24, 'фронт вблизи', `${hot ? hot.a + ' — ' + hot.b : 'тихо'} · взрывов ${st.explosions} · армий видно ${st.armiesVisible}`);
  g.font = '12px sans-serif';
  g.fillStyle = 'rgba(200,214,222,0.95)';
  g.fillText('оранжевые вспышки — взрывы, крестики — разрушенные города,', 16, y + 62);
  g.fillText('красная штриховка — оккупация, голубые метки — армии', 16, y + 82);
  return cv;
}

/* 3. начальная сцена: пролёт над страной на размытой подложке мира */
function introPanel() {
  const cv = frameCanvas(W, H);
  const intro = new Intro(cv, world, { createCanvas });
  intro.resize();
  intro.buildBackground();
  intro.buildLayer();
  intro.t = 7.6;
  intro.draw();
  const cam = tourCam(intro.points, intro.t);
  const g = cv.getContext('2d');
  g.fillStyle = 'rgba(8,19,28,0.72)';
  g.fillRect(0, 0, W, 74);
  g.fillStyle = 'rgba(240,244,246,0.98)';
  g.font = 'bold 22px Georgia, serif';
  g.fillText('РАТГРАД', 18, 34);
  g.font = '12.5px sans-serif';
  g.fillStyle = 'rgba(190,206,215,0.95)';
  g.fillText(`пролёт над страной · ${cam.name} · подложка — размытая карта мира`, 18, 56);
  const y = H - 54;
  g.fillStyle = 'rgba(8,19,28,0.72)';
  g.fillRect(0, y, W, 54);
  g.fillStyle = 'rgba(240,244,246,0.95)';
  g.font = '13px sans-serif';
  g.fillText(`масштаб ${cam.scale.toFixed(2)} px/км · ${intro.points.length} точек пролёта · размытие ${INTRO.blurPx} px`, 18, y + 32);
  return cv;
}

const panels = [overviewPanel(), frontPanel(), introPanel()];
const cols = 2, rows = 2;
const outW = PAD * 2 + W * cols + GAP;
const outH = PAD * 2 + (H + 34) * rows + GAP;
const out = createCanvas(outW, outH);
const ctx = out.getContext('2d');
ctx.fillStyle = '#0b1a26';
ctx.fillRect(0, 0, outW, outH);
const labels = [
  'обзор мира: все страны, наша выделена, войны и разрушения',
  'фронт: взрывы, разрушенные города и дороги, оккупация, армии',
  'начальная сцена: пролёт над страной на размытой карте мира'
];
let i = 0;
for (const cv of panels) {
  const col = i % cols, row = Math.floor(i / cols);
  const x = PAD + col * (W + GAP), y = PAD + row * (H + 34 + GAP);
  ctx.drawImage(cv, x, y);
  ctx.fillStyle = 'rgba(200,214,222,0.95)';
  ctx.font = '12px sans-serif';
  ctx.fillText(labels[i], x, y + H + 20);
  i++;
}
// четвёртая клетка: что видно при выключенном спутнике — армии пропадают
{
  const cv = frameCanvas(W, H);
  const v = new WorldView(cv, { createCanvas });
  v.resize();
  v.setWorld(world);
  v.step(0.02); v.step(0.02);
  v.cam = { x: 0, y: 0, scale: overviewScale(v.view) };
  v.alpha = 1;
  v.showArmies = false;
  v.draw();
  const g = cv.getContext('2d');
  g.fillStyle = 'rgba(8,19,28,0.78)';
  g.fillRect(0, H - 54, W, 54);
  g.fillStyle = 'rgba(240,244,246,0.95)';
  g.font = '12.5px sans-serif';
  g.fillText('спутник выключен — армий на карте нет; войны и разрушения остаются', 16, H - 22);
  const x = PAD + (W + GAP), y = PAD + (H + 34 + GAP);
  ctx.drawImage(cv, x, y);
  ctx.fillStyle = 'rgba(200,214,222,0.95)';
  ctx.font = '12px sans-serif';
  ctx.fillText('тумблер «спутник»: армии видны только когда страна может смотреть', x, y + H + 20);
}

ctx.fillStyle = 'rgba(150,168,180,0.9)';
ctx.font = '12px sans-serif';
ctx.fillText('карта мира: страны, города и дороги, отметки рельефа значками, войны и оккупация — только наблюдение', PAD, outH - 8);
writeFileSync(new URL('../docs/world-map.png', import.meta.url), out.toBuffer('image/png'));
console.log('docs/world-map.png', outW + '×' + outH, '· войны', world.wars.length, '· разрушено городов', world.destroyed.cities.length);
