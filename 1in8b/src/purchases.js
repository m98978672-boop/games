/* ============================================================
   1 ИЗ 8 МИЛЛИАРДОВ — меню «Траты».
   ------------------------------------------------------------
   Отдельный магазин жизни: каждый год можно решить, на что
   потратить накопленное — от школьных тетрадей до своего кафе.
   Цены считаются в долях «стоимости года жизни» (need), то есть
   автоматически подстраиваются под страну и эпоху.
   Авто-жизни (соседи по секунде и тесты) сюда не заходят,
   поэтому статистика модели не меняется.
   ============================================================ */
(function () {
  'use strict';

  var M = window.IN8B.model;

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  var GROUPS = [
    { id: 'edu', icon: '📚', name: 'Учёба', hint: 'Знания работают всю жизнь: экзамены, работа, зарплата.' },
    { id: 'health', icon: '❤️', name: 'Здоровье', hint: 'Лечение и профилактика прямо снижают риск умереть.' },
    { id: 'home', icon: '🏠', name: 'Жильё', hint: 'Крыша над головой — счастье, здоровье детей и спокойный сон.' },
    { id: 'move', icon: '🚲', name: 'Дорога', hint: 'Как вы добираетесь до работы и далеко ли можете уехать.' },
    { id: 'work', icon: '💼', name: 'Работа и дело', hint: 'Вложения, которые повышают доход. И риск.' },
    { id: 'family', icon: '👪', name: 'Семья', hint: 'Близкие, дети и родители. Отношения дорожают с годами.' },
    { id: 'fun', icon: '🎉', name: 'Отдых', hint: 'То, ради чего всё остальное.' },
    { id: 'thing', icon: '📦', name: 'Вещи', hint: 'Быт, который тихо меняет здоровье и настроение.' },
    { id: 'give', icon: '🤝', name: 'Другим людям', hint: 'След, который останется после вас.' }
  ];

  /* ---------------------------- каталог ------------------------------ */
  /* cost — в долях need (годовой стоимости жизни в этой стране)
     up   — ежегодное содержание в долях need
     age  — [от, до]; once — только один раз за жизнь            */

  var ITEMS = [
    /* ------------------------------ учёба ----------------------------- */
    {
      id: 'school-kit', g: 'edu', icon: '✏️', title: 'Тетради, учебники, форма', cost: 0.06,
      age: [6, 18], gain: 'Знания +2 · Счастье +1',
      desc: 'Своя форма и полный набор тетрадей. Мелочь, из-за которой в школе не стыдно.',
      cond: function (L) { return L.edu.inSchool; },
      run: function (x) { x.stat('know', 2); x.stat('happy', 1); }
    },
    {
      id: 'tutor', g: 'edu', icon: '👩‍🏫', title: 'Репетитор на год', cost: 0.25,
      age: [7, 24], gain: 'Знания +5',
      desc: 'Человек, который объяснит то, что в классе проскочило мимо.',
      run: function (x) { x.stat('know', 5); }
    },
    {
      id: 'private-school', g: 'edu', icon: '🏫', title: 'Частная школа (год)', cost: 0.95,
      age: [6, 18], gain: 'Знания +7 · выше шанс доучиться',
      desc: 'Маленькие классы и учителя, которые помнят ваше имя.',
      cond: function (L) { return L.edu.inSchool; },
      run: function (x, L) { x.stat('know', 7); L.edu.private = true; }
    },
    {
      id: 'lang-course', g: 'edu', icon: '🗣', title: 'Курсы языка', cost: 0.3,
      age: [10, 70], gain: 'Знания +4 · проще уехать и найти работу',
      desc: 'Второй язык открывает двери, которых вы раньше не видели.',
      run: function (x, L) { x.stat('know', 4); L.flags.langs = true; }
    },
    {
      id: 'computer', g: 'edu', icon: '💻', title: 'Компьютер для учёбы', cost: 0.5,
      age: [8, 60], once: true, gain: 'Знания +4 · Счастье +3 · доход +3 %',
      desc: 'Учебники, курсы и работа — всё туда помещается.',
      run: function (x, L) { x.stat('know', 4); x.stat('happy', 3); L.incomeBoost = (L.incomeBoost || 1) * 1.03; }
    },
    {
      id: 'exam-prep', g: 'edu', icon: '📝', title: 'Подготовка к экзаменам', cost: 0.35,
      age: [14, 20], gain: 'Знания +6 · выше шанс поступить',
      desc: 'Год, когда решается, куда вас возьмут.',
      run: function (x, L) { x.stat('know', 6); L.flags.examPrep = true; }
    },
    {
      id: 'uni-fee', g: 'edu', icon: '🎓', title: 'Оплатить учёбу в университете', cost: 2.2,
      age: [16, 32], once: true, gain: 'Высшее образование · Знания +10',
      desc: 'Если не взяли на бюджет — можно заплатить. Для многих семей это долг на годы.',
      cond: function (L) { return L.edu.level >= 3 && L.edu.level < 5; },
      run: function (x, L) {
        L.edu.level = 5; x.stat('know', 10); x.stat('happy', 4);
        x.add('Вы оплатили учёбу и получили высшее образование.', 'good');
      }
    },
    {
      id: 'second-degree', g: 'edu', icon: '🧑‍🔬', title: 'Второе высшее или аспирантура', cost: 2.6,
      age: [22, 60], once: true, gain: 'Степень · Знания +8 · доход +8 %',
      desc: 'Долгая дорога, которая обычно окупается ближе к сорока.',
      cond: function (L) { return L.edu.level >= 5; },
      run: function (x, L) { L.edu.level = 6; x.stat('know', 8); L.incomeBoost = (L.incomeBoost || 1) * 1.08; }
    },
    {
      id: 'skill-course', g: 'edu', icon: '🛠', title: 'Курс новой профессии', cost: 0.5,
      age: [16, 65], gain: 'Знания +4 · доход +5 %',
      desc: 'Переучиться никогда не поздно — особенно когда старое ремесло умирает.',
      run: function (x, L) { x.stat('know', 4); L.incomeBoost = (L.incomeBoost || 1) * 1.05; }
    },

    /* ---------------------------- здоровье ---------------------------- */
    {
      id: 'checkup', g: 'health', icon: '🩺', title: 'Пройти обследование', cost: 0.12,
      gain: 'Здоровье +3 · болезнь найдут вовремя',
      desc: 'Самое дешёвое, что можно сделать для долгой жизни.',
      run: function (x, L) {
        x.stat('health', 3);
        if (L.has('untreated')) { L.flags.untreated = false; x.add('На обследовании нашли то, что вы терпели годами. Начали лечить.', 'good'); }
      }
    },
    {
      id: 'dentist', g: 'health', icon: '🦷', title: 'Вылечить зубы', cost: 0.18,
      age: [5, 110], gain: 'Здоровье +2 · Счастье +2',
      desc: 'Боль, о которой не говорят вслух, но которая портит каждый день.',
      run: function (x) { x.stat('health', 2); x.stat('happy', 2); }
    },
    {
      id: 'glasses', g: 'health', icon: '👓', title: 'Очки', cost: 0.1,
      age: [5, 110], once: true, gain: 'Знания +2 · Счастье +2',
      desc: 'Оказывается, у деревьев видны отдельные листья.',
      run: function (x, L) { L.flags.glasses = true; x.stat('know', 2); x.stat('happy', 2); }
    },
    {
      id: 'surgery', g: 'health', icon: '🏥', title: 'Операция и лечение', cost: 1.4,
      gain: 'Здоровье +12 · снимает хроническую болезнь',
      desc: 'Дорого, страшно и один раз. Зато потом живёте дальше.',
      cond: function (L) { return L.has('chronic') || L.has('untreated'); },
      run: function (x, L) {
        L.flags.chronic = false; L.flags.untreated = false;
        x.stat('health', 12); x.add('Операция прошла успешно.', 'good');
      }
    },
    {
      id: 'meds', g: 'health', icon: '💊', title: 'Лекарства на год', cost: 0.22,
      gain: 'Здоровье +4',
      desc: 'Курс, который нужно пить каждый день, не пропуская.',
      cond: function (L) { return L.has('chronic') || L.stats.health < 60; },
      run: function (x) { x.stat('health', 4); }
    },
    {
      id: 'insurance', g: 'health', icon: '🧾', title: 'Медицинская страховка', cost: 0.3,
      age: [16, 110], gain: 'Беда обойдётся дешевле',
      desc: 'Платите, пока здоровы, чтобы не разориться, когда заболеете.',
      run: function (x, L) { L.flags.insured = true; x.stat('happy', 2); }
    },
    {
      id: 'gym-sub', g: 'health', icon: '🏋️', title: 'Абонемент в зал или бассейн', cost: 0.22,
      age: [12, 85], gain: 'Здоровье +4 · Счастье +2',
      desc: 'Тело, которое двигается, живёт дольше.',
      run: function (x) { x.stat('health', 4); x.stat('happy', 2); }
    },
    {
      id: 'quit-smoking', g: 'health', icon: '🚭', title: 'Программа «бросить курить»', cost: 0.3,
      gain: 'Бросаете курить · Здоровье +5',
      desc: 'Пластыри, врач и несколько очень трудных недель.',
      cond: function (L) { return L.has('smoker'); },
      run: function (x, L) { L.flags.smoker = false; x.stat('health', 5); x.add('Вы бросили курить.', 'good'); }
    },
    {
      id: 'therapy', g: 'health', icon: '🛋', title: 'Психотерапия', cost: 0.45,
      age: [10, 110], gain: 'Счастье +7 · Отношения +3',
      desc: 'Разговор раз в неделю с тем, кто умеет слушать.',
      run: function (x, L) {
        x.stat('happy', 7); x.stat('bond', 3);
        if (L.has('addiction') && L.rnd() < 0.45) { L.flags.addiction = false; x.add('Вы справились с зависимостью.', 'good'); }
      }
    },
    {
      id: 'maternity', g: 'health', icon: '🤱', title: 'Роды в хорошей клинике', cost: 0.7,
      age: [16, 48], gain: 'Здоровье +5 · ребёнок крепче',
      desc: 'Там, где рядом врач, риск для матери и ребёнка в разы ниже.',
      cond: function (L) { return L.sex === 'f' && (L.marital === 'married' || L.marital === 'partner'); },
      run: function (x, L) { x.stat('health', 5); L.flags.safeBirth = true; }
    },

    /* ----------------------------- жильё ------------------------------ */
    {
      id: 'rent-room', g: 'home', icon: '🚪', title: 'Снять комнату', cost: 0.25, up: 0.3,
      age: [15, 110], once: true, gain: 'Счастье +3 · своя жизнь',
      desc: 'Первое жильё, где никто не стоит над душой.',
      cond: function (L) { return !L.home; },
      run: function (x) { x.stat('happy', 3); }
    },
    {
      id: 'rent-flat', g: 'home', icon: '🏢', title: 'Снять квартиру', cost: 0.4, up: 0.6,
      age: [17, 110], once: true, gain: 'Счастье +5 · Здоровье +2',
      desc: 'Отдельная кухня, горячая вода и дверь, которая закрывается.',
      cond: function (L) { return !L.home; },
      run: function (x) { x.stat('happy', 5); x.stat('health', 2); }
    },
    {
      id: 'house-down', g: 'home', icon: '🔑', title: 'Первый взнос за своё жильё', cost: 3.0,
      age: [20, 75], once: true, gain: 'Своё жильё · Счастье +9 · ипотека',
      desc: 'Половину жизни будете платить, зато это ваш дом.',
      cond: function (L) { return !L.home; },
      run: function (x, L) {
        L.home = true; L.flags.mortgage = true; x.stat('happy', 9); x.stat('health', 2);
        x.add('Вы купили своё жильё. Начались выплаты по ипотеке.', 'good');
      }
    },
    {
      id: 'renovation', g: 'home', icon: '🪚', title: 'Ремонт', cost: 0.8,
      gain: 'Счастье +6 · Здоровье +2',
      desc: 'Стены без плесени и окна, которые закрываются.',
      cond: function (L) { return L.home; },
      run: function (x) { x.stat('happy', 6); x.stat('health', 2); }
    },
    {
      id: 'furniture', g: 'home', icon: '🛋', title: 'Мебель', cost: 0.35,
      gain: 'Счастье +4',
      desc: 'Кровать, стол и шкаф вместо коробок.',
      run: function (x) { x.stat('happy', 4); }
    },
    {
      id: 'water-power', g: 'home', icon: '🚰', title: 'Вода и электричество в дом', cost: 0.7,
      once: true, gain: 'Здоровье +6 · Счастье +4',
      desc: 'Не носить воду вёдрами — это часы жизни каждый день.',
      cond: function (L) { return L.c.gdp < 16000; },
      run: function (x) { x.stat('health', 6); x.stat('happy', 4); }
    },
    {
      id: 'land', g: 'home', icon: '🌾', title: 'Участок земли', cost: 1.2,
      age: [18, 90], once: true, gain: 'Еда своя · доход +4 %',
      desc: 'Свой огород кормит в любой кризис.',
      cond: function (L) { return !L.urban || L.c.gdp < 9000; },
      run: function (x, L) { L.incomeBoost = (L.incomeBoost || 1) * 1.04; x.stat('health', 3); x.stat('happy', 3); }
    },
    {
      id: 'climate', g: 'home', icon: '🔥', title: 'Отопление или кондиционер', cost: 0.45, up: 0.04,
      once: true, gain: 'Здоровье +4 · Счастье +3',
      desc: 'Зимой не мёрзнуть, летом не плавиться.',
      run: function (x) { x.stat('health', 4); x.stat('happy', 3); }
    },

    /* ----------------------------- дорога ----------------------------- */
    {
      id: 'bike', g: 'move', icon: '🚲', title: 'Велосипед', cost: 0.12,
      age: [6, 80], once: true, gain: 'Здоровье +3 · Счастье +2',
      desc: 'Полчаса пешком превращаются в десять минут.',
      run: function (x) { x.stat('health', 3); x.stat('happy', 2); }
    },
    {
      id: 'license', g: 'move', icon: '🪪', title: 'Водительские права', cost: 0.2,
      age: [16, 70], once: true, gain: 'Доступны машина и работа за рулём',
      desc: 'Корочка, которая иногда и есть профессия.',
      run: function (x, L) { L.flags.license = true; }
    },
    {
      id: 'moto', g: 'move', icon: '🛵', title: 'Мотоцикл или мопед', cost: 0.6, up: 0.04,
      age: [16, 70], once: true, gain: 'Доход +5 % · риск на дороге выше',
      desc: 'В половине мира это главный транспорт семьи.',
      run: function (x, L) { L.incomeBoost = (L.incomeBoost || 1) * 1.05; L.flags.moto = true; x.stat('happy', 3); }
    },
    {
      id: 'used-car', g: 'move', icon: '🚗', title: 'Подержанная машина', cost: 1.6, up: 0.08,
      age: [17, 85], once: true, gain: 'Доход +6 % · Счастье +5',
      desc: 'Бегает, но каждый год что-то отваливается.',
      cond: function (L) { return L.flags.license; },
      run: function (x, L) { L.incomeBoost = (L.incomeBoost || 1) * 1.06; x.stat('happy', 5); }
    },
    {
      id: 'new-car', g: 'move', icon: '🚙', title: 'Новая машина', cost: 3.4, up: 0.1,
      age: [20, 85], once: true, gain: 'Счастье +9 · Доход +8 %',
      desc: 'Запах нового салона и зависть соседей.',
      cond: function (L) { return L.flags.license; },
      run: function (x, L) { L.incomeBoost = (L.incomeBoost || 1) * 1.08; x.stat('happy', 9); }
    },
    {
      id: 'city-move', g: 'move', icon: '🚌', title: 'Переехать в город', cost: 0.5,
      age: [15, 70], once: true, gain: 'Город · доход +10 %',
      desc: 'Там больше работы и больше одиночества.',
      cond: function (L) { return !L.urban; },
      run: function (x, L) {
        L.urban = true; L.moves++; L.incomeBoost = (L.incomeBoost || 1) * 1.1;
        x.stat('bond', -4); x.add('Вы перебрались в город.', 'life');
      }
    },
    {
      id: 'abroad-ticket', g: 'move', icon: '✈️', title: 'Виза и билет в другую страну', cost: 2.5,
      age: [17, 70], once: true, gain: 'Работа за границей · доход ×2 · Отношения −8',
      desc: 'Другая страна, другой язык и фотографии родных в телефоне.',
      cond: function (L) { return !L.abroad; },
      run: function (x, L) {
        L.abroad = true; L.moves++; x.stat('bond', -8); x.stat('happy', 2);
        x.add('Вы уехали работать за границу.', 'life');
      }
    },

    /* ------------------------- работа и дело -------------------------- */
    {
      id: 'tools', g: 'work', icon: '🧰', title: 'Хороший инструмент', cost: 0.3,
      age: [14, 90], gain: 'Доход +5 %',
      desc: 'Своя ножовка, своя машинка, свой набор ключей.',
      cond: function (L) { return !!L.job; },
      run: function (x, L) { L.incomeBoost = (L.incomeBoost || 1) * 1.05; }
    },
    {
      id: 'machine', g: 'work', icon: '⚙️', title: 'Станок или швейная машина', cost: 0.9,
      age: [16, 90], once: true, gain: 'Доход +10 %',
      desc: 'Теперь вы не продаёте время, а продаёте изделия.',
      run: function (x, L) { L.incomeBoost = (L.incomeBoost || 1) * 1.1; }
    },
    {
      id: 'small-shop', g: 'work', icon: '🏪', title: 'Открыть маленькую лавку', cost: 2.5,
      age: [18, 75], once: true, gain: 'Своё дело · доход +25 %',
      desc: 'Половина таких лавок закрывается за три года. Вторая половина кормит семью.',
      cond: function (L) { return !L.business; },
      run: function (x, L) {
        L.business = true; x.stat('happy', 6);
        x.add('Вы открыли своё дело.', 'good');
      }
    },
    {
      id: 'cafe', g: 'work', icon: '🍲', title: 'Кафе или мастерская', cost: 4.0,
      age: [20, 70], once: true, gain: 'Дело побольше · доход +35 % · риск',
      desc: 'Больше вложений, больше выручка и ни одного выходного.',
      cond: function (L) { return L.business; },
      run: function (x, L) {
        if (L.rnd() < 0.3) {
          L.incomeBoost = (L.incomeBoost || 1) * 0.95; x.stat('happy', -6);
          x.add('Кафе не пошло: место оказалось неудачным.', 'bad');
        } else {
          L.incomeBoost = (L.incomeBoost || 1) * 1.35; x.stat('happy', 5);
          x.add('Кафе работает и приносит деньги.', 'good');
        }
      }
    },
    {
      id: 'truck', g: 'work', icon: '🚚', title: 'Грузовик для дела', cost: 3.2, up: 0.12,
      age: [20, 70], once: true, gain: 'Доход +20 %',
      desc: 'Свой транспорт — это свои цены.',
      cond: function (L) { return L.business || !!L.flags.license; },
      run: function (x, L) { L.incomeBoost = (L.incomeBoost || 1) * 1.2; }
    },
    {
      id: 'expand', g: 'work', icon: '📈', title: 'Расширить дело', cost: 2.0,
      age: [20, 80], gain: 'Доход +15 %',
      desc: 'Второй прилавок, наёмный работник, новая вывеска.',
      cond: function (L) { return L.business; },
      run: function (x, L) { L.incomeBoost = (L.incomeBoost || 1) * 1.15; }
    },
    {
      id: 'ads', g: 'work', icon: '📣', title: 'Реклама', cost: 0.5,
      gain: 'Доход +6 %',
      desc: 'О вас узнают те, кто проходил мимо.',
      cond: function (L) { return L.business; },
      run: function (x, L) { L.incomeBoost = (L.incomeBoost || 1) * 1.06; }
    },
    {
      id: 'license-biz', g: 'work', icon: '📜', title: 'Лицензия и регистрация', cost: 0.4,
      once: true, gain: 'Доход +8 % · без штрафов',
      desc: 'Выйти из тени дорого, но спокойнее.',
      cond: function (L) { return L.business; },
      run: function (x, L) { L.incomeBoost = (L.incomeBoost || 1) * 1.08; L.flags.legal = true; x.stat('happy', 2); }
    },
    {
      id: 'deposit', g: 'work', icon: '🏦', title: 'Положить деньги под процент', cost: 1.0,
      age: [18, 95], gain: 'Сбережения растут сами',
      desc: 'Скучно, но в старости именно это и спасает.',
      run: function (x, L) { L.flags.deposit = true; L.depositYears = (L.depositYears || 0) + 1; x.money(L.need * 0.06); }
    },

    /* ----------------------------- семья ------------------------------ */
    {
      id: 'wedding-party', g: 'family', icon: '💍', title: 'Свадебный праздник', cost: 1.8,
      once: true, gain: 'Отношения +10 · Счастье +8',
      desc: 'Во многих странах на это уходит несколько годовых доходов семьи.',
      cond: function (L) { return L.marital === 'married' || L.marital === 'partner'; },
      run: function (x) { x.stat('bond', 10); x.stat('happy', 8); }
    },
    {
      id: 'baby-kit', g: 'family', icon: '🍼', title: 'Коляска и детские вещи', cost: 0.35,
      gain: 'Отношения +4 · Здоровье ребёнка',
      desc: 'Всё то, чего не было у вас.',
      cond: function (L) { return L.children.length > 0; },
      run: function (x) { x.stat('bond', 4); x.stat('happy', 2); }
    },
    {
      id: 'kindergarten', g: 'family', icon: '🧸', title: 'Детский сад', cost: 0.5,
      gain: 'Счастье +3 · можно работать',
      desc: 'Пока ребёнок в саду, вы на работе.',
      cond: function (L) { return L.children.some(function (k) { return L.age - k.bornAt < 7; }); },
      run: function (x, L) { x.stat('happy', 3); L.incomeBoost = (L.incomeBoost || 1) * 1.04; }
    },
    {
      id: 'kid-club', g: 'family', icon: '🎻', title: 'Кружок для ребёнка', cost: 0.25,
      gain: 'Отношения +4 · у ребёнка талант',
      desc: 'Музыка, футбол или рисование — то, что он запомнит навсегда.',
      cond: function (L) { return L.children.some(function (k) { return L.age - k.bornAt >= 5 && L.age - k.bornAt < 17; }); },
      run: function (x) { x.stat('bond', 4); x.stat('happy', 2); }
    },
    {
      id: 'kid-uni', g: 'family', icon: '🎓', title: 'Выучить ребёнка в вузе', cost: 2.4,
      once: true, gain: 'Отношения +8 · дети пойдут дальше вас',
      desc: 'Самая частая причина, по которой родители всю жизнь экономят.',
      cond: function (L) { return L.children.some(function (k) { return L.age - k.bornAt >= 17; }); },
      run: function (x, L) { L.kidsEducated = true; x.stat('bond', 8); x.stat('happy', 6); }
    },
    {
      id: 'help-parents', g: 'family', icon: '👵', title: 'Помочь родителям', cost: 0.45,
      gain: 'Отношения +6',
      desc: 'Деньги, которые отправляют домой каждый месяц.',
      cond: function (L) { return L.parentsAlive > 0 && L.age >= 16; },
      run: function (x) { x.stat('bond', 6); x.stat('happy', 2); }
    },
    {
      id: 'elder-care', g: 'family', icon: '🧓', title: 'Уход за пожилыми родителями', cost: 0.9,
      age: [28, 90], gain: 'Отношения +8 · родители проживут дольше',
      desc: 'Сиделка, лекарства и спокойная старость для тех, кто вырастил вас.',
      cond: function (L) { return L.parentsAlive > 0; },
      run: function (x, L) { x.stat('bond', 8); L.flags.careGiven = true; }
    },
    {
      id: 'gift-partner', g: 'family', icon: '🎁', title: 'Подарок близкому человеку', cost: 0.15,
      gain: 'Отношения +5 · Счастье +3',
      desc: 'Без повода — работает лучше всего.',
      cond: function (L) { return !!L.partner || L.children.length > 0; },
      run: function (x) { x.stat('bond', 5); x.stat('happy', 3); }
    },

    /* ----------------------------- отдых ------------------------------ */
    {
      id: 'seaside', g: 'fun', icon: '🏖', title: 'Поездка к морю', cost: 0.6,
      gain: 'Счастье +8 · Здоровье +2',
      desc: 'Две недели, которые помнишь годами.',
      run: function (x) { x.stat('happy', 8); x.stat('health', 2); }
    },
    {
      id: 'abroad-trip', g: 'fun', icon: '🗺', title: 'Путешествие за границу', cost: 1.4,
      age: [14, 95], gain: 'Счастье +12 · Знания +3',
      desc: 'Увидеть, что люди живут совсем иначе — и всё равно так же.',
      run: function (x) { x.stat('happy', 12); x.stat('know', 3); }
    },
    {
      id: 'cinema', g: 'fun', icon: '🍿', title: 'Кино и кафе', cost: 0.08,
      gain: 'Счастье +3 · Отношения +2',
      desc: 'Обычный вечер, из которых и состоит жизнь.',
      run: function (x) { x.stat('happy', 3); x.stat('bond', 2); }
    },
    {
      id: 'hobby', g: 'fun', icon: '🎸', title: 'Хобби: музыка, краски, спорт', cost: 0.3,
      gain: 'Счастье +6 · может открыться талант',
      desc: 'Дело, за которое не платят, но ради которого встаёшь утром.',
      run: function (x, L) {
        x.stat('happy', 6);
        if (!L.talents.length && L.rnd() < 0.25) {
          var t = ['музыка', 'рисование', 'спорт', 'слово'][Math.floor(L.rnd() * 4)];
          L.talents.push(t); x.add('У вас обнаружился талант: ' + t + '.', 'good');
        }
      }
    },
    {
      id: 'books', g: 'fun', icon: '📖', title: 'Книги', cost: 0.1,
      gain: 'Знания +3 · Счастье +2',
      desc: 'Самое дешёвое из всего, что меняет человека.',
      run: function (x) { x.stat('know', 3); x.stat('happy', 2); }
    },
    {
      id: 'pet', g: 'fun', icon: '🐕', title: 'Домашний питомец', cost: 0.3, up: 0.03,
      once: true, gain: 'Счастье +7 · Отношения +3',
      desc: 'Кто-то, кто рад вам каждый вечер.',
      run: function (x) { x.stat('happy', 7); x.stat('bond', 3); }
    },
    {
      id: 'party', g: 'fun', icon: '🎊', title: 'Праздник для своих', cost: 0.4,
      gain: 'Отношения +7 · Счастье +5',
      desc: 'Двор, стол и все, кто дорог.',
      run: function (x) { x.stat('bond', 7); x.stat('happy', 5); }
    },

    /* ------------------------------ вещи ------------------------------ */
    {
      id: 'phone', g: 'thing', icon: '📱', title: 'Телефон', cost: 0.25,
      once: true, gain: 'Отношения +4 · Счастье +3',
      desc: 'Связь с теми, кто далеко, и работа, которая помещается в карман.',
      run: function (x) { x.stat('bond', 4); x.stat('happy', 3); }
    },
    {
      id: 'tv', g: 'thing', icon: '📺', title: 'Телевизор', cost: 0.3,
      once: true, gain: 'Счастье +4',
      desc: 'Вечер у экрана всей семьёй.',
      run: function (x) { x.stat('happy', 4); }
    },
    {
      id: 'fridge', g: 'thing', icon: '🧊', title: 'Холодильник', cost: 0.4,
      once: true, gain: 'Здоровье +4 · Счастье +2',
      desc: 'Еда перестаёт портиться — и это сразу видно по здоровью детей.',
      run: function (x) { x.stat('health', 4); x.stat('happy', 2); }
    },
    {
      id: 'washer', g: 'thing', icon: '🧺', title: 'Стиральная машина', cost: 0.45,
      once: true, gain: 'Счастье +5 · Здоровье +1',
      desc: 'Машина, которая вернула женщинам миллиарды часов жизни.',
      run: function (x) { x.stat('happy', 5); x.stat('health', 1); }
    },
    {
      id: 'stove', g: 'thing', icon: '🍳', title: 'Плита и чистое топливо', cost: 0.35,
      once: true, gain: 'Здоровье +6',
      desc: 'Готовить не на открытом огне — значит не дышать дымом каждый день.',
      cond: function (L) { return L.c.gdp < 18000; },
      run: function (x) { x.stat('health', 6); x.stat('happy', 2); }
    },
    {
      id: 'solar', g: 'thing', icon: '🔆', title: 'Солнечная панель', cost: 0.8,
      once: true, gain: 'Счастье +3 · содержание дома дешевле',
      desc: 'Свет по вечерам там, где сеть выключают.',
      run: function (x, L) { x.stat('happy', 3); L.upkeep = Math.max(0, (L.upkeep || 0) - 0.03); }
    },

    /* --------------------------- другим людям -------------------------- */
    {
      id: 'charity', g: 'give', icon: '🤲', title: 'Пожертвование', cost: 0.3,
      gain: 'Счастье +5',
      desc: 'Деньги, которые вы никогда не увидите обратно.',
      run: function (x, L) {
        x.stat('happy', 5); L.given = (L.given || 0) + 1;
        if (L.given >= 3 && !L.legacy) L.legacy = 'помощь тем, кому было труднее';
      }
    },
    {
      id: 'help-neighbors', g: 'give', icon: '🏘', title: 'Помочь соседям', cost: 0.15,
      gain: 'Отношения +5',
      desc: 'Там, где нет государства, есть соседи.',
      run: function (x) { x.stat('bond', 5); x.stat('happy', 2); }
    },
    {
      id: 'scholarship', g: 'give', icon: '🎒', title: 'Выучить чужого ребёнка', cost: 1.0,
      age: [30, 100], gain: 'След в чужой жизни',
      desc: 'Кто-то станет врачом, потому что вы заплатили за его школу.',
      run: function (x, L) { x.stat('happy', 6); L.legacy = 'выученный вами ребёнок из чужой семьи'; }
    },
    {
      id: 'temple', g: 'give', icon: '🕯', title: 'Вклад в общину или храм', cost: 0.4,
      gain: 'Отношения +4 · Счастье +4',
      desc: 'Место, где вас знают по имени.',
      run: function (x) { x.stat('bond', 4); x.stat('happy', 4); }
    },
    {
      id: 'tree-garden', g: 'give', icon: '🌳', title: 'Сад или колодец для района', cost: 0.5,
      age: [25, 100], gain: 'Останется после вас',
      desc: 'Деревья, под которыми будут сидеть те, кого вы не увидите.',
      run: function (x, L) { x.stat('happy', 4); L.legacy = L.legacy || 'сад, который вы посадили для всех'; }
    }
  ];

  var BY_ID = {};
  ITEMS.forEach(function (it) { BY_ID[it.id] = it; });

  /* ---------------------------- механика ----------------------------- */

  function priceOf(life, item) {
    var base = life.need * item.cost;
    /* в бедных странах крупная техника и поездки стоят дороже относительно жизни */
    if (item.cost >= 1 && life.c.gdp < 6000) base *= 1.35;
    return Math.round(base);
  }

  function upkeepOf(life, item) { return item.up ? Math.round(life.need * item.up) : 0; }

  function state(life, item) {
    var a = life.age;
    if (item.age && (a < item.age[0] || a > item.age[1])) {
      return { ok: false, why: a < item.age[0] ? 'Не тот возраст: с ' + item.age[0] + ' лет' : 'Уже не по возрасту' };
    }
    if (!item.age && a < 5) return { ok: false, why: 'Пока за вас решают родители' };
    if (item.once && life.purchased && life.purchased[item.id]) {
      return { ok: false, why: 'Уже есть (куплено в ' + life.purchased[item.id] + ' лет)' };
    }
    if (life.boughtThisYear && life.boughtThisYear[item.id]) return { ok: false, why: 'Уже оплачено в этом году' };
    if (item.cond) {
      var ok = false;
      try { ok = !!item.cond(life); } catch (e) { ok = false; }
      if (!ok) return { ok: false, why: 'Сейчас недоступно' };
    }
    var price = priceOf(life, item);
    if (life.money - price < -life.need * 2) return { ok: false, why: 'Не хватает даже в долг', price: price, poor: true };
    return { ok: true, price: price, debt: life.money < price };
  }

  function availableFor(life) {
    return ITEMS.filter(function (it) { return state(life, it).ok; });
  }

  function buy(life, id) {
    var item = BY_ID[id];
    if (!item) return { ok: false, why: 'Нет такой траты' };
    var st = state(life, item);
    if (!st.ok) return st;
    var price = st.price;

    life.money -= price;
    life.spentTotal = (life.spentTotal || 0) + price;
    life.purchased = life.purchased || {};
    life.boughtThisYear = life.boughtThisYear || {};
    life.purchased[item.id] = life.age;
    life.boughtThisYear[item.id] = true;
    if (item.up) life.upkeep = (life.upkeep || 0) + item.up;

    var x = life.ctx();
    var before = life.log.length;
    try { if (item.run) item.run(x, life); } catch (e) { /* трата не должна ломать жизнь */ }
    if (life.log.length === before) {
      life.add('Трата: ' + item.title.toLowerCase() + '.', 'money');
    }
    return { ok: true, price: price, debt: st.debt };
  }

  /* сколько потрачено в этом году через меню */
  function spentThisYear(life) {
    var sum = 0;
    Object.keys(life.boughtThisYear || {}).forEach(function (id) {
      if (BY_ID[id]) sum += priceOf(life, BY_ID[id]);
    });
    return sum;
  }

  function ownedList(life) {
    return Object.keys(life.purchased || {}).map(function (id) {
      return { item: BY_ID[id], age: life.purchased[id] };
    }).filter(function (o) { return o.item; });
  }

  window.IN8B = window.IN8B || {};
  window.IN8B.purchases = {
    groups: GROUPS,
    list: ITEMS,
    byId: BY_ID,
    priceOf: priceOf,
    upkeepOf: upkeepOf,
    state: state,
    availableFor: availableFor,
    buy: buy,
    spentThisYear: spentThisYear,
    owned: ownedList,
    count: ITEMS.length
  };
  void clamp; void M;
})();
