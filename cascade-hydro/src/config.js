// ============================================================================
//  КАСКАД: Живая Вода — конфигурация долины 768×768 м, объёмной стройки,
//  гидродинамики, энергорынка, 5 растущих городов и сценариев карт
// ============================================================================

export const WORLD = {
  size: 768,            // увеличенная долина 768 × 768 м (+78% площади!)
  gravity: 9.81,        // ускорение свободного падения, м/с²
  waterDensity: 1000,   // плотность воды, кг/м³
  dayLengthSec: 185,    // полные игровые сутки = ~3 минуты реального времени (×1)
};

// Параметры сложной объёмной стройки и инженерной геологии
export const CONSTRUCTION = {
  pourRateM3PerSec: 460,        // скорость бетонирования бригадами и кранами, м³/с (×1)
  cofferdamInstantRatio: 0.62,  // шпунтовая опалубка сразу держит 62% проектной высоты
  rockAggregateDiscount: 0.38,  // скидка 38% на бетон при наличии собственного щебня из выемки скалы
  highDamHeadThreshold: 10.5,   // свыше 10.5 м напора без цементации начинается фильтрация под подошвой
  maxUnreinforcedHead: 17.5,    // предельный безопасный напор без 3D-контрфорсов
  substationCost: 6800,         // стоимость узловой 3D-подстанции ОРУ 110 кВ
  baseGridLossNoSub: 0.16,      // потери в длинных сетях без узловой ОРУ 110 кВ (16%)
  gridLossWithSub: 0.03,        // потери с узловой подстанцией ОРУ 110 кВ (3%)
  damHeightTiers: [
    { id: 'low', label: 'Ярус +6м', addHeight: 6.2 },
    { id: 'mid', label: 'Ярус +11м', addHeight: 11.2 },
    { id: 'high', label: 'Ярус +17м', addHeight: 17.0 },
  ],
};

// Сценарии карт для экрана предзагрузки перед игрой
export const VALLEY_PRESETS = {
  bystritsa: {
    id: 'bystritsa',
    name: 'Долина «Большая Быстрица»',
    badge: 'Рекомендуется · Обучение',
    areaLabel: '768 × 768 м · 3 реки · 5 городов',
    headLabel: 'Перепад высот: 36 м',
    mainInflowQ: 158,
    creekInflowQ: 52,
    westCreekQ: 34,
    desc: 'Гранитная теснина «Ворота Грома», два горных притока, широкое деривационное плато у излучины «Подкова» и орошаемая Агродолина.',
    landmarks: [
      { label: '▲ Створ «Ворота Грома»', x: 12, z: -158, dist: 132 },
      { label: '◆ Деривационное плато', x: -18, z: -12, dist: 175 },
      { label: '◉ Орошение Агродолины', x: 168, z: 98, dist: 145 },
      { label: '≈ Нижний плёс и Посад', x: -24, z: 235, dist: 185 },
    ],
  },
  rapids: {
    id: 'rapids',
    name: 'Каскад «Северные Пороги»',
    badge: 'Высокий напор · Скалы',
    areaLabel: '768 × 768 м · Двойной каньон',
    headLabel: 'Перепад высот: 46 м',
    mainInflowQ: 172,
    creekInflowQ: 64,
    westCreekQ: 42,
    desc: 'Крутая ступенчатая горная долина с двумя узкими ущельями подряд. Идеальна для многоступенчатого каскада ГЭС Фрэнсиса и Пелтона с контрфорсами.',
    landmarks: [
      { label: '▲ Верхний каньон', x: -18, z: -248, dist: 135 },
      { label: '▲ Нижние Пороги', x: 22, z: -98, dist: 140 },
      { label: '◆ Обводная полка', x: -26, z: 32, dist: 170 },
      { label: '◉ Терраса Агродолины', x: 168, z: 98, dist: 150 },
    ],
  },
  delta: {
    id: 'delta',
    name: 'Пойма «Зеркальная Дельта»',
    badge: 'Каналы и паводки',
    areaLabel: '768 × 768 м · Широкое русло',
    headLabel: 'Перепад высот: 28 м',
    mainInflowQ: 195,
    creekInflowQ: 58,
    westCreekQ: 48,
    desc: 'Мощная полноводная река в широкой пойме с мягкими грунтами. Требует длинных дамб, цементации основания, бетонных каналов и защиты городов от половодья.',
    landmarks: [
      { label: '▲ Главный гидроузел', x: 8, z: -152, dist: 155 },
      { label: '◆ Трасса спрямления', x: -16, z: -6, dist: 185 },
      { label: '◉ Бассейн Агродолины', x: 168, z: 98, dist: 150 },
      { label: '≈ Широкая дельта', x: -12, z: 255, dist: 195 },
    ],
  },
};

// Профили качества (адаптированы под увеличенную карту 768×768 м)
export const QUALITY_PROFILES = {
  low: {
    id: 'low',
    label: 'Лёгкое',
    grid: 168,
    maxPixelRatio: 1.15,
    shadows: false,
    shadowEvery: 0,
    maxParticles: 1300,
    treeCount: 720,
    rockCount: 240,
    substepsCap: 6,
  },
  medium: {
    id: 'medium',
    label: 'Обычное',
    grid: 208,
    maxPixelRatio: 1.6,
    shadows: true,
    shadowEvery: 3,
    maxParticles: 2800,
    treeCount: 1350,
    rockCount: 420,
    substepsCap: 8,
  },
  high: {
    id: 'high',
    label: 'Высокое',
    grid: 248,
    maxPixelRatio: 2.0,
    shadows: true,
    shadowEvery: 2,
    maxParticles: 4800,
    treeCount: 2100,
    rockCount: 620,
    substepsCap: 10,
  },
};

// Гидрологические режимы погоды
export const WEATHER_MODES = {
  low_water: {
    id: 'low_water',
    label: 'Летняя межень',
    icon: '☀',
    inflowMult: 0.74,
    rainRate: 0.0,
    sunIntensity: 1.16,
    fogDensity: 0.00040,
    next: { low_water: 0.25, normal: 0.55, rain: 0.20 },
  },
  normal: {
    id: 'normal',
    label: 'Нормальный сток',
    icon: '◈',
    inflowMult: 1.0,
    rainRate: 0.0,
    sunIntensity: 1.05,
    fogDensity: 0.00050,
    next: { low_water: 0.22, normal: 0.43, rain: 0.27, flood: 0.08 },
  },
  rain: {
    id: 'rain',
    label: 'Дождевой паводок',
    icon: '☂',
    inflowMult: 1.52,
    rainRate: 0.00015,
    sunIntensity: 0.60,
    fogDensity: 0.00082,
    next: { normal: 0.45, rain: 0.30, flood: 0.25 },
  },
  flood: {
    id: 'flood',
    label: 'Весеннее половодье',
    icon: '◈',
    inflowMult: 2.25,
    rainRate: 0.00032,
    sunIntensity: 0.44,
    fogDensity: 0.00106,
    next: { rain: 0.55, normal: 0.45 },
  },
};

// 12 инженерных инструментов объёмного строительства и гидротехники
export const TOOLS = [
  {
    id: 'inspect',
    key: '1',
    name: 'Гидропост / Инспекция',
    short: 'Осмотр',
    costLabel: 'бесплатно',
    desc: 'Замер глубины, числа Фруда, геологии пород, стадии бетонирования и настройка турбин/затворов.',
  },
  {
    id: 'canal_dig',
    key: '2',
    name: 'Экскаватор канала',
    short: 'Копать канал',
    costPerM3Soil: 3.4,
    costPerM3Rock: 14.5,
    costLabel: '3.4 ₽/м³ + щебень',
    desc: 'Копка каналов и котлованов (даёт грунт и гранитный щебень со скидкой 38% на бетон!). Зажмите Shift для ровного уклона.',
  },
  {
    id: 'canal_liner',
    key: '3',
    name: 'Ж/Б лоток и борта канала',
    short: 'Ж/Б лоток',
    costPerCell: 58,
    costLabel: '58 ₽/секция',
    desc: 'Укладка объёмных железобетонных плит и парапетов канала (n = 0.012): поток в 2.5× быстрее и нулевой размыв!',
  },
  {
    id: 'earth_dam',
    key: '4',
    name: 'Временная насыпная дамба',
    short: 'Перемычка',
    costPerM3: 5.2,
    costLabel: '5.2 ₽/м³ (-70% отвал)',
    desc: 'Быстрая строительная перемычка из грунта для осушения котлована плотины или защиты берегов. Размывается при переливе!',
  },
  {
    id: 'concrete_dam',
    key: '5',
    name: 'Объёмная бетонная плотина',
    short: '3D Плотина',
    costPerM3: 22.0,
    costLabel: '22 ₽/м³ (3 этапа)',
    desc: 'Возводится в 3 стадии с башенными кранами: шпунт → армокаркас и опалубка → 3D-монолит с парапетом! Выберите высоту яруса внизу.',
  },
  {
    id: 'foundation',
    key: '6',
    name: 'Скальный фундамент и Контрфорс',
    short: 'Контрфорс',
    costPerCell: 135,
    costLabel: '135 ₽/блок',
    desc: 'Цементация основания до скалы и монтаж объёмных 3D-контрфорсов плотины: убирает фильтрацию под подошвой и держит сверхнапор!',
  },
  {
    id: 'spillway',
    key: '7',
    name: 'Водосброс с сегментным затвором',
    short: 'Водосброс',
    costFlat: 4400,
    costLabel: '4 400 ₽',
    desc: 'Бетонный водослив с подъёмным стальным затвором и носком-трамплином: безопасно сбрасывает паводок эффектной 3D-струёй.',
  },
  {
    id: 'turbine_kaplan',
    key: '8',
    name: 'Гидроузел Каплана (русловой)',
    short: 'Каплан 7 МВт',
    turbineType: 'kaplan',
    costFlat: 9500,
    costLabel: '9 500 ₽',
    desc: 'Водоприёмник с сороудерживающей решёткой, водовод и машинный зал для малых и средних напоров (2.5–16 м).',
  },
  {
    id: 'turbine_francis',
    key: '9',
    name: 'Гидроузел Фрэнсиса (напорный)',
    short: 'Фрэнсис 19 МВт',
    turbineType: 'francis',
    costFlat: 23500,
    costLabel: '23 500 ₽',
    desc: 'Мощный гидроагрегат со стальным напорным трубопроводом для средних и высоких плотин с контрфорсами (8–38 м, КПД 93.5%).',
  },
  {
    id: 'turbine_pelton',
    key: '0',
    name: 'Гидроузел Пелтона (ковшовый)',
    short: 'Пелтон 30 МВт',
    turbineType: 'pelton',
    costFlat: 32000,
    costLabel: '32 000 ₽',
    desc: 'Высоконапорная деривационная ГЭС (13–52 м) с длинным напорным водоводом для глубоких каньонов и крутых сбросов с канала.',
  },
  {
    id: 'powerline',
    key: 'P',
    name: 'Подстанция ОРУ 110 кВ и ЛЭП',
    short: 'ОРУ / ЛЭП',
    costPerMeter: 13,
    costLabel: '6 800 ₽ ОРУ / ЛЭП',
    desc: 'Клик по городу — тянет ажурные опоры ЛЭП 110 кВ. Клик на берегу у ГЭС — строит 3D-подстанцию ОРУ 110 кВ (снижает потери с 16% до 3%)!',
  },
  {
    id: 'demolish',
    key: 'X',
    name: 'Демонтаж / Гидромолот',
    short: 'Снос',
    costFlat: 250,
    costLabel: '250 ₽',
    desc: 'Демонтировать гидроагрегат, затвор, подстанцию или разобрать секцию бетонной плотины.',
  },
];

// Инженерные характеристики турбин (честная формула P = rho * g * Q * H_net * eta)
export const TURBINE_SPECS = {
  kaplan: {
    id: 'kaplan',
    name: 'Каплана ПЛ-7',
    ratedMW: 7.0,
    minHead: 2.2,
    optHead: 8.2,
    maxHead: 21.0,
    headSigma: 12.0,
    maxArea: 5.1,
    peakEta: 0.915,
    frictionK: 0.00017,
    upkeepPerSec: 10,
    cost: 9500,
    color: 0x3b82f6,
  },
  francis: {
    id: 'francis',
    name: 'Фрэнсиса РО-19',
    ratedMW: 19.0,
    minHead: 5.0,
    optHead: 16.5,
    maxHead: 44.0,
    headSigma: 16.0,
    maxArea: 6.5,
    peakEta: 0.938,
    frictionK: 0.00011,
    upkeepPerSec: 23,
    cost: 23500,
    color: 0xf59e0b,
  },
  pelton: {
    id: 'pelton',
    name: 'Пелтона К-30',
    ratedMW: 30.0,
    minHead: 9.0,
    optHead: 25.5,
    maxHead: 62.0,
    headSigma: 21.0,
    maxArea: 5.5,
    peakEta: 0.928,
    frictionK: 0.00009,
    upkeepPerSec: 31,
    cost: 32000,
    color: 0x10b981,
  },
};

export const ECONOMY = {
  startingCash: 56000,
  baseRatePerMWSec: 345,
  irrigationBonusPerSec: 110,
  overSupplyExportFactor: 0.40,
  loanChunk: 25000,
  loanInterestPerSec: 0.00042,
  maxLoan: 150000,
};

export function spotTariffMultiplier(hour) {
  const h = ((hour % 24) + 24) % 24;
  if (h >= 0 && h < 6) return 0.58;
  if (h >= 6 && h < 10.5) return 1.62;
  if (h >= 10.5 && h < 17) return 1.05;
  if (h >= 17 && h < 22) return 2.35;
  return 0.82;
}

export function spotPeriodLabel(hour) {
  const h = ((hour % 24) + 24) % 24;
  if (h >= 0 && h < 6) return { label: 'Ночной минимум (копите воду)', cls: 'offpeak' };
  if (h >= 6 && h < 10.5) return { label: 'Утренний пик ×1.62', cls: 'peak' };
  if (h >= 10.5 && h < 17) return { label: 'Дневной полупик ×1.05', cls: 'mid' };
  if (h >= 17 && h < 22) return { label: 'Вечерний СУПЕР-ПИК ×2.35', cls: 'superpeak' };
  return { label: 'Спад нагрузки ×0.82', cls: 'offpeak' };
}

// 5 саморазвивающихся городов в расширенной долине 768×768 м ([-384..+384])
export const CITY_DEFS = [
  {
    id: 'posad',
    name: 'Речной Посад',
    subtitle: 'Деревообработка и южная пристань',
    x: -158,
    z: 224,
    plateauRadius: 58,
    baseElevation: 17.5,
    startPop: 440,
    baseDemandMW: 0.36,
    demandPerBuilding: 0.075,
    tariffBonus: 1.0,
    connectedAtStart: true,
    accent: 0x60a5fa,
    archetype: 'town',
  },
  {
    id: 'agro',
    name: 'Агродолина',
    subtitle: 'Зерновые террасы, теплицы и оросительный узел',
    x: 222,
    z: 112,
    plateauRadius: 64,
    baseElevation: 18.2,
    startPop: 590,
    baseDemandMW: 0.48,
    demandPerBuilding: 0.085,
    tariffBonus: 1.10,
    needsIrrigation: true,
    irrigationTarget: { x: 168, z: 98, radius: 38 },
    connectedAtStart: false,
    accent: 0x34d399,
    archetype: 'agro',
  },
  {
    id: 'sever',
    name: 'Североборск',
    subtitle: 'Горная метеостанция и лесопильный узел',
    x: -214,
    z: -218,
    plateauRadius: 54,
    baseElevation: 35.0,
    startPop: 510,
    baseDemandMW: 0.44,
    demandPerBuilding: 0.09,
    tariffBonus: 1.14,
    connectedAtStart: false,
    accent: 0x2dd4bf,
    archetype: 'town',
  },
  {
    id: 'kamen',
    name: 'Каменногорск',
    subtitle: 'Горнорудный комбинат и электрометаллургия',
    x: 208,
    z: -182,
    plateauRadius: 60,
    baseElevation: 34.0,
    startPop: 920,
    baseDemandMW: 0.88,
    demandPerBuilding: 0.145,
    tariffBonus: 1.24,
    connectedAtStart: false,
    accent: 0xfbbf24,
    archetype: 'industrial',
  },
  {
    id: 'svetlograd',
    name: 'Светлоград',
    subtitle: 'Столица долины, технопарк и высотный центр',
    x: -218,
    z: -18,
    plateauRadius: 74,
    baseElevation: 24.8,
    startPop: 1720,
    baseDemandMW: 1.30,
    demandPerBuilding: 0.185,
    tariffBonus: 1.20,
    connectedAtStart: false,
    accent: 0xa78bfa,
    archetype: 'metropolis',
  },
];

// Государственные гранты Минэнерго
export const MILESTONES = [
  {
    id: 'first_watt',
    title: 'Первый ток в сети!',
    desc: 'Завершите заливку плотины, запустите гидроагрегат и выдайте 0.5 МВт мощности.',
    reward: 11000,
    check: (st) => st.totalMW >= 0.5,
  },
  {
    id: 'reinforced_dam',
    title: 'Надёжный гидроузел и ОРУ 110 кВ',
    desc: 'Укрепите плотину минимум 6 блоками контрфорсов/цементации или постройте подстанцию ОРУ 110 кВ.',
    reward: 13000,
    check: (st) => st.reinforcedCells >= 6 || st.substations >= 1,
  },
  {
    id: 'custom_canal',
    title: 'Собственный деривационный канал',
    desc: 'Прокопайте не менее 550 м³ породы под деривационный, обводной или оросительный канал.',
    reward: 14000,
    check: (st) => st.excavatedM3 >= 550,
  },
  {
    id: 'irrigation_done',
    title: 'Живительная влага Агродолины',
    desc: 'Подведите воду собственным каналом к оросительному бассейну Агродолины.',
    reward: 18000,
    check: (st) => st.agroIrrigated === true,
  },
  {
    id: 'power_10mw',
    title: 'Промышленный каскад (10 МВт)',
    desc: 'Достигните суммарной генерации 10 МВт на ваших гидроагрегатах.',
    reward: 25000,
    check: (st) => st.totalMW >= 10.0,
  },
  {
    id: 'all_cities_grid',
    title: 'Единое энергокольцо 5 городов',
    desc: 'Подключите линиями ЛЭП все 5 городов долины и выдайте от 5 МВт.',
    reward: 32000,
    check: (st) => st.connectedCities >= 5 && st.totalMW >= 5.0,
  },
  {
    id: 'growing_valley',
    title: 'Мегаполисы живой воды',
    desc: 'Развейте саморастущие города долины до совокупного населения 10 000 жителей.',
    reward: 44000,
    check: (st) => st.totalPopulation >= 10000,
  },
  {
    id: 'cascade_30mw',
    title: 'Флагман гидроэнергетики (30 МВт)',
    desc: 'Выведите каскад ГЭС на пиковую мощность 30 МВт!',
    reward: 68000,
    check: (st) => st.totalMW >= 30.0,
  },
];
