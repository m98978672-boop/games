// ============================================================
// ИКОНКИ ИНТЕРФЕЙСА: одна монохромная штриховая серия 24×24.
// Эмодзи в кнопках выглядят по-разному в каждой системе (на Windows это
// цветные «смайлы», на Linux — чёрные глифы), из-за чего меню разъезжалось.
// Здесь все иконки рисуются SVG и наследуют цвет текста.
// ============================================================

const STROKE = 'fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"';

/** Пути иконок (в системе 0 0 24 24). */
const PATHS = {
  // меню верхней панели
  model: '<path d="M12 3.2 20.4 7.6 12 12 3.6 7.6Z"/><path d="M3.6 12 12 16.4 20.4 12"/><path d="M3.6 16.4 12 20.8 20.4 16.4"/>',
  view: '<rect x="2.6" y="6.4" width="18.8" height="13" rx="3"/><circle cx="12" cy="12.9" r="3.4"/><path d="M8.4 6.4 9.9 3.8h4.2l1.5 2.6"/>',
  dots: '<circle cx="5" cy="5" r="1.35" fill="currentColor" stroke="none"/><circle cx="12" cy="5" r="1.35" fill="currentColor" stroke="none"/><circle cx="19" cy="5" r="1.35" fill="currentColor" stroke="none"/><circle cx="5" cy="12" r="1.35" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.35" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.35" fill="currentColor" stroke="none"/><circle cx="5" cy="19" r="1.35" fill="currentColor" stroke="none"/><circle cx="12" cy="19" r="1.35" fill="currentColor" stroke="none"/><circle cx="19" cy="19" r="1.35" fill="currentColor" stroke="none"/>',
  voxel: '<path d="M12 2.9 20.4 7.4v9.1L12 21.1 3.6 16.5V7.4Z"/><path d="M3.6 7.4 12 11.9l8.4-4.5M12 11.9v9.2"/>',
  damage: '<path d="M12 3.4 13.9 9.4 20 11.4 13.9 13.5 12 19.6 10.1 13.5 4 11.4 10.1 9.4Z"/>',
  light: '<circle cx="12" cy="12" r="3.9"/><path d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6"/>',
  more: '<circle cx="5.2" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="18.8" cy="12" r="1.5" fill="currentColor" stroke="none"/>',
  close: '<path d="M6.4 6.4 17.6 17.6M17.6 6.4 6.4 17.6"/>',

  // поиск и служебные
  search: '<circle cx="10.8" cy="10.8" r="6.2"/><path d="M15.4 15.4 20.4 20.4"/>',
  star: '<path d="M12 3.6 14.5 9l5.9.9-4.3 4.1 1 5.9-5.1-2.8-5.1 2.8 1-5.9L3.6 9.9 9.5 9Z"/>',
  compare: '<path d="M3.6 8.4h13.2M13.6 5.2l3.2 3.2-3.2 3.2"/><path d="M20.4 15.6H7.2M10.4 12.4 7.2 15.6l3.2 3.2"/>',
  camera: '<rect x="2.8" y="7" width="18.4" height="12.6" rx="2.8"/><path d="M8.2 7 9.6 4.4h4.8L15.8 7"/><circle cx="12" cy="13.2" r="3.2"/>',
  fullscreen: '<path d="M4 9.2V4.4h4.8M20 14.8v4.8h-4.8M20 9.2V4.4h-4.8M4 14.8v4.8h4.8"/>',
  help: '<circle cx="12" cy="12" r="8.4"/><path d="M9.6 9.4a2.5 2.5 0 1 1 3.3 2.4c-.6.2-.9.7-.9 1.3v.5"/><circle cx="12" cy="16.8" r="0.9" fill="currentColor" stroke="none"/>',
  info: '<circle cx="12" cy="12" r="8.4"/><path d="M12 11v5.6"/><circle cx="12" cy="8.1" r="0.95" fill="currentColor" stroke="none"/>',
  dice: '<rect x="3.8" y="3.8" width="16.4" height="16.4" rx="3.4"/><circle cx="8.6" cy="8.6" r="1.2" fill="currentColor" stroke="none"/><circle cx="15.4" cy="15.4" r="1.2" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none"/>',

  // камера: внутрь / наружу / вращение / сброс
  inside: '<path d="M10.4 4.2H5.2v15.6h5.2"/><path d="M14.6 8.2 18.6 12l-4 3.8"/><path d="M18.4 12H9.2"/>',
  outside: '<path d="M13.6 4.2h5.2v15.6h-5.2"/><path d="M9.4 8.2 5.4 12l4 3.8"/><path d="M5.6 12h9.2"/>',
  orbit: '<path d="M4.4 13.4a8.2 8.2 0 0 1 13.9-6.6"/><path d="M18.6 3.4v3.6h-3.6"/><path d="M19.6 10.6a8.2 8.2 0 0 1-13.9 6.6"/><path d="M5.4 20.6V17h3.6"/>',
  reset: '<circle cx="12" cy="12" r="4.6"/><path d="M12 2.8v3.6M12 17.6v3.6M2.8 12h3.6M17.6 12h3.6"/>',

  // ракурсы
  globe: '<circle cx="12" cy="12" r="8.4"/><path d="M3.6 12h16.8"/><path d="M12 3.6c2.4 2.4 3.6 5.3 3.6 8.4s-1.2 6-3.6 8.4c-2.4-2.4-3.6-5.3-3.6-8.4s1.2-6 3.6-8.4Z"/>',
  side: '<rect x="3.2" y="6.6" width="17.6" height="10.8" rx="2.4"/><path d="M9.2 6.6v10.8"/>',
  rear: '<rect x="4.2" y="5.6" width="15.6" height="12.8" rx="2.6"/><path d="M8 15.6h2.4M13.6 15.6H16"/>',
  front: '<rect x="4.2" y="5.6" width="15.6" height="12.8" rx="2.6"/><circle cx="8.4" cy="10.4" r="1.5"/><circle cx="15.6" cy="10.4" r="1.5"/><path d="M9.6 15.4h4.8"/>',
  driver: '<circle cx="12" cy="12" r="7.6"/><circle cx="12" cy="12" r="2.6"/><path d="M12 4.4v5M7.4 16.2l3.4-3M16.6 16.2l-3.4-3"/>',
  passenger: '<path d="M8 4.6h4.2a2.2 2.2 0 0 1 2.2 2.2v5.4H8Z"/><path d="M6.6 12.2h12.2v4.4H6.6z"/><path d="M8.4 16.6v3M17 16.6v3"/>',
  salon: '<path d="M4.4 15.4 6 10.6a2.6 2.6 0 0 1 2.5-1.8h7a2.6 2.6 0 0 1 2.5 1.8l1.6 4.8"/><path d="M4.6 15.4h14.8v2.4H4.6z"/><circle cx="8" cy="19.2" r="1.3"/><circle cx="16" cy="19.2" r="1.3"/>',
  bunk: '<path d="M3.6 17.4V9.2h12.2a4.6 4.6 0 0 1 4.6 4.6v3.6"/><path d="M3.6 13.6h16.8"/><path d="M6.4 9.2V6.6h4.4v2.6"/>',

  // категории
  truck: '<path d="M2.8 16.8V7.4h9.4v9.4"/><path d="M12.2 10.6h4.4l3.2 3.2v3H12.2"/><circle cx="7" cy="18.2" r="1.7"/><circle cx="16.6" cy="18.2" r="1.7"/>',
  trailer: '<rect x="3.4" y="8.4" width="17.2" height="7.2" rx="1.6"/><path d="M3.4 15.6 2.6 18M20.6 15.6 21.4 18"/><circle cx="8" cy="18" r="1.5"/><circle cx="16" cy="18" r="1.5"/>',
  car: '<path d="M3.4 15.4 5.2 10a2.6 2.6 0 0 1 2.5-1.7h8.6A2.6 2.6 0 0 1 18.8 10l1.8 5.4"/><path d="M3.6 15.4h16.8v2.2H3.6z"/><circle cx="7.4" cy="18.8" r="1.4"/><circle cx="16.6" cy="18.8" r="1.4"/>',
  building: '<path d="M4.4 20.2V5.4a1.6 1.6 0 0 1 1.6-1.6h6.6a1.6 1.6 0 0 1 1.6 1.6v14.8z"/><path d="M14.2 20.2V9.6h4.2a1.6 1.6 0 0 1 1.6 1.6v9z"/><path d="M7.4 7.6h2.2M7.4 11.4h2.2M7.4 15.2h2.2M16.4 13h1.6M16.4 16.4h1.6"/><path d="M3.2 20.2h18"/>',
};

/** SVG-иконка как строка — удобно вставлять в innerHTML. */
export function icon(name, cls = '') {
  const body = PATHS[name] || PATHS.damage;
  return `<svg class="ic${cls ? ` ${cls}` : ''}" viewBox="0 0 24 24" ${STROKE} aria-hidden="true" focusable="false">${body}</svg>`;
}

export const ICON_NAMES = Object.keys(PATHS);
