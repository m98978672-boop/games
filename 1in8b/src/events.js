/* ============================================================
   1 ИЗ 8 МИЛЛИАРДОВ — события и карточки решений.
   ------------------------------------------------------------
   Каждое событие: диапазон возраста, условие, вес и эффект.
   kind:'auto'   — просто случается и попадает в летопись;
   kind:'choice' — останавливает время и ждёт решения игрока
                   (в авторежиме выбор делается нейтрально).

   heavy:true — тяжёлая тема. В мягком режиме такие события
   не выпадают. Сцены не показываются: только факт и
   последствия, рядом — строка о том, где искать помощь.
   ============================================================ */
(function () {
  'use strict';

  var M = window.IN8B.model;
  var clamp = M.clamp;

  /* короткие помощники для условий */
  function poor(c) { return c.gdp < 7000; }
  function rich(c) { return c.gdp > 28000; }
  function rural(L) { return !L.urban; }
  function working(L) { return !!L.job && !L.retired; }
  function hasKids(L) { return L.children.length > 0; }

  var WAR_RISK = {
    af: 3, sy: 3, ye: 3, ss: 2.6, so: 2.6, cd: 2, sd: 2.6, ml: 2, bf: 2.2, ne: 1.6,
    mm: 2, ua: 2.2, ps: 2.6, cf: 2, et: 1.4, ng: 1.4, iq: 1.6, ly: 1.6, cm: 1.1, mz: 1.1
  };
  /* где деньги регулярно обесценивались: вес инфляционных событий */
  var INFLATION = {
    ve: 3.2, zw: 3, ar: 3, lb: 3, sy: 3, sd: 2.8, ye: 2.6, tr: 2.4, ir: 2.2, ng: 2, eg: 2,
    gh: 1.9, et: 1.8, ao: 1.8, ua: 1.8, mw: 1.8, sl: 1.7, pk: 1.6, by: 1.6, mm: 1.6, ht: 1.6,
    la: 1.5, lk: 1.5, ru: 1.4, uz: 1.3, mn: 1.3, br: 1.2, bo: 1.2, mx: 1.1, kz: 1.2
  };
  /* страны, которые во многом живут переводами уехавших */
  var REMIT = {
    tj: 3, ws: 2.6, to: 2.6, np: 2.6, kg: 2.4, ht: 2.4, md: 2.4, hn: 2.2, sv: 2.2, lb: 2.2,
    ph: 2.2, am: 2.2, uz: 2, gt: 2, ni: 2, jm: 2, bd: 1.8, pk: 1.8, lk: 1.8, ge: 1.8, eg: 1.8,
    ma: 1.8, sn: 1.8, ml: 1.8, do: 1.8, ua: 1.6, mx: 1.6, gh: 1.4, ne: 1.4, vn: 1.4, ke: 1.2,
    in: 1.2, ng: 1.2, al: 2, rs: 1.4
  };
  /* где микрозаймы и кассы взаимопомощи — часть обычной жизни */
  var MICRO = {
    bd: 2.6, ke: 2.4, in: 2, ug: 2, ph: 2, tz: 1.8, gh: 1.8, ng: 1.8, pe: 1.8, bo: 1.8,
    id: 1.8, kh: 1.8, np: 1.8, sn: 1.6, za: 1.6, mx: 1.6, pk: 1.6, cm: 1.4, et: 1.4, vn: 1.4
  };
  /* страны, где свадьба по обычаю разоряет семью жениха или невесты */
  var DOWRY = {
    in: 2.6, bd: 2.4, pk: 2.4, np: 2.2, af: 2.2, lk: 1.6, ng: 2, gh: 1.8, ke: 1.6, tz: 1.6,
    ug: 1.6, et: 1.6, sd: 1.8, eg: 1.6, ma: 1.4, tj: 1.8, uz: 1.8, kg: 1.8, az: 1.6, tr: 1.3
  };

  function wmap(map, c, base) { var v = map[c.code]; return v === undefined ? (base || 0) : v; }
  /* до середины девяностых деньги обесценивались почти везде */
  function oldMoney(L) { return L.year < 1995 ? 1.7 : L.year < 2005 ? 1.2 : 1; }
  function invest() { return window.IN8B.invest; }
  function holds(L, id) {
    var IV = invest();
    var h = IV && IV.holdingOf ? IV.holdingOf(L, id) : null;
    return h && h.val > 0 ? h : null;
  }

  var QUAKE = ['tr', 'ir', 'np', 'id', 'ph', 'jp', 'cl', 'pe', 'mx', 'gt', 'ht', 'af', 'pk', 'tw', 'ec', 'sv', 'ni', 'ma'];
  var CYCLONE = ['bd', 'ph', 'mz', 'mg', 'in', 'vn', 'ht', 'fj', 'mm', 'jm', 'hn', 'pg', 'sb', 'cu', 'do'];
  var DROUGHT = ['et', 'so', 'ke', 'sd', 'ss', 'ne', 'ml', 'td', 'mr', 'af', 'ye', 'zw', 'mw', 'mg', 'bf', 'er'];

  /* ======================================================================
     СОБЫТИЯ БЕЗ ВЫБОРА
     ====================================================================== */
  var AUTO = [
    /* ---------------------------- детство ---------------------------- */
    {
      id: 'vaccine', age: [0, 2], w: function (x) { return x.c.gdp > 2500 ? 1.6 : 0.9; },
      run: function (x) {
        x.add('Прививки сделаны вовремя — одна болезнь прошла стороной.', 'health');
        x.stat('health', 3);
      }
    },
    {
      id: 'no-vaccine', age: [0, 3], w: function (x) { return poor(x.c) ? 1.1 : 0.1; },
      run: function (x) {
        x.add('До деревни не доехала прививочная бригада.', 'bad');
        x.stat('health', -4);
      }
    },
    {
      id: 'sibling', age: [1, 14], w: function (x) { return clamp(x.c.tfr - 1.2, 0, 4) * 0.8; },
      run: function (x) {
        x.L.siblings++;
        x.add('В семье родился ещё один ребёнок. Теперь вас ' + (x.L.siblings + 1) + '.', 'family');
        x.stat('bond', 2); x.money(-x.need * 0.05);
      }
    },
    {
      id: 'water', age: [0, 10], w: function (x) { return poor(x.c) && rural(x.L) ? 1.2 : 0.2; },
      run: function (x) {
        x.add('В село провели чистую воду. Дети стали реже болеть.', 'good');
        x.stat('health', 4);
      }
    },
    {
      id: 'electricity', age: [0, 16], w: function (x) { return x.c.gdp < 12000 && rural(x.L) ? 1 : 0.1; },
      run: function (x) {
        x.add('В дом пришло электричество: вечером стало можно читать.', 'good');
        x.stat('know', 3); x.stat('happy', 3);
      }
    },
    {
      id: 'grandparents', age: [2, 12], w: 1.1,
      run: function (x) {
        x.add('Лето у бабушки и дедушки — самое спокойное время года.', 'family');
        x.stat('happy', 4); x.stat('bond', 3);
      }
    },
    {
      id: 'child-illness', age: [0, 9], w: function (x) { return clamp(x.c.u5mr / 22, 0.3, 4); },
      run: function (x) {
        var cost = x.need * 0.12;
        x.add('Тяжёлая болезнь в раннем детстве. Семья потратила на лечение почти всё, что было.', 'bad');
        x.stat('health', -8); x.money(-cost);
      }
    },
    {
      id: 'malaria', age: [0, 60], w: function (x) { return M.malaria.indexOf(x.c.code) >= 0 ? 1.3 : 0; },
      run: function (x) {
        x.add('Малярия. Несколько недель жара и слабости.', 'health');
        x.stat('health', -5);
      }
    },
    {
      id: 'school-open', age: [5, 8], w: function (x) { return x.c.school < 7 ? 1.2 : 0.3; },
      run: function (x) {
        x.add('В соседнем селе открыли школу — идти теперь ближе.', 'good');
        x.stat('know', 4);
      }
    },
    {
      id: 'teacher', age: [7, 16], w: 1.1, cond: function (x) { return x.L.edu.inSchool; },
      run: function (x) {
        x.add('Учитель заметил способности и дал книги сверх программы.', 'good');
        x.stat('know', 6); x.stat('happy', 2);
      }
    },
    {
      id: 'talent-music', age: [4, 14], w: 0.5, once: true,
      run: function (x) {
        x.L.talents.push('музыка');
        x.add('С детства у вас редкий слух: мелодию достаточно услышать один раз.', 'good');
        x.stat('happy', 5);
      }
    },
    {
      id: 'talent-sport', age: [5, 15], w: 0.5, once: true,
      run: function (x) {
        x.L.talents.push('спорт');
        x.add('На школьных соревнованиях вы обогнали всех — вас позвали в секцию.', 'good');
        x.stat('health', 5); x.stat('happy', 3);
      }
    },
    {
      id: 'talent-math', age: [6, 15], w: 0.5, once: true,
      run: function (x) {
        x.L.talents.push('математика');
        x.add('Задачи, над которыми класс сидит час, вы решаете в уме.', 'good');
        x.stat('know', 8);
      }
    },
    {
      id: 'friend', age: [5, 18], w: 1.4,
      run: function (x) {
        x.add('Появился друг, с которым можно молчать и всё равно быть понятым.', 'good');
        x.stat('bond', 6); x.stat('happy', 4);
      }
    },
    {
      id: 'bullying', age: [7, 17], w: function (x) { return clamp(1.4 - x.L.stats.bond / 60, 0.2, 1.4); }, heavy: true,
      run: function (x) {
        x.add('В школе вас травили. Об этом не говорили дома.', 'bad');
        x.stat('happy', -8); x.stat('bond', -5);
        x.help();
      }
    },
    {
      id: 'child-work', age: [7, 15], w: function (x) { return poor(x.c) && x.L.famPct < 0.4 ? 1.4 : 0.05; },
      run: function (x) {
        x.add('После уроков вы работаете вместе с семьёй: денег не хватает.', 'bad');
        x.stat('know', -4); x.money(x.need * 0.05);
      }
    },

    /* ---------------------------- молодость --------------------------- */
    {
      id: 'first-love', age: [14, 24], w: 1.6, once: true,
      run: function (x) {
        x.add('Первая любовь. Ничего не вышло, но вы долго это помнили.', 'family');
        x.stat('happy', 7); x.stat('bond', 4);
      }
    },
    {
      id: 'internet', age: [10, 30], w: function (x) { return x.c.gdp > 4000 && x.L.year > 2000 ? 1.2 : 0.2; }, once: true,
      run: function (x) {
        x.add('У вас появился интернет: мир стал заметно больше.', 'good');
        x.stat('know', 6); x.stat('bond', 2);
      }
    },
    {
      id: 'sport-club', age: [12, 30], w: 0.9,
      run: function (x) { x.add('Вы начали бегать по утрам.', 'health'); x.stat('health', 5); }
    },
    {
      id: 'injury', age: [10, 60], w: function (x) { return x.L.job && x.L.job.risk > 1.2 ? 1.3 : 0.5; },
      run: function (x) {
        x.add('Травма: несколько месяцев без привычной жизни.', 'bad');
        x.stat('health', -7); x.money(-x.need * 0.1);
      }
    },
    {
      id: 'protest', age: [16, 40], w: function (x) { return x.c.happy < 5.2 ? 0.7 : 0.25; },
      run: function (x) {
        x.add('Вы вышли на площадь вместе со всеми. Что-то изменилось, что-то нет.', 'world');
        x.stat('bond', 4); x.stat('happy', 2);
      }
    },
    {
      id: 'smoke-start', age: [14, 30], w: function (x) { return x.has('smoker') ? 0 : 0.5; },
      run: function (x) {
        x.flag('smoker', true);
        x.add('Вы начали курить — «только за компанию».', 'bad');
        x.stat('health', -3);
      }
    },

    /* ----------------------------- работа ----------------------------- */
    {
      id: 'promotion', age: [20, 64], w: function (x) { return working(x.L) ? 1.1 + x.L.stats.know / 90 : 0; },
      run: function (x) {
        if (!x.L.job) return;
        if (x.L.job.step < 4 && x.rnd() < 0.45 + x.L.stats.know / 260) {
          x.L.job.step++;
          x.add('Повышение: теперь вы ' + M.jobTitle(M.jobById[x.L.job.id], x.L.job.step) + '.', 'work');
          x.stat('happy', 5);
        } else {
          x.add('Премия за хороший год.', 'money');
          x.money(x.L.income * 0.15);
        }
      }
    },
    {
      id: 'layoff', age: [18, 62], w: function (x) { return working(x.L) ? 0.55 : 0; },
      run: function (x) {
        x.add('Вас сократили. Работы в городе мало.', 'bad');
        x.L.job = null; x.L.unemployedYears = 0;
        x.stat('happy', -10);
      }
    },
    {
      id: 'side-income', age: [18, 70], w: 0.7,
      run: function (x) {
        var sum = (x.L.income || x.need) * 0.2;
        x.add('Подработка принесла немного сверх обычного.', 'money');
        x.money(sum);
      }
    },
    {
      id: 'scam', age: [20, 75], w: 0.4,
      run: function (x) {
        var sum = Math.min(x.L.money * 0.35, x.need * 1.2);
        if (sum < x.need * 0.05) return;
        x.add('Вложились в то, что обещало лёгкие деньги. Деньги исчезли.', 'bad');
        x.money(-sum); x.stat('happy', -7);
      }
    },
    {
      id: 'inherit', age: [25, 75], w: 0.35,
      run: function (x) {
        var sum = x.need * (0.4 + x.rnd() * 2.2) * (0.4 + x.L.famPct);
        x.add('Небольшое наследство от родни.', 'money');
        x.money(sum);
      }
    },

    /* ---------------------------- семья ------------------------------- */
    {
      id: 'wedding-friend', age: [18, 45], w: 0.8,
      run: function (x) { x.add('Свадьба друга: вся родня в одном дворе.', 'family'); x.stat('bond', 4); x.stat('happy', 3); }
    },
    {
      id: 'family-row', age: [16, 70], w: 0.7,
      run: function (x) {
        x.add('Крупная ссора в семье. Несколько месяцев почти не разговаривали.', 'bad');
        x.stat('bond', -7); x.stat('happy', -4);
      }
    },
    {
      id: 'parent-ill', age: [20, 65], w: function (x) { return x.L.parentsAlive > 0 ? 0.9 : 0; },
      run: function (x) {
        x.add('Заболел кто-то из родителей: деньги и время теперь уходят туда.', 'family');
        x.money(-x.need * 0.25); x.stat('happy', -5); x.stat('bond', 3);
      }
    },
    {
      id: 'parent-death', age: [18, 80], w: function (x) { return x.L.parentsAlive > 0 ? 0.55 + x.L.age / 180 : 0; },
      run: function (x) {
        x.L.parentsAlive--;
        x.add(x.L.parentsAlive > 0 ? 'Умер один из родителей.' : 'Умер последний из родителей. Дом опустел.', 'bad');
        x.stat('happy', -12); x.stat('bond', -3);
      }
    },
    {
      id: 'child-school', age: [25, 60], w: function (x) { return hasKids(x.L) ? 1 : 0; },
      run: function (x) {
        var kid = x.rnd.pick(x.L.children);
        x.add('У ребёнка (' + kid.name + ') всё хорошо в школе — вас похвалили на собрании.', 'family');
        x.stat('happy', 5); x.stat('bond', 3);
      }
    },
    {
      id: 'grandchild', age: [45, 95], w: function (x) { return hasKids(x.L) && x.L.children.some(function (k) { return x.L.age - k.bornAt > 20; }) ? 1.4 : 0; },
      run: function (x) {
        x.L.grandchildren++;
        x.add('Родился внук. Вы держите на руках совсем новую жизнь.', 'good');
        x.stat('happy', 10); x.stat('bond', 6);
      }
    },

    /* ----------------------------- здоровье ---------------------------- */
    {
      id: 'checkup', age: [30, 80], w: function (x) { return x.budget.health > 0.08 ? 1.2 : 0.3; },
      run: function (x) {
        x.add('Обследование: нашли вовремя, ничего серьёзного.', 'health');
        x.stat('health', 4);
      }
    },
    {
      id: 'chronic', age: [45, 88], w: function (x) { return x.has('chronic') ? 0 : 0.5 + (100 - x.L.stats.health) / 130; },
      run: function (x) {
        x.flag('chronic', true);
        x.add('Диагноз: хроническая болезнь. С ней придётся жить дальше.', 'bad');
        x.stat('health', -10);
      }
    },
    {
      id: 'epidemic', age: [0, 110], w: 0.25,
      run: function (x) {
        x.add('Эпидемия. Школы и рынки закрыты, в семье болеют все по очереди.', 'world');
        x.stat('health', -6); x.money(-x.need * 0.1);
      }
    },
    {
      id: 'recover', age: [20, 95], w: function (x) { return x.L.stats.health < 45 ? 1.1 : 0.2; },
      run: function (x) {
        x.add('Вы взялись за себя: режим, еда, прогулки. Стало легче.', 'health');
        x.stat('health', 7); x.stat('happy', 3);
      }
    },

    /* ------------------------------ мир -------------------------------- */
    {
      id: 'war', age: [0, 110], heavy: true,
      w: function (x) { return (WAR_RISK[x.c.code] || 0.08) * 0.5; },
      run: function (x) {
        x.flag('war', true);
        x.L.warUntil = x.L.age + 2 + x.rnd.int(4);
        x.add('Война пришла в ваш район. Школа закрыта, магазины пусты.', 'bad');
        x.stat('health', -6); x.stat('happy', -12); x.money(-x.need * 0.3);
        x.help();
      }
    },
    {
      id: 'quake', age: [0, 110], w: function (x) { return QUAKE.indexOf(x.c.code) >= 0 ? 0.35 : 0.02; },
      run: function (x) {
        x.add('Землетрясение. Дом устоял, но соседний — нет.', 'world');
        x.stat('happy', -7); x.money(-x.need * 0.2);
      }
    },
    {
      id: 'cyclone', age: [0, 110], w: function (x) { return CYCLONE.indexOf(x.c.code) >= 0 ? 0.5 : 0.03; },
      run: function (x) {
        x.add('Тайфун снёс крышу и урожай.', 'world');
        x.stat('happy', -5); x.money(-x.need * 0.25); x.stat('health', -2);
      }
    },
    {
      id: 'drought', age: [0, 110], w: function (x) { return DROUGHT.indexOf(x.c.code) >= 0 && rural(x.L) ? 0.8 : 0.03; },
      run: function (x) {
        x.add('Засуха. Цены выросли, воды мало.', 'bad');
        x.stat('health', -5); x.money(-x.need * 0.2);
      }
    },
    {
      id: 'boom', age: [0, 110], w: function (x) { return x.c.gdp > 5000 ? 0.5 : 0.25; },
      run: function (x) {
        x.add('В стране хороший год: работы больше, цены спокойнее.', 'good');
        x.money((x.L.income || x.need) * 0.1); x.stat('happy', 3);
      }
    },
    {
      id: 'crisis', age: [0, 110], w: 0.45,
      run: function (x) {
        x.add('Экономический кризис: деньги обесценились.', 'bad');
        x.money(-x.L.money * 0.25); x.stat('happy', -6);
      }
    },
    {
      id: 'crime', age: [12, 75], heavy: true,
      w: function (x) { return clamp(x.c.homicide / 18, 0.05, 1.3); },
      run: function (x) {
        x.add('Вы стали жертвой ограбления. Все остались живы.', 'bad');
        x.money(-Math.min(x.L.money * 0.4, x.need * 0.5)); x.stat('happy', -8); x.stat('health', -3);
        x.help();
      }
    },

    /* ------------------- деньги: цены, долги, заработки ---------------- */
    {
      id: 'inflation', money: true, age: [14, 110],
      w: function (x) { return wmap(INFLATION, x.c, x.c.gdp < 12000 ? 0.6 : 0.3) * 0.45 * oldMoney(x.L); },
      run: function (x) {
        var loss = x.L.money > 0 ? x.L.money * (0.1 + x.rnd() * 0.14) : 0;
        x.add('Цены за год ушли вперёд зарплат: на те же деньги покупается заметно меньше.', 'money');
        x.money(-loss); x.stat('happy', -3);
      }
    },
    {
      id: 'money-crash', money: true, age: [16, 110],
      w: function (x) { return wmap(INFLATION, x.c, 0.15) * 0.16 * oldMoney(x.L); },
      run: function (x) {
        var gold = holds(x.L, 'gold');
        var share = gold ? 0.3 : 0.55;
        var loss = Math.max(0, x.L.money) * share;
        x.money(-loss);
        x.add(gold
          ? 'Валюта обвалилась за несколько недель. Сбережения растаяли, но золото подорожало и спасло часть.'
          : 'Валюта обвалилась за несколько недель. Половины сбережений как не бывало.', 'bad');
        x.stat('happy', -8);
      }
    },
    {
      id: 'money-reform', money: true, age: [10, 110], once: true,
      w: function (x) { return (x.L.year < 2000 ? 0.5 : 0.12) * (x.c.gdp < 20000 ? 1.4 : 0.5); },
      run: function (x) {
        var loss = Math.max(0, x.L.money) * (0.15 + x.rnd() * 0.3);
        x.add('Денежная реформа: старые деньги меняют в очередях и не все. Часть сбережений пропала.', 'bad');
        x.money(-loss); x.stat('happy', -6);
      }
    },
    {
      id: 'bank-fail', money: true, age: [18, 110],
      w: function (x) { return holds(x.L, 'depo') || x.has('deposit') ? (x.c.gdp < 8000 ? 0.7 : 0.25) : 0; },
      run: function (x) {
        var h = holds(x.L, 'depo');
        if (h) {
          var lost = h.val * (0.4 + x.rnd() * 0.4);
          h.val -= lost;
          if (h.val < 1) { h.val = 0; h.put = 0; }
          x.add('Банк, где лежал вклад, остался без лицензии. Вернули меньше половины.', 'bad');
        } else {
          x.flag('deposit', false);
          x.money(-Math.max(0, x.L.money) * 0.3);
          x.add('Банк, где лежали деньги, закрылся. Очередь за компенсацией стоит второй месяц.', 'bad');
        }
        x.stat('happy', -7);
      }
    },
    {
      id: 'remittance', money: true, age: [0, 95],
      w: function (x) { return wmap(REMIT, x.c, x.c.gdp < 9000 ? 0.4 : 0.08) * 0.5; },
      run: function (x) {
        var sum = x.need * (0.08 + x.rnd() * 0.3);
        x.add('Родственник, уехавший на заработки, прислал денег.', 'money');
        x.money(sum); x.stat('bond', 2);
      }
    },
    {
      id: 'remit-send', money: true, age: [19, 70],
      w: function (x) { return x.L.abroad ? 2.2 : 0; },
      run: function (x) {
        var sum = (x.L.income || x.need) * (0.08 + x.rnd() * 0.12);
        x.add('Вы отправили часть заработка домой: там на эти деньги живёт вся семья.', 'family');
        x.money(-sum); x.stat('bond', 5); x.stat('happy', 2);
      }
    },
    {
      id: 'wage-delay', money: true, age: [16, 70],
      w: function (x) { return working(x.L) && x.c.gdp < 18000 ? 0.7 * oldMoney(x.L) : 0.05; },
      run: function (x) {
        x.add('Зарплату задержали на несколько месяцев. Жили в долг у соседей и магазина.', 'bad');
        x.money(-(x.L.income || x.need) * 0.12); x.stat('happy', -5);
      }
    },
    {
      id: 'employer-bust', money: true, age: [18, 64],
      w: function (x) { return working(x.L) ? 0.3 : 0; },
      run: function (x) {
        x.add('Предприятие закрылось. Последнюю зарплату так и не выдали.', 'bad');
        x.money(-(x.L.income || x.need) * 0.15);
        x.L.job = null; x.L.unemployedYears = 0;
        x.stat('happy', -9);
      }
    },
    {
      id: 'year-bonus', money: true, age: [18, 66],
      w: function (x) { return working(x.L) ? (x.c.gdp > 12000 ? 0.8 : 0.35) : 0; },
      run: function (x) {
        var sum = (x.L.income || x.need) * (0.08 + x.rnd() * 0.14);
        x.add('В конце года выдали премию.', 'money');
        x.money(sum); x.stat('happy', 3);
      }
    },
    {
      id: 'tax-audit', money: true, age: [20, 75],
      w: function (x) { return (x.L.biz || x.L.business) ? (x.has('legal') ? 0.35 : 0.8) : 0.05; },
      run: function (x) {
        var fine = x.need * (0.1 + x.rnd() * 0.35) * (x.has('legal') ? 0.5 : 1);
        x.add(x.has('legal')
          ? 'Налоговая проверка. Всё оформлено, отделались мелким штрафом.'
          : 'Налоговая насчитала недоимку и штраф. Платить пришлось сразу.', 'bad');
        x.money(-fine); x.stat('happy', -4);
      }
    },
    {
      id: 'child-benefit', money: true, age: [18, 60],
      w: function (x) { return hasKids(x.L) && x.c.gdp > 10000 ? 1 : 0.1; },
      run: function (x) {
        var sum = x.need * (0.05 + x.rnd() * 0.12) * Math.min(3, x.L.children.length);
        x.add('Государство выплатило пособие на детей.', 'money');
        x.money(sum); x.stat('happy', 2);
      }
    },
    {
      id: 'school-fees', money: true, age: [24, 60],
      w: function (x) { return hasKids(x.L) && x.c.gdp < 12000 ? 1.1 : 0.05; },
      run: function (x) {
        x.add('Школа снова собирает деньги: форма, учебники, ремонт класса, экзамены.', 'money');
        x.money(-x.need * (0.06 + x.rnd() * 0.12) * Math.min(3, x.L.children.length));
      }
    },
    {
      id: 'medical-bill', money: true, age: [25, 95],
      w: function (x) {
        var noIns = !(x.L.purchased && x.L.purchased.insurance);
        return noIns && (x.c.gdp < 9000 || x.c.code === 'us') ? 0.65 : 0.1;
      },
      run: function (x) {
        var bill = x.need * (0.3 + x.rnd() * 1.1);
        if (x.L.purchased && x.L.purchased.insurance !== undefined) {
          x.add('Больничный счёт оказался огромным, но страховка закрыла почти всё.', 'money');
          x.money(-bill * 0.25);
          return;
        }
        if (x.L.purse() < bill * 0.5 && x.c.gdp < 12000 && x.rnd() < 0.45) {
          /* платить нечем — лечение откладывают на потом, которое не наступает */
          x.add('Лечение стоило больше, чем есть в доме. Решили перетерпеть.', 'bad');
          x.flag('untreated', true);
          x.stat('happy', -7); x.stat('health', -3);
          x.money(-bill * 0.2);
          return;
        }
        x.add('Счёт за лечение съел все сбережения семьи — и часть будущих.', 'bad');
        x.stat('happy', -6);
        x.money(-bill);
      }
    },
    {
      id: 'rent-up', money: true, age: [19, 80],
      w: function (x) { return !x.L.home && x.L.urban ? 0.9 : 0.1; },
      run: function (x) {
        x.add('Хозяин поднял плату за жильё. Переезжать дороже, чем доплатить.', 'money');
        x.money(-x.need * (0.06 + x.rnd() * 0.14)); x.stat('happy', -3);
      }
    },
    {
      id: 'utilities', money: true, age: [20, 95],
      w: function (x) { return x.L.urban && x.c.gdp > 4000 ? 0.6 : 0.2; },
      run: function (x) {
        x.add('Свет и отопление подорожали: зимние счета стали заметной строкой расходов.', 'money');
        x.money(-x.need * (0.03 + x.rnd() * 0.08));
      }
    },
    {
      id: 'phone-scam', money: true, age: [18, 105],
      w: function (x) {
        if (x.L.year < 2005) return 0.06;
        return (x.L.age > 60 ? 0.7 : 0.35) * (x.L.stats.know < 45 ? 1.4 : 0.7);
      },
      run: function (x) {
        var smart = x.rnd() < clamp(0.35 + x.L.stats.know / 160, 0.3, 0.92);
        if (smart) {
          x.add('Позвонили «из службы безопасности банка». Вы положили трубку и перезвонили сами.', 'good');
          x.stat('know', 1);
        } else {
          var sum = Math.min(Math.max(0, x.L.money) * 0.4, x.need * 1.4);
          x.add('Позвонили «из службы безопасности банка» — и вы перевели деньги сами. Их больше нет.', 'bad');
          x.money(-sum); x.stat('happy', -9);
        }
      }
    },
    {
      id: 'lottery', money: true, age: [18, 95], w: 0.3,
      run: function (x) {
        var r = x.rnd();
        if (r < 0.02) {
          x.add('Крупный выигрыш в лотерею. Такое бывает раз на сотни тысяч билетов.', 'good');
          x.money(x.need * (5 + x.rnd() * 9)); x.stat('happy', 12);
        } else if (r < 0.3) {
          x.add('Небольшой выигрыш в лотерею: хватило на подарки.', 'money');
          x.money(x.need * (0.05 + x.rnd() * 0.15)); x.stat('happy', 3);
        } else {
          x.add('Весь год покупали лотерейные билеты. Не выиграли ничего.', 'money');
          x.money(-x.need * 0.03);
        }
      }
    },
    {
      id: 'micro-due', money: true, age: [18, 100],
      w: function (x) { return (x.L.microDebt || 0) > 0 ? 3.5 : 0; },
      run: function (x) {
        var due = x.L.microDebt || 0;
        x.L.microDebt = 0;
        x.money(-due);
        if (x.L.money >= 0) {
          x.stat('happy', -5);
          x.add('Микрозайм отдали целиком: проценты вышли больше самого долга.', 'money');
        } else {
          x.stat('happy', -9); x.stat('health', -2);
          x.add('Отдавать микрозайм нечем: пошли пени, звонки и описи имущества.', 'bad');
        }
      }
    },
    {
      id: 'collectors', money: true, age: [20, 80],
      w: function (x) { return x.L.money < -x.need * 0.4 ? 1.6 : 0; },
      run: function (x) {
        x.add('Долг передали коллекторам: звонят вам, соседям и на работу.', 'bad');
        x.money(-x.need * 0.1); x.stat('happy', -9); x.stat('health', -2);
      }
    },
    {
      id: 'debt-relief', money: true, age: [20, 80],
      w: function (x) { return x.L.money < -x.need * 0.5 ? (x.c.gdp < 9000 ? 0.5 : 0.3) : 0; },
      run: function (x) {
        var cut = Math.min(-x.L.money * 0.5, x.need * 1.2);
        x.add('Часть долга удалось списать: помогли программа для должников и родня.', 'good');
        x.money(cut); x.stat('happy', 6);
      }
    },
    {
      id: 'rosca', money: true, age: [20, 75],
      w: function (x) { return wmap(MICRO, x.c, x.c.gdp < 7000 ? 0.7 : 0.1) * 0.45; },
      run: function (x) {
        if (x.rnd() < 0.55) {
          x.add('Подошла ваша очередь в кассе взаимопомощи: соседи скинулись, и вы получили всю сумму сразу.', 'money');
          x.money(x.need * (0.2 + x.rnd() * 0.4)); x.stat('bond', 4);
        } else {
          x.add('Весь год носили взносы в кассу взаимопомощи: очередь дойдёт не скоро.', 'money');
          x.money(-x.need * (0.05 + x.rnd() * 0.12)); x.stat('bond', 2);
        }
      }
    },
    {
      id: 'strike', money: true, age: [18, 64],
      w: function (x) { return working(x.L) && x.c.gdp > 3000 ? 0.4 : 0.1; },
      run: function (x) {
        if (x.rnd() < 0.5) {
          x.L.incomeBoost = (x.L.incomeBoost || 1) * 1.07;
          x.add('Забастовка на работе: добились прибавки к зарплате.', 'good');
          x.stat('bond', 3);
        } else {
          x.add('Забастовка ничего не дала, а дни простоя не оплатили.', 'bad');
          x.money(-(x.L.income || x.need) * 0.06); x.stat('happy', -3);
        }
      }
    },
    {
      id: 'gig-work', money: true, age: [17, 60],
      w: function (x) { return x.L.year >= 2012 && x.L.urban ? 0.8 : 0.05; },
      run: function (x) {
        x.add('Вечерами подрабатывали через приложение: доставка, такси, заказы.', 'money');
        x.money(x.need * (0.08 + x.rnd() * 0.22)); x.stat('health', -1);
      }
    },
    {
      id: 'pension-reform', money: true, age: [45, 64], once: true,
      w: function (x) { return x.L.year >= 1995 ? 0.6 : 0.15; },
      run: function (x) {
        x.L.retireLate = (x.L.retireLate || 0) + 2 + x.rnd.int(3);
        x.flag('pensionCut', true);
        x.add('Пенсионный возраст подняли: работать придётся дольше, чем обещали.', 'bad');
        x.stat('happy', -6);
      }
    },
    {
      id: 'pension-thin', money: true, age: [60, 110],
      w: function (x) { return x.L.retired ? 1 : 0; },
      run: function (x) {
        if (x.rnd() < 0.45) {
          x.add('Пенсию проиндексировали: прибавка меньше, чем подорожали лекарства.', 'money');
          x.money(x.need * 0.03); x.stat('happy', -2);
        } else {
          x.add('Пенсия отстала от цен: приходится считать каждый день до выплаты.', 'bad');
          x.money(-x.need * 0.06); x.stat('happy', -4);
        }
      }
    },
    {
      id: 'fire-home', money: true, age: [5, 100], once: true,
      w: function (x) { return x.c.gdp < 9000 ? 0.3 : 0.16; },
      run: function (x) {
        var ins = x.L.purchased && x.L.purchased.insurance;
        var loss = x.need * (0.3 + x.rnd() * 0.9) * (ins ? 0.25 : 1);
        x.add(ins
          ? 'Пожар в доме. Сгорело многое, но страховая почти всё возместила.'
          : 'Пожар в доме. Сгорели вещи, документы и то, что копили годами.', ins ? 'money' : 'bad');
        x.money(-loss); x.stat('happy', ins ? -4 : -10); x.stat('health', -2);
      }
    },
    {
      id: 'biz-robbery', money: true, age: [18, 80],
      w: function (x) { return x.L.biz ? clamp(x.c.homicide / 14, 0.15, 1.4) : 0; },
      run: function (x) {
        var b = x.L.biz;
        if (!b) return;
        var loss = Math.round(b.val * (0.08 + x.rnd() * 0.17));
        b.val = Math.max(0, b.val - loss);
        x.add('Дело обокрали: вынесли товар и кассу.', 'bad');
        x.stat('happy', -7);
      }
    },
    {
      id: 'harvest-price', money: true, age: [18, 85],
      w: function (x) {
        var farm = x.L.biz && x.L.biz.type === 'farm';
        return (farm || holds(x.L, 'land') || (x.L.purchased && x.L.purchased.land)) ? 1.2 : 0;
      },
      run: function (x) {
        if (x.rnd() < 0.5) {
          x.add('Урожай удалось продать дорого: в этом году цены стояли высоко.', 'money');
          x.money(x.need * (0.15 + x.rnd() * 0.4));
        } else {
          x.add('Перекупщики сбили цену: урожай ушёл почти даром.', 'bad');
          x.money(-x.need * (0.05 + x.rnd() * 0.15)); x.stat('happy', -4);
        }
      }
    },
    {
      id: 'land-sale', money: true, age: [25, 85], once: true,
      w: function (x) { return rural(x.L) && x.L.parentsAlive === 0 ? 0.8 : 0.08; },
      run: function (x) {
        x.add('Семейный участок продали и деньги поделили между роднёй.', 'money');
        x.money(x.need * (0.4 + x.rnd() * 1.6) * (0.5 + x.L.famPct)); x.stat('bond', -2);
      }
    },
    {
      id: 'dowry', money: true, age: [18, 70],
      w: function (x) { return wmap(DOWRY, x.c, 0.1) * 0.35 * (hasKids(x.L) || x.L.siblings ? 1.2 : 0.6); },
      run: function (x) {
        x.add('Свадьба в семье: по обычаю платит ваша сторона, и отказаться нельзя.', 'money');
        x.money(-x.need * (0.3 + x.rnd() * 1.1)); x.stat('bond', 4); x.stat('happy', -2);
      }
    },

    /* ----------------------------- старость ---------------------------- */
    {
      id: 'retire-joy', age: [60, 95], w: function (x) { return x.L.retired ? 1 : 0; },
      run: function (x) {
        x.add('Появилось время на то, что всегда откладывали.', 'good');
        x.stat('happy', 6);
      }
    },
    {
      id: 'spouse-death', age: [55, 105], w: function (x) { return x.L.marital === 'married' ? 0.5 + (x.L.age - 55) / 90 : 0; },
      run: function (x) {
        x.L.marital = 'widowed'; x.L.partner = null;
        x.add('Умер супруг. Дом стал слишком тихим.', 'bad');
        x.stat('happy', -16); x.stat('bond', -8); x.stat('health', -4);
      }
    },
    {
      id: 'lonely', age: [65, 110], w: function (x) { return x.L.stats.bond < 40 ? 1.2 : 0.2; },
      run: function (x) {
        x.add('Неделя прошла без единого разговора.', 'bad');
        x.stat('happy', -6);
      }
    },
    {
      id: 'memoir', age: [60, 100], w: 0.5,
      run: function (x) {
        x.add('Вы начали записывать для внуков то, что помните.', 'good');
        x.stat('happy', 5); x.stat('bond', 3);
      }
    },
    {
      id: 'award', age: [35, 85], w: function (x) { return x.L.stats.know > 70 && working(x.L) ? 0.5 : 0.08; },
      run: function (x) {
        x.L.awards.push('признание в профессии');
        x.add('Вас отметили в профессии — в районной газете вышла заметка.', 'good');
        x.stat('happy', 8);
      }
    }
  ];

  /* ======================================================================
     КАРТОЧКИ РЕШЕНИЙ
     ====================================================================== */
  var CHOICES = [
    {
      id: 'school-start', age: [6, 7], once: true, priority: true,
      title: 'Идти ли в школу',
      text: function (x) {
        return poor(x.c)
          ? 'Школа в трёх километрах, и дома нужны руки. Родители смотрят на вас.'
          : 'Пора в первый класс. Семья решает, куда вас отдать.';
      },
      options: [
        {
          label: 'В обычную школу', hint: 'бесплатно · знания +',
          w: function (x) { return clamp(0.4 + x.c.school / 10, 0.3, 1) * 10; },
          run: function (x) { x.L.edu.inSchool = true; x.stat('know', 6); x.add('Вы пошли в школу.', 'life'); }
        },
        {
          label: 'В частную школу', hint: 'форма, учебники, строгие учителя',
          w: function (x) { return x.L.famPct > 0.72 ? 2.5 : 0.4; },
          req: {
            money: function (x) { return x.need * 0.35; },
            custom: {
              test: function (x) { return x.L.famPct > 0.4 || x.c.gdp > 15000; },
              why: 'частных школ поблизости нет', done: 'частная школа в городе есть'
            }
          },
          cost: { money: function (x) { return x.need * 0.35; } },
          run: function (x) {
            x.L.edu.inSchool = true; x.L.edu.private = true;
            x.money(-x.need * 0.35); x.stat('know', 14);
            x.add('Вас отдали в частную школу: форма, учебники, строгие учителя.', 'life');
          }
        },
        {
          label: 'Остаться помогать семье', hint: 'деньги + · знания −−',
          w: function (x) { return clamp(1 - x.c.school / 10, 0.01, 0.7) * 10 * (1.4 - x.L.famPct); },
          run: function (x) {
            x.money(x.need * 0.12); x.stat('know', -6); x.stat('bond', 3);
            x.add('В школу вы не пошли: дома нужнее.', 'bad');
          }
        }
      ]
    },
    {
      id: 'teen-focus', age: [13, 15], once: true,
      title: 'Чему отдать подростковые годы',
      text: function (x) { return 'Свободного времени мало, и всё сразу не успеть.'; },
      options: [
        { label: 'Учёбе', hint: 'знания ++', run: function (x) { x.stat('know', 12); x.stat('happy', -2); x.add('Вы просиживали вечера за учебниками.', 'life'); } },
        { label: 'Друзьям', hint: 'отношения ++', run: function (x) { x.stat('bond', 12); x.stat('happy', 6); x.add('Подростковые годы прошли во дворе и в разговорах до ночи.', 'life'); } },
        {
          label: 'Спорту', hint: 'здоровье ++', req: { health: 35 },
          run: function (x) { x.stat('health', 12); x.stat('happy', 4); x.add('Вы почти жили в спортивной секции.', 'life'); }
        },
        {
          label: 'Подработке', hint: 'деньги +', req: { health: 30 },
          cost: { gain: function (x) { return x.need * 0.3; } },
          run: function (x) { x.money(x.need * 0.3); x.stat('know', -3); x.add('После школы вы работали: семье нужны были деньги.', 'life'); }
        }
      ]
    },
    {
      id: 'secondary', age: [15, 16], once: true, priority: true,
      title: 'Продолжать ли учиться',
      text: function (x) {
        return 'Обязательная школа закончилась. Друзья уже устроились на работу.';
      },
      options: [
        {
          label: 'Старшие классы', hint: 'знания + · доход позже',
          w: function (x) { return clamp((x.c.school - 2) / 10, 0.05, 0.95) * 10 * (0.6 + x.L.famPct); },
          req: { know: 28 },
          run: function (x) { x.L.edu.inSchool = true; x.L.edu.track = 'general'; x.stat('know', 10); x.add('Вы остались в школе.', 'life'); }
        },
        {
          label: 'Колледж / ПТУ', hint: 'профессия раньше',
          w: function (x) { return 3; },
          req: { know: 18, money: function (x) { return x.need * 0.08; } },
          cost: { money: function (x) { return x.need * 0.08; } },
          run: function (x) { x.L.edu.inSchool = true; x.L.edu.track = 'voc'; x.stat('know', 7); x.add('Вы пошли учиться на специальность.', 'life'); }
        },
        {
          label: 'Работать', hint: 'деньги сразу · знания −',
          w: function (x) { return clamp(1 - (x.c.school - 2) / 10, 0.05, 0.95) * 10 * (1.5 - x.L.famPct); },
          run: function (x) { x.L.edu.inSchool = false; x.L.edu.left = true; x.add('Вы оставили школу и вышли на работу.', 'work'); }
        }
      ]
    },
    {
      id: 'university', age: [18, 19], once: true, priority: true,
      cond: function (x) {
        if (x.L.edu.level < 3) return false;
        var p = clamp(x.c.tertiary / 100 * (0.45 + x.L.famPct * 1.1) * (0.5 + x.L.stats.know / 110), 0.01, 0.97);
        return x.L.roll('uni') < p;
      },
      title: 'Поступать ли в университет',
      text: function (x) {
        return 'Экзамены позади. Учёба стоит около ' + M.fmtMoney(x.need * 0.6) + ' в год, и это годы без зарплаты.';
      },
      options: [
        {
          label: 'Да, учиться дальше', hint: 'знания +++ · годы без зарплаты',
          w: function (x) { return 6 * (0.5 + x.L.famPct); },
          req: { edu: 3, know: 45, money: function (x) { return x.need * 0.6; } },
          cost: { money: function (x) { return x.need * 0.6; } },
          run: function (x) {
            x.L.edu.inSchool = true; x.L.edu.track = 'uni';
            x.money(-x.need * 0.6); x.stat('know', 16);
            x.add('Вы поступили в университет.', 'life');
          }
        },
        {
          label: 'Учиться и работать', hint: 'тяжело, но без долгов',
          w: function (x) { return 4; },
          req: { edu: 3, health: 40 },
          cost: { gain: function (x) { return x.need * 0.2; } },
          run: function (x) {
            x.L.edu.inSchool = true; x.L.edu.track = 'uni'; x.L.edu.partTime = true;
            x.stat('know', 10); x.stat('health', -5); x.money(x.need * 0.2);
            x.add('Вы совмещали учёбу с работой: пары днём, смена вечером.', 'life');
          }
        },
        {
          label: 'Нет, сразу работать', hint: 'деньги раньше',
          w: function (x) { return 2.5; },
          run: function (x) { x.L.edu.inSchool = false; x.add('Вы решили не поступать и начали работать.', 'work'); }
        }
      ]
    },
    {
      id: 'move-city', age: [17, 40], once: true,
      cond: function (x) { return rural(x.L); },
      title: 'Уехать в город?',
      text: function (x) { return 'В городе работы больше, но там никого нет, кто вас знает.'; },
      options: [
        {
          label: 'Уехать', hint: 'доход + · отношения −',
          req: { money: function (x) { return x.need * 0.15; }, health: 25 },
          cost: { money: function (x) { return x.need * 0.15; } },
          run: function (x) {
            x.money(-x.need * 0.15);
            x.L.urban = true; x.L.moves++;
            x.stat('bond', -8); x.stat('happy', 2);
            x.add('Вы переехали в город с одной сумкой.', 'life');
          }
        },
        { label: 'Остаться', hint: 'связи сохранятся', run: function (x) { x.stat('bond', 6); x.add('Вы остались там, где выросли.', 'life'); } }
      ]
    },
    {
      id: 'emigrate', age: [18, 45], once: true,
      cond: function (x) { return x.c.gdp < 30000; },
      title: 'Уехать за границу?',
      text: function (x) { return 'Родственник зовёт работать за рубеж. Дорога и документы — около ' + M.fmtMoney(x.need * 0.8) + '.'; },
      options: [
        {
          label: 'Уехать', hint: 'доход ++ · семья далеко',
          req: { money: function (x) { return x.need * 0.8; }, health: 35 },
          cost: { money: function (x) { return x.need * 0.8; } },
          chance: function (x) {
            return clamp(0.3 + x.L.stats.know / 180 + x.L.edu.level * 0.06 + (x.L.abroadHelp ? 0.15 : 0), 0.12, 0.92);
          },
          run: function (x) {
            x.money(-x.need * 0.8); x.L.abroad = true; x.L.moves++;
            x.stat('bond', -12); x.stat('happy', -3);
            x.add('Вы уехали работать за границу.', 'life');
          },
          fail: function (x) {
            x.money(-x.need * 0.8); x.stat('happy', -8);
            x.add('Документы на выезд не приняли. Деньги за них никто не вернул.', 'bad');
          }
        },
        {
          label: 'Отправить брата, помочь деньгами', hint: 'связи +',
          req: { money: function (x) { return x.need * 0.3; } },
          cost: { money: function (x) { return x.need * 0.3; } },
          run: function (x) { x.money(-x.need * 0.3); x.stat('bond', 8); x.L.abroadHelp = true; x.add('Уехал не вы: вы помогли деньгами тому, кто решился.', 'family'); }
        },
        { label: 'Остаться дома', hint: 'спокойнее', run: function (x) { x.stat('bond', 4); x.add('Вы остались дома.', 'life'); } }
      ]
    },
    {
      id: 'first-job', age: [16, 30], once: true, priority: true,
      cond: function (x) { return !x.L.job && !x.L.edu.inSchool; },
      title: 'Первая работа',
      text: function (x) { return 'Есть несколько вариантов, и каждый ведёт в свою сторону.'; },
      options: [
        {
          label: 'Надёжное место', hint: 'стабильно, медленный рост',
          run: function (x) { x.L.hire('stable'); x.stat('happy', 3); }
        },
        {
          label: 'Тяжёлая, но денежная', hint: 'доход + · здоровье −',
          req: { health: 45 },
          run: function (x) { x.L.hire('hard'); x.stat('health', -5); }
        },
        {
          label: 'То, что нравится', hint: 'счастье + · доход −',
          req: { know: 50, edu: 3 },
          run: function (x) { x.L.hire('dream'); x.stat('happy', 10); }
        }
      ]
    },
    {
      id: 'marry', age: [18, 45], once: true, priority: true,
      cond: function (x) { return x.L.marital === 'single' && x.L.age >= x.L.marriageAge; },
      title: 'Свадьба',
      text: function (x) {
        return x.c.tfr > 3.5 && x.L.age < 22
          ? 'Семьи договорились. Вас спрашивают в последнюю очередь.'
          : 'Вы вместе уже несколько лет. Пора решать.';
      },
      options: [
        {
          label: 'Пожениться', hint: 'отношения ++',
          w: function (x) { return 6 + x.c.tfr; },
          req: { money: function (x) { return x.need * 0.25; } },
          cost: { money: function (x) { return x.need * 0.25; } },
          run: function (x) { x.L.marry(); x.money(-x.need * 0.25); x.stat('happy', 12); x.stat('bond', 12); }
        },
        {
          label: 'Жить вместе без свадьбы', hint: 'проще',
          w: function (x) { return x.c.gdp > 25000 ? 3 : 0.8; },
          run: function (x) { x.L.marry(true); x.stat('happy', 8); x.stat('bond', 8); }
        },
        {
          label: 'Пока нет', hint: 'свобода · одиночество?',
          w: function (x) { return 2; },
          run: function (x) {
            x.stat('happy', -2);
            x.L.marriageAge = x.L.age + 2 + x.rnd.int(5);
            delete x.L.seenEvents['c:marry'];
            x.add('Вы решили подождать со свадьбой.', 'family');
          }
        }
      ]
    },
    {
      id: 'child', age: [18, 46], priority: true,
      cond: function (x) {
        var L = x.L;
        if (L.marital !== 'married' && L.marital !== 'partner') return false;
        if (L.children.length >= L.desiredKids) return false;
        if (L.age - L.lastChildAge < 2) return false;
        if (L.sex === 'f' && L.age > 44) return false;
        return L.roll('kid' + L.children.length + '-' + L.age) < 0.58;
      },
      title: 'Ребёнок',
      text: function (x) {
        return x.L.children.length === 0
          ? 'Разговор, который откладывали: заводить ли ребёнка.'
          : 'Ещё один ребёнок? Детей уже ' + x.L.children.length + '.';
      },
      options: [
        {
          label: 'Да', hint: 'счастье + · деньги −',
          w: function (x) { return 5; },
          run: function (x) { x.L.haveChild(); }
        },
        {
          label: 'Не сейчас', hint: 'деньги + · время на себя',
          w: function (x) { return 1.2; },
          run: function (x) {
            x.stat('happy', -2); x.money(x.need * 0.1);
            x.L.lastChildAge = x.L.age;
            x.L.desiredKids = Math.max(x.L.children.length, x.L.desiredKids - 1);
            x.add('Вы решили подождать с детьми.', 'family');
          }
        }
      ]
    },
    {
      id: 'illness-treat', age: [10, 95],
      title: 'Лечиться или потерпеть',
      text: function (x) {
        return 'Боль не проходит третий месяц. Хорошая клиника возьмёт ' + M.fmtMoney(x.need * 0.5) +
          ', в государственной — очередь на полгода.';
      },
      options: [
        {
          label: 'Платно и сразу', hint: 'здоровье ++',
          req: { money: function (x) { return x.need * 0.5; } },
          cost: { money: function (x) { return x.need * 0.5; } },
          run: function (x) { x.money(-x.need * 0.5); x.stat('health', 12); x.add('Вы заплатили за лечение и выздоровели.', 'health'); }
        },
        {
          label: 'По очереди', hint: 'бесплатно · долго',
          req: {
            custom: {
              test: function (x) { return x.c.gdp > 2500; },
              why: 'бесплатной медицины здесь почти нет', done: 'государственная клиника есть'
            }
          },
          run: function (x) { x.stat('health', x.c.gdp > 20000 ? 5 : -4); x.add('Вы дождались очереди. Лечение помогло, но не сразу.', 'health'); }
        },
        {
          label: 'Терпеть', hint: 'деньги целы · риск',
          run: function (x) { x.stat('health', -12); x.flag('untreated', true); x.add('Вы решили перетерпеть. Болезнь никуда не делась.', 'bad'); }
        }
      ]
    },
    {
      id: 'loan', age: [22, 60], once: true,
      title: 'Своё дело',
      text: function (x) { return 'Можно взять кредит ' + M.fmtMoney(x.need * 1.5) + ' и открыть своё дело. Или не рисковать.'; },
      options: [
        {
          label: 'Взять кредит и начать', hint: 'риск · большой доход',
          req: {
            know: 35, job: true,
            custom: {
              test: function (x) { return x.c.gdp > 3000 || x.L.stats.know > 60; },
              why: 'банк не даст кредит без залога', done: 'кредит здесь дадут'
            }
          },
          cost: { gain: function (x) { return x.need * 1.5; } },
          chance: function (x) { return clamp(0.34 + x.L.stats.know / 200 + x.L.edu.level * 0.04, 0.15, 0.85); },
          run: function (x) {
            x.money(x.need * 1.5); x.flag('debt', true); x.L.business = true;
            x.add('Вы открыли своё дело и взяли кредит.', 'work');
          },
          fail: function (x) {
            x.money(x.need * 1.5); x.flag('debt', true);
            x.money(-x.need * 1.9); x.stat('happy', -10); x.stat('health', -4);
            x.add('Дело прогорело за первый же год, а кредит остался.', 'bad');
          }
        },
        {
          label: 'Начать на свои, медленно', hint: 'без долгов',
          req: { money: function (x) { return x.need * 0.4; } },
          cost: { money: function (x) { return x.need * 0.4; } },
          run: function (x) { x.money(-x.need * 0.4); x.L.business = true; x.add('Вы начали своё дело на собственные сбережения.', 'work'); }
        },
        { label: 'Не рисковать', hint: 'спокойно', run: function (x) { x.stat('happy', -1); x.add('Вы решили не рисковать.', 'work'); } }
      ]
    },
    {
      id: 'housing', age: [25, 55], once: true,
      title: 'Жильё',
      text: function (x) { return 'Копить на своё жильё или снимать и тратить на жизнь сейчас?'; },
      options: [
        {
          label: 'Купить в ипотеку', hint: 'долг · своё жильё',
          req: {
            job: true,
            money: function (x) { return x.need * 0.5; },
            custom: {
              test: function (x) { return x.c.gdp > 6000; },
              why: 'ипотеки в стране почти нет', done: 'банки дают ипотеку'
            }
          },
          cost: { money: function (x) { return Math.min(x.L.money * 0.6, x.need); } },
          run: function (x) {
            x.flag('mortgage', true); x.L.home = true; x.money(-Math.min(x.L.money * 0.6, x.need));
            x.add('Вы взяли ипотеку. Своё жильё — и платёж на двадцать лет.', 'money'); x.stat('happy', 6);
          }
        },
        {
          label: 'Строить самим, по частям', hint: 'долго · без долгов',
          req: { money: function (x) { return x.need * 0.3; }, health: 40 },
          cost: { money: function (x) { return x.need * 0.3; } },
          run: function (x) { x.L.home = true; x.money(-x.need * 0.3); x.stat('health', -3); x.add('Дом строили сами, по комнате в год.', 'money'); }
        },
        { label: 'Снимать', hint: 'свобода · ничего своего', run: function (x) { x.stat('happy', 1); x.add('Вы остались в съёмном жилье.', 'money'); } }
      ]
    },
    {
      id: 'parent-care', age: [30, 65], once: true,
      cond: function (x) { return x.L.parentsAlive > 0; },
      title: 'Родители стареют',
      text: function (x) { return 'Родителям нужна помощь каждый день. Работа — в другом городе.'; },
      options: [
        {
          label: 'Переехать и ухаживать', hint: 'отношения ++ · карьера −',
          req: {
            custom: {
              test: function (x) { return x.L.money > x.need * 0.4 || x.L.partner; },
              why: 'не на что жить без работы', done: 'есть на что жить без работы'
            }
          },
          run: function (x) { x.stat('bond', 14); x.stat('happy', 3); x.L.careerBrake = true; x.add('Вы вернулись домой, чтобы ухаживать за родителями.', 'family'); }
        },
        {
          label: 'Нанять сиделку', hint: 'работа не пострадает',
          req: { money: function (x) { return x.need * 0.5; } },
          cost: { money: function (x) { return x.need * 0.5; } },
          run: function (x) { x.money(-x.need * 0.5); x.stat('bond', 4); x.add('Вы наняли сиделку и помогали деньгами.', 'family'); }
        },
        {
          label: 'Остаться на работе', hint: 'карьера · чувство вины',
          run: function (x) { x.stat('bond', -8); x.stat('happy', -6); x.add('Вы остались в своём городе. Звонили каждую неделю.', 'family'); }
        }
      ]
    },
    {
      id: 'kid-edu', age: [32, 60], once: true,
      cond: function (x) { return hasKids(x.L); },
      title: 'Образование детей',
      text: function (x) { return 'Ребёнок доучился до выбора. Хорошее образование стоит ' + M.fmtMoney(x.need * 0.9) + '.'; },
      options: [
        {
          label: 'Вложиться в учёбу детей', hint: 'дети выйдут дальше вас',
          req: { money: function (x) { return x.need * 0.9; } },
          cost: { money: function (x) { return x.need * 0.9; } },
          run: function (x) { x.money(-x.need * 0.9); x.L.kidsEducated = true; x.stat('happy', 7); x.stat('bond', 6); x.add('Вы отдали всё, что было, на учёбу детей.', 'family'); }
        },
        {
          label: 'Пусть учатся сами', hint: 'деньги целы',
          run: function (x) { x.stat('bond', -3); x.add('Дети пошли учиться там, где получилось.', 'family'); }
        }
      ]
    },
    {
      id: 'midlife', age: [38, 52], once: true,
      title: 'Половина пути',
      text: function (x) { return 'Половина жизни позади. Хочется чего-то другого.'; },
      options: [
        {
          label: 'Сменить профессию', hint: 'риск · новая жизнь',
          req: { know: 40, health: 35 },
          chance: function (x) { return clamp(0.4 + x.L.stats.know / 180, 0.2, 0.9); },
          run: function (x) { x.L.changeJob(); x.stat('happy', 8); x.add('Вы начали всё заново в другой профессии.', 'work'); },
          fail: function (x) {
            x.L.changeJob(); x.money(-x.need * 0.3); x.stat('happy', -6);
            x.add('Новая профессия не пошла: полгода без работы и заново с нуля.', 'bad');
          }
        },
        {
          label: 'Взять паузу и отдохнуть', hint: 'здоровье + · доход −',
          req: { money: function (x) { return x.need * 0.3; } },
          cost: { money: function (x) { return x.need * 0.3; } },
          run: function (x) { x.money(-x.need * 0.3); x.stat('health', 8); x.stat('happy', 6); x.add('Вы взяли год на себя.', 'life'); }
        },
        { label: 'Работать дальше', hint: 'стабильность', run: function (x) { x.stat('happy', -2); x.add('Ничего не поменялось.', 'work'); } }
      ]
    },
    {
      id: 'council', age: [30, 70], once: true,
      title: 'Общее дело',
      text: function (x) { return 'Соседи предлагают пойти в местный совет: воды нет третий месяц, и кто-то должен этим заняться.'; },
      options: [
        {
          label: 'Согласиться', hint: 'отношения ++ · время',
          req: { bond: 45, health: 30 },
          run: function (x) { x.L.council = true; x.stat('bond', 12); x.stat('happy', 5); x.stat('health', -2); x.add('Вас выбрали в местный совет.', 'good'); }
        },
        { label: 'Отказаться', hint: 'время семье', run: function (x) { x.stat('bond', -2); x.add('Вы отказались: своих дел хватает.', 'life'); } }
      ]
    },
    {
      id: 'divorce', age: [25, 70], once: true,
      cond: function (x) { return x.L.marital === 'married' || x.L.marital === 'partner'; },
      title: 'Кризис в браке',
      text: function (x) { return 'Третий год разговоры заканчиваются молчанием.'; },
      options: [
        {
          label: 'Попробовать сохранить', hint: 'разговоры, терпение, время',
          chance: function (x) { return clamp(0.4 + x.L.stats.bond / 200 + x.L.stats.happy / 400, 0.15, 0.92); },
          run: function (x) { x.stat('bond', 10); x.stat('happy', 6); x.add('Вы прошли через кризис и остались вместе.', 'family'); },
          fail: function (x) { x.L.divorce(); x.add('Сохранить не получилось.', 'bad'); }
        },
        {
          label: 'Развестись', hint: 'свобода · потери',
          req: { money: function (x) { return x.need * 0.4; } },
          cost: { money: function (x) { return x.need * 0.4; } },
          run: function (x) { x.L.divorce(); x.money(-x.need * 0.4); }
        },
        {
          label: 'Жить как есть', hint: 'стабильно · тускло',
          run: function (x) { x.stat('happy', -8); x.add('Вы остались вместе, почти не разговаривая.', 'family'); }
        }
      ]
    },
    {
      id: 'addiction', age: [18, 65], once: true, heavy: true,
      cond: function (x) { return x.L.stats.happy < 42; },
      title: 'Тяжёлый период',
      text: function (x) { return 'Стало слишком много выпивки — это заметили на работе.'; },
      options: [
        {
          label: 'Обратиться за помощью', hint: 'трудно признать, но работает',
          req: { money: function (x) { return x.need * 0.3; } },
          cost: { money: function (x) { return x.need * 0.3; } },
          run: function (x) { x.money(-x.need * 0.3); x.stat('health', 6); x.stat('happy', 8); x.add('Вы обратились за помощью и справились.', 'good'); x.help(); }
        },
        {
          label: 'Справляться самому', hint: 'без врачей и денег',
          chance: function (x) { return clamp(0.25 + x.L.stats.bond / 260 + x.L.stats.health / 400, 0.1, 0.7); },
          run: function (x) { x.stat('happy', 4); x.add('Вы справились сами.', 'good'); x.help(); },
          fail: function (x) {
            x.flag('addiction', true); x.stat('health', -12); x.stat('bond', -8);
            x.add('Справиться в одиночку не вышло.', 'bad'); x.help();
          }
        }
      ]
    },
    /* ------------------- деньги: что делать с ними ---------------------- */
    {
      id: 'grey-pay', money: true, age: [19, 58], once: true,
      chance: function (x) { return x.c.gdp < 12000 ? 0.26 : 0.16; },
      cond: function (x) { return working(x.L) && x.c.gdp < 30000 && !x.L.abroad; },
      title: 'Зарплата в конверте',
      text: function (x) {
        return 'На работе предлагают платить «в конверте»: на руки выйдет заметно больше, ' +
          'а по бумагам вы будете получать самый минимум. Пенсию потом посчитают по бумагам.';
      },
      options: [
        {
          label: 'Согласиться на конверт', hint: 'доход + · пенсия −',
          w: function (x) { return x.c.gdp < 9000 ? 5 : 2.5; },
          run: function (x) {
            x.L.incomeBoost = (x.L.incomeBoost || 1) * 1.12;
            x.flag('grey', true); x.stat('happy', 3);
            x.add('Зарплату стали платить в конверте: денег больше, бумаг меньше.', 'money');
          }
        },
        {
          label: 'Просить белую зарплату', hint: 'как посмотрит начальство',
          chance: function (x) {
            return clamp(0.3 + x.L.stats.know / 180 + (x.L.job && x.L.job.years > 5 ? 0.12 : 0), 0.15, 0.85);
          },
          run: function (x) {
            x.flag('grey', false); x.stat('happy', 4);
            x.add('Вас оформили полностью официально: идут взносы, копится стаж.', 'work');
          },
          fail: function (x) {
            x.L.job = null; x.L.unemployedYears = 0; x.stat('happy', -9);
            x.add('Разговор о белой зарплате закончился расчётом: с вами попрощались.', 'bad');
          }
        },
        {
          label: 'Искать место, где платят по-белому', hint: 'перерыв в работе',
          req: { know: 35 },
          run: function (x) {
            x.L.job = null; x.L.unemployedYears = 0; x.stat('happy', -3);
            x.add('Вы ушли искать работу с нормальным договором.', 'work');
          }
        }
      ]
    },
    {
      id: 'relative-loan', money: true, age: [24, 72], once: true,
      chance: function (x) { return 0.16; },
      cond: function (x) { return x.L.money > x.need * 0.5 && (x.L.siblings > 0 || hasKids(x.L)); },
      title: 'Родня просит в долг',
      text: function (x) {
        return 'Близкий человек просит взаймы ' + M.fmtMoney(x.need * 0.4) +
          ': у него беда, а занять больше не у кого. Обещает вернуть, как сможет.';
      },
      options: [
        {
          label: 'Дать, сколько просит', hint: 'родня запомнит · деньги могут не вернуться',
          req: { money: function (x) { return x.need * 0.4; } },
          cost: { money: function (x) { return x.need * 0.4; } },
          chance: function (x) { return clamp(0.3 + x.L.stats.bond / 150, 0.2, 0.88); },
          run: function (x) {
            x.money(-x.need * 0.04); x.stat('bond', 12); x.stat('happy', 2);
            x.add('Долг вернули — позже обещанного, но вернули. Такое не забывают.', 'family');
          },
          fail: function (x) {
            x.money(-x.need * 0.4); x.stat('bond', -10); x.stat('happy', -7);
            x.add('Деньги не вернули. Теперь нет ни денег, ни разговоров при встрече.', 'bad');
          }
        },
        {
          label: 'Дать половину', hint: 'меньше риск · меньше благодарность',
          req: { money: function (x) { return x.need * 0.2; } },
          cost: { money: function (x) { return x.need * 0.2; } },
          chance: function (x) { return clamp(0.4 + x.L.stats.bond / 150, 0.25, 0.9); },
          run: function (x) {
            x.money(-x.need * 0.02); x.stat('bond', 6);
            x.add('Половину одолжили, половину вернули вовремя.', 'family');
          },
          fail: function (x) {
            x.money(-x.need * 0.2); x.stat('bond', -4); x.stat('happy', -4);
            x.add('Одолженного так и не дождались, но хотя бы не всю сумму.', 'money');
          }
        },
        {
          label: 'Отказать', hint: 'деньги целы · отношения −',
          run: function (x) {
            x.stat('bond', -9); x.stat('happy', -4);
            x.add('Вы отказали. Деньги остались при вас, родня — на расстоянии.', 'family');
          }
        }
      ]
    },
    {
      id: 'cash-crunch', money: true, age: [21, 70], once: true,
      chance: function (x) { return 0.4; },
      cond: function (x) { return x.L.purse() < x.need * 0.55 && x.L.money < x.need * 0.3; },
      title: 'Деньги нужны сегодня',
      text: function (x) {
        return 'Срочно нужны ' + M.fmtMoney(x.need * 0.35) +
          ': лекарства, крыша, долг за учёбу — выбирать не приходится. В доме пусто.';
      },
      options: [
        {
          label: 'Взять микрозайм', hint: 'деньги сразу · отдавать вдвое',
          w: function (x) { return x.L.year >= 2005 ? 3 : 0.6; },
          run: function (x) {
            var sum = x.need * 0.35;
            x.money(sum);
            x.L.microDebt = (x.L.microDebt || 0) + sum * (1.9 + x.rnd() * 0.9);
            x.add('Деньги дали в тот же день — под проценты, от которых темнеет в глазах.', 'money');
          }
        },
        {
          label: 'Занять у родни', hint: 'без процентов · с разговорами',
          req: { bond: 40 },
          run: function (x) {
            x.money(x.need * 0.35); x.stat('bond', -7); x.stat('happy', -2);
            x.add('Деньги собрали всей роднёй. Теперь вы должны не банку, а своим.', 'family');
          }
        },
        {
          label: 'Продать нажитое', hint: 'вещи уйдут',
          req: {
            custom: {
              test: function (x) { return (x.L.spentTotal || 0) > x.need * 0.3; },
              why: 'продавать пока нечего', done: 'есть что продать'
            }
          },
          run: function (x) {
            x.money(x.need * 0.3); x.stat('happy', -6);
            x.add('Продали то, что покупали годами. Деньги есть, вещей нет.', 'money');
          }
        },
        {
          label: 'Обойтись без этого', hint: 'здоровье −',
          run: function (x) {
            x.stat('health', -5); x.stat('happy', -7);
            x.add('Денег не нашли. Пришлось обойтись — и это ещё аукнется.', 'bad');
          }
        }
      ]
    },
    {
      id: 'pyramid-call', money: true, age: [23, 75], once: true,
      chance: function (x) { return x.L.year >= 1990 ? 0.11 : 0.06; },
      cond: function (x) { return x.L.money > x.need * 0.3; },
      title: 'Сорок процентов в год',
      text: function (x) {
        return 'Знакомый зовёт в «надёжное дело»: обещают сорок процентов в год, показывают чужие выплаты ' +
          'и просят наличными. Говорит, он уже забрал первую прибыль.';
      },
      options: [
        {
          label: 'Вложить немного', hint: 'может удвоиться · может сгореть',
          req: { money: function (x) { return x.need * 0.25; } },
          cost: { money: function (x) { return x.need * 0.25; } },
          chance: function (x) { return 0.45; },
          run: function (x) {
            x.money(x.need * 0.25 * 0.4); x.stat('happy', 5);
            x.add('Выплату принесли вовремя, как и обещали. Вы вышли вовремя.', 'money');
          },
          fail: function (x) {
            x.money(-x.need * 0.25); x.stat('happy', -8);
            x.add('Контора закрылась, телефоны молчат. Деньги уехали вместе с конторой.', 'bad');
          }
        },
        {
          label: 'Вложить всерьёз', hint: 'большой куш · большой риск',
          req: { money: function (x) { return x.need * 0.9; } },
          cost: { money: function (x) { return x.need * 0.9; } },
          chance: function (x) { return 0.28; },
          run: function (x) {
            x.money(x.need * 0.9 * 0.8); x.stat('happy', 10);
            x.add('Вы успели забрать и свои, и чужие проценты до того, как всё рухнуло.', 'money');
          },
          fail: function (x) {
            x.money(-x.need * 0.9); x.stat('happy', -16); x.stat('bond', -5);
            x.add('Пирамида сложилась. Пропали деньги, которые копили годами.', 'bad');
          }
        },
        {
          label: 'Отказаться и отговорить родню', hint: 'отношения + · спокойный сон',
          run: function (x) {
            x.stat('bond', 6); x.stat('know', 2); x.stat('happy', 2);
            x.add('Вы не понесли ни копейки и отговорили своих. Через год контора исчезла.', 'good');
          }
        }
      ]
    },
    {
      id: 'inherit-house', money: true, age: [30, 78], once: true,
      chance: function (x) { return 0.22; },
      cond: function (x) { return x.L.parentsAlive === 0 && !x.L.abroad; },
      title: 'Дом, который остался',
      text: function (x) {
        return 'После родителей остался дом. Жить в нём некому, но и бросить нельзя: решать надо сейчас.';
      },
      options: [
        {
          label: 'Продать', hint: 'деньги сразу',
          w: function (x) { return 3; },
          run: function (x) {
            x.money(x.need * (1.2 + x.rnd() * 1.6)); x.stat('happy', -4);
            x.add('Дом продали. Деньги пришли, детство осталось на фотографиях.', 'money');
          }
        },
        {
          /* сдавать — дело хлопотное: в фоновых жизнях им не занимаются,
             поэтому вес нулевой и авторежим выбирает что-то попроще */
          label: 'Сдавать жильцам', hint: 'понемногу каждый год',
          w: function (x) { return 0; },
          req: {
            custom: {
              test: function (x) { return x.L.urban || x.c.gdp > 5000; },
              why: 'снимать здесь некому', done: 'жильцы найдутся'
            }
          },
          run: function (x) {
            var val = x.need * (1.2 + x.rnd() * 1.4);
            var IV = invest();
            if (IV && IV.grant) IV.grant(x.L, 'rent', val);
            else x.money(val * 0.1);
            x.add('Дом сдали жильцам: теперь он приносит понемногу, зато каждый год.', 'money');
          }
        },
        {
          label: 'Переехать самим', hint: 'своё жильё',
          w: function (x) { return 3; },
          run: function (x) {
            x.L.home = true; x.L.moves++; x.money(-x.need * 0.2); x.stat('happy', 7);
            x.add('Вы перебрались в родительский дом и привели его в порядок.', 'life');
          }
        },
        {
          label: 'Отдать родне', hint: 'отношения ++',
          w: function (x) { return 2; },
          run: function (x) {
            x.stat('bond', 12); x.stat('happy', 3);
            x.add('Дом отдали родне — без бумажных войн и обид.', 'family');
          }
        }
      ]
    },
    /* ============== цепочка: крыша над головой =====================
       Выселение → первая ночь → каждый день на улице → выходы обратно.
       Карточки с chain:true приходят только по расписанию, из движка. */
    {
      id: 'evict', money: true, age: [19, 85], priority: true,
      cond: function (x) {
        return !x.L.homeless && !x.L.abroad && x.L.money < -x.need * 1.1 &&
          x.L.age - (x.L.lastEvict === undefined ? -99 : x.L.lastEvict) > 6 &&
          !(x.L.home && !x.has('mortgage'));
      },
      title: 'Из жилья выселяют',
      text: function (x) {
        return x.has('mortgage')
          ? 'Платежей по ипотеке не было слишком долго. Банк забирает квартиру: съехать надо до конца месяца.'
          : 'Долг за жильё перерос все разговоры. Хозяин ставит срок: до конца месяца.';
      },
      options: [
        {
          label: 'Уговорить подождать ещё', hint: 'отсрочка · как получится',
          w: function (x) { return 3; },
          chance: function (x) { return clamp(0.25 + x.L.stats.bond / 170 + x.L.stats.know / 320, 0.15, 0.8); },
          run: function (x) {
            x.L.schedule('evict', 2);
            x.add('Вам дали отсрочку. Съезжать пока не надо, но долг никуда не делся.', 'money');
            x.stat('happy', -4);
          },
          fail: function (x) {
            x.L.toStreet('Ждать больше не стали: вещи вынесли на улицу, замок сменили.');
          }
        },
        {
          label: 'Переехать к родне', hint: 'тесно · но крыша есть',
          w: function (x) { return 4; },
          req: { bond: 42 },
          run: function (x) {
            x.L.flag('atRelatives', true); x.L.moves++;
            x.stat('bond', -6); x.stat('happy', -7);
            x.add('Вы перебрались к родне: матрас в проходной комнате и чужие правила.', 'family');
            x.L.schedule('relatives-tired', 2 + x.rnd.int(3));
          }
        },
        {
          label: 'Продать всё и снять комнату', hint: 'вещи уйдут · адрес останется',
          w: function (x) { return 2.5; },
          req: {
            custom: {
              test: function (x) { return (x.L.spentTotal || 0) > x.need * 0.5; },
              why: 'продавать нечего', done: 'есть что продать'
            }
          },
          run: function (x) {
            x.money(x.need * (0.3 + x.rnd() * 0.4)); x.L.moves++;
            x.stat('happy', -6);
            x.add('Продали всё, что нажили, и сняли комнату поменьше.', 'money');
          }
        },
        {
          label: 'Занять под любой процент', hint: 'крыша сегодня · долг завтра',
          w: function (x) { return 1.6; },
          run: function (x) {
            x.L.takeLoan(x.need * 0.8, 4, 0.34);
            x.add('Деньги нашли под дикий процент. Выселение отменили.', 'money');
            x.stat('happy', -3);
          }
        },
        {
          label: 'Уехать туда, откуда вы родом', hint: 'дом есть · работы нет',
          w: function (x) { return 2; },
          req: {
            custom: {
              test: function (x) { return x.L.parentsAlive > 0 || !x.L.urban || x.c.gdp < 12000; },
              why: 'возвращаться некуда', done: 'есть куда вернуться'
            }
          },
          run: function (x) {
            x.L.urban = false; x.L.moves++;
            if (x.L.job) { x.L.job = null; x.L.unemployedYears = 0; }
            x.stat('happy', -5); x.stat('bond', 4);
            x.add('Вы уехали туда, где вас помнят: дом старый, работы нет, но не улица.', 'life');
          }
        },
        {
          label: 'Дождаться приставов', hint: 'улица',
          w: function (x) { return 0.8; },
          run: function (x) {
            x.L.toStreet('Пришли приставы. Вещи — в мешки, вы — за дверь.');
          }
        }
      ]
    },
    {
      id: 'relatives-tired', chain: true, age: [19, 90],
      cond: function (x) { return x.has('atRelatives') && !x.L.homeless; },
      title: 'У родни кончилось терпение',
      text: function (x) {
        return 'Полгода вы спите в проходной комнате. Разговоры на кухне всё громче, и однажды вам говорят прямо.';
      },
      options: [
        {
          label: 'Снять своё жильё', hint: 'нужны деньги',
          w: function (x) { return 4; },
          req: { money: function (x) { return x.need * 0.35; } },
          cost: { money: function (x) { return x.need * 0.35; } },
          run: function (x) {
            x.money(-x.need * 0.35); x.L.flag('atRelatives', false); x.L.moves++;
            x.stat('happy', 8); x.stat('bond', 3);
            x.add('Вы сняли своё жильё — пусть комнату, зато свою.', 'life');
          }
        },
        {
          label: 'Отработать своё место', hint: 'ремонт, уход, помощь',
          w: function (x) { return 3; },
          req: { health: 35 },
          run: function (x) {
            x.stat('health', -3); x.stat('bond', 8); x.stat('happy', -2);
            x.add('Вы стали тем, кто чинит, возит и сидит с детьми. Вас терпят.', 'family');
            x.L.schedule('relatives-tired', 3 + x.rnd.int(4));
          }
        },
        {
          label: 'Уйти, чтобы не унижаться', hint: 'улица',
          w: function (x) { return 0.7; },
          run: function (x) {
            x.L.flag('atRelatives', false);
            x.L.toStreet('Вы собрали сумку и ушли, не дожидаясь, пока попросят.');
          }
        }
      ]
    },
    {
      id: 'street-first', chain: true, age: [10, 100],
      cond: function (x) { return !!x.L.homeless; },
      title: 'Первая ночь без дома',
      text: function (x) {
        return 'Темнеет, и впервые в жизни непонятно, куда идти. В сумке документы, зарядка и две футболки.';
      },
      options: [
        {
          label: 'Ночевать на вокзале', hint: 'тепло · облавы',
          w: function (x) { return 3; },
          run: function (x) {
            x.stat('health', -2); x.stat('happy', -4);
            x.add('Вокзал: тепло, светло и каждые два часа обход.', 'bad');
            if (x.rnd() < 0.3) {
              x.stat('happy', -4);
              x.add('Под утро вас вывели на мороз вместе с остальными.', 'bad');
            }
          }
        },
        {
          label: 'Подвал или стройка', hint: 'тихо · холодно',
          w: function (x) { return 3; },
          run: function (x) {
            x.stat('health', -4);
            x.add('Нашли подвал с трубами. Там тепло от теплотрассы и пахнет сыростью.', 'bad');
          }
        },
        {
          label: 'Пойти в ночлежку', hint: 'койка · очередь · правила',
          w: function (x) { return 3.5; },
          req: {
            custom: {
              test: function (x) { return x.c.gdp > 6000 && x.L.urban; },
              why: 'ночлежек здесь нет', done: 'в городе есть ночлежка'
            }
          },
          run: function (x) {
            x.stat('health', 2); x.stat('happy', 3);
            x.L.flag('shelter', true);
            x.add('В ночлежке дали койку, суп и список: что нужно, чтобы вернуться к жизни.', 'good');
            x.L.schedule('street-help', 1);
          }
        },
        {
          label: 'Проситься к знакомым', hint: 'на пару ночей',
          w: function (x) { return 2.5; },
          req: { bond: 38 },
          chance: function (x) { return clamp(0.2 + x.L.stats.bond / 150, 0.15, 0.75); },
          run: function (x) {
            x.stat('happy', 6);
            x.L.offStreet('Старый друг пустил пожить и помог встать на ноги.');
            x.stat('bond', 6);
          },
          fail: function (x) {
            x.stat('happy', -8); x.stat('bond', -6);
            x.add('Вам не отказали прямо — просто никто не перезвонил.', 'bad');
          }
        },
        {
          label: 'Уехать куда глаза глядят', hint: 'новый город · никого',
          w: function (x) { return 1.2; },
          run: function (x) {
            x.L.moves++; x.stat('bond', -8); x.stat('health', -2);
            x.add('Вы уехали в другой город, где вас никто не знает — и некому помочь.', 'life');
          }
        }
      ]
    },
    {
      id: 'street-day', chain: true, age: [10, 100],
      cond: function (x) { return !!x.L.homeless; },
      title: function (x) { return 'Улица: чем жить'; },
      text: function (x) {
        return 'Утро начинается с одного вопроса: где взять сегодня еду и где спать ночью.';
      },
      options: [
        {
          label: 'Собирать бутылки и картон', hint: 'копейки · спина',
          w: function (x) { return 3; },
          run: function (x) {
            x.money(x.need * (0.03 + x.rnd() * 0.05)); x.stat('health', -2);
            x.add('Весь день с мешком по дворам: бутылки, картон, металл.', 'money');
          }
        },
        {
          label: 'Просить у прохожих', hint: 'быстрее · унизительно',
          w: function (x) { return 2.5; },
          run: function (x) {
            x.money(x.need * (0.05 + x.rnd() * 0.08));
            x.stat('happy', -7); x.stat('bond', -3);
            x.add('Вы сидели у перехода с картонкой. Подавали редко, но подавали.', 'money');
          }
        },
        {
          label: 'Браться за любую подёнщину', hint: 'шанс зацепиться',
          w: function (x) { return 3; },
          req: { health: 38 },
          chance: function (x) { return clamp(0.25 + x.L.stats.health / 220 + x.L.stats.know / 400, 0.15, 0.7); },
          run: function (x) {
            x.money(x.need * (0.1 + x.rnd() * 0.15)); x.stat('health', -2);
            x.add('Разгружали фуры и мешали раствор. Заплатили и позвали ещё.', 'work');
            x.L.schedule('street-job', 1);
          },
          fail: function (x) {
            x.stat('health', -3); x.stat('happy', -5);
            x.add('Отработали неделю — расчёт пообещали и пропали.', 'bad');
          }
        },
        {
          label: 'Взять чужое', hint: 'еда сегодня · суд завтра',
          w: function (x) { return 1; },
          chance: function (x) { return clamp(0.55 + x.L.stats.know / 400, 0.3, 0.8); },
          run: function (x) {
            x.money(x.need * (0.1 + x.rnd() * 0.2)); x.stat('happy', -4);
            x.add('Взяли то, что плохо лежало. В этот раз обошлось.', 'bad');
          },
          fail: function (x) {
            x.add('Вас поймали на краже и увезли в отдел.', 'bad');
            x.L.schedule('court-theft', 0);
          }
        },
        {
          label: 'Найти своих', hint: 'если есть кому звонить',
          w: function (x) { return 2.2; },
          req: { bond: 28 },
          chance: function (x) { return clamp(0.15 + x.L.stats.bond / 140, 0.1, 0.7); },
          run: function (x) {
            x.L.offStreet('Родные нашлись и забрали вас к себе. Вы снова спите в кровати.');
            x.stat('bond', 10);
          },
          fail: function (x) {
            x.stat('happy', -6); x.stat('bond', -4);
            x.add('Номер не отвечает. Адрес старый. Своих вы так и не нашли.', 'bad');
          }
        },
        {
          label: 'Заняться документами', hint: 'долго · но это выход',
          w: function (x) { return 2.5; },
          req: {
            custom: {
              test: function (x) { return x.c.gdp > 4000; },
              why: 'без адреса здесь не восстановят бумаги', done: 'бумаги можно восстановить'
            }
          },
          run: function (x) {
            x.stat('know', 2); x.stat('happy', 2);
            x.add('Вы начали собирать справки: без паспорта нет ни работы, ни койки.', 'life');
            x.L.schedule('street-docs', 1);
          }
        }
      ]
    },
    {
      id: 'street-winter', chain: true, heavy: true, age: [10, 100],
      cond: function (x) { return !!x.L.homeless; },
      title: 'Зима',
      text: function (x) {
        return x.L.coldWinter() > 0.6
          ? 'Ночью минус двадцать. Пережить зиму на улице получается не у всех.'
          : 'Ночи стали холодными и мокрыми, а сухой одежды нет.';
      },
      options: [
        {
          label: 'Спать в подъезде и на трубах', hint: 'опасно',
          w: function (x) { return 2; },
          run: function (x) {
            x.stat('health', -7);
            var risk = 0.03 + x.L.coldWinter() * 0.07 + (x.L.age > 55 ? 0.03 : 0);
            if (x.rnd() < risk) {
              x.add('Эту ночь вы не пережили: утром вас нашли у батареи в подъезде.', 'bad');
              x.L.die('переохлаждение');
            } else {
              x.add('Зиму перетерпели в подъездах: кашель, обморожённые пальцы, но живы.', 'bad');
            }
          }
        },
        {
          label: 'Ночлежка на всю зиму', hint: 'койка · правила · трезвость',
          w: function (x) { return 4; },
          req: {
            custom: {
              test: function (x) { return x.c.gdp > 6000 && x.L.urban; },
              why: 'ночлежек здесь нет', done: 'в городе есть ночлежка'
            }
          },
          run: function (x) {
            x.stat('health', -1); x.stat('happy', 4);
            x.L.flag('shelter', true);
            x.add('Всю зиму — ночлежка: отбой в десять, зато вы живы и в тепле.', 'good');
            if (x.has('addiction') && x.rnd() < 0.4) {
              x.flag('addiction', false);
              x.add('В ночлежке не наливают. За зиму вы отвыкли.', 'good');
            }
            x.L.schedule('street-help', 1);
          }
        },
        {
          label: 'Уехать туда, где теплее', hint: 'юг · чужой город',
          w: function (x) { return 1.5; },
          req: { money: function (x) { return x.need * 0.08; } },
          cost: { money: function (x) { return x.need * 0.08; } },
          run: function (x) {
            x.money(-x.need * 0.08); x.L.moves++;
            x.stat('health', -2); x.stat('bond', -3);
            x.add('Зиму переждали на юге: там теплее и таких, как вы, больше.', 'life');
          }
        },
        {
          label: 'Греться у костра с другими', hint: 'люди · огонь · бутылка',
          w: function (x) { return 2; },
          run: function (x) {
            x.stat('health', -5); x.stat('bond', 5); x.stat('happy', 2);
            x.add('Бочка с огнём, чужие истории и общая бутылка — так и грелись.', 'life');
            if (!x.has('addiction') && x.rnd() < 0.3) {
              x.flag('addiction', true);
              x.add('Греться стали чаще изнутри, чем снаружи.', 'bad');
            }
          }
        }
      ]
    },
    {
      id: 'street-docs', chain: true, age: [10, 100],
      cond: function (x) { return !!x.L.homeless; },
      title: 'Бумаги',
      text: function (x) {
        return 'Без паспорта вы никто: ни работы, ни лечения, ни места в общежитии. Восстановить можно, но это очереди и деньги.';
      },
      options: [
        {
          label: 'Ходить по кабинетам, пока не дадут', hint: 'месяцы · упрямство',
          w: function (x) { return 4; },
          chance: function (x) { return clamp(0.35 + x.L.stats.know / 150, 0.2, 0.9); },
          run: function (x) {
            x.L.flag('docs', true); x.stat('happy', 6); x.stat('know', 2);
            x.add('Паспорт на руках. Теперь с вами хотя бы разговаривают.', 'good');
            x.L.schedule('street-job', 1);
          },
          fail: function (x) {
            x.stat('happy', -6);
            x.add('В одном окне не хватило справки из другого. Всё заново.', 'bad');
            x.L.schedule('street-docs', 2);
          }
        },
        {
          label: 'Попросить помощи у волонтёров', hint: 'помогут · если дойдёте',
          w: function (x) { return 3.5; },
          req: {
            custom: {
              test: function (x) { return x.c.gdp > 6000 || x.L.urban; },
              why: 'таких служб здесь нет', done: 'в городе помогают с бумагами'
            }
          },
          run: function (x) {
            x.L.flag('docs', true); x.stat('happy', 5); x.stat('bond', 4);
            x.add('Волонтёры сделали за месяц то, что вы не могли год: паспорт, справки, адрес.', 'good');
            x.L.schedule('street-help', 1);
          }
        },
        {
          label: 'Махнуть рукой', hint: 'без бумаг выхода нет',
          w: function (x) { return 1; },
          run: function (x) {
            x.stat('happy', -5);
            x.add('Вы перестали ходить по кабинетам. Так проще — и так глубже.', 'bad');
          }
        }
      ]
    },
    {
      id: 'street-job', chain: true, age: [14, 75],
      cond: function (x) { return !!x.L.homeless; },
      title: 'Работа без адреса',
      text: function (x) {
        return x.has('docs')
          ? 'С паспортом вас готовы взять. Вопрос — куда и какой ценой.'
          : 'Работа есть и без бумаг, только берут туда, где не спрашивают имени.';
      },
      options: [
        {
          label: 'Вахта на стройке с общежитием', hint: 'жильё при работе',
          w: function (x) { return 4; },
          req: { health: 35 },
          chance: function (x) { return clamp(0.4 + x.L.stats.health / 200 + (x.has('docs') ? 0.2 : -0.1), 0.2, 0.9); },
          run: function (x) {
            x.L.offStreet('Вахта: бытовка, работа по двенадцать часов — и крыша над головой.');
            x.L.hire('hard'); x.stat('health', -4); x.money(x.need * 0.2);
          },
          fail: function (x) {
            x.stat('health', -4); x.stat('happy', -6);
            x.add('На вахте продержались месяц: не взяли без прописки, расчёт зажали.', 'bad');
          }
        },
        {
          label: 'Мыть посуду за еду и угол', hint: 'мало · зато стабильно',
          w: function (x) { return 3; },
          chance: function (x) { return clamp(0.45 + (x.has('docs') ? 0.2 : 0), 0.25, 0.85); },
          run: function (x) {
            x.L.offStreet('Кухня в столовой: еда, душ и каморка при кухне. Это уже дом.');
            x.L.hire('stable'); x.stat('happy', 5);
          },
          fail: function (x) {
            x.stat('happy', -4);
            x.add('Взяли на неделю, а потом сказали, что без документов нельзя.', 'bad');
          }
        },
        {
          label: 'Сторожем на дальнюю базу', hint: 'одиночество · комната',
          w: function (x) { return 2.5; },
          req: {
            custom: {
              test: function (x) { return x.has('docs') || x.c.gdp < 9000; },
              why: 'без паспорта на такое не берут', done: 'берут и так'
            }
          },
          run: function (x) {
            x.L.offStreet('Сторожка на дальней базе: печка, чайник, тишина. Вы снова при месте.');
            x.L.hire('stable'); x.stat('bond', -5); x.stat('happy', 4);
          }
        },
        {
          label: 'Остаться на улице', hint: 'там хотя бы свои',
          w: function (x) { return 0.8; },
          run: function (x) {
            x.stat('happy', -3);
            x.add('Вы решили не связываться: на улице свои правила, зато понятные.', 'life');
          }
        }
      ]
    },
    {
      id: 'street-help', chain: true, age: [10, 100],
      cond: function (x) { return !!x.L.homeless; },
      title: 'Вас нашли',
      text: function (x) {
        return 'Соцработник из приюта говорит: есть место в общежитии, лечение и работа — но придётся делать всё по правилам.';
      },
      options: [
        {
          label: 'Согласиться на всё', hint: 'выход · но не сразу',
          w: function (x) { return 4; },
          chance: function (x) { return clamp(0.5 + x.L.stats.health / 300 - (x.has('addiction') ? 0.25 : 0), 0.2, 0.92); },
          run: function (x) {
            x.L.offStreet('Общежитие, работа при приюте и своя койка с номером. Улица закончилась.');
            x.L.hire('stable');
            if (x.has('addiction') && x.rnd() < 0.5) {
              x.flag('addiction', false);
              x.add('В программе помогли завязать.', 'good');
            }
          },
          fail: function (x) {
            x.stat('happy', -7);
            x.add('Вы сорвались на второй неделе, и место отдали другому.', 'bad');
            x.L.schedule('street-help', 3);
          }
        },
        {
          label: 'Взять только лечение', hint: 'здоровье · без правил',
          w: function (x) { return 2.5; },
          run: function (x) {
            x.stat('health', 9); x.stat('happy', 3);
            x.flag('untreated', false);
            x.add('Вас отвезли к врачу и подлечили. Жить всё так же негде.', 'health');
          }
        },
        {
          label: 'Отказаться', hint: 'сам по себе',
          w: function (x) { return 1; },
          run: function (x) {
            x.stat('happy', -2);
            x.add('Вы отказались: приют — это правила, а правила вы уже пробовали.', 'life');
          }
        }
      ]
    },
    {
      id: 'court-theft', chain: true, age: [12, 90],
      title: 'Суд за кражу',
      text: function (x) {
        return 'Дело дошло до суда. Украдено немного, но судят не за сумму, а за то, что попались.';
      },
      options: [
        {
          label: 'Признать вину и просить снисхождения', hint: 'условный срок',
          w: function (x) { return 3.5; },
          chance: function (x) { return clamp(0.55 + x.L.stats.know / 250, 0.3, 0.9); },
          run: function (x) {
            x.L.flag('exCon', true); x.L.careerBrake = true;
            x.stat('happy', -6);
            x.add('Дали условно. Судимость останется с вами дольше, чем долг.', 'bad');
          },
          fail: function (x) {
            x.L.flag('exCon', true); x.L.careerBrake = true;
            x.L.job = null; x.stat('health', -6); x.stat('happy', -14); x.stat('bond', -8);
            x.add('Дали реальный срок. Два года прошли за забором.', 'bad');
            x.L.schedule('after-jail', 2);
          }
        },
        {
          label: 'Нанять адвоката', hint: 'деньги решают',
          w: function (x) { return 2; },
          req: { money: function (x) { return x.need * 0.3; } },
          cost: { money: function (x) { return x.need * 0.3; } },
          chance: function (x) { return 0.72; },
          run: function (x) {
            x.money(-x.need * 0.3);
            x.add('Адвокат развалил дело: вас отпустили прямо из зала.', 'good');
          },
          fail: function (x) {
            x.money(-x.need * 0.3); x.L.flag('exCon', true); x.L.careerBrake = true;
            x.stat('happy', -8);
            x.add('Адвокат взял деньги, а срок всё равно дали — условный.', 'bad');
          }
        },
        {
          label: 'Всё отрицать', hint: 'как повезёт',
          w: function (x) { return 1.5; },
          chance: function (x) { return clamp(0.2 + x.L.stats.know / 200, 0.1, 0.6); },
          run: function (x) {
            x.add('Доказать не смогли: вас отпустили.', 'good');
            x.stat('happy', 3);
          },
          fail: function (x) {
            x.L.flag('exCon', true); x.L.careerBrake = true; x.L.job = null;
            x.stat('health', -7); x.stat('happy', -15); x.stat('bond', -9);
            x.add('За упорство дали по полной: три года.', 'bad');
            x.L.schedule('after-jail', 3);
          }
        }
      ]
    },
    {
      id: 'after-jail', chain: true, age: [14, 95],
      title: 'После срока',
      text: function (x) {
        return 'Вы вышли. В кармане справка об освобождении, на руках — судимость, которую видно каждому работодателю.';
      },
      options: [
        {
          label: 'Искать работу честно', hint: 'долго · с отказами',
          w: function (x) { return 3.5; },
          chance: function (x) { return clamp(0.3 + x.L.stats.know / 200, 0.15, 0.75); },
          run: function (x) {
            x.L.hire('stable'); x.L.careerBrake = false;
            if (x.L.homeless) x.L.offStreet('Вас взяли на работу с общежитием. Улица закончилась.');
            x.stat('happy', 8);
            x.add('Нашёлся работодатель, которому было всё равно на вашу бумагу.', 'work');
          },
          fail: function (x) {
            x.stat('happy', -7);
            x.add('Везде одно: «мы вам перезвоним». Не перезвонили.', 'bad');
            if (!x.L.homeless && x.L.money < 0) x.L.toStreet('Деваться стало некуда: вы оказались на улице.');
          }
        },
        {
          label: 'Вернуться к старым знакомым', hint: 'деньги быстро · риск',
          w: function (x) { return 1.5; },
          chance: function (x) { return 0.5; },
          run: function (x) {
            x.money(x.need * (0.3 + x.rnd() * 0.6)); x.stat('happy', 2);
            x.add('Старые знакомые нашли вам дело без вопросов. Деньги появились.', 'money');
          },
          fail: function (x) {
            x.add('Старое дело закончилось новым задержанием.', 'bad');
            x.L.schedule('court-theft', 0);
          }
        },
        {
          label: 'Уехать туда, где вас не знают', hint: 'начать с нуля',
          w: function (x) { return 2.5; },
          run: function (x) {
            x.L.moves++; x.stat('bond', -7); x.stat('happy', 3);
            x.L.careerBrake = false;
            x.add('Вы уехали в другой город и никому не стали рассказывать, откуда.', 'life');
          }
        }
      ]
    },
    /* ================== цепочка: кредит ============================ */
    {
      id: 'take-loan', money: true, age: [21, 66],
      cond: function (x) {
        return !x.L.loan && !x.L.homeless && working(x.L) && x.L.year >= 1965 && !x.has('bankrupt');
      },
      chance: function (x) { return 0.3; },
      title: 'Взять кредит?',
      text: function (x) {
        return 'В банке одобрили кредит: деньги дадут сегодня, платить — каждый год ' +
          'из тех же самых денег, которых и так не хватает.';
      },
      options: [
        {
          label: 'На ремонт и мебель', hint: 'дом станет домом',
          w: function (x) { return 3; },
          run: function (x) {
            x.L.takeLoan(x.need * 1.2, 5, 0.14);
            x.stat('happy', 8);
            x.add('Взяли кредит на ремонт: обои, плита, диван — и платёж на пять лет.', 'money');
          }
        },
        {
          label: 'На лечение', hint: 'здоровье сейчас · может не помочь',
          w: function (x) { return 1.3; },
          req: {
            custom: {
              test: function (x) { return x.has('untreated') || x.has('chronic') || x.L.stats.health < 55; },
              why: 'лечиться пока не от чего', done: 'лечение нужно'
            }
          },
          chance: function (x) { return clamp(0.5 + x.c.gdp / 90000, 0.42, 0.82); },
          run: function (x) {
            x.L.takeLoan(x.need * 1.5, 5, 0.14);
            x.flag('untreated', false);
            x.stat('health', 12); x.stat('happy', 6);
            x.add('Операцию сделали в кредит. Здоровье вернули, долг остался.', 'health');
          },
          fail: function (x) {
            x.L.takeLoan(x.need * 1.5, 5, 0.14);
            x.stat('health', 3); x.stat('happy', -4);
            x.add('Деньги ушли на обследования и лекарства, а легче так и не стало. Долг остался.', 'health');
          }
        },
        {
          label: 'На свадьбу и праздник', hint: 'один день · пять лет платежей',
          w: function (x) { return 2; },
          run: function (x) {
            x.L.takeLoan(x.need * 1.4, 5, 0.16);
            x.stat('happy', 10); x.stat('bond', 10);
            x.add('Свадьбу сыграли так, что помнит вся родня. И банк тоже.', 'family');
          }
        },
        {
          label: 'На машину', hint: 'работа дальше · платёж больше',
          w: function (x) { return 2.5; },
          run: function (x) {
            x.L.takeLoan(x.need * 2.2, 6, 0.15);
            x.L.incomeBoost = (x.L.incomeBoost || 1) * 1.06;
            x.L.flag('car', true); x.L.upkeep += 0.03;
            x.stat('happy', 9);
            x.add('Машина у подъезда: теперь можно работать дальше от дома.', 'money');
          }
        },
        {
          label: 'На своё дело', hint: 'шанс · и долг',
          w: function (x) { return 1.5; },
          req: { know: 40 },
          run: function (x) {
            x.L.takeLoan(x.need * 2.5, 6, 0.18);
            x.stat('happy', 5); x.stat('know', 2);
            x.add('Деньги на дело взяли в банке: теперь оно должно хотя бы кормить платёж.', 'money');
          }
        },
        {
          label: 'Не брать', hint: 'жить по средствам',
          w: function (x) { return 3; },
          run: function (x) {
            x.stat('happy', -2);
            x.add('Вы отказались от кредита и остались при своих.', 'life');
          }
        }
      ]
    },
    {
      id: 'loan-trouble', chain: true, age: [18, 95],
      cond: function (x) { return !!x.L.loan; },
      title: 'Платить нечем',
      text: function (x) {
        return 'Второй платёж подряд ушёл в минус. Из банка звонят каждый день, потом начнут звонить родне.';
      },
      options: [
        {
          label: 'Просить реструктуризацию', hint: 'платёж меньше · срок длиннее',
          w: function (x) { return 4; },
          chance: function (x) { return clamp(0.4 + x.L.stats.know / 200, 0.2, 0.85); },
          run: function (x) {
            var L = x.L.loan;
            if (L) { L.pay *= 0.62; L.years += 4; L.left *= 1.08; L.miss = 0; }
            x.stat('happy', 4);
            x.add('Банк растянул долг: платёж стал меньше, а срок — длиннее.', 'money');
          },
          fail: function (x) {
            x.stat('happy', -6);
            x.add('В реструктуризации отказали: платите как договаривались.', 'bad');
            x.L.schedule('loan-court', 2);
          }
        },
        {
          label: 'Перекредитоваться', hint: 'закрыть долг новым долгом',
          w: function (x) { return 2; },
          run: function (x) {
            var L = x.L.loan;
            var left = L ? L.left : x.need;
            x.L.loan = null;
            x.L.takeLoan(left * 1.05, 5, 0.3);
            x.money(-left * 1.05);
            x.L.flag('spiral', true);
            x.stat('happy', -3);
            x.add('Старый кредит закрыли новым — под процент, о котором лучше не думать.', 'money');
          }
        },
        {
          label: 'Продать нажитое и закрыть', hint: 'вещи уйдут · долг тоже',
          w: function (x) { return 3; },
          req: {
            custom: {
              test: function (x) { return (x.L.spentTotal || 0) > x.need * 0.6 || (x.L.money || 0) > 0; },
              why: 'продавать нечего', done: 'есть что продать'
            }
          },
          run: function (x) {
            var L = x.L.loan;
            var part = L ? Math.min(L.left, x.need * 1.2) : 0;
            if (L) { L.left -= part; L.miss = 0; if (L.left <= 0.5) { x.L.loan = null; x.L.flag('goodCredit', true); } }
            x.money(-x.need * 0.15); x.stat('happy', -7);
            x.add('Продали машину, технику и кольца — долг стал меньше.', 'money');
          }
        },
        {
          label: 'Занять у родни', hint: 'отношения −',
          w: function (x) { return 2.5; },
          req: { bond: 45 },
          run: function (x) {
            var L = x.L.loan;
            if (L) { L.left -= x.need * 0.8; L.miss = 0; if (L.left <= 0.5) { x.L.loan = null; x.L.flag('goodCredit', true); } }
            x.stat('bond', -10); x.stat('happy', -3);
            x.add('Родня скинулась и закрыла самый горящий платёж. Теперь вы должны им.', 'family');
          }
        },
        {
          label: 'Перестать платить', hint: 'коллекторы · суд',
          w: function (x) { return 1.2; },
          run: function (x) {
            x.L.flag('noPay', true);
            x.stat('happy', -4);
            x.add('Вы перестали брать трубку. Платежи остановились, время пошло.', 'bad');
            x.L.schedule('loan-court', 2);
          }
        }
      ]
    },
    {
      id: 'loan-court', chain: true, age: [18, 95],
      cond: function (x) { return !!x.L.loan || x.has('noPay'); },
      title: 'Суд и приставы',
      text: function (x) {
        return 'Банк подал в суд. Решение будет не в вашу пользу: вопрос только в том, что заберут.';
      },
      options: [
        {
          label: 'Объявить себя банкротом', hint: 'долгов нет · кредитов тоже',
          w: function (x) { return 3; },
          req: {
            custom: {
              test: function (x) { return x.c.gdp > 9000 || x.L.stats.know > 45; },
              why: 'банкротства здесь нет', done: 'банкротство возможно'
            }
          },
          run: function (x) {
            x.L.loan = null; x.L.flag('noPay', false); x.L.flag('inCourt', false);
            x.L.flag('bankrupt', true); x.L.flag('goodCredit', false);
            var IV = invest();
            if (IV && IV.holdings) {
              IV.holdings(x.L).forEach(function (o) { IV.take(x.L, o.id, o.val); });
            }
            x.stat('happy', -6); x.stat('know', 3);
            x.add('Вас признали банкротом: долги списали, имущество забрали, кредитов больше не дадут.', 'money');
          }
        },
        {
          label: 'Отдать квартиру банку', hint: 'крыша уйдёт',
          w: function (x) { return 2.5; },
          req: {
            custom: {
              test: function (x) { return !!x.L.home; },
              why: 'своего жилья нет', done: 'есть своё жильё'
            }
          },
          run: function (x) {
            x.L.loan = null; x.L.home = false; x.L.flag('mortgage', false);
            x.L.flag('noPay', false); x.L.flag('inCourt', false);
            x.money(x.need * 0.3); x.stat('happy', -12);
            x.add('Квартиру забрали в счёт долга. Остаток вернули наличными — и на этом всё.', 'bad');
            x.L.schedule('evict', 2);
          }
        },
        {
          label: 'Платить любой ценой', hint: 'работать на долг',
          w: function (x) { return 2.5; },
          run: function (x) {
            var L = x.L.loan;
            if (L) { L.pay *= 1.25; L.miss = 0; }
            x.L.flag('noPay', false); x.L.flag('inCourt', false);
            x.money(-x.need * 0.3);
            x.stat('health', -5); x.stat('happy', -8);
            x.add('Вы взяли вторую работу и платите всё, что зарабатываете.', 'work');
          }
        },
        {
          label: 'Прятаться от приставов', hint: 'время · потом хуже',
          w: function (x) { return 1.2; },
          chance: function (x) { return 0.4; },
          run: function (x) {
            x.stat('happy', -4);
            x.add('Приставы не нашли ни вас, ни имущества. Пока.', 'bad');
            x.L.schedule('loan-court', 3);
          },
          fail: function (x) {
            x.L.loan = null;
            x.L.flag('noPay', false); x.L.flag('inCourt', false);
            x.L.toStreet('Описали и забрали всё, включая жильё. Вы оказались на улице.');
          }
        }
      ]
    },
    {
      id: 'retire', age: [55, 72], once: true, priority: true,
      cond: function (x) { return working(x.L) && x.L.age >= 55 + (x.L.retireLate || 0); },
      title: 'Пора на покой?',
      text: function (x) {
        return x.c.gdp > 15000
          ? 'Пенсия будет небольшой, но она будет.'
          : 'Пенсии почти нет. Работать придётся столько, сколько сможете.';
      },
      options: [
        {
          label: 'Выйти на пенсию', hint: 'здоровье + · доход −',
          w: function (x) { return x.c.gdp > 15000 ? 6 : 1.2; },
          req: {
            custom: {
              test: function (x) { return x.c.gdp > 8000 || x.L.money > x.need * 1.5 || x.L.age >= 65; },
              why: 'пенсии здесь почти нет — нужны накопления или возраст',
              done: 'пенсия или накопления есть'
            }
          },
          run: function (x) { x.L.retire(); x.stat('health', 5); x.stat('happy', 6); }
        },
        {
          label: 'Работать дальше', hint: 'доход · усталость',
          w: function (x) { return x.c.gdp > 15000 ? 2 : 6; },
          run: function (x) { x.stat('health', -5); x.add('Вы продолжили работать.', 'work'); }
        }
      ]
    },
    {
      id: 'late-move', age: [68, 95], once: true,
      title: 'Где доживать',
      text: function (x) { return 'Одному тяжело. Дети зовут к себе.'; },
      options: [
        { label: 'Переехать к детям', hint: 'отношения ++', cond: function (x) { return hasKids(x.L); }, run: function (x) { x.stat('bond', 12); x.stat('happy', 8); x.add('Вы переехали к детям.', 'family'); } },
        { label: 'Остаться в своём доме', hint: 'своё · одиночество', run: function (x) { x.stat('happy', 3); x.stat('bond', -4); x.add('Вы остались в своём доме.', 'life'); } },
        {
          label: 'Пансионат', hint: 'уход · чужие стены',
          req: {
            money: function (x) { return x.need * 0.6; },
            custom: {
              test: function (x) { return x.c.gdp > 12000; },
              why: 'пансионатов в стране почти нет', done: 'пансионаты есть'
            }
          },
          cost: { money: function (x) { return x.need * 0.6; } },
          run: function (x) { x.money(-x.need * 0.6); x.stat('health', 6); x.stat('happy', -4); x.add('Вы переехали в пансионат.', 'life'); }
        }
      ]
    },
    {
      id: 'legacy', age: [60, 100], once: true,
      cond: function (x) { return x.L.money > x.need * 2; },
      title: 'Что оставить после себя',
      text: function (x) { return 'Накопленного хватит на что-то большее, чем вы сами.'; },
      options: [
        {
          label: 'Стипендия землякам', hint: 'след в мире',
          req: { money: function (x) { return x.need * 2; } },
          cost: { money: function (x) { return x.L.money * 0.5; } },
          run: function (x) { x.money(-x.L.money * 0.5); x.L.legacy = 'стипендия для школьников'; x.stat('happy', 14); x.add('Вы учредили стипендию для детей из своего района.', 'good'); }
        },
        { label: 'Всё детям', hint: 'семья +', cond: function (x) { return hasKids(x.L); }, run: function (x) { x.L.legacy = 'наследство детям'; x.stat('bond', 10); x.stat('happy', 6); x.add('Вы оставили всё детям.', 'family'); } },
        {
          label: 'Потратить на себя', hint: 'мечта',
          req: { money: function (x) { return x.need * 0.8; }, health: 30 },
          cost: { money: function (x) { return x.L.money * 0.6; } },
          run: function (x) { x.money(-x.L.money * 0.6); x.L.legacy = 'исполненная мечта'; x.stat('happy', 12); x.add('Вы наконец съездили туда, куда мечтали всю жизнь.', 'good'); }
        }
      ]
    }
  ];

  /* вопросы на паузах: 5, 15, 30, 50, 70 лет */
  var REFLECTIONS = [
    { age: 5, q: 'Этому ребёнку пять. Что вы помните о своих пяти годах?' },
    { age: 15, q: 'Пятнадцать. О чём вы мечтали в этом возрасте?' },
    { age: 30, q: 'Тридцать. Что в вашей жизни оказалось важнее, чем казалось тогда?' },
    { age: 50, q: 'Пятьдесят. Что бы вы сказали себе двадцатилетнему?' },
    { age: 70, q: 'Семьдесят. Что из прожитого вы бы повторили?' }
  ];

  window.IN8B = window.IN8B || {};
  window.IN8B.events = {
    auto: AUTO,
    choices: CHOICES,
    reflections: REFLECTIONS,
    warRisk: WAR_RISK,
    quake: QUAKE,
    cyclone: CYCLONE,
    drought: DROUGHT
  };
})();
