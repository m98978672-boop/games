// ============================================================
//  Предметы и рецепты. Один словарь на всю игру:
//  и интерфейс, и логика крафта, и сохранения берут данные отсюда.
// ============================================================

/**
 * kind:
 *   resource — сырьё (складывается в сумку)
 *   tool     — инструмент (занимает слот в руке, влияет на добычу)
 *   placeable — ставится в мир
 *   food     — съедается
 */

const svg = (body) => `<svg viewBox="0 0 24 24" aria-hidden="true">${body}</svg>`;

const ICONS = {
  coconut: svg('<circle cx="12" cy="13" r="7" fill="#6b4a2a"/><circle cx="9.5" cy="10.5" r="2" fill="#8a6440"/><path d="M8 6.5q4-2.5 8 0" stroke="#3f7a3a" stroke-width="1.6" fill="none"/>'),
  berries: svg('<circle cx="9" cy="14" r="3.2" fill="#b9334a"/><circle cx="15" cy="15" r="3" fill="#9d2740"/><circle cx="12" cy="9.5" r="2.8" fill="#c93c52"/><path d="M12 6.5V3" stroke="#3f7a3a" stroke-width="1.6"/>'),
  wood: svg('<rect x="4" y="9" width="16" height="6" rx="3" fill="#8a6a42" transform="rotate(-18 12 12)"/><circle cx="19" cy="8.5" r="1.6" fill="#b08a58"/>'),
  stone: svg('<path d="M4 15l3-7 5-2 6 4 2 6-5 3H8z" fill="#9a958c"/><path d="M7 11l4 2-2 4" stroke="#7a756d" stroke-width="1.2" fill="none"/>'),
  flint: svg('<path d="M6 16l4-9 6 3 2 7-6 3z" fill="#4a4a52"/><path d="M10 7l2 6 4-3" stroke="#8f8f9c" stroke-width="1.2" fill="none"/>'),
  fiber: svg('<path d="M7 19q2-8 5-14M11 19q1-9 3-13M15 18q0-7 3-11" stroke="#9cae5e" stroke-width="1.8" fill="none" stroke-linecap="round"/>'),
  rope: svg('<path d="M5 16c3-6 5 4 8-2s4 2 6-1" stroke="#c2a06a" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M5 11c3-4 5 3 8-1s4 3 6 0" stroke="#a3854f" stroke-width="1.8" fill="none"/>'),
  knife: svg('<path d="M5 19l3-1 9-12-2-2L6 16z" fill="#c8ccd2"/><path d="M4 20l3-3" stroke="#7a5a3a" stroke-width="2.6" stroke-linecap="round"/>'),
  spear: svg('<path d="M4 20L18 5" stroke="#8a6a42" stroke-width="2"/><path d="M18 3l3 3-4 1z" fill="#c8ccd2"/><path d="M16 7l2 2" stroke="#c8ccd2" stroke-width="1.4"/>'),
  axe: svg('<path d="M6 20l8-9" stroke="#7a5a3a" stroke-width="2.4" stroke-linecap="round"/><path d="M13 5l6 3-2 5-5-2z" fill="#b9c0c8"/>'),
  pickaxe: svg('<path d="M6 20l8-9" stroke="#7a5a3a" stroke-width="2.4" stroke-linecap="round"/><path d="M10 9q4-4 9-2-3 1-4 4l-3 1z" fill="#b9c0c8"/>'),
  torch: svg('<rect x="10.5" y="10" width="3" height="11" rx="1.4" fill="#8a6a42" transform="rotate(8 12 16)"/><path d="M12 9c-2-2 0-4 1-6 2 3 3 5 1 7z" fill="#f0a93c"/><path d="M12 8c-1-1 0-2 .6-3 1 1.6 1.5 2.6.4 3.6z" fill="#ffe08a"/>'),
  campfireKit: svg('<path d="M5 18l7-10 7 10z" fill="#7a5a3a"/><path d="M9 17l3-6 3 6z" fill="#8a6a42"/><path d="M12 15c-2-3 1-5 1.6-8 2.4 4 2.4 7 .4 8.6z" fill="#f0a93c"/>'),
  water: svg('<path d="M12 3c4 5 6 8 6 11a6 6 0 05 12 6 6 0 01-6-11c0-3 2-6 6-11z" fill="#4aa9d8"/>'),
  cookedWater: svg('<path d="M12 3c4 5 6 8 6 11a6 6 0 01-12 0c0-3 2-6 6-11z" fill="#7dd0e8"/><path d="M9 10c1 3 2 4 3 6" stroke="#e8f7ff" stroke-width="1.2" fill="none"/>'),
  cookedMeat: svg('<path d="M6 15a5 5 0 0110-2 4 4 0 01-2 7 5 5 0 01-8-5z" fill="#a25c34"/><path d="M9 12l6 4" stroke="#7a3f22" stroke-width="1.4"/>'),
  rawMeat: svg('<path d="M6 15a5 5 0 0110-2 4 4 0 01-2 7 5 5 0 01-8-5z" fill="#c46a72"/><path d="M9 12l6 4" stroke="#8f444c" stroke-width="1.4"/>'),
};

export const ITEMS = {
  coconut: { id: 'coconut', name: 'Кокос', icon: ICONS.coconut, kind: 'food', hotbar: true, action: 'Открыть и выпить' },
  berries: { id: 'berries', name: 'Ягоды', icon: ICONS.berries, kind: 'food', hotbar: true, action: 'Съесть' },
  wood: { id: 'wood', name: 'Палки', icon: ICONS.wood, kind: 'resource' },
  stone: { id: 'stone', name: 'Камни', icon: ICONS.stone, kind: 'resource' },
  flint: { id: 'flint', name: 'Кремень', icon: ICONS.flint, kind: 'resource' },
  fiber: { id: 'fiber', name: 'Волокно', icon: ICONS.fiber, kind: 'resource' },
  rope: { id: 'rope', name: 'Верёвка', icon: ICONS.rope, kind: 'resource' },
  rawMeat: { id: 'rawMeat', name: 'Сырое мясо', icon: ICONS.rawMeat, kind: 'food' },
  cookedMeat: { id: 'cookedMeat', name: 'Жареное мясо', icon: ICONS.cookedMeat, kind: 'food', hotbar: true, action: 'Съесть' },
  cookedWater: { id: 'cookedWater', name: 'Кипячёная вода', icon: ICONS.cookedWater, kind: 'food', hotbar: true, action: 'Выпить' },

  knife: { id: 'knife', name: 'Каменный нож', icon: ICONS.knife, kind: 'tool', hotbar: true, tool: { chop: 1.2, mine: 0.4, weapon: 8 } },
  spear: { id: 'spear', name: 'Копьё', icon: ICONS.spear, kind: 'tool', hotbar: true, tool: { chop: 0.9, mine: 0.3, weapon: 18 } },
  axe: { id: 'axe', name: 'Топор', icon: ICONS.axe, kind: 'tool', hotbar: true, tool: { chop: 3.2, mine: 0.8, weapon: 12 } },
  pickaxe: { id: 'pickaxe', name: 'Кирка', icon: ICONS.pickaxe, kind: 'tool', hotbar: true, tool: { chop: 1.0, mine: 3.0, weapon: 7 } },
  torch: { id: 'torch', name: 'Факел', icon: ICONS.torch, kind: 'tool', hotbar: true, light: true, tool: { chop: 0.6, mine: 0.2, weapon: 4 } },
  campfireKit: { id: 'campfireKit', name: 'Костровое место', icon: ICONS.campfireKit, kind: 'placeable', hotbar: true },
};

/** Порядок слотов хотбара */
export const HOTBAR = ['coconut', 'berries', 'knife', 'spear', 'axe', 'pickaxe', 'torch', 'campfireKit'];

/** Порядок сумки */
export const BAG_ORDER = [
  'wood', 'stone', 'flint', 'fiber', 'rope',
  'coconut', 'berries', 'rawMeat', 'cookedMeat', 'cookedWater',
  'knife', 'spear', 'axe', 'pickaxe', 'torch', 'campfireKit',
];

/**
 * Рецепты. need — что потратить, gives — что получить.
 * Требуется верстак? Нет: всё «дикое», руками на коленке.
 */
export const RECIPES = [
  { id: 'rope', name: 'Верёвка', need: { fiber: 2 }, gives: { rope: 1 }, note: 'Волокно, скрученное в шнур' },
  { id: 'knife', name: 'Каменный нож', need: { wood: 1, flint: 1, rope: 1 }, gives: { knife: 1 }, note: 'Первый настоящий инструмент' },
  { id: 'spear', name: 'Копьё', need: { wood: 2, flint: 1, rope: 1 }, gives: { spear: 1 }, note: 'Оружие против зверя' },
  { id: 'axe', name: 'Топор', need: { wood: 2, stone: 2, rope: 1 }, gives: { axe: 1 }, note: 'Валит деревья втрое быстрее' },
  { id: 'pickaxe', name: 'Кирка', need: { wood: 2, stone: 3, rope: 1 }, gives: { pickaxe: 1 }, note: 'Без неё камни почти не поддаются' },
  { id: 'torch', name: 'Факел', need: { wood: 1, fiber: 2 }, gives: { torch: 1 }, note: 'Светит ночью, держится в руке' },
  { id: 'campfireKit', name: 'Костровое место', need: { wood: 3, stone: 5 }, gives: { campfireKit: 1 }, note: 'Ставится на землю клавишей F' },
];
