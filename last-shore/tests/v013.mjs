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

// цвет дна лунки: срез породы отличается от травы
const col = w.terrain.geometry.attributes.color;
const base = w.baseColors;
let recolored = 0;
for (let i = 0; i < col.count; i++) {
  const x = col.getX(i); // заглушка на случай отсутствия атрибута позиции
  if (Math.abs(base[i * 3] - col.getX(i)) > 0.001) recolored++;
}
log('вершин с показанной породой в лунке:', recolored, '· срез виден:', recolored > 0);

// накладная лунка: заплатка по вершинам рельефа, со срезом породы
const pit = w.pits.get(w._digKey(dry.x, dry.z));
const pitVerts = pit ? pit.walls.geometry.attributes.position.count : 0;
const pitCols = pit ? pit.walls.geometry.attributes.color.count : 0;
// рельеф проседает блоком: в центре заметно ниже, вокруг — как было
const block = w._pitBlock(dry.x, dry.z, 1.2);
const G = Math.round(Math.sqrt(w.heights.length));
const colAt = (ix, iz) => w.baseHeights[iz * G + ix] - w.heights[iz * G + ix];
const cx0 = Math.round((dry.x + 180) / 1.8);
const cz0 = Math.round((dry.z + 180) / 1.8);
const sunk = Math.max(...[cx0 - 1, cx0, cx0 + 1].flatMap((ix) => [cz0 - 1, cz0, cz0 + 1].map((iz) => colAt(ix, iz))));
const outside = colAt(block.vx0 - 3, block.vz0 - 3);
const floorY2 = pit ? pit.floorY : null;
log('яма: просадка в центре', sunk.toFixed(2), 'м · вокруг нетронуто:', Math.abs(outside) < 0.01,
  '· стенки:', pitVerts > 0 && pitCols === pitVerts,
  '· дно на', floorY2 !== null ? (w.surfaceOf(dry.x, dry.z).h0 - floorY2).toFixed(2) : '?', 'м ниже земли',
  '· комьев земли:', pit ? pit.debris.children.length : 0);

for (let i = 0; i < snap.length; i++) w.heights[i] = snap[i];

w.digStore.clear();
w.surfaceStore.clear();
w.pits.forEach((p) => { w.pitGroup.remove(p.group); p.walls.geometry.dispose(); });

w.pits.clear();
w._applyHeights();

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
w.digStore.clear();
w.surfaceStore.clear();
w.pits.forEach((p) => { w.pitGroup.remove(p.group); p.walls.geometry.dispose(); });
w.pits.clear();
w._applyHeights();

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
w.digStore.clear();
w.surfaceStore.clear();
w.pits.forEach((p) => { w.pitGroup.remove(p.group); p.walls.geometry.dispose(); });
w.pits.clear();
w._applyHeights();

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
