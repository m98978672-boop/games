// ============================================================
// Камера и переходы между видами: плавный полёт, орбита,
// «место водителя» без орбиты, свободный осмотр мышью.
// ============================================================
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { damp, clamp } from './kit.js';

export class ShowroomCamera {
  constructor(camera, dom, opts = {}) {
    this.camera = camera;
    this.controls = new OrbitControls(camera, dom);
    const touch = !!opts.touch;
    this.controls.enableDamping = true;
    this.controls.dampingFactor = touch ? 0.12 : 0.085;
    this.controls.minDistance = 1.4;
    this.controls.maxDistance = 46;
    // зум колесом — к курсору: так модель не «уезжает» из-под мыши,
    // а приближается тот участок, на который смотришь
    this.controls.zoomToCursor = true;
    this.controls.zoomSpeed = touch ? 0.95 : 0.8;
    this.controls.rotateSpeed = touch ? 0.6 : 0.9;
    this.controls.panSpeed = 0.85;
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
    // дальше, чем в 2.4 раза от штатной точки вида, не отъезжаем:
    // так камера не улетает в пустоту и модель всегда остаётся в кадре
    const baseDist = pos.distanceTo(target);
    this.controls.maxDistance = clamp(baseDist * 2.4, 6, 60);
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

  /** Свободный полёт (клавиатура): fwd — вперёд/назад по линии взгляда,
   *  side — вправо/влево, up — вверх/вниз. Цель орбиты летит вместе с камерой,
   *  поэтому после полёта вращение продолжается вокруг новой точки. */
  fly(fwd = 0, side = 0, up = 0, dist = 0.1) {
    if (!fwd && !side && !up) return;
    const dir = new THREE.Vector3();
    this.camera.getWorldDirection(dir);
    const right = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 1, 0)).normalize();
    const delta = dir
      .multiplyScalar(fwd * dist)
      .add(right.multiplyScalar(side * dist))
      .add(new THREE.Vector3(0, up * dist, 0));
    const next = this.camera.position.clone().add(delta);
    // не уходим под пол и не улетаем в пустоту
    next.y = clamp(next.y, 0.35, 26);
    const flat = Math.hypot(next.x, next.z);
    if (flat > 46) {
      const k = 46 / flat;
      next.x *= k;
      next.z *= k;
    }
    delta.copy(next).sub(this.camera.position);
    this.camera.position.copy(next);
    this.controls.target.add(delta);
    if (this.camera.position.y < 1.2 && this.controls.target.y < 1.0) {
      this.controls.target.y = 1.2;
    }
    this.controls.autoRotate = false;
    this.controls.update();
  }

  /** Программный поворот камеры (навпад, клавиатура): dx — вокруг оси Y,
   *  dy — по вертикали. Работает и в салоне, где орбита вокруг головы. */
  orbit(dx, dy) {
    if (!this.controls.enabled) return;
    const target = this.controls.target;
    const offset = this.camera.position.clone().sub(target);
    const sph = new THREE.Spherical().setFromVector3(offset);
    sph.theta -= dx;
    const minPolar = 0.14;
    sph.phi = clamp(sph.phi - dy, minPolar, this.controls.maxPolarAngle - 0.02);
    offset.setFromSpherical(sph);
    this.camera.position.copy(target).add(offset);
    this.camera.lookAt(target);
    this.controls.update();
  }

  /** Программный зум: k > 1 — ближе, k < 1 — дальше. */
  zoomBy(k) {
    const target = this.controls.target;
    const offset = this.camera.position.clone().sub(target);
    const dist = clamp(offset.length() / k, this.controls.minDistance, this.controls.maxDistance);
    offset.setLength(dist);
    this.camera.position.copy(target).add(offset);
    this.camera.lookAt(target);
    this.controls.update();
  }

  /** Сдвиг точки взгляда вбок/вглубь экрана (кнопки панорамирования). */
  panBy(dx, dy) {
    const target = this.controls.target;
    const right = new THREE.Vector3().setFromMatrixColumn(this.camera.matrix, 0);
    const up = new THREE.Vector3().setFromMatrixColumn(this.camera.matrix, 1);
    const scale = this.camera.position.distanceTo(target) * 0.12;
    const shift = right.multiplyScalar(dx * scale).add(up.multiplyScalar(dy * scale));
    target.add(shift);
    this.camera.position.add(shift);
    this.camera.lookAt(target);
    this.controls.update();
  }

  /** Плавно навести камеру на точку (клик по детали). */
  focusOn(point, { distance = null } = {}) {
    const from = this.camera.position.clone();
    const dir = from.clone().sub(point).normalize();
    const d = clamp(distance ?? from.distanceTo(point) * 0.62, 1.6, this.controls.maxDistance);
    const pos = point.clone().add(dir.multiplyScalar(d));
    this.flying = {
      t: 0,
      dur: 0.55,
      fromPos: from,
      fromTarget: this.controls.target.clone(),
      fromFov: this.camera.fov,
      toPos: pos,
      toTarget: point.clone(),
      toFov: this.camera.fov,
      view: this.view,
    };
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
        if (f.view?.orbit) this.controls.autoRotate = !!f.view.autoRotate;
      }
      return;
    }
    if (this.controls.enabled) this.controls.update(dt);
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
