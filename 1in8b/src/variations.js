/* ============================================================
   1 ИЗ 8 МИЛЛИАРДОВ — 250 вариаций жизни.
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


  /* ======================================================================
     ВТОРАЯ ВОЛНА ВАРИАЦИЙ (v1.8): ещё 150 способов родиться другим.
     Те же шесть групп, те же правила: вес решает, бывает ли такое в этой
     стране и в этом году, apply меняет стартовые показатели и ставит
     флаги, которые потом читают механики и события.
     ====================================================================== */

  /* ========================= ТЕЛО: ещё 25 ============================= */

  V('triplet', 'Один из тройни', 'тело', function () { return 0.25; }, function (L) {
    L.siblings += 2; st(L, 'health', -4); st(L, 'bond', 7);
  }, 'Вас было трое сразу — родители так и не выспались.');

  V('big-family-body', 'Крепкая порода', 'тело', function () { return 1.1; }, function (L) { st(L, 'health', 6); });

  V('weak-lungs', 'Слабые лёгкие', 'тело', function (L) { return poor(L.c) ? 1.6 : 0.9; }, function (L) {
    st(L, 'health', -5); L.flag('chronic', true);
  });

  V('heart-murmur', 'Шум в сердце', 'тело', function () { return 0.8; }, function (L) { st(L, 'health', -4); });

  V('flat-feet', 'Плоскостопие', 'тело', function () { return 1.2; }, function (L) { st(L, 'health', -1.5); });

  V('red-hair', 'Рыжие волосы', 'тело', function (L) { return ['ie', 'gb', 'ru', 'ua', 'nl', 'se'].indexOf(L.c.code) >= 0 ? 1.4 : 0.3; }, function (L) {
    st(L, 'happy', -1); st(L, 'bond', 1);
  });

  V('green-eyes', 'Редкий цвет глаз', 'тело', function () { return 0.8; }, function (L) { st(L, 'happy', 1.5); });

  V('freckles', 'Веснушки', 'тело', function () { return 1.1; }, function (L) { st(L, 'happy', 1); });

  V('early-teeth', 'Ранние зубы', 'тело', function () { return 1; }, function (L) { st(L, 'health', 1.5); });

  V('colic-baby', 'Беспокойный младенец', 'тело', function () { return 1.3; }, function (L) {
    st(L, 'health', -2); st(L, 'bond', -1);
  });

  V('long-fingers', 'Длинные пальцы', 'тело', function () { return 1; }, function (L) {
    st(L, 'know', 2); L.flag('music', true);
  });

  V('good-ear-balance', 'Хороший вестибулярный аппарат', 'тело', function () { return 1; }, function (L) {
    st(L, 'health', 2); L.flag('sport', true);
  });

  V('colour-blind', 'Дальтонизм', 'тело', function (L) { return L.sex === 'm' ? 1.2 : 0.2; }, function (L) { st(L, 'know', -1); });

  V('stutter', 'Заикание', 'тело', function () { return 0.9; }, function (L) {
    st(L, 'happy', -3); st(L, 'bond', -2);
  }, 'Вы заикались, и каждое выступление у доски было пыткой.');

  V('birth-injury', 'Родовая травма', 'тело', function (L) { return poor(L.c) ? 1.8 : 0.5; }, function (L) {
    st(L, 'health', -7); L.flag('fragile', true);
  });

  V('strong-immunity', 'Крепкий иммунитет', 'тело', function () { return 1.3; }, function (L) { st(L, 'health', 5); });

  V('slow-growth', 'Медленный рост', 'тело', function (L) { return poor(L.c) ? 1.6 : 0.7; }, function (L) {
    st(L, 'health', -3); st(L, 'happy', -1);
  });

  V('sweet-sleep', 'Спокойный сон', 'тело', function () { return 1.2; }, function (L) { st(L, 'health', 3); st(L, 'happy', 2); });

  V('migraine', 'Мигрени', 'тело', function () { return 0.9; }, function (L) { st(L, 'health', -3); st(L, 'happy', -2); });

  V('lactose', 'Непереносимость молока', 'тело', function (L) { return ['cn', 'jp', 'kr', 'vn', 'th', 'id'].indexOf(L.c.code) >= 0 ? 2.2 : 0.6; }, function (L) {
    st(L, 'health', -1);
  });

  V('left-eye-weak', 'Слабый глаз', 'тело', function () { return 0.9; }, function (L) { L.flag('glasses', true); st(L, 'know', 1); });

  V('scoliosis', 'Сколиоз', 'тело', function () { return 1.1; }, function (L) { st(L, 'health', -3); });

  V('fast-metabolism', 'Быстрый обмен веществ', 'тело', function () { return 1; }, function (L) { st(L, 'health', 3); });

  V('birth-at-home', 'Роды дома', 'тело', function (L) { return poor(L.c) ? 2.4 : 0.2; }, function (L) {
    st(L, 'health', -3);
  }, 'Вас принимала соседка-повитуха: до больницы было слишком далеко.');

  V('late-walker', 'Поздно пошёл', 'тело', function () { return 1; }, function (L) { st(L, 'health', -1); st(L, 'know', 1); });

  /* ========================= СЕМЬЯ: ещё 25 =========================== */

  V('many-siblings', 'Много братьев и сестёр', 'семья', function (L) { return L.c.tfr > 3 ? 2 : 0.5; }, function (L) {
    L.siblings += 3; st(L, 'bond', 5); L.famPct = clamp(L.famPct - 0.06, 0.02, 1);
  });

  V('middle-child', 'Средний ребёнок', 'семья', function () { return 1.3; }, function (L) { st(L, 'bond', 2); st(L, 'happy', -1); });

  V('young-parents', 'Совсем молодые родители', 'семья', function (L) { return poor(L.c) ? 1.8 : 0.8; }, function (L) {
    L.famPct = clamp(L.famPct - 0.07, 0.02, 1); st(L, 'bond', 2);
  });

  V('old-parents', 'Поздний ребёнок', 'семья', function (L) { return rich(L.c) ? 1.6 : 0.7; }, function (L) {
    L.famPct = clamp(L.famPct + 0.05, 0, 1); st(L, 'know', 3); st(L, 'bond', -1);
  });

  V('single-mother', 'Мать одна', 'семья', function (L) { return 1.4; }, function (L) {
    L.famPct = clamp(L.famPct - 0.1, 0.02, 1); st(L, 'bond', 2); st(L, 'happy', -3);
  }, 'Мать растила вас одна и работала на двух работах.');

  V('big-brother', 'Старший брат-защитник', 'семья', function () { return 1.2; }, function (L) {
    L.siblings += 1; st(L, 'bond', 4); st(L, 'happy', 2);
  });

  V('sister-close', 'Сестра-подруга', 'семья', function () { return 1.2; }, function (L) {
    L.siblings += 1; st(L, 'bond', 5);
  });

  V('family-shop', 'Семейная лавка', 'семья', function (L) { return !rich(L.c) ? 1.4 : 0.8; }, function (L) {
    L.flag('familyBiz', true); st(L, 'know', 2); L.famPct = clamp(L.famPct + 0.04, 0, 1);
  });

  V('farm-family', 'Семья с хозяйством', 'семья', function (L) { return !L.urban ? 2 : 0.3; }, function (L) {
    st(L, 'health', 3); st(L, 'know', -2); L.flag('farmKid', true);
  });

  V('priest-family', 'Семья священника', 'семья', function () { return 0.6; }, function (L) {
    st(L, 'bond', 4); st(L, 'know', 2); L.flag('faith', true);
  });

  V('artist-family', 'Семья артистов', 'семья', function (L) { return L.urban ? 0.9 : 0.3; }, function (L) {
    st(L, 'know', 3); st(L, 'happy', 2); L.flag('music', true);
  });

  V('engineer-family', 'Семья инженеров', 'семья', function (L) { return mid(L.c) || rich(L.c) ? 1.2 : 0.5; }, function (L) {
    st(L, 'know', 5);
  });

  V('trader-family', 'Семья торговцев', 'семья', function (L) { return !rich(L.c) ? 1.3 : 0.6; }, function (L) {
    st(L, 'know', 2); L.famPct = clamp(L.famPct + 0.05, 0, 1);
  });

  V('miner-family', 'Шахтёрская семья', 'семья', function (L) { return ['ru', 'ua', 'kz', 'pl', 'cn', 'za', 'cl'].indexOf(L.c.code) >= 0 ? 1.4 : 0.3; }, function (L) {
    st(L, 'health', -2); st(L, 'bond', 3);
  });

  V('parents-abroad', 'Родители на заработках', 'семья', function (L) { return poor(L.c) || mid(L.c) ? 1.6 : 0.4; }, function (L) {
    st(L, 'happy', -4); st(L, 'bond', -3); L.flag('moneyFromAbroad', true);
  }, 'Родители уехали работать за границу, а вы остались с бабушкой.');

  V('stepfather', 'Отчим', 'семья', function () { return 1.1; }, function (L) {
    st(L, 'happy', -2); L.flag('parentsSplit', true);
  });

  V('stepmother', 'Мачеха', 'семья', function () { return 0.8; }, function (L) { st(L, 'happy', -2); });

  V('foster-care', 'Приёмная семья', 'семья', function () { return 0.5; }, function (L) {
    st(L, 'bond', -2); st(L, 'happy', -2); L.flag('adopted', true);
  });

  V('large-dowry', 'Семья с достатком', 'семья', function (L) { return 0.8; }, function (L) {
    L.famPct = clamp(L.famPct + 0.12, 0, 1); L.flag('willInherit', true);
  });

  V('debt-family', 'Семья в долгах', 'семья', function (L) { return poor(L.c) || mid(L.c) ? 1.5 : 0.6; }, function (L) {
    L.famPct = clamp(L.famPct - 0.1, 0.02, 1); st(L, 'happy', -3);
  }, 'Дома всегда говорили о долгах — шёпотом.');

  V('strict-grandma', 'Строгая бабушка', 'семья', function () { return 1.2; }, function (L) {
    st(L, 'know', 3); st(L, 'happy', -1); st(L, 'health', 2);
  });

  V('family-reads', 'Дома читали вслух', 'семья', function (L) { return rich(L.c) || mid(L.c) ? 1.4 : 0.7; }, function (L) {
    st(L, 'know', 6); st(L, 'bond', 2);
  }, 'По вечерам дома читали вслух — вы запомнили это навсегда.');

  V('family-music', 'Дома пели', 'семья', function () { return 1.1; }, function (L) {
    st(L, 'happy', 3); L.flag('music', true);
  });

  V('family-sport', 'Спортивная семья', 'семья', function () { return 1; }, function (L) {
    st(L, 'health', 4); L.flag('sport', true);
  });

  V('many-cousins', 'Большая родня', 'семья', function (L) { return L.c.tfr > 2.5 ? 1.6 : 0.7; }, function (L) {
    st(L, 'bond', 4);
  });

  /* ========================= МЕСТО: ещё 28 =========================== */

  V('steppe', 'Степь', 'место', function (L) { return ['kz', 'mn', 'ru', 'ua', 'ar'].indexOf(L.c.code) >= 0 ? 1.8 : 0.2; }, function (L) {
    st(L, 'health', 1); st(L, 'know', -1);
  });

  V('jungle', 'Тропический лес', 'место', function (L) { return ['br', 'id', 'cd', 'pe', 'co', 'my', 'pg'].indexOf(L.c.code) >= 0 ? 2 : 0.1; }, function (L) {
    st(L, 'health', -2); st(L, 'know', -1);
  });

  V('river-town', 'Город на реке', 'место', function () { return 1.1; }, function (L) { st(L, 'happy', 2); });

  V('port-city', 'Портовый город', 'место', function (L) { return L.urban ? 1.3 : 0.2; }, function (L) {
    st(L, 'know', 3); L.flag('port', true);
  });

  V('mining-town', 'Рудничный посёлок', 'место', function (L) { return !rich(L.c) ? 1.2 : 0.4; }, function (L) {
    st(L, 'health', -4); L.famPct = clamp(L.famPct + 0.03, 0, 1);
  });

  V('resort-town', 'Курортный городок', 'место', function (L) { return 0.9; }, function (L) {
    st(L, 'happy', 3); st(L, 'know', -1);
  });

  V('student-town', 'Студенческий город', 'место', function (L) { return L.urban && !poor(L.c) ? 1.4 : 0.3; }, function (L) {
    st(L, 'know', 5);
  });

  V('industrial-east', 'Промышленная окраина', 'место', function (L) { return L.urban ? 1.3 : 0.3; }, function (L) {
    st(L, 'health', -3); st(L, 'bond', 2);
  });

  V('new-district', 'Новый микрорайон', 'место', function (L) { return L.urban ? 1.4 : 0.2; }, function (L) {
    st(L, 'happy', 1); st(L, 'bond', -1);
  });

  V('old-center', 'Старый центр', 'место', function (L) { return L.urban ? 1.1 : 0.1; }, function (L) {
    st(L, 'know', 2); st(L, 'happy', 2);
  });

  V('near-railway', 'У железной дороги', 'место', function () { return 1; }, function (L) {
    st(L, 'happy', -1); st(L, 'know', 1);
  });

  V('near-airport', 'Рядом с аэропортом', 'место', function (L) { return L.urban && !poor(L.c) ? 0.9 : 0.2; }, function (L) {
    st(L, 'happy', -2);
  });

  V('high-altitude', 'Высокогорье', 'место', function (L) { return ['bo', 'pe', 'np', 'et', 'kg', 'tj'].indexOf(L.c.code) >= 0 ? 2 : 0.1; }, function (L) {
    st(L, 'health', 2); st(L, 'know', -2);
  });

  V('oasis', 'Оазис', 'место', function (L) { return ['eg', 'ly', 'dz', 'sa', 'mr', 'td'].indexOf(L.c.code) >= 0 ? 1.6 : 0.05; }, function (L) {
    st(L, 'bond', 3); st(L, 'know', -1);
  });

  V('tundra', 'Тундра', 'место', function (L) { return ['ru', 'ca', 'gl', 'no'].indexOf(L.c.code) >= 0 ? 1.2 : 0.02; }, function (L) {
    st(L, 'health', -2); st(L, 'bond', 4);
  }, 'Зима длилась восемь месяцев, и все друг друга знали.');

  V('small-island-born', 'Крошечный остров', 'место', function (L) { return L.c.pop < 500000 ? 2.5 : 0.05; }, function (L) {
    st(L, 'bond', 5); st(L, 'know', -2);
  }, 'На вашем острове все друг другу родня.');

  V('capital-suburb', 'Пригород столицы', 'место', function (L) { return L.urban ? 1.5 : 0.2; }, function (L) {
    st(L, 'know', 2); st(L, 'happy', 1);
  });

  V('two-rooms-five', 'Две комнаты на пятерых', 'место', function (L) { return !rich(L.c) ? 1.8 : 0.5; }, function (L) {
    st(L, 'happy', -3); st(L, 'bond', 3);
  });

  V('house-with-garden', 'Дом с садом', 'место', function (L) { return !L.urban || rich(L.c) ? 1.5 : 0.5; }, function (L) {
    st(L, 'happy', 3); st(L, 'health', 2); L.flag('dacha', true);
  });

  V('no-running-water', 'Вода из колодца', 'место', function (L) { return poor(L.c) ? 2.2 : 0.2; }, function (L) {
    st(L, 'health', -4);
  });

  V('air-conditioner', 'Кондиционер в доме', 'место', function (L) { return rich(L.c) || mid(L.c) ? 1.3 : 0.3; }, function (L) {
    L.flag('ac', true); st(L, 'health', 1);
  });

  V('first-computer-home', 'Компьютер уже стоял дома', 'место', function (L) { return L.birthYear >= 1995 && !poor(L.c) ? 1.6 : 0; }, function (L) {
    L.flag('pc', true); st(L, 'know', 4);
  });

  V('noisy-street', 'Окна на дорогу', 'место', function (L) { return L.urban ? 1.4 : 0.1; }, function (L) { st(L, 'happy', -2); });

  V('green-yard', 'Зелёный двор', 'место', function () { return 1.2; }, function (L) { st(L, 'happy', 2); st(L, 'health', 1); });

  V('near-school', 'Школа во дворе', 'место', function () { return 1.2; }, function (L) { st(L, 'know', 3); });

  V('far-from-school', 'Школа за рекой', 'место', function (L) { return !L.urban ? 1.8 : 0.2; }, function (L) {
    st(L, 'know', -3); st(L, 'health', 1);
  }, 'До школы было шесть километров — в любую погоду пешком.');

  V('temporary-housing', 'Временное жильё', 'место', function (L) { return poor(L.c) || mid(L.c) ? 1.2 : 0.4; }, function (L) {
    st(L, 'happy', -3); L.flag('moved', true);
  });

  V('company-flat', 'Квартира от предприятия', 'место', function (L) { return old(L) && !rich(L.c) ? 1.6 : 0.2; }, function (L) {
    st(L, 'happy', 2); L.famPct = clamp(L.famPct + 0.03, 0, 1);
  });

  /* ========================= ВРЕМЯ: ещё 25 =========================== */

  V('post-war-years', 'Послевоенные годы', 'время', function (L) { return L.birthYear < 1960 ? 1.8 : 0; }, function (L) {
    st(L, 'health', -3); st(L, 'bond', 4);
  }, 'Страна ещё отстраивалась, и всё было по карточкам.');

  V('space-age', 'Эпоха космоса', 'время', function (L) { return L.birthYear >= 1955 && L.birthYear <= 1975 ? 1.5 : 0; }, function (L) {
    st(L, 'know', 3); st(L, 'happy', 2);
  });

  V('oil-crisis', 'Нефтяной кризис', 'время', function (L) { return L.birthYear >= 1968 && L.birthYear <= 1982 ? 1.3 : 0; }, function (L) {
    L.famPct = clamp(L.famPct - 0.05, 0.02, 1);
  });

  V('nineties', 'Девяностые', 'время', function (L) { return L.birthYear >= 1978 && L.birthYear <= 1995 && !rich(L.c) ? 1.8 : 0; }, function (L) {
    st(L, 'happy', -3); st(L, 'know', 2); L.famPct = clamp(L.famPct - 0.07, 0.02, 1);
  }, 'Ваше детство пришлось на годы, когда всё менялось каждый месяц.');

  V('millennium-kid', 'Ребёнок нулевых', 'время', function (L) { return L.birthYear >= 1998 && L.birthYear <= 2010 ? 1.6 : 0; }, function (L) {
    st(L, 'know', 3);
  });

  V('crisis-2008', 'Кризис 2008-го', 'время', function (L) { return L.birthYear >= 2000 && L.birthYear <= 2008 ? 1.4 : 0; }, function (L) {
    L.famPct = clamp(L.famPct - 0.05, 0.02, 1); st(L, 'happy', -1);
  });

  V('pandemic-kid', 'Детство в пандемию', 'время', function (L) { return L.birthYear >= 2012 && L.birthYear <= 2020 ? 2 : 0; }, function (L) {
    st(L, 'know', -3); st(L, 'bond', -2);
  }, 'Год вы учились из дома, через экран.');

  V('green-revolution', 'Зелёная революция', 'время', function (L) { return L.birthYear >= 1960 && L.birthYear <= 1985 && poor(L.c) ? 1.6 : 0; }, function (L) {
    st(L, 'health', 3);
  });

  V('vaccination-wave', 'Большая прививочная кампания', 'время', function (L) { return L.birthYear >= 1970 && poor(L.c) ? 1.8 : 0.3; }, function (L) {
    st(L, 'health', 5);
  });

  V('school-reform', 'Школьная реформа', 'время', function () { return 1.2; }, function (L) { st(L, 'know', -2); });

  V('inflation-childhood', 'Детство при гиперинфляции', 'время', function (L) { return !rich(L.c) ? 1.1 : 0.2; }, function (L) {
    L.famPct = clamp(L.famPct - 0.06, 0.02, 1); st(L, 'know', 2);
  });

  V('new-constitution', 'Страна меняла законы', 'время', function () { return 1; }, function (L) { st(L, 'know', 1); });

  V('olympics-home', 'Олимпиада в своей стране', 'время', function () { return 0.6; }, function (L) {
    st(L, 'happy', 3); L.flag('sport', true);
  });

  V('world-cup-year', 'Год большого футбола', 'время', function () { return 0.8; }, function (L) { st(L, 'happy', 2); });

  V('tv-colour', 'Первый цветной телевизор', 'время', function (L) { return L.birthYear >= 1965 && L.birthYear <= 1990 ? 1.5 : 0; }, function (L) {
    st(L, 'happy', 2);
  });

  V('mobile-first', 'Первый мобильный в классе', 'время', function (L) { return L.birthYear >= 1988 && L.birthYear <= 2002 ? 1.4 : 0; }, function (L) {
    st(L, 'happy', 2); st(L, 'bond', 1);
  });

  V('internet-dialup', 'Интернет по модему', 'время', function (L) { return L.birthYear >= 1985 && L.birthYear <= 2000 ? 1.5 : 0; }, function (L) {
    st(L, 'know', 3);
  }, 'Интернет занимал телефонную линию, и это было чудо.');

  V('social-network-teen', 'Соцсети с подросткового возраста', 'время', function (L) { return L.birthYear >= 1995 ? 1.7 : 0; }, function (L) {
    st(L, 'bond', 2); st(L, 'happy', -2);
  });

  V('ai-childhood', 'Детство с говорящими машинами', 'время', function (L) { return L.birthYear >= 2018 ? 2 : 0; }, function (L) {
    st(L, 'know', 4); st(L, 'bond', -1);
  });

  V('big-migration', 'Годы большого переселения', 'время', function (L) { return !rich(L.c) ? 1.2 : 0.4; }, function (L) {
    L.flag('migrantKid', true); st(L, 'know', 2); st(L, 'bond', -2);
  });

  V('city-building', 'Годы большой стройки', 'время', function (L) { return !rich(L.c) ? 1.3 : 0.5; }, function (L) {
    st(L, 'happy', 1); L.famPct = clamp(L.famPct + 0.03, 0, 1);
  });

  V('rationing', 'Талоны и очереди', 'время', function (L) { return old(L) && !rich(L.c) ? 1.6 : 0.2; }, function (L) {
    st(L, 'health', -2); st(L, 'know', 1);
  }, 'За сахаром и маслом стояли с талонами.');

  V('radio-era', 'Эпоха радио', 'время', function (L) { return L.birthYear < 1970 ? 1.5 : 0; }, function (L) { st(L, 'happy', 1); st(L, 'know', 1); });

  V('independence-year', 'Год независимости', 'время', function (L) { return poor(L.c) || mid(L.c) ? 0.9 : 0.2; }, function (L) {
    st(L, 'happy', 2); st(L, 'bond', 2);
  });

  V('climate-summers', 'Всё более жаркие лета', 'время', function (L) { return L.birthYear >= 2005 ? 1.6 : 0.2; }, function (L) {
    st(L, 'health', -2);
  });

  /* ======================== ХАРАКТЕР: ещё 25 ========================== */

  V('patient', 'Терпеливый', 'характер', function () { return 1.2; }, function (L) { st(L, 'know', 3); st(L, 'happy', 1); });

  V('impatient', 'Нетерпеливый', 'характер', function () { return 1.2; }, function (L) { st(L, 'know', -1); st(L, 'happy', -1); });

  V('stubborn-learner', 'Упрямый в учёбе', 'характер', function () { return 1.1; }, function (L) { st(L, 'know', 4); });

  V('charmer', 'Обаятельный', 'характер', function () { return 1.1; }, function (L) { st(L, 'bond', 5); st(L, 'happy', 2); });

  V('honest', 'Честный до неудобства', 'характер', function () { return 1.1; }, function (L) { st(L, 'bond', 2); st(L, 'happy', -1); });

  V('sly', 'Хитрый', 'характер', function () { return 1; }, function (L) { st(L, 'know', 2); st(L, 'bond', -2); });

  V('generous', 'Щедрый', 'характер', function () { return 1.1; }, function (L) { st(L, 'bond', 4); });

  V('thrifty', 'Бережливый', 'характер', function () { return 1.2; }, function (L) { st(L, 'know', 2); L.flag('thrifty', true); });

  V('spender', 'Лёгкий на трату', 'характер', function () { return 1.1; }, function (L) { st(L, 'happy', 2); L.flag('spender', true); });

  V('workaholic', 'Работяга с детства', 'характер', function () { return 1.1; }, function (L) { st(L, 'know', 3); st(L, 'health', -1); });

  V('daydreamer', 'Витает в облаках', 'характер', function () { return 1.1; }, function (L) { st(L, 'know', -1); st(L, 'happy', 3); });

  V('organiser', 'Организатор', 'характер', function () { return 1; }, function (L) { st(L, 'bond', 3); st(L, 'know', 2); });

  V('peacemaker', 'Миротворец', 'характер', function () { return 1.1; }, function (L) { st(L, 'bond', 4); st(L, 'happy', 1); });

  V('hot-temper', 'Вспыльчивый', 'характер', function () { return 1.2; }, function (L) { st(L, 'bond', -3); st(L, 'happy', -1); });

  V('melancholic', 'Задумчивый', 'характер', function () { return 1.1; }, function (L) { st(L, 'know', 3); st(L, 'happy', -3); });

  V('optimist', 'Неисправимый оптимист', 'характер', function () { return 1.2; }, function (L) { st(L, 'happy', 6); });

  V('pessimist', 'Во всём видит худшее', 'характер', function () { return 1.1; }, function (L) { st(L, 'happy', -5); st(L, 'know', 1); });

  V('collector', 'Собиратель', 'характер', function () { return 1; }, function (L) { st(L, 'know', 2); st(L, 'happy', 1); });

  V('storyteller', 'Рассказчик', 'характер', function () { return 1.1; }, function (L) { st(L, 'bond', 4); L.flag('words', true); });

  V('handy-kid', 'Руки на месте', 'характер', function () { return 1.2; }, function (L) { st(L, 'know', 2); L.flag('hands', true); });

  V('bookworm', 'Книжный ребёнок', 'характер', function () { return 1.2; }, function (L) { st(L, 'know', 6); st(L, 'health', -1); });

  V('street-smart', 'Дворовая смекалка', 'характер', function (L) { return L.urban && !rich(L.c) ? 1.6 : 0.6; }, function (L) {
    st(L, 'know', 2); st(L, 'bond', 2); st(L, 'health', -1);
  });

  V('perfectionist', 'Перфекционист', 'характер', function () { return 1.1; }, function (L) { st(L, 'know', 3); st(L, 'happy', -2); });

  V('joker', 'Шутник', 'характер', function () { return 1.1; }, function (L) { st(L, 'happy', 3); st(L, 'bond', 3); });

  V('quiet-worker', 'Тихий труженик', 'характер', function () { return 1.2; }, function (L) { st(L, 'know', 2); st(L, 'bond', -1); st(L, 'health', 1); });

  /* ========================= СЛУЧАЙ: ещё 22 ========================== */

  V('saved-by-doctor', 'Врач успел вовремя', 'случай', function (L) { return !poor(L.c) ? 1.2 : 0.5; }, function (L) {
    st(L, 'health', 4);
  }, 'В детстве вас спасли в последний момент — вы об этом знаете только по рассказам.');

  V('car-crash-child', 'Авария в детстве', 'случай', function () { return 0.7; }, function (L) {
    st(L, 'health', -6); L.flag('scar', true);
  });

  V('lost-in-crowd', 'Потерялся в толпе', 'случай', function () { return 0.9; }, function (L) { st(L, 'happy', -2); st(L, 'know', 1); });

  V('found-money', 'Нашли деньги на улице', 'случай', function () { return 0.8; }, function (L) { st(L, 'happy', 2); });

  V('dog-bite', 'Укусила собака', 'случай', function (L) { return poor(L.c) ? 1.3 : 0.7; }, function (L) {
    st(L, 'health', -3); st(L, 'happy', -1);
  });

  V('drowning-escape', 'Чуть не утонул', 'случай', function () { return 0.7; }, function (L) {
    st(L, 'health', -2); L.flag('careful', true);
  });

  V('school-contest-win', 'Победа на олимпиаде', 'случай', function () { return 0.9; }, function (L) {
    st(L, 'know', 5); st(L, 'happy', 2); L.flag('spotted', true);
  });

  V('tv-appearance', 'Попали в телевизор', 'случай', function (L) { return L.birthYear >= 1965 ? 0.6 : 0.1; }, function (L) {
    st(L, 'happy', 3); st(L, 'bond', 1);
  });

  V('bullied', 'Травля в школе', 'случай', function () { return 1.4; }, function (L) {
    st(L, 'happy', -6); st(L, 'bond', -3);
  }, 'Вас травили в школе, и взрослые говорили: «сам разберёшься».');

  V('protected-by-teacher', 'Учитель заступился', 'случай', function () { return 1; }, function (L) {
    st(L, 'happy', 3); st(L, 'know', 3);
  });

  V('earthquake-child', 'Землетрясение', 'случай', function (L) { return ['tr', 'ir', 'jp', 'id', 'np', 'cl', 'pe', 'mx', 'ph'].indexOf(L.c.code) >= 0 ? 1.8 : 0.1; }, function (L) {
    st(L, 'health', -3); st(L, 'happy', -3);
  });

  V('flood-child', 'Большое наводнение', 'случай', function (L) { return ['bd', 'in', 'pk', 'vn', 'th', 'mz', 'br'].indexOf(L.c.code) >= 0 ? 1.8 : 0.3; }, function (L) {
    st(L, 'health', -2); L.famPct = clamp(L.famPct - 0.05, 0.02, 1);
  });

  V('hurricane-child', 'Ураган', 'случай', function (L) { return ['ph', 'cu', 'ht', 'jm', 'us', 'mx', 'bs'].indexOf(L.c.code) >= 0 ? 1.4 : 0.1; }, function (L) {
    st(L, 'health', -2); st(L, 'happy', -2);
  });

  V('family-moved-city', 'Семья переехала в город', 'случай', function (L) { return !rich(L.c) ? 1.6 : 0.6; }, function (L) {
    L.flag('moved', true); st(L, 'know', 3); st(L, 'bond', -2); L.urban = true;
  });

  V('scholarship-child', 'Стипендия с детства', 'случай', function () { return 0.7; }, function (L) {
    st(L, 'know', 5); L.flag('spotted', true);
  });

  V('neighbour-mentor', 'Сосед-наставник', 'случай', function () { return 1; }, function (L) {
    st(L, 'know', 4); st(L, 'bond', 2); L.flag('hands', true);
  });

  V('lost-parent-job', 'Родитель потерял работу', 'случай', function () { return 1.4; }, function (L) {
    L.famPct = clamp(L.famPct - 0.08, 0.02, 1); st(L, 'happy', -3);
  });

  V('family-won-flat', 'Семье дали квартиру', 'случай', function (L) { return old(L) && !rich(L.c) ? 1.4 : 0.2; }, function (L) {
    st(L, 'happy', 4); L.famPct = clamp(L.famPct + 0.05, 0, 1);
  });

  V('stolen-bike', 'Украли велосипед', 'случай', function () { return 1.1; }, function (L) { st(L, 'happy', -2); });

  V('rescued-animal', 'Подобрали щенка', 'случай', function () { return 1.2; }, function (L) {
    st(L, 'happy', 3); st(L, 'bond', 2); L.flag('pet', true);
  });

  V('long-trip-child', 'Дальняя поездка в детстве', 'случай', function (L) { return !poor(L.c) ? 1.2 : 0.4; }, function (L) {
    st(L, 'know', 3); st(L, 'happy', 2);
  });

  V('fire-at-school', 'Пожар в школе', 'случай', function () { return 0.5; }, function (L) { st(L, 'happy', -2); st(L, 'know', -1); });

  var CONFLICT = [
    ['triplet', 'only-child'], ['many-siblings', 'only-child'], ['big-brother', 'only-child'],
    ['sister-close', 'only-child'], ['many-cousins', 'only-child'], ['optimist', 'pessimist'],
    ['patient', 'impatient'], ['thrifty', 'spender'], ['generous', 'sly'], ['honest', 'sly'],
    ['single-mother', 'warm-home'], ['foster-care', 'warm-home'], ['foster-care', 'orphan'],
    ['foster-care', 'adopted'], ['debt-family', 'large-dowry'], ['large-dowry', 'poor-family'],
    ['debt-family', 'rich-family'], ['house-with-garden', 'two-rooms-five'], ['no-running-water', 'new-flat'],
    ['air-conditioner', 'no-running-water'], ['nineties', 'post-war-years'], ['pandemic-kid', 'radio-era'],
    ['ai-childhood', 'radio-era'], ['internet-dialup', 'radio-era'], ['melancholic', 'optimist'],
    ['joker', 'melancholic'], ['bookworm', 'street-smart'], ['capital-suburb', 'village-far'],
    ['small-island-born', 'steppe'], ['tundra', 'jungle'], ['high-altitude', 'seaside'],
    ['young-parents', 'old-parents'], ['strong-immunity', 'weak-lungs'], ['big-family-body', 'birth-injury'],
    ['sweet-sleep', 'colic-baby'], ['family-moved-city', 'village-far'], ['farm-family', 'capital-born'],
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
