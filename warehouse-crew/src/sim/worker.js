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
    // Настоящая комната: три стены и проём в четвёртой, без невидимого блока.
    if (layout.toilet) {
      var t = layout.toilet, x1 = t.x - t.w / 2, x2 = t.x + t.w / 2;
      var y1 = t.y - t.d / 2, y2 = t.y + t.d / 2, wall = 0.08;
      var doorL = t.x - t.doorWidth / 2, doorR = t.x + t.doorWidth / 2;
      RECTS.push({ x1: x1, x2: x1 + wall, y1: y1, y2: y2, id: 'toilet-left' });
      RECTS.push({ x1: x2 - wall, x2: x2, y1: y1, y2: y2, id: 'toilet-right' });
      RECTS.push({ x1: x1, x2: x2, y1: y2 - wall, y2: y2, id: 'toilet-back' });
      RECTS.push({ x1: x1, x2: doorL, y1: y1, y2: y1 + wall, id: 'toilet-front-left' });
      RECTS.push({ x1: doorR, x2: x2, y1: y1, y2: y1 + wall, id: 'toilet-front-right' });
    }
    // Паллета отдела тяжёлого груза
    if (layout.heavy) {
      RECTS.push({
        x1: layout.heavy.pallet.x - 0.62, x2: layout.heavy.pallet.x + 0.62,
        y1: layout.heavy.pallet.y - 0.9, y2: layout.heavy.pallet.y + 0.9, id: 'heavy',
      });
    }
    // Киоск на улице: обходим, а не проходим насквозь
    if (layout.street && layout.street.kiosk) {
      var k = layout.street.kiosk;
      RECTS.push({ x1: k.x - 0.9, x2: k.x + 0.9, y1: k.y - 0.8, y2: k.y + 0.8, id: 'kiosk' });
    }
    // Стол начальника и опоры лавки: те же габариты, что у сцены.
    RECTS.push({ x1: -11.0, x2: -10.2, y1: 6.25, y2: 8.15, id: 'desk' });
    RECTS.push({ x1: -7.1, x2: -5.3, y1: 7.08, y2: 7.62, id: 'bench' });
    // Остальная зона отдыха доступна.
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
    if (GRID && GRID.layout) {
      var samples = Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 0.2);
      for (var j = 1; j < samples; j++) {
        var t = j / samples;
        if (!insideWalk(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, GRID.layout)) return { id: 'boundary' };
      }
    }
    return null;
  }

  // --------------------------------------------------------------- навигация
  // Сетка 0.5 м + A*: надёжнее «обхода углов», который застревал на стеллажах.
  var GRID = null;

  function buildGrid(layout) {
    var cell = 0.5;
    var minY = -layout.depth / 2;
    var maxY = layout.depth / 2;
    if (layout.street && layout.street.y1 > maxY) maxY = layout.street.y1;
    var cols = Math.ceil(layout.width / cell);
    var rows = Math.ceil((maxY - minY) / cell);
    var blocked = new Uint8Array(cols * rows);
    for (var y = 0; y < rows; y++) {
      for (var x = 0; x < cols; x++) {
        var wx = -layout.width / 2 + (x + 0.5) * cell;
        var wy = minY + (y + 0.5) * cell;
        var isBlocked = 0;
        for (var r = 0; r < RECTS.length; r++) {
          if (pointInRect(wx, wy, RECTS[r], 0.42)) { isBlocked = 1; break; }
        }
        if (!insideWalk(wx, wy, layout)) isBlocked = 1;
        blocked[y * cols + x] = isBlocked;
      }
    }
    GRID = { cell: cell, cols: cols, rows: rows, blocked: blocked, layout: layout, originX: -layout.width / 2, originY: minY };
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
    var safeGoal = insideWalk(to.x, to.y, GRID.layout) && !RECTS.some(function (r) { return pointInRect(to.x, to.y, r, 0.38); });
    var endPoint = safeGoal ? { x: to.x, y: to.y } : fromCell(goalCell.x, goalCell.y);
    if (startCell.x === goalCell.x && startCell.y === goalCell.y) return [{ x: endPoint.x, y: endPoint.y }];

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
    points.push(endPoint);
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

  // Ходить можно по цеху И по улице, но на улицу — только через ворота.
  // Одна функция правды и для навигации, и для границ.
  function insideWalk(x, y, layout) {
    layout = layout || (GRID && GRID.layout) || null;
    if (!layout) return true;
    var hw = layout.width / 2 - 0.55;
    var hd = layout.depth / 2 - 0.55;
    if (Math.abs(x) <= hw && Math.abs(y) <= hd) return true;
    var st = layout.street;
    if (!st) return false;
    if (x >= st.x0 + 0.45 && x <= st.x1 - 0.45 && y >= st.y0 + 0.1 && y <= st.y1 - 0.45) return true;
    if (Math.abs(x - st.gate.x) <= st.gate.half - 0.1 && y > hd - 0.2 && y <= st.y0 + 0.2) return true;
    return false;
  }

  function clampToFloor(pos, layout) {
    var hw = layout.width / 2 - 0.5;
    var hd = layout.depth / 2 - 0.5;
    var st = layout.street;
    if (st && pos.y > hd) {
      // В проёме южной стены держимся створа ворот, на улице — её габарита
      if (pos.y >= st.y0 - 0.05) {
        pos.x = Math.max(st.x0 + 0.45, Math.min(st.x1 - 0.45, pos.x));
        pos.y = Math.min(st.y1 - 0.45, pos.y);
        return pos;
      }
      if (Math.abs(pos.x - st.gate.x) > st.gate.half - 0.18) pos.y = hd;
      else pos.y = Math.min(st.y0 - 0.05, pos.y);
      return pos;
    }
    pos.x = Math.max(-hw, Math.min(hw, pos.x));
    pos.y = Math.max(-hd, Math.min(hd, pos.y));
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
    var bodyOverrides = Object.assign({}, opts.overrides || {});
    if (opts.gender) bodyOverrides.gender = opts.gender;
    var body = model.createBody(traits, bodyOverrides);
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
      anim: {
        phase: 0, walk: 0, lean: 0, armSwing: 0, breath: 0,
        run: 0, stride: 0, limp: 0, torsoTwist: 0, headTurn: 0,
        hurt: { shoulder: 0, back: 0, head: 0, wrist: 0, knee: 0, ankle: 0 },
        muscle: { legs: 0, back: 0, arms: 0, shoulders: 0 },
        drive: 0, sit: 0, blink: 0,
      },
      elapsed: 0,
      turnRate: 0,
      lastHeading: opts.heading || 0,
      safety: { fear: 0, strikes: 0, injuries: 0, grace: 0, lastRule: null, refusals: 0, lastRefusalAt: -99 },
      gender: opts.gender || (String(opts.name || '').slice(-1) === 'а' ? 'ж' : 'м'),
      dead: false,
      deathCause: null,
      inToilet: false,
      privacy: false,         // уединённое место: снаружи не видно
      onForklift: false,      // едет на погрузчике
      techOrderId: null,
      streetClock: 0,
      playClock: 0,
      playCooldown: 0,
      rideClock: 0,
      meetId: null,
      meetUntil: 0,
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
      // На погрузчике масса уже не на руках: техника держит до 80 кг
      if (w.onForklift && order.mass <= 80) return { ok: true, over: 0 };
      if (order.heavy || order.mass > 34) return { ok: false, reason: 'Тяжёлый груз: нужен погрузчик' };
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
        if (!insideWalk(c.x, c.y, layout)) continue;
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
          if (!insideWalk(px, py, layout)) continue;
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
      return []; // Непроходимый путь — стоим, а не идём сквозь препятствие.
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
      if (!waypoint) { w.speedNow = 0; return 0; }
      if (pathBlocked(w.pos, waypoint)) {
        w.path = computePath(w.pos, w.goal);
        waypoint = w.path[0];
        if (!waypoint) { w.speedNow = 0; return 0; }
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
      if (w.onForklift) factor *= 2.15;     // техника едет, а не идёт
      if (w.urgentRush) factor *= 1.32;      // побежал: заказ вот-вот просрочат
      // Разгон и торможение ограничены, скорость не скачет на каждом кадре.
      var desiredSpeed = Math.min(dist / Math.max(dt, 1e-6), base * factor);
      var speed = Math.max(0, Math.min(desiredSpeed, w.speedNow + 3.5 * dt));
      var step = speed * dt;
      var next = { x: w.pos.x + (dx / dist) * step, y: w.pos.y + (dy / dist) * step };
      if (pathBlocked(w.pos, next, 0.30) || !insideWalk(next.x, next.y, layout)) {
        w.path = []; w.speedNow = 0; return 0;
      }
      w.pos.x = next.x;
      w.pos.y = next.y;
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
    var lastWarehouse = null;

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
      var mass = carrying && order && !w.onForklift ? order.mass : 0;
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
            var vx = Math.cos(w.heading) * Math.min(1.6, w.speedNow * 0.9);
            var vy = Math.sin(w.heading) * Math.min(1.6, w.speedNow * 0.9);
            var outcome = warehouse.drop(order, dmg, w.pos.x, w.pos.y, { vx: vx, vy: vy, vz: 0.4, z: dmg > 0.5 ? 0.7 : 0.5 });
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

    // ------------------------------------------------- нужды, техника, смерть
    var PLAY_ROUTE = [
      { x: 10.8, y: -6.6 }, { x: 10.3, y: -3.8 },
      { x: 7.4, y: -6.5 }, { x: 9.6, y: -6.4 },
    ];

    function goToToilet(warehouse) {
      var room = layout.toilet;
      if (!room || !warehouse || (warehouse.state.toiletOccupant && warehouse.state.toiletOccupant !== w.id)) return false;
      warehouse.state.toiletOccupant = w.id;
      setState('toToilet');
      setGoal({ x: room.x, y: room.y }, 'toilet');
      emit('Идёт в туалет', 'info');
      return true;
    }

    function goToStreet(reason) {
      var st = layout.street;
      if (!st || !st.spots || !st.spots.length) return false;
      var rng2 = (w.rngRef && w.rngRef()) || { range: function (a, b) { return (a + b) / 2; } };
      var spot = st.spots[(w.id.length + Math.round(w.streetClock || 0)) % st.spots.length];
      w.streetClock = 0;
      setState('toStreet');
      setGoal({ x: spot.x + rng2.range(-0.5, 0.5), y: spot.y + rng2.range(-0.4, 0.4) }, 'street');
      emit(reason || 'Выйдет на улицу подышать', 'info');
      return true;
    }

    function forkliftState() {
      var wh = lastWarehouse || (lastEnv && lastEnv.warehouse);
      return wh ? wh.state.forklift : null;
    }

    function forkliftFree() {
      var f = forkliftState();
      return Boolean(f) && (f.rider == null || f.rider === w.id);
    }

    function goToTech(warehouse, order) {
      var f = forkliftState();
      if (!f) return false;
      w.techOrderId = order ? order.id : null;
      setState('toTech');
      setGoal({ x: f.x, y: f.y }, 'forklift');
      emit(order
        ? 'Идёт за погрузчиком: такую коробку руками не берут'
        : 'Идёт к погрузчику — покататься', 'info');
      return true;
    }

    function mountTech() {
      var f = forkliftState();
      if (!f) return false;
      w.onForklift = true;
      f.rider = w.id;
      w.anim.drive = 0;
      emit('Завёл погрузчик', 'good');
      return true;
    }

    function dismountTech() {
      var f = forkliftState();
      w.onForklift = false;
      if (f && f.rider === w.id) f.rider = null;
      return true;
    }

    function die(warehouse, cause) {
      if (w.dead) return;
      if (warehouse && warehouse.endRagdoll) warehouse.endRagdoll(w);
      w.dead = true;
      w.deathCause = cause || 'несчастный случай';
      body.deceased = true;
      body.vitality = 0;
      if (warehouse && w.carryingId) {
        for (var i = 0; i < warehouse.state.orders.length; i++) {
          if (warehouse.state.orders[i].id !== w.carryingId) continue;
          warehouse.drop(warehouse.state.orders[i], 0.5, w.pos.x, w.pos.y, { vz: 0.3, spin: 2 });
        }
      }
      w.carryingId = null;
      releaseOrder(warehouse);
      w.orderId = null;
      w.inToilet = false;
      if (warehouse && warehouse.state.toiletOccupant === w.id) warehouse.state.toiletOccupant = null;
      dismountTech();
      w.speedNow = 0;
      setState('dead');
      setGoal(null);
      if (warehouse) {
        warehouse.state.deaths.push({
          id: w.id, name: w.name, day: warehouse.state.day,
          cause: w.deathCause, t: Math.round(warehouse.state.time),
        });
        warehouse.state.stats.deaths = (warehouse.state.stats.deaths || 0) + 1;
        warehouse.note(w.name + ' погиб: ' + w.deathCause, 'bad');
      }
      emit('Погиб: ' + w.deathCause, 'bad');
      if (lastEnv && typeof lastEnv.onDeath === 'function') lastEnv.onDeath(w, w.deathCause);
    }

    // Текущие нужды: туалет, улица, техника. Работа важнее, но не навсегда.
    function updateNeeds(dt, warehouse, env, order, rng) {
      if (w.dead) return;
      w.playCooldown = Math.max(0, (w.playCooldown || 0) - dt);
      w.streetClock = (w.streetClock || 0) + dt;
      var busy = w.carryingId || order;
      if (body.bladder > 0.84 && !busy && w.state !== 'toToilet' && w.state !== 'toilet' && w.state !== 'fromToilet') goToToilet(warehouse);
      if (!busy && w.mode === 'auto' && w.state === 'idle' &&
          w.streetClock > 75 && body.stress > 0.66) {
        goToStreet('Вышел на улицу: стресс ' + Math.round(body.stress * 100) + '%');
      }
      // Тянет к технике не каждый тик, а примерно раз в минуту простоя
      if (!busy && w.mode === 'auto' && w.state === 'idle' && w.playCooldown <= 0 &&
          body.fun < 0.3 && forkliftFree()) {
        var watch = env.watchman;
        var nearWatch = watch && Math.hypot(watch.x - w.pos.x, watch.y - w.pos.y) < 6;
        if (!nearWatch && rng.next() < 0.018 * dt) goToTech(warehouse, null);
      }
      // Погрузчик едет вместе с водителем
      if (w.onForklift) {
        var f = forkliftState();
        if (f) {
          f.x = w.pos.x;
          f.y = w.pos.y;
          f.yaw = w.heading;
          f.wheels = (f.wheels || 0) + w.speedNow * dt * 3;
        }
      }
    }

    // ---------------------------------------------------------- команды панели
    function command(cmd, warehouse, opts2) {
      opts2 = opts2 || {};
      if (warehouse) lastWarehouse = warehouse;
      if (w.dead) return { ok: false, reason: 'Рабочий погиб' };
      if ((w.state === 'toToilet' || w.state === 'toilet' || w.state === 'fromToilet') && cmd !== 'auto') return { ok: false, reason: 'Рабочий занят посещением туалета' };
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
            // Тяжёлый груз: не отказ, а «иду за техникой»
            if (!w.onForklift && warehouse.heavyOf && warehouse.heavyOf(order) && order.mass <= 80 && forkliftFree()) {
              var heavyClaim = warehouse.claim(order.id, w.id);
              if (heavyClaim) {
                w.orderId = order.id;
                w.timers.pick = 0;
                goToTech(warehouse, order);
                return { ok: true, state: w.state, orderId: order.id, tech: true };
              }
            }
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
          if (w.onForklift) dismountTech();
          w.privacy = false;
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
        case 'toilet':
          if (w.carryingId) return { ok: false, reason: 'Сначала поставь коробку' };
          if (!layout.toilet || !warehouse || (warehouse.state.toiletOccupant && warehouse.state.toiletOccupant !== w.id)) return { ok: false, reason: 'Туалет занят или недоступен' };
          w.mode = opts2.keepAuto ? w.mode : 'manual';
          releaseOrder(warehouse);
          if (w.onForklift) dismountTech();
          if (!goToToilet(warehouse)) return { ok: false, reason: 'Туалет занят или недоступен' };
          return { ok: true, state: w.state };
        case 'street':
          w.mode = opts2.keepAuto ? w.mode : 'manual';
          if (w.carryingId) return { ok: false, reason: 'С грузом на улицу нельзя' };
          releaseOrder(warehouse);
          if (w.onForklift) dismountTech();
          if (!goToStreet('Пошёл на улицу')) return { ok: false, reason: 'Улицы нет' };
          return { ok: true, state: w.state };
        case 'tech':
        case 'play':
          w.mode = opts2.keepAuto ? w.mode : 'manual';
          if (w.carryingId) return { ok: false, reason: 'Сначала поставь коробку' };
          if (!forkliftFree()) return { ok: false, reason: 'Погрузчик занят' };
          releaseOrder(warehouse);
          if (!goToTech(warehouse, null)) return { ok: false, reason: 'Погрузчика нет' };
          return { ok: true, state: w.state };
        case 'meet': {
          // Уединённое место: двое договариваются и уходят с глаз
          w.mode = opts2.keepAuto ? w.mode : 'manual';
          if (w.carryingId) return { ok: false, reason: 'Сначала поставь коробку' };
          var spot = opts2.spot || (layout.privacySpots && layout.privacySpots[0]);
          if (!spot) return { ok: false, reason: 'Нет уединённого места' };
          w.meetId = opts2.meetId || null;
          w.meetUntil = opts2.until || 0;
          releaseOrder(warehouse);
          setState('toMeet');
          setGoal({ x: spot.x, y: spot.y }, 'meet:' + (w.meetId || 'spot'));
          emit('Уходит в укромное место (' + (spot.label || 'тайное') + ')', 'info');
          return { ok: true, state: w.state };
        }
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
      lastWarehouse = warehouse;
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
      if (carrying && order && order.pose) {
        order.pose.x = w.pos.x; order.pose.y = w.pos.y;
        order.pose.z = w.onForklift ? 0.35 : 0.8;
        order.pose.yaw = w.heading;
      }
      // Побежал: до дедлайна меньше 18 секунд и руки свободны
      w.urgentRush = Boolean(order && !carrying && order.deadline - warehouse.state.time < 18);
      updateNeeds(dt, warehouse, env, order, rng);

      // 2b. Правила техники безопасности поверх решений сети + травмы
      var headingDelta = Math.atan2(Math.sin(w.heading - w.lastHeading), Math.cos(w.heading - w.lastHeading));
      w.turnRate = Math.abs(headingDelta) / Math.max(dt, 1e-4);
      w.lastHeading = w.heading;
      if (w.timers.stun > 0) w.timers.stun = Math.max(0, w.timers.stun - dt);
      applySafety(order);
      safetyStep(dt, warehouse, order, carrying, rng, env);

      var speedNorm = w.speedNow / 1.8;
      var bodyCarrying = carrying && !w.onForklift;
      var intensity = model.intensityOf(body, {
        speed: Math.min(1, speedNorm),
        carrying: bodyCarrying,
        lifting: !w.onForklift && w.state === 'toPick' && w.timers.pick > 0,
        lower: w.state === 'toDrop' && w.timers.place > 0,
        awkward: bodyCarrying && order ? Math.min(1, order.mass / 30) : 0,
      }, bodyCarrying && order ? order.mass : 0);
      model.stepBody(body, dt, {
        intensity: w.resting ? 0.1 : intensity,
        resting: w.resting || w.state === 'down',
        carrying: bodyCarrying,
        noise: 0.2 + Math.min(0.5, allWorkers.length * 0.04),
        urgency: order ? order.priority : 0.2,
        teamSupport: w.decision.coop,
        reward: 0,
        eating: w.state === 'rest',
        toilet: w.state === 'toilet',
        medical: Boolean(w.medicalAid),
      });

      var statsBefore = body.unitsDelivered;

      // 3. Обморок
      if (body.collapsed && w.state !== 'down') {
        setState('down');
        if (warehouse.beginRagdoll) warehouse.beginRagdoll(w);
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

      // Медик рядом? Лечение действует, пока он не отойдёт
      w.medicalAid = Boolean(env.medicNear);

      // 3b. Смерть: несовместимые травмы без помощи или полное истощение
      if (!w.dead && (model.isDead(body) || (model.injuryLevel(body) > 0.9 && body.vitality < 0.22))) {
        die(warehouse, model.injuryLevel(body) > 0.9 ? 'несовместимые травмы' : 'истощение организма');
      }
      if (w.dead) {
        w.speedNow = 0;
        return w;
      }

      // 4. Автономия: решения о задачах
      if (w.mode === 'auto' && !body.collapsed) {
        var NEED_STATES = { toRest: 1, rest: 1, toToilet: 1, toilet: 1, fromToilet: 1, toStreet: 1, street: 1, toTech: 1, play: 1, toMeet: 1, meet: 1 };
        if (!w.orderId && !NEED_STATES[w.state]) {
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
            if (w.ragdoll && w.ragdoll.pelvis) {
              var p = w.ragdoll.pelvis;
              if (insideWalk(p.x, p.z, layout) && !pathBlocked(w.pos, { x: p.x, y: p.z }, 0.3)) { w.pos.x = p.x; w.pos.y = p.z; }
            }
            if (warehouse.endRagdoll) warehouse.endRagdoll(w);
            if (warehouse.state.toiletOccupant === w.id) {
              setState('fromToilet');
              setGoal({ x: layout.toilet.x, y: layout.toilet.y - layout.toilet.d / 2 - 0.7 }, 'toilet-exit');
            } else { setState('idle'); setGoal(null); }
            emit('Поднялся и вернулся в строй', 'warn');
          }
          break;
        }
        case 'toToilet': {
          if (w.goal) stepTowards(dt, warehouse, 0.95);
          if (!w.goal) {
            w.inToilet = true;
            w.timers.toilet = 0;
            w.resting = false;
            setState('toilet');
            emit('Вошёл в туалет', 'info');
          }
          break;
        }
        case 'toilet': {
          w.speedNow = 0;
          w.timers.toilet = (w.timers.toilet || 0) + dt;
          if (w.timers.toilet >= 9 + (w.id.length % 4) * 2.4) {
            setState('fromToilet');
            setGoal({ x: layout.toilet.x, y: layout.toilet.y - layout.toilet.d / 2 - 0.7 }, 'toilet-exit');
          }
          break;
        }
        case 'fromToilet': {
          if (w.goal) stepTowards(dt, warehouse, 0.95);
          if (layout.toilet && w.pos.y < layout.toilet.y - layout.toilet.d / 2 - 0.1) w.inToilet = false;
          if (!w.goal) {
            w.inToilet = false;
            w.timers.toilet = 0;
            if (warehouse.state.toiletOccupant === w.id) warehouse.state.toiletOccupant = null;
            setState('idle');
            emit('Вышел из туалета', 'info');
          }
          break;
        }
        case 'toStreet': {
          if (w.goal) stepTowards(dt, warehouse, 1.05);
          if (!w.goal) {
            setState('street');
            w.timers.street = 0;
            emit('Вышел на улицу, дышит', 'info');
          }
          break;
        }
        case 'street': {
          w.speedNow = 0;
          w.timers.street = (w.timers.street || 0) + dt;
          body.stress = model.clamp01(body.stress - dt * 0.045);
          body.fun = model.clamp01(body.fun + dt * 0.025);
          body.social = model.clamp01(body.social + dt * 0.012);
          if (w.timers.street > 11 + (w.id.length % 3) * 3) {
            w.timers.street = 0;
            w.streetClock = 0;
            setState('idle');
            setGoal(null);
            emit('Вернулся с улицы', 'info');
          }
          break;
        }
        case 'toMeet': {
          if (w.goal) stepTowards(dt, warehouse, 1.02);
          if (!w.goal) {
            setState('meet');
            w.timers.meet = 0;
            w.privacy = true;
            emit('Уединился в укромном месте', 'info');
          }
          break;
        }
        case 'meet': {
          w.speedNow = 0;
          w.timers.meet = (w.timers.meet || 0) + dt;
          body.stress = model.clamp01(body.stress - dt * 0.05);
          body.oxytocin = model.clamp01(body.oxytocin + dt * 0.02);
          body.fun = model.clamp01(body.fun + dt * 0.03);
          if (w.timers.meet > (w.meetUntil || 14)) {
            w.timers.meet = 0;
            w.privacy = false;
            setState('idle');
            setGoal(null);
            emit('Вернулся из укромного места', 'info');
          }
          break;
        }
        case 'toTech': {
          if (!forkliftFree()) {
            var stuck = w.techOrderId ? activeOrder(warehouse) : null;
            if (stuck && stuck.status === 'claimed') {
              stuck.status = 'pending';
              stuck.carrier = null;
            }
            w.orderId = null;
            w.techOrderId = null;
            setState('idle');
            setGoal(null);
            emit('Погрузчик занят напарником', 'warn');
            break;
          }
          if (w.goal) stepTowards(dt, warehouse, 1.15);
          if (!w.goal) {
            if (!mountTech()) { setState('idle'); break; }
            if (w.techOrderId) {
              var heavyOrder = activeOrder(warehouse);
              if (heavyOrder) {
                setState('toPick');
                setGoal(targetPoint(warehouse, heavyOrder), 'pick:' + heavyOrder.id);
              } else {
                w.techOrderId = null;
                setState('idle');
              }
            } else {
              setState('play');
              w.timers.play = 0;
              setGoal(null);
            }
          }
          break;
        }
        case 'play': {
          w.timers.play = (w.timers.play || 0) + dt;
          var stepIdx = Math.floor(w.timers.play / 3.4) % PLAY_ROUTE.length;
          var routePoint = PLAY_ROUTE[stepIdx];
          setGoal({ x: routePoint.x, y: routePoint.y }, 'play:' + stepIdx);
          if (w.goal) stepTowards(dt, warehouse, 1.35);
          body.fun = model.clamp01(body.fun + dt * 0.05);
          var watchman = env.watchman;
          var caught = watchman && Math.hypot(watchman.x - w.pos.x, watchman.y - w.pos.y) < 5.5;
          if (caught) {
            emit('Сторож: «На технике катаются только по наряду»', 'warn');
            warehouse.note(w.name + ': сторож поймал за катанием на погрузчике', 'warn');
            w.safety.strikes += 1;
            w.playCooldown = 70;
            dismountTech();
            setState('idle');
            setGoal(null);
            if (env.onCaught) env.onCaught(w);
            break;
          }
          if (rng.next() < 0.035 * dt) {
            var crash = model.addInjury(body, {
              type: 'limb',
              part: rng.next() < 0.5 ? 'wrist' : 'knee',
              severity: 0.18 + 0.3 * rng.next(),
              cause: 'не удержал руль погрузчика',
            });
            w.safety.injuries += 1;
            w.safety.grace = 10;
            emit('Травма: ' + crash.text, 'bad');
            if (env.onInjury) env.onInjury(w, crash);
          }
          if (w.timers.play > 12) {
            w.playCooldown = 55;
            w.timers.play = 0;
            dismountTech();
            setState('idle');
            setGoal(null);
            emit('Накатался, вернулся к работе', 'info');
          }
          break;
        }
        case 'dead': {
          w.speedNow = 0;
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
            // Тяжёлый груз не бросаем: идём за техникой, если она свободна
            if (!w.onForklift && warehouse.heavyOf && warehouse.heavyOf(order) && order.mass <= 80 && forkliftFree()) {
              goToTech(warehouse, order);
              break;
            }
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
          var gap = w.onForklift ? Math.max(0, Math.hypot(order.x - w.pos.x, order.y - w.pos.y) - 1.0) : reachGap(order);
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
                if (w.onForklift) dismountTech();
                var loadRes = warehouse.loadTruck(order, w.id);
                w.orderId = null;
                w.carryingId = null;
                w.stats.loaded = (w.stats.loaded || 0) + 1;
                model.deliverReward(body, order.priority + 0.5);
                setState('idle');
                setGoal(null);
                if (env.onLoaded) env.onLoaded(w, order, loadRes);
              } else {
                if (w.onForklift) dismountTech();
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
          var risk = model.dropRisk(body, w.decision, w.onForklift ? 0 : order.mass) * dt;
          if (rng.next() < risk && warehouse.state.time - w.lastDropAt > 1.2) {
            w.lastDropAt = warehouse.state.time;
            var dmg = 0.28 + 0.5 * rng.next() + 0.12 * Math.min(1, order.mass / 30);
            var outcome = warehouse.drop(order, dmg, w.pos.x, w.pos.y, { vx: Math.cos(w.heading) * w.speedNow * 0.4, vy: Math.sin(w.heading) * w.speedNow * 0.4, vz: 0.3, z: 0.7 });
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

      // 6. Столкновения со стенами и другими работниками.
      pushOutOfRects(w.pos, layout);
      for (var i = 0; i < allWorkers.length; i++) {
        var other = allWorkers[i];
        if (other.id === w.id) continue;
        var dx = w.pos.x - other.pos.x;
        var dy = w.pos.y - other.pos.y;
        var dist = Math.hypot(dx, dy);
        if (dist > 0.001 && dist < 0.75) {
          var push = (0.75 - dist) * 0.5;
          var separated = { x: w.pos.x + (dx / dist) * push, y: w.pos.y + (dy / dist) * push };
          if (insideWalk(separated.x, separated.y, layout) && !pathBlocked(w.pos, separated, 0.30)) {
            w.pos.x = separated.x; w.pos.y = separated.y;
          }
        }
      }

      // 7. Анимация: походка, бег, травмы, натяжение мышц, поворот головы
      var walkTarget = w.speedNow > 0.05 ? 1 : 0;
      w.anim.walk += (walkTarget - w.anim.walk) * Math.min(1, dt * 8);
      w.anim.phase += dt * (2.2 + 5.2 * Math.min(1.5, w.speedNow / 1.2)) * (walkTarget ? 1 : 0);
      w.anim.lean = w.anim.lean + ((w.carryingId ? 0.16 : 0.02) - w.anim.lean) * Math.min(1, dt * 5);
      w.anim.breath += dt * (0.6 + body.breathing / 40);
      w.anim.armSwing = Math.sin(w.anim.phase) * 0.55 * w.anim.walk;

      // Бег: больше амплитуда, корпус вперёд, руки качаются в такт
      var runTarget = model.clamp01((w.speedNow - 1.35) / 0.85);
      w.anim.run += (runTarget - w.anim.run) * Math.min(1, dt * 5);
      w.anim.stride = 0.5 + 0.55 * w.anim.run + 0.12 * (w.carryingId ? 0 : 1) * w.anim.walk;

      // Травмы — в числа для рига: каждая часть тела знает, насколько ей больно
      w.anim.hurt.knee = model.injuryOf(body, 'knee');
      w.anim.hurt.ankle = model.injuryOf(body, 'ankle');
      w.anim.hurt.back = model.injuryOf(body, 'back');
      w.anim.hurt.shoulder = model.injuryOf(body, 'shoulder');
      w.anim.hurt.wrist = model.injuryOf(body, 'wrist');
      w.anim.hurt.head = model.injuryOf(body, 'head');
      w.anim.limp += (Math.max(w.anim.hurt.knee, w.anim.hurt.ankle) - w.anim.limp) * Math.min(1, dt * 4);

      // Поворот корпуса и головы: сначала смотрит, потом идёт
      var twistTarget = model.clamp((w.turnRate || 0) * 0.05, -0.45, 0.45);
      w.anim.torsoTwist += (twistTarget - w.anim.torsoTwist) * Math.min(1, dt * 5);
      var headTarget = 0;
      if (w.goal) {
        var aimAngle = Math.atan2(w.goal.y - w.pos.y, w.goal.x - w.pos.x) - w.heading;
        headTarget = model.clamp(Math.atan2(Math.sin(aimAngle), Math.cos(aimAngle)), -0.55, 0.55);
      }
      w.anim.headTurn += (headTarget - w.anim.headTurn) * Math.min(1, dt * 4);

      // Мышцы: натяжение по группам — риг показывает «работу» тела
      for (var mg = 0; mg < model.MUSCLE_GROUPS.length; mg++) {
        var gid = model.MUSCLE_GROUPS[mg].id;
        w.anim.muscle[gid] = model.muscleStrain(body, gid);
      }
      w.anim.drive += ((w.onForklift ? 1 : 0) - w.anim.drive) * Math.min(1, dt * 4);
      w.anim.sit += ((w.state === 'play' || w.state === 'toTech' ? 1 : 0) - w.anim.sit) * Math.min(1, dt * 4);

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
        var techNeeded = (o.heavy || o.mass > 34 || o.mass > limit);
        if (o.mass > 80) continue;
        // Тяжёлое берём, только если свободна техника: иначе коробка так и будет лежать
        if (techNeeded && !forkliftFree()) continue;
        if (techNeeded) {
          var heavyBusy = warehouse.state.forklift && warehouse.state.forklift.rider && warehouse.state.forklift.rider !== w.id;
          if (heavyBusy) continue;
        }
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
        if (o.mass > model.safeLift(body)) s -= 1.2; // тяжесть — техникой, но не в первую очередь
        if (o.heavy) s += 1.4;                      // тяжёлый груз не должен лежать до просрочки
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
    insideWalk: insideWalk,
    buildObstacles: buildObstacles,
    buildGrid: buildGrid,
    findPath: findPath,
    pathBlocked: pathBlocked,
    computePathFor: function (layout, from, to) { buildObstacles(layout); buildGrid(layout); return findPath(from, to); },
  };
});
