// Игровое ядро: движок RatCore, загрузка обученных мозгов, склад, бригада, приказы.
window.WC = window.WC || {};

WC.game = (function () {
  'use strict';

  var cfg = null;
  var socialRng = null;
  var S = {
    time: 0,
    paused: false,
    speed: 1,
    shiftEnded: false,
    autosaveClock: 0,
    accumulator: 0,
    totalReal: 0,
  };

  var api = {
    state: null,
    sim: null,
    crew: [],
    commands: [],
    activeWorkerId: null,
    engine: null,
    brains: {},
    baseBrain: null,
    brainMeta: null,
    shiftsPlayed: 0,
    best: null,
    engineStats: null,
    ready: false,
    log: [],
    onEvent: null,
    onShiftEnd: null,
    lastFrame: 0,
    staff: [],
    purchases: { medic: 0, watchman: 0 },
    pair: null,
    deaths: [],
    day: 1,
    needsCleanup: false,
    envs: {},
  };

  // ------------------------------------------------------------- магазин
  // Медик лечит травмы, сторож ловит за катание на погрузчике и напоминает
  // правила. Покупаются за очки смены, работают до конца смены.
  var STAFF_DEFS = {
    medic: {
      kind: 'medic', name: 'Полина Верес', role: 'Медик', cost: 120,
      palette: {
        skin: '#e0b393', hair: '#6b4a34', shirt: '#e9eef1', vest: '#d8e3e6',
        pants: '#4b5b66', boots: '#2a3136', gloves: '#9fd8c3', hat: '#e9eef1',
      },
      speed: 1.5,
    },
    watchman: {
      kind: 'watchman', name: 'Егор Сомов', role: 'Сторож', cost: 100,
      palette: {
        skin: '#c99a72', hair: '#2b2118', shirt: '#233a57', vest: '#37567c',
        pants: '#222c36', boots: '#15191c', gloves: '#3d4a55', hat: '#37567c',
      },
      speed: 1.15,
    },
  };

  function pushLog(text, tone) {
    api.log.push({ t: api.sim ? api.sim.state.time : 0, text: text, tone: tone || 'info' });
    if (api.log.length > 80) api.log.shift();
  }

  function emit(type, payload) {
    if (typeof api.onEvent === 'function') api.onEvent(type, payload);
  }

  function loadJson(url) {
    return fetch(url, { cache: 'no-store' }).then(function (res) {
      if (!res.ok) throw new Error('Не удалось загрузить ' + url + ' (' + res.status + ')');
      return res.json();
    });
  }

  function bootEngine() {
    var GE = window.GamesEngine;
    if (!GE || typeof GE.create !== 'function') {
      return Promise.reject(new Error('shared/engine.js не загрузился: нет GamesEngine.create'));
    }
    // ВАЖНО: GamesEngine.create() возвращает НЕ промис, а holder
    // {engine, ready, promise, onReady()}. Движок в нём появляется асинхронно.
    var holder = GE.create({ preset: 'survival', packs: ['pack:ai-team'] });
    var wait = holder && holder.promise ? holder.promise : Promise.resolve(holder);
    return Promise.resolve(wait).then(function (resolved) {
      var engine = (resolved && resolved.engine) || (holder && holder.engine) || resolved;
      if (!engine || !engine.tools) throw new Error('RatCore вернул пустой экземпляр движка');
      api.engine = engine;
      return engine;
    });
  }

  // Запасной мозг, если данные вообще недоступны (архив, file://, битые файлы):
  // детерминированные веса, чтобы смена всё равно началась.
  function syntheticBrain(seed) {
    var s = (seed || 20261120) >>> 0;
    function rnd() {
      s = (s * 1664525 + 1013904223) >>> 0;
      return (s / 4294967296) * 2 - 1;
    }
    var sizes = [18, 24, 16, 6];
    var layers = [];
    for (var l = 1; l < sizes.length; l++) {
      var fanIn = sizes[l - 1];
      var fanOut = sizes[l];
      var w = [];
      var b = [];
      var scale = Math.sqrt(2 / (fanIn + fanOut));
      for (var o = 0; o < fanOut; o++) {
        for (var i = 0; i < fanIn; i++) w.push(Number((rnd() * scale).toFixed(4)));
        b.push(Number((rnd() * 0.05).toFixed(4)));
      }
      layers.push({ in: fanIn, out: fanOut, activation: l === sizes.length - 1 ? 'sigmoid' : 'tanh', w: w, b: b });
    }
    return { format: 'warehouse-brain/1', layers: layers, synthetic: true };
  }

  function applyBrains(base, meta, perCrew) {
    api.baseBrain = base;
    api.brainMeta = meta || null;
    cfg.crew.forEach(function (member) {
      api.brains[member.id] = (perCrew && perCrew[member.id]) || base;
    });
    return api.baseBrain;
  }

  function loadBrains() {
    // 1. Мозги «в коде» — работают всегда, в том числе с диска (file://),
    //    где fetch() для локальных JSON браузеры блокируют.
    var inline = typeof window !== 'undefined' ? window.WC_BRAINS : null;
    if (inline && inline.base && inline.base.layers) {
      api.brainSource = 'inline';
      return Promise.resolve(applyBrains(inline.base, inline.log, inline.brains));
    }
    // 2. Обычная загрузка по сети (GitHub Pages, локальный сервер).
    var tasks = [loadJson(cfg.brains.base), loadJson(cfg.brains.log).catch(function () { return null; })];
    cfg.crew.forEach(function (member) {
      tasks.push(loadJson(member.brain).catch(function () { return null; }));
    });
    return Promise.all(tasks).then(function (results) {
      var perCrew = {};
      cfg.crew.forEach(function (member, i) { perCrew[member.id] = results[i + 2]; });
      api.brainSource = 'fetch';
      return applyBrains(results[0], results[1], perCrew);
    }).catch(function (err) {
      // 3. Последний рубеж — синтетический мозг, чтобы игра не падала.
      console.warn('[warehouse-crew] мозги не загрузились, играю на запасном:', err && err.message);
      api.brainSource = 'synthetic';
      pushLog('Мозги не загрузились — включён запасной режим', 'warn');
      return applyBrains(syntheticBrain(cfg.seed), null, null);
    });
  }

  function makeEnv(worker) {
    return {
        warehouse: api.sim,
        workers: api.crew,
        brain: api.brains[worker.id] || api.baseBrain,
        brainApi: window.WarehouseBrain,
        rng: window.WarehouseSim.createRng(cfg.seed + worker.id.length * 13),
        onDelivered: function (w, order, result) {
          pushLog(w.name + ' закрыл ' + order.code + ' (+' + result.points + ')', result.late ? 'warn' : 'good');
          WC.audio.delivered();
          emit('delivered', { worker: worker, order: order, result: result });
        },
        onInjury: function (w, injury) {
          pushLog(w.name + ' травмирован: ' + injury.text, 'bad');
          if (WC.audio && WC.audio.drop) WC.audio.drop();
          if (injury.severity >= 0.2 && api.sim.emitBlood) api.sim.emitBlood(w.pos.x, w.pos.y, injury.severity);
          if (WC.world && WC.world.kick) WC.world.kick(0.5);
          emit('injury', { worker: worker, injury: injury });
        },
        onRefused: function (w, order, reason) {
          pushLog(w.name + ' отказался от ' + order.code + ': ' + reason, 'warn');
          emit('refused', { worker: worker, order: order, reason: reason });
        },
        onLoaded: function (w, order, result) {
          pushLog(w.name + ' загрузил ' + order.code + ' в фуру (+' + result.points + ')', 'good');
          if (WC.audio && WC.audio.delivered) WC.audio.delivered();
          emit('loaded', { worker: worker, order: order, result: result });
        },
        onDropped: function (w, order, outcome) {
          pushLog(w.name + ' уронил ' + order.code + ' — ' + Math.round(order.damage * 100) + '% повреждений', 'bad');
          WC.audio.drop();
          emit('dropped', { worker: worker, order: order, outcome: outcome });
        },
      onCaught: function (w) {
        api.staff.forEach(function (m) {
          if (m.kind === 'watchman') m.state.stats.caught += 1;
        });
        emit('caught', { worker: worker });
      },
      onDeath: function (w, cause) {
        onWorkerDeath(worker, cause);
      },
    };
  }

  function createSim() {
    socialRng = window.WarehouseSim.createRng(cfg.seed + 7719);
    api.sim = window.WarehouseSim.createWarehouse({
      seed: cfg.seed,
      shiftLength: cfg.shiftRealSeconds,
      spawnEvery: cfg.orderSpawnEvery,
      maxPending: cfg.maxPending,
      firstSpawnDelay: 3,
      truckEvery: cfg.truckEvery,
      firstTruckDelay: cfg.firstTruckDelay,
    });
    api.crew = cfg.crew.map(function (member, i) {
      return window.WarehouseWorker.createWorker({
        id: member.id,
        name: member.name,
        role: member.role,
        gender: member.gender,
        palette: member.palette,
        traits: member.traits,
        overrides: member.body,
        model: window.WarehouseModel,
        layout: api.sim.layout,
        spawn: api.sim.layout.spawns[i],
        heading: 0,
      });
    });
    api.activeWorkerId = api.crew[0] ? api.crew[0].id : null;
    api.envs = {};
    api.crew.forEach(function (worker) {
      api.envs[worker.id] = makeEnv(worker);
    });
    api.day = api.sim.state.day;
    api.pair = {
      ids: null, phase: 'idle', timer: 55 + socialRng.next() * 20,
      spot: null, until: 0, goTimer: 0, privacy: false, count: 0,
    };
    api.state = S;
    api.state.time = 0;
    return api.sim;
  }


  // ------------------------------------------------------- магазин и персонал
  function makeAnim() {
    return {
      phase: 0, walk: 0, lean: 0, armSwing: 0, breath: 0,
      run: 0, stride: 0, limp: 0, torsoTwist: 0, headTurn: 0,
      hurt: { shoulder: 0, back: 0, head: 0, wrist: 0, knee: 0, ankle: 0 },
      muscle: { legs: 0, back: 0, arms: 0, shoulders: 0 },
      drive: 0, sit: 0, blink: 0,
    };
  }

  function createStaffMember(kind) {
    var def = STAFF_DEFS[kind];
    if (!def) return null;
    var gate = api.sim.layout.street ? { x: api.sim.layout.street.gate.x, y: 6.1 } : { x: -8.9, y: 6.1 };
    var traits = window.WarehouseModel.normalizeTraits({
      endurance: 0.72, strength: 0.5, precision: 0.82, caution: 0.85,
      paceTrait: 0.5, neuroticism: 0.2, recovery: 0.7, coop: 0.85,
    });
    var body = window.WarehouseModel.createBody(traits, { gender: kind === 'medic' ? 'ж' : 'м' });
    var st = {
      id: 'staff-' + kind,
      name: def.name,
      role: def.role,
      palette: def.palette,
      kind: kind,
      body: body,
      at: api.sim.state.time,
      targetId: null,
      patrol: kind === 'watchman' ? 0 : 0,
      state: {
        id: 'staff-' + kind, name: def.name, role: def.role, palette: def.palette,
        pos: { x: gate.x + (kind === 'medic' ? 1.0 : 0.5), y: gate.y },
        heading: Math.PI * 0.5,
        speedNow: 0,
        state: 'idle',
        carryingId: null,
        turnRate: 0,
        anim: makeAnim(),
        safety: { fear: 0, strikes: 0 },
        stats: { healed: 0, caught: 0, delivered: 0, dropped: 0, metres: 0, picked: 0, restSeconds: 0 },
      },
    };
    st.state.anim.breath = socialRng.next() * 3;
    return st;
  }

  function staffCost(kind) {
    return STAFF_DEFS[kind] ? STAFF_DEFS[kind].cost : 0;
  }

  function hasStaff(kind) {
    for (var i = 0; i < api.staff.length; i++) if (api.staff[i].kind === kind) return true;
    return false;
  }

  function buyStaff(kind) {
    var def = STAFF_DEFS[kind];
    if (!def) return { ok: false, reason: 'Нет такого сотрудника' };
    if (!api.ready || !api.sim) return { ok: false, reason: 'Смена ещё не началась' };
    if (hasStaff(kind)) return { ok: false, reason: def.role + ' уже нанят' };
    var score = api.sim.state.stats.score;
    if (score < def.cost) {
      return { ok: false, reason: 'Не хватает очков: нужно ' + def.cost + ', а на счету ' + Math.round(score) };
    }
    api.sim.state.stats.score -= def.cost;
    var member = createStaffMember(kind);
    api.staff.push(member);
    if (WC.world && WC.world.state.ready) WC.world.attachCrew({ api: api });
    api.purchases[kind] = (api.purchases[kind] || 0) + 1;
    if (api.sim.state.staff) api.sim.state.staff[kind] = { hired: true, hiredAt: api.sim.state.time };
    pushLog(def.role + ' ' + def.name + ' нанят за ' + def.cost + ' очков', 'good');
    if (WC.audio && WC.audio.select) WC.audio.select();
    emit('staff', { kind: kind, member: member });
    return { ok: true, member: member, cost: def.cost };
  }

  // Медик идёт к самому травмированному, сторож обходит зал по кругу.
  function stepStaff(dt) {
    if (!api.staff.length) return;
    api.crew.forEach(function (w) { w.medicalAid = false; });
    api.staff.forEach(function (member) {
      var st = member.state;
      var anim = st.anim;
      var goal = null;
      var target = null;
      if (member.kind === 'medic') {
        var worst = null;
        var worstLevel = 0;
        api.crew.forEach(function (w) {
          if (w.state.dead) return;
          var level = window.WarehouseModel.injuryLevel(w.body);
          if (level > worstLevel) { worstLevel = level; worst = w; }
        });
        if (worst && worstLevel > 0.01) { target = worst; goal = worst.state.pos; }
        else goal = { x: -7.0, y: 6.7 };
        member.targetId = worst ? worst.state.id : null;
      } else {
        member.patrol += dt * 0.14;
        goal = { x: -0.6 + Math.cos(member.patrol) * 5.4, y: 0.2 + Math.sin(member.patrol) * 4.4 };
      }
      // Персонал использует ту же сетку обхода препятствий, что и бригада.
      var speed = 0;
      if (goal) {
        var nav = member.nav || (member.nav = { path: [], goal: null, timer: 0 });
        nav.timer -= dt;
        var deltaGoal = nav.goal ? Math.hypot(nav.goal.x - goal.x, nav.goal.y - goal.y) : Infinity;
        if (nav.timer <= 0 || deltaGoal > 1.1) {
          nav.path = window.WarehouseWorker.findPath(st.pos, goal) || [];
          nav.goal = { x: goal.x, y: goal.y };
          nav.timer = 1.5;
        }
        while (nav.path.length && Math.hypot(nav.path[0].x - st.pos.x, nav.path[0].y - st.pos.y) < 0.16) nav.path.shift();
        var nextPoint = nav.path[0];
        var distanceToGoal = Math.hypot(goal.x - st.pos.x, goal.y - st.pos.y);
        if (nextPoint && distanceToGoal > (member.kind === 'medic' ? 0.95 : 0.3)) {
          var dx = nextPoint.x - st.pos.x, dy = nextPoint.y - st.pos.y;
          var dist = Math.hypot(dx, dy);
          if (dist > 0.001) {
            var desired = STAFF_DEFS[member.kind].speed * (1 - 0.25 * member.body.fatigue);
            speed = Math.min(dist / Math.max(dt, 1e-4), desired, st.speedNow + 3 * dt);
            var next = { x: st.pos.x + dx / dist * speed * dt, y: st.pos.y + dy / dist * speed * dt };
            if (window.WarehouseWorker.insideWalk(next.x, next.y, api.sim.layout) &&
                !window.WarehouseWorker.pathBlocked(st.pos, next, 0.30)) {
              st.pos.x = next.x; st.pos.y = next.y;
              st.heading = Math.atan2(dy, dx);
              st.stats.metres += speed * dt;
            } else { speed = 0; nav.path = []; nav.timer = 0; }
          }
        }
      }
      st.speedNow = speed;
      if (member.kind === 'medic' && target) {
        var d = Math.hypot(target.state.pos.x - st.pos.x, target.state.pos.y - st.pos.y);
        if (d < 1.8 && !window.WarehouseWorker.pathBlocked(st.pos, target.state.pos, 0.02)) {
          var healed = window.WarehouseModel.healInjuries(target.body, dt, true, 8);
          target.body.vitality = Math.min(1, target.body.vitality + dt * 0.02);
          target.body.blood = Math.min(1, target.body.blood + dt * 0.01);
          target.body.pain = Math.max(0, target.body.pain - dt * 0.06);
          target.medicalAid = true;
          if (healed > 0) {
            st.stats.healed += healed;
            pushLog(def_medic_name() + ' залечил травму: ' + target.state.name, 'good');
            emit('healed', { worker: target });
          }
        }
      }
      // Та же анимация, что у рабочих: шаг, дыхание, поворот корпуса
      var moving = speed > 0.05;
      anim.walk += ((moving ? 1 : 0) - anim.walk) * Math.min(1, dt * 8);
      anim.phase += dt * (2.2 + 5.2 * Math.min(1.5, speed / 1.2)) * (moving ? 1 : 0);
      anim.breath += dt * 0.9;
      anim.armSwing = Math.sin(anim.phase) * 0.55 * anim.walk;
      anim.lean += ((0.02 + (speed > 1.35 ? 0.1 : 0)) - anim.lean) * Math.min(1, dt * 4);
      var twist = Math.max(-0.4, Math.min(0.4, (st.turnRate || 0) * 0.05));
      anim.torsoTwist += (twist - anim.torsoTwist) * Math.min(1, dt * 5);
      st.turnRate = moving ? Math.abs(Math.sin(anim.phase)) * 1.2 : 0;
      anim.headTurn += ((goal ? 0.12 : 0) - anim.headTurn) * Math.min(1, dt * 3);
    });
    var watch = null;
    api.staff.forEach(function (m) { if (m.kind === 'watchman') watch = m.state.pos; });
    api.crew.forEach(function (w) {
      var env = api.envs[w.state.id];
      if (!env) return;
      env.medicNear = Boolean(w.medicalAid);
      env.watchman = watch ? { x: watch.x, y: watch.y } : null;
    });
  }

  function def_medic_name() {
    for (var i = 0; i < api.staff.length; i++) if (api.staff[i].kind === 'medic') return api.staff[i].name;
    return 'Медик';
  }

  // ------------------------------------------------- уединение пары Ж и М
  function stepPair(dt) {
    var p = api.pair;
    if (!p) return;
    if (p.phase === 'idle') {
      p.timer -= dt;
      if (p.timer <= 0) tryMeet();
      return;
    }
    if (p.phase === 'go') {
      p.goTimer += dt;
      var a = workerById(p.a);
      var b = workerById(p.b);
      if (!a || !b || a.state.dead || b.state.dead) { endMeet(); return; }
      if (a.state.state === 'meet' && b.state.state === 'meet') {
        p.phase = 'meet';
        p.privacy = true;
        p.until = 15;
        p.count += 1;
        api.sim.state.stats.privacy = (api.sim.state.stats.privacy || 0) + 1;
        pushLog(a.state.name + ' и ' + b.state.name + ' уединились: ' + (p.spot && p.spot.label ? p.spot.label : 'укромное место'), 'info');
        emit('privacy', { on: true, ids: [a.state.id, b.state.id] });
      } else if (p.goTimer > 26) {
        endMeet();
      }
      return;
    }
    if (p.phase === 'meet') {
      p.until -= dt;
      var a2 = workerById(p.a);
      var b2 = workerById(p.b);
      if (p.until <= 0 || !a2 || !b2 || a2.state.dead || b2.state.dead) endMeet();
    }
  }

  function tryMeet() {
    var p = api.pair;
    p.timer = 95 + socialRng.next() * 60;
    if (!api.sim || !api.sim.layout.privacySpots || api.sim.layout.privacySpots.length < 1) return;
    var free = api.crew.filter(function (w) {
      var st = w.state;
      return !st.dead && !st.carryingId && !st.orderId && (st.state === 'idle' || st.state === 'rest');
    });
    var woman = null;
    var man = null;
    for (var i = 0; i < free.length; i++) {
      if (!woman && free[i].state.gender === 'ж') woman = free[i];
      else if (!man && free[i].state.gender === 'м') man = free[i];
    }
    if (!woman || !man) return;
    var spots = api.sim.layout.privacySpots;
    p.spot = spots[Math.floor(socialRng.next() * spots.length) % spots.length];
    p.a = woman.state.id;
    p.b = man.state.id;
    p.phase = 'go';
    p.goTimer = 0;
    p.privacy = false;
    command(woman.state.id, 'meet', { spot: { x: p.spot.x - 0.42, y: p.spot.y }, meetId: 'pair', until: 15, keepAuto: true });
    command(man.state.id, 'meet', { spot: { x: p.spot.x + 0.42, y: p.spot.y }, meetId: 'pair', until: 15, keepAuto: true });
    pushLog(woman.state.name + ' и ' + man.state.name + ' отошли вдвоём (' + (p.spot.label || 'укромное место') + ')', 'info');
  }

  function endMeet() {
    var p = api.pair;
    if (!p) return;
    if (p.privacy) emit('privacy', { on: false, ids: [] });
    [p.a, p.b].forEach(function (id) {
      var w = workerById(id);
      if (w && (w.state.state === 'meet' || w.state.state === 'toMeet')) {
        w.state.privacy = false;
        w.command('wait', api.sim, { keepAuto: true });
      }
    });
    p.phase = 'idle';
    p.privacy = false;
    p.a = null;
    p.b = null;
    p.until = 0;
    p.goTimer = 0;
    p.timer = 100 + socialRng.next() * 60;
  }

  // -------------------------------------------------- смерть и пополнение
  function onWorkerDeath(worker, cause) {
    api.deaths.push({
      name: worker.state.name, cause: cause,
      day: api.sim.state.day, at: Math.round(api.sim.state.time),
    });
    pushLog(worker.state.name + ' погиб: ' + cause + '. Замена выйдет в новый день', 'bad');
    api.needsCleanup = true;
    if (WC.audio && WC.audio.shiftEnd) WC.audio.shiftEnd();
    if (WC.world && WC.world.kick) WC.world.kick(0.9);
    emit('death', { worker: worker, cause: cause });
  }

  function cleanupDead() {
    api.needsCleanup = false;
    api.crew = api.crew.filter(function (w) {
      if (!w.state.dead) return true;
      delete api.envs[w.state.id];
      if (WC.world && WC.world.removeView) WC.world.removeView(w.state.id);
      return false;
    });
    if (!workerById(api.activeWorkerId) && api.crew[0]) api.activeWorkerId = api.crew[0].state.id;
    if (api.pair && api.pair.phase !== 'idle') {
      var a = workerById(api.pair.a);
      var b = workerById(api.pair.b);
      if (!a || !b) endMeet();
    }
  }

  var HIRE_NAMES = [
    { name: 'Лида Кравцова', gender: 'ж', role: 'Комплектовщица' },
    { name: 'Артём Белов', gender: 'м', role: 'Грузчик' },
    { name: 'Соня Мартынова', gender: 'ж', role: 'Кладовщица' },
    { name: 'Фёдор Ильин', gender: 'м', role: 'Водитель погрузчика' },
    { name: 'Ника Соловьёва', gender: 'ж', role: 'Приёмщица' },
    { name: 'Юра Панов', gender: 'м', role: 'Разнорабочий' },
  ];

  var HIRE_PALETTES = [
    { skin: '#d9a982', hair: '#3a2a22', shirt: '#4b6b4a', vest: '#d8c088', pants: '#33424c', boots: '#23292c', gloves: '#c8b48c', hat: '#d8c088' },
    { skin: '#c08a63', hair: '#1f1a17', shirt: '#5c4b7a', vest: '#c7c0d8', pants: '#2f3a46', boots: '#1f2427', gloves: '#a8a2b8', hat: '#c7c0d8' },
    { skin: '#e3b795', hair: '#6d4a2f', shirt: '#8a5a3a', vest: '#e6d2a9', pants: '#3a444d', boots: '#20262a', gloves: '#b99a72', hat: '#e6d2a9' },
    { skin: '#d3a077', hair: '#25201d', shirt: '#2f6470', vest: '#a9d3cf', pants: '#31404a', boots: '#23292c', gloves: '#b9c2c9', hat: '#a9d3cf' },
  ];

  function hireReplacements() {
    var target = cfg.crew.length;
    var guard = 0;
    while (api.crew.length < target && guard < 4) {
      guard += 1;
      spawnReplacement();
    }
  }

  function spawnReplacement() {
    var seq = api.sim.state.hires.length + api.deaths.length + api.crew.length;
    var person = HIRE_NAMES[seq % HIRE_NAMES.length];
    var palette = HIRE_PALETTES[seq % HIRE_PALETTES.length];
    var rng = window.WarehouseSim.createRng((cfg.seed + api.sim.state.day * 977 + seq * 131) >>> 0);
    var traits = {
      endurance: rng.range(0.45, 0.85), strength: rng.range(0.45, 0.85),
      precision: rng.range(0.45, 0.9), caution: rng.range(0.3, 0.8),
      paceTrait: rng.range(0.4, 0.85), neuroticism: rng.range(0.15, 0.6),
      recovery: rng.range(0.4, 0.8), coop: rng.range(0.4, 0.9),
    };
    var spawn = api.sim.layout.street
      ? { x: api.sim.layout.street.gate.x + rng.range(0.5, 0.8), y: 6.1 }
      : api.sim.layout.spawns[0];
    var worker = window.WarehouseWorker.createWorker({
      id: 'hire-' + api.sim.state.day + '-' + (api.crew.length + 1) + '-' + seq,
      name: person.name,
      role: person.role,
      gender: person.gender,
      palette: palette,
      traits: traits,
      model: window.WarehouseModel,
      layout: api.sim.layout,
      spawn: spawn,
      heading: Math.PI * 0.5,
    });
    api.crew.push(worker);
    api.envs[worker.state.id] = makeEnv(worker);
    api.sim.state.hires.push({ name: person.name, day: api.sim.state.day, t: Math.round(api.sim.state.time) });
    api.sim.state.stats.hires = (api.sim.state.stats.hires || 0) + 1;
    if (WC.world && WC.world.attachCrew) WC.world.attachCrew({ api: api });
    pushLog('Новый работяга: ' + person.name + ' (' + person.role + ') вышел на смену', 'good');
    emit('hire', { worker: worker });
    return worker;
  }

  function qualityPercent(game) {
    var g = game || api;
    var sum = 0;
    var count = 0;
    g.sim.state.orders.forEach(function (order) {
      if (order.status === 'stored') {
        count += 1;
        var late = order.storedAt > order.deadline ? 0.72 : 1;
        sum += (1 - order.damage) * late;
      } else if (order.status === 'ruined') {
        count += 1;
        sum += 0;
      }
    });
    if (!count) return 100;
    return Math.round((sum / count) * 100);
  }

  function activeWorker() {
    for (var i = 0; i < api.crew.length; i++) {
      if (api.crew[i].id === api.activeWorkerId) return api.crew[i];
    }
    return api.crew[0];
  }

  function workerById(id) {
    for (var i = 0; i < api.crew.length; i++) if (api.crew[i].id === id) return api.crew[i];
    return null;
  }

  function selectWorker(id) {
    api.activeWorkerId = id;
    if (window.WC.world) WC.world.setFocus(id);
    WC.audio.select();
    emit('select', { id: id });
    return api.activeWorkerId;
  }

  function command(workerId, cmd, opts) {
    var worker = workerById(workerId);
    if (!worker) return { ok: false, reason: 'Нет такого рабочего' };
    var res = worker.command(cmd, api.sim, opts || {});
    if (res.ok) {
      pushLog(worker.state.name + ': ' + labelForCommand(cmd), 'info');
      emit('command', { worker: worker, cmd: cmd, result: res });
    } else {
      pushLog(worker.state.name + ': ' + (res.reason || 'не получилось'), 'warn');
      emit('command-failed', { worker: worker, cmd: cmd, result: res });
    }
    return res;
  }

  function labelForCommand(cmd) {
    return {
      pick: 'взять коробку',
      store: 'нести к стеллажу',
      rest: 'на перерыв',
      wait: 'ждёт указаний',
      auto: 'автономия',
      help: 'помогает бригаде',
    }[cmd] || cmd;
  }

  function teamCommand(kind) {
    var results = [];
    api.crew.forEach(function (worker) {
      if (kind === 'intake') results.push(command(worker.id, 'pick', { keepAuto: true }));
      else if (kind === 'store') results.push(command(worker.id, 'store', { keepAuto: true }));
      else if (kind === 'rest') results.push(command(worker.id, 'rest', { keepAuto: true }));
      else if (kind === 'auto') results.push(command(worker.id, 'auto'));
    });
    pushLog('Приказ бригаде: ' + ({ intake: 'разгрузить приёмку', store: 'все на стеллаж', rest: 'общий перерыв', auto: 'автономия' }[kind] || kind), 'info');
    emit('team', { kind: kind, results: results });
    return results;
  }

  function setPaused(value) {
    S.paused = Boolean(value);
    var flag = document.getElementById('pause-flag');
    if (flag) flag.classList.toggle('show', S.paused);
    var btn = document.getElementById('btn-pause');
    if (btn) {
      btn.textContent = S.paused ? '▶' : '⏸';
      btn.classList.toggle('on', S.paused);
    }
    return S.paused;
  }

  function setSpeed(value) {
    S.speed = value;
    return S.speed;
  }

  function restart() {
    api.shiftsPlayed += 1;
    api.best = {
      score: Math.max((api.best && api.best.score) || 0, S.score || 0),
      delivered: Math.max((api.best && api.best.delivered) || 0, api.sim.state.stats.delivered),
    };
    api.log.length = 0;
    if (WC.world && WC.world.removeView) api.crew.concat(api.staff).forEach(function (w) { WC.world.removeView(w.state.id); });
    api.staff = [];
    api.purchases = { medic: 0, watchman: 0 };
    api.deaths = [];
    api.day = 1;
    api.needsCleanup = false;
    createSim();
    if (WC.world && WC.world.state.ready) WC.world.attachCrew({ api: api });
    S.paused = false;
    S.shiftEnded = false;
    S.accumulator = 0;
    setPaused(false);
    pushLog('Новая смена. Бригада на месте.', 'info');
    emit('restart', {});
  }

  function endShift() {
    if (S.shiftEnded) return;
    S.shiftEnded = true;
    S.paused = true;
    setPaused(true);
    WC.audio.shiftEnd();
    WC.save.save(api);
    if (typeof api.onShiftEnd === 'function') api.onShiftEnd(summary());
  }

  function summary() {
    var stats = api.sim.state.stats;
    return {
      score: Math.round(stats.score),
      delivered: stats.delivered,
      ruined: stats.ruined,
      missed: stats.missed,
      quality: qualityPercent(api),
      bestStreak: stats.bestStreak,
      loaded: stats.loaded,
      unloaded: stats.unloaded,
      truckShifts: stats.truckShifts,
      injuries: api.crew.reduce(function (sum, w) { return sum + (w.state.safety ? w.state.safety.injuries : 0); }, 0),
      deaths: api.deaths.length,
      hires: api.sim.state.hires.length,
      privacy: api.sim.state.stats.privacy || 0,
      staff: api.staff.map(function (m) { return { kind: m.kind, name: m.name, healed: m.state.stats.healed, caught: m.state.stats.caught }; }),
      crew: api.crew.map(function (w) {
        return {
          id: w.id,
          name: w.state.name,
          role: w.state.role,
          delivered: w.state.stats.delivered,
          dropped: w.state.stats.dropped,
          metres: Math.round(w.state.stats.metres),
          rest: Math.round(w.body.restSeconds),
          fatigue: Math.round(w.body.fatigue * 100),
          energy: Math.round(w.body.energy * 100),
          loaded: w.state.stats.loaded || 0,
          refusals: w.state.safety ? w.state.safety.refusals : 0,
          injuries: (w.body.injuries || []).map(function (inj) {
            return (window.WarehouseModel.BODY_PARTS[inj.part] || inj.part) + ' ' + Math.round(inj.severity * 100) + '%';
          }),
          compliance: window.WarehouseModel.ruleCompliance(w.body),
        };
      }),
    };
  }

  function detectBodyEvents(worker) {
    var events = worker.state.events || [];
    while (worker.state._seenEvents == null) worker.state._seenEvents = 0;
    while (worker.state._seenEvents < events.length) {
      var ev = events[worker.state._seenEvents++];
      pushLog(worker.state.name + ': ' + ev.text, ev.tone === 'bad' ? 'bad' : ev.tone === 'warn' ? 'warn' : 'info');
      emit('body-event', { worker: worker, event: ev });
    }
  }

  function update(dtReal) {
    if (!api.ready) return;
    var dt = Math.min(0.1, dtReal);
    api.state.totalReal += dt;
    if (S.paused || S.shiftEnded) {
      return;
    }
    var scaled = dt * S.speed;
    S.accumulator += scaled;
    var step = cfg.simStep;
    var guard = 0;
    var speedPerWorker = {};
    while (S.accumulator >= step && guard < 8) {
      S.accumulator -= step;
      guard += 1;
      api.sim.syncActors(api.crew.concat(api.staff), step);
      api.sim.step(step);
      stepStaff(step);
      stepPair(step);
      api.crew.forEach(function (worker) {
        worker.update(step, api.envs[worker.id]);
        detectBodyEvents(worker);
      });
      if (api.needsCleanup) cleanupDead();
      if (api.sim.state.day !== api.day) {
        api.day = api.sim.state.day;
        hireReplacements();
      }
      if (api.sim.state.time >= cfg.shiftRealSeconds) endShift();
    }
    api.state.autosaveClock = (api.state.autosaveClock || 0) + dt;
    if (api.state.autosaveClock > 25) {
      api.state.autosaveClock = 0;
      WC.save.save(api);
    }
  }

  function boot() {
    cfg = WC.CONFIG;
    api.ready = false;
    var loaded = WC.save.load();
    if (loaded) {
      api.best = { score: loaded.bestScore || 0, delivered: loaded.bestDelivered || 0 };
      api.shiftsPlayed = loaded.shifts || 0;
    }
    return Promise.all([bootEngine(), loadBrains()]).then(function (results) {
      var engine = results[0];
      // Прогреваем рабочие инструменты движка и собираем меши
      var meshStats = WC.meshes.buildAll(engine, palettesById());
      api.engineStats = meshStats;
      api.sim = createSim();
      pushLog('Смена началась: ' + cfg.crew.length + ' рабочих, мозги загружены из файлов игры', 'good');
      api.ready = true;
      return api;
    });
  }

  function palettesById() {
    var out = {};
    cfg.crew.forEach(function (member) { out[member.id] = member.palette; });
    return out;
  }

  function snapshotForUi() {
    var stats = api.sim.state.stats;
    return {
      time: api.sim.state.time,
      shiftLength: cfg.shiftRealSeconds,
      paused: S.paused,
      speed: S.speed,
      score: stats.score,
      delivered: stats.delivered,
      ruined: stats.ruined,
      missed: stats.missed,
      dropped: stats.dropped,
      quality: qualityPercent(api),
      pending: api.sim.pendingOrders().length,
      active: api.sim.activeOrders().length,
      ended: S.shiftEnded,
    };
  }

  return {
    boot: boot,
    update: update,
    restart: restart,
    endShift: endShift,
    summary: summary,
    selectWorker: selectWorker,
    activeWorker: activeWorker,
    workerById: workerById,
    command: command,
    teamCommand: teamCommand,
    buyStaff: buyStaff,
    staffCost: staffCost,
    hasStaff: hasStaff,
    hireReplacements: hireReplacements,
    spawnReplacement: spawnReplacement,
    setPaused: setPaused,
    setSpeed: setSpeed,
    qualityPercent: qualityPercent,
    snapshotForUi: snapshotForUi,
    pushLog: pushLog,
    api: api,
    get state() { return S; },
  };
})();

// Совместимость с save.js: сохраняем прогресс из ядра (best/shifts/crew)
Object.defineProperty(WC.game, 'best', { get: function () { return WC.game.api.best; } });
Object.defineProperty(WC.game, 'shiftsPlayed', { get: function () { return WC.game.api.shiftsPlayed; } });
Object.defineProperty(WC.game, 'crew', { get: function () { return WC.game.api.crew; } });
Object.defineProperty(WC.game, 'sim', { get: function () { return WC.game.api.sim; } });
