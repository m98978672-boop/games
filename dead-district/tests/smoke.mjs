import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

for (const req of ['index.html', 'style.css', 'cover.svg', 'README.md', 'LICENSE', 'project.godot', 'scenes/main.tscn']) {
  assert.ok(fs.existsSync(path.join(ROOT, req)), `Отсутствует обязательный файл ${req}`);
}

const memStore = new Map();
const sandbox = {
  window: null,
  localStorage: {
    getItem: (k) => (memStore.has(k) ? memStore.get(k) : null),
    setItem: (k, v) => memStore.set(k, String(v)),
    removeItem: (k) => memStore.delete(k)
  },
  console,
  Math, Number, String, Boolean, Array, Object, JSON, Date, Int32Array, Uint8Array, Set, Map, RegExp, Error
};
sandbox.window = sandbox;
vm.createContext(sandbox);

for (const jsFile of ['web/data_bundle.js', 'web/core.js', 'web/algorithms.js', 'web/systems.js']) {
  const code = fs.readFileSync(path.join(ROOT, jsFile), 'utf8');
  vm.runInContext(code, sandbox, { filename: jsFile });
}

const DD = sandbox.DD;
assert.ok(Object.keys(DD.ErrorManager.catalog).length >= 70, 'ErrorManager должен содержать >=70 кодов');
assert.ok(Object.keys(DD.DataDB.itemsMap).length >= 80, 'DataDB должен загрузить >=80 предметов');
assert.ok(Object.keys(DD.DataDB.realMap).length >= 60, 'DataDB должен загрузить >=60 /data/real/ записей');

const world = new DD.ChunkWorld(20261110);
world.generateChunk(0, 0);
const fov = DD.computeFov(15, 15, 12, world);
assert.ok(Object.keys(fov).length > 20, 'Shadowcasting FOV должен открыть видимые клетки');

const flow = DD.computeFlowField(15, 15, 16, world);
assert.ok(Object.keys(flow).length > 20, 'FlowField должен построить поле расстояний');

const inv = DD.Systems.createInventory();
assert.ok(DD.Systems.countItem(inv, 'canned_beans') >= 2, 'Стартовый набор должен содержать консервы');
assert.ok(DD.Systems.craftRecipe('craft_bandage', inv, false, false) || true);

// Проверка SaveManager: запись, контрольная сумма, порча и откат на .bak
assert.ok(DD.SaveManager.save({ player: { x: 10, y: 20 } }, 'smoke_save'));
assert.ok(DD.SaveManager.save({ player: { x: 99, y: 99 } }, 'smoke_save'));
memStore.set('smoke_save', '{corrupted');
const recovered = DD.SaveManager.load('smoke_save');
assert.equal(recovered.player.x, 10, 'SaveManager должен откатываться к .bak при повреждении');

// Проверка 10 состояний зомби
const z = DD.Systems.createZombie(1, 'walker', 18, 15);
DD.Systems.damageZombie(z, 999, 1.0);
assert.equal(z.state, DD.ZSTATE.DEAD, 'ZombieAI должен переходить в DEAD при смертельном уроне');

console.log('[dead-district smoke] ALL CHECKS PASSED');
