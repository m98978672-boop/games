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
  '· рецептов:', game.ui.hotbarOrder.length, 'слотов');

// --- удар по кабану ---
const boar = game.mobs.list.find((m) => m.type === 'boar');
game.player.setPosition(boar.x + 1.6, boar.z, game.world);
game.player.facing = Math.atan2(boar.x - game.player.position.x, boar.z - game.player.position.z);
game.state.inventory.spear = 1;
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
const bowSlot = game.ui.hotbarOrder.indexOf('bow');
game.selectSlot(bowSlot);
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
const bandageSlot = game.ui.hotbarOrder.indexOf('bandage');
game.selectSlot(bandageSlot);
game.useSelected();
log('бинт: здоровье стало', Math.round(game.state.health), '· осталось бинтов:', game.state.inventory.bandage || 0);

// --- рецепт у костра требует огня ---
const before = game.state.inventory.cookedMeat || 0;
game.state.inventory.rawMeat = 2;
game.craft('cookedMeat');
log('жарка без костра заблокирована:', (game.state.inventory.cookedMeat || 0) === before);

// --- колесо мыши переключает слот ---
const slotBefore = game.selected;
window.dispatchEvent(new window.WheelEvent('wheel', { deltaY: 120, bubbles: true }));
log('колесо: слот', slotBefore, '->', game.selected);

// --- кабан бьёт игрока ---
const boar2 = game.mobs.list.find((m) => m.type === 'boar' && m.alive);
if (boar2) {
  boar2.state = 'chase';
  boar2.biteTimer = 0;
  game.player.setPosition(boar2.x + 0.4, boar2.z + 0.4, game.world);
  const hp = game.state.health;
  game.mobs.update(0.2, game.player, { audio: null, onHit: (d, c) => game.takeDamage(d, c) });
  log('атака кабана: здоровье', Math.round(hp), '->', Math.round(game.state.health));
}

log('ошибок нет');
