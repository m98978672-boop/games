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
    this.scene = 'home';
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

  /* ---------------------------- отрисовка ---------------------------- */

  Portrait.prototype.render = function () {
    var g = this.ctx;
    if (!g) return;
    var W = this.w, H = this.h, P = this.pose;
    var life = this.life, look = this.look;
    g.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    g.clearRect(0, 0, W, H);
    if (!life || !look) return;

    var sh = P.shake ? (Math.random() - 0.5) * P.shake * 3 : 0;
    g.save();
    g.translate(W / 2 + sh, H / 2);
    g.scale(P.zoom, P.zoom);
    g.translate(-W / 2, -H / 2);

    drawScene(g, this, P, W, H);
    drawFigure(g, this, P, W, H);
    drawFrontProps(g, this, P, W, H);
    drawWeather(g, this, P, W, H);
    g.restore();

    if (P.flash > 0.01) {
      g.fillStyle = 'rgba(255,245,220,' + (P.flash * 0.6).toFixed(3) + ')';
      g.fillRect(0, 0, W, H);
    }
    if (P.fade > 0.01) {
      g.fillStyle = 'rgba(6,8,7,' + Math.min(0.92, P.fade).toFixed(3) + ')';
      g.fillRect(0, 0, W, H);
    }
    /* рамка и подпись возраста */
    g.strokeStyle = 'rgba(232,180,90,0.18)';
    g.lineWidth = 1;
    g.strokeRect(0.5, 0.5, W - 1, H - 1);
  };

  /* ------------------------------ сцена ------------------------------ */

  var SKY = {
    village: ['#243948', '#3b5a6b', '#5f818a'], city: ['#1d2733', '#324257', '#53657e'],
    room: ['#271f19', '#3b3027', '#524134'], school: ['#1f2b26', '#34463c', '#4b5d50'],
    office: ['#1c242e', '#2e3b4a', '#455468'], factory: ['#231f1b', '#39312b', '#51463c'],
    field: ['#26371f', '#435c36', '#748c55'], hospital: ['#1b2426', '#2c383c', '#3f4f53'],
    park: ['#1f3029', '#34503e', '#4f6f55'], night: ['#0a0f13', '#121b21', '#1d2930']
  };

  function drawScene(g, pt, P, W, H) {
    var s = pt.scene, sky = SKY[s] || SKY.village;
    var night = P.fx.night ? 1 : 0;
    var gy = H * 0.9;
    var grad = g.createLinearGradient(0, 0, 0, gy);
    grad.addColorStop(0, night ? '#05080b' : sky[0]);
    grad.addColorStop(0.55, night ? '#0a1016' : sky[1]);
    grad.addColorStop(1, night ? '#101820' : sky[2]);
    g.fillStyle = grad;
    g.fillRect(0, 0, W, gy);

    if (P.fx.dawn) tint(g, W, gy, 'rgba(240,160,90,' + (0.25 * (1 - Math.abs(P.fx.dawn - 0.5) * 2)).toFixed(3) + ')');
    if (P.fx.dusk) tint(g, W, gy, 'rgba(230,110,80,' + (0.22 * (1 - Math.abs(P.fx.dusk - 0.5) * 2)).toFixed(3) + ')');
    if (P.fx.haze) tint(g, W, gy, 'rgba(180,170,150,0.10)');

    /* солнце или луна */
    var sx = W * 0.78, sy = H * 0.2;
    if (night) {
      g.fillStyle = 'rgba(240,240,220,0.9)';
      circle(g, sx, sy, 10);
      for (var i = 0; i < 26; i++) {
        var a = (i * 2654435761) % 1000 / 1000, b = (i * 40503) % 997 / 997;
        g.fillStyle = 'rgba(255,255,230,' + (0.25 + 0.5 * ((i * 7919) % 100) / 100).toFixed(2) + ')';
        g.fillRect(a * W, b * H * 0.5, 1.4, 1.4);
      }
    } else if (P.fx.sun) {
      var r = 14 + 4 * P.fx.sun;
      var sg = g.createRadialGradient(sx, sy, 2, sx, sy, r * 4);
      sg.addColorStop(0, 'rgba(255,225,150,0.75)');
      sg.addColorStop(1, 'rgba(255,225,150,0)');
      g.fillStyle = sg; g.fillRect(sx - r * 4, sy - r * 4, r * 8, r * 8);
      g.fillStyle = 'rgba(255,235,190,0.95)'; circle(g, sx, sy, r);
    }

    if (P.fx.birds !== undefined && s !== 'room' && s !== 'office') {
      var bx = (P.fx.birds || 0) * W * 1.2 - W * 0.1;
      g.strokeStyle = 'rgba(240,236,223,0.45)'; g.lineWidth = 1.2;
      for (var k = 0; k < 3; k++) {
        var x = bx + k * 16, y = H * 0.18 + Math.sin((P.fx.birds || 0) * 6 + k) * 6;
        g.beginPath(); g.moveTo(x - 5, y); g.quadraticCurveTo(x, y - 4, x + 5, y); g.stroke();
      }
    }

    /* задний план по сцене */
    if (s === 'village' || s === 'field' || s === 'park') {
      g.fillStyle = night ? '#16221c' : '#2c4030';
      g.beginPath(); g.moveTo(0, gy);
      for (var x2 = 0; x2 <= W; x2 += 20) g.lineTo(x2, gy - 30 - Math.sin(x2 * 0.03) * 12);
      g.lineTo(W, gy); g.closePath(); g.fill();
      if (s !== 'field') { house(g, W * 0.16, gy - 6, 54, night); tree(g, W * 0.8, gy - 4, 34, night); }
      if (s === 'field') for (var f = 0; f < 10; f++) crop(g, (f + 0.5) * W / 10, gy - 2, night);
      if (s === 'park') { bench(g, W * 0.5, gy, 0.6); tree(g, W * 0.2, gy - 4, 40, night); }
    } else if (s === 'city' || s === 'office') {
      for (var b2 = 0; b2 < 7; b2++) {
        var bw = W / 7, bh = 40 + ((b2 * 37) % 70);
        g.fillStyle = night ? '#101820' : '#1d2630';
        g.fillRect(b2 * bw, gy - bh, bw - 4, bh);
        for (var wy = 0; wy < bh - 10; wy += 11) {
          for (var wx = 0; wx < bw - 12; wx += 10) {
            var on = ((b2 * 31 + wy * 7 + wx * 13) % 100) / 100 < (night ? 0.55 : 0.25);
            g.fillStyle = on ? 'rgba(255,214,140,0.75)' : 'rgba(120,140,150,0.12)';
            g.fillRect(b2 * bw + 5 + wx, gy - bh + 6 + wy, 5, 6);
          }
        }
      }
      if (P.fx.traffic !== undefined) {
        var cx2 = ((P.fx.traffic || 0) * W * 1.3) - W * 0.15;
        g.fillStyle = 'rgba(232,180,90,0.5)'; g.fillRect(cx2, gy - 9, 16, 6);
        g.fillStyle = 'rgba(200,80,70,0.45)'; g.fillRect(W - cx2, gy - 9, 14, 6);
      }
    } else if (s === 'school') {
      g.fillStyle = '#243229'; g.fillRect(W * 0.1, gy - 92, W * 0.8, 92);
      g.fillStyle = '#16211b'; g.fillRect(W * 0.18, gy - 78, W * 0.64, 46);
      g.strokeStyle = 'rgba(240,236,223,0.3)'; g.lineWidth = 1.4;
      g.beginPath(); g.moveTo(W * 0.24, gy - 66); g.lineTo(W * 0.5, gy - 66);
      g.moveTo(W * 0.24, gy - 56); g.lineTo(W * 0.62, gy - 56);
      g.moveTo(W * 0.24, gy - 46); g.lineTo(W * 0.44, gy - 46); g.stroke();
    } else if (s === 'factory') {
      g.fillStyle = '#1e1a17'; g.fillRect(0, gy - 80, W, 80);
      for (var p2 = 0; p2 < 4; p2++) {
        g.fillStyle = '#2a2420'; g.fillRect(10 + p2 * (W - 20) / 4, gy - 60 - (p2 % 2) * 14, 26, 60);
      }
      g.fillStyle = 'rgba(232,180,90,0.25)'; g.fillRect(0, gy - 26, W, 3);
    } else if (s === 'hospital') {
      g.fillStyle = '#1b2325'; g.fillRect(0, gy - 110, W, 110);
      g.fillStyle = 'rgba(240,250,250,0.07)'; g.fillRect(W * 0.62, gy - 96, W * 0.3, 60);
      g.strokeStyle = 'rgba(240,250,250,0.18)'; g.strokeRect(W * 0.62, gy - 96, W * 0.3, 60);
    } else if (s === 'room') {
      g.fillStyle = '#241d18'; g.fillRect(0, gy - 120, W, 120);
      g.fillStyle = 'rgba(255,214,140,0.10)'; g.fillRect(W * 0.08, gy - 104, W * 0.26, 54);
      g.strokeStyle = 'rgba(232,180,90,0.25)'; g.strokeRect(W * 0.08, gy - 104, W * 0.26, 54);
      g.fillStyle = '#2d241d'; g.fillRect(W * 0.6, gy - 40, W * 0.33, 8);
    } else if (s === 'night') {
      g.fillStyle = 'rgba(10,14,18,0.6)'; g.fillRect(0, 0, W, gy);
    }

    /* пол */
    var fg = g.createLinearGradient(0, gy, 0, H);
    fg.addColorStop(0, night ? '#0e1413' : '#1d2420');
    fg.addColorStop(1, '#0a0e0d');
    g.fillStyle = fg; g.fillRect(0, gy, W, H - gy);
    g.strokeStyle = 'rgba(232,180,90,0.12)'; g.beginPath(); g.moveTo(0, gy); g.lineTo(W, gy); g.stroke();

    /* мягкий свет за человеком, чтобы фигура не сливалась с фоном */
    var lx = W / 2 + (P.rootX || 0) * W, ly = gy - H * 0.3;
    var lg = g.createRadialGradient(lx, ly, H * 0.05, lx, ly, H * 0.62);
    lg.addColorStop(0, 'rgba(255,240,210,0.13)');
    lg.addColorStop(0.55, 'rgba(255,240,210,0.05)');
    lg.addColorStop(1, 'rgba(255,240,210,0)');
    g.fillStyle = lg;
    g.fillRect(0, 0, W, H);
  }

  function tint(g, W, H, color) { g.fillStyle = color; g.fillRect(0, 0, W, H); }
  function circle(g, x, y, r) { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); }
  function house(g, x, y, s, night) {
    g.fillStyle = night ? '#1a211c' : '#30372c'; g.fillRect(x - s / 2, y - s * 0.6, s, s * 0.6);
    g.fillStyle = night ? '#232a24' : '#3c4436';
    g.beginPath(); g.moveTo(x - s * 0.6, y - s * 0.6); g.lineTo(x, y - s * 1.05); g.lineTo(x + s * 0.6, y - s * 0.6); g.closePath(); g.fill();
    g.fillStyle = 'rgba(255,214,140,' + (night ? 0.8 : 0.35) + ')'; g.fillRect(x - s * 0.12, y - s * 0.42, s * 0.24, s * 0.22);
  }
  function tree(g, x, y, s, night) {
    g.fillStyle = '#2e2419'; g.fillRect(x - s * 0.06, y - s * 0.5, s * 0.12, s * 0.5);
    g.fillStyle = night ? '#15251a' : '#27432a';
    circle(g, x, y - s * 0.66, s * 0.3); circle(g, x - s * 0.2, y - s * 0.5, s * 0.22); circle(g, x + s * 0.2, y - s * 0.52, s * 0.22);
  }
  function crop(g, x, y, night) {
    g.strokeStyle = night ? '#2c3a22' : '#55702f'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x - 3, y - 14); g.moveTo(x, y); g.lineTo(x + 3, y - 12); g.stroke();
  }
  function bench(g, x, y, k) {
    g.fillStyle = '#39302a'; g.fillRect(x - 30 * k, y - 16 * k, 60 * k, 5 * k);
    g.fillRect(x - 26 * k, y - 11 * k, 4 * k, 11 * k); g.fillRect(x + 22 * k, y - 11 * k, 4 * k, 11 * k);
  }

  /* ----------------------------- фигура ------------------------------ */

  /* ===================================================================
     ФИГУРА ЧЕЛОВЕКА
     Плоская векторная графика: силуэт из кривых, сужающиеся конечности,
     кисти, обувь, воротник, причёски. Всё рисуется кодом, без картинок.
     =================================================================== */

  var TAU = Math.PI * 2;

  /* сегмент конечности с переменной толщиной */
  function seg(g, x1, y1, x2, y2, w1, w2) {
    var dx = x2 - x1, dy = y2 - y1;
    var L = Math.sqrt(dx * dx + dy * dy) || 1;
    var nx = -dy / L, ny = dx / L;
    g.beginPath();
    g.moveTo(x1 + nx * w1 / 2, y1 + ny * w1 / 2);
    g.lineTo(x2 + nx * w2 / 2, y2 + ny * w2 / 2);
    g.lineTo(x2 - nx * w2 / 2, y2 - ny * w2 / 2);
    g.lineTo(x1 - nx * w1 / 2, y1 - ny * w1 / 2);
    g.closePath(); g.fill();
  }

  /* кисть: ладонь с большим пальцем, повёрнутая вдоль предплечья */
  function hand(g, x, y, ang, w, col) {
    g.save(); g.translate(x, y); g.rotate(-ang);
    g.fillStyle = col;
    g.beginPath(); g.ellipse(0, w * 0.34, w * 0.44, w * 0.6, 0, 0, TAU); g.fill();
    g.beginPath(); g.ellipse(-w * 0.36, w * 0.18, w * 0.17, w * 0.26, 0.6, 0, TAU); g.fill();
    g.restore();
  }

  /* ботинок: мысок наружу от центра фигуры */
  function shoe(g, x, y, ang, w, col, dir) {
    g.save(); g.translate(x, y); g.rotate(-ang * 0.5);
    g.fillStyle = col;
    g.beginPath();
    g.moveTo(-w * 0.5, -w * 0.25);
    g.lineTo(w * 0.5, -w * 0.25);
    g.quadraticCurveTo(w * 0.55 + dir * w * 0.5, -w * 0.1, w * 0.5 + dir * w * 0.62, w * 0.3);
    g.quadraticCurveTo(w * 0.3, w * 0.52, -w * 0.5, w * 0.42);
    g.quadraticCurveTo(-w * 0.62, w * 0.1, -w * 0.5, -w * 0.25);
    g.fill();
    g.fillStyle = 'rgba(0,0,0,0.3)';
    g.beginPath();
    g.moveTo(-w * 0.52, w * 0.3);
    g.lineTo(w * 0.5 + dir * w * 0.6, w * 0.26);
    g.lineTo(w * 0.48 + dir * w * 0.6, w * 0.44);
    g.quadraticCurveTo(w * 0.3, w * 0.52, -w * 0.5, w * 0.42);
    g.fill();
    g.restore();
  }

  /* конечность: плечо → локоть → кисть, с утолщением в суставах */
  function limb(g, x, y, a1, l1, a2, l2, w1, w2, color, handColor, opts) {
    var ex = x + Math.sin(a1) * l1, ey = y + Math.cos(a1) * l1;
    var hx = ex + Math.sin(a1 + a2) * l2, hy = ey + Math.cos(a1 + a2) * l2;
    var wm = (w1 + w2) * 0.52;
    g.fillStyle = color;
    circle(g, x, y, w1 / 2);
    seg(g, x, y, ex, ey, w1, wm);
    circle(g, ex, ey, wm / 2);
    seg(g, ex, ey, hx, hy, wm, w2);
    circle(g, hx, hy, w2 / 2);
    opts = opts || {};
    if (opts.cuff) {
      g.fillStyle = opts.cuff;
      var t = 0.82;
      var cx1 = ex + (hx - ex) * t, cy1 = ey + (hy - ey) * t;
      seg(g, cx1, cy1, hx, hy, w2 * 1.08, w2 * 1.04);
    }
    if (opts.shoe) shoe(g, hx, hy, a1 + a2, w2 * 1.5, opts.shoe, opts.dir || 0);
    else if (handColor) hand(g, hx, hy, a1 + a2, w2 * 1.5, handColor);
    return { ex: ex, ey: ey, hx: hx, hy: hy };
  }

  function drawFigure(g, pt, P, W, H) {
    var life = pt.life, look = pt.look;
    var age = life.age;
    var m = metrics(age);
    var fh = H * 0.93 * m.h * P.scale;
    var gy = H * 0.94 + P.rootY * H;
    /* подгонка: человек любого возраста целиком помещается в кадр */
    var fullH = fh * (m.leg + m.th + m.neck + 2.5 * m.head);
    var room = gy - H * 0.035;
    if (fullH > room) fh *= room / fullH;
    var cx = W / 2 + P.rootX * W;

    /* седина, бледность, загар */
    var grayK = clamp((age - 35) / 45, 0, 0.85);
    var hairCol = mix(look.hair, '#d8d4cc', grayK);
    var skin = look.skin;
    if (P.pale) skin = mix(skin, '#cfd6d4', P.pale * 0.45);
    if (P.blush) skin = mix(skin, '#c4684f', P.blush * 0.25);
    var health = life.stats ? life.stats.health : 70;
    if (health < 45) skin = mix(skin, '#9aa6a0', (45 - health) / 110);

    var lying = !!P.props.lying;
    var legLen = fh * m.leg, torsoH = fh * m.th, torsoW = fh * m.tw * look.wide;
    var headR = fh * m.head;
    var crouch = P.torso.crouch || 0;
    var female = life.sex === 'f' && age > 12;

    if (lying) { g.save(); g.translate(cx, gy - fh * 0.12); g.rotate(-Math.PI / 2 * 0.92); g.translate(-cx, -(gy - fh * 0.12)); }

    var hipY = gy - legLen * (1 - crouch * 0.45);
    var shoulderY = hipY - torsoH * (1 - P.torso.slouch * 0.1);
    var headCY = shoulderY - fh * m.neck - headR * 0.95 + P.head.y * fh + P.bob * -H;
    var leanX = P.lean * fh * 0.3;

    /* тень на земле */
    if (!lying) {
      g.fillStyle = 'rgba(0,0,0,0.35)';
      g.beginPath(); g.ellipse(cx, gy + 2, torsoW * 0.8, torsoW * 0.17, 0, 0, TAU); g.fill();
    }

    /* реквизит за фигурой */
    if (P.props.bed) {
      g.fillStyle = '#2b2a28'; g.fillRect(cx - fh * 0.55, gy - fh * 0.1, fh * 1.1, fh * 0.1);
      g.fillStyle = '#4a4742'; g.fillRect(cx - fh * 0.58, gy - fh * 0.16, fh * 0.1, fh * 0.16);
    }
    if (P.props.chair) { g.fillStyle = '#3a312a'; g.fillRect(cx - torsoW * 0.6, hipY, torsoW * 1.2, fh * 0.06); }
    if (P.props.bench) bench(g, cx, gy, fh / 90);
    if (P.props.house) house(g, cx + W * 0.3, gy - 4, fh * 0.5, 0);
    if (P.props.shop) {
      g.fillStyle = '#2f3a33'; g.fillRect(cx + fh * 0.2, gy - fh * 0.5, fh * 0.6, fh * 0.5);
      g.fillStyle = '#e8b45a'; g.fillRect(cx + fh * 0.2, gy - fh * 0.52, fh * 0.6, fh * 0.07);
    }
    if (P.props.machine) { g.fillStyle = '#39332c'; g.fillRect(cx + fh * 0.22, gy - fh * 0.42, fh * 0.42, fh * 0.42); }
    if (P.props.field) for (var cci = 0; cci < 5; cci++) crop(g, cx - fh * 0.5 + cci * fh * 0.25, gy, 0);

    /* ------------------------------ ноги ------------------------------ */
    var trouser = shade(look.cloth2, -0.3);
    var shoeCol = look.shoes;
    var legW = torsoW * 0.30;
    var ankleW = torsoW * 0.21;
    var hipHalf = torsoW * (female ? 0.27 : 0.24) * P.legs.spread;
    var hipL = cx - hipHalf + leanX * 0.3;
    var hipR = cx + hipHalf + leanX * 0.3;
    var bare = look.dress && age > 12 && !look.cold;
    var legCol = bare ? shade(skin, -0.06) : trouser;
    var legA = limb(g, hipL, hipY, P.legs.lh, legLen * 0.52, P.legs.lk, legLen * 0.5,
      legW, ankleW, legCol, null, { shoe: shoeCol, dir: -1 });
    var legB = limb(g, hipR, hipY, P.legs.rh, legLen * 0.52, P.legs.rk, legLen * 0.5,
      legW, ankleW, legCol, null, { shoe: shoeCol, dir: 1 });
    void legA; void legB;

    /* ------------------------------ торс ------------------------------ */
    var tx = cx + leanX, ty = shoulderY;
    var bodyBot = hipY + fh * 0.012;
    var shW = torsoW * 0.5;
    var waW = torsoW * (female ? 0.36 : 0.43);
    var hipW = torsoW * (female ? 0.49 : 0.44);
    var rr = torsoW * 0.22;

    g.fillStyle = look.cloth;
    g.beginPath();
    g.moveTo(tx - shW + rr, ty);
    g.quadraticCurveTo(tx - shW, ty, tx - shW, ty + rr * 0.9);
    g.quadraticCurveTo(tx - waW, ty + torsoH * 0.62, tx - hipW, bodyBot - rr * 0.4);
    g.quadraticCurveTo(tx - hipW, bodyBot, tx - hipW + rr * 0.5, bodyBot);
    g.lineTo(tx + hipW - rr * 0.5, bodyBot);
    g.quadraticCurveTo(tx + hipW, bodyBot, tx + hipW, bodyBot - rr * 0.4);
    g.quadraticCurveTo(tx + waW, ty + torsoH * 0.62, tx + shW, ty + rr * 0.9);
    g.quadraticCurveTo(tx + shW, ty, tx + shW - rr, ty);
    g.closePath();
    g.fill();

    /* юбка или платье */
    if (look.dress && age > 6) {
      g.fillStyle = shade(look.cloth, -0.05);
      var skirtBot = hipY + legLen * (look.longDress ? 0.72 : 0.36);
      g.beginPath();
      g.moveTo(tx - waW * 1.02, hipY - torsoH * 0.3);
      g.quadraticCurveTo(tx - torsoW * 0.72, hipY + legLen * 0.1, tx - torsoW * 0.82, skirtBot);
      g.quadraticCurveTo(tx, skirtBot + torsoW * 0.16, tx + torsoW * 0.82, skirtBot);
      g.quadraticCurveTo(tx + torsoW * 0.72, hipY + legLen * 0.1, tx + waW * 1.02, hipY - torsoH * 0.3);
      g.closePath(); g.fill();
    }

    /* дыхание и складки */
    if (P.breath) {
      g.fillStyle = 'rgba(255,255,255,0.045)';
      g.beginPath();
      g.ellipse(tx, ty + torsoH * 0.3, torsoW * (0.34 + P.breath * 0.025), torsoH * 0.26, 0, 0, TAU);
      g.fill();
    }
    g.fillStyle = 'rgba(0,0,0,0.055)';
    g.beginPath();
    g.moveTo(tx + waW * 0.2, ty + torsoH * 0.18);
    g.quadraticCurveTo(tx + waW * 0.95, ty + torsoH * 0.5, tx + hipW * 0.92, bodyBot - rr * 0.4);
    g.quadraticCurveTo(tx + waW * 0.6, ty + torsoH * 0.5, tx + waW * 0.2, ty + torsoH * 0.18);
    g.fill();

    /* пояс */
    if (!look.dress && age > 9) {
      g.fillStyle = shade(look.cloth2, -0.45);
      g.fillRect(tx - hipW * 0.98, bodyBot - fh * 0.028, hipW * 1.96, fh * 0.022);
      g.fillStyle = '#c9a44c';
      g.fillRect(tx - fh * 0.016, bodyBot - fh * 0.03, fh * 0.032, fh * 0.026);
    }

    /* ------------------------------ руки ------------------------------ */
    var armLen = fh * m.arm;
    var sleeve = shade(look.cloth, -0.1);
    var armW = torsoW * 0.235, wristW = torsoW * 0.17;
    var shL = tx - shW * 0.92, shR = tx + shW * 0.92;
    var shY = ty + rr * 0.55;
    var cuffCol = look.sleeveless ? null : shade(look.cloth, -0.22);
    var upperCol = look.sleeveless ? shade(skin, -0.04) : sleeve;
    var handsL = limb(g, shL, shY, -P.arms.ls, armLen * 0.5, -P.arms.le, armLen * 0.5,
      armW, wristW, upperCol, skin, { cuff: cuffCol });
    var handsR = limb(g, shR, shY, P.arms.rs, armLen * 0.5, P.arms.re, armLen * 0.5,
      armW, wristW, upperCol, skin, { cuff: cuffCol });

    /* ---------------------------- шея и ворот -------------------------- */
    var hx = cx + leanX + P.head.x * fh;
    var hy = headCY + P.head.nod * headR * 0.22;
    var neckW = headR * 0.54;
    g.fillStyle = shade(skin, -0.12);
    g.beginPath();
    g.moveTo(hx - neckW / 2, hy + headR * 0.55);
    g.lineTo(hx + neckW / 2, hy + headR * 0.55);
    g.lineTo(tx + neckW * 0.62, ty + rr * 0.2);
    g.lineTo(tx - neckW * 0.62, ty + rr * 0.2);
    g.closePath(); g.fill();

    /* воротник */
    g.fillStyle = shade(look.cloth, 0.1);
    g.beginPath();
    g.moveTo(tx - shW * 0.56, ty + rr * 0.05);
    g.quadraticCurveTo(tx, ty + rr * (look.dress ? 1.25 : 0.85), tx + shW * 0.56, ty + rr * 0.05);
    g.quadraticCurveTo(tx, ty - rr * 0.3, tx - shW * 0.56, ty + rr * 0.05);
    g.fill();

    drawHead(g, pt, P, hx, hy, headR, skin, hairCol, look, life, age, grayK);

    /* реквизит в руках */
    drawHandProps(g, pt, P, handsL, handsR, fh, skin);

    if (lying) g.restore();

    /* свечение */
    if (P.glow > 0.01) {
      var gg = g.createRadialGradient(cx, headCY, headR * 0.5, cx, headCY, headR * 6);
      gg.addColorStop(0, 'rgba(232,180,90,' + (P.glow * 0.3).toFixed(3) + ')');
      gg.addColorStop(1, 'rgba(232,180,90,0)');
      g.fillStyle = gg; g.fillRect(0, 0, W, H);
    }
  }

  function roundPath(g, x, y, w, h, r1, r2, r3, r4) {
    g.beginPath();
    g.moveTo(x + r1, y);
    g.lineTo(x + w - r2, y); g.quadraticCurveTo(x + w, y, x + w, y + r2);
    g.lineTo(x + w, y + h - r3); g.quadraticCurveTo(x + w, y + h, x + w - r3, y + h);
    g.lineTo(x + r4, y + h); g.quadraticCurveTo(x, y + h, x, y + h - r4);
    g.lineTo(x, y + r1); g.quadraticCurveTo(x, y, x + r1, y);
    g.closePath();
  }

  /* ============================ ГОЛОВА =============================== */

  function drawHead(g, pt, P, hx, hy, r, skin, hairCol, look, life, age, grayK) {
    g.save();
    g.translate(hx, hy);
    g.rotate(P.head.rot);

    var rw = r * (look.round ? 0.92 : 0.86);
    var rh = r * (look.round ? 0.96 : 1.02);
    var jaw = look.jaw * (age < 12 ? 1.08 : 1);

    /* волосы сзади (длинные пряди, пучок, афро) */
    drawHairBack(g, P, r, hairCol, look, life, age);

    /* уши */
    g.fillStyle = shade(skin, -0.12);
    g.beginPath(); g.ellipse(-rw * 0.99, r * 0.05, r * 0.14 * look.ears, r * 0.2 * look.ears, 0, 0, TAU); g.fill();
    g.beginPath(); g.ellipse(rw * 0.99, r * 0.05, r * 0.14 * look.ears, r * 0.2 * look.ears, 0, 0, TAU); g.fill();

    /* череп и подбородок одной формой */
    g.fillStyle = skin;
    g.beginPath();
    g.moveTo(-rw, -rh * 0.12);
    g.bezierCurveTo(-rw * 1.03, -rh * 1.02, rw * 1.03, -rh * 1.02, rw, -rh * 0.12);
    g.bezierCurveTo(rw * 0.99, rh * 0.42, rw * 0.62 * jaw, rh * 0.98, 0, rh * 1.0);
    g.bezierCurveTo(-rw * 0.62 * jaw, rh * 0.98, -rw * 0.99, rh * 0.42, -rw, -rh * 0.12);
    g.closePath();
    g.fill();

    /* тень у скул */
    g.fillStyle = 'rgba(0,0,0,0.07)';
    g.beginPath();
    g.moveTo(rw * 0.98, -rh * 0.1);
    g.bezierCurveTo(rw * 0.97, rh * 0.42, rw * 0.6 * jaw, rh * 0.96, 0, rh * 0.99);
    g.bezierCurveTo(rw * 0.3, rh * 0.6, rw * 0.62, rh * 0.2, rw * 0.6, -rh * 0.1);
    g.closePath(); g.fill();

    var eyeY = -r * 0.02, eyeDX = r * 0.35, eyeR = r * 0.165;
    var openL = clamp(P.eyes.open * (1 - P.eyes.wink), 0, 1.4);
    var openR = clamp(P.eyes.open, 0, 1.4);

    /* брови */
    g.strokeStyle = shade(hairCol, -0.12);
    g.lineWidth = Math.max(1, r * (look.thickBrows ? 0.085 : 0.06));
    g.lineCap = 'round';
    var browY = eyeY - r * 0.3 - P.brows.raise * r * 0.1;
    [-1, 1].forEach(function (s) {
      var inner = browY + P.brows.angry * r * 0.13 - P.brows.sad * r * 0.11;
      var outer = browY - P.brows.angry * r * 0.05 + P.brows.sad * r * 0.09;
      g.beginPath();
      g.moveTo(s * (eyeDX - eyeR * 0.95), inner);
      g.quadraticCurveTo(s * eyeDX * 1.02, browY - r * 0.08, s * (eyeDX + eyeR * 0.85), outer);
      g.stroke();
    });

    eye(g, -eyeDX, eyeY, eyeR, openL, P, look, -1);
    eye(g, eyeDX, eyeY, eyeR, openR, P, look, 1);

    /* нос: мягкая тень + крыло */
    var ny = eyeY + r * 0.4;
    g.fillStyle = 'rgba(0,0,0,0.075)';
    g.beginPath();
    g.moveTo(-r * 0.015, eyeY + r * 0.14);
    g.quadraticCurveTo(-r * 0.13 * look.nose, ny - r * 0.02, -r * 0.1 * look.nose, ny + r * 0.03);
    g.quadraticCurveTo(0, ny + r * 0.11, r * 0.1 * look.nose, ny + r * 0.03);
    g.quadraticCurveTo(r * 0.09 * look.nose, ny - r * 0.06, r * 0.02, eyeY + r * 0.1);
    g.fill();
    g.fillStyle = 'rgba(0,0,0,0.2)';
    circle(g, -r * 0.08 * look.nose, ny + r * 0.03, r * 0.025);
    circle(g, r * 0.08 * look.nose, ny + r * 0.03, r * 0.025);

    /* борода рисуется под губами, усы — поверх */
    var my = r * 0.58, mw = r * 0.24 * P.mouth.width, sm = P.mouth.smile, op = clamp(P.mouth.open, 0, 1);
    var lip = look.lip;
    drawBeard(g, r, hairCol, look, life, age, grayK);

    if (op > 0.22) {
      g.fillStyle = '#4a1f1d';
      g.beginPath();
      g.moveTo(-mw, my);
      g.quadraticCurveTo(0, my - r * 0.06 + sm * r * 0.04, mw, my);
      g.quadraticCurveTo(0, my + r * 0.1 + op * r * 0.3, -mw, my);
      g.fill();
      g.fillStyle = '#f3ece0';
      g.beginPath();
      g.moveTo(-mw * 0.82, my + r * 0.005);
      g.quadraticCurveTo(0, my - r * 0.04, mw * 0.82, my + r * 0.005);
      g.quadraticCurveTo(0, my + r * 0.05, -mw * 0.82, my + r * 0.005);
      g.fill();
    } else {
      g.fillStyle = lip;
      g.beginPath();
      g.moveTo(-mw, my);
      g.quadraticCurveTo(-mw * 0.45, my - r * 0.075, 0, my - r * 0.025);
      g.quadraticCurveTo(mw * 0.45, my - r * 0.075, mw, my);
      g.quadraticCurveTo(mw * 0.5, my + r * 0.07 + sm * r * 0.09, 0, my + r * 0.08 + sm * r * 0.1);
      g.quadraticCurveTo(-mw * 0.5, my + r * 0.07 + sm * r * 0.09, -mw, my);
      g.fill();
      g.strokeStyle = 'rgba(80,30,28,0.55)';
      g.lineWidth = Math.max(0.8, r * 0.022);
      g.beginPath();
      g.moveTo(-mw, my);
      g.quadraticCurveTo(0, my + sm * r * 0.1 + r * 0.015, mw, my);
      g.stroke();
    }

    /* щёки, веснушки, морщины */
    if (P.blush || age < 10) {
      g.fillStyle = 'rgba(200,110,90,' + (0.1 + (P.blush || 0) * 0.22).toFixed(2) + ')';
      g.beginPath(); g.ellipse(-r * 0.56, r * 0.3, r * 0.19, r * 0.13, 0, 0, TAU); g.fill();
      g.beginPath(); g.ellipse(r * 0.56, r * 0.3, r * 0.19, r * 0.13, 0, 0, TAU); g.fill();
    }
    if (look.freckles && age > 4 && age < 45) {
      g.fillStyle = 'rgba(120,70,40,0.3)';
      for (var i = 0; i < 8; i++) {
        var side = i < 4 ? -1 : 1;
        var fx2 = side * (r * 0.42 + (i % 4) * r * 0.1);
        circle(g, fx2, r * 0.26 + ((i % 2) * r * 0.07), r * 0.022);
      }
    }
    if (age > 42) {
      var wk = clamp((age - 42) / 45, 0, 1);
      g.strokeStyle = 'rgba(60,40,28,' + (0.14 + wk * 0.26).toFixed(2) + ')';
      g.lineWidth = Math.max(0.7, r * 0.022);
      g.beginPath();
      g.moveTo(-r * 0.42, -r * 0.46); g.quadraticCurveTo(0, -r * 0.54, r * 0.42, -r * 0.46);
      g.moveTo(-r * 0.68, r * 0.04); g.lineTo(-r * 0.8, r * 0.12);
      g.moveTo(r * 0.68, r * 0.04); g.lineTo(r * 0.8, r * 0.12);
      if (wk > 0.35) {
        g.moveTo(-r * 0.3, r * 0.62); g.quadraticCurveTo(-r * 0.38, r * 0.42, -r * 0.28, r * 0.3);
        g.moveTo(r * 0.3, r * 0.62); g.quadraticCurveTo(r * 0.38, r * 0.42, r * 0.28, r * 0.3);
      }
      g.stroke();
    }

    drawMoustache(g, r, hairCol, look, life, age, grayK, my);

    /* волосы спереди */
    drawHair(g, P, r, hairCol, look, life, age);

    /* слёзы, пот, повязка, шапки */
    if (P.eyes.tear > 0.02) {
      g.fillStyle = 'rgba(150,200,230,0.85)';
      var ty2 = eyeY + eyeR + P.eyes.tear * r * 0.9;
      circle(g, -eyeDX, ty2, r * 0.06); circle(g, eyeDX, ty2 - r * 0.1, r * 0.05);
    }
    if (P.sweat > 0.1) {
      g.fillStyle = 'rgba(180,215,235,' + (0.5 * P.sweat).toFixed(2) + ')';
      circle(g, -r * 0.72, -r * 0.52, r * 0.07); circle(g, r * 0.64, -r * 0.6, r * 0.06);
    }
    if (P.props.patch) {
      /* влажный компресс, повторяющий изгиб лба */
      g.fillStyle = 'rgba(196,214,216,0.85)';
      g.beginPath();
      g.moveTo(-r * 0.82, -r * 0.48);
      g.quadraticCurveTo(0, -r * 0.92, r * 0.82, -r * 0.48);
      g.quadraticCurveTo(0, -r * 0.66, -r * 0.82, -r * 0.48);
      g.fill();
      g.fillStyle = 'rgba(120,150,160,0.35)';
      g.beginPath();
      g.moveTo(-r * 0.8, -r * 0.5);
      g.quadraticCurveTo(0, -r * 0.7, r * 0.8, -r * 0.5);
      g.quadraticCurveTo(0, -r * 0.62, -r * 0.8, -r * 0.5);
      g.fill();
    }
    if (P.props.cap) {
      g.fillStyle = '#1d2630';
      g.beginPath();
      g.moveTo(-rw * 1.02, -rh * 0.42);
      g.bezierCurveTo(-rw * 1.04, -rh * 1.12, rw * 1.04, -rh * 1.12, rw * 1.02, -rh * 0.42);
      g.closePath(); g.fill();
      g.fillStyle = '#16202a';
      roundPath(g, -rw * 1.15, -rh * 0.5, rw * 2.3, rh * 0.16, r * 0.07, r * 0.07, r * 0.07, r * 0.07); g.fill();
      g.fillStyle = '#e8b45a'; circle(g, 0, -rh * 0.78, r * 0.08);
    }
    if (P.props.helmet) {
      g.fillStyle = '#d9a33c';
      g.beginPath(); g.arc(0, -r * 0.22, r * 1.0, Math.PI, 0); g.fill();
      roundPath(g, -r * 1.14, -r * 0.3, r * 2.28, r * 0.13, r * 0.06, r * 0.06, r * 0.06, r * 0.06); g.fill();
    }
    if (P.props.veil) {
      g.fillStyle = 'rgba(255,255,255,0.35)';
      g.beginPath(); g.moveTo(-r, -r * 0.6); g.quadraticCurveTo(0, -r * 1.6, r, -r * 0.6);
      g.quadraticCurveTo(r * 1.4, r * 1.2, 0, r * 1.5); g.quadraticCurveTo(-r * 1.4, r * 1.2, -r, -r * 0.6); g.fill();
    }
    if (P.props.cigarette) {
      g.strokeStyle = '#efe7d8'; g.lineWidth = Math.max(1, r * 0.06);
      g.beginPath(); g.moveTo(r * 0.24, my); g.lineTo(r * 0.64, my - r * 0.05); g.stroke();
      g.fillStyle = '#e8743a'; circle(g, r * 0.66, my - r * 0.06, r * 0.045);
    }

    g.restore();
  }

  /* миндалевидный глаз с веком и ресницами */
  function eye(g, x, y, r, open, P, look, side) {
    g.save();
    g.translate(x, y);
    var oh = r * clamp(open, 0.02, 1.4) * 0.63 * (1 - P.eyes.squint * 0.6);
    if (open < 0.1) {
      g.strokeStyle = shade(look.skin, -0.45);
      g.lineWidth = Math.max(1, r * 0.13);
      g.lineCap = 'round';
      g.beginPath(); g.moveTo(-r * 0.78, 0); g.quadraticCurveTo(0, r * 0.22, r * 0.78, 0); g.stroke();
      g.restore();
      return;
    }
    g.beginPath();
    g.moveTo(-r * 0.82, 0);
    g.quadraticCurveTo(-r * 0.3, -oh * 1.5, r * 0.2, -oh * 1.3);
    g.quadraticCurveTo(r * 0.68, -oh * 1.05, r * 0.82, 0);
    g.quadraticCurveTo(r * 0.3, oh * 1.25, -r * 0.4, oh * 1.0);
    g.quadraticCurveTo(-r * 0.72, oh * 0.7, -r * 0.82, 0);
    g.closePath();
    g.save();
    g.clip();
    g.fillStyle = '#efe9dd';
    g.fillRect(-r, -r * 2, r * 2, r * 4);
    var px = P.eyes.lx * r * 0.3, py = P.eyes.ly * oh * 0.4;
    g.fillStyle = look.eye;
    circle(g, px, py, r * 0.62);
    g.fillStyle = 'rgba(0,0,0,0.22)';
    circle(g, px, py - r * 0.16, r * 0.62);
    g.fillStyle = '#0d0b09';
    circle(g, px, py, r * 0.27);
    g.fillStyle = 'rgba(255,255,255,0.9)';
    circle(g, px - r * 0.18, py - r * 0.2, r * 0.1);
    g.restore();
    /* верхнее веко */
    g.strokeStyle = 'rgba(40,26,18,0.75)';
    g.lineWidth = Math.max(0.9, r * 0.11);
    g.lineCap = 'round';
    g.beginPath();
    g.moveTo(-r * 0.82, 0);
    g.quadraticCurveTo(-r * 0.3, -oh * 1.5, r * 0.2, -oh * 1.3);
    g.quadraticCurveTo(r * 0.68, -oh * 1.05, r * 0.82, 0);
    g.stroke();
    if (look.lashes) {
      g.lineWidth = Math.max(0.7, r * 0.07);
      g.beginPath();
      g.moveTo(side * r * 0.8, -r * 0.04);
      g.lineTo(side * r * 1.05, -r * 0.2);
      g.stroke();
    }
    g.restore();
  }

  /* борода по линии челюсти (рисуется под губами) */
  function drawBeard(g, r, col, look, life, age, grayK) {
    if (life.sex !== 'm' || age < 17) return;
    var f = look.facial;
    if (f === 'none' || f === 'moustache') return;
    var c = mix(shade(col, 0.1), '#d8d4cc', grayK);
    g.fillStyle = c;
    if (f === 'stubble') {
      g.globalAlpha = 0.3;
      g.beginPath();
      g.moveTo(-r * 0.74, r * 0.22);
      g.quadraticCurveTo(-r * 0.66, r * 1.02, 0, r * 1.04);
      g.quadraticCurveTo(r * 0.66, r * 1.02, r * 0.74, r * 0.22);
      g.quadraticCurveTo(r * 0.4, r * 0.56, 0, r * 0.58);
      g.quadraticCurveTo(-r * 0.4, r * 0.56, -r * 0.74, r * 0.22);
      g.fill();
      g.globalAlpha = 1;
      return;
    }
    if (f === 'goatee') {
      g.beginPath();
      g.moveTo(-r * 0.13, r * 0.78);
      g.quadraticCurveTo(0, r * 0.72, r * 0.13, r * 0.78);
      g.quadraticCurveTo(r * 0.11, r * 0.95, 0, r * 0.96);
      g.quadraticCurveTo(-r * 0.11, r * 0.95, -r * 0.13, r * 0.78);
      g.fill();
      return;
    }
    /* полная или длинная борода: челюсть, подбородок, вырез под рот */
    var low = f === 'long' ? r * 1.5 : r * 1.1;
    g.beginPath();
    g.moveTo(-r * 0.76, r * 0.26);
    g.quadraticCurveTo(-r * 0.7, low * 0.8, 0, low);
    g.quadraticCurveTo(r * 0.7, low * 0.8, r * 0.76, r * 0.26);
    g.quadraticCurveTo(r * 0.52, r * 0.52, r * 0.3, r * 0.52);
    g.quadraticCurveTo(0, r * 0.78, -r * 0.3, r * 0.52);
    g.quadraticCurveTo(-r * 0.52, r * 0.52, -r * 0.76, r * 0.26);
    g.fill();
    /* бакенбарды к ушам */
    g.beginPath();
    g.moveTo(-r * 0.9, -r * 0.1);
    g.quadraticCurveTo(-r * 0.84, r * 0.26, -r * 0.72, r * 0.4);
    g.lineTo(-r * 0.76, r * 0.04);
    g.fill();
    g.beginPath();
    g.moveTo(r * 0.9, -r * 0.1);
    g.quadraticCurveTo(r * 0.84, r * 0.26, r * 0.72, r * 0.4);
    g.lineTo(r * 0.76, r * 0.04);
    g.fill();
  }

  /* усы — поверх верхней губы */
  function drawMoustache(g, r, col, look, life, age, grayK, my) {
    if (life.sex !== 'm' || age < 17) return;
    var f = look.facial;
    if (f === 'none' || f === 'stubble') return;
    g.fillStyle = mix(shade(col, -0.05), '#d8d4cc', grayK);
    var w = f === 'moustache' ? 0.26 : 0.21;
    g.beginPath();
    g.moveTo(-r * w, my - r * 0.12);
    g.quadraticCurveTo(0, my - r * 0.22, r * w, my - r * 0.12);
    g.quadraticCurveTo(r * w * 0.5, my - r * 0.07, 0, my - r * 0.1);
    g.quadraticCurveTo(-r * w * 0.5, my - r * 0.07, -r * w, my - r * 0.12);
    g.fill();
  }

  /* волосы за головой: длинные пряди, пучок, афро */
  function drawHairBack(g, P, r, col, look, life, age) {
    var st = hairStyleNow(look, life, age);
    if (st === 'bald' || st === 'scarf' || st === 'crop') return;
    var flow = P.hairFlow * r * 0.16;
    g.fillStyle = shade(col, -0.12);
    if (st === 'afro') {
      circle(g, 0, -r * 0.18, r * 1.3);
      return;
    }
    if (st === 'long' || st === 'bob') {
      var drop = st === 'long' ? r * 1.85 : r * 1.0;
      g.beginPath();
      g.moveTo(-r * 0.98, -r * 0.3);
      g.quadraticCurveTo(-r * 1.3 - flow, r * 0.6, -r * 1.02 - flow, drop);
      g.quadraticCurveTo(0, drop + r * 0.3, r * 1.02 + flow, drop);
      g.quadraticCurveTo(r * 1.3 + flow, r * 0.6, r * 0.98, -r * 0.3);
      g.closePath(); g.fill();
    } else if (st === 'pony') {
      g.beginPath();
      g.moveTo(r * 0.7, -r * 0.5);
      g.quadraticCurveTo(r * 1.5 + flow, r * 0.1, r * 1.15 + flow, r * 1.25);
      g.quadraticCurveTo(r * 0.85, r * 0.6, r * 0.55, -r * 0.1);
      g.closePath(); g.fill();
    } else if (st === 'braid') {
      for (var i = 0; i < 4; i++) {
        circle(g, r * (0.85 + i * 0.07) + flow * (i / 3), -r * 0.2 + i * r * 0.42, r * (0.3 - i * 0.045));
      }
    } else if (st === 'bun') {
      circle(g, 0, -r * 1.12, r * 0.42);
      circle(g, -r * 0.14, -r * 1.2, r * 0.3);
    }
  }

  function hairStyleNow(look, life, age) {
    if (look.covered) return 'scarf';
    if (age < 2) return 'baby';
    if (life.sex === 'm' && look.balding && age > 46 && (age - 46) / 40 > 0.25) return 'bald';
    return look.hairStyle;
  }

  /* волосы спереди: линия роста, чёлка, объём */
  function drawHair(g, P, r, col, look, life, age) {
    var st = hairStyleNow(look, life, age);
    g.fillStyle = col;

    if (st === 'scarf') {
      g.fillStyle = look.scarfCol;
      g.beginPath();
      /* внешний контур платка */
      g.moveTo(-r * 1.08, r * 0.3);
      g.quadraticCurveTo(-r * 1.16, -r * 1.22, 0, -r * 1.22);
      g.quadraticCurveTo(r * 1.16, -r * 1.22, r * 1.08, r * 0.3);
      g.quadraticCurveTo(r * 1.0, r * 1.15, 0, r * 1.3);
      g.quadraticCurveTo(-r * 1.0, r * 1.15, -r * 1.08, r * 0.3);
      g.closePath();
      /* вырез для лица — та же фигура, обход в другую сторону */
      g.moveTo(0, -r * 0.92);
      g.bezierCurveTo(r * 0.84, -r * 0.92, r * 0.9, r * 0.1, r * 0.62, r * 0.6);
      g.bezierCurveTo(r * 0.36, r * 1.0, -r * 0.36, r * 1.0, -r * 0.62, r * 0.6);
      g.bezierCurveTo(-r * 0.9, r * 0.1, -r * 0.84, -r * 0.92, 0, -r * 0.92);
      g.closePath();
      g.fill('evenodd');
      /* складка под подбородком */
      g.fillStyle = 'rgba(0,0,0,0.14)';
      g.beginPath();
      g.moveTo(-r * 0.96, r * 0.55);
      g.quadraticCurveTo(0, r * 1.05, r * 0.96, r * 0.55);
      g.quadraticCurveTo(0, r * 1.38, -r * 0.96, r * 0.55);
      g.fill();
      return;
    }
    if (st === 'bald') {
      g.beginPath();
      g.moveTo(-r * 0.92, -r * 0.14);
      g.quadraticCurveTo(-r * 0.96, -r * 0.6, -r * 0.5, -r * 0.66);
      g.quadraticCurveTo(-r * 0.74, -r * 0.3, -r * 0.84, r * 0.1);
      g.fill();
      g.beginPath();
      g.moveTo(r * 0.92, -r * 0.14);
      g.quadraticCurveTo(r * 0.96, -r * 0.6, r * 0.5, -r * 0.66);
      g.quadraticCurveTo(r * 0.74, -r * 0.3, r * 0.84, r * 0.1);
      g.fill();
      return;
    }
    if (st === 'baby') {
      g.beginPath();
      g.moveTo(-r * 0.5, -r * 0.78);
      g.quadraticCurveTo(0, -r * 1.14, r * 0.5, -r * 0.78);
      g.quadraticCurveTo(r * 0.2, -r * 0.92, 0, -r * 0.86);
      g.quadraticCurveTo(-r * 0.2, -r * 0.92, -r * 0.5, -r * 0.78);
      g.fill();
      return;
    }

    /* базовая шапка волос по черепу */
    var top = -r * 1.08, side = r * 0.98;
    g.beginPath();
    g.moveTo(-side, r * 0.1);
    g.bezierCurveTo(-side * 1.06, top, side * 1.06, top, side, r * 0.1);
    if (st === 'crop') {
      g.quadraticCurveTo(side * 0.72, -r * 0.42, 0, -r * 0.46);
      g.quadraticCurveTo(-side * 0.72, -r * 0.42, -side, r * 0.1);
    } else if (st === 'side') {
      g.quadraticCurveTo(side * 0.5, -r * 0.3, -side * 0.1, -r * 0.44);
      g.quadraticCurveTo(-side * 0.6, -r * 0.52, -side, r * 0.1);
    } else if (st === 'fringe' || st === 'bob' || st === 'long') {
      g.quadraticCurveTo(side * 0.8, -r * 0.12, 0, -r * 0.26);
      g.quadraticCurveTo(-side * 0.8, -r * 0.12, -side, r * 0.1);
    } else {
      g.quadraticCurveTo(side * 0.76, -r * 0.34, 0, -r * 0.4);
      g.quadraticCurveTo(-side * 0.76, -r * 0.34, -side, r * 0.1);
    }
    g.closePath();
    g.fill();

    if (look.curly || st === 'afro') {
      for (var i = 0; i <= 12; i++) {
        var a = Math.PI * (1 + i / 12);
        circle(g, Math.cos(a) * r * 0.84, Math.sin(a) * r * 0.86 - r * 0.14, r * 0.24);
      }
    }
    if (st === 'bun') {
      g.fillStyle = shade(col, -0.08);
      circle(g, 0, -r * 1.05, r * 0.3);
    }

  }

  function drawHandProps(g, pt, P, L, R, fh, skin) {
    var s = fh * 0.12;
    if (P.props.book) {
      g.fillStyle = '#9a5f3a'; g.fillRect((L.hx + R.hx) / 2 - s, (L.hy + R.hy) / 2 - s * 0.6, s * 2, s * 1.2);
      g.fillStyle = '#efe7d8'; g.fillRect((L.hx + R.hx) / 2 - s * 0.9, (L.hy + R.hy) / 2 - s * 0.5, s * 1.8, s);
      g.strokeStyle = '#9a5f3a'; g.lineWidth = 1.2;
      g.beginPath(); g.moveTo((L.hx + R.hx) / 2, (L.hy + R.hy) / 2 - s * 0.5); g.lineTo((L.hx + R.hx) / 2, (L.hy + R.hy) / 2 + s * 0.5); g.stroke();
    }
    if (P.props.phone) { g.fillStyle = '#1b2228'; g.fillRect(R.hx - s * 0.25, R.hy - s * 0.45, s * 0.5, s * 0.9); }
    if (P.props.money) {
      g.fillStyle = '#7fae6b';
      for (var i = 0; i < 3; i++) g.fillRect(R.hx - s * 0.6 + i * 3, R.hy - s * 0.3 - i * 2, s * 1.1, s * 0.5);
    }
    if (P.props.cane) {
      g.strokeStyle = '#6b4a2c'; g.lineWidth = Math.max(2, fh * 0.018); g.lineCap = 'round';
      g.beginPath(); g.moveTo(R.hx, R.hy); g.lineTo(R.hx + fh * 0.04, R.hy + fh * 0.33); g.stroke();
    }
    if (P.props.bag) {
      g.fillStyle = '#5c4a38'; g.fillRect(R.hx - s * 0.5, R.hy, s, s * 0.8);
      g.strokeStyle = '#5c4a38'; g.lineWidth = 2;
      g.beginPath(); g.arc(R.hx, R.hy, s * 0.4, Math.PI, 0); g.stroke();
    }
    if (P.props.suitcase) { g.fillStyle = '#4a3a2c'; g.fillRect(R.hx - s * 0.6, R.hy, s * 1.2, s * 0.9); }
    if (P.props.box) { g.fillStyle = '#8a6a44'; g.fillRect((L.hx + R.hx) / 2 - s, (L.hy + R.hy) / 2 - s, s * 2, s * 1.6); }
    if (P.props.baby) {
      var bx = (L.hx + R.hx) / 2, by = (L.hy + R.hy) / 2;
      /* пелёнка */
      g.fillStyle = '#e4d8c4';
      g.beginPath(); g.ellipse(bx, by, s * 1.1, s * 0.66, -0.26, 0, Math.PI * 2); g.fill();
      g.fillStyle = 'rgba(0,0,0,0.08)';
      g.beginPath(); g.ellipse(bx + s * 0.1, by + s * 0.16, s * 0.9, s * 0.4, -0.26, 0, Math.PI * 2); g.fill();
      /* личико */
      var hx2 = bx - s * 0.82, hy2 = by - s * 0.34;
      g.fillStyle = skin; circle(g, hx2, hy2, s * 0.46);
      g.fillStyle = 'rgba(60,40,28,0.75)';
      g.beginPath();
      g.moveTo(hx2 - s * 0.22, hy2 - s * 0.02); g.quadraticCurveTo(hx2 - s * 0.11, hy2 + s * 0.08, hx2, hy2 - s * 0.02);
      g.moveTo(hx2 + s * 0.08, hy2 - s * 0.04); g.quadraticCurveTo(hx2 + s * 0.19, hy2 + s * 0.06, hx2 + s * 0.3, hy2 - s * 0.04);
      g.strokeStyle = 'rgba(60,40,28,0.75)'; g.lineWidth = Math.max(0.8, s * 0.07);
      g.stroke();
      g.fillStyle = 'rgba(190,110,96,0.7)';
      circle(g, hx2 + s * 0.04, hy2 + s * 0.2, s * 0.08);
      /* чепчик */
      g.fillStyle = '#d6c7ae';
      g.beginPath();
      g.arc(hx2, hy2 - s * 0.06, s * 0.47, Math.PI * 1.08, Math.PI * 2.02);
      g.closePath(); g.fill();
    }
    if (P.props.bouquet) {
      g.strokeStyle = '#4a6b3a'; g.lineWidth = 2;
      g.beginPath(); g.moveTo(L.hx, L.hy); g.lineTo(L.hx - s * 0.2, L.hy - s); g.stroke();
      g.fillStyle = '#d9728f'; circle(g, L.hx - s * 0.25, L.hy - s * 1.1, s * 0.35);
      g.fillStyle = '#e8b45a'; circle(g, L.hx - s * 0.05, L.hy - s * 0.95, s * 0.25);
    }
    if (P.props.weights) {
      g.fillStyle = '#39414a';
      g.fillRect(L.hx - s * 0.45, L.hy - s * 0.3, s * 0.9, s * 0.6);
      g.fillRect(R.hx - s * 0.45, R.hy - s * 0.3, s * 0.9, s * 0.6);
    }
    if (P.props.hoe) {
      g.strokeStyle = '#6b4a2c'; g.lineWidth = Math.max(2, fh * 0.016);
      g.beginPath(); g.moveTo(R.hx, R.hy); g.lineTo(R.hx + fh * 0.16, R.hy + fh * 0.22); g.stroke();
      g.fillStyle = '#8a8f94'; g.fillRect(R.hx + fh * 0.14, R.hy + fh * 0.2, fh * 0.08, fh * 0.03);
    }
    if (P.props.sign) {
      g.strokeStyle = '#6b4a2c'; g.lineWidth = 2;
      g.beginPath(); g.moveTo(R.hx, R.hy); g.lineTo(R.hx, R.hy - fh * 0.2); g.stroke();
      g.fillStyle = '#efe7d8'; g.fillRect(R.hx - s, R.hy - fh * 0.3, s * 2, s * 1.1);
    }
    if (P.props.medal) {
      g.strokeStyle = '#e8b45a'; g.lineWidth = 2;
      g.beginPath(); g.arc(R.hx, R.hy, s * 0.4, 0, Math.PI * 2); g.stroke();
      g.fillStyle = '#e8b45a'; circle(g, R.hx, R.hy, s * 0.3);
    }
    if (P.props.cup) { g.fillStyle = '#c9c2b4'; g.fillRect(R.hx - s * 0.3, R.hy - s * 0.4, s * 0.6, s * 0.7); }
    if (P.props.pot) {
      g.fillStyle = '#4c5257'; g.fillRect(R.hx - s * 0.7, R.hy - s * 0.3, s * 1.4, s * 0.8);
      g.fillStyle = 'rgba(240,236,223,0.25)';
      for (var p3 = 0; p3 < 3; p3++) circle(g, R.hx - s * 0.3 + p3 * s * 0.3, R.hy - s * 0.6 - p3 * 2, s * 0.14);
    }
    if (P.props.tray) { g.fillStyle = '#b9b2a4'; g.fillRect((L.hx + R.hx) / 2 - s, (L.hy + R.hy) / 2 - s * 0.2, s * 2, s * 0.3); }
    if (P.props.keys) {
      g.strokeStyle = '#e8b45a'; g.lineWidth = 2;
      g.beginPath(); g.arc(R.hx, R.hy + s * 0.3, s * 0.2, 0, Math.PI * 2); g.stroke();
      g.beginPath(); g.moveTo(R.hx, R.hy + s * 0.5); g.lineTo(R.hx, R.hy + s * 0.9); g.stroke();
    }
    if (P.props.diploma) {
      g.fillStyle = '#efe7d8'; g.save(); g.translate(R.hx, R.hy); g.rotate(-0.4);
      g.fillRect(-s * 0.15, -s * 0.6, s * 0.3, s * 1.2); g.restore();
    }
    if (P.props.laptop) {
      g.fillStyle = '#2a3138';
      g.fillRect((L.hx + R.hx) / 2 - s, (L.hy + R.hy) / 2 - s * 0.1, s * 2, s * 0.2);
      g.fillStyle = '#39434d'; g.fillRect((L.hx + R.hx) / 2 - s * 0.9, (L.hy + R.hy) / 2 - s * 1.1, s * 1.8, s);
      g.fillStyle = 'rgba(160,220,255,0.3)'; g.fillRect((L.hx + R.hx) / 2 - s * 0.8, (L.hy + R.hy) / 2 - s, s * 1.6, s * 0.8);
    }
  }

  /* спутник рядом: простая, но узнаваемая фигура человека */
  function sideFigure(g, x, gy, h, kind, alpha) {
    var headR = h * (kind === 'c' ? 0.17 : 0.13);
    var legY = gy - h * 0.46, shY = gy - h * (kind === 'c' ? 0.66 : 0.72);
    var tw2 = h * (kind === 'm' ? 0.155 : kind === 'f' ? 0.135 : 0.14);
    var skin = 'rgba(222,188,156,' + alpha + ')';
    var cloth = kind === 'f' ? 'rgba(150,132,166,' + alpha + ')'
      : kind === 'c' ? 'rgba(146,168,150,' + alpha + ')' : 'rgba(132,148,170,' + alpha + ')';
    var hair = 'rgba(54,44,38,' + (alpha + 0.2) + ')';
    /* ноги и обувь */
    g.fillStyle = 'rgba(92,96,104,' + alpha + ')';
    roundPath(g, x - tw2 * 0.52, legY, tw2 * 0.42, gy - legY - h * 0.02, 0, 0, h * 0.01, h * 0.01); g.fill();
    roundPath(g, x + tw2 * 0.1, legY, tw2 * 0.42, gy - legY - h * 0.02, 0, 0, h * 0.01, h * 0.01); g.fill();
    g.fillStyle = 'rgba(48,44,40,' + (alpha + 0.12) + ')';
    roundPath(g, x - tw2 * 0.62, gy - h * 0.035, tw2 * 0.58, h * 0.035, h * 0.016, h * 0.016, h * 0.006, h * 0.006); g.fill();
    roundPath(g, x + tw2 * 0.06, gy - h * 0.035, tw2 * 0.58, h * 0.035, h * 0.016, h * 0.016, h * 0.006, h * 0.006); g.fill();
    /* туловище */
    g.fillStyle = cloth;
    g.beginPath();
    g.moveTo(x - tw2, shY + h * 0.03);
    g.quadraticCurveTo(x - tw2 * 0.8, legY - h * 0.08, x - tw2 * (kind === 'f' ? 1.3 : 0.86), legY + h * 0.04);
    g.lineTo(x + tw2 * (kind === 'f' ? 1.3 : 0.86), legY + h * 0.04);
    g.quadraticCurveTo(x + tw2 * 0.8, legY - h * 0.08, x + tw2, shY + h * 0.03);
    g.quadraticCurveTo(x, shY - h * 0.03, x - tw2, shY + h * 0.03);
    g.fill();
    /* руки */
    g.lineCap = 'round';
    g.strokeStyle = cloth;
    g.lineWidth = tw2 * 0.42;
    g.beginPath();
    g.moveTo(x - tw2 * 0.9, shY + h * 0.05); g.lineTo(x - tw2 * 1.05, legY - h * 0.02);
    g.moveTo(x + tw2 * 0.9, shY + h * 0.05); g.lineTo(x + tw2 * 1.05, legY - h * 0.02);
    g.stroke();
    g.fillStyle = skin;
    circle(g, x - tw2 * 1.05, legY, tw2 * 0.24);
    circle(g, x + tw2 * 1.05, legY, tw2 * 0.24);
    /* шея и голова */
    g.fillStyle = skin;
    g.fillRect(x - headR * 0.3, shY - headR * 0.7, headR * 0.6, headR * 0.9);
    g.beginPath();
    g.ellipse(x, shY - headR * 1.15, headR * 0.86, headR, 0, 0, TAU);
    g.fill();
    /* причёска */
    g.fillStyle = hair;
    g.beginPath();
    if (kind === 'f') {
      g.moveTo(x - headR * 0.92, shY - headR * 1.0);
      g.quadraticCurveTo(x - headR * 1.1, shY - headR * 2.4, x, shY - headR * 2.2);
      g.quadraticCurveTo(x + headR * 1.1, shY - headR * 2.4, x + headR * 0.92, shY - headR * 1.0);
      g.quadraticCurveTo(x + headR * 1.0, shY - headR * 0.1, x + headR * 0.7, shY);
      g.quadraticCurveTo(x + headR * 0.76, shY - headR * 1.1, x + headR * 0.56, shY - headR * 1.45);
      g.quadraticCurveTo(x, shY - headR * 1.75, x - headR * 0.56, shY - headR * 1.45);
      g.quadraticCurveTo(x - headR * 0.76, shY - headR * 1.1, x - headR * 0.7, shY);
      g.quadraticCurveTo(x - headR * 1.0, shY - headR * 0.1, x - headR * 0.92, shY - headR * 1.0);
    } else {
      g.moveTo(x - headR * 0.9, shY - headR * 1.1);
      g.quadraticCurveTo(x - headR * 1.0, shY - headR * 2.35, x, shY - headR * 2.2);
      g.quadraticCurveTo(x + headR * 1.0, shY - headR * 2.35, x + headR * 0.9, shY - headR * 1.1);
      g.quadraticCurveTo(x + headR * 0.6, shY - headR * 1.6, x, shY - headR * 1.62);
      g.quadraticCurveTo(x - headR * 0.6, shY - headR * 1.6, x - headR * 0.9, shY - headR * 1.1);
    }
    g.fill();
    /* глаза и улыбка */
    g.fillStyle = 'rgba(28,24,20,' + (alpha + 0.25) + ')';
    circle(g, x - headR * 0.32, shY - headR * 1.2, headR * 0.1);
    circle(g, x + headR * 0.32, shY - headR * 1.2, headR * 0.1);
    g.strokeStyle = 'rgba(28,24,20,' + (alpha + 0.15) + ')';
    g.lineWidth = Math.max(1, headR * 0.09);
    g.beginPath();
    g.moveTo(x - headR * 0.26, shY - headR * 0.78);
    g.quadraticCurveTo(x, shY - headR * 0.58, x + headR * 0.26, shY - headR * 0.78);
    g.stroke();
  }

  function drawFrontProps(g, pt, P, W, H) {
    var life = pt.life;
    var m = metrics(life.age);
    var fh = H * 0.82 * m.h;
    var gy = H * 0.9;
    var groundY = H * 0.94 + P.rootY * H;
    var cx = W / 2;
    if (P.props.desk) {
      g.fillStyle = '#4a3b2c';
      g.fillRect(cx - fh * 0.42, gy - fh * 0.3, fh * 0.84, fh * 0.06);
      g.fillRect(cx - fh * 0.38, gy - fh * 0.24, fh * 0.05, fh * 0.24);
      g.fillRect(cx + fh * 0.33, gy - fh * 0.24, fh * 0.05, fh * 0.24);
      if (P.props.paper) { g.fillStyle = '#efe7d8'; g.fillRect(cx - fh * 0.14, gy - fh * 0.315, fh * 0.26, fh * 0.03); }
    }
    if (P.props.counter) { g.fillStyle = '#54452f'; g.fillRect(cx - fh * 0.5, gy - fh * 0.26, fh, fh * 0.08); }
    if (P.props.partner) {
      sideFigure(g, cx + fh * 0.4, groundY, fh * 1.04, life.sex === 'm' ? 'f' : 'm', 0.52);
    }
    if (P.props.kid) {
      sideFigure(g, cx - fh * 0.38, groundY, fh * 0.5, 'c', 0.58);
    }
    if (P.props.candle) {
      var cxx = cx + fh * 0.3, cyy = gy - fh * 0.1;
      g.fillStyle = '#e8e0cc'; g.fillRect(cxx - 3, cyy - 16, 6, 16);
      var fl = 6 + (P.fx.candle || 1) * 4;
      var fg2 = g.createRadialGradient(cxx, cyy - 20, 1, cxx, cyy - 20, fl * 2.2);
      fg2.addColorStop(0, 'rgba(255,220,150,0.95)'); fg2.addColorStop(1, 'rgba(255,170,60,0)');
      g.fillStyle = fg2; circle(g, cxx, cyy - 20, fl * 2);
      g.fillStyle = '#ffd98a'; circle(g, cxx, cyy - 20, fl * 0.45);
    }
    if (P.props.iv) {
      g.strokeStyle = 'rgba(200,220,230,0.6)'; g.lineWidth = 2;
      g.beginPath(); g.moveTo(cx + fh * 0.45, gy - fh * 0.8); g.lineTo(cx + fh * 0.45, gy); g.stroke();
      g.fillStyle = 'rgba(200,230,240,0.7)'; g.fillRect(cx + fh * 0.41, gy - fh * 0.86, fh * 0.08, fh * 0.12);
    }
    if (P.props.zzz) {
      g.fillStyle = 'rgba(240,236,223,0.5)';
      g.font = Math.round(fh * 0.1) + 'px Georgia, serif';
      g.fillText('z', cx + fh * 0.25, gy - fh * 0.72);
      g.fillText('z', cx + fh * 0.33, gy - fh * 0.82);
    }
    if (P.props.heart) {
      g.fillStyle = 'rgba(232,120,140,0.75)';
      var hxx = cx + fh * 0.3, hyy = gy - fh * 0.75;
      g.beginPath();
      g.moveTo(hxx, hyy + 6); g.bezierCurveTo(hxx - 9, hyy - 3, hxx - 2, hyy - 9, hxx, hyy - 3);
      g.bezierCurveTo(hxx + 2, hyy - 9, hxx + 9, hyy - 3, hxx, hyy + 6); g.fill();
    }
  }

  /* --------------------------- погода и fx --------------------------- */

  Portrait.prototype.particle = function (kind) {
    this.particles.push({
      k: kind, x: Math.random() * this.w, y: -8 - Math.random() * 40,
      v: 20 + Math.random() * 60, s: 1 + Math.random() * 2, d: Math.random() * 6.28
    });
  };

  function drawWeather(g, pt, P, W, H) {
    var t = pt.time;
    if (P.fx.rain) {
      g.strokeStyle = 'rgba(170,200,220,0.45)'; g.lineWidth = 1;
      for (var i = 0; i < 40; i++) {
        var x = ((i * 97 + t * 220) % W), y = ((i * 53 + t * 420) % H);
        g.beginPath(); g.moveTo(x, y); g.lineTo(x - 2, y + 9); g.stroke();
      }
    }
    if (P.fx.snow) {
      g.fillStyle = 'rgba(240,246,250,0.75)';
      for (var s2 = 0; s2 < 30; s2++) {
        var sx2 = ((s2 * 83 + Math.sin(t + s2) * 18 + t * 12) % W);
        var sy2 = ((s2 * 61 + t * 42) % H);
        g.fillRect(sx2, sy2, 2, 2);
      }
    }
    if (P.fx.dust) {
      g.fillStyle = 'rgba(210,180,130,0.18)';
      for (var d2 = 0; d2 < 18; d2++) {
        var dx = ((d2 * 101 + t * 70) % W), dy = H * 0.5 + Math.sin(t * 1.3 + d2) * 30;
        g.fillRect(dx, dy, 3, 1.6);
      }
    }
    if (P.fx.leaves) {
      for (var l2 = 0; l2 < 10; l2++) {
        var lx = ((l2 * 131 + t * 36) % W), ly = ((l2 * 71 + t * 54) % H);
        g.fillStyle = l2 % 2 ? 'rgba(200,140,60,0.6)' : 'rgba(170,110,50,0.55)';
        g.save(); g.translate(lx, ly); g.rotate(t + l2); g.fillRect(-3, -1.5, 6, 3); g.restore();
      }
    }
    if (P.fx.confetti) {
      for (var c3 = 0; c3 < 26; c3++) {
        var cx3 = ((c3 * 59 + Math.sin(t * 2 + c3) * 20) % W);
        var cy3 = ((c3 * 43 + t * 150) % H);
        g.fillStyle = ['#e8b45a', '#6fd08c', '#8fd4ff', '#f08ea6'][c3 % 4];
        g.save(); g.translate(cx3, cy3); g.rotate(t * 3 + c3); g.fillRect(-2.5, -1.5, 5, 3); g.restore();
      }
    }
    if (P.fx.sparkle) {
      for (var p4 = 0; p4 < 12; p4++) {
        var a2 = t * 1.4 + p4, rr = 30 + (p4 % 4) * 14;
        var px2 = W / 2 + Math.cos(a2) * rr, py2 = H * 0.45 + Math.sin(a2 * 1.3) * rr * 0.6;
        g.fillStyle = 'rgba(255,225,150,' + (0.3 + 0.4 * Math.abs(Math.sin(t * 3 + p4))).toFixed(2) + ')';
        circle(g, px2, py2, 1.6);
      }
    }
    if (P.fx.fireflies) {
      for (var ff = 0; ff < 9; ff++) {
        var fx3 = (ff * 97 + Math.sin(t * 0.7 + ff) * 40) % W;
        var fy3 = H * 0.4 + Math.cos(t * 0.9 + ff * 1.3) * 50;
        g.fillStyle = 'rgba(200,255,150,' + (0.25 + 0.5 * Math.abs(Math.sin(t * 2 + ff))).toFixed(2) + ')';
        circle(g, fx3, fy3, 2);
      }
    }
    if (P.fx.smoke) {
      for (var sm = 0; sm < 6; sm++) {
        var mt = (t * 0.6 + sm * 0.2) % 1;
        g.fillStyle = 'rgba(220,220,210,' + (0.18 * (1 - mt)).toFixed(2) + ')';
        circle(g, W / 2 + 14 + Math.sin(mt * 6 + sm) * 6, H * 0.42 - mt * 60, 3 + mt * 9);
      }
    }
    if (P.fx.balloons !== undefined && P.fx.balloons) {
      for (var bl = 0; bl < 4; bl++) {
        var by = H - ((P.fx.balloons * H * 1.4) + bl * 40) % (H * 1.4);
        var bx3 = W * (0.2 + bl * 0.2) + Math.sin(t + bl) * 8;
        g.fillStyle = ['#e8737f', '#e8b45a', '#7fb3e8', '#8fd98a'][bl];
        g.beginPath(); g.ellipse(bx3, by, 7, 9, 0, 0, Math.PI * 2); g.fill();
        g.strokeStyle = 'rgba(240,236,223,0.3)'; g.beginPath(); g.moveTo(bx3, by + 9); g.lineTo(bx3, by + 22); g.stroke();
      }
    }
    if (P.fx.cold) {
      g.fillStyle = 'rgba(190,220,240,0.10)'; g.fillRect(0, 0, W, H);
    }
    if (P.fx.plane !== undefined && P.fx.plane) {
      var plx = P.fx.plane * W * 1.2 - W * 0.1, ply = H * 0.16;
      g.fillStyle = 'rgba(240,236,223,0.8)';
      g.beginPath(); g.moveTo(plx, ply); g.lineTo(plx - 10, ply + 3); g.lineTo(plx - 4, ply + 1); g.lineTo(plx - 6, ply + 6);
      g.closePath(); g.fill();
      g.strokeStyle = 'rgba(240,236,223,0.25)'; g.lineWidth = 2;
      g.beginPath(); g.moveTo(plx - 12, ply + 2); g.lineTo(plx - 60, ply + 4); g.stroke();
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
    ambientFor: ambientFor,
    clipForLog: clipForLog,
    basePose: basePose,
    count: CLIPS.length
  };
})();
