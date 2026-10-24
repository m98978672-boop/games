// ============================================================
//  Процедурный звук на WebAudio: прибой, ветер, шаги, подбор, еда.
//  Внешних файлов нет — всё синтезируется.
// ============================================================

export class Audio {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.ready = false;
    this.stepTimer = 0;
  }

  init() {
    if (this.ctx) return;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    this.ctx = new Ctx();

    this.master = this.ctx.createGain();
    this.master.gain.value = 0.55;
    this.master.connect(this.ctx.destination);

    // общий буфер шума
    const len = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.2;
    }
    this.noiseBuffer = buffer;

    // --- прибой ---
    const surf = this.ctx.createBufferSource();
    surf.buffer = buffer;
    surf.loop = true;
    const surfFilter = this.ctx.createBiquadFilter();
    surfFilter.type = 'lowpass';
    surfFilter.frequency.value = 620;
    this.surfGain = this.ctx.createGain();
    this.surfGain.gain.value = 0.16;
    surf.connect(surfFilter).connect(this.surfGain).connect(this.master);
    surf.start();

    // медленная волна громкости прибоя
    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 0.09;
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 0.09;
    lfo.connect(lfoGain).connect(this.surfGain.gain);
    lfo.start();

    // --- ветер ---
    const wind = this.ctx.createBufferSource();
    wind.buffer = buffer;
    wind.loop = true;
    wind.playbackRate.value = 0.6;
    const windFilter = this.ctx.createBiquadFilter();
    windFilter.type = 'bandpass';
    windFilter.frequency.value = 440;
    windFilter.Q.value = 0.7;
    this.windGain = this.ctx.createGain();
    this.windGain.gain.value = 0.05;
    wind.connect(windFilter).connect(this.windGain).connect(this.master);
    wind.start();

    this.ready = true;
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }

  _noiseBurst(duration, freq, q, gain, type = 'lowpass') {
    if (!this.ready) return;
    const t = this.ctx.currentTime;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    src.playbackRate.value = 0.8 + Math.random() * 0.5;
    const filter = this.ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = freq;
    filter.Q.value = q;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    src.connect(filter).connect(g).connect(this.master);
    src.start(t);
    src.stop(t + duration + 0.02);
  }

  _tone(freq, duration, gain = 0.12, type = 'sine', slideTo = null, delay = 0) {
    if (!this.ready) return;
    const t = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + duration);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(g).connect(this.master);
    osc.start(t);
    osc.stop(t + duration + 0.03);
  }

  step(surface = 'grass', running = false) {
    if (!this.ready) return;
    const vol = running ? 0.12 : 0.075;
    if (surface === 'water') {
      this._noiseBurst(0.22, 900 + Math.random() * 300, 1.2, vol * 1.1, 'bandpass');
    } else if (surface === 'sand') {
      this._noiseBurst(0.14, 700 + Math.random() * 200, 0.8, vol * 0.8);
    } else if (surface === 'rock') {
      this._noiseBurst(0.09, 1800 + Math.random() * 500, 1.4, vol * 0.7);
    } else {
      this._noiseBurst(0.13, 1100 + Math.random() * 400, 0.9, vol);
    }
  }

  pickup() {
    this._tone(660, 0.1, 0.07, 'triangle');
    this._tone(990, 0.14, 0.05, 'triangle', null, 0.055);
  }

  drink() {
    this._noiseBurst(0.12, 300, 2.0, 0.12, 'lowpass');
    this._tone(220, 0.16, 0.05, 'sine', 160, 0.06);
  }

  eat() {
    this._noiseBurst(0.1, 950, 1.6, 0.09, 'bandpass');
    this._noiseBurst(0.1, 700, 1.6, 0.07, 'bandpass');
  }

  hurt() {
    this._tone(180, 0.22, 0.1, 'sawtooth', 90);
    this._noiseBurst(0.18, 400, 0.7, 0.1);
  }

  uiClick() {
    this._tone(520, 0.06, 0.05, 'square');
  }

  setNight(n) {
    if (!this.ready) return;
    this.surfGain.gain.setTargetAtTime(0.13 + n * 0.05, this.ctx.currentTime, 0.5);
    this.windGain.gain.setTargetAtTime(0.045 + n * 0.03, this.ctx.currentTime, 0.5);
  }
}
