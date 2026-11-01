/* Процедурный звук на WebAudio: без файлов, работает офлайн. */
(function () {
  const TR = (window.TR = window.TR || {});
  const A = (TR.Audio = { enabled: true, ctx: null, master: null });

  function ensure() {
    if (A.ctx) {
      if (A.ctx.state === 'suspended') A.ctx.resume();
      return A.ctx;
    }
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    A.ctx = new Ctx();
    A.master = A.ctx.createGain();
    A.master.gain.value = 0.22;
    A.master.connect(A.ctx.destination);
    return A.ctx;
  }

  function tone(freq, dur, type, gain, delay) {
    const ctx = ensure();
    if (!ctx || !A.enabled) return;
    const t0 = ctx.currentTime + (delay || 0);
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain || 0.12, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g);
    g.connect(A.master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  function noise(dur, gain, freq) {
    const ctx = ensure();
    if (!ctx || !A.enabled) return;
    const len = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = freq || 900;
    const g = ctx.createGain();
    g.gain.value = gain || 0.08;
    src.connect(filter);
    filter.connect(g);
    g.connect(A.master);
    src.start();
  }

  A.play = function (name) {
    if (!A.enabled) return;
    switch (name) {
      case 'coin':
        tone(880, 0.09, 'triangle', 0.06);
        tone(1320, 0.12, 'triangle', 0.045, 0.05);
        break;
      case 'place':
        tone(180, 0.14, 'square', 0.05);
        noise(0.12, 0.05, 700);
        break;
      case 'build':
        tone(120, 0.2, 'sawtooth', 0.04);
        noise(0.22, 0.06, 500);
        break;
      case 'ready':
        tone(523, 0.16, 'sine', 0.07);
        tone(659, 0.18, 'sine', 0.06, 0.1);
        tone(784, 0.26, 'sine', 0.05, 0.2);
        break;
      case 'levelup':
        [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.22, 'triangle', 0.055, i * 0.08));
        break;
      case 'contract':
        tone(659, 0.12, 'triangle', 0.06);
        tone(988, 0.2, 'triangle', 0.05, 0.09);
        break;
      case 'objective':
        [784, 988, 1175].forEach((f, i) => tone(f, 0.24, 'sine', 0.06, i * 0.09));
        break;
      case 'event':
        tone(440, 0.14, 'sine', 0.05);
        tone(587, 0.2, 'sine', 0.045, 0.1);
        break;
      case 'bad':
        tone(220, 0.18, 'sawtooth', 0.04);
        tone(165, 0.26, 'sawtooth', 0.035, 0.1);
        break;
      case 'error':
        tone(160, 0.1, 'square', 0.04);
        break;
    }
  };

  A.toggle = function () {
    A.enabled = !A.enabled;
    if (A.enabled) ensure();
    return A.enabled;
  };
})();
