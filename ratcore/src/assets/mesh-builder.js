// RatCore Assets — Конструкторы мешей MeshBuilder (A-15..A-21, F-113, RC-201..204)
// Вызывается строго внутри tools/toolkit.js под защитой ToolGuard.

import { clamp, vec3Sub, vec3Cross, vec3Normalize } from '../core/math.js';
import { RatCoreError } from '../core/seal.js';
import { packRGBA } from './raster.js';

function computeBounds(positions) {
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i], y = positions[i + 1], z = positions[i + 2];
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (y < minY) minY = y; if (y > maxY) maxY = y;
    if (z < minZ) minZ = z; if (z > maxZ) maxZ = z;
  }
  return { minX, minY, minZ, maxX, maxY, maxZ };
}

function computeFlatNormals(positions, indices) {
  const normals = new Float32Array(positions.length);
  for (let i = 0; i < indices.length; i += 3) {
    const i0 = indices[i] * 3;
    const i1 = indices[i + 1] * 3;
    const i2 = indices[i + 2] * 3;
    const a = [positions[i0], positions[i0 + 1], positions[i0 + 2]];
    const b = [positions[i1], positions[i1 + 1], positions[i1 + 2]];
    const c = [positions[i2], positions[i2 + 1], positions[i2 + 2]];
    const n = vec3Normalize(vec3Cross(vec3Sub(b, a), vec3Sub(c, a)));
    for (const k of [i0, i1, i2]) {
      normals[k] += n[0];
      normals[k + 1] += n[1];
      normals[k + 2] += n[2];
    }
  }
  for (let i = 0; i < normals.length; i += 3) {
    const n = vec3Normalize([normals[i], normals[i + 1], normals[i + 2]]);
    normals[i] = n[0]; normals[i + 1] = n[1]; normals[i + 2] = n[2];
  }
  return normals;
}

function finalizeGeometry(posArr, idxArr, uvArr = null, colorHex = '#88b4d8') {
  const positions = new Float32Array(posArr);
  const indices = new Uint32Array(idxArr);
  const normals = computeFlatNormals(positions, indices);
  const uvs = uvArr ? new Float32Array(uvArr) : new Float32Array((positions.length / 3) * 2);
  const m = /^#?([0-9a-f]{6})$/i.exec(String(colorHex || ''));
  const rgb = m ? parseInt(m[1], 16) : 0x88b4d8;
  const col = packRGBA((rgb >> 16) & 255, (rgb >> 8) & 255, rgb & 255, 255);
  const colors = new Uint32Array(positions.length / 3);
  colors.fill(col);

  return {
    buffers: { positions, indices, normals, uvs, colors },
    bounds: computeBounds(positions),
    triCount: Math.floor(indices.length / 3),
  };
}

// 1. Примитивы: box, cylinder, cone, roof, sphere (поддерживает и sx/sy/sz/kind, и w/h/d/r/shape)
export function buildPrimitiveGeometry(opts = {}) {
  const kind = opts.kind || opts.shape || 'box';
  const sx = Number(opts.sx ?? opts.w ?? opts.width ?? 1);
  const sy = Number(opts.sy ?? opts.h ?? opts.height ?? 1);
  const sz = Number(opts.sz ?? opts.d ?? opts.depth ?? 1);
  const radius = Number(opts.radius ?? opts.r ?? 0.5);
  const height = Number(opts.height ?? opts.h ?? opts.sy ?? 1);
  const segments = Number(opts.segments ?? 12);
  const color = opts.color || '#7ea8cc';
  const pos = [];
  const idx = [];

  const pushQuad = (a, b, c, d) => {
    const base = pos.length / 3;
    pos.push(...a, ...b, ...c, ...d);
    idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
  };

  if (kind === 'box') {
    const hx = sx * 0.5, hz = sz * 0.5, y0 = 0, y1 = sy;
    pushQuad([-hx, y1, -hz], [hx, y1, -hz], [hx, y1, hz], [-hx, y1, hz]); // top
    pushQuad([-hx, y0, hz], [hx, y0, hz], [hx, y0, -hz], [-hx, y0, -hz]); // bottom
    pushQuad([-hx, y0, hz], [-hx, y1, hz], [hx, y1, hz], [hx, y0, hz]);   // front
    pushQuad([hx, y0, -hz], [hx, y1, -hz], [-hx, y1, -hz], [-hx, y0, -hz]); // back
    pushQuad([hx, y0, hz], [hx, y1, hz], [hx, y1, -hz], [hx, y0, -hz]);   // east
    pushQuad([-hx, y0, -hz], [-hx, y1, -hz], [-hx, y1, hz], [-hx, y0, hz]); // west
    return finalizeGeometry(pos, idx, null, color);
  }

  if (kind === 'roof') {
    const hx = sx * 0.5, hz = sz * 0.5, y0 = 0, y1 = sy;
    pushQuad([-hx, y0, hz], [0, y1, hz], [0, y1, -hz], [-hx, y0, -hz]);
    pushQuad([0, y1, hz], [hx, y0, hz], [hx, y0, -hz], [0, y1, -hz]);
    // Фронтоны
    const b1 = pos.length / 3;
    pos.push(-hx, y0, hz, hx, y0, hz, 0, y1, hz);
    idx.push(b1, b1 + 1, b1 + 2);
    const b2 = pos.length / 3;
    pos.push(hx, y0, -hz, -hx, y0, -hz, 0, y1, -hz);
    idx.push(b2, b2 + 1, b2 + 2);
    return finalizeGeometry(pos, idx, null, color);
  }

  if (kind === 'cylinder' || kind === 'cone') {
    const seg = Math.max(4, segments | 0);
    const topR = kind === 'cone' ? 0.001 : radius;
    const h = height || sy;
    const baseCenter = 0;
    pos.push(0, 0, 0);
    const topCenter = 1;
    pos.push(0, h, 0);

    for (let i = 0; i < seg; i++) {
      const a0 = (i / seg) * Math.PI * 2;
      const a1 = ((i + 1) / seg) * Math.PI * 2;
      const b0 = [Math.cos(a0) * radius, 0, Math.sin(a0) * radius];
      const b1 = [Math.cos(a1) * radius, 0, Math.sin(a1) * radius];
      const t0 = [Math.cos(a0) * topR, h, Math.sin(a0) * topR];
      const t1 = [Math.cos(a1) * topR, h, Math.sin(a1) * topR];
      pushQuad(b0, t0, t1, b1);

      const bi = pos.length / 3;
      pos.push(...b1, ...b0);
      idx.push(baseCenter, bi, bi + 1);
      if (kind === 'cylinder') {
        const ti = pos.length / 3;
        pos.push(...t0, ...t1);
        idx.push(topCenter, ti, ti + 1);
      }
    }
    return finalizeGeometry(pos, idx, null, color);
  }

  // sphere
  const rings = Math.max(4, Math.floor(segments / 2));
  const cols = Math.max(6, segments | 0);
  const r = radius || sx * 0.5;
  for (let iy = 0; iy <= rings; iy++) {
    const v = (iy / rings) * Math.PI;
    const sinV = Math.sin(v), cosV = Math.cos(v);
    for (let ix = 0; ix <= cols; ix++) {
      const u = (ix / cols) * Math.PI * 2;
      pos.push(r * sinV * Math.cos(u), r * (1 - cosV), r * sinV * Math.sin(u));
    }
  }
  const stride = cols + 1;
  for (let iy = 0; iy < rings; iy++) {
    for (let ix = 0; ix < cols; ix++) {
      const a = iy * stride + ix;
      const b = a + 1;
      const c = a + stride;
      const d = c + 1;
      idx.push(a, c, b, b, c, d);
    }
  }
  return finalizeGeometry(pos, idx, null, color);
}

// 2. A-15 / A-16: Выдавливание 2D-контура точками (Ear-Clipping триангуляция + стены)
function polygonSignedArea(pts) {
  let area = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[(i + 1) % pts.length];
    area += x0 * y1 - x1 * y0;
  }
  return area * 0.5;
}

function pointInTri2D(p, a, b, c) {
  const s1 = (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]);
  const s2 = (c[0] - b[0]) * (p[1] - b[1]) - (c[1] - b[1]) * (p[0] - b[0]);
  const s3 = (a[0] - c[0]) * (p[1] - c[1]) - (a[1] - c[1]) * (p[0] - c[0]);
  return s1 >= -1e-6 && s2 >= -1e-6 && s3 >= -1e-6;
}

export function triangulateEarClipping(contour) {
  if (!Array.isArray(contour) || contour.length < 3) {
    throw new RatCoreError('RC-201', 'Вырожденный контур: требуется минимум 3 точки', 'Передай массив contour: [[x,y], ...] из >= 3 вершин.');
  }
  const pts = contour.map(([x, y]) => [Number(x), Number(y)]);
  const area = polygonSignedArea(pts);
  if (Math.abs(area) < 1e-6) {
    throw new RatCoreError('RC-201', 'Вырожденный контур с нулевой площадью', 'Проверь, что точки контура не лежат на одной прямой.');
  }
  const ccw = area > 0 ? pts.map((_, i) => i) : pts.map((_, i) => pts.length - 1 - i);
  const tris = [];
  let guard = 0;

  while (ccw.length > 3 && guard < 2000) {
    guard++;
    let clipped = false;
    for (let i = 0; i < ccw.length; i++) {
      const iPrev = ccw[(i - 1 + ccw.length) % ccw.length];
      const iCur = ccw[i];
      const iNext = ccw[(i + 1) % ccw.length];
      const a = pts[iPrev], b = pts[iCur], c = pts[iNext];
      const cross = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
      if (cross <= 1e-6) continue;
      let hasInside = false;
      for (const idx of ccw) {
        if (idx === iPrev || idx === iCur || idx === iNext) continue;
        if (pointInTri2D(pts[idx], a, b, c)) { hasInside = true; break; }
      }
      if (!hasInside) {
        tris.push([iPrev, iCur, iNext]);
        ccw.splice(i, 1);
        clipped = true;
        break;
      }
    }
    if (!clipped) break;
  }
  if (ccw.length === 3) tris.push([ccw[0], ccw[1], ccw[2]]);
  return { pts, tris };
}

export function buildExtrudeGeometry({ contour, points, height = 1, y = 0, color = '#8fb6d8' } = {}) {
  const { pts, tris } = triangulateEarClipping(contour || points);
  const pos = [];
  const idx = [];
  const n = pts.length;
  const y0 = y;
  const y1 = y + height;

  // Верхняя и нижняя крышки
  for (let i = 0; i < n; i++) pos.push(pts[i][0], y0, -pts[i][1]);
  for (let i = 0; i < n; i++) pos.push(pts[i][0], y1, -pts[i][1]);

  for (const [a, b, c] of tris) {
    idx.push(a, c, b);               // дно
    idx.push(n + a, n + b, n + c);   // верх
  }

  // Боковые стены
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const base = pos.length / 3;
    pos.push(
      pts[i][0], y0, -pts[i][1],
      pts[j][0], y0, -pts[j][1],
      pts[j][0], y1, -pts[j][1],
      pts[i][0], y1, -pts[i][1]
    );
    idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }
  return finalizeGeometry(pos, idx, null, color);
}

// 3. A-18: Тело вращения по профилю (Lathe)
export function buildLatheGeometry({ profile, segments = 12, y = 0, color = '#9ab2c8' } = {}) {
  if (!Array.isArray(profile) || profile.length < 2) {
    throw new RatCoreError('RC-201', 'Профиль lathe должен содержать >= 2 точек [r, h]', 'Укажи profile: [[r0,h0],[r1,h1],...].');
  }
  const seg = Math.max(4, segments | 0);
  const pos = [];
  const idx = [];
  const rows = profile.length;

  for (let r = 0; r < rows; r++) {
    const rad = Math.max(0, Number(profile[r][0]));
    const py = y + Number(profile[r][1]);
    for (let s = 0; s <= seg; s++) {
      const ang = (s / seg) * Math.PI * 2;
      pos.push(Math.cos(ang) * rad, py, Math.sin(ang) * rad);
    }
  }
  const stride = seg + 1;
  for (let r = 0; r < rows - 1; r++) {
    for (let s = 0; s < seg; s++) {
      const a = r * stride + s;
      const b = a + 1;
      const c = a + stride;
      const d = c + 1;
      idx.push(a, c, b, b, c, d);
    }
  }
  return finalizeGeometry(pos, idx, null, color);
}

// 4. A-19: Воксели с Hidden Face Culling + 2D Greedy Meshing (слияние соседних одинаковых граней!)
export function buildVoxelsGreedyGeometry({ voxels = [], voxelSize = 1, color = '#76a4c8' } = {}) {
  if (!Array.isArray(voxels) || voxels.length === 0) {
    throw new RatCoreError('RC-201', 'Пустой массив вокселей', 'Передай массив voxels: [{ x, y, z, mat }].');
  }
  const map = new Map();
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  for (const v of voxels) {
    const ix = v.x | 0, iy = v.y | 0, iz = v.z | 0, mat = v.mat || 1;
    map.set(`${ix},${iy},${iz}`, mat);
    if (ix < minX) minX = ix; if (ix > maxX) maxX = ix;
    if (iy < minY) minY = iy; if (iy > maxY) maxY = iy;
    if (iz < minZ) minZ = iz; if (iz > maxZ) maxZ = iz;
  }
  const get = (x, y, z) => map.get(`${x},${y},${z}`) || 0;

  const pos = [];
  const idx = [];
  const s = voxelSize;
  const pushQuad = (a, b, c, d) => {
    const base = pos.length / 3;
    pos.push(...a, ...b, ...c, ...d);
    idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
  };

  // Проход по всем 3 осям × 2 направлениям с жадным слиянием прямоугольников на каждом срезе
  const dims = [
    { min: minX, max: maxX },
    { min: minY, max: maxY },
    { min: minZ, max: maxZ },
  ];

  for (let axis = 0; axis < 3; axis++) {
    const uAxis = (axis + 1) % 3;
    const vAxis = (axis + 2) % 3;
    const uMin = dims[uAxis].min, uMax = dims[uAxis].max, uLen = uMax - uMin + 1;
    const vMin = dims[vAxis].min, vMax = dims[vAxis].max, vLen = vMax - vMin + 1;

    for (const dir of [1, -1]) {
      for (let d = dims[axis].min; d <= dims[axis].max; d++) {
        const mask = new Int32Array(uLen * vLen);
        for (let iv = 0; iv < vLen; iv++) {
          for (let iu = 0; iu < uLen; iu++) {
            const p = [0, 0, 0];
            p[axis] = d; p[uAxis] = uMin + iu; p[vAxis] = vMin + iv;
            const mat = get(p[0], p[1], p[2]);
            if (!mat) continue;
            const n = [p[0], p[1], p[2]];
            n[axis] += dir;
            if (!get(n[0], n[1], n[2])) mask[iv * uLen + iu] = mat;
          }
        }

        // Жадное слияние прямоугольников в маске среза
        for (let iv = 0; iv < vLen; iv++) {
          for (let iu = 0; iu < uLen; iu++) {
            const mat = mask[iv * uLen + iu];
            if (!mat) continue;
            let w = 1;
            while (iu + w < uLen && mask[iv * uLen + iu + w] === mat) w++;
            let h = 1;
            outer: while (iv + h < vLen) {
              for (let k = 0; k < w; k++) {
                if (mask[(iv + h) * uLen + iu + k] !== mat) break outer;
              }
              h++;
            }
            for (let dy = 0; dy < h; dy++) {
              for (let dx = 0; dx < w; dx++) mask[(iv + dy) * uLen + iu + dx] = 0;
            }

            const plane = d + (dir > 0 ? 1 : 0);
            const pt = (u, v) => {
              const q = [0, 0, 0];
              q[axis] = plane * s;
              q[uAxis] = (uMin + u) * s;
              q[vAxis] = (vMin + v) * s;
              return q;
            };
            const p0 = pt(iu, iv);
            const p1 = pt(iu + w, iv);
            const p2 = pt(iu + w, iv + h);
            const p3 = pt(iu, iv + h);
            if (dir > 0) pushQuad(p0, p1, p2, p3);
            else pushQuad(p0, p3, p2, p1);
          }
        }
      }
    }
  }

  return finalizeGeometry(pos, idx, null, color);
}

// 5. Объединение нескольких геометрий со смещениями
export function combineGeometries(parts, color = '#88b4d8') {
  const pos = [];
  const idx = [];
  for (const part of parts) {
    const base = pos.length / 3;
    const ox = part.offset ? part.offset[0] : 0;
    const oy = part.offset ? part.offset[1] : 0;
    const oz = part.offset ? part.offset[2] : 0;
    const srcPos = part.buffers.positions;
    for (let i = 0; i < srcPos.length; i += 3) {
      pos.push(srcPos[i] + ox, srcPos[i + 1] + oy, srcPos[i + 2] + oz);
    }
    const srcIdx = part.buffers.indices;
    for (let i = 0; i < srcIdx.length; i++) idx.push(base + srcIdx[i]);
  }
  return finalizeGeometry(pos, idx, null, color);
}

// 6. Валидатор меша (RC-201..RC-204)
export function validateMeshBuffers(buffers, { maxTris = 50000 } = {}) {
  const { positions, indices } = buffers;
  const triCount = Math.floor(indices.length / 3);
  if (triCount <= 0) {
    throw new RatCoreError('RC-201', 'Меш не содержит ни одного треугольника', 'Проверь входные параметры генератора.');
  }
  if (triCount > maxTris) {
    throw new RatCoreError('RC-204', `Превышен бюджет треугольников (${triCount} > ${maxTris})`, 'Уменьши segments или включи Greedy Meshing / LOD.');
  }
  for (let i = 0; i < positions.length; i++) {
    if (!Number.isFinite(positions[i])) {
      throw new RatCoreError('RC-203', `Обнаружена NaN/Infinity координата вершины в индексе ${i}`, 'Проверь числовые параметры контура или профиля.');
    }
  }
  return { ok: true, triCount, vertexCount: positions.length / 3 };
}

// F-113: Упаковка вершины в PackedVertex64 (ровно 8 байт на вершину!)
export function packVertex64({ x, y, z, normalIdx = 0, uvU = 0, uvV = 0, matId = 0, ao = 3 }) {
  const b0 = clamp(Math.round(x * 16), 0, 255);
  const b1 = clamp(Math.round(y * 16), 0, 255);
  const b2 = clamp(Math.round(z * 16), 0, 255);
  const b3 = ((normalIdx & 0x7) << 5) | ((ao & 0x3) << 3) | (matId & 0x7);
  const lo = ((b3 << 24) | (b2 << 16) | (b1 << 8) | b0) >>> 0;
  const hi = (((matId >>> 3) & 0xff) << 16) | ((clamp(uvV | 0, 0, 255) << 8) | clamp(uvU | 0, 0, 255));
  return new Uint32Array([lo, hi >>> 0]);
}
