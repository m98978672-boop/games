// RatCore Modules [audio + hear] — Процедурный синтез PCM-звуков (0 КБ ассетов) и 3D-слух ИИ с затуханием 1/r² (Уровень 1 Opt-In)

import { clamp, createRng } from '../core/math.js';

export const SOUND_PRESETS = Object.freeze({
  click: { freq: 720, duration: 0.05, wave: 'sine', decay: 28 },
  step: { freq: 140, duration: 0.09, wave: 'noise', decay: 18 },
  impact: { freq: 95, duration: 0.22, wave: 'noise', decay: 10 },
  shot: { freq: 240, duration: 0.18, wave: 'noise', decay: 14 },
  alarm: { freq: 880, duration: 0.35, wave: 'square', decay: 3 },
  engine: { freq: 68, duration: 0.3, wave: 'saw', decay: 1.5 },
});

// Процедурная генерация PCM Float32 буфера (работает в Node.js и Web Audio API, 0 КБ аудиофайлов!)
export function synthesizeSoundPCM({ preset = 'click', freq, duration, wave, decay, sampleRate = 22050, seed = 1 } = {}) {
  const base = SOUND_PRESETS[preset] || SOUND_PRESETS.click;
  const f0 = Number(freq ?? base.freq);
  const dur = clamp(Number(duration ?? base.duration), 0.01, 2.0);
  const wKind = wave || base.wave;
  const dec = Number(decay ?? base.decay);
  const n = Math.max(16, Math.floor(dur * sampleRate));
  const pcm = new Float32Array(n);
  const rng = createRng(seed);

  let peak = 0;
  let energy = 0;
  for (let i = 0; i < n; i++) {
    const t = i / sampleRate;
    const env = Math.exp(-dec * t);
    let s = 0;
    if (wKind === 'sine') s = Math.sin(2 * Math.PI * f0 * t);
    else if (wKind === 'square') s = Math.sin(2 * Math.PI * f0 * t) >= 0 ? 1 : -1;
    else if (wKind === 'saw') s = 2 * ((t * f0) % 1) - 1;
    else s = (rng.next() * 2 - 1) * 0.7 + Math.sin(2 * Math.PI * f0 * t * Math.exp(-4 * t)) * 0.3;

    const v = clamp(s * env, -1, 1);
    pcm[i] = v;
    const av = Math.abs(v);
    if (av > peak) peak = av;
    energy += v * v;
  }

  return {
    preset,
    sampleRate,
    samples: n,
    durationSec: dur,
    rms: Number(Math.sqrt(energy / n).toFixed(4)),
    peak: Number(peak.toFixed(4)),
    pcm,
  };
}

// 3D-акустическая сцена: события звука слышны ИИ через tools.hear.listen() с учётом расстояния и окклюзии
export class AcousticWorld {
  constructor() {
    this.events = [];
    this.nextId = 1;
  }

  emit({ kind = 'step', x = 0, y = 0, h = 0, loudnessDb = 70, sourceId = null, tick = 0, ttlTicks = 30 } = {}) {
    const ev = {
      id: `snd_${this.nextId++}`,
      kind: String(kind),
      x: Number(x),
      y: Number(y),
      h: Number(h),
      loudnessDb: clamp(Number(loudnessDb), 10, 140),
      sourceId,
      tick,
      expiresTick: tick + Math.max(1, ttlTicks | 0),
    };
    this.events.push(ev);
    if (this.events.length > 256) this.events.shift();
    return ev;
  }

  // Слух для ИИ-агента: ослабление по закону обратных квадратов 20*log10(d) + простая проверка рельефа
  listen({ x = 0, y = 0, h = 1.6, thresholdDb = 25, currentTick = 0, heightField = null } = {}) {
    const heard = [];
    for (const ev of this.events) {
      if (currentTick > ev.expiresTick) continue;
      const dist = Math.hypot(ev.x - x, ev.y - y, ev.h - h);
      const attenDb = dist > 1 ? 20 * Math.log10(dist) : 0;

      // Грубая проверка окклюзии холмом в средней точке
      let occlusionDb = 0;
      if (heightField && dist > 2) {
        const midX = (ev.x + x) * 0.5;
        const midY = (ev.y + y) * 0.5;
        const midH = (ev.h + h) * 0.5;
        const terrainMid = heightField.sampleHeight(midX, midY);
        if (terrainMid > midH + 0.5) occlusionDb = 12;
      }

      const perceivedDb = ev.loudnessDb - attenDb - occlusionDb;
      if (perceivedDb >= thresholdDb) {
        const az = ((Math.atan2(ev.x - x, ev.y - y) * 180) / Math.PI + 360) % 360;
        heard.push({
          id: ev.id,
          kind: ev.kind,
          sourceId: ev.sourceId,
          distance: Number(dist.toFixed(2)),
          azimuthDeg: Number(az.toFixed(1)),
          perceivedDb: Number(perceivedDb.toFixed(1)),
          occluded: occlusionDb > 0,
        });
      }
    }
    heard.sort((a, b) => b.perceivedDb - a.perceivedDb);
    return heard;
  }
}
