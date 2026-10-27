// ============================================================
//  Процедурный звук на WebAudio: прибой, ветер, шаги, подбор, еда.
//  Внешних файлов нет — всё синтезируется.
// ============================================================

const clampNum = (v, a, b) => Math.max(a, Math.min(b, v));

export class Audio {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.ready = false;
    this.stepTimer = 0;
    this.birdTimer = 3;
    this.cricketsGain = null;
    this.fireGain = null;
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

    // --- треск костра (громкость поднимается, когда игрок рядом) ---
    const fire = this.ctx.createBufferSource();
    fire.buffer = buffer;
    fire.loop = true;
    fire.playbackRate.value = 1.6;
    const fireFilter = this.ctx.createBiquadFilter();
    fireFilter.type = 'bandpass';
    fireFilter.frequency.value = 1500;
    fireFilter.Q.value = 0.6;
    this.fireGain = this.ctx.createGain();
    this.fireGain.gain.value = 0;
    fire.connect(fireFilter).connect(this.fireGain).connect(this.master);
    fire.start();

    // --- сверчки: узкий высокий шум с медленной пульсацией ---
    const crickets = this.ctx.createBufferSource();
    crickets.buffer = buffer;
    crickets.loop = true;
    crickets.playbackRate.value = 3.4;
    const cricketFilter = this.ctx.createBiquadFilter();
    cricketFilter.type = 'bandpass';
    cricketFilter.frequency.value = 4200;
    cricketFilter.Q.value = 8;
    this.cricketsGain = this.ctx.createGain();
    this.cricketsGain.gain.value = 0;
    crickets.connect(cricketFilter).connect(this.cricketsGain).connect(this.master);
    crickets.start();

    // --- тихий музыкальный фон: медленные аккорды ---
    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = 0.05;
    this.musicGain.connect(this.master);
    this.chordStep = 0;
    this.musicTimer = 0;

    this.ready = true;
  }

  /** Медленная «музыка»: три ноты, меняющиеся раз в несколько секунд */
  updateMusic(dt, night) {
    if (!this.ready) return;
    this.musicTimer -= dt;
    if (this.musicTimer > 0) return;
    this.musicTimer = 7 + Math.random() * 5;

    const roots = night ? [110, 98, 87, 123] : [147, 165, 131, 175];
    const root = roots[this.chordStep % roots.length];
    this.chordStep++;
    const now = this.ctx.currentTime;
    [1, 1.5, 2.0].forEach((mul, i) => {
      const osc = this.ctx.createOscillator();
      osc.type = i === 0 ? 'sine' : 'triangle';
      osc.frequency.value = root * mul;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(0.05, now + 1.2);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 6.5);
      osc.connect(g).connect(this.musicGain);
      osc.start(now);
      osc.stop(now + 7);
    });
  }

  /** Птицы днём, сверчки ночью, треск огня рядом */
  updateAmbience(dt, { night = 0, fire = 0 } = {}) {
    if (!this.ready) return;
    const now = this.ctx.currentTime;
    if (this.fireGain) this.fireGain.gain.setTargetAtTime(0.02 + fire * 0.14, now, 0.3);
    if (this.cricketsGain) this.cricketsGain.gain.setTargetAtTime(night * 0.02, now, 0.8);

    this.birdTimer -= dt;
    if (this.birdTimer <= 0) {
      this.birdTimer = 4 + Math.random() * 9;
      if (night < 0.4 && Math.random() < 0.75) this.birdCall();
    }
  }

  birdCall() {
    const base = 1800 + Math.random() * 1400;
    this._tone(base, 0.07, 0.03, 'sine', base * 1.5);
    this._tone(base * 1.2, 0.06, 0.022, 'sine', base * 1.8, 0.09);
    if (Math.random() < 0.4) this._tone(base * 0.9, 0.08, 0.02, 'sine', base * 1.3, 0.19);
  }

  /**
   * Звук из точки мира: панорама по направлению, громкость по расстоянию.
   * listener — { x, z, yaw } — позиция и поворот игрока.
   */
  playAt(name, { x = 0, z = 0, listener, gain = 1 } = {}) {
    if (!this.ready || !listener) return;
    const fn = this[name];
    if (typeof fn !== 'function') return;

    const dx = x - listener.x;
    const dz = z - listener.z;
    const dist = Math.hypot(dx, dz);
    if (dist > 45) return;

    const yaw = listener.yaw || 0;
    const rightX = Math.cos(yaw);
    const rightZ = -Math.sin(yaw);
    const pan = dist > 0.6 ? clampNum((dx * rightX + dz * rightZ) / dist, -1, 1) * 0.8 : 0;
    const vol = gain * Math.pow(Math.max(0, 1 - dist / 45), 1.6);

    this._pan = pan;
    this._vol = vol;
    try {
      fn.call(this);
    } finally {
      this._pan = 0;
      this._vol = 1;
    }
  }

  /** Выход звука: громкость и панорама текущего вызова */
  _out() {
    if (!this._pan && (this._vol === undefined || this._vol === 1)) return this.master;
    const g = this.ctx.createGain();
    g.gain.value = this._vol ?? 1;
    if (this._pan && this.ctx.createStereoPanner) {
      const panner = this.ctx.createStereoPanner();
      panner.pan.value = this._pan;
      g.connect(panner).connect(this.master);
    } else {
      g.connect(this.master);
    }
    return g;
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
    src.connect(filter).connect(g).connect(this._out());
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
    osc.connect(g).connect(this._out());
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

  /** Взмах инструментом: короткий шумовой «вжух» */
  swing() {
    this._noiseBurst(0.16, 1400, 1.4, 0.05, 'bandpass');
  }

  /** Топор по дереву */
  chop() {
    this._noiseBurst(0.11, 420, 1.1, 0.16);
    this._tone(150, 0.12, 0.09, 'square', 90);
  }

  /** Кирка по камню */
  mine() {
    this._noiseBurst(0.1, 2600, 1.8, 0.12, 'bandpass');
    this._tone(420, 0.07, 0.05, 'square', 300);
  }

  /** Плётка/кирка прошла мимо: только воздух */
  whoosh() {
    this._noiseBurst(0.14, 900 + Math.random() * 500, 1.6, 0.04, 'bandpass');
  }

  /** Ягоды: тихий щелчок и шелест листвы */
  berryPick() {
    this._noiseBurst(0.07, 2600, 2.2, 0.07, 'bandpass');
    this._tone(880, 0.1, 0.035, 'sine', 1180, 0.03);
    this._noiseBurst(0.2, 4200, 1.1, 0.03, 'highpass');
  }

  /** Листва/куст: шорох при задевании */
  rustle() {
    this._noiseBurst(0.26, 3600 + Math.random() * 1200, 0.9, 0.045, 'highpass');
    this._noiseBurst(0.14, 1500, 1.2, 0.03, 'bandpass');
  }

  /** Треск: дерево не выдержало */
  treeFall() {
    this._noiseBurst(0.5, 320, 0.7, 0.14, 'lowpass');
    this._tone(110, 0.5, 0.08, 'sawtooth', 48);
    this._noiseBurst(0.35, 900, 0.9, 0.07, 'bandpass');
  }

  /** Камень развалился: осыпь */
  stoneBreak() {
    this._noiseBurst(0.22, 1400, 0.9, 0.13, 'bandpass');
    for (let i = 0; i < 4; i++) {
      this._noiseBurst(0.07, 2200 + Math.random() * 1600, 2.4, 0.05, 'bandpass');
      this._tone(240 + Math.random() * 160, 0.06, 0.03, 'square', 140, i * 0.035);
    }
  }

  /** Тихий хруст, когда кирка вошла в камень */
  stoneCrack() {
    this._noiseBurst(0.08, 1800 + Math.random() * 700, 2.2, 0.045, 'bandpass');
  }

  /** Обвал: стенка ямы рухнула, земля осыпается вниз */
  collapse() {
    this._noiseBurst(0.85, 260, 0.6, 0.22, 'lowpass');
    this._noiseBurst(0.5, 900, 0.8, 0.12, 'bandpass');
    this._tone(64, 0.7, 0.12, 'sine', 38);
    for (let i = 0; i < 7; i++) {
      this._tone(200 + Math.random() * 260, 0.07, 0.035, 'square', 120, i * 0.055);
      this._noiseBurst(0.06, 1500 + Math.random() * 2200, 2.6, 0.05, 'bandpass');
    }
  }

  /** Рудный камень: звонкий удар с металлическим призвуком */
  oreHit() {
    this._tone(1180, 0.18, 0.05, 'triangle', 760);
    this._tone(1760, 0.14, 0.03, 'sine', 1320, 0.02);
    this._noiseBurst(0.1, 3000, 2.6, 0.07, 'bandpass');
  }

  craft() {
    this._noiseBurst(0.08, 900, 1.2, 0.06);
    this._tone(520, 0.08, 0.05, 'triangle');
    this._tone(780, 0.1, 0.04, 'triangle', null, 0.07);
    this._tone(1040, 0.12, 0.035, 'triangle', null, 0.15);
  }

  hitFlesh() {
    this._noiseBurst(0.12, 260, 0.8, 0.14);
    this._tone(120, 0.1, 0.07, 'sine', 70);
  }

  bowShot() {
    this._noiseBurst(0.07, 2200, 2.0, 0.09, 'bandpass');
    this._tone(300, 0.16, 0.05, 'triangle', 140);
  }

  mobDeath() {
    this._tone(180, 0.3, 0.07, 'sawtooth', 70);
    this._noiseBurst(0.24, 300, 0.8, 0.07);
  }

  heal() {
    this._tone(520, 0.18, 0.045, 'sine', 780);
    this._tone(780, 0.22, 0.03, 'sine', 1040, 0.1);
  }

  grunt() {
    this._noiseBurst(0.18, 260, 0.9, 0.11);
    this._tone(96, 0.2, 0.09, 'sawtooth', 72);
  }

  crab() {
    for (let i = 0; i < 3; i++) this._noiseBurst(0.04, 3200, 3, 0.05, 'bandpass');
  }

  gull() {
    this._tone(1650, 0.16, 0.05, 'sawtooth', 900);
    this._tone(1500, 0.18, 0.04, 'sawtooth', 820, 0.18);
  }

  hiss() {
    this._noiseBurst(0.5, 5200, 1.2, 0.06, 'highpass');
  }

  /** Обезьяна: короткие вскрики с восходящим тоном */
  monkey() {
    this._tone(760, 0.09, 0.05, 'square', 1180);
    this._tone(900, 0.07, 0.04, 'square', 1320, 0.11);
    if (Math.random() < 0.5) this._tone(680, 0.08, 0.035, 'square', 980, 0.22);
  }

  /** Рыба у поверхности: бульканье и всплеск */
  bubble() {
    for (let i = 0; i < 3; i++) {
      this._tone(320 + i * 90, 0.05, 0.03, 'sine', 620 + i * 120, i * 0.05);
    }
    this._noiseBurst(0.12, 1400, 1.6, 0.03, 'bandpass');
  }

  /** Мягкий шаг зверя по земле */
  mobStep() {
    this._noiseBurst(0.09, 320 + Math.random() * 140, 0.9, 0.06);
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
