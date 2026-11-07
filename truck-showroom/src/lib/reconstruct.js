// ============================================================
// РЕКОНСТРУКЦИЯ ПО ТОЧКАМ: обратный ход к режиму «Точки».
// Берём то же облако (контуры + редкая заливка), раскладываем его в
// воксельную сетку и собираем модель заново — грань за гранью.
// Цвет клетки берётся из точек, поэтому покраска и стёкла остаются своими.
// Дырки в воксельной оболочке закрываются заливкой по столбцу.
// ============================================================
import * as THREE from 'three';
import { buildDots } from './dots.js';

/**
 * @param {THREE.Object3D} root — исходная модель
 * @param {object} opts — { cell, target, fill }
 * @returns {THREE.Mesh|null} — меш реконструкции (vertexColors)
 */
export function buildVoxel(root, opts = {}) {
  const target = opts.target || 62000;
  const fill = opts.fill !== false;
  // меньше «туши», чем в трафарете: реконструкция должна нести настоящий цвет
  const cloud = buildDots(root, { target, inkMix: 0.12 });
  const pos = cloud.geometry.attributes.position;
  const col = cloud.geometry.attributes.color;
  const n = pos.count;
  if (!n) return null;

  // размер клетки: ~44 клетки по самой длинной стороне модели
  const box = new THREE.Box3().setFromBufferAttribute(pos);
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z) || 1;
  const cell = opts.cell || Math.max(0.045, maxDim / 52);
  const ox = box.min.x;
  const oy = box.min.y;
  const oz = box.min.z;

  const cellOf = (x, y, z) => [
    Math.floor((x - ox) / cell),
    Math.floor((y - oy) / cell),
    Math.floor((z - oz) / cell),
  ];
  const key = (i, j, k) => `${i},${j},${k}`;

  // ---- 1) оболочка: клетки, в которых есть точки, и их цвет
  const shell = new Map(); // key -> {i,j,k,r,g,b,count}
  const columns = new Map(); // "i,k" -> [j...]
  const cTmp = new THREE.Color();
  for (let p = 0; p < n; p++) {
    const [i, j, k] = cellOf(pos.getX(p), pos.getY(p), pos.getZ(p));
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

  // ---- 2) заливка по столбцу: клетки между низом и верхом оболочки
  const solid = new Map();
  for (const c of shell.values()) {
    cTmp.setRGB(c.r / c.count, c.g / c.count, c.b / c.count);
    solid.set(key(c.i, c.j, c.k), { r: cTmp.r, g: cTmp.g, b: cTmp.b });
  }
  if (fill) {
    // заливаем только узкие полости (≤ 3 клетки): пустоту под рамой,
    // между колёсами и просветы кабины оставляем как есть
    const fillGap = opts.fillGap ?? 3;
    for (const [ck, list] of columns) {
      if (list.length < 2) continue;
      const [i, k] = ck.split(',').map(Number);
      const sorted = [...new Set(list)].sort((a, b) => a - b);
      const spans = [];
      for (let s2 = 1; s2 < sorted.length; s2++) {
        const from = sorted[s2 - 1];
        const to = sorted[s2];
        if (to - from > 1 && to - from - 1 <= fillGap) spans.push([from + 1, to - 1]);
      }
      for (const [lo, hi] of spans) {
        for (let j = lo; j <= hi; j++) {
          const kk = key(i, j, k);
          if (solid.has(kk)) continue;
          // цвет — от ближайшей клетки оболочки в этом же столбце
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

  // ---- 3) грани наружу: только те, у которых сосед пустой
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
    for (const f of faces) {
      if (solid.has(key(i + f.d[0], j + f.d[1], k + f.d[2]))) continue;
      // чуть светлее сверху и темнее снизу — объём читается без света
      const lift = f.d[1] > 0 ? 1.16 : f.d[1] < 0 ? 0.72 : 1;
      for (const corner of f.c) {
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

  const mat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.78,
    metalness: 0.12,
    flatShading: true,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = 'voxel';
  mesh.userData.cell = cell;
  mesh.userData.cells = solid.size;
  mesh.userData.triangles = positions.length / 9;
  mesh.visible = false;
  mesh.frustumCulled = false;
  return mesh;
}

/** Сколько клеток/треугольников получилось — для подписи в интерфейсе. */
export function voxelStats(mesh) {
  return {
    cells: mesh?.userData?.cells || 0,
    triangles: Math.round(mesh?.userData?.triangles || 0),
    cell: mesh?.userData?.cell || 0,
  };
}
