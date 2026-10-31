// ============================================================================
//  КАСКАД: Живая Вода v0.4 — Научная конфигурация бассейна (0.8 км / 5×5 км / 10×10 км),
//  тонкой физики течений/климата/ветра, прецизионной стройки, 48 типов зданий,
//  17 инженерно-строительных инструментов, 8 городов и 12 источников дохода
// ============================================================================

export const MAP_SCALES = {
  compact: {
    id: 'compact',
    name: 'Ущелье 0.8 × 0.8 км',
    shortLabel: '0.8 × 0.8 км',
    areaKm2: 0.59,
    size: 768,
    horizScale: 1.0,
    elevScale: 1.0,
    flowScale: 1.0,
    powerScale: 1.0,
    snowLineY: 58.0,
    minZoom: 20,
    maxZoom: 720,
    defaultDist: 235,
    brushSizes: [3.5, 6.5, 11, 18],
    desc: 'Детальный инженерный створ 1:1 с ювелирной кистью от 3.5 м для тонкой проработки узлов ГЭС и каналов.',
  },
  km5: {
    id: 'km5',
    name: 'Бассейн 5 × 5 км',
    shortLabel: '5 × 5 км (25 км²)',
    areaKm2: 25.0,
    size: 5000,
    horizScale: 5000 / 768,
    elevScale: 2.35,
    flowScale: 6.2,
    powerScale: 6.5,
    snowLineY: 122.0,
    minZoom: 42,
    maxZoom: 4600,
    defaultDist: 1180,
    brushSizes: [16, 30, 52, 88],
    desc: 'Региональный бассейн 25 км²: ледниковые истоки 3 рек, тонкая стройка от 16 м, стройбазы, трассы и 8 городов.',
  },
  km10: {
    id: 'km10',
    name: 'Мега-каскад 10 × 10 км',
    shortLabel: '10 × 10 км (100 км²)',
    areaKm2: 100.0,
    size: 10000,
    horizScale: 10000 / 768,
    elevScale: 3.35,
    flowScale: 13.5,
    powerScale: 15.0,
    snowLineY: 176.0,
    minZoom: 68,
    maxZoom: 9200,
    defaultDist: 2250,
    brushSizes: [32, 58, 98, 165],
    desc: 'Сибирский каскад 100 км² масштаба Ангары и Енисея: гроты ледников, ветропарки, прецизионная стройка и мега-ГЭС.',
  },
};

export const WORLD = {
  scaleId: 'km5',
  size: 5000,
  horizScale: 5000 / 768,
  elevScale: 2.35,
  flowScale: 6.2,
  powerScale: 6.5,
  snowLineY: 122.0,
  minZoom: 42,
  maxZoom: 4600,
  defaultDist: 1180,
  brushSizes: [16, 30, 52, 88],
  gravity: 9.81,        // ускорение свободного падения g, м/с²
  waterDensity: 1000,   // плотность пресной воды ρ, кг/м³
  dayLengthSec: 185,    // полные игровые сутки = ~3 минуты реального времени (×1)
};

// Параметры тонкой объёмной стройки и инженерной геологии (СП 58.13330)
export const CONSTRUCTION = {
  pourRateM3PerSec: 520,
  cofferdamInstantRatio: 0.65,
  rockAggregateDiscount: 0.38,
  concretePlantDiscount: 0.22,
  concretePlantPourBoost: 1.95,
  concretePlantCost: 8200,
  pumpStationCost: 6400,
  windMeteoCost: 9800,
  highDamHeadThreshold: 10.5,
  maxUnreinforcedHead: 17.5,
  substationCost: 6800,
  navLockCost: 11500,
  fishEcoCost: 7200,
  baseGridLossNoSub: 0.16,
  gridLossWithSub: 0.03,
  damHeightTiers: [
    { id: 'micro', label: 'Точно +7м', baseAddHeight: 3.0, addHeight: 7.1 },
    { id: 'low',   label: 'Ярус +15м', baseAddHeight: 6.5, addHeight: 15.3 },
    { id: 'mid',   label: 'Ярус +26м', baseAddHeight: 11.2, addHeight: 26.3 },
    { id: 'high',  label: 'Ярус +39м', baseAddHeight: 16.5, addHeight: 38.8 },
  ],
};

// Базовые канонические координаты 8 городов и промкластеров (в системе ±384, масштабируются под 0.8 / 5 / 10 км!)
const BASE_CITY_DEFS = [
  {
    id: 'posad',
    name: 'Речной Посад',
    subtitle: 'Лесопереработка и приречная слобода',
    baseX: -158,
    baseZ: 224,
    baseRadius: 52,
    baseElev: 17.5,
    startPop: 640,
    baseDemandMW: 0.38,
    demandPerBuilding: 0.075,
    tariffBonus: 1.0,
    connectedAtStart: true,
    accent: 0x60a5fa,
    archetype: 'town',
  },
  {
    id: 'agro',
    name: 'Агродолина',
    subtitle: 'Орошаемые поля, элеваторы и теплицы',
    baseX: 222,
    baseZ: 112,
    baseRadius: 58,
    baseElev: 18.2,
    startPop: 820,
    baseDemandMW: 0.52,
    demandPerBuilding: 0.085,
    tariffBonus: 1.12,
    needsIrrigation: true,
    baseIrrTarget: { x: 168, z: 98, radius: 38 },
    connectedAtStart: false,
    accent: 0x34d399,
    archetype: 'agro',
  },
  {
    id: 'sever',
    name: 'Североборск',
    subtitle: 'Гидрометеоцентр Росгидромета и ВЭС',
    baseX: -214,
    baseZ: -218,
    baseRadius: 48,
    baseElev: 35.0,
    startPop: 590,
    baseDemandMW: 0.45,
    demandPerBuilding: 0.09,
    tariffBonus: 1.15,
    connectedAtStart: false,
    accent: 0x2dd4bf,
    archetype: 'science',
  },
  {
    id: 'kamen',
    name: 'Каменногорск',
    subtitle: 'Горно-обогатительный и машиностроительный узел',
    baseX: 208,
    baseZ: -182,
    baseRadius: 54,
    baseElev: 34.0,
    startPop: 1120,
    baseDemandMW: 0.92,
    demandPerBuilding: 0.145,
    tariffBonus: 1.24,
    connectedAtStart: false,
    accent: 0xfbbf24,
    archetype: 'industrial',
  },
  {
    id: 'svetlograd',
    name: 'Светлоград',
    subtitle: 'Мегаполис долины, небоскрёбы и Горводоканал',
    baseX: -222,
    baseZ: -16,
    baseRadius: 66,
    baseElev: 24.8,
    startPop: 2150,
    baseDemandMW: 1.38,
    demandPerBuilding: 0.19,
    tariffBonus: 1.22,
    connectedAtStart: false,
    accent: 0xa78bfa,
    archetype: 'metropolis',
  },
  {
    id: 'alumingrad',
    name: 'Алюминград',
    subtitle: 'Энергоёмкий алюминиевый электролизный завод',
    baseX: 246,
    baseZ: -38,
    baseRadius: 52,
    baseElev: 26.2,
    startPop: 1340,
    baseDemandMW: 1.65,
    demandPerBuilding: 0.22,
    tariffBonus: 1.38,
    specialContract: 'smelter',
    connectedAtStart: false,
    accent: 0xf97316,
    archetype: 'smelter',
  },
  {
    id: 'kremniy',
    name: 'Кремниевый Плёс',
    subtitle: 'Гиперскейл ЦОД ИИ и квантовый кампус',
    baseX: -124,
    baseZ: -112,
    baseRadius: 44,
    baseElev: 29.4,
    startPop: 780,
    baseDemandMW: 1.25,
    demandPerBuilding: 0.20,
    tariffBonus: 1.44,
    specialContract: 'datacenter',
    connectedAtStart: false,
    accent: 0x38bdf8,
    archetype: 'datacenter',
  },
  {
    id: 'ustport',
    name: 'Усть-Порт',
    subtitle: 'Речное пароходство, судоверфь и марина',
    baseX: 118,
    baseZ: 274,
    baseRadius: 54,
    baseElev: 12.6,
    startPop: 980,
    baseDemandMW: 0.68,
    demandPerBuilding: 0.11,
    tariffBonus: 1.18,
    specialContract: 'port',
    connectedAtStart: false,
    accent: 0x06b6d4,
    archetype: 'port',
  },
];

export const CITY_DEFS = [];

// 48 разнообразных архитектурных типов зданий, стройкомбинатов и промсооружений (от коттеджей до БСУ, ДСК, градирен и ЦОД!)
export const BUILDING_ARCHETYPES = [
  { id: 0,  name: 'Деревянный коттедж',            cat: 'res',  shape: 'gable', hMin: 4.5,  hMax: 7.0,  w: 6.2,  d: 6.8,  style: 0 },
  { id: 1,  name: 'Кирпичный дуплекс',             cat: 'res',  shape: 'gable', hMin: 6.0,  hMax: 8.8,  w: 7.5,  d: 8.2,  style: 1 },
  { id: 2,  name: 'Альпийское шале',               cat: 'res',  shape: 'gable', hMin: 5.5,  hMax: 8.2,  w: 7.8,  d: 7.4,  style: 2 },
  { id: 3,  name: 'Таунхаус с террасой',           cat: 'res',  shape: 'flat',  hMin: 7.5,  hMax: 10.5, w: 11.0, d: 7.0,  style: 3 },
  { id: 4,  name: 'Классическая 5-этажка',         cat: 'mid',  shape: 'gable', hMin: 14.0, hMax: 17.5, w: 15.0, d: 9.2,  style: 4 },
  { id: 5,  name: 'Панельный 9-этажный дом',       cat: 'mid',  shape: 'flat',  hMin: 24.0, hMax: 29.0, w: 17.5, d: 10.2, style: 5 },
  { id: 6,  name: 'Монолитный ЖК 16 этажей',       cat: 'high', shape: 'step',  hMin: 38.0, hMax: 48.0, w: 13.5, d: 13.5, style: 6 },
  { id: 7,  name: 'Стеклянная бизнес-башня',       cat: 'high', shape: 'tower', hMin: 52.0, hMax: 72.0, w: 14.5, d: 14.5, style: 7 },
  { id: 8,  name: 'Небоскрёб со шпилем',           cat: 'high', shape: 'spire', hMin: 68.0, hMax: 96.0, w: 15.5, d: 15.5, style: 8 },
  { id: 9,  name: 'Общеобразовательная школа',     cat: 'civ',  shape: 'flat',  hMin: 11.5, hMax: 14.5, w: 18.0, d: 12.5, style: 9 },
  { id: 10, name: 'Клиническая больница',          cat: 'civ',  shape: 'step',  hMin: 18.0, hMax: 24.0, w: 17.0, d: 13.0, style: 10 },
  { id: 11, name: 'Городская ратуша с башней',     cat: 'civ',  shape: 'spire', hMin: 22.0, hMax: 30.0, w: 14.0, d: 12.0, style: 11 },
  { id: 12, name: 'Арочный тепличный блок',        cat: 'agro', shape: 'arch',  hMin: 4.2,  hMax: 5.8,  w: 16.5, d: 9.5,  style: 12 },
  { id: 13, name: 'Зерновой элеватор (силос)',     cat: 'agro', shape: 'cyl',   hMin: 18.0, hMax: 26.0, w: 9.5,  d: 9.5,  style: 13 },
  { id: 14, name: 'Агроферма и амбар',             cat: 'agro', shape: 'gable', hMin: 6.8,  hMax: 9.2,  w: 14.5, d: 9.8,  style: 14 },
  { id: 15, name: 'Лесопильный комбинат',          cat: 'ind',  shape: 'gable', hMin: 7.5,  hMax: 10.5, w: 16.0, d: 11.0, style: 15 },
  { id: 16, name: 'Машиностроительный цех',        cat: 'ind',  shape: 'flat',  hMin: 10.5, hMax: 14.5, w: 19.0, d: 13.5, style: 16 },
  { id: 17, name: 'Корпус электролиза Al',         cat: 'smlt', shape: 'flat',  hMin: 11.5, hMax: 15.0, w: 24.0, d: 11.5, style: 17 },
  { id: 18, name: 'Литейно-прокатный цех',         cat: 'smlt', shape: 'step',  hMin: 15.0, hMax: 21.0, w: 18.5, d: 14.0, style: 18 },
  { id: 19, name: 'Гиперболоидная градирня',       cat: 'ind',  shape: 'cool',  hMin: 24.0, hMax: 34.0, w: 13.5, d: 13.5, style: 19 },
  { id: 20, name: 'Модуль ЦОД ИИ (Серверная)',     cat: 'dc',   shape: 'flat',  hMin: 10.0, hMax: 13.5, w: 20.0, d: 14.0, style: 20 },
  { id: 21, name: 'Квантовый лаб-корпус',          cat: 'dc',   shape: 'tower', hMin: 24.0, hMax: 36.0, w: 13.0, d: 13.0, style: 21 },
  { id: 22, name: 'Портовый терминал-склад',       cat: 'port', shape: 'arch',  hMin: 8.5,  hMax: 11.5, w: 21.0, d: 11.5, style: 22 },
  { id: 23, name: 'Курортный гранд-отель',         cat: 'port', shape: 'step',  hMin: 22.0, hMax: 34.0, w: 16.0, d: 11.5, style: 23 },
  { id: 24, name: 'Павильон яхт-клуба',            cat: 'port', shape: 'gable', hMin: 6.5,  hMax: 9.0,  w: 12.0, d: 10.0, style: 24 },
  { id: 25, name: 'Станция Горводоканала',         cat: 'util', shape: 'cyl',   hMin: 8.5,  hMax: 12.0, w: 12.5, d: 12.5, style: 25 },
  { id: 26, name: 'Насосная станция орошения',     cat: 'agro', shape: 'flat',  hMin: 6.0,  hMax: 8.5,  w: 10.5, d: 9.0,  style: 26 },
  { id: 27, name: 'Научный центр Росгидромета',    cat: 'sci',  shape: 'spire', hMin: 14.0, hMax: 20.0, w: 11.5, d: 11.5, style: 27 },
  { id: 28, name: 'Торгово-выставочный холл',      cat: 'mid',  shape: 'arch',  hMin: 10.0, hMax: 14.0, w: 18.5, d: 15.0, style: 28 },
  { id: 29, name: 'Логистический хаб',             cat: 'ind',  shape: 'flat',  hMin: 9.0,  hMax: 12.0, w: 22.0, d: 13.0, style: 29 },
  { id: 30, name: 'Спасательное депо МЧС',         cat: 'civ',  shape: 'flat',  hMin: 8.5,  hMax: 11.5, w: 13.5, d: 11.0, style: 30 },
  { id: 31, name: 'Навигационный маяк мыса',       cat: 'port', shape: 'spire', hMin: 20.0, hMax: 28.0, w: 6.8,  d: 6.8,  style: 31 },
  { id: 32, name: 'Бетоносмесительный узел БСУ',   cat: 'bld',  shape: 'cyl',   hMin: 15.0, hMax: 22.0, w: 11.0, d: 11.0, style: 32 },
  { id: 33, name: 'Домостроительный комбинат ДСК', cat: 'bld',  shape: 'flat',  hMin: 12.0, hMax: 16.5, w: 22.5, d: 14.0, style: 33 },
  { id: 34, name: 'Склад стройматериалов и ЖБИ',   cat: 'bld',  shape: 'arch',  hMin: 7.5,  hMax: 10.5, w: 19.5, d: 12.0, style: 34 },
  { id: 35, name: 'Краново-монтажное управление',  cat: 'bld',  shape: 'step',  hMin: 9.5,  hMax: 13.5, w: 15.0, d: 11.5, style: 35 },
  { id: 36, name: 'Асфальтобетонный завод АБЗ',    cat: 'bld',  shape: 'cyl',   hMin: 13.5, hMax: 18.5, w: 10.5, d: 10.5, style: 36 },
  { id: 37, name: 'Институт «Гидропроект»',        cat: 'sci',  shape: 'tower', hMin: 22.0, hMax: 32.0, w: 13.5, d: 12.5, style: 37 },
  { id: 38, name: 'Дворец культуры строителей',    cat: 'civ',  shape: 'step',  hMin: 13.5, hMax: 18.5, w: 17.5, d: 14.0, style: 38 },
  { id: 39, name: 'Водонапорная башня',            cat: 'util', shape: 'spire', hMin: 19.0, hMax: 26.0, w: 7.8,  d: 7.8,  style: 39 },
  { id: 40, name: 'Завод гидротурбин и статоров',  cat: 'ind',  shape: 'flat',  hMin: 13.0, hMax: 17.5, w: 23.0, d: 14.5, style: 40 },
  { id: 41, name: 'Кирпичный квартал «Старый посад»', cat: 'mid', shape: 'gable', hMin: 15.5, hMax: 20.5, w: 16.0, d: 10.5, style: 41 },
  { id: 42, name: 'Эко-квартал с террасами',       cat: 'mid',  shape: 'step',  hMin: 19.0, hMax: 27.0, w: 15.5, d: 12.5, style: 42 },
  { id: 43, name: 'Каскадный жилой небоскрёб',     cat: 'high', shape: 'tower', hMin: 56.0, hMax: 84.0, w: 15.0, d: 14.0, style: 43 },
  { id: 44, name: 'Речной вокзал с ротондой',      cat: 'port', shape: 'step',  hMin: 12.5, hMax: 17.0, w: 18.0, d: 12.0, style: 44 },
  { id: 45, name: 'Крытый спорткомплекс-арена',    cat: 'civ',  shape: 'arch',  hMin: 12.0, hMax: 16.5, w: 21.0, d: 16.5, style: 45 },
  { id: 46, name: 'Университет гидроэнергетики',   cat: 'sci',  shape: 'spire', hMin: 20.0, hMax: 28.5, w: 17.0, d: 13.0, style: 46 },
  { id: 47, name: 'Ремонтно-механическая база РМЗ',cat: 'bld',  shape: 'gable', hMin: 8.5,  hMax: 11.8, w: 17.5, d: 11.5, style: 47 },
];

// Базовые сценарии рельефа долины (масштабируются под 0.8 км / 5×5 км / 10×10 км)
export const VALLEY_PRESETS = {
  bystritsa: {
    id: 'bystritsa',
    name: 'Бассейн «Большая Быстрица»',
    badge: 'Рекомендуется · Полный цикл',
    areaLabel: '3 реки · 8 городов · Ледники',
    headLabel: 'Каскадный каньон + пойма',
    baseMainQ: 162,
    baseCreekQ: 54,
    baseWestQ: 36,
    mainInflowQ: 162,
    creekInflowQ: 54,
    westCreekQ: 36,
    desc: 'Гранитная теснина «Ворота Грома», ледниковые гроты истоков 3 рек, деривационное плато «Подкова», Алюминиевый завод, ЦОД ИИ и судоходное устье.',
    baseLandmarks: [
      { label: '❄ Ледниковый исток', x: -58, z: -342, dist: 148 },
      { label: '▲ Створ «Ворота Грома»', x: 12, z: -158, dist: 142 },
      { label: '◆ Деривационное плато', x: -18, z: -12, dist: 185 },
      { label: '◉ Орошение Агродолины', x: 168, z: 98, dist: 155 },
      { label: '⚓ Усть-Порт и Дельта', x: 48, z: 278, dist: 195 },
    ],
    landmarks: [],
  },
  rapids: {
    id: 'rapids',
    name: 'Каскад «Северные Пороги»',
    badge: 'Сверхнапор · ГАЭС и Фрэнсис',
    areaLabel: 'Двойной каньон · Снежные хребты',
    headLabel: 'Максимальный напор',
    baseMainQ: 176,
    baseCreekQ: 66,
    baseWestQ: 44,
    mainInflowQ: 176,
    creekInflowQ: 66,
    westCreekQ: 44,
    desc: 'Два глубоких скальных ущелья подряд с высоким перепадом высот, гротами ледников и горно-долинным ветром. Идеальна для каскада ГЭС и ГАЭС.',
    baseLandmarks: [
      { label: '❄ Ледниковый исток', x: -42, z: -342, dist: 148 },
      { label: '▲ Верхний каньон №1', x: -18, z: -248, dist: 145 },
      { label: '▲ Нижние Пороги №2', x: 22, z: -98, dist: 148 },
      { label: '◆ Промзона Алюминграда', x: 246, z: -38, dist: 175 },
      { label: '◉ Терраса Агродолины', x: 168, z: 98, dist: 155 },
    ],
    landmarks: [],
  },
  delta: {
    id: 'delta',
    name: 'Пойма «Великая Дельта»',
    badge: 'Судоходство, шлюзы и паводки',
    areaLabel: 'Широкая река · Мягкие грунты',
    headLabel: 'Большой расход Q и флот',
    baseMainQ: 205,
    baseCreekQ: 62,
    baseWestQ: 50,
    mainInflowQ: 205,
    creekInflowQ: 62,
    westCreekQ: 50,
    desc: 'Могучая судоходная река в широкой пойме: ледниковое и ключевое питание, ветровой нагон, караваны барж, порты и рыбхозы.',
    baseLandmarks: [
      { label: '❄ Исток Большой Реки', x: -32, z: -342, dist: 155 },
      { label: '▲ Главный створ и Шлюз', x: 8, z: -152, dist: 162 },
      { label: '◆ Трасса спрямления', x: -16, z: -6, dist: 190 },
      { label: '◉ Поля Агродолины', x: 168, z: 98, dist: 155 },
      { label: '⚓ Широкая дельта', x: -12, z: 268, dist: 205 },
    ],
    landmarks: [],
  },
};

// Профили качества с высокой оптимизацией под 5×5 км и 10×10 км
export const QUALITY_PROFILES = {
  low: {
    id: 'low',
    label: 'Быстрое',
    grid: 168,
    maxPixelRatio: 1.15,
    shadows: false,
    shadowEvery: 0,
    maxParticles: 1400,
    treeCount: 950,
    rockCount: 320,
    substepsCap: 6,
  },
  medium: {
    id: 'medium',
    label: 'Сбалансир.',
    grid: 208,
    maxPixelRatio: 1.6,
    shadows: true,
    shadowEvery: 3,
    maxParticles: 3000,
    treeCount: 1950,
    rockCount: 560,
    substepsCap: 8,
  },
  high: {
    id: 'high',
    label: 'Ультра',
    grid: 248,
    maxPixelRatio: 2.0,
    shadows: true,
    shadowEvery: 2,
    maxParticles: 5200,
    treeCount: 3100,
    rockCount: 840,
    substepsCap: 10,
  },
};

// Гидрологические режимы погоды и климата (с азимутом ветра, давлением, влажностью и температурой!)
export const WEATHER_MODES = {
  low_water: {
    id: 'low_water',
    label: 'Жаркая межень',
    icon: '☀',
    inflowMult: 0.76,
    rainRate: 0.0,
    rainMmPerHour: 0.0,
    baseTempC: 25.5,
    relHumidity: 0.36,
    windSpeedMs: 3.4,
    windAzimuthDeg: 215, // сухой юго-западный бриз
    pressureHPa: 1023,
    cloudCover: 0.14,
    sunIntensity: 1.18,
    fogDensity: 0.00038,
    next: { low_water: 0.25, normal: 0.55, rain: 0.20 },
  },
  normal: {
    id: 'normal',
    label: 'Нормальный сток',
    icon: '◈',
    inflowMult: 1.0,
    rainRate: 0.0,
    rainMmPerHour: 0.0,
    baseTempC: 17.5,
    relHumidity: 0.56,
    windSpeedMs: 4.8,
    windAzimuthDeg: 285, // умеренный северо-западный поток
    pressureHPa: 1014,
    cloudCover: 0.32,
    sunIntensity: 1.05,
    fogDensity: 0.00048,
    next: { low_water: 0.22, normal: 0.43, rain: 0.27, flood: 0.08 },
  },
  rain: {
    id: 'rain',
    label: 'Циклон и ливень',
    icon: '≈',
    inflowMult: 1.48,
    rainRate: 0.00016,
    rainMmPerHour: 14.5,
    baseTempC: 12.0,
    relHumidity: 0.88,
    windSpeedMs: 8.2,
    windAzimuthDeg: 325, // влажный северо-западный циклон
    pressureHPa: 998,
    cloudCover: 0.84,
    sunIntensity: 0.58,
    fogDensity: 0.00076,
    next: { normal: 0.45, rain: 0.30, flood: 0.25 },
  },
  flood: {
    id: 'flood',
    label: 'Весеннее половодье',
    icon: '◈',
    inflowMult: 2.22,
    rainRate: 0.00032,
    rainMmPerHour: 29.0,
    baseTempC: 15.0,
    relHumidity: 0.82,
    windSpeedMs: 11.2,
    windAzimuthDeg: 345, // штормовой стоковый ветер с хребтов
    pressureHPa: 991,
    cloudCover: 0.92,
    sunIntensity: 0.46,
    fogDensity: 0.00095,
    next: { rain: 0.55, normal: 0.45 },
  },
};

// 17 инженерно-строительных инструментов строительства, навигации, климата и гидроэнергетики
export const TOOLS = [
  {
    id: 'inspect',
    key: '1',
    name: 'Гидропост / Инспекция ГЭС',
    short: 'Осмотр',
    costLabel: 'бесплатно',
    desc: 'Замер глубины, скорости течения, ветрового нагона, числа Фруда, КПД турбин, режима ГАЭС и затворов.',
  },
  {
    id: 'canal_dig',
    key: '2',
    name: 'Прецизионный экскаватор канала',
    short: 'Копать канал',
    costPerM3Soil: 3.2,
    costPerM3Rock: 13.8,
    costLabel: 'грунт + щебень',
    desc: 'Тонкая прокладка судоходных, деривационных и оросительных каналов без застоя (Shift — ровный проектный уклон).',
  },
  {
    id: 'canal_liner',
    key: '3',
    name: 'Ж/Б облицовка и парапеты канала',
    short: 'Ж/Б лоток',
    costPerCell: 54,
    costLabel: '54 ₽/секция',
    desc: 'Укладка гладкого гидробетона В40 (шероховатость Маннинга n = 0.014): нулевая фильтрация и разгон течения в 2.3 раза!',
  },
  {
    id: 'earth_dam',
    key: '4',
    name: 'Грунтовая плотина / Перемычка',
    short: 'Перемычка',
    costPerM3: 4.8,
    costLabel: '-70% из отвала',
    desc: 'Аккуратная насыпная дамба из суглинка и камня для отжима русла или обвалования берегов. При переливе размывается!',
  },
  {
    id: 'concrete_dam',
    key: '5',
    name: 'Гравитационная 3D-плотина',
    short: '3D Плотина',
    costPerM3: 21.0,
    costLabel: '4 точных яруса',
    desc: 'Тонкая послойная 3D-стройка башенными кранами: шпунт → опалубка и арматура → ступенчатый монолит! Ускоряется Бетонозаводом [B].',
  },
  {
    id: 'foundation',
    key: '6',
    name: 'Цементационная завеса и Контрфорсы',
    short: 'Контрфорс',
    costPerCell: 130,
    costLabel: '130 ₽/блок',
    desc: 'Глубинная цементация скалы и наклонные 3D-контрфорсы: останавливает фильтрацию Дарси под плотиной и держит высокий напор.',
  },
  {
    id: 'spillway',
    key: '7',
    name: 'Эксплуатационный водосброс',
    short: 'Водосброс',
    costFlat: 4400,
    costLabel: '4 400 ₽',
    desc: 'Сегментный затвор с 3D-водосливным лотком и носком-трамплином: управляемый пропуск паводка с анимированной пеленой воды.',
  },
  {
    id: 'turbine_kaplan',
    key: '8',
    name: 'Русловая ГЭС Каплана (ПЛ)',
    short: 'ГЭС Каплан',
    turbineType: 'kaplan',
    costFlat: 9500,
    costLabel: '9 500 ₽',
    desc: 'Поворотно-лопастная турбина для малых и средних напоров. Машинный зал строго у подножия плотины в нижнем бьефе!',
  },
  {
    id: 'turbine_francis',
    key: '9',
    name: 'Приплотинная ГЭС Фрэнсиса (РО)',
    short: 'ГЭС Фрэнсис',
    turbineType: 'francis',
    costFlat: 23500,
    costLabel: '23 500 ₽',
    desc: 'Радиально-осевой агрегат (КПД 94%) со стальными напорными водоводами, аванкамерой и остеклённым машзалом в нижнем бьефе.',
  },
  {
    id: 'turbine_pelton',
    key: '0',
    name: 'Высоконапорная ГЭС / ГАЭС',
    short: 'ГЭС / ГАЭС',
    turbineType: 'pelton',
    costFlat: 32000,
    costLabel: '32 000 ₽ · ГАЭС',
    desc: 'Высоконапорный агрегат с режимом обратимой ГАЭС: ночью по дешёвому тарифу закачивает воду обратно в водохранилище!',
  },
  {
    id: 'concrete_plant',
    key: 'B',
    name: 'Бетонный завод БСУ и Стройбаза',
    short: 'Бетонозавод',
    costFlat: 8200,
    costLabel: '8 200 ₽ (×2 бетон)',
    desc: 'Строительный комбинат с силосами цемента и миксерами: ускоряет заливку плотин в 2 раза, снижает цену бетона на 22% и ускоряет стройку городов и трасс!',
  },
  {
    id: 'pump_station',
    key: 'G',
    name: 'Береговая насосная и Водоканал',
    short: 'Насосная',
    costFlat: 6400,
    costLabel: '6 400 ₽ (+водовод)',
    desc: 'Водозаборно-насосный узел у реки или бьефа: подаёт чистую воду в города и Агродолину, повышая доход Горводоканала и рост кварталов!',
  },
  {
    id: 'wind_meteo',
    key: 'N',
    name: 'Метео-ветрокомплекс ВЭС',
    short: 'ВЭС / Метео',
    costFlat: 9800,
    costLabel: '9 800 ₽ (ветер МВт)',
    desc: 'Высотная ветроустановка с метеорадаром на склонах и плато: вырабатывает чистые МВт от реальной физики ветра (P ~ v³) и страхует сеть в межень!',
  },
  {
    id: 'nav_lock',
    key: 'L',
    name: 'Судоходный шлюз и грузовой причал',
    short: 'Шлюз / Флот',
    costFlat: 11500,
    costLabel: '11 500 ₽ (+пошлины)',
    desc: 'Камера шлюзования с воротами: пропускает сухогрузы, танкеры и теплоходы через гидроузел и приносит стабильные фрахтовые сборы!',
  },
  {
    id: 'fish_eco',
    key: 'F',
    name: 'Рыбхоз, рыбоход и яхт-марина',
    short: 'Рыбхоз / Эко',
    costFlat: 7200,
    costLabel: '7 200 ₽ (+туризм)',
    desc: 'Понтонные форелевые садки и туристическая пристань на водохранилище: доход от аквакультуры и эко-туризма в чистой воде!',
  },
  {
    id: 'powerline',
    key: 'P',
    name: 'ОРУ 110/220 кВ и ЛЭП к городам',
    short: 'ОРУ / ЛЭП',
    costPerMeter: 13,
    costLabel: '6 800 ₽ ОРУ / ЛЭП',
    desc: 'Клик по городу — тянет магистральную ЛЭП. Клик на сухом берегу у ГЭС — строит 3D-подстанцию ОРУ (снижает потери с 16% до 3%)!',
  },
  {
    id: 'demolish',
    key: 'X',
    name: 'Демонтаж сооружения',
    short: 'Снос',
    costFlat: 250,
    costLabel: '250 ₽',
    desc: 'Демонтировать гидроагрегат, водосброс, бетонозавод, насосную, ВЭС, шлюз, рыбхоз, подстанцию или секцию плотины.',
  },
];

// Базовые инженерные характеристики турбин (масштабируются под 0.8 км / 5 км / 10 км!)
const BASE_TURBINE_SPECS = {
  kaplan: {
    id: 'kaplan',
    baseName: 'Каплана ПЛ',
    baseRatedMW: 8.0,
    baseMinHead: 2.0,
    baseOptHead: 8.0,
    baseMaxHead: 22.0,
    baseHeadSigma: 12.5,
    baseMaxArea: 5.4,
    peakEta: 0.92,
    frictionK: 0.00015,
    upkeepPerSec: 10,
    cost: 9500,
    reversible: false,
    color: 0x3b82f6,
  },
  francis: {
    id: 'francis',
    baseName: 'Фрэнсиса РО',
    baseRatedMW: 22.0,
    baseMinHead: 4.8,
    baseOptHead: 16.0,
    baseMaxHead: 46.0,
    baseHeadSigma: 16.5,
    baseMaxArea: 6.8,
    peakEta: 0.94,
    frictionK: 0.00010,
    upkeepPerSec: 22,
    cost: 23500,
    reversible: true,
    color: 0xf59e0b,
  },
  pelton: {
    id: 'pelton',
    baseName: 'ГАЭС / Пелтон',
    baseRatedMW: 36.0,
    baseMinHead: 8.0,
    baseOptHead: 24.5,
    baseMaxHead: 66.0,
    baseHeadSigma: 22.0,
    baseMaxArea: 6.0,
    peakEta: 0.93,
    frictionK: 0.00008,
    upkeepPerSec: 30,
    cost: 32000,
    reversible: true,
    color: 0x10b981,
  },
};

export const TURBINE_SPECS = {
  kaplan: {},
  francis: {},
  pelton: {},
};

export const ECONOMY = {
  startingCash: 68000,
  baseRatePerMWSec: 345,
  industrialPPAMultiplier: 1.28,
  capacityPaymentPerMWSec: 18,
  pumpedNightBuyFactor: 0.34,
  navLockTollPerSec: 95,
  municipalWaterPerKPopSec: 11.5,
  irrigationBonusPerSec: 135,
  fishFarmIncomePerSec: 88,
  ecoTourismPerMarinaSec: 46,
  aggregateSellPricePerM3: 10.5,
  carbonCreditPerMWSec: 22,
  floodProtectionBonusSec: 95,
  overSupplyExportFactor: 0.42,
  loanChunk: 30000,
  loanInterestPerSec: 0.00040,
  maxLoan: 180000,
};

export function spotTariffMultiplier(hour) {
  const h = ((hour % 24) + 24) % 24;
  if (h >= 0 && h < 6) return 0.56;
  if (h >= 6 && h < 10.5) return 1.65;
  if (h >= 10.5 && h < 17) return 1.06;
  if (h >= 17 && h < 22) return 2.38;
  return 0.80;
}

export function spotPeriodLabel(hour) {
  const h = ((hour % 24) + 24) % 24;
  if (h >= 0 && h < 6) return { label: 'Ночь ×0.56 (закачка ГАЭС)', cls: 'offpeak' };
  if (h >= 6 && h < 10.5) return { label: 'Утренний пик ×1.65', cls: 'peak' };
  if (h >= 10.5 && h < 17) return { label: 'Дневной полупик ×1.06', cls: 'mid' };
  if (h >= 17 && h < 22) return { label: 'Вечерний СУПЕР-ПИК ×2.38', cls: 'superpeak' };
  return { label: 'Спад нагрузки ×0.80', cls: 'offpeak' };
}

/**
 * Применяет выбранный масштаб бассейна (0.8×0.8 км, 5×5 км или 10×10 км)
 * ко всем физическим, геодезическим и экономическим таблицам!
 */
export function applyMapScale(scaleId = 'km5') {
  const sc = MAP_SCALES[scaleId] || MAP_SCALES.km5;
  WORLD.scaleId = sc.id;
  WORLD.size = sc.size;
  WORLD.horizScale = sc.horizScale;
  WORLD.elevScale = sc.elevScale;
  WORLD.flowScale = sc.flowScale;
  WORLD.powerScale = sc.powerScale;
  WORLD.snowLineY = sc.snowLineY;
  WORLD.minZoom = sc.minZoom;
  WORLD.maxZoom = sc.maxZoom;
  WORLD.defaultDist = sc.defaultDist;
  WORLD.brushSizes = sc.brushSizes.slice();

  // Масштабируем ярусы высоты плотины и пороги напора пропорционально вертикальному масштабу гор
  const eS = sc.elevScale;
  CONSTRUCTION.highDamHeadThreshold = +(10.5 * eS).toFixed(1);
  CONSTRUCTION.maxUnreinforcedHead = +(17.5 * eS).toFixed(1);
  for (const tier of CONSTRUCTION.damHeightTiers) {
    tier.addHeight = +(tier.baseAddHeight * eS).toFixed(1);
    tier.label = tier.id === 'micro'
      ? `Точно +${Math.round(tier.addHeight)}м`
      : `Ярус +${Math.round(tier.addHeight)}м`;
  }

  // Масштабируем ориентиры и расходы 3 сценариев долины
  for (const p of Object.values(VALLEY_PRESETS)) {
    p.mainInflowQ = Math.round(p.baseMainQ * sc.flowScale);
    p.creekInflowQ = Math.round(p.baseCreekQ * sc.flowScale);
    p.westCreekQ = Math.round(p.baseWestQ * sc.flowScale);
    p.areaLabel = `${sc.shortLabel} · 3 реки · 8 городов`;
    p.headLabel = `Сток рек: ~${p.mainInflowQ + p.creekInflowQ + p.westCreekQ} м³/с`;
    p.landmarks = p.baseLandmarks.map((lm) => ({
      label: lm.label,
      x: +(lm.x * sc.horizScale).toFixed(1),
      z: +(lm.z * sc.horizScale).toFixed(1),
      dist: Math.round(lm.dist * Math.pow(sc.horizScale, 0.78)),
    }));
  }

  // Масштабируем характеристики турбин под класс гидроузла (малая ГЭС / региональная ГЭС / мега-ГЭС)
  for (const [key, b] of Object.entries(BASE_TURBINE_SPECS)) {
    const rated = Math.round(b.baseRatedMW * sc.powerScale);
    const tObj = TURBINE_SPECS[key];
    tObj.id = b.id;
    tObj.name = `${b.baseName}-${rated}`;
    tObj.ratedMW = rated;
    tObj.minHead = +(b.baseMinHead * eS).toFixed(1);
    tObj.optHead = +(b.baseOptHead * eS).toFixed(1);
    tObj.maxHead = +(b.baseMaxHead * eS).toFixed(1);
    tObj.headSigma = +(b.baseHeadSigma * eS).toFixed(1);
    // Сечение водоводов масштабируется под расход реки, чтобы формула P = ρ·g·Q·H·η давала реальные МВт!
    tObj.maxArea = +(b.baseMaxArea * (sc.flowScale / Math.sqrt(eS))).toFixed(2);
    tObj.peakEta = b.peakEta;
    tObj.frictionK = b.frictionK / (sc.flowScale * sc.flowScale) * eS;
    tObj.upkeepPerSec = b.upkeepPerSec;
    tObj.cost = b.cost;
    tObj.reversible = b.reversible;
    tObj.color = b.color;
  }

  // Обновляем подписи слотов турбин в хотбаре
  for (const tool of TOOLS) {
    if (tool.turbineType && TURBINE_SPECS[tool.turbineType]) {
      const sp = TURBINE_SPECS[tool.turbineType];
      if (tool.turbineType === 'kaplan') tool.short = `Каплан ${sp.ratedMW}МВт`;
      else if (tool.turbineType === 'francis') tool.short = `Фрэнсис ${sp.ratedMW}МВт`;
      else tool.short = `ГАЭС ${sp.ratedMW}МВт`;
    }
  }

  // Пересчитываем координаты и спрос 8 городов бассейна
  CITY_DEFS.length = 0;
  for (const bc of BASE_CITY_DEFS) {
    const cityObj = {
      id: bc.id,
      name: bc.name,
      subtitle: bc.subtitle,
      x: +(bc.baseX * sc.horizScale).toFixed(1),
      z: +(bc.baseZ * sc.horizScale).toFixed(1),
      plateauRadius: +(bc.baseRadius * sc.horizScale).toFixed(1),
      baseElevation: +(bc.baseElev * eS).toFixed(2),
      startPop: Math.round(bc.startPop * Math.sqrt(sc.horizScale)),
      baseDemandMW: +(bc.baseDemandMW * sc.powerScale).toFixed(2),
      demandPerBuilding: +(bc.demandPerBuilding * sc.powerScale).toFixed(3),
      tariffBonus: bc.tariffBonus,
      needsIrrigation: !!bc.needsIrrigation,
      specialContract: bc.specialContract || null,
      connectedAtStart: bc.connectedAtStart,
      accent: bc.accent,
      archetype: bc.archetype,
    };
    if (bc.baseIrrTarget) {
      cityObj.irrigationTarget = {
        x: +(bc.baseIrrTarget.x * sc.horizScale).toFixed(1),
        z: +(bc.baseIrrTarget.z * sc.horizScale).toFixed(1),
        radius: +(bc.baseIrrTarget.radius * sc.horizScale).toFixed(1),
      };
    }
    CITY_DEFS.push(cityObj);
  }

  return sc;
}

// Инициализируем масштаб по умолчанию (5 × 5 км — 25 км²!)
applyMapScale('km5');

// Государственные гранты Минэнерго и Минприроды (адаптируются под масштаб мощности WORLD.powerScale)
export const MILESTONES = [
  {
    id: 'first_watt',
    title: 'Первый промышленный ток ГЭС!',
    desc: 'Постройте плотину, запустите приплотинную ГЭС в нижнем бьефе и выдайте мощность в сеть.',
    reward: 12000,
    check: (st) => st.totalMW >= 0.45 * WORLD.powerScale,
  },
  {
    id: 'reinforced_dam',
    title: 'Инженерная защита и ОРУ',
    desc: 'Укрепите плотину минимум 6 блоками контрфорсов/цементации или постройте подстанцию ОРУ.',
    reward: 14000,
    check: (st) => st.reinforcedCells >= 6 || st.substations >= 1,
  },
  {
    id: 'custom_canal',
    title: 'Собственная водная артерия',
    desc: 'Прокопайте экскаватором деривационный, судоходный или оросительный канал.',
    reward: 15000,
    check: (st) => st.excavatedNormM3 >= 500,
  },
  {
    id: 'nav_or_fish',
    title: 'Комплексный гидроузел: Флот и Биоресурсы',
    desc: 'Постройте судоходный шлюз [L] для пропуска кораблей или рыбхоз/марину [F] на водохранилище.',
    reward: 19000,
    check: (st) => st.navLocks >= 1 || st.fishFarms >= 1,
  },
  {
    id: 'irrigation_done',
    title: 'Живительная влага Агродолины',
    desc: 'Подведите воду собственным каналом к оросительному кольцу Агродолины.',
    reward: 22000,
    check: (st) => st.agroIrrigated === true,
  },
  {
    id: 'industrial_giants',
    title: 'Контракт с Алюминградом и ЦОД ИИ',
    desc: 'Подключите к энергокольцу минимум 5 городов и выдайте промышленную мощность.',
    reward: 32000,
    check: (st) => st.connectedCities >= 5 && st.totalMW >= 6.0 * WORLD.powerScale,
  },
  {
    id: 'all_cities_grid',
    title: 'Единая энергосистема всех 8 городов',
    desc: 'Объедините ЛЭП все 8 городов и промкластеров бассейна!',
    reward: 46000,
    check: (st) => st.connectedCities >= 8 && st.totalMW >= 10.0 * WORLD.powerScale,
  },
  {
    id: 'megacascade_master',
    title: 'Флагман национальной гидроэнергетики',
    desc: 'Выведите каскад ГЭС/ГАЭС на проектную пиковую мощность!',
    reward: 75000,
    check: (st) => st.totalMW >= 26.0 * WORLD.powerScale,
  },
];
