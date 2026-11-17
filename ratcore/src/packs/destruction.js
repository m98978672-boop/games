// RatCore Pack [pack:destruction] — Граф опор разрушаемости, обрушение в обломки и огонь по ветру (F-132..F-135, A-90..A-91)
// Подключается строго по выбору (Zero-Cost Opt-In, RC-108 когда пакет выключен).

import { clamp } from '../core/math.js';

export class DestructionSystem {
  constructor() {
    this.structures = new Map();
    this.fires = new Map();
    this.debris = [];
    this.nextFireId = 1;
  }

  // Регистрация постройки как графа блоков с опорным фундаментом (isFoundation: true)
  registerStructure({ id, blocks = [] } = {}) {
    const sid = String(id || `struct_${this.structures.size + 1}`);
    const map = new Map();
    for (const b of blocks) {
      map.set(String(b.id), {
        id: String(b.id),
        x: Number(b.x || 0),
        y: Number(b.y || 0),
        h: Number(b.h || 0),
        hp: Math.max(1, Number(b.hp ?? 100)),
        maxHp: Math.max(1, Number(b.hp ?? 100)),
        isFoundation: Boolean(b.isFoundation),
        neighbors: Array.isArray(b.neighbors) ? b.neighbors.map(String) : [],
        intact: true,
      });
    }
    this.structures.set(sid, { id: sid, blocks: map });
    return { id: sid, blockCount: map.size };
  }

  // F-132 / A-90: Нанесение урона блоку + BFS-поиск потерявших связь с фундаментом (обрушение моста/башни!)
  damageBlock({ structureId, blockId, amount = 50 } = {}) {
    const st = this.structures.get(structureId);
    if (!st) return { ok: false, reason: 'structure-not-found' };
    const blk = st.blocks.get(String(blockId));
    if (!blk || !blk.intact) return { ok: false, reason: 'block-not-found-or-broken' };

    blk.hp = Math.max(0, blk.hp - Math.max(0, Number(amount)));
    const collapsed = [];

    if (blk.hp <= 0) {
      blk.intact = false;
      collapsed.push(blk.id);
      this._spawnDebris(structureId, blk);

      // BFS от всех целых фундаментов
      const supported = new Set();
      const queue = [];
      for (const b of st.blocks.values()) {
        if (b.intact && b.isFoundation) {
          supported.add(b.id);
          queue.push(b);
        }
      }
      while (queue.length > 0) {
        const cur = queue.shift();
        for (const nid of cur.neighbors) {
          const nb = st.blocks.get(nid);
          if (nb && nb.intact && !supported.has(nb.id)) {
            supported.add(nb.id);
            queue.push(nb);
          }
        }
      }

      // Всё, что оторвано от опоры -> мгновенно обрушивается в обломки!
      for (const b of st.blocks.values()) {
        if (b.intact && !supported.has(b.id)) {
          b.intact = false;
          b.hp = 0;
          collapsed.push(b.id);
          this._spawnDebris(structureId, b);
        }
      }
    }

    let intactCount = 0;
    for (const b of st.blocks.values()) if (b.intact) intactCount++;
    return {
      ok: true,
      structureId,
      targetHp: blk.hp,
      collapsedCount: collapsed.length,
      collapsed,
      intactRemaining: intactCount,
    };
  }

  _spawnDebris(structureId, blk) {
    this.debris.push({
      id: `deb_${this.debris.length + 1}`,
      structureId,
      sourceBlockId: blk.id,
      x: blk.x,
      y: blk.y,
      h: blk.h,
      mass: 2.5,
    });
    if (this.debris.length > 512) this.debris.shift();
  }

  // F-134 / A-91: Очаги пожара с распространением по вектору ветра и тушением водой
  ignite({ x = 0, y = 0, h = 1, intensity = 0.7, fuel = 100 } = {}) {
    const id = `fire_${this.nextFireId++}`;
    const f = {
      id,
      x: Number(x),
      y: Number(y),
      h: Number(h),
      intensity: clamp(Number(intensity), 0.1, 1.0),
      fuel: Math.max(5, Number(fuel)),
      active: true,
    };
    this.fires.set(id, f);
    return { ...f };
  }

  extinguish({ x = 0, y = 0, radius = 3, power = 1.0 } = {}) {
    let extinguished = 0;
    for (const f of this.fires.values()) {
      if (!f.active) continue;
      if (Math.hypot(f.x - x, f.y - y) <= radius) {
        f.intensity = clamp(f.intensity - power, 0, 1);
        if (f.intensity <= 0.05) {
          f.active = false;
          extinguished++;
        }
      }
    }
    return { extinguished, activeFires: [...this.fires.values()].filter((f) => f.active).length };
  }

  tickFire({ dt = 1.0, windDx = 2.0, windDy = 0.0, isRaining = false } = {}) {
    const spawned = [];
    const active = [...this.fires.values()].filter((f) => f.active);
    const windSpd = Math.hypot(windDx, windDy);

    for (const f of active) {
      f.fuel -= (4 + f.intensity * 6) * dt;
      if (isRaining) f.intensity = clamp(f.intensity - 0.25 * dt, 0, 1);
      if (f.fuel <= 0 || f.intensity <= 0.05) {
        f.active = false;
        continue;
      }
      // Распространение огня строго по направлению ветра при достаточной интенсивности
      if (!isRaining && f.intensity >= 0.55 && windSpd >= 1.5 && this.fires.size < 64) {
        const nx = Number((f.x + (windDx / windSpd) * 2.0).toFixed(2));
        const ny = Number((f.y + (windDy / windSpd) * 2.0).toFixed(2));
        const tooClose = [...this.fires.values()].some((o) => o.active && Math.hypot(o.x - nx, o.y - ny) < 1.2);
        if (!tooClose) {
          const child = this.ignite({ x: nx, y: ny, h: f.h, intensity: f.intensity * 0.85, fuel: f.fuel * 0.7 });
          spawned.push(child.id);
        }
      }
    }

    return {
      activeFires: [...this.fires.values()].filter((f) => f.active).length,
      spawnedCount: spawned.length,
      spawned,
    };
  }
}
