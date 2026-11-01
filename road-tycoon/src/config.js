/* ТРАССА: Дорожная империя — конфигурация и баланс.
   Классический скрипт: работает и с file://, и с GitHub Pages. */
(function () {
  const TR = (window.TR = window.TR || {});

  const CFG = (TR.CONFIG = {
    version: 3,
    saveKey: 'trassa-road-empire-v1',

    /* Размер карты в километрах */
    worldW: 1000,
    worldH: 1000,

    /* Экономика и время */
    startMoney: 140000,
    hoursPerSecond: 0.24,      // игровых часов за реальную секунду на скорости 1x
    trafficTimeMul: 1.6,       // машин быстрее «игровых часов»: карта стала в 10 раз больше
    dayStartHour: 8,
    maxVehicles: 700,
    tollPrice: 32,
    taxRate: 0.05,
    loanRate: 0.012,           // в день
    loanBaseLimit: 60000,

    /* Уровни компании */
    levelXp: [0, 250, 650, 1300, 2400, 3900, 5800, 8200, 11500, 15500],

    /* Дороги */
    roadTypes: [
      {
        key: 'dirt', name: 'Грунтовка', short: 'ГРУНТ',
        speed: 38, cost: 70, upgrade: 0.85, upkeep: 0.025, wear: 0.07,
        color: '#8a6a45', edge: '#6b5133', width: 0.85, dash: true,
        unlock: 1, desc: 'Пыльно и медленно, зато почти бесплатно. С неё начинают все.',
      },
      {
        key: 'gravel', name: 'Гравий', short: 'ГРАВИЙ',
        speed: 58, cost: 150, upgrade: 0.85, upkeep: 0.07, wear: 0.18,
        color: '#a49b8c', edge: '#7d766a', width: 1.0, dash: true,
        unlock: 1, desc: 'Твёрдое покрытие: больше трафика, меньше жалоб водителей.',
      },
      {
        key: 'asphalt', name: 'Асфальт', short: 'АСФАЛЬТ',
        speed: 88, cost: 280, upgrade: 0.85, upkeep: 0.15, wear: 0.42,
        color: '#3c414a', edge: '#23262c', width: 1.25, dash: false,
        unlock: 2, desc: 'Стандарт трассы. Держит поток и открывает платные участки.',
      },
      {
        key: 'highway', name: 'Автобан', short: 'АВТОБАН',
        speed: 115, cost: 420, upgrade: 0.85, upkeep: 0.26, wear: 0.54,
        color: '#2a2f37', edge: '#191c21', width: 1.5, dash: false,
        unlock: 4, desc: 'Четыре полосы, разделитель, большие скорости и большой поток.',
      },
    ],

    /* Объекты: сервис, благоустройство, платные участки */
    facilities: [
      {
        key: 'cafe', name: 'Кафе «У трассы»', emoji: '🍔', cat: 'service',
        cost: 15000, buildDays: 0.25, upkeep: 260, income: 100, want: 'food',
        chance: 0.6, capacity: 110, minQuality: 0, unlock: 1, color: '#e0a23c',
        desc: 'Кофе, пирожки и суп для тех, кто в пути. Первый объект доходной трассы.',
      },
      {
        key: 'fuel', name: 'АЗС', emoji: '⛽', cat: 'service',
        cost: 30000, buildDays: 0.4, upkeep: 500, income: 152, want: 'fuel',
        chance: 0.65, capacity: 150, minQuality: 0, unlock: 1, color: '#4fb46a',
        desc: 'Заправка с парой колонок. Заправляет почти каждого, кто мимо едет.',
      },
      {
        key: 'shop', name: 'Придорожный магазин', emoji: '🏪', cat: 'service',
        cost: 13000, buildDays: 0.2, upkeep: 170, income: 56, want: 'food',
        chance: 0.42, capacity: 120, minQuality: 0, unlock: 1, color: '#c96f4a',
        desc: 'Вода, снеки и пресса. Мелочь, а за день набегает прилично.',
      },
      {
        key: 'ad', name: 'Рекламный щит', emoji: '🪧', cat: 'service',
        cost: 9000, buildDays: 0.15, upkeep: 60, income: 0, perPass: 12,
        capacity: 999999, minQuality: 0, unlock: 1, passive: true, color: '#8a7fd6',
        desc: 'Платят за каждый проехавший автомобиль. Дёшево и стабильно.',
      },
      {
        key: 'tire', name: 'Шиномонтаж', emoji: '🛞', cat: 'service',
        cost: 22000, buildDays: 0.3, upkeep: 280, income: 112, want: 'repair',
        chance: 0.5, capacity: 80, minQuality: 0, unlock: 2, color: '#6d7f92',
        desc: 'Пробитое колесо — беда на трассе. Чинят быстро, берут по-божески.',
      },
      {
        key: 'wash', name: 'Мойка', emoji: '🚿', cat: 'service',
        cost: 24000, buildDays: 0.3, upkeep: 300, income: 92, want: 'wash',
        chance: 0.55, capacity: 70, minQuality: 1, unlock: 2, color: '#4f9fc9',
        desc: 'Дальнобойщики любят чистые стёкла. Работает лучше на твёрдом покрытии.',
      },
      {
        key: 'motel', name: 'Мотель', emoji: '🏨', cat: 'service',
        cost: 58000, buildDays: 0.6, upkeep: 780, income: 340, want: 'rest',
        chance: 0.55, capacity: 42, minQuality: 1, unlock: 3, color: '#b98cd6',
        desc: 'Ночлег для уставших. Ночью приносит заметно больше, чем днём.',
        nightBonus: 1.8,
      },
      {
        key: 'camp', name: 'Кемпинг', emoji: '🏕️', cat: 'service',
        cost: 28000, buildDays: 0.35, upkeep: 190, income: 120, want: 'rest',
        chance: 0.4, capacity: 50, minQuality: 0, unlock: 3, color: '#6aa84f',
        desc: 'Палатки, душ и костровая зона. Любят семьи и велосипедисты.',
      },
      {
        key: 'repair', name: 'СТО', emoji: '🔧', cat: 'service',
        cost: 48000, buildDays: 0.5, upkeep: 680, income: 260, want: 'repair',
        chance: 0.55, capacity: 60, minQuality: 1, unlock: 4, color: '#cf5d4e',
        desc: 'Полноценный сервис: диагностика, тормоза, двигатель. Дорого и прибыльно.',
      },
      {
        key: 'charge', name: 'Электрозаправка', emoji: '⚡', cat: 'service',
        cost: 56000, buildDays: 0.45, upkeep: 420, income: 235, want: 'charge',
        chance: 0.75, capacity: 60, minQuality: 2, unlock: 5, color: '#55d9c2',
        desc: 'Быстрые зарядки будущего. Требует асфальта и привлекает новый тип трафика.',
      },
      {
        key: 'toll', name: 'Пункт оплаты', emoji: '🎫', cat: 'service',
        cost: 42000, buildDays: 0.35, upkeep: 380, income: 0, perPass: 32,
        capacity: 999999, minQuality: 2, unlock: 4, passive: true,
        edgeWide: true, color: '#e8c14c',
        desc: 'Платный участок: каждый проехавший платит. Один на дорогу.',
      },
      {
        key: 'busstop', name: 'Остановка', emoji: '🚏', cat: 'city',
        cost: 7000, buildDays: 0.12, upkeep: 40, income: 0, beauty: 0.1,
        subsidy: 30, capacity: 999999, minQuality: 0, unlock: 1, color: '#c8c3b4',
        desc: 'Автобусная остановка с навесом. Город доволен и платит субсидию.',
      },
      {
        key: 'trees', name: 'Озеленение', emoji: '🌳', cat: 'city',
        cost: 5500, buildDays: 0.12, upkeep: 25, income: 0, beauty: 0.08,
        subsidy: 20, capacity: 999999, minQuality: 0, unlock: 1, color: '#5fa85f',
        desc: 'Ряды деревьев вдоль обочины. Уют, тень и плюс к репутации.',
      },
      {
        key: 'lights', name: 'Освещение', emoji: '💡', cat: 'city',
        cost: 12000, buildDays: 0.2, upkeep: 90, income: 0, beauty: 0.1,
        comfort: 0.08, subsidy: 24, capacity: 999999, minQuality: 0,
        unlock: 2, edgeWide: true, color: '#f0cf6a',
        desc: 'Фонари на участке: машины чаще останавливаются и ночью, и в дождь.',
      },
      {
        key: 'square', name: 'Сквер у города', emoji: '🌷', cat: 'city',
        cost: 16000, buildDays: 0.28, upkeep: 70, income: 0, beauty: 0.16,
        subsidy: 60, capacity: 999999, minQuality: 0, unlock: 3, color: '#d87fa8',
        desc: 'Клумбы, лавочки и фонтан. Благоустройство, за которое хвалят в мэрии.',
      },
    ],

    facilityCatNames: { service: 'Придорожный сервис', city: 'Благоустройство' },

    /* Города */
    cities: [
      { name: 'Заречье', x: 188, y: 580, pop: 42000, start: true },
      { name: 'Сосновка', x: 388, y: 340, pop: 28000, start: true },
      { name: 'Белогорск', x: 625, y: 260, pop: 36000 },
      { name: 'Каменка', x: 488, y: 740, pop: 22000 },
      { name: 'Ольхово', x: 800, y: 620, pop: 31000 },
      { name: 'Мельниково', x: 275, y: 180, pop: 18000 },
      { name: 'Солнечный', x: 675, y: 860, pop: 24000 },
      { name: 'Верхний Лог', x: 888, y: 360, pop: 20000 },
      { name: 'Крутояр', x: 100, y: 300, pop: 16000 },
      { name: 'Приморск', x: 938, y: 880, pop: 26000 },
    ],

    /* Рост городов, упадок и гибель */
    cityGrowth: {
      maxPop: 420000,
      gainRate: 0.01,      // прирост в день при высоком довольстве
      lossRate: 0.005,     // убыль в день при низком
      goodSat: 1.0,        // выше — город растёт
      badSat: 0.9,         // ниже — город чахнет
      ruinSat: 0.86,       // ниже этого — копится тревога
      ruinDays: 8,         // столько дней тревоги — и город может погибнуть
      ruinChance: 0.07,    // шанс гибели за день тревоги
      recoverChance: 0.05, // шанс, что выживший город восстановится
    },

    /* Посёлки: появляются сами, растут и могут стать городом */
    villages: {
      chance: 0.1,         // 10 % на игровой день
      startPop: 900,
      growth: 0.03,        // в день при дороге рядом
      decay: 0.01,         // в день без дороги
      cityAt: 7000,        // с этого населения — уже город
      max: 26,
      minDistCity: 55,
      minDistVillage: 45,
      names: ['Берёзки', 'Пески', 'Ключи', 'Дубки', 'Заимка', 'Ясное', 'Овражки', 'Лужки', 'Сосёнки',
        'Родники', 'Поляна', 'Тихая', 'Ветрянка', 'Малиновка', 'Черёмушки', 'Горки', 'Лесная',
        'Каменный Брод', 'Заводь', 'Первомайка', 'Кузнечики', 'Стрелка', 'Заря', 'Вершина'],
    },

    /* Готовая (стартовая) дорожная сеть */
    startRoads: [
      { a: 0, b: 1, quality: 0 },
      { a: 0, b: 3, quality: 0 },
    ],

    /* Улучшения компании */
    upgrades: [
      {
        key: 'crew', name: 'Бригада', icon: '👷', max: 8, baseCost: 22000, growth: 1.55,
        desc: 'Больше рабочих — быстрее строятся дороги и объекты.',
        effect: (lvl) => `Скорость стройки: ${Math.round(30 + lvl * 14)} км/день`,
      },
      {
        key: 'fleet', name: 'Спецтехника', icon: '🚜', max: 4, baseCost: 38000, growth: 1.8,
        desc: 'Катки, асфальтоукладчики и самосвалы: ещё одна стройка параллельно.',
        effect: (lvl) => `Параллельных строек: ${1 + lvl}`,
      },
      {
        key: 'marketing', name: 'Маркетинг', icon: '📣', max: 5, baseCost: 26000, growth: 1.7,
        desc: 'Указатели и реклама: водители чаще заворачивают к вам.',
        effect: (lvl) => `Вероятность остановки: +${lvl * 7}%`,
      },
      {
        key: 'quality', name: 'Сервис', icon: '⭐', max: 5, baseCost: 32000, growth: 1.65,
        desc: 'Обученный персонал и чистота: средний чек выше.',
        effect: (lvl) => `Доход с клиента: +${lvl * 10}%`,
      },
      {
        key: 'maintenance', name: 'Служба содержания', icon: '🛠️', max: 5, baseCost: 24000, growth: 1.6,
        desc: 'Свои ремонтники: дешевле содержание дорог и объектов.',
        effect: (lvl) => `Расходы на содержание: −${lvl * 9}%`,
      },
    ],

    /* Цели кампании */
    objectives: [
      {
        id: 'first_object', title: 'Первый объект', reward: 12000, xp: 80,
        desc: 'Поставьте кафе или АЗС у существующей дороги.',
        check: (s) => s.facilities.some((f) => f.type === 'cafe' || f.type === 'fuel'),
      },
      {
        id: 'beauty', title: 'Сделать красиво', reward: 16000, xp: 90,
        desc: 'Поставьте 2 объекта благоустройства: озеленение, остановку или сквер.',
        check: (s) => s.facilities.filter((f) => f.type === 'trees' || f.type === 'busstop' || f.type === 'square').length >= 2,
      },
      {
        id: 'new_road', title: 'Новая трасса', reward: 30000, xp: 160,
        desc: 'Постройте дорогу к городу, с которым ещё нет сообщения.',
        check: (s) => s.roads.some((r) => r.open && r.byPlayer),
      },
      {
        id: 'asphalt20', title: 'Твёрдое покрытие', reward: 45000, xp: 220,
        desc: 'Уложите асфальт хотя бы на 200 км.',
        check: (s) => s.roads.reduce((sum, r) => sum + (r.open && r.quality >= 2 ? r.totalKm : 0), 0) >= 200,
      },
      {
        id: 'five_cities', title: 'Пять городов', reward: 80000, xp: 320,
        desc: 'Соедините дорогами 5 городов в одну сеть.',
        check: (s) => TR.Sim.connectedCityCount(s) >= 5,
      },
      {
        id: 'income8k', title: 'Поток', reward: 100000, xp: 400,
        desc: 'Выйдите на выручку 8 000 ₽ за игровой день.',
        check: (s) => s.stats.tradeToday >= 8000 || (s.stats.history[0] && s.stats.history[0].trade >= 8000),
      },
      {
        id: 'network12', title: 'Сервисная сеть', reward: 120000, xp: 450,
        desc: 'Откройте 15 объектов вдоль дорог.',
        check: (s) => s.facilities.filter((f) => f.ready).length >= 15,
      },
      {
        id: 'all_cities', title: 'Вся область', reward: 200000, xp: 700,
        desc: 'Соедините все 10 городов в единую сеть.',
        check: (s) => TR.Sim.connectedCityCount(s) >= TR.CONFIG.cities.length,
      },
      {
        id: 'capital', title: 'Дорожная империя', reward: 0, xp: 1000,
        desc: 'Доведите капитал компании до 1 200 000 ₽.',
        check: (s) => TR.Sim.companyValue(s) >= 1200000,
      },
    ],

    /* Кризисы: приходят волнами и бьют по экономике на несколько дней */
    crises: [
      {
        id: 'fuel', weight: 3, days: 4, title: 'Топливный кризис',
        text: 'Цены на топливо выросли, машины реже сворачивают к объектам.',
        mods: { traffic: 0.78, income: 0.92 },
      },
      {
        id: 'recession', weight: 3, days: 5, title: 'Экономический спад',
        text: 'Перевозки падают: трафик на трассах заметно ниже.',
        mods: { traffic: 0.7 },
      },
      {
        id: 'budget', weight: 2, days: 4, title: 'Секвестр бюджета',
        text: 'Субсидии урезаны, налог временно повышен.',
        mods: { subsidy: 0.35, tax: 1.6 },
      },
      {
        id: 'storm', weight: 2, days: 3, title: 'Шторм и паводок',
        text: 'Размыло обочины: содержание дорог и объектов дороже.',
        mods: { upkeep: 1.55 },
      },
      {
        id: 'inflation', weight: 2, days: 5, title: 'Инфляция стройматериалов',
        text: 'Щебень, битум и техника подорожали — стройка дороже.',
        mods: { buildCost: 1.22 },
      },
      {
        id: 'freeze', weight: 1, days: 3, title: 'Ледяной дождь',
        text: 'Дороги обледенели: машины едут медленнее, меньше клиентов.',
        mods: { traffic: 0.82, income: 0.95 },
      },
    ],

    /* Случайные события */
    events: [
      {
        id: 'festival', weight: 3, good: true, title: 'Фестиваль в {city}',
        text: 'В {city} праздник: поток машин вырос в полтора раза на два дня.',
        apply: (s, city) => TR.Sim.addEffect(s, 'traffic', 1.5, 2, 'Фестиваль в ' + city.name),
      },
      {
        id: 'truckers', weight: 3, good: true, title: 'Дальнобойщики выбирают трассу',
        text: 'На навигаторах ваш маршрут стал основным. Трафик +30% на день.',
        apply: (s) => TR.Sim.addEffect(s, 'traffic', 1.3, 1, 'Трафик дальнобойщиков'),
      },
      {
        id: 'rain', weight: 3, good: false, title: 'Заливные дожди',
        text: 'Дождь на сутки: трафик −15%, стройка идёт медленнее.',
        apply: (s) => {
          TR.Sim.addEffect(s, 'traffic', 0.85, 1, 'Дожди');
          TR.Sim.addEffect(s, 'build', 0.7, 1, 'Дожди');
        },
      },
      {
        id: 'fuelprice', weight: 2, good: true, title: 'Топливо подорожало',
        text: 'Цены на топливо выросли — заправки и СТО зарабатывают больше два дня.',
        apply: (s) => TR.Sim.addEffect(s, 'income', 1.25, 2, 'Высокие цены на топливо'),
      },
      {
        id: 'inspection', weight: 2, good: false, title: 'Проверка качества дорог',
        text: 'Комиссия нашла грунтовые участки без твёрдого покрытия.',
        apply: (s) => {
          const dirt = s.roads.filter((r) => r.open && r.quality === 0);
          if (!dirt.length) {
            TR.Sim.notice(s, 'good', 'Проверка пройдена: все дороги в порядке.');
            return;
          }
          const fine = 2500 + dirt.length * 1800;
          s.money -= fine;
          TR.Sim.notice(s, 'bad', `Штраф за грунтовые участки: −${TR.Util.money(fine)}`);
        },
      },
      {
        id: 'accident', weight: 2, good: false, title: 'Авария на трассе',
        text: 'ДТП перекрыло участок — машины поедут в объезд.',
        apply: (s) => {
          const open = s.roads.filter((r) => r.open && !r.blockedUntil);
          if (!open.length) return;
          const road = open[Math.floor(Math.random() * open.length)];
          road.blockedUntil = s.time + 0.3;
          TR.Sim.invalidatePaths(s);
          TR.Sim.notice(s, 'bad', 'ДТП: участок перекрыт на несколько часов.');
        },
      },
      {
        id: 'grant', weight: 1, good: true, title: 'Субсидия на благоустройство',
        text: 'Область выделила субсидию вашей компании.',
        apply: (s) => {
          const sum = 12000 + Math.round(Math.random() * 8000);
          s.money += sum;
          s.stats.totalIncome += sum;
          TR.Sim.notice(s, 'good', `Получена субсидия: +${TR.Util.money(sum)}`);
        },
      },
      {
        id: 'order', weight: 3, good: true, title: 'Новый госзаказ',
        text: 'Администрация прислала заявку на работы.',
        apply: (s) => TR.Sim.spawnContract(s, true),
      },
    ],

    /* Заказы (госзаказы и частные) */
    contractPool: [
      { kind: 'connect', weight: 3 },
      { kind: 'facility', weight: 3 },
      { kind: 'beauty', weight: 3 },
      { kind: 'asphalt', weight: 2 },
    ],

    tips: [
      'Ставьте объекты там, где уже есть поток: у дороги между двумя городами.',
      'Гравий и асфальт ускоряют машины — быстрее оборот, больше клиентов.',
      'Ночью кафе и мотели зарабатывают больше: следите за сутками.',
      'Освещение на участке повышает шанс, что водитель свернёт к вам.',
      'Пункт оплаты можно поставить только на асфальт, и один на дорогу.',
      'Благоустройство повышает довольство города — он приводит больше машин.',
      'Стройка идёт параллельно, если купить спецтехнику.',
      'Госзаказы дают крупные разовые выплаты — заглядывайте в раздел «Заказы».',
    ],
  });

  CFG.roadByKey = {};
  CFG.roadTypes.forEach((r, i) => { r.idx = i; CFG.roadByKey[r.key] = r; });
  CFG.facilityByKey = {};
  CFG.facilities.forEach((f) => { CFG.facilityByKey[f.key] = f; });
})();
