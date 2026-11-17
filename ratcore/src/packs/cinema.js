// RatCore Pack [pack:cinema] — Рельсы камеры с дуговой параметризацией, таймлапсы и авто-обложки 16:9 (F-140..F-142, A-94..A-95)
// Подключается строго по выбору (Zero-Cost Opt-In, RC-108 когда пакет выключен).

import { clamp, lerp } from '../core/math.js';
import { unpackRGBA } from '../assets/raster.js';
import { RatCoreError } from '../core/seal.js';

function catmullRom1D(p0, p1, p2, p3, t) {
  const t2 = t * t;
  const t3 = t2 * t;
  return 0.5 * (
    (2 * p1)
    + (-p0 + p2) * t
    + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2
    + (-p0 + 3 * p1 - 3 * p2 + p3) * t3
  );
}

function sampleCatmullRomPose(keyframes, u) {
  const n = keyframes.length;
  if (n === 1) return { ...keyframes[0] };
  const scaled = clamp(u, 0, 1) * (n - 1);
  const seg = Math.min(n - 2, Math.floor(scaled));
  const t = scaled - seg;
  const k0 = keyframes[Math.max(0, seg - 1)];
  const k1 = keyframes[seg];
  const k2 = keyframes[Math.min(n - 1, seg + 1)];
  const k3 = keyframes[Math.min(n - 1, seg + 2)];
  return {
    x: catmullRom1D(k0.x, k1.x, k2.x, k3.x, t),
    y: catmullRom1D(k0.y, k1.y, k2.y, k3.y, t),
    h: catmullRom1D(k0.h, k1.h, k2.h, k3.h, t),
    targetX: catmullRom1D(k0.targetX ?? 0, k1.targetX ?? 0, k2.targetX ?? 0, k3.targetX ?? 0, t),
    targetY: catmullRom1D(k0.targetY ?? 0, k1.targetY ?? 0, k2.targetY ?? 0, k3.targetY ?? 0, t),
    targetH: catmullRom1D(k0.targetH ?? 1, k1.targetH ?? 1, k2.targetH ?? 1, k3.targetH ?? 1, t),
    fovDeg: lerp(k1.fovDeg ?? 60, k2.fovDeg ?? 60, t),
  };
}

// Оценка композиции кадра по правилу третей, контрасту и непустоте (F-141)
export function scoreCoverComposition(surface, objectIdBuffer) {
  const { width, height, pixels } = surface;
  let lumSum = 0;
  let lumSqSum = 0;
  let fgTotal = 0;
  let thirdsHits = 0;

  const thirdXs = [width / 3, (2 * width) / 3];
  const thirdYs = [height / 3, (2 * height) / 3];
  const radiusSq = Math.pow(Math.min(width, height) * 0.16, 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const [r, g, b] = unpackRGBA(pixels[idx]);
      const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      lumSum += lum;
      lumSqSum += lum * lum;
      if (objectIdBuffer && objectIdBuffer[idx] > 0) {
        fgTotal++;
        for (let tx = 0; tx < 2; tx++) {
          for (let ty = 0; ty < 2; ty++) {
            const dx = x - thirdXs[tx];
            const dy = y - thirdYs[ty];
            if (dx * dx + dy * dy <= radiusSq) {
              thirdsHits++;
              tx = 2;
              break;
            }
          }
        }
      }
    }
  }

  const total = Math.max(1, width * height);
  const meanLum = lumSum / total;
  const stdContrast = Math.sqrt(Math.max(0, lumSqSum / total - meanLum * meanLum));
  const fillRatio = fgTotal / total;
  // Идеальная заполненность объекта на обложке ~18%..55%
  const fillScore = fillRatio < 0.02 ? 0 : (1 - Math.min(1, Math.abs(fillRatio - 0.34) / 0.34));
  const thirdsScore = fgTotal > 0 ? clamp((thirdsHits / fgTotal) * 2.2, 0, 1) : 0;
  const contrastScore = clamp(stdContrast * 3.2, 0, 1);
  const score = 0.42 * fillScore + 0.33 * thirdsScore + 0.25 * contrastScore;

  return {
    score: Number(score.toFixed(4)),
    fillRatio: Number(fillRatio.toFixed(4)),
    thirdsScore: Number(thirdsScore.toFixed(4)),
    contrast: Number(stdContrast.toFixed(4)),
  };
}

export class CinemaDirector {
  constructor() {
    this.tracks = new Map();
    this.activePlayback = null;
    this.timelapse = null;
    this.nextId = 1;
  }

  // Строит рельсу с дуговой параметризацией (F-140, A-94) — равномерная скорость камеры
  createTrack({ id, durationSec = 8, keyframes = [], subtitles = [], weatherEvents = [], samples = 96 } = {}) {
    if (!Array.isArray(keyframes) || keyframes.length < 2) {
      throw new RatCoreError('RC-104', 'Для рельсы камеры требуется минимум 2 ключевых кадра (keyframes)', 'Передай массив из >= 2 объектов { x, y, h, targetX, targetY, targetH }.');
    }
    const trackId = id || `track-${this.nextId++}`;
    const dur = Math.max(0.5, Number(durationSec));
    const nSamples = Math.max(16, Math.min(512, Number(samples) | 0));

    // Таблица кумулятивной длины дуги s(u)
    const arcTable = new Float32Array(nSamples + 1);
    let prev = sampleCatmullRomPose(keyframes, 0);
    let totalLen = 0;
    for (let i = 1; i <= nSamples; i++) {
      const u = i / nSamples;
      const cur = sampleCatmullRomPose(keyframes, u);
      const dist = Math.hypot(cur.x - prev.x, cur.y - prev.y, cur.h - prev.h);
      totalLen += dist;
      arcTable[i] = totalLen;
      prev = cur;
    }

    const track = {
      id: trackId,
      durationSec: dur,
      keyframes: keyframes.map((k) => ({ ...k })),
      subtitles: Array.isArray(subtitles) ? subtitles.map((s) => ({ ...s })) : [],
      weatherEvents: Array.isArray(weatherEvents) ? weatherEvents.map((w) => ({ ...w })) : [],
      arcTable,
      totalLength: Number(totalLen.toFixed(3)),
    };
    this.tracks.set(trackId, track);
    return { trackId, durationSec: dur, totalLength: track.totalLength, keyframeCount: keyframes.length };
  }

  // Бинарный поиск параметра u по заданной длине дуги s (F-140)
  _arcLengthToU(track, frac) {
    const targetS = clamp(frac, 0, 1) * track.totalLength;
    if (track.totalLength <= 1e-6) return clamp(frac, 0, 1);
    const tbl = track.arcTable;
    let lo = 0;
    let hi = tbl.length - 1;
    while (lo + 1 < hi) {
      const mid = (lo + hi) >> 1;
      if (tbl[mid] <= targetS) lo = mid;
      else hi = mid;
    }
    const segLen = tbl[hi] - tbl[lo];
    const localT = segLen > 1e-6 ? (targetS - tbl[lo]) / segLen : 0;
    return (lo + localT) / (tbl.length - 1);
  }

  seek({ trackId, timeSec = 0 } = {}) {
    const track = this.tracks.get(trackId);
    if (!track) throw new RatCoreError('RC-104', `Трек кат-сцены "${trackId}" не найден`, 'Создай трек через cutscene.createTrack().');
    const t = clamp(Number(timeSec), 0, track.durationSec);
    const frac = t / track.durationSec;
    const u = this._arcLengthToU(track, frac);
    const pose = sampleCatmullRomPose(track.keyframes, u);
    const subtitle = track.subtitles.find((s) => t >= s.fromSec && t <= s.toSec)?.text || null;
    const weatherEvent = [...track.weatherEvents].reverse().find((w) => t >= w.atSec) || null;
    return {
      trackId,
      timeSec: Number(t.toFixed(3)),
      progress: Number(frac.toFixed(4)),
      arcDistance: Number((frac * track.totalLength).toFixed(3)),
      camera: {
        x: Number(pose.x.toFixed(3)),
        y: Number(pose.y.toFixed(3)),
        h: Number(pose.h.toFixed(3)),
        targetX: Number(pose.targetX.toFixed(3)),
        targetY: Number(pose.targetY.toFixed(3)),
        targetH: Number(pose.targetH.toFixed(3)),
        fovDeg: Number(pose.fovDeg.toFixed(1)),
      },
      subtitle,
      weatherEvent,
      finished: t >= track.durationSec,
    };
  }

  play({ trackId, skippable = true, startSec = 0 } = {}) {
    const sample = this.seek({ trackId, timeSec: startSec });
    this.activePlayback = { trackId, timeSec: sample.timeSec, skippable: Boolean(skippable), playing: true };
    return { playing: true, skippable: this.activePlayback.skippable, ...sample };
  }

  // Съёмка таймлапса мира (F-142, A-95)
  timelapseStart({ everyTicks = 10, maxFrames = 450, orbitRadius = 14, orbitHeight = 8 } = {}) {
    this.timelapse = {
      active: true,
      everyTicks: Math.max(1, Number(everyTicks) | 0),
      maxFrames: Math.max(4, Math.min(900, Number(maxFrames) | 0)),
      orbitRadius: Number(orbitRadius),
      orbitHeight: Number(orbitHeight),
      frames: [],
      lastTick: -999999,
    };
    return { recording: true, everyTicks: this.timelapse.everyTicks, maxFrames: this.timelapse.maxFrames };
  }

  timelapseCapture({ tick = 0, renderAtCamera } = {}) {
    if (!this.timelapse || !this.timelapse.active) {
      throw new RatCoreError('RC-104', 'Запись таймлапса не запущена', 'Вызови cutscene.timelapseStart() перед съёмкой кадров.');
    }
    if (this.timelapse.frames.length >= this.timelapse.maxFrames) {
      return { captured: false, reason: 'maxFrames-reached', frameCount: this.timelapse.frames.length };
    }
    if (tick - this.timelapse.lastTick < this.timelapse.everyTicks) {
      return { captured: false, reason: 'interval-skip', frameCount: this.timelapse.frames.length };
    }
    const idx = this.timelapse.frames.length;
    const angle = (idx / Math.max(12, this.timelapse.maxFrames / 3)) * Math.PI * 2;
    const cam = {
      x: Math.cos(angle) * this.timelapse.orbitRadius,
      y: Math.sin(angle) * this.timelapse.orbitRadius,
      h: this.timelapse.orbitHeight,
      targetX: 0, targetY: 0, targetH: 1.5, fovDeg: 55,
    };
    const frame = typeof renderAtCamera === 'function' ? renderAtCamera(cam) : null;
    this.timelapse.frames.push({
      tick,
      camera: cam,
      nonEmptyRatio: frame ? Number(frame.nonEmptyRatio.toFixed(4)) : 0,
      width: frame?.surface?.width || 0,
      height: frame?.surface?.height || 0,
    });
    this.timelapse.lastTick = tick;
    return { captured: true, frameIndex: idx, frameCount: this.timelapse.frames.length };
  }

  timelapseFinish() {
    if (!this.timelapse) return { frames: 0, durationSecAt30Fps: 0 };
    this.timelapse.active = false;
    const count = this.timelapse.frames.length;
    return {
      finished: true,
      frames: count,
      durationSecAt30Fps: Number((count / 30).toFixed(2)),
      ticksSpan: count >= 2 ? this.timelapse.frames[count - 1].tick - this.timelapse.frames[0].tick : 0,
    };
  }

  // Автоподбор лучшего ракурса обложки 16:9 из 12 кандидатов по правилу третей и контрасту (F-141)
  autoCover({ target = { x: 0, y: 0, h: 1.5 }, radius = 12, candidates = 12, renderAtCamera } = {}) {
    if (typeof renderAtCamera !== 'function') {
      throw new RatCoreError('RC-104', 'Для autoCover требуется функция рендера кадра', 'Вызывай через tools.cutscene.autoCover().');
    }
    const count = Math.max(4, Math.min(24, Number(candidates) | 0));
    const scored = [];
    let best = null;
    let bestFrame = null;

    for (let i = 0; i < count; i++) {
      const az = (i / count) * Math.PI * 2 + 0.35;
      const elev = i % 3 === 0 ? 0.45 : (i % 3 === 1 ? 0.28 : 0.62);
      const dist = radius * (i % 2 === 0 ? 0.92 : 1.15);
      const cam = {
        x: target.x + Math.cos(az) * dist,
        y: target.y + Math.sin(az) * dist,
        h: target.h + Math.sin(elev) * dist,
        targetX: target.x,
        targetY: target.y,
        targetH: target.h,
        fovDeg: 52,
      };
      const frame = renderAtCamera(cam);
      const metrics = scoreCoverComposition(frame.surface, frame.objectIdBuffer);
      const item = { index: i, camera: cam, ...metrics };
      scored.push(item);
      if (!best || item.score > best.score) {
        best = item;
        bestFrame = frame;
      }
    }

    return {
      aspect: '16:9',
      candidatesEvaluated: count,
      bestCamera: best.camera,
      bestScore: best.score,
      metrics: { fillRatio: best.fillRatio, thirdsScore: best.thirdsScore, contrast: best.contrast },
      width: bestFrame.surface.width,
      height: bestFrame.surface.height,
      top3: [...scored].sort((a, b) => b.score - a.score).slice(0, 3).map((s) => ({ index: s.index, score: s.score })),
    };
  }
}
