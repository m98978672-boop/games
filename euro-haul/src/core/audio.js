// Процедурный звук: дизель, турбина, шины, ветер, дождь, клаксон и интерфейс.
// Без внешних файлов: всё синтезируется из осцилляторов и шума.
//
// Как устроен звук двигателя (важно для «настоящего» дизеля):
//  * частота вспышек f = rpm/60 * цилиндры/2 (у 6-цилиндрового 4-тактного — rpm/20);
//  * слышим не одну синусоиду, а набор гармоник f, 2f, 3f + субгармонику f/2;
//  * вспышки дают амплитудную модуляцию той же частотой — именно она читается
//    как «тракторный» рокот, а не как пила;
//  * поверх — шум сгорания в полосе 1.2–3.2 кГц, промодулированный f;
//  * фильтр низких частот открывается от нагрузки, а не только от оборотов;
//  * турбина — синус 2.5–6 кГц плюс шипение, нарастает с наддувом;
//  * переключение передачи на мгновение «съедает» звук и добавляет стук.
import { clamp } from './math.js';

export class AudioSystem {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.volume = 0.7;
    this.started = false;
    this.gear = 0;
    this.prevThrottle = 0;
    this.prevBrake = 0;
    this.prevSpeed = 0;
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

    // Мастер: громкость + компрессор, чтобы слои не резали уши на пиках.
    this.master = ctx.createGain();
    this.master.gain.value = this.volume;
    this.compressor = ctx.createDynamicsCompressor();
    this.compressor.threshold.value = -18;
    this.compressor.knee.value = 24;
    this.compressor.ratio.value = 4;
    this.compressor.attack.value = 0.004;
    this.compressor.release.value = 0.18;
    this.master.connect(this.compressor);
    this.compressor.connect(ctx.destination);

    // Общие буферы шума: белый и «коричневый» (для выхлопа и ветра).
    const white = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const wd = white.getChannelData(0);
    for (let i = 0; i < wd.length; i++) wd[i] = Math.random() * 2 - 1;
    const brown = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const bd = brown.getChannelData(0);
    let last = 0;
    for (let i = 0; i < bd.length; i++) {
      last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
      bd[i] = last * 3.2;
    }
    this.noiseBuffer = white;
    this.brownBuffer = brown;

    const noise = (buffer, loop = true) => {
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.loop = loop;
      src.start();
      return src;
    };

    // ---------------------------------------------------------------- двигатель
    // Сумма гармоник вспышек. Частоты обновляются в update().
    this.engineBus = ctx.createGain();
    this.engineBus.gain.value = 0;

    // Насыщение: лёгкий вейвшейпер даёт дизелю «хрип».
    this.shaper = ctx.createWaveShaper();
    const curve = new Float32Array(1024);
    for (let i = 0; i < curve.length; i++) {
      const x = (i / (curve.length - 1)) * 2 - 1;
      curve[i] = Math.tanh(x * 2.2) * 0.85;
    }
    this.shaper.curve = curve;
    this.shaper.oversample = '2x';

    this.engineFilter = ctx.createBiquadFilter();
    this.engineFilter.type = 'lowpass';
    this.engineFilter.frequency.value = 380;
    this.engineFilter.Q.value = 1.1;

    this.enginePeak = ctx.createBiquadFilter();
    this.enginePeak.type = 'peaking';
    this.enginePeak.frequency.value = 120;
    this.enginePeak.Q.value = 1.4;
    this.enginePeak.gain.value = 6;

    // Пульс вспышек — отдельный каскад: громкость двигателя остаётся чистой,
    // а модуляция не уходит в минус (иначе звук «рвётся»).
    this.pulseGain = ctx.createGain();
    this.pulseGain.gain.value = 0.72;
    this.engineBus.connect(this.shaper);
    this.shaper.connect(this.pulseGain);
    this.pulseGain.connect(this.engineFilter);
    this.engineFilter.connect(this.enginePeak);
    this.enginePeak.connect(this.master);

    const osc = (type, gainValue) => {
      const o = ctx.createOscillator();
      o.type = type;
      const g = ctx.createGain();
      g.gain.value = gainValue;
      o.connect(g);
      g.connect(this.engineBus);
      o.start();
      return { o, g };
    };
    // 1-я гармоника вспышек — основная нота
    this.h1 = osc('sawtooth', 0.5);
    // 2-я — «железо»
    this.h2 = osc('square', 0.16);
    // 3-я — характерный дизельный лязг
    this.h3 = osc('triangle', 0.1);
    // субгармоника — низкий гул на холостых
    this.sub = osc('sine', 0.42);
    // лёгкий расстроенный дубль первой гармоники — «жир»
    this.h1b = osc('sawtooth', 0.22);

    // Амплитудная модуляция вспышками: gain модулируется осциллятором на f.
    this.pulseOsc = ctx.createOscillator();
    this.pulseOsc.type = 'sine';
    this.pulseOsc.frequency.value = 30;
    this.pulseDepth = ctx.createGain();
    this.pulseDepth.gain.value = 0.28;
    this.pulseOsc.connect(this.pulseDepth);
    this.pulseDepth.connect(this.pulseGain.gain);
    this.pulseOsc.start();

    // Шум сгорания (клацанье форсунок/клапанов).
    this.clatterSrc = noise(white);
    this.clatterBand = ctx.createBiquadFilter();
    this.clatterBand.type = 'bandpass';
    this.clatterBand.frequency.value = 2100;
    this.clatterBand.Q.value = 0.9;
    this.clatterGain = ctx.createGain();
    this.clatterGain.gain.value = 0;
    this.clatterMod = ctx.createGain();
    this.clatterMod.gain.value = 0.5;
    this.clatterSrc.connect(this.clatterBand);
    this.clatterBand.connect(this.clatterMod);
    this.clatterMod.connect(this.clatterGain);
    this.clatterGain.connect(this.master);
    // модуляция шума вспышками
    const clatterLfo = ctx.createOscillator();
    clatterLfo.type = 'sawtooth';
    clatterLfo.frequency.value = 30;
    const clatterDepth = ctx.createGain();
    clatterDepth.gain.value = 0.5;
    clatterLfo.connect(clatterDepth);
    clatterDepth.connect(this.clatterMod.gain);
    clatterLfo.start();
    this.clatterLfo = clatterLfo;

    // Выхлоп: коричневый шум через низкий фильтр, громче под нагрузкой.
    this.exhaustSrc = noise(brown);
    this.exhaustFilter = ctx.createBiquadFilter();
    this.exhaustFilter.type = 'lowpass';
    this.exhaustFilter.frequency.value = 260;
    this.exhaustGain = ctx.createGain();
    this.exhaustGain.gain.value = 0;
    this.exhaustSrc.connect(this.exhaustFilter);
    this.exhaustFilter.connect(this.exhaustGain);
    this.exhaustGain.connect(this.master);

    // ---------------------------------------------------------------- турбина
    this.turboGain = ctx.createGain();
    this.turboGain.gain.value = 0;
    this.turboGain.connect(this.master);
    this.turbo = ctx.createOscillator();
    this.turbo.type = 'sine';
    this.turbo.frequency.value = 2600;
    this.turbo.connect(this.turboGain);
    this.turbo.start();
    this.turboHissSrc = noise(white);
    this.turboHissFilter = ctx.createBiquadFilter();
    this.turboHissFilter.type = 'bandpass';
    this.turboHissFilter.frequency.value = 5200;
    this.turboHissFilter.Q.value = 1.6;
    this.turboHissGain = ctx.createGain();
    this.turboHissGain.gain.value = 0;
    this.turboHissSrc.connect(this.turboHissFilter);
    this.turboHissFilter.connect(this.turboHissGain);
    this.turboHissGain.connect(this.master);

    // ---------------------------------------------------------------- трансмиссия
    this.whineGain = ctx.createGain();
    this.whineGain.gain.value = 0;
    this.whineGain.connect(this.master);
    this.whine = ctx.createOscillator();
    this.whine.type = 'triangle';
    this.whine.frequency.value = 180;
    this.whine.connect(this.whineGain);
    this.whine.start();

    // ---------------------------------------------------------------- шины, ветер
    this.rollSrc = noise(white);
    this.rollFilter = ctx.createBiquadFilter();
    this.rollFilter.type = 'bandpass';
    this.rollFilter.frequency.value = 320;
    this.rollFilter.Q.value = 0.7;
    this.rollGain = ctx.createGain();
    this.rollGain.gain.value = 0;
    this.rollSrc.connect(this.rollFilter);
    this.rollFilter.connect(this.rollGain);
    this.rollGain.connect(this.master);

    this.windSrc = noise(brown);
    this.windFilter = ctx.createBiquadFilter();
    this.windFilter.type = 'lowpass';
    this.windFilter.frequency.value = 700;
    this.windGain = ctx.createGain();
    this.windGain.gain.value = 0;
    this.windSrc.connect(this.windFilter);
    this.windFilter.connect(this.windGain);
    this.windGain.connect(this.master);

    // ---------------------------------------------------------------- дождь
    this.rainSrc = noise(white);
    this.rainFilter = ctx.createBiquadFilter();
    this.rainFilter.type = 'highpass';
    this.rainFilter.frequency.value = 1400;
    this.rainGain = ctx.createGain();
    this.rainGain.gain.value = 0;
    this.rainSrc.connect(this.rainFilter);
    this.rainFilter.connect(this.rainGain);
    this.rainGain.connect(this.master);

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

  /**
   * @param {object} s состояние машины
   * @param {number} s.rpm обороты, 1/мин
   * @param {number} s.throttle 0..1
   * @param {number} s.brake 0..1
   * @param {number} s.speed м/с
   * @param {number} s.rain 0..1
   * @param {boolean} s.engineOn
   * @param {number} s.gear номер передачи (0 = нейтраль)
   */
  update({ rpm = 700, throttle = 0, brake = 0, speed = 0, rain = 0, engineOn = true, gear = 0, load = null }) {
    if (!this.started || !this.enabled) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const smooth = (param, value, tau = 0.05) => param.setTargetAtTime(value, t, tau);

    const rpmClamped = clamp(rpm, 450, 2400);
    // Частота вспышек 6-цилиндрового дизеля.
    const fire = Math.max(9, rpmClamped / 20);
    const underLoad = load == null ? clamp(throttle * 0.85 + Math.max(0, speed) * 0.006, 0, 1) : clamp(load, 0, 1);
    const on = engineOn ? 1 : 0;

    // Гармоники: чем выше обороты, тем «ярче» верх.
    smooth(this.h1.o.frequency, fire, 0.04);
    smooth(this.h2.o.frequency, fire * 2, 0.04);
    smooth(this.h3.o.frequency, fire * 3, 0.04);
    smooth(this.sub.o.frequency, fire * 0.5, 0.04);
    smooth(this.h1b.o.frequency, fire * 1.004, 0.04);
    smooth(this.pulseOsc.frequency, fire, 0.04);
    smooth(this.clatterLfo.frequency, fire, 0.04);

    // Баланс гармоник: на холостых больше низа, на верхах — «железа».
    const rev = clamp((rpmClamped - 600) / 1500, 0, 1);
    smooth(this.h1.g.gain, 0.42 + underLoad * 0.22);
    smooth(this.h2.g.gain, 0.06 + rev * 0.2 + underLoad * 0.08);
    smooth(this.h3.g.gain, 0.04 + rev * 0.13);
    smooth(this.sub.g.gain, 0.5 - rev * 0.18);
    smooth(this.h1b.g.gain, 0.12 + rev * 0.22);

    // Модуляция «пульсом» вспышек: на холостых глубже, на оборотах мягче.
    smooth(this.pulseDepth.gain, (0.3 - rev * 0.14) * on, 0.08);

    // Фильтр открывается от нагрузки и оборотов.
    smooth(this.engineFilter.frequency, 240 + underLoad * 1500 + rev * 700, 0.07);
    smooth(this.enginePeak.frequency, fire * 2.2, 0.06);
    smooth(this.enginePeak.gain, 4 + underLoad * 5, 0.1);
    smooth(this.engineBus.gain, on * (0.16 + underLoad * 0.3 + rev * 0.06), 0.06);

    // Клацанье и выхлоп.
    smooth(this.clatterGain.gain, on * (0.012 + underLoad * 0.035), 0.06);
    smooth(this.clatterBand.frequency, 1500 + rev * 1800, 0.1);
    smooth(this.exhaustGain.gain, on * (0.05 + underLoad * 0.14), 0.08);
    smooth(this.exhaustFilter.frequency, 180 + rev * 220 + underLoad * 240, 0.08);

    // Турбина: наддув растёт с газом и оборотами.
    const boost = on * clamp(throttle * 0.8 + (rpmClamped / 2400) * 0.5 - 0.35, 0, 1);
    smooth(this.turboGain.gain, boost * 0.022, 0.25);
    smooth(this.turbo.frequency, 2200 + boost * 3600, 0.3);
    smooth(this.turboHissGain.gain, boost * 0.016, 0.3);

    // Трансмиссия: тонкий вой, частота от скорости.
    const sp = Math.abs(speed);
    smooth(this.whineGain.gain, on * clamp(sp / 28, 0, 1) * 0.012, 0.15);
    smooth(this.whine.frequency, 120 + sp * 9 + (gear || 0) * 4, 0.2);

    // Шины и ветер.
    const roll = clamp(sp / 26, 0, 1);
    smooth(this.rollGain.gain, roll * 0.065, 0.2);
    smooth(this.rollFilter.frequency, 200 + roll * 520, 0.2);
    smooth(this.windGain.gain, roll * roll * 0.03, 0.3);
    smooth(this.windFilter.frequency, 500 + roll * 900, 0.3);

    // Дождь.
    smooth(this.rainGain.gain, clamp(rain, 0, 1) * 0.09, 0.4);

    // Реакции на действия водителя.
    // Автоматическая коробка тоже «щёлкает», но не перебивая ручное переключение.
    const now = ctx.currentTime;
    if (gear !== this.gear && this.gear !== 0 && on && sp > 1 && now - (this.lastShiftAt || -1) > 0.15) this.shift();
    this.gear = gear;
    if (this.prevBrake > 0.35 && brake < 0.1 && sp > 2) this.airRelease();
    this.prevBrake = brake;
    this.prevThrottle = throttle;
    this.prevSpeed = sp;
  }

  /** Пшик воздухом (тормозная система). */
  airRelease() {
    if (!this.ctx || !this.enabled) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 2400;
    filter.Q.value = 0.8;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.05, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    src.start(t);
    src.stop(t + 0.45);
  }

  /** Переключение передачи: провал звука и механический стук. */
  shift() {
    if (!this.ctx || !this.enabled) return;
    const ctx = this.ctx;
    this.lastShiftAt = ctx.currentTime;
    const t = ctx.currentTime;
    const dip = ctx.createGain();
    dip.gain.setValueAtTime(1, t);
    dip.gain.linearRampToValueAtTime(0.45, t + 0.03);
    dip.gain.linearRampToValueAtTime(1, t + 0.18);
    // стук
    const src = ctx.createBufferSource();
    src.buffer = this.brownBuffer;
    src.playbackRate.value = 1.4;
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 420;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.06, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
    src.connect(f);
    f.connect(g);
    g.connect(this.master);
    src.start(t);
    src.stop(t + 0.2);
  }

  honk() {
    if (!this.ctx || !this.enabled) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    for (const f of [370, 466, 740]) {
      const o = ctx.createOscillator();
      o.type = 'square';
      o.frequency.value = f;
      const g = ctx.createGain();
      const v = f > 700 ? 0.03 : 0.075;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(v, t + 0.02);
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
