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

  /* Тактики, которые умеет и выбирать, и ИСПОЛНЯТЬ мозг (в update есть ветка
     движения/прицеливания для каждой). `peek`, `rush` и `order` — это
     осмысленные слова, но собственного поведения у них нет: `order` — роль
     командира (он и так раздаёт приказы через commanderTick), `rush` — это
     `advance` на максимальной скорости, `peek` — `hold` с выходом из-за
     укрытия. Раньше они лежали в данных боевиков, до выбора тактики не
     доходили, и боец с ними просто медленнее реагировал: на «неправильной»
     тактике не было ни движения к цели, ни прицельной очереди. */
  const PLAYABLE_TACTICS = ['advance', 'hold', 'cover', 'flank', 'suppress', 'retreat', 'grenade', 'melee'];
  const TACTIC_ALIASES = { rush: 'advance', peek: 'hold', order: 'hold' };
  function playableTactic(t) {
    if (PLAYABLE_TACTICS.indexOf(t) >= 0) return t;
    return TACTIC_ALIASES[t] || null;
  }

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
      /* --- прицеливание: не «мгновенный прицел», а живой доводчик --- */
      this.aimYaw = agent.yaw;      // текущий ствол по горизонтали
      this.aimPitchS = 0;           // и по вертикали
      this.aimNoise = 0;            // ошибка прицела, которая набирается и гаснет
      this.aimSettle = 0;           // 0..1 — насколько прицел «устоялся»
      // свой поток случайности для «дрожи» прицела: решения бойца остаются
      // воспроизводимыми и не сдвигаются от того, сколько пуль он выпустил
      this.rngAim = D.rng(D.hash('aim|' + agent.id + '|' + (o.seed || 1)));
      this.aimJitterSeed = this.rngAim() * 100;
      this.recoilPitch = 0;         // подброс ствола от своих же выстрелов
      this.recoilYaw = 0;
      this.leadTime = 0;            // насколько боец умеет брать упреждение
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
      // укрытие ищем с учётом направления на угрозу: стена между нами и игроком
      const nearCover = game.world.coverSpot(a.x, a.z, P.x, P.z, 12, 1.7)
        || game.world.findCover(a.x, a.z, P.x, P.z, 12);
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
        const ord = playableTactic(this.order.tactic);
        if (ord) scores[ord] = (scores[ord] || 0) + 1.8;
      }

      // «качество мышления»: плохой мыслитель иногда выбирает случайный вариант
      if (this.rng() > cfg.thinkQuality) {
        const raw = cfg.tactics[Math.floor(this.rng() * cfg.tactics.length)];
        const pick = playableTactic(raw);
        if (pick) scores[pick] = (scores[pick] || 0) + 0.6;
      }

      let best = 'hold', bestScore = -1e9;
      for (const t of PLAYABLE_TACTICS) {
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
          // за низким укрытием надо присесть, иначе его нет
          this.wantCrouchCover = !!(this.coverPoint && this.coverPoint.crouch);
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
      // за низким укрытием (мешки, камень) приседаем — иначе оно не работает
      if (this.wantCrouchCover && this.tactic === 'cover') wantCrouch = true;
      if (this.tactic === 'hold' && this.distToPlayer < 16 && this.distToPlayer > 5) wantCrouch = true;

      /* ------- стрельба: решение принимается тоже «с трудом» --------- */
      const canShoot = this.seenNow && this.reactionLeft <= 0 && a.ammo > 0 && !a.reloading;
      if (canShoot) {
        this.aimTime += dt;
        const wantBurst = this.tactic === 'suppress' || this.tactic === 'advance' || this.tactic === 'hold' || this.tactic === 'flank';
        // Начинаем очередь только когда ствол реально лёг на цель: пока прицел
        // гуляет, стрелять в белый свет — это то, из-за чего боты «не попадают».
        const ready = this.aimSettle > 0.55;
        if (this.burstLeft > 0) {
          if (this.burstCool <= 0) {
            const res = this.shotResult(game);
            a.tryShoot(game, res.spread, res.pitch);
            this.burstLeft--;
            this.burstCool = 60 / D.WEAPON_BY_ID[cfg.weapon].rpm;
            // свой же выстрел сбивает прицел — поэтому следующая пуля идёт выше
            const rec = D.WEAPON_BY_ID[cfg.weapon].recoil * (cfg.brain ? 0.55 : 0.75) / Math.max(0.35, cfg.accuracy);
            this.recoilPitch += rec * 0.6;
            this.recoilYaw += (this.rngAim() - 0.5) * rec * 1.1;
            this.aimSettle *= 0.72;
          } else this.burstCool -= dt;
        } else if (this.aimTime > 0.25 && ready) {
          const burst = wantBurst ? 2 + Math.floor(this.rng() * 4) : 1;
          this.burstLeft = burst;
          this.aimTime = 0;
        }
      } else if (!this.seenNow) {
        this.aimTime = 0;
        // подавление по памяти: стреляем в последнюю точку, но без точности
        if (this.tactic === 'suppress' && this.memory && game.time - this.memory.t < 5 && a.ammo > 0) {
          a.tryShoot(game, 0.10, this.aimPitchS + 0.02);
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

      /* --------------------------- прицеливание ------------------------- */
      /* Ствол не прилипает к игроку: он догоняет цель с конечной скоростью,
         промахивается по инерции, «дышит» и получает подброс от собственной
         отдачи. Скорость доводки зависит от меткости бойца — тупой боец
         ведёт ствол медленно, элитный почти не отстаёт. */
      const acc = cfg.accuracy || 0.6;
      const trackSpeed = 3.0 + acc * 9.0;           // рад/с
      const trackAccel = 14 + acc * 30;
      if (!this._aimVel) { this._aimVel = 0; this._aimVelP = 0; }
      if (this.seenNow) {
        // упреждение: не по текущей позиции, а по будущей (только умные)
        const leadSkill = clamp((acc - 0.45) * 2.2, 0, 1);
        const dist = Math.max(1, this.distToPlayer);
        const tFly = dist / 95;                     // скорость пули бота
        // цель идёт с vx/vz — берём точку, где она будет через время полёта
        this.leadTime += ((leadSkill * tFly) - this.leadTime) * Math.min(1, dt * 3);
        const tx = P.x + (P.vx || 0) * this.leadTime;
        const tz = P.z + (P.vz || 0) * this.leadTime;
        const wantAimYaw = angleTo(a.x, a.z, tx, tz);
        const dyP = (P.y + (P.crouch ? 1.0 : 1.35)) - a.eyeY;
        const wantAimPitch = Math.atan2(dyP, Math.max(1, Math.hypot(tx - a.x, tz - a.z)));
        // ошибка прицела: чем хуже боец, тем больше «гуляет» ствол
        const hr = this.aimJitterSeed + game.time * (0.7 + (1 - acc) * 0.9);
        const noiseAmp = (1 - acc) * 0.055 + 0.006;
        const noiseYaw = (Math.sin(hr * 1.7) + Math.sin(hr * 3.1) * 0.5) * noiseAmp;
        const noisePitch = (Math.cos(hr * 2.3) + Math.sin(hr * 4.7) * 0.4) * noiseAmp * 0.7;
        const targetYaw = wantAimYaw + noiseYaw + this.recoilYaw;
        const targetPitch = wantAimPitch + noisePitch + this.recoilPitch;
        // пружина доводки: скорость пропорциональна ошибке, но с пределом
        const errYaw = wrapAngle(targetYaw - this.aimYaw);
        const errPitch = targetPitch - this.aimPitchS;
        this._aimVel += clamp(errYaw * trackAccel, -trackSpeed * 3, trackSpeed * 3) * dt;
        this._aimVel *= Math.exp(-dt * 7);
        this.aimYaw = wrapAngle(this.aimYaw + this._aimVel * dt + clamp(errYaw, -1, 1) * Math.min(1, dt * 7));
        this._aimVelP += clamp(errPitch * trackAccel, -trackSpeed * 3, trackSpeed * 3) * dt;
        this._aimVelP *= Math.exp(-dt * 7);
        this.aimPitchS += this._aimVelP * dt + errPitch * Math.min(1, dt * 7);
        // насколько прицел устоялся: 1 — точно на цели
        const settleRate = 1.4 + acc * 3.2;
        const errMag = Math.abs(errYaw) + Math.abs(errPitch) * 0.8;
        const wantSettle = clamp(1 - errMag / 0.06, 0, 1);
        this.aimSettle += (wantSettle - this.aimSettle) * Math.min(1, dt * settleRate);
        // отдача гаснет; если ствол ушёл совсем далеко — он «срывается» и
        // прицеливается заново (это читается как потеря цели)
        this.recoilPitch *= Math.exp(-dt * (3.2 + acc * 2));
        this.recoilYaw *= Math.exp(-dt * 4.2);
        if (Math.abs(wrapAngle(this.aimYaw - a.yaw)) > 1.1) {
          this.aimYaw = a.yaw;
          this._aimVel = 0;
          this.aimSettle = 0;
        }
        // корпус проворачивается вслед за стволом, а не мгновенно
        const bodyErr = wrapAngle(this.aimYaw - a.yaw);
        a.yaw = wrapAngle(a.yaw + clamp(bodyErr, -1, 1) * Math.min(1, dt * 4.5));
        aimPitch = this.aimPitchS;
      } else {
        // цель потеряна: ствол плавно опускается, прицел «сбрасывается»
        this.aimSettle *= Math.exp(-dt * 2.2);
        this.aimYaw = wrapAngle(this.aimYaw + wrapAngle(a.yaw - this.aimYaw) * Math.min(1, dt * 2.2));
        this.aimPitchS += (0 - this.aimPitchS) * Math.min(1, dt * 2.2);
        this.recoilPitch *= Math.exp(-dt * 5);
        this.recoilYaw *= Math.exp(-dt * 5);
        aimPitch = 0;
      }
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
        /* `grenade` / `melee` / `hold` — тактики на месте: движение не нужно,
           но и «залипнуть» нельзя. Если боец не видит игрока, он должен выйти
           на дистанцию броска/удара, а не стоять в укрытии вечно. */
        if (this.tactic === 'grenade') {
          if (this.distToPlayer > 18) return game.world.randomOpenPoint(P.x, P.z, 8, 14, this.rng);
          return null;
        }
        if (this.tactic === 'melee') {
          if (this.distToPlayer > 4.5) return { x: P.x, z: P.z };
          return null;
        }
        if (this.tactic === 'hold') return null;
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

    /* Промах не случайный: он складывается из состояния бойца.
       Раньше всё было множителями вокруг базового spread, и на дистанции
       разброс рос так, что попасть было нельзя даже случайно. Теперь:
         • ошибка прицела (aimSettle) — главный вклад: недовёл ствол → мимо;
         • рассеивание ствола зависит от дистанции корнево, а не линейно;
         • движение, ранение и потеря уверенности добавляют умеренно;
         • «качество мысли» (accuracy) сжимает всё это в разумных пределах. */
    shotSpread(game) {
      const a = this.agent, cfg = this.cfg, P = game.player;
      const base = D.WEAPON_BY_ID[cfg.weapon].spread;
      const dist = this.distToPlayer;
      const distFactor = 1 + Math.sqrt(dist) / 14;
      const moveFactor = 1 + (Math.hypot(a.vx, a.vz) / Math.max(1, cfg.speed)) * 0.9;
      const playerMove = 1 + Math.min(1.1, Math.hypot(P.vx, P.vz) / 7);
      const skill = 1 / Math.max(0.45, cfg.accuracy);
      const hurt = (1 - a.hp / a.maxHp) * 0.55 + (this.pain || 0) * 0.7;
      const alertness = 1 + (1 - this.alert) * 0.9;
      // недоведённый ствол — прямой промах, но не бесконечный
      const unsteady = 1 + (1 - this.aimSettle) * 1.6;
      return base * distFactor * moveFactor * playerMove * skill * (1 + hurt) * alertness
        * unsteady * (0.75 + game.difficulty * 0.2);
    }

    shotPitch(game) {
      const a = this.agent;
      // ствол уже наведён (aimPitchS с упреждением и шумом) — pitch берём от
      // него, а не пересчитываем «идеально в грудь» в момент выстрела
      return this.aimPitchS + (this.rngAim() - 0.5) * 0.012 * (1 + (1 - this.cfg.accuracy));
    }

    /* Один выстрел: разброс, вертикаль и (для снайперов/пулемётчиков)
       поправка на «тяжёлый» ствол. Вынесено, чтобы точка вызова была одна. */
    shotResult(game) {
      return { spread: this.shotSpread(game), pitch: this.shotPitch(game) };
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
      // Приказ обязан быть исполнимым: `flank`/`suppress`/`advance` есть в
      // PLAYABLE_TACTICS, иначе подчинённый получит слово без поведения.
      const tactic = L.type === 'boss'
        ? (Math.random() > 0.5 ? 'flank' : 'suppress')
        : (Math.random() > 0.5 ? 'flank' : 'advance');
      if (!playableTactic(tactic)) return;
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

  SH2.ai = { EnemyBrain, commanderTick, TACTICS, PLAYABLE_TACTICS, TACTIC_ALIASES, playableTactic, wrapAngle, angleTo, clamp };
})(typeof window !== 'undefined' ? window : globalThis);
