// RatCore Core — Детерминированная математика, PRNG, хеши и процедурные шумы (F-02, F-16..F-18, F-34)
// Запрещено использовать Math.random() внутри симуляции.

export function clamp(v, min, max) {
  return v < min ? min : (v > max ? max : v);
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0 || 1), 0, 1);
  return t * t * (3 - 2 * t);
}

// F-02: Детерминированный PRNG Mulberry32 (одинаковый поток в браузере и Node.js)
export function createRng(seed = 1337) {
  let state = (seed >>> 0) || 1;
  return {
    get state() {
      return state;
    },
    next() {
      state = (state + 0x6d2b79f5) >>> 0;
      let t = Math.imul(state ^ (state >>> 15), 1 | state);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    range(min, max) {
      return min + (max - min) * this.next();
    },
    int(min, maxInclusive) {
      return min + Math.floor(this.next() * (maxInclusive - min + 1));
    },
    pick(arr) {
      return arr[Math.floor(this.next() * arr.length)];
    },
  };
}

// F-34: FNV-1a 32-bit хеш для буферов и строк (проверка целостности AssetVault)
export function fnv1a32Bytes(bytes) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < bytes.length; i++) {
    hash ^= bytes[i];
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

export function fnv1a32String(str) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i) & 0xff;
    hash = Math.imul(hash, 0x01000193) >>> 0;
    if (str.charCodeAt(i) > 0xff) {
      hash ^= (str.charCodeAt(i) >>> 8) & 0xff;
      hash = Math.imul(hash, 0x01000193) >>> 0;
    }
  }
  return hash >>> 0;
}

export function fnv1a32TypedArray(arr) {
  const bytes = new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);
  return fnv1a32Bytes(bytes);
}

// Векторные операции 3D
export function vec3(x = 0, y = 0, z = 0) {
  return [x, y, z];
}

export function vec3Sub(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

export function vec3Cross(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

export function vec3Dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

export function vec3Normalize(v) {
  const len = Math.hypot(v[0], v[1], v[2]);
  if (len < 1e-12) return [0, 1, 0];
  return [v[0] / len, v[1] / len, v[2] / len];
}

// Детерминированный 2D value-noise + FBM + Ridged + Domain Warp (F-16..F-18)
function hash2i(ix, iy, seed) {
  let h = Math.imul(ix | 0, 374761393) ^ Math.imul(iy | 0, 668265263) ^ Math.imul(seed | 0, 1442695041);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

export function valueNoise2D(x, y, seed = 1337) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const a = hash2i(ix, iy, seed);
  const b = hash2i(ix + 1, iy, seed);
  const c = hash2i(ix, iy + 1, seed);
  const d = hash2i(ix + 1, iy + 1, seed);
  return lerp(lerp(a, b, ux), lerp(c, d, ux), uy) * 2 - 1;
}

export function fbm2D(x, y, { octaves = 4, lacunarity = 2, gain = 0.5, seed = 1337 } = {}) {
  let sum = 0;
  let amp = 1;
  let freq = 1;
  let norm = 0;
  for (let i = 0; i < octaves; i++) {
    sum += amp * valueNoise2D(x * freq, y * freq, seed + i * 1013);
    norm += amp;
    amp *= gain;
    freq *= lacunarity;
  }
  return norm > 0 ? sum / norm : 0;
}

export function ridged2D(x, y, opts = {}) {
  const n = fbm2D(x, y, opts);
  const r = 1 - Math.abs(n);
  return r * r;
}

export function domainWarp2D(x, y, { strength = 0.6, seed = 1337, octaves = 3 } = {}) {
  const wx = fbm2D(x + 5.2, y + 1.3, { octaves, seed: seed + 17 });
  const wy = fbm2D(x - 3.7, y + 8.4, { octaves, seed: seed + 31 });
  return fbm2D(x + strength * wx, y + strength * wy, { octaves: octaves + 1, seed: seed + 53 });
}
