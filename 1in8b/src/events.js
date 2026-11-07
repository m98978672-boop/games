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
          label: 'В частную школу', hint: 'дорого · знания ++',
          w: function (x) { return x.L.famPct > 0.72 ? 2.5 : 0.4; },
          cond: function (x) { return x.L.famPct > 0.45 || x.c.gdp > 15000; },
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
        { label: 'Спорту', hint: 'здоровье ++', run: function (x) { x.stat('health', 12); x.stat('happy', 4); x.add('Вы почти жили в спортивной секции.', 'life'); } },
        { label: 'Подработке', hint: 'деньги +', run: function (x) { x.money(x.need * 0.3); x.stat('know', -3); x.add('После школы вы работали: семье нужны были деньги.', 'life'); } }
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
          run: function (x) { x.L.edu.inSchool = true; x.L.edu.track = 'general'; x.stat('know', 10); x.add('Вы остались в школе.', 'life'); }
        },
        {
          label: 'Колледж / ПТУ', hint: 'профессия раньше',
          w: function (x) { return 3; },
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
          label: 'Да, учиться дальше', hint: 'знания +++ · расходы',
          w: function (x) { return 6 * (0.5 + x.L.famPct); },
          cond: function (x) { return x.L.stats.know > 42 || x.L.famPct > 0.6; },
          run: function (x) {
            x.L.edu.inSchool = true; x.L.edu.track = 'uni';
            x.money(-x.need * 0.6); x.stat('know', 16);
            x.add('Вы поступили в университет.', 'life');
          }
        },
        {
          label: 'Учиться и работать', hint: 'тяжело, но без долгов',
          w: function (x) { return 4; },
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
          run: function (x) {
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
          run: function (x) {
            x.money(-x.need * 0.8); x.L.abroad = true; x.L.moves++;
            x.stat('bond', -12); x.stat('happy', -3);
            x.add('Вы уехали работать за границу.', 'life');
          }
        },
        {
          label: 'Отправить брата, помочь деньгами', hint: 'связи +',
          run: function (x) { x.money(-x.need * 0.3); x.stat('bond', 8); x.add('Уехал не вы: вы помогли деньгами тому, кто решился.', 'family'); }
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
          run: function (x) { x.L.hire('hard'); x.stat('health', -5); }
        },
        {
          label: 'То, что нравится', hint: 'счастье + · доход −',
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
          label: 'Платно и сразу', hint: '−деньги · здоровье ++',
          run: function (x) { x.money(-x.need * 0.5); x.stat('health', 12); x.add('Вы заплатили за лечение и выздоровели.', 'health'); }
        },
        {
          label: 'По очереди', hint: 'бесплатно · долго',
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
          run: function (x) {
            x.money(x.need * 1.5); x.flag('debt', true); x.L.business = true;
            x.add('Вы открыли своё дело и взяли кредит.', 'work');
          }
        },
        {
          label: 'Начать на свои, медленно', hint: 'без долгов',
          cond: function (x) { return x.L.money > x.need * 0.4; },
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
          cond: function (x) { return x.c.gdp > 6000; },
          run: function (x) {
            x.flag('mortgage', true); x.L.home = true; x.money(-Math.min(x.L.money * 0.6, x.need));
            x.add('Вы взяли ипотеку. Своё жильё — и платёж на двадцать лет.', 'money'); x.stat('happy', 6);
          }
        },
        {
          label: 'Строить самим, по частям', hint: 'долго · без долгов',
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
          run: function (x) { x.stat('bond', 14); x.stat('happy', 3); x.L.careerBrake = true; x.add('Вы вернулись домой, чтобы ухаживать за родителями.', 'family'); }
        },
        {
          label: 'Нанять сиделку', hint: '−деньги',
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
          label: 'Вложиться в учёбу детей', hint: '−деньги · дети +',
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
        { label: 'Сменить профессию', hint: 'риск · новая жизнь', run: function (x) { x.L.changeJob(); x.stat('happy', 8); x.add('Вы начали всё заново в другой профессии.', 'work'); } },
        { label: 'Взять паузу и отдохнуть', hint: 'здоровье + · доход −', run: function (x) { x.money(-x.need * 0.3); x.stat('health', 8); x.stat('happy', 6); x.add('Вы взяли год на себя.', 'life'); } },
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
          label: 'Попробовать сохранить', hint: 'шанс',
          run: function (x) {
            if (x.rnd() < 0.5 + x.L.stats.bond / 200) { x.stat('bond', 10); x.stat('happy', 6); x.add('Вы прошли через кризис и остались вместе.', 'family'); }
            else { x.L.divorce(); x.add('Сохранить не получилось.', 'bad'); }
          }
        },
        {
          label: 'Развестись', hint: 'свобода · потери',
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
          label: 'Обратиться за помощью', hint: 'трудно · шанс',
          run: function (x) { x.money(-x.need * 0.3); x.stat('health', 6); x.stat('happy', 8); x.add('Вы обратились за помощью и справились.', 'good'); x.help(); }
        },
        {
          label: 'Справляться самому', hint: 'риск',
          run: function (x) {
            if (x.rnd() < 0.4) { x.stat('happy', 4); x.add('Вы справились сами.', 'good'); }
            else { x.flag('addiction', true); x.stat('health', -12); x.stat('bond', -8); x.add('Справиться в одиночку не вышло.', 'bad'); }
            x.help();
          }
        }
      ]
    },
    {
      id: 'retire', age: [55, 72], once: true, priority: true,
      cond: function (x) { return working(x.L); },
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
        { label: 'Пансионат', hint: 'уход · чужие стены', cond: function (x) { return x.c.gdp > 20000; }, run: function (x) { x.money(-x.need * 0.6); x.stat('health', 6); x.stat('happy', -4); x.add('Вы переехали в пансионат.', 'life'); } }
      ]
    },
    {
      id: 'legacy', age: [60, 100], once: true,
      cond: function (x) { return x.L.money > x.need * 2; },
      title: 'Что оставить после себя',
      text: function (x) { return 'Накопленного хватит на что-то большее, чем вы сами.'; },
      options: [
        { label: 'Стипендия землякам', hint: 'след в мире', run: function (x) { x.money(-x.L.money * 0.5); x.L.legacy = 'стипендия для школьников'; x.stat('happy', 14); x.add('Вы учредили стипендию для детей из своего района.', 'good'); } },
        { label: 'Всё детям', hint: 'семья +', cond: function (x) { return hasKids(x.L); }, run: function (x) { x.L.legacy = 'наследство детям'; x.stat('bond', 10); x.stat('happy', 6); x.add('Вы оставили всё детям.', 'family'); } },
        { label: 'Потратить на себя', hint: 'мечта', run: function (x) { x.money(-x.L.money * 0.6); x.L.legacy = 'исполненная мечта'; x.stat('happy', 12); x.add('Вы наконец съездили туда, куда мечтали всю жизнь.', 'good'); } }
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
