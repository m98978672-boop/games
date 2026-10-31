// ============================================================================
//  Детерминированный генератор шума (FBM, Ridged) и геометрические примитивы
// ============================================================================

export function clamp(v, lo, hi) {
  return v < lo ? lo : (v > hi ? hi : v);
}

export function smoothstep(e0, e1, x) {
  const t = clamp((x - e0) / (e1 - e0 || 1e-6), 0, 1);
  return t * t * (3 - 2 * t);
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function makeRng(seed = 20261031) {
  let s = (seed >>> 0) || 1;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash2(ix, iy) {
  let h = Math.imul(ix, 374761393) + Math.imul(iy, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

export function valueNoise2D(x, y) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const a = hash2(ix, iy);
  const b = hash2(ix + 1, iy);
  const c = hash2(ix, iy + 1);
  const d = hash2(ix + 1, iy + 1);
  return lerp(lerp(a, b, ux), lerp(c, d, ux), uy) * 2 - 1;
}

export function fbm2D(x, y, octaves = 5, lacunarity = 2.05, gain = 0.5) {
  let amp = 0.5;
  let freq = 1.0;
  let sum = 0.0;
  let norm = 0.0;
  for (let i = 0; i < octaves; i++) {
    sum += amp * valueNoise2D(x * freq, y * freq);
    norm += amp;
    freq *= lacunarity;
    amp *= gain;
  }
  return sum / (norm || 1);
}

export function ridged2D(x, y, octaves = 4) {
  let amp = 0.5;
  let freq = 1.0;
  let sum = 0.0;
  let norm = 0.0;
  for (let i = 0; i < octaves; i++) {
    const n = 1.0 - Math.abs(valueNoise2D(x * freq, y * freq));
    sum += amp * n * n;
    norm += amp;
    freq *= 2.1;
    amp *= 0.5;
  }
  return sum / (norm || 1);
}

/**
 * Расстояние до ломаной кривой с интерполяцией параметра t ∈ [0..1] вдоль всей длины
 * и локальных атрибутов узлов (ширина русла, отметка дна).
 */
export function samplePolyline(px, pz, points) {
  let bestDist2 = Infinity;
  let bestBed = 0;
  let bestWidth = 10;
  let bestTangentX = 0;
  let bestTangentZ = 1;
  let bestS = 0;

  let totalLen = 0;
  for (let i = 0; i < points.length - 1; i++) {
    totalLen += Math.hypot(points[i + 1].x - points[i].x, points[i + 1].z - points[i].z);
  }

  let accLen = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    const dx = b.x - a.x;
    const dz = b.z - a.z;
    const segLen2 = dx * dx + dz * dz || 1e-6;
    const segLen = Math.sqrt(segLen2);
    const t = clamp(((px - a.x) * dx + (pz - a.z) * dz) / segLen2, 0, 1);
    const cx = a.x + dx * t;
    const cz = a.z + dz * t;
    const d2 = (px - cx) * (px - cx) + (pz - cz) * (pz - cz);
    if (d2 < bestDist2) {
      bestDist2 = d2;
      bestBed = lerp(a.bed, b.bed, t);
      bestWidth = lerp(a.width, b.width, t);
      bestTangentX = dx / segLen;
      bestTangentZ = dz / segLen;
      bestS = (accLen + segLen * t) / (totalLen || 1);
    }
    accLen += segLen;
  }

  return {
    dist: Math.sqrt(bestDist2),
    bed: bestBed,
    width: bestWidth,
    tx: bestTangentX,
    tz: bestTangentZ,
    s: bestS,
  };
}
