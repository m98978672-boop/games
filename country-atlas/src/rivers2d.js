/* Реки 2D по §5: сток D8, заполнение впадин (priority-flood), накопление расхода, озёра,
   ширина русла по F-135, порядок Стралера и мосты над водой (R-5.12, §8.15).

   Всё считается один раз из аналитического поля высот (§38) по сетке 10 км — 700 × 700 = 490 000
   клеток. Никаких случайных чисел, кроме детерминированного генератора имён (§16.1). */
import { WORLD2D, heightKm } from './world2d.js';

export const RIVER = {
  stepKm: 10,            // сетка стока
  epsilonM: 0.01,        // «наклон» после заполнения впадин, чтобы вода всегда находила путь
  minRiverKm2: 900,      // с какой площади начинается река (~9 клеток)
  minLakeKm2: 2000,      // озеро меньше — не рисуем
  maxLakes: 25,          // крупнейшие 25 — больше на карте не различить
  maxLakeKm2: 4000,      // озеро крупнее Ладоги в этой стране не нужно
  widthMinM: 3,          // F-135
  widthMaxM: 600,
  minLengthKm: 40,       // короче — не река, а ручей
  riverColor: '#3f7fa8',
  lakeColor: '#35719a'
};

/* ---------- имя реки: тот же приём, что и у поселений (§17.9) ---------- */
const RIVER_HEAD = ['Вол', 'Сар', 'Дон', 'Ок', 'Ем', 'Кав', 'Ур', 'Ир', 'Лам', 'Мок', 'Нер', 'Пел', 'Рос'];
const RIVER_TAIL = ['га', 'ша', 'ра', 'на', 'ка', 'ва', 'ица', 'ень', 'ава', 'ус', 'оя', 'ель'];
export function riverName(i) {
  const a = RIVER_HEAD[i % RIVER_HEAD.length];
  const b = RIVER_TAIL[Math.floor(i / RIVER_HEAD.length) % RIVER_TAIL.length];
  return a + b;
}

/* ---------- сетка ---------- */
export function flowGrid(stepKm = RIVER.stepKm) {
  const n = Math.round(WORLD2D.sizeKm / stepKm) + 1;
  const h = new Float32Array(n * n);
  const x0 = -WORLD2D.halfKm;
  for (let j = 0; j < n; j++) {
    const y = x0 + j * stepKm;
    for (let i = 0; i < n; i++) h[j * n + i] = heightKm(x0 + i * stepKm, y);
  }
  return { n, stepKm, x0, h, cellKm2: stepKm * stepKm };
}

/* F-136: заполнение впадин — priority-flood с наклоном epsilon.
   Каждая клетка получает уровень не ниже исходного, вода всегда стекает в море. */
export function fillDepressions(grid) {
  const { n, h, epsilonM } = { ...grid, epsilonM: RIVER.epsilonM };
  const filled = new Float32Array(h);
  const seen = new Uint8Array(n * n);
  // куча: уровни + индексы
  const keys = new Float32Array(1 << 16);
  const vals = new Int32Array(1 << 16);
  let size = 0;
  const grow = () => {
    if (size < keys.length) return;
    const k2 = new Float32Array(keys.length * 2); k2.set(keys);
    const v2 = new Int32Array(vals.length * 2); v2.set(vals);
    return [k2, v2];
  };
  let K = keys, V = vals;
  const push = (key, val) => {
    if (size >= K.length) { const [a, b] = grow(); K = a; V = b; }
    let i = size++;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (K[p] <= key) break;
      K[i] = K[p]; V[i] = V[p]; i = p;
    }
    K[i] = key; V[i] = val;
  };
  const pop = () => {
    const key = K[0], val = V[0];
    const lk = K[--size], lv = V[size];
    let i = 0;
    for (;;) {
      let c = 2 * i + 1;
      if (c >= size) break;
      if (c + 1 < size && K[c + 1] < K[c]) c++;
      if (K[c] >= lk) break;
      K[i] = K[c]; V[i] = V[c]; i = c;
    }
    K[i] = lk; V[i] = lv;
    return { key, val };
  };

  // граница мира и всё, что ниже уровня моря, — «выход»: туда вода уходит
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      const id = j * n + i;
      const edge = i === 0 || j === 0 || i === n - 1 || j === n - 1;
      if (edge || h[id] <= 0) { seen[id] = 1; filled[id] = h[id]; push(h[id], id); }
    }
  }
  const nb = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
  while (size > 0) {
    const { key, val } = pop();
    const i = val % n, j = (val / n) | 0;
    for (const [di, dj] of nb) {
      const ii = i + di, jj = j + dj;
      if (ii < 0 || jj < 0 || ii >= n || jj >= n) continue;
      const id = jj * n + ii;
      if (seen[id]) continue;
      seen[id] = 1;
      filled[id] = Math.max(h[id], key + epsilonM);
      push(filled[id], id);
    }
  }
  return filled;
}

/* F-137: приёмник D8 и накопление расхода. Возвращает направление стока и площадь водосбора. */
export function accumulate(grid, filled) {
  const { n, stepKm, cellKm2 } = grid;
  const dir = new Int32Array(n * n).fill(-1);
  const nb = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      const id = j * n + i;
      if (grid.h[id] <= 0) continue;                 // море — сток заканчивается
      let best = -1, bestSlope = 0;
      for (const [di, dj] of nb) {
        const ii = i + di, jj = j + dj;
        if (ii < 0 || jj < 0 || ii >= n || jj >= n) continue;
        const nid = jj * n + ii;
        const dist = (di && dj ? Math.SQRT2 : 1) * stepKm;
        const slope = (filled[id] - filled[nid]) / dist;
        if (slope > bestSlope) { bestSlope = slope; best = nid; }
      }
      dir[id] = best;
    }
  }
  // расход: обрабатываем клетки от высоких к низким
  const order = Array.from({ length: n * n }, (_, i) => i).filter((i) => grid.h[i] > 0);
  order.sort((a, b) => filled[b] - filled[a]);
  const area = new Float32Array(n * n);
  for (const id of order) area[id] = cellKm2;
  for (const id of order) {
    const r = dir[id];
    if (r >= 0 && area[id] > 0) area[r] += area[id];
  }
  return { dir, area };
}

/* F-138: порядок Стралера по сети рек. Исток — 1; узел, в который впадают два притока
   одного порядка, повышает порядок на 1; цепочка порядок сохраняет. */
export function strahler(grid, dir, isRiver) {
  const n = grid.n;
  const N = n * n;
  const order = new Uint8Array(N);
  const donors = new Int32Array(N);
  const best = new Uint8Array(N);
  const ties = new Uint8Array(N);
  for (let id = 0; id < N; id++) {
    if (!isRiver[id]) continue;
    order[id] = 1;
    const r = dir[id];
    if (r >= 0 && isRiver[r]) donors[r]++;
  }
  const queue = [];
  for (let id = 0; id < N; id++) if (isRiver[id] && donors[id] === 0) queue.push(id);
  while (queue.length) {
    const id = queue.shift();
    const r = dir[id];
    if (r < 0 || !isRiver[r]) continue;
    const o = order[id];
    if (o > best[r]) { best[r] = o; ties[r] = 1; }
    else if (o === best[r]) ties[r]++;
    order[r] = ties[r] >= 2 ? Math.min(255, best[r] + 1) : best[r];
    if (--donors[r] === 0) queue.push(r);
  }
  return order;
}

/* R-5.4: извилистость. Каждое звено дробится пополам, середина уводится вбок на amp·(0…1) —
   получается плавная петля вместо ступенек растра. Смещение берётся из хеша координат. */
export function meanderChain(pts, amp = 1.1) {
  let out = pts.slice();
  for (let pass = 0; pass < 2; pass++) {
    const next = [out[0]];
    for (let i = 1; i < out.length; i++) {
      const a = out[i - 1], b = out[i];
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      const dx = b.x - a.x, dy = b.y - a.y;
      const len = Math.hypot(dx, dy) || 1;
      // псевдослучайное, но детерминированное смещение: sin от координат и номера прохода
      const k = Math.sin((mx * 12.9898 + my * 78.233 + pass * 37.719) * 43758.5453);
      const off = ((k - Math.floor(k)) - 0.5) * 2 * amp;
      const lx = mx - (dy / len) * off, ly = my + (dx / len) * off;
      const lim = WORLD2D.halfKm;
      next.push({ x: Math.max(-lim, Math.min(lim, lx)), y: Math.max(-lim, Math.min(lim, ly)) });
      next.push(b);
    }
    out = next;
  }
  return out;
}

/* F-135: ширина русла по расходу — корневой профиль от ручья (3 м) до устья (600 м):
   w = 3 + 597·sqrt(flow / maxFlow), зажим 3…600 м. */
export function riverWidthM(flow, maxFlow) {
  if (!(maxFlow > 0)) return RIVER.widthMinM;
  const w = RIVER.widthMinM + (RIVER.widthMaxM - RIVER.widthMinM) * Math.sqrt(Math.max(0, flow) / maxFlow);
  return Math.max(RIVER.widthMinM, Math.min(RIVER.widthMaxM, w));
}

/* Сборка рек: линии, ширина, порядок, длина. */
export function buildRivers(grid, filled, dir, area, opts = {}) {
  const { n, stepKm, x0 } = grid;
  const minArea = opts.minRiverKm2 || RIVER.minRiverKm2;
  const isRiver = new Uint8Array(n * n);
  let maxFlow = 0;
  for (let id = 0; id < n * n; id++) {
    if (grid.h[id] > 0 && area[id] >= minArea) { isRiver[id] = 1; if (area[id] > maxFlow) maxFlow = area[id]; }
  }
  const order = strahler(grid, dir, isRiver);
  const km = (id) => ({ x: x0 + (id % n) * stepKm, y: x0 + ((id / n) | 0) * stepKm });

  // узлы сети: исток (нет притока-реки) или развилка (≥ 2 притока) или устье
  const donors = new Int32Array(n * n);
  for (let id = 0; id < n * n; id++) if (isRiver[id] && dir[id] >= 0 && isRiver[dir[id]]) donors[dir[id]]++;
  const used = new Uint8Array(n * n);
  const lines = [];
  for (let start = 0; start < n * n; start++) {
    if (!isRiver[start] || used[start] || donors[start] > 0) continue;   // истоки и точки после слияний
    if (donors[start] === 0 && isRiver[dir[start] || 0] === 0) { /* одиночная клетка */ }
    const chain = [];
    let id = start;
    while (id >= 0 && isRiver[id] && !used[id]) {
      used[id] = 1;
      chain.push(id);
      const r = dir[id];
      if (r < 0 || !isRiver[r]) break;
      if (donors[r] > 1) { chain.push(r); break; }        // дошли до узла слияния
      id = r;
    }
    if (chain.length < 2) continue;
    const pts = opts.meander === false ? chain.map(km) : meanderChain(chain.map(km), opts.meanderAmp || 1.1);
    let len = 0;
    for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
    const mouthId = chain[chain.length - 1];
    const flow = area[mouthId];
    const widthM = riverWidthM(flow, maxFlow);
    if (len < (opts.minLengthKm || RIVER.minLengthKm)) continue;
    lines.push({ pts, km: Math.round(len), flowKm2: Math.round(flow), widthM: Math.round(widthM), order: order[mouthId], mouth: km(mouthId) });
  }
  // имена: сначала главные реки (по длине), потом притоки
  lines.sort((a, b) => b.km - a.km);
  lines.forEach((l, i) => { l.name = riverName(i); l.main = i < 4; });
  lines.sort((a, b) => a.order - b.order || b.km - a.km);
  const totalKm = lines.reduce((s, l) => s + l.km, 0);
  return { lines, isRiver, order, maxFlow, totalKm, count: lines.length };
}

/* Обводка маски: грани клеток, у которых сосед не в маске, сшиваются в замкнутое кольцо.
   Так озеро рисуется своей настоящей формой, а не кружком-заглушкой (§5.6). */
export function traceRings(cells, grid) {
  const { n, stepKm, x0 } = grid;
  const inside = new Set(cells);
  const edges = new Map();
  const key = (x, y) => x.toFixed(3) + ',' + y.toFixed(3);
  const px = (i) => x0 + i * stepKm;
  const py = (j) => x0 + j * stepKm;
  const add = (ax, ay, bx, by) => {
    const k = key(ax, ay);
    const list = edges.get(k);
    if (list) list.push([bx, by]); else edges.set(k, [[bx, by]]);
  };
  for (const id of cells) {
    const i = id % n, j = (id / n) | 0;
    const ax = px(i), ay = py(j), bx = px(i + 1), by = py(j), cx = px(i + 1), cy = py(j + 1), dx = px(i), dy = py(j + 1);
    if (j === 0 || !inside.has((j - 1) * n + i)) add(ax, ay, bx, by);
    if (i === n - 1 || !inside.has(j * n + i + 1)) add(bx, by, cx, cy);
    if (j === n - 1 || !inside.has((j + 1) * n + i)) add(cx, cy, dx, dy);
    if (i === 0 || !inside.has(j * n + i - 1)) add(dx, dy, ax, ay);
  }
  const rings = [];
  let guard = cells.length * 8 + 64;
  while (edges.size && guard-- > 0) {
    const first = edges.keys().next().value;
    const [sx, sy] = first.split(',').map(Number);
    const ring = [[sx, sy]];
    let cx = sx, cy = sy;
    for (let step = 0; step < cells.length * 4 + 16; step++) {
      const k = key(cx, cy);
      const list = edges.get(k);
      if (!list || !list.length) break;
      const [nx, ny] = list.pop();
      if (!list.length) edges.delete(k);
      ring.push([nx, ny]);
      cx = nx; cy = ny;
      if (cx === sx && cy === sy) break;
    }
    if (ring.length > 3) rings.push(ring);
  }
  // площадь по формуле шнурков: внешнее кольцо — самое большое
  const areaOf = (r) => {
    let a = 0;
    for (let i = 0, j = r.length - 1; i < r.length; j = i++) a += r[j][0] * r[i][1] - r[i][0] * r[j][1];
    return a / 2;
  };
  rings.sort((a, b) => Math.abs(areaOf(b)) - Math.abs(areaOf(a)));
  return rings;
}

/* Упрощение ломаной (Дуглас–Пекер): у озера остаются изгибы, а не каждая клетка сетки. */
export function simplifyRing(ring, tolKm = 3) {
  if (ring.length < 4) return ring;
  const dist = (p, a, b) => {
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const L = dx * dx + dy * dy;
    if (L === 0) return Math.hypot(p[0] - a[0], p[1] - a[1]);
    let t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / L;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
  };
  const keep = new Uint8Array(ring.length);
  keep[0] = 1; keep[ring.length - 1] = 1;
  const stack = [[0, ring.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    let far = -1, maxD = tolKm;
    for (let k = a + 1; k < b; k++) {
      const d = dist(ring[k], ring[a], ring[b]);
      if (d > maxD) { maxD = d; far = k; }
    }
    if (far > 0) { keep[far] = 1; stack.push([a, far], [far, b]); }
  }
  const out = [];
  for (let k = 0; k < ring.length; k++) if (keep[k]) out.push(ring[k]);
  return out.length >= 4 ? out : ring;
}

/* Изрезанность берега (R-5.1): точки кольца сдвигаются по нормали на ±amp — берег перестаёт быть
   гладким овалом, появляются заливы, мысы и острова. Сдвиг берётся из синус-хеша координат. */
export function crinkleRing(ring, ampKm = 3.5) {
  const out = [];
  for (let i = 0; i < ring.length; i++) {
    const prev = ring[(i - 1 + ring.length) % ring.length];
    const next = ring[(i + 1) % ring.length];
    const dx = next[0] - prev[0], dy = next[1] - prev[1];
    const len = Math.hypot(dx, dy) || 1;
    const k = Math.sin((ring[i][0] * 12.9898 + ring[i][1] * 78.233) * 4375.5453);
    const off = ((k - Math.floor(k)) - 0.5) * 2 * ampKm;
    out.push([ring[i][0] - (dy / len) * off, ring[i][1] + (dx / len) * off]);
  }
  return out;
}

/* Сглаживание берега (Чайкин, 2 прохода): у озера плавная линия, а не ступеньки сетки. */
export function smoothRing(ring, passes = 2) {
  let r = ring;
  for (let p = 0; p < passes; p++) {
    const out = [];
    for (let i = 0; i < r.length; i++) {
      const a = r[i], b = r[(i + 1) % r.length];
      out.push([0.75 * a[0] + 0.25 * b[0], 0.75 * a[1] + 0.25 * b[1]]);
      out.push([0.25 * a[0] + 0.75 * b[0], 0.25 * a[1] + 0.75 * b[1]]);
    }
    r = out;
  }
  return r;
}

/* Море и внутренние водоёмы: связана ли вода с открытым океаном.
   Бессточные впадины ниже уровня моря — это не океан, а внутренние моря и солончаки (R-5.6). */
export function seaConnectivity(grid) {
  const { n, h } = grid;
  const sea = new Uint8Array(n * n);
  const queue = [];
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      const edge = i === 0 || j === 0 || i === n - 1 || j === n - 1;
      const id = j * n + i;
      if (edge && h[id] <= 0 && !sea[id]) { sea[id] = 1; queue.push(id); }
    }
  }
  for (let q = 0; q < queue.length; q++) {
    const id = queue[q];
    const i = id % n, j = (id / n) | 0;
    for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const ii = i + di, jj = j + dj;
      if (ii < 0 || jj < 0 || ii >= n || jj >= n) continue;
      const nid = jj * n + ii;
      if (!sea[nid] && h[nid] <= 0) { sea[nid] = 1; queue.push(nid); }
    }
  }
  return sea;
}

/* F-139: озёра — замкнутые впадины, которые заполнение подняло выше рельефа. */
export function buildLakes(grid, filled, opts = {}) {
  const { n, stepKm, x0, cellKm2 } = grid;
  const minKm2 = opts.minLakeKm2 || RIVER.minLakeKm2;
  const mask = new Uint8Array(n * n);
  for (let id = 0; id < n * n; id++) if (grid.h[id] > 0 && filled[id] - grid.h[id] > 6) mask[id] = 1;
  const seen = new Uint8Array(n * n);
  const lakes = [];
  for (let s = 0; s < n * n; s++) {
    if (!mask[s] || seen[s]) continue;
    const cells = [];
    let level = -Infinity, top = 0, sumI = 0, sumJ = 0;
    seen[s] = 1;
    const stack = [s];
    while (stack.length) {
      const id = stack.pop();
      const i = id % n, j = (id / n) | 0;
      cells.push(id);
      sumI += i; sumJ += j;
      if (filled[id] > level) level = filled[id];
      if (grid.h[id] > top) top = grid.h[id];
      for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const ii = i + di, jj = j + dj;
        if (ii < 0 || jj < 0 || ii >= n || jj >= n) continue;
        const nid = jj * n + ii;
        if (mask[nid] && !seen[nid]) { seen[nid] = 1; stack.push(nid); }
      }
    }
    const areaKm2 = cells.length * cellKm2;
    if (areaKm2 < minKm2 || areaKm2 > RIVER.maxLakeKm2) continue;   // «море внутри суши» — это не озеро
    if (level - top < 6) continue;                                  // лужа глубиной в метр — не озеро
    const rings = traceRings(cells, grid);
    if (!rings.length) continue;
    const ring = smoothRing(crinkleRing(smoothRing(simplifyRing(rings[0], Math.max(2, stepKm * 0.9)), 2), 3), 1);
    // настоящее очертание важнее центроида: центр берём из кольца
    let cx = 0, cy = 0;
    for (const p of ring) { cx += p[0]; cy += p[1]; }
    lakes.push({
      x: cx / ring.length,
      y: cy / ring.length,
      ring,
      areaKm2: Math.round(areaKm2),
      levelM: Math.round(level),
      depthM: Math.round(level - top),
      cells: cells.length
    });
  }
  lakes.sort((a, b) => b.areaKm2 - a.areaKm2);
  return lakes.slice(0, opts.maxLakes || RIVER.maxLakes);
}

/* Внутренние моря: вода ниже уровня моря, не связанная с океаном. Рисуются настоящим очертанием,
   иначе посреди суши остаются бесформенные синие пятна (§5.6). */
export function buildInlandSeas(grid, opts = {}) {
  const { n, stepKm, x0, cellKm2 } = grid;
  const sea = seaConnectivity(grid);
  const mask = new Uint8Array(n * n);
  let any = false;
  for (let id = 0; id < n * n; id++) if (grid.h[id] <= 0 && !sea[id]) { mask[id] = 1; any = true; }
  if (!any) return [];
  const seen = new Uint8Array(n * n);
  const out = [];
  for (let s2 = 0; s2 < n * n; s2++) {
    if (!mask[s2] || seen[s2]) continue;
    const cells = [];
    let sumI = 0, sumJ = 0, minH = 0;
    const stack = [s2];
    seen[s2] = 1;
    while (stack.length) {
      const id = stack.pop();
      const i = id % n, j = (id / n) | 0;
      cells.push(id);
      sumI += i; sumJ += j;
      if (grid.h[id] < minH) minH = grid.h[id];
      for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const ii = i + di, jj = j + dj;
        if (ii < 0 || jj < 0 || ii >= n || jj >= n) continue;
        const nid = jj * n + ii;
        if (mask[nid] && !seen[nid]) { seen[nid] = 1; stack.push(nid); }
      }
    }
    const areaKm2 = cells.length * cellKm2;
    if (areaKm2 < (opts.minInlandKm2 || 2000)) continue;
    const rings = traceRings(cells, grid);
    if (!rings.length) continue;
    const ring = smoothRing(crinkleRing(smoothRing(simplifyRing(rings[0], Math.max(3, stepKm)), 2), 5), 1);
    out.push({
      x: x0 + (sumI / cells.length) * stepKm,
      y: x0 + (sumJ / cells.length) * stepKm,
      ring, areaKm2: Math.round(areaKm2), depthM: Math.round(-minH),
      cells: cells.length, inland: true
    });
  }
  out.sort((a, b) => b.areaKm2 - a.areaKm2);
  return out.slice(0, opts.maxInland || 24);
}

/* F-140: мосты — пересечения дорог с реками (§8.15, R-5.12). Длина моста ≥ ширины русла.
   Считаем по растру: каждая речная клетка помечена своей рекой, дорога сэмплируется через 1 км —
   иначе 200 дорог × 16 000 отрезков × 5 000 рек дают миллиарды проверок. */
export function bridgesBetween(roads, rivers) {
  const { grid, filled } = rivers;
  const n = grid.n, stepKm = grid.stepKm, x0 = grid.x0;
  const cellOf = (x, y) => {
    const i = Math.round((x - x0) / stepKm), j = Math.round((y - x0) / stepKm);
    if (i < 0 || j < 0 || i >= n || j >= n) return -1;
    return j * n + i;
  };
  const owner = new Int32Array(n * n).fill(-1);
  rivers.lines.forEach((line, li) => {
    for (const p of line.pts) {
      const id = cellOf(p.x, p.y);
      if (id >= 0 && owner[id] < 0) owner[id] = li;
    }
  });
  const out = [];
  // дороги хранят точки массивами [x, y] (§40), реки — объектами {x, y}
  const xy = (p) => (Array.isArray(p) ? { x: p[0], y: p[1] } : p);
  const seenPair = new Set();
  for (const e of roads.edges) {
    if (e.cls === 'F') continue;                     // паром идёт по воде — мост ему не нужен
    const pts = e.points || [];
    for (let i = 1; i < pts.length; i++) {
      const p = xy(pts[i - 1]), q = xy(pts[i]);
      const len = Math.hypot(q.x - p.x, q.y - p.y);
      const steps = Math.max(1, Math.ceil(len));
      let last = -1;
      for (let t = 0; t <= steps; t++) {
        const x = p.x + (q.x - p.x) * (t / steps), y = p.y + (q.y - p.y) * (t / steps);
        const id = cellOf(x, y);
        if (id < 0) continue;
        const li = owner[id];
        if (li < 0 || li === last) continue;
        last = li;
        const key = e.a + '-' + e.b + '|' + li;
        if (seenPair.has(key)) continue;              // один мост на пару «дорога — река»
        seenPair.add(key);
        const river = rivers.lines[li];
        // пролёт чуть длиннее русла (дорога пересекает реку под углом), но не «мост на 5 км»
        const lenM = Math.min(2000, river.widthM * 1.6 + 20);
        out.push({
          x: Math.round(x), y: Math.round(y),
          edge: e.a + '-' + e.b, cls: e.cls, river: river.name,
          riverW: river.widthM, lengthM: Math.round(lenM),
          spans: Math.max(1, Math.round(lenM / 60))
        });
      }
    }
  }
  out.sort((a, b) => b.lengthM - a.lengthM);
  return { list: out, count: out.length, longKm: Math.round(out.filter((b) => b.lengthM >= 100).reduce((s, b) => s + b.lengthM, 0) / 1000) };
}

/* Всё вместе — одна сборка для карты. */
/* F-354: вода строится по частям. Раньше весь расчёт шёл одним куском — 1.28 с
   на главном потоке, и на телефоне это выглядело как «игра зависла». Теперь тот же
   расчёт разложен на семь шагов: каждая часть кладётся в отдельный кадр, результат
   байт-в-байт тот же. */
export function createWaterBuilder(roads) {
  const st = { roads };
  const tasks = [
    () => { st.grid = flowGrid(); },
    () => { st.filled = fillDepressions(st.grid); },
    () => { const r = accumulate(st.grid, st.filled); st.dir = r.dir; st.area = r.area; },
    () => { st.rivers = buildRivers(st.grid, st.filled, st.dir, st.area); },
    () => { st.lakes = buildLakes(st.grid, st.filled); },
    () => { st.inland = buildInlandSeas(st.grid); },
    () => {
      st.rivers.grid = st.grid;
      st.bridges = st.roads ? bridgesBetween(st.roads, st.rivers) : { list: [], count: 0, longKm: 0 };
    }
  ];
  const finish = () => ({
    grid: st.grid.n, stepKm: st.grid.stepKm,
    rivers: st.rivers, lakes: st.lakes, inland: st.inland, bridges: st.bridges,
    totalKm: st.rivers.totalKm,
    ms: st.ms || 0
  });
  return { tasks, finish };
}

export function buildWater(roads) {
  const t0 = Date.now();
  const builder = createWaterBuilder(roads);
  for (const task of builder.tasks) task();
  const water = builder.finish();
  water.ms = Date.now() - t0;
  return water;
}

/* ---------- как река рисуется на карте (§5.5, R-52.4…R-52.6) ---------- */
/* R-52.4: ширина русла в пикселях — метры делятся на 1000 (в километры!) и умножаются
   на масштаб px/км. Раньше метры умножались прямо на px/км — река выходила в 1000 раз
   толще, и на обзоре страны появлялись «огромные синие пятна». */
export function riverStrokePx(widthM, s, isMain) {
  const px = (widthM / 1000) * s;
  return Math.min(6, Math.max(isMain ? 0.9 : 0.45, px));
}

/* R-52.5: сколько русел рисуем на данном масштабе (генерализация, §5.5). */
export function riverKeepCount(s, total) {
  const k = s < 0.3 ? 420 : s < 0.8 ? 1100 : s < 2 ? 2400 : s < 6 ? 4400 : total;
  return Math.min(total, k);
}

/* R-52.6: русло видно, если оно входит в квоту по длине и на обзоре страны длиннее ~90 км. */
export function riverVisibleAt(s, points, rank, keep) {
  if (rank >= keep) return false;
  if (s < 0.3 && points < 30) return false;
  return true;
}
