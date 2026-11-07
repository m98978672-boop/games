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
    { id: 'int', name: 'Межд. $ (ППС)', sym: '$', k: 1 },
    { id: 'rub', name: 'Россия (₽)', sym: '₽', k: 30 },
    { id: 'kzt', name: 'Казахстан (₸)', sym: '₸', k: 190 },
    { id: 'uah', name: 'Украина (₴)', sym: '₴', k: 13 },
    { id: 'byn', name: 'Беларусь (Br)', sym: 'Br', k: 1.1 },
    { id: 'eur', name: 'Германия (€)', sym: '€', k: 0.73 },
    { id: 'usd', name: 'США ($)', sym: '$', k: 1 },
    { id: 'inr', name: 'Индия (₹)', sym: '₹', k: 22 },
    { id: 'try', name: 'Турция (₺)', sym: '₺', k: 11 }
  ];
  var currency = CURRENCIES[0];

  function setCurrency(id) {
    for (var i = 0; i < CURRENCIES.length; i++) if (CURRENCIES[i].id === id) currency = CURRENCIES[i];
  }
  function money(v) { return M.fmtMoney(v * currency.k) + ' ' + currency.sym; }

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
    cur.value = settings.currency || 'int';
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
      cell('доход семьи на человека', money(life.famIncome) + ' в год') +
      cell('шанс родиться здесь', (C.birthShare(life.base) * 100).toFixed(2).replace('.', ',') + '%') +
      cell('ожидаемая продолжительность жизни', le.toFixed(1).replace('.', ',') + ' года') +
      cell('вероятность умереть до 5 лет', (c.u5mr / 10).toFixed(1).replace('.', ',') + '%') +
      cell('ВВП на человека (ППС)', Math.round(c.gdp).toLocaleString('ru-RU') + ' $') +
      '</div>' +
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
    var where = N && N.place ? N.place(life.base.code, life.seed, life.urban) : (life.urban ? 'город' : 'село');
    el('hud-country').textContent = where + ', ' + life.c.name;
    el('hud-age').textContent = life.age;
    el('hud-year').textContent = life.year;
    el('hud-name').textContent = life.name;
    el('hud-income').textContent = money(life.income);
    el('hud-money').textContent = money(life.money);
    el('income-month').textContent = life.income > 0 ? money(life.income / 12) + ' в месяц' : 'дохода пока нет';
    var inc = Math.max(life.income || life.famIncome, 1);
    var pct = Math.round(M.percentileOfIncome(life.c, inc) * 100);
    el('money-rank').textContent = life.c.name + ': верхние ' + Math.max(1, 100 - pct) + '%' +
      (life.income > 0 ? '' : ' (по доходу семьи)');
    var wpct = Math.round(M.worldPercentile(inc) * 100);
    el('money-rank-world').textContent = 'верхние ' + Math.max(1, 100 - wpct) + '% человечества';
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
    el('year-age-label').textContent = life.age + ' ' + M.plural(life.age, 'год', 'года', 'лет');
    el('year-stage').textContent = stageName(life.age);

    var eduWord = ['нет школы', 'начальная школа', 'неполная средняя', 'средняя школа',
      'специальность', 'высшее', 'учёная степень'][life.edu.level];
    var jobWord = life.retired ? 'на пенсии'
      : life.job ? M.jobTitle(M.jobById[life.job.id], life.job.step)
        : life.edu.inSchool ? 'учится' : (life.age >= 16 ? 'без работы' : 'ребёнок');
    el('p-kv').innerHTML =
      '<li><span>Занятие</span><b>' + esc(jobWord) + '</b></li>' +
      '<li><span>Образование</span><b>' + eduWord + '</b></li>' +
      '<li><span>Достаток в стране</span><b>' +
      Math.round(M.percentileOfIncome(life.c, Math.max(life.income || life.famIncome, 1)) * 100) + '-й перцентиль</b></li>' +
      (life.talents.length ? '<li><span>Талант</span><b>' + esc(life.talents.join(', ')) + '</b></li>' : '');
  }

  function renderStats(life) {
    el('stat-bars').innerHTML = STAT_META.map(function (s) {
      var v = Math.round(life.stats[s.k]);
      return '<div class="stat-row ' + s.c + '"><span class="nm">' + s.n + '</span>' +
        '<span class="tr"><i style="width:' + v + '%"></i></span><span class="vl">' + v + '</span></div>';
    }).join('');
  }

  function renderBudget(life, onChange) {
    var box = el('budget-list');
    var inc = Math.max(life.income, 0);
    el('budget-sum').textContent = 'Годовой доход ' + money(inc) + '. Распределите его — проценты пересчитываются сами.';
    box.innerHTML = EN.budgetMeta.map(function (m) {
      var share = life.budget[m.id];
      return '<div class="b-row" data-id="' + m.id + '">' +
        '<span class="b-name">' + m.icon + ' ' + m.name + '</span>' +
        '<span class="b-val">' + Math.round(share * 100) + '%</span>' +
        '<input type="range" min="0" max="100" value="' + Math.round(share * 100) + '" aria-label="' + m.name + '">' +
        '<span class="b-money">' + money(inc * share) + ' в год · ' + m.hint + '</span>' +
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
      '<li><span>Сбережения</span><b>' + money(life.money) + '</b></li>';
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
    renderPerson(life);
    renderStats(life);
    renderBudget(life, onChange);
    renderFocus(life, onChange);
    renderLog(life);
    renderFamily(life);
    renderPeers(peers, life.age);
    renderLifeMap(life);
  }

  /* --------------------------- карточка решения ------------------------ */

  function decisionModal(life, decision, onPick) {
    var heavy = decision.heavy
      ? '<p class="heavy-note">Это тяжёлая тема. Сцена не показывается. Если вам тяжело — поговорите с близким ' +
      'человеком или со службой психологической помощи.</p>' : '';
    var w = modal('<p class="decision-age">' + life.age + ' ' + M.plural(life.age, 'год', 'года', 'лет') +
      ' · ' + life.year + ' · ' + esc(life.c.name) + '</p>' +
      '<h2>' + esc(decision.title) + '</h2>' +
      '<p class="d-text">' + esc(decision.text) + '</p>' + heavy +
      '<div class="d-options">' + decision.options.map(function (o, i) {
        return '<button class="d-option" data-i="' + i + '"><b>' + esc(o.label) + '</b>' +
          (o.hint ? '<span>' + esc(o.hint) + '</span>' : '') + '</button>';
      }).join('') + '</div>' +
      '<p class="d-note">Выбор меняет шансы, но не отменяет статистику места рождения.</p>',
      { sticky: true, cls: 'decision' });
    w.querySelectorAll('.d-option').forEach(function (b) {
      b.addEventListener('click', function () {
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
      '<li><b>Карточки решений</b> — на поворотах: школа, профессия, переезд, брак, дети, лечение, пенсия.</li></ul>' +
      '<h3>Показатели</h3>' +
      '<ul><li><b>Здоровье</b> — влияет на риск умереть и на способность работать.</li>' +
      '<li><b>Счастье</b> — насколько вы довольны жизнью.</li>' +
      '<li><b>Знания</b> — экзамены, предложения работы, зарплата.</li>' +
      '<li><b>Отношения</b> — семья и друзья, одиночество в старости.</li></ul>' +
      '<h3>Клавиши</h3>' +
      '<ul><li><b>Пробел</b> — пауза, <b>1 2 4 8</b> — скорость, <b>A</b> — авторежим, <b>T</b> — траты, <b>H</b> — помощь.</li></ul>' +
      '<h3>Портрет</h3>' +
      '<p>Слева живой портрет: он рисуется прямо в браузере и меняется вместе с вами — возраст, причёска, седина, ' +
      'морщины, одежда, место действия и погода. Больше ста движений: от первых шагов до прощания. ' +
      'Кнопка «Все анимации» показывает их список.</p>' +
      '<p class="hint">Авторежим принимает решения нейтрально: средние результаты совпадают со статистикой страны.</p>');
    bindClose();
  }

  /* ------------------------------ финал -------------------------------- */

  function endScreen(life, peers, homeCode) {
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
    var note = el('spend-note');
    if (!note || !PU()) return;
    var free = PU().availableFor(life).length;
    var spent = PU().spentThisYear(life);
    note.textContent = spent > 0
      ? 'в этом году: ' + money(spent) + ' · доступно ' + free
      : 'доступно ' + free + ' ' + M.plural(free, 'вариант', 'варианта', 'вариантов');
  }

  function spendModal(life, onChange) {
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
        money(life.money) + '</b></div>' +
        '<div class="sp-kv"><span>Доход за год</span><b>' + money(life.income) + '</b></div>' +
        '<div class="sp-kv"><span>Год жизни стоит</span><b>' + money(life.need) + '</b></div>' +
        '<div class="sp-kv"><span>Содержание вещей</span><b>' + (up ? money(up) + ' в год' : '—') + '</b></div>' +
        '<div class="sp-kv"><span>Потрачено за жизнь</span><b>' + money(life.spentTotal || 0) + '</b></div>';
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
          '<div class="sp-buy"><b class="' + (st.ok && st.debt ? 'warn' : '') + '">' + money(price) + '</b>' +
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

  window.IN8B = window.IN8B || {};
  window.IN8B.ui = {
    el: el, esc: esc, modal: modal, close: close, closeTop: closeTop, toast: toast, bindClose: bindClose,
    currencies: CURRENCIES, setCurrency: setCurrency, money: money,
    fillStartSelects: fillStartSelects, renderPastList: renderPastList, countriesModal: countriesModal,
    whoModal: whoModal, birthCard: birthCard, helpModal: helpModal,
    renderAll: renderAll, renderPerson: renderPerson, renderStats: renderStats, renderBudget: renderBudget,
    renderFocus: renderFocus, renderLog: renderLog, renderFamily: renderFamily, renderPeers: renderPeers,
    renderLifeMap: renderLifeMap, decisionModal: decisionModal, reflectionModal: reflectionModal,
    endScreen: endScreen, downloadShare: downloadShare, stageName: stageName, presets: BUDGET_PRESETS,
    spendModal: spendModal, animsModal: animsModal, renderSpendNote: renderSpendNote
  };
})();
