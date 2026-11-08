/* ============================================================
   1 ИЗ 8 МИЛЛИАРДОВ — сто вариаций жизни.
   ------------------------------------------------------------
   Две жизни в одной стране, в один год, с одним достатком всё
   равно будут разными. Вариация — это то, с чем человек
   родился или что случилось с ним так рано, что стало частью
   его самого: близнец, левша, астма, война за окном, отец на
   заработках, бабушкин дом, детдом, музыкальный слух.

   У каждой вариации:
     id, name — имя в карточке человека;
     tag      — группа (тело, семья, место, время, характер, случай);
     w(L)     — вес жребия: насколько она вероятна в этой стране,
                в этом году и в этой семье (0 — невозможна);
     apply(L) — что она меняет при рождении;
     note     — строка в летопись (не у всех).

   Каждая жизнь получает от одной до четырёх вариаций — они
   видны в карточке человека и в итогах жизни.
   ============================================================ */
(function () {
  'use strict';

  var M = window.IN8B.model;
  var clamp = M.clamp;

  function poor(c) { return c.gdp < 7000; }
  function mid(c) { return c.gdp >= 7000 && c.gdp <= 28000; }
  function rich(c) { return c.gdp > 28000; }
  function old(L) { return L.birthYear < 1980; }

  var VARS = [];
  /* V(id, имя, группа, вес, что делает, строка в летопись) */
  function V(id, name, tag, w, apply, note) {
    VARS.push({ id: id, name: name, tag: tag, w: w, apply: apply, note: note });
  }
  function st(L, k, d) { L.stats[k] = clamp(L.stats[k] + d, 0, 100); }

  /* ========================= ТЕЛО И ЗДОРОВЬЕ (20) ===================== */

  V('twin', 'Близнец', 'тело', function () { return 1.3; }, function (L) {
    L.siblings += 1; st(L, 'bond', 6); st(L, 'health', -2);
  }, 'Вы родились вторым из двойни — на четыре минуты позже.');

  V('preterm', 'Родились раньше срока', 'тело', function (L) { return poor(L.c) ? 2.2 : 1.2; }, function (L) {
    st(L, 'health', -8); L.flag('fragile', true);
  }, 'Вы родились раньше срока и первые недели провели в больнице.');

  V('big-baby', 'Крупный ребёнок', 'тело', function () { return 1.2; }, function (L) { st(L, 'health', 4); });

  V('lefty', 'Левша', 'тело', function () { return 1.1; }, function (L) { st(L, 'know', 2); },
    'Вы левша — в школе это долго считали недостатком.');

  V('tall', 'Высокий рост', 'тело', function () { return 1; }, function (L) { st(L, 'happy', 2); L.flag('tall', true); });

  V('small', 'Маленький рост', 'тело', function () { return 1; }, function (L) { st(L, 'happy', -1.5); });

  V('strong', 'Крепкое здоровье', 'тело', function () { return 1.4; }, function (L) { st(L, 'health', 9); L.flag('strong', true); });

  V('asthma', 'Астма', 'тело', function (L) { return L.urban ? 1.4 : 0.6; }, function (L) {
    st(L, 'health', -6); L.flag('chronic', true);
  }, 'С детства астма: ингалятор всегда в кармане.');

  V('allergy', 'Аллергия', 'тело', function (L) { return rich(L.c) ? 1.6 : 0.8; }, function (L) { st(L, 'health', -3); });

  V('glasses-early', 'Очки с детства', 'тело', function () { return 1.2; }, function (L) {
    L.flag('glasses', true); st(L, 'know', 2); st(L, 'happy', -1);
  });

  V('deaf-ear', 'Плохо слышит одним ухом', 'тело', function () { return 0.7; }, function (L) { st(L, 'know', -2); st(L, 'bond', -2); });

  V('birthmark', 'Заметная примета', 'тело', function () { return 0.9; }, function (L) { st(L, 'happy', -2); st(L, 'bond', -1); });

  V('sweet-tooth', 'Сладкоежка', 'тело', function () { return 1; }, function (L) { st(L, 'happy', 2); st(L, 'health', -2); });

  V('early-walk', 'Рано пошёл', 'тело', function () { return 1; }, function (L) { st(L, 'health', 2); st(L, 'know', 1); });

  V('late-talk', 'Поздно заговорил', 'тело', function () { return 1; }, function (L) { st(L, 'know', -3); st(L, 'bond', -1); });

  V('sport-kid', 'Спортивная секция', 'тело', function (L) { return rich(L.c) ? 1.8 : poor(L.c) ? 0.5 : 1.1; }, function (L) {
    st(L, 'health', 7); st(L, 'bond', 3); L.flag('sport', true);
  }, 'Вас отдали в секцию, и тренировки стали половиной детства.');

  V('sick-child', 'Болезненное детство', 'тело', function (L) { return poor(L.c) ? 2 : 1; }, function (L) {
    st(L, 'health', -7); st(L, 'know', 2);
  }, 'Вы часто болели и много времени проводили дома с книгами.');

  V('scar', 'Шрам с детства', 'тело', function () { return 1; }, function (L) { st(L, 'health', -1); L.flag('scar', true); });

  V('left-handed-skill', 'Хорошая координация', 'тело', function () { return 1; }, function (L) { st(L, 'health', 3); st(L, 'know', 1); });

  V('vaccine-miss', 'Без прививок', 'тело', function (L) { return poor(L.c) ? 1.8 : 0.3; }, function (L) {
    st(L, 'health', -5); L.flag('noVaccine', true);
  });

  /* ============================== СЕМЬЯ (20) ========================== */

  V('only-child', 'Единственный ребёнок', 'семья', function (L) { return L.siblings === 0 ? 2 : 0.2; }, function (L) {
    st(L, 'know', 3); st(L, 'bond', -2); L.famPct = clamp(L.famPct + 0.05, 0, 1);
  });

  V('many-kids', 'Многодетная семья', 'семья', function (L) { return L.siblings >= 3 ? 2.5 : 0.4; }, function (L) {
    st(L, 'bond', 6); L.famPct = clamp(L.famPct - 0.07, 0, 1);
  }, 'Детей в доме было много, а комнат мало.');

  V('eldest', 'Старший ребёнок', 'семья', function (L) { return L.siblings > 0 ? 1.8 : 0; }, function (L) {
    st(L, 'know', 2); st(L, 'happy', -1); L.flag('eldest', true);
  }, 'Вы старший: младшие всегда были на вас.');

  V('youngest', 'Младший ребёнок', 'семья', function (L) { return L.siblings > 0 ? 1.8 : 0; }, function (L) {
    st(L, 'happy', 3); st(L, 'know', -1);
  });

  V('divorce-parents', 'Родители развелись', 'семья', function (L) { return rich(L.c) ? 1.8 : 1; }, function (L) {
    st(L, 'happy', -6); st(L, 'bond', -3); L.flag('parentsSplit', true);
  }, 'Родители развелись, когда вы были маленьким.');

  V('father-away', 'Отец на заработках', 'семья', function (L) { return poor(L.c) || mid(L.c) ? 2 : 0.5; }, function (L) {
    st(L, 'bond', -3); L.famPct = clamp(L.famPct + 0.06, 0, 1);
  }, 'Отец уехал на заработки и появлялся раз в год.');

  V('mother-away', 'Мать работает за границей', 'семья', function (L) { return poor(L.c) ? 1.4 : 0.4; }, function (L) {
    st(L, 'bond', -4); st(L, 'happy', -3); L.famPct = clamp(L.famPct + 0.08, 0, 1);
  });

  V('granny-raised', 'Растила бабушка', 'семья', function (L) { return poor(L.c) || mid(L.c) ? 1.8 : 0.8; }, function (L) {
    st(L, 'bond', 5); st(L, 'know', -1); st(L, 'happy', 2);
  }, 'Вас растила бабушка — её голос вы будете слышать всю жизнь.');

  V('orphan', 'Детский дом', 'семья', function (L) { return poor(L.c) ? 0.8 : 0.4; }, function (L) {
    L.parentsAlive = 0; st(L, 'bond', -8); st(L, 'happy', -8); L.famPct = clamp(L.famPct - 0.25, 0.02, 1);
  }, 'Вы росли в детском доме.');

  V('adopted', 'Приёмная семья', 'семья', function (L) { return rich(L.c) ? 0.8 : 0.4; }, function (L) {
    st(L, 'bond', 2); st(L, 'happy', -2); L.flag('adopted', true);
  }, 'Вас усыновили в раннем детстве.');

  V('rich-family', 'Состоятельная семья', 'семья', function (L) { return L.famPct > 0.75 ? 2 : 0.2; }, function (L) {
    L.famPct = clamp(L.famPct + 0.12, 0, 1); st(L, 'know', 4); st(L, 'health', 3);
  });

  V('poor-family', 'Совсем бедная семья', 'семья', function (L) { return L.famPct < 0.25 ? 2.2 : 0.2; }, function (L) {
    L.famPct = clamp(L.famPct - 0.1, 0.02, 1); st(L, 'health', -4); st(L, 'know', -3);
  }, 'Денег в доме не было никогда — это было нормой.');

  V('family-business', 'Семейное дело', 'семья', function (L) { return !rich(L.c) ? 1.4 : 1; }, function (L) {
    st(L, 'know', 3); L.flag('familyBiz', true);
  }, 'У семьи была своя лавка, и вы выросли за прилавком.');

  V('military-family', 'Военная семья', 'семья', function () { return 0.9; }, function (L) {
    st(L, 'health', 2); st(L, 'bond', -2); L.flag('moved', true);
  }, 'Семья переезжала каждые три года — новые школы, новые дворы.');

  V('teacher-family', 'Учительская семья', 'семья', function () { return 1; }, function (L) {
    st(L, 'know', 6); L.famPct = clamp(L.famPct - 0.03, 0, 1);
  });

  V('doctor-family', 'Семья врачей', 'семья', function (L) { return rich(L.c) || mid(L.c) ? 1 : 0.5; }, function (L) {
    st(L, 'know', 5); st(L, 'health', 4);
  });

  V('drinking-home', 'Пьющий дом', 'семья', function (L) { return poor(L.c) || mid(L.c) ? 1.6 : 1; }, function (L) {
    st(L, 'happy', -7); st(L, 'health', -3); L.flag('hardHome', true);
  }, 'Дома пили. Вы рано научились быть незаметным.');

  V('strict-home', 'Строгие родители', 'семья', function () { return 1.3; }, function (L) {
    st(L, 'know', 3); st(L, 'happy', -3);
  });

  V('warm-home', 'Тёплый дом', 'семья', function () { return 1.5; }, function (L) {
    st(L, 'happy', 7); st(L, 'bond', 6);
  }, 'Дом был тёплым: вас ждали и вам верили.');

  V('grandparents-near', 'Бабушки и дедушки рядом', 'семья', function () { return 1.4; }, function (L) {
    st(L, 'bond', 4); st(L, 'health', 2);
  });

  /* =============================== МЕСТО (16) ========================= */

  V('capital-born', 'Родились в столице', 'место', function (L) { return L.urban ? 1.6 : 0; }, function (L) {
    st(L, 'know', 4); L.famPct = clamp(L.famPct + 0.05, 0, 1);
  });

  V('village-far', 'Дальнее село', 'место', function (L) { return !L.urban ? 2 : 0; }, function (L) {
    st(L, 'know', -4); st(L, 'health', 2);
  }, 'До ближайшего врача — полдня дороги.');

  V('mountains', 'Горы', 'место', function (L) { return ['np', 'bt', 'ge', 'am', 'kg', 'tj', 'pe', 'bo', 'af', 'ch'].indexOf(L.c.code) >= 0 ? 2.5 : 0.3; }, function (L) {
    st(L, 'health', 3); st(L, 'know', -2);
  });

  V('seaside', 'У моря', 'место', function () { return 1; }, function (L) { st(L, 'happy', 3); st(L, 'health', 1); });

  V('desert', 'Засушливые места', 'место', function (L) { return ['ne', 'ml', 'td', 'sd', 'sa', 'ly', 'mr'].indexOf(L.c.code) >= 0 ? 2.5 : 0.2; }, function (L) {
    st(L, 'health', -3);
  });

  V('factory-town', 'Заводской город', 'место', function (L) { return L.urban && !rich(L.c) ? 1.6 : 0.4; }, function (L) {
    st(L, 'health', -3); L.flag('factoryTown', true);
  }, 'Весь город работал на один завод.');

  V('border-town', 'Приграничье', 'место', function () { return 0.9; }, function (L) {
    st(L, 'know', 2); L.flag('border', true);
  });

  V('slum', 'Окраина без адреса', 'место', function (L) { return poor(L.c) && L.urban ? 2.2 : 0.2; }, function (L) {
    st(L, 'health', -5); st(L, 'know', -3); L.famPct = clamp(L.famPct - 0.12, 0.02, 1);
  }, 'Вы выросли там, где нет названий улиц.');

  V('island', 'Остров', 'место', function (L) { return ['id', 'ph', 'fj', 'sb', 'mv', 'cv', 'km', 'mu', 'jm', 'tt'].indexOf(L.c.code) >= 0 ? 2.5 : 0.1; }, function (L) {
    st(L, 'happy', 2); st(L, 'know', -1);
  });

  V('north-cold', 'Северный посёлок', 'место', function (L) { return ['ru', 'ca', 'no', 'se', 'fi', 'is', 'mn'].indexOf(L.c.code) >= 0 ? 1.8 : 0.1; }, function (L) {
    st(L, 'health', -2); st(L, 'bond', 3);
  });

  V('old-house', 'Старый дом без удобств', 'место', function (L) { return !rich(L.c) ? 1.6 : 0.3; }, function (L) {
    st(L, 'health', -3);
  }, 'Удобства были во дворе, вода — из колонки.');

  V('new-flat', 'Новая квартира', 'место', function (L) { return L.famPct > 0.6 ? 1.6 : 0.5; }, function (L) {
    st(L, 'happy', 3); st(L, 'health', 2);
  });

  V('communal', 'Коммуналка', 'место', function (L) { return old(L) && !rich(L.c) ? 1.8 : 0.3; }, function (L) {
    st(L, 'bond', 3); st(L, 'happy', -3);
  }, 'Кухня была общей, и секретов в доме не было.');

  V('dacha', 'Дача и огород', 'место', function (L) { return ['ru', 'ua', 'by', 'kz', 'pl', 'ro', 'bg'].indexOf(L.c.code) >= 0 ? 2 : 0.4; }, function (L) {
    st(L, 'health', 3); L.flag('dacha', true);
  });

  V('refugee-camp', 'Лагерь для переселенцев', 'место', function (L) { return poor(L.c) ? 0.9 : 0.1; }, function (L) {
    st(L, 'health', -6); st(L, 'know', -4); st(L, 'happy', -5);
  }, 'Первые годы прошли в лагере для переселенцев.');

  V('two-countries', 'Две страны в детстве', 'место', function () { return 0.8; }, function (L) {
    st(L, 'know', 4); st(L, 'bond', -2); L.flag('lang2', true);
  }, 'Детство поделилось между двумя странами и двумя языками.');

  /* =============================== ВРЕМЯ (14) ========================= */

  V('war-child', 'Детство в войну', 'время', function (L) { return L.c.war ? 3 : 0.2; }, function (L) {
    st(L, 'health', -6); st(L, 'happy', -8); L.flag('warChild', true);
  }, 'Ваше детство пришлось на войну.');

  V('hunger-year', 'Голодный год', 'время', function (L) { return poor(L.c) ? 1.6 : 0.2; }, function (L) {
    st(L, 'health', -7);
  }, 'Был год, когда еды не хватало всем.');

  V('reform-years', 'Годы реформ', 'время', function (L) { return L.birthYear >= 1975 && L.birthYear <= 1995 ? 2 : 0.3; }, function (L) {
    st(L, 'happy', -3); L.famPct = clamp(L.famPct - 0.08, 0.02, 1);
  }, 'Страна менялась быстрее, чем взрослые успевали объяснить.');

  V('boom-years', 'Годы роста', 'время', function (L) { return L.birthYear >= 1950 && L.birthYear <= 1975 ? 1.6 : 0.6; }, function (L) {
    L.famPct = clamp(L.famPct + 0.06, 0, 1); st(L, 'happy', 2);
  });

  V('epidemic-child', 'Эпидемия в детстве', 'время', function (L) { return L.birthYear >= 2015 ? 2.2 : 0.5; }, function (L) {
    st(L, 'know', -3); st(L, 'bond', -3);
  }, 'Два года школы прошли через экран.');

  V('no-electricity', 'Без электричества', 'время', function (L) { return poor(L.c) ? 2 : 0.1; }, function (L) {
    st(L, 'know', -4);
  }, 'Свет в доме был не всегда, уроки делали при лампе.');

  V('first-tv', 'Первый телевизор в доме', 'время', function (L) { return L.birthYear < 1985 ? 1.8 : 0.2; }, function (L) {
    st(L, 'happy', 3); st(L, 'know', 1);
  });

  V('first-computer', 'Первый компьютер', 'время', function (L) { return L.birthYear >= 1985 && L.birthYear <= 2005 ? 1.8 : 0.4; }, function (L) {
    st(L, 'know', 5);
  }, 'Дома появился компьютер, и вы разобрались в нём раньше родителей.');

  V('smartphone-kid', 'Телефон с пяти лет', 'время', function (L) { return L.birthYear >= 2010 ? 2.2 : 0; }, function (L) {
    st(L, 'know', 2); st(L, 'health', -2); st(L, 'bond', -2);
  });

  V('big-move', 'Переезд всей семьёй', 'время', function () { return 1.3; }, function (L) {
    st(L, 'bond', -3); st(L, 'know', 2);
  }, 'Семья переехала, и всё пришлось начинать заново.');

  V('new-country', 'Семья уехала за границу', 'время', function (L) { return !rich(L.c) ? 1 : 0.4; }, function (L) {
    L.flag('migrantKid', true); st(L, 'know', 3); st(L, 'bond', -4);
  }, 'Семья уехала в другую страну, когда вы пошли в школу.');

  V('currency-reform', 'Деньги поменяли', 'время', function (L) { return !rich(L.c) && L.birthYear < 2005 ? 1.4 : 0.2; }, function (L) {
    L.famPct = clamp(L.famPct - 0.05, 0.02, 1);
  }, 'Старые деньги в одночасье стали бумагой.');

  V('free-school', 'Хорошая бесплатная школа', 'время', function (L) { return !poor(L.c) ? 1.6 : 0.5; }, function (L) {
    st(L, 'know', 7);
  });

  V('no-school-years', 'Школа была не каждый год', 'время', function (L) { return poor(L.c) ? 1.8 : 0.1; }, function (L) {
    st(L, 'know', -8);
  }, 'В школу ходили не каждый год: то денег нет, то руки нужны дома.');

  /* ============================= ХАРАКТЕР (18) ======================== */

  V('curious', 'Любопытный', 'характер', function () { return 1.6; }, function (L) { st(L, 'know', 6); });
  V('stubborn', 'Упрямый', 'характер', function () { return 1.5; }, function (L) { st(L, 'know', 2); st(L, 'bond', -2); });
  V('kind', 'Добрый', 'характер', function () { return 1.5; }, function (L) { st(L, 'bond', 6); st(L, 'happy', 2); });
  V('shy', 'Застенчивый', 'характер', function () { return 1.4; }, function (L) { st(L, 'bond', -4); st(L, 'know', 2); });
  V('loud', 'Шумный', 'характер', function () { return 1.3; }, function (L) { st(L, 'bond', 4); st(L, 'know', -2); });
  V('careful', 'Осторожный', 'характер', function () { return 1.3; }, function (L) { st(L, 'health', 3); L.flag('careful', true); });
  V('risky', 'Рисковый', 'характер', function () { return 1.3; }, function (L) { st(L, 'health', -3); st(L, 'happy', 3); L.flag('risky', true); });
  V('dreamer', 'Мечтатель', 'характер', function () { return 1.3; }, function (L) { st(L, 'happy', 4); st(L, 'know', -1); });
  V('practical', 'Практичный', 'характер', function () { return 1.3; }, function (L) { st(L, 'know', 3); st(L, 'happy', -1); });
  V('music-ear', 'Музыкальный слух', 'характер', function () { return 1.1; }, function (L) {
    st(L, 'happy', 4); L.flag('music', true);
  }, 'У вас оказался слух: вас отдали в музыкальную школу.');
  V('draws', 'Рисует', 'характер', function () { return 1.1; }, function (L) { st(L, 'happy', 3); st(L, 'know', 2); });
  V('numbers', 'Считает в уме', 'характер', function () { return 1.1; }, function (L) { st(L, 'know', 6); });
  V('words', 'Рано начал читать', 'характер', function () { return 1.2; }, function (L) { st(L, 'know', 7); st(L, 'bond', -1); });
  V('hands', 'Золотые руки', 'характер', function () { return 1.2; }, function (L) { st(L, 'know', 3); L.flag('hands', true); });
  V('leader', 'Заводила', 'характер', function () { return 1.1; }, function (L) { st(L, 'bond', 5); st(L, 'happy', 2); });
  V('loner', 'Одиночка', 'характер', function () { return 1.2; }, function (L) { st(L, 'bond', -5); st(L, 'know', 3); });
  V('anxious', 'Тревожный', 'характер', function () { return 1.3; }, function (L) { st(L, 'happy', -5); st(L, 'health', -2); });
  V('cheerful', 'Весёлый', 'характер', function () { return 1.4; }, function (L) { st(L, 'happy', 6); st(L, 'bond', 3); });

  /* =============================== СЛУЧАЙ (12) ======================== */

  V('found-mentor', 'Учитель, который поверил', 'случай', function () { return 1.2; }, function (L) {
    st(L, 'know', 6); st(L, 'happy', 3);
  }, 'Один учитель поверил в вас — этого хватило надолго.');

  V('accident-child', 'Авария в детстве', 'случай', function () { return 0.8; }, function (L) {
    st(L, 'health', -8); L.flag('scar', true);
  }, 'Вы попали в аварию ребёнком и долго лечились.');

  V('saved', 'Вас спасли', 'случай', function () { return 0.6; }, function (L) {
    st(L, 'happy', 4); st(L, 'bond', 4);
  }, 'Однажды вас вытащили из воды. Вы помните это всю жизнь.');

  V('lost-sibling', 'Умер брат или сестра', 'случай', function (L) { return poor(L.c) && L.siblings > 0 ? 1.6 : 0.3; }, function (L) {
    L.siblings = Math.max(0, L.siblings - 1); st(L, 'happy', -9); st(L, 'bond', 2);
  }, 'Брат не дожил до школы. Дома об этом не говорили.');

  V('lottery-family', 'Семье повезло', 'случай', function () { return 0.5; }, function (L) {
    L.famPct = clamp(L.famPct + 0.15, 0, 1); st(L, 'happy', 3);
  }, 'Семье неожиданно достались деньги — и жизнь ненадолго стала другой.');

  V('fire-home', 'Дом сгорел', 'случай', function (L) { return !rich(L.c) ? 0.8 : 0.3; }, function (L) {
    L.famPct = clamp(L.famPct - 0.12, 0.02, 1); st(L, 'happy', -6);
  }, 'Дом сгорел, когда вам было восемь. Начинали с нуля.');

  V('famous-relative', 'Известный родственник', 'случай', function () { return 0.6; }, function (L) {
    st(L, 'know', 3); st(L, 'bond', 2); L.famPct = clamp(L.famPct + 0.05, 0, 1);
  });

  V('inherited-house', 'Дом от родных', 'случай', function () { return 0.9; }, function (L) {
    L.flag('willInherit', true); st(L, 'happy', 2);
  });

  V('street-dog', 'Собака из подворотни', 'случай', function () { return 1.1; }, function (L) {
    L.flag('pet', true); st(L, 'happy', 5); st(L, 'bond', 2);
  }, 'Вы притащили домой щенка, и его оставили.');

  V('long-illness', 'Год в больнице', 'случай', function (L) { return poor(L.c) ? 1.2 : 0.7; }, function (L) {
    st(L, 'health', -10); st(L, 'know', 4);
  }, 'Год в больнице: вы прочитали всё, что было в палате.');

  V('talent-spotted', 'Вас заметили', 'случай', function () { return 0.7; }, function (L) {
    st(L, 'know', 4); st(L, 'happy', 4); L.flag('spotted', true);
  }, 'Вас заметили на районном конкурсе и позвали дальше.');

  V('bad-company', 'Плохая компания', 'случай', function (L) { return L.urban && !rich(L.c) ? 1.6 : 0.8; }, function (L) {
    st(L, 'know', -4); st(L, 'happy', -2); L.flag('risky', true);
  }, 'Двор научил раньше школы. Не всему хорошему.');

  /* ======================================================================
     Жребий: от одной до четырёх вариаций на жизнь, без повторов и
     без противоречий (например, «единственный ребёнок» и «многодетная»).
     ====================================================================== */

  var CONFLICT = [
    ['only-child', 'many-kids'], ['only-child', 'eldest'], ['only-child', 'youngest'],
    ['eldest', 'youngest'], ['rich-family', 'poor-family'], ['rich-family', 'slum'],
    ['tall', 'small'], ['shy', 'loud'], ['careful', 'risky'], ['loner', 'leader'],
    ['warm-home', 'drinking-home'], ['orphan', 'warm-home'], ['orphan', 'granny-raised'],
    ['strong', 'sick-child'], ['capital-born', 'village-far'], ['village-far', 'slum'],
    ['boom-years', 'reform-years'], ['anxious', 'cheerful'], ['adopted', 'orphan']
  ];
  function conflicts(a, b) {
    for (var i = 0; i < CONFLICT.length; i++) {
      if ((CONFLICT[i][0] === a && CONFLICT[i][1] === b) || (CONFLICT[i][1] === a && CONFLICT[i][0] === b)) return true;
    }
    return false;
  }

  function draw(L, count) {
    var rnd = L.rnd;
    var n = count || (1 + (rnd() < 0.55 ? 1 : 0) + (rnd() < 0.3 ? 1 : 0) + (rnd() < 0.12 ? 1 : 0));
    var taken = [], tags = {};
    for (var tries = 0; tries < n * 12 && taken.length < n; tries++) {
      var pool = VARS.filter(function (v) {
        if (taken.indexOf(v) >= 0) return false;
        for (var i = 0; i < taken.length; i++) if (conflicts(taken[i].id, v.id)) return false;
        if (tags[v.tag] >= 2) return false;                 /* не больше двух из одной группы */
        var w = 0;
        try { w = v.w(L); } catch (e) { w = 0; }
        return w > 0;
      });
      if (!pool.length) break;
      var chosen = rnd.weighted ? rnd.weighted(pool, function (v) { return v.w(L); })
        : pool[Math.floor(rnd() * pool.length)];
      if (!chosen) break;
      taken.push(chosen);
      tags[chosen.tag] = (tags[chosen.tag] || 0) + 1;
    }
    return taken;
  }

  /* применить вариации к новорождённому */
  function apply(L, list) {
    var out = [];
    (list || []).forEach(function (v) {
      try {
        v.apply(L);
        out.push(v.id);
        if (v.note && !L.silent) L.add(v.note, 'neutral');
      } catch (e) { /* одна сломанная вариация не должна ломать жизнь */ }
    });
    L.variations = out;
    return out;
  }

  var BY_ID = {};
  VARS.forEach(function (v) { BY_ID[v.id] = v; });

  window.IN8B.variations = {
    list: VARS,
    byId: BY_ID,
    draw: draw,
    apply: apply,
    conflicts: conflicts,
    count: VARS.length,
    tags: ['тело', 'семья', 'место', 'время', 'характер', 'случай']
  };
})();
