/* Чистая геометрия 2D-вида: сдвиг, зум, границы, сетка. Без DOM — проверяется тестами. */
import { WORLD2D } from './world2d.js';

export function screenToWorld(center, view, scale, sx, sy) {
  return { x: center.x + (sx - view.w / 2) / scale, y: center.y - (sy - view.h / 2) / scale };
}

export function worldToScreen(center, view, scale, x, y) {
  return { x: (x - center.x) * scale + view.w / 2, y: (center.y - y) * scale + view.h / 2 };
}

/* F-90: центр не выходит за карту; если экран шире мира — центр держится на нуле. */
export function clampCenter(center, view, scale, extent = WORLD2D.halfKm) {
  const halfW = Math.min(view.w / (2 * scale), extent);
  const halfH = Math.min(view.h / (2 * scale), extent);
  return {
    x: Math.max(-extent + halfW, Math.min(extent - halfW, center.x)),
    y: Math.max(-extent + halfH, Math.min(extent - halfH, center.y))
  };
}

/* F-93: зум к якорю — точка под курсором остаётся на месте. */
export function zoomAt(center, view, scale, next, anchor, limits = { min: 0.08, max: 200 }, extent = WORLD2D.halfKm) {
  const s = Math.max(limits.min, Math.min(limits.max, next));
  if (!anchor) return { center: clampCenter(center, view, s, extent), scale: s };
  const before = screenToWorld(center, view, scale, anchor.x, anchor.y);
  const after = screenToWorld(center, view, s, anchor.x, anchor.y);
  const moved = { x: center.x + before.x - after.x, y: center.y + before.y - after.y };
  return { center: clampCenter(moved, view, s, extent), scale: s };
}

/* Вписать весь мир в экран с полем 4 %. */
export function fitScale(view, pad = 0.96, sizeKm = WORLD2D.sizeKm) {
  return (Math.min(view.w, view.h) / sizeKm) * pad;
}

/* F-94: сдвиг — карта едет за рукой. */
export function shiftBy(center, view, scale, dx, dy, extent = WORLD2D.halfKm) {
  return clampCenter({ x: center.x - dx / scale, y: center.y + dy / scale }, view, scale, extent);
}

/* F-95: шаг сетки в километрах — крупнейший, чей квадрат не шире 220 px. */
const GRID_STEPS = [1, 2, 5, 10, 25, 50, 100, 250, 500, 1000];
export function gridStep(scale) {
  let step = GRID_STEPS[0];
  for (const s of GRID_STEPS) if (s * scale <= 220) step = s;
  return step;
}

/* F-99a: длина масштабной линейки — ближайшее значение не шире 160 px. */
export function scaleBarKm(scale) {
  const targets = [1, 2, 5, 10, 20, 50, 100, 250, 500, 1000, 2000];
  let km = targets[0];
  for (const t of targets) if (t * scale <= 160) km = t;
  return km;
}

/* F-98: пиксели патча — не больше 1024 по стороне. */
export function patchPixels(size, dpr, cap = 1024) {
  return Math.max(256, Math.min(cap, Math.round(size * dpr)));
}
