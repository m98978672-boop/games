// Оффлайн-проверка сцены: рендер в SVG через SVGRenderer (без WebGL), затем PNG через ImageMagick.
import { JSDOM } from 'jsdom';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const dom = new JSDOM('<!doctype html><html><body></body></html>', { pretendToBeVisual: true });
global.window = dom.window;
global.document = dom.window.document;
Object.defineProperty(global, 'navigator', { value: dom.window.navigator, configurable: true });
global.HTMLCanvasElement = dom.window.HTMLCanvasElement;
global.performance = dom.window.performance;
global.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 16);

function fakeContext() {
  const gradient = { addColorStop() {} };
  const target = {
    canvas: { width: 512, height: 512 },
    createLinearGradient: () => gradient,
    createRadialGradient: () => gradient,
    createPattern: () => null,
    measureText: () => ({ width: 10 }),
  };
  return new Proxy(target, {
    get(obj, prop) {
      if (prop in obj) return obj[prop];
      if (typeof prop === 'string') {
        obj[prop] = () => undefined;
        return obj[prop];
      }
      return undefined;
    },
    set(obj, prop, v) {
      obj[prop] = v;
      return true;
    },
  });
}
dom.window.HTMLCanvasElement.prototype.getContext = () => fakeContext();

const THREE = await import('three');
const { SVGRenderer } = await import('three/examples/jsm/renderers/SVGRenderer.js');
const { buildRouteGeometry } = await import('../src/world/roadnet.js');
const { RoadWorld } = await import('../src/world/road.js');
const { TruckView } = await import('../src/world/truck3d.js');
const { Traffic } = await import('../src/world/traffic.js');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9fb4c4);
const camera = new THREE.PerspectiveCamera(72, 16 / 9, 0.08, 5000);
scene.add(new THREE.HemisphereLight(0xffffff, 0x445533, 2));
const sun = new THREE.DirectionalLight(0xffffff, 2);
sun.position.set(100, 200, 50);
scene.add(sun);

const route = buildRouteGeometry(['berlin', 'dresden', 'prague'], 5);
console.log('маршрут', route.km.toFixed(1), 'км');
const s = 900;
const player = { s, lat: 1.85 };
const road = new RoadWorld(scene, route, [
  { s: 1100, label: 'ПОГРУЗКА', sub: 'NordTrans', color: '#1f5c3a' },
]);
const truckView = new TruckView(scene, 0x2f7fa8);
const traffic = new Traffic(scene, route, 8);
truckView.buildTrailer('curtain', 'NordTrans');
traffic.update(0.016, s, 1.85, 20, 0);

const p = route.worldPos(s, player.lat);
truckView.setPosition(p.x, p.y, p.z, p.hdg, 0, 0);
truckView.setInteriorVisible(false);

function shot(name, camPos, lookAt, fov = 66) {
  camera.fov = fov;
  camera.position.copy(camPos);
  camera.lookAt(lookAt);
  camera.updateProjectionMatrix();
  const renderer = new SVGRenderer();
  renderer.setSize(960, 540);
  renderer.setClearColor(new THREE.Color(0x9fb4c4));
  renderer.render(scene, camera);
  let svg = renderer.domElement.outerHTML;
  svg = svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');
  const svgPath = path.join(root, 'tests', name + '.svg');
  fs.writeFileSync(svgPath, svg);
  try {
    execFileSync('convert', [svgPath, path.join(root, 'tests', name + '.png')]);
  } catch {
    /* конвертация выполняется отдельным шагом */
  }
  console.log('готово:', name + '.png');
}

// Вид сзади.
shot('preview-rear', new THREE.Vector3(p.x - Math.sin(p.hdg) * 23, p.y + 6.6, p.z - Math.cos(p.hdg) * 23), new THREE.Vector3(p.x + Math.sin(p.hdg) * 10, p.y + 2, p.z + Math.cos(p.hdg) * 10));

// Вид из кабины.
truckView.setInteriorVisible(true);
const camPos = new THREE.Vector3(-0.45, 2.42, 0.95);
truckView.root.updateMatrixWorld(true);
truckView.root.localToWorld(camPos);
const look = new THREE.Vector3(-0.42, 2.28, 30);
truckView.root.localToWorld(look);
shot('preview-cabin', camPos, look, 62);

console.log('SVG и PNG сохранены в tests/');
process.exit(0);
