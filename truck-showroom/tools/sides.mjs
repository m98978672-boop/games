// ============================================================
// tools/sides.mjs — картинки модели со всех сторон.
// Строит 6 ракурсов (спереди, 3/4, борт, сзади, слева, сверху),
// рендерит их tools/render.mjs и склеивает в один лист с подписями.
//   node tools/sides.mjs --cat trucks --id atlas-vision --look dots \
//        --dots true --dotstarget 62000 --out shots/atlas-vision.png
//   --look solid | dots | mesh, --views 6, --cell 420, --cols 3
// ============================================================
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import * as THREE from 'three';
import { PNG } from 'pngjs';
import { createMaterials } from '../src/lib/kit.js';
import { buildUnit } from '../src/models/index.js';
import { findUnit } from '../src/data/units.js';

const args = Object.fromEntries(process.argv.slice(2).reduce((a, c, i, arr) => {
  if (c.startsWith('--')) a.push([c.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : 'true']);
  return a;
}, []));

const cat = args.cat || 'trucks';
const id = args.id || 'atlas-vision';
const look = args.look || 'dots';
const cell = Number(args.cell || 420);
const cols = Number(args.cols || 3);
const ch = Math.round(cell * 0.72);
const out = args.out || `/home/user/shots/sides/${cat}-${id}-${look}.png`;
const scale = Number(args.scale || 1); // zoom: меньше — модель крупнее

// ---------------------------------------------------------------- модель и рамка
const M = createMaterials(null);
const built = buildUnit({ ...findUnit(cat, id), category: cat }, M);
built.root.updateMatrixWorld(true);
const box = new THREE.Box3().setFromObject(built.root);
const center = box.getCenter(new THREE.Vector3());
const sphere = box.getBoundingSphere(new THREE.Sphere());
console.log(`${cat}/${id}: bbox ${box.getSize(new THREE.Vector3()).toArray().map((v) => +v.toFixed(2)).join(' × ')} м`);

// спереди у машин — минус Z, у зданий — плюс Z
const fz = cat === 'buildings' ? 1 : -1;
const dir = (x, y, z) => new THREE.Vector3(x, y, z * fz).normalize();
const VIEWS = [
  ['FRONT', dir(0, 0.06, 1)],
  ['3/4', dir(0.72, 0.3, 0.72)],
  ['SIDE', dir(1, 0.06, 0)],
  ['REAR', dir(0, 0.1, -1)],
  ['LEFT', dir(-1, 0.06, 0)],
  ['TOP', dir(0, 1, 0.0001)],
];
const fov = 30;
// кадрируем по проекции рамки на конкретный ракурс: длинный прицеп спереди
// не должен тонуть в пустом кадре, как это было с общей сферой
const corners = [];
for (const x of [box.min.x, box.max.x]) {
  for (const y of [box.min.y, box.max.y]) {
    for (const z of [box.min.z, box.max.z]) corners.push(new THREE.Vector3(x, y, z));
  }
}
function frame(direction, label) {
  const fwd = direction.clone().negate();
  const upHint = label === 'TOP' ? new THREE.Vector3(0, 0, -1) : new THREE.Vector3(0, 1, 0);
  const right = new THREE.Vector3().crossVectors(upHint, fwd).normalize();
  const up = new THREE.Vector3().crossVectors(fwd, right).normalize();
  let hw = 0; let hh = 0; let depth = 0;
  for (const c of corners) {
    const v = c.clone().sub(center);
    hw = Math.max(hw, Math.abs(v.dot(right)));
    hh = Math.max(hh, Math.abs(v.dot(up)));
    depth = Math.max(depth, v.dot(fwd));
  }
  const aspect = cell / ch;
  const tanV = Math.tan((fov * Math.PI) / 360);
  const tanH = tanV * aspect;
  const d = Math.max(hh / tanV, hw / tanH) * 1.06 * scale + Math.abs(depth) * 0.5;
  return Math.max(d, sphere.radius * 0.35);
}

// ---------------------------------------------------------------- рендер ракурсов
const dirTmp = path.join('/tmp/sides', `${cat}-${id}-${look}`);
fs.mkdirSync(dirTmp, { recursive: true });
const pass = ['--cat', cat, '--id', id, '--look', look, '--w', String(cell), '--h', String(ch)];
if (look === 'dots') pass.push('--dots', 'true');
if (args.dotstarget) pass.push('--dotstarget', String(args.dotstarget));
if (args['4d']) pass.push('--4d', String(args['4d']));
for (const f of ['res', 'dilate', 'smooth', 'thicken', 'snap', 'ink', 'dents']) {
  if (args[f]) pass.push(`--${f}`, String(args[f]));
}

const files = [];
for (const [label, d] of VIEWS) {
  const pos = center.clone().addScaledVector(d, frame(d, label));
  const f = path.join(dirTmp, `${label.replace('/', '')}.png`);
  execFileSync('node', [
    'tools/render.mjs', ...pass,
    '--pos', pos.toArray().map((v) => v.toFixed(2)).join(','),
    '--target', center.toArray().map((v) => v.toFixed(2)).join(','),
    '--fov', String(fov),
    ...(label === 'TOP' ? ['--up', '0,0,-1'] : []),
    '--out', f,
  ], { stdio: 'ignore' });
  files.push({ f, label });
}

// ---------------------------------------------------------------- подписи (5×7)
const FONT = {
  A: [0b01110, 0b10001, 0b10001, 0b11111, 0b10001, 0b10001, 0b10001],
  D: [0b11110, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b11110],
  E: [0b11111, 0b10000, 0b10000, 0b11110, 0b10000, 0b10000, 0b11111],
  F: [0b11111, 0b10000, 0b10000, 0b11110, 0b10000, 0b10000, 0b10000],
  H: [0b10001, 0b10001, 0b10001, 0b11111, 0b10001, 0b10001, 0b10001],
  I: [0b11111, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b11111],
  L: [0b10000, 0b10000, 0b10000, 0b10000, 0b10000, 0b10000, 0b11111],
  M: [0b10001, 0b11011, 0b10101, 0b10101, 0b10001, 0b10001, 0b10001],
  N: [0b10001, 0b11001, 0b10101, 0b10011, 0b10001, 0b10001, 0b10001],
  P: [0b11110, 0b10001, 0b10001, 0b11110, 0b10000, 0b10000, 0b10000],
  O: [0b01110, 0b10001, 0b10001, 0b10001, 0b10001, 0b10001, 0b01110],
  R: [0b11110, 0b10001, 0b10001, 0b11110, 0b10100, 0b10010, 0b10001],
  S: [0b01111, 0b10000, 0b10000, 0b01110, 0b00001, 0b00001, 0b11110],
  T: [0b11111, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100],
  W: [0b10001, 0b10001, 0b10001, 0b10101, 0b10101, 0b11011, 0b10001],
  '3': [0b11111, 0b00010, 0b00100, 0b01110, 0b00001, 0b10001, 0b01110],
  '4': [0b00010, 0b00110, 0b01010, 0b10010, 0b11111, 0b00010, 0b00010],
  '/': [0b00001, 0b00010, 0b00010, 0b00100, 0b01000, 0b01000, 0b10000],
  ' ': [0, 0, 0, 0, 0, 0, 0],
};
const textWidth = (s, px = 2) => s.length * 6 * px;
function drawText(png, s, x0, y0, rgb = [232, 180, 90], px = 2) {
  let x = x0;
  for (const raw of s.toUpperCase()) {
    const g = FONT[raw] || FONT[' '];
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 5; col++) {
        if (!(g[row] & (1 << (4 - col)))) continue;
        for (let a = 0; a < px; a++) {
          for (let b = 0; b < px; b++) {
            const px2 = x + col * px + a;
            const py = y0 + row * px + b;
            if (px2 < 0 || py < 0 || px2 >= png.width || py >= png.height) continue;
            const di = (py * png.width + px2) * 4;
            png.data[di] = rgb[0]; png.data[di + 1] = rgb[1]; png.data[di + 2] = rgb[2]; png.data[di + 3] = 255;
          }
        }
      }
    }
    x += 6 * px;
  }
}

// ---------------------------------------------------------------- склейка
const rows = Math.ceil(files.length / cols);
const W = cell * cols;
const H = ch * rows;
const png = new PNG({ width: W, height: H });
png.data.fill(16);
files.forEach((it, i) => {
  const img = PNG.sync.read(fs.readFileSync(it.f));
  const ox = (i % cols) * cell;
  const oy = Math.floor(i / cols) * ch;
  for (let y = 0; y < ch; y++) {
    for (let x = 0; x < cell; x++) {
      const si = (y * cell + x) * 4;
      const di = ((oy + y) * W + ox + x) * 4;
      png.data[di] = img.data[si];
      png.data[di + 1] = img.data[si + 1];
      png.data[di + 2] = img.data[si + 2];
      png.data[di + 3] = 255;
    }
  }
  // тонкая рамка и подпись ракурса
  for (let x = 0; x < cell; x++) {
    const di = ((oy + ch - 1) * W + ox + x) * 4;
    png.data[di] = 34; png.data[di + 1] = 34; png.data[di + 2] = 38;
  }
  for (let y = 0; y < ch; y++) {
    const di = ((oy + y) * W + ox + cell - 1) * 4;
    png.data[di] = 34; png.data[di + 1] = 34; png.data[di + 2] = 38;
  }
  drawText(png, it.label, ox + 12, oy + ch - 24, [214, 168, 92], 2);
});

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, PNG.sync.write(png));
const title = `${cat}/${id} · ${look.toUpperCase()} · ${files.length} ${'VIEWS'.slice(0, 5)}`;
console.log('ok', out, `${W}×${H}`, title);
