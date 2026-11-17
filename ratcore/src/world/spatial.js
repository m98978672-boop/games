// RatCore World — SpatialHashGrid (A-04), 3D DDA-Raycast (A-05), PalettedChunk16 (A-66) и OccupancyBrick64 (A-78)

// A-04: SpatialHashGrid — O(1) поиск соседей с visitStamp (ноль аллокаций Set в игровом цикле)
export class SpatialHashGrid {
  constructor(cellSize = 8) {
    this.cellSize = Math.max(1, cellSize);
    this.buckets = new Map();
    this.items = new Map();
    this.visitStamp = 0;
  }

  _key(cx, cy) {
    return `${cx},${cy}`;
  }

  insert(id, x, y, radius = 0.5) {
    if (this.items.has(id)) this.remove(id);
    const inv = 1 / this.cellSize;
    const minX = Math.floor((x - radius) * inv);
    const maxX = Math.floor((x + radius) * inv);
    const minY = Math.floor((y - radius) * inv);
    const maxY = Math.floor((y + radius) * inv);
    const rec = { id, x, y, radius, minX, maxX, minY, maxY, stamp: 0 };
    this.items.set(id, rec);

    for (let cy = minY; cy <= maxY; cy++) {
      for (let cx = minX; cx <= maxX; cx++) {
        const key = this._key(cx, cy);
        let bucket = this.buckets.get(key);
        if (!bucket) {
          bucket = [];
          this.buckets.set(key, bucket);
        }
        bucket.push(rec);
      }
    }
  }

  remove(id) {
    const rec = this.items.get(id);
    if (!rec) return false;
    for (let cy = rec.minY; cy <= rec.maxY; cy++) {
      for (let cx = rec.minX; cx <= rec.maxX; cx++) {
        const key = this._key(cx, cy);
        const bucket = this.buckets.get(key);
        if (!bucket) continue;
        const idx = bucket.indexOf(rec);
        if (idx >= 0) {
          bucket[idx] = bucket[bucket.length - 1];
          bucket.pop();
        }
        if (bucket.length === 0) this.buckets.delete(key);
      }
    }
    this.items.delete(id);
    return true;
  }

  queryRadius(x, y, radius, out = []) {
    out.length = 0;
    const stamp = ++this.visitStamp;
    const inv = 1 / this.cellSize;
    const minX = Math.floor((x - radius) * inv);
    const maxX = Math.floor((x + radius) * inv);
    const minY = Math.floor((y - radius) * inv);
    const maxY = Math.floor((y + radius) * inv);
    const r2 = radius * radius;

    for (let cy = minY; cy <= maxY; cy++) {
      for (let cx = minX; cx <= maxX; cx++) {
        const bucket = this.buckets.get(this._key(cx, cy));
        if (!bucket) continue;
        for (let i = 0; i < bucket.length; i++) {
          const rec = bucket[i];
          if (rec.stamp === stamp) continue;
          rec.stamp = stamp;
          const dx = rec.x - x;
          const dy = rec.y - y;
          const lim = radius + rec.radius;
          if (dx * dx + dy * dy <= Math.max(r2, lim * lim)) {
            out.push(rec.id);
          }
        }
      }
    }
    return out;
  }
}

// A-05: 3D DDA-Raycast (Amanatides & Woo) по единичной воксельной сетке
export function ddaRaycast3D({ origin, dir, maxDist = 64, isSolid }) {
  const len = Math.hypot(dir[0], dir[1], dir[2]);
  if (len < 1e-9) return null;
  const dx = dir[0] / len;
  const dy = dir[1] / len;
  const dz = dir[2] / len;

  let ix = Math.floor(origin[0]);
  let iy = Math.floor(origin[1]);
  let iz = Math.floor(origin[2]);

  const stepX = dx >= 0 ? 1 : -1;
  const stepY = dy >= 0 ? 1 : -1;
  const stepZ = dz >= 0 ? 1 : -1;

  const tDeltaX = dx !== 0 ? Math.abs(1 / dx) : Infinity;
  const tDeltaY = dy !== 0 ? Math.abs(1 / dy) : Infinity;
  const tDeltaZ = dz !== 0 ? Math.abs(1 / dz) : Infinity;

  let tMaxX = dx !== 0 ? ((dx > 0 ? ix + 1 - origin[0] : origin[0] - ix) * tDeltaX) : Infinity;
  let tMaxY = dy !== 0 ? ((dy > 0 ? iy + 1 - origin[1] : origin[1] - iy) * tDeltaY) : Infinity;
  let tMaxZ = dz !== 0 ? ((dz > 0 ? iz + 1 - origin[2] : origin[2] - iz) * tDeltaZ) : Infinity;

  let dist = 0;
  let normal = [0, 0, 0];

  while (dist <= maxDist) {
    const val = isSolid(ix, iy, iz);
    if (val) {
      return {
        hit: true,
        voxel: [ix, iy, iz],
        value: val,
        distance: dist,
        normal,
        point: [origin[0] + dx * dist, origin[1] + dy * dist, origin[2] + dz * dist],
      };
    }
    if (tMaxX < tMaxY && tMaxX < tMaxZ) {
      dist = tMaxX;
      tMaxX += tDeltaX;
      ix += stepX;
      normal = [-stepX, 0, 0];
    } else if (tMaxY < tMaxZ) {
      dist = tMaxY;
      tMaxY += tDeltaY;
      iy += stepY;
      normal = [0, -stepY, 0];
    } else {
      dist = tMaxZ;
      tMaxZ += tDeltaZ;
      iz += stepZ;
      normal = [0, 0, -stepZ];
    }
  }
  return null;
}

// A-66 / F-102: Палитровый контейнер подчанка 16×16×16 с динамическим битовым сжатием (0→1→2→4→8→12 бит)
export class PalettedChunk16 {
  constructor(defaultValue = 0) {
    this.size = 16;
    this.volume = 4096;
    this.palette = [defaultValue];
    this.bitsPerEntry = 0;
    this.data = new Uint32Array(0);
  }

  _index(x, y, z) {
    return (z << 8) | (y << 4) | x;
  }

  _bitsForCount(n) {
    if (n <= 1) return 0;
    if (n <= 2) return 1;
    if (n <= 4) return 2;
    if (n <= 16) return 4;
    if (n <= 256) return 8;
    return 12;
  }

  _resizeBits(newBits) {
    const oldBits = this.bitsPerEntry;
    const oldData = this.data;
    const words = newBits === 0 ? 0 : Math.ceil((this.volume * newBits) / 32);
    const nextData = new Uint32Array(words);

    if (oldBits > 0 && newBits > 0) {
      const oldMask = (1 << oldBits) - 1;
      for (let idx = 0; idx < this.volume; idx++) {
        const oldBit = idx * oldBits;
        const ow = oldBit >>> 5;
        const oo = oldBit & 31;
        let val = (oldData[ow] >>> oo) & oldMask;
        if (oo + oldBits > 32) val |= (oldData[ow + 1] << (32 - oo)) & oldMask;

        const newBit = idx * newBits;
        const nw = newBit >>> 5;
        const no = newBit & 31;
        nextData[nw] |= (val << no) >>> 0;
        if (no + newBits > 32) nextData[nw + 1] |= val >>> (32 - no);
      }
    }

    this.bitsPerEntry = newBits;
    this.data = nextData;
  }

  get(x, y, z) {
    if (this.bitsPerEntry === 0) return this.palette[0];
    const idx = this._index(x & 15, y & 15, z & 15);
    const b = this.bitsPerEntry;
    const mask = (1 << b) - 1;
    const bitPos = idx * b;
    const w = bitPos >>> 5;
    const o = bitPos & 31;
    let pIdx = (this.data[w] >>> o) & mask;
    if (o + b > 32) pIdx |= (this.data[w + 1] << (32 - o)) & mask;
    return this.palette[pIdx];
  }

  set(x, y, z, value) {
    let pIdx = this.palette.indexOf(value);
    if (pIdx < 0) {
      pIdx = this.palette.length;
      this.palette.push(value);
      const needBits = this._bitsForCount(this.palette.length);
      if (needBits > this.bitsPerEntry) this._resizeBits(needBits);
    }
    if (this.bitsPerEntry === 0) return;

    const idx = this._index(x & 15, y & 15, z & 15);
    const b = this.bitsPerEntry;
    const mask = (1 << b) - 1;
    const bitPos = idx * b;
    const w = bitPos >>> 5;
    const o = bitPos & 31;

    this.data[w] = (this.data[w] & ~(mask << o)) | ((pIdx & mask) << o);
    if (o + b > 32) {
      const rem = 32 - o;
      const hiMask = mask >>> rem;
      this.data[w + 1] = (this.data[w + 1] & ~hiMask) | ((pIdx & mask) >>> rem);
    }
  }

  byteSize() {
    return this.data.byteLength + this.palette.length * 4;
  }
}

// A-78 / F-114: Побитовый кирпич 4×4×4 в одном BigUint64 (8 байт на 64 вокселя!)
export class OccupancyBrick64 {
  constructor() {
    this.bits = 0n;
  }

  _bit(x, y, z) {
    return 1n << BigInt(((z & 3) << 4) | ((y & 3) << 2) | (x & 3));
  }

  set(x, y, z, solid) {
    const b = this._bit(x, y, z);
    this.bits = solid ? (this.bits | b) : (this.bits & ~b);
  }

  get(x, y, z) {
    return (this.bits & this._bit(x, y, z)) !== 0n;
  }

  isEmpty() {
    return this.bits === 0n;
  }

  popcount() {
    let v = this.bits;
    let c = 0;
    while (v > 0n) {
      v &= v - 1n;
      c++;
    }
    return c;
  }
}
