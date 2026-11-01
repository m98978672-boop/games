// Тягачи вымышленной марки AURIGA. Все характеристики — игровые, не копия реальных машин.
export const TRUCK_MODELS = [
  {
    id: 'auriga-3',
    name: 'Auriga 3 · 330',
    hp: 330,
    price: 34000,
    level: 1,
    used: true,
    tank: 380,
    consumption: 30.5,
    gears: 12,
    finalDrive: 3.08,
    topSpeed: 89,
    color: 0xb7c2c9,
    desc: 'Подержанный тягач для первых рейсов. Прощает ошибки, но быстро устаёт на подъёмах.',
  },
  {
    id: 'auriga-4',
    name: 'Auriga 4 · 380',
    hp: 380,
    price: 76000,
    level: 2,
    tank: 400,
    consumption: 29.2,
    gears: 12,
    finalDrive: 3.08,
    topSpeed: 89,
    color: 0x7fb3c8,
    desc: 'Рабочая лошадка дальнобойщика: надёжная трансмиссия и умеренный расход.',
  },
  {
    id: 'auriga-5',
    name: 'Auriga 5 · 460',
    hp: 460,
    price: 108000,
    level: 4,
    tank: 480,
    consumption: 31.0,
    gears: 12,
    finalDrive: 2.85,
    topSpeed: 89,
    color: 0xc1452f,
    desc: 'Комфортная кабина со спальником, тяга для тяжёлых грузов и автопоездов.',
  },
  {
    id: 'auriga-6',
    name: 'Auriga 6 · 540',
    hp: 540,
    price: 146000,
    level: 6,
    tank: 560,
    consumption: 32.4,
    gears: 12,
    finalDrive: 2.64,
    topSpeed: 89,
    color: 0x2f6b4f,
    desc: 'Флагман с 12-ступенчатой коробкой, ретардером и адаптивным круиз-контролем.',
  },
  {
    id: 'auriga-6x',
    name: 'Auriga 6X · 620',
    hp: 620,
    price: 189000,
    level: 9,
    tank: 620,
    consumption: 34.6,
    gears: 12,
    finalDrive: 2.47,
    topSpeed: 89,
    color: 0x2b3b63,
    desc: 'Тяжёлый флагман для негабарита и горных серпантинов. Максимальная тяга.',
  },
];

export const PAINT_COLORS = [
  { id: 'ice', name: 'Ледяной белый', hex: 0xdfe6e9 },
  { id: 'ocean', name: 'Океан', hex: 0x2f7fa8 },
  { id: 'crimson', name: 'Кармин', hex: 0xb8352c },
  { id: 'forest', name: 'Лесной', hex: 0x2f6b4f },
  { id: 'amber', name: 'Янтарь', hex: 0xd38b2f },
  { id: 'graphite', name: 'Графит', hex: 0x384048 },
  { id: 'violet', name: 'Индиго', hex: 0x4b3b75 },
];

export const UPGRADES = {
  engine: [
    { id: 0, name: 'Стандартный двигатель', power: 1.0, price: 0 },
    { id: 1, name: 'Чип-тюнинг +8%', power: 1.08, price: 4200 },
    { id: 2, name: 'Спортивная прошивка +15%', power: 1.15, price: 9600 },
  ],
  tires: [
    { id: 0, name: 'Всесезонные шины', grip: 1.0, price: 0 },
    { id: 1, name: 'Шины повышенной ходимости', grip: 1.06, price: 3200 },
    { id: 2, name: 'Премиальные шины', grip: 1.14, price: 7400 },
  ],
  retarder: [
    { id: 0, name: 'Без ретардера', strength: 0, price: 0 },
    { id: 1, name: 'Гидравлический ретардер', strength: 1, price: 5200 },
  ],
};

export const SKILLS = [
  { id: 'long', name: 'Дальние рейсы', desc: 'Открывает контракты длиннее 600 км и повышает оплату за километр.' },
  { id: 'value', name: 'Ценные грузы', desc: 'Доступ к электронике, медикаментам и другим дорогим грузам.' },
  { id: 'fragile', name: 'Хрупкие грузы', desc: 'Снижает риск повредить хрупкий груз и повышает оплату.' },
  { id: 'urgent', name: 'Срочные рейсы', desc: 'Больше срочных контрактов с надбавкой за срок.' },
  { id: 'adr', name: 'ADR · опасные грузы', desc: 'Открывает цистерны с топливом, химикатами и газом.' },
  { id: 'eco', name: 'Экономичное вождение', desc: 'Снижает расход топлива и износ двигателя.' },
];

export function levelForXp(xp) {
  // Кривая уровней: 260, 700, 1250, 1950, 2800, 3800, 4900, 6100, 7400, ...
  let level = 1;
  let need = 260;
  let total = 0;
  while (xp >= total + need) {
    total += need;
    level++;
    need = Math.round(260 * Math.pow(level, 1.4));
  }
  return { level, current: xp - total, need, total };
}

export function skillCount(profile, skillId) {
  return profile.skills?.[skillId] || 0;
}

export function maxGear(model) {
  return model.gears;
}
