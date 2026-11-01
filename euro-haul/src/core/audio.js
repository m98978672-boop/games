// Процедурный звук: двигатель, шины, ветер, дождь, клаксон и интерфейс. Без внешних файлов.
export class AudioSystem {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.volume = 0.7;
    this.started = false;
  }

  init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    const ctx = this.ctx;
    this.master = ctx.createGain();
    this.master.gain.value = this.volume;
    this.master.connect(ctx.destination);

    // Шум для шин, ветра и дождя.
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    this.noiseBuffer = buffer;

    this.engineGain = ctx.createGain();
    this.engineGain.gain.value = 0;
    this.engineFilter = ctx.createBiquadFilter();
    this.engineFilter.type = 'lowpass';
    this.engineFilter.frequency.value = 500;
    this.engineGain.connect(this.engineFilter);
    this.engineFilter.connect(this.master);

    this.osc1 = ctx.createOscillator();
    this.osc1.type = 'sawtooth';
    this.osc2 = ctx.createOscillator();
    this.osc2.type = 'square';
    this.osc1.connect(this.engineGain);
    const g2 = ctx.createGain();
    g2.gain.value = 0.3;
    this.osc2.connect(g2);
    g2.connect(this.engineGain);
    this.osc1.frequency.value = 60;
    this.osc2.frequency.value = 30;
    this.osc1.start();
    this.osc2.start();

    // Турбина.
    this.turboGain = ctx.createGain();
    this.turboGain.gain.value = 0;
    this.turbo = ctx.createOscillator();
    this.turbo.type = 'sine';
    this.turbo.frequency.value = 1800;
    this.turbo.connect(this.turboGain);
    this.turboGain.connect(this.master);
    this.turbo.start();

    // Шины / дорога.
    this.rollNoise = ctx.createBufferSource();
    this.rollNoise.buffer = buffer;
    this.rollNoise.loop = true;
    this.rollFilter = ctx.createBiquadFilter();
    this.rollFilter.type = 'bandpass';
    this.rollFilter.frequency.value = 320;
    this.rollFilter.Q.value = 0.7;
    this.rollGain = ctx.createGain();
    this.rollGain.gain.value = 0;
    this.rollNoise.connect(this.rollFilter);
    this.rollFilter.connect(this.rollGain);
    this.rollGain.connect(this.master);
    this.rollNoise.start();

    // Дождь.
    this.rainNoise = ctx.createBufferSource();
    this.rainNoise.buffer = buffer;
    this.rainNoise.loop = true;
    this.rainFilter = ctx.createBiquadFilter();
    this.rainFilter.type = 'highpass';
    this.rainFilter.frequency.value = 1400;
    this.rainGain = ctx.createGain();
    this.rainGain.gain.value = 0;
    this.rainNoise.connect(this.rainFilter);
    this.rainFilter.connect(this.rainGain);
    this.rainGain.connect(this.master);
    this.rainNoise.start();

    this.started = true;
  }

  setEnabled(on) {
    this.enabled = on;
    if (this.master) this.master.gain.value = on ? this.volume : 0;
  }

  setVolume(v) {
    this.volume = v;
    if (this.master && this.enabled) this.master.gain.value = v;
  }

  update({ rpm = 700, throttle = 0, speed = 0, rain = 0, engineOn = true, gear = 0 }) {
    if (!this.started || !this.enabled) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const rpmFactor = Math.max(0.15, rpm / 700);
    this.osc1.frequency.setTargetAtTime(32 * rpmFactor, t, 0.08);
    this.osc2.frequency.setTargetAtTime(16 * rpmFactor, t, 0.08);
    this.engineFilter.frequency.setTargetAtTime(260 + throttle * 900 + rpmFactor * 120, t, 0.1);
    this.engineGain.gain.setTargetAtTime(engineOn ? 0.045 + throttle * 0.075 : 0, t, 0.12);
    this.turboGain.gain.setTargetAtTime(engineOn && rpm > 1400 ? (rpm - 1400) / 1400 * 0.02 : 0, t, 0.2);
    this.turbo.frequency.setTargetAtTime(1200 + rpmFactor * 900, t, 0.2);
    const roll = Math.min(1, Math.abs(speed) / 28);
    this.rollGain.gain.setTargetAtTime(roll * 0.05, t, 0.2);
    this.rollFilter.frequency.setTargetAtTime(220 + roll * 420, t, 0.2);
    this.rainGain.gain.setTargetAtTime(rain * 0.08, t, 0.4);
    void gear;
  }

  honk() {
    if (!this.ctx || !this.enabled) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    for (const f of [370, 466]) {
      const o = ctx.createOscillator();
      o.type = 'square';
      o.frequency.value = f;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.09, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
      o.connect(g);
      g.connect(this.master);
      o.start(t);
      o.stop(t + 0.6);
    }
  }

  blip(freq = 660, dur = 0.08, type = 'sine', vol = 0.06) {
    if (!this.ctx || !this.enabled) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(this.master);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  click() {
    this.blip(880, 0.05, 'triangle', 0.035);
  }

  shift() {
    this.blip(220, 0.09, 'sawtooth', 0.03);
  }

  indicator() {
    this.blip(1200, 0.06, 'square', 0.025);
  }

  cash() {
    this.blip(880, 0.1, 'triangle', 0.05);
    setTimeout(() => this.blip(1320, 0.14, 'triangle', 0.05), 90);
  }

  alarm() {
    this.blip(520, 0.18, 'square', 0.05);
    setTimeout(() => this.blip(390, 0.22, 'square', 0.05), 200);
  }
}
