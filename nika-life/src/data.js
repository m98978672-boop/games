/* =============================================================================
   НИКА: ЖИВАЯ — общие данные мира (гардероб, локации, алиасы частей тела)
   Используются и ИИ-модулем, и симуляцией, и интерфейсом.
   ============================================================================= */
(function (root) {
  'use strict';
  const NIKA = (root.NIKA = root.NIKA || {});

  const COLORS = [
    { id: 'red',    name: 'красный',  match: ['красн', 'ал', 'бордов'], hex: '#d9575f' },
    { id: 'blue',   name: 'синий',   match: ['син', 'голуб', 'небесн'], hex: '#5b86cf' },
    { id: 'green',  name: 'зелёный', match: ['зелён', 'зелен', 'мятн'], hex: '#65a978' },
    { id: 'violet', name: 'фиолетовый', match: ['фиолет', 'сирен', 'лилов'], hex: '#9b7fd0' },
    { id: 'black',  name: 'чёрный',  match: ['чёрн', 'черн'], hex: '#3a3e48' },
    { id: 'white',  name: 'белый',   match: ['бел', 'молочн'], hex: '#ece7dc' },
    { id: 'yellow', name: 'жёлтый',  match: ['жёлт', 'желт', 'золот'], hex: '#e8b45a' },
    { id: 'pink',   name: 'розовый', match: ['розов', 'пудров'], hex: '#e79bb4' },
  ];

  /* slot: head | top | bottom | dress | outer | shoes | accessory
     Если надето платье (dress), оно заменяет верх + низ.                        */
  const ITEMS = [
    { id: 'dress',     name: 'платье',            slot: 'dress',     color: '#d9575f', price: 0,   aliases: ['платье', 'платьице', 'платьишко', 'сарафан'] },
    { id: 'pajama',    name: 'пижама',            slot: 'dress',     color: '#7f93c9', price: 0,   aliases: ['пижама', 'пижамку', 'ночнушка', 'домашний костюм'] },
    { id: 'sport',     name: 'спортивная форма',  slot: 'dress',     color: '#65a978', price: 0,   aliases: ['спортивная форма', 'спортивный костюм', 'форма для спорта', 'спортивка'] },
    { id: 'sundress',  name: 'летнее платье',     slot: 'dress',     color: '#e8b45a', price: 45,  aliases: ['летнее платье', 'сарафанчик'] },
    { id: 'tshirt',    name: 'футболка',          slot: 'top',       color: '#ece7dc', price: 0,   aliases: ['футболка', 'футболку', 'майка', 'топ'] },
    { id: 'sweater',   name: 'свитер',            slot: 'top',       color: '#9b7fd0', price: 35,  aliases: ['свитер', 'свитр', 'кофта', 'джемпер', 'пуловер'] },
    { id: 'blouse',    name: 'блузка',            slot: 'top',       color: '#e79bb4', price: 30,  aliases: ['блузка', 'блузу', 'рубашка', 'рубашку'] },
    { id: 'hoodie',    name: 'худи',              slot: 'top',       color: '#5b86cf', price: 40,  aliases: ['худи', 'толстовка', 'свитшот'] },
    { id: 'jeans',     name: 'джинсы',            slot: 'bottom',    color: '#3f5680', price: 0,   aliases: ['джинсы', 'джинсы', 'брюки', 'штаны'] },
    { id: 'skirt',     name: 'юбка',              slot: 'bottom',    color: '#b98ad0', price: 25,  aliases: ['юбка', 'юбку'] },
    { id: 'shorts',    name: 'шорты',             slot: 'bottom',    color: '#65a978', price: 20,  aliases: ['шорты'] },
    { id: 'jacket',    name: 'куртка',            slot: 'outer',     color: '#4a5b63', price: 55,  aliases: ['куртка', 'куртку', 'ветровка'] },
    { id: 'coat',      name: 'пальто',            slot: 'outer',     color: '#8a6b55', price: 70,  aliases: ['пальто', 'плащ'] },
    { id: 'robe',      name: 'халат',             slot: 'outer',     color: '#e79bb4', price: 20,  aliases: ['халат', 'халатик'] },
    { id: 'sneakers',  name: 'кроссовки',         slot: 'shoes',     color: '#ece7dc', price: 0,   aliases: ['кроссовки', 'кеды', 'обувь'] },
    { id: 'boots',     name: 'ботинки',           slot: 'shoes',     color: '#6b4a3a', price: 50,  aliases: ['ботинки', 'сапоги', 'ботинок'] },
    { id: 'slippers',  name: 'тапочки',           slot: 'shoes',     color: '#e8b45a', price: 0,   aliases: ['тапочки', 'тапки', 'домашние тапочки'] },
    { id: 'cap',       name: 'кепка',             slot: 'head',      color: '#5b86cf', price: 15,  aliases: ['кепка', 'кепку', 'шапка', 'шляпа'] },
    { id: 'headband',  name: 'ободок',            slot: 'head',      color: '#e79bb4', price: 10,  aliases: ['ободок', 'лента для волос', 'заколка'] },
    { id: 'scarf',     name: 'шарф',              slot: 'accessory', color: '#d9575f', price: 15,  aliases: ['шарф', 'шарфик'] },
    { id: 'glasses',   name: 'очки',              slot: 'accessory', color: '#3a3e48', price: 25,  aliases: ['очки'] },
    { id: 'bag',       name: 'сумка',             slot: 'accessory', color: '#8a6b55', price: 40,  aliases: ['сумка', 'сумочка', 'рюкзак'] },
  ];

  const LOCATIONS = [
    { id: 'bedroom', name: 'спальня',      x: 0.76, aliases: ['спальн', 'кроват', 'постел', 'спать'] },
    { id: 'kitchen', name: 'кухня',        x: 0.20, aliases: ['кухн', 'холодильник', 'столовая', 'плита'] },
    { id: 'desk',    name: 'рабочий стол', x: 0.47, aliases: ['рабоч', 'стол', 'ноутбук', 'офис', 'компьютер'] },
    { id: 'living',  name: 'гостиная',     x: 0.52, aliases: ['гостин', 'диван', 'телевизор', 'зал'] },
    { id: 'bath',    name: 'ванная',       x: 0.91, aliases: ['ванн', 'душ', 'зеркал', 'умывальник'] },
    { id: 'street',  name: 'улица',        x: 0.10, aliases: ['улиц', 'парк', 'прогулк', 'двор', 'магазин'] },
  ];

  const PART_ALIASES = [
    { id: 'head',   aliases: ['голов', 'шея'] },
    { id: 'face',   aliases: ['лицо', 'мимик', 'выражение лица', 'рот', 'губ'] },
    { id: 'eyes',   aliases: ['глаз', 'взгляд', 'морга'] },
    { id: 'hair',   aliases: ['волос', 'пряди', 'прическ', 'причёск'] },
    { id: 'torso',  aliases: ['корпус', 'туловищ', 'плеч', 'талия', 'спин'] },
    { id: 'armL',   aliases: ['левая рука', 'левую руку', 'левой рукой', 'левый локоть'] },
    { id: 'armR',   aliases: ['правая рука', 'правую руку', 'правой рукой', 'правый локоть'] },
    { id: 'handL',  aliases: ['левая кисть', 'левую кисть', 'левая ладонь', 'левый кулак'] },
    { id: 'handR',  aliases: ['правая кисть', 'правую кисть', 'правая ладонь', 'правый кулак'] },
    { id: 'legL',   aliases: ['левая нога', 'левую ногу', 'левой ногой', 'левое колено'] },
    { id: 'legR',   aliases: ['правая нога', 'правую ногу', 'правой ногой', 'правое колено'] },
    { id: 'skirt',  aliases: ['одежда', 'подол', 'юбка-анимация', 'ткань'] },
  ];

  const SLOT_LABELS = {
    head: 'Голова', top: 'Верх', bottom: 'Низ', dress: 'Платье / костюм',
    outer: 'Верхняя одежда', shoes: 'Обувь', accessory: 'Аксессуар',
  };

  NIKA.data = {
    COLORS: COLORS, ITEMS: ITEMS, LOCATIONS: LOCATIONS,
    PART_ALIASES: PART_ALIASES, SLOT_LABELS: SLOT_LABELS,
    findItem: function (id) { return ITEMS.find(function (i) { return i.id === id; }) || null; },
    findLocation: function (id) { return LOCATIONS.find(function (l) { return l.id === id; }) || null; },
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
