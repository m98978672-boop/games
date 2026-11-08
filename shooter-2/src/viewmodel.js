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
      this.glove = 0x3a4034;
      this.weaponHolder = new T.Group();
      this.rig.add(this.weaponHolder);
      this.models = {};
      this.currentWeapon = null;
      this.recoil = 0;
      this.recoilRot = 0;
      this.sway = { x: 0, y: 0 };
      this.bob = 0;
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

    buildHands() {
      const T = THREE();
      const M = SH2.model.mat;
      const O = SH2.outline;

      /* Кисть: ладонь + четыре пальца, обхватывающих трубу, + большой палец.
         Локальная система руки: +Y — от кисти к локтю, +Z — вдоль ствола.
         Тогда пальцы лежат поперёк (по X) и «держат» цевьё или рукоять. */
      const makeHand = () => {
        const g = new T.Group();
        // ладонь — короткий лофт, чуть сплюснутый по X
        const palm = O.loftSections([
          { at: [0, -0.055, 0.0], pts: O.circleSection(0.036, 0.030, 10) },
          { at: [0, -0.015, 0.004], pts: O.circleSection(0.042, 0.036, 10) },
          { at: [0, 0.02, 0.004], pts: O.circleSection(0.044, 0.038, 10) },
          { at: [0, 0.06, 0.0], pts: O.circleSection(0.038, 0.032, 10) }
        ]);
        const palmMesh = new T.Mesh(palm, M(this.glove));
        // Кисть в кадре от первого лица кажется крупнее, чем в жизни: она
        // ближе к глазу. Уменьшаем ладонь и пальцы, иначе перчатка закрывает
        // ствол целиком — особенно у пистолета и ПП.
        palmMesh.scale.set(0.82, 0.86, 0.76);
        g.add(palmMesh);
        // четыре пальца: трубки поперёк, обхватывают цевьё
        const finger = O.revolve([[0, 0.0105], [0.004, 0.0115], [0.040, 0.011], [0.050, 0.009], [0.054, 0.0]], { segments: 8 });
        finger.rotateZ(Math.PI / 2);
        for (let i = 0; i < 4; i++) {
          const f = new T.Mesh(finger, M(this.glove));
          f.scale.setScalar(0.86);
          f.position.set(-0.018, -0.034 + i * 0.016, 0.018);
          f.rotation.y = -0.10 - i * 0.02;
          f.rotation.z = 0.06;
          g.add(f);
        }
        // большой палец — сверху, вдоль ствола
        const thumb = O.revolve([[0, 0.013], [0.004, 0.014], [0.042, 0.013], [0.048, 0.0]], { segments: 8 });
        thumb.rotateX(Math.PI / 2);
        const th = new T.Mesh(thumb, M(this.glove));
        th.position.set(0.020, 0.016, 0.010);
        th.rotation.z = -0.35;
        g.add(th);
        return g;
      };

      /* Предплечье: от кисти назад к камере, обрезано кадром. */
      const makeArm = (len, r0, r1) => {
        const g = new T.Group();
        const pipe = O.loftSections([
          { at: [0, 0.05, 0], pts: O.circleSection(r0, r0 * 0.9, 10) },
          { at: [0, 0.05 + len * 0.5, 0], pts: O.circleSection((r0 + r1) / 2, (r0 + r1) / 2 * 0.9, 10) },
          { at: [0, 0.05 + len, 0], pts: O.circleSection(r1, r1 * 0.9, 10) }
        ]);
        g.add(new T.Mesh(pipe, M(this.sleeve)));
        const cuff = new T.Mesh(O.revolve([[0, 0.040], [0.02, 0.046], [0.055, 0.042], [0.06, 0]], { segments: 10 }), M(this.sleeve));
        cuff.position.y = 0.10;
        g.add(cuff);
        g.add(makeHand());
        return g;
      };

      this.armR = makeArm(0.19, 0.040, 0.034);
      this.weaponHolder.add(this.armR);
      this.armL = makeArm(0.21, 0.042, 0.034);
      this.weaponHolder.add(this.armL);
    }

    setWeapon(id) {
      if (this.currentWeapon === id) return;
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
      const MODEL_SCALE = { pistol: 1.9, smg: 1.25, rifle: 1.0, shotgun: 1.0, dmr: 1.0 };
      model.scale.setScalar(MODEL_SCALE[id] || 1.0);
      // Поза «от бедра» под конкретный ствол. Длины мало: у пистолета и ПП
      // приклад почти вплотную к глазу, и любая общая формула выдаёт кашу из
      // кистей. Здесь как в CS — короткий ствол ниже и правее, длинный
      // отодвинут и слегка развёрнут, приклад в кадре целиком.
      // offL / offR — сдвиг кисти в системе оружия (метры). У пистолета точки
      // хвата всего в 6 см друг от друга, и без разведения рук обе кисти
      // закрывают сам ствол — в кадре остаются только перчатки.
      const POSE = {
        pistol:  { x: 0.15, y: -0.21, z: -0.54, rx: 0.03, ry: 0.40, rz: 0.10, s: 0.85,
                   handScale: 0.62, offL: [-0.09, -0.09, 0.05], offR: [0.03, 0.0, 0.0] },
        smg:     { x: 0.13, y: -0.150, z: -0.44, rx: 0.04, ry: 0.12, rz: 0.08, s: 0.98, handScale: 0.92 },
        rifle:   { x: 0.12, y: -0.150, z: -0.50, rx: 0.04, ry: 0.12, rz: 0.07, s: 0.90 },
        shotgun: { x: 0.12, y: -0.150, z: -0.52, rx: 0.04, ry: 0.12, rz: 0.07, s: 0.88 },
        dmr:     { x: 0.12, y: -0.145, z: -0.54, rx: 0.04, ry: 0.12, rz: 0.06, s: 0.86 }
      };
      this.pose = POSE[id] || POSE.rifle;
      // кисти ставятся в _attachHands() — точно по gripPoint/forePoint модели
    }

    playReload(dur) { this.reloadT = 0; this.reloadDur = dur || 1.6; }

    addRecoil(amount) {
      this.recoil = Math.min(0.16, this.recoil + amount * 0.55);
      this.recoilRot = Math.min(0.5, this.recoilRot + amount * 3.4);
      this.sway.x += (Math.random() - 0.5) * amount * 1.6;
      this.sway.y += amount * 1.1;
    }

    update(dt, params) {
      const p = params || {};
      const moving = p.moving || 0;
      const sprint = p.sprint ? 1 : 0;
      this.adsTarget = p.ads ? 1 : 0;
      this.ads += (this.adsTarget - this.ads) * Math.min(1, dt * 14);
      const targetLower = p.sprint && moving > 0.5 ? 1 : 0;
      this.lowered += (targetLower - this.lowered) * Math.min(1, dt * 8);

      // отдача
      this.recoil *= Math.exp(-dt * 12);
      this.recoilRot *= Math.exp(-dt * 10);
      // покачивание при ходьбе
      this.bob += dt * (6 + moving * 5.5);
      const bobX = Math.sin(this.bob) * 0.008 * moving * (1 - this.ads * 0.75);
      const bobY = Math.abs(Math.cos(this.bob)) * 0.010 * moving * (1 - this.ads * 0.8);
      // инерция мыши
      this.sway.x += (0 - this.sway.x) * Math.min(1, dt * 9);
      this.sway.y += (0 - this.sway.y) * Math.min(1, dt * 9);

      // Позиция оружия в кадре. Первое лицо: ствол уходит стволом вперёд-вправо,
      // при прицеливании мушка встаёт точно в центр экрана.
      // от бедра — ствол справа-снизу и сходится к центру кадра;
      // при прицеливании — мушка точно по центру, оружие ближе к глазу
      // «как в CS»: от бедра оружие крупно в правом нижнем углу, ствол
      // сходится к центру кадра; на прицеле — мушка/дульный срез по центру.
      // поза от бедра — из таблицы под ствол (см. setWeapon)
      const pose = this.pose || { x: 0.14, y: -0.16, z: -0.60, rx: 0.04, ry: 0.18, rz: 0.07, s: 0.86 };
      const hipX = pose.x, hipY = pose.y, hipZ = pose.z;
      const adsX = 0.13, adsY = -0.19, adsZ = -0.52;
      const lowerY = -0.13 * this.lowered;
      const lowRot = 0.55 * this.lowered;
      const rxSw = -this.sway.y * 0.5;
      let px = (hipX * (1 - this.ads) + adsX * this.ads) + bobX + this.sway.x * 0.10;
      let py = (hipY * (1 - this.ads) + adsY * this.ads) + bobY + this.sway.y * 0.07 + lowerY;
      let pz = (hipZ * (1 - this.ads) + adsZ * this.ads) - this.recoil * 0.16;
      // лёгкий доворот ствола к центру: оружие смотрит туда же, куда камера
      let rx = (pose.rx * (1 - this.ads) + 0.16 * this.ads) - this.recoilRot * 0.20 + lowRot + rxSw;
      // доворот к центру кадра: ствол уходит вперёд-влево, приклад — вправо
      let ry = (pose.ry * (1 - this.ads) + 0.10 * this.ads) - this.sway.x * 0.9;
      let rz = (pose.rz * (1 - this.ads) + 0.0 * this.ads);
      // масштаб: от бедра крупнее — оружие должно читаться сразу
      let sc = pose.s * (1 - this.ads) + (0.86 + 0.16 * this.ads) * this.ads;
      // При прицеливании камера сужает FOV (у винтовки 78 → 48) — без правки
      // оружие «раздувается» на весь кадр. Уменьшаем его пропорционально
      // тангенсу половины FOV, чтобы угловой размер остался прежним.
      if (this.ads > 0.01 && this.camera && this.camera.fov) {
        const tanBase = Math.tan((78 * Math.PI) / 360);
        const tanNow = Math.tan((this.camera.fov * Math.PI) / 360);
        sc *= 1 - (1 - tanNow / tanBase) * this.ads;
      }

      // перезарядка: оружие уходит вниз и крутится
      if (this.reloadT < this.reloadDur) {
        this.reloadT += dt;
        const t = Math.min(1, this.reloadT / this.reloadDur);
        const arc = Math.sin(t * Math.PI);
        py -= arc * 0.13;
        rx -= arc * 0.4;
        rz += Math.sin(t * Math.PI * 2) * 0.32;
        px += arc * 0.02;
        // левая рука «ходит» к магазину
        if (this.armL) {
          this.armL.position.z = 0.34 - arc * 0.18;
          this.armL.position.y = -0.13 + Math.sin(t * Math.PI * 3) * 0.03;
        }
      } else if (this.armL) {
        if (this.currentWeapon === 'pistol') { this.armL.position.set(-0.035, -0.12, 0.06); }
        else if (this.currentWeapon === 'shotgun') { this.armL.position.set(-0.03, -0.13, 0.50); }
        else if (this.currentWeapon === 'dmr') { this.armL.position.set(-0.03, -0.12, 0.42); }
        else this.armL.position.set(-0.03, -0.13, 0.34);
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
      // перезарядка: левая рука уходит вниз к магазину
      if (this.reloadT < this.reloadDur) {
        const t = Math.min(1, this.reloadT / this.reloadDur);
        const arc = Math.sin(t * Math.PI);
        this.armL.position.y -= arc * 0.12;
        this.armL.rotateZ(arc * 0.45);
      }
    }

    muzzle() { return this.muzzleWorld; }
  }

  SH2.viewmodel = { ViewModel };
})(typeof window !== 'undefined' ? window : globalThis);
