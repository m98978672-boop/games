// Превью текстур дороги/травы: масштаб UV в метрах, оценка тайлинга.
import { JSDOM } from 'jsdom';
const dom = new JSDOM('<!doctype html><html><body></body></html>', { pretendToBeVisual: true });
global.window = dom.window; global.document = dom.window.document;
import { createRequire } from 'node:module';
const { createCanvas } = createRequire(import.meta.url)('/tmp/node_modules/@napi-rs/canvas');
dom.window.HTMLCanvasElement.prototype.getContext = function () { if (!this.__c) this.__c = createCanvas(this.width||300,this.height||150); return this.__c.getContext('2d'); };
Object.defineProperty(dom.window.HTMLCanvasElement.prototype, 'width', { get(){return this.__w||300;}, set(v){ this.__w=v; if(this.__c) this.__c.width=v; } });
Object.defineProperty(dom.window.HTMLCanvasElement.prototype, 'height', { get(){return this.__h||150;}, set(v){ this.__h=v; if(this.__c) this.__c.height=v; } });
const THREE = await import('three');
const soft = await import('./_soft.mjs');
const { materials } = await import('../src/world/materials.js');
const m = materials();
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9fb6c8);

// полоса асфальта 8 м с UV в метрах и обочина/трава
function strip(x0, x1, mat, tile, y) {
  const geo = new THREE.PlaneGeometry(x1 - x0, 400, 1, 60);
  const uv = geo.attributes.uv;
  const pos = geo.attributes.position;
  for (let i = 0; i < uv.count; i++) {
    const px = pos.getX(i);
    const py = pos.getY(i);
    uv.setXY(i, px / tile, py / tile);
  }
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set((x0 + x1) / 2, y, 0);
  scene.add(mesh);
}
strip(-3.7, 3.7, m.asphalt, 7, 0.01);
strip(-20, -3.7, m.grass, 9, 0);
strip(3.7, 20, m.grass, 9, 0);
const cam = new THREE.PerspectiveCamera(62, 16/9, 0.05, 1200);
cam.position.set(-0.5, 2.4, 0);
cam.lookAt(-0.3, 1.6, 60);
cam.updateMatrixWorld(true);
soft.savePNG('tests/_s-road.png', scene, cam, 960, 540);
process.exit(0);
