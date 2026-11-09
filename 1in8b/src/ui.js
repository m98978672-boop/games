/* ============================================================
   1 ИЗ 8 МИЛЛИАРДОВ — интерфейс.
   Рендер стартового экрана, панелей жизни, карточек решений,
   модальных окон и финального экрана.
   ============================================================ */
(function () {
  'use strict';

  var M = window.IN8B.model;
  var C = window.IN8B.countries;
  var N = window.IN8B.names;
  var EN = window.IN8B.engine;
  var CH = window.IN8B.charts;
  var SAVE = window.IN8B.save;

  function el(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* --------------------------- валюты --------------------------------- */
  /* множитель: сколько местных единиц в одном межд. долларе по ППС (приближённо) */
  var CURRENCIES = [
    { id: 'local', name: 'Валюта страны', sym: '', k: 1, of: '', local: true },
    { id: 'rub', name: 'Россия (₽)', sym: '₽', k: 30, of: 'по ценам России' },
    { id: 'kzt', name: 'Казахстан (₸)', sym: '₸', k: 190, of: 'по ценам Казахстана' },
    { id: 'uah', name: 'Украина (₴)', sym: '₴', k: 13, of: 'по ценам Украины' },
    { id: 'byn', name: 'Беларусь (Br)', sym: 'Br', k: 1.1, of: 'по ценам Беларуси' },
    { id: 'eur', name: 'Германия (€)', sym: '€', k: 0.73, of: 'по ценам Германии' },
    { id: 'usd', name: 'США ($)', sym: '$', k: 1, of: 'по ценам США' },
    { id: 'inr', name: 'Индия (₹)', sym: '₹', k: 22, of: 'по ценам Индии' },
    { id: 'try', name: 'Турция (₺)', sym: '₺', k: 11, of: 'по ценам Турции' },
    { id: 'int', name: 'Межд. $ (ППС)', sym: '$', k: 1, of: 'в международных долларах' }
  ];
  var currency = CURRENCIES[0];
  var localCur = C.currencyOf(null);          /* валюта страны, где идёт жизнь */
  var RUB = 30;                               /* рублей за межд. доллар (ППС) */

  function setCurrency(id) {
    for (var i = 0; i < CURRENCIES.length; i++) if (CURRENCIES[i].id === id) currency = CURRENCIES[i];
  }
  /* чем считаем деньги прямо сейчас: валютой страны или выбранной вручную */
  function cur() { return currency.local ? localCur : currency; }
  /* страна жизни задаёт валюту: найра в Нигерии, иена в Японии, рубль в России */
  function useCountry(life) {
    if (life && life.c) localCur = C.currencyOf(life.c);
    return localCur;
  }
  function money(v) { var u = cur(); return M.fmtMoney(v * u.k) + ' ' + u.sym; }
  /* перевод в рубли — второй строкой, мелким шрифтом */
  function rub(v) {
    if (cur().sym === '₽') return '';
    return '≈ ' + M.fmtMoney(v * RUB) + ' ₽';
  }
  function rubTag(v, cls) {
    var t = rub(v);
    return t ? '<small class="in-rub' + (cls ? ' ' + cls : '') + '">' + t + '</small>' : '';
  }
  /* «12 000 ₦ · ≈ 2 300 ₽» — одной строкой, где нет места на вторую */
  function moneyBoth(v) { var t = rub(v); return money(v) + (t ? ' · ' + t : ''); }
  function moneyPPP(v) { return cur().sym === '$' && cur().k === 1 ? '' : M.fmtMoney(v) + ' $ ППС'; }
  /* подпись под суммой: рубли, а если считаем в рублях — межд. доллары */
  function subMoney(v) { return rub(v) || moneyPPP(v); }

  /* --------------------------- модальные окна -------------------------- */
  var modalStack = [];

  function modal(html, opts) {
    opts = opts || {};
    var root = el('modal-root');
    var wrap = document.createElement('div');
    wrap.className = 'modal-backdrop';
    wrap.innerHTML = '<div class="modal ' + (opts.cls || '') + '" role="dialog" aria-modal="true">' + html + '</div>';
    root.appendChild(wrap);
    root.classList.add('open');
    if (opts.cls) root.classList.add(opts.cls);
    if (!opts.sticky) {
      wrap.addEventListener('click', function (e) { if (e.target === wrap) close(wrap); });
    }
    modalStack.push(wrap);
    return wrap;
  }

  function close(wrap) {
    var root = el('modal-root');
    if (wrap && wrap.parentNode) wrap.parentNode.removeChild(wrap);
    modalStack = modalStack.filter(function (w) { return w !== wrap; });
    if (!root.children.length) { root.className = 'modal-root'; }
    if (wrap && wrap.onClosed) { var f = wrap.onClosed; wrap.onClosed = null; try { f(); } catch (e) { /* ignore */ } }
  }

  function closeTop() { if (modalStack.length) close(modalStack[modalStack.length - 1]); }

  function toast(text, kind) {
    var box = el('toasts');
    var t = document.createElement('div');
    t.className = 'toast ' + (kind || '');
    t.textContent = text;
    box.appendChild(t);
    setTimeout(function () { t.classList.add('out'); }, 2600);
    setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 3100);
  }

  /* --------------------------- стартовый экран ------------------------- */

  function fillStartSelects(settings) {
    var home = el('sel-home');
    C.list.slice().sort(function (a, b) { return a.name.localeCompare(b.name, 'ru'); }).forEach(function (c) {
      var o = document.createElement('option');
      o.value = c.code; o.textContent = c.name;
      home.appendChild(o);
    });
    home.value = settings.homeCountry || '';

    var cur = el('sel-currency');
    CURRENCIES.forEach(function (c) {
      var o = document.createElement('option');
      o.value = c.id; o.textContent = c.name;
      cur.appendChild(o);
    });
    cur.value = settings.currency || 'local';
    setCurrency(cur.value);

    var yr = el('sel-year');
    for (var y = 2025; y >= 1950; y--) {
      var o2 = document.createElement('option');
      o2.value = String(y); o2.textContent = String(y);
      yr.appendChild(o2);
    }
    el('country-count').textContent = String(C.list.length);
  }

  function renderPastList() {
    var list = SAVE.pastLives();
    var box = el('past-list');
    var st = SAVE.stats();
    el('past-count').textContent = list.length
      ? list.length + ' · средний возраст ' + st.avgAge.toFixed(0) + ' · стран: ' + st.countries
      : '';
    if (!list.length) {
      box.innerHTML = '<p class="empty">Пока ни одной прожитой жизни. Проживите первую — она сохранится здесь.</p>';
      return;
    }
    box.innerHTML = '';
    list.forEach(function (l) {
      var d = document.createElement('div');
      d.className = 'past-item';
      d.innerHTML = '<div><b>' + esc(l.name) + '</b><span>' + l.born + ' – ' + l.died + ' · ' + esc(l.country) +
        ' · ' + esc(l.cause || '') + '</span></div><div class="age">' + l.age + '</div>';
      d.addEventListener('click', function () { pastLifeModal(l); });
      box.appendChild(d);
    });
  }

  function pastLifeModal(l) {
    var ach = (l.achievements || []).map(function (a) {
      return '<span class="ach">' + a.icon + ' ' + esc(a.t) + '</span>';
    }).join('');
    var starred = (l.starred || []).map(function (s) {
      return '<div class="log-item"><span class="ag">' + s.age + '</span><span class="tx">' + esc(s.text) + '</span><span></span></div>';
    }).join('') || '<p class="empty">Отмеченных моментов нет.</p>';
    var notes = (l.notes || []).map(function (n) {
      return '<p class="hint">' + n.age + ' лет: «' + esc(n.text) + '»</p>';
    }).join('');
    modal('<div class="modal-head"><h2>' + esc(l.name) + '</h2><button class="icon-btn x" data-close>✕</button></div>' +
      '<p class="end-years">' + l.born + ' – ' + l.died + ' · ' + esc(l.country) + ' · ' + l.age + ' лет</p>' +
      '<p class="end-summary">' + esc(l.summary) + '</p>' +
      '<p class="end-epitaph">«' + esc(l.epitaph) + '»</p>' +
      '<div class="end-achievements">' + ach + '</div>' +
      '<h3>Отмеченные моменты</h3><div class="log small">' + starred + '</div>' + notes);
    bindClose();
  }

  function bindClose() {
    var root = el('modal-root');
    root.querySelectorAll('[data-close]').forEach(function (b) {
      b.addEventListener('click', function () { close(b.closest('.modal-backdrop')); });
    });
  }

  /* ------------------------- окно всех стран --------------------------- */

  function countriesModal(mode) {
    var rows = C.list.slice().sort(function (a, b) { return b.births - a.births; });
    var html = '<div class="modal-head"><h2>Статистика ' + C.list.length + ' стран и территорий</h2>' +
      '<button class="icon-btn x" data-close>✕</button></div>' +
      '<p class="src">Доля в мировых рождениях, ожидаемая продолжительность жизни, смертность до 5 лет, ВВП на душу по ППС, ' +
      'средние годы учёбы и рождаемость. Числа приближённые: ООН, Всемирный банк, ВОЗ, ЮНЕСКО.</p>' +
      '<input class="note-input" id="country-search" style="min-height:0;padding:9px" placeholder="Поиск страны…">' +
      '<div style="max-height:52vh;overflow:auto;margin-top:10px"><table class="tbl" id="country-table"><tbody>' +
      rows.map(function (c) {
        return '<tr data-name="' + esc(c.name.toLowerCase()) + '"><td>' + esc(c.name) + '</td>' +
          '<td>' + (C.birthShare(c) * 100).toFixed(2).replace('.', ',') + '%</td>' +
          '<td>' + c.le.toFixed(1).replace('.', ',') + ' лет</td>' +
          '<td>' + c.u5mr.toFixed(0) + '/1000</td>' +
          '<td>' + M.fmtMoney(c.gdp) + ' $</td>' +
          '<td>' + c.school.toFixed(1).replace('.', ',') + ' кл.</td>' +
          '<td>' + c.tfr.toFixed(1).replace('.', ',') + '</td></tr>';
      }).join('') + '</tbody></table></div>';
    modal(html, { cls: 'wide' });
    bindClose();
    var s = el('country-search');
    s.addEventListener('input', function () {
      var q = s.value.trim().toLowerCase();
      el('country-table').querySelectorAll('tr').forEach(function (tr) {
        tr.style.display = !q || tr.dataset.name.indexOf(q) >= 0 ? '' : 'none';
      });
    });
  }

  /* -------------------- «какой у меня номер среди 8 млрд» -------------- */

  function whoModal() {
    modal('<div class="modal-head"><h2>Какой у вас номер среди 8 миллиардов?</h2>' +
      '<button class="icon-btn x" data-close>✕</button></div>' +
      '<p>Укажите дату рождения — посчитаем, сколько примерно людей родилось в мире в тот же день, ' +
      'каким по счёту вы могли оказаться среди живущих и какой была численность вашего года рождения.</p>' +
      '<label class="inline-field">Дата рождения<input class="note-input" type="date" id="who-date" style="min-height:0;padding:9px"></label>' +
      '<div id="who-result"></div>' +
      '<div class="modal-actions"><button class="btn btn-primary" id="who-go">Посчитать</button></div>');
    bindClose();
    el('who-go').addEventListener('click', function () {
      var v = el('who-date').value;
      if (!v) { el('who-result').innerHTML = '<p class="hint">Сначала выберите дату.</p>'; return; }
      var d = new Date(v + 'T00:00:00');
      var year = d.getFullYear();
      var perDay = year < 1970 ? 300000 : year < 1990 ? 360000 : year < 2010 ? 375000 : 365000;
      var perYear = perDay * 365;
      var age = Math.max(0, new Date().getFullYear() - year);
      var alive = Math.round(perYear * Math.max(0.55, 1 - age * 0.006) / 1e6);
      var order = Math.round(perDay * (0.2 + Math.random() * 0.6));
      el('who-result').innerHTML =
        '<ul class="kv" style="margin-top:12px">' +
        '<li><span>Родилось в мире в этот день</span><b>≈ ' + M.fmtNum(perDay) + '</b></li>' +
        '<li><span>Ваш примерный номер среди них</span><b>' + M.fmtNum(order) + '-й</b></li>' +
        '<li><span>Сверстников родилось за год</span><b>≈ ' + M.fmtNum(Math.round(perYear / 1e6)) + ' млн</b></li>' +
        '<li><span>Из них живы сегодня</span><b>≈ ' + M.fmtNum(alive) + ' млн</b></li>' +
        '<li><span>Доля среди 8 миллиардов</span><b>0,0000000125 %</b></li></ul>' +
        '<p class="hint">Оценка по мировой статистике рождений, а не запись актов гражданского состояния.</p>';
    });
  }

  /* ------------------------ карточка рождения -------------------------- */

  function birthCard(life, onStart) {
    useCountry(life);
    var c = life.c;
    var q = Math.min(5, Math.floor(life.famPct * 5) + 1);
    var dots = '';
    for (var i = 1; i <= 5; i++) dots += i <= q ? '●' : '○';
    var band = life.famPct < 0.2 ? 'нижние 20%' : life.famPct < 0.4 ? 'нижние 20–40%'
      : life.famPct < 0.6 ? 'средние 40–60%' : life.famPct < 0.8 ? 'верхние 20–40%' : 'верхние 20%';
    var MONTH = ['январе', 'феврале', 'марте', 'апреле', 'мае', 'июне', 'июле',
      'августе', 'сентябре', 'октябре', 'ноябре', 'декабре'];
    var month = MONTH[Math.abs(hash32(life.seed + 'm')) % 12];
    var place = N && N.place ? N.place(life.base.code, life.seed, life.urban)
      : (life.urban ? 'город' : 'село');
    var no = c.code.toUpperCase() + '-' + life.birthYear + '-' +
      String(Math.abs(hash32(life.seed)) % 10000000).padStart(7, '0');
    var le = (life.sex === 'f' ? c.leF : c.leM);
    var minutes = life.settings.lifeMinutes;
    var yearSec = Math.round((minutes * 60) / Math.max(le, 25));
    var kids = life.siblings
      ? 'У вас ' + life.siblings + ' ' +
        M.plural(life.siblings, 'брат или сестра', 'брата или сестры', 'братьев и сестёр') + '. '
      : 'Вы единственный ребёнок в семье. ';

    function cell(label, value) {
      return '<div class="bc"><span>' + label + '</span><b>' + value + '</b></div>';
    }

    var w = modal('<div class="birth-doc">' +
      '<div class="birth-head"><b>Регистрация рождения</b><span>No. ' + no + '</span></div>' +
      '<div class="birth-body">' +
      '<span class="bc-label">имя</span>' +
      '<h2 class="birth-name">' + esc(life.name) + '</h2>' +
      '<p class="birth-lede">В ' + month + ' ' + life.birthYear + ' года вы родились ' +
      (life.sex === 'f' ? 'девочкой' : 'мальчиком') + ' — ' + esc(place) + ', ' + esc(c.name) +
      '. Семья из группы «' + band + '». ' + kids + '</p>' +
      '<p class="birth-note">Чтобы прожить жизнь до ожидаемой продолжительности, нужно примерно ' +
      minutes + ' мин (1 год ≈ ' + yearSec + ' с). Если закрыть страницу, жизнь сохранится в этом браузере ' +
      'и продолжится, когда вы вернётесь.</p>' +
      '<div class="birth-grid">' +
      cell('пол', life.sex === 'f' ? 'Женский пол' : 'Мужской пол') +
      cell('страна рождения', esc(c.name)) +
      cell('место рождения', esc(place) + (life.urban ? ' (город)' : '')) +
      cell('доход семьи', '<i class="quint">' + dots + '</i> квинтиль ' + q + '<br><small>· ' + band + ' в стране</small>') +
      cell('доход семьи на человека', money(life.famIncome) + ' в год' + rubTag(life.famIncome)) +
      cell('шанс родиться здесь', (C.birthShare(life.base) * 100).toFixed(2).replace('.', ',') + '%') +
      cell('ожидаемая продолжительность жизни', le.toFixed(1).replace('.', ',') + ' года') +
      cell('вероятность умереть до 5 лет', (c.u5mr / 10).toFixed(1).replace('.', ',') + '%') +
      cell('ВВП на человека', money(c.gdp) + ' в год' + rubTag(c.gdp)) +
      '</div>' +
      (varNames(life).length
        ? '<p class="birth-note"><b>Чем эта жизнь особенная:</b> ' + esc(varNames(life).join(' · ')) + '.</p>'
        : '') +
      '<label class="inline-field">Имя можно изменить' +
      '<input class="note-input" id="birth-name" style="min-height:0;padding:9px" value="' + esc(life.name) + '"></label>' +
      '<div class="modal-actions"><button class="btn btn-primary" id="birth-go">Начать эту жизнь</button></div>' +
      '</div></div>',
      { sticky: true, cls: 'birth-modal' });
    el('birth-go').addEventListener('click', function () {
      var nm = el('birth-name').value.trim();
      if (nm) life.name = nm;
      close(w);
      onStart();
    });
  }

  function hash32(str) {
    var h = 2166136261;
    for (var i = 0; i < String(str).length; i++) {
      h ^= String(str).charCodeAt(i);
      h = (h * 16777619) >>> 0;
    }
    return h >>> 0;
  }

  /* --------------------------- панели жизни ---------------------------- */

  var STAT_META = [
    { k: 'health', n: 'Здоровье', c: 'health' },
    { k: 'happy', n: 'Счастье', c: 'happy' },
    { k: 'know', n: 'Знания', c: 'know' },
    { k: 'bond', n: 'Отношения', c: 'bond' }
  ];

  var BUDGET_PRESETS = [
    { n: 'Баланс', b: { food: .34, health: .1, edu: .1, home: .18, fun: .1, family: .08, save: .1 } },
    { n: 'Выживание', b: { food: .55, health: .12, edu: .03, home: .2, fun: .03, family: .05, save: .02 } },
    { n: 'Всё в учёбу', b: { food: .3, health: .08, edu: .3, home: .15, fun: .05, family: .05, save: .07 } },
    { n: 'Здоровье прежде всего', b: { food: .33, health: .27, edu: .07, home: .16, fun: .07, family: .05, save: .05 } },
    { n: 'Для семьи', b: { food: .33, health: .1, edu: .12, home: .18, fun: .07, family: .15, save: .05 } },
    { n: 'Копить', b: { food: .3, health: .08, edu: .05, home: .14, fun: .05, family: .05, save: .33 } }
  ];

  function stageName(age) {
    if (age < 3) return 'младенчество';
    if (age < 7) return 'детство';
    if (age < 13) return 'школьные годы';
    if (age < 20) return 'юность';
    if (age < 30) return 'молодость';
    if (age < 45) return 'зрелость';
    if (age < 60) return 'середина пути';
    if (age < 75) return 'поздние годы';
    return 'старость';
  }

  function renderPerson(life) {
    useCountry(life);
    var where = N && N.place ? N.place(life.base.code, life.seed, life.urban) : (life.urban ? 'город' : 'село');
    el('hud-country').textContent = where + ', ' + life.c.name;
    el('hud-age').textContent = life.age;
    el('hud-year').textContent = life.year;
    el('hud-name').textContent = life.name;
    el('hud-income').textContent = money(life.income);
    el('hud-money').textContent = money(life.money);
    el('income-rub').textContent = life.income > 0 ? subMoney(life.income) : '';
    /* У ребёнка «доход» — это карманные и подработки, а не зарплата.
       Деньги, которые семья тратит на него, идут отдельной строкой:
       своими они не становятся и в копилку не попадают. */
    var kidMoney = life.minorYear && life.age < 18;
    el('income-title').textContent = kidMoney ? 'Свои деньги за год' : 'Доход за год';
    el('income-month').textContent = life.income > 0
      ? money(life.income / 12) + ' в месяц' + (kidMoney ? ' на руках' : '')
      : (kidMoney ? 'своих денег пока нет' : 'дохода пока нет');
    el('income-support').textContent = life.support > 0
      ? 'семья тратит на вас ' + money(life.support) + ' в год' : '';
    el('income-sources').textContent = payNote(life);
    /* место по достатку у ребёнка считается по семье: карманные деньги
       говорят не о том, как человек живёт, а о том, сколько ему дают */
    var inc = rankIncome(life);
    var byFamily = life.minorYear || !(life.income > 0);
    var pct = Math.round(M.percentileOfIncome(life.c, inc) * 100);
    el('money-rank').textContent = life.c.name + ': верхние ' + Math.max(1, 100 - pct) + '%' +
      (byFamily ? ' (по доходу семьи)' : '');
    var wpct = Math.round(M.worldPercentile(inc) * 100);
    el('money-rank-world').textContent = 'верхние ' + Math.max(1, 100 - wpct) + '% человечества';
    el('income-partner').textContent = life.partnerIncome > 0
      ? 'из них ' + (life.sex === 'f' ? 'муж' : 'жена') + ' — ' + money(life.partnerIncome) : '';
    el('money-basis').textContent = currency.local ? localCur.name : currency.of;
    el('money-ppp').textContent = subMoney(life.money);
    var h = life.history;
    var prev = h.length > 1 ? h[h.length - 2].money : 0;
    var dm = Math.round(life.money - prev);
    var dEl = el('money-delta');
    dEl.textContent = h.length < 2 ? 'за прошлый год —'
      : (dm > 0 ? '+' : dm < 0 ? '−' : '') + money(Math.abs(dm)) + ' за год';
    dEl.className = dm > 0 ? 'up' : dm < 0 ? 'down' : '';
    el('p-name').textContent = life.name;
    el('p-sub').textContent = (life.sex === 'f' ? 'женщина' : 'мужчина') + ' · ' + life.c.name + ' · ' + life.birthYear;
    renderSpendNote(life);
    renderInvestNote(life);
    var IVP = window.IN8B.invest ? window.IN8B.invest.portfolio(life) : null;
    var capRow = el('money-capital-row');
    if (capRow && IVP) {
      capRow.hidden = !(IVP.total > 0 || life.capitalIncome > 0);
      if (!capRow.hidden) {
        el('money-capital').textContent = moneyBoth(IVP.total) +
          (life.capitalIncome ? ' · ' + money(life.capitalIncome) + ' за год' : '');
      }
    }
    el('year-age-label').textContent = life.age + ' ' + M.plural(life.age, 'год', 'года', 'лет');
    el('year-stage').textContent = stageName(life.age);

    var eduWord = ['нет школы', 'начальная школа', 'неполная средняя', 'средняя школа',
      'специальность', 'высшее', 'учёная степень'][life.edu.level];
    var jobWord = life.retired ? 'на пенсии'
      : life.job ? M.jobTitle(M.jobById[life.job.id], life.job.step)
        : life.edu.inSchool ? 'учится' : (life.age >= 16 ? 'без работы' : 'ребёнок');
    if (life.homeless) jobWord = life.job ? jobWord + ', без дома' : 'без дома';
    /* как устроена работа: оформление, график, нагрузка */
    var workWord = '';
    if (life.job) {
      var jw = [];
      jw.push(life.job.contract === 'official' ? 'по договору'
        : life.job.contract === 'grey' ? 'часть в конверте' : 'без оформления');
      if (life.job.schedule === 'night') jw.push('ночные смены');
      else if (life.job.schedule === 'shift') jw.push('сменами');
      else if (life.job.schedule === 'rotation') jw.push('вахтой');
      if (life.job.remote) jw.push('из дома');
      if (life.job.overtime) jw.push('переработки');
      if (life.job.union) jw.push('профсоюз');
      if (life.job.burnout > 60) jw.push('выгорание');
      workWord = jw.join(' · ');
    }
    el('p-kv').innerHTML =
      '<li><span>Занятие</span><b>' + esc(jobWord) + '</b></li>' +
      (workWord ? '<li><span>Работа</span><b>' + esc(workWord) + '</b></li>' : '') +
      '<li><span>Образование</span><b>' + eduWord + '</b></li>' +
      '<li><span>Достаток в стране</span><b>' +
      Math.round(M.percentileOfIncome(life.c, rankIncome(life)) * 100) + '-й перцентиль</b></li>' +
      (life.homeless
        ? '<li><span>Без дома</span><b>' + life.homeless + '-й год</b></li>'
        : life.has('wasHomeless')
          ? '<li><span>Было без дома</span><b>' + (life.streetTotal || 0) + ' ' +
            M.plural(life.streetTotal || 0, 'год', 'года', 'лет') + '</b></li>' : '') +
      (life.loan
        ? '<li><span>Кредит</span><b>' + money(life.loan.left) + ' · по ' + money(life.loan.pay) +
          ' в год' + (life.loan.miss ? ' · просрочек: ' + life.loan.miss : '') +
          rubTag(life.loan.left) + '</b></li>'
        : '') +
      (life.talents.length ? '<li><span>Талант</span><b>' + esc(life.talents.join(', ')) + '</b></li>' : '') +
      (varNames(life).length
        ? '<li><span>Обстоятельства</span><b>' + esc(varNames(life).join(', ')) + '</b></li>' : '') +
      (life.minorYear && life.support > 0
        ? '<li><span>Вас содержит семья</span><b>' + money(life.support) + ' в год' +
          rubTag(life.support) + '</b></li>' : '');
  }

  /* по каким деньгам сравнивать человека со страной и миром */
  function rankIncome(life) {
    if (life.minorYear) return Math.max(life.famIncome, 1);
    return Math.max(life.income || life.famIncome, 1);
  }

  /* вариации этой жизни — человеческими словами */
  function varNames(life) {
    var VR = window.IN8B.variations;
    if (!VR || !life.variations) return [];
    return life.variations.map(function (id) {
      var v = VR.byId[id];
      return v ? v.name : null;
    }).filter(Boolean);
  }

  /* откуда в этом году приходили деньги: форма оплаты и подработки */
  function payNote(life) {
    var PAY = window.IN8B.pay;
    if (!PAY) return '';
    var out = [];
    if (life.payWage && life.job) {
      var w = PAY.byId[life.payWage];
      if (w) out.push(w.name.toLowerCase());
    }
    (life.payActive || []).forEach(function (id) {
      var p = PAY.byId[id];
      if (p) out.push(p.name.toLowerCase());
    });
    if (!out.length) return '';
    if (out.length > 3) out = out.slice(0, 3).concat('и ещё ' + (out.length - 3));
    return 'откуда: ' + out.join(', ');
  }

  function renderStats(life) {
    el('stat-bars').innerHTML = STAT_META.map(function (s) {
      var v = Math.round(life.stats[s.k]);
      return '<div class="stat-row ' + s.c + '"><span class="nm">' + s.n + '</span>' +
        '<span class="tr"><i style="width:' + v + '%"></i></span><span class="vl">' + v + '</span></div>';
    }).join('');
  }

  function renderBudget(life, onChange) {
    useCountry(life);
    var box = el('budget-list');
    var inc = Math.max(life.income, 0);
    el('budget-sum').textContent = 'Годовой доход ' + money(inc) + '. Распределите его — проценты пересчитываются сами.';
    box.innerHTML = EN.budgetMeta.map(function (m) {
      var share = life.budget[m.id];
      return '<div class="b-row" data-id="' + m.id + '">' +
        '<span class="b-name">' + m.icon + ' ' + m.name + '</span>' +
        '<span class="b-val">' + Math.round(share * 100) + '%</span>' +
        '<input type="range" min="0" max="100" value="' + Math.round(share * 100) + '" aria-label="' + m.name + '">' +
        '<span class="b-money">' + money(inc * share) + ' в год' + rubTag(inc * share, 'inline') +
        ' · ' + m.hint + '</span>' +
        '</div>';
    }).join('');

    box.querySelectorAll('input[type=range]').forEach(function (r) {
      r.addEventListener('input', function () {
        var id = r.closest('.b-row').dataset.id;
        setShare(life, id, Number(r.value) / 100);
        renderBudget(life, onChange);
        if (onChange) onChange();
      });
    });

    var pr = el('budget-presets');
    if (!pr.childElementCount) {
      BUDGET_PRESETS.forEach(function (p) {
        var b = document.createElement('button');
        b.textContent = p.n;
        b.addEventListener('click', function () {
          Object.keys(p.b).forEach(function (k) { life.budget[k] = p.b[k]; });
          renderBudget(life, onChange);
          if (onChange) onChange();
          toast('Бюджет: ' + p.n);
        });
        pr.appendChild(b);
      });
    }
  }

  /* изменение одной доли с пересчётом остальных до 100% */
  function setShare(life, id, value) {
    var b = life.budget;
    var others = Object.keys(b).filter(function (k) { return k !== id; });
    var restOld = others.reduce(function (s, k) { return s + b[k]; }, 0);
    var rest = Math.max(0, 1 - value);
    b[id] = value;
    others.forEach(function (k) {
      b[k] = restOld > 0 ? b[k] / restOld * rest : rest / others.length;
    });
  }

  function renderFocus(life, onChange) {
    var box = el('focus-list');
    box.innerHTML = '';
    EN.focusList.forEach(function (f) {
      if (life.age < f.minAge) return;
      var b = document.createElement('button');
      b.className = life.focus === f.id ? 'on' : '';
      b.innerHTML = f.icon + ' ' + f.name;
      b.title = f.desc;
      b.addEventListener('click', function () {
        life.focus = f.id;
        renderFocus(life, onChange);
        if (onChange) onChange();
      });
      box.appendChild(b);
    });
  }

  function renderLog(life) {
    var box = el('log-list');
    var atTop = box.scrollTop < 40;
    box.innerHTML = life.log.map(function (e, i) {
      return { e: e, i: i };
    }).reverse().map(function (r, n) {
      var e = r.e;
      return '<div class="log-item k-' + e.kind + (e.starred ? ' starred' : '') + (n === 0 ? ' fresh' : '') +
        '" data-i="' + r.i + '">' +
        '<span class="ag">' + e.age + ' ' + M.plural(e.age, 'год', 'года', 'лет') + '</span>' +
        '<span class="tx">' + esc(e.text) + '</span>' +
        '<span class="st">☆</span></div>';
    }).join('');
    box.querySelectorAll('.log-item').forEach(function (d) {
      d.addEventListener('click', function () {
        var e = life.log[Number(d.dataset.i)];
        e.starred = !e.starred;
        d.classList.toggle('starred', e.starred);
      });
    });
    if (atTop) box.scrollTop = 0;
  }

  function renderFamily(life) {
    useCountry(life);
    var kids = life.children.length
      ? life.children.map(function (k) { return k.name + ' (' + (life.age - k.bornAt) + ')'; }).join(', ')
      : '—';
    var maritalWord = { single: 'не в браке', married: 'в браке', partner: 'живут вместе', divorced: 'в разводе', widowed: 'вдовство' }[life.marital];
    el('family-kv').innerHTML =
      '<li><span>Семейное положение</span><b>' + maritalWord + '</b></li>' +
      (life.partner ? '<li><span>Супруг</span><b>' + esc(life.partner.name) + '</b></li>' : '') +
      '<li><span>Дети</span><b>' + esc(kids) + '</b></li>' +
      (life.grandchildren ? '<li><span>Внуки</span><b>' + life.grandchildren + '</b></li>' : '') +
      '<li><span>Родители</span><b>' + (life.parentsAlive ? life.parentsAlive + ' живы' : 'ушли') + '</b></li>' +
      '<li><span>Братья и сёстры</span><b>' + life.siblings + '</b></li>' +
      '<li><span>Жильё</span><b>' + (life.home ? 'своё' : 'съёмное или родительское') + '</b></li>' +
      (life.abroad ? '<li><span>Живёт</span><b>за границей</b></li>' : '') +
      (life.business ? '<li><span>Своё дело</span><b>да</b></li>' : '') +
      '<li><span>Сбережения</span><b>' + money(life.money) + rubTag(life.money) + '</b></li>';
  }

  function peerLine(p, age) {
    if (p.deathAge < age) {
      return (p.sex === 'f' ? 'ушла' : 'ушёл') + ' в ' + p.deathAge + ' ' +
        M.plural(p.deathAge, 'год', 'года', 'лет') + (p.cause ? ' · ' + p.cause : '');
    }
    var h = null;
    for (var i = 0; i < p.history.length; i++) if (p.history[i].age === age) h = p.history[i];
    if (!h) return '—';
    var bits = [h.job || (age < 6 ? 'дошкольник' + (p.sex === 'f' ? 'ница' : '')
      : age < 18 ? 'учится' : 'без работы')];
    if (h.married) bits.push('в браке');
    if (h.kids) bits.push(h.kids + ' ' + M.plural(h.kids, 'ребёнок', 'ребёнка', 'детей'));
    return bits.join(' · ');
  }

  function renderPeers(peers, age, box) {
    box = box || el('peers-list');
    box.innerHTML = peers.map(function (p) {
      var gone = p.deathAge < age;
      return '<div class="peer' + (gone ? ' gone' : '') + '">' +
        '<div class="peer-top"><b>' + esc(p.name) + '</b>' +
        '<span>' + esc(p.country) + ' · ' + (p.sex === 'f' ? 'Ж' : 'М') + '</span></div>' +
        '<div class="st">' + esc(peerLine(p, age)) + '</div></div>';
    }).join('');
  }

  function renderLifeMap(life) {
    CH.lifeMap(el('life-map'), life);
    CH.statLines(el('stat-canvas'), life);
  }

  function renderAll(life, peers, onChange) {
    useCountry(life);
    renderPerson(life);
    renderStats(life);
    renderBudget(life, onChange);
    renderFocus(life, onChange);
    renderLog(life);
    renderFamily(life);
    renderPeers(peers, life.age);
    renderLifeMap(life);
  }

  /* ----------------------- меню «ещё» на телефоне ---------------------- */

  var MORE_ITEMS = [
    ['btn-skip', 'До следующего решения »'], ['btn-auto', 'Авторежим'],
    ['btn-spend', '🛒 Траты этого года'], ['btn-invest', '📈 Вложения и своё дело'],
    ['btn-anims', 'Все движения сцены'], ['btn-things', 'Текстуры и вещи'],
    ['btn-pauses', '✎ Когда ставить паузу'], ['btn-music', '♪ Музыка'],
    ['btn-help', 'Как играть'], ['btn-quit', 'Сохранить и выйти']
  ];

  function moreModal() {
    var w = modal('<h2>Ещё</h2><div class="more-list">' + MORE_ITEMS.map(function (it) {
      var b = el(it[0]);
      if (!b) return '';
      var on = b.classList.contains('on') ? ' on' : '';
      return '<button class="more-item' + on + '" data-go="' + it[0] + '">' + esc(it[1]) + '</button>';
    }).join('') + '</div>', { cls: 'more' });
    w.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-go]');
      if (!b) return;
      closeTop();
      var real = el(b.dataset.go);
      if (real) real.click();
    });
    return w;
  }

  /* ------------------------- когда ставить паузу ----------------------- */

  var PAUSE_ROWS = [
    { id: 'decision', t: 'На решениях', h: 'Время всегда ждёт вашего выбора', fixed: true },
    { id: 'big', t: 'На событиях, которые меняют жизнь', h: 'Рождение, свадьба, утрата, работа, болезнь' },
    { id: 'year', t: 'Каждый год', h: 'Пауза на каждый день рождения' },
    { id: 'buy', t: 'Когда появляются новые траты', h: 'Пауза, если в этом году можно что-то купить' }
  ];

  function pausesModal(settings, onChange) {
    var on = settings.pauseOn || {};
    var w = modal('<h2>Когда останавливать время</h2>' +
      '<p class="d-text">Жизнь идёт сама. Отметьте, на чём она должна подождать вас.</p>' +
      '<div class="pause-rows">' + PAUSE_ROWS.map(function (r) {
        var checked = r.fixed || on[r.id] ? ' checked' : '';
        return '<label class="pause-row"><input type="checkbox" data-id="' + r.id + '"' + checked +
          (r.fixed ? ' disabled' : '') + '><span><b>' + r.t + '</b><i>' + r.h + '</i></span></label>';
      }).join('') + '</div>' +
      '<div class="modal-actions"><button class="btn btn-primary" data-close>Готово</button></div>',
      { cls: 'pauses' });
    var inputs = w.querySelectorAll('input[data-id]');
    for (var i = 0; i < inputs.length; i++) {
      inputs[i].addEventListener('change', function () {
        on[this.dataset.id] = this.checked;
        settings.pauseOn = on;
        if (onChange) onChange(on);
      });
    }
    return w;
  }

  /* --------------------------- карточка решения ------------------------ */

  /* одно условие варианта: что нужно и что у вас есть */
  function reqChip(r) {
    var cls = r.ok ? 'req-ok' : 'req-no';
    var mark = r.ok ? '✓' : '✗';
    var t;
    if (r.k === 'money') {
      t = r.ok ? 'денег хватает' : 'нужно ' + money(r.need) + ' · у вас ' + money(r.have);
    } else if (r.k === 'stat') {
      t = r.word + ' ' + r.need + (r.ok ? '' : ' · у вас ' + r.have);
    } else {
      t = r.ok ? (r.done || r.text) : r.text;
    }
    return '<i class="' + cls + '">' + mark + ' ' + esc(t) + '</i>';
  }

  function optionCard(o, i) {
    var meta = [];
    if (o.price) meta.push('<em class="d-price">−' + money(o.price) + rubTag(o.price, 'inline') + '</em>');
    if (o.gain) meta.push('<em class="d-gain">+' + money(o.gain) + rubTag(o.gain, 'inline') + '</em>');
    if (o.chance !== null && o.chance !== undefined) {
      meta.push('<em class="d-chance">шанс ' + Math.round(o.chance * 100) + '%</em>');
    }
    var reqs = (o.reqs || []).length
      ? '<span class="d-reqs">' + o.reqs.map(reqChip).join('') + '</span>' : '';
    return '<button class="d-option' + (o.locked ? ' locked' : '') + '" data-i="' + i + '"' +
      (o.locked ? ' disabled aria-disabled="true"' : '') + '>' +
      '<b>' + esc(o.label) + '</b>' +
      (o.hint ? '<span>' + esc(o.hint) + '</span>' : '') +
      (meta.length ? '<span class="d-meta">' + meta.join('') + '</span>' : '') +
      reqs + '</button>';
  }

  function decisionModal(life, decision, onPick) {
    useCountry(life);
    var heavy = decision.heavy
      ? '<p class="heavy-note">Это тяжёлая тема. Сцена не показывается. Если вам тяжело — поговорите с близким ' +
      'человеком или со службой психологической помощи.</p>' : '';
    var locked = decision.options.filter(function (o) { return o.locked; }).length;
    var risky = decision.options.filter(function (o) { return o.chance !== null && o.chance !== undefined; }).length;
    var note = locked
      ? 'Серые варианты закрыты: на них не хватает денег, знаний, здоровья или бумаг.'
      : risky ? 'У части решений есть шанс не выйти — как в жизни.'
        : 'Выбор меняет шансы, но не отменяет статистику места рождения.';
    var w = modal('<p class="decision-age">' + life.age + ' ' + M.plural(life.age, 'год', 'года', 'лет') +
      ' · ' + life.year + ' · ' + esc(life.c.name) + ' · у вас ' + money(life.purse()) + '</p>' +
      '<h2>' + esc(decision.title) + '</h2>' +
      '<p class="d-text">' + esc(decision.text) + '</p>' + heavy +
      '<div class="d-options">' + decision.options.map(optionCard).join('') + '</div>' +
      '<p class="d-note">' + note + '</p>',
      { sticky: true, cls: 'decision' });
    w.querySelectorAll('.d-option').forEach(function (b) {
      b.addEventListener('click', function () {
        if (b.disabled) return;
        close(w);
        onPick(Number(b.dataset.i));
      });
    });
    return w;
  }

  function reflectionModal(life, refl, onDone) {
    var w = modal('<p class="decision-age">пауза · ' + refl.age + ' лет</p>' +
      '<h2>Время остановилось</h2>' +
      '<p class="d-text">' + esc(refl.q) + '</p>' +
      '<textarea class="note-input" id="refl-note" placeholder="Одна строка, если захочется. Это останется только у вас."></textarea>' +
      '<div class="modal-actions"><button class="btn" id="refl-skip">Пропустить</button>' +
      '<button class="btn btn-primary" id="refl-ok">Записать и жить дальше</button></div>', { sticky: true });
    function done(text) {
      if (text) {
        life.notes.push({ age: life.age, text: text });
        life.add('Вы записали: «' + text + '»', 'life');
      }
      close(w);
      onDone();
    }
    el('refl-ok').addEventListener('click', function () { done(el('refl-note').value.trim().slice(0, 240)); });
    el('refl-skip').addEventListener('click', function () { done(''); });
  }

  /* ------------------------------ помощь ------------------------------- */

  function helpModal() {
    modal('<div class="modal-head"><h2>Как играть</h2><button class="icon-btn x" data-close>✕</button></div>' +
      '<p>Вы родились случайным человеком из восьми миллиардов. Время идёт само; год проходит за несколько секунд.</p>' +
      '<h3>Что вы решаете</h3>' +
      '<ul><li><b>Фокус года</b> — чему отдать этот год: учёбе, работе, здоровью, семье, друзьям, отдыху или деньгам.</li>' +
      '<li><b>Бюджет</b> — как распределить годовой доход между едой, здоровьем, учёбой, жильём, отдыхом, помощью семье и сбережениями.</li>' +
      '<li><b>Траты (кнопка 🛒 или клавиша T)</b> — на что потратить накопленное в этом году: от тетрадей и репетитора ' +
      'до операции, своего жилья, машины и собственного дела. Купленное работает до конца жизни, часть вещей требует содержания каждый год.</li>' +
      '<li><b>Вложения (кнопка 📈 или клавиша И)</b> — что делать с накопленным, чтобы оно работало: своё дело, ' +
      'вклад, облигации, акции, мировой индекс, золото, земля, квартира под сдачу, криптовалюта. ' +
      'У каждого вложения честно написано, сколько оно приносит в обычный год и с каким шансом можно остаться ни с чем.</li>' +
      '<li><b>Карточки решений</b> — на поворотах: школа, профессия, переезд, брак, дети, лечение, пенсия. ' +
      'Доступны не все варианты: под каждым написано, сколько он стоит и что для него нужно — деньги, знания, ' +
      'здоровье, диплом, работа или сама страна. Чего не хватает, помечено ✗, и такой вариант нажать нельзя. ' +
      'У самых рискованных решений показан шанс: эмиграция, кредит, смена профессии и лечение могут не выйти.</li></ul>' +
      '<h3>Деньги, которые случаются сами</h3>' +
      '<ul><li>У денег своя череда событий, отдельная от болезней и войн: цены уходят вперёд зарплат, ' +
      'задерживают получку, приходит премия или детское пособие, разоряется работодатель, ' +
      'переводят деньги уехавшие родственники, звонят «из службы безопасности банка», ' +
      'поднимают пенсионный возраст. Что именно может случиться — зависит от страны и года.</li>' +
      '<li>Часть таких событий приходит только к тем, кому есть что терять: банк с вкладом остаётся ' +
      'без лицензии, дело обкрадывают, урожай с вашей земли уходит за бесценок.</li>' +
      '<li>В спокойные годы вместо события приходит <b>денежная карточка</b>: зарплата в конверте, ' +
      'просьба родни о долге, срочно нужны деньги, контора с «сорока процентами в год», ' +
      'дом, оставшийся от родителей. Решения здесь дешёвые на вид и дорогие по итогу: ' +
      'конверт прибавляет к зарплате и вычитает из пенсии, микрозайм отдаётся вдвое.</li></ul>' +
      '<h3>Когда денег нет</h3>' +
      '<ul><li><b>Долг тянет за собой цепочку.</b> Если денег меньше нуля дольше, чем терпят хозяин жилья или банк, ' +
      'приходит <b>выселение</b>. Из него есть выходы: выпросить отсрочку, уехать к родне, продать нажитое, ' +
      'занять под дикий процент, вернуться туда, откуда вы родом, — или дождаться приставов.</li>' +
      '<li><b>Улица — это не одно событие, а отдельная жизнь.</b> Каждый год на улице спрашивает своё: ' +
      'где ночевать, чем кормиться, идти ли за документами, браться ли за подённую работу, ' +
      'что делать зимой. Здоровье тает, риск смерти втрое выше обычного, а после трёх лет — впятеро. ' +
      'Зимой в холодной стране можно не проснуться.</li>' +
      '<li><b>С улицы есть дорога обратно.</b> Паспорт, ночлежка, вахта с общежитием, работа при столовой, ' +
      'соцработник, старые знакомые — чем раньше за них схватиться, тем выше шанс: первые год-два ' +
      'вернуться вдвое легче, чем после десятого года. Долги при этом списывают: с человека без адреса нечего взять.</li>' +
      '<li><b>Кредит</b> берут сами: на ремонт, лечение, свадьбу, машину или своё дело. Деньги дают сразу, ' +
      'платёж списывается каждый год. Две просрочки — звонки и реструктуризация, четыре — суд. ' +
      'Дальше развилка: банкротство с распродажей, отдать квартиру, платить с переплатой или скрыться — ' +
      'последнее заканчивается улицей.</li></ul>' +
      '<h3>Вложения и своё дело</h3>' +
      '<ul><li><b>Своё дело</b> — лоток, магазин, мастерская, кафе, ферма, дело в интернете или фирма с работниками. ' +
      'Каждый год дело приносит прибыль или убыток, может прогореть (в первые три года это случается с каждым вторым кафе) ' +
      'и может пойти в гору. Дело можно развивать деньгами и можно продать — иногда его приходят покупать сами.</li>' +
      '<li><b>Инструменты</b> отличаются не доходностью, а тем, как они теряют: банк лопается, государство объявляет дефолт, ' +
      'золото крадут, биржа исчезает, а контора с «надёжными 40 % в год» просто закрывается за ночь.</li>' +
      '<li><b>Проценты показаны сверх инфляции</b> и делятся на две части: рост стоимости (его видно только при продаже) ' +
      'и выплаты наличными — рента, купоны, дивиденды и прибыль дела. Наличные сразу входят в годовой доход.</li>' +
      '<li><b>Рынок один на всех:</b> примерно раз в десять лет случается кризис, и тогда дешевеет почти всё, кроме золота.</li></ul>' +
      '<h3>Показатели</h3>' +
      '<ul><li><b>Здоровье</b> — влияет на риск умереть и на способность работать.</li>' +
      '<li><b>Счастье</b> — насколько вы довольны жизнью.</li>' +
      '<li><b>Знания</b> — экзамены, предложения работы, зарплата.</li>' +
      '<li><b>Отношения</b> — семья и друзья, одиночество в старости.</li></ul>' +
      '<h3>Клавиши</h3>' +
      '<ul><li><b>Пробел</b> — пауза, <b>1 2 4 8</b> — скорость, <b>A</b> — авторежим, <b>T</b> — траты, <b>И</b> — вложения, <b>H</b> — помощь.</li></ul>' +
      '<h3>Сцена жизни</h3>' +
      '<p>В центре — пиксельная сцена, нарисованная прямо в браузере. Вы — человечек по центру, ' +
      'с розовой меткой под ногами; рядом те, с кем вы живёте сейчас: родители, братья и сёстры, ' +
      'потом супруг и дети. Под картинкой написано, где вы живёте и кто рядом, с их возрастами. ' +
      'Место меняется вместе с жизнью — деревня, город, комната, школа, цех, поле, кабинет, больница, парк, ' +
      'а на время события сцена переезжает туда, где событие происходит. Больше ста движений: ' +
      'от первых шагов до прощания; кнопка «Анимации» показывает их список.</p>' +
      '<h3>Время, паузы и музыка</h3>' +
      '<ul><li><b>✎ Паузы</b> — на чём жизнь должна вас подождать: на решениях (всегда), ' +
      'на событиях, которые меняют жизнь, каждый год или когда появляются новые траты.</li>' +
      '<li><b>♪ Музыка</b> — тихий фон и нота на каждый прожитый год. Звук считается на лету, файлов нет.</li>' +
      '<li><b>Валюта</b> по умолчанию — та, которой платят в вашей стране: найра в Нигерии, иена в Японии, ' +
      'рубль в России. Заработок, цены и накопления показаны в ней, а строкой ниже, мелким шрифтом, — ' +
      'примерный перевод в рубли по покупательной способности. На первом экране валюту можно ' +
      'закрепить за одной страной или перейти на международные доллары (ППС).</li></ul>' +
      '<p class="hint">Авторежим принимает решения нейтрально: средние результаты совпадают со статистикой страны.</p>');
    bindClose();
  }

  /* ------------------------------ финал -------------------------------- */

  function endScreen(life, peers, homeCode) {
    useCountry(life);
    el('end-kicker').textContent = life.dead ? 'запись о смерти' : 'итог жизни';
    el('end-name').textContent = life.name;
    el('end-years').textContent = life.birthYear + ' – ' + (life.dead ? life.dead.year : life.year) +
      ' · ' + life.c.name + ' · ' + (life.dead ? life.dead.age : life.age) + ' ' +
      M.plural(life.dead ? life.dead.age : life.age, 'год', 'года', 'лет');
    el('end-summary').textContent = life.summary();
    el('end-epitaph').textContent = '«' + life.epitaph() + '»';
    el('end-ach').innerHTML = life.achievements().map(function (a) {
      return '<span class="ach">' + a.icon + ' ' + esc(a.t) + '</span>';
    }).join('');
    CH.lifeMap(el('end-map'), life);
    CH.survival(el('end-survival'), life, homeCode);
    var lx = life.table.lx[Math.min(life.dead ? life.dead.age : life.age, 110)];
    el('end-survival-note').textContent = 'До этого возраста доживают ' + Math.round(lx * 100) +
      '% родившихся там же и тогда же' + (homeCode && C.byCode[homeCode]
        ? '. Фиолетовая линия — ' + C.byCode[homeCode].name + ' для сравнения.' : '.');
    var starred = life.log.filter(function (e) { return e.starred; });
    el('end-starred').innerHTML = starred.length
      ? starred.map(function (e) {
        return '<div class="log-item k-' + e.kind + '"><span class="ag">' + e.age + ' л.</span>' +
          '<span class="tx">' + esc(e.text) + '</span><span></span></div>';
      }).join('')
      : '<p class="empty">Вы не отметили ни одного момента. В следующей жизни нажимайте на строки летописи.</p>';
    renderPeers(peers, life.dead ? life.dead.age : life.age, el('end-peers'));
  }

  function downloadShare(life) {
    var cv = CH.shareCard(life);
    try {
      var a = document.createElement('a');
      a.download = '1in8b-' + life.name.replace(/\s+/g, '-').toLowerCase() + '.png';
      a.href = cv.toDataURL('image/png');
      a.click();
      toast('Карточка сохранена', 'good');
    } catch (e) {
      toast('Браузер не дал сохранить файл', 'bad');
    }
  }

  /* ======================= МЕНЮ «ТРАТЫ» ============================== */

  var spendGroup = 'edu';

  function PU() { return window.IN8B.purchases; }

  function renderSpendNote(life) {
    useCountry(life);
    var note = el('spend-note');
    if (!note || !PU()) return;
    var free = PU().availableFor(life).length;
    var spent = PU().spentThisYear(life);
    note.textContent = spent > 0
      ? 'в этом году: ' + money(spent) + ' · доступно ' + free
      : 'доступно ' + free + ' ' + M.plural(free, 'вариант', 'варианта', 'вариантов');
  }

  function spendModal(life, onChange) {
    useCountry(life);
    var P = PU();
    if (!P) return null;
    var wrap = modal(
      '<header class="modal-head"><h3>🛒 Траты · ' + life.age + ' ' +
      M.plural(life.age, 'год', 'года', 'лет') + '</h3>' +
      '<button class="icon-btn x" data-close aria-label="Закрыть">✕</button></header>' +
      '<div class="spend-top" id="spend-top"></div>' +
      '<div class="spend-tabs" id="spend-tabs"></div>' +
      '<p class="hint" id="spend-hint">—</p>' +
      '<div class="spend-list" id="spend-list"></div>' +
      '<footer class="modal-foot"><span class="hint">Купленное работает до конца жизни; часть вещей требует\n       содержания каждый год.</span><button class="btn btn-primary" data-close>Готово</button></footer>',
      { cls: 'spend-modal' });

    function top() {
      var up = Math.round(life.need * (life.upkeep || 0));
      el('spend-top').innerHTML =
        '<div class="sp-kv"><span>Накоплено</span><b class="' + (life.money < 0 ? 'bad' : 'good') + '">' +
        money(life.money) + rubTag(life.money) + '</b></div>' +
        '<div class="sp-kv"><span>Доход за год</span><b>' + money(life.income) + rubTag(life.income) + '</b></div>' +
        '<div class="sp-kv"><span>Год жизни стоит</span><b>' + money(life.need) + rubTag(life.need) + '</b></div>' +
        '<div class="sp-kv"><span>Содержание вещей</span><b>' + (up ? money(up) + ' в год' + rubTag(up) : '—') + '</b></div>' +
        '<div class="sp-kv"><span>Потрачено за жизнь</span><b>' + money(life.spentTotal || 0) +
        rubTag(life.spentTotal || 0) + '</b></div>';
    }

    function tabs() {
      el('spend-tabs').innerHTML = P.groups.map(function (g) {
        var n = P.list.filter(function (it) { return it.g === g.id && P.state(life, it).ok; }).length;
        return '<button class="sp-tab' + (g.id === spendGroup ? ' on' : '') + '" data-g="' + g.id + '">' +
          g.icon + ' ' + g.name + (n ? '<i>' + n + '</i>' : '') + '</button>';
      }).join('');
      el('spend-tabs').querySelectorAll('.sp-tab').forEach(function (b) {
        b.addEventListener('click', function () { spendGroup = b.dataset.g; draw(); });
      });
    }

    function draw() {
      top(); tabs();
      var g = P.groups.filter(function (x) { return x.id === spendGroup; })[0];
      el('spend-hint').textContent = g ? g.hint : '';
      var items = P.list.filter(function (it) { return it.g === spendGroup; });
      el('spend-list').innerHTML = items.map(function (it) {
        var st = P.state(life, it);
        var price = st.price || P.priceOf(life, it);
        var up = P.upkeepOf(life, it);
        var owned = life.purchased && life.purchased[it.id];
        return '<article class="sp-card' + (st.ok ? '' : ' off') + (owned ? ' owned' : '') + '" data-id="' + it.id + '">' +
          '<div class="sp-ico">' + it.icon + '</div>' +
          '<div class="sp-body"><b>' + esc(it.title) + '</b>' +
          '<span class="sp-desc">' + esc(it.desc) + '</span>' +
          '<span class="sp-gain">' + esc(it.gain || '') + (up ? ' · содержание ' + money(up) + '/год' : '') + '</span></div>' +
          '<div class="sp-buy"><b class="' + (st.ok && st.debt ? 'warn' : '') + '">' + money(price) +
          rubTag(price) + '</b>' +
          (st.ok
            ? '<button class="btn btn-primary tiny" data-buy="' + it.id + '">' + (st.debt ? 'В долг' : 'Купить') + '</button>'
            : '<span class="sp-why">' + esc(st.why) + '</span>') +
          '</div></article>';
      }).join('');

      el('spend-list').querySelectorAll('[data-buy]').forEach(function (b) {
        b.addEventListener('click', function () {
          var res = P.buy(life, b.dataset.buy);
          if (!res.ok) { toast(res.why, 'bad'); return; }
          var it = P.byId[b.dataset.buy];
          toast(it.icon + ' ' + it.title + ' · −' + money(res.price), res.debt ? 'bad' : 'good');
          if (window.IN8B.onPurchase) window.IN8B.onPurchase(it, life);
          draw();
          if (onChange) onChange();
        });
      });
    }

    draw();
    bindClose(wrap);
    return wrap;
  }

  /* ======================= МЕНЮ «ВЛОЖЕНИЯ» =========================== */

  var investTab = 'biz';

  function IV() { return window.IN8B.invest; }

  /* сумма из поля ввода: игрок пишет в своей валюте, движок считает в межд. $ */
  function sumOf(card) {
    var inp = card.querySelector('.iv-sum');
    if (!inp || !inp.value) return null;
    var v = parseFloat(String(inp.value).replace(',', '.').replace(/\s/g, ''));
    if (!isFinite(v) || v <= 0) return null;
    return v / cur().k;
  }

  function toInput(v) { return String(Math.round(v * cur().k)); }

  function renderInvestNote(life) {
    useCountry(life);
    var note = el('invest-note');
    if (!note || !IV()) return;
    var p = IV().portfolio(life);
    if (!p.total) { note.textContent = 'деньги пока не работают'; return; }
    var txt = money(p.total) + ' вложено';
    if (p.income) txt += ' · ' + money(p.income) + ' за год';
    note.textContent = txt;
  }

  function reqLine(reqs) {
    return '<span class="d-reqs">' + reqs.map(function (r) {
      return '<i class="' + (r.ok ? 'req-ok' : 'req-no') + '">' + (r.ok ? '✓ ' : '✗ ') + esc(r.text) + '</i>';
    }).join('') + '</span>';
  }

  function sharpPct(v) { return (Math.round(v * 1000) / 10).toString().replace('.', ','); }

  function assetCard(life, def) {
    var P = IV();
    var st = P.assetState(life, def);
    var h = st.held;
    var own = h && h.val > 0;
    var sigma = typeof def.sigma === 'function' ? def.sigma(life) : def.sigma;
    /* типичный год, а не рекламное среднее: разброс сам по себе съедает часть роста */
    var exp = (typeof def.mean === 'function' ? def.mean(life) : def.mean) +
      (typeof def.pay === 'function' ? def.pay(life) : def.pay || 0) - sigma * sigma / 2;
    var stats = [Math.abs(exp) < 0.004
      ? 'в обычный год ни прибыли, ни убытка'
      : 'в обычный год ' + (exp >= 0 ? '+' : '−') + sharpPct(Math.abs(exp)) + '%'];
    if (sigma > 0.02) stats.push('разброс ±' + sharpPct(sigma) + '%');
    var payRate = typeof def.pay === 'function' ? def.pay(life) : def.pay || 0;
    if (payRate > 0) stats.push('наличными ' + sharpPct(payRate) + '% в год');
    if (def.bad) {
      var bp = typeof def.bad.p === 'function' ? def.bad.p(life) : def.bad.p;
      stats.push('риск потерять ' + (def.bad.loss >= 1 ? 'всё' : 'больше половины') + ': ' +
        sharpPct(bp) + '% в год');
    }
    if (def.corr >= 0.5) stats.push('в кризис падает вместе с рынком');
    if (def.corr < 0) stats.push('в кризис обычно дорожает');

    var ownLine = '';
    if (own) {
      var delta = h.put > 0 ? (h.val - h.put) / h.put : 0;
      /* досталось по наследству или в подарок: вложенных денег нет */
      ownLine = '<span class="iv-own">' + (h.put > 0 ? 'Вложено ' + money(h.put) : 'Досталось не за деньги') +
        ' · сейчас стоит <b class="' +
        (h.val >= h.put ? 'up' : 'down') + '">' + money(h.val) + '</b>' +
        (h.put > 0 ? ' (' + (delta >= 0 ? '+' : '−') + sharpPct(Math.abs(delta)) + '%)' : '') +
        (h.got ? ' · получено наличными ' + money(h.got) : '') + '</span>';
    }

    var reqs = st.reqs.filter(function (r) { return !r.ok; });
    var blocked = reqs.length > 0;
    return '<article class="iv-card' + (blocked ? ' off' : '') + (own ? ' own' : '') + '" data-id="' + def.id + '">' +
      '<div class="iv-ico">' + def.icon + '</div>' +
      '<div class="iv-body">' +
      '<b>' + esc(def.name) + ' <em class="iv-risk ' + (def.risk === 'опасно' ? 'hot' : def.risk === 'качает' ? 'mid' : 'calm') +
      '">' + def.risk + '</em></b>' +
      '<span class="iv-desc">' + esc(def.desc) + '</span>' +
      '<span class="iv-stats">' + esc(stats.join(' · ')) + '</span>' +
      ownLine +
      (blocked ? reqLine(st.reqs) : '') +
      '</div>' +
      '<div class="iv-act">' +
      (blocked ? '<span class="sp-why">' + esc(reqs[0].text) + '</span>'
        : life.money < st.min
          ? '<span class="iv-min">минимум ' + money(st.min) + '</span>' +
          '<span class="sp-why">не хватает ' + money(st.min - life.money) + '</span>' +
          (own ? '<button class="btn tiny" data-take="' + def.id + '">Забрать</button>' : '')
          : '<span class="iv-min">минимум ' + money(st.min) + '</span>' +
        '<input class="iv-sum" type="text" inputmode="numeric" placeholder="' + toInput(st.min) + '" aria-label="Сумма">' +
        '<span class="iv-chips"><button class="iv-chip" data-part="0.25">¼</button>' +
        '<button class="iv-chip" data-part="0.5">½</button>' +
        '<button class="iv-chip" data-part="1">всё</button></span>' +
        '<button class="btn btn-primary tiny" data-put="' + def.id + '">Вложить</button>' +
        (own ? '<button class="btn tiny" data-take="' + def.id + '">Забрать</button>' : '')) +
      '</div></article>';
  }

  function bizOwnCard(life) {
    var P = IV();
    var b = life.biz;
    var type = P.bizById[b.type];
    var o = P.odds(life, type, b.age, b.loss);
    var sell = P.sellPrice(life);
    var profit = b.profit || 0;
    return '<article class="iv-card own biz" data-id="biz">' +
      '<div class="iv-ico">' + b.icon + '</div>' +
      '<div class="iv-body">' +
      '<b>' + esc(b.name) + ' <em class="iv-risk mid">' +
      (b.age < 1 ? 'первый год' : b.age + ' ' + M.plural(b.age, 'год', 'года', 'лет') + ' в деле') + '</em></b>' +
      '<span class="iv-own">Вложено ' + money(b.put) + ' · дело стоит <b class="' +
      (b.val >= b.put ? 'up' : 'down') + '">' + money(b.val) + '</b>' +
      ' · прибыль за год <b class="' + (profit >= 0 ? 'up' : 'down') + '">' +
      (profit >= 0 ? '+' : '−') + money(Math.abs(profit)) + '</b></span>' +
      '<span class="iv-stats">риск закрытия в этом году ' + sharpPct(o.fail) + '%' +
      ' · шанс, что дело пойдёт в гору ' + sharpPct(o.boom) + '%' +
      ' · обычная прибыль ' + sharpPct(o.margin) + '% от вложенного' +
      ' · убыточным бывает каждый ' + Math.max(2, Math.round(1 / Math.max(o.lossP, 0.05))) + '-й год</span>' +
      (b.offer ? '<span class="iv-offer">Вашим делом интересуется покупатель: ' + money(b.offer) + '</span>' : '') +
      '</div>' +
      '<div class="iv-act">' +
      '<span class="iv-min">вложить ещё</span>' +
      '<input class="iv-sum" type="text" inputmode="numeric" placeholder="' + toInput(Math.round(life.need * 0.3)) + '" aria-label="Сумма">' +
      '<span class="iv-chips"><button class="iv-chip" data-part="0.25">¼</button>' +
      '<button class="iv-chip" data-part="0.5">½</button>' +
      '<button class="iv-chip" data-part="1">всё</button></span>' +
      '<button class="btn btn-primary tiny" data-grow="1">В развитие</button>' +
      '<button class="btn tiny" data-sell="1">' + (b.offer ? 'Принять ' : 'Продать за ') + money(sell) + '</button>' +
      '</div></article>';
  }

  function bizCard(life, type) {
    var P = IV();
    var st = P.bizState(life, type);
    var o = P.odds(life, type, 0, false);
    var bad = st.reqs.filter(function (r) { return !r.ok; });
    var blocked = bad.length > 0 || !!life.biz;
    return '<article class="iv-card' + (blocked ? ' off' : '') + '" data-id="' + type.id + '">' +
      '<div class="iv-ico">' + type.icon + '</div>' +
      '<div class="iv-body"><b>' + esc(type.name) + '</b>' +
      '<span class="iv-desc">' + esc(type.desc) + '</span>' +
      '<span class="iv-stats">прогорает за первые три года: ' + Math.round(o.fail3 * 100) + '%' +
      ' · в среднем приносит ' + sharpPct(o.margin) + '% от вложенного в год' +
      ' · шанс выстрелить: ' + sharpPct(o.boom) + '% в год</span>' +
      (bad.length ? reqLine(st.reqs) : '') +
      '</div>' +
      '<div class="iv-act"><b>' + money(st.cost) + rubTag(st.cost) + '</b>' +
      (blocked
        ? '<span class="sp-why">' + esc(life.biz ? 'у вас уже есть своё дело' : bad[0].text) + '</span>'
        : (life.money < st.cost
          ? '<span class="sp-why">не хватает ' + money(st.cost - life.money) + '</span>'
          : '<button class="btn btn-primary tiny" data-open="' + type.id + '">Открыть</button>')) +
      '</div></article>';
  }

  function investModal(life, onChange) {
    useCountry(life);
    var P = IV();
    if (!P) return null;
    var wrap = modal(
      '<header class="modal-head"><h3>📈 Вложения · ' + life.age + ' ' +
      M.plural(life.age, 'год', 'года', 'лет') + '</h3>' +
      '<button class="icon-btn x" data-close aria-label="Закрыть">✕</button></header>' +
      '<div class="spend-top" id="iv-top"></div>' +
      '<div class="spend-tabs" id="iv-tabs"></div>' +
      '<p class="hint" id="iv-hint">—</p>' +
      '<div class="spend-list" id="iv-list"></div>' +
      '<footer class="modal-foot"><span class="hint">Доходность показана сверх инфляции. Деньги могут и пропасть:\n       проценты здесь честные, а не рекламные.</span>' +
      '<button class="btn btn-primary" data-close>Готово</button></footer>',
      { cls: 'invest-modal' });

    function top() {
      var p = P.portfolio(life);
      el('iv-top').innerHTML =
        '<div class="sp-kv"><span>Наличные</span><b class="' + (life.money < 0 ? 'bad' : 'good') + '">' +
        money(life.money) + rubTag(life.money) + '</b></div>' +
        '<div class="sp-kv"><span>Вложено сейчас</span><b>' + money(p.put + (life.biz ? life.biz.put : 0)) +
        rubTag(p.put + (life.biz ? life.biz.put : 0)) + '</b></div>' +
        '<div class="sp-kv"><span>Стоит сегодня</span><b>' + money(p.total) + rubTag(p.total) + '</b></div>' +
        '<div class="sp-kv"><span>Пришло за год</span><b>' + money(p.income) + rubTag(p.income) + '</b></div>' +
        '<div class="sp-kv"><span>Итог за жизнь</span><b class="' + (p.lifetime >= 0 ? 'good' : 'bad') + '">' +
        (p.lifetime >= 0 ? '+' : '−') + money(Math.abs(p.lifetime)) + '</b></div>';
    }

    function tabs() {
      var open = P.assets.filter(function (d) {
        return !P.assetState(life, d).reqs.some(function (r) { return !r.ok; });
      }).length;
      el('iv-tabs').innerHTML =
        '<button class="sp-tab' + (investTab === 'biz' ? ' on' : '') + '" data-t="biz">💼 Своё дело' +
        (life.biz ? '<i>есть</i>' : '') + '</button>' +
        '<button class="sp-tab' + (investTab === 'asset' ? ' on' : '') + '" data-t="asset">📈 Инструменты<i>' +
        open + '</i></button>';
      el('iv-tabs').querySelectorAll('.sp-tab').forEach(function (b) {
        b.addEventListener('click', function () { investTab = b.dataset.t; draw(); });
      });
    }

    function draw() {
      top(); tabs();
      var html;
      if (investTab === 'biz') {
        el('iv-hint').textContent = life.biz
          ? 'Дело живёт своей жизнью: приносит прибыль, может прогореть, может пойти в гору. Вложенные деньги работают, но достать их можно только продажей.'
          : 'Своё дело — самый быстрый и самый опасный способ: половина закрывается в первые годы, зато выжившее кормит семью десятилетиями.';
        html = (life.biz ? bizOwnCard(life) : '') +
          P.biz.map(function (t) { return bizCard(life, t); }).join('');
      } else {
        el('iv-hint').textContent = 'Проценты показаны сверх инфляции. Чем выше обещанная доходность, тем выше шанс остаться ни с чем.';
        html = P.assets.map(function (d) { return assetCard(life, d); }).join('');
      }
      el('iv-list').innerHTML = html;

      el('iv-list').querySelectorAll('.iv-chip').forEach(function (b) {
        b.addEventListener('click', function () {
          var card = b.closest('.iv-card');
          var inp = card.querySelector('.iv-sum');
          if (inp) inp.value = toInput(Math.max(0, life.money) * Number(b.dataset.part));
        });
      });

      function act(sel, fn) {
        el('iv-list').querySelectorAll(sel).forEach(function (b) {
          b.addEventListener('click', function () {
            var card = b.closest('.iv-card');
            var res = fn(b, sumOf(card));
            if (!res) return;
            toast(res.ok ? res.say : res.why, res.ok ? 'good' : 'bad');
            if (res.ok && window.IN8B.onInvest) window.IN8B.onInvest(res, life);
            draw();
            if (onChange) onChange();
          });
        });
      }

      act('[data-put]', function (b, sum) {
        var def = P.assetById[b.dataset.put];
        var min = P.minOf(life, def);
        var res = P.put(life, def.id, sum == null ? min : sum);
        res.say = def.icon + ' ' + def.name + ' · вложено ' + money(res.sum || 0);
        res.kind = 'put';
        return res;
      });
      act('[data-take]', function (b, sum) {
        var def = P.assetById[b.dataset.take];
        var res = P.take(life, def.id, sum);
        res.say = def.icon + ' забрали ' + money(res.sum || 0);
        res.kind = 'take';
        return res;
      });
      act('[data-open]', function (b, sum) {
        var type = P.bizById[b.dataset.open];
        var res = P.openBiz(life, type.id, sum);
        res.say = type.icon + ' ' + type.name + ' открыто за ' + money(res.sum || 0);
        res.kind = 'biz';
        return res;
      });
      act('[data-grow]', function (b, sum) {
        var res = P.investBiz(life, sum == null ? Math.round(life.need * 0.3) : sum);
        res.say = 'В дело вложено ' + money(res.sum || 0);
        res.kind = 'biz';
        return res;
      });
      act('[data-sell]', function () {
        var res = P.sellBiz(life);
        res.say = 'Дело продано за ' + money(res.sum || 0);
        res.kind = 'sell';
        return res;
      });
    }

    draw();
    bindClose(wrap);
    return wrap;
  }

  /* ===================== КАТАЛОГ АНИМАЦИЙ ============================= */

  function animsModal(view) {
    var PR = window.IN8B.portrait;
    if (!PR) return null;
    var byGroup = {};
    PR.clips.forEach(function (c) { (byGroup[c.group] = byGroup[c.group] || []).push(c); });
    var html = PR.groups.map(function (g) {
      return '<div class="an-group"><h4>' + esc(g) + ' <small>' + byGroup[g].length + '</small></h4>' +
        '<div class="an-row">' + byGroup[g].map(function (c) {
          return '<button class="an-chip" data-clip="' + c.id + '">' + esc(c.name) + '</button>';
        }).join('') + '</div></div>';
    }).join('');
    var wrap = modal(
      '<header class="modal-head"><h3>Анимации портрета <small>' + PR.count + '</small></h3>' +
      '<button class="icon-btn x" data-close aria-label="Закрыть">✕</button></header>' +
      '<p class="hint">Портрет рисуется прямо в браузере, без картинок: внешность собирается из возраста,\n       страны и случайного зерна жизни. Нажмите на название, чтобы посмотреть движение.</p>' +
      '<div class="anims">' + html + '</div>' +
      '<footer class="modal-foot"><span class="hint">Всего движений: ' + PR.count +
      '</span><button class="btn btn-primary" data-close>Закрыть</button></footer>',
      { cls: 'anims-modal' });
    wrap.querySelectorAll('[data-clip]').forEach(function (b) {
      b.addEventListener('click', function () {
        if (view) { view.play(b.dataset.clip); toast(PR.byId[b.dataset.clip].name); }
      });
    });
    bindClose(wrap);
    return wrap;
  }

  /* ================= КАТАЛОГ ТЕКСТУР И МОДЕЛЕК ======================= */

  /* Образец рисуется на своём маленьком холсте: то же самое, что видно
     в сцене, только крупным планом и с подписью. */
  function texSwatch(t, w, h) {
    var c = document.createElement('canvas');
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = w * dpr; c.height = h * dpr;
    c.style.width = w + 'px'; c.style.height = h + 'px';
    var g = c.getContext && c.getContext('2d');
    if (!g) return c;
    g.imageSmoothingEnabled = false;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    window.IN8B.textures.draw(t.id, g, 0, 0, w, h, { seed: 11 });
    return c;
  }

  function modelSwatch(m, box) {
    var c = document.createElement('canvas');
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = box * dpr; c.height = box * dpr;
    c.style.width = box + 'px'; c.style.height = box + 'px';
    var g = c.getContext && c.getContext('2d');
    if (!g) return c;
    g.imageSmoothingEnabled = false;
    var s = Math.max(1, Math.floor(Math.min((box - 6) / m.w, (box - 6) / m.h)));
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.fillStyle = 'rgba(255,255,255,0.04)';
    g.fillRect(0, 0, box, box);
    window.IN8B.models.draw(m.id, g, Math.round((box - m.w * s) / 2), Math.round(box / 2 + m.h * s / 2), s, {});
    return c;
  }

  function thingsModal() {
    var TX = window.IN8B.textures, MD = window.IN8B.models;
    if (!TX || !MD) return null;
    var wrap = modal(
      '<header class="modal-head"><h3>Текстуры и вещи <small>' + (TX.count + MD.count) + '</small></h3>' +
      '<button class="icon-btn x" data-close aria-label="Закрыть">✕</button></header>' +
      '<p class="hint">Сцены собираются из этих кусочков: ' + TX.count + ' текстур для стен, полов, земли,\n' +
      '       фасадов и ткани и ' + MD.count + ' моделек-предметов. Картинок в игре нет — всё рисуется кодом.</p>' +
      '<div class="things"></div>' +
      '<footer class="modal-foot"><span class="hint">Текстур: ' + TX.count + ' · моделек: ' + MD.count +
      '</span><button class="btn btn-primary" data-close>Закрыть</button></footer>',
      { cls: 'things-modal' });
    var box = wrap.querySelector('.things');

    TX.groups.forEach(function (gr) {
      var list = TX.byGroup(gr);
      var sec = document.createElement('div');
      sec.className = 'th-group';
      sec.innerHTML = '<h4>Текстуры: ' + esc(gr) + ' <small>' + list.length + '</small></h4>';
      var row = document.createElement('div');
      row.className = 'th-row';
      list.forEach(function (t) {
        var cell = document.createElement('figure');
        cell.className = 'th-cell';
        cell.appendChild(texSwatch(t, 54, 36));
        cell.appendChild(document.createElement('figcaption')).textContent = t.name;
        row.appendChild(cell);
      });
      sec.appendChild(row);
      box.appendChild(sec);
    });

    MD.groups.forEach(function (gr) {
      var list = MD.byGroup(gr);
      var sec = document.createElement('div');
      sec.className = 'th-group';
      sec.innerHTML = '<h4>Модельки: ' + esc(gr) + ' <small>' + list.length + '</small></h4>';
      var row = document.createElement('div');
      row.className = 'th-row';
      list.forEach(function (m) {
        var cell = document.createElement('figure');
        cell.className = 'th-cell';
        cell.appendChild(modelSwatch(m, 46));
        cell.appendChild(document.createElement('figcaption')).textContent = m.name;
        row.appendChild(cell);
      });
      sec.appendChild(row);
      box.appendChild(sec);
    });

    bindClose(wrap);
    return wrap;
  }

  window.IN8B = window.IN8B || {};
  window.IN8B.ui = {
    el: el, esc: esc, modal: modal, close: close, closeTop: closeTop, toast: toast, bindClose: bindClose,
    currencies: CURRENCIES, setCurrency: setCurrency, money: money, rub: rub, useCountry: useCountry,
    fillStartSelects: fillStartSelects, renderPastList: renderPastList, countriesModal: countriesModal,
    whoModal: whoModal, birthCard: birthCard, helpModal: helpModal,
    renderAll: renderAll, renderPerson: renderPerson, renderStats: renderStats, renderBudget: renderBudget,
    renderFocus: renderFocus, renderLog: renderLog, renderFamily: renderFamily, renderPeers: renderPeers,
    renderLifeMap: renderLifeMap, decisionModal: decisionModal, reflectionModal: reflectionModal,
    endScreen: endScreen, downloadShare: downloadShare, stageName: stageName, presets: BUDGET_PRESETS,
    spendModal: spendModal, animsModal: animsModal, thingsModal: thingsModal, renderSpendNote: renderSpendNote,
    investModal: investModal, renderInvestNote: renderInvestNote,
    pausesModal: pausesModal, moreModal: moreModal
  };
})();
