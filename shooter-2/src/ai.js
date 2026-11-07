/* =============================================================================
   СЕКТОР «ПЕПЕЛ» — ИИ боевиков: «больно думать»
   -----------------------------------------------------------------------------
   Боец думает не каждый кадр, а тиками (thinkTime + штраф за столько мыслей
   подряд). Каждый тик он оценивает варианты:
       advance / hold / cover / flank / suppress / retreat / grenade / melee
   у каждого варианта — счёт из дистанции, здоровья, укрытия, линии огня,
   приказов командира и собственного «качества мышления».
   Чем ниже thinkQuality, тем больше боец ошибается и позже реагирует:
   именно из-за этого он «больно думает» и проигрывает умному игроку.

   Реакция на игрока: не мгновенная, а после reaction-задержки; точность
   зависит от дистанции, движения, прицеливания и варианта анимации (ранив).
   ============================================================================= */
(function (root) {
  'use strict';
  const SH2 = (root.SH2 = root.SH2 || {});
  const D = SH2.data;

  const TACTICS = ['advance', 'hold', 'cover', 'flank', 'suppress', 'retreat', 'grenade', 'melee'];

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function angleTo(ax, az, bx, bz) { return Math.atan2(bx - ax, bz - az); }
  function wrapAngle(a) { while (a > Math.PI) a -= Math.PI * 2; while (a < -Math.PI) a += Math.PI * 2; return a; }

  class EnemyBrain {
    constructor(agent, opts) {
      const o = opts || {};
      this.agent = agent;
      this.rng = D.rng(D.hash(agent.id + agent.type + '|' + (o.seed || 1)));
      this.cfg = D.ENEMY_BY_ID[agent.type];
      this.state = 'patrol';
      this.tactic = 'hold';
      this.thinkTimer = this.rng() * this.cfg.thinkTime;
      this.thinkCount = 0;
      this.alert = 0;              // 0..1 — насколько уверен, что видел игрока
      this.memory = null;          // {x,z,t} последняя известная позиция
      this.reactionLeft = 0;
      this.aimTime = 0;
      this.burstLeft = 0;
      this.burstCool = 0;
      this.coverPoint = null;
      this.coverTimer = 0;
      this.patrolTarget = null;
      this.flankSide = this.rng() > 0.5 ? 1 : -1;
      this.lastSeen = 0;
      this.thought = '';
      this.thoughtTimer = 0;
      this.order = null;           // приказ командира {tactic, x, z, t}
      this.stuck = 0;
      this.lastPos = { x: agent.x, z: agent.z };
      this.suppressTarget = null;
      this.pendingGrenade = 0;
      this.meleeWish = 0;
      this.debug = o.debug;
    }

    /* --------------------------- восприятие ---------------------------- */
    perceive(game, dt) {
      const a = this.agent;
      if (!a.alive) return;
      const P = game.player;
      const dx = P.x - a.x, dz = P.z - a.z;
      const dist = Math.hypot(dx, dz);
      this.distToPlayer = dist;
      const eyeY = a.eyeY;
      const canSee = dist < 90 &&
        game.world.hasLOS(a.x, eyeY, a.z, P.x, P.y + 1.35, P.z) &&
        (!P.crouch || dist < 40);
      if (canSee) {
        // угол зрения: боец не видит за спиной мгновенно
        const toPlayer = Math.atan2(dx, dz);
        const facing = wrapAngle(a.yaw);
        const inFov = Math.abs(wrapAngle(toPlayer - facing)) < (this.alert > 0.4 ? 2.5 : 1.15);
        if (inFov || dist < 6) {
          this.seenNow = true;
          this.lastSeen = game.time;
          this.memory = { x: P.x, z: P.z, t: game.time };
          this.alert = Math.min(1, this.alert + dt * (2.2 + this.cfg.thinkQuality));
          if (this.reactionLeft <= 0 && this.state !== 'combat') {
            this.reactionLeft = this.cfg.reaction;
            a.onNotice && a.onNotice(game);
          }
        } else {
          this.seenNow = false;
          this.alert = Math.max(0, this.alert - dt * 0.5);
        }
      } else {
        this.seenNow = false;
        this.alert = Math.max(0, this.alert - dt * 0.35);
        if (this.memory && game.time - this.memory.t > 8) this.memory = null;
      }
      if (this.reactionLeft > 0) this.reactionLeft -= dt;
    }

    /* ----------------------------- мышление ---------------------------- */
    think(game) {
      const a = this.agent, cfg = this.cfg;
      const P = game.player;
      const dist = this.distToPlayer || 999;
      this.thinkCount++;
      // «больно думать»: каждая следующая мысль подряд медленнее
      const fatigue = 1 + Math.min(1.6, this.thinkCount * 0.05);
      const thinkDelay = cfg.thinkTime * fatigue * (0.75 + this.rng() * 0.5 - game.difficulty * 0.08);
      this.thinkTimer = Math.max(0.18, thinkDelay);

      const hpFrac = a.hp / a.maxHp;
      // «больно»: свежая рана на время сбивает прицел и решения
      if (this.pain > 0) this.pain = Math.max(0, this.pain - 0.08);
      const hasLOS = this.seenNow;
      const cover = this.coverPoint;
      const nearCover = game.world.findCover(a.x, a.z, P.x, P.z, 12);
      const inPrefRange = dist > cfg.preferRange[0] && dist < cfg.preferRange[1];
      const tooClose = dist < cfg.preferRange[0] * 0.7;
      const tooFar = dist > cfg.preferRange[1] * 1.25;

      const scores = {};
      // Продвижение
      scores.advance = 0.35 + cfg.aggression * 0.9 + (tooFar ? 0.7 : 0) + (a.ammo > 0 ? 0.3 : -0.8)
        - (hpFrac < 0.4 ? 1.2 : 0) - (hasLOS ? 0.15 : 0.25);
      // Держать позицию
      scores.hold = 0.4 + (inPrefRange ? 1.0 : 0) + (hasLOS ? 0.5 : 0) + (1 - cfg.aggression) * 0.6
        + (hpFrac > 0.6 ? 0.2 : -0.1);
      // Укрытие
      scores.cover = (this.pain > 0.3 ? 0.9 : 0) + (nearCover ? 0.9 : -0.4) + (hpFrac < 0.55 ? 1.0 : 0.2) + (hasLOS ? 0.15 : 0.6)
        + (a.underFire ? 1.1 : 0);
      // Обход с фланга
      scores.flank = 0.2 + cfg.aggression * 0.5 + (inPrefRange ? 0.5 : 0) + (hasLOS ? 0.25 : 0.8)
        - (hpFrac < 0.35 ? 0.9 : 0) + (this.flankSideShouldHelp ? 0.4 : 0);
      // Подавление
      scores.suppress = (hasLOS ? 0.7 : -0.3) + (a.ammo > 12 ? 0.5 : -1.4) + (dist > 12 ? 0.5 : 0)
        + cfg.aggression * 0.3;
      // Отход
      scores.retreat = (this.pain > 0.6 && hpFrac < 0.7 ? 1.4 : 0) + (hpFrac < 0.35 ? 2.2 : -1.3) + (a.ammo === 0 ? 0.9 : 0) + (this.alert > 0.7 ? -0.2 : 0.2);
      // Граната
      scores.grenade = (dist > 9 && dist < 30 ? 0.8 : -1.5) + (a.grenades > 0 ? 0.8 : -3)
        + (hasLOS ? -0.2 : 0.9) + (cfg.tactics.indexOf('grenade') >= 0 ? 0.7 : 0);
      // Ближний бой
      scores.melee = (dist < 4 ? 2.0 : -2) + cfg.aggression * 0.5 + (a.ammo === 0 ? 1.2 : 0);

      // приказ командира
      if (this.order && game.time - this.order.t < 6) {
        scores[this.order.tactic] = (scores[this.order.tactic] || 0) + 1.8;
      }

      // «качество мышления»: плохой мыслитель иногда выбирает случайный вариант
      if (this.rng() > cfg.thinkQuality) {
        const pick = cfg.tactics[Math.floor(this.rng() * cfg.tactics.length)] || 'hold';
        scores[pick] = (scores[pick] || 0) + 0.6;
      }

      let best = 'hold', bestScore = -1e9;
      for (const t of TACTICS) {
        let s = scores[t] !== undefined ? scores[t] : -2;
        s += (this.rng() - 0.5) * (1 - cfg.thinkQuality) * 0.9;
        if (s > bestScore) { bestScore = s; best = t; }
      }
      this.tactic = best;
      this.state = this.alert > 0.25 || this.seenNow ? 'combat' : (this.memory ? 'search' : 'patrol');
      this.scores = scores;

      // Реакции на выбор
      if (best === 'cover' || best === 'hold') {
        this.coverTimer -= 1;
        if (!this.coverPoint || this.coverTimer <= 0) {
          this.coverPoint = nearCover || game.world.randomOpenPoint(a.x, a.z, 3, 9, this.rng);
          this.coverTimer = 2 + Math.floor(this.rng() * 3);
        }
      }
      if (best === 'flank') {
        this.flankSide = this.rng() > 0.5 ? 1 : -1;
        const ang = Math.atan2(P.z - a.z, P.x - a.x) + this.flankSide * (1.1 + this.rng() * 0.5);
        const r = clamp(dist * (0.7 + this.rng() * 0.5), 8, 34);
        const tx = P.x - Math.cos(ang) * r, tz = P.z - Math.sin(ang) * r;
        const pt = game.world.randomOpenPoint(tx, tz, 1, 7, this.rng);
        this.flankTarget = pt || { x: tx, z: tz };
      }
      if (best === 'retreat') {
        const away = game.world.randomOpenPoint(a.x - (P.x - a.x), a.z - (P.z - a.z), 4, 12, this.rng);
        this.coverPoint = away;
        this.retreating = 1.6;
      } else this.retreating = 0;
      if (best === 'advance') {
        const pt = game.world.randomOpenPoint(P.x, P.z, 6, 14, this.rng);
        this.advanceTarget = pt;
      }
      if (best === 'suppress') this.suppressTarget = { x: this.memory ? this.memory.x : P.x, z: this.memory ? this.memory.z : P.z };

      // «мысли» для HUD
      if (this.rng() > 0.55) {
        this.thought = D.THOUGHTS[Math.floor(this.rng() * D.THOUGHTS.length)];
        this.thoughtTimer = 2.6;
      }
      this.thinkCount = Math.max(0, this.thinkCount - 0.15);
    }

    /* ----------------------------- движение ---------------------------- */
    update(game, dt) {
      const a = this.agent;
      if (!a.alive) return;
      this.perceive(game, dt);
      if (this.thoughtTimer > 0) this.thoughtTimer -= dt;

      this.thinkTimer -= dt;
      if (this.thinkTimer <= 0) this.think(game);

      const P = game.player;
      const cfg = this.cfg;
      let moveX = 0, moveZ = 0, wantCrouch = false, wantSprint = false, wantShoot = false, aimPitch = 0;

      const target = this.pickTarget(game);
      if (target) {
        const w = game.world.steer(a.x, a.z, target.x, target.z, 0.42);
        const spd = this.state === 'combat' && this.tactic === 'advance' ? cfg.sprint * 0.72
          : this.state === 'patrol' ? cfg.speed * 0.55 : cfg.speed;
        moveX = w.x * spd;
        moveZ = w.z * spd;
        if (w.reached) this.coverPoint = null;
      }
      if (this.tactic === 'retreat' || this.retreating > 0) {
        // отходим спиной к игроку — не поворачиваясь
        wantSprint = true;
        if (this.retreating > 0) this.retreating -= dt;
      }
      if (this.tactic === 'cover' && this.coverPoint && Math.hypot(this.coverPoint.x - a.x, this.coverPoint.z - a.z) < 1.2) {
        wantCrouch = true;
      }
      if (this.tactic === 'hold' && this.distToPlayer < 16 && this.distToPlayer > 5) wantCrouch = true;

      /* ------- стрельба: решение принимается тоже «с трудом» --------- */
      const canShoot = this.seenNow && this.reactionLeft <= 0 && a.ammo > 0 && !a.reloading;
      if (canShoot) {
        this.aimTime += dt;
        const wantBurst = this.tactic === 'suppress' || this.tactic === 'advance' || this.tactic === 'hold' || this.tactic === 'flank';
        if (this.burstLeft > 0) {
          if (this.burstCool <= 0) { a.tryShoot(game, this.shotSpread(game), this.shotPitch(game)); this.burstLeft--; this.burstCool = 60 / D.WEAPON_BY_ID[cfg.weapon].rpm; }
          else this.burstCool -= dt;
        } else if (this.aimTime > 0.25) {
          const burst = wantBurst ? 2 + Math.floor(this.rng() * 4) : 1;
          this.burstLeft = burst;
          this.aimTime = 0;
        }
      } else if (!this.seenNow) {
        this.aimTime = 0;
        // подавление по памяти: стреляем в последнюю точку
        if (this.tactic === 'suppress' && this.memory && game.time - this.memory.t < 5 && a.ammo > 0) {
          a.tryShoot(game, 0.09, 0.02);
        }
      }
      if (a.ammo <= 0 && !a.reloading) a.startReload(game);

      // поворот корпуса к цели/игроку
      let faceX = P.x, faceZ = P.z;
      if (!this.seenNow && this.memory) { faceX = this.memory.x; faceZ = this.memory.z; }
      else if (!this.seenNow && target) { faceX = target.x; faceZ = target.z; }
      if (this.state === 'patrol' && target) { faceX = target.x; faceZ = target.z; }
      const wantYaw = angleTo(a.x, a.z, faceX, faceZ);
      let d = wrapAngle(wantYaw - a.yaw);
      const turnRate = (this.state === 'combat' ? 5.2 : 2.2) * (this.retreating > 0 ? 0.5 : 1);
      a.yaw += clamp(d, -turnRate * dt, turnRate * dt);
      a.yaw = wrapAngle(a.yaw);

      // прицел по вертикали
      if (this.seenNow) {
        const dyP = (P.y + (P.crouch ? 1.0 : 1.35)) - a.eyeY;
        aimPitch = Math.atan2(dyP, Math.max(1, this.distToPlayer));
      } else aimPitch = 0;
      a.aimPitch = aimPitch;

      a.move(moveX, moveZ, game, dt, { crouch: wantCrouch, sprint: wantSprint });

      // гранаты
      if (this.tactic === 'grenade' && a.grenades > 0 && this.seenNow && this.pendingGrenade <= 0 && this.rng() > 0.4) {
        this.pendingGrenade = 0.9;
        a.throwGrenade(game, this.memory || { x: P.x, z: P.z });
        a.grenades--;
      }
      if (this.pendingGrenade > 0) this.pendingGrenade -= dt;
      // ближний бой
      if (this.tactic === 'melee' && this.distToPlayer < 2.4) {
        this.meleeWish = 0.7;
        a.melee(game);
      }
      if (this.meleeWish > 0) this.meleeWish -= dt;

      // прилипание к стенам
      const moved = Math.hypot(a.x - this.lastPos.x, a.z - this.lastPos.z);
      if ((moveX || moveZ) && moved < 0.008) this.stuck += dt; else this.stuck = Math.max(0, this.stuck - dt);
      if (this.stuck > 0.7) {
        this.coverPoint = game.world.randomOpenPoint(a.x, a.z, 3, 10, this.rng);
        this.patrolTarget = null;
        this.stuck = 0;
      }
      this.lastPos.x = a.x; this.lastPos.z = a.z;
    }

    pickTarget(game) {
      const a = this.agent, P = game.player;
      if (this.state === 'combat') {
        if (this.tactic === 'flank' && this.flankTarget) return this.flankTarget;
        if ((this.tactic === 'cover' || this.tactic === 'hold' || this.tactic === 'retreat' || this.tactic === 'suppress') && this.coverPoint) return this.coverPoint;
        if (this.tactic === 'advance') {
          if (!this.advanceTarget || Math.hypot(this.advanceTarget.x - a.x, this.advanceTarget.z - a.z) < 2) {
            this.advanceTarget = game.world.randomOpenPoint(P.x, P.z, 5, 12, this.rng);
          }
          return this.advanceTarget;
        }
        if (this.tactic === 'hold' || this.tactic === 'melee') return null;
      }
      if (this.state === 'search' && this.memory) {
        // идём к последней позиции игрока, петляя
        return { x: this.memory.x + Math.sin(game.time * 0.7 + this.rng() * 6) * 3,
          z: this.memory.z + Math.cos(game.time * 0.6 + this.rng() * 6) * 3 };
      }
      // патруль
      if (!this.patrolTarget || Math.hypot(this.patrolTarget.x - a.x, this.patrolTarget.z - a.z) < 1.5) {
        this.patrolTarget = game.world.randomOpenPoint(a.x, a.z, 6, 20, this.rng);
      }
      return this.patrolTarget;
    }

    /* Промах не случайный: учитываем дистанцию, движение, бег и качество мысли */
    shotSpread(game) {
      const a = this.agent, cfg = this.cfg, P = game.player;
      const base = D.WEAPON_BY_ID[cfg.weapon].spread;
      const dist = this.distToPlayer;
      const distFactor = 0.55 + dist / 26;
      const moveFactor = 1 + (Math.hypot(a.vx, a.vz) / Math.max(1, cfg.speed)) * 1.3;
      const playerMove = 1 + Math.min(1.6, Math.hypot(P.vx, P.vz) / 5);
      const skill = 1 / Math.max(0.25, cfg.accuracy);
      const hurt = (1 - a.hp / a.maxHp) * 0.8 + (this.pain || 0) * 0.9;
      const alertness = 1 + (1 - this.alert) * 1.4;
      return base * distFactor * moveFactor * playerMove * skill * (1 + hurt) * alertness * (0.6 + game.difficulty * 0.3);
    }

    shotPitch(game) {
      const a = this.agent, P = game.player;
      const dy = (P.y + (P.crouch ? 0.95 : 1.3)) - a.eyeY;
      return Math.atan2(dy, Math.max(1, this.distToPlayer)) + (this.rng() - 0.5) * 0.05;
    }

    // Приказ от командира
    receiveOrder(tactic, x, z, time) {
      this.order = { tactic, x, z, t: time };
      this.thinkTimer = Math.min(this.thinkTimer, 0.2);
    }
  }

  /* --------------------- командир раздаёт приказы ---------------------- */
  function commanderTick(game, dt) {
    game.commanderTimer = (game.commanderTimer || 0) - dt;
    if (game.commanderTimer > 0) return;
    game.commanderTimer = 3.4;
    const leaders = game.enemies.filter((e) => e.alive && (e.type === 'officer' || e.type === 'boss'));
    if (!leaders.length) return;
    const followers = game.enemies.filter((e) => e.alive && e.brain && e.brain.agent !== leaders[0]);
    leaders.forEach((L) => {
      if (!L.brain || L.brain.state !== 'combat') return;
      const tactic = L.type === 'boss' ? (Math.random() > 0.5 ? 'flank' : 'suppress') : (Math.random() > 0.5 ? 'flank' : 'advance');
      followers.forEach((f) => {
        if (!f.brain || f.type === 'officer') return;
        if (Math.hypot(f.x - L.x, f.z - L.z) < 26) {
          f.brain.receiveOrder(tactic, L.x, L.z, game.time);
          f.heardCommand = { text: D.COMMANDS[Math.floor(Math.random() * D.COMMANDS.length)], t: 2.5 };
        }
      });
      game.pushRadio && game.pushRadio(L, D.COMMANDS[Math.floor(Math.random() * D.COMMANDS.length)]);
    });
  }

  SH2.ai = { EnemyBrain, commanderTick, TACTICS, wrapAngle, angleTo, clamp };
})(typeof window !== 'undefined' ? window : globalThis);
