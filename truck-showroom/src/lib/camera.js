// ============================================================
// Камера и переходы между видами: плавный полёт, орбита,
// «место водителя» без орбиты, свободный осмотр мышью.
// ============================================================
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { damp, clamp } from './kit.js';

export class ShowroomCamera {
  constructor(camera, dom) {
    this.camera = camera;
    this.controls = new OrbitControls(camera, dom);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.075;
    this.controls.minDistance = 1.4;
    this.controls.maxDistance = 46;
    this.controls.maxPolarAngle = Math.PI * 0.495;
    this.controls.screenSpacePanning = true;
    this.controls.target.set(0, 1.4, 0);
    this.controls.enabled = true;
    this.controls.autoRotateSpeed = 0.55;
    this.flying = null;
    this.current = null;
    this.look = new THREE.Vector3();
    this.view = null;
  }

  /** jib: {pos, target, fov} — желаемое положение камеры. */
  setView(view, { instant = false } = {}) {
    this.view = view;
    const pos = new THREE.Vector3(...view.pos);
    let target = new THREE.Vector3(...view.target);
    if (view.seat) {
      // сидя в салоне, вращаем головой вокруг близкой точки перед собой
      const dir = target.clone().sub(pos).normalize();
      target = pos.clone().add(dir.multiplyScalar(2.6));
      view = { ...view, target: target.toArray() };
    }
    this.controls.enabled = !!view.orbit || !!view.seat;
    // снаружи не опускаем камеру под пол, в салоне разрешаем смотреть на приборку
    this.controls.maxPolarAngle = view.seat ? Math.PI * 0.96 : Math.PI * 0.495;
    this.controls.autoRotate = !!view.autoRotate && !view.seat;
    this.controls.minDistance = view.seat ? 0.35 : 1.4;
    if (instant) {
      this.camera.position.copy(pos);
      this.camera.fov = view.fov || 40;
      this.camera.updateProjectionMatrix();
      this.controls.target.copy(target);
      this.controls.update();
      this.flying = null;
    } else {
      this.flying = {
        t: 0,
        dur: view.seat ? 1.15 : 0.95,
        fromPos: this.camera.position.clone(),
        fromTarget: this.controls.target.clone(),
        fromFov: this.camera.fov,
        toPos: pos,
        toTarget: target,
        toFov: view.fov || 40,
        view,
      };
    }
  }

  update(dt) {
    if (this.flying) {
      const f = this.flying;
      f.t += dt;
      const k = clamp(f.t / f.dur, 0, 1);
      // ease-in-out с лёгким «дыханием»
      const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      this.camera.position.lerpVectors(f.fromPos, f.toPos, e);
      this.controls.target.lerpVectors(f.fromTarget, f.toTarget, e);
      this.camera.fov = f.fromFov + (f.toFov - f.fromFov) * e;
      this.camera.updateProjectionMatrix();
      this.controls.update();
      if (k >= 1) {
        this.flying = null;
        this.current = f.view;
        if (f.view.orbit) this.controls.autoRotate = !!f.view.autoRotate;
      }
      return;
    }
    if (this.controls.enabled) this.controls.update();
  }

  /** «Заглянуть» внутрь: плавный наклон от места водителя. */
  lookAt(x, y, z) {
    this.controls.target.set(x, y, z);
    this.controls.update();
  }

  get isSeated() {
    return !!this.view?.seat;
  }
}
