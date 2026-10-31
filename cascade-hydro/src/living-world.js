// ============================================================================
//  ЖИВОЙ МИР ДОЛИНЫ И КАТАЛОГ ИЗ 300 АНИМАЦИЙ (src/living-world.js)
//  Сверхоптимизированный батчинг InstancedMesh (~11 draw calls на сотни объектов!):
//  - Речной флот (сухогрузы, танкеры, баржи, круизные лайнеры, парусные яхты, катера)
//  - Стройтехника и логистика (экскаваторы, самосвалы БелАЗ, миксеры, поезда, автотрафик)
//  - ВИЭ и промышленность (вращающиеся ветряки ВЭС, солнечные трекеры СЭС, пар градирен, маяк)
//  - Живая природа (парящие орлы и чайки, косяки форели, кучевые облака, дождевалки полей)
// ============================================================================

import * as THREE from 'three';
import { WORLD, CITY_DEFS } from './config.js';
import { getScaledValleyRivers } from './valley.js';
import { clamp, lerp, makeRng } from './noise.js';
import { pickCatalogShade } from './textures.js';

/**
 * Генерирует полный реестр из 300 уникальных параметризованных анимаций игры
 * (11 подсистем × 24..32 пресета движения, частот, фаз и амплитуд)
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
        'Ночной обратный водоворот всасывания ГАЭС', 'Радужная водяная пыль у основания водопада',
        'Размыв грунтовой перемычки паводком', 'Оседание илистого шлейфа в тихом заливе',
        'Блик дорожки солнца по законам Френеля', 'Лунная серебристая дорожка на воде ночью',
        'Волновое качание поверхности при ливне', 'Круги от капель штормового дождя',
        'Пульсация родникового ключа в верховье Быстрицы', 'Талый поток ледникового ручья Серебрянки',
        'Стремительный слив горного ручья Гремучего', 'Подъём зеркала верхнего бьефа при наполнении',
        'Сработка зеркала бьефа в вечерний пик', 'Фильтрационные струйки под нецементированной дамбой',
        'Наполнение оросительного канала Агродолины', 'Свободный накат устья реки в южный залив',
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
      group: 'fleet_locks',
      groupLabel: 'Речной флот, яхты и судоходные шлюзы',
      items: [
        'Рейс рудовоза «Енисей» по главному фарватеру', 'Ход нефтеналивного танкера в Южную Гавань',
        'Буксир-толкач с баржей гранитного щебня', 'Белоснежный круизный теплоход по водохранилищу',
        'Парусная регата яхт у Лазурного Берега (галс левый)', 'Парусная регата яхт (галс правый с креном)',
        'Скоростной катер гидрологической инспекции', 'Рыболовный сейнер у садков форелевого хозяйства',
        'Самоходная зерновая баржа из Агродолины', 'Паромная переправа между берегами плёса',
        'Бортовая качка сухогруза на волне', 'Килевая качка катера на быстротоке',
        'Растворение верхних двустворчатых ворот шлюза', 'Растворение нижних ворот судоходного шлюза',
        'Подъём зеркала воды в камере шлюза с судном', 'Спуск воды из камеры шлюза в нижний бьеф',
        'Светофор шлюзования (красный / зелёный створ)', 'Пенный бурун за кормовым винтом сухогруза',
        'Усы носовой волны круизного лайнера', 'Покачивание швартовых понтонов яхт-марины',
        'Вращение судового навигационного радара', 'Топовые и бортовые огни судов ночью',
        'Плавучий земснаряд углубления судового хода', 'Качание красных и белых бакенов фарватера',
        'Буксировка плавучего крана к створу стройки', 'Выгрузка контейнеров в порту Южная Гавань',
        'Прогулочный катамаран у курортной набережной', 'Лодка эколога-гидробиолога в заливе',
      ],
    },
    {
      group: 'construction_mining',
      groupLabel: 'Строительная техника, краны и карьеры',
      items: [
        'Поворот стрелы башенного крана КБ-504 (левый)', 'Поворот стрелы башенного крана КБ-504 (правый)',
        'Перемещение грузовой каретки по стреле крана', 'Спуск бадьи с гидротехническим бетоном в блок',
        'Послойный рост монолитной секции плотины', 'Монтаж стального шпунта перемычки Ларсена',
        'Сборка арматурного пространственного каркаса', 'Снятие щитовой опалубки со зрелого бетона',
        'Цикл копки гусеничного экскаватора в канале', 'Поворот платформы экскаватора на погрузку',
        'Рейс карьерного самосвала БелАЗ с породой', 'Подъём кузова самосвала на отвале щебня',
        'Вращение груши автобетоносмесителя на подъезде', 'Подача смеси стрелой автобетононасоса',
        'Планировка земляной дамбы отвалом бульдозера', 'Виброкаток на укатке ядра грунтовой плотины',
        'Буровой станок цементационной завесы скалы', 'Дробильно-сортировочный грохот гранитного щебня',
        'Ленточный конвейер подачи заполнителя БСУ', 'Пар и пыль бетоносмесительного узла',
        'Оранжевые проблесковые маячки колонны спецтехники', 'Прожекторы ночной смены на стройплощадке ГЭС',
        'Инъекция цементного молока в трещины основания', 'Укладка железобетонных плит облицовки канала',
        'Работа водоотливной помпы в котловане машзала', 'Геодезический лазерный створ на береговом устое',
      ],
    },
    {
      group: 'rail_road_traffic',
      groupLabel: 'Поезда и автомобильное движение долины',
      items: [
        'Грузовой электровоз с алюминием из Алюмграда', 'Железнодорожный состав с хопперами зерна',
        'Скоростной пассажирский экспресс «Каскад»', 'Маневровый тепловоз в порту Южная Гавань',
        'Поток легковых автомобилей по набережной Стрелки', 'Грузовики-щебневозы на горном серпантине',
        'Автоцистерны и фургоны снабжения Технопарка', 'Рейсовые электробусы между городами долины',
        'Тракторы с прицепами вдоль полей Агродолины', 'Аварийная бригада электросетей на трассе ЛЭП',
        'Зажигание ближнего света фар автотрафика в сумерках', 'Красные стоп-сигналы колонны на подъёмах',
        'Переездной семафор у железнодорожной ветки', 'Движение автоколонны по гребню построенной плотины',
        'Контейнеровозы у складских терминалов гавани', 'Спецмашина инспекции плотин гидроузла',
        'Туристические автобусы в Лазурный Берег', 'Лесовозы на северной таёжной дороге',
        'Мигание указателей на транспортных развязках', 'Отражение фар машин на мокром асфальте в дождь',
        'Тепловой след локомотива на холодном перевале', 'Плавное торможение поезда у станции Мегаполиса',
        'Разгон экспресса на прямом участке долины', 'Встречный разъезд составов на двухпутке',
        'Работа портового автопогрузчика на причале', 'Патрульная машина МЧС в паводковый сезон',
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
        'Блик солнечного зайчика на кремниевых ячейках СЭС', 'Круговое вращение луча портового маяка ночью',
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
        'Круговое движение дождевалки «Фрегат» на поле №1', 'Круговое движение дождевалки «Фрегат» на поле №2',
        'Веер распыла воды оросительной пушки Агродолины', 'Подъём нории зернового элеватора на погрузке',
        'Тёплое фито-свечение тепличного комплекса ночью', 'Открытие фрамуг проветривания теплиц в полдень',
        'Ход портального крана «Альбатрос» в Южной Гавани', 'Поворот стрелы портового перегружателя с грузом',
        'Вращение аэраторов воды в форелевых садках', 'Автокормушка рыбоводного понтона на плёсе',
        'Пульсация насосной станции Горводоканала', 'Медленное вращение скребка радиального отстойника',
        'Конвейер отгрузки глинозёма на промплощадке', 'Факел дожига технологического газа промзоны',
        'Работа козлового крана склада готовой продукции', 'Подсветка логотипа Технопарка ИИ ночью',
        'Перелив чистой воды на фильтрах водоподготовки', 'Швартовка баржи у причальной стенки элеватора',
      ],
    },
    {
      group: 'wildlife_fauna',
      groupLabel: 'Птицы в небе и рыба в реках/водохранилище',
      items: [
        'Парение беркута в восходящем термике над ущельем', 'Спираль пары горных орлов над северным пиком',
        'Клин перелётных уток вдоль русла Быстрицы', 'Кружение стаи белых чаек над водохранилищем',
        'Пикирование чайки к воде у нижнего бьефа ГЭС', 'Стремительный полёт ласточек вдоль гребня плотины',
        'Взмахи крыльев птиц с индивидуальной фазой', 'Плавное планирование птиц на расправленных крыльях',
        'Косяк радужной форели в чистом садке рыбхоза', 'Выпрыгивание лосося над водой с брызгами',
        'Ход проходной рыбы к рыбоходу гидроузла', 'Кружение мальков на прогретом солнечном мелководье',
        'Уход косяка рыбы на глубину в полуденный зной', 'Вечерний жор рыбы с кругами на тихой глади',
        'Стая белых цапель у камышовых заводей Агродолины', 'Полёт коршуна над золотистыми полями пшеницы',
        'Скопление чаек за кормой рыболовного сейнера', 'Перелёт стаи скворцов между рощами долины',
        'Плавное смещение центра птичьих стай по ветру', 'Отражение силуэтов птиц в зеркальной воде штиля',
        'Движение осетровых у придонных галечников', 'Всплеск крупного тайменя в горном перекате',
        'Утренний вылет птиц с лесных террас на рассвете', 'Возвращение стай на ночёвку в хвойный бор',
        'Патрулирование бакланов у причалов Южной Гавани', 'Игра дельфинов/тюленей на морской кромке устья',
      ],
    },
    {
      group: 'flora_wind',
      groupLabel: 'Лесной массив, поля и ветровая пластика',
      items: [
        'Покачивание верхушек сибирских елей на ветру', 'Упругий наклон корабельных сосен на хребтах',
        'Трепет крон прибрежных ив у кромки воды', 'Бегущая ветровая волна по пшеничным полям',
        'Синхронный поворот шляпок подсолнухов за солнцем', 'Штормовой изгиб леса при приходе циклона',
        'Лёгкое дыхание хвои в тихую летнюю межень', 'Колыхание камыша и рогоза на отмелях залива',
        'Смена оттенка влажности береговой травы у воды', 'Потемнение прибрежной гальки при накате волны',
        'Высыхание мокрого берега на полуденном солнце', 'Изумрудное озеленение полей при подаче ирригации',
        'Плавный рост молодых деревьев вокруг эко-посёлков', 'Тени качающихся крон на травянистых склонах',
        'Альпийское разнотравье на субальпийских лугах', 'Моховые куртины на влажных скалах каньона',
        'Кустарниковый пояс вдоль ручья Гремучего', 'Парковая аллея вдоль набережной Лазурного Берега',
        'Защитная лесополоса вдоль полей Агродолины', 'Отражение зелёного бора в изумрудной глади заводи',
        'Ветровая рябь клеверных лугов у ферм', 'Серебристый отлив оливковых/ивовых рощ на порыве',
        'Увлажнение почвы поймы после весеннего паводка', 'Контраст сухих южных и влажных северных склонов',
        'Садовые деревья у коттеджей посёлка Речной', 'Кедровый стланик у нижней границы снегов',
        'Плавный переход тундры в скальный гребень', 'Солнечные поляны в разреженном сосновом лесу',
      ],
    },
    {
      group: 'sky_climate',
      groupLabel: 'Атмосфера, облака, ледники и смена суток',
      items: [
        'Суточное движение солнца с востока на запад', 'Восход с тёплым золотисто-розовым светом гор',
        'Зенитное полуденное освещение высокой чёткости', 'Багряный альпийский закат на снежных пиках',
        'Синяя бархатная ночь с лунным светом', 'Дрейф объёмных кучевых облаков над долиной',
        'Бегущие мягкие тени облаков по горам и воде', 'Сгущение грозовой облачности перед паводком',
        'Дневное отступление кромки горных снежников (таяние)', 'Ночное промерзание и кристаллический блеск ледника',
        'Косые серебристые нити дождя при циклоне', 'Усиление атмосферной перспективы и дымки вдали',
        'Утренний туман в глубоком ущелье Быстрицы', 'Рассеивание тумана первыми лучами солнца',
        'Ветровой снос дождевой пелены по порывам', 'Изменение цветовой температуры неба по часам',
        'Адаптивная плотность тумана под масштаб 10×10 км', 'Мерцание ярких звёзд на ночном небосводе',
        'Ореол солнечной короны над гребнем хребта', 'Влажный блеск скал и крыш во время дождя',
        'Быстрое прояснение неба после прохождения фронта', 'Сухой золотистый зной в период летней межени',
        'Холодные синие тени в северных цирках ледников', 'Мягкое рассеянное освещение пасмурного дня',
        'Динамический теневой каскад за фокусом камеры', 'Плавная адаптация экспозиции ACES Filmic',
        'Снежная позёмка на самых высоких пиках >300 м', 'Термическая дымка над прогретым плато мегаполиса',
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
        'Неоновая подсветка отелей Лазурного Берега', 'Прожекторы чаши городского стадиона вечером',
        'Подсветка купола обсерватории и ратуши', 'Огни портовых складов и терминалов гавани',
        'Реконструкция коттеджа в многоэтажный дом', 'Надстройка высотной доминанты в центре Стрелки',
        'Световая индикация больницы и экстренных служб', 'Уличные фонари вдоль главных проспектов городов',
        'Праздничная иллюминация при взятии вехи развития', 'Отражение ночных огней города в речном плёсе',
        'Предупреждающая пульсация при подтоплении низин', 'Рост тепличных рядов при приходе воды в канал',
        'Оживление яхтенных причалов у курортного города', 'Запуск новых цехов Алюмграда от чистой ГЭС',
        'Расширение кампуса Технопарка ИИ на плато', 'Гудение трансформаторных будок микрорайонов',
        'Флюгеры и шпили на крышах исторического центра', 'Зелёные крыши и террасы современных ЖК',
        'Световые табло диспетчерской гидрокаскада', 'Панорамный лифт на смотровой башне мегаполиса',
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
    this._color = new THREE.Color();
    this._time = 0;

    this.ships = [];
    this.vehicles = [];
    this.windTurbines = [];
    this.solarTrackers = [];
    this.steamPuffs = [];
    this.sprinklers = [];
    this.birds = [];
    this.fishes = [];
    this.clouds = [];

    this._buildInstancedBatches();
    this.rebuildWorldActors();
  }

  _buildInstancedBatches() {
    // 1. Корпуса кораблей, барж, танкеров и яхт (до 56 судов в 1 draw call!)
    this.maxShips = 56;
    const hullGeo = new THREE.BoxGeometry(1, 1, 1);
    const hullMat = new THREE.MeshStandardMaterial({ roughness: 0.46, metalness: 0.25 });
    this.shipHullIM = new THREE.InstancedMesh(hullGeo, hullMat, this.maxShips);
    this.shipHullIM.castShadow = true;
    this.shipHullIM.frustumCulled = false;

    const superGeo = new THREE.ConeGeometry(0.55, 1.0, 4);
    const superMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.35, metalness: 0.1 });
    this.shipSuperIM = new THREE.InstancedMesh(superGeo, superMat, this.maxShips);
    this.shipSuperIM.frustumCulled = false;

    // 2. Поезда, автомобили, самосвалы БелАЗ и экскаваторы (до 96 единиц в 1 draw call!)
    this.maxVehicles = 96;
    const vehGeo = new THREE.BoxGeometry(1, 1, 1);
    const vehMat = new THREE.MeshStandardMaterial({ roughness: 0.42, metalness: 0.32 });
    this.vehicleIM = new THREE.InstancedMesh(vehGeo, vehMat, this.maxVehicles);
    this.vehicleIM.castShadow = true;
    this.vehicleIM.frustumCulled = false;

    // Свет фар автотрафика и поездов ночью
    const headlightGeo = new THREE.BoxGeometry(0.92, 0.35, 0.18);
    this.headlightMat = new THREE.MeshBasicMaterial({ color: 0xfff3c4 });
    this.headlightIM = new THREE.InstancedMesh(headlightGeo, this.headlightMat, this.maxVehicles);
    this.headlightIM.frustumCulled = false;

    // 3. Ветрогенераторы ВЭС на хребтах (мачты + вращающиеся 3-лопастные роторы = 2 draw calls!)
    this.maxWind = 24;
    const towerGeo = new THREE.CylinderGeometry(0.32, 0.68, 1.0, 8);
    towerGeo.translate(0, 0.5, 0);
    const towerMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.38, metalness: 0.28 });
    this.windTowerIM = new THREE.InstancedMesh(towerGeo, towerMat, this.maxWind);
    this.windTowerIM.castShadow = true;
    this.windTowerIM.frustumCulled = false;

    // Составная геометрия 3 лопастей ротора ВЭС (в 1 буфере!)
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

    // 4. Солнечные трекеры СЭС и вращающиеся метеорадары (1 draw call!)
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

    // 5. Клубящийся пар градирен, дым заводов и оросительные веера дождевалок (1 draw call!)
    this.maxPuffs = 84;
    const puffGeo = new THREE.IcosahedronGeometry(0.65, 1);
    this.puffMat = new THREE.MeshLambertMaterial({
      color: 0xf1f5f9,
      transparent: true,
      opacity: 0.46,
      depthWrite: false,
    });
    this.puffIM = new THREE.InstancedMesh(puffGeo, this.puffMat, this.maxPuffs);
    this.puffIM.frustumCulled = false;

    // 6. Стаи парящих птиц (орлы, чайки, утки) — V-силуэт крыльев (1 draw call!)
    this.maxBirds = 72;
    const wingGeo = new THREE.ConeGeometry(0.55, 0.22, 3);
    wingGeo.scale(2.4, 0.25, 0.85);
    const birdMat = new THREE.MeshLambertMaterial({ color: 0xf8fafc });
    this.birdIM = new THREE.InstancedMesh(wingGeo, birdMat, this.maxBirds);
    this.birdIM.frustumCulled = false;

    // 7. Косяки форели и лосося в чистой воде и у рыбхозов (1 draw call!)
    this.maxFish = 64;
    const fishGeo = new THREE.OctahedronGeometry(0.5, 0);
    fishGeo.scale(0.35, 0.28, 1.35);
    const fishMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.2, metalness: 0.75 });
    this.fishIM = new THREE.InstancedMesh(fishGeo, fishMat, this.maxFish);
    this.fishIM.frustumCulled = false;

    // 8. Объёмные кучевые облака высоко в небе долины (1 draw call!)
    this.maxClouds = 34;
    const cloudGeo = new THREE.DodecahedronGeometry(1.0, 1);
    cloudGeo.scale(1.9, 0.48, 1.25);
    this.cloudMat = new THREE.MeshLambertMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.68,
      depthWrite: false,
    });
    this.cloudIM = new THREE.InstancedMesh(cloudGeo, this.cloudMat, this.maxClouds);
    this.cloudIM.frustumCulled = false;

    this.group.add(
      this.shipHullIM,
      this.shipSuperIM,
      this.vehicleIM,
      this.headlightIM,
      this.windTowerIM,
      this.windRotorIM,
      this.solarIM,
      this.puffIM,
      this.birdIM,
      this.fishIM,
      this.cloudIM,
    );
  }

  /** Пересоздаёт маршруты флота, поездов, ВЭС, СЭС, птиц и облаков при смене карты или масштаба */
  rebuildWorldActors() {
    const rng = makeRng(202603);
    const hs = WORLD.horizScale;
    const es = WORLD.elevScale;
    const propScale = Math.pow(hs, 0.62);
    const rivers = getScaledValleyRivers(this.hydro.presetId);
    const mainSpine = rivers.main;

    // 1. Суда речного флота и парусные яхты вдоль главного русла и плёсов
    this.ships = [];
    for (let i = 0; i < this.maxShips; i++) {
      const kindRoll = i % 5;
      // 0: сухогруз, 1: танкер, 2: баржа со щебнем, 3: круизный лайнер, 4: парусная яхта
      const shade = pickCatalogShade('fleet_machinery', i * 5 + 1);
      this.ships.push({
        kind: kindRoll,
        t: (i / this.maxShips + rng() * 0.08) % 1.0,
        dir: (i % 2 === 0) ? 1 : -1,
        speed: (0.014 + rng() * 0.014) * (kindRoll === 4 ? 1.25 : 0.85),
        laneOffset: (rng() - 0.5) * 14 * hs * 0.45,
        length: (kindRoll <= 2 ? 12.5 : (kindRoll === 3 ? 14.0 : 5.6)) * propScale,
        beam: (kindRoll <= 2 ? 3.2 : (kindRoll === 3 ? 3.5 : 1.9)) * propScale,
        height: (kindRoll === 4 ? 1.4 : 2.3) * propScale,
        mastH: (kindRoll === 4 ? 5.8 : 2.4) * propScale,
        phase: rng() * Math.PI * 2,
        color: new THREE.Color(shade.r, shade.g, shade.b),
      });
    }

    // 2. Автотрафик, грузовики и железнодорожные составы между парами соседних городов
    this.vehicles = [];
    const routes = [];
    for (let i = 0; i < CITY_DEFS.length; i++) {
      const a = CITY_DEFS[i];
      const b = CITY_DEFS[(i + 1) % CITY_DEFS.length];
      routes.push({ ax: a.x, az: a.z, bx: b.x, bz: b.z, isRail: i % 3 === 0 });
    }
    for (let i = 0; i < this.maxVehicles; i++) {
      const rt = routes[i % routes.length];
      const isTrainCar = rt.isRail && (i % 6 < 4);
      const shade = pickCatalogShade('fleet_machinery', i * 3 + 7);
      this.vehicles.push({
        route: rt,
        isTrain: isTrainCar,
        trainSlot: i % 4,
        t: ((Math.floor(i / 4) * 0.13) + (isTrainCar ? (i % 4) * 0.016 : rng())) % 1.0,
        dir: (i % 2 === 0) ? 1 : -1,
        speed: isTrainCar ? 0.036 : (0.028 + rng() * 0.025),
        sx: (isTrainCar ? 2.8 : 2.1) * propScale,
        sy: (isTrainCar ? 2.6 : 1.5) * propScale,
        sz: (isTrainCar ? 7.8 : 4.2) * propScale,
        color: new THREE.Color(shade.r, shade.g, shade.b),
      });
    }

    // 3. Ветропарк ВЭС на высоких продуваемых гребнях долины
    this.windTurbines = [];
    for (let i = 0; i < this.maxWind; i++) {
      const side = (i % 2 === 0) ? -1 : 1;
      const wx = side * (225 + (i % 6) * 22 + rng() * 12) * hs;
      const wz = (-285 + Math.floor(i / 2) * 46 + rng() * 14) * hs;
      if (Math.abs(wx) > WORLD.half * 0.94 || Math.abs(wz) > WORLD.half * 0.94) continue;
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

    // 4. Солнечный парк СЭС на южных солнечных террасах у Технопарка ИИ и Агродолины
    this.solarTrackers = [];
    const techCity = CITY_DEFS.find((c) => c.archetype === 'tech') || CITY_DEFS[0];
    for (let i = 0; i < this.maxSolar; i++) {
      const row = Math.floor(i / 6);
      const col = i % 6;
      const wx = techCity.x + (col - 2.5) * 9.5 * propScale + 42 * hs;
      const wz = techCity.z + (row - 2.5) * 8.5 * propScale + 36 * hs;
      if (Math.abs(wx) > WORLD.half * 0.93 || Math.abs(wz) > WORLD.half * 0.93) continue;
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

    // 5. Клубы пара над промзонами (Алюмград / Промград) + оросительные струи полей
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
        size: (3.2 + rng() * 2.5) * propScale,
      });
    }
    this.puffIM.count = this.steamPuffs.length;

    // 6. Стаи парящих орлов (высоко над каньонами) и чаек/уток (над водой)
    this.birds = [];
    for (let i = 0; i < this.maxBirds; i++) {
      const isEagle = i < 18;
      const spinePt = mainSpine[i % mainSpine.length];
      this.birds.push({
        cx: spinePt.x + (rng() - 0.5) * 180 * hs,
        cz: spinePt.z + (rng() - 0.5) * 180 * hs,
        alt: (isEagle ? 95 : 34) * es + rng() * 26 * es,
        orbitR: (isEagle ? 58 : 28) * hs * (0.65 + rng() * 0.7),
        omega: (isEagle ? 0.22 : 0.46) * (i % 2 === 0 ? 1 : -1),
        phase: rng() * Math.PI * 2,
        flapFreq: isEagle ? 3.2 : 7.8,
        scale: (isEagle ? 2.4 : 1.35) * propScale,
        color: isEagle ? new THREE.Color(0x5c4033) : new THREE.Color(0xf8fafc),
      });
      this.birdIM.setColorAt(i, this.birds[i].color);
    }
    this.birdIM.count = this.birds.length;
    if (this.birdIM.instanceColor) this.birdIM.instanceColor.needsUpdate = true;

    // 7. Косяки форели и лосося вдоль речного русла и у рыбхозов
    this.fishes = [];
    for (let i = 0; i < this.maxFish; i++) {
      this.fishes.push({
        t: rng(),
        speed: 0.018 + rng() * 0.022,
        phase: rng() * Math.PI * 2,
        jumpPhase: rng() * 12.0,
        offset: (rng() - 0.5) * 10 * hs * 0.5,
        scale: (0.85 + rng() * 0.5) * propScale,
      });
    }

    // 8. Кучевые облака высоко в небе
    this.clouds = [];
    for (let i = 0; i < this.maxClouds; i++) {
      this.clouds.push({
        wx: (rng() - 0.5) * WORLD.size * 1.15,
        wy: (165 + rng() * 55) * es,
        wz: (rng() - 0.5) * WORLD.size * 1.15,
        sx: (38 + rng() * 34) * hs,
        sy: (11 + rng() * 8) * es,
        sz: (28 + rng() * 26) * hs,
        drift: 0.75 + rng() * 0.55,
      });
    }
    this.cloudIM.count = this.clouds.length;
  }

  _sampleRiverPoint(tNorm) {
    const spine = getScaledValleyRivers(this.hydro.presetId).main;
    const scaled = clamp(tNorm, 0.02, 0.98) * (spine.length - 1);
    const idx = Math.min(spine.length - 2, Math.floor(scaled));
    const f = scaled - idx;
    const a = spine[idx];
    const b = spine[idx + 1];
    const wx = lerp(a.x, b.x, f);
    const wz = lerp(a.z, b.z, f);
    const dx = b.x - a.x;
    const dz = b.z - a.z;
    const yaw = Math.atan2(dx, dz);
    return { wx, wz, yaw, nx: Math.cos(yaw), nz: -Math.sin(yaw) };
  }

  update(dt, hourOfDay, sunFactor, sunDir) {
    this._time += dt;
    const t = this._time;
    const hs = WORLD.horizScale;
    const propScale = Math.pow(hs, 0.62);
    const windMult = this.economy.weatherId === 'flood' ? 2.1 : (this.economy.weatherId === 'rain' ? 1.5 : 1.0);
    const isNight = sunFactor < 0.26;

    // 1. Анимация кораблей, танкеров, барж и парусных яхт (строго по реальной глубине воды!)
    let activeShips = 0;
    for (let i = 0; i < this.ships.length; i++) {
      const sh = this.ships[i];
      sh.t += sh.dir * sh.speed * dt * 0.45;
      if (sh.t > 0.96) { sh.t = 0.96; sh.dir = -1; }
      if (sh.t < 0.08) { sh.t = 0.08; sh.dir = 1; }

      const rp = this._sampleRiverPoint(sh.t);
      const wx = rp.wx + rp.nx * sh.laneOffset;
      const wz = rp.wz + rp.nz * sh.laneOffset;
      const samp = this.hydro.sampleAtWorld(wx, wz);

      // Если впереди сухая плотина без шлюза — судно разворачивается в бьефе!
      if (samp.depth < 0.65 || samp.concrete > 2.5) {
        sh.dir *= -1;
        continue;
      }

      const roll = Math.sin(t * 2.1 + sh.phase) * (sh.kind === 4 ? 0.14 : 0.045) * windMult;
      const pitch = Math.cos(t * 1.7 + sh.phase) * 0.03;
      const headYaw = sh.dir > 0 ? rp.yaw : rp.yaw + Math.PI;
      const wy = samp.surface + sh.height * 0.18;

      this._dummy.position.set(wx, wy, wz);
      this._dummy.rotation.set(pitch, headYaw, roll);
      this._dummy.scale.set(sh.beam, sh.height, sh.length);
      this._dummy.updateMatrix();
      this.shipHullIM.setMatrixAt(activeShips, this._dummy.matrix);
      this.shipHullIM.setColorAt(activeShips, sh.color);

      // Надстройка рубки или парус яхты
      this._dummy.position.set(wx, wy + sh.height * 0.5 + sh.mastH * 0.42, wz);
      this._dummy.rotation.set(pitch, headYaw, roll * 1.25);
      this._dummy.scale.set(
        sh.kind === 4 ? sh.beam * 0.25 : sh.beam * 0.72,
        sh.mastH,
        sh.kind === 4 ? sh.length * 0.55 : sh.length * 0.35,
      );
      this._dummy.updateMatrix();
      this.shipSuperIM.setMatrixAt(activeShips, this._dummy.matrix);
      activeShips++;
    }
    this.shipHullIM.count = activeShips;
    this.shipSuperIM.count = activeShips;
    this.shipHullIM.instanceMatrix.needsUpdate = true;
    this.shipSuperIM.instanceMatrix.needsUpdate = true;
    if (this.shipHullIM.instanceColor) this.shipHullIM.instanceColor.needsUpdate = true;

    // 2. Поезда, грузовики и междугородний автотрафик + включение фар ночью
    let vehOut = 0;
    let lightOut = 0;
    for (let i = 0; i < this.vehicles.length; i++) {
      const v = this.vehicles[i];
      v.t = (v.t + v.dir * v.speed * dt + 1.0) % 1.0;
      const rt = v.route;
      // Плавная дуга в обход глубокого русла, если в точке глубокая вода
      const midArc = Math.sin(v.t * Math.PI) * 26 * hs;
      const wx = lerp(rt.ax, rt.bx, v.t) + midArc * 0.35;
      const wz = lerp(rt.az, rt.bz, v.t) - midArc * 0.25;
      if (Math.abs(wx) > WORLD.half * 0.95 || Math.abs(wz) > WORLD.half * 0.95) continue;

      const samp = this.hydro.sampleAtWorld(wx, wz);
      // Если трасса пересекает реку — перекидываем виртуальный эстакадный пролёт моста над водой!
      const roadY = samp.depth > 0.3 ? samp.surface + 2.8 * propScale : samp.bed + v.sy * 0.52;
      const yaw = Math.atan2(rt.bx - rt.ax, rt.bz - rt.az) + (v.dir < 0 ? Math.PI : 0);

      this._dummy.position.set(wx, roadY, wz);
      this._dummy.rotation.set(0, yaw, 0);
      this._dummy.scale.set(v.sx, v.sy, v.sz);
      this._dummy.updateMatrix();
      this.vehicleIM.setMatrixAt(vehOut, this._dummy.matrix);
      this.vehicleIM.setColorAt(vehOut, v.color);
      vehOut++;

      if (isNight) {
        this._dummy.position.set(
          wx + Math.sin(yaw) * v.sz * 0.54,
          roadY,
          wz + Math.cos(yaw) * v.sz * 0.54,
        );
        this._dummy.rotation.set(0, yaw, 0);
        this._dummy.scale.set(v.sx * 0.8, v.sy * 0.35, 0.4 * propScale);
        this._dummy.updateMatrix();
        this.headlightIM.setMatrixAt(lightOut++, this._dummy.matrix);
      }
    }
    this.vehicleIM.count = vehOut;
    this.headlightIM.count = lightOut;
    this.vehicleIM.instanceMatrix.needsUpdate = true;
    if (this.vehicleIM.instanceColor) this.vehicleIM.instanceColor.needsUpdate = true;
    if (lightOut > 0) this.headlightIM.instanceMatrix.needsUpdate = true;

    // 3. Вращение 3-лопастных ветрогенераторов ВЭС на горных хребтах
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

    // 4. Слежение солнечных трекеров СЭС за положением солнца в небе!
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

    // 5. Подъём и ветровой снос белого пара градирен и промзон
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

    // 6. Кружащие стаи орлов и чаек со взмахами крыльев
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

    // 7. Косяки форели и выпрыгивающие рыбы в реке и садках рыбхозов
    let fishOut = 0;
    for (let i = 0; i < this.fishes.length; i++) {
      const f = this.fishes[i];
      f.t = (f.t + f.speed * dt * 0.25) % 0.95;
      const rp = this._sampleRiverPoint(0.08 + f.t * 0.86);
      const wx = rp.wx + rp.nx * f.offset + Math.sin(t * 2.4 + f.phase) * 1.8 * propScale;
      const wz = rp.wz + rp.nz * f.offset;
      const samp = this.hydro.sampleAtWorld(wx, wz);
      if (samp.depth < 0.45) continue;

      const jumpWave = Math.sin(t * 1.65 + f.jumpPhase * 3.1);
      const jumpH = jumpWave > 0.90 ? (jumpWave - 0.90) * 14.0 * propScale : -0.22 * propScale;
      this._dummy.position.set(wx, samp.surface + jumpH, wz);
      this._dummy.rotation.set(jumpH > 0 ? -0.45 : 0, rp.yaw + Math.sin(t * 6.0 + f.phase) * 0.22, 0);
      this._dummy.scale.set(f.scale, f.scale, f.scale);
      this._dummy.updateMatrix();
      this.fishIM.setMatrixAt(fishOut++, this._dummy.matrix);
    }
    this.fishIM.count = fishOut;
    if (fishOut > 0) this.fishIM.instanceMatrix.needsUpdate = true;

    // 8. Плавный дрейф объёмных кучевых облаков в атмосфере
    const cloudSpan = WORLD.size * 1.2;
    this.cloudMat.opacity = this.economy.weatherId === 'flood' ? 0.85 : (isNight ? 0.34 : 0.68);
    const cBright = isNight ? 0.28 : (this.economy.weatherId === 'flood' ? 0.58 : 0.98);
    this.cloudMat.color.setRGB(cBright, cBright * 1.01, cBright * 1.05);
    for (let i = 0; i < this.clouds.length; i++) {
      const cl = this.clouds[i];
      cl.wx += dt * 4.5 * hs * cl.drift * windMult * 0.35;
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
      shipsActive: this.shipHullIM.count,
      vehiclesActive: this.vehicleIM.count,
      windTurbines: this.windTurbines.length,
      solarTrackers: this.solarTrackers.length,
      birdsAndFish: this.birdIM.count + this.fishIM.count,
    };
  }
}
