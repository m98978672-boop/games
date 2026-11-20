// Физиология и механика работы склада — ЕДИНЫЙ источник правды.
// Этот же файл используют игра (src/character/body.js вызывает модель) и
// скрипт обучения нейросети (training/train-brain.mjs), поэтому обученная
// политика проверялась ровно на тех уравнениях, которые крутятся в игре.
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.WarehouseModel = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function clamp(v, lo, hi) {
    return v < lo ? lo : v > hi ? hi : v;
  }
  function clamp01(v) {
    return clamp(v, 0, 1);
  }
  function lerp(a, b, t) {
    return a + (b - a) * t;
  }
  // Экспоненциальное сближение, независимое от шага: скорость реакции rate (1/с)
  function approach(current, target, rate, dt) {
    var k = 1 - Math.exp(-rate * dt);
    return current + (target - current) * k;
  }

  var MUSCLE_GROUPS = [
    { id: 'legs', name: 'Ноги', share: 0.34 },
    { id: 'back', name: 'Спина', share: 0.26 },
    { id: 'arms', name: 'Руки', share: 0.22 },
    { id: 'shoulders', name: 'Плечи', share: 0.18 },
  ];

  var TRAITS = [
    { id: 'endurance', label: 'Выносливость', hint: 'аэробная ёмкость, меньше лактата' },
    { id: 'strength', label: 'Сила', hint: 'предельная масса коробки' },
    { id: 'precision', label: 'Точность', hint: 'хват, аккуратная укладка' },
    { id: 'caution', label: 'Осторожность', hint: 'страх травмы и порчи груза' },
    { id: 'paceTrait', label: 'Темп', hint: 'природная скорость' },
    { id: 'neuroticism', label: 'Нейротизм', hint: 'реакция на стресс' },
    { id: 'recovery', label: 'Восстановление', hint: 'скорость отдыха' },
    { id: 'coop', label: 'Командность', hint: 'готовность помочь' },
  ];

  var DEFAULT_TRAITS = {
    endurance: 0.6,
    strength: 0.62,
    precision: 0.6,
    caution: 0.55,
    paceTrait: 0.6,
    neuroticism: 0.4,
    recovery: 0.55,
    coop: 0.6,
  };

  function normalizeTraits(input) {
    var out = {};
    for (var i = 0; i < TRAITS.length; i++) {
      var id = TRAITS[i].id;
      out[id] = clamp(typeof input[id] === 'number' ? input[id] : DEFAULT_TRAITS[id], 0, 1);
    }
    return out;
  }

  // ------------------------------------------------------------------ тело
  function createBody(traitsInput, overrides) {
    overrides = overrides || {};
    var traits = normalizeTraits(traitsInput || {});
    var muscles = {};
    for (var i = 0; i < MUSCLE_GROUPS.length; i++) {
      muscles[MUSCLE_GROUPS[i].id] = {
        group: MUSCLE_GROUPS[i].id,
        load: 0,
        lactate: 0.08,
        condition: 1,
        microDamage: 0,
      };
    }
    var body = {
      traits: traits,
      age: overrides.age || 27,
      massKg: overrides.massKg || 74,
      energy: 0.82,          // глюкоза крови + гликоген (0..1)
      glycogen: 0.78,
      hydration: 0.84,
      hunger: 0.22,
      thirst: 0.18,
      oxygen: 0.98,
      co2: 0.04,
      heartRate: 68,
      restingHeartRate: overrides.restingHeartRate || 62,
      breathing: 14,
      lungCapacity: 0.7 + 0.3 * traits.endurance,
      coreTemp: 36.7,
      sweat: 0.1,
      lactate: 0.08,
      fatigue: 0.12,
      sleepDebt: overrides.sleepDebt || 0.2,
      stress: 0.18,
      pain: 0.02,
      injury: 0,
      vision: 1,
      hearing: 1,
      cognition: 1,
      dopamine: 0.55,
      serotonin: 0.55,
      cortisol: 0.3,
      adrenaline: 0.12,
      oxytocin: 0.5,
      insulin: 0.5,
      kidneyLoad: 0.2,
      digestion: 0.3,
      muscles: muscles,
      unitsDelivered: 0,
      unitsDropped: 0,
      restSeconds: 0,
      workSeconds: 0,
      collapsed: false,
      events: [],
    };
    if (overrides.energy != null) body.energy = clamp01(overrides.energy);
    if (overrides.fatigue != null) body.fatigue = clamp01(overrides.fatigue);
    if (overrides.stress != null) body.stress = clamp01(overrides.stress);
    return body;
  }

  function pushEvent(body, text, tone) {
    body.events.push({ t: body.workSeconds + body.restSeconds, text: text, tone: tone || 'info' });
    if (body.events.length > 40) body.events.shift();
  }

  // Предельная масса, которую рабочий уверенно несёт (кг)
  function carryCapacity(body) {
    var t = body.traits;
    var base = 18 + 42 * t.strength;
    return base * (0.72 + 0.28 * (1 - body.fatigue)) * (0.85 + 0.15 * body.energy);
  }

  // Интенсивность 0..1+ по метаболизму: скорость, груз, наклон
  function intensityOf(body, activity, loadKg) {
    var t = body.traits;
    var speedPart = clamp(activity.speed || 0, 0, 1) * (activity.carrying ? 0.55 : 0.35);
    var loadPart = clamp((loadKg || 0) / Math.max(1, carryCapacity(body)), 0, 1.35) * 0.7;
    var liftPart = (activity.lifting ? 0.22 : 0) + (activity.lower ? 0.14 : 0);
    var awkward = clamp((activity.awkward || 0), 0, 1) * 0.12;
    var raw = 0.16 + speedPart + loadPart + liftPart + awkward;
    return raw * (1.08 - 0.18 * t.endurance);
  }

  function stepBody(body, dt, ctx) {
    if (!(dt > 0)) return body;
    ctx = ctx || {};
    var t = body.traits;
    var intensity = clamp(ctx.intensity || 0, 0, 2.2);
    var resting = Boolean(ctx.resting);
    var noise = clamp(ctx.noise != null ? ctx.noise : 0.15, 0, 1);
    var ambient = ctx.ambient != null ? ctx.ambient : 18;

    if (resting) body.restSeconds += dt; else body.workSeconds += dt;

    // --- Мышцы: локальная нагрузка по группам, лактат, микроповреждения ---
    for (var i = 0; i < MUSCLE_GROUPS.length; i++) {
      var g = MUSCLE_GROUPS[i];
      var m = body.muscles[g.id];
      var groupLoad = intensity * g.share * (ctx.carrying && (g.id === 'back' || g.id === 'arms') ? 1.55 : 1);
      m.load = approach(m.load, resting ? 0.05 : clamp(groupLoad, 0, 1), resting ? 1.2 : 2.4, dt);
      var clearance = (0.22 + 0.5 * t.endurance + 0.55 * t.recovery) * (resting ? 2.6 : 1);
      var production = m.load * (0.9 - 0.45 * t.endurance) * 0.42;
      m.lactate = clamp01(m.lactate + (production - clearance * m.lactate) * dt);
      m.microDamage = clamp01(m.microDamage + (m.load > 0.75 ? (m.load - 0.75) * 0.05 * dt : -0.012 * dt));
      m.condition = clamp01(1 - m.microDamage * 0.6 - m.lactate * 0.25);
    }

    // --- Лактат/усталость тела ---
    var avgLactate = 0;
    for (var k = 0; k < MUSCLE_GROUPS.length; k++) avgLactate += body.muscles[MUSCLE_GROUPS[k].id].lactate;
    avgLactate /= MUSCLE_GROUPS.length;
    body.lactate = approach(body.lactate, avgLactate, 3, dt);

    // --- Энергия: гликоген + глюкоза, липолиз на длинной дистанции ---
    var burn = (0.00011 + 0.0012 * intensity) * (resting ? 0.55 : 1);
    body.glycogen = clamp01(body.glycogen - burn * dt * 1.6);
    body.energy = clamp01(body.energy - burn * dt * (body.glycogen > 0.15 ? 0.9 : 1.7));
    if (ctx.eating) {
      body.energy = clamp01(body.energy + 0.02 * dt);
      body.glycogen = clamp01(body.glycogen + 0.012 * dt);
      body.hunger = clamp01(body.hunger - 0.02 * dt);
    }
    body.hunger = clamp01(body.hunger + 0.00012 * dt * (1 + intensity));
    if (resting) {
      body.energy = clamp01(body.energy + 0.0045 * t.recovery * dt * (body.hunger < 0.85 ? 1 : 0.25));
      body.glycogen = clamp01(body.glycogen + 0.0025 * t.recovery * dt);
    }

    // --- Сердце и лёгкие ---
    var targetHr = body.restingHeartRate + 62 * intensity + 18 * body.stress + 10 * body.cortisol - 14 * t.endurance;
    body.heartRate = approach(body.heartRate, clamp(targetHr, 48, 196), resting ? 0.5 : 1.4, dt);
    var demand = clamp(intensity / Math.max(0.25, body.lungCapacity), 0, 1.6);
    body.breathing = approach(body.breathing, 12 + 26 * demand + 6 * body.stress, 0.9, dt);
    var targetOxygen = clamp(1 - 0.34 * Math.max(0, demand - 0.85) - 0.2 * body.pain - 0.1 * body.injury, 0.55, 1);
    body.oxygen = approach(body.oxygen, targetOxygen, 0.8, dt);
    body.co2 = approach(body.co2, clamp(0.035 + 0.09 * demand, 0, 0.2), 0.7, dt);

    // --- Вода, почки, пищеварение ---
    body.thirst = clamp01(body.thirst + (0.00022 + 0.0009 * intensity) * dt * (ambient > 24 ? 1.5 : 1));
    body.hydration = clamp01(body.hydration - Math.max(0, body.thirst - 0.35) * 0.0012 * dt);
    body.kidneyLoad = clamp01(approach(body.kidneyLoad, 0.15 + 0.9 * body.thirst, 0.6, dt));
    body.digestion = approach(body.digestion, body.hunger > 0.65 ? 0.85 : 0.3, 0.15, dt);
    body.insulin = approach(body.insulin, 0.35 + 0.3 * (body.energy > 0.75 ? 1 : 0) - 0.1 * body.adrenaline, 0.5, dt);

    // --- Терморегуляция ---
    var heat = ambient + 5.5 * intensity - 0.9 * body.sweat;
    body.coreTemp = approach(body.coreTemp, clamp(heat, 35.2, 39.6), 0.35, dt);
    body.sweat = approach(body.sweat, clamp01(intensity * 0.9 + (body.coreTemp - 37) * 0.5), 0.6, dt);

    // --- Гормоны ---
    var stressor = 0.35 * intensity + 0.6 * body.pain + 0.55 * body.fatigue + (ctx.urgency || 0) * 0.4;
    var cortisolTarget = clamp01(0.18 + 0.55 * stressor * (0.6 + 0.8 * t.neuroticism));
    body.cortisol = approach(body.cortisol, cortisolTarget, 0.12, dt);
    var adrenalineTarget = clamp01(0.06 + 0.7 * Math.max(0, stressor - 0.55) + (ctx.urgency || 0) * 0.3);
    body.adrenaline = approach(body.adrenaline, adrenalineTarget, 0.5, dt);
    body.stress = clamp01(approach(body.stress, clamp01(0.25 * body.cortisol + 0.35 * (body.heartRate - 65) / 120 + 0.3 * body.fatigue), 0.25, dt));
    var dopamineTarget = clamp01(0.42 + 0.3 * (ctx.reward || 0));
    body.dopamine = approach(body.dopamine, dopamineTarget, 0.35, dt);
    body.serotonin = approach(body.serotonin, clamp01(0.5 + 0.25 * (1 - body.stress) - 0.2 * body.sleepDebt), 0.08, dt);
    body.oxytocin = approach(body.oxytocin, clamp01(0.35 + 0.5 * t.coop * (ctx.teamSupport || 0.5)), 0.2, dt);

    // --- Усталость и боль ---
    var fatigueTarget = clamp01(0.18 * body.lactate + 0.42 * (1 - body.energy) + 0.18 * body.sleepDebt + 0.16 * (1 - body.oxygen) + 0.18 * (body.coreTemp - 37.2 > 0 ? (body.coreTemp - 37.2) * 0.6 : 0));
    body.fatigue = approach(body.fatigue, fatigueTarget, resting ? 0.22 + 0.25 * t.recovery : 0.35, dt);
    body.pain = clamp01(body.pain * Math.exp(-0.06 * dt));
    body.injury = clamp01(body.injury * Math.exp(-0.01 * dt));
    body.sleepDebt = clamp01(body.sleepDebt + 0.00002 * dt);

    // --- Органы чувств и когниция ---
    var visionTarget = clamp01(1 - 0.35 * body.fatigue - 0.3 * Math.max(0, 0.85 - body.oxygen) - 0.2 * body.pain);
    body.vision = approach(body.vision, visionTarget, 0.7, dt);
    var hearingTarget = clamp01(1 - 0.45 * noise - 0.15 * body.fatigue);
    body.hearing = approach(body.hearing, hearingTarget, 0.8, dt);
    var cognitionTarget = clamp01(1 - 0.4 * body.stress - 0.3 * body.fatigue - 0.25 * Math.max(0, 0.8 - body.energy) - 0.3 * Math.max(0, body.coreTemp - 38));
    body.cognition = approach(body.cognition, cognitionTarget, 0.5, dt);

    // --- Отказ: обморок при истощении ---
    if (!body.collapsed && body.energy < 0.035 && intensity > 0.35) {
      body.collapsed = true;
      pushEvent(body, 'Обморок: истощение гликогена', 'bad');
    }
    if (body.collapsed) {
      body.energy = clamp01(body.energy + 0.004 * dt);
      if (body.energy > 0.28) {
        body.collapsed = false;
        pushEvent(body, 'Пришёл в себя после обморока', 'warn');
      }
    }
    return body;
  }

  // ------------------------------------------------------------------ работа
  var WORK = {
    pickBase: 1.05,
    placeBase: 0.95,
    liftBase: 0.55,
  };

  function speedFactor(body, decision) {
    var t = body.traits;
    var pace = decision ? decision.pace : 0.5;
    var caution = decision ? decision.caution : 0.5;
    var health = clamp(1 - 0.35 * body.fatigue - 0.25 * body.pain - 0.2 * body.injury, 0.3, 1);
    var drive = 0.6 + 0.75 * pace * (0.7 + 0.4 * t.paceTrait);
    return clamp(health * drive * (1 - 0.18 * caution), 0.25, 1.55);
  }

  function pickTime(body, decision) {
    var precision = decision ? decision.precision : 0.5;
    var t = body.traits;
    return WORK.pickBase * (1.5 - 0.55 * precision - 0.3 * t.precision) / clamp(0.55 + 0.6 * body.cognition, 0.4, 1.3);
  }

  function placeTime(body, decision) {
    var precision = decision ? decision.precision : 0.5;
    var t = body.traits;
    return WORK.placeBase * (1.4 - 0.5 * precision - 0.25 * t.precision) / clamp(0.55 + 0.6 * body.cognition, 0.4, 1.3);
  }

  // Риск уронить груз за секунду переноски
  function dropRisk(body, decision, loadKg) {
    var pace = decision ? decision.pace : 0.5;
    var caution = decision ? decision.caution : 0.5;
    var precision = decision ? decision.precision : 0.5;
    var t = body.traits;
    var base = 0.0075;
    var speedTerm = 0.25 + 2.6 * pace * pace;
    var grip = clamp(1 - caution, 0, 1) * (1.25 - 0.55 * precision) * (1.2 - 0.4 * t.precision);
    var loadTerm = 0.45 + 1.35 * clamp(loadKg / Math.max(1, carryCapacity(body)), 0, 1.4);
    var stateTerm = 1 + 0.7 * body.stress + 0.6 * body.fatigue + 0.8 * body.pain + 0.5 * (1 - body.vision);
    return base * speedTerm * grip * loadTerm * stateTerm / clamp(0.6 + 0.8 * t.caution, 0.4, 1.6);
  }

  function deliverReward(body, value) {
    body.unitsDelivered += 1;
    body.dopamine = clamp01(body.dopamine + 0.18 * (value || 1));
    body.serotonin = clamp01(body.serotonin + 0.05);
    body.stress = clamp01(body.stress - 0.08);
    pushEvent(body, 'Заказ закрыт', 'good');
  }

  function dropPenalty(body, damage) {
    body.unitsDropped += 1;
    body.stress = clamp01(body.stress + 0.22);
    body.dopamine = clamp01(body.dopamine - 0.15);
    body.pain = clamp01(body.pain + 0.18 * (0.4 + (damage || 0.5)));
    body.injury = clamp01(body.injury + 0.12 * (damage || 0.5));
    body.muscles.back.microDamage = clamp01(body.muscles.back.microDamage + 0.12);
    pushEvent(body, damage > 0.45 ? 'Коробка упала и разбилась' : 'Коробка упала, помялась', 'bad');
  }

  // ------------------------------------------------------------------ признаки
  var FEATURE_ORDER = [
    'bias', 'energy', 'stress', 'fatigue', 'pain', 'load', 'capacity', 'distance', 'urgency',
    'queue', 'neuroticism', 'paceTrait', 'precisionTrait', 'enduranceTrait', 'cautionTrait',
    'shift', 'teamBusy', 'waiting',
  ];

  function featuresOf(body, ctx) {
    ctx = ctx || {};
    var t = body.traits;
    var load = ctx.loadKg || 0;
    return [
      1,
      body.energy,
      body.stress,
      body.fatigue,
      body.pain,
      clamp(load / 45, 0, 1),
      clamp(load / Math.max(1, carryCapacity(body)), 0, 1.35) / 1.35,
      clamp(ctx.distanceNorm || 0, 0, 1),
      clamp(ctx.urgency || 0, 0, 1),
      clamp(ctx.queue || 0, 0, 1),
      t.neuroticism,
      t.paceTrait,
      t.precision,
      t.endurance,
      t.caution,
      clamp(ctx.shift || 0, 0, 1),
      clamp(ctx.teamBusy != null ? ctx.teamBusy : 0.5, 0, 1),
      clamp(ctx.waiting || 0, 0, 1),
    ];
  }

  // Комплексные показатели для HUD/инспектора
  function vitals(body) {
    var muscleAvg = 0;
    for (var i = 0; i < MUSCLE_GROUPS.length; i++) muscleAvg += body.muscles[MUSCLE_GROUPS[i].id].condition;
    muscleAvg /= MUSCLE_GROUPS.length;
    return {
      condition: clamp01(0.45 * body.energy + 0.25 * (1 - body.fatigue) + 0.15 * body.oxygen + 0.15 * muscleAvg),
      readiness: clamp01(0.5 * body.energy + 0.3 * (1 - body.fatigue) + 0.2 * body.cognition),
      hazard: clamp01(0.4 * body.pain + 0.3 * body.stress + 0.3 * (1 - body.cognition)),
      muscleCondition: muscleAvg,
    };
  }

  return {
    TRAITS: TRAITS,
    MUSCLE_GROUPS: MUSCLE_GROUPS,
    DEFAULT_TRAITS: DEFAULT_TRAITS,
    FEATURE_ORDER: FEATURE_ORDER,
    normalizeTraits: normalizeTraits,
    createBody: createBody,
    stepBody: stepBody,
    intensityOf: intensityOf,
    carryCapacity: carryCapacity,
    speedFactor: speedFactor,
    pickTime: pickTime,
    placeTime: placeTime,
    dropRisk: dropRisk,
    deliverReward: deliverReward,
    dropPenalty: dropPenalty,
    featuresOf: featuresOf,
    vitals: vitals,
    clamp: clamp,
    clamp01: clamp01,
    lerp: lerp,
    approach: approach,
  };
});
