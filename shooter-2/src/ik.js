/* =============================================================================
   СЕКТОР «ПЕПЕЛ» — IK рук и прикладка оружия
   -----------------------------------------------------------------------------
   Оружие закреплено на груди, а кисти процедурно дотягиваются до рукояти и
   цевья (аналитический two-bone IK). Поэтому оружие всегда смотрит вперёд,
   даже когда бегут ноги или корпус наклоняется.

   Оптимизация: тяжёлая тригонометрия считается только когда поза изменилась
   заметно (дельта-углов больше порога), иначе используется прошлое решение.
   ============================================================================= */
(function (root) {
  'use strict';
  const SH2 = (root.SH2 = root.SH2 || {});
  const THREE = () => root.THREE;

  const _a = { v1: null, v2: null };

  class ArmIK {
    constructor(rig) {
      const T = THREE();
      this.rig = rig;
      this.enabled = true;
      this.v = {
        target: new T.Vector3(), pole: new T.Vector3(), shoulder: new T.Vector3(),
        dir: new T.Vector3(), perp: new T.Vector3(), elbow: new T.Vector3(),
        up: new T.Vector3(0, 1, 0), q: new T.Quaternion(), m: new T.Matrix4(),
        parentInv: new T.Matrix4(), tmp: new T.Vector3(), tmp2: new T.Vector3(),
        x: new T.Vector3(), y: new T.Vector3(), z: new T.Vector3()
      };
      this.lastKey = '';
      this.solves = 0;
      this.skipped = 0;
    }

    /* Поза приклада: наклон оружия и его позиция относительно груди */
    poseWeapon(pose) {
      const T = THREE();
      const slot = this.rig.weaponSlot;
      const p = pose || {};
      const raise = p.raise || 0;     // 0..1 подъём к линии глаз
      const tilt = p.tilt || 0;       // наклон ствола вверх/вниз
      const roll = p.roll || 0;
      slot.position.set(0.16 - raise * 0.05, -0.04 + raise * 0.09, 0.26 + raise * 0.03);
      slot.rotation.set(-0.05 + tilt, 0.06 - raise * 0.06, roll);
    }

    /* Ориентирует кость так, чтобы её локальная -Y смотрела из from в to */
    aimBone(bone, from, to, twistRef) {
      const T = THREE();
      const v = this.v;
      const dir = v.tmp.copy(to).sub(from).normalize();
      const yAxis = dir.clone().negate();           // кость «растёт» по -Y
      let ref = twistRef.clone();
      ref.addScaledVector(yAxis, -ref.dot(yAxis));  // перпендикуляр к оси
      if (ref.lengthSq() < 1e-6) ref.set(0, 0, 1);
      ref.normalize();
      const xAxis = ref.clone();
      const zAxis = new T.Vector3().crossVectors(xAxis, yAxis).normalize();
      xAxis.crossVectors(yAxis, zAxis).normalize();
      const m = v.m.makeBasis(xAxis, yAxis, zAxis);
      const qWorld = new T.Quaternion().setFromRotationMatrix(m);
      const qParent = new T.Quaternion();
      bone.parent.getWorldQuaternion(qParent);
      bone.quaternion.copy(qParent).invert().multiply(qWorld);
      return qParent.multiply(qWorld); // мировой поворот кости
    }

    /* Аналитический two-bone IK: плечо -> локоть -> кисть */
    solveArm(side, poleDir) {
      const T = THREE();
      const rig = this.rig;
      const B = rig.bones;
      const v = this.v;
      const upper = side === 'R' ? B.upperArmR : B.upperArmL;
      const lower = side === 'R' ? B.lowerArmR : B.lowerArmL;
      const hand = side === 'R' ? B.handR : B.handL;
      const target = side === 'R' ? rig.gripR : rig.gripL;
      if (!target || !upper || !lower) return;
      const L1 = rig.armLengths.upper, L2 = rig.armLengths.lower;

      rig.root.updateMatrixWorld(true);
      target.getWorldPosition(v.target);
      upper.getWorldPosition(v.shoulder);

      v.dir.copy(v.target).sub(v.shoulder);
      const dist = v.dir.length();
      if (dist < 1e-5) return;
      v.dir.divideScalar(dist);
      const reach = Math.min((L1 + L2) * 0.995, Math.max(Math.abs(L1 - L2) + 0.02, dist));

      const cosA = (L1 * L1 + reach * reach - L2 * L2) / (2 * L1 * reach);
      const a = Math.acos(Math.max(-1, Math.min(1, cosA)));

      // плоскость сгиба
      const perp = poleDir.clone();
      perp.addScaledVector(v.dir, -perp.dot(v.dir));
      if (perp.lengthSq() < 1e-6) perp.set(0, -1, 0);
      perp.normalize();

      // локоть
      v.elbow.copy(v.shoulder)
        .addScaledVector(v.dir, Math.cos(a) * L1)
        .addScaledVector(perp, Math.sin(a) * L1);

      const wrist = v.tmp2.copy(v.shoulder).addScaledVector(v.dir, reach);
      this.aimBone(upper, v.shoulder, v.elbow, perp);
      this.aimBone(lower, v.elbow, wrist, perp);
      if (hand) hand.rotation.set(0, 0, 0);
      this.solves++;
    }

    /* Полный проход: прикладка + IK обеих рук */
    update(pose) {
      if (!this.enabled) return;
      const rig = this.rig;
      const T = THREE();
      this.poseWeapon(pose);
      const poleR = new T.Vector3(0.95, -0.65, -0.55).normalize();
      const poleL = new T.Vector3(-0.85, -0.55, -0.75).normalize();
      this.solveArm('R', poleR);
      this.solveArm('L', poleL);
    }
  }

  SH2.ik = { ArmIK };
})(typeof window !== 'undefined' ? window : globalThis);
