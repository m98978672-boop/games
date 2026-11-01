// Офлайн-виды салона (быстро, без браузера). node tests/_cabview.mjs
import { JSDOM } from 'jsdom';
const dom = new JSDOM('<!doctype html><html><body></body></html>', { pretendToBeVisual: true });
global.window = dom.window; global.document = dom.window.document;
import { createRequire } from 'node:module';
const require2 = createRequire(import.meta.url);
const { createCanvas } = require2('/tmp/node_modules/@napi-rs/canvas');
dom.window.HTMLCanvasElement.prototype.getContext = function () {
  if (!this.__c) this.__c = createCanvas(this.width || 300, this.height || 150);
  return this.__c.getContext('2d');
};
Object.defineProperty(dom.window.HTMLCanvasElement.prototype, 'width', { get() { return this.__w || 300; }, set(v) { this.__w = v; if (this.__c) this.__c.width = v; } });
Object.defineProperty(dom.window.HTMLCanvasElement.prototype, 'height', { get() { return this.__h || 150; }, set(v) { this.__h = v; if (this.__c) this.__c.height = v; } });
const THREE = await import('three');
const soft = await import('./_soft.mjs');
const { TruckView, EYE } = await import('../src/world/truck3d.js');
const EYEW = { x: -EYE.x, y: EYE.y, z: EYE.z };
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9fb6c8);
const tv = new TruckView(scene, 0x2f7fa8);
tv.trailerGroup.visible = false;
tv.update({ speedKmh: 78, rpm: 1450, gear: 8, fuel: 320, temp: 84, clock: 560 }, 0.1, { steer: 0, rain: 0, company: 'Auriga', trailerType: 'curtain' });
tv.drawNav({ title: 'ДОСТАВКА', distance: '182 км', eta: 'ETA 11:40' });
tv.root.updateMatrixWorld(true);

const shot = (name, pos, look, fov = 62, w = 960, h = 540) => {
  const cam = new THREE.PerspectiveCamera(fov, w / h, 0.02, 5000);
  cam.position.set(...pos);
  cam.lookAt(new THREE.Vector3(...look));
  cam.updateMatrixWorld(true);
  soft.savePNG(`tests/_cv-${name}.png`, scene, cam, w, h);
};
shot('eye', [EYEW.x, EYEW.y, EYEW.z], [EYE.x, EYE.y - 0.8, 30]);
shot('eyefwd', [EYEW.x, EYEW.y, EYEW.z], [EYE.x, EYE.y - 0.05, 30]);
shot('dash', [EYEW.x, EYEW.y + 0.1, 1.9], [EYEW.x, 1.75, 3.2], 75);
shot('side', [3.2, 2.7, 1.4], [0.2, 1.9, 2.9], 55);
shot('top', [0, 4.6, 3.4], [0, 1.7, 2.6], 60);
console.log('ok');
process.exit(0);
