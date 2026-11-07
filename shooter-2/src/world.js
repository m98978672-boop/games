/* =============================================================================
   СЕКТОР «ПЕПЕЛ» — мир: коллизии, лучи, видимость
   -----------------------------------------------------------------------------
   Всё в 2.5D: AABB по X/Z + высота. Это дёшево и достаточно точно.
   • solid: круг против AABB с разрешением по минимальной оси
   • rayHit: луч против AABB (для пуль) + попадание в сферу бойца
   • hasLOS: луч от глаз до цели против тех же AABB
   • сетка занятости для поиска укрытий и обхода
   ============================================================================= */
(function (root) {
  'use strict';
  const SH2 = (root.SH2 = root.SH2 || {});
  const TAU = Math.PI * 2;

  class World {
    constructor(map, colliders) {
      this.map = map;
      this.colliders = colliders || [];
      this.half = (map.size || 80) / 2 - 1.2;
      this.grid = null;
      this.cell = 4;
      this._buildGrid();
    }

    _buildGrid() {
      const n = Math.ceil((this.half * 2) / this.cell);
      this.gridN = n;
      this.grid = new Uint8Array(n * n);
      for (const c of this.colliders) {
        const x0 = Math.max(0, Math.floor((c.x - c.hw + this.half) / this.cell));
        const x1 = Math.min(n - 1, Math.floor((c.x + c.hw + this.half) / this.cell));
        const z0 = Math.max(0, Math.floor((c.z - c.hd + this.half) / this.cell));
        const z1 = Math.min(n - 1, Math.floor((c.z + c.hd + this.half) / this.cell));
        for (let z = z0; z <= z1; z++) for (let x = x0; x <= x1; x++) this.grid[z * n + x] = 1;
      }
    }

    isBlockedCell(x, z) {
      if (!this.grid) return false;
      const gx = Math.floor((x + this.half) / this.cell);
      const gz = Math.floor((z + this.half) / this.cell);
      if (gx < 0 || gz < 0 || gx >= this.gridN || gz >= this.gridN) return true;
      return this.grid[gz * this.gridN + gx] === 1;
    }

    /* ---------------------- разрешение столкновений ------------------------ */
    resolveCircle(pos, radius) {
      const half = this.half;
      // границы карты
      const lim = half - radius;
      if (pos.x < -lim) pos.x = -lim;
      if (pos.x > lim) pos.x = lim;
      if (pos.z < -lim) pos.z = -lim;
      if (pos.z > lim) pos.z = lim;
      let hitWall = false;
      for (let i = 0; i < this.colliders.length; i++) {
        const c = this.colliders[i];
        const cx = Math.max(c.x - c.hw, Math.min(pos.x, c.x + c.hw));
        const cz = Math.max(c.z - c.hd, Math.min(pos.z, c.z + c.hd));
        let dx = pos.x - cx, dz = pos.z - cz;
        let d2 = dx * dx + dz * dz;
        if (d2 > radius * radius) continue;
        hitWall = true;
        if (d2 < 1e-8) {
          // центр внутри коробки — выталкиваем по минимальной оси
          const ox = (c.hw + radius) - Math.abs(pos.x - c.x);
          const oz = (c.hd + radius) - Math.abs(pos.z - c.z);
          if (ox < oz) pos.x = c.x + Math.sign(pos.x - c.x || 1) * (c.hw + radius);
          else pos.z = c.z + Math.sign(pos.z - c.z || 1) * (c.hd + radius);
        } else {
          const d = Math.sqrt(d2);
          const push = (radius - d) / d;
          pos.x += dx * push;
          pos.z += dz * push;
        }
      }
      // финальный зажим границами карты
      if (pos.x < -lim) pos.x = -lim;
      if (pos.x > lim) pos.x = lim;
      if (pos.z < -lim) pos.z = -lim;
      if (pos.z > lim) pos.z = lim;
      return hitWall;
    }

    /* ----------------------------- луч vs мир ----------------------------- */
    // Возвращает {t, collider} — ближайшее пересечение луча с AABB, либо null
    rayColliders(ox, oy, oz, dx, dy, dz, maxT) {
      let bestT = maxT, best = null;
      for (let i = 0; i < this.colliders.length; i++) {
        const c = this.colliders[i];
        // быстрый отсев по 2D-расстоянию до центра
        const px = c.x - ox, pz = c.z - oz;
        const far = Math.sqrt(c.hw * c.hw + c.hd * c.hd) + maxT;
        if (px * px + pz * pz > far * far) continue;
        const t = rayBox(ox, oy, oz, dx, dy, dz, c.x, 0, c.z, c.hw, c.h, c.hd, bestT);
        if (t !== null && t < bestT) { bestT = t; best = c; }
      }
      return best ? { t: bestT, collider: best } : null;
    }

    hasLOS(ax, ay, az, bx, by, bz) {
      const dx = bx - ax, dy = by - ay, dz = bz - az;
      const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (len < 1e-4) return true;
      const hit = this.rayColliders(ax, ay, az, dx / len, dy / len, dz / len, len - 0.05);
      return !hit;
    }

    /* ------------------------ укрытие и навигация -------------------------- */
    // Находит точку укрытия рядом с позицией: за препятствием от угрозы
    findCover(fromX, fromZ, threatX, threatZ, radius) {
      const r = radius || 14;
      let best = null, bestScore = -1e9;
      for (let a = 0; a < 12; a++) {
        for (let dist = 3; dist < r; dist += 2.2) {
          const ang = (a / 12) * TAU;
          const x = fromX + Math.cos(ang) * dist;
          const z = fromZ + Math.sin(ang) * dist;
          if (this.isBlockedCell(x, z)) continue;
          // точка должна быть вне коллайдеров
          let inside = false;
          for (const c of this.colliders) {
            if (Math.abs(x - c.x) < c.hw + 0.5 && Math.abs(z - c.z) < c.hd + 0.5) { inside = true; break; }
          }
          if (inside) continue;
          const toThreat = Math.atan2(threatZ - z, threatX - x);
          // проверяем, что между точкой и угрозой на 2 м есть стена
          const cx = x + Math.cos(toThreat) * 2.2, cz = z + Math.sin(toThreat) * 2.2;
          let covered = false;
          for (const c of this.colliders) {
            if (Math.abs(cx - c.x) < c.hw + 0.9 && Math.abs(cz - c.z) < c.hd + 0.9) { covered = true; break; }
          }
          if (!covered) continue;
          const distPlayer = Math.hypot(x - threatX, z - threatZ);
          const score = -Math.abs(distPlayer - 14) + dist * 0.15;
          if (score > bestScore) { bestScore = score; best = { x, z }; }
        }
      }
      return best;
    }

    // Простая навигация: точка шага в обход AABB
    steer(px, pz, tx, tz, radius) {
      let dx = tx - px, dz = tz - pz;
      const dist = Math.hypot(dx, dz);
      if (dist < 0.6) return { x: 0, z: 0, reached: true };
      dx /= dist; dz /= dist;
      // пробуем три направления: прямо, влево, вправо
      const probe = 1.6;
      const blocked = (ax, az) => {
        const x = px + ax * probe, z = pz + az * probe;
        if (this.isBlockedCell(x, z)) return true;
        for (const c of this.colliders) {
          if (Math.abs(x - c.x) < c.hw + radius * 0.9 && Math.abs(z - c.z) < c.hd + radius * 0.9) return true;
        }
        return false;
      };
      if (!blocked(dx, dz)) return { x: dx, z: dz, reached: false };
      const a1 = dx * 0.7 - dz * 0.7, b1 = dz * 0.7 + dx * 0.7;
      if (!blocked(a1, b1)) return { x: a1, z: b1, reached: false };
      const a2 = dx * 0.7 + dz * 0.7, b2 = dz * 0.7 - dx * 0.7;
      if (!blocked(a2, b2)) return { x: a2, z: b2, reached: false };
      const a3 = -dz, b3 = dx;
      if (!blocked(a3, b3)) return { x: a3, z: b3, reached: false };
      return { x: -dx, z: -dz, reached: false };
    }

    randomOpenPoint(centerX, centerZ, minR, maxR, rand) {
      for (let i = 0; i < 24; i++) {
        const a = rand() * TAU;
        const r = minR + rand() * (maxR - minR);
        const x = centerX + Math.cos(a) * r, z = centerZ + Math.sin(a) * r;
        if (Math.abs(x) > this.half - 2 || Math.abs(z) > this.half - 2) continue;
        if (!this.isBlockedCell(x, z)) return { x, z };
      }
      return null;
    }
  }

  /* луч против AABB (slab-метод), возвращает t или null */
  function rayBox(ox, oy, oz, dx, dy, dz, cx, cy, cz, hw, hh, hd, maxT) {
    let tmin = 0, tmax = maxT;
    // X
    if (Math.abs(dx) < 1e-9) { if (ox < cx - hw || ox > cx + hw) return null; }
    else {
      let t1 = (cx - hw - ox) / dx, t2 = (cx + hw - ox) / dx;
      if (t1 > t2) { const tmp = t1; t1 = t2; t2 = tmp; }
      tmin = Math.max(tmin, t1); tmax = Math.min(tmax, t2);
      if (tmin > tmax) return null;
    }
    // Y
    if (Math.abs(dy) < 1e-9) { if (oy < cy || oy > cy + hh) return null; }
    else {
      let t1 = (cy - oy) / dy, t2 = (cy + hh - oy) / dy;
      if (t1 > t2) { const tmp = t1; t1 = t2; t2 = tmp; }
      tmin = Math.max(tmin, t1); tmax = Math.min(tmax, t2);
      if (tmin > tmax) return null;
    }
    // Z
    if (Math.abs(dz) < 1e-9) { if (oz < cz - hd || oz > cz + hd) return null; }
    else {
      let t1 = (cz - hd - oz) / dz, t2 = (cz + hd - oz) / dz;
      if (t1 > t2) { const tmp = t1; t1 = t2; t2 = tmp; }
      tmin = Math.max(tmin, t1); tmax = Math.min(tmax, t2);
      if (tmin > tmax) return null;
    }
    return tmin;
  }

  // луч против вертикального цилиндра (бойцы)
  function rayCylinder(ox, oy, oz, dx, dy, dz, cx, cz, radius, y0, y1, maxT) {
    const ex = ox - cx, ez = oz - cz;
    const a = dx * dx + dz * dz;
    const b = 2 * (ex * dx + ez * dz);
    const c = ex * ex + ez * ez - radius * radius;
    let t = null;
    if (a > 1e-8) {
      const disc = b * b - 4 * a * c;
      if (disc >= 0) {
        const sq = Math.sqrt(disc);
        const t1 = (-b - sq) / (2 * a), t2 = (-b + sq) / (2 * a);
        for (const cand of [t1, t2]) {
          if (cand < 0 || cand > maxT) continue;
          const y = oy + dy * cand;
          if (y >= y0 && y <= y1) { t = cand; break; }
        }
      }
    }
    return t;
  }

  SH2.world = { World, rayBox, rayCylinder };
})(typeof window !== 'undefined' ? window : globalThis);
