// Живность и бой: проверяем урон по кабану, лук, добычу и крафт бинта.
// Запуск: node tests/mobs.mjs (нужен собранный tests/.harness-bundle.js)
import { JSDOM } from 'jsdom';
import fs from 'node:fs';
import path from 'node:path';

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

log('зверей в мире:', game.mobs.list.length,
  '· видов:', new Set(game.mobs.list.map((m) => m.type)).size);
log('предметов:', Object.keys(game.ui.items).length,
  '· слотов быстрого доступа:', game.ui.hotbarSize,
  '· пустой хотбар на старте:', game.state.hotbar.every((id) => id === null));

// --- удар по кабану ---
const boar = game.mobs.list.find((m) => m.type === 'boar');
game.player.setPosition(boar.x + 1.6, boar.z, game.world);
game.player.facing = Math.atan2(boar.x - game.player.position.x, boar.z - game.player.position.z);
game.state.inventory.spear = 1;
game.assignHotbar('spear', 4);
game.selectSlot(4);
const hpBefore = boar.hp;
game.attack();
log('удар копьём: hp', hpBefore, '->', boar.hp, '· урон:', hpBefore - boar.hp);

// добиваем до смерти
let killed = false;
for (let i = 0; i < 12 && !killed; i++) {
  game.attackCooldown = 0;
  game.attack();
  killed = !boar.alive;
}
log('кабан побеждён:', killed, '· сырое мясо:', game.state.inventory.rawMeat || 0,
  '· шкуры:', game.state.inventory.hide || 0);

// --- лук ---
game.state.inventory.bow = 1;
game.state.inventory.arrows = 5;
game.assignHotbar('bow', 5);
game.selectSlot(5);
const arrowsBefore = game.state.inventory.arrows;
game.attackCooldown = 0;
game.attack();
log('выстрел: стрел', arrowsBefore, '->', game.state.inventory.arrows,
  '· снарядов в полёте:', game.projectiles.length);

// --- крафт бинта ---
game.state.inventory.fiber = 4;
game.state.inventory.hide = 2;
game.state.health = 40;
game.craft('bandage');
game.assignHotbar('bandage', 2);
game.selectSlot(2);
game.useSelected();
log('бинт: здоровье стало', Math.round(game.state.health), '· осталось бинтов:', game.state.inventory.bandage || 0);

// --- рецепт у костра требует огня ---
const before = game.state.inventory.cookedMeat || 0;
game.state.inventory.rawMeat = 2;
game.craft('cookedMeat');
log('жарка без костра заблокирована:', (game.state.inventory.cookedMeat || 0) === before);

// --- хотбар: слот убирается, сумка остаётся ---
game.clearHotbar(5);
log('слот 5 очищен:', game.state.hotbar[5] === null, '· лук в сумке:', (game.state.inventory.bow || 0) > 0);

// --- колесо мыши переключает слот ---
const slotBefore = game.selected;
window.dispatchEvent(new window.WheelEvent('wheel', { deltaY: 120, bubbles: true }));
log('колесо: слот', slotBefore, '->', game.selected);

// --- кабан бьёт игрока (несколько кадров: замах, потом укус) ---
const boar2 = game.mobs.list.find((m) => m.type === 'boar' && m.alive);
if (boar2) {
  boar2.state = 'chase';
  boar2.biteTimer = 0;
  game.player.setPosition(boar2.x + 1.0, boar2.z, game.world);
  const hp = game.state.health;
  const ctx = { audio: null, onHit: (d, c) => game.takeDamage(d, c), listener: null, night: 0 };
  for (let i = 0; i < 12; i++) game.mobs.update(0.1, game.player, ctx);
  log('атака кабана: здоровье', Math.round(hp), '->', Math.round(game.state.health));
}

// --- сквозь зверя не пройти ---
const crab = game.mobs.list.find((m) => m.type === 'crab');
game.player.position.set(crab.x + 0.05, game.player.position.y, crab.z);
game.mobs.resolvePlayer(game.player.position, { x: 0, z: 0 }, 0.42);
const pushDist = Math.hypot(game.player.position.x - crab.x, game.player.position.z - crab.z);
const minDist = crab.def.radius + 0.42;
log('расталкивание: дистанция', pushDist.toFixed(2), '≥', minDist.toFixed(2), '·', pushDist >= minDist - 0.02);

// --- звери не слипаются ---
for (const m of game.mobs.list) {
  if (m.type === 'boar' && m.alive) { m.x = boar2.x; m.z = boar2.z; }
}
for (let i = 0; i < 4; i++) game.mobs.update(0.1, game.player, { audio: null, onHit: () => {}, listener: null, night: 0 });
const boars = game.mobs.list.filter((m) => m.type === 'boar' && m.alive);
let minPair = Infinity;
for (let i = 0; i < boars.length; i++) {
  for (let j = i + 1; j < boars.length; j++) {
    minPair = Math.min(minPair, Math.hypot(boars[i].x - boars[j].x, boars[i].z - boars[j].z));
  }
}
log('минимальная дистанция между кабанами:', minPair.toFixed(2), '· слипания нет:', minPair > 0.45);

// --- хитбоксы (F3 → F) ---
const bboxOn = game.mobs.toggleHitboxes(true);
const anyBox = game.mobs.list.every((m) => m.hitbox && m.hitbox.geometry);
log('хитбоксы включаются:', bboxOn, '· у всех зверей есть коробка:', anyBox,
  '· размер кабана:', JSON.stringify(game.mobs.list.find((m) => m.type === 'boar').def.hitbox));
game.mobs.toggleHitboxes(false);

// --- видимость: то, что вне кадра или за стволом, не рисуется ---
const culler = game.culler;
const target = game.mobs.list.find((m) => m.type === 'boar');
const cam = game.camera;
culler.update(0.016, 0);
// ставим камеру вплотную к зверю и смотрим на него
target.x = 0; target.z = 0; target.group.position.set(0, game.world.heightAt(0, 0), 0);
cam.position.set(6, game.world.heightAt(0, 0) + 2, 6);
cam.lookAt(0, game.world.heightAt(0, 0) + 0.7, 0);
cam.updateMatrixWorld(true);
culler.update(0.016, 0);
const seen = culler.isVisible(target.group);
// отворачиваемся
cam.lookAt(60, game.world.heightAt(0, 0) + 2, 60);
cam.updateMatrixWorld(true);
culler.update(0.4, 0);
culler.update(0.4, 0);
const unseen = culler.isVisible(target.group);
log('видимость: смотрит →', seen, '· отвернулись →', unseen, '· отсечка работает:', seen && !unseen);
log('объектов под отсечкой:', culler.items.size);

// --- куст: сбор ягод руками, куст остаётся ---
const bushNode = game.resources.nodes.find((n) => n.type === 'bush' && n.berries);
game.player.setPosition(bushNode.x + 1.3, bushNode.z, game.world);
const berriesBefore = game.state.inventory.berries || 0;
game.interact();
log('сбор ягод: ягод', berriesBefore, '->', game.state.inventory.berries || 0,
  '· куст цел:', bushNode.alive, '· повторно нельзя:', !game.resources.canPickBerries(bushNode));

// --- рудный камень ---
const oreNode = game.resources.nodes.find((n) => n.ore);
let oreDrops = {};
if (oreNode) {
  for (let i = 0; i < 4; i++) {
    const r = game.resources.strike(oreNode, { mine: 3 });
    if (r.depleted) { oreDrops = r.drops; break; }
  }
}
log('рудный камень есть:', !!oreNode, '· добыча:', JSON.stringify(oreDrops),
  '· кремня больше обычного:', (oreDrops.flint || 0) >= 3);

// --- анимации зверей: узлы двигаются ---
const animMoved = {};
for (const type of ['boar', 'crab', 'gull', 'snake']) {
  const m = game.mobs.list.find((x) => x.type === type);
  m.state = 'patrol';
  m.speedNow = 2;
  const snap = () => JSON.stringify({
    legs: m.parts.legs?.map((l) => [+l.rotation.x.toFixed(3), +l.rotation.z.toFixed(3)]),
    head: m.parts.head ? +m.parts.head.rotation.y.toFixed(3) : null,
    tail: m.parts.tail ? +m.parts.tail.rotation.y.toFixed(3) : null,
    claws: m.parts.claws?.map((c) => +c.rotation.z.toFixed(3)),
    wings: m.parts.wings?.map((w) => +w.rotation.x.toFixed(3)),
    segs: m.parts.segments?.map((s) => +s.position.z.toFixed(3)),
  });
  const a = snap();
  for (let i = 0; i < 12; i++) game.mobs._animate(m, 0.06);
  animMoved[type] = a !== snap();
}
log('анимации зверей:', JSON.stringify(animMoved),
  '· все двигаются:', Object.values(animMoved).every(Boolean));

// --- виды удара: рубка, кирка, сбор ---
game.addItem('axe', 1);
game.assignHotbar('axe', 0);
game.selectSlot(0);
const treeNode = game.resources.nodes.find((n) => n.type === 'tree');
game.player.setPosition(treeNode.x + 2, treeNode.z, game.world);
game.attackCooldown = 0;
game.attack();
const chopKind = game.player.actionKind;
const chipsAfterChop = game.chips.length;
game.addItem('pickaxe', 1);
game.assignHotbar('pickaxe', 1);
game.selectSlot(1);
const rockNode = game.resources.nodes.find((n) => n.type === 'rock');
game.player.setPosition(rockNode.x + 2, rockNode.z, game.world);
game.attackCooldown = 0;
game.attack();
log('виды удара: рубка =', chopKind, '· кирка =', game.player.actionKind,
  '· щепки летят:', chipsAfterChop > 0);

// --- звуки, которых раньше не было ---
const soundNames = ['berryPick', 'rustle', 'treeFall', 'stoneBreak', 'oreHit', 'stoneCrack', 'whoosh'];
log('новые звуки на месте:', soundNames.every((n) => typeof game.audio[n] === 'function'));

log('ошибок нет');
