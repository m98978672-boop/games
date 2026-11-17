// RatCore Stage 4 — Многоядерный пул потоков под управлением CoreGovernor (Eco 40 % / Balanced 60 % / Turbo 75 % CPU, F-116..F-117, A-75..A-76)
// Работает на настоящих потоках ОС (node:worker_threads в Node.js 22) и на Web Workers (Blob Worker в браузере), 0 внешних зависимостей!

const WORKER_SCRIPT_BODY = `
function fnv1a32(u8) {
  let h = 0x811c9dc5;
  for (let i = 0; i < u8.length; i++) {
    h ^= u8[i];
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function executeTask(msg) {
  const { id, task, payload } = msg;
  const t0 = performance.now();
  let result = null;
  let transfer = [];

  if (task === 'hashChunk') {
    const u8 = payload instanceof Uint8Array ? payload : new Uint8Array(payload);
    result = { hash: fnv1a32(u8), bytes: u8.length };
  } else if (task === 'stepBatchPhysics') {
    const posY = new Float32Array(payload.posY);
    const velY = new Float32Array(payload.velY);
    const dt = payload.dt || (1 / 60);
    const g = payload.gravity || 9.81;
    for (let i = 0; i < posY.length; i++) {
      let v = velY[i] - g * dt;
      let y = posY[i] + v * dt;
      if (y < 0) { y = 0; v = -v * 0.4; }
      posY[i] = y;
      velY[i] = v;
    }
    result = { count: posY.length, posY: posY.buffer, velY: velY.buffer };
    transfer = [posY.buffer, velY.buffer];
  } else if (task === 'genTerrainStripe') {
    const { width, startY, rows, seed } = payload;
    const out = new Float32Array(width * rows);
    for (let r = 0; r < rows; r++) {
      const y = startY + r;
      for (let x = 0; x < width; x++) {
        const s = Math.sin((x + seed * 0.13) * 0.17) * Math.cos((y - seed * 0.07) * 0.19);
        out[r * width + x] = Number((s * 8 + 4).toFixed(3));
      }
    }
    result = { width, startY, rows, heights: out.buffer };
    transfer = [out.buffer];
  } else if (task === 'computeSum') {
    const arr = new Float32Array(payload);
    let sum = 0;
    for (let i = 0; i < arr.length; i++) sum += arr[i];
    result = { sum: Number(sum.toFixed(4)), count: arr.length };
  } else {
    throw new Error('Unknown worker task: ' + task);
  }
  return { id, ok: true, result, workerMs: Number((performance.now() - t0).toFixed(3)), transfer };
}
`;

const NODE_WORKER_SOURCE = `
const { parentPort } = require('node:worker_threads');
${WORKER_SCRIPT_BODY}
parentPort.on('message', (msg) => {
  try {
    const out = executeTask(msg);
    const { transfer, ...clean } = out;
    parentPort.postMessage(clean, transfer);
  } catch (err) {
    parentPort.postMessage({ id: msg.id, ok: false, error: String(err && err.message || err) });
  }
});
`;

const BROWSER_WORKER_SOURCE = `
${WORKER_SCRIPT_BODY}
self.onmessage = (e) => {
  const msg = e.data;
  try {
    const out = executeTask(msg);
    const { transfer, ...clean } = out;
    self.postMessage(clean, transfer);
  } catch (err) {
    self.postMessage({ id: msg.id, ok: false, error: String(err && err.message || err) });
  }
};
`;

const PRIORITY_ORDER = { P0: 0, P1: 1, P2: 2, P3: 3 };

export class RatCoreWorkerPool {
  constructor({ governor = null, maxWorkers = null } = {}) {
    this.governor = governor;
    this.maxWorkersOverride = maxWorkers;
    this.workers = []; // { id, handle, busy, tasksDone }
    this.pending = []; // { id, priority, task, payload, transfer, resolve, reject }
    this.inFlight = new Map();
    this.nextTaskId = 1;
    this.totalCompleted = 0;
    this.runtime = 'uninitialized';
    this._nodeWorkerCtor = null;
    this._blobUrl = null;
  }

  getTargetWorkerCount() {
    if (this.governor) {
      const g = this.governor.getStats();
      if (g.hidden || g.targetWorkers === 0) return 0;
      const base = Math.max(1, g.targetWorkers);
      return this.maxWorkersOverride ? Math.min(base, this.maxWorkersOverride) : base;
    }
    return this.maxWorkersOverride || 2;
  }

  async _ensureRuntime() {
    if (this.runtime !== 'uninitialized') return;
    const isNode = typeof process !== 'undefined' && Boolean(process.versions && process.versions.node);
    if (isNode) {
      const wt = await import('node:worker_threads');
      this._nodeWorkerCtor = wt.Worker;
      this.runtime = 'node-worker-threads';
    } else if (typeof Worker !== 'undefined' && typeof Blob !== 'undefined' && typeof URL !== 'undefined') {
      const blob = new Blob([BROWSER_WORKER_SOURCE], { type: 'application/javascript' });
      this._blobUrl = URL.createObjectURL(blob);
      this.runtime = 'browser-web-workers';
    } else {
      this.runtime = 'inline-fallback';
    }
  }

  async syncWithGovernor() {
    await this._ensureRuntime();
    const target = this.getTargetWorkerCount();

    // Масштабируем вниз (например, Eco 40 % или скрытие вкладки -> 0 потоков!)
    while (this.workers.length > target) {
      const w = this.workers.pop();
      if (w && w.handle && typeof w.handle.terminate === 'function') {
        await w.handle.terminate();
      }
    }

    // Масштабируем вверх до квоты CoreGovernor (напр. Turbo 75 % CPU)
    while (this.workers.length < target && this.runtime !== 'inline-fallback') {
      const idx = this.workers.length;
      const handle = this.runtime === 'node-worker-threads'
        ? new this._nodeWorkerCtor(NODE_WORKER_SOURCE, { eval: true })
        : new Worker(this._blobUrl);

      const slot = { id: idx, handle, busy: false, tasksDone: 0 };
      const onMessage = (msg) => {
        const job = this.inFlight.get(msg.id);
        this.inFlight.delete(msg.id);
        slot.busy = false;
        slot.tasksDone++;
        this.totalCompleted++;
        if (job) {
          if (msg.ok) job.resolve({ ...msg.result, workerId: slot.id, workerMs: msg.workerMs, runtime: this.runtime });
          else job.reject(new Error(msg.error || 'Worker task failed'));
        }
        this._drain();
      };
      const onError = (err) => {
        slot.busy = false;
        for (const [jid, job] of this.inFlight.entries()) {
          if (job.workerId === slot.id) {
            this.inFlight.delete(jid);
            job.reject(err);
          }
        }
        this._drain();
      };

      if (this.runtime === 'node-worker-threads') {
        handle.on('message', onMessage);
        handle.on('error', onError);
      } else {
        handle.onmessage = (e) => onMessage(e.data);
        handle.onerror = onError;
      }
      this.workers.push(slot);
    }

    return this.getStats();
  }

  // Постановка задачи с приоритетом P0..P3 и zero-copy Transferable буферами
  async dispatch({ task, payload, priority = 'P1', transfer = [] } = {}) {
    await this.syncWithGovernor();
    if (this.workers.length === 0) {
      return { skipped: true, reason: 'governor-zero-workers-or-hidden', runtime: this.runtime };
    }

    return new Promise((resolve, reject) => {
      const id = this.nextTaskId++;
      const prio = PRIORITY_ORDER[priority] ?? 1;
      this.pending.push({ id, prio, task, payload, transfer, resolve, reject });
      this.pending.sort((a, b) => a.prio - b.prio);
      this._drain();
    });
  }

  _drain() {
    for (const slot of this.workers) {
      if (slot.busy || this.pending.length === 0) continue;
      const job = this.pending.shift();
      slot.busy = true;
      this.inFlight.set(job.id, { ...job, workerId: slot.id });
      slot.handle.postMessage({ id: job.id, task: job.task, payload: job.payload }, job.transfer);
    }
  }

  async terminate() {
    for (const w of this.workers) {
      if (w.handle && typeof w.handle.terminate === 'function') {
        await w.handle.terminate();
      }
    }
    this.workers = [];
    if (this._blobUrl && typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') {
      URL.revokeObjectURL(this._blobUrl);
      this._blobUrl = null;
    }
    return { terminated: true };
  }

  getStats() {
    return {
      runtime: this.runtime,
      activeWorkers: this.workers.length,
      targetWorkers: this.getTargetWorkerCount(),
      busyWorkers: this.workers.filter((w) => w.busy).length,
      pendingTasks: this.pending.length,
      totalCompleted: this.totalCompleted,
      perWorkerCompleted: this.workers.map((w) => w.tasksDone),
    };
  }
}
