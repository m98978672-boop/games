// Звук склада на WebAudio: шаги, удар коробки, сигнал доставки, клики пульта.
// Всё синтезируется на месте — никаких внешних файлов и CDN.
window.WC = window.WC || {};

WC.audio = (function () {
  'use strict';

  var ctx = null;
  var master = null;
  var muted = false;
  var lastStep = 0;

  function ensure() {
    if (ctx) return ctx;
    var Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    try {
      ctx = new Ctor();
      master = ctx.createGain();
      master.gain.value = 0.28;
      master.connect(ctx.destination);
    } catch (err) {
      ctx = null;
    }
    return ctx;
  }

  function resume() {
    var c = ensure();
    if (c && c.state === 'suspended') c.resume();
    return c;
  }

  function tone(freq, duration, type, gain, slideTo) {
    var c = ensure();
    if (!c || muted) return;
    var osc = c.createOscillator();
    var g = c.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, c.currentTime);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(40, slideTo), c.currentTime + duration);
    g.gain.setValueAtTime(0.0001, c.currentTime);
    g.gain.exponentialRampToValueAtTime(gain == null ? 0.2 : gain, c.currentTime + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + duration);
    osc.connect(g);
    g.connect(master);
    osc.start();
    osc.stop(c.currentTime + duration + 0.02);
  }

  function noise(duration, gain, filterFreq) {
    var c = ensure();
    if (!c || muted) return;
    var size = Math.floor(c.sampleRate * duration);
    var buffer = c.createBuffer(1, size, c.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < size; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / size, 2.4);
    }
    var src = c.createBufferSource();
    src.buffer = buffer;
    var filter = c.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = filterFreq || 900;
    var g = c.createGain();
    g.gain.value = gain == null ? 0.35 : gain;
    src.connect(filter);
    filter.connect(g);
    g.connect(master);
    src.start();
  }

  return {
    unlock: resume,
    setMuted: function (value) {
      muted = Boolean(value);
      if (muted && WC.voice) WC.voice.cancel();
      return muted;
    },
    isMuted: function () { return muted; },
    click: function () { tone(520, 0.05, 'square', 0.09); },
    select: function () { tone(680, 0.08, 'triangle', 0.12, 820); },
    step: function (intensity) {
      var now = Date.now();
      if (now - lastStep < 220) return;
      lastStep = now;
      noise(0.08, 0.12 + 0.1 * (intensity || 0.5), 620);
    },
    pick: function () { noise(0.16, 0.24, 480); tone(220, 0.1, 'sine', 0.1); },
    place: function () { noise(0.18, 0.3, 320); tone(160, 0.14, 'sine', 0.14, 120); },
    drop: function () { noise(0.3, 0.5, 240); tone(90, 0.3, 'sawtooth', 0.16, 60); },
    delivered: function () { tone(660, 0.12, 'triangle', 0.16); setTimeout(function () { tone(880, 0.16, 'triangle', 0.14); }, 90); },
    urgent: function () { tone(340, 0.18, 'square', 0.12, 300); setTimeout(function () { tone(300, 0.2, 'square', 0.12, 260); }, 200); },
    tired: function () { tone(200, 0.24, 'sine', 0.12, 150); },
    shiftEnd: function () {
      [523, 659, 784, 1046].forEach(function (f, i) {
        setTimeout(function () { tone(f, 0.24, 'triangle', 0.16); }, i * 140);
      });
    },
  };
})();
