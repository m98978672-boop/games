// crew-shot.mjs — посмотреть на рабочего без браузера.
//
// В песочнице нет ни Chromium, ни Playwright, а глазами позу и посадку коробки
// проверить надо. Скрипт поднимает настоящую игру в jsdom (настоящие движок,
// мост и меши) и рисует кадр собственным CPU-растеризатором в PNG.
//
//   node tools/crew-shot.mjs                          # Марта с коробкой, спереди
//   WORKER=1 CARRY=0 SIDE=iso OUT=/tmp/grisha.png node tools/crew-shot.mjs
//   W=800 H=900 SIDE=side CARRY=1 node tools/crew-shot.mjs
//
// Переменные: WORKER (0..2), CARRY (0/1), SIDE (front|side|back|iso),
// FOCUS=box (только несомая коробка), CAM=x,y,z + LOOK=x,y,z (сцена целиком),
// W и H (размер кадра), OUT (путь к PNG). Нужны jsdom и three:
//   npm install --no-save jsdom three
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { createRequire } from 'node:module';

const repoRoot = '/home/user/games';
const gameDir = path.join(repoRoot, 'warehouse-crew');
const req = createRequire(path.join(repoRoot, 'node_modules/noop.js'));
const { JSDOM } = req('jsdom');
const THREE = req('three');

const SCRIPTS = [
  'src/sim/model.js', 'src/ai/brain-net.js', 'vendor/cannon-es.min.js', 'src/sim/physics.js', 'src/sim/warehouse.js', 'src/sim/worker.js',
  'src/config.js', 'src/util.js', 'src/layout.js', 'src/save.js', 'src/audio.js',
  'src/render/meshes.js', 'src/render/world.js', 'src/render/bodyview.js',
  'src/render.js', 'src/game.js', 'src/ui.js', 'src/main.js',
];
class StubRenderer {
  constructor(o = {}) { this.domElement = o.canvas; this.shadowMap = { enabled: false }; this.info = { render: { calls: 0, triangles: 0 } }; }
  setPixelRatio() {} setClearColor() {} setSize() {} render() {} getContext() { return {}; } dispose() {}
}
const html = fs.readFileSync(path.join(gameDir, 'index.html'), 'utf8');
const dom = new JSDOM(html, { url: 'http://localhost/warehouse-crew/', pretendToBeVisual: true, runScripts: 'outside-only' });
const { window } = dom;
Object.defineProperty(window, 'innerWidth', { value: 1440, writable: true });
Object.defineProperty(window, 'innerHeight', { value: 900, writable: true });
Object.defineProperty(window, 'matchMedia', { writable: true, value: (q) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} }) });
window.THREE = Object.assign({}, THREE, { WebGLRenderer: StubRenderer });
window.TextEncoder = TextEncoder; window.TextDecoder = TextDecoder;
window.console = { log() {}, warn() {}, error() {} };
window.fetch = async (url) => {
  let rel = String(url).replace(/^https?:\/\/localhost\//, '').replace(/^\.\//, '');
  if (rel.startsWith('warehouse-crew/')) rel = rel.slice('warehouse-crew/'.length);
  const file = path.join(gameDir, rel);
  if (!fs.existsSync(file)) return { ok: false, status: 404, json: async () => ({}) };
  return { ok: true, status: 200, json: async () => JSON.parse(fs.readFileSync(file, 'utf8')) };
};
window.URL.createObjectURL = () => 'blob:test';
window.requestAnimationFrame = () => 0;
window.eval(fs.readFileSync(path.join(repoRoot, 'ratcore/ratcore.bundle.js'), 'utf8'));
window.eval(fs.readFileSync(path.join(repoRoot, 'shared/engine.js'), 'utf8'));
for (const f of SCRIPTS) window.eval(fs.readFileSync(path.join(gameDir, f), 'utf8'));
window.eval(fs.readFileSync(path.join(gameDir, 'data/brain-data.js'), 'utf8'));
window.eval(fs.readFileSync(path.join(repoRoot, 'shared/engine-bootstrap.js'), 'utf8'));
await window.WC.main.boot();
const game = window.WC.game;
const scene = window.WC.world.scene;

// --- сценарий: заставить одного рабочего нести коробку -------------------
const sim = game.sim;
for (let i = 0; i < 120; i++) game.update(1 / 30);
const worker = game.api.crew[Number(process.env.WORKER || 0)];
if (process.env.FALL === '1') {
  worker.body.energy = 0; worker.body.collapsed = true;
  for (let i = 0; i < 35; i++) game.update(1 / 30);
}
const order = sim.state.orders.find((o) => o.status === 'pending') || sim.state.orders[0];
if (!order) { console.log('нет заказов'); process.exit(1); }
console.log('заказ', order.code, order.size, 'статус', order.status, 'масса', order.mass);
if (process.env.CARRY !== '0') {
  order.status = 'carried';
  order.carrier = worker.state.id;
  worker.state.carryingId = order.id;
}
window.WC.world.render(1 / 30, game);
window.WC.world.render(1 / 30, game);


// --- рисуем --------------------------------------------------------------
const W = Number(process.env.W || 520), H = Number(process.env.H || 620);
const view = process.env.SIDE || 'front';
const sceneCam = process.env.CAM ? process.env.CAM.split(',').map(Number) : null;
const sceneLook = process.env.LOOK ? process.env.LOOK.split(',').map(Number) : null;
const targetView = [...(window.WC.world.crewViews || new Map()).entries()];
const crewRoots = [];
scene.traverse((o) => { if (o.userData && o.userData.rig) crewRoots.push(o); });
console.log('crew roots:', crewRoots.length, 'order', order.code, order.size, 'carried by', worker.state.id);
if (!crewRoots.length) process.exit(1);
const root = crewRoots.find((r) => r.userData.rig === worker.state.id) || crewRoots[0];

// LINEUP=1 — все трое в ряд, как на групповом снимке для README
const lineup = process.env.LINEUP === '1';
if (lineup) {
  crewRoots.forEach((r, i) => {
    r.position.set((i - 1) * 0.95, 0, 0);
    r.rotation.set(0, 0, 0);
  });
  scene.updateMatrixWorld(true);
  scene.children.forEach((child) => {
    if (!child.userData || !child.userData.rig) child.visible = false;
  });
}

// FOCUS=box — рисуем только коробку (без рабочего), чтобы проверить посадку
let onlyBox = null;
if (process.env.FOCUS === 'box') {
  scene.traverse((o) => { if (o.userData && o.userData.orderId === order.id) onlyBox = o; });
  const hide = (o) => { if (o !== onlyBox) o.visible = false; };
  crewRoots.forEach((r) => { r.visible = false; });
}

const rootWorld = new THREE.Vector3();
if (onlyBox) onlyBox.getWorldPosition(rootWorld); else root.getWorldPosition(rootWorld);
const yaw = root.rotation.y;
const fwd = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
const rightV = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));
const camTarget = [rootWorld.x, rootWorld.y + (onlyBox ? 0 : 0.95), rootWorld.z];
const dist = 3.1;
const offset = view === 'front' ? fwd.clone().multiplyScalar(dist)
  : view === 'back' ? fwd.clone().multiplyScalar(-dist)
  : view === 'side' ? rightV.clone().multiplyScalar(dist)
  : fwd.clone().multiplyScalar(dist * 0.72).add(rightV.clone().multiplyScalar(dist * 0.62)).add(new THREE.Vector3(0, 1.1, 0));
let camPos = [camTarget[0] + offset.x, camTarget[1] + offset.y, camTarget[2] + offset.z];
let lookTarget = camTarget;
if (lineup) {
  const base = new THREE.Vector3();
  crewRoots[Math.floor(crewRoots.length / 2)].getWorldPosition(base);
  camPos = [base.x, 1.5, base.z + 3.9];
  lookTarget = [base.x, 0.9, base.z];
}
if (sceneCam && sceneLook) { camPos = sceneCam; lookTarget = sceneLook; }
const height = 2.2;
const aspect = W / H;
const viewH = height, viewW = height * aspect;
const cam = new THREE.PerspectiveCamera(lineup ? 33 : 38, aspect, 0.1, 50);
cam.position.set(...camPos);
cam.fov = 40;
cam.lookAt(new THREE.Vector3(...lookTarget));
cam.updateMatrixWorld(true);
cam.updateProjectionMatrix();

const bg = [26, 31, 32];
const buf = new Float32Array(W * H * 3);
for (let i = 0; i < W * H; i++) { buf[i * 3] = bg[0] / 255; buf[i * 3 + 1] = bg[1] / 255; buf[i * 3 + 2] = bg[2] / 255; }
const zbuf = new Float32Array(W * H).fill(Infinity);

// рабочий уже выбран выше
const inv = new THREE.Matrix4().copy(root.matrixWorld).invert();
root.updateMatrixWorld(true);
const drawRoot = lineup ? scene : ((sceneCam && sceneLook) ? scene : root);
scene.updateMatrixWorld(true);
drawRoot.traverseVisible((obj) => {
  if (!obj.isMesh || !obj.geometry || !obj.visible) return;
  const geo = obj.geometry;
  const pos = geo.getAttribute('position');
  if (!pos) return;
  const idx = geo.getIndex();
  const colAttr = geo.getAttribute('color');
  const mat = obj.material || {};
  const base = new THREE.Color(mat.color ? mat.color.getHex() : 0xffffff);
  const vcol = [new THREE.Color(), new THREE.Color(), new THREE.Color()];
  const mw = obj.matrixWorld;
  const nrm = new THREE.Matrix3().getNormalMatrix(mw);
  const p = new THREE.Vector3(), n = new THREE.Vector3();
  const tri = idx ? idx.count / 3 : pos.count / 3;
  const vp = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
  for (let t = 0; t < tri; t++) {
    for (let k = 0; k < 3; k++) {
      const vi = idx ? idx.getX(t * 3 + k) : t * 3 + k;
      p.fromBufferAttribute(pos, vi).applyMatrix4(mw);
      vp[k].copy(p).project(cam);
      if (colAttr) vcol[k].setRGB(colAttr.getX(vi), colAttr.getY(vi), colAttr.getZ(vi));
    }
    // отсечение
    if (vp.some((v) => v.z > 1 || v.z < -1)) continue;
    const sx = vp.map((v) => (v.x * 0.5 + 0.5) * W);
    const sy = vp.map((v) => (1 - (v.y * 0.5 + 0.5)) * H);
    const sz = vp.map((v) => v.z);
    // нормаль из первых трёх вершин
    n.fromBufferAttribute(pos, idx ? idx.getX(t * 3) : t * 3).applyMatrix3(nrm).normalize();
    const light = new THREE.Vector3(0.4, 0.85, 0.5).normalize();
    const lambert = 0.35 + 0.65 * Math.max(0, n.dot(light));
    const minX = Math.max(0, Math.floor(Math.min(...sx))), maxX = Math.min(W - 1, Math.ceil(Math.max(...sx)));
    const minY = Math.max(0, Math.floor(Math.min(...sy))), maxY = Math.min(H - 1, Math.ceil(Math.max(...sy)));
    const area = (sx[1] - sx[0]) * (sy[2] - sy[0]) - (sx[2] - sx[0]) * (sy[1] - sy[0]);
    if (Math.abs(area) < 1e-9) continue;
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const px = x + 0.5, py = y + 0.5;
        const w0 = ((sx[1] - px) * (sy[2] - py) - (sx[2] - px) * (sy[1] - py)) / area;
        const w1 = ((sx[2] - px) * (sy[0] - py) - (sx[0] - px) * (sy[2] - py)) / area;
        const w2 = 1 - w0 - w1;
        if (w0 < 0 || w1 < 0 || w2 < 0) continue;
        const z = w0 * sz[0] + w1 * sz[1] + w2 * sz[2];
        const o = y * W + x;
        if (z >= zbuf[o]) continue;
        zbuf[o] = z;
        const cr = colAttr ? (w0 * vcol[0].r + w1 * vcol[1].r + w2 * vcol[2].r) : base.r;
        const cg = colAttr ? (w0 * vcol[0].g + w1 * vcol[1].g + w2 * vcol[2].g) : base.g;
        const cb = colAttr ? (w0 * vcol[0].b + w1 * vcol[1].b + w2 * vcol[2].b) : base.b;
        buf[o * 3] = Math.min(1, cr * lambert);
        buf[o * 3 + 1] = Math.min(1, cg * lambert);
        buf[o * 3 + 2] = Math.min(1, cb * lambert);
      }
    }
  }
});

// PNG
function crc32(b) { let c, crc = 0xffffffff; for (let n = 0; n < b.length; n++) { c = (crc ^ b[n]) & 0xff; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; crc = (crc >>> 8) ^ c; } return (crc ^ 0xffffffff) >>> 0; }
function chunk(type, data) { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type, 'ascii'), data]); const c = Buffer.alloc(4); c.writeUInt32BE(crc32(td)); return Buffer.concat([len, td, c]); }
const raw = Buffer.alloc((W * 3 + 1) * H);
for (let y = 0; y < H; y++) { raw[y * (W * 3 + 1)] = 0; for (let x = 0; x < W; x++) { const o = y * (W * 3 + 1) + 1 + x * 3; const i = (y * W + x) * 3; raw[o] = Math.round(buf[i] * 255); raw[o + 1] = Math.round(buf[i + 1] * 255); raw[o + 2] = Math.round(buf[i + 2] * 255); } }
const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4); ihdr[8] = 8; ihdr[9] = 2;
const png = Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
const out = process.env.OUT || '/tmp/crew.png';
fs.writeFileSync(out, png);
console.log('нарисовано:', out, W + 'x' + H);

// метрики: где коробка относительно кистей
const box = [...(game.sim ? [] : [])];
const scene2 = scene;
let boxGroup = null;
scene2.traverse((o) => { if (o.userData && o.userData.orderId === order.id) boxGroup = o; });
if (boxGroup) {
  const bw = new THREE.Vector3(); boxGroup.getWorldPosition(bw);
  const hands = [];
  root.traverse((o) => { if (o.isMesh) hands.push(o); });
  console.log('коробка в мире:', bw.toArray().map((n) => +n.toFixed(2)), 'родитель:', boxGroup.parent && boxGroup.parent.type);
}
