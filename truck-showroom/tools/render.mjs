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
import { buildDots } from '../src/lib/dots.js';

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
// --damage: показать пятно повреждения (для проверки его места)
if (args.damage === 'true' && built.damage?.group) built.damage.group.visible = true;
const root = built.root;
root.updateMatrixWorld(true);

// --look voxel: модель, собранная заново из точек (воксельная реконструкция)
if (args.look === 'voxel' || args.look === 'mesh') {
  const { buildVoxel, buildSmoothMesh } = await import('../src/lib/reconstruct.js');
  const meshOpts = {
    target: Number(args.dotstarget || 62000),
    res: args.res ? Number(args.res) : undefined,
    dilate: args.dilate ? Number(args.dilate) : undefined,
    smooth: args.smooth ? Number(args.smooth) : undefined,
    thicken: args.thicken ? Number(args.thicken) : undefined,
    snap: args.snap ? Number(args.snap) : undefined,
    fillGap: args.fillgap ? Number(args.fillgap) : undefined,
    ink: args.ink ? Number(args.ink) : undefined,
    dents: args.dents ? Number(args.dents) : undefined,
  };
  const vox = args.look === 'mesh'
    ? buildSmoothMesh(root, meshOpts)
    : buildVoxel(root, { target: Number(args.dotstarget || 62000) });
  if (vox) {
    vox.visible = true;
    root.traverse((o) => {
      if ((o.isMesh || o.isInstancedMesh) && o !== vox) o.visible = false;
    });
    root.add(vox);
    root.updateMatrixWorld(true);
    console.log(`${args.look}: ${vox.userData.cells || vox.userData.vertices} узлов, ${vox.userData.triangles} треугольников, клетка ${vox.userData.cell.toFixed(3)} м`);
  }
}

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
// --up: для вида сверху «верх» камеры — не мировой Y (иначе ракурс заваливается)
if (args.up) camera.up.set(...args.up.split(',').map(Number));
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

const dmgMark = args.dmgmark === 'true';
root.traverseVisible((o) => {
  if (!o.isMesh || o.isInstancedMesh || !o.geometry) return;
  const g = o.geometry;
  const pos = g.attributes.position;
  if (!pos) return;
  const idx = g.index;
  const count = idx ? idx.count : pos.count;
  const matList = Array.isArray(o.material) ? o.material : [o.material];
  const mat = matList[0] || {};
  // пятно повреждения в проверочных рендерах красим в маджентовый,
  // иначе текстура (её растеризатор не читает) сливается с кузовом
  const isDmg = !!(mat.userData && mat.userData.damageKind);
  // --dmgmark: пятна красим маджентовым, чтобы найти их место.
  // Без него рельеф пятна рисуется своим цветом и светом — видно объём.
  const base = isDmg && dmgMark ? new THREE.Color(0xff2ec4) : new THREE.Color(mat.color ? mat.color : 0xcccccc);
  const emissive = new THREE.Color(mat.emissive ? mat.emissive : 0x000000);
  const emissiveI = mat.emissiveIntensity ?? 1;
  const opacity = isDmg && dmgMark ? 0.9 : mat.transparent ? (mat.opacity ?? 0.5) : 1;
  const metal = mat.metalness ?? 0;
  const rough = mat.roughness ?? 0.6;
  // вершинные цвета (контурная маркировка прицепов, флаги и т.п.)
  const vcol = mat.vertexColors && g.attributes.color ? g.attributes.color : null;
  const cTmp = new THREE.Color();
  for (let i = 0; i < count; i += 3) {
    const ia = idx ? idx.getX(i) : i;
    const ib = idx ? idx.getX(i + 1) : i + 1;
    const ic = idx ? idx.getX(i + 2) : i + 2;
    tmpA.fromBufferAttribute(pos, ia).applyMatrix4(o.matrixWorld);
    tmpB.fromBufferAttribute(pos, ib).applyMatrix4(o.matrixWorld);
    tmpC.fromBufferAttribute(pos, ic).applyMatrix4(o.matrixWorld);
    // отсечение невидимых по «плохим» координатам
    nA.subVectors(tmpB, tmpA).cross(tmpC.clone().sub(tmpA)).normalize();
    let color = base;
    if (vcol) {
      // средний цвет треугольника по трём вершинам
      cTmp.setRGB(0, 0, 0);
      for (const vi of [ia, ib, ic]) {
        cTmp.r += vcol.getX(vi); cTmp.g += vcol.getY(vi); cTmp.b += vcol.getZ(vi);
      }
      color = base.clone().multiplyScalar(1).setRGB(
        (cTmp.r / 3) * base.r, (cTmp.g / 3) * base.g, (cTmp.b / 3) * base.b,
      );
    }
    tris.push({
      a: tmpA.clone(), b: tmpB.clone(), c: tmpC.clone(), n: nA.clone(),
      color: color.clone(), emissive: emissive.clone(), emissiveI, opacity, metal, rough,
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
const dotsMode = args.dots === 'true';
// --seams true: поверх модели рисуем открытые швы (границы поверхностей)
let seamSegs = null;
if (args.seams === 'true') {
  const { analyzeSeams } = await import('../src/lib/seams.js');
  const rep = analyzeSeams(root, { withBorder: true });
  seamSegs = rep.borderPoints || [];
  console.log(`швы: ${seamSegs.length} рёбер, дырок ${rep.holeCount}, швов ${rep.seamCount}, краёв ${rep.openCount}`);
}
if (!dotsMode) for (const t of opaque) fillTri(t);
// полупрозрачные: от дальних к ближним
clear.sort((a, b) => {
  const da = a.a.distanceToSquared(camera.position);
  const db = b.a.distanceToSquared(camera.position);
  return db - da;
});
for (const t of (dotsMode ? [] : clear)) {
  // для прозрачных не пишем в z-буфер
  const save = zbuf;
  fillTri(t);
  zbuf.set(save);
}

// ---------------------------------------------------------- швы поверх кадра
if (seamSegs && seamSegs.length) {
  const focalS = (H / 2) / Math.tan(THREE.MathUtils.degToRad((view.fov || 40) / 2));
  const paint = (p) => {
    const vz = p.clone().applyMatrix4(viewMatrix);
    if (vz.z > -NEAR) return;
    const pv = projectViewPoint(vz, new THREE.Vector3());
    if (pv.z > 1 || pv.z < -1) return;
    const sx = ((pv.x + 1) / 2) * W;
    const sy = ((1 - pv.y) / 2) * H;
    const r = Math.min(6, Math.max(1.2, (0.035 * focalS) / -vz.z));
    for (let y = Math.floor(sy - r); y <= Math.ceil(sy + r); y++) {
      if (y < 0 || y >= H) continue;
      for (let x = Math.floor(sx - r); x <= Math.ceil(sx + r); x++) {
        if (x < 0 || x >= W) continue;
        const dx = x + 0.5 - sx;
        const dy = y + 0.5 - sy;
        if (dx * dx + dy * dy > r * r) continue;
        const i = y * W + x;
        if (-vz.z > zbuf[i] + 0.02) continue;
        const o = i * 3;
        buf[o] = 1; buf[o + 1] = 0.18; buf[o + 2] = 0.62;
      }
    }
  };
  const A = new THREE.Vector3();
  const B = new THREE.Vector3();
  const P = new THREE.Vector3();
  for (const s9 of seamSegs) {
    A.set(s9[0], s9[1], s9[2]);
    B.set(s9[3], s9[4], s9[5]);
    const n = Math.max(2, Math.ceil(A.distanceTo(B) / 0.02));
    for (let i = 0; i <= n; i++) paint(P.lerpVectors(A, B, i / n));
  }
}

// ---------------------------------------------------------- режим «точки»
// --dots true: тот же кадр, но модель собрана из точек (трафарет).
if (args.dots === 'true') {
  const cloud = buildDots(root, { target: Number(args.dotstarget || 60000) });
  // --4d <угол>: облако повёрнуто в четвёртой оси перед отрисовкой
  if (args['4d']) {
    const { prepareFourD, tickFourD } = await import('../src/lib/four-d.js');
    prepareFourD(cloud);
    tickFourD(cloud, Number(args['4d']));
    console.log(`4D: угол ${Number(args['4d']).toFixed(2)} рад`);
  }
  const pAttr = cloud.geometry.attributes.position;
  const cAttr = cloud.geometry.attributes.color;
  const nAttr = cloud.geometry.attributes.normal;
  const P = new THREE.Vector3();
  const N = new THREE.Vector3();
  const focal = (H / 2) / Math.tan(THREE.MathUtils.degToRad((view.fov || 40) / 2));
  const size = Number(args.dotsize || 0.017);
  const drawDisc = (cx, cy, r, col, z) => {
    const x0 = Math.max(0, Math.floor(cx - r));
    const x1 = Math.min(W - 1, Math.ceil(cx + r));
    const y0 = Math.max(0, Math.floor(cy - r));
    const y1 = Math.min(H - 1, Math.ceil(cy + r));
    const r2 = r * r;
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const dx = x + 0.5 - cx;
        const dy = y + 0.5 - cy;
        const d2 = dx * dx + dy * dy;
        if (d2 > r2) continue;
        const i = y * W + x;
        if (z > zbuf[i]) continue;
        zbuf[i] = z;
        // мягкий край точки
        const k = 1 - Math.min(1, Math.sqrt(d2) / r) * 0.35;
        const o = i * 3;
        buf[o] = col.r * k; buf[o + 1] = col.g * k; buf[o + 2] = col.b * k;
      }
    }
  };
  const colTmp = new THREE.Color();
  let drawn = 0;
  for (let i = 0; i < pAttr.count; i++) {
    P.set(pAttr.getX(i), pAttr.getY(i), pAttr.getZ(i));
    const vz = P.clone().applyMatrix4(viewMatrix);
    if (vz.z > -NEAR) continue;
    const pv = projectViewPoint(vz, new THREE.Vector3());
    if (pv.z > 1 || pv.z < -1) continue;
    const sx = ((pv.x + 1) / 2) * W;
    const sy = ((1 - pv.y) / 2) * H;
    const r = Math.min(2.2, Math.max(0.7, (size * focal) / -vz.z));
    N.set(nAttr.getX(i), nAttr.getY(i), nAttr.getZ(i));
    const nd = N.dot(camDir) < 0 ? N.clone().negate() : N;
    const light = 0.3 + 0.62 * Math.max(0, nd.dot(L1)) + 0.16 * Math.max(0, nd.dot(L2));
    colTmp.setRGB(
      Math.min(1, cAttr.getX(i) * light),
      Math.min(1, cAttr.getY(i) * light),
      Math.min(1, cAttr.getZ(i) * light),
    );
    drawDisc(sx, sy, r, colTmp, -vz.z);
    drawn += 1;
  }
  console.log(`dots: ${drawn} / ${pAttr.count}`);
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
