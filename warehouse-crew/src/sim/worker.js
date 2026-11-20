// Рабочий склада: тело + обученный мозг + конечный автомат задач.
// Без DOM и Three.js: тот же код крутит игру и обучение нейросети.
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.WarehouseWorker = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var RECTS = []; // препятствия: стеллажи + приёмка, заполняется buildObstacles()

  // Длина вытянутой руки: дальше этого коробку не взять, надо подойти.
  var ARM_REACH = 1.45;

  function buildObstacles(layout) {
    RECTS = [];
    for (var i = 0; i < layout.racks.length; i++) {
      RECTS.push({ x1: layout.racks[i].x - 0.62, x2: layout.racks[i].x + 0.62, y1: -5.9, y2: 5.9, id: 'rack-' + layout.racks[i].id });
    }
    // Паллеты приёмки: препятствие по габариту поддона, а не на весь проход
    RECTS.push({ x1: layout.intake[0].x - 0.62, x2: layout.intake[0].x + 0.62, y1: -6.6, y2: 6.6, id: 'intake' });
    // Стол отгрузки — компактный, чтобы не перекрывать док загрузки
    RECTS.push({ x1: 10.0, x2: 11.2, y1: -2.6, y2: 2.6, id: 'despatch' });
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
      turnRate: 0,
      lastHeading: opts.heading || 0,
      safety: { fear: 0, strikes: 0, injuries: 0, grace: 0, lastRule: null, refusals: 0, lastRefusalAt: -99 },
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

    // Куда нести коробку: в ячейку (приёмка) или в фуру (отгрузка)
    function carryingPoint(warehouse, order) {
      if (order.truckId && order.direction === 'out') {
        var truck = warehouse.truckById ? warehouse.truckById(order.truckId) : null;
        if (truck) return { x: truck.stand.x, y: truck.stand.y };
        return { x: order.x, y: order.y };
      }
      var slot = slotOf(warehouse, order);
      return slot ? slotPoint(slot) : null;
    }

    function targetPoint(warehouse, order) {
      if (!order) return null;
      if (w.carryingId) return carryingPoint(warehouse, order);
      if (order.stand) return { x: order.stand.x, y: order.stand.y };
      return interactionPoint(order.x, order.y);
    }

    // Насколько далеко коробка от рук: расстояние минус половина габарита
    function reachGap(order) {
      var pad = order.reachPad || 0;
      return Math.hypot(order.x - w.pos.x, order.y - w.pos.y) - pad;
    }

    function slotGap(slot) {
      if (!slot) return 99;
      return Math.hypot(slot.x - w.pos.x, slot.y - w.pos.y) - 0.55;
    }

    // Предел подъёма: после травм рабочий держится за безопасный вес
    function liftLimit() {
      var hard = model.carryCapacity(body);
      var safe = model.safeLift(body);
      var fear = model.clamp01(w.safety.fear);
      return hard - (hard - safe) * (0.2 + 0.8 * fear);
    }

    function checkLift(order) {
      var limit = liftLimit();
      if (order.mass > limit) {
        return {
          ok: false,
          reason: 'Тяжело: ' + Math.round(order.mass) + ' кг, а предел сейчас ' + Math.round(limit) +
            ' кг — нужен напарник или тележка',
        };
      }
      return { ok: true, over: Math.max(0, order.mass - model.safeLift(body)) };
    }

    function slotPoint(slot) {
      // Подходим к ячейке с прохода: сбоку от стеллажа
      return interactionPoint(slot.x, slot.y);
    }

    // Точка, откуда удобно дотянуться до коробки/ячейки: сбоку, не внутри препятствия
    function interactionPoint(x, y) {
      // Вплотную: 1.1 м — это «рукой подать» с учётом габарита коробки
      var candidates = [
        { x: x + 1.1, y: y }, { x: x, y: y + 1.1 }, { x: x - 1.1, y: y }, { x: x, y: y - 1.1 },
        { x: x + 1.55, y: y }, { x: x, y: y + 1.55 }, { x: x - 1.55, y: y }, { x: x, y: y - 1.55 },
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
      // Резерв: ближайшая свободная точка, а не «в стену»
      for (var ring = 1; ring <= 4; ring++) {
        for (var a = 0; a < 8; a++) {
          var ang = (a / 8) * Math.PI * 2;
          var px = x + Math.cos(ang) * (0.9 + ring * 0.35);
          var py = y + Math.sin(ang) * (0.9 + ring * 0.35);
          if (Math.abs(px) > layout.width / 2 - 0.7 || Math.abs(py) > layout.depth / 2 - 0.7) continue;
          var hit = false;
          for (var ri = 0; ri < RECTS.length; ri++) if (pointInRect(px, py, RECTS[ri], 0.38)) { hit = true; break; }
          if (!hit) return { x: px, y: py };
        }
      }
      return { x: x + 1.1, y: y };
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

    // Поворот не мгновенный: с грузом корпус разворачивается медленнее
    function turnTowards(angle, dt, rate) {
      var delta = Math.atan2(Math.sin(angle - w.heading), Math.cos(angle - w.heading));
      var maxStep = (rate || 5) * dt;
      w.heading += Math.max(-maxStep, Math.min(maxStep, delta));
      return w.heading;
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
      if (w.timers.stun > 0) factor *= 0.45;
      if (body.collapsed) factor *= 0.25;
      var speed = Math.min(dist / Math.max(dt, 1e-6), base * factor);
      var step = speed * dt;
      w.pos.x += (dx / dist) * step;
      w.pos.y += (dy / dist) * step;
      turnTowards(Math.atan2(dy, dx), dt, w.carryingId ? 3.2 : 6);
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

    // Отказ от работы: по правилам безопаснее не брать вовсе
    function refuseOrder(warehouse, order, reason) {
      if (order) {
        order.refusedBy = order.refusedBy || {};
        order.refusedBy[w.id] = warehouse.state.time;
        if (order.status === 'claimed' || order.status === 'carried') {
          order.status = 'pending';
          order.carrier = null;
        }
      }
      w.orderId = null;
      w.carryingId = null;
      w.safety.refusals += 1;
      w.safety.lastRefusalAt = warehouse.state.time;
      setState('idle');
      setGoal(null);
      emit('Отказ: ' + reason, 'warn');
      return { ok: false, state: w.state, reason: reason };
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

    // ------------------------------------------------ техника безопасности
    function safetyStep(dt, warehouse, order, carrying, rng, env) {
      var mass = carrying && order ? order.mass : 0;
      var breach = model.ruleBreach(body, {
        mass: mass,
        pace: w.decision.pace,
        carrying: carrying,
        turnRate: w.turnRate,
        lifting: w.state === 'toPick' && w.timers.pick > 0,
        working: w.state !== 'rest' && w.state !== 'idle' && w.state !== 'down',
        precision: w.decision.precision,
      });
      if (breach) {
        if (w.safety.lastRule !== breach.rule) {
          w.safety.lastRule = breach.rule;
          w.safety.strikes += 1;
          model.noteViolation(body, breach);
          emit('Нарушение: ' + breach.cause, 'warn');
        }
        var grace = w.safety.grace > 0;
        var chance = breach.risk * dt * (0.7 + 0.8 * model.injuryLevel(body)) * (grace ? 0.15 : 1);
        if (rng.next() < chance) {
          var injury = model.addInjury(body, {
            type: breach.type,
            part: breach.part,
            severity: breach.severity * (0.75 + 0.5 * rng.next()),
            cause: breach.cause,
          });
          w.safety.injuries += 1;
          w.safety.grace = 18;
          w.safety.fear = model.clamp01(w.safety.fear + 0.3 + 0.35 * injury.severity);
          w.timers.stun = 1.4 + 2.4 * injury.severity;
          emit('Травма: ' + injury.text, 'bad');
          if (carrying && order && injury.severity > 0.4 && rng.next() < 0.55) {
            // не удержал — коробка падает
            var dmg = 0.22 + 0.4 * rng.next();
            var outcome = warehouse.drop(order, dmg, w.pos.x, w.pos.y);
            model.dropPenalty(body, dmg);
            w.carryingId = null;
            w.stats.dropped += 1;
            if (outcome === 'ruined') { w.orderId = null; setState('idle'); setGoal(null); }
            else { setState('toPick'); setGoal(targetPoint(warehouse, order), 'pick:' + order.id); }
            emit('От боли выронил коробку', 'bad');
          }
          if (env && env.onInjury) env.onInjury(w, injury);
        }
      } else {
        w.safety.lastRule = null;
      }
      // Страх держится, пока болит; без травм медленно проходит
      w.safety.grace = Math.max(0, (w.safety.grace || 0) - dt);
      w.safety.fear = Math.max(model.injuryLevel(body) * 0.85, w.safety.fear - dt * 0.008);
      w.safety.fear = model.clamp01(w.safety.fear);
    }

    // Правила поверх нейросети: после травм рабочий сам себя ограничивает
    function applySafety(order) {
      var safe = model.safeLift(body);
      var fear = model.clamp01(w.safety.fear);
      var mass = w.carryingId && order ? order.mass : 0;
      var over = mass > 0 ? model.clamp((mass - safe * 0.7) / Math.max(6, safe * 0.6), 0, 1) : 0;
      if (mass > 0) {
        w.decision.pace = Math.min(w.decision.pace, 0.92 - 0.5 * fear - 0.3 * over);
        w.decision.caution = Math.max(w.decision.caution, 0.3 + 0.35 * over + 0.25 * fear);
        w.decision.precision = Math.max(w.decision.precision, 0.3 + 0.2 * over);
      }
      if (body.fatigue > 0.78) {
        w.decision.rest = Math.max(w.decision.rest, 0.2 + 0.5 * fear + 0.3 * (body.fatigue - 0.78) * 5);
        w.decision.pace = Math.min(w.decision.pace, 0.7);
      }
      var level = model.injuryLevel(body);
      if (level > 0.02) {
        w.decision.pace = Math.min(w.decision.pace, 1 - 0.35 * level);
        w.decision.caution = Math.max(w.decision.caution, 0.35 + 0.45 * level);
      }
      if (body.cognition < 0.5) w.decision.caution = Math.max(w.decision.caution, 0.5);
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
          var liftCheck = checkLift(order);
          if (!liftCheck.ok) {
            refuseOrder(warehouse, order, liftCheck.reason);
            return { ok: false, reason: liftCheck.reason };
          }
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

      // 2b. Правила техники безопасности поверх решений сети + травмы
      var headingDelta = Math.atan2(Math.sin(w.heading - w.lastHeading), Math.cos(w.heading - w.lastHeading));
      w.turnRate = Math.abs(headingDelta) / Math.max(dt, 1e-4);
      w.lastHeading = w.heading;
      if (w.timers.stun > 0) w.timers.stun = Math.max(0, w.timers.stun - dt);
      applySafety(order);
      safetyStep(dt, warehouse, order, carrying, rng, env);

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
        if (rng.next() < 0.3) {
          var hit = model.addInjury(body, {
            type: 'brain', part: 'head', severity: 0.15 + 0.25 * rng.next(), cause: 'упал в обморок и ударился головой',
          });
          w.safety.injuries += 1;
          w.safety.grace = 12;
          emit('Травма: ' + hit.text, 'bad');
          if (env.onInjury) env.onInjury(w, hit);
        }
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
          // Тяжёлое не берём: правило техники безопасности, а не «сила есть — тяни»
          var lift = checkLift(order);
          if (!lift.ok) {
            refuseOrder(warehouse, order, lift.reason);
            if (env.onRefused) env.onRefused(w, order, lift.reason);
            break;
          }
          var pickPoint = targetPoint(warehouse, order);
          var d = pickPoint ? Math.hypot(pickPoint.x - w.pos.x, pickPoint.y - w.pos.y) : 99;
          if (d > 0.3) setGoal(pickPoint, 'pick:' + order.id);
          else setGoal(null);
          if (w.goal) {
            stepTowards(dt, warehouse, 1);
            d = pickPoint ? Math.hypot(pickPoint.x - w.pos.x, pickPoint.y - w.pos.y) : 99;
          }
          // Достаём только вплотную: коробка должна быть в пределах вытянутой руки
          var gap = reachGap(order);
          if (d < 0.45 && gap <= ARM_REACH) {
            w.speedNow = 0;
            turnTowards(Math.atan2(order.y - w.pos.y, order.x - w.pos.x), dt, 4);
            w.timers.pick += dt;
            var need = model.pickTime(body, w.decision) * (1 + Math.max(0, order.mass - 22) / 60);
            if (w.timers.pick >= need) {
              w.timers.pick = 0;
              w.carryingId = order.id;
              warehouse.markCarried(order, w.id);
              w.stats.picked += 1;
              if (order.mass > model.safeLift(body)) {
                emit('Поднял ' + Math.round(order.mass) + ' кг — выше безопасного предела', 'warn');
              }
              setState('toDrop');
              setGoal(carryingPoint(warehouse, order));
              emit('Коробка ' + order.code + ' в руках', 'info');
            }
          } else if (d < 0.45 && gap > ARM_REACH) {
            // Стоим рядом, но не дотягиваемся — отказываемся, а не тянемся «резиновой рукой»
            w.timers.reach = (w.timers.reach || 0) + dt;
            if (w.timers.reach > 2.5) {
              w.timers.reach = 0;
              var why = 'Коробка вне досягаемости (' + gap.toFixed(1) + ' м) — подойти не получилось';
              refuseOrder(warehouse, order, why);
              if (env.onRefused) env.onRefused(w, order, why);
            }
          } else {
            w.timers.reach = 0;
          }
          break;
        }
        case 'toDrop': {
          order = activeOrder(warehouse);
          if (!order) { setState('idle'); w.orderId = null; w.carryingId = null; break; }
          var truck = order.truckId && warehouse.truckById ? warehouse.truckById(order.truckId) : null;
          if (order.truckId && (!truck || truck.status !== 'working') && w.carryingId) {
            // Фура уже уехала — коробку возвращаем на полку
            if (warehouse.restock) warehouse.restock(order);
            w.orderId = null;
            w.carryingId = null;
            setState('idle');
            setGoal(null);
            emit('Фура уехала, коробка возвращена на место', 'warn');
            break;
          }
          var outbound = Boolean(truck) && order.direction === 'out';
          var dropPoint = outbound ? { x: truck.stand.x, y: truck.stand.y } : carryingPoint(warehouse, order);
          var slot = slotOf(warehouse, order);
          var reach = dropPoint ? Math.hypot(dropPoint.x - w.pos.x, dropPoint.y - w.pos.y) : 99;
          if (reach > 0.3) setGoal(dropPoint, 'drop:' + order.id);
          else setGoal(null);
          if (w.goal) {
            stepTowards(dt, warehouse, 1);
            reach = dropPoint ? Math.hypot(dropPoint.x - w.pos.x, dropPoint.y - w.pos.y) : 99;
          }
          var placeGap = outbound ? reach : slotGap(slot);
          if (reach < 0.45 && placeGap <= ARM_REACH + 0.25) {
            w.speedNow = 0;
            var aim = outbound ? truck.handle : (slot || { x: order.x, y: order.y });
            turnTowards(Math.atan2(aim.y - w.pos.y, aim.x - w.pos.x), dt, 4);
            w.timers.place += dt;
            var placeNeed = model.placeTime(body, w.decision) * (outbound ? 1.05 : 1 + ((slot && slot.h) || 0.25) * 0.25);
            if (w.timers.place >= placeNeed) {
              w.timers.place = 0;
              if (outbound) {
                var loadRes = warehouse.loadTruck(order, w.id);
                w.orderId = null;
                w.carryingId = null;
                w.stats.loaded = (w.stats.loaded || 0) + 1;
                model.deliverReward(body, order.priority + 0.5);
                setState('idle');
                setGoal(null);
                if (env.onLoaded) env.onLoaded(w, order, loadRes);
              } else {
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
            if (dmg > 0.4 && rng.next() < 0.28) {
              var smash = model.addInjury(body, {
                type: 'brain', part: 'head', severity: 0.12 + 0.2 * rng.next(), cause: 'коробка упала и задела голову',
              });
              w.safety.injuries += 1;
              w.safety.grace = 10;
              emit('Травма: ' + smash.text, 'bad');
              if (env.onInjury) env.onInjury(w, smash);
            }
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
      var limit = liftLimit();
      for (var i = 0; i < pending.length; i++) {
        var o = pending[i];
        // Не берём то, что уже отказались брать, и то, что не поднять по правилам
        if (o.refusedBy && o.refusedBy[w.id] && warehouse.state.time - o.refusedBy[w.id] < 30) continue;
        if (o.mass > limit) continue;
        if (o.truckId) {
          var tr = warehouse.truckById ? warehouse.truckById(o.truckId) : null;
          if (!tr || tr.status !== 'working') continue;
        }
        var dist = Math.hypot(o.x - w.pos.x, o.y - w.pos.y);
        var timeLeft = Math.max(0, o.deadline - warehouse.state.time);
        var urgencyScore = (1 - Math.min(1, timeLeft / 100)) * (0.6 + 1.8 * urgency);
        var massScore = -Math.max(0, o.mass - model.carryCapacity(body)) * 0.12;
        var s = urgencyScore * 6 + o.priority * (1 + 2 * urgency) - dist * 0.14 - o.damage * 2 + massScore;
        if (o.truckId) s += 1.8; // фуру не заставишь ждать
        if (o.mass > model.safeLift(body)) s -= 2.5; // тяжесть — только если больше некому
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
