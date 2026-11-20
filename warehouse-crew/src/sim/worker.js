// Рабочий склада: тело + обученный мозг + конечный автомат задач.
// Без DOM и Three.js: тот же код крутит игру и обучение нейросети.
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.WarehouseWorker = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var RECTS = []; // препятствия: стеллажи + приёмка, заполняется buildObstacles()

  function buildObstacles(layout) {
    RECTS = [];
    for (var i = 0; i < layout.racks.length; i++) {
      RECTS.push({ x1: layout.racks[i].x - 0.62, x2: layout.racks[i].x + 0.62, y1: -5.9, y2: 5.9, id: 'rack-' + layout.racks[i].id });
    }
    RECTS.push({ x1: layout.intake[0].x - 0.95, x2: layout.intake[0].x + 0.95, y1: -6.6, y2: 6.6, id: 'intake' });
    RECTS.push({ x1: 9.8, x2: 11.4, y1: -6.0, y2: 6.0, id: 'despatch' });
    // зона отдыха — свободный пятачок у стены, препятствием не считается
    return RECTS;
  }

  function pointInRect(x, y, r, pad) {
    pad = pad || 0;
    return x > r.x1 - pad && x < r.x2 + pad && y > r.y1 - pad && y < r.y2 + pad;
  }

  // Пересечение отрезка с прямоугольником (slab method)
  function segRect(a, b, r, pad) {
    var x1 = r.x1 - pad, x2 = r.x2 + pad, y1 = r.y1 - pad, y2 = r.y2 + pad;
    var dx = b.x - a.x, dy = b.y - a.y;
    var tmin = 0, tmax = 1;
    for (var axis = 0; axis < 2; axis++) {
      var p = axis === 0 ? a.x : a.y;
      var d = axis === 0 ? dx : dy;
      var lo = axis === 0 ? x1 : y1;
      var hi = axis === 0 ? x2 : y2;
      if (Math.abs(d) < 1e-9) {
        if (p < lo || p > hi) return false;
      } else {
        var t1 = (lo - p) / d;
        var t2 = (hi - p) / d;
        if (t1 > t2) { var tmp = t1; t1 = t2; t2 = tmp; }
        tmin = Math.max(tmin, t1);
        tmax = Math.min(tmax, t2);
        if (tmin > tmax) return false;
      }
    }
    return true;
  }

  function pathBlocked(a, b, pad) {
    for (var i = 0; i < RECTS.length; i++) {
      if (segRect(a, b, RECTS[i], pad == null ? 0.42 : pad)) return RECTS[i];
    }
    return null;
  }

  // --------------------------------------------------------------- навигация
  // Сетка 0.5 м + A*: надёжнее «обхода углов», который застревал на стеллажах.
  var GRID = null;

  function buildGrid(layout) {
    var cell = 0.5;
    var cols = Math.ceil(layout.width / cell);
    var rows = Math.ceil(layout.depth / cell);
    var blocked = new Uint8Array(cols * rows);
    for (var y = 0; y < rows; y++) {
      for (var x = 0; x < cols; x++) {
        var wx = -layout.width / 2 + (x + 0.5) * cell;
        var wy = -layout.depth / 2 + (y + 0.5) * cell;
        var isBlocked = 0;
        for (var r = 0; r < RECTS.length; r++) {
          if (pointInRect(wx, wy, RECTS[r], 0.42)) { isBlocked = 1; break; }
        }
        if (Math.abs(wx) > layout.width / 2 - 0.55 || Math.abs(wy) > layout.depth / 2 - 0.55) isBlocked = 1;
        blocked[y * cols + x] = isBlocked;
      }
    }
    GRID = { cell: cell, cols: cols, rows: rows, blocked: blocked, layout: layout, originX: -layout.width / 2, originY: -layout.depth / 2 };
    return GRID;
  }

  function toCell(x, y) {
    return {
      x: Math.max(0, Math.min(GRID.cols - 1, Math.floor((x - GRID.originX) / GRID.cell))),
      y: Math.max(0, Math.min(GRID.rows - 1, Math.floor((y - GRID.originY) / GRID.cell))),
    };
  }
  function fromCell(cx, cy) {
    return { x: GRID.originX + (cx + 0.5) * GRID.cell, y: GRID.originY + (cy + 0.5) * GRID.cell };
  }
  function cellFree(cx, cy) {
    if (cx < 0 || cy < 0 || cx >= GRID.cols || cy >= GRID.rows) return false;
    return !GRID.blocked[cy * GRID.cols + cx];
  }
  function nearestFreeCell(target) {
    if (cellFree(target.x, target.y)) return target;
    for (var radius = 1; radius <= 8; radius++) {
      var best = null;
      var bestD = Infinity;
      for (var dy = -radius; dy <= radius; dy++) {
        for (var dx = -radius; dx <= radius; dx++) {
          if (Math.max(Math.abs(dx), Math.abs(dy)) !== radius) continue;
          var cx = target.x + dx;
          var cy = target.y + dy;
          if (!cellFree(cx, cy)) continue;
          var d = dx * dx + dy * dy;
          if (d < bestD) { bestD = d; best = { x: cx, y: cy }; }
        }
      }
      if (best) return best;
    }
    return null;
  }

  function findPath(from, to) {
    if (!GRID) return null;
    var startCell = nearestFreeCell(toCell(from.x, from.y));
    var goalCell = nearestFreeCell(toCell(to.x, to.y));
    if (!startCell || !goalCell) return null;
    if (startCell.x === goalCell.x && startCell.y === goalCell.y) return [{ x: to.x, y: to.y }];

    var cols = GRID.cols;
    var rows = GRID.rows;
    var open = [startCell.y * cols + startCell.x];
    var gScore = new Map();
    var fScore = new Map();
    var came = new Map();
    var startIdx = open[0];
    var goalIdx = goalCell.y * cols + goalCell.x;
    gScore.set(startIdx, 0);
    var h = function (cx, cy) {
      var dx = Math.abs(cx - goalCell.x);
      var dy = Math.abs(cy - goalCell.y);
      return (dx + dy) + (Math.SQRT2 - 2) * Math.min(dx, dy);
    };
    fScore.set(startIdx, h(startCell.x, startCell.y));
    var guard = 0;
    var found = false;
    while (open.length && guard++ < 6000) {
      var bestI = 0;
      for (var i = 1; i < open.length; i++) {
        if ((fScore.get(open[i]) || Infinity) < (fScore.get(open[bestI]) || Infinity)) bestI = i;
      }
      var current = open.splice(bestI, 1)[0];
      if (current === goalIdx) { found = true; break; }
      var cx = current % cols;
      var cy = Math.floor(current / cols);
      for (var dy = -1; dy <= 1; dy++) {
        for (var dx = -1; dx <= 1; dx++) {
          if (!dx && !dy) continue;
          var nx = cx + dx;
          var ny = cy + dy;
          if (!cellFree(nx, ny)) continue;
          if (dx && dy && (!cellFree(cx + dx, cy) || !cellFree(cx, cy + dy))) continue; // не срезать углы
          var idx = ny * cols + nx;
          var tentative = (gScore.get(current) || 0) + (dx && dy ? Math.SQRT2 : 1);
          if (tentative < (gScore.get(idx) || Infinity)) {
            came.set(idx, current);
            gScore.set(idx, tentative);
            fScore.set(idx, tentative + h(nx, ny));
            if (open.indexOf(idx) === -1) open.push(idx);
          }
        }
      }
    }
    if (!found) return null;
    var cells = [];
    var cursor = goalIdx;
    var safety = 0;
    while (cursor !== startIdx && safety++ < 5000) {
      cells.push(cursor);
      cursor = came.get(cursor);
      if (cursor === undefined) return null;
    }
    cells.push(startIdx);
    cells.reverse();
    var points = cells.map(function (idx) { return fromCell(idx % cols, Math.floor(idx / cols)); });
    points.push({ x: to.x, y: to.y });
    // Сглаживание: выбрасываем точки, до которых есть прямая видимость
    var smooth = [];
    var anchor = { x: from.x, y: from.y };
    var k = 0;
    while (k < points.length) {
      var far = k;
      for (var j = points.length - 1; j > k; j--) {
        if (!pathBlocked(anchor, points[j], 0.38)) { far = j; break; }
      }
      smooth.push(points[far]);
      anchor = points[far];
      if (far === points.length - 1) break;
      k = far + 1;
    }
    return smooth.length ? smooth : [{ x: to.x, y: to.y }];
  }

  function clampToFloor(pos, layout) {
    var pad = 0.5;
    pos.x = Math.max(-layout.width / 2 + pad, Math.min(layout.width / 2 - pad, pos.x));
    pos.y = Math.max(-layout.depth / 2 + pad, Math.min(layout.depth / 2 - pad, pos.y));
    return pos;
  }

  function pushOutOfRects(pos, layout) {
    for (var i = 0; i < RECTS.length; i++) {
      var r = RECTS[i];
      if (!pointInRect(pos.x, pos.y, r, 0.3)) continue;
      var dl = pos.x - (r.x1 - 0.3);
      var dr = (r.x2 + 0.3) - pos.x;
      var db = pos.y - (r.y1 - 0.3);
      var dt = (r.y2 + 0.3) - pos.y;
      var m = Math.min(dl, dr, db, dt);
      if (m === dl) pos.x = r.x1 - 0.31;
      else if (m === dr) pos.x = r.x2 + 0.31;
      else if (m === db) pos.y = r.y1 - 0.31;
      else pos.y = r.y2 + 0.31;
    }
    return clampToFloor(pos, layout);
  }

  function createWorker(opts) {
    var model = opts.model;
    var traits = model.normalizeTraits(opts.traits || {});
    var body = model.createBody(traits, opts.overrides || {});
    var layout = opts.layout;
    var spawn = opts.spawn || { x: 0, y: 0 };
    var w = {
      id: opts.id,
      name: opts.name,
      role: opts.role || 'Кладовщик',
      palette: opts.palette,
      traits: traits,
      body: body,
      pos: { x: spawn.x, y: spawn.y },
      heading: opts.heading || 0,
      speedNow: 0,
      decision: { pace: 0.5, caution: 0.5, rest: 0.2, precision: 0.5, urgency: 0.5, coop: 0.5 },
      rawDecision: { pace: 0.5, caution: 0.5, rest: 0.2, precision: 0.5, urgency: 0.5, coop: 0.5 },
      features: null,
      state: 'idle',
      mode: 'auto',            // auto — решает нейросеть, manual — только панель
      orderId: null,           // заказ в работе
      carryingId: null,        // заказ в руках
      timers: { pick: 0, place: 0, rest: 0, down: 0, idle: 0 },
      path: [],
      goal: null,
      resting: false,
      lastDropAt: -99,
      stats: { picked: 0, delivered: 0, dropped: 0, restSeconds: 0, metres: 0, brainTicks: 0 },
      events: [],
      decisionClock: 0,
      anim: { phase: 0, walk: 0, lean: 0, armSwing: 0, breath: 0 },
      elapsed: 0,
    };
    buildObstacles(layout);
    buildGrid(layout);

    function emit(text, tone) {
      w.events.push({ t: body.workSeconds + body.restSeconds, text: text, tone: tone || 'info' });
      if (w.events.length > 24) w.events.shift();
    }

    function setState(next) {
      if (w.state === next) return;
      w.state = next;
    }

    function activeOrder(warehouse) {
      if (!w.orderId) return null;
      for (var i = 0; i < warehouse.state.orders.length; i++) {
        if (warehouse.state.orders[i].id === w.orderId) return warehouse.state.orders[i];
      }
      return null;
    }

    function slotOf(warehouse, order) {
      for (var i = 0; i < warehouse.state.slots.length; i++) {
        if (warehouse.state.slots[i].id === order.slotId) return warehouse.state.slots[i];
      }
      return null;
    }

    function targetPoint(warehouse, order) {
      if (!order) return null;
      if (w.carryingId) {
        var slot = slotOf(warehouse, order);
        return slot ? slotPoint(slot) : null;
      }
      return interactionPoint(order.x, order.y);
    }

    function slotPoint(slot) {
      // Подходим к ячейке с прохода: сбоку от стеллажа
      return interactionPoint(slot.x, slot.y);
    }

    // Точка, откуда удобно дотянуться до коробки/ячейки: сбоку, не внутри препятствия
    function interactionPoint(x, y) {
      var candidates = [
        { x: x + 1.25, y: y }, { x: x, y: y + 1.25 }, { x: x, y: y - 1.25 }, { x: x - 1.25, y: y },
        { x: x + 1.95, y: y }, { x: x, y: y + 1.95 }, { x: x, y: y - 1.95 }, { x: x - 1.95, y: y },
      ];
      for (var i = 0; i < candidates.length; i++) {
        var c = candidates[i];
        if (Math.abs(c.x) > layout.width / 2 - 0.7 || Math.abs(c.y) > layout.depth / 2 - 0.7) continue;
        var blocked = false;
        for (var r = 0; r < RECTS.length; r++) {
          if (pointInRect(c.x, c.y, RECTS[r], 0.38)) { blocked = true; break; }
        }
        if (blocked) continue;
        if (pathBlocked({ x: c.x, y: c.y + 0.01 }, { x: c.x, y: c.y - 0.01 })) continue;
        return { x: c.x, y: c.y };
      }
      return { x: x + 1.6, y: y };
    }

    function setGoal(point, key) {
      if (point && w.goal && w.goalKey === key && Math.hypot(w.goal.x - point.x, w.goal.y - point.y) < 0.35) return;
      w.goal = point ? { x: point.x, y: point.y } : null;
      w.goalKey = key || null;
      w.path = [];
    }

    function computePath(from, to) {
      var planned = GRID ? findPath(from, to) : null;
      if (planned && planned.length) return planned;
      return [{ x: to.x, y: to.y }];
    }

    function stepTowards(dt, warehouse, speedMul) {
      if (!w.goal) return 0;
      if (!w.path || !w.path.length) w.path = computePath(w.pos, w.goal);
      var waypoint = w.path[0];
      if (!waypoint) { w.goal = null; return 0; }
      if (pathBlocked(w.pos, waypoint)) {
        w.path = computePath(w.pos, w.goal);
        waypoint = w.path[0];
      }
      var dx = waypoint.x - w.pos.x;
      var dy = waypoint.y - w.pos.y;
      var dist = Math.hypot(dx, dy);
      if (dist < 0.14) {
        w.path.shift();
        if (!w.path.length) { w.goal = null; w.speedNow = 0; return 0; }
        waypoint = w.path[0];
        dx = waypoint.x - w.pos.x;
        dy = waypoint.y - w.pos.y;
        dist = Math.hypot(dx, dy);
      }
      if (dist < 1e-4) return 0;
      var base = 1.25 + 0.55 * w.traits.paceTrait;
      var factor = model.speedFactor(body, w.decision) * speedMul;
      if (w.carryingId) factor *= 0.82;
      if (body.collapsed) factor *= 0.25;
      var speed = Math.min(dist / Math.max(dt, 1e-6), base * factor);
      var step = speed * dt;
      w.pos.x += (dx / dist) * step;
      w.pos.y += (dy / dist) * step;
      w.heading = Math.atan2(dy, dx);
      w.speedNow = speed;
      w.stats.metres += step;
      return speed;
    }

    function releaseOrder(warehouse) {
      var order = activeOrder(warehouse);
      if (order && order.status === 'claimed') {
        order.status = 'pending';
        order.carrier = null;
      }
      w.orderId = null;
      setGoal(null);
    }

    // ---------------------------------------------------------- восприятие
    function buildContext(warehouse, allWorkers) {
      var order = activeOrder(warehouse);
      var target = order ? targetPoint(warehouse, order) : null;
      var dist = target ? Math.hypot(target.x - w.pos.x, target.y - w.pos.y) : 0;
      var pending = warehouse.pendingOrders().length;
      var teamBusy = 0;
      var peers = 0;
      for (var i = 0; i < allWorkers.length; i++) {
        if (allWorkers[i].id === w.id) continue;
        peers++;
        if (allWorkers[i].carryingId || allWorkers[i].orderId) teamBusy += 1;
      }
      teamBusy = peers ? teamBusy / peers : 0;
      return {
        loadKg: w.carryingId && order ? order.mass : 0,
        distanceNorm: Math.min(1, dist / 18),
        urgency: order ? Math.max(0, Math.min(1, 1 - Math.max(0, order.deadline - warehouse.state.time) / 90)) : 0,
        queue: Math.min(1, pending / 8),
        shift: Math.min(1, warehouse.state.time / warehouse.state.shiftLength),
        teamBusy: teamBusy,
        waiting: Math.min(1, pending / 10),
        carrying: Boolean(w.carryingId),
        resting: w.resting,
        noise: 0.15 + Math.min(0.5, allWorkers.length * 0.05),
        urgencyOrder: order ? order.priority : 0,
      };
    }

    var lastEnv = null;

    function brainApi() {
      if (lastEnv && lastEnv.brainApi) return lastEnv.brainApi;
      if (typeof globalThis !== 'undefined' && globalThis.WarehouseBrain) return globalThis.WarehouseBrain;
      return null;
    }

    function think(warehouse, allWorkers, brainModel) {
      var ctx = buildContext(warehouse, allWorkers);
      var api = brainApi();
      w.features = model.featuresOf(body, ctx);
      w.rawDecision = api ? api.decision(brainModel, w.features) : { pace: 0.5, caution: 0.5, rest: 0.2, precision: 0.5, urgency: 0.5, coop: 0.5 };
      w.stats.brainTicks += 1;
      return ctx;
    }

    function smoothDecision(dt) {
      // Инерция решения: уставший и оглушённый мозг реагирует медленнее
      var rate = 1.1 + 3.4 * body.cognition * (0.55 + 0.45 * body.hearing);
      var k = 1 - Math.exp(-rate * dt);
      var keys = ['pace', 'caution', 'rest', 'precision', 'urgency', 'coop'];
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        w.decision[key] += (w.rawDecision[key] - w.decision[key]) * k;
      }
    }

    // ---------------------------------------------------------- команды панели
    function command(cmd, warehouse, opts2) {
      opts2 = opts2 || {};
      switch (cmd) {
        case 'auto':
          w.mode = 'auto';
          emit('Режим: автономия нейросети', 'info');
          return { ok: true, state: w.state };
        case 'pick': {
          w.mode = opts2.keepAuto ? w.mode : 'manual';
          var order = null;
          if (opts2.orderId) {
            for (var i = 0; i < warehouse.state.orders.length; i++) {
              if (warehouse.state.orders[i].id === opts2.orderId) order = warehouse.state.orders[i];
            }
          } else if (!w.carryingId && !w.orderId) {
            order = warehouse.nearestPending(w.pos);
          }
          if (w.carryingId) return command('store', warehouse, opts2);
          if (w.orderId) {
            var current = activeOrder(warehouse);
            setState('toPick');
            setGoal(targetPoint(warehouse, current), 'pick:' + w.orderId);
            return { ok: true, state: w.state, orderId: w.orderId };
          }
          if (!order) return { ok: false, reason: 'Нет свободных заказов на приёмке' };
          var claimed = warehouse.claim(order.id, w.id);
          if (!claimed) return { ok: false, reason: 'Заказ уже занят' };
          w.orderId = order.id;
          w.timers.pick = 0;
          setState('toPick');
          setGoal(targetPoint(warehouse, order), 'pick:' + order.id);
          emit('Взял заказ ' + order.code, 'info');
          return { ok: true, state: w.state, orderId: order.id };
        }
        case 'store': {
          w.mode = opts2.keepAuto ? w.mode : 'manual';
          if (!w.orderId) return { ok: false, reason: 'Нет заказа в работе' };
          if (w.carryingId) {
            var ord = activeOrder(warehouse);
            setState('toDrop');
            setGoal(targetPoint(warehouse, ord), 'drop:' + ord.id);
            return { ok: true, state: w.state };
          }
          setState('toPick');
          setGoal(targetPoint(warehouse, activeOrder(warehouse)), 'pick:' + w.orderId);
          emit('Сначала поднять коробку', 'warn');
          return { ok: true, state: w.state };
        }
        case 'wait':
          w.mode = opts2.keepAuto ? w.mode : 'manual';
          releaseOrder(warehouse);
          if (w.carryingId) {
            var carried = null;
            for (var k = 0; k < warehouse.state.orders.length; k++) {
              if (warehouse.state.orders[k].id === w.carryingId) carried = warehouse.state.orders[k];
            }
            if (carried) warehouse.drop(carried, 0.08, w.pos.x, w.pos.y);
            w.carryingId = null;
          }
          w.resting = false;
          setState('idle');
          setGoal(null);
          emit('Ждёт указаний', 'info');
          return { ok: true, state: w.state };
        case 'rest':
          w.mode = opts2.keepAuto ? w.mode : 'manual';
          if (w.carryingId) return { ok: false, reason: 'Сначала поставь коробку' };
          releaseOrder(warehouse);
          w.resting = false;
          setState('toRest');
          var jitterRng = (w.rngRef && w.rngRef()) || { range: function (a, b) { return (a + b) / 2; } };
          setGoal({ x: layout.restArea.x + jitterRng.range(-0.2, 0.2), y: layout.restArea.y + jitterRng.range(-0.2, 0.2) }, 'rest');
          emit('Идёт на перерыв', 'info');
          return { ok: true, state: w.state };
        case 'help':
          w.mode = 'auto';
          w.coopBoost = 0.25;
          emit('Подключается к бригаде', 'info');
          return { ok: true, state: w.state };
        default:
          return { ok: false, reason: 'Неизвестная команда: ' + cmd };
      }
    }

    // ---------------------------------------------------------- основной шаг
    function update(dt, env) {
      var warehouse = env.warehouse;
      var allWorkers = env.workers;
      var brainModel = env.brain;
      var rng = env.rng || { next: function () { return 0.5; }, range: function (a, b) { return (a + b) / 2; }, gauss: function () { return 0; } };
      w.rngRef = function () { return rng; };
      lastEnv = env;
      w.elapsed += dt;

      // 1. Мозг тикает 2 раза в секунду и не мгновенно (инерция решения)
      w.decisionClock += dt;
      if (w.decisionClock >= 0.5) {
        w.decisionClock = 0;
        think(warehouse, allWorkers, brainModel);
      }
      smoothDecision(dt);

      // 2. Тело: интенсивность зависит от реального движения и груза
      var order = activeOrder(warehouse);
      if (order && order.status === 'ruined' && w.orderId === order.id) {
        w.orderId = null;
        w.carryingId = null;
        setGoal(null);
      }
      var carrying = Boolean(w.carryingId);
      var speedNorm = w.speedNow / 1.8;
      var intensity = model.intensityOf(body, {
        speed: Math.min(1, speedNorm),
        carrying: carrying,
        lifting: w.state === 'toPick' && w.timers.pick > 0,
        lower: w.state === 'toDrop' && w.timers.place > 0,
        awkward: carrying && order ? Math.min(1, order.mass / 30) : 0,
      }, carrying && order ? order.mass : 0);
      model.stepBody(body, dt, {
        intensity: w.resting ? 0.1 : intensity,
        resting: w.resting || w.state === 'down',
        carrying: carrying,
        noise: 0.2 + Math.min(0.5, allWorkers.length * 0.04),
        urgency: order ? order.priority : 0.2,
        teamSupport: w.decision.coop,
        reward: 0,
        eating: w.state === 'rest',
      });

      var statsBefore = body.unitsDelivered;

      // 3. Обморок
      if (body.collapsed && w.state !== 'down') {
        setState('down');
        w.timers.down = 9;
        if (w.carryingId && order) {
          warehouse.drop(order, 0.35, w.pos.x, w.pos.y);
          w.carryingId = null;
        }
        emit('Упал без сил', 'bad');
      }

      // 4. Автономия: решения о задачах
      if (w.mode === 'auto' && !body.collapsed) {
        if (!w.orderId && w.state !== 'toRest' && w.state !== 'rest') {
          var wantsRest = w.decision.rest > 0.62 && body.energy < 0.48 + 0.1 * (1 - w.traits.endurance);
          if (wantsRest) {
            setState('toRest');
            setGoal({ x: layout.restArea.x + (w.id.length % 3 - 1) * 0.5, y: layout.restArea.y }, 'rest');
          } else if (w.state !== 'toPick' && w.state !== 'toDrop') {
            var pickTarget = chooseOrder(warehouse, allWorkers);
            if (pickTarget) {
              var claimed = warehouse.claim(pickTarget.id, w.id);
              if (claimed) {
                w.orderId = claimed.id;
                w.timers.pick = 0;
                setState('toPick');
                setGoal(targetPoint(warehouse, claimed), 'pick:' + claimed.id);
              }
            } else {
              setState('idle');
              setGoal({ x: layout.spawns[(w.id.length + 1) % 3].x, y: layout.spawns[(w.id.length + 1) % 3].y }, 'idle');
            }
          }
        }
        if (w.state === 'rest' && (body.energy > 0.72 || (w.timers.rest > 22 && !body.collapsed))) {
          w.resting = false;
          setState('idle');
          setGoal(null);
        }
      }
      w.coopBoost = Math.max(0, (w.coopBoost || 0) - dt * 0.05);

      // 5. Автомат задач
      switch (w.state) {
        case 'down': {
          w.speedNow = 0;
          w.timers.down -= dt;
          if (w.timers.down <= 0 && !body.collapsed) {
            setState('idle');
            setGoal(null);
            emit('Поднялся и вернулся в строй', 'warn');
          }
          break;
        }
        case 'toRest': {
          var arrived = !w.goal;
          if (!arrived) stepTowards(dt, warehouse, 0.85);
          if (!w.goal) {
            w.resting = true;
            setState('rest');
            w.timers.rest = 0;
          }
          break;
        }
        case 'rest': {
          w.speedNow = 0;
          w.timers.rest += dt;
          w.stats.restSeconds += dt;
          if (body.energy > 0.78 || w.timers.rest > 38) {
            w.resting = false;
            setState(w.mode === 'auto' ? 'idle' : 'idle');
            setGoal(null);
            emit('Перерыв окончен', 'info');
          }
          break;
        }
        case 'idle': {
          w.speedNow = Math.max(0, w.speedNow - dt * 2);
          break;
        }
        case 'toPick': {
          order = activeOrder(warehouse);
          if (!order) { setState('idle'); w.orderId = null; break; }
          if (order.status !== 'claimed' && order.status !== 'pending') { w.orderId = null; setState('idle'); break; }
          if (order.status === 'pending') warehouse.claim(order.id, w.id);
          var pickPoint = targetPoint(warehouse, order);
          setGoal(pickPoint, 'pick:' + order.id);
          if (w.goal) stepTowards(dt, warehouse, 1);
          var d = pickPoint ? Math.hypot(pickPoint.x - w.pos.x, pickPoint.y - w.pos.y) : 99;
          if (!w.goal || d < 0.9) {
            w.speedNow = 0;
            w.heading = Math.atan2(order.y - w.pos.y, order.x - w.pos.x);
            w.timers.pick += dt;
            var need = model.pickTime(body, w.decision) * (1 + Math.max(0, order.mass - 22) / 60);
            if (w.timers.pick >= need) {
              w.timers.pick = 0;
              w.carryingId = order.id;
              warehouse.markCarried(order, w.id);
              w.stats.picked += 1;
              body.unitsDelivered = body.unitsDelivered; // не считается доставкой
              setState('toDrop');
              setGoal(targetPoint(warehouse, order));
              emit('Коробка ' + order.code + ' в руках', 'info');
            }
          }
          break;
        }
        case 'toDrop': {
          order = activeOrder(warehouse);
          if (!order) { setState('idle'); w.orderId = null; w.carryingId = null; break; }
          var dropPoint = targetPoint(warehouse, order);
          setGoal(dropPoint, 'drop:' + order.id);
          if (w.goal) stepTowards(dt, warehouse, 1);
          var slot = slotOf(warehouse, order);
          var reach = dropPoint ? Math.hypot(dropPoint.x - w.pos.x, dropPoint.y - w.pos.y) : 99;
          if (!w.goal || reach < 0.9) {
            w.speedNow = 0;
            w.heading = Math.atan2(slot.y - w.pos.y, slot.x - w.pos.x);
            w.timers.place += dt;
            var placeNeed = model.placeTime(body, w.decision) * (1 + slot.h * 0.25);
            if (w.timers.place >= placeNeed) {
              w.timers.place = 0;
              var res = warehouse.store(order, w.id);
              w.orderId = null;
              w.carryingId = null;
              w.stats.delivered += 1;
              model.deliverReward(body, order.priority + 0.4);
              setState('idle');
              setGoal(null);
              if (env.onDelivered) env.onDelivered(w, order, res);
            }
          }
          // Риск уронить коробку
          var risk = model.dropRisk(body, w.decision, order.mass) * dt;
          if (rng.next() < risk && warehouse.state.time - w.lastDropAt > 1.2) {
            w.lastDropAt = warehouse.state.time;
            var dmg = 0.28 + 0.5 * rng.next() + 0.12 * Math.min(1, order.mass / 30);
            var outcome = warehouse.drop(order, dmg, w.pos.x, w.pos.y);
            model.dropPenalty(body, dmg);
            w.stats.dropped += 1;
            w.carryingId = null;
            if (outcome === 'ruined') {
              w.orderId = null;
              setState('idle');
              setGoal(null);
            } else {
              setState('toPick');
              setGoal(targetPoint(warehouse, order), 'pick:' + order.id);
            }
            if (env.onDropped) env.onDropped(w, order, outcome);
          }
          break;
        }
        default:
          setState('idle');
      }

      // 6. Расталкивание и границы
      pushOutOfRects(w.pos, layout);
      for (var i = 0; i < allWorkers.length; i++) {
        var other = allWorkers[i];
        if (other.id === w.id) continue;
        var dx = w.pos.x - other.pos.x;
        var dy = w.pos.y - other.pos.y;
        var dist = Math.hypot(dx, dy);
        if (dist > 0.001 && dist < 0.75) {
          var push = (0.75 - dist) * 0.5;
          w.pos.x += (dx / dist) * push;
          w.pos.y += (dy / dist) * push;
        }
      }

      // 7. Анимация
      var walkTarget = w.speedNow > 0.05 ? 1 : 0;
      w.anim.walk += (walkTarget - w.anim.walk) * Math.min(1, dt * 8);
      w.anim.phase += dt * (2.2 + 5.2 * Math.min(1.5, w.speedNow / 1.2)) * (walkTarget ? 1 : 0);
      w.anim.lean = w.anim.lean + ((w.carryingId ? 0.16 : 0.02) - w.anim.lean) * Math.min(1, dt * 5);
      w.anim.breath += dt * (0.6 + body.breathing / 40);
      w.anim.armSwing = Math.sin(w.anim.phase) * 0.55 * w.anim.walk;

      // 8. Если счётчик доставок вырос (например, от события) — награда
      if (body.unitsDelivered > statsBefore) body.dopamine = model.clamp01(body.dopamine + 0.05);

      return w;
    }

    function chooseOrder(warehouse, allWorkers) {
      var pending = warehouse.pendingOrders();
      if (!pending.length) return null;
      var urgency = w.decision.urgency;
      var coop = Math.min(1, w.decision.coop + (w.coopBoost || 0));
      var best = null;
      var bestScore = -Infinity;
      for (var i = 0; i < pending.length; i++) {
        var o = pending[i];
        var dist = Math.hypot(o.x - w.pos.x, o.y - w.pos.y);
        var timeLeft = Math.max(0, o.deadline - warehouse.state.time);
        var urgencyScore = (1 - Math.min(1, timeLeft / 100)) * (0.6 + 1.8 * urgency);
        var massScore = -Math.max(0, o.mass - model.carryCapacity(body)) * 0.12;
        var s = urgencyScore * 6 + o.priority * (1 + 2 * urgency) - dist * 0.14 - o.damage * 2 + massScore;
        // Кооперация: помогаем напарнику, чей заказ почти просрочен
        if (coop > 0.55) {
          for (var k = 0; k < allWorkers.length; k++) {
            var peer = allWorkers[k];
            if (peer.id === w.id) continue;
            if (peer.body.energy < 0.3 || peer.body.collapsed) s += 0.6 * coop * (1 - Math.min(1, timeLeft / 100));
          }
        }
        if (s > bestScore) { bestScore = s; best = o; }
      }
      return best;
    }

    return {
      state: w,
      body: body,
      traits: traits,
      update: update,
      command: command,
      releaseOrder: releaseOrder,
      think: think,
      buildContext: buildContext,
      chooseOrder: chooseOrder,
      get id() { return w.id; },
      get name() { return w.name; },
      get role() { return w.role; },
      get palette() { return w.palette; },
      get pos() { return w.pos; },
      get decision() { return w.decision; },
      get rawDecision() { return w.rawDecision; },
      get features() { return w.features; },
      get stats() { return w.stats; },
      get mode() { return w.mode; },
      get stateName() { return w.state; },
      get orderId() { return w.orderId; },
      get carryingId() { return w.carryingId; },
      get resting() { return w.resting; },
      get events() { return w.events; },
    };
  }

  return {
    createWorker: createWorker,
    buildObstacles: buildObstacles,
    buildGrid: buildGrid,
    findPath: findPath,
    pathBlocked: pathBlocked,
    computePathFor: function (layout, from, to) { buildObstacles(layout); buildGrid(layout); return findPath(from, to); },
  };
});
