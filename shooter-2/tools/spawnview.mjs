/* =============================================================================
   tools/spawnview.mjs — что видно на старте каждой миссии
   -----------------------------------------------------------------------------
   Рендерит кадр из настоящей стартовой точки игрока (playerSpawn + доворот
   Game.pickStartYaw) для всех миссий в одну картинку: так видно, что первым
   делом смотрит игрок — уровень или стену вплотную.

   Запуск:
     node tools/spawnview.mjs [out.png] [--w 420] [--h 900]
   ============================================================================= */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const sandbox = {
  console, Math, JSON, Map, Set, Array, Object, Number, String, Boolean, Date,
  isFinite, isNaN, Float32Array, Uint16Array, Uint32Array, Int32Array, Uint8Array,
  Infinity, NaN, performance: { now: () => Date.now() },
  document: {
    createElement: () => ({
      getContext: () => ({
        fillRect() {}, beginPath() {}, arc() {}, fill() {}, stroke() {}, moveTo() {}, lineTo() {},
        save() {}, restore() {}, translate() {}, rotate() {}, closePath() {},
        createRadialGradient: () => ({ addColorStop() {} }),
        createLinearGradient: () => ({ addColorStop() {} }),
        fillStyle: '', strokeStyle: '', globalAlpha: 1, lineWidth: 1, globalCompositeOperation: ''
      }),
      width: 0, height: 0
    })
  },
  setTimeout: () => 0, clearTimeout: () => {}
};
sandbox.globalThis = sandbox; sandbox.window = sandbox;
vm.createContext(sandbox);
vm.runInContext(read('three.min.js'), sandbox, { filename: 'three.min.js' });
sandbox.THREE = Object.assign(Object.create(null), sandbox.THREE, {
  CanvasTexture: class { constructor() { this.isTexture = true; this.repeat = { set() {} }; } dispose() {} }
});
for (const m of ['data', 'outline', 'gunblueprints', 'soldier', 'level', 'model', 'anim', 'ik', 'ragdoll', 'world', 'viewmodel']) {
  vm.runInContext(read(`src/${m}.js`), sandbox, { filename: m });
}
const SH2 = sandbox.SH2;
const T = sandbox.THREE;

/* ------------------------------ PNG-энкодер ---------------------------- */
function png(width, height, rgba) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0;
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  const table = (() => {
    const t = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c;
    }
    return t;
  })();
  const crc32 = (b) => { let c = -1; for (let i = 0; i < b.length; i++) c = table[(c ^ b[i]) & 0xff] ^ (c >>> 8); return (c ^ -1) >>> 0; };
  const chunk = (type, data) => {
    const l = Buffer.alloc(4); l.writeUInt32BE(data.length);
    const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
    const cr = Buffer.alloc(4); cr.writeUInt32BE(crc32(td));
    return Buffer.concat([l, td, cr]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))
  ]);
}

/* ------------------------------ растеризатор --------------------------- */
class Canvas {
  constructor(w, h, bg) {
    this.w = w; this.h = h;
    this.color = Buffer.alloc(w * h * 4);
    this.depth = new Float32Array(w * h).fill(Infinity);
    for (let i = 0; i < w * h; i++) {
      const g = (i / w) / h;
      this.color[i * 4] = bg[0] * (0.55 + g * 0.5);
      this.color[i * 4 + 1] = bg[1] * (0.55 + g * 0.5);
      this.color[i * 4 + 2] = bg[2] * (0.55 + g * 0.5);
      this.color[i * 4 + 3] = 255;
    }
  }
  tri(ax, ay, az, bx, by, bz, cx, cy, cz, r, g, b, lam) {
    const minX = Math.max(0, Math.floor(Math.min(ax, bx, cx)));
    const maxX = Math.min(this.w - 1, Math.ceil(Math.max(ax, bx, cx)));
    const minY = Math.max(0, Math.floor(Math.min(ay, by, cy)));
    const maxY = Math.min(this.h - 1, Math.ceil(Math.max(ay, by, cy)));
    if (minX > maxX || minY > maxY) return;
    const area = (bx - ax) * (cy - ay) - (cx - ax) * (by - ay);
    if (Math.abs(area) < 1e-9) return;
    const inv = 1 / area;
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const px = x + 0.5, py = y + 0.5;
        const w0 = ((bx - ax) * (py - ay) - (px - ax) * (by - ay)) * inv;
        const w1 = ((px - ax) * (cy - ay) - (cx - ax) * (py - ay)) * inv;
        const w2 = 1 - w0 - w1;
        if (w0 < 0 || w1 < 0 || w2 < 0) continue;
        const z = az * w2 + bz * w1 + cz * w0;
        const idx = y * this.w + x;
        if (z >= this.depth[idx] || z <= 0) continue;
        this.depth[idx] = z;
        const l = lam === undefined ? 0.85 : lam;
        this.color[idx * 4] = Math.min(255, r * l);
        this.color[idx * 4 + 1] = Math.min(255, g * l);
        this.color[idx * 4 + 2] = Math.min(255, b * l);
        this.color[idx * 4 + 3] = 255;
      }
    }
  }
}

function renderScene(canvas, rootObj, camPos, camLook, fov, bright) {
  const cam = new T.PerspectiveCamera(fov || 38, canvas.w / canvas.h, 0.05, 100);
  cam.position.copy(camPos);
  cam.lookAt(camLook);
  cam.updateMatrixWorld(true);
  rootObj.updateMatrixWorld(true);
  const pv = new T.Matrix4().multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse);
  const v = new T.Vector3();
  const meshes = [];
  rootObj.traverse((c) => { if (c.isMesh && c.visible) meshes.push(c); });
  for (const mesh of meshes) {
    const geo = mesh.geometry;
    const pos = geo.attributes.position;
    const index = geo.index;
    const color = mesh.material.color || { r: 0.7, g: 0.7, b: 0.7 };
    const rgb = [Math.round(color.r * 255 * bright), Math.round(color.g * 255 * bright), Math.round(color.b * 255 * bright)];
    const count = index ? index.count : pos.count;
    for (let i = 0; i < count; i += 3) {
      const ia = index ? index.getX(i) : i;
      const ib = index ? index.getX(i + 1) : i + 1;
      const ic = index ? index.getX(i + 2) : i + 2;
      const pts = [], world = [];
      let skip = false;
      for (const ii of [ia, ib, ic]) {
        v.set(pos.getX(ii), pos.getY(ii), pos.getZ(ii));
        mesh.localToWorld(v);
        world.push(v.clone());
        v.applyMatrix4(pv);
        if (v.z > 1 || v.z < -1) { skip = true; break; }
        pts.push([(v.x * 0.5 + 0.5) * canvas.w, (-v.y * 0.5 + 0.5) * canvas.h, v.z]);
      }
      if (skip) continue;
      const e1 = world[1].clone().sub(world[0]);
      const e2 = world[2].clone().sub(world[0]);
      const n = e1.cross(e2).normalize();
      const L1 = new T.Vector3(0.45, 0.8, 0.5).normalize();
      const L2 = new T.Vector3(-0.6, 0.25, -0.4).normalize();
      let lam = 0.55 + 0.75 * Math.max(0, n.dot(L1)) + 0.3 * Math.max(0, n.dot(L2));
      lam = Math.min(1.9, lam);
      canvas.tri(
        pts[0][0], pts[0][1], pts[0][2], pts[1][0], pts[1][1], pts[1][2],
        pts[2][0], pts[2][1], pts[2][2], rgb[0], rgb[1], rgb[2], lam
      );
    }
  }
}


/* ---------------------------------- кадры ------------------------------- */
const argOf = (name, def) => {
  const i = process.argv.indexOf('--' + name);
  return i >= 0 ? process.argv[i + 1] : def;
};
const out = process.argv[2] || 'docs/preview-spawn.png';
const W = Number(argOf('w', 420)), H = Number(argOf('h', 900));
const maps = ['depot', 'convoy', 'harbor'];
const big = new Canvas(W * maps.length, H, [10, 9, 8]);

maps.forEach((mapId, i) => {
  const M = SH2.data.MAPS[mapId];
  const lvl = SH2.model.buildLevel(mapId);
  const world = new SH2.world.World(M, lvl.colliders);
  const sp = M.playerSpawn;
  // тот же доворот, что делает игра (см. Game.pickStartYaw)
  const eye = 1.62, MIN_VIEW = 12;
  const clearAt = (yaw) => {
    let minD = MIN_VIEW * 4;
    for (let a = -2; a <= 2; a++) {
      const yy = yaw + a * 0.24;
      const hit = world.rayColliders(sp.x, eye, sp.z, Math.sin(yy), 0, Math.cos(yy), MIN_VIEW * 4);
      minD = Math.min(minD, hit ? hit.t : MIN_VIEW * 4);
    }
    return minD;
  };
  let yaw = sp.yaw;
  if (clearAt(yaw) < MIN_VIEW) {
    let bestScore = -1;
    for (let k = 0; k < 24; k++) {
      const y = sp.yaw + (k / 24) * Math.PI * 2;
      const score = Math.min(clearAt(y), MIN_VIEW) - k * 0.02;
      if (score > bestScore) { bestScore = score; yaw = y; }
    }
  }
  const cv = new Canvas(W, H, [12, 10, 9]);
  const camPos = new T.Vector3(sp.x, eye, sp.z);
  const look = new T.Vector3(sp.x + Math.sin(yaw) * 8, eye - 0.15, sp.z + Math.cos(yaw) * 8);
  renderScene(cv, lvl.group, camPos, look, 78, 1.7);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const s = (y * W + x) * 4;
      const d = (y * (W * maps.length) + i * W + x) * 4;
      big.color[d] = cv.color[s]; big.color[d + 1] = cv.color[s + 1];
      big.color[d + 2] = cv.color[s + 2]; big.color[d + 3] = 255;
    }
  }
  console.log(`  ${mapId}: старт (${sp.x}, ${sp.z}) yaw ${yaw.toFixed(2)} — открыто ${clearAt(yaw).toFixed(1)} м`);
});
fs.writeFileSync(path.resolve(root, out), png(W * maps.length, H, big.color));
console.log(out + ' — ' + maps.length + ' стартовых кадра');
