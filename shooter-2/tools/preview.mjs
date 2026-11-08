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
// порядок важен: outline/gunblueprints/soldier подключаются ДО model
for (const m of ['data', 'outline', 'gunblueprints', 'soldier', 'level', 'model', 'anim', 'ik', 'viewmodel']) {
  vm.runInContext(read(`src/${m}.js`), sandbox, { filename: m });
}
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

/* --------------------- кадр от первого лица ---------------------------- */
// node tools/preview.mjs --fps rifle -> docs/preview-fp.png
if (process.argv.indexOf('--fps') >= 0) {
  const id = process.argv[process.argv.indexOf('--fps') + 1] || 'rifle';
  const adsMode = process.argv.indexOf('--ads') >= 0;
  // --portrait: узкий телефонный кадр (по умолчанию 16:9). По нему видно,
  // не лезет ли оружие в центр экрана и не уезжает ли приклад за край.
  const portrait = process.argv.indexOf('--portrait') >= 0;
  const W = portrait ? 390 : 960, H = portrait ? 844 : 560;
  const cam = new T.PerspectiveCamera(78, W / H, 0.05, 320);
  cam.rotation.order = 'YXZ';
  cam.position.set(0, 1.62, 0);
  cam.rotation.set(0, Math.PI, 0);
  cam.updateMatrixWorld(true);
  const vm = new SH2.viewmodel.ViewModel(cam);
  vm.setWeapon(id);
  // даём позе устояться: оружие плавно выезжает в кадр и в ADS
  if (adsMode) { cam.fov = 48; cam.updateProjectionMatrix(); }
  for (let i = 0; i < 90; i++) vm.update(1 / 60, { moving: 0, sprint: false, ads: adsMode });
  cam.updateMatrixWorld(true);
  const canvas = new Canvas(W, H, [70, 68, 62]);
  // сцена: настоящий уровень вокруг глаза игрока — карта «Склады»
  const lvl = SH2.model.buildLevel('depot');
  renderScene(canvas, lvl.group, cam.position, cam.position.clone().add(new T.Vector3(0, -1, 6)), 78);
  // оружие от первого лица: рисуем вторым проходом, всегда поверх мира
  // оружие рисуем с тем же FOV, что и камера: при прицеливании он уже (48)
  renderScene(canvas, vm.root, cam.position, cam.position.clone().add(new T.Vector3(0, 0, 6)), cam.fov);
  const file = portrait ? 'preview-fp-portrait.png'
    : (adsMode ? 'preview-fp-ads.png' : 'preview-fp.png');
  fs.writeFileSync(path.join(root, 'docs', file), png(W, H, canvas.color));
  console.log('docs/' + file + ' — ' + id + ' от первого лица' + (adsMode ? ' (прицел)' : ''));
  process.exit(0);
}

/* ------------------------------ лист оружия ----------------------------- */
// node tools/preview.mjs --guns  -> docs/preview-guns.png (5 стволов, вид сбоку)
// автоподбор камеры под габариты объекта: силуэт занимает кадр
function fitCamera(obj, opts) {
  const o = opts || {};
  obj.updateMatrixWorld(true);
  const box = new T.Box3().setFromObject(obj);
  const size = new T.Vector3(); box.getSize(size);
  const center = new T.Vector3(); box.getCenter(center);
  const maxDim = Math.max(size.x, size.y, size.z);
  const dir = o.dir || new T.Vector3(1.6, 0.5, 0.22).normalize();
  // единый масштаб для серии: не меньше опорного габарита (пистолет не «раздувается»)
  const ref = o.refDim || maxDim;
  const dist = Math.max(maxDim, ref) * (o.k || 1.5);
  const pos = center.clone().addScaledVector(dir, dist);
  return { pos, look: center, fov: o.fov || 26 };
}

if (process.argv.indexOf('--guns') >= 0) {
  const ids = ['pistol', 'revolver', 'machinepistol', 'smg', 'pdw', 'carbine', 'rifle',
    'bullpup', 'shotgun', 'tacshotgun', 'lmg', 'dmr', 'sniper', 'launcher', 'railgun'];
  const cell = 620, W = cell, H = cell * ids.length * 0.42;
  const ch = Math.round(H / ids.length);
  const canvas = new Canvas(W, H, [16, 20, 26]);
  ids.forEach((id, i) => {
    const g = SH2.model.buildWeaponModel(id);
    const tmp = new Canvas(W, ch, [16, 20, 26]);
    const fit = fitCamera(g, { dir: new T.Vector3(1.0, 0.42, 0.1), k: 1.35, fov: 22, refDim: 0.95 });
    renderScene(tmp, g, fit.pos, fit.look, fit.fov);
    for (let y = 0; y < ch; y++) {
      for (let x = 0; x < W; x++) {
        const src = (y * W + x) * 4;
        const dst = ((i * ch + y) * W + x) * 4;
        canvas.color[dst] = tmp.color[src];
        canvas.color[dst + 1] = tmp.color[src + 1];
        canvas.color[dst + 2] = tmp.color[src + 2];
        canvas.color[dst + 3] = 255;
      }
    }
  });
  fs.writeFileSync(path.join(root, 'docs', 'preview-guns.png'), png(W, H, canvas.color));
  console.log('docs/preview-guns.png — ' + ids.length + ' стволов по чертежам: ' + ids.join(', '));
  process.exit(0);
}

/* --------------------------- карта-схема ------------------------------- */
// node tools/preview.mjs --plan <id> -> docs/plan-<id>.png
// План сверху в пиксельной точности: полигоны зданий, проёмы-окна, точки
// опоры с вектором нормали, сектор обстрела, зона укрытия, дороги и спавны.
if (process.argv.indexOf('--plan') >= 0) {
  const mapId = process.argv[process.argv.indexOf('--plan') + 1] || 'depot';
  const lvl = SH2.model.buildLevel(mapId);
  const M = lvl.map;
  const W = 1100, H = 1100;
  const half = M.size / 2;
  const k = W / M.size;
  const canvas = new Canvas(W, H, [13, 15, 19]);
  const RGB = (i, r, g, b) => { canvas.color[i] = r; canvas.color[i + 1] = g; canvas.color[i + 2] = b; canvas.color[i + 3] = 255; };
  const blend = (i, r, g, b, a) => {
    canvas.color[i] = canvas.color[i] * (1 - a) + r * a;
    canvas.color[i + 1] = canvas.color[i + 1] * (1 - a) + g * a;
    canvas.color[i + 2] = canvas.color[i + 2] * (1 - a) + b * a;
    canvas.color[i + 3] = 255;
  };
  const px = (x) => Math.round((x + half) * k);
  const pz = (z) => Math.round((z + half) * k);
  const at = (X, Y) => (Y * W + X) * 4;
  const plot = (X, Y, r, g, b, a) => {
    if (X < 0 || Y < 0 || X >= W || Y >= H) return;
    const i = at(X, Y);
    if (a === undefined) RGB(i, r, g, b); else blend(i, r, g, b, a);
  };
  // линия в экранных пикселях (Брезенхем) — без «пунктира» из-за шага сетки
  const linePx = (x0, y0, x1, y1, r, g, b, a) => {
    let x = Math.round(x0), y = Math.round(y0);
    const xe = Math.round(x1), ye = Math.round(y1);
    const dx = Math.abs(xe - x), dy = Math.abs(ye - y);
    const sx = x < xe ? 1 : -1, sy = y < ye ? 1 : -1;
    let err = dx - dy;
    for (let guard = 0; guard < 8000; guard++) {
      plot(x, y, r, g, b, a);
      if (x === xe && y === ye) break;
      const e2 = err * 2;
      if (e2 > -dy) { err -= dy; x += sx; }
      if (e2 < dx) { err += dx; y += sy; }
    }
  };
  const seg = (x0, z0, x1, z1, r, g, b, a) => linePx(px(x0), pz(z0), px(x1), pz(z1), r, g, b, a);
  // заливка полигона по строкам (пиксельная точность)
  const fillPoly = (pts, r, g, b, a) => {
    const pxs = pts.map((p) => [px(p[0]), pz(p[1])]);
    let minY = 1e9, maxY = -1e9;
    pxs.forEach((p) => { minY = Math.min(minY, p[1]); maxY = Math.max(maxY, p[1]); });
    minY = Math.max(0, Math.floor(minY)); maxY = Math.min(H - 1, Math.ceil(maxY));
    for (let y = minY; y <= maxY; y++) {
      const xs = [];
      for (let i = 0, j = pxs.length - 1; i < pxs.length; j = i++) {
        const a1 = pxs[i], b1 = pxs[j];
        if ((a1[1] > y) !== (b1[1] > y)) {
          xs.push(a1[0] + (y - a1[1]) * (b1[0] - a1[0]) / (b1[1] - a1[1]));
        }
      }
      xs.sort((m, n) => m - n);
      for (let i = 0; i + 1 < xs.length; i += 2) {
        for (let x = Math.ceil(xs[i]); x <= Math.floor(xs[i + 1]); x++) plot(x, y, r, g, b, a);
      }
    }
  };
  const rectPx = (cx, cz, hw, hd, r, g, b, a) => fillPoly([
    [cx - hw, cz - hd], [cx + hw, cz - hd], [cx + hw, cz + hd], [cx - hw, cz + hd]
  ], r, g, b, a);
  const dot = (x, z, r, g, b, rad) => {
    const R = rad || 3;
    for (let dx = -R; dx <= R; dx++) for (let dz = -R; dz <= R; dz++) {
      if (dx * dx + dz * dz <= R * R) plot(px(x) + dx, pz(z) + dz, r, g, b);
    }
  };
  const arc = (x, z, rad, a0, a1, r, g, b, step) => {
    const st = step || 0.02;
    for (let a = a0; a <= a1; a += st) plot(px(x + Math.cos(a) * rad), pz(z + Math.sin(a) * rad), r, g, b, 0.85);
  };
  const arrow = (x0, z0, x1, z1, r, g, b) => {
    linePx(px(x0), pz(z0), px(x1), pz(z1), r, g, b, 0.95);
    const a = Math.atan2(z1 - z0, x1 - x0);
    for (const s2 of [2.7, -2.7]) seg(x1, z1, x1 - Math.cos(a + s2) * 1.6, z1 - Math.sin(a + s2) * 1.6, r, g, b, 0.95);
  };

  // фон: земля с виньеткой. --art даёт тёплую «рисованную» землю.
  const art = process.argv.indexOf('--art') >= 0;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const d = Math.hypot(x / W - 0.5, y / H - 0.5) * 2;
      const t = Math.max(0, 1 - d * 0.9);
      if (art) {
        // сухая земля: пятна глины и пепла, край темнее
        const n = ((x * 37 + y * 91) % 97) / 97;
        RGB(at(x, y), Math.round(52 + 18 * t + n * 10), Math.round(45 + 14 * t + n * 8),
          Math.round(35 + 9 * t + n * 6));
      } else {
        RGB(at(x, y), 26 + 14 * t, 27 + 15 * t, 30 + 16 * t);
      }
    }
  }
  // сетка 10 м и рамка карты
  for (let g2 = -half; g2 <= half + 0.01; g2 += 10) {
    seg(-half, g2, half, g2, 46, 50, 58, 0.6);
    seg(g2, -half, g2, half, 46, 50, 58, 0.6);
  }
  seg(-half, -half, half, -half, 90, 96, 110, 0.9);
  seg(half, -half, half, half, 90, 96, 110, 0.9);
  seg(half, half, -half, half, 90, 96, 110, 0.9);
  seg(-half, half, -half, -half, 90, 96, 110, 0.9);

  // дороги: полосы с обочиной и осевой разметкой
  (M.road || []).forEach((rd) => {
    const ca = Math.cos(rd.a || 0), sa = Math.sin(rd.a || 0);
    const dx = ca * rd.l / 2, dz = sa * rd.l / 2;
    const quad = (w) => [
      [rd.x - dx - sa * w, rd.z - dz + ca * w], [rd.x + dx - sa * w, rd.z + dz + ca * w],
      [rd.x + dx + sa * w, rd.z + dz - ca * w], [rd.x - dx + sa * w, rd.z - dz - ca * w]
    ];
    fillPoly(quad(rd.w / 2 + 0.7), 44, 42, 38, 1);
    fillPoly(quad(rd.w / 2), 56, 52, 45, 1);
    // осевая пунктиром
    const steps = Math.floor(rd.l / 3);
    for (let i = 0; i < steps; i += 2) {
      const u0 = -rd.l / 2 + i * 3, u1 = u0 + 1.8;
      seg(rd.x + ca * u0, rd.z + sa * u0, rd.x + ca * u1, rd.z + sa * u1, 150, 132, 80, 0.85);
    }
  });

  // здания: заливка пола, стены, окна, «крыша» пунктиром
  (M.buildings || []).forEach((b) => {
    fillPoly(b.poly, 74, 70, 58, 1);
    const pb = SH2.level.planBounds(b.poly);
    // внутренние перегородки: делим прямоугольник на 2-3 отсека
    const rooms = pb.hw > pb.hd ? 2 : 2;
    for (let i = 1; i < rooms; i++) {
      const t = i / rooms;
      if (pb.hw > pb.hd) seg(pb.cx - pb.hw + pb.hw * 2 * t, pb.cz - pb.hd, pb.cx - pb.hw + pb.hw * 2 * t, pb.cz + pb.hd, 118, 108, 88, 0.9);
      else seg(pb.cx - pb.hw, pb.cz - pb.hd + pb.hd * 2 * t, pb.cx + pb.hw, pb.cz - pb.hd + pb.hd * 2 * t, 118, 108, 88, 0.9);
    }
    // стены — толстые линии по контуру
    for (let i = 0; i < b.poly.length; i++) {
      const a1 = b.poly[i], c1 = b.poly[(i + 1) % b.poly.length];
      for (let d = -2; d <= 2; d++) {
        linePx(px(a1[0]), pz(a1[1]) + d, px(c1[0]), pz(c1[1]) + d, 214, 196, 146, 1);
      }
    }
    // окна
    (SH2.model.windowHoles(pb, b) || []).forEach((h) => {
      const cx = pb.cx + (h.du0 + h.du1) / 2, cz = pb.cz + (h.dv0 + h.dv1) / 2;
      const wide = (h.du1 - h.du0) > (h.dv1 - h.dv0);
      for (let o = -0.62; o <= 0.62; o += 0.06) {
        if (wide) plot(px(cx + o), pz(cz), 122, 224, 255); else plot(px(cx), pz(cz + o), 122, 224, 255);
      }
    });
  });

  // коллайдеры-пропсы: полупрозрачная заливка + контур + точка опоры
  const KIND = {
    barrier: [190, 118, 86], sandbag: [176, 166, 104], barrel: [150, 116, 84],
    rock: [140, 140, 140], stack: [116, 138, 160], container: [86, 186, 156],
    truck: [140, 122, 196], lamp: [248, 224, 138], tower: [124, 168, 226],
    watchtower: [124, 168, 226], wreck: [168, 114, 114], fence: [176, 150, 102],
    trench: [122, 102, 74], crates: [184, 146, 88], rubble: [126, 120, 106],
    netpost: [104, 122, 84]
  };
  lvl.colliders.forEach((c) => {
    if (c.kind === 'building') return;
    const col = KIND[c.kind] || [180, 180, 180];
    rectPx(c.x, c.z, c.hw, c.hd, col[0], col[1], col[2], 0.32);
    seg(c.x - c.hw, c.z - c.hd, c.x + c.hw, c.z - c.hd, col[0], col[1], col[2], 0.95);
    seg(c.x + c.hw, c.z - c.hd, c.x + c.hw, c.z + c.hd, col[0], col[1], col[2], 0.95);
    seg(c.x + c.hw, c.z + c.hd, c.x - c.hw, c.z + c.hd, col[0], col[1], col[2], 0.95);
    seg(c.x - c.hw, c.z + c.hd, c.x - c.hw, c.z - c.hd, col[0], col[1], col[2], 0.95);
  });

  // точки опоры: точка + нормаль + сектор обстрела + зона укрытия
  lvl.colliders.forEach((c) => {
    if (!c.anchor) return;
    const ax = c.anchor.x, az = c.anchor.z;
    const base = Math.atan2(c.normalZ, c.normalX);
    // укрытие — с обратной стороны от нормали (за препятствием)
    arc(ax, az, 1.05, base + Math.PI * 0.5, base + Math.PI * 1.5, 90, 176, 236, 0.04);
    // сектор обстрела
    arc(ax, az, 3.6, base - Math.PI / 3, base + Math.PI / 3, 232, 96, 72, 0.03);
    seg(ax, az, ax + Math.cos(base) * 3.6, az + Math.sin(base) * 3.6, 232, 96, 72, 0.5);
    arrow(c.x + c.normalX * 0.4, c.z + c.normalZ * 0.4, ax, az, 255, 198, 96);
    dot(ax, az, 255, 160, 60, 2);
  });

  // спавны, эвакуация, ящики
  (M.spawns || []).forEach((p) => {
    for (let d = -6; d <= 6; d++) {
      plot(px(p[0]) + d, pz(p[1]), 96, 240, 132);
      plot(px(p[0]), pz(p[1]) + d, 96, 240, 132);
    }
  });
  (M.extracts || []).forEach((p) => {
    arc(p.x, p.z, p.r, 0, Math.PI * 2, 116, 255, 214, 0.01);
    arc(p.x, p.z, p.r - 0.5, 0, Math.PI * 2, 60, 160, 140, 0.02);
  });
  (M.boxes || []).forEach((p) => arc(p.x, p.z, p.r, 0, Math.PI * 2, 255, 205, 90, 0.02));

  if (art) {
    // ---- заголовок и легенда: мини-шрифт 5×7, без внешних файлов ----
    const GLYPHS = {
      'А': ['01110','10001','10001','11111','10001','10001','10001'],
      'Б': ['11111','10000','10000','11110','10001','10001','11110'],
      'В': ['11110','10001','10001','11110','10001','10001','11110'],
      'Г': ['11111','10000','10000','10000','10000','10000','10000'],
      'Д': ['00111','01001','01001','01001','01001','11111','10001'],
      'Е': ['11111','10000','10000','11110','10000','10000','11111'],
      'Ё': ['01010','00000','11111','10000','11110','10000','11111'],
      'Ж': ['10101','10101','10101','11111','10101','10101','10101'],
      'З': ['01110','10001','00001','00110','00001','10001','01110'],
      'И': ['10001','10011','10011','10101','11001','11001','10001'],
      'Й': ['01010','01110','10001','10011','11001','10001','10001'],
      'К': ['10001','10010','10100','11000','10100','10010','10001'],
      'Л': ['00111','01001','01001','01001','01001','11001','10001'],
      'М': ['10001','11011','10101','10101','10001','10001','10001'],
      'Н': ['10001','10001','10001','11111','10001','10001','10001'],
      'О': ['01110','10001','10001','10001','10001','10001','01110'],
      'П': ['11111','10001','10001','10001','10001','10001','10001'],
      'Р': ['11110','10001','10001','11110','10000','10000','10000'],
      'С': ['01110','10001','10000','10000','10000','10001','01110'],
      'Т': ['11111','00100','00100','00100','00100','00100','00100'],
      'У': ['10001','10001','10001','01110','00100','00100','00100'],
      'Ф': ['00100','01110','10101','10101','10101','01110','00100'],
      'Х': ['10001','10001','01010','00100','01010','10001','10001'],
      'Ц': ['10010','10010','10010','10010','10010','11111','00001'],
      'Ч': ['10001','10001','10001','01111','00001','00001','00001'],
      'Ш': ['10101','10101','10101','10101','10101','10101','11111'],
      'Щ': ['10101','10101','10101','10101','10101','11111','00001'],
      'Ъ': ['11000','01000','01000','01110','01001','01001','01110'],
      'Ы': ['10001','10001','10001','11101','10011','10011','11101'],
      'Ь': ['10000','10000','10000','11110','10001','10001','11110'],
      'Э': ['01110','10001','00001','00111','00001','10001','01110'],
      'Ю': ['10110','11001','11001','11001','11001','11001','10110'],
      'Я': ['01111','10001','10001','01111','00101','01001','10001'],
      'A': ['01110','10001','10001','11111','10001','10001','10001'],
      'B': ['11110','10001','10001','11110','10001','10001','11110'],
      'C': ['01110','10001','10000','10000','10000','10001','01110'],
      'D': ['11110','10001','10001','10001','10001','10001','11110'],
      'E': ['11111','10000','10000','11110','10000','10000','11111'],
      'F': ['11111','10000','10000','11110','10000','10000','10000'],
      'G': ['01110','10001','10000','10111','10001','10001','01110'],
      'H': ['10001','10001','10001','11111','10001','10001','10001'],
      'I': ['01110','00100','00100','00100','00100','00100','01110'],
      'K': ['10001','10010','10100','11000','10100','10010','10001'],
      'L': ['10000','10000','10000','10000','10000','10000','11111'],
      'M': ['10001','11011','10101','10101','10001','10001','10001'],
      'N': ['10001','11001','10101','10011','10001','10001','10001'],
      'O': ['01110','10001','10001','10001','10001','10001','01110'],
      'P': ['11110','10001','10001','11110','10000','10000','10000'],
      'R': ['11110','10001','10001','11110','10100','10010','10001'],
      'S': ['01111','10000','10000','01110','00001','00001','11110'],
      'T': ['11111','00100','00100','00100','00100','00100','00100'],
      'U': ['10001','10001','10001','10001','10001','10001','01110'],
      'V': ['10001','10001','10001','10001','10001','01010','00100'],
      'W': ['10001','10001','10001','10101','10101','11011','10001'],
      'X': ['10001','01010','00100','00100','00100','01010','10001'],
      'Y': ['10001','01010','00100','00100','00100','00100','00100'],
      'Z': ['11111','00001','00010','00100','01000','10000','11111'],
      '0': ['01110','10001','10011','10101','11001','10001','01110'],
      '1': ['00100','01100','00100','00100','00100','00100','01110'],
      '2': ['01110','10001','00001','00110','01000','10000','11111'],
      '3': ['11110','00001','00001','01110','00001','00001','11110'],
      '4': ['00010','00110','01010','10010','11111','00010','00010'],
      '5': ['11111','10000','11110','00001','00001','10001','01110'],
      '6': ['00110','01000','10000','11110','10001','10001','01110'],
      '7': ['11111','00001','00010','00100','01000','01000','01000'],
      '8': ['01110','10001','10001','01110','10001','10001','01110'],
      '9': ['01110','10001','10001','01111','00001','00010','01100'],
      '-': ['00000','00000','00000','11111','00000','00000','00000'],
      '.': ['00000','00000','00000','00000','00000','01100','01100'],
      ',': ['00000','00000','00000','00000','01100','00100','01000'],
      ':': ['00000','01100','01100','00000','01100','01100','00000'],
      '/': ['00001','00010','00010','00100','01000','01000','10000'],
      '°': ['01100','10010','10010','01100','00000','00000','00000'],
      ' ': ['00000','00000','00000','00000','00000','00000','00000']
    };
    const text = (str, x0, y0, scale, r, g, b) => {
      let cx = x0;
      for (const ch of String(str).toUpperCase()) {
        const gl = GLYPHS[ch];
        if (!gl) { cx += 6 * scale; continue; }
        for (let row = 0; row < 7; row++) {
          for (let col = 0; col < 5; col++) {
            if (gl[row][col] !== '1') continue;
            for (let dy = 0; dy < scale; dy++) for (let dx = 0; dx < scale; dx++) {
              plot(cx + col * scale + dx, y0 + row * scale + dy, r, g, b);
            }
          }
        }
        cx += 6 * scale;
      }
      return cx;
    };
    const title = {
      depot: 'СКЛАДЫ',
      convoy: 'КАРАВАН',
      harbor: 'ПОРТ'
    }[mapId] || mapId.toUpperCase();
    // верхняя плашка
    for (let y = 0; y < 54; y++) for (let x = 0; x < W; x++) blend(at(x, y), 12, 13, 16, 0.86);
    text('СЕКТОР ПЕПЕЛ / ' + title, 18, 12, 3, 246, 214, 150);
    text('ПЛАН СЕКТОРА: ' + lvl.colliders.length + ' ОБЪЕКТОВ', 18, 38, 2, 190, 180, 160);
    // легенда снизу
    const LY = H - 132;
    for (let y = LY - 8; y < H; y++) for (let x = 0; x < W; x++) blend(at(x, y), 10, 11, 14, 0.90);
    const legend = [
      [[214, 196, 146], 'СТЕНЫ ЗДАНИЙ'],
      [[122, 224, 255], 'ОКНА'],
      [[255, 160, 60], 'ТОЧКИ ОПОРЫ'],
      [[255, 198, 96], 'ВЕКТОР-НОРМАЛЬ'],
      [[232, 96, 72], 'СЕКТОР ОГНЯ'],
      [[90, 176, 236], 'ЗОНА УКРЫТИЯ'],
      [[86, 186, 156], 'КОНТЕЙНЕР'],
      [[140, 122, 196], 'ФУРА']
    ];
    legend.forEach((item, i) => {
      const col = i % 4, row = Math.floor(i / 4);
      const x = 30 + col * 270, y = LY + 16 + row * 40;
      for (let dy = 0; dy < 14; dy++) for (let dx = 0; dx < 14; dx++) plot(x + dx, y + dy, item[0][0], item[0][1], item[0][2]);
      text(item[1], x + 22, y + 4, 2, 210, 205, 195);
    });
  }

  fs.writeFileSync(path.join(root, 'docs', 'plan-' + mapId + (art ? '-art' : '') + '.png'), png(W, H, canvas.color));
  console.log('docs/plan-' + mapId + (art ? '-art' : '') + '.png — ' + lvl.colliders.length + ' коллайдеров, ' +
    lvl.props + ' объектов, ' + lvl.colliders.filter((c) => c.anchor).length + ' точек опоры');
  process.exit(0);
}

/* ------------------------------ вид на карту ----------------------------- */
// node tools/preview.mjs --map depot [--cam x,y,z] [--look x,y,z]
// Собирает уровень настоящими полигонами и рисует общий вид (проверка карты).
if (process.argv.indexOf('--map') >= 0) {
  const mapId = process.argv[process.argv.indexOf('--map') + 1] || 'depot';
  const num = (name, def) => {
    const i = process.argv.indexOf('--' + name);
    if (i < 0) return def;
    return process.argv[i + 1].split(',').map(Number);
  };
  const W = Number(process.argv[process.argv.indexOf('--w') + 1]) || 1200;
  const H = Number(process.argv[process.argv.indexOf('--h') + 1]) || 760;
  const lvl = SH2.model.buildLevel(mapId);
  // пару бойцов и оружие для масштаба
  const poses = [[-6, 4, 0.6, 'rifle'], [8, 10, 2.1, 'dmr'], [-14, -8, 3.6, 'shotgun']];
  poses.forEach((p) => {
    const rig = SH2.model.buildRig('grunt', { scale: 1 });
    const w = SH2.model.buildWeaponModel(p[3]);
    w.scale.setScalar(1.22);
    rig.bones.weapon.add(w);
    rig.setGrips(p[3]);
    const anim = new SH2.anim.Animator(rig, { smooth: 1000 });
    for (let k = 0; k < 10; k++) { anim.poseAt('aim', 0, 0.3); SH2.anim.groundLock(rig, anim, 1); }
    new SH2.ik.ArmIK(rig).update({ raise: 1, tilt: 0 });
    rig.root.position.set(p[0], 0, p[1]);
    rig.root.rotation.y = p[2];
    lvl.group.add(rig.root);
  });
  const canvas = new Canvas(W, H, [22, 26, 34]);
  const camPos = new T.Vector3(...num('cam', [26, 26, 34]));
  const camLook = new T.Vector3(...num('look', [-2, 2, -4]));
  renderScene(canvas, lvl.group, camPos, camLook, 46);
  const out = num('out', null);
  const file = 'preview-map-' + mapId + '.png';
  fs.writeFileSync(path.join(root, 'docs', file), png(W, H, canvas.color));
  console.log('docs/' + file, '| коллайдеров:', lvl.colliders.length);
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

// 2.5) Оружие крупным планом: чертёж -> объём (для README/доков)
{
  const ids = ['rifle', 'dmr'];
  const W = 1200, H = 440;
  const canvas = new Canvas(W, H, [14, 18, 24]);
  ids.forEach((id, i) => {
    const g = SH2.model.buildWeaponModel(id);
    const tmp = new Canvas(W, H / 2, [14, 18, 24]);
    const fit = fitCamera(g, { dir: new T.Vector3(1.0, 0.40, 0.12), k: 1.30, fov: 22, refDim: 0.95 });
    renderScene(tmp, g, fit.pos, fit.look, fit.fov);
    const off = i * (H / 2);
    for (let y = 0; y < H / 2; y++) {
      for (let x = 0; x < W; x++) {
        const src = (y * W + x) * 4;
        const dst = ((off + y) * W + x) * 4;
        canvas.color[dst] = tmp.color[src];
        canvas.color[dst + 1] = tmp.color[src + 1];
        canvas.color[dst + 2] = tmp.color[src + 2];
        canvas.color[dst + 3] = 255;
      }
    }
  });
  fs.writeFileSync(path.join(outDir, 'preview-weapon-detail.png'), png(W, H, canvas.color));
  console.log('docs/preview-weapon-detail.png — автомат и винтовка крупным планом');
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

/* ---------------------------- лист пропсов -------------------------------
   node tools/preview.mjs --props -> docs/preview-props.png
   Проверка мелочи: бочка, мешки, ящики, забор, фонарь, вышка. Всё
   строится теми же функциями, что и на картах, поэтому лист показывает
   ровно то, что игрок увидит в игре. */
if (process.argv.indexOf('--props') >= 0) {
  const items = [];
  items.push({ g: SH2.model.propBarrel(1.0, 0x6a4a2c), name: 'бочка' });
  items.push({ g: SH2.model.propSandbags(6, 0x6f6547), name: 'мешки' });
  items.push({ g: SH2.level.crates(4, 0x5b4a33), name: 'ящики' });
  items.push({ g: SH2.level.fence([0, 0], [2.6, 0], 0x554a38), name: 'забор' });
  items.push({ g: SH2.level.lamp(0x2c3038), name: 'фонарь' });
  items.push({ g: SH2.model.propRock(1.1, 0x585349), name: 'камень' });
  const cell = 480, cols = 3, rows = Math.ceil(items.length / cols);
  const W = cell * cols, H = Math.round(cell * 0.82) * rows;
  const ch = Math.round(cell * 0.82);
  const big = new Canvas(W, H, [22, 24, 28]);
  items.forEach((it, i) => {
    const col = i % cols, row = (i - col) / cols;
    const small = new Canvas(cell, ch, [22, 24, 28]);
    it.g.updateMatrixWorld(true);
    const box = new T.Box3().setFromObject(it.g);
    const c = new T.Vector3(); box.getCenter(c);
    const size = box.getSize(new T.Vector3()).length();
    const dir = new T.Vector3(1.4, 0.8, 1.7).normalize();
    renderScene(small, it.g, c.clone().addScaledVector(dir, Math.max(2.0, size * 1.35)), c, 32);
    for (let y = 0; y < ch; y++) {
      for (let x = 0; x < cell; x++) {
        const si = (y * cell + x) * 4;
        const di = ((row * ch + y) * W + col * cell + x) * 4;
        big.color[di] = small.color[si];
        big.color[di + 1] = small.color[si + 1];
        big.color[di + 2] = small.color[si + 2];
      }
    }
  });
  fs.writeFileSync(path.join(root, 'docs', 'preview-props.png'), png(W, H, big.color));
  console.log('docs/preview-props.png — бочка, мешки, ящики, забор, фонарь');
  process.exit(0);
}
