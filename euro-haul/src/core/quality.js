// Единая система качества (LOD): одна таблица бюджетов на всю игру.
// Раньше каждый модуль решал сам («на телефоне 14 машин, 1100 капель…»),
// из-за этого настройки расходились. Теперь качество — это профиль.
export const QUALITY_LEVELS = ['low', 'medium', 'high'];

const BASE = {
  // Кадр
  pixelRatio: 1.6,
  maxPixelRatio: 1.75,
  shadow: true,
  shadowSize: 2048,
  shadowSpan: 62,
  // Окружение и материалы
  envPresets: 5, // сколько HDR-сред держим в памяти
  envSize: 256, // размер кубической карты PMREM
  anisotropy: 8,
  textureSize: 1024, // размер процедурных карт
  reflections: true,
  // Мир
  worldAhead: 2200,
  worldBehind: 320,
  treeDensity: 1,
  grassDensity: 1,
  bushDensity: 1,
  traffic: 26,
  particles: 1,
  stars: 1400,
  // Физика/свет
  contactShadows: true,
  sunShafts: true,
};

export const PROFILES = {
  low: {
    ...BASE,
    pixelRatio: 0.85,
    maxPixelRatio: 1.4,
    shadowSize: 512,
    shadowSpan: 40,
    envPresets: 3,
    envSize: 128,
    anisotropy: 2,
    textureSize: 512,
    reflections: false,
    worldAhead: 900,
    worldBehind: 160,
    treeDensity: 0.45,
    grassDensity: 0.35,
    bushDensity: 0.5,
    traffic: 14,
    particles: 0.45,
    stars: 700,
    contactShadows: true,
    sunShafts: false,
  },
  medium: {
    ...BASE,
    pixelRatio: 1.1,
    maxPixelRatio: 1.6,
    shadowSize: 1024,
    shadowSpan: 50,
    envPresets: 4,
    envSize: 192,
    anisotropy: 4,
    textureSize: 768,
    worldAhead: 1400,
    worldBehind: 240,
    treeDensity: 0.75,
    grassDensity: 0.65,
    bushDensity: 0.75,
    traffic: 20,
    particles: 0.7,
    stars: 1100,
  },
  high: { ...BASE },
};

/** Профиль по названию уровня; неизвестное — «среднее». */
export function qualityProfile(level) {
  return PROFILES[level] || PROFILES.medium;
}

/** Сколько объектов ставить в мире: доля от базового числа, минимум 1. */
export function densityFor(level, key, baseCount) {
  const p = qualityProfile(level);
  return Math.max(1, Math.round(baseCount * (p[key] ?? 1)));
}

/** Размер процедурной текстуры под качество (степень двойки). */
export function textureSizeFor(level, max = 1024) {
  const size = qualityProfile(level).textureSize;
  return Math.min(max, Math.max(128, size));
}
