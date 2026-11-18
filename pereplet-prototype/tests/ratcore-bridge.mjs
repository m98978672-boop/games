// Проверка моста «Переплёт» ↔ RatCore (BRIDGE.md §2.4).
// Запуск: node pereplet-prototype/tests/ratcore-bridge.mjs
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';
import * as pereplet from '../core.mjs';
import { planRules } from '../scheduler.mjs';
import { snapshotForPereplet, stepPerepletOnRatCore, applyPerepletChanges, stableNumericId } from '../ratcore-bridge.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
let failed = 0;
const ok = (cond, msg) => { if (cond) console.log('  ✓ ' + msg); else { console.error('  ✗ ' + msg); failed++; } };

console.log('«Переплёт» ↔ RatCore — мост');

const sandbox = {
  console, performance, TextEncoder, TextDecoder,
  Uint8Array, Float32Array, Int32Array, Uint16Array, Uint32Array, Int16Array, Int8Array,
  Uint8ClampedArray, Float64Array, ArrayBuffer, DataView, navigator: { hardwareConcurrency: 4 },
};
sandbox.window = sandbox; sandbox.globalThis = sandbox;
vm.createContext(sandbox);
vm.runInContext(readFileSync(join(ROOT, 'ratcore/ratcore.bundle.js'), 'utf8'), sandbox);
const RC = sandbox.RatCore;

const engine = RC.createEngine({ preset: 'balanced', packs: [], seed: 7 });
const mesh = engine.tools.build.fromRecipe({
  modelId: 'crate',
  ops: [{ tool: 'build.primitive', args: { shape: 'box', w: 1, h: 1, d: 1, color: '#e8b45a' } }],
});
engine.tools.build.placeEntity({ id: 'crate_a', mesh: mesh.data, x: 0, y: 0, h: 1 });
engine.tools.build.placeEntity({ id: 'crate_b', mesh: mesh.data, x: 5, y: 5, h: 1 });

const exported = engine.tools.save.exportJson();
const snapshot = snapshotForPereplet(exported);
ok(snapshot.entities.length === 2, 'снимок «Переплёта» собран из мира RatCore (2 сущности)');
ok(typeof snapshot.entities[0].z === 'number', 'ось Y движка переведена в ось z «Переплёта»');

// Правило: износ — каждая сущность теряет 2 hp за шаг
const wearRules = planRules([{
  id: 'wear',
  run: (snap, seconds) => snap.entities.map((e) => ({ id: e.id, field: 'hp', value: Math.max(0, e.hp - 200 * seconds) })),
}]);

const result = await stepPerepletOnRatCore(pereplet, exported, wearRules, 1 / 30);
ok(result.changes.length === 2, 'правила «Переплёта» предложили изменения для обеих сущностей');
ok(result.proposed.every((e) => e.hp < 100), 'износ посчитан на снимке движка');

// Мир движка НЕ изменён самим расчётом
const untouched = engine.tools.save.exportJson().data.entities.find((e) => e.id === 'crate_a');
ok(untouched.x === 0 && untouched.y === 0, 'расчёт «Переплёта» не изменил мир молча');

// Конфликт записи одного поля отклоняется ядром «Переплёта»
let conflicted = false;
try {
  pereplet.step(pereplet.createWorld([{ id: 1, x: 0, z: 0, hp: 10 }]), [
    () => [{ id: 1, field: 'x', value: 3 }],
    () => [{ id: 1, field: 'x', value: 8 }],
  ], 1 / 30);
} catch (err) {
  conflicted = /Конфликт/.test(String(err && err.message));
}
ok(conflicted, 'конфликт записи одного поля отклонён (как и требует BRIDGE.md §2.4)');

// Применение изменений — ТОЛЬКО через официальные tools движка
const moveRules = planRules([{
  id: 'patrol',
  run: (snap) => snap.entities.map((e) => ({ id: e.id, field: 'x', value: e.x + 2 })),
}]);
const moved = await stepPerepletOnRatCore(pereplet, engine.tools.save.exportJson(), moveRules, 1 / 30);
// В экспорте движка ID сущности — строка, поэтому сопоставляем снимок
// «Переплёта» с миром по тому же стабильному хешу строкового ID.
const idMap = {};
for (const entity of engine.tools.save.exportJson().data.entities) {
  idMap[stableNumericId(entity.id)] = entity.id;
}
const applied = applyPerepletChanges(engine, moved.changes, idMap);
ok(applied.applied.length === 2, 'изменения применены через tools.move.entity (2 сущности)');
ok(applied.rejected.length === 0, 'ни одно изменение не отклонено');
const after = engine.tools.save.exportJson().data.entities.find((e) => e.id === 'crate_a');
ok(after.x === 2, 'мир движка действительно сдвинулся на x=2 после применения');

// Неизвестная сущность — понятный отказ, без исключения
const rejectedUnknown = applyPerepletChanges(engine, [{ id: 999, field: 'x', value: 1 }], idMap);
ok(rejectedUnknown.rejected.length === 1 && rejectedUnknown.changedWorld === false,
  'изменение для неизвестной сущности отклонено без изменения мира');

if (failed) { console.error(`\n✗ Провалено: ${failed}`); process.exit(1); }
console.log('\n✓ Мост «Переплёт» ↔ RatCore работает: снимок из движка, правила, применение через tools.');
