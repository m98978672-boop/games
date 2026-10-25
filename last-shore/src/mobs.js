// ============================================================
//  Живность: кабаны, крабы, чайки и змеи.
//
//  У каждого зверя свой нрав и конечный автомат поведения:
//    idle → graze/patrol → alert → chase → attack → retreat/flee → sleep
//  Решение зависит от дистанции, линии видимости (дерево/камень/куст
//  закрывают обзор), шума игрока и здоровья зверя.
//  Мобы — препятствия: сквозь них нельзя пройти, и они не слипаются.
// ============================================================

import * as THREE from 'three';
import { makeRng, clamp } from './noise.js';
import { makeBoar, makeCrab, makeGull, makeSnake } from './models.js';

const TYPES = {
  boar: {
    model: makeBoar, hp: 34,
    radius: 0.7,                 // радиус столкновения
    hitbox: { w: 1.9, h: 1.4, d: 1.0 },
    speed: 1.25, chaseSpeed: 4.5,
    detect: 9.5,                 // радиус обнаружения
    hearMul: 1.7,                // во сколько раз дальше слышит бегущего
    attackRange: 2.0,
    damage: 9, biteCooldown: 1.8,
    fleeBelow: 0.34,             // доля здоровья, при которой убегает
    territory: 16,               // не отходит от дома дальше
    temperament: 'territorial',
    label: 'Кабан',
    drops: [{ id: 'rawMeat', min: 1, max: 3 }, { id: 'hide', min: 0, max: 2 }],
    count: 6, biomes: 'land',
  },
  crab: {
    model: makeCrab, hp: 9,
    radius: 0.42,
    hitbox: { w: 0.95, h: 0.7, d: 0.95 },
    speed: 0.85, chaseSpeed: 2.6,
    detect: 6, hearMul: 1.4, attackRange: 0,
    damage: 0, biteCooldown: 2,
    fleeBelow: 1, territory: 10,
    temperament: 'skittish',
    label: 'Краб',
    drops: [{ id: 'rawMeat', min: 1, max: 1 }, { id: 'hide', min: 0, max: 1 }],
    count: 7, biomes: 'beach',
  },
  gull: {
    model: makeGull, hp: 6,
    radius: 0.4,
    hitbox: { w: 1.0, h: 0.5, d: 1.4 },
    speed: 3.2, chaseSpeed: 3.4,
    detect: 14, hearMul: 1.2, attackRange: 0,
    damage: 0, biteCooldown: 2,
    fleeBelow: 1, territory: 26,
    temperament: 'skittish', flying: true,
    label: 'Чайка',
    drops: [{ id: 'feather', min: 1, max: 2 }],
    count: 5, biomes: 'beach',
  },
  snake: {
    model: makeSnake, hp: 8,
    radius: 0.34,
    hitbox: { w: 1.5, h: 0.35, d: 0.45 },
    speed: 0.5, chaseSpeed: 3.0,
    detect: 3.2, hearMul: 2.2, attackRange: 1.3,
    damage: 6, biteCooldown: 2.4,
    fleeBelow: 0.5, territory: 6,
    temperament: 'ambusher',
    label: 'Змея',
    drops: [{ id: 'hide', min: 1, max: 1 }, { id: 'rawMeat', min: 0, max: 1 }],
    count: 4, biomes: 'land',
  },
};

const SOUND_BY_STATE = {
  alert: { boar: 'grunt', snake: 'hiss', crab: 'crab', gull: 'gull' },
  attack: { boar: 'grunt', snake: 'hiss' },
  hurt: { boar: 'grunt', snake: 'hiss', crab: 'crab', gull: 'gull' },
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

    this._hitMat = new THREE.LineBasicMaterial({
      color: 0x6dff9a,
      transparent: true,
      opacity: 0.95,
      depthTest: false,     // рисуем поверх любых моделей
      depthWrite: false,
      toneMapped: false,
    });
    this.showHitboxes = false;

    for (const [type, def] of Object.entries(TYPES)) {
      for (let i = 0; i < def.count; i++) this.spawn(type);
    }
  }

  // ------------------------------------------------------------
  //  Появление
  // ------------------------------------------------------------

  /** Найти пологое место нужного биома, не рядом с игроком и другими зверями */
  _spot(kind, near = null, minDist = 0) {
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
      if (near && minDist > 0 && Math.hypot(x - near.x, z - near.z) < minDist) continue;
      // не появляться вплотную к другому зверю
      if (this.list.some((m) => m.alive && Math.hypot(m.x - x, m.z - z) < 4)) continue;
      return { x, z, h };
    }
    return { x: 20, z: 20, h: world.heightAt(20, 20) };
  }

  spawn(type) {
    const def = TYPES[type];
    const spot = this._spot(def.biomes);
    const built = def.model();

    const hitbox = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(def.hitbox.w, def.hitbox.h, def.hitbox.d)),
      this._hitMat
    );
    hitbox.position.y = def.hitbox.h / 2;
    hitbox.visible = false;
    hitbox.renderOrder = 9999;      // последним — значит поверх всех
    hitbox.frustumCulled = false;
    hitbox.name = 'hitbox';
    built.group.add(hitbox);

    const mob = {
      type,
      def,
      group: built.group,
      parts: built.parts,
      hitbox,
      x: spot.x,
      z: spot.z,
      y: spot.h,
      home: { x: spot.x, z: spot.z },
      hp: def.hp,
      maxHp: def.hp,
      facing: this.rng() * Math.PI * 2,
      state: 'idle',
      stateTime: 0,
      think: this.rng() * 0.5,
      biteTimer: 0,
      phase: this.rng() * Math.PI * 2,
      stepTimer: 0,
      alive: true,
      deadTimer: 0,
      flyY: def.flying ? 4 + this.rng() * 5 : 0,
      respawnAt: 0,
      alerted: false,
      targetX: spot.x,
      targetZ: spot.z,
      speedNow: 0,
      lastSeen: 0,
      restTimer: 0,
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
    mob.state = 'idle';
    mob.stateTime = 0;
    mob.deadTimer = 0;
    mob.alerted = false;
    mob.group.visible = true;
    mob.group.rotation.set(0, 0, 0);
    mob.group.traverse((o) => {
      if (o.isMesh && o.material) {
        o.material.transparent = false;
        o.material.opacity = 1;
      }
    });
  }

  // ------------------------------------------------------------
  //  Взаимодействие
  // ------------------------------------------------------------

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

  /** Удар по зверю в секторе перед игроком. Возвращает { mob, killed } */
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
    // зверь замечает обидчика даже со спины
    best.lastSeen = this.time;
    if (best.hp <= 0) {
      this.kill(best);
      return { mob: best, killed: true };
    }
    const ratio = best.hp / best.maxHp;
    if (ratio <= best.def.fleeBelow) {
      this.setState(best, 'retreat');
    } else {
      this.setState(best, best.def.damage > 0 ? 'chase' : 'flee');
    }
    return { mob: best, killed: false };
  }

  kill(mob) {
    mob.alive = false;
    mob.deadTimer = 0;
    mob.respawnAt = this.time + 45 + this.rng() * 45;
    mob.state = 'dead';
    if (mob.hitbox) mob.hitbox.visible = false;
  }

  // ------------------------------------------------------------
  //  Столкновения
  // ------------------------------------------------------------

  /** Игрок не проходит сквозь зверей: мягко выталкиваем его из их радиусов */
  resolvePlayer(playerPos, velocity = null, playerRadius = 0.35) {
    for (const mob of this.list) {
      if (!mob.alive || mob.def.flying) continue;
      const dx = playerPos.x - mob.x;
      const dz = playerPos.z - mob.z;
      const min = mob.def.radius + playerRadius;
      const d2 = dx * dx + dz * dz;
      if (d2 >= min * min) continue;

      // игрок ровно в центре зверя — выталкиваем в произвольную сторону
      let d = Math.sqrt(d2);
      let nx = 1;
      let nz = 0;
      if (d > 0.0001) {
        nx = dx / d;
        nz = dz / d;
      } else {
        d = 0.0001;
        nx = Math.cos(mob.facing);
        nz = Math.sin(mob.facing);
      }
      const push = min - d;
      playerPos.x += nx * push;
      playerPos.z += nz * push;
      if (velocity) {
        const into = velocity.x * nx + velocity.z * nz;
        if (into < 0) {
          velocity.x -= nx * into;
          velocity.z -= nz * into;
        }
      }
      // зверь тоже сдвигается — чтобы не «вдавливать» его в игрока
      mob.x -= nx * push * 0.25;
      mob.z -= nz * push * 0.25;
    }
  }

  /** Звери не слипаются: расталкиваем их между собой (два прохода — стабильнее) */
  _separate() {
    this._separateOnce();
    this._separateOnce();
  }

  _separateOnce() {
    const list = this.list;
    for (let i = 0; i < list.length; i++) {
      const a = list[i];
      if (!a.alive) continue;
      for (let j = i + 1; j < list.length; j++) {
        const b = list[j];
        if (!b.alive) continue;
        if (a.def.flying !== b.def.flying) continue;
        const dx = a.x - b.x;
        const dz = a.z - b.z;
        const min = a.def.radius + b.def.radius + 0.15;
        const d2 = dx * dx + dz * dz;
        if (d2 >= min * min) continue;

        let d = Math.sqrt(d2);
        let nx;
        let nz;
        if (d < 0.02) {
          // оказались ровно в одной точке — расталкиваем по кругу
          const ang = (i * 2.399) + a.phase;
          nx = Math.cos(ang);
          nz = Math.sin(ang);
          d = 0.02;
        } else {
          nx = dx / d;
          nz = dz / d;
        }
        const push = (min - d) * 0.5;
        a.x += nx * push;
        a.z += nz * push;
        b.x -= nx * push;
        b.z -= nz * push;
      }
    }
  }

  // ------------------------------------------------------------
  //  Восприятие
  // ------------------------------------------------------------

  /** Линия видимости: строго по прямой между зверем и игроком не должно быть стволов/камней */
  _hasLineOfSight(mob, target) {
    const camHeight = target.eyeY ?? 1.4;
    const from = { x: mob.x, y: this.world.heightAt(mob.x, mob.z) + 0.7, z: mob.z };
    const to = { x: target.x, y: camHeight, z: target.z };
    for (const c of this.world.colliders) {
      if (c.disabled) continue;
      if (c.r < 0.3) continue;
      if (this._segmentHitsCircle(from, to, c, c.r * 0.85)) return false;
    }
    return true;
  }

  _segmentHitsCircle(a, b, c, r) {
    const dx = b.x - a.x;
    const dz = b.z - a.z;
    const len2 = dx * dx + dz * dz || 1e-6;
    let t = ((c.x - a.x) * dx + (c.z - a.z) * dz) / len2;
    t = Math.max(0, Math.min(1, t));
    const px = a.x + dx * t;
    const pz = a.z + dz * t;
    const d2 = (px - c.x) ** 2 + (pz - c.z) ** 2;
    return d2 < r * r;
  }

  /** Замечает ли зверь игрока: дистанция + шум + обзор */
  _detects(mob, dist, noise, target) {
    const def = mob.def;
    let range = def.detect;

    // бег и драка громче — слышно дальше
    range *= 1 + (def.hearMul - 1) * clamp(noise, 0, 1);
    // спящий и пасущийся зверь реагирует позже
    if (mob.state === 'sleep') range *= 0.55;
    if (mob.state === 'graze') range *= 0.85;
    // ночью кабан видит хуже, змея — так же
    if (def.temperament === 'territorial' && this.night > 0.6) range *= 0.7;

    if (dist > range) return false;
    return this._hasLineOfSight(mob, target);
  }

  // ------------------------------------------------------------
  //  Состояния
  // ------------------------------------------------------------

  setState(mob, state) {
    if (mob.state === state) return;
    mob.state = state;
    mob.stateTime = 0;

    switch (state) {
      case 'idle':
        mob.think = 0.8 + this.rng() * 1.6;
        break;
      case 'graze':
        mob.think = 1.4 + this.rng() * 2.2;
        break;
      case 'patrol':
        this._pickPatrolPoint(mob);
        mob.think = 3 + this.rng() * 3;
        break;
      case 'alert':
        mob.think = 0.7 + this.rng() * 0.6;
        break;
      case 'chase':
        mob.think = 0.3;
        break;
      case 'attack':
        mob.think = 0.45;
        break;
      case 'retreat':
        mob.think = 2.5 + this.rng() * 1.5;
        break;
      case 'flee':
        mob.think = 1.4 + this.rng();
        break;
      case 'rest':
        mob.think = 3 + this.rng() * 3;
        break;
      case 'sleep':
        mob.think = 6 + this.rng() * 6;
        break;
      default:
        mob.think = 1;
    }
  }

  _pickPatrolPoint(mob) {
    const t = mob.def.territory;
    for (let i = 0; i < 8; i++) {
      const a = this.rng() * Math.PI * 2;
      const r = this.rng() * t * 0.8;
      const x = mob.home.x + Math.cos(a) * r;
      const z = mob.home.z + Math.sin(a) * r;
      if (this.world.heightAt(x, z) > 0.45) {
        mob.targetX = x;
        mob.targetZ = z;
        return;
      }
    }
    mob.targetX = mob.home.x;
    mob.targetZ = mob.home.z;
  }

  // ------------------------------------------------------------
  //  Кадр
  // ------------------------------------------------------------

  /**
   * @param {number} dt
   * @param {object} player — позиция игрока
   * @param {object} ctx — { audio, onHit, culler, camera }
   */
  update(dt, player, ctx) {
    this.time += dt;
    const px = player.position.x;
    const pz = player.position.z;

    // шум игрока: бег слышно дальше, чем шаг
    const speed = Math.hypot(player.velocity?.x || 0, player.velocity?.z || 0);
    const noise = clamp(speed / 6, 0, 1.4);
    this.night = ctx.night ?? 0;

    for (const mob of this.list) {
      if (!mob.alive) {
        this._updateDead(mob, dt);
        continue;
      }

      const dx = px - mob.x;
      const dz = pz - mob.z;
      const dist = Math.hypot(dx, dz);
      const def = mob.def;
      mob.distToPlayer = dist;

      mob.biteTimer = Math.max(0, mob.biteTimer - dt);
      mob.think -= dt;
      mob.stateTime += dt;

      // --- очень далёких зверей не считаем каждый кадр ---
      if (dist > 70) {
        mob.dormant = true;
        if (mob.group.visible) mob.group.visible = false;
        this._dormantStep(mob, dt);
        continue;
      }
      mob.dormant = false;

      // видимость: спрятанных за деревом/камнем не рисуем и не анимируем
      const onScreen = (ctx.culler ? ctx.culler.isVisible(mob.group) : true) || this.showHitboxes;
      if (mob.group.visible !== onScreen) mob.group.visible = onScreen;

      // слышит/видит игрока
      const seesPlayer = this._detects(mob, dist, noise, {
        x: px, z: pz, eyeY: player.position.y + 1.5,
      });
      if (seesPlayer) mob.lastSeen = this.time;

      if (mob.state !== 'sleep' || seesPlayer) this._think(mob, { px, pz, dist, seesPlayer, dt });

      if (mob.wantsSound) {
        this._sound(ctx, mob.wantsSound, mob, 1);
        mob.wantsSound = null;
      }

      // --- движение ---
      this._move(mob, dt, { px, pz, dist });

      // --- атака ---
      if (mob.state === 'attack' && def.damage > 0) {
        if (!mob.didHit && mob.stateTime > 0.18) {
          const reach = def.attackRange + 0.6;
          if (dist < reach && mob.biteTimer <= 0) {
            mob.biteTimer = def.biteCooldown;
            mob.didHit = true;
            ctx.onHit(def.damage, mob.type === 'snake' ? 'укус змеи' : 'клыки кабана');
            this._sound(ctx, 'attack', mob, 1);
          }
        }
      }

      // ставим модель на место всегда — иначе отсечка видимости
      // проверяла бы устаревшую точку и зверь навсегда «застревал» невидимым
      this._place(mob, dt);

      // --- звук шагов зверя ---
      if (!mob.group.visible) continue;
      mob.stepTimer -= dt;
      if (mob.speedNow > 0.4 && mob.stepTimer <= 0) {
        mob.stepTimer = mob.speedNow > 3 ? 0.28 : 0.55;
        if (!def.flying) this._sound(ctx, 'step', mob, 0.5);
      }

      if (mob.group.visible) this._animate(mob, dt);
    }

    this._separate();
  }

  _dormantStep(mob, dt) {
    // далёкая «жизнь»: медленно бродит у дома, без анимаций и звуков
    if (mob.think > 0) return;
    mob.think = 3 + this.rng() * 4;
    const a = this.rng() * Math.PI * 2;
    const r = this.rng() * mob.def.territory * 0.7;
    const tx = mob.home.x + Math.cos(a) * r;
    const tz = mob.home.z + Math.sin(a) * r;
    mob.x += clamp(tx - mob.x, -1, 1) * dt * 0.6;
    mob.z += clamp(tz - mob.z, -1, 1) * dt * 0.6;
  }

  _updateDead(mob, dt) {
    mob.deadTimer += dt;
    mob.group.visible = true;
    mob.group.rotation.z = Math.min(1.5, mob.group.rotation.z + dt * 4);
    if (mob.deadTimer > 1.4) {
      mob.group.traverse((o) => {
        if (o.isMesh && o.material) {
          o.material.transparent = true;
          o.material.opacity = Math.max(0, 1 - (mob.deadTimer - 1.4) / 0.8);
        }
      });
      if (mob.deadTimer > 2.6) mob.group.visible = false;
    }
    if (this.time > mob.respawnAt) this._respawn(mob);
  }

  /** Принятие решения: чистый автомат, без магии чисел по месту */
  _think(mob, { px, pz, dist, seesPlayer }) {
    const def = mob.def;
    const hpRatio = mob.hp / mob.maxHp;
    const distHome = Math.hypot(mob.x - mob.home.x, mob.z - mob.home.z);
    const aggressive = def.damage > 0;

    // раненый и напуганный — отходит
    if (hpRatio <= def.fleeBelow && mob.state !== 'retreat' && mob.state !== 'rest') {
      this.setState(mob, aggressive ? 'retreat' : 'flee');
      return;
    }

    switch (mob.state) {
      case 'sleep':
        if (seesPlayer && dist < def.detect) this.setState(mob, aggressive ? 'alert' : 'flee');
        else if (mob.think <= 0) this.setState(mob, 'idle');
        break;

      case 'idle':
        if (seesPlayer && dist < def.detect * 1.1) {
          this.setState(mob, aggressive ? 'alert' : 'flee');
          mob.wantsSound = 'alert';
        } else if (mob.think <= 0) {
          const roll = this.rng();
          if (def.flying) this.setState(mob, roll < 0.6 ? 'patrol' : 'idle');
          else this.setState(mob, roll < 0.45 ? 'graze' : roll < 0.85 ? 'patrol' : 'idle');
        }
        break;

      case 'graze':
        if (seesPlayer && dist < def.detect) {
          this.setState(mob, aggressive ? 'alert' : 'flee');
        } else if (mob.think <= 0) {
          this.setState(mob, this.rng() < 0.5 ? 'patrol' : 'idle');
        }
        break;

      case 'patrol':
        if (seesPlayer && dist < def.detect * 0.85) {
          this.setState(mob, aggressive ? 'alert' : 'flee');
        } else if (distHome > def.territory) {
          mob.targetX = mob.home.x;
          mob.targetZ = mob.home.z;
          if (mob.think <= 0) this.setState(mob, 'patrol');
        } else if (mob.think <= 0 || Math.hypot(mob.x - mob.targetX, mob.z - mob.targetZ) < 1.3) {
          this.setState(mob, this.rng() < 0.5 ? 'idle' : 'graze');
        }
        break;

      case 'alert':
        // смотрит на игрока и решает: атаковать или отступить
        mob.facing = Math.atan2(px - mob.x, pz - mob.z);
        if (!seesPlayer && dist > def.detect * 0.9) {
          this.setState(mob, 'patrol');
        } else if (mob.think <= 0) {
          if (aggressive && dist < def.detect) this.setState(mob, 'chase');
          else this.setState(mob, 'patrol');
        }
        break;

      case 'chase':
        if (hpRatio <= def.fleeBelow) {
          this.setState(mob, aggressive ? 'retreat' : 'flee');
        } else if (dist > def.detect * 1.9 || this.time - mob.lastSeen > 2.5) {
          this.setState(mob, 'patrol');
        } else if (distHome > def.territory * 1.6) {
          // далеко от дома не гонится — возвращается
          mob.targetX = mob.home.x;
          mob.targetZ = mob.home.z;
          this.setState(mob, 'patrol');
        } else if (dist < def.attackRange) {
          this.setState(mob, 'attack');
          mob.didHit = false;
        } else if (mob.think <= 0) {
          mob.think = 0.3;
        }
        break;

      case 'attack':
        // короткий выпад, потом либо ещё удар, либо добивание
        if (mob.think <= 0) {
          if (dist < def.attackRange + 0.4) {
            mob.didHit = false;
            this.setState(mob, 'attack');
          } else {
            this.setState(mob, 'chase');
          }
        }
        break;

      case 'retreat':
        if (mob.think <= 0 && dist > def.detect) this.setState(mob, 'rest');
        else if (mob.think <= 0 && hpRatio > def.fleeBelow + 0.25) this.setState(mob, 'chase');
        break;

      case 'rest':
        if (mob.think <= 0) {
          if (hpRatio > 0.6) this.setState(mob, 'patrol');
          else this.setState(mob, 'idle');
        }
        break;

      case 'flee':
        if (dist > def.detect * 1.6) this.setState(mob, 'idle');
        else if (mob.think <= 0) this.setState(mob, 'flee');
        break;

      default:
        this.setState(mob, 'idle');
    }
  }

  _move(mob, dt, { px, pz, dist }) {
    const def = mob.def;
    let speed = 0;
    let aimX = mob.targetX;
    let aimZ = mob.targetZ;

    switch (mob.state) {
      case 'chase':
      case 'attack':
        aimX = px;
        aimZ = pz;
        speed = def.chaseSpeed;
        break;
      case 'retreat':
      case 'flee':
        aimX = mob.x * 2 - px;
        aimZ = mob.z * 2 - pz;
        speed = def.chaseSpeed;
        break;
      case 'patrol':
        speed = def.speed;
        break;
      case 'graze':
        // пасётся почти на месте
        speed = def.speed * 0.35;
        break;
      default:
        speed = 0;
    }

    // в атаке зверь почти не двигается — это выпад
    if (mob.state === 'attack') speed *= 0.25;
    // у самой цели не «вталкиваемся» в игрока
    if (speed > 0 && (mob.state === 'chase' || mob.state === 'attack')) {
      const stop = def.radius + 0.55;
      if (dist < stop) speed = 0;
    }

    mob.speedNow = speed;
    if (speed <= 0) return;

    let ax = aimX - mob.x;
    let az = aimZ - mob.z;
    const len = Math.hypot(ax, az);
    if (len < 0.05) return;
    ax /= len;
    az /= len;

    const step = speed * dt;
    const nx = mob.x + ax * step;
    const nz = mob.z + az * step;

    // в воду не лезем
    if (this.world.heightAt(nx, nz) < 0.45) {
      mob.targetX = mob.home.x;
      mob.targetZ = mob.home.z;
      if (mob.state === 'chase') this.setState(mob, 'patrol');
      return;
    }
    // не проходим сквозь стволы и валуны
    if (!this._blocked(nx, nz, def.radius)) {
      mob.x = nx;
      mob.z = nz;
    } else {
      // обходим препятствие вбок
      const sideX = mob.x - az * step;
      const sideZ = mob.z + ax * step;
      if (!this._blocked(sideX, sideZ, def.radius)) {
        mob.x = sideX;
        mob.z = sideZ;
      }
    }

    const want = Math.atan2(ax, az);
    let diff = want - mob.facing;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    mob.facing += diff * clamp(dt * 7, 0, 1);
  }

  _blocked(x, z, r) {
    for (const c of this.world.colliders) {
      if (c.disabled || c.fire || c.soft) continue;
      if (c.r < 0.3) continue;
      const dx = x - c.x;
      const dz = z - c.z;
      const min = c.r + r * 0.8;
      if (dx * dx + dz * dz < min * min) return true;
    }
    return false;
  }

  _place(mob, dt) {
    const def = mob.def;
    const groundY = this.world.heightAt(mob.x, mob.z);
    mob.y = groundY;
    mob.phase += dt * (2.2 + mob.speedNow * 1.8);

    const bob = def.flying ? 0 : Math.abs(Math.sin(mob.phase)) * 0.05 * Math.min(1, mob.speedNow);
    const fly = def.flying ? mob.flyY + Math.sin(mob.phase * 0.4) * 0.8 : 0;
    mob.group.position.set(mob.x, groundY + bob + fly, mob.z);
    mob.group.rotation.y = mob.facing;
    if (mob.hitbox) mob.hitbox.visible = this.showHitboxes && mob.alive;
  }

  // ------------------------------------------------------------
  //  Звук
  // ------------------------------------------------------------

  _sound(ctx, kind, mob, gain = 1) {
    if (!ctx.audio || !ctx.listener) return;
    const table = kind === 'step' ? null : SOUND_BY_STATE[kind];
    const name = kind === 'step'
      ? (mob.def.flying ? null : 'mobStep')
      : (table ? table[mob.type] : null);
    if (!name) return;
    ctx.audio.playAt?.(name, {
      x: mob.x,
      z: mob.z,
      listener: ctx.listener,
      gain: (kind === 'step' ? 0.35 : 0.8) * gain,
    });
  }

  toggleHitboxes(force) {
    this.showHitboxes = force !== undefined ? force : !this.showHitboxes;
    for (const mob of this.list) {
      if (mob.hitbox) mob.hitbox.visible = this.showHitboxes && mob.alive;
      if (mob.group && this.showHitboxes) mob.group.visible = true;
    }
    return this.showHitboxes;
  }

  /** Сколько зверей рядом — для диагностики и подсказок */
  countNear(pos, range) {
    return this.list.filter((m) => m.alive && Math.hypot(m.x - pos.x, m.z - pos.z) < range).length;
  }

  // ------------------------------------------------------------
  //  Анимация (только для видимых)
  // ------------------------------------------------------------

  _animate(mob, dt) {
    const p = mob.parts;
    const def = mob.def;
    const walk = Math.min(1, mob.speedNow / 2);
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
      const base = p.head.userData.baseY ?? (p.head.userData.baseY = p.head.position.y);
      // пасётся — голова вниз, атакует — вперёд
      const grazeDrop = mob.state === 'graze' ? -0.28 : 0;
      const lunge = mob.state === 'attack' ? 0.16 : 0;
      p.head.position.y = base + grazeDrop + lunge * Math.sin(mob.stateTime * 12);
      p.head.rotation.x = mob.state === 'graze' ? 0.5 : (mob.state === 'alert' ? -0.15 : 0);
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
}

export { TYPES as MOB_TYPES };
