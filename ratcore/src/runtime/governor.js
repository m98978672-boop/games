// RatCore Runtime — CoreGovernor 75 % CPU, Power & Thermal Guard, Dynamic Resolution, Watchdog и Memory Sentinel
// Формулы F-115..F-120, F-171..F-181; алгоритмы A-79..A-80, A-115..A-123; коды RC-905..RC-907.

import { clamp } from '../core/math.js';

export const POWER_PROFILES = Object.freeze({
  eco: Object.freeze({ mode: 'eco', targetCpuPct: 40, maxWorkersRatio: 0.4 }),
  balanced: Object.freeze({ mode: 'balanced', targetCpuPct: 60, maxWorkersRatio: 0.6 }),
  turbo: Object.freeze({ mode: 'turbo', targetCpuPct: 75, maxWorkersRatio: 0.75 }),
});

export class CoreGovernor {
  constructor({ profile = 'turbo', targetFps = 60, logicalCores = 4 } = {}) {
    this.logicalCores = Math.max(1, Number(logicalCores || 4));
    this.targetFps = Math.max(15, Number(targetFps || 60));
    this.profile = POWER_PROFILES[profile] || POWER_PROFILES.turbo;
    this.hidden = false;

    // F-118: ПИ-регулятор бюджета времени на кадр
    this.frameBudgetMs = (1000 / this.targetFps) * (this.profile.targetCpuPct / 100);
    this.integralErr = 0;
    this.throttleLevel = 0; // 0 = нет троттлинга, 1 = пауза P3, 2 = пауза P3+P2
    this.frameHistoryMs = [];

    // Очереди приоритетов P0..P3
    this.queues = [[], [], [], []];

    // F-171: Dynamic Resolution Scaler
    this.dynRes = { enabled: true, scale: 1.0, minScale: 0.55, maxScale: 1.0 };

    // F-178..F-181: Memory Leak Sentinel
    this.memSamples = [];
    this.leakWarnings = [];

    // RC-906: Self-Healing Watchdog
    this.isolatedSubsystems = new Map();
  }

  setPowerProfile(mode) {
    this.profile = POWER_PROFILES[mode] || POWER_PROFILES.turbo;
    this.frameBudgetMs = (1000 / this.targetFps) * (this.profile.targetCpuPct / 100);
    return this.getStats();
  }

  setVisibilityHidden(hidden) {
    this.hidden = Boolean(hidden);
    return { hidden: this.hidden, effectiveWorkers: this.getWorkerTarget() };
  }

  // F-115: целевое число воркеров строго <= 75 % (или 40/60 % по профилю), 0 при скрытой вкладке
  getWorkerTarget() {
    if (this.hidden) return 0;
    return Math.max(1, Math.min(this.logicalCores, Math.floor(this.logicalCores * this.profile.maxWorkersRatio)));
  }

  enqueue(priority, name, fn) {
    const p = clamp(priority | 0, 0, 3);
    this.queues[p].push({ name: String(name || 'task'), fn });
  }

  // Безопасный запуск подсистемы с Self-Healing Watchdog (RC-906)
  runGuarded(subsystemName, fn) {
    if (this.isolatedSubsystems.has(subsystemName)) {
      return { ok: false, isolated: true, code: 'RC-906', reason: this.isolatedSubsystems.get(subsystemName) };
    }
    try {
      const result = fn();
      return { ok: true, isolated: false, result };
    } catch (err) {
      const msg = err && err.message ? err.message : String(err);
      this.isolatedSubsystems.set(subsystemName, msg);
      return { ok: false, isolated: true, code: 'RC-906', reason: msg };
    }
  }

  recoverSubsystem(subsystemName) {
    return this.isolatedSubsystems.delete(subsystemName);
  }

  // Исполнение кадра в пределах бюджета CoreGovernor + адаптация ПИ-регулятора и Dynamic Resolution
  executeFrame({ simulatedFrameMs = null } = {}) {
    const start = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const executed = [];
    const budget = this.hidden ? 1.0 : this.frameBudgetMs;

    for (let prio = 0; prio <= 3; prio++) {
      // При тепловом троттлинге защищаем P0 и P1
      if (this.throttleLevel >= 1 && prio === 3) break;
      if (this.throttleLevel >= 2 && prio >= 2) break;

      const q = this.queues[prio];
      while (q.length > 0) {
        const elapsed = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - start;
        if (prio > 0 && elapsed >= budget) break;
        const job = q.shift();
        const res = this.runGuarded(job.name, job.fn);
        executed.push({ name: job.name, prio, ok: res.ok });
      }
    }

    const actualMs = simulatedFrameMs !== null
      ? Number(simulatedFrameMs)
      : Math.max(0.01, (typeof performance !== 'undefined' ? performance.now() : Date.now()) - start);

    this._updateControllers(actualMs);
    return {
      executedCount: executed.length,
      executed,
      frameMs: Number(actualMs.toFixed(3)),
      budgetMs: Number(budget.toFixed(3)),
      throttleLevel: this.throttleLevel,
      dynResScale: Number(this.dynRes.scale.toFixed(3)),
      pending: this.queues.map((q) => q.length),
    };
  }

  _updateControllers(frameMs) {
    this.frameHistoryMs.push(frameMs);
    if (this.frameHistoryMs.length > 60) this.frameHistoryMs.shift();

    // F-118 / F-120: расчёт P95 и уровня теплового/нагрузочного троттлинга
    const sorted = [...this.frameHistoryMs].sort((a, b) => a - b);
    const p95 = sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))] || frameMs;
    const targetFrameMs = 1000 / this.targetFps;
    const utilRatio = frameMs / targetFrameMs;
    const targetRatio = this.profile.targetCpuPct / 100;

    const err = utilRatio - targetRatio;
    this.integralErr = clamp(this.integralErr + err * 0.1, -1, 1);

    if (p95 > targetFrameMs * 0.92 || utilRatio > 0.85) this.throttleLevel = 2;
    else if (p95 > targetFrameMs * 0.78 || utilRatio > targetRatio + 0.05) this.throttleLevel = 1;
    else this.throttleLevel = 0;

    // F-171: плавный Dynamic Resolution Scaler
    if (this.dynRes.enabled) {
      if (frameMs > targetFrameMs * 0.9) {
        this.dynRes.scale = clamp(this.dynRes.scale - 0.05, this.dynRes.minScale, this.dynRes.maxScale);
      } else if (frameMs < targetFrameMs * 0.65) {
        this.dynRes.scale = clamp(this.dynRes.scale + 0.025, this.dynRes.minScale, this.dynRes.maxScale);
      }
    }
  }

  // F-178..F-181: Memory Leak Sentinel (обнаруживает монотонный рост памяти)
  sampleMemory(activeEntities, usedBytes) {
    this.memSamples.push({ activeEntities, usedBytes });
    if (this.memSamples.length > 16) this.memSamples.shift();
    if (this.memSamples.length >= 6) {
      const first = this.memSamples[0];
      const last = this.memSamples[this.memSamples.length - 1];
      let strictlyGrowing = true;
      for (let i = 1; i < this.memSamples.length; i++) {
        if (this.memSamples[i].usedBytes <= this.memSamples[i - 1].usedBytes) {
          strictlyGrowing = false;
          break;
        }
      }
      if (strictlyGrowing && last.usedBytes > first.usedBytes * 1.35) {
        const warn = {
          code: 'RC-907',
          message: `Memory Leak Sentinel: непрерывный рост памяти (${first.usedBytes} -> ${last.usedBytes} Б)`,
          growthRatio: Number((last.usedBytes / Math.max(1, first.usedBytes)).toFixed(2)),
        };
        this.leakWarnings.push(warn);
        return warn;
      }
    }
    return null;
  }

  getStats() {
    const sorted = [...this.frameHistoryMs].sort((a, b) => a - b);
    const p95Ms = sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))] : 0;
    return {
      profile: this.profile,
      logicalCores: this.logicalCores,
      targetWorkers: this.getWorkerTarget(),
      hidden: this.hidden,
      frameBudgetMs: Number(this.frameBudgetMs.toFixed(2)),
      p95Ms: Number(p95Ms.toFixed(3)),
      throttleLevel: this.throttleLevel,
      dynRes: { ...this.dynRes, scale: Number(this.dynRes.scale.toFixed(3)) },
      isolatedSubsystems: [...this.isolatedSubsystems.keys()],
      leakWarnings: this.leakWarnings.length,
    };
  }
}
