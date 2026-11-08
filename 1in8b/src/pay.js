/* ============================================================
   1 ИЗ 8 МИЛЛИАРДОВ — сто видов заработка.
   ------------------------------------------------------------
   Деньги приходят к человеку не одним способом. Ребёнку дают
   карманные, подросток подрабатывает летом, взрослому платят
   окладом, сделкой, процентом с продаж, чаевыми, вахтой или
   конвертом, пенсионер живёт на пенсию и огород, кто-то сдаёт
   комнату, кому-то помогают родственники из-за границы.

   Здесь сто видов заработка, у каждого:
     · своё условие — кому и когда он доступен;
     · свои деньги — доля от стоимости года жизни в этой стране;
     · своё событие — то, что с этим заработком может случиться.

   Виды делятся на пять групп:
     child   — детские деньги (карманные, подарки, подработки)
     wage    — форма оплаты основной работы (множитель к зарплате)
     extra   — приработки сверх основной работы
     social  — выплаты: пенсии, пособия, стипендии, алименты
     shadow  — то, что мимо кассы
   ============================================================ */
(function () {
  'use strict';

  var M = window.IN8B.model;
  var A = window.IN8B.algo;
  var clamp = M.clamp;

  /* ------------------------------ помощники --------------------------- */
  function poor(c) { return c.gdp < 7000; }
  function mid(c) { return c.gdp >= 7000 && c.gdp <= 28000; }
  function rich(c) { return c.gdp > 28000; }
  function job(L) { return L.job ? M.jobById[L.job.id] : null; }
  function sector(L) { var j = job(L); return j ? j.sector : null; }
  function inSec(L, list) { return list.indexOf(sector(L)) >= 0; }
  function hasKids(L) { return L.children && L.children.length > 0; }
  function adult(L) { return L.age >= 18; }
  function working(L) { return !!L.job; }
  /* множитель к сумме: достаток семьи, город и страна */
  function famK(L) { return 0.5 + (L.famPct || 0.5) * 1.3; }

  var PAYS = [];
  function P(o) { PAYS.push(o); return o; }

  /* ======================================================================
     1. ДЕТСКИЕ ДЕНЬГИ (14) — всё, что у человека может быть до работы
     ====================================================================== */

  P({ id: 'pocket', name: 'Карманные от родителей', hint: 'мелочь на неделю', kind: 'child', age: [6, 17],
    fit: function (L) { return !L.job; },
    amount: function (L) { return L.need * (0.004 + L.age * 0.0012) * famK(L) * (L.urban ? 1.15 : 0.85); },
    ev: { w: 2.2, run: function (x) {
      x.add('Вам стали давать карманные деньги — свои, на что захотите.', 'money');
      x.L.flag('ownMoney', true); x.stat('happy', 2);
    } } });

  P({ id: 'lunch', name: 'Деньги на обед', hint: 'часть можно не тратить', kind: 'child', age: [7, 17],
    fit: function (L) { return !L.job && L.edu.inSchool; },
    amount: function (L) { return L.need * 0.006 * famK(L); },
    ev: { w: 1.4, run: function (x) {
      x.add('Вы неделю ходили голодным, зато скопили на то, что хотели.', 'money');
      x.stat('health', -1.2); x.money(x.need * 0.01);
    } } });

  P({ id: 'gift-holiday', name: 'Подарок на праздник', hint: 'раз в год конвертик', kind: 'child', age: [6, 17],
    fit: function () { return true; },
    amount: function (L) { return L.need * 0.008 * famK(L); },
    ev: { w: 1.6, run: function (x) {
      x.add('На праздник подарили деньги — первый собственный капитал.', 'good');
      x.money(x.need * 0.02 * famK(x.L)); x.stat('happy', 3);
    } } });

  P({ id: 'granny', name: 'Бабушкины', hint: 'тайком, чтобы родители не знали', kind: 'child', age: [5, 17],
    fit: function (L) { return L.parentsAlive > 0; },
    amount: function (L) { return L.need * 0.005; },
    ev: { w: 1.5, run: function (x) {
      x.add('Бабушка сунула в карман денег и попросила не говорить дома.', 'family');
      x.stat('bond', 3); x.money(x.need * 0.012);
    } } });

  P({ id: 'tooth', name: 'За зуб и за оценки', hint: 'домашняя экономика', kind: 'child', age: [6, 14],
    fit: function () { return true; },
    amount: function (L) { return L.need * 0.003 * famK(L); },
    ev: { w: 1.1, run: function (x) {
      x.add('Дома завели плату за пятёрки: учиться стало выгодно.', 'good');
      x.stat('know', 2.5); x.money(x.need * 0.008);
    } } });

  P({ id: 'bottles', name: 'Сбор бутылок и металла', hint: 'после школы, с друзьями', kind: 'child', age: [8, 16],
    fit: function (L) { return !rich(L.c) || L.famPct < 0.35; },
    amount: function (L) { return L.need * 0.012 * (poor(L.c) ? 1.5 : 1); },
    ev: { w: 1.3, run: function (x) {
      x.add('Вы с друзьями сдавали бутылки и металл — первые свои деньги.', 'money');
      x.money(x.need * 0.02); x.stat('health', -0.6);
    } } });

  P({ id: 'market-help', name: 'Помощь на рынке', hint: 'носить, считать, зазывать', kind: 'child', age: [9, 16],
    fit: function (L) { return poor(L.c) || mid(L.c); },
    amount: function (L) { return L.need * 0.035 * (poor(L.c) ? 1.4 : 1); },
    ev: { w: 1.6, run: function (x) {
      x.add('Вы стояли с родными на рынке и научились считать в уме быстрее учителя.', 'money');
      x.stat('know', 2); x.stat('health', -1); x.money(x.need * 0.03);
    } } });

  P({ id: 'herding', name: 'Пасти скот', hint: 'целый день в поле', kind: 'child', age: [7, 15],
    fit: function (L) { return !L.urban && (poor(L.c) || mid(L.c)); },
    amount: function (L) { return L.need * 0.03; },
    ev: { w: 1.5, run: function (x) {
      x.add('Вы пасли скот вместо уроков: дома так нужнее.', 'bad');
      x.stat('know', -2.5); x.stat('health', -0.8); x.L.flag('childLabour', true);
    } } });

  P({ id: 'harvest-kid', name: 'Сбор урожая', hint: 'сезон, все руки в поле', kind: 'child', age: [8, 17],
    fit: function (L) { return !L.urban; },
    amount: function (L) { return L.need * 0.04; },
    ev: { w: 1.4, run: function (x) {
      x.add('Сезон сбора: школа подождёт, деньги нужны сейчас.', 'money');
      x.money(x.need * 0.05); x.stat('know', -1.5); x.stat('health', -1.2);
    } } });

  P({ id: 'papers', name: 'Разносить газеты и листовки', hint: 'до школы, по подъездам', kind: 'child', age: [11, 17],
    fit: function (L) { return L.urban; },
    amount: function (L) { return L.need * 0.02; },
    ev: { w: 1.2, run: function (x) {
      x.add('Первая работа — разносить листовки. Платят мало, но платят вам.', 'money');
      x.money(x.need * 0.015); x.stat('bond', 1);
    } } });

  P({ id: 'carwash-kid', name: 'Мыть машины', hint: 'во дворе, по выходным', kind: 'child', age: [12, 17],
    fit: function (L) { return L.urban; },
    amount: function (L) { return L.need * 0.025; },
    ev: { w: 1.1, run: function (x) {
      x.add('Вы мыли машины во дворе: за день — как за неделю карманных.', 'money');
      x.money(x.need * 0.02);
    } } });

  P({ id: 'tutor-kid', name: 'Объяснять младшим', hint: 'школьное репетиторство', kind: 'child', age: [14, 17],
    fit: function (L) { return L.stats.know > 58; },
    amount: function (L) { return L.need * 0.03 * (1 + L.stats.know / 200); },
    ev: { w: 1.2, run: function (x) {
      x.add('Вы подтягивали младших по математике — и сами стали понимать лучше.', 'good');
      x.stat('know', 3); x.money(x.need * 0.03);
    } } });

  P({ id: 'summer-job', name: 'Летняя подработка', hint: 'три месяца свободы и усталости', kind: 'child', age: [14, 17],
    fit: function () { return true; },
    amount: function (L) { return L.need * 0.07 * (rich(L.c) ? 1.2 : 0.9); },
    ev: { w: 1.9, run: function (x) {
      x.add('Первая настоящая работа на лето: вы узнали, сколько стоит час вашей жизни.', 'work');
      x.money(x.need * 0.06); x.stat('know', 1.5); x.stat('happy', 1.5); x.L.flag('firstEarned', true);
    } } });

  P({ id: 'scholar-school', name: 'Школьная стипендия', hint: 'за успехи, раз в месяц', kind: 'child', age: [12, 17],
    fit: function (L) { return L.stats.know > 68 && !poor(L.c); },
    amount: function (L) { return L.need * 0.02; },
    ev: { w: 1, run: function (x) {
      x.add('За учёбу назначили стипендию — маленькую, но свою.', 'good');
      x.stat('happy', 3); x.stat('know', 1);
    } } });

  /* ======================================================================
     2. ФОРМЫ ОПЛАТЫ ОСНОВНОЙ РАБОТЫ (27) — множитель к зарплате
     ====================================================================== */

  P({ id: 'salary', name: 'Оклад', hint: 'одна и та же сумма каждый месяц', kind: 'wage',
    fit: function (L) { return inSec(L, ['prof', 'elite', 'public', 'skilled', 'service']); }, mult: 1,
    ev: { w: 1.4, run: function (x) { x.add('Оклад не меняется третий год подряд — цены меняются.', 'money'); x.stat('happy', -2); } } });

  P({ id: 'hourly', name: 'Почасовая', hint: 'сколько часов — столько денег', kind: 'wage',
    fit: function (L) { return inSec(L, ['service', 'manual', 'skilled']); }, mult: 0.98,
    ev: { w: 1.3, run: function (x) { x.add('Часы урезали: смен стало меньше, денег тоже.', 'bad'); x.money(-x.need * 0.08); } } });

  P({ id: 'piece', name: 'Сдельная', hint: 'платят за сделанное', kind: 'wage',
    fit: function (L) { return inSec(L, ['manual', 'agri', 'informal', 'skilled']); }, mult: 1.06,
    ev: { w: 1.5, run: function (x) {
      x.add('Месяц рвали жилы на сделке: заработали много, спина помнит.', 'work');
      x.money(x.need * 0.12); x.stat('health', -2);
    } } });

  P({ id: 'daily', name: 'Подённая', hint: 'расчёт каждый вечер', kind: 'wage',
    fit: function (L) { return inSec(L, ['informal', 'agri', 'manual']) && !rich(L.c); }, mult: 0.92,
    ev: { w: 1.4, run: function (x) { x.add('Два дня простоя — два дня без денег. Никто ничего не должен.', 'bad'); x.money(-x.need * 0.04); } } });

  P({ id: 'shift-rate', name: 'За смену', hint: 'ставка за выход', kind: 'wage',
    fit: function (L) { return L.job && L.job.schedule === 'shift'; }, mult: 1.04,
    ev: { w: 1.2, run: function (x) { x.add('Взяли чужую смену — лишние деньги и несделанные дела дома.', 'work'); x.money(x.need * 0.05); x.stat('bond', -1.5); } } });

  P({ id: 'rotation-pay', name: 'Вахтовая', hint: 'месяц там, месяц дома', kind: 'wage',
    fit: function (L) { return L.job && L.job.schedule === 'rotation'; }, mult: 1.35,
    ev: { w: 1.5, run: function (x) {
      x.add('С вахты вернулись с деньгами и чувством, что дома обошлись без вас.', 'work');
      x.money(x.need * 0.2); x.stat('bond', -3);
    } } });

  P({ id: 'commission', name: 'Процент с продаж', hint: 'оклад маленький, процент большой', kind: 'wage',
    fit: function (L) { return inSec(L, ['service', 'prof']) && L.stats.know > 45; }, mult: 1.12,
    ev: { w: 1.5, run: function (x) {
      var good = x.rnd() < 0.5;
      x.add(good ? 'Месяц удачных сделок: процент вышел больше оклада.' : 'Продажи встали — остался голый оклад.', good ? 'good' : 'bad');
      x.money(good ? x.need * 0.18 : -x.need * 0.05);
    } } });

  P({ id: 'tips', name: 'Чаевые', hint: 'мелочью, но каждый день', kind: 'wage',
    fit: function (L) { return inSec(L, ['service']); }, mult: 1.1,
    ev: { w: 1.6, run: function (x) {
      x.add('Щедрый столик оставил чаевых больше, чем вы получаете за день.', 'good');
      x.money(x.need * 0.04); x.stat('happy', 2);
    } } });

  P({ id: 'bonus-quarter', name: 'Квартальная премия', hint: 'четыре раза в год', kind: 'wage',
    fit: function (L) { return inSec(L, ['prof', 'elite', 'public']) && L.job && L.job.contract === 'official'; }, mult: 1.08,
    ev: { w: 1.4, run: function (x) {
      var cut = x.rnd() < 0.4;
      x.add(cut ? 'Премию в этом квартале не дали: у компании «сложный период».' : 'Квартальная премия пришла полностью.', cut ? 'bad' : 'good');
      x.money(cut ? 0 : x.need * 0.1);
    } } });

  P({ id: 'bonus-year', name: 'Тринадцатая зарплата', hint: 'в декабре, если год удался', kind: 'wage',
    fit: function (L) { return L.job && L.job.contract === 'official' && !poor(L.c); }, mult: 1.05,
    ev: { w: 1.3, run: function (x) { x.add('Тринадцатая зарплата закрыла долги перед Новым годом.', 'good'); x.money(x.need * 0.09); } } });

  P({ id: 'grade-pay', name: 'По разряду', hint: 'сетка, надбавки, стаж', kind: 'wage',
    fit: function (L) { return inSec(L, ['public', 'skilled']); }, mult: 1.02,
    ev: { w: 1.2, run: function (x) { x.add('Подтвердили разряд: к зарплате прибавилась строчка.', 'work'); x.stat('know', 1.5); } } });

  P({ id: 'tariff-public', name: 'Бюджетная ставка', hint: 'сколько положено по штату', kind: 'wage',
    fit: function (L) { return sector(L) === 'public'; }, mult: 0.96,
    ev: { w: 1.3, run: function (x) { x.add('Ставку проиндексировали на величину меньше роста цен.', 'money'); x.stat('happy', -1.5); } } });

  P({ id: 'contract-work', name: 'Договор подряда', hint: 'от проекта до проекта', kind: 'wage',
    fit: function (L) { return inSec(L, ['prof', 'skilled', 'manual']); }, mult: 1.05,
    ev: { w: 1.3, run: function (x) { x.add('Проект закончился, новый не начался: месяц без денег.', 'bad'); x.money(-x.need * 0.07); } } });

  P({ id: 'freelance', name: 'Фриланс', hint: 'сами находите заказы', kind: 'wage',
    fit: function (L) { return inSec(L, ['prof']) && L.year >= 2000; }, mult: 1.08,
    ev: { w: 1.4, run: function (x) {
      var ok = x.rnd() < 0.65;
      x.add(ok ? 'Хороший заказчик вернулся с большим заказом.' : 'Заказчик пропал, не заплатив за готовую работу.', ok ? 'good' : 'bad');
      x.money(ok ? x.need * 0.14 : -x.need * 0.06);
    } } });

  P({ id: 'platform', name: 'Работа на платформе', hint: 'рейтинг решает всё', kind: 'wage',
    fit: function (L) { return L.year >= 2012 && inSec(L, ['service', 'manual', 'informal']); }, mult: 1.01,
    ev: { w: 1.4, run: function (x) {
      x.add('Платформа поменяла правила: тарифы ниже, комиссия выше.', 'bad');
      x.money(-x.need * 0.05); x.stat('happy', -2);
    } } });

  P({ id: 'per-client', name: 'За клиента', hint: 'поток решает заработок', kind: 'wage',
    fit: function (L) { return inSec(L, ['service', 'prof']); }, mult: 1.03,
    ev: { w: 1.1, run: function (x) { x.add('Поток клиентов вырос — и вы перестали видеть вечера.', 'work'); x.money(x.need * 0.08); x.stat('health', -1.5); } } });

  P({ id: 'per-hectare', name: 'С гектара', hint: 'сколько обработал', kind: 'wage',
    fit: function (L) { return sector(L) === 'agri'; }, mult: 1.04,
    ev: { w: 1.2, run: function (x) {
      var dry = x.rnd() < 0.3;
      x.add(dry ? 'Засуха: гектары есть, урожая нет.' : 'Урожай вышел хороший, заплатили по полной.', dry ? 'bad' : 'good');
      x.money(dry ? -x.need * 0.1 : x.need * 0.12);
    } } });

  P({ id: 'crop-share', name: 'Доля урожая', hint: 'платят не деньгами, а зерном', kind: 'wage',
    fit: function (L) { return sector(L) === 'agri' && !rich(L.c); }, mult: 0.9,
    ev: { w: 1.2, run: function (x) { x.add('Расчёт зерном: еда есть, денег нет.', 'money'); x.stat('health', 1); x.money(-x.need * 0.03); } } });

  P({ id: 'in-kind', name: 'Натуроплата', hint: 'продукты, жильё, проезд', kind: 'wage',
    fit: function (L) { return poor(L.c) || sector(L) === 'agri'; }, mult: 0.88,
    ev: { w: 1.1, run: function (x) { x.add('Половину зарплаты выдали продуктами с базы.', 'money'); x.stat('health', 0.8); } } });

  P({ id: 'brigade', name: 'Бригадный подряд', hint: 'платят на всех, делят сами', kind: 'wage',
    fit: function (L) { return inSec(L, ['manual', 'skilled']); }, mult: 1.03,
    ev: { w: 1.2, run: function (x) {
      var fair = x.rnd() < 0.6;
      x.add(fair ? 'Бригада поделила заработок честно.' : 'Бригадир «посчитал» — вам достался меньший кусок.', fair ? 'good' : 'bad');
      x.money(fair ? x.need * 0.05 : -x.need * 0.04); x.stat('bond', fair ? 1.5 : -2);
    } } });

  P({ id: 'night-rate', name: 'Ночная надбавка', hint: 'за работу, когда все спят', kind: 'wage',
    fit: function (L) { return L.job && L.job.schedule === 'night'; }, mult: 1.14,
    ev: { w: 1.3, run: function (x) { x.add('Ночные смены платят больше, а спите вы хуже.', 'work'); x.stat('health', -2.2); x.money(x.need * 0.07); } } });

  P({ id: 'hazard-pay', name: 'За вредность', hint: 'молоко, отпуск и доплата', kind: 'wage',
    fit: function (L) { var j = job(L); return j && j.risk >= 2; }, mult: 1.09,
    ev: { w: 1.2, run: function (x) { x.add('Доплату за вредность оставили, вредность — тоже.', 'work'); x.stat('health', -1.5); x.money(x.need * 0.05); } } });

  P({ id: 'north-rate', name: 'Северные', hint: 'коэффициент за климат', kind: 'wage',
    fit: function (L) { return ['ru', 'ca', 'no', 'se', 'fi', 'is', 'kz', 'mn'].indexOf(L.c.code) >= 0; }, mult: 1.16,
    ev: { w: 1.1, run: function (x) { x.add('Северный коэффициент — единственное тёплое в этом месте.', 'money'); x.money(x.need * 0.06); } } });

  P({ id: 'expat-pay', name: 'Зарплата за рубежом', hint: 'больше, но далеко от дома', kind: 'wage',
    fit: function (L) { return L.abroad; }, mult: 1.25,
    ev: { w: 1.3, run: function (x) { x.add('Заграничная зарплата кажется огромной, пока не заплатишь за жильё.', 'money'); x.money(-x.need * 0.12); } } });

  P({ id: 'currency-pay', name: 'Оплата в валюте', hint: 'зависит от курса', kind: 'wage',
    fit: function (L) { return !rich(L.c) && inSec(L, ['prof', 'elite']); }, mult: 1.1,
    ev: { w: 1.3, run: function (x) {
      var up = x.rnd() < 0.5;
      x.add(up ? 'Курс подскочил — зарплата в валюте стала весомее.' : 'Курс качнуло, и валютная зарплата потеряла в весе.', up ? 'good' : 'bad');
      x.money(up ? x.need * 0.1 : -x.need * 0.08);
    } } });

  P({ id: 'equity', name: 'Доля в компании', hint: 'бумажки, которые могут стать деньгами', kind: 'wage',
    fit: function (L) { return sector(L) === 'elite' && L.year >= 1995; }, mult: 0.97,
    ev: { w: 1.1, run: function (x) {
      var win = x.rnd() < 0.3;
      x.add(win ? 'Доля в компании наконец превратилась в деньги.' : 'Доля в компании так и осталась красивой строчкой в письме.', win ? 'good' : 'money');
      if (win) x.money(x.need * 0.8);
    } } });

  P({ id: 'per-diem', name: 'Командировочные', hint: 'суточные сверх зарплаты', kind: 'wage',
    fit: function (L) { return inSec(L, ['prof', 'elite', 'public', 'skilled']); }, mult: 1.03,
    ev: { w: 1.1, run: function (x) { x.add('Из командировки вернулись с суточными и простудой.', 'work'); x.money(x.need * 0.04); x.stat('health', -1); } } });

  /* ======================================================================
     3. ПРИРАБОТКИ (25) — поверх основной работы
     ====================================================================== */

  P({ id: 'taxi-night', name: 'Такси по вечерам', hint: 'после основной смены', kind: 'extra', age: [20, 64],
    fit: function (L) { return working(L) && L.urban; },
    amount: function (L) { return L.need * 0.12; },
    ev: { w: 1.4, run: function (x) { x.add('Вечера за рулём: деньги есть, сна нет.', 'work'); x.money(x.need * 0.1); x.stat('health', -2); } } });

  P({ id: 'delivery', name: 'Доставка', hint: 'сумка, велосипед, дождь', kind: 'extra', age: [16, 60],
    fit: function (L) { return L.urban && L.year >= 2010; },
    amount: function (L) { return L.need * 0.09; },
    ev: { w: 1.3, run: function (x) { x.add('Развозили заказы в ливень: заплатили двойной тариф.', 'money'); x.money(x.need * 0.05); x.stat('health', -1.2); } } });

  P({ id: 'tutor', name: 'Репетиторство', hint: 'вечерами, у себя дома', kind: 'extra', age: [20, 70],
    fit: function (L) { return L.stats.know > 60; },
    amount: function (L) { return L.need * 0.11 * (1 + L.stats.know / 150); },
    ev: { w: 1.4, run: function (x) { x.add('Ваш ученик поступил, и о вас рассказали всем знакомым.', 'good'); x.money(x.need * 0.08); x.stat('happy', 2); } } });

  P({ id: 'repair-side', name: 'Чинить на дому', hint: 'руки помнят', kind: 'extra', age: [20, 72],
    fit: function (L) { return inSec(L, ['manual', 'skilled', 'agri']); },
    amount: function (L) { return L.need * 0.1; },
    ev: { w: 1.3, run: function (x) { x.add('Полдвора знает: если сломалось — это к вам.', 'good'); x.money(x.need * 0.07); x.stat('bond', 2); } } });

  P({ id: 'sewing', name: 'Шить и перешивать', hint: 'по вечерам, под сериал', kind: 'extra', age: [18, 75],
    fit: function (L) { return L.sex === 'f' || !rich(L.c); },
    amount: function (L) { return L.need * 0.07; },
    ev: { w: 1.1, run: function (x) { x.add('Заказы на выпускные платья закрыли месяц.', 'money'); x.money(x.need * 0.06); } } });

  P({ id: 'bake', name: 'Печь на заказ', hint: 'торты к праздникам', kind: 'extra', age: [18, 70],
    fit: function () { return true; },
    amount: function (L) { return L.need * 0.06; },
    ev: { w: 1.1, run: function (x) { x.add('Торт на свадьбу соседям — и очередь заказов на месяц вперёд.', 'good'); x.money(x.need * 0.05); x.stat('bond', 1.5); } } });

  P({ id: 'garden-sell', name: 'Продавать своё с огорода', hint: 'у дороги, вёдрами', kind: 'extra', age: [16, 85],
    fit: function (L) { return !L.urban; },
    amount: function (L) { return L.need * 0.08; },
    ev: { w: 1.3, run: function (x) { x.add('Всё лето стояли у дороги с вёдрами — хватило на зиму.', 'money'); x.money(x.need * 0.07); x.stat('health', -1); } } });

  P({ id: 'livestock', name: 'Держать скотину', hint: 'молоко, мясо, шерсть', kind: 'extra', age: [18, 80],
    fit: function (L) { return !L.urban && !rich(L.c); },
    amount: function (L) { return L.need * 0.14; },
    ev: { w: 1.3, run: function (x) {
      var loss = x.rnd() < 0.25;
      x.add(loss ? 'Пала корова — минус половина хозяйства.' : 'Продали приплод: в доме появились деньги.', loss ? 'bad' : 'good');
      x.money(loss ? -x.need * 0.25 : x.need * 0.12);
    } } });

  P({ id: 'rent-room', name: 'Сдавать комнату', hint: 'жить теснее, но с деньгами', kind: 'extra', age: [22, 85],
    fit: function (L) { return L.home; },
    amount: function (L) { return L.need * 0.16; },
    ev: { w: 1.3, run: function (x) {
      var bad = x.rnd() < 0.3;
      x.add(bad ? 'Жилец съехал, не заплатив за два месяца.' : 'Тихий жилец платит вовремя — это почти вторая зарплата.', bad ? 'bad' : 'good');
      x.money(bad ? -x.need * 0.1 : x.need * 0.12);
    } } });

  P({ id: 'rent-garage', name: 'Сдавать гараж', hint: 'стоит и приносит', kind: 'extra', age: [25, 85],
    fit: function (L) { return L.home && L.urban; },
    amount: function (L) { return L.need * 0.05; },
    ev: { w: 1, run: function (x) { x.add('Гараж сдали под склад — лишняя копейка каждый месяц.', 'money'); x.money(x.need * 0.04); } } });

  P({ id: 'photo', name: 'Снимать праздники', hint: 'свадьбы, выпускные', kind: 'extra', age: [18, 60],
    fit: function (L) { return L.year >= 1990; },
    amount: function (L) { return L.need * 0.09; },
    ev: { w: 1.1, run: function (x) { x.add('Отсняли свадьбу: деньги хорошие, выходные — нет.', 'work'); x.money(x.need * 0.08); x.stat('bond', -1); } } });

  P({ id: 'music-gig', name: 'Играть на праздниках', hint: 'своя аппаратура, свои нервы', kind: 'extra', age: [16, 70],
    fit: function (L) { return L.has('music') || L.stats.happy > 65; },
    amount: function (L) { return L.need * 0.07; },
    ev: { w: 1.1, run: function (x) { x.add('Играли до утра на чужой свадьбе — платят, но голос сел.', 'work'); x.money(x.need * 0.05); } } });

  P({ id: 'craft-sell', name: 'Продавать рукоделие', hint: 'ярмарки и интернет', kind: 'extra', age: [16, 80],
    fit: function () { return true; },
    amount: function (L) { return L.need * 0.05 * (L.year >= 2010 ? 1.6 : 1); },
    ev: { w: 1.1, run: function (x) { x.add('Ваши изделия заметили: заказы пошли из других городов.', 'good'); x.money(x.need * 0.06); x.stat('happy', 2); } } });

  P({ id: 'resell', name: 'Перепродажа', hint: 'купить там, продать здесь', kind: 'extra', age: [18, 65],
    fit: function () { return true; },
    amount: function (L) { return L.need * 0.1; },
    ev: { w: 1.2, run: function (x) {
      var ok = x.rnd() < 0.55;
      x.add(ok ? 'Партия разошлась за неделю — удачная сделка.' : 'Товар завис: деньги стоят на складе мёртвым грузом.', ok ? 'good' : 'bad');
      x.money(ok ? x.need * 0.12 : -x.need * 0.1);
    } } });

  P({ id: 'cleaning-side', name: 'Убирать квартиры', hint: 'по выходным, по знакомым', kind: 'extra', age: [18, 70],
    fit: function (L) { return L.famPct < 0.6; },
    amount: function (L) { return L.need * 0.08; },
    ev: { w: 1.1, run: function (x) { x.add('Три квартиры за выходные: спина ноет, конверт полный.', 'work'); x.money(x.need * 0.06); x.stat('health', -1.4); } } });

  P({ id: 'nanny', name: 'Сидеть с чужими детьми', hint: 'пока родители на работе', kind: 'extra', age: [16, 70],
    fit: function () { return true; },
    amount: function (L) { return L.need * 0.07; },
    ev: { w: 1.1, run: function (x) { x.add('Соседские дети зовут вас тётей и бегут навстречу.', 'family'); x.money(x.need * 0.05); x.stat('bond', 2); } } });

  P({ id: 'eldercare-side', name: 'Ухаживать за пожилыми', hint: 'через день, по часам', kind: 'extra', age: [20, 65],
    fit: function () { return true; },
    amount: function (L) { return L.need * 0.09; },
    ev: { w: 1.1, run: function (x) { x.add('Ваша подопечная оставила вам в наследство книги и благодарность.', 'family'); x.stat('bond', 3); x.stat('happy', -2); } } });

  P({ id: 'translate', name: 'Переводы', hint: 'тексты по ночам', kind: 'extra', age: [20, 70],
    fit: function (L) { return L.stats.know > 65; },
    amount: function (L) { return L.need * 0.1; },
    ev: { w: 1, run: function (x) { x.add('Срочный перевод к утру: заплатили вдвое.', 'money'); x.money(x.need * 0.07); x.stat('health', -1); } } });

  P({ id: 'code-side', name: 'Подработка кодом', hint: 'вечерние проекты', kind: 'extra', age: [18, 60],
    fit: function (L) { return L.year >= 1995 && L.stats.know > 70; },
    amount: function (L) { return L.need * 0.18; },
    ev: { w: 1.2, run: function (x) { x.add('Вечерний проект принёс больше, чем основная работа за квартал.', 'good'); x.money(x.need * 0.2); x.stat('health', -1.5); } } });

  P({ id: 'blog', name: 'Блог и реклама', hint: 'зависит от просмотров', kind: 'extra', age: [16, 60],
    fit: function (L) { return L.year >= 2008; },
    amount: function (L) { return L.need * 0.06; },
    ev: { w: 1.1, run: function (x) {
      var hit = x.rnd() < 0.25;
      x.add(hit ? 'Один ролик выстрелил — и деньги пришли сами.' : 'Алгоритм перестал показывать вас: доходы просели.', hit ? 'good' : 'bad');
      x.money(hit ? x.need * 0.25 : -x.need * 0.02);
    } } });

  P({ id: 'security-shift', name: 'Сторожить по ночам', hint: 'сутки через трое', kind: 'extra', age: [25, 70],
    fit: function () { return true; },
    amount: function (L) { return L.need * 0.1; },
    ev: { w: 1.1, run: function (x) { x.add('Ночные дежурства: в тишине вы прочитали больше, чем за всю школу.', 'work'); x.money(x.need * 0.07); x.stat('know', 1.5); x.stat('health', -1.5); } } });

  P({ id: 'construction-side', name: 'Шабашка на стройке', hint: 'в отпуске и по выходным', kind: 'extra', age: [20, 60],
    fit: function (L) { return L.sex === 'm' || inSec(L, ['manual']); },
    amount: function (L) { return L.need * 0.15; },
    ev: { w: 1.2, run: function (x) {
      var hurt = x.rnd() < 0.2;
      x.add(hurt ? 'На шабашке сорвали спину: лечиться дороже, чем заработали.' : 'Месяц шабашки — и в доме новая крыша.', hurt ? 'bad' : 'good');
      if (hurt) { x.stat('health', -6); x.money(-x.need * 0.1); } else x.money(x.need * 0.14);
    } } });

  P({ id: 'fishing', name: 'Рыбалка на продажу', hint: 'ранние утра', kind: 'extra', age: [16, 75],
    fit: function (L) { return !L.urban; },
    amount: function (L) { return L.need * 0.07; },
    ev: { w: 1, run: function (x) { x.add('Хороший улов разошёлся ещё на берегу.', 'money'); x.money(x.need * 0.05); x.stat('happy', 1.5); } } });

  P({ id: 'forest', name: 'Лес: грибы, ягоды, орех', hint: 'сезон короткий', kind: 'extra', age: [12, 75],
    fit: function (L) { return !L.urban; },
    amount: function (L) { return L.need * 0.06; },
    ev: { w: 1.1, run: function (x) { x.add('Сдали ягоду заготовителям — за сезон вышла месячная зарплата.', 'money'); x.money(x.need * 0.08); } } });

  P({ id: 'market-stall', name: 'Своя точка на рынке', hint: 'шесть дней в неделю', kind: 'extra', age: [20, 70],
    fit: function (L) { return !rich(L.c); },
    amount: function (L) { return L.need * 0.2; },
    ev: { w: 1.2, run: function (x) {
      var rough = x.rnd() < 0.3;
      x.add(rough ? 'Аренду места подняли вдвое — торговать стало не на что.' : 'Точка на рынке кормит всю семью.', rough ? 'bad' : 'good');
      x.money(rough ? -x.need * 0.12 : x.need * 0.16);
    } } });

  /* ======================================================================
     4. ВЫПЛАТЫ (18) — то, что платят не за работу
     ====================================================================== */

  P({ id: 'pension-old', name: 'Пенсия по старости', hint: 'раз в месяц, до конца', kind: 'social', age: [55, 120],
    fit: function (L) { return L.retired; },
    amount: function (L) { return 0; },  /* считается движком отдельно */
    ev: { w: 1.5, run: function (x) {
      x.add('Пенсию проиндексировали: прибавка меньше, чем подорожали лекарства.', 'money');
      x.stat('happy', -1.5);
    } } });

  P({ id: 'pension-work', name: 'Пенсия по выслуге', hint: 'раньше срока, за стаж', kind: 'social', age: [45, 120],
    fit: function (L) { var j = job(L); return j && (j.risk >= 2 || j.sector === 'public') && L.age >= 45; },
    amount: function (L) { return L.need * 0.12; },
    ev: { w: 1.1, run: function (x) { x.add('Выслуга подошла: можно уходить, а можно работать дальше и получать обе суммы.', 'work'); x.money(x.need * 0.1); } } });

  P({ id: 'disability', name: 'Пенсия по инвалидности', hint: 'после комиссии', kind: 'social', age: [18, 120],
    fit: function (L) { return L.stats.health < 32 || L.has('chronic'); },
    amount: function (L) { return L.need * 0.14; },
    ev: { w: 1.2, run: function (x) {
      x.add('Комиссия подтвердила группу: выплата небольшая, но постоянная.', 'money');
      x.money(x.need * 0.12);
    } } });

  P({ id: 'unemployment', name: 'Пособие по безработице', hint: 'пока ищете работу', kind: 'social', age: [18, 64],
    fit: function (L) { return !L.job && !L.retired && L.age >= 18 && !poor(L.c); },
    amount: function (L) { return L.need * (rich(L.c) ? 0.22 : 0.08); },
    ev: { w: 1.3, run: function (x) {
      x.add('Встали на учёт: пособие платят, но каждую неделю надо отмечаться.', 'money');
      x.money(x.need * 0.06); x.stat('happy', -1.5);
    } } });

  P({ id: 'child-benefit', name: 'Детское пособие', hint: 'на каждого ребёнка', kind: 'social', age: [18, 60],
    fit: function (L) { return hasKids(L); },
    amount: function (L) { return L.need * 0.05 * Math.min(4, L.children.length); },
    ev: { w: 1.3, run: function (x) { x.add('Пособие на детей подняли — на месяц еды хватает.', 'family'); x.money(x.need * 0.05); } } });

  P({ id: 'maternity', name: 'Выплата за рождение', hint: 'разово, крупно', kind: 'social', age: [16, 48],
    fit: function (L) { return hasKids(L) && !poor(L.c); },
    amount: function (L) { return 0; },
    ev: { w: 1.2, run: function (x) { x.add('Единовременная выплата за ребёнка закрыла сразу все детские расходы.', 'good'); x.money(x.need * 0.35); } } });

  P({ id: 'maternity-leave', name: 'Декретные', hint: 'процент от зарплаты', kind: 'social', age: [18, 45],
    fit: function (L) { return hasKids(L) && L.sex === 'f' && L.job; },
    amount: function (L) { return L.need * 0.18; },
    ev: { w: 1.2, run: function (x) { x.add('Декретные платят меньше зарплаты, а расходы выросли вдвое.', 'family'); x.money(-x.need * 0.05); } } });

  P({ id: 'scholarship', name: 'Стипендия', hint: 'пока учитесь', kind: 'social', age: [17, 30],
    fit: function (L) { return L.edu.inSchool && L.age >= 17; },
    amount: function (L) { return L.need * 0.06; },
    ev: { w: 1.2, run: function (x) { x.add('Повышенная стипендия за сессию без троек.', 'good'); x.money(x.need * 0.05); x.stat('know', 1); } } });

  P({ id: 'grant', name: 'Грант на учёбу или дело', hint: 'надо подать заявку', kind: 'social', age: [18, 60],
    fit: function (L) { return L.stats.know > 65; },
    amount: function (L) { return 0; },
    ev: { w: 1.1, run: function (x) {
      var got = x.rnd() < 0.35;
      x.add(got ? 'Ваша заявка на грант прошла: деньги пришли на счёт.' : 'Грант не дали — «в этом году сильные конкуренты».', got ? 'good' : 'bad');
      if (got) x.money(x.need * 0.5); else x.stat('happy', -2);
    } } });

  P({ id: 'alimony', name: 'Алименты', hint: 'если платят', kind: 'social', age: [18, 60],
    fit: function (L) { return L.marital === 'divorced' && hasKids(L); },
    amount: function (L) { return L.need * 0.1; },
    ev: { w: 1.2, run: function (x) {
      var pay2 = x.rnd() < 0.55;
      x.add(pay2 ? 'Алименты пришли вовремя — редкий месяц.' : 'Алименты опять не пришли: суд, приставы, тишина.', pay2 ? 'good' : 'bad');
      x.money(pay2 ? x.need * 0.08 : -x.need * 0.02);
    } } });

  P({ id: 'survivor', name: 'Пенсия по потере кормильца', hint: 'детям до совершеннолетия', kind: 'social', age: [0, 23],
    fit: function (L) { return L.parentsAlive < 2; },
    amount: function (L) { return L.need * 0.08; },
    ev: { w: 1, run: function (x) { x.add('Выплату за ушедшего родителя оформили не сразу, но оформили.', 'money'); x.money(x.need * 0.06); } } });

  P({ id: 'housing-aid', name: 'Субсидия на жильё', hint: 'если платить нечем', kind: 'social', age: [18, 90],
    fit: function (L) { return L.famPct < 0.3 || L.money < 0; },
    amount: function (L) { return L.need * 0.07; },
    ev: { w: 1.1, run: function (x) { x.add('Субсидию на коммуналку одобрили: зимой стало легче дышать.', 'good'); x.money(x.need * 0.06); } } });

  P({ id: 'food-aid', name: 'Продуктовая помощь', hint: 'талоны, наборы, столовая', kind: 'social', age: [0, 120],
    fit: function (L) { return L.famPct < 0.25 || L.homeless; },
    amount: function (L) { return L.need * 0.06; },
    ev: { w: 1.1, run: function (x) { x.add('Продуктовый набор от города: стыдно брать, но берут все.', 'money'); x.stat('health', 1); x.stat('happy', -1); } } });

  P({ id: 'veteran', name: 'Выплаты участникам', hint: 'за службу', kind: 'social', age: [20, 95],
    fit: function (L) { return L.has('veteran') || L.has('war'); },
    amount: function (L) { return L.need * 0.1; },
    ev: { w: 1, run: function (x) { x.add('Ветеранские выплаты и льготы оформлены — бумаг было больше, чем денег.', 'money'); x.money(x.need * 0.07); } } });

  P({ id: 'remittance', name: 'Переводы от родных', hint: 'из-за границы, каждый месяц', kind: 'social', age: [0, 95],
    fit: function (L) { return !rich(L.c); },
    amount: function (L) { return L.need * 0.15; },
    ev: { w: 1.4, run: function (x) {
      x.add('Родственник прислал денег из-за границы — на них живёт полдома.', 'family');
      x.money(x.need * 0.12); x.stat('bond', 1.5);
    } } });

  P({ id: 'compensation', name: 'Компенсация', hint: 'за аварию, за задержку, за вред', kind: 'social', age: [16, 95],
    fit: function () { return true; },
    amount: function (L) { return 0; },
    ev: { w: 1.1, run: function (x) { x.add('Суд присудил компенсацию: деньги пришли через год после события.', 'money'); x.money(x.need * 0.3); } } });

  P({ id: 'insurance-pay', name: 'Страховая выплата', hint: 'если был полис', kind: 'social', age: [18, 95],
    fit: function (L) { return L.has('insurance'); },
    amount: function (L) { return 0; },
    ev: { w: 1.1, run: function (x) { x.add('Страховая заплатила: впервые бумажка оказалась полезной.', 'good'); x.money(x.need * 0.4); } } });

  P({ id: 'inherit-pay', name: 'Наследство', hint: 'раз в жизни', kind: 'social', age: [20, 90],
    fit: function (L) { return L.parentsAlive < 2; },
    amount: function (L) { return 0; },
    ev: { w: 0.9, run: function (x) {
      x.add('Наследство оформили: немного денег и много воспоминаний.', 'family');
      x.money(x.need * 0.6); x.stat('happy', -2);
    } } });

  /* ======================================================================
     5. МИМО КАССЫ (16)
     ====================================================================== */

  P({ id: 'envelope', name: 'Зарплата в конверте', hint: 'без налогов и без пенсии', kind: 'shadow',
    fit: function (L) { return L.job && L.job.contract === 'grey'; },
    amount: function (L) { return L.need * 0.05; },
    ev: { w: 1.5, run: function (x) {
      x.add('Конверт стал тоньше, и спросить не у кого.', 'bad');
      x.money(-x.need * 0.06); x.L.flag('grey', true);
    } } });

  P({ id: 'cash-only', name: 'Только наличными', hint: 'нигде не записано', kind: 'shadow',
    fit: function (L) { return L.job && L.job.contract === 'none'; },
    amount: function (L) { return L.need * 0.04; },
    ev: { w: 1.2, run: function (x) { x.add('Расчёт наличными: деньги в руках, но доказать их нельзя.', 'money'); x.L.flag('noProof', true); } } });

  P({ id: 'haltura', name: 'Халтура мимо работодателя', hint: 'на рабочем месте', kind: 'shadow',
    fit: function (L) { return working(L); },
    amount: function (L) { return L.need * 0.06; },
    ev: { w: 1.2, run: function (x) {
      var caught = x.rnd() < 0.25;
      x.add(caught ? 'Начальник узнал о халтуре на рабочем месте.' : 'Пара заказов мимо кассы — никто не заметил.', caught ? 'bad' : 'money');
      if (caught) { x.money(-x.need * 0.08); if (x.L.job) x.L.job.boss = clamp((x.L.job.boss || 0) - 2, -3, 3); }
      else x.money(x.need * 0.05);
    } } });

  P({ id: 'tips-hidden', name: 'Чаевые в карман', hint: 'не доходят до кассы', kind: 'shadow',
    fit: function (L) { return inSec(L, ['service']); },
    amount: function (L) { return L.need * 0.05; },
    ev: { w: 1.1, run: function (x) { x.add('Чаевые делят по-своему: кому-то больше, кому-то обидно.', 'work'); x.stat('bond', -1); } } });

  P({ id: 'kickback', name: 'Откат', hint: 'процент за решение', kind: 'shadow',
    fit: function (L) { return inSec(L, ['elite', 'public']) && L.job && L.job.step >= 2; },
    amount: function (L) { return L.need * 0.25; },
    ev: { w: 1.1, run: function (x) {
      var risk = x.rnd() < 0.2;
      x.add(risk ? 'Схемой заинтересовались: допросы, адвокат, бессонница.' : 'Процент за «правильное решение» пришёл наличными.', risk ? 'bad' : 'money');
      if (risk) { x.money(-x.need * 0.4); x.stat('happy', -8); x.L.flag('investigated', true); }
      else { x.money(x.need * 0.22); x.stat('happy', -2); }
    } } });

  P({ id: 'bribe-take', name: 'Благодарность от людей', hint: 'конверт за услугу', kind: 'shadow',
    fit: function (L) { return inSec(L, ['public', 'prof']) && !rich(L.c); },
    amount: function (L) { return L.need * 0.08; },
    ev: { w: 1.2, run: function (x) { x.add('Вам снова оставили конверт «в знак благодарности».', 'money'); x.money(x.need * 0.07); x.stat('happy', -1); } } });

  P({ id: 'smuggle', name: 'Возить товар через границу', hint: 'сумками, автобусом', kind: 'shadow',
    fit: function (L) { return !rich(L.c); },
    amount: function (L) { return L.need * 0.18; },
    ev: { w: 1, run: function (x) {
      var busted = x.rnd() < 0.3;
      x.add(busted ? 'Товар отобрали на границе — рейс в убыток.' : 'Рейс прошёл удачно: наценка вдвое.', busted ? 'bad' : 'good');
      x.money(busted ? -x.need * 0.2 : x.need * 0.2);
    } } });

  P({ id: 'moonshine', name: 'Домашнее на продажу', hint: 'соседям, по знакомству', kind: 'shadow',
    fit: function (L) { return !L.urban && !rich(L.c); },
    amount: function (L) { return L.need * 0.09; },
    ev: { w: 1, run: function (x) { x.add('Деревня знает, к кому идти вечером. Деньги есть, репутация так себе.', 'money'); x.money(x.need * 0.08); x.stat('bond', -1.5); } } });

  P({ id: 'cards', name: 'Карты и ставки', hint: 'иногда везёт', kind: 'shadow',
    fit: function () { return true; },
    amount: function (L) { return 0; },
    ev: { w: 1.2, run: function (x) {
      var win = x.rnd() < 0.35;
      x.add(win ? 'Ставка зашла: лёгкие деньги и опасная привычка.' : 'Проигрались: отдавать придётся из зарплаты.', win ? 'money' : 'bad');
      x.money(win ? x.need * 0.15 : -x.need * 0.18);
      if (x.rnd() < 0.3) x.L.flag('gambling', true);
    } } });

  P({ id: 'scrap-shadow', name: 'Сдавать чужой металл', hint: 'там, где плохо лежит', kind: 'shadow',
    fit: function (L) { return L.famPct < 0.3 || L.homeless; },
    amount: function (L) { return L.need * 0.05; },
    ev: { w: 1, run: function (x) {
      var caught = x.rnd() < 0.3;
      x.add(caught ? 'Поймали на чужом участке: разговор с участковым.' : 'Пункт приёма металла принял всё без вопросов.', caught ? 'bad' : 'money');
      if (caught) { x.money(-x.need * 0.05); x.stat('happy', -3); } else x.money(x.need * 0.04);
    } } });

  P({ id: 'street-work', name: 'Случайная работа на улице', hint: 'кто возьмёт на день', kind: 'shadow',
    fit: function (L) { return L.homeless || !L.job; },
    amount: function (L) { return L.need * 0.07; },
    ev: { w: 1.2, run: function (x) { x.add('Взяли на день разгружать машину — расплатились сразу и мало.', 'money'); x.money(x.need * 0.03); x.stat('health', -1); } } });

  P({ id: 'beg', name: 'Просить', hint: 'когда не остаётся другого', kind: 'shadow',
    fit: function (L) { return L.homeless; },
    amount: function (L) { return L.need * 0.05; },
    ev: { w: 1.1, run: function (x) { x.add('День на холоде с протянутой рукой. Хватило на еду.', 'bad'); x.stat('happy', -5); x.money(x.need * 0.02); } } });

  P({ id: 'pawn', name: 'Нести в ломбард', hint: 'своё, но в залог', kind: 'shadow',
    fit: function (L) { return L.money < 0 || L.famPct < 0.4; },
    amount: function (L) { return 0; },
    ev: { w: 1.1, run: function (x) {
      x.add('Отнесли в ломбард последнее золото: выкупить потом не вышло.', 'bad');
      x.money(x.need * 0.08); x.stat('happy', -3);
    } } });

  P({ id: 'crypto-side', name: 'Монеты и схемы', hint: 'все вокруг разбогатели', kind: 'shadow',
    fit: function (L) { return L.year >= 2013 && L.stats.know > 50; },
    amount: function (L) { return 0; },
    ev: { w: 1.1, run: function (x) {
      var win = x.rnd() < 0.3;
      x.add(win ? 'Монета выросла, и вы успели выйти.' : 'Вложились на пике — осталась папка со скриншотами.', win ? 'good' : 'bad');
      x.money(win ? x.need * 0.4 : -x.need * 0.3);
    } } });

  P({ id: 'mlm', name: 'Сетевой маркетинг', hint: 'сначала надо купить набор', kind: 'shadow',
    fit: function () { return true; },
    amount: function (L) { return 0; },
    ev: { w: 1.1, run: function (x) {
      x.add('Знакомая позвала в «бизнес»: вы купили набор и стали должны всем вокруг.', 'bad');
      x.money(-x.need * 0.12); x.stat('bond', -2);
    } } });

  P({ id: 'double-job', name: 'Две работы по документам', hint: 'там числишься, тут работаешь', kind: 'shadow',
    fit: function (L) { return working(L) && L.job && L.job.contract === 'official'; },
    amount: function (L) { return L.need * 0.12; },
    ev: { w: 1, run: function (x) {
      var found = x.rnd() < 0.25;
      x.add(found ? 'Выяснилось, что вы числитесь в двух местах: пришлось выбирать.' : 'Две ставки тянете молча — спите по пять часов.', found ? 'bad' : 'work');
      if (found) { x.money(-x.need * 0.1); } else { x.money(x.need * 0.1); x.stat('health', -2.5); }
    } } });

  /* ======================================================================
     Сборка: индексы, подбор видов заработка и сто событий
     ====================================================================== */

  var BY_ID = {};
  PAYS.forEach(function (p) {
    /* возраст по умолчанию: подработки и серые деньги — не детское дело */
    if (!p.age) p.age = p.kind === 'wage' ? [14, 95]
      : p.kind === 'extra' ? [16, 80]
        : p.kind === 'shadow' ? [16, 95] : [0, 120];
    BY_ID[p.id] = p;
  });

  /* какие виды заработка подходят человеку в этом году */
  function fitFor(L, kind) {
    var minor = L.age < 18 && !L.job;
    return PAYS.filter(function (p) {
      if (kind && p.kind !== kind) return false;
      if (p.age && (L.age < p.age[0] || L.age > p.age[1])) return false;
      if (p.kind === 'wage' && !L.job) return false;
      if (p.kind === 'extra' && L.age < 16) return false;
      /* до шестнадцати у человека бывают только детские деньги и выплаты семье */
      if (minor && L.age < 16 && ['child', 'social'].indexOf(p.kind) < 0) return false;
      if (minor && ['extra', 'shadow'].indexOf(p.kind) >= 0 && L.age < 16) return false;
      try { return p.fit ? !!p.fit(L) : true; } catch (e) { return false; }
    });
  }

  /* сумма за год по виду заработка (в межд. долларах ППС) */
  function amountOf(L, p) {
    if (!p || !p.amount) return 0;
    var v = 0;
    try { v = p.amount(L) || 0; } catch (e) { v = 0; }
    return isFinite(v) && v > 0 ? v : 0;
  }

  /* множитель формы оплаты к зарплате основной работы */
  function wageMult(L) {
    var id = L.payWage;
    var p = id ? BY_ID[id] : null;
    return p && p.kind === 'wage' ? (p.mult || 1) : 1;
  }

  /* Сто событий: у каждого вида заработка своё. Приходят в денежном
     слоте года и проверяют, что этот заработок у человека действительно есть. */
  var PAY_AUTO = PAYS.map(function (p) {
    return {
      id: 'pay-' + p.id,
      pay: p.id,
      age: p.age || (p.kind === 'wage' ? [14, 95] : [0, 120]),
      w: (p.ev && p.ev.w) || 1,
      cond: function (x) {
        var L = x.L;
        if (p.kind === 'wage') return L.payWage === p.id;
        if (!L.payActive) return false;
        return L.payActive.indexOf(p.id) >= 0;
      },
      run: p.ev.run
    };
  });

  window.IN8B.pay = {
    list: PAYS,
    byId: BY_ID,
    auto: PAY_AUTO,
    fitFor: fitFor,
    amountOf: amountOf,
    wageMult: wageMult,
    kinds: ['child', 'wage', 'extra', 'social', 'shadow'],
    count: PAYS.length
  };
})();
