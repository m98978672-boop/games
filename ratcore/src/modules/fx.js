// RatCore Module [fx] — Детерминированный пул частиц SoA, декали и тряска камеры (Уровень 1 Opt-In)

import { clamp, createRng } from '../core/math.js';

export class FxSystem {
  constructor({ maxParticles = 512, seed = 1337 } = {}) {
    this.maxParticles = clamp(Number(maxParticles) | 0, 32, 4096);
    this.rng = createRng(seed);
    this.x = new Float32Array(this.maxParticles);
    this.y = new Float32Array(this.maxParticles);
    this.h = new Float32Array(this.maxParticles);
    this.vx = new Float32Array(this.maxParticles);
    this.vy = new Float32Array(this.maxParticles);
    this.vh = new Float32Array(this.maxParticles);
    this.life = new Float32Array(this.maxParticles);
    this.activeCount = 0;
    this.decals = [];
    this.shake = { trauma: 0, offsetX: 0, offsetY: 0, offsetH: 0 };
  }

  emitBurst({ x = 0, y = 0, h = 1, count = 24, speed = 4, lifeSec = 1.2 } = {}) {
    const n = clamp(Number(count) | 0, 1, 256);
    let spawned = 0;
    for (let i = 0; i < this.maxParticles && spawned < n; i++) {
      if (this.life[i] <= 0) {
        const ang = this.rng.next() * Math.PI * 2;
        const spd = speed * (0.4 + this.rng.next() * 0.8);
        this.x[i] = Number(x);
        this.y[i] = Number(y);
        this.h[i] = Number(h);
        this.vx[i] = Math.cos(ang) * spd;
        this.vy[i] = Math.sin(ang) * spd;
        this.vh[i] = speed * (0.5 + this.rng.next() * 0.9);
        this.life[i] = Number(lifeSec) * (0.7 + this.rng.next() * 0.6);
        spawned++;
      }
    }
    this._recount();
    return { spawned, activeParticles: this.activeCount };
  }

  addDecal({ x = 0, y = 0, h = 0, kind = 'scorch', radius = 1.2 } = {}) {
    const decal = { id: `dec-${this.decals.length + 1}`, x: Number(x), y: Number(y), h: Number(h), kind: String(kind), radius: Number(radius) };
    this.decals.push(decal);
    if (this.decals.length > 128) this.decals.shift();
    return decal;
  }

  addCameraShake({ trauma = 0.5 } = {}) {
    this.shake.trauma = clamp(this.shake.trauma + Number(trauma), 0, 1);
    return { trauma: Number(this.shake.trauma.toFixed(3)) };
  }

  step({ dt = 1 / 60, gravity = -9.81 } = {}) {
    const stepDt = clamp(Number(dt), 0.001, 0.25);
    let alive = 0;
    for (let i = 0; i < this.maxParticles; i++) {
      if (this.life[i] <= 0) continue;
      this.life[i] -= stepDt;
      if (this.life[i] <= 0) {
        this.life[i] = 0;
        continue;
      }
      this.vh[i] += gravity * stepDt;
      this.x[i] += this.vx[i] * stepDt;
      this.y[i] += this.vy[i] * stepDt;
      this.h[i] = Math.max(0, this.h[i] + this.vh[i] * stepDt);
      alive++;
    }
    this.activeCount = alive;

    if (this.shake.trauma > 0) {
      const mag = this.shake.trauma * this.shake.trauma * 0.45;
      this.shake.offsetX = Number(((this.rng.next() * 2 - 1) * mag).toFixed(4));
      this.shake.offsetY = Number(((this.rng.next() * 2 - 1) * mag).toFixed(4));
      this.shake.offsetH = Number(((this.rng.next() * 2 - 1) * mag).toFixed(4));
      this.shake.trauma = Math.max(0, this.shake.trauma - stepDt * 1.8);
    } else {
      this.shake.offsetX = 0; this.shake.offsetY = 0; this.shake.offsetH = 0;
    }

    return { activeParticles: alive, decals: this.decals.length, shake: { ...this.shake } };
  }

  _recount() {
    let c = 0;
    for (let i = 0; i < this.maxParticles; i++) if (this.life[i] > 0) c++;
    this.activeCount = c;
  }
}
