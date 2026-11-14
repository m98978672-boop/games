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
  maxLakes: 40,          // крупнейшие 40 — больше на карте не различить
  maxLakeKm2: 8000,      // озеро крупнее Ладоги в этой стране не нужно
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

/* F-139: озёра — замкнутые впадины, которые заполнение подняло выше рельефа. */
export function buildLakes(grid, filled, opts = {}) {
  const { n, stepKm, x0, cellKm2 } = grid;
  const minKm2 = opts.minLakeKm2 || RIVER.minLakeKm2;
  const mask = new Uint8Array(n * n);
  for (let id = 0; id < n * n; id++) if (grid.h[id] > 0 && filled[id] - grid.h[id] > 6) mask[id] = 1;
  const seen = new Uint8Array(n * n);
  const lakes = [];
  const stack = [];
  for (let s = 0; s < n * n; s++) {
    if (!mask[s] || seen[s]) continue;
    let count = 0, level = -Infinity, top = 0, sumI = 0, sumJ = 0;
    let minI = n, maxI = -1, minJ = n, maxJ = -1;
    seen[s] = 1; stack.push(s);
    while (stack.length) {
      const id = stack.pop();
      const i = id % n, j = (id / n) | 0;
      count++; sumI += i; sumJ += j;
      if (i < minI) minI = i; if (i > maxI) maxI = i;
      if (j < minJ) minJ = j; if (j > maxJ) maxJ = j;
      if (filled[id] > level) level = filled[id];
      if (grid.h[id] > top) top = grid.h[id];
      for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const ii = i + di, jj = j + dj;
        if (ii < 0 || jj < 0 || ii >= n || jj >= n) continue;
        const nid = jj * n + ii;
        if (mask[nid] && !seen[nid]) { seen[nid] = 1; stack.push(nid); }
      }
    }
    const areaKm2 = count * cellKm2;
    if (areaKm2 < minKm2 || areaKm2 > RIVER.maxLakeKm2) continue;   // «море внутри суши» — это не озеро
    if (level - top < 6) continue;              // лужа глубиной в метр — не озеро
    lakes.push({
      x: x0 + (sumI / count) * stepKm,
      y: x0 + (sumJ / count) * stepKm,
      areaKm2: Math.round(areaKm2),
      levelM: Math.round(level),
      depthM: Math.round(level - top),
      cells: count,
      rxKm: Math.max(stepKm, ((maxI - minI + 1) * stepKm) / 2),
      ryKm: Math.max(stepKm, ((maxJ - minJ + 1) * stepKm) / 2)
    });
  }
  lakes.sort((a, b) => b.areaKm2 - a.areaKm2);
  return lakes.slice(0, opts.maxLakes || RIVER.maxLakes);
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
export function buildWater(roads) {
  const t0 = Date.now();
  const grid = flowGrid();
  const filled = fillDepressions(grid);
  const { dir, area } = accumulate(grid, filled);
  const rivers = buildRivers(grid, filled, dir, area);
  const lakes = buildLakes(grid, filled);
  rivers.grid = grid;
  rivers.filled = filled;
  const bridges = roads ? bridgesBetween(roads, rivers) : { list: [], count: 0, longKm: 0 };
  delete rivers.filled;
  return {
    grid: grid.n, stepKm: grid.stepKm,
    rivers, lakes, bridges,
    totalKm: rivers.totalKm,
    ms: Date.now() - t0
  };
}
