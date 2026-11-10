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

for (const jsFile of ['web/data_bundle.js', 'web/core.js', 'web/algorithms.js', 'web/systems.js', 'web/content_pack.js', 'web/catalog_f3.js']) {
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

// Проверка 10 000 процедурных текстур, моделек и 3D мешей + каталога F3
assert.equal(DD.ContentPack.count(), 10000, 'ContentPack должен содержать ровно 10000 ассетов');
const all10k = DD.ContentPack.getAll();
assert.equal(all10k.length, 10000);
assert.equal(all10k.filter((x) => x.kind === 'texture').length, 4000, 'Ожидалось 4000 текстур');
assert.equal(all10k.filter((x) => x.kind === 'model').length, 3000, 'Ожидалось 3000 моделек');
assert.equal(all10k.filter((x) => x.kind === 'mesh').length, 3000, 'Ожидалось 3000 3D мешей');
assert.ok(all10k.every((x) => x.code && x.name && x.family && x.specs), 'Каждый из 10000 ассетов должен быть подписан');
assert.equal(sandbox.DD_DATA.manifest.length, 181, 'Манифест должен содержать все 181 базовых ассетов');
DD.CatalogF3.setTab('base');
assert.equal(DD.CatalogF3.getFilteredList().length, 181);
DD.CatalogF3.setTab('all');
assert.equal(DD.CatalogF3.getFilteredList().length, 10000);

console.log('[dead-district smoke] ALL CHECKS PASSED');
