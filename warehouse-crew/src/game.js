// Игровое ядро: движок RatCore, загрузка обученных мозгов, склад, бригада, приказы.
window.WC = window.WC || {};

WC.game = (function () {
  'use strict';

  var cfg = null;
  var socialRng = null;
  var dialogueBatch = false;
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
    shiftMode: 'day',
    dialogueState: null,
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
    crewTarget: 3,
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

  function emitLine(line) {
    if (!line) return;
    pushLog(line.name + ': «' + line.text + '»', 'info');
    emit('dialogue', line);
  }

  function reactToEvent(worker, kind) {
    if (api.dialogueState && api.sim) emitLine(WC.dialogue.event(api.dialogueState, worker, kind, api.sim.state.time));
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
        shiftMode: api.shiftMode,
        workers: api.crew,
        brain: api.brains[worker.id] || api.baseBrain,
        brainApi: window.WarehouseBrain,
        rng: window.WarehouseSim.createRng(cfg.seed + worker.id.length * 13),
        onDelivered: function (w, order, result) {
          pushLog(w.name + ' закрыл ' + order.code + ' (+' + result.points + ')', result.late ? 'warn' : 'good');
          WC.audio.delivered();
          reactToEvent(worker, 'delivered');
          contractChanges(WC.contracts.record(api.contracts, api.sim.state.stats, api.sim.state.time, 'delivered', order));
          emit('delivered', { worker: worker, order: order, result: result });
        },
        onInjury: function (w, injury) {
          pushLog(w.name + ' травмирован: ' + injury.text, 'bad');
          if (WC.audio && WC.audio.drop) WC.audio.drop();
          if (injury.severity >= 0.2 && api.sim.emitBlood) api.sim.emitBlood(w.pos.x, w.pos.y, injury.severity);
          if (WC.world && WC.world.kick) WC.world.kick(0.5);
          reactToEvent(worker, 'injury');
          emit('injury', { worker: worker, injury: injury });
        },
        onRefused: function (w, order, reason) {
          pushLog(w.name + ' отказался от ' + order.code + ': ' + reason, 'warn');
          emit('refused', { worker: worker, order: order, reason: reason });
        },
        onLoaded: function (w, order, result) {
          pushLog(w.name + ' загрузил ' + order.code + ' в фуру (+' + result.points + ')', 'good');
          if (WC.audio && WC.audio.delivered) WC.audio.delivered();
          reactToEvent(worker, 'loaded');
          contractChanges(WC.contracts.record(api.contracts, api.sim.state.stats, api.sim.state.time, 'loaded', order));
          emit('loaded', { worker: worker, order: order, result: result });
        },
        onDropped: function (w, order, outcome) {
          pushLog(w.name + ' уронил ' + order.code + ' — ' + Math.round(order.damage * 100) + '% повреждений', 'bad');
          WC.audio.drop();
          reactToEvent(worker, 'dropped');
          contractChanges(WC.contracts.advance(api.contracts, api.sim.state.stats, api.sim.state.time));
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

  function contractChanges(changes) {
    changes.forEach(function (change) {
      var d = WC.contracts.definitions.find(function (x) { return x.id === change.id; });
      if (change.reward) api.sim.state.stats.score += change.reward;
      pushLog('Контракт «' + d.title + '»: ' + (change.status === 'completed' ? 'выполнен (+' + change.reward + ')' : change.reason), change.status === 'completed' ? 'good' : 'warn');
      emit('contract', change);
    });
  }
  function acceptContract(id) {
    if (!api.ready || !api.sim || S.shiftEnded) return { ok: false, reason: 'Смена не активна' };
    var result = WC.contracts.accept(api.contracts, id, api.sim.state.time, cfg.shiftRealSeconds, api.sim.state.stats);
    if (result.ok) { pushLog('Взят контракт «' + WC.contracts.definitions.find(function (d) { return d.id === id; }).title + '»', 'info'); WC.save.autosave(api); }
    return result;
  }
  function cancelContract(id) {
    if (!api.ready || !api.sim || S.shiftEnded) return { ok: false, reason: 'Смена не активна' };
    var result = WC.contracts.cancel(api.contracts, id, api.sim.state.time);
    if (result.ok) { contractChanges([result.change]); WC.save.autosave(api); }
    return result;
  }

  // Ручной вызов конкретного дока не меняет очередность автоматических рейсов.
  function callTruck(kind) {
    if (!api.ready || !api.sim || S.shiftEnded) return { ok: false, reason: 'Смена не активна' };
    if (kind !== 'load' && kind !== 'unload') return { ok: false, reason: 'Неизвестный тип фуры' };
    if (api.sim.activeTruck(kind)) return { ok: false, reason: 'Этот док занят — дождитесь отъезда фуры' };
    if (kind === 'load' && !api.sim.state.orders.some(function (o) { return o.status === 'stored'; })) return { ok: false, reason: 'На стеллажах нет груза для отгрузки' };
    if (kind === 'unload' && !api.sim.state.slots.some(function (slot) { return !slot.occupied; })) return { ok: false, reason: 'Нет свободных ячеек для разгрузки' };
    var truck = api.sim.spawnTruck(kind);
    if (!truck) return { ok: false, reason: 'Не удалось вызвать фуру' };
    pushLog('Вызвана фура ' + truck.plate + ': ' + (kind === 'load' ? 'загрузка' : 'разгрузка') + ', мест: ' + truck.total, 'info');
    WC.save.autosave(api);
    return { ok: true, truck: truck };
  }

  // Не награждаем за принудительный отъезд. Отгрузка, которой не хватило
  // времени, физически возвращается, а груз разгрузочной фуры остаётся в работе.
  function dispatchTruck(id) {
    if (!api.ready || !api.sim || S.shiftEnded) return { ok: false, reason: 'Смена не активна' };
    var truck = api.sim.truckById(id);
    if (!truck || truck.status !== 'working') return { ok: false, reason: 'Эта фура уже уехала' };
    var progress = api.sim.truckProgress(truck);
    api.sim.departTruck(truck, 'отправлена диспетчером');
    pushLog('Фура ' + truck.plate + ' отправлена досрочно (' + progress.done + '/' + progress.total + ')', 'warn');
    emit('truck-dispatched', { truck: truck, done: progress.done, total: progress.total });
    WC.save.autosave(api);
    return { ok: true, truck: truck, done: progress.done, total: progress.total };
  }

  function createSim() {
    api.contracts = WC.contracts.create();
    api.dialogueState = WC.dialogue.create(0);
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
    api.crewTarget = cfg.crew.length;
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
      if (!a || !b || a.state.dead || b.state.dead || a.body.collapsed || b.body.collapsed || a.state.state === 'down' || b.state.state === 'down') { endMeet(); return; }
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
      if (p.until <= 0 || !a2 || !b2 || a2.state.dead || b2.state.dead || a2.body.collapsed || b2.body.collapsed || a2.state.state === 'down' || b2.state.state === 'down') endMeet();
    }
  }

  function tryMeet() {
    var p = api.pair;
    p.timer = 95 + socialRng.next() * 60;
    if (!api.sim || !api.sim.layout.privacySpots || api.sim.layout.privacySpots.length < 1) return;
    var free = api.crew.filter(function (w) {
      var st = w.state;
      return !st.dead && !w.body.collapsed && !st.carryingId && !st.orderId && (st.state === 'idle' || st.state === 'rest');
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
    // После filter это новый массив: окружение каждого живого работника
    // должно видеть актуальную бригаду, включая будущие наймы.
    api.crew.forEach(function (w) { if (api.envs[w.id]) api.envs[w.id].workers = api.crew; });
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
    var target = api.crewTarget;
    var guard = 0;
    while (api.crew.length < target && guard < 8) {
      guard += 1;
      spawnReplacement();
    }
  }

  function spawnReplacement() {
    var seq = api.sim.state.hires.length + api.deaths.length + api.crew.length;
    var person = HIRE_NAMES[seq % HIRE_NAMES.length];
    for (var n = 0; n < HIRE_NAMES.length; n++) {
      var candidate = HIRE_NAMES[(seq + n) % HIRE_NAMES.length];
      if (!api.crew.some(function (w) { return w.state.name === candidate.name; })) { person = candidate; break; }
    }
    var palette = HIRE_PALETTES[seq % HIRE_PALETTES.length];
    var rng = window.WarehouseSim.createRng((cfg.seed + api.sim.state.day * 977 + seq * 131) >>> 0);
    var traits = {
      endurance: rng.range(0.45, 0.85), strength: rng.range(0.45, 0.85),
      precision: rng.range(0.45, 0.9), caution: rng.range(0.3, 0.8),
      paceTrait: rng.range(0.4, 0.85), neuroticism: rng.range(0.15, 0.6),
      recovery: rng.range(0.4, 0.8), coop: rng.range(0.4, 0.9),
    };
    // Ищем свободную точку в зоне отдыха, чтобы новички не появлялись друг в друге.
    var spawnCandidates = [{ x:-8.05, y:6.1 }, { x:-7.3, y:5.65 }, { x:-6.45, y:5.7 },
      { x:-5.65, y:5.6 }, { x:-7.9, y:7.0 }, { x:-6.3, y:6.3 }, { x:-5.6, y:6.5 }];
    var spawn = spawnCandidates[0];
    var bestClearance = -1;
    spawnCandidates.forEach(function (candidate) {
      if (!window.WarehouseWorker.insideWalk(candidate.x, candidate.y, api.sim.layout) ||
          window.WarehouseWorker.pathBlocked(candidate, candidate, 0.35)) return;
      var clearance = Infinity;
      api.crew.concat(api.staff).forEach(function (other) {
        clearance = Math.min(clearance, Math.hypot(other.state.pos.x - candidate.x, other.state.pos.y - candidate.y));
      });
      if (clearance > bestClearance) { bestClearance = clearance; spawn = candidate; }
    });
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

  function hireWorker() {
    var cost = cfg.shop.worker.cost, max = cfg.shop.worker.max;
    if (!api.ready || !api.sim || S.shiftEnded) return { ok: false, reason: 'Смена ещё не началась или уже закончилась' };
    if (api.crewTarget >= max) return { ok: false, reason: 'Бригада уже укомплектована: максимум ' + max };
    if (api.sim.state.stats.score < cost) return { ok: false, reason: 'Не хватает очков: нужно ' + cost };
    api.sim.state.stats.score -= cost;
    api.crewTarget += 1;
    var worker = spawnReplacement();
    pushLog('Нанят дополнительный рабочий за ' + cost + ' очков', 'good');
    return { ok: true, worker: worker, cost: cost };
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
    if (!dialogueBatch) emitLine(WC.dialogue.command(worker, cmd, res));
    return res;
  }

  // Метка диспетчера помогает выбрать свободный заказ, но не изменяет его
  // исходную ценность и не переназначает груз, уже взятый коллегой.
  function setOrderPriority(orderId, enabled) {
    if (!api.ready || !api.sim || S.shiftEnded) return { ok: false, reason: 'Смена не активна' };
    if (typeof enabled !== 'boolean') return { ok: false, reason: 'Некорректная метка' };
    var order = api.sim.state.orders.find(function (item) { return item.id === orderId; });
    if (!order || order.status !== 'pending') return { ok: false, reason: 'Заказ уже занят или недоступен' };
    if (Boolean(order.dispatchPriority) !== enabled) {
      order.dispatchPriority = enabled;
      pushLog(order.code + (enabled ? ': приоритет диспетчера' : ': приоритет снят'), 'info');
      emit('order-priority', { order: order, enabled: enabled });
    }
    return { ok: true, enabled: enabled };
  }

  // Отметка относится к физически находящимся на стеллаже товарам, а не
  // к уже назначенным бригаде задачам и не меняет стоимость/сроки заказов.
  function setShippingPriority(orderId, enabled) {
    if (!api.ready || !api.sim || S.shiftEnded) return { ok: false, reason: 'Смена не активна' };
    if (typeof enabled !== 'boolean') return { ok: false, reason: 'Некорректная метка' };
    var order = api.sim.state.orders.find(function (item) { return item.id === orderId; });
    if (!order || order.status !== 'stored') return { ok: false, reason: 'Груз уже не лежит на полке' };
    if (Boolean(order.shippingPriority) !== enabled) {
      if (enabled) order.shippingPriority = true; else delete order.shippingPriority;
      pushLog(order.code + (enabled ? ': отмечен для отгрузки' : ': отметка отгрузки снята'), 'info');
      emit('shipping-priority', { order: order, enabled: enabled });
      WC.save.autosave(api);
    }
    return { ok: true, enabled: enabled };
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
    var cmd = { intake: 'pick', store: 'store', rest: 'rest', auto: 'auto' }[kind];
    dialogueBatch = true;
    try {
      api.crew.forEach(function (worker) {
        if (cmd) results.push(command(worker.id, cmd, kind === 'auto' ? {} : { keepAuto: true }));
      });
    } finally { dialogueBatch = false; }
    pushLog('Приказ бригаде: ' + ({ intake: 'разгрузить приёмку', store: 'все на стеллаж', rest: 'общий перерыв', auto: 'автономия' }[kind] || kind), 'info');
    emit('team', { kind: kind, results: results });
    // Один слышимый ответ на бригадный приказ, в том числе при общем отказе.
    var response = null;
    [true, false].some(function (ok) {
      return results.some(function (result, index) {
        if (result.ok !== ok || !api.crew[index]) return false;
        response = WC.dialogue.command(api.crew[index], cmd, result);
        return Boolean(response);
      });
    });
    emitLine(response);
    return results;
  }

  function setPaused(value) {
    S.paused = Boolean(value);
    if (S.paused && WC.voice) WC.voice.cancel();
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

  function setShiftMode(mode) {
    if (mode !== 'day' && mode !== 'night') return false;
    if (api.shiftMode === mode) return true;
    api.shiftMode = mode;
    api.crew.forEach(function (worker) {
      if (api.envs[worker.id]) api.envs[worker.id].shiftMode = mode;
    });
    if (api.ready && api.sim) {
      pushLog(mode === 'night' ? 'Включён ночной режим освещения' : 'Включён дневной режим освещения', 'info');
      WC.save.autosave(WC.game);
      emit('lighting', { mode: mode });
    }
    return true;
  }

  function restart() {
    if (WC.voice) WC.voice.cancel();
    api.shiftsPlayed += 1;
    api.best = {
      score: Math.max((api.best && api.best.score) || 0, api.sim.state.stats.score || 0),
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
    WC.save.unprotect();
    api.resumeStatus = 'new';
    WC.save.autosave(WC.game);
    emit('restart', {});
  }

  function endShift() {
    if (S.shiftEnded) return;
    contractChanges(WC.contracts.finish(api.contracts, api.sim.state.time));
    S.shiftEnded = true;
    S.paused = true;
    setPaused(true);
    WC.audio.shiftEnd();
    WC.save.autosave(api);
    if (typeof api.onShiftEnd === 'function') api.onShiftEnd(summary());
  }

  function summary() {
    var stats = api.sim.state.stats;
    return {
      score: Math.round(stats.score),
      contracts: api.contracts.items.map(function (i) { var d = WC.contracts.definitions.find(function (x) { return x.id === i.id; }); return { id: i.id, title: d.title, status: i.status, progress: i.progress, goal: d.goal, reward: i.status === 'completed' ? d.reward : 0, reason: i.reason }; }),
      lighting: api.shiftMode,
      delivered: stats.delivered,
      ruined: stats.ruined,
      missed: stats.missed,
      dropped: stats.dropped,
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
      contractChanges(WC.contracts.advance(api.contracts, api.sim.state.stats, api.sim.state.time));
      if (api.needsCleanup) cleanupDead();
      emitLine(WC.dialogue.step(api.dialogueState, api.crew, api.sim.state.time, api.shiftMode, window.WarehouseWorker.pathBlocked));
      if (api.sim.state.day !== api.day) {
        api.day = api.sim.state.day;
        hireReplacements();
      }
      if (api.sim.state.time >= cfg.shiftRealSeconds) endShift();
    }
    api.state.autosaveClock = (api.state.autosaveClock || 0) + dt;
    if (api.state.autosaveClock > 25) {
      api.state.autosaveClock = 0;
      WC.save.autosave(api);
    }
  }

  // Только данные: функции, ссылки окружения и тела Cannon живут в фабриках.
  function captureCheckpoint() {
    return JSON.parse(JSON.stringify({
      version: 2, contracts: api.contracts, shiftMode: api.shiftMode, dialogueState: api.dialogueState, runtime: S, warehouse: api.sim.captureCheckpoint(),
      crew: api.crew.map(function (worker) {
        return { state: worker.state, brain: api.envs[worker.id].brain,
          rng: api.envs[worker.id].rng.getState() };
      }),
      staff: api.staff, pair: api.pair, socialRng: socialRng.getState(),
      purchases: api.purchases, deaths: api.deaths, day: api.day,
      needsCleanup: api.needsCleanup, crewTarget: api.crewTarget,
      activeWorkerId: api.activeWorkerId, log: api.log,
    }));
  }

  // Обязательные поля проверяются по объектам фабрики до подмены данных.
  function checkShape(value, template, path) {
    if (template === null || typeof template === 'function') return;
    if (Array.isArray(template)) {
      if (!Array.isArray(value)) throw new Error('Ожидался список: ' + path);
      if (value.length > 5000) throw new Error('Слишком длинный список: ' + path);
      return;
    }
    if (typeof template === 'object') {
      if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Ожидался объект: ' + path);
      Object.keys(template).forEach(function (key) {
        if (typeof template[key] !== 'function') checkShape(value[key], template[key], path + '.' + key);
      });
      return;
    }
    if (typeof value !== typeof template || (typeof value === 'number' && !Number.isFinite(value))) throw new Error('Некорректное поле: ' + path);
  }

  function restoreCheckpoint(saved) {
    if (!saved || saved.version !== 2 || !Array.isArray(saved.crew) || saved.crew.length > 8 ||
        !Array.isArray(saved.staff) || saved.staff.length > 2 || !Array.isArray(saved.deaths) || !Array.isArray(saved.log) ||
        !Number.isInteger(saved.crewTarget) || saved.crewTarget < 0 || saved.crewTarget > 8 ||
        !saved.warehouse || !saved.warehouse.state) throw new Error('Повреждён снимок смены');
    // Снимки v2, созданные до появления ночного режима, считаются дневными.
    var restoredContracts = saved.contracts == null ? WC.contracts.create() : WC.contracts.validate(saved.contracts);
    var restoredMode = saved.shiftMode == null ? 'day' : saved.shiftMode;
    if (restoredMode !== 'day' && restoredMode !== 'night') throw new Error('Неизвестный режим освещения');
    function safeTree(value, depth) {
      if (depth > 30) throw new Error('Слишком глубокое сохранение');
      if (typeof value === 'number' && !Number.isFinite(value)) throw new Error('Некорректное число');
      if (!value || typeof value !== 'object') return;
      if (Array.isArray(value) && value.length > 5000) throw new Error('Слишком длинный список');
      Object.keys(value).forEach(function (key) {
        if (key === '__proto__' || key === 'constructor' || key === 'prototype') throw new Error('Недопустимое поле');
        safeTree(value[key], depth + 1);
      });
    }
    safeTree(saved, 0);
    checkShape(saved.runtime, S, 'runtime');
    if ([1, 2, 4].indexOf(saved.runtime.speed) === -1 || saved.runtime.accumulator < 0) throw new Error('Повреждены часы смены');
    checkShape(saved.warehouse.state, api.sim.state, 'warehouse');
    checkShape(saved.pair, api.pair, 'pair');
    checkShape(saved.purchases, api.purchases, 'purchases');
    if (!Number.isFinite(saved.day) || typeof saved.needsCleanup !== 'boolean') throw new Error('Повреждены данные смены');
    var ids = Object.create(null);
    var workers = saved.crew.map(function (record) {
      if (!record || !record.state || typeof record.state.id !== 'string' || !record.state.id || ids[record.state.id]) throw new Error('Повреждена бригада');
      var st = record.state; ids[st.id] = true;
      var worker = window.WarehouseWorker.createWorker({ id: st.id, name: st.name, role: st.role,
        gender: st.gender, palette: st.palette, traits: st.traits, model: window.WarehouseModel,
        layout: api.sim.layout, spawn: st.pos, heading: st.heading });
      checkShape(st, worker.state, 'worker');
      if (!record.brain || !Array.isArray(record.brain.layers) || !record.brain.layers.length || record.brain.layers.length > 8) throw new Error('Повреждён мозг рабочего');
      var inputs = 18;
      record.brain.layers.forEach(function (layer) {
        if (!layer || !Array.isArray(layer.b) || !Array.isArray(layer.w) || layer.b.length < 1 || layer.b.length > 128 ||
            layer.w.length !== inputs * layer.b.length || !layer.w.every(Number.isFinite) || !layer.b.every(Number.isFinite)) throw new Error('Повреждены веса мозга');
        inputs = layer.b.length;
      });
      if (inputs !== 6) throw new Error('Неверный выход мозга');
      // Замыкание рабочего хранит исходное тело: обновляем его, а не меняем ссылку.
      Object.assign(worker.body, st.body);
      Object.assign(worker.traits, st.traits);
      Object.assign(worker.state, st);
      worker.state.body = worker.body; worker.state.traits = worker.traits;
      return worker;
    });
    var staff = saved.staff.map(function (record) {
      if (!record || !STAFF_DEFS[record.kind] || ids['staff-' + record.kind]) throw new Error('Повреждён персонал');
      ids['staff-' + record.kind] = true;
      var member = createStaffMember(record.kind);
      checkShape(record, member, 'staff');
      Object.assign(member.body, record.body);
      Object.assign(member, record); member.body = record.body;
      return member;
    });
    if (saved.activeWorkerId !== null && !workers.some(function (worker) { return worker.id === saved.activeWorkerId; })) throw new Error('Нет выбранного рабочего');
    var ws = saved.warehouse.state;
    ws.slots.forEach(function (slot, i) { checkShape(slot, api.sim.state.slots[i] || {}, 'slot'); });
    var orderIds = Object.create(null);
    ws.orders.forEach(function (order) {
      if (!order || typeof order.id !== 'string' || !order.id || orderIds[order.id] ||
          typeof order.status !== 'string' || !Number.isFinite(order.x) || !Number.isFinite(order.y) ||
          !Number.isFinite(order.mass) || !Number.isFinite(order.deadline) || !Number.isFinite(order.priority) ||
          (order.dispatchPriority != null && typeof order.dispatchPriority !== 'boolean') ||
          (order.shippingPriority != null && typeof order.shippingPriority !== 'boolean') ||
          !Number.isFinite(order.damage) || !order.pose || !Number.isFinite(order.pose.x) || !Number.isFinite(order.pose.y) || !Number.isFinite(order.pose.z)) throw new Error('Повреждён заказ');
      orderIds[order.id] = true;
    });
    ws.trucks.forEach(function (truck) {
      if (!truck || typeof truck.id !== 'string' || !truck.stand || !truck.door || !truck.handle ||
          !Number.isFinite(truck.x) || !Number.isFinite(truck.y) || typeof truck.status !== 'string') throw new Error('Повреждена фура');
    });
    api.sim.restoreCheckpoint(saved.warehouse, workers.map(function (worker) { return worker.state; }));
    api.shiftMode = restoredMode;
    api.contracts = restoredContracts;
    api.dialogueState = saved.dialogueState == null ? WC.dialogue.create(saved.warehouse.state.time) : WC.dialogue.validate(saved.dialogueState);
    api.crew = workers; api.staff = staff; api.envs = {};
    workers.forEach(function (worker, i) {
      api.envs[worker.id] = makeEnv(worker);
      api.envs[worker.id].brain = saved.crew[i].brain;
      api.brains[worker.id] = saved.crew[i].brain;
      api.envs[worker.id].rng.setState(saved.crew[i].rng);
    });
    socialRng.setState(saved.socialRng);
    api.pair = saved.pair; api.purchases = saved.purchases; api.deaths = saved.deaths;
    api.day = saved.day; api.needsCleanup = saved.needsCleanup; api.crewTarget = saved.crewTarget;
    api.activeWorkerId = saved.activeWorkerId; api.log = saved.log;
    Object.assign(S, saved.runtime);
    // Автосохранение не должно заново запускаться сразу после загрузки.
    S.autosaveClock = 0;
    setPaused(S.paused || S.shiftEnded);
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
      if (loaded && loaded.checkpoint) {
        var brainsBeforeRestore = Object.assign({}, api.brains);
        try {
          restoreCheckpoint(loaded.checkpoint);
          api.resumeStatus = 'restored';
          pushLog('Смена восстановлена из сохранения', 'good');
        } catch (err) {
          console.warn('[warehouse-crew] сохранение не восстановлено:', err);
          WC.save.protect();
          api.brains = brainsBeforeRestore;
          api.shiftMode = 'day';
          api.staff = []; api.purchases = { medic: 0, watchman: 0 }; api.deaths = []; api.log = [];
          Object.assign(S, { time: 0, paused: false, speed: 1, shiftEnded: false, autosaveClock: 0, accumulator: 0, totalReal: 0 });
          createSim();
          api.resumeStatus = 'failed';
          pushLog('Сохранение повреждено: автозапись отключена, старые данные сохранены', 'warn');
        }
      } else {
        api.resumeStatus = WC.save.isProtected() ? 'failed' : 'new';
        pushLog('Смена началась: ' + cfg.crew.length + ' рабочих, мозги загружены из файлов игры', 'good');
      }
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
    setOrderPriority: setOrderPriority,
    setShippingPriority: setShippingPriority,
    callTruck: callTruck,
    dispatchTruck: dispatchTruck,
    acceptContract: acceptContract,
    cancelContract: cancelContract,
    buyStaff: buyStaff,
    hireWorker: hireWorker,
    staffCost: staffCost,
    hasStaff: hasStaff,
    hireReplacements: hireReplacements,
    spawnReplacement: spawnReplacement,
    setPaused: setPaused,
    setSpeed: setSpeed,
    setShiftMode: setShiftMode,
    qualityPercent: qualityPercent,
    snapshotForUi: snapshotForUi,
    captureCheckpoint: captureCheckpoint,
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
