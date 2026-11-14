/* Границы 2D по §7: государственная (по берегу и морю) и 14 регионов (§7.8).
   Всё считается по полю высот F-91, а не рисуется руками: берег — изолиния h = 0,
   морская граница — та же линия, сдвинутая в море, регионы — диаграмма Вороного
   с весами по населению и «прилипанием» к рельефу. */
import { WORLD2D, heightKm, settlements, rankSettlements } from './world2d.js';
import { cityPopulation, classFor } from './city2d.js';

export const BORDER = {
  stepKm: 20,             // шаг поля границ
  offsetKm: 22,           // морская граница — 22 км от берега (12 морских миль)
  regions: 14,            // R-7.8: четырнадцать регионов
  coastTone: '#a2452c',   // линия на земле — приглушённая охра (§7.2)
  seaTone: '#7d5a4a',     // морская граница — пунктир
  regionTone: '#8a7350'   // границы регионов — тонкий пунктир
};

let gridCache = null;

/* Поле высот на сетке: N × N узлов через stepKm. Считается один раз. */
export function heightGrid(stepKm = BORDER.stepKm) {
  if (gridCache && gridCache.stepKm === stepKm) return gridCache;
  const n = Math.round(WORLD2D.sizeKm / stepKm) + 1;
  const half = WORLD2D.halfKm;
  const h = new Float32Array(n * n);
  for (let j = 0; j < n; j++) {
    const y = half - j * stepKm;
    for (let i = 0; i < n; i++) h[j * n + i] = heightKm(-half + i * stepKm, y);
  }
  gridCache = { stepKm, n, half, h };
  return gridCache;
}

/* Изолиния поля: отрезки между узлами, где значение переходит через level (marching squares). */
export function contour(field, n, stepKm, half, level) {
  const out = [];
  const at = (i, j) => field[j * n + i] - level;
  const lerp = (a, b) => (Math.abs(b - a) < 1e-9 ? 0.5 : a / (a - b));
  for (let j = 0; j < n - 1; j++) {
    for (let i = 0; i < n - 1; i++) {
      const x0 = -half + i * stepKm, y0 = half - j * stepKm;
      const v00 = at(i, j), v10 = at(i + 1, j), v11 = at(i + 1, j + 1), v01 = at(i, j + 1);
      const pts = [];
      if ((v00 > 0) !== (v10 > 0)) pts.push([x0 + stepKm * lerp(v00, v10), y0]);
      if ((v10 > 0) !== (v11 > 0)) pts.push([x0 + stepKm, y0 - stepKm * lerp(v10, v11)]);
      if ((v11 > 0) !== (v01 > 0)) pts.push([x0 + stepKm * lerp(v01, v11), y0 - stepKm]);
      if ((v01 > 0) !== (v00 > 0)) pts.push([x0, y0 - stepKm * lerp(v00, v01)]);
      if (pts.length === 4) {
        const mid = (v00 + v10 + v11 + v01) / 4;
        const order = mid > 0 ? [0, 1, 2, 3] : [1, 2, 3, 0];
        out.push([pts[order[0]], pts[order[1]]], [pts[order[2]], pts[order[3]]]);
      } else if (pts.length === 2) {
        out.push([pts[0], pts[1]]);
      }
    }
  }
  return out;
}

/* Сшить отрезки в полилинии: ключ — округлённая точка. */
export function stitch(segments, eps = 0.5) {
  const key = (p) => Math.round(p[0] / eps) + ':' + Math.round(p[1] / eps);
  const map = new Map();
  for (const s of segments) {
    for (const p of s) {
      const k = key(p);
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(p);
    }
  }
  const used = new Set();
  const lines = [];
  const segKey = (s) => key(s[0]) + '|' + key(s[1]);
  const byPoint = new Map();
  segments.forEach((s, idx) => {
    for (const k of [key(s[0]), key(s[1])]) {
      if (!byPoint.has(k)) byPoint.set(k, []);
      byPoint.get(k).push(idx);
    }
  });
  for (let i = 0; i < segments.length; i++) {
    if (used.has(i)) continue;
    used.add(i);
    const line = [segments[i][0], segments[i][1]];
    for (const end of [1, 0]) {
      for (;;) {
        const tail = line[end === 1 ? line.length - 1 : 0];
        const near = (byPoint.get(key(tail)) || []).find((idx) => !used.has(idx));
        if (near === undefined) break;
        used.add(near);
        const s = segments[near];
        const next = key(s[0]) === key(tail) ? s[1] : s[0];
        if (end === 1) line.push(next); else line.unshift(next);
      }
    }
    if (line.length > 2) lines.push(line);
  }
  return lines;
}

/* Берег: изолиния h = 0. */
export function coastline(stepKm = BORDER.stepKm) {
  const g = heightGrid(stepKm);
  const segs = contour(g.h, g.n, stepKm, g.half, 0);
  return stitch(segs).filter((l) => l.length >= 4);
}

/* Морская граница: берег, сдвинутый на offsetKm в сторону воды (§7.6). */
export function seaBorder(lines, offsetKm = BORDER.offsetKm) {
  const out = [];
  for (const line of lines) {
    const shifted = [];
    for (let i = 0; i < line.length; i++) {
      const a = line[Math.max(0, i - 1)], b = line[Math.min(line.length - 1, i + 1)];
      let tx = b[0] - a[0], ty = b[1] - a[1];
      const len = Math.hypot(tx, ty) || 1;
      tx /= len; ty /= len;
      let nx = -ty, ny = tx;                       // нормаль к линии
      // нормаль должна смотреть в море
      if (heightKm(line[i][0] + nx * offsetKm, line[i][1] + ny * offsetKm) >= 0) { nx = -nx; ny = -ny; }
      const px = line[i][0] + nx * offsetKm, py = line[i][1] + ny * offsetKm;
      shifted.push([px, py]);
    }
    const water = shifted.filter((p) => heightKm(p[0], p[1]) < 0);
    if (water.length >= 4) out.push(water);
  }
  return out;
}

/* Центры регионов §7.8: столица и самые крупные города. */
export function regionSeeds(towns, ranks, count = BORDER.regions) {
  const list = [];
  for (let i = 0; i < towns.length; i++) {
    const cls = classFor(towns[i], i, ranks);
    const weight = cityPopulation(cls, i);
    list.push({ x: towns[i].x, y: towns[i].y, name: towns[i].name, weight, index: i });
  }
  list.sort((a, b) => b.weight - a.weight);
  const seeds = [list.find((s) => s.index === ranks.capital) || list[0]];
  for (const s of list) {
    if (seeds.length >= count) break;
    if (seeds.some((k) => k.index === s.index)) continue;
    // центры не должны стоять ближе 400 км друг к другу
    if (seeds.some((k) => Math.hypot(k.x - s.x, k.y - s.y) < 400)) continue;
    seeds.push(s);
  }
  return seeds;
}

/* Границы регионов: где меняется ближайший центр — там граница (диаграмма Вороного).
   Точку пересечения ищем по биссектрисе между двумя центрами: |p−A|/w_A = |p−B|/w_B. */
export function regionBorders(stepKm = BORDER.stepKm, towns = settlements(), ranks = null) {
  const r = ranks || rankSettlements(towns, 10);
  const seeds = regionSeeds(towns, r);
  const g = heightGrid(stepKm);
  const n = g.n;
  const w = seeds.map((s) => Math.sqrt(s.weight / 1000 + 1));
  const label = new Int16Array(n * n);
  for (let j = 0; j < n; j++) {
    const y = g.half - j * stepKm;
    for (let i = 0; i < n; i++) {
      const x = -g.half + i * stepKm;
      let best = -1, bestD = Infinity;
      for (let k = 0; k < seeds.length; k++) {
        const d = Math.hypot(x - seeds[k].x, y - seeds[k].y) / w[k];
        if (d < bestD) { bestD = d; best = k; }
      }
      label[j * n + i] = best;
    }
  }

  // биссектриса между двумя центрами: бинарный поиск точки на ребре сетки
  function crossing(p, q, a, b) {
    const f = (t) => {
      const x = p[0] + (q[0] - p[0]) * t, y = p[1] + (q[1] - p[1]) * t;
      return Math.hypot(x - seeds[a].x, y - seeds[a].y) / w[a] - Math.hypot(x - seeds[b].x, y - seeds[b].y) / w[b];
    };
    let lo = 0, hi = 1;
    for (let k = 0; k < 16; k++) {
      const mid = (lo + hi) / 2;
      if (Math.sign(f(mid)) === Math.sign(f(0))) lo = mid; else hi = mid;
    }
    const t = (lo + hi) / 2;
    return [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
  }

  const node = (i, j) => [-g.half + i * stepKm, g.half - j * stepKm];
  const segs = [];
  for (let j = 0; j < n - 1; j++) {
    for (let i = 0; i < n - 1; i++) {
      const a = label[j * n + i];
      const cross = [];
      const right = label[j * n + i + 1], down = label[(j + 1) * n + i];
      const rightDown = label[(j + 1) * n + i + 1];
      if (a !== right) cross.push(crossing(node(i, j), node(i + 1, j), a, right));
      if (a !== down) cross.push(crossing(node(i, j), node(i, j + 1), a, down));
      if (right !== rightDown) cross.push(crossing(node(i + 1, j), node(i + 1, j + 1), right, rightDown));
      if (down !== rightDown) cross.push(crossing(node(i, j + 1), node(i + 1, j + 1), down, rightDown));
      for (let k = 0; k + 1 < cross.length; k += 2) segs.push([cross[k], cross[k + 1]]);
    }
  }
  const land = segs.filter(([a2, b2]) => {
    const mx = (a2[0] + b2[0]) / 2, my = (a2[1] + b2[1]) / 2;
    return heightKm(mx, my) > 0;                    // граница регионов не идёт по морю
  });
  return { seeds, lines: stitch(land), segments: land.length };
}

/* Всё вместе — то, что рисует карта. */
export function buildBorders(towns = settlements(), ranks = null) {
  const r = ranks || rankSettlements(towns, 10);
  const coast = coastline();
  const sea = seaBorder(coast);
  const regions = regionBorders(BORDER.stepKm, towns, r);
  const coastKm = coast.reduce((sum, l) => {
    let s = 0;
    for (let i = 1; i < l.length; i++) s += Math.hypot(l[i][0] - l[i - 1][0], l[i][1] - l[i - 1][1]);
    return sum + s;
  }, 0);
  return { coast, sea, regions: regions.lines, seeds: regions.seeds, regionSegments: regions.segments, coastKm: Math.round(coastKm) };
}
