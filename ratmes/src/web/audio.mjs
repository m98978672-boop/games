// Тихий Web Audio синтезатор для уведомлений RatMes (по рецептам RatCore.audio, без тяжёлых mp3).

export function createAudioCue() {
  let ctx = null;
  let muted = false;

  function ensureCtx() {
    if (muted || typeof window === 'undefined') return null;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    if (!ctx) ctx = new AudioCtx();
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  }

  function playTone(freq = 640, duration = 0.08, type = 'sine', gainPeak = 0.05) {
    const audio = ensureCtx();
    if (!audio) return;
    try {
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audio.currentTime);
      gain.gain.setValueAtTime(0.0001, audio.currentTime);
      gain.gain.exponentialRampToValueAtTime(gainPeak, audio.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + duration);
      osc.connect(gain);
      gain.connect(audio.destination);
      osc.start();
      osc.stop(audio.currentTime + duration + 0.01);
    } catch { /* ignore */ }
  }

  return {
    isMuted: () => muted,
    toggleMute() {
      muted = !muted;
      return muted;
    },
    sent() { playTone(520, 0.06, 'triangle', 0.04); },
    received() {
      playTone(680, 0.07, 'sine', 0.05);
      setTimeout(() => playTone(880, 0.09, 'sine', 0.04), 65);
    },
    warn() { playTone(260, 0.14, 'sawtooth', 0.035); },
  };
}
