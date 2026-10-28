// v0.17: настоящий полёт в креативе (зажал пробел — вверх, зажал Shift — вниз,
// отпустил — висим), хвост черепахи больше не дёргается, звери не рождаются
// внутри стволов, валунов и кустов.
// Запуск: node tests/v017.mjs (нужен npm run test:build)
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
const key = (code, type = 'keydown') => window.dispatchEvent(new window.KeyboardEvent(type, { code, bubbles: true }));
const log = (...a) => console.log(...a);
let bad = 0;
const check = (ok, text) => { if (!ok) bad++; return ok; };

// --- 1. полёт: зажатый пробел поднимает, зажатый Shift опускает, отпустил — висим ---
if (!game.creative) game.toggleCreative();
const p = game.player;
p.position.set(0, 12, 0);
p.velocity.set(0, 0, 0);

// зажимаем пробел ОДНИМ событием (как в настоящей клавиатуре: автоповтор не нужен)
key('Space', 'keydown');
let y0 = p.position.y;
for (let i = 0; i < 60; i++) game.update(1 / 30);
const climb = p.position.y - y0;
const stillHeld = game.input.jumpHeld === true && game.input.jump === false;
key('Space', 'keyup');

// отпустили — не падаем и не взлетаем, просто висим
const yHoverStart = p.position.y;
for (let i = 0; i < 30; i++) game.update(1 / 30);
const hoverDrift = Math.abs(p.position.y - yHoverStart);

// зажимаем Shift — спуск
key('ShiftLeft', 'keydown');
const yDescStart = p.position.y;
for (let i = 0; i < 60; i++) game.update(1 / 30);
const descent = p.position.y - yDescStart;
key('ShiftLeft', 'keyup');

// после отпускания Shift снова висим на месте
const yRest = p.position.y;
for (let i = 0; i < 20; i++) game.update(1 / 30);
const restDrift = Math.abs(p.position.y - yRest);

log('полёт по зажатию: вверх', climb.toFixed(2), 'м · вниз', descent.toFixed(2),
  'м · зависание', hoverDrift.toFixed(3), 'м · после спуска', restDrift.toFixed(3), 'м');
check(climb > 4, 'полёт вверх');
check(descent < -4, 'полёт вниз');
check(hoverDrift < 0.4 && restDrift < 0.4, 'зависание без клавиш');
check(stillHeld, 'input.jumpHeld живёт между кадрами');
// пробел всё ещё прыгает с земли (импульс не сломан)
game.toggleCreative();
const yGround = w.heightAt(0, 0);
p.position.set(0, yGround, 0);
p.velocity.set(0, 0, 0);
p.grounded = true;
key('Space', 'keydown');
game.update(1 / 30);
const jumped = p.velocity.y > 0 || p.position.y > yGround + 0.01;
key('Space', 'keyup');
log('прыжок с земли после переделки:', jumped);
check(jumped, 'обычный прыжок');

// --- 2. хвост черепахи: угол держится вокруг базового, без рывков ---
const turtle = game.mobs.list.find((m) => m.type === 'turtle');
const tail = turtle.parts.tail;
const baseZ = Math.PI / 2 + 0.18;
let minZ = Infinity;
let maxZ = -Infinity;
let maxYaw = 0;
for (let i = 0; i < 240; i++) {
  turtle.phase += 0.06;
  turtle.speedNow = 1.4;
  game.mobs._animate(turtle, 1 / 30);
  minZ = Math.min(minZ, tail.rotation.z);
  maxZ = Math.max(maxZ, tail.rotation.z);
  maxYaw = Math.max(maxYaw, Math.abs(tail.rotation.y));
}
const swing = maxZ - minZ;
const offBase = Math.max(Math.abs(maxZ - baseZ), Math.abs(minZ - baseZ));
log('хвост черепахи: базовый угол', baseZ.toFixed(2), '· качание', swing.toFixed(3),
  'рад · отклонение от базы', offBase.toFixed(3), '· виляние', maxYaw.toFixed(3));
check(offBase < 0.12, 'хвост не выламывается из базового угла');
check(maxYaw < 0.3, 'хвост виляет спокойно');
// кончик смотрит назад, а не вбок
const tailTip = new THREE.Box3().setFromObject(tail);
log('  хвост сзади: x', tailTip.min.x.toFixed(2), '…', tailTip.max.x.toFixed(2),
  '· по центру панциря z', ((tailTip.min.z + tailTip.max.z) / 2).toFixed(2));
check(tailTip.max.x < -0.4, 'хвост за панцирем');

// --- 3. звери не рождаются внутри объектов ---
const halfDiag = (m) => Math.hypot(m.hitboxSize.w, m.hitboxSize.d) * 0.5;
let inside = 0;
let minGap = Infinity;
for (const m of game.mobs.list) {
  if (!m.alive) continue;
  const r = m.def.radius;
  // ни одного зверя внутри коллайдера (ствол, валун, куст)
  for (const c of w.colliders) {
    if (c.disabled || c.fire) continue;
    const d = Math.hypot(m.x - c.x, m.z - c.z);
    const gap = d - c.r - r;
    if (c.r >= 0.3) minGap = Math.min(minGap, gap);
    if (d < c.r) inside++;
    void halfDiag;
  }
}
log('спавн: зверей', game.mobs.list.length, '· внутри коллайдеров', inside,
  '· минимальный зазор до ствола', minGap.toFixed(2), 'м');
check(inside === 0, 'никто не родился в объекте');

// новые звери, рождённые заново, тоже встают на свободное место
let fresh = 0;
let freshInside = 0;
for (let i = 0; i < 12; i++) {
  for (const type of ['boar', 'crab', 'turtle', 'monkey', 'snake']) {
    const before = game.mobs.list.length;
    const mob = game.mobs.spawn(type);
    if (game.mobs.list.length !== before + 1) continue;
    fresh++;
    const r = halfDiag(mob);
    for (const c of w.colliders) {
      if (c.disabled || c.fire) continue;
      if (Math.hypot(mob.x - c.x, mob.z - c.z) < c.r + r * 0.8) { freshInside++; break; }
    }
    if (w.shells.blocked(mob.x, mob.z, r * 0.8, w.heightAt(mob.x, mob.z))) freshInside++;
    // убираем за собой, чтобы не копить зверей
    game.mobs.group.remove(mob.group);
    game.mobs.list.pop();
  }
}
log('повторный спавн:', fresh, 'зверей · в объектах', freshInside);
check(fresh === 60, 'все 60 зверей появились');
check(freshInside === 0, 'повторный спавн тоже чистый');

// --- 4. далёкие звери не заползают в деревья ---
const far = game.mobs.list.find((m) => m.type === 'boar');
let farInside = false;
for (let i = 0; i < 400; i++) {
  far.think = 0;
  game.mobs._dormantStep(far, 1 / 30);
  for (const c of w.colliders) {
    if (c.disabled || c.fire || c.soft) continue;
    if (Math.hypot(far.x - c.x, far.z - c.z) < c.r + far.def.radius * 0.6) farInside = true;
  }
}
log('далёкий зверь обходит стволы за 400 шагов:', !farInside);
check(!farInside, 'далёкое блуждание без стволов');

log('---');
log(bad ? `НЕ СХОДИТСЯ: ${bad}` : 'ошибок нет');
