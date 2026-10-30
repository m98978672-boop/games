// ============================================================
//  Хитбоксы.
//
//  Каждая модель в мире получает собственный невидимый хитбокс:
//  дерево, камень, куст, зверь, костёр, родник, верстак, точило,
//  вход в шахту, предмет на земле — у всех своя коробка.
//  У героя хитбокс разбит на части: голова, грудь, живот, таз,
//  плечи, предплечья, кисти, бёдра, голени, стопы.
//
//  Части не сливаются с чужими коробками: при движении герой
//  выталкивается так, чтобы ни одна его часть не пересекала
//  чужой хитбокс или ствол. Ими же пользуется прицел — луч
//  попадает ровно в ту коробку, которую видит игрок.
// ============================================================

import * as THREE from 'three';

/** Части тела героя: смещения в локальных осях (x — влево, z — вперёд) */
export const PLAYER_PARTS = [
  { id: 'head', x: 0, y: 1.66, w: 0.30, h: 0.30, d: 0.30 },
  { id: 'neck', x: 0, y: 1.47, w: 0.18, h: 0.12, d: 0.18 },
  { id: 'chest', x: 0, y: 1.26, w: 0.52, h: 0.36, d: 0.30 },
  { id: 'belly', x: 0, y: 1.02, w: 0.44, h: 0.20, d: 0.28 },
  { id: 'hip', x: 0, y: 0.86, w: 0.46, h: 0.16, d: 0.28 },
  { id: 'shoulderL', x: -0.30, y: 1.38, w: 0.18, h: 0.18, d: 0.20 },
  { id: 'shoulderR', x: 0.30, y: 1.38, w: 0.18, h: 0.18, d: 0.20 },
  { id: 'armL', x: -0.36, y: 1.16, w: 0.15, h: 0.32, d: 0.17 },
  { id: 'armR', x: 0.36, y: 1.16, w: 0.15, h: 0.32, d: 0.17 },
  { id: 'forearmL', x: -0.39, y: 0.90, w: 0.13, h: 0.28, d: 0.15 },
  { id: 'forearmR', x: 0.39, y: 0.90, w: 0.13, h: 0.28, d: 0.15 },
  { id: 'handL', x: -0.40, y: 0.71, w: 0.13, h: 0.15, d: 0.16 },
  { id: 'handR', x: 0.40, y: 0.71, w: 0.13, h: 0.15, d: 0.16 },
  { id: 'thighL', x: -0.13, y: 0.60, w: 0.19, h: 0.44, d: 0.22 },
  { id: 'thighR', x: 0.13, y: 0.60, w: 0.19, h: 0.44, d: 0.22 },
  { id: 'shinL', x: -0.13, y: 0.24, w: 0.16, h: 0.34, d: 0.19 },
  { id: 'shinR', x: 0.13, y: 0.24, w: 0.16, h: 0.34, d: 0.19 },
  { id: 'footL', x: -0.13, y: 0.055, w: 0.16, h: 0.11, d: 0.28 },
  { id: 'footR', x: 0.13, y: 0.055, w: 0.16, h: 0.11, d: 0.28 },
];

const KIND_COLOR = {
  player: 0x7ee3ff,
  mob: 0xff8a5c,
  tree: 0x8ad46a,
  rock: 0xc8c2b4,
  bush: 0x6fbf55,
  station: 0xffd166,
  fire: 0xff7a3d,
  spring: 0x5fc6ff,
  mine: 0xbc8cff,
  pickup: 0xffee88,
  model: 0xffffff,
};

/** Коробка в мировых координатах: центр + размеры */
function boxOf(x, yBottom, z, w, h, d, yaw = 0) {
  const c = Math.abs(Math.cos(yaw));
  const s = Math.abs(Math.sin(yaw));
  // приближаем повёрнутую коробку её габаритом по осям мира
  const ww = w * c + d * s;
  const dd = w * s + d * c;
  return {
    minX: x - ww / 2, maxX: x + ww / 2,
    minY: yBottom, maxY: yBottom + h,
    minZ: z - dd / 2, maxZ: z + dd / 2,
  };
}

function overlap3(a, b) {
  return a.minX < b.maxX && a.maxX > b.minX
    && a.minY < b.maxY && a.maxY > b.minY
    && a.minZ < b.maxZ && a.maxZ > b.minZ;
}

/** Пересечение луча и коробки (слэб-метод), возвращает дистанцию или null */
function rayBox(origin, dir, box, maxDist) {
  let tmin = 0;
  let tmax = maxDist;
  const axes = [
    ['x', 'minX', 'maxX'],
    ['y', 'minY', 'maxY'],
    ['z', 'minZ', 'maxZ'],
  ];
  for (const [axis, lo, hi] of axes) {
    const o = origin[axis];
    const d = dir[axis];
    const min = box[lo];
    const max = box[hi];
    if (Math.abs(d) < 1e-8) {
      if (o < min || o > max) return null;
      continue;
    }
    let t1 = (min - o) / d;
    let t2 = (max - o) / d;
    if (t1 > t2) { const t = t1; t1 = t2; t2 = t; }
    if (t1 > tmin) tmin = t1;
    if (t2 < tmax) tmax = t2;
    if (tmin > tmax) return null;
  }
  return tmin > 0 ? tmin : null;
}

export class HitboxSystem {
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;
    this.registry = new Map();     // id -> { kind, box(), physical, ref } — подвижные модели
    this.staticBoxes = [];         // неподвижные модели (деревья, камни, кусты…)
    this.staticGrid = new Map();   // ячейка -> индексы staticBoxes
    this.gridCell = 8;
    this.colliderGrids = new WeakMap();
    this.nextId = 1;
    this.debug = false;
    this.debugGroup = new THREE.Group();
    this.debugGroup.name = 'hitboxes';
    this.debugGroup.visible = false;
    this.scene.add(this.debugGroup);
    this.debugMeshes = new Map();
    this._wireGeo = new THREE.BoxGeometry(1, 1, 1);
    this._wireMat = new THREE.LineBasicMaterial({ color: 0x7ee3ff, transparent: true, opacity: 0.9, depthTest: false });
    this._wireCache = new Map();
    this.partBuffer = [];
    this.lastPushes = 0;
  }

  // ------------------------------------------------------------
  //  Регистрация моделей
  // ------------------------------------------------------------

  /**
   * Зарегистрировать модель.
   * box() возвращает { x, y, z, w, h, d, yaw } в мировых координатах.
   * physical — должна ли модель выталкивать героя.
   */
  register(kind, box, { physical = true, ref = null, skipAim = false } = {}) {
    const id = this.nextId++;
    this.registry.set(id, { id, kind, box, physical, ref, skipAim });
    return id;
  }

  /**
   * Неподвижная модель: коробка считается один раз и кладётся в сетку.
   * Так тысячи деревьев и камней не пересчитываются каждый кадр.
   */
  registerStatic(kind, b, { physical = false, ref = null, enabled = null, skipAim = false } = {}) {
    const id = this.nextId++;
    const box = boxOf(b.x, b.y, b.z, b.w, b.h, b.d, b.yaw || 0);
    const entry = { id, kind, physical, ref, enabled, skipAim, box };
    const index = this.staticBoxes.push(entry) - 1;
    const cell = this.gridCell;
    const minX = Math.floor(box.minX / cell);
    const maxX = Math.floor(box.maxX / cell);
    const minZ = Math.floor(box.minZ / cell);
    const maxZ = Math.floor(box.maxZ / cell);
    for (let cx = minX; cx <= maxX; cx++) {
      for (let cz = minZ; cz <= maxZ; cz++) {
        const key = cx * 100000 + cz;
        let bucket = this.staticGrid.get(key);
        if (!bucket) this.staticGrid.set(key, (bucket = []));
        bucket.push(index);
      }
    }
    return id;
  }

  unregister(id) {
    this.registry.delete(id);
    this._dropDebug(id);
  }

  /** Сетка по коллайдерам мира: не проверяем все стволы каждый кадр */
  _colliderNear(world, x, z, radius) {
    if (!world || !world.colliders || !world.colliders.length) return [];
    let grid = this.colliderGrids.get(world);
    if (!grid) {
      grid = new Map();
      const cell = this.gridCell;
      for (const c of world.colliders) {
        if (!Number.isFinite(c.x) || !Number.isFinite(c.z) || !Number.isFinite(c.r)) continue;
        const key = Math.floor(c.x / cell) * 100000 + Math.floor(c.z / cell);
        let bucket = grid.get(key);
        if (!bucket) grid.set(key, (bucket = []));
        bucket.push(c);
      }
      this.colliderGrids.set(world, grid);
    }
    const cell = this.gridCell;
    const out = [];
    const minX = Math.floor((x - radius) / cell);
    const maxX = Math.floor((x + radius) / cell);
    const minZ = Math.floor((z - radius) / cell);
    const maxZ = Math.floor((z + radius) / cell);
    for (let cx = minX; cx <= maxX; cx++) {
      for (let cz = minZ; cz <= maxZ; cz++) {
        const bucket = grid.get(cx * 100000 + cz);
        if (!bucket) continue;
        for (const c of bucket) out.push(c);
      }
    }
    return out;
  }

  /** Неподвижные коробки вокруг точки (из сетки) */
  staticNear(x, z, radius = 6) {
    const cell = this.gridCell;
    const out = [];
    const seen = new Set();
    const minX = Math.floor((x - radius) / cell);
    const maxX = Math.floor((x + radius) / cell);
    const minZ = Math.floor((z - radius) / cell);
    const maxZ = Math.floor((z + radius) / cell);
    for (let cx = minX; cx <= maxX; cx++) {
      for (let cz = minZ; cz <= maxZ; cz++) {
        const bucket = this.staticGrid.get(cx * 100000 + cz);
        if (!bucket) continue;
        for (const i of bucket) {
          if (seen.has(i)) continue;
          seen.add(i);
          const entry = this.staticBoxes[i];
          if (entry.enabled && !entry.enabled()) continue;
          out.push(entry);
        }
      }
    }
    return out;
  }

  /** Подвижные коробки (звери, предметы) + неподвижные рядом */
  boxes(x = this.player?.position?.x ?? 0, z = this.player?.position?.z ?? 0, radius = 8) {
    const out = [];
    for (const entry of this.registry.values()) {
      let b;
      try { b = entry.box(); } catch (err) { continue; }
      if (!b) continue;
      out.push({
        ...boxOf(b.x, b.y, b.z, b.w, b.h, b.d, b.yaw || 0),
        kind: entry.kind,
        physical: entry.physical,
        ref: entry.ref,
        id: entry.id,
      });
    }
    for (const entry of this.staticNear(x, z, radius)) {
      out.push({ ...entry.box, kind: entry.kind, physical: entry.physical, ref: entry.ref, id: entry.id });
    }
    return out;
  }

  // ------------------------------------------------------------
  //  Части тела героя в мировых координатах
  // ------------------------------------------------------------

  playerParts(pos, yaw, crouch = 0) {
    const cos = Math.cos(yaw);
    const sin = Math.sin(yaw);
    const out = this.partBuffer;
    out.length = 0;
    for (const p of PLAYER_PARTS) {
      // локальные x (влево) и z (вперёд) поворачиваем по взгляду
      const lz = p.z || 0;
      const wx = pos.x + p.x * cos + lz * sin;
      const wz = pos.z - p.x * sin + lz * cos;
      out.push({
        id: p.id,
        x: wx,
        y: pos.y + p.y - crouch,
        z: wz,
        w: p.w,
        h: p.h,
        d: p.d,
        yaw,
      });
    }
    return out;
  }

  worldParts(pos, yaw, crouch = 0) {
    return this.playerParts(pos, yaw, crouch).map((p) => ({
      ...boxOf(p.x, p.y - p.h / 2, p.z, p.w, p.h, p.d, yaw),
      part: p.id,
    }));
  }

  // ------------------------------------------------------------
  //  Столкновения: зазор между частями героя и чужими коробками
  // ------------------------------------------------------------

  /**
   * Вытолкнуть героя так, чтобы ни одна его часть не пересекалась
   * с чужими хитбоксами. Возвращает число исправленных пересечений.
   */
  resolvePlayer(player, world, options = {}) {
    const { mobs = null, extraBoxes = [], iterations = 3 } = options;
    const pos = player.position;
    const velocity = player.velocity;

    let fixed = 0;
    for (let iter = 0; iter < iterations; iter++) {
      const yaw = player.facing || 0;
      const parts = this.playerParts(pos, yaw, 0);
      // Части в пределах итерации неподвижны, даже если pos выталкивается.
      // Считаем их коробки один раз, а не для каждой модели и зверя.
      const partBoxes = parts.map((part) => boxOf(part.x, part.y - part.h / 2, part.z, part.w, part.h, part.d, yaw));
      let moved = false;

      // 1) коробки зарегистрированных моделей (станки, звери, костры…)
      const boxes = this.boxes(pos.x, pos.z, 7);
      for (const b of extraBoxes) boxes.push(b);
      for (const b of boxes) {
        if (!b.physical) continue;
        let best = 0;
        let bx = 0;
        let bz = 0;
        for (let i = 0; i < parts.length; i++) {
          const part = parts[i];
          if (!Number.isFinite(part.x) || !Number.isFinite(part.z)) continue;
          const pb = partBoxes[i];
          if (!overlap3(pb, b)) continue;
          const overlapX = Math.min(pb.maxX, b.maxX) - Math.max(pb.minX, b.minX);
          const overlapZ = Math.min(pb.maxZ, b.maxZ) - Math.max(pb.minZ, b.minZ);
          if (overlapX <= 0 || overlapZ <= 0) continue;
          const pen = Math.min(overlapX, overlapZ);
          if (pen <= best) continue;
          best = pen;
          const signX = (pb.minX + pb.maxX) / 2 >= (b.minX + b.maxX) / 2 ? 1 : -1;
          const signZ = (pb.minZ + pb.maxZ) / 2 >= (b.minZ + b.maxZ) / 2 ? 1 : -1;
          bx = overlapX < overlapZ ? signX * (overlapX + 0.05) : 0;
          bz = overlapX < overlapZ ? 0 : signZ * (overlapZ + 0.05);
        }
        if (best > 0) {
          pos.x += bx;
          pos.z += bz;
          if (velocity) {
            const len = Math.hypot(bx, bz) || 1;
            const nx = bx / len;
            const nz = bz / len;
            const into = velocity.x * nx + velocity.z * nz;
            if (into < 0) { velocity.x -= nx * into; velocity.z -= nz * into; }
          }
          fixed++;
          moved = true;
        }
      }

      // 2) стволы, валуны и прочие цилиндры мира (только соседние ячейки)
      for (const c of this._colliderNear(world, pos.x, pos.z, 4)) {
        if (c.disabled || c.soft) continue;
        if (!Number.isFinite(c.x) || !Number.isFinite(c.z) || !Number.isFinite(c.r)) continue;
        const groundY = world.heightAt(c.x, c.z);
        const top = groundY + (c.height || 1.2);
        let best = 0;
        let nx = 0;
        let nz = 0;
        for (const part of parts) {
          if (!Number.isFinite(part.x) || !Number.isFinite(part.z)) continue;
          if (part.y + part.h / 2 < groundY - 0.1 || part.y - part.h / 2 > top) continue;
          const r = Math.max(part.w, part.d) / 2;
          const dx = part.x - c.x;
          const dz = part.z - c.z;
          const min = c.r + r;
          const d2 = dx * dx + dz * dz;
          if (d2 >= min * min) continue;
          const d = Math.sqrt(d2);
          const pen = min - (Number.isFinite(d) ? d : 0);
          if (pen <= best) continue;
          best = pen;
          if (d > 0.0001) { nx = dx / d; nz = dz / d; } else { nx = 1; nz = 0; }
        }
        if (best > 0) {
          pos.x += nx * (best + 0.05);
          pos.z += nz * (best + 0.05);
          if (velocity) {
            const into = velocity.x * nx + velocity.z * nz;
            if (into < 0) { velocity.x -= nx * into; velocity.z -= nz * into; }
          }
          fixed++;
          moved = true;
        }
      }

      // 3) сами звери: их коробки не должны пересекаться с нашими
      if (mobs) {
        for (const mob of mobs.list) {
          if (!mob.alive) continue;
          const hb = mob.hitboxSize || { w: 1, h: 1, d: 1 };
          const mb = boxOf(mob.x, (mob.y || 0) + (mob.def?.flying ? 2.5 : 0), mob.z, hb.w, hb.h, hb.d, mob.facing || 0);
          let best = 0;
          let bx = 0;
          let bz = 0;
          for (const pb of partBoxes) {
            if (!overlap3(pb, mb)) continue;
            const overlapX = Math.min(pb.maxX, mb.maxX) - Math.max(pb.minX, mb.minX);
            const overlapZ = Math.min(pb.maxZ, mb.maxZ) - Math.max(pb.minZ, mb.minZ);
            if (overlapX <= 0 || overlapZ <= 0) continue;
            const pen = Math.min(overlapX, overlapZ);
            if (pen <= best) continue;
            best = pen;
            const signX = (pb.minX + pb.maxX) / 2 >= (mb.minX + mb.maxX) / 2 ? 1 : -1;
            const signZ = (pb.minZ + pb.maxZ) / 2 >= (mb.minZ + mb.maxZ) / 2 ? 1 : -1;
            bx = overlapX < overlapZ ? signX * (overlapX + 0.05) : 0;
            bz = overlapX < overlapZ ? 0 : signZ * (overlapZ + 0.05);
          }
          if (best > 0) {
            pos.x += bx;
            pos.z += bz;
            if (velocity) { velocity.x *= 0.3; velocity.z *= 0.3; }
            fixed++;
            moved = true;
          }
        }
      }

      if (!moved) break;
    }
    this.lastPushes = fixed;
    return fixed;
  }

  /** Вытолкнуть героя из чужой коробки по наименьшей оси */
  _pushOut(pos, velocity, pb, b, pad = 0) {
    const overlapX = Math.min(pb.maxX, b.maxX) - Math.max(pb.minX, b.minX);
    const overlapZ = Math.min(pb.maxZ, b.maxZ) - Math.max(pb.minZ, b.minZ);
    if (overlapX <= 0 || overlapZ <= 0) return false;

    // в какую сторону выталкивать: от центра чужой коробки
    const bx = (b.minX + b.maxX) / 2;
    const bz = (b.minZ + b.maxZ) / 2;
    const px = (pb.minX + pb.maxX) / 2;
    const pz = (pb.minZ + pb.maxZ) / 2;

    if (overlapX < overlapZ) {
      const sign = px >= bx ? 1 : -1;
      const push = overlapX + pad;
      pos.x += sign * push;
      if (velocity && Math.sign(velocity.x) === -sign) velocity.x *= 0.1;
    } else {
      const sign = pz >= bz ? 1 : -1;
      const push = overlapZ + pad;
      pos.z += sign * push;
      if (velocity && Math.sign(velocity.z) === -sign) velocity.z *= 0.1;
    }
    return true;
  }

  // ------------------------------------------------------------
  //  Прицел по хитбоксам
  // ------------------------------------------------------------

  /**
   * Ближайшая коробка под лучом.
   * Возвращает { kind, ref, dist, box, id } или null.
   */
  raycast(origin, dir, maxDist = 8) {
    let best = null;
    const consider = (entry, box) => {
      if (entry.skipAim) return;
      const t = rayBox(origin, dir, box, maxDist);
      if (t === null) return;
      if (!best || t < best.dist) {
        best = { kind: entry.kind, ref: entry.ref, dist: t, box, id: entry.id };
      }
    };

    // подвижные модели
    for (const entry of this.registry.values()) {
      let b;
      try { b = entry.box(); } catch (err) { continue; }
      if (!b) continue;
      consider(entry, boxOf(b.x, b.y, b.z, b.w, b.h, b.d, b.yaw || 0));
    }

    // неподвижные: собираем ячейки вдоль луча, не весь остров
    const seen = new Set();
    const step = this.gridCell * 0.9;
    for (let d = 0; d <= maxDist + step; d += step) {
      const px = origin.x + dir.x * d;
      const pz = origin.z + dir.z * d;
      for (const entry of this.staticNear(px, pz, step)) {
        if (seen.has(entry.id)) continue;
        seen.add(entry.id);
        consider(entry, entry.box);
      }
    }
    return best;
  }

  // ------------------------------------------------------------
  //  Отладка: показать все коробки (F3 → F)
  // ------------------------------------------------------------

  setDebug(show) {
    this.debug = !!show;
    this.debugGroup.visible = this.debug;
    return this.debug;
  }

  updateDebug(player) {
    if (!this.debug) return;
    let id = 0;

    // части героя
    const parts = this.playerParts(player.position, player.facing || 0, 0);
    const color = KIND_COLOR.player;
    for (const part of parts) {
      this._drawBox(id++, boxOf(part.x, part.y - part.h / 2, part.z, part.w, part.h, part.d, part.yaw), color, part.id);
    }
    // чужие модели: подвижные и неподвижные рядом с героем
    for (const entry of this.registry.values()) {
      let b;
      try { b = entry.box(); } catch (err) { continue; }
      if (!b) continue;
      this._drawBox(id++, boxOf(b.x, b.y, b.z, b.w, b.h, b.d, b.yaw || 0), KIND_COLOR[entry.kind] || 0xffffff, '');
    }
    for (const entry of this.staticNear(player.position.x, player.position.z, 16)) {
      this._drawBox(id++, entry.box, KIND_COLOR[entry.kind] || 0xffffff, '');
    }
    // лишние меши убираем
    for (const [key, mesh] of this.debugMeshes) {
      if (key >= id) { this.debugGroup.remove(mesh); this.debugMeshes.delete(key); }
    }
  }

  _drawBox(index, box, color, label) {
    let mesh = this.debugMeshes.get(index);
    const w = Math.max(0.02, box.maxX - box.minX);
    const h = Math.max(0.02, box.maxY - box.minY);
    const d = Math.max(0.02, box.maxZ - box.minZ);
    if (!mesh) {
      const geo = new THREE.EdgesGeometry(this._wireGeo);
      mesh = new THREE.LineSegments(geo, this._wireMat.clone());
      mesh.frustumCulled = false;
      mesh.renderOrder = 9999;
      mesh.userData.label = label;
      this.debugGroup.add(mesh);
      this.debugMeshes.set(index, mesh);
    }
    mesh.material.color.setHex(color);
    mesh.position.set((box.minX + box.maxX) / 2, (box.minY + box.maxY) / 2, (box.minZ + box.maxZ) / 2);
    mesh.scale.set(w, h, d);
  }

  _dropDebug(id) {
    // отладочные меши пересоздаются каждый кадр; чистим только выход за границу
    void id;
  }

  clearDebug() {
    for (const mesh of this.debugMeshes.values()) this.debugGroup.remove(mesh);
    this.debugMeshes.clear();
  }

  stats() {
    return {
      models: this.registry.size + this.staticBoxes.length,
      dynamic: this.registry.size,
      static: this.staticBoxes.length,
      parts: PLAYER_PARTS.length,
      pushes: this.lastPushes,
    };
  }
}

export { boxOf, overlap3, rayBox };
