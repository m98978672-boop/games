import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { makeWindow, tick } from '../../tools/bughunt/lib/dom.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const { win, sandbox, document, timers } = makeWindow(html);
for (const match of html.matchAll(/<script src="([^"]+)"/g)) {
  vm.runInContext(fs.readFileSync(path.join(root, match[1]), 'utf8'), sandbox, { filename: match[1] });
}
document.dispatchEvent({ type: 'DOMContentLoaded' });
assert.ok(win.DD_STATE, 'игра должна запуститься');
const state = win.DD_STATE;
state.zombies.length = 0;
function key(type, code) { win.dispatchEvent({ type, code, preventDefault() {} }); }
const oldX = state.player.x;
key('keydown', 'KeyD'); tick(timers, 20); key('keyup', 'KeyD');
assert.ok(state.player.x > oldX, 'персонаж должен двигаться вправо');
assert.equal(win.DD.GameplayHelpers.directionRow(state.player.fx, state.player.fy), 3);
const x = state.player.x;
key('keydown', 'KeyD'); win.dispatchEvent({ type: 'blur' }); tick(timers, 10);
assert.equal(state.player.x, x, 'потеря фокуса должна сбрасывать ввод');
key('keydown', 'KeyI'); key('keyup', 'KeyI');
key('keydown', 'KeyD'); tick(timers, 10);
assert.equal(state.player.x, x, 'во время меню движение остановлено');
document.getElementById('modal-close').click();
tick(timers, 10);
assert.equal(state.player.x, x, 'после меню не остаются залипшие клавиши');
document.getElementById('btn-pause').click();
assert.equal(state.paused, true);
key('keydown', 'F3'); key('keyup', 'F3');
assert.equal(win.DD.CatalogF3.isOpen(), true);
document.getElementById('f3-animations').hidden = true; // Мини-браузер не отражает атрибут hidden.
document.getElementById('f3-animation-toggle').click();
assert.equal(document.getElementById('f3-animations').hidden, false);
assert.ok(document.getElementById('anim-label').textContent.startsWith('ANIM-'));
document.getElementById('anim-apply').click();
const card = document.getElementById('f3-grid').children[0];
assert.ok(card && card.children[0]);
card.children[0].click();
assert.equal(document.getElementById('f3-inspector').hidden, false);
document.getElementById('f3-assess').click();
assert.ok(document.getElementById('f3-assess-result').textContent.includes('Контраст'));
key('keydown', 'F3'); key('keyup', 'F3');
assert.equal(state.paused, true, 'каталог не должен снимать ранее установленную паузу');
document.getElementById('btn-resume').click();
assert.equal(state.paused, false);
key('keydown', 'KeyD'); tick(timers, 10); key('keyup', 'KeyD');
assert.ok(state.player.x > x, 'после закрытия меню управление работает');
// Дверь рядом с машиной имеет приоритет перед посадкой в машину.
state.player.x = 15; state.player.y = 15; state.player.fx = 1; state.player.fy = 0;
state.world.setTile(16, 15, win.DD.TILE.DOOR);
state.world.doors['16,15'] = { tx: 16, ty: 15, open: false, broken: false };
state.vehicles.push({ id: 'test-car', x: 15, y: 15, fuel: 10, name: 'test' });
key('keydown', 'KeyE'); key('keyup', 'KeyE');
assert.equal(state.world.doors['16,15'].open, true);
assert.equal(state.player.inVehicleId, '');
// Ближний удар попадает в ближайшего врага перед игроком, а не за спиной.
const front = win.DD.Systems.createZombie(1, 'walker', 16, 15);
const back = win.DD.Systems.createZombie(2, 'walker', 14.5, 15);
state.zombies.push(front, back);
const frontHP = front.hp, backHP = back.hp;
key('keydown', 'Space'); key('keyup', 'Space');
assert.ok(front.hp < frontHP);
assert.equal(back.hp, backHP);

console.log('[dead-district interaction] OK');
