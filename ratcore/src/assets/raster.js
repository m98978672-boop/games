// RatCore Assets — Растровый буфер RasterSurface (Uint32Array ABGR, без DOM: браузер + Node.js)

import { clamp } from '../core/math.js';

export function packRGBA(r, g, b, a = 255) {
  return (((a & 0xff) << 24) | ((b & 0xff) << 16) | ((g & 0xff) << 8) | (r & 0xff)) >>> 0;
}

export function unpackRGBA(abgr) {
  return [abgr & 0xff, (abgr >>> 8) & 0xff, (abgr >>> 16) & 0xff, (abgr >>> 24) & 0xff];
}

// F-151: Матрица Бейера 4×4 для упорядоченного дизеринга
const BAYER_4X4 = [
  0, 8, 2, 10,
  12, 4, 14, 6,
  3, 11, 1, 9,
  15, 7, 13, 5,
];

export class RasterSurface {
  constructor(width, height, fillColor = packRGBA(18, 26, 38, 255)) {
    this.width = Math.max(1, width | 0);
    this.height = Math.max(1, height | 0);
    this.pixels = new Uint32Array(this.width * this.height);
    if (fillColor !== 0) this.clear(fillColor);
  }

  clear(color) {
    this.pixels.fill(color >>> 0);
  }

  setPixel(x, y, color) {
    const ix = x | 0;
    const iy = y | 0;
    if (ix < 0 || iy < 0 || ix >= this.width || iy >= this.height) return;
    this.pixels[iy * this.width + ix] = color >>> 0;
  }

  getPixel(x, y) {
    const ix = clamp(x | 0, 0, this.width - 1);
    const iy = clamp(y | 0, 0, this.height - 1);
    return this.pixels[iy * this.width + ix];
  }

  blendPixel(x, y, r, g, b, alpha) {
    const ix = x | 0;
    const iy = y | 0;
    if (ix < 0 || iy < 0 || ix >= this.width || iy >= this.height) return;
    const a = clamp(alpha, 0, 1);
    const idx = iy * this.width + ix;
    const dst = this.pixels[idx];
    const dr = dst & 0xff;
    const dg = (dst >>> 8) & 0xff;
    const db = (dst >>> 16) & 0xff;
    const nr = (dr + (r - dr) * a) | 0;
    const ng = (dg + (g - dg) * a) | 0;
    const nb = (db + (b - db) * a) | 0;
    this.pixels[idx] = packRGBA(nr, ng, nb, 255);
  }

  fillRect(x, y, w, h, color) {
    const x0 = Math.max(0, x | 0);
    const y0 = Math.max(0, y | 0);
    const x1 = Math.min(this.width, (x + w) | 0);
    const y1 = Math.min(this.height, (y + h) | 0);
    for (let py = y0; py < y1; py++) {
      this.pixels.fill(color >>> 0, py * this.width + x0, py * this.width + x1);
    }
  }

  // Линия Брезенхэма
  drawLine(x0, y0, x1, y1, color) {
    let ix0 = Math.round(x0);
    let iy0 = Math.round(y0);
    const ix1 = Math.round(x1);
    const iy1 = Math.round(y1);
    const dx = Math.abs(ix1 - ix0);
    const dy = Math.abs(iy1 - iy0);
    const sx = ix0 < ix1 ? 1 : -1;
    const sy = iy0 < iy1 ? 1 : -1;
    let err = dx - dy;

    while (true) {
      this.setPixel(ix0, iy0, color);
      if (ix0 === ix1 && iy0 === iy1) break;
      const e2 = 2 * err;
      if (e2 > -dy) { err -= dy; ix0 += sx; }
      if (e2 < dx) { err += dx; iy0 += sy; }
    }
  }

  fillCircle(cx, cy, radius, color) {
    const r = Math.max(1, Math.round(radius));
    const r2 = r * r;
    const x0 = Math.max(0, Math.floor(cx - r));
    const x1 = Math.min(this.width - 1, Math.ceil(cx + r));
    const y0 = Math.max(0, Math.floor(cy - r));
    const y1 = Math.min(this.height - 1, Math.ceil(cy + r));
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const dx = x - cx;
        const dy = y - cy;
        if (dx * dx + dy * dy <= r2) this.pixels[y * this.width + x] = color >>> 0;
      }
    }
  }

  // F-151: Упорядоченный дизеринг Бейера 4×4 (ретро / PS1 стиль)
  applyBayerDither(levels = 6) {
    const lv = Math.max(2, levels | 0);
    const step = lv - 1;
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const idx = y * this.width + x;
        const t = (BAYER_4X4[((y & 3) << 2) | (x & 3)] + 0.5) / 16;
        const [r, g, b, a] = unpackRGBA(this.pixels[idx]);
        const qr = clamp(Math.floor((r / 255) * step + t) / step, 0, 1) * 255;
        const qg = clamp(Math.floor((g / 255) * step + t) / step, 0, 1) * 255;
        const qb = clamp(Math.floor((b / 255) * step + t) / step, 0, 1) * 255;
        this.pixels[idx] = packRGBA(qr | 0, qg | 0, qb | 0, a);
      }
    }
  }

  // Экспорт в текстовую ASCII-карту для нейросетей без vision
  toAscii(cols = 48, rows = 24) {
    const ramp = ' .:-=+*#%@';
    const lines = [];
    for (let ry = 0; ry < rows; ry++) {
      const py = Math.min(this.height - 1, Math.floor((ry / rows) * this.height));
      let line = '';
      for (let rx = 0; rx < cols; rx++) {
        const px = Math.min(this.width - 1, Math.floor((rx / cols) * this.width));
        const [r, g, b] = unpackRGBA(this.pixels[py * this.width + px]);
        const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        const idx = clamp(Math.floor(lum * (ramp.length - 1)), 0, ramp.length - 1);
        line += ramp[idx];
      }
      lines.push(line);
    }
    return lines.join('\n');
  }

  nonBackgroundRatio(bgColor) {
    let diff = 0;
    for (let i = 0; i < this.pixels.length; i++) {
      if (this.pixels[i] !== (bgColor >>> 0)) diff++;
    }
    return diff / this.pixels.length;
  }
}
