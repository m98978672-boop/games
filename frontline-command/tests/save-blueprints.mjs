// ALG-21: чертежи не исчезают при загрузке, ресурсы не списываются повторно.
import assert from 'node:assert/strict';
import { loadConfig } from '../src/core/config.js';
import { Game } from '../src/sim/game.js';
import { Save } from '../src/core/save.js';
const storage = new Map();
globalThis.localStorage = {
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, value),
  removeItem: (key) => storage.delete(key),
};
const cfg = await loadConfig();
const options = { cfg, seed: 89, aiVsAi: true };
const game = new Game(options);
game.api.orders = []; game.api.nextId = 1; game.api.seq = 0;
game.time = 40;
function place(faction, priority) {
  const hq = game.world.hqOf(faction);
  for (let r = 150; r < 1000; r += 40) for (let i = 0; i < 20; i++) {
    const angle = 2 * Math.PI * i / 20;
    const x = hq.x + Math.cos(angle) * r, y = hq.y + Math.sin(angle) * r;
    const result = game.build.place('sandbags', x, y, faction, { priority, reason: `сектор ${faction}` });
    if (result.ok) return result.building;
  }
  throw new Error('не найдено место для чертежа');
}
const a = place(0, 'normal'), b = place(1, 'low'), cancelled = place(0, 'low');
assert.ok(game.build.cancel(cancelled).ok);
assert.ok(cancelled.dead);
a.progress = 0.375; a.hp = 5.75; a.dir = 'h';
const builderId = [...game.units.values()].find((u) => u.faction === 0 && u.role === 'engineer').id;
a.buildersIds = [builderId, game.nextUnitId + 100];
b.progress = 0.625; b.hp = 6.25; b.paused = true; b.pauseReason = 'NO_MATERIALS'; b.stall = 'NO_MATERIALS';
const squad = [...game.squads.values()].find((s) => s.faction === 0);
squad.objective = { x: a.x, y: a.y, type: 'build', blueprintId: a.id };
const change = game.api.issue({ type: 'set_build_priority', faction: 0, params: { blueprintId: a.id, priority: 'urgent' } });
const stop = game.api.issue({ type: 'cancel_build', faction: 1, params: { blueprintId: b.id } });
const stock = structuredClone(game.logistics.stock);

cfg.flags.alg_save = false;
assert.ok(Save.saveWar(game));
const legacySave = Save.loadWar();
const old = new Game(options);
assert.ok(Save.applyWar(old, legacySave));
assert.equal(old.build.queue(0).length + old.build.queue(1).length, 0, 'раньше оба активных чертежа исчезали');

cfg.flags.alg_save = true;
assert.ok(Save.saveWar(game));
const saved = Save.loadWar();
const loaded = new Game(options);
assert.ok(Save.applyWar(loaded, saved));
const a2 = loaded.build.queue(0)[0], b2 = loaded.build.queue(1)[0];
assert.ok(a2 && b2);
assert.equal(loaded.build.queue(0).length, 1, 'отменённый чертёж не воскрес');
assert.equal(loaded.build.queue(1).length, 1);
assert.notEqual(a2.id, a.id, 'старый и новый ID различаются в сценарии');
for (const [current, original] of [[a2,a], [b2,b]]) {
  for (const k of ['type','faction','x','y','progress','hp','priority','createdAt','reason','dir','paused','pauseReason','stall']) {
    assert.equal(current[k], original[k], `${k} сохранён`);
  }
  assert.ok(loaded.world.buildings.includes(current));
  assert.ok(loaded.world.buildingGrid.query(current.x, current.y, 1).includes(current));
}
assert.deepEqual(a2.buildersIds, [builderId], 'ID живых строителей сохранены, отсутствующие исключены');
assert.deepEqual(loaded.logistics.stock, stock, 'запасы не списаны повторно');
assert.equal(loaded.squads.get(squad.id).objective.blueprintId, a2.id, 'цель отряда ссылается на новый ID');
assert.equal(loaded.api.orders.find((o) => o.id === change.id).params.blueprintId, a2.id);
assert.equal(loaded.api.orders.find((o) => o.id === stop.id).params.blueprintId, b2.id);
loaded.time = Math.max(change.deliverAt, stop.deliverAt) + 0.1;
loaded.api.update();
assert.equal(a2.priority, 2, 'отложенный приказ изменил верный чертёж');
assert.ok(b2.dead, 'отложенная отмена попала в верный чертёж');
assert.equal(loaded.logistics.stock[1].materials, stock[1].materials + Math.round(cfg.buildings.sandbags.cost.materials * 0.6));
const engineer = [...loaded.units.values()].find((u) => u.faction === 0 && u.role === 'engineer');
const beforeProgress = a2.progress, beforeMaterials = loaded.logistics.stock[0].materials;
loaded.build.work(a2, 0.5, engineer);
assert.ok(a2.progress > beforeProgress, 'работа продолжается с сохранённого прогресса');
assert.ok(loaded.logistics.stock[0].materials < beforeMaterials);

// Повреждение ID не должно отправить отмену или изменение приоритета на другой объект.
const damaged = structuredClone(saved);
damaged.saveExt.blueprints[1].id = damaged.saveExt.blueprints[0].id;
const warn = console.warn; console.warn = () => {};
let fallback;
try { fallback = new Game(options); assert.ok(Save.applyWar(fallback, damaged)); }
finally { console.warn = warn; }
assert.equal(fallback.build.queue(0).length + fallback.build.queue(1).length, 0);
assert.equal(fallback.api.orders.length, 0, 'опасные приказы на неоднозначные ID отклонены');
assert.deepEqual(fallback.logistics.stock, stock);
const brokenUnits = structuredClone(saved); brokenUnits.units[1].id = brokenUnits.units[0].id;
const badUnits = new Game(options); Save.applyWar(badUnits, brokenUnits);
assert.equal(badUnits.build.queue(0)[0].buildersIds, undefined, 'при битых ID строители не переназначаются на чужих бойцов');
assert.equal(badUnits.api.orders.length, 0);
// Старое расширение не содержит информации о прогрессе и смерти чертежей:
// не выдумываем прогресс и не воскрешаем их из неполного legacy-списка.
const oldExt = structuredClone(saved); delete oldExt.saveExt.blueprints;
const oldReader = new Game(options); Save.applyWar(oldReader, oldExt);
assert.equal(oldReader.build.queue(0).length + oldReader.build.queue(1).length, 0);
assert.equal(oldReader.api.orders.length, 0);
console.log('чертежи: legacy 0/2, alg_save 2/2; прогресс, очередь, ресурсы, приказы и повреждённые ID проверены');
