// RatCore Pack [pack:assist] — Умный наставник, дальтоническая коррекция, аудио-субтитры и режим 1 руки (F-163..F-165, A-108..A-109)
// Подключается строго по выбору (Zero-Cost Opt-In, RC-108 когда пакет выключен).

import { clamp } from '../core/math.js';
import { packRGBA, unpackRGBA } from '../assets/raster.js';

export const COLORBLIND_MODES = Object.freeze(['none', 'protanopia', 'deuteranopia', 'tritanopia']);

// Матрицы дальтонической компенсации RGB (F-164, адаптация Machado/Daltonize)
const DALTONIZE_MATRICES = {
  protanopia: [
    0.567, 0.433, 0.000,
    0.558, 0.442, 0.000,
    0.000, 0.242, 0.758,
  ],
  deuteranopia: [
    0.625, 0.375, 0.000,
    0.700, 0.300, 0.000,
    0.000, 0.300, 0.700,
  ],
  tritanopia: [
    0.950, 0.050, 0.000,
    0.000, 0.433, 0.567,
    0.000, 0.475, 0.525,
  ],
};

export class AccessibilityAssistSystem {
  constructor() {
    this.visual = { colorblind: 'none', highContrast: false, fontScale: 1.0 };
    this.subtitles = { enabled: false, showDirection: true, maxItems: 4 };
    this.oneHand = { enabled: false, dominantHand: 'right' };
    this.tracker = {
      stagnantSec: 0,
      lastGoalDist: null,
      lastPos: null,
      hintLevel: 0,
      goalId: null,
    };
  }

  // F-163, A-108: детектор застревания > 20 с с плавной 3-уровневой подсказкой без спойлеров
  trackPlayer({ playerPos = { x: 0, y: 0, h: 0 }, goalPos = { x: 10, y: 10, h: 0 }, activeGoalId = 'main', dt = 1.0 } = {}) {
    if (this.tracker.goalId !== activeGoalId) {
      this.tracker = { stagnantSec: 0, lastGoalDist: null, lastPos: null, hintLevel: 0, goalId: activeGoalId };
    }
    const dist = Math.hypot((goalPos.x ?? 0) - (playerPos.x ?? 0), (goalPos.y ?? 0) - (playerPos.y ?? 0));
    const stepDt = Math.max(0.01, Number(dt));

    if (this.tracker.lastGoalDist !== null) {
      const progress = this.tracker.lastGoalDist - dist;
      if (progress < 0.25) {
        this.tracker.stagnantSec += stepDt;
      } else {
        this.tracker.stagnantSec = Math.max(0, this.tracker.stagnantSec - stepDt * 2.5);
      }
    }
    this.tracker.lastGoalDist = dist;
    this.tracker.lastPos = { ...playerPos };

    // Индекс застревания 0..1 (достигает 1.0 на 30 сек)
    const stuckScore = clamp(this.tracker.stagnantSec / 30, 0, 1);
    let hintLevel = 0;
    let hintText = null;
    if (this.tracker.stagnantSec >= 40) {
      hintLevel = 3;
      hintText = `Маршрут к цели «${activeGoalId}»: двигайся в точку (${Math.round(goalPos.x)}; ${Math.round(goalPos.y)}), осталось ~${Math.round(dist)} м.`;
    } else if (this.tracker.stagnantSec >= 28) {
      hintLevel = 2;
      const dx = (goalPos.x ?? 0) - (playerPos.x ?? 0);
      const dy = (goalPos.y ?? 0) - (playerPos.y ?? 0);
      const dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'на восток →' : 'на запад ←') : (dy > 0 ? 'на север ↑' : 'на юг ↓');
      hintText = `Компас подсказывает направление ${dir} (${Math.round(dist)} м).`;
    } else if (this.tracker.stagnantSec >= 20) {
      hintLevel = 1;
      hintText = 'Осмотрись вокруг: рядом есть ориентир на пути к цели.';
    }
    this.tracker.hintLevel = hintLevel;

    return {
      activeGoalId,
      distToGoal: Number(dist.toFixed(2)),
      stagnantSec: Number(this.tracker.stagnantSec.toFixed(2)),
      stuckScore: Number(stuckScore.toFixed(3)),
      hintLevel,
      hintText,
    };
  }

  setVisualMode({ colorblind = 'none', highContrast = false, fontScale = 1.0 } = {}) {
    this.visual = {
      colorblind: COLORBLIND_MODES.includes(colorblind) ? colorblind : 'none',
      highContrast: Boolean(highContrast),
      fontScale: clamp(Number(fontScale), 0.85, 2.0),
    };
    return { ...this.visual };
  }

  // Реальная коррекция RasterSurface по матрице дальтонизма (F-164) и повышенному контрасту
  transformSurface(surface) {
    if (!surface || (this.visual.colorblind === 'none' && !this.visual.highContrast)) {
      return { applied: 'none', pixelsProcessed: 0 };
    }
    const { pixels } = surface;
    const m = DALTONIZE_MATRICES[this.visual.colorblind] || null;
    const hc = this.visual.highContrast;

    for (let i = 0; i < pixels.length; i++) {
      let [r, g, b, a] = unpackRGBA(pixels[i]);
      if (m) {
        // Daltonization: симулируем потерю канала и сдвигаем ошибку в различимые каналы
        const sr = r * m[0] + g * m[1] + b * m[2];
        const sg = r * m[3] + g * m[4] + b * m[5];
        const sb = r * m[6] + g * m[7] + b * m[8];
        const er = r - sr;
        const eg = g - sg;
        const eb = b - sb;
        r = clamp(Math.round(r + 0.0 * er + 0.0 * eg + 0.0 * eb), 0, 255);
        g = clamp(Math.round(g + 0.7 * er + 1.0 * eg + 0.0 * eb), 0, 255);
        b = clamp(Math.round(b + 0.7 * er + 0.0 * eg + 1.0 * eb), 0, 255);
      }
      if (hc) {
        r = clamp(Math.round((r - 128) * 1.35 + 128), 0, 255);
        g = clamp(Math.round((g - 128) * 1.35 + 128), 0, 255);
        b = clamp(Math.round((b - 128) * 1.35 + 128), 0, 255);
      }
      pixels[i] = packRGBA(r, g, b, a);
    }
    return { applied: this.visual.colorblind, highContrast: hc, pixelsProcessed: pixels.length };
  }

  setAudioSubtitles({ enabled = true, showDirection = true, maxItems = 4 } = {}) {
    this.subtitles = {
      enabled: Boolean(enabled),
      showDirection: Boolean(showDirection),
      maxItems: clamp(Number(maxItems) | 0, 1, 8),
    };
    return { ...this.subtitles };
  }

  // F-165: перевод событий tools.hear в направленные экранные подписи («← Шаги слева»)
  formatAudioSubtitles({ listenerPos = { x: 0, y: 0 }, hearEvents = [] } = {}) {
    if (!this.subtitles.enabled) return { enabled: false, captions: [] };
    const captions = [];
    for (const ev of hearEvents.slice(0, this.subtitles.maxItems)) {
      const dx = (ev.x ?? 0) - (listenerPos.x ?? 0);
      const dy = (ev.y ?? 0) - (listenerPos.y ?? 0);
      const dist = Math.round(ev.distance ?? Math.hypot(dx, dy));
      let arrow = '•';
      let side = 'рядом';
      if (this.subtitles.showDirection && dist > 1) {
        if (Math.abs(dx) >= Math.abs(dy)) {
          arrow = dx < 0 ? '←' : '→';
          side = dx < 0 ? 'слева' : 'справа';
        } else {
          arrow = dy >= 0 ? '↑' : '↓';
          side = dy >= 0 ? 'впереди' : 'сзади';
        }
      }
      const label = ev.label || ev.kind || 'Звук';
      captions.push({
        text: `${arrow} ${label} ${side} (${dist} м)`,
        arrow,
        side,
        distanceM: dist,
        perceivedDb: ev.perceivedDb ?? 50,
      });
    }
    return { enabled: true, captions };
  }

  // A-109: эргономичная перестройка тач-управления под одну руку
  setOneHandMobile({ enabled = true, dominantHand = 'right' } = {}) {
    const hand = dominantHand === 'left' ? 'left' : 'right';
    this.oneHand = { enabled: Boolean(enabled), dominantHand: hand };
    const anchorX = hand === 'right' ? 0.78 : 0.22;
    return {
      ...this.oneHand,
      layout: {
        joystickCenter: { xPct: Math.round(anchorX * 100), yPct: 76 },
        primaryAction: { xPct: Math.round((hand === 'right' ? 0.88 : 0.12) * 100), yPct: 58 },
        secondaryAction: { xPct: Math.round((hand === 'right' ? 0.64 : 0.36) * 100), yPct: 64 },
        thumbReachRadiusPct: 34,
      },
    };
  }
}
