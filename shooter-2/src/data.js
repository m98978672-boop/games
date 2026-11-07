/* =============================================================================
   СЕКТОР «ПЕПЕЛ» — данные игры, собранные с нуля
   -----------------------------------------------------------------------------
   Здесь живёт библиотека анимаций:
       22 части тела  ×  20 анимаций  ×  4 варианта  =  1760 клипов
   Каждая часть тела (таз, поясница, грудь, шея, голова, ключицы, плечи,
   предплечья, кисти, бёдра, колени, стопы, оружие) анимируется независимо,
   поэтому оружие/руки могут играть «aim» + «shoot», пока ноги играют «walk».

   Анимации описаны НЕ случайным шумом: у каждого клипа есть набор
   смысловых каналов (наклон корпуса, взмах ноги, подъём руки, отдача...),
   которые раскладываются по костям с весами. Вариант анимации меняет
   амплитуду, темп, асимметрию, наклон и добавляет детерминированный джиттер.
   ============================================================================= */
(function (root) {
  'use strict';
  const SH2 = (root.SH2 = root.SH2 || {});
  const TAU = Math.PI * 2;

  /* ---------------------------------------------------------------------------
     1. ЧАСТИ ТЕЛА
     role — как часть ведёт себя в движении; side: 1 = левая, -1 = правая.
     --------------------------------------------------------------------------- */
  const PARTS = [
    { id: 'pelvis',     bone: 'pelvis',     role: 'root',      group: 'core',   label: 'Таз (корень)',           gain: { rx: 0.30, ry: 0.55, rz: 0.22, ty: 0.055, tz: 0.045 } },
    { id: 'spine',      bone: 'spine',      role: 'spineMid',  group: 'core',   label: 'Поясница',               gain: { rx: 0.32, ry: 0.30, rz: 0.20 } },
    { id: 'chest',      bone: 'chest',      role: 'chest',     group: 'core',   label: 'Грудная клетка',         gain: { rx: 0.36, ry: 0.42, rz: 0.26 } },
    { id: 'neck',       bone: 'neck',       role: 'neck',      group: 'core',   label: 'Шея',                    gain: { rx: 0.30, ry: 0.34, rz: 0.18 } },
    { id: 'head',       bone: 'head',       role: 'head',      group: 'core',   label: 'Голова',                 gain: { rx: 0.42, ry: 0.75, rz: 0.22 } },
    { id: 'shoulderL',  bone: 'shoulderL',  role: 'clavicle',  group: 'arms',   side: 1,  label: 'Левая ключица',  gain: { rx: 0.22, ry: 0.16, rz: 0.34 } },
    { id: 'shoulderR',  bone: 'shoulderR',  role: 'clavicle',  group: 'arms',   side: -1, label: 'Правая ключица', gain: { rx: 0.22, ry: 0.16, rz: 0.34 } },
    { id: 'upperArmL',  bone: 'upperArmL',  role: 'upperArm',  group: 'arms',   side: 1,  label: 'Левое плечо',    gain: { rx: 0.95, ry: 0.30, rz: 0.55 } },
    { id: 'upperArmR',  bone: 'upperArmR',  role: 'upperArm',  group: 'arms',   side: -1, label: 'Правое плечо',   gain: { rx: 0.95, ry: 0.30, rz: 0.55 } },
    { id: 'lowerArmL',  bone: 'lowerArmL',  role: 'lowerArm',  group: 'arms',   side: 1,  label: 'Левое предплечье',  gain: { rx: 1.05, ry: 0.14, rz: 0.12 } },
    { id: 'lowerArmR',  bone: 'lowerArmR',  role: 'lowerArm',  group: 'arms',   side: -1, label: 'Правое предплечье', gain: { rx: 1.05, ry: 0.14, rz: 0.12 } },
    { id: 'handL',      bone: 'handL',      role: 'hand',      group: 'arms',   side: 1,  label: 'Левая кисть',    gain: { rx: 0.40, ry: 0.34, rz: 0.40 } },
    { id: 'handR',      bone: 'handR',      role: 'hand',      group: 'arms',   side: -1, label: 'Правая кисть',   gain: { rx: 0.40, ry: 0.34, rz: 0.40 } },
    { id: 'hipL',       bone: 'hipL',       role: 'hipJoint',  group: 'legs',   side: 1,  label: 'Левый тазобедренный',  gain: { rx: 0.24, ry: 0.18, rz: 0.16 } },
    { id: 'hipR',       bone: 'hipR',       role: 'hipJoint',  group: 'legs',   side: -1, label: 'Правый тазобедренный', gain: { rx: 0.24, ry: 0.18, rz: 0.16 } },
    { id: 'upperLegL',  bone: 'upperLegL',  role: 'upperLeg',  group: 'legs',   side: 1,  label: 'Левое бедро',    gain: { rx: 1.00, ry: 0.16, rz: 0.22 } },
    { id: 'upperLegR',  bone: 'upperLegR',  role: 'upperLeg',  group: 'legs',   side: -1, label: 'Правое бедро',   gain: { rx: 1.00, ry: 0.16, rz: 0.22 } },
    { id: 'lowerLegL',  bone: 'lowerLegL',  role: 'lowerLeg',  group: 'legs',   side: 1,  label: 'Левое колено',   gain: { rx: 1.20, ry: 0.10, rz: 0.10 } },
    { id: 'lowerLegR',  bone: 'lowerLegR',  role: 'lowerLeg',  group: 'legs',   side: -1, label: 'Правое колено',  gain: { rx: 1.20, ry: 0.10, rz: 0.10 } },
    { id: 'footL',      bone: 'footL',      role: 'foot',      group: 'legs',   side: 1,  label: 'Левая стопа',    gain: { rx: 0.65, ry: 0.22, rz: 0.20 } },
    { id: 'footR',      bone: 'footR',      role: 'foot',      group: 'legs',   side: -1, label: 'Правая стопа',   gain: { rx: 0.65, ry: 0.22, rz: 0.20 } },
    { id: 'weapon',     bone: 'weapon',     role: 'weapon',    group: 'weapon', label: 'Оружие',                 gain: { rx: 0.26, ry: 0.14, rz: 0.30 } }
  ];
  const PART_BY_ID = {};
  PARTS.forEach((p) => { PART_BY_ID[p.id] = p; });

  /* ---------------------------------------------------------------------------
     2. НАБОР АНИМАЦИЙ: 20 штук на каждую часть тела (требовалось минимум 15)
     loop — цикл; dur — длительность в секундах при варианте «стандарт».
     --------------------------------------------------------------------------- */
  const CLIPS = [
    { id: 'idle',     label: 'Стойка',              dur: 2.60, loop: true,  tag: 'база' },
    { id: 'breathe',  label: 'Дыхание',             dur: 3.20, loop: true,  tag: 'база' },
    { id: 'walk',     label: 'Шаг вперёд',          dur: 1.00, loop: true,  tag: 'движение' },
    { id: 'walkBack', label: 'Шаг назад',           dur: 1.12, loop: true,  tag: 'движение' },
    { id: 'strafeL',  label: 'Шаг влево',           dur: 1.04, loop: true,  tag: 'движение' },
    { id: 'strafeR',  label: 'Шаг вправо',          dur: 1.04, loop: true,  tag: 'движение' },
    { id: 'run',      label: 'Бег',                 dur: 0.68, loop: true,  tag: 'движение' },
    { id: 'crouch',   label: 'Присед',              dur: 1.40, loop: true,  tag: 'движение' },
    { id: 'aim',      label: 'Прицеливание',        dur: 1.80, loop: true,  tag: 'бой' },
    { id: 'shoot',    label: 'Выстрел',             dur: 0.30, loop: false, tag: 'бой' },
    { id: 'reload',   label: 'Перезарядка',         dur: 1.90, loop: false, tag: 'бой' },
    { id: 'jump',     label: 'Прыжок',              dur: 0.50, loop: false, tag: 'движение' },
    { id: 'fall',     label: 'Падение',             dur: 0.90, loop: true,  tag: 'движение' },
    { id: 'land',     label: 'Приземление',         dur: 0.45, loop: false, tag: 'движение' },
    { id: 'hurt',     label: 'Ранение',             dur: 0.52, loop: false, tag: 'реакция' },
    { id: 'die',      label: 'Смерть',              dur: 1.10, loop: false, tag: 'реакция' },
    { id: 'melee',    label: 'Ближний бой',         dur: 0.62, loop: false, tag: 'бой' },
    { id: 'throw',    label: 'Бросок гранаты',      dur: 0.80, loop: false, tag: 'бой' },
    { id: 'point',    label: 'Жест / команда',      dur: 1.00, loop: false, tag: 'реакция' },
    { id: 'inspect',  label: 'Осмотр оружия',       dur: 2.20, loop: false, tag: 'база' }
  ];
  const CLIP_BY_ID = {};
  CLIPS.forEach((c) => { CLIP_BY_ID[c.id] = c; });

  /* ---------------------------------------------------------------------------
     3. ЧЕТЫРЕ ВАРИАНТА КАЖДОЙ АНИМАЦИИ
     std  — стандарт, agg — агрессивный, care — осмотрительный, wnd — раненый
     --------------------------------------------------------------------------- */
  const VARIANTS = [
    { id: 'std',  label: 'Стандарт',      amp: 1.00, speed: 1.00, asym: 0.00, lean: 0.00, jitter: 0.020, limp: 0.00, hold: 1.00, color: '#8fd3ff' },
    { id: 'agg',  label: 'Агрессивный',   amp: 1.34, speed: 1.30, asym: 0.14, lean: 0.13, jitter: 0.075, limp: 0.00, hold: 1.12, color: '#ff8a5c' },
    { id: 'care', label: 'Осмотрительный', amp: 0.70, speed: 0.82, asym: -0.06, lean: -0.07, jitter: 0.012, limp: 0.00, hold: 0.90, color: '#9de59b' },
    { id: 'wnd',  label: 'Раненый',       amp: 0.84, speed: 0.88, asym: 0.34, lean: 0.24, jitter: 0.14, limp: 0.65, hold: 0.84, color: '#ff6b6b' }
  ];

  const CHANNELS = ['rx', 'ry', 'rz', 'ty', 'tz'];

  /* ---------------------------------------------------------------------------
     4. СМЫСЛОВЫЕ СИГНАЛЫ АНИМАЦИЙ
     Каждый клип возвращает набор сигналов в диапазоне примерно [-1..1].
     p — фаза 0..1. Дальше веса раскладывают их по костям.
     --------------------------------------------------------------------------- */
  /* ---------------------------------------------------------------------------
     4b. ХВАТ ОРУЖИЯ: позы рук задаются отдельно для правой и левой руки.
     Верхняя часть тела всегда «держит» оружие, поэтому в клипах движения
     руки качаются лишь слегка — иначе ствол смотрел бы в землю.
     [плечо (сгиб), локоть (сгиб), подъём ключицы]
     --------------------------------------------------------------------------- */
  const ARM_POSE = {
    idle:     { r: [0.62, 0.50, 0.10], l: [0.92, 0.78, 0.04], sway: 0.03 },
    breathe:  { r: [0.64, 0.52, 0.10], l: [0.94, 0.80, 0.04], sway: 0.02 },
    walk:     { r: [0.58, 0.62, 0.08], l: [0.88, 0.86, 0.04], sway: 0.12 },
    walkBack: { r: [0.52, 0.68, 0.10], l: [0.84, 0.90, 0.04], sway: 0.08 },
    strafeL:  { r: [0.56, 0.64, 0.16], l: [0.92, 0.84, 0.10], sway: 0.05 },
    strafeR:  { r: [0.56, 0.64, 0.16], l: [0.92, 0.84, 0.10], sway: 0.05 },
    run:      { r: [0.72, 0.78, 0.06], l: [1.02, 0.96, 0.02], sway: 0.26 },
    crouch:   { r: [0.78, 0.70, 0.14], l: [1.04, 0.92, 0.08], sway: 0.04 },
    aim:      { r: [0.92, 0.52, 0.20], l: [1.16, 0.72, 0.14], sway: 0.015 },
    shoot:    { r: [0.92, 0.52, 0.20], l: [1.16, 0.72, 0.14], sway: 0.01 },
    reload:   { r: [0.70, 0.86, 0.10], l: [0.86, 1.30, 0.00], sway: 0.02 },
    jump:     { r: [0.70, 0.66, 0.14], l: [0.94, 0.82, 0.08], sway: 0.03 },
    fall:     { r: [0.62, 0.58, 0.06], l: [0.88, 0.78, 0.02], sway: 0.05 },
    land:     { r: [0.68, 0.72, 0.10], l: [0.94, 0.86, 0.06], sway: 0.04 },
    hurt:     { r: [0.46, 0.40, 0.20], l: [0.70, 0.62, 0.16], sway: 0.10 },
    die:      { r: [0.34, 0.28, 0.10], l: [0.50, 0.40, 0.06], sway: 0.12 },
    melee:    { r: [0.40, 0.30, 0.10], l: [0.86, 0.92, 0.04], sway: 0.05 },
    throw:    { r: [0.34, 0.26, 0.06], l: [0.66, 0.60, 0.02], sway: 0.08 },
    point:    { r: [0.60, 0.50, 0.10], l: [0.70, 0.40, 0.30], sway: 0.02 },
    inspect:  { r: [0.74, 0.72, 0.18], l: [0.98, 0.92, 0.10], sway: 0.02 }
  };

  function applyArms(clipId, sg, pS) {
    const ap = ARM_POSE[clipId];
    if (!ap) return sg;
    const sway = ap.sway ? Math.sin(TAU * pS) * ap.sway : 0;
    sg.armSwingR = ap.r[0] + sway;
    sg.armBendR = ap.r[1];
    sg.armRaiseR = ap.r[2] || 0;
    sg.armSwingL = ap.l[0] - sway * 0.5;
    sg.armBendL = ap.l[1];
    sg.armRaiseL = ap.l[2] || 0;
    sg.armSwing = (sg.armSwingR + sg.armSwingL) * 0.5;
    sg.armBend = (sg.armBendR + sg.armBendL) * 0.5;
    sg.armRaise = (sg.armRaiseR + sg.armRaiseL) * 0.5;
    return sg;
  }

  function smooth(x) { return x * x * (3 - 2 * x); }
  function bell(p, c, w) { const d = Math.min(Math.abs(p - c), 1 - Math.abs(p - c)); return Math.max(0, 1 - d / w); }
  function decay(p, k) { return Math.exp(-p * k); }

  const SIGNALS = {
    idle(p) {
      const s = Math.sin(TAU * p), c = Math.cos(TAU * p);
      return { torsoPitch: 0.10 + 0.05 * s, torsoRoll: 0.16 * s, torsoTwist: 0.20 * Math.sin(TAU * p + 0.8),
        headPitch: -0.06 * s, headYaw: 0.30 * Math.sin(TAU * p * 0.5 + 1.1), bobY: 0.35 * s, swayZ: 0.28 * c,
        rootYaw: 0.10 * s, legSwing: 0.03 * s, legBend: -0.08, armSwing: 0.86 + 0.05 * s, armRaise: 0.16 + 0.03 * c,
        armBend: 1.05 + 0.06 * s, wrist: 0.05 * s, weaponPitch: 0.10 + 0.04 * s, weaponRoll: 0.06 * c };
    },
    breathe(p) {
      const s = Math.sin(TAU * p), s2 = Math.sin(TAU * p * 2);
      return { torsoPitch: 0.04 * s, torsoRoll: 0.03 * s2, torsoTwist: 0.05 * s, headPitch: 0.05 * s - 0.02,
        headYaw: 0.10 * Math.sin(TAU * p * 0.5), bobY: 0.22 * s, swayZ: 0.05 * s2, rootYaw: 0,
        legSwing: 0, legBend: 0.08, thighBase: 0.10, kneeBase: 0.14, armSwing: 0.88 + 0.03 * s, armRaise: 0.14 + 0.02 * s, armBend: 1.02 + 0.04 * s, wrist: 0.03 * s,
        weaponPitch: 0.02 * s, weaponRoll: 0.02 * s2 };
    },
    walk(p) {
      const s = Math.sin(TAU * p), c = Math.cos(TAU * p), s2 = Math.sin(TAU * p * 2);
      return { torsoPitch: 0.24, torsoRoll: 0.14 * c, torsoTwist: -0.30 * s, headPitch: -0.04 * s2,
        headYaw: 0.12 * Math.sin(TAU * p * 0.5), bobY: 0.55 * Math.abs(s2) - 0.15, swayZ: 0.35 * c,
        rootYaw: 0.06 * s, legSwing: 0.62 * s, legBend: 0.14 + 0.80 * Math.max(0, Math.sin(TAU * p + 1.15)), legSpread: 0.10,
        armSwing: -0.55 * s, armRaise: 0.20, armBend: 0.55 + 0.18 * s, wrist: 0.12 * c,
        weaponPitch: 0.06 * s2, weaponRoll: 0.10 * c };
    },
    walkBack(p) {
      const s = Math.sin(TAU * p), c = Math.cos(TAU * p);
      return { torsoPitch: -0.10, torsoRoll: 0.10 * c, torsoTwist: 0.22 * s, headPitch: 0.06,
        headYaw: 0.25 * Math.sin(TAU * p * 0.3 + 2), bobY: 0.40 * Math.abs(Math.sin(TAU * p * 2)) - 0.10,
        swayZ: 0.28 * c, rootYaw: -0.10 * s, legSwing: -0.40 * s, legBend: 0.16 + 0.62 * Math.max(0, Math.sin(TAU * p + 1.6)),
        legSpread: 0.08, armSwing: 0.34 * s, armRaise: 0.24, armBend: 0.48, wrist: 0.08 * c,
        weaponPitch: 0.10, weaponRoll: 0.06 * c };
    },
    strafeL(p) {
      const s = Math.sin(TAU * p), c = Math.cos(TAU * p);
      return { torsoPitch: 0.12, torsoRoll: -0.22 * c, torsoTwist: 0.16 * s, headPitch: 0,
        headYaw: 0.30, bobY: 0.45 * Math.abs(Math.sin(TAU * p * 2)) - 0.12, swayZ: 0.45 * c,
        rootYaw: 0.16 * c, legSwing: 0.26 * s, legBend: 0.30, legSpread: 0.55 + 0.15 * c,
        armSwing: 0.12 * s, armRaise: 0.32, armBend: 0.62, wrist: 0.06, weaponPitch: 0.03, weaponRoll: -0.10 * c };
    },
    strafeR(p) {
      const s = Math.sin(TAU * p), c = Math.cos(TAU * p);
      return { torsoPitch: 0.12, torsoRoll: 0.22 * c, torsoTwist: -0.16 * s, headPitch: 0,
        headYaw: -0.30, bobY: 0.45 * Math.abs(Math.sin(TAU * p * 2)) - 0.12, swayZ: -0.45 * c,
        rootYaw: -0.16 * c, legSwing: 0.26 * s, legBend: 0.30, legSpread: 0.55 + 0.15 * c,
        armSwing: -0.12 * s, armRaise: 0.32, armBend: 0.62, wrist: -0.06, weaponPitch: 0.03, weaponRoll: 0.10 * c };
    },
    run(p) {
      const s = Math.sin(TAU * p), c = Math.cos(TAU * p), s2 = Math.sin(TAU * p * 2 + 0.4);
      return { torsoPitch: 0.95, torsoRoll: 0.20 * c, torsoTwist: -0.55 * s, headPitch: -0.45,
        headYaw: 0.10 * Math.sin(TAU * p * 0.5), bobY: 0.95 * Math.abs(s2) - 0.30, swayZ: 0.30 * c,
        rootYaw: 0.12 * s, legSwing: 0.92 * s, legBend: 0.30 + 1.35 * Math.max(0, Math.sin(TAU * p + 0.95)), legSpread: 0.06,
        armSwing: -0.95 * s, armRaise: 0.24, armBend: 1.05 + 0.25 * s, wrist: 0.20 * c,
        weaponPitch: 0.30, weaponRoll: 0.22 * c };
    },
    crouch(p) {
      const s = Math.sin(TAU * p), c = Math.cos(TAU * p);
      return { torsoPitch: 0.70, torsoRoll: 0.05 * s, torsoTwist: 0.15 * c, headPitch: -0.35,
        headYaw: 0.22 * Math.sin(TAU * p * 0.4), bobY: -1.05 + 0.20 * Math.abs(s), swayZ: 0.12 * c,
        rootYaw: 0.05 * s, legSwing: 0.12 * s, legBend: 0.25 + 0.12 * Math.abs(s), legSpread: 0.24,
        rootDrop: -0.26 + 0.02 * Math.abs(s), thighBase: 0.55, kneeBase: 1.05, armSwing: -0.20 * s,
        armRaise: 0.34, armBend: 0.95, wrist: 0.12, weaponPitch: 0.12, weaponRoll: 0.08 * c };
    },
    aim(p) {
      const s = Math.sin(TAU * p), s3 = Math.sin(TAU * p * 3 + 1.2);
      return { torsoPitch: 0.34 + 0.04 * s, torsoRoll: 0.06 * s, torsoTwist: -0.42, headPitch: -0.18 + 0.03 * s,
        headYaw: 0.05 * s3, bobY: 0.10 * s, swayZ: 0.06 * s3, rootYaw: 0,
        legSwing: 0.06 * s, legBend: -0.16, legSpread: 0.14, armSwing: 0.72 + 0.03 * s, armRaise: 0.58 + 0.02 * s3,
        armBend: 1.05 + 0.03 * s, wrist: 0.10 + 0.02 * s3, weaponPitch: 0.16 + 0.02 * s3, weaponRoll: 0.03 * s3 };
    },
    shoot(p) {
      const k = decay(p, 7.5);
      const kick = Math.sin(Math.min(1, p * 3) * Math.PI) * k;
      return { torsoPitch: 0.34 - 0.16 * kick, torsoRoll: 0.03 * kick, torsoTwist: -0.42 - 0.18 * kick,
        headPitch: -0.18 + 0.10 * kick, headYaw: 0, bobY: 0.05 * kick, swayZ: 0.05 * kick, rootYaw: 0.05 * kick,
        legSwing: 0, legBend: 0.16, thighBase: 0.16, kneeBase: 0.22, legSpread: 0.14, armSwing: 1.22 + 0.26 * kick, armRaise: 0.30 - 0.10 * kick,
        armBend: 1.30 + 0.55 * kick, wrist: 0.08 + 0.35 * kick, weaponPitch: 0.02 + 0.85 * kick, weaponRoll: 0.22 * kick };
    },
    reload(p) {
      const w = Math.sin(Math.PI * Math.min(1, p));
      const drop = bell(p, 0.30, 0.30), mag = bell(p, 0.62, 0.26), seat = bell(p, 0.86, 0.16);
      return { torsoPitch: 0.30 + 0.18 * w, torsoRoll: 0.10 * drop - 0.08 * mag, torsoTwist: -0.30 + 0.30 * w,
        headPitch: 0.30 * w + 0.06, headYaw: 0.22 * drop - 0.18 * mag, bobY: 0.12 * w, swayZ: 0.08 * mag,
        rootYaw: 0.04 * w, legSwing: 0, legBend: -0.10, legSpread: 0.10, armSwing: 0.46 + 0.34 * w,
        armRaise: 0.62 - 0.34 * drop + 0.20 * mag, armBend: 1.30 + 0.75 * w + 0.30 * seat,
        wrist: 0.20 + 0.85 * (drop + mag) - 0.30 * seat, weaponPitch: 0.34 * w + 0.55 * mag - 0.30 * seat,
        weaponRoll: 0.55 * drop - 0.45 * mag };
    },
    jump(p) {
      const up = Math.min(1, p * 3), out = p > 0.75 ? (p - 0.75) / 0.25 : 0;
      return { torsoPitch: 0.45 * up - 0.30 * out, torsoRoll: 0, torsoTwist: 0.10,
        headPitch: -0.32 * up, headYaw: 0, bobY: 1.35 * up - 0.40 * out, swayZ: 0,
        rootYaw: 0, legSwing: 0.55 * up - 0.55 * out, legBend: 0.35 + 1.25 * up, legSpread: 0.18,
        rootDrop: 0.10 * up,
        armSwing: 0.55 * up - 0.35 * out, armRaise: 0.55, armBend: 0.85, wrist: 0.20 * up,
        weaponPitch: 0.25 * up, weaponRoll: 0.10 };
    },
    fall(p) {
      const s = Math.sin(TAU * p * 0.5), s2 = Math.sin(TAU * p * 1.7 + 0.6);
      return { torsoPitch: -0.28 + 0.14 * s, torsoRoll: 0.18 * s2, torsoTwist: 0.16 * s,
        headPitch: 0.30 + 0.10 * s2, headYaw: 0.14 * s, bobY: -0.10, swayZ: 0.20 * s2, rootYaw: 0.10 * s,
        legSwing: 0.45 + 0.25 * s, legBend: 0.65 + 0.25 * s2, legSpread: 0.30,
        armSwing: 1.05 + 0.30 * s2, armRaise: 0.85, armBend: 0.55 + 0.25 * s,
        wrist: 0.25 * s2, weaponPitch: 0.55, weaponRoll: 0.35 * s };
    },
    land(p) {
      const dip = bell(p, 0.18, 0.42);
      return { torsoPitch: 0.75 * dip, torsoRoll: 0.06 * dip, torsoTwist: 0.10 * dip,
        headPitch: -0.30 * dip, headYaw: 0, bobY: -1.15 * dip, swayZ: 0,
        rootYaw: 0, legSwing: 0.20 * dip, legBend: 0.30 * dip, legSpread: 0.30 * dip,
        rootDrop: -0.34 * dip, thighBase: 0.80 * dip, kneeBase: 1.40 * dip,
        armSwing: 0.35 * dip, armRaise: 0.45 + 0.35 * dip, armBend: 0.95 * dip + 0.30,
        wrist: 0.30 * dip, weaponPitch: 0.45 * dip, weaponRoll: 0.12 * dip };
    },
    hurt(p) {
      const k = decay(p, 5.0) * Math.sin(Math.min(1, p * 6) * Math.PI);
      return { torsoPitch: -0.55 * k, torsoRoll: 0.42 * k, torsoTwist: 0.38 * k,
        headPitch: -0.62 * k, headYaw: -0.55 * k, bobY: -0.25 * k, swayZ: 0.45 * k, rootYaw: -0.30 * k,
        legSwing: 0.14 * k, legBend: 0.36 * k, legSpread: 0.25 * k, rootDrop: -0.10 * k, armSwing: -0.65 * k, armRaise: 0.85 * k,
        armBend: 0.95 * k, wrist: 0.60 * k, weaponPitch: -0.55 * k, weaponRoll: 0.65 * k };
    },
    die(p) {
      const e = smooth(Math.min(1, p * 1.15));
      const shake = Math.sin(p * 26) * decay(p, 3.2) * 0.18;
      return { torsoPitch: 0.25 + 1.45 * e + shake, torsoRoll: 0.55 * e + shake, torsoTwist: 0.45 * e,
        headPitch: 0.85 * e - 0.20, headYaw: -0.55 * e, bobY: -1.10 * e, swayZ: 0.55 * e,
        rootYaw: -0.65 * e, rootPitch: 1.35 * e, rootDrop: -0.30 * e,
        legSwing: 0.55 * e, legBend: 0.85 * e, legSpread: 0.55 * e,
        armSwing: 1.05 * e, armRaise: 1.15 * e, armBend: 0.55 * (1 - e) + 0.15, wrist: 0.75 * e,
        weaponPitch: 1.35 * e, weaponRoll: 0.95 * e, dropWeapon: e > 0.45 };
    },
    melee(p) {
      const wind = bell(p, 0.22, 0.28), swing = bell(p, 0.52, 0.24), rec = bell(p, 0.76, 0.30);
      return { torsoPitch: 0.20 + 0.25 * swing, torsoRoll: -0.25 * wind + 0.42 * swing, torsoTwist: 0.85 * wind - 1.15 * swing + 0.25 * rec,
        headPitch: -0.10, headYaw: 0.35 * wind - 0.45 * swing, bobY: -0.15 * swing, swayZ: -0.18 * wind + 0.30 * swing,
        rootYaw: 0.35 * wind - 0.55 * swing, legSwing: 0.30 * swing, legBend: 0.30,
        rootDrop: -0.12 * swing, thighBase: 0.24, kneeBase: 0.30, legSpread: -0.30 * wind + 0.35 * swing,
        armSwing: 0.25 * wind + 1.35 * swing, armRaise: 1.25 * wind - 0.85 * swing, armBend: 1.55 * wind - 0.75 * swing,
        wrist: 0.85 * wind - 0.65 * swing, weaponPitch: 0.75 * wind - 1.25 * swing, weaponRoll: -0.65 * wind + 0.95 * swing };
    },
    throw(p) {
      const wind = bell(p, 0.30, 0.34), rel = bell(p, 0.62, 0.22), fol = bell(p, 0.78, 0.25);
      return { torsoPitch: -0.35 * wind + 0.55 * rel + 0.25 * fol, torsoRoll: -0.30 * wind + 0.35 * rel,
        torsoTwist: -0.75 * wind + 1.05 * rel, headPitch: -0.20 * wind + 0.25 * rel, headYaw: 0.30 * wind - 0.40 * rel,
        bobY: -0.55 * wind + 0.30 * rel, swayZ: -0.25 * wind + 0.40 * rel, rootYaw: -0.45 * wind + 0.65 * rel,
        legSwing: -0.20 * wind + 0.35 * rel, legBend: 0.40, rootDrop: -0.10 * wind, thighBase: 0.22, kneeBase: 0.30, legSpread: 0.30,
        armSwing: -1.15 * wind + 1.65 * rel + 0.85 * fol, armRaise: 0.95 * wind - 0.55 * rel,
        armBend: 1.65 * wind - 1.30 * rel, wrist: 0.85 * wind - 0.95 * rel, weaponPitch: -0.65 * wind + 0.85 * rel,
        weaponRoll: -0.55 * wind + 0.75 * rel };
    },
    point(p) {
      const e = bell(p, 0.30, 0.55);
      return { torsoPitch: 0.10, torsoRoll: 0.10 * e, torsoTwist: -0.30 * e, headPitch: -0.10 * e,
        headYaw: -0.35 * e, bobY: 0.08 * e, swayZ: 0.10 * e, rootYaw: -0.12 * e,
        legSwing: 0.05 * e, legBend: 0.10, legSpread: 0.18, armSwing: 1.35 * e, armRaise: 1.05 * e,
        armBend: 0.25 * e, wrist: -0.35 * e, weaponPitch: 0.20 * e, weaponRoll: 0.10 * e };
    },
    inspect(p) {
      const spin = Math.sin(TAU * p * 1.2);
      const lift = bell(p, 0.42, 0.55);
      return { torsoPitch: 0.18 + 0.10 * lift, torsoRoll: 0.10 * spin * lift, torsoTwist: 0.35 * lift,
        headPitch: 0.35 * lift, headYaw: 0.30 * lift, bobY: 0.10 * lift, swayZ: 0.10 * spin * lift,
        rootYaw: 0.10 * lift, legSwing: 0, legBend: 0.10, thighBase: 0.08, kneeBase: 0.12, legSpread: 0.12, armSwing: 0.95 * lift,
        armRaise: 0.65 * lift, armBend: 1.45 * lift, wrist: 0.75 * spin * lift,
        weaponPitch: 0.35 * lift, weaponRoll: 1.25 * spin * lift };
    }
  };
  CLIPS.forEach((c) => { if (!SIGNALS[c.id]) throw new Error('нет сигналов клипа ' + c.id); });

  /* ---------------------------------------------------------------------------
     5. РАСКЛАДКА СИГНАЛОВ ПО КОСТЯМ
     Для каждой роли — какие каналы и с какими весами берутся из сигналов.
     side прокидывается в сигналы для левой/правой части (противофаза и асимметрия).
     --------------------------------------------------------------------------- */
  const PHASE_LAG = { root: 0, spineMid: 0.012, chest: 0.022, neck: 0.03, head: 0.045,
    clavicle: 0.028, upperArm: 0.038, lowerArm: 0.052, hand: 0.064,
    hipJoint: 0.014, upperLeg: 0.02, lowerLeg: 0.036, foot: 0.05, weapon: 0.058 };

  // выбор сигнала по стороне: левая рука может держать оружие иначе
  let CUR_SIDE = 0;
  function pick(sg, name) {
    const key = CUR_SIDE === 1 ? name + 'L' : CUR_SIDE === -1 ? name + 'R' : null;
    if (key && sg[key] !== undefined) return sg[key];
    return sg[name] || 0;
  }

  function mapRole(role, sg) {
    switch (role) {
      case 'root':
        return { rx: (sg.torsoPitch || 0) * 0.30 + (sg.rootPitch || 0), ry: (sg.rootYaw || 0),
          rz: (sg.torsoRoll || 0) * 0.30,
          ty: (sg.bobY || 0) * 0.07 + (sg.rootDrop || 0), tz: (sg.swayZ || 0) * 0.05 };
      case 'spineMid':
        return { rx: (sg.torsoPitch || 0) * 0.34, ry: (sg.torsoTwist || 0) * 0.34, rz: (sg.torsoRoll || 0) * 0.36 };
      case 'chest':
        return { rx: (sg.torsoPitch || 0) * 0.42, ry: (sg.torsoTwist || 0) * 0.48, rz: (sg.torsoRoll || 0) * 0.40 };
      case 'neck':
        return { rx: -(sg.torsoPitch || 0) * 0.18 + (sg.headPitch || 0) * 0.30,
          ry: (sg.headYaw || 0) * 0.34 - (sg.torsoTwist || 0) * 0.16, rz: (sg.torsoRoll || 0) * 0.16 };
      case 'head':
        return { rx: (sg.headPitch || 0) - (sg.torsoPitch || 0) * 0.16, ry: (sg.headYaw || 0) * 0.62,
          rz: (sg.torsoRoll || 0) * 0.24 };
      case 'clavicle':
        return { rx: pick(sg, 'armSwing') * 0.16, ry: pick(sg, 'armBend') * 0.10, rz: pick(sg, 'armRaise') * 0.30 };
      case 'upperArm':
        // Ось X: положительный rx уводит руку НАЗАД (персонаж смотрит в +Z),
        // поэтому подъём руки вперёд — это отрицательный rx.
        return { rx: -pick(sg, 'armSwing'), ry: pick(sg, 'armBend') * 0.10, rz: -pick(sg, 'armRaise') * 0.55 };
      case 'lowerArm':
        // локоть сгибается только вперёд -> отрицательный rx
        return { rx: -pick(sg, 'armBend'), ry: 0, rz: -pick(sg, 'armRaise') * 0.10 };
      case 'hand':
        return { rx: -pick(sg, 'wrist'), ry: pick(sg, 'armBend') * 0.08, rz: -pick(sg, 'wrist') * 0.30 };
      case 'hipJoint':
        return { rx: (sg.legSwing || 0) * 0.22, ry: 0, rz: (sg.legSpread || 0) * 0.34 };
      case 'upperLeg':
        // +legSwing = бедро вперёд (rx отрицательный); thighBase — статичный присед
        return { rx: -((sg.legSwing || 0) + (sg.thighBase || 0)), ry: 0, rz: -(sg.legSpread || 0) * 0.5 };
      case 'lowerLeg':
        // колено сгибается назад (пятка к ягодицам) -> положительный rx
        return { rx: Math.max(0.02, (sg.legBend || 0) + (sg.kneeBase || 0)), ry: 0, rz: 0 };
      case 'foot':
        return { rx: -((sg.legSwing || 0) + (sg.thighBase || 0)) * 0.30
          + ((sg.legBend || 0) + (sg.kneeBase || 0)) * 0.34
          - (sg.kneeBase ? 0.30 : 0), ry: 0, rz: (sg.legSpread || 0) * 0.28 };
      case 'weapon':
        return { rx: (sg.weaponPitch || 0), ry: (sg.weaponPitch || 0) * 0.16, rz: (sg.weaponRoll || 0) };
      default:
        return {};
    }
  }

  // Детерминированный псевдослучайный генератор: одинаковый клип всегда одинаков
  function rng(seed) {
    let s = seed >>> 0 || 1;
    return function () {
      s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0;
      return s / 4294967296;
    };
  }
  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }

  /* ---------------------------------------------------------------------------
     6. ГЕНЕРАЦИЯ КРИВОЙ: (часть, клип, вариант) -> каналы с ключевыми кадрами
     Возвращает { rx: [[t,val],...], ... } — значения в радианах/метрах,
     уже с учётом габаритов кости (gain) и характера варианта.
     --------------------------------------------------------------------------- */
  const SAMPLES = 13; // ключевых кадров на канал

  function clipCurve(partId, clipId, variantIndex) {
    const part = PART_BY_ID[partId];
    const clip = CLIP_BY_ID[clipId];
    const V = VARIANTS[variantIndex | 0] || VARIANTS[0];
    if (!part || !clip) return null;
    const sig = SIGNALS[clipId];
    const seed = hash(partId + '|' + clipId + '|' + V.id);
    const rnd = rng(seed);
    // джиттер и фазовый лаг фиксируются для пары (часть, клип, вариант)
    const jit = [rnd() - 0.5, rnd() - 0.5, rnd() - 0.5];
    const lag = (PHASE_LAG[part.role] || 0) * (0.6 + V.speed * 0.4);
    const side = part.side || 0;
    CUR_SIDE = side;
    const asym = 1 + V.asym * side;
    const limp = V.limp * (side === 1 ? 0.28 : 0) + V.limp * (side === -1 ? -0.20 : 0);
    const out = {};
    const channels = part.role === 'root' ? ['rx', 'ry', 'rz', 'ty', 'tz'] : ['rx', 'ry', 'rz'];
    const loop = clip.loop;
    const n = SAMPLES;
    for (let ci = 0; ci < channels.length; ci++) {
      const ch = channels[ci];
      const frames = [];
      for (let i = 0; i < n; i++) {
        const t = i / (n - 1);
        // фаза: для цикла берём t, для одноразового клипа — тоже t (0..1)
        let p = t * V.speed + (loop ? 0 : 0);
        p = p - Math.floor(p);
        const pS = ((t - lag * 0.5) % 1 + 1) % 1;
        const base = applyArms(clipId, Object.assign({}, sig(loop ? pS : Math.min(1, t))), pS);
        let m = mapRole(part.role, base);
        let v = m[ch] || 0;
        // Асимметрия и хромая нога
        if (ch === 'rx' || ch === 'rz') v *= asym;
        if (limp && (ch === 'rx')) v += limp * (0.35 + 0.25 * Math.sin(TAU * pS));
        // Наклон варианта
        if (V.lean && ch === 'rx') v += V.lean * (part.role === 'root' ? 0.10 : 0.55);
        if (V.lean && ch === 'rz' && part.role !== 'root') v += V.lean * 0.18 * (side || 1);
        // Джиттер (детерминированный, плавный)
        v += V.jitter * jit[ci % 3] * Math.sin(TAU * (pS * 2 + jit[0]));
        // Холостой ход для "осмотрительного" варианта: слегка проверяет сектор
        if (V.id === 'care' && part.role === 'head' && ch === 'ry') v += 0.35 * Math.sin(TAU * pS * 0.5);
        v *= part.gain[ch] !== undefined ? part.gain[ch] : 1;
        frames.push([Number(t.toFixed(4)), Number(v.toFixed(5))]);
      }
      // гарантируем корректные границы
      frames[0][0] = 0;
      frames[n - 1][0] = 1;
      out[ch] = frames;
    }
    return out;
  }

  /* ---------------------------------------------------------------------------
     7. ОРУЖИЕ
     --------------------------------------------------------------------------- */
  const WEAPONS = [
    { id: 'pistol', name: 'ПМ-9 «Оса»', short: 'ОСА', damage: 26, headshot: 3.0, rpm: 260, auto: false,
      mag: 12, reserve: 120, spread: 0.011, adsSpread: 0.004, recoil: 0.030, reload: 1.55, range: 90,
      pellets: 1, sound: 'pistol', kick: 0.024, adsFov: 58, weight: 0.9, tracer: '#ffd27a' },
    { id: 'smg', name: 'КП-45 «Стриж»', short: 'СТРИЖ', damage: 18, headshot: 2.4, rpm: 780, auto: true,
      mag: 32, reserve: 224, spread: 0.024, adsSpread: 0.010, recoil: 0.020, reload: 1.85, range: 80,
      pellets: 1, sound: 'smg', kick: 0.016, adsFov: 55, weight: 1.0, tracer: '#ffe08f' },
    { id: 'rifle', name: 'АК-74 «Гроза»', short: 'ГРОЗА', damage: 31, headshot: 2.6, rpm: 620, auto: true,
      mag: 30, reserve: 210, spread: 0.019, adsSpread: 0.005, recoil: 0.028, reload: 2.10, range: 150,
      pellets: 1, sound: 'rifle', kick: 0.022, adsFov: 48, weight: 1.3, tracer: '#ffcf6b' },
    { id: 'shotgun', name: 'ТОЗ-12 «Молот»', short: 'МОЛОТ', damage: 14, headshot: 1.7, rpm: 78, auto: false,
      mag: 7, reserve: 42, spread: 0.075, adsSpread: 0.052, recoil: 0.070, reload: 2.55, range: 42,
      pellets: 8, sound: 'shotgun', kick: 0.055, adsFov: 62, weight: 1.5, tracer: '#ffb86b' },
    { id: 'dmr', name: 'СВД «Игла»', short: 'ИГЛА', damage: 74, headshot: 2.2, rpm: 210, auto: false,
      mag: 10, reserve: 60, spread: 0.010, adsSpread: 0.0015, recoil: 0.060, reload: 2.35, range: 260,
      pellets: 1, sound: 'dmr', kick: 0.048, adsFov: 34, weight: 1.7, tracer: '#fff2c4', scope: true }
  ];

  // точки хвата: правая рука — рукоять, левая — цевьё/магазин
  const GRIPS = {
    pistol:  { r: [0, -0.05, -0.01], l: [0.0, -0.05, 0.02], shoulder: 0.30 },
    smg:     { r: [0, -0.05, -0.02], l: [0.0, 0.01, 0.19], shoulder: 0.30 },
    rifle:   { r: [0, -0.06, -0.03], l: [0.0, 0.0, 0.24], shoulder: 0.32 },
    shotgun: { r: [0, -0.06, -0.02], l: [0.0, 0.0, 0.26], shoulder: 0.34 },
    dmr:     { r: [0, -0.06, -0.03], l: [0.0, 0.0, 0.26], shoulder: 0.34 }
  };

  const WEAPON_BY_ID = {};
  WEAPONS.forEach((w) => { WEAPON_BY_ID[w.id] = w; });

  /* ---------------------------------------------------------------------------
     8. БОЕВИКИ
     think — «больно думать»: время на размышление и качество решений.
     --------------------------------------------------------------------------- */
  const ENEMY_TYPES = [
    { id: 'grunt', name: 'Боец', short: 'БОЕЦ', hp: 100, armor: 0, speed: 2.5, sprint: 4.4,
      accuracy: 0.52, reaction: 0.55, thinkTime: 0.85, thinkQuality: 0.72, aggression: 0.55,
      preferRange: [10, 26], weapon: 'smg', score: 100, bodyColor: 0x6b7355, gearColor: 0x3a3f33,
      skin: 0xc9a184, scale: 1.0, tactics: ['cover', 'advance', 'suppress'] },
    { id: 'sniper', name: 'Стрелок', short: 'СТРЕЛОК', hp: 85, armor: 0, speed: 2.2, sprint: 4.0,
      accuracy: 0.86, reaction: 0.9, thinkTime: 1.35, thinkQuality: 0.9, aggression: 0.35,
      preferRange: [30, 70], weapon: 'dmr', score: 150, bodyColor: 0x555f52, gearColor: 0x2f3730,
      skin: 0xc09a7e, scale: 1.0, tactics: ['hold', 'flank', 'peek'] },
    { id: 'heavy', name: 'Тяжёлый', short: 'ТЯЖЁЛЫЙ', hp: 190, armor: 60, speed: 1.9, sprint: 3.2,
      accuracy: 0.44, reaction: 0.75, thinkTime: 1.2, thinkQuality: 0.55, aggression: 0.85,
      preferRange: [6, 18], weapon: 'shotgun', score: 180, bodyColor: 0x5b5348, gearColor: 0x2b2b2b,
      skin: 0xbf9a80, scale: 1.12, tactics: ['advance', 'suppress', 'melee'] },
    { id: 'scout', name: 'Разведчик', short: 'РАЗВЕДЧИК', hp: 70, armor: 10, speed: 3.1, sprint: 5.6,
      accuracy: 0.46, reaction: 0.4, thinkTime: 0.5, thinkQuality: 0.62, aggression: 0.7,
      preferRange: [7, 20], weapon: 'smg', score: 120, bodyColor: 0x77685a, gearColor: 0x3b3129,
      skin: 0xd0a789, scale: 0.94, tactics: ['flank', 'rush', 'grenade'] },
    { id: 'officer', name: 'Командир', short: 'КОМАНДИР', hp: 130, armor: 30, speed: 2.4, sprint: 4.2,
      accuracy: 0.68, reaction: 0.6, thinkTime: 0.7, thinkQuality: 0.95, aggression: 0.6,
      preferRange: [14, 34], weapon: 'rifle', score: 250, bodyColor: 0x4a5548, gearColor: 0x22281f,
      skin: 0xc8a186, scale: 1.04, tactics: ['order', 'flank', 'cover', 'suppress'] },
    { id: 'boss', name: '«Архитектор»', short: 'АРХИТЕКТОР', hp: 620, armor: 120, speed: 2.7, sprint: 4.8,
      accuracy: 0.72, reaction: 0.45, thinkTime: 0.55, thinkQuality: 1.0, aggression: 0.8,
      preferRange: [10, 30], weapon: 'rifle', score: 1000, bodyColor: 0x2f3a40, gearColor: 0x141a1d,
      skin: 0xb08b73, scale: 1.16, tactics: ['order', 'flank', 'suppress', 'grenade', 'peek'] }
  ];
  const ENEMY_BY_ID = {};
  ENEMY_TYPES.forEach((e) => { ENEMY_BY_ID[e.id] = e; });

  /* ---------------------------------------------------------------------------
     9. МИССИИ
     --------------------------------------------------------------------------- */
  const MISSIONS = [
    { id: 'm1', index: 1, name: 'Пепел на складах', map: 'depot', type: 'eliminate', count: 6,
      briefing: 'Боевики заняли складской терминал. Зачистите сектор и не дайте им уйти вглубь.',
      loadout: ['pistol', 'smg'], waves: 1, time: 0,
      enemies: ['grunt', 'grunt', 'scout', 'grunt', 'grunt', 'officer'],
      tip: 'Стреляйте в голову и используйте укрытия: ящики держат пули.' },
    { id: 'm2', index: 2, name: 'Тихий этаж', map: 'depot', type: 'eliminate', count: 8,
      briefing: 'Снайпер на верхнем уровне простреливает двор. Уберите его и зачистите терминал.',
      loadout: ['smg', 'rifle'], waves: 1, time: 0,
      enemies: ['sniper', 'grunt', 'grunt', 'scout', 'grunt', 'heavy', 'grunt', 'officer'],
      tip: 'Стрелок думает дольше остальных — используйте паузу между его выстрелами.' },
    { id: 'm3', index: 3, name: 'Караван', map: 'convoy', type: 'destroy', count: 3,
      briefing: 'Уничтожьте три ящика с взрывчаткой на конвое. Охрана будет мешать.',
      loadout: ['rifle', 'shotgun'], waves: 1, time: 0,
      enemies: ['grunt', 'scout', 'heavy', 'grunt', 'grunt', 'officer'],
      tip: 'Ящики подсвечены. Очередь в упор быстрее, чем перезарядка.' },
    { id: 'm4', index: 4, name: 'Держать коридор', map: 'convoy', type: 'survive', count: 0, waves: 3,
      briefing: 'Продержитесь 90 секунд, пока группа эвакуации поднимает борт. Враги идут волнами.',
      loadout: ['rifle', 'smg'], time: 90,
      enemies: ['grunt', 'grunt', 'scout', 'grunt'],
      tip: 'Тяжёлые идут последними. Берегите патроны до третьей волны.' },
    { id: 'm5', index: 5, name: 'Порт', map: 'harbor', type: 'extract', count: 0,
      briefing: 'Прорывайтесь к точке эвакуации на другой стороне порта. Отходить нужно быстро.',
      loadout: ['rifle', 'shotgun'], time: 0,
      enemies: ['grunt', 'sniper', 'scout', 'grunt', 'officer'],
      tip: 'Не останавливайтесь. На бегу стреляйте короткими очередями.' },
    { id: 'm6', index: 6, name: 'Архитектор', map: 'harbor', type: 'boss', count: 1,
      briefing: '«Архитектор» ждёт в диспетчерской вышке. Он думает быстрее всех. Докажите, что этого мало.',
      loadout: ['rifle', 'dmr'], time: 0,
      enemies: ['boss', 'grunt', 'grunt', 'scout', 'sniper', 'heavy'],
      tip: 'Командиры отдают приказы: убивайте их первыми, и толпа теряет строй.' }
  ];

  /* ---------------------------------------------------------------------------
     10. КАРТЫ (компактные, из AABB-геометрии; props инстансируются)
     --------------------------------------------------------------------------- */
  const MAPS = {
    depot: {
      size: 76, fog: 0x1a1410, sky: '#2a1f19', ground: 0x3a3128, accent: 0x4a3a28,
      sun: 0xffd0a0, ambient: 0x5a4a3a, sunPos: [-42, 58, 26], dust: 0.9,
      walls: [
        { x: -36, z: 0, w: 2, d: 74, h: 6 }, { x: 36, z: 0, w: 2, d: 74, h: 6 },
        { x: 0, z: -36, w: 74, d: 2, h: 6 }, { x: 0, z: 36, w: 74, d: 2, h: 6 },
        { x: -12, z: -10, w: 10, d: 2.4, h: 3.2 }, { x: 12, z: 8, w: 2.4, d: 14, h: 3.2 },
        { x: 4, z: -20, w: 16, d: 2.4, h: 2.6 }, { x: -22, z: 16, w: 2.4, d: 12, h: 3.6 },
        { x: 22, z: -18, w: 2.4, d: 12, h: 4.4 }
      ],
      towers: [{ x: 20, z: 20, w: 9, d: 9, h: 7 }],
      crates: [
        [-18, -14], [-14, -14], [-16, -17], [10, 14], [13, 14], [11, 17],
        [-6, 10], [-3, 10], [0, 22], [-28, 4], [-28, 7], [26, 2], [24, 6], [8, -6]
      ],
      barricades: [[-4, -2, 0], [6, 2, 0.4], [-20, -6, 0.2], [18, 10, -0.3], [-10, 24, 0.6]],
      spawns: [[-28, -26], [28, -26], [-28, 26], [28, 26], [0, -28], [0, 28], [26, -6], [-26, 10]],
      extracts: [{ x: -30, z: -30, r: 4 }],
      boxes: [{ x: -8, z: -26, r: 1 }, { x: 18, z: 26, r: 1 }, { x: 26, z: -26, r: 1 }]
    },
    convoy: {
      size: 84, fog: 0x181a14, sky: '#2b2a24', ground: 0x3b3a2e, accent: 0x4d4a36,
      sun: 0xffe0a8, ambient: 0x5c5a44, sunPos: [30, 62, -40], dust: 0.7,
      walls: [
        { x: 0, z: -41, w: 82, d: 2, h: 5 }, { x: 0, z: 41, w: 82, d: 2, h: 5 },
        { x: -41, z: 0, w: 2, d: 82, h: 5 }, { x: 41, z: 0, w: 2, d: 82, h: 5 },
        { x: -10, z: 0, w: 22, d: 3, h: 2.2 }, { x: 14, z: -14, w: 3, d: 20, h: 2.4 },
        { x: -20, z: -18, w: 14, d: 3, h: 3.0 }, { x: 16, z: 18, w: 3, d: 16, h: 3.0 }
      ],
      towers: [],
      crates: [
        [-30, -30], [-27, -30], [30, -28], [27, -28], [-30, 30], [-27, 30], [30, 30], [27, 30],
        [-4, 20], [0, 20], [14, 6], [14, 2], [-16, 14], [-14, 10]
      ],
      barricades: [[-2, -8, 0.1], [20, 4, 1.2], [-24, -4, -0.4], [6, 26, 0.8], [-30, 8, 0.3]],
      spawns: [[-34, -34], [34, 34], [-34, 34], [34, -34], [0, -34], [0, 34]],
      extracts: [{ x: 34, z: -34, r: 4.5 }],
      boxes: [{ x: -2, z: -28, r: 1 }, { x: 30, z: 6, r: 1 }, { x: -30, z: 24, r: 1 }]
    },
    harbor: {
      size: 90, fog: 0x101820, sky: '#1d2733', ground: 0x2f3540, accent: 0x3d4654,
      sun: 0xa8c8ff, ambient: 0x4a5a6c, sunPos: [-46, 52, 44], dust: 0.5,
      walls: [
        { x: 0, z: -44, w: 88, d: 2, h: 7 }, { x: 0, z: 44, w: 88, d: 2, h: 7 },
        { x: -44, z: 0, w: 2, d: 88, h: 7 }, { x: 44, z: 0, w: 2, d: 88, h: 7 },
        { x: -14, z: -18, w: 3, d: 26, h: 3.4 }, { x: 10, z: 6, w: 26, d: 3, h: 3.2 },
        { x: 24, z: -12, w: 3, d: 18, h: 2.8 }, { x: -26, z: 20, w: 18, d: 3, h: 4.0 }
      ],
      towers: [{ x: -30, z: -30, w: 10, d: 10, h: 9 }, { x: 32, z: 30, w: 8, d: 8, h: 6 }],
      crates: [
        [-38, -8], [-34, -8], [-36, -12], [36, 8], [32, 8], [34, 12], [0, 30], [4, 30],
        [-8, 26], [-8, 22], [20, -30], [24, -30], [18, 26], [22, 26]
      ],
      barricades: [[-20, -2, 0.5], [8, -6, -0.2], [30, -4, 0.9], [-6, 16, 0.15], [20, 16, -0.5]],
      spawns: [[-36, 36], [36, -36], [-36, -36], [36, 36], [0, -38], [0, 38], [38, 0], [-38, 0]],
      extracts: [{ x: -38, z: 38, r: 5 }],
      boxes: []
    }
  };

  /* ---------------------------------------------------------------------------
     11. ФРАЗЫ «больно думающих» боевиков и радиопереговоры
     --------------------------------------------------------------------------- */
  const THOUGHTS = [
    'Кто это там?', 'Слышал шорох…', 'Считаю углы…', 'Он у ящиков?',
    'Надо обойти слева', 'Не стреляй в спину, думай', 'Позиция плохая',
    'Сейчас перезаряжусь', 'Тяжело думать под огнём', 'Он сменил укрытие',
    'Держите сектор!', 'Тихо. Слушаю.', 'Прикройте, я обхожу', 'Огонь по нему!'
  ];
  const COMMANDS = ['Обходи слева!', 'Прикрой меня!', 'Держим угол!', 'Он наверху!', 'Отходим!'];

  /* ---------------------------------------------------------------------------
     12. Сводка библиотеки
     --------------------------------------------------------------------------- */
  const TOTALS = {
    parts: PARTS.length,
    clips: CLIPS.length,
    variants: VARIANTS.length,
    perPart: CLIPS.length * VARIANTS.length,
    total: PARTS.length * CLIPS.length * VARIANTS.length
  };

  SH2.data = {
    TAU, PARTS, PART_BY_ID, CLIPS, CLIP_BY_ID, VARIANTS, CHANNELS,
    SIGNALS, ARM_POSE, mapRole, clipCurve, SAMPLES, hash, rng,
    WEAPONS, WEAPON_BY_ID, GRIPS, ENEMY_TYPES, ENEMY_BY_ID, MISSIONS, MAPS, THOUGHTS, COMMANDS, TOTALS
  };
})(typeof window !== 'undefined' ? window : globalThis);
