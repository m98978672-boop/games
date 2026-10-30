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
import { makeBoar, makeCrab, makeGull, makeSnake, makeMonkey, makeTurtle, makeFish, makeRabbit, makeLizard } from './models.js';
import { CONFIG } from './config.js';
import { ColliderIndex } from './collider-index.js';

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
  monkey: {
    model: makeMonkey, hp: 15,
    radius: 0.4,
    hitbox: { w: 0.6, h: 1.4, d: 0.6 },
    speed: 1.35, chaseSpeed: 4.4,
    detect: 12, hearMul: 1.5, attackRange: 0,
    damage: 0, biteCooldown: 2,
    fleeBelow: 1, territory: 22,
    temperament: 'skittish',
    label: 'Обезьяна',
    drops: [{ id: 'fiber', min: 1, max: 3 }, { id: 'berries', min: 0, max: 2 }],
    count: 7, biomes: 'land',
  },
  turtle: {
    model: makeTurtle, hp: 26,
    radius: 0.55,
    hitbox: { w: 1.0, h: 0.6, d: 0.85 },
    speed: 0.42, chaseSpeed: 0.6,
    detect: 5, hearMul: 1.1, attackRange: 0,
    damage: 0, biteCooldown: 3,
    fleeBelow: 1, territory: 7,
    temperament: 'skittish',
    label: 'Черепаха',
    drops: [{ id: 'hide', min: 1, max: 2 }, { id: 'rawMeat', min: 1, max: 1 }],
    count: 6, biomes: 'beach',
  },
  fish: {
    model: makeFish, hp: 4,
    radius: 0.3,
    hitbox: { w: 0.95, h: 0.45, d: 0.45 },
    speed: 1.3, chaseSpeed: 2.6,
    detect: 7, hearMul: 1.2, attackRange: 0,
    damage: 0, biteCooldown: 3,
    fleeBelow: 1, territory: 12,
    temperament: 'skittish', swim: true,
    label: 'Рыба',
    drops: [{ id: 'rawMeat', min: 1, max: 1 }],
    count: 18, biomes: 'water',
  },
  rabbit: {
    model: makeRabbit, hp: 8, radius: 0.32,
    hitbox: { w: 0.8, h: 0.8, d: 0.5 },
    speed: 1.3, chaseSpeed: 4.2, detect: 9, hearMul: 1.5,
    attackRange: 0, damage: 0, biteCooldown: 2, fleeBelow: 1,
    territory: 13, temperament: 'skittish', label: 'Кролик',
    drops: [{ id: 'rawMeat', min: 1, max: 1 }, { id: 'hide', min: 0, max: 1 }],
    count: 5, biomes: 'land',
  },
  lizard: {
    model: makeLizard, hp: 5, radius: 0.26,
    hitbox: { w: 1.1, h: 0.4, d: 0.45 },
    speed: 0.85, chaseSpeed: 3.4, detect: 7, hearMul: 1.4,
    attackRange: 0, damage: 0, biteCooldown: 2, fleeBelow: 1,
    territory: 9, temperament: 'skittish', label: 'Ящерица',
    drops: [{ id: 'rawMeat', min: 0, max: 1 }],
    count: 5, biomes: 'land',
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

// у каждого вида должен быть свой type: на него завязаны анимации (краб, чайка,
// черепаха, рыба) — без него все ветки молчали и звери двигались «общей» походкой
for (const [key, def] of Object.entries(TYPES)) {
  if (!def.type) def.type = key;
}

const SOUND_BY_STATE = {
  // спокойные звуки: кабан похрюкивает, змея шипит, краб щёлкает, чайка кричит
  idle: { boar: 'grunt', snake: 'hiss', crab: 'crab', gull: 'gull', monkey: 'monkey', fish: 'bubble', turtle: 'grunt', rabbit: 'rustle', lizard: 'rustle' },
  alert: { boar: 'grunt', snake: 'hiss', crab: 'crab', gull: 'gull', monkey: 'monkey', fish: 'bubble' },
  attack: { boar: 'grunt', snake: 'hiss' },
  hurt: { boar: 'grunt', snake: 'hiss', crab: 'crab', gull: 'gull', monkey: 'monkey' },
  step: { crab: 'crab' },
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
  _spot(kind, near = null, minDist = 0, def = null) {
    const world = this.world;
    const rng = this.rng;
    // радиус «габарита» зверя: половина диагонали модели, модель крутится как угодно
    const bodyR = (def && def.hitbox
      ? Math.hypot(def.hitbox.w, def.hitbox.d) * 0.5
      : 0.8 * 0.5) + 0.05;

    const fits = (x, z) => {
      const h = world.heightAt(x, z);
      if (world.slopeAt(x, z) > 0.6) return null;
      if (kind === 'beach' && (h < 0.6 || h > 2.4)) return null;
      if (kind === 'land' && (h < 1.6 || h > 14)) return null;
      // рыба живёт только там, где действительно глубоко
      if (kind === 'water' && (h > -0.9 || h < -7)) return null;
      // не над выкопанной пустотой: зверь повис бы в воздухе над ямой
      if (world.probeAt && world.probeAt(x, z).layer === 'void') return null;
      if (near && minDist > 0 && Math.hypot(x - near.x, z - near.z) < minDist) return null;
      // не появляться вплотную к другому зверю
      if (this.list.some((m) => m.alive && Math.hypot(m.x - x, m.z - z) < 4)) return null;
      // и не рождаться внутри чужой модели: кусты, валуны, стволы — всё занято
      if (this._blocked(x, z, bodyR, true)) return null;
      if (world.isFree && !world.isFree(x, z, bodyR, 0.05)) return null;
      // земля под зверем должна быть ровной: перепад по габариту не больше 0.45 м
      const hh = [world.heightAt(x + bodyR, z), world.heightAt(x - bodyR, z),
        world.heightAt(x, z + bodyR), world.heightAt(x, z - bodyR)];
      if (Math.max(...hh.map((v) => Math.abs(v - h))) > 0.45) return null;
      return h;
    };

    for (let attempt = 0; attempt < 1200; attempt++) {
      const a = rng() * Math.PI * 2;
      const r = Math.sqrt(rng()) * (kind === 'beach' ? 120 : 95);
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      const h = fits(x, z);
      if (h !== null) return { x, z, h };
    }

    // запасной путь: сетка по всему острову — хоть где-то да свободно
    for (let ring = 0; ring < 24; ring++) {
      const rad = 8 + ring * 4.5;
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2 + ring * 0.4;
        const x = Math.cos(a) * rad;
        const z = Math.sin(a) * rad;
        const h = fits(x, z);
        if (h !== null) return { x, z, h };
      }
    }
    return { x: 20, z: 20, h: world.heightAt(20, 20) };
  }

  /**
   * Место рядом с домом зверя: вокруг дома нет ни деревьев, ни камней,
   * поэтому зверь не рождается внутри модели и не «застревает» с первого кадра.
   */
  _denSpot(type, def) {
    const dens = (this.world.dens || []).filter((d) => d.kind === type);
    if (!dens.length) return null;
    const busy = (d) => this.list.filter(
      (m) => m.alive && m.den === d
    ).length;
    const order = dens.slice().sort((a, b) => busy(a) - busy(b));
    for (const d of order.slice(0, 4)) {
      for (let i = 0; i < 48; i++) {
        const a = this.rng() * Math.PI * 2;
        const r = Math.sqrt(this.rng()) * d.radius * 0.55;
        const x = d.x + Math.cos(a) * r;
        const z = d.z + Math.sin(a) * r;
        const h = this.world.heightAt(x, z);
        if (def.swim) {
          if (h > -0.9 || h < -7) continue;
        } else if (h < 0.45) continue;
        if (this._blocked(x, z, (def.radius || 0.5) + 0.05, true)) continue;
        return { x, z, h, den: d };
      }
    }
    return null;
  }

  spawn(type) {
    const def = TYPES[type];
    const spot = this._denSpot(type, def) || this._spot(def.biomes, null, 0, def);
    const built = def.model();

    // хитбокс строим по фактическим габаритам модели: коробка всегда
    // обнимает зверя целиком, даже с мордой, клыками и хвостом
    const box = new THREE.Box3().setFromObject(built.group);
    const size = new THREE.Vector3();
    box.getSize(size);
    const hb = { w: Math.max(0.35, size.x), h: Math.max(0.3, size.y), d: Math.max(0.35, size.z) };
    const center = {
      x: (box.min.x + box.max.x) / 2,
      y: (box.min.y + box.max.y) / 2,
      z: (box.min.z + box.max.z) / 2,
    };
    const hitbox = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(hb.w, hb.h, hb.d)),
      this._hitMat
    );
    hitbox.position.set(center.x, center.y, center.z);
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
      hitboxCenter: center,
      x: spot.x,
      z: spot.z,
      y: spot.h,
      den: spot.den || null,
      home: { x: spot.x, z: spot.z },
      hp: def.hp,
      maxHp: def.hp,
      hitboxSize: hb,
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
      soundTimer: 3 + this.rng() * 8,
      alerted: false,
      targetX: spot.x,
      targetZ: spot.z,
      stuckTime: 0,
      speedNow: 0,
      lastSeen: 0,
      restTimer: 0,
    };
    this.group.add(mob.group);
    this.list.push(mob);
    mob.stuckTime = 0;
    // страховка: габарит модели может быть больше прикидки def.hitbox —
    // отодвигаем зверя от ствола/валуна, если он всё же задевает модель
    this._unstick(mob);
    // со спавна зверь не стоит столбом: сразу выбираем свободную точку пути
    this._pickPatrolPoint(mob);
    return mob;
  }

  /**
   * Отодвинуть зверя на свободное место по спирали.
   * Возвращает сдвиг в метрах (0 — место и так свободно, −1 — не нашлось).
   */
  _unstick(mob) {
    const r = Math.hypot(mob.hitboxSize.w, mob.hitboxSize.d) * 0.5 + 0.05;
    const swim = !!mob.def.swim;
    const clear = (x, z) => {
      const h = this.world.heightAt(x, z);
      if (swim ? (h > -0.9 || h < -7) : h < 0.45) return false;
      if (this._blocked(x, z, r, true)) return false;
      if (this.world.isFree && !this.world.isFree(x, z, r, 0.05)) return false;
      return true;
    };
    if (clear(mob.x, mob.z)) return 0;
    for (let ring = 1; ring <= 80; ring++) {
      const rad = ring * 0.5;
      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * Math.PI * 2 + ring * 0.4;
        const x = mob.x + Math.cos(a) * rad;
        const z = mob.z + Math.sin(a) * rad;
        if (!clear(x, z)) continue;
        mob.x = x;
        mob.z = z;
        mob.y = this.world.heightAt(x, z);
        mob.home = { x, z };
        mob.targetX = x;
        mob.targetZ = z;
        return rad;
      }
    }
    return -1;
  }

  _respawn(mob) {
    const spot = this._denSpot(mob.type, mob.def) || this._spot(mob.def.biomes, null, 0, mob.def);
    if (spot.den) mob.den = spot.den;
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
    this._unstick(mob);
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
    return this.hitAt(best, damage);
  }

  /** Удар именно по этому зверю — когда цель взята прицелом, а не сектором */
  hitAt(mob, damage) {
    if (!mob || !mob.alive) return null;
    const best = mob;
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
      if (!mob.alive || mob.def.flying || mob.def.swim) continue;
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
      const mx = mob.x - nx * push * 0.25;
      const mz = mob.z - nz * push * 0.25;
      if (!this._blocked(mx, mz, this._collisionRadius(mob))) { mob.x = mx; mob.z = mz; }
    }
  }

  // Радиус охватывает реальные габариты модели, а не только её туловище.
  _collisionRadius(mob) {
    const hb = mob.hitboxSize;
    return hb ? Math.max(mob.def.radius, Math.hypot(hb.w, hb.d) * 0.5) : mob.def.radius;
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
        const min = this._collisionRadius(a) + this._collisionRadius(b) + 0.05;
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
        const ar = this._collisionRadius(a), br = this._collisionRadius(b);
        if (!this._blocked(a.x + nx * push, a.z + nz * push, ar)) { a.x += nx * push; a.z += nz * push; }
        if (!this._blocked(b.x - nx * push, b.z - nz * push, br)) { b.x -= nx * push; b.z -= nz * push; }
      }
    }
  }

  // ------------------------------------------------------------
  //  Восприятие
  // ------------------------------------------------------------

  // Индекс лишь отбирает кандидатов: точные проверки столкновений остаются прежними.
  _colliderCandidates(minX, minZ, maxX, maxZ) {
    if (!this._colliderIndex) this._colliderIndex = new ColliderIndex(this.world.colliders);
    return this._colliderIndex.query(this.world.colliders, minX, minZ, maxX, maxZ);
  }

  /** Линия видимости: строго по прямой между зверем и игроком не должно быть стволов/камней */
  _hasLineOfSight(mob, target) {
    const camHeight = target.eyeY ?? 1.4;
    const from = { x: mob.x, y: this.world.heightAt(mob.x, mob.z) + 0.7, z: mob.z };
    const to = { x: target.x, y: camHeight, z: target.z };
    const candidates = this._colliderCandidates(
      Math.min(from.x, to.x), Math.min(from.z, to.z),
      Math.max(from.x, to.x), Math.max(from.z, to.z),
    );
    for (const c of candidates) {
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
    const swim = !!mob.def.swim;
    const r = mob.def.radius || 0.45;
    // цель патруля обязана быть проходимой: иначе зверь идёт в ствол,
    // упирается и стоит на месте всё время, пока не сменится состояние
    const hHere = this.world.heightAt(mob.x, mob.z);
    const ok = (x, z) => {
      const h = this.world.heightAt(x, z);
      if (swim) { if (h > -0.9 || h < -7) return false; }
      else if (h < -0.12 && h < hHere - 0.05) return false;   // глубже, чем стоит, — нельзя
      return !this._blocked(x, z, r * 1.1);
    };
    for (let i = 0; i < 14; i++) {
      const a = this.rng() * Math.PI * 2;
      const rad = 0.6 + this.rng() * t * 0.8;
      const x = mob.home.x + Math.cos(a) * rad;
      const z = mob.home.z + Math.sin(a) * rad;
      if (!ok(x, z)) continue;
      mob.targetX = x;
      mob.targetZ = z;
      return;
    }
    // вокруг дома всё занято — цель чуть в стороне от себя, лишь бы идти
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + this.rng();
      const x = mob.x + Math.cos(a) * 1.2;
      const z = mob.z + Math.sin(a) * 1.2;
      if (!ok(x, z)) continue;
      mob.targetX = x;
      mob.targetZ = z;
      return;
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
   * @param {object} ctx — { audio, onHit, camera }
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
        // далеко — не считаем поведение каждый кадр, но модель остаётся в мире
        mob.dormant = true;
        if (!mob.group.visible) mob.group.visible = true;
        this._dormantStep(mob, dt);
        continue;
      }
      mob.dormant = false;
      // ничего не скрываем: модель всегда прогружена, у неё свой хитбокс
      if (!mob.group.visible) mob.group.visible = true;

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
            ctx.onHit(def.damage, mob.type === 'snake' ? 'укус змеи' : 'клыки кабана', mob);
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
        mob.stepTimer = mob.speedNow > 3 ? 0.3 : 0.6;
        if (!def.flying) this._sound(ctx, 'step', mob, mob.type === 'crab' ? 0.35 : 0.5);
      }

      // спокойные звуки зверя: слышно, что лес живой
      mob.soundTimer -= dt;
      if (mob.soundTimer <= 0) {
        mob.soundTimer = 7 + this.rng() * 11;
        const calm = mob.state === 'idle' || mob.state === 'graze' || mob.state === 'patrol' || mob.state === 'rest';
        if (calm && dist < 24 && mob.group.visible) this._sound(ctx, 'idle', mob, 0.45);
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
    const nx = mob.x + clamp(tx - mob.x, -1, 1) * dt * 0.6;
    const nz = mob.z + clamp(tz - mob.z, -1, 1) * dt * 0.6;
    // шаг только по свободному месту: иначе далёкий зверь «залезает» в дерево
    if (!this._blocked(nx, nz, this._collisionRadius(mob))) {
      mob.x = nx;
      mob.z = nz;
    } else {
      mob.think = 0.5 + this.rng();
    }
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
        // дом зверя — его логово: далеко от него не уходит
        if (mob.den) {
          const dHome = Math.hypot(mob.x - mob.den.x, mob.z - mob.den.z);
          if (dHome > mob.den.radius * 0.9) {
            aimX = mob.den.x;
            aimZ = mob.den.z;
          }
        }
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
    let len = Math.hypot(ax, az);
    // цель «в себе» (так бывает сразу после спавна и после пастьбы) —
    // берём ближайшую свободную точку, иначе зверь просто стоит
    if (len < 0.3) {
      this._pickPatrolPoint(mob);
      aimX = mob.targetX;
      aimZ = mob.targetZ;
      ax = aimX - mob.x;
      az = aimZ - mob.z;
      len = Math.hypot(ax, az);
      if (len < 0.3) return;
    }
    ax /= len;
    az /= len;

    const step = speed * dt;
    const nx = mob.x + ax * step;
    const nz = mob.z + az * step;

    // в воду не лезем, а рыба — наоборот, из воды не выходит.
    // Сухопутный зверь всегда может шагнуть на мель и выбраться из воды,
    // но не глубже, чем стоит: иначе он намертво прилипает к кромке.
    const hCur = this.world.heightAt(mob.x, mob.z);
    const tooDeep = (h) => (def.swim ? h > -0.5 : (h < -0.15 && h < hCur - 0.05));
    if (tooDeep(this.world.heightAt(nx, nz))) {
      mob.targetX = mob.home.x;
      mob.targetZ = mob.home.z;
      if (mob.state === 'chase') this.setState(mob, 'patrol');
      return;
    }
    // не проходим сквозь стволы и валуны: пробуем веер направлений —
    // прямо, вбок и наискось, — чтобы зверь обходил ствол, а не упирался в него
    const dirs = [0, 0.6, -0.6, 1.2, -1.2, 1.8, -1.8];
    let moved = false;
    for (const turn of dirs) {
      const ca = Math.cos(turn);
      const sa = Math.sin(turn);
      const dx = ax * ca - az * sa;
      const dz = ax * sa + az * ca;
      const tx = mob.x + dx * step;
      const tz = mob.z + dz * step;
      if (this._blocked(tx, tz, this._collisionRadius(mob))) continue;
      const h = this.world.heightAt(tx, tz);
      if (tooDeep(h)) continue;
      mob.x = tx;
      mob.z = tz;
      moved = true;
      break;
    }
    // детектор застревания: зверь хочет идти, но стоит на месте
    if (moved) {
      mob.stuckTime = 0;
    } else {
      mob.stuckTime = (mob.stuckTime || 0) + dt;
      if (mob.stuckTime > 1.4) {
        mob.stuckTime = 0;
        // разворачиваемся и ищем другую цель; в бою — просто обходим игрока
        if (mob.state === 'chase' || mob.state === 'attack') {
          mob.state = 'patrol';
          this.setState(mob, 'patrol');
        } else {
          mob.facing += Math.PI * (0.5 + this.rng());
          this._pickPatrolPoint(mob);
          this.setState(mob, 'patrol');
        }
      }
    }

    const want = Math.atan2(ax, az);
    let diff = want - mob.facing;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    mob.facing += diff * clamp(dt * 7, 0, 1);
  }

  /**
   * Занято ли место. strict — «не родиться внутри модели»: тогда в проверку
   * идут и кусты (для игрока они мягкие), и мелкие валуны, и полный радиус тела.
   */
  _blocked(x, z, r, strict = false) {
    const pad = strict ? 0 : r * 0.2;   // при спавне зазор 5 см, в движении — можно вплотную
    // обводки моделей: зверь тоже не проходит сквозь оболочку
    if (this.world.shells && this.world.shells.blocked(x, z, r + pad, this.world.heightAt(x, z))) return true;
    const radius = r + pad;
    for (const c of this._colliderCandidates(x - radius, z - radius, x + radius, z + radius)) {
      if (c.disabled || c.fire || c.kind === 'den' || c.meshShell) continue;
      // кусты зверю тоже препятствие (для игрока они мягкие, для зверя — нет)
      if (c.r < 0.3 && !strict) continue;
      const dx = x - c.x;
      const dz = z - c.z;
      const min = c.r + r + pad;
      if (dx * dx + dz * dz < min * min) return true;
    }
    return false;
  }

  _place(mob, dt) {
    const def = mob.def;
    const groundY = this.world.heightAt(mob.x, mob.z);
    mob.y = groundY;
    mob.phase += dt * (2.2 + mob.speedNow * 1.8);

    const bob = def.flying || def.swim ? 0 : Math.abs(Math.sin(mob.phase)) * 0.05 * Math.min(1, mob.speedNow);
    const fly = def.flying ? mob.flyY + Math.sin(mob.phase * 0.4) * 0.8 : 0;
    // рыба идёт под поверхностью: не выше 40 см от воды и не ниже дна
    const swimY = def.swim
      ? Math.min(CONFIG.world.seaLevel - 0.55, groundY + 0.9) + Math.sin(mob.phase * 0.6) * 0.18
      : 0;
    mob.group.position.set(mob.x, def.swim ? swimY : groundY + bob + fly, mob.z);
    // модели зверей собраны вдоль +X, поэтому курс = facing − 90°:
    // без этой поправки кабан, краб и чайка едут боком
    mob.group.rotation.y = mob.facing - Math.PI / 2;
    if (mob.hitbox) mob.hitbox.visible = this.showHitboxes && mob.alive;
  }

  // ------------------------------------------------------------
  //  Звук
  // ------------------------------------------------------------

  _sound(ctx, kind, mob, gain = 1) {
    if (!ctx.audio || !ctx.listener) return;
    let name = null;
    let volume = 0.8;
    if (kind === 'step') {
      // у краба вместо шага — щелчки хитина
      name = mob.def.flying ? null : mob.type === 'crab' ? 'crab' : 'mobStep';
      volume = 0.35;
    } else if (kind === 'idle') {
      const table = SOUND_BY_STATE.idle;
      name = table ? table[mob.type] : null;
      volume = 0.35;
    } else {
      const table = SOUND_BY_STATE[kind];
      name = table ? table[mob.type] : null;
    }
    if (!name) return;
    ctx.audio.playAt?.(name, {
      x: mob.x,
      z: mob.z,
      listener: ctx.listener,
      gain: volume * gain,
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

  /**
   * Анимация зверя. У каждого вида свой характер движения:
   * кабан топает и мотает головой, краб семенит боком и щёлкает клешнями,
   * чайка машет крыльями и планирует, змея идёт волной и высовывает язык.
   */
  _animate(mob, dt) {
    const p = mob.parts;
    const def = mob.def;
    const walk = Math.min(1, mob.speedNow / 2);
    const run = Math.max(0, Math.min(1, (mob.speedNow - 2) / 4));
    const t = mob.phase;
    const state = mob.state;
    const sleeping = state === 'sleep';
    const alert = state === 'alert' || state === 'chase' || state === 'attack';
    const scared = state === 'flee' || state === 'retreat';
    const graze = state === 'graze';

    mob.animTime = (mob.animTime || 0) + dt;

    // --- общее: тело покачивается на шаге и дышит в покое ---
    if (p.body) {
      const base = mob.bodyBaseY ?? (mob.bodyBaseY = p.body.position.y);
      const bounce = def.type === 'crab' ? 0 : Math.abs(Math.sin(t * 1.6)) * 0.05 * (walk + run * 0.7);
      const breathe = Math.sin(mob.animTime * (sleeping ? 1.1 : 2.1)) * (sleeping ? 0.022 : 0.012);
      const fluff = alert ? 0.03 : 0;
      p.body.position.y = base + bounce + breathe + fluff - (sleeping ? 0.09 : 0);
      // при беге тело наклоняется вперёд
      p.body.rotation.z = def.type === 'boar' ? -run * 0.16 : 0;
    }

    // --- лапы/ноги ---
    if (p.legs) {
      if (def.type === 'crab') {
        // краб бежит боком: ноги семенят попарно
        p.legs.forEach((leg, i) => {
          const ph = t * 3.2 + i * 0.8;
          leg.rotation.z = Math.sin(ph) * 0.3 * (0.35 + walk);
          leg.rotation.x = (i < 4 ? 1 : -1) * (0.12 + Math.cos(ph) * 0.12 * walk);
        });
      } else {
        const amp = 0.5 + run * 0.5;
        p.legs.forEach((leg, i) => {
          const ph = t + (i % 2 ? Math.PI : 0) + Math.floor(i / 2) * 0.6;
          leg.rotation.x = Math.sin(ph) * amp * (0.25 + walk);
        });
      }
    }

    if (def.type === 'rabbit' && p.body) {
      p.body.position.y += Math.max(0, Math.sin(t * 2.4)) * 0.16 * walk;
    }
    if (def.type === 'lizard' && p.body) {
      p.body.rotation.y = Math.sin(t * 3) * 0.18 * walk;
    }

    // --- хвост ---
    // у черепахи свой, спокойный хвост (ниже), у чайки — веер на поворотах
    if (p.tail && def.type !== 'gull' && def.type !== 'turtle') {
      const baseZ = p.tail.userData.baseZ ?? (p.tail.userData.baseZ = p.tail.rotation.z);
      const wag = 0.35 + walk * 0.3 + (scared ? 0.4 : 0);
      p.tail.rotation.z = baseZ + Math.sin(t * (1.2 + walk * 2)) * 0.22;
      p.tail.rotation.y = Math.sin(t * (0.9 + walk * 1.6)) * wag;
    }
    if (p.tail && def.type === 'gull') {
      // хвост-веер на поворотах
      p.tail.rotation.y = Math.sin(t * 1.4) * 0.25;
    }

    // --- голова: пасётся, тревожится, бодает ---
    if (p.head) {
      const base = p.head.userData.baseY ?? (p.head.userData.baseY = p.head.position.y);
      const grazeDrop = graze ? -0.26 : 0;
      const lunge = state === 'attack' ? 0.14 : 0;
      const bob = Math.sin(t * 2.2) * 0.02 * walk;
      p.head.position.y = base + grazeDrop + bob + lunge * Math.sin(mob.stateTime * 12);
      let pitch = 0;
      if (graze) pitch = 0.55;
      else if (state === 'alert') pitch = -0.18 + Math.sin(mob.animTime * 4) * 0.05;
      else if (state === 'chase' || state === 'attack') pitch = 0.18;
      else if (sleeping) pitch = 0.5;
      p.head.rotation.x = pitch;
      // озирается, когда спокоен; смотрит вперёд на охоте
      const lookaround = (state === 'idle' || graze) ? Math.sin(mob.animTime * 0.7) * 0.35 : Math.sin(t * 0.8) * 0.06;
      p.head.rotation.y = lookaround;
    }

    // --- клешни краба ---
    if (p.claws) {
      p.claws.forEach((claw, i) => {
        const side = i === 0 ? 1 : -1;
        const raise = alert ? 0.5 : 0;
        claw.rotation.y = Math.sin(t * 2.6 + i * 1.7) * 0.25 * (0.4 + walk);
        claw.rotation.z = side * (raise + Math.sin(mob.animTime * 6 + i) * (alert ? 0.12 : 0.04));
      });
    }

    // --- глаза на стебельках ---
    if (p.eyes) {
      p.eyes.rotation.z = Math.sin(t * 2.2) * 0.06;
      p.eyes.position.y = Math.sin(mob.animTime * 1.8) * 0.012;
    }

    // --- крылья чайки ---
    if (p.wings) {
      const flying = def.flying && mob.y + 0.2 > (mob.flyY ?? 0);
      // частота взмахов растёт с движением, в покое крылья сложены
      const rate = 3.0 + walk * 4.5;
      const amp = def.flying ? (0.25 + walk * 0.6) : 0.1;
      p.wings.forEach((wing, i) => {
        const side = i === 0 ? 1 : -1;
        const flap = Math.sin(t * rate) * amp;
        wing.rotation.x = flap * side;
        wing.rotation.z = flap * 0.35 * side;
        if (sleeping) wing.rotation.x = -0.5 * side;
      });
      void flying;
      if (p.body) p.body.rotation.x = Math.sin(t * rate) * 0.05 * walk;
    }

    // --- змея: тело идёт волной ---
    if (p.segments) {
      const amp = 0.12 + walk * 0.2;
      p.segments.forEach((seg, i) => {
        const ph = t * (1.8 + walk * 2.2) - i * 0.85;
        seg.position.z = Math.sin(ph) * amp;
        seg.position.x = -i * 0.13 + Math.cos(ph) * amp * 0.35;
        seg.rotation.y = Math.cos(ph) * (0.22 + walk * 0.2);
      });
      if (p.head) {
        p.head.rotation.x = alert ? -0.35 + Math.sin(mob.animTime * 5) * 0.08 : 0.02;
        p.head.position.x = 0.2 + Math.cos(t * 2.2) * 0.03;
        p.head.position.y = 0.12 + (alert ? 0.1 : 0) + Math.sin(mob.animTime * 3) * 0.01;
      }
    }

    // --- язык змеи ---
    if (p.tongue) {
      const speed = alert || state === 'chase' ? 6 : 2.4;
      const flick = Math.sin(mob.animTime * speed) > 0.55 ? 1 : 0.25;
      p.tongue.scale.x = flick;
      p.tongue.visible = !sleeping;
    }

    // --- обезьяна: длинные руки машут вразнобой с ногами ---
    if (p.arms) {
      const amp = 0.55 + run * 0.45;
      p.arms.forEach((arm, i) => {
        const ph = t * 1.15 + (i ? Math.PI : 0);
        arm.rotation.x = Math.sin(ph) * amp * (0.3 + walk);
        arm.rotation.z = (i ? -1 : 1) * (0.12 + Math.cos(ph) * 0.12 * walk);
      });
    }
    if (p.tailSegs) {
      // хвост закручивается в крючок и подрагивает на бегу
      p.tailSegs.forEach((seg, i) => {
        seg.rotation.z = -0.5 + i * 0.12 + Math.sin(mob.animTime * (1.4 + walk * 2) - i * 0.5) * (0.08 + walk * 0.1);
        seg.rotation.y = Math.sin(mob.animTime * 1.1 - i * 0.4) * 0.12 * (0.5 + walk);
      });
    }

    // --- черепаха: лапы переставляются медленно, голова покачивается ---
    if (def.type === 'turtle') {
      p.legs?.forEach((leg, i) => {
        const ph = t * 1.1 + (i % 2 ? Math.PI : 0);
        leg.rotation.x = Math.sin(ph) * 0.32 * (0.25 + walk);
        leg.position.y = 0.14 + Math.max(0, Math.sin(ph)) * 0.03 * walk;
      });
      if (p.head) {
        p.head.position.y = 0.2 + Math.sin(mob.animTime * 1.2) * 0.015;
        p.head.rotation.y = state === 'idle' ? Math.sin(mob.animTime * 0.5) * 0.4 : 0;
      }
      // панцирь чуть покачивается при ходьбе
      if (p.body) p.body.rotation.z = Math.sin(t * 1.1) * 0.05 * walk;
      // хвост виляет совсем немного и не выламывается из своего угла
      if (p.tail) {
        const baseZ = p.tail.userData.baseZ ?? (p.tail.userData.baseZ = p.tail.rotation.z);
        p.tail.rotation.z = baseZ + Math.sin(mob.animTime * 1.3) * 0.05;
        p.tail.rotation.y = Math.sin(mob.animTime * 1.1 + 0.6) * (0.08 + walk * 0.16);
      }
    }

    // --- рыба: тело виляет, хвост работает как весло ---
    if (def.type === 'fish') {
      const wiggle = 0.25 + walk * 0.55;
      if (p.body) {
        p.body.rotation.y = Math.sin(t * (4 + walk * 4)) * 0.16;
        p.body.rotation.z = Math.sin(t * (2 + walk * 2)) * 0.08;
      }
      if (p.tail) {
        p.tail.rotation.y = Math.sin(t * (4.5 + walk * 4.5)) * wiggle;
        p.tail.rotation.z = Math.sin(t * 2.5) * 0.1;
      }
      if (p.fins) {
        p.fins.forEach((fin, i) => {
          fin.rotation.x = Math.sin(t * 3 + i) * 0.18;
        });
      }
    }

    // --- сон: зверь ложится и не дёргается ---
    if (mob.group) {
      const targetLean = sleeping ? 0.12 : 0;
      mob.group.rotation.x = (mob.group.rotation.x || 0) * 0.9 + targetLean * 0.1;
    }
  }
}

export { TYPES as MOB_TYPES };
