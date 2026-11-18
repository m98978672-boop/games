/* §90: подключение движка RatCore к карте мира (F-335…F-340).
   Движок даёт два готовых кирпича, которыми игра и раньше пользовалась «руками»:
   фиксированный шаг времени (`GamesEngine.clock`, F-01) и детерминированный ГПСЧ.
   Модуль — тонкая прослойка: если движка на странице нет (headless-тесты, file://,
   старая сборка), работает такая же встроенная реализация, поэтому игра не падает
   и не меняет числа. Ничего не рисует и ничего не знает про камеру. */

export const ENGINE = {
  tickHz: 60,          // шаг симуляции — 60 Гц, как у ядра
  maxSubsteps: 4,      // защита от «спирали смерти» после зависания кадра
  label: 'RatCore'
};

/* F-335: есть ли движок на странице. */
export function engineApi() {
  if (typeof window === 'undefined') return null;
  const api = window.GamesEngine;
  return api && typeof api.clock === 'function' ? api : null;
}

/* F-335: как называется то, что считает время — для подсказки в интерфейсе. */
export function engineLabel() {
  const api = engineApi();
  if (!api) return 'встроенный счётчик';
  let v = '';
  try { v = api.version ? api.version() : ''; } catch (err) { v = ''; }
  return 'RatCore' + (v ? ' v' + v : '');
}

/* F-336: встроенный фиксированный шаг — та же арифметика, что у ядра в fallback-режиме,
   чтобы поведение без движка совпадало с поведением с движком. */
export function localClock(options = {}) {
  const fixedDt = Number(options.fixedDt) > 0
    ? Number(options.fixedDt)
    : 1 / (Number(options.tickHz) > 0 ? Number(options.tickHz) : ENGINE.tickHz);
  const maxSubsteps = Number(options.maxSubsteps) > 0 ? Number(options.maxSubsteps) : ENGINE.maxSubsteps;
  let accumulator = 0;
  const api = { engine: 'built-in', tick: 0, simTimeSec: 0, fixedDt, paused: false, speed: 1, fromEngine: false };
  api.advance = (dtRealSec, onStep) => {
    if (api.paused || api.speed <= 0) return { steps: 0, tick: api.tick };
    const clamped = Math.min(Math.max(0, Number(dtRealSec) || 0), 0.1) * api.speed;
    accumulator = Math.min(accumulator + clamped, fixedDt * maxSubsteps);
    let steps = 0;
    while (accumulator + 1e-9 >= fixedDt && steps < maxSubsteps) {
      accumulator -= fixedDt;
      api.tick += 1;
      api.simTimeSec += fixedDt;
      steps += 1;
      if (typeof onStep === 'function') onStep(fixedDt, api.tick);
    }
    return { steps, tick: api.tick };
  };
  api.setPaused = (flag) => { api.paused = Boolean(flag); };
  api.setSpeed = (mult) => { api.speed = Math.max(0, Number(mult) || 0); };
  return api;
}

/* F-336: часы для анимации. Сначала пробуем движок, потом свою копию:
   числа шагов те же, поэтому кадр не «прыгает» при загрузке бандла. */
export function fixedClock(options = {}) {
  const opts = {
    tickHz: options.tickHz || ENGINE.tickHz,
    maxSubsteps: options.maxSubsteps || ENGINE.maxSubsteps
  };
  const api = engineApi();
  if (api) {
    try {
      const clock = api.clock(opts);
      clock.fromEngine = true;
      return clock;
    } catch (err) { /* движок не должен ронять игру */ }
  }
  return localClock(opts);
}

/* F-337: детерминированный ГПСЧ. Движок отдаёт свой (mulberry32), без движка — та же
   схема на месте. Нужен только украшениям пролёта: мир считается хешами §86–§89. */
export function engineRng(seed = 1) {
  const api = engineApi();
  if (api && typeof api.rng === 'function') {
    try { return api.rng(seed); } catch (err) { /* ниже встроенный */ }
  }
  let a = (Number(seed) || 0) >>> 0;
  const next = () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    int: (min, max) => min + Math.floor(next() * (max - min + 1)),
    range: (min, max) => min + (max - min) * next(),
    pick: (arr) => arr[Math.floor(next() * arr.length)],
    chance: (p) => next() < Number(p || 0),
    fromEngine: false
  };
}
