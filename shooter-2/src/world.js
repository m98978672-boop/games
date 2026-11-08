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
      /* Толщина коллайдера мешков — не «полстены», а реальная кладка.
         Раньше в коллайдер закладывался припуск 0.3 м и сверху ещё радиус
         тела, поэтому до мешков нельзя было подойти ближе чем на полметра:
         модель стоит в воздухе, а стена «отталкивает». */
      const lowGap = 0.06;
      // границы карты
      const lim = half - radius;
      if (pos.x < -lim) pos.x = -lim;
      if (pos.x > lim) pos.x = lim;
      if (pos.z < -lim) pos.z = -lim;
      if (pos.z > lim) pos.z = lim;
      let hitWall = false;
      // высота «ног» тела: перепрыгиваемые и низкие препятствия выше не мешают
      const feet = pos.y || 0;
      for (let i = 0; i < this.colliders.length; i++) {
        const c = this.colliders[i];
        // вертикальная полоса: низкое препятствие не держит, если тело уже над ним
        if (c.standLow && feet > 0.55 * (c.h || 1)) continue;
        // низкие препятствия (мешки, камни) не отталкивают «на вытянутую руку»:
        // тело подходит вплотную и упирается, а не парит в полуметре
        const rr = c.standLow ? Math.max(0.16, radius - lowGap - 0.14) : radius;
        const cx = Math.max(c.x - c.hw, Math.min(pos.x, c.x + c.hw));
        const cz = Math.max(c.z - c.hd, Math.min(pos.z, c.z + c.hd));
        let dx = pos.x - cx, dz = pos.z - cz;
        let d2 = dx * dx + dz * dz;
        if (d2 > rr * rr) continue;
        hitWall = true;
        if (d2 < 1e-8) {
          // центр внутри коробки — выталкиваем по минимальной оси
          const ox = (c.hw + rr) - Math.abs(pos.x - c.x);
          const oz = (c.hd + rr) - Math.abs(pos.z - c.z);
          if (ox < oz) pos.x = c.x + Math.sign(pos.x - c.x || 1) * (c.hw + rr);
          else pos.z = c.z + Math.sign(pos.z - c.z || 1) * (c.hd + rr);
        } else {
          const d = Math.sqrt(d2);
          const nx = dx / d, nz = dz / d;
          // выталкиваем ровно на проникновение — касательное движение
          // сохраняется, поэтому юнит скользит вдоль стены, а не липнет
          const push = rr - d;
          pos.x += nx * push;
          pos.z += nz * push;
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
    // Возвращает {t, collider} — ближайшее пересечение луча с AABB, либо null.
  // opts: { bullet: true } — луч пули; окна и низкие препятствия считаются
  // по своей высоте, а непробиваемые поверхности возвращают {stopped: true}
    rayColliders(ox, oy, oz, dx, dy, dz, maxT, opts) {
      const o = opts || {};
      let bestT = maxT, best = null;
      for (let i = 0; i < this.colliders.length; i++) {
        const c = this.colliders[i];
        // быстрый отсев по 2D-расстоянию до центра
        const px = c.x - ox, pz = c.z - oz;
        const far = Math.sqrt(c.hw * c.hw + c.hd * c.hd) + maxT;
        if (px * px + pz * pz > far * far) continue;
        // у части препятствий есть проём: луч проходит через окно/бойницу,
        // если попал в его прямоугольник (окно смещено от центра стены)
        if (o.bullet && c.holes) {
          // пуля попала в оконный/пулевой проём — проходит сквозь это препятствие
          if (hitHole(ox, oy, oz, dx, dy, dz, c, bestT)) continue;
        }
        // высота уже учтена в rayBox (box от 0 до c.h): луч выше кладки мешков
        // проходит над ними, а не упирается в невидимую стену
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

    /* --------------------- направленное укрытие ---------------------------- */
    /* Насколько позиция прикрыта от конкретного стрелка.
       Считаем три луча от стрелка к габаритам цели (низ/центр/верх).
       Возвращает { cover: 0..1, crouchHelps: bool, blocker: collider|null }.
       cover 1 — перекрыты все три, 0 — открыто. Низкие препятствия дают
       укрытие только присевшему: это и возвращает crouchHelps. */
    coverFrom(x, z, threatX, threatZ, height, eyeY) {
      const h = height || 1.7;
      const from = threatX === undefined ? 0 : threatX;
      const fromZ = threatZ === undefined ? 0 : threatZ;
      const targets = [h * 0.20, h * 0.55, h * 0.92];
      const eye = eyeY === undefined ? 1.5 : eyeY;
      let blocked = 0;
      let lowOnly = true;
      let blocker = null;
      for (const ty of targets) {
        const res = this.segmentBlocks(from, eye, fromZ, x, ty, z);
        if (res) {
          blocked++;
          if (res.collider) blocker = blocker || res.collider;
          if (!res.collider || !res.collider.standLow) lowOnly = false;
        }
      }
      return { cover: blocked / targets.length, lowOnly: lowOnly && blocked > 0, blocker };
    }

    /* пересекает ли отрезок (стрелок → точка) препятствие, и какое */
    segmentBlocks(ax, ay, az, bx, by, bz) {
      const dx = bx - ax, dy = by - ay, dz = bz - az;
      const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (len < 1e-4) return null;
      const hit = this.rayColliders(ax, ay, az, dx / len, dy / len, dz / len, len, { bullet: true });
      return hit ? { t: hit.t, collider: hit.collider } : null;
    }

    /* улучшенный поиск укрытия: важно не «рядом со стеной», а «стена между
       юнитом и угрозой», причём стена должна быть высокой либо юнит присесть */
    coverSpot(fromX, fromZ, threatX, threatZ, radius, height) {
      const r = radius || 12;
      const h = height || 1.7;
      let best = null, bestScore = -1e9;
      for (let a = 0; a < 16; a++) {
        for (let dist = 2.5; dist < r; dist += 1.8) {
          const ang = (a / 16) * TAU;
          const x = fromX + Math.cos(ang) * dist;
          const z = fromZ + Math.sin(ang) * dist;
          if (this.isBlockedCell(x, z)) continue;
          const cov = this.coverFrom(x, z, threatX, threatZ, h, 1.5);
          if (cov.cover < 0.5) continue;
          // шанс попадания падает с укрытием и растёт с дистанцией до угрозы
          const distThreat = Math.hypot(x - threatX, z - threatZ);
          const exposure = 1 - cov.cover;
          const score = cov.cover * 2.2 - exposure * 1.4 - dist * 0.06
            + Math.min(6, distThreat) * 0.05 - (cov.lowOnly ? 0.35 : 0);
          if (score > bestScore) { bestScore = score; best = { x, z, cover: cov.cover, crouch: cov.lowOnly }; }
        }
      }
      return best;
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

    /* Свободна ли точка для тела радиуса radius ЦЕЛИКОМ.
       Клетка сетки 4×4 м слишком груба: она помечает занятой любую точку,
       рядом с которой стоит бочка, поэтому раньше годные места отбрасывались.
       Здесь проверяется настоящая геометрия: тело не задевает ни один AABB,
       глаз не оказывается внутри препятствия по высоте, и точка помещается
       на карте. Именно эта функция отвечает за то, чтобы никто не появлялся
       «в чужой модельке» — ни игрок, ни боевики, ни ящики целей. */
    isFreeSpot(x, z, radius, eyeY) {
      const rad = radius === undefined ? 0.5 : radius;
      const eye = eyeY === undefined ? 1.62 : eyeY;
      if (Math.abs(x) > this.half - rad || Math.abs(z) > this.half - rad) return false;
      for (let i = 0; i < this.colliders.length; i++) {
        const c = this.colliders[i];
        // низкое препятствие не мешает, если глаз выше него
        if (c.standLow && eye > 0.55 * (c.h || 1)) continue;
        const dx = Math.max(c.x - c.hw - x, 0, x - (c.x + c.hw));
        const dz = Math.max(c.z - c.hd - z, 0, z - (c.z + c.hd));
        if (dx * dx + dz * dz < rad * rad) return false;
        // точка внутри контура и ниже высоты препятствия — это «в стене»
        if (x > c.x - c.hw && x < c.x + c.hw && z > c.z - c.hd && z < c.z + c.hd && eye < (c.h || 3)) {
          return false;
        }
      }
      return true;
    }

    /* Свободная точка рядом с центром: сначала кольцами по спирали, затем
       шире. Возвращает null, если вокруг совсем тесно. */
    findFreeSpot(centerX, centerZ, opts) {
      const o = opts || {};
      const rad = o.radius === undefined ? 0.5 : o.radius;
      const eye = o.eyeY === undefined ? 1.62 : o.eyeY;
      const minR = o.minR === undefined ? 0 : o.minR;
      const maxR = o.maxR === undefined ? 6 : o.maxR;
      const rand = o.rand || Math.random;
      const taken = o.taken || null;   // [{x,z,r}] — занятые места (игрок, другие бойцы)
      const clearOf = (x, z) => {
        if (!taken) return true;
        for (const t of taken) {
          const tr = t.r === undefined ? 0.8 : t.r;
          if (Math.hypot(x - t.x, z - t.z) < tr) return false;
        }
        return true;
      };
      if (minR === 0 && this.isFreeSpot(centerX, centerZ, rad, eye) && clearOf(centerX, centerZ)) {
        return { x: centerX, z: centerZ };
      }
      for (let r = Math.max(0.4, minR); r <= maxR + 1e-6; r += 0.8) {
        const n = Math.max(6, Math.round(r * 6));
        const a0 = rand() * TAU;
        for (let i = 0; i < n; i++) {
          const a = a0 + (i / n) * TAU;
          const x = centerX + Math.cos(a) * r;
          const z = centerZ + Math.sin(a) * r;
          if (this.isFreeSpot(x, z, rad, eye) && clearOf(x, z)) return { x, z };
        }
      }
      return null;
    }
  }

  /* проём в препятствии (окно, бойница, пролом).
     Проём задан прямоугольником относительно центра коллайдера:
       { dy0, dy1, du0, du1, dv0, dv1 } — высота и смещения по X/Z, метры.
     Если луч входит в препятствие внутри проёма — стена не считается. */
  function hitHole(ox, oy, oz, dx, dy, dz, c, maxT) {
    if (!c.holes || !c.holes.length) return false;
    const t = rayBox(ox, oy, oz, dx, dy, dz, c.x, 0, c.z, c.hw, c.h, c.hd, maxT);
    if (t === null) return false;
    const y = oy + dy * t;
    const lx = (ox + dx * t) - c.x;
    const lz = (oz + dz * t) - c.z;
    for (const h of c.holes) {
      if (y < h.dy0 || y > h.dy1) continue;
      if (lx < h.du0 || lx > h.du1) continue;
      if (lz < h.dv0 || lz > h.dv1) continue;
      return true;
    }
    return false;
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

  SH2.world = { World, rayBox, rayCylinder, hitHole };
})(typeof window !== 'undefined' ? window : globalThis);
