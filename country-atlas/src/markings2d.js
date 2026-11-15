/* Разметка и развязки §8.9–8.14 в 2D. В 3D это была геометрия полос; сверху разметка —
   это линии вдоль дороги, а развязка — значок в узле. Всё считается по масштабу: до 25 px/км
   разметки не видно (дорога тоньше пикселя), в глубоком зуме видно полосы, «зебру» и кольца. */

export const MARK_LOD = 25;        // px/км: с этого масштаба рисуем разметку
export const JUNCTION_LOD = 12;    // px/км: с этого — значки развязок

/* R-8.14: число полос по классу дороги (в одну сторону — половина). */
export const LANES = { M: 4, R: 2, L: 1, G: 1, F: 0 };

/* R-58.1: в глубоком зуме дорога перестаёт быть «картографической лентой» и становится
   асфальтом — иначе белая разметка не читается на кремовой ленте. */
export const ASPHALT_LOD = 60;

export function roadFill(cls, scale) {
  if (scale < ASPHALT_LOD) return null;
  const tones = { M: 'rgba(74,76,80,0.95)', R: 'rgba(86,86,84,0.95)', L: 'rgba(106,100,88,0.92)', G: 'rgba(128,106,76,0.9)' };
  return tones[cls] || null;
}

/* F-163: толщина линии разметки в пикселях: 0.15 м на карте, но не тоньше 1.1 px. */
export function markingWidthPx(scale, widthM = 0.15) {
  return Math.max(1.1, (widthM * scale) / 1000);
}

/* F-164: шаг прерывистой осевой. Настоящая разметка — 4 м штрих / 8 м промежуток,
   в пикселях масштабируется, но штрих не короче 1.6 px, иначе он исчезает. */
export function dashPattern(scale) {
  const strokeM = 4, gapM = 8;
  const stroke = Math.max(1.6, (strokeM * scale) / 1000);
  const gap = Math.max(2.2, (gapM * scale) / 1000);
  return { stroke, gap, period: stroke + gap };
}

/* F-165: где сплошная вместо прерывистой. Радиус поворота по трём точкам; если он меньше
   порога класса (M 80 м, R 40 м, L 25 м — R-8.7), осевая сплошная. */
export function turnRadiusM(a, b, c) {
  const ax = a[0], ay = a[1], bx = b[0], by = b[1], cx = c[0], cy = c[1];
  const A = Math.hypot(bx - ax, by - ay), B = Math.hypot(cx - bx, cy - by), C = Math.hypot(cx - ax, cy - ay);
  const area = Math.abs((bx - ax) * (cy - ay) - (by - ay) * (cx - ax)) / 2;   // км²
  if (area < 1e-9) return Infinity;                                          // прямая
  return (A * B * C) / (4 * area) * 1000;                                     // метры
}

export const MIN_RADIUS_M = { M: 80, R: 40, L: 25, G: 15, F: 60 };

export function isSolidAt(cls, radiusM) {
  return radiusM < (MIN_RADIUS_M[cls] || 25);
}

/* F-166: тип развязки по R-8.9 — класс дорог, угол и запас места.
   «Клевер» — M с M при пологом угле и месте; «труба» — острый угол или M с R;
   «кольцо» — тесно; «перекрёсток» — региональные и местные. */
export function junctionType(clsA, clsB, angleDeg, spaceKm) {
  const big = (clsA === 'M' && clsB === 'M');
  const mid = (clsA === 'M' && clsB === 'R') || (clsA === 'R' && clsB === 'M');
  if (!big && !mid) return 'crossing';
  if (spaceKm < 0.35) return 'ring';            // тесно — кольцо с эстакадой
  if (angleDeg < 60) return 'trumpet';          // острый угол — труба
  return big ? 'clover' : 'trumpet';            // M×M — клевер, M×R — труба
}

/* F-167: диаметр кольца по R-8.11 (26–60 м) — от числа полос на въезде. */
export function ringDiameterM(lanesIn) {
  return Math.max(26, Math.min(60, 22 + 6 * Math.max(1, lanesIn)));
}

/* F-168: «зебра» у въезда в город: сколько полос и на каком удалении от узла.
   Переход ставим в 80…120 м от перекрёстка, полоса 0.5 м через 0.5 м. */
export function zebra(scale, widthM) {
  if (scale < MARK_LOD) return null;
  const roadW = (widthM * scale) / 1000;         // ширина дороги в px
  const stripe = Math.max(0.8, 0.5 * scale / 1000);
  const count = Math.max(3, Math.min(12, Math.round(roadW / (stripe * 2))));
  return { stripe, gap: stripe, count, widthPx: count * stripe * 2 };
}

/* R-58.2: отсечение ломаной по кадру (Лян—Барский по сегментам). В глубоком зуме дорога
   длиной в тысячи километров — это миллионы пикселей пути; рисовать её целиком нельзя. */
export function clipPolyline(pts, x0, y0, x1, y1) {
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const seg = clipSegment(pts[i], pts[i + 1], x0, y0, x1, y1);
    if (!seg) continue;
    if (!out.length || out[out.length - 1][0] !== seg[0][0] || out[out.length - 1][1] !== seg[0][1]) out.push(seg[0]);
    out.push(seg[1]);
  }
  return out;
}

function clipSegment(a, b, x0, y0, x1, y1) {
  let t0 = 0, t1 = 1;
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const tests = [[-dx, a[0] - x0], [dx, x1 - a[0]], [-dy, a[1] - y0], [dy, y1 - a[1]]];
  for (const [p, q] of tests) {
    if (p === 0) { if (q < 0) return null; continue; }
    const r = q / p;
    if (p < 0) { if (r > t1) return null; if (r > t0) t0 = r; }
    else { if (r < t0) return null; if (r < t1) t1 = r; }
  }
  return [[a[0] + t0 * dx, a[1] + t0 * dy], [a[0] + t1 * dx, a[1] + t1 * dy]];
}

/* F-170: узлы дорожной сети: общие концы рёбер и близкие концы (≤ 2 км) — это перекрёстки. */
export function junctions(edges) {
  const key = (p) => Math.round(p[0] / 2) + ':' + Math.round(p[1] / 2);
  const ends = new Map();
  for (let i = 0; i < edges.length; i++) {
    const e = edges[i];
    const a = e.points[0], b = e.points[e.points.length - 1];
    for (const [p, other] of [[a, b], [b, a]]) {
      const k = key(p);
      if (!ends.has(k)) ends.set(k, { x: p[0], y: p[1], list: [] });
      ends.get(k).list.push({ edge: i, cls: e.cls, away: Math.atan2(other[1] - p[1], other[0] - p[0]) });
    }
  }
  const RANK = { M: 4, R: 3, L: 2, G: 1, F: 0 };
  const out = [];
  for (const node of ends.values()) {
    if (node.list.length < 2) continue;
    // две самые крупные дороги узла задают его класс, угол — между ними (R-8.9)
    const top = node.list.slice().sort((a, b) => (RANK[b.cls] || 0) - (RANK[a.cls] || 0));
    const clsA = top[0].cls, clsB = top[1].cls;
    let d = Math.abs(top[0].away - top[1].away) * 180 / Math.PI;
    if (d > 180) d = 360 - d;
    const angleDeg = 180 - d;                    // 0 — прямая, 90 — крест
    out.push({ x: node.x, y: node.y, arms: node.list.length, angleDeg, clsA, clsB });
  }
  return out;
}
