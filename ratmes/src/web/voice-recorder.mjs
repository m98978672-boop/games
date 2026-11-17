// Запись голосовых заметок в браузере (MediaRecorder + Web Audio AnalyserNode + живая волна на canvas)
// с автоматическим откатом на синтетический playable WAV через pack.voice, если микрофон недоступен.

export function createVoiceRecorder({ canvasEl = null, timerEl = null } = {}) {
  let mediaRecorder = null;
  let stream = null;
  let audioCtx = null;
  let analyser = null;
  let chunks = [];
  let peaksHistory = [];
  let rafId = null;
  let startedAt = 0;
  let recording = false;

  function drawLiveWave() {
    if (!recording || !analyser || !canvasEl) return;
    const ctx = canvasEl.getContext('2d');
    const buf = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteTimeDomainData(buf);

    let peak = 0;
    for (let i = 0; i < buf.length; i += 1) {
      const v = Math.abs((buf[i] - 128) / 128);
      if (v > peak) peak = v;
    }
    peaksHistory.push(Math.max(12, Math.min(100, Math.round(peak * 140))));
    if (peaksHistory.length > 64) peaksHistory.shift();

    const w = canvasEl.width;
    const h = canvasEl.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#e8b45a';
    const barW = Math.max(2, Math.floor(w / 48) - 1);
    const slice = peaksHistory.slice(-48);
    slice.forEach((p, idx) => {
      const bh = Math.max(3, (p / 100) * (h - 4));
      ctx.fillRect(idx * (barW + 1), (h - bh) / 2, barW, bh);
    });

    if (timerEl) {
      const sec = (Date.now() - startedAt) / 1000;
      timerEl.textContent = `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, '0')}`;
    }
    rafId = requestAnimationFrame(drawLiveWave);
  }

  function cleanup() {
    recording = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    if (stream) {
      for (const t of stream.getTracks()) t.stop();
      stream = null;
    }
    if (audioCtx) {
      audioCtx.close().catch(() => {});
      audioCtx = null;
    }
    analyser = null;
    mediaRecorder = null;
  }

  async function start() {
    if (recording) return { started: true, fallbackSynthetic: false };
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      return { started: false, fallbackSynthetic: true, reason: 'Микрофон или MediaRecorder недоступен' };
    }
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        audioCtx = new AudioCtx();
        const src = audioCtx.createMediaStreamSource(stream);
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        src.connect(analyser);
      }
      chunks = [];
      peaksHistory = [];
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus') ? 'audio/ogg;codecs=opus' : '');
      mediaRecorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorder.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) chunks.push(ev.data);
      };
      mediaRecorder.start(120);
      startedAt = Date.now();
      recording = true;
      drawLiveWave();
      return { started: true, fallbackSynthetic: false };
    } catch (err) {
      cleanup();
      return { started: false, fallbackSynthetic: true, reason: err?.message || 'Нет доступа к микрофону' };
    }
  }

  function stop() {
    return new Promise((resolve) => {
      if (!recording || !mediaRecorder) {
        cleanup();
        resolve(null);
        return;
      }
      const durationSec = Math.max(0.4, Number(((Date.now() - startedAt) / 1000).toFixed(2)));
      const waveform = downsamplePeaks(peaksHistory, 32);
      const rec = mediaRecorder;
      rec.onstop = () => {
        const mimeType = rec.mimeType || 'audio/webm';
        const blob = new Blob(chunks, { type: mimeType });
        const reader = new FileReader();
        reader.onload = () => {
          const raw = String(reader.result || '');
          const comma = raw.indexOf(',');
          const base64 = comma >= 0 ? raw.slice(comma + 1) : raw;
          cleanup();
          resolve({ base64, mimeType, durationSec, waveform, sizeBytes: blob.size });
        };
        reader.onerror = () => {
          cleanup();
          resolve(null);
        };
        reader.readAsDataURL(blob);
      };
      try { rec.stop(); } catch { cleanup(); resolve(null); }
    });
  }

  function cancel() {
    if (mediaRecorder && recording) {
      mediaRecorder.onstop = null;
      try { mediaRecorder.stop(); } catch { /* ignore */ }
    }
    cleanup();
  }

  return {
    isRecording: () => recording,
    start,
    stop,
    cancel,
  };
}

function downsamplePeaks(arr, targetLen = 32) {
  if (!arr.length) return Array.from({ length: targetLen }, (_, i) => 22 + ((i * 19) % 55));
  const out = [];
  for (let i = 0; i < targetLen; i += 1) {
    const idx = Math.min(arr.length - 1, Math.floor((i / targetLen) * arr.length));
    out.push(arr[idx]);
  }
  return out;
}
