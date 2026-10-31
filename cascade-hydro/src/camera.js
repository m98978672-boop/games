// ============================================================================
//  ИНЖЕНЕРНАЯ 3D-КАМЕРА БАССЕЙНА v0.3.1 (0.8×0.8 км / 5×5 км / 10×10 км)
//  - Точное отзывчивое управление WASD / ЦФЫВ / Стрелки + ускорение Shift
//  - Плавный дуговой перелёт между городами (над хребтами, без застревания в горах)
//  - Защита позиции самой камеры от провала сквозь горный рельеф
// ============================================================================

import * as THREE from 'three';
import { WORLD } from './config.js';
import { clamp, lerp } from './noise.js';

function mapKeyToCode(e) {
  if (e.code) {
    if (
      e.code === 'KeyW' || e.code === 'KeyA' || e.code === 'KeyS' || e.code === 'KeyD' ||
      e.code === 'KeyQ' || e.code === 'KeyE' ||
      e.code === 'ArrowUp' || e.code === 'ArrowDown' || e.code === 'ArrowLeft' || e.code === 'ArrowRight' ||
      e.code === 'ShiftLeft' || e.code === 'ShiftRight'
    ) {
      return e.code;
    }
  }
  const k = (e.key || '').toLowerCase();
  if (k === 'w' || k === 'ц') return 'KeyW';
  if (k === 'a' || k === 'ф') return 'KeyA';
  if (k === 's' || k === 'ы') return 'KeyS';
  if (k === 'd' || k === 'в') return 'KeyD';
  if (k === 'q' || k === 'й') return 'KeyQ';
  if (k === 'e' || k === 'у') return 'KeyE';
  return e.code || '';
}

export class ValleyCameraController {
  constructor(camera, domElement) {
    this.camera = camera;
    this.dom = domElement;

    this.target = new THREE.Vector3(14 * WORLD.horizScale, 28 * WORLD.elevScale, -64 * WORLD.horizScale);
    this.goalTarget = this.target.clone();

    this.yaw = -0.54;
    this.pitch = 0.67;
    this.distance = WORLD.defaultDist || 248;
    this.goalYaw = this.yaw;
    this.goalPitch = this.pitch;
    this.goalDist = this.distance;

    // Состояние плавного дугового перелёта между городами и объектами
    this._flight = null;

    this.keys = new Set();
    this.isOrbiting = false;
    this.isPanning = false;
    this.lastX = 0;
    this.lastY = 0;
    this.userMoved = false;

    this.touches = new Map();
    this.prevPinchDist = 0;

    this.syncToWorldScale();
    this._bindEvents();
    this.update(0.016, 22 * WORLD.elevScale, null);
  }

  /** Обновляет пирамиду видимости (near/far) и дистанции зума при смене масштаба карты (0.8 / 5 / 10 км) */
  syncToWorldScale() {
    this.camera.near = WORLD.size >= 5000 ? 4.5 : 1.5;
    this.camera.far = Math.max(4800, WORLD.size * 3.8);
    this.camera.updateProjectionMatrix();
    this.goalDist = clamp(this.goalDist, WORLD.minZoom, WORLD.maxZoom);
  }

  clearKeys() {
    this.keys.clear();
  }

  _bindEvents() {
    window.addEventListener('keydown', (e) => {
      const tag = e.target && e.target.tagName;
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
      const code = mapKeyToCode(e);
      if (code) {
        this.keys.add(code);
        if (code.startsWith('Arrow')) e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      const code = mapKeyToCode(e);
      if (code) this.keys.delete(code);
    });

    window.addEventListener('blur', () => this.keys.clear());
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.keys.clear();
    });

    this.dom.addEventListener('contextmenu', (e) => e.preventDefault());

    this.dom.addEventListener('mousedown', (e) => {
      if (e.button === 2) {
        this.isOrbiting = true;
        this.lastX = e.clientX;
        this.lastY = e.clientY;
      } else if (e.button === 1) {
        this._flight = null;
        this.isPanning = true;
        this.lastX = e.clientX;
        this.lastY = e.clientY;
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isOrbiting) {
        const dx = e.clientX - this.lastX;
        const dy = e.clientY - this.lastY;
        this.lastX = e.clientX;
        this.lastY = e.clientY;
        this.goalYaw -= dx * 0.0055;
        this.goalPitch = clamp(this.goalPitch + dy * 0.0048, 0.16, 1.40);
        this.userMoved = true;
      } else if (this.isPanning) {
        const dx = e.clientX - this.lastX;
        const dy = e.clientY - this.lastY;
        this.lastX = e.clientX;
        this.lastY = e.clientY;
        this._panByPixels(dx, dy);
        this.userMoved = true;
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 2) this.isOrbiting = false;
      if (e.button === 1) this.isPanning = false;
    });

    this.dom.addEventListener('wheel', (e) => {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 1.13 : 0.885;
      this.goalDist = clamp(this.goalDist * factor, WORLD.minZoom, WORLD.maxZoom);
      if (this._flight) this._flight.endDist = this.goalDist;
      this.userMoved = true;
    }, { passive: false });

    this.dom.addEventListener('touchstart', (e) => {
      for (const t of e.changedTouches) {
        this.touches.set(t.identifier, { x: t.clientX, y: t.clientY });
      }
      if (this.touches.size === 2) {
        this._flight = null;
        const pts = [...this.touches.values()];
        this.prevPinchDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      }
    }, { passive: true });

    this.dom.addEventListener('touchmove', (e) => {
      if (this.touches.size >= 2) {
        const prevPts = [...this.touches.values()];
        const prevCx = (prevPts[0].x + prevPts[1].x) * 0.5;
        const prevCy = (prevPts[0].y + prevPts[1].y) * 0.5;
        for (const t of e.changedTouches) {
          this.touches.set(t.identifier, { x: t.clientX, y: t.clientY });
        }
        const pts = [...this.touches.values()];
        const cx = (pts[0].x + pts[1].x) * 0.5;
        const cy = (pts[0].y + pts[1].y) * 0.5;
        this._panByPixels(cx - prevCx, cy - prevCy);

        const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        if (this.prevPinchDist > 10 && dist > 10) {
          this.goalDist = clamp(this.goalDist * (this.prevPinchDist / dist), WORLD.minZoom, WORLD.maxZoom);
        }
        this.prevPinchDist = dist;
        this.userMoved = true;
      }
    }, { passive: true });

    const endTouch = (e) => {
      for (const t of e.changedTouches) this.touches.delete(t.identifier);
    };
    this.dom.addEventListener('touchend', endTouch, { passive: true });
    this.dom.addEventListener('touchcancel', endTouch, { passive: true });
  }

  _panByPixels(dx, dy) {
    this._flight = null;
    const scale = this.distance * 0.00175;
    const sinY = Math.sin(this.yaw);
    const cosY = Math.cos(this.yaw);
    this.goalTarget.x -= (cosY * dx + sinY * dy) * scale;
    this.goalTarget.z -= (-sinY * dx + cosY * dy) * scale;
    const lim = WORLD.size * 0.485;
    this.goalTarget.x = clamp(this.goalTarget.x, -lim, lim);
    this.goalTarget.z = clamp(this.goalTarget.z, -lim, lim);
  }

  /**
   * Плавный дуговой перелёт камеры к городу или гидроузлу:
   * при большом расстоянии камера слегка приподнимается над горами по параболе и мягко приземляется в точку!
   */
  flyTo(wx, wz, dist = WORLD.defaultDist, groundY = 20) {
    const lim = WORLD.size * 0.485;
    const tx = clamp(wx, -lim, lim);
    const tz = clamp(wz, -lim, lim);
    const ty = Math.max(8, groundY + 2.5);
    const endDist = clamp(dist, WORLD.minZoom, WORLD.maxZoom);

    const travel = Math.hypot(tx - this.target.x, tz - this.target.z);
    if (travel < 12) {
      this._flight = null;
      this.goalTarget.set(tx, ty, tz);
      this.goalDist = endDist;
      return;
    }

    const dur = clamp(0.42 + (travel / Math.max(600, WORLD.size)) * 0.52, 0.42, 0.92);
    const arcLift = Math.min(WORLD.maxZoom * 0.42, travel * 0.24);

    this._flight = {
      elapsed: 0,
      duration: dur,
      startTarget: this.target.clone(),
      endTarget: new THREE.Vector3(tx, ty, tz),
      startDist: this.distance,
      endDist,
      arcLift,
    };
    this.goalTarget.set(tx, ty, tz);
    this.goalDist = endDist;
  }

  /** Мягкий панорамный облёт бассейна на экране предзагрузки карты */
  updatePreviewOrbit(dt, groundY = 22) {
    this._flight = null;
    this.goalYaw += dt * 0.10;
    this.goalPitch = 0.62;
    this.goalDist = clamp(WORLD.defaultDist * 1.18, WORLD.minZoom, WORLD.maxZoom);
    this.update(dt, groundY, null);
  }

  update(dt, groundHeightAtTarget = 18, sampleGroundFn = null) {
    let fwd = 0;
    let right = 0;
    if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) fwd += 1;
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) fwd -= 1;
    if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) right += 1;
    if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) right -= 1;

    const boost = (this.keys.has('ShiftLeft') || this.keys.has('ShiftRight')) ? 2.15 : 1.0;
    const panSpeed = (28 * Math.sqrt(WORLD.horizScale) + this.distance * 0.88) * boost * dt;
    const sinY = Math.sin(this.yaw);
    const cosY = Math.cos(this.yaw);

    if (fwd !== 0 || right !== 0) {
      // Любое нажатие WASD мгновенно передаёт управление игроку (отменяя авто-перелёт)
      if (this._flight) {
        this.goalTarget.copy(this.target);
        this.goalDist = this.distance;
        this._flight = null;
      }
      const len = Math.hypot(fwd, right);
      fwd /= len;
      right /= len;
      // Вектор взгляда камеры на плоскости XZ: (-sinY, -cosY), вектор вправо: (+cosY, -sinY)
      this.goalTarget.x += (-sinY * fwd + cosY * right) * panSpeed;
      this.goalTarget.z += (-cosY * fwd - sinY * right) * panSpeed;
      const lim = WORLD.size * 0.485;
      this.goalTarget.x = clamp(this.goalTarget.x, -lim, lim);
      this.goalTarget.z = clamp(this.goalTarget.z, -lim, lim);
      this.userMoved = true;
    }

    if (this.keys.has('KeyQ')) { this.goalYaw += 1.65 * dt; this.userMoved = true; }
    if (this.keys.has('KeyE')) { this.goalYaw -= 1.65 * dt; this.userMoved = true; }

    const smooth = clamp(dt * 12.0, 0.06, 1.0);
    this.yaw = lerp(this.yaw, this.goalYaw, smooth);
    this.pitch = lerp(this.pitch, this.goalPitch, smooth);

    if (this._flight) {
      this._flight.elapsed += dt;
      const rawT = clamp(this._flight.elapsed / this._flight.duration, 0, 1);
      // Плавная S-кривая (quintic smoothstep) без рывка в начале и без бесконечной доводки в конце
      const ease = rawT * rawT * rawT * (rawT * (rawT * 6 - 15) + 10);
      const parabola = 4.0 * rawT * (1.0 - rawT);

      this.target.lerpVectors(this._flight.startTarget, this._flight.endTarget, ease);
      this.target.y = Math.max(this.target.y, groundHeightAtTarget + 2.5) + this._flight.arcLift * 0.22 * parabola;
      this.distance = lerp(this._flight.startDist, this._flight.endDist, ease) + this._flight.arcLift * parabola;

      if (rawT >= 1.0) {
        this.goalTarget.copy(this._flight.endTarget);
        this.goalDist = this._flight.endDist;
        this._flight = null;
      }
    } else {
      this.goalTarget.y = lerp(this.goalTarget.y, Math.max(8, groundHeightAtTarget + 2.5), clamp(dt * 6.5, 0, 1));
      this.distance = lerp(this.distance, this.goalDist, smooth);
      this.target.lerp(this.goalTarget, smooth);
    }

    const horiz = Math.cos(this.pitch) * this.distance;
    const vert = Math.sin(this.pitch) * this.distance;

    const camX = this.target.x + Math.sin(this.yaw) * horiz;
    const camZ = this.target.z + Math.cos(this.yaw) * horiz;
    let minCamY = groundHeightAtTarget + 6.0;
    if (sampleGroundFn) {
      const groundUnderCam = sampleGroundFn(camX, camZ);
      minCamY = Math.max(minCamY, groundUnderCam + 7.5 * Math.pow(WORLD.elevScale, 0.5));
    }

    this.camera.position.set(camX, Math.max(minCamY, this.target.y + vert), camZ);
    this.camera.lookAt(this.target);
  }
}
