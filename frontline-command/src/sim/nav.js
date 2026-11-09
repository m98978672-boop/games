// Навигация: Dijkstra-поле стоимости до цели (flow field) с кэшем.
// Дальние и ближние юниты ходят по одному полю, поэтому пересчёт редкий и дешёвый.
import { clamp } from '../core/mathx.js';

const INF = Infinity;

class MinHeap {
  constructor() { this.a = []; }
  get size() { return this.a.length; }
  push(cost, idx) {
    const a = this.a;
    a.push({ cost, idx });
    let i = a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (a[p].cost <= a[i].cost) break;
      [a[p], a[i]] = [a[i], a[p]];
      i = p;
    }
  }
  pop() {
    const a = this.a;
    const top = a[0];
    const last = a.pop();
    if (a.length && last) {
      a[0] = last;
      let i = 0;
      for (;;) {
        const l = i * 2 + 1, r = l + 1;
        let m = i;
        if (l < a.length && a[l].cost < a[m].cost) m = l;
        if (r < a.length && a[r].cost < a[m].cost) m = r;
        if (m === i) break;
        [a[m], a[i]] = [a[i], a[m]];
        i = m;
      }
    }
    return top;
  }
}

export class Nav {
  constructor(world, cfg) {
    this.world = world;
    this.cfg = cfg;
    // Сетка навигации крупнее тайла (64 px): полей меньше по клеткам — пересчёт дешёвый.
    this.cell = 64;
    this.cols = Math.ceil(world.W / this.cell);
    this.rows = Math.ceil(world.H / this.cell);
    this.n = this.cols * this.rows;
    this.cache = new Map();
    this.maxCache = 48;
    this.tick = 0;
    this.lastField = null;
    this.nodesExpanded = 0;
    this.version = -1;
    this.openArr = new Uint8Array(this.n);
    this.costArr = new Float32Array(this.n).fill(1);
    this.buildGrid();
  }

  // Проходимость и стоимость клеток пересобираются только при изменении карты/построек.
  buildGrid() {
    const w = this.world;
    for (let cy = 0; cy < this.rows; cy++) {
      for (let cx = 0; cx < this.cols; cx++) {
        const i = cx + cy * this.cols;
        const x = cx * this.cell + this.cell / 2, y = cy * this.cell + this.cell / 2;
        // Со стенами v2: проёмы дверей уже клетки навигации, поэтому правило мягче
        // (центр + два угла) — иначе внутренности зданий запираются.
        // С выключенным флагом правило прежнее (центр + все четыре угла).
        const center = w.isWalkable(x, y);
        const corners = (w.isWalkable(x - 14, y - 14) ? 1 : 0) + (w.isWalkable(x + 14, y - 14) ? 1 : 0) +
          (w.isWalkable(x - 14, y + 14) ? 1 : 0) + (w.isWalkable(x + 14, y + 14) ? 1 : 0);
        const relaxed = this.cfg.flag('wall_collision_v2', true);
        const ok = center && (relaxed ? corners >= 2 : corners === 4);
        this.openArr[i] = ok ? 1 : 0;
        const t = w.terrainAt(x, y);
        this.costArr[i] = t === 4 ? 0.75 : t === 2 ? 1.35 : t === 1 ? 0.95 : t === 5 ? 0.9 : 1;
      }
    }
    this.version = w.navVersion || 0;
    this.cache.clear();
  }

  // Пересчитать только навигационные клетки, образцы которых могли попасть в
  // изменённые тайлы стен. При изменении сетки поля сбрасываются целиком:
  // частичный Dijkstra не реализован. Если версия устарела, advance сделает full.
  patchWallTiles(regions, oldVersion) {
    const w = this.world;
    if (this.version !== oldVersion || !regions.length) return false;
    let changed = false;
    for (const r of regions) {
      const x0 = Math.max(0, Math.floor((r.x0 * w.T - 14 - this.cell / 2) / this.cell) - 1);
      const x1 = Math.min(this.cols - 1, Math.ceil(((r.x1 + 1) * w.T + 14 - this.cell / 2) / this.cell) + 1);
      const y0 = Math.max(0, Math.floor((r.y0 * w.T - 14 - this.cell / 2) / this.cell) - 1);
      const y1 = Math.min(this.rows - 1, Math.ceil(((r.y1 + 1) * w.T + 14 - this.cell / 2) / this.cell) + 1);
      for (let cy = y0; cy <= y1; cy++) for (let cx = x0; cx <= x1; cx++) {
        const i = cx + cy * this.cols;
        const x = cx * this.cell + this.cell / 2, y = cy * this.cell + this.cell / 2;
        const center = w.isWalkable(x, y);
        const corners = (w.isWalkable(x - 14, y - 14) ? 1 : 0) + (w.isWalkable(x + 14, y - 14) ? 1 : 0) +
          (w.isWalkable(x - 14, y + 14) ? 1 : 0) + (w.isWalkable(x + 14, y + 14) ? 1 : 0);
        const relaxed = this.cfg.flag('wall_collision_v2', true);
        const open = center && (relaxed ? corners >= 2 : corners === 4) ? 1 : 0;
        const t = w.terrainAt(x, y);
        const cost = t === 4 ? 0.75 : t === 2 ? 1.35 : t === 1 ? 0.95 : t === 5 ? 0.9 : 1;
        // Сравниваем с Float32-представлением, как в costArr; иначе 1.35 и
        // 0.95 дают ложное расхождение при каждом повторном обновлении.
        const cost32 = Math.fround(cost);
        if (this.openArr[i] !== open || this.costArr[i] !== cost32) changed = true;
        this.openArr[i] = open;
        this.costArr[i] = cost;
      }
    }
    this.version = w.navVersion || 0;
    if (changed) this.cache.clear();
    return true;
  }

  idxOf(x, y) {
    const cx = clamp(Math.floor(x / this.cell), 0, this.cols - 1);
    const cy = clamp(Math.floor(y / this.cell), 0, this.rows - 1);
    return cx + cy * this.cols;
  }
  cellPos(i) { return { x: (i % this.cols) * this.cell + this.cell / 2, y: Math.floor(i / this.cols) * this.cell + this.cell / 2 }; }
  open(i) { return this.openArr[i] === 1; }

  nearestOpen(i) {
    if (this.open(i)) return i;
    const cx = i % this.cols, cy = Math.floor(i / this.cols);
    for (let r = 1; r <= 6; r++) {
      for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
        const x = cx + dx, y = cy + dy;
        if (x < 0 || y < 0 || x >= this.cols || y >= this.rows) continue;
        const k = x + y * this.cols;
        if (this.open(k)) return k;
      }
    }
    return -1;
  }

  // Стоимость входа в клетку: дорога дешевле леса (логистика любит дороги).
  costAt(i) { return this.costArr[i]; }

  field(targetX, targetY) {
    if (this.version !== (this.world.navVersion || 0)) this.buildGrid();
    const start = this.nearestOpen(this.idxOf(targetX, targetY));
    if (start < 0) return null;
    const cached = this.cache.get(start);
    if (cached && this.tick - cached.at < 240) return cached;
    // Float32Array: стоимость дробная (дорога дешевле леса), целочисленный массив её бы обнулял.
    const dist = new Float64Array(this.n).fill(INF);
    dist[start] = 0;
    const heap = new MinHeap();
    heap.push(0, start);
    let expanded = 0;
    const w = this.world;
    while (heap.size) {
      const cur = heap.pop();
      if (cur.cost > dist[cur.idx]) continue;
      expanded++;
      const cx = cur.idx % this.cols, cy = Math.floor(cur.idx / this.cols);
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        const nx = cx + dx, ny = cy + dy;
        if (nx < 0 || ny < 0 || nx >= this.cols || ny >= this.rows) continue;
        const ni = nx + ny * this.cols;
        if (!this.open(ni)) continue;
        if (dx && dy) {
          if (!this.open(cx + dx + cy * this.cols) || !this.open(cx + (cy + dy) * this.cols)) continue;
          }
        const step = this.costAt(ni) * (dx && dy ? 1.414 : 1);
        const nd = cur.cost + step;
        if (nd < dist[ni]) { dist[ni] = nd; heap.push(nd, ni); }
      }
    }
    this.nodesExpanded = expanded;
    const entry = { dist, at: this.tick, start, expanded };
    if (this.cache.size >= this.maxCache) {
      let oldest = Infinity, oldKey = null;
      for (const [k, v] of this.cache) if (v.at < oldest) { oldest = v.at; oldKey = k; }
      this.cache.delete(oldKey);
    }
    this.cache.set(start, entry);
    return entry;
  }

  // Направление к цели по полю: берём соседа с минимальной стоимостью.
  step(field, x, y) {
    if (!field) return null;
    const i = this.idxOf(x, y);
    const cx = i % this.cols, cy = Math.floor(i / this.cols);
    let bestD = field.dist[i], bx = 0, by = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      const nx = cx + dx, ny = cy + dy;
      if (nx < 0 || ny < 0 || nx >= this.cols || ny >= this.rows) continue;
      const ni = nx + ny * this.cols;
      // Те же ограничения диагоналей, что при построении поля: иначе шаг
      // может выбрать запрещённый срез угла, хотя путь его не содержит.
      if (this.cfg.flag('wall_collision_v2', true) && this.cfg.flag('pathing_v2', false)) {
        if (!this.open(ni)) continue;
        if (dx && dy && (!this.open(cx + dx + cy * this.cols) || !this.open(cx + (cy + dy) * this.cols))) continue;
      }
      const d = field.dist[ni];
      if (d < bestD) { bestD = d; bx = dx; by = dy; }
    }
    if (!bx && !by) return null;
    const len = Math.hypot(bx, by) || 1;
    return { dx: bx / len, dy: by / len, cost: bestD };
  }

  advance() { this.tick++; if (this.version !== (this.world.navVersion || 0)) this.buildGrid(); }
  clear() { this.cache.clear(); }
}
