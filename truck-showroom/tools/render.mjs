// ============================================================
// tools/render.mjs — софтверный растеризатор для превью.
// Запускается в Node без WebGL: собирает модель моделями из src/models,
// проецирует треугольники камерой Three.js и рисует PNG (z-buffer).
// Используется для визуальной проверки пропорций и тестов.
//   node tools/render.mjs --cat trucks --id atlas-vision --view exterior --out preview.png
// ============================================================
import fs from 'node:fs';
import path from 'node:path';
import * as THREE from 'three';
import { PNG } from 'pngjs';
import { createMaterials } from '../src/lib/kit.js';
import { buildUnit } from '../src/models/index.js';
import { findUnit } from '../src/data/units.js';

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, cur, i, arr) => {
    if (cur.startsWith('--')) acc.push([cur.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : 'true']);
    return acc;
  }, [])
);

const cat = args.cat || 'trucks';
const id = args.id || 'atlas-vision';
const viewId = args.view || 'exterior';
const out = args.out || 'preview.png';
const W = Number(args.w || 1100);
const H = Number(args.h || 700);
const transparent = args.transparent === 'true';

const unit = { ...findUnit(cat, id), category: cat };
const M = createMaterials(null);
const built = buildUnit(unit, M);
const root = built.root;
root.updateMatrixWorld(true);

// --pos x,y,z --target x,y,z — произвольный ракурс для прицельного осмотра
const customView = args.pos && args.target
  ? {
      id: 'custom',
      fov: Number(args.fov || 32),
      pos: args.pos.split(',').map(Number),
      target: args.target.split(',').map(Number),
    }
  : null;
const view = customView || built.views.find((v) => v.id === viewId) || built.views[0];
const camera = new THREE.PerspectiveCamera(view.fov || 40, W / H, 0.05, 400);
camera.position.set(...view.pos);
camera.lookAt(new THREE.Vector3(...view.target));
camera.updateMatrixWorld(true);
camera.updateProjectionMatrix();

const M4 = new THREE.Vector4();
const viewProj = new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);

// ---------------------------------------------------------- сбор треугольников
const tris = [];
const tmpA = new THREE.Vector3();
const tmpB = new THREE.Vector3();
const tmpC = new THREE.Vector3();
const nA = new THREE.Vector3();

root.traverse((o) => {
  if (!o.isMesh || o.isInstancedMesh || !o.geometry) return;
  const g = o.geometry;
  const pos = g.attributes.position;
  if (!pos) return;
  const idx = g.index;
  const count = idx ? idx.count : pos.count;
  const matList = Array.isArray(o.material) ? o.material : [o.material];
  const mat = matList[0] || {};
  const base = new THREE.Color(mat.color ? mat.color : 0xcccccc);
  const emissive = new THREE.Color(mat.emissive ? mat.emissive : 0x000000);
  const emissiveI = mat.emissiveIntensity ?? 1;
  const opacity = mat.transparent ? (mat.opacity ?? 0.5) : 1;
  const metal = mat.metalness ?? 0;
  const rough = mat.roughness ?? 0.6;
  for (let i = 0; i < count; i += 3) {
    const ia = idx ? idx.getX(i) : i;
    const ib = idx ? idx.getX(i + 1) : i + 1;
    const ic = idx ? idx.getX(i + 2) : i + 2;
    tmpA.fromBufferAttribute(pos, ia).applyMatrix4(o.matrixWorld);
    tmpB.fromBufferAttribute(pos, ib).applyMatrix4(o.matrixWorld);
    tmpC.fromBufferAttribute(pos, ic).applyMatrix4(o.matrixWorld);
    // отсечение невидимых по «плохим» координатам
    nA.subVectors(tmpB, tmpA).cross(tmpC.clone().sub(tmpA)).normalize();
    tris.push({
      a: tmpA.clone(), b: tmpB.clone(), c: tmpC.clone(), n: nA.clone(),
      color: base.clone(), emissive: emissive.clone(), emissiveI, opacity, metal, rough,
    });
  }
});

// ---------------------------------------------------------- буферы
const buf = new Float32Array(W * H * 3);
const zbuf = new Float32Array(W * H).fill(Infinity);
const bgTop = new THREE.Color(args.bgtop || '#1b2126');
const bgBot = new THREE.Color(args.bgbot || '#08090a');
for (let y = 0; y < H; y++) {
  const t = y / H;
  for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 3;
    buf[i] = bgTop.r * (1 - t) + bgBot.r * t;
    buf[i + 1] = bgTop.g * (1 - t) + bgBot.g * t;
    buf[i + 2] = bgTop.b * (1 - t) + bgBot.b * t;
  }
}

// свет
const L1 = new THREE.Vector3(7, 13, -9).normalize();
const L2 = new THREE.Vector3(-10, 6, 7).normalize();
const L3 = new THREE.Vector3(-4, 5, 12).normalize();
const camDir = camera.position.clone().normalize();

const pa = new THREE.Vector3();
const pb = new THREE.Vector3();
const pc = new THREE.Vector3();
function project(v) {
  const p = v.clone().applyMatrix4(viewProj);
  // w-деление уже сделано applyMatrix4 (перспективное деление)
  return p;
}

function shade(t) {
  const n = t.n;
  if (n.lengthSq() < 0.0001) return t.color.clone();
  const nd = n.dot(camDir) < 0 ? n.clone().negate() : n;
  let diff = Math.max(0, nd.dot(L1)) * 1.25 + Math.max(0, nd.dot(L2)) * 0.5 + Math.max(0, nd.dot(L3)) * 0.35;
  diff = 0.1 + diff;
  // блик Фонга
  const half = L1.clone().add(camDir).normalize();
  const spec = Math.pow(Math.max(0, nd.dot(half)), Math.max(4, (1 - t.rough) * 90)) * (0.35 + t.metal * 2.2);
  const c = t.color.clone().multiplyScalar(diff);
  c.add(new THREE.Color(spec, spec, spec));
  c.add(t.emissive.clone().multiplyScalar(t.emissiveI * 0.7));
  return c;
}

const NEAR = 0.05;
const viewMatrix = camera.matrixWorldInverse.clone();
const projMatrix = camera.projectionMatrix.clone();
const vA = new THREE.Vector3();
const vB = new THREE.Vector3();
const vC = new THREE.Vector3();
const poly = [];

function projectViewPoint(v, out) {
  out.set(v.x, v.y, v.z).applyMatrix4(projMatrix);
  return out;
}

/** Заполнение одного треугольника с отсечением по near-плоскости. */
function fillTri(t) {
  vA.copy(t.a).applyMatrix4(viewMatrix);
  vB.copy(t.b).applyMatrix4(viewMatrix);
  vC.copy(t.c).applyMatrix4(viewMatrix);
  // отсечение полигона: z_view <= -NEAR (перед камерой)
  poly.length = 0;
  const pts = [vA, vB, vC];
  for (let i = 0; i < 3; i++) {
    const cur = pts[i];
    const nxt = pts[(i + 1) % 3];
    const cin = cur.z <= -NEAR;
    const nin = nxt.z <= -NEAR;
    if (cin) poly.push(cur.clone());
    if (cin !== nin) {
      const t2 = (-NEAR - cur.z) / (nxt.z - cur.z);
      poly.push(new THREE.Vector3(
        cur.x + (nxt.x - cur.x) * t2,
        cur.y + (nxt.y - cur.y) * t2,
        -NEAR,
      ));
    }
  }
  if (poly.length < 3) return;
  // веер треугольников
  const color = shade(t);
  const p0 = new THREE.Vector3();
  const p1 = new THREE.Vector3();
  const p2 = new THREE.Vector3();
  for (let k = 1; k < poly.length - 1; k++) {
    projectViewPoint(poly[0], p0);
    projectViewPoint(poly[k], p1);
    projectViewPoint(poly[k + 1], p2);
    rasterize(p0, p1, p2, color, t.opacity);
  }
}

function rasterize(pa, pb, pc, color, opacity) {
  const xs = [pa.x, pb.x, pc.x];
  const ys = [pa.y, pb.y, pc.y];
  const minX = Math.max(0, Math.floor(((Math.min(...xs) + 1) / 2) * W));
  const maxX = Math.min(W - 1, Math.ceil(((Math.max(...xs) + 1) / 2) * W));
  const minY = Math.max(0, Math.floor(((1 - Math.max(...ys)) / 2) * H));
  const maxY = Math.min(H - 1, Math.ceil(((1 - Math.min(...ys)) / 2) * H));
  if (maxX < minX || maxY < minY) return;
  const area = (pb.x - pa.x) * (pc.y - pa.y) - (pc.x - pa.x) * (pb.y - pa.y);
  if (Math.abs(area) < 1e-12) return;
  const inv = 1 / area;
  for (let y = minY; y <= maxY; y++) {
    const sy = 1 - ((y + 0.5) / H) * 2;
    for (let x = minX; x <= maxX; x++) {
      const sx = ((x + 0.5) / W) * 2 - 1;
      const w0 = ((pb.x - sx) * (pc.y - sy) - (pc.x - sx) * (pb.y - sy)) * inv;
      const w1 = ((pc.x - sx) * (pa.y - sy) - (pa.x - sx) * (pc.y - sy)) * inv;
      const w2 = 1 - w0 - w1;
      if (w0 < -0.002 || w1 < -0.002 || w2 < -0.002) continue;
      const z = w0 * pa.z + w1 * pb.z + w2 * pc.z;
      if (z < -1 || z > 1) continue;
      const k = y * W + x;
      if (z >= zbuf[k]) continue;
      if (opacity >= 0.98) zbuf[k] = z;
      const i = k * 3;
      if (opacity >= 0.98) {
        buf[i] = color.r; buf[i + 1] = color.g; buf[i + 2] = color.b;
      } else {
        const a = opacity;
        buf[i] = buf[i] * (1 - a) + color.r * a;
        buf[i + 1] = buf[i + 1] * (1 - a) + color.g * a;
        buf[i + 2] = buf[i + 2] * (1 - a) + color.b * a;
      }
    }
  }
}

// сначала непрозрачные, потом прозрачные
const opaque = tris.filter((t) => t.opacity >= 0.98);
const clear = tris.filter((t) => t.opacity < 0.98);
for (const t of opaque) fillTri(t);
// полупрозрачные: от дальних к ближним
clear.sort((a, b) => {
  const da = a.a.distanceToSquared(camera.position);
  const db = b.a.distanceToSquared(camera.position);
  return db - da;
});
for (const t of clear) {
  // для прозрачных не пишем в z-буфер
  const save = zbuf;
  fillTri(t);
  zbuf.set(save);
}

// ---------------------------------------------------------- сохранение
const png = new PNG({ width: W, height: H });
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const si = (y * W + x) * 3;
    const di = (y * W + x) * 4;
    const toSRGB = (v) => {
      const c = Math.max(0, Math.min(1, v));
      return Math.round(255 * (c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055));
    };
    png.data[di] = toSRGB(buf[si]);
    png.data[di + 1] = toSRGB(buf[si + 1]);
    png.data[di + 2] = toSRGB(buf[si + 2]);
    png.data[di + 3] = 255;
  }
}
fs.mkdirSync(path.dirname(out), { recursive: true });
png.pack().pipe(fs.createWriteStream(out)).on('finish', () => {
  console.log(`ok ${out} (${W}×${H}) tris=${tris.length} view=${viewId}`);
});
