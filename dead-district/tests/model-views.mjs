import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// A small raster canvas, enough to exercise the actual 2D model drawing code.
class Canvas {
  constructor() { this._width = 32; this._height = 32; this.data = new Uint8ClampedArray(32 * 32 * 4); this.ctx = new Context(this); }
  get width() { return this._width; } set width(v) { this._width = v; this.data = new Uint8ClampedArray(this._width * this._height * 4); }
  get height() { return this._height; } set height(v) { this._height = v; this.data = new Uint8ClampedArray(this._width * this._height * 4); }
  getContext() { return this.ctx; }
}
class Context {
  constructor(canvas) { this.canvas = canvas; this.fillStyle = '#000000'; }
  clearRect(x, y, w, h) { this.rect(x, y, w, h, [0, 0, 0, 0]); }
  fillRect(x, y, w, h) {
    const hex = this.fillStyle.replace('#', '');
    const color = hex.length === 6 ? [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16)) : [0, 0, 0];
    this.rect(x, y, w, h, [...color, 255]);
  }
  rect(x, y, w, h, rgba) {
    for (let py = Math.max(0, Math.floor(y)); py < Math.min(this.canvas.height, Math.ceil(y + h)); py++)
      for (let px = Math.max(0, Math.floor(x)); px < Math.min(this.canvas.width, Math.ceil(x + w)); px++)
        this.canvas.data.set(rgba, (py * this.canvas.width + px) * 4);
  }
  getImageData() { return { data: new Uint8ClampedArray(this.canvas.data), width: this.canvas.width, height: this.canvas.height }; }
  putImageData(image) { this.canvas.data.set(image.data); }
  drawImage(src, sx, sy, sw, sh, dx, dy, dw, dh) {
    for (let y = 0; y < dh; y++) for (let x = 0; x < dw; x++) {
      const from = (Math.floor(sy + y * sh / dh) * src.width + Math.floor(sx + x * sw / dw)) * 4;
      const to = ((dy + y) * this.canvas.width + dx + x) * 4;
      this.canvas.data.set(src.data.slice(from, from + 4), to);
    }
  }
}
const sandbox = { window: null, document: { createElement: () => new Canvas() }, console, Math, Number, String, Boolean, Array, Object, JSON };
sandbox.window = sandbox;
vm.createContext(sandbox);
for (const f of ['web/data_bundle.js', 'web/content_pack.js']) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), sandbox, { filename: f });
const pack = sandbox.DD.ContentPack;
const items = pack.getAll();
function render(item, dir) { const canvas = new Canvas(); pack.renderItemToCanvas(canvas, item, 0, dir); return Buffer.from(canvas.data).toString('hex'); }
for (const family of [0, 1, 2, 3, 4]) {
  const actor = items.find(x => x.kind === 'model' && x.famIdx === family);
  const views = Array.from({ length: 4 }, (_, direction) => render(actor, direction));
  assert.equal(new Set(views).size, 4, `${actor.code}: четыре вида должны отличаться`);
  assert.ok(views.every(v => v.includes('ff')), `${actor.code}: непустой рисунок`);
}
const actor = items.find(x => x.kind === 'model' && x.famIdx === 0);
const icon = items.find(x => x.kind === 'model' && x.famIdx === 6);
const original = render(actor, 0);
render(icon, 0);
assert.equal(render(actor, 0), original, 'соседняя карточка не должна оставлять пиксели на модели');
console.log('[dead-district model views] OK');

// Геометрия поворачивается, а не подменяется одинаковым изображением.
function trace3D(fn) {
  const paths = [];
  const ctx = { clearRect() {}, beginPath() {}, closePath() {}, fill() {}, stroke() {},
    moveTo(x, y) { paths.push([+x.toFixed(3), +y.toFixed(3)]); },
    lineTo(x, y) { paths.push([+x.toFixed(3), +y.toFixed(3)]); } };
  assert.notEqual(fn(ctx), false);
  return JSON.stringify(paths);
}
const angles = [0, Math.PI / 2, Math.PI, -Math.PI / 2];
const mesh = items.find(x => x.kind === 'mesh' && x.familyId === 'sedan');
const meshViews = angles.map(angle => trace3D(ctx => pack.renderMesh3D(ctx, mesh, 160, angle)));
assert.equal(new Set(meshViews).size, 4, 'процедурный автомобиль: четыре ракурса');
const baseViews = angles.map(angle => trace3D(ctx => pack.renderBaseGlbPreview(ctx, 'E01_veh_sedan', 160, angle)));
assert.equal(new Set(baseViews).size, 4, 'GLB автомобиля: четыре ракурса');
assert.notEqual(trace3D(ctx => pack.renderBaseGlbPreview(ctx, 'E17_prop_oak', 160, 0)), trace3D(ctx => pack.renderBaseGlbPreview(ctx, 'E18_prop_pine', 160, 0)), 'разные модели деревьев не подменяются одинаковым ящиком');
