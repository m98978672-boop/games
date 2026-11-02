import { JSDOM } from 'jsdom';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
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
    getImageData: (x, y, w, h) => ({ data: new Uint8ClampedArray(Math.max(1, w * h * 4)), width: w, height: h }),
    createImageData: (w, h) => ({ data: new Uint8ClampedArray(Math.max(1, w * h * 4)), width: w, height: h }),
    putImageData: () => undefined,
    drawImage: () => undefined,
    setTransform: () => undefined,
  };
  return new Proxy(target, {
    get(obj, prop) {
      if (prop in obj) return obj[prop];
      if (typeof prop === 'string') { obj[prop] = () => undefined; return obj[prop]; }
      return undefined;
    },
    set(obj, prop, v) { obj[prop] = v; return true; },
  });
}
dom.window.HTMLCanvasElement.prototype.getContext = () => fakeContext();

const THREE = await import('three');
const { SVGRenderer } = await import('three/examples/jsm/renderers/SVGRenderer.js');
const { TruckView } = await import('../src/world/truck3d.js');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xdde6ec);
const camera = new THREE.PerspectiveCamera(52, 16 / 9, 0.05, 100);
scene.add(new THREE.HemisphereLight(0xffffff, 0x445533, 2));
const sun = new THREE.DirectionalLight(0xffffff, 2.2);
sun.position.set(2, 4, -2);
scene.add(sun);
scene.add(new THREE.DirectionalLight(0xffffff, 1.2).translateX(-2));

const view = new TruckView(scene, 0x2f7fa8);
view.setInteriorVisible(true);
view.root.position.set(0, 0, 0);
view.root.updateMatrixWorld(true);

const local = (x, y, z) => view.root.localToWorld(new THREE.Vector3(x, y, z));
const camPos = local(-0.55, 2.42, 1.35);
const look = local(-0.55, 2.05, 1.96);

function shot(name, fov, pos, target) {
  camera.fov = fov;
  camera.position.copy(pos);
  camera.lookAt(target);
  camera.updateProjectionMatrix();
  const renderer = new SVGRenderer();
  renderer.setSize(900, 600);
  renderer.setClearColor(new THREE.Color(0xdde6ec));
  renderer.render(scene, camera);
  let svg = renderer.domElement.outerHTML;
  svg = svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');
  const svgPath = `/tmp/${name}.svg`;
  fs.writeFileSync(svgPath, svg);
  execFileSync('convert', ['-density', '150', svgPath, `/tmp/${name}.png`]);
  console.log('ok', name);
}
// Отдельная сцена с одним штурвалом: так видно форму, спицы, кнопки и ступицу.
const wheelScene = new THREE.Scene();
wheelScene.background = new THREE.Color(0xe7edf1);
wheelScene.add(new THREE.HemisphereLight(0xffffff, 0x556677, 2.4));
const key = new THREE.DirectionalLight(0xffffff, 2.4);
key.position.set(0.6, 1.2, 1.4);
wheelScene.add(key);
const rim2 = new THREE.DirectionalLight(0xffffff, 1.2);
rim2.position.set(-1.2, -0.4, 0.8);
wheelScene.add(rim2);
scene.remove(view.wheelPivot);
view.wheelPivot.position.set(0, 0, 0);
view.wheelPivot.rotation.set(0, 0, 0);
wheelScene.add(view.wheelPivot);

const wagon = new SVGRenderer();
const snap = (name, fov, pos, target) => {
  camera.fov = fov;
  camera.position.copy(pos);
  camera.lookAt(target);
  camera.updateProjectionMatrix();
  wagon.setSize(900, 600);
  wagon.setClearColor(new THREE.Color(0xe7edf1));
  wagon.render(wheelScene, camera);
  let svg = wagon.domElement.outerHTML.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');
  fs.writeFileSync(`/tmp/${name}.svg`, svg);
  console.log('shot', name);
};
// Установленное положение: так игрок видит штурвал из кабины.
view.wheelPivot.position.set(-0.55, 2.05, 1.96);
view.wheelPivot.rotation.set(-0.34, 0, 0);
snap('wheel-installed', 50, new THREE.Vector3(-0.55, 2.5, 1.2), new THREE.Vector3(-0.55, 2.05, 1.96));
view.wheelPivot.position.set(0, 0, 0);
view.wheelPivot.rotation.set(0, 0, 0);
snap('wheel-front', 38, new THREE.Vector3(0, 0.02, 0.85), new THREE.Vector3(0, 0, 0));
snap('wheel-angle', 40, new THREE.Vector3(0.42, 0.34, 0.78), new THREE.Vector3(0, 0, 0));
snap('wheel-detail', 30, new THREE.Vector3(0.18, 0.03, 0.42), new THREE.Vector3(0.12, 0, 0));

// Общий вид из кабины: штурвал на месте, ничего не проваливается.
const cab = new THREE.Scene();
cab.background = new THREE.Color(0xe7edf1);
cab.add(new THREE.HemisphereLight(0xffffff, 0x556677, 2.2));
const l1 = new THREE.DirectionalLight(0xffffff, 1.8); l1.position.set(0.4, 1.2, 0.8); cab.add(l1);
const l2 = new THREE.DirectionalLight(0xffffff, 1.0); l2.position.set(-0.8, 0.4, -1.2); cab.add(l2);
const cabWheel = view.wheelPivot;
wheelScene.remove(cabWheel);
cabWheel.position.set(0, 0, 0);
cabWheel.rotation.set(0, 0, 0);
cab.add(cabWheel);
const cabCam = new THREE.PerspectiveCamera(62, 1.5, 0.05, 10);
cabCam.position.set(0.1, 0.42, -0.75);
cabCam.lookAt(0, 0, 0.1);
cabCam.updateProjectionMatrix();
const cabRenderer = new SVGRenderer();
cabRenderer.setSize(900, 600);
cabRenderer.setClearColor(new THREE.Color(0xe7edf1));
cabRenderer.render(cab, cabCam);
fs.writeFileSync('/tmp/cabin-eye.svg', cabRenderer.domElement.outerHTML.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" '));
console.log('shot cabin-eye');
