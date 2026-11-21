// Склад «Северный узел»: заказы, приёмка, стеллажи, сроки, качество.
// Чистая логика без DOM и Three.js — её гоняют и игра, и обучение нейросети.
(function (root, factory) {
  var physics = typeof module === 'object' && module.exports ? require('./physics.js') : root.WarehousePhysics;
  var api = factory(physics);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.WarehouseSim = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (physics) {
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
      getState: function () { return state >>> 0; },
      setState: function (value) { if (!Number.isInteger(value) || value < 0 || value > 4294967295) throw new Error('Некорректное состояние ГПСЧ'); state = value >>> 0; },
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
    restArea: { x: -7.4, y: 6.3 },
    spawns: [
      { x: -5.6, y: 0 },
      { x: -5.2, y: 2.4 },
      { x: -5.2, y: -2.4 },
    ],
    // Улица за южной стеной: сюда выходят подышать, покурить, поговорить.
    // Ворота — единственный проход, остальное перекрыто сеткой.
    street: {
      x0: -10.8, x1: 10.8, y0: 9.0, y1: 14.4,
      gate: { x: -8.6, half: 1.2 },
      kiosk: { x: 6.4, y: 10.3 },
      spots: [
        { x: -4.8, y: 11.2, label: 'у бордюра' },
        { x: 0.9, y: 11.7, label: 'у остановки' },
        { x: 5.2, y: 10.9, label: 'у киоска' },
      ],
    },
    // Одна отдельная комната туалета с проходом в передней стене.
    toilet: { x: -3.7, y: 7.0, w: 2.8, d: 2.0, doorWidth: 1.6 },
    // Отдел тяжёлого груза в северо-восточном углу: там же стоит техника.
    heavy: {
      x: 9.1, y: -6.1, w: 4.6, d: 3.0,
      pallet: { x: 8.1, y: -6.3 },
      stand: { x: 9.35, y: -6.2 },
      forklift: { x: 9.9, y: -6.6, yaw: -0.85 },
    },
    // Уединённые места: за штабелем паллет и у сетки на улице.
    privacySpots: [
      { x: 9.7, y: 12.0, label: 'за кузовом' },
      { x: -9.6, y: 12.3, label: 'у сетки' },
    ],
  };

  // Габариты коробок повторяют геометрию мешей (ax/ay/az — полуразмеры).
  var BOX_DIMS = {
    small: { halfW: 0.21, halfD: 0.17, h: 0.30 },
    medium: { halfW: 0.26, halfD: 0.21, h: 0.40 },
    big: { halfW: 0.31, halfD: 0.25, h: 0.52 },
  };

  // Нормированная освещённость для физиологии (не фотометрия рендера).
  // Ночью лампы над рядами и уличные фонари дают локальные светлые зоны.
  var INTERIOR_LIGHTS = [[-1.6, 0], [2.2, 0], [6.0, 0]];
  var STREET_LIGHTS = [[-9.6, LAYOUT.street.y0 + 0.5], [9.6, LAYOUT.street.y0 + 0.5]];
  function illuminationAt(mode, x, y) {
    if (mode !== 'night') return 1;
    var outdoor = y >= LAYOUT.street.y0;
    var points = outdoor ? STREET_LIGHTS : INTERIOR_LIGHTS;
    var base = outdoor ? 0.38 : 0.61;
    var strength = outdoor ? 0.33 : 0.24;
    var radius = outdoor ? 5 : 6.5;
    var nearest = Infinity;
    points.forEach(function (p) { nearest = Math.min(nearest, Math.hypot(x - p[0], y - p[1])); });
    return base + strength * Math.max(0, 1 - nearest / radius);
  }

  // Доки для фур: слева разгрузка, справа загрузка.
  // handle — куда реально подают коробку (порог фуры), stand — где стоит рабочий.
  var DOCKS = {
    unload: {
      kind: 'unload',
      title: 'Фура на разгрузку',
      plate: 'А 236 МР',
      carrier: 'СеверТранс',
      x: -14.6, y: 0, yaw: 0,
      door: { x: -12.15, y: 0 },
      handle: { x: -11.85, y: 0 },
      stand: { x: -11.0, y: 0 },
    },
    load: {
      kind: 'load',
      title: 'Фура на загрузку',
      plate: 'О 417 КН',
      carrier: 'Узел-Логистик',
      x: 14.6, y: 0, yaw: Math.PI,
      door: { x: 12.15, y: 0 },
      handle: { x: 12.15, y: 0 },
      stand: { x: 11.35, y: 0 },
    },
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
    var effectsRng = createRng((options.seed || 20261120) ^ 0x34fa29);
    var effectSeq = 0;
    var state = {
      seed: options.seed || 20261120,
      time: 0,
      shiftLength: options.shiftLength || 480,
      orders: [],
      bloodDrops: [], bloodPools: [],
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
        loaded: 0,
        unloaded: 0,
        truckShifts: 0,
        heavy: 0,
        deaths: 0,
        hires: 0,
        privacy: 0,
        play: 0,
      },
      log: [],
      trucks: [],
      truckSeq: 1,
      truckTimer: options.firstTruckDelay || 40,
      truckEvery: options.truckEvery || 120,
      // Тяжёлый груз из соседнего отдела приезжает своим челноком
      heavyTimer: options.firstHeavyDelay || 55,
      heavyEvery: options.heavyEvery || 135,
      // День на складе: раз в dayLength секунд табель пересматривается,
      // погибших заменяют новые работяги.
      day: 1,
      dayLength: options.dayLength || 90,
      deaths: [],
      hires: [],
      // Техника для тяжёлого груза: одна на склад, катается по цеху.
      forklift: {
        x: LAYOUT.heavy.forklift.x,
        y: LAYOUT.heavy.forklift.y,
        yaw: LAYOUT.heavy.forklift.yaw,
        rider: null,
        wheels: 0,
      },
      staff: { medic: null, watchman: null },
      toiletOccupant: null,
    };

    var physicsWorld = physics.create(LAYOUT, BOX_DIMS, RACK_LEVELS);
    var bloodWorld = null;

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


    // ------------------------------------------------ точки A / B / C коробки
    // A (origin) — откуда приехала, B (dest) — куда едет, C (pose) — как лежит
    // сейчас: высота, поворот, наклон, «на боку». C живёт своей жизнью, когда
    // коробку роняют: физика доводит её до полки или до пола, но не сквозь него.
    function dims(order) {
      return BOX_DIMS[order.size] || BOX_DIMS.medium;
    }

    function supportHeight(order) {
      if (order.status === 'stored') {
        for (var i = 0; i < state.slots.length; i++) {
          if (state.slots[i].id === order.slotId) return state.slots[i].h + 0.025;
        }
      }
      if (order.source === 'rack' && order.pose && !order.physics) {
        for (var j = 0; j < state.slots.length; j++) {
          var rackSlot = state.slots[j];
          if (rackSlot.id === order.slotId && Math.hypot(order.pose.x - rackSlot.x, order.pose.y - rackSlot.y) < 0.1 && order.pose.z >= rackSlot.h) return rackSlot.h + 0.025;
        }
      }
      if (!order.drops && order.truckId) return 0.09;
      if (!order.drops && order.intake != null) return 0.12;
      if (!order.drops && order.source === 'heavy') return 0.14;
      // При падении над стеллажом поддерживает ближайшая нижняя полка.
      if (order.drops && order.pose) {
        var p = order.pose;
        var top = 0;
        for (var r = 0; r < LAYOUT.racks.length; r++) {
          if (Math.abs(p.x - LAYOUT.racks[r].x) > 0.55 || Math.abs(p.y) > 5.9) continue;
          for (var l = 0; l < RACK_LEVELS.length; l++) {
            var h = RACK_LEVELS[l].height + 0.025;
            if (p.z >= h - 0.001 && h > top) top = h;
          }
        }
        return top;
      }
      return 0;
    }

    function destPoint(order) {
      if (order.direction === 'out' && order.truckId) {
        var truck = truckById(order.truckId);
        if (truck) return { x: truck.handle.x, y: truck.handle.y, z: 0.42, lying: false };
      }
      for (var i = 0; i < state.slots.length; i++) {
        if (state.slots[i].id === order.slotId) {
          return { x: state.slots[i].x, y: state.slots[i].y, z: state.slots[i].h + 0.025, lying: false };
        }
      }
      return { x: order.x, y: order.y, z: supportHeight(order), lying: false };
    }

    function decorate(order) {
      var d = dims(order);
      var z = supportHeight(order);
      order.origin = { x: order.x, y: order.y, z: z };
      order.pose = {
        x: order.x, y: order.y, z: z,
        yaw: rng.range(-0.45, 0.45), tilt: 0, roll: 0,
        lying: false, h: d.h, halfW: d.halfW, halfD: d.halfD,
      };
      order.vel = { x: 0, y: 0, vz: 0, spin: 0 };
      order.dest = destPoint(order);
      order.physics = false;
      order.grounded = true;
      return order;
    }

    // Коробка встала на место: C совпадает с B.
    function syncDest(order) {
      var d = dims(order);
      order.dest = destPoint(order);
      order.pose = {
        x: order.dest.x, y: order.dest.y, z: order.dest.z,
        yaw: order.pose ? order.pose.yaw : 0, tilt: 0, roll: 0,
        lying: false, h: d.h, halfW: d.halfW, halfD: d.halfD,
      };
      order.vel = { x: 0, y: 0, vz: 0, spin: 0 };
      order.physics = false;
      order._physicalDynamic = false;
      order.grounded = true;
      order.x = order.dest.x;
      order.y = order.dest.y;
    }

    // Рывок/толчок: коробка получает скорость и дальше живёт по физике.
    function kick(order, opts) {
      opts = opts || {};
      var d = dims(order);
      if (!order.pose) decorate(order);
      order.pose.z = Math.max(order.pose.z, 0.35);
      order.pose.lying = false;
      order.vel = {
        x: opts.vx || 0,
        y: opts.vy || 0,
        vz: opts.vz != null ? opts.vz : 0.2,
        spin: opts.spin != null ? opts.spin : rng.range(-3.4, 3.4),
      };
      order.physics = true;
      order._physicalDynamic = true;
      order._physicsGeneration = (order._physicsGeneration || 0) + 1;
      delete order.pose.quaternion;
      order.grounded = false;
      order.pose.h = d.h;
      return order;
    }

    // Жёсткие тела, контакты, трение и вращение обрабатываются Cannon.
    function stepPhysics(dt) {
      if (!Number.isFinite(dt) || dt <= 0) return 0;
      physicsWorld.syncForklift(state.forklift, dt);
      return physicsWorld.step(state.orders, dt);
    }

    // Частицы жидкости: отдельный ГПСЧ не меняет экономику/мозг.
    // Частицы ограничены по числу и времени жизни; кровь не проходит сквозь пол.
    function emitBlood(x, y, severity) {
      if (!Number.isFinite(x) || !Number.isFinite(y)) return;
      var count = Math.min(12, Math.max(2, Math.round(severity * 12)));
      var angle = effectsRng.range(0, Math.PI * 2);
      var height = effectsRng.range(0.8, 1.2);
      for (var i = 0; i < count; i++) {
        var direction = angle + effectsRng.range(-0.35, 0.35);
        var speed = effectsRng.range(0.4, 0.8) * Math.max(0.3, severity);
        state.bloodDrops.push({ id: ++effectSeq, x: x + effectsRng.range(-.05,.05), y: y + effectsRng.range(-.05,.05), z: height + effectsRng.range(-.05,.05),
          vx: Math.cos(direction) * speed, vy: Math.sin(direction) * speed, vz: effectsRng.range(0.2, 0.6), life: 3 });
      }
      if (state.bloodDrops.length > 100) state.bloodDrops.splice(0, state.bloodDrops.length - 100);
    }

    function stepBlood(dt) {
      dt = Math.min(0.1, Math.max(0, dt));
      if (state.bloodDrops.length) {
        if (!bloodWorld) bloodWorld = physics.create(LAYOUT, BOX_DIMS, RACK_LEVELS);
        bloodWorld.syncFluidObstacles(state.orders);
        bloodWorld.stepFluid(state.bloodDrops, dt, function (drop) {
          state.bloodPools.push({ id: ++effectSeq, x: drop.x, y: drop.y, z: Math.max(0, drop.z - 0.035), age: 0, size: effectsRng.range(0.4, 0.8) });
        });
      } else if (bloodWorld) {
        bloodWorld.stepFluid(state.bloodDrops, 0, function () {});
      }
      if (state.bloodPools.length > 80) state.bloodPools.splice(0, state.bloodPools.length - 80);
      for (var j = state.bloodPools.length - 1; j >= 0; j--) {
        state.bloodPools[j].age += dt;
        if (state.bloodPools[j].age > 90) state.bloodPools.splice(j, 1);
      }
    }

    // ------------------------------------------------- тяжёлый груз и техника
    function spawnHeavyBatch() {
      var made = 0;
      var count = 1 + (rng.next() < 0.35 ? 1 : 0);
      for (var i = 0; i < count; i++) {
        var slot = freeSlot(LAYOUT.heavy.pallet);
        if (!slot) break;
        var mass = Math.round(rng.range(36, 62));
        var px = LAYOUT.heavy.pallet.x + rng.range(-0.5, 0.5);
        var py = LAYOUT.heavy.pallet.y + rng.range(-0.7, 0.7);
        var order = {
          id: 'ord-' + (state.orderSeq++),
          code: 'HVY-' + String(2000 + state.orderSeq * 3).slice(-4),
          customer: rng.pick(CUSTOMERS),
          goods: rng.pick(['станок в обрешётке', 'ящик с редуктором', 'мотоблок', 'плита', 'компрессор', 'бак с маслом']),
          priority: Math.round(rng.range(0.4, 0.95) * 100) / 100,
          urgent: false,
          mass: mass,
          size: 'big',
          heavy: true,
          source: 'heavy',
          intake: null,
          x: px, y: py,
          stand: { x: LAYOUT.heavy.stand.x, y: LAYOUT.heavy.stand.y + (i - 0.5) * 0.6 },
          reachPad: 0,
          slotId: slot.id,
          rack: slot.rack,
          damage: 0,
          status: 'pending',
          carrier: null,
          createdAt: state.time,
          deadline: state.time + 210 + i * 20,
          pickedAt: null,
          storedAt: null,
          drops: 0,
        };
        slot.occupied = true;
        slot.orderId = order.id;
        decorate(order);
        state.orders.push(order);
        state.stats.heavy = (state.stats.heavy || 0) + 1;
        made += 1;
        note('Тяжёлый груз ' + order.code + ' (' + mass + ' кг) из соседнего отдела — только техникой', 'warn');
      }
      return made;
    }

    function heavyOf(order) {
      return Boolean(order && (order.heavy || order.mass > 34));
    }

    function spawnOrder() {
      var intakeIdx = freeIntake();
      var slot = freeSlot();
      if (intakeIdx < 0 || !slot || state.orders.filter(function (o) { return o.status === 'pending' || o.status === 'claimed' || o.status === 'carried'; }).length >= state.maxPending) return null;
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
      decorate(order);
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

    function drop(order, damage, x, y, opts) {
      opts = opts || {};
      order.status = 'pending';
      order.carrier = null;
      order.x = x;
      order.y = y;
      order.stand = null;
      order.reachPad = 0;
      order.damage = Math.min(1, order.damage + damage);
      order.drops += 1;
      state.stats.dropped += 1;
      // Коробка выпала из рук: у неё есть начальная скорость и высота,
      // дальше всё решает физика (см. stepPhysics).
      var d = dims(order);
      if (!order.pose) decorate(order);
      kick(order, { vx: opts.vx || 0, vy: opts.vy || 0, vz: opts.vz != null ? opts.vz : 0.35, spin: opts.spin });
      order.pose.x = x;
      order.pose.y = y;
      order.pose.z = Math.max(supportHeight(order) + d.h * 0.5, opts.z || 0.6);
      order.dest = destPoint(order);
      order.bounces = 0;
      if (order.damage >= 0.85) {
        order.status = 'ruined';
        delete order.dispatchPriority;
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
      delete order.dispatchPriority;
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
      syncDest(order);
      note('Заказ ' + order.code + ' уложен в ' + order.slotId + ' (+' + points + (late ? ', с опозданием' : '') + ')', late ? 'warn' : 'good');
      return { points: points, late: late, damage: order.damage };
    }

    // ------------------------------------------------------------ фуры
    function truckById(id) {
      for (var i = 0; i < state.trucks.length; i++) if (state.trucks[i].id === id) return state.trucks[i];
      return null;
    }

    function activeTruck(kind) {
      for (var i = state.trucks.length - 1; i >= 0; i--) {
        var t = state.trucks[i];
        if (t.status === 'working' && (!kind || t.kind === kind)) return t;
      }
      return null;
    }

    function ordersOfTruck(truck) {
      if (!truck) return [];
      return state.orders.filter(function (o) { return o.truckId === truck.id; });
    }

    function truckProgress(truck) {
      var list = ordersOfTruck(truck);
      var done = 0;
      for (var i = 0; i < list.length; i++) {
        if (list[i].status === 'stored' || list[i].status === 'loaded' || list[i].status === 'ruined' || list[i].status === 'missed') done += 1;
      }
      return { done: done, total: list.length };
    }

    function spawnTruck(kind) {
      var order = ['load', 'unload'];
      if (!kind) {
        kind = state.truckTurn || 'unload';
        state.truckTurn = kind === 'load' ? 'unload' : 'load';
      }
      if (activeTruck(kind)) return null;
      var dock = DOCKS[kind];
      var count = 3 + rng.int(0, 2);
      var truck = {
        id: 'truck-' + (state.truckSeq++),
        kind: kind,
        title: dock.title,
        plate: dock.plate,
        carrier: dock.carrier,
        x: dock.x, y: dock.y, yaw: dock.yaw,
        door: { x: dock.door.x, y: dock.door.y },
        handle: { x: dock.handle.x, y: dock.handle.y },
        stand: { x: dock.stand.x, y: dock.stand.y },
        status: 'working',
        arrivedAt: state.time,
        departedAt: null,
        total: 0,
        done: 0,
      };

      if (kind === 'unload') {
        // Из фуры выгружаем count коробок на приёмку и раскладываем по ячейкам
        for (var i = 0; i < count; i++) {
          var slot = freeSlot(dock.handle);
          if (!slot) break;
          var priority = Math.round(rng.next() * 100) / 100;
          var mass = Math.round(rng.range(6, 37));
          var ord = {
            id: 'ord-' + (state.orderSeq++),
            code: 'WMS-' + String(1000 + state.orderSeq * 7).slice(-4),
            customer: rng.pick(CUSTOMERS),
            goods: rng.pick(GOODS),
            priority: priority,
            urgent: priority > 0.78,
            mass: mass,
            size: mass > 24 ? 'big' : mass > 13 ? 'medium' : 'small',
            intake: null,
            source: 'truck',
            direction: 'in',
            truckId: truck.id,
            x: dock.handle.x,
            y: dock.handle.y + (i - (count - 1) / 2) * 0.8,
            stand: { x: dock.stand.x, y: dock.stand.y + (i - (count - 1) / 2) * 0.8 },
            reachPad: 0,
            slotId: slot.id,
            rack: slot.rack,
            damage: 0,
            status: 'pending',
            carrier: null,
            createdAt: state.time,
            deadline: state.time + 135 + i * 15,
            pickedAt: null,
            storedAt: null,
            drops: 0,
          };
          slot.occupied = true;
          slot.orderId = ord.id;
          decorate(ord);
          ord.origin = { x: dock.handle.x, y: ord.y, z: ord.pose.z };
          state.orders.push(ord);
          state.stats.unloaded += 1;
        }
        if (!truck.total) truck.total = count;
      } else {
        // На загрузку собираем то, что уже лежит на стеллажах
        var stored = state.orders.filter(function (o) { return o.status === 'stored'; });
        stored.sort(function (a, b) { return (b.priority || 0) - (a.priority || 0); });
        for (var k = 0; k < stored.length && k < count; k++) {
          var so = stored[k];
          var sl = null;
          for (var q = 0; q < state.slots.length; q++) if (state.slots[q].id === so.slotId) sl = state.slots[q];
          if (!sl) continue;
          so.status = 'pending';
          so.carrier = null;
          so.direction = 'out';
          so.source = 'rack';
          so.truckId = truck.id;
          so.x = sl.x;
          so.y = sl.y;
          so.stand = null;
          so.reachPad = 0.62;
          so.origin = { x: so.pose.x, y: so.pose.y, z: so.pose.z };
          so.dest = destPoint(so);
          so.deadline = state.time + 150 + k * 12;
          so.pickedAt = null;
          so.storedAt = null;
          // очки за погрузку начисляются в loadTruck()
        }
      }

      if (!ordersOfTruck(truck).length) {
        note('Фура ' + truck.plate + ' уехала пустой — груза не нашлось', 'warn');
        return null;
      }
      truck.total = ordersOfTruck(truck).length;
      state.trucks.push(truck);
      if (kind === 'load') ordersOfTruck(truck).forEach(function (o) { o.dest = destPoint(o); });
      if (state.trucks.length > 6) state.trucks.shift();
      note(kind === 'unload'
        ? 'Прибыла фура ' + truck.plate + ' (' + truck.carrier + '): разгрузить ' + truck.total + ' мест'
        : 'Прибыла фура ' + truck.plate + ' (' + truck.carrier + '): загрузить ' + truck.total + ' мест', 'warn');
      if (typeof state.onTruck === 'function') state.onTruck(truck);
      return truck;
    }

    // Погрузка: коробку ставят в фуру
    function loadTruck(order, workerId) {
      var truck = order.truckId ? truckById(order.truckId) : null;
      order.status = 'loaded';
      delete order.dispatchPriority;
      order.carrier = null;
      order.loadedAt = state.time;
      syncDest(order);
      releaseSlot(order);
      var late = state.time > order.deadline;
      var base = 15 + Math.round(order.priority * 12);
      var points = Math.max(1, base - Math.round(order.damage * 18) - (late ? 6 : 0));
      state.stats.score += points;
      state.stats.loaded += 1;
      state.stats.forWorker = state.stats.forWorker || {};
      state.stats.forWorker[workerId] = (state.stats.forWorker[workerId] || 0) + points;
      note('Коробка ' + order.code + ' ушла в фуру' + (truck ? ' ' + truck.plate : '') + ' (+' + points + ')', 'good');
      if (truck) {
        var prog = truckProgress(truck);
        truck.done = prog.done;
        if (prog.done >= prog.total && truck.status === 'working') {
          truck.status = 'done';
          truck.departedAt = state.time;
          state.stats.score += 10;
          state.stats.truckShifts += 1;
          note('Фура ' + truck.plate + ' загружена и уехала (+10)', 'good');
        }
      }
      return { points: points, late: late, truck: truck };
    }

    function departTruck(truck, reason) {
      if (!truck || truck.status !== 'working') return;
      truck.status = 'done';
      truck.departedAt = state.time;
      state.stats.truckShifts += 1;
      note('Фура ' + truck.plate + ' уехала: ' + (reason || 'окно закрылось'), 'warn');
    }

    // Вернуть коробку на полку (например, фура уехала без неё)
    function restock(order) {
      order.status = 'stored';
      delete order.dispatchPriority;
      order.carrier = null;
      order.truckId = null;
      order.direction = null;
      order.stand = null;
      for (var i = 0; i < state.slots.length; i++) {
        if (state.slots[i].id !== order.slotId) continue;
        state.slots[i].occupied = true;
        state.slots[i].orderId = order.id;
        order.x = state.slots[i].x;
        order.y = state.slots[i].y;
      }
      syncDest(order);
      note('Коробка ' + order.code + ' вернулась на место', 'warn');
      return order;
    }

    function step(dt) {
      state.time += dt;
      state.spawnTimer -= dt;
      if (state.spawnTimer <= 0) {
        spawnOrder();
        state.spawnTimer = state.spawnEvery * (0.72 + rng.next() * 0.6);
      }

      // --- Фуры: приезд, погрузка/разгрузка, отъезд ---
      state.truckTimer -= dt;
      if (state.truckTimer <= 0) {
        var made = spawnTruck();
        state.truckTimer = made ? state.truckEvery * (0.85 + rng.next() * 0.4) : 18;
      }
      for (var ti = 0; ti < state.trucks.length; ti++) {
        var truck = state.trucks[ti];
        if (truck.status !== 'working') continue;
        var prog = truckProgress(truck);
        truck.done = prog.done;
        truck.total = prog.total;
        if (prog.done >= prog.total && prog.total > 0) {
          departTruck(truck, 'все места обработаны');
          state.stats.score += 8;
        } else if (state.time - truck.arrivedAt > 165) {
          departTruck(truck, 'окно погрузки закрылось');
        }
      }
      // --- Тяжёлый груз из соседнего отдела ---
      state.heavyTimer -= dt;
      if (state.heavyTimer <= 0) {
        var heavyMade = spawnHeavyBatch();
        state.heavyTimer = heavyMade ? state.heavyEvery * (0.85 + rng.next() * 0.4) : 25;
      }

      // --- Новый день: табель пересматривается ---
      var day = 1 + Math.floor(state.time / state.dayLength);
      if (day !== state.day) {
        state.day = day;
        note('Новый день на складе (' + day + '-й)', 'info');
      }

      // --- Физика коробок ---
      stepPhysics(dt);
      stepBlood(dt);

      for (var i = 0; i < state.orders.length; i++) {
        var o = state.orders[i];
        if (o.status === 'missed' || o.status === 'stored' || o.status === 'ruined' || o.status === 'loaded') continue;
        if (state.time > o.deadline + 35) {
          o.status = 'missed';
          delete o.dispatchPriority;
          o.carrier = null;
          if (o.direction !== 'out') releaseSlot(o);
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
        if (o.dispatchPriority === true) s += 3.5;
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
            heavy: Boolean(o.heavy), source: o.source || null, direction: o.direction || null,
            origin: o.origin ? { x: Math.round(o.origin.x * 100) / 100, y: Math.round(o.origin.y * 100) / 100 } : null,
            dest: o.dest ? { x: Math.round(o.dest.x * 100) / 100, y: Math.round(o.dest.y * 100) / 100, z: Math.round(o.dest.z * 100) / 100 } : null,
            pose: o.pose ? {
              x: Math.round(o.pose.x * 100) / 100, y: Math.round(o.pose.y * 100) / 100, z: Math.round(o.pose.z * 100) / 100,
              yaw: Math.round(o.pose.yaw * 1000) / 1000, tilt: Math.round(o.pose.tilt * 1000) / 1000,
              lying: Boolean(o.pose.lying),
            } : null,
          };
        }),
        trucks: state.trucks.map(function (t) {
          var prog = truckProgress(t);
          return {
            id: t.id, kind: t.kind, title: t.title, plate: t.plate, carrier: t.carrier,
            x: t.x, y: t.y, yaw: t.yaw, status: t.status,
            done: prog.done, total: prog.total,
            arrivedAt: Math.round(t.arrivedAt * 10) / 10,
            departedAt: t.departedAt == null ? null : Math.round(t.departedAt * 10) / 10,
          };
        }),
        slots: state.slots.map(function (s) {
          return { id: s.id, x: s.x, y: s.y, h: s.h, occupied: s.occupied, orderId: s.orderId, levelLabel: s.levelLabel };
        }),
        day: state.day,
        dayLength: state.dayLength,
        deaths: state.deaths.slice(-6),
        hires: state.hires.slice(-6),
        forklift: { x: state.forklift.x, y: state.forklift.y, yaw: state.forklift.yaw, rider: state.forklift.rider },
        staff: {
          medic: state.staff.medic ? { hired: true, at: state.staff.medic.hiredAt } : null,
          watchman: state.staff.watchman ? { hired: true, at: state.staff.watchman.hiredAt } : null,
        },
      };
    }

    // Снимок содержит только данные; Cannon-тела пересоздаются через мост физики.
    function captureCheckpoint() {
      return { state: state, rng: rng.getState(), effectsRng: effectsRng.getState(),
        effectSeq: effectSeq, physics: physicsWorld.capture() };
    }
    function restoreCheckpoint(saved, actors) {
      if (!saved || !saved.state || !Array.isArray(saved.state.orders) || !Array.isArray(saved.state.slots) ||
          !Array.isArray(saved.state.trucks) || !saved.state.stats || !Number.isFinite(saved.state.time)) throw new Error('Повреждено состояние склада');
      if (saved.state.orders.length > 2000 || saved.state.slots.length !== RACK_SLOTS.length || saved.state.trucks.length > 500) throw new Error('Недопустимый размер сохранения');
      Object.keys(state).forEach(function (key) {
        if (!Object.prototype.hasOwnProperty.call(saved.state, key)) throw new Error('Отсутствуют данные склада: ' + key);
        state[key] = saved.state[key];
      });
      rng.setState(saved.rng); effectsRng.setState(saved.effectsRng);
      if (!Number.isInteger(saved.effectSeq) || saved.effectSeq < 0) throw new Error('Повреждены частицы');
      effectSeq = saved.effectSeq;
      physicsWorld.restore(saved.physics, state.orders, actors || []);
    }
    return {
      state: state,
      layout: LAYOUT,
      illuminationAt: illuminationAt,
      captureCheckpoint: captureCheckpoint,
      restoreCheckpoint: restoreCheckpoint,
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
      spawnTruck: spawnTruck,
      loadTruck: loadTruck,
      restock: restock,
      departTruck: departTruck,
      activeTruck: activeTruck,
      truckById: truckById,
      truckProgress: truckProgress,
      ordersOfTruck: ordersOfTruck,
      dims: dims,
      destPoint: destPoint,
      supportHeight: supportHeight,
      syncDest: syncDest,
      kick: kick,
      stepPhysics: stepPhysics,
      syncActors: physicsWorld.syncActors,
      beginRagdoll: physicsWorld.beginRagdoll,
      endRagdoll: physicsWorld.endRagdoll,
      emitBlood: emitBlood,
      stepBlood: stepBlood,
      spawnHeavyBatch: spawnHeavyBatch,
      heavyOf: heavyOf,
    };
  }

  return {
    createRng: createRng,
    illuminationAt: illuminationAt,
    createWarehouse: createWarehouse,
    LAYOUT: LAYOUT,
    DOCKS: DOCKS,
    RACK_SLOTS: RACK_SLOTS,
    RACK_LEVELS: RACK_LEVELS,
    CUSTOMERS: CUSTOMERS,
    GOODS: GOODS,
  };
});
