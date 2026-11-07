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

      // предплечье — лофт по сечениям (сужается к кисти), кисть — тоже лофт
      const forearm = (len, r0, r1) => O.loftSections([
        { at: [0, 0, 0], pts: O.circleSection(r0, r0, 10) },
        { at: [0, 0, len * 0.45], pts: O.circleSection((r0 + r1) / 2, (r0 + r1) / 2, 10) },
        { at: [0, 0, len], pts: O.circleSection(r1, r1, 10) }
      ]);
      const fist = () => {
        const g = O.loftSections([
          { at: [0, -0.03, 0], pts: O.circleSection(0.042, 0.040, 10) },
          { at: [0, 0.0, 0.02], pts: O.circleSection(0.050, 0.046, 10) },
          { at: [0, 0.035, 0.03], pts: O.circleSection(0.044, 0.040, 10) }
        ]);
        return g;
      };

      // правая рука
      const armR = new T.Group();
      armR.position.set(0.055, -0.11, 0.06);
      armR.rotation.set(-0.25, 0.22, 0.12);
      const foreR = new T.Mesh(forearm(0.30, 0.048, 0.055), M(this.sleeve));
      foreR.rotation.x = -Math.PI / 2.2;
      foreR.position.set(0.01, -0.06, -0.02);
      armR.add(foreR);
      const cuffR = new T.Mesh(O.revolve([[0, 0.058], [0.03, 0.062], [0.075, 0.056], [0.08, 0]], { segments: 10 }), M(this.sleeve));
      cuffR.rotation.x = Math.PI / 2;
      cuffR.position.set(0.01, -0.02, -0.11);
      armR.add(cuffR);
      const handR = new T.Mesh(fist(), M(this.glove));
      handR.position.set(0, -0.005, 0.0);
      armR.add(handR);
      this.weaponHolder.add(armR);
      this.armR = armR;

      // левая рука
      const armL = new T.Group();
      armL.position.set(-0.02, -0.10, 0.34);
      armL.rotation.set(-0.15, -0.35, -0.15);
      const foreL = new T.Mesh(forearm(0.34, 0.050, 0.042), M(this.sleeve));
      foreL.rotation.x = -Math.PI / 2.6;
      foreL.position.set(-0.02, -0.05, -0.13);
      armL.add(foreL);
      const cuffL = new T.Mesh(O.revolve([[0, 0.058], [0.03, 0.060], [0.075, 0.052], [0.08, 0]], { segments: 10 }), M(this.sleeve));
      cuffL.rotation.x = Math.PI / 2;
      cuffL.position.set(-0.02, -0.01, -0.2);
      armL.add(cuffL);
      const handL = new T.Mesh(fist(), M(this.glove));
      handL.position.set(0, -0.01, 0.0);
      armL.add(handL);
      this.weaponHolder.add(armL);
      this.armL = armL;
    }

    setWeapon(id) {
      if (this.currentWeapon === id) return;
      this.currentWeapon = id;
      let model = this.models[id];
      if (!model) {
        model = SH2.model.buildWeaponModel(id, { smooth: true });
        // чертежи уже в метрах: от первого лица чуть крупнее, стволом от камеры
        model.scale.setScalar(1.28);
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

      // позиция: к центру при прицеливании
      const adsX = 0.0, adsY = -0.055, adsZ = 0.02;
      const hipX = 0.115, hipY = -0.115, hipZ = 0.02;
      const lowerY = -0.12 * this.lowered;
      const lowRot = 0.55 * this.lowered;
      let px = (hipX * (1 - this.ads) + adsX * this.ads) + bobX + this.sway.x * 0.12;
      let py = (hipY * (1 - this.ads) + adsY * this.ads) + bobY + this.sway.y * 0.08 + lowerY;
      let pz = (hipZ * (1 - this.ads) + adsZ * this.ads) - this.recoil * 0.35;
      let rx = -this.recoilRot * 0.22 + lowRot - this.sway.y * 0.5;
      let ry = -this.sway.x * 1.2;
      let rz = 0;

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
      // цель при ADS — ближе к глазу
      this.root.visible = p.hidden ? false : true;

      if (this.muzzleLocal) this.muzzleLocal.getWorldPosition(this.muzzleWorld);
      return this;
    }

    muzzle() { return this.muzzleWorld; }
  }

  SH2.viewmodel = { ViewModel };
})(typeof window !== 'undefined' ? window : globalThis);
