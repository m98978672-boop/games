// Превью машины и салона программным растеризатором: tests/_s-*.png
import { JSDOM } from 'jsdom';
const dom = new JSDOM('<!doctype html><html><body></body></html>', { pretendToBeVisual: true });
global.window = dom.window; global.document = dom.window.document;
import { createRequire } from 'node:module';
const require2 = createRequire(import.meta.url);
const { createCanvas } = require2('/tmp/node_modules/@napi-rs/canvas');
// Настоящий канвас: приборка и текстуры рисуются как в браузере.
dom.window.HTMLCanvasElement.prototype.getContext = function () {
  if (!this.__c) this.__c = createCanvas(this.width || 300, this.height || 150);
  return this.__c.getContext('2d');
};
Object.defineProperty(dom.window.HTMLCanvasElement.prototype, 'width', {
  get() { return this.__w || 300; },
  set(v) { this.__w = v; if (this.__c) this.__c.width = v; },
});
Object.defineProperty(dom.window.HTMLCanvasElement.prototype, 'height', {
  get() { return this.__h || 150; },
  set(v) { this.__h = v; if (this.__c) this.__c.height = v; },
});
const THREE = await import('three');
const { savePNG } = await import('./_soft.mjs');
const { TruckView } = await import('../src/world/truck3d.js');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9fb6c8);
const tv = new TruckView(scene, 0x2f7fa8);
tv.trailerGroup.visible = process.env.NOTRAILER ? false : true;

// земля + дорога
const ground = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), new THREE.MeshStandardMaterial({ color: 0x7d9264, roughness: 1 }));
ground.rotation.x = -Math.PI / 2;
scene.add(ground);
const road = new THREE.Mesh(new THREE.PlaneGeometry(9.2, 600), new THREE.MeshStandardMaterial({ color: 0x4e5254, roughness: 0.95 }));
road.rotation.x = -Math.PI / 2;
road.position.y = 0.01;
scene.add(road);
for (const x of [-4.6, 4.6]) {
  const line = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 600), new THREE.MeshStandardMaterial({ color: 0xe8e6d8 }));
  line.rotation.x = -Math.PI / 2;
  line.position.set(x, 0.02, 0);
  scene.add(line);
}
for (let i = -30; i < 30; i++) {
  const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 4), new THREE.MeshStandardMaterial({ color: 0xe8e6d8 }));
  dash.rotation.x = -Math.PI / 2;
  dash.position.set(0, 0.02, i * 9);
  scene.add(dash);
}
tv.update({ speedKmh: 78, rpm: 1450, gear: 8, fuel: 320, temp: 84, clock: 9 * 60 + 20, odometer: 128450, cruise: 80 }, 0.1, { steer: 0.2, trailerType: 'curtain', company: 'NordTrans', rain: 0 });
tv.drawNav({ title: 'ДОСТАВКА', distance: '182 км', eta: 'ETA 11:40' });
tv.root.updateMatrixWorld(true);

const shots = [
  ['eye', [-0.55, 2.5, 1.35], [-0.4, 2.15, 40], 62],
  ['eye-down', [-0.55, 2.5, 1.35], [-0.35, 1.55, 3.2], 70],
  ['eye-left', [-0.55, 2.5, 1.35], [-7, 2.05, 0.1], 72],
  ['eye-right', [-0.55, 2.5, 1.35], [7, 2.05, 0.1], 72],
  ['side', [14, 2.4, -4], [0, 2.0, -4], 34],
  ['front34', [-7.5, 3.4, 9], [0.2, 1.7, 1.6], 40],
  ['rear34', [7.5, 4.2, -20], [0, 2.0, -8], 38],
  ['top', [0, 30, -5], [0, 0, -5.001], 45],
];
if (process.env.DBG) {
  const soft = await import('./_soft.mjs');
  const cam = new THREE.PerspectiveCamera(70, 16/9, 0.05, 2000);
  cam.position.set(0.55, 2.5, 1.35); cam.lookAt(0.35, 1.55, 3.2); cam.updateMatrixWorld(true);
  globalThis.__MESHDBG = true;
  const tris = soft.collect(scene, cam);
  globalThis.__MESHDBG = false;
  console.log('pushes', globalThis.__STATS);
  const withTex = tris.filter(t => t.tex);
  console.log('tris', tris.length, 'textured', withTex.length);
  if (withTex[0]) console.log('tex dims', withTex[0].tex.w, withTex[0].tex.h, 'uv0', withTex[0].uv[0], 'pos', withTex[0].clip.map(c=>[c.x.toFixed(1),c.y.toFixed(1),c.w.toFixed(2)]));
  const dashMesh = tv.dashScreen;
  const im = tv.dashScreen.material.map.image;
  console.log('image ctor', im.constructor && im.constructor.name, '__c' in im, typeof im.getContext);
  console.log('dash canvas __c?', !!dashMesh.material.map.image.__c, dashMesh.material.map.image.width, dashMesh.material.map.flipY, dashMesh.material.map.image.__c && dashMesh.material.map.image.__c.width);
}
for (const [name, pos, look, fov] of shots) {
  const cam = new THREE.PerspectiveCamera(fov, 16 / 9, 0.05, 2000);
  cam.position.set(...pos);
  cam.lookAt(new THREE.Vector3(...look));
  cam.updateMatrixWorld(true);
  savePNG(`tests/_s-${name}.png`, scene, cam, 960, 540);
  console.log('ok', name);
}
process.exit(0);
