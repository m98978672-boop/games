// Грузы, прицепы и компании-заказчики.
export const TRAILERS = {
  curtain: { name: 'Тентованный полуприцеп', short: 'Тент', length: 13.6, wheelbase: 9.2 },
  fridge: { name: 'Рефрижератор', short: 'Реф', length: 13.6, wheelbase: 9.2 },
  tank: { name: 'Цистерна', short: 'Цистерна', length: 13.2, wheelbase: 8.8 },
  flatbed: { name: 'Платформа', short: 'Платформа', length: 13.7, wheelbase: 9.3 },
  container: { name: 'Контейнеровоз', short: 'Контейнер', length: 13.6, wheelbase: 9.2 },
  log: { name: 'Лесовоз', short: 'Лесовоз', length: 14.0, wheelbase: 9.5 },
};

// [название, категория, тип прицепа, масса т (min,max), ставка €/км, уровень]
export const CARGOS = [
  ['Пакетированные продукты', 'general', 'curtain', 12, 22, 1.35, 1],
  ['Бытовая техника', 'general', 'curtain', 8, 18, 1.5, 1],
  ['Стройматериалы', 'heavy', 'flatbed', 18, 26, 1.6, 1],
  ['Пиломатериалы', 'heavy', 'log', 20, 28, 1.55, 2],
  ['Мебель', 'fragile', 'curtain', 6, 16, 1.45, 1],
  ['Овощи и фрукты', 'fridge', 'fridge', 12, 22, 1.55, 1],
  ['Мясная продукция', 'fridge', 'fridge', 10, 20, 1.75, 2],
  ['Молочные продукты', 'fridge', 'fridge', 9, 19, 1.7, 1],
  ['Медикаменты', 'fragile', 'fridge', 4, 12, 2.25, 3],
  ['Электроника', 'valuable', 'curtain', 3, 10, 2.4, 2],
  ['Стекло и зеркала', 'fragile', 'flatbed', 8, 18, 1.85, 2],
  ['Автомобильные запчасти', 'general', 'curtain', 6, 16, 1.6, 2],
  ['Стальной прокат', 'heavy', 'flatbed', 22, 28, 1.7, 2],
  ['Трубы большого диаметра', 'heavy', 'flatbed', 20, 27, 1.65, 2],
  ['Цемент', 'heavy', 'tank', 22, 28, 1.5, 1],
  ['Топливо', 'adr', 'tank', 20, 30, 2.15, 3],
  ['Химикаты', 'adr', 'tank', 16, 26, 2.35, 3],
  ['Сжиженный газ', 'adr', 'tank', 18, 27, 2.4, 4],
  ['Контейнеры с одеждой', 'general', 'container', 10, 22, 1.45, 1],
  ['Бумага в рулонах', 'heavy', 'curtain', 18, 26, 1.5, 1],
  ['Кофе и чай', 'valuable', 'curtain', 5, 14, 1.95, 2],
  ['Вино и напитки', 'fragile', 'curtain', 10, 20, 1.8, 2],
  ['Сельхозтехника', 'heavy', 'flatbed', 18, 27, 1.85, 3],
  ['Солнечные панели', 'fragile', 'flatbed', 6, 16, 1.9, 3],
  ['Спортивные товары', 'general', 'curtain', 4, 14, 1.4, 1],
  ['Шины', 'general', 'container', 12, 24, 1.4, 1],
  ['Детские игрушки', 'general', 'container', 4, 12, 1.35, 1],
  ['Мороженое', 'fridge', 'fridge', 8, 18, 2.0, 2],
  ['Живая рыба', 'adr', 'tank', 8, 16, 2.1, 3],
  ['Древесные гранулы', 'heavy', 'curtain', 20, 27, 1.45, 1],
];

export const COMPANY_PREFIX = [
  'Nord', 'Trans', 'Euro', 'Vega', 'Alpen', 'Baltic', 'Rhein', 'Adria', 'Danube', 'Iberia',
  'Scandi', 'Lombard', 'Helvet', 'Vistula', 'Carpath', 'Atlantic', 'Oder', 'Rhone', 'Tiber', 'Fjord',
];
export const COMPANY_SUFFIX = [
  'Logistik', 'Cargo', 'Trans', 'Freight', 'Spedition', 'Logistics', 'Transport', 'Lines', 'Group', 'Handel',
];
export const DEPOT_KINDS = [
  'Терминал', 'Склад', 'Логистический парк', 'Грузовой двор', 'Распределительный центр', 'Хаб',
];

export function companyName(seed) {
  const a = COMPANY_PREFIX[Math.floor(seed * 7919) % COMPANY_PREFIX.length];
  const b = COMPANY_SUFFIX[Math.floor(seed * 104729) % COMPANY_SUFFIX.length];
  return `${a} ${b}`;
}

export function depotName(seed) {
  return DEPOT_KINDS[Math.floor(seed * 65537) % DEPOT_KINDS.length];
}
