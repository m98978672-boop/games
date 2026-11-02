// Проверка звука без браузера: мок Web Audio API.
// Ловит опечатки в графе узлов и деления на ноль: если что-то не так —
// тест падает, а не «молчит в игре».
import { AudioSystem } from '../src/core/audio.js';

class Param {
  constructor(value = 0) {
    this.value = value;
    this.events = 0;
  }
  setValueAtTime(v) {
    this.value = v;
    this.events++;
    return this;
  }
  linearRampToValueAtTime(v) {
    this.value = v;
    this.events++;
    return this;
  }
  exponentialRampToValueAtTime(v) {
    if (v <= 0) throw new Error('exponentialRampToValueAtTime: значение должно быть > 0');
    this.value = v;
    this.events++;
    return this;
  }
  setTargetAtTime(v) {
    if (!Number.isFinite(v)) throw new Error('setTargetAtTime: не число');
    this.value = v;
    this.events++;
    return this;
  }
  cancelScheduledValues() {
    return this;
  }
}

let started = 0;
const node = (extra = {}) => ({
  connect(dest) {
    return dest;
  },
  disconnect() {},
  ...extra,
});

class MockContext {
  constructor() {
    this.sampleRate = 48000;
    this.currentTime = 0;
    this.state = 'running';
    this.destination = node();
  }
  resume() {}
  createGain() {
    return node({ gain: new Param(1) });
  }
  createOscillator() {
    return node({
      type: 'sine',
      frequency: new Param(440),
      detune: new Param(0),
      start() {
        started++;
      },
      stop() {},
    });
  }
  createBufferSource() {
    return node({
      buffer: null,
      loop: false,
      playbackRate: new Param(1),
      start() {
        started++;
      },
      stop() {},
    });
  }
  createBiquadFilter() {
    return node({ type: 'lowpass', frequency: new Param(350), Q: new Param(1), gain: new Param(0) });
  }
  createWaveShaper() {
    return node({ curve: null, oversample: 'none' });
  }
  createDynamicsCompressor() {
    return node({
      threshold: new Param(-24),
      knee: new Param(30),
      ratio: new Param(12),
      attack: new Param(0.003),
      release: new Param(0.25),
    });
  }
  createStereoPanner() {
    return node({ pan: new Param(0) });
  }
  createConvolver() {
    return node({ buffer: null, normalize: true });
  }
  createBuffer(channels, length, rate) {
    const data = [...Array(channels)].map(() => new Float32Array(length));
    return {
      numberOfChannels: channels,
      length,
      sampleRate: rate,
      duration: length / rate,
      getChannelData: (i) => data[i],
    };
  }
}

globalThis.window = { AudioContext: MockContext };

const audio = new AudioSystem();
audio.init();
audio.setVolume(0.8);
audio.setCabin(false);

let nan = 0;
const frame = (i) => {
  audio.ctx.currentTime += 1 / 60;
  const t = i / 60;
  audio.update({
    rpm: 650 + Math.sin(t) * 600 + (i % 40 === 0 ? 900 : 0),
    throttle: (i % 30) / 30,
    brake: i % 25 === 0 ? 0.8 : 0,
    speed: 12 + Math.sin(t * 0.3) * 10,
    rain: i > 100 ? 0.6 : 0,
    engineOn: true,
    gear: 1 + (i % 12),
    load: 0.4,
    retarder: i > 150 ? 0.6 : 0,
    roughness: 0.3,
    slip: 0.1,
    lateral: Math.sin(t) * 2,
  });
  if (!Number.isFinite(audio.engineFilter.frequency.value)) nan++;
};

for (let i = 0; i < 240; i++) frame(i);
audio.setCabin(true);
for (let i = 0; i < 60; i++) frame(240 + i);
audio.shift();
audio.airRelease();
audio.airPurge();
audio.honk();
audio.thump(0.7);
audio.wiper(0.8);
audio.engineStart();
audio.engineStop();
audio.indicator();
audio.cash();
audio.alarm();
audio.click();
audio.setEnabled(false);
audio.setEnabled(true);

const ok = started > 30 && nan === 0;
console.log(`узлов запущено: ${started}; NaN в параметрах: ${nan}`);
if (!ok) {
  console.error('❌ звуковой граф собран неправильно');
  process.exit(1);
}
console.log('✅ звук: граф собирается, события играют, параметры конечные');
