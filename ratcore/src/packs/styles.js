// RatCore Pack [pack:styles] — Пост-обработка стилей PS1, CRT, Тепловизор, ПНВ и Cel для RasterSurface (F-151..F-153, A-101)
// Подключается строго по выбору (Zero-Cost Opt-In, RC-108 когда пакет выключен).

import { clamp } from '../core/math.js';
import { packRGBA, unpackRGBA } from '../assets/raster.js';

export const STYLE_PRESETS = Object.freeze(['none', 'ps1', 'crt', 'thermal', 'nightvision', 'cel']);

export class StyleShaderPipeline {
  constructor() {
    this.activePreset = 'none';
    this.params = { ditherLevels: 5, scanlineStrength: 0.35 };
  }

  applyPreset({ preset = 'none', params = {} } = {}) {
    this.activePreset = STYLE_PRESETS.includes(preset) ? preset : 'none';
    this.params = { ...this.params, ...params };
    return { activePreset: this.activePreset, params: { ...this.params } };
  }

  // Применяет выбранный визуальный стиль прямо поверх RasterSurface (0 GPU-зависимостей!)
  processSurface(surface) {
    if (!surface || this.activePreset === 'none') return { applied: 'none' };
    const { width, height, pixels } = surface;

    if (this.activePreset === 'ps1') {
      surface.applyBayerDither(this.params.ditherLevels || 5);
      return { applied: 'ps1', pixelsProcessed: pixels.length };
    }

    if (this.activePreset === 'crt') {
      const scan = clamp(Number(this.params.scanlineStrength ?? 0.35), 0.1, 0.75);
      const cx = width * 0.5, cy = height * 0.5;
      for (let y = 0; y < height; y++) {
        const lineFactor = (y & 1) ? (1 - scan) : 1.0;
        for (let x = 0; x < width; x++) {
          const dx = (x - cx) / cx;
          const dy = (y - cy) / cy;
          const vig = clamp(1 - (dx * dx + dy * dy) * 0.32, 0.45, 1.0) * lineFactor;
          const idx = y * width + x;
          const [r, g, b, a] = unpackRGBA(pixels[idx]);
          pixels[idx] = packRGBA((r * vig) | 0, (g * vig) | 0, (b * vig) | 0, a);
        }
      }
      return { applied: 'crt', pixelsProcessed: pixels.length };
    }

    if (this.activePreset === 'thermal') {
      for (let i = 0; i < pixels.length; i++) {
        const [r, g, b, a] = unpackRGBA(pixels[i]);
        const t = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        // Палитра тепловизора: тёмно-синий -> пурпурный -> оранжевый -> жёлто-белый
        const tr = clamp(Math.round(Math.min(1, Math.max(0, (t - 0.25) * 1.8)) * 255), 0, 255);
        const tg = clamp(Math.round(Math.min(1, Math.max(0, (t - 0.55) * 2.2)) * 255), 0, 255);
        const tb = clamp(Math.round((t < 0.5 ? 0.35 + t * 1.2 : Math.max(0, (1 - t) * 1.6)) * 255), 0, 255);
        pixels[i] = packRGBA(tr, tg, tb, a);
      }
      return { applied: 'thermal', pixelsProcessed: pixels.length };
    }

    if (this.activePreset === 'nightvision') {
      for (let i = 0; i < pixels.length; i++) {
        const [r, g, b, a] = unpackRGBA(pixels[i]);
        const lum = clamp((0.299 * r + 0.587 * g + 0.114 * b) * 1.35 + ((i * 2654435761 >>> 24) & 15) - 7, 0, 255);
        pixels[i] = packRGBA((lum * 0.18) | 0, lum | 0, (lum * 0.24) | 0, a);
      }
      return { applied: 'nightvision', pixelsProcessed: pixels.length };
    }

    if (this.activePreset === 'cel') {
      const levels = 4;
      for (let i = 0; i < pixels.length; i++) {
        const [r, g, b, a] = unpackRGBA(pixels[i]);
        const qr = Math.round((r / 255) * levels) * (255 / levels);
        const qg = Math.round((g / 255) * levels) * (255 / levels);
        const qb = Math.round((b / 255) * levels) * (255 / levels);
        pixels[i] = packRGBA(qr | 0, qg | 0, qb | 0, a);
      }
      return { applied: 'cel', pixelsProcessed: pixels.length };
    }

    return { applied: 'none' };
  }
}
