// ============================================================
// РЕКОНСТРУКЦИЯ ПО ТОЧКАМ: обратный ход к режиму «Точки».
// Облако (контуры + заливка) раскладывается в воксельное поле, а дальше
// его можно собрать двумя способами:
//   • buildVoxel     — по клеткам (как «лего», видны четырёхугольники);
//   • buildSmoothMesh — настоящая поверхность по Surface Nets: вершины стоят
//     на пересечениях поля, грани треугольные, нормали сглаженные.
// Цвет берётся из точек, поэтому покраска, стёкла и хром остаются своими.
// ============================================================
import * as THREE from 'three';
import { buildDots } from './dots.js';

/**
 * Воксельное поле из облака точек.
 * @returns {{solid:Map, nx:number, ny:number, nz:number, cell:number, ox:number, oy:number, oz:number, points:number}}
 */
export function buildField(root, opts = {}) {
  const target = opts.target || 62000;
  const fill = opts.fill !== false;
  // меньше «туши», чем в трафарете: реконструкция должна нести настоящий цвет
  const cloud = buildDots(root, {
    target,
    inkMix: opts.inkMix ?? 0.12,
    dentMix: opts.dentMix ?? 0.42,
    recess: opts.recess,
  });
  const pos = cloud.geometry.attributes.position;
  const col = cloud.geometry.attributes.color;
  const kindAttr = cloud.geometry.attributes.kind;
  const nrmAttr = cloud.geometry.attributes.normal;
  const n = pos.count;
  if (!n) return { solid: new Map(), nx: 0, ny: 0, nz: 0, cell: 1, ox: 0, oy: 0, oz: 0, points: 0 };

  const box = new THREE.Box3().setFromBufferAttribute(pos);
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z) || 1;
  // Клетка не должна быть толще тонких деталей (дека прицепа, рёбра рамы):
  // у длинных машин ограничиваем её сверху, иначе меш превращается в «лужу».
  const resCell = Math.max(0.032, maxDim / (opts.res || 84));
  const cap = opts.maxCell ?? (maxDim <= 24 ? 0.1 : 0.34);
  const cell = opts.cell || Math.min(resCell, cap);
  const ox = box.min.x;
  const oy = box.min.y;
  const oz = box.min.z;
  const nx = Math.max(1, Math.ceil(size.x / cell) + 1);
  const ny = Math.max(1, Math.ceil(size.y / cell) + 1);
  const nz = Math.max(1, Math.ceil(size.z / cell) + 1);

  const key = (i, j, k) => `${i},${j},${k}`;
  const shell = new Map();
  const columns = new Map();
  for (let p = 0; p < n; p++) {
    const i = Math.floor((pos.getX(p) - ox) / cell);
    const j = Math.floor((pos.getY(p) - oy) / cell);
    const k = Math.floor((pos.getZ(p) - oz) / cell);
    const kk = key(i, j, k);
    const kind = kindAttr ? kindAttr.getX(p) : 0;
    let c = shell.get(kk);
    if (!c) {
      c = { i, j, k, r: 0, g: 0, b: 0, count: 0, k1: 0, k2: 0, nx: 0, ny: 0, nz: 0 };
      shell.set(kk, c);
      const ck = `${i},${k}`;
      let list = columns.get(ck);
      if (!list) { list = []; columns.set(ck, list); }
      list.push(j);
    }
    c.r += col.getX(p); c.g += col.getY(p); c.b += col.getZ(p);
    c.count += 1;
    if (kind === 1) c.k1 += 1; else if (kind === 2) c.k2 += 1;
    // средняя нормаль клетки: по ней оболочка утолщается внутрь, а не наружу
    if (nrmAttr) { c.nx += nrmAttr.getX(p); c.ny += nrmAttr.getY(p); c.nz += nrmAttr.getZ(p); }
  }

  const solid = new Map();
  for (const c of shell.values()) {
    const nl = Math.hypot(c.nx, c.ny, c.nz) || 1;
    solid.set(key(c.i, c.j, c.k), {
      r: c.r / c.count, g: c.g / c.count, b: c.b / c.count,
      k1: c.k1 / c.count, k2: c.k2 / c.count,
      nx: c.nx / nl, ny: c.ny / nl, nz: c.nz / nl,
    });
  }
  // заливаем только узкие полости (≤ 3 клетки): пустоту под рамой
  // и просветы кабины оставляем как есть
  if (fill) {
    const fillGap = opts.fillGap ?? 5;
    for (const [ck, list] of columns) {
      if (list.length < 2) continue;
      const [i, k] = ck.split(',').map(Number);
      const sorted = [...new Set(list)].sort((a, b) => a - b);
      for (let s = 1; s < sorted.length; s++) {
        const from = sorted[s - 1];
        const to = sorted[s];
        if (to - from <= 1 || to - from - 1 > fillGap) continue;
        for (let j = from + 1; j < to; j++) {
          const kk = key(i, j, k);
          if (solid.has(kk)) continue;
          let best = sorted[0];
          let bestD = Infinity;
          for (const jj of sorted) {
            const d = Math.abs(jj - j);
            if (d < bestD) { bestD = d; best = jj; }
          }
          const src = solid.get(key(i, best, k));
          if (src) solid.set(kk, { r: src.r, g: src.g, b: src.b, k1: 0, k2: 0, filled: 1 });
        }
      }
    }
  }
  return { solid, nx, ny, nz, cell, ox, oy, oz, points: n, cloudPos: pos };

}

/** Клетчатая реконструкция: наружу только грани без соседа. */
export function buildVoxel(root, opts = {}) {
  const f = buildField(root, opts);
  if (!f.solid.size) return null;
  const { solid, cell, ox, oy, oz } = f;
  const key = (i, j, k) => `${i},${j},${k}`;
  const positions = [];
  const colors = [];
  const pA = new THREE.Vector3();
  const faces = [
    { d: [1, 0, 0], c: [[1, 0, 0], [1, 1, 0], [1, 1, 1], [1, 0, 0], [1, 1, 1], [1, 0, 1]] },
    { d: [-1, 0, 0], c: [[0, 0, 0], [0, 0, 1], [0, 1, 1], [0, 0, 0], [0, 1, 1], [0, 1, 0]] },
    { d: [0, 1, 0], c: [[0, 1, 0], [0, 1, 1], [1, 1, 1], [0, 1, 0], [1, 1, 1], [1, 1, 0]] },
    { d: [0, -1, 0], c: [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 0], [1, 0, 1], [0, 0, 1]] },
    { d: [0, 0, 1], c: [[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 0, 1], [1, 1, 1], [0, 1, 1]] },
    { d: [0, 0, -1], c: [[0, 0, 0], [0, 1, 0], [1, 1, 0], [0, 0, 0], [1, 1, 0], [1, 0, 0]] },
  ];
  for (const [kk, c] of solid) {
    const [i, j, k] = kk.split(',').map(Number);
    for (const fc of faces) {
      if (solid.has(key(i + fc.d[0], j + fc.d[1], k + fc.d[2]))) continue;
      const lift = fc.d[1] > 0 ? 1.16 : fc.d[1] < 0 ? 0.72 : 1;
      for (const corner of fc.c) {
        pA.set(ox + (i + corner[0]) * cell, oy + (j + corner[1]) * cell, oz + (k + corner[2]) * cell);
        positions.push(pA.x, pA.y, pA.z);
        colors.push(Math.min(1, c.r * lift), Math.min(1, c.g * lift), Math.min(1, c.b * lift));
      }
    }
  }
  if (!positions.length) return null;

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  geo.computeBoundingSphere();

  const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
    vertexColors: true, roughness: 0.8, metalness: 0.1, flatShading: true,
  }));
  mesh.name = 'voxel';
  mesh.userData.cell = cell;
  mesh.userData.cells = solid.size;
  mesh.userData.triangles = positions.length / 9;
  mesh.visible = false;
  mesh.frustumCulled = false;
  return mesh;
}

/**
 * Настоящая поверхность из поля (Surface Nets): в каждой клетке, где поле
 * меняет знак, ставится вершина на среднем пересечении рёбер, а между
 * соседними вершинами натягиваются треугольники. Никаких кубов — сглаженный
 * меш с плавными нормалями.
 */
export function buildSmoothMesh(root, opts = {}) {
  const f = buildField(root, opts);
  if (!f.solid.size) return null;
  const { nx, ny, nz, cell, ox, oy, oz } = f;
  // утолщаем оболочку: точки лежат тонким слоем, а поверхности нужна
  // толщина хотя бы в клетку, иначе поле рвётся и меш рассыпается
  const ink = opts.ink ?? 0.26;
  const dents = opts.dents ?? 0.1;
  // утолщаем оболочку ВНУТРЬ по нормалям точек: наружная поверхность остаётся
  // на месте, а не раздувается (иначе колёса и стёкла «заплывают»)
  const thicken = opts.thicken ?? 2;
  let solid = f.solid;
  if (thicken > 0) {
    const inner = new Map(solid);
    for (const [kk, c] of solid) {
      if (!c.nx && !c.ny && !c.nz) continue;
      const [i, j, k] = kk.split(',').map(Number);
      for (let t = 1; t <= thicken; t++) {
        const kk2 = `${i + Math.round(-c.nx * t)},${j + Math.round(-c.ny * t)},${k + Math.round(-c.nz * t)}`;
        if (inner.has(kk2)) continue;
        inner.set(kk2, { r: c.r, g: c.g, b: c.b, k1: c.k1, k2: c.k2, nx: c.nx, ny: c.ny, nz: c.nz });
      }
    }
    solid = inner;
  }
  const dilate = opts.dilate ?? 1;
  if (dilate > 0) {
    const thick = new Map();
    for (const [kk, c] of solid) {
      const [i, j, k] = kk.split(',').map(Number);
      for (let a = -dilate; a <= dilate; a++) {
        for (let b = -dilate; b <= dilate; b++) {
          for (let d = -dilate; d <= dilate; d++) {
            const kk2 = `${i + a},${j + b},${k + d}`;
            if (thick.has(kk2)) continue;
            thick.set(kk2, d === 0 && a === 0 && b === 0 ? c : { r: c.r, g: c.g, b: c.b });
          }
        }
      }
    }
    solid = thick;
  }
  const key = (i, j, k) => `${i},${j},${k}`;
  const occ = (i, j, k) => (i >= 0 && j >= 0 && k >= 0 && i < nx && j < ny && k < nz
    && solid.has(key(i, j, k)) ? 1 : 0);

  // поле в узлах: доля занятых клеток вокруг узла, от -1 до +1
  const nodeIndex = (i, j, k) => (i * (ny + 1) + j) * (nz + 1) + k;
  const field = new Float32Array((nx + 1) * (ny + 1) * (nz + 1));
  for (let i = 0; i <= nx; i++) {
    for (let j = 0; j <= ny; j++) {
      for (let k = 0; k <= nz; k++) {
        let c = 0;
        for (let a = -1; a <= 0; a++) {
          for (let b = -1; b <= 0; b++) {
            for (let d = -1; d <= 0; d++) c += occ(i + a, j + b, k + d);
          }
        }
        field[nodeIndex(i, j, k)] = (c / 8) * 2 - 1;
      }
    }
  }
  // лёгкое сглаживание поля: убирает «лестницу» от клеток, форма остаётся
  const passes = opts.smooth ?? 2;
  if (passes > 0) {
    let src = field;
    for (let p2 = 0; p2 < passes; p2++) {
      const dst = new Float32Array(src.length);
      for (let i = 0; i <= nx; i++) {
        for (let j = 0; j <= ny; j++) {
          for (let k = 0; k <= nz; k++) {
            let sum = 0;
            let cnt = 0;
            for (let a = -1; a <= 1; a++) {
              const ii = i + a;
              if (ii < 0 || ii > nx) continue;
              for (let b = -1; b <= 1; b++) {
                const jj = j + b;
                if (jj < 0 || jj > ny) continue;
                for (let d = -1; d <= 1; d++) {
                  const kk = k + d;
                  if (kk < 0 || kk > nz) continue;
                  sum += src[nodeIndex(ii, jj, kk)];
                  cnt += 1;
                }
              }
            }
            dst[nodeIndex(i, j, k)] = sum / cnt;
          }
        }
      }
      src = dst;
      if (p2 === passes - 1) field.set(src);
    }
  }
  const nodeVal = (i, j, k) => field[nodeIndex(i, j, k)];

  // цвет клетки — для окраски вершин
  const cellColor = (i, j, k) => {
    if (i < 0 || j < 0 || k < 0 || i >= nx || j >= ny || k >= nz) return null;
    return solid.get(key(i, j, k)) || null;
  };

  const verts = []; // {x,y,z,r,g,b}
  const cellVert = new Int32Array(nx * ny * nz).fill(-1);
  const cellAt = (i, j, k) => (i * ny + j) * nz + k;
  const cornerOffsets = [
    [0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0],
    [0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1],
  ];
  const cornerEdges = [
    [0, 1], [1, 2], [2, 3], [3, 0],
    [4, 5], [5, 6], [6, 7], [7, 4],
    [0, 4], [1, 5], [2, 6], [3, 7],
  ];

  for (let i = 0; i < nx; i++) {
    for (let j = 0; j < ny; j++) {
      for (let k = 0; k < nz; k++) {
        const vals = cornerOffsets.map(([a, b, c]) => nodeVal(i + a, j + b, k + c));
        let mask = 0;
        for (let c = 0; c < 8; c++) if (vals[c] > 0) mask |= 1 << c;
        if (mask === 0 || mask === 255) continue;
        // средняя точка пересечений рёбер
        let sx = 0;
        let sy = 0;
        let sz = 0;
        let cnt = 0;
        for (const [a, b] of cornerEdges) {
          const va = vals[a];
          const vb = vals[b];
          if ((va > 0) === (vb > 0)) continue;
          const t = va / (va - vb);
          const oa = cornerOffsets[a];
          const ob = cornerOffsets[b];
          sx += oa[0] + (ob[0] - oa[0]) * t;
          sy += oa[1] + (ob[1] - oa[1]) * t;
          sz += oa[2] + (ob[2] - oa[2]) * t;
          cnt += 1;
        }
        if (!cnt) continue;
        // цвет — среднее по занятым клеткам вокруг; контур подчёркиваем
        // тушью, ямку — золотом, чтобы обводка читалась и на поверхности
        let r = 0; let g = 0; let bl = 0; let cc = 0;
        let kk1 = 0; let kk2 = 0;
        for (let a = -1; a <= 1; a++) {
          for (let b = -1; b <= 1; b++) {
            for (let d = -1; d <= 1; d++) {
              const col = cellColor(i + a, j + b, k + d);
              if (!col) continue;
              r += col.r; g += col.g; bl += col.b; cc += 1;
              kk1 += col.k1 || 0; kk2 += col.k2 || 0;
            }
          }
        }
        if (!cc) continue;
        let vr = r / cc;
        let vg = g / cc;
        let vb = bl / cc;
        const inkW = Math.min(ink, (kk1 / cc) * 0.75);
        if (inkW > 0) {
          vr = vr * (1 - inkW) + 0.04 * inkW;
          vg = vg * (1 - inkW) + 0.05 * inkW;
          vb = vb * (1 - inkW) + 0.06 * inkW;
        }
        const dentW = Math.min(dents, (kk2 / cc) * 0.45);
        if (dentW > 0) {
          vr = vr * (1 - dentW) + 0.91 * dentW;
          vg = vg * (1 - dentW) + 0.71 * dentW;
          vb = vb * (1 - dentW) + 0.35 * dentW;
        }
        cellVert[cellAt(i, j, k)] = verts.length;
        verts.push({
          x: ox + (i + sx / cnt) * cell,
          y: oy + (j + sy / cnt) * cell,
          z: oz + (k + sz / cnt) * cell,
          r: vr, g: vg, b: vb,
        });
      }
    }
  }
  if (!verts.length) return null;

  // Обтягиваем поверхность по облаку: вершина сдвигается к ближайшей точке,
  // поэтому скругления не «заплывают», а контур и ямка читаются как на трафарете.
  const snap = opts.snap ?? 0.2;
  const cloudPos = f.cloudPos;
  if (snap > 0 && cloudPos) {
    const S = cell;
    const buckets = new Map();
    const bkey = (x, y, z) => `${Math.round(x / S)},${Math.round(y / S)},${Math.round(z / S)}`;
    for (let p2 = 0; p2 < cloudPos.count; p2++) {
      const kk = bkey(cloudPos.getX(p2), cloudPos.getY(p2), cloudPos.getZ(p2));
      let arr = buckets.get(kk);
      if (!arr) { arr = []; buckets.set(kk, arr); }
      arr.push(p2);
    }
    const lim = (S * 1.35) * (S * 1.35);
    for (const v of verts) {
      const ci = Math.round(v.x / S);
      const cj = Math.round(v.y / S);
      const ck = Math.round(v.z / S);
      let best = -1;
      let bestD = lim;
      for (let a = -1; a <= 1; a++) {
        for (let b = -1; b <= 1; b++) {
          for (let d = -1; d <= 1; d++) {
            const arr = buckets.get(`${ci + a},${cj + b},${ck + d}`);
            if (!arr) continue;
            for (const p2 of arr) {
              const dx = cloudPos.getX(p2) - v.x;
              const dy = cloudPos.getY(p2) - v.y;
              const dz = cloudPos.getZ(p2) - v.z;
              const dist = dx * dx + dy * dy + dz * dz;
              if (dist < bestD) { bestD = dist; best = p2; }
            }
          }
        }
      }
      if (best < 0) continue;
      v.x += (cloudPos.getX(best) - v.x) * snap;
      v.y += (cloudPos.getY(best) - v.y) * snap;
      v.z += (cloudPos.getZ(best) - v.z) * snap;
    }
  }

  const positions = [];
  const colors = [];
  const pushTri = (a, b, c) => {
    for (const v of [a, b, c]) {
      positions.push(v.x, v.y, v.z);
      colors.push(Math.min(1, v.r * 1.02), Math.min(1, v.g * 1.02), Math.min(1, v.b * 1.02));
    }
  };
  const vertAt = (i, j, k) => {
    if (i < 0 || j < 0 || k < 0 || i >= nx || j >= ny || k >= nz) return null;
    const idx = cellVert[cellAt(i, j, k)];
    return idx < 0 ? null : verts[idx];
  };
  const quad = (a, b, c, d, flip) => {
    if (!a || !b || !c || !d) return;
    if (flip) { pushTri(a, d, c); pushTri(a, c, b); } else { pushTri(a, b, c); pushTri(a, c, d); }
  };

  // по каждому ребру сетки, где меняется знак, соединяем 4 соседние клетки
  for (let i = 0; i <= nx; i++) {
    for (let j = 0; j <= ny; j++) {
      for (let k = 0; k <= nz; k++) {
        const v = nodeVal(i, j, k);
        // ребро вдоль X
        if (i < nx && (v > 0) !== (nodeVal(i + 1, j, k) > 0)) {
          quad(vertAt(i, j - 1, k - 1), vertAt(i, j, k - 1), vertAt(i, j, k), vertAt(i, j - 1, k), v > 0);
        }
        // вдоль Y
        if (j < ny && (v > 0) !== (nodeVal(i, j + 1, k) > 0)) {
          quad(vertAt(i - 1, j, k - 1), vertAt(i - 1, j, k), vertAt(i, j, k), vertAt(i, j, k - 1), v > 0);
        }
        // вдоль Z
        if (k < nz && (v > 0) !== (nodeVal(i, j, k + 1) > 0)) {
          quad(vertAt(i - 1, j - 1, k), vertAt(i, j - 1, k), vertAt(i, j, k), vertAt(i - 1, j, k), v > 0);
        }
      }
    }
  }
  if (!positions.length) return null;

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  geo.computeBoundingSphere();

  const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.62,
    metalness: 0.16,
    side: THREE.DoubleSide,
  }));
  mesh.name = 'smooth';
  mesh.userData.cell = cell;
  mesh.userData.vertices = verts.length;
  mesh.userData.triangles = positions.length / 9;
  mesh.visible = false;
  mesh.frustumCulled = false;
  return mesh;
}

/** Сколько клеток/треугольников получилось — для подписи в интерфейсе. */
export function voxelStats(mesh) {
  return {
    cells: mesh?.userData?.cells || mesh?.userData?.vertices || 0,
    triangles: Math.round(mesh?.userData?.triangles || 0),
    cell: mesh?.userData?.cell || 0,
    smooth: mesh?.name === 'smooth',
  };
}
