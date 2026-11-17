// Кэш S3-FIFO (Small S + Main M + Ghost G) + 3 яруса памяти RatCore (HOT / WARM / COLD, <= 2 мс/тик).
// Решает главную болезнь LRU в мессенджерах: случайный скролл каналов и фото-«однодневок»
// не вымывает из ОЗУ твои главные чаты!

export class S3FifoTieredCache {
  constructor({ smallCap = 6, mainCap = 24, ghostCap = 48, ramLimitMb = 180 } = {}) {
    this.smallCap = smallCap;
    this.mainCap = mainCap;
    this.ghostCap = ghostCap;
    this.ramLimitMb = ramLimitMb;

    // Узел: { key, kind, bytes, freq, value, queue: 'S'|'M', tier: 'HOT'|'WARM', touchedAt }
    this.smallQueue = [];
    this.mainQueue = [];
    this.ghostSet = []; // ключи недавно вытесненных (призрачная очередь G)
    this.entries = new Map();
    this.coldIndex = new Map(); // 0 байт полезной нагрузки в RAM, только метаданные COLD

    this.stats = {
      hits: 0,
      misses: 0,
      ghostPromotions: 0,
      oneHitRejected: 0,
      evictions: 0,
    };
  }

  get(key) {
    const entry = this.entries.get(key);
    if (!entry) {
      this.stats.misses += 1;
      return null;
    }
    this.stats.hits += 1;
    entry.freq = Math.min(3, entry.freq + 1);
    entry.touchedAt = Date.now();
    if (entry.queue === 'M') entry.tier = 'HOT';
    return entry.value;
  }

  admit(key, { kind = 'chat', bytes = 4096, value = null, forceHot = false } = {}) {
    const existing = this.entries.get(key);
    if (existing) {
      existing.freq = Math.min(3, existing.freq + 1);
      existing.bytes = bytes;
      if (value !== null) existing.value = value;
      existing.touchedAt = Date.now();
      if (forceHot && existing.queue === 'S') {
        this._moveSmallToMain(existing);
      }
      return { queue: existing.queue, tier: existing.tier, fromGhost: false };
    }

    this.coldIndex.delete(key);
    const ghostIdx = this.ghostSet.indexOf(key);
    const fromGhost = ghostIdx !== -1;
    if (fromGhost) {
      this.ghostSet.splice(ghostIdx, 1);
      this.stats.ghostPromotions += 1;
    }

    const goMain = fromGhost || forceHot;
    const entry = {
      key,
      kind,
      bytes,
      freq: goMain ? 1 : 0,
      value,
      queue: goMain ? 'M' : 'S',
      tier: goMain ? 'HOT' : 'WARM',
      touchedAt: Date.now(),
    };

    this.entries.set(key, entry);
    if (goMain) {
      this.mainQueue.push(entry);
    } else {
      this.smallQueue.push(entry);
    }
    this._enforceCaps();
    return { queue: entry.queue, tier: entry.tier, fromGhost };
  }

  evictTick({ budgetMs = 2, ramLimitMb = this.ramLimitMb } = {}) {
    const started = performance.now();
    let evictedCount = 0;

    while (
      (this.smallQueue.length > this.smallCap ||
        this.mainQueue.length > this.mainCap ||
        this.usedBytes() > ramLimitMb * 1024 * 1024) &&
      performance.now() - started < budgetMs
    ) {
      const removed = this._evictOne();
      if (!removed) break;
      evictedCount += 1;
    }

    return {
      evictedCount,
      elapsedMs: Number((performance.now() - started).toFixed(3)),
      ramMb: Number((this.usedBytes() / (1024 * 1024)).toFixed(3)),
    };
  }

  usedBytes() {
    let total = 0;
    for (const e of this.entries.values()) total += e.bytes;
    return total;
  }

  status() {
    let hotCount = 0;
    let warmCount = 0;
    for (const e of this.entries.values()) {
      if (e.tier === 'HOT') hotCount += 1;
      else warmCount += 1;
    }
    return {
      totalMb: Number((this.usedBytes() / (1024 * 1024)).toFixed(3)),
      ramLimitMb: this.ramLimitMb,
      queues: {
        smallS: this.smallQueue.length,
        mainM: this.mainQueue.length,
        ghostG: this.ghostSet.length,
      },
      tiers: {
        HOT: hotCount,
        WARM: warmCount,
        COLD: this.coldIndex.size,
      },
      stats: { ...this.stats },
    };
  }

  _moveSmallToMain(entry) {
    const idx = this.smallQueue.indexOf(entry);
    if (idx !== -1) this.smallQueue.splice(idx, 1);
    entry.queue = 'M';
    entry.tier = 'HOT';
    entry.freq = Math.max(1, entry.freq);
    this.mainQueue.push(entry);
  }

  _enforceCaps() {
    while (this.smallQueue.length > this.smallCap) {
      this._evictFromSmall();
    }
    while (this.mainQueue.length > this.mainCap) {
      this._evictFromMain();
    }
  }

  _evictOne() {
    if (this.smallQueue.length > 0 && (this.smallQueue.length >= this.smallCap || this.mainQueue.length === 0)) {
      return this._evictFromSmall();
    }
    if (this.mainQueue.length > 0) {
      return this._evictFromMain();
    }
    return false;
  }

  _evictFromSmall() {
    const candidate = this.smallQueue.shift();
    if (!candidate) return false;
    if (candidate.freq > 0) {
      // Пережил повторное обращение — достоин основной очереди M (HOT)
      candidate.freq = 0;
      candidate.queue = 'M';
      candidate.tier = 'HOT';
      this.mainQueue.push(candidate);
      if (this.mainQueue.length > this.mainCap) this._evictFromMain();
      return false;
    }
    // Однодневка (freq === 0) — вытесняем в COLD и запоминаем ключ в Ghost G
    this.entries.delete(candidate.key);
    this.coldIndex.set(candidate.key, { kind: candidate.kind, evictedAt: Date.now() });
    this._pushGhost(candidate.key);
    this.stats.oneHitRejected += 1;
    this.stats.evictions += 1;
    return true;
  }

  _evictFromMain() {
    let guard = this.mainQueue.length + 1;
    while (this.mainQueue.length > 0 && guard > 0) {
      guard -= 1;
      const candidate = this.mainQueue.shift();
      if (candidate.freq > 0) {
        candidate.freq -= 1;
        this.mainQueue.push(candidate);
      } else {
        this.entries.delete(candidate.key);
        this.coldIndex.set(candidate.key, { kind: candidate.kind, evictedAt: Date.now() });
        this._pushGhost(candidate.key);
        this.stats.evictions += 1;
        return true;
      }
    }
    return false;
  }

  _pushGhost(key) {
    const idx = this.ghostSet.indexOf(key);
    if (idx !== -1) this.ghostSet.splice(idx, 1);
    this.ghostSet.push(key);
    while (this.ghostSet.length > this.ghostCap) this.ghostSet.shift();
  }
}
