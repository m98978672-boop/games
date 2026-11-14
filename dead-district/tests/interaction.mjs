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
  vm.runInContext(fs.readFileSync(path.join(root, match[1].split('?')[0]), 'utf8'), sandbox, { filename: match[1] });
}
document.dispatchEvent({ type: 'DOMContentLoaded' });
assert.ok(win.DD_STATE, 'игра должна запуститься');
const state = win.DD_STATE;
state.zombies.length = 0;
function key(type, code) { win.dispatchEvent({ type, code, preventDefault() {} }); }
const oldX = state.player.x;
key('keydown', 'KeyD'); tick(timers, 20); key('keyup', 'KeyD');
assert.ok(state.player.x > oldX, 'персонаж должен двигаться вправо');
assert.ok(state.player.fx > 0 && state.player.fy < 0, 'клавиша вправо следует экранной оси изометрии');
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
state.player.x = 16; state.player.y = 15; state.player.fx = 1; state.player.fy = 0;
key('keydown', 'KeyE'); key('keyup', 'KeyE');
assert.equal(state.world.doors['16,15'].open, true, 'нельзя закрыть дверь, стоя в проёме');
state.player.x = 15; state.player.y = 15;
// Ближний удар попадает в ближайшего врага перед игроком, а не за спиной.
const front = win.DD.Systems.createZombie(1, 'walker', 16, 15);
const back = win.DD.Systems.createZombie(2, 'walker', 14.5, 15);
state.zombies.push(front, back);
const frontHP = front.hp, backHP = back.hp;
key('keydown', 'Space'); key('keyup', 'Space');
assert.ok(front.hp < frontHP);
assert.equal(back.hp, backHP);
assert.equal(state.bloodMarks.length, 1, 'удар оставляет кровь');
assert.equal(state.bloodMarks[0].x, front.x);
assert.ok(Object.keys(state.world.furniture).length > 0, 'в зданиях есть мебель');
for (const f of Object.values(state.world.furniture)) assert.equal(state.world.isWalkable(f.tx, f.ty), false, 'мебель не проходится насквозь');
// Разбивание окна игроком меняет состояние и записывает время для частиц.
state.world.setTile(16, 15, win.DD.TILE.WINDOW);
state.world.windows['16,15'] = {tx:16,ty:15,broken:false,barricade:0};
key('keydown','KeyE'); key('keyup','KeyE');
assert.equal(state.world.windows['16,15'].broken, true);
assert.equal(state.world.windows['16,15'].breakTime, state.elapsed);
assert.equal(state.world.breakWindow(16,15), false, 'повторного разбивания нет');
// Зомби разбивает именно клетку, на которой остановился, и перелезает.
const winWorld = new win.DD.ChunkWorld(123);
winWorld.setTile(1,0,win.DD.TILE.WINDOW);
winWorld.windows['1,0']={tx:1,ty:0,broken:false,barricade:0};
const runner = win.DD.Systems.createZombie(10,'runner',0,0);
runner.state = win.DD.ZSTATE.CHASE; runner.speed = 1;
win.DD.Systems.stepZombieActive(runner,.6,5,0,true,{},winWorld);
assert.equal(winWorld.windows['1,0'].broken,true);
assert.equal(runner.state,win.DD.ZSTATE.CLIMB_WINDOW);
win.DD.Systems.stepZombieActive(runner,1.2,5,0,true,{},winWorld);
assert.ok(runner.x > 1, 'зомби перелезает через окно');

state.world.setTile(16, 15, win.DD.TILE.DOOR);
// Таблицы районов ссылаются на новые реальные предметы.
const additions = ['oatmeal','rice','canned_fish','rope','work_gloves','juice'];
const loot = JSON.parse(fs.readFileSync(path.join(root,'data/loot_tables.json'),'utf8'));
const items = JSON.parse(fs.readFileSync(path.join(root,'data/items.json'),'utf8')).items;
for (const id of additions) {
  assert.ok(items.some(item=>item.id===id));
  assert.ok(Object.values(loot.zones).some(zone=>zone.entries.some(entry=>entry.id===id)));
}


// На реальном игровом цикле бег вдоль открытой двери не пересекает стену.
state.zombies.length = 0;
state.world.setTile(17, 14, win.DD.TILE.ASPHALT);
state.world.setTile(17, 15, win.DD.TILE.WALL_BRICK);
state.world.setTile(16, 14, win.DD.TILE.ASPHALT);
state.world.setTile(16, 16, win.DD.TILE.ASPHALT);
state.player.x = 17; state.player.y = 14;
key('keydown', 'ShiftLeft'); key('keydown', 'KeyS'); key('keydown', 'KeyA'); tick(timers, 40);
key('keyup', 'KeyS'); key('keyup', 'KeyA'); key('keyup', 'ShiftLeft');
assert.ok(state.player.y <= 14.3 + 1e-6, 'нельзя пробежать через стену рядом с дверью');
state.player.x = 16; state.player.y = 14;
key('keydown', 'KeyS'); key('keydown', 'KeyA'); tick(timers, 40); key('keyup', 'KeyS'); key('keyup', 'KeyA');
assert.ok(state.player.y > 15, 'через открытый проём пройти можно');

// Настоящая дверь процедурного здания, а не вручную расставленные тайлы.
const generatedDoor = Object.values(state.world.chunks).flatMap(chunk => chunk.doors)[0];
assert.ok(generatedDoor, 'в мире есть двери');
const localY = ((generatedDoor.ty % 32) + 32) % 32;
const inward = localY === 10 ? -1 : 1;
generatedDoor.open = false;
state.player.x = generatedDoor.tx; state.player.y = generatedDoor.ty - inward;
state.player.fx = 0; state.player.fy = inward;
key('keydown', 'KeyE'); key('keyup', 'KeyE');
assert.equal(generatedDoor.open, true, 'E открывает настоящую дверь');
key('keydown', inward > 0 ? 'KeyS' : 'KeyW'); key('keydown', inward > 0 ? 'KeyA' : 'KeyD'); tick(timers, 50);
key('keyup', inward > 0 ? 'KeyS' : 'KeyW'); key('keyup', inward > 0 ? 'KeyA' : 'KeyD');
assert.ok((state.player.y - generatedDoor.ty) * inward > 0.7, 'можно войти в настоящее здание');

document.getElementById('btn-event').click();
assert.ok(document.getElementById('modal-body').textContent.includes('EVT-'));
const hpBefore = state.health.globalHp, day = state.tw.day;
document.getElementById('modal-list').children[2].click();
assert.equal(state.encounterDay, day);
assert.equal(state.health.globalHp, hpBefore);
document.getElementById('modal-close').click();
document.getElementById('btn-event').click();
assert.ok(document.getElementById('modal-body').textContent.includes('уже разрешена'));
console.log('[dead-district interaction] OK');
