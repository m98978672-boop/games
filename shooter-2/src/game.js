/* =============================================================================
   СЕКТОР «ПЕПЕЛ» — игра: игрок, стрельба, миссии, волны, цикл кадра
   -----------------------------------------------------------------------------
   Однопользовательский шутер от первого лица: 6 миссий, боевики, которые
   «больно думают», регдол из точек, 1760 анимаций.
   ============================================================================= */
(function (root) {
  'use strict';
  const SH2 = (root.SH2 = root.SH2 || {});
  const D = SH2.data;

  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  const damp = (a, b, k) => lerp(a, b, 1 - Math.exp(-k));

  /* =============================== ИГРОК ================================== */
  class Player {
    constructor(game) {
      this.game = game;
      this.x = 0; this.z = 0; this.y = 0;
      this.vx = 0; this.vz = 0;
      this.yaw = 0; this.pitch = 0;
      this.roll = 0;
      this.hp = 100; this.maxHp = 100;
      this.armor = 0; this.maxArmor = 100;
      this.stamina = 100; this.maxStamina = 100;
      this.exhausted = false;
      this.crouch = false;
      this.crouchT = 0;
      this.sprint = false;
      this.bob = 0; this.bobAmt = 0;
      this.stepAccum = 0;
      this.ads = false;
      this.eyeHeight = 1.62;
      this.radius = 0.46;
      this.recoilPitch = 0; this.recoilYaw = 0;
      this.spreadHeat = 0;
      this.alive = true;
      this.respawnTimer = 0;
      this.hitDirection = 0; this.hitFlash = 0;
      this.healthRegenTimer = 0;
      this.slots = [];
      this.slot = 0;
      this.ammoInMag = 0; this.reserve = 0;
      this.reloading = false; this.reloadTimer = 0;
      this.fireTimer = 0;
      this.kills = 0; this.headshots = 0; this.shots = 0; this.hits = 0;
      this.damageDealt = 0; this.damageTaken = 0;
      this.scoped = false;
      this.kick = 0;
      this.fov = 78;
      this.sprintFov = 0;
      this.deathAnim = 0;
      this.lastDamageTime = -99;
      this.noShootTimer = 0;
      this.vy = 0;
      this.grounded = true;
    }

    /* прыжок: перепрыгиваем мешки, камни, низкие ограды; техника — нет */
    jump() {
      if (!this.alive || !this.grounded || this.exhausted) return false;
      if (this.stamina < 12) return false;
      this.vy = 3.6;
      this.grounded = false;
      this.stamina -= 12;
      if (this.game.audio) this.game.audio.footstep(this.x, this.z, 0.25);
      return true;
    }

    giveWeapon(id) {
      if (this.slots.indexOf(id) === -1) this.slots.push(id);
    }
    selectSlot(i) {
      if (i < 0 || i >= this.slots.length) return;
      if (i === this.slot && this.ammoInMag !== null) return;
      this.slot = i;
      const w = this.weapon;
      this.ammoInMag = this.magStore && this.magStore[w.id] !== undefined ? this.magStore[w.id] : w.mag;
      this.reserve = this.reserveStore && this.reserveStore[w.id] !== undefined ? this.reserveStore[w.id] : w.reserve;
      this.reloading = false; this.reloadTimer = 0;
      this.fireTimer = 0.25;
      if (this.game.viewmodel) this.game.viewmodel.setWeapon(w.id);
      if (this.game.audio) this.game.audio._tone(300, 0.05, 0.08, 'square');
    }
    get weapon() { return D.WEAPON_BY_ID[this.slots[this.slot] || 'pistol']; }
    get magStore() { return this._magStore || (this._magStore = {}); }
    get reserveStore() { return this._reserveStore || (this._reserveStore = {}); }
    saveAmmo() {
      const w = this.weapon;
      this.magStore[w.id] = this.ammoInMag;
      this.reserveStore[w.id] = this.reserve;
    }

    /* ------------------------------- огонь ------------------------------- */
    canFire(time) {
      const w = this.weapon;
      if (this.reloading || this.alive === false) return false;
      if (this.ammoInMag <= 0) return false;
      if (this.fireTimer > 0) return false;
      if (this.game.state !== 'playing' && !this.game.inGame && !this.game.allowDirectFire) return false;
      return true;
    }

    fire(time) {
      const w = this.weapon;
      const g = this.game;
      this.fireTimer = 60 / w.rpm;
      this.ammoInMag--;
      this.shots++;
      this.saveAmmo();
      this.spreadHeat = Math.min(1.6, this.spreadHeat + (w.auto ? 0.22 : 0.4));

      // разброс: движение, присед, ADS, нагрев
      const moveFactor = Math.min(1.8, Math.hypot(this.vx, this.vz) / 3.4);
      const airFactor = this.y > 0.15 ? 2.6 : 1;
      const baseSpread = (this.ads ? w.adsSpread : w.spread);
      const spread = baseSpread * (1 + moveFactor * 0.9 + this.spreadHeat * 0.55) * (this.crouch ? 0.72 : 1) * airFactor;

      const origin = g.rayOrigin();
      const dirBase = g.rayDirection();
      for (let p = 0; p < w.pellets; p++) {
        const dir = dirBase.clone();
        // конус разброса
        const rx = (Math.random() - 0.5) * 2 * spread;
        const ry = (Math.random() - 0.5) * 2 * spread;
        const right = new (root.THREE.Vector3)(-Math.cos(this.yaw), 0, Math.sin(this.yaw));
        const up = new (root.THREE.Vector3)(0, 1, 0);
        dir.addScaledVector(right, rx).addScaledVector(up, ry).normalize();
        g.combat.playerBullet(origin, dir, w);
      }
      // отдача
      const recoilMul = (this.crouch ? 0.78 : 1) * (this.ads ? 0.65 : 1) * (this.ads && w.scope ? 0.5 : 1);
      this.pitch += w.recoil * 0.42 * recoilMul;
      this.yaw += (Math.random() - 0.5) * w.recoil * 0.5 * recoilMul;
      this.recoilPitch = Math.min(0.16, this.recoilPitch + w.recoil * 0.9 * recoilMul);
      this.kick = 1;
      g.kick(w.kick);
      if (g.viewmodel) g.viewmodel.addRecoil(w.kick * 2.4);
      if (g.audio) g.audio.gunshot(w.sound, this.x, this.z, 1);
      if (g.fx) {
        const mz = g.viewmodel ? g.viewmodel.muzzle() : origin;
        g.fx.muzzleFlash(mz, this.ads ? 0.7 : 1);
        const right = new (root.THREE.Vector3)(-Math.cos(this.yaw), 0, Math.sin(this.yaw));
        g.fx.casing(new (root.THREE.Vector3)(origin.x + right.x * 0.2, origin.y - 0.1, origin.z + right.z * 0.2), right);
        if (g.audio) g.audio.casingSfx();
      }
      // предупреждение боевикам
      g.alertEnemies(this.x, this.z, 34);
      if (this.ammoInMag === 0 && this.reserve > 0) this.startReload();
      else if (this.ammoInMag === 0 && g.audio) g.audio.dryFire();
      g.ui && g.ui.hudAmmo(this);
    }

    startReload() {
      const w = this.weapon;
      if (this.reloading || this.ammoInMag >= w.mag || this.reserve <= 0) return;
      this.reloading = true;
      this.reloadTimer = w.reload;
      this.saveAmmo();
      if (this.game.audio) this.game.audio.reload(this.x, this.z);
      if (this.game.viewmodel) this.game.viewmodel.playReload(w.reload);
    }

    finishReload() {
      const w = this.weapon;
      const need = w.mag - this.ammoInMag;
      const take = Math.min(need, this.reserve);
      this.ammoInMag += take;
      this.reserve -= take;
      this.reloading = false;
      this.saveAmmo();
      this.game.ui && this.game.ui.hudAmmo(this);
    }

    /* ----------------------------- движение ----------------------------- */
    update(dt, inp, game) {
      if (!this.alive) { this.deathAnim += dt; return; }
      const w = this.weapon;
      const wantSprint = inp.sprint && inp.forward > 0 && !this.ads && !this.crouch;
      if (wantSprint && this.stamina > 1 && !this.exhausted) {
        this.sprint = true;
        this.stamina -= dt * 17;
        if (this.stamina <= 1) { this.exhausted = true; this.sprint = false; }
      } else {
        this.sprint = false;
        this.stamina = Math.min(this.maxStamina, this.stamina + dt * (this.crouch ? 26 : 13));
        if (this.stamina > 32) this.exhausted = false;
      }
      // присед
      const wantCrouch = inp.crouch;
      this.crouchT = damp(this.crouchT, wantCrouch ? 1 : 0, 12);
      this.crouch = this.crouchT > 0.5;

      const speedWalk = 4.3 * (this.crouch ? 0.48 : 1) * (this.ads ? 0.55 : 1);
      const speedRun = 7.9 * (this.crouch ? 0.4 : 1);
      const targetSpeed = this.sprint ? speedRun : speedWalk;
      // направление
      const sin = Math.sin(inp.yaw), cos = Math.cos(inp.yaw);
      let dx = 0, dz = 0;
      if (inp.forward) { dx += sin * inp.forward; dz += cos * inp.forward; }
      // Экранное «право»: камера смотрит в +Z через разворот на π, поэтому
      // вперёд = (sin, cos), а вправо = (−cos, sin). Раньше здесь стоял знак
      // наоборот — от этого управление было зеркальным.
      if (inp.strafe) { dx += -cos * inp.strafe; dz += sin * inp.strafe; }
      const mag = Math.hypot(dx, dz);
      if (mag > 0) { dx /= mag; dz /= mag; }
      const accel = this.y > 0.05 ? 4 : 16;
      this.vx = damp(this.vx, dx * targetSpeed, accel);
      this.vz = damp(this.vz, dz * targetSpeed, accel);
      const px = this.x, pz = this.z;
      this.x += this.vx * dt;
      this.z += this.vz * dt;
      const pos = { x: this.x, z: this.z, y: this.y };
      game.world.resolveCircle(pos, this.radius);
      this.x = pos.x; this.z = pos.z;

      const moved = Math.hypot(this.x - px, this.z - pz);
      const speed = moved / Math.max(0.0001, dt);
      this.bobAmt = damp(this.bobAmt, Math.min(1, speed / 4.5), 8);
      this.bob += dt * (speed * 2.1 + 0.6);
      // шаги
      this.stepAccum += moved;
      const stepLen = this.sprint ? 1.9 : this.crouch ? 1.1 : 2.3;
      if (this.stepAccum > stepLen) {
        this.stepAccum = 0;
        if (game.audio) game.audio.footstep(this.x, this.z, this.sprint ? 0.55 : this.crouch ? 0.22 : 0.4);
        game.alertEnemies(this.x, this.z, this.sprint ? 16 : 9);
      }
      // высота глаз
      const targetEye = this.crouch ? 1.06 : 1.62;
      this.eyeHeight = damp(this.eyeHeight, targetEye, 14);
      // вертикаль: прыжок через низкие препятствия
      if (!this.grounded || this.y > 0) {
        this.vy -= 14.5 * dt;
        this.y += this.vy * dt;
        if (this.y <= 0) { this.y = 0; this.vy = 0; this.grounded = true; }
      }
      // высота камеры: приседание + покачивание
      this.camBob = Math.sin(this.bob) * 0.026 * this.bobAmt * (this.ads ? 0.25 : 1);
      this.camBobSide = Math.cos(this.bob * 0.5) * 0.022 * this.bobAmt * (this.ads ? 0.2 : 1);
      this.roll = damp(this.roll, -inp.strafe * 0.028 - this.recoilYaw * 0.4, 8);

      // регенерация
      if (game.time - this.lastDamageTime > 6 && this.hp < this.maxHp) {
        this.hp = Math.min(this.maxHp, this.hp + dt * 5.5);
      }
      // отдача
      this.recoilPitch = damp(this.recoilPitch, 0, 7);
      this.recoilYaw = damp(this.recoilYaw || 0, 0, 8);
      this.spreadHeat = damp(this.spreadHeat, 0, 3.2);
      this.kick = damp(this.kick, 0, 12);
      if (this.fireTimer > 0) this.fireTimer -= dt;
      if (this.reloading) {
        this.reloadTimer -= dt;
        if (this.reloadTimer <= 0) this.finishReload();
      }
      this.ads = inp.ads && !this.sprint && !this.reloading;
      this.scoped = this.ads && !!w.scope;
      const fovTarget = this.ads ? w.adsFov : (this.sprint ? 84 : 78);
      this.fov = damp(this.fov, fovTarget, 12);
      // индикатор попадания гаснет
      if (this.hitFlash > 0) this.hitFlash -= dt * 2.4;
    }

    damage(amount, game, from, kind) {
      if (!this.alive) return;
      let dmg = amount;
      if (this.armor > 0) {
        const absorbed = Math.min(this.armor, dmg * 0.55);
        this.armor -= absorbed;
        dmg -= absorbed;
      }
      this.hp -= dmg;
      this.damageTaken += amount;
      this.lastDamageTime = game.time;
      this.hitFlash = 1;
      if (from) this.hitDirection = Math.atan2(from.x - this.x, from.z - this.z);
      if (game.audio) game.audio.hurt();
      if (game.ui) game.ui.damage(from, kind, amount);
      if (this.hp <= 0) {
        this.hp = 0;
        this.alive = false;
        this.deathAnim = 0;
        game.onPlayerDeath();
      }
    }
  }

  /* =============================== БОЙ ==================================== */
  class Combat {
    constructor(game) { this.game = game; this.bullets = []; this.grenades = []; }

    /* пуля игрока — хитскан, трассер рисуется до точки попадания */
    playerBullet(origin, dir, w) {
      const g = this.game;
      const maxT = w.range;
      const worldHit = g.world.rayColliders(origin.x, origin.y, origin.z, dir.x, dir.y, dir.z, maxT);
      let bestT = worldHit ? worldHit.t : maxT;
      let target = null, hitY = 0;
      // бойцы: цилиндр
      for (const e of g.enemies) {
        if (!e.alive) continue;
        const t = SH2.world.rayCylinder(origin.x, origin.y, origin.z, dir.x, dir.y, dir.z,
          e.x, e.z, 0.36 * e.cfg.scale, 0, 1.82 * e.cfg.scale, bestT);
        if (t !== null && t < bestT) { bestT = t; target = e; hitY = origin.y + dir.y * t; }
      }
      const T = root.THREE;
      const end = new T.Vector3(origin.x + dir.x * bestT, origin.y + dir.y * bestT, origin.z + dir.z * bestT);
      g.fx.tracer(origin.x - dir.x * 0.2, origin.y - dir.y * 0.2 - 0.05, origin.z - dir.z * 0.2, end.x, end.y, end.z, w.tracer);
      if (target) {
        const headY = (e => (e.crouch ? 1.20 : 1.66) * e.cfg.scale);
        const isHead = hitY > headY(target) - 0.13 * target.cfg.scale;
        const isLegs = hitY < 0.62 * target.cfg.scale;
        let dmg = w.damage * (isHead ? w.headshot : isLegs ? 0.72 : 1);
        // падение урона по дистанции
        if (bestT > 28) dmg *= Math.max(0.45, 1 - (bestT - 28) / (w.range * 1.6));
        const res = target.hit(dmg, g, { dir, force: 2 + w.damage / 22, hitPoint: end, head: isHead, weapon: w.id });
        g.player.hits++;
        g.player.damageDealt += res.damage;
        if (isHead) g.player.headshots++;
        g.ui && g.ui.hitmarker(isHead ? 'head' : 'body', res.killed);
        if (g.audio) { g.audio.hitmarker(); if (isHead) g.audio.headshot(); }
        g.ui && g.ui.damageNumber(end, Math.round(dmg), isHead);
        g.fx.impact(end, null, true);
        if (target.brain) target.brain.alert = 1;
      } else {
        g.fx.impact(end, null, false);
      }
      if (g.mission && g.mission.type === 'destroy') g.damageObjective(end.x, end.z, w.damage);
      return end;
    }

    /* пуля боевика — снаряд: его видно, можно уйти с линии */
    enemyBullet(agent, origin, dir, w) {
      const T = root.THREE;
      this.bullets.push({
        pos: new T.Vector3(origin.x, origin.y, origin.z),
        dir: new T.Vector3(dir.x, dir.y, dir.z),
        speed: w.id === 'dmr' ? 130 : w.id === 'shotgun' ? 70 : 95,
        damage: w.damage * (w.id === 'shotgun' ? 0.26 : 0.62),
        life: 2.2, owner: agent, tracer: w.tracer, traveled: 0, maxDist: w.range
      });
    }

    grenade(agent, target) {
      const T = root.THREE;
      const g = this.game;
      const dx = target.x - agent.x, dz = target.z - agent.z;
      const dist = Math.hypot(dx, dz);
      const t = clamp(dist / 15, 0.7, 1.7);
      const vy = 6.5;
      const vx = dx / t, vz = dz / t;
      this.grenades.push({
        pos: new T.Vector3(agent.x, 1.3, agent.z),
        vel: new T.Vector3(vx, vy, vz),
        fuse: 2.35, owner: agent, mesh: null, radius: 6.2, damage: 92, fromPlayer: false
      });
    }

    playerGrenade() {
      const T = root.THREE;
      const g = this.game;
      if (g.player.grenadeCount <= 0) { g.ui && g.ui.toast('Гранат нет'); return; }
      g.player.grenadeCount--;
      const dir = g.rayDirection();
      const origin = g.rayOrigin();
      this.grenades.push({
        pos: new T.Vector3(origin.x + dir.x * 0.5, origin.y, origin.z + dir.z * 0.5),
        vel: new T.Vector3(dir.x * 20, 4.5 + dir.y * 18, dir.z * 20),
        fuse: 2.15, owner: g.player, mesh: null, radius: 7, damage: 150, fromPlayer: true
      });
      if (g.audio) g.audio.throwGrenade(g.player.x, g.player.z);
      g.ui && g.ui.hudGrenades(g.player.grenadeCount);
    }

    update(dt) {
      const g = this.game;
      const T = root.THREE;

      /* --- пули врагов --- */
      for (let i = this.bullets.length - 1; i >= 0; i--) {
        const b = this.bullets[i];
        b.life -= dt;
        const dist = b.speed * dt;
        const steps = Math.max(1, Math.ceil(dist / 0.55));
        const step = dist / steps;
        let dead = false;
        for (let s = 0; s < steps && !dead; s++) {
          const ox = b.pos.x, oy = b.pos.y, oz = b.pos.z;
          // мир
          const hit = g.world.rayColliders(ox, oy, oz, b.dir.x, b.dir.y, b.dir.z, step);
          if (hit) {
            const hx = ox + b.dir.x * hit.t, hy = oy + b.dir.y * hit.t, hz = oz + b.dir.z * hit.t;
            g.fx.impact(new T.Vector3(hx, hy, hz), null, false);
            b.pos.set(hx, hy, hz);
            dead = true; break;
          }
          // игрок
          const P = g.player;
          if (P.alive) {
            const ph = P.crouch ? 1.15 : 1.75;
            const t = SH2.world.rayCylinder(ox, oy, oz, b.dir.x, b.dir.y, b.dir.z, P.x, P.z, 0.40, 0, ph, step);
            if (t !== null) {
              const headT = SH2.world.rayCylinder(ox, oy, oz, b.dir.x, b.dir.y, b.dir.z, P.x, P.z, 0.22, ph - 0.30, ph, step);
              const isHead = headT !== null && headT <= t + 1e-4;
              const dmg = b.damage * (isHead ? 2.1 : 1);
              P.damage(dmg, g, b.owner, isHead ? 'head' : 'bullet');
              g.fx.impact(new T.Vector3(ox + b.dir.x * t, oy + b.dir.y * t, oz + b.dir.z * t), null, true);
              dead = true; break;
            }
          }
          b.pos.x += b.dir.x * step; b.pos.y += b.dir.y * step; b.pos.z += b.dir.z * step;
          b.traveled += step;
          if (b.traveled > b.maxDist) { dead = true; break; }
        }
        // трассер
        if (!dead || b.traveled > 0) {
          g.fx.tracers.fire(b.pos.x, b.pos.y, b.pos.z,
            b.pos.x + b.dir.x * 3.2, b.pos.y + b.dir.y * 3.2, b.pos.z + b.dir.z * 3.2, b.tracer);
        }
        if (dead || b.life <= 0) this.bullets.splice(i, 1);
      }

      /* --- гранаты --- */
      for (let i = this.grenades.length - 1; i >= 0; i--) {
        const gr = this.grenades[i];
        gr.fuse -= dt;
        gr.vel.y -= 14 * dt;
        const prevY = gr.pos.y;
        gr.pos.x += gr.vel.x * dt;
        gr.pos.y += gr.vel.y * dt;
        gr.pos.z += gr.vel.z * dt;
        if (gr.pos.y < 0.12) {
          gr.pos.y = 0.12;
          gr.vel.y *= -0.42;
          gr.vel.x *= 0.7; gr.vel.z *= 0.7;
        }
        const pos = { x: gr.pos.x, z: gr.pos.z };
        if (g.world.resolveCircle(pos, 0.16)) { gr.vel.x *= -0.5; gr.vel.z *= -0.5; }
        gr.pos.x = pos.x; gr.pos.z = pos.z;
        if (!gr.mesh) {
          const geo = new T.SphereGeometry(0.10, 8, 6);
          gr.mesh = new T.Mesh(geo, SH2.model.mat(0x2b3a2b));
          gr.mesh.castShadow = true;
          g.scene.add(gr.mesh);
        }
        gr.mesh.position.copy(gr.pos);
        gr.mesh.rotation.x += dt * 9;
        if (gr.fuse <= 0) {
          this.explode(gr);
          g.scene.remove(gr.mesh);
          gr.mesh.geometry.dispose();
          this.grenades.splice(i, 1);
        }
      }
    }

    explode(gr) {
      const g = this.game;
      const T = root.THREE;
      g.fx.explosion(gr.pos, gr.radius);
      g.shake(0.7);
      const P = g.player;
      const dP = Math.hypot(P.x - gr.pos.x, P.z - gr.pos.z);
      if (P.alive && dP < gr.radius) {
        const falloff = 1 - dP / gr.radius;
        P.damage(gr.damage * falloff * (gr.fromPlayer ? 0.35 : 1), g, gr.owner, 'explosion');
        P.vx += ((P.x - gr.pos.x) / Math.max(0.4, dP)) * 6 * falloff;
        P.vz += ((P.z - gr.pos.z) / Math.max(0.4, dP)) * 6 * falloff;
      }
      if (g.mission && g.mission.type === 'destroy') g.damageObjective(gr.pos.x, gr.pos.z, gr.damage * 0.85);
      g.enemies.forEach((e) => {
        if (!e.alive) return;
        const d = Math.hypot(e.x - gr.pos.x, e.z - gr.pos.z);
        if (d < gr.radius && g.world.hasLOS(e.x, 1.0, e.z, gr.pos.x, gr.pos.y + 0.2, gr.pos.z)) {
          const falloff = 1 - d / gr.radius;
          e.hit(gr.damage * falloff, g, { force: 6 * falloff, dir: new T.Vector3((e.x - gr.pos.x) / (d || 1), 0, (e.z - gr.pos.z) / (d || 1)) });
        }
      });
    }
  }

  /* ============================== ИГРА ==================================== */
  class Game {
    constructor(opts) {
      const o = opts || {};
      this.canvas = o.canvas;
      this.ui = o.ui;
      this.settings = {
        ragdoll: true,
        quality: 'high',
        difficulty: (o.difficulty === undefined ? 1 : o.difficulty),
        fov: 78,
        invertY: false,
        mouseSens: 1,
        showThoughts: true
      };
      this.time = 0;
      this.state = 'menu'; // menu | briefing | playing | paused | dead | won | complete
      this.missionIndex = 0;
      this.enemies = [];
      this.deadBodies = [];
      this.flyingWeapons = [];
      this.objectives = [];
      this.waves = [];
      this.waveIndex = 0;
      this.missionTimer = 0;
      this.kills = 0;
      this.score = 0;
      this.commanderTimer = 0;
      this.radioLog = [];
      this.hitStop = 0;
      this.cameraRoll = 0;
      this.shakeAmount = 0;
      this.shakeTime = 0;
      this.timeScale = 1;
      this.input = { forward: 0, strafe: 0, sprint: false, crouch: false, ads: false, fire: false };
      this.keys = {};
      this.mouse = { dx: 0, dy: 0, down: false, right: false };
      this.locked = false;
      this.difficulty = this.settings.difficulty;
      this.maxDifficulty = 2;
      this.combat = new Combat(this);
      this.spawnPools = {};
      this.frameTime = 0;
      this.stats = { shots: 0, hits: 0 };
      this.sway = { x: 0, y: 0 };
      this.lastMoveState = '';
      this._semiLatch = 0;
    }

    /* ------------------------------ запуск ------------------------------- */
    init() {
      const T = root.THREE;
      const dpr = Math.min(root.devicePixelRatio || 1, 2);
      this.renderer = new T.WebGLRenderer({ canvas: this.canvas, antialias: true, powerPreference: 'high-performance' });
      this.renderer.setPixelRatio(dpr);
      this.renderer.setSize(root.innerWidth, root.innerHeight);
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = T.PCFSoftShadowMap;
      if ('outputColorSpace' in this.renderer) this.renderer.outputColorSpace = T.SRGBColorSpace;
      if ('toneMapping' in this.renderer) this.renderer.toneMapping = T.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.05;

      this.scene = new T.Scene();
      this.camera = new T.PerspectiveCamera(this.settings.fov, root.innerWidth / root.innerHeight, 0.05, 320);
      // слой 0 — мир, слой 1 — оружие от первого лица (рисуется вторым проходом)
      this.camera.layers.enable(1);
      this.scene.add(this.camera);
      this.scene.fog = new T.FogExp2(0x1a1410, 0.012);

      this.perf = new SH2.perf.Perf();
      this.audio = new SH2.audio.AudioEngine();
      this.fx = new SH2.fx.FX(this.scene, this.audio);
      this.viewmodel = new SH2.viewmodel.ViewModel(this.camera);
      this.player = new Player(this);
      this.ui && this.ui.bindGame(this);
      this.bindEvents();
      this.resetCaches();
      this.last = performance.now();
      this.loop = this.loop.bind(this);
      requestAnimationFrame(this.loop);
      this.buildMenuScene();
      this.ui && this.ui.ready(this);
    }

    /* Фон главного меню: тот же уровень, что в первой миссии, и пара бойцов.
       Переиспользуем все системы игры — меню не «пустое», а живое. */
    buildMenuScene() {
      if (this.level) return;
      const m = D.MISSIONS[0];
      this.level = SH2.model.buildLevel(m.map);
      this.scene.add(this.level.group);
      this.world = new SH2.world.World(this.level.map, this.level.colliders);
      this.scene.background = new (root.THREE.Color)(this.level.map.sky);
      this.scene.fog = new (root.THREE.FogExp2)(this.level.map.fog, 0.012);
      this.perf.setPreset(this.settings.quality, this.renderer, this.level.sun, this.scene);
      this.menuAgents = [];
      ['grunt', 'officer', 'scout'].forEach((type, i) => {
        const spot = this.world.randomOpenPoint(0, 0, 3, 7, Math.random) || { x: i * 2 - 2, z: 3 };
        const a = new SH2.agent.Agent(this, type, { x: spot.x, z: spot.z, yaw: Math.PI + i });
        a.brain.update = () => {};   // в меню бойцы просто стоят
        this.menuAgents.push(a);
      });
      const ex = this.level.map.extracts[0];
      const marker = SH2.model.buildExtractMarker(ex.r, 0x5cff9d);
      marker.position.set(ex.x, 0, ex.z);
      this.scene.add(marker);
      this.menuMarker = marker;
    }

    clearMenuScene() {
      if (this.menuAgents) {
        this.menuAgents.forEach((a) => a.dispose(this.scene));
        this.menuAgents.length = 0;
      }
      if (this.menuMarker) { this.scene.remove(this.menuMarker); this.menuMarker = null; }
    }

    resetCaches() {
      this._colliders = [];
      this._objectiveMeshes = [];
    }

    /* ------------------------------ события ------------------------------ */
    bindEvents() {
      const kd = (e) => {
        if (e.repeat) return;
        this.keys[e.code] = true;
        if (this.state === 'playing' || this.state === 'paused') this.onKeyDown(e);
      };
      const ku = (e) => { this.keys[e.code] = false; };
      // пробел не должен прокручивать страницу и «нажимать» кнопки меню
      root.addEventListener('keydown', (e) => { if (e.code === 'Space') e.preventDefault(); });
      root.addEventListener('keydown', kd);
      root.addEventListener('keyup', ku);
      root.addEventListener('mousedown', (e) => {
        if (e.button === 0) this.mouse.down = true;
        if (e.button === 2) this.mouse.right = true;
        if (this.state === 'playing' && this.locked) this.tryShoot();
      });
      root.addEventListener('mouseup', (e) => {
        if (e.button === 0) this.mouse.down = false;
        if (e.button === 2) this.mouse.right = false;
      });
      root.addEventListener('mousemove', (e) => {
        if (!this.locked) return;
        const s = (this.settings.mouseSens || 1) * (this.player.ads ? 0.62 : 1) *
          (this.player.scoped ? 0.42 : 1);
        this.mouse.dx += e.movementX * s;
        this.mouse.dy += e.movementY * s;
      });
      root.addEventListener('contextmenu', (e) => e.preventDefault());
      root.addEventListener('resize', () => this.onResize());
      document.addEventListener('pointerlockchange', () => {
        this.locked = document.pointerLockElement === this.canvas;
        if (!this.locked && this.state === 'playing') this.pause();
      });
      document.addEventListener('visibilitychange', () => {
        if (document.hidden && this.state === 'playing') this.pause();
      });
      this.canvas.addEventListener('click', () => {
        if (this.state === 'playing' && !this.locked) this.lock();
      });
      this.bindTouch();
    }

    /* ------------------------- управление на телефоне ---------------------- */
    bindTouch() {
      const coarse = root.matchMedia ? root.matchMedia('(pointer: coarse)').matches : false;
      this.touch = { active: false, moveId: null, lookId: null, mx: 0, my: 0, lx: 0, ly: 0, fire: false, ads: false };
      if (!coarse) return;
      this.touch.active = true;
      document.body.classList.add('touch');
      const pos = (t) => ({ x: t.clientX, y: t.clientY });
      this.canvas.addEventListener('touchstart', (e) => {
        if (this.state !== 'playing') return;
        for (const t of e.changedTouches) {
          const p = pos(t);
          if (p.x < root.innerWidth * 0.45 && this.touch.moveId === null) { this.touch.moveId = t.identifier; this.touch.mx = p.x; this.touch.my = p.y; }
          else if (this.touch.lookId === null) { this.touch.lookId = t.identifier; this.touch.lx = p.x; this.touch.ly = p.y; }
        }
        e.preventDefault();
      }, { passive: false });
      this.canvas.addEventListener('touchmove', (e) => {
        for (const t of e.changedTouches) {
          const p = pos(t);
          if (t.identifier === this.touch.moveId) {
            const dx = (p.x - this.touch.mx) / 60, dy = (p.y - this.touch.my) / 60;
            this.input.forward = Math.max(-1, Math.min(1, -dy));
            this.input.strafe = Math.max(-1, Math.min(1, dx));
            this.keys.KeyW = this.input.forward > 0.25;
            this.keys.KeyS = this.input.forward < -0.25;
            this.keys.KeyD = this.input.strafe > 0.25;
            this.keys.KeyA = this.input.strafe < -0.25;
          } else if (t.identifier === this.touch.lookId) {
            this.mouse.dx += (p.x - this.touch.lx) * 1.5;
            this.mouse.dy += (p.y - this.touch.ly) * 1.5;
            this.touch.lx = p.x; this.touch.ly = p.y;
          }
        }
        e.preventDefault();
      }, { passive: false });
      const end = (e) => {
        for (const t of e.changedTouches) {
          if (t.identifier === this.touch.moveId) {
            this.touch.moveId = null;
            this.input.forward = 0; this.input.strafe = 0;
            this.keys.KeyW = this.keys.KeyA = this.keys.KeyS = this.keys.KeyD = false;
          }
          if (t.identifier === this.touch.lookId) this.touch.lookId = null;
        }
      };
      this.canvas.addEventListener('touchend', end);
      this.canvas.addEventListener('touchcancel', end);
      // кнопки
      const hook = (id, on, off) => {
        const b = document.getElementById(id);
        if (!b) return;
        b.addEventListener('touchstart', (e) => { e.preventDefault(); on(); }, { passive: false });
        if (off) b.addEventListener('touchend', (e) => { e.preventDefault(); off(); }, { passive: false });
      };
      hook('t-fire', () => { this.mouse.down = true; this.tryShoot(); }, () => { this.mouse.down = false; });
      hook('t-ads', () => { this.touchAds = !this.touchAds; });
      hook('t-reload', () => this.player.startReload());
      hook('t-crouch', () => { this.input.crouchToggle = !this.input.crouchToggle; });
      hook('t-jump', () => { this.player && this.player.jump(); });
      hook('t-sprint', () => { this.keys.ShiftLeft = !this.keys.ShiftLeft; });
      hook('t-grenade', () => this.combat.playerGrenade());
    }

    lock() {
      if (this.canvas.requestPointerLock) {
        const p = this.canvas.requestPointerLock();
        if (p && p.catch) p.catch(() => {});
      }
    }
    unlock() { if (document.exitPointerLock) document.exitPointerLock(); }

    onKeyDown(e) {
      switch (e.code) {
        case 'KeyR': this.player.startReload(); break;
        case 'Digit1': this.player.saveAmmo(); this.player.selectSlot(0); break;
        case 'Digit2': this.player.saveAmmo(); this.player.selectSlot(1); break;
        case 'Digit3': this.player.saveAmmo(); this.player.selectSlot(2); break;
        case 'KeyQ': this.player.saveAmmo(); this.player.selectSlot((this.player.slot + 1) % this.player.slots.length); break;
        case 'KeyG': this.combat.playerGrenade(); break;
        case 'KeyP': case 'Escape': this.pause(); break;
        case 'KeyC': this.input.crouchToggle = !this.input.crouchToggle; break;
        case 'KeyH': this.ui && this.ui.toggleHelp(); break;
        case 'Space': this.player.jump(); break;
        case 'KeyT': this.ui && this.ui.toggleThoughts(); break;
        case 'KeyF': this.ui && this.ui.toggleDebug(); break;
        case 'Tab': e.preventDefault(); this.ui && this.ui.toggleScore(); break;
        default: break;
      }
    }

    onResize() {
      const w = root.innerWidth, h = root.innerHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    }

    /* ------------------------------ миссии ------------------------------- */
    startMission(index) {
      const m = D.MISSIONS[index];
      if (!m) return;
      this.missionIndex = index;
      this.mission = m;
      this.state = 'playing';
      this.time = 0;
      this.missionTimer = 0;
      this.kills = 0;
      this.waveIndex = 0;
      this.enemies.slice().forEach((e) => e.dispose(this.scene));
      this.enemies.length = 0;
      this.deadBodies.length = 0;
      this.combat.bullets.length = 0;
      this.combat.grenades.forEach((g) => { if (g.mesh) this.scene.remove(g.mesh); });
      this.combat.grenades.length = 0;
      this.fx.reset();
      this.objectives = [];
      this._colliders = [];
      this.objectiveDone = 0;
      this.missionFailed = false;

      this.clearMenuScene();
      // карта
      if (this.level) {
        this.scene.remove(this.level.group);
        this.level.group.traverse((c) => { if (c.geometry) c.geometry.dispose(); });
      }
      this.level = SH2.model.buildLevel(m.map);
      this.scene.add(this.level.group);
      this.world = new SH2.world.World(this.level.map, this.level.colliders);
      this.scene.fog = new (root.THREE.FogExp2)(this.level.map.fog, m.map === 'harbor' ? 0.010 : 0.013);
      this.scene.background = new (root.THREE.Color)(this.level.map.sky);
      this.level.sun.target.position.set(0, 0, 0);
      this.perf.setPreset(this.settings.quality, this.renderer, this.level.sun, this.scene);

      // игрок
      const P = this.player;
      P.alive = true; P.hp = P.maxHp; P.armor = 40; P.stamina = P.maxStamina;
      P.slots.length = 0; P._magStore = {}; P._reserveStore = {}; P.slot = 0;
      m.loadout.forEach((wid) => P.giveWeapon(wid));
      P.grenadeCount = 3;
      const start = this.findStart();
      P.x = start.x; P.z = start.z; P.yaw = start.yaw; P.pitch = 0;
      P.vx = 0; P.vz = 0; P.crouch = false; P.crouchT = 0;
      P.ammoInMag = P.weapon.mag; P.reserve = P.weapon.reserve;
      P.saveAmmo();
      P.kills = 0; P.headshots = 0; P.shots = 0; P.hits = 0; P.damageDealt = 0; P.damageTaken = 0;
      this.viewmodel.setWeapon(P.weapon.id);
      this.radioLog.length = 0;
      this._semiLatch = 0;
      this.reinforceTimer = 0;
      this.lastRadio = -9;
      this.touchAds = false;

      // цели
      this.setupMission(m);
      // враги
      this.spawnInitialEnemies(m);
      this.ui && this.ui.missionStart(m, this);
      this.lock();
      if (this.audio) { this.audio.init(); }
    }

    findStart() {
      const M = this.level.map;
      const ex = M.extracts && M.extracts[0];
      // старт — дальний угол от первой цели/врагов
      const spawns = M.spawns || [[0, 0]];
      let best = { x: 0, z: 0 }, bestD = -1;
      spawns.forEach((s) => {
        const w = this.world.randomOpenPoint(s[0], s[1], 0, 3, Math.random) || { x: s[0], z: s[1] };
        // для эвакуации старт должен быть на другом конце карты
        const d = ex ? Math.hypot(w.x - ex.x, w.z - ex.z) : Math.abs(s[0]) + Math.abs(s[1]);
        if (d > bestD) { bestD = d; best = w; }
      });
      // смотрим в центр карты
      const yaw = Math.atan2(-best.x, -best.z);
      return { x: best.x, z: best.z, yaw };
    }

    setupMission(m) {
      const T = root.THREE;
      this.objectives = [];
      if (m.type === 'eliminate' || m.type === 'boss') {
        this.objectives.push({ id: 'kill', text: 'Уничтожить боевиков', current: 0, max: m.count, done: false });
      } else if (m.type === 'destroy') {
        const boxes = (this.level.map.boxes || []);
        boxes.forEach((b, i) => {
          const mesh = SH2.model.buildObjectiveBox(1.1);
          const pos = this.world.randomOpenPoint(b.x, b.z, 0, 2.5, Math.random) || { x: b.x, z: b.z };
          mesh.position.set(pos.x, 0, pos.z);
          this.scene.add(mesh);
          this.objectives.push({ id: 'box' + i, text: 'Взорвать груз ' + (i + 1), current: 0, max: 1, done: false, mesh, x: pos.x, z: pos.z });
        });
        this.objectives.push({ id: 'killall', text: 'Зачистить охрану', current: 0, max: m.enemies.length, done: false });
      } else if (m.type === 'survive') {
        this.objectives.push({ id: 'survive', text: 'Продержаться', current: 0, max: m.time, done: false });
      } else if (m.type === 'extract') {
        this.objectives.push({ id: 'kill', text: 'Пробиться к эвакуации (зачистить путь)', current: 0, max: 3, done: false, optional: true });
        const ex = this.level.map.extracts[0];
        const marker = SH2.model.buildExtractMarker(ex.r, 0x5cff9d);
        marker.position.set(ex.x, 0, ex.z);
        this.scene.add(marker);
        this.extract = { mesh: marker, x: ex.x, z: ex.z, r: ex.r };
        this.objectives.push({ id: 'reach', text: 'Дойти до точки эвакуации', current: 0, max: 1, done: false });
      }
      this.fxResetObjective();
    }

    fxResetObjective() { this.objectiveMeshes = []; }

    spawnInitialEnemies(m) {
      const types = m.enemies.slice();
      if (m.waves > 1) {
        // волны: первая — 60% состава
        const first = Math.max(3, Math.ceil(types.length * 0.7));
        this.waves = [types.slice(0, first)];
        for (let w = 1; w < m.waves; w++) this.waves.push(types.slice(first));
      } else {
        this.waves = [types];
      }
      this.spawnWave(0);
    }

    spawnWave(i) {
      const wave = this.waves[i];
      if (!wave) return;
      const M = this.level.map;
      const P = this.player;
      let idx = 0;
      wave.forEach((type) => {
        let spot = null;
        for (let tries = 0; tries < 40 && !spot; tries++) {
          const s = M.spawns[(idx + tries) % M.spawns.length];
          const cand = this.world.randomOpenPoint(s[0], s[1], 0, 6, Math.random);
          if (!cand) continue;
          const d = Math.hypot(cand.x - P.x, cand.z - P.z);
          if (d < 16) continue;
          if (d > 55) continue;
          spot = cand;
        }
        if (!spot) {
          const s = M.spawns[idx % M.spawns.length];
          spot = { x: s[0], z: s[1] };
        }
        if (this.enemies.filter((e) => e.alive).length >= 12) return; // лимит активных
        const e = new SH2.agent.Agent(this, type, { x: spot.x, z: spot.z });
        this.enemies.push(e);
        idx++;
      });
      this.ui && this.ui.waveStarted(i + 1, this.waves.length);
    }

    /* ---------------------------- позиции игрока -------------------------- */
    rayOrigin() {
      const T = root.THREE;
      const P = this.player;
      const eye = P.eyeHeight + (P.camBob || 0);
      return new T.Vector3(P.x, eye, P.z);
    }
    rayDirection() {
      const T = root.THREE;
      const P = this.player;
      const pitch = clamp(P.pitch, -1.45, 1.45);
      const cp = Math.cos(pitch);
      // модель и игрок смотрят в +Z своего yaw; pitch > 0 — вверх
      return new T.Vector3(Math.sin(P.yaw) * cp, Math.sin(pitch), Math.cos(P.yaw) * cp).normalize();
    }

    tryShoot() {
      const P = this.player;
      this.inGame = true;
      const ok = P.canFire(this.time);
      this.inGame = false;
      if (!ok) {
        if (P.ammoInMag <= 0 && !P.reloading && P.reserve > 0) P.startReload();
        return;
      }
      if (!P.weapon.auto && this._semiLatch > 0) return;
      if (!P.weapon.auto) this._semiLatch = 60 / P.weapon.rpm;
      P.fire(this.time);
    }

    alertEnemies(x, z, radius) {
      for (const e of this.enemies) {
        if (!e.alive || !e.brain) continue;
        const d = Math.hypot(e.x - x, e.z - z);
        if (d < radius) {
          e.brain.alert = Math.max(e.brain.alert, 0.55);
          if (!e.brain.memory) e.brain.memory = { x, z, t: this.time };
        }
      }
    }

    pushRadio(agent, text) {
      this.radioLog.push({ text, t: this.time, name: agent.cfg.short });
      if (this.radioLog.length > 4) this.radioLog.shift();
      if (this.time - (this.lastRadio || -9) > 2.2) {
        this.lastRadio = this.time;
        this.audio && this.audio.radio();
      }
    }

    /* ---------------------------- урон игроку ---------------------------- */
    damagePlayer(amount, from, kind) {
      const P = this.player;
      if (!P.alive || this.state !== 'playing') return;
      const scale = [0.62, 1, 1.38][this.difficulty] || 1;
      P.damage(amount * scale, this, from, kind);
      this.shake(0.22);
      if (P.hp < 35 && P.alive && !this.lowHpBeep) {
        this.lowHpBeep = true;
        this.audio && this.audio.heartbeat();
        setTimeout(() => { this.lowHpBeep = false; }, 2600);
      }
    }

    shake(amount) {
      this.shakeAmount = Math.max(this.shakeAmount, amount);
      this.shakeTime = Math.max(this.shakeTime, 0.18);
    }
    kick(amount) {
      this.recoilKick = (this.recoilKick || 0) + amount;
    }

    /* Отлетевшее оружие: физика на точках, не больше 6 стволов одновременно */
    addFlyingWeapon(body) {
      if (!body) return;
      this.scene.add(body.mesh);
      this.flyingWeapons.push(body);
      if (this.flyingWeapons.length > 6) {
        const old = this.flyingWeapons.shift();
        this.scene.remove(old.mesh);
      }
    }

    onEnemyKilled(agent, info) {
      agent.flyingWeapon = agent.ragdoll ? agent.ragdoll.detached : null;
      this.kills++;
      const head = !!info.head;
      this.score += Math.round(agent.cfg.score * (head ? 1.5 : 1));
      this.deadBodies.push(agent);
      this.audio && this.audio._tone(head ? 900 : 620, 0.07, 0.10, 'square');
      this.ui && this.ui.killFeed(agent, head);
      if (agent.type === 'officer' || agent.type === 'boss') {
        this.ui && this.ui.toast(agent.type === 'boss' ? 'Архитектор повержен' : 'Командир уничтожен — строй распался');
        if (this.audio) this.audio.objective();
        // потеря приказов
        this.enemies.forEach((e) => { if (e.brain) e.brain.order = null; });
      }
      // лимит трупов: дальние убираем, чтобы не копить draw calls
      if (this.deadBodies.length > 9) {
        const oldest = this.deadBodies.shift();
        oldest.dispose(this.scene);
        const idx = this.enemies.indexOf(oldest);
        if (idx >= 0) this.enemies.splice(idx, 1);
      }
      // цели
      if (this.mission) {
        const killObj = this.objectives.find((o) => o.id === 'kill' || o.id === 'killall');
        if (killObj) killObj.current++;
        const alive = this.enemies.filter((e) => e.alive).length;
        // волны
        if (this.mission.waves > 1 && alive === 0 && this.waveIndex < this.waves.length - 1) {
          this.waveIndex++;
          this.spawnWave(this.waveIndex);
          this.ui && this.ui.toast('Волна ' + (this.waveIndex + 1) + ' из ' + this.waves.length);
        }
      }
      this.checkObjectives();
    }

    onPlayerDeath() {
      this.state = 'dead';
      this.unlock();
      this.audio && this.audio.missionFail();
      this.ui && this.ui.showDeath(this);
    }

    checkObjectives() {
      const P = this.player, m = this.mission;
      if (!m || this.state !== 'playing') return;
      let allDone = true;
      for (const o of this.objectives) {
        if (o.done) continue;
        if (o.id === 'survive') o.current = Math.floor(this.missionTimer);
        if (o.id === 'reach') {
          if (Math.hypot(P.x - this.extract.x, P.z - this.extract.z) < this.extract.r) o.current = 1;
        }
        if (o.current >= o.max) {
          o.done = true;
          this.audio && this.audio.objective();
          this.ui && this.ui.objectiveDone(o);
        } else allDone = false;
      }
      if (allDone) this.completeMission();
    }

    completeMission() {
      const m = this.mission;
      const timeBonus = Math.max(0, Math.round(2500 - this.missionTimer * 18));
      const accuracy = this.player.shots ? Math.round((this.player.hits / this.player.shots) * 100) : 0;
      this.score += timeBonus + accuracy * 12 + Math.round(this.player.hp * 6);
      this.state = 'won';
      this.unlock();
      this.audio && this.audio.missionComplete();
      const isLast = this.missionIndex >= D.MISSIONS.length - 1;
      this.ui && this.ui.showMissionComplete(this, m, {
        time: this.missionTimer, accuracy, kills: this.kills, damageTaken: Math.round(this.player.damageTaken),
        timeBonus, last: isLast
      });
      if (isLast) this.state = 'complete';
    }

    retry() {
      this.startMission(this.missionIndex);
    }
    nextMission() {
      const n = Math.min(D.MISSIONS.length - 1, this.missionIndex + 1);
      this.startMission(n);
    }

    pause() {
      if (this.state !== 'playing') return;
      this.state = 'paused';
      this.unlock();
      this.ui && this.ui.showPause(this);
    }
    resume() {
      if (this.state !== 'paused') return;
      this.state = 'playing';
      this.ui && this.ui.hidePause();
      this.lock();
      this.audio && this.audio.init();
    }

    /* ------------------------------ кадр --------------------------------- */
    loop(now) {
      requestAnimationFrame(this.loop);
      let dt = (now - this.last) / 1000;
      this.last = now;
      if (!Number.isFinite(dt)) dt = 0.016;
      dt = Math.min(0.05, Math.max(0.0005, dt));
      this.perf.update(dt, this.renderer);
      if (this.state === 'playing') this.update(dt);
      else if (this.state === 'paused' || this.state === 'menu') this.idleUpdate(dt);
      this.render(dt);
      this.ui && this.ui.frame(this, dt);
    }

    idleUpdate(dt) {
      this.time += dt;
      if (this.state === 'menu' && this.level) {
        const r = 6.5;
        const a = this.time * 0.18;
        this.camera.position.set(Math.sin(a) * r, 1.9 + Math.sin(this.time * 0.5) * 0.12, Math.cos(a) * r);
        this.camera.rotation.order = 'YXZ';
        this.camera.lookAt(0, 1.15, 0);
        this.camera.fov = 55;
        this.camera.updateProjectionMatrix();
        this.camera.updateMatrixWorld(true);
        if (this.menuAgents) {
          this.menuAgents.forEach((agent, i) => {
            agent.yaw += dt * (i % 2 ? -0.25 : 0.3);
            agent.rig.root.rotation.y = agent.yaw;
            agent._applyPose(0, dt, this);
          });
        }
        if (this.menuMarker) this.menuMarker.userData.ring.scale.setScalar(1 + Math.sin(this.time * 2) * 0.04);
      }
    }

    update(dt) {
      const P = this.player;
      this.time += dt;
      this.missionTimer += dt;
      this.frameTime = dt;

      // ввод
      const inp = this.input;
      inp.crouch = this.input.crouchToggle || !!this.keys.ControlLeft || !!this.keys.KeyC;
      inp.sprint = !!this.keys.ShiftLeft || !!this.keys.ShiftRight;
      inp.ads = this.mouse.right || !!this.touchAds;
      let fwd = 0, str = 0;
      if (this.keys.KeyW || this.keys.ArrowUp) fwd += 1;
      if (this.keys.KeyS || this.keys.ArrowDown) fwd -= 1;
      if (this.keys.KeyD || this.keys.ArrowRight) str += 1;
      if (this.keys.KeyA || this.keys.ArrowLeft) str -= 1;
      inp.forward = fwd; inp.strafe = str;

      // мышь
      const sens = 0.0022;
      P.yaw -= this.mouse.dx * sens;
      P.pitch = clamp(P.pitch - this.mouse.dy * sens * (this.settings.invertY ? -1 : 1), -1.45, 1.45);
      P.yaw = SH2.ai.wrapAngle(P.yaw);
      this.mouse.dx = 0; this.mouse.dy = 0;

      P.update(dt, { yaw: P.yaw, forward: fwd, strafe: str, sprint: inp.sprint, crouch: inp.crouch, ads: inp.ads }, this);

      // авто-огонь и восстановление полуавтомата
      if (this._semiLatch > 0) this._semiLatch -= dt;
      if (this.mouse.down && P.weapon.auto && this.locked) this.tryShoot();

      this.combat.update(dt);
      this.fx.update(dt);

      // бойцы
      const camPos = new (root.THREE.Vector3)(P.x, P.eyeHeight, P.z);
      const maxDist = 90;
      // ближайшие бойцы не проходят друг через друга: расталкиваем пары
      // (это же не даёт толпе слипнуться в одну точку у дверей и укрытий)
      this.separateEnemies(dt);
      for (const e of this.enemies) {
        const d = Math.hypot(e.x - P.x, e.z - P.z);
        e.setLod(d < 26 ? 0 : d < 48 ? 1 : 2);
        if (!e.alive && e.ragdoll && e.ragdoll.sleeping) continue;
        e.update(dt, this);
      }
      SH2.ai.commanderTick(this, dt);

      // стволы отлетевшего оружия
      for (let i = 0; i < this.flyingWeapons.length; i++) {
        SH2.ragdoll.Ragdoll.stepWeapon(this.flyingWeapons[i], dt);
      }

      // трупы чистятся по времени
      for (let i = this.deadBodies.length - 1; i >= 0; i--) {
        const b = this.deadBodies[i];
        const age = this.time - b.deathTime;
        if (b.ragdoll && !b.ragdoll.sleeping && b.ragdoll.totalSubsteps > 900) b.ragdoll.sleeping = true;
        if (age > 26) { b.dispose(this.scene); this.deadBodies.splice(i, 1); }
      }
      // убрать из enemies мёртвых без регдола (раз в 30 кадров, чтобы не мусорить)
      this.cleanupTimer = (this.cleanupTimer || 0) + 1;
      if (this.cleanupTimer > 30) {
        this.cleanupTimer = 0;
        this.enemies = this.enemies.filter((e) => e.alive || this.deadBodies.indexOf(e) >= 0);
      }

      // цели/миссии
      if (this.mission) {
        this.checkMissionProgress(dt);
      }

      // вспышка урона
      if (P.hitFlash > 0) P.hitFlash = Math.max(0, P.hitFlash - dt * 1.8);

      // опасность для звука
      const nearest = this.nearestAliveEnemy();
      const danger = nearest ? clamp(1 - Math.hypot(nearest.x - P.x, nearest.z - P.z) / 40, 0, 1) : 0;
      this.audio && this.audio.setDanger(danger);
      this.audio && this.audio.setListener(P.x, P.z, P.yaw);
      this.danger = danger;
      this.stats.shots = P.shots;
      this.stats.hits = P.hits;
      // обновление счётчиков
      this.aim = this.aimInfo();
      this.perf.counters.enemies = this.enemies.filter((e) => e.alive).length;
      this.perf.counters.particles = this.fx.counts.particles;
      this.perf.counters.animators = this.enemies.length + 1;
    }

    /* Что под прицелом: используется для подсветки врага и подсказок */
    aimInfo() {
      const P = this.player;
      if (!P.alive) return { enemy: null };
      const o = this.rayOrigin(), d = this.rayDirection();
      const maxT = 120;
      const wall = this.world.rayColliders(o.x, o.y, o.z, d.x, d.y, d.z, maxT);
      let bestT = wall ? wall.t : maxT;
      let enemy = null;
      for (const e of this.enemies) {
        if (!e.alive) continue;
        const t = SH2.world.rayCylinder(o.x, o.y, o.z, d.x, d.y, d.z, e.x, e.z,
          0.42 * e.cfg.scale, 0, 1.85 * e.cfg.scale, bestT);
        if (t !== null && t < bestT) { bestT = t; enemy = e; }
      }
      return { enemy, dist: bestT, blocked: !!wall };
    }

    /* расталкивание бойцов: парное отталкивание по кругу, без физики.
       Дальние пары отбрасываются по сетке, чтобы 20 бойцов стоили копейки. */
    separateEnemies(dt) {
      const list = this.enemies;
      const n = list.length;
      if (n < 2) return;
      const cell = 2.4;
      const buckets = this._sepBuckets || (this._sepBuckets = new Map());
      buckets.clear();
      for (let i = 0; i < n; i++) {
        const e = list[i];
        if (!e.alive) continue;
        const gx = Math.floor(e.x / cell), gz = Math.floor(e.z / cell);
        const key = gx + ':' + gz;
        let b = buckets.get(key);
        if (!b) { b = []; buckets.set(key, b); }
        b.push(e);
      }
      const push = 1.05;
      buckets.forEach((b, key) => {
        const [gxs, gzs] = key.split(':');
        const gx = Number(gxs), gz = Number(gzs);
        for (let ox = 0; ox <= 1; ox++) {
          for (let oz = -1; oz <= 1; oz++) {
            if (ox === 0 && oz < 0) continue;
            const other = ox === 0 && oz === 0 ? b : buckets.get((gx + ox) + ':' + (gz + oz));
            if (!other) continue;
            for (const a of b) {
              for (const c of other) {
                if (c === a) continue;
                // пару считаем один раз
                if (other === b && c.uid < a.uid) continue;
                const dx = c.x - a.x, dz = c.z - a.z;
                const rr = (a.radius || 0.38) + (c.radius || 0.38);
                const d2 = dx * dx + dz * dz;
                if (d2 > rr * rr || d2 < 1e-9) continue;
                const d = Math.sqrt(d2);
                const overlap = (rr - d) * 0.5 * Math.min(1, dt * 18);
                const nx = dx / d, nz = dz / d;
                a.x -= nx * overlap; a.z -= nz * overlap;
                c.x += nx * overlap; c.z += nz * overlap;
              }
            }
          }
        }
      });
      void push;
    }

    nearestAliveEnemy() {
      let best = null, bd = 1e9;
      for (const e of this.enemies) {
        if (!e.alive) continue;
        const d = Math.hypot(e.x - this.player.x, e.z - this.player.z);
        if (d < bd) { bd = d; best = e; }
      }
      return best;
    }

    checkMissionProgress(dt) {
      const m = this.mission, P = this.player;
      if (m.type === 'survive') {
        const alive = this.enemies.filter((e) => e.alive).length;
        if (alive === 0 && this.waveIndex < this.waves.length - 1 && this.missionTimer > 1) {
          this.waveIndex++;
          this.spawnWave(this.waveIndex);
        }
        // чтобы коридор не пустовал, подбрасываем по одному бойцу
        this.reinforceTimer = (this.reinforceTimer || 0) - dt;
        if (alive < 2 && this.missionTimer < m.time && this.reinforceTimer <= 0) {
          this.reinforceTimer = 6;
          this.spawnWave(this.waveIndex);
        }
      } else if (m.type === 'destroy') {
        // ящики взрываются от пуль/гранат — проверяем здесь
        this.objectives.forEach((o) => {
          if (o.mesh && !o.done) {
            // подсветка
            o.mesh.userData.glow.rotation.y += dt * 1.4;
            o.mesh.userData.glow.position.y = 1.85 + Math.sin(this.time * 2) * 0.08;
          }
        });
      } else if (m.type === 'extract') {
        const killObj = this.objectives.find((o) => o.id === 'kill');
        if (killObj) killObj.current = Math.min(this.kills, killObj.max);
      } else if (m.type === 'eliminate' || m.type === 'boss') {
        const alive = this.enemies.filter((e) => e.alive).length;
        if (alive === 0) {
          const killObj = this.objectives.find((o) => o.id === 'kill');
          if (killObj) { killObj.current = killObj.max; killObj.done = true; }
        }
      }
      this.checkObjectives();
    }

    /* объект-ящик получил урон от взрыва/пуль */
    damageObjective(x, z, damage) {
      if (!this.mission || this.mission.type !== 'destroy') return;
      this.objectives.forEach((o) => {
        if (!o.mesh || o.done) return;
        if (Math.hypot(o.x - x, o.z - z) < 3.2) {
          o.hp = (o.hp === undefined ? 55 : o.hp) - damage;
          if (o.hp <= 0) {
            o.done = true; o.current = 1;
            this.fx.explosion(new (root.THREE.Vector3)(o.x, 0.6, o.z), 7);
            this.scene.remove(o.mesh);
            this.shake(0.6);
            this.audio && this.audio.objective();
            this.ui && this.ui.toast('Груз уничтожен');
            this.damagePlayer(Math.max(0, 40 - Math.hypot(this.player.x - o.x, this.player.z - o.z) * 4), null, 'explosion');
          }
        }
      });
    }

    /* ----------------------------- рендер -------------------------------- */
    render(dt) {
      const T = root.THREE;
      const P = this.player;
      const cam = this.camera;

      if (this.state === 'playing' || this.state === 'paused' || this.state === 'dead' || this.state === 'won') {
        // тряска
        this.shakeTime = Math.max(0, (this.shakeTime || 0) - dt);
        this.shakeAmount *= Math.exp(-dt * 9);
        const sh = this.shakeAmount;
        const shx = (Math.random() - 0.5) * sh * 0.16;
        const shy = (Math.random() - 0.5) * sh * 0.16;
        const pitch = P.pitch;
        cam.position.set(P.x + (P.camBobSide || 0), (P.eyeHeight + (P.camBob || 0)) + shy, P.z);
        cam.rotation.order = 'YXZ';
        cam.rotation.set(pitch + shx + (P.recoilPitch || 0) * 0.25,
          P.yaw + Math.PI + (P.recoilYaw || 0) * 0.25,
          P.roll + (Math.random() - 0.5) * sh * 0.02);
        if (P.alive === false) {
          // падение камеры
          cam.position.y = lerp(1.62, 0.35, Math.min(1, P.deathAnim * 1.4));
          cam.rotation.z = lerp(0, 1.15, Math.min(1, P.deathAnim));
          P.pitch = lerp(P.pitch, -0.55, Math.min(1, P.deathAnim));
        }
        if (Math.abs(cam.fov - P.fov) > 0.05) {
          cam.fov = P.fov;
          cam.updateProjectionMatrix();
        }
        // оружие от первого лица
        const moving = Math.min(1, Math.hypot(P.vx, P.vz) / 5);
        this.viewmodel.update(dt, {
          moving, sprint: P.sprint, ads: P.ads,
          hidden: P.alive === false
        });
        // солнце следует за игроком, чтобы тени не «засыхали» на краю
        if (this.level) {
          const sun = this.level.sun;
          sun.position.set(P.x + this.level.map.sunPos[0] * 0.35, this.level.map.sunPos[1], P.z + this.level.map.sunPos[2] * 0.35);
          sun.target.position.set(P.x, 0, P.z);
          sun.target.updateMatrixWorld();
        }
      }
      // два прохода: мир (слой 0) и оружие от первого лица (слой 1).
      // Оружие рисуется поверх и не проваливается в стены и в прицел.
      this.camera.layers.set(0);
      this.renderer.render(this.scene, this.camera);
      if (this.renderer.clearDepth) this.renderer.clearDepth();
      this.camera.layers.set(1);
      this.renderer.render(this.scene, this.camera);
      this.camera.layers.set(0);
    }

    /* ----------------------------- утилиты ------------------------------- */
    aimEnemyAt(screenX, screenY) { return null; }

    setQuality(name) {
      this.settings.quality = name;
      if (this.level) this.perf.setPreset(name, this.renderer, this.level.sun, this.scene);
      this.ui && this.ui.toast('Качество: ' + (SH2.perf.PRESETS[name] || {}).label);
    }
  }

  SH2.game = { Game, Player, Combat };
})(typeof window !== 'undefined' ? window : globalThis);
