// Звук: синтез SFX по описаниям из data/audio.json (свободная лицензия — наш собственный синтез),
// позиционное затухание до ~1500 px, низкочастотный фильтр для далёкого боя, пул голосов.
export class Audio {
  constructor(cfg, settings) {
    this.cfg = cfg;
    this.settings = settings;
    this.ctx = null;
    this.master = null;
    this.sfxBus = null;
    this.musicBus = null;
    this.voices = 0;
    this.maxVoices = cfg.audio.voices || 24;
    this.listener = { x: 0, y: 0 };
    this.musicTimer = null;
    this.musicMode = null;
    this.enabled = true;
    this._noise = null;
  }

  // Браузер разрешает звук только после действия пользователя
  unlock() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) { this.enabled = false; return; }
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.settings.volume ?? 0.7;
    this.master.connect(this.ctx.destination);
    this.sfxBus = this.ctx.createGain();
    this.sfxBus.gain.value = 1;
    this.sfxBus.connect(this.master);
    this.musicBus = this.ctx.createGain();
    this.musicBus.gain.value = this.settings.music ?? 0.4;
    this.musicBus.connect(this.master);
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  setVolumes({ volume, music }) {
    if (volume != null) { this.settings.volume = volume; if (this.master) this.master.gain.value = volume; }
    if (music != null) { this.settings.music = music; if (this.musicBus) this.musicBus.gain.value = music; }
  }

  noiseBuffer(dur) {
    if (this._noise && this._noise.duration >= dur) return this._noise;
    const len = Math.ceil(this.ctx.sampleRate * Math.max(dur, 1.2));
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    this._noise = buf;
    return buf;
  }

  // Позиционное воспроизведение: чем дальше от центра камеры, тем тише и глуше
  play(name, x = null, y = null, muffle = 1) {
    if (!this.enabled || !this.ctx) return;
    const def = this.cfg.audio.events[name];
    if (!def) return;
    if (this.voices >= this.maxVoices) return;
    const maxD = this.cfg.audio.maxDistance || 1500;
    let gain = def.gain ?? 0.4;
    let cutoff = def.filter ?? 2000;
    // Стена между слушателем и источником: тише и глуше (низкочастотный фильтр).
    if (muffle < 1) {
      gain *= muffle;
      cutoff *= this.cfg.audio.muffleCutoffMult ?? 0.45;
    }
    if (x != null && y != null) {
      const d = Math.hypot(x - this.listener.x, y - this.listener.y);
      if (d > maxD) return;
      const k = 1 - d / maxD;
      gain *= 0.12 + 0.88 * k * k;
      cutoff = Math.max(240, cutoff * (0.35 + 0.65 * k));
    }
    const t0 = this.ctx.currentTime;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = cutoff;
    filter.Q.value = 0.7;
    filter.connect(this.sfxBus);

    const env = this.ctx.createGain();
    env.gain.setValueAtTime(0.0001, t0);
    env.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), t0 + 0.01);
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + def.dur);
    env.connect(filter);

    let src;
    if (def.synth === 'noise' || def.synth === 'mixed') {
      src = this.ctx.createBufferSource();
      src.buffer = this.noiseBuffer(def.dur);
      src.playbackRate.value = Math.min(2, Math.max(0.25, (def.freq || 1000) / 1000));
      const bp = this.ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = def.freq || 1000;
      bp.Q.value = 0.8;
      src.connect(bp);
      bp.connect(env);
      if (def.synth === 'mixed') {
        const osc = this.ctx.createOscillator();
        const og = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime((def.freq || 300) * 0.6, t0);
        osc.frequency.exponentialRampToValueAtTime(Math.max(40, (def.freq || 300) * 0.18), t0 + def.dur);
        og.gain.setValueAtTime(Math.max(0.0002, gain * 1.6), t0);
        og.gain.exponentialRampToValueAtTime(0.0001, t0 + def.dur);
        osc.connect(og);
        og.connect(filter);
        osc.start(t0); osc.stop(t0 + def.dur + 0.05);
      }
    } else {
      src = this.ctx.createOscillator();
      src.type = def.wave || 'square';
      const f = def.freq || 440;
      src.frequency.setValueAtTime(f, t0);
      if (def.slide) src.frequency.exponentialRampToValueAtTime(Math.max(30, f * def.slide), t0 + def.dur);
      src.connect(env);
    }
    this.voices++;
    src.onended = () => { this.voices = Math.max(0, this.voices - 1); };
    try { src.start(t0); src.stop(t0 + def.dur + 0.05); } catch (e) { this.voices = Math.max(0, this.voices - 1); }
  }

  // Фоновая музыка: редкие низкие ноты, никаких файлов
  music(mode) {
    if (!this.ctx || this.musicMode === mode) return;
    this.musicMode = mode;
    if (this.musicTimer) clearInterval(this.musicTimer);
    const m = this.cfg.audio.music[mode];
    if (!m) return;
    const beat = (m.beat || 4) * 1000;
    const note = () => {
      if (this.musicMode !== mode) return;
      const f = m.notes[Math.floor(Math.random() * m.notes.length)];
      const t0 = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(m.gain || 0.05, t0 + 0.9);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + beat / 1000 + 1.2);
      osc.connect(g); g.connect(this.musicBus);
      osc.start(t0); osc.stop(t0 + beat / 1000 + 1.4);
    };
    note();
    this.musicTimer = setInterval(note, beat);
  }

  stopMusic() {
    this.musicMode = null;
    if (this.musicTimer) clearInterval(this.musicTimer);
    this.musicTimer = null;
  }
}
