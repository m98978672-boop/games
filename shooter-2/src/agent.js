/* =============================================================================
   СЕКТОР «ПЕПЕЛ» — бойцы (враги и союзный «наблюдатель»), стрельба, эффекты
   -----------------------------------------------------------------------------
   Один и тот же класс описывает боевика: риг, аниматор, мозг, регдол.
   Уровень детализации выбирается автоматически: ближние — полный риг с
   тенями, дальние — LOD-риг без теней, анимация раз в 2–3 кадра.
   ============================================================================= */
(function (root) {
  'use strict';
  const SH2 = (root.SH2 = root.SH2 || {});
  const D = SH2.data;
  const THREE = () => root.THREE;

  let nextId = 1;

  class Agent {
    constructor(game, type, spawn, opts) {
      const T = THREE();
      const o = opts || {};
      const cfg = D.ENEMY_BY_ID[type] || D.ENEMY_BY_ID.grunt;
      this.game = game;
      this.id = 'e' + (nextId++);
      this.type = type;
      this.cfg = cfg;
      this.x = spawn.x; this.z = spawn.z;
      this.y = 0;
      this.vx = 0; this.vz = 0;
      this.yaw = spawn.yaw === undefined ? Math.random() * Math.PI * 2 : spawn.yaw;
      this.aimPitch = 0;
      this.maxHp = cfg.hp;
      this.hp = cfg.hp;
      this.armor = cfg.armor;
      this.alive = true;
      this.crouch = false;
      this.sprint = false;
      this.eyeY = 1.55 * cfg.scale;
      this.weaponCfg = D.WEAPON_BY_ID[cfg.weapon];
      this.ammo = this.weaponCfg.mag;
      this.reloading = false;
      this.reloadTimer = 0;
      this.grenades = cfg.tactics.indexOf('grenade') >= 0 ? 1 : 0;
      this.underFire = false;
      this.targetable = true;

      // визуал
      this.rig = SH2.model.buildRig(type, { scale: cfg.scale });
      this.weaponMesh = SH2.model.buildWeaponModel(cfg.weapon, {});
      this.weaponMesh.scale.setScalar(1.22);
      this.rig.weaponSlot.add(this.weaponMesh);
      this.rig.setGrips(cfg.weapon);
      this.ik = new SH2.ik.ArmIK(this.rig);
      this.rig.weaponId = cfg.weapon;
      this.muzzleLocal = this.weaponMesh.userData.muzzle;
      this.rig.root.position.set(this.x, 0, this.z);
      this.rig.root.rotation.y = this.yaw;
      game.scene.add(this.rig.root);

      this.animator = new SH2.anim.Animator(this.rig, { variant: 0, smooth: 12, updateEvery: 1 });
      this.brain = new SH2.ai.EnemyBrain(this, { seed: nextId * 7.3 });
      this.ragdoll = null;
      this.hitFlash = 0;
      this.animState = 'idle';
      this.upperState = 'aim';
      this.lod = 0;
      this.lodTimer = 0;
      this.deathTime = 0;
      this.lastFootstep = 0;
      this.radioCooldown = 0;
      this.hurtFlash = 0;
      this.meleeCool = 0;
      this.heardCommand = null;

      // «вариативность» бойца: у каждого свой вариант анимации
      const odds = [0.42, 0.26, 0.12, 0.20];
      let r = Math.random(), acc = 0, v = 0;
      for (let i = 0; i < odds.length; i++) { acc += odds[i]; if (r <= acc) { v = i; break; } }
      this.variant = v;
      this.animator.setVariant(v);
    }

    get health() { return this.hp / this.maxHp; }

    /* ------------------------------ движение ---------------------------- */
    move(mx, mz, game, dt, mode) {
      if (!this.alive) return;
      const m = mode || {};
      const cfg = this.cfg;
      this.crouch = !!m.crouch;
      const speedMul = this.crouch ? 0.45 : (m.sprint ? 1 : 0.9);
      const accel = 14;
      this.vx += (mx - this.vx) * Math.min(1, accel * dt);
      this.vz += (mz - this.vz) * Math.min(1, accel * dt);
      const px = this.x, pz = this.z;
      this.x += this.vx * dt * speedMul;
      this.z += this.vz * dt * speedMul;
      const pos = { x: this.x, z: this.z };
      game.world.resolveCircle(pos, 0.38 * cfg.scale);
      this.x = pos.x; this.z = pos.z;

      const moved = Math.hypot(this.x - px, this.z - pz);
      const speed = moved / Math.max(0.0001, dt);

      // шаги (звук + «шум» для других бойцов)
      if (speed > 1.2 && game.time - this.lastFootstep > (m.sprint ? 0.30 : 0.48)) {
        this.lastFootstep = game.time;
        game.audio && game.audio.footstep(this.x, this.z, m.sprint ? 0.5 : 0.3);
      }
      this.rig.root.position.set(this.x, this.y, this.z);
      this.rig.root.rotation.y = this.yaw;
      this.speed = speed;
      this._applyPose(speed, dt, game);
    }

    _applyPose(speed, dt, game) {
      const A = this.animator;
      let base = 'idle', upper = 'aim';
      if (this.crouch) base = speed > 0.35 ? 'crouch' : 'crouch';
      else if (speed > 0.3) {
        // локальное направление движения относительно взгляда
        const fwdX = Math.sin(this.yaw), fwdZ = Math.cos(this.yaw);
        const dot = (this.vx * fwdX + this.vz * fwdZ) / Math.max(0.001, speed);
        const right = (this.vx * fwdZ - this.vz * fwdX) / Math.max(0.001, speed);
        if (speed > this.cfg.speed * 1.25) base = 'run';
        else if (dot > 0.55) base = 'walk';
        else if (dot < -0.55) base = 'walkBack';
        else base = right > 0 ? 'strafeR' : 'strafeL';
      } else if (this.brain && this.brain.tactic === 'melee' && this.brain.meleeWish > 0) {
        A.setEvent('melee', { fade: 26 });
        base = 'idle';
      }
      if (this.hurtFlash > 0) {
        this.hurtFlash -= dt;
        A.setEvent('hurt', { fade: 22, weight: 0.85 });
      }
      if (this.reloading) upper = 'reload';
      else if (this.brain && this.brain.seenNow) upper = 'aim';
      else upper = 'idle';

      if (A.currentClip !== base) A.setBase(base, { fade: 10 });
      A.setUpper(upper, { fade: 8, weight: upper === 'idle' ? 0.55 : 1 });
      this.animState = base;
      this.upperState = upper;
      this.animator.update(dt);
      // стопы на полу: при прыжке/падении подстройка отключена
      const lockK = (base === 'jump' || base === 'fall' || base === 'die') ? 0 : 1;
      if (this.ragdoll === null && lockK) SH2.anim.groundLock(this.rig, this.animator, lockK);
      // прикладка и хват: оружие поднимается к линии глаз при прицеливании
      // дальним бойцам IK не считаем: их руки всё равно не разглядеть
      if (this.lod < 2) {
        const aimUp = this.brain && this.brain.seenNow ? 0.75 : 0.30;
        this.ik.update({ raise: aimUp, tilt: -this.aimPitch * 0.75 });
      }
    }

    /* ------------------------------ стрельба ---------------------------- */
    tryShoot(game, spread, pitch) {
      if (!this.alive || this.reloading || this.ammo <= 0) return;
      const w = this.weaponCfg;
      this.ammo--;
      const upKey = 'shoot';
      this.animator.setEvent(upKey, { fade: 30, weight: 0.9, restart: true });
      if (game.audio) game.audio.gunshot(w.sound, this.x, this.z, 0.85);
      // дуло
      const muzzle = new (THREE().Vector3)();
      if (this.muzzleLocal) this.muzzleLocal.getWorldPosition(muzzle); else muzzle.set(this.x, this.eyeY, this.z);
      game.fx.muzzleFlash(muzzle, 0.7);
      const dir = new (THREE().Vector3)(
        Math.sin(this.yaw) * Math.cos(pitch),
        Math.sin(pitch),
        Math.cos(this.yaw) * Math.cos(pitch)
      );
      // случайный разброс
      const sx = (Math.random() - 0.5) * spread * 2;
      const sy = (Math.random() - 0.5) * spread * 2;
      dir.x += Math.cos(this.yaw) * sx + Math.cos(this.yaw) * -sy * 0.2;
      dir.z += -Math.sin(this.yaw) * sx;
      dir.y += sy;
      dir.normalize();
      game.combat.enemyBullet(this, muzzle, dir, w);
      if (this.ammo <= 0) this.startReload(game);
    }

    startReload(game) {
      if (this.reloading) return;
      this.reloading = true;
      this.reloadTimer = this.weaponCfg.reload * (0.9 + Math.random() * 0.3);
      this.animator.setEvent('reload', { fade: 6, weight: 0.9, restart: true });
      if (game.audio) game.audio.reload(this.x, this.z);
    }

    throwGrenade(game, target) {
      if (!this.alive) return;
      this.animator.setEvent('throw', { fade: 8, weight: 1, restart: true });
      game.combat.grenade(this, target);
      if (game.audio) game.audio.throwGrenade(this.x, this.z);
    }

    melee(game) {
      if (!this.alive || this.meleeCool > 0) return;
      this.meleeCool = 1.1;
      this.animator.setEvent('melee', { fade: 14, weight: 1, restart: true });
      const P = game.player;
      if (Math.hypot(P.x - this.x, P.z - this.z) < 2.6) game.damagePlayer(14 + Math.random() * 8, this, 'melee');
      if (game.audio) game.audio.melee(this.x, this.z);
    }

    /* ------------------------------ урон -------------------------------- */
    hit(amount, game, info) {
      if (!this.alive) return { killed: false, damage: 0 };
      const i = info || {};
      let dmg = amount;
      if (this.armor > 0) {
        const absorbed = Math.min(this.armor, dmg * 0.45);
        this.armor -= absorbed;
        dmg -= absorbed;
      }
      this.hp -= dmg;
      this.hurtFlash = 0.36;
      this.underFire = true;
      this.alert = 1;
      if (this.brain) {
        this.brain.alert = 1;
        this.brain.reactionLeft = Math.min(this.brain.reactionLeft, this.cfg.reaction * 0.4);
        if (!this.brain.seenNow) this.brain.memory = { x: game.player.x, z: game.player.z, t: game.time };
      }
      // отталкивание
      if (i.dir) {
        this.vx += i.dir.x * (i.force || 1.2);
        this.vz += i.dir.z * (i.force || 1.2);
      }
      if (this.hp <= 0) { this.die(game, i); return { killed: true, damage: amount }; }
      return { killed: false, damage: amount };
    }

    die(game, info) {
      this.alive = false;
      this.deathTime = game.time;
      this.animator.setEvent('die', { fade: 5, weight: 1, restart: true });
      // регдол захватывает позу и получает импульс от пули
      if (game.settings.ragdoll) {
        this.ragdoll = new SH2.ragdoll.Ragdoll(this.rig);
        const vel = new (THREE().Vector3)(this.vx * 0.5, 0, this.vz * 0.5);
        this.ragdoll.capture(vel);
        const i = info || {};
        if (i.hitPoint) {
          const p = i.hitPoint;
          let bestPt = null, bestD = 1e9;
          this.ragdoll.points.forEach((pt) => {
            const d = pt.pos.distanceToSquared(p);
            if (d < bestD) { bestD = d; bestPt = pt; }
          });
          if (bestPt) this.ragdoll.impulse(bestPt.name, i.dir || new (THREE().Vector3)(0, 0, 1), (i.force || 3.5) * 1.8);
        }
      } else {
        this.animator.setBase('die', { fade: 2 });
      }
      game.onEnemyKilled(this, info || {});
    }

    /* ------------------------------ кадр -------------------------------- */
    update(dt, game) {
      // регдол после смерти
      if (!this.alive) {
        if (this.ragdoll) this.ragdoll.update(dt, game.world.colliders);
        else this.animator.update(dt);
        return;
      }
      if (this.hurtFlash > 0) this.hurtFlash -= dt;
      if (this.meleeCool > 0) this.meleeCool -= dt;
      if (this.radioCooldown > 0) this.radioCooldown -= dt;
      if (this.heardCommand) { this.heardCommand.t -= dt; if (this.heardCommand.t <= 0) this.heardCommand = null; }
      if (this.underFire && Math.random() < dt * 0.5) this.underFire = false;

      this.eyeY = (this.crouch ? 1.05 : 1.55) * this.cfg.scale;
      if (this.reloading) {
        this.reloadTimer -= dt;
        if (this.reloadTimer <= 0) {
          this.reloading = false;
          this.ammo = this.weaponCfg.mag;
        }
      }
      this.brain.update(game, dt);
    }

    setLod(level) {
      if (level === this.lod) return;
      this.lod = level;
      this.animator.updateEvery = level === 0 ? 1 : level === 1 ? 2 : 3;
      if (this.rig.root) {
        this.rig.meshes.forEach((m) => {
          m.castShadow = level === 0;
          m.receiveShadow = level === 0;
        });
      }
    }

    dispose(scene) {
      scene.remove(this.rig.root);
    }
  }

  SH2.agent = { Agent };
})(typeof window !== 'undefined' ? window : globalThis);
