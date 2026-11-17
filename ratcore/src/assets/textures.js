// RatCore Assets — Процедурный генератор текстур RatTex + нормали Собеля + повреждённая версия (A-13)

import { clamp, fbm2D } from '../core/math.js';
import { packRGBA, unpackRGBA } from './raster.js';

function parseHexRGB(hex, fallback = [140, 160, 180]) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || '').trim());
  if (!m) return fallback;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// A-13: Автоматическая карта нормалей (оператор Собеля)
export function computeSobelNormals(pixels, width, height, strength = 2.0) {
  const normals = new Uint32Array(width * height);
  const lumAt = (x, y) => {
    const cx = ((x % width) + width) % width;
    const cy = ((y % height) + height) % height;
    const [r, g, b] = unpackRGBA(pixels[cy * width + cx]);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  };

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const tl = lumAt(x - 1, y - 1);
      const t = lumAt(x, y - 1);
      const tr = lumAt(x + 1, y - 1);
      const l = lumAt(x - 1, y);
      const r = lumAt(x + 1, y);
      const bl = lumAt(x - 1, y + 1);
      const b = lumAt(x, y + 1);
      const br = lumAt(x + 1, y + 1);

      const dx = (tr + 2 * r + br) - (tl + 2 * l + bl);
      const dy = (bl + 2 * b + br) - (tl + 2 * t + tr);
      const nx = -dx * strength;
      const ny = -dy * strength;
      const nz = 1.0;
      const len = Math.hypot(nx, ny, nz);
      normals[y * width + x] = packRGBA(
        clamp(((nx / len) * 0.5 + 0.5) * 255, 0, 255) | 0,
        clamp(((ny / len) * 0.5 + 0.5) * 255, 0, 255) | 0,
        clamp(((nz / len) * 0.5 + 0.5) * 255, 0, 255) | 0,
        255
      );
    }
  }
  return normals;
}

// Автоматическая повреждённая версия текстуры (для слота t + 2048)
export function buildDamagedPixels(pixels, width, height, seed = 101) {
  const out = new Uint32Array(pixels.length);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const [r, g, b, a] = unpackRGBA(pixels[idx]);
      const crack = Math.abs(fbm2D(x * 0.18, y * 0.18, { octaves: 3, seed }));
      const soot = Math.max(0, fbm2D(x * 0.08 + 7, y * 0.08 - 3, { octaves: 2, seed: seed + 19 }));
      const mult = crack < 0.08 ? 0.25 : (1 - soot * 0.45);
      out[idx] = packRGBA(clamp(r * mult, 0, 255) | 0, clamp(g * mult, 0, 255) | 0, clamp(b * mult, 0, 255) | 0, a);
    }
  }
  return out;
}

export function synthesizeTextureData({
  kind = 'noise',
  width = 32,
  height = 32,
  baseColor = '#6688aa',
  accentColor = '#33485c',
  seed = 1337,
  withNormals = true,
  withDamaged = true,
} = {}) {
  const w = clamp(width | 0, 4, 256);
  const h = clamp(height | 0, 4, 256);
  const pixels = new Uint32Array(w * h);
  const base = parseHexRGB(baseColor, [102, 136, 170]);
  const accent = parseHexRGB(accentColor, [51, 72, 92]);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let t = 0;
      const n = fbm2D((x / w) * 6, (y / h) * 6, { octaves: 3, seed }) * 0.5 + 0.5;
      if (kind === 'solid') {
        t = 0;
      } else if (kind === 'bricks') {
        const row = Math.floor(y / Math.max(4, h / 8));
        const bx = (x + (row % 2) * Math.floor(w / 8)) % Math.max(6, Math.floor(w / 4));
        const by = y % Math.max(4, Math.floor(h / 8));
        const mortar = bx === 0 || by === 0;
        t = mortar ? 0.85 : n * 0.35;
      } else if (kind === 'panels' || kind === 'metal') {
        const seam = x % Math.max(8, w >> 2) === 0 || y % Math.max(8, h >> 2) === 0;
        t = seam ? 0.75 : n * 0.25;
      } else if (kind === 'wood') {
        const grain = Math.sin((y / h) * 18 + n * 4) * 0.5 + 0.5;
        t = grain * 0.55;
      } else if (kind === 'water') {
        const wave = Math.sin((x / w) * Math.PI * 4 + n * 3) * 0.5 + 0.5;
        t = wave * 0.45;
      } else {
        // noise / grass / asphalt
        t = n * 0.65;
      }

      const r = clamp(base[0] + (accent[0] - base[0]) * t, 0, 255) | 0;
      const g = clamp(base[1] + (accent[1] - base[1]) * t, 0, 255) | 0;
      const b = clamp(base[2] + (accent[2] - base[2]) * t, 0, 255) | 0;
      pixels[y * w + x] = packRGBA(r, g, b, 255);
    }
  }

  return {
    width: w,
    height: h,
    pixels,
    normals: withNormals ? computeSobelNormals(pixels, w, h) : null,
    damagedPixels: withDamaged ? buildDamagedPixels(pixels, w, h, seed + 55) : null,
  };
}
