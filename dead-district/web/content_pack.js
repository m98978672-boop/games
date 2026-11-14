(function (global) {
  'use strict';

  var DD = global.DD = global.DD || {};
  var PALETTE = (global.DD_DATA && global.DD_DATA.palette && global.DD_DATA.palette.colors) || [
    '#cea19d', '#9e6363', '#71353f', '#4f1b30', '#380e27',
    '#c9cb9f', '#a99a73', '#805947', '#623333', '#471f1f',
    '#95bf91', '#679a73', '#41745a', '#20494b', '#0f2935',
    '#96a5bc', '#6f779e', '#514a78', '#402c56', '#351740',
    '#b29cc3', '#a278ad', '#8b5084', '#693054', '#5a2033',
    '#b7c0c7', '#8c929e', '#5c6174', '#403e52', '#2d2738',
    '#ffffff', '#000000'
  ];

  function hash32(a, b, c) {
    var h = (Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263) + Math.imul(c | 0, 1442695041)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177) | 0;
    return (h ^ (h >>> 16)) >>> 0;
  }

  // ---------- КАТАЛОГ ИЗ 10 000 ПРОЦЕДУРНЫХ ТЕКСТУР, МОДЕЛЕК И 3D МЕШЕЙ ----------
  // 4 000 текстур (0..3999) + 3 000 моделек (4000..6999) + 3 000 3D мешей (7000..9999) = 10 000
  var TEX_FAMILIES = [
    { id: 'brick', name: 'Кирпичная кладка', base: 2, hi: 1, seam: 26, style: 'brick', arch: ['Красный кирпич', 'Обожжённая стена', 'Сырой подвал', 'Потрескавшаяся стена', 'Проём фасада', 'Дымоходная кладка', 'Заводской цех', 'Облупленный торец', 'Угловой пилон', 'Гаражная стена'] },
    { id: 'wood_floor', name: 'Деревянный пол', base: 6, hi: 5, seam: 8, style: 'planks', arch: ['Дубовый паркет', 'Сосновая доска', 'Половица чердака', 'Гнилой настил', 'Скрипучий пол', 'Следы сапог', 'Палуба веранды', 'Старый ламинат', 'Складской поддон', 'Настил сарая'] },
    { id: 'asphalt', name: 'Дорожный асфальт', base: 28, hi: 26, seam: 29, style: 'asphalt', arch: ['Трасса с разметкой', 'Разбитая дорога', 'Перекрёсток', 'Парковка ТЦ', 'Следы торможения', 'Выбоина с лужей', 'Масляное пятно', 'Въезд в квартал', 'Пешеходный переход', 'Обочина шоссе'] },
    { id: 'grass', name: 'Почва и трава', base: 12, hi: 10, seam: 13, style: 'grass', arch: ['Луг пригорода', 'Дикая осока', 'Вытоптанный газон', 'Заросший пустырь', 'Мох у болота', 'Клеверная поляна', 'Пожухлая степь', 'Лесная опушка', 'Сырой берег', 'Заросший двор'] },
    { id: 'dirt', name: 'Грунт и грязь', base: 7, hi: 6, seam: 9, style: 'speckle', arch: ['Просёлок', 'Сырая глина', 'Гравийная насыпь', 'Танковая колея', 'Рыхлый суглинок', 'Пожарище', 'Затоптанная тропа', 'Карьерный песок', 'Грязь у фермы', 'Сырая земля'] },
    { id: 'clinic', name: 'Кафель и клиника', base: 25, hi: 30, seam: 26, style: 'grid', arch: ['Операционная', 'Коридор больницы', 'Морг', 'Аптечный зал', 'Санузел', 'Приёмный покой', 'Лаборатория', 'Треснувшая плитка', 'Стерильный бокс', 'Душевая блока'] },
    { id: 'concrete', name: 'Бетон и склады', base: 27, hi: 26, seam: 29, style: 'panel', arch: ['Плита перекрытия', 'Складская стяжка', 'Бункерная стена', 'Опора моста', 'Ангарный пол', 'Бомбоубежище', 'Разгрузочная рампа', 'Заводской фундамент', 'Монолит КПП', 'Сырой тоннель'] },
    { id: 'water', name: 'Вода и водоёмы', base: 13, hi: 15, seam: 14, style: 'waves', arch: ['Речная гладь', 'Застоявшаяся лужа', 'Мазутная вода', 'Ледяная кромка', 'Сточная канава', 'Болотная топь', 'Дождевой разлив', 'Пруд парка', 'Затопленный подвал', 'Муть у берега'] },
    { id: 'wood_wall', name: 'Брус и заслоны', base: 7, hi: 6, seam: 31, style: 'boards', arch: ['Бревенчатый сруб', 'Вагонка дачи', 'Заколоченное окно', 'Дощатый забор', 'Щитовая перегородка', 'Обгоревший брус', 'Сарайная обшивка', 'Штабеля досок', 'Опалубка', 'Укреплённый ставень'] },
    { id: 'plaster', name: 'Штукатурка и обои', base: 0, hi: 5, seam: 1, style: 'plaster', arch: ['Квартира жилая', 'Облезлые обои', 'Сырой потолок', 'Стеклохолст', 'Старая побелка', 'Полосы от дождя', 'Офисная перегородка', 'Кухонный фартук', 'Подъездный валик', 'Трещины усадки'] },
    { id: 'metal', name: 'Лист и профнастил', base: 27, hi: 25, seam: 28, style: 'corrugated', arch: ['Ржавая крыша', 'Контейнер морской', 'Гаражные ворота', 'Бронелист КПП', 'Гофрированный забор', 'Клёпаная обшивка', 'Оцинкованный скат', 'Железная дверь', 'Бак цистерны', 'Оплавленный лист'] },
    { id: 'blood', name: 'Следы боя и кровь', base: 28, hi: 2, seam: 1, style: 'splatter', arch: ['Лужа крови', 'След волочения', 'Отпечатки ладоней', 'Брызги у стены', 'Засохшая корка', 'След ботинок', 'Пятно от укуса', 'Потёки на плитке', 'След у двери', 'Кровавый порог'] },
    { id: 'bark', name: 'Кора и древесина', base: 9, hi: 7, seam: 31, style: 'bark', arch: ['Ствол дуба', 'Сосновая кора', 'Мшистая берёза', 'Срез пня', 'Горелый ствол', 'Сухостой', 'Ветвистая крона', 'Корневище', 'Поленница', 'Гнилой валежник'] },
    { id: 'snow', name: 'Снег и наледь', base: 25, hi: 30, seam: 15, style: 'snow', arch: ['Свежий наст', 'Сугроб у обочины', 'Слякоть с грязью', 'Протектор шины', 'Обледенение', 'Корка изморози', 'Заметённый двор', 'Следы волков', 'Талая лужа', 'Морозный узор'] },
    { id: 'roof', name: 'Кровля и шифер', base: 28, hi: 27, seam: 29, style: 'shingle', arch: ['Волновой шифер', 'Битумная черепица', 'Рубероид', 'Пробитая крыша', 'Мшистая черепица', 'Жестяной конёк', 'Металлочерепица', 'Смоляная заливка', 'Козырёк подъезда', 'Навес остановки'] },
    { id: 'tarp', name: 'Брезент и ткань', base: 12, hi: 11, seam: 13, style: 'weave', arch: ['Армейский брезент', 'Камуфляж леса', 'Маскировочная сеть', 'Палатка медиков', 'Укрывной тент', 'Мешковина', 'Прорезиненный чехол', 'Спальный мешок', 'Кевларовая вставка', 'Фланелевый плед'] },
    { id: 'glass', name: 'Стекло и витрины', base: 15, hi: 30, seam: 14, style: 'glass', arch: ['Целая витрина', 'Треснувшее стекло', 'Заиндевелое окно', 'Армированное стекло', 'Тонировка банка', 'Выбитая рама', 'Зеркало пыльное', 'Автостекло', 'Стеклопакет', 'Витраж церкви'] },
    { id: 'farm', name: 'Пашня и грядки', base: 8, hi: 7, seam: 9, style: 'furrow', arch: ['Вскопанная грядка', 'Политая земля', 'Борозда под семена', 'Всходы томата', 'Грядка картофеля', 'Удобренный чернозём', 'Пересохшая корка', 'Мульча соломой', 'Парниковый грунт', 'Вымочка'] },
    { id: 'foliage', name: 'Листва и крона', base: 12, hi: 10, seam: 13, style: 'leaves', arch: ['Густая крона дуба', 'Хвоя ели', 'Куст орешника', 'Осенний клён', 'Дикий виноград', 'Живая изгородь', 'Молодой сосняк', 'Тёрн колючий', 'Облезлые ветки', 'Подлесок'] },
    { id: 'cobble', name: 'Тротуар и брусчатка', base: 26, hi: 25, seam: 28, style: 'cobble', arch: ['Плитка 30×30', 'Площадь у мэрии', 'Старая брусчатка', 'Треснутый бордюр', 'Спуск к метро', 'Каменная отмостка', 'Пешеходная аллея', 'Выбитый булыжник', 'Площадка АЗС', 'Дворовый проезд'] }
  ];

  var MODEL_FAMILIES = [
    { id: 'survivor', name: 'Выживший (персонаж)', cat: 'human', arch: ['Куртка джинсовая', 'Тёплая парка', 'Спецовка рабочего', 'Плащ дождевик', 'Бронежилет полиции', 'Толстовка с капюшоном', 'Камуфляж охотника', 'Медицинский халат', 'Флисовая кофта', 'Кожаная куртка'] },
    { id: 'walker', name: 'Зомби-ходок', cat: 'zombie', arch: ['Обыватель в рубашке', 'Офисный клерк', 'Работяга в каске', 'Школьная куртка', 'Порванный свитер', 'Старик в пальто', 'Охранник супермаркета', 'Посетитель клиники', 'Дальнобойщик', 'Обугленный ходок'] },
    { id: 'runner', name: 'Зомби-бегун', cat: 'zombie', arch: ['Спринтер в трико', 'Полицейский бегун', 'Почтальон', 'Турист с лямками', 'Футболка с кровью', 'Бегун в кроссовках', 'Студент-скейтер', 'Быстрый заражённый', 'Повар ресторана', 'Механик в масле'] },
    { id: 'heavy_z', name: 'Громила и ползун', cat: 'zombie_heavy', arch: ['Громила ОМОН', 'Строитель-гигант', 'Ползун без ног', 'Больной из морга', 'Пожарный в робе', 'Изуродованный ползун', 'Грузчик порта', 'Боксёр в зале', 'Заражённый токсичный', 'Раздутый труп'] },
    { id: 'npc', name: 'NPC и фракции', cat: 'human', arch: ['Полевой медик', 'Оружейник базы', 'Фермер с фермы', 'Рейдер-мародёр', 'Патрульный шериф', 'Торговец каравана', 'Следопыт леса', 'Автомеханик СТО', 'Инженер радио', 'Лидер общины'] },
    { id: 'melee', name: 'Холодное оружие', cat: 'melee', arch: ['Бита бейсбольная', 'Монтировка стальная', 'Пожарный топор', 'Охотничий нож', 'Мачете садовое', 'Молоток плотника', 'Трубный ключ', 'Топор-колун', 'Катана сувенирная', 'Кирка горная'] },
    { id: 'firearm', name: 'Огнестрельное оружие', cat: 'firearm', arch: ['Пистолет 9 мм', 'Кольт .45 калибр', 'Дробовик помповый', 'Штурмовая винтовка', 'Карабин охотничий', 'Пистолет-пулемёт', 'Снайперская винтовка', 'Револьвер шерифа', 'Обрез двустволки', 'Тактический карабин'] },
    { id: 'ammo', name: 'Патроны и обоймы', cat: 'ammo', arch: ['Пачка 9×19 мм', 'Коробка .45 ACP', 'Патроны 12 калибр', 'Цинк 5.56 НАТО', 'Обойма 7.62×39', 'Магазин пистолетный', 'Картечь охотничья', 'Барабанный магазин', 'Пачка дроби', 'Магазин винтовки'] },
    { id: 'med', name: 'Медицина и лечение', cat: 'med', arch: ['Стерильный бинт', 'Жгут кровоостанавливающий', 'Антибиотик курс', 'Антисептик флакон', 'Обезболивающее', 'Игла и нить шва', 'Полевая аптечка', 'Шприц с адреналином', 'Шина на ногу', 'Спиртовые салфетки'] },
    { id: 'food', name: 'Продукты и вода', cat: 'food', arch: ['Консервы фасоли', 'Тушёнка говяжья', 'Бутыль чистой воды', 'Яблоко садовое', 'Хлеб ржаной', 'Свежая морковь', 'Кочан капусты', 'Сухой паёк ИРП', 'Термос кофе', 'Вяленая говядина'] },
    { id: 'tool', name: 'Инструменты и свет', cat: 'tool', arch: ['Фонарь тактический', 'Ножовка по дереву', 'Пассатижи', 'Паяльник', 'Отвёртка крестовая', 'Рация портативная', 'Компас туриста', 'Зажигалка бензиновая', 'Напильник плоский', 'Лопата сапёрная'] },
    { id: 'auto', name: 'Автозапчасти и ГСМ', cat: 'auto', arch: ['Канистра бензина 20 л', 'Аккумулятор 12В', 'Свеча зажигания', 'Шина дорожная', 'Масляный фильтр', 'Трос буксировочный', 'Насос ножной', 'Ремкомплект кузова', 'Домкрат ромбовый', 'Ремень генератора'] },
    { id: 'cloth', name: 'Одежда и броня', cat: 'cloth', arch: ['Каска защитная', 'Кевларовый жилет', 'Берцы кожаные', 'Кожаные перчатки', 'Шапка вязаная', 'Джинсы плотные', 'Балаклава тёплая', 'Куртка пожарного', 'Разгрузка тактическая', 'Наколенники'] },
    { id: 'bag', name: 'Рюкзаки и ящики', cat: 'bag', arch: ['Рюкзак школьный', 'Рюкзак армейский', 'Баул туристический', 'Медицинский кейс', 'Ящик с патронами', 'Поясная сумка', 'Пластиковый контейнер', 'Оружейный кейс', 'Вещмешок', 'Сейф-копилка'] },
    { id: 'seed', name: 'Семена и трофеи', cat: 'seed', arch: ['Семена томата', 'Клубни картофеля', 'Семена моркови', 'Семена капусты', 'Семена редиса', 'Усы клубники', 'Связанный пучок трав', 'Карта района', 'Жетоны выжившего', 'Дневник доктора'] }
  ];

  var MESH_FAMILIES = [
    { id: 'sedan', name: 'Легковой седан', kind: 'car', arch: ['Седан городской', 'Такси жёлтое', 'Ржавый седан', 'Разбитый у столба', 'Купе спортивное', 'Семейный универсал', 'Хэтчбек старый', 'Служебный седан', 'Обугленный корпус', 'Брошенный на обочине'] },
    { id: 'police', name: 'Спецтранспорт полиции', kind: 'police', arch: ['Патрульная машина', 'Крузер шерифа', 'Фургон спецназа', 'Охранный пикап', 'Машина ДПС', 'Конвойный бус', 'Криминалистика', 'Штабной джип', 'Разбитый патруль', 'Бронированный внедорожник'] },
    { id: 'pickup', name: 'Пикап и внедорожник', kind: 'pickup', arch: ['Пикап фермера', 'Внедорожник 4×4', 'Пикап с тентом', 'Лесной джип', 'Рейдерский пикап', 'Тяжёлый рамник', 'Служба дорог', 'Снегоочиститель', 'Охотничий УАЗ', 'Пикап с бочками'] },
    { id: 'van', name: 'Фургоны и скорая', kind: 'van', arch: ['Карета скорой помощи', 'Почтовый фургон', 'Хлебовозка', 'Рефрижератор', 'Мобильная клиника', 'Инкассаторский бус', 'Телевизионный фургон', 'Аварийная газовая', 'Микроавтобус', 'Фургон ремонта'] },
    { id: 'truck', name: 'Грузовики и автобусы', kind: 'truck', arch: ['Армейский грузовик', 'Школьный автобус', 'Лесовоз длинный', 'Бензовоз 3D', 'Мусоровоз', 'Самосвал', 'Городской автобус', 'Пожарная лестница', 'Фура с прицепом', 'Тягач эвакуатор'] },
    { id: 'oak', name: 'Деревья дуб', kind: 'oak', arch: ['Раскидистый дуб', 'Осенний ясень', 'Старый вяз', 'Клён парковый', 'Горелый ствол', 'Сухое дерево', 'Липа дворововая', 'Яблоня дикая', 'Ветровальный дуб', 'Мощный ствол'] },
    { id: 'pine', name: 'Хвойные деревья', kind: 'pine', arch: ['Высокая ель', 'Корабельная сосна', 'Заснеженная пихта', 'Лиственница', 'Молодая ёлка', 'Кедр таёжный', 'Сломанная сосна', 'Хвойная группа', 'Болотная сосна', 'Подлесок хвойный'] },
    { id: 'barricade', name: 'Укрепления и баррикады', kind: 'barricade', arch: ['Мешки с песком', 'Ежи противотанковые', 'Щиты из досок', 'Колючая проволока', 'Бетонный блок ФБС', 'Заслон из шин', 'Шлагбаум КПП', 'Башенка дозора', 'Рогатка шипастая', 'Оконная решётка'] },
    { id: 'campfire', name: 'Костры и очаги', kind: 'campfire', arch: ['Полевой костёр', 'Бочка с огнём', 'Каменный очаг', 'Мангал дворовый', 'Печь-буржуйка', 'Костровище леса', 'Жаровня на ножках', 'Коптильня', 'Сигнальный факел', 'Тренога с котлом'] },
    { id: 'station', name: 'Станки и генераторы', kind: 'station', arch: ['Дизель-генератор', 'Верстак столярный', 'Токарный станок', 'Солнечная панель', 'Станция зарядки', 'Сварочный аппарат', 'Медицинский стол', 'Радиоузел', 'Компрессор СТО', 'Пресс для патронов'] },
    { id: 'furniture', name: 'Мебель и интерьер', kind: 'furniture', arch: ['Деревянная кровать', 'Больничная койка', 'Сейф стальной', 'Платяной шкаф', 'Обеденный стол', 'Стеллаж склада', 'Холодильник', 'Плита кухонная', 'Диван гостиной', 'Письменный стол'] },
    { id: 'street', name: 'Уличные объекты', kind: 'street', arch: ['Уличный фонарь', 'Пожарный гидрант', 'Мусорный бак', 'Телефонная будка', 'Почтовый ящик', 'Лавочка парка', 'Остановка автобуса', 'Светофор 3D', 'Бензоколонка АЗС', 'Дорожный знак'] },
    { id: 'crate', name: 'Ящики и бочки', kind: 'crate', arch: ['Армейский ящик', 'Бочка топливная 200л', 'Пластиковый бокс', 'Поддон строительный', 'Медконтейнер', 'Сундук деревянный', 'Канистра на стойке', 'Сейф-ящик оружейный', 'Тара магазина', 'Бак для воды'] },
    { id: 'wpn3d', name: '3D модели оружия', kind: 'wpn3d', arch: ['Модель винтовки', 'Модель дробовика', 'Модель пистолета', 'Модель топора', 'Модель биты', 'Модель монтировки', 'Модель мачете', 'Ящик патронов 3D', 'Прицел оптический', 'Глушитель 3D'] },
    { id: 'struct', name: 'Малые постройки', kind: 'struct', arch: ['Будка КПП', 'Сарай дачный', 'Торговый киоск', 'Вышка наблюдателя', 'Теплица малая', 'Гаражный бокс', 'Блокпост модульный', 'Навес для дров', 'Колодец с воротом', 'Трансформатор'] }
  ];

  var VARIANT_TAGS = [
    'стандартный', 'потёртый', 'ржавый', 'запылённый', 'дождливый',
    'обгорелый', 'укреплённый', 'мшистый', 'заснеженный', 'кровавый',
    'военный', 'гражданский', 'полевой', 'заводской', 'клинический',
    'аварийный', 'ночной', 'выцветший', 'тактический', 'ветхий'
  ];

  var ITEMS = null;

  function buildCatalogIndex() {
    if (ITEMS) return ITEMS;
    ITEMS = new Array(10000);
    var idx = 0;

    // 0..3999 — 4 000 Текстур
    for (var f = 0; f < TEX_FAMILIES.length; f++) {
      var fam = TEX_FAMILIES[f];
      for (var a = 0; a < 10; a++) {
        for (var v = 0; v < 20; v++) {
          var vTag = VARIANT_TAGS[v];
          ITEMS[idx] = {
            index: idx,
            code: 'TEX-' + String(idx + 1).padStart(4, '0'),
            kind: 'texture',
            kindLabel: 'Текстура',
            familyId: fam.id,
            family: fam.name,
            archetype: fam.arch[a],
            variantIdx: v,
            archIdx: a,
            famIdx: f,
            name: fam.arch[a] + ' (' + vTag + ')',
            specs: '32×32 px · Палитра SH-32'
          };
          idx++;
        }
      }
    }

    // 4000..6999 — 3 000 Моделек (спрайтов)
    for (var mf = 0; mf < MODEL_FAMILIES.length; mf++) {
      var mfam = MODEL_FAMILIES[mf];
      for (var ma = 0; ma < 10; ma++) {
        for (var mv = 0; mv < 20; mv++) {
          var mvTag = VARIANT_TAGS[mv];
          ITEMS[idx] = {
            index: idx,
            code: 'MOD-' + String(idx - 3999).padStart(4, '0'),
            kind: 'model',
            kindLabel: 'Моделька 2D',
            familyId: mfam.id,
            family: mfam.name,
            archetype: mfam.arch[ma],
            variantIdx: mv,
            archIdx: ma,
            famIdx: mf,
            name: mfam.arch[ma] + ' (' + mvTag + ')',
            specs: '32×32 px · процедурный эскиз'
          };
          idx++;
        }
      }
    }

    // 7000..9999 — 3 000 3D мешей
    for (var gf = 0; gf < MESH_FAMILIES.length; gf++) {
      var gfam = MESH_FAMILIES[gf];
      for (var ga = 0; ga < 10; ga++) {
        for (var gv = 0; gv < 20; gv++) {
          var gvTag = VARIANT_TAGS[gv];
          ITEMS[idx] = {
            index: idx,
            code: 'MESH-' + String(idx - 6999).padStart(4, '0'),
            kind: 'mesh',
            kindLabel: '3D Меш',
            familyId: gfam.id,
            family: gfam.name,
            archetype: gfam.arch[ga],
            variantIdx: gv,
            archIdx: ga,
            famIdx: gf,
            name: gfam.arch[ga] + ' (' + gvTag + ')',
            specs: 'Процедурный 3D-эскиз'
          };
          idx++;
        }
      }
    }
    return ITEMS;
  }

  // ---------- 1. РЕНДЕР ТЕКСТУРЫ 32×32 НА CANVAS ----------
  function renderTexture32(ctx, item, outSize) {
    var fam = TEX_FAMILIES[item.famIdx] || TEX_FAMILIES[0];
    var v = item.variantIdx;
    var a = item.archIdx;
    var off = createScratch(32, 32);
    if (!off) return;
    var octx = off.getContext('2d');
    var shift = (v % 3 === 1) ? 1 : (v % 3 === 2 ? -1 : 0);
    var baseCol = PALETTE[(fam.base + shift + 32) % 30];
    var hiCol = PALETTE[(fam.hi + (a % 2) + 32) % 30];
    var seamCol = PALETTE[fam.seam];
    if (v === 8) hiCol = PALETTE[25]; // заснеженный оттенок
    if (v === 9) hiCol = PALETTE[1];  // кровавый след
    if (v === 2) seamCol = PALETTE[8]; // ржавый шов

    octx.fillStyle = baseCol;
    octx.fillRect(0, 0, 32, 32);

    var style = fam.style;
    if (style === 'brick') {
      for (var row = 0; row < 4; row++) {
        octx.fillStyle = seamCol;
        octx.fillRect(0, row * 8, 32, 1);
        var ox = (row % 2) ? 8 : 0;
        for (var bx = ox; bx < 32; bx += 16) {
          octx.fillStyle = seamCol;
          octx.fillRect(bx, row * 8, 1, 8);
          octx.fillStyle = hiCol;
          octx.fillRect((bx + 2) % 31, row * 8 + 2, 5, 2);
        }
      }
    } else if (style === 'planks' || style === 'boards') {
      var step = style === 'boards' ? 6 : 8;
      for (var py = 0; py < 32; py += step) {
        octx.fillStyle = seamCol;
        octx.fillRect(0, py, 32, 1);
        octx.fillStyle = hiCol;
        octx.fillRect(0, py + 1, 32, 1);
        var joint = (hash32(py, a, v) % 24) + 4;
        octx.fillStyle = seamCol;
        octx.fillRect(joint, py, 1, step);
      }
    } else if (style === 'asphalt' || style === 'speckle') {
      for (var k = 0; k < 64; k++) {
        var hx = hash32(k, a, v) % 32;
        var hy = hash32(v, k, a) % 32;
        octx.fillStyle = (k % 3 === 0) ? seamCol : hiCol;
        octx.fillRect(hx, hy, 1, 1);
      }
      if (style === 'asphalt' && a % 2 === 0) {
        octx.fillStyle = PALETTE[5];
        octx.fillRect(14, 3, 4, 10);
        octx.fillRect(14, 19, 4, 9);
      }
    } else if (style === 'grass' || style === 'leaves') {
      for (var g = 0; g < 46; g++) {
        var gx = hash32(g, v, 11) % 30;
        var gy = 2 + (hash32(g, a, 23) % 28);
        octx.fillStyle = g % 4 === 0 ? seamCol : hiCol;
        octx.fillRect(gx, gy, 1, 2);
        if (g % 5 === 0) octx.fillRect(gx + 1, gy - 1, 1, 2);
      }
    } else if (style === 'grid' || style === 'cobble' || style === 'panel') {
      var cell = style === 'grid' ? 8 : 16;
      for (var gy2 = 0; gy2 < 32; gy2 += cell) {
        for (var gx2 = 0; gx2 < 32; gx2 += cell) {
          octx.fillStyle = ((gx2 / cell + gy2 / cell + a) % 2 === 0) ? hiCol : baseCol;
          octx.fillRect(gx2, gy2, cell - 1, cell - 1);
          octx.fillStyle = seamCol;
          octx.fillRect(gx2 + cell - 1, gy2, 1, cell);
          octx.fillRect(gx2, gy2 + cell - 1, cell, 1);
        }
      }
    } else if (style === 'waves' || style === 'furrow' || style === 'corrugated') {
      for (var wy = 2; wy < 32; wy += 4) {
        octx.fillStyle = seamCol;
        octx.fillRect(0, wy, 32, 1);
        octx.fillStyle = hiCol;
        octx.fillRect((wy + v) % 12, wy + 1, 10, 1);
      }
    } else if (style === 'splatter') {
      for (var sp = 0; sp < 14; sp++) {
        var sx = 4 + (hash32(sp, a, v) % 22);
        var sy = 4 + (hash32(v, sp, a) % 22);
        var sz = 2 + (hash32(sp, v, 7) % 5);
        octx.fillStyle = sp % 2 === 0 ? PALETTE[2] : PALETTE[1];
        octx.fillRect(sx, sy, sz, sz);
      }
    } else {
      for (var px = 0; px < 40; px++) {
        var rx = hash32(px, a, v) % 30;
        var ry = hash32(v, px, a) % 30;
        octx.fillStyle = px % 2 === 0 ? hiCol : seamCol;
        octx.fillRect(rx, ry, 2, 2);
      }
    }

    // Дефекты варианта: ржавчина, кровь или иней поверх тайла
    if (v === 9 || v === 14) {
      octx.fillStyle = PALETTE[2];
      octx.fillRect(8 + (a % 10), 10 + (a % 7), 5, 4);
      octx.fillStyle = PALETTE[1];
      octx.fillRect(10 + (a % 10), 12 + (a % 7), 3, 2);
    } else if (v === 8) {
      octx.fillStyle = PALETTE[30];
      octx.fillRect(2, 2, 7, 3);
      octx.fillRect(18, 22, 8, 4);
    } else if (v === 5) {
      octx.fillStyle = PALETTE[31];
      octx.fillRect(4, 5, 6, 4);
      octx.fillRect(20, 18, 5, 5);
    }

    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, outSize, outSize);
    ctx.drawImage(off, 0, 0, 32, 32, 0, 0, outSize, outSize);
  }

  // ---------- 2. РЕНДЕР МОДЕЛЬКИ / СПРАЙТА 32×32 С 1px ОБВОДКОЙ ----------
  function addPixelOutline(octx, w, h) {
    var img = octx.getImageData(0, 0, w, h);
    var d = img.data;
    var toMark = [];
    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        var idx = (y * w + x) * 4;
        if (d[idx + 3] !== 0) continue;
        var hasNb =
          (x > 0 && d[(y * w + (x - 1)) * 4 + 3] === 255) ||
          (x < w - 1 && d[(y * w + (x + 1)) * 4 + 3] === 255) ||
          (y > 0 && d[((y - 1) * w + x) * 4 + 3] === 255) ||
          (y < h - 1 && d[((y + 1) * w + x) * 4 + 3] === 255);
        if (hasNb) toMark.push(idx);
      }
    }
    for (var i = 0; i < toMark.length; i++) {
      var p = toMark[i];
      d[p] = 0; d[p + 1] = 0; d[p + 2] = 0; d[p + 3] = 255;
    }
    octx.putImageData(img, 0, 0);
  }

  function renderModel32(ctx, item, outSize, direction) {
    var fam = MODEL_FAMILIES[item.famIdx] || MODEL_FAMILIES[0];
    var a = item.archIdx;
    var v = item.variantIdx;
    var off = createScratch(32, 32);
    if (!off) return;
    var octx = off.getContext('2d');
    // Scratch canvas общий для всех карточек: каждый новый рисунок начинается с чистого листа.
    octx.clearRect(0, 0, 32, 32);
    var cat = fam.cat;
    var c1 = PALETTE[(hash32(item.famIdx, a, v) % 28)];
    var c2 = PALETTE[(hash32(v, a, item.famIdx + 9) % 28)];
    var accent = PALETTE[(v === 9 ? 1 : (v === 10 ? 12 : 5))];

    if (cat === 'human' || cat === 'zombie' || cat === 'zombie_heavy') {
      var dir = Math.max(0, Math.min(3, direction | 0));
      var isZ = cat !== 'human';
      var isHeavy = cat === 'zombie_heavy';
      var side = dir >= 2;
      var bw = isHeavy ? (side ? 10 : 14) : (side ? 7 : 10);
      var skin = isZ ? PALETTE[11] : PALETTE[0];
      // Одежда не должна сливаться с кожей; у первого персонажа
      // джинсовая куртка действительно синяя, а не телесный прямоугольник.
      var shirts = [16, 12, 27, 13, 28, 18, 12, 25, 17, 9];
      var shirt = PALETTE[shirts[a % shirts.length]];
      var pants = PALETTE[isZ ? 28 : [28, 27, 9, 14][v % 4]];
      octx.fillStyle = pants;
      if (side) { octx.fillRect(12, 20, 4, 8); octx.fillRect(17, 20, 4, 7); }
      else { octx.fillRect(12, 20, 4, 8); octx.fillRect(17, 20, 4, 8); }
      octx.fillStyle = shirt; octx.fillRect(16 - Math.floor(bw / 2), 12, bw, 9);
      if (dir === 1) {
        octx.fillStyle = accent; octx.fillRect(13, 14, 6, 6); // спина / лямки
      } else if (side) {
        octx.fillStyle = accent; octx.fillRect(dir === 2 ? 18 : 11, 13, 3, 7);
      }
      // Рукава цвета одежды, кисти отдельно от туловища.
      octx.fillStyle = shirt;
      if (side) {
        octx.fillRect(dir === 2 ? 14 : 15, 13, 3, 6);
        octx.fillStyle = skin; octx.fillRect(dir === 2 ? 14 : 15, 19, 3, 2);
      } else {
        octx.fillRect(16 - Math.floor(bw / 2) - 3, 13, 3, 6); octx.fillRect(16 + Math.floor(bw / 2), 13, 3, 6);
        octx.fillStyle = skin; octx.fillRect(16 - Math.floor(bw / 2) - 3, 19, 3, 2); octx.fillRect(16 + Math.floor(bw / 2), 19, 3, 2);
        if (dir === 0) { octx.fillStyle = PALETTE[25]; octx.fillRect(15, 13, 1, 7); }
      }
      var headX = side ? (dir === 2 ? 11 : 14) : 12;
      octx.fillStyle = dir === 1 ? accent : skin; octx.fillRect(headX, 4, side ? 7 : 8, 8);
      octx.fillStyle = accent; octx.fillRect(headX, 4, side ? 7 : 8, 3);
      octx.fillStyle = isZ ? PALETTE[1] : PALETTE[31];
      if (dir === 0) { octx.fillRect(14, 8, 1, 1); octx.fillRect(17, 8, 1, 1); }
      else if (side) octx.fillRect(dir === 2 ? 12 : 19, 8, 1, 1);
      if (isZ && v % 3 === 0 && dir !== 1) { octx.fillStyle = PALETTE[2]; octx.fillRect(14, 15, 4, 3); }
    } else if (cat === 'melee') {
      for (var k = -8; k <= 8; k++) {
        octx.fillStyle = k > 2 ? PALETTE[25] : PALETTE[7];
        octx.fillRect(16 + k, 16 - k, k > 3 && a % 2 === 0 ? 4 : 2, k > 3 && a % 2 === 0 ? 4 : 2);
      }
      if (a % 3 === 2) {
        octx.fillStyle = PALETTE[1];
        octx.fillRect(19, 6, 6, 5);
      }
    } else if (cat === 'firearm') {
      var longGun = a >= 2;
      octx.fillStyle = PALETTE[28];
      octx.fillRect(longGun ? 4 : 9, 12, longGun ? 24 : 14, 4);
      octx.fillStyle = a % 2 === 0 ? PALETTE[7] : PALETTE[27];
      octx.fillRect(longGun ? 5 : 10, 16, 6, 7);
      if (longGun) octx.fillRect(14, 16, 4, 7);
      octx.fillStyle = accent;
      octx.fillRect(12, 10, 6, 2);
    } else if (cat === 'med' || cat === 'food') {
      octx.fillStyle = cat === 'med' ? PALETTE[30] : c1;
      octx.fillRect(8, 8, 16, 16);
      octx.fillStyle = cat === 'med' ? PALETTE[1] : PALETTE[5];
      if (cat === 'med') {
        octx.fillRect(15, 11, 2, 10);
        octx.fillRect(11, 15, 10, 2);
      } else {
        octx.fillRect(10, 12, 12, 4);
      }
    } else if (cat === 'auto' || cat === 'ammo' || cat === 'bag') {
      octx.fillStyle = cat === 'auto' && a === 0 ? PALETTE[1] : c1;
      octx.fillRect(7, 8, 18, 17);
      octx.fillStyle = accent;
      octx.fillRect(9, 12, 14, 4);
      octx.fillStyle = PALETTE[25];
      octx.fillRect(12, 5, 8, 3);
    } else {
      octx.fillStyle = c1;
      octx.fillRect(9, 9, 14, 14);
      octx.fillStyle = c2;
      octx.fillRect(12, 12, 8, 8);
    }

    addPixelOutline(octx, 32, 32);
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, outSize, outSize);
    ctx.drawImage(off, 0, 0, 32, 32, 0, 0, outSize, outSize);
  }

  // ---------- 3. СИНТЕЗ И ЖИВОЙ 3D РЕНДЕР МНОГОСОСТАВНЫХ МЕШЕЙ ----------
  function getMeshParts(kind, archIdx, variantIdx) {
    var body = (hash32(archIdx, variantIdx, 5) % 24);
    if (kind === 'car' || kind === 'police' || kind === 'pickup' || kind === 'van' || kind === 'truck') {
      var mainCol = kind === 'police' ? 29 : (kind === 'van' && archIdx === 0 ? 30 : (kind === 'truck' ? 12 : (body % 6 === 0 ? 1 : 27)));
      if (variantIdx === 2) mainCol = 8; // ржавый
      var len = kind === 'truck' ? 4.8 : (kind === 'car' ? 4.0 : 4.3);
      var cabLen = kind === 'van' ? 3.2 : (kind === 'pickup' ? 1.5 : 2.1);
      var parts = [
        { cx: 0, cy: 0.55, cz: 0, sx: 1.9, sy: 0.6, sz: len, c: mainCol },
        { cx: 0, cy: 1.08, cz: kind === 'pickup' ? 0.45 : -0.1, sx: 1.65, sy: 0.56, sz: cabLen, c: kind === 'van' ? mainCol : 15 },
        { cx: -0.92, cy: 0.3, cz: len * 0.32, sx: 0.3, sy: 0.6, sz: 0.6, c: 29 },
        { cx: 0.92, cy: 0.3, cz: len * 0.32, sx: 0.3, sy: 0.6, sz: 0.6, c: 29 },
        { cx: -0.92, cy: 0.3, cz: -len * 0.32, sx: 0.3, sy: 0.6, sz: 0.6, c: 29 },
        { cx: 0.92, cy: 0.3, cz: -len * 0.32, sx: 0.3, sy: 0.6, sz: 0.6, c: 29 }
      ];
      // Фары и задние огни помогают различать перед и зад автомобиля.
      parts.push({ cx: -0.65, cy: 0.6, cz: len * 0.5 + 0.04, sx: 0.35, sy: 0.18, sz: 0.08, c: 5 });
      parts.push({ cx: 0.65, cy: 0.6, cz: len * 0.5 + 0.04, sx: 0.35, sy: 0.18, sz: 0.08, c: 5 });
      parts.push({ cx: -0.65, cy: 0.6, cz: -len * 0.5 - 0.04, sx: 0.35, sy: 0.18, sz: 0.08, c: 1 });
      parts.push({ cx: 0.65, cy: 0.6, cz: -len * 0.5 - 0.04, sx: 0.35, sy: 0.18, sz: 0.08, c: 1 });
      if (kind === 'police' || (kind === 'van' && archIdx === 0)) {
        parts.push({ cx: 0, cy: 1.44, cz: 0.1, sx: 1.0, sy: 0.16, sz: 0.25, c: 1 });
      } else if (kind === 'pickup') {
        parts.push({ cx: 0, cy: 0.9, cz: -1.1, sx: 1.7, sy: 0.35, sz: 1.4, c: 7 });
      } else {
        parts.push({ cx: 0, cy: 0.88, cz: len * 0.48, sx: 1.6, sy: 0.25, sz: 0.15, c: 26 });
      }
      return parts;
    }
    if (kind === 'oak') {
      var leafC = variantIdx === 8 ? 25 : (archIdx === 1 ? 6 : 12);
      return [
        { cx: 0, cy: 1.0, cz: 0, sx: 0.48, sy: 2.0, sz: 0.48, c: 7 },
        { cx: 0, cy: 2.4, cz: 0, sx: 1.9, sy: 1.2, sz: 1.9, c: leafC },
        { cx: 0.35, cy: 3.1, cz: -0.25, sx: 1.2, sy: 0.85, sz: 1.2, c: leafC - 1 >= 10 ? leafC - 1 : 11 },
        { cx: -0.4, cy: 2.8, cz: 0.3, sx: 1.1, sy: 0.75, sz: 1.1, c: 11 }
      ];
    }
    if (kind === 'pine') {
      var pineC = variantIdx === 8 ? 25 : 13;
      return [
        { cx: 0, cy: 0.9, cz: 0, sx: 0.38, sy: 1.8, sz: 0.38, c: 8 },
        { cx: 0, cy: 1.8, cz: 0, sx: 1.8, sy: 0.7, sz: 1.8, c: pineC },
        { cx: 0, cy: 2.5, cz: 0, sx: 1.3, sy: 0.7, sz: 1.3, c: 12 },
        { cx: 0, cy: 3.2, cz: 0, sx: 0.75, sy: 0.65, sz: 0.75, c: 11 }
      ];
    }
    if (kind === 'campfire') {
      return [
        { cx: 0, cy: 0.16, cz: 0, sx: 1.1, sy: 0.22, sz: 0.28, c: 7 },
        { cx: 0, cy: 0.16, cz: 0, sx: 0.28, sy: 0.22, sz: 1.1, c: 8 },
        { cx: 0, cy: 0.48, cz: 0, sx: 0.45, sy: 0.52, sz: 0.45, c: 1 },
        { cx: 0, cy: 0.76, cz: 0, sx: 0.25, sy: 0.35, sz: 0.25, c: 5 }
      ];
    }
    if (kind === 'wpn3d') {
      return [
        { cx: 0, cy: 0.35, cz: 0, sx: 0.24, sy: 0.26, sz: 2.4, c: 28 },
        { cx: 0, cy: 0.2, cz: -0.8, sx: 0.22, sy: 0.45, sz: 0.65, c: 7 },
        { cx: 0, cy: 0.12, cz: 0.25, sx: 0.18, sy: 0.55, sz: 0.28, c: 27 },
        { cx: 0, cy: 0.56, cz: -0.1, sx: 0.16, sy: 0.18, sz: 0.55, c: 15 }
      ];
    }
    if (kind === 'furniture' || kind === 'station') {
      return [
        { cx: 0, cy: 0.85, cz: 0, sx: 1.7, sy: 0.16, sz: 1.0, c: kind === 'station' ? 27 : 6 },
        { cx: -0.7, cy: 0.4, cz: -0.4, sx: 0.16, sy: 0.8, sz: 0.16, c: 7 },
        { cx: 0.7, cy: 0.4, cz: -0.4, sx: 0.16, sy: 0.8, sz: 0.16, c: 7 },
        { cx: -0.7, cy: 0.4, cz: 0.4, sx: 0.16, sy: 0.8, sz: 0.16, c: 7 },
        { cx: 0.7, cy: 0.4, cz: 0.4, sx: 0.16, sy: 0.8, sz: 0.16, c: 7 },
        { cx: 0.3, cy: 1.08, cz: 0, sx: 0.55, sy: 0.32, sz: 0.5, c: kind === 'station' ? 1 : 25 }
      ];
    }
    return [
      { cx: 0, cy: 0.55, cz: 0, sx: 1.4, sy: 1.1, sz: 1.4, c: 7 + (archIdx % 3) },
      { cx: 0, cy: 1.18, cz: 0, sx: 1.25, sy: 0.18, sz: 1.25, c: 26 },
      { cx: 0.4, cy: 0.7, cz: 0.72, sx: 0.4, sy: 0.4, sz: 0.08, c: 5 },
      { cx: -0.45, cy: 0.35, cz: -0.45, sx: 0.5, sy: 0.7, sz: 0.5, c: 8 }
    ];
  }

  function renderParts3D(ctx, parts, size, yaw, pitch) {
    ctx.clearRect(0, 0, size, size);
    var cy = Math.cos(yaw), sy = Math.sin(yaw);
    var cp = Math.cos(pitch), sp = Math.sin(pitch);

    // Определим центр модели по Y чтобы ровно помещалась в кадр
    var minY = 999, maxY = -999, maxR = 1.2;
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      minY = Math.min(minY, p.cy - p.sy * 0.5);
      maxY = Math.max(maxY, p.cy + p.sy * 0.5);
      maxR = Math.max(maxR, Math.hypot(Math.abs(p.cx) + p.sx * 0.5, Math.abs(p.cz) + p.sz * 0.5, maxY - minY));
    }
    var midY = (minY + maxY) * 0.5;
    var scale = (size * 0.42) / Math.max(1.0, maxR * 0.85);
    var cxScreen = size * 0.5;
    var cyScreen = size * 0.54;

    var polys = [];
    for (var pi = 0; pi < parts.length; pi++) {
      var b = parts[pi];
      var hx = b.sx * 0.5, hy = b.sy * 0.5, hz = b.sz * 0.5;
      var corners = [
        [b.cx - hx, b.cy - hy - midY, b.cz - hz],
        [b.cx + hx, b.cy - hy - midY, b.cz - hz],
        [b.cx + hx, b.cy + hy - midY, b.cz - hz],
        [b.cx - hx, b.cy + hy - midY, b.cz - hz],
        [b.cx - hx, b.cy - hy - midY, b.cz + hz],
        [b.cx + hx, b.cy - hy - midY, b.cz + hz],
        [b.cx + hx, b.cy + hy - midY, b.cz + hz],
        [b.cx - hx, b.cy + hy - midY, b.cz + hz]
      ];
      var proj = [];
      for (var ci = 0; ci < 8; ci++) {
        var x = corners[ci][0], y = corners[ci][1], z = corners[ci][2];
        var rx = x * cy - z * sy;
        var rz = x * sy + z * cy;
        var ry = y * cp - rz * sp;
        var rzz = y * sp + rz * cp;
        proj.push([cxScreen + rx * scale, cyScreen - ry * scale, rzz]);
      }
      var faces = [
        { idx: [4, 5, 6, 7], n: [0, 0, 1], shade: 1.0 },
        { idx: [1, 0, 3, 2], n: [0, 0, -1], shade: 0.72 },
        { idx: [5, 1, 2, 6], n: [1, 0, 0], shade: 0.88 },
        { idx: [0, 4, 7, 3], n: [-1, 0, 0], shade: 0.78 },
        { idx: [3, 7, 6, 2], n: [0, 1, 0], shade: 1.12 },
        { idx: [0, 1, 5, 4], n: [0, -1, 0], shade: 0.6 }
      ];
      for (var fi = 0; fi < faces.length; fi++) {
        var f = faces[fi];
        // Поворот нормали для backface culling
        var nx = f.n[0] * cy - f.n[2] * sy;
        var nz = f.n[0] * sy + f.n[2] * cy;
        var nzz = f.n[1] * sp + nz * cp;
        if (nzz <= 0.02) continue;
        var pts = [proj[f.idx[0]], proj[f.idx[1]], proj[f.idx[2]], proj[f.idx[3]]];
        var avgZ = (pts[0][2] + pts[1][2] + pts[2][2] + pts[3][2]) * 0.25;
        polys.push({ pts: pts, z: avgZ, col: PALETTE[b.c] || '#8c929e', shade: f.shade });
      }
    }

    polys.sort(function (a, b) { return a.z - b.z; });
    for (var k = 0; k < polys.length; k++) {
      var q = polys[k];
      ctx.beginPath();
      ctx.moveTo(q.pts[0][0], q.pts[0][1]);
      ctx.lineTo(q.pts[1][0], q.pts[1][1]);
      ctx.lineTo(q.pts[2][0], q.pts[2][1]);
      ctx.lineTo(q.pts[3][0], q.pts[3][1]);
      ctx.closePath();
      ctx.fillStyle = shadeHex(q.col, q.shade);
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  function shadeHex(hex, mult) {
    var h = hex.replace('#', '');
    var r = Math.min(255, Math.max(0, Math.round(parseInt(h.slice(0, 2), 16) * mult)));
    var g = Math.min(255, Math.max(0, Math.round(parseInt(h.slice(2, 4), 16) * mult)));
    var b = Math.min(255, Math.max(0, Math.round(parseInt(h.slice(4, 6), 16) * mult)));
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  var scratchPool = {};
  function createScratch(w, h) {
    if (typeof document === 'undefined' || typeof document.createElement !== 'function') return null;
    var key = w + 'x' + h;
    if (!scratchPool[key]) {
      var c = document.createElement('canvas');
      if (!c || typeof c.getContext !== 'function') return null;
      c.width = w;
      c.height = h;
      scratchPool[key] = c;
    }
    return scratchPool[key];
  }

  function renderMesh3D(ctx, item, size, yaw) {
    var fam = MESH_FAMILIES[item.famIdx] || MESH_FAMILIES[0];
    var parts = getMeshParts(fam.kind, item.archIdx, item.variantIdx);
    renderParts3D(ctx, parts, size, yaw == null ? 0.62 : yaw, 0.48);
  }

  function renderBaseGlbPreview(ctx, assetId, size, yaw) {
    var models = (global.DD_DATA && global.DD_DATA.glbPreviewParts) || {};
    var parts = models[assetId];
    if (!parts || !parts.length) {
      ctx.clearRect(0, 0, size, size);
      ctx.fillStyle = '#b7c0c7'; ctx.font = '12px sans-serif';
      ctx.fillText('Нет 3D предпросмотра', 4, size / 2);
      return false;
    }
    renderParts3D(ctx, parts, size, yaw == null ? 0.62 : yaw, 0.48);
    return true;
  }

  function renderItemToCanvas(canvas, item, yaw, direction) {
    if (!canvas || !item) return;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;
    var size = canvas.width;
    if (item.kind === 'texture') renderTexture32(ctx, item, size);
    else if (item.kind === 'model') renderModel32(ctx, item, size, direction);
    else renderMesh3D(ctx, item, size, yaw);
  }

  DD.ContentPack = {
    PALETTE: PALETTE,
    getAll: buildCatalogIndex,
    count: function () { return 10000; },
    renderItemToCanvas: renderItemToCanvas,
    renderTexture32: renderTexture32,
    renderModel32: renderModel32,
    renderMesh3D: renderMesh3D,
    renderBaseGlbPreview: renderBaseGlbPreview
  };
})(window);
