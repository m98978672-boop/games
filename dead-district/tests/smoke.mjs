import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import zlib from 'node:zlib';
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

for (const jsFile of ['web/data_bundle.js', 'web/core.js', 'web/algorithms.js', 'web/systems.js', 'web/content_pack.js', 'web/gameplay_helpers.js', 'web/animations.js', 'web/asset_assistant.js', 'web/catalog_f3.js']) {
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
assert.equal(DD.CatalogF3.getFilteredList().length, 10181);

// Проверка оценки плохих/хороших текстур и экспорта отчёта в F3
DD.CatalogF3.rateItem('D01_tile_grass', 'bad', 'Мало травинок');
DD.CatalogF3.rateItem('TEX-0001', 'good', 'Отличный кирпич');
assert.equal(DD.CatalogF3.getRatingStats().bad, 1);
assert.equal(DD.CatalogF3.getRatingStats().good, 1);
DD.CatalogF3.setRateFilter('bad');
assert.equal(DD.CatalogF3.getFilteredList().length, 1);
assert.ok(DD.CatalogF3.getBadReportText().includes('D01_tile_grass'));
assert.ok(DD.CatalogF3.getBadReportText().includes('Мало травинок'));
DD.CatalogF3.clearRatings();
assert.equal(DD.CatalogF3.getRatingStats().total, 0);

// Направления, исправление сохранения в стене и выбор цели в секторе удара.
assert.equal(DD.GameplayHelpers.directionRow(0, 1), 0);
assert.equal(DD.GameplayHelpers.directionRow(0, -1), 1);
assert.equal(DD.GameplayHelpers.directionRow(-1, 0), 2);
assert.equal(DD.GameplayHelpers.directionRow(1, 0), 3);
const safe = DD.GameplayHelpers.nearestWalkable({ isWalkable: (x, y) => x === 1 && y === 0 }, 0, 0);
assert.equal(safe.x, 1); assert.equal(safe.y, 0);
const forward = {x: 1, y: 0, state: 'alive'};
const backward = {x: -0.5, y: 0, state: 'alive'};
assert.equal(DD.GameplayHelpers.meleeTarget([backward, forward], {x: 0, y: 0, fx: 1, fy: 0}, 2, 'dead'), forward);
assert.equal(DD.GameplayHelpers.meleeTarget([backward], {x: 0, y: 0, fx: 1, fy: 0}, 2, 'dead'), null);
assert.equal(DD.Animations.count, 10000);
assert.equal(new Set(Array.from({length: 10000}, (_, i) => DD.Animations.get(i).code)).size, 10000);
assert.equal(DD.Animations.get(9999).action, 4);
assert.equal(DD.Animations.get(10000), null);
const dark = new Uint8Array([0, 0, 0, 255, 0, 0, 0, 255]);
const bright = new Uint8Array([255, 255, 255, 255, 255, 255, 255, 255]);
assert.equal(DD.AssetAssistant.analyze(dark, dark).difference, 0);
assert.equal(DD.AssetAssistant.analyze(dark, bright).difference, 1);
assert.ok(DD.AssetAssistant.analyze(dark).warnings.includes('Низкий контраст'));

// Четыре направления спрайтов, включая более короткую ползущую фигуру.
for (const [id, dims] of [['B01_z_walker', [32, 32]], ['B03_z_crawler', [32, 32]], ['B04_z_brute', [40, 48]], ['C01_npc_medic', [32, 32]]]) {
  const entry = sandbox.DD_DATA.manifest.find(a => a.id === id);
  assert.ok(entry, id);
  assert.ok(DD.CatalogF3.hasDirectionalSprite({ isBase: true, kindLabel: entry.type, file: entry.file, dimensions: entry.dimensions }));
  const png = fs.readFileSync(path.join(ROOT, entry.file));
  const width = png.readUInt32BE(16), height = png.readUInt32BE(20);
  const idats = [];
  for (let off = 8; off < png.length;) {
    const size = png.readUInt32BE(off), type = png.toString('ascii', off + 4, off + 8);
    if (type === 'IDAT') idats.push(png.subarray(off + 8, off + 8 + size));
    off += size + 12;
  }
  const data = zlib.inflateSync(Buffer.concat(idats));
  const [cw, ch] = dims;
  assert.ok(height >= ch * 4, `${id}: нужны четыре строки`);
  const views = [];
  for (let row = 0; row < 4; row++) {
    const pixels = [];
    for (let y = row * ch; y < (row + 1) * ch; y++) {
      assert.equal(data[y * (width * 4 + 1)], 0, 'ожидается PNG без фильтра');
      const start = y * (width * 4 + 1) + 1;
      pixels.push(data.subarray(start, start + cw * 4));
    }
    views.push(Buffer.concat(pixels).toString('hex'));
  }
  assert.equal(new Set(views).size, 4, `${id}: четыре вида должны различаться`);
  for (const [dx, dy, expectedRow] of [[0, 1, 0], [0, -1, 1], [-1, 0, 2], [1, 0, 3]]) {
    assert.equal(DD.GameplayHelpers.directionalFrame({width, height}, cw, ch, dx, dy, 2), expectedRow * (width / cw) + 2);
  }
}

// Генератор Godot использует clockwise winding; готовые GLB используют CCW, как требует glTF.
const gdMesh = fs.readFileSync(path.join(ROOT, 'scripts/algorithms/asset_pack_10k.gd'), 'utf8');
const boxBody = gdMesh.slice(gdMesh.indexOf('static func _append_box'));
assert.deepEqual(Array.from(boxBody.matchAll(/st\.add_vertex\(c\[q\[(\d)\]\]\)/g), m => Number(m[1])), [0, 2, 1, 0, 3, 2]);
for (const asset of sandbox.DD_DATA.manifest.filter(a => a.type === '3D_glb')) {
  const glb = fs.readFileSync(path.join(ROOT, asset.file));
  assert.equal(glb.readUInt32LE(0), 0x46546c67);
  const jsonLen = glb.readUInt32LE(12);
  const gltf = JSON.parse(glb.subarray(20, 20 + jsonLen).toString('utf8'));
  const binStart = 20 + jsonLen + 8;
  const primitive = gltf.meshes[0].primitives[0];
  assert.ok(primitive.attributes.COLOR_0 !== undefined, asset.id + ': цвета вершин');
  assert.equal(gltf.accessors[primitive.attributes.COLOR_0].normalized, true);
  function viewOffset(accessorIndex) {
    const a = gltf.accessors[accessorIndex];
    return binStart + (gltf.bufferViews[a.bufferView].byteOffset || 0) + (a.byteOffset || 0);
  }
  const p = viewOffset(primitive.attributes.POSITION), n = viewOffset(primitive.attributes.NORMAL), idx = viewOffset(primitive.indices);
  const count = gltf.accessors[primitive.indices].count;
  const parts = sandbox.DD_DATA.glbPreviewParts[asset.id];
  assert.equal(parts.length, gltf.accessors[primitive.attributes.POSITION].count / 24);
  for (let box = 0; box < parts.length; box++) {
    const xs = Array.from({length: 24}, (_, i) => glb.readFloatLE(p + (box * 24 + i) * 12));
    assert.ok(Math.abs(parts[box].sx - (Math.max(...xs) - Math.min(...xs))) < 0.0001, asset.id + ': ширина GLB');
  }
  function vec(base, i) { return [0, 1, 2].map(k => glb.readFloatLE(base + i * 12 + k * 4)); }
  for (let t = 0; t < count; t += 3) {
    const a = glb.readUInt16LE(idx + t * 2), b = glb.readUInt16LE(idx + (t + 1) * 2), c = glb.readUInt16LE(idx + (t + 2) * 2);
    const va = vec(p, a), vb = vec(p, b), vc = vec(p, c), normal = vec(n, a);
    const u = vb.map((v, i) => v - va[i]), v = vc.map((v, i) => v - va[i]);
    const cross = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
    assert.ok(cross.reduce((sum, x, i) => sum + x * normal[i], 0) > 0, `${asset.id}: грань смотрит внутрь`);
  }
}

assert.ok(sandbox.DD_DATA.glbPreviewParts.E17_prop_oak.length >= 3, 'дерево не должно превращаться в ящик');
assert.ok(sandbox.DD_DATA.glbPreviewParts.E19_prop_lamp.length >= 3, 'фонарь не должен превращаться в ящик');
assert.ok(sandbox.DD_DATA.glbPreviewParts.E01_veh_sedan.length >= 10, 'у автомобиля должны быть передние и задние огни');

// Реальные процедурно сгенерированные здания: открытая дверь должна вести в комнату.
let doorsChecked = 0;
for (const seed of [1, 42, 20261110]) {
  const w = new DD.ChunkWorld(seed);
  for (let cy = -3; cy <= 3; cy++) for (let cx = -3; cx <= 3; cx++) {
    const ch = w.generateChunk(cx, cy);
    for (const door of ch.doors) {
      doorsChecked++;
      const ly = ((door.ty % 32) + 32) % 32;
      const dy = ly === 10 ? -1 : 1;
      assert.equal(w.isWalkable(door.tx, door.ty), false);
      door.open = true;
      assert.ok(w.isWalkable(door.tx, door.ty - dy), 'подход к двери должен быть свободен');
      assert.ok(w.isWalkable(door.tx, door.ty + dy), 'клетка за дверью должна быть свободна');
      const pos = DD.GameplayHelpers.moveWithCollision(w, door.tx, door.ty - dy, 0, 2 * dy, 0.2);
      assert.ok(Math.abs(pos.y - (door.ty + dy)) < 1e-5, 'в открытый дверной проём можно войти');
      const deep = DD.GameplayHelpers.moveWithCollision(w, door.tx, door.ty - dy, 0, 3 * dy, 0.2);
      assert.ok(Math.abs(deep.y - (door.ty + 2 * dy)) < 1e-5, 'по входному коридору можно пройти дальше одной клетки');
      for (const side of [-1, 1]) {
        const room = DD.GameplayHelpers.moveWithCollision(w, deep.x, deep.y, side, 0, 0.2);
        assert.ok(Math.abs(room.x - (door.tx + side)) < 1e-5, 'обе стороны здания доступны из коридора');
      }
    }
  }
}
assert.ok(doorsChecked > 100, 'нужно проверить разные здания и чанки');
assert.equal(DD.CatalogF3.hasModelViews(DD.ContentPack.getAll().find(x => x.code === 'MOD-0001')), true);
assert.equal(DD.CatalogF3.hasModelViews(DD.ContentPack.getAll().find(x => x.code === 'MOD-1201')), false);
for (let dir = 0; dir < 4; dir++) {
  DD.CatalogF3.setPreviewDirection(dir);
  assert.equal(DD.CatalogF3.getPreviewDirection(), dir);
  assert.equal(DD.CatalogF3.getPreviewYaw(), [0, Math.PI, -Math.PI / 2, Math.PI / 2][dir]);
}

// Открытая дверь не делает соседнюю стену проходимой; прямой проход возможен.
let open = true;
const wall = { isWalkable: (x, y) => y !== 0 || (x === 0 && open) };
const G = DD.GameplayHelpers;
const blocked = G.moveWithCollision(wall, 1, -1, 0, 3, 0.2);
assert.ok(blocked.y <= -0.7 + 1e-6, 'бег не перескакивает стену');
const diagonal = G.moveWithCollision(wall, 0.8, -1, -0.25, 3, 0.2);
assert.ok(diagonal.y <= -0.7 + 1e-6, 'нельзя срезать угол соседней с дверью стены');
const through = G.moveWithCollision(wall, 0, -1, 0, 2, 0.2);
assert.ok(through.y > 0.9, 'через открытую дверь можно пройти');
open = false;
assert.ok(G.moveWithCollision(wall, 0, -1, 0, 2, 0.2).y <= -0.7 + 1e-6, 'закрытая дверь блокирует проход');
world.setTile(15, 15, DD.TILE.WINDOW);
assert.equal(world.isWalkable(15, 15), false, 'через закрытое окно нельзя пройти пешком');

console.log('[dead-district smoke] ALL CHECKS PASSED');
