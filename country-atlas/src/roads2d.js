/* Дорожная сеть 2D по §8: каркас (MST) → избыточность → A* по сетке → сглаживание.
   Всё детерминировано: ни одного Math.random, только сид мира. */
import { WORLD2D, heightKm, moistureKm, settlements, rankSettlements } from './world2d.js';

export const CELL_KM = 20;                      // шаг сетки трассировки (мир 7000 км)
export const N = Math.round(WORLD2D.sizeKm / CELL_KM) + 1;   // 176 клеток

/* Классы дорог §8.1; U (городские) появятся вместе с улицами §9.3. */
export const ROAD_CLASS = {
  M: { id: 'M', name: 'Автомагистраль', widthM: 21, lanes: 4, speed: 110, tone: [255, 214, 110], dash: null },
  R: { id: 'R', name: 'Региональная', widthM: 14, lanes: 2, speed: 90, tone: [246, 240, 226], dash: null },
  L: { id: 'L', name: 'Местная', widthM: 8, lanes: 2, speed: 60, tone: [214, 200, 172], dash: null },
  G: { id: 'G', name: 'Грунтовая', widthM: 5, lanes: 1.5, speed: 30, tone: [176, 146, 104], dash: [4, 3] },
  F: { id: 'F', name: 'Паром', widthM: 6, lanes: 1, speed: 20, tone: [118, 190, 232], dash: [3, 4], ferry: true }
};

export const kmToCell = (km) => (km + WORLD2D.halfKm) / CELL_KM;
export const cellToKm = (c) => c * CELL_KM - WORLD2D.halfKm;
export const cellOf = (x, y) => {
  const i = Math.round(kmToCell(x)), j = Math.round(kmToCell(y));
  return Math.max(0, Math.min(N - 1, i)) + Math.max(0, Math.min(N - 1, j)) * N;
};

/* ---------- поле стоимости ---------- */
/* F-100: cost = dist · (1 + 6·(4·slope)² + 4·water + 3·forest − 0.8·nearTown − 0.5·nearRoad).
   slope — метры на метр, water — клетка ниже уровня моря (мост), forest — лес (m > 0.55). */
export function costAt(h, slope, water, forest, nearTown, nearRoad) {
  const s = 4 * slope;
  const v = 1 + 6 * s * s + 8 * water + 3 * forest - 0.8 * nearTown - 0.9 * nearRoad;
  return Math.max(0.25, v);
}

export function buildField() {
  const height = new Float32Array(N * N);
  const forest = new Uint8Array(N * N);
  const water = new Uint8Array(N * N);
  const slope = new Float32Array(N * N);
  const lod = CELL_KM;
  const nearTown = new Uint8Array(N * N);
  const towns = settlements();

  for (let j = 0; j < N; j++) {
    const y = cellToKm(j);
    for (let i = 0; i < N; i++) {
      const x = cellToKm(i);
      const k = i + j * N;
      const h = heightKm(x, y, lod);
      height[k] = h;
      // клетка считается водой, если вода есть в любом её углу: дорога не срезает залив
      let wet = h < 0;
      if (!wet) {
        const q = CELL_KM * 0.4;
        for (const [dx, dy] of [[-q, -q], [q, -q], [-q, q], [q, q]]) {
          if (heightKm(x + dx, y + dy, lod) < 0) { wet = true; break; }
        }
      }
      if (wet) water[k] = 1;
      else if (h > 40 && h < 900 && moistureKm(x, y) > 0.55) forest[k] = 1;
    }
  }
  for (let j = 0; j < N; j++) {
    for (let i = 0; i < N; i++) {
      const k = i + j * N;
      const hx0 = height[i + j * N] , hx1 = height[Math.min(N - 1, i + 1) + j * N];
      const hy0 = height[i + j * N], hy1 = height[i + Math.min(N - 1, j + 1) * N];
      slope[k] = Math.max(Math.abs(hx1 - hx0), Math.abs(hy1 - hy0)) / (CELL_KM * 1000);
    }
  }
  for (const t of towns) {
    const c = cellOf(t.x, t.y), ci = c % N, cj = (c / N) | 0;
    for (let dj = -3; dj <= 3; dj++) {
      for (let di = -3; di <= 3; di++) {
        const ii = ci + di, jj = cj + dj;
        if (ii >= 0 && ii < N && jj >= 0 && jj < N) nearTown[ii + jj * N] = 1;
      }
    }
  }
  // базовая стоимость клетки считается один раз: дальше A* только прибавляет скидку за дорогу
  const base = new Float32Array(N * N);
  for (let k = 0; k < N * N; k++) {
    base[k] = water[k] ? Infinity : costAt(height[k], slope[k], 0, forest[k], nearTown[k], 0);
  }
  return { height, forest, water, slope, nearTown, base, nearRoad: new Uint8Array(N * N), towns };
}

/* ---------- A* по сетке ---------- */
class Heap {
  constructor() { this.k = []; this.v = []; }
  get size() { return this.k.length; }
  push(key, val) {
    const k = this.k, v = this.v;
    let i = k.length; k.push(key); v.push(val);
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (k[p] <= key) break;
      k[i] = k[p]; v[i] = v[p]; i = p;
    }
    k[i] = key; v[i] = val;
  }
  pop() {
    const k = this.k, v = this.v;
    const topK = k[0], topV = v[0];
    const lastK = k.pop(), lastV = v.pop();
    if (k.length) {
      let i = 0;
      const n = k.length;
      for (;;) {
        const l = i * 2 + 1, r = l + 1;
        let m = i, mk = lastK;
        if (l < n && k[l] < mk) { m = l; mk = k[l]; }
        if (r < n && k[r] < mk) { m = r; }
        if (m === i) break;
        k[i] = k[m]; v[i] = v[m]; i = m;
      }
      k[i] = lastK; v[i] = lastV;
    }
    return { key: topK, val: topV };
  }
}

const NB = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];

/* Вода и суша определяются на том же шаге выборки, что и поле A*: иначе дорога «увидит»
   другой берег, чем сетка трассировки (F-109). */
export const WATER_LOD = CELL_KM;

export const HEURISTIC_WEIGHT = 1.8;   // взвешенный A*: в разы меньше раскрытий, путь чуть длиннее

export function trace(field, from, to, dirPenalty = 0) {
  const start = cellOf(from.x, from.y), goal = cellOf(to.x, to.y);
  const g = new Float32Array(N * N).fill(Infinity);
  const came = new Int32Array(N * N).fill(-1);
  const done = new Uint8Array(N * N);
  const heap = new Heap();
  g[start] = 0;
  heap.push(0, start);
  const gi = goal % N, gj = (goal / N) | 0;
  const hEst = (k) => {
    const i = k % N, j = (k / N) | 0;
    return Math.hypot(i - gi, j - gj) * CELL_KM;
  };
  let guard = 0;
  while (heap.size && guard++ < 400000) {
    const { key, val: k } = heap.pop();
    if (done[k]) continue;
    done[k] = 1;
    if (k === goal) break;
    const i = k % N, j = (k / N) | 0;
    const hHere = field.height[k];
    for (const [di, dj] of NB) {
      const ii = i + di, jj = j + dj;
      if (ii < 0 || jj < 0 || ii >= N || jj >= N) continue;
      const kk = ii + jj * N;
      if (done[kk]) continue;
      const diag = di !== 0 && dj !== 0;
      const dist = diag ? CELL_KM * Math.SQRT2 : CELL_KM;
      const slope = Math.abs(field.height[kk] - hHere) / (dist * 1000);
      if (field.water[kk]) continue;          // по морю не едем: там паром (F-109)
      if (diag && (field.water[i + di + j * N] || field.water[i + (j + dj) * N])) continue;  // не срезаем угол залива
      const extra = field.nearRoad[kk] ? 1 : 0;
      const c = dist * costAt(field.height[kk], slope, field.water[kk], field.forest[kk], field.nearTown[kk], extra);
      const cand = g[k] + c + (dirPenalty ? dirPenalty * dist * extra : 0);
      if (cand < g[kk]) {
        g[kk] = cand;
        came[kk] = k;
        heap.push(cand + HEURISTIC_WEIGHT * hEst(kk), kk);
      }
    }
  }
  if (came[goal] === -1 && goal !== start) return null;
  const path = [];
  for (let k = goal; k !== -1; k = came[k]) {
    path.push({ x: cellToKm(k % N), y: cellToKm((k / N) | 0) });
    if (k === start) break;
  }
  return path.reverse();
}

/* ---------- сглаживание и упрощение ---------- */
export function chaikin(pts, passes = 2) {
  let out = pts;
  for (let p = 0; p < passes; p++) {
    const next = [out[0]];
    for (let i = 0; i < out.length - 1; i++) {
      const a = out[i], b = out[i + 1];
      next.push({ x: 0.75 * a.x + 0.25 * b.x, y: 0.75 * a.y + 0.25 * b.y });
      next.push({ x: 0.25 * a.x + 0.75 * b.x, y: 0.25 * a.y + 0.75 * b.y });
    }
    next.push(out[out.length - 1]);
    out = next;
  }
  return out;
}

const distToLine = (p, a, b) => {
  const dx = b.x - a.x, dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return Math.hypot(p.x - a.x, p.y - a.y);
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
};

export function simplify(pts, tol = 0.8) {
  if (pts.length < 3) return pts.slice();
  let worst = 0, idx = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const d = distToLine(pts[i], pts[0], pts[pts.length - 1]);
    if (d > worst) { worst = d; idx = i; }
  }
  if (worst <= tol) return [pts[0], pts[pts.length - 1]];
  const left = simplify(pts.slice(0, idx + 1), tol);
  const right = simplify(pts.slice(idx), tol);
  return left.slice(0, -1).concat(right);
}

/* Хорда не пересекает воду: проверяем каждый километр (F-109). */
export function chordOnLand(a, b) {
  const len = Math.hypot(b.x - a.x, b.y - a.y);
  const steps = Math.max(1, Math.ceil(len / 2));
  for (let k = 0; k <= steps; k++) {
    const t = k / steps;
    if (heightKm(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, WATER_LOD) < 0) return false;
  }
  return true;
}

/* Упрощение с запретом «срезать» через воду: точка выбрасывается, только если хорда по суше
   и отклонение выброшенных точек не больше tol. Точки в воде выбрасываются заранее. */
export function simplifySafe(pts, tol = 2) {
  const land = pts.filter((p) => heightKm(p.x, p.y, WATER_LOD) >= 0);
  const src = land.length >= 2 ? land : pts.slice(0, 2);
  if (src.length < 3) return src.slice();
  const out = [src[0]];
  let i = 0;
  while (i < src.length - 1) {
    let j = i + 1;
    if (!chordOnLand(src[i], src[j])) { i++; continue; }
    while (j + 1 < src.length) {
      const a = src[i], b = src[j + 1];
      if (!chordOnLand(a, b)) break;
      let ok = true;
      for (let k = i + 1; k < j + 1; k++) {
        if (distToLine(src[k], a, b) > tol) { ok = false; break; }
      }
      if (!ok) break;
      j++;
    }
    out.push(src[j]);
    i = j;
  }
  const last = src[src.length - 1];
  if (out[out.length - 1] !== last && chordOnLand(out[out.length - 1], last)) out.push(last);
  return out;
}

/* Дорога не режет воду: мокрую хорду делим пополам, пока куски не станут сухими.
   Остаток короче 2 км — это и есть мост (F-105). */
export function repairLine(pts) {
  if (pts.length < 2) return pts.slice();
  const out = [pts[0]];
  const pushSafe = (a, b, depth) => {
    if (chordOnLand(a, b) || depth > 12) { out.push(b); return; }
    const m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    pushSafe(a, m, depth + 1);
    pushSafe(m, b, depth + 1);
  };
  for (let i = 1; i < pts.length; i++) pushSafe(out[out.length - 1], pts[i], 0);
  return out;
}

export const polyLength = (pts) => {
  let s = 0;
  for (let i = 1; i < pts.length; i++) s += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
  return s;
};

/* ---------- класс ребра (F-101) ---------- */
export function classFor(a, b, isHubA, isHubB) {
  if (isHubA && isHubB) return 'M';
  if (isHubA || isHubB) return 'R';
  return 'L';
}

/* ---------- каркас ---------- */
function mst(nodes, cost) {
  const used = new Array(nodes.length).fill(false);
  const best = new Array(nodes.length).fill(Infinity);
  const from = new Array(nodes.length).fill(-1);
  const edges = [];
  best[0] = 0;
  for (let step = 0; step < nodes.length; step++) {
    let pick = -1;
    for (let i = 0; i < nodes.length; i++) {
      if (!used[i] && (pick === -1 || best[i] < best[pick])) pick = i;
    }
    if (pick === -1 || best[pick] === Infinity) break;
    used[pick] = true;
    if (from[pick] !== -1) edges.push({ a: from[pick], b: pick, cost: best[pick] });
    for (let i = 0; i < nodes.length; i++) {
      if (used[i]) continue;
      const c = cost(nodes[pick], nodes[i]);
      if (c < best[i]) { best[i] = c; from[i] = pick; }
    }
  }
  return edges;
}

export function hubsOf(towns, hubCount = 10) {
  const r = rankSettlements(towns, hubCount);
  return { capital: r.capital, hubs: r.hubs };
}

/* ---------- сборка сети ---------- */
/* F-101: M — хаб↔хаб по каркасу, R — хаб↔поселение и резервные хаб↔хаб,
   L — поселение↔поселение, G — грунтовый второй выход. */
export function buildRoads() {
  const field = buildField();
  const towns = field.towns;
  const { capital, hubs } = hubsOf(towns, 10);
  const isHub = new Set(hubs);
  const edges = [];
  const key = (a, b) => (a < b ? a + '-' + b : b + '-' + a);
  const have = new Set();

  const cost = (i, j) => {
    const a = towns[i], b = towns[j];
    const d = Math.hypot(a.x - b.x, a.y - b.y);
    const climb = Math.abs(b.h - a.h) / Math.max(1, d);
    return d * (1 + 6 * Math.pow(climb * 4, 2));
  };

  const push = (i, j, cls, maxKm = 900) => {
    const k = key(i, j);
    const d = Math.hypot(towns[i].x - towns[j].x, towns[i].y - towns[j].y);
    if (i === j || have.has(k) || d > maxKm) return;
    have.add(k);
    edges.push({ a: i, b: j, cls });
  };

  // 1. каркас страны: хаб ↔ хаб
  const hubList = hubs.slice();
  for (const e of mst(hubList, (p, q) => cost(hubList.indexOf(p), hubList.indexOf(q)))) {
    push(hubList[e.a], hubList[e.b], 'M', 4500);
  }
  // 2. избыточность: у каждого хаба — второй короткий выход
  for (const i of hubs) {
    const others = hubs.filter((h) => h !== i).sort((p, q) => cost(i, p) - cost(i, q));
    for (const j of others) {
      if (!have.has(key(i, j))) { push(i, j, 'R', 2600); break; }
    }
  }
  // 3. каждое поселение — к ближайшему хабу
  for (let i = 0; i < towns.length; i++) {
    if (isHub.has(i)) continue;
    const near = hubs.slice().sort((p, q) => cost(i, p) - cost(i, q));
    push(i, near[0], 'R', 1600);
  }
  // 4. местные связи: поселение ↔ ближайшее поселение
  for (let i = 0; i < towns.length; i++) {
    if (isHub.has(i)) continue;
    let best = -1, bestC = Infinity;
    for (let j = 0; j < towns.length; j++) {
      if (i === j || have.has(key(i, j))) continue;
      const c = cost(i, j);
      if (c < bestC) { bestC = c; best = j; }
    }
    if (best !== -1) push(i, best, 'L', 900);
  }
  // 5. грунтовый второй выход — там, где связи мало
  for (let i = 0; i < towns.length; i++) {
    const deg = edges.filter((e) => e.a === i || e.b === i).length;
    if (deg >= 2) continue;
    let best = -1, bestC = Infinity;
    for (let j = 0; j < towns.length; j++) {
      if (i === j || have.has(key(i, j))) continue;
      const c = cost(i, j);
      if (c < bestC) { bestC = c; best = j; }
    }
    if (best !== -1) push(i, best, 'G', 700);
  }

  // 6. трассировка по рельефу, с притяжением к уже проложенным дорогам
  const out = [];
  const addFerry = (i, j, cls = 'F') => {
    const a = towns[i], b = towns[j];
    const line = [ { x: a.x, y: a.y }, { x: b.x, y: b.y } ];
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    out.push({
      id: cls + '-' + out.length, cls, from: i, to: j,
      fromName: a.name, toName: b.name,
      points: line.map((p) => [Math.round(p.x * 10) / 10, Math.round(p.y * 10) / 10]),
      lengthKm: Math.round(len * 10) / 10,
      straightKm: Math.round(len),
      bridges: 0, bridgeKm: 0, ferry: true
    });
  };

  for (const e of edges) {
    const from = towns[e.a], to = towns[e.b];
    const raw = trace(field, from, to);
    if (!raw) { addFerry(e.a, e.b); continue; }
    // концы ставим точно в поселения, а не в центры клеток
    raw[0] = { x: from.x, y: from.y };
    raw[raw.length - 1] = { x: to.x, y: to.y };
    const line = simplifySafe(chaikin(raw, 1), 2);
    // концы — точно в поселениях, если до них можно дойти по суше
    const head = { x: from.x, y: from.y }, tail = { x: to.x, y: to.y };
    line.unshift(head);
    line.push(tail);
    const fixed = repairLine(line);
    let bridges = 0, bridgeKm = 0;
    for (let i = 1; i < fixed.length; i++) {
      const p = fixed[i - 1], q = fixed[i];
      const seg = Math.hypot(q.x - p.x, q.y - p.y);
      const steps = Math.max(1, Math.ceil(seg / 2));
      let wetSeg = 0;
      for (let k = 0; k < steps; k++) {
        const t = (k + 0.5) / steps;
        const x = p.x + (q.x - p.x) * t, y = p.y + (q.y - p.y) * t;
        if (heightKm(x, y, WATER_LOD) < 0) wetSeg++;
      }
      if (wetSeg) {
        bridges++;
        bridgeKm += seg * (wetSeg / steps);
      }
    }
    // помечаем клетки рядом с трассой — следующие дороги идут вдоль
    for (const p of line) {
      const ci = Math.round(kmToCell(p.x)), cj = Math.round(kmToCell(p.y));
      for (let dj = -3; dj <= 3; dj++) {
        for (let di = -3; di <= 3; di++) {
          const ii = ci + di, jj = cj + dj;
          if (ii >= 0 && ii < N && jj >= 0 && jj < N) field.nearRoad[ii + jj * N] = 1;
        }
      }
    }
    const len = polyLength(fixed);
    if (len < 1) continue;
    out.push({
      id: e.cls + '-' + out.length,
      cls: e.cls,
      from: e.a, to: e.b,
      fromName: from.name, toName: to.name,
      points: fixed.map((p) => [Math.round(p.x * 10) / 10, Math.round(p.y * 10) / 10]),
      lengthKm: Math.round(len * 10) / 10,
      straightKm: Math.round(Math.hypot(to.x - from.x, to.y - from.y)),
      bridges,
      bridgeKm: Math.round(bridgeKm * 10) / 10
    });
  }

  // 7. добираем связи: у каждого поселения не меньше двух дорог (F-101)
  let degree = new Array(towns.length).fill(0);
  for (const e of out) { degree[e.from]++; degree[e.to]++; }
  for (let pass = 0; pass < 2; pass++) {
    for (let i = 0; i < towns.length; i++) {
      if (degree[i] >= 2) continue;
      let best = -1, bestC = Infinity;
      for (let j = 0; j < towns.length; j++) {
        if (i === j || have.has(key(i, j))) continue;
        const c = cost(i, j);
        if (c < bestC) { bestC = c; best = j; }
      }
      if (best === -1) continue;
      const raw = trace(field, towns[i], towns[best]);
      if (!raw) { addFerry(i, best); have.add(key(i, best)); degree[i]++; degree[best]++; continue; }
      raw[0] = { x: towns[i].x, y: towns[i].y };
      raw[raw.length - 1] = { x: towns[best].x, y: towns[best].y };
      const line = simplifySafe(chaikin(raw, 1), 2);
      line.unshift({ x: towns[i].x, y: towns[i].y });
      line.push({ x: towns[best].x, y: towns[best].y });
      const fixed = repairLine(line);
      if (line.length < 2) continue;
      have.add(key(i, best));
      out.push({
        id: 'G-' + out.length, cls: 'G', from: i, to: best,
        fromName: towns[i].name, toName: towns[best].name,
        points: fixed.map((p) => [Math.round(p.x * 10) / 10, Math.round(p.y * 10) / 10]),
        lengthKm: Math.round(polyLength(fixed) * 10) / 10,
        straightKm: Math.round(Math.hypot(towns[best].x - towns[i].x, towns[best].y - towns[i].y)),
        bridges: 0, bridgeKm: 0
      });
      degree[i]++; degree[best]++;
    }
  }

  const totalKm = out.reduce((s, e) => s + e.lengthKm, 0);
  degree = new Array(towns.length).fill(0);
  for (const e of out) { degree[e.from]++; degree[e.to]++; }
  return {
    edges: out,
    towns,
    capital,
    hubs,
    degree,
    totalKm: Math.round(totalKm),
    minDegree: Math.min(...degree),
    bridges: out.reduce((s, e) => s + e.bridges, 0),
    bridgeKm: Math.round(out.reduce((s, e) => s + e.bridgeKm, 0)),
    byClass: out.reduce((m, e) => { m[e.cls] = (m[e.cls] || 0) + 1; return m; }, {})
  };
}
