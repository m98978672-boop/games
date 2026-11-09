// ALG-21: позиция, состояние и таймер кровотечения не должны теряться при загрузке.
import assert from 'node:assert/strict';
import { loadConfig } from '../src/core/config.js';
import { Game } from '../src/sim/game.js';
import { Save } from '../src/core/save.js';
import { updateTimers } from '../src/sim/units.js';

const storage = new Map();
globalThis.localStorage = {
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, value),
  removeItem: (key) => storage.delete(key),
};
const cfg = await loadConfig();
const opts = { cfg, seed: 19, mode: 'soldier' };
const source = new Game(opts);
const wounded = [...source.units.values()].find((u) => u !== source.playerUnit && !u.isVehicle);
Object.assign(wounded, {
  x: 511.875, y: 607.625, hp: 1, morale: 70.375, facing: 1.23456,
  downed: true, bleed: 12.75, cool: 0.75, reloading: true, reloadT: 1.25, suppression: 0.45,
});
source.unitGrid.update(wounded);
source.time = 123.456;

// Замер прежнего пути: квантование позиции/времени и потеря таймеров.
cfg.flags.alg_save = false;
assert.equal(Save.saveWar(source), true);
const legacySave = Save.loadWar();
const legacy = new Game(opts);
assert.equal(Save.applyWar(legacy, legacySave), true);
const old = [...legacy.units.values()].find((u) => u.downed);
assert.ok(old);
const oldPositionError = Math.hypot(old.x - wounded.x, old.y - wounded.y);
assert.ok(oldPositionError > 0 && old.bleed === 0 && !old.reloading);
updateTimers(legacy, old, 0.05);
assert.equal(old.alive, false, 'в старом формате раненый погибает на первом тике');

cfg.flags.alg_save = true;
assert.equal(Save.saveWar(source), true);
const saved = Save.loadWar();
const loaded = new Game(opts);
assert.equal(Save.applyWar(loaded, saved), true);
const actual = loaded.unitById(wounded.id);
for (const key of ['x', 'y', 'hp', 'morale', 'facing', 'bleed', 'cool', 'reloadT', 'suppression', 'reloading', 'downed']) {
  assert.equal(actual[key], wounded[key], `${key} точно восстановлен`);
}
assert.equal(loaded.time, source.time, 'точное игровое время');
assert.ok(loaded.unitGrid.query(actual.x, actual.y, 1).includes(actual), 'пространственный индекс обновлён');
updateTimers(loaded, actual, 0.05);
assert.ok(actual.alive && actual.downed && actual.bleed > 12.6, 'раненый не умирает сразу после загрузки');
assert.ok(actual.reloading && actual.reloadT > 1.1, 'перезарядка продолжается');

// Новый читатель принимает старый формат и старое расширение без новых полей.
const oldExt = structuredClone(saved);
delete oldExt.saveExt.exactTime;
delete oldExt.saveExt.units;
assert.equal(Save.applyWar(new Game(opts), oldExt), true);
assert.equal(Save.applyWar(new Game(opts), legacySave), true);
console.log(`состояние: ошибка позиции до ${oldPositionError.toFixed(3)} px, после 0; таймеры ранения и перезарядки сохраняются; размер +${Buffer.byteLength(JSON.stringify(saved)) - Buffer.byteLength(JSON.stringify(legacySave))} байт`);
