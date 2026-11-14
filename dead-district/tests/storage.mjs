import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { makeWindow } from '../../tools/bughunt/lib/dom.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const { win, sandbox, document } = makeWindow(html);
for (const match of html.matchAll(/<script src="([^"]+)"/g)) vm.runInContext(fs.readFileSync(path.join(root, match[1].split('?')[0]), 'utf8'), sandbox, { filename: match[1] });
document.dispatchEvent({ type: 'DOMContentLoaded' });
let state = win.DD_STATE;
state.zombies = []; state.npcs = [];
const key = (code) => { win.dispatchEvent({type:'keydown',code,preventDefault(){}}); win.dispatchEvent({type:'keyup',code,preventDefault(){}}); };
const containers=Object.values(state.world.containers);
for (const kind of ['shelf','crate','chest']) assert.ok(containers.some(c=>c.kind===kind), `в мире есть ${kind}`);
function approach(cont) {
  for (const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
    if (state.world.isWalkable(cont.tx-dx,cont.ty-dy)) {
      Object.assign(state.player,{x:cont.tx-dx,y:cont.ty-dy,fx:dx,fy:dy,inVehicleId:''}); return;
    }
  }
  throw new Error('нет подхода к контейнеру');
}
const chest=containers.find(c=>c.kind==='chest'); const coord=chest.tx+','+chest.ty;
approach(chest); key('KeyE');
assert.equal(document.getElementById('storage-overlay').hidden,false);
assert.equal(document.getElementById('storage-title').textContent,'СУНДУК');
assert.ok(state.storage[coord].length > 0);
// Подконтрольное содержимое позволяет проверить перенос по одной штуке и сохранность свежести.
state.storage[coord]=[{id:'apple',qty:2,freshness:.42}];
key('Escape'); approach(chest); key('KeyE');
let count=win.DD.Systems.countItem(state.inv,'apple');
document.getElementById('storage-contents').children[0].click();
assert.equal(win.DD.Systems.countItem(state.inv,'apple'),count+1);
assert.equal(state.storage[coord][0].qty,1);
let index=state.inv.items.findIndex(s=>s.id==='apple');
document.getElementById('storage-inventory').children[index].click();
assert.equal(win.DD.Systems.countItem(state.inv,'apple'),count);
assert.equal(state.storage[coord].reduce((n,s)=>n+s.qty,0),2);
assert.ok(state.storage[coord].every(s=>s.freshness===.42));
// Одинаковые стопки с разной свежестью не должны смешиваться.
win.DD.Systems.addItem(state.inv,'ammo_9mm',1,.25);
assert.ok(state.inv.items.some(s=>s.id==='ammo_9mm' && s.freshness===.25));
assert.ok(state.inv.items.some(s=>s.id==='ammo_9mm' && s.freshness===1));

// Проверка вместимости: перенос не удаляет предмет, если взять его нельзя.
state.inv.items.push({id:'gas_can',qty:20,freshness:1});
document.getElementById('storage-contents').children[0].click();
assert.equal(state.storage[coord].reduce((n,s)=>n+s.qty,0),2);
assert.match(document.getElementById('storage-message').textContent,/Не хватает/);
state.inv.items.pop();
key('Escape');
assert.equal(document.getElementById('storage-overlay').hidden,true);
document.getElementById('btn-save').click(); document.getElementById('btn-load').click();
state=win.DD_STATE;
assert.equal(state.storage[coord].reduce((n,s)=>n+s.qty,0),2);
assert.equal(state.storage[coord][0].freshness,.42);
const reloaded=state.world.containers[coord]; approach(reloaded); key('KeyE');
assert.equal(state.storage[coord].reduce((n,s)=>n+s.qty,0),2,'повторный обыск не создаёт новый лут');
key('Escape');
const shelf=Object.values(state.world.containers).find(c=>c.kind==='shelf'); approach(shelf); key('KeyE');
assert.equal(document.getElementById('storage-title').textContent,'ПОЛКА');
assert.ok(state.storage[shelf.tx+','+shelf.ty].length);
const shelfKey=shelf.tx+','+shelf.ty;
state.storage[shelfKey]=[{id:'apple',qty:2,freshness:.7}];
key('Escape'); approach(shelf); key('KeyE');
const appleBefore=win.DD.Systems.countItem(state.inv,'apple');
document.getElementById('storage-take-all').click();
assert.equal(win.DD.Systems.countItem(state.inv,'apple'),appleBefore+2);
assert.equal(state.storage[shelfKey].length,0);
key('Escape'); document.getElementById('btn-save').click(); document.getElementById('btn-load').click();
state=win.DD_STATE; approach(state.world.containers[shelfKey]); key('KeyE');
assert.equal(state.storage[shelfKey].length,0,'пустая полка не заполняется снова после загрузки');
console.log('[dead-district storage] OK');
