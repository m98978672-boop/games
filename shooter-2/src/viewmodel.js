/* =============================================================================
   СЕКТОР «ПЕПЕЛ» — оружие от первого лица (viewmodel) и руки
   -----------------------------------------------------------------------------
   Собственная модель «от глаз»: руки, предплечья, оружие, прицеливание,
   отдача, перезарядка, покачивание при шаге. Рендерится в том же проходе,
   но с отдельным слоем, чтобы не проваливаться в стены.
   ============================================================================= */
(function (root) {
  'use strict';
  const SH2 = (root.SH2 = root.SH2 || {});
  const THREE = () => root.THREE;

  class ViewModel {
    constructor(camera) {
      const T = THREE();
      this.camera = camera;
      this.root = new T.Group();
      this.root.name = 'viewmodel';
      camera.add(this.root);
      this.rig = new T.Group();
      this.root.add(this.rig);
      this.skin = 0xd8b394;
      // Цвета рук: тёмно-синий рукав и оливковая перчатка. Совсем чёрные
      // (0x1c2026) на лампе уровня сливались в одно пятно — кистей не видно.
      this.sleeve = 0x36435e;
      this.sleeveDark = 0x2a3348;
      this.glove = 0x3a4034;
      this.gloveDark = 0x2b3027;
      this.knuckle = 0x474d3e;
      this.cuff = 0x2f3529;
      this.weaponHolder = new T.Group();
      this.rig.add(this.weaponHolder);
      this.models = {};
      this.currentWeapon = null;
      this.recoil = 0;
      this.recoilRot = 0;
      // отдача по двум осям + пружина ствола (второй, более медленный слой)
      this.kickY = 0;
      this.kickPitch = 0;
      this.kickYaw = 0;
      this.springY = 0;
      this.springPitch = 0;
      this.velY = 0;
      this.velPitch = 0;
      this.sway = { x: 0, y: 0 };
      this.swayVel = { x: 0, y: 0 };
      this.bob = 0;
      this.bobPhase = 0;
      this.stepPhase = 0;
      this.mouseVel = { x: 0, y: 0 };
      this.sprintT = 0;
      this.reloadT = 0;
      this.reloadDur = 0;
      this.ads = 0;
      this.adsTarget = 0;
      this.kick = 0;
      this.lowered = 0;
      this.muzzleWorld = new T.Vector3();
      this.buildLights();
      this.buildHands();
      // Отдельный слой рендера: оружие не проваливается в стены и не режется
      // их ближней плоскостью. Камера рисует слой 1 вторым проходом.
      // Ставим слой ПОСЛЕ сборки рук — иначе кисти, созданные позже, остаются
      // на слое мира и рисуются в первом проходе (за стеной, с обрезкой).
      this.root.traverse((c) => { if (c.isMesh) c.layers.set(1); });
    }

    /* Свет для оружия от первого лица.
       Второй проход рисуется с camera.layers = 1, а солнце, небо и заливка
       уровня лежат на слое 0 — рендерер отбрасывает источники по слоям
       камеры, поэтому оружие получало НОЛЬ света и выглядело чёрным силуэтом.
       Держим свой набор ламп прямо в камере и включаем у них слой 1: в проходе
       мира они не участвуют (камера там на слое 0), а оружию дают объём —
       тёплый ключевой свет сверху-слева, холодную подсветку справа и мягкую
       заливку, чтобы ствол не был «плоским чёрным пятном». */
    buildLights() {
      const T = THREE();
      const g = new T.Group();
      g.name = 'vm-lights';
      // камера смотрит в −Z: свет спереди-сверху-слева, подсветка справа.
      // target лежит в той же группе — иначе у направленных ламп матрица цели
      // остаётся единичной и свет «светит в никуда» (оружие снова чёрное).
      const key = new T.DirectionalLight(0xfff0d8, 1.5);
      key.position.set(-0.7, 0.9, 0.5);
      key.target.position.set(0.1, -0.1, -1);
      const rim = new T.DirectionalLight(0x9fc3ff, 0.7);
      rim.position.set(1.0, 0.3, -0.4);
      rim.target.position.set(0, 0, -1);
      const fill = new T.HemisphereLight(0xdfe8ff, 0x2e2a24, 0.9);
      const amb = new T.AmbientLight(0xffffff, 0.35);
      g.add(key, key.target, rim, rim.target, fill, amb);
      // слой 1 и у света, и у камеры в этом проходе — рендерер пропустит их
      g.traverse((c) => { if (c.isLight) c.layers.set(1); });
      this.lights = g;
      this.camera.add(g);
    }

    /* --------------------------------- руки ---------------------------------
       Кисть из отдельных частей, а не одной «варежки»: ладонь-лофт с подушечкой,
       четыре пальца по две-три фаланги (трубы по 3D-пути, поэтому палец реально
       обхватывает цевьё), отставленный большой палец, суставные утолщения,
       манжета перчатки и рукав из трёх секций. Всё — контуры и тела вращения,
       без коробок.
       Локальная система руки: +Y — от кисти к локтю, +Z — вдоль ствола. */
    buildHands() {
      const T = THREE();
      const M = SH2.model.mat;
      const O = SH2.outline;
      this.matGlove = M(this.glove);
      this.matGloveDark = M(this.gloveDark);
      this.matKnuckle = M(this.knuckle);
      this.matSleeve = M(this.sleeve);
      this.matSleeveDark = M(this.sleeveDark);
      this.matCuff = M(this.cuff);
      // складки на ладони — на полтона темнее перчатки
      this.matCrease = M(0x2a2e24);

      // сегмент пальца: труба по дуге с суставными утолщениями
      const fingerSegment = (len, r0, r1) => {
        const g = new T.Group();
        const pts = [
          { p: [0, 0, 0], r: r0 },
          { p: [0, len * 0.28, 0], r: (r0 + r1) * 0.54 },
          { p: [0, len * 0.62, 0], r: r1 * 1.04 },
          { p: [0, len, 0], r: r1 }
        ];
        g.add(new T.Mesh(O.tubePath(pts, { segments: 7 }), this.matGlove));
        return g;
      };

      /* Один палец: три фаланги, вложенные друг в друга — каждая следующая
         повёрнута сильнее, поэтому палец дугой обхватывает цевьё. За основу
         берём +Y (наружу от ладони), а в кисти поворачиваем палец поперёк
         ствола: пальцы загибаются в плоскости XY, вокруг оси ствола Z. */
      const makeFinger = (len, thick, curl) => {
        const g = new T.Group();
        g.add(fingerSegment(len * 0.46, thick, thick * 0.93));
        const mid = new T.Group();
        mid.position.set(0, len * 0.46, 0);
        mid.rotation.z = -curl;
        mid.add(fingerSegment(len * 0.34, thick * 0.93, thick * 0.85));
        g.add(mid);
        const tip = new T.Group();
        tip.position.set(0, len * 0.34, 0);
        tip.rotation.z = -curl * 0.85;
        tip.add(fingerSegment(len * 0.26, thick * 0.85, thick * 0.68));
        mid.add(tip);
        return g;
      };

      /* Кисть. Система руки: +Y — от кисти к локтю (вниз-назад), +Z — вдоль
         ствола. Кисть обхватывает цилиндр, ось которого идёт по Z: ладонь
         лежит снизу (−Y) и тянется вдоль ствола, пальцы растут вверх и
         загибаются вокруг оси Z, большой палец идёт с другой стороны.

         Анатомия важнее «красивости»: у пальцев разная длина (средний самый
         длинный), у каждого три фаланги с суставными утолщениями, на ладони
         есть подушечки (тенора и гипотенора), складки и костяшки. Именно
         это отличает руку от «варежки» в кадре. */
      const makeHand = () => {
        const g = new T.Group();

        /* Ладонь: не плоская пластина, а объём — контур с фаской плюс
           подушечка снизу, поэтому у кисти есть толщина и изгиб. */
        const palmProfile = [
          [-0.042, -0.086], [0.030, -0.090], [0.044, -0.074],
          [0.048, -0.046], [0.042, -0.024], [0.020, -0.016],
          [-0.030, -0.018], [-0.048, -0.040], [-0.050, -0.066]
        ];
        const palm = new T.Mesh(O.outlineMesh(palmProfile, {
          depth: 0.036, bevel: 0.010, bevelSegments: 3, taper: [[0, 0.86], [0.5, 1.0], [1, 0.88]]
        }), this.matGlove);
        g.add(palm);
        // подушечка ладони (то, чем реально держат рукоять) — тело вращения
        const pad = new T.Mesh(O.revolve(
          [[-0.030, 0.004], [-0.020, 0.012], [-0.004, 0.015], [0.012, 0.013], [0.022, 0.006], [0.024, 0.0]],
          { segments: 12 }
        ), this.matGlove);
        pad.rotation.z = Math.PI / 2;
        pad.rotation.y = 0.06;
        pad.position.set(-0.004, -0.052, 0.016);
        pad.scale.set(1.6, 1.0, 1.0);
        g.add(pad);

        // тенора (у большого пальца) и гипотенора (у мизинца)
        const thenar = new T.Mesh(O.revolve(
          [[-0.026, 0.010], [-0.012, 0.017], [0.008, 0.018], [0.024, 0.012], [0.030, 0.0]],
          { segments: 12 }
        ), this.matGlove);
        thenar.rotation.z = Math.PI / 2;
        thenar.rotation.y = 0.22;
        thenar.position.set(-0.014, -0.042, 0.030);
        g.add(thenar);
        const hypo = new T.Mesh(O.revolve(
          [[-0.022, 0.006], [-0.008, 0.012], [0.008, 0.011], [0.020, 0.0]],
          { segments: 10 }
        ), this.matGloveDark);
        hypo.rotation.z = Math.PI / 2;
        hypo.position.set(-0.012, -0.048, -0.030);
        g.add(hypo);

        /* Пальцы: указательный/средний/безымянный/мизинец. Разная длина и
           разный сгиб — как на настоящей руке, обхватывающей цевьё. */
        const fingerSpec = [
          { z: 0.030, len: 0.052, thick: 0.0100, curl: 0.52 },
          { z: 0.011, len: 0.058, thick: 0.0102, curl: 0.60 },
          { z: -0.008, len: 0.055, thick: 0.0096, curl: 0.62 },
          { z: -0.027, len: 0.044, thick: 0.0084, curl: 0.56 }
        ];
        fingerSpec.forEach((f, i) => {
          const finger = makeFinger(f.len, f.thick, f.curl);
          finger.position.set(-0.004, -0.034, f.z);
          finger.rotation.x = -0.16 - i * 0.035;
          finger.rotation.z = 0.12 + i * 0.02;
          g.add(finger);
        });

        // большой палец: две фаланги, лежит вдоль ствола с другой стороны
        const thumb = makeFinger(0.050, 0.0124, 0.32);
        thumb.position.set(-0.010, -0.040, 0.040);
        thumb.rotation.z = 0.46;
        thumb.rotation.x = -0.88;
        thumb.rotation.y = 0.16;
        g.add(thumb);
        const thumbTip = new T.Mesh(O.revolve(
          [[-0.008, 0.0060], [0.000, 0.0080], [0.008, 0.0068], [0.012, 0.0]], { segments: 8 }
        ), this.matGlove);
        thumbTip.rotation.z = Math.PI / 2;
        thumbTip.rotation.x = -0.88;
        thumbTip.position.set(-0.004, -0.030, 0.062);
        g.add(thumbTip);

        // костяшки: четыре, по одной над каждым пальцем
        for (let i = 0; i < 4; i++) {
          const k = new T.Mesh(O.revolve(
            [[-0.005, 0.0052], [-0.001, 0.0072], [0.003, 0.0070], [0.006, 0.0]], { segments: 8 }
          ), this.matKnuckle);
          k.rotation.x = Math.PI / 2;
          k.position.set(-0.006, -0.030, 0.032 - i * 0.0185);
          g.add(k);
        }
        // складки на ладони — три тонкие полосы другого тона
        for (let i = 0; i < 3; i++) {
          const crease = new T.Mesh(O.outlineMesh(
            [[-0.030, 0], [-0.020, 0.0035], [0.020, 0.0035], [0.030, 0]],
            { depth: 0.0018, bevel: 0 }
          ), this.matCrease);
          crease.position.set(0.0, -0.030 + i * 0.0004, -0.020 + i * 0.024);
          crease.rotation.x = Math.PI / 2;
          g.add(crease);
        }
        // запястье: узкий «переходник» между кистью и манжетой
        const wrist = new T.Mesh(O.loftSections([
          { at: [0, -0.030, 0], pts: O.circleSection(0.030, 0.026, 12) },
          { at: [0, -0.016, 0], pts: O.circleSection(0.033, 0.028, 12) },
          { at: [0, -0.004, 0], pts: O.circleSection(0.030, 0.025, 12) }
        ]), this.matGloveDark);
        g.add(wrist);
        return g;
      };

      /* Предплечье: три секции лофтом (запястье → предплечье → локоть наружу),
         манжета перчатки с ремешком и валиком, и кисть. */
      const makeArm = (len, r0, r1) => {
        const g = new T.Group();
        const pipe = O.loftSections([
          { at: [0, 0.05, 0], pts: O.circleSection(r0, r0 * 0.92, 12) },
          { at: [0, 0.05 + len * 0.22, 0], pts: O.circleSection(r0 * 1.06, r0 * 0.94, 12) },
          { at: [0, 0.05 + len * 0.55, 0], pts: O.circleSection((r0 + r1) * 0.52, (r0 + r1) * 0.48, 12) },
          { at: [0, 0.05 + len * 0.82, 0], pts: O.circleSection(r1 * 1.12, r1 * 1.02, 12) },
          { at: [0, 0.05 + len, 0], pts: O.circleSection(r1 * 1.22, r1 * 1.08, 12) }
        ]);
        g.add(new T.Mesh(pipe, this.matSleeve));
        // складка ткани у локтя
        const fold = new T.Mesh(O.revolve(
          [[0, r1 * 1.10], [0.012, r1 * 1.25], [0.030, r1 * 1.18], [0.040, r1 * 0.98]],
          { segments: 12 }
        ), this.matSleeveDark);
        fold.position.y = 0.05 + len * 0.78;
        g.add(fold);
        // манжета перчатки: валик + ремешок
        const cuff = new T.Mesh(O.revolve(
          [[0, r0 * 0.98], [0.010, r0 * 1.16], [0.028, r0 * 1.20], [0.046, r0 * 1.10], [0.055, r0 * 0.95]],
          { segments: 14 }
        ), this.matCuff);
        cuff.position.y = 0.062;
        g.add(cuff);
        const strap = new T.Mesh(O.tubePath([
          { p: [r0 * 1.02, 0.078, 0.006], r: 0.0045, ry: 0.0022 },
          { p: [0, 0.082, r0 * 1.05], r: 0.0042, ry: 0.0021 },
          { p: [-r0 * 1.02, 0.078, 0.004], r: 0.0040, ry: 0.0020 }
        ], { segments: 6 }), this.matGloveDark);
        g.add(strap);
        const hand = makeHand();
        // кисть садится чуть ниже точки хвата: точка хвата — центр рукояти,
        // а ладонь обхватывает её снизу, иначе пальцы уходят в ствольную коробку
        hand.position.y = -0.012;
        g.add(hand);
        return g;
      };

      this.armR = makeArm(0.19, 0.040, 0.032);
      this.weaponHolder.add(this.armR);
      this.armL = makeArm(0.21, 0.042, 0.032);
      this.weaponHolder.add(this.armL);
    }

    setWeapon(id) {
      if (this.currentWeapon === id) {
        // тот же ствол: пересчитываем позу — экран мог повернуться/сжаться
        // (resize, поворот телефона), а поза зависит от aspect
        this.applyPose(this.ads);
        return;
      }
      const T = THREE();
      this.currentWeapon = id;
      let model = this.models[id];
      if (!model) {
        model = SH2.model.buildWeaponModel(id, { smooth: true });
        // чертежи уже в метрах: от первого лица чуть крупнее, стволом от камеры
        model.scale.setScalar(1.0);
        model.rotation.set(0, Math.PI, 0);
        this.models[id] = model;
      }
      // снять предыдущую
      if (this.mounted) this.weaponHolder.remove(this.mounted);
      this.mounted = model;
      this.weaponHolder.add(model);
      // У только что поставленного ствола меши ещё на слое 0: без этого он
      // попадёт в проход мира и «прилипнет» к стене вместо слоя оружия.
      model.traverse((c) => { if (c.isMesh) c.layers.set(1); });
      this.muzzleLocal = model.userData.muzzle;
      // Длина ствола в метрах: по ней подбираем, насколько далеко и насколько
      // крупно держать оружие в кадре. Короткий пистолет нельзя ставить так же
      // далеко, как винтовку — он превращается в точку, а винтовку нельзя
      // придвигать вплотную — приклад вылезает за кадр.
      const box = new T.Box3().setFromObject(model);
      this.length = Math.max(0.16, box.max.z - box.min.z);
      // Масштаб самой модели ствола. Пистолет по чертежу всего 19 см — рядом с
      // кистями он читается как игрушка: руки занимают весь кадр, а ствол
      // теряется. От первого лица стволы принято показывать крупнее, поэтому
      // короткие модели домножаем, а длинные (винтовка, дробовик, DMR) держим
      // 1:1 — иначе приклад уезжает за край.
      const MODEL_SCALE = { pistol: 1.45, smg: 1.25, rifle: 1.0, shotgun: 1.0, dmr: 1.0,
        revolver: 1.45, machinepistol: 1.40, pdw: 1.18, carbine: 1.05, lmg: 0.98,
        tacshotgun: 1.02, bullpup: 1.0, sniper: 0.97, launcher: 1.0, railgun: 0.98 };
      model.scale.setScalar(MODEL_SCALE[id] || 1.0);
      // Поза «от бедра» под конкретный ствол. Длины мало: у пистолета и ПП
      // приклад почти вплотную к глазу, и любая общая формула выдаёт кашу из
      // кистей. Здесь как в CS — короткий ствол ниже и правее, длинный
      // отодвинут и слегка развёрнут, приклад в кадре целиком.
      // offL / offR — сдвиг кисти в системе оружия (метры). У пистолета точки
      // хвата всего в 6 см друг от друга, и без разведения рук обе кисти
      // закрывают сам ствол — в кадре остаются только перчатки.
      const POSE = {
        pistol:  { x: 0.16, y: -0.18, z: -0.40, rx: 0.03, ry: 0.22, rz: 0.10, s: 1.20,
                   handScale: 0.85, offL: [-0.055, -0.055, 0.03], offR: [0.03, 0.0, 0.0] },
        smg:     { x: 0.13, y: -0.150, z: -0.44, rx: 0.04, ry: 0.12, rz: 0.08, s: 0.98, handScale: 0.92 },
        rifle:   { x: 0.12, y: -0.150, z: -0.50, rx: 0.04, ry: 0.12, rz: 0.07, s: 0.90 },
        shotgun: { x: 0.12, y: -0.150, z: -0.52, rx: 0.04, ry: 0.12, rz: 0.07, s: 0.88 },
        dmr:     { x: 0.12, y: -0.145, z: -0.54, rx: 0.04, ry: 0.12, rz: 0.06, s: 0.86 },
        /* вторая волна: короткие стволы ближе и крупнее, длинные — дальше */
        /* Револьвер держим дальше и развёрнутее пистолета: у него длинный
           барабан, и в лоб он читается серой плитой — в профиль видны и
           барабан с каморами, и рамка, и курок, и шомпол под стволом. */
        revolver: { x: 0.155, y: -0.195, z: -0.50, rx: 0.035, ry: 0.34, rz: 0.10, s: 1.02,
                    handScale: 0.88, offL: [-0.05, -0.05, 0.02], offR: [0.03, 0.0, 0.0] },
        machinepistol: { x: 0.15, y: -0.165, z: -0.39, rx: 0.03, ry: 0.18, rz: 0.09, s: 1.06, handScale: 0.90 },
        pdw:     { x: 0.13, y: -0.152, z: -0.45, rx: 0.04, ry: 0.13, rz: 0.08, s: 0.96 },
        carbine: { x: 0.12, y: -0.150, z: -0.49, rx: 0.04, ry: 0.12, rz: 0.07, s: 0.91 },
        lmg:     { x: 0.13, y: -0.155, z: -0.53, rx: 0.04, ry: 0.13, rz: 0.06, s: 0.87 },
        tacshotgun: { x: 0.12, y: -0.150, z: -0.51, rx: 0.04, ry: 0.12, rz: 0.07, s: 0.89 },
        bullpup: { x: 0.12, y: -0.150, z: -0.51, rx: 0.04, ry: 0.12, rz: 0.07, s: 0.89 },
        sniper:  { x: 0.12, y: -0.145, z: -0.56, rx: 0.04, ry: 0.12, rz: 0.05, s: 0.85 },
        launcher: { x: 0.14, y: -0.155, z: -0.50, rx: 0.04, ry: 0.14, rz: 0.06, s: 0.88 },
        railgun: { x: 0.12, y: -0.148, z: -0.54, rx: 0.04, ry: 0.12, rz: 0.06, s: 0.86 }
      };
      this.pose = POSE[id] || POSE.rifle;
      // Кисти ставятся в _attachHands() — точно по gripPoint/forePoint модели.
      // Риг сразу ставим в рабочую позу: иначе до первого update оружие висит
      // в начале координат камеры — в 11 см от глаза, и первый кадр (а также
      // пауза и любая отрисовка без update) показывает «изнутри ствола»:
      // приклад и цевьё закрывают весь экран коричневым.
      this.applyPose(0);
    }

    /* Ставит риг в позу от бедра для текущего ads (0 — от бедра, 1 — прицел).
       Вызывается из setWeapon сразу, чтобы оружие никогда не оказывалось
       в глазу, и из update каждый кадр. */
    applyPose(ads) {
      const a = ads === undefined ? this.ads : ads;
      const pose = this.pose || { x: 0.12, y: -0.15, z: -0.5, rx: 0.04, ry: 0.12, rz: 0.07, s: 0.9 };
      const adsX = 0.13, adsY = -0.19, adsZ = -0.52;
      let sc = pose.s * (1 - a) + (0.86 + 0.16 * a) * a;
      if (a > 0.01 && this.camera && this.camera.fov) {
        const tanBase = Math.tan((78 * Math.PI) / 360);
        const tanNow = Math.tan((this.camera.fov * Math.PI) / 360);
        sc *= 1 - (1 - tanNow / tanBase) * a;
      }
      this.rig.position.set(
        pose.x * (1 - a) + adsX * a,
        pose.y * (1 - a) + adsY * a,
        pose.z * (1 - a) + adsZ * a
      );
      this.rig.rotation.set(
        pose.rx * (1 - a) + 0.16 * a,
        pose.ry * (1 - a) + 0.10 * a,
        pose.rz * (1 - a)
      );
      // Компенсация по соотношению сторон. FOV у нас задаётся по вертикали,
      // поэтому при узком кадре (портрет, телефон) горизонтальный угол обзора
      // резко падает: то же оружие раздувается по ширине и его коричневое
      // цевьё/приклад лезут в центр экрана. Считаем, во сколько раз кадр уже
      // эталонного 16:9, и поджимаем оружие по корню из этого отношения:
      // целиком гасить нельзя — ствол станет игрушечным.
      let wide = 1;
      if (this.camera && this.camera.aspect && this.camera.aspect < 1.6) {
        const AR_BASE = 16 / 9;
        const ratio = Math.max(0.18, Math.min(1, this.camera.aspect / AR_BASE));
        wide = Math.sqrt(ratio);           // 1 при 16:9 и шире, ~0.55 при 9:16
        // на прицеле поджатие нужно вдвое слабее: там важна мушка по центру,
        // а не «сколько ствола влезло в кадр»
        const w = 1 - (1 - Math.max(0.5, wide)) * (1 - 0.5 * a);
        sc *= w;
        // и отводим ствол к правому нижнему углу, освобождая центр кадра;
        // по горизонтали тянем к центру — при узком кадре правый край близко
        // и приклад/кисть уезжали бы за границу экрана
        const pull = (1 - ratio) * (1 - 0.8 * a);   // 0 при 16:9, ~0.7 при 9:16
        this.rig.position.x *= 1 - 0.45 * pull;
        this.rig.position.y -= 0.05 * pull;
        this.rig.position.z -= 0.06 * pull;
      }
      this.rig.scale.setScalar(sc);
      this._attachHands();
    }

    playReload(dur) { this.reloadT = 0; this.reloadDur = dur || 1.6; }

    /* Отдача. Ствол получает толчок назад-вверх с небольшим случайным уводом
       в сторону (пистолет уводит сильнее, тяжёлый пулемёт — ровнее), и дальше
       его возвращает к нулю пружина с демпфированием. Пружина даёт «дребезг»
       после выстрела — именно из-за него отдача чувствуется, а не выглядит
       как один кадр сдвига. */
    addRecoil(amount, opts) {
      const o = opts || {};
      const swayScale = o.heavy ? 0.55 : 1;
      const jitter = o.jitter === undefined ? 1 : o.jitter;
      this.recoil = Math.min(0.20, this.recoil + amount * 0.55);
      this.recoilRot = Math.min(0.55, this.recoilRot + amount * 3.4);
      // импульс пружины: вверх-назад + случайный боковой увод
      this.velY -= amount * 2.6 * swayScale;
      this.velPitch += amount * 9.5 * swayScale;
      this.velPitch += (Math.random() - 0.5) * amount * 3.2 * jitter;
      this.velY += (Math.random() - 0.5) * amount * 1.1 * jitter;
      // инерция мыши: ствол «отстаёт» от поворота
      this.sway.x += (Math.random() - 0.5) * amount * 1.6 * jitter;
      this.sway.y += amount * 1.1 * jitter;
    }

    /* Инерция от движения мыши: ствол уходит против поворота и потом
       догоняет. Вызывается из game.js при изменении yaw/pitch. */
    addLook(dYaw, dPitch) {
      this.mouseVel.x += dYaw * 0.55;
      this.mouseVel.y += dPitch * 0.55;
      const lim = 3.0;
      this.mouseVel.x = Math.max(-lim, Math.min(lim, this.mouseVel.x));
      this.mouseVel.y = Math.max(-lim, Math.min(lim, this.mouseVel.y));
    }

    update(dt, params) {
      const p = params || {};
      const moving = p.moving || 0;
      const sprint = p.sprint ? 1 : 0;
      this.adsTarget = p.ads ? 1 : 0;
      // Прицел входит быстро, но не мгновенно: сначала «подхват» (ease-out),
      // затем доводка. Выход из прицела чуть медленнее входа — так делают
      // почти во всех шутерах, и глаз это читает как вес оружия.
      {
        const rate = this.adsTarget > this.ads ? 17 : 12;
        const d = this.adsTarget - this.ads;
        this.ads += d * Math.min(1, dt * rate);
        if (Math.abs(d) < 0.0015) this.ads = this.adsTarget;
      }
      const targetLower = p.sprint && moving > 0.5 ? 1 : 0;
      this.lowered += (targetLower - this.lowered) * Math.min(1, dt * 8);

      // отдача: затухание «толчка» + пружина возврата
      this.recoil *= Math.exp(-dt * 12);
      this.recoilRot *= Math.exp(-dt * 10);
      {
        // пружина: k — жёсткость, c — демпфирование. Недодемпфирована
        // намеренно: ствол проскакивает ноль и мелко дрожит, как настоящий.
        const k = 150, c = 17;
        this.velY += (-k * this.springY - c * this.velY) * dt;
        this.velPitch += (-k * this.springPitch - c * this.velPitch) * dt;
        this.springY += this.velY * dt;
        this.springPitch += this.velPitch * dt;
        this.springY = Math.max(-0.12, Math.min(0.12, this.springY));
        this.springPitch = Math.max(-0.5, Math.min(0.5, this.springPitch));
      }
      // инерция мыши: ствол отстаёт от поворота, потом догоняет (пружина)
      {
        const k = 62, c = 12;
        this.swayVel.x += (-this.mouseVel.x - this.sway.x) * k * dt;
        this.swayVel.y += (-this.mouseVel.y - this.sway.y) * k * dt;
        this.swayVel.x *= Math.exp(-dt * c);
        this.swayVel.y *= Math.exp(-dt * c);
        this.sway.x += this.swayVel.x * dt;
        this.sway.y += this.swayVel.y * dt;
        this.mouseVel.x *= Math.exp(-dt * 11);
        this.mouseVel.y *= Math.exp(-dt * 11);
      }
      // покачивание при ходьбе: восьмёрка + горизонтальная «протяжка»,
      // амплитуда падает при прицеливании и при остановке
      this.bob += dt * (6 + moving * 5.5);
      const bobAmt = moving * (1 - this.ads * 0.82) * (1 - this.lowered * 0.3);
      const bobX = Math.sin(this.bob) * 0.0085 * bobAmt;
      const bobY = (Math.abs(Math.cos(this.bob)) - 0.55) * 0.012 * bobAmt;
      const bobRoll = Math.sin(this.bob) * 0.010 * bobAmt;
      const bobYaw = Math.cos(this.bob * 0.5) * 0.012 * bobAmt;

      // Позиция оружия в кадре. Первое лицо: ствол уходит стволом вперёд-вправо,
      // при прицеливании мушка встаёт точно в центр экрана.
      // от бедра — ствол справа-снизу и сходится к центру кадра;
      // при прицеливании — мушка точно по центру, оружие ближе к глазу
      // «как в CS»: от бедра оружие крупно в правом нижнем углу, ствол
      // сходится к центру кадра; на прицеле — мушка/дульный срез по центру.
      // базовая поза (от бедра ↔ прицел), масштаб, FOV- и aspect-компенсация —
      // в одном месте (applyPose), чтобы не дублировать расчёт; здесь поверх
      // неё только покачивание/инерция/отдача/спринт.
      this.applyPose(this.ads);
      let px = this.rig.position.x + bobX + this.sway.x * 0.10;
      let py = this.rig.position.y + bobY + this.sway.y * 0.07 - 0.13 * this.lowered
             + this.springY * 0.30;
      let pz = this.rig.position.z - this.recoil * 0.16 - this.springY * 0.55;
      let rx = this.rig.rotation.x - this.recoilRot * 0.20 + 0.55 * this.lowered
             - this.sway.y * 0.5 + this.springPitch * 0.22;
      let ry = this.rig.rotation.y - this.sway.x * 0.9 + bobYaw - this.sway.x * 0.25;
      let rz = this.rig.rotation.z + bobRoll + this.sway.x * 0.45;
      let sc = this.rig.scale.x;

      // Перезарядка: не просто «уехал вниз и покрутился», а три осмысленные
      // фазы — ствол наклоняется и уходит вниз-в сторону (достаём магазин),
      // короткая пауза-толчок (магазин вставлен), возврат с доводкой. Фазы
      // сшиты гладкими «окнами», поэтому стыков не видно.
      if (this.reloadT < this.reloadDur) {
        this.reloadT += dt;
        const t = Math.min(1, this.reloadT / this.reloadDur);
        const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        const dip = Math.sin(Math.min(1, t / 0.72) * Math.PI * 0.5); // 0→1 к 72%
        const seat = t > 0.52 && t < 0.86
          ? Math.sin((t - 0.52) / 0.34 * Math.PI) : 0;             // толчок магазина
        py -= dip * 0.150 - seat * 0.022;
        pz += dip * 0.05;
        rx -= dip * 0.46 + seat * 0.10;
        rz += dip * 0.30 + Math.sin(t * Math.PI * 2) * 0.10;
        ry += dip * 0.14;
        px += dip * 0.026;
        // ствол чуть «подпрыгивает», когда магазин встаёт на место
        py += seat * 0.012;
        // левая рука «ходит» к магазину — в _attachHands(), здесь только ствол
        void ease;
      }

      this.rig.position.set(px, py, pz);
      this.rig.rotation.set(rx, ry, rz);
      this.rig.scale.setScalar(sc);
      this._attachHands();
      // ADS: доводим ствол так, чтобы дульный срез был точно в центре кадра.
      // У каждого ствола своя длина, поэтому смещение считаем по проекции.
      if (this.ads > 0.01 && this.muzzleLocal && this.camera) {
        const T2 = THREE();
        const mw = this._mw || (this._mw = new T2.Vector3());
        const mv = this._mv || (this._mv = new T2.Vector3());
        const tanHalf = Math.tan(((this.camera.fov || 78) * Math.PI) / 360);
        const aspect = this.camera.aspect || 1.777;
        for (let k = 0; k < 2; k++) {
          this.root.updateMatrixWorld(true);
          if (this.camera.updateMatrixWorld) this.camera.updateMatrixWorld();
          this.muzzleLocal.getWorldPosition(mv);
          mv.applyMatrix4(this.camera.matrixWorldInverse);
          const depth = Math.max(0.05, -mv.z);
          mw.copy(mv).applyMatrix4(this.camera.projectionMatrix);
          this.rig.position.x += -mw.x * depth * tanHalf * aspect * this.ads;
          this.rig.position.y += -mw.y * depth * tanHalf * this.ads;
        }
      }
      // новый кадр — оружие на слой 1 (см. constructor), включая только что
      // поставленный ствол: Three не наследует layers у детей автоматически
      this.root.traverse((c) => { if (c.isMesh && c.layers.mask !== 2) c.layers.set(1); });
      // цель при ADS — ближе к глазу
      this.root.visible = p.hidden ? false : true;

      if (this.muzzleLocal) this.muzzleLocal.getWorldPosition(this.muzzleWorld);
      return this;
    }

    /* ------------------------- руки и оружие ---------------------------- */
    /* Кисти ставятся точно в точки хвата модели ствола (grip/foregrip из
       чертежа). Ориентация строится по базису: +Z — вдоль ствола, +Y — от
       кисти к локтю. Пальцы при этом ложатся поперёк цевья, как в жизни. */
    _attachHands() {
      const T = THREE();
      const gun = this.mounted;
      if (!gun || !this.armR || !this.armL) return;
      const inv = this._inv || (this._inv = new T.Matrix4());
      const v = this._v3 || (this._v3 = new T.Vector3());
      const ax = this._ax || (this._ax = new T.Vector3());
      const ay = this._ay || (this._ay = new T.Vector3());
      const az = this._az || (this._az = new T.Vector3());
      const m = this._m3 || (this._m3 = new T.Matrix4());
      const q = this._q || (this._q = new T.Quaternion());
      this.root.updateMatrixWorld(true);
      inv.copy(this.weaponHolder.matrixWorld).invert();
      // в системе оружия ствол смотрит в −Z (модель развёрнута на π)
      az.set(0, 0, -1);

      const place = (arm, point, side) => {
        if (!point) return;
        v.setFromMatrixPosition(point.matrixWorld).applyMatrix4(inv);
        arm.position.copy(v);
        // локоть уводим вниз-назад и в свою сторону, чтобы рука не закрывала
        // ствол и не превращалась в «трубу в глаз»
        ay.set(side * 0.62, -0.70, 0.30).normalize();
        // ортонормируем базис (Y ⟂ Z)
        ay.addScaledVector(az, -ay.dot(az)).normalize();
        ax.copy(ay).cross(az).normalize();
        m.makeBasis(ax, ay, az);
        q.setFromRotationMatrix(m);
        arm.quaternion.copy(q);
        // при прицеливании кисть чуть поджимается к центру
        arm.position.addScaledVector(ax, -0.008);
      };
      place(this.armR, gun.userData.gripPoint, 1.0);
      place(this.armL, gun.userData.forePoint, -1.0);
      const pose = this.pose || {};
      if (pose.offR) this.armR.position.add(this._v3.set(pose.offR[0], pose.offR[1], pose.offR[2]));
      if (pose.offL) this.armL.position.add(this._v3.set(pose.offL[0], pose.offL[1], pose.offL[2]));
      // Кисти у короткого ствола ближе к глазу и потому кажутся огромными:
      // поджимаем их под ствол, иначе перчатки закрывают пистолет целиком.
      const hs = pose.handScale || 1;
      this.armR.scale.setScalar(hs);
      this.armL.scale.setScalar(hs);
      // Перезарядка: левая рука уходит с цевья к магазину и возвращается.
      // Движение по дуге (а не просто вниз) — локоть ведёт, кисть догоняет.
      if (this.reloadT < this.reloadDur) {
        const t = Math.min(1, this.reloadT / this.reloadDur);
        const go = Math.sin(Math.min(1, t / 0.56) * Math.PI * 0.5);   // уход к магазину
        const back = t > 0.62 ? Math.sin((t - 0.62) / 0.38 * Math.PI * 0.5) : 0;
        const reach = Math.max(0, go - back);
        this.armL.position.y -= reach * 0.115;
        this.armL.position.z += reach * 0.075;
        this.armL.position.x += reach * 0.020;
        this.armL.rotateX(reach * 0.55);
        this.armL.rotateZ(reach * 0.35);
        // правая кисть чуть поджимает рукоять, пока левая работает
        this.armR.rotateX(reach * 0.10);
      }
    }

    muzzle() { return this.muzzleWorld; }
  }

  SH2.viewmodel = { ViewModel };
})(typeof window !== 'undefined' ? window : globalThis);
