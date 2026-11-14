/* =============================================================================
   Превью: монолиты-укрытия на карте, крупным планом.
   Запуск: node shooter-2/tools/monolithmap.mjs out.png
   Рисует кадр из точки рядом с первым монолитом карты «Складской терминал»:
   видно, что прорези — это дыры (сквозь них виден фон), а выемки темнее.
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
for (const m of ['data', 'outline', 'gunblueprints', 'soldier', 'level', 'monolith', 'model']) {
  vm.runInContext(read(`src/${m}.js`), sandbox, { filename: m });
}
const SH2 = sandbox.SH2;
const T = sandbox.THREE;

/* ------------------------------ PNG-энкодер ----------------------------- */
function png(width, height, rgba) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0;
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  const crcTable = (() => {
    const t = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c;
    }
    return t;
  })();
  const crc = (buf) => {
    let c = 0xffffffff;
    for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };
  const chunk = (type, data) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
    const cr = Buffer.alloc(4);
    cr.writeUInt32BE(crc(td));
    return Buffer.concat([len, td, cr]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))
  ]);
}

/* Замер глубины: только она решает, что ближе — прорезь честно даёт фон. */
function render(W, H, camPos, camLook, fov) {
  const lvl = SH2.model.buildLevel('depot');
  lvl.group.updateMatrixWorld(true);
  const cam = new T.PerspectiveCamera(fov, W / H, 0.05, 400);
  cam.position.copy(camPos);
  cam.lookAt(camLook);
  cam.updateMatrixWorld(true);
  const pv = new T.Matrix4().multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse);
  const color = new Float32Array(W * H * 3).fill(0.06);
  const depth = new Float32Array(W * H).fill(Infinity);
  const v = new T.Vector3();
  const L1 = new T.Vector3(0.45, 0.8, 0.5).normalize();
  const L2 = new T.Vector3(-0.6, 0.25, -0.4).normalize();
  const meshes = [];
  lvl.group.traverse((c) => { if (c.isMesh && c.visible && !c.isInstancedMesh) meshes.push(c); });
  for (const mesh of meshes) {
    const geo = mesh.geometry;
    const pos = geo.attributes.position;
    const index = geo.index;
    const vcol = geo.attributes.color || null;
    const base = mesh.material.color || { r: 0.7, g: 0.7, b: 0.7 };
    const count = index ? index.count : pos.count;
    for (let i = 0; i < count; i += 3) {
      const ia = index ? index.getX(i) : i;
      const ib = index ? index.getX(i + 1) : i + 1;
      const ic = index ? index.getX(i + 2) : i + 2;
      const scr = [];
      const world = [];
      let skip = false;
      for (const ii of [ia, ib, ic]) {
        v.set(pos.getX(ii), pos.getY(ii), pos.getZ(ii));
        mesh.localToWorld(v);
        world.push([v.x, v.y, v.z]);
        v.applyMatrix4(pv);
        if (v.z > 1 || v.z < -1) { skip = true; break; }
        scr.push([(v.x * 0.5 + 0.5) * W, (-v.y * 0.5 + 0.5) * H, v.z]);
      }
      if (skip) continue;
      const e1 = [world[1][0] - world[0][0], world[1][1] - world[0][1], world[1][2] - world[0][2]];
      const e2 = [world[2][0] - world[0][0], world[2][1] - world[0][1], world[2][2] - world[0][2]];
      const n = new T.Vector3(e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2],
        e1[0] * e2[1] - e1[1] * e2[0]).normalize();
      let lam = 0.42 + 0.78 * Math.max(0, n.dot(L1)) + 0.26 * Math.max(0, n.dot(L2));
      let r = base.r * 1.25, g = base.g * 1.25, b = base.b * 1.25;
      if (vcol) { r = vcol.getX(ia); g = vcol.getY(ia); b = vcol.getZ(ia); }
      r = Math.min(1, r * lam); g = Math.min(1, g * lam); b = Math.min(1, b * lam);
      /* растеризация с z-буфером */
      const minX = Math.max(0, Math.min(Math.floor(scr[0][0]), Math.floor(scr[1][0]), Math.floor(scr[2][0])));
      const maxX = Math.min(W - 1, Math.max(Math.ceil(scr[0][0]), Math.ceil(scr[1][0]), Math.ceil(scr[2][0])));
      const minY = Math.max(0, Math.min(Math.floor(scr[0][1]), Math.floor(scr[1][1]), Math.floor(scr[2][1])));
      const maxY = Math.min(H - 1, Math.max(Math.ceil(scr[0][1]), Math.ceil(scr[1][1]), Math.ceil(scr[2][1])));
      const d0 = scr[0][2], d1 = scr[1][2], d2 = scr[2][2];
      const den = (scr[1][1] - scr[2][1]) * (scr[0][0] - scr[2][0]) +
        (scr[2][0] - scr[1][0]) * (scr[0][1] - scr[2][1]);
      if (Math.abs(den) < 1e-9) continue;
      for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
          const l0 = ((scr[1][1] - scr[2][1]) * (x - scr[2][0]) + (scr[2][0] - scr[1][0]) * (y - scr[2][1])) / den;
          const l1 = ((scr[2][1] - scr[0][1]) * (x - scr[2][0]) + (scr[0][0] - scr[2][0]) * (y - scr[2][1])) / den;
          const l2 = 1 - l0 - l1;
          if (l0 < 0 || l1 < 0 || l2 < 0) continue;
          const z = l0 * d0 + l1 * d1 + l2 * d2;
          const o = y * W + x;
          if (z >= depth[o]) continue;
          depth[o] = z;
          color[o * 3] = r; color[o * 3 + 1] = g; color[o * 3 + 2] = b;
        }
      }
    }
  }
  const rgba = Buffer.alloc(W * H * 4);
  for (let i = 0; i < W * H; i++) {
    rgba[i * 4] = Math.min(255, Math.round(color[i * 3] * 255));
    rgba[i * 4 + 1] = Math.min(255, Math.round(color[i * 3 + 1] * 255));
    rgba[i * 4 + 2] = Math.min(255, Math.round(color[i * 3 + 2] * 255));
    rgba[i * 4 + 3] = 255;
  }
  return { rgba, lvl };
}

const out = process.argv[2] || 'docs/preview-monolith-map.png';
const M = SH2.data.MAPS.depot;
const spots = M.monoliths;
const W = 760, H = 460;
const sheet = Buffer.alloc(W * spots.length * H * 4);
spots.forEach((s, i) => {
  const camPos = new T.Vector3(s.x + Math.sin(s.a + 0.6) * 4.2, 1.75, s.z + Math.cos(s.a + 0.6) * 4.2);
  const look = new T.Vector3(s.x, 0.85, s.z);
  const { rgba } = render(W, H, camPos, look, 62);
  for (let y = 0; y < H; y++) {
    rgba.copy(sheet, (y * W * spots.length + i * W) * 4, y * W * 4, (y + 1) * W * 4);
  }
  const d = SH2.monolith.describe(s.model % SH2.monolith.COUNT);
  console.log(`  ${i}: ${d.id} — прорезей ${SH2.monolith.build(s.model).openings}`);
});
fs.writeFileSync(path.resolve(root, out), png(W * spots.length, H, sheet));
console.log(out + ' — монолиты на карте, крупный план');
