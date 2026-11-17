// RatCore World — Граф узлов/рёбер, A* маршрутизация по рельефу и генератор карты (A-07..A-11)

import { domainWarp2D, ridged2D, createRng } from '../core/math.js';
import { HeightField, WATER_MIN_LAND_H } from './coords.js';

export class WorldGraph {
  constructor() {
    this.nodes = new Map();
    this.edges = new Map();
    this.adj = new Map();
    this._nextEdgeId = 1;
  }

  addNode({ id, x, y, h = 0, kind = 'point', meta = {} }) {
    const node = { id, x, y, h, kind, meta: { ...meta } };
    this.nodes.set(id, node);
    if (!this.adj.has(id)) this.adj.set(id, []);
    return node;
  }

  moveNode(id, { x, y, h }) {
    const node = this.nodes.get(id);
    if (!node) return null;
    if (x !== undefined) node.x = x;
    if (y !== undefined) node.y = y;
    if (h !== undefined) node.h = h;
    // Пересчёт длин примыкающих рёбер
    for (const edgeId of this.adj.get(id) || []) {
      const e = this.edges.get(edgeId);
      if (!e) continue;
      const a = this.nodes.get(e.from);
      const b = this.nodes.get(e.to);
      if (a && b) e.length = Math.hypot(b.x - a.x, b.y - a.y);
    }
    return node;
  }

  removeNode(id) {
    if (!this.nodes.has(id)) return false;
    const edgeIds = [...(this.adj.get(id) || [])];
    for (const eid of edgeIds) this.removeEdge(eid);
    this.adj.delete(id);
    this.nodes.delete(id);
    return true;
  }

  connect({ id, from, to, kind = 'road', costFactor = 1, bidirectional = true }) {
    const a = this.nodes.get(from);
    const b = this.nodes.get(to);
    if (!a || !b) return null;
    const edgeId = id || `edge_${this._nextEdgeId++}`;
    const length = Math.hypot(b.x - a.x, b.y - a.y);
    const edge = { id: edgeId, from, to, kind, length, costFactor, bidirectional };
    this.edges.set(edgeId, edge);
    this.adj.get(from).push(edgeId);
    if (bidirectional) this.adj.get(to).push(edgeId);
    return edge;
  }

  removeEdge(edgeId) {
    const e = this.edges.get(edgeId);
    if (!e) return false;
    const strip = (nid) => {
      const arr = this.adj.get(nid);
      if (!arr) return;
      const idx = arr.indexOf(edgeId);
      if (idx >= 0) arr.splice(idx, 1);
    };
    strip(e.from);
    strip(e.to);
    this.edges.delete(edgeId);
    return true;
  }

  // A* поиск пути по графу с учётом уклона (F-12)
  findPath(startId, goalId, { slopePenalty = 4 } = {}) {
    if (!this.nodes.has(startId) || !this.nodes.has(goalId)) return null;
    const goal = this.nodes.get(goalId);
    const open = new Set([startId]);
    const cameFrom = new Map();
    const gScore = new Map([[startId, 0]]);
    const fScore = new Map([[startId, this._heur(this.nodes.get(startId), goal)]]);

    while (open.size > 0) {
      let current = null;
      let bestF = Infinity;
      for (const id of open) {
        const f = fScore.get(id) ?? Infinity;
        if (f < bestF) {
          bestF = f;
          current = id;
        }
      }
      if (current === goalId) {
        const path = [current];
        while (cameFrom.has(current)) {
          current = cameFrom.get(current);
          path.push(current);
        }
        path.reverse();
        return { path, totalCost: gScore.get(goalId) };
      }

      open.delete(current);
      const curNode = this.nodes.get(current);

      for (const eid of this.adj.get(current) || []) {
        const edge = this.edges.get(eid);
        if (!edge) continue;
        const nextId = edge.from === current ? edge.to : (edge.bidirectional ? edge.from : null);
        if (!nextId) continue;
        const nextNode = this.nodes.get(nextId);
        const dh = Math.abs((nextNode.h || 0) - (curNode.h || 0));
        const slope = edge.length > 0 ? dh / edge.length : 0;
        const stepCost = edge.length * edge.costFactor * (1 + slope * slopePenalty);
        const tentative = (gScore.get(current) ?? Infinity) + stepCost;

        if (tentative < (gScore.get(nextId) ?? Infinity)) {
          cameFrom.set(nextId, current);
          gScore.set(nextId, tentative);
          fScore.set(nextId, tentative + this._heur(nextNode, goal));
          open.add(nextId);
        }
      }
    }
    return null;
  }

  _heur(a, b) {
    return Math.hypot(b.x - a.x, b.y - a.y);
  }
}

// A-07: Процедурная генерация рельефа, биомов и стартовых поселений по сиду
export function generateWorldMap({ seed = 42, width = 64, height = 64, cellSize = 1, settlements = 5 } = {}) {
  const hf = new HeightField({
    width,
    height,
    cellSize,
    originX: -(width * cellSize) / 2,
    originY: -(height * cellSize) / 2,
  });

  const scale = 0.055;
  for (let iy = 0; iy < height; iy++) {
    for (let ix = 0; ix < width; ix++) {
      const nx = ix * scale;
      const ny = iy * scale;
      const base = domainWarp2D(nx, ny, { seed, strength: 0.7, octaves: 3 });
      const ridge = ridged2D(nx * 1.4, ny * 1.4, { seed: seed + 99, octaves: 3 });
      // Островной профиль к краям карты
      const rx = (ix / (width - 1)) * 2 - 1;
      const ry = (iy / (height - 1)) * 2 - 1;
      const radial = Math.max(0, 1 - (rx * rx + ry * ry) * 0.85);
      const h = (base * 6 + ridge * 7) * radial - 1.2;
      hf.setCell(ix, iy, h);
    }
  }

  const graph = new WorldGraph();
  const rng = createRng(seed + 777);
  const placed = [];
  let attempts = 0;
  while (placed.length < settlements && attempts < settlements * 40) {
    attempts++;
    const x = hf.originX + rng.range(4, width - 5) * cellSize;
    const y = hf.originY + rng.range(4, height - 5) * cellSize;
    const h = hf.sampleHeight(x, y);
    if (h < WATER_MIN_LAND_H + 0.3 || h > 8.5) continue;
    const tooClose = placed.some((p) => Math.hypot(p.x - x, p.y - y) < Math.min(width, height) * cellSize * 0.18);
    if (tooClose) continue;
    const id = `city_${placed.length + 1}`;
    const node = graph.addNode({ id, x, y, h, kind: 'settlement', meta: { rank: placed.length === 0 ? 'capital' : 'town' } });
    placed.push(node);
  }

  // Соединяем поселения минимальным связующим остовом (MST)
  if (placed.length >= 2) {
    const inTree = new Set([placed[0].id]);
    while (inTree.size < placed.length) {
      let bestA = null;
      let bestB = null;
      let bestD = Infinity;
      for (const a of placed) {
        if (!inTree.has(a.id)) continue;
        for (const b of placed) {
          if (inTree.has(b.id)) continue;
          const d = Math.hypot(b.x - a.x, b.y - a.y);
          if (d < bestD) {
            bestD = d;
            bestA = a;
            bestB = b;
          }
        }
      }
      if (!bestB) break;
      graph.connect({ from: bestA.id, to: bestB.id, kind: 'road' });
      inTree.add(bestB.id);
    }
  }

  return { heightField: hf, graph, settlements: placed };
}
