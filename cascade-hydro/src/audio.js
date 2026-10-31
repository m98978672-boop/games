// ============================================================================
//  ПРОЦЕДУРНЫЙ ЗВУК НА WEBAUDIO v0.3.1 (чистый микс с лимитером и масштабированием)
//  - Мягкий естественный шум реки и водопадов (нормированный под 0.8 / 5 / 10 км)
//  - Деликатный низкочастотный гул машзала ГЭС только вблизи станции (без писка!)
//  - Чистые тактильные звуки строительства и земляных работ без резких пилообразных волн
// ============================================================================

import { WORLD } from './config.js';
import { clamp } from './noise.js';

export class HydroAudio {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.initialized = false;

    this.masterGain = null;
    this.compressor = null;
    this.streamGain = null;
    this.streamFilter = null;
    this.spillGain = null;
    this.spillFilter = null;
    this.turbineGain = null;
    this.turbineOsc = null;
    this._lastSfxTime = 0;
  }

  unlock() {
    if (this.muted) return;
    if (this.initialized && this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return;
    }

    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try {
      this.ctx = new AC();
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }

      // Мастер-компрессор и общий регулятор громкости — гарантируют отсутствие хрипов и клиппинга
      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.value = -18;
      this.compressor.knee.value = 18;
      this.compressor.ratio.value = 6;
      this.compressor.attack.value = 0.005;
      this.compressor.release.value = 0.18;

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.85;
      this.compressor.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      // Буфер мягкого броуновского/розового шума воды (4 секунды без шва)
      const sr = this.ctx.sampleRate;
      const bufSize = sr * 4;
      const noiseBuf = this.ctx.createBuffer(1, bufSize, sr);
      const data = noiseBuf.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, lastOut = 0;
      for (let i = 0; i < bufSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99765 * b0 + white * 0.0990460;
        b1 = 0.96300 * b1 + white * 0.2965164;
        b2 = 0.57000 * b2 + white * 1.0526913;
        const pink = (b0 + b1 + b2 + white * 0.1848) * 0.045;
        lastOut = 0.94 * lastOut + 0.06 * pink;
        // Плавная сшивка краёв буфера для идеальной бесшовной петли
        const edgeFade = i < 1200 ? (i / 1200) : (i > bufSize - 1200 ? ((bufSize - i) / 1200) : 1.0);
        data[i] = clamp(lastOut * 3.2, -0.85, 0.85) * edgeFade + (1.0 - edgeFade) * 0.0;
      }

      // 1. Тихий шелест речного течения (полосовой фильтр 340 Гц)
      const streamSrc = this.ctx.createBufferSource();
      streamSrc.buffer = noiseBuf;
      streamSrc.loop = true;
      this.streamFilter = this.ctx.createBiquadFilter();
      this.streamFilter.type = 'bandpass';
      this.streamFilter.frequency.value = 340;
      this.streamFilter.Q.value = 0.65;
      this.streamGain = this.ctx.createGain();
      this.streamGain.gain.value = 0.015;
      streamSrc.connect(this.streamFilter);
      this.streamFilter.connect(this.streamGain);
      this.streamGain.connect(this.compressor);
      streamSrc.start();

      // 2. Мягкий глубокий рокот водопада / водосброса (низкочастотный фильтр 220..680 Гц)
      const spillSrc = this.ctx.createBufferSource();
      spillSrc.buffer = noiseBuf;
      spillSrc.loop = true;
      spillSrc.playbackRate.value = 0.78;
      this.spillFilter = this.ctx.createBiquadFilter();
      this.spillFilter.type = 'lowpass';
      this.spillFilter.frequency.value = 320;
      this.spillGain = this.ctx.createGain();
      this.spillGain.gain.value = 0.0;
      spillSrc.connect(this.spillFilter);
      this.spillFilter.connect(this.spillGain);
      this.spillGain.connect(this.compressor);
      spillSrc.start();

      // 3. Едва уловимый тёплый бас 50 Гц вблизи работающего машзала ГЭС (чистый sine + фильтр 105 Гц)
      this.turbineOsc = this.ctx.createOscillator();
      this.turbineOsc.type = 'sine';
      this.turbineOsc.frequency.value = 50;
      const turbFilter = this.ctx.createBiquadFilter();
      turbFilter.type = 'lowpass';
      turbFilter.frequency.value = 105;
      this.turbineGain = this.ctx.createGain();
      this.turbineGain.gain.value = 0.0;

      this.turbineOsc.connect(turbFilter);
      turbFilter.connect(this.turbineGain);
      this.turbineGain.connect(this.compressor);
      this.turbineOsc.start();

      this.initialized = true;
    } catch {
      // Аудио необязательно, если заблокировано политикой браузера
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (!this.muted && !this.initialized) {
      this.unlock();
    }
    if (this.ctx && this.initialized && this.masterGain) {
      if (!this.muted && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      const t = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(t);
      this.masterGain.gain.setTargetAtTime(this.muted ? 0.0 : 0.85, t, 0.06);
    }
    return this.muted;
  }

  /**
   * Обновляет фоновую акустику с учётом масштаба карты (0.8 / 5 / 10 км)
   * и реальной близости камеры к плотине/воде!
   */
  updateContinuous(camDist, spillwayFlow, totalMW, distToHydro = Infinity) {
    if (!this.initialized || this.muted || !this.ctx) return;
    if (this.ctx.state === 'suspended') return;

    const refDist = Math.max(180, WORLD.defaultDist || 920);
    const zoomFactor = clamp(1.0 - (camDist - WORLD.minZoom) / (refDist * 1.45), 0.12, 1.0);

    // Нормируем перелив и мощность к масштабу бассейна, чтобы на 5×5 и 10×10 км не было перегруза!
    const normSpill = Math.max(0, spillwayFlow) / Math.max(1, WORLD.flowScale * 85);
    const normMW = Math.max(0, totalMW) / Math.max(1, WORLD.powerScale * 18);

    const hydroProx = Number.isFinite(distToHydro)
      ? clamp(1.0 - distToHydro / (refDist * 0.85), 0.0, 1.0)
      : zoomFactor * 0.4;

    const t = this.ctx.currentTime;

    // 1. Спокойный шелест реки (тихий, ненавязчивый фон)
    const streamVol = clamp(0.008 + zoomFactor * 0.024, 0.006, 0.034);
    this.streamGain.gain.setTargetAtTime(streamVol, t, 0.18);
    this.streamFilter.frequency.setTargetAtTime(280 + zoomFactor * 210, t, 0.18);

    // 2. Шум сброса воды / перелива плотины (мягкий низкий гул водопада при приближении)
    const spillVol = clamp(normSpill * 0.042 * (0.25 + 0.75 * hydroProx) * zoomFactor, 0.0, 0.055);
    const spillFreq = clamp(240 + normSpill * 180 + zoomFactor * 160, 220, 680);
    this.spillGain.gain.setTargetAtTime(spillVol, t, 0.16);
    this.spillFilter.frequency.setTargetAtTime(spillFreq, t, 0.16);

    // 3. Тёплый басовый гул 50 Гц слышен ТОЛЬКО вблизи работающего машзала ГЭС!
    const humVol = normMW > 0.01
      ? clamp(normMW * 0.016, 0.002, 0.015) * hydroProx * zoomFactor
      : 0.0;
    this.turbineGain.gain.setTargetAtTime(humVol, t, 0.20);
    this.turbineOsc.frequency.setTargetAtTime(50.0, t, 0.25);
  }

  playTone(freq = 440, dur = 0.11, type = 'sine', vol = 0.045, delaySec = 0) {
    if (!this.initialized || this.muted || !this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
      return;
    }
    try {
      const startT = this.ctx.currentTime + delaySec;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = type === 'sawtooth' ? 'triangle' : type;
      osc.frequency.setValueAtTime(freq, startT);

      // Мягкая атака 8 мс без щелчка и плавное затухание
      g.gain.setValueAtTime(0.0001, startT);
      g.gain.linearRampToValueAtTime(vol, startT + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0005, startT + dur);

      osc.connect(g);
      g.connect(this.compressor || this.ctx.destination);
      osc.start(startT);
      osc.stop(startT + dur + 0.02);
    } catch { /* ignore */ }
  }

  /** Мягкий звук укладки бетона / монтажа конструкции */
  playBuild() {
    const now = performance.now();
    if (now - this._lastSfxTime < 65) return;
    this._lastSfxTime = now;
    this.playTone(196, 0.075, 'sine', 0.042, 0);
    this.playTone(293.66, 0.095, 'triangle', 0.032, 0.038);
  }

  /** Мягкий глухой звук выемки грунта экскаватором (без резкого писка!) */
  playDig() {
    const now = performance.now();
    if (now - this._lastSfxTime < 85) return;
    this._lastSfxTime = now;
    if (!this.initialized || this.muted || !this.ctx || this.ctx.state === 'suspended') return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(118 + Math.random() * 18, t);
      osc.frequency.exponentialRampToValueAtTime(58, t + 0.075);

      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.045, t + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0005, t + 0.08);

      osc.connect(g);
      g.connect(this.compressor || this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.09);
    } catch { /* ignore */ }
  }

  /** Торжественный мягкий аккорд при получении гранта или завершении шага */
  playMilestone() {
    this.playTone(523.25, 0.16, 'sine', 0.048, 0.00);
    this.playTone(659.25, 0.18, 'sine', 0.045, 0.09);
    this.playTone(783.99, 0.26, 'sine', 0.050, 0.18);
  }
}
