/* РАТГРАД — краски. Сцена, свет, камера, HUD. Рельеф — по A28, дома — первые цвета. */
import * as THREE from 'three';
import { Terrain } from './terrain.js';
import { buildHouses } from './buildings.js';
import { WORLD } from './heightfield.js';

const canvas = document.getElementById('scene');
const hud = {
  fps: document.getElementById('hud-fps'),
  tris: document.getElementById('hud-tris'),
  chunks: document.getElementById('hud-chunks'),
  cam: document.getElementById('hud-cam'),
  load: document.getElementById('loading'),
  loadText: document.getElementById('loading-text')
};

/* ---------- рендерер ---------- */
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

/* ---------- небо ---------- */
function skyTexture() {
  const c = document.createElement('canvas');
  c.width = 4; c.height = 256;
  const g = c.getContext('2d');
  const grad = g.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0.0, '#7fb2d9');
  grad.addColorStop(0.45, '#bcd8ea');
  grad.addColorStop(0.72, '#e8f1f5');
  grad.addColorStop(1.0, '#f3ece0');
  g.fillStyle = grad;
  g.fillRect(0, 0, 4, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const scene = new THREE.Scene();
scene.background = skyTexture();
scene.fog = new THREE.Fog(0xdfeaf1, 260, 760);

/* ---------- свет ---------- */
const hemi = new THREE.HemisphereLight(0xdcecff, 0x6b6350, 1.15);
scene.add(hemi);

const sun = new THREE.DirectionalLight(0xfff1d6, 2.1);
sun.position.set(160, 230, 120);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
const sc = sun.shadow.camera;
sc.left = -160; sc.right = 160; sc.top = 160; sc.bottom = -160;
sc.near = 20; sc.far = 620;
sun.shadow.bias = -0.0006;
scene.add(sun);
scene.add(sun.target);

/* ---------- камера и управление ---------- */
const camera = new THREE.PerspectiveCamera(52, 1, 0.6, 2400);
const view = { theta: -0.9, phi: 1.02, radius: 250, target: new THREE.Vector3(0, 34, 0) };

function applyCamera() {
  const { theta, phi, radius, target } = view;
  camera.position.set(
    target.x + radius * Math.sin(phi) * Math.cos(theta),
    target.y + radius * Math.cos(phi),
    target.z + radius * Math.sin(phi) * Math.sin(theta)
  );
  camera.lookAt(target);
}

let drag = null;
canvas.addEventListener('pointerdown', (e) => {
  drag = { x: e.clientX, y: e.clientY, shift: e.shiftKey || e.button === 2 };
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
  drag.x = e.clientX; drag.y = e.clientY;
  if (drag.shift) {
    const s = view.radius * 0.0016;
    const right = new THREE.Vector3(Math.sin(view.theta + Math.PI / 2), 0, -Math.cos(view.theta + Math.PI / 2));
    const fwd = new THREE.Vector3(Math.cos(view.theta), 0, Math.sin(view.theta));
    view.target.addScaledVector(right, -dx * s);
    view.target.addScaledVector(fwd, -dy * s);
  } else {
    view.theta += dx * 0.005;
    view.phi = Math.max(0.18, Math.min(1.45, view.phi - dy * 0.004));
  }
  applyCamera();
});
canvas.addEventListener('pointerup', (e) => { drag = null; canvas.releasePointerCapture?.(e.pointerId); });
canvas.addEventListener('contextmenu', (e) => e.preventDefault());
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  view.radius = Math.max(40, Math.min(700, view.radius * (e.deltaY > 0 ? 1.1 : 1 / 1.1)));
  applyCamera();
}, { passive: false });

/* ---------- QООВЗ: круг видимых значений ---------- */
const qGroup = new THREE.Group();
const qRing = new THREE.Mesh(
  new THREE.RingGeometry(248, 252, 96),
  new THREE.MeshBasicMaterial({ color: 0x1a1a1a, transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthTest: false })
);
qRing.rotation.x = -Math.PI / 2;
qRing.position.y = WORLD.waterLevel + 0.3;
qRing.renderOrder = 999;
qGroup.add(qRing);
scene.add(qGroup);

/* ---------- сборка мира ---------- */
const terrain = new Terrain(scene);
applyCamera();

const clock = new THREE.Clock();
let tris = 0;
let frames = 0, fpsT = performance.now(), fps = 0;

function resize() {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  frames++;
  const now = performance.now();
  if (now - fpsT > 500) {
    fps = Math.round(frames * 1000 / (now - fpsT));
    frames = 0; fpsT = now;
    hud.fps.textContent = fps;
    hud.tris.textContent = tris.toLocaleString('ru-RU');
    hud.chunks.textContent = terrain.chunks.size + ' / ' + (WORLD.chunks * WORLD.chunks);
    hud.cam.textContent = Math.round(camera.position.x) + '; ' + Math.round(camera.position.y) + '; ' + Math.round(camera.position.z);
  }
}

/* ---------- переключатели ---------- */
const toggles = {
  'toggle-contours': (v) => terrain.setContours(v),
  'toggle-water': (v) => terrain.setWater(v),
  'toggle-colors': (v) => terrain.setColors(v),
  'toggle-shadows': (v) => { renderer.shadowMap.enabled = v; sun.castShadow = v; scene.traverse((o) => { if (o.material) o.material.needsUpdate = true; }); },
  'toggle-q': (v) => { qGroup.visible = v; }
};
for (const [id, fn] of Object.entries(toggles)) {
  const el = document.getElementById(id);
  if (el) el.addEventListener('change', () => fn(el.checked));
}

/* ---------- запуск ---------- */
resize();
animate();

terrain.init((done, total) => {
  if (hud.loadText) hud.loadText.textContent = 'рельеф: ' + done + ' / ' + total + ' чанков';
}).then(() => {
  buildHouses(scene, terrain);
  tris = 0;
  scene.traverse((o) => {
    if (o.isMesh && o.geometry && o.geometry.index) tris += o.geometry.index.count / 3;
    else if (o.isMesh && o.geometry && o.geometry.attributes.position) tris += o.geometry.attributes.position.count / 3;
  });
  hud.tris.textContent = Math.round(tris).toLocaleString('ru-RU');
  if (hud.load) hud.load.classList.add('done');
  hud.loadText.textContent = 'готово';
  window.__ratgrad = { scene, terrain, camera, view, renderer, tris };
});
