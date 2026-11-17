// Сетевой планировщик приоритетов, AIMD-контроллер перегрузки (Token Bucket) и Circuit Breaker для маршрутов RatMes.
// Решает Head-of-Line Blocking: загрузка большого файла (bulk) никогда не тормозит короткое сообщение (high) или ACK (urgent).
// Использует только детерминированный PRNG (randFn) без Math.random().

export const PRIORITY_LEVELS = Object.freeze({
  urgent: 0, // ACK, control, typing, key rotation
  high: 1,   // текстовые сообщения, ответы
  normal: 2, // голосовые, картинки, мелкие файлы
  bulk: 3,   // крупные архивы и видео-чанки
});

// Автомат Circuit Breaker (CLOSED -> OPEN -> HALF_OPEN) на каждый маршрут сети
export class RouteCircuitBreaker {
  constructor({ failureThreshold = 3, openCooldownMs = 15000, halfOpenSuccesses = 2 } = {}) {
    this.failureThreshold = failureThreshold;
    this.openCooldownMs = openCooldownMs;
    this.halfOpenSuccesses = halfOpenSuccesses;
    this.circuits = new Map(); // key = `${network}:${routeId}`
  }

  _get(network, routeId) {
    const key = `${network}:${routeId || 'direct'}`;
    let c = this.circuits.get(key);
    if (!c) {
      c = {
        key,
        network,
        routeId: routeId || 'direct',
        state: 'CLOSED',
        consecutiveFailures: 0,
        halfOpenSuccessCount: 0,
        openedAt: 0,
        totalSuccesses: 0,
        totalFailures: 0,
        ewmaRttMs: 40,
        lastErrorCode: null,
      };
      this.circuits.set(key, c);
    }
    return c;
  }

  canPass(network, routeId, now = Date.now()) {
    const c = this._get(network, routeId);
    if (c.state === 'CLOSED') return { allowed: true, state: c.state };
    if (c.state === 'OPEN') {
      if (now - c.openedAt >= this.openCooldownMs) {
        c.state = 'HALF_OPEN';
        c.halfOpenSuccessCount = 0;
        return { allowed: true, state: 'HALF_OPEN', probe: true };
      }
      return {
        allowed: false,
        state: 'OPEN',
        retryAfterMs: Math.max(0, this.openCooldownMs - (now - c.openedAt)),
      };
    }
    return { allowed: true, state: 'HALF_OPEN', probe: true };
  }

  recordSuccess(network, routeId, rttMs = 45) {
    const c = this._get(network, routeId);
    c.totalSuccesses += 1;
    c.consecutiveFailures = 0;
    c.lastErrorCode = null;
    // EWMA (alpha = 0.25)
    c.ewmaRttMs = Number((c.ewmaRttMs * 0.75 + Math.max(1, rttMs) * 0.25).toFixed(2));
    if (c.state === 'HALF_OPEN') {
      c.halfOpenSuccessCount += 1;
      if (c.halfOpenSuccessCount >= this.halfOpenSuccesses) {
        c.state = 'CLOSED';
        c.halfOpenSuccessCount = 0;
      }
    }
    return { ...c };
  }

  recordFailure(network, routeId, errorCode = 'RM-302', now = Date.now()) {
    const c = this._get(network, routeId);
    c.totalFailures += 1;
    c.consecutiveFailures += 1;
    c.lastErrorCode = errorCode;
    let tripped = false;
    if (c.state === 'HALF_OPEN' || c.consecutiveFailures >= this.failureThreshold) {
      c.state = 'OPEN';
      c.openedAt = now;
      c.halfOpenSuccessCount = 0;
      tripped = true;
    }
    return { ...c, tripped };
  }

  reset(network, routeId) {
    const c = this._get(network, routeId);
    c.state = 'CLOSED';
    c.consecutiveFailures = 0;
    c.halfOpenSuccessCount = 0;
    c.lastErrorCode = null;
    return { ...c };
  }

  snapshot() {
    return Array.from(this.circuits.values()).map((c) => ({ ...c }));
  }
}

// AIMD контроллер окна + Token Bucket на каждый мессенджер (защита от 429 и штормов)
export class CongestionController {
  constructor() {
    this.buckets = new Map(); // network -> { cwnd, ssthresh, maxCwnd, tokens, capacity, refillPerSec, lastRefillTs, inflight }
  }

  _get(network) {
    let b = this.buckets.get(network);
    if (!b) {
      const cap = network === 'ratmes' ? 40 : 12;
      b = {
        network,
        cwnd: 4,
        ssthresh: 16,
        maxCwnd: cap,
        tokens: cap,
        capacity: cap,
        refillPerSec: network === 'ratmes' ? 20 : 5,
        lastRefillTs: Date.now(),
        inflight: 0,
        throttledCount: 0,
      };
      this.buckets.set(network, b);
    }
    return b;
  }

  tryAcquire(network, cost = 1, now = Date.now()) {
    const b = this._get(network);
    const dtSec = Math.max(0, (now - b.lastRefillTs) / 1000);
    b.tokens = Math.min(b.capacity, b.tokens + dtSec * b.refillPerSec);
    b.lastRefillTs = now;

    if (b.inflight >= Math.floor(b.cwnd) || b.tokens < cost) {
      b.throttledCount += 1;
      return { allowed: false, cwnd: b.cwnd, tokens: Number(b.tokens.toFixed(2)), inflight: b.inflight };
    }
    b.tokens -= cost;
    b.inflight += 1;
    return { allowed: true, cwnd: b.cwnd, tokens: Number(b.tokens.toFixed(2)), inflight: b.inflight };
  }

  onAck(network) {
    const b = this._get(network);
    b.inflight = Math.max(0, b.inflight - 1);
    // Slow-start до ssthresh, затем аддитивное увеличение (AIMD)
    if (b.cwnd < b.ssthresh) {
      b.cwnd = Math.min(b.maxCwnd, b.cwnd + 1);
    } else {
      b.cwnd = Math.min(b.maxCwnd, Number((b.cwnd + 1 / Math.max(1, b.cwnd)).toFixed(3)));
    }
    return { cwnd: b.cwnd, ssthresh: b.ssthresh };
  }

  onCongestion(network) {
    const b = this._get(network);
    b.inflight = Math.max(0, b.inflight - 1);
    // Мультипликативное уменьшение вдвое
    b.ssthresh = Math.max(2, Math.floor(b.cwnd / 2));
    b.cwnd = Math.max(1, b.ssthresh);
    b.tokens = Math.min(b.tokens, 1);
    return { cwnd: b.cwnd, ssthresh: b.ssthresh };
  }

  snapshot() {
    return Array.from(this.buckets.values()).map((b) => ({
      network: b.network,
      cwnd: Number(b.cwnd.toFixed(2)),
      ssthresh: b.ssthresh,
      tokens: Number(b.tokens.toFixed(2)),
      inflight: b.inflight,
      throttledCount: b.throttledCount,
    }));
  }
}

// Планировщик приоритетных очередей и авто-прокачки Outbox с Full-Jitter экспоненциальным отступом
export class PriorityTransferScheduler {
  constructor({ randFn }) {
    this.rand = randFn || (() => 0.5);
    this.queues = [[], [], [], []]; // 0=urgent, 1=high, 2=normal, 3=bulk
    this.byId = new Map();
    this.breaker = new RouteCircuitBreaker();
    this.congestion = new CongestionController();
    this.telemetry = {
      enqueued: 0,
      dequeued: 0,
      retried: 0,
      bulkPreemptedByHigh: 0,
      circuitTrips: 0,
    };
  }

  schedule({ transferId, network, priority = 'normal', nextRunAt = 0, attempt = 0 }) {
    const lvl = PRIORITY_LEVELS[priority] ?? PRIORITY_LEVELS.normal;
    if (this.byId.has(transferId)) {
      const existing = this.byId.get(transferId);
      existing.nextRunAt = nextRunAt;
      existing.attempt = attempt;
      return existing;
    }
    const item = { transferId, network, priority, lvl, nextRunAt, attempt, addedAt: Date.now() };
    this.queues[lvl].push(item);
    this.byId.set(transferId, item);
    this.telemetry.enqueued += 1;
    if (lvl <= PRIORITY_LEVELS.high && this.queues[PRIORITY_LEVELS.bulk].length > 0) {
      this.telemetry.bulkPreemptedByHigh += 1;
    }
    return item;
  }

  remove(transferId) {
    const item = this.byId.get(transferId);
    if (!item) return false;
    this.byId.delete(transferId);
    const q = this.queues[item.lvl];
    const idx = q.indexOf(item);
    if (idx !== -1) q.splice(idx, 1);
    return true;
  }

  // Выбираем следующую задачу строго по приоритету (urgent -> high -> normal -> bulk)
  popReady(now = Date.now()) {
    for (let lvl = 0; lvl < this.queues.length; lvl += 1) {
      const q = this.queues[lvl];
      for (let i = 0; i < q.length; i += 1) {
        if (q[i].nextRunAt <= now) {
          const [item] = q.splice(i, 1);
          this.byId.delete(item.transferId);
          this.telemetry.dequeued += 1;
          return item;
        }
      }
    }
    return null;
  }

  computeBackoffMs(attempt, baseMs = 500, capMs = 30000) {
    const exp = Math.min(capMs, baseMs * (2 ** Math.min(attempt, 6)));
    // Full Jitter (AWS Architecture best practice) через детерминированный PRNG
    return Math.max(100, Math.round(this.rand() * exp));
  }

  rescheduleWithBackoff({ transferId, network, priority = 'normal', attempt = 1, now = Date.now() }) {
    const delayMs = this.computeBackoffMs(attempt);
    this.telemetry.retried += 1;
    return {
      delayMs,
      item: this.schedule({ transferId, network, priority, attempt, nextRunAt: now + delayMs }),
    };
  }

  pendingCounts() {
    return {
      urgent: this.queues[0].length,
      high: this.queues[1].length,
      normal: this.queues[2].length,
      bulk: this.queues[3].length,
      total: this.byId.size,
    };
  }

  status() {
    return {
      pending: this.pendingCounts(),
      telemetry: { ...this.telemetry },
      circuits: this.breaker.snapshot(),
      congestion: this.congestion.snapshot(),
    };
  }
}
