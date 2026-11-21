// Конфигурация игры «Северный узел»: характеры бригады, палитры, склад, режимы.
// Никаких CDN и внешних ресурсов — только локальные файлы и движок RatCore.
window.WC = window.WC || {};

WC.CONFIG = {
  version: '1.0.0',
  title: 'Северный узел',
  seed: 20261120,
  saveKey: 'warehouse-crew-save-v1',
  tickHz: 30,
  simStep: 1 / 30,
  shiftRealSeconds: 7 * 60,     // одна смена — 7 реальных минут
  shiftHours: 8,                // но по табелю это 8 часов
  orderSpawnEvery: 12,
  maxPending: 10,
  truckEvery: 120,              // как часто подходит фура (секунды симуляции)
  firstTruckDelay: 40,

  // Камера
  camera: {
    third: { distance: 4.2, height: 3.35, lookAhead: 0.45, fov: 56 },
    follow: { height: 12.5, distance: 5.4, fov: 50 },
    top: { height: 22, fov: 42, tilt: 0.92, distance: 9 },
    // 2D-вид сверху: ортокамера, склад как чертёж
    map: { size: 15.5, near: 0.1, far: 90, height: 26 },
  },

  // Магазин смены: покупки за очки
  shop: {
    worker: { title: 'Рабочий', cost: 80, max: 8 },
    medic: { title: 'Медик', cost: 120, hint: 'лечит травмы и не даёт погибнуть' },
    watchman: { title: 'Сторож', cost: 100, hint: 'следит за правилами и техникой' },
  },

  // Три характера. traits → входы нейросети, тело → физиология.
  crew: [
    {
      id: 'marta',
      name: 'Марта Ковач',
      gender: 'ж',
      role: 'Старший кладовщик',
      focus: 'Выносливость и порядок',
      palette: {
        skin: '#d9a982',
        hair: '#43302a',
        shirt: '#2f6f63',
        vest: '#e8b45a',
        pants: '#33424c',
        boots: '#23292c',
        gloves: '#c8b48c',
        hat: '#e8b45a',
      },
      traits: { endurance: 0.84, strength: 0.56, precision: 0.8, caution: 0.72, paceTrait: 0.56, neuroticism: 0.28, recovery: 0.72, coop: 0.78 },
      body: { energy: 0.86, sleepDebt: 0.12, age: 34, massKg: 63 },
      brain: 'data/brains/marta.json',
    },
    {
      id: 'grisha',
      name: 'Гриша Волков',
      gender: 'м',
      role: 'Грузчик-силач',
      focus: 'Тяжёлые коробки, риск',
      palette: {
        skin: '#c99a72',
        hair: '#2b2118',
        shirt: '#7d3b34',
        vest: '#f0d9a7',
        pants: '#3a444d',
        boots: '#20262a',
        gloves: '#8f6a45',
        hat: '#d9534f',
      },
      traits: { endurance: 0.58, strength: 0.92, precision: 0.48, caution: 0.36, paceTrait: 0.88, neuroticism: 0.58, recovery: 0.48, coop: 0.42 },
      body: { energy: 0.92, sleepDebt: 0.3, age: 29, massKg: 92 },
      brain: 'data/brains/grisha.json',
    },
    {
      id: 'timur',
      name: 'Тимур Асланов',
      gender: 'м',
      role: 'Комплектовщик',
      focus: 'Аккуратность и взаимопомощь',
      palette: {
        skin: '#d3a077',
        hair: '#1d1a19',
        shirt: '#3a4b73',
        vest: '#9fb3c8',
        pants: '#2f3a46',
        boots: '#23292c',
        gloves: '#b9c2c9',
        hat: '#5aa9e6',
      },
      traits: { endurance: 0.66, strength: 0.63, precision: 0.88, caution: 0.66, paceTrait: 0.5, neuroticism: 0.22, recovery: 0.6, coop: 0.9 },
      body: { energy: 0.78, sleepDebt: 0.18, age: 26, massKg: 71 },
      brain: 'data/brains/timur.json',
    },
  ],

  // Подписи состояний для HUD
  stateLabels: {
    idle: 'ждёт указаний',
    toPick: 'идёт к коробке',
    toDrop: 'несёт к стеллажу',
    toRest: 'идёт на перерыв',
    rest: 'отдыхает',
    down: 'упал без сил',
    toToilet: 'идёт в туалет',
    toilet: 'в туалете',
    fromToilet: 'выходит из туалета',
    toStreet: 'идёт на улицу',
    street: 'на улице, дышит',
    toTech: 'идёт к погрузчику',
    play: 'катается на погрузчике',
    toMeet: 'уходит вдвоём',
    meet: 'уединился',
    dead: 'погиб',
  },

  orders: {
    urgentBonus: 6,
    latePenaltyPerSecond: 0.25,
  },

  // Что грузим кроме данных: веса обученных мозгов
  brains: {
    base: 'data/brain_weights.json',
    dataset: 'data/brain_dataset.json',
    log: 'data/brain_training_log.json',
  },
};
