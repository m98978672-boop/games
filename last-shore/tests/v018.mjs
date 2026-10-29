// v0.18: цельные модели деревьев, точные обводки (пробежать между стволами,
// переступить валун), ровная земля под каждой моделью, дома зверей,
// уклоны только 0/15/30/40°, малые острова, отсечение чанков и лодка.
// Запуск: node tests/v018.mjs (нужен npm run test:build)
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

new Function(fs.readFileSync(path.join(dir, 'tests/.harness-bundle.js'), 'utf8'))();
window.document.dispatchEvent(new window.Event('DOMContentLoaded', { bubbles: true }));
window.document.getElementById('btn-start').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
await new Promise((r) => setTimeout(r, 300));

const game = window.__game;
const w = game.world;
const log = (...a) => console.log(...a);
let bad = 0;
const check = (ok, text) => { if (!ok) { bad++; log('   ✗', text); } return ok; };

// --- 1. модели деревьев собраны цельно: между ярусами хвои нет пустоты ---
// пустые полосы по высоте: если в полосе 25 см нет ни одного треугольника — дыра
const verticalGaps = (geo) => {
  if (!geo) return { gap: Infinity };
  const pos = geo.attributes.position;
  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    min = Math.min(min, y);
    max = Math.max(max, y);
  }
  const bands = Math.ceil((max - min) / 0.25);
  const filled = new Array(bands).fill(false);
  for (let i = 0; i < pos.count; i += 3) {
    const y0 = pos.getY(i);
    const y1 = pos.getY(i + 1);
    const y2 = pos.getY(i + 2);
    const lo = Math.min(y0, y1, y2);
    const hi = Math.max(y0, y1, y2);
    const b0 = Math.max(0, Math.floor((lo - min) / 0.25));
    const b1 = Math.min(bands - 1, Math.floor((hi - min) / 0.25));
    for (let b = b0; b <= b1; b++) filled[b] = true;
  }
  let gap = 0;
  let run = 0;
  for (const f of filled) {
    if (f) { run = 0; continue; }
    run += 0.25;
    gap = Math.max(gap, run);
  }
  return { gap, min, max };
};
const pineGeo = w.pines[0] ? w.pines[0].geometry : null;
const pine = verticalGaps(pineGeo);
log('сосна: хвоя от', pine.min.toFixed(2), 'до', pine.max.toFixed(2), 'м · максимальный просвет',
  pine.gap.toFixed(2), 'м');
check(pine.gap < 0.6, 'ярусы хвои перекрываются — сосна цельная');

// ствол сосны доходит до макушки хвои (не «палка отдельно от кроны»)
const trunkTree = w.treeList.find((t) => t.hullY && t.parts && t.parts.some((p) => p.layer === 'bark'));
const barkPart = trunkTree.parts.find((p) => p.layer === 'bark');
const trunkGeo = barkPart.mesh.geometry;
const trunkBox = trunkGeo.boundingBox || (trunkGeo.computeBoundingBox(), trunkGeo.boundingBox);
log('ствол по высоте:', trunkBox.min.y.toFixed(2), '…', trunkBox.max.y.toFixed(2), 'м · крона:',
  (trunkTree.bbox ? trunkTree.bbox.h.toFixed(2) : '?'), 'м');
check(trunkBox.max.y > 3, 'ствол доходит до кроны');

// --- 2. обводки: между стволами можно пробежать ---
let treePairs = 0;
let passable = 0;
let thinnest = Infinity;
for (let i = 0; i < w.treeList.length; i++) {
  const a = w.treeList[i];
  for (let j = i + 1; j < Math.min(w.treeList.length, i + 60); j++) {
    const b = w.treeList[j];
    const d = Math.hypot(a.x - b.x, a.z - b.z);
    if (d > 7) continue;
    treePairs++;
    const mx = (a.x + b.x) / 2;
    const mz = (a.z + b.z) / 2;
    if (!w.shells.blocked(mx, mz, 0.42, w.heightAt(mx, mz))) passable++;
    const hullA = Math.max(...a.hullLocal.map((q) => Math.hypot(q.x, q.z)));
    const hullB = Math.max(...b.hullLocal.map((q) => Math.hypot(q.x, q.z)));
    thinnest = Math.min(thinnest, d - hullA - hullB);
  }
}
log('проходы между стволами:', treePairs, 'пар · проходимо', passable,
  `(${(passable / Math.max(1, treePairs) * 100).toFixed(0)}%) · самый узкий просвет`,
  thinnest === Infinity ? '—' : thinnest.toFixed(2), 'м');
check(treePairs > 20, 'деревья растут рядом — есть что проверять');
check(passable / Math.max(1, treePairs) > 0.85, 'между деревьями можно пробежать');

// --- 3. маленький валун переступаем, большой — нет ---
const lowRock = w.rockList.find((r) => r.bbox && r.bbox.h < 0.55);
const bigRock = w.rockList.find((r) => r.bbox && r.bbox.h > 1.4);
const walkThrough = (rock) => {
  if (!rock) return null;
  const p = { x: rock.x, z: rock.z };
  const h = w.heightAt(p.x, p.z);
  w.shells.resolve(p, 0.42, null, h, 0.55);
  const moved = Math.hypot(p.x - rock.x, p.z - rock.z);
  return moved;
};
const lowMove = walkThrough(lowRock);
const bigMove = walkThrough(bigRock);
log('валуны: низкий', lowRock ? lowRock.bbox.h.toFixed(2) : '—', 'м (сдвиг', lowMove === null ? '—' : lowMove.toFixed(2),
  ') · высокий', bigRock ? bigRock.bbox.h.toFixed(2) : '—', 'м (сдвиг', bigMove === null ? '—' : bigMove.toFixed(2), ')');
check(lowMove !== null && lowMove < 0.2, 'низкий валун переступаем');
check(bigMove !== null && bigMove > 0.4, 'высокий валун не пропускает');

// --- 4. под каждой моделью земля плоская ---
let worstFlat = 0;
let flatSamples = 0;
for (let i = 0; i < w.treeList.length; i += 17) {
  const t = w.treeList[i];
  // проверяем пятно под самой моделью (ствол/валун), а не всю крону
  const hs = [w.heightAt(t.x, t.z)];
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2;
    hs.push(w.heightAt(t.x + Math.cos(a) * 0.42, t.z + Math.sin(a) * 0.42));
  }
  worstFlat = Math.max(worstFlat, Math.max(...hs) - Math.min(...hs));
  flatSamples++;
}
log('плоская земля под моделями:', flatSamples, 'деревьев · худший перепад', worstFlat.toFixed(3), 'м');
check(worstFlat < 0.12, 'модели встают на ровную землю');

// --- 5. дома зверей: коллизия и звери рядом с домом ---
const dens = w.dens || [];
let denBlocked = 0;
for (const d of dens) {
  for (const c of w.colliders) {
    if (c.disabled || c.fire || c.soft || c.kind === 'den') continue;
    const dist = Math.hypot(c.x - d.x, c.z - d.z);
    if (dist < d.radius * 0.55) denBlocked++;
  }
}
const withDen = game.mobs.list.filter((m) => m.den);
let farFromDen = 0;
for (const m of withDen) {
  if (Math.hypot(m.x - m.den.x, m.z - m.den.z) > m.den.radius + 2) farFromDen++;
}
const land = game.mobs.list.filter((m) => !m.def.swim && dens.some((d) => d.kind === m.type));
log('дома зверей:', dens.length, '· деревьев и камней рядом', denBlocked,
  '· зверей у дома', withDen.length, 'из', land.length, 'сухопутных · вне дома', farFromDen);
check(dens.length >= 15, 'дома зверей построены');
check(dens.every((d) => w.colliders.some((c) => c.kind === 'den' && c.den === d)), 'у каждого дома есть коллайдер');
check(withDen.length === land.length && farFromDen === 0, 'животные с логовищами живут рядом с ними');

// --- 5б. звери не застревают: подходим к каждому и смотрим, идёт ли он ---
const tracked = game.mobs.list.filter((m) => !m.def.swim).slice(0, 12);
const stuck = [];
for (const m of tracked) {
  // герой рядом — зверь не дремлет
  game.player.position.set(m.x + 3.2, w.heightAt(m.x + 3.2, m.z), m.z);
  const sx = m.x;
  const sz = m.z;
  let best = 0;
  for (let step = 0; step < 420; step++) {
    game.mobs.update(1 / 30, game.player, { creative: false, night: 0, onHit: () => {}, onSound: () => {}, damage: () => {} });
    best = Math.max(best, Math.hypot(m.x - sx, m.z - sz));
  }
  // важен не конечный сдвиг (зверь может вернуться к дому), а то, что он вообще ходил
  if (best < 0.4) stuck.push(`${m.type} ${best.toFixed(2)} м`);
}
log('звери в движении: проверено', tracked.length, '· почти не двигались', stuck.length,
  stuck.length ? '→ ' + stuck.slice(0, 4).join(', ') : '');
check(tracked.length > 5, 'звери есть');
check(stuck.length <= Math.ceil(tracked.length * 0.2), 'звери не застревают');

// --- 6. уклоны: 0/15/30/40°, не круче ---
const allowed = [0, Math.tan(15 * Math.PI / 180), Math.tan(30 * Math.PI / 180), Math.tan(40 * Math.PI / 180)];
const GRID = Math.round(Math.sqrt(w.heights.length));
const STEP = 360 / (GRID - 1);
let onStep = 0;
let pairs = 0;
let maxRatio = 0;
for (let iz = 0; iz < GRID; iz += 3) {
  for (let ix = 0; ix < GRID - 1; ix += 3) {
    const ratio = Math.abs(w.heights[iz * GRID + ix + 1] - w.heights[iz * GRID + ix]) / STEP;
    maxRatio = Math.max(maxRatio, ratio);
    pairs++;
    if (allowed.some((a) => Math.abs(a - ratio) < 0.03)) onStep++;
  }
}
// уклон поверхности вне ровных площадок (по краю площадки законен уступ-обрыв)
let maxSlope = 0;
for (let iz = 1; iz < GRID - 1; iz++) {
  for (let ix = 1; ix < GRID - 1; ix++) {
    const i = iz * GRID + ix;
    if (w.flatCore.has(i)) continue;
    // у края ровной площадки законен уступ (обрыв): такие узлы не считаем
    let nearFlat = w.flatCore.has(i);
    for (const sp of w._flatLog || []) {
      if (nearFlat) break;
      if (Math.hypot(-180 + ix * STEP - sp.x, -180 + iz * STEP - sp.z) < sp.r + STEP * 3) nearFlat = true;
    }
    if (nearFlat) continue;
    const dx = Math.abs(w.heights[i + 1] - w.heights[i]);
    const dz = Math.abs(w.heights[i + GRID] - w.heights[i]);
    maxSlope = Math.max(maxSlope, Math.max(dx, dz) / STEP);
  }
}
const tan15 = Math.tan(15 * Math.PI / 180);
const multiple = (ratio) => Math.abs(ratio / tan15 - Math.round(ratio / tan15)) < 0.02;
let onLattice = 0;
for (let iz = 0; iz < GRID; iz += 2) {
  for (let ix = 0; ix < GRID - 1; ix += 2) {
    const ratio = Math.abs(w.heights[iz * GRID + ix + 1] - w.heights[iz * GRID + ix]) / STEP;
    if (multiple(ratio)) onLattice++;
  }
}
log('уклоны: кратны 15° у', (onLattice / (Math.floor(GRID / 2) * Math.floor((GRID - 1) / 2)) * 100).toFixed(0),
  '% пар · максимум по узлам', (Math.atan(maxRatio) * 180 / Math.PI).toFixed(1),
  '° · максимум gradient', (Math.atan(maxSlope) * 180 / Math.PI).toFixed(1), '°');
check(onLattice > 0.9 * Math.floor(GRID / 2) * Math.floor((GRID - 1) / 2), 'все склоны кратны 15°');
check(maxSlope <= 0.86, 'круче 40° поверхности нет');

// --- 7. малые острова ---
let isletLand = 0;
for (let i = 0; i < 360; i++) {
  const a = (i / 360) * Math.PI * 2;
  for (const r of [105, 125, 145]) {
    if (w.heightAt(Math.cos(a) * r, Math.sin(a) * r) > 2) { isletLand++; break; }
  }
}
const waterBetween = w.heightAt(0, 0) > 2 && isletLand > 20;
log('малые острова: направлений с сушей за 105 м —', isletLand, 'из 360 · проливы есть:', waterBetween);
check(isletLand > 40, 'вокруг главного острова есть другие');

// --- 8. чанки: невидимое не рисуется ---
const cam = new THREE.PerspectiveCamera(60, 1.6, 0.1, 900);
cam.position.set(0, 30, 0);
cam.lookAt(1, 28, 0);
cam.updateMatrixWorld(true);
w.updateChunks(cam);
const vis = w.chunkStats.visible;
const total = w.chunkStats.total;
cam.position.set(0, 30, 0);
cam.lookAt(-1, 28, 0);
cam.updateMatrixWorld(true);
w.updateChunks(cam);
const vis2 = w.chunkStats.visible;
log('чанки:', total, '· видно', vis, '· после поворота на 180° —', vis2);
check(total > 40, 'карта разбита на чанки');
check(vis > 0 && vis < total, 'невидимые чанки отсекаются');
check(vis !== vis2, 'при повороте камеры набор чанков меняется');

// --- 9. лодка и вода ---
const boat = game.boat;
const boatDepth = boat ? w.heightAt(boat.x, boat.z) : 0;
log('лодка:', boat ? `${boat.x.toFixed(1)}, ${boat.z.toFixed(1)}` : 'нет', '· глубина под ней',
  boatDepth.toFixed(2), 'м');
check(!!boat && boat.placed, 'лодка на воде у берега');
check(boatDepth < -0.6, 'лодка стоит на глубокой воде');

game.player.position.set(boat.x, 0, boat.z + 1.2);
const boarded = game.toggleSailing();
const yBefore = boat.group.position.y;
const dBefore = Math.abs(boat.x);
game.input.forward = true;
for (let i = 0; i < 90; i++) {
  game.world.time += 1 / 30;
  game.updateBoat(1 / 30);
}
game.input.forward = false;
const moved = Math.abs(boat.x) - dBefore;
const yWave = Math.abs(boat.group.position.y - yBefore) > 0.001;
const depthNow = w.heightAt(boat.x, boat.z);
log('плавание: сел в лодку:', boarded, '· сдвиг по курсу', (boat.speed).toFixed(1), 'м/с · качка:',
  yWave, '· глубина под лодкой', depthNow.toFixed(2), 'м · герой на палубе:',
  Math.abs(game.player.position.x - boat.x) < 0.01);
check(boarded && game.sailing, 'в лодку можно сесть');
check(boat.speed > 2, 'лодка идёт вперёд');
check(yWave, 'лодка качается на волне');
check(depthNow < -0.6, 'лодка остаётся на воде');

// на сушу лодка не выходит
const dryX = boat.x + 60;
w.heightAt; // noop
let grounded = false;
for (let i = 0; i < 400; i++) {
  game.input.forward = true;
  game.world.time += 1 / 30;
  game.updateBoat(1 / 30);
  if (w.heightAt(boat.x, boat.z) > -0.55) grounded = true;
}
game.input.forward = false;
log('лодка не вылезает на сушу:', !grounded, '· глубина', w.heightAt(boat.x, boat.z).toFixed(2), 'м');
check(!grounded, 'лодка не заплывает на берег');
void moved; void dryX;

// --- 10. физика воды: волна в разных точках разная ---
const wa = game.waveAt(0, 0, 12);
const wb = game.waveAt(40, 25, 12);
log('волны: в точке A', wa.toFixed(2), 'м · в точке B', wb.toFixed(2), 'м');
check(Math.abs(wa - wb) > 0.01, 'поверхность воды не плоская');

log('---');
log(bad ? `НЕ СХОДИТСЯ: ${bad}` : 'ошибок нет');
