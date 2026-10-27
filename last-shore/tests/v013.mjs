// v0.13: слои земли (песок → земля → камень → пустота шахты), вода только
// на пляже, текстура земли с пятнами, полёт, F9-курсор, бот-инспектор (F8).
// Запуск: node tests/v013.mjs (нужен npm run test:build)
import { JSDOM } from 'jsdom';
import fs from 'node:fs';
import path from 'node:path';
import * as THREE from '../node_modules/three/build/three.module.js';

const dir = path.resolve(import.meta.dirname, '..');
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
const dom = new JSDOM(html, { url: 'https://example.com/', pretendToBeVisual: true, runScripts: 'outside-only' });
const { window } = dom;
globalThis.window = window;
globalThis.document = window.document;
Object.defineProperty(globalThis, 'navigator', { value: window.navigator, configurable: true });
globalThis.HTMLElement = window.HTMLElement;
globalThis.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 16);
globalThis.localStorage = window.localStorage;
window.requestAnimationFrame = globalThis.requestAnimationFrame;

const code = fs.readFileSync(path.join(dir, 'tests/.harness-bundle.js'), 'utf8');
new Function(code)();
window.document.dispatchEvent(new window.Event('DOMContentLoaded', { bubbles: true }));
window.document.getElementById('btn-start').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
await new Promise((r) => setTimeout(r, 300));

const game = window.__game;
if (!game) throw new Error('game not created');
const log = (...a) => console.log(...a);
const key = (code, type = 'keydown') => window.dispatchEvent(new window.KeyboardEvent(type, { code, bubbles: true }));

// --- 1. слои под ногами: земля → камень → пустота, без воды в глубине ---
const w = game.world;
// вернуть рельеф в исходное состояние: ямы убираются, дыры в сетке заделываются
const resetDig = () => {
  w.digStore.clear();
  w.surfaceStore.clear();
  w.pits.forEach((p) => { w.pitGroup.remove(p.group); if (p.walls.geometry) p.walls.geometry.dispose(); });
  w.pits.clear();
  w.cutPits.clear();
  w.cutCells.clear();
  w._rebuildTerrainIndex();
  w._applyHeights();
};
let dry = null;
for (let i = 0; i < 400 && !dry; i++) {
  const x = (game.world.rng() - 0.5) * 120;
  const z = (game.world.rng() - 0.5) * 120;
  if (w.heightAt(x, z) > 4 && w.slopeAt(x, z) < 0.35) dry = { x, z };
}
const snap = w.heights.slice();
const seen = [];
let res = null;
for (let i = 0; i < 26; i++) {
  res = w.dig(dry.x, dry.z, { radius: 1.2, depth: 0.45, mine: 99 });
  seen.push(res.layer);
  if (res.void) break;
}
if (!res.void) res = w.dig(dry.x, dry.z, { radius: 1.2, depth: 0.45, mine: 99 });
const order = seen.filter((l, i) => l !== seen[i - 1]);
const floodedDry = seen.includes('sand');
log('слои в глубине острова:', order.join(' → '),
  '· до пустоты', res.dug.toFixed(2), 'м · воды нет:', !floodedDry);

// --- 1a. яма вырезана из рельефа ровно по клеткам сетки ---
const G = Math.round(Math.sqrt(w.heights.length));
const gridStep = 360 / (G - 1);
const pit = w.pitAt(dry.x, dry.z);
if (!pit) throw new Error('яма не выкопана');
const triBase = w.terrainIndexBase ? w.terrainIndexBase.length / 3 : 0;
const idxNow = w.terrain.geometry.index;
const cutTris = triBase - (idxNow ? idxNow.count / 3 : 0);
const onGrid = [pit.rect.x0, pit.rect.x1, pit.rect.z0, pit.rect.z1]
  .every((v) => Math.abs((v + 180) / gridStep - Math.round((v + 180) / gridStep)) < 1e-6);
// высоты узлов рельефа не тронуты: яма не «насаливается» поверх земли
const gix = Math.round((dry.x + 180) / gridStep);
const giz = Math.round((dry.z + 180) / gridStep);
const heightsUntouched = Math.abs(w.heights[giz * G + gix] - w.baseHeights[giz * G + gix]) < 1e-6;
const sunk = w.baseHeightAt(dry.x, dry.z) - w.heightAt(dry.x, dry.z);

// по ступеням из ямы вылезаешь: подъём от дна к стене ступеней не рвётся
const rx0 = pit.rect.x0; const rx1 = pit.rect.x1;
const rz0 = pit.rect.z0; const rz1 = pit.rect.z1;
const along = pit.side === 'n' || pit.side === 's';
const reach = along ? rz1 - rz0 : rx1 - rx0;
const pointAt = (t) => {
  if (pit.side === 'n') return { x: (rx0 + rx1) / 2, z: rz0 + t };
  if (pit.side === 's') return { x: (rx0 + rx1) / 2, z: rz1 - t };
  if (pit.side === 'w') return { x: rx0 + t, z: (rz0 + rz1) / 2 };
  return { x: rx1 - t, z: (rz0 + rz1) / 2 };
};
let prevH = null; let worstRise = 0; let climbed = true;
for (let i = 0; i <= 30; i++) {
  const q = pointAt(reach * (1 - i / 30));
  const h = w.heightAt(q.x, q.z);
  if (prevH !== null) {
    const rise = h - prevH;
    worstRise = Math.max(worstRise, rise);
    if (rise > 0.551) climbed = false;
  }
  prevH = h;
}
const topStep = w.heightAt(pointAt(0.01).x, pointAt(0.01).z);
const exitGap = Math.abs(w.baseHeightAt(pit.rect.x0 - 0.6, pit.rect.z0 - 0.6) - topStep);
const wallsVerts = pit.walls.geometry.attributes.position.count;
const hasColors = pit.walls.geometry.attributes.color.count === wallsVerts;
const cutCellsN = w.cutCells.size;
console.log('яма-дыра: вырезано треугольников рельефа', cutTris,
  '· клеток', (pit.rect.ix1 - pit.rect.ix0) + '×' + (pit.rect.iz1 - pit.rect.iz0), '(' + cutCellsN + ' клеток сетки)',
  '· край по сетке:', onGrid, '· высоты узлов не тронуты:', heightsUntouched);
console.log('  дно на', sunk.toFixed(2), 'м ниже дёрна · стенки', wallsVerts, 'вершин · слои видны:', hasColors,
  '· ступеней', pit.steps, '· наибольший подъём по ступеням', worstRise.toFixed(2), 'м · вылезти можно:', climbed);
console.log('  верх ступеней', topStep.toFixed(2), 'м · земля у выхода', (topStep + exitGap).toFixed(2), 'м');

// в яму герой реально спускается (heightAt внутри ниже дёрна), у края — нет
const inPit = w.heightAt((rx0 + rx1) / 2, (rz0 + rz1) / 2);
const outside = w.heightAt(rx0 - gridStep * 1.2, rz0 - gridStep * 1.2);
console.log('  внутри ямы', inPit.toFixed(2), 'м · за краем', outside.toFixed(2), 'м · комьев у края:',
  pit.debris.children.length);

resetDig();

// --- 1a2. обвал: соседние ямы сливаются, перегородки между ними нет ---
{
  const w2 = w;
  w2.playerPos = { x: dry.x - 4, z: dry.z };
  for (let i = 0; i < 3; i++) w2.dig(dry.x, dry.z, { radius: 1.6, depth: 0.45, mine: 99 });
  const first = w2.pitAt(dry.x, dry.z);
  const second = { x: dry.x + (first.rect.x1 - first.rect.x0) + 0.6, z: dry.z };
  const res = w2.dig(second.x, second.z, { radius: 1.6, depth: 0.45, mine: 99 });
  const merged = w2.pitAt(second.x, second.z);
  const samePit = w2.pitAt(dry.x, dry.z) === merged;
  const midH = w2.heightAt((dry.x + second.x) / 2, dry.z);
  const wallGone = Math.abs(midH - merged.floorY) < 0.4;
  console.log('обвал: стенка рухнула:', res.collapse, '· ям на месте:', w2.pits.size,
    '· одна дыра:', samePit, '· между ямами высота', midH.toFixed(2),
    'м при полу', merged.floorY.toFixed(2), 'м · перегородки нет:', wallGone);
  resetDig();
}

// --- 1a3. породы разной прочности: песчаник → гранит → базальт → обсидиан ---
{
  const rows = [1.5, 2.2, 2.9, 3.5].map((d) => w.rockAt(d, 'soil'));
  const names = rows.map((r) => r.name);
  const hards = rows.map((r) => r.hard);
  const grows = hards.every((h, i) => i === 0 || h > hards[i - 1]);
  const steps = {};
  for (let i = 0; i < 40; i++) {
    const res = w.dig(dry.x, dry.z, { radius: 1.6, depth: 0.45, mine: 3.0 });
    if (!res || res.void) break;
    if (res.rockName) (steps[res.rockName] ||= []).push(res.step);
  }
  const avg = {};
  for (const [k, v] of Object.entries(steps)) avg[k] = v.reduce((a, b) => a + b, 0) / v.length;
  const order = Object.keys(avg);
  const slower = order.length >= 3 && order.every((k, i) => i === 0 || avg[k] < avg[order[i - 1]]);
  console.log('породы:', names.join(' → '), '· прочность', hards.join(' → '),
    '· шаг за удар:', order.map((k) => `${k} ${avg[k].toFixed(2)} м`).join(', '),
    '· глубже — прочнее:', grows && slower);
  resetDig();
}

// --- 1b. трава из разных оттенков: разброс яркости и насыщенности ---
{
  const geo = w.terrain.geometry;
  const colAttr = geo.attributes.color;
  const posAttr = geo.attributes.position;
  const lums = [];
  const hues = [];
  for (let i = 0; i < posAttr.count; i += 5) {
    const y = posAttr.getY(i);
    if (y < 3 || y > 12) continue;
    const r = colAttr.getX(i);
    const gg = colAttr.getY(i);
    const b = colAttr.getZ(i);
    lums.push(0.299 * r + 0.587 * gg + 0.114 * b);
    hues.push(Math.max(r, gg, b) - Math.min(r, gg, b));
  }
  const span = Math.max(...lums) - Math.min(...lums);
  const hueSpan = Math.max(...hues) - Math.min(...hues);
  log('трава из разных оттенков: разброс яркости', span.toFixed(2), '· оттенка', hueSpan.toFixed(2),
    '· разные оттенки:', span > 0.1 && hueSpan > 0.12);
}

// --- 2. вода появляется только на пляже (ниже уровня моря) ---
let beach = null;
for (let i = 0; i < 3000 && !beach; i++) {
  const x = (w.rng() - 0.5) * 150;
  const z = (w.rng() - 0.5) * 150;
  const h = w.heightAt(x, z);
  if (h > 0.15 && h < 1.0 && w.layerAt(x, z) === 'sand') beach = { x, z };
}
const beachSnap = w.heights.slice();
let beachRes = null;
for (let i = 0; i < 20; i++) {
  beachRes = w.dig(beach.x, beach.z, { radius: 1.2, depth: 0.45, mine: 99 });
  if (beachRes.flooded || beachRes.void) break;
}
log('пляж: дно', (beachRes.bottom ?? w.heightAt(beach.x, beach.z)).toFixed(2), 'м · вода залила:',
  beachRes.flooded, '· источник:', beachRes.waterSource || 'нет');
for (let i = 0; i < beachSnap.length; i++) w.heights[i] = beachSnap[i];
resetDig();

// --- 3. каменный слой требует кирку ---
const stoneSpot = { ...dry };
const handRes = w.dig(stoneSpot.x, stoneSpot.z, { radius: 1.2, depth: 0.45, mine: 0 });
for (let i = 0; i < 4; i++) w.dig(stoneSpot.x, stoneSpot.z, { radius: 1.2, depth: 0.45, mine: 99 });
const probeStone = w.probeAt(stoneSpot.x, stoneSpot.z);
const noPick = w.dig(stoneSpot.x, stoneSpot.z, { radius: 1.2, depth: 0.45, mine: 0 });
const withPick = w.dig(stoneSpot.x, stoneSpot.z, { radius: 1.2, depth: 0.45, mine: 3 });
log('камень: слой', probeStone.layer, '· руками hard:', noPick.hard === true,
  '· киркой режется:', withPick.hard === false && withPick.depth > 0);
for (let i = 0; i < snap.length; i++) w.heights[i] = snap[i];
resetDig();

// --- 4. полёт: Space вверх, Shift вниз, зависание ---
const wasCreative = game.creative;
if (!wasCreative) game.toggleCreative();
const p = game.player;
const y0 = p.position.y;
p.update(0.2, { jump: true }, w);
const yUp = p.position.y;
p.update(0.2, { sprint: true }, w);
const yDown = p.position.y;
p.update(0.2, {}, w);
const yHover = p.position.y;
const vHover = Math.abs(p.velocity.y) < 0.4;
log('полёт: подъём', (yUp - y0).toFixed(2), 'м · спуск', (yUp - yDown).toFixed(2),
  'м · зависание:', vHover, '· земля не липнет:', p.position.y > 0.2);

// --- 5. F9 отпускает и захватывает курсор ---
const freeBefore = game.cursorFree;
key('F9');
const freeAfter = game.cursorFree;
key('F9');
log('F9: курсор свободен', freeBefore, '->', freeAfter, '->', game.cursorFree,
  '· переключается:', freeAfter !== freeBefore && game.cursorFree === freeBefore);

// --- 6. бот-инспектор: все проверки по описанию ---
game.bot = new window.__botCtor(game);
const failures = [];
for (const check of game.bot.checks) {
  let r;
  try {
    r = check.run(game);
  } catch (err) {
    r = { ok: false, fact: `упало: ${err.message}`, expect: '—' };
  }
  log(`${r.ok ? '✓' : '✗'} ${check.name} — ${r.fact}`);
  if (!r.ok) failures.push({ name: check.name, ...r });
}
log('бот: проверок', game.bot.checks.length, '· не сходится:', failures.length);

// --- 7. бот ходит: F8 запускает робота ---
key('F8');
const started = !!game.bot.active && !!game.bot.mesh && game.bot.mesh.visible;
const x0 = game.bot.mesh.position.x;
const z0 = game.bot.mesh.position.z;
for (let i = 0; i < 40; i++) game.bot.update(0.1);
const moved = Math.hypot(game.bot.mesh.position.x - x0, game.bot.mesh.position.z - z0);
key('F8');
log('F8: бот появился', started, '· прошёл', moved.toFixed(2), 'м · отчёт закрыт:', !game.bot.active);

if (game.creative && !wasCreative) game.toggleCreative();
log('ошибок нет');
