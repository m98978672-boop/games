import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const calls = [];
function context(label) {
  return new Proxy({ drawImage(...args) { calls.push({ label, args }); }, fillRect(...args) { calls.push({ label, fillRect: args }); } }, {
    get(target, prop) { return prop in target ? target[prop] : () => {}; },
    set(target, prop, value) { target[prop] = value; return true; }
  });
}
const sandbox = { window: null, console, Math, Number, String, Boolean, Array, Object, JSON, Int32Array,
  document: { createElement() { const ctx = context('stamp'); return { width: 0, height: 0, getContext: () => ctx }; } } };
sandbox.window = sandbox; vm.createContext(sandbox);
for (const file of ['web/algorithms.js', 'web/isometric.js']) vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), sandbox, { filename: file });
const { DD } = sandbox, T = DD.TILE, ctx = context('frame');
let tile = T.GRASS;
const world = { getTile: () => tile, doors: {}, windows: {}, containers: {} };
const state = { player: { x: 0, y: 0, inVehicleId: 'hidden' }, visible: { '0,0': true }, explored: {}, world,
  farms: [], campfires: [], vehicles: [], zombies: [], npcs: [], tw: { darkness: 0, rainIntensity: 0 },
  health: { bloodMl: 5000, maxBloodMl: 5000 }, elapsed: 0 };
const image = (w, h) => ({ complete: true, naturalWidth: w, naturalHeight: h });
const grass = image(128,32), wood = image(64,64), water = image(96,32);
const sprites = { tile_grass: grass, tile_wall_wood: wood, tile_water: water };
function render(images = sprites) { DD.Isometric.render(ctx, state, images, () => false, { speed: 1, bob: 1 }); }
function sourceCalls(img) { return calls.filter(c => c.args && c.args[0] === img); }
render();
assert.equal(sourceCalls(grass).length, 1, 'текстура травы проецируется из атласа');
render();
assert.equal(sourceCalls(grass).length, 1, 'готовый отпечаток используется повторно');
const replacement = image(128,32); sprites.tile_grass = replacement; render();
assert.equal(sourceCalls(replacement).length, 1, 'новый загруженный атлас инвалидирует кэш');
tile = T.WATER; render(); state.elapsed = .5; render();
assert.equal(sourceCalls(water).length, 2, 'вода использует разные кадры атласа');
tile = T.WALL_WOOD; render();
assert.equal(sourceCalls(wood).length, 3, 'две грани и верх стены получают материал');
render();
assert.equal(sourceCalls(wood).length, 3, 'грани стены тоже кэшируются');
state.visible = {}; state.explored = { '0,0': true }; calls.length = 0; render();
assert.ok(!calls.some(c => c.fillRect && c.fillRect[2] === 32 && c.fillRect[3] === 34), 'туман стены не накрывает соседние клетки');
assert.doesNotThrow(() => render({}), 'до загрузки изображений используется запасной цвет');
console.log('[dead-district isometric textures] OK');
