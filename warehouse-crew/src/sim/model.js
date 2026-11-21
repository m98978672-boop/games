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

  // Части тела, по которым считаются травмы
  var BODY_PARTS = {
    back: 'спина',
    shoulder: 'плечо',
    knee: 'колено',
    wrist: 'кисть',
    ankle: 'стопа',
    head: 'голова',
  };

  var INJURY_TYPES = {
    muscle: { label: 'мышца', healRate: 0.012, speed: 0.22, capacity: 0.35, craft: 0.15 },
    limb: { label: 'сустав', healRate: 0.008, speed: 0.34, capacity: 0.18, craft: 0.3 },
    brain: { label: 'голова', healRate: 0.004, speed: 0.1, capacity: 0.0, craft: 0.35 },
  };

  // Техника безопасности склада. Рабочий старается не нарушать эти правила:
  // нарушение — не «штраф в никуда», а реальный риск травмы.
  var RULES = [
    {
      id: 'r-lift', title: 'Тяжесть — вдвоём',
      text: 'Коробку тяжелее 85 % предела не поднимают в одиночку: нужен напарник или тележка.',
      type: 'muscle', part: 'back',
    },
    {
      id: 'r-run', title: 'С грузом — шагом',
      text: 'С коробкой в руках не бегут: споткнулся — порвал связку или уронил груз.',
      type: 'limb', part: 'knee',
    },
    {
      id: 'r-twist', title: 'Не разворачиваться резко',
      text: 'С грузом нельзя резко крутиться на месте: поясница не любит скручивание под нагрузкой.',
      type: 'muscle', part: 'back',
    },
    {
      id: 'r-rest', title: 'Устал — передохни',
      text: 'На износе выше 80 % мышцы не держат: перерыв дешевле, чем растяжение.',
      type: 'muscle', part: 'shoulder',
    },
    {
      id: 'r-grip', title: 'Хват на вытянутых руках',
      text: 'Тяжёлую коробку берут корпусом, а не кистями на вытянутых руках.',
      type: 'limb', part: 'wrist',
    },
    {
      id: 'r-head', title: 'Береги голову',
      text: 'Уронил коробку на себя или упал в обморок — ушиб головы и туман в решениях.',
      type: 'brain', part: 'head',
    },
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
        strain: 0,      // 0..1 — насколько мышца «натянута» сейчас (для анимации)
        pump: 0.5,      // 0..1 — кровенаполнение, растёт от работы
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
      // Нижняя часть живота и настроение: рабочий человек — не робот.
      bladder: 0.18 + (overrides.bladder != null ? overrides.bladder : 0.22),
      fun: overrides.fun != null ? overrides.fun : 0.42,
      social: 0.5,
      // Жизненный ресурс: несколько тяжёлых травм без помощи — и человека
      // не спасти. Медик поднимает vitality и залечивает повреждения.
      vitality: 1,
      blood: 1,
      gender: overrides.gender === 'ж' ? 'ж' : 'м',
      deceased: false,
      unitsDelivered: 0,
      unitsDropped: 0,
      restSeconds: 0,
      workSeconds: 0,
      collapsed: false,
      injuries: [],           // [{ type, part, severity, at, cause }]
      mobility: 1,            // 0..1 — сколько осталось от подвижности
      ruleViolations: {},     // id правила -> сколько раз нарушено (для «пытается соблюдать»)
      ruleStrikes: 0,
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
    var damage = 1 - 0.42 * injuryOf(body, 'back') - 0.22 * injuryOf(body, 'shoulder');
    return base * (0.72 + 0.28 * (1 - body.fatigue)) * (0.85 + 0.15 * body.energy) * clamp(damage, 0.35, 1);
  }

  // Безопасный вес по технике безопасности: 85 % предела, минус травмы
  function safeLift(body) {
    return carryCapacity(body) * 0.85;
  }

  // ------------------------------------------------------------------ травмы
  function injuryOf(body, part) {
    if (!body.injuries || !body.injuries.length) return 0;
    var total = 0;
    for (var i = 0; i < body.injuries.length; i++) {
      if (body.injuries[i].part === part) total += body.injuries[i].severity;
    }
    return clamp01(total);
  }

  function injuryLevel(body) {
    if (!body.injuries || !body.injuries.length) return 0;
    var total = 0;
    for (var i = 0; i < body.injuries.length; i++) total += body.injuries[i].severity;
    return clamp01(total / 1.6);
  }

  function worstInjury(body) {
    if (!body.injuries || !body.injuries.length) return null;
    var worst = body.injuries[0];
    for (var i = 1; i < body.injuries.length; i++) {
      if (body.injuries[i].severity > worst.severity) worst = body.injuries[i];
    }
    return worst;
  }

  // Нанести травму. Одинаковые травмы одной части тела складываются, но не в бесконечность.
  function addInjury(body, injury) {
    injury = injury || {};
    var type = INJURY_TYPES[injury.type] ? injury.type : 'muscle';
    var part = BODY_PARTS[injury.part] ? injury.part : 'back';
    var severity = clamp(injury.severity == null ? 0.3 : injury.severity, 0.05, 1);
    var existing = null;
    for (var i = 0; i < body.injuries.length; i++) {
      if (body.injuries[i].part === part && body.injuries[i].type === type) existing = body.injuries[i];
    }
    if (existing) {
      existing.severity = clamp(existing.severity + severity * 0.85, 0, 1);
      existing.at = body.workSeconds + body.restSeconds;
      existing.cause = injury.cause || existing.cause;
      existing.count = (existing.count || 1) + 1;
    } else {
      body.injuries.push({
        type: type,
        part: part,
        severity: severity,
        at: body.workSeconds + body.restSeconds,
        cause: injury.cause || 'неудачное движение',
        count: 1,
      });
    }
    body.pain = clamp01(body.pain + 0.22 + 0.3 * severity);
    body.stress = clamp01(body.stress + 0.1 + 0.18 * severity);
    if (type === 'brain') {
      body.cognition = clamp01(body.cognition - 0.35 * severity);
      body.vision = clamp01(body.vision - 0.12 * severity);
    }
    var label = 'Травма: ' + BODY_PARTS[part] + ' (' + INJURY_TYPES[type].label + '), ' +
      Math.round(severity * 100) + '% — ' + (injury.cause || 'неудачное движение');
    pushEvent(body, label, 'bad');
    return { type: type, part: part, severity: severity, text: label };
  }

  function healInjuries(body, dt, resting, boost) {
    if (!body.injuries.length) return 0;
    var healed = 0;
    var boostK = boost == null ? 1 : boost;
    for (var i = body.injuries.length - 1; i >= 0; i--) {
      var injury = body.injuries[i];
      var preset = INJURY_TYPES[injury.type] || INJURY_TYPES.muscle;
      var rate = preset.healRate * (resting ? 2.6 : 1) * (0.6 + 0.9 * body.traits.recovery) * boostK;
      injury.severity = Math.max(0, injury.severity - rate * dt);
      if (injury.severity <= 0.02) {
        body.injuries.splice(i, 1);
        healed += 1;
      }
    }
    return healed;
  }

  // Сколько подвижности осталось: колено/стопа бьют по скорости, спина — по грузу
  function mobilityOf(body) {
    var knee = injuryOf(body, 'knee') + injuryOf(body, 'ankle');
    var back = injuryOf(body, 'back');
    var head = injuryOf(body, 'head');
    return clamp(1 - 0.38 * knee - 0.18 * back - 0.12 * head, 0.35, 1);
  }

  // Правило нарушено? Возвращает описание нарушения или null.
  // action: { mass, pace, turnRate, lifting, carrying, fatigue }
  function ruleBreach(body, action) {
    action = action || {};
    var safe = safeLift(body);
    var mass = action.mass || 0;
    if (mass > safe) {
      return {
        rule: 'r-lift', part: 'back', type: 'muscle',
        severity: 0.16 + 0.3 * clamp((mass - safe) / Math.max(6, safe), 0, 1.5),
        risk: 0.008 + 0.02 * clamp((mass - safe) / Math.max(6, safe), 0, 1.5),
        cause: 'поднял ' + Math.round(mass) + ' кг при пределе ' + Math.round(safe) + ' кг',
      };
    }
    if (action.carrying && (action.pace || 0) > 0.72) {
      var runOver = clamp(((action.pace || 0) - 0.72) / 0.28, 0, 1);
      return {
        rule: 'r-run', part: 'knee', type: 'limb',
        severity: 0.12 + 0.22 * runOver,
        risk: 0.004 + 0.013 * runOver,
        cause: 'побежал с коробкой в руках',
      };
    }
    if (action.carrying && (action.turnRate || 0) > 2.2) {
      return {
        rule: 'r-twist', part: 'back', type: 'muscle',
        severity: 0.12 + 0.2 * clamp(((action.turnRate || 0) - 2.2) / 2, 0, 1),
        risk: 0.005 + 0.015 * clamp(((action.turnRate || 0) - 2.2) / 2, 0, 1),
        cause: 'резко развернулся с грузом',
      };
    }
    if (!action.carrying && !action.lifting && body.fatigue > 0.8 && (action.working !== false)) {
      return {
        rule: 'r-rest', part: 'shoulder', type: 'muscle',
        severity: 0.1 + 0.2 * clamp((body.fatigue - 0.8) / 0.2, 0, 1),
        risk: 0.004 + 0.012 * clamp((body.fatigue - 0.8) / 0.2, 0, 1),
        cause: 'работает на износе ' + Math.round(body.fatigue * 100) + '%',
      };
    }
    if (action.lifting && mass > safe * 0.75 && (action.precision || 0.5) < 0.4) {
      return {
        rule: 'r-grip', part: 'wrist', type: 'limb',
        severity: 0.1,
        risk: 0.004,
        cause: 'взял тяжёлое кистями на вытянутых руках',
      };
    }
    return null;
  }

  function noteViolation(body, breach) {
    if (!breach) return;
    body.ruleViolations[breach.rule] = (body.ruleViolations[breach.rule] || 0) + 1;
    body.ruleStrikes = (body.ruleStrikes || 0) + 1;
  }

  function ruleCompliance(body) {
    var strikes = body.ruleStrikes || 0;
    return clamp01(1 / (1 + strikes * 0.12));
  }

  function ruleById(id) {
    for (var i = 0; i < RULES.length; i++) if (RULES[i].id === id) return RULES[i];
    return null;
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
      // Натяжение и «пампинг» — по ним анимируются пучки мышц на теле
      m.strain = clamp01(m.load * (0.55 + 0.45 * m.lactate) * (1 + 0.35 * (ctx.carrying ? 1 : 0)));
      m.pump = clamp01(approach(m.pump, 0.35 + 0.65 * m.load, 1.4, dt));
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

    // --- Мочевой пузырь: чем больше пьёшь и работаешь, тем чаще надо ---
    if (ctx.toilet) {
      body.bladder = clamp01(body.bladder - 0.16 * dt);
    } else {
      body.bladder = clamp01(body.bladder + (0.0016 + 0.0026 * intensity) * dt * (1 + body.thirst));
    }

    // --- Настроение: рутина сушит, техника и разговоры — веселят ---
    if (ctx.fun) body.fun = clamp01(body.fun + 0.02 * ctx.fun * dt);
    else body.fun = clamp01(body.fun - (0.00035 + 0.0004 * intensity) * dt);
    body.social = clamp01(body.social - 0.0006 * dt + (ctx.teamSupport || 0) * 0.0005 * dt);

    // --- Витальность: тяжёлые травмы и кровопотеря съедают ресурс ---
    var injuryTotal = 0;
    for (var ii = 0; ii < body.injuries.length; ii++) injuryTotal += body.injuries[ii].severity;
    if (injuryTotal > 0.9) {
      body.blood = clamp01(body.blood - (injuryTotal - 0.9) * 0.004 * dt);
      body.vitality = clamp01(body.vitality - (injuryTotal - 0.9) * 0.0032 * dt);
    } else if (resting) {
      body.vitality = clamp01(body.vitality + 0.0035 * dt * (injuryTotal < 0.4 ? 1 : 0.4));
      body.blood = clamp01(body.blood + 0.002 * dt);
    }
    if (ctx.medical) {
      body.vitality = clamp01(body.vitality + 0.02 * dt);
      body.blood = clamp01(body.blood + 0.012 * dt);
    }
    if (body.vitality <= 0.001 && !body.deceased) {
      body.deceased = true;
      pushEvent(body, 'Организм не выдержал нагрузок', 'bad');
    }

    // --- Травмы: боль держится, заживление идёт медленно, в покое быстрее ---
    healInjuries(body, dt, resting, ctx.medical ? 3.2 : 1);
    if (body.injuries.length) {
      var worst = worstInjury(body);
      var floorPain = 0.16 * injuryLevel(body) + 0.1 * worst.severity;
      if (body.pain < floorPain) body.pain = approach(body.pain, floorPain, 0.8, dt);
    }
    body.mobility = approach(body.mobility == null ? 1 : body.mobility, mobilityOf(body), 0.5, dt);

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
    var health = clamp(1 - 0.35 * body.fatigue - 0.25 * body.pain - 0.2 * body.injury, 0.3, 1) *
      clamp(body.mobility == null ? mobilityOf(body) : body.mobility, 0.35, 1);
    var drive = 0.6 + 0.75 * pace * (0.7 + 0.4 * t.paceTrait);
    return clamp(health * drive * (1 - 0.18 * caution), 0.25, 1.55);
  }

  function pickTime(body, decision) {
    var precision = decision ? decision.precision : 0.5;
    var t = body.traits;
    var wrist = injuryOf(body, 'wrist');
    return WORK.pickBase * (1.5 - 0.55 * precision - 0.3 * t.precision) * (1 + 0.9 * wrist) /
      clamp(0.55 + 0.6 * body.cognition, 0.4, 1.3);
  }

  function placeTime(body, decision) {
    var precision = decision ? decision.precision : 0.5;
    var t = body.traits;
    var wrist = injuryOf(body, 'wrist');
    return WORK.placeBase * (1.4 - 0.5 * precision - 0.25 * t.precision) * (1 + 0.8 * wrist) /
      clamp(0.55 + 0.6 * body.cognition, 0.4, 1.3);
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
    var stateTerm = 1 + 0.7 * body.stress + 0.6 * body.fatigue + 0.8 * body.pain + 0.5 * (1 - body.vision) +
      1.4 * injuryOf(body, 'wrist') + 0.5 * injuryOf(body, 'knee');
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
    return damage || 0.5;
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
      vitality: clamp01(body.vitality),
      bladder: clamp01(body.bladder),
      fun: clamp01(body.fun),
      blood: clamp01(body.blood),
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
    safeLift: safeLift,
    injuryOf: injuryOf,
    injuryLevel: injuryLevel,
    worstInjury: worstInjury,
    addInjury: addInjury,
    healInjuries: healInjuries,
    mobilityOf: mobilityOf,
    ruleBreach: ruleBreach,
    noteViolation: noteViolation,
    ruleCompliance: ruleCompliance,
    ruleById: ruleById,
    RULES: RULES,
    BODY_PARTS: BODY_PARTS,
    INJURY_TYPES: INJURY_TYPES,
    featuresOf: featuresOf,
    vitals: vitals,
    isDead: function (body) { return Boolean(body.deceased) || body.vitality <= 0; },
    muscleStrain: function (body, group) {
      var m = body.muscles && body.muscles[group];
      return m ? clamp01(m.strain) : 0;
    },
    clamp: clamp,
    clamp01: clamp01,
    lerp: lerp,
    approach: approach,
  };
});
