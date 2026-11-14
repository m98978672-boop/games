/* A28: рельеф по 12 шагам, без Math.random и без сети.
   Модуль чистый: одинаково работает в воркере и в главном потоке, проверяется в node. */

export const WORLD = {
  chunks: 6,        // 6 × 6 чанков
  chunkSize: 100,   // метров
  cells: 64,        // клеток на чанк
  waterLevel: 2.0,  // уровень воды, м
  erosion: 8,       // итераций эрозии (R-36.14: 8 = «мягкие» горы)
  seed: 20261114
};

export const CELL = WORLD.chunkSize / WORLD.cells;
export const HALF = WORLD.chunks * WORLD.chunkSize / 2;

/* ---------- детерминированный шум ---------- */
function hash2(ix, iy, seed) {
  let h = Math.imul(ix | 0, 374761393) ^ Math.imul(iy | 0, 668265263) ^ Math.imul(seed | 0, 1442695041);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

const smooth = (t) => t * t * (3 - 2 * t);

export function valueNoise(x, y, seed) {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = smooth(x - ix), fy = smooth(y - iy);
  const a = hash2(ix, iy, seed), b = hash2(ix + 1, iy, seed);
  const c = hash2(ix, iy + 1, seed), d = hash2(ix + 1, iy + 1, seed);
  return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy;
}

export function fbm(x, y, seed, octaves) {
  let sum = 0, amp = 1, freq = 1, norm = 0;
  for (let o = 0; o < octaves; o++) {
    sum += amp * valueNoise(x * freq, y * freq, seed + o * 17);
    norm += amp; amp *= 0.5; freq *= 2;
  }
  return sum / norm;
}

/* F-79: гребни — (1 − |2s − 1|)², только в квадрате, как в промте */
export const ridge = (s) => (1 - Math.abs(2 * s - 1)) ** 2;

export function ridgeFbm(x, y, seed, octaves) {
  let sum = 0, amp = 1, freq = 1, norm = 0;
  for (let o = 0; o < octaves; o++) {
    sum += amp * ridge(valueNoise(x * freq, y * freq, seed + o * 31));
    norm += amp; amp *= 0.5; freq *= 2;
  }
  return sum / norm;
}

const smoothstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/* ---------- 12 шагов (без эрозии): шаги 1–4, 7, 8 ---------- */
export function heightRaw(x, y) {
  // 3. domain warp
  const wx = fbm(x * 0.0021 + 5.3, y * 0.0021 + 9.1, 37, 2) - 0.5;
  const wy = fbm(x * 0.0021 - 7.7, y * 0.0021 + 3.3, 41, 2) - 0.5;
  const px = x + wx * 60, py = y + wy * 60;

  // 1. базовый FBM
  const base = fbm(px * 0.0042, py * 0.0042, 11, 4);
  // 2. ridged-гребни (F-79)
  const rid = ridgeFbm(px * 0.0062 + 31, py * 0.0062 - 17, 23, 3);
  // 4. маска плит
  const plate = smoothstep(0.42, 0.78, fbm(px * 0.0014, py * 0.0014, 53, 2));

  let h = 4 + 58 * base * base + 64 * rid * (0.35 + 0.65 * plate);
  h += (wx + wy) * 7;

  // 7. крупные формы: растягиваем к −8…117 м, чтобы были и море, и снег
  h = -8 + 125 * smoothstep(0, 1, (h - 14) / 66);

  // 8. террасы по 1 м (мягко, чтобы не было «зебры»)
  const frac = h - Math.floor(h);
  const terraced = Math.floor(h) + smooth(frac);
  h = h * 0.62 + terraced * 0.38;

  return Math.max(-6, h);
}

/* ---------- 5–6. эрозия и сток (упрощённые, но честные) ---------- */
function erode(heights, n, iterations) {
  const idx = (i, j) => j * n + i;
  for (let it = 0; it < iterations; it++) {
    for (let j = 1; j < n - 1; j++) {
      for (let i = 1; i < n - 1; i++) {
        const k = idx(i, j);
        const h = heights[k];
        let lowest = h, lowK = -1;
        const nb = [idx(i - 1, j), idx(i + 1, j), idx(i, j - 1), idx(i, j + 1)];
        for (const q of nb) if (heights[q] < lowest) { lowest = heights[q]; lowK = q; }
        if (lowK >= 0) {
          const dh = h - lowest;
          const move = Math.min(dh * 0.22, CELL * 0.6);
          heights[k] -= move;
          heights[lowK] += move * 0.85;
        }
      }
    }
  }
}

/* ---------- чанк: 65 × 65 высот ---------- */
export function generateChunk(cx, cy, opts = {}) {
  const n = (opts.cells || WORLD.cells) + 1;
  const size = opts.chunkSize || WORLD.chunkSize;
  const cell = size / (n - 1);
  const erosion = opts.erosion === undefined ? WORLD.erosion : opts.erosion;
  const x0 = -HALF + cx * size;
  const z0 = -HALF + cy * size;
  const heights = new Float32Array(n * n);
  let min = Infinity, max = -Infinity;
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      const h = heightRaw(x0 + i * cell, z0 + j * cell);
      heights[j * n + i] = h;
      if (h < min) min = h;
      if (h > max) max = h;
    }
  }
  if (erosion > 0) erode(heights, n, erosion);
  min = Infinity; max = -Infinity;
  for (let k = 0; k < heights.length; k++) {
    if (heights[k] < min) min = heights[k];
    if (heights[k] > max) max = heights[k];
  }
  return { cx, cy, n, cell, size, x0, z0, heights, min, max, erosion };
}
