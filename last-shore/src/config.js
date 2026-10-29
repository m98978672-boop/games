// ============================================================
//  LAST SHORE — константы мира и баланса.
//  Все «числа игры» живут здесь, чтобы баланс правился в одном месте.
// ============================================================

export const CONFIG = {
  // --- Мир -----------------------------------------------------
  world: {
    size: 360,          // размер острова (м) по стороне
    segments: 200,      // плотность сетки рельефа
    seaLevel: 0,
    seed: 1337,
  },

  // --- Время ---------------------------------------------------
  time: {
    dayLength: 720,     // 12 реальных минут на полные сутки
    startHour: 7.0,     // старт игры: утро
    nightStart: 20.5,
    dayStart: 5.5,
  },

  // --- Игрок ---------------------------------------------------
  player: {
    walkSpeed: 4.4,
    sprintSpeed: 8.0,
    wadeSpeed: 2.2,
    accel: 14,
    jumpSpeed: 6.2,
    gravity: -22,
    flySpeed: 7.5,        // креатив: вертикальная скорость полёта
    flyHorizontal: 9.5,   // креатив: скорость по горизонту
    maxDepth: 1.15,     // глубже этого герой уже не идёт по дну, а плывёт
    swimSpeed: 3.1,     // гребок по поверхности
    swimFast: 4.6,      // гребок с разгоном
    diveSpeed: 3.4,     // погружение и всплытие
    floatLine: 1.02,    // на сколько тело уходит под воду, когда герой держится на поверхности
    airMax: 100,        // запас воздуха, секунд хватает примерно на 25
    airDrain: 4.2,      // воздух уходит под водой
    airRefill: 26,      // и возвращается на поверхности
    radius: 0.42,
    height: 1.8,
    eye: 1.55,
    cameraDistance: 6.2,
    cameraMinPitch: -0.55,
    cameraMaxPitch: 1.15,
    mouseSensitivity: 0.0024,
  },

  // --- Потребности ---------------------------------------------
  needs: {
    thirstDrain: 0.30,     // ед/сек  -> полная шкала за ~5.5 мин
    hungerDrain: 0.19,     // ед/сек  -> полная шкала за ~8.7 мин
    staminaDrain: 26,      // при беге
    staminaRegen: 20,
    staminaRegenRest: 34,
    healthDrain: 1.6,      // при нуле голода/жажды
    healthRegen: 0.35,     // если сыт и напоён
    coldDrain: 0.8,        // здоровье при переохлаждении
  },

  // --- Взаимодействие -----------------------------------------
  interact: {
    reach: 3.4,           // радиус подбора
  },

  // --- Еда -----------------------------------------------------
  food: {
    coconut: { thirst: 20, hunger: 6, name: 'Кокос' },
    berries: { hunger: 12, thirst: 2, name: 'Ягоды' },
  },
};

export const COLORS = {
  sand: 0xdfcb95,
  sandWet: 0xc7b083,
  grass: 0x84ab55,
  jungle: 0x4e7a43,
  rock: 0x8b8478,
  rockDark: 0x6d665c,
  snow: 0xdfe6e4,
  water: 0x1d6f8c,
  trunk: 0x7a5a3a,
  frond: 0x5c9a45,
  frondLight: 0x7ab85a,
  bush: 0x4b7d40,
  berry: 0xb9334a,
  coconut: 0x6b4b2a,
  stone: 0x9a958c,
  cloth: 0xcfc3a3,
  skin: 0xc98d62,
  pants: 0x4a5a6a,
  backpack: 0x8a6b45,
};
