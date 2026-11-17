// RatCore Module [anim] — Скелет, 2-костная аналитическая IK (Закон косинусов), ключевые кадры и Verlet-цепь (Уровень 1 Opt-In)

import { clamp, lerp } from '../core/math.js';
import { RatCoreError } from '../core/seal.js';

// Аналитическая 2-костная инверсная кинематика в 2D/3D-плоскости (Закон косинусов)
export function solveTwoBoneIK({
  root = [0, 0],
  target = [1, 0],
  len1 = 1.0,
  len2 = 1.0,
  bendSign = 1,
} = {}) {
  const dx = Number(target[0]) - Number(root[0]);
  const dy = Number(target[1]) - Number(root[1]);
  const l1 = Math.max(1e-4, Number(len1));
  const l2 = Math.max(1e-4, Number(len2));
  const rawDist = Math.hypot(dx, dy);
  const maxReach = l1 + l2 - 1e-4;
  const minReach = Math.abs(l1 - l2) + 1e-4;
  const dist = clamp(rawDist, minReach, maxReach);

  const baseAngle = Math.atan2(dy, dx);
  const cosA = clamp((l1 * l1 + dist * dist - l2 * l2) / (2 * l1 * dist), -1, 1);
  const cosB = clamp((l1 * l1 + l2 * l2 - dist * dist) / (2 * l1 * l2), -1, 1);
  const sign = bendSign < 0 ? -1 : 1;

  const shoulderAngle = baseAngle + sign * Math.acos(cosA);
  const elbowAngle = Math.PI - Math.acos(cosB);
  const joint = [
    Number((root[0] + Math.cos(shoulderAngle) * l1).toFixed(4)),
    Number((root[1] + Math.sin(shoulderAngle) * l1).toFixed(4)),
  ];
  const end = [
    Number((joint[0] + Math.cos(shoulderAngle - sign * elbowAngle) * l2).toFixed(4)),
    Number((joint[1] + Math.sin(shoulderAngle - sign * elbowAngle) * l2).toFixed(4)),
  ];

  return {
    reachable: rawDist <= l1 + l2 && rawDist >= Math.abs(l1 - l2),
    shoulderAngleRad: Number(shoulderAngle.toFixed(4)),
    elbowBendRad: Number(elbowAngle.toFixed(4)),
    joint,
    end,
  };
}

export class AnimationSystem {
  constructor() {
    this.clips = new Map();
    this.chains = new Map();
  }

  defineClip({ id = 'idle', durationSec = 1.0, loop = true, keyframes = [] } = {}) {
    if (!Array.isArray(keyframes) || keyframes.length < 2) {
      throw new RatCoreError('RC-104', 'Клип анимации требует минимум 2 кадра (keyframes)', 'Передай [{ t: 0, value: 0 }, { t: 1, value: 1 }].');
    }
    const sorted = [...keyframes].sort((a, b) => a.t - b.t);
    this.clips.set(String(id), { id: String(id), durationSec: Math.max(0.05, Number(durationSec)), loop: Boolean(loop), keyframes: sorted });
    return { clipId: String(id), keyframes: sorted.length };
  }

  sampleClip({ id, timeSec = 0 } = {}) {
    const clip = this.clips.get(id);
    if (!clip) throw new RatCoreError('RC-104', `Клип "${id}" не найден`, 'Создай клип через anim.defineClip().');
    let t = Number(timeSec);
    if (clip.loop) t = ((t % clip.durationSec) + clip.durationSec) % clip.durationSec;
    else t = clamp(t, 0, clip.durationSec);
    const kfs = clip.keyframes;
    let a = kfs[0];
    let b = kfs[kfs.length - 1];
    for (let i = 0; i < kfs.length - 1; i++) {
      if (t >= kfs[i].t && t <= kfs[i + 1].t) {
        a = kfs[i];
        b = kfs[i + 1];
        break;
      }
    }
    const span = Math.max(1e-6, b.t - a.t);
    const alpha = clamp((t - a.t) / span, 0, 1);
    return {
      clipId: id,
      timeSec: Number(t.toFixed(4)),
      value: Number(lerp(Number(a.value ?? 0), Number(b.value ?? 0), alpha).toFixed(4)),
    };
  }

  createVerletChain({ id = 'cape', nodes = 6, segmentLen = 0.5, origin = [0, 0, 3] } = {}) {
    const count = clamp(Number(nodes) | 0, 2, 32);
    const len = Math.max(0.05, Number(segmentLen));
    const pts = [];
    for (let i = 0; i < count; i++) {
      const p = [origin[0], origin[1], origin[2] - i * len];
      pts.push({ x: p[0], y: p[1], h: p[2], px: p[0], py: p[1], ph: p[2], pinned: i === 0 });
    }
    this.chains.set(String(id), { id: String(id), segmentLen: len, pts });
    return { chainId: String(id), nodes: count, segmentLen: len };
  }

  stepVerletChain({ id = 'cape', dt = 1 / 60, gravity = -9.81, windX = 0, iterations = 4 } = {}) {
    const chain = this.chains.get(id);
    if (!chain) throw new RatCoreError('RC-104', `Цепь Verlet "${id}" не найдена`, 'Создай цепь через anim.createVerletChain().');
    const dt2 = dt * dt;
    for (const p of chain.pts) {
      if (p.pinned) continue;
      const vx = (p.x - p.px) * 0.985;
      const vy = (p.y - p.py) * 0.985;
      const vh = (p.h - p.ph) * 0.985;
      p.px = p.x; p.py = p.y; p.ph = p.h;
      p.x += vx + windX * dt2;
      p.y += vy;
      p.h += vh + gravity * dt2;
    }
    for (let it = 0; it < iterations; it++) {
      for (let i = 0; i < chain.pts.length - 1; i++) {
        const a = chain.pts[i];
        const b = chain.pts[i + 1];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dh = b.h - a.h;
        const dist = Math.hypot(dx, dy, dh) || 1e-6;
        const diff = (dist - chain.segmentLen) / dist;
        if (a.pinned) {
          b.x -= dx * diff; b.y -= dy * diff; b.h -= dh * diff;
        } else {
          a.x += dx * diff * 0.5; a.y += dy * diff * 0.5; a.h += dh * diff * 0.5;
          b.x -= dx * diff * 0.5; b.y -= dy * diff * 0.5; b.h -= dh * diff * 0.5;
        }
      }
    }
    const tail = chain.pts[chain.pts.length - 1];
    return {
      chainId: id,
      nodes: chain.pts.length,
      tailPos: [Number(tail.x.toFixed(3)), Number(tail.y.toFixed(3)), Number(tail.h.toFixed(3))],
    };
  }
}
