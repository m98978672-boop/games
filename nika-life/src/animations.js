/* =============================================================================
   НИКА: ЖИВАЯ — библиотека скелетной анимации
   -----------------------------------------------------------------------------
   Каждая часть тела имеет НЕ МЕНЕЕ 10 самостоятельных анимационных клипов.
   Клип — это набор дорожек (tracks) с ключевыми кадрами [t, value], где t ∈ [0,1].
   Никаких CDN, библиотек и внешних ассетов: всё рисуется на Canvas 2D.
   ============================================================================= */
(function (root) {
  'use strict';
  const NIKA = (root.NIKA = root.NIKA || {});

  /* --- части тела ---------------------------------------------------------- */
  const PARTS = [
    { id: 'head',   label: 'Голова',      icon: '◡' },
    { id: 'face',   label: 'Лицо / мимика', icon: '☺' },
    { id: 'eyes',   label: 'Глаза',       icon: '◉' },
    { id: 'hair',   label: 'Волосы',      icon: '〰' },
    { id: 'torso',  label: 'Корпус',      icon: '▮' },
    { id: 'armL',   label: 'Левая рука',  icon: '└' },
    { id: 'armR',   label: 'Правая рука', icon: '┘' },
    { id: 'handL',  label: 'Левая кисть', icon: '✋' },
    { id: 'handR',  label: 'Правая кисть', icon: '✋' },
    { id: 'legL',   label: 'Левая нога',  icon: '╿' },
    { id: 'legR',   label: 'Правая нога', icon: '╿' },
    { id: 'skirt',  label: 'Одежда / подол', icon: '△' },
    { id: 'routine', label: 'Бытовые сцены', icon: '✦' },
    { id: 'brows',   label: 'Брови и ресницы', icon: '⌒' },
    { id: 'lips',    label: 'Губы',           icon: '◡' },
    { id: 'ears',    label: 'Уши и серёжки',  icon: '◖' },
    { id: 'neck',    label: 'Шея и ключицы',  icon: '⊥' },
    { id: 'fingers', label: 'Пальцы и ноготки', icon: '☝' },
    { id: 'feet',    label: 'Стопы',          icon: '⌁' },
    { id: 'skin',    label: 'Кожа и румянец', icon: '✧' },
    /* v1.2: ещё 10 частей × 20 клипов = +200 анимаций */
    { id: 'shoulders', label: 'Плечи и лопатки', icon: '⌃' },
    { id: 'spine',     label: 'Спина и поясница', icon: '⌇' },
    { id: 'hips',      label: 'Бёдра и таз',    icon: '◡' },
    { id: 'wrists',    label: 'Запястья',       icon: '↻' },
    { id: 'ankles',    label: 'Лодыжки',        icon: '⌁' },
    { id: 'breath',    label: 'Дыхание и грудь', icon: '◠' },
    { id: 'gaze',      label: 'Взгляд и зрачки', icon: '◎' },
    { id: 'emotions',  label: 'Эмоции',         icon: '☺' },
    { id: 'poses',     label: 'Позы тела',      icon: '☗' },
    { id: 'interact',  label: 'Взаимодействие', icon: '✥' },
    /* v1.2: женские особенности силуэта + нижний слой одежды */
    { id: 'bust',   label: 'Грудь под одеждой', icon: '◠' },
    { id: 'waist',  label: 'Талия и живот',     icon: '⌒' },
    { id: 'layers', label: 'Слои и бельё',      icon: '≋' },
  ];

  /* --- каналы позы и значения по умолчанию -------------------------------- */
  const DEFAULT_POSE = Object.freeze({
    headTilt: 0, headTurn: 0, headNod: 0,
    smile: 0.15, brow: 0, mouth: 0, blush: 0,
    blink: 0, lookX: 0, lookY: 0, eyeWide: 0,
    hairSway: 0, hairBounce: 0,
    torsoLean: 0, torsoTwist: 0, torsoY: 0,
    shoulderL: 8, elbowL: 6, wristL: 0,
    shoulderR: 8, elbowR: 6, wristR: 0,
    fistL: 0.25, pointL: 0, palmL: 0,
    fistR: 0.25, pointR: 0, palmR: 0,
    hipL: 0, kneeL: 0, ankleL: 0,
    hipR: 0, kneeR: 0, ankleR: 0,
    skirtSway: 0, skirtLift: 0, hemWave: 0,
    bodyY: 0, bodyX: 0, facing: 1, squat: 0,
    /* каналы красоты: брови/ресницы, губы, уши, шея, пальцы, стопы, кожа, волосы */
    browArch: 0.25, lash: 0.6, lipPout: 0.3,
    earTilt: 0, earRing: 0.6, neckTilt: 0, neckTurn: 0,
    fingerSpreadL: 0.25, fingerSpreadR: 0.25, nailShine: 0.45,
    footPointL: 0, footPointR: 0, toeCurl: 0,
    freckle: 0.35, skinGlow: 0.3, hairGloss: 0.55,
    /* v1.2: осанка, дыхание, взгляд, эмоции, взаимодействие с предметами */
    shoulderShrug: 0, spineBend: 0, chestLift: 0, hipTwist: 0,
    wristTwistL: 0, wristTwistR: 0, ankleRollL: 0, ankleRollR: 0,
    breath: 0, pupil: 0.5, gazeX: 0, gazeY: 0, poseArch: 0,
    armCross: 0, headDuck: 0, bodyTurn: 0, hemSpin: 0,
    fabricDrape: 0, mirrorCheck: 0,
    /* v1.2: женственный силуэт под одеждой, слои белья, тепло */
    bustLift: 0, waistTwist: 0, layerShift: 0, layerReveal: 0, hemLayer: 0, warmth: 22,
  });
  const CHANNELS = Object.keys(DEFAULT_POSE);

  /* --- генераторы ключевых кадров ------------------------------------------ */
  function sine(amp, cycles, base, phase, steps) {
    base = base || 0; phase = phase || 0; steps = steps || 12;
    const out = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      out.push([t, base + amp * Math.sin(2 * Math.PI * cycles * t + phase)]);
    }
    return out;
  }
  function ramp(from, to, steps) {
    steps = steps || 4;
    const out = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      out.push([t, from + (to - from) * t]);
    }
    return out;
  }
  function pulse(peak, base, at) {
    base = base || 0; at = at === undefined ? 0.45 : at;
    return [[0, base], [Math.max(0.01, at - 0.18), base], [at, peak],
            [Math.min(0.99, at + 0.2), base], [1, base]];
  }
  function hold(v) { return [[0, v], [1, v]]; }
  function seq() { return Array.prototype.slice.call(arguments).map(function (p) { return [p[0], p[1]]; }); }
  function S(amp, cycles, base, phase) { return sine(amp, cycles, base, phase); }
  function P(peak, base, at) { return pulse(peak, base, at); }
  function R(from, to) { return ramp(from, to); }
  function H(v) { return hold(v); }

  function C(id, name, seconds, tracks, options) {
    return Object.assign({ id: id, name: name, duration: seconds, loop: false, tracks: tracks }, options || {});
  }

  /* =========================================================================
     ГОЛОВА — 12 анимаций
     ========================================================================= */
  const head = [
    C('nod', 'Кивнуть «да»', 1.1, { headNod: P(17) }),
    C('shake', 'Покачать «нет»', 1.4, { headTurn: S(19, 2), hairSway: S(4, 2) }),
    C('tilt-left', 'Наклонить влево', 1.3, { headTilt: seq([0, 0], [0.28, 19], [0.72, 19], [1, 0]), hairSway: P(6, 0, 0.35) }),
    C('tilt-right', 'Наклонить вправо', 1.3, { headTilt: seq([0, 0], [0.28, -19], [0.72, -19], [1, 0]), hairSway: P(-6, 0, 0.35) }),
    C('look-around', 'Оглядеться', 2.4, { headTurn: S(27, 1), lookX: S(1, 1) }),
    C('think', 'Задуматься', 2.2, { headTilt: H(13), headNod: S(4, 1.5, -6), brow: H(0.35) }),
    C('yawn', 'Зевнуть', 1.9, { headNod: seq([0, 0], [0.3, -19], [0.75, -19], [1, 0]), mouth: P(3, 0, 0.5), blink: P(1, 0, 0.5) }),
    C('look-up', 'Поднять голову к небу', 1.6, { headNod: seq([0, 0], [0.35, -18], [0.8, -18], [1, -4]) }),
    C('look-down', 'Опустить голову', 1.6, { headNod: seq([0, 0], [0.35, 20], [0.8, 20], [1, 4]), hairBounce: P(4, 0, 0.35) }),
    C('turn-left', 'Повернуться влево', 1.5, { headTurn: seq([0, 0], [0.35, 24], [1, 24]), hairSway: P(7, 0, 0.4) }),
    C('turn-right', 'Повернуться вправо', 1.5, { headTurn: seq([0, 0], [0.35, -24], [1, -24]), hairSway: P(-7, 0, 0.4) }),
    C('bob', 'Покачивать в такт', 2.0, { headNod: S(5, 3), headTilt: S(3, 1.5, 0, 1) }, { loop: true }),
  ];

  /* =========================================================================
     МИМИКА ЛИЦА — 10 анимаций
     ========================================================================= */
  const face = [
    C('smile', 'Улыбнуться', 1.8, { smile: seq([0, 0.15], [0.25, 1], [0.8, 1], [1, 0.3]), mouth: H(1) }),
    C('laugh', 'Рассмеяться', 2.0, { smile: P(1, 0.3), mouth: P(2, 0), torsoY: S(3, 4), blush: P(0.4, 0, 0.5) }),
    C('sad', 'Грустить', 2.2, { smile: H(-0.8), brow: H(-0.5), mouth: H(3), headNod: H(9) }),
    C('surprise', 'Удивиться', 1.5, { mouth: P(4, 0, 0.4), brow: P(0.9, 0, 0.4), eyeWide: P(1, 0, 0.4) }),
    C('wink', 'Подмигнуть', 1.3, { smile: P(0.8, 0.2, 0.5), blink: P(1, 0, 0.5), blush: P(0.3, 0, 0.55) }),
    C('blush', 'Покраснеть / смутиться', 2.0, { blush: seq([0, 0], [0.3, 1], [0.85, 0.8], [1, 0.2]), headTilt: H(9), smile: H(0.5) }),
    C('focus', 'Сосредоточиться', 2.0, { brow: H(0.55), smile: H(-0.15), mouth: H(0), eyeWide: H(0.2) }),
    C('sleepy', 'Сонное лицо', 2.4, { blink: S(0.5, 1, 0.5), smile: H(0.05), brow: H(-0.2), headNod: S(4, 1, 6) }),
    C('annoyed', 'Нахмуриться', 1.8, { brow: H(-0.85), smile: H(-0.5), mouth: H(3), headTurn: H(8) }),
    C('smirk', 'Хитрая улыбка', 1.9, { smile: seq([0, 0.15], [0.4, 0.75], [1, 0.75]), headTilt: H(-8), brow: H(0.3) }),
  ];

  /* =========================================================================
     ГЛАЗА — 10 анимаций
     ========================================================================= */
  const eyes = [
    C('blink', 'Моргнуть', 0.45, { blink: P(1, 0, 0.45) }),
    C('double-blink', 'Моргнуть дважды', 1.0, { blink: seq([0, 0], [0.12, 1], [0.24, 0], [0.4, 1], [0.55, 0], [1, 0]) }),
    C('look-left', 'Посмотреть влево', 1.5, { lookX: seq([0, 0], [0.3, -1], [1, -1]) }),
    C('look-right', 'Посмотреть вправо', 1.5, { lookX: seq([0, 0], [0.3, 1], [1, 1]) }),
    C('look-up', 'Поднять глаза', 1.5, { lookY: seq([0, 0], [0.3, -1], [1, -1]) }),
    C('look-down', 'Опустить глаза', 1.5, { lookY: seq([0, 0], [0.3, 1], [1, 1]) }),
    C('squint', 'Прищуриться', 1.6, { blink: seq([0, 0], [0.3, 0.65], [1, 0.65]), brow: H(-0.3) }),
    C('wide', 'Широко раскрыть глаза', 1.4, { eyeWide: P(1, 0, 0.4), brow: P(0.6, 0, 0.4) }),
    C('sleepy-eyes', 'Сонные глаза', 2.6, { blink: S(0.45, 1, 0.5), lookY: S(0.4, 1, 0.5) }),
    C('follow', 'Следить взглядом', 2.6, { lookX: S(1, 1), lookY: S(0.35, 2), blink: P(1, 0, 0.8) }),
  ];

  /* =========================================================================
     ВОЛОСЫ — 10 анимаций
     ========================================================================= */
  const hair = [
    C('breeze', 'Ветер развевает волосы', 2.8, { hairSway: S(13, 1.5), hairBounce: S(2, 2) }, { loop: true }),
    C('bounce', 'Прыжок — подскок волос', 1.0, { hairBounce: P(9, 0, 0.3), hairSway: P(5, 0, 0.55) }),
    C('flip', 'Отбросить волосы назад', 1.6, { hairSway: seq([0, 0], [0.25, -18], [0.6, 4], [1, 0]), headTurn: P(9, 0, 0.3) }),
    C('sway', 'Плавное покачивание', 3.0, { hairSway: S(5, 1), hairBounce: S(1.5, 1) }, { loop: true }),
    C('loose', 'Распустить волосы', 2.0, { hairSway: seq([0, -10], [0.4, 9], [0.7, -4], [1, 0]), hairBounce: P(4, 0, 0.4) }),
    C('gather', 'Собрать волосы', 1.8, { hairSway: R(12, -4), hairBounce: P(-3, 0, 0.6) }),
    C('whirl', 'Вихрь при повороте', 1.7, { hairSway: S(20, 1), headTurn: S(12, 1), skirtSway: S(7, 1) }),
    C('ripple', 'Волна по прядям', 2.2, { hairSway: S(8, 2.5), hairBounce: S(2, 3.5) }),
    C('toss-back', 'Встряхнуть головой', 1.4, { hairSway: S(15, 2), headTurn: S(9, 2) }),
    C('shimmer', 'Лёгкий блеск прядей', 3.2, { hairSway: S(2, 3), hairBounce: S(1, 3) }, { loop: true }),
  ];

  /* =========================================================================
     КОРПУС — 12 анимаций
     ========================================================================= */
  const torso = [
    C('breathe', 'Дыхание (Idle)', 3.6, { torsoY: S(1.6, 1), torsoLean: S(1, 1), shoulderL: S(1.5, 1, 8), shoulderR: S(1.5, 1, 8) }, { loop: true }),
    C('lean-forward', 'Наклониться вперёд', 1.6, { torsoLean: seq([0, 0], [0.35, 18], [0.8, 18], [1, 2]), headNod: H(6) }),
    C('lean-back', 'Прогнуться назад', 1.6, { torsoLean: seq([0, 0], [0.35, -16], [0.8, -16], [1, -2]), headNod: H(-7) }),
    C('twist-left', 'Поворот корпуса влево', 1.7, { torsoTwist: seq([0, 0], [0.35, 15], [1, 15]), hairSway: P(6, 0, 0.4) }),
    C('twist-right', 'Поворот корпуса вправо', 1.7, { torsoTwist: seq([0, 0], [0.35, -15], [1, -15]), hairSway: P(-6, 0, 0.4) }),
    C('stretch', 'Потянуться после сна', 2.6, { torsoY: P(-9, 0, 0.45), torsoLean: P(-10, 0, 0.45), shoulderL: P(155, 8, 0.45), shoulderR: P(155, 8, 0.45), mouth: P(3, 0, 0.5) }),
    C('shiver', 'Дрожь от холода', 1.4, { torsoTwist: S(3, 7), torsoY: S(1, 9), shoulderL: S(4, 7, 14), shoulderR: S(4, 7, 14) }),
    C('laugh-shake', 'Трястись от смеха', 1.7, { torsoY: S(4, 5), torsoLean: S(5, 3), smile: H(1) }),
    C('straighten', 'Расправить плечи / осанка', 1.8, { torsoLean: R(10, 0), torsoY: R(4, -2), shoulderL: R(22, 8), shoulderR: R(22, 8) }),
    C('curtsy', 'Сделать реверанс', 2.1, { squat: P(0.55, 0, 0.5), torsoLean: P(14, 0, 0.5), skirtSway: P(9, 0, 0.55), headNod: P(10, 0, 0.5) }),
    C('sway', 'Покачиваться', 2.6, { torsoLean: S(6, 1), torsoTwist: S(4, 0.5), skirtSway: S(4, 1) }, { loop: true }),
    C('bow', 'Поклониться', 1.9, { torsoLean: P(28, 0, 0.5), headNod: P(12, 0, 0.5), shoulderL: P(28, 8, 0.5), shoulderR: P(28, 8, 0.5) }),
  ];

  /* =========================================================================
     РУКИ — по 12 анимаций на КАЖДУЮ руку
     ========================================================================= */
  function armClips(side) {
    const sh = 'shoulder' + side, el = 'elbow' + side, wr = 'wrist' + side;
    const prefix = side === 'L' ? 'Левая рука: ' : 'Правая рука: ';
    return [
      C('wave', prefix + 'помахать', 1.8, { [sh]: seq([0, 8], [0.15, 135], [1, 135]), [el]: S(16, 4, 22), [wr]: S(20, 4) }),
      C('raise', prefix + 'поднять вверх', 1.4, { [sh]: R(8, 170), [el]: R(6, 4), [wr]: H(0) }),
      C('lower', prefix + 'опустить', 1.3, { [sh]: R(120, 6), [el]: R(25, 4) }),
      C('bend', prefix + 'согнуть в локте', 1.5, { [sh]: H(35), [el]: R(6, 95), [wr]: H(8) }),
      C('point', prefix + 'указать вперёд', 1.7, { [sh]: R(8, 82), [el]: R(6, 6), ['point' + side]: H(1) }),
      C('hand-on-hip', prefix + 'рука на бедре', 1.6, { [sh]: R(8, 46), [el]: R(6, 105), [wr]: H(-18) }),
      C('swing-out', prefix + 'мах в сторону', 1.5, { [sh]: seq([0, 8], [0.35, 95], [0.7, 20], [1, 8]), [el]: S(12, 1, 15) }),
      C('circle', prefix + 'описать круг', 2.4, { [sh]: S(70, 1, 80), [el]: S(30, 1, 35), [wr]: S(18, 2) }),
      C('reach', prefix + 'потянуться за предметом', 1.9, { [sh]: seq([0, 8], [0.4, 105], [0.85, 110], [1, 40]), [el]: R(6, 20), torsoLean: P(8, 0, 0.5) }),
      C('cross', prefix + 'скрестить на груди', 1.8, { [sh]: R(8, 62), [el]: R(6, 115), [wr]: H(25) }),
      C('clap', prefix + 'хлопнуть в ладоши', 1.4, { [sh]: S(22, 3, 70), [el]: S(18, 3, 70), [wr]: S(12, 3) }),
      C('hold-cup', prefix + 'держать чашку', 2.2, { [sh]: R(8, 52), [el]: R(6, 88), [wr]: H(12), ['fist' + side]: H(0.7) }),
    ];
  }

  /* =========================================================================
     КИСТИ — по 10 анимаций на каждую кисть
     ========================================================================= */
  function handClips(side) {
    const f = 'fist' + side, p = 'point' + side, pl = 'palm' + side, wr = 'wrist' + side;
    const prefix = side === 'L' ? 'Левая кисть: ' : 'Правая кисть: ';
    return [
      C('fist', prefix + 'сжать кулак', 1.2, { [f]: R(0, 1), [pl]: H(0) }),
      C('open', prefix + 'раскрыть ладонь', 1.2, { [f]: R(1, 0), [pl]: H(1) }),
      C('beckon', prefix + 'поманить пальцем', 1.6, { [f]: H(0.6), [p]: S(0.5, 3, 0.5), [wr]: S(9, 3) }),
      C('okay', prefix + 'жест «окей»', 1.5, { [f]: H(0.45), [p]: H(0.5), [pl]: H(0.4) }),
      C('wrist-wave', prefix + 'помахать кистью', 1.5, { [wr]: S(28, 3), [pl]: H(1) }),
      C('snap', prefix + 'щёлкнуть пальцами', 1.1, { [f]: seq([0, 0.2], [0.4, 0.9], [0.55, 0.1], [1, 0.2]), [wr]: P(22, 0, 0.5) }),
      C('finger-point', prefix + 'указать пальцем', 1.5, { [p]: R(0, 1), [f]: H(0.8), [wr]: H(5) }),
      C('cup', prefix + 'сложить ладошку лодочкой', 1.5, { [f]: H(0.3), [pl]: H(0.8), [wr]: H(-10) }),
      C('clap-palm', prefix + 'похлопать в ладоши', 1.4, { [pl]: S(0.5, 3, 0.5), [f]: S(0.4, 3, 0.4), [wr]: S(15, 3) }),
      C('rub', prefix + 'потерев ладони', 1.6, { [pl]: H(0.9), [wr]: S(12, 5), [f]: S(0.25, 5, 0.3) }),
    ];
  }

  /* =========================================================================
     НОГИ — по 12 анимаций на КАЖДУЮ ногу
     ========================================================================= */
  function legClips(side) {
    const hp = 'hip' + side, kn = 'knee' + side, an = 'ankle' + side;
    const prefix = side === 'L' ? 'Левая нога: ' : 'Правая нога: ';
    return [
      C('step', prefix + 'сделать шаг', 1.2, { [hp]: S(24, 1), [kn]: S(20, 1, 12), [an]: S(8, 1) }),
      C('knee-up', prefix + 'поднять колено', 1.4, { [hp]: P(48, 0, 0.45), [kn]: P(70, 0, 0.45) }),
      C('kick', prefix + 'удар / пинок', 1.2, { [hp]: seq([0, 0], [0.25, -18], [0.5, 62], [0.8, 10], [1, 0]), [kn]: seq([0, 5], [0.25, 60], [0.5, 4], [1, 5]) }),
      C('squat', prefix + 'приседание', 1.8, { [hp]: P(20, 0, 0.5), [kn]: P(65, 0, 0.5), squat: P(0.6, 0, 0.5) }),
      C('jump', prefix + 'подпрыгнуть', 1.1, { bodyY: P(-22, 0, 0.4), [kn]: P(45, 0, 0.25), [an]: P(18, 0, 0.5), hairBounce: P(8, 0, 0.55) }),
      C('stomp', prefix + 'топнуть', 1.0, { [hp]: P(26, 0, 0.35), [kn]: P(28, 0, 0.35), [an]: P(20, 0, 0.55), torsoY: P(5, 0, 0.6) }),
      C('lunge', prefix + 'выпад вперёд', 1.9, { [hp]: seq([0, 0], [0.4, 38], [1, 38]), [kn]: seq([0, 0], [0.4, 55], [1, 55]), squat: H(0.35) }),
      C('swing', prefix + 'покачать ногой', 2.0, { [hp]: S(16, 1.5), [kn]: S(10, 1.5, 8) }, { loop: true }),
      C('tiptoe', prefix + 'встать на носочки', 1.6, { [an]: seq([0, 0], [0.35, 32], [1, 32]), bodyY: R(0, -8) }),
      C('bend', prefix + 'согнуть колено', 1.5, { [kn]: R(4, 60), [hp]: R(0, -12) }),
      C('foot-turn', prefix + 'повернуть стопу', 1.5, { [an]: S(22, 1), [hp]: S(6, 1) }),
      C('dance', prefix + 'танцевальный па', 2.2, { [hp]: S(22, 2), [kn]: S(24, 2, 15), [an]: S(14, 2) }),
    ];
  }

  /* =========================================================================
     ОДЕЖДА / ПОДОЛ — 10 анимаций
     ========================================================================= */
  const skirt = [
    C('sway', 'Подол колышется при ходьбе', 2.0, { skirtSway: S(7, 1), hemWave: S(0.6, 2, 0.5) }, { loop: true }),
    C('twirl', 'Покружиться — юбка вихрем', 2.2, { skirtSway: S(22, 1), skirtLift: P(12, 0, 0.5), torsoTwist: S(16, 1) }),
    C('hem-wave', 'Волна по подолу', 1.8, { hemWave: S(1, 2, 0.4), skirtSway: S(3, 2) }),
    C('zip', 'Застегнуть куртку', 1.5, { shoulderL: P(55, 8, 0.5), shoulderR: P(55, 8, 0.5), torsoLean: P(9, 0, 0.5) }),
    C('flutter', 'Ткань на ветру', 2.6, { skirtSway: S(11, 2), hemWave: S(0.8, 3, 0.5) }, { loop: true }),
    C('lift', 'Приподнять подол', 1.5, { skirtLift: seq([0, 0], [0.4, 14], [1, 14]), shoulderL: R(8, 40), shoulderR: R(8, 40) }),
    C('settle', 'Расправить одежду', 1.6, { skirtLift: R(12, 0), skirtSway: S(4, 1), torsoLean: P(7, 0, 0.4) }),
    C('wind', 'Порыв ветра', 1.4, { skirtSway: P(26, 0, 0.45), hairSway: P(16, 0, 0.45), torsoLean: P(-6, 0, 0.45) }),
    C('spin', 'Быстрый оборот', 1.7, { torsoTwist: S(28, 1), skirtSway: S(18, 1), hairSway: S(14, 1) }),
    C('ruffle', 'Встряхнуть складки', 1.5, { hemWave: S(1, 4, 0.4), skirtSway: S(6, 3) }),
  ];

  /* =========================================================================
     БЫТОВЫЕ СЦЕНЫ — 20 цельных анимаций режима жизни
     Переодевание · купание · сон · работа · разговор · туалет.
     Каждая сцена управляет сразу несколькими суставами, поэтому это отдельная
     часть тела в галерее (тоже >= 10 клипов, как и все остальные).
     ========================================================================= */
  const routine = [
    /* --- переодевание --- */
    C('dress-up', 'Переодевание: надеть платье через голову', 2.2, {
      shoulderL: seq([0, 8], [0.35, 165], [0.75, 165], [1, 40]),
      shoulderR: seq([0, 8], [0.35, 165], [0.75, 165], [1, 40]),
      elbowL: seq([0, 6], [0.35, 105], [0.75, 105], [1, 30]),
      elbowR: seq([0, 6], [0.35, 105], [0.75, 105], [1, 30]),
      headNod: P(-9, 0, 0.45), skirtLift: P(13, 0, 0.5), torsoLean: P(7, 0, 0.5),
    }),
    C('dress-change', 'Переодевание: сменить наряд', 2.6, {
      torsoTwist: S(13, 1.5), shoulderL: S(28, 1.5, 62), shoulderR: S(28, 1.5, 62),
      skirtSway: S(9, 1.5), hairSway: S(6, 1.5), headTilt: S(5, 1.5),
    }, { loop: true }),
    C('dress-zip', 'Переодевание: застегнуть и расправить', 1.9, {
      shoulderL: seq([0, 20], [0.4, 58], [1, 20]), shoulderR: seq([0, 20], [0.4, 58], [1, 20]),
      elbowL: seq([0, 30], [0.4, 95], [1, 15]), elbowR: seq([0, 30], [0.4, 95], [1, 15]),
      headNod: P(10, 0, 0.6), skirtSway: S(4, 2), smile: H(0.55),
    }),
    C('dress-choose', 'Переодевание: выбрать вещь в шкафу', 2.1, {
      shoulderR: seq([0, 8], [0.35, 100], [0.8, 105], [1, 45]),
      elbowR: R(6, 25), headTilt: H(-9), torsoLean: P(9, 0, 0.5),
      ['pointR']: H(0.7), smile: H(0.4),
    }),
    /* --- купание --- */
    C('bath-step', 'Купание: зайти в ванну', 1.8, {
      kneeL: P(66, 0, 0.4), hipL: P(42, 0, 0.4), bodyY: P(-8, 0, 0.4),
      shoulderL: P(45, 8, 0.4), shoulderR: P(45, 8, 0.4), hairBounce: P(5, 0, 0.5),
    }),
    C('bath-wash', 'Купание: намылиться', 2.4, {
      shoulderL: S(30, 2, 70), shoulderR: S(30, 2, 70),
      elbowL: S(28, 2, 75), elbowR: S(28, 2, 75),
      torsoTwist: S(8, 2), headTilt: S(6, 2), smile: H(0.5), blink: P(1, 0, 0.7),
    }, { loop: true }),
    C('bath-rinse', 'Купание: ополоснуться', 2.0, {
      headNod: seq([0, 0], [0.35, -14], [0.8, -14], [1, 0]),
      shoulderL: P(120, 8, 0.45), shoulderR: P(120, 8, 0.45),
      hairBounce: P(8, 0, 0.5), blink: P(1, 0, 0.5), mouth: P(3, 0, 0.5),
    }),
    C('bath-towel', 'Купание: вытереться полотенцем', 2.2, {
      shoulderL: S(34, 2, 75), shoulderR: S(34, 2, 75, Math.PI),
      elbowL: S(20, 2, 70), elbowR: S(20, 2, 70, Math.PI),
      headNod: S(5, 2), smile: H(0.7), torsoLean: S(4, 2),
    }),
    /* --- режим сна --- */
    C('sleep-lie', 'Сон: лечь и укрыться одеялом', 2.4, {
      squat: seq([0, 0], [0.5, 0.72], [1, 0.72]), torsoLean: R(0, 18),
      bodyY: R(0, 12), headNod: R(0, 12), blink: H(1), hairSway: P(7, 0, 0.55),
    }),
    C('sleep-breathe', 'Сон: спокойное дыхание во сне', 4.0, {
      torsoY: S(2.4, 1), blink: H(1), headNod: S(2, 1, 10),
      hairSway: S(1.5, 1), smile: H(0.1),
    }, { loop: true }),
    C('sleep-turn', 'Сон: повернуться во сне', 3.0, {
      headTurn: S(11, 0.5), torsoTwist: S(7, 0.5), hairSway: S(6, 0.5),
      skirtSway: S(5, 0.5), blink: H(1),
    }),
    C('sleep-wake', 'Сон: проснуться и потянуться', 2.6, {
      shoulderL: P(158, 8, 0.55), shoulderR: P(158, 8, 0.55),
      torsoY: P(-9, 0, 0.55), torsoLean: P(-9, 0, 0.55),
      mouth: P(3, 0, 0.55), blink: seq([0, 1], [0.45, 0], [1, 0]),
      squat: R(0.7, 0), headNod: R(12, -5),
    }),
    /* --- работа --- */
    C('work-sit', 'Работа: сесть за стол', 1.7, {
      squat: R(0, 0.5), torsoLean: R(0, 11), shoulderL: R(8, 45), shoulderR: R(8, 45),
      elbowL: R(6, 80), elbowR: R(6, 80), headNod: R(0, 9),
    }),
    C('work-type', 'Работа: печатать на ноутбуке', 1.6, {
      wristL: S(16, 6), wristR: S(16, 6, 0, Math.PI),
      elbowL: H(78), elbowR: H(78), shoulderL: H(42), shoulderR: H(42),
      headNod: H(9), brow: H(0.45), blink: P(1, 0, 0.8),
    }, { loop: true }),
    C('work-think', 'Работа: обдумать задачу', 2.8, {
      headTilt: H(12), headNod: S(4, 1, -6), brow: H(0.5),
      shoulderR: R(8, 48), elbowR: R(6, 100), fistR: H(0.7),
      smile: H(-0.1), blink: P(1, 0, 0.7),
    }),
    /* --- разговор --- */
    C('talk-hello', 'Разговор: поздороваться жестом', 1.8, {
      shoulderR: seq([0, 8], [0.2, 140], [1, 140]), elbowR: S(14, 3, 20),
      wristR: S(20, 3), smile: H(1), mouth: H(1), headNod: P(8, 0, 0.5),
    }),
    C('talk-story', 'Разговор: рассказывать и жестикулировать', 2.6, {
      shoulderL: S(26, 2, 48), shoulderR: S(26, 2, 48, Math.PI),
      elbowL: S(18, 2, 55), elbowR: S(18, 2, 55, Math.PI),
      headNod: S(5, 2), mouth: S(1.4, 3, 1.4), smile: H(0.7), blink: P(1, 0, 0.6),
    }, { loop: true }),
    C('talk-listen', 'Разговор: внимательно слушать', 2.4, {
      headTilt: H(9), headNod: S(4, 1, 4), smile: H(0.45),
      brow: H(0.2), blink: P(1, 0, 0.55), shoulderL: H(22), shoulderR: H(22),
    }),
    /* --- туалет --- */
    C('toilet-walk', 'Туалет: пройтись к санузлу', 1.4, {
      hipL: S(22, 1), hipR: S(22, 1, 0, Math.PI),
      kneeL: S(18, 1, 12), kneeR: S(18, 1, 12, Math.PI),
      shoulderL: S(14, 1, 12), shoulderR: S(14, 1, 12, Math.PI),
    }, { loop: true }),
    C('toilet-sit', 'Туалет: присесть', 2.0, {
      squat: R(0, 0.8), kneeL: R(0, 82), kneeR: R(0, 82),
      torsoLean: R(0, 12), headNod: R(0, 10), blink: H(0.45),
      shoulderL: H(30), shoulderR: H(30), elbowL: H(55), elbowR: H(55),
    }),
    C('toilet-stand', 'Туалет: встать и привести себя в порядок', 2.0, {
      squat: R(0.8, 0), kneeL: R(82, 0), kneeR: R(82, 0),
      shoulderL: R(55, 12), shoulderR: R(55, 12),
      skirtSway: S(6, 1.5), smile: H(0.4), headNod: R(10, 0),
    }),
  ];

  /* какие клипы включает каждое бытовое действие */
  const ROUTINES = {
    dress:  ['dress-change', 'dress-up', 'dress-zip', 'dress-choose'],
    wash:   ['bath-wash', 'bath-step', 'bath-rinse', 'bath-towel'],
    sleep:  ['sleep-breathe', 'sleep-lie', 'sleep-turn'],
    work:   ['work-type', 'work-sit', 'work-think'],
    talk:   ['talk-story', 'talk-hello', 'talk-listen'],
    toilet: ['toilet-sit', 'toilet-walk', 'toilet-stand'],
  };

  /* =========================================================================
     КРАСОТА: отдельные анимируемые части тела (по 10 клипов на каждую)
     Брови/ресницы, губы, уши/серёжки, шея/ключицы, пальцы/ноготки,
     стопы, кожа/румянец. Каждая управляет своими каналами позы, и риг
     действительно отрисовывает эти детали.
     ========================================================================= */
  const brows = [
    C('raise', 'Вскинуть брови', 1.3, { brow: R(0.2, 0.9), browArch: R(0.25, 0.8), lash: H(0.75) }),
    C('furrow', 'Нахмурить брови', 1.4, { brow: R(0.2, -0.8), browArch: R(0.25, -0.35), lash: H(0.4) }),
    C('arch-left', 'Приподнять одну бровь', 1.6, { browArch: S(0.4, 1, 0.3), brow: H(0.3), eyeWide: P(0.5, 0, 0.5) }),
    C('wink-brow', 'Бровь при подмигивании', 1.2, { brow: P(0.7, 0.1, 0.5), blink: P(1, 0, 0.5), lash: P(1, 0.6, 0.5) }),
    C('soft', 'Мягкие спокойные брови', 2.2, { brow: S(0.12, 1, 0.2), browArch: H(0.32), lash: S(0.12, 1, 0.6) }),
    C('surprise', 'Брови от удивления', 1.3, { brow: P(1, 0.1, 0.4), browArch: P(0.9, 0.25, 0.4), eyeWide: P(1, 0, 0.4) }),
    C('lash-flutter', 'Трепетание ресниц', 1.5, { lash: S(0.35, 4, 0.6), blink: S(0.4, 2, 0.3) }),
    C('lash-long', 'Длинные ресницы', 1.5, { lash: R(0.4, 1), browArch: H(0.55), eyeWide: H(0.25) }),
    C('think-brow', 'Брови в раздумье', 2.0, { brow: H(0.45), browArch: H(-0.2), headTilt: H(9) }),
    C('sleep-brows', 'Расслабленные брови во сне', 2.6, { brow: H(-0.15), lash: H(0.25), blink: H(1) }),
  ];
  const lips = [
    C('smile', 'Нежная улыбка', 1.6, { smile: R(0.15, 0.9), lipPout: H(0.35), mouth: H(1) }),
    C('laugh', 'Смех', 1.5, { mouth: P(2, 0, 0.5), smile: P(1, 0.2, 0.5), lipPout: P(0.6, 0.3, 0.5) }),
    C('pout', 'Надуть губки', 1.4, { lipPout: R(0.3, 1), smile: H(-0.2), mouth: H(0) }),
    C('talk', 'Губы во время разговора', 2.2, { mouth: S(1.4, 3, 1.4), lipPout: S(0.2, 3, 0.4), smile: H(0.5) }, { loop: true }),
    C('kiss', 'Воздушный поцелуй', 1.5, { lipPout: P(1, 0.3, 0.5), mouth: P(4, 0, 0.5), blink: P(1, 0, 0.5) }),
    C('sad', 'Грустные губы', 1.8, { smile: H(-0.7), mouth: H(3), lipPout: H(0.2) }),
    C('sip', 'Сделать глоток', 1.5, { mouth: P(4, 0, 0.4), headNod: P(-6, 0, 0.4), lipPout: H(0.5) }),
    C('yawn', 'Зевок губ', 1.9, { mouth: P(3, 0, 0.5), lipPout: H(0.2), blink: P(1, 0, 0.5) }),
    C('smirk', 'Хитрая улыбка', 1.7, { smile: H(0.7), lipPout: H(0.55), headTilt: H(-8) }),
    C('rest', 'Спокойные губы', 2.0, { smile: H(0.12), lipPout: H(0.3), mouth: H(0) }),
  ];
  const ears = [
    C('tilt', 'Повернуть ушко', 1.5, { earTilt: S(8, 1), headTilt: S(3, 1) }),
    C('ring-swing', 'Серёжки качаются', 1.8, { earRing: S(0.4, 2, 0.7), hairSway: S(4, 2) }),
    C('listen', 'Прислушаться', 1.5, { earTilt: P(10, 0, 0.4), headTurn: P(12, 0, 0.4) }),
    C('blush-ear', 'Покрасневшее ушко', 1.6, { earTilt: H(5), blush: P(0.7, 0, 0.5) }),
    C('hair-tuck', 'Убрать прядь за ухо', 1.8, { earTilt: P(-8, 0, 0.5), hairSway: P(8, 0, 0.5), shoulderR: P(95, 8, 0.5) }),
    C('earring-on', 'Надеть серёжку', 1.4, { earRing: R(0, 1), earTilt: H(4) }),
    C('earring-off', 'Снять серёжку', 1.4, { earRing: R(1, 0), earTilt: H(-4) }),
    C('wind', 'Ветер в ушах', 2.0, { earTilt: S(6, 2), hairSway: S(9, 2) }),
    C('sleep-ear', 'Ушки во сне', 2.4, { earTilt: H(-4), earRing: H(0.2), blink: H(1) }),
    C('sparkle', 'Блеск серёжек', 1.8, { earRing: S(0.3, 3, 0.7), skinGlow: S(0.2, 3, 0.4) }),
  ];
  const neck = [
    C('tilt-left', 'Наклонить шею влево', 1.5, { neckTilt: seq([0, 0], [0.4, 12], [1, 12]) }),
    C('tilt-right', 'Наклонить шею вправо', 1.5, { neckTilt: seq([0, 0], [0.4, -12], [1, -12]) }),
    C('turn', 'Повернуть шею', 1.8, { neckTurn: S(10, 1), headTurn: S(6, 1) }),
    C('stretch', 'Вытянуть шею', 1.7, { neckTilt: H(0), torsoY: P(-6, 0, 0.5), headNod: P(-8, 0, 0.5) }),
    C('nod', 'Кивок шеей', 1.4, { neckTilt: S(4, 2, 3), headNod: S(5, 2) }),
    C('collarbone', 'Показать ключицы', 1.8, { neckTurn: H(6), torsoTwist: H(5), shoulderL: H(14), shoulderR: H(14) }),
    C('shy', 'Спрятать шею', 1.7, { neckTilt: H(8), headNod: H(10), blush: P(0.6, 0, 0.5) }),
    C('proud', 'Гордая осанка', 1.8, { neckTilt: H(-5), torsoLean: H(-3), headNod: H(-5) }),
    C('sleep-neck', 'Шея во сне', 2.6, { neckTilt: H(9), blink: H(1) }),
    C('dance-neck', 'Шея в танце', 2.0, { neckTilt: S(7, 2), neckTurn: S(6, 1) }),
  ];
  const fingers = [
    C('spread', 'Растопырить пальцы', 1.3, { fingerSpreadL: R(0.2, 1), fingerSpreadR: R(0.2, 1) }),
    C('curl', 'Сжать пальцы', 1.3, { fingerSpreadL: R(1, 0.1), fingerSpreadR: R(1, 0.1), fistL: R(0.2, 1), fistR: R(0.2, 1) }),
    C('piano', 'Пальцы как на клавишах', 1.6, { fingerSpreadL: S(0.4, 4, 0.6), fingerSpreadR: S(0.4, 4, 0.6, Math.PI) }, { loop: true }),
    C('point', 'Указательный палец', 1.4, { pointR: R(0, 1), fingerSpreadR: H(0.2), nailShine: H(0.7) }),
    C('okay', 'Колечко из пальцев', 1.4, { fingerSpreadR: H(0.6), fistR: H(0.4), pointR: H(0.5) }),
    C('wave', 'Пальцы при приветствии', 1.6, { fingerSpreadR: S(0.3, 3, 0.6), wristR: S(18, 3) }),
    C('nails', 'Блеск ноготков', 1.6, { nailShine: R(0.2, 1), fingerSpreadL: H(0.7), fingerSpreadR: H(0.7) }),
    C('snap', 'Щелчок пальцами', 1.2, { fingerSpreadR: P(1, 0.3, 0.5), fistR: P(0.9, 0.2, 0.4) }),
    C('gentle', 'Мягкие пальцы', 1.8, { fingerSpreadL: H(0.45), fingerSpreadR: H(0.45), nailShine: H(0.5) }),
    C('cold', 'Погреть пальцы', 1.8, { fingerSpreadL: S(0.25, 4, 0.4), fingerSpreadR: S(0.25, 4, 0.4), fistL: S(0.3, 4, 0.5), fistR: S(0.3, 4, 0.5) }),
  ];
  const feet = [
    C('tiptoe', 'Встать на носочки', 1.5, { footPointL: R(0, 1), footPointR: R(0, 1), bodyY: R(0, -7) }),
    C('step', 'Шаг стопой', 1.3, { footPointL: S(0.6, 1, 0.4), hipL: S(20, 1) }),
    C('toe-curl', 'Сжать пальцы ног', 1.3, { toeCurl: R(0, 1) }),
    C('heel', 'Опора на пятку', 1.4, { footPointL: H(-0.4), footPointR: H(-0.4), toeCurl: H(0.6) }),
    C('swing', 'Покачать стопой', 1.7, { footPointL: S(0.7, 1, 0.2), ankleL: S(12, 1) }),
    C('jump-feet', 'Стопы при прыжке', 1.1, { footPointL: P(1, 0, 0.4), footPointR: P(1, 0, 0.4), bodyY: P(-20, 0, 0.4) }),
    C('dance-feet', 'Танцевальные стопы', 2.0, { footPointL: S(0.8, 2, 0.3), footPointR: S(0.8, 2, 0.3, Math.PI) }),
    C('rest', 'Расслабленные стопы', 2.0, { footPointL: H(0), footPointR: H(0), toeCurl: H(0.1) }),
    C('turn-foot', 'Повернуть стопу', 1.5, { ankleL: S(20, 1), footPointL: S(0.4, 1, 0.3) }),
    C('sleep-feet', 'Стопы во сне', 2.6, { footPointL: H(0.15), footPointR: H(0.15), toeCurl: H(0.2), blink: H(1) }),
  ];
  const skin = [
    C('blush', 'Румянец', 1.5, { blush: R(0, 0.9) }),
    C('freckles', 'Веснушки', 1.5, { freckle: R(0.2, 1) }),
    C('glow', 'Тёплое сияние кожи', 1.7, { skinGlow: R(0.2, 1) }),
    C('pale', 'Побледнеть', 1.5, { skinGlow: R(0.5, 0), blush: H(0) }),
    C('sun-kiss', 'Солнечный блик', 1.7, { skinGlow: P(1, 0.3, 0.5), freckle: P(0.8, 0.3, 0.5) }),
    C('shy-blush', 'Смущённый румянец', 1.7, { blush: P(1, 0, 0.5), headTilt: H(9), freckle: H(0.6) }),
    C('after-bath', 'Кожа после ванны', 2.0, { skinGlow: H(0.9), blush: H(0.35), freckle: H(0.4) }),
    C('sleep-skin', 'Кожа во сне', 2.6, { skinGlow: H(0.35), blush: H(0.1), blink: H(1) }),
    C('cold-skin', 'Кожа от холода', 1.6, { skinGlow: H(0.15), blush: H(0.5), torsoTwist: S(3, 7) }),
    C('happy-glow', 'Сияние от радости', 2.0, { skinGlow: S(0.25, 2, 0.6), blush: S(0.2, 2, 0.3), smile: H(0.9) }),
  ];

  /* =========================================================================
     v1.2: +200 анимаций — 10 новых частей тела по 20 самостоятельных клипов
     Каждый клип имеет свой набор дорожек и уникальные числовые параметры;
     новые каналы реально читаются ригом (осанка, дыхание, зрачки, ткань и т.д.).
     ========================================================================= */
  function generated(partId, names, tracksFor) {
    return names.map(function (name, i) {
      return C(partId + '-' + String(i + 1).padStart(2, '0'), name,
        1.1 + (i % 5) * 0.28, tracksFor(i), { loop: i % 7 === 0 });
    });
  }
  const shoulders = generated('shoulders', [
    'Пожать плечами', 'Поднять плечи', 'Опустить плечи', 'Свести лопатки', 'Развести лопатки',
    'Вздохнуть плечами', 'Передёрнуть плечом', 'Расслабить плечи', 'Напрячь плечи', 'Покачать плечами',
    'Плечо вперёд', 'Плечо назад', 'Сгорбиться', 'Расправить плечи', 'Дрогнуть плечами',
    'Плечи при смехе', 'Плечи при вздохе', 'Плечи в задумчивости', 'Плечи от холода', 'Плечи при ходьбе',
  ], function (i) {
    return {
      shoulderShrug: S(2.5 + (i % 6), 1 + (i % 3), 0, i * 0.37),
      shoulderL: H(6 + (i % 2 ? 7 : -4) + (i % 5)),
      shoulderR: H(6 + (i % 2 ? -4 : 7) + (i % 4)),
      torsoY: P(-2 - (i % 4), 0, 0.45),
    };
  });
  const spine = generated('spine', [
    'Прогнуть спину', 'Округлить спину', 'Наклониться вперёд', 'Отклониться назад', 'Скрутить поясницу',
    'Вытянуть спину', 'Расслабить поясницу', 'Потянуться вверх', 'Согнуться', 'Выпрямиться',
    'Покачать корпусом', 'Спина при работе', 'Спина при отдыхе', 'Спина при смехе', 'Спина от усталости',
    'Плавный прогиб', 'Глубокий наклон', 'Лёгкий наклон', 'Поворот корпуса', 'Осанка гордая',
  ], function (i) {
    return {
      spineBend: S(4 + (i % 7), 1 + (i % 2), 0, i * 0.31),
      torsoLean: H((i % 2 ? 1 : -1) * (3 + (i % 9))),
      chestLift: S(1.5 + (i % 4), 1, 0, i * 0.2),
      poseArch: H((i % 5) - 2),
    };
  });
  const hips = generated('hips', [
    'Покачать бёдрами', 'Повернуть бёдра', 'Присесть на бёдра', 'Перенести вес', 'Танцевальный поворот',
    'Качнуть тазом', 'Стойка на одном бедре', 'Развернуть таз', 'Сжать бёдра', 'Расслабить бёдра',
    'Шаг с бедра', 'Бёдра при ходьбе', 'Бёдра при приседании', 'Бёдра в танце', 'Бёдра при наклоне',
    'Плавный разворот', 'Пружинка бёдрами', 'Бёдра в сторону', 'Бёдра назад', 'Бёдра в покое',
  ], function (i) {
    return {
      hipTwist: S(5 + (i % 8), 1, 0, i * 0.22),
      hipL: S(4 + (i % 6), 1, 0, i * 0.2),
      hipR: S(4 + (i % 6), 1, 0, Math.PI + i * 0.2),
      skirtSway: S(3 + (i % 7), 2, 0, i * 0.25),
      bodyTurn: H((i % 7) - 3),
    };
  });
  const wrists = generated('wrists', [
    'Повернуть запястье', 'Взять чашку', 'Помахать кистью', 'Согнуть запястье', 'Разогнуть запястье',
    'Покрутить кистью', 'Встряхнуть кисть', 'Запястье при печати', 'Запястье при жесте', 'Запястье при письме',
    'Мягкий поворот', 'Быстрый поворот', 'Запястье вверх', 'Запястье вниз', 'Запястье в сторону',
    'Круговое движение', 'Запястье расслаблено', 'Запястье напряжено', 'Щелчок запястьем', 'Запястье у лица',
  ], function (i) {
    return {
      wristTwistL: S(12 + (i % 18), 2, 0, i * 0.26),
      wristTwistR: S(12 + (i % 18), 2, 0, Math.PI + i * 0.26),
      wristL: S(8 + (i % 10), 1, 0, i * 0.2),
      wristR: S(8 + (i % 10), 1, 0, Math.PI + i * 0.2),
      fingerSpreadR: H(0.2 + (i % 5) * 0.16),
    };
  });
  const ankles = generated('ankles', [
    'Повернуть стопу', 'Покачать лодыжкой', 'Встать на носок', 'Опуститься на пятку', 'Согнуть стопу',
    'Вытянуть стопу', 'Лодыжка при шаге', 'Лодыжка при прыжке', 'Лодыжка в танце', 'Лодыжка при приседании',
    'Круговое движение стопой', 'Лодыжка расслаблена', 'Лодыжка напряжена', 'Подвернуть стопу', 'Распрямить стопу',
    'Лёгкий перекат', 'Быстрый перекат', 'Стопа в сторону', 'Стопа внутрь', 'Стопа в покое',
  ], function (i) {
    return {
      ankleRollL: S(5 + (i % 10), 1, 0, i * 0.3),
      ankleRollR: S(5 + (i % 10), 1, 0, Math.PI + i * 0.3),
      footPointL: S(0.25 + (i % 4) * 0.16, 1, 0, i * 0.2),
      footPointR: S(0.25 + (i % 4) * 0.16, 1, 0, Math.PI + i * 0.2),
      toeCurl: S(0.18 + (i % 3) * 0.2, 2, 0),
    };
  });
  const breath = generated('breath', [
    'Глубокий вдох', 'Медленный выдох', 'Спокойное дыхание', 'Частое дыхание', 'Задержать дыхание',
    'Вздох облегчения', 'Вздох усталости', 'Дыхание перед сном', 'Дыхание во сне', 'Дыхание при беге',
    'Дыхание при смехе', 'Дыхание при волнении', 'Вдох носом', 'Выдох ртом', 'Грудное дыхание',
    'Диафрагмальное дыхание', 'Дрожащий вдох', 'Ровный цикл', 'Короткий вдох', 'Долгий выдох',
  ], function (i) {
    return {
      breath: S(0.4 + (i % 5) * 0.16, 1 + (i % 3), 0.5, i * 0.2),
      chestLift: S(1 + (i % 4), 1 + (i % 2), 0, i * 0.3),
      torsoY: S(0.8 + (i % 3), 1, 0, i * 0.2),
      shoulderShrug: S(0.5 + (i % 3) * 0.2, 1, 0, i * 0.2),
    };
  });
  const gaze = generated('gaze', [
    'Посмотреть влево', 'Посмотреть вправо', 'Посмотреть вверх', 'Посмотреть вниз', 'Уставиться в точку',
    'Скользнуть взглядом', 'Отвести глаза', 'Встретиться взглядом', 'Прищуриться', 'Расширить зрачки',
    'Сузить зрачки', 'Следить за предметом', 'Перевести взгляд', 'Закатить глаза', 'Смотреть искоса',
    'Взгляд в окно', 'Взгляд в зеркало', 'Взгляд на руки', 'Взгляд в пол', 'Взгляд вдаль',
  ], function (i) {
    return {
      gazeX: S(0.55 + (i % 4) * 0.16, 1, 0, i * 0.3),
      gazeY: S(0.25 + (i % 3) * 0.13, 1, 0, i * 0.25),
      pupil: S(0.12 + (i % 4) * 0.07, 1, 0.5, i * 0.2),
      lookX: S(0.4 + (i % 3) * 0.2, 1, 0),
      blink: P(1, 0, 0.5 + (i % 3) * 0.12),
    };
  });
  const emotions = generated('emotions', [
    'Радость', 'Грусть', 'Удивление', 'Смущение', 'Гордость',
    'Тревога', 'Нежность', 'Задумчивость', 'Раздражение', 'Облегчение',
    'Стыд', 'Уверенность', 'Сомнение', 'Восхищение', 'Обида',
    'Благодарность', 'Любопытство', 'Усталость', 'Воодушевление', 'Спокойствие',
  ], function (i) {
    return {
      smile: H(i % 2 ? 0.9 : -0.7),
      brow: H((i % 3) - 1),
      blush: H(0.15 + (i % 5) * 0.17),
      skinGlow: H(0.18 + (i % 4) * 0.2),
      lipPout: H(0.15 + (i % 3) * 0.25),
      headDuck: H(i % 2 ? 4 : 0),
    };
  });
  const poses = generated('poses', [
    'Стойка свободная', 'Стойка собранная', 'Руки на поясе', 'Руки скрещены', 'Рука у подбородка',
    'Поза у окна', 'Поза за столом', 'Поза на диване', 'Поза у зеркала', 'Поза в дверях',
    'Наклон вперёд', 'Отклон назад', 'Полуприсед', 'Поворот на месте', 'Поза для фото',
    'Поза задумчивая', 'Поза уверенная', 'Поза робкая', 'Поза усталая', 'Поза танцевальная',
  ], function (i) {
    return {
      poseArch: H((i % 5) - 2),
      bodyTurn: H((i % 7) - 3),
      squat: H((i % 4) * 0.12),
      armCross: H(i % 3 === 0 ? 1 : 0),
      torsoTwist: H((i % 5) - 2),
      bodyY: H(-(i % 4) * 2),
    };
  });
  const interact = generated('interact', [
    'Открыть шкаф', 'Достать вешалку', 'Выбрать ткань', 'Снять вещь с плечиков', 'Поднести к лицу',
    'Примерить у зеркала', 'Застегнуть молнию', 'Расправить подол', 'Поправить воротник', 'Проверить отражение',
    'Взять чашку', 'Поставить чашку', 'Открыть дверцу', 'Потянуться к полке', 'Сложить одежду',
    'Погладить ткань', 'Встряхнуть платье', 'Повесить на плечики', 'Покрутить у зеркала', 'Убрать вещь обратно',
  ], function (i) {
    return {
      armCross: H(i % 2),
      wristTwistR: S(10 + (i % 12), 1, 0, i * 0.2),
      fabricDrape: R(0, 0.5 + (i % 4) * 0.12),
      hemSpin: S(3 + (i % 6), 1, 0, i * 0.2),
      mirrorCheck: P(1, 0, 0.5),
      headNod: P(4 + (i % 6), 0, 0.4),
    };
  });

  /* v1.2: ещё 3 части × 20 клипов. Всё — приличный силуэт под тканью. */
  const bust = generated('bust', [
    'Спокойное дыхание', 'Глубокий вдох', 'Медленный выдох', 'Расправить плечи', 'Осанка прямо',
    'Лёгкий наклон вперёд', 'Поворот корпуса', 'Вздох облегчения', 'Задержка дыхания', 'Вдох перед словом',
    'Расслабить грудь', 'Выпрямить спину', 'Смущённый вдох', 'Волнение', 'Успокоиться',
    'Ровный ритм', 'Вздох удивления', 'Тихий смех', 'Вдох перед сном', 'Выдох после сна',
  ], function (i) {
    return {
      bustLift: S(4 + (i % 6), 1 + (i % 3), 0, i * 0.2),
      chestLift: S(2 + (i % 5), 1, 0, i * 0.17),
      breath: P(0.8, 0.2, 0.45),
      shoulderShrug: S(1.5 + (i % 4), 1, 0, i * 0.3),
      warmth: H(22 + (i % 5) - 2),
    };
  });
  const waist = generated('waist', [
    'Поворот талии', 'Наклон вбок', 'Лёгкий изгиб', 'Прогиб назад', 'Скручивание влево',
    'Скручивание вправо', 'Втянуть живот', 'Расслабить живот', 'Поворот за плечиком', 'Наклон к полке',
    'Потянуться', 'Присесть-встать', 'Покачивание', 'Баланс на месте', 'Шаг с поворотом',
    'Разворот к зеркалу', 'Разворот от зеркала', 'Плавный изгиб', 'Осанка перед выходом', 'Вернуться ровно',
  ], function (i) {
    return {
      waistTwist: S(5 + (i % 8), 1 + (i % 2), 0, i * 0.25),
      spineBend: S(2 + (i % 5), 1, 0, i * 0.2),
      hipTwist: S(3 + (i % 7), 1, 0, i * 0.15),
      torsoLean: P(6, 0, 0.5),
    };
  });
  const layers = generated('layers', [
    'Бретель на плече', 'Поправить бретель', 'Нижний слой под платьем', 'Снять верхний слой',
    'Сложить снятое', 'Остаться в домашнем', 'Потянуться к шкафу', 'Взять комбинацию',
    'Надеть нижний слой', 'Расправить ткань', 'Застегнуть', 'Проверить посадку',
    'Прикрыться халатом', 'Вернуть верхний слой', 'Слой за слоем', 'Поправить подол',
    'Ткань дышит', 'Сменить бельё за ширмой', 'Убрать вещь в корзину', 'Готовый образ',
  ], function (i) {
    return {
      layerShift: S(2 + (i % 5), 1, 0, i * 0.2),
      layerReveal: R(i % 2 ? 0.2 : 0, i % 2 ? 0 : 0.6),
      hemLayer: S(2 + (i % 6), 1, 0, i * 0.22),
      fabricDrape: R(0.1, 0.4 + (i % 4) * 0.1),
      headDuck: P(6, 0, 0.5),
    };
  });

  /* Трёхфазный цикл переодевания: снять → найти → надеть */
  const DRESS_SEQUENCE = [
    { id: 'remove', label: 'Снимает одежду', from: 0, to: 0.30,
      scene: 'dress-change', clips: [
        { part: 'interact', id: 'interact-04' }, { part: 'shoulders', id: 'shoulders-02' },
        { part: 'emotions', id: 'emotions-04' }, { part: 'layers', id: 'layers-04' },
        { part: 'bust', id: 'bust-13' },
      ] },
    { id: 'search', label: 'Ищет одежду в шкафу', from: 0.30, to: 0.64,
      scene: 'dress-choose', clips: [
        { part: 'interact', id: 'interact-01' }, { part: 'interact', id: 'interact-03' },
        { part: 'gaze', id: 'gaze-17' }, { part: 'spine', id: 'spine-03' },
        { part: 'layers', id: 'layers-07' }, { part: 'waist', id: 'waist-09' },
      ] },
    { id: 'wear', label: 'Надевает новый наряд', from: 0.64, to: 1,
      scene: 'dress-up', clips: [
        { part: 'interact', id: 'interact-07' }, { part: 'interact', id: 'interact-08' },
        { part: 'poses', id: 'poses-17' }, { part: 'emotions', id: 'emotions-12' },
        { part: 'layers', id: 'layers-09' }, { part: 'bust', id: 'bust-04' },
      ] },
  ];

  const LIBRARY = {
    head: head, face: face, eyes: eyes, hair: hair, torso: torso,
    armL: armClips('L'), armR: armClips('R'),
    handL: handClips('L'), handR: handClips('R'),
    legL: legClips('L'), legR: legClips('R'),
    skirt: skirt, routine: routine,
    brows: brows, lips: lips, ears: ears, neck: neck,
    fingers: fingers, feet: feet, skin: skin,
    shoulders: shoulders, spine: spine, hips: hips, wrists: wrists, ankles: ankles,
    breath: breath, gaze: gaze, emotions: emotions, poses: poses, interact: interact,
    bust: bust, waist: waist, layers: layers,
  };

  function clipsFor(part) { return LIBRARY[part] || []; }
  function findClip(part, id) {
    const list = clipsFor(part);
    for (let i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }
  function allClips() {
    const out = [];
    PARTS.forEach(function (p) { clipsFor(p.id).forEach(function (c) { out.push({ part: p.id, clip: c }); }); });
    return out;
  }
  function counts() {
    const out = {};
    PARTS.forEach(function (p) { out[p.id] = clipsFor(p.id).length; });
    return out;
  }
  function total() { return allClips().length; }

  /* --- выборка ключевых кадров --------------------------------------------- */
  function sampleTrack(frames, phase) {
    if (!frames || !frames.length) return 0;
    if (phase <= frames[0][0]) return frames[0][1];
    const last = frames[frames.length - 1];
    if (phase >= last[0]) return last[1];
    for (let i = 1; i < frames.length; i++) {
      const a = frames[i - 1], b = frames[i];
      if (phase <= b[0]) {
        const span = b[0] - a[0];
        let t = span <= 0 ? 1 : (phase - a[0]) / span;
        t = t * t * (3 - 2 * t); // smoothstep
        return a[1] + (b[1] - a[1]) * t;
      }
    }
    return last[1];
  }
  function sampleClip(clip, elapsed) {
    const phase = clip.loop
      ? (elapsed % clip.duration) / clip.duration
      : Math.min(1, elapsed / clip.duration);
    const out = {};
    Object.keys(clip.tracks).forEach(function (ch) { out[ch] = sampleTrack(clip.tracks[ch], phase); });
    return out;
  }

  /* --- аниматор: базовые циклы + накладываемые команды --------------------- */
  function Animator() {
    this.time = 0;
    this.base = [];       // [{clip, weight}]
    this.overrides = [];  // [{clip, elapsed, weight, part}]
  }
  Animator.prototype.setBase = function (specs) {
    const self = this;
    this.base = (specs || []).map(function (s) {
      const clip = typeof s === 'string' ? findClip('torso', s) : s.clip;
      return clip ? { clip: clip, weight: s.weight === undefined ? 0.65 : s.weight } : null;
    }).filter(Boolean);
    return self;
  };
  Animator.prototype.play = function (part, id, opts) {
    const clip = typeof id === 'string' ? findClip(part, id) : id;
    if (!clip) return null;
    opts = opts || {};
    const entry = { clip: clip, part: part, elapsed: 0, weight: opts.weight === undefined ? 1 : opts.weight,
      loop: !!opts.loop || clip.loop, tag: opts.tag || '' };
    if (opts.replace) {
      this.overrides = this.overrides.filter(function (o) { return o.part !== part; });
    }
    if (opts.tag) {
      this.overrides = this.overrides.filter(function (o) { return !(o.tag === opts.tag && o.part === part); });
    }
    this.overrides.push(entry);
    if (this.overrides.length > 32) this.overrides.shift();
    return entry;
  };
  Animator.prototype.clearTag = function (tag) {
    this.overrides = this.overrides.filter(function (o) { return o.tag !== tag; });
  };
  Animator.prototype.clearPrefix = function (prefix) {
    this.overrides = this.overrides.filter(function (o) { return !(o.tag && o.tag.indexOf(prefix) === 0); });
  };
  Animator.prototype.playMany = function (specs) {
    const self = this;
    (specs || []).forEach(function (s) { self.play(s.part, s.id, s); });
  };
  Animator.prototype.tick = function (dt) {
    this.time += dt;
    this.overrides = this.overrides.filter(function (o) {
      o.elapsed += dt;
      return o.loop || o.elapsed < o.clip.duration + 0.05;
    });
  };
  Animator.prototype.pose = function (manual) {
    const acc = {};
    function add(values, weight) {
      if (weight <= 0) return;
      Object.keys(values).forEach(function (ch) {
        if (!acc[ch]) acc[ch] = { sum: 0, w: 0 };
        acc[ch].sum += values[ch] * weight;
        acc[ch].w += weight;
      });
    }
    this.base.forEach(function (b) { add(sampleClip(b.clip, this.time), b.weight); }, this);
    this.overrides.forEach(function (o) {
      let w = o.weight;
      if (!o.loop) {
        const fadeIn = Math.min(1, o.elapsed / 0.18);
        const fadeOut = Math.min(1, (o.clip.duration - o.elapsed) / 0.22);
        w *= Math.max(0, Math.min(fadeIn, fadeOut));
      }
      add(sampleClip(o.clip, o.elapsed), w);
    });
    const pose = {};
    CHANNELS.forEach(function (ch) {
      pose[ch] = acc[ch] ? acc[ch].sum / acc[ch].w : DEFAULT_POSE[ch];
    });
    if (manual) Object.keys(manual).forEach(function (ch) { if (ch in pose) pose[ch] = manual[ch]; });
    return pose;
  };

  NIKA.anim = {
    PARTS: PARTS, DEFAULT_POSE: DEFAULT_POSE, CHANNELS: CHANNELS, LIBRARY: LIBRARY,
    ROUTINES: ROUTINES, DRESS_SEQUENCE: DRESS_SEQUENCE,
    clipsFor: clipsFor, findClip: findClip, allClips: allClips, counts: counts, total: total,
    sampleClip: sampleClip, sampleTrack: sampleTrack, Animator: Animator,
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
