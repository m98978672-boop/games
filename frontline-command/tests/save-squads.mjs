// ALG-21: часть состояния отрядов при продолжении войны.
import assert from 'node:assert/strict';
import { loadConfig } from '../src/core/config.js';
import { Game } from '../src/sim/game.js';
import { Save } from '../src/core/save.js';
const storage = new Map();
globalThis.localStorage = { getItem: (k) => storage.get(k) ?? null, setItem: (k, v) => storage.set(k, v), removeItem: (k) => storage.delete(k) };
const cfg = await loadConfig();
const options = { cfg, seed: 31, aiVsAi: true };
const source = new Game(options);
const squads = [0, 1].map((f) => [...source.squads.values()].find((s) => s.faction === f && s.memberIds.size > 1));
for (const s of squads) {
  s.commanderId = [...s.memberIds].at(-1);
  Object.assign(s, { initialCount: s.memberIds.size + 4, retreatTier: 'never', phaseIndex: 1,
    phase: cfg.strategy(s.strategyId).phases[0], thinkTimer: -0.125, facing: 1.234, lastOrderAt: 42.5,
    createdAt: 2, supplyTimer: 3.2, leapfrogTimer: 0.9, phaseEnteredAt: 25, leapfrog: 1,
    autoResupply: false, requestedSupply: true, contact: true, wantLeapfrog: true });
  s.stats.losses = 3; s.stats.kills = 6;
}
cfg.flags.alg_save = false;
assert.equal(Save.saveWar(source), true);
const legacySave = Save.loadWar();
assert.equal(legacySave.saveExt, undefined);
const legacy = new Game(options); Save.applyWar(legacy, legacySave);
assert.equal(legacy.squads.get(squads[0].id).retreatTier, '50');
cfg.flags.alg_save = true;
assert.equal(Save.saveWar(source), true);
const saved = Save.loadWar(), loaded = new Game(options);
assert.equal(Save.applyWar(loaded, saved), true);
for (const sourceSquad of squads) {
  const s = loaded.squads.get(sourceSquad.id);
  for (const k of ['commanderId','initialCount','retreatTier','phaseIndex','thinkTimer','facing','lastOrderAt','createdAt',
    'supplyTimer','leapfrogTimer','phaseEnteredAt','leapfrog','autoResupply','requestedSupply','contact','wantLeapfrog']) {
    assert.equal(s[k], sourceSquad[k], `${k}, faction ${s.faction}`);
  }
  assert.deepEqual(s.stats, sourceSquad.stats);
  assert.equal(s.phase, cfg.strategy(s.strategyId).phases[0], 'фаза привязана к текущему конфигу');
  assert.equal(s.commander.id, sourceSquad.commanderId);
  assert.equal(s.shouldRetreat(), false);
}
const old = structuredClone(saved); delete old.saveExt.squads;
assert.equal(Save.applyWar(new Game(options), old), true, 'старое расширение совместимо');
assert.equal(Save.applyWar(new Game(options), legacySave), true, 'старый сейв совместим');
const bad = structuredClone(saved);
const state = bad.saveExt.squads.find((s) => s.id === squads[0].id);
Object.assign(state, { commanderId: squads[1].commanderId, phaseIndex: 999, phaseId: 'missing', initialCount: -1,
  thinkTimer: null, retreatTier: 'invalid', stats: { losses: -100, kills: 'broken' } });
const safe = new Game(options); Save.applyWar(safe, bad);
const s = safe.squads.get(squads[0].id);
assert.notEqual(s.commanderId, squads[1].commanderId, 'командир другой фракции не переназначен');
assert.equal(s.phaseIndex, 0); assert.equal(s.retreatTier, '50');
assert.equal(s.stats.losses, 0); assert.ok(Number.isFinite(s.thinkTimer));
const badIds = structuredClone(saved); badIds.units[1].id = badIds.units[0].id;
const fallback = new Game(options); Save.applyWar(fallback, badIds);
assert.ok(fallback.squads.get(squads[0].id).memberIds.has(fallback.squads.get(squads[0].id).commanderId), 'при повреждённых ID командир остаётся членом отряда');
console.log('отряды: командир, потери, порог отступления, фаза и таймеры сохранены для обеих фракций; повреждённые данные и старый формат проверены');
