// Spatial hash: поиск соседей за O(1) на ячейку, без перебора всех юнитов.
export class SpatialHash {
  constructor(cell = 128, worldW = 4096, worldH = 4096) {
    this.cell = cell;
    this.cols = Math.ceil(worldW / cell) + 1;
    this.rows = Math.ceil(worldH / cell) + 1;
    this.buckets = new Map();
    this.cellOf = new Map();
  }
  key(x, y) {
    const cx = Math.floor(x / this.cell), cy = Math.floor(y / this.cell);
    return cx + cy * 4096;
  }
  clear() { this.buckets.clear(); this.cellOf.clear(); }
  insert(obj, x = obj.x, y = obj.y) {
    const k = this.key(x, y);
    let b = this.buckets.get(k);
    if (!b) { b = []; this.buckets.set(k, b); }
    b.push(obj);
    this.cellOf.set(obj, k);
  }
  remove(obj) {
    const k = this.cellOf.get(obj);
    if (k === undefined) return;
    const b = this.buckets.get(k);
    if (b) {
      const i = b.indexOf(obj);
      if (i >= 0) b.splice(i, 1);
    }
    this.cellOf.delete(obj);
  }
  update(obj) {
    const k = this.key(obj.x, obj.y);
    if (this.cellOf.get(obj) === k) return;
    this.remove(obj);
    this.insert(obj);
  }
  // Bounding-box query for a known radius: unlike the legacy coarse query,
  // visit only cells intersecting the box. Returns candidates, not a circle.
  queryRange(x,y,radius,out=[]) {
    out.length=0;
    const x0=Math.floor((x-radius)/this.cell),x1=Math.floor((x+radius)/this.cell);
    const y0=Math.floor((y-radius)/this.cell),y1=Math.floor((y+radius)/this.cell);
    for(let cy=y0;cy<=y1;cy++)for(let cx=x0;cx<=x1;cx++){
      const b=this.buckets.get(cx+cy*4096);
      if(b)for(let i=0;i<b.length;i++)out.push(b[i]);
    }
    return out;
  }
  query(x, y, radius, out = []) {
    out.length = 0;
    const r = Math.ceil(radius / this.cell);
    const cx = Math.floor(x / this.cell), cy = Math.floor(y / this.cell);
    for (let j = cy - r; j <= cy + r; j++) {
      for (let i = cx - r; i <= cx + r; i++) {
        const b = this.buckets.get(i + j * 4096);
        if (b) for (let n = 0; n < b.length; n++) out.push(b[n]);
      }
    }
    return out;
  }
}
