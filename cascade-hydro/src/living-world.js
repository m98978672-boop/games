// ============================================================================
//  ЖИВОЙ МИР ДОЛИНЫ И КАТАЛОГ ИЗ 300 АНИМАЦИЙ v0.3.1 (src/living-world.js)
//  Чистая и реалистичная атмосфера без лишнего трафика по рекам и бездорожью:
//  - Ветрогенераторы ВЭС на хребтах, солнечные трекеры СЭС и пар градирен промзон
//  - Парящие высоко в небе орлы/чайки и объёмные кучевые облака
//  - Аккуратная внутриквартальная жизнь только внутри плоских террас городов
// ============================================================================

import * as THREE from 'three';
import { WORLD, CITY_DEFS } from './config.js';
import { getScaledValleyRivers } from './valley.js';
import { clamp, makeRng } from './noise.js';
import { pickCatalogShade } from './textures.js';

/**
 * Генерирует полный реестр из 300 параметризованных природных, гидротехнических и городских анимаций
 */
function buildAnimationRegistry300() {
  const groups = [
    {
      group: 'hydro_optics',
      groupLabel: 'Гидродинамика, 3D-переливы и оптика воды',
      items: [
        'Водопадная пелена перелива плотины (быстрая)', 'Водопадная пелена перелива (средний напор)',
        'Тонкая переливная кромка гребня', 'Струя открытого лотка водосброса',
        'Трамплинный отрыв потока с носка водосброса', 'Кипящий гидравлический прыжок внизу плотины',
        'Длинноволновая ветровая зыбь водохранилища', 'Короткая капиллярная рябь речного плёса',
        'Поперечная интерференция волн в каньоне', 'Двойная солнечная каустика мелководья (слой A)',
        'Двойная солнечная каустика мелководья (слой B)', 'Кружевная пена наката на берег',
        'Вихревая дорожка Кармана за устоями', 'Белый пенный вал переката горной реки',
        'Бурун отводящего канала турбины Каплана', 'Высоконапорный выброс турбины Фрэнсиса',
        'Ночной обратный поток закачки ГАЭС', 'Радужная водяная пыль у основания водопада',
        'Размыв грунтовой перемычки паводком', 'Оседание илистого шлейфа в тихом заливе',
        'Блик дорожки солнца по законам Френеля', 'Лунная серебристая дорожка на воде ночью',
        'Волновое качание поверхности при ливне', 'Круги от капель штормового дождя',
        'Пульсация родникового ключа в верховье Быстрицы', 'Талый поток ледникового ручья Серебрянки',
        'Стремительный слив горного ручья Гремучего', 'Подъём зеркала верхнего бьефа при наполнении',
        'Сработка зеркала бьефа в вечерний пик', 'Фильтрационные струйки под нецементированной дамбой',
        'Наполнение оросительного канала Агродолины', 'Слияние устья реки с бескрайней водной гладью',
      ],
    },
    {
      group: 'hydro_plant',
      groupLabel: 'Механизмы ГЭС, ГАЭС и подстанций ОРУ',
      items: [
        'Вращение рабочего колеса Каплана (номинал)', 'Вращение рабочего колеса Каплана (форсаж)',
        'Вращение радиально-осевой турбины Фрэнсиса', 'Турбинный ход обратимой гидромашины ГАЭС',
        'Реверсивное вращение насоса ГАЭС (закачка ночью)', 'Пульсация индикатора мощности на крыше машзала',
        'Ход мостового козлового крана по гребню ГЭС', 'Подъём крюка козлового крана над шахтой турбины',
        'Плавное открытие сегментного затвора водосброса', 'Автоматическое прикрытие затвора по уровню ВБ',
        'Ход граблей сороочистной машины водоприёмника', 'Микро-вибрация стальных напорных водоводов',
        'Сброс аэрационных пузырей в отсасывающей трубе', 'Тепловое дрожание над трансформаторами 220 кВ',
        'Коронное свечение гирлянд изоляторов ОРУ', 'Провис проводов ЛЭП с ветровым раскачиванием',
        'Бегущий импульс нагрузки по магистрали ЛЭП', 'Аварийный красный маяк кавитации гидроагрегата',
        'Зелёный маяк синхронизации с сетью 50,00 Гц', 'Бирюзовый индикатор ночного накопления ГАЭС',
        'Освещение арочных окон машинного зала ГЭС', 'Прожекторы подсветки низовой грани плотины',
        'Работа дренажных насосов потерны плотины', 'Контрольный маятник-отвес прогиба высокой плотины',
        'Поворот разъединителей шинного моста ОРУ', 'Вращение вентиляторов масляного охлаждения ТРДН',
        'Створчатый клапан холостого выпуска воды', 'Гаситель энергии в водобойном колодце',
      ],
    },
    {
      group: 'locks_marinas',
      groupLabel: 'Шлюзовые камеры, аэраторы и гидропосты',
      items: [
        'Растворение верхних двустворчатых ворот шлюза', 'Растворение нижних ворот судоходного шлюза',
        'Подъём зеркала воды в камере шлюза', 'Спуск воды из камеры шлюза в нижний бьеф',
        'Светофор шлюзования (красный / зелёный створ)', 'Покачивание швартовых понтонов яхт-марины',
        'Вращение портового навигационного радара', 'Сигнальные огни портовых причалов ночью',
        'Качание мерных реек гидрологического поста', 'Вращение аэратора садка форелевого рыбхоза №1',
        'Вращение аэратора садка форелевого рыбхоза №2', 'Автокормушка понтонного модуля рыбхоза',
        'Кислородное бурление в форелевом садке', 'Плавный прибой на внешнем морском горизонте',
        'Колыхание защитных бонов водоприёмника', 'Работа рыбоподъёмного затвора гидроузла',
        'Пульсация уровнемера верхнего бьефа', 'Пульсация расходомера нижнего бьефа',
        'Огни безопасности на устоях шлюза', 'Поворот стрелы причального крана Усть-Порта',
        'Перелив воды через водослив рыбохода', 'Дрейф утренней дымки над акваторией порта',
        'Бликование водной глади за пределами долины', 'Мерцание буёв ограждения предплотинной зоны',
        'Работа насосной станции берегового водозабора', 'Вращение барабанного микрофильтра водоканала',
        'Подсветка набережной курортного квартала', 'Плавное волнение в защищённой бухте порта',
      ],
    },
    {
      group: 'construction_mining',
      groupLabel: 'Строительная техника, краны и бетонирование',
      items: [
        'Поворот стрелы башенного крана КБ-504 (левый)', 'Поворот стрелы башенного крана КБ-504 (правый)',
        'Перемещение грузовой каретки по стреле крана', 'Спуск бадьи с гидротехническим бетоном в блок',
        'Послойный рост монолитной секции плотины', 'Монтаж стального шпунта перемычки Ларсена',
        'Сборка арматурного пространственного каркаса', 'Снятие щитовой опалубки со зрелого бетона',
        'Выемка грунта при прокладке канала', 'Фонтан брызг и крошки при разработке породы',
        'Пополнение склада гранитного щебня', 'Отгрузка партии щебня строительным трестам',
        'Вращение барабана бетоносмесительного узла', 'Подача смеси в блок бетонирования плотины',
        'Отсыпка ядра грунтовой перемычки', 'Уплотнение гребня земляной дамбы',
        'Бурение скважин цементационной завесы скалы', 'Дробильно-сортировочный грохот щебня',
        'Ленточный конвейер подачи заполнителя БСУ', 'Лёгкий пар гидратации массивного бетона',
        'Оранжевые сигнальные огни зоны строительства', 'Прожекторы ночной смены на стройплощадке ГЭС',
        'Инъекция цементного раствора под контрфорс', 'Укладка железобетонных плит облицовки канала',
        'Работа водоотливной помпы в котловане машзала', 'Геодезический 3D-призрак проектного яруса плотины',
      ],
    },
    {
      group: 'city_avenues',
      groupLabel: 'Внутригородская жизнь и кольцевые проспекты',
      items: [
        'Движение городского транспорта по кольцу Светлограда', 'Электромобили кампуса Технопарка ИИ',
        'Внутризаводские тягачи на площадке Алюмграда', 'Коммунальная техника кварталов Каменногорска',
        'Агротехника у элеваторов Агродолины', 'Курортные шаттлы набережной Усть-Порта',
        'Поселковый транспорт Речного Посада', 'Служебные машины метеоцентра Североборска',
        'Зажигание фар внутригородского транспорта вечером', 'Огни уличных торшеров на площадях городов',
        'Плавный поворот машин на городских кольцах', 'Отражение огней кварталов на вечерних улицах',
        'Световая волна центрального проспекта мегаполиса', 'Подсветка пешеходных бульваров у ратуши',
        'Дежурные огни спасательного депо МЧС', 'Сигнальные огни больничного городка',
        'Вечерняя иллюминация торгового холла', 'Огни логистического терминала промзоны',
        'Подсветка школьного двора и стадиона', 'Тёплый свет террас таунхаусов в сумерках',
        'Холодный неон серверных модулей Технопарка', 'Янтарное свечение окон деревянных коттеджей',
        'Плавное оживление улиц по мере роста населения', 'Пульсация индикаторов городских подстанций',
        'Синхронное включение ночного освещения в 19:30', 'Утреннее угасание уличных фонарей на рассвете',
      ],
    },
    {
      group: 'renewables_radars',
      groupLabel: 'Ветропарки ВЭС, трекеры СЭС, радары и маяк',
      items: [
        'Вращение ротора ВЭС-1 на западном хребте', 'Вращение ротора ВЭС-2 со сдвигом фазы 120°',
        'Вращение ротора ВЭС-3 с ускорением при циклоне', 'Рыскание гондолы ветряка по направлению ветра',
        'Утренний разворот солнечных панелей СЭС на восток', 'Дневное зенитное слежение трекеров СЭС',
        'Вечерний наклон панелей СЭС к закатному солнцу', 'Ночная парковка столов СЭС в горизонт',
        'Блик солнечного зайчика на кремниевых ячейках СЭС', 'Навигационный огонь портового маяка ночью',
        'Вращение антенны доплеровского метеорадара', 'Качание чашек анемометра горной метеостанции',
        'Пульсация красных огней ЗОМ на мачтах ВЭС', 'Синхронная вспышка огней безопасности небоскрёбов',
        'Поворот параболической антенны космосвязи ЦОД', 'Индикатор заряда аккумуляторного буфера СЭС',
        'Плавный холостой ход ВЭС в штилевую межень', 'Штормовое демпфирование лопастей при урагане',
        'Светодиодное кольцо на башне метеокомплекса', 'Телеметрический импульс гидропоста на реке',
        'Работа гелиоколлекторов эко-квартала', 'Вращение дефлекторов вентиляции подстанций',
        'Проблесковый буй метеостанции на водохранилище', 'Лазерный лидар контроля облачности на пике',
      ],
    },
    {
      group: 'industry_agro',
      groupLabel: 'Заводы, градирни, ЦОД ИИ и агроирригация',
      items: [
        'Клубящийся столб пара градирни №1', 'Клубящийся столб пара градирни №2',
        'Рассеивание парового шлейфа градирен по ветру', 'Дымка литейного корпуса Алюмграда',
        'Оранжевый отсвет ковша жидкого металла в цеху', 'Бегущая бирюзовая матрица стоек ЦОД ИИ (зал А)',
        'Бегущая бирюзовая матрица стоек ЦОД ИИ (зал Б)', 'Вращение чиллеров сухого охлаждения суперкомпьютера',
        'Пульсация зелёного кольца орошения Агродолины', 'Наполнение приёмной чаши оросительного канала',
        'Увлажнение чернозёма вокруг канала ирригации', 'Подъём нории зернового элеватора на погрузке',
        'Тёплое фито-свечение тепличного комплекса ночью', 'Открытие фрамуг проветривания теплиц в полдень',
        'Работа портального крана в Усть-Порту', 'Световая индикация электролизного цеха алюминия',
        'Вращение аэраторов воды в форелевых садках', 'Автокормушка рыбоводного понтона на плёсе',
        'Пульсация насосной станции Горводоканала', 'Медленное вращение скребка радиального отстойника',
        'Конвейер глинозёма на промплощадке', 'Технологическое свечение градирни в сумерках',
        'Работа козлового крана склада готовой продукции', 'Подсветка логотипа Технопарка ИИ ночью',
        'Перелив чистой воды на фильтрах водоподготовки', 'Рост урожайности ферм при стабильной ирригации',
      ],
    },
    {
      group: 'wildlife_fauna',
      groupLabel: 'Высотные птицы в небе и экосистема гор',
      items: [
        'Парение беркута в восходящем термике над ущельем', 'Спираль пары горных орлов над северным пиком',
        'Клин перелётных птиц высоко над хребтом', 'Кружение белых чаек над широким водохранилищем',
        'Плавный набор высоты орла в горном потоке', 'Скольжение сокола вдоль скальных щёк каньона',
        'Взмахи крыльев птиц с индивидуальной фазой', 'Плавное планирование птиц на расправленных крыльях',
        'Кружение чаек над прибрежной полосой моря', 'Высотный облёт стаи над деривационным плато',
        'Вечернее возвращение птиц к лесным склонам', 'Утренний вылет стай на рассвете над долиной',
        'Дрейф птичьего круга по направлению ветра', 'Смена высоты парения при приближении дождя',
        'Парение канюка над полями Агродолины', 'Полёт альпийских галок у снежных вершин',
        'Кружение чаек у садков построенного рыбхоза', 'Перелёт стаи над лесным массивом Североборска',
        'Синхронный вираж пары орлов над каньоном', 'Теневой силуэт крыльев на фоне светлого неба',
        'Патрулирование морских птиц над внешним заливом', 'Снижение чаек к спокойному плёсу в штиль',
        'Высотная спираль птиц в солнечный полдень', 'Затихание полётов при штормовом паводке',
        'Кружение птиц над зелёным островом дельты', 'Спокойное парение на закатных воздушных потоках',
      ],
    },
    {
      group: 'flora_wind',
      groupLabel: 'Лесной массив, поля и ветровая пластика',
      items: [
        'Покачивание верхушек сибирских елей на ветру', 'Упругий наклон корабельных сосен на хребтах',
        'Трепет крон прибрежных деревьев у кромки воды', 'Бегущая ветровая тень по травянистым лугам',
        'Изменение влажного блеска листвы после дождя', 'Штормовой изгиб крон при приходе циклона',
        'Лёгкое дыхание хвои в тихую летнюю межень', 'Плавный переход пойменных трав в речную гальку',
        'Смена оттенка влажности береговой травы у воды', 'Потемнение прибрежной гальки при накате волны',
        'Высыхание мокрого берега на полуденном солнце', 'Изумрудное насыщение полей при подаче ирригации',
        'Расчистка просеки под створ плотины и канала', 'Тени хвойных крон на освещённых склонах гор',
        'Альпийское разнотравье на субальпийских лугах', 'Моховые куртины на влажных скалах каньона',
        'Лесной пояс вдоль ручья Гремучего', 'Парковые рощи вокруг курортного Усть-Порта',
        'Защитная лесополоса вдоль террасы Агродолины', 'Контраст тёмной тайги и светлых песчаных отмелей',
        'Ветровая рябь лугов вокруг фермерских угодий', 'Мягкое рассеивание далёкого леса в краевом тумане',
        'Увлажнение почвы поймы после весеннего паводка', 'Контраст сухих южных и влажных северных склонов',
        'Хвойные куртины у коттеджей Речного Посада', 'Редколесье у нижней границы вечных снегов',
        'Плавный переход тундры в скальный гребень', 'Солнечные поляны в разреженном сосновом бору',
      ],
    },
    {
      group: 'sky_climate',
      groupLabel: 'Атмосфера, краевой туман, море и смена суток',
      items: [
        'Суточное движение солнца с востока на запад', 'Восход с тёплым золотисто-розовым светом гор',
        'Зенитное полуденное освещение высокой чёткости', 'Багряный альпийский закат на снежных пиках',
        'Синяя бархатная ночь с лунным светом', 'Дрейф объёмных кучевых облаков над долиной',
        'Бегущие мягкие тени облаков по горам и воде', 'Сгущение грозовой облачности перед паводком',
        'Дневное отступление кромки горных снежников (таяние)', 'Ночное промерзание и блеск горного ледника',
        'Косые серебристые нити дождя при циклоне', 'Густой атмосферный туман за пределами карты',
        'Бескрайняя водная гладь вокруг долины до горизонта', 'Мягкое слияние внешнего моря с небесной дымкой',
        'Ветровой снос дождевой пелены по порывам', 'Изменение цветовой температуры неба по часам',
        'Адаптивная плотность тумана под масштаб 10×10 км', 'Солнечная дорожка на внешнем море вокруг карты',
        'Кольцо объёмной дымки вдоль горизонта бассейна', 'Влажный блеск скал и крыш во время дождя',
        'Быстрое прояснение неба после прохождения фронта', 'Сухой золотистый зной в период летней межени',
        'Холодные синие тени в северных цирках ледников', 'Мягкое рассеянное освещение пасмурного дня',
        'Динамический теневой каскад за фокусом камеры', 'Плавное погружение краёв рельефа в воду и туман',
        'Снежная кромка на самых высоких пиках долины', 'Утренняя дымка над водной гладью водохранилища',
      ],
    },
    {
      group: 'urban_life',
      groupLabel: 'Рост 8 городов и 32 архитектурных типов',
      items: [
        'Пружинный подъём новостройки из фундамента', 'Поэтапное зажигание окон жилых башен в 19:00',
        'Плавное гашение части окон после полуночи', 'Утреннее пробуждение кварталов перед рассветом',
        'Мгновенное притухание квартала при дефиците МВт', 'Яркая вспышка иллюминации при пуске новой ЛЭП',
        'Тёплый свет мансард альпийских шале', 'Холодный офисный свет стеклянных небоскрёбов',
        'Вечерняя подсветка отелей Усть-Порта', 'Огни общественного центра Светлограда вечером',
        'Подсветка купола обсерватории и ратуши', 'Огни портовых складов и терминалов гавани',
        'Уплотнение застройки при росте энергоснабжения', 'Высотная доминанта в ядре мегаполиса',
        'Световая индикация больницы и экстренных служб', 'Кольцевая планировка кварталов вокруг площади',
        'Праздничная иллюминация при взятии вехи развития', 'Ночной силуэт небоскрёбов на фоне тумана',
        'Предупреждающая индикация при подтоплении низин', 'Рост тепличных рядов при приходе воды в канал',
        'Развитие прибрежных кварталов Усть-Порта', 'Запуск новых цехов Алюмграда от чистой ГЭС',
        'Расширение кампуса Технопарка ИИ на плато', 'Стабильное питание городских водоканалов',
        'Шпили и купола общественных зданий', 'Террасные фасады современных жилых комплексов',
        'Диспетчерская телеметрия энергопотребления городов', 'Сбалансированный рост всех 8 центров бассейна',
      ],
    },
  ];

  const registry = [];
  let idx = 1;
  for (let gIdx = 0; gIdx < groups.length; gIdx++) {
    const g = groups[gIdx];
    for (let i = 0; i < g.items.length; i++) {
      registry.push({
        id: idx,
        code: `${g.group}_${String(i + 1).padStart(2, '0')}`,
        group: g.group,
        groupLabel: g.groupLabel,
        title: g.items[i],
        freqHz: +(0.08 + ((idx * 17) % 45) * 0.055).toFixed(3),
        phaseOffset: +(((idx * 1.6180339) % 1) * Math.PI * 2).toFixed(3),
      });
      idx++;
    }
  }
  return registry;
}

export const ANIMATION_REGISTRY = buildAnimationRegistry300();

export class LivingWorldSystem {
  constructor(scene, hydro, economy, textures) {
    this.scene = scene;
    this.hydro = hydro;
    this.economy = economy;
    this.textures = textures;
    this.group = new THREE.Group();
    this.scene.add(this.group);

    this._dummy = new THREE.Object3D();
    this._time = 0;

    this.cityCars = [];
    this.windTurbines = [];
    this.solarTrackers = [];
    this.steamPuffs = [];
    this.birds = [];
    this.clouds = [];

    this._buildInstancedBatches();
    this.rebuildWorldActors();
  }

  _buildInstancedBatches() {
    // 1. Аккуратный внутриквартальный транспорт ТОЛЬКО внутри ровных площадей городов (никаких поездок по горам!)
    this.maxVehicles = 32;
    const vehGeo = new THREE.BoxGeometry(1, 1, 1);
    const vehMat = new THREE.MeshStandardMaterial({ roughness: 0.45, metalness: 0.30 });
    this.vehicleIM = new THREE.InstancedMesh(vehGeo, vehMat, this.maxVehicles);
    this.vehicleIM.castShadow = false;
    this.vehicleIM.frustumCulled = false;

    const headlightGeo = new THREE.BoxGeometry(0.85, 0.30, 0.16);
    this.headlightMat = new THREE.MeshBasicMaterial({ color: 0xfff3c4 });
    this.headlightIM = new THREE.InstancedMesh(headlightGeo, this.headlightMat, this.maxVehicles);
    this.headlightIM.frustumCulled = false;

    // 2. Ветрогенераторы ВЭС на хребтах (мачты + вращающиеся 3-лопастные роторы = 2 draw calls)
    this.maxWind = 24;
    const towerGeo = new THREE.CylinderGeometry(0.32, 0.68, 1.0, 8);
    towerGeo.translate(0, 0.5, 0);
    const towerMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.38, metalness: 0.28 });
    this.windTowerIM = new THREE.InstancedMesh(towerGeo, towerMat, this.maxWind);
    this.windTowerIM.castShadow = true;
    this.windTowerIM.frustumCulled = false;

    const blade1 = new THREE.BoxGeometry(0.14, 1.0, 0.04);
    blade1.translate(0, 0.5, 0);
    const bladeGeo = new THREE.BufferGeometry();
    const posArr = [];
    const normArr = [];
    const basePos = blade1.attributes.position;
    const baseNorm = blade1.attributes.normal;
    const baseIdx = blade1.index;
    const vTmp = new THREE.Vector3();
    const nTmp = new THREE.Vector3();
    for (let b = 0; b < 3; b++) {
      const ang = (b * Math.PI * 2) / 3;
      const ca = Math.cos(ang);
      const sa = Math.sin(ang);
      for (let k = 0; k < baseIdx.count; k++) {
        const vi = baseIdx.getX(k);
        vTmp.fromBufferAttribute(basePos, vi);
        nTmp.fromBufferAttribute(baseNorm, vi);
        posArr.push(vTmp.x * ca - vTmp.y * sa, vTmp.x * sa + vTmp.y * ca, vTmp.z);
        normArr.push(nTmp.x * ca - nTmp.y * sa, nTmp.x * sa + nTmp.y * ca, nTmp.z);
      }
    }
    bladeGeo.setAttribute('position', new THREE.Float32BufferAttribute(posArr, 3));
    bladeGeo.setAttribute('normal', new THREE.Float32BufferAttribute(normArr, 3));
    blade1.dispose();
    this.windRotorIM = new THREE.InstancedMesh(bladeGeo, towerMat, this.maxWind);
    this.windRotorIM.castShadow = true;
    this.windRotorIM.frustumCulled = false;

    // 3. Солнечные трекеры СЭС у Технопарка ИИ
    this.maxSolar = 36;
    const panelGeo = new THREE.BoxGeometry(1.0, 0.08, 0.68);
    const panelMat = new THREE.MeshStandardMaterial({
      color: 0x1d4ed8,
      roughness: 0.22,
      metalness: 0.72,
      emissive: 0x0b1f4d,
      emissiveIntensity: 0.25,
    });
    this.solarIM = new THREE.InstancedMesh(panelGeo, panelMat, this.maxSolar);
    this.solarIM.frustumCulled = false;

    // 4. Клубящийся пар градирен промзон
    this.maxPuffs = 64;
    const puffGeo = new THREE.IcosahedronGeometry(0.65, 1);
    this.puffMat = new THREE.MeshLambertMaterial({
      color: 0xf1f5f9,
      transparent: true,
      opacity: 0.42,
      depthWrite: false,
    });
    this.puffIM = new THREE.InstancedMesh(puffGeo, this.puffMat, this.maxPuffs);
    this.puffIM.frustumCulled = false;

    // 5. Парящие высоко в небе орлы и чайки
    this.maxBirds = 48;
    const wingGeo = new THREE.ConeGeometry(0.55, 0.22, 3);
    wingGeo.scale(2.4, 0.25, 0.85);
    const birdMat = new THREE.MeshLambertMaterial({ color: 0xf8fafc });
    this.birdIM = new THREE.InstancedMesh(wingGeo, birdMat, this.maxBirds);
    this.birdIM.frustumCulled = false;

    // 6. Объёмные кучевые облака высоко в атмосфере
    this.maxClouds = 34;
    const cloudGeo = new THREE.DodecahedronGeometry(1.0, 1);
    cloudGeo.scale(1.9, 0.48, 1.25);
    this.cloudMat = new THREE.MeshLambertMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.66,
      depthWrite: false,
    });
    this.cloudIM = new THREE.InstancedMesh(cloudGeo, this.cloudMat, this.maxClouds);
    this.cloudIM.frustumCulled = false;

    this.group.add(
      this.vehicleIM,
      this.headlightIM,
      this.windTowerIM,
      this.windRotorIM,
      this.solarIM,
      this.puffIM,
      this.birdIM,
      this.cloudIM,
    );
  }

  /** Пересоздаёт природные и городские объекты при смене карты или масштаба */
  rebuildWorldActors() {
    const rng = makeRng(202603);
    const hs = WORLD.horizScale;
    const es = WORLD.elevScale;
    const propScale = Math.pow(hs, 0.58);
    const rivers = getScaledValleyRivers(this.hydro.presetId);
    const mainSpine = rivers.main;

    // 1. Небольшой внутригородской транспорт СТРОГО по внутренним кольцевым бульварам самих городов!
    this.cityCars = [];
    for (let i = 0; i < this.maxVehicles; i++) {
      const city = CITY_DEFS[i % CITY_DEFS.length];
      if (!city) continue;
      const ringRadius = city.plateauRadius * (0.34 + (i % 2) * 0.20);
      const shade = pickCatalogShade('fleet_machinery', i * 3 + 7);
      this.cityCars.push({
        cx: city.x,
        cz: city.z,
        ringR: ringRadius,
        angle: rng() * Math.PI * 2,
        omega: (0.22 + rng() * 0.14) * (i % 2 === 0 ? 1 : -1),
        sx: 1.55 * propScale,
        sy: 1.10 * propScale,
        sz: 3.10 * propScale,
        color: new THREE.Color(shade.r, shade.g, shade.b),
      });
    }

    // 2. Ветропарк ВЭС на высоких продуваемых гребнях долины
    this.windTurbines = [];
    for (let i = 0; i < this.maxWind; i++) {
      const side = (i % 2 === 0) ? -1 : 1;
      const wx = side * (225 + (i % 6) * 22 + rng() * 12) * hs;
      const wz = (-285 + Math.floor(i / 2) * 46 + rng() * 14) * hs;
      if (Math.abs(wx) > WORLD.half * 0.92 || Math.abs(wz) > WORLD.half * 0.92) continue;
      const s = this.hydro.sampleAtWorld(wx, wz);
      if (s.depth > 0.2) continue;
      const towerH = (22 + (i % 3) * 4) * propScale;
      this.windTurbines.push({
        wx,
        wy: s.bed,
        wz,
        towerH,
        bladeLen: towerH * 0.46,
        yaw: 0.35 + Math.sin(i) * 0.22,
        phase: rng() * Math.PI * 2,
        speedMult: 0.85 + rng() * 0.35,
      });
    }
    this.windTowerIM.count = this.windTurbines.length;
    this.windRotorIM.count = this.windTurbines.length;
    for (let i = 0; i < this.windTurbines.length; i++) {
      const wt = this.windTurbines[i];
      this._dummy.position.set(wt.wx, wt.wy, wt.wz);
      this._dummy.rotation.set(0, wt.yaw, 0);
      this._dummy.scale.set(propScale * 1.1, wt.towerH, propScale * 1.1);
      this._dummy.updateMatrix();
      this.windTowerIM.setMatrixAt(i, this._dummy.matrix);
    }
    this.windTowerIM.instanceMatrix.needsUpdate = true;

    // 3. Солнечный парк СЭС на южных террасах у Технопарка ИИ
    this.solarTrackers = [];
    const techCity = CITY_DEFS.find((c) => c.archetype === 'tech') || CITY_DEFS[0];
    for (let i = 0; i < this.maxSolar; i++) {
      const row = Math.floor(i / 6);
      const col = i % 6;
      const wx = techCity.x + (col - 2.5) * 9.5 * propScale + 42 * hs;
      const wz = techCity.z + (row - 2.5) * 8.5 * propScale + 36 * hs;
      if (Math.abs(wx) > WORLD.half * 0.91 || Math.abs(wz) > WORLD.half * 0.91) continue;
      const s = this.hydro.sampleAtWorld(wx, wz);
      if (s.depth > 0.2) continue;
      this.solarTrackers.push({
        wx,
        wy: s.bed + 1.4 * propScale,
        wz,
        scale: 5.2 * propScale,
      });
    }
    this.solarIM.count = this.solarTrackers.length;

    // 4. Клубы пара над промзонами (Алюмград / Каменногорск)
    this.steamPuffs = [];
    const indCities = CITY_DEFS.filter((c) => c.archetype === 'industrial' || c.archetype === 'smelter');
    for (let i = 0; i < this.maxPuffs; i++) {
      const src = indCities[i % Math.max(1, indCities.length)] || CITY_DEFS[0];
      const offAngle = (i * 2.39996) % (Math.PI * 2);
      const offR = (8 + (i % 5) * 7) * hs;
      const wx = src.x + Math.cos(offAngle) * offR;
      const wz = src.z + Math.sin(offAngle) * offR;
      const s = this.hydro.sampleAtWorld(wx, wz);
      this.steamPuffs.push({
        baseX: wx,
        baseY: s.bed + 10 * Math.pow(es, 0.78),
        baseZ: wz,
        phase: (i / this.maxPuffs + rng() * 0.2) % 1.0,
        speed: 0.14 + rng() * 0.10,
        size: (3.0 + rng() * 2.2) * propScale,
      });
    }
    this.puffIM.count = this.steamPuffs.length;

    // 5. Парящие высоко в небе орлы и чайки
    this.birds = [];
    for (let i = 0; i < this.maxBirds; i++) {
      const isEagle = i < 18;
      const spinePt = mainSpine[i % mainSpine.length];
      this.birds.push({
        cx: spinePt.x + (rng() - 0.5) * 180 * hs,
        cz: spinePt.z + (rng() - 0.5) * 180 * hs,
        alt: (isEagle ? 105 : 48) * es + rng() * 26 * es,
        orbitR: (isEagle ? 62 : 32) * hs * (0.65 + rng() * 0.7),
        omega: (isEagle ? 0.20 : 0.40) * (i % 2 === 0 ? 1 : -1),
        phase: rng() * Math.PI * 2,
        flapFreq: isEagle ? 3.0 : 7.2,
        scale: (isEagle ? 2.2 : 1.25) * propScale,
        color: isEagle ? new THREE.Color(0x5c4033) : new THREE.Color(0xf8fafc),
      });
      this.birdIM.setColorAt(i, this.birds[i].color);
    }
    this.birdIM.count = this.birds.length;
    if (this.birdIM.instanceColor) this.birdIM.instanceColor.needsUpdate = true;

    // 6. Кучевые облака высоко в небе
    this.clouds = [];
    for (let i = 0; i < this.maxClouds; i++) {
      this.clouds.push({
        wx: (rng() - 0.5) * WORLD.size * 1.2,
        wy: (168 + rng() * 55) * es,
        wz: (rng() - 0.5) * WORLD.size * 1.2,
        sx: (38 + rng() * 34) * hs,
        sy: (11 + rng() * 8) * es,
        sz: (28 + rng() * 26) * hs,
        drift: 0.75 + rng() * 0.55,
      });
    }
    this.cloudIM.count = this.clouds.length;
  }

  update(dt, hourOfDay, sunFactor) {
    this._time += dt;
    const t = this._time;
    const hs = WORLD.horizScale;
    const propScale = Math.pow(hs, 0.58);
    const windMult = this.economy.weatherId === 'flood' ? 2.1 : (this.economy.weatherId === 'rain' ? 1.5 : 1.0);
    const isNight = sunFactor < 0.26;

    // 1. Внутригородское движение строго по ровным кольцевым проспектам внутри самих городов!
    let vehOut = 0;
    let lightOut = 0;
    for (let i = 0; i < this.cityCars.length; i++) {
      const c = this.cityCars[i];
      c.angle = (c.angle + c.omega * dt) % (Math.PI * 2);
      const wx = c.cx + Math.cos(c.angle) * c.ringR;
      const wz = c.cz + Math.sin(c.angle) * c.ringR;
      if (Math.abs(wx) > WORLD.half * 0.94 || Math.abs(wz) > WORLD.half * 0.94) continue;

      const samp = this.hydro.sampleAtWorld(wx, wz);
      // Если точка влажная или на крутом склоне — пропускаем, никогда не выезжаем в воду или горы!
      if (samp.depth > 0.08) continue;

      const tangentYaw = Math.atan2(
        -Math.sin(c.angle) * Math.sign(c.omega),
        Math.cos(c.angle) * Math.sign(c.omega),
      );
      const roadY = samp.bed + c.sy * 0.52;

      this._dummy.position.set(wx, roadY, wz);
      this._dummy.rotation.set(0, tangentYaw, 0);
      this._dummy.scale.set(c.sx, c.sy, c.sz);
      this._dummy.updateMatrix();
      this.vehicleIM.setMatrixAt(vehOut, this._dummy.matrix);
      this.vehicleIM.setColorAt(vehOut, c.color);
      vehOut++;

      if (isNight) {
        this._dummy.position.set(
          wx + Math.sin(tangentYaw) * c.sz * 0.54,
          roadY,
          wz + Math.cos(tangentYaw) * c.sz * 0.54,
        );
        this._dummy.rotation.set(0, tangentYaw, 0);
        this._dummy.scale.set(c.sx * 0.8, c.sy * 0.35, 0.35 * propScale);
        this._dummy.updateMatrix();
        this.headlightIM.setMatrixAt(lightOut++, this._dummy.matrix);
      }
    }
    this.vehicleIM.count = vehOut;
    this.headlightIM.count = lightOut;
    this.vehicleIM.instanceMatrix.needsUpdate = true;
    if (this.vehicleIM.instanceColor) this.vehicleIM.instanceColor.needsUpdate = true;
    if (lightOut > 0) this.headlightIM.instanceMatrix.needsUpdate = true;

    // 2. Вращение 3-лопастных ветрогенераторов ВЭС на горных хребтах
    for (let i = 0; i < this.windTurbines.length; i++) {
      const wt = this.windTurbines[i];
      wt.phase = (wt.phase + dt * 1.9 * wt.speedMult * windMult) % (Math.PI * 2);
      this._dummy.position.set(
        wt.wx + Math.sin(wt.yaw) * 0.5 * propScale,
        wt.wy + wt.towerH,
        wt.wz + Math.cos(wt.yaw) * 0.5 * propScale,
      );
      this._dummy.rotation.set(0, wt.yaw, wt.phase);
      this._dummy.scale.set(wt.bladeLen, wt.bladeLen, wt.bladeLen);
      this._dummy.updateMatrix();
      this.windRotorIM.setMatrixAt(i, this._dummy.matrix);
    }
    if (this.windTurbines.length > 0) this.windRotorIM.instanceMatrix.needsUpdate = true;

    // 3. Слежение солнечных трекеров СЭС за положением солнца
    const solarTilt = sunFactor > 0.05 ? clamp((hourOfDay - 12.5) * 0.11, -0.75, 0.75) : 0.0;
    const solarPitch = sunFactor > 0.05 ? 0.42 : 0.05;
    for (let i = 0; i < this.solarTrackers.length; i++) {
      const st = this.solarTrackers[i];
      this._dummy.position.set(st.wx, st.wy, st.wz);
      this._dummy.rotation.set(solarPitch, 0.15, solarTilt);
      this._dummy.scale.set(st.scale, st.scale, st.scale);
      this._dummy.updateMatrix();
      this.solarIM.setMatrixAt(i, this._dummy.matrix);
    }
    if (this.solarTrackers.length > 0) this.solarIM.instanceMatrix.needsUpdate = true;

    // 4. Подъём пара градирен промзон
    for (let i = 0; i < this.steamPuffs.length; i++) {
      const p = this.steamPuffs[i];
      p.phase = (p.phase + dt * p.speed) % 1.0;
      const life = p.phase;
      const rise = life * 26 * propScale;
      const driftX = life * 14 * propScale * windMult;
      const grow = p.size * (0.55 + life * 1.65) * (1.0 - life * 0.35);
      this._dummy.position.set(p.baseX + driftX, p.baseY + rise, p.baseZ + life * 5 * propScale);
      this._dummy.rotation.set(life * 2.0, life * 1.5, 0);
      this._dummy.scale.set(grow, grow * 0.82, grow);
      this._dummy.updateMatrix();
      this.puffIM.setMatrixAt(i, this._dummy.matrix);
    }
    this.puffIM.instanceMatrix.needsUpdate = true;

    // 5. Кружащие стаи орлов и чаек высоко в небе
    for (let i = 0; i < this.birds.length; i++) {
      const b = this.birds[i];
      const ang = t * b.omega + b.phase;
      const bx = b.cx + Math.cos(ang) * b.orbitR;
      const bz = b.cz + Math.sin(ang) * b.orbitR * 0.78;
      const flap = Math.sin(t * b.flapFreq + b.phase);
      const by = b.alt + Math.sin(ang * 2.0) * 3.5 * WORLD.elevScale + flap * 0.25;
      const heading = ang + (b.omega > 0 ? Math.PI * 0.5 : -Math.PI * 0.5);
      this._dummy.position.set(bx, by, bz);
      this._dummy.rotation.set(0.08 * flap, -heading, 0.28 * Math.sign(b.omega));
      this._dummy.scale.set(b.scale, b.scale * (0.65 + 0.55 * Math.abs(flap)), b.scale);
      this._dummy.updateMatrix();
      this.birdIM.setMatrixAt(i, this._dummy.matrix);
    }
    this.birdIM.instanceMatrix.needsUpdate = true;

    // 6. Плавный дрейф кучевых облаков
    const cloudSpan = WORLD.size * 1.25;
    this.cloudMat.opacity = this.economy.weatherId === 'flood' ? 0.85 : (isNight ? 0.34 : 0.66);
    const cBright = isNight ? 0.28 : (this.economy.weatherId === 'flood' ? 0.58 : 0.98);
    this.cloudMat.color.setRGB(cBright, cBright * 1.01, cBright * 1.05);
    for (let i = 0; i < this.clouds.length; i++) {
      const cl = this.clouds[i];
      cl.wx += dt * 4.2 * hs * cl.drift * windMult * 0.32;
      if (cl.wx > cloudSpan * 0.5) cl.wx -= cloudSpan;
      this._dummy.position.set(cl.wx, cl.wy, cl.wz);
      this._dummy.rotation.set(0, i * 0.7, 0);
      this._dummy.scale.set(cl.sx, cl.sy, cl.sz);
      this._dummy.updateMatrix();
      this.cloudIM.setMatrixAt(i, this._dummy.matrix);
    }
    this.cloudIM.instanceMatrix.needsUpdate = true;
  }

  getActiveStats() {
    return {
      totalRegisteredAnimations: ANIMATION_REGISTRY.length,
      vehiclesActive: this.vehicleIM.count,
      windTurbines: this.windTurbines.length,
      solarTrackers: this.solarTrackers.length,
      birdsActive: this.birdIM.count,
    };
  }
}
