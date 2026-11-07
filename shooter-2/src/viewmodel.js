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
      this.sleeve = 0x2f3a52;
      this.glove = 0x1c2026;
      this.weaponHolder = new T.Group();
      this.rig.add(this.weaponHolder);
      // Отдельный слой рендера: оружие не проваливается в стены и не режется
      // их ближней плоскостью. Камера рисует слой 1 вторым проходом.
      this.root.traverse((c) => { if (c.isMesh) c.layers.set(1); });
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
      this.buildHands();
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
        palmMesh.scale.set(1, 1, 0.92);
        g.add(palmMesh);
        // четыре пальца: трубки поперёк, обхватывают цевьё
        const finger = O.revolve([[0, 0.011], [0.004, 0.012], [0.052, 0.012], [0.058, 0.010], [0.06, 0.0]], { segments: 8 });
        finger.rotateZ(Math.PI / 2);
        for (let i = 0; i < 4; i++) {
          const f = new T.Mesh(finger, M(this.glove));
          f.position.set(-0.028, -0.042 + i * 0.021, 0.028);
          f.rotation.y = -0.16 - i * 0.02;
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

      this.armR = makeArm(0.34, 0.037, 0.030);
      this.weaponHolder.add(this.armR);
      this.armL = makeArm(0.36, 0.039, 0.030);
      this.weaponHolder.add(this.armL);
    }

    setWeapon(id) {
      if (this.currentWeapon === id) return;
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
      this.muzzleLocal = model.userData.muzzle;
      // положение рук под оружие
      if (id === 'pistol') {
        this.armR.position.set(0.045, -0.115, 0.04);
        this.armL.position.set(-0.035, -0.12, 0.06);
      } else if (id === 'shotgun') {
        this.armR.position.set(0.05, -0.12, 0.02);
        this.armL.position.set(-0.03, -0.13, 0.50);
      } else if (id === 'dmr') {
        this.armR.position.set(0.05, -0.12, 0.0);
        this.armL.position.set(-0.03, -0.12, 0.42);
      } else {
        this.armR.position.set(0.05, -0.12, 0.0);
        this.armL.position.set(-0.03, -0.13, 0.34);
      }
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
      const adsX = 0.0, adsY = -0.085, adsZ = -0.55;
      const hipX = 0.22, hipY = -0.24, hipZ = -0.64;
      const lowerY = -0.13 * this.lowered;
      const lowRot = 0.55 * this.lowered;
      const rxSw = -this.sway.y * 0.5;
      let px = (hipX * (1 - this.ads) + adsX * this.ads) + bobX + this.sway.x * 0.10;
      let py = (hipY * (1 - this.ads) + adsY * this.ads) + bobY + this.sway.y * 0.07 + lowerY;
      let pz = (hipZ * (1 - this.ads) + adsZ * this.ads) - this.recoil * 0.16;
      // лёгкий доворот ствола к центру: оружие смотрит туда же, куда камера
      let rx = 0.05 * (1 - this.ads) - this.recoilRot * 0.20 + lowRot + rxSw;
      // доворот к центру кадра: ствол уходит вперёд-влево, приклад — вправо
      let ry = 0.22 * (1 - this.ads) - this.sway.x * 0.9;
      let rz = 0.08 * (1 - this.ads);
      // масштаб: от бедра чуть мельче, чтобы ствол не «съедал» пол-экрана
      const sc = 0.85 + 0.15 * this.ads;

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
        ay.set(side * 0.34, -0.92, 0.62).normalize();
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
