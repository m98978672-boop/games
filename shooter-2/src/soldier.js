/* =============================================================================
   СЕКТОР «ПЕПЕЛ» — тело солдата по контурам и сечениям
   -----------------------------------------------------------------------------
   Никаких коробок: торс — лофт по сечениям (суперэллипсы разной ширины),
   голова — тело вращения по обведённому профилю, конечности — лофт вдоль
   кости, ботинки — выдавливание бокового силуэта, бронежилет и подсумки —
   отдельные контуры с фаской.

   Модуль не создаёт кости: он получает функцию add(кость, геометрия, цвет,
   смещение, поворот) и раскладывает по ней детали. Поэтому анимации и IK
   работают ровно так же, как раньше.
   ============================================================================= */
(function (root) {
  'use strict';
  const SH2 = (root.SH2 = root.SH2 || {});
  const THREE = () => root.THREE;

  const SEG = 14; // точек в сечении

  // сечение торса: сглаженный прямоугольник со смещением центра
  function torsoSection(width, depth, y, cx, cy, extra) {
    const pts = [];
    const n = SEG;
    const p = extra && extra.power ? extra.power : 0.55;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const ca = Math.cos(a), sa = Math.sin(a);
      const x = Math.sign(ca) * Math.pow(Math.abs(ca), p) * (width / 2);
      const yy = Math.sign(sa) * Math.pow(Math.abs(sa), p) * (depth / 2);
      pts.push([x, y + yy]);
    }
    return pts;
  }

  function loft(sections) {
    return SH2.outline.loftSections(sections);
  }

  /* ------------------------------- части тела ----------------------------- */
  function buildBody(add, bones, C, opts) {
    const T = THREE();
    const O = SH2.outline;
    const low = !!(opts && opts.low);

    /* 1. Голова: череп + лицо + челюсть + шея (тела вращения по профилю) */
    const skull = O.revolve([
      [-0.070, 0.030], [-0.058, 0.062], [-0.030, 0.080], [0.006, 0.082],
      [0.044, 0.076], [0.070, 0.058], [0.082, 0.030], [0.086, 0.006]
    ], { segments: 16, scale: [1.0, 1.0, 1.12] });
    skull.translate(0, 0.040, 0.006);
    add('head', skull, C.skin);

    // лицо/маска (смещена вперёд)
    // очки/визор (только глаза, не всё лицо)
    const mask = O.outlineMesh([
      [0.082, 0.052], [0.100, 0.046], [0.102, 0.030], [0.082, 0.026], [0.080, 0.040]
    ], { depth: 0.105, bevel: 0.006, bevelSegments: 2 });
    add('head', mask, 0x1b2126);
    // дыхательная маска
    const breather = O.revolve([[0, 0.030], [0.012, 0.036], [0.034, 0.032], [0.042, 0.016], [0.044, 0.0]], { segments: 10 });
    breather.rotateX(Math.PI / 2);
    breather.translate(0, 0.014, 0.080);
    add('head', breather, 0x22262a);

    // прицельная планка / ПНВ
    const nvg = O.outlineMesh([[-0.02, 0.056], [0.018, 0.050], [0.020, 0.030], [-0.02, 0.034]],
      { depth: 0.05, bevel: 0.006 });
    nvg.translate(0, 0.108, 0.055);
    add('head', nvg, 0x1b1f22);

    // каска: купол тела вращения + поля отдельным контуром
    const dome = O.revolve([
      [0.0, 0.132], [0.016, 0.130], [0.038, 0.120], [0.058, 0.100],
      [0.072, 0.072], [0.082, 0.034], [0.088, 0.006]
    ], { segments: 18, scale: [1.02, 1.0, 1.10] });
    dome.translate(0, 0.074, 0.004);
    add('head', dome, C.gear);
    // передний козырёк (не круглый «блин»)
    const brim = O.outlineMesh([[-0.012, 0.010], [0.060, 0.004], [0.088, -0.010], [0.090, -0.020], [-0.012, -0.014]],
      { depth: 0.150, bevel: 0.006 });
    brim.translate(0, 0.086, 0.062);
    add('head', brim, C.gear);
    // наушники
    [-1, 1].forEach((s) => {
      const ear = O.revolve([[0, 0.020], [0.012, 0.030], [0.030, 0.028], [0.036, 0.0]], { segments: 10 });
      ear.rotateZ(Math.PI / 2);
      ear.translate(s * 0.088, 0.040, 0.004);
      add('head', ear, 0x1b1f22);
    });

    /* 2. Шея */
    const neck = O.revolve([[0, 0.050], [0.055, 0.048], [0.10, 0.052], [0.12, 0.058]], { segments: 12 });
    neck.translate(0, 0.0, 0);
    add('neck', neck, C.skin);

    /* 3. Торс: лофт по сечениям (талия -> грудь -> плечи) */
    const torso = loft([
      { at: [0, -0.10, 0.005], pts: torsoSection(0.27, 0.17, 0, 0, 0, { power: 0.5 }) },
      { at: [0, -0.04, 0.005], pts: torsoSection(0.29, 0.185, 0, 0, 0) },
      { at: [0, 0.04, 0.005], pts: torsoSection(0.315, 0.205, 0, 0, 0) },
      { at: [0, 0.10, 0.004], pts: torsoSection(0.345, 0.225, 0, 0, 0) },
      { at: [0, 0.155, 0.0], pts: torsoSection(0.375, 0.235, 0, 0, 0) },
      { at: [0, 0.195, -0.005], pts: torsoSection(0.34, 0.21, 0, 0, 0) },
      { at: [0, 0.215, -0.01], pts: torsoSection(0.24, 0.17, 0, 0, 0) }
    ]);
    add('chest', torso, C.body);

    // бронежилет: отдельный лофт чуть шире корпуса
    const vest = loft([
      { at: [0, -0.045, 0.01], pts: torsoSection(0.30, 0.20, 0, 0, 0) },
      { at: [0, 0.02, 0.012], pts: torsoSection(0.325, 0.225, 0, 0, 0) },
      { at: [0, 0.09, 0.012], pts: torsoSection(0.35, 0.245, 0, 0, 0) },
      { at: [0, 0.145, 0.008], pts: torsoSection(0.335, 0.235, 0, 0, 0) }
    ]);
    add('chest', vest, C.gear);
    // нагрудная планка акцента
    const plate = O.outlineMesh([[-0.088, 0.088], [0.088, 0.088], [0.088, 0.048], [-0.088, 0.048]],
      { depth: 0.055, bevel: 0.008 });
    plate.translate(0, 0.048, 0.118);
    add('chest', plate, C.accent);
    // нашивка
    const patch = O.outlineMesh([[-0.045, 0.012], [0.035, 0.012], [0.035, -0.012], [-0.045, -0.012]],
      { depth: 0.012, bevel: 0.002 });
    patch.translate(-0.06, 0.075, 0.132);
    add('chest', patch, 0xd8dde2);
    // подсумки
    [-1, 1].forEach((s) => {
      const pouch = O.outlineMesh([[-0.032, 0.038], [0.032, 0.038], [0.034, -0.030], [-0.034, -0.030]],
        { depth: 0.045, bevel: 0.008 });
      pouch.translate(s * 0.085, -0.005, 0.125);
      add('chest', pouch, 0x35393c);
    });
    // воротник
    const collar = O.revolve([[0, 0.118], [0.022, 0.120], [0.026, 0.100], [0.004, 0.098]], { segments: 14 });
    collar.translate(0, 0.16, 0.0);
    add('chest', collar, C.gear);

    /* 4. Поясница */
    const waist = loft([
      { at: [0, -0.06, 0], pts: torsoSection(0.265, 0.18, 0, 0, 0) },
      { at: [0, 0.0, 0], pts: torsoSection(0.28, 0.19, 0, 0, 0) },
      { at: [0, 0.05, 0], pts: torsoSection(0.285, 0.195, 0, 0, 0) }
    ]);
    add('spine', waist, C.body);

    /* 5. Таз + ремень + набедренные подсумки */
    const pelvis = loft([
      { at: [0, -0.075, 0], pts: torsoSection(0.30, 0.20, 0, 0, 0) },
      { at: [0, -0.02, 0], pts: torsoSection(0.325, 0.215, 0, 0, 0) },
      { at: [0, 0.045, 0], pts: torsoSection(0.315, 0.205, 0, 0, 0) }
    ]);
    add('pelvis', pelvis, C.gear);
    const belt = O.revolve([[0, 0.175], [0.028, 0.176], [0.030, 0.150], [0.0, 0.149]], { segments: 20, scale: [1.0, 1.0, 0.62] });
    belt.translate(0, 0.032, 0);
    add('pelvis', belt, 0x1b1f22);
    const buckle = O.outlineMesh([[-0.026, 0.020], [0.026, 0.020], [0.026, -0.020], [-0.026, -0.020]],
      { depth: 0.014, bevel: 0.003 });
    buckle.translate(0, 0.032, 0.108);
    add('pelvis', buckle, 0xb9a05a);
    [-1, 1].forEach((s) => {
      const hip = O.outlineMesh([[-0.042, 0.050], [0.042, 0.050], [0.046, -0.055], [-0.046, -0.055]],
        { depth: 0.070, bevel: 0.010 });
      hip.translate(s * 0.135, -0.075, 0.045);
      add('pelvis', hip, 0x2a2e31);
      const strap = O.outlineMesh([[-0.012, 0.06], [0.012, 0.06], [0.012, -0.06], [-0.012, -0.06]],
        { depth: 0.035, bevel: 0.002 });
      strap.translate(s * 0.135, -0.02, 0.075);
      add('pelvis', strap, 0x1b1f22);
    });

    /* 6. Руки: плечо (тело вращения), плечо/предплечье (лофт), кисть */
    [['L', 1], ['R', -1]].forEach(([s, sign]) => {
      const cap = O.revolve([[0, 0.070], [0.020, 0.078], [0.050, 0.072], [0.070, 0.050], [0.078, 0.0]], { segments: 12 });
      cap.scale(1, 1, 0.95);
      cap.translate(0, -0.005, 0);
      add('shoulder' + s, cap, C.body);

      const upper = loft([
        { at: [0, -0.055, 0], pts: circle(0.058) },
        { at: [0, -0.13, 0], pts: circle(0.056) },
        { at: [0, -0.22, 0], pts: circle(0.050) },
        { at: [0, -0.28, 0], pts: circle(0.047) }
      ]);
      add('upperArm' + s, upper, C.body);
      // рукав
      const sleeve = loft([
        { at: [0, -0.020, 0], pts: circle(0.062) },
        { at: [0, -0.085, 0], pts: circle(0.060) },
        { at: [0, -0.090, 0], pts: circle(0.055) }
      ]);
      add('upperArm' + s, sleeve, C.gear);

      const fore = loft([
        { at: [0, -0.010, 0], pts: circle(0.050) },
        { at: [0, -0.09, 0], pts: circle(0.046) },
        { at: [0, -0.19, 0], pts: circle(0.040) },
        { at: [0, -0.25, 0], pts: circle(0.038) }
      ]);
      add('lowerArm' + s, fore, C.body);
      if (!low) {
        const guard = loft([
          { at: [0, -0.075, 0.012], pts: circle(0.050) },
          { at: [0, -0.145, 0.012], pts: circle(0.046) },
          { at: [0, -0.155, 0.012], pts: circle(0.040) }
        ]);
        add('lowerArm' + s, guard, C.gear);
      }
      // кисть-кулак: лофт + палец
      const hand = loft([
        { at: [0, -0.010, 0], pts: circle(0.040) },
        { at: [0, -0.045, 0.004], pts: circle(0.044) },
        { at: [0, -0.085, 0.006], pts: circle(0.040) },
        { at: [0, -0.100, 0.004], pts: circle(0.030) }
      ]);
      add('hand' + s, hand, 0x1e2226);
      const thumb = O.revolve([[0, 0.016], [0.012, 0.020], [0.030, 0.016], [0.034, 0.0]], { segments: 8 });
      thumb.rotateZ(Math.PI / 2.1);
      thumb.translate(sign * 0.030, -0.045, 0.020);
      add('hand' + s, thumb, 0x1e2226);
    });

    /* 7. Ноги: бедро, колено, голень, ботинок по боковому контуру */
    [['L', 1], ['R', -1]].forEach(([s, sign]) => {
      const hip = O.revolve([[0, 0.076], [0.020, 0.080], [0.050, 0.074], [0.070, 0.050]], { segments: 12 });
      hip.translate(0, 0.005, 0);
      add('hip' + s, hip, C.gear);

      const thigh = loft([
        { at: [0, -0.02, 0], pts: circle(0.088) },
        { at: [0, -0.13, 0.004], pts: circle(0.082) },
        { at: [0, -0.26, 0.006], pts: circle(0.072) },
        { at: [0, -0.36, 0.004], pts: circle(0.064) },
        { at: [0, -0.41, 0], pts: circle(0.060) }
      ]);
      add('upperLeg' + s, thigh, C.body);
      if (!low) {
        const thighPocket = O.outlineMesh([[-0.030, 0.048], [0.030, 0.048], [0.032, -0.048], [-0.032, -0.048]],
          { depth: 0.055, bevel: 0.008 });
        thighPocket.translate(0, -0.16, 0.065);
        add('upperLeg' + s, thighPocket, C.gear);
      }

      const knee = O.revolve([[0, 0.070], [0.018, 0.076], [0.040, 0.070], [0.052, 0.040]], { segments: 12 });
      knee.translate(0, 0.0, 0.008);
      add('lowerLeg' + s, knee, C.gear);
      const shin = loft([
        { at: [0, 0.0, 0.004], pts: circle(0.070) },
        { at: [0, -0.10, 0.004], pts: circle(0.064) },
        { at: [0, -0.22, 0.002], pts: circle(0.052) },
        { at: [0, -0.33, 0], pts: circle(0.046) },
        { at: [0, -0.38, 0], pts: circle(0.042) }
      ]);
      add('lowerLeg' + s, shin, C.body);
      if (!low) {
        const pad = O.outlineMesh([[-0.045, 0.045], [0.045, 0.045], [0.040, -0.040], [-0.040, -0.040]],
          { depth: 0.045, bevel: 0.010 });
        pad.translate(0, -0.075, 0.062);
        add('lowerLeg' + s, pad, C.gear);
      }

      // ботинок: боковой силуэт, выдавленный на ширину стопы
      const boot = O.outlineMesh([
        [-0.075, 0.150], [0.030, 0.158], [0.058, 0.120], [0.150, 0.062],
        [0.190, 0.040], [0.196, 0.014], [0.150, 0.006], [-0.072, 0.006]
      ], { depth: 0.110, bevel: 0.012, bevelSegments: 3 });
      boot.translate(0, 0.006, 0.015);
      add('foot' + s, boot, 0x191d20);
      const sole = O.outlineMesh([
        [-0.078, 0.014], [0.198, 0.014], [0.200, 0.0], [-0.080, 0.0]
      ], { depth: 0.118, bevel: 0.004 });
      sole.translate(0, 0.002, 0.015);
      add('foot' + s, sole, 0x0f1214);
      const ankle = O.revolve([[0, 0.058], [0.022, 0.062], [0.048, 0.054], [0.064, 0.032]], { segments: 10 });
      ankle.translate(0, 0.120, 0);
      add('foot' + s, ankle, C.gear);
    });

    /* 7.5 Снаряжение и мелкая фурнитура — то, из-за чего силуэт перестаёт
       быть «манекеном»: стропы, ремни, пряжки, нашивки, подсумки, крепление
       ПНВ, ремешки на коленях, шнуровка ботинок, рация на плече. */
    [['L', 1], ['R', -1]].forEach(([s, sign]) => {
      // плечевой ремень разгрузки — идёт от лямки к поясу
      const sling = O.tubePath([
        { p: [sign * 0.085, 0.10, 0.10], r: 0.016, ry: 0.006 },
        { p: [sign * 0.045, 0.02, 0.125], r: 0.016, ry: 0.006 },
        { p: [-sign * 0.02, -0.06, 0.115], r: 0.015, ry: 0.006 }
      ], { segments: 6 });
      add('chest', sling, 0x2a2e31);
      // накладка на плечо
      const pad2 = O.outlineMesh([[-0.05, 0.045], [0.05, 0.045], [0.045, -0.045], [-0.045, -0.045]],
        { depth: 0.07, bevel: 0.012 });
      pad2.translate(sign * 0.155, 0.045, 0.005);
      add('upperArm' + s, pad2, C.gear);
      // ремешок на предплечье (затяжка перчатки/наруча)
      const wristStrap = O.revolve([[0, 0.028], [0.012, 0.032], [0.030, 0.030], [0.034, 0.0]], { segments: 10 });
      wristStrap.rotateZ(Math.PI / 2);
      wristStrap.translate(0, -0.20, 0);
      add('lowerArm' + s, wristStrap, 0x1b1f22);
      // ремешок на колене и на голени
      [0.02, -0.16].forEach((yy, k) => {
        const strap2 = O.revolve([[0, 0.062 - k * 0.012], [0.010, 0.066 - k * 0.012],
          [0.026, 0.064 - k * 0.012], [0.030, 0.0]], { segments: 12 });
        strap2.translate(0, yy, 0.004);
        add('lowerLeg' + s, strap2, 0x24282b);
      });
      // шнуровка ботинка: три поперечные перемычки
      for (let k = 0; k < 3; k++) {
        const lace = O.outlineMesh([[-0.034, 0.006], [0.034, 0.006], [0.034, -0.006], [-0.034, -0.006]],
          { depth: 0.006, bevel: 0.001 });
        lace.translate(0, 0.075 + k * 0.020, 0.075 + k * 0.008);
        add('foot' + s, lace, 0x2f3336);
      }
    });
    // рация на левом плече: корпус + антенна
    {
      const radio = O.outlineMesh([[-0.028, 0.040], [0.028, 0.040], [0.030, -0.040], [-0.030, -0.040]],
        { depth: 0.030, bevel: 0.006 });
      radio.translate(0.135, 0.115, -0.020);
      add('chest', radio, 0x1e2225);
      const ant = O.revolve([[0, 0.006], [0.004, 0.006], [0.005, 0.0]], { segments: 6 });
      ant.translate(0.135, 0.155, -0.020);
      add('chest', ant, 0x101314);
    }
    // нож в набедренном чехле
    {
      const sheath = O.outlineMesh([[-0.016, 0.075], [0.016, 0.075], [0.020, -0.060], [-0.018, -0.060]],
        { depth: 0.026, bevel: 0.005 });
      sheath.translate(-0.145, -0.075, 0.055);
      add('pelvis', sheath, 0x22262a);
      const grip = O.revolve([[0, 0.010], [0.008, 0.012], [0.026, 0.010], [0.030, 0.0]], { segments: 8 });
      grip.translate(-0.145, -0.020, 0.055);
      add('pelvis', grip, 0x14181b);
    }
    // шейный платок (виден под каской)
    {
      const scarf = O.revolve([[0, 0.088], [0.020, 0.092], [0.050, 0.088], [0.058, 0.070], [0.055, 0.0]],
        { segments: 14 });
      scarf.translate(0, 0.132, 0.006);
      // не акцентный цвет: яркое пятно у лица читается как маска, а не шарф
      add('neck', scarf, C.gear);
    }
    // крепление ПНВ на каске: кронштейн + винт
    {
      const mount = O.outlineMesh([[-0.020, 0.018], [0.020, 0.018], [0.016, -0.016], [-0.016, -0.016]],
        { depth: 0.026, bevel: 0.004 });
      mount.translate(0, 0.186, 0.070);
      add('head', mount, 0x1b1f22);
      const bolt = O.revolve([[0, 0.006], [0.004, 0.007], [0.006, 0.0]], { segments: 6 });
      bolt.rotateX(Math.PI / 2);
      bolt.translate(0, 0.186, 0.088);
      add('head', bolt, 0x8a9096);
      // ремешок каски под подбородком
      const chin = O.tubePath([
        { p: [0.086, 0.070, 0.012], r: 0.007, ry: 0.003 },
        { p: [0.070, 0.010, 0.048], r: 0.007, ry: 0.003 },
        { p: [0, -0.010, 0.060], r: 0.007, ry: 0.003 },
        { p: [-0.070, 0.010, 0.048], r: 0.007, ry: 0.003 },
        { p: [-0.086, 0.070, 0.012], r: 0.007, ry: 0.003 }
      ], { segments: 5 });
      add('head', chin, 0x1b1f22);
    }

    /* 8. Рюкзак и фляга — тоже контуры */
    const pack = O.outlineMesh([
      [-0.115, 0.135], [0.115, 0.130], [0.125, 0.060], [0.115, -0.090],
      [-0.115, -0.090], [-0.125, 0.060]
    ], { depth: 0.155, bevel: 0.028, bevelSegments: 3 });
    pack.translate(0, 0.045, -0.145);
    add('chest', pack, C.gear);
    // клапан рюкзака и две стяжки
    const flap = O.outlineMesh([[-0.105, 0.030], [0.105, 0.030], [0.108, -0.030], [-0.108, -0.030]],
      { depth: 0.05, bevel: 0.010 });
    flap.translate(0, 0.135, -0.150);
    add('chest', flap, C.accent);
    [-0.06, 0.06].forEach((xx) => {
      const buckle2 = O.outlineMesh([[-0.016, 0.026], [0.016, 0.026], [0.016, -0.026], [-0.016, -0.026]],
        { depth: 0.016, bevel: 0.003 });
      buckle2.translate(xx, 0.115, -0.182);
      add('chest', buckle2, 0x1b1f22);
    });
    // скатка стянута поверх рюкзака и почти не выходит за силуэт
    const roll = O.revolve([[0, 0.032], [0.006, 0.036], [0.150, 0.036], [0.158, 0.030], [0.160, 0.0]],
      { segments: 10 });
    roll.rotateZ(Math.PI / 2);
    roll.translate(-0.080, 0.150, -0.225);
    add('chest', roll, 0x4b5340);
    [-0.080, 0.080].forEach((xx) => {
      const end = O.revolve([[0, 0.032], [0.005, 0.035], [0.010, 0.030], [0.012, 0.0]], { segments: 8 });
      end.rotateZ(Math.PI / 2);
      end.translate(xx, 0.150, -0.225);
      add('chest', end, 0x3a4132);
    });
    const flask = O.revolve([[0, 0.030], [0.014, 0.036], [0.060, 0.036], [0.072, 0.028], [0.076, 0.0]], { segments: 10 });
    flask.translate(0.14, -0.03, -0.12);
    add('pelvis', flask, 0x3f4a3a);
  }

  function circle(r) {
    const pts = [];
    const n = 12;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      pts.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
    return pts;
  }

  SH2.soldier = { buildBody, torsoSection, circle };
})(typeof window !== 'undefined' ? window : globalThis);
