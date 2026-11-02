// Процедурный звук тягача: дизель, турбина, выхлоп, трансмиссия, шины, ветер,
// дождь, дворники, воздух тормозов, горный тормоз, клаксон и интерфейс.
// Без внешних файлов — всё синтезируется из осцилляторов, шума и одного
// заранее просчитанного «цикла вспышек» дизеля.
//
// Почему именно так (это главное для «настоящего» звука):
//  * дизель — не пила и не синус, а последовательность вспышек. Мы считаем в буфер
//    один рабочий цикл 6-цилиндрового 4-тактного мотора (720° коленвала = 6 вспышек)
//    на базовых 600 об/мин: удар, «бочка», затухание и щелчок форсунки. Дальше буфер
//    просто играет по кругу с playbackRate = rpm / 600 — частота вспышек получается
//    ровно rpm/20, как в жизни, но с живой формой, а не с математической волной;
//  * два экземпляра цикла с расстройкой 0.35 % и разной панорамой дают объём;
//  * поверх — гармоники для тела, шум сгорания (1.2–3.6 кГц), выхлоп (коричневый шум),
//    турбина (свист + шипение), вой трансмиссии, шины и ветер;
//  * громкость и тембр зависят не только от оборотов, но и от нагрузки, а в кабине
//    включается «салонный» фильтр (глушит ветер и верх, подчёркивает мотор);
//  * события: стартер, переключение, пшик воздуха, горный тормоз, дворники,
//    стук колёс на стыках, писк тормозов, сигнал.
import { clamp } from './math.js';

const BASE_RPM = 600; // обороты, на которых просчитан цикл вспышек
const CYLINDERS = 6;

export class AudioSystem {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.volume = 0.7;
    this.started = false;
    this.cabin = false;
    this.gear = 0;
    this.prevThrottle = 0;
    this.prevBrake = 0;
    this.prevSpeed = 0;
    this.jointMeters = 0;
    this.wiperTimer = 0;
    this.purgeTimer = 0;
    this.lastTime = 0;
  }

  // ---------------------------------------------------------------- инициализация
  init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    const ctx = this.ctx;

    // Мастер: громкость → салонный фильтр → компрессор → выход.
    this.master = ctx.createGain();
    this.master.gain.value = this.volume;
    this.cabinFilter = ctx.createBiquadFilter();
    this.cabinFilter.type = 'lowpass';
    this.cabinFilter.frequency.value = 20000;
    this.cabinFilter.Q.value = 0.5;
    this.compressor = ctx.createDynamicsCompressor();
    this.compressor.threshold.value = -16;
    this.compressor.knee.value = 22;
    this.compressor.ratio.value = 3.6;
    this.compressor.attack.value = 0.005;
    this.compressor.release.value = 0.2;
    this.master.connect(this.cabinFilter);
    this.cabinFilter.connect(this.compressor);
    this.compressor.connect(ctx.destination);

    // Небольшой «объём»: короткая синтетическая реверберация (тоннель, лес, город).
    this.reverb = ctx.createConvolver();
    this.reverb.buffer = this.impulse(1.4, 2.6);
    this.reverbSend = ctx.createGain();
    this.reverbSend.gain.value = 0.16;
    this.reverbReturn = ctx.createGain();
    this.reverbReturn.gain.value = 0.3;
    this.reverbSend.connect(this.reverb);
    this.reverb.connect(this.reverbReturn);
    this.reverbReturn.connect(this.master);

    const white = this.noiseBuffer(ctx, 'white');
    const brown = this.noiseBuffer(ctx, 'brown');
    const pink = this.noiseBuffer(ctx, 'pink');
    this.noiseBufferRef = white;
    this.brownBufferRef = brown;

    const noise = (buffer) => {
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.loop = true;
      src.start();
      return src;
    };

    // ---------------------------------------------------------------- двигатель
    // Шина двигателя → насыщение → пульсация вспышек → фильтр → эквалайзер → громкость.
    this.engineBus = ctx.createGain();
    this.engineBus.gain.value = 0;
    this.shaper = ctx.createWaveShaper();
    const curve = new Float32Array(2048);
    for (let i = 0; i < curve.length; i++) {
      const x = (i / (curve.length - 1)) * 2 - 1;
      curve[i] = Math.tanh(x * 2.6) * 0.82;
    }
    this.shaper.curve = curve;
    this.shaper.oversample = '2x';
    this.pulseGain = ctx.createGain();
    this.pulseGain.gain.value = 0.75;
    this.engineFilter = ctx.createBiquadFilter();
    this.engineFilter.type = 'lowpass';
    this.engineFilter.frequency.value = 420;
    this.engineFilter.Q.value = 1.0;
    this.enginePeak = ctx.createBiquadFilter();
    this.enginePeak.type = 'peaking';
    this.enginePeak.frequency.value = 110;
    this.enginePeak.Q.value = 1.5;
    this.enginePeak.gain.value = 5;
    this.engineGain = ctx.createGain();
    this.engineGain.gain.value = 0;
    this.engineBus.connect(this.shaper);
    this.shaper.connect(this.pulseGain);
    this.pulseGain.connect(this.engineFilter);
    this.engineFilter.connect(this.enginePeak);
    this.enginePeak.connect(this.engineGain);
    this.engineGain.connect(this.master);
    this.engineGain.connect(this.reverbSend);

    // Цикл вспышек: два источника с расстройкой и панорамой.
    this.dieselBuffer = this.renderDieselCycle(ctx);
    const diesel = (rate, pan) => {
      const src = ctx.createBufferSource();
      src.buffer = this.dieselBuffer;
      src.loop = true;
      const g = ctx.createGain();
      g.gain.value = 0.5;
      let out = g;
      if (ctx.createStereoPanner) {
        const p = ctx.createStereoPanner();
        p.pan.value = pan;
        g.connect(p);
        out = p;
      }
      src.connect(g);
      out.connect(this.engineBus);
      src.start();
      return { src, gain: g };
    };
    this.dieselA = diesel(-0.16);
    this.dieselB = diesel(0.16);

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
    this.h1 = osc('sawtooth', 0.16);
    this.h2 = osc('square', 0.05);
    this.sub = osc('sine', 0.5);
    this.h1b = osc('sawtooth', 0.09);

    // Пульс вспышек: отдельный каскад, чтобы громкость не уходила в минус.
    this.pulseOsc = ctx.createOscillator();
    this.pulseOsc.type = 'sine';
    this.pulseOsc.frequency.value = 30;
    this.pulseDepth = ctx.createGain();
    this.pulseDepth.gain.value = 0.26;
    this.pulseOsc.connect(this.pulseDepth);
    this.pulseDepth.connect(this.pulseGain.gain);
    this.pulseOsc.start();

    // Шум сгорания (форсунки/клапаны).
    this.clatterSrc = noise(white);
    this.clatterBand = ctx.createBiquadFilter();
    this.clatterBand.type = 'bandpass';
    this.clatterBand.frequency.value = 2100;
    this.clatterBand.Q.value = 0.85;
    this.clatterMod = ctx.createGain();
    this.clatterMod.gain.value = 0.5;
    this.clatterGain = ctx.createGain();
    this.clatterGain.gain.value = 0;
    this.clatterSrc.connect(this.clatterBand);
    this.clatterBand.connect(this.clatterMod);
    this.clatterMod.connect(this.clatterGain);
    this.clatterGain.connect(this.master);
    this.clatterLfo = ctx.createOscillator();
    this.clatterLfo.type = 'sawtooth';
    this.clatterLfo.frequency.value = 30;
    const clatterDepth = ctx.createGain();
    clatterDepth.gain.value = 0.5;
    this.clatterLfo.connect(clatterDepth);
    clatterDepth.connect(this.clatterMod.gain);
    this.clatterLfo.start();

    // Механика на холостых: вентилятор и шестерни.
    this.fanSrc = noise(pink);
    this.fanFilter = ctx.createBiquadFilter();
    this.fanFilter.type = 'bandpass';
    this.fanFilter.frequency.value = 320;
    this.fanFilter.Q.value = 0.6;
    this.fanGain = ctx.createGain();
    this.fanGain.gain.value = 0;
    this.fanSrc.connect(this.fanFilter);
    this.fanFilter.connect(this.fanGain);
    this.fanGain.connect(this.master);

    // Выхлоп: низкий рокот.
    this.exhaustSrc = noise(brown);
    this.exhaustFilter = ctx.createBiquadFilter();
    this.exhaustFilter.type = 'lowpass';
    this.exhaustFilter.frequency.value = 240;
    this.exhaustGain = ctx.createGain();
    this.exhaustGain.gain.value = 0;
    this.exhaustSrc.connect(this.exhaustFilter);
    this.exhaustFilter.connect(this.exhaustGain);
    this.exhaustGain.connect(this.master);
    this.exhaustGain.connect(this.reverbSend);

    // Турбина.
    this.turboGain = ctx.createGain();
    this.turboGain.gain.value = 0;
    this.turbo = ctx.createOscillator();
    this.turbo.type = 'sine';
    this.turbo.frequency.value = 2600;
    this.turbo.connect(this.turboGain);
    this.turbo.start();
    this.turboHissSrc = noise(white);
    this.turboHissFilter = ctx.createBiquadFilter();
    this.turboHissFilter.type = 'bandpass';
    this.turboHissFilter.frequency.value = 5200;
    this.turboHissFilter.Q.value = 1.5;
    this.turboHissGain = ctx.createGain();
    this.turboHissGain.gain.value = 0;
    this.turboHissSrc.connect(this.turboHissFilter);
    this.turboHissFilter.connect(this.turboHissGain);
    this.turboHissGain.connect(this.master);
    this.turboGain.connect(this.master);

    // Трансмиссия: вой главной пары и кардана.
    this.whineGain = ctx.createGain();
    this.whineGain.gain.value = 0;
    this.whine = ctx.createOscillator();
    this.whine.type = 'triangle';
    this.whine.frequency.value = 180;
    this.whine.connect(this.whineGain);
    this.whineGain.connect(this.master);
    this.whine2Gain = ctx.createGain();
    this.whine2Gain.gain.value = 0;
    this.whine2 = ctx.createOscillator();
    this.whine2.type = 'sine';
    this.whine2.frequency.value = 420;
    this.whine2.connect(this.whine2Gain);
    this.whine2Gain.connect(this.master);
    this.whine.start();
    this.whine2.start();

    // Шины: две полосы — гул протектора и шипение по асфальту, с панорамой.
    this.tyrePan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    this.tyreBus = ctx.createGain();
    this.tyreBus.gain.value = 1;
    if (this.tyrePan) {
      this.tyreBus.connect(this.tyrePan);
      this.tyrePan.connect(this.master);
    } else {
      this.tyreBus.connect(this.master);
    }
    this.rollSrc = noise(brown);
    this.rollFilter = ctx.createBiquadFilter();
    this.rollFilter.type = 'bandpass';
    this.rollFilter.frequency.value = 260;
    this.rollFilter.Q.value = 0.8;
    this.rollGain = ctx.createGain();
    this.rollGain.gain.value = 0;
    this.rollSrc.connect(this.rollFilter);
    this.rollFilter.connect(this.rollGain);
    this.rollGain.connect(this.tyreBus);
    this.hissSrc = noise(white);
    this.hissFilter = ctx.createBiquadFilter();
    this.hissFilter.type = 'highpass';
    this.hissFilter.frequency.value = 1500;
    this.hissGain = ctx.createGain();
    this.hissGain.gain.value = 0;
    this.hissSrc.connect(this.hissFilter);
    this.hissFilter.connect(this.hissGain);
    this.hissGain.connect(this.tyreBus);

    // Ветер.
    this.windSrc = noise(brown);
    this.windFilter = ctx.createBiquadFilter();
    this.windFilter.type = 'lowpass';
    this.windFilter.frequency.value = 700;
    this.windGain = ctx.createGain();
    this.windGain.gain.value = 0;
    this.windSrc.connect(this.windFilter);
    this.windFilter.connect(this.windGain);
    this.windGain.connect(this.master);

    // Дождь по кабине и стёклам.
    this.rainSrc = noise(white);
    this.rainFilter = ctx.createBiquadFilter();
    this.rainFilter.type = 'highpass';
    this.rainFilter.frequency.value = 1300;
    this.rainGain = ctx.createGain();
    this.rainGain.gain.value = 0;
    this.rainSrc.connect(this.rainFilter);
    this.rainFilter.connect(this.rainGain);
    this.rainGain.connect(this.master);
    this.rainRoofSrc = noise(pink);
    this.rainRoofFilter = ctx.createBiquadFilter();
    this.rainRoofFilter.type = 'bandpass';
    this.rainRoofFilter.frequency.value = 620;
    this.rainRoofFilter.Q.value = 0.7;
    this.rainRoofGain = ctx.createGain();
    this.rainRoofGain.gain.value = 0;
    this.rainRoofSrc.connect(this.rainRoofFilter);
    this.rainRoofFilter.connect(this.rainRoofGain);
    this.rainRoofGain.connect(this.master);

    // Горный тормоз (заслонка): «пулемётный» рокот.
    this.jakeSrc = noise(pink);
    this.jakeFilter = ctx.createBiquadFilter();
    this.jakeFilter.type = 'bandpass';
    this.jakeFilter.frequency.value = 210;
    this.jakeFilter.Q.value = 1.2;
    this.jakeGain = ctx.createGain();
    this.jakeGain.gain.value = 0;
    this.jakePulse = ctx.createGain();
    this.jakePulse.gain.value = 0.6;
    this.jakeSrc.connect(this.jakeFilter);
    this.jakeFilter.connect(this.jakePulse);
    this.jakePulse.connect(this.jakeGain);
    this.jakeGain.connect(this.master);
    this.jakeLfo = ctx.createOscillator();
    this.jakeLfo.type = 'square';
    this.jakeLfo.frequency.value = 26;
    const jakeDepth = ctx.createGain();
    jakeDepth.gain.value = 0.4;
    this.jakeLfo.connect(jakeDepth);
    jakeDepth.connect(this.jakePulse.gain);
    this.jakeLfo.start();

    // Писк тормозов.
    this.squealGain = ctx.createGain();
    this.squealGain.gain.value = 0;
    this.squeal = ctx.createOscillator();
    this.squeal.type = 'sawtooth';
    this.squeal.frequency.value = 2650;
    this.squealFilter = ctx.createBiquadFilter();
    this.squealFilter.type = 'bandpass';
    this.squealFilter.frequency.value = 2650;
    this.squealFilter.Q.value = 14;
    this.squeal.connect(this.squealFilter);
    this.squealFilter.connect(this.squealGain);
    this.squealGain.connect(this.master);
    this.squeal.start();

    // Раздельные шины: мотор и окружение можно крутить отдельно.
    this.buildMixes();
    this.started = true;
  }

  /** Шины громкости: «мотор» и «окружение» (шины, ветер, дождь, визг покрышек). */
  buildMixes() {
    const ctx = this.ctx;
    const make = () => {
      const bus = ctx.createGain();
      bus.gain.value = 1;
      bus.connect(this.master);
      return bus;
    };
    this.mixEngine = make();
    this.mixAmbience = make();
    const route = (bus, nodes) => {
      for (const node of nodes) {
        if (!node) continue;
        try {
          node.disconnect(this.master);
        } catch {}
        node.connect(bus);
      }
    };
    route(this.mixEngine, [
      this.engineGain,
      this.clatterGain,
      this.fanGain,
      this.exhaustGain,
      this.turboGain,
      this.turboHissGain,
      this.whineGain,
      this.whine2Gain,
      this.jakeGain,
    ]);
    // Тяговые шумы уже сведены в tyreBus/tyrePan — двигаем только терминальный узел.
    route(this.mixAmbience, [
      this.tyrePan || this.tyreBus,
      this.windGain,
      this.rainGain,
      this.rainRoofGain,
      this.squealGain,
    ]);
    this.setMix(this.mix || {});
  }

  /** Громкость слоёв: { engine, ambience } в долях 0…1. */
  setMix(mix = {}) {
    this.mix = { engine: 1, ambience: 1, ...(this.mix || {}), ...mix };
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const smooth = (node, value) => {
      if (!node) return;
      node.gain.setTargetAtTime(Math.max(0, Math.min(1.6, value)), now, 0.08);
    };
    smooth(this.mixEngine, this.mix.engine);
    smooth(this.mixAmbience, this.mix.ambience);
  }

  /** Буфер шума: белый, коричневый (низкий гул) и розовый (мягкий шум). */
  noiseBuffer(ctx, kind) {
    const len = Math.round(ctx.sampleRate * 2);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    if (kind === 'brown') {
      let last = 0;
      for (let i = 0; i < len; i++) {
        last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
        d[i] = last * 3.2;
      }
    } else if (kind === 'pink') {
      // Простой фильтр Пола Келлета: розовый шум приятнее на слух, чем белый.
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < len; i++) {
        const w = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + w * 0.0555179;
        b1 = 0.99332 * b1 + w * 0.0750759;
        b2 = 0.969 * b2 + w * 0.153852;
        b3 = 0.8665 * b3 + w * 0.3104856;
        b4 = 0.55 * b4 + w * 0.5329522;
        b5 = -0.7616 * b5 - w * 0.016898;
        d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
        b6 = w * 0.115926;
      }
    } else {
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    }
    return buf;
  }

  /** Импульсный отклик для реверберации: затухающий шум в стерео. */
  impulse(seconds, decay) {
    const ctx = this.ctx;
    const len = Math.max(1, Math.round(ctx.sampleRate * seconds));
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) {
        const t = i / len;
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, decay);
      }
    }
    return buf;
  }

  /**
   * Один рабочий цикл дизеля: 6 вспышек на 600 об/мин (0.2 с).
   * Форма вспышки: резкий фронт (поршневой стук), низкая «бочка», затухание
   * и щелчок форсунки — именно набор этих составляющих читается как дизель.
   */
  renderDieselCycle(ctx) {
    const sr = ctx.sampleRate;
    const cycle = (60 / BASE_RPM) * 2; // 720° коленвала
    const len = Math.round(sr * cycle);
    const buf = ctx.createBuffer(1, len, sr);
    const d = buf.getChannelData(0);
    const tail = Math.round(len * 0.55);
    for (let c = 0; c < CYLINDERS; c++) {
      const start = Math.round((c / CYLINDERS) * len);
      const amp = 0.82 + ((c * 7) % 5) * 0.06; // вспышки не одинаковые
      for (let k = 0; k < tail; k++) {
        const i = (start + k) % len;
        const t = k / sr;
        const attack = Math.exp(-t * 260);
        const body = Math.exp(-t * 24) * 0.62;
        const thump = Math.sin(2 * Math.PI * 58 * t) * Math.exp(-t * 15);
        const click = (Math.random() * 2 - 1) * Math.exp(-t * 950) * 0.45;
        d[i] += amp * (attack * 0.55 + body * 0.5 + thump * 0.55 + click * 0.3);
      }
    }
    let max = 0;
    for (let i = 0; i < len; i++) max = Math.max(max, Math.abs(d[i]));
    const norm = max > 0 ? 0.86 / max : 1;
    for (let i = 0; i < len; i++) d[i] *= norm;
    return buf;
  }

  // ---------------------------------------------------------------- настройки
  setEnabled(on) {
    this.enabled = on;
    if (this.master) this.master.gain.value = on ? this.volume : 0;
  }

  setVolume(v) {
    this.volume = v;
    if (this.master && this.enabled) this.master.gain.value = v;
  }

  /** Из кабины звук другой: меньше ветра и верха, больше мотора. */
  setCabin(on) {
    this.cabin = !!on;
    if (!this.ctx || !this.cabinFilter) return;
    const t = this.ctx.currentTime;
    this.cabinFilter.frequency.setTargetAtTime(this.cabin ? 5200 : 20000, t, 0.15);
    if (this.reverbSend) this.reverbSend.gain.setTargetAtTime(this.cabin ? 0.1 : 0.18, t, 0.2);
  }

  // ---------------------------------------------------------------- кадр
  /**
   * @param {object} s состояние машины
   * @param {number} s.rpm обороты
   * @param {number} s.throttle 0..1
   * @param {number} s.brake 0..1
   * @param {number} s.speed м/с
   * @param {number} s.rain 0..1
   * @param {boolean} s.engineOn
   * @param {number} s.gear
   * @param {number} s.load 0..1
   * @param {number} s.retarder 0..1 горный тормоз
   * @param {number} s.roughness 0..1 покрытие
   * @param {number} s.slip 0..1 пробуксовка
   * @param {number} s.lateral боковое ускорение, м/с²
   */
  update(state = {}) {
    if (!this.started || !this.enabled || !this.ctx) return;
    const {
      rpm = 700,
      throttle = 0,
      brake = 0,
      speed = 0,
      rain = 0,
      engineOn = true,
      gear = 0,
      load = null,
      retarder = 0,
      roughness = 0,
      slip = 0,
      lateral = 0,
      engineLoad = null,
    } = state;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const smooth = (param, value, tau = 0.05) => param.setTargetAtTime(value, t, tau);
    const dt = clamp(t - (this.lastTime || t), 0, 0.1);
    this.lastTime = t;

    const rpmClamped = clamp(rpm, 450, 2400);
    const fire = Math.max(9, rpmClamped / 20);
    const underLoad = load == null ? clamp(throttle * 0.85 + Math.max(0, speed) * 0.006, 0, 1) : clamp(load, 0, 1);
    const on = engineOn ? 1 : 0;
    const rev = clamp((rpmClamped - 600) / 1500, 0, 1);
    const sp = Math.abs(speed);
    const cabin = this.cabin ? 1 : 0;

    // --- Цикл вспышек: скорость воспроизведения = обороты / базовые.
    const rate = clamp(rpmClamped / BASE_RPM, 0.72, 4.2);
    smooth(this.dieselA.src.playbackRate, rate, 0.05);
    smooth(this.dieselB.src.playbackRate, rate * 1.0035, 0.05);
    smooth(this.dieselA.gain.gain, on * (0.34 + underLoad * 0.3 + rev * 0.12), 0.06);
    smooth(this.dieselB.gain.gain, on * (0.22 + underLoad * 0.16), 0.06);

    // --- Гармоники тела.
    smooth(this.h1.o.frequency, fire, 0.04);
    smooth(this.h2.o.frequency, fire * 2, 0.04);
    smooth(this.sub.o.frequency, fire * 0.5, 0.04);
    smooth(this.h1b.o.frequency, fire * 1.004, 0.04);
    smooth(this.pulseOsc.frequency, fire, 0.04);
    smooth(this.clatterLfo.frequency, fire, 0.04);
    smooth(this.h1.g.gain, 0.1 + underLoad * 0.12 + rev * 0.05);
    smooth(this.h2.g.gain, 0.02 + rev * 0.09 + underLoad * 0.04);
    smooth(this.sub.g.gain, 0.34 - rev * 0.12);
    smooth(this.h1b.g.gain, 0.05 + rev * 0.1);
    smooth(this.pulseDepth.gain, (0.28 - rev * 0.12) * on, 0.08);

    // --- Тембр двигателя: открывается нагрузкой и оборотами.
    smooth(this.engineFilter.frequency, 300 + underLoad * 1500 + rev * 800, 0.07);
    smooth(this.enginePeak.frequency, fire * 2.1, 0.06);
    smooth(this.enginePeak.gain, 3.5 + underLoad * 5.5, 0.1);
    smooth(this.engineBus.gain, on * (0.5 + underLoad * 0.5), 0.06);
    smooth(this.engineGain.gain, on * (0.5 + cabin * 0.16), 0.08);

    // --- Шум сгорания и механика.
    smooth(this.clatterGain.gain, on * (0.014 + underLoad * 0.045 + rev * 0.01), 0.06);
    smooth(this.clatterBand.frequency, 1500 + rev * 1900, 0.1);
    smooth(this.fanGain.gain, on * (0.012 + (1 - rev) * 0.012), 0.2);
    smooth(this.fanFilter.frequency, 260 + rev * 260, 0.2);

    // --- Выхлоп.
    smooth(this.exhaustGain.gain, on * (0.05 + underLoad * 0.15), 0.08);
    smooth(this.exhaustFilter.frequency, 170 + rev * 230 + underLoad * 260, 0.08);

    // --- Турбина: раскручивается с наддувом.
    const boost = on * clamp(throttle * 0.85 + (rpmClamped / 2400) * 0.45 - 0.38, 0, 1);
    smooth(this.turboGain.gain, boost * 0.02, 0.28);
    smooth(this.turbo.frequency, 2300 + boost * 3600, 0.3);
    smooth(this.turboHissGain.gain, boost * 0.018, 0.3);

    // --- Трансмиссия.
    smooth(this.whineGain.gain, on * clamp(sp / 26, 0, 1) * 0.016, 0.15);
    smooth(this.whine.frequency, 120 + sp * 9 + (gear || 0) * 4, 0.2);
    smooth(this.whine2Gain.gain, on * clamp(sp / 30, 0, 1) * 0.008, 0.15);
    smooth(this.whine2.frequency, 320 + sp * 21 + (gear || 0) * 7, 0.2);

    // --- Шины: гул + шипение, панорама от бокового ускорения.
    const roll = clamp(sp / 25, 0, 1);
    const road = clamp(roughness, 0, 1);
    smooth(this.rollGain.gain, (roll * 0.07 + road * 0.03) * (1 - cabin * 0.4), 0.18);
    smooth(this.rollFilter.frequency, 190 + roll * 520 + road * 130, 0.2);
    smooth(this.hissGain.gain, roll * roll * (0.016 + road * 0.02) * (1 - cabin * 0.55), 0.2);
    if (this.tyrePan) smooth(this.tyrePan.pan, clamp(-lateral * 0.12, -0.5, 0.5), 0.2);

    // --- Ветер и дождь.
    smooth(this.windGain.gain, roll * roll * (cabin ? 0.012 : 0.035), 0.3);
    smooth(this.windFilter.frequency, 500 + roll * 900, 0.3);
    const wet = clamp(rain, 0, 1);
    smooth(this.rainGain.gain, wet * (cabin ? 0.055 : 0.08), 0.4);
    smooth(this.rainRoofGain.gain, wet * (cabin ? 0.05 : 0.02), 0.4);

    // --- Горный тормоз.
    smooth(this.jakeGain.gain, on * clamp(retarder, 0, 1) * 0.035, 0.1);
    smooth(this.jakeLfo.frequency, fire * 0.5, 0.1);

    // --- Писк тормозов на малой скорости.
    const squeal = on * (sp < 3.2 ? 1 : 0) * clamp(brake * 1.4 - 0.35, 0, 1) * 0.012;
    smooth(this.squealGain.gain, squeal, 0.12);
    smooth(this.squeal.frequency, 2500 + (1 - clamp(sp / 3.2, 0, 1)) * 300, 0.2);

    // --- Стыки покрытия: стук каждые ~24 м с силой от шероховатости.
    this.jointMeters += sp * dt;
    if (this.jointMeters > 24 && sp > 4) {
      this.jointMeters = 0;
      this.thump(clamp(0.35 + road * 0.8 + slip * 0.4, 0.2, 1));
    }

    // --- Дворники: сами включаются в дождь.
    if (wet > 0.15 && on) {
      this.wiperTimer -= dt;
      if (this.wiperTimer <= 0) {
        this.wiperTimer = 1.7 - wet * 1.0;
        this.wiper(wet);
      }
    } else {
      this.wiperTimer = 0.6;
    }

    // --- Осушитель воздуха: раз в полминуты стравливает конденсат.
    if (on) {
      this.purgeTimer += dt;
      if (this.purgeTimer > 32 + (this.gear % 3) * 4) {
        this.purgeTimer = 0;
        this.airPurge();
      }
    }

    // --- Реакции на действия водителя.
    if (gear !== this.gear && this.gear !== 0 && on && sp > 1 && t - (this.lastShiftAt || -1) > 0.15) this.shift();
    this.gear = gear;
    if (this.prevBrake > 0.35 && brake < 0.1 && sp > 2) this.airRelease();
    this.prevBrake = brake;
    this.prevThrottle = throttle;
    this.prevSpeed = sp;
    void engineLoad;
  }

  // ---------------------------------------------------------------- события
  /** Короткий удар: стык плит, яма, рельсы. */
  thump(strength = 0.6) {
    if (!this.ctx || !this.enabled) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.brownBufferRef;
    src.playbackRate.value = 1.2;
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 220 + strength * 200;
    const g = ctx.createGain();
    const v = 0.05 * strength;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.13);
    src.connect(f);
    f.connect(g);
    g.connect(this.master);
    src.start(t, Math.random() * 1.5);
    src.stop(t + 0.16);
  }

  /** Дворники: моторчик + скрип резины по стеклу. */
  wiper(wet = 0.5) {
    if (!this.ctx || !this.enabled) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBufferRef;
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = 700 + wet * 500;
    f.Q.value = 1.2;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.0001 + 0.011 * wet, t + 0.22);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
    src.connect(f);
    f.connect(g);
    g.connect(this.master);
    src.start(t, Math.random());
    src.stop(t + 0.55);
    const o = ctx.createOscillator();
    o.type = 'triangle';
    o.frequency.setValueAtTime(120, t);
    o.frequency.linearRampToValueAtTime(90, t + 0.5);
    const og = ctx.createGain();
    og.gain.setValueAtTime(0.0001, t);
    og.gain.exponentialRampToValueAtTime(0.004, t + 0.1);
    og.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
    o.connect(og);
    og.connect(this.master);
    o.start(t);
    o.stop(t + 0.55);
  }

  /** Пшик воздухом (тормозная система). */
  airRelease() {
    if (!this.ctx || !this.enabled) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBufferRef;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 2200;
    filter.Q.value = 0.7;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.055, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    gain.connect(this.reverbSend);
    src.start(t);
    src.stop(t + 0.55);
  }

  /** Стравить конденсат из осушителя. */
  airPurge() {
    if (!this.ctx || !this.enabled) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.brownBufferRef;
    const f = ctx.createBiquadFilter();
    f.type = 'highpass';
    f.frequency.value = 1800;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.03, t + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.75);
    src.connect(f);
    f.connect(g);
    g.connect(this.master);
    src.start(t);
    src.stop(t + 0.8);
  }

  /** Переключение передачи: провал звука и механический стук. */
  shift(strength = 1) {
    if (!this.ctx || !this.enabled) return;
    const ctx = this.ctx;
    this.lastShiftAt = ctx.currentTime;
    const t = ctx.currentTime;
    // «Кивок» звука: короткий провал, как при разрыве потока мощности.
    const dip = ctx.createGain();
    dip.gain.setValueAtTime(1, t);
    dip.gain.linearRampToValueAtTime(0.5, t + 0.04);
    dip.gain.linearRampToValueAtTime(1, t + 0.22);
    void dip;
    const src = ctx.createBufferSource();
    src.buffer = this.brownBufferRef;
    src.playbackRate.value = 1.4;
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 420;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.07 * strength, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.17);
    src.connect(f);
    f.connect(g);
    g.connect(this.master);
    src.start(t);
    src.stop(t + 0.2);
    // Металлический «чпоньк» синхронизатора.
    this.blip(220, 0.09, 'square', 0.02, true);
  }

  /** Пуск двигателя: стартер, вспышка, выход на холостые. */
  engineStart() {
    if (!this.ctx || !this.enabled) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBufferRef;
    src.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = 1100;
    f.Q.value = 1.4;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.05, t + 0.06);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.85);
    src.connect(f);
    f.connect(g);
    g.connect(this.master);
    src.start(t);
    src.stop(t + 0.9);
    const o = ctx.createOscillator();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(64, t);
    o.frequency.linearRampToValueAtTime(96, t + 0.6);
    const og = ctx.createGain();
    og.gain.setValueAtTime(0.0001, t);
    og.gain.exponentialRampToValueAtTime(0.045, t + 0.12);
    og.gain.exponentialRampToValueAtTime(0.0001, t + 0.8);
    o.connect(og);
    og.connect(this.master);
    o.start(t);
    o.stop(t + 0.85);
    // Схватывание: низкий «бум» и выхлоп.
    this.thump(1);
    setTimeout(() => this.blip(70, 0.35, 'sine', 0.05), 420);
  }

  /** Заглушить двигатель: вентилятор и турбина сбавляют, затем тишина. */
  engineStop() {
    if (!this.ctx || !this.enabled) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.brownBufferRef;
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.setValueAtTime(600, t);
    f.frequency.exponentialRampToValueAtTime(120, t + 1.2);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.04, t + 0.08);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.3);
    src.connect(f);
    f.connect(g);
    g.connect(this.master);
    src.start(t);
    src.stop(t + 1.35);
  }

  honk() {
    if (!this.ctx || !this.enabled) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    // Двухтональный сигнал грузовика: основа + квинта с лёгким биением.
    for (const [f, v] of [
      [370, 0.06],
      [466, 0.045],
      [373, 0.02],
    ]) {
      const o = ctx.createOscillator();
      o.type = 'square';
      o.frequency.value = f;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 2400;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(v, t + 0.025);
      g.gain.setValueAtTime(v, t + 0.35);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.75);
      o.connect(filter);
      filter.connect(g);
      g.connect(this.master);
      g.connect(this.reverbSend);
      o.start(t);
      o.stop(t + 0.8);
    }
  }

  /** Короткий сигнал интерфейса. */
  blip(freq = 660, dur = 0.08, type = 'sine', vol = 0.06, mechanical = false) {
    if (!this.ctx || !this.enabled) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (mechanical) o.frequency.exponentialRampToValueAtTime(freq * 0.6, t + dur);
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
    // Реле поворотника — щелчок с металлическим призвуком.
    this.blip(1400, 0.03, 'square', 0.02);
    this.blip(700, 0.05, 'triangle', 0.012);
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
