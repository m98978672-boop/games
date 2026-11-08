/* ============================================================
   1 ИЗ 8 МИЛЛИАРДОВ — сто механик.
   ------------------------------------------------------------
   Механика — это маленькое правило, которое работает каждый год
   само, без карточек и без вопросов игроку: цены растут, зимой
   топят, техника ломается, соседи помнят добро, тело помнит
   бессонные ночи, деньги утекают на мелочи.

   У каждой механики есть:
     id    — имя;
     hook  — когда она срабатывает в году: 'early' (до денег),
             'money' (внутри денежного шага), 'late' (после);
     when  — кому и когда она вообще применима;
     run   — что делает (меняет показатели, деньги, флаги).

   Механики не пишут в летопись каждый год — иначе она утонет
   в мелочах. Говорят только те, у кого есть что сказать, и
   не чаще, чем раз в несколько лет (api.say).
   ============================================================ */
(function () {
  'use strict';

  var M = window.IN8B.model;
  var A = window.IN8B.algo;
  var clamp = M.clamp;

  function poor(c) { return c.gdp < 7000; }
  function mid(c) { return c.gdp >= 7000 && c.gdp <= 28000; }
  function rich(c) { return c.gdp > 28000; }
  function kids(L) { return L.children ? L.children.length : 0; }
  function working(L) { return !!L.job; }
  function cold(c) { return ['ru', 'kz', 'ca', 'no', 'se', 'fi', 'is', 'mn', 'by', 'ee', 'lv', 'lt', 'ua'].indexOf(c.code) >= 0; }
  function hot(c) { return ['in', 'ng', 'sa', 'ae', 'eg', 'sd', 'ml', 'ne', 'td', 'iq', 'pk', 'id', 'th', 'br'].indexOf(c.code) >= 0; }

  var MECH = [];
  function m(id, name, hook, when, run) { MECH.push({ id: id, name: name, hook: hook, when: when, run: run }); }

  /* ==================== 1. ДЕНЬГИ КАЖДОГО ГОДА (20) ==================== */

  m('inflation', 'Цены растут', 'early', function (L) { return L.age >= 16; }, function (L, api) {
    /* Деньги в игре — международные доллары по ППС, то есть уже в
       постоянных ценах. Здесь копится только то, что дорожает быстрее
       заработка: жильё, еда, лекарства. Поэтому рост маленький и с потолком. */
    var r = poor(L.c) ? 0.016 : mid(L.c) ? 0.011 : 0.005;
    L.priceLevel = clamp((L.priceLevel || 1) * (1 + r * (0.5 + api.rnd())), 1, 3);
    if (L.money > 0) L.money *= 1 - clamp(r, 0, 0.02);            /* наличные тают */
    if (L.priceLevel > 1.6 && api.say('inflation', 15)) api.add('Жильё и еда дорожают быстрее зарплаты — это чувствуется каждый год.', 'money');
  });

  m('utilities', 'Коммунальные платежи', 'money', function (L) { return L.age >= 18 && !L.homeless; }, function (L, api) {
    var k = (cold(L.c) ? 0.06 : 0.035) * (L.home ? 1 : 1.15) * (1 + kids(L) * 0.08);
    api.spend(L.need * k);
    if (cold(L.c) && api.chance(0.05) && api.say('utilities', 8)) api.add('Зимой отопление съело половину месячных денег.', 'money');
  });

  m('transport', 'Дорога каждый день', 'money', function (L) { return working(L) || L.edu.inSchool; }, function (L, api) {
    var c = L.urban ? 0.045 : 0.03;
    if (L.has('car')) c *= 1.8;
    api.spend(L.need * c);
    if (L.job && L.job.commute > 60) L.stat('happy', -0.6);
  });

  m('small-leaks', 'Мелкие траты', 'money', function (L) { return L.age >= 14; }, function (L, api) {
    api.spend(L.need * (0.01 + api.rnd() * 0.02));
  });

  m('bank-fees', 'Банк берёт своё', 'money', function (L) { return L.age >= 18 && !poor(L.c); }, function (L, api) {
    if (L.money > 0) api.spend(Math.min(L.need * 0.004, L.money * 0.004));
  });

  m('cash-habit', 'Деньги под матрасом', 'late', function (L) { return poor(L.c) && L.money > 0; }, function (L, api) {
    if (api.chance(0.04)) { var lost = L.money * 0.12; L.money -= lost; if (api.say('cash-habit', 10)) api.add('Часть накоплений дома пропала — искать негде.', 'bad'); }
  });

  m('price-shock', 'Скачок цен', 'early', function (L) { return L.age >= 18; }, function (L, api) {
    if (api.chance(poor(L.c) ? 0.07 : 0.03)) {
      L.priceLevel = (L.priceLevel || 1) * 1.25;
      api.spend(L.need * 0.1);
      if (api.say('price-shock', 6)) api.add('Цены подскочили за месяц: на те же деньги теперь берут меньше.', 'bad');
    }
  });

  m('wage-delay', 'Задержка зарплаты', 'money', function (L) { return working(L) && !rich(L.c); }, function (L, api) {
    if (api.chance(poor(L.c) ? 0.12 : 0.05)) {
      L.job.payDelay = true;
      api.spend(L.need * 0.05);
      if (api.say('wage-delay', 4)) api.add('Зарплату задержали на два месяца — жили в долг.', 'bad');
    } else if (L.job) L.job.payDelay = false;
  });

  m('tax-year', 'Налоги', 'money', function (L) { return working(L) && L.job.contract === 'official'; }, function (L, api) {
    var rate = rich(L.c) ? 0.22 : mid(L.c) ? 0.15 : 0.1;
    L.taxPaid = (L.taxPaid || 0) + L.income * rate * 0.12;
  });

  m('subsidy', 'Льготы и субсидии', 'money', function (L) { return L.famPct < 0.35 || kids(L) >= 3 || L.age > 65; }, function (L, api) {
    if (!poor(L.c)) api.earn(L.need * 0.03);
  });

  m('price-of-kids', 'Дети стоят денег', 'money', function (L) { return kids(L) > 0; }, function (L, api) {
    api.spend(L.need * 0.07 * Math.min(4, kids(L)));
  });

  m('school-fees', 'Школьные сборы', 'money', function (L) { return kids(L) > 0 && L.age >= 25; }, function (L, api) {
    if (api.chance(0.5)) api.spend(L.need * 0.02 * Math.min(3, kids(L)));
  });

  m('medicine', 'Лекарства', 'money', function (L) { return L.age > 45 || L.has('chronic'); }, function (L, api) {
    var c = (L.age > 70 ? 0.06 : 0.03) * (L.has('chronic') ? 1.8 : 1);
    api.spend(L.need * c);
    if (L.money < 0) { L.flag('untreated', true); L.stat('health', -1.2); }
  });

  m('clothes', 'Одежда и обувь', 'money', function (L) { return L.age >= 6; }, function (L, api) {
    api.spend(L.need * (L.age < 18 ? 0.02 : 0.015) * (1 + kids(L) * 0.3));
  });

  m('repairs', 'Ремонт и поломки', 'money', function (L) { return L.age >= 20 && L.home; }, function (L, api) {
    if (api.chance(0.18)) {
      api.spend(L.need * (0.05 + api.rnd() * 0.12));
      if (api.say('repairs', 5)) api.add('Потекла крыша — чинили сами, вышло дешевле и дольше.', 'money');
    }
  });

  m('appliance-break', 'Техника ломается', 'money', function (L) { return L.purchased && L.age >= 20; }, function (L, api) {
    if (api.chance(0.12)) {
      api.spend(L.need * 0.04);
      if (api.say('appliance-break', 6)) api.add('Холодильник встал в самое жаркое лето.', 'money');
    }
  });

  m('debt-friends', 'Долги друзьям', 'late', function (L) { return L.money < 0 && L.stats.bond > 45; }, function (L, api) {
    if (api.chance(0.3)) {
      api.earn(L.need * 0.08); L.stat('bond', -1.5);
      if (api.say('debt-friends', 5)) api.add('Заняли у друга — вернуть обещали «как получится».', 'money');
    }
  });

  m('lottery', 'Лотерея', 'late', function (L) { return L.age >= 18 && !rich(L.c); }, function (L, api) {
    if (api.chance(0.25)) {
      api.spend(L.need * 0.004);
      if (api.chance(0.01)) { api.earn(L.need * (1 + api.rnd() * 6)); api.add('Выигрыш в лотерею! Небольшой, но настоящий.', 'good'); }
    }
  });

  m('round-sum', 'Круглые суммы', 'late', function () { return true; }, function (L) {
    L.money = A.roundNice(L.money);
  });

  m('savings-habit', 'Привычка откладывать', 'late', function (L) { return L.budget && L.budget.save > 0.1 && L.money > 0; }, function (L, api) {
    L.saveStreak = (L.saveStreak || 0) + 1;
    if (L.saveStreak === 10 && api.say('savings-habit', 99)) {
      api.add('Десять лет подряд вы откладывали — и это заметно по счёту.', 'good');
      L.stat('happy', 3);
    }
  });

  /* ====================== 2. ТЕЛО И ЗДОРОВЬЕ (18) ====================== */

  m('sleep', 'Сон', 'early', function (L) { return L.age >= 14; }, function (L, api) {
    var bad = (L.job && (L.job.schedule === 'night' || L.job.overtime > 1) ? 1 : 0) + (kids(L) && L.age < 45 ? 0.6 : 0);
    if (bad) L.stat('health', -0.5 * bad);
    else if (L.focus === 'rest') L.stat('health', 0.4);
  });

  m('moving-body', 'Движение', 'early', function (L) { return L.age >= 12; }, function (L, api) {
    var active = (L.job && M.jobById[L.job.id] && ['manual', 'agri'].indexOf(M.jobById[L.job.id].sector) >= 0) || L.has('sport');
    L.stat('health', active ? 0.5 : -0.25);
  });

  m('diet', 'Что на столе', 'late', function (L) { return L.age >= 3; }, function (L, api) {
    var food = L.budget ? L.budget.food : 0.3;
    if (food < 0.2 && L.age > 18) L.stat('health', -0.8);
    if (food > 0.45 && rich(L.c)) L.stat('health', -0.3);          /* переедание тоже бьёт */
  });

  m('water', 'Чистая вода', 'early', function (L) { return poor(L.c); }, function (L, api) {
    if (api.chance(L.urban ? 0.06 : 0.12)) {
      L.stat('health', -2.5);
      if (api.say('water', 7)) api.add('Вода из колонки — и неделя с температурой.', 'bad');
    }
  });

  m('air', 'Воздух города', 'early', function (L) { return L.urban && (poor(L.c) || mid(L.c)); }, function (L) {
    L.stat('health', -0.3);
  });

  m('heat-wave', 'Жара', 'early', function (L) { return hot(L.c); }, function (L, api) {
    if (api.chance(0.1)) {
      L.stat('health', L.age > 65 ? -2.5 : -0.8);
      if (L.age > 65 && api.say('heat-wave', 6)) api.add('Неделя жары далась тяжело: врач велел не выходить днём.', 'bad');
    }
  });

  m('cold-wave', 'Мороз', 'early', function (L) { return cold(L.c); }, function (L, api) {
    if (api.chance(0.1)) { L.stat('health', L.homeless ? -6 : -0.7); }
  });

  m('vaccination', 'Прививки', 'early', function (L) { return L.age <= 7; }, function (L, api) {
    if (!L.has('vaccinated') && api.chance(rich(L.c) ? 0.9 : poor(L.c) ? 0.55 : 0.75)) {
      L.flag('vaccinated', true); L.stat('health', 1.5);
    }
  });

  m('checkup', 'Диспансеризация', 'late', function (L) { return L.age >= 35 && !poor(L.c); }, function (L, api) {
    if (api.chance(L.budget && L.budget.health > 0.08 ? 0.35 : 0.12)) {
      L.stat('health', 1.2);
      if (L.has('chronic') && api.chance(0.3) && api.say('checkup', 8)) api.add('На осмотре нашли то, что лучше было найти раньше.', 'bad');
    }
  });

  m('teeth', 'Зубы', 'late', function (L) { return L.age >= 20; }, function (L, api) {
    if (api.chance(0.12)) {
      var pay = L.budget && L.budget.health > 0.07;
      if (pay) api.spend(L.need * 0.05); else { L.stat('health', -1); L.stat('happy', -1); }
    }
  });

  m('eyes', 'Зрение', 'late', function (L) { return L.age >= 10; }, function (L, api) {
    if (!L.has('glasses') && api.chance(L.stats.know > 70 ? 0.05 : 0.02)) {
      L.flag('glasses', true);
      if (api.say('eyes', 20)) api.add('Выписали очки: мир снова стал резким.', 'neutral');
    }
  });

  m('back', 'Спина', 'late', function (L) { return L.age >= 30 && working(L); }, function (L, api) {
    var j = M.jobById[L.job.id];
    if (j && ['manual', 'agri'].indexOf(j.sector) >= 0 && api.chance(0.12)) {
      L.stat('health', -1.8);
      if (api.say('back', 7)) api.add('Спина напомнила, сколько вы на ней перенесли.', 'bad');
    }
  });

  m('stress', 'Стресс', 'late', function (L) { return L.age >= 18; }, function (L, api) {
    var s = (L.money < 0 ? 1 : 0) + (L.job && L.job.burnout > 60 ? 1 : 0) + (L.marital === 'divorced' ? 0.5 : 0);
    if (s) { L.stat('health', -0.5 * s); L.stat('happy', -0.8 * s); }
  });

  m('addiction-creep', 'Привычки', 'late', function (L) { return L.age >= 16; }, function (L, api) {
    if (L.has('smoker') && api.chance(0.08) && L.age > 45) L.stat('health', -1.5);
    if (!L.has('smoker') && api.chance(poor(L.c) ? 0.035 : 0.02) && L.age < 30) {
      L.flag('smoker', true);
      if (api.say('addiction-creep', 15)) api.add('Начали курить за компанию — «на пару месяцев».', 'bad');
    }
  });

  m('recovery', 'Тело восстанавливается', 'late', function (L) { return L.age < 40 && L.stats.health < 70; }, function (L) {
    L.stat('health', 0.8);
  });

  m('chronic-start', 'Хроника приходит', 'late', function (L) { return L.age >= 40 && !L.has('chronic'); }, function (L, api) {
    if (api.chance((L.age - 35) * 0.0025 * (L.stats.health < 50 ? 1.8 : 1))) {
      L.flag('chronic', true);
      api.add('Диагноз, с которым теперь жить: не страшно, но навсегда.', 'bad');
    }
  });

  m('hospital-distance', 'Далеко до больницы', 'late', function (L) { return !L.urban && poor(L.c); }, function (L, api) {
    if (L.stats.health < 45 && api.chance(0.2)) { L.stat('health', -1.5); L.flag('untreated', true); }
  });

  m('caregiving', 'Уход за родителями', 'late', function (L) { return L.age >= 40 && L.parentsAlive > 0; }, function (L, api) {
    if (api.chance(0.22)) {
      L.stat('happy', -1.2); api.spend(L.need * 0.05);
      if (api.say('caregiving', 8)) api.add('Родителям нужна помощь: ваши выходные теперь не ваши.', 'family');
    }
  });

  /* ======================== 3. ЛЮДИ ВОКРУГ (16) ======================== */

  m('neighbours', 'Соседи', 'late', function (L) { return L.age >= 18; }, function (L, api) {
    if (api.chance(0.15)) {
      var good = L.stats.bond > 50;
      L.stat('bond', good ? 0.8 : -0.5);
      if (good && api.chance(0.2) && api.say('neighbours', 7)) api.add('Соседи позвали на общий стол во дворе.', 'family');
    }
  });

  m('friends-drift', 'Друзья расходятся', 'late', function (L) { return L.age >= 25; }, function (L, api) {
    if (api.chance(0.2)) L.stat('bond', -0.7);
    if (L.age === 30 && api.say('friends-drift', 99)) api.add('С половиной школьных друзей вы больше не разговариваете — просто разошлись.', 'neutral');
  });

  m('old-friend', 'Старый друг', 'late', function (L) { return L.age >= 30 && L.stats.bond > 40; }, function (L, api) {
    if (api.chance(0.1) && api.say('old-friend', 6)) { api.add('Позвонил старый друг — говорили три часа.', 'good'); L.stat('happy', 3); L.stat('bond', 2); }
  });

  m('family-help', 'Помощь семьи', 'money', function (L) { return L.stats.bond > 55 && L.money < 0; }, function (L, api) {
    if (api.chance(0.25)) { api.earn(L.need * 0.1); L.stat('bond', -0.5); }
  });

  m('help-others', 'Вы помогаете другим', 'money', function (L) { return L.money > L.need && L.stats.bond > 50; }, function (L, api) {
    if (api.chance(0.3)) { api.spend(L.need * 0.03); L.stat('bond', 1.2); L.stat('happy', 0.8); }
  });

  m('weddings', 'Чужие свадьбы', 'money', function (L) { return L.age >= 20 && L.age <= 45; }, function (L, api) {
    if (api.chance(0.35)) api.spend(L.need * 0.03);
  });

  m('funerals', 'Похороны близких', 'money', function (L) { return L.age >= 35; }, function (L, api) {
    if (api.chance(0.12)) { api.spend(L.need * 0.06); L.stat('happy', -2.5); }
  });

  m('gifts', 'Подарки родным', 'money', function (L) { return kids(L) > 0 || L.partner; }, function (L, api) {
    api.spend(L.need * 0.015 * (1 + kids(L) * 0.4));
    if (api.chance(0.2)) L.stat('bond', 0.6);
  });

  m('reputation', 'Репутация в районе', 'late', function (L) { return L.age >= 20; }, function (L, api) {
    L.rep = clamp((L.rep || 50) + (L.stats.bond > 60 ? 1 : -0.5) + (L.has('investigated') ? -5 : 0), 0, 100);
  });

  m('conflict', 'Ссоры', 'late', function (L) { return L.age >= 16; }, function (L, api) {
    if (api.chance(0.1)) { L.stat('bond', -1.5); L.stat('happy', -1); }
  });

  m('community', 'Община и земляки', 'late', function (L) { return poor(L.c) || !L.urban; }, function (L, api) {
    if (api.chance(0.15)) { L.stat('bond', 1.2); if (L.money < 0 && api.chance(0.3)) api.earn(L.need * 0.05); }
  });

  m('religion', 'Приход, мечеть, храм', 'late', function (L) { return !rich(L.c) || api2(L); }, function (L, api) {
    if (api.chance(0.12)) { L.stat('happy', 1); L.stat('bond', 0.8); api.spend(L.need * 0.004); }
  });
  function api2(L) { return L.age > 60; }

  m('loneliness', 'Одиночество', 'late', function (L) { return L.age >= 60 && !L.partner && !kids(L); }, function (L, api) {
    L.stat('happy', -1.2);
    if (api.chance(0.08) && api.say('loneliness', 10)) api.add('Телефон молчит неделями. Вы научились разговаривать с радио.', 'bad');
  });

  m('grandkids-joy', 'Внуки', 'late', function (L) { return L.grandchildren > 0; }, function (L, api) {
    L.stat('happy', 0.8); L.stat('bond', 0.6);
    if (api.chance(0.15)) api.spend(L.need * 0.02);
  });

  m('pets', 'Животные в доме', 'late', function (L) { return L.has('pet'); }, function (L, api) {
    L.stat('happy', 0.8); api.spend(L.need * 0.02);
    if (api.chance(0.06) && api.say('pets', 12)) { api.add('Ваш пёс прожил свои годы и ушёл. Дом стал тише.', 'bad'); L.stat('happy', -6); L.flag('pet', false); }
  });

  m('mentor', 'Наставник', 'late', function (L) { return L.age >= 18 && L.age <= 35 && working(L); }, function (L, api) {
    if (!L.has('mentor') && api.chance(0.08)) {
      L.flag('mentor', true); L.stat('know', 3);
      if (api.say('mentor', 20)) api.add('Старший коллега взялся вас учить — бесплатно и всерьёз.', 'good');
    }
  });

  /* ==================== 4. УЧЁБА, РАБОТА, ВЕЩИ (16) ==================== */

  m('learning-decay', 'Знания ржавеют', 'late', function (L) { return L.age > 30 && !L.edu.inSchool; }, function (L) {
    L.stat('know', L.focus === 'study' ? 0.2 : -0.15);
  });

  m('self-study', 'Учиться самому', 'late', function (L) { return L.age >= 14 && L.stats.know > 45; }, function (L, api) {
    if (api.chance(0.18)) L.stat('know', 1.2);
  });

  m('language', 'Чужой язык', 'late', function (L) { return L.age >= 12 && L.age <= 45; }, function (L, api) {
    if (!L.has('lang2') && api.chance(L.stats.know / 1200)) {
      L.flag('lang2', true); L.stat('know', 2.5);
      if (api.say('language', 20)) api.add('Вы заговорили на чужом языке без запинки.', 'good');
    }
  });

  m('internet', 'Интернет', 'late', function (L) { return L.year >= 1998; }, function (L, api) {
    if (!L.has('online') && api.chance(rich(L.c) ? 0.6 : poor(L.c) ? 0.2 : 0.4)) {
      L.flag('online', true); L.stat('know', 1.5);
    }
    if (L.has('online')) { api.spend(L.need * 0.008); if (api.chance(0.25)) L.stat('know', 0.4); }
  });

  m('phone-time', 'Экран', 'late', function (L) { return L.year >= 2012 && L.has('online'); }, function (L, api) {
    if (api.chance(0.3)) { L.stat('happy', -0.4); L.stat('bond', -0.3); }
  });

  m('skill-rust', 'Квалификация устаревает', 'late', function (L) { return working(L) && L.age > 45; }, function (L, api) {
    if (api.chance(0.12) && L.job) { L.job.rep = clamp((L.job.rep || 50) - 3, 0, 100); }
  });

  m('courses', 'Курсы', 'late', function (L) { return working(L) && L.age < 60; }, function (L, api) {
    if (api.chance(L.focus === 'study' ? 0.3 : 0.08)) {
      api.spend(L.need * 0.03); L.stat('know', 2);
      if (L.job) L.job.certs = (L.job.certs || 0) + 1;
    }
  });

  m('tools', 'Свой инструмент', 'late', function (L) { return working(L) && M.jobById[L.job.id] && ['manual', 'skilled', 'agri'].indexOf(M.jobById[L.job.id].sector) >= 0; }, function (L, api) {
    if (api.chance(0.15)) { api.spend(L.need * 0.025); if (L.job) L.job.boost = clamp((L.job.boost || 1) + 0.01, 0.5, 2.2); }
  });

  m('uniform', 'Форма и спецодежда', 'money', function (L) { return working(L); }, function (L, api) {
    api.spend(L.need * 0.006);
  });

  m('commute-cost', 'Дорога до работы дорожает', 'money', function (L) { return working(L) && L.job.commute > 40; }, function (L, api) {
    api.spend(L.need * 0.015);
  });

  m('car-life', 'Машина', 'money', function (L) { return L.has('car'); }, function (L, api) {
    api.spend(L.need * 0.05);
    if (api.chance(0.1)) { api.spend(L.need * 0.06); if (api.say('car-life', 5)) api.add('Машина сломалась в дороге — ремонт съел отпускные.', 'money'); }
  });

  m('bicycle', 'Велосипед', 'late', function (L) { return L.has('bike'); }, function (L) { L.stat('health', 0.5); });

  m('home-growth', 'Дом обрастает вещами', 'late', function (L) { return L.home; }, function (L, api) {
    if (api.chance(0.2)) { api.spend(L.need * 0.02); L.stat('happy', 0.5); }
  });

  m('rent-rise', 'Аренда дорожает', 'money', function (L) { return !L.home && L.age >= 20 && !L.homeless; }, function (L, api) {
    api.spend(L.need * (L.urban ? 0.12 : 0.07) * (L.priceLevel ? clamp(L.priceLevel, 1, 2.2) : 1) * 0.5);
    if (api.chance(0.08) && api.say('rent-rise', 6)) api.add('Хозяин поднял плату за комнату — опять искать, где дешевле.', 'bad');
  });

  m('mortgage-life', 'Ипотека', 'money', function (L) { return L.has('mortgage'); }, function (L, api) {
    api.spend(L.need * 0.1);
    if (L.age > 55 && api.chance(0.1) && api.say('mortgage-life', 99)) { api.add('Последний платёж по ипотеке. Дом наконец ваш.', 'good'); L.flag('mortgage', false); L.stat('happy', 6); }
  });

  m('season-work', 'Сезонность', 'money', function (L) { return working(L) && M.jobById[L.job.id] && M.jobById[L.job.id].sector === 'agri'; }, function (L, api) {
    if (api.chance(0.3)) api.earn(L.need * 0.05); else api.spend(L.need * 0.02);
  });

  /* ================== 5. СТРАНА, ВРЕМЯ И СЛУЧАЙ (16) =================== */

  m('economy-cycle', 'Кризис и подъём', 'early', function (L) { return L.age >= 18; }, function (L, api) {
    var st = L.econ || 'ровно';
    if (api.chance(0.12)) st = api.pick(['кризис', 'ровно', 'ровно', 'подъём']);
    L.econ = st;
    if (st === 'кризис') { if (L.job) L.job.boost = clamp((L.job.boost || 1) - 0.02, 0.5, 2.2); if (api.chance(0.1) && api.say('economy-cycle', 7)) api.add('В стране кризис: закрываются даже старые предприятия.', 'bad'); }
    if (st === 'подъём' && L.job) L.job.boost = clamp((L.job.boost || 1) + 0.015, 0.5, 2.2);
  });

  m('currency-fall', 'Курс падает', 'early', function (L) { return !rich(L.c); }, function (L, api) {
    if (api.chance(0.08)) {
      if (L.money > 0) L.money *= 0.9;
      if (api.say('currency-fall', 8)) api.add('Валюта обвалилась за неделю: сбережения похудели.', 'bad');
    }
  });

  m('reform', 'Реформы', 'early', function (L) { return L.age >= 25; }, function (L, api) {
    if (api.chance(0.05)) {
      var kind = api.pick(['пенсионная', 'налоговая', 'школьная', 'медицинская']);
      if (kind === 'пенсионная') L.flag('pensionCut', true);
      if (api.say('reform', 9)) api.add('Объявили реформу: ' + kind + '. Обещают, что будет лучше.', 'neutral');
    }
  });

  m('elections', 'Выборы', 'late', function (L) { return L.age >= 18; }, function (L, api) {
    if (api.chance(0.2)) { L.stat('happy', api.chance(0.5) ? 0.5 : -0.5); }
  });

  m('draft', 'Призыв', 'late', function (L) { return L.sex === 'm' && L.age >= 18 && L.age <= 27 && !L.has('served'); }, function (L, api) {
    if (api.chance(poor(L.c) ? 0.12 : 0.08)) {
      L.flag('served', true); L.stat('health', -1.5); L.stat('know', -1); L.stat('bond', 1);
      api.add('Служба: год вычеркнут из планов, зато появились новые друзья.', 'neutral');
    }
  });

  m('corruption', 'Надо занести', 'money', function (L) { return !rich(L.c) && L.age >= 20; }, function (L, api) {
    if (api.chance(0.12)) { api.spend(L.need * 0.03); L.stat('happy', -0.8); }
  });

  m('fines', 'Штрафы', 'money', function (L) { return L.age >= 18; }, function (L, api) {
    if (api.chance(L.has('car') ? 0.3 : 0.08)) api.spend(L.need * 0.01);
  });

  m('court', 'Суд', 'late', function (L) { return L.age >= 20; }, function (L, api) {
    if (api.chance(0.03)) {
      var win = api.chance(0.5);
      api.add(win ? 'Суд вы выиграли — через полтора года.' : 'Суд проиграли: деньги и время ушли.', win ? 'good' : 'bad');
      if (win) api.earn(L.need * 0.1); else api.spend(L.need * 0.12);
    }
  });

  m('crime-risk', 'Кражи', 'late', function (L) { return L.urban && !rich(L.c); }, function (L, api) {
    if (api.chance(0.05)) {
      var lost = Math.min(Math.max(L.money, 0) * 0.2, L.need * 0.15);
      L.money -= lost;
      if (api.say('crime-risk', 7)) api.add('Обокрали: вынесли технику и деньги из дома.', 'bad');
      L.stat('happy', -3);
    }
  });

  m('fire', 'Пожар', 'late', function (L) { return L.home || !L.urban; }, function (L, api) {
    if (api.chance(0.012)) {
      api.spend(L.need * 0.4); L.stat('happy', -8);
      api.add('Пожар: спасли документы и детей, остальное сгорело.', 'bad');
    }
  });

  m('flood', 'Потоп и непогода', 'late', function (L) { return true; }, function (L, api) {
    if (api.chance(hot(L.c) ? 0.05 : 0.03)) { api.spend(L.need * 0.08); L.stat('happy', -1.5); }
  });

  m('epidemic', 'Эпидемия', 'early', function (L) { return L.year >= 1950; }, function (L, api) {
    if (api.chance(0.02)) {
      L.stat('health', -3); api.spend(L.need * 0.05);
      if (api.say('epidemic', 10)) api.add('Эпидемия: город закрыли, работа встала, все сидят по домам.', 'bad');
    }
  });

  m('migration-pull', 'Уехать или остаться', 'late', function (L) { return L.age >= 18 && L.age <= 45 && !L.abroad && !rich(L.c); }, function (L, api) {
    if (api.chance(0.03) && api.say('migration-pull', 10)) {
      api.add('Полдвора уехало на заработки. Вы пока остались.', 'neutral');
      L.stat('happy', -1);
    }
  });

  m('city-pull', 'Город тянет', 'late', function (L) { return !L.urban && L.age >= 16 && L.age <= 35; }, function (L, api) {
    if (api.chance(0.06)) {
      L.urban = true; L.stat('know', 1.5); api.spend(L.need * 0.1);
      api.add('Вы перебрались в город: комната на двоих и надежда.', 'neutral');
    }
  });

  m('weather-mood', 'Погода и настроение', 'late', function () { return true; }, function (L, api) {
    L.stat('happy', api.rnd() < 0.5 ? 0.3 : -0.3);
  });

  m('luck', 'Просто повезло', 'late', function () { return true; }, function (L, api) {
    if (api.chance(0.04)) {
      api.earn(L.need * 0.05); L.stat('happy', 1.5);
      if (api.chance(0.3) && api.say('luck', 8)) api.add('Нашли деньги на улице — мелочь, а приятно.', 'good');
    }
  });

  /* ==================== 6. ВОЗРАСТ И ПЕРЕХОДЫ (14) ===================== */

  m('childhood-care', 'За ребёнком смотрят', 'early', function (L) { return L.age < 7; }, function (L, api) {
    L.stat('health', L.famPct > 0.5 ? 0.5 : 0.1);
    if (poor(L.c) && api.chance(0.08)) L.stat('health', -1.5);
  });

  m('kindergarten', 'Садик', 'late', function (L) { return L.age >= 3 && L.age <= 6; }, function (L, api) {
    if (api.chance(rich(L.c) ? 0.8 : 0.4)) { L.stat('know', 0.8); L.stat('bond', 0.5); }
  });

  m('school-road', 'Дорога в школу', 'late', function (L) { return L.edu.inSchool && L.age <= 17; }, function (L, api) {
    if (!L.urban && api.chance(0.15)) L.stat('know', -0.5);
  });

  m('teen-body', 'Подростковое', 'late', function (L) { return L.age >= 12 && L.age <= 17; }, function (L, api) {
    L.stat('happy', api.rnd() < 0.5 ? 1 : -1.5); L.stat('bond', 0.5);
  });

  m('first-love', 'Первая влюблённость', 'late', function (L) { return L.age >= 13 && L.age <= 20 && !L.has('firstLove'); }, function (L, api) {
    if (api.chance(0.25)) {
      L.flag('firstLove', true); L.stat('happy', 4); L.stat('bond', 2);
      api.add('Первая влюблённость: мир стал громче и важнее.', 'good');
    }
  });

  m('leaving-home', 'Съехать от родителей', 'late', function (L) { return L.age >= 17 && L.age <= 30 && !L.has('ownPlace'); }, function (L, api) {
    if (working(L) && api.chance(rich(L.c) ? 0.25 : 0.12)) {
      L.flag('ownPlace', true); L.stat('happy', 2); api.spend(L.need * 0.1);
      api.add('Вы съехали от родителей: своя комната, свои счета.', 'neutral');
    }
  });

  m('midlife', 'Середина пути', 'late', function (L) { return L.age >= 40 && L.age <= 50; }, function (L, api) {
    if (api.chance(0.08) && api.say('midlife', 10)) {
      api.add('Посреди обычного дня стало ясно: половина жизни позади.', 'neutral');
      L.stat('happy', -2);
    }
  });

  m('empty-nest', 'Дети выросли', 'late', function (L) { return kids(L) > 0 && L.age >= 45; }, function (L, api) {
    if (!L.has('emptyNest') && api.chance(0.12)) {
      L.flag('emptyNest', true); L.stat('happy', -2); L.stat('bond', -1);
      api.add('Младший уехал учиться. В доме стало тихо.', 'family');
    }
  });

  m('retire-prep', 'Копить на старость', 'money', function (L) { return L.age >= 45 && L.age < 60 && working(L); }, function (L, api) {
    if (L.budget && L.budget.save > 0.12) L.pensionSave = (L.pensionSave || 0) + L.need * 0.02;
  });

  m('retire-shock', 'Первый год на пенсии', 'late', function (L) { return L.retired && !L.has('retiredOnce'); }, function (L, api) {
    L.flag('retiredOnce', true); L.stat('happy', -3); L.stat('health', -1);
    api.add('Первый год без работы: времени много, денег мало, привычки ломаются.', 'neutral');
  });

  m('old-body', 'Старость берёт своё', 'early', function (L) { return L.age >= 70; }, function (L, api) {
    L.stat('health', -0.4);
    if (api.chance(0.1)) { L.stat('health', -1.5); if (api.say('old-body', 6)) api.add('Упали на ровном месте: теперь ходите осторожнее.', 'bad'); }
  });

  m('memory', 'Память', 'late', function (L) { return L.age >= 72; }, function (L, api) {
    if (api.chance(0.12)) { L.stat('know', -1.5); }
  });

  m('legacy-thoughts', 'Что останется', 'late', function (L) { return L.age >= 75; }, function (L, api) {
    if (api.chance(0.1) && api.say('legacy-thoughts', 8)) { api.add('Вы разбирали старые фотографии и подписывали их для внуков.', 'family'); L.stat('happy', 2); }
  });

  m('last-years', 'Последние годы', 'late', function (L) { return L.age >= 85; }, function (L, api) {
    L.stat('happy', L.stats.bond > 55 ? 0.5 : -1);
    if (api.chance(0.15)) api.spend(L.need * 0.04);
  });

  /* ======================================================================
     Движок механик: один проход по хуку, с безопасным API
     ====================================================================== */

  var BY_HOOK = { early: [], money: [], late: [] };
  MECH.forEach(function (x) { (BY_HOOK[x.hook] || BY_HOOK.late).push(x); });

  /* api даёт механикам всё, что им можно: случайность, деньги и голос */
  function makeApi(L) {
    return {
      rnd: L.rnd,
      chance: function (p) { return L.rnd() < clamp(p, 0, 1); },
      pick: function (a) { return a[Math.floor(L.rnd() * a.length) % a.length]; },
      spend: function (v) { L.mechSpend = (L.mechSpend || 0) + Math.max(0, v || 0); },
      earn: function (v) { L.mechEarn = (L.mechEarn || 0) + Math.max(0, v || 0); },
      add: function (t, k) { if (!L.silent) L.add(t, k || 'neutral'); },
      /* говорить не чаще, чем раз в N лет: летопись не должна тонуть в мелочах */
      say: function (id, years) {
        L.mechSaid = L.mechSaid || {};
        if (L.mechSaid[id] !== undefined && L.age - L.mechSaid[id] < (years || 5)) return false;
        L.mechSaid[id] = L.age;
        return true;
      }
    };
  }

  function run(L, hook) {
    var list = BY_HOOK[hook] || [];
    var api = makeApi(L);
    var fired = 0;
    for (var i = 0; i < list.length; i++) {
      var x = list[i];
      try {
        if (x.when && !x.when(L)) continue;
        x.run(L, api);
        fired++;
        if (L.mechFired) L.mechFired[x.id] = (L.mechFired[x.id] || 0) + 1;
      } catch (e) {
        L.mechErrors = L.mechErrors || [];
        if (L.mechErrors.length < 20) L.mechErrors.push(x.id + ': ' + e.message);
      }
    }
    return fired;
  }

  window.IN8B.mechanics = {
    list: MECH,
    byHook: BY_HOOK,
    run: run,
    count: MECH.length
  };
})();
