/* ============================================================
   1 ИЗ 8 МИЛЛИАРДОВ — слой работы.
   ------------------------------------------------------------
   Сто событий рабочей жизни и восемнадцать карточек решений
   (сто вариантов ответа). У работы свой жребий года — отдельно
   от болезней, войн и денег, — поэтому этот слой ничего не
   вытесняет из остальной жизни.

   Что умеет этот слой: договор и работа в конверте, начальник,
   репутация, разряды и курсы, график и переработки, вахта,
   дорога на работу, охрана труда и травмы, профсоюз и
   забастовки, сокращения и поиск, подработка, удалёнка,
   выгорание, смена профессии, отношение к своему делу.

   Каждое событие: диапазон возраста, условие, вес и эффект.
   Карточки с work:true приходят в рабочем слоте решений.
   ============================================================ */
(function () {
  'use strict';

  var M = window.IN8B.model;
  var clamp = M.clamp;

  /* короткие помощники */
  function poor(c) { return c.gdp < 7000; }
  function rich(c) { return c.gdp > 28000; }
  function rural(L) { return !L.urban; }
  function dev(c) { return M.devLevel(c); }
  function J(x) { return x.L.job; }
  function jd(x) { return x.L.job ? M.jobById[x.L.job.id] : null; }
  function sec(x) { return jd(x).sector; }
  function inSec(x, list) { return list.indexOf(sec(x)) >= 0; }
  function hard(x) { return inSec(x, ['manual', 'agri', 'informal']); }
  function office(x) { return inSec(x, ['prof', 'elite', 'skilled']); }
  function title(x) { return M.jobTitle(jd(x), J(x).step); }
  function bump(x, k, d, lo, hi) {
    var w = J(x); if (!w) return;
    w[k] = clamp((w[k] || 0) + d, lo === undefined ? 0 : lo, hi === undefined ? 100 : hi);
  }
  /* прибавка к зарплате: событие двигает личный множитель, а не сам оклад */
  function pay(x, d) { var w = J(x); if (w) w.boost = clamp((w.boost || 1) + d, 0.5, 2.2); }

  /* ======================================================================
     СТО РАБОЧИХ СОБЫТИЙ
     ====================================================================== */
  var WORK_AUTO = [

    /* ------------------- первые дни и устройство (10) ------------------ */
    {
      id: 'w-first-day', age: [13, 70], once: true, w: 2.4,
      cond: function (x) { return J(x).years <= 1; },
      run: function (x) {
        x.add('Первый рабочий день: вас показали коллегам и забыли до обеда.', 'work');
        bump(x, 'rep', 2); x.stat('know', 1.5);
      }
    },
    {
      id: 'w-probation', age: [15, 64], w: 1.4,
      cond: function (x) { return J(x).years <= 2 && J(x).contract !== 'none'; },
      run: function (x) {
        if (x.rnd() < 0.78) {
          x.add('Испытательный срок пройден: вас оставили.', 'work');
          bump(x, 'rep', 4); x.stat('happy', 3);
        } else {
          x.add('Испытательный срок не пройден: сказали, что вы не подошли.', 'bad');
          x.L.career.fired++; x.L.job = null; x.L.unemployedYears = 0; x.stat('happy', -6);
        }
      }
    },
    {
      id: 'w-no-papers', age: [14, 64], w: function (x) { return J(x).contract === 'none' ? 2 : 0; },
      run: function (x) {
        x.add('Договора у вас так и нет: «все так работают».', 'work');
        x.flag('grey', true); x.stat('happy', -2);
      }
    },
    {
      id: 'w-first-pay', age: [13, 70], once: true, w: 2.2,
      cond: function (x) { return J(x).years <= 2; },
      run: function (x) {
        x.add('Первая зарплата. Половину отдали домой, на остаток купили что-то ненужное и счастливое.', 'work');
        x.stat('happy', 5); x.stat('bond', 2); x.money(-x.need * 0.03);
      }
    },
    {
      id: 'w-tools', age: [14, 66], w: function (x) { return hard(x) ? 1.3 : 0.3; },
      run: function (x) {
        var cost = x.need * 0.05;
        x.add('Инструмент пришлось купить свой: казённый разобрали до вас.', 'work');
        x.money(-cost); bump(x, 'rep', 2);
      }
    },
    {
      id: 'w-uniform', age: [14, 66], w: function (x) { return inSec(x, ['service', 'skilled']) ? 1.1 : 0.2; },
      run: function (x) {
        x.add('Выдали форму. В ней вы перестали быть собой и стали «персоналом».', 'work');
        x.stat('happy', -1); bump(x, 'mood', -2);
      }
    },
    {
      id: 'w-far-job', age: [16, 64], w: function (x) { return J(x).commute > 1.6 ? 1.6 : 0.2; },
      run: function (x) {
        x.add('Дорога съедает по ' + (Math.round(J(x).commute * 10) / 10) + ' часа в день. Это как ещё одна работа без оплаты.', 'work');
        x.stat('happy', -2); x.stat('health', -1);
      }
    },
    {
      id: 'w-near-job', age: [16, 64], w: function (x) { return J(x).commute < 0.5 ? 1.2 : 0.1; },
      run: function (x) {
        x.add('Работа в пяти минутах от дома. Это дороже прибавки.', 'work');
        x.stat('happy', 3); bump(x, 'mood', 4);
      }
    },
    {
      id: 'w-recommend', age: [16, 64], w: 1,
      cond: function (x) { return J(x).years <= 3; },
      run: function (x) {
        x.add('На это место вас привёл знакомый. Теперь неудобно работать плохо.', 'work');
        bump(x, 'rep', 5); bump(x, 'boss', 1, -3, 3);
      }
    },
    {
      id: 'w-queue-job', age: [16, 64], needJob: false, w: function (x) { return x.L.job ? 0 : 1.6; },
      run: function (x) {
        x.add('Очередь на бирже труда: тридцать человек на одно место, и все вежливы друг с другом.', 'work');
        x.stat('happy', -2); x.stat('know', 0.5);
      }
    },

    /* ----------------------- начальник и люди (14) --------------------- */
    {
      id: 'w-boss-new', age: [16, 66], w: 1.5,
      cond: function (x) { return J(x).years >= 2; },
      run: function (x) {
        var good = x.rnd() < 0.5;
        J(x).boss = clamp(good ? 1 : -1, -3, 3);
        x.add(good ? 'Сменился начальник: новый хотя бы здоровается и объясняет задачи.'
          : 'Сменился начальник: новый начал с того, что всех построил.', good ? 'work' : 'bad');
        bump(x, 'mood', good ? 6 : -7);
      }
    },
    {
      id: 'w-boss-praise', age: [16, 70], w: function (x) { return J(x).rep > 55 ? 1.6 : 0.5; },
      run: function (x) {
        x.add('Начальник похвалил при всех. Мелочь, а весь день другой.', 'work');
        bump(x, 'boss', 1, -3, 3); bump(x, 'mood', 5); x.stat('happy', 3);
      }
    },
    {
      id: 'w-boss-blame', age: [16, 70], w: function (x) { return J(x).boss < 0 ? 1.8 : 0.7; },
      run: function (x) {
        x.add('Разнос при всей смене за чужую ошибку. Спорить было нельзя.', 'bad');
        bump(x, 'boss', -1, -3, 3); bump(x, 'mood', -6); x.stat('happy', -3);
      }
    },
    {
      id: 'w-boss-favour', age: [18, 66], w: function (x) { return J(x).boss > 1 ? 1.4 : 0.2; },
      run: function (x) {
        x.add('Начальник выделяет вас. Коллеги это заметили, и не все обрадовались.', 'work');
        bump(x, 'rep', 4); x.stat('bond', -1);
      }
    },
    {
      id: 'w-colleague-friend', age: [15, 70], w: 1.5,
      run: function (x) {
        x.add('На работе появился человек, с которым можно молчать в обед. Это и есть коллектив.', 'work');
        x.stat('bond', 4); x.stat('happy', 3); bump(x, 'mood', 4);
      }
    },
    {
      id: 'w-colleague-leave', age: [16, 70], w: 1.2,
      run: function (x) {
        x.add('Ушёл человек, с которым работалось легче всего. Осталось его место и его обязанности.', 'work');
        x.stat('happy', -3); bump(x, 'mood', -4);
      }
    },
    {
      id: 'w-mobbing', age: [16, 66], w: function (x) { return J(x).rep < 40 ? 1.4 : 0.4; }, heavy: true,
      run: function (x) {
        x.add('В коллективе вас выбрали мишенью для шуток. Каждое утро приходится собираться с духом.', 'bad');
        x.stat('happy', -7); bump(x, 'mood', -12); bump(x, 'burnout', 10);
      }
    },
    {
      id: 'w-defended', age: [16, 66], w: 0.8,
      cond: function (x) { return J(x).mood < 45; },
      run: function (x) {
        x.add('Коллеги вступились за вас перед начальством. Неожиданно и очень вовремя.', 'good');
        bump(x, 'mood', 8); x.stat('bond', 3); x.stat('happy', 4);
      }
    },
    {
      id: 'w-newbie', age: [22, 70], w: function (x) { return J(x).years > 5 ? 1.3 : 0.1; },
      run: function (x) {
        x.add('К вам приставили новичка. Объясняя простое, вы сами поняли его лучше.', 'work');
        bump(x, 'rep', 3); x.stat('know', 2); x.stat('happy', 2);
      }
    },
    {
      id: 'w-shift-swap', age: [16, 64], w: function (x) { return J(x).schedule !== 'day' ? 1.3 : 0.2; },
      run: function (x) {
        x.add('Подменили коллегу в его смену — он обещал отдать тем же.', 'work');
        x.stat('health', -1); x.stat('bond', 2); bump(x, 'rep', 2);
      }
    },
    {
      id: 'w-corporate', age: [18, 64], w: function (x) { return office(x) && !poor(x.c) ? 1.2 : 0.2; },
      run: function (x) {
        x.add('Корпоратив: неловкие тосты, чужая музыка и разговоры, которые потом вспоминать стыдно.', 'work');
        x.stat('bond', 2); x.stat('happy', 1); x.stat('health', -0.5);
      }
    },
    {
      id: 'w-gossip', age: [16, 70], w: 1,
      run: function (x) {
        x.add('По конторе пошёл слух о сокращениях. Работать стали тише и хуже.', 'work');
        bump(x, 'mood', -4); bump(x, 'burnout', 5);
      }
    },
    {
      id: 'w-boss-gone', age: [18, 70], w: function (x) { return J(x).boss < -1 ? 1.6 : 0.3; },
      run: function (x) {
        x.add('Начальник, который вас не выносил, ушёл сам. В конторе заметно посветлело.', 'good');
        J(x).boss = 0; bump(x, 'mood', 9); x.stat('happy', 4);
      }
    },
    {
      id: 'w-team-win', age: [18, 70], w: function (x) { return J(x).mood > 60 ? 1.3 : 0.4; },
      run: function (x) {
        x.add('Сделали вместе большое дело и успели в срок. Такие недели помнятся годами.', 'good');
        bump(x, 'rep', 5); bump(x, 'mood', 6); x.stat('happy', 4); x.stat('bond', 2);
      }
    },

    /* --------------------- деньги и оформление (16) -------------------- */
    {
      id: 'w-raise-small', age: [17, 66], w: 1.6,
      cond: function (x) { return J(x).years >= 2; },
      run: function (x) {
        pay(x, 0.05);
        x.add('Прибавка к зарплате — небольшая, но её не пришлось выпрашивать.', 'work');
        x.stat('happy', 2);
      }
    },
    {
      id: 'w-raise-asked', age: [20, 64], w: function (x) { return J(x).rep > 60 ? 1.4 : 0.5; },
      run: function (x) {
        if (x.rnd() < clamp(0.3 + J(x).rep / 200 + J(x).boss * 0.07, 0.1, 0.8)) {
          pay(x, 0.1); x.add('Вы попросили прибавку — и вам её дали.', 'good'); x.stat('happy', 4);
        } else {
          x.add('Вы попросили прибавку. Ответили: «сейчас тяжёлое время».', 'work');
          bump(x, 'mood', -5);
        }
      }
    },
    {
      id: 'w-pay-delay', age: [16, 66], w: function (x) {
        return (poor(x.c) || x.L.year < 2000 ? 1.6 : 0.5) * (J(x).contract === 'official' ? 0.7 : 1.4);
      },
      run: function (x) {
        J(x).payDelay = 1 + (x.rnd() < 0.3 ? 1 : 0);
        x.add('Зарплату задержали. Говорят, что заказчик не перевёл деньги.', 'bad');
        x.stat('happy', -4); bump(x, 'mood', -6);
      }
    },
    {
      id: 'w-pay-envelope', age: [18, 64], w: function (x) { return J(x).contract === 'official' ? 0.9 : 0.2; },
      run: function (x) {
        x.add('Предложили часть зарплаты в конверте: на руки больше, в отчётах меньше.', 'work');
        J(x).contract = 'grey'; x.flag('grey', true); pay(x, 0.07);
      }
    },
    {
      id: 'w-white-contract', age: [18, 64], w: function (x) { return J(x).contract !== 'official' ? 0.9 : 0; },
      run: function (x) {
        x.add('Предприятие проверили, и вас наконец оформили по-настоящему.', 'good');
        J(x).contract = 'official'; x.flag('grey', false); pay(x, -0.05); x.stat('happy', 2);
      }
    },
    {
      id: 'w-bonus-year', age: [18, 66], w: function (x) { return rich(x.c) || office(x) ? 1.3 : 0.5; },
      run: function (x) {
        var g = x.need * (0.1 + x.rnd() * 0.25);
        x.add('Годовая премия. Её уже успели потратить мысленно несколько раз.', 'good');
        x.money(g); x.stat('happy', 3);
      }
    },
    {
      id: 'w-bonus-cut', age: [18, 66], w: 1,
      run: function (x) {
        x.add('Премию в этом году отменили всем. Объяснили одним словом: «обстоятельства».', 'bad');
        x.money(-x.need * 0.05); bump(x, 'mood', -5);
      }
    },
    {
      id: 'w-fine', age: [16, 66], w: function (x) { return J(x).contract === 'official' ? 0.5 : 1.3; },
      run: function (x) {
        var f = x.need * 0.06;
        x.add('Штраф от работодателя: опоздание, брак или просто плохое настроение начальства.', 'bad');
        x.money(-f); bump(x, 'mood', -4);
      }
    },
    {
      id: 'w-tips', age: [15, 66], w: function (x) { return inSec(x, ['service', 'informal']) ? 1.6 : 0; },
      run: function (x) {
        x.add('Хорошие чаевые за месяц: они не в ведомости, но они и есть заработок.', 'work');
        x.money(x.need * 0.07);
      }
    },
    {
      id: 'w-wage-freeze', age: [18, 66], w: function (x) { return 1.1; },
      run: function (x) {
        pay(x, -0.03);
        x.add('Зарплату заморозили на год, а цены — нет.', 'bad');
        bump(x, 'mood', -5);
      }
    },
    {
      id: 'w-piece-rate', age: [16, 64], w: function (x) { return hard(x) ? 1.3 : 0.2; },
      run: function (x) {
        x.add('Перевели на сдельную оплату: сколько сделал — столько и получил.', 'work');
        pay(x, x.rnd() < 0.55 ? 0.08 : -0.06); bump(x, 'burnout', 6);
      }
    },
    {
      id: 'w-debt-to-boss', age: [16, 64], w: function (x) { return poor(x.c) ? 1.2 : 0.4; },
      run: function (x) {
        x.add('Взяли аванс у работодателя. Теперь уйти с этого места сложнее.', 'work');
        x.money(x.need * 0.12); bump(x, 'mood', -3); x.L.careerBrake = true;
      }
    },
    {
      id: 'w-no-pay-at-all', age: [16, 64], w: function (x) { return J(x).contract === 'none' ? 1.4 : 0.1; }, heavy: true,
      run: function (x) {
        x.add('Работодатель просто не заплатил за два месяца и перестал брать трубку. Доказать нечем.', 'bad');
        x.money(-x.need * 0.2); x.stat('happy', -6); x.L.job = null; x.L.unemployedYears = 0; x.L.career.fired++;
      }
    },
    {
      id: 'w-tax-return', age: [20, 70], w: function (x) { return rich(x.c) && J(x).contract === 'official' ? 1.2 : 0.2; },
      run: function (x) {
        x.add('Вернули часть налога за лечение и учёбу. Бумаги собирали дольше, чем ждали денег.', 'good');
        x.money(x.need * 0.08);
      }
    },
    {
      id: 'w-pension-points', age: [30, 64], w: function (x) { return J(x).contract !== 'official' ? 1.2 : 0.4; },
      run: function (x) {
        x.add(J(x).contract === 'official'
          ? 'В справке видно: стаж идёт, отчисления капают.'
          : 'В справке пусто: годы работы в конверте в стаж не попали.', 'work');
        if (J(x).contract !== 'official') { x.flag('grey', true); x.stat('happy', -2); }
      }
    },
    {
      id: 'w-second-job', age: [18, 64], w: function (x) { return x.L.money < x.need * 0.4 ? 1.5 : 0.5; },
      run: function (x) {
        x.add('Взяли вторую работу по вечерам. Деньги появились, вечера исчезли.', 'work');
        x.money(x.need * 0.14); x.stat('health', -1.5); x.stat('bond', -2); bump(x, 'burnout', 8);
        x.L.career.sideline++;
      }
    },

    /* ------------------- график, переработки, вахта (14) --------------- */
    {
      id: 'w-overtime-start', age: [16, 64], w: function (x) { return J(x).overtime < 2 ? 1.5 : 0.2; },
      run: function (x) {
        bump(x, 'overtime', 1, 0, 3);
        x.add('Переработки стали обычным делом: уходить вовремя теперь неприлично.', 'work');
        x.stat('happy', -2);
      }
    },
    {
      id: 'w-overtime-stop', age: [16, 66], w: function (x) { return J(x).overtime > 0 ? 1.2 : 0; },
      run: function (x) {
        bump(x, 'overtime', -1, 0, 3);
        x.add('Переработки прекратились: нашли ещё людей. Вечер вернулся.', 'good');
        x.stat('happy', 3); bump(x, 'burnout', -8);
      }
    },
    {
      id: 'w-night-shift', age: [16, 64], w: function (x) { return J(x).schedule === 'day' && hard(x) ? 1.1 : 0.2; },
      run: function (x) {
        J(x).schedule = 'night';
        x.add('Перевели в ночную смену: платят больше, спишь хуже.', 'work');
        x.stat('health', -2);
      }
    },
    {
      id: 'w-day-shift', age: [16, 66], w: function (x) { return J(x).schedule === 'night' ? 1.3 : 0; },
      run: function (x) {
        J(x).schedule = 'day';
        x.add('Вернули в дневную смену. Первые недели вы просто отсыпались.', 'good');
        x.stat('health', 2); x.stat('happy', 3);
      }
    },
    {
      id: 'w-rotation-start', age: [18, 60], w: function (x) { return hard(x) && J(x).schedule !== 'rotation' ? 0.9 : 0; },
      run: function (x) {
        J(x).schedule = 'rotation';
        x.add('Уехали на вахту: месяц работы, месяц дома. Деньги хорошие, дом далеко.', 'work');
        x.stat('bond', -4);
      }
    },
    {
      id: 'w-rotation-tired', age: [20, 62], w: function (x) { return J(x).schedule === 'rotation' ? 1.6 : 0; },
      run: function (x) {
        x.add('На вахте перестали считать дни. Дома вас встречают как гостя.', 'bad');
        x.stat('bond', -4); x.stat('happy', -3); bump(x, 'burnout', 10);
      }
    },
    {
      id: 'w-rotation-end', age: [22, 64], w: function (x) { return J(x).schedule === 'rotation' ? 1 : 0; },
      run: function (x) {
        J(x).schedule = 'day';
        x.add('С вахты вы вернулись насовсем: заработали на то, ради чего уезжали.', 'good');
        x.stat('bond', 5); x.stat('happy', 4);
      }
    },
    {
      id: 'w-weekend-work', age: [16, 66], w: 1.2,
      run: function (x) {
        x.add('Вышли в выходные: «надо закрыть квартал». Отгул, конечно, забыли дать.', 'work');
        x.stat('happy', -2); x.stat('bond', -1); bump(x, 'burnout', 4);
      }
    },
    {
      id: 'w-vacation', age: [17, 66], w: function (x) { return J(x).contract === 'official' ? 1.6 : 0.4; },
      run: function (x) {
        x.add('Настоящий отпуск: две недели без звонков с работы.', 'good');
        x.stat('happy', 6); x.stat('health', 2); bump(x, 'burnout', -16);
      }
    },
    {
      id: 'w-no-vacation', age: [17, 66], w: function (x) { return J(x).contract !== 'official' ? 1.4 : 0.3; },
      run: function (x) {
        x.add('Отпуска нет третий год: уйдёшь — вернёшься к чужому месту.', 'bad');
        bump(x, 'burnout', 12); x.stat('happy', -3);
      }
    },
    {
      id: 'w-sick-leave', age: [16, 70], w: function (x) { return J(x).contract === 'official' ? 1.2 : 0.3; },
      run: function (x) {
        x.add('Болели неделю на больничном — и деньги почти не потеряли.', 'work');
        x.stat('health', 1);
      }
    },
    {
      id: 'w-sick-work', age: [16, 70], w: function (x) { return J(x).contract !== 'official' ? 1.5 : 0.4; },
      run: function (x) {
        x.add('Болели — и всё равно вышли: день дома стоит дневного заработка.', 'bad');
        x.stat('health', -3); bump(x, 'burnout', 5);
      }
    },
    {
      id: 'w-remote-start', age: [20, 64], w: function (x) { return x.L.year >= 2005 && office(x) && !J(x).remote ? 1.2 : 0; },
      run: function (x) {
        J(x).remote = true; J(x).commute = 0;
        x.add('Работу перевели на удалённую: дорога исчезла, рабочий день растянулся.', 'work');
        x.stat('happy', 3); bump(x, 'burnout', 3);
      }
    },
    {
      id: 'w-remote-end', age: [20, 64], w: function (x) { return J(x).remote ? 0.9 : 0; },
      run: function (x) {
        J(x).remote = false; J(x).commute = clamp(0.6 + x.rnd() * 1.6, 0, 3);
        x.add('Всех вернули в контору: «работать надо вместе».', 'bad');
        x.stat('happy', -3);
      }
    },

    /* ------------------ охрана труда и здоровье (12) ------------------- */
    {
      id: 'w-safety-check', age: [16, 66], w: function (x) { return hard(x) ? 1.3 : 0.4; },
      run: function (x) {
        bump(x, 'safety', 0.12, 0, 1);
        x.add('Пришла проверка по технике безопасности: появились каски, перчатки и журнал инструктажа.', 'good');
      }
    },
    {
      id: 'w-safety-cut', age: [16, 66], w: function (x) { return hard(x) && J(x).safety > 0.3 ? 1.1 : 0.2; },
      run: function (x) {
        bump(x, 'safety', -0.15, 0, 1);
        x.add('На безопасности стали экономить: средства защиты «закончились на складе».', 'bad');
      }
    },
    {
      id: 'w-dust', age: [20, 66], w: function (x) { return hard(x) && jd(x).risk > 1.2 ? 1.3 : 0.1; },
      run: function (x) {
        x.add('Пыль, шум и химия делают своё дело незаметно, год за годом.', 'bad');
        x.stat('health', -2.5);
        if (x.rnd() < 0.15) x.flag('chronic', true);
      }
    },
    {
      id: 'w-back', age: [25, 70], w: function (x) { return hard(x) ? 1.4 : 0.3; },
      run: function (x) {
        x.add('Спина. Сначала к вечеру, потом с утра, потом всегда.', 'bad');
        x.stat('health', -3);
      }
    },
    {
      id: 'w-eyes', age: [25, 70], w: function (x) { return office(x) ? 1.2 : 0.2; },
      run: function (x) {
        x.add('Зрение село от бумаг и экрана. Очки стали частью лица.', 'work');
        x.stat('health', -1); x.money(-x.need * 0.03);
      }
    },
    {
      id: 'w-stress-health', age: [25, 66], w: function (x) { return J(x).burnout > 55 ? 1.8 : 0.2; },
      run: function (x) {
        x.add('Давление, бессонница, кофе вместо обеда. Врач сказал: это от работы.', 'bad');
        x.stat('health', -4); bump(x, 'burnout', 6);
      }
    },
    {
      id: 'w-medcheck', age: [18, 66], w: function (x) { return J(x).contract === 'official' ? 1.2 : 0.2; },
      run: function (x) {
        x.add('Обязательный медосмотр нашёл то, на что вы махнули рукой. Лечиться начали вовремя.', 'good');
        x.stat('health', 3); x.flag('untreated', false);
      }
    },
    {
      id: 'w-injury-colleague', age: [16, 66], w: function (x) { return hard(x) ? 1.2 : 0.2; },
      run: function (x) {
        x.add('На участке покалечился человек. Его увезли, смену не остановили.', 'bad');
        x.stat('happy', -4); bump(x, 'mood', -5);
      }
    },
    {
      id: 'w-heat', age: [16, 66], w: function (x) { return inSec(x, ['agri', 'manual']) && x.c.region !== 'Европа' ? 1.2 : 0.3; },
      run: function (x) {
        x.add('Жара под сорок, а работа на улице. Воду носят с собой.', 'bad');
        x.stat('health', -2);
      }
    },
    {
      id: 'w-cold-work', age: [16, 66], w: function (x) { return hard(x) && (x.c.region === 'Европа' || x.c.code === 'ru') ? 1.1 : 0.2; },
      run: function (x) {
        x.add('Зимой работали на морозе: руки отходили только в бытовке.', 'bad');
        x.stat('health', -2);
      }
    },
    {
      id: 'w-rehab', age: [25, 70], w: function (x) { return x.L.career.injuries > 0 ? 1.3 : 0; },
      run: function (x) {
        x.add('Путёвка от предприятия: две недели процедур и тишины.', 'good');
        x.stat('health', 4); x.stat('happy', 3);
      }
    },
    {
      id: 'w-disability', age: [30, 64], w: function (x) { return x.L.career.injuries > 1 && jd(x).risk > 1.3 ? 0.7 : 0; }, heavy: true,
      run: function (x) {
        x.add('После давней травмы оформили ограничение по здоровью: тяжёлое больше нельзя.', 'bad');
        x.stat('health', -6); x.flag('chronic', true);
        if (hard(x)) { x.L.job = null; x.L.unemployedYears = 0; x.add('С прежней работы пришлось уйти.', 'bad'); }
      }
    },

    /* ------------------- учёба, разряды, мастерство (12) --------------- */
    {
      id: 'w-course-free', age: [17, 64], w: 1.4,
      run: function (x) {
        bump(x, 'certs', 1, 0, 6); x.L.career.courses++;
        x.add('Предприятие оплатило курсы. Корочка пригодилась сразу.', 'good');
        x.stat('know', 4);
      }
    },
    {
      id: 'w-grade-up', age: [18, 64], w: function (x) { return inSec(x, ['manual', 'skilled']) ? 1.5 : 0.3; },
      run: function (x) {
        bump(x, 'certs', 1, 0, 6);
        x.add('Сдали на разряд выше. В бригаде это уважают больше, чем диплом.', 'good');
        bump(x, 'rep', 6); x.stat('happy', 3);
      }
    },
    {
      id: 'w-licence', age: [18, 64], w: function (x) { return inSec(x, ['service', 'skilled']) ? 1.2 : 0.3; },
      run: function (x) {
        x.add('Получили допуск, без которого к работе больше не пускают.', 'work');
        x.money(-x.need * 0.06); bump(x, 'certs', 1, 0, 6);
      }
    },
    {
      id: 'w-mentor-own', age: [20, 60], w: function (x) { return J(x).years > 3 ? 1.2 : 0.2; },
      run: function (x) {
        x.add('У вас появился наставник — человек, который показывает, как делать правильно.', 'good');
        x.stat('know', 5); bump(x, 'rep', 4); bump(x, 'mood', 4);
      }
    },
    {
      id: 'w-conference', age: [22, 64], w: function (x) { return office(x) && !poor(x.c) ? 1.1 : 0.1; },
      run: function (x) {
        x.add('Съездили на отраслевую конференцию: половина скучная, половина перевернула взгляд на дело.', 'work');
        x.stat('know', 4); bump(x, 'rep', 3);
      }
    },
    {
      id: 'w-language', age: [18, 60], w: function (x) { return office(x) ? 1.1 : 0.4; },
      run: function (x) {
        x.add('Подтянули иностранный язык ради работы. Мир стал чуть шире.', 'work');
        x.stat('know', 5);
      }
    },
    {
      id: 'w-computer', age: [18, 64], w: function (x) { return x.L.year >= 1990 && x.L.year <= 2015 ? 1.4 : 0.2; },
      run: function (x) {
        x.add('Освоили компьютер на работе: сначала боялись нажать не ту кнопку, потом учили других.', 'good');
        x.stat('know', 5); bump(x, 'rep', 4);
      }
    },
    {
      id: 'w-no-course', age: [18, 64], w: function (x) { return poor(x.c) ? 1.2 : 0.5; },
      run: function (x) {
        x.add('На курсы не отпустили: «работать некому». Повышение ушло другому.', 'bad');
        bump(x, 'mood', -5); x.stat('happy', -2);
      }
    },
    {
      id: 'w-skill-peak', age: [30, 66], w: function (x) { return J(x).years > 10 ? 1.3 : 0; },
      run: function (x) {
        x.add('Работу вы теперь делаете руками, не думая: за годы она стала частью тела.', 'work');
        bump(x, 'rep', 6); bump(x, 'mood', 4); x.stat('happy', 2);
      }
    },
    {
      id: 'w-mistake', age: [16, 66], w: 1.2,
      run: function (x) {
        var big = x.rnd() < 0.3;
        x.add(big ? 'Крупная ошибка: испорчена партия, убыток повесили на всех.'
          : 'Ошиблись в расчётах, но заметили вовремя. Обошлось выговором.', big ? 'bad' : 'work');
        bump(x, 'rep', big ? -8 : -3); if (big) { x.money(-x.need * 0.08); bump(x, 'boss', -1, -3, 3); }
      }
    },
    {
      id: 'w-invention', age: [20, 64], w: function (x) { return x.L.stats.know > 60 ? 1.1 : 0.3; },
      run: function (x) {
        x.add('Вы придумали, как делать то же самое вдвое быстрее. Предложение приняли.', 'good');
        bump(x, 'rep', 8); pay(x, 0.04); x.stat('happy', 4);
      }
    },
    {
      id: 'w-idea-stolen', age: [20, 64], w: function (x) { return J(x).boss < 1 ? 1 : 0.3; },
      run: function (x) {
        x.add('Вашу идею доложили наверх под чужим именем. Спорить не стали.', 'bad');
        bump(x, 'mood', -8); x.stat('happy', -3);
      }
    },

    /* ---------------- права, профсоюз, конфликты (8) ------------------- */
    {
      id: 'w-union-join', age: [18, 64], w: function (x) { return !J(x).union && dev(x.c) > 0.3 ? 1.1 : 0.3; },
      run: function (x) {
        J(x).union = true;
        x.add('Вступили в профсоюз. Взносы небольшие, спокойствия заметно больше.', 'work');
        x.money(-x.need * 0.01); bump(x, 'mood', 3);
      }
    },
    {
      id: 'w-union-win', age: [18, 64], w: function (x) { return J(x).union ? 1.4 : 0; },
      run: function (x) {
        pay(x, 0.06);
        x.add('Профсоюз добился прибавки и нормального графика для всей смены.', 'good');
        x.stat('happy', 3); bump(x, 'mood', 5);
      }
    },
    {
      id: 'w-strike', age: [18, 64], w: function (x) { return (J(x).union ? 1.4 : 0.4) * (J(x).payDelay ? 2 : 1); },
      run: function (x) {
        x.L.career.strikes++;
        if (x.rnd() < clamp(0.35 + (J(x).union ? 0.25 : 0) + dev(x.c) * 0.2, 0.1, 0.85)) {
          pay(x, 0.07); x.add('Забастовка. Три дня без зарплаты — и долги по выплатам закрыли.', 'good');
          x.money(-x.need * 0.03); bump(x, 'mood', 6);
        } else {
          x.add('Забастовка ничего не дала: зачинщиков уволили, остальных припугнули.', 'bad');
          bump(x, 'boss', -1, -3, 3); bump(x, 'mood', -7); x.money(-x.need * 0.04);
        }
      }
    },
    {
      id: 'w-labour-court', age: [20, 64], w: function (x) { return J(x).contract === 'official' && J(x).boss < -1 ? 0.9 : 0.2; },
      run: function (x) {
        if (x.rnd() < clamp(0.3 + dev(x.c) * 0.4, 0.15, 0.75)) {
          x.add('Трудовая инспекция встала на вашу сторону: работодателя оштрафовали, долг выплатили.', 'good');
          x.money(x.need * 0.15);
        } else {
          x.add('В трудовом споре вы остались ни с чем: бумаг не хватило.', 'bad');
          x.stat('happy', -4);
        }
      }
    },
    {
      id: 'w-harass', age: [17, 60], w: function (x) { return x.L.sex === 'f' ? 1.1 : 0.25; }, heavy: true,
      run: function (x) {
        x.add('Начальник переходит границы и делает вид, что это шутки. Жаловаться некому.', 'bad');
        x.stat('happy', -8); bump(x, 'mood', -14); bump(x, 'burnout', 10); x.help();
      }
    },
    {
      id: 'w-discrimination', age: [18, 64], w: function (x) { return (x.L.sex === 'f' ? 1.1 : 0.5) * (1.3 - dev(x.c)); },
      run: function (x) {
        x.add('Место отдали другому: «ему семью кормить». Вам объяснили это как очевидное.', 'bad');
        bump(x, 'mood', -8); x.stat('happy', -4);
      }
    },
    {
      id: 'w-bribe-ask', age: [20, 64], w: function (x) { return (1.4 - dev(x.c)) * (M.PUBLIC_JOBS[J(x).id] ? 1.6 : 0.7); },
      run: function (x) {
        x.add('За нужную подпись с вас попросили «благодарность». Отказаться было нельзя.', 'bad');
        x.money(-x.need * 0.07); bump(x, 'mood', -4);
      }
    },
    {
      id: 'w-blacklist', age: [20, 64], w: function (x) { return x.L.career.strikes > 0 || x.L.career.fired > 1 ? 0.9 : 0.1; },
      run: function (x) {
        x.add('По отрасли о вас пошла дурная слава: «неудобный работник».', 'bad');
        bump(x, 'rep', -10); x.L.careerBrake = true;
      }
    },

    /* ------------- отрасль, техника и перемены времени (6) ------------- */
    {
      id: 'w-machines', age: [18, 64], w: function (x) { return hard(x) && x.L.year > 1970 ? 1.2 : 0.2; },
      run: function (x) {
        if (x.rnd() < 0.45) {
          x.add('Поставили новые станки: людей стало нужно меньше, но вас оставили и переучили.', 'work');
          x.stat('know', 4); bump(x, 'certs', 1, 0, 6);
        } else {
          x.add('Новая техника заменила половину участка. Вашу смену сократили.', 'bad');
          x.L.job = null; x.L.unemployedYears = 0; x.L.career.fired++; x.stat('happy', -6);
        }
      }
    },
    {
      id: 'w-computerise', age: [20, 64], w: function (x) { return x.L.year >= 1995 && office(x) ? 1.2 : 0.2; },
      run: function (x) {
        x.add('Бумажные журналы заменили программой. Полгода ушло на привыкание.', 'work');
        x.stat('know', 3); bump(x, 'burnout', 4);
      }
    },
    {
      id: 'w-industry-boom', age: [18, 64], w: function (x) { return 1; },
      run: function (x) {
        pay(x, 0.09);
        x.add('В отрасли подъём: людей не хватает, зарплаты поползли вверх.', 'good');
        x.stat('happy', 2);
      }
    },
    {
      id: 'w-industry-bust', age: [18, 64], w: function (x) { return 1.1; },
      run: function (x) {
        pay(x, -0.07);
        x.add('В отрасли спад: заказов мало, разговоры только о том, кого сократят.', 'bad');
        bump(x, 'mood', -6); bump(x, 'burnout', 5);
      }
    },
    {
      id: 'w-factory-sold', age: [18, 64], w: function (x) { return hard(x) ? 1.1 : 0.5; },
      run: function (x) {
        var good = x.rnd() < 0.45;
        x.add(good ? 'Предприятие купил новый хозяин: вложил деньги, поднял зарплаты.'
          : 'Предприятие купил новый хозяин: начал с увольнений и экономии на всём.', good ? 'good' : 'bad');
        pay(x, good ? 0.08 : -0.06); bump(x, 'mood', good ? 5 : -7);
        if (!good) bump(x, 'safety', -0.1, 0, 1);
      }
    },
    {
      id: 'w-pandemic-work', age: [18, 66], w: function (x) { return x.L.year >= 2020 && x.L.year <= 2022 ? 3 : 0; },
      run: function (x) {
        if (office(x)) {
          J(x).remote = true; J(x).commute = 0;
          x.add('Контору закрыли, работу перенесли домой: кухня стала кабинетом.', 'work');
          x.stat('happy', -2);
        } else {
          x.add('Работу не остановили: вы ездили в пустом транспорте и работали в маске.', 'bad');
          x.stat('health', -3); x.stat('happy', -3);
        }
      }
    },

    /* --------------- потеря работы, поиск, возвращение (8) ------------- */
    {
      id: 'w-layoff-rumour', age: [18, 64], w: 1.2,
      run: function (x) {
        x.add('Списки на сокращение уже ходят по конторе. Вашей фамилии в них пока нет.', 'work');
        bump(x, 'burnout', 6); bump(x, 'mood', -4);
      }
    },
    {
      id: 'w-quit-self', age: [18, 62], w: function (x) { return J(x).mood < 28 || J(x).burnout > 80 ? 1.4 : 0.1; },
      run: function (x) {
        x.add('Вы ушли сами: терпеть это дальше оказалось дороже, чем остаться без работы.', 'work');
        x.L.career.quit++; x.L.job = null; x.L.unemployedYears = 0; x.stat('happy', 3);
      }
    },
    {
      id: 'w-search-long', age: [18, 64], needJob: false, w: function (x) { return x.L.job ? 0 : 1.6; },
      run: function (x) {
        x.add('Третий месяц поисков: отклики без ответов и собеседования без продолжения.', 'bad');
        x.stat('happy', -4); x.stat('know', -1);
      }
    },
    {
      id: 'w-search-help', age: [18, 64], needJob: false, w: function (x) { return x.L.job ? 0 : 1.2; },
      run: function (x) {
        x.add('Знакомый передал ваш номер нужному человеку. Так ищут работу чаще, чем по объявлениям.', 'good');
        x.L.unemployedYears = Math.max(0, x.L.unemployedYears - 1); x.stat('bond', 2);
      }
    },
    {
      id: 'w-benefit', age: [18, 64], needJob: false, w: function (x) { return x.L.job ? 0 : (rich(x.c) ? 1.6 : 0.3); },
      run: function (x) {
        x.add('Назначили пособие по безработице: немного, но дышать стало легче.', 'work');
        x.money(x.need * 0.18);
      }
    },
    {
      id: 'w-odd-jobs', age: [16, 70], needJob: false, w: function (x) { return x.L.job ? 0 : 1.5; },
      run: function (x) {
        x.add('Перебивались случайной работой: сегодня разгрузка, завтра ремонт у соседа.', 'work');
        x.money(x.need * 0.1); x.stat('health', -1);
      }
    },
    {
      id: 'w-return-job', age: [20, 64], needJob: false, w: function (x) { return x.L.job ? 0 : 0.9; },
      run: function (x) {
        x.add('Старый работодатель позвал обратно: «мы погорячились».', 'good');
        x.L.hire('stable'); x.stat('happy', 3);
      }
    },
    {
      id: 'w-age-wall', age: [48, 64], needJob: false, w: function (x) { return x.L.job ? 0 : 1.8; },
      run: function (x) {
        x.add('В пятьдесят на собеседованиях смотрят в паспорт раньше, чем в трудовую.', 'bad');
        x.stat('happy', -4); x.L.careerBrake = true;
      }
    },

    /* ------------------ признание, вершина, смысл (8) ------------------ */
    {
      id: 'w-award', age: [25, 70], w: function (x) { return J(x).rep > 70 ? 1.3 : 0.2; },
      run: function (x) {
        x.add('Вам дали грамоту и пожали руку перед коллективом. Рамка потом висела дома.', 'good');
        x.stat('happy', 5); bump(x, 'mood', 6);
      }
    },
    {
      id: 'w-known-master', age: [30, 70], w: function (x) { return J(x).rep > 75 ? 1.2 : 0.1; },
      run: function (x) {
        x.add('В городе вас знают как мастера своего дела: к вам идут по рекомендации.', 'good');
        pay(x, 0.07); x.stat('happy', 4);
      }
    },
    {
      id: 'w-student-thanks', age: [35, 80], w: function (x) { return J(x).years > 12 ? 1.1 : 0.1; },
      run: function (x) {
        x.add('Бывший ученик нашёл вас, чтобы сказать спасибо. Он теперь работает лучше вас.', 'good');
        x.stat('happy', 6); bump(x, 'mood', 6);
      }
    },
    {
      id: 'w-dream-job', age: [20, 64], w: function (x) { return J(x).dream ? 1.4 : 0; },
      run: function (x) {
        x.add('Иногда по дороге домой вы ловите себя на мысли, что занимаетесь ровно тем, чем хотели.', 'good');
        x.stat('happy', 6); bump(x, 'mood', 8); bump(x, 'burnout', -10);
      }
    },
    {
      id: 'w-pointless', age: [25, 64], w: function (x) { return J(x).mood < 42 ? 1.5 : 0.2; },
      run: function (x) {
        x.add('Вы поймали себя на мысли, что ваша работа никому не нужна — её просто кто-то должен делать.', 'bad');
        x.stat('happy', -5); bump(x, 'burnout', 8);
      }
    },
    {
      id: 'w-last-shift', age: [55, 75], w: function (x) { return x.L.age > 58 ? 1.3 : 0.2; },
      run: function (x) {
        x.add('Вы всё чаще считаете, сколько смен осталось до пенсии. Счёт получается длинный.', 'work');
        bump(x, 'mood', -3);
      }
    },
    {
      id: 'w-veteran', age: [50, 75], w: function (x) { return J(x).years > 20 ? 1.4 : 0; },
      run: function (x) {
        x.add('Вас называют ветераном предприятия. Половину здешних порядков когда-то завели вы.', 'good');
        bump(x, 'rep', 5); x.stat('happy', 4);
      }
    },
    {
      id: 'w-after-pension', age: [60, 85], needJob: false, w: function (x) { return x.L.retired ? 1.3 : 0.2; },
      run: function (x) {
        x.add('На пенсии вас иногда зовут подменить: руки помнят, и лишние деньги не лишние.', 'work');
        x.money(x.need * 0.08); x.stat('happy', 2);
      }
    }
  ];

  /* ======================================================================
     КАРТОЧКИ РЕШЕНИЙ О РАБОТЕ — сто вариантов ответа
     ====================================================================== */
  var WORK_CHOICES = [

    {
      id: 'wc-first-job', work: true, age: [16, 24], once: true, needJob: false, priority: true,
      cond: function (x) { return !x.L.edu.inSchool && x.L.career.held.length <= 1; },
      title: 'С чего начинать работать',
      text: function (x) {
        return rural(x.L)
          ? 'Работа в селе есть всегда, только выбирать особо не из чего. В городе, говорят, платят больше.'
          : 'Первая работа. Можно выбрать то, что ближе, то, что надёжнее, или то, чего хочется.';
      },
      options: [
        {
          label: 'Куда возьмут сегодня', hint: 'деньги сразу · без выбора', w: 4,
          run: function (x) {
            x.add('Вы пошли туда, где взяли без разговоров.', 'work');
            x.L.job = null; x.L.hire('hard');
            if (x.L.job) { x.L.job.contract = 'none'; x.L.job.mood = clamp(x.L.job.mood - 8, 0, 100); }
          }
        },
        {
          label: 'Туда, где оформят', hint: 'договор · стаж · меньше на руки', w: 3,
          run: function (x) {
            x.add('Вы выбрали место с настоящим договором.', 'work');
            x.L.job = null; x.L.hire('stable');
            if (x.L.job) { x.L.job.contract = 'official'; x.L.job.safety = clamp(x.L.job.safety + 0.15, 0, 1); }
          }
        },
        {
          label: 'На тяжёлую, но денежную', hint: 'деньги ++ · здоровье −', w: 2,
          req: { health: 40 },
          run: function (x) {
            x.add('Вы выбрали работу потяжелее — за неё платят больше.', 'work');
            x.L.job = null; x.L.hire('hard');
            if (x.L.job) { x.L.job.overtime = 1; x.L.job.boost = 1.1; }
            x.stat('health', -2);
          }
        },
        {
          label: 'В дело, о котором мечтали', hint: 'радость ++ · деньги −', w: 1.6,
          run: function (x) {
            x.add('Вы пошли туда, куда хотели, а не туда, где платят.', 'good');
            x.L.job = null; x.L.hire('dream');
            if (x.L.job) { x.L.job.mood = clamp(x.L.job.mood + 18, 0, 100); x.L.job.boost = 0.94; }
            x.stat('happy', 6);
          }
        },
        {
          label: 'Уехать в город за работой', hint: 'город · риск', w: function (x) { return rural(x.L) ? 2.2 : 0; },
          req: { money: function (x) { return x.need * 0.12; } },
          cost: { money: function (x) { return x.need * 0.12; } },
          run: function (x) {
            x.money(-x.need * 0.12); x.L.urban = true; x.L.moves++;
            x.add('Вы уехали в город и сняли угол у чужих людей.', 'work');
            x.L.job = null; x.L.hire('hard');
            x.stat('bond', -3); x.stat('happy', 2);
          }
        },
        {
          label: 'Поучиться ещё год', hint: 'знания + · заработок позже', w: 1.4,
          req: { know: 25 },
          run: function (x) {
            x.stat('know', 7); x.L.unemployedYears = 0;
            x.add('Вы отложили работу ради учёбы ещё на год.', 'life');
          }
        }
      ]
    },

    {
      id: 'wc-contract', work: true, age: [18, 60],
      cond: function (x) { return x.L.job.contract !== 'official' && x.L.job.years >= 1; },
      title: 'Разговор об оформлении',
      text: function (x) {
        return 'Вы работаете без нормального договора. Начальник говорит: «Оформим — потеряешь в деньгах. Тебе надо?»';
      },
      options: [
        {
          label: 'Требовать договор', hint: 'стаж и больничный · меньше на руки', w: 2.4,
          chance: function (x) { return clamp(0.4 + dev(x.c) * 0.4 + x.L.job.rep / 300, 0.15, 0.9); },
          run: function (x) {
            x.L.job.contract = 'official'; x.flag('grey', false); pay(x, -0.05);
            x.add('Вас оформили по трудовому договору.', 'good'); x.stat('happy', 3);
          },
          fail: function (x) {
            x.add('На требование оформить договор ответили: «не нравится — дверь там».', 'bad');
            bump(x, 'boss', -1, -3, 3); bump(x, 'mood', -6);
          }
        },
        {
          label: 'Оставить как есть', hint: 'больше на руки · ни стажа, ни защиты', w: 2.6,
          run: function (x) {
            x.flag('grey', true); pay(x, 0.05);
            x.add('Вы оставили всё как есть: деньги сейчас важнее пенсии потом.', 'work');
          }
        },
        {
          label: 'Половину в конверте', hint: 'компромисс', w: 2,
          run: function (x) {
            x.L.job.contract = 'grey'; x.flag('grey', true); pay(x, 0.02);
            x.add('Договорились на половину официально, половину в конверте.', 'work');
          }
        },
        {
          label: 'Пожаловаться в инспекцию', hint: 'риск · может помочь всем', w: 0.7,
          chance: function (x) { return clamp(0.25 + dev(x.c) * 0.45, 0.1, 0.8); },
          run: function (x) {
            x.L.job.contract = 'official'; x.flag('grey', false);
            x.add('После проверки оформили всю смену. Вас теперь не любят, но уважают.', 'good');
            bump(x, 'boss', -1, -3, 3); bump(x, 'rep', 4);
          },
          fail: function (x) {
            x.add('Жалоба ничего не дала, а работодатель всё понял.', 'bad');
            x.L.career.fired++; x.L.job = null; x.L.unemployedYears = 0; x.stat('happy', -6);
          }
        },
        {
          label: 'Искать другое место', hint: 'уйти самому', w: 1.2,
          run: function (x) {
            x.L.career.quit++; x.L.job = null; x.L.unemployedYears = 0;
            x.add('Вы ушли искать место, где оформляют людей.', 'work');
          }
        }
      ]
    },

    {
      id: 'wc-overtime', work: true, age: [18, 62],
      cond: function (x) { return x.L.job.years >= 1 && x.L.job.overtime < 3; },
      title: 'Предложили перерабатывать',
      text: function (x) {
        return 'Начальник просит оставаться по вечерам и выходить в субботу. Обещает платить за часы.';
      },
      options: [
        {
          label: 'Согласиться на всё', hint: 'деньги ++ · здоровье и дом −−', w: 2.2,
          run: function (x) {
            bump(x, 'overtime', 2, 0, 3); bump(x, 'boss', 1, -3, 3);
            x.add('Вы стали человеком, который всегда остаётся.', 'work');
            x.stat('bond', -3);
          }
        },
        {
          label: 'Иногда, за деньги', hint: 'деньги + · умеренно', w: 3,
          run: function (x) {
            bump(x, 'overtime', 1, 0, 3);
            x.add('Вы согласились перерабатывать время от времени.', 'work');
          }
        },
        {
          label: 'Отказаться', hint: 'вечера свои · начальник недоволен', w: 2,
          run: function (x) {
            bump(x, 'boss', -1, -3, 3); bump(x, 'burnout', -6);
            x.add('Вы отказались задерживаться. Семье это понравилось больше, чем начальнику.', 'work');
            x.stat('bond', 3);
          }
        },
        {
          label: 'Согласиться, но письменно', hint: 'оплата по закону', w: function (x) { return x.L.job.contract === 'official' ? 1.6 : 0.3; },
          req: { custom: { test: function (x) { return x.L.job.contract === 'official'; }, why: 'у вас нет договора', done: 'договор есть' } },
          run: function (x) {
            bump(x, 'overtime', 1, 0, 3); pay(x, 0.05);
            x.add('Переработки оформили приказом: часы оплачивают полностью.', 'good');
          }
        },
        {
          label: 'Предложить взять ещё людей', hint: 'репутация · может сработать', w: 1.2,
          chance: function (x) { return clamp(0.3 + x.L.job.rep / 250, 0.15, 0.75); },
          run: function (x) {
            x.add('Вас послушали: на участок взяли ещё двоих.', 'good');
            bump(x, 'rep', 5); bump(x, 'mood', 5);
          },
          fail: function (x) {
            x.add('Вам ответили, что денег на людей нет, а работа сама себя не сделает.', 'work');
            bump(x, 'overtime', 1, 0, 3); bump(x, 'mood', -4);
          }
        }
      ]
    },

    {
      id: 'wc-boss', work: true, age: [18, 64],
      cond: function (x) { return x.L.job.boss <= -1; },
      title: 'Начальник сделал вас виноватым',
      text: function (x) {
        return 'Ошибку допустили не вы, но разбираться никто не стал. Вас отчитали при всех и обещали лишить премии.';
      },
      options: [
        {
          label: 'Промолчать', hint: 'спокойно · обидно', w: 3,
          run: function (x) {
            bump(x, 'mood', -5); x.stat('happy', -3); bump(x, 'burnout', 5);
            x.add('Вы промолчали. Так делают почти все.', 'work');
          }
        },
        {
          label: 'Спокойно объясниться наедине', hint: 'может помочь', w: 2.4,
          chance: function (x) { return clamp(0.35 + x.L.job.rep / 220, 0.2, 0.8); },
          run: function (x) {
            bump(x, 'boss', 2, -3, 3); bump(x, 'mood', 6);
            x.add('Вы поговорили с начальником с глазу на глаз, и он признал, что погорячился.', 'good');
          },
          fail: function (x) {
            bump(x, 'boss', -1, -3, 3);
            x.add('Разговор наедине закончился тем, что вам припомнили всё за три года.', 'bad');
          }
        },
        {
          label: 'Ответить резко при всех', hint: 'гордость · риск', w: 1.2,
          run: function (x) {
            x.add('Вы ответили так, что в цеху стало тихо.', 'work');
            bump(x, 'boss', -2, -3, 3); bump(x, 'rep', 3); x.stat('happy', 2);
            if (x.rnd() < 0.3) {
              x.L.career.fired++; x.L.job = null; x.L.unemployedYears = 0;
              x.add('К вечеру вам предложили написать заявление.', 'bad');
            }
          }
        },
        {
          label: 'Пойти к его начальству', hint: 'через голову', w: 1,
          chance: function (x) { return clamp(0.3 + dev(x.c) * 0.25, 0.15, 0.7); },
          run: function (x) {
            x.add('Наверху разобрались и поставили вашего начальника на место.', 'good');
            bump(x, 'boss', 1, -3, 3); bump(x, 'rep', 4);
          },
          fail: function (x) {
            x.add('Наверху вас выслушали и передали жалобу вниз — тому, на кого жаловались.', 'bad');
            bump(x, 'boss', -2, -3, 3); bump(x, 'mood', -8);
          }
        },
        {
          label: 'Начать искать другое место', hint: 'тихо готовить уход', w: 1.6,
          run: function (x) {
            x.add('Вы начали тихо смотреть вакансии. Работа сразу стала переносимее.', 'work');
            bump(x, 'mood', 4);
            if (x.rnd() < 0.5) { x.L.changeJob(); x.L.career.quit++; }
          }
        },
        {
          label: 'Записывать всё', hint: 'бумаги на будущее', w: function (x) { return x.L.job.contract === 'official' ? 1.4 : 0.4; },
          run: function (x) {
            x.add('Вы завели тетрадь: даты, поручения, подписи. На всякий случай.', 'work');
            x.flag('workLog', true); bump(x, 'rep', 2);
          }
        }
      ]
    },

    {
      id: 'wc-promotion', work: true, age: [24, 60],
      cond: function (x) { return x.L.job.rep > 55 && x.L.job.step < M.topStep(jd(x)); },
      title: 'Предлагают повышение',
      text: function (x) {
        return 'Вам предлагают стать старшим: больше денег, больше ответственности и те же коллеги, но теперь в подчинении.';
      },
      options: [
        {
          label: 'Согласиться', hint: 'ступень + · забот больше', w: 3.4,
          run: function (x) {
            x.L.job.step = clamp(x.L.job.step + 1, 0, M.topStep(jd(x)));
            x.L.career.promos++; x.L.career.maxStep = Math.max(x.L.career.maxStep, x.L.job.step);
            x.add('Вы приняли повышение: теперь вы ' + title(x) + '.', 'good');
            x.stat('happy', 4); bump(x, 'burnout', 6); x.stat('bond', -1);
          }
        },
        {
          label: 'Согласиться и выторговать оклад', hint: 'деньги ++ · риск', w: 1.8,
          chance: function (x) { return clamp(0.35 + x.L.job.rep / 200 + x.L.job.boss * 0.06, 0.15, 0.85); },
          run: function (x) {
            x.L.job.step = clamp(x.L.job.step + 1, 0, M.topStep(jd(x)));
            x.L.career.promos++; pay(x, 0.12);
            x.add('Вы согласились — и добились оклада выше предложенного.', 'good');
            x.stat('happy', 5);
          },
          fail: function (x) {
            x.add('Торг не удался: повышение отдали другому.', 'bad');
            bump(x, 'mood', -7); bump(x, 'boss', -1, -3, 3);
          }
        },
        {
          label: 'Отказаться, остаться мастером', hint: 'спокойствие · без роста', w: 1.6,
          run: function (x) {
            x.add('Вы отказались от начальственной должности: ваше — делать, а не распределять.', 'work');
            bump(x, 'mood', 5); bump(x, 'burnout', -8); x.L.careerBrake = true;
          }
        },
        {
          label: 'Согласиться с переездом', hint: 'другой город · деньги ++', w: 1.1,
          run: function (x) {
            x.L.job.step = clamp(x.L.job.step + 1, 0, M.topStep(jd(x)));
            x.L.career.promos++; pay(x, 0.1); x.L.moves++; x.L.urban = true;
            x.add('Ради должности вы переехали в другой город.', 'work');
            x.stat('bond', -5); x.money(-x.need * 0.15);
          }
        },
        {
          label: 'Попросить время подумать', hint: 'осторожно', w: 1.2,
          run: function (x) {
            x.add('Вы попросили неделю на раздумья. Предложение никуда не делось.', 'work');
            if (x.rnd() < 0.6) { x.L.job.step = clamp(x.L.job.step + 1, 0, M.topStep(jd(x))); x.L.career.promos++; x.add('В итоге вы согласились.', 'work'); }
            else { bump(x, 'mood', -3); x.add('Пока вы думали, нашли другого.', 'work'); }
          }
        },
        {
          label: 'Предложить вместо себя коллегу', hint: 'отношения ++', w: 0.9,
          run: function (x) {
            x.add('Вы предложили на должность того, кому она была нужнее.', 'good');
            x.stat('bond', 5); x.stat('happy', 3); bump(x, 'rep', 3);
          }
        }
      ]
    },

    {
      id: 'wc-training', work: true, age: [18, 58],
      cond: function (x) { return x.L.job.certs < 4; },
      title: 'Курсы за свой счёт',
      text: function (x) {
        return 'Есть курсы, после которых берут на работу получше. Платить придётся самому, и учиться — по вечерам.';
      },
      options: [
        {
          label: 'Пойти учиться', hint: 'знания + · разряд + · деньги −', w: 2.6,
          req: { money: function (x) { return x.need * 0.18; } },
          cost: { money: function (x) { return x.need * 0.18; } },
          run: function (x) {
            x.money(-x.need * 0.18); bump(x, 'certs', 1, 0, 6); x.L.career.courses++;
            x.stat('know', 6); bump(x, 'rep', 4);
            x.add('Вы отучились на курсах после работы и получили свидетельство.', 'good');
          }
        },
        {
          label: 'Учиться самому по книгам', hint: 'бесплатно · медленно', w: 2.2,
          run: function (x) {
            x.stat('know', 3); bump(x, 'rep', 1);
            x.add('Вы разбирались сами: книги, чужие записи, вопросы знающим людям.', 'work');
          }
        },
        {
          label: 'Просить оплату у предприятия', hint: 'бесплатно · если согласятся', w: 2,
          chance: function (x) { return clamp(0.3 + x.L.job.rep / 250 + dev(x.c) * 0.2, 0.15, 0.8); },
          run: function (x) {
            bump(x, 'certs', 1, 0, 6); x.L.career.courses++; x.stat('know', 5);
            x.add('Курсы оплатило предприятие — за это пришлось обещать отработать три года.', 'good');
            x.L.careerBrake = true;
          },
          fail: function (x) { x.add('В оплате курсов отказали: «учись в своё время и за свои».', 'work'); bump(x, 'mood', -4); }
        },
        {
          label: 'Взять в долг на учёбу', hint: 'знания ++ · долг', w: 0.9,
          run: function (x) {
            x.money(x.need * 0.2); x.L.microDebt = (x.L.microDebt || 0) + x.need * 0.26;
            bump(x, 'certs', 2, 0, 6); x.stat('know', 8); x.L.career.courses++;
            x.add('Вы заняли денег и отучились как следует.', 'work');
          }
        },
        {
          label: 'Не до учёбы сейчас', hint: 'ничего не менять', w: 2.4,
          run: function (x) { x.add('Вы решили, что сейчас не до курсов.', 'work'); }
        }
      ]
    },

    {
      id: 'wc-sideline', work: true, age: [18, 62],
      cond: function (x) { return x.L.money < x.need * 0.8; },
      title: 'Подработка',
      text: function (x) {
        return 'Денег до зарплаты не хватает. Знакомый зовёт подработать в свободные вечера.';
      },
      options: [
        {
          label: 'Взять подработку', hint: 'деньги + · усталость', w: 3,
          run: function (x) {
            x.money(x.need * 0.14); x.L.career.sideline++;
            x.stat('health', -1.5); bump(x, 'burnout', 7);
            x.add('Вы стали работать и по вечерам.', 'work');
          }
        },
        {
          label: 'Подработка по своей профессии', hint: 'деньги + · репутация +', w: function (x) { return x.L.job.rep > 50 ? 2.2 : 0.6; },
          run: function (x) {
            x.money(x.need * 0.18); bump(x, 'rep', 3); x.L.career.sideline++;
            x.stat('health', -1);
            x.add('Вы взяли частные заказы по своей специальности.', 'good');
          }
        },
        {
          label: 'Продавать своё на рынке', hint: 'мелкие деньги · время', w: function (x) { return poor(x.c) || rural(x.L) ? 2 : 0.8; },
          run: function (x) {
            x.money(x.need * 0.1); x.stat('bond', -1);
            x.add('По выходным вы торговали тем, что выросло и получилось своими руками.', 'work');
          }
        },
        {
          label: 'Подработка в интернете', hint: 'современно · неровно', w: function (x) { return x.L.year >= 2010 ? 1.8 : 0; },
          run: function (x) {
            x.money(x.need * (0.06 + x.rnd() * 0.16)); x.stat('know', 2);
            x.add('Вы нашли заказы в сети: деньги небольшие, зато из дома.', 'work');
          }
        },
        {
          label: 'Занять до зарплаты', hint: 'быстро · долг', w: 1.4,
          run: function (x) {
            x.money(x.need * 0.1); x.L.microDebt = (x.L.microDebt || 0) + x.need * 0.13;
            x.add('Вы заняли до зарплаты. Отдавать будете дольше, чем думали.', 'work');
          }
        },
        {
          label: 'Обойтись', hint: 'затянуть пояс', w: 1.6,
          run: function (x) {
            x.stat('happy', -2);
            x.add('Вы решили обойтись: месяц прожили на картошке и чае.', 'work');
          }
        }
      ]
    },

    {
      id: 'wc-layoff', work: true, age: [20, 62],
      cond: function (x) { return x.L.job.years >= 2; },
      chance: function (x) { return 0.16; },
      title: 'Сокращение',
      text: function (x) {
        return 'Предприятию нужно уволить каждого пятого. Вам предлагают уйти «по соглашению» и обещают выплату.';
      },
      options: [
        {
          label: 'Уйти с выплатой', hint: 'деньги сейчас · без работы', w: 2.4,
          run: function (x) {
            x.money(x.need * (x.L.job.contract === 'official' ? 0.4 : 0.1));
            x.L.job = null; x.L.unemployedYears = 0; x.L.career.fired++;
            x.add('Вы ушли по соглашению сторон с выплатой за три месяца.', 'work');
          }
        },
        {
          label: 'Держаться за место', hint: 'остаться любой ценой', w: 2.6,
          chance: function (x) { return clamp(0.35 + x.L.job.rep / 200 + (x.L.job.union ? 0.15 : 0), 0.15, 0.85); },
          run: function (x) {
            x.add('Вы остались: сократили других. Работы прибавилось, зарплата та же.', 'work');
            bump(x, 'overtime', 1, 0, 3); bump(x, 'burnout', 8);
          },
          fail: function (x) {
            x.add('Держаться не вышло: сократили всё равно, но уже без выплаты.', 'bad');
            x.L.job = null; x.L.unemployedYears = 0; x.L.career.fired++; x.stat('happy', -6);
          }
        },
        {
          label: 'Согласиться на меньшую должность', hint: 'ступень − · работа есть', w: 1.8,
          run: function (x) {
            x.L.job.step = Math.max(0, x.L.job.step - 1); pay(x, -0.08);
            x.add('Вас оставили, но на ступень ниже.', 'work');
            bump(x, 'mood', -6);
          }
        },
        {
          label: 'Судиться за выплату', hint: 'долго · может выгореть', w: function (x) { return x.L.job.contract === 'official' ? 1.2 : 0.2; },
          chance: function (x) { return clamp(0.3 + dev(x.c) * 0.4, 0.15, 0.8); },
          run: function (x) {
            x.money(x.need * 0.5); x.L.job = null; x.L.unemployedYears = 0;
            x.add('Суд обязал выплатить всё положенное. Денег хватило пережить поиски.', 'good');
          },
          fail: function (x) {
            x.money(-x.need * 0.08); x.L.job = null; x.L.unemployedYears = 0;
            x.add('Суд вы проиграли, потратив время и деньги на юриста.', 'bad');
          }
        },
        {
          label: 'Уйти первым, не дожидаясь', hint: 'гордость · без выплаты', w: 1,
          run: function (x) {
            x.L.career.quit++; x.L.job = null; x.L.unemployedYears = 0;
            x.add('Вы написали заявление сами, не дожидаясь списков.', 'work');
            x.stat('happy', 1);
          }
        },
        {
          label: 'Уговорить взять вас на другое место', hint: 'перевод внутри', w: 1.4,
          chance: function (x) { return clamp(0.25 + x.L.job.rep / 220 + x.L.job.boss * 0.05, 0.1, 0.75); },
          run: function (x) {
            x.add('Вас перевели в другой цех: профессия сменилась, место работы осталось.', 'good');
            x.L.changeJob();
          },
          fail: function (x) {
            x.add('Перевести вас было некуда.', 'bad');
            x.L.job = null; x.L.unemployedYears = 0; x.L.career.fired++;
          }
        }
      ]
    },

    {
      id: 'wc-safety', work: true, age: [16, 62],
      cond: function (x) { return x.L.job.safety < 0.55 && jd(x).risk > 1.1; },
      title: 'Работать без защиты',
      text: function (x) {
        return 'Средств защиты нет, ограждение сняли ещё весной, а план горит. Бригадир говорит: «Все так работают».';
      },
      options: [
        {
          label: 'Работать как есть', hint: 'быстрее · опасно', w: 2.8,
          run: function (x) {
            bump(x, 'safety', -0.1, 0, 1); bump(x, 'boss', 1, -3, 3);
            x.add('Вы работали как все и старались не думать об этом.', 'work');
            if (x.rnd() < 0.18) { x.stat('health', -8); x.L.career.injuries++; x.add('В этот раз не повезло: травма.', 'bad'); }
          }
        },
        {
          label: 'Купить защиту за свои', hint: 'деньги − · здоровье +', w: 2.2,
          req: { money: function (x) { return x.need * 0.05; } },
          cost: { money: function (x) { return x.need * 0.05; } },
          run: function (x) {
            x.money(-x.need * 0.05); bump(x, 'safety', 0.2, 0, 1);
            x.add('Каску, перчатки и респиратор вы купили сами.', 'work');
          }
        },
        {
          label: 'Отказаться работать так', hint: 'правильно · начальник против', w: 1.8,
          run: function (x) {
            bump(x, 'boss', -1, -3, 3); bump(x, 'safety', 0.15, 0, 1); bump(x, 'rep', 3);
            x.add('Вы отказались лезть без страховки. Работу остановили на день.', 'work');
          }
        },
        {
          label: 'Написать в инспекцию труда', hint: 'поможет всем · риск', w: 1,
          chance: function (x) { return clamp(0.3 + dev(x.c) * 0.4, 0.15, 0.8); },
          run: function (x) {
            bump(x, 'safety', 0.35, 0, 1);
            x.add('После проверки на участке появилось всё, что должно было быть давно.', 'good');
            bump(x, 'boss', -1, -3, 3);
          },
          fail: function (x) {
            x.add('Проверку предупредили заранее: к их приезду всё было в порядке.', 'bad');
            bump(x, 'boss', -2, -3, 3);
          }
        },
        {
          label: 'Уйти с такой работы', hint: 'здоровье дороже', w: 1.2,
          run: function (x) {
            x.L.career.quit++; x.L.job = null; x.L.unemployedYears = 0;
            x.add('Вы ушли: здоровье дороже этого заработка.', 'work');
          }
        }
      ]
    },

    {
      id: 'wc-union', work: true, age: [18, 62],
      cond: function (x) { return !x.L.job.union && x.L.job.years >= 2; },
      title: 'Зовут в профсоюз',
      text: function (x) {
        return 'На предприятии собирают профсоюз. Одни говорят, что это защита, другие — что это лишние неприятности.';
      },
      options: [
        {
          label: 'Вступить', hint: 'защита · взносы', w: 2.4,
          run: function (x) {
            x.L.job.union = true; x.money(-x.need * 0.01);
            x.add('Вы вступили в профсоюз.', 'work'); bump(x, 'mood', 3);
          }
        },
        {
          label: 'Вступить и войти в актив', hint: 'уважение · внимание начальства', w: 1.2,
          run: function (x) {
            x.L.job.union = true; bump(x, 'rep', 6); bump(x, 'boss', -1, -3, 3);
            x.add('Вы не просто вступили, а стали одним из тех, кто ведёт переговоры.', 'work');
            x.stat('bond', 3);
          }
        },
        {
          label: 'Остаться в стороне', hint: 'тише едешь', w: 2.6,
          run: function (x) { x.add('Вы решили не ввязываться.', 'work'); }
        },
        {
          label: 'Подписать, но не ходить', hint: 'формально', w: 1.6,
          run: function (x) {
            x.L.job.union = true;
            x.add('Вы подписали заявление и больше на собрания не ходили.', 'work');
          }
        },
        {
          label: 'Отговаривать других', hint: 'начальник доволен', w: 0.6,
          run: function (x) {
            bump(x, 'boss', 2, -3, 3); x.stat('bond', -4); bump(x, 'rep', -4);
            x.add('Вы были против профсоюза вслух. Начальство это запомнило — и коллеги тоже.', 'work');
          }
        }
      ]
    },

    {
      id: 'wc-bribe', work: true, age: [22, 64],
      cond: function (x) { return (M.PUBLIC_JOBS[x.L.job.id] || x.L.job.step >= 2) && dev(x.c) < 0.9; },
      heavy: true,
      title: 'Нечестные деньги',
      text: function (x) {
        return 'Через вас проходит то, за что люди готовы приплатить. Коллеги берут давно и смотрят на вас с интересом.';
      },
      options: [
        {
          label: 'Не брать', hint: 'спокойный сон · меньше денег', w: 3,
          run: function (x) {
            x.add('Вы не стали брать. Коллеги решили, что вы странный.', 'work');
            x.stat('bond', -2); bump(x, 'mood', 3);
          }
        },
        {
          label: 'Брать по мелочи', hint: 'деньги + · риск', w: 1.8,
          run: function (x) {
            x.money(x.need * 0.14); x.flag('greyMoney', true);
            x.add('Вы стали брать «за ускорение». Все так делают.', 'work');
            if (x.rnd() < 0.12) { x.add('Попались на проверке: штраф и позор.', 'bad'); x.money(-x.need * 0.5); bump(x, 'rep', -12); }
          }
        },
        {
          label: 'Брать по-крупному', hint: 'деньги ++ · тюрьма рядом', w: 0.7,
          run: function (x) {
            x.money(x.need * 0.6); x.flag('greyMoney', true);
            x.add('Вы вошли в долю по-настоящему. Деньги пошли другие.', 'work');
            if (x.rnd() < 0.3) {
              x.add('Дело дошло до суда. Работы и репутации больше нет.', 'bad');
              x.money(-x.need * 1.5); x.flag('exCon', true); x.L.job = null; x.L.unemployedYears = 0; x.stat('happy', -12);
            }
          }
        },
        {
          label: 'Отказаться и доложить', hint: 'честно · опасно', w: 0.8,
          chance: function (x) { return clamp(0.25 + dev(x.c) * 0.35, 0.1, 0.7); },
          run: function (x) {
            x.add('Вы рассказали о схеме наверх. Виновных убрали, вас повысили.', 'good');
            x.L.job.step = clamp(x.L.job.step + 1, 0, M.topStep(jd(x))); bump(x, 'rep', 8);
          },
          fail: function (x) {
            x.add('Вас выставили клеветником и выжили с работы.', 'bad');
            x.L.career.fired++; x.L.job = null; x.L.unemployedYears = 0; x.stat('happy', -6);
          }
        },
        {
          label: 'Уйти с такого места', hint: 'чистые руки · без работы', w: 1,
          run: function (x) {
            x.L.career.quit++; x.L.job = null; x.L.unemployedYears = 0;
            x.add('Вы ушли оттуда, где иначе нельзя.', 'work'); x.stat('happy', 2);
          }
        }
      ]
    },

    {
      id: 'wc-burnout', work: true, age: [24, 62],
      cond: function (x) { return x.L.job.burnout > 55; },
      title: 'Больше не можется',
      text: function (x) {
        return 'Утром вы стоите у двери и не можете заставить себя выйти. Работа не стала труднее — кончились силы.';
      },
      options: [
        {
          label: 'Взять отпуск', hint: 'передышка', w: 2.6,
          req: { custom: { test: function (x) { return x.L.job.contract !== 'none'; }, why: 'без договора отпуска нет', done: 'отпуск положен' } },
          run: function (x) {
            bump(x, 'burnout', -30); x.stat('happy', 5); x.stat('health', 2);
            x.add('Вы взяли отпуск и впервые за годы никуда не торопились.', 'good');
          }
        },
        {
          label: 'Уйти в долгий перерыв', hint: 'без работы · без выгорания', w: 1.2,
          req: { money: function (x) { return x.need * 0.5; } },
          run: function (x) {
            x.L.career.quit++; x.L.job = null; x.L.unemployedYears = 0;
            x.stat('happy', 8); x.stat('health', 3);
            x.add('Вы просто ушли с работы и несколько месяцев приходили в себя.', 'work');
          }
        },
        {
          label: 'Сбросить переработки', hint: 'меньше денег · больше жизни', w: 2.4,
          run: function (x) {
            x.L.job.overtime = 0; bump(x, 'burnout', -18); x.stat('bond', 3);
            x.add('Вы перестали оставаться по вечерам, и мир не рухнул.', 'good');
          }
        },
        {
          label: 'Терпеть дальше', hint: 'ничего не менять', w: 2,
          run: function (x) {
            bump(x, 'burnout', 8); x.stat('health', -3); x.stat('happy', -4);
            x.add('Вы решили, что отдыхать некогда, и пошли на работу.', 'bad');
          }
        },
        {
          label: 'Сходить к врачу', hint: 'здоровье +', w: 1.4,
          req: { money: function (x) { return x.need * 0.06; } },
          cost: { money: function (x) { return x.need * 0.06; } },
          run: function (x) {
            x.money(-x.need * 0.06); bump(x, 'burnout', -20); x.stat('health', 3);
            x.add('Врач назвал это выгоранием и выписал то, что помогло.', 'good');
            x.flag('untreated', false);
          }
        },
        {
          label: 'Сменить работу', hint: 'с чистого листа', w: 1.6,
          run: function (x) {
            x.L.changeJob(); x.L.career.quit++;
            if (x.L.job) x.L.job.burnout = 10;
            x.add('Вы сменили работу, чтобы начать заново.', 'work'); x.stat('happy', 3);
          }
        }
      ]
    },

    {
      id: 'wc-remote', work: true, age: [20, 62],
      cond: function (x) { return x.L.year >= 2005 && office(x) && !x.L.job.remote; },
      title: 'Работа из дома',
      text: function (x) {
        return 'Появилась возможность работать из дома. Начальник сомневается, коллеги завидуют.';
      },
      options: [
        {
          label: 'Перейти на удалённую', hint: 'без дороги · дом как контора', w: 2.6,
          run: function (x) {
            x.L.job.remote = true; x.L.job.commute = 0;
            x.add('Вы стали работать из дома.', 'work'); x.stat('happy', 3); bump(x, 'burnout', 3);
          }
        },
        {
          label: 'Два дня дома, три в конторе', hint: 'середина', w: 2.4,
          run: function (x) {
            x.L.job.commute = clamp(x.L.job.commute * 0.6, 0, 3);
            x.add('Договорились на смешанный график.', 'good'); x.stat('happy', 2);
          }
        },
        {
          label: 'Остаться в конторе', hint: 'люди рядом', w: 2,
          run: function (x) {
            x.add('Вы остались работать среди людей: дома не получается.', 'work');
            x.stat('bond', 2);
          }
        },
        {
          label: 'Удалённо и на другой город', hint: 'переезд к своим', w: 1,
          run: function (x) {
            x.L.job.remote = true; x.L.job.commute = 0; x.L.moves++;
            x.add('Удалённая работа позволила уехать туда, где живёт семья.', 'good');
            x.stat('bond', 5); x.stat('happy', 4);
          }
        },
        {
          label: 'Удалённо на работодателя побогаче', hint: 'деньги ++ · чужие порядки', w: function (x) { return x.L.year >= 2015 && !rich(x.c) ? 1.6 : 0.4; },
          chance: function (x) { return clamp(0.2 + x.L.stats.know / 180 + x.L.job.rep / 300, 0.1, 0.7); },
          run: function (x) {
            x.L.job.remote = true; x.L.job.commute = 0; pay(x, 0.35);
            x.add('Вы нашли удалённую работу на компанию из богатой страны. Зарплата стала другой.', 'good');
            x.stat('happy', 5);
          },
          fail: function (x) {
            x.add('На удалённую работу за рубеж вас не взяли: конкурс оказался жёстким.', 'work');
            x.stat('happy', -2);
          }
        }
      ]
    },

    {
      id: 'wc-rotation', work: true, age: [20, 58],
      cond: function (x) { return hard(x) && x.L.job.schedule !== 'rotation' && x.L.money < x.need; },
      title: 'Зовут на вахту',
      text: function (x) {
        return 'Зовут на вахту: месяц там, месяц дома, платят вдвое. Дорога дальняя, связь плохая.';
      },
      options: [
        {
          label: 'Поехать', hint: 'деньги ++ · семья далеко', w: 2.4,
          run: function (x) {
            x.L.job.schedule = 'rotation';
            x.add('Вы уехали на вахту.', 'work'); x.stat('bond', -4);
          }
        },
        {
          label: 'Поехать на один сезон', hint: 'деньги + · вернуться', w: 2.2,
          run: function (x) {
            x.money(x.need * 0.5); x.stat('health', -2); x.stat('bond', -2);
            x.add('Вы отработали один сезон на вахте и вернулись домой с деньгами.', 'work');
          }
        },
        {
          label: 'Отказаться', hint: 'семья рядом', w: 2,
          run: function (x) { x.add('Вы отказались от вахты: дети растут быстро.', 'work'); x.stat('bond', 3); }
        },
        {
          label: 'Поехать всей семьёй', hint: 'переезд', w: 1.2,
          req: { money: function (x) { return x.need * 0.25; } },
          cost: { money: function (x) { return x.need * 0.25; } },
          run: function (x) {
            x.money(-x.need * 0.25); x.L.moves++; pay(x, 0.2);
            x.add('Вы перевезли семью поближе к работе.', 'work'); x.stat('bond', 2);
          }
        },
        {
          label: 'Уехать работать за границу', hint: 'деньги +++ · всё чужое', w: function (x) { return poor(x.c) ? 1.6 : 0.4; },
          req: { money: function (x) { return x.need * 0.4; } },
          cost: { money: function (x) { return x.need * 0.4; } },
          run: function (x) {
            x.money(-x.need * 0.4); x.L.abroad = true; x.L.moves++;
            x.add('Вы уехали работать за границу: язык чужой, деньги настоящие.', 'work');
            x.stat('bond', -6); x.stat('happy', -2);
          }
        }
      ]
    },

    {
      id: 'wc-switch', work: true, age: [28, 54], once: true,
      cond: function (x) { return x.L.job.mood < 48 || x.L.job.burnout > 50; },
      title: 'Сменить дело жизни',
      text: function (x) {
        return 'Вы занимаетесь этим уже много лет. Менять профессию поздно и страшно — но мысль не уходит.';
      },
      options: [
        {
          label: 'Остаться в профессии', hint: 'надёжно', w: 3,
          run: function (x) { x.add('Вы остались при своём деле.', 'work'); bump(x, 'mood', 2); }
        },
        {
          label: 'Переучиться на смежное', hint: 'знания + · ступень −', w: 2.2,
          req: { money: function (x) { return x.need * 0.2; } },
          cost: { money: function (x) { return x.need * 0.2; } },
          run: function (x) {
            x.money(-x.need * 0.2); x.L.changeJob(); x.stat('know', 6);
            if (x.L.job) { x.L.job.certs = 1; x.L.job.mood = clamp(x.L.job.mood + 10, 0, 100); }
            x.add('Вы переучились и перешли в близкую профессию.', 'work');
          }
        },
        {
          label: 'Начать заново с нуля', hint: 'всё сначала · радость', w: 1.4,
          run: function (x) {
            x.L.job = null; x.L.hire('dream');
            if (x.L.job) { x.L.job.step = 0; x.L.job.mood = clamp(x.L.job.mood + 20, 0, 100); }
            x.add('Вы начали профессию заново, с самой нижней ступени.', 'work');
            x.stat('happy', 6); x.money(-x.need * 0.1);
          }
        },
        {
          label: 'Открыть своё дело', hint: 'свобода · риск', w: 1.2,
          req: { money: function (x) { return x.need * 0.6; } },
          cost: { money: function (x) { return x.need * 0.6; } },
          run: function (x) {
            x.money(-x.need * 0.6); x.L.business = true;
            x.L.job = null; x.L.hire('stable');
            if (x.L.job) { x.L.job.contract = 'none'; x.L.job.mood = clamp(x.L.job.mood + 14, 0, 100); }
            x.add('Вы открыли своё дело. Теперь выходных нет, зато начальника тоже.', 'work');
            x.stat('happy', 4);
          }
        },
        {
          label: 'Уйти в преподавание', hint: 'передавать своё', w: function (x) { return x.L.job.rep > 60 ? 1.6 : 0.5; },
          run: function (x) {
            x.L.job = null; x.L.hire('stable');
            x.add('Вы стали учить тому, что умеете сами.', 'good');
            if (x.L.job) { x.L.job.mood = clamp(x.L.job.mood + 16, 0, 100); x.L.job.boost = 0.9; }
            x.stat('happy', 5); x.stat('know', 3);
          }
        },
        {
          label: 'Поменять страну вместе с профессией', hint: 'всё чужое · деньги', w: 0.8,
          req: { money: function (x) { return x.need * 0.8; } },
          cost: { money: function (x) { return x.need * 0.8; } },
          run: function (x) {
            x.money(-x.need * 0.8); x.L.abroad = true; x.L.moves++;
            x.L.job = null; x.L.hire('hard');
            x.add('Вы уехали и начали всё заново в другой стране.', 'work');
            x.stat('bond', -6); x.stat('happy', 2);
          }
        }
      ]
    },

    {
      id: 'wc-mentor', work: true, age: [30, 66],
      cond: function (x) { return x.L.job.years > 6 && x.L.job.rep > 50; },
      title: 'К вам прислали ученика',
      text: function (x) {
        return 'Молодой, ничего не умеет, но смотрит внимательно. Возиться с ним никто не обязан.';
      },
      options: [
        {
          label: 'Учить по-настоящему', hint: 'репутация + · время −', w: 2.8,
          run: function (x) {
            bump(x, 'rep', 7); bump(x, 'mood', 6); x.stat('happy', 4); x.stat('know', 2);
            x.add('Вы взялись учить всерьёз: показывали, объясняли, не кричали.', 'good');
          }
        },
        {
          label: 'Пусть смотрит и учится сам', hint: 'как учили вас', w: 2.4,
          run: function (x) { x.add('Вы работали, он смотрел. Так учили и вас.', 'work'); }
        },
        {
          label: 'Сгрузить на него всё тяжёлое', hint: 'легче вам · хуже ему', w: 1.2,
          run: function (x) {
            x.stat('health', 1); bump(x, 'rep', -4); x.stat('bond', -2);
            x.add('Вы отдали ученику всю грязную работу.', 'work');
          }
        },
        {
          label: 'Просить доплату за наставничество', hint: 'деньги +', w: 1.6,
          chance: function (x) { return clamp(0.35 + x.L.job.rep / 250, 0.15, 0.8); },
          run: function (x) { pay(x, 0.05); x.add('За наставничество вам стали доплачивать.', 'good'); },
          fail: function (x) { x.add('Доплату не дали: «это ваша обязанность».', 'work'); bump(x, 'mood', -3); }
        },
        {
          label: 'Отказаться от ученика', hint: 'спокойно', w: 1.4,
          run: function (x) { x.add('Вы отказались брать ученика: своей работы хватает.', 'work'); }
        },
        {
          label: 'Записать всё, что знаете', hint: 'останется после вас', w: 1,
          run: function (x) {
            bump(x, 'rep', 5); x.stat('happy', 3); x.flag('workBook', true);
            x.add('Вы составили для новичков описание работы — по-человечески, а не как в инструкции.', 'good');
          }
        }
      ]
    },

    {
      id: 'wc-wagecut', work: true, age: [20, 64],
      cond: function (x) { return x.L.job.years >= 2; },
      chance: function (x) { return 0.14; },
      title: 'Урезали зарплату',
      text: function (x) {
        return 'Объявили, что платить будут меньше: у предприятия трудности. Уволить не обещают, но и выбора не дают.';
      },
      options: [
        {
          label: 'Принять и работать', hint: 'деньги − · место есть', w: 3,
          run: function (x) {
            pay(x, -0.12); bump(x, 'mood', -6);
            x.add('Вы приняли сокращение зарплаты.', 'bad');
          }
        },
        {
          label: 'Сократить и усилия', hint: 'меньше платят — меньше работы', w: 1.8,
          run: function (x) {
            pay(x, -0.12); bump(x, 'rep', -5); bump(x, 'burnout', -8);
            x.add('Вы стали работать ровно на ту зарплату, которую платят.', 'work');
          }
        },
        {
          label: 'Требовать вернуть', hint: 'вместе с бригадой', w: 1.6,
          chance: function (x) { return clamp(0.25 + (x.L.job.union ? 0.3 : 0) + x.L.job.rep / 300, 0.1, 0.8); },
          run: function (x) { x.add('Коллективное письмо подействовало: зарплату вернули.', 'good'); bump(x, 'mood', 6); },
          fail: function (x) {
            pay(x, -0.12); bump(x, 'boss', -1, -3, 3);
            x.add('Письмо прочитали и сделали вид, что его не было.', 'bad');
          }
        },
        {
          label: 'Искать работу параллельно', hint: 'тихо · разумно', w: 2.2,
          run: function (x) {
            pay(x, -0.12);
            x.add('Вы стали ходить на собеседования в обеденный перерыв.', 'work');
            if (x.rnd() < 0.45) { x.L.changeJob(); x.L.career.quit++; x.add('Через полгода вы ушли на место получше.', 'good'); }
          }
        },
        {
          label: 'Уйти сразу', hint: 'резко', w: 1,
          run: function (x) {
            x.L.career.quit++; x.L.job = null; x.L.unemployedYears = 0;
            x.add('Вы написали заявление в тот же день.', 'work');
          }
        },
        {
          label: 'Попросить вместо денег время', hint: 'четыре дня в неделю', w: 1.2,
          run: function (x) {
            pay(x, -0.14); x.L.job.overtime = 0; bump(x, 'burnout', -10);
            x.add('Вы выторговали короткую неделю вместо прежней зарплаты.', 'work');
            x.stat('bond', 3); x.stat('happy', 2);
          }
        }
      ]
    },

    {
      id: 'wc-late-work', work: true, age: [57, 72], once: true, needJob: false,
      cond: function (x) { return x.L.age >= 57; },
      title: 'Сколько ещё работать',
      text: function (x) {
        return 'Пенсия близко. Можно уйти сразу, можно держаться за место, пока берут.';
      },
      options: [
        {
          label: 'Доработать до пенсии и уйти', hint: 'как все', w: 3,
          run: function (x) { x.add('Вы решили доработать положенное и уйти.', 'life'); }
        },
        {
          label: 'Работать, сколько возьмут', hint: 'деньги + · здоровье −', w: 2,
          run: function (x) {
            x.L.retireLate = true; x.stat('health', -2);
            x.add('Вы решили работать, пока берут: пенсии на жизнь не хватит.', 'work');
          }
        },
        {
          label: 'Перейти на работу полегче', hint: 'меньше денег · дольше проживёте', w: 2.2,
          run: function (x) {
            x.L.changeJob();
            if (x.L.job) { x.L.job.overtime = 0; x.L.job.schedule = 'day'; x.L.job.boost = 0.85; }
            x.add('Вы перешли на работу полегче: сторожем, вахтёром, на подхвате.', 'work');
            x.stat('health', 2);
          }
        },
        {
          label: 'Уйти раньше', hint: 'свобода · меньше пенсия', w: 1.2,
          run: function (x) {
            x.flag('pensionCut', true); x.L.retired = true; x.L.job = null;
            x.add('Вы ушли с работы раньше срока, не доработав до полной пенсии.', 'life');
            x.stat('happy', 4);
          }
        },
        {
          label: 'Остаться наставником', hint: 'полставки · уважение', w: function (x) { return x.L.job && x.L.job.rep > 60 ? 1.8 : 0.4; },
          run: function (x) {
            pay(x, -0.2); bump(x, 'mood', 8); bump(x, 'rep', 4);
            x.add('Вас оставили на полставки учить молодых.', 'good');
            x.stat('happy', 5);
          }
        },
        {
          label: 'Начать своё маленькое дело', hint: 'на старости лет', w: 0.8,
          req: { money: function (x) { return x.need * 0.4; } },
          cost: { money: function (x) { return x.need * 0.4; } },
          run: function (x) {
            x.money(-x.need * 0.4); x.L.business = true;
            x.add('На склоне лет вы завели своё небольшое дело.', 'work');
            x.stat('happy', 5);
          }
        }
      ]
    }
  ];

  window.IN8B = window.IN8B || {};
  window.IN8B.work = { auto: WORK_AUTO, choices: WORK_CHOICES };
})();
