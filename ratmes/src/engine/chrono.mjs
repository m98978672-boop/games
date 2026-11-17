// Трёхфазный движок времени RatMes: «Прошлое + Будущее + Сон, чтобы в будущем не уснуть».
// - Прошлое: матрица переходов Маркова + журнал отказов маршрутов + почасовая активность.
// - Будущее: предсказание топ-3 чатов + предполётный прогрев строго с Backpressure.
// - Сон: автомат ACTIVE -> COOLING -> HOUSEKEEPING -> DEEP_SLEEP + DAG-уборка + Timer Coalescing.

import { planDag } from '../core/ratcore-app.mjs';

export const SLEEP_PHASES = Object.freeze(['ACTIVE', 'COOLING', 'HOUSEKEEPING', 'DEEP_SLEEP']);

export class ChronoEngine {
  constructor({ clock } = {}) {
    this.clock = clock;
    this.phase = 'ACTIVE';
    this.lastActivityAt = Date.now();
    this.lastChatId = null;

    // Прошлое: матрица Маркова Map<fromChatId, Map<toChatId, count>>
    this.transitions = new Map();
    this.hourCounts = new Map(); // Map<hour, Map<chatId, count>>
    this.routeFailures = []; // последние 100 событий сбоев маршрутов

    // Backpressure условия (жёсткий тормоз для «Будущего»)
    this.backpressure = {
      batteryPct: 100,
      saveData: false,
      ramOverBudget: false,
      rateLimitedUntil: 0,
    };

    // Timer Coalescing: слияние таймеров в редкие сгруппированные импульсы
    this.pendingTimers = [];
    this.coalescedNextWakeAt = null;
    this.housekeepingRuns = 0;
  }

  touchActivity(chatId = null) {
    this.lastActivityAt = Date.now();
    if (this.phase !== 'ACTIVE') {
      this.phase = 'ACTIVE';
    }
    if (chatId) {
      this.recordChatSwitch(chatId);
    }
  }

  recordChatSwitch(toChatId, hourOfDay = new Date().getHours()) {
    if (this.lastChatId && this.lastChatId !== toChatId) {
      let row = this.transitions.get(this.lastChatId);
      if (!row) {
        row = new Map();
        this.transitions.set(this.lastChatId, row);
      }
      row.set(toChatId, (row.get(toChatId) || 0) + 1);
    }
    this.lastChatId = toChatId;

    let hRow = this.hourCounts.get(hourOfDay);
    if (!hRow) {
      hRow = new Map();
      this.hourCounts.set(hourOfDay, hRow);
    }
    hRow.set(toChatId, (hRow.get(toChatId) || 0) + 1);
  }

  recordRouteFailure({ network, routeId, code, rttMs = null }) {
    this.routeFailures.push({
      ts: Date.now(),
      network,
      routeId,
      code,
      rttMs,
    });
    if (this.routeFailures.length > 100) this.routeFailures.shift();
  }

  predictFuture({ currentChatId = this.lastChatId, hourOfDay = new Date().getHours(), topK = 3 } = {}) {
    const scores = new Map();

    // Вес 0.7 — переходы Маркова из текущего чата
    const row = currentChatId ? this.transitions.get(currentChatId) : null;
    if (row) {
      let sum = 0;
      for (const c of row.values()) sum += c;
      if (sum > 0) {
        for (const [chatId, count] of row.entries()) {
          scores.set(chatId, (scores.get(chatId) || 0) + (count / sum) * 0.7);
        }
      }
    }

    // Вес 0.3 — привычки по времени суток
    const hRow = this.hourCounts.get(hourOfDay);
    if (hRow) {
      let sum = 0;
      for (const c of hRow.values()) sum += c;
      if (sum > 0) {
        for (const [chatId, count] of hRow.entries()) {
          if (chatId === currentChatId) continue;
          scores.set(chatId, (scores.get(chatId) || 0) + (count / sum) * 0.3);
        }
      }
    }

    const sorted = Array.from(scores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, topK);

    return {
      candidates: sorted.map(([chatId]) => chatId),
      confidence: sorted.map(([, score]) => Number(score.toFixed(3))),
    };
  }

  setBackpressure(patch = {}) {
    Object.assign(this.backpressure, patch);
    return { ...this.backpressure };
  }

  isBackpressureActive() {
    const reasons = [];
    if (this.backpressure.batteryPct < 20) reasons.push(`battery=${this.backpressure.batteryPct}%`);
    if (this.backpressure.saveData) reasons.push('saveData=true');
    if (this.backpressure.ramOverBudget) reasons.push('ramOverBudget=true');
    if (Date.now() < this.backpressure.rateLimitedUntil) reasons.push('rateLimit429=active');
    return { active: reasons.length > 0, reasons };
  }

  setPhase(nextPhase) {
    if (!SLEEP_PHASES.includes(nextPhase)) {
      throw new Error(`Invalid sleep phase: ${nextPhase}`);
    }
    const prevPhase = this.phase;
    this.phase = nextPhase;
    return { prevPhase, phase: nextPhase };
  }

  evaluateIdleTransition(now = Date.now()) {
    const idleSec = (now - this.lastActivityAt) / 1000;
    if (idleSec >= 600 && this.phase !== 'DEEP_SLEEP') {
      return this.setPhase('DEEP_SLEEP');
    }
    if (idleSec >= 120 && this.phase === 'COOLING') {
      return this.setPhase('HOUSEKEEPING');
    }
    if (idleSec >= 30 && this.phase === 'ACTIVE') {
      return this.setPhase('COOLING');
    }
    return { prevPhase: this.phase, phase: this.phase, unchanged: true };
  }

  // Строгий DAG уборки в фазе HOUSEKEEPING (по мотивам pereplet-prototype/scheduler.mjs)
  async runHousekeeping(handlers = {}) {
    const started = performance.now();
    const dag = planDag([
      { id: 'flush-outbox', after: [] },
      { id: 'heal-vault-tails', after: ['flush-outbox'] },
      { id: 'sync-readable-txt', after: ['heal-vault-tails'] },
      { id: 'rotate-keys', after: ['sync-readable-txt'] },
      { id: 'evict-s3fifo', after: ['sync-readable-txt'] },
      { id: 'hibernate-cold-bridges', after: ['evict-s3fifo', 'rotate-keys'] },
    ]);

    const stepsRun = [];
    for (const step of dag) {
      const fn = handlers[step.id];
      const detail = fn ? await fn() : { skipped: true };
      stepsRun.push({ id: step.id, detail });
    }
    this.housekeepingRuns += 1;
    return {
      stepsRun,
      costMs: Number((performance.now() - started).toFixed(3)),
      runCount: this.housekeepingRuns,
    };
  }

  // Timer Coalescing: объединяем мелкие фоновые таймеры в один импульс
  registerTimer(name, intervalSec) {
    this.pendingTimers.push({ name, intervalSec });
  }

  coalesceTimers(wakeWindowSec = 120) {
    const count = this.pendingTimers.length;
    const minWindow = Math.max(30, wakeWindowSec);
    this.coalescedNextWakeAt = Date.now() + minWindow * 1000;
    const mergedNames = this.pendingTimers.map((t) => t.name);
    this.pendingTimers = [];
    return {
      timersMerged: count,
      mergedNames,
      wakeWindowSec: minWindow,
      nextWakeAt: this.coalescedNextWakeAt,
    };
  }

  status() {
    const bp = this.isBackpressureActive();
    return {
      phase: this.phase,
      idleSec: Number(((Date.now() - this.lastActivityAt) / 1000).toFixed(1)),
      lastChatId: this.lastChatId,
      prediction: this.predictFuture(),
      backpressure: { ...this.backpressure, ...bp },
      routeFailureCount: this.routeFailures.length,
      recentRouteFailures: this.routeFailures.slice(-5),
      housekeepingRuns: this.housekeepingRuns,
      coalescedNextWakeAt: this.coalescedNextWakeAt,
    };
  }
}
