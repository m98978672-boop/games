/* БАЗА — процедурный звук на WebAudio: без внешних файлов, как у других игр. */
(function () {
  let ctx = null;
  let muted = false;

  function ac() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, dur, type, vol, when, slideTo) {
    const c = ac();
    if (!c || muted) return;
    const t0 = c.currentTime + (when || 0);
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol || 0.12, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  GB.audio = {
    setMuted(m) { muted = m; },
    isMuted() { return muted; },
    unlock() { ac(); },
    play(name) {
      if (muted) return;
      switch (name) {
        case 'catch':  tone(620, 0.10, 'sine', 0.14, 0, 940); tone(940, 0.12, 'sine', 0.10, 0.07); break;
        case 'miss':   tone(180, 0.12, 'triangle', 0.06, 0, 120); break;
        case 'expire': tone(300, 0.16, 'sine', 0.05, 0, 160); break;
        case 'click':  tone(440, 0.05, 'square', 0.04); break;
        case 'pause':  tone(330, 0.08, 'sine', 0.07); break;
        case 'end':    [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.22, 'sine', 0.11, i * 0.13)); break;
        case 'record': [784, 988, 1175, 1568].forEach((f, i) => tone(f, 0.18, 'triangle', 0.10, i * 0.09)); break;
      }
    },
  };
})();
