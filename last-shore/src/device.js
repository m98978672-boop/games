// Консервативный автопрофиль: это оценка по браузерным подсказкам, не бенчмарк.
export function detectDevice(nav = navigator, win = window) {
  const touch = (nav.maxTouchPoints || 0) > 0 &&
    (/Android|iPhone|iPad|iPod|Mobile/i.test(nav.userAgent || '') || (win.matchMedia && win.matchMedia('(pointer: coarse)').matches));
  const weak = (nav.deviceMemory > 0 && nav.deviceMemory <= 4) ||
    (nav.hardwareConcurrency > 0 && nav.hardwareConcurrency <= 4);
  return { touch: !!touch, weak: !!weak, low: !!(touch || weak) };
}
