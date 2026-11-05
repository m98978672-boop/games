/* =============================================================================
   НИКА: ЖИВАЯ — сетка управления телом (тысячи точек) и моторное обучение
   -----------------------------------------------------------------------------
   Каждая точка привязана к области тела и к каналу позы. Точки можно двигать
   вручную, они же смещаются встроенными моторными программами и программами,
   выученными из текста (в том числе из текста, который игрок сам загрузил
   с публичного сайта). Сеть здесь НЕ используется: модуль чистый и офлайн.
   ============================================================================= */
(function (root) {
  'use strict';
  const NIKA = (root.NIKA = root.NIKA || {});

  const POINT_COUNT = 2400;

  /* Области: координаты в «ростовых» единицах (1 ≈ 105 px при масштабе S=1) */
  const REGIONS = [
    { id: 'head',      label: 'Голова',              cx: 0,     cy: -1.62, rx: 0.24, ry: 0.28, channel: 'headTilt',      weight: 150 },
    { id: 'face',      label: 'Лицо и мимика',        cx: 0,     cy: -1.60, rx: 0.20, ry: 0.22, channel: 'smile',         weight: 150 },
    { id: 'hair',      label: 'Волосы',               cx: 0,     cy: -1.66, rx: 0.30, ry: 0.42, channel: 'hairSway',      weight: 220 },
    { id: 'neck',      label: 'Шея и ключицы',        cx: 0,     cy: -1.38, rx: 0.12, ry: 0.10, channel: 'neckTilt',      weight: 90 },
    { id: 'shoulders', label: 'Плечи и лопатки',      cx: 0,     cy: -1.30, rx: 0.30, ry: 0.09, channel: 'shoulderShrug', weight: 120 },
    { id: 'bust',      label: 'Грудь (под одеждой)',  cx: 0,     cy: -1.19, rx: 0.24, ry: 0.13, channel: 'breath',        weight: 160 },
    { id: 'torso',     label: 'Корпус',               cx: 0,     cy: -1.05, rx: 0.22, ry: 0.24, channel: 'torsoLean',     weight: 220 },
    { id: 'waist',     label: 'Талия',                cx: 0,     cy: -0.88, rx: 0.16, ry: 0.10, channel: 'waistTwist',    weight: 110 },
    { id: 'spine',     label: 'Спина и поясница',     cx: 0,     cy: -1.06, rx: 0.20, ry: 0.24, channel: 'spineBend',     weight: 150 },
    { id: 'hips',      label: 'Бёдра и таз',          cx: 0,     cy: -0.70, rx: 0.24, ry: 0.16, channel: 'hipTwist',      weight: 170 },
    { id: 'arms',      label: 'Руки',                 cx: 0.30,  cy: -1.12, rx: 0.08, ry: 0.32, channel: 'shoulderR',     weight: 220 },
    { id: 'hands',     label: 'Кисти и пальцы',       cx: 0.33,  cy: -0.84, rx: 0.09, ry: 0.08, channel: 'wristTwistR',   weight: 130 },
    { id: 'legs',      label: 'Ноги',                 cx: 0.10,  cy: -0.36, rx: 0.09, ry: 0.34, channel: 'kneeR',         weight: 230 },
    { id: 'feet',      label: 'Стопы',                cx: 0.11,  cy: -0.03, rx: 0.13, ry: 0.05, channel: 'ankleRollR',    weight: 100 },
    { id: 'fabric',    label: 'Ткань и подол',        cx: 0,     cy: -0.58, rx: 0.34, ry: 0.26, channel: 'fabricDrape',   weight: 180 },
    { id: 'breath',    label: 'Дыхание и осанка',     cx: 0,     cy: -1.18, rx: 0.22, ry: 0.18, channel: 'chestLift',     weight: 100 },
  ];

  /* --- детерминированный генератор ---------------------------------------- */
  let seed = 20261105;
  function rnd() { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }

  const POINTS = [];
  const totalWeight = REGIONS.reduce(function (s, r) { return s + r.weight; }, 0);
  REGIONS.forEach(function (r) {
    const n = Math.round((r.weight / totalWeight) * POINT_COUNT);
    for (let i = 0; i < n && POINTS.length < POINT_COUNT; i++) {
      const a = rnd() * Math.PI * 2, rad = Math.sqrt(rnd());
      const side = r.cx > 0 && r.id !== 'fabric' ? (i % 2 ? 1 : -1) : 1;
      POINTS.push({
        id: POINTS.length,
        region: r.id,
        channel: r.channel,
        x: r.cx * side + Math.cos(a) * r.rx * rad,
        y: r.cy + Math.sin(a) * r.ry * rad,
        z: rnd(),
        w: 0.35 + rnd() * 0.65,
      });
    }
  });
  while (POINTS.length < POINT_COUNT) {
    const r = REGIONS[POINTS.length % REGIONS.length];
    POINTS.push({ id: POINTS.length, region: r.id, channel: r.channel,
      x: r.cx + (rnd() - 0.5) * r.rx, y: r.cy + (rnd() - 0.5) * r.ry, z: rnd(), w: 0.5 });
  }
  POINTS.length = POINT_COUNT;

  /* --- встроенные моторные программы: Ника уже умеет управлять телом ------- */
  const PROGRAMS = {
    walk:    { id: 'walk',    label: 'Ходьба',           keywords: ['ходи', 'шаг', 'идти', 'гуля', 'прогул', 'ступай'],
      steps: [{ channel: 'hipL', amp: 18 }, { channel: 'kneeL', amp: 10 }, { channel: 'hipR', amp: -18 }, { channel: 'armL', amp: -12 }] },
    dress:   { id: 'dress',   label: 'Переодевание',      keywords: ['одев', 'наден', 'переоден', 'плать', 'сним', 'бел'],
      steps: [{ channel: 'armCross', amp: 12 }, { channel: 'shoulderShrug', amp: 14 }, { channel: 'fabricDrape', amp: 18 }, { channel: 'mirrorCheck', amp: 20 }] },
    wash:    { id: 'wash',    label: 'Купание',           keywords: ['купа', 'мой', 'ванн', 'душ', 'пена', 'гигиен'],
      steps: [{ channel: 'spineBend', amp: -10 }, { channel: 'wristTwistR', amp: 22 }, { channel: 'breath', amp: 14 }, { channel: 'shoulderL', amp: 24 }] },
    toilet:  { id: 'toilet',  label: 'Санузел',           keywords: ['туалет', 'санузел', 'уборн', 'унитаз'],
      steps: [{ channel: 'squat', amp: 0.4 }, { channel: 'headDuck', amp: 12 }, { channel: 'kneeL', amp: 16 }, { channel: 'kneeR', amp: 16 }] },
    sleep:   { id: 'sleep',   label: 'Сон',               keywords: ['спать', 'спи', 'кроват', 'постел', 'отдых'],
      steps: [{ channel: 'breath', amp: 22 }, { channel: 'blink', amp: 1 }, { channel: 'torsoY', amp: 4 }, { channel: 'headTilt', amp: 8 }] },
    work:    { id: 'work',    label: 'Работа',            keywords: ['работай', 'ноутбук', 'печатай', 'офис', 'задач'],
      steps: [{ channel: 'spineBend', amp: 8 }, { channel: 'wristTwistL', amp: 12 }, { channel: 'headDuck', amp: 6 }, { channel: 'fingerSpreadR', amp: 0.6 }] },
    eat:     { id: 'eat',     label: 'Еда',               keywords: ['еш', 'поешь', 'обед', 'чай', 'кухн'],
      steps: [{ channel: 'elbowR', amp: 40 }, { channel: 'mouth', amp: 2 }, { channel: 'headNod', amp: 6 }, { channel: 'wristTwistR', amp: 10 }] },
    help:    { id: 'help',    label: 'Помощь по дому',    keywords: ['помоги', 'убор', 'прибер', 'вымой'],
      steps: [{ channel: 'shoulderL', amp: 30 }, { channel: 'torsoLean', amp: 12 }, { channel: 'hipTwist', amp: 14 }, { channel: 'armCross', amp: -8 }] },
    balance: { id: 'balance', label: 'Равновесие',        keywords: ['баланс', 'стой', 'ровно', 'осанк'],
      steps: [{ channel: 'poseArch', amp: 6 }, { channel: 'chestLift', amp: 12 }, { channel: 'spineBend', amp: -4 }] },
    breathe: { id: 'breathe', label: 'Дыхание',           keywords: ['дыш', 'вдох', 'выдох', 'успокой'],
      steps: [{ channel: 'breath', amp: 26 }, { channel: 'chestLift', amp: 16 }, { channel: 'shoulderShrug', amp: -6 }] },
    reach:   { id: 'reach',   label: 'Дотянуться',        keywords: ['достань', 'потянись', 'возьми', 'шкаф', 'полк'],
      steps: [{ channel: 'shoulderR', amp: 70 }, { channel: 'spineBend', amp: 10 }, { channel: 'wristTwistR', amp: 18 }] },
    wave:    { id: 'wave',    label: 'Помахать',          keywords: ['помаши', 'привет', 'маши'],
      steps: [{ channel: 'shoulderR', amp: 80 }, { channel: 'wristTwistR', amp: 30 }, { channel: 'smile', amp: 0.7 }] },
  };
  const PROGRAM_LIST = Object.keys(PROGRAMS).map(function (k) { return PROGRAMS[k]; });

  /* --- выученные ассоциации «фраза → программа/шаги» ------------------------ */
  let learned = [];
  let offsets = {};

  function words(text) {
    return String(text || '').toLowerCase().replace(/[^a-zа-яё0-9 ]/gi, ' ').split(/\s+/)
      .filter(function (w) { return w.length > 2; });
  }
  function scoreProgram(text, program) {
    const ws = words(text);
    let score = 0;
    ws.forEach(function (w) {
      program.keywords.forEach(function (k) { if (k.indexOf(w.slice(0, 4)) === 0 || w.indexOf(k.slice(0, 4)) === 0) score += 1; });
    });
    return score;
  }
  function bestProgram(text) {
    let best = null, bestScore = 0;
    PROGRAM_LIST.forEach(function (p) { const s = scoreProgram(text, p); if (s > bestScore) { bestScore = s; best = p; } });
    return best;
  }
  function parseSteps(text) {
    return text.split(/[,;→]/).map(function (s) { return s.trim(); }).filter(Boolean).slice(0, 8).map(function (s, i) {
      return { name: s, channel: PROGRAM_LIST[i % PROGRAM_LIST.length].steps[0].channel, amp: 8 + (i % 5) * 4 };
    });
  }
  /* Обучение из ЛЮБОГО текста: размеченные строки «фраза = шаги» или свободные
     предложения, которые привязываются к ближайшей моторной программе. */
  function learnFromText(text, source) {
    const lines = String(text || '').split(/\r?\n/).map(function (l) { return l.trim(); }).filter(function (l) { return l.length > 3 && l.length < 300; });
    let added = 0;
    lines.slice(0, 400).forEach(function (line) {
      let phrase = line, program = null, steps = null;
      if (line.indexOf('=') !== -1) {
        const parts = line.split('=');
        phrase = parts[0].trim();
        const rhs = parts.slice(1).join('=').trim();
        const direct = PROGRAM_LIST.filter(function (p) { return p.id === rhs || p.label.toLowerCase() === rhs.toLowerCase(); })[0];
        if (direct) program = direct;
        else { steps = parseSteps(rhs); program = bestProgram(line) || PROGRAMS.balance; }
      } else {
        program = bestProgram(line);
      }
      if (!program || phrase.length < 3) return;
      if (learned.some(function (e) { return e.phrase === phrase && e.program === program.id; })) return;
      learned.push({ phrase: phrase, program: program.id,
        steps: steps || program.steps.map(function (s) { return { channel: s.channel, amp: s.amp, name: program.label }; }),
        source: source || 'текст игрока' });
      added += 1;
    });
    if (learned.length > 600) learned = learned.slice(-600);
    return { added: added, total: learned.length, programs: PROGRAM_LIST.length, source: source || 'текст игрока' };
  }
  function programFor(text) {
    const q = words(text);
    let best = null, bestScore = 0;
    learned.forEach(function (e) {
      const ew = words(e.phrase);
      let s = 0; q.forEach(function (w) { if (ew.indexOf(w) !== -1) s += 2; });
      if (s > bestScore) { bestScore = s; best = e; }
    });
    if (best) return { id: best.program, label: (PROGRAMS[best.program] || {}).label || best.program,
      steps: best.steps, source: best.source, learned: true };
    const p = bestProgram(text);
    return p ? { id: p.id, label: p.label, steps: p.steps, source: 'встроенная программа', learned: false } : null;
  }

  /* --- ручное управление отдельными точками -------------------------------- */
  function setOffset(id, dx, dy) {
    const i = Number(id);
    if (!Number.isFinite(i) || i < 0 || i >= POINTS.length) return false;
    offsets[i] = [Math.max(-40, Math.min(40, Number(dx) || 0)), Math.max(-40, Math.min(40, Number(dy) || 0))];
    return true;
  }
  function getOffset(id) { return offsets[Number(id)] || [0, 0]; }
  function clearOffsets() { offsets = {}; }

  /* --- покадровое смещение всех точек -------------------------------------- */
  const REGION_GAIN = {
    head: 0.7, face: 0.5, hair: 1.1, neck: 0.6, shoulders: 1.0, bust: 0.8,
    torso: 0.9, waist: 0.7, spine: 0.8, hips: 1.0, arms: 1.3, hands: 1.2,
    legs: 1.2, feet: 0.9, fabric: 1.6, breath: 1.0,
  };
  function deform(pose, state, t) {
    const out = new Float32Array(POINT_COUNT * 2);
    const P = pose || {};
    const settings = (state && state.settings) || {};
    const warmth = Number.isFinite(settings.warmth) ? settings.warmth : 22;
    const heat = Math.max(-1, Math.min(1, (warmth - 22) / 8));
    const action = state && state.action ? state.action.intent : null;
    const program = action ? PROGRAMS[action] : null;
    const learnedBoost = Math.min(1, learned.length / 40);
    for (let i = 0; i < POINT_COUNT; i++) {
      const p = POINTS[i];
      const gain = REGION_GAIN[p.region] || 1;
      const ch = P[p.channel] === undefined ? 0 : P[p.channel];
      const wave = Math.sin(t * 1.9 + p.y * 3.1 + p.x * 2.2);
      let dx = ch * 0.055 * gain * p.w + wave * 0.9 * p.w;
      let dy = wave * 1.4 * p.w + (P.breath || 0) * 0.04 * gain * p.w;
      if (p.region === 'fabric') { dx += (P.hemSpin || 0) * 0.09 * p.w; dy += (P.fabricDrape || 0) * 0.05 * p.w; }
      if (p.region === 'bust' || p.region === 'breath') dy += heat * 1.2 * p.w;
      if (program) {
        const step = program.steps[i % program.steps.length];
        const amp = (step.amp || 8) * 0.035 * (0.6 + learnedBoost * 0.4);
        dx += Math.sin(t * 2.2 + i * 0.07) * amp * p.w;
        dy += Math.cos(t * 1.7 + i * 0.05) * amp * p.w;
      }
      const off = offsets[i];
      if (off) { dx += off[0] * p.w; dy += off[1] * p.w; }
      out[i * 2] = dx; out[i * 2 + 1] = dy;
    }
    return out;
  }
  function pointRegionCounts() {
    const out = {};
    POINTS.forEach(function (p) { out[p.region] = (out[p.region] || 0) + 1; });
    return out;
  }
  function info() {
    return { points: POINTS.length, regions: REGIONS.length, programs: PROGRAM_LIST.length,
      learned: learned.length, manual: Object.keys(offsets).length,
      internet: 'через модуль NIKA.net, только по запросу игрока' };
  }
  function serialize() { return { offsets: offsets, learned: learned }; }
  function restore(data) {
    if (!data) return;
    offsets = data.offsets || {};
    learned = Array.isArray(data.learned) ? data.learned.slice(-600) : [];
  }

  NIKA.mesh = {
    POINT_COUNT: POINT_COUNT, POINTS: POINTS, REGIONS: REGIONS, PROGRAMS: PROGRAMS,
    PROGRAM_LIST: PROGRAM_LIST, deform: deform, setOffset: setOffset, getOffset: getOffset,
    clearOffsets: clearOffsets, learnFromText: learnFromText, programFor: programFor,
    pointRegionCounts: pointRegionCounts, info: info, serialize: serialize, restore: restore,
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
