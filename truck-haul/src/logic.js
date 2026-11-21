/* ============================================================
   ДАЛЬНОБОЙ 3D — чистая логика (src/logic.js)

   Здесь только расчёты без DOM, WebGL и Three.js: генерация
   контрактов, маршрутов, коробка передач, ресурсы и износ.

   Зачем отдельный файл: игра целиком живёт в main.js и требует
   WebGL, из-за чего её нельзя было проверить тестами. Чистые
   функции вынесены сюда — их проверяет tests/logic.mjs, а main.js
   использует эти же функции, поэтому тест проверяет настоящий код,
   а не копию.

   Модуль работает и в браузере (как обычный <script>), и в Node.
   ============================================================ */
(function (root) {
  const CITIES = [
    ['Санкт-Петербург', 'Новгород', 'Тверь', 'Москва', 'Владимир', 'Ярославль', 'Вологда', 'Псков'],
    ['Нижний Новгород', 'Казань', 'Самара', 'Уфа', 'Пермь', 'Ижевск', 'Киров', 'Саранск'],
    ['Волгоград', 'Саратов', 'Астрахань', 'Ростов-на-Дону', 'Краснодар', 'Воронеж', 'Элиста', 'Ставрополь'],
    ['Екатеринбург', 'Тюмень', 'Челябинск', 'Омск', 'Новосибирск', 'Томск', 'Барнаул', 'Курган'],
    ['Мурманск', 'Архангельск', 'Петрозаводск', 'Сыктывкар', 'Ухта', 'Котлас', 'Апатиты', 'Онега'],
  ];

  const CARGOES = [
    ['Продукты', 5, 12], ['Пиломатериалы', 10, 20], ['Стальной прокат', 16, 27],
    ['Медицинское оборудование', 4, 12], ['Строительная техника', 15, 25],
    ['Бытовая техника', 7, 17], ['Зерно', 12, 22], ['Мебель', 5, 14],
    ['Автозапчасти', 4, 12], ['Стекло', 9, 18], ['Электроника', 3, 10],
    ['Цемент', 15, 24], ['Текстиль', 5, 14], ['Рыбная продукция', 7, 15],
    ['Трубы', 12, 20], ['Сельхозтехника', 16, 25], ['Фармацевтика', 4, 11],
    ['Кабель', 10, 21], ['Солнечные панели', 6, 16], ['Бумажные рулоны', 10, 18],
    ['Кофе и чай', 4, 12], ['Упакованная вода', 8, 18], ['Шины', 7, 15],
    ['Пластиковая тара', 5, 13], ['Запчасти для станков', 10, 22],
  ];

  const FRAGILE = ['Стекло', 'Электроника', 'Фармацевтика'];

  /* --- детерминированный генератор: одно зерно = один мир --- */
  function rand(seed) {
    let n = seed >>> 0;
    return () => {
      n = (n * 1664525 + 1013904223) >>> 0;
      return n / 4294967296;
    };
  }

  function clamp(v, a, b) {
    return Math.max(a, Math.min(b, v));
  }

  /* --- маршрут на карте: 8 точек сверху вниз --- */
  function makeRoute(seed) {
    const r = rand(6401 + seed * 31);
    const p = [{ x: 0.5, y: 0.94 }];
    for (let i = 1; i < 8; i++) {
      p.push({ x: clamp(0.5 + (r() - 0.5) * 0.82, 0.09, 0.91), y: 0.94 - i * 0.118 });
    }
    p.push({ x: clamp(0.5 + (r() - 0.5) * 0.7, 0.14, 0.86), y: 0.035 });
    return p;
  }

  /* --- контракты --- */
  function makeJobs(count, start = 1) {
    const r = rand(81252 + start * 733);
    return Array.from({ length: count }, (_, i) => {
      const region = Math.floor(r() * 5);
      const list = CITIES[region];
      const a = Math.floor(r() * list.length);
      const b = (a + 1 + Math.floor(r() * (list.length - 1))) % list.length;
      const c = CARGOES[Math.floor(r() * CARGOES.length)];
      const distance = Math.round((70 + r() * 360) / 5) * 5;
      const load = +(c[1] + r() * (c[2] - c[1])).toFixed(1);
      const urgent = r() < 0.17;
      const fragile = FRAGILE.includes(c[0]);
      const reward = Math.round((distance * (45 + r() * 16) + load * 220
        + (urgent ? 6500 : 0) + (fragile ? 3500 : 0)) / 100) * 100;
      return {
        id: start + i, region,
        from: list[a], to: list[b], cargo: c[0],
        distance, load, reward, urgent, fragile,
        deadline: Math.round(distance / (urgent ? 83 : 57) + r() * 1.3),
        route: makeRoute(start + i + region * 99),
        status: 'available',
      };
    });
  }

  /* --- коробка передач --- */
  const SHIFT_UP = [0, 9, 17, 26, 36, 47, 58, 70, 82, 95, 108, 121, 999];
  const GEAR_RATIOS = [0, 3.4, 2.6, 2.1, 1.75, 1.5, 1.3, 1.15, 1.02, 0.92, 0.84, 0.78, 0.72];

  function autoShift(gear, speed) {
    let g = clamp(gear, 1, 12);
    while (g < 12 && speed > SHIFT_UP[g]) g++;
    while (g > 1 && speed < SHIFT_UP[g - 1] * 0.66) g--;
    return g;
  }

  function engineRpm(speed, gear, throttle) {
    return 700 + (throttle ? 550 : 0) + speed * GEAR_RATIOS[clamp(gear, 1, 12)] * 22;
  }

  function torqueAt(rpm) {
    return clamp(1.15 - Math.max(0, rpm - 1550) / 2600, 0.35, 1.15);
  }

  function acceleration({ gear, rpm, engine, speed, throttle, gearboxAuto = true }) {
    const loadFactor = gearboxAuto ? 1 : clamp(speed / (gear * 4), 0.12, 1);
    return (7 / Math.pow(gear, 0.55)) * torqueAt(rpm) * loadFactor * (clamp(engine, 0, 100) / 100);
  }

  /* --- ресурсы и износ за один шаг --- */
  function wearPerStep({ dt, speed, load = 0, temp = 82, engine = 100, throttle = false }) {
    const km = speed / 3.6 * dt * 50 / 1000;
    const fuel = Math.max(0, km * (0.27 + load * 0.002));
    const oil = Math.max(0, dt * (0.0011 + speed * 0.000015));
    const nextTemp = clamp(temp + (throttle ? 0.021 : -0.014) * dt * (engine < 30 ? 1.7 : 1), 70, 132);
    const fatigue = clamp(dt * 0.167, 0, 100);
    return { km, fuel, oil, temp: nextTemp, fatigue, overheated: nextTemp > 105 };
  }

  /* --- деньги за выполненный рейс --- */
  function payout(job, lateHours = 0) {
    if (!job) return 0;
    let sum = job.reward || 0;
    if (lateHours > 0) sum -= Math.round(sum * Math.min(0.5, lateHours * 0.04));
    return Math.max(0, Math.round(sum / 100) * 100);
  }

  const API = {
    CITIES, CARGOES, FRAGILE, SHIFT_UP, GEAR_RATIOS,
    rand, clamp, makeRoute, makeJobs,
    autoShift, engineRpm, torqueAt, acceleration,
    wearPerStep, payout,
  };

  // Файл — настоящий ES-модуль (package.json игры объявляет type: "module"),
  // поэтому достаточно export default ниже. globalThis оставляем для отладки
  // в консоли браузера: window.TruckHaulLogic.
  root.TruckHaulLogic = API;
})(typeof globalThis !== 'undefined' ? globalThis : this);

export default (typeof globalThis !== 'undefined' && globalThis.TruckHaulLogic) || null;
