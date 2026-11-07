/* ============================================================
   1 ИЗ 8 МИЛЛИАРДОВ — живой портрет.
   ------------------------------------------------------------
   Человек рисуется кодом на canvas и меняется всю жизнь:
   пропорции тела от младенца до старика, кожа, волосы, одежда
   по стране и достатку, седина, морщины, осанка — и
   библиотека из 100+ анимаций, которые включаются сами
   по возрасту, состоянию и событиям летописи.
   Внешних картинок и библиотек нет.
   ============================================================ */
(function () {
  'use strict';

  var M = window.IN8B.model;

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function ease(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
  function pulse(t) { return Math.sin(t * Math.PI); }              /* 0→1→0 */
  function wave(t, n) { return Math.sin(t * Math.PI * 2 * (n || 1)); }
  function mix(c1, c2, t) {
    var a = hex(c1), b = hex(c2);
    return 'rgb(' + Math.round(lerp(a[0], b[0], t)) + ',' + Math.round(lerp(a[1], b[1], t)) +
      ',' + Math.round(lerp(a[2], b[2], t)) + ')';
  }
  function hex(h) {
    if (h[0] !== '#') { var m2 = h.match(/\d+/g); return [+m2[0], +m2[1], +m2[2]]; }
    var s = h.slice(1);
    if (s.length === 3) s = s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
    return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
  }
  function shade(c, k) { return k >= 0 ? mix(c, '#ffffff', k) : mix(c, '#000000', -k); }

  /* ===================== внешность по жребию ======================== */

  var SKINS = {
    afw: ['#6b4530', '#5a3827', '#7c5339'], afe: ['#6d4a33', '#5c3b28', '#7e5a3e'],
    afc: ['#654129', '#593825', '#75503a'], afs: ['#7b5a40', '#8d6b4c', '#64442e'],
    afn: ['#b98a60', '#a87a52', '#c89a72'], asw: ['#c69a6d', '#b0845a', '#d8ae84'],
    asc: ['#d2a279', '#c08f66', '#e0b48d'], ass: ['#9a6b45', '#8a5c39', '#b07f55'],
    ase: ['#e2bb92', '#d4a97f', '#eccba8'], asse: ['#c89b6f', '#b98a5e', '#dbaf85'],
    euw: ['#f0c9a8', '#e6bb97', '#f6d6ba'], eue: ['#edc5a3', '#e2b693', '#f4d4b6'],
    eun: ['#f5d2b4', '#eec5a3', '#fadec6'],  oce: ['#b58a62', '#a2764f', '#c89c74'],
    amn: ['#e8c0a0', '#c89468', '#9a6b46'], amc: ['#c79a6f', '#b3855a', '#d9ae85'],
    ams: ['#cb9e73', '#b78a5f', '#dcb389']
  };
  SKINS.eus = ['#e9c1a0', '#dcb18d', '#f2d3b6'];

  var HAIRS = {
    light: ['#6b4a2a', '#8a6334', '#c89a4e', '#a06a3a'],
    dark: ['#1d1512', '#2a1d16', '#3a271b'],
    mid: ['#3a2418', '#4a2f1e', '#2b1b12']
  };

  function hairSetFor(region) {
    if (region === 'eun' || region === 'euw') return HAIRS.light;
    if (region === 'eue' || region === 'eus' || region === 'amn') return HAIRS.mid;
    return HAIRS.dark;
  }

  var CLOTH_POOR = ['#6a6358', '#5d6b5a', '#73604f', '#5b6472', '#6e5b5b'];
  var CLOTH_MID = ['#4a6b8a', '#5b7a5e', '#8a6a4a', '#6a5b8a', '#8a5f5f', '#3f6b6b'];
  var CLOTH_RICH = ['#2f4f6f', '#56407a', '#8a6a2a', '#28564a', '#7a3550', '#2b3b55'];

  var COVERED = { afn: 0.75, asw: 0.65, ass: 0.45, asc: 0.3, afw: 0.3, afe: 0.25 };

  /* причёски: мужские и женские силуэты */
  var HAIR_M = ['short', 'crop', 'side', 'fringe', 'curlyShort'];
  var HAIR_F = ['long', 'bob', 'bun', 'pony', 'braid', 'fringe'];
  var FACIAL = ['none', 'none', 'none', 'stubble', 'moustache', 'goatee', 'beard', 'long'];
  var SHOES = ['#2b2723', '#3a2f26', '#24282c', '#43362b', '#1f2328'];
  var LIPS = ['#8e4a42', '#a05249', '#7d3b36', '#96564c', '#6f3a35'];
  /* доля женщин, носящих платье или сари, по регионам */
  var DRESSY = { ass: 0.8, asse: 0.5, afw: 0.65, afe: 0.6, afc: 0.6, afs: 0.4, afn: 0.55,
    asw: 0.5, amc: 0.4, ams: 0.4, euw: 0.3, eue: 0.3, eun: 0.28, eus: 0.3, asc: 0.35,
    ase: 0.3, amn: 0.28, oce: 0.35 };

  /* Внешность детерминирована зерном жизни: тот же человек — тот же вид */
  function lookFor(life) {
    var r = function (tag) { return (M.hashSeed(life.seed + '|look|' + tag) % 10000) / 10000; };
    var reg = life.base.region;
    var skins = SKINS[reg] || SKINS.ams;
    var hairs = hairSetFor(reg);
    var wealth = life.famPct;
    var pool = wealth < 0.3 ? CLOTH_POOR : wealth < 0.75 ? CLOTH_MID : CLOTH_RICH;
    var cold = reg === 'eun' || reg === 'eue' || reg === 'asc' || (reg === 'amn' && r('cold') < 0.5);
    return {
      skin: skins[Math.floor(r('skin') * skins.length)],
      hair: hairs[Math.floor(r('hair') * hairs.length)],
      eye: ['#3b2a1c', '#2c4a3a', '#2b3f5c', '#4a3524'][Math.floor(r('eye') * 4)],
      cloth: pool[Math.floor(r('cloth') * pool.length)],
      cloth2: pool[Math.floor(r('cloth2') * pool.length)],
      curly: r('curly') < (reg[0] === 'a' && reg !== 'ase' ? 0.7 : 0.3),
      longHair: life.sex === 'f' ? r('long') < 0.82 : r('long') < 0.12,
      beardy: life.sex === 'm' && r('beard') < 0.45,
      covered: life.sex === 'f' && r('cover') < (COVERED[reg] || 0.05),
      freckles: r('freck') < 0.18,
      ears: 0.9 + r('ears') * 0.3,
      nose: 0.7 + r('nose') * 0.32,
      wide: 0.9 + r('wide') * 0.25,
      cold: cold,
      round: r('round') < 0.5,
      /* --- силуэт и одежда --- */
      hairStyle: life.sex === 'f'
        ? HAIR_F[Math.floor(r('style') * HAIR_F.length)]
        : HAIR_M[Math.floor(r('style') * HAIR_M.length)],
      balding: life.sex === 'm' && r('bald') < 0.55,
      facial: life.sex === 'm' ? FACIAL[Math.floor(r('facial') * FACIAL.length)] : 'none',
      thickBrows: r('brow') < 0.45,
      lashes: life.sex === 'f',
      jaw: life.sex === 'f' ? 0.88 + r('jaw') * 0.1 : 0.96 + r('jaw') * 0.12,
      lip: LIPS[Math.floor(r('lip') * LIPS.length)],
      shoes: SHOES[Math.floor(r('shoe') * SHOES.length)],
      dress: life.sex === 'f' && r('dress') < (DRESSY[reg] || 0.3),
      longDress: r('longdress') < (cold ? 0.3 : 0.55),
      sleeveless: !cold && r('sleeve') < 0.25,
      skinRaw: skins[Math.floor(r('skin') * skins.length)],
      scarfCol: pool[Math.floor(r('scarf') * pool.length)]
    };
  }

  /* =================== пропорции по точному возрасту ================= */

  var ANCHORS = [
    { a: 0, h: 0.30, head: 0.30, tw: 0.32, th: 0.30, arm: 0.24, leg: 0.22, neck: 0.03 },
    { a: 1, h: 0.36, head: 0.28, tw: 0.31, th: 0.31, arm: 0.26, leg: 0.26, neck: 0.035 },
    { a: 3, h: 0.46, head: 0.25, tw: 0.29, th: 0.32, arm: 0.28, leg: 0.30, neck: 0.04 },
    { a: 7, h: 0.57, head: 0.21, tw: 0.27, th: 0.33, arm: 0.30, leg: 0.35, neck: 0.045 },
    { a: 12, h: 0.70, head: 0.18, tw: 0.25, th: 0.29, arm: 0.33, leg: 0.43, neck: 0.05 },
    { a: 17, h: 0.82, head: 0.158, tw: 0.25, th: 0.28, arm: 0.35, leg: 0.46, neck: 0.05 },
    { a: 25, h: 0.88, head: 0.149, tw: 0.26, th: 0.27, arm: 0.36, leg: 0.48, neck: 0.05 },
    { a: 40, h: 0.88, head: 0.147, tw: 0.28, th: 0.27, arm: 0.36, leg: 0.48, neck: 0.05 },
    { a: 55, h: 0.87, head: 0.147, tw: 0.30, th: 0.28, arm: 0.35, leg: 0.47, neck: 0.048 },
    { a: 70, h: 0.84, head: 0.15, tw: 0.29, th: 0.28, arm: 0.34, leg: 0.45, neck: 0.045 },
    { a: 85, h: 0.80, head: 0.146, tw: 0.28, th: 0.28, arm: 0.33, leg: 0.43, neck: 0.042 },
    { a: 110, h: 0.77, head: 0.15, tw: 0.27, th: 0.27, arm: 0.32, leg: 0.42, neck: 0.04 }
  ];

  function metrics(age) {
    var i = 0;
    while (i < ANCHORS.length - 2 && ANCHORS[i + 1].a < age) i++;
    var A = ANCHORS[i], B = ANCHORS[i + 1];
    var t = clamp((age - A.a) / Math.max(1, B.a - A.a), 0, 1);
    var out = {};
    ['h', 'head', 'tw', 'th', 'arm', 'leg', 'neck'].forEach(function (k) { out[k] = lerp(A[k], B[k], t); });
    return out;
  }

  var STAGES = [
    [0, 'newborn', 'младенчество'], [1, 'baby', 'первые шаги'], [3, 'child', 'детство'],
    [10, 'teen', 'подростковые годы'], [18, 'young', 'молодость'], [30, 'adult', 'зрелость'],
    [45, 'middle', 'средние годы'], [60, 'senior', 'пожилые годы'], [75, 'elder', 'старость']
  ];
  function stageOf(age) {
    var s = STAGES[0];
    for (var i = 0; i < STAGES.length; i++) if (age >= STAGES[i][0]) s = STAGES[i];
    return s[1];
  }

  /* ============================ поза ================================= */

  function basePose() {
    return {
      rootX: 0, rootY: 0, scale: 1, zoom: 1, lean: 0, bob: 0, shake: 0, fade: 0, flash: 0, glow: 0,
      breath: 0, hairFlow: 0, sweat: 0, pale: 0, blush: 0,
      head: { x: 0, y: 0, rot: 0, nod: 0 },
      eyes: { open: 1, lx: 0, ly: 0, squint: 0, tear: 0, wink: 0 },
      brows: { raise: 0, angry: 0, sad: 0 },
      mouth: { open: 0, smile: 0, width: 1 },
      torso: { twist: 0, slouch: 0, crouch: 0 },
      arms: { ls: 0.13, le: 0.06, rs: 0.13, re: 0.06 },
      legs: { lh: 0.04, lk: 0, rh: 0.04, rk: 0, spread: 1, lift: 0 },
      props: {}, fx: {}
    };
  }

  /* ======================= БИБЛИОТЕКА АНИМАЦИЙ ======================= */
  /* Каждый клип меняет позу. Фоновые клипы крутятся по кругу и
     накладываются друг на друга, клипы-действия проигрываются один раз
     поверх них. Поэтому одновременно видно дыхание, моргание, ветер
     в волосах, погоду и само действие. */

  var CLIPS = [];
  var BY_ID = {};
  function clip(id, name, group, dur, fn) {
    var c = { id: id, name: name, group: group, dur: dur, fn: fn };
    CLIPS.push(c); BY_ID[id] = c;
    return c;
  }

  /* --- 1. дыхание и покой по возрасту (10) --- */
  clip('idle-newborn', 'Спит свёрнутым калачиком', 'Покой', 4.4, function (P, t) {
    P.breath = 0.5 + 0.5 * wave(t); P.props.swaddle = 1; P.eyes.open = 0.04;
    P.arms.ls = 1.1; P.arms.rs = 1.1; P.arms.le = 1.5; P.arms.re = 1.5;
    P.legs.lh = 1.0; P.legs.rh = 1.0; P.legs.lk = 1.1; P.legs.rk = 1.1;
    P.rootY = -0.02 + 0.004 * wave(t);
  });
  clip('idle-baby', 'Сидит и качается', 'Покой', 3.6, function (P, t) {
    P.breath = 0.5 + 0.5 * wave(t); P.torso.crouch = 0.75;
    P.arms.ls = 0.5 + 0.1 * wave(t); P.arms.rs = 0.5 - 0.1 * wave(t);
    P.legs.lh = 1.25; P.legs.rh = 1.25; P.legs.lk = -1.0; P.legs.rk = -1.0;
    P.head.rot = 0.05 * wave(t, 0.5);
  });
  clip('idle-child', 'Стоит, не может устоять на месте', 'Покой', 3.0, function (P, t) {
    P.breath = 0.5 + 0.5 * wave(t);
    P.rootX = 0.012 * wave(t, 0.5); P.bob = 0.006 * Math.abs(wave(t, 2));
    P.arms.ls = 0.16 + 0.1 * wave(t); P.arms.rs = 0.16 - 0.1 * wave(t);
    P.head.rot = 0.04 * wave(t, 0.75);
  });
  clip('idle-teen', 'Стоит ссутулившись', 'Покой', 4.2, function (P, t) {
    P.breath = 0.5 + 0.5 * wave(t); P.torso.slouch = 0.3;
    P.arms.ls = 0.1; P.arms.rs = 0.1; P.head.y = 0.01; P.head.rot = -0.03;
    P.rootX = 0.005 * wave(t, 0.5);
  });
  clip('idle-young', 'Стоит спокойно', 'Покой', 4.6, function (P, t) {
    P.breath = 0.5 + 0.5 * wave(t);
    P.arms.ls = 0.09 + 0.03 * wave(t); P.arms.rs = 0.09 - 0.03 * wave(t);
    P.bob = 0.004 * wave(t);
  });
  clip('idle-adult', 'Стоит уверенно', 'Покой', 5.0, function (P, t) {
    P.breath = 0.5 + 0.5 * wave(t);
    P.arms.ls = 0.1 + 0.02 * wave(t); P.arms.rs = 0.1 - 0.02 * wave(t);
    P.torso.twist = 0.03 * wave(t, 0.5);
  });
  clip('idle-middle', 'Стоит, переминаясь', 'Покой', 5.2, function (P, t) {
    P.breath = 0.5 + 0.5 * wave(t); P.torso.slouch = 0.12;
    P.rootX = 0.006 * wave(t, 0.25);
    P.arms.ls = 0.12; P.arms.rs = 0.12;
  });
  clip('idle-senior', 'Стоит, опираясь на одну ногу', 'Покой', 5.6, function (P, t) {
    P.breath = 0.5 + 0.5 * wave(t); P.torso.slouch = 0.3; P.head.y = 0.012;
    P.arms.ls = 0.14; P.arms.rs = 0.14; P.legs.spread = 0.9;
  });
  clip('idle-elder', 'Стоит сгорбившись', 'Покой', 6.0, function (P, t) {
    P.breath = 0.5 + 0.5 * wave(t); P.torso.slouch = 0.6; P.head.y = 0.02; P.head.rot = 0.05;
    P.arms.ls = 0.18; P.arms.rs = 0.18; P.props.cane = 1; P.legs.spread = 0.85;
  });
  clip('breathe-deep', 'Глубокий вдох', 'Покой', 3.2, function (P, t) {
    P.breath = Math.max(P.breath, pulse(t)); P.head.rot += 0.02 * pulse(t);
  });

  /* --- 2. глаза (8) --- */
  clip('blink', 'Моргание', 'Глаза', 0.24, function (P, t) {
    P.eyes.open = Math.min(P.eyes.open, Math.abs(t - 0.5) * 2);
  });
  clip('blink-double', 'Двойное моргание', 'Глаза', 0.5, function (P, t) {
    var k = Math.abs(((t * 2) % 1) - 0.5) * 2;
    P.eyes.open = Math.min(P.eyes.open, k);
  });
  clip('wink', 'Подмигивание', 'Глаза', 0.7, function (P, t) {
    P.eyes.wink = pulse(t); P.mouth.smile = Math.max(P.mouth.smile, 0.5 * pulse(t));
  });
  clip('look-left', 'Смотрит влево', 'Глаза', 1.6, function (P, t) {
    P.eyes.lx = -ease(Math.min(1, t * 2)) * (t > 0.7 ? 1 - (t - 0.7) / 0.3 : 1);
  });
  clip('look-right', 'Смотрит вправо', 'Глаза', 1.6, function (P, t) {
    P.eyes.lx = ease(Math.min(1, t * 2)) * (t > 0.7 ? 1 - (t - 0.7) / 0.3 : 1);
  });
  clip('look-up', 'Смотрит вверх', 'Глаза', 1.8, function (P, t) {
    P.eyes.ly = -pulse(t); P.head.rot += 0.03 * pulse(t);
  });
  clip('look-down', 'Опускает взгляд', 'Глаза', 1.8, function (P, t) {
    P.eyes.ly = pulse(t) * 0.8; P.head.y += 0.01 * pulse(t);
  });
  clip('eyes-rest', 'Прикрывает глаза', 'Глаза', 3.0, function (P, t) {
    P.eyes.open = Math.min(P.eyes.open, 1 - 0.8 * pulse(t));
  });

  /* --- 3. лицо (14) --- */
  clip('smile-soft', 'Лёгкая улыбка', 'Лицо', 2.6, function (P, t) {
    P.mouth.smile = Math.max(P.mouth.smile, 0.45 * pulse(t));
  });
  clip('smile-wide', 'Широкая улыбка', 'Лицо', 2.8, function (P, t) {
    P.mouth.smile = Math.max(P.mouth.smile, 0.9 * pulse(t)); P.eyes.squint = 0.35 * pulse(t);
  });
  clip('laugh', 'Смеётся', 'Лицо', 2.2, function (P, t) {
    P.mouth.smile = 1; P.mouth.open = 0.45 + 0.25 * Math.abs(wave(t, 5));
    P.eyes.squint = 0.6; P.head.rot = 0.06 * wave(t, 2.5); P.bob = 0.008 * Math.abs(wave(t, 5));
  });
  clip('giggle', 'Хихикает', 'Лицо', 1.6, function (P, t) {
    P.mouth.smile = 0.8; P.mouth.open = 0.2 + 0.15 * Math.abs(wave(t, 7));
    P.eyes.squint = 0.4; P.torso.twist = 0.05 * wave(t, 3);
  });
  clip('frown', 'Хмурится', 'Лицо', 2.4, function (P, t) {
    P.brows.angry = pulse(t); P.mouth.smile = -0.3 * pulse(t);
  });
  clip('sad', 'Грустит', 'Лицо', 3.4, function (P, t) {
    P.brows.sad = pulse(t); P.mouth.smile = -0.5 * pulse(t); P.head.y += 0.012 * pulse(t); P.eyes.ly = 0.4 * pulse(t);
  });
  clip('cry', 'Плачет', 'Лицо', 3.0, function (P, t) {
    P.brows.sad = 1; P.mouth.smile = -0.6; P.mouth.open = 0.3 + 0.2 * Math.abs(wave(t, 3));
    P.eyes.tear = 0.4 + 0.6 * ((t * 2) % 1); P.eyes.open = 0.45; P.bob = 0.006 * Math.abs(wave(t, 3));
  });
  clip('sob', 'Рыдает', 'Лицо', 3.6, function (P, t) {
    P.brows.sad = 1; P.mouth.smile = -0.7; P.eyes.open = 0.15; P.eyes.tear = ((t * 3) % 1);
    P.torso.slouch = 0.5; P.head.y += 0.02; P.arms.ls = 1.5; P.arms.le = 1.6; P.props.handsFace = 1;
  });
  clip('sigh', 'Вздыхает', 'Лицо', 2.8, function (P, t) {
    P.breath = Math.max(P.breath, pulse(t)); P.mouth.open = 0.25 * pulse(t);
    P.head.rot += 0.04 * Math.sin(t * Math.PI * 1.5); P.brows.sad = 0.4 * pulse(t);
  });
  clip('yawn', 'Зевает', 'Лицо', 2.6, function (P, t) {
    var k = pulse(t); P.mouth.open = 0.8 * k; P.eyes.open = Math.min(P.eyes.open, 1 - 0.85 * k);
    P.arms.ls = -1.4 * k; P.arms.rs = -1.4 * k; P.head.rot -= 0.06 * k;
  });
  clip('surprise', 'Удивление', 'Лицо', 1.8, function (P, t) {
    var k = pulse(t); P.brows.raise = k; P.mouth.open = 0.5 * k; P.eyes.open = 1 + 0.4 * k;
    P.head.y -= 0.008 * k;
  });
  clip('worry', 'Тревога', 'Лицо', 3.2, function (P, t) {
    P.brows.sad = 0.6; P.mouth.smile = -0.2; P.eyes.lx = 0.5 * wave(t, 1.5); P.sweat = pulse(t) * 0.6;
  });
  clip('anger', 'Злость', 'Лицо', 2.4, function (P, t) {
    var k = pulse(t); P.brows.angry = k; P.mouth.smile = -0.5 * k; P.mouth.open = 0.25 * k;
    P.shake = 1.2 * k; P.blush = 0.4 * k;
  });
  clip('pout', 'Надулся', 'Лицо', 2.6, function (P, t) {
    P.mouth.smile = -0.4 * pulse(t); P.mouth.width = 0.75; P.head.rot = -0.08 * pulse(t); P.eyes.lx = -0.5;
  });

  /* --- 4. голова (8) --- */
  clip('nod-yes', 'Кивает «да»', 'Голова', 1.4, function (P, t) {
    P.head.nod = 0.6 * wave(t, 2); P.mouth.smile = Math.max(P.mouth.smile, 0.3);
  });
  clip('shake-no', 'Качает головой «нет»', 'Голова', 1.5, function (P, t) {
    P.head.rot += 0.12 * wave(t, 2); P.brows.sad = 0.3;
  });
  clip('tilt-curious', 'Склоняет голову', 'Голова', 2.4, function (P, t) {
    P.head.rot += 0.14 * pulse(t); P.brows.raise = 0.5 * pulse(t);
  });
  clip('look-around', 'Озирается', 'Голова', 3.6, function (P, t) {
    P.head.rot += 0.1 * wave(t); P.eyes.lx = wave(t) * 0.9;
  });
  clip('head-drop', 'Опускает голову', 'Голова', 2.8, function (P, t) {
    P.head.nod = 0.7 * pulse(t); P.torso.slouch += 0.2 * pulse(t);
  });
  clip('head-proud', 'Поднимает подбородок', 'Голова', 2.6, function (P, t) {
    P.head.nod = -0.5 * pulse(t); P.torso.slouch = -0.2 * pulse(t); P.mouth.smile = 0.4 * pulse(t);
  });
  clip('listen', 'Слушает', 'Голова', 3.0, function (P, t) {
    P.head.rot += 0.08; P.eyes.lx = 0.4 * wave(t, 0.5); P.brows.raise = 0.2;
  });
  clip('think', 'Задумался', 'Голова', 3.4, function (P, t) {
    P.eyes.ly = -0.5; P.eyes.lx = 0.4 * wave(t, 0.5); P.arms.rs = 1.3; P.arms.re = 1.5;
    P.props.handChin = 1; P.brows.raise = 0.3;
  });

  /* --- 5. руки (14) --- */
  clip('wave', 'Машет рукой', 'Руки', 1.8, function (P, t) {
    P.arms.rs = -2.0; P.arms.re = -0.4 + 0.45 * wave(t, 4);
    P.mouth.smile = Math.max(P.mouth.smile, 0.6);
  });
  clip('wave-both', 'Машет двумя руками', 'Руки', 2.0, function (P, t) {
    P.arms.rs = -2.1; P.arms.ls = -2.1;
    P.arms.re = -0.3 + 0.4 * wave(t, 4); P.arms.le = -0.3 - 0.4 * wave(t, 4);
    P.mouth.smile = 0.8; P.mouth.open = 0.25;
  });
  clip('point', 'Показывает рукой', 'Руки', 2.0, function (P, t) {
    P.arms.rs = -1.4 * ease(Math.min(1, t * 3)); P.arms.re = 0.1; P.eyes.lx = 0.6;
  });
  clip('clap', 'Хлопает в ладоши', 'Руки', 1.6, function (P, t) {
    var k = Math.abs(wave(t, 5));
    P.arms.ls = -1.0 - 0.25 * k; P.arms.rs = -1.0 - 0.25 * k;
    P.arms.le = 1.1 + 0.3 * k; P.arms.re = -1.1 - 0.3 * k;
    P.mouth.smile = 0.7;
  });
  clip('shrug', 'Пожимает плечами', 'Руки', 2.0, function (P, t) {
    var k = pulse(t); P.arms.ls = -0.9 * k; P.arms.rs = -0.9 * k;
    P.arms.le = 1.1 * k; P.arms.re = -1.1 * k; P.brows.raise = k; P.mouth.smile = -0.1;
  });
  clip('arms-crossed', 'Скрестил руки', 'Руки', 3.4, function (P) {
    P.arms.ls = -0.7; P.arms.rs = -0.7; P.arms.le = 1.4; P.arms.re = -1.4; P.props.crossed = 1;
  });
  clip('hands-hips', 'Руки в боки', 'Руки', 3.2, function (P) {
    P.arms.ls = -0.55; P.arms.rs = -0.55; P.arms.le = 1.5; P.arms.re = -1.5;
  });
  clip('scratch-head', 'Чешет затылок', 'Руки', 2.4, function (P, t) {
    P.arms.rs = -2.3; P.arms.re = -1.5 + 0.2 * wave(t, 6); P.head.rot = 0.06; P.brows.raise = 0.4;
  });
  clip('facepalm', 'Закрывает лицо ладонью', 'Руки', 2.6, function (P, t) {
    var k = ease(Math.min(1, t * 2)); P.arms.rs = -2.2 * k; P.arms.re = -1.3 * k;
    P.props.handsFace = k > 0.6 ? 1 : 0; P.head.nod = 0.3 * k; P.brows.sad = 0.6;
  });
  clip('thumbs-up', 'Показывает большой палец', 'Руки', 2.0, function (P, t) {
    var k = ease(Math.min(1, t * 3)); P.arms.rs = -1.1 * k; P.arms.re = -0.9 * k;
    P.props.thumb = 1; P.mouth.smile = 0.8;
  });
  clip('reach-out', 'Протягивает руки', 'Руки', 2.4, function (P, t) {
    var k = pulse(t); P.arms.ls = -1.5 * k; P.arms.rs = -1.5 * k; P.arms.le = 0.2; P.arms.re = -0.2;
    P.mouth.smile = 0.5;
  });
  clip('hold-hands', 'Держится за руку', 'Руки', 3.6, function (P, t) {
    P.arms.rs = -0.8; P.arms.re = -0.2; P.props.partner = 1; P.mouth.smile = 0.5 + 0.1 * wave(t, 0.5);
  });
  clip('cover-mouth', 'Прикрывает рот', 'Руки', 2.2, function (P, t) {
    var k = pulse(t); P.arms.rs = -2.0 * k; P.arms.re = -1.2 * k; P.brows.raise = 0.6 * k; P.eyes.open = 1.2;
  });
  clip('carry-bag', 'Несёт сумку', 'Руки', 3.0, function (P, t) {
    P.arms.rs = 0.25; P.arms.re = 0.05; P.props.bag = 1; P.torso.twist = 0.04 * wave(t);
  });

  /* --- 6. тело (15) --- */
  clip('crawl', 'Ползает', 'Тело', 2.4, function (P, t) {
    P.torso.crouch = 1; P.rootY = 0.06; P.props.crawl = 1;
    P.arms.ls = 1.4 + 0.45 * wave(t); P.arms.rs = 1.4 - 0.45 * wave(t);
    P.legs.lh = 1.2 - 0.3 * wave(t); P.legs.rh = 1.2 + 0.3 * wave(t);
    P.head.rot = -0.25;
  });
  clip('first-steps', 'Первые шаги', 'Тело', 3.2, function (P, t) {
    P.arms.ls = -1.3; P.arms.rs = -1.3; P.arms.le = 0.3; P.arms.re = -0.3;
    P.legs.lh = 0.35 * wave(t, 1.5); P.legs.rh = -0.35 * wave(t, 1.5);
    P.rootX = 0.02 * wave(t, 0.5); P.lean = 0.05 * wave(t, 1.5); P.mouth.smile = 0.7; P.mouth.open = 0.2;
  });
  clip('toddle', 'Ковыляет', 'Тело', 2.6, function (P, t) {
    P.legs.lh = 0.3 * wave(t); P.legs.rh = -0.3 * wave(t);
    P.arms.ls = -0.8; P.arms.rs = -0.8; P.bob = 0.01 * Math.abs(wave(t, 2)); P.lean = 0.04 * wave(t);
  });
  clip('walk', 'Идёт', 'Тело', 1.8, function (P, t) {
    P.legs.lh = 0.42 * wave(t); P.legs.rh = -0.42 * wave(t);
    P.legs.lk = Math.max(0, -0.5 * wave(t)); P.legs.rk = Math.max(0, 0.5 * wave(t));
    P.arms.ls = -0.35 * wave(t); P.arms.rs = 0.35 * wave(t);
    P.bob = 0.008 * Math.abs(wave(t, 2));
  });
  clip('run', 'Бежит', 'Тело', 1.0, function (P, t) {
    P.legs.lh = 0.8 * wave(t); P.legs.rh = -0.8 * wave(t);
    P.legs.lk = Math.max(0, -1.1 * wave(t)); P.legs.rk = Math.max(0, 1.1 * wave(t));
    P.arms.ls = -0.9 * wave(t); P.arms.rs = 0.9 * wave(t); P.arms.le = 1.1; P.arms.re = -1.1;
    P.lean = 0.12; P.bob = 0.018 * Math.abs(wave(t, 2)); P.mouth.open = 0.3;
  });
  clip('jump', 'Прыгает от радости', 'Тело', 1.2, function (P, t) {
    var k = Math.sin(t * Math.PI);
    P.rootY = -0.1 * k; P.legs.lk = 0.6 * (1 - k); P.legs.rk = 0.6 * (1 - k);
    P.arms.ls = -2.2 * k; P.arms.rs = -2.2 * k; P.mouth.smile = 1; P.mouth.open = 0.4;
  });
  clip('sit-down', 'Садится', 'Тело', 2.2, function (P, t) {
    var k = ease(Math.min(1, t * 1.5)); P.torso.crouch = k; P.legs.lh = 1.5 * k; P.legs.rh = 1.5 * k;
    P.legs.lk = -1.5 * k; P.legs.rk = -1.5 * k; P.rootY = 0.02 * k; P.props.chair = k > 0.5 ? 1 : 0;
  });
  clip('stand-up', 'Встаёт', 'Тело', 2.0, function (P, t) {
    var k = 1 - ease(Math.min(1, t * 1.4)); P.torso.crouch = k; P.legs.lh = 1.5 * k; P.legs.rh = 1.5 * k;
    P.legs.lk = -1.5 * k; P.legs.rk = -1.5 * k; P.breath = 0.8;
  });
  clip('squat', 'Приседает', 'Тело', 2.4, function (P, t) {
    var k = pulse(t); P.torso.crouch = 0.8 * k; P.legs.lk = -0.9 * k; P.legs.rk = -0.9 * k;
    P.arms.ls = -1.4 * k; P.arms.rs = -1.4 * k; P.breath = k;
  });
  clip('dance', 'Танцует', 'Тело', 2.4, function (P, t) {
    P.rootX = 0.03 * wave(t); P.bob = 0.02 * Math.abs(wave(t, 2));
    P.arms.ls = -1.6 + 0.6 * wave(t, 2); P.arms.rs = -1.6 - 0.6 * wave(t, 2);
    P.arms.le = 0.9; P.arms.re = -0.9; P.torso.twist = 0.12 * wave(t);
    P.head.rot = 0.08 * wave(t, 2); P.mouth.smile = 0.9; P.mouth.open = 0.3;
  });
  clip('stretch', 'Потягивается', 'Тело', 2.8, function (P, t) {
    var k = pulse(t); P.arms.ls = -2.6 * k; P.arms.rs = -2.6 * k; P.torso.slouch = -0.3 * k;
    P.head.nod = -0.3 * k; P.breath = k; P.mouth.open = 0.3 * k;
  });
  clip('sleep', 'Спит', 'Тело', 6.0, function (P, t) {
    P.props.bed = 1; P.props.lying = 1; P.eyes.open = 0.02; P.breath = 0.5 + 0.5 * wave(t);
    P.rootY = 0.12; P.head.rot = 0.2; P.props.zzz = 1;
  });
  clip('lie-sick', 'Лежит больной', 'Тело', 5.0, function (P, t) {
    P.props.bed = 1; P.props.lying = 1; P.eyes.open = 0.25; P.pale = 0.6;
    P.breath = 0.5 + 0.5 * wave(t, 1.4); P.rootY = 0.12; P.brows.sad = 0.5; P.mouth.smile = -0.2;
  });
  clip('limp', 'Хромает', 'Тело', 2.4, function (P, t) {
    P.legs.lh = 0.3 * wave(t); P.legs.rh = -0.12 * wave(t); P.legs.rk = 0.25;
    P.lean = 0.1 * Math.max(0, wave(t)); P.brows.sad = 0.4; P.props.bandage = 1;
  });
  clip('lean-cane', 'Опирается на трость', 'Тело', 4.4, function (P, t) {
    P.props.cane = 1; P.torso.slouch = 0.6; P.arms.rs = 0.3; P.arms.re = 0.1;
    P.lean = 0.05 + 0.01 * wave(t); P.head.y = 0.015;
  });

  /* --- 7. события жизни (36) --- */
  clip('school-write', 'Пишет за партой', 'Жизнь', 3.4, function (P, t) {
    P.props.desk = 1; P.props.chair = 1; P.torso.crouch = 0.9; P.head.nod = 0.35;
    P.legs.lh = 1.5; P.legs.rh = 1.5; P.legs.lk = -1.5; P.legs.rk = -1.5;
    P.arms.rs = 0.9; P.arms.re = -0.9 + 0.12 * wave(t, 3); P.arms.ls = 0.8; P.arms.le = -0.8;
    P.eyes.ly = 0.5;
  });
  clip('read-book', 'Читает книгу', 'Жизнь', 4.2, function (P, t) {
    P.props.book = 1; P.arms.ls = -0.9; P.arms.rs = -0.9; P.arms.le = 1.1; P.arms.re = -1.1;
    P.head.nod = 0.25; P.eyes.ly = 0.5; P.eyes.lx = 0.5 * wave(t, 2);
  });
  clip('exam', 'Экзамен', 'Жизнь', 3.6, function (P, t) {
    P.props.desk = 1; P.props.paper = 1; P.torso.crouch = 0.9; P.head.nod = 0.3;
    P.legs.lh = 1.5; P.legs.rh = 1.5; P.legs.lk = -1.5; P.legs.rk = -1.5;
    P.sweat = 0.7; P.brows.sad = 0.5; P.arms.rs = 0.9; P.arms.re = -0.9 + 0.2 * wave(t, 4);
  });
  clip('graduate', 'Выпускной', 'Жизнь', 3.2, function (P, t) {
    P.props.cap = 1; P.props.diploma = 1; P.mouth.smile = 1;
    P.arms.rs = -2.0 * ease(Math.min(1, t * 2)); P.arms.ls = -1.2;
    P.fx.confetti = 1; P.rootY = -0.02 * Math.abs(wave(t, 2));
  });
  clip('interview', 'Собеседование', 'Жизнь', 3.4, function (P, t) {
    P.props.chair = 1; P.props.desk = 1; P.torso.crouch = 0.85; P.legs.lh = 1.5; P.legs.rh = 1.5;
    P.legs.lk = -1.5; P.legs.rk = -1.5; P.sweat = 0.5; P.arms.ls = 0.7; P.arms.rs = 0.7;
    P.head.rot = 0.04 * wave(t); P.mouth.smile = 0.3;
  });
  clip('work-desk', 'Работает за столом', 'Жизнь', 4.0, function (P, t) {
    P.props.desk = 1; P.props.laptop = 1; P.props.chair = 1; P.torso.crouch = 0.85;
    P.legs.lh = 1.5; P.legs.rh = 1.5; P.legs.lk = -1.5; P.legs.rk = -1.5;
    P.arms.ls = 0.95 + 0.05 * wave(t, 4); P.arms.rs = 0.95 - 0.05 * wave(t, 4);
    P.arms.le = -0.8; P.arms.re = 0.8; P.head.nod = 0.2; P.eyes.ly = 0.3;
  });
  clip('work-field', 'Работает в поле', 'Жизнь', 3.0, function (P, t) {
    P.props.hoe = 1; P.props.field = 1; P.torso.slouch = 0.5 + 0.2 * Math.abs(wave(t));
    P.arms.ls = 0.9 + 0.5 * wave(t); P.arms.rs = 0.6 + 0.5 * wave(t);
    P.head.nod = 0.4; P.sweat = 0.6; P.legs.spread = 1.2;
  });
  clip('work-factory', 'Смена на производстве', 'Жизнь', 3.0, function (P, t) {
    P.props.machine = 1; P.props.helmet = 1;
    P.arms.ls = -0.8 + 0.25 * wave(t, 2); P.arms.rs = -0.8 - 0.25 * wave(t, 2);
    P.arms.le = 1.0; P.arms.re = -1.0; P.sweat = 0.5; P.torso.twist = 0.05 * wave(t, 2);
  });
  clip('work-care', 'Ухаживает за людьми', 'Жизнь', 3.6, function (P, t) {
    P.props.tray = 1; P.arms.ls = -1.2; P.arms.rs = -1.2; P.arms.le = 0.9; P.arms.re = -0.9;
    P.mouth.smile = 0.5; P.rootX = 0.01 * wave(t, 0.5);
  });
  clip('work-trade', 'За прилавком', 'Жизнь', 3.4, function (P, t) {
    P.props.counter = 1; P.arms.ls = 0.7; P.arms.rs = -0.6 + 0.2 * wave(t, 2);
    P.mouth.smile = 0.45; P.head.rot = 0.05 * wave(t);
  });
  clip('promotion', 'Повышение', 'Жизнь', 3.0, function (P, t) {
    var k = ease(Math.min(1, t * 1.6)); P.props.badge = 1; P.torso.slouch = -0.25 * k;
    P.head.nod = -0.3 * k; P.mouth.smile = 0.9; P.arms.rs = -1.0 * k; P.fx.sparkle = 1;
  });
  clip('first-salary', 'Первая зарплата', 'Жизнь', 3.0, function (P, t) {
    P.props.money = 1; P.arms.rs = -1.3; P.arms.re = -0.5; P.mouth.smile = 1; P.mouth.open = 0.3;
    P.eyes.ly = -0.2; P.fx.sparkle = 1; P.bob = 0.01 * Math.abs(wave(t, 3));
  });
  clip('count-money', 'Считает деньги', 'Жизнь', 3.4, function (P, t) {
    P.props.money = 1; P.arms.ls = -1.0; P.arms.rs = -1.0; P.arms.le = 1.1; P.arms.re = -1.1;
    P.head.nod = 0.3; P.eyes.ly = 0.5; P.mouth.width = 0.9 + 0.05 * wave(t, 4);
  });
  clip('wedding', 'Свадьба', 'Жизнь', 4.2, function (P, t) {
    P.props.partner = 1; P.props.veil = 1; P.props.bouquet = 1; P.mouth.smile = 1;
    P.arms.rs = -0.7; P.arms.re = -0.3; P.fx.confetti = 1; P.rootX = -0.04;
    P.head.rot = 0.05 * wave(t, 0.5);
  });
  clip('propose', 'Предложение руки', 'Жизнь', 3.6, function (P, t) {
    var k = ease(Math.min(1, t * 2)); P.legs.rk = -1.6 * k; P.torso.crouch = 0.5 * k;
    P.arms.rs = -1.4 * k; P.arms.re = -0.3; P.props.ring = 1; P.props.partner = 1; P.mouth.smile = 0.8;
  });
  clip('hold-baby', 'Держит младенца', 'Жизнь', 4.4, function (P, t) {
    P.props.baby = 1; P.arms.ls = -0.9; P.arms.rs = -0.9; P.arms.le = 1.3; P.arms.re = -1.3;
    P.head.nod = 0.3; P.mouth.smile = 0.8; P.rootX = 0.008 * wave(t, 0.5); P.lean = 0.02 * wave(t, 0.5);
  });
  clip('feed-baby', 'Кормит ребёнка', 'Жизнь', 4.0, function (P, t) {
    P.props.baby = 1; P.props.chair = 1; P.torso.crouch = 0.8; P.legs.lh = 1.4; P.legs.rh = 1.4;
    P.legs.lk = -1.4; P.legs.rk = -1.4; P.arms.ls = -0.7; P.arms.rs = -0.5 + 0.1 * wave(t, 2);
    P.mouth.smile = 0.6; P.head.nod = 0.35;
  });
  clip('play-kid', 'Играет с ребёнком', 'Жизнь', 3.2, function (P, t) {
    P.props.kid = 1; P.torso.crouch = 0.4; P.arms.ls = -1.4 + 0.3 * wave(t, 2);
    P.arms.rs = -1.4 - 0.3 * wave(t, 2); P.mouth.smile = 1; P.mouth.open = 0.25; P.bob = 0.01 * Math.abs(wave(t, 3));
  });
  clip('teach-kid', 'Учит ребёнка', 'Жизнь', 3.8, function (P, t) {
    P.props.kid = 1; P.props.book = 1; P.torso.crouch = 0.3; P.head.nod = 0.3;
    P.arms.rs = -0.9; P.arms.re = -0.6; P.mouth.smile = 0.5; P.mouth.open = 0.2 + 0.1 * Math.abs(wave(t, 4));
  });
  clip('move-boxes', 'Переезд с коробками', 'Жизнь', 3.2, function (P, t) {
    P.props.box = 1; P.arms.ls = -1.1; P.arms.rs = -1.1; P.arms.le = 1.2; P.arms.re = -1.2;
    P.torso.slouch = 0.25; P.legs.lh = 0.3 * wave(t); P.legs.rh = -0.3 * wave(t);
    P.rootX = 0.02 * wave(t, 0.5); P.sweat = 0.4;
  });
  clip('travel-plane', 'Улетает в другую страну', 'Жизнь', 4.0, function (P, t) {
    P.props.suitcase = 1; P.fx.plane = t; P.arms.rs = 0.3; P.eyes.ly = -0.6;
    P.head.nod = -0.25; P.mouth.smile = 0.4;
  });
  clip('open-business', 'Открывает своё дело', 'Жизнь', 4.0, function (P, t) {
    P.props.shop = 1; P.props.keys = 1; P.arms.rs = -1.5 * ease(Math.min(1, t * 2));
    P.mouth.smile = 0.9; P.fx.sparkle = 1; P.head.nod = -0.15;
  });
  clip('buy-house', 'Новый дом', 'Жизнь', 4.0, function (P, t) {
    P.props.house = 1; P.props.keys = 1; P.arms.rs = -1.2; P.mouth.smile = 0.9;
    P.fx.sparkle = 1; P.rootX = -0.05; P.head.rot = 0.04 * wave(t, 0.5);
  });
  clip('garden', 'Возится в огороде', 'Жизнь', 3.6, function (P, t) {
    P.props.plant = 1; P.torso.crouch = 0.7; P.legs.lk = -0.9; P.legs.rk = -0.9;
    P.arms.ls = 1.0 + 0.2 * wave(t, 2); P.arms.rs = 1.0 - 0.2 * wave(t, 2); P.head.nod = 0.4;
    P.mouth.smile = 0.4;
  });
  clip('cook', 'Готовит еду', 'Жизнь', 3.4, function (P, t) {
    P.props.pot = 1; P.props.counter = 1; P.arms.rs = -0.9; P.arms.re = -0.6 + 0.25 * wave(t, 3);
    P.arms.ls = 0.6; P.head.nod = 0.25; P.mouth.smile = 0.3;
  });
  clip('pray', 'Молится', 'Жизнь', 4.6, function (P, t) {
    P.props.pray = 1; P.arms.ls = -0.5; P.arms.rs = -0.5; P.arms.le = 1.5; P.arms.re = -1.5;
    P.eyes.open = 0.1; P.head.nod = 0.35; P.breath = 0.5 + 0.5 * wave(t, 0.5);
  });
  clip('sport-run', 'Бегает по утрам', 'Жизнь', 1.4, function (P, t) {
    P.legs.lh = 0.7 * wave(t); P.legs.rh = -0.7 * wave(t);
    P.arms.ls = -0.8 * wave(t); P.arms.rs = 0.8 * wave(t); P.arms.le = 1.2; P.arms.re = -1.2;
    P.lean = 0.1; P.sweat = 0.5; P.mouth.open = 0.3; P.bob = 0.015 * Math.abs(wave(t, 2));
  });
  clip('gym', 'Занимается с гантелями', 'Жизнь', 2.4, function (P, t) {
    var k = Math.abs(wave(t, 2));
    P.arms.ls = -0.4 - 1.6 * k; P.arms.rs = -0.4 - 1.6 * k; P.arms.le = 1.4; P.arms.re = -1.4;
    P.props.weights = 1; P.breath = k; P.sweat = 0.6; P.mouth.open = 0.2 * k;
  });
  clip('smoke', 'Курит', 'Жизнь', 4.0, function (P, t) {
    P.props.cigarette = 1; P.fx.smoke = 1; P.arms.rs = -1.9 * (t < 0.4 ? t / 0.4 : t > 0.6 ? 1 - (t - 0.6) / 0.4 : 1);
    P.arms.re = -1.1; P.mouth.open = 0.15; P.eyes.squint = 0.3;
  });
  clip('drink', 'Выпивает', 'Жизнь', 3.6, function (P, t) {
    P.props.cup = 1; P.arms.rs = -1.6 * pulse(t); P.arms.re = -1.2 * pulse(t);
    P.head.nod = -0.2 * pulse(t); P.rootX = 0.012 * wave(t, 1.5); P.eyes.open = 0.7;
  });
  clip('hospital', 'В больнице', 'Жизнь', 5.0, function (P, t) {
    P.props.bed = 1; P.props.lying = 1; P.props.iv = 1; P.pale = 0.8; P.eyes.open = 0.2;
    P.breath = 0.5 + 0.5 * wave(t, 1.3); P.rootY = 0.12; P.brows.sad = 0.6;
  });
  clip('injury', 'Травма', 'Жизнь', 3.0, function (P, t) {
    P.props.bandage = 1; P.brows.sad = 0.8; P.mouth.smile = -0.5; P.mouth.open = 0.3 * pulse(t);
    P.arms.rs = 1.2; P.arms.re = -1.3; P.torso.slouch = 0.4; P.shake = 0.8 * pulse(t);
  });
  clip('grieve', 'Горюет', 'Жизнь', 5.0, function (P, t) {
    P.props.candle = 1; P.torso.slouch = 0.6; P.head.nod = 0.5; P.eyes.open = 0.25;
    P.eyes.tear = ((t * 2) % 1); P.brows.sad = 1; P.mouth.smile = -0.5;
    P.arms.ls = 0.3; P.arms.rs = 0.3;
  });
  clip('retire-bench', 'На скамейке', 'Жизнь', 5.4, function (P, t) {
    P.props.bench = 1; P.torso.crouch = 0.9; P.legs.lh = 1.5; P.legs.rh = 1.5;
    P.legs.lk = -1.4; P.legs.rk = -1.4; P.arms.ls = 0.7; P.arms.rs = 0.7;
    P.mouth.smile = 0.3; P.head.rot = 0.04 * wave(t, 0.4); P.breath = 0.5 + 0.5 * wave(t, 0.6);
  });
  clip('grandchild', 'С внуком на руках', 'Жизнь', 4.6, function (P, t) {
    P.props.kid = 1; P.torso.slouch = 0.4; P.arms.ls = -0.8; P.arms.rs = -0.8;
    P.arms.le = 1.2; P.arms.re = -1.2; P.mouth.smile = 0.9; P.head.nod = 0.25;
    P.rootX = 0.006 * wave(t, 0.5);
  });
  clip('award', 'Награда за дело жизни', 'Жизнь', 3.4, function (P, t) {
    P.props.medal = 1; P.arms.rs = -1.7 * ease(Math.min(1, t * 2)); P.mouth.smile = 1;
    P.torso.slouch = -0.2; P.fx.sparkle = 1; P.fx.confetti = 1;
  });
  clip('war-shelter', 'Прячется от обстрела', 'Жизнь', 4.0, function (P, t) {
    P.torso.crouch = 1; P.legs.lk = -1.6; P.legs.rk = -1.6; P.arms.ls = 1.6; P.arms.rs = 1.6;
    P.arms.le = 1.4; P.arms.re = -1.4; P.props.handsHead = 1; P.shake = 1.5; P.fx.dust = 1;
    P.brows.sad = 1; P.eyes.open = 0.3;
  });
  clip('protest', 'Выходит на площадь', 'Жизнь', 3.0, function (P, t) {
    P.props.sign = 1; P.arms.rs = -2.3 + 0.2 * wave(t, 3); P.arms.ls = -0.6;
    P.mouth.open = 0.35 + 0.15 * Math.abs(wave(t, 3)); P.brows.angry = 0.5;
  });
  clip('volunteer', 'Помогает другим', 'Жизнь', 3.8, function (P, t) {
    P.props.box = 1; P.props.heart = 1; P.arms.ls = -1.2; P.arms.rs = -1.2;
    P.arms.le = 1.1; P.arms.re = -1.1; P.mouth.smile = 0.7; P.head.nod = 0.15;
  });
  clip('phone-call', 'Говорит по телефону', 'Жизнь', 3.8, function (P, t) {
    P.props.phone = 1; P.arms.rs = -2.1; P.arms.re = -1.4;
    P.mouth.open = 0.2 + 0.12 * Math.abs(wave(t, 4)); P.head.rot = 0.05;
    P.rootX = 0.008 * wave(t, 0.4);
  });
  clip('farewell', 'Последние слова', 'Жизнь', 5.0, function (P, t) {
    P.props.bed = 1; P.props.lying = 1; P.rootY = 0.12; P.eyes.open = 0.18 * (1 - t);
    P.breath = (0.5 + 0.5 * wave(t, 0.8)) * (1 - t * 0.7); P.pale = 0.5 + 0.5 * t;
    P.mouth.smile = 0.2; P.fade = t * 0.35;
  });

  /* --- 8. сцена и погода (16) --- */
  clip('fx-rain', 'Дождь', 'Сцена', 3.0, function (P) { P.fx.rain = 1; });
  clip('fx-snow', 'Снег', 'Сцена', 4.0, function (P) { P.fx.snow = 1; });
  clip('fx-sun', 'Солнечные лучи', 'Сцена', 5.0, function (P, t) { P.fx.sun = 0.6 + 0.4 * wave(t, 0.5); });
  clip('fx-wind', 'Ветер в волосах', 'Сцена', 2.6, function (P, t) {
    P.hairFlow = 0.5 + 0.5 * wave(t); P.fx.wind = 1;
  });
  clip('fx-leaves', 'Листья на ветру', 'Сцена', 5.0, function (P) { P.fx.leaves = 1; });
  clip('fx-birds', 'Птицы в небе', 'Сцена', 8.0, function (P, t) { P.fx.birds = t; });
  clip('fx-night', 'Ночь и звёзды', 'Сцена', 10.0, function (P) { P.fx.night = 1; });
  clip('fx-dawn', 'Рассвет', 'Сцена', 8.0, function (P, t) { P.fx.dawn = t; });
  clip('fx-dusk', 'Закат', 'Сцена', 8.0, function (P, t) { P.fx.dusk = t; });
  clip('fx-city', 'Городской поток машин', 'Сцена', 6.0, function (P, t) { P.fx.traffic = t; });
  clip('fx-candle', 'Пламя свечи', 'Сцена', 2.0, function (P, t) { P.fx.candle = 0.7 + 0.3 * wave(t, 3); });
  clip('fx-confetti', 'Конфетти', 'Сцена', 3.0, function (P) { P.fx.confetti = 1; });
  clip('fx-balloons', 'Шарики', 'Сцена', 6.0, function (P, t) { P.fx.balloons = t; });
  clip('fx-fireflies', 'Светлячки', 'Сцена', 7.0, function (P) { P.fx.fireflies = 1; });
  clip('fx-dust', 'Пыль и жара', 'Сцена', 5.0, function (P) { P.fx.dust = 1; });
  clip('fx-smoke', 'Дымка над городом', 'Сцена', 7.0, function (P) { P.fx.haze = 1; });

  /* --- 9. переходы и состояния (10) --- */
  clip('age-morph', 'Прошёл ещё год', 'Переходы', 1.1, function (P, t) {
    P.glow = pulse(t) * 0.5; P.scale = 1 + 0.01 * pulse(t);
  });
  clip('flash', 'Вспышка', 'Переходы', 0.6, function (P, t) { P.flash = 1 - t; });
  clip('shake', 'Встряска', 'Переходы', 0.8, function (P, t) { P.shake = 3 * (1 - t); });
  clip('zoom-in', 'Наезд камеры', 'Переходы', 1.6, function (P, t) { P.zoom = 1 + 0.08 * pulse(t); });
  clip('fade-out', 'Затухание', 'Переходы', 2.4, function (P, t) { P.fade = t; });
  clip('heartbeat', 'Сердцебиение', 'Переходы', 1.2, function (P, t) {
    P.scale = 1 + 0.012 * Math.max(0, wave(t, 2)); P.glow = 0.2 * Math.max(0, wave(t, 2));
  });
  clip('shiver', 'Дрожит от холода', 'Переходы', 2.2, function (P, t) {
    P.shake = 0.8; P.arms.ls = -0.5; P.arms.rs = -0.5; P.arms.le = 1.4; P.arms.re = -1.4;
    P.torso.slouch = 0.35; P.pale = 0.4; P.fx.cold = 1;
  });
  clip('hunger', 'Голод', 'Переходы', 3.6, function (P, t) {
    P.props.handsBelly = 1; P.arms.ls = 1.1; P.arms.rs = 1.1; P.arms.le = 1.3; P.arms.re = -1.3;
    P.torso.slouch = 0.4; P.pale = 0.5; P.brows.sad = 0.6; P.mouth.smile = -0.3;
  });
  clip('fever', 'Жар', 'Переходы', 3.2, function (P, t) {
    P.blush = 0.7; P.sweat = 0.9; P.eyes.open = 0.4; P.props.patch = 1;
    P.breath = 0.5 + 0.5 * wave(t, 1.8); P.head.rot = 0.04 * wave(t, 0.7);
  });
  clip('glow-happy', 'Светится от счастья', 'Переходы', 3.0, function (P, t) {
    P.glow = 0.3 + 0.2 * wave(t, 0.7); P.mouth.smile = Math.max(P.mouth.smile, 0.6); P.fx.sparkle = 1;
  });

  var GROUPS = [];
  CLIPS.forEach(function (c) { if (GROUPS.indexOf(c.group) < 0) GROUPS.push(c.group); });

  /* ====================== выбор клипов по жизни ====================== */

  /* фоновые клипы: возраст, состояние, страна, время года */
  function ambientFor(life) {
    var out = [];
    var a = life.age, st = life.stats;
    out.push(a < 1 ? 'idle-newborn' : a < 3 ? 'idle-baby' : a < 10 ? 'idle-child' :
      a < 18 ? 'idle-teen' : a < 30 ? 'idle-young' : a < 45 ? 'idle-adult' :
        a < 60 ? 'idle-middle' : a < 75 ? 'idle-senior' : 'idle-elder');
    var c = life.c;
    if (c.region === 'eun' || c.region === 'eue' || c.region === 'asc') out.push('fx-snow', 'shiver');
    else if (c.region === 'ass' || c.region === 'asse' || c.region === 'afw') out.push('fx-sun');
    else if (c.region === 'afn' || c.region === 'asw') out.push('fx-dust');
    else out.push('fx-wind');
    if (life.urban) out.push('fx-city'); else out.push('fx-birds');
    if (st.happy > 72) out.push('glow-happy');
    if (st.health < 32) out.push('fever');
    if (life.has('smoker') && a > 16) out.push('smoke');
    if (a >= 75) out.push('lean-cane');
    return out;
  }

  /* по тексту записи в летописи подбираем действие */
  var LOG_MAP = [
    [/перв(ые|ый) шаг|пошли ногами|первое слово/i, 'first-steps'],
    [/пошли в школу|школу|перв(ый|ого) класс/i, 'school-write'],
    [/экзамен|поступ/i, 'exam'],
    [/окончил|диплом|выпуск|университет|колледж/i, 'graduate'],
    [/нашли работу|устроились|наняли|работ[аы]ете|первая работа/i, 'work-desk'],
    [/в поле|урожай|фермер|земл[юе]/i, 'work-field'],
    [/завод|фабрик|цех|стройк/i, 'work-factory'],
    [/повышени|старшим|ведущим|главным|начальник/i, 'promotion'],
    [/перв(ая|ую) зарплат/i, 'first-salary'],
    [/свадьб|женились|вышли замуж|брак/i, 'wedding'],
    [/предложени|помолвк/i, 'propose'],
    [/родился ребёнок|родилась дочь|родился сын|стали родител/i, 'hold-baby'],
    [/внук/i, 'grandchild'],
    [/развод|расстал/i, 'sad'],
    [/умер|похорон|потеряли|не стало/i, 'grieve'],
    [/переезд|переехал|перебрал/i, 'move-boxes'],
    [/за границ|эмигр|другую страну|уехали/i, 'travel-plane'],
    [/сво[её] дело|бизнес|лавк|мастерск|открыли/i, 'open-business'],
    [/дом|квартир|ипотек|жиль/i, 'buy-house'],
    [/больниц|операц|лечени|диагноз|заболе/i, 'hospital'],
    [/травм|перелом|авари|ранени/i, 'injury'],
    [/война|обстрел|бомб|призва/i, 'war-shelter'],
    [/пенси/i, 'retire-bench'],
    [/награ|премия|признани|медал/i, 'award'],
    [/друз|подруж|компани/i, 'laugh'],
    [/влюб|любов|пара|встреча/i, 'hold-hands'],
    [/спорт|бег|трениров/i, 'sport-run'],
    [/курит|сигарет/i, 'smoke'],
    [/выпив|алкогол|бар/i, 'drink'],
    [/голод|недоеда|нечего есть/i, 'hunger'],
    [/книг|читае|библиотек/i, 'read-book'],
    [/огород|сад|посад/i, 'garden'],
    [/помога|волонт|пожертв/i, 'volunteer'],
    [/храм|мечет|церков|молит/i, 'pray'],
    [/телефон|позвонил|написал/i, 'phone-call'],
    [/травл|издева|одиноч/i, 'sob'],
    [/праздник|день рождения|танц/i, 'dance']
  ];

  function clipForLog(entry) {
    for (var i = 0; i < LOG_MAP.length; i++) if (LOG_MAP[i][0].test(entry.text)) return LOG_MAP[i][1];
    if (entry.kind === 'good') return 'smile-wide';
    if (entry.kind === 'bad') return 'frown';
    if (entry.kind === 'family') return 'hold-hands';
    if (entry.kind === 'health') return 'lie-sick';
    if (entry.kind === 'work') return 'work-desk';
    return null;
  }

  /* ========================= сам портрет ============================= */

  function Portrait(canvas, opts) {
    this.canvas = canvas;
    this.ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;
    this.opts = opts || {};
    this.pose = basePose();
    this.tracks = [];            /* фоновые */
    this.action = null;          /* текущее действие */
    this.queue = [];
    this.time = 0;
    this.life = null;
    this.look = null;
    this.scene = 'village';
    this.baseScene = 'village';
    this.dpr = 1;
    this.w = 300; this.h = 340;
    this.particles = [];
    this.playedCount = 0;
    this.lastClip = '';
    this.reduced = typeof matchMedia === 'function' &&
      matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.resize();
  }

  Portrait.prototype.resize = function () {
    var cv = this.canvas;
    if (!cv) return;
    var r = cv.getBoundingClientRect ? cv.getBoundingClientRect() : { width: 300, height: 340 };
    this.w = Math.max(160, Math.round(r.width || cv.width || 300));
    this.h = Math.max(180, Math.round(r.height || cv.height || 340));
    this.dpr = Math.min(2, (window.devicePixelRatio || 1));
    cv.width = Math.round(this.w * this.dpr);
    cv.height = Math.round(this.h * this.dpr);
  };

  Portrait.prototype.setLife = function (life) {
    this.life = life;
    this.look = lookFor(life);
    this.scene = sceneFor(life);
    this.baseScene = this.scene;
    this.setAmbient(ambientFor(life));
    this.particles = [];
    return this;
  };

  Portrait.prototype.setAmbient = function (ids) {
    var self = this;
    this.tracks = ids.map(function (id) {
      var c = BY_ID[id];
      if (!c) return null;
      return { clip: c, t: Math.random() * c.dur };
    }).filter(Boolean);
    void self;
  };

  Portrait.prototype.play = function (id, opts) {
    if (CLIP_SCENE[id]) this.scene = CLIP_SCENE[id];
    var c = BY_ID[id];
    if (!c) return false;
    opts = opts || {};
    if (this.action && opts.soft) { this.queue.push(id); return true; }
    this.action = { clip: c, t: 0 };
    this.lastClip = id;
    this.playedCount++;
    return true;
  };

  /* реакция на прожитый год: морф возраста + событие из летописи */
  Portrait.prototype.syncYear = function (life, freshEntries) {
    this.baseScene = sceneFor(life);
    if (!this.action) this.scene = this.baseScene;
    this.setLife(life);
    this.play('age-morph');
    var best = null;
    (freshEntries || []).forEach(function (e) {
      var id = clipForLog(e);
      if (id && !best) best = id;
    });
    if (!best) {
      var a = life.age;
      if (a < 1) best = 'idle-newborn';
      else if (a === 1) best = 'first-steps';
      else if (a < 4) best = 'crawl';
      else if (a < 7) best = 'play-kid';
      else if (life.edu.inSchool) best = Math.random() < 0.5 ? 'school-write' : 'read-book';
      else if (life.job) best = jobClip(life);
      else if (life.retired) best = 'retire-bench';
      else if (life.children.length && life.age - life.lastChildAge < 6) best = 'play-kid';
      else best = ['walk', 'look-around', 'stretch', 'think', 'phone-call'][Math.floor(Math.random() * 5)];
    }
    this.queue.push(best);
    if (!life.alive) { this.action = null; this.queue = []; this.play('farewell'); }
    return best;
  };

  function jobClip(life) {
    var j = M.jobById[life.job.id] || {};
    var s = j.sector || '';
    if (s === 'agri') return 'work-field';
    if (s === 'manual' || s === 'skilled') return 'work-factory';
    if (s === 'informal' || s === 'service') return 'work-trade';
    if (s === 'elite') return 'work-desk';
    return 'work-desk';
  }

  /* некоторые события происходят не там, где человек работает */
  var CLIP_SCENE = {
    wedding: 'park', 'first-kiss': 'park', dance: 'room', 'hold-hands': 'park',
    birth: 'hospital', 'hold-baby': 'room', 'teach-kid': 'room', 'family-dinner': 'room',
    hospital: 'hospital', 'take-pill': 'room', surgery: 'hospital', injury: 'hospital',
    funeral: 'night', grief: 'night', 'say-goodbye': 'night', war: 'night',
    'buy-house': 'village', move: 'city', travel: 'city', 'open-business': 'city',
    graduate: 'school', exam: 'school', 'school-write': 'school', 'read-book': 'room',
    'work-field': 'field', 'work-factory': 'factory', 'work-desk': 'office',
    retire: 'park', 'walk-park': 'park', sleep: 'room', 'wake-up': 'room',
    'count-money': 'room', pray: 'room', 'plant-tree': 'village', volunteer: 'city'
  };

  function sceneFor(life) {
    if (!life.alive) return 'night';
    if (life.has('hospital')) return 'hospital';
    if (life.age < 6) return life.urban ? 'room' : 'village';
    if (life.edu.inSchool) return 'school';
    if (life.job) {
      var j = M.jobById[life.job.id] || {};
      if (j.sector === 'agri') return 'field';
      if (j.sector === 'manual' || j.sector === 'skilled') return 'factory';
      return life.urban ? 'office' : 'village';
    }
    if (life.retired) return 'park';
    return life.urban ? 'city' : 'village';
  }

  /* -------------------------- расчёт кадра --------------------------- */

  Portrait.prototype.tick = function (dtMs) {
    var dt = Math.min(100, dtMs) / 1000;
    this.time += dt;
    var P = basePose();
    var S = { life: this.life, look: this.look, time: this.time, dt: dt };

    for (var i = 0; i < this.tracks.length; i++) {
      var tr = this.tracks[i];
      tr.t = (tr.t + dt) % tr.clip.dur;
      try { tr.clip.fn(P, tr.t / tr.clip.dur, S); } catch (e) { /* клип не должен ронять игру */ }
    }
    if (this.action) {
      this.action.t += dt;
      var tt = this.action.t / this.action.clip.dur;
      if (tt >= 1) {
        this.action = null;
        this.scene = this.baseScene || this.scene;
        if (this.queue.length) this.play(this.queue.shift());
      } else {
        try { this.action.clip.fn(P, tt, S); } catch (e2) { /* ignore */ }
      }
    } else if (this.queue.length) {
      this.play(this.queue.shift());
    }
    this.pose = P;
    this.render();
  };

  Portrait.prototype.currentName = function () {
    var c = this.action ? this.action.clip : null;
    return c ? c.name : '—';
  };

  /* ====================== ПИКСЕЛЬНАЯ ОТРИСОВКА ========================
     Как в оригинале «1 из 8 миллиардов»: сцена и люди — пиксель-арт.
     Внутри холста своя сетка крупных пикселей, всё рисуется целыми
     прямоугольниками, сглаживание выключено. Никаких картинок-файлов:
     каждый дом, дерево и человек собираются из пикселей по ходу игры. */

  function px(g, x, y, w, h, c) {
    w = Math.round(w); h = Math.round(h);
    if (w <= 0 || h <= 0) return;
    g.fillStyle = c;
    g.fillRect(Math.round(x), Math.round(y), w, h);
  }

  /* строка «через пиксель»: мягкая граница двух цветов */
  function dith(g, x, y, w, c, off) {
    g.fillStyle = c;
    for (var i = (off || 0) % 2; i < w; i += 2) g.fillRect(Math.round(x + i), Math.round(y), 1, 1);
  }

  /* детерминированный шум: тот же кадр — те же окна и кусты */
  function nz(i) {
    var x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
    return x - Math.floor(x);
  }

  var SKYP = {
    day: ['#44708f', '#5a8aa6', '#76a6bb', '#95c0cb'],
    dawn: ['#2b3157', '#56426c', '#9a5c76', '#d68f6b'],
    dusk: ['#222847', '#423864', '#7a4a62', '#b86d55'],
    night: ['#0a0f1e', '#101828', '#172238', '#202e49']
  };
  var WALLP = {
    room: ['#3b2f25', '#4a3b2e', '#574735'],
    school: ['#2b3a33', '#36483e', '#415549'],
    office: ['#2a3340', '#35404f', '#404d5e'],
    hospital: ['#2b3a3c', '#38494b', '#44585a'],
    factory: ['#322a25', '#3f3631', '#4b413a']
  };
  var INDOOR = { room: 1, school: 1, office: 1, hospital: 1, factory: 1 };
  /* обои жилой комнаты: у каждой жизни свои */
  var HOMEP = [
    ['#3b2f25', '#4a3b2e', '#574735'],   /* тёплое дерево */
    ['#2e3540', '#3a4350', '#46515f'],   /* серо-синий */
    ['#33382c', '#404636', '#4c5341'],   /* оливковый */
    ['#3d2f30', '#4c3b3c', '#5a4749'],   /* бордовый */
    ['#2f3a3a', '#3b4848', '#475656'],   /* бирюзовый */
    ['#423525', '#52422e', '#60503a']    /* охра */
  ];

  /* достаток дома: 0 бедно · 1 средне · 2 хорошо */
  function homeTier(V) {
    var life = V.life;
    if (!life) return 1;
    var inc = life.income || life.famIncome || 0;
    var gdp = (life.c && life.c.gdp) || 12000;
    var r = inc / Math.max(gdp * 0.6, 1200);
    if (life.home) r += 0.35;
    if (r < 0.55 || inc < 2200) return 0;
    if (r > 1.5 && inc > 11000) return 2;
    return 1;
  }

  function skyKey(P) {
    if (P.fx.night) return 'night';
    if (P.fx.dawn) return 'dawn';
    if (P.fx.dusk) return 'dusk';
    return 'day';
  }

  /* ---------------------------- отрисовка ---------------------------- */

  Portrait.prototype.render = function () {
    var g = this.ctx;
    if (!g) return;
    var W = this.w, H = this.h, P = this.pose;
    var life = this.life, look = this.look;
    g.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    g.clearRect(0, 0, W, H);
    if (!life || !look) return;

    /* размер «крупного пикселя»: сцена всегда примерно 190×95 клеток */
    var s = Math.max(2, Math.floor(Math.min(W / 190, H / 95)));
    var bw = Math.ceil(W / s), bh = Math.ceil(H / s);
    var sh = P.shake ? Math.round((Math.random() - 0.5) * P.shake * 2) : 0;

    g.imageSmoothingEnabled = false;
    g.setTransform(this.dpr * s, 0, 0, this.dpr * s, 0, 0);
    g.translate(sh, 0);

    var scene = this.scene || 'village';
    var V = {
      w: bw, h: bh, gy: Math.round(bh * 0.78), t: this.time, P: P, life: life,
      look: look, pt: this, scene: scene,
      sky: scene === 'night' ? 'night' : skyKey(P), indoor: !!INDOOR[scene],
      zoom: P.zoom || 1
    };
    if (V.indoor) V.gy = Math.round(bh * 0.84);

    drawBackdrop(g, V);
    (PLACE[scene] || placeVillage)(g, V);
    drawGround(g, V);
    drawCrowd(g, V);
    drawFore(g, V);
    drawFx(g, V);

    g.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    if (P.flash > 0.01) {
      g.fillStyle = 'rgba(255,245,220,' + (P.flash * 0.6).toFixed(3) + ')';
      g.fillRect(0, 0, W, H);
    }
    if (P.fade > 0.01) {
      g.fillStyle = 'rgba(6,8,7,' + Math.min(0.92, P.fade).toFixed(3) + ')';
      g.fillRect(0, 0, W, H);
    }
    g.strokeStyle = 'rgba(232,180,90,0.16)';
    g.lineWidth = 1;
    g.strokeRect(0.5, 0.5, W - 1, H - 1);
  };

  /* ------------------------- небо или стена -------------------------- */

  function drawBackdrop(g, V) {
    var w = V.w, h = V.h;
    if (V.indoor) {
      var wp = WALLP[V.scene] || WALLP.room;
      if (V.scene === 'room' && V.life) wp = HOMEP[hashStr(V.life.seed + 'home') % HOMEP.length];
      px(g, 0, 0, w, V.gy, wp[1]);
      px(g, 0, 0, w, Math.round(V.gy * 0.38), wp[2]);
      dith(g, 0, Math.round(V.gy * 0.38), w, wp[2]);
      /* обойная полоса (в бедном доме стены голые) */
      var tier = V.scene === 'room' ? homeTier(V) : 1;
      if (tier > 0) for (var i = 0; i < w; i += 6) px(g, i, 0, 1, Math.round(V.gy * 0.38), 'rgba(255,255,255,0.03)');
      if (V.scene === 'room' && tier === 0) {
        for (var cr = 0; cr < 5; cr++) {
          var cx2 = Math.round(nz(cr + 4) * w), cy2 = Math.round(nz(cr + 14) * V.gy * 0.5);
          px(g, cx2, cy2, 1, 3 + Math.round(nz(cr) * 4), 'rgba(0,0,0,0.18)');
        }
      }
      /* панель и плинтус */
      px(g, 0, Math.round(V.gy * 0.62), w, V.gy - Math.round(V.gy * 0.62), shade(wp[0], 0.05));
      px(g, 0, Math.round(V.gy * 0.62), w, 1, shade(wp[2], 0.1));
      px(g, 0, V.gy - 2, w, 2, shade(wp[0], -0.2));
      return;
    }
    var pal = SKYP[V.sky];
    var band = Math.ceil(V.gy / 4);
    for (var i = 0; i < 4; i++) {
      px(g, 0, i * band, w, band, pal[i]);
      if (i) dith(g, 0, i * band, w, pal[i - 1], i);
    }
    /* солнце, луна, звёзды */
    var sx = Math.round(w * 0.78), sy = Math.round(V.gy * 0.24);
    if (V.sky === 'night') {
      for (var k = 0; k < 26; k++) {
        var stx = Math.round(nz(k) * w), sty = Math.round(nz(k + 50) * V.gy * 0.6);
        px(g, stx, sty, 1, 1, nz(k + 90) > 0.6 ? '#e8eef7' : '#9fb3cc');
      }
      px(g, sx, sy, 5, 5, '#e9edf2');
      px(g, sx + 3, sy - 1, 3, 4, SKYP.night[0]);
    } else {
      var sun = V.sky === 'day' ? '#f7e3a8' : '#f2b276';
      px(g, sx, sy, 6, 6, sun);
      px(g, sx - 1, sy + 1, 1, 4, sun);
      px(g, sx + 6, sy + 1, 1, 4, sun);
      px(g, sx + 1, sy - 1, 4, 1, sun);
      px(g, sx + 1, sy + 6, 4, 1, sun);
    }
    /* облака */
    if (V.sky !== 'night') {
      for (var c = 0; c < 3; c++) {
        var cx = Math.round(((nz(c + 7) * w) + V.t * (3 + c)) % (w + 40)) - 20;
        var cy = Math.round(6 + nz(c + 11) * V.gy * 0.3);
        pxCloud(g, cx, cy, 8 + Math.round(nz(c + 3) * 7), V.sky === 'day' ? '#cfe2ea' : '#d8b49a');
      }
    }
  }

  function pxCloud(g, x, y, w, c) {
    px(g, x, y + 2, w, 3, c);
    px(g, x + 2, y, Math.round(w * 0.5), 2, c);
    px(g, x + Math.round(w * 0.6), y + 1, Math.round(w * 0.3), 2, c);
  }

  /* --------------------------- земля и пол --------------------------- */

  var GROUND = {
    village: ['#3c5a33', '#32492b', '#6b5637'],
    city: ['#2b2f36', '#23272d', '#3a3f47'],
    night: ['#23272d', '#1c2026', '#30353c'],
    field: ['#4a5f2c', '#3d4f25', '#6f5a36'],
    park: ['#37562f', '#2d4728', '#5f4f33'],
    room: ['#5a3f28', '#4a3320', '#6b4c2f'],
    school: ['#4a4438', '#3c382e', '#574f41'],
    office: ['#3a3f46', '#2f343a', '#464c54'],
    hospital: ['#50595c', '#424a4d', '#5c6669'],
    factory: ['#3a342f', '#2e2a26', '#463f38']
  };

  function drawGround(g, V) {
    var gp = GROUND[V.scene] || GROUND.village;
    var w = V.w, gy = V.gy;
    px(g, 0, gy, w, V.h - gy, gp[1]);
    px(g, 0, gy, w, 2, gp[0]);
    dith(g, 0, gy + 2, w, gp[0]);
    if (V.scene === 'room' || V.scene === 'school' || V.scene === 'office') {
      px(g, 0, gy + 2, w, 1, gp[2]);
      for (var i = 0; i < w; i += 11) px(g, i + ((i / 11) % 2 ? 5 : 0), gy + 3, 1, V.h - gy - 3, shade(gp[1], -0.1));
      px(g, 0, gy + Math.round((V.h - gy) * 0.6), w, 1, shade(gp[1], -0.08));
    } else if (V.scene === 'hospital') {
      for (var j = 0; j < w; j += 7) px(g, j, gy + 3, 1, V.h - gy - 3, gp[2]);
      px(g, 0, gy + 5, w, 1, gp[2]);
    } else if (V.scene === 'city' || V.scene === 'night') {
      px(g, 0, gy + 5, w, 1, gp[2]);                  /* бордюр */
      for (var k = 4; k < w; k += 14) px(g, k, gy + 9, 6, 1, '#6f7681'); /* разметка */
    } else if (V.scene === 'field') {
      for (var m = 0; m < w; m += 5) px(g, m, gy + 3, 3, 1, gp[2]);
    } else {
      for (var n = 0; n < w; n += 6) px(g, n + (n % 12 ? 0 : 2), gy + 3, 2, 1, gp[2]);
    }
  }

  /* --------------------------- элементы сцен ------------------------- */

  function pxBuilding(g, x, y, w, h, body, dark, lit, seed) {
    px(g, x, y, w, h, body);
    px(g, x + w - 2, y, 2, h, dark);
    px(g, x, y, w, 1, '#ffffff10');
    for (var wy = y + 3; wy < y + h - 3; wy += 5) {
      for (var wx = x + 2; wx < x + w - 4; wx += 5) {
        var on = nz(seed + wx * 7 + wy * 13) < lit;
        px(g, wx, wy, 2, 3, on ? '#f0c878' : '#20252c');
      }
    }
  }

  function pxHouse(g, x, gy, w, col, roof, night) {
    var h = Math.round(w * 0.66);
    px(g, x, gy - h, w, h, col);
    px(g, x, gy - h, w, 1, shade(col, 0.12));
    /* крыша «ступеньками» */
    var half = Math.ceil(w / 2);
    for (var i = 0; i < half; i++) {
      px(g, x + i, gy - h - i - 1, w - i * 2, 1, roof);
    }
    px(g, x + Math.round(w * 0.3), gy - Math.round(h * 0.6), 3, 3, night ? '#f2c972' : '#2b3038');
    px(g, x + Math.round(w * 0.62), gy - Math.round(h * 0.45), 3, Math.round(h * 0.45), '#3a2c20');
  }

  function pxTree(g, x, gy, h, night) {
    var leaf = night ? '#1d3524' : '#2f5c33', leaf2 = night ? '#25422b' : '#3e7540';
    px(g, x, gy - Math.round(h * 0.35), 2, Math.round(h * 0.35), '#4a3524');
    var cw = Math.round(h * 0.7);
    px(g, x - Math.round(cw / 2) + 1, gy - h, cw, Math.round(h * 0.45), leaf);
    px(g, x - Math.round(cw / 2) + 2, gy - h - 2, cw - 2, 3, leaf);
    px(g, x - Math.round(cw / 2) + 2, gy - h + 1, Math.round(cw * 0.5), 2, leaf2);
  }

  function pxBush(g, x, gy, w, night) {
    var c = night ? '#1f3a26' : '#36632f';
    px(g, x, gy - 3, w, 3, c);
    px(g, x + 1, gy - 5, w - 2, 2, c);
  }

  function pxLamp(g, x, gy, h, night) {
    px(g, x, gy - h, 1, h, '#3b4049');
    px(g, x - 1, gy - h - 2, 3, 2, '#4b525c');
    if (night) {
      px(g, x - 1, gy - h - 1, 3, 1, '#f5d98a');
      for (var r = 1; r < 5; r++) {
        px(g, x - r, gy - h + r * 2, r * 2 + 1, 1, 'rgba(245,217,138,' + (0.1 - r * 0.018).toFixed(3) + ')');
      }
    }
  }

  /* ------------------------------ места ------------------------------ */

  function placeVillage(g, V) {
    var night = V.sky === 'night', gy = V.gy, w = V.w;
    /* дальние холмы */
    var hc = night ? '#1b2a22' : '#33502f';
    for (var x = 0; x < w; x++) {
      var hh = 6 + Math.round(Math.sin(x * 0.06) * 3 + Math.sin(x * 0.021) * 4);
      px(g, x, gy - hh, 1, hh, hc);
    }
    pxHouse(g, Math.round(w * 0.08), gy, 22, night ? '#3a3228' : '#5a4c3a', night ? '#2a2119' : '#6e4433', night);
    pxHouse(g, Math.round(w * 0.72), gy, 16, night ? '#352e26' : '#524636', night ? '#241d16' : '#63402f', night);
    pxTree(g, Math.round(w * 0.38), gy, 18, night);
    pxTree(g, Math.round(w * 0.9), gy, 14, night);
    pxBush(g, Math.round(w * 0.55), gy, 7, night);
    /* забор */
    for (var f = Math.round(w * 0.2); f < w * 0.34; f += 3) px(g, f, gy - 5, 1, 5, '#55442f');
    px(g, Math.round(w * 0.2), gy - 4, Math.round(w * 0.14), 1, '#55442f');
  }

  function placeCity(g, V) {
    var night = V.sky === 'night' || V.scene === 'night', gy = V.gy, w = V.w;
    var body = night ? '#1b2129' : '#39424e', dark = night ? '#141a21' : '#2d353f';
    var seed = 3;
    for (var x = -4; x < w; x += 0) {
      var bw2 = 13 + Math.round(nz(seed) * 11);
      var bh2 = 26 + Math.round(nz(seed + 30) * 34);
      pxBuilding(g, x, gy - bh2, bw2, bh2, body, dark, night ? 0.55 : 0.18, seed * 17);
      x += bw2 + 1;
      seed++;
    }
    pxLamp(g, Math.round(w * 0.22), gy, 16, night);
    pxLamp(g, Math.round(w * 0.78), gy, 16, night);
    /* машина проезжает */
    var cx = Math.round((V.t * 16) % (w + 30)) - 15;
    px(g, cx, gy + 6, 11, 4, '#8a4a52');
    px(g, cx + 2, gy + 3, 6, 3, '#9c5a60');
    px(g, cx + 1, gy + 10, 2, 1, '#1a1d22');
    px(g, cx + 8, gy + 10, 2, 1, '#1a1d22');
    px(g, cx + 11, gy + 7, 1, 1, '#f2d78a');
  }

  function placeField(g, V) {
    var night = V.sky === 'night', gy = V.gy, w = V.w;
    var hc = night ? '#243018' : '#48622c';
    for (var x = 0; x < w; x++) {
      var hh = 4 + Math.round(Math.sin(x * 0.04) * 3 + 3);
      px(g, x, gy - hh, 1, hh, hc);
    }
    pxTree(g, Math.round(w * 0.12), gy, 15, night);
    /* ряды посевов */
    for (var i = 0; i < w; i += 11) {
      var sway = Math.round(Math.sin(V.t * 2 + i * 0.3) * 1);
      px(g, i + sway, gy - 3, 1, 3, night ? '#3b4a22' : '#79903a');
      px(g, i + sway - 1, gy - 4, 3, 1, night ? '#445527' : '#93a948');
    }
  }

  function placePark(g, V) {
    var night = V.sky === 'night', gy = V.gy, w = V.w;
    for (var x = 0; x < w; x++) px(g, x, gy - 5 - Math.round(Math.sin(x * 0.05) * 2), 1, 7, night ? '#1d3323' : '#33552c');
    pxTree(g, Math.round(w * 0.14), gy, 22, night);
    pxTree(g, Math.round(w * 0.86), gy, 19, night);
    pxBush(g, Math.round(w * 0.3), gy, 8, night);
    pxLamp(g, Math.round(w * 0.64), gy, 14, night);
    /* пруд */
    px(g, Math.round(w * 0.42), gy + 4, 26, 4, night ? '#1b2a3a' : '#3a6a86');
    px(g, Math.round(w * 0.44), gy + 5, 10, 1, night ? '#24384c' : '#5d8fa8');
    /* скамейка */
    var bx = Math.round(w * 0.2);
    px(g, bx, gy - 5, 14, 2, '#5a4530');
    px(g, bx, gy - 9, 14, 2, '#644d35');
    px(g, bx + 1, gy - 5, 1, 5, '#42311f');
    px(g, bx + 12, gy - 5, 1, 5, '#42311f');
  }

  function placeRoom(g, V) {
    var gy = V.gy, w = V.w;
    /* окно с видом на улицу */
    var wx = Math.round(w * 0.08), wy = Math.round(gy * 0.2), ww = 26, wh = 20;
    px(g, wx - 1, wy - 1, ww + 2, wh + 2, '#6b5134');
    px(g, wx, wy, ww, wh, V.sky === 'night' ? '#101828' : '#5a8aa6');
    if (V.sky === 'night') {
      for (var s2 = 0; s2 < 6; s2++) px(g, wx + 2 + Math.round(nz(s2) * (ww - 4)), wy + 2 + Math.round(nz(s2 + 9) * (wh - 4)), 1, 1, '#dde6f2');
    } else {
      px(g, wx, wy + wh - 6, ww, 6, '#3f6b3a');
    }
    px(g, wx + Math.round(ww / 2), wy, 1, wh, '#6b5134');
    px(g, wx, wy + Math.round(wh / 2), ww, 1, '#6b5134');
    /* картина и лампа */
    px(g, Math.round(w * 0.46), Math.round(gy * 0.22), 12, 9, '#6b5134');
    px(g, Math.round(w * 0.46) + 1, Math.round(gy * 0.22) + 1, 10, 7, '#3c5d6b');
    px(g, Math.round(w * 0.62), 0, 1, 8, '#46403a');
    px(g, Math.round(w * 0.62) - 3, 8, 7, 4, '#c9a45c');
    px(g, Math.round(w * 0.62) - 4, 12, 9, 1, 'rgba(240,210,140,0.35)');
    /* дверь */
    var dx = Math.round(w * 0.86);
    px(g, dx, gy - 26, 14, 26, '#4a3625');
    px(g, dx + 1, gy - 25, 12, 25, '#5b442e');
    px(g, dx + 11, gy - 13, 1, 2, '#c9a45c');
    /* полка с книгами */
    var shx = Math.round(w * 0.36);
    px(g, shx, Math.round(gy * 0.5), 20, 1, '#6b5134');
    for (var b2 = 0; b2 < 7; b2++) {
      px(g, shx + 1 + b2 * 3, Math.round(gy * 0.5) - 4 - (b2 % 2), 2, 4 + (b2 % 2),
        ['#8c4a3a', '#3f6b6b', '#6b5a8c', '#7a6a3a'][b2 % 4]);
    }
    /* спальное место: матрас на полу — в бедном доме, кровать — дальше */
    var tier = homeTier(V);
    var bx = Math.round(w * 0.6);
    if (tier === 0) {
      px(g, bx, gy - 4, 30, 4, '#6b5a46');
      px(g, bx, gy - 6, 10, 2, '#cfd6d8');
    } else {
      px(g, bx, gy - 7, 30, 7, '#5a4530');
      px(g, bx, gy - 10, 30, 3, tier === 2 ? '#3f6b5e' : '#4a6b7a');
      px(g, bx, gy - 13, 9, 4, '#dfe6ea');
      px(g, bx + 29, gy - 14, 2, 14, '#42311f');
    }
    /* ковёр — только если дом не совсем бедный */
    if (tier > 0) {
      px(g, Math.round(w * 0.26), gy + 4, 46, 3, tier === 2 ? '#6b4a7a' : '#7a4038');
      px(g, Math.round(w * 0.26) + 2, gy + 5, 42, 1, tier === 2 ? '#8c66a0' : '#9c5a4a');
    }
    /* в достатке появляются телевизор и цветок */
    if (tier === 2) {
      var tx = Math.round(w * 0.16);
      px(g, tx, gy - 12, 16, 10, '#23282c');
      px(g, tx + 1, gy - 11, 14, 8, V.sky === 'night' ? '#4a6b8c' : '#38505e');
      px(g, tx + 2, gy - 10, 5, 2, 'rgba(255,255,255,0.18)');
      px(g, tx + 5, gy - 2, 6, 2, '#3a3a3a');
      var fx3 = Math.round(w * 0.3);
      px(g, fx3, gy - 5, 5, 5, '#8c5a3a');
      px(g, fx3 + 1, gy - 10, 3, 5, '#3f7a4a');
      px(g, fx3 - 1, gy - 9, 2, 2, '#4a8c56');
      px(g, fx3 + 4, gy - 11, 2, 2, '#4a8c56');
    }
  }

  function placeSchool(g, V) {
    var gy = V.gy, w = V.w;
    var bx = Math.round(w * 0.12), by = Math.round(gy * 0.18), bw2 = Math.round(w * 0.42), bh2 = Math.round(gy * 0.46);
    px(g, bx - 1, by - 1, bw2 + 2, bh2 + 2, '#3a3026');
    px(g, bx, by, bw2, bh2, '#1f3329');
    for (var i = 0; i < 3; i++) px(g, bx + 4, by + 5 + i * 5, Math.round(bw2 * (0.6 - i * 0.12)), 1, '#cfd8c8');
    /* карта на стене */
    px(g, Math.round(w * 0.66), by, 24, 16, '#4a5a4a');
    px(g, Math.round(w * 0.68), by + 3, 8, 5, '#7fa06a');
    px(g, Math.round(w * 0.78), by + 6, 7, 6, '#7fa06a');
    /* парты */
    for (var d = 0; d < 3; d++) {
      var dx = Math.round(w * (0.08 + d * 0.3));
      px(g, dx, gy - 8, 18, 2, '#6b4a2f');
      px(g, dx + 1, gy - 6, 2, 6, '#4f3621');
      px(g, dx + 15, gy - 6, 2, 6, '#4f3621');
    }
  }

  function placeOffice(g, V) {
    var gy = V.gy, w = V.w;
    var wx = Math.round(w * 0.58), wy = Math.round(gy * 0.16), ww = Math.round(w * 0.34), wh = Math.round(gy * 0.5);
    px(g, wx - 1, wy - 1, ww + 2, wh + 2, '#343c47');
    px(g, wx, wy, ww, wh, V.sky === 'night' ? '#121a2a' : '#577e9c');
    for (var b = 0; b < 5; b++) {
      var bh2 = 6 + Math.round(nz(b + 4) * (wh - 8));
      px(g, wx + 2 + b * Math.round(ww / 5), wy + wh - bh2, Math.round(ww / 5) - 2, bh2, V.sky === 'night' ? '#1b2533' : '#43596d');
    }
    px(g, wx + Math.round(ww / 2), wy, 1, wh, '#343c47');
    /* перегородка и стол */
    px(g, 0, Math.round(gy * 0.52), Math.round(w * 0.42), gy - Math.round(gy * 0.52), '#3f4a57');
    px(g, 0, Math.round(gy * 0.52), Math.round(w * 0.42), 1, '#525e6b');
    px(g, Math.round(w * 0.06), gy - 10, 34, 2, '#5a6470');
    px(g, Math.round(w * 0.07), gy - 8, 2, 8, '#454e58');
    px(g, Math.round(w * 0.06) + 31, gy - 8, 2, 8, '#454e58');
    /* растение */
    px(g, Math.round(w * 0.52), gy - 6, 5, 6, '#7a4a32');
    px(g, Math.round(w * 0.52) + 1, gy - 11, 3, 5, '#3f7a44');
  }

  function placeFactory(g, V) {
    var gy = V.gy, w = V.w;
    px(g, 0, Math.round(gy * 0.1), w, 3, '#4a423a');
    for (var p = 0; p < 5; p++) px(g, Math.round(w * (0.1 + p * 0.2)), Math.round(gy * 0.13), 2, Math.round(gy * 0.2), '#564c42');
    /* станки */
    for (var m = 0; m < 3; m++) {
      var mx = Math.round(w * (0.04 + m * 0.42));
      px(g, mx, gy - 16, 26, 16, '#4b443c');
      px(g, mx + 2, gy - 13, 22, 6, '#2f2a26');
      px(g, mx + 4, gy - 11, 4, 2, nz(m + Math.floor(V.t * 2)) > 0.5 ? '#e8b45a' : '#6b5a3a');
      px(g, mx + 20, gy - 20, 3, 4, '#564c42');
    }
    /* конвейер */
    px(g, 0, gy - 4, w, 2, '#5b5248');
    var bx = Math.round((V.t * 10) % 20);
    for (var c = -20; c < w; c += 20) px(g, c + bx, gy - 7, 6, 3, '#7a6a52');
  }

  function placeHospital(g, V) {
    var gy = V.gy, w = V.w;
    px(g, 0, Math.round(gy * 0.52), w, 1, '#56686b');
    var wx = Math.round(w * 0.62), wy = Math.round(gy * 0.16);
    px(g, wx - 1, wy - 1, 28, 20, '#56686b');
    px(g, wx, wy, 26, 18, V.sky === 'night' ? '#0f1726' : '#6b97ad');
    /* койка — ровно там, где лежит человек */
    var bx = Math.round(w * 0.5) - 22;
    px(g, bx, gy - 10, 44, 4, '#c9d4d6');
    px(g, bx, gy - 12, 12, 2, '#e4ebec');
    px(g, bx, gy - 6, 2, 6, '#8c989a');
    px(g, bx + 42, gy - 6, 2, 6, '#8c989a');
    px(g, bx + 42, gy - 18, 2, 8, '#8c989a');
    /* тумбочка */
    px(g, Math.round(w * 0.2), gy - 8, 10, 8, '#6b7577');
    px(g, Math.round(w * 0.2) + 2, gy - 11, 3, 3, '#cfd8da');
    /* монитор */
    px(g, Math.round(w * 0.44), gy - 24, 10, 8, '#2b3436');
    px(g, Math.round(w * 0.44) + 1, gy - 23, 8, 6, '#15342c');
    px(g, Math.round(w * 0.44) + 2, gy - 20, 6, 1, '#4fd08a');
  }

  var PLACE = {
    village: placeVillage, city: placeCity, night: placeCity, field: placeField,
    park: placePark, room: placeRoom, school: placeSchool, office: placeOffice,
    factory: placeFactory, hospital: placeHospital
  };

  /* --------------------------- люди на сцене -------------------------- */

  function hairStyleNow(look, life, age) {
    if (look.covered) return 'scarf';
    if (age < 2) return 'baby';
    if (life.sex === 'm' && look.balding && age > 46) return 'bald';
    return look.hairStyle || 'short';
  }

  /* внешность в пиксельном виде */
  function spriteOf(V, age, sex, look, isHero) {
    var H = pxHeight(age);
    return {
      h: H, age: age, sex: sex,
      skin: look.skin, hair: look.hair, style: hairStyleNow(look, { sex: sex }, age),
      cloth: look.cloth, cloth2: look.cloth2, shoe: look.shoes || '#2b2723',
      dress: look.dress, covered: look.covered, scarf: look.scarfCol,
      beard: sex === 'm' && age > 17 ? look.facial : 'none',
      gray: age > 45 ? clamp((age - 45) / 40, 0, 1) : 0,
      hero: !!isHero
    };
  }

  function pxHeight(age) {
    if (age < 1) return 9;
    if (age < 3) return 14;
    if (age < 8) return 20;
    if (age < 13) return 25;
    if (age < 18) return 30;
    if (age < 60) return 34;
    if (age < 75) return 33;
    return 31;
  }

  /* родные вокруг: в детстве — родители и братья, потом — своя семья */
  function familyOf(V) {
    var life = V.life, out = [], age = life.age;
    var rnd = function (k) { return nz(hashStr(life.seed + k)); };
    if (age < 19 && life.parentsAlive > 0) {
      out.push({ who: 'мать', age: momAge(life) + age, sex: 'f', tint: 0.1 });
      if (life.parentsAlive > 1) out.push({ who: 'отец', age: dadAge(life) + age, sex: 'm', tint: -0.08 });
      for (var s = 0; s < Math.min(3, life.siblings); s++) {
        out.push({ who: 'брат или сестра', age: Math.max(1, age + (s % 2 ? 2 : -2) + Math.round(rnd(s) * 3)), sex: rnd(s + 9) > 0.5 ? 'f' : 'm', tint: 0.18 + s * 0.05 });
      }
    } else {
      if (life.partner) out.push({ who: 'супруг', age: partnerAge(life), sex: life.sex === 'f' ? 'm' : 'f', tint: 0.12 });
      for (var k = 0; k < Math.min(3, life.children.length); k++) {
        var kid = life.children[k];
        var kAge = Math.max(0, age - (kid.bornAt || kid.born || age));
        out.push({ who: 'ребёнок', age: kAge, sex: kid.sex || (rnd(k + 3) > 0.5 ? 'f' : 'm'), tint: 0.2 + k * 0.06 });
      }
      if (!life.partner && !life.children.length && age < 40 && life.parentsAlive > 0) {
        out.push({ who: 'мать', age: momAge(life) + age, sex: 'f', tint: 0.1 });
      }
    }
    return out;
  }

  function partnerAge(life) {
    if (!life.partner) return life.age;
    var since = life.partner.since != null ? life.partner.since : life.age;
    return (life.partner.age || life.age) + Math.max(0, life.age - since);
  }

  /* те же числа, что и на картинке, — для подписи под сценой */
  function familyInfo(life) {
    var out = { mom: null, dad: null, siblings: life.siblings || 0, partner: null, kids: [] };
    if (life.parentsAlive > 0) out.mom = momAge(life) + life.age;
    if (life.parentsAlive > 1) out.dad = dadAge(life) + life.age;
    if (life.partner) out.partner = { name: life.partner.name, age: partnerAge(life) };
    (life.children || []).forEach(function (k) {
      out.kids.push({ name: k.name, age: Math.max(0, life.age - (k.bornAt || 0)) });
    });
    return out;
  }

  function hashStr(str) {
    var h = 2166136261, s = String(str);
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = (h * 16777619) >>> 0; }
    return h >>> 0;
  }
  function momAge(life) { return 20 + (hashStr(life.seed + 'mom') % 12); }
  function dadAge(life) { return 22 + (hashStr(life.seed + 'dad') % 13); }

  function drawCrowd(g, V) {
    var P = V.P, life = V.life, look = V.look;
    var gy = V.gy + Math.round((P.rootY || 0) * V.h);
    var hx = Math.round(V.w * (0.5 + (P.rootX || 0)) - 4);
    var hero = spriteOf(V, life.age, life.sex, look, true);

    /* родные стоят рядом, чуть позади: сначала справа, потом слева */
    var fam = familyOf(V);
    var gap = Math.max(16, Math.round(hero.h * 0.7));
    var side = 1, off = gap;
    for (var i = 0; i < fam.length; i++) {
      var f = fam[i];
      var key = hashStr(life.seed + f.who + i);
      var fl = {
        skin: shade(look.skin, ((key % 7) - 3) * 0.035),
        hair: shade(look.hair, ((key >> 3) % 5 - 2) * 0.06),
        cloth: FAMCOL[key % FAMCOL.length],
        cloth2: FAMCOL2[(key >> 4) % FAMCOL2.length],
        shoes: look.shoes, dress: f.sex === 'f' && (key % 3 !== 0),
        covered: look.covered && f.sex === 'f', scarfCol: look.scarfCol,
        hairStyle: f.sex === 'f' ? ['long', 'bun', 'bob', 'pony', 'braid'][key % 5]
          : ['short', 'crop', 'side', 'fringe'][key % 4],
        facial: f.sex === 'm' && f.age > 24 ? ['none', 'stubble', 'beard', 'moustache'][key % 4] : 'none',
        balding: f.sex === 'm' && f.age > 50
      };
      var sp = spriteOf(V, f.age, f.sex, fl, false);
      var fx2 = hx + side * off;
      if (fx2 < 8 || fx2 > V.w - 8) { side = -side; fx2 = hx + side * off; }
      pxPerson(g, V, fx2, gy - 1, sp, {
        bob: Math.sin(V.t * 1.4 + i * 1.7) * 0.6, idle: 1, dir: side > 0 ? -1 : 1,
        eyes: { open: nz(Math.floor(V.t * 1.3) + i) > 0.07 ? 1 : 0.1, lx: 0 },
        mouth: { smile: 0.3, open: 0 }, props: {}
      });
      side = -side;
      if (i % 2 === 1) off += gap;
    }
    /* метка «это вы» — как подпись под сценой, цвет оригинала */
    px(g, hx - 2, gy + 2, 5, 1, 'rgba(226,106,138,0.75)');
    px(g, hx - 1, gy + 3, 3, 1, 'rgba(226,106,138,0.5)');
    pxHero(g, V, hx, gy, hero);
  }

  var FAMCOL = ['#3f5f7a', '#6b4a6a', '#46684a', '#7a5a3a', '#55577e', '#7a4a4a', '#3f6b6b', '#8a6a46'];
  var FAMCOL2 = ['#2f3540', '#3b3328', '#2c3a33', '#403040', '#33384a', '#3e2f2f'];

  /* ---- герой: поза из клипа превращается в пиксельные состояния ---- */

  function pxHero(g, V, x, gy, sp) {
    var P = V.P;
    var st = {
      bob: (P.bob || 0) * 2 + (P.breath || 0) * 0.4,
      baby: V.life.age < 3 ? 1 : 0,
      nod: P.head.nod || 0,
      lean: P.lean || 0,
      armL: P.arms.ls, armR: P.arms.rs,
      elbowL: P.arms.le, elbowR: P.arms.re,
      legs: P.legs,
      sit: P.props.chair || P.props.bench || P.props.desk || P.torso.crouch > 0.5 ? 1 : 0,
      lie: P.props.lying || P.props.bed || V.life.age < 2 ? 1 : 0,
      crawl: P.props.crawl ? 1 : 0,
      slouch: P.torso.slouch || 0,
      eyes: P.eyes, mouth: P.mouth, glow: P.glow, pale: P.pale, blush: P.blush,
      props: P.props, fx: P.fx, hero: 1, dir: 1, t: V.t
    };
    pxFurniture(g, V, x, gy, st);
    pxPerson(g, V, x, gy, sp, st);
    pxHandProps(g, V, x, gy, sp, st);
  }

  /* мебель и крупные предметы под человеком */
  function pxFurniture(g, V, x, gy, st) {
    var p = st.props;
    if ((p.bed || p.lying) && V.life.age >= 3 && V.scene !== 'hospital') {
      px(g, x - 20, gy - 6, 42, 6, '#c3cdd0');
      px(g, x - 20, gy - 8, 10, 2, '#e4ebec');
      px(g, x - 20, gy, 3, 5, '#6d7678');
      px(g, x + 19, gy, 3, 5, '#6d7678');
    } else if (V.life.age < 3) {
      /* люлька: малыш лежит в ней, а не на полу */
      px(g, x - 11, gy - 7, 24, 7, '#6b4a2f');
      px(g, x - 11, gy - 9, 24, 2, '#7d583a');
      px(g, x - 10, gy - 6, 22, 4, '#c9b9a0');
      px(g, x - 13, gy, 3, 4, '#53381f');
      px(g, x + 11, gy, 3, 4, '#53381f');
      px(g, x - 14, gy + 3, 29, 2, '#53381f');
    }
    if (p.chair || p.bench) {
      px(g, x - 7, gy - 9, 14, 2, '#6b4a2f');
      px(g, x - 6, gy - 7, 2, 7, '#53381f');
      px(g, x + 4, gy - 7, 2, 7, '#53381f');
      if (p.chair) px(g, x + 5, gy - 18, 2, 9, '#6b4a2f');
    }
    if (p.desk) {
      px(g, x - 16, gy - 12, 32, 2, '#6b4a2f');
      px(g, x - 15, gy - 10, 2, 10, '#4f3621');
      px(g, x + 13, gy - 10, 2, 10, '#4f3621');
    }
    if (p.counter) px(g, x - 18, gy - 11, 36, 3, '#5a4530');
    if (p.machine) {
      px(g, x + 9, gy - 18, 16, 18, '#4b443c');
      px(g, x + 11, gy - 15, 12, 5, '#2f2a26');
      px(g, x + 12, gy - 13, 3, 2, nz(Math.floor(V.t * 3)) > 0.5 ? '#e8b45a' : '#6b5a3a');
    }
    if (p.house) {
      pxHouse(g, x + 12, gy, 20, '#54452f', '#6b4332', V.sky === 'night');
    }
    if (p.shop) {
      px(g, x + 10, gy - 20, 26, 20, '#48403a');
      px(g, x + 12, gy - 17, 22, 6, '#2d6b63');
      px(g, x + 12, gy - 10, 8, 10, '#2b2520');
    }
    if (p.field) {
      for (var i = -3; i < 4; i++) px(g, x + i * 7 + 20, gy - 5, 1, 5, '#79903a');
    }
    if (p.iv) {
      px(g, x + 13, gy - 26, 1, 26, '#b8c4c6');
      px(g, x + 11, gy - 28, 5, 4, '#dfeaec');
    }
  }

  /* ------------------------- сам пиксель-человек ---------------------- */

  function pxPerson(g, V, x, gy, sp, st) {
    st = st || {};
    var H = sp.h;
    var headH = Math.max(4, Math.round(H * (sp.age < 3 ? 0.34 : sp.age < 12 ? 0.3 : 0.26)));
    var headW = Math.max(4, headH - (sp.age < 12 ? 0 : 1));
    var bodyH = Math.max(3, Math.round(H * 0.32));
    var bodyW = Math.max(4, Math.round(H * (sp.sex === 'f' ? 0.27 : 0.3)));
    var legH = Math.max(2, H - headH - bodyH - 2);
    var legW = Math.max(1, Math.round(bodyW * 0.3));
    var armW = Math.max(1, Math.round(bodyW * 0.22));
    var skin = st.pale ? mix(sp.skin, '#9aa6a0', st.pale * 0.5) : sp.skin;
    var hair = mix(sp.hair, '#d8d4cc', sp.gray);
    var cloth = sp.cloth, cloth2 = sp.cloth2;
    var bob = Math.round(st.bob || 0);
    var dir = st.dir || 1;

    /* лежит: разворачиваем фигуру в горизонталь */
    if (st.lie) {
      var small = st.baby ? 1 : 0;
      var hosp = V.scene === 'hospital' ? 1 : 0;
      var bodyL = small ? 13 : 28;
      var ly = gy - (small ? 6 : hosp ? 15 : 8);
      var bodyT = Math.max(3, Math.round(bodyW * 0.75));
      var hdx = small ? 5 : 12;
      px(g, x - (small ? 8 : 16), ly, bodyL, bodyT, small ? '#e4d8c4' : cloth);
      px(g, x - (small ? 8 : 16), ly, bodyL, 1, shade(small ? '#e4d8c4' : cloth, 0.12));
      if (hosp) {
        px(g, x - 16, ly + 1, 20, bodyT - 1, '#8fa8b4');     /* одеяло */
        px(g, x - 16, ly + 1, 20, 1, '#a9c0ca');
      }
      px(g, x + hdx, ly - 1, headW, headH, skin);
      pxHair(g, x + hdx, ly - 1, headW, headH, hair, sp, 1);
      px(g, x + hdx + 1, ly + 1, 1, 1, '#2a2420');
      px(g, x + hdx + 3, ly + 1, 1, 1, '#2a2420');
      if (st.props && st.props.zzz) {
        px(g, x + hdx + 6, ly - 5 - Math.round((V.t * 3) % 4), 2, 1, '#cfd8e0');
        px(g, x + hdx + 9, ly - 9 - Math.round((V.t * 2) % 5), 3, 1, '#cfd8e0');
      }
      return;
    }

    var sit = st.sit ? Math.round(legH * 0.55) : 0;
    var crouch = st.crawl ? Math.round(H * 0.3) : 0;
    var footY = gy - (st.crawl ? 0 : 0);
    var legTop = footY - 2 - legH + sit + crouch;
    var bodyTop = legTop - bodyH;
    var headTop = bodyTop - headH + (st.slouch ? 1 : 0);
    var hx = x + Math.round((st.lean || 0) * 2);

    /* ноги */
    if (st.sit) {
      /* сидит: бедро вперёд, голень вниз */
      px(g, x - legW, legTop + bodyH * 0 + 1, legW * 2 + 6, legW, cloth2);
      px(g, x + legW + 4, legTop + 1, legW, legH - 2, cloth2);
      px(g, x + legW + 3, footY - 2, legW + 2, 2, sp.shoe);
      px(g, x - legW, legTop + 1, legW, Math.max(2, legH - 4), cloth2);
      px(g, x - legW - 1, legTop + Math.max(2, legH - 4) + 1, legW + 2, 2, sp.shoe);
    } else {
      var swing = 0;
      if (st.legs && Math.abs(st.legs.lh - st.legs.rh) > 0.2) swing = Math.round(Math.sin(V.t * 8) * 2);
      px(g, x - legW - 1, legTop, legW, legH + bob, cloth2);
      px(g, x + 1, legTop, legW, legH + bob, cloth2);
      px(g, x - legW - 1 - (swing > 0 ? 1 : 0), footY - 2 + bob, legW + 2, 2, sp.shoe);
      px(g, x + 1 - (swing < 0 ? 1 : 0), footY - 2 + bob, legW + 2, 2, sp.shoe);
    }

    /* платье или рубаха */
    var bTop = bodyTop + bob;
    if (sp.dress && sp.sex === 'f') {
      for (var r = 0; r < bodyH; r++) {
        var ww = bodyW + Math.round((r / bodyH) * bodyW * 0.75);
        px(g, hx - Math.round(ww / 2), bTop + r, ww, 1, cloth);
      }
      px(g, hx - Math.round(bodyW / 2) - 1, bTop + bodyH - 1, bodyW + Math.round(bodyW * 0.75) + 2, 1, shade(cloth, -0.18));
    } else {
      px(g, hx - Math.round(bodyW / 2), bTop, bodyW, bodyH, cloth);
      px(g, hx - Math.round(bodyW / 2), bTop, bodyW, 1, shade(cloth, 0.14));
      px(g, hx - Math.round(bodyW / 2), bTop + bodyH - 2, bodyW, 1, shade(cloth, -0.2)); /* пояс */
    }

    /* руки */
    var armLen = bodyH - 1;
    var aL = st.armL || 0, aR = st.armR || 0;
    var lx = hx - Math.round(bodyW / 2) - armW, rx = hx + Math.round(bodyW / 2);
    drawArm(g, lx, bTop + 1, armW, armLen, cloth, skin, aL, -1, st, bodyW);
    drawArm(g, rx, bTop + 1, armW, armLen, cloth, skin, aR, 1, st, bodyW);

    /* голова */
    var hTop = headTop + bob + Math.round((st.nod || 0) * 2);
    var hX = hx - Math.round(headW / 2);
    px(g, hx - 1, bTop - 1, 2, 1, shade(skin, -0.15));          /* шея */
    px(g, hX, hTop, headW, headH, skin);
    px(g, hX, hTop + headH - 1, headW, 1, shade(skin, -0.12));  /* подбородок */

    /* лицо */
    var eyeY = hTop + Math.round(headH * 0.42);
    var ex = Math.round(headW * 0.22);
    var open = st.eyes ? clamp(st.eyes.open, 0, 1) : 1;
    var look2 = st.eyes ? Math.round(clamp(st.eyes.lx || 0, -1, 1)) : 0;
    if (open < 0.35) {
      px(g, hX + ex, eyeY + 1, 2, 1, '#2a2420');
      px(g, hX + headW - ex - 2, eyeY + 1, 2, 1, '#2a2420');
    } else {
      px(g, hX + ex + look2, eyeY, 1, 2, '#241f1b');
      px(g, hX + headW - ex - 1 + look2, eyeY, 1, 2, '#241f1b');
    }
    if (headH >= 7) {
      px(g, hX + ex - 1, eyeY - 2, 2, 1, shade(hair, -0.1));
      px(g, hX + headW - ex - 1, eyeY - 2, 2, 1, shade(hair, -0.1));
    }
    var sm = st.mouth ? st.mouth.smile : 0, mo = st.mouth ? st.mouth.open : 0;
    var my = hTop + Math.round(headH * 0.72);
    if (mo > 0.3) px(g, hx - 1, my, 2, 2, '#4a1f1d');
    else if (sm > 0.25) { px(g, hx - 1, my, 3, 1, '#8e4a42'); px(g, hx - 2, my - 1, 1, 1, '#8e4a42'); px(g, hx + 2, my - 1, 1, 1, '#8e4a42'); }
    else if (sm < -0.25) { px(g, hx - 1, my, 3, 1, '#8e4a42'); px(g, hx - 2, my + 1, 1, 1, '#8e4a42'); px(g, hx + 2, my + 1, 1, 1, '#8e4a42'); }
    else px(g, hx - 1, my, 3, 1, '#8e4a42');
    if (st.blush) {
      px(g, hX + 1, my - 1, 1, 1, 'rgba(200,110,90,0.5)');
      px(g, hX + headW - 2, my - 1, 1, 1, 'rgba(200,110,90,0.5)');
    }
    if (st.eyes && st.eyes.tear > 0.1) px(g, hX + ex, eyeY + 2, 1, 2, '#9fd4ef');

    /* борода и волосы */
    if (sp.beard && sp.beard !== 'none' && headH >= 6) {
      var bc = mix(shade(sp.hair, 0.08), '#d8d4cc', sp.gray);
      if (sp.beard === 'stubble') dith(g, hX + 1, my, headW - 2, bc);
      else if (sp.beard === 'moustache') px(g, hx - 1, my - 1, 3, 1, bc);
      else if (sp.beard === 'goatee') px(g, hx - 1, my + 1, 2, 2, bc);
      else {
        px(g, hX, my - 1, headW, Math.min(3, headH - Math.round(headH * 0.72) + (sp.beard === 'long' ? 2 : 1)), bc);
        px(g, hx - 1, my - 2, 3, 1, bc);
      }
    }
    pxHair(g, hX, hTop, headW, headH, hair, sp, 0);

    /* головные уборы и состояние */
    if (st.props) {
      if (st.props.cap) { px(g, hX - 1, hTop - 1, headW + 2, 2, '#1d2630'); px(g, hX + headW - 1, hTop, 3, 1, '#16202a'); }
      if (st.props.helmet) { px(g, hX - 1, hTop - 1, headW + 2, 3, '#d9a33c'); px(g, hX - 2, hTop + 2, headW + 4, 1, '#c08f2e'); }
      if (st.props.patch || st.props.bandage) px(g, hX, hTop + 1, headW, 2, '#cfdadc');
      if (st.props.veil) px(g, hX - 2, hTop - 1, headW + 4, headH + 4, 'rgba(255,255,255,0.3)');
      if (st.props.cigarette) { px(g, hx + 2, my, 3, 1, '#efe7d8'); px(g, hx + 5, my, 1, 1, '#e8743a'); }
      if (st.props.zzz) {
        px(g, hX + headW + 1, hTop - 3 - Math.round((V.t * 3) % 4), 2, 1, '#cfd8e0');
        px(g, hX + headW + 3, hTop - 7 - Math.round((V.t * 2) % 5), 3, 1, '#cfd8e0');
      }
    }
    if (st.glow > 0.05) {
      px(g, hX - 2, hTop - 2, headW + 4, 1, 'rgba(255,230,160,' + (st.glow * 0.5).toFixed(2) + ')');
      px(g, hX - 2, hTop - 2, 1, headH + 4, 'rgba(255,230,160,' + (st.glow * 0.35).toFixed(2) + ')');
      px(g, hX + headW + 1, hTop - 2, 1, headH + 4, 'rgba(255,230,160,' + (st.glow * 0.35).toFixed(2) + ')');
    }
  }

  function drawArm(g, x, y, w, len, cloth, skin, ang, side, st, bodyW) {
    var up = ang < -0.55, fwd = ang > 0.5 || (st.props && (st.props.book || st.props.phone || st.props.laptop || st.props.money || st.props.baby));
    if (up) {
      px(g, x, y - Math.round(len * 0.5), w, Math.round(len * 0.9), cloth);
      px(g, x, y - Math.round(len * 0.5) - 2, w, 2, skin);
    } else if (fwd) {
      px(g, x, y, w, Math.round(len * 0.55), cloth);
      px(g, x + (side > 0 ? w : -Math.round(w * 1.6)), y + Math.round(len * 0.45), Math.round(w * 1.6), w, cloth);
      px(g, x + (side > 0 ? w + Math.round(w * 1.6) : -Math.round(w * 2.6)), y + Math.round(len * 0.45), w, w, skin);
    } else {
      px(g, x, y, w, len - 1, cloth);
      px(g, x, y + len - 1, w, 2, skin);
    }
  }

  /* причёска поверх головы */
  function pxHair(g, hX, hTop, headW, headH, hair, sp, lying) {
    var st = sp.style || 'short';
    if (sp.covered) {
      var sc = sp.scarf || '#56407a';
      px(g, hX - 1, hTop - 1, headW + 2, Math.round(headH * 0.5), sc);
      px(g, hX - 1, hTop - 1, 1, headH + 1, sc);
      px(g, hX + headW, hTop - 1, 1, headH + 1, sc);
      px(g, hX - 1, hTop + headH, headW + 2, 2, sc);
      return;
    }
    if (st === 'bald') {
      px(g, hX, hTop, 1, 2, hair);
      px(g, hX + headW - 1, hTop, 1, 2, hair);
      return;
    }
    var capH = Math.max(1, Math.round(headH * 0.3));
    px(g, hX, hTop - 1, headW, capH, hair);
    px(g, hX - 1, hTop, 1, Math.round(headH * 0.5), hair);
    px(g, hX + headW, hTop, 1, Math.round(headH * 0.5), hair);
    if (st === 'long') {
      px(g, hX - 1, hTop, 1, headH + Math.round(headH * 0.7), hair);
      px(g, hX + headW, hTop, 1, headH + Math.round(headH * 0.7), hair);
      px(g, hX - 1, hTop + headH + Math.round(headH * 0.5), headW + 2, 2, hair);
    } else if (st === 'bob') {
      px(g, hX - 1, hTop, 1, headH, hair);
      px(g, hX + headW, hTop, 1, headH, hair);
    } else if (st === 'pony') {
      px(g, hX + headW, hTop + 1, 2, Math.round(headH * 0.9), hair);
    } else if (st === 'braid') {
      px(g, hX + headW, hTop + 2, 1, Math.round(headH * 1.1), hair);
      px(g, hX + headW, hTop + 2 + Math.round(headH * 1.1), 2, 1, hair);
    } else if (st === 'bun') {
      px(g, hX + Math.round(headW / 2) - 1, hTop - 3, 3, 2, hair);
    } else if (st === 'afro') {
      px(g, hX - 2, hTop - 2, headW + 4, Math.round(headH * 0.55), hair);
    } else if (st === 'side') {
      px(g, hX, hTop - 1, Math.round(headW * 0.7), capH + 1, hair);
    } else if (st === 'crop') {
      px(g, hX, hTop - 1, headW, Math.max(1, capH - 1), hair);
    }
  }

  /* предметы в руках */
  function pxHandProps(g, V, x, gy, sp, st) {
    var p = st.props, H = sp.h;
    var handY = gy - Math.round(H * 0.42);
    var hx = x + Math.round(sp.h * 0.22);
    if (p.baby || p.swaddle) {
      px(g, x - 4, handY, 9, 5, '#e4d8c4');
      px(g, x - 5, handY + 1, 3, 3, sp.skin);
      px(g, x - 4, handY + 2, 1, 1, '#2a2420');
    }
    if (p.book || p.diploma) { px(g, hx - 2, handY, 7, 5, p.diploma ? '#efe7d8' : '#8c4a3a'); px(g, hx + 1, handY, 1, 5, '#2b2520'); }
    if (p.phone) px(g, hx, handY, 2, 4, '#2b3440');
    if (p.laptop) { px(g, x - 6, gy - Math.round(H * 0.52), 13, 2, '#5a6470'); px(g, x - 5, gy - Math.round(H * 0.52) - 6, 11, 6, '#2b3440'); px(g, x - 4, gy - Math.round(H * 0.52) - 5, 9, 4, '#3f5f7a'); }
    if (p.money) { px(g, hx, handY, 6, 3, '#6fae6f'); px(g, hx + 2, handY + 1, 2, 1, '#2f5a33'); }
    if (p.cane) { px(g, hx + 2, handY, 1, Math.round(H * 0.45), '#6b4a2f'); px(g, hx + 1, handY, 3, 1, '#53381f'); }
    if (p.bag) { px(g, hx, handY + 2, 6, 6, '#7a5a3a'); px(g, hx + 1, handY, 4, 2, '#5c422a'); }
    if (p.box) px(g, x - 5, handY - 1, 11, 7, '#8a6a46');
    if (p.suitcase) { px(g, hx, handY + 3, 8, 6, '#5a4530'); px(g, hx + 3, handY + 1, 2, 2, '#3f2f1f'); }
    if (p.bouquet) { px(g, hx + 1, handY - 3, 1, 4, '#4a6b3a'); px(g, hx, handY - 5, 3, 2, '#d9728f'); px(g, hx + 2, handY - 4, 2, 2, '#e8b45a'); }
    if (p.candle) { px(g, hx + 2, handY - 2, 1, 4, '#e8e0cc'); px(g, hx + 2, handY - 4, 1, 2, '#ffd98a'); }
    if (p.cup) px(g, hx, handY, 3, 3, '#cfd8e0');
    if (p.tray) px(g, hx - 2, handY, 10, 2, '#8a8f96');
    if (p.hoe) { px(g, hx + 2, handY - 6, 1, 12, '#6b4a2f'); px(g, hx + 2, handY - 7, 4, 2, '#8a9096'); }
    if (p.weights) { px(g, x - 9, handY, 4, 4, '#4b525c'); px(g, x + 6, handY, 4, 4, '#4b525c'); }
    if (p.pot || p.plant) { px(g, hx, handY + 2, 5, 4, '#8a5a3a'); px(g, hx + 1, handY - 2, 3, 4, '#3f7a44'); }
    if (p.medal) { px(g, x, gy - Math.round(H * 0.5), 1, 3, '#c9a45c'); px(g, x - 1, gy - Math.round(H * 0.47), 3, 3, '#e8b45a'); }
    if (p.heart) px(g, x + 6, gy - Math.round(H * 0.75) - Math.round((V.t * 4) % 6), 3, 3, '#d9728f');
    if (p.sign) { px(g, hx, handY - 8, 10, 7, '#efe7d8'); px(g, hx + 4, handY - 1, 1, 6, '#6b4a2f'); px(g, hx + 2, handY - 6, 6, 1, '#2b2520'); }
    if (p.keys) px(g, hx, handY, 3, 2, '#c9a45c');
    if (p.ring) px(g, hx, handY, 2, 2, '#e8d48a');
  }

  /* ------------------------ передний план и fx ------------------------ */

  function drawFore(g, V) {
    var gy = V.gy, w = V.w, night = V.sky === 'night';
    if (V.scene === 'village' || V.scene === 'park') {
      for (var i = 0; i < w; i += 4) {
        var hgt = 2 + Math.round(nz(i) * 2);
        px(g, i, V.h - hgt, 1, hgt, night ? '#1a2b1d' : '#2c4a28');
      }
    }
    if (V.scene === 'field') {
      for (var j = 0; j < w; j += 13) {
        var jx = j + Math.round(nz(j) * 5);
        px(g, jx, V.h - 4, 1, 4, night ? '#2e3d1c' : '#6b8232');
        px(g, jx - 1, V.h - 5, 3, 1, night ? '#3a4a23' : '#849b3e');
      }
    }
    if (V.scene === 'city' || V.scene === 'night') px(g, 0, V.h - 3, w, 3, '#1a1e24');
  }

  Portrait.prototype.particle = function (kind) {
    this.particles.push({
      k: kind, x: Math.random() * this.w, y: -8 - Math.random() * 40,
      v: 20 + Math.random() * 60, s: 1 + Math.random() * 2, d: Math.random() * 6.28
    });
  };

  function drawFx(g, V) {
    var P = V.P, t = V.t, w = V.w, h = V.h;
    if (P.fx.rain) {
      for (var i = 0; i < 26; i++) {
        var rx = Math.round((i * 17 + t * 60) % w), ry = Math.round((i * 11 + t * 110) % h);
        px(g, rx, ry, 1, 2, '#9fc4da');
      }
    }
    if (P.fx.snow) {
      for (var s = 0; s < 22; s++) {
        var sx = Math.round((s * 23 + Math.sin(t + s) * 4 + t * 6) % w);
        var sy = Math.round((s * 13 + t * 16) % h);
        px(g, sx, sy, 1, 1, '#eef4f8');
      }
    }
    if (P.fx.dust) {
      for (var d = 0; d < 14; d++) {
        var dx = Math.round((d * 29 + t * 30) % w), dy = V.gy - 4 - Math.round(nz(d) * 8);
        px(g, dx, dy, 1, 1, 'rgba(214,190,150,0.5)');
      }
    }
    if (P.fx.fire) {
      for (var f = 0; f < 10; f++) {
        var fx2 = Math.round(w * 0.5 + Math.sin(t * 3 + f) * 6);
        px(g, fx2, V.gy - Math.round((t * 12 + f * 4) % 20), 1, 2, f % 2 ? '#e8743a' : '#f2b24a');
      }
    }
    if (P.fx.sparkle) {
      for (var k = 0; k < 8; k++) {
        if (nz(k + Math.floor(t * 4)) > 0.55) {
          px(g, Math.round(w * 0.5 + Math.sin(k * 2.1) * 14), V.gy - 20 - Math.round(nz(k + 3) * 16), 1, 1, '#ffe9a8');
        }
      }
    }
    if (P.fx.fireflies) {
      for (var ff = 0; ff < 9; ff++) {
        var ox = Math.round(w * 0.2 + ((ff * 37 + t * 8) % (w * 0.7)));
        var oy = Math.round(V.gy - 10 - Math.sin(t * 1.4 + ff) * 7);
        if (nz(ff + Math.floor(t * 2)) > 0.35) px(g, ox, oy, 1, 1, '#d8f08a');
      }
    }
    if (P.fx.birds !== undefined && !V.indoor) {
      var bx = Math.round((P.fx.birds || 0) * (w + 20)) - 10;
      for (var b = 0; b < 3; b++) {
        var byy = Math.round(V.gy * 0.22 + Math.sin((P.fx.birds || 0) * 6 + b) * 3);
        px(g, bx + b * 6, byy, 1, 1, '#e8eef2');
        px(g, bx + b * 6 + 1, byy - 1, 1, 1, '#e8eef2');
        px(g, bx + b * 6 + 2, byy, 1, 1, '#e8eef2');
      }
    }
    if (P.fx.smoke || P.props.smoke) {
      for (var sm = 0; sm < 6; sm++) {
        var syy = V.gy - 26 - Math.round((t * 8 + sm * 5) % 26);
        px(g, Math.round(w * 0.5 + 6 + Math.sin(t + sm) * 2), syy, 1 + (sm % 2), 1, 'rgba(190,190,190,0.35)');
      }
    }
    /* частицы от событий */
    var ps = V.pt.particles;
    for (var i2 = ps.length - 1; i2 >= 0; i2--) {
      var p = ps[i2];
      p.y += p.v * 0.016;
      p.x += Math.sin(p.d + t) * 0.4;
      if (p.y > V.h * 3) { ps.splice(i2, 1); continue; }
      var col = p.k === 'confetti' ? ['#e8b45a', '#d9728f', '#6fae6f', '#7fb4d8'][i2 % 4]
        : p.k === 'heart' ? '#d9728f' : p.k === 'tear' ? '#9fd4ef' : '#e8eef2';
      px(g, Math.round(p.x / 4), Math.round(p.y / 4), 1, 1, col);
    }
    /* затемнение по краям, чтобы сцена не казалась плоской */
    if (!V.indoor && V.sky === 'night') {
      px(g, 0, 0, w, 1, 'rgba(0,0,0,0.25)');
      px(g, 0, h - 1, w, 1, 'rgba(0,0,0,0.25)');
    }
  }

  /* ------------------------- цикл отрисовки -------------------------- */

  Portrait.prototype.start = function () {
    var self = this;
    if (this._raf) return this;
    var last = (typeof performance !== 'undefined' ? performance.now() : Date.now());
    var step = function (now) {
      self._raf = requestAnimationFrame(step);
      var dt = now - last; last = now;
      if (self.paused) return;
      if (self.reduced && self.time > 0 && !self.action) { self.time += dt / 1000; return; }
      self.tick(dt);
    };
    this._raf = requestAnimationFrame(step);
    return this;
  };

  Portrait.prototype.stop = function () {
    if (this._raf) { cancelAnimationFrame(this._raf); this._raf = null; }
    return this;
  };

  window.IN8B = window.IN8B || {};
  window.IN8B.portrait = {
    Portrait: Portrait,
    clips: CLIPS,
    byId: BY_ID,
    groups: GROUPS,
    lookFor: lookFor,
    metrics: metrics,
    stageOf: stageOf,
    familyInfo: familyInfo,
    ambientFor: ambientFor,
    clipForLog: clipForLog,
    basePose: basePose,
    count: CLIPS.length
  };
})();
