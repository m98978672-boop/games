// ============================================================
//  Процедурные текстуры: рисуются на canvas при запуске.
//  Никаких внешних файлов — но поверхность получает нормальную
//  детализацию вместо плоских пятен цвета.
// ============================================================

import * as THREE from 'three';
import { valueNoise, makeRng } from './noise.js';

const SIZE = 192;   // меньше — быстрее генерация, для лоу-поли этого достаточно

function makeCanvas(size = SIZE) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  // все наши канвасы много раз читаются через getImageData —
  // просим браузер держать их в памяти
  const original = canvas.getContext.bind(canvas);
  canvas.getContext = (type, options) => original(type, { willReadFrequently: true, ...options });
  return canvas;
}

/** Бесшовный шум: узлы решётки замыкаются по кругу */
function tileableNoise(size, cells, seed) {
  const data = new Float32Array(size * size);
  const fade = (t) => t * t * (3 - 2 * t);
  const lerp = (a, b, t) => a + (b - a) * t;

  const at = (ix, iy) => {
    const x = ((ix % cells) + cells) % cells;
    const y = ((iy % cells) + cells) % cells;
    return valueNoise(x + 0.5, y + 0.5, seed);
  };

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const fx = (x / size) * cells;
      const fy = (y / size) * cells;
      const ix = Math.floor(fx);
      const iy = Math.floor(fy);
      const tx = fade(fx - ix);
      const ty = fade(fy - iy);
      const a = at(ix, iy);
      const b = at(ix + 1, iy);
      const c = at(ix, iy + 1);
      const d = at(ix + 1, iy + 1);
      data[y * size + x] = lerp(lerp(a, b, tx), lerp(c, d, tx), ty);
    }
  }
  return data;
}

/** Многослойный бесшовный шум */
function fbmNoise(size, octaves, seed, baseCells = 4, gain = 0.5) {
  const out = new Float32Array(size * size);
  let amp = 1;
  let norm = 0;
  let cells = baseCells;
  for (let i = 0; i < octaves; i++) {
    const layer = tileableNoise(size, cells, seed + i * 97);
    for (let k = 0; k < out.length; k++) out[k] += layer[k] * amp;
    norm += amp;
    amp *= gain;
    cells *= 2;
  }
  for (let k = 0; k < out.length; k++) out[k] /= norm;
  return out;
}

function paintNoise(ctx, data, size, colorA, colorB, alpha = 1) {
  const img = ctx.getImageData(0, 0, size, size);
  const px = img.data;
  const a = new THREE.Color(colorA);
  const b = new THREE.Color(colorB);
  for (let i = 0; i < size * size; i++) {
    const t = data[i];
    const r = a.r + (b.r - a.r) * t;
    const g = a.g + (b.g - a.g) * t;
    const bl = a.b + (b.b - a.b) * t;
    px[i * 4] = Math.round(r * 255);
    px[i * 4 + 1] = Math.round(g * 255);
    px[i * 4 + 2] = Math.round(bl * 255);
    px[i * 4 + 3] = Math.round(255 * alpha);
  }
  ctx.putImageData(img, 0, 0);
}

/** Точечная деталь с заворотом по краям — текстура остаётся бесшовной */
function speckle(ctx, size, count, rng, colors, radiusRange = [0.4, 1.6], alphaRange = [0.05, 0.22]) {
  for (let i = 0; i < count; i++) {
    const x = rng() * size;
    const y = rng() * size;
    const r = radiusRange[0] + rng() * (radiusRange[1] - radiusRange[0]);
    const color = colors[Math.floor(rng() * colors.length)];
    ctx.globalAlpha = alphaRange[0] + rng() * (alphaRange[1] - alphaRange[0]);
    ctx.fillStyle = color;
    for (const dx of [-size, 0, size]) {
      for (const dy of [-size, 0, size]) {
        ctx.beginPath();
        ctx.arc(x + dx, y + dy, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  ctx.globalAlpha = 1;
}

/** Маленькие штрихи (травинки, волокна) с заворотом */
function strokes(ctx, size, count, rng, color, width = 1, lenRange = [4, 14], alpha = 0.3) {
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  for (let i = 0; i < count; i++) {
    const x = rng() * size;
    const y = rng() * size;
    const len = lenRange[0] + rng() * (lenRange[1] - lenRange[0]);
    const angle = rng() * Math.PI * 2;
    ctx.globalAlpha = alpha * (0.4 + rng() * 0.6);
    ctx.lineWidth = width * (0.6 + rng() * 0.9);
    for (const dx of [-size, 0, size]) {
      for (const dy of [-size, 0, size]) {
        ctx.beginPath();
        ctx.moveTo(x + dx, y + dy);
        ctx.quadraticCurveTo(
          x + dx + Math.cos(angle) * len * 0.5 + (rng() - 0.5) * 3,
          y + dy + Math.sin(angle) * len * 0.5 + (rng() - 0.5) * 3,
          x + dx + Math.cos(angle) * len,
          y + dy + Math.sin(angle) * len
        );
        ctx.stroke();
      }
    }
  }
  ctx.globalAlpha = 1;
}

function stripes(ctx, size, rng, color, count, alpha = 0.18) {
  ctx.strokeStyle = color;
  for (let i = 0; i < count; i++) {
    const x = rng() * size;
    const w = 1 + rng() * 3;
    ctx.globalAlpha = alpha * (0.3 + rng());
    ctx.lineWidth = w;
    for (const dx of [-size, 0, size]) {
      ctx.beginPath();
      const wobble = 3 + rng() * 7;
      ctx.moveTo(x + dx, -4);
      for (let y = 0; y <= size; y += 16) {
        ctx.lineTo(x + dx + Math.sin(y * 0.05 + i) * wobble, y);
      }
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
}

/** Трещины/грани для камня */
function cracks(ctx, size, rng, color, count) {
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  for (let i = 0; i < count; i++) {
    let x = rng() * size;
    let y = rng() * size;
    let angle = rng() * Math.PI * 2;
    const segs = 3 + Math.floor(rng() * 4);
    ctx.globalAlpha = 0.18 + rng() * 0.22;
    ctx.lineWidth = 0.7 + rng() * 1.4;
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let s = 0; s < segs; s++) {
      angle += (rng() - 0.5) * 1.1;
      const step = 6 + rng() * 16;
      x += Math.cos(angle) * step;
      y += Math.sin(angle) * step;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

/**
 * «Detail»-карта: светлая, почти белая, с сохранением царапин и рисунка.
 * Она умножается на цвет вершины, поэтому не должна его затемнять.
 */
function detailize(canvas, { lift = 0.62, contrast = 1.9, tint = 0.25 } = {}) {
  const size = canvas.width;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const img = ctx.getImageData(0, 0, size, size);
  const px = img.data;

  let sum = 0;
  for (let i = 0; i < size * size; i++) {
    sum += (px[i * 4] * 0.299 + px[i * 4 + 1] * 0.587 + px[i * 4 + 2] * 0.114) / 255;
  }
  const mean = sum / (size * size) || 0.5;

  const out = document.createElement('canvas');
  out.width = size;
  out.height = size;
  const octx = out.getContext('2d');
  const oimg = octx.createImageData(size, size);

  for (let i = 0; i < size * size; i++) {
    const r = px[i * 4] / 255;
    const g = px[i * 4 + 1] / 255;
    const b = px[i * 4 + 2] / 255;
    const lum = r * 0.299 + g * 0.587 + b * 0.114;
    // светлая база + контраст рисунка, слегка подкрашенная исходным оттенком
    let v = 1 - lift + (lum - mean) * contrast + lift * 0.92;
    v = Math.max(0.55, Math.min(1.0, v));
    const dr = v + (r - lum) * tint;
    const dg = v + (g - lum) * tint;
    const db = v + (b - lum) * tint;
    oimg.data[i * 4] = Math.max(0, Math.min(255, Math.round(dr * 255)));
    oimg.data[i * 4 + 1] = Math.max(0, Math.min(255, Math.round(dg * 255)));
    oimg.data[i * 4 + 2] = Math.max(0, Math.min(255, Math.round(db * 255)));
    oimg.data[i * 4 + 3] = 255;
  }
  octx.putImageData(oimg, 0, 0);
  return out;
}

function toTexture(canvas, { repeat = 1, srgb = true, aniso = 4 } = {}) {
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat, repeat);
  tex.anisotropy = aniso;
  if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

// ---------------- конкретные поверхности ----------------

function grassCanvas(size = SIZE) {
  const canvas = makeCanvas(size);
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const rng = makeRng(1021);

  paintNoise(ctx, fbmNoise(size, 4, 11, 4), size, 0x4f7a37, 0x8ab457);

  // крупные пятна выгоревшей/сочной травы
  const patches = fbmNoise(size, 2, 55, 2);
  const img = ctx.getImageData(0, 0, size, size);
  for (let i = 0; i < size * size; i++) {
    const t = patches[i];
    const warm = Math.max(0, t - 0.55) * 1.4;
    img.data[i * 4] = Math.min(255, img.data[i * 4] + warm * 90);
    img.data[i * 4 + 1] = Math.min(255, img.data[i * 4 + 1] + warm * 55);
    img.data[i * 4 + 2] = Math.max(0, img.data[i * 4 + 2] - warm * 25);
  }
  ctx.putImageData(img, 0, 0);

  strokes(ctx, size, 900, rng, '#9fc46a', 1, [5, 16], 0.35);
  strokes(ctx, size, 600, rng, '#3f6330', 1, [4, 12], 0.3);
  speckle(ctx, size, 500, rng, ['#c3d98a', '#6a9448', '#2f4d24'], [0.5, 1.6], [0.08, 0.25]);
  return canvas;
}

function sandCanvas(size = SIZE) {
  const canvas = makeCanvas(size);
  const ctx = canvas.getContext('2d');
  const rng = makeRng(2027);

  paintNoise(ctx, fbmNoise(size, 4, 23, 3), size, 0xcbb076, 0xe8d7a6);

  // волны прибоя
  ctx.strokeStyle = 'rgba(150, 125, 85, 0.22)';
  for (let i = 0; i < 18; i++) {
    const y = (i / 18) * size + rng() * 6;
    ctx.lineWidth = 1 + rng() * 2.2;
    for (const dy of [-size, 0, size]) {
      ctx.beginPath();
      for (let x = -8; x <= size + 8; x += 6) {
        const yy = y + dy + Math.sin((x / size) * Math.PI * 4 + i) * 4;
        x === -8 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy);
      }
      ctx.stroke();
    }
  }

  speckle(ctx, size, 1600, rng, ['#f2e4bf', '#a98f5f', '#7d6844'], [0.3, 1.1], [0.1, 0.3]);
  // редкие камешки
  speckle(ctx, size, 90, rng, ['#8b8377', '#6f6a61'], [1, 2.4], [0.25, 0.5]);
  return canvas;
}

function rockCanvas(size = SIZE) {
  const canvas = makeCanvas(size);
  const ctx = canvas.getContext('2d');
  const rng = makeRng(3301);

  paintNoise(ctx, fbmNoise(size, 4, 41, 5), size, 0x6e6a62, 0xa8a196);
  cracks(ctx, size, rng, '#4a463f', 34);
  cracks(ctx, size, rng, '#c8c1b4', 16);

  // грани: случайные многоугольники с лёгкой заливкой
  for (let i = 0; i < 40; i++) {
    const cx = rng() * size;
    const cy = rng() * size;
    const r = 10 + rng() * 30;
    const sides = 3 + Math.floor(rng() * 3);
    ctx.globalAlpha = 0.05 + rng() * 0.12;
    ctx.fillStyle = rng() > 0.5 ? '#e0d9cc' : '#3a362f';
    for (const dx of [-size, 0, size]) {
      for (const dy of [-size, 0, size]) {
        ctx.beginPath();
        for (let s = 0; s < sides; s++) {
          const a = (s / sides) * Math.PI * 2 + rng() * 0.3;
          const rr = r * (0.7 + rng() * 0.5);
          const x = cx + dx + Math.cos(a) * rr;
          const y = cy + dy + Math.sin(a) * rr;
          s === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
      }
    }
  }
  ctx.globalAlpha = 1;
  speckle(ctx, size, 700, rng, ['#bdb5a6', '#57534b', '#8b8579'], [0.4, 1.4], [0.1, 0.3]);
  return canvas;
}

function dirtCanvas(size = SIZE) {
  const canvas = makeCanvas(size);
  const ctx = canvas.getContext('2d');
  const rng = makeRng(4409);
  paintNoise(ctx, fbmNoise(size, 4, 67, 4), size, 0x5b4632, 0x8a6b4a);
  speckle(ctx, size, 900, rng, ['#3f3022', '#a2805c', '#6b5238'], [0.4, 1.8], [0.1, 0.3]);
  strokes(ctx, size, 220, rng, '#3a2c1f', 1, [4, 10], 0.25);
  return canvas;
}

function barkCanvas(size = SIZE) {
  const canvas = makeCanvas(size);
  const ctx = canvas.getContext('2d');
  const rng = makeRng(5501);
  paintNoise(ctx, fbmNoise(size, 3, 71, 4, 0.55), size, 0x6a4c31, 0x9a7048);
  stripes(ctx, size, rng, '#3f2d1c', 90, 0.3);
  stripes(ctx, size, rng, '#b48c5c', 50, 0.16);
  speckle(ctx, size, 300, rng, ['#33241a', '#8a6644'], [0.5, 1.4], [0.1, 0.28]);
  return canvas;
}

function leafCanvas(size = SIZE) {
  const canvas = makeCanvas(size);
  const ctx = canvas.getContext('2d');
  const rng = makeRng(6607);
  paintNoise(ctx, fbmNoise(size, 3, 83, 5), size, 0x2f5c2b, 0x69a04a);
  strokes(ctx, size, 260, rng, '#8fc46a', 1, [6, 18], 0.22);
  strokes(ctx, size, 200, rng, '#203f1e', 1, [5, 14], 0.25);
  speckle(ctx, size, 400, rng, ['#a8d17c', '#254a22'], [0.6, 2], [0.1, 0.26]);
  return canvas;
}

function woodCanvas(size = SIZE) {
  const canvas = makeCanvas(size);
  const ctx = canvas.getContext('2d');
  const rng = makeRng(7703);
  paintNoise(ctx, fbmNoise(size, 3, 97, 3), size, 0x9a7a4f, 0xc4a271);
  stripes(ctx, size, rng, '#6d5232', 40, 0.28);
  strokes(ctx, size, 180, rng, '#7a5c38', 1, [8, 26], 0.2);
  return canvas;
}

function clothCanvas(size = SIZE) {
  const canvas = makeCanvas(size);
  const ctx = canvas.getContext('2d');
  const rng = makeRng(8809);
  paintNoise(ctx, fbmNoise(size, 3, 109, 4), size, 0x8a6b45, 0xa98a5d);
  // плетение ткани
  ctx.globalAlpha = 0.12;
  ctx.strokeStyle = '#4a3826';
  for (let i = 0; i < size; i += 3) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, size); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(size, i); ctx.stroke();
  }
  ctx.globalAlpha = 1;
  speckle(ctx, size, 260, rng, ['#c2a377', '#6b5235'], [0.5, 1.4], [0.08, 0.22]);
  return canvas;
}

function skinCanvas(size = 128) {
  const canvas = makeCanvas(size);
  const ctx = canvas.getContext('2d');
  const rng = makeRng(9911);
  paintNoise(ctx, fbmNoise(size, 3, 127, 4), size, 0xb2794f, 0xd9a071);
  speckle(ctx, size, 200, rng, ['#e8b98c', '#9a6642'], [0.4, 1.2], [0.06, 0.16]);
  return canvas;
}

function cloudCanvas(size = 256) {
  const canvas = makeCanvas(size);
  const ctx = canvas.getContext('2d');
  const rng = makeRng(1113);
  ctx.clearRect(0, 0, size, size);
  for (let i = 0; i < 26; i++) {
    const x = size * 0.5 + (rng() - 0.5) * size * 0.62;
    const y = size * 0.5 + (rng() - 0.5) * size * 0.4;
    const r = size * (0.10 + rng() * 0.17);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(255,255,255,0.42)');
    g.addColorStop(0.55, 'rgba(255,255,255,0.20)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  return canvas;
}

function softDotCanvas(size = 64) {
  const canvas = makeCanvas(size);
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.4, 'rgba(255,255,255,0.65)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return canvas;
}

/**
 * Все текстуры игры. Создаются один раз.
 * Ключи используются в материалах и шейдере местности.
 */
/** Заглушки на случай, если canvas недоступен (тесты в jsdom) */
function fallbackTextures() {
  const keys = [
    'grass', 'sand', 'rock', 'dirt', 'bark', 'leaf',
    'wood', 'cloth', 'skin', 'rockDetail', 'cloud', 'dot',
  ];
  const out = {};
  const data = new Uint8Array([235, 235, 235, 255]);
  for (const key of keys) {
    const texture = new THREE.DataTexture(data, 1, 1);
    texture.needsUpdate = true;
    out[key] = texture;
  }
  return out;
}

export function createTextures(maxAnisotropy = 4) {
  try {
    return buildTextures(maxAnisotropy);
  } catch (err) {
    // без 2D-canvas (jsdom) игра всё равно должна запускаться
    console.warn('Текстуры недоступны, используются заглушки:', err && err.message);
    return fallbackTextures();
  }
}

function buildTextures(maxAnisotropy = 4) {
  const tex = (canvas, repeat, srgb = true) => toTexture(canvas, { repeat, srgb, aniso: maxAnisotropy });

  const bark = barkCanvas();
  const leaf = leafCanvas();
  const wood = woodCanvas();
  const cloth = clothCanvas();
  const skin = skinCanvas();
  const rock = rockCanvas();
  const grass = grassCanvas();
  const sand = sandCanvas();
  const dirt = dirtCanvas();

  return {
    // цветные карты — для местности (там цвет берётся из текстуры)
    grass: tex(grass, 1),
    sand: tex(sand, 1),
    rock: tex(rock, 1),
    dirt: tex(dirt, 1),

    // светлые detail-карты — для растений и предметов
    bark: tex(detailize(bark, { lift: 0.5, contrast: 3.1, tint: 0.5 }), 1),
    leaf: tex(detailize(leaf, { lift: 0.5, contrast: 2.1 }), 1),
    wood: tex(detailize(wood), 1),
    cloth: tex(detailize(cloth), 1),
    skin: tex(detailize(skin, { lift: 0.35, contrast: 1.2, tint: 0.6 }), 1),
    rockDetail: tex(detailize(rock, { lift: 0.5, contrast: 2.8 }), 1),
    grassDetail: tex(detailize(grass, { lift: 0.55, contrast: 1.9, tint: 0.45 }), 1),
    cloud: toTexture(cloudCanvas(), { repeat: 1, srgb: true, aniso: 1 }),
    dot: toTexture(softDotCanvas(), { repeat: 1, srgb: false, aniso: 1 }),
  };
}
