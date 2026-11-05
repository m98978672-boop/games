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

  const LIBRARY = {
    head: head, face: face, eyes: eyes, hair: hair, torso: torso,
    armL: armClips('L'), armR: armClips('R'),
    handL: handClips('L'), handR: handClips('R'),
    legL: legClips('L'), legR: legClips('R'),
    skirt: skirt,
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
    clipsFor: clipsFor, findClip: findClip, allClips: allClips, counts: counts, total: total,
    sampleClip: sampleClip, sampleTrack: sampleTrack, Animator: Animator,
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
