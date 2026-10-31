// ============================================================================
//  ПРОЦЕДУРНЫЙ ЗВУК НА WEBAUDIO (шум реки и водосбросов, гул турбин 50 Гц, UI)
//  Без внешних аудиофайлов — мгновенная загрузка как в last-shore и frontline
// ============================================================================

import { clamp } from './noise.js';

export class HydroAudio {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.initialized = false;
    this.waterGain = null;
    this.waterFilter = null;
    this.turbineGain = null;
    this.turbineOsc = null;
  }

  unlock() {
    if (this.initialized || this.muted) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try {
      this.ctx = new AC();
      if (this.ctx.state === 'suspended') this.ctx.resume();

      // 1. Розовый/белый шум бурлящей воды и водопадов
      const bufSize = this.ctx.sampleRate * 2;
      const noiseBuf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
      const data = noiseBuf.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.997 * b0 + white * 0.029;
        b1 = 0.985 * b1 + white * 0.032;
        b2 = 0.950 * b2 + white * 0.048;
        data[i] = clamp((b0 + b1 + b2 + white * 0.04) * 1.8, -1, 1);
      }

      const noiseSrc = this.ctx.createBufferSource();
      noiseSrc.buffer = noiseBuf;
      noiseSrc.loop = true;

      this.waterFilter = this.ctx.createBiquadFilter();
      this.waterFilter.type = 'lowpass';
      this.waterFilter.frequency.value = 620;

      this.waterGain = this.ctx.createGain();
      this.waterGain.gain.value = 0.04;

      noiseSrc.connect(this.waterFilter);
      this.waterFilter.connect(this.waterGain);
      this.waterGain.connect(this.ctx.destination);
      noiseSrc.start();

      // 2. Мягкий благородный гул гидрогенераторов (100 Гц / 50 Гц)
      this.turbineOsc = this.ctx.createOscillator();
      this.turbineOsc.type = 'triangle';
      this.turbineOsc.frequency.value = 98;
      const turbFilter = this.ctx.createBiquadFilter();
      turbFilter.type = 'lowpass';
      turbFilter.frequency.value = 190;
      this.turbineGain = this.ctx.createGain();
      this.turbineGain.gain.value = 0.0;

      this.turbineOsc.connect(turbFilter);
      turbFilter.connect(this.turbineGain);
      this.turbineGain.connect(this.ctx.destination);
      this.turbineOsc.start();

      this.initialized = true;
    } catch {
      // Аудио необязательно, если заблокировано браузером
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (!this.muted && !this.initialized) {
      this.unlock();
    }
    if (this.ctx && this.initialized) {
      if (this.muted) {
        this.waterGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.08);
        this.turbineGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.08);
      }
    }
    return this.muted;
  }

  updateContinuous(camDist, spillwayFlow, totalMW) {
    if (!this.initialized || this.muted || !this.ctx) return;
    if (this.ctx.state === 'suspended') return;

    const nearFactor = clamp(1.0 - (camDist - 45) / 290, 0.18, 1.0);
    const roar = clamp(0.03 + nearFactor * 0.06 + (spillwayFlow / 140) * 0.14, 0, 0.22);
    const cutoff = clamp(420 + nearFactor * 520 + spillwayFlow * 12, 350, 2400);

    const t = this.ctx.currentTime;
    this.waterGain.gain.setTargetAtTime(roar, t, 0.12);
    this.waterFilter.frequency.setTargetAtTime(cutoff, t, 0.12);

    const hum = totalMW > 0.1 ? clamp(0.012 + (totalMW / 30) * 0.045, 0, 0.065) * nearFactor : 0;
    this.turbineGain.gain.setTargetAtTime(hum, t, 0.15);
    this.turbineOsc.frequency.setTargetAtTime(92 + Math.min(35, totalMW * 0.9), t, 0.2);
  }

  playTone(freq = 440, dur = 0.12, type = 'sine', vol = 0.08) {
    if (!this.initialized || this.muted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
      osc.connect(g);
      g.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + dur + 0.02);
    } catch { /* ignore */ }
  }

  playBuild() {
    this.playTone(210, 0.09, 'triangle', 0.07);
    setTimeout(() => this.playTone(315, 0.11, 'sine', 0.06), 45);
  }

  playDig() {
    this.playTone(135 + Math.random() * 35, 0.07, 'sawtooth', 0.035);
  }

  playMilestone() {
    this.playTone(523.25, 0.16, 'sine', 0.09);
    setTimeout(() => this.playTone(659.25, 0.18, 'sine', 0.09), 110);
    setTimeout(() => this.playTone(783.99, 0.28, 'sine', 0.10), 220);
  }
}
