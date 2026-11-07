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
  const cloud = buildDots(root, { target, inkMix: 0.12 });
  const pos = cloud.geometry.attributes.position;
  const col = cloud.geometry.attributes.color;
  const n = pos.count;
  if (!n) return { solid: new Map(), nx: 0, ny: 0, nz: 0, cell: 1, ox: 0, oy: 0, oz: 0, points: 0 };

  const box = new THREE.Box3().setFromBufferAttribute(pos);
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z) || 1;
  const cell = opts.cell || Math.max(0.045, maxDim / (opts.res || 52));
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
    let c = shell.get(kk);
    if (!c) {
      c = { i, j, k, r: 0, g: 0, b: 0, count: 0 };
      shell.set(kk, c);
      const ck = `${i},${k}`;
      let list = columns.get(ck);
      if (!list) { list = []; columns.set(ck, list); }
      list.push(j);
    }
    c.r += col.getX(p); c.g += col.getY(p); c.b += col.getZ(p);
    c.count += 1;
  }

  const solid = new Map();
  for (const c of shell.values()) {
    solid.set(key(c.i, c.j, c.k), { r: c.r / c.count, g: c.g / c.count, b: c.b / c.count });
  }
  // заливаем только узкие полости (≤ 3 клетки): пустоту под рамой
  // и просветы кабины оставляем как есть
  if (fill) {
    const fillGap = opts.fillGap ?? 3;
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
          if (src) solid.set(kk, { r: src.r, g: src.g, b: src.b });
        }
      }
    }
  }
  return { solid, nx, ny, nz, cell, ox, oy, oz, points: n };
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
  const dilate = opts.dilate ?? 1;
  let solid = f.solid;
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
        // цвет — среднее по занятым клеткам вокруг
        let r = 0; let g = 0; let bl = 0; let cc = 0;
        for (let a = -1; a <= 1; a++) {
          for (let b = -1; b <= 1; b++) {
            for (let d = -1; d <= 1; d++) {
              const col = cellColor(i + a, j + b, k + d);
              if (!col) continue;
              r += col.r; g += col.g; bl += col.b; cc += 1;
            }
          }
        }
        if (!cc) continue;
        cellVert[cellAt(i, j, k)] = verts.length;
        verts.push({
          x: ox + (i + sx / cnt) * cell,
          y: oy + (j + sy / cnt) * cell,
          z: oz + (k + sz / cnt) * cell,
          r: r / cc, g: g / cc, b: bl / cc,
        });
      }
    }
  }
  if (!verts.length) return null;

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
