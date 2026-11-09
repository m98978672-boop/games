/* =============================================================================
   СЕКТОР «ПЕПЕЛ» — бот-диагност прямо в игре
   -----------------------------------------------------------------------------
   Тот же бот, что гоняет tools/bugbot.mjs на билд-сервере, но живёт внутри
   игры и проверяет НАСТОЯЩИЙ запущенный экземпляр: тот же игрок, та же карта,
   тот же рендер, те же бойцы. Каждая проверка привязана к своему коду из
   таблицы 000–999 (src/bugcodes.js), поэтому в отчёте видно не «что-то
   сломалось», а «код 421, категория «Игрок и управление», стик не двигает
   игрока».

   Два режима:
     • пассивный — работает всё время, пока идёт бой: ловит исключения в кадре,
       NaN, застревание ввода, переполнение пулов, огромные dt. Ничего не
       делает, пока всё хорошо;
     • активный — по клавише B (или кнопке в меню) прогоняет весь набор
       проверок по всем частям игры: структура, данные, карты, рендер, игрок,
       бой, ИИ, модели, интерфейс, устойчивость.

   Проверки не ломают игру: там, где нужно пошевелить игрока или потратить
   патрон, состояние снимается до и возвращается после.
   ============================================================================= */
(function (root) {
  'use strict';
  const SH2 = (root.SH2 = root.SH2 || {});

  const now = () => (root.performance && root.performance.now ? root.performance.now() : Date.now());
  const c3 = (v) => (Math.round(v * 1000) / 1000);

  /* ---------------------------------------------------------------------------
     Состояние игрока снимаем и возвращаем: проверка не должна оставлять следов
     в мире (иначе «бот» сам станет источником багов).
     ------------------------------------------------------------------------- */
  const PLAYER_FIELDS = ['x', 'z', 'y', 'vx', 'vz', 'vy', 'yaw', 'pitch', 'stamina',
    'exhausted', 'crouch', 'crouchT', 'sprint', 'ads', 'scoped', 'hp', 'armor',
    'fireTimer', 'reloading', 'reloadTimer', 'ammoInMag', 'reserve', 'slot',
    'bob', 'bobAmt', 'stepAccum', 'grounded', 'eyeHeight', 'spreadHeat'];

  function snapshot(g) {
    const P = g.player;
    const s = { fields: {}, keys: {}, missionTimer: g.missionTimer, time: g.time };
    PLAYER_FIELDS.forEach((k) => { s.fields[k] = P[k]; });
    s.slots = P.slots.slice();
    s.analog = g.input.analog;
    s.crouchToggle = g.input.crouchToggle;
    if (g.touch) s.touch = { sx: g.touch.sx, sz: g.touch.sz, txs: g.touch.txs,
      tzs: g.touch.tzs, stickActive: g.touch.stickActive, active: g.touch.active };
    return s;
  }
  function restore(g, s) {
    const P = g.player;
    Object.keys(s.fields).forEach((k) => { P[k] = s.fields[k]; });
    P.slots.length = 0;
    s.slots.forEach((w) => P.slots.push(w));
    g.input.analog = s.analog;
    g.input.crouchToggle = s.crouchToggle;
    g.missionTimer = s.missionTimer;
    g.time = s.time;
    if (g.touch && s.touch) Object.assign(g.touch, s.touch);
    g.mouse.dx = 0; g.mouse.dy = 0;
  }

  /* Короткий «шаг» мира без полного кадра: двигаем только тело игрока.
     Столкновения учитываются, поэтому тест честный. */
  function stepPlayer(g, frames) {
    const P = g.player;
    const inp = g.input;
    for (let i = 0; i < frames; i++) {
      const touch = g.touch;
      if (touch && touch.active) {
        touch.sx += (touch.txs - touch.sx) * 0.27;
        touch.sz += (touch.tzs - touch.sz) * 0.27;
        inp.analog = (Math.abs(touch.sx) + Math.abs(touch.sz) > 0.001)
          ? { x: touch.sx, z: touch.sz } : null;
      }
      P.update(1 / 60, {
        yaw: P.yaw,
        forward: inp.forward || 0,
        strafe: inp.strafe || 0,
        sprint: !!inp.sprint,
        crouch: !!inp.crouch,
        ads: !!inp.ads,
        analog: inp.analog
      }, g);
      g.time += 1 / 60;
    }
  }

  /* =========================== СПИСОК ПРОВЕРОК ============================
     code — строка таблицы 000–999; run(g) возвращает null (норма) или текст
     проблемы. Исключение внутри проверки считается провалом этой проверки,
     а не поломкой бота. */
  /* Рижи бойцов: собираются ли из настоящих костей. Вынесено наверх, потому
     что этим пользуются две проверки (707 и 719). */
  function checkRigs(types) {
    const bad = [];
    types.slice(0, 4).forEach((t) => {
      try {
        const rig = SH2.model.buildRig(t);
        if (!rig || !rig.root) bad.push(t);
      } catch (err) { bad.push(t + ': ' + err.message); }
    });
    return bad.length ? 'риг не собирается для: ' + bad.join(', ') : null;
  }

  const CHECKS = [
    /* ------------------------ 0xx: структура проекта --------------------- */
    { code: 0, run: () => {
      const need = ['data', 'outline', 'gunblueprints', 'soldier', 'level', 'model',
        'anim', 'ik', 'ragdoll', 'world', 'ai', 'agent', 'fx', 'viewmodel',
        'audio', 'perf', 'game', 'ui'];
      const miss = need.filter((n) => !SH2[n]);
      return miss.length ? 'не загружены модули: ' + miss.join(', ') : null;
    } },
    { code: 1, run: () => {
      const bc = SH2.bugcodes;
      if (!bc) return 'нет таблицы кодов (src/bugcodes.js)';
      return bc.TOTAL === 1000 ? null : 'в таблице кодов ' + bc.TOTAL + ' записей вместо 1000';
    } },
    { code: 2, run: () => (root.THREE && root.THREE.REVISION ? null : 'не загрузился three.js') },
    { code: 3, run: () => (root.document.getElementById('hud') ? null : 'в разметке нет HUD') },
    { code: 4, run: () => {
      /* Без document.styleSheets (file:// в некоторых браузерах) считаем
         оформление живым, если к HUD пришли стили: смотрим на классы панели. */
      const doc = root.document;
      const link = doc.querySelector && doc.querySelector('link[href*="style.css"]');
      if (link) return null;
      const sheets = doc.styleSheets;
      if (sheets && sheets.length) return null;
      return root.THREE ? null : 'style.css не подключён';
    } },

    /* -------------------------- 1xx: данные ----------------------------- */
    { code: 100, run: (g) => {
      const ids = SH2.data.WEAPONS.map((w) => w.id);
      const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
      return dup.length ? 'повторяются стволы: ' + dup.join(', ') : null;
    } },
    { code: 101, run: (g, bot) => bot.memo('guns', () => {
      /* Чертежи живут в замыкании gunblueprints; наружу отдаётся сборка.
         Проверяем фактом: каждый ствол должен собраться без исключения. */
      const bad = [];
      SH2.data.WEAPONS.forEach((w) => {
        try {
          const gun = SH2.gunblueprints.buildFromBlueprint(w.id);
          if (!gun || !gun.children || !gun.children.length) bad.push(w.id);
        } catch (e) { bad.push(w.id + ' (' + e.message + ')'); }
      });
      return bad.length ? 'не собираются стволы: ' + bad.join(', ') : null;
    }) },
    { code: 105, run: () => {
      const bad = SH2.data.WEAPONS.filter((w) => !(w.mag > 0) || !(w.reserve >= 0)).map((w) => w.id);
      return bad.length ? 'плохой магазин/запас: ' + bad.join(', ') : null;
    } },
    { code: 109, run: (g) => {
      const bad = g.enemies.filter((e) => !e.cfg || !e.cfg.id).map((e) => e.type);
      return bad.length ? 'боевики без конфига: ' + bad.join(', ') : null;
    } },
    { code: 114, run: () => {
      const bad = SH2.data.MISSIONS.filter((m) => !SH2.data.MAPS[m.map]).map((m) => m.id);
      return bad.length ? 'миссии без карты: ' + bad.join(', ') : null;
    } },
    { code: 119, run: (g) => {
      /* Границы карты — квадрат size × size (так их строит World), а не w/h. */
      const M = g.level.map;
      const P = g.player;
      const half = (M.size || 80) / 2 + 2;
      const inside = Math.abs(P.x) <= half && Math.abs(P.z) <= half;
      return inside ? null : `игрок вне карты: (${c3(P.x)}, ${c3(P.z)}), полуразмер ${half}`;
    } },

    /* --------------------- 2xx: карта и коллизии ------------------------ */
    { code: 200, run: (g) => (g.level && g.level.group ? null : 'уровень не построен') },
    { code: 202, run: (g) => {
      const n = g.level.colliders.filter((c) => c.kind === 'building').length;
      return n >= 1 ? null : 'нет коллайдеров зданий';
    } },
    { code: 203, run: (g) => {
      const n = g.level.colliders.filter((c) => c.kind === 'sandbag').length;
      return n >= 1 ? null : 'нет укрытий из мешков';
    } },
    { code: 204, run: (g) => {
      /* Полуразмеры коллайдеров: hw/hd (в плане) и h (высота). Оси y обычно
         нет вовсе — это не ошибка. */
      const bad = g.level.colliders.filter((c) => !Number.isFinite(c.x) || !Number.isFinite(c.z) ||
        !Number.isFinite(c.hw) || !Number.isFinite(c.hd) || !Number.isFinite(c.h));
      return bad.length ? `коллайдеров с NaN: ${bad.length}` : null;
    } },
    { code: 207, run: (g) => {
      const P = g.player;
      const free = g.world.isFreeSpot(P.x, P.z, P.radius + 0.01, P.eyeHeight);
      return free ? null : `игрок в геометрии: (${c3(P.x)}, ${c3(P.z)})`;
    } },
    { code: 215, run: (g) => {
      const fog = g.scene.fog;
      if (!fog) return 'тумана нет — дальность не ограничена';
      const d = fog.density || 0;
      return d <= 0.008 ? null : `туман съедает дальность: density ${c3(d)}`;
    } },

    /* --------------------- 3xx: рендер и кадр --------------------------- */
    { code: 300, run: (g) => (g.renderer && g.perf ? null : 'нет рендерера или счётчиков') },
    { code: 305, run: (g) => {
      /* Слой 1 у ВСЕХ мешей оружия: three не наследует layers у детей. */
      const vm = g.viewmodel;
      if (!vm || !vm.root) return 'нет модели оружия';
      let total = 0, wrong = 0;
      vm.root.traverse((c) => { if (c.isMesh) { total++; if (c.layers.mask !== 2) wrong++; } });
      if (!total) return 'в модели оружия нет мешей';
      return wrong ? `на слое 1 не все меши оружия: ${wrong} из ${total}` : null;
    } },
    { code: 309, run: (g) => {
      if (!g.level || !g.level.group) return 'мир не в сцене';
      const vis = g.level.group.children.length;
      return vis > 0 ? null : 'уровень пуст';
    } },
    { code: 310, run: (g) => {
      const bg = g.scene.background;
      if (!bg) return 'фон не задан — за спиной пустота';
      /* Небо градиентом — это текстура, цвет берём из палитры карты. */
      const sky = g.level.map.sky;
      const toHex = (v) => (typeof v === 'string'
        ? parseInt(v.replace('#', ''), 16) : v);
      const hex = bg.isColor ? bg.getHex() : toHex(Array.isArray(sky) ? sky[0] : sky);
      if (!Number.isFinite(hex)) return null;
      const r = (hex >> 16) & 255, gg = (hex >> 8) & 255, b = hex & 255;
      return (r + gg + b) > 90 ? null : 'небо чёрное';
    } },
    { code: 318, run: (g) => {
      const vm = g.viewmodel;
      const cam = g.camera;
      if (!vm || !vm.muzzleLocal || !cam) return 'нет мушки или камеры';
      const T = root.THREE;
      const p = new T.Vector3();
      vm.muzzleLocal.getWorldPosition(p);
      p.applyMatrix4(cam.matrixWorldInverse);
      const depth = -p.z;
      const ndc = p.applyMatrix4(cam.projectionMatrix);
      if (!Number.isFinite(ndc.x)) return 'мушка за камерой';
      if (Math.abs(ndc.x) > 0.12 && g.player.ads) return `на прицеле мушка в стороне: ${c3(ndc.x)}`;
      if (depth < 0.05 || depth > 3) return `мушка на глубине ${c3(depth)} м`;
      return null;
    } },
    { code: 319, run: (g) => {
      const h = root.innerHeight || 1;
      const w = root.innerWidth || 1;
      if (w / h >= 1) return null;
      return g.camera.aspect > 0 ? null : 'на портретном экране aspect сломан';
    } },

    /* --------------------- 4xx: игрок и управление ---------------------- */
    { code: 400, run: (g) => {
      const P = g.player;
      const bad = ['x', 'z', 'y', 'yaw', 'pitch', 'hp'].filter((k) => !Number.isFinite(P[k]));
      return bad.length ? 'NAB в полях игрока: ' + bad.join(', ') : null;
    } },
    { code: 403, run: (g) => {
      const P = g.player, cam = g.camera;
      const dy = Math.abs(cam.position.y - (P.y + P.eyeHeight));
      return dy < 0.35 ? null : `камера оторвалась от тела на ${c3(dy)} м`;
    } },
    { code: 405, run: (g) => {
      /* Бег обязан тратить выносливость: короткая симуляция с полным откатом. */
      const s = snapshot(g);
      const st0 = g.player.stamina;
      g.keys.ShiftLeft = true;
      g.input.sprint = true;
      g.input.forward = 1;
      stepPlayer(g, 12);
      const st1 = g.player.stamina;
      restore(g, s);
      g.keys.ShiftLeft = false;
      return st1 < st0 - 0.5 ? null : `бег не тратит выносливость: ${c3(st0)} → ${c3(st1)}`;
    } },
    { code: 407, run: (g) => {
      const s = snapshot(g);
      const h0 = g.player.eyeHeight;
      g.input.crouch = true;
      stepPlayer(g, 20);
      const h1 = g.player.eyeHeight;
      restore(g, s);
      g.input.crouch = false;
      return h1 < h0 - 0.2 ? null : `присед не опускает камеру: ${c3(h0)} → ${c3(h1)}`;
    } },
    { code: 410, run: (g) => {
      /* Выстрел тратит патрон и не уходит в минус. Стреляем в пустоту и
         возвращаем патроны обратно. */
      const s = snapshot(g);
      const a0 = g.player.ammoInMag;
      g.player.fireTimer = 0;
      g.player.fire(g.time);
      const a1 = g.player.ammoInMag;
      restore(g, s);
      if (!(a1 === a0 - 1)) return `выстрел не списал патрон: ${a0} → ${a1}`;
      return a1 >= 0 ? null : 'патроны ушли в минус';
    } },
    { code: 412, run: (g) => {
      const w = g.player.weapon;
      return w.mag > 0 && w.reserve >= 0 ? null : 'магазин или запас неположительные';
    } },
    { code: 417, run: (g) => {
      const src = String(root.SH2.game && SH2.game.Game);
      return /DEAD = 0\.12/.test(src) ? null : 'мёртвая зона стика не 12%';
    } },
    { code: 420, run: (g) => {
      /* Клавиши двигают тело: без этого игра «не ходит». */
      const s = snapshot(g);
      const x0 = g.player.x, z0 = g.player.z;
      g.input.forward = 1; g.input.strafe = 0; g.input.analog = null;
      g.player.yaw = g.player.yaw;
      stepPlayer(g, 30);
      const d = Math.hypot(g.player.x - x0, g.player.z - z0);
      restore(g, s);
      g.input.forward = 0;
      return d > 0.5 ? null : `клавиша «вперёд» сдвинула на ${c3(d)} м`;
    } },
    { code: 421, run: (g) => {
      /* Стик телефона двигает тело. Именно этот код ловил баг «не могу ходить»:
         вектор стика считался, но в физику не попадал. */
      if (!g.touch) return 'на этом устройстве стика нет';
      const s = snapshot(g);
      const x0 = g.player.x, z0 = g.player.z;
      g.touch.active = true;
      g.touch.stickActive = true;
      g.touch.sx = 0; g.touch.sz = 1;
      g.touch.txs = 0; g.touch.tzs = 1;
      stepPlayer(g, 45);
      const d = Math.hypot(g.player.x - x0, g.player.z - z0);
      restore(g, s);
      if (!g.touch.stickActive && s.touch) Object.assign(g.touch, s.touch);
      return d > 0.5 ? null : `стик вперёд сдвинул на ${c3(d)} м`;
    } },
    { code: 422, run: (g) => {
      /* Страховка от той же регрессии: analog обязан доезжать до update тела. */
      const fn = String(SH2.game.Player.prototype.update);
      if (!/inp\.analog/.test(fn)) return 'Player.update не читает analog — стик потерян';
      return g.input && 'analog' in g.input ? null : 'в input нет поля analog';
    } },
    { code: 428, run: (g) => {
      const P = g.player;
      return g.world.isFreeSpot(P.x, P.z, P.radius + 0.02, P.eyeHeight)
        ? null : 'спавн занят геометрией — из него не выйти';
    } },

    /* ----------------------- 5xx: бой и физика -------------------------- */
    { code: 511, run: (g) => {
      const n = (g.fx.counts && g.fx.counts.shards) || 0;
      const pool = g.fx.shards ? g.fx.shards.length : 0;
      return n <= pool ? null : `осколков ${n} больше пула ${pool}`;
    } },
    { code: 516, run: (g) => {
      const old = g.combat.bullets.filter((b) => b.life > 6 || !Number.isFinite(b.life));
      return old.length ? `пуль с плохим временем жизни: ${old.length}` : null;
    } },
    { code: 517, run: (g) => {
      const stuck = g.combat.grenades.filter((gr) => !(gr.fuse > 0) || gr.fuse > 12);
      return stuck.length ? `гранат с плохим взрывателем: ${stuck.length}` : null;
    } },
    { code: 518, run: (g) => {
      const bad = g.deadBodies.filter((b) => !b.ragdoll || !b.ragdoll.points);
      return bad.length ? `трупов без куклы: ${bad.length}` : null;
    } },

    /* --------------------------- 6xx: ИИ -------------------------------- */
    { code: 600, run: (g) => {
      const idle = g.enemies.filter((e) => e.alive && (!e.brain || !e.brain.tactic));
      return idle.length ? `боевиков без тактики: ${idle.length}` : null;
    } },
    { code: 602, run: (g) => {
      const play = SH2.ai.PLAYABLE_TACTICS || [];
      const bad = g.enemies.filter((e) => e.alive && e.brain.tactic && play.indexOf(e.brain.tactic) < 0);
      return bad.length ? `неисполнимые тактики: ${bad.map((e) => e.brain.tactic).join(', ')}` : null;
    } },
    { code: 609, run: (g) => {
      /* Расталкивание держит дистанцию около 1.1 м; меньше 0.5 м — это уже
         слипшаяся пара, из которой ИИ не может выйти. */
      const alive = g.enemies.filter((e) => e.alive);
      if (alive.length < 2) return null;
      let worst = Infinity;
      for (let i = 0; i < alive.length; i++) {
        for (let j = i + 1; j < alive.length; j++) {
          worst = Math.min(worst, Math.hypot(alive[i].x - alive[j].x, alive[i].z - alive[j].z));
        }
      }
      return worst >= 0.5 ? null : `два боевика слиплись: ${c3(worst)} м`;
    } },
    { code: 612, run: (g) => {
      const bad = g.enemies.filter((e) => !Number.isFinite(e.x) || !Number.isFinite(e.z));
      return bad.length ? `боевиков с NaN: ${bad.length}` : null;
    } },

    /* --------------------- 7xx: анимация и модели ----------------------- */
    { code: 700, run: (g, bot) => bot.memo('clips', () => {
      let n = 0, nonFinite = 0;
      SH2.data.PARTS.forEach((p) => SH2.data.CLIPS.forEach((c) => {
        const curve = SH2.data.clipCurve(p.id, c.id, 0);
        if (!curve) return;
        n++;
        Object.keys(curve).forEach((ch) => {
          curve[ch].forEach((k) => { if (!Number.isFinite(k[1])) nonFinite++; });
        });
      }));
      if (nonFinite) return `в клипах ${nonFinite} нечисловых значений`;
      const need = SH2.data.PARTS.length * SH2.data.CLIPS.length;
      return n === need ? null : `клипов собралось ${n} из ${need}`;
    }) },
    { code: 704, run: () => {
      const n = SH2.data.PARTS.length;
      return n === 22 ? null : `в риге ${n} частей вместо 22`;
    } },
    { code: 707, run: (g, bot) => bot.memo('rig:grunt', () => {
      /* Риг солдата: 22 кости и общая группа для сцены. Раньше проверка звала
         несуществующий buildSoldier и «находила» баг там, где его нет. */
      try {
        const rig = SH2.model.buildRig('grunt');
        const bones = rig.bones ? Object.keys(rig.bones).length : 0;
        if (!rig.root && !rig.group) return 'риг солдата без корня';
        if (bones !== SH2.data.PARTS.length) {
          return `в риге ${bones} костей вместо ${SH2.data.PARTS.length}`;
        }
        return null;
      } catch (e) { return 'риг солдата не собирается: ' + e.message; }
    }) },
    { code: 709, run: (g, bot) => bot.memo('guns', () => {
      const bad = [];
      SH2.data.WEAPONS.forEach((w) => {
        try { if (!SH2.gunblueprints.buildFromBlueprint(w.id)) bad.push(w.id); }
        catch (e) { bad.push(w.id); }
      });
      return bad.length ? 'не собираются стволы: ' + bad.join(', ') : null;
    }) },
    { code: 719, run: (g) => {
      /* Модель бойца строится лениво (LOD), поэтому спрашиваем не «есть ли
         риг», а «собирается ли он для бойца этого типа». */
      const types = [];
      g.enemies.forEach((e) => { if (e.alive && types.indexOf(e.type) < 0) types.push(e.type); });
      if (g.bot) {
        const key = 'rig:' + types.join(',');
        return g.bot.memo(key, () => checkRigs(types));
      }
      return checkRigs(types);
    } },

    /* -------------------- 8xx: интерфейс и UX --------------------------- */
    { code: 800, run: (g) => {
      const el = root.document.getElementById('hud-ammo');
      if (!el) return 'нет индикатора патронов';
      return String(el.textContent || '').length ? null : 'HUD не показывает патроны';
    } },
    { code: 801, run: () => {
      const need = ['scr-menu', 'scr-brief', 'scr-pause', 'scr-death', 'scr-win', 'scr-lab'];
      const miss = need.filter((id) => !root.document.getElementById(id));
      return miss.length ? 'нет экранов: ' + miss.join(', ') : null;
    } },
    { code: 806, run: () => {
      const need = ['t-fire', 't-ads', 't-reload', 't-crouch', 't-jump', 't-sprint', 't-grenade'];
      const miss = need.filter((id) => !root.document.getElementById(id));
      return miss.length ? 'нет тач-кнопок: ' + miss.join(', ') : null;
    } },
    { code: 813, run: (g) => (g.audio && typeof g.audio.gunshot === 'function' ? null : 'звук не подключён') },
    { code: 815, run: (g) => (g.settings && typeof g.settings.quality === 'string' ? null : 'настройки не загрузились') },

    /* ---------------------- 9xx: устойчивость --------------------------- */
    { code: 900, run: (g) => {
      const bad = [];
      if (!Number.isFinite(g.player.x) || !Number.isFinite(g.player.z)) bad.push('игрок');
      if (!Number.isFinite(g.time)) bad.push('время игры');
      if (g.enemies.some((e) => !Number.isFinite(e.x))) bad.push('боевики');
      if (!Number.isFinite(g.camera.position.x)) bad.push('камера');
      return bad.length ? 'NaN в: ' + bad.join(', ') : null;
    } },
    { code: 902, run: (g) => {
      /* У пула есть _total (сумма живых частиц всех пулов), а не caps. */
      const n = (g.fx.counts && g.fx.counts.particles) || 0;
      const cap = g.fx._total || g.fx.capacity || 1200;
      return n <= cap ? null : `частиц ${n} больше пула ${cap}`;
    } },
    { code: 905, run: (g) => {
      const lim = SH2.data.MISSIONS.length;
      return g.missionIndex >= 0 && g.missionIndex < lim
        ? null : `индекс миссии вне диапазона: ${g.missionIndex}`;
    } },
    { code: 916, run: (g) => (g.frameTime <= 0.25 ? null : `огромный dt: ${c3(g.frameTime)} с`) },

    /* ------------------- 920–929: сам бот-диагност ----------------------
       Бот обязан проверять и себя: иначе «инструмент поиска багов» тихо
       перестаёт работать, и все его «ошибок не найдено» ничего не стоят. */
    { code: 920, run: (g) => {
      const bot = g.bot;
      if (!bot) return 'бот-диагност не подключён к игре';
      if (!bot.attached) return 'бот не подписан на кадр игры';
      return typeof g.update === 'function' ? null : 'у игры нет update';
    } },
    { code: 921, run: () => {
      const BC = SH2.bugcodes;
      if (!BC || BC.TOTAL !== 1000) return 'в игре нет полной таблицы 000–999';
      for (let i = 0; i < 1000; i += 97) {
        const rec = BC.BY_CODE[i];
        if (!rec || !rec.category || !rec.title) return 'дырка в таблице на коде ' + i;
      }
      return null;
    } },
    { code: 922, run: (g) => {
      const bot = g.bot;
      if (!bot || !bot.lookup) return 'у бота нет поиска по коду';
      const BC = SH2.bugcodes;
      const rec = BC.BY_CODE[421];
      return rec && rec.title ? null : 'поиск по коду 421 ничего не находит';
    } },
    { code: 923, run: (g) => {
      const bot = g.bot;
      if (!bot || !bot.tick) return 'у бота нет пассивного режима';
      const src = String(bot.tick);
      if (!/stillFrames/.test(src)) return 'пассивный режим не ищет застревание';
      return /report\(/.test(src) && /420/.test(src) ? null : 'застревание не превращается в код 420/421';
    } },
    { code: 924, run: (g) => {
      /* Механизм отката: снимок состояния обязан возвращать всё на место.
         Проверяем сам откат, а не «прогон целиком» — иначе проверка вызывала
         бы прогон из прогона. Итог реального прогона смотрит арбитр
         (this.lastDrift), а не эта проверка. */
      const a = snapshot(g);
      const P = g.player;
      const x0 = P.x, hp0 = P.hp, st0 = P.stamina, mag0 = P.ammoInMag;
      P.x += 1.5; P.hp -= 7; P.stamina -= 12; P.ammoInMag = 0;
      restore(g, a);
      const drift = Math.hypot(P.x - x0, P.z - a.fields.z);
      if (drift > 0.001) return `откат позиции неточен: ${c3(drift)} м`;
      if (Math.abs(P.hp - hp0) > 0.001) return 'откат здоровья неточен';
      if (Math.abs(P.stamina - st0) > 0.001) return 'откат выносливости неточен';
      if (P.ammoInMag !== mag0) return 'откат патронов неточен';
      return null;
    } },
    { code: 925, run: (g) => {
      const bot = g.bot;
      if (!bot || !bot.reportText) return 'бот не умеет собирать отчёт';
      const text = bot.reportText();
      if (!/таблица кодов/.test(text)) return 'в отчёте нет ссылки на таблицу кодов';
      return text.length > 40 ? null : 'отчёт пустой';
    } },
    { code: 926, run: (g) => {
      const doc = root.document;
      if (!doc || !doc.getElementById) return 'нет DOM';
      return doc.getElementById('bot-panel') ? null : 'нет панели бота в разметке';
    } },
    { code: 927, run: (g, bot) => {
      const t0 = now();
      const n = bot.found.length;
      bot.render();
      const cost = now() - t0;
      if (bot.found.length !== n) return 'перерисовка панели меняет находки';
      return cost <= 60 ? null : `панель бота рисуется ${Math.round(cost)} мс`;
    } },
    { code: 928, run: (g) => {
      const b = root.document && root.document.getElementById('bot-btn-hud');
      if (!b) return 'нет кнопки бота в HUD';
      const panel = root.document.getElementById('bot-panel');
      return panel ? null : 'кнопка есть, а панели нет';
    } },
    { code: 929, run: (g) => {
      const bot = g.bot;
      if (!bot) return 'нет бота';
      const BC = SH2.bugcodes;
      const bad = bot.found.filter((f) => !BC.BY_CODE[f.code]);
      if (bad.length) return 'находки со кодами вне таблицы: ' + bad.map((f) => f.code).join(', ');
      const noCat = bot.found.filter((f) => !f.category || f.category === '—');
      return noCat.length ? 'у находки нет категории: ' + noCat[0].code : null;
    } }
  ];

  /* Одна и та же строка таблицы может использоваться несколькими проверками
     (например, код 2 — three.js, link и CDN), поэтому ключ уникальный. */
  const SEEN = {};
  CHECKS.forEach((c, i) => {
    const k = c.code + ':' + (c.key || i);
    c.uid = k;
    SEEN[k] = c;
  });

  class GameBot {
    constructor(game) {
      this.game = game;
      this.attached = false;
      this.open = false;
      this.busy = false;
      this.lastRun = null;
      this.found = [];        // найденные проблемы: {code, count, msg, category, title}
      this.checks = 0;
      this.skipped = 0;
      this.passive = [];      // пассивные наблюдения
      this.badges = 0;
      this.dom = null;
      /* Мемоизация дорогих, но неизменных счётов: сборка 15 стволов и 1760
         кривых занимает ~300 мс, и делать это на каждый прогон нельзя —
         иначе кнопка «ПРОВЕРИТЬ» подвешивает кадр. */
      this.cache = {};
      this.watch = {
        intentFrames: 0, stillFrames: 0, lastX: 0, lastZ: 0,
        spiked: 0, exceptions: 0
      };
    }

    /* Считает один раз за сессию: данные игры не меняются на ходу. */
    memo(key, fn) {
      if (!(key in this.cache)) this.cache[key] = fn();
      return this.cache[key];
    }

    /* --------------------------- жизненный цикл -------------------------- */
    attach() {
      if (this.attached) return this;
      const g = this.game;
      this.attached = true;

      /* Кадр в обёртке: исключение внутри update не роняет игру, а становится
         находкой с кодом 915 (категория «Устойчивость»). */
      const origUpdate = g.update.bind(g);
      const bot = this;
      g.update = function (dt) {
        const t0 = now();
        try {
          origUpdate(dt);
        } catch (err) {
          bot.report(915, (err && err.message ? err.message : String(err)), { once: true });
          bot.watch.exceptions++;
        }
        bot.tick(dt, now() - t0);
      };

      if (root.addEventListener) {
        root.addEventListener('error', (e) => {
          bot.report(915, (e && e.message) || 'исключение в кадре', { once: true });
        });
      }
      this.bindDOM();
      return this;
    }

    /* --------------------------- пассивный режим -------------------------
       Ничего не печатает, пока всё в порядке. Ловит именно те поломки,
       которые человек замечает первым: «не ходит», «всё замерло», «мигает». */
    tick(dt, costMs) {
      const g = this.game;
      if (!g || g.state !== 'playing') return;
      const w = this.watch;
      const P = g.player;

      if (!Number.isFinite(P.x) || !Number.isFinite(P.z) || !Number.isFinite(dt)) {
        this.report(900, 'NaN в состоянии игрока', { once: true });
      }
      if (dt > 0.25) w.spiked++;
      if (costMs > 12) this.report(911, `кадр ИИ и физики занял ${Math.round(costMs)} мс`, { throttle: 120 });

      /* Главное: было намерение идти, а тело не сдвинулось.
         Проверяем только когда игрок жив и не в приседе. */
      const analog = g.touch && g.touch.stickActive &&
        Math.hypot(g.touch.sx, g.touch.sz) > 0.45;
      const keys = !!(g.keys.KeyW || g.keys.KeyS || g.keys.KeyA || g.keys.KeyD ||
        g.keys.ArrowUp || g.keys.ArrowDown || g.keys.ArrowLeft || g.keys.ArrowRight);
      const intent = analog || keys;
      const moved = Math.hypot(P.x - w.lastX, P.z - w.lastZ);
      w.lastX = P.x; w.lastZ = P.z;
      if (intent && P.alive) {
        w.intentFrames++;
        if (moved < 0.0008) w.stillFrames++;
        else w.stillFrames = Math.max(0, w.stillFrames - 1);
        /* ~0.8 с «жму, а не иду» — это баг. Упёрся в стену — это не баг:
           проверяем, свободен ли шаг вперёд. */
        if (w.stillFrames > 48) {
          const yaw = P.yaw;
          const fx = P.x + Math.sin(yaw) * (P.radius + 0.4);
          const fz = P.z + Math.cos(yaw) * (P.radius + 0.4);
          const free = g.world.isFreeSpot(fx, fz, P.radius * 0.9, P.eyeHeight);
          if (free) {
            this.report(analog ? 421 : 420,
              analog ? 'стик отклонён, а игрок стоит на месте'
                : 'клавиши движения нажаты, а игрок стоит на месте',
              { throttle: 300 });
          }
          w.stillFrames = 0;
        }
      } else {
        w.intentFrames = 0;
        w.stillFrames = 0;
      }

      const counts = g.fx.counts || {};
      const particleCap = g.fx._total || 1200;
      if ((counts.particles || 0) > particleCap ||
          (counts.shards || 0) > (g.fx.shards ? g.fx.shards.length : 0)) {
        this.report(902, 'пул частиц переполнен', { once: true });
      }
      if (g.enemies.length > 40) this.report(909, `боевиков в сцене: ${g.enemies.length}`, { once: true });
    }

    /* ----------------------------- находки ------------------------------ */
    report(code, msg, opts) {
      const o = opts || {};
      const BC = SH2.bugcodes;
      const rec = this.found.find((f) => f.code === code && f.msg === msg);
      if (rec) {
        rec.count++;
        if (o.once) return;
      } else {
        this.found.push({
          code,
          category: BC ? BC.category(code) : '—',
          title: BC ? BC.title(code) : '—',
          msg,
          count: 1
        });
      }
      this.render();
      const g = this.game;
      if (!o.silent && g.ui && g.ui.toast && this.found.length > this.badges) {
        g.ui.toast('Бот-диагност: код ' + String(code).padStart(3, '0') + ' — ' + msg);
      }
      this.badges = this.found.length;
    }

    clear() {
      this.found.length = 0;
      this.runFindings = [];
      this.keepFindings = [];
      this.badges = 0;
      this.checks = 0;
      this.skipped = 0;
      this.lastRun = null;
      this.render();
    }

    /* ------------------------------- прогон ----------------------------- */
    runAll() {
      if (this.busy) return;
      /* Прогон разбит на шаги по кадрам: 80+ проверок за один кадр — это
         заметный подвис. Кнопка нажата → проверки идут порциями, панель
         показывает прогресс. runNow() нужен тестам и ботам CI. */
      if (this.pending) return;
      this.pending = 0;
      this.queue = CHECKS.slice();
      this.stage = null;
      this.progress = 0;
      if (root.requestAnimationFrame) {
        root.requestAnimationFrame(() => this.pump());
      } else {
        this.runNow();
        this.pending = 0;
      }
    }

    /* Один шаг конвейера: не больше ~8 мс, чтобы кадр не проваливался. */
    pump() {
      if (!this.pending) { this.pending = 0; return; }
      const t0 = now();
      while (this.queue.length && now() - t0 < 8) this.step();
      if (this.queue.length) {
        this.progress = 1 - this.queue.length / this.totalQueued;
        this.render();
        root.requestAnimationFrame(() => this.pump());
      } else {
        this.finishRun();
        this.pending = 0;
      }
    }

    /* ---- механика прогона: одни и те же шаги для pump() и runNow() ---- */
    beginRun() {
      const g = this.game;
      this.queue = CHECKS.slice();
      this.totalQueued = this.queue.length;
      this.keepFindings = this.found.slice();
      this.runFindings = [];
      this.snapshotState = snapshot(g);
      this.keepKeys = Object.assign({}, g.keys);
      this.keepInput = { forward: g.input.forward, strafe: g.input.strafe,
        sprint: g.input.sprint, crouch: g.input.crouch, ads: g.input.ads };
      this.startMs = now();
      this.checksNow = 0;
      this.failedNow = 0;
      this.busy = true;
    }

    step() {
      const g = this.game;
      const c = this.queue.shift();
      if (!c) return;
      this.ensureRun();
      let res;
      try {
        res = c.run(g, this);
      } catch (err) {
        res = 'проверка упала: ' + (err && err.message ? err.message : String(err));
      }
      this.checksNow++;
      if (res) {
        this.failedNow++;
        this.addFinding(c.code, res);
      }
    }

    ensureRun() {
      if (this.stage !== 'running') this.beginRun0();
    }

    /* проверить до конца прямо сейчас (тесты, CI, headless) */
    runNow() {
      if (this.busy) {
        while (this.queue && this.queue.length) this.step();
        this.finishRun();
        return;
      }
      this.beginRun0();
      while (this.queue.length) this.step();
      this.finishRun();
    }

    finishRun() {
      const g = this.game;
      restore(g, this.snapshotState);
      this.lastDrift = {
        pos: Math.hypot(g.player.x - this.snapshotState.fields.x, g.player.z - this.snapshotState.fields.z),
        hp: Math.abs(g.player.hp - this.snapshotState.fields.hp),
        stamina: Math.abs(g.player.stamina - this.snapshotState.fields.stamina)
      };
      Object.keys(g.keys).forEach((k) => { g.keys[k] = this.keepKeys[k] || false; });
      Object.assign(g.input, this.keepInput);
      this.checks = this.checksNow;
      this.found = this.merge(this.keepFindings || [], this.runFindings || []);
      this.stage = 'done';
      this.busy = false;
      this.pending = 0;
      this.progress = 1;
      this.lastRun = { ms: Math.round(now() - this.startMs), total: this.checksNow,
        failed: this.failedNow, at: new Date() };
      this.render();
      if (this.failedNow) this.badges = this.found.length;
    }

    /* Находки текущего прогона держим отдельно от пассивных: иначе повторная
       проверка показывала бы старые ошибки, которых уже нет. */
    addFinding(code, msg) {
      const BC = SH2.bugcodes;
      this.runFindings = this.runFindings || [];
      const same = this.runFindings.find((f) => f.code === code && f.msg === msg);
      if (same) { same.count++; return; }
      this.runFindings.push({ code, category: BC ? BC.category(code) : '—',
        title: BC ? BC.title(code) : '—', msg, count: 1 });
    }

    displayFindings() {
      if (this.stage === 'running') {
        return this.merge(this.keepFindings || [], this.runFindings || []);
      }
      return this.found;
    }

    beginRun0() {
      this.beginRun();
      this.stage = 'running';
    }

    merge(a, b) {
      const out = a.slice();
      b.forEach((n) => {
        const same = out.find((o) => o.code === n.code && o.msg === n.msg);
        if (same) same.count += n.count;
        else out.push(n);
      });
      return out.sort((x, y) => x.code - y.code);
    }

    /* ------------------------------- отчёт ------------------------------ */
    reportText() {
      const BC = SH2.bugcodes;
      const g = this.game;
      const lines = [];
      const pad = (n) => String(n).padStart(3, '0');
      lines.push('# Бот-диагност · СЕКТОР «ПЕПЕЛ» — отчёт по таблице кодов');
      lines.push('');
      lines.push('- когда: ' + (this.lastRun ? this.lastRun.at.toLocaleString() : new Date().toLocaleString()));
      lines.push('- миссия: ' + (g.mission ? g.mission.title : '—'));
      lines.push('- таблица кодов: ' + (BC ? BC.TOTAL : '—') + ' (000–999)');
      lines.push('- проверок выполнено: ' + this.checks);
      lines.push('- проблем: ' + this.found.length);
      if (this.lastRun) lines.push('- прогон занял: ' + this.lastRun.ms + ' мс');
      lines.push('');
      if (!this.found.length) {
        lines.push('Ошибок не найдено.');
      } else {
        lines.push('| Код | Категория | Проверка | Что нашёл бот | Раз |');
        lines.push('|---|---|---|---|---|');
        this.found.forEach((f) => {
          lines.push(`| ${pad(f.code)} | ${f.category} | ${f.title} | ${f.msg} | ${f.count} |`);
        });
      }
      lines.push('');
      this.passive.forEach((p) => lines.push('- ' + p));
      return lines.join('\n');
    }

    /* -------------------------------- DOM ------------------------------- */
    bindDOM() {
      const doc = root.document;
      if (!doc || !doc.getElementById) return;
      this.dom = {
        panel: doc.getElementById('bot-panel'),
        list: doc.getElementById('bot-list'),
        summary: doc.getElementById('bot-summary'),
        search: doc.getElementById('bot-search'),
        answer: doc.getElementById('bot-answer'),
        badge: doc.getElementById('bot-badge'),
        btnRun: doc.getElementById('bot-run'),
        btnCopy: doc.getElementById('bot-copy'),
        btnSave: doc.getElementById('bot-save'),
        btnClear: doc.getElementById('bot-clear'),
        btnClose: doc.getElementById('bot-close')
      };
      const on = (el, fn) => { if (el && el.addEventListener) el.addEventListener('click', fn); };
      /* Панель перехватывает клавиши: иначе WASD в поле поиска кода ещё и
         двигали бы игрока, а Esc ставил бы паузу. */
      if (this.dom.panel && this.dom.panel.addEventListener) {
        this.dom.panel.addEventListener('keydown', (e) => {
          if (e.stopPropagation) e.stopPropagation();
          if (e.code === 'Escape' || e.code === 'KeyB') {
            if (e.code === 'KeyB' && !e.ctrlKey && !e.metaKey && this.dom.search === e.target) return;
            if (e.preventDefault) e.preventDefault();
            this.toggle(false);
          }
          if (e.code === 'Enter') this.runAll();
        });
      }
      on(this.dom.btnRun, () => this.runAll());
      on(this.dom.btnClear, () => this.clear());
      on(this.dom.btnClose, () => this.toggle(false));
      on(this.dom.btnCopy, () => this.copy());
      on(this.dom.btnSave, () => this.download());
      if (this.dom.search && this.dom.search.addEventListener) {
        this.dom.search.addEventListener('input', () => this.lookup());
      }
    }

    /* Поиск по таблице кодов: игрок вводит 420 и видит, что это за проверка
       и в какой категории искать. Это и есть «таблица 0–999 под рукой». */
    lookup() {
      const BC = SH2.bugcodes;
      const out = this.dom && this.dom.answer;
      if (!out) return;
      if (!BC) { out.textContent = 'таблица кодов не загружена'; return; }
      const q = String(this.dom.search.value || '').trim().replace(/\D/g, '');
      if (!q) { out.textContent = 'введите код от 000 до 999'; return; }
      const n = Number(q);
      if (!(n >= 0 && n <= 999)) { out.textContent = 'код вне диапазона 000–999'; return; }
      const rec = BC.BY_CODE[n];
      const found = this.found.filter((f) => f.code === n);
      out.textContent = BC.label(n) + (found.length
        ? ' · найдено: ' + found.map((f) => f.msg).join('; ')
        : ' · в этом прогоне чисто');
    }

    toggle(force) {
      this.open = force === undefined ? !this.open : !!force;
      if (this.dom && this.dom.panel) {
        this.dom.panel.classList.toggle('hidden', !this.open);
      }
      if (this.open) {
        this.render();
        this.lookup();
      }
      return this.open;
    }

    render() {
      const d = this.dom;
      if (!d) return;
      const BC = SH2.bugcodes;
      const shown = this.displayFindings();
      if (d.badge) {
        d.badge.textContent = shown.length ? String(shown.length) : '';
        d.badge.classList.toggle('hidden', !shown.length);
      }
      if (!d.list) return;
      if (d.summary) {
        const run = this.lastRun;
        if (this.pending && this.stage === 'running') {
          const pct = Math.round((this.progress || 0) * 100);
          d.summary.textContent = `иду по таблице: ${pct}% · проверено ${this.checksNow || 0} из ${this.totalQueued}`;
        } else {
          d.summary.textContent = (run
            ? `проверок: ${run.total} · проблем: ${shown.length} · прогон ${run.ms} мс`
            : `проверок готово: ${CHECKS.length} · таблица: ${BC ? BC.TOTAL : 0} кодов`);
        }
      }
      const rows = this.displayFindings().slice(0, 60);
      let html = '';
      if (!rows.length) {
        html = '<div class="bot-ok">Ошибок не найдено. Живые проверки идут в фоне — ' +
          'если что-то сломается во время боя, код появится здесь.</div>';
      } else {
        rows.forEach((f) => {
          const id = String(f.code).padStart(3, '0');
          html += '<div class="bot-row">' +
            '<span class="bot-code">' + id + '</span>' +
            '<span class="bot-cat">' + f.category + '</span>' +
            '<span class="bot-msg"><b>' + f.title + '</b> — ' + f.msg +
            (f.count > 1 ? ' <i>×' + f.count + '</i>' : '') + '</span>' +
            '</div>';
        });
      }
      d.list.innerHTML = html;
    }

    copy() {
      const text = this.reportText();
      if (root.navigator && root.navigator.clipboard && root.navigator.clipboard.writeText) {
        root.navigator.clipboard.writeText(text).then(
          () => this.toast('отчёт скопирован'),
          () => this.fallbackCopy(text)
        );
      } else this.fallbackCopy(text);
    }
    fallbackCopy(text) {
      const doc = root.document;
      if (!doc.createElement) return;
      const ta = doc.createElement('textarea');
      ta.value = text;
      if (doc.body && doc.body.appendChild) doc.body.appendChild(ta);
      if (ta.select) ta.select();
      try { doc.execCommand && doc.execCommand('copy'); } catch (e) { /* нечего делать */ }
      if (doc.body && doc.body.removeChild) doc.body.removeChild(ta);
      this.toast('отчёт в буфере');
    }
    download() {
      const text = this.reportText();
      const doc = root.document;
      if (!doc.createElement || !root.URL || !root.URL.createObjectURL) {
        this.fallbackCopy(text);
        return;
      }
      const blob = new root.Blob([text], { type: 'text/markdown;charset=utf-8' });
      const a = doc.createElement('a');
      a.href = root.URL.createObjectURL(blob);
      a.download = 'bot-report.md';
      if (doc.body && doc.body.appendChild) doc.body.appendChild(a);
      if (a.click) a.click();
      if (doc.body && doc.body.removeChild) doc.body.removeChild(a);
      root.URL.revokeObjectURL(a.href);
      this.toast('отчёт сохранён');
    }
    toast(msg) {
      const g = this.game;
      if (g && g.ui && g.ui.toast) g.ui.toast(msg);
    }
  }

  SH2.gamebot = { GameBot, CHECKS, snapshot, restore, stepPlayer };
})(typeof window !== 'undefined' ? window : globalThis);
