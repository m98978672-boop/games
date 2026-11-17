// RatCore Module [phys] — Твёрдые тела, AABB/Sphere коллизии, гравитация, трение, сон и CCD-рейкаст (Уровень 1 Opt-In)

import { clamp } from '../core/math.js';

export class PhysicsWorld {
  constructor({ gravity = -9.81, sleepVelSq = 0.0025 } = {}) {
    this.gravity = gravity;
    this.sleepVelSq = sleepVelSq;
    this.bodies = new Map();
    this.lastCollisions = [];
  }

  addBody({ id, x = 0, y = 0, h = 1, vx = 0, vy = 0, vh = 0, mass = 1, radius = 0.5, restitution = 0.35, friction = 0.85, isStatic = false } = {}) {
    const body = {
      id: String(id),
      x: Number(x),
      y: Number(y),
      h: Number(h),
      vx: Number(vx),
      vy: Number(vy),
      vh: Number(vh),
      mass: isStatic ? 0 : Math.max(0.01, Number(mass)),
      invMass: isStatic ? 0 : 1 / Math.max(0.01, Number(mass)),
      radius: Math.max(0.05, Number(radius)),
      restitution: clamp(Number(restitution), 0, 0.98),
      friction: clamp(Number(friction), 0, 1),
      isStatic: Boolean(isStatic),
      sleeping: false,
      sleepFrames: 0,
      grounded: false,
    };
    this.bodies.set(body.id, body);
    return { ...body };
  }

  applyImpulse(id, ix = 0, iy = 0, ih = 0) {
    const b = this.bodies.get(id);
    if (!b || b.isStatic) return null;
    b.sleeping = false;
    b.sleepFrames = 0;
    b.vx += ix * b.invMass;
    b.vy += iy * b.invMass;
    b.vh += ih * b.invMass;
    return { id: b.id, vx: b.vx, vy: b.vy, vh: b.vh };
  }

  // Шаг физики с коллизией о рельеф HeightField и попарным импульсным разрешением + острова сна
  step(dt, heightField) {
    const hDt = Math.min(0.05, Math.max(0.001, Number(dt || 1 / 30)));
    this.lastCollisions = [];
    const list = [...this.bodies.values()];

    for (const b of list) {
      if (b.isStatic || b.sleeping) continue;
      b.vh += this.gravity * hDt;
      b.x += b.vx * hDt;
      b.y += b.vy * hDt;
      b.h += b.vh * hDt;

      const groundH = heightField ? heightField.sampleHeight(b.x, b.y) : 0;
      const minH = groundH + b.radius;
      if (b.h <= minH) {
        b.h = minH;
        b.grounded = true;
        if (b.vh < -0.25) {
          b.vh = -b.vh * b.restitution;
        } else {
          b.vh = 0;
        }
        const drag = Math.pow(b.friction, hDt * 15);
        b.vx *= drag;
        b.vy *= drag;
      } else {
        b.grounded = false;
      }

      const v2 = b.vx * b.vx + b.vy * b.vy + b.vh * b.vh;
      if (b.grounded && v2 < this.sleepVelSq) {
        b.sleepFrames++;
        if (b.sleepFrames >= 12) {
          b.vx = b.vy = b.vh = 0;
          b.sleeping = true;
        }
      } else {
        b.sleepFrames = 0;
      }
    }

    // Попарные коллизии сфер (импульсное разрешение)
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const a = list[i], b = list[j];
        if ((a.isStatic || a.sleeping) && (b.isStatic || b.sleeping)) continue;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dh = b.h - a.h;
        const minDist = a.radius + b.radius;
        const distSq = dx * dx + dy * dy + dh * dh;
        if (distSq >= minDist * minDist || distSq < 1e-9) continue;

        const dist = Math.sqrt(distSq);
        const nx = dx / dist, ny = dy / dist, nh = dh / dist;
        const overlap = minDist - dist;
        const invSum = a.invMass + b.invMass;
        if (invSum <= 0) continue;

        a.sleeping = false; b.sleeping = false;
        a.x -= nx * overlap * (a.invMass / invSum);
        a.y -= ny * overlap * (a.invMass / invSum);
        a.h -= nh * overlap * (a.invMass / invSum);
        b.x += nx * overlap * (b.invMass / invSum);
        b.y += ny * overlap * (b.invMass / invSum);
        b.h += nh * overlap * (b.invMass / invSum);

        const rvx = b.vx - a.vx, rvy = b.vy - a.vy, rvh = b.vh - a.vh;
        const vn = rvx * nx + rvy * ny + rvh * nh;
        if (vn < 0) {
          const e = Math.min(a.restitution, b.restitution);
          const imp = (-(1 + e) * vn) / invSum;
          a.vx -= imp * nx * a.invMass;
          a.vy -= imp * ny * a.invMass;
          a.vh -= imp * nh * a.invMass;
          b.vx += imp * nx * b.invMass;
          b.vy += imp * ny * b.invMass;
          b.vh += imp * nh * b.invMass;
        }
        this.lastCollisions.push({ a: a.id, b: b.id, overlap: Number(overlap.toFixed(4)) });
      }
    }

    return {
      bodies: list.length,
      sleeping: list.filter((b) => b.sleeping).length,
      collisions: this.lastCollisions.length,
    };
  }

  // Непрерывный луч (CCD) против сфер-тел в мире
  raycastBodies({ origin = [0, 0, 1], dir = [1, 0, 0], maxDist = 50 } = {}) {
    const len = Math.hypot(dir[0], dir[1], dir[2]) || 1;
    const dx = dir[0] / len, dy = dir[1] / len, dh = dir[2] / len;
    let closest = null;

    for (const b of this.bodies.values()) {
      const ocx = origin[0] - b.x;
      const ocy = origin[1] - b.y;
      const och = origin[2] - b.h;
      const proj = ocx * dx + ocy * dy + och * dh;
      const c = ocx * ocx + ocy * ocy + och * och - b.radius * b.radius;
      const disc = proj * proj - c;
      if (disc < 0) continue;
      const t = -proj - Math.sqrt(disc);
      if (t >= 0 && t <= maxDist && (!closest || t < closest.distance)) {
        closest = {
          id: b.id,
          distance: Number(t.toFixed(4)),
          point: [origin[0] + dx * t, origin[1] + dy * t, origin[2] + dh * t],
        };
      }
    }
    return closest;
  }
}
