// RatCore World — Единая система координат (X, Y, H, h), Floating Origin и проекция в 3D (F-04..F-06)
// X — восток (+вправо), Y — север (+вверх), H(X,Y) — высота поверхности (0 = уровень моря), h = H + Δ.

import { clamp, lerp } from '../core/math.js';
import { RatCoreError } from '../core/seal.js';

export const SEA_LEVEL = 0;
export const WATER_MIN_LAND_H = 0.5;

// F-06: Единственная точка проекции в правую 3D-систему сцены
export function worldToScene(x, y, h, origin = null) {
  const ox = origin ? origin.x : 0;
  const oy = origin ? origin.y : 0;
  const oh = origin ? origin.h : 0;
  return [x - ox, h - oh, -(y - oy)];
}

export function sceneToWorld(sx, sy, sz, origin = null) {
  const ox = origin ? origin.x : 0;
  const oy = origin ? origin.y : 0;
  const oh = origin ? origin.h : 0;
  return { x: sx + ox, y: -sz + oy, h: sy + oh };
}

// Азимут: 0° — север (+Y), по часовой стрелке (восток = 90°, юг = 180°, запад = 270°)
export function azimuthDeg(dx, dy) {
  const deg = (Math.atan2(dx, dy) * 180) / Math.PI;
  return (deg + 360) % 360;
}

// F-05: Билинейная интерполяция высоты H(X, Y) по регулярной сетке высот
export class HeightField {
  constructor({ width = 64, height = 64, cellSize = 1, originX = -32, originY = -32, data = null } = {}) {
    this.width = width;
    this.height = height;
    this.cellSize = cellSize;
    this.originX = originX;
    this.originY = originY;
    this.data = data ? new Float32Array(data) : new Float32Array(width * height);
  }

  inBounds(x, y) {
    const gx = (x - this.originX) / this.cellSize;
    const gy = (y - this.originY) / this.cellSize;
    return gx >= 0 && gy >= 0 && gx <= this.width - 1 && gy <= this.height - 1;
  }

  setCell(ix, iy, h) {
    if (ix < 0 || iy < 0 || ix >= this.width || iy >= this.height) return;
    this.data[iy * this.width + ix] = h;
  }

  getCell(ix, iy) {
    const cx = clamp(ix | 0, 0, this.width - 1);
    const cy = clamp(iy | 0, 0, this.height - 1);
    return this.data[cy * this.width + cx];
  }

  sampleHeight(x, y) {
    const gx = clamp((x - this.originX) / this.cellSize, 0, this.width - 1.0001);
    const gy = clamp((y - this.originY) / this.cellSize, 0, this.height - 1.0001);
    const x0 = Math.floor(gx);
    const y0 = Math.floor(gy);
    const fx = gx - x0;
    const fy = gy - y0;
    const h00 = this.getCell(x0, y0);
    const h10 = this.getCell(x0 + 1, y0);
    const h01 = this.getCell(x0, y0 + 1);
    const h11 = this.getCell(x0 + 1, y0 + 1);
    return lerp(lerp(h00, h10, fx), lerp(h01, h11, fx), fy);
  }

  sampleSlope(x, y) {
    const e = this.cellSize * 0.5;
    const hx = (this.sampleHeight(x + e, y) - this.sampleHeight(x - e, y)) / (2 * e);
    const hy = (this.sampleHeight(x, y + e) - this.sampleHeight(x, y - e)) / (2 * e);
    return Math.hypot(hx, hy);
  }

  assertPlacement(x, y, h, { allowWater = false, allowUnderground = false } = {}) {
    if (!this.inBounds(x, y)) {
      throw new RatCoreError('RC-301', `Координата (${x}, ${y}) выходит за границы мира`, 'Используй координаты внутри карты.');
    }
    const groundH = this.sampleHeight(x, y);
    if (!allowWater && groundH < WATER_MIN_LAND_H) {
      throw new RatCoreError('RC-304', `Нельзя разместить наземный объект в воде (H=${groundH.toFixed(2)} < ${WATER_MIN_LAND_H})`, 'Передай allowWater: true или выбери сушу.');
    }
    if (!allowUnderground && h < groundH - 0.05) {
      throw new RatCoreError('RC-305', `Объект ниже поверхности земли (h=${h.toFixed(2)} < H=${groundH.toFixed(2)})`, 'Укажи snapToTerrain: true или h >= H.');
    }
    return groundH;
  }
}
