// Облегчённый системный фундамент RatCore-App (10 системных веток без 3D/физики/вокселей).
// Полностью совместим с контрактом ratcore/SPEC.md (v0.4-draft), ratcore/BRIDGE.md (ratcore-bridge/1)
// и ratcore/COMPRESSION.md (HOT/WARM/COLD, Sleep & Catch-up, Deflate).
// Когда основной движок RatCore будет собран, сюда можно напрямую передать liveRatCore.

import { makeError } from './errors.mjs';

export const PROTOCOL_VERSION = 'ratcore-bridge/1';

// F-01 / mulberry32 — детерминированный PRNG без Math.random()
export function createPrng(seed = 20261116) {
  let a = (seed >>> 0) || 1;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// F-34 / F-47 — быстрый контент-хеш FNV-1a 32-bit для stateHash и контрольных сумм
export function fnv1aHex(input) {
  const str = typeof input === 'string' ? input : JSON.stringify(input);
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i += 1) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return `fnv1a:${hash.toString(16).padStart(8, '0')}`;
}

// Фиксированные часы с ограничением maxSteps (наследие pereplet-prototype/clock.mjs + RatCore core/clock)
export class FixedClock {
  constructor({ step = 1 / 30, maxSteps = 4 } = {}) {
    this.step = step;
    this.maxSteps = maxSteps;
    this.accumulator = 0;
    this.tick = 0;
    this.throttledCatchups = 0;
  }

  advance(dtSec, onStep) {
    if (!Number.isFinite(dtSec) || dtSec <= 0) return { steps: 0, throttled: false };
    this.accumulator += dtSec;
    let steps = 0;
    while (this.accumulator + 1e-9 >= this.step && steps < this.maxSteps) {
      this.accumulator -= this.step;
      this.tick += 1;
      steps += 1;
      if (onStep) onStep(this.step, this.tick);
    }
    const throttled = this.accumulator >= this.step;
    if (throttled) {
      this.throttledCatchups += 1;
      // Не сбрасываем весь хвост в ноль, но не даём бесконечного долга после долгого сна
      this.accumulator = Math.min(this.accumulator, this.step * this.maxSteps);
    }
    return { steps, throttled };
  }
}

// Топологический планировщик DAG без циклов (для фазы HOUSEKEEPING и конвейера задач)
export function planDag(tasks) {
  const map = new Map();
  for (const t of tasks) map.set(t.id, t);
  const visited = new Set();
  const visiting = new Set();
  const ordered = [];

  function visit(id) {
    if (visited.has(id)) return;
    if (visiting.has(id)) {
      throw new Error(`DAG cycle detected at task: ${id}`);
    }
    const task = map.get(id);
    if (!task) throw new Error(`Unknown DAG dependency: ${id}`);
    visiting.add(id);
    for (const dep of task.after || []) visit(dep);
    visiting.delete(id);
    visited.add(id);
    ordered.push(task);
  }

  for (const t of tasks) visit(t.id);
  return ordered;
}

// Встроенное сжатие Deflate без внешних зависимостей (node:zlib в Node.js, легкий RLE/UTF-8 фолбэк в браузере)
let cachedZlib = null;
async function getNodeZlib() {
  if (cachedZlib !== null) return cachedZlib;
  if (typeof process !== 'undefined' && process.versions?.node) {
    try {
      cachedZlib = await import('node:zlib');
      return cachedZlib;
    } catch {
      cachedZlib = false;
      return false;
    }
  }
  cachedZlib = false;
  return false;
}

export async function compressBytes(inputBytes) {
  const bytes = inputBytes instanceof Uint8Array ? inputBytes : new TextEncoder().encode(String(inputBytes));
  const zlib = await getNodeZlib();
  if (zlib && zlib.deflateRawSync) {
    const out = zlib.deflateRawSync(bytes);
    return { codec: 'deflate-raw', bytes: new Uint8Array(out), rawBytes: bytes.byteLength };
  }
  if (typeof CompressionStream === 'function') {
    const cs = new CompressionStream('deflate-raw');
    const writer = cs.writable.getWriter();
    writer.write(bytes);
    writer.close();
    const buf = await new Response(cs.readable).arrayBuffer();
    return { codec: 'deflate-raw', bytes: new Uint8Array(buf), rawBytes: bytes.byteLength };
  }
  return { codec: 'identity', bytes, rawBytes: bytes.byteLength };
}

export async function decompressBytes(compressedBytes, codec = 'deflate-raw') {
  if (codec === 'identity') return compressedBytes;
  const zlib = await getNodeZlib();
  if (zlib && zlib.inflateRawSync) {
    return new Uint8Array(zlib.inflateRawSync(compressedBytes));
  }
  if (typeof DecompressionStream === 'function') {
    const ds = new DecompressionStream('deflate-raw');
    const writer = ds.writable.getWriter();
    writer.write(compressedBytes);
    writer.close();
    const buf = await new Response(ds.readable).arrayBuffer();
    return new Uint8Array(buf);
  }
  return compressedBytes;
}

// Конверт протокола ratcore-bridge/1 (ratcore/BRIDGE.md §3)
export function makeBridgeEnvelope({ packetId, linkId, from, to, kind, tick, stateHash, payload }) {
  return {
    protocol: PROTOCOL_VERSION,
    packetId,
    linkId,
    from,
    to,
    kind,
    tick,
    stateHash,
    payload,
  };
}

// Русская плюрализация (RatCore tools.ui.i18n)
export function pluralRu(count, one, few, many) {
  const n = Math.abs(Math.trunc(count)) % 100;
  const n1 = n % 10;
  if (n > 10 && n < 20) return `${count} ${many}`;
  if (n1 > 1 && n1 < 5) return `${count} ${few}`;
  if (n1 === 1) return `${count} ${one}`;
  return `${count} ${many}`;
}

// Создание облегчённого фундамента RatCore-App (или обёртки над внешним живым RatCore)
export function createRatCoreApp({ seed = 20261116, externalRatCore = null, instanceId = 'ratcore-app-main' } = {}) {
  const clock = new FixedClock({ step: 1 / 30, maxSteps: 4 });
  const rand = createPrng(seed);
  const subscriptions = new Map();
  const snapshots = new Map();
  const links = new Map();
  const sleptRegions = new Map();
  const auditLog = [];
  const bugTickets = [];
  const synthRecipes = new Map([
    ['msg-sent', { osc: 'sine', freqHz: 660, durationMs: 65, gain: 0.08 }],
    ['msg-in', { osc: 'triangle', freqHz: 520, freqEndHz: 780, durationMs: 110, gain: 0.12 }],
    ['warn', { osc: 'sawtooth', freqHz: 240, durationMs: 140, gain: 0.07 }],
  ]);

  let seqPacket = 0;
  let seqSub = 0;
  let seqSnap = 0;
  let seqBug = 0;

  function emitEvent(type, payload) {
    const evt = { type, tick: clock.tick, ts: Date.now(), payload };
    for (const sub of subscriptions.values()) {
      if (sub.events.includes('*') || sub.events.includes(type)) {
        sub.queue.push(evt);
        if (sub.queue.length > 500) sub.queue.shift();
        if (sub.handler) {
          try { sub.handler(evt); } catch { /* изоляция подписчика */ }
        }
      }
    }
    return evt;
  }

  return {
    profile: 'RatCore-App',
    attachedExternalRatCore: Boolean(externalRatCore),
    instanceId,
    protocol: PROTOCOL_VERSION,
    systemBranches: Object.freeze([
      'core.clock', 'core.math', 'guard', 'bridge', 'stream',
      'save', 'watch', 'think', 'guess', 'ui', 'audio', 'test', 'comm', 'bugs',
    ]),
    clock,
    rand,
    fnv1aHex,
    planDag,
    compressBytes,
    decompressBytes,
    pluralRu,

    // Ветка 4: watch.*
    watch: {
      subscribe(eventsOrHandler, maybeHandler = null) {
        seqSub += 1;
        const id = `sub-${seqSub}`;
        const isFnFirst = typeof eventsOrHandler === 'function';
        const events = isFnFirst ? ['*'] : (Array.isArray(eventsOrHandler) ? eventsOrHandler : ['*']);
        const handler = isFnFirst ? eventsOrHandler : maybeHandler;
        subscriptions.set(id, { id, events, queue: [], handler });
        return id;
      },
      unsubscribe(id) {
        return subscriptions.delete(id);
      },
      poll(id, maxEvents = 50) {
        const sub = subscriptions.get(id);
        if (!sub) return [];
        return sub.queue.splice(0, maxEvents);
      },
      emit: emitEvent,
      snapshot(label, stateObj) {
        seqSnap += 1;
        const id = `snap-${seqSnap}`;
        const copy = structuredClone(stateObj);
        const stateHash = fnv1aHex(copy);
        snapshots.set(id, { id, label: label || id, tick: clock.tick, stateHash, state: copy });
        return { snapshotId: id, tick: clock.tick, stateHash };
      },
      diff(snapAId, snapBId) {
        const a = snapshots.get(snapAId);
        const b = snapshots.get(snapBId);
        if (!a || !b) return null;
        const changes = [];
        const keys = new Set([...Object.keys(a.state || {}), ...Object.keys(b.state || {})]);
        for (const k of keys) {
          const av = JSON.stringify(a.state?.[k]);
          const bv = JSON.stringify(b.state?.[k]);
          if (av !== bv) changes.push({ key: k, before: a.state?.[k], after: b.state?.[k] });
        }
        return { same: changes.length === 0, fromHash: a.stateHash, toHash: b.stateHash, changes };
      },
    },

    // Ветка 12: bridge.* (ratcore-bridge/1)
    bridge: {
      connect({ peerId, target = 'ratmes-peer', transport = 'inproc', allowGroups = ['*'] }) {
        const allowed = new Set(['inproc', 'worker', 'broadcast', 'ws', 'file']);
        if (!allowed.has(transport)) {
          return { ok: false, error: makeError('RC-602', `Неподдерживаемый транспорт: ${transport}`) };
        }
        const linkId = `lnk-${peerId}-${links.size + 1}`;
        const link = {
          linkId,
          peerId,
          target,
          transport,
          allowGroups,
          open: true,
          packetsSent: 0,
          packetsRecv: 0,
          lastStateHash: null,
          createdAt: Date.now(),
        };
        links.set(linkId, link);
        emitEvent('bridge.connected', { linkId, peerId, transport });
        return { ok: true, link };
      },
      wrapPacket(linkId, kind, payload, stateHash) {
        const link = links.get(linkId);
        if (!link || !link.open) {
          return { ok: false, error: makeError('RC-606', `Соединение ${linkId} закрыто или не найдено`) };
        }
        seqPacket += 1;
        link.packetsSent += 1;
        link.lastStateHash = stateHash;
        const envelope = makeBridgeEnvelope({
          packetId: `pkt-${String(seqPacket).padStart(5, '0')}`,
          linkId,
          from: instanceId,
          to: link.peerId,
          kind,
          tick: clock.tick,
          stateHash,
          payload,
        });
        return { ok: true, envelope };
      },
      checkDesync(linkId, localHash, remoteHash) {
        const link = links.get(linkId);
        if (!link || !link.open) {
          return { ok: false, error: makeError('RC-606', `Соединение ${linkId} закрыто`) };
        }
        const inSync = localHash === remoteHash;
        if (!inSync) {
          emitEvent('bridge.desync', { linkId, localHash, remoteHash });
        }
        return { ok: true, inSync, localHash, remoteHash };
      },
      listLinks() {
        return Array.from(links.values());
      },
      close(linkId) {
        const link = links.get(linkId);
        if (link) link.open = false;
        return Boolean(link);
      },
    },

    // Ветка 25: stream.* (Sleep & Catch-up 64B сводки + Deflate)
    stream: {
      sleepRegion(regionId, summary) {
        const compact = {
          regionId,
          lastTick: clock.tick,
          lastSeq: summary.lastSeq || 0,
          unread: summary.unread || 0,
          ramFreedMb: summary.ramFreedMb || 0,
          ts: Date.now(),
        };
        sleptRegions.set(regionId, compact);
        return { regionId, summaryBytes: 64, sleptAtTick: clock.tick, ramFreedMb: compact.ramFreedMb };
      },
      catchupRegion(regionId) {
        const prev = sleptRegions.get(regionId);
        if (!prev) return { regionId, wasSleeping: false, deltaTicks: 0, summary: null };
        sleptRegions.delete(regionId);
        return {
          regionId,
          wasSleeping: true,
          deltaTicks: Math.max(0, clock.tick - prev.lastTick),
          summary: prev,
        };
      },
      listSleeping() {
        return Array.from(sleptRegions.values());
      },
    },

    // Ветка 23: save.* (контрольная сумма F-97 + проверка целостности)
    save: {
      sealChecksum(obj) {
        const checksum = fnv1aHex(obj);
        return { schemaVersion: 1, checksum, data: obj };
      },
      verifyChecksum(packet) {
        if (!packet || typeof packet !== 'object' || !packet.checksum) {
          return { valid: false, error: makeError('RC-802', 'Отсутствует контрольная сумма пакета') };
        }
        const actual = fnv1aHex(packet.data);
        if (actual !== packet.checksum) {
          return { valid: false, error: makeError('RC-802', `Контрольная сумма не совпала (${actual} != ${packet.checksum})`) };
        }
        return { valid: true, checksum: actual };
      },
    },

    // Ветки 8, 9, 11, 22: аудит, баги, аудио-рецепты
    audio: {
      getRecipe(soundId) {
        return synthRecipes.get(soundId) || null;
      },
      defineSynth(soundId, recipe) {
        synthRecipes.set(soundId, Object.freeze({ ...recipe }));
        return soundId;
      },
    },
    audit: {
      record(entry) {
        const item = { ts: Date.now(), tick: clock.tick, ...entry };
        auditLog.push(item);
        if (auditLog.length > 500) auditLog.shift();
        emitEvent('guard.violation', item);
        return item;
      },
      list(limit = 50) {
        return auditLog.slice(-limit);
      },
    },
    bugs: {
      create(ticket) {
        seqBug += 1;
        const id = `RM-BUG-${String(seqBug).padStart(4, '0')}`;
        const item = { id, createdAt: new Date().toISOString(), tick: clock.tick, ...ticket };
        bugTickets.push(item);
        return item;
      },
      list() {
        return [...bugTickets];
      },
    },
  };
}
