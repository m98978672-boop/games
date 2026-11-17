// RatCore Core [input] — Биндинг/ремап клавиш, буфер нажатий и детерминированная запись/реплей ввода (A-60, Уровень 0 Core)

import { clamp } from './math.js';

const DEFAULT_BINDINGS = {
  moveForward: ['KeyW', 'ArrowUp'],
  moveBack: ['KeyS', 'ArrowDown'],
  moveLeft: ['KeyA', 'ArrowLeft'],
  moveRight: ['KeyD', 'ArrowRight'],
  fire: ['Space', 'Mouse0'],
  build: ['Digit1', 'KeyB'],
  companion: ['Digit2', 'KeyC'],
  radio: ['Digit3', 'KeyV'],
  interact: ['KeyE'],
  pause: ['Escape', 'KeyP'],
};

export class InputManager {
  constructor() {
    this.bindings = new Map();
    for (const [action, keys] of Object.entries(DEFAULT_BINDINGS)) {
      this.bindings.set(action, [...keys]);
    }
    this.pressedActions = new Set();
    this.bufferedActions = new Map(); // action -> expiresTick
    this.axis = { x: 0, y: 0, yaw: 0, pitch: 0 };
    this.recording = false;
    this.recordLog = []; // [{ tick, mask, axisX, axisY, yaw, actions }]
    this.bufferTicks = 6;
  }

  bind({ action, keys = [] } = {}) {
    const act = String(action || '').trim();
    if (!act) return { bound: false };
    const prev = new Set(this.bindings.get(act) || []);
    for (const k of keys) prev.add(String(k));
    this.bindings.set(act, [...prev]);
    return { bound: true, action: act, keys: this.bindings.get(act) };
  }

  remap({ action, keys = [] } = {}) {
    const act = String(action || '').trim();
    if (!act) return { remapped: false };
    const next = [...new Set((Array.isArray(keys) ? keys : [keys]).map(String))];
    this.bindings.set(act, next);
    return { remapped: true, action: act, keys: next };
  }

  resolveKeyToActions(keyCode) {
    const out = [];
    for (const [act, keys] of this.bindings) {
      if (keys.includes(keyCode)) out.push(act);
    }
    return out;
  }

  pushEvent({ action, keyCode, pressed = true, axisX, axisY, yaw, pitch, tick = 0 } = {}) {
    const actions = [];
    if (action) actions.push(String(action));
    if (keyCode) actions.push(...this.resolveKeyToActions(String(keyCode)));

    for (const act of actions) {
      if (pressed) {
        this.pressedActions.add(act);
        this.bufferedActions.set(act, (tick | 0) + this.bufferTicks);
      } else {
        this.pressedActions.delete(act);
      }
    }
    if (axisX !== undefined) this.axis.x = clamp(Number(axisX), -1, 1);
    if (axisY !== undefined) this.axis.y = clamp(Number(axisY), -1, 1);
    if (yaw !== undefined) this.axis.yaw = Number(yaw);
    if (pitch !== undefined) this.axis.pitch = clamp(Number(pitch), -1.5, 1.5);

    const frame = this.poll({ tick });
    if (this.recording) {
      this.recordLog.push({ tick: tick | 0, ...frame });
    }
    return frame;
  }

  consumeBuffered({ action, tick = 0 } = {}) {
    const exp = this.bufferedActions.get(String(action));
    if (exp !== undefined && (tick | 0) <= exp) {
      this.bufferedActions.delete(String(action));
      return { consumed: true, action: String(action) };
    }
    return { consumed: false, action: String(action) };
  }

  poll({ tick = 0 } = {}) {
    // Очистка протухшего буфера нажатий
    for (const [act, exp] of this.bufferedActions) {
      if ((tick | 0) > exp) this.bufferedActions.delete(act);
    }
    let mx = this.axis.x;
    let my = this.axis.y;
    if (this.pressedActions.has('moveRight')) mx += 1;
    if (this.pressedActions.has('moveLeft')) mx -= 1;
    if (this.pressedActions.has('moveForward')) my += 1;
    if (this.pressedActions.has('moveBack')) my -= 1;
    mx = clamp(mx, -1, 1);
    my = clamp(my, -1, 1);

    // Компактная битовая маска действий (совместима с 12-байтным пакетом net.encodeInput12)
    let buttons = 0;
    if (this.pressedActions.has('fire')) buttons |= 1 << 0;
    if (this.pressedActions.has('build')) buttons |= 1 << 1;
    if (this.pressedActions.has('companion')) buttons |= 1 << 2;
    if (this.pressedActions.has('radio')) buttons |= 1 << 3;
    if (this.pressedActions.has('interact')) buttons |= 1 << 4;

    return {
      tick: tick | 0,
      moveX: Number(mx.toFixed(3)),
      moveY: Number(my.toFixed(3)),
      yaw: Number(this.axis.yaw.toFixed(3)),
      pitch: Number(this.axis.pitch.toFixed(3)),
      buttons,
      activeActions: [...this.pressedActions],
      bufferedActions: [...this.bufferedActions.keys()],
    };
  }

  startRecord() {
    this.recording = true;
    this.recordLog = [];
    return { recording: true, frames: 0 };
  }

  stopRecord() {
    this.recording = false;
    return { recording: false, frames: this.recordLog.length, log: [...this.recordLog] };
  }

  replayAt({ tick = 0 } = {}) {
    const t = tick | 0;
    let best = null;
    for (const entry of this.recordLog) {
      if (entry.tick <= t) best = entry;
      else break;
    }
    return best
      ? { found: true, tick: t, frame: { ...best } }
      : { found: false, tick: t, frame: null };
  }

  getState() {
    return {
      mode: this.recording ? 'recording' : 'active',
      coalescedZeroLag: true,
      bindingsCount: this.bindings.size,
      activeActions: [...this.pressedActions],
      recordedFrames: this.recordLog.length,
    };
  }
}
