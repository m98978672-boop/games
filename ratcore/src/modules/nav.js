// RatCore Module [nav] — Сеточный A* по рельефу HeightField, сглаживание пути и RVO-уклонение агентов (Уровень 1 Opt-In)

export class NavigationSystem {
  constructor() {
    this.agents = new Map();
  }

  // Сеточный A* по рельефу с запретом воды и штрафом за крутой склон (F-12)
  findTerrainPath(heightField, { from = [0, 0], to = [5, 5], step = 1, maxSlope = 1.2, allowWater = false, maxNodes = 4000 } = {}) {
    const gx0 = Math.round(from[0] / step);
    const gy0 = Math.round(from[1] / step);
    const gx1 = Math.round(to[0] / step);
    const gy1 = Math.round(to[1] / step);
    const key = (x, y) => `${x},${y}`;
    const startKey = key(gx0, gy0);
    const goalKey = key(gx1, gy1);

    const open = new Map([[startKey, { x: gx0, y: gy0, g: 0, f: Math.hypot(gx1 - gx0, gy1 - gy0) * step }]]);
    const closed = new Set();
    const cameFrom = new Map();
    const dirs = [
      [1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1],
      [1, 1, Math.SQRT2], [1, -1, Math.SQRT2], [-1, 1, Math.SQRT2], [-1, -1, Math.SQRT2],
    ];

    let explored = 0;
    while (open.size > 0 && explored < maxNodes) {
      let curKey = null;
      let cur = null;
      for (const [k, node] of open) {
        if (!cur || node.f < cur.f) { cur = node; curKey = k; }
      }
      if (curKey === goalKey) {
        const raw = [];
        let k = goalKey;
        while (k) {
          const [px, py] = k.split(',').map(Number);
          const wx = px * step, wy = py * step;
          raw.push({ x: wx, y: wy, h: heightField ? Number(heightField.sampleHeight(wx, wy).toFixed(2)) : 0 });
          k = cameFrom.get(k);
        }
        raw.reverse();
        return { found: true, explored, cost: Number(cur.g.toFixed(3)), path: this._simplifyPath(raw) };
      }

      open.delete(curKey);
      closed.add(curKey);
      explored++;
      const curH = heightField ? heightField.sampleHeight(cur.x * step, cur.y * step) : 1;

      for (const [dx, dy, mult] of dirs) {
        const nx = cur.x + dx;
        const ny = cur.y + dy;
        const nk = key(nx, ny);
        if (closed.has(nk)) continue;
        const wx = nx * step;
        const wy = ny * step;
        const nh = heightField ? heightField.sampleHeight(wx, wy) : 1;
        if (!allowWater && nh < 0.1) continue;
        const dist = mult * step;
        const slope = Math.abs(nh - curH) / dist;
        if (slope > maxSlope) continue;

        const g = cur.g + dist * (1 + slope * 3);
        const prev = open.get(nk);
        if (!prev || g < prev.g) {
          cameFrom.set(nk, curKey);
          open.set(nk, { x: nx, y: ny, g, f: g + Math.hypot(gx1 - nx, gy1 - ny) * step });
        }
      }
    }
    return { found: false, explored, cost: Infinity, path: [] };
  }

  // Удаляем избыточные коллинеарные точки пути
  _simplifyPath(pts) {
    if (pts.length <= 2) return pts;
    const out = [pts[0]];
    for (let i = 1; i < pts.length - 1; i++) {
      const a = out[out.length - 1], b = pts[i], c = pts[i + 1];
      const cross = (b.x - a.x) * (c.y - b.y) - (b.y - a.y) * (c.x - b.x);
      if (Math.abs(cross) > 1e-4) out.push(b);
    }
    out.push(pts[pts.length - 1]);
    return out;
  }

  // Лёгкое RVO-уклонение агентов от столкновений (учитывает желаемую скорость и соседей)
  computeRvoVelocity({ x, y, vx = 0, vy = 0, goalX, goalY, maxSpeed = 4, radius = 0.6, neighbors = [] }) {
    const toGx = goalX - x;
    const toGy = goalY - y;
    const dist = Math.hypot(toGx, toGy);
    let prefVx = dist > 0.05 ? (toGx / dist) * Math.min(maxSpeed, dist * 2) : 0;
    let prefVy = dist > 0.05 ? (toGy / dist) * Math.min(maxSpeed, dist * 2) : 0;

    let repX = 0, repY = 0;
    for (const nb of neighbors) {
      const dx = x - nb.x;
      const dy = y - nb.y;
      const d = Math.hypot(dx, dy);
      const safe = radius + (nb.radius || 0.6) + 0.4;
      if (d > 1e-4 && d < safe) {
        const push = ((safe - d) / safe) * maxSpeed;
        repX += (dx / d) * push;
        repY += (dy / d) * push;
      }
    }

    let rx = prefVx + repX * 0.8 + vx * 0.1;
    let ry = prefVy + repY * 0.8 + vy * 0.1;
    const spd = Math.hypot(rx, ry);
    if (spd > maxSpeed) {
      rx = (rx / spd) * maxSpeed;
      ry = (ry / spd) * maxSpeed;
    }
    return { vx: Number(rx.toFixed(3)), vy: Number(ry.toFixed(3)), speed: Number(Math.min(spd, maxSpeed).toFixed(3)) };
  }
}
