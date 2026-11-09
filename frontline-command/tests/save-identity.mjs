// ALG-21: ID существующих бойцов, игрок и RNG; не полная детерминированность сейва.
import assert from 'node:assert/strict';
import { loadConfig } from '../src/core/config.js';
import { Game } from '../src/sim/game.js';
import { Save } from '../src/core/save.js';
import { RNG } from '../src/core/rng.js';

const store = new Map();
globalThis.localStorage = {
  getItem: (k) => store.get(k) ?? null,
  setItem: (k, v) => store.set(k, v),
  removeItem: (k) => store.delete(k),
};
const cfg = await loadConfig();
const opts = { cfg, seed: 7, difficulty: 'regular', mode: 'soldier' };
const original = new Game(opts);
// После гибели уцелевшие ID разрежены; следующий ID не должен быть переиспользован.
for (const u of [...original.units.values()].filter((v) => v !== original.playerUnit).slice(0, 3)) {
  original.unitGrid.remove(u);
  original.units.delete(u.id);
}
const expectedIds = [...original.units.keys()];
const playerId = original.playerUnit.id;
const expectedNext = original.nextUnitId;
const expectedRng = original.rng.s;
const oldNow = Date.now;
Date.now = () => 123456789;
try {
  delete cfg.flags.alg_save;
  assert.equal(Save.saveWar(original), true);
  const baseline = Save.loadWar();
  cfg.flags.alg_save = false;
  assert.equal(Save.saveWar(original), true);
  assert.deepEqual(Save.loadWar(), baseline, 'alg_save=false побитово сохраняет прежнюю структуру');
  const before = new Game(opts);
  Save.applyWar(before, baseline);
  const missingBefore = expectedIds.filter((id) => !before.units.has(id)).length;
  assert.ok(missingBefore > 0, 'старое восстановление воспроизводимо меняет разреженные ID');

  cfg.flags.alg_save = true;
  assert.equal(Save.saveWar(original), true);
  const data = Save.loadWar();
  assert.equal(data.saveExt.rngState, expectedRng);
  const after = new Game(opts);
  assert.equal(Save.applyWar(after, data), true);
  assert.deepEqual([...after.units.keys()], expectedIds, 'сохранены исходные идентификаторы');
  assert.equal(after.nextUnitId, expectedNext, 'счётчик ID сохраняется');
  assert.equal(after.playerUnit.id, playerId, 'ссылка на игрока восстановлена');
  assert.equal(after.playerUnit.playerControlled, true);
  assert.equal(after.playerUnit.player, true);
  assert.equal(after.rng.s, expectedRng, 'состояние RNG восстановлено после создания юнитов');
  const oracle = new RNG(1); oracle.s = expectedRng;
  assert.equal(after.rng.next(), oracle.next(), 'следующее случайное число совпадает');
  const next = after.spawnUnit(0, 'infantry', 100, 100);
  assert.equal(next.id, expectedNext, 'новый ID не повторяет старый');
  for (const unit of after.units.values()) {
    if (unit.squadId != null && after.squads.has(unit.squadId)) {
      assert.ok(after.squads.get(unit.squadId).memberIds.has(unit.id), 'ссылка отряда указывает на реальный ID');
    }
  }
  const old = new Game(opts);
  assert.equal(Save.applyWar(old, baseline), true, 'старый формат загружается без расширения');
  assert.deepEqual([...old.units.keys()], expectedIds, 'ID старого формата также восстанавливаются');
  // Повреждённые или повторные ID не должны перезаписать другое значение Map.
  const broken = structuredClone(data);
  broken.units[1].id = broken.units[0].id;
  const fallback = new Game(opts);
  assert.equal(Save.applyWar(fallback, broken), true);
  assert.equal(fallback.units.size, broken.units.length, 'невалидные ID используют legacy без потери записей');
  console.log(`сохранение: потерянных исходных ID до ${missingBefore}, после 0/${expectedIds.length}; игрок и следующий RNG восстановлены; старый формат и флаг off проверены`);
} finally { Date.now = oldNow; }
