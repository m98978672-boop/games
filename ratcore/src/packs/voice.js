// RatCore Pack [pack:voice] — Офлайн 3-формантный синтез голосов, рации и липсинка (0 КБ сэмплов, F-156..F-157, A-104)
// Подключается строго по выбору (Zero-Cost Opt-In, RC-108 когда пакет выключен).

import { clamp, createRng } from '../core/math.js';
import { RatCoreError } from '../core/seal.js';

export const VOICE_STYLES = Object.freeze(['natural', 'radio', 'robot', 'megaphone', 'whisper', 'gibberish-cute']);

// Таблица формант (F1, F2, F3 в Гц) и визем рта для гласных и базовых согласных (RU + EN)
const PHONEME_MAP = {
  a: { f: [730, 1090, 2440], viseme: 'A', open: 0.92, round: 0.25 },
  а: { f: [730, 1090, 2440], viseme: 'A', open: 0.92, round: 0.25 },
  я: { f: [680, 1320, 2500], viseme: 'A', open: 0.85, round: 0.20 },
  e: { f: [530, 1840, 2480], viseme: 'E', open: 0.62, round: 0.15 },
  е: { f: [530, 1840, 2480], viseme: 'E', open: 0.62, round: 0.15 },
  э: { f: [580, 1750, 2450], viseme: 'E', open: 0.68, round: 0.15 },
  i: { f: [270, 2290, 3010], viseme: 'I', open: 0.35, round: 0.08 },
  и: { f: [270, 2290, 3010], viseme: 'I', open: 0.35, round: 0.08 },
  ы: { f: [340, 1520, 2420], viseme: 'I', open: 0.40, round: 0.12 },
  o: { f: [570, 840, 2410], viseme: 'O', open: 0.72, round: 0.82 },
  о: { f: [570, 840, 2410], viseme: 'O', open: 0.72, round: 0.82 },
  ё: { f: [540, 920, 2410], viseme: 'O', open: 0.70, round: 0.80 },
  u: { f: [300, 870, 2240], viseme: 'U', open: 0.38, round: 0.95 },
  у: { f: [300, 870, 2240], viseme: 'U', open: 0.38, round: 0.95 },
  ю: { f: [320, 1180, 2320], viseme: 'U', open: 0.42, round: 0.88 },
  m: { f: [280, 1100, 2200], viseme: 'M', open: 0.05, round: 0.10, consonant: true },
  м: { f: [280, 1100, 2200], viseme: 'M', open: 0.05, round: 0.10, consonant: true },
  p: { f: [280, 1100, 2200], viseme: 'M', open: 0.04, round: 0.10, consonant: true },
  п: { f: [280, 1100, 2200], viseme: 'M', open: 0.04, round: 0.10, consonant: true },
  b: { f: [280, 1100, 2200], viseme: 'M', open: 0.06, round: 0.10, consonant: true },
  б: { f: [280, 1100, 2200], viseme: 'M', open: 0.06, round: 0.10, consonant: true },
  f: { f: [360, 1450, 2600], viseme: 'F', open: 0.16, round: 0.15, fricative: true },
  ф: { f: [360, 1450, 2600], viseme: 'F', open: 0.16, round: 0.15, fricative: true },
  v: { f: [360, 1450, 2600], viseme: 'F', open: 0.18, round: 0.15, fricative: true },
  в: { f: [360, 1450, 2600], viseme: 'F', open: 0.18, round: 0.15, fricative: true },
  s: { f: [400, 1900, 3200], viseme: 'S', open: 0.22, round: 0.05, fricative: true },
  с: { f: [400, 1900, 3200], viseme: 'S', open: 0.22, round: 0.05, fricative: true },
  ш: { f: [380, 1600, 2800], viseme: 'S', open: 0.28, round: 0.45, fricative: true },
};

const EMOTION_MOD = {
  neutral: { pitchMul: 1.0, rateMul: 1.0, energy: 0.85 },
  calm: { pitchMul: 0.92, rateMul: 0.88, energy: 0.72 },
  urgent: { pitchMul: 1.18, rateMul: 1.24, energy: 1.0 },
  happy: { pitchMul: 1.14, rateMul: 1.10, energy: 0.92 },
  tired: { pitchMul: 0.84, rateMul: 0.78, energy: 0.62 },
};

export class VoiceSynthSuite {
  constructor() {
    this.profiles = new Map();
    this.utterances = new Map();
    this.nextUtteranceId = 1;
    // Предустановленный профиль командира по рации
    this.createProfile({ id: 'commander-radio', pitchHz: 135, formants: [1.0, 1.0, 1.0], style: 'radio' });
  }

  createProfile({ id = 'voice-default', pitchHz = 160, formants = [1.0, 1.0, 1.0], style = 'natural' } = {}) {
    const profile = {
      id: String(id),
      pitchHz: clamp(Number(pitchHz), 65, 420),
      formantScale: [
        clamp(Number(formants[0] ?? 1.0), 0.65, 1.5),
        clamp(Number(formants[1] ?? 1.0), 0.65, 1.5),
        clamp(Number(formants[2] ?? 1.0), 0.65, 1.5),
      ],
      style: VOICE_STYLES.includes(style) ? style : 'natural',
    };
    this.profiles.set(profile.id, profile);
    return { ...profile };
  }

  // 3-формантный PCM-синтез + поток визем рта (F-156, F-157, A-104)
  speak({ profileId = 'commander-radio', text = 'Приём', emotion = 'neutral', sampleRate = 16000, seed = 42 } = {}) {
    const profile = this.profiles.get(profileId);
    if (!profile) {
      throw new RatCoreError('RC-104', `Голосовой профиль "${profileId}" не найден`, 'Создай профиль через voice.createProfile().');
    }
    const cleanText = String(text || '').trim() || '...';
    const emo = EMOTION_MOD[emotion] || EMOTION_MOD.neutral;
    const sr = clamp(Number(sampleRate) | 0, 8000, 48000);
    const rng = createRng(seed ^ cleanText.length * 7919);

    const chars = [...cleanText.toLowerCase()];
    const baseCharDur = (profile.style === 'gibberish-cute' ? 0.068 : 0.075) / emo.rateMul;
    const radioPad = profile.style === 'radio' ? 0.06 : 0;

    // Строим временную шкалу фонем и визем
    const timeline = [];
    let cursorSec = radioPad;
    for (const ch of chars) {
      if (/\s|[,.!?;:—-]/.test(ch)) {
        const pauseDur = /[.!?]/.test(ch) ? baseCharDur * 2.1 : baseCharDur * 0.85;
        timeline.push({ startSec: cursorSec, endSec: cursorSec + pauseDur, viseme: 'rest', open: 0, round: 0, f: null, silent: true });
        cursorSec += pauseDur;
        continue;
      }
      const p = PHONEME_MAP[ch] || { f: [450, 1400, 2550], viseme: 'E', open: 0.45, round: 0.2, consonant: true };
      const dur = p.consonant ? baseCharDur * 0.72 : baseCharDur * 1.15;
      timeline.push({
        startSec: cursorSec,
        endSec: cursorSec + dur,
        viseme: p.viseme,
        open: p.open,
        round: p.round,
        f: [
          p.f[0] * profile.formantScale[0],
          p.f[1] * profile.formantScale[1],
          p.f[2] * profile.formantScale[2],
        ],
        fricative: Boolean(p.fricative),
        silent: false,
      });
      cursorSec += dur;
    }
    const totalDur = cursorSec + radioPad;
    const totalSamples = Math.max(64, Math.ceil(totalDur * sr));
    const samples = new Float32Array(totalSamples);

    const f0Base = profile.pitchHz * emo.pitchMul * (profile.style === 'gibberish-cute' ? 1.45 : 1.0);
    let phase0 = 0;

    // Рендер 3-формантного сигнала + тембровых эффектов стиля
    for (const seg of timeline) {
      if (seg.silent || !seg.f) continue;
      const iStart = Math.max(0, Math.floor(seg.startSec * sr));
      const iEnd = Math.min(totalSamples, Math.floor(seg.endSec * sr));
      const len = Math.max(1, iEnd - iStart);
      const [F1, F2, F3] = seg.f;

      for (let i = iStart; i < iEnd; i++) {
        const localT = (i - iStart) / len;
        const env = Math.sin(Math.PI * localT);
        const tSec = i / sr;
        const intonation = 1 + 0.08 * Math.sin(tSec * 7.5) - 0.1 * (tSec / totalDur);
        const f0 = f0Base * intonation;
        phase0 += (2 * Math.PI * f0) / sr;

        // Голосовой источник + 3 формантных резонанса (F-156)
        const glottal = 0.55 * Math.sin(phase0) + 0.28 * Math.sin(2 * phase0) + 0.17 * Math.sin(3 * phase0);
        const form = 0.52 * Math.sin(2 * Math.PI * F1 * tSec)
          + 0.31 * Math.sin(2 * Math.PI * F2 * tSec)
          + 0.17 * Math.sin(2 * Math.PI * F3 * tSec);
        const noise = (rng.next() * 2 - 1);

        let val = seg.fricative
          ? (noise * 0.45 + form * 0.25)
          : ((glottal * 0.45 + glottal * form * 0.85) + noise * 0.04);

        if (profile.style === 'whisper') {
          val = noise * 0.32 * (0.4 + 0.6 * Math.abs(form));
        } else if (profile.style === 'robot') {
          val = val * Math.sin(2 * Math.PI * 52 * tSec) * 1.15;
        } else if (profile.style === 'megaphone') {
          val = Math.tanh(val * 3.1) * 0.85;
        } else if (profile.style === 'radio') {
          // Имитация узкополосного радиоканала 300..3000 Гц + лёгкий шум эфира
          val = Math.tanh(val * 2.2) * 0.72 + noise * 0.055;
        }

        samples[i] = clamp(val * env * emo.energy, -1, 1);
      }
    }

    // Короткий squelch-сигнал рации в начале и конце передачи
    if (profile.style === 'radio') {
      const beepLen = Math.min(Math.floor(sr * 0.035), totalSamples >> 2);
      for (let i = 0; i < beepLen; i++) {
        const env = Math.sin((Math.PI * i) / beepLen);
        samples[i] = clamp(samples[i] + Math.sin((2 * Math.PI * 1450 * i) / sr) * 0.28 * env, -1, 1);
        const j = totalSamples - beepLen + i;
        samples[j] = clamp(samples[j] + Math.sin((2 * Math.PI * 980 * i) / sr) * 0.25 * env, -1, 1);
      }
    }

    let peak = 0;
    for (let i = 0; i < samples.length; i++) {
      const a = Math.abs(samples[i]);
      if (a > peak) peak = a;
    }

    const voiceId = `utt-${this.nextUtteranceId++}`;
    const visemes = timeline.map((s) => ({
      startSec: Number(s.startSec.toFixed(3)),
      endSec: Number(s.endSec.toFixed(3)),
      viseme: s.viseme,
      mouthOpen: Number(s.open.toFixed(2)),
      lipRound: Number(s.round.toFixed(2)),
    }));

    this.utterances.set(voiceId, { voiceId, profileId, durationSec: totalDur, visemes });

    return {
      voiceId,
      profileId,
      style: profile.style,
      sampleRate: sr,
      durationSec: Number(totalDur.toFixed(3)),
      sampleCount: samples.length,
      peakAmplitude: Number(peak.toFixed(4)),
      externalAssetBytes: 0,
      visemeCount: visemes.length,
      visemes,
      samples,
    };
  }

  // Возвращает точное состояние рта и визему на заданный момент времени (F-157)
  getViseme({ voiceId, timeSec = 0 } = {}) {
    const utt = this.utterances.get(voiceId);
    if (!utt) {
      throw new RatCoreError('RC-104', `Высказывание "${voiceId}" не найдено`, 'Сначала вызови voice.speak().');
    }
    const t = clamp(Number(timeSec), 0, utt.durationSec);
    const seg = utt.visemes.find((v) => t >= v.startSec && t <= v.endSec) || { viseme: 'rest', mouthOpen: 0, lipRound: 0 };
    return {
      voiceId,
      timeSec: Number(t.toFixed(3)),
      viseme: seg.viseme,
      mouthOpen: seg.mouthOpen,
      lipRound: seg.lipRound,
      speaking: seg.viseme !== 'rest',
    };
  }
}
