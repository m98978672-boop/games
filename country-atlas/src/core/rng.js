/**
 * Детерминированный ГПСЧ «Атласа Ратграда».
 *
 * Правило проекта (§3.5, §31.20): Math.random() в генерации и симуляции запрещён.
 * Любая случайность — это mulberry32, засеянный от (seed, объект, время, шаг).
 * Один и тот же сид всегда даёт одну и ту же страну, одну и ту же жизнь,
 * один и тот же алгоритм поведения.
 */

/** 32-битный мультипликативный ГПСЧ; равномерно на [0, 1). */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** FNV-1a: строка → 32-битное число. Удобно засеивать от id объекта. */
export function hashString(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Отдельный поток случайности для объекта: не зависит от других агентов. */
export function streamFor(...parts) {
  return mulberry32(hashString(parts.join("|")));
}

/** Целое в [min, max]. */
export function randInt(rnd, min, max) {
  return min + Math.floor(rnd() * (max - min + 1));
}

/** Взвешенный выбор индекса по массиву весов. */
export function weightedIndex(rnd, weights) {
  let total = 0;
  for (let i = 0; i < weights.length; i++) total += weights[i];
  if (total <= 0) return 0;
  let x = rnd() * total;
  for (let i = 0; i < weights.length; i++) {
    x -= weights[i];
    if (x <= 0) return i;
  }
  return weights.length - 1;
}

/** Перемешивание копии массива (Фишер–Йетс). */
export function shuffle(rnd, array) {
  const a = array.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    const t = a[i];
    a[i] = a[j];
    a[j] = t;
  }
  return a;
}
