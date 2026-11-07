/* =============================================================================
   tools/preview.mjs — software-рендер модели и поз для проверки картинки
   -----------------------------------------------------------------------------
   Без браузера и без GPU: собираем риг настоящими три-модулями, берём вершины
   треугольников, проецируем и растеризуем в PNG (z-buffer + ламберт).
   Используется, чтобы глазами проверить модели и 1760 анимаций.
   Запуск: node shooter-2/tools/preview.mjs [--clip shoot] [--variant 1]
   ============================================================================= */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

/* ------------------------------- песочница ------------------------------ */
const sandbox = {
  console, Math, JSON, Map, Set, Array, Object, Number, String, Boolean, Date,
  isFinite, isNaN, Float32Array, Uint16Array, Uint32Array, Int32Array, Uint8Array,
  Infinity, NaN, performance: { now: () => Date.now() },
  document: { createElement: () => ({ getContext: () => fake2d(), width: 0, height: 0 }) },
  setTimeout: () => 0, clearTimeout: () => {}
};
sandbox.globalThis = sandbox; sandbox.window = sandbox;
vm.createContext(sandbox);
function fake2d() {
  const grad = { addColorStop() {} };
  return { fillStyle: '', strokeStyle: '', globalAlpha: 1, lineWidth: 1, globalCompositeOperation: 'source-over',
    fillRect() {}, beginPath() {}, arc() {}, fill() {}, stroke() {}, moveTo() {}, lineTo() {},
    save() {}, restore() {}, translate() {}, rotate() {}, closePath() {},
    createRadialGradient: () => grad, createLinearGradient: () => grad };
}
vm.runInContext(read('three.min.js'), sandbox, { filename: 'three.min.js' });
// CanvasTexture без DOM-канваса: подменяем на пустую текстуру
sandbox.THREE = Object.assign(Object.create(null), sandbox.THREE, {
  CanvasTexture: class { constructor() { this.isTexture = true; this.repeat = { set() {} }; } dispose() {} }
});
for (const m of ['data', 'model', 'anim', 'ik']) vm.runInContext(read(`src/${m}.js`), sandbox, { filename: m });
const SH2 = sandbox.SH2;
const D = SH2.data;
const T = sandbox.THREE;

/* ------------------------------ PNG-энкодер ---------------------------- */
function png(width, height, rgba) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0;
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  const chunks = [];
  const crcTable = (() => {
    const t = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c;
    }
    return t;
  })();
  const crc32 = (buf) => {
    let c = -1;
    for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    return (c ^ -1) >>> 0;
  };
  const chunk = (type, data) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
    const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
    return Buffer.concat([len, td, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  chunks.push(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  chunks.push(chunk('IHDR', ihdr));
  chunks.push(chunk('IDAT', idat));
  chunks.push(chunk('IEND', Buffer.alloc(0)));
  return Buffer.concat(chunks);
}

/* ------------------------------- растеризатор -------------------------- */
class Canvas {
  constructor(w, h, bg) {
    this.w = w; this.h = h;
    this.color = Buffer.alloc(w * h * 4);
    this.depth = new Float32Array(w * h).fill(Infinity);
    for (let i = 0; i < w * h; i++) {
      const grad = (i / w) / h;
      this.color[i * 4] = Math.round(bg[0] * (0.55 + grad * 0.5));
      this.color[i * 4 + 1] = Math.round(bg[1] * (0.55 + grad * 0.5));
      this.color[i * 4 + 2] = Math.round(bg[2] * (0.55 + grad * 0.5));
      this.color[i * 4 + 3] = 255;
    }
  }
  tri(ax, ay, az, bx, by, bz, cx, cy, cz, r, g, b, lambert) {
    const minX = Math.max(0, Math.floor(Math.min(ax, bx, cx)));
    const maxX = Math.min(this.w - 1, Math.ceil(Math.max(ax, bx, cx)));
    const minY = Math.max(0, Math.floor(Math.min(ay, by, cy)));
    const maxY = Math.min(this.h - 1, Math.ceil(Math.max(ay, by, cy)));
    if (minX > maxX || minY > maxY) return;
    const area = (bx - ax) * (cy - ay) - (cx - ax) * (by - ay);
    if (Math.abs(area) < 1e-9) return;
    const invArea = 1 / area;
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const px = x + 0.5, py = y + 0.5;
        const w0 = ((bx - ax) * (py - ay) - (px - ax) * (by - ay)) * invArea;
        const w1 = ((px - ax) * (cy - ay) - (cx - ax) * (py - ay)) * invArea;
        const w2 = 1 - w0 - w1;
        if (w0 < 0 || w1 < 0 || w2 < 0) continue;
        // барицентрика: w0 -> C, w1 -> B, w2 -> A для согласованности
        const z = az * w2 + bz * w1 + cz * w0;
        const idx = y * this.w + x;
        if (z >= this.depth[idx] || z <= 0) continue;
        this.depth[idx] = z;
        const lam = lambert === undefined ? 0.85 : lambert;
        this.color[idx * 4] = Math.min(255, r * lam);
        this.color[idx * 4 + 1] = Math.min(255, g * lam);
        this.color[idx * 4 + 2] = Math.min(255, b * lam);
        this.color[idx * 4 + 3] = 255;
      }
    }
  }
}

function renderScene(canvas, rootObj, camPos, camLook, fov, clipId, variant, phase) {
  const cam = new T.PerspectiveCamera(fov || 38, canvas.w / canvas.h, 0.05, 100);
  cam.position.copy(camPos);
  cam.lookAt(camLook);
  cam.updateMatrixWorld(true);
  rootObj.updateMatrixWorld(true);
  const projView = new T.Matrix4().multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse);
  const v = new T.Vector3();
  const meshes = [];
  rootObj.traverse((c) => { if (c.isMesh) meshes.push(c); });
  for (const mesh of meshes) {
    const geo = mesh.geometry;
    const pos = geo.attributes.position;
    const index = geo.index;
    const color = mesh.material.color || { r: 0.7, g: 0.7, b: 0.7 };
    const bi = process.argv.indexOf('--bright');
    const bright = bi >= 0 ? Number(process.argv[bi + 1]) : 1.6;
    const rgb = [Math.round(color.r * 255 * bright), Math.round(color.g * 255 * bright), Math.round(color.b * 255 * bright)];
    const count = index ? index.count : pos.count;
    for (let i = 0; i < count; i += 3) {
      const ia = index ? index.getX(i) : i;
      const ib = index ? index.getX(i + 1) : i + 1;
      const ic = index ? index.getX(i + 2) : i + 2;
      const pts = [];
      const world = [];
      let skip = false;
      for (const ii of [ia, ib, ic]) {
        v.set(pos.getX(ii), pos.getY(ii), pos.getZ(ii));
        mesh.localToWorld(v);
        world.push(v.clone());
        v.applyMatrix4(projView);
        if (v.z > 1 || v.z < -1) { skip = true; break; }
        const sx = (v.x * 0.5 + 0.5) * canvas.w;
        const sy = (-v.y * 0.5 + 0.5) * canvas.h;
        pts.push([sx, sy, v.z]);
      }
      if (skip) continue;
      // нормаль в мировых координатах + ламберт от двух источников
      const e1 = world[1].clone().sub(world[0]);
      const e2 = world[2].clone().sub(world[0]);
      const n = e1.cross(e2).normalize();
      const L1 = new T.Vector3(0.45, 0.8, 0.5).normalize();
      const L2 = new T.Vector3(-0.6, 0.25, -0.4).normalize();
      let lam = 0.55 + 0.75 * Math.max(0, n.dot(L1)) + 0.3 * Math.max(0, n.dot(L2));
      lam = Math.min(1.9, lam);
      canvas.tri(pts[0][0], pts[0][1], pts[0][2], pts[1][0], pts[1][1], pts[1][2],
        pts[2][0], pts[2][1], pts[2][2], rgb[0], rgb[1], rgb[2], lam);
    }
  }
}

/* ------------------------------ одиночный вид --------------------------- */
const single = process.argv.indexOf('--single') >= 0;
if (single) {
  const W = 640, H = 900;
  const canvas = new Canvas(W, H, [18, 22, 28]);
  const rig = SH2.model.buildRig('grunt', { scale: 1 });
  const gun = SH2.model.buildWeaponModel('rifle');
  gun.scale.setScalar(1.22);
  rig.bones.weapon.add(gun);
  rig.setGrips('rifle');
  const anim = new SH2.anim.Animator(rig, { smooth: 1000 });
  const clipArg = (() => { const i = process.argv.indexOf('--clip'); return i >= 0 ? process.argv[i + 1] : 'idle'; })();
  anim.poseAt(clipArg, 0, 0.3);
  const raise = clipArg === 'aim' || clipArg === 'shoot' ? 1 : 0.35;
  // несколько кадров автоподстройки, чтобы стопы встали на пол
  for (let i = 0; i < 12; i++) { anim.poseAt(clipArg, 0, 0.3); SH2.anim.groundLock(rig, anim, 1); }
  new SH2.ik.ArmIK(rig).update({ raise, tilt: 0 });
  rig.root.rotation.y = Number(process.argv[process.argv.indexOf('--yaw') + 1] || 0.3);
  rig.root.updateMatrixWorld(true);
  // рамка вокруг модели, чтобы видеть пропорции
  renderScene(canvas, rig.root, new T.Vector3(0.9, 1.05, 3.6), new T.Vector3(0, 0.95, 0), 34);
  fs.writeFileSync(path.join(root, 'docs', 'preview-single.png'), png(W, H, canvas.color));
  console.log('docs/preview-single.png');
  process.exit(0);
}

/* --------------------------------- главное ------------------------------ */
const args = process.argv.slice(2);
const arg = (name, def) => {
  const i = args.indexOf('--' + name);
  return i >= 0 ? args[i + 1] : def;
};
const outDir = path.join(root, 'docs');
fs.mkdirSync(outDir, { recursive: true });

// 1) Обзорный лист: модель в 6 позах
{
  const W = 1500, H = 1000;
  const canvas = new Canvas(W, H, [16, 22, 30]);
  const poses = [['idle', 0], ['walk', 0], ['run', 1], ['aim', 0], ['crouch', 0], ['die', 3]];
  const cellW = W / 3, cellH = H / 2;
  poses.forEach((p, i) => {
    const rig = SH2.model.buildRig('grunt', { scale: 1 });
    const weapon = SH2.model.buildWeaponModel('rifle');
    weapon.scale.setScalar(1.22);
    rig.bones.weapon.add(weapon);
    rig.setGrips('rifle');
    const anim = new SH2.anim.Animator(rig, { smooth: 1000 });
    for (let k = 0; k < 20; k++) { anim.poseAt(p[0], p[1], 0.35); SH2.anim.groundLock(rig, anim, p[0] === 'die' ? 0.3 : 1); }
    new SH2.ik.ArmIK(rig).update({ raise: (p[0] === 'aim' || p[0] === 'shoot') ? 1 : 0.3, tilt: 0 });
    rig.root.rotation.y = 0.55;
    const col = i % 3, row = Math.floor(i / 3);
    const cam = new T.Vector3(col * cellW + cellW * 0.5, row * cellH + cellH * 0.5, 0);
    const camPos = new T.Vector3(2.4, 1.15, 3.4);
    rig.root.position.set(0, 0, 0);
    // сдвигаем модель в ячейку: рендерим по одной во временный холст
    const tmp = new Canvas(cellW, cellH, [14, 20, 28]);
    renderScene(tmp, rig.root, camPos, new T.Vector3(0, 1.0, 0), 34, p[0], p[1], 0.35);
    for (let y = 0; y < cellH; y++) {
      for (let x = 0; x < cellW; x++) {
        const src = (y * cellW + x) * 4;
        const dst = ((row * cellH + y) * W + (col * cellW + x)) * 4;
        canvas.color[dst] = tmp.color[src];
        canvas.color[dst + 1] = tmp.color[src + 1];
        canvas.color[dst + 2] = tmp.color[src + 2];
        canvas.color[dst + 3] = 255;
      }
    }
  });
  fs.writeFileSync(path.join(outDir, 'preview-poses.png'), png(W, H, canvas.color));
  console.log('docs/preview-poses.png — 6 поз (idle, walk, run, aim, crouch, death)');
}

// 2) Все 20 анимаций одной части (chest) — полоса кадров
{
  const cols = 5, rows = 4, cell = 300;
  const W = cols * cell, H = rows * cell;
  const canvas = new Canvas(W, H, [14, 18, 24]);
  D.CLIPS.forEach((clip, i) => {
    const rig = SH2.model.buildRig('grunt', { scale: 1 });
    rig.setGrips('rifle');
    const gw = SH2.model.buildWeaponModel('rifle'); gw.scale.setScalar(1.22); rig.bones.weapon.add(gw);
    const anim = new SH2.anim.Animator(rig, { smooth: 1000 });
    for (let k = 0; k < 20; k++) { anim.poseAt(clip.id, 0, 0.4); SH2.anim.groundLock(rig, anim, 1); }
    new SH2.ik.ArmIK(rig).update({ raise: (clip.id === 'aim' || clip.id === 'shoot') ? 1 : 0.3, tilt: 0 });
    rig.root.rotation.y = 0.7;
    const tmp = new Canvas(cell, cell, [12, 16, 22]);
    renderScene(tmp, rig.root, new T.Vector3(1.9, 1.15, 2.6), new T.Vector3(0, 1.0, 0), 34);
    const col = i % cols, row = Math.floor(i / cols);
    for (let y = 0; y < cell; y++) {
      for (let x = 0; x < cell; x++) {
        const src = (y * cell + x) * 4;
        const dst = ((row * cell + y) * W + (col * cell + x)) * 4;
        canvas.color[dst] = tmp.color[src];
        canvas.color[dst + 1] = tmp.color[src + 1];
        canvas.color[dst + 2] = tmp.color[src + 2];
      }
    }
  });
  fs.writeFileSync(path.join(outDir, 'preview-clips.png'), png(W, H, canvas.color));
  console.log('docs/preview-clips.png — все 20 анимаций (вариант «стандарт»)');
}

// 3) Четыре варианта одной анимации (walk)
{
  const cell = 320, W = cell * 4, H = cell;
  const canvas = new Canvas(W, H, [14, 18, 24]);
  D.VARIANTS.forEach((variant, i) => {
    const rig = SH2.model.buildRig('grunt', { scale: 1 });
    rig.setGrips('rifle');
    const gw = SH2.model.buildWeaponModel('rifle'); gw.scale.setScalar(1.22); rig.bones.weapon.add(gw);
    const anim = new SH2.anim.Animator(rig, { smooth: 1000 });
    for (let k = 0; k < 20; k++) { anim.poseAt('walk', i, 0.3); SH2.anim.groundLock(rig, anim, 1); }
    new SH2.ik.ArmIK(rig).update({ raise: 0.3, tilt: 0 });
    rig.root.rotation.y = 0.6;
    const tmp = new Canvas(cell, cell, [12, 16, 22]);
    renderScene(tmp, rig.root, new T.Vector3(2.0, 1.2, 2.7), new T.Vector3(0, 1.0, 0), 34);
    for (let y = 0; y < cell; y++) {
      for (let x = 0; x < cell; x++) {
        const src = (y * cell + x) * 4;
        const dst = (y * W + (i * cell + x)) * 4;
        canvas.color[dst] = tmp.color[src];
        canvas.color[dst + 1] = tmp.color[src + 1];
        canvas.color[dst + 2] = tmp.color[src + 2];
      }
    }
  });
  fs.writeFileSync(path.join(outDir, 'preview-variants.png'), png(W, H, canvas.color));
  console.log('docs/preview-variants.png — 4 варианта ходьбы');
}

// 4) Боевые типы и оружие
{
  const cell = 300, W = cell * 6, H = cell;
  const canvas = new Canvas(W, H, [14, 18, 24]);
  D.ENEMY_TYPES.concat([{ id: 'player' }]).forEach((type, i) => {
    const rig = type.id === 'player'
      ? SH2.model.buildRig('grunt', { scale: 1, player: true })
      : SH2.model.buildRig(type.id, { scale: 1 });
    const wid = type.id === 'player' ? 'smg' : (D.ENEMY_BY_ID[type.id] || {}).weapon || 'rifle';
    const weapon = SH2.model.buildWeaponModel(wid);
    weapon.scale.setScalar(1.22);
    rig.bones.weapon.add(weapon);
    rig.setGrips(wid);
    const anim = new SH2.anim.Animator(rig, { smooth: 1000 });
    anim.poseAt('aim', 0, 0.5);
    new SH2.ik.ArmIK(rig).update({ raise: 1, tilt: 0 });
    rig.root.rotation.y = 0.5;
    const tmp = new Canvas(cell, cell, [12, 16, 22]);
    renderScene(tmp, rig.root, new T.Vector3(2.0, 1.25, 2.8), new T.Vector3(0, 1.0, 0), 34);
    for (let y = 0; y < cell; y++) {
      for (let x = 0; x < cell; x++) {
        const src = (y * cell + x) * 4;
        const dst = (y * W + (i * cell + x)) * 4;
        canvas.color[dst] = tmp.color[src];
        canvas.color[dst + 1] = tmp.color[src + 1];
        canvas.color[dst + 2] = tmp.color[src + 2];
      }
    }
  });
  fs.writeFileSync(path.join(outDir, 'preview-enemies.png'), png(W, H, canvas.color));
  console.log('docs/preview-enemies.png — боевые типы и оружие');
}
