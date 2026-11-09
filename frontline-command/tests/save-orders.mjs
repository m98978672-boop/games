// ALG-21/35: очереди приказов остаются в сохранении до доставки.
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
const opts = { cfg, seed: 31, aiVsAi: true };
const game = new Game(opts);
game.api.orders = []; game.api.journal = []; game.api.nextId = 1; game.api.seq = 0;
game.api.stats = { issued: 0, accepted: 0, refused: 0, cancelled: 0 };
const units = [0, 1].map((f) => [...game.units.values()].find((u) => u.faction === f && !u.isVehicle));
const orders = units.map((u, faction) => game.api.issue({
  source: faction === 0 ? 'player' : 'enemyAI', type: 'move', faction,
  unitIds: [u.id], target: { x: u.x + 50, y: u.y + 40 },
}));
const cancelled = game.api.issue({ source: 'player', type: 'hold', faction: 0, unitIds: [units[0].id] });
assert.equal(game.api.cancel(cancelled.id), true);
const nextId = game.api.nextId;

cfg.flags.alg_save = false;
assert.equal(Save.saveWar(game), true);
const legacySave = Save.loadWar();
assert.equal(legacySave.saveExt, undefined, 'флаг off не изменяет формат');
const before = new Game(opts);
Save.applyWar(before, legacySave);
assert.ok(orders.every((order) => !before.api.orders.some((o) => o.unitIds.includes(order.unitIds[0]))), 'прежний формат теряет сохранённые приказы');

cfg.flags.alg_save = true;
assert.equal(Save.saveWar(game), true);
const saved = Save.loadWar();
const after = new Game(opts);
assert.equal(Save.applyWar(after, saved), true);
assert.equal(after.api.orders.filter((o) => o.status === 'queued').length, 2, 'очередь обеих фракций сохранена');
assert.deepEqual(after.api.orders.map((o) => o.id), orders.map((o) => o.id));
assert.equal(after.api.nextId, nextId, 'следующий ID приказа сохранён');
assert.equal(after.api.stats.cancelled, 1, 'счётчики сохранены');
after.time = Math.max(...orders.map((o) => o.deliverAt)) + 0.1;
after.api.update();
for (let i = 0; i < orders.length; i++) {
  assert.equal(after.api.orders[i].status, 'accepted', 'доставка восстановленного приказа');
  assert.deepEqual(after.unitById(units[i].id).goal, orders[i].target, 'получатель получил свою цель');
}
const newOrder = after.api.issue({ source: 'system', type: 'hold', faction: 0, unitIds: [units[0].id] });
assert.equal(newOrder.id, nextId, 'новый приказ не повторил старые ID');

// Повреждённый список ID бойцов не должен перенаправлять приказы на новых владельцев.
const bad = structuredClone(saved);
bad.units[1].id = bad.units[0].id;
const fallback = new Game(opts);
Save.applyWar(fallback, bad);
assert.ok(orders.every((order) => !fallback.api.orders.some((o) => o.unitIds.includes(order.unitIds[0]))), 'при битых ID очередь не направляется неправильному бойцу');
const malformed = structuredClone(saved);
malformed.saveExt.api.orders.push({ ...malformed.saveExt.api.orders[0] });
malformed.saveExt.api.orders.push({ id: 100, status: 'queued' });
const safe = new Game(opts);
assert.equal(Save.applyWar(safe, malformed), true);
assert.equal(safe.api.orders.length, 2, 'повторные и повреждённые записи отбрасываются');
console.log('очередь приказов: до загрузки 2, legacy восстановил 0, alg_save восстановил 2; обе фракции, доставка, отмена и повреждённые ID проверены');
