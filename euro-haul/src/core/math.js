// Базовые математические утилиты проекта «ЕВРОТРАК».
export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const smoothstep = (t) => {
  t = clamp(t, 0, 1);
  return t * t * (3 - 2 * t);
};
export const invLerp = (a, b, v) => (b === a ? 0 : clamp((v - a) / (b - a), 0, 1));
export const deg = (rad) => (rad * 180) / Math.PI;
export const rad = (d) => (d * Math.PI) / 180;

/** Детерминированный ГПСЧ (mulberry32). */
export function rng(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Стабильный хэш двух целых в [0,1). */
export function hash2(x, y) {
  let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

export function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Приближённое расстояние между географическими точками, км. */
export function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = rad(lat2 - lat1);
  const dLon = rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(clamp(a, 0, 1)));
}

export const wrapAngle = (a) => {
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
};

/** Плавное приближение угла к цели. */
export function approachAngle(current, target, maxDelta) {
  const d = wrapAngle(target - current);
  if (Math.abs(d) <= maxDelta) return target;
  return current + Math.sign(d) * maxDelta;
}

/** Catmull-Rom по четырём скалярам. */
export function catmull(p0, p1, p2, p3, t) {
  const t2 = t * t;
  const t3 = t2 * t;
  return (
    0.5 *
    (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
  );
}

/** Форматирование чисел с пробелами между разрядами. */
export function fmt(n) {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

export function fmtMoney(n) {
  return fmt(Math.round(n)) + ' €';
}

export function fmtTime(minutes) {
  const m = ((Math.floor(minutes) % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60);
  const mm = Math.floor(m % 60);
  return String(h).padStart(2, '0') + ':' + String(mm).padStart(2, '0');
}

export function fmtDuration(minutes) {
  const total = Math.max(0, Math.round(minutes));
  const d = Math.floor(total / 1440);
  const h = Math.floor((total % 1440) / 60);
  const m = total % 60;
  if (d > 0) return `${d} д ${h} ч`;
  if (h > 0) return `${h} ч ${m} мин`;
  return `${m} мин`;
}

export function fmtDistance(meters) {
  if (meters >= 1000) return (meters / 1000).toFixed(1).replace('.', ',') + ' км';
  return Math.round(meters) + ' м';
}

/** Простой A* по графу: nodes — Map(id -> {x,y,edges:[{to,cost}]}) */
export function astar(nodes, start, goal, heuristic) {
  if (start === goal) return [start];
  const open = new Set([start]);
  const g = new Map([[start, 0]]);
  const f = new Map([[start, heuristic(start, goal)]]);
  const came = new Map();
  while (open.size) {
    let current = null;
    let bestF = Infinity;
    for (const n of open) {
      const v = f.get(n) ?? Infinity;
      if (v < bestF) {
        bestF = v;
        current = n;
      }
    }
    if (current === null) break;
    if (current === goal) {
      const path = [current];
      while (came.has(current)) {
        current = came.get(current);
        path.unshift(current);
      }
      return path;
    }
    open.delete(current);
    const node = nodes.get(current);
    for (const edge of node.edges) {
      if (edge.blocked) continue;
      const tentative = (g.get(current) ?? Infinity) + edge.cost;
      if (tentative < (g.get(edge.to) ?? Infinity)) {
        came.set(edge.to, current);
        g.set(edge.to, tentative);
        f.set(edge.to, tentative + heuristic(edge.to, goal));
        open.add(edge.to);
      }
    }
  }
  return null;
}

/** Триангуляция Делоне (Bowyer–Watson) для построения дорожной сети. */
export function delaunay(points) {
  const n = points.length;
  if (n < 3) return [];
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of points) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  const dx = maxX - minX || 1;
  const dy = maxY - minY || 1;
  const dmax = Math.max(dx, dy);
  const midX = (minX + maxX) / 2;
  const midY = (minY + maxY) / 2;
  const verts = points.map((p) => ({ x: p.x, y: p.y }));
  verts.push({ x: midX - 20 * dmax, y: midY - dmax, _s: true });
  verts.push({ x: midX, y: midY + 20 * dmax, _s: true });
  verts.push({ x: midX + 20 * dmax, y: midY - dmax, _s: true });
  const i0 = n;
  const i1 = n + 1;
  const i2 = n + 2;

  const circum = (a, b, c) => {
    const ax = verts[a].x;
    const ay = verts[a].y;
    const bx = verts[b].x;
    const by = verts[b].y;
    const cx = verts[c].x;
    const cy = verts[c].y;
    const d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by));
    if (Math.abs(d) < 1e-12) return { x: 0, y: 0, r2: Infinity };
    const ux =
      ((ax * ax + ay * ay) * (by - cy) + (bx * bx + by * by) * (cy - ay) + (cx * cx + cy * cy) * (ay - by)) / d;
    const uy =
      ((ax * ax + ay * ay) * (cx - bx) + (bx * bx + by * by) * (ax - cx) + (cx * cx + cy * cy) * (bx - ax)) / d;
    return { x: ux, y: uy, r2: (ax - ux) ** 2 + (ay - uy) ** 2 };
  };

  let tris = [{ a: i0, b: i1, c: i2, ...circum(i0, i1, i2) }];
  for (let pi = 0; pi < n; pi++) {
    const p = verts[pi];
    const bad = [];
    const good = [];
    for (const t of tris) {
      const dxp = p.x - t.x;
      const dyp = p.y - t.y;
      if (dxp * dxp + dyp * dyp <= t.r2 + 1e-9) bad.push(t);
      else good.push(t);
    }
    const edges = new Map();
    for (const t of bad) {
      const pairs = [
        [t.a, t.b],
        [t.b, t.c],
        [t.c, t.a],
      ];
      for (const [u, v] of pairs) {
        const key = u < v ? `${u}:${v}` : `${v}:${u}`;
        const rec = edges.get(key);
        if (rec) rec.count++;
        else edges.set(key, { u, v, count: 1 });
      }
    }
    tris = good;
    for (const e of edges.values()) {
      if (e.count !== 1) continue;
      tris.push({ a: e.u, b: e.v, c: pi, ...circum(e.u, e.v, pi) });
    }
  }
  return tris
    .filter((t) => t.a < n && t.b < n && t.c < n)
    .map((t) => [t.a, t.b, t.c]);
}
