// Проверка индикации без ожидания реальных таймеров и зависимостей браузера.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
const source = fs.readFileSync(fileURLToPath(new URL('../src/save.js', import.meta.url)), 'utf8');
const saved = new Map(), timers = new Map(); let next = 0, failWrite = false;
const bar = {textContent:'', classList:{classes:new Set(), toggle(c,v) { if(v) this.classes.add(c); else this.classes.delete(c); }, remove(c){this.classes.delete(c);} }};
const c = {console, document:{getElementById:()=>bar},
  localStorage:{getItem:k=>saved.has(k)?saved.get(k):null, setItem(k,v){if(failWrite) throw Error('quota'); saved.set(k,v);}},
  setTimeout:fn=>{timers.set(++next,fn); return next;}, clearTimeout:id=>timers.delete(id)};
c.window = c; c.WC = {game:{qualityPercent:()=>100, api:{shiftMode:'day'}, captureCheckpoint:()=>({version:2})}};
vm.createContext(c); vm.runInContext(source,c);
const game = {sim:{state:{stats:{score:0,delivered:0}}},crew:[]};
assert.equal(c.WC.save.load(),null);
assert(c.WC.save.save(game)); assert.equal(bar.textContent,'● сохранено'); assert(bar.classList.classes.has('flash'));
failWrite=true; assert.equal(c.WC.save.save(game),false);
assert.equal(bar.textContent,'● ошибка сохранения'); assert(!bar.classList.classes.has('flash'));
for (const fn of timers.values()) fn();
assert.equal(bar.textContent,'● ошибка сохранения', 'старый таймер не скрывает ошибку');
failWrite=false; assert(c.WC.save.autosave(game)); assert.equal(bar.textContent,'● сохранено');
for (const fn of timers.values()) fn(); assert.equal(bar.textContent,'● автосохранение');
c.WC.save.protect(); assert.equal(c.WC.save.save(game),false); assert.equal(bar.textContent,'● сохранение защищено');
console.log('✓ Ручное и автоматическое сохранение: индикация ошибок, защита и отмена старого таймера');
