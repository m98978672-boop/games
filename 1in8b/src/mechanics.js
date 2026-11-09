/* ============================================================
   1 ИЗ 8 МИЛЛИАРДОВ — 250 механик.
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
     ВТОРАЯ ВОЛНА МЕХАНИК (v1.8): ещё 150 маленьких правил.
     Те же три хука, тот же безопасный api. Каждое правило — это что-то,
     что происходит с человеком само: кофе по дороге, зимние дороги,
     очередь в поликлинике, первая зарплата, внуки по выходным.
     Все суммы — доли годовой потребности need, все сдвиги показателей
     маленькие: за сорок лет они складываются в заметную разницу.
     ====================================================================== */

  function sectorOf(L) { var j = L.job && M.jobById[L.job.id]; return j ? j.sector : null; }
  function kidAged(L, lo, hi) {
    var k = L.children || [];
    for (var i = 0; i < k.length; i++) { var a = L.age - k[i].bornAt; if (a >= lo && a <= hi) return true; }
    return false;
  }
  function adult(L) { return L.age >= 18; }
  function married(L) { return L.marital === 'married' || L.marital === 'partner'; }

  /* ================= 7. ДЕНЬГИ И БЫТ: ещё тридцать (30) ================ */

  m('grocery-run', 'Еженедельные продукты', 'money', adult, function (L, api) {
    api.spend(L.need * (0.012 + kids(L) * 0.004) * (poor(L.c) ? 1.2 : 1));
  });

  m('cheap-brands', 'Переход на дешёвое', 'money', function (L) { return adult(L) && L.money < 0; }, function (L, api) {
    L.stat('happy', -0.3);
    if (api.say('cheap-brands', 9)) api.add('Вы перешли на самые дешёвые марки — это заметно по вкусу еды.', 'money');
  });

  m('market-haggle', 'Торг на рынке', 'money', function (L) { return adult(L) && !rich(L.c); }, function (L, api) {
    if (api.chance(0.4)) api.earn(L.need * 0.004);
  });

  m('sale-season', 'Распродажи', 'money', function (L) { return adult(L) && !poor(L.c); }, function (L, api) {
    if (api.chance(0.3)) { api.spend(L.need * 0.012); L.stat('happy', 0.25); }
  });

  m('repair-not-buy', 'Чинить, а не покупать', 'money', function (L) { return adult(L) && !rich(L.c); }, function (L, api) {
    if (api.chance(0.25)) { api.earn(L.need * 0.006); L.stat('happy', -0.1); }
  });

  m('street-coffee', 'Кофе по дороге', 'money', function (L) { return working(L) && L.urban && L.year >= 1995; }, function (L, api) {
    api.spend(L.need * (rich(L.c) ? 0.012 : 0.005)); L.stat('happy', 0.25);
  });

  m('subscription', 'Подписки', 'money', function (L) { return adult(L) && L.year >= 2012 && !poor(L.c); }, function (L, api) {
    api.spend(L.need * 0.009);
    if (api.chance(0.12) && api.say('subscription', 11)) api.add('Вы посчитали подписки и половину отключили.', 'money');
  });

  m('phone-bill', 'Связь', 'money', function (L) { return L.age >= 14 && L.year >= 1998; }, function (L, api) {
    api.spend(L.need * 0.006);
  });

  m('tax-refund', 'Налоговый вычет', 'money', function (L) { return working(L) && !poor(L.c) && L.job.contract === 'official'; }, function (L, api) {
    if (api.chance(0.22)) {
      api.earn(L.need * 0.03);
      if (api.say('tax-refund', 8)) api.add('Вернули часть налога — неожиданные деньги в начале года.', 'money');
    }
  });

  m('pension-contrib', 'Отчисления на пенсию', 'money', function (L) { return working(L) && L.job.contract === 'official'; }, function (L, api) {
    L.pensionSave = (L.pensionSave || 0) + L.need * 0.015;
  });

  m('informal-tips', 'Чаевые', 'money', function (L) { return working(L) && sectorOf(L) === 'service'; }, function (L, api) {
    api.earn(L.need * (rich(L.c) ? 0.05 : 0.03));
  });

  m('overtime-pay', 'Сверхурочные', 'money', function (L) { return working(L); }, function (L, api) {
    if (api.chance(0.3)) {
      api.earn(L.need * 0.035); L.stat('health', -0.12); L.stat('bond', -0.1);
    }
  });

  m('side-gig', 'Подработка по вечерам', 'money', function (L) { return adult(L) && L.age < 65 && L.money < L.need * 0.3; }, function (L, api) {
    if (api.chance(0.35)) {
      api.earn(L.need * 0.05); L.stat('health', -0.15); L.stat('happy', -0.2);
      if (api.say('side-gig', 7)) api.add('Вечерами вы подрабатываете: денег чуть больше, сил — меньше.', 'work');
    }
  });

  m('barter', 'Обмен без денег', 'money', function (L) { return poor(L.c) && !L.urban && adult(L); }, function (L, api) {
    if (api.chance(0.3)) { api.earn(L.need * 0.012); L.stat('bond', 0.3); }
  });

  m('family-pot', 'Общий котёл семьи', 'money', function (L) { return kids(L) > 0 && !rich(L.c); }, function (L, api) {
    api.spend(L.need * 0.01 * Math.min(kids(L), 4));
  });

  m('remittance-send', 'Переводы родным', 'money', function (L) { return working(L) && (L.abroad || (L.urban && !rich(L.c))) && L.parentsAlive > 0; }, function (L, api) {
    if (api.chance(0.5)) { api.spend(L.need * 0.04); L.stat('bond', 0.5); }
  });

  m('remittance-get', 'Переводы от родных', 'money', function (L) { return !rich(L.c) && L.age >= 16 && L.money < 0; }, function (L, api) {
    if (api.chance(0.2)) { api.earn(L.need * 0.05); L.stat('bond', 0.3); }
  });

  m('utility-debt', 'Долг за коммуналку', 'money', function (L) { return adult(L) && L.money < -L.need * 0.2 && !L.homeless; }, function (L, api) {
    L.stat('happy', -0.4);
    if (api.chance(0.15) && api.say('utility-debt', 6)) api.add('Пришло уведомление о долге за квартиру.', 'bad');
  });

  m('microloan-temptation', 'Микрозайм на углу', 'late', function (L) { return adult(L) && L.money < 0 && L.year >= 2005; }, function (L, api) {
    if (api.chance(0.1)) {
      L.stat('happy', -0.4);
      if (api.say('microloan-temptation', 9)) api.add('Вывеска «деньги за пять минут» теперь висит у дома. Вы прошли мимо.', 'money');
    }
  });

  m('savings-jar', 'Банка на полке', 'money', function (L) { return adult(L) && L.money > 0 && !rich(L.c); }, function (L, api) {
    if (api.chance(0.3)) L.jar = (L.jar || 0) + L.need * 0.01;
  });

  m('gold-ring', 'Золото как сбережение', 'money', function (L) { return adult(L) && !rich(L.c) && L.money > L.need * 0.5 && !L.has('gold'); }, function (L, api) {
    if (api.chance(0.06)) {
      api.spend(L.need * 0.08); L.flag('gold', true);
      if (api.say('gold-ring', 12)) api.add('Вы купили золотое кольцо — так надёжнее, чем держать деньги.', 'money');
    }
  });

  m('sell-gold', 'Продать золото', 'money', function (L) { return L.has('gold') && L.money < -L.need * 0.3; }, function (L, api) {
    L.flag('gold', false); api.earn(L.need * 0.09); L.stat('happy', -0.6);
    if (api.say('sell-gold', 10)) api.add('Пришлось отнести кольцо в ломбард.', 'bad');
  });

  m('second-hand', 'Вторая рука', 'money', function (L) { return adult(L) && (poor(L.c) || L.money < 0); }, function (L, api) {
    if (api.chance(0.3)) { api.earn(L.need * 0.008); L.stat('happy', -0.1); }
  });

  m('bulk-buy', 'Запасы на зиму', 'money', function (L) { return adult(L) && cold(L.c); }, function (L, api) {
    api.spend(L.need * 0.02);
    if (api.chance(0.1) && api.say('bulk-buy', 10)) api.add('Балкон забит банками и мешками: зима длинная.', 'money');
  });

  m('fuel-price', 'Бензин дорожает', 'money', function (L) { return L.has('car'); }, function (L, api) {
    api.spend(L.need * 0.02 * (L.priceLevel || 1));
  });

  m('car-insurance', 'Страховка машины', 'money', function (L) { return L.has('car') && !poor(L.c); }, function (L, api) {
    api.spend(L.need * 0.015);
  });

  m('health-insurance', 'Медицинская страховка', 'money', function (L) { return working(L) && rich(L.c); }, function (L, api) {
    api.spend(L.need * 0.025); L.stat('health', 0.3);
  });

  m('school-fees-small', 'Сборы в школе', 'money', function (L) { return kidAged(L, 6, 17) && !rich(L.c); }, function (L, api) {
    api.spend(L.need * 0.012);
    if (api.chance(0.1) && api.say('school-fees-small', 7)) api.add('Опять сбор на ремонт класса и подарки учителям.', 'money');
  });

  m('inherit-small', 'Небольшое наследство', 'late', function (L) { return L.age >= 35 && L.age <= 75 && L.parentsAlive < 2; }, function (L, api) {
    if (api.chance(0.012)) {
      L.addMoney(L.need * (rich(L.c) ? 1.6 : 0.7));
      api.add('Вам досталось небольшое наследство: деньги и старые фотографии.', 'money');
    }
  });

  m('money-talk', 'Разговор о деньгах дома', 'late', function (L) { return married(L) && adult(L); }, function (L, api) {
    if (api.chance(0.12)) L.stat(L.money > 0 ? 'bond' : 'happy', L.money > 0 ? 0.3 : -0.5);
  });

  /* ============== 8. ТЕЛО И ЗДОРОВЬЕ: ещё двадцать пять (25) =========== */

  m('morning-walk', 'Утренняя ходьба', 'late', function (L) { return L.age >= 25; }, function (L, api) {
    if (api.chance(0.35)) { L.stat('health', 0.4); L.stat('happy', 0.12); }
  });

  m('gym', 'Спортзал', 'money', function (L) { return L.age >= 16 && L.age <= 60 && L.urban && !poor(L.c) && L.year >= 1980; }, function (L, api) {
    if (api.chance(0.3)) { api.spend(L.need * 0.015); L.stat('health', 0.7); L.stat('happy', 0.2); }
  });

  m('smoking', 'Сигареты', 'money', function (L) { return L.age >= 16; }, function (L, api) {
    if (!L.has('smoker') && api.chance(L.age < 25 ? 0.035 : 0.006) && (poor(L.c) || api.chance(0.5))) L.flag('smoker', true);
    if (L.has('smoker')) {
      api.spend(L.need * 0.02); L.stat('health', -0.3);
      if (api.chance(0.05) && api.say('smoking', 12)) api.add('Пачка в день — привычка, которую не считают расходом.', 'bad');
    }
  });

  m('quit-smoking', 'Бросить курить', 'late', function (L) { return L.has('smoker') && L.age >= 30; }, function (L, api) {
    if (api.chance(0.07)) {
      L.flag('smoker', false); L.stat('health', 1.5); L.stat('happy', -0.5);
      api.add('Вы бросили курить. Первые месяцы были злыми.', 'good');
    }
  });

  m('drinking', 'Выпивка', 'money', function (L) { return L.age >= 18; }, function (L, api) {
    var p = (cold(L.c) ? 0.3 : 0.2) * (L.stats.happy < 40 ? 1.5 : 1);
    if (api.chance(p)) { api.spend(L.need * 0.012); L.stat('health', -0.2); L.stat('happy', 0.2); }
  });

  m('dentist-visit', 'Поход к стоматологу', 'money', function (L) { return L.age >= 18 && !poor(L.c); }, function (L, api) {
    if (api.chance(0.3)) { api.spend(L.need * 0.02); L.stat('health', 0.3); }
  });

  m('eyes-screen', 'Экран весь день', 'late', function (L) { return L.year >= 2000 && (sectorOf(L) === 'prof' || sectorOf(L) === 'elite'); }, function (L, api) {
    L.stat('health', -0.07); L.stat('know', 0.1);
  });

  m('posture', 'Сидячая работа', 'late', function (L) { return working(L) && (sectorOf(L) === 'prof' || sectorOf(L) === 'elite' || sectorOf(L) === 'service'); }, function (L, api) {
    if (api.chance(0.3)) L.stat('health', -0.1);
  });

  m('vitamin-d', 'Мало солнца', 'late', function (L) { return cold(L.c); }, function (L, api) {
    L.stat('health', -0.06); if (api.chance(0.2)) L.stat('happy', -0.3);
  });

  m('heat-sleep', 'Душные ночи', 'late', function (L) { return hot(L.c) && !L.has('ac'); }, function (L, api) {
    if (api.chance(0.4)) { L.stat('happy', -0.25); L.stat('health', -0.05); }
  });

  m('allergy-season', 'Сезон пыльцы', 'late', function (L) { return L.has('allergy') || L.has('chronic') || !L.urban; }, function (L, api) {
    if (api.chance(0.5)) L.stat('health', -0.15);
  });

  m('flu-season', 'Сезон простуд', 'late', function (L) { return true; }, function (L, api) {
    if (api.chance(L.age < 10 || L.age > 65 ? 0.35 : 0.25)) {
      L.stat('health', -0.22);
      if (api.chance(0.3)) api.spend(L.need * 0.006);
    }
  });

  m('food-poison', 'Отравление', 'late', function (L) { return poor(L.c) || hot(L.c); }, function (L, api) {
    if (api.chance(0.06)) { L.stat('health', -0.6); if (api.say('food-poison', 8)) api.add('Два дня вы не могли встать: что-то не то съели.', 'bad'); }
  });

  m('injury-home', 'Бытовая травма', 'late', function (L) { return L.age >= 3; }, function (L, api) {
    if (api.chance(0.04)) {
      L.stat('health', -0.7); api.spend(L.need * 0.01);
      if (api.say('injury-home', 7)) api.add('Неудачно оступились дома — рука в гипсе.', 'bad');
    }
  });

  m('blood-pressure', 'Давление', 'early', function (L) { return L.age >= 45; }, function (L, api) {
    L.stat('health', -0.1);
    if (api.chance(0.05) && !L.has('chronic')) { L.flag('chronic', true); if (api.say('blood-pressure', 10)) api.add('Врач записал вам гипертонию и выписал таблетки навсегда.', 'bad'); }
  });

  m('cholesterol', 'Холестерин', 'late', function (L) { return L.age >= 40 && !poor(L.c); }, function (L, api) {
    if (api.chance(0.25)) L.stat('health', -0.1);
  });

  m('diabetes-risk', 'Сахар', 'late', function (L) { return L.age >= 45; }, function (L, api) {
    if (!L.has('diabetes') && api.chance(rich(L.c) ? 0.012 : 0.018)) {
      L.flag('diabetes', true); L.flag('chronic', true); L.stat('health', -1);
      api.add('Анализы показали диабет. Теперь есть список запрещённого.', 'bad');
    }
    if (L.has('diabetes')) { api.spend(L.need * 0.015); L.stat('health', -0.1); }
  });

  m('physio', 'Лечебная физкультура', 'money', function (L) { return L.has('chronic') && L.age >= 35; }, function (L, api) {
    if (api.chance(0.3)) { api.spend(L.need * 0.015); L.stat('health', 0.55); }
  });

  m('hospital-queue', 'Очередь в поликлинике', 'late', function (L) { return L.age >= 50 && !rich(L.c); }, function (L, api) {
    if (api.chance(0.3)) L.stat('happy', -0.3);
  });

  m('medicine-cost', 'Лекарства', 'money', function (L) { return L.age >= 55 || L.has('chronic'); }, function (L, api) {
    api.spend(L.need * (poor(L.c) ? 0.03 : 0.02));
  });

  m('hearing-loss', 'Слух садится', 'late', function (L) { return L.age >= 60; }, function (L, api) {
    if (api.chance(0.2)) { L.stat('bond', -0.2); if (api.chance(0.1) && api.say('hearing-loss', 9)) api.add('Телевизор приходится делать громче, чем нравится домашним.', 'neutral'); }
  });

  m('sleep-apnea', 'Храп', 'late', function (L) { return L.age >= 45; }, function (L, api) {
    if (api.chance(0.12)) { L.stat('health', -0.12); if (married(L)) L.stat('bond', -0.1); }
  });

  m('mental-help', 'Разговор с психологом', 'money', function (L) { return L.age >= 16 && L.stats.happy < 42 && L.year >= 1995 && !poor(L.c); }, function (L, api) {
    if (api.chance(0.15)) {
      api.spend(L.need * 0.025); L.stat('happy', 1.6);
      if (api.say('mental-help', 6)) api.add('Вы начали ходить к психологу. Сначала было неловко.', 'good');
    }
  });

  m('burnout-creep', 'Выгорание подкрадывается', 'late', function (L) { return working(L) && L.age >= 25; }, function (L, api) {
    if (L.job && (L.job.overtime || 0) > 3 && api.chance(0.2)) {
      L.job.burnout = clamp((L.job.burnout || 0) + 4, 0, 100);
      L.stat('happy', -0.6);
    }
  });

  m('recovery-walks', 'Восстановление после болезни', 'late', function (L) { return L.has('chronic') && L.stats.health < 55; }, function (L, api) {
    if (api.chance(0.35)) L.stat('health', 0.35);
  });

  /* ================ 9. ЛЮДИ ВОКРУГ: ещё двадцать пять (25) ============= */

  m('birthday', 'День рождения', 'money', function (L) { return L.age >= 3; }, function (L, api) {
    api.spend(L.need * (rich(L.c) ? 0.02 : 0.012));
    L.stat('happy', L.stats.bond > 50 ? 0.5 : 0.15);
  });

  m('new-year', 'Праздники', 'money', function (L) { return L.age >= 3; }, function (L, api) {
    api.spend(L.need * 0.022); L.stat('happy', 0.4); L.stat('bond', 0.25);
  });

  m('school-friends', 'Школьные друзья', 'late', function (L) { return L.edu.inSchool; }, function (L, api) {
    L.stat('bond', 0.4);
    if (api.chance(0.08) && api.say('school-friends', 8)) api.add('Полкласса подружилось на всю жизнь — вы в их числе.', 'good');
  });

  m('colleagues', 'Коллеги', 'late', working, function (L, api) {
    L.stat('bond', 0.25);
    if (L.job && L.job.mood > 70 && api.chance(0.1)) L.stat('happy', 0.3);
  });

  m('office-party', 'Корпоратив', 'late', function (L) { return working(L) && L.urban; }, function (L, api) {
    if (api.chance(0.3)) { L.stat('happy', 0.4); L.stat('bond', 0.3); }
  });

  m('neighbour-conflict', 'Ссора с соседями', 'late', function (L) { return adult(L) && L.urban; }, function (L, api) {
    if (api.chance(0.07)) {
      L.stat('happy', -0.7); L.stat('bond', -0.4);
      if (api.say('neighbour-conflict', 8)) api.add('Соседи сверху делают ремонт третий месяц.', 'bad');
    }
  });

  m('borrow-tool', 'Одолжить соседу', 'late', function (L) { return adult(L) && !L.urban; }, function (L, api) {
    if (api.chance(0.3)) L.stat('bond', 0.35);
  });

  m('babysit-help', 'Посидеть с чужими детьми', 'late', function (L) { return adult(L) && L.stats.bond > 55; }, function (L, api) {
    if (api.chance(0.2)) { L.stat('bond', 0.5); L.stat('happy', 0.2); }
  });

  m('elder-respect', 'Уважение к старшим', 'late', function (L) { return L.age >= 65 && !rich(L.c); }, function (L, api) {
    L.stat('happy', 0.2);
  });

  m('in-laws', 'Родня супруга', 'late', married, function (L, api) {
    if (api.chance(0.25)) L.stat(api.chance(0.55) ? 'bond' : 'happy', api.chance(0.55) ? 0.3 : -0.4);
  });

  m('family-dinner', 'Воскресный обед', 'late', function (L) { return kids(L) > 0 || L.parentsAlive > 0; }, function (L, api) {
    if (api.chance(0.4)) { L.stat('bond', 0.3); L.stat('happy', 0.15); }
  });

  m('village-gossip', 'Деревенские разговоры', 'late', function (L) { return adult(L) && !L.urban; }, function (L, api) {
    if (api.chance(0.2)) L.stat('happy', api.chance(0.5) ? 0.3 : -0.3);
  });

  m('city-anonymity', 'Город не спрашивает имени', 'late', function (L) { return adult(L) && L.urban; }, function (L, api) {
    L.stat('bond', -0.12);
  });

  m('club-hobby', 'Кружок по интересам', 'money', function (L) { return L.age >= 8 && L.age <= 75; }, function (L, api) {
    if (api.chance(0.15)) {
      api.spend(L.need * 0.008); L.stat('happy', 0.5); L.stat('bond', 0.3);
      if (api.chance(0.1) && api.say('club-hobby', 9)) api.add('Вы нашли своих людей — раз в неделю вместе занимаетесь любимым делом.', 'good');
    }
  });

  m('volunteer', 'Волонтёрство', 'late', function (L) { return adult(L) && L.stats.bond > 60; }, function (L, api) {
    if (api.chance(0.15)) { L.stat('happy', 0.3); L.stat('bond', 0.3); }
  });

  m('charity-give', 'Пожертвование', 'money', function (L) { return adult(L) && L.money > L.need * 0.5; }, function (L, api) {
    if (api.chance(0.25)) { api.spend(L.need * 0.008); L.stat('happy', 0.35); }
  });

  m('funeral-help', 'Собрать на похороны', 'money', function (L) { return adult(L) && !rich(L.c); }, function (L, api) {
    if (api.chance(0.12)) { api.spend(L.need * 0.015); L.stat('bond', 0.4); }
  });

  m('anniversary', 'Годовщина', 'money', function (L) { return married(L); }, function (L, api) {
    api.spend(L.need * 0.008); L.stat('happy', 0.5); L.stat('bond', 0.3);
  });

  m('quarrel-partner', 'Домашняя ссора', 'late', married, function (L, api) {
    if (api.chance(0.22)) { L.stat('happy', -0.6); L.stat('bond', -0.35); L.flag('quarrel', true); }
  });

  m('make-up', 'Помирились', 'late', function (L) { return married(L) && L.has('quarrel'); }, function (L, api) {
    if (api.chance(0.7)) { L.flag('quarrel', false); L.stat('happy', 0.5); L.stat('bond', 0.4); }
  });

  m('long-distance', 'Жизнь на два города', 'late', function (L) { return married(L) && (L.abroad || L.moves > 2); }, function (L, api) {
    if (api.chance(0.25)) { L.stat('happy', -0.4); L.stat('bond', -0.2); }
  });

  m('letters', 'Письма и звонки', 'late', function (L) { return L.age >= 12; }, function (L, api) {
    if (api.chance(0.3)) L.stat('bond', 0.2);
  });

  m('social-media', 'Лента в телефоне', 'late', function (L) { return L.age >= 12 && L.year >= 2008; }, function (L, api) {
    if (api.chance(0.5)) { L.stat('happy', api.chance(0.5) ? 0.25 : -0.35); L.stat('bond', 0.1); }
  });

  m('reunion', 'Встреча выпускников', 'late', function (L) { return L.age >= 28 && L.age <= 65; }, function (L, api) {
    if (api.chance(0.05)) {
      L.stat('happy', 0.9); L.stat('bond', 0.5);
      if (api.say('reunion', 10)) api.add('Встреча выпускников: все изменились, а разговоры те же.', 'good');
    }
  });

  m('rumours', 'Про вас говорят', 'late', adult, function (L, api) {
    if (api.chance(0.05)) L.stat('happy', -0.4);
  });

  /* =========== 10. УЧЁБА, РАБОТА И ВЕЩИ: ещё двадцать пять (25) ======== */

  m('homework', 'Домашние задания', 'late', function (L) { return L.edu.inSchool; }, function (L, api) {
    L.stat('know', 0.25); if (api.chance(0.3)) L.stat('happy', -0.2);
  });

  m('exam-stress', 'Экзамены', 'late', function (L) { return L.edu.inSchool && L.age >= 14; }, function (L, api) {
    L.stat('happy', -0.4); L.stat('know', 0.3);
    if (api.chance(0.1) && api.say('exam-stress', 6)) api.add('Ночь перед экзаменом вы не спали.', 'neutral');
  });

  m('tutor', 'Репетитор', 'money', function (L) { return L.edu.inSchool && L.age >= 12 && !poor(L.c); }, function (L, api) {
    if (api.chance(0.25)) { api.spend(L.need * 0.02); L.stat('know', 0.6); }
  });

  m('school-meal', 'Школьная столовая', 'money', function (L) { return L.edu.inSchool; }, function (L, api) {
    api.spend(L.need * 0.005);
  });

  m('library-card', 'Библиотека', 'late', function (L) { return L.edu.inSchool || L.stats.know > 22; }, function (L, api) {
    if (api.chance(0.25)) L.stat('know', 0.3);
  });

  m('night-shift', 'Ночные смены', 'late', function (L) { return working(L) && L.job.schedule === 'night'; }, function (L, api) {
    L.stat('health', -0.2); if (api.chance(0.1) && api.say('night-shift', 8)) api.add('Ночные смены сбили сон: днём вы спите, ночью работаете.', 'work');
  });

  m('boss-bad', 'Тяжёлый начальник', 'late', function (L) { return working(L) && L.job.boss < 0; }, function (L, api) {
    if (api.chance(0.25)) { L.stat('happy', -0.5); if (L.job) L.job.mood = clamp(L.job.mood - 1.5, 5, 95); }
  });

  m('boss-good', 'Начальник на вашей стороне', 'late', function (L) { return working(L) && L.job.boss > 0; }, function (L, api) {
    if (api.chance(0.2)) { L.stat('happy', 0.4); if (L.job) L.job.rep = clamp(L.job.rep + 1, 5, 95); }
  });

  m('promotion-talk', 'Разговор о повышении', 'late', function (L) { return working(L) && L.age >= 24 && L.job.years >= 2; }, function (L, api) {
    if (api.chance(0.1)) {
      if (L.job) L.job.boost = clamp((L.job.boost || 1) + 0.02, 0.5, 1.08);
      L.stat('happy', 0.3);
    }
  });

  m('layoff-rumor', 'Слухи о сокращении', 'late', function (L) { return working(L) && L.econ === 'кризис'; }, function (L, api) {
    if (api.chance(0.3)) { L.stat('happy', -0.6); if (L.job) L.job.mood = clamp(L.job.mood - 2, 5, 95); }
  });

  m('union-shop', 'Профсоюз', 'late', function (L) { return working(L) && L.job.union; }, function (L, api) {
    L.stat('bond', 0.2);
    if (api.chance(0.08)) { if (L.job) L.job.boost = clamp((L.job.boost || 1) + 0.01, 0.5, 1.08); }
  });

  m('work-scratch', 'Мелкие травмы на работе', 'late', function (L) { return working(L) && L.job.risk > 1.2; }, function (L, api) {
    if (api.chance(0.2 * (1 - (L.job.safety || 0.5)))) L.stat('health', -0.3);
  });

  m('commute-jam', 'Пробки', 'late', function (L) { return working(L) && L.urban && L.has('car'); }, function (L, api) {
    if (api.chance(0.4)) L.stat('happy', -0.25);
  });

  m('remote-work', 'Работа из дома', 'late', function (L) { return working(L) && L.year >= 2020 && (sectorOf(L) === 'prof' || sectorOf(L) === 'elite'); }, function (L, api) {
    if (!L.job.remote && api.chance(0.3)) {
      L.job.remote = true; L.stat('happy', 0.6); L.stat('health', 0.2);
      if (api.say('remote-work', 9)) api.add('Вы перешли на работу из дома: кухня стала кабинетом.', 'work');
    }
  });

  m('skill-course', 'Курсы по специальности', 'money', function (L) { return working(L) && L.age >= 22 && L.age <= 58; }, function (L, api) {
    if (api.chance(0.04)) {
      api.spend(L.need * 0.02); L.stat('know', 0.8);
      if (L.job) L.job.certs = Math.min((L.job.certs || 0) + 1, 6);
    }
  });

  m('certificate', 'Разряд и сертификат', 'late', function (L) { return working(L) && (L.job.certs || 0) >= 2; }, function (L, api) {
    if (api.chance(0.15)) {
      if (L.job) L.job.boost = clamp((L.job.boost || 1) + 0.03, 0.5, 1.08);
      if (api.say('certificate', 8)) api.add('Вы подтвердили разряд — это сразу видно в зарплате.', 'work');
    }
  });

  m('toolkit-buy', 'Свой инструмент', 'money', function (L) { return working(L) && (sectorOf(L) === 'skilled' || sectorOf(L) === 'manual'); }, function (L, api) {
    if (api.chance(0.15)) { api.spend(L.need * 0.02); if (L.job) L.job.boost = clamp((L.job.boost || 1) + 0.01, 0.5, 1.08); }
  });

  m('workwear', 'Спецодежда', 'money', function (L) { return working(L) && (sectorOf(L) === 'manual' || sectorOf(L) === 'agri'); }, function (L, api) {
    api.spend(L.need * 0.006);
  });

  m('phone-upgrade', 'Новый телефон', 'money', function (L) { return L.age >= 14 && L.year >= 2005; }, function (L, api) {
    if (api.chance(0.18)) { api.spend(L.need * (rich(L.c) ? 0.035 : 0.05)); L.stat('happy', 0.4); }
  });

  m('computer-home', 'Компьютер дома', 'money', function (L) { return L.year >= 1995 && !poor(L.c) && !L.has('pc'); }, function (L, api) {
    if (api.chance(0.12)) {
      api.spend(L.need * 0.06); L.flag('pc', true); L.stat('know', 0.6); L.stat('happy', 0.5);
      api.add('В доме появился компьютер.', 'good');
    }
  });

  m('internet-slow', 'Интернет еле тянет', 'late', function (L) { return L.year >= 2000 && !L.urban; }, function (L, api) {
    if (api.chance(0.3)) L.stat('happy', -0.2);
  });

  m('furniture', 'Мебель в дом', 'money', function (L) { return L.home && adult(L); }, function (L, api) {
    if (api.chance(0.15)) { api.spend(L.need * 0.03); L.stat('happy', 0.4); }
  });

  m('appliance-buy', 'Новая техника в дом', 'money', function (L) { return adult(L) && !poor(L.c); }, function (L, api) {
    if (api.chance(0.12)) { api.spend(L.need * 0.04); L.stat('happy', 0.45); }
  });

  m('garden-plot', 'Огород', 'money', function (L) { return adult(L) && (!L.urban || L.has('dacha')); }, function (L, api) {
    if (api.chance(0.5)) { api.earn(L.need * 0.025); L.stat('health', 0.22); L.stat('happy', 0.15); }
  });

  /* ========== 11. СТРАНА, ВРЕМЯ И ПРИРОДА: ещё двадцать пять (25) ====== */

  m('winter-roads', 'Зимние дороги', 'late', function (L) { return cold(L.c) && adult(L); }, function (L, api) {
    if (api.chance(0.15)) { L.stat('health', -0.2); L.stat('happy', -0.2); }
  });

  m('summer-heat', 'Жара', 'late', function (L) { return hot(L.c); }, function (L, api) {
    if (api.chance(0.3)) { L.stat('health', -0.12); if (L.age > 70) L.stat('health', -0.15); }
  });

  m('monsoon', 'Сезон дождей', 'money', function (L) { return ['in', 'bd', 'pk', 'np', 'mm', 'th', 'vn', 'ph', 'id', 'lk', 'kh', 'la'].indexOf(L.c.code) >= 0; }, function (L, api) {
    if (api.chance(0.4)) { api.spend(L.need * 0.01); L.stat('happy', -0.2); }
  });

  m('drought', 'Засуха', 'money', function (L) { return sectorOf(L) === 'agri' || (!L.urban && poor(L.c)); }, function (L, api) {
    if (api.chance(0.08)) {
      api.spend(L.need * 0.03); L.stat('happy', -0.5);
      if (api.say('drought', 9)) api.add('Засуха: урожай сгорел, цены на еду поднялись.', 'bad');
    }
  });

  m('harvest-good', 'Хороший урожай', 'money', function (L) { return sectorOf(L) === 'agri'; }, function (L, api) {
    if (api.chance(0.25)) { api.earn(L.need * 0.05); L.stat('happy', 0.5); }
  });

  m('power-cut', 'Отключения света', 'late', function (L) { return poor(L.c) || (L.c.gdp < 14000 && !L.urban); }, function (L, api) {
    if (api.chance(0.3)) L.stat('happy', -0.3);
  });

  m('water-shortage', 'Перебои с водой', 'late', function (L) { return poor(L.c) || hot(L.c); }, function (L, api) {
    if (api.chance(0.2)) { L.stat('health', -0.08); L.stat('happy', -0.2); }
  });

  m('smog', 'Смог над городом', 'late', function (L) { return L.urban && ['cn', 'in', 'pk', 'bd', 'ir', 'eg', 'ng', 'id', 'vn', 'mn', 'th'].indexOf(L.c.code) >= 0; }, function (L, api) {
    L.stat('health', -0.15);
    if (api.chance(0.05) && api.say('smog', 9)) api.add('Воздух в городе такой, что к вечеру першит в горле.', 'bad');
  });

  m('noise-city', 'Шум за окном', 'late', function (L) { return L.urban; }, function (L, api) {
    if (api.chance(0.3)) L.stat('happy', -0.15);
  });

  m('public-transport', 'Общественный транспорт', 'money', function (L) { return L.urban && adult(L) && !L.has('car'); }, function (L, api) {
    api.spend(L.need * 0.012);
  });

  m('road-build', 'Построили дорогу', 'late', function (L) { return !L.urban && !rich(L.c); }, function (L, api) {
    if (api.chance(0.03)) {
      L.stat('happy', 0.6);
      if (api.say('road-build', 20)) api.add('До райцентра наконец проложили асфальт.', 'good');
    }
  });

  m('new-school', 'Открыли школу', 'late', function (L) { return kidAged(L, 3, 15) && poor(L.c); }, function (L, api) {
    if (api.chance(0.04)) { L.stat('happy', 0.5); api.add('В селе открыли новую школу — детям ближе ходить.', 'good'); }
  });

  m('clinic-open', 'Открыли амбулаторию', 'late', function (L) { return !rich(L.c) && !L.urban; }, function (L, api) {
    if (api.chance(0.04)) { L.stat('health', 0.5); L.stat('happy', 0.3); }
  });

  m('price-control', 'Цены заморозили', 'early', function (L) { return adult(L) && !rich(L.c); }, function (L, api) {
    if (api.chance(0.04)) {
      L.priceLevel = clamp((L.priceLevel || 1) * 0.985, 1, 3);
      if (api.say('price-control', 12)) api.add('Власти заморозили цены на хлеб и молоко.', 'neutral');
    }
  });

  m('pension-later', 'Пенсию отодвинули', 'early', function (L) { return L.age >= 40 && L.age <= 62 && !L.retired; }, function (L, api) {
    if (api.chance(0.03) && !L.has('pensionLater')) {
      L.flag('pensionLater', true); L.stat('happy', -0.8);
      api.add('Пенсионный возраст подняли. Работать придётся дольше.', 'bad');
    }
  });

  m('census', 'Перепись населения', 'late', function (L) { return L.age >= 6; }, function (L, api) {
    if (api.chance(0.02) && api.say('census', 10)) api.add('К вам пришёл переписчик: вы — одна строка в большой таблице.', 'neutral');
  });

  m('papers-queue', 'Очередь за документами', 'money', adult, function (L, api) {
    if (api.chance(0.12)) { api.spend(L.need * 0.005); L.stat('happy', -0.2); }
  });

  m('visa-refuse', 'Отказ в визе', 'late', function (L) { return adult(L) && !rich(L.c) && L.age <= 55; }, function (L, api) {
    if (api.chance(0.03)) {
      L.stat('happy', -0.5);
      if (api.say('visa-refuse', 12)) api.add('В визе отказали без объяснений.', 'bad');
    }
  });

  m('emigration-talk', 'Разговоры об отъезде', 'late', function (L) { return L.age >= 18 && L.age <= 45 && !rich(L.c); }, function (L, api) {
    if (api.chance(0.12)) { L.stat('happy', -0.2); L.flag('thinkMove', true); }
  });

  m('bad-news', 'Плохие новости', 'late', function (L) { return L.age >= 12; }, function (L, api) {
    if (api.chance(0.2)) L.stat('happy', -0.25);
  });

  m('isolation', 'Страна закрывается', 'early', function (L) { return adult(L) && !rich(L.c); }, function (L, api) {
    if (api.chance(0.02)) {
      if (L.money > 0) L.money *= 0.97;
      L.stat('happy', -0.5);
      if (api.say('isolation', 12)) api.add('Границы и счета закрываются: мир вокруг стал меньше.', 'bad');
    }
  });

  m('tech-wave', 'Новая техника вокруг', 'late', function (L) { return L.year >= 1985 && L.age >= 10; }, function (L, api) {
    if (api.chance(0.25)) L.stat('know', L.age < 50 ? 0.2 : 0.05);
  });

  m('tv-evening', 'Вечер у телевизора', 'late', function (L) { return L.year >= 1960 && L.age >= 6; }, function (L, api) {
    if (api.chance(0.5)) { L.stat('happy', 0.15); L.stat('health', -0.04); }
  });

  m('radio-morning', 'Утреннее радио', 'late', function (L) { return L.year < 1995 && L.age >= 6; }, function (L, api) {
    if (api.chance(0.4)) L.stat('happy', 0.2);
  });

  m('festival', 'Городской праздник', 'late', function (L) { return L.age >= 4; }, function (L, api) {
    if (api.chance(0.25)) { L.stat('happy', 0.25); L.stat('bond', 0.15); }
  });

  /* ============= 12. ВОЗРАСТ И ПЕРЕХОДЫ: ещё двадцать (20) ============= */

  m('first-steps', 'Первые шаги', 'late', function (L) { return L.age === 1; }, function (L, api) {
    api.add('Вы пошли — держась за палец взрослого.', 'life');
  });

  m('first-word', 'Первое слово', 'late', function (L) { return L.age === 2; }, function (L, api) {
    L.stat('know', 0.8);
    api.add('Первое слово сказано. Дальше их будет много.', 'life');
  });

  m('kindergarten-friends', 'Друзья в саду', 'late', function (L) { return L.age >= 3 && L.age <= 6; }, function (L, api) {
    L.stat('bond', 0.3);
  });

  m('first-bell', 'Первый класс', 'late', function (L) { return L.age === 7 && L.edu.inSchool; }, function (L, api) {
    L.stat('happy', 1);
    api.add('Первый раз в первый класс: форма, букет и чужие большие коридоры.', 'life');
  });

  m('teen-argue', 'Подростковые ссоры', 'late', function (L) { return L.age >= 13 && L.age <= 17; }, function (L, api) {
    if (api.chance(0.4)) { L.stat('happy', -0.4); L.stat('bond', -0.25); }
  });

  m('first-job-teen', 'Первая подработка', 'money', function (L) { return L.age >= 14 && L.age <= 18 && !rich(L.c); }, function (L, api) {
    if (api.chance(0.25)) {
      api.earn(L.need * 0.03); L.stat('know', 0.3);
      if (api.say('first-job-teen', 5)) api.add('Первые свои деньги — заработаны летом.', 'work');
    }
  });

  m('graduation', 'Выпускной', 'money', function (L) { return L.age === 17 || L.age === 18; }, function (L, api) {
    if (L.edu.years >= 9 && api.say('graduation', 99)) {
      api.spend(L.need * 0.02); L.stat('happy', 1);
      api.add('Выпускной: все обещали не теряться.', 'life');
    }
  });

  m('first-flat', 'Своё первое жильё', 'late', function (L) { return L.age >= 19 && L.age <= 40 && !L.home && !L.homeless; }, function (L, api) {
    if (!L.has('ownPlace') && api.chance(0.08)) {
      L.flag('ownPlace', true); L.stat('happy', 1);
      api.add('Вы впервые живёте отдельно: чужая мебель, свои правила.', 'life');
    }
  });

  m('first-salary', 'Первая зарплата', 'late', function (L) { return working(L) && !L.has('firstPay'); }, function (L, api) {
    L.flag('firstPay', true); L.stat('happy', 1.5);
    api.add('Первая зарплата. Половина ушла в тот же вечер.', 'work');
  });

  m('wedding-costs', 'Свадебные расходы', 'money', function (L) { return married(L) && !L.has('weddingPaid'); }, function (L, api) {
    L.flag('weddingPaid', true);
    api.spend(L.need * (poor(L.c) ? 0.25 : 0.15));
  });

  m('newborn-nights', 'Бессонные ночи', 'late', function (L) { return kidAged(L, 0, 1); }, function (L, api) {
    L.stat('health', -0.3); L.stat('happy', 0.4);
    if (api.say('newborn-nights', 4)) api.add('Ночи теперь короткие: ребёнок просыпается каждые два часа.', 'family');
  });

  m('kid-school-start', 'Ребёнок пошёл в школу', 'money', function (L) { return kidAged(L, 6, 7); }, function (L, api) {
    api.spend(L.need * 0.03);
    if (api.say('kid-school-start', 6)) api.add('Собрали ребёнка в школу: форма, ранец, тетради.', 'family');
  });

  m('kid-exams', 'Экзамены у ребёнка', 'late', function (L) { return kidAged(L, 16, 18); }, function (L, api) {
    L.stat('happy', -0.3);
    if (api.chance(0.3)) api.spend(L.need * 0.01);
  });

  m('kid-wedding', 'Свадьба ребёнка', 'money', function (L) { return L.age >= 45 && kids(L) > 0; }, function (L, api) {
    if (api.chance(0.06) && api.say('kid-wedding', 10)) {
      api.spend(L.need * 0.12); L.stat('happy', 2); L.stat('bond', 1);
      api.add('Свадьба у ребёнка. Вы плакали и не скрывали.', 'family');
    }
  });

  m('grandchild-joy', 'Внуки приехали', 'late', function (L) { return L.grandchildren > 0; }, function (L, api) {
    if (api.chance(0.4)) { L.stat('happy', 0.4); L.stat('bond', 0.3); }
  });

  m('parents-ill', 'Болезнь родителей', 'money', function (L) { return L.age >= 35 && L.parentsAlive > 0; }, function (L, api) {
    if (api.chance(0.15)) {
      api.spend(L.need * 0.03); L.stat('happy', -0.5);
      if (api.say('parents-ill', 6)) api.add('Родители болеют: больницы, лекарства, дорога туда и обратно.', 'family');
    }
  });

  m('retire-garden', 'Пенсия и грядки', 'late', function (L) { return L.retired; }, function (L, api) {
    if (api.chance(0.4)) { L.stat('happy', 0.25); L.stat('health', 0.2); }
  });

  m('grandkid-care', 'Сидеть с внуками', 'late', function (L) { return L.retired && L.grandchildren > 0; }, function (L, api) {
    if (api.chance(0.5)) { L.stat('bond', 0.5); L.stat('health', -0.08); }
  });

  m('peers-pass', 'Уходят ровесники', 'late', function (L) { return L.age >= 68; }, function (L, api) {
    if (api.chance(0.18)) {
      L.stat('happy', -0.7); L.stat('bond', -0.3);
      if (api.say('peers-pass', 7)) api.add('Ещё один одноклассник не дожил до встречи.', 'bad');
    }
  });

  m('haircut', 'Стрижка', 'money', function (L) { return L.age >= 3; }, function (L, api) {
    api.spend(L.need * (rich(L.c) ? 0.009 : 0.004));
    if (api.chance(0.05)) L.stat('happy', 0.2);
  });

  m('last-wish', 'Последние распоряжения', 'late', function (L) { return L.age >= 78; }, function (L, api) {
    if (!L.has('willDone') && api.chance(0.12)) {
      L.flag('willDone', true); L.stat('happy', 0.4);
      api.add('Вы написали завещание и впервые за долгое время спали спокойно.', 'neutral');
    }
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
