/* =============================================================================
   СЕКТОР «ПЕПЕЛ» — звук без единого аудиофайла
   -----------------------------------------------------------------------------
   Всё синтезируется в WebAudio: выстрелы (шум + фильтр + щелчок), гильзы,
   перезарядка, взрывы, шаги, попадания, радио-помехи, ветер. Панорама по
   углу, громкость по дистанции, лимит одновременных голосов (оптимизация).
   ============================================================================= */
(function (root) {
  'use strict';
  const SH2 = (root.SH2 = root.SH2 || {});

  class AudioEngine {
    constructor() {
      this.ctx = null;
      this.enabled = true;
      this.master = null;
      this.listeners = { x: 0, z: 0, yaw: 0 };
      this.voices = 0;
      this.maxVoices = 26;
      this.noise = null;
      this.musicNodes = null;
    }

    init() {
      if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
      const AC = root.AudioContext || root.webkitAudioContext;
      if (!AC) { this.enabled = false; return; }
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.55;
      this.master.connect(this.ctx.destination);
      // буфер белого шума — один на всю игру
      const len = this.ctx.sampleRate * 1.2;
      const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      this.noise = buf;
      this.startAmbience();
    }

    setEnabled(v) { this.enabled = v; if (this.master) this.master.gain.value = v ? 0.55 : 0; }
    setListener(x, z, yaw) { this.listeners.x = x; this.listeners.z = z; this.listeners.yaw = yaw; }

    _now() { return this.ctx ? this.ctx.currentTime : 0; }
    _budget() { return this.ctx && this.enabled && this.voices < this.maxVoices; }

    _pan(x, z) {
      const dx = (x || 0) - this.listeners.x, dz = (z || 0) - this.listeners.z;
      const dist = Math.hypot(dx, dz);
      // угол относительно взгляда
      const ang = Math.atan2(dx, dz) - this.listeners.yaw;
      const pan = Math.max(-1, Math.min(1, Math.sin(ang) * 0.9));
      const vol = 1 / (1 + dist * 0.045);
      return { pan, vol, dist };
    }

    _out(x, z) {
      const p = this._pan(x, z);
      const gain = this.ctx.createGain();
      gain.gain.value = p.vol;
      if (this.ctx.createStereoPanner) {
        const sp = this.ctx.createStereoPanner();
        sp.pan.value = p.pan;
        gain.connect(sp);
        sp.connect(this.master);
      } else gain.connect(this.master);
      return { node: gain, vol: p.vol, dist: p.dist };
    }

    _noiseBurst(dur, filterType, freq, q, gain, x, z, decay) {
      if (!this._budget()) return;
      const ctx = this.ctx, t = this._now();
      const out = this._out(x, z);
      const src = ctx.createBufferSource();
      src.buffer = this.noise;
      src.loop = true;
      const f = ctx.createBiquadFilter();
      f.type = filterType || 'lowpass';
      f.frequency.value = freq || 1200;
      f.Q.value = q || 1;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(gain || 0.4, t + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      src.connect(f); f.connect(g); g.connect(out.node);
      src.start(t); src.stop(t + dur + 0.02);
      if (decay) {
        f.frequency.setValueAtTime(freq, t);
        f.frequency.exponentialRampToValueAtTime(Math.max(90, freq * 0.18), t + dur);
      }
      this.voices++;
      src.onended = () => { this.voices--; };
    }

    _tone(freq, dur, gain, type, x, z, slideTo) {
      if (!this._budget()) return;
      const ctx = this.ctx, t = this._now();
      const out = this._out(x, z);
      const o = ctx.createOscillator();
      o.type = type || 'sine';
      o.frequency.setValueAtTime(freq, t);
      if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(gain || 0.2, t + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(out.node);
      o.start(t); o.stop(t + dur + 0.02);
      this.voices++;
      o.onended = () => { this.voices--; };
    }

    /* ------------------------------ оружие ------------------------------ */
    gunshot(kind, x, z, vol) {
      if (!this.ctx) return;
      const v = vol === undefined ? 1 : vol;
      switch (kind) {
        case 'pistol':
          this._noiseBurst(0.16, 'lowpass', 2200, 0.8, 0.42 * v, x, z, true);
          this._tone(180, 0.10, 0.22 * v, 'square', x, z, 70);
          break;
        case 'smg':
          this._noiseBurst(0.10, 'bandpass', 1800, 1.2, 0.30 * v, x, z, true);
          this._tone(240, 0.07, 0.14 * v, 'square', x, z, 110);
          break;
        case 'rifle':
          this._noiseBurst(0.19, 'lowpass', 2600, 0.9, 0.46 * v, x, z, true);
          this._tone(140, 0.13, 0.26 * v, 'sawtooth', x, z, 52);
          break;
        case 'shotgun':
          this._noiseBurst(0.30, 'lowpass', 1500, 0.7, 0.55 * v, x, z, true);
          this._tone(95, 0.20, 0.30 * v, 'square', x, z, 44);
          break;
        case 'dmr':
          this._noiseBurst(0.26, 'lowpass', 3000, 1.1, 0.5 * v, x, z, true);
          this._tone(120, 0.18, 0.3 * v, 'sawtooth', x, z, 40);
          break;
        default:
          this._noiseBurst(0.16, 'lowpass', 2000, 0.8, 0.4 * v, x, z, true);
      }
    }
    dryFire() { this._tone(900, 0.03, 0.10, 'square'); this._tone(1600, 0.02, 0.06, 'square'); }
    reload(x, z) { this._tone(420, 0.05, 0.12, 'square', x, z); setTimeout(() => this._tone(260, 0.06, 0.10, 'square', x, z), 140); setTimeout(() => this._tone(520, 0.04, 0.10, 'square', x, z), 320); }
    casingSfx() { this._tone(1700, 0.05, 0.05, 'triangle'); }
    footstep(x, z, vol) { this._noiseBurst(0.09, 'lowpass', 500, 0.8, 0.10 * (vol || 1), x, z, false); }
    hitmarker() { this._tone(1500, 0.045, 0.09, 'square'); this._tone(2100, 0.03, 0.06, 'sine'); }
    headshot() { this._tone(2400, 0.06, 0.12, 'sine', 0, 0); this._tone(1200, 0.09, 0.08, 'triangle'); }
    hurt() { this._noiseBurst(0.20, 'lowpass', 700, 1.2, 0.30, 0, 0, true); this._tone(90, 0.20, 0.18, 'sawtooth'); }
    explosion(x, z) {
      this._noiseBurst(0.85, 'lowpass', 900, 0.6, 0.8, x, z, true);
      this._tone(60, 0.7, 0.5, 'sine', x, z, 24);
      this._tone(110, 0.4, 0.3, 'square', x, z, 30);
    }
    throwGrenade(x, z) { this._noiseBurst(0.14, 'highpass', 900, 0.7, 0.16, x, z, false); }
    melee(x, z) { this._noiseBurst(0.12, 'bandpass', 700, 1.4, 0.24, x, z, true); }
    radio() { this._tone(680, 0.06, 0.05, 'square'); setTimeout(() => this._tone(940, 0.05, 0.04, 'square'), 90); }
    pickup() { this._tone(620, 0.09, 0.12, 'triangle'); setTimeout(() => this._tone(930, 0.11, 0.10, 'triangle'), 85); }
    objective() { this._tone(520, 0.12, 0.14, 'sine'); setTimeout(() => this._tone(780, 0.16, 0.12, 'sine'), 110); }
    missionComplete() {
      const seq = [523, 659, 784, 1046];
      seq.forEach((f, i) => setTimeout(() => this._tone(f, 0.42, 0.16, 'triangle'), i * 130));
    }
    missionFail() {
      const seq = [392, 330, 262];
      seq.forEach((f, i) => setTimeout(() => this._tone(f, 0.5, 0.16, 'sawtooth'), i * 190));
    }
    heartbeat() { this._tone(58, 0.16, 0.22, 'sine'); setTimeout(() => this._tone(48, 0.20, 0.16, 'sine'), 190); }

    /* ------------------------- фон: ветер и гул ------------------------- */
    startAmbience() {
      const ctx = this.ctx;
      const src = ctx.createBufferSource();
      src.buffer = this.noise;
      src.loop = true;
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = 380;
      const g = ctx.createGain();
      g.gain.value = 0.045;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.09;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.022;
      lfo.connect(lfoGain); lfoGain.connect(g.gain);
      src.connect(f); f.connect(g); g.connect(this.master);
      src.start();
      lfo.start();
      const drone = ctx.createOscillator();
      drone.type = 'sine';
      drone.frequency.value = 46;
      const dg = ctx.createGain();
      dg.gain.value = 0.035;
      drone.connect(dg); dg.connect(this.master);
      drone.start();
      this.musicNodes = { src, drone, g, dg };
    }

    setDanger(level) {
      if (!this.ctx || !this.musicNodes) return;
      const t = this._now();
      this.musicNodes.dg.gain.setTargetAtTime(0.03 + level * 0.05, t, 0.6);
    }
  }

  SH2.audio = { AudioEngine };
})(typeof window !== 'undefined' ? window : globalThis);
