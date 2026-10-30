// Пространственный индекс неподвижных круговых препятствий. В игре новые
// коллайдеры только добавляются, а удалённые помечаются disabled. Координаты
// и радиус уже добавленного коллайдера не меняются.
export class ColliderIndex {
  constructor(colliders, cellSize = 8) {
    this.colliders = colliders;
    this.cellSize = cellSize;
    this.cells = new Map();
    this.count = 0;
  }

  sync(colliders) {
    if (colliders !== this.colliders || colliders.length < this.count) {
      this.colliders = colliders;
      this.cells.clear();
      this.count = 0;
    }
    const cell = this.cellSize;
    while (this.count < colliders.length) {
      const c = colliders[this.count++];
      if (!Number.isFinite(c.x) || !Number.isFinite(c.z) || !Number.isFinite(c.r)) continue;
      const r = Math.abs(c.r);
      const minX = Math.floor((c.x - r) / cell), maxX = Math.floor((c.x + r) / cell);
      const minZ = Math.floor((c.z - r) / cell), maxZ = Math.floor((c.z + r) / cell);
      for (let x = minX; x <= maxX; x++) for (let z = minZ; z <= maxZ; z++) {
        const key = `${x},${z}`;
        let bucket = this.cells.get(key);
        if (!bucket) this.cells.set(key, bucket = []);
        bucket.push(c);
      }
    }
  }

  query(colliders, minX, minZ, maxX, maxZ) {
    this.sync(colliders);
    const cell = this.cellSize;
    const out = [], seen = new Set();
    for (let x = Math.floor(minX / cell); x <= Math.floor(maxX / cell); x++) {
      for (let z = Math.floor(minZ / cell); z <= Math.floor(maxZ / cell); z++) {
        const bucket = this.cells.get(`${x},${z}`);
        if (!bucket) continue;
        for (const c of bucket) {
          if (!seen.has(c)) { seen.add(c); out.push(c); }
        }
      }
    }
    return out;
  }
}
