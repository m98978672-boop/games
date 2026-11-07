// Математика и геометрия: без зависимостей и без DOM.
export const TAU = Math.PI * 2;
export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const dist2 = (ax, ay, bx, by) => { const dx = bx - ax, dy = by - ay; return dx * dx + dy * dy; };
export const dist = (ax, ay, bx, by) => Math.sqrt(dist2(ax, ay, bx, by));
export const sign = (v) => (v > 0 ? 1 : v < 0 ? -1 : 0);
export const angleTo = (ax, ay, bx, by) => Math.atan2(by - ay, bx - ax);
export function normAngle(a) { while (a > Math.PI) a -= TAU; while (a < -Math.PI) a += TAU; return a; }
export function angleDiff(a, b) { return Math.abs(normAngle(a - b)); }
export function approachAngle(cur, target, maxStep) {
  const d = normAngle(target - cur);
  return cur + clamp(d, -maxStep, maxStep);
}
export function lerpAngle(cur, target, t) { return cur + normAngle(target - cur) * clamp(t, 0, 1); }
export function degToRad(d) { return (d * Math.PI) / 180; }
export function inRect(x, y, r) { return x >= r.x && y >= r.y && x <= r.x + r.w && y <= r.y + r.h; }

// Плоские гексы (flat-top), прямоугольная сетка со сдвигом нечётных столбцов (odd-q).
// Такой расклад покрывает карту-прямоугольник целиком, без «диагональной полосы».
const SQRT3 = Math.sqrt(3);
export function hexCenter(q, r, size, ox, oy) {
  return { x: ox + size * 1.5 * q, y: oy + size * SQRT3 * (r + (q & 1) * 0.5) };
}
export function pixelToHex(x, y, size, ox, oy) {
  const q = Math.round((x - ox) / (size * 1.5));
  const r = Math.round((y - oy) / (size * SQRT3) - (q & 1) * 0.5);
  return { q, r };
}
// Соседи для odd-q: у чётных и нечётных столбцов разные смещения.
export function hexNeighbors(q, r) {
  const dirs = (q & 1)
    ? [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [0, -1]]
    : [[1, -1], [1, 0], [0, 1], [-1, 0], [-1, -1], [0, -1]];
  return dirs.map(([dq, dr]) => ({ q: q + dq, r: r + dr }));
}
export function hexRound(q, r) {
  let x = q, z = r, y = -x - z;
  let rx = Math.round(x), ry = Math.round(y), rz = Math.round(z);
  const dx = Math.abs(rx - x), dy = Math.abs(ry - y), dz = Math.abs(rz - z);
  if (dx > dy && dx > dz) rx = -ry - rz;
  else if (dy > dz) ry = -rx - rz;
  else rz = -rx - ry;
  return { q: rx, r: rz };
}
export function hexDistance(aq, ar, bq, br) {
  // offset (odd-q) → axial, затем обычная гексагональная дистанция
  const aq2 = aq, ar2 = ar - ((aq - (aq & 1)) >> 1);
  const bq2 = bq, br2 = br - ((bq - (bq & 1)) >> 1);
  return (Math.abs(aq2 - bq2) + Math.abs(ar2 - br2) + Math.abs(aq2 + ar2 - bq2 - br2)) / 2;
}
export const HEX_DIRS = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]];
