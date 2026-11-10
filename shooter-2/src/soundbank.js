/* =============================================================================
   СЕКТОР «ПЕПЕЛ» — банк звуков: 250 синтезированных образцов
   -----------------------------------------------------------------------------
   В проекте нет ни одного аудиофайла, и это не изменится: 250 звуков — это
   25 семейств × 10 вариантов, каждый описан набором слоёв (шум, тон, FM,
   свип, гранулы, форманта, модальный резонатор).

   Важное отличие от «списка названий»: любой звук можно ОТРЕНДЕРИТЬ в массив
   семплов прямо здесь (`render`), и получится настоящая звуковая волна —
   её же и играет WebAudio. Поэтому звук проверяется тестом (длина, RMS,
   пик, спектральный центр), а не «на слово».

   API:
     SH2.soundbank.SOUNDS.length        // 250
     SH2.soundbank.describe(id)         // {id, family, title, ...}
     SH2.soundbank.render(id, sr)       // Float32Array — волна
     SH2.soundbank.play(audio, id, x, z, vol)   // через AudioEngine (панорама)
     SH2.soundbank.playAll(audio, filter)       // прогнать пачкой (проверки)
   ============================================================================= */
(function (root) {
  'use strict';
  const SH2 = (root.SH2 = root.SH2 || {});
  const TAU = Math.PI * 2;

  /* ------------------------------- ДПСЧ ---------------------------------- */
  function rngFor(seed) {
    let s = (seed * 1103515245 + 12345) >>> 0;
    return () => {
      s ^= s << 13; s >>>= 0;
      s ^= s >> 17;
      s ^= s << 5; s >>>= 0;
      return s / 4294967296;
    };
  }
  const lerp = (a, b, t) => a + (b - a) * t;

  /* ------------------------------ СЕМЕЙСТВА ------------------------------
     make(rng, v) -> { dur, layers: [ {eng, ...} ], title }
     eng: 'noise' | 'tone' | 'fm' | 'sweep' | 'granular' | 'formant' | 'modal' */
  const FAMILIES = [
    {
      key: 'gun', title: 'выстрел',
      make(rng, v) {
        const heavy = v / 9;
        return {
          dur: lerp(0.16, 0.42, heavy),
          title: 'выстрел ' + (v + 1),
          layers: [
            { eng: 'noise', dur: lerp(0.08, 0.3, heavy), freq: lerp(3200, 900, heavy), q: 0.7 + rng(), gain: 0.9, decay: 1, type: 'lowpass' },
            { eng: 'tone', dur: lerp(0.10, 0.26, heavy), f0: lerp(220, 70, heavy), f1: lerp(60, 32, heavy), wave: 'square', gain: 0.5 },
            { eng: 'noise', dur: 0.02, freq: 5200, q: 2, gain: 0.35, type: 'highpass' }
          ]
        };
      }
    },
    {
      key: 'impact', title: 'попадание',
      make(rng, v) {
        const hard = v / 9;
        return {
          dur: 0.14, title: 'попадание ' + (v + 1),
          layers: [
            { eng: 'noise', dur: lerp(0.05, 0.12, hard), freq: lerp(1400, 3600, hard), q: 1.4, gain: 0.6, type: 'bandpass', decay: 1 },
            { eng: 'tone', dur: 0.07, f0: lerp(300, 900, hard), f1: lerp(150, 400, hard), wave: 'triangle', gain: 0.28 }
          ]
        };
      }
    },
    {
      key: 'explosion', title: 'взрыв',
      make(rng, v) {
        const d = lerp(0.5, 1.6, v / 9);
        return {
          dur: d, title: 'взрыв ' + (v + 1),
          layers: [
            { eng: 'noise', dur: d, freq: lerp(1200, 240, rng()), q: 0.5, gain: 1, type: 'lowpass', decay: 1 },
            { eng: 'tone', dur: d * 0.6, f0: lerp(90, 45, rng()), f1: 25, wave: 'sine', gain: 0.7 },
            { eng: 'granular', dur: d * 0.8, density: 40 + v * 8, gain: 0.25, pitch: lerp(900, 300, rng()) }
          ]
        };
      }
    },
    {
      key: 'step', title: 'шаг',
      make(rng, v) {
        return {
          dur: 0.18, title: 'шаг ' + (v + 1),
          layers: [
            { eng: 'noise', dur: lerp(0.05, 0.12, v / 9), freq: lerp(320, 900, rng()), q: 0.9, gain: 0.5, type: 'lowpass', decay: 1 },
            { eng: 'granular', dur: 0.1, density: 90 + v * 20, gain: 0.12, pitch: 500 + v * 90 }
          ]
        };
      }
    },
    {
      key: 'reload', title: 'перезарядка',
      make(rng, v) {
        return {
          dur: 0.7, title: 'перезарядка ' + (v + 1),
          layers: [
            { eng: 'modal', dur: 0.18, freq: lerp(420, 900, v / 9), gain: 0.4, decayMs: 90 },
            { eng: 'modal', dur: 0.12, freq: lerp(700, 1500, rng()), gain: 0.3, decayMs: 60, delay: 0.22 + rng() * 0.1 },
            { eng: 'modal', dur: 0.1, freq: lerp(500, 1200, rng()), gain: 0.32, decayMs: 50, delay: 0.45 + rng() * 0.12 }
          ]
        };
      }
    },
    {
      key: 'ui', title: 'интерфейс',
      make(rng, v) {
        const f = lerp(520, 1600, v / 9);
        return {
          dur: 0.14, title: 'клик ' + (v + 1),
          layers: [
            { eng: 'tone', dur: 0.06, f0: f, f1: f * lerp(0.8, 1.5, rng()), wave: v % 3 === 0 ? 'sine' : 'triangle', gain: 0.3 },
            { eng: 'tone', dur: 0.05, f0: f * 1.5, f1: f * 1.5, wave: 'sine', gain: 0.16, delay: 0.05 }
          ]
        };
      }
    },
    {
      key: 'alarm', title: 'тревога',
      make(rng, v) {
        const f = lerp(400, 1200, v / 9);
        return {
          dur: 1.2, title: 'тревога ' + (v + 1),
          layers: [
            { eng: 'tone', dur: 0.3, f0: f, f1: f * 1.6, wave: 'square', gain: 0.22 },
            { eng: 'tone', dur: 0.3, f0: f * 1.6, f1: f, wave: 'square', gain: 0.22, delay: 0.32 },
            { eng: 'tone', dur: 0.3, f0: f, f1: f * 1.6, wave: 'square', gain: 0.2, delay: 0.64 }
          ]
        };
      }
    },
    {
      key: 'radio', title: 'радио',
      make(rng, v) {
        return {
          dur: 0.9, title: 'радио ' + (v + 1),
          layers: [
            { eng: 'noise', dur: 0.12, freq: lerp(1800, 4200, rng()), q: 2.2, gain: 0.4, type: 'bandpass' },
            { eng: 'formant', dur: 0.55, f0: lerp(110, 190, rng()), gain: 0.3, formants: [700 + v * 40, 1200 + v * 30] },
            { eng: 'noise', dur: 0.1, freq: 2600, q: 3, gain: 0.22, type: 'bandpass', delay: 0.62 }
          ]
        };
      }
    },
    {
      key: 'metal', title: 'металл',
      make(rng, v) {
        const f = lerp(320, 1800, v / 9);
        return {
          dur: 0.9, title: 'металл ' + (v + 1),
          layers: [
            { eng: 'modal', dur: 0.8, freq: f, gain: 0.5, decayMs: 500 + v * 40 },
            { eng: 'modal', dur: 0.6, freq: f * 1.58, gain: 0.28, decayMs: 320 },
            { eng: 'modal', dur: 0.4, freq: f * 2.31, gain: 0.18, decayMs: 220 },
            { eng: 'noise', dur: 0.03, freq: 5000, q: 1.5, gain: 0.3, type: 'highpass' }
          ]
        };
      }
    },
    {
      key: 'glass', title: 'стекло',
      make(rng, v) {
        return {
          dur: 0.6, title: 'стекло ' + (v + 1),
          layers: [
            { eng: 'noise', dur: 0.06, freq: 6000, q: 0.8, gain: 0.4, type: 'highpass' },
            { eng: 'granular', dur: 0.55, density: 120 + v * 20, gain: 0.28, pitch: 2400 + v * 220 },
            { eng: 'modal', dur: 0.3, freq: 2600 + v * 120, gain: 0.16, decayMs: 160 }
          ]
        };
      }
    },
    {
      key: 'whoosh', title: 'пролёт',
      make(rng, v) {
        return {
          dur: 0.7, title: 'пролёт ' + (v + 1),
          layers: [
            { eng: 'sweep', dur: 0.65, f0: lerp(1800, 400, rng()), f1: lerp(200, 900, rng()), q: 1.6, gain: 0.5 },
            { eng: 'noise', dur: 0.5, freq: 900, q: 0.7, gain: 0.2, type: 'bandpass', decay: 1 }
          ]
        };
      }
    },
    {
      key: 'distant', title: 'дальний бой',
      make(rng, v) {
        /* чем больше номер, тем «дальше» бой: ниже срез и длиннее паузы */
        const cut = lerp(620, 240, v / 9);
        return {
          dur: 1.6, title: 'дальний бой ' + (v + 1),
          layers: [
            { eng: 'noise', dur: lerp(0.34, 0.55, v / 9), freq: cut, q: 0.5, gain: 0.5, type: 'lowpass', decay: 1, delay: v * 0.04 },
            { eng: 'noise', dur: 0.3, freq: cut * 1.2, q: 0.6, gain: 0.32, type: 'lowpass', decay: 1, delay: 0.45 + rng() * 0.3 },
            { eng: 'noise', dur: 0.25, freq: cut * 0.9, q: 0.5, gain: 0.22, type: 'lowpass', decay: 1, delay: 0.95 + rng() * 0.3 },
            { eng: 'tone', dur: 0.2, f0: lerp(70, 40, v / 9), f1: 28, wave: 'sine', gain: lerp(0.10, 0.26, v / 9), delay: v * 0.04 + 0.02 }
          ]
        };
      }
    },
    {
      key: 'mech', title: 'механизм',
      make(rng, v) {
        const f = lerp(90, 420, v / 9);
        return {
          dur: 1.1, title: 'механизм ' + (v + 1),
          layers: [
            { eng: 'tone', dur: 1.0, f0: f, f1: f * lerp(0.7, 1.4, rng()), wave: 'sawtooth', gain: 0.22 },
            { eng: 'noise', dur: 1.0, freq: f * 6, q: 0.9, gain: 0.12, type: 'bandpass' },
            { eng: 'granular', dur: 0.9, density: 30 + v * 6, gain: 0.1, pitch: f * 4 }
          ]
        };
      }
    },
    {
      key: 'weather', title: 'погода',
      make(rng, v) {
        return {
          dur: 2.0, title: 'погода ' + (v + 1),
          layers: [
            { eng: 'noise', dur: 1.9, freq: lerp(220, 900, rng()), q: 0.4, gain: 0.4, type: 'lowpass' },
            { eng: 'noise', dur: 0.3, freq: 300, q: 0.4, gain: 0.5, type: 'lowpass', delay: 0.6 + rng() * 0.8, decay: 1 },
            { eng: 'granular', dur: 1.6, density: 260 + v * 40, gain: 0.08, pitch: 3200 }
          ]
        };
      }
    },
    {
      key: 'creature', title: 'живое',
      make(rng, v) {
        const f = lerp(120, 620, v / 9);
        return {
          dur: 0.85, title: 'живое ' + (v + 1),
          layers: [
            { eng: 'formant', dur: 0.7, f0: f, gain: 0.34, formants: [520 + v * 60, 1100 + v * 40] },
            { eng: 'tone', dur: 0.6, f0: f * 2.02, f1: f * 2.6, wave: 'sawtooth', gain: 0.08 }
          ]
        };
      }
    },
    {
      key: 'water', title: 'вода',
      make(rng, v) {
        return {
          dur: 0.9, title: 'вода ' + (v + 1),
          layers: [
            { eng: 'noise', dur: 0.8, freq: lerp(600, 2600, rng()), q: 1.1, gain: 0.42, type: 'bandpass' },
            { eng: 'granular', dur: 0.7, density: 70 + v * 15, gain: 0.2, pitch: 900 + v * 120 }
          ]
        };
      }
    },
    {
      key: 'fire', title: 'огонь',
      make(rng, v) {
        return {
          dur: 1.4, title: 'огонь ' + (v + 1),
          layers: [
            { eng: 'noise', dur: 1.3, freq: lerp(500, 1400, rng()), q: 0.5, gain: 0.42, type: 'lowpass' },
            { eng: 'granular', dur: 1.2, density: 120 + v * 25, gain: 0.16, pitch: 1400 }
          ]
        };
      }
    },
    {
      key: 'door', title: 'затвор',
      make(rng, v) {
        return {
          dur: 0.8, title: 'затвор ' + (v + 1),
          layers: [
            { eng: 'modal', dur: 0.4, freq: lerp(200, 800, v / 9), gain: 0.4, decayMs: 200 },
            { eng: 'noise', dur: 0.25, freq: 1200, q: 1.0, gain: 0.28, type: 'lowpass', decay: 1 },
            { eng: 'modal', dur: 0.2, freq: lerp(900, 2200, rng()), gain: 0.22, decayMs: 90, delay: 0.42 }
          ]
        };
      }
    },
    {
      key: 'device', title: 'техника',
      make(rng, v) {
        const f = lerp(700, 2600, v / 9);
        return {
          dur: 0.9, title: 'техника ' + (v + 1),
          layers: [
            { eng: 'tone', dur: 0.1, f0: f, f1: f, wave: 'square', gain: 0.2 },
            { eng: 'tone', dur: 0.1, f0: f * 1.25, f1: f * 1.25, wave: 'square', gain: 0.18, delay: 0.16 },
            { eng: 'tone', dur: 0.1, f0: f * 1.5, f1: f * 1.5, wave: 'square', gain: 0.16, delay: 0.32 },
            { eng: 'fm', dur: 0.5, f0: f * 0.5, ratio: 2.5, index: 4, gain: 0.12, delay: 0.42 }
          ]
        };
      }
    },
    {
      key: 'pickup', title: 'подбор',
      make(rng, v) {
        const base = lerp(360, 900, v / 9);
        return {
          dur: 0.5, title: 'подбор ' + (v + 1),
          layers: [
            { eng: 'tone', dur: 0.12, f0: base, f1: base * 1.4, wave: 'triangle', gain: 0.28 },
            { eng: 'tone', dur: 0.16, f0: base * 1.5, f1: base * 1.9, wave: 'triangle', gain: 0.24, delay: 0.1 },
            { eng: 'fm', dur: 0.2, f0: base * 2, ratio: 3, index: 2, gain: 0.08, delay: 0.2 }
          ]
        };
      }
    },
    {
      key: 'heal', title: 'лечение',
      make(rng, v) {
        return {
          dur: 0.9, title: 'лечение ' + (v + 1),
          layers: [
            { eng: 'sweep', dur: 0.8, f0: lerp(300, 900, rng()), f1: lerp(600, 1600, rng()), q: 3.5, gain: 0.28 },
            { eng: 'noise', dur: 0.6, freq: 2400, q: 3, gain: 0.12, type: 'bandpass' }
          ]
        };
      }
    },
    {
      key: 'voice', title: 'голос',
      make(rng, v) {
        const f = lerp(90, 170, v / 9);
        return {
          dur: 1.1, title: 'голос ' + (v + 1),
          layers: [
            { eng: 'formant', dur: 0.95, f0: f, gain: 0.36, formants: [420 + v * 55, 980 + v * 45, 2400] },
            { eng: 'noise', dur: 0.9, freq: 2800, q: 2, gain: 0.06, type: 'bandpass' }
          ]
        };
      }
    },
    {
      key: 'sting', title: 'музыкальный стинг',
      make(rng, v) {
        const root = [196, 220, 247, 262, 294, 330, 349, 392, 440, 494][v];
        return {
          dur: 2.0, title: 'стинг ' + (v + 1),
          layers: [
            { eng: 'tone', dur: 1.8, f0: root, f1: root, wave: 'sawtooth', gain: 0.12 },
            { eng: 'tone', dur: 1.6, f0: root * 1.5, f1: root * 1.5, wave: 'triangle', gain: 0.1, delay: 0.02 },
            { eng: 'tone', dur: 1.4, f0: root * 2, f1: root * 2, wave: 'sine', gain: 0.09, delay: 0.04 },
            { eng: 'noise', dur: 0.4, freq: 3000, q: 0.6, gain: 0.06, type: 'highpass' }
          ]
        };
      }
    },
    {
      key: 'glitch', title: 'помехи',
      make(rng, v) {
        return {
          dur: 0.6, title: 'помехи ' + (v + 1),
          layers: [
            { eng: 'granular', dur: 0.5, density: 200 + v * 60, gain: 0.26, pitch: 1200 + v * 300 },
            { eng: 'tone', dur: 0.3, f0: 40 + v * 30, f1: 900, wave: 'square', gain: 0.1 },
            { eng: 'noise', dur: 0.1, freq: 4000, q: 1, gain: 0.2, type: 'highpass', delay: 0.25 }
          ]
        };
      }
    },
    {
      key: 'flesh', title: 'удар по телу',
      make(rng, v) {
        return {
          dur: 0.35, title: 'удар по телу ' + (v + 1),
          layers: [
            { eng: 'noise', dur: 0.2, freq: lerp(300, 900, v / 9), q: 0.7, gain: 0.5, type: 'lowpass', decay: 1 },
            { eng: 'tone', dur: 0.16, f0: lerp(120, 60, v / 9), f1: 40, wave: 'sine', gain: 0.4 }
          ]
        };
      }
    }
  ];

  const VARIANTS = 10;
  const COUNT = FAMILIES.length * VARIANTS;   // 250

  function describe(index) {
    const i = Math.max(0, Math.min(COUNT - 1, Math.floor(index) || 0));
    const f = Math.floor(i / VARIANTS);
    const v = i % VARIANTS;
    const fam = FAMILIES[f];
    return {
      index: i,
      id: fam.key + '-' + (v + 1),
      family: fam.key,
      familyTitle: fam.title,
      variant: v,
      title: (FAMILIES[f].make(rngFor(i * 131 + 7), v).title) || fam.title,
      seed: i * 6151 + 3
    };
  }

  function specFor(index) {
    const d = describe(index);
    const rng = rngFor(d.seed);
    const spec = FAMILIES[Math.floor(d.index / VARIANTS)].make(rng, d.variant);
    return spec;
  }

  /* ------------------------------- ДСП -----------------------------------
     Рендер одного звука в Float32Array. Всё руками: ни AudioContext, ни
     офлайн-графа — поэтому работает и в браузере, и в node для тестов. */
  function render(index, sampleRate) {
    const SR = sampleRate || 44100;
    const spec = specFor(index);
    const rng = rngFor(describe(index).seed ^ 0x9e37);
    const dur = Math.max(0.05, spec.dur);
    const len = Math.max(64, Math.ceil(dur * SR));
    const out = new Float32Array(len);
    let noiseState = 0;

    const envelope = (t, d, attack) => {
      const a = attack === undefined ? 0.004 : attack;
      if (t < a) return t / a;
      const k = (t - a) / Math.max(0.001, d - a);
      return Math.exp(-k * 3.2);
    };

    const osc = (wave, phase, t, f0, f1, d) => {
      const k = Math.min(1, t / Math.max(0.001, d));
      const f = f0 * Math.pow(f1 / Math.max(1e-3, f0), k);
      phase.v += (TAU * f) / SR;
      const p = phase.v % TAU;
      switch (wave) {
        case 'square': return Math.sin(p) >= 0 ? 1 : -1;
        case 'sawtooth': return (p / Math.PI) - 1;
        case 'triangle': return 1 - 4 * Math.abs(Math.round(p / TAU) - p / TAU);
        default: return Math.sin(p);
      }
    };

    /* однополюсный фильтр: и для шума, и для формант */
    const lpState = { v: 0 }, hpState = { p: 0, v: 0 };
    const lowpass = (x, cut) => {
      const a = Math.min(1, (TAU * cut) / SR);
      lpState.v += (x - lpState.v) * a;
      return lpState.v;
    };
    /* Резонансный полосовой (биквад RBJ). Важно: считать y2 надо через a2 —
       без него полюсы стоят на единичной окружности и фильтр разгоняется в
       бесконечность (первые версии металла и голоса были именно NaN). */
    const bp = (x, f, q) => {
      const w = (TAU * Math.min(SR * 0.45, Math.max(20, f))) / SR;
      const alpha = Math.sin(w) / (2 * Math.max(0.3, q));
      const a0 = 1 + alpha;
      return {
        b0: alpha / a0, b1: 0, b2: -alpha / a0,
        a1: (-2 * Math.cos(w)) / a0, a2: (1 - alpha) / a0
      };
    };
    /* Состояние одного биквада. */
    const bqState = () => ({ x1: 0, x2: 0, y1: 0, y2: 0 });
    const bqRun = (c, st, x) => {
      const y = c.b0 * x + c.b1 * st.x1 + c.b2 * st.x2 - c.a1 * st.y1 - c.a2 * st.y2;
      st.x2 = st.x1; st.x1 = x;
      st.y2 = st.y1; st.y1 = y;
      return y;
    };

    spec.layers.forEach((L) => {
      const delay = Math.max(0, L.delay || 0);
      const start = Math.floor(delay * SR);
      const ld = Math.min(dur - delay, L.dur || 0.2);
      const n = Math.max(16, Math.min(len - start, Math.floor(ld * SR)));
      const gain = L.gain === undefined ? 0.3 : L.gain;
      const phase = { v: rng() * TAU };
      /* у каждого слоя свои полюсы: иначе металл «тянул» бы хвост от
         предыдущего звука */
      const coeff = L.eng === 'modal' ? bp(0, L.freq || 900, 10) : null;
      const modalS = bqState();
      const form = (L.formants || []).map((f) => bp(0, f, 14));
      const formS = form.map(() => bqState());
      for (let i = 0; i < n; i++) {
        const t = i / SR;
        const idx = start + i;
        if (idx >= len) break;
        let s = 0;
        switch (L.eng) {
          case 'noise': {
            const w = rng() * 2 - 1;
            noiseState = noiseState * 0.4 + w * 0.6;
            let v = (L.type === 'highpass' ? w - noiseState : noiseState) * gain * envelope(t, ld, 0.003);
            if (L.type === 'bandpass' || L.q) {
              /* грубый полосовой: разность двух однополюсников */
              v = (lowpass(w, Math.min(6000, L.freq || 1200)) - lowpass(w, Math.max(60, (L.freq || 1200) * 0.55))) * gain * 2.4 * envelope(t, ld, 0.003);
            }
            s += v;
            break;
          }
          case 'tone':
            s += osc(L.wave || 'sine', phase, t, L.f0 || 200, L.f1 || L.f0 || 200, ld) * gain * envelope(t, ld, 0.006);
            break;
          case 'fm': {
            const ratio = L.ratio || 2;
            const index = L.index || 3;
            const mod = Math.sin(phase.v * ratio) * index;
            phase.v += (TAU * (L.f0 || 300)) / SR;
            s += Math.sin(phase.v + mod) * gain * envelope(t, ld, 0.008);
            break;
          }
          case 'sweep': {
            const f = (L.f0 || 400) * Math.pow((L.f1 || 1200) / (L.f0 || 400), t / ld);
            const w = rng() * 2 - 1;
            const band = (lowpass(w, f) - lowpass(w, f * 0.6)) * 3.2;
            s += band * gain * envelope(t, ld, 0.02);
            break;
          }
          case 'granular': {
            const dens = L.density || 60;
            const grain = Math.sin(i * (L.pitch || 800) / SR * TAU);
            const gate = (rng() < dens / SR * 6) ? 1 : 0;
            s += grain * gate * gain * envelope(t, ld, 0.002);
            break;
          }
          case 'formant': {
            /* голосовой тракт: пила-источник сквозь 2–3 форманты */
            const src = osc('sawtooth', phase, t, L.f0 || 120, L.f0 || 120, ld);
            let acc = 0;
            form.forEach((c, k) => { acc += bqRun(c, formS[k], src) * 2.2; });
            s += (src * 0.18 + acc) * gain * envelope(t, ld, 0.012);
            break;
          }
          case 'modal': {
            /* удар по телу: шум-импульс в резонатор, хвост по decayMs */
            const dec = (L.decayMs || 200) / 1000;
            const src = (rng() * 2 - 1) * Math.exp(-t / Math.max(0.005, dec));
            s += bqRun(coeff, modalS, src) * gain * 9 * envelope(t, ld, 0.001);
            break;
          }
          default:
            s += (rng() * 2 - 1) * gain * envelope(t, ld);
        }
        out[idx] += s;
      }
    });

    /* Мягкое ограничение и затухание в конце, чтобы не было щелчка */
    let peak = 0;
    for (let i = 0; i < len; i++) peak = Math.max(peak, Math.abs(out[i]));
    const norm = peak > 0 ? 0.8 / peak : 0;
    const fade = Math.floor(SR * 0.01);
    for (let i = 0; i < len; i++) {
      const tail = i > len - fade ? (len - i) / fade : 1;
      out[i] = Math.tanh(out[i] * norm * 1.15) * tail * 0.9;
    }
    return out;
  }

  /* --------------------------- измерение звука ---------------------------- */
  function analyse(buf, sampleRate) {
    const SR = sampleRate || 44100;
    let peak = 0, sum = 0, zc = 0;
    for (let i = 0; i < buf.length; i++) {
      const v = buf[i];
      peak = Math.max(peak, Math.abs(v));
      sum += v * v;
      if (i && ((buf[i - 1] <= 0 && v > 0) || (buf[i - 1] >= 0 && v < 0))) zc++;
    }
    const rms = Math.sqrt(sum / Math.max(1, buf.length));
    /* центроид «через нули» — достаточная замена БПФ для проверки яркости */
    const centroid = (zc / 2) / (buf.length / SR);
    return { samples: buf.length, ms: Math.round((buf.length / SR) * 1000), peak, rms, zc, centroid };
  }

  /* ------------------------------ БАНК ----------------------------------- */
  class SoundBank {
    constructor(audio) {
      this.audio = audio || null;
      this.buffers = new Map();      // id -> AudioBuffer (в браузере)
      this.pcm = new Map();          // id -> Float32Array (для тестов/лаборатории)
      this.played = 0;
      this.lastPlayed = null;
      this.muted = false;
      this.voiceCap = 12;
    }

    get count() { return COUNT; }

    describe(index) { return describe(index); }

    /* PCM нужен и без WebAudio: лаборатория рисует волну, тесты меряют. */
    pcmFor(index) {
      const i = Math.max(0, Math.min(COUNT - 1, Math.floor(index)));
      if (!this.pcm.has(i)) this.pcm.set(i, render(i, this.sampleRate || 22050));
      return this.pcm.get(i);
    }

    /* Проигрывание. Использует общий выход AudioEngine, поэтому панорама и
       затухание по дистанции работают так же, как у штатных выстрелов. */
    play(index, x, z, vol) {
      if (this.muted) return null;
      const A = this.audio || (SH2.game && SH2.game.audio);
      const i = typeof index === 'string' ? this.indexOf(index) : index;
      if (i < 0) return null;
      const v = vol === undefined ? 1 : vol;
      this.played++;
      this.lastPlayed = { index: i, id: describe(i).id, x: x || 0, z: z || 0, vol: v };
      if (!A || !A.ctx || !A.enabled) return null;
      if (A.voices >= (A.maxVoices || 26)) return null;
      const buf = this._bufferFor(A.ctx, i);
      if (!buf) return null;
      const out = A._out ? A._out(x, z) : { node: A.master };
      const src = A.ctx.createBufferSource();
      src.buffer = buf;
      const g = A.ctx.createGain();
      g.gain.value = v;
      src.connect(g); g.connect(out.node);
      src.start(0);
      A.voices = (A.voices || 0) + 1;
      src.onended = () => { A.voices = Math.max(0, (A.voices || 1) - 1); };
      return src;
    }

    /* Проиграть все 250 — так проверяется, что каждый звук существует,
       рендерится и не тишина. */
    playAll(onEach) {
      let n = 0;
      for (let i = 0; i < COUNT; i++) {
        const pcm = this.pcmFor(i);
        const an = analyse(pcm, this.sampleRate || 22050);
        if (onEach) onEach(i, an);
        n++;
      }
      return n;
    }

    _bufferFor(ctx, index) {
      const id = describe(index).id;
      if (this.buffers.has(id) && this.buffers.get(id).sampleRate === ctx.sampleRate) return this.buffers.get(id);
      const pcm = render(index, ctx.sampleRate);
      const buf = ctx.createBuffer(1, pcm.length, ctx.sampleRate);
      if (buf.copyToChannel) buf.copyToChannel(pcm, 0);
      else buf.getChannelData(0).set(pcm);
      this.buffers.set(id, buf);
      return buf;
    }

    indexOf(id) {
      for (let i = 0; i < COUNT; i++) if (describe(i).id === id) return i;
      return -1;
    }

    familyRange(key) {
      const f = FAMILIES.findIndex((x) => x.key === key);
      if (f < 0) return null;
      return { from: f * VARIANTS, to: f * VARIANTS + VARIANTS - 1 };
    }

    stats() {
      const fams = {};
      for (let i = 0; i < COUNT; i++) {
        const d = describe(i);
        fams[d.family] = (fams[d.family] || 0) + 1;
      }
      return { count: COUNT, families: FAMILIES.length, perFamily: fams, played: this.played };
    }
  }

  SH2.soundbank = {
    COUNT,
    SOUNDS: (function () {
      const out = [];
      for (let i = 0; i < COUNT; i++) out.push(describe(i));
      return out;
    })(),
    FAMILIES: FAMILIES.map((f) => f.key),
    families: FAMILIES.map((f) => ({ key: f.key, title: f.title })),
    describe, specFor, render, analyse, SoundBank, rngFor
  };
})(typeof window !== 'undefined' ? window : globalThis);
