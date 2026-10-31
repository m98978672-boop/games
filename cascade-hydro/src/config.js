// ============================================================================
//  КАСКАД: Живая Вода — конфигурация физики, гидротехники, экономики и городов
// ============================================================================

export const WORLD = {
  size: 576,            // размер долины 576 × 576 м
  gravity: 9.81,        // ускорение свободного падения, м/с²
  waterDensity: 1000,   // плотность воды, кг/м³
  dayLengthSec: 180,    // полные игровые сутки = 3 минуты реального времени (×1)
};

// Профили качества (автовыбор как в last-shore + ручное переключение)
export const QUALITY_PROFILES = {
  low: {
    id: 'low',
    label: 'Лёгкое',
    grid: 144,
    maxPixelRatio: 1.15,
    shadows: false,
    shadowEvery: 0,
    maxParticles: 1100,
    treeCount: 520,
    rockCount: 180,
    substepsCap: 6,
  },
  medium: {
    id: 'medium',
    label: 'Обычное',
    grid: 176,
    maxPixelRatio: 1.6,
    shadows: true,
    shadowEvery: 3,
    maxParticles: 2400,
    treeCount: 920,
    rockCount: 300,
    substepsCap: 8,
  },
  high: {
    id: 'high',
    label: 'Высокое',
    grid: 208,
    maxPixelRatio: 2.0,
    shadows: true,
    shadowEvery: 2,
    maxParticles: 4200,
    treeCount: 1400,
    rockCount: 440,
    substepsCap: 10,
  },
};

// Гидрологические режимы погоды
export const WEATHER_MODES = {
  low_water: {
    id: 'low_water',
    label: 'Летняя межень',
    icon: '☀',
    inflowMult: 0.72,
    rainRate: 0.0,       // м/с осадков по площади
    sunIntensity: 1.15,
    fogDensity: 0.00052,
    next: { low_water: 0.25, normal: 0.55, rain: 0.20 },
  },
  normal: {
    id: 'normal',
    label: 'Нормальный сток',
    icon: '◈',
    inflowMult: 1.0,
    rainRate: 0.0,
    sunIntensity: 1.04,
    fogDensity: 0.00066,
    next: { low_water: 0.22, normal: 0.43, rain: 0.27, flood: 0.08 },
  },
  rain: {
    id: 'rain',
    label: 'Дождевой паводок',
    icon: '☂',
    inflowMult: 1.52,
    rainRate: 0.00016,
    sunIntensity: 0.58,
    fogDensity: 0.00105,
    next: { normal: 0.45, rain: 0.30, flood: 0.25 },
  },
  flood: {
    id: 'flood',
    label: 'Весеннее половодье',
    icon: '⚡',
    inflowMult: 2.25,
    rainRate: 0.00034,
    sunIntensity: 0.42,
    fogDensity: 0.00135,
    next: { rain: 0.55, normal: 0.45 },
  },
};

// Инструменты строительства и земляных работ
export const TOOLS = [
  {
    id: 'inspect',
    key: '1',
    name: 'Гидропост / Осмотр',
    short: 'Осмотр',
    icon: '🧭',
    costLabel: 'бесплатно',
    desc: 'Замер глубины, скорости течения, числа Фруда, отметок дна и настройка затворов/турбин.',
  },
  {
    id: 'canal_dig',
    key: '2',
    name: 'Экскаватор канала',
    short: 'Копать канал',
    icon: '⛏️',
    costPerM3Soil: 3.5,
    costPerM3Rock: 16.0,
    costLabel: '3.5 ₽/м³ грунт',
    desc: 'Прорыть собственный канал или углубить отводящее русло. Зажмите Shift, чтобы вести идеально ровное дно с плавным уклоном!',
  },
  {
    id: 'canal_liner',
    key: '3',
    name: 'Бетонная облицовка русла',
    short: 'Бетон русла',
    icon: '🧱',
    costPerCell: 65,
    costLabel: '65 ₽/секция',
    desc: 'Облицевать дно и откосы канала гладким бетоном (n = 0.012): скорость потока выше в 2.5 раза и нулевой размыв берегов!',
  },
  {
    id: 'earth_dam',
    key: '4',
    name: 'Грунтовая дамба / перемычка',
    short: 'Дамба (грунт)',
    icon: '⛰️',
    costPerM3: 5.5,
    costLabel: '5.5 ₽/м³ (из отвала -70%)',
    desc: 'Дешёвая насыпная перемычка для отвода реки в обходной канал или защиты городов. Внимание: при переливе через гребень размывается!',
  },
  {
    id: 'concrete_dam',
    key: '5',
    name: 'Бетонная плотина',
    short: 'Плотина',
    icon: '🏗️',
    costPerM3: 24.0,
    costLabel: '24 ₽/м³ бетона',
    desc: 'Монолитная гравитационная плотина. Держит огромный напор водохранилища и не размывается потоком. Повторный проход поднимает гребень.',
  },
  {
    id: 'spillway',
    key: '6',
    name: 'Водосброс с затвором',
    short: 'Водосброс',
    icon: '🌊',
    costFlat: 4200,
    costLabel: '4 200 ₽',
    desc: 'Регулируемый сегментный затвор с носком-трамплином: сбрасывает паводок эффектной 3D-струёй или пускает воду в канал по расписанию.',
  },
  {
    id: 'turbine_kaplan',
    key: '7',
    name: 'ГЭС Каплана (русловая)',
    short: 'Каплан 5 МВт',
    icon: '⚙️',
    turbineType: 'kaplan',
    costFlat: 9500,
    costLabel: '9 500 ₽',
    desc: 'Поворотно-лопастная турбина для малых и средних напоров (3–14 м) и большого расхода воды. Идеальна для первой плотины или канала!',
  },
  {
    id: 'turbine_francis',
    key: '8',
    name: 'ГЭС Фрэнсиса (напорная)',
    short: 'Фрэнсис 16 МВт',
    icon: '⚡',
    turbineType: 'francis',
    costFlat: 24000,
    costLabel: '24 000 ₽',
    desc: 'Мощный радиально-осевой гидроагрегат для средних и высоких бетонных плотин (10–35 м). Высокий КПД 93%.',
  },
  {
    id: 'turbine_pelton',
    key: '9',
    name: 'ГЭС Пелтона (деривационная)',
    short: 'Пелтон 24 МВт',
    icon: '🏔️',
    turbineType: 'pelton',
    costFlat: 32000,
    costLabel: '32 000 ₽',
    desc: 'Высоконапорная ковшовая турбина (14–48 м): ставится на крутом сбросе из деривационного канала или у высокой плотины в каньоне.',
  },
  {
    id: 'powerline',
    key: '0',
    name: 'ЛЭП 110 кВ к городам',
    short: 'ЛЭП к городу',
    icon: '🗼',
    costPerMeter: 14,
    costLabel: '14 ₽/м линии',
    desc: 'Кликните по городу или используйте панель сети, чтобы протянуть опоры ЛЭП от вашей ГЭС и начать продавать электроэнергию.',
  },
  {
    id: 'demolish',
    key: 'X',
    name: 'Демонтаж / Расчистка',
    short: 'Снос',
    icon: '🧨',
    costFlat: 250,
    costLabel: '250 ₽',
    desc: 'Снести гидроагрегат, затвор или разобрать бетонный блок плотины.',
  },
];

// Инженерные характеристики турбин (реальная формула P = rho * g * Q * H_net * eta)
export const TURBINE_SPECS = {
  kaplan: {
    id: 'kaplan',
    name: 'Каплана ПЛ-6',
    ratedMW: 6.5,
    minHead: 2.2,
    optHead: 8.0,
    maxHead: 20.0,
    headSigma: 11.5,
    maxArea: 4.8,       // эффективное проходное сечение водовода C_d * A, м²
    peakEta: 0.91,
    frictionK: 0.00018, // потери напора в водоводе k * Q²
    upkeepPerSec: 10,
    cost: 9500,
    color: 0x3b82f6,
  },
  francis: {
    id: 'francis',
    name: 'Фрэнсиса РО-18',
    ratedMW: 18.0,
    minHead: 5.0,
    optHead: 16.5,
    maxHead: 42.0,
    headSigma: 15.5,
    maxArea: 6.2,
    peakEta: 0.935,
    frictionK: 0.00012,
    upkeepPerSec: 24,
    cost: 24000,
    color: 0xf59e0b,
  },
  pelton: {
    id: 'pelton',
    name: 'Пелтона К-28',
    ratedMW: 28.0,
    minHead: 9.0,
    optHead: 25.0,
    maxHead: 60.0,
    headSigma: 20.0,
    maxArea: 5.2,
    peakEta: 0.925,
    frictionK: 0.00010,
    upkeepPerSec: 32,
    cost: 32000,
    color: 0x10b981,
  },
};

// Суточный график тарифа оптового энергорынка (24 часа)
// Базовая ставка за 1 МВт за 1 реальную секунду игры
export const ECONOMY = {
  startingCash: 48000,
  baseRatePerMWSec: 340, // ₽ / (МВт·с) при коэффициенте тарифа 1.0
  irrigationBonusPerSec: 95, // ₽/с за орошение Агродолины каналом
  overSupplyExportFactor: 0.38, // излишки сверх спроса городов уходят во внешнюю энергосистему по оптовой цене
  loanChunk: 25000,
  loanInterestPerSec: 0.00045, // мягкий процент по зелёным облигациям
  maxLoan: 125000,
};

export function spotTariffMultiplier(hour) {
  const h = ((hour % 24) + 24) % 24;
  if (h >= 0 && h < 6) return 0.58;           // Ночной провал — копим воду!
  if (h >= 6 && h < 10.5) return 1.62;        // Утренний пик
  if (h >= 10.5 && h < 17) return 1.05;       // Дневной полупик
  if (h >= 17 && h < 22) return 2.35;         // Вечерний супер-пик!
  return 0.82;                                // Поздний вечер
}

export function spotPeriodLabel(hour) {
  const h = ((hour % 24) + 24) % 24;
  if (h >= 0 && h < 6) return { label: 'Ночной минимум (копите воду)', cls: 'offpeak' };
  if (h >= 6 && h < 10.5) return { label: 'Утренний пик ×1.62', cls: 'peak' };
  if (h >= 10.5 && h < 17) return { label: 'Дневной полупик ×1.05', cls: 'mid' };
  if (h >= 17 && h < 22) return { label: 'Вечерний СУПЕР-ПИК ×2.35', cls: 'superpeak' };
  return { label: 'Спад нагрузки ×0.82', cls: 'offpeak' };
}

// 4 саморазвивающихся города долины (координаты в мировых метрах [-288..+288])
export const CITY_DEFS = [
  {
    id: 'posad',
    name: 'Речной Посад',
    subtitle: 'Деревообработка и речной порт',
    x: -118,
    z: 162,
    plateauRadius: 52,
    baseElevation: 17.5,
    startPop: 420,
    baseDemandMW: 0.35,
    demandPerBuilding: 0.075,
    tariffBonus: 1.0,
    connectedAtStart: true,
    accent: 0x60a5fa,
    archetype: 'town',
  },
  {
    id: 'agro',
    name: 'Агродолина',
    subtitle: 'Поля, теплицы и оросительный узел',
    x: 168,
    z: 86,
    plateauRadius: 56,
    baseElevation: 18.0,
    startPop: 560,
    baseDemandMW: 0.45,
    demandPerBuilding: 0.085,
    tariffBonus: 1.08,
    needsIrrigation: true,
    irrigationTarget: { x: 128, z: 76, radius: 34 },
    connectedAtStart: false,
    accent: 0x34d399,
    archetype: 'agro',
  },
  {
    id: 'kamen',
    name: 'Каменногорск',
    subtitle: 'Горнорудный комбинат и заводы',
    x: 152,
    z: -136,
    plateauRadius: 54,
    baseElevation: 33.5,
    startPop: 890,
    baseDemandMW: 0.85,
    demandPerBuilding: 0.14,
    tariffBonus: 1.22,
    connectedAtStart: false,
    accent: 0xfbbf24,
    archetype: 'industrial',
  },
  {
    id: 'svetlograd',
    name: 'Светлоград',
    subtitle: 'Столица долины и технопарк',
    x: -158,
    z: -24,
    plateauRadius: 68,
    baseElevation: 24.5,
    startPop: 1650,
    baseDemandMW: 1.25,
    demandPerBuilding: 0.18,
    tariffBonus: 1.18,
    connectedAtStart: false,
    accent: 0xa78bfa,
    archetype: 'metropolis',
  },
];

// Государственные гранты и инженерные вехи (ускоряют развитие и ставят ясные цели)
export const MILESTONES = [
  {
    id: 'first_watt',
    title: 'Первый ток в сети!',
    desc: 'Запустите первую турбину и выдайте хотя бы 0.5 МВт мощности.',
    reward: 10000,
    check: (st) => st.totalMW >= 0.5,
  },
  {
    id: 'custom_canal',
    title: 'Собственный канал',
    desc: 'Прокопайте не менее 450 м³ грунта для деривационного, обводного или оросительного канала.',
    reward: 12000,
    check: (st) => st.excavatedM3 >= 450,
  },
  {
    id: 'irrigation_done',
    title: 'Живительная влага Агродолины',
    desc: 'Подведите воду собственным каналом к водозабору Агродолины.',
    reward: 16000,
    check: (st) => st.agroIrrigated === true,
  },
  {
    id: 'power_8mw',
    title: 'Малая энергетика пройдена (8 МВт)',
    desc: 'Достигните суммарной генерации 8 МВт на ваших гидроагрегатах.',
    reward: 22000,
    check: (st) => st.totalMW >= 8.0,
  },
  {
    id: 'all_cities_grid',
    title: 'Единая энергосистема долины',
    desc: 'Подключите линиями ЛЭП все 4 города долины и подайте им напряжение.',
    reward: 28000,
    check: (st) => st.connectedCities >= 4 && st.totalMW >= 4.0,
  },
  {
    id: 'growing_valley',
    title: 'Бум градостроительства',
    desc: 'Обеспечьте города энергией так, чтобы совокупное население долины превысило 8 000 жителей.',
    reward: 38000,
    check: (st) => st.totalPopulation >= 8000,
  },
  {
    id: 'cascade_25mw',
    title: 'Флагман гидроэнергетики (25 МВт)',
    desc: 'Раскрутите каскад ГЭС до мощности 25 МВт!',
    reward: 60000,
    check: (st) => st.totalMW >= 25.0,
  },
];
