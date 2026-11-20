// Склад «Северный узел»: заказы, приёмка, стеллажи, сроки, качество.
// Чистая логика без DOM и Three.js — её гоняют и игра, и обучение нейросети.
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.WarehouseSim = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var CUSTOMERS = [
    'Аптека «Ландыш»', 'Кафе «Тихая гавань»', 'Мастерская Хильда', 'Маркет «Пятый склад»',
    'Сервис «Ключ и гайка»', 'Пекарня Бруно', 'Студия «Пиксель»', 'Клиника «Ольха»',
    'Отель «Северный узел»', 'Барбершоп «Фреза»', 'Книжная «Полка»', 'Кофейня «Тучка»',
  ];

  var GOODS = [
    'посылка с крепежом', 'ящик с банками', 'коробка фильтров', 'рулон стрейч-плёнки',
    'набор инструментов', 'ящик с лампочками', 'коробка салфеток', 'канистра с маслом',
    'коробка с кружками', 'коробка с проводами', 'ящик с подшипниками', 'коробка со специями',
  ];

  function createRng(seed) {
    var state = (seed >>> 0) || 1;
    function next() {
      state = (state + 0x6d2b79f5) >>> 0;
      var t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
    return {
      next: next,
      range: function (a, b) { return a + (b - a) * next(); },
      int: function (a, b) { return Math.floor(a + (b - a + 1) * next()); },
      pick: function (arr) { return arr[Math.floor(next() * arr.length) % arr.length]; },
    };
  }

  // Геометрия цеха (метры). X — вглубь по потоку, Y — поперёк.
  var LAYOUT = {
    width: 26,
    depth: 17,
    intake: [
      { x: -9.4, y: -4.6 },
      { x: -9.4, y: 0 },
      { x: -9.4, y: 4.6 },
    ],
    racks: [
      { id: 'A', x: -1.6, yaw: 0 },
      { id: 'B', x: 2.2, yaw: 0 },
      { id: 'C', x: 6.0, yaw: 0 },
    ],
    rackRows: [-4.9, -1.65, 1.65, 4.9],
    despatch: { x: 10.6, y: 0 },
    restArea: { x: -7.4, y: 7.1 },
    spawns: [
      { x: -5.6, y: 0 },
      { x: -5.2, y: 2.4 },
      { x: -5.2, y: -2.4 },
    ],
  };

  // Ячейка стеллажа: 3 ряда по 4 уровня
  var RACK_LEVELS = [
    { level: 'низ', height: 0.25 },
    { level: 'средне', height: 1.05 },
    { level: 'верх', height: 1.85 },
  ];

  var RACK_SLOTS = [];
  for (var r = 0; r < LAYOUT.racks.length; r++) {
    for (var row = 0; row < LAYOUT.rackRows.length; row++) {
      for (var lvl = 0; lvl < RACK_LEVELS.length; lvl++) {
        RACK_SLOTS.push({
          id: LAYOUT.racks[r].id + '-' + (row + 1) + '-' + (lvl + 1),
          rack: LAYOUT.racks[r].id,
          x: LAYOUT.racks[r].x,
          y: LAYOUT.rackRows[row],
          h: RACK_LEVELS[lvl].height,
          levelLabel: RACK_LEVELS[lvl].level,
          row: row + 1,
          occupied: false,
          orderId: null,
        });
      }
    }
  }

  function createWarehouse(options) {
    options = options || {};
    var rng = createRng(options.seed || 20261120);
    var state = {
      seed: options.seed || 20261120,
      time: 0,
      shiftLength: options.shiftLength || 480,
      orders: [],
      orderSeq: 1,
      slots: RACK_SLOTS.map(function (s) { return Object.assign({}, s); }),
      spawnEvery: options.spawnEvery || 15,
      spawnTimer: options.firstSpawnDelay || 4,
      maxPending: options.maxPending || 12,
      stats: {
        delivered: 0,
        ruined: 0,
        missed: 0,
        score: 0,
        quality: 0,
        dropped: 0,
        perfectStreak: 0,
        bestStreak: 0,
      },
      log: [],
    };

    function note(text, tone) {
      state.log.push({ t: state.time, text: text, tone: tone || 'info' });
      if (state.log.length > 60) state.log.shift();
    }

    function freeIntake() {
      var used = {};
      for (var i = 0; i < state.orders.length; i++) {
        var o = state.orders[i];
        if (o.status === 'pending' && o.intake != null) used[o.intake] = true;
      }
      for (var k = 0; k < LAYOUT.intake.length; k++) if (!used[k]) return k;
      return -1;
    }

    function freeSlot(near) {
      var candidates = state.slots.filter(function (s) { return !s.occupied; });
      if (!candidates.length) return null;
      if (!near) return candidates[0];
      var best = candidates[0];
      var bestD = Infinity;
      for (var i = 0; i < candidates.length; i++) {
        var d = Math.hypot(candidates[i].x - near.x, candidates[i].y - near.y);
        if (d < bestD) { bestD = d; best = candidates[i]; }
      }
      return best;
    }

    function spawnOrder() {
      var intakeIdx = freeIntake();
      var slot = freeSlot();
      if (intakeIdx < 0 || !slot || state.orders.filter(function (o) { return o.status !== 'stored' && o.status !== 'ruined' && o.status !== 'missed'; }).length >= state.maxPending) return null;
      var priority = rng.next();
      var mass = Math.round(rng.range(5, 34));
      var size = mass > 24 ? 'big' : mass > 13 ? 'medium' : 'small';
      var order = {
        id: 'ord-' + (state.orderSeq++),
        code: 'WMS-' + String(1000 + state.orderSeq * 7).slice(-4),
        customer: rng.pick(CUSTOMERS),
        goods: rng.pick(GOODS),
        priority: Math.round(priority * 100) / 100,
        urgent: priority > 0.72,
        mass: mass,
        size: size,
        intake: intakeIdx,
        x: LAYOUT.intake[intakeIdx].x,
        y: LAYOUT.intake[intakeIdx].y,
        slotId: slot.id,
        rack: slot.rack,
        damage: 0,
        status: 'pending', // pending | claimed | carried | stored | ruined | missed
        carrier: null,
        createdAt: state.time,
        deadline: state.time + Math.round(58 + (1 - priority) * 60),
        pickedAt: null,
        storedAt: null,
        drops: 0,
      };
      slot.occupied = true;
      slot.orderId = order.id;
      state.orders.push(order);
      note('Новый заказ ' + order.code + ' для ' + order.customer, order.urgent ? 'warn' : 'info');
      return order;
    }

    function releaseSlot(order) {
      for (var i = 0; i < state.slots.length; i++) {
        if (state.slots[i].id === order.slotId) {
          state.slots[i].occupied = false;
          state.slots[i].orderId = null;
        }
      }
    }

    function claim(orderId, workerId) {
      for (var i = 0; i < state.orders.length; i++) {
        var o = state.orders[i];
        if (o.id !== orderId) continue;
        if (o.status !== 'pending') return null;
        o.status = 'claimed';
        o.carrier = workerId;
        return o;
      }
      return null;
    }

    function markCarried(order, workerId) {
      order.status = 'carried';
      order.carrier = workerId;
      order.pickedAt = state.time;
    }

    function drop(order, damage, x, y) {
      order.status = 'pending';
      order.carrier = null;
      order.x = x;
      order.y = y;
      order.damage = Math.min(1, order.damage + damage);
      order.drops += 1;
      state.stats.dropped += 1;
      if (order.damage >= 0.85) {
        order.status = 'ruined';
        releaseSlot(order);
        state.stats.ruined += 1;
        state.stats.perfectStreak = 0;
        state.stats.score -= 14;
        note('Заказ ' + order.code + ' разбит — списание', 'bad');
        return 'ruined';
      }
      note('Коробка ' + order.code + ' упала (повреждение ' + Math.round(order.damage * 100) + '%)', 'bad');
      return 'dropped';
    }

    function store(order, workerId) {
      order.status = 'stored';
      order.storedAt = state.time;
      order.carrier = null;
      var late = state.time > order.deadline;
      var base = 12 + Math.round(order.priority * 14);
      var damagePenalty = Math.round(order.damage * 22);
      var latePenalty = late ? Math.round(8 + (state.time - order.deadline) * 0.25) : 0;
      var points = Math.max(1, base - damagePenalty - latePenalty);
      state.stats.delivered += 1;
      state.stats.score += points;
      state.stats.forWorker = state.stats.forWorker || {};
      state.stats.forWorker[workerId] = (state.stats.forWorker[workerId] || 0) + points;
      if (order.damage < 0.05 && !late) {
        state.stats.perfectStreak += 1;
        state.stats.bestStreak = Math.max(state.stats.bestStreak, state.stats.perfectStreak);
      } else {
        state.stats.perfectStreak = 0;
      }
      note('Заказ ' + order.code + ' уложен в ' + order.slotId + ' (+' + points + (late ? ', с опозданием' : '') + ')', late ? 'warn' : 'good');
      return { points: points, late: late, damage: order.damage };
    }

    function step(dt) {
      state.time += dt;
      state.spawnTimer -= dt;
      if (state.spawnTimer <= 0) {
        spawnOrder();
        state.spawnTimer = state.spawnEvery * (0.72 + rng.next() * 0.6);
      }
      for (var i = 0; i < state.orders.length; i++) {
        var o = state.orders[i];
        if (o.status === 'missed' || o.status === 'stored' || o.status === 'ruined') continue;
        if (state.time > o.deadline + 35) {
          o.status = 'missed';
          o.carrier = null;
          releaseSlot(o);
          state.stats.missed += 1;
          state.stats.perfectStreak = 0;
          state.stats.score -= 6;
          note('Заказ ' + o.code + ' просрочен', 'bad');
        }
      }
      return state;
    }

    function activeOrders() {
      return state.orders.filter(function (o) {
        return o.status === 'pending' || o.status === 'claimed' || o.status === 'carried';
      });
    }

    function pendingOrders() {
      return state.orders.filter(function (o) { return o.status === 'pending'; });
    }

    function nearestPending(from, filter) {
      var list = pendingOrders();
      var best = null;
      var bestScore = -Infinity;
      for (var i = 0; i < list.length; i++) {
        var o = list[i];
        if (filter && !filter(o)) continue;
        var d = Math.hypot(o.x - from.x, o.y - from.y);
        var urgency = Math.max(0, 1 - Math.max(0, o.deadline - state.time) / 100);
        var s = urgency * 6 + o.priority * 2 - d * 0.12;
        if (s > bestScore) { bestScore = s; best = o; }
      }
      return best;
    }

    function ordersOf(workerId) {
      return state.orders.filter(function (o) { return o.carrier === workerId; });
    }

    function snapshot() {
      return {
        time: Math.round(state.time * 10) / 10,
        stats: Object.assign({}, state.stats),
        orders: state.orders.map(function (o) {
          return {
            id: o.id, code: o.code, customer: o.customer, goods: o.goods, status: o.status,
            priority: o.priority, urgent: o.urgent, mass: o.mass, size: o.size, damage: o.damage,
            x: Math.round(o.x * 100) / 100, y: Math.round(o.y * 100) / 100,
            slotId: o.slotId, rack: o.rack, carrier: o.carrier,
            deadline: Math.round(o.deadline), createdAt: Math.round(o.createdAt),
          };
        }),
        slots: state.slots.map(function (s) {
          return { id: s.id, x: s.x, y: s.y, h: s.h, occupied: s.occupied, orderId: s.orderId, levelLabel: s.levelLabel };
        }),
      };
    }

    return {
      state: state,
      layout: LAYOUT,
      rng: rng,
      step: step,
      spawnOrder: spawnOrder,
      claim: claim,
      markCarried: markCarried,
      drop: drop,
      store: store,
      activeOrders: activeOrders,
      pendingOrders: pendingOrders,
      nearestPending: nearestPending,
      ordersOf: ordersOf,
      snapshot: snapshot,
      freeSlot: freeSlot,
      note: note,
    };
  }

  return {
    createRng: createRng,
    createWarehouse: createWarehouse,
    LAYOUT: LAYOUT,
    RACK_SLOTS: RACK_SLOTS,
    RACK_LEVELS: RACK_LEVELS,
    CUSTOMERS: CUSTOMERS,
    GOODS: GOODS,
  };
});
