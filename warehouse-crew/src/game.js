// Игровое ядро: движок RatCore, загрузка обученных мозгов, склад, бригада, приказы.
window.WC = window.WC || {};

WC.game = (function () {
  'use strict';

  var cfg = null;
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

  function createSim() {
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
        palette: member.palette,
        traits: member.traits,
        overrides: member.body,
        model: window.WarehouseModel,
        layout: api.sim.layout,
        spawn: api.sim.layout.spawns[i],
        heading: 0,
      });
    });
    api.activeWorkerId = cfg.crew[0].id;
    api.envs = {};
    api.crew.forEach(function (worker) {
      api.envs[worker.id] = {
        warehouse: api.sim,
        workers: api.crew,
        brain: api.brains[worker.id] || api.baseBrain,
        brainApi: window.WarehouseBrain,
        rng: window.WarehouseSim.createRng(cfg.seed + worker.id.length * 13),
        onDelivered: function (w, order, result) {
          pushLog(w.name + ' закрыл ' + order.code + ' (+' + result.points + ')', result.late ? 'warn' : 'good');
          WC.audio.delivered();
          emit('delivered', { worker: w, order: order, result: result });
        },
        onInjury: function (w, injury) {
          pushLog(w.state.name + ' травмирован: ' + injury.text, 'bad');
          if (WC.audio && WC.audio.drop) WC.audio.drop();
          if (WC.world && WC.world.kick) WC.world.kick(0.5);
          emit('injury', { worker: w, injury: injury });
        },
        onRefused: function (w, order, reason) {
          pushLog(w.state.name + ' отказался от ' + order.code + ': ' + reason, 'warn');
          emit('refused', { worker: w, order: order, reason: reason });
        },
        onLoaded: function (w, order, result) {
          pushLog(w.state.name + ' загрузил ' + order.code + ' в фуру (+' + result.points + ')', 'good');
          if (WC.audio && WC.audio.delivered) WC.audio.delivered();
          emit('loaded', { worker: w, order: order, result: result });
        },
        onDropped: function (w, order, outcome) {
          pushLog(w.name + ' уронил ' + order.code + ' — ' + Math.round(order.damage * 100) + '% повреждений', 'bad');
          WC.audio.drop();
          emit('dropped', { worker: w, order: order, outcome: outcome });
        },
      };
    });
    api.state = S;
    api.state.time = 0;
    return api.sim;
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
    createSim();
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
      api.sim.step(step);
      api.crew.forEach(function (worker) {
        worker.update(step, api.envs[worker.id]);
        detectBodyEvents(worker);
      });
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
