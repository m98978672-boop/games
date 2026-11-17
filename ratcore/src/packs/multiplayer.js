// RatCore Pack [pack:multiplayer] — Комнаты P2P/WS, 12-байтный ввод и Rollback Netcode (F-129..F-131, A-87..A-89)
// Подключается строго по выбору (Zero-Cost Opt-In, RC-108 когда пакет выключен).

import { clamp } from '../core/math.js';

// F-129: Ультра-компактный 12-байтный кадр ввода игрока (tick u32, peerId u16, buttons u16, moveX i16, moveY i16)
export function encodeInput12({ tick = 0, peerId = 0, buttons = 0, moveX = 0, moveY = 0 } = {}) {
  const buf = new Uint8Array(12);
  const dv = new DataView(buf.buffer);
  dv.setUint32(0, tick >>> 0, true);
  dv.setUint16(4, peerId & 0xffff, true);
  dv.setUint16(6, buttons & 0xffff, true);
  dv.setInt16(8, Math.round(clamp(Number(moveX), -1, 1) * 32767), true);
  dv.setInt16(10, Math.round(clamp(Number(moveY), -1, 1) * 32767), true);
  return buf;
}

export function decodeInput12(bytes) {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  return {
    tick: dv.getUint32(0, true),
    peerId: dv.getUint16(4, true),
    buttons: dv.getUint16(6, true),
    moveX: Number((dv.getInt16(8, true) / 32767).toFixed(4)),
    moveY: Number((dv.getInt16(10, true) / 32767).toFixed(4)),
  };
}

// A-87..A-89: Детерминированный Rollback Netcode с окном снимков и перепроигрыванием расхождений
export class MultiplayerSession {
  constructor() {
    this.rooms = new Map();
    this.stateHistory = new Map(); // tick -> cloned state
    this.inputsByTick = new Map(); // tick -> Map(peerId -> input)
    this.confirmedTick = 0;
    this.currentTick = 0;
    this.rollbacks = 0;
    this.rttSamplesMs = [];
  }

  createRoom({ roomId, maxPlayers = 4, tickRate = 30, rollbackWindow = 16 } = {}) {
    const id = String(roomId || `room_${this.rooms.size + 1}`);
    const room = {
      id,
      maxPlayers: clamp(Number(maxPlayers), 2, 64),
      tickRate: clamp(Number(tickRate), 10, 60),
      rollbackWindow: clamp(Number(rollbackWindow), 4, 60),
      peers: new Map(),
      createdAt: Date.now(),
    };
    this.rooms.set(id, room);
    return { roomId: id, maxPlayers: room.maxPlayers, tickRate: room.tickRate, rollbackWindow: room.rollbackWindow };
  }

  joinRoom({ roomId, peerId, name = 'Player' } = {}) {
    const room = this.rooms.get(roomId);
    if (!room) return { ok: false, reason: 'room-not-found' };
    if (room.peers.size >= room.maxPlayers) return { ok: false, reason: 'room-full' };
    const pid = Number(peerId ?? room.peers.size + 1);
    room.peers.set(pid, { peerId: pid, name: String(name), joinedAt: Date.now(), rttMs: 0 });
    return { ok: true, roomId, peerId: pid, peerCount: room.peers.size };
  }

  // Сохранить состояние мира на тике + локальный ввод
  commitTick({ tick, state, input } = {}) {
    const t = Number(tick ?? this.currentTick);
    this.currentTick = Math.max(this.currentTick, t);
    if (state !== undefined) {
      this.stateHistory.set(t, JSON.parse(JSON.stringify(state)));
      // Чистим историю старше 64 тиков
      for (const oldT of this.stateHistory.keys()) {
        if (oldT < t - 64) this.stateHistory.delete(oldT);
      }
    }
    if (input) {
      if (!this.inputsByTick.has(t)) this.inputsByTick.set(t, new Map());
      this.inputsByTick.get(t).set(input.peerId, input);
    }
    return { tick: t, historySize: this.stateHistory.size };
  }

  // Приём позднего удалённого ввода: если ввод расходится с предсказанием -> откат и перепроигрывание до currentTick!
  receiveRemoteInput({ frame12, simulateStep } = {}) {
    const inp = frame12 instanceof Uint8Array ? decodeInput12(frame12) : frame12;
    const t = inp.tick;
    if (!this.inputsByTick.has(t)) this.inputsByTick.set(t, new Map());
    const prev = this.inputsByTick.get(t).get(inp.peerId);
    const mismatch = !prev || prev.buttons !== inp.buttons || Math.abs(prev.moveX - inp.moveX) > 1e-3 || Math.abs(prev.moveY - inp.moveY) > 1e-3;
    this.inputsByTick.get(t).set(inp.peerId, inp);

    if (!mismatch || t >= this.currentTick || typeof simulateStep !== 'function') {
      return { rolledBack: false, tick: t, replayedTicks: 0, state: this.stateHistory.get(this.currentTick) || null };
    }

    const baseState = this.stateHistory.get(t);
    if (!baseState) {
      return { rolledBack: false, tick: t, reason: 'outside-rollback-window', replayedTicks: 0 };
    }

    this.rollbacks++;
    let simState = JSON.parse(JSON.stringify(baseState));
    let replayed = 0;
    for (let rt = t; rt <= this.currentTick; rt++) {
      const tickInputs = this.inputsByTick.get(rt) ? [...this.inputsByTick.get(rt).values()] : [];
      simState = simulateStep(simState, tickInputs, rt);
      this.stateHistory.set(rt, JSON.parse(JSON.stringify(simState)));
      replayed++;
    }
    this.confirmedTick = Math.max(this.confirmedTick, t);
    return { rolledBack: true, fromTick: t, toTick: this.currentTick, replayedTicks: replayed, totalRollbacks: this.rollbacks, state: simState };
  }

  recordRtt(rttMs) {
    this.rttSamplesMs.push(Math.max(0, Number(rttMs)));
    if (this.rttSamplesMs.length > 30) this.rttSamplesMs.shift();
    const avg = this.rttSamplesMs.reduce((a, b) => a + b, 0) / this.rttSamplesMs.length;
    const jitter = Math.sqrt(this.rttSamplesMs.reduce((s, x) => s + (x - avg) ** 2, 0) / this.rttSamplesMs.length);
    return { avgRttMs: Number(avg.toFixed(1)), jitterMs: Number(jitter.toFixed(1)) };
  }
}
