// ============================================================
//  Живность: кабаны, крабы, чайки и змеи.
//  У каждого зверя свой нрав: кабан бросается, краб убегает,
//  чайка летает над берегом, змея ждёт в траве и кусает.
// ============================================================

import * as THREE from 'three';
import { makeRng, clamp } from './noise.js';
import { makeBoar, makeCrab, makeGull, makeSnake } from './models.js';

const TYPES = {
  boar: {
    model: makeBoar, hp: 34, radius: 0.75, speed: 1.3, chaseSpeed: 4.4,
    aggro: 8.5, damage: 9, biteCooldown: 1.6, fleeBelow: 0.35,
    label: 'Кабан', sound: 'grunt',
    drops: [{ id: 'rawMeat', min: 1, max: 3 }, { id: 'hide', min: 0, max: 2 }],
    count: 6, biomes: 'land',
  },
  crab: {
    model: makeCrab, hp: 9, radius: 0.4, speed: 0.9, chaseSpeed: 2.4,
    aggro: 0, damage: 0, biteCooldown: 2, fleeBelow: 1,
    label: 'Краб', sound: 'crab',
    drops: [{ id: 'rawMeat', min: 1, max: 1 }, { id: 'hide', min: 0, max: 1 }],
    count: 7, biomes: 'beach',
  },
  gull: {
    model: makeGull, hp: 6, radius: 0.4, speed: 3.2, chaseSpeed: 3.2,
    aggro: 0, damage: 0, biteCooldown: 2, fleeBelow: 1,
    label: 'Чайка', sound: 'gull', flying: true,
    drops: [{ id: 'feather', min: 1, max: 2 }],
    count: 5, biomes: 'beach',
  },
  snake: {
    model: makeSnake, hp: 8, radius: 0.35, speed: 0.55, chaseSpeed: 2.6,
    aggro: 2.6, damage: 6, biteCooldown: 2.2, fleeBelow: 1,
    label: 'Змея', sound: 'hiss',
    drops: [{ id: 'hide', min: 1, max: 1 }, { id: 'rawMeat', min: 0, max: 1 }],
    count: 4, biomes: 'land',
  },
};

export class Mobs {
  constructor(scene, world, seed = 1) {
    this.scene = scene;
    this.world = world;
    this.rng = makeRng(seed + 4242);
    this.list = [];
    this.time = 0;
    this.group = new THREE.Group();
    this.group.name = 'mobs';
    scene.add(this.group);

    for (const [type, def] of Object.entries(TYPES)) {
      for (let i = 0; i < def.count; i++) this.spawn(type);
    }
  }

  /** Найти пологое место нужного биома под зверя */
  _spot(kind) {
    const world = this.world;
    const rng = this.rng;
    for (let attempt = 0; attempt < 400; attempt++) {
      const a = rng() * Math.PI * 2;
      const r = Math.sqrt(rng()) * (kind === 'beach' ? 120 : 95);
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      const h = world.heightAt(x, z);
      if (world.slopeAt(x, z) > 0.6) continue;
      if (kind === 'beach' && (h < 0.6 || h > 2.4)) continue;
      if (kind === 'land' && (h < 1.6 || h > 14)) continue;
      return { x, z, h };
    }
    return { x: 20, z: 20, h: world.heightAt(20, 20) };
  }

  spawn(type) {
    const def = TYPES[type];
    const spot = this._spot(def.biomes);
    const built = def.model();
    const mob = {
      type,
      def,
      group: built.group,
      parts: built.parts,
      x: spot.x,
      z: spot.z,
      y: spot.h,
      home: { x: spot.x, z: spot.z },
      hp: def.hp,
      maxHp: def.hp,
      facing: this.rng() * Math.PI * 2,
      state: 'wander',
      timer: this.rng() * 2,
      targetX: spot.x,
      targetZ: spot.z,
      biteTimer: 0,
      phase: this.rng() * Math.PI * 2,
      alive: true,
      deadTimer: 0,
      flyY: def.flying ? 4 + this.rng() * 5 : 0,
      respawnAt: 0,
    };
    this.group.add(mob.group);
    this.list.push(mob);
    return mob;
  }

  _respawn(mob) {
    const spot = this._spot(mob.def.biomes);
    mob.x = spot.x;
    mob.z = spot.z;
    mob.y = spot.h;
    mob.home = { x: spot.x, z: spot.z };
    mob.hp = mob.maxHp;
    mob.alive = true;
    mob.state = 'wander';
    mob.deadTimer = 0;
    mob.group.visible = true;
    mob.group.rotation.set(0, 0, 0);
    mob.group.traverse((o) => {
      if (o.isMesh) o.material.opacity = 1;
    });
  }

  /** Ближайший живой зверь в радиусе (для подсказки и удара) */
  nearest(pos, range) {
    let best = null;
    let bestD = range * range;
    for (const mob of this.list) {
      if (!mob.alive) continue;
      const d = (mob.x - pos.x) ** 2 + (mob.z - pos.z) ** 2;
      if (d < bestD) {
        bestD = d;
        best = mob;
      }
    }
    return best;
  }

  /**
   * Удар по зверю: ищем ближайшего в направлении взгляда.
   * Возвращает { mob, killed } или null.
   */
  hit(origin, dirX, dirZ, range, damage) {
    const dl = Math.hypot(dirX, dirZ) || 1;
    dirX /= dl;
    dirZ /= dl;
    let best = null;
    let bestD = Infinity;
    for (const mob of this.list) {
      if (!mob.alive) continue;
      const dx = mob.x - origin.x;
      const dz = mob.z - origin.z;
      const d = Math.hypot(dx, dz);
      if (d > range + mob.def.radius) continue;
      const dot = d > 0.001 ? (dx / d) * dirX + (dz / d) * dirZ : 1;
      if (dot < 0.35) continue;
      if (d < bestD) {
        bestD = d;
        best = mob;
      }
    }
    if (!best) return null;

    best.hp -= damage;
    best.state = 'hurt';
    best.timer = 0.35;
    if (best.hp <= 0) {
      this.kill(best);
      return { mob: best, killed: true };
    }
    return { mob: best, killed: false };
  }

  kill(mob) {
    mob.alive = false;
    mob.deadTimer = 0;
    mob.respawnAt = this.time + 45 + this.rng() * 45;
    mob.state = 'dead';
  }

  /** Один кадр: ИИ, анимация, урон игроку */
  update(dt, player, ctx) {
    this.time += dt;
    const px = player.position.x;
    const pz = player.position.z;

    for (const mob of this.list) {
      if (!mob.alive) {
        // падение и исчезновение
        mob.deadTimer += dt;
        mob.group.rotation.z = Math.min(1.5, mob.group.rotation.z + dt * 4);
        if (mob.deadTimer > 1.4) {
          mob.group.traverse((o) => {
            if (o.isMesh && o.material.transparent !== undefined) {
              o.material.transparent = true;
              o.material.opacity = Math.max(0, 1 - (mob.deadTimer - 1.4) / 0.8);
            }
          });
          if (mob.deadTimer > 2.4) mob.group.visible = false;
        }
        if (this.time > mob.respawnAt) this._respawn(mob);
        continue;
      }

      const dx = px - mob.x;
      const dz = pz - mob.z;
      const dist = Math.hypot(dx, dz);
      const def = mob.def;

      // далёких зверей не рисуем и не считаем — но они «живут»
      if (dist > 85) {
        mob.group.visible = false;
        mob.timer -= dt;
        if (mob.timer <= 0) {
          mob.timer = 3 + this.rng() * 4;
          mob.targetX = mob.home.x + (this.rng() - 0.5) * 14;
          mob.targetZ = mob.home.z + (this.rng() - 0.5) * 14;
        }
        mob.x += clamp(mob.targetX - mob.x, -0.4, 0.4) * dt;
        mob.z += clamp(mob.targetZ - mob.z, -0.4, 0.4) * dt;
        continue;
      }
      mob.group.visible = true;

      // --- состояние ---
      mob.biteTimer = Math.max(0, mob.biteTimer - dt);
      if (mob.state === 'hurt') {
        mob.timer -= dt;
        if (mob.timer <= 0) mob.state = def.aggro > 0 ? 'chase' : 'flee';
      } else if (mob.timer > 0) {
        mob.timer -= dt;
      } else if (mob.state === 'wander') {
        if (dist < def.aggro && def.aggro > 0) {
          mob.state = 'chase';
          this._sound(ctx, def.sound);
        } else if (dist < 5 && def.aggro === 0) {
          mob.state = 'flee';
          mob.timer = 1.6;
        } else if (Math.hypot(mob.x - mob.targetX, mob.z - mob.targetZ) < 1.2) {
          mob.targetX = mob.home.x + (this.rng() - 0.5) * 16;
          mob.targetZ = mob.home.z + (this.rng() - 0.5) * 16;
          mob.timer = 2 + this.rng() * 3;
        }
      } else if (mob.state === 'chase') {
        if (dist > def.aggro + 6 || mob.hp < mob.maxHp * def.fleeBelow) {
          mob.state = def.hp < mob.maxHp * def.fleeBelow ? 'flee' : 'wander';
          mob.timer = 2;
        }
      } else if (mob.state === 'flee') {
        if (dist > 12) {
          mob.state = 'wander';
          mob.timer = 1;
        }
      }

      // --- движение ---
      let speed = 0;
      let aimX = mob.targetX;
      let aimZ = mob.targetZ;
      if (mob.state === 'chase') {
        aimX = px;
        aimZ = pz;
        speed = def.chaseSpeed;
      } else if (mob.state === 'flee') {
        aimX = mob.x - dx;
        aimZ = mob.z - dz;
        speed = def.chaseSpeed;
      } else if (mob.state !== 'hurt') {
        speed = def.speed;
      }

      if (speed > 0) {
        let ax = aimX - mob.x;
        let az = aimZ - mob.z;
        const al = Math.hypot(ax, az) || 1;
        ax /= al;
        az /= al;
        // не заходим в глубокую воду
        const nx = mob.x + ax * speed * dt;
        const nz = mob.z + az * speed * dt;
        if (this.world.heightAt(nx, nz) > 0.35) {
          mob.x = nx;
          mob.z = nz;
        } else {
          mob.targetX = mob.home.x;
          mob.targetZ = mob.home.z;
          mob.state = 'wander';
          mob.timer = 2;
        }
        const want = Math.atan2(ax, az);
        let diff = want - mob.facing;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        mob.facing += diff * clamp(dt * 6, 0, 1);
      }

      // --- атака ---
      if (mob.state === 'chase' && def.damage > 0 && dist < def.radius + 1.1 && mob.biteTimer <= 0) {
        mob.biteTimer = def.biteCooldown;
        ctx.onHit(def.damage, mob.type === 'snake' ? 'укус змеи' : 'кабан');
        this._sound(ctx, def.sound);
      }

      // --- посадка на землю и поворот ---
      const groundY = this.world.heightAt(mob.x, mob.z);
      mob.y = groundY;
      mob.phase += dt * (2.5 + speed * 1.6);

      const bob = def.flying ? 0 : Math.abs(Math.sin(mob.phase)) * 0.05 * Math.min(1, speed);
      mob.group.position.set(mob.x, groundY + bob + (def.flying ? mob.flyY + Math.sin(mob.phase * 0.4) * 0.8 : 0), mob.z);
      mob.group.rotation.y = mob.facing;

      this._animate(mob, dt, speed, def);
    }
  }

  _sound(ctx, name) {
    if (!ctx.audio) return;
    const fn = ctx.audio[name];
    if (typeof fn === 'function') fn.call(ctx.audio);
  }

  /** Анимация лап, крыльев и хвоста */
  _animate(mob, dt, speed, def) {
    const p = mob.parts;
    const walk = Math.min(1, speed / 2);
    const t = mob.phase;

    if (p.legs) {
      p.legs.forEach((leg, i) => {
        leg.rotation.x = Math.sin(t + (i % 2 ? Math.PI : 0) + Math.floor(i / 2) * 0.6) * 0.55 * walk;
      });
    }
    if (p.tail) {
      p.tail.rotation.z = 0.5 + Math.sin(t * 1.4) * 0.22;
      p.tail.rotation.y = Math.sin(t * 0.9) * 0.2;
    }
    if (p.head) {
      p.head.position.y = (p.head.userData.baseY ?? (p.head.userData.baseY = p.head.position.y))
        + Math.sin(t * 1.6) * 0.03;
    }
    if (p.claws) {
      p.claws.forEach((claw, i) => {
        claw.rotation.y = Math.sin(t * 3 + i) * 0.35;
      });
    }
    if (p.wings) {
      const flap = def.flying ? Math.sin(t * 3.4) * 0.7 : Math.sin(t * 1.2) * 0.12;
      p.wings.forEach((wing, i) => {
        wing.rotation.x = flap * (i === 0 ? 1 : -1);
      });
    }
    if (p.segments) {
      p.segments.forEach((seg, i) => {
        seg.position.z = Math.sin(t * 2.2 - i * 0.9) * 0.16;
        seg.rotation.y = Math.sin(t * 2.2 - i * 0.9) * 0.3;
      });
    }
    if (p.tongue) {
      const flick = Math.sin(mob.phase * 4) > 0.85 ? 1 : 0.2;
      p.tongue.scale.x = flick;
    }
  }

  /** Сколько зверей рядом — для диагностики и подсказок */
  countNear(pos, range) {
    return this.list.filter((m) => m.alive && Math.hypot(m.x - pos.x, m.z - pos.z) < range).length;
  }
}
