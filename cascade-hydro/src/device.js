// Автоопределение возможностей устройства (по образцу last-shore + расширение под GPGPU/гидродинамику)
export function detectDevice(nav = navigator, win = window) {
  const touch = (nav.maxTouchPoints || 0) > 0 &&
    (/Android|iPhone|iPad|iPod|Mobile/i.test(nav.userAgent || '') ||
      (win.matchMedia && win.matchMedia('(pointer: coarse)').matches));
  const weak = (nav.deviceMemory > 0 && nav.deviceMemory <= 4) ||
    (nav.hardwareConcurrency > 0 && nav.hardwareConcurrency <= 4);
  const strong = (!touch && !weak && (nav.hardwareConcurrency || 8) >= 8);
  return {
    touch: !!touch,
    weak: !!weak,
    low: !!(touch || weak),
    recommendedQuality: (touch || weak) ? 'low' : (strong ? 'high' : 'medium'),
  };
}

export function wantsSafeMode(win = window) {
  try {
    const search = (win.location && win.location.search) || '';
    const params = new URLSearchParams(search);
    return params.get('safe') === '1' || params.get('safe') === '';
  } catch {
    return false;
  }
}
