// ============================================================================
//  ИНЖЕНЕРНАЯ 3D-КАМЕРА БАССЕЙНА (0.8×0.8 км / 5×5 км / 10×10 км)
// ============================================================================

import * as THREE from 'three';
import { WORLD } from './config.js';
import { clamp, lerp } from './noise.js';

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
    this.update(0.016, 22 * WORLD.elevScale);
  }

  /** Обновляет пирамиду видимости (near/far) и дистанции зума при смене масштаба карты (0.8 / 5 / 10 км) */
  syncToWorldScale() {
    this.camera.near = WORLD.size >= 5000 ? 4.5 : 1.5;
    this.camera.far = Math.max(3600, WORLD.size * 2.85);
    this.camera.updateProjectionMatrix();
    this.goalDist = clamp(this.goalDist, WORLD.minZoom, WORLD.maxZoom);
  }

  _bindEvents() {
    window.addEventListener('keydown', (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT')) return;
      this.keys.add(e.code);
    });
    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
    });
    window.addEventListener('blur', () => this.keys.clear());

    this.dom.addEventListener('contextmenu', (e) => e.preventDefault());

    this.dom.addEventListener('mousedown', (e) => {
      if (e.button === 2) {
        this.isOrbiting = true;
        this.lastX = e.clientX;
        this.lastY = e.clientY;
      } else if (e.button === 1) {
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
        this.goalPitch = clamp(this.goalPitch + dy * 0.0048, 0.14, 1.40);
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
      const factor = e.deltaY > 0 ? 1.14 : 0.88;
      this.goalDist = clamp(this.goalDist * factor, WORLD.minZoom, WORLD.maxZoom);
      this.userMoved = true;
    }, { passive: false });

    this.dom.addEventListener('touchstart', (e) => {
      for (const t of e.changedTouches) {
        this.touches.set(t.identifier, { x: t.clientX, y: t.clientY });
      }
      if (this.touches.size === 2) {
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
    const scale = this.distance * 0.00175;
    const sinY = Math.sin(this.yaw);
    const cosY = Math.cos(this.yaw);
    this.goalTarget.x -= (cosY * dx + sinY * dy) * scale;
    this.goalTarget.z -= (-sinY * dx + cosY * dy) * scale;
    const lim = WORLD.size * 0.485;
    this.goalTarget.x = clamp(this.goalTarget.x, -lim, lim);
    this.goalTarget.z = clamp(this.goalTarget.z, -lim, lim);
  }

  flyTo(wx, wz, dist = WORLD.defaultDist, groundY = 20) {
    const lim = WORLD.size * 0.485;
    this.goalTarget.set(clamp(wx, -lim, lim), groundY, clamp(wz, -lim, lim));
    this.goalDist = clamp(dist, WORLD.minZoom, WORLD.maxZoom);
  }

  /** Мягкий панорамный облёт бассейна на экране предзагрузки карты */
  updatePreviewOrbit(dt, groundY = 22) {
    this.goalYaw += dt * 0.10;
    this.goalPitch = 0.62;
    this.goalDist = clamp(WORLD.defaultDist * 1.18, WORLD.minZoom, WORLD.maxZoom);
    this.update(dt, groundY);
  }

  update(dt, groundHeightAtTarget = 18) {
    const panSpeed = (36 * Math.sqrt(WORLD.horizScale) + this.distance * 0.68) * dt;
    const sinY = Math.sin(this.yaw);
    const cosY = Math.cos(this.yaw);

    let fwd = 0;
    let right = 0;
    if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) fwd += 1;
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) fwd -= 1;
    if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) right += 1;
    if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) right += 1;

    if (fwd !== 0 || right !== 0) {
      const len = Math.hypot(fwd, right);
      fwd /= len;
      right /= len;
      this.goalTarget.x += (-sinY * fwd + cosY * right) * panSpeed;
      this.goalTarget.z += (-cosY * fwd - sinY * right) * panSpeed;
      const lim = WORLD.size * 0.485;
      this.goalTarget.x = clamp(this.goalTarget.x, -lim, lim);
      this.goalTarget.z = clamp(this.goalTarget.z, -lim, lim);
      this.userMoved = true;
    }

    if (this.keys.has('KeyQ')) { this.goalYaw += 1.55 * dt; this.userMoved = true; }
    if (this.keys.has('KeyE')) { this.goalYaw -= 1.55 * dt; this.userMoved = true; }

    this.goalTarget.y = lerp(this.goalTarget.y, Math.max(8, groundHeightAtTarget + 2.5), clamp(dt * 5, 0, 1));

    const smooth = clamp(dt * 10.5, 0.05, 1.0);
    this.yaw = lerp(this.yaw, this.goalYaw, smooth);
    this.pitch = lerp(this.pitch, this.goalPitch, smooth);
    this.distance = lerp(this.distance, this.goalDist, smooth);
    this.target.lerp(this.goalTarget, smooth);

    const horiz = Math.cos(this.pitch) * this.distance;
    const vert = Math.sin(this.pitch) * this.distance;

    this.camera.position.set(
      this.target.x + Math.sin(this.yaw) * horiz,
      Math.max(groundHeightAtTarget + 5.5, this.target.y + vert),
      this.target.z + Math.cos(this.yaw) * horiz,
    );
    this.camera.lookAt(this.target);
  }
}
