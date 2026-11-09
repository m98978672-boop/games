// Сохранённый счётчик не позволяет старому приказу попасть новому отряду.
import assert from 'node:assert/strict';
import { loadConfig } from '../src/core/config.js';
import { Game } from '../src/sim/game.js';
import { Save } from '../src/core/save.js';
const storage = new Map();
globalThis.localStorage = { getItem: (k) => storage.get(k) ?? null, setItem: (k, v) => storage.set(k, v), removeItem: (k) => storage.delete(k) };
const cfg = await loadConfig();
const options = { cfg, seed: 41, aiVsAi: true };
const source = new Game(options);
const doomed = [...source.squads.values()].sort((a,b) => b.id-a.id)[0];
const members = [...doomed.memberIds], oldId = doomed.id;
source.api.orders = [];
const order = source.api.issue({ source: 'system', type: 'hold', faction: doomed.faction, squadIds: [oldId] });
source.disbandSquad(doomed);
const next = source.nextSquadId;
cfg.flags.alg_save = false;
assert.equal(Save.saveWar(source), true);
const legacy = Save.loadWar(); assert.equal(legacy.saveExt, undefined);
cfg.flags.alg_save = true;
assert.equal(Save.saveWar(source), true);
const saved = Save.loadWar();
assert.equal(saved.saveExt.nextSquadId, next);
function scenario(data) {
  const loaded = new Game(options); assert.equal(Save.applyWar(loaded, data), true);
  const created = loaded.createSquadFromUnits(members);
  assert.equal(created.ok, true);
  assert.notEqual(created.squad.id, oldId, 'новый отряд не получает ID расформированного получателя');
  loaded.time = order.deliverAt + 1;
  loaded.api.update();
  const restored = loaded.api.orders.find((o) => o.id === order.id);
  assert.equal(restored.status, 'refused', 'старый приказ отклонён, не направлен новому отряду');
  assert.equal(restored.result, 'отряд расформирован');
  return loaded;
}
const loaded = scenario(saved);
assert.equal(loaded.nextSquadId, next + 1);
const old = structuredClone(saved); delete old.saveExt.nextSquadId;
scenario(old); // старое расширение: учесть ID в ожидающих приказах
const invalid = structuredClone(saved); invalid.saveExt.nextSquadId = -1;
scenario(invalid);
assert.equal(Save.applyWar(new Game(options), legacy), true, 'старый сейв совместим');
console.log('сохранение: следующий ID отряда и старые приказы не перенаправляются новому отряду; старые и повреждённые расширения');
