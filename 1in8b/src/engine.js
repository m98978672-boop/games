/* ============================================================
   1 ИЗ 8 МИЛЛИАРДОВ — движок жизни.
   ------------------------------------------------------------
   Одна жизнь = последовательность лет. Каждый год:
   рост показателей → учёба → работа → деньги и траты →
   события → решение (если выпало) → проверка смертности.

   Всё детерминировано зерном: одна и та же жизнь с тем же
   зерном и теми же решениями повторяется точь-в-точь.
   ============================================================ */
(function () {
  'use strict';

  var M = window.IN8B.model;
  var C = window.IN8B.countries;
  var N = window.IN8B.names;
  var E = window.IN8B.events;
  var W = window.IN8B.work || { auto: [], choices: [] };
  /* все карточки решений: обычные, денежные и рабочие */
  var ALLCH = E.choices.concat(W.choices);
  var clamp = M.clamp;

  /* общая калибровка риска: подобрана так, чтобы средний возраст смерти
     в авторежиме совпадал с ожидаемой продолжительностью жизни страны */
  var RISK_CAL = 0.455;

  /* доли бюджета по умолчанию */
  var DEFAULT_BUDGET = { food: 0.34, health: 0.1, edu: 0.1, home: 0.18, fun: 0.1, family: 0.08, save: 0.1 };

  var BUDGET_META = [
    { id: 'food', name: 'Еда и быт', icon: '🍚', need: 0.42, hint: 'Меньше нормы — падает здоровье' },
    { id: 'health', name: 'Здоровье', icon: '✚', need: 0.1, hint: 'Врачи, лекарства, обследования' },
    { id: 'edu', name: 'Учёба', icon: '📘', need: 0.08, hint: 'Книги, курсы, школа детей' },
    { id: 'home', name: 'Жильё', icon: '🏠', need: 0.2, hint: 'Крыша, ремонт, аренда' },
    { id: 'fun', name: 'Отдых', icon: '🎈', need: 0.08, hint: 'Радость, друзья, поездки' },
    { id: 'family', name: 'Семья', icon: '👪', need: 0.07, hint: 'Помощь родителям и родне' },
    { id: 'save', name: 'Сбережения', icon: '🏦', need: 0.05, hint: 'Подушка на чёрный день' }
  ];

  var FOCUS = [
    { id: 'study', name: 'Учёба', icon: '📚', minAge: 5, desc: 'Знания растут быстрее' },
    { id: 'work', name: 'Работа', icon: '🛠', minAge: 15, desc: 'Карьера и доход' },
    { id: 'health', name: 'Здоровье', icon: '🏃', minAge: 3, desc: 'Тело держится дольше' },
    { id: 'family', name: 'Семья', icon: '👪', minAge: 0, desc: 'Близкие рядом' },
    { id: 'friends', name: 'Друзья и любовь', icon: '💬', minAge: 6, desc: 'Связи и счастье' },
    { id: 'rest', name: 'Отдых', icon: '🌤', minAge: 0, desc: 'Спокойствие вместо гонки' },
    { id: 'money', name: 'Деньги', icon: '💰', minAge: 14, desc: 'Подработки и экономия' }
  ];

  /* ------------------------------------------------------------------ */

  function Life(opts) {
    opts = opts || {};
    this.seed = opts.seed || ('life-' + Math.floor(Math.random() * 1e9));
    this.rnd = M.makeRng(this.seed);
    this.settings = Object.assign({
      era: 'today', year: null, drawMode: 'births', soft: false, lifeMinutes: 30
    }, opts.settings || {});
    this.silent = !!opts.silent;
    this.init(opts);
  }

  Life.prototype.init = function (opts) {
    var rnd = this.rnd;
    var s = this.settings;

    /* --- год рождения --- */
    var year;
    if (s.year) year = s.year;
    else if (s.era === 'past') year = 1950 + rnd.int(76);
    else if (s.era === 'future') year = 2040 + rnd.int(61);
    else if (s.era === 'any') year = 1950 + rnd.int(151);
    else year = M.baseYear + 2;
    this.birthYear = year;

    /* --- страна --- */
    this.base = opts.countryCode ? C.byCode[opts.countryCode] : C.draw(rnd, s.drawMode);
    this.c = M.countryAtYear(this.base, year);

    /* --- кто --- */
    this.sex = rnd() < this.c.sexRatio / (1 + this.c.sexRatio) ? 'm' : 'f';
    var nm = N.make(rnd, this.base, this.sex);
    this.name = nm.full;
    this.given = nm.given;
    this.urban = rnd() < this.c.urban / 100;
    this.famPct = clamp(rnd.normal(0.5, 0.26), 0.02, 0.98);
    this.famIncome = M.incomeAtPercentile(this.c, this.famPct);

    /* --- показатели 0..100 --- */
    var wealth = (this.famPct - 0.5);
    this.stats = {
      health: clamp(68 + wealth * 16 + (this.c.gdp > 20000 ? 6 : -4) + rnd.normal(0, 6), 25, 97),
      happy: clamp(this.c.happy * 9 + rnd.normal(0, 7), 20, 92),
      know: clamp(6 + wealth * 6 + rnd.normal(0, 3), 1, 25),
      bond: clamp(66 + rnd.normal(0, 9) + (this.c.tfr > 3 ? 5 : 0), 25, 96)
    };

    this.baseHealth = this.stats.health;
    this.medianIncome = M.incomeAtPercentile(this.c, 0.5);
    /* сколько детей хочет эта жизнь — вокруг рождаемости страны
       (с поправкой на тех, кто так и не создаст семью) */
    var want = this.c.tfr * 1.35 + rnd.normal(0, 0.8);
    this.desiredKids = clamp(Math.round(want), 0, 11);
    this.lastChildAge = -99;

    /* --- таблица смертности --- */
    this.table = M.lifeTable(this.sex === 'f' ? this.c.leF : this.c.leM, this.c.u5mr, this.c.imr);

    /* --- жизнь --- */
    this.age = 0;
    this.year = year;
    this.alive = true;
    this.dead = null;
    this.money = 0;
    this.income = 0;
    this.ownIncome = 0;
    this.partnerIncome = 0;
    this.edu = { level: 0, inSchool: false, years: 0, track: null, private: false, partTime: false, left: false };
    this.job = null;
    this.unemployedYears = 0;
    this.retired = false;
    this.marital = 'single';
    this.partner = null;
    this.children = [];
    this.grandchildren = 0;
    this.siblings = rnd.int(Math.max(1, Math.round(this.c.tfr)));
    this.parentsAlive = 2;
    this.talents = [];
    this.awards = [];
    this.flags = {};
    this.moves = 0;
    this.abroad = false;
    this.home = false;
    this.business = false;
    this.council = false;
    this.legacy = null;
    this.kidsEducated = false;
    this.careerBrake = false;
    this.log = [];
    this.history = [];
    this.seenEvents = {};
    this.budget = Object.assign({}, DEFAULT_BUDGET);
    this.purchased = {};          /* что куплено за жизнь: id → возраст */
    this.boughtThisYear = {};     /* траты этого года */
    this.upkeep = 0;              /* ежегодное содержание купленного, в долях need */
    this.incomeBoost = 1;         /* вложения в работу и дело */
    this.spentTotal = 0;
    this.assets = {};             /* вложения: id → {put, val, got, since} */
    this.biz = null;              /* своё дело: тип, вложено, стоимость, возраст */
    this.capitalIncome = 0;       /* наличными с вложений за прошлый год */
    this.capitalDelta = 0;        /* насколько подорожал портфель за год */
    this.investedTotal = 0;       /* всего вложено за жизнь */
    this.capitalTotal = 0;        /* всего получено обратно */
    this.focus = 'family';
    this.notes = [];
    this.homeless = 0;            /* сколько лет человек живёт без крыши */
    this.streetTotal = 0;         /* всего лет на улице за жизнь */
    this.loan = null;             /* кредит: сколько осталось, платёж, просрочки */
    this.queue = [];              /* отложенные карточки: [{id, at}] — цепочки решений */
    this.pendingDecision = null;
    /* трудовая книжка: что с вами было на работе за всю жизнь */
    this.career = { held: [], promos: 0, fired: 0, quit: 0, maxStep: 0, years: 0,
      injuries: 0, strikes: 0, courses: 0, sideline: 0 };
    this.pendingReflection = null;
    this.minorYear = true;        /* пока человек ребёнок, его содержит семья */
    /* заработок: форма оплаты основной работы и всё, что приходит помимо неё */
    this.payWage = null;          /* id формы оплаты (оклад, сделка, чаевые…) */
    this.payActive = [];          /* остальные виды заработка в этом году */
    this.payIncome = 0;           /* сколько они дали за год */
    this.payJob = null;           /* к какой работе привязана форма оплаты */
    this.support = 0;             /* сколько тратит на вас семья, пока вы не зарабатываете */
    this.pocketTotal = 0;         /* детские деньги, накопленные до работы */
    this.priceLevel = 1;          /* во сколько раз выросли цены с рождения */
    this.econ = 'ровно';          /* кризис, ровно, подъём */
    this.variations = [];         /* вариации этой жизни */
    this.mechSaid = {};           /* когда механика последний раз говорила вслух */
    this.mechFired = {};          /* какие механики срабатывали за жизнь */

    /* возраст вступления в брак — по стране */
    this.marriageAge = Math.round(clamp(
      17 + this.c.gdp / 9000 + (this.urban ? 1.6 : 0) - (this.c.tfr - 2) * 0.9 + (this.sex === 'f' ? -1.4 : 0.8) + rnd.normal(0, 2.4),
      16, 38));

    this.need = this.c.gdp * 0.3;              // базовая стоимость года жизни
    this.add('Родились ' + (this.sex === 'f' ? 'девочкой' : 'мальчиком') + ' в ' +
      (this.urban ? 'городе' : 'сельской местности') + '. ' + this.familyWord() + '.', 'life');

    /* вариации: то, с чем человек родился или что случилось с ним так рано,
       что стало частью его самого. От одной до четырёх на жизнь. */
    var VR = window.IN8B.variations;
    if (VR) {
      try { VR.apply(this, VR.draw(this)); } catch (e) { this.variations = []; }
      this.famIncome = M.incomeAtPercentile(this.c, this.famPct);   /* вариации могли сдвинуть достаток */
    }
  };

  /* Детерминированный бросок по метке: не сдвигает основной поток случайности */
  Life.prototype.roll = function (tag) {
    return (M.hashSeed(this.seed + '|' + tag) % 100000) / 100000;
  };

  Life.prototype.familyWord = function () {
    var p = this.famPct;
    if (p < 0.12) return 'Семья — одна из самых бедных в стране';
    if (p < 0.33) return 'Семья живёт бедно';
    if (p < 0.6) return 'Семья со средним достатком';
    if (p < 0.85) return 'Семья живёт неплохо';
    return 'Семья — одна из самых обеспеченных в стране';
  };

  /* -------------------------- летопись и показатели ------------------- */

  Life.prototype.add = function (text, kind) {
    var entry = { age: this.age, year: this.year, text: text, kind: kind || 'life', starred: false };
    this.log.push(entry);
    return entry;
  };

  Life.prototype.stat = function (key, delta) {
    this.stats[key] = clamp(this.stats[key] + delta, 0, 100);
  };

  Life.prototype.addMoney = function (delta) {
    this.money += delta;
    /* у несовершеннолетнего без работы не бывает долгов: счета взрослых — не его счета */
    if (this.age < 18 && !this.job && this.money < 0) this.money = 0;
  };

  Life.prototype.flag = function (k, v) { this.flags[k] = v; };
  Life.prototype.has = function (k) { return !!this.flags[k]; };

  /* ------------------------------ работа ------------------------------ */

  Life.prototype.hire = function (style) {
    var pool = M.jobsFor(this.c, this.edu.level, this.rnd, { year: this.year, urban: this.urban });
    if (!pool.length) return;
    var rnd = this.rnd;
    var self = this;
    var chosen = rnd.weighted(pool, function (p) {
      var w = p.w;
      var j = p.job;
      if (style === 'stable') w *= (j.risk < 1.1 ? 2.2 : 0.5) * (j.sector === 'informal' ? 0.3 : 1);
      if (style === 'hard') w *= j.wage * (j.risk > 1.2 ? 2 : 0.6);
      if (style === 'dream') {
        w *= (j.sector === 'prof' || j.sector === 'elite' ? 1.6 : 0.8);
        if (self.talents.indexOf('музыка') >= 0 && j.id === 'artist') w *= 14;
        if (self.talents.indexOf('спорт') >= 0 && j.id === 'athlete') w *= 14;
        if (self.talents.indexOf('математика') >= 0 && (j.id === 'it' || j.id === 'engineer' || j.id === 'scientist')) w *= 10;
      }
      return w;
    });
    if (!chosen) return;
    this.job = this.makeJob(chosen.job, style);
    this.unemployedYears = 0;
    this.career.held.push(chosen.job.id);
    this.add('Вы начали работать: ' + M.jobTitle(chosen.job, 0) +
      (this.job.contract === 'none' ? ' (без оформления)' : '') + '.', 'work');
  };

  /* Место работы — это не только название профессии. Как оформлен договор,
     какой график, далеко ли ехать, следят ли за безопасностью, есть ли
     профсоюз: всё это потом решает, сколько вам платят и чем вы за это
     платите сами. */
  Life.prototype.makeJob = function (j, style) {
    var rnd = this.rnd;
    var dev = M.devLevel(this.c);
    var grey = clamp(0.62 - dev * 0.42, 0.06, 0.62);          /* доля работы «в конверте» */
    if (j.sector === 'informal' || j.sector === 'agri') grey += 0.3;
    if (j.sector === 'prof' || j.sector === 'elite') grey -= 0.18;
    if (M.PUBLIC_JOBS[j.id]) grey -= 0.25;
    var r = rnd();
    var contract = r < clamp(grey, 0.02, 0.92) * 0.45 ? 'none'
      : (r < clamp(grey, 0.02, 0.92) ? 'grey' : 'official');
    var sch = 'day';
    var sr = rnd();
    if (j.sector === 'manual' || j.sector === 'agri') { if (sr < 0.34) sch = 'shift'; else if (sr < 0.44) sch = 'night'; }
    else if (j.sector === 'service') { if (sr < 0.3) sch = 'shift'; else if (sr < 0.42) sch = 'night'; }
    else if (sr < 0.12) sch = 'shift';
    if ((j.id === 'miner' || j.id === 'driller' || j.id === 'fisher') && rnd() < 0.45) sch = 'rotation';
    return {
      id: j.id, step: 0, years: 0, risk: j.risk, dream: style === 'dream',
      contract: contract,
      boss: Math.round(rnd.normal(0, 1.1)),                   /* как вас встретил начальник */
      rep: clamp(34 + this.stats.know * 0.2 + rnd.normal(0, 7), 5, 80),
      mood: clamp(52 + (style === 'dream' ? 14 : 0) + rnd.normal(0, 10), 5, 95),
      burnout: 0,
      overtime: 0,
      schedule: sch,
      commute: clamp((this.urban ? rnd() * 2.2 : rnd() * 1.2) + (this.urban && this.c.gdp > 20000 ? 0.4 : 0), 0, 3),
      safety: clamp(0.25 + dev * 0.45 + (M.PUBLIC_JOBS[j.id] ? 0.15 : 0) + rnd.normal(0, 0.12), 0.05, 0.98),
      union: rnd() < clamp(0.06 + dev * 0.16 + (M.PUBLIC_JOBS[j.id] ? 0.2 : 0), 0.02, 0.45),
      remote: false,
      certs: 0,
      payDelay: 0,
      boost: 1
    };
  };

  Life.prototype.changeJob = function () {
    var old = this.job;
    this.job = null;
    this.hire(this.rnd() < 0.5 ? 'dream' : 'stable');
    if (this.job && old) this.job.step = Math.max(0, old.step - 1);
  };

  Life.prototype.retire = function () {
    this.retired = true;
    this.job = null;
    this.add('Вы вышли на пенсию.', 'life');
  };

  /* ------------------------------ семья ------------------------------- */

  Life.prototype.marry = function (noWedding) {
    var rnd = this.rnd;
    var pname = N.make(rnd, this.base, this.sex === 'f' ? 'm' : 'f');
    this.partner = { name: pname.full, age: this.age + Math.round(rnd.normal(this.sex === 'f' ? 3 : -2, 3)), since: this.age };
    this.marital = noWedding ? 'partner' : 'married';
    this.add(noWedding
      ? 'Вы стали жить вместе: ' + pname.full + '.'
      : 'Свадьба. Теперь вы вместе с ' + pname.full + '.', 'family');
  };

  Life.prototype.divorce = function () {
    this.marital = 'divorced';
    this.partner = null;
    this.stat('happy', -12);
    this.stat('bond', -10);
    this.add('Развод.', 'bad');
  };

  Life.prototype.haveChild = function () {
    var rnd = this.rnd;
    var sex = rnd() < 0.512 ? 'm' : 'f';
    var nm = N.make(rnd, this.base, sex);
    var kid = { name: nm.given, sex: sex, bornAt: this.age, bornYear: this.year };
    this.children.push(kid);
    this.lastChildAge = this.age;
    this.addMoney(-this.need * 0.18);
    this.stat('happy', 12);
    this.stat('bond', 8);
    this.stat('health', this.sex === 'f' ? -4 : -1);
    this.add('Родился ребёнок: ' + nm.given + '.', 'family');

    /* риск при родах — выше там, где хуже медицина */
    if (this.sex === 'f') {
      var mmr = clamp(620 - this.c.gdp / 90, 4, 900) / 100000;
      if (rnd() < mmr * 1.4) this.die('осложнения при родах', true);
    }
    /* детская смертность */
    if (rnd() < this.c.u5mr / 1000 * 0.9) {
      var lost = this.children.pop();
      this.add('Вы потеряли ребёнка (' + lost.name + ') в первые годы.', 'bad');
      this.stat('happy', -22); this.stat('health', -5);
      this.helpLine();
    }
  };

  Life.prototype.helpLine = function () {
    if (this.silent) return;
    this.add('Если вам тяжело — поговорите с близким человеком или со службой психологической помощи.', 'help');
  };

  /* ------------------------------ смерть ------------------------------- */

  Life.prototype.die = function (cause, pregnant) {
    if (!this.alive) return;
    this.alive = false;
    var c = cause || M.pickCause(this.rnd, this, this.c, this.age, {
      war: this.has('war'), softMode: this.settings.soft, pregnant: pregnant
    });
    this.dead = { age: this.age, year: this.year, cause: c };
    this.add(this.age < 1
      ? 'Жизнь закончилась в первые месяцы. Причина: ' + c + '.'
      : 'Жизнь закончилась в ' + this.age + ' ' + M.plural(this.age, 'год', 'года', 'лет') + '. Причина: ' + c + '.', 'death');
  };

  /* ------------------------- контекст для событий ---------------------- */

  Life.prototype.ctx = function () {
    var self = this;
    return {
      L: self,
      c: self.c,
      rnd: self.rnd,
      need: self.need,
      budget: self.budget,
      add: function (t, k) { return self.add(t, k); },
      /* события сдвигают и базовую линию здоровья на 3/4: типичные для страны
         беды уже заложены в её таблицу смертности, и только четверть удара
         от события превращается в дополнительный риск */
      stat: function (k, d) {
        self.stat(k, d);
        if (k === 'health') self.baseHealth = clamp(self.baseHealth + d * 0.82, 4, 100);
      },
      money: function (d) { self.addMoney(d); },
      flag: function (k, v) { self.flag(k, v); },
      has: function (k) { return self.has(k); },
      help: function () { self.helpLine(); }
    };
  };

  /* ----------------------------- учёба --------------------------------- */

  Life.prototype.schoolStep = function () {
    var c = this.c, rnd = this.rnd, a = this.age;
    var famBoost = 0.55 + this.famPct * 0.9;
    var urbanBoost = this.urban ? 1.12 : 0.9;
    var girlGap = (this.sex === 'f' && c.gdp < 6000 && c.tfr > 3.4) ? 0.82 : 1;
    var know = this.stats.know;
    var eduSpend = this.budget.edu;

    if (a === 6 && !this.edu.inSchool && !this.edu.left) {
      /* если решение не выпало (авто-жизни) — по статистике страны */
      if (rnd() < clamp(0.45 + c.school / 11, 0.25, 0.99) * famBoost * girlGap) {
        this.edu.inSchool = true;
        this.add('Вы пошли в школу.', 'life');
      } else {
        this.add('В школу вы так и не пошли.', 'bad');
        this.edu.left = true;
      }
    }

    if (this.edu.inSchool) {
      this.edu.years++;
      this.stat('know', (3.2 + know / 55 + eduSpend * 9 + (this.edu.private ? 1.6 : 0)) * (this.focus === 'study' ? 1.5 : 1));
      if (a === 11) {
        this.edu.level = Math.max(this.edu.level, 1);
        if (rnd() > clamp(c.school / 13, 0.2, 0.97) * famBoost * urbanBoost * girlGap) {
          this.edu.inSchool = false; this.edu.left = true;
          this.add('Школу пришлось оставить после начальных классов.', 'bad');
        }
      }
      if (a === 15) {
        this.edu.level = Math.max(this.edu.level, 2);
        if (rnd() > clamp((c.school - 2) / 11, 0.12, 0.95) * famBoost * urbanBoost * girlGap) {
          this.edu.inSchool = false; this.edu.left = true;
          this.add('Вы оставили школу и стали искать работу.', 'work');
        }
      }
      if (a === 18) {
        this.edu.level = Math.max(this.edu.level, this.edu.track === 'voc' ? 4 : 3);
        if (this.edu.track !== 'uni') {
          this.edu.inSchool = false;
          this.add(this.edu.track === 'voc' ? 'Вы получили специальность.' : 'Школа окончена.', 'life');
        }
      }
      if (a === 22 && this.edu.track === 'uni') {
        this.edu.level = Math.max(this.edu.level, 5);
        this.edu.inSchool = false;
        this.stat('know', 10);
        this.add('Университет окончен.', 'good');
      }
      if (a === 24 && this.edu.level === 5 && this.edu.track === 'uni' && rnd() < 0.18 + this.stats.know / 400) {
        this.edu.level = 6;
        this.stat('know', 8);
        this.add('Вы защитили магистерскую работу.', 'good');
      }
    } else if (a >= 7 && a <= 17 && this.edu.level < 2) {
      this.stat('know', 0.5);
    }
  };

  /* ----------------------------- работа -------------------------------- */

  Life.prototype.workStep = function () {
    var rnd = this.rnd;
    var a = this.age;
    if (this.retired || this.edu.inSchool) {
      if (this.retired) this.income = this.pension();
      return;
    }
    var workAge = a >= (this.c.gdp < 6000 ? 13 : 16) && a < 95;
    if (!workAge) { this.income = 0; return; }

    if (!this.job) {
      this.unemployedYears++;
      var pFind = clamp(0.55 + this.stats.know / 200 - this.unemployedYears * 0.06, 0.12, 0.92);
      if (this.careerBrake) pFind *= 0.7;
      if (rnd() < pFind) {
        this.hire(this.focus === 'money' ? 'hard' : 'stable');
      } else {
        this.income = this.famIncome * 0.25;
        if (this.unemployedYears === 2) this.add('Второй год без постоянной работы.', 'bad');
        return;
      }
    }

    var job = M.jobById[this.job.id];
    if (!job) { this.job = null; return; }          /* профессия из старого сохранения */
    if (this.job.rep === undefined) {               /* дополняем работу из прошлой версии */
      var fresh = this.makeJob(job, this.job.dream ? 'dream' : 'stable');
      fresh.id = this.job.id; fresh.step = this.job.step || 0; fresh.years = this.job.years || 0;
      this.job = fresh;
    }
    if (!this.career) this.career = { held: [], promos: 0, fired: 0, quit: 0, maxStep: 0, years: 0,
      injuries: 0, strikes: 0, courses: 0, sideline: 0 };
    var w = this.job;
    w.years++;
    this.career.years++;
    var mult = (this.business ? 1.25 : 1) * clamp(this.incomeBoost || 1, 0.4, 3);
    if (this.abroad) mult *= 2.1;
    if (this.council) mult *= 1.03;
    var PAYM = window.IN8B.pay;
    this.income = M.wageFor(this.c, job, w.step, this.stats.know, w.years,
      { sex: this.sex, urban: this.urban }) * mult * this.jobPay() *
      (PAYM ? PAYM.wageMult(this) : 1);

    /* рост по службе: чем выше ступень, тем уже горлышко */
    var pUp = (0.11 + this.stats.know / 900 + (this.focus === 'work' ? 0.06 : 0) +
      clamp(w.rep - 45, -25, 45) / 900 + w.boss * 0.012 + w.certs * 0.01 -
      (this.careerBrake ? 0.03 : 0) - (w.burnout > 70 ? 0.03 : 0)) * M.promoteOdds(w.step);
    if (w.years < 3 + w.step * 2) pUp = 0;                 /* на ступени надо посидеть */
    if (w.step < M.topStep(job) && rnd() < clamp(pUp, 0, 0.6)) {
      w.step++;
      this.career.promos++;
      this.career.maxStep = Math.max(this.career.maxStep, w.step);
      this.add('Вас повысили: ' + M.jobTitle(job, w.step) + '.', 'work');
      this.stat('happy', 4); w.mood = clamp(w.mood + 8, 0, 100);
    }
    this.jobWear(job);
  };

  /* ----------------------- сто видов заработка -------------------------
     Каждый год заново: какой формой платят на работе и что приходит
     помимо неё — карманные ребёнку, приработки, пособия, деньги мимо кассы.
     Набор держится годами и меняется, только когда меняется жизнь. */

  Life.prototype.payStep = function () {
    var PAY = window.IN8B.pay;
    this.payIncome = 0;
    if (!PAY) { this.payActive = []; return; }
    var self = this, rnd = this.rnd;

    /* форма оплаты основной работы: выбирается при устройстве и живёт с работой */
    if (!this.job) { this.payWage = null; this.payJob = null; }
    else {
      var jobKey = this.job.id + ':' + (this.job.contract || '') + ':' + (this.job.schedule || '');
      var fitW = PAY.fitFor(this, 'wage');
      var stillOk = this.payWage && fitW.some(function (p) { return p.id === self.payWage; });
      if (!stillOk || this.payJob !== jobKey) {
        this.payWage = fitW.length ? rnd.weighted(fitW, function (p) { return p.mult || 1; }).id : null;
        this.payJob = jobKey;
      }
    }

    /* остальные виды: детские деньги, приработки, выплаты, мимо кассы */
    var keep = [];
    (this.payActive || []).forEach(function (id) {
      var p = PAY.byId[id];
      if (!p) return;
      if (self.age < p.age[0] || self.age > p.age[1]) return;
      var ok = false;
      try { ok = p.fit ? p.fit(self) : true; } catch (e) { ok = false; }
      if (ok && rnd() > 0.12) keep.push(id);               /* редко бросают то, что кормит */
    });

    var caps = { child: this.age < 18 ? 3 : 0, extra: 2, social: 4, shadow: 1 };
    var have = { child: 0, extra: 0, social: 0, shadow: 0 };
    keep.forEach(function (id) { var k = PAY.byId[id].kind; have[k] = (have[k] || 0) + 1; });

    var tight = this.money < 0 || this.famPct < 0.4;
    var odds = {
      child: 0.55,
      extra: (this.focus === 'money' ? 0.3 : 0.14) + (tight ? 0.12 : 0),
      social: 0.7,
      shadow: (this.job && this.job.contract !== 'official' ? 0.22 : 0.07) + (tight ? 0.08 : 0)
    };
    ['child', 'extra', 'social', 'shadow'].forEach(function (kind) {
      if (have[kind] >= caps[kind]) return;
      if (rnd() > odds[kind]) return;
      var pool = PAY.fitFor(self, kind).filter(function (p) { return keep.indexOf(p.id) < 0; });
      if (!pool.length) return;
      keep.push(rnd.weighted(pool, function (p) { return (p.ev && p.ev.w) || 1; }).id);
    });

    this.payActive = keep;
    /* У ребёнка своими деньгами считаются только детские: карманные,
       подарки, подработка. Пособия и переводы родне — это деньги семьи,
       они идут в содержание, а не в «ваш доход». */
    var minor = this.age < 18 && !this.job;
    var own = 0, sup = 0;
    keep.forEach(function (id) {
      var p = PAY.byId[id], v = PAY.amountOf(self, p);
      if (minor && p.kind !== 'child') sup += v; else own += v;
    });
    this.payIncome = Math.min(own, this.need * (minor ? 0.35 : 1.4));
    this.paySupport = Math.min(sup, this.need * 0.8);
    if (minor) this.pocketTotal += this.payIncome;
  };

  /* слот года для ста событий заработка */
  Life.prototype.payEvent = function () {
    var PAY = window.IN8B.pay;
    if (!PAY) return null;
    var self = this;
    var x = this.ctx();
    var pool = PAY.auto.filter(function (ev) {
      if (self.age < ev.age[0] || self.age > ev.age[1]) return false;
      try { return ev.cond(x); } catch (e) { return false; }
    });
    if (!pool.length) return null;
    if (this.rnd() > 0.3) return null;
    var chosen = this.rnd.weighted(pool, function (ev) {
      return (typeof ev.w === 'function' ? ev.w(x) : ev.w) * (self.seenEvents[ev.id] ? 0.5 : 1);
    });
    if (!chosen) return null;
    this.seenEvents[chosen.id] = true;
    try { chosen.run(x); } catch (e) { return null; }
    return chosen;
  };

  /* сто механик: маленькие правила, которые работают сами */
  Life.prototype.mechStep = function (hook) {
    var MC = window.IN8B.mechanics;
    if (!MC) return 0;
    return MC.run(this, hook);
  };

  /* Личный множитель к зарплате: договор, переработки, график, разряды,
     профсоюз, репутация и надбавки, которые принесли события. */
  Life.prototype.jobPay = function () {
    var w = this.job, k = clamp(w.boost || 1, 0.5, 2.2);
    if (w.contract === 'grey') k *= 1.08;                  /* в конверте — больше на руки */
    else if (w.contract === 'none') k *= 0.93;             /* и меньше, и в любой день конец */
    k *= 1 + (w.overtime || 0) * 0.09;
    k *= 1 + (w.certs || 0) * 0.045;
    if (w.union) k *= 1.04;
    if (w.schedule === 'night') k *= 1.12;
    else if (w.schedule === 'shift') k *= 1.05;
    else if (w.schedule === 'rotation') k *= 1.38;
    if (w.remote) k *= 1.02;
    k *= 1 + clamp(w.rep - 50, -35, 45) / 520;
    if (w.payDelay > 0) { w.payDelay--; k *= 0.72; }       /* зарплату задержали */
    return k;
  };

  /* Чем работа берёт с человека плату: усталостью, графиком, дорогой,
     отношением начальника и риском покалечиться. */
  Life.prototype.jobWear = function (job) {
    var w = this.job, rnd = this.rnd;
    var hard = (job.sector === 'manual' || job.sector === 'agri' || job.sector === 'informal');
    if (w.overtime) { this.stat('health', -w.overtime * 0.4); this.stat('bond', -w.overtime * 0.5); }
    if (w.schedule === 'night') this.stat('health', -0.6);
    if (w.schedule === 'shift') this.stat('health', -0.25);
    if (w.schedule === 'rotation') { this.stat('bond', -1.3); this.stat('happy', -0.6); }
    if (w.commute > 1.6) this.stat('happy', -0.7);
    if (w.remote) { this.stat('happy', 0.5); this.stat('bond', -0.3); }
    if (hard && this.age > 45) this.stat('health', -0.35);

    /* выгорание копится от нелюбимой работы и переработок и тает в отпуске */
    var fuel = (w.mood < 45 ? 3.4 : -1.7) + (w.overtime || 0) * 2.8 +
      (this.focus === 'work' ? 1.5 : -0.6) + (w.boss < 0 ? 1.8 : -0.4) +
      (w.schedule === 'night' || w.schedule === 'rotation' ? 1 : 0) + (w.commute > 1.6 ? 0.7 : 0);
    w.burnout = clamp((w.burnout || 0) + fuel, 0, 100);
    if (w.burnout > 70) { this.stat('happy', -2); this.stat('health', -0.5); }
    else if (w.burnout < 20) this.stat('happy', 0.6);

    /* как вы относитесь к своему делу */
    w.mood = clamp(w.mood + w.boss * 1.1 + (w.dream ? 1.2 : 0) + (w.union ? 0.3 : 0) -
      (w.burnout > 60 ? 2.5 : 0) - 0.4, 0, 100);
    this.stat('happy', (w.mood - 50) / 60);

    /* репутация в профессии: её наживают годами и теряют быстро */
    w.rep = clamp(w.rep + 1.1 + (w.certs || 0) * 0.4 + (this.focus === 'work' ? 1.2 : 0) -
      (w.burnout > 70 ? 1.8 : 0), 0, 100);

    /* травма на работе: чем опаснее дело и хуже с охраной труда, тем чаще */
    var pHurt = clamp((job.risk - 0.85) * 0.055 * (1.25 - w.safety * 0.8), 0, 0.09);
    if (rnd() < pHurt) {
      var heavy = rnd() < 0.22;
      this.career.injuries++;
      this.stat('health', heavy ? -11 : -3.5);
      if (heavy) {
        this.add('Травма на работе: ' + (w.safety < 0.4 ? 'технику безопасности здесь не соблюдают' :
          'несчастный случай') + '. Лечение затянулось.', 'bad');
        this.addMoney(-this.need * (w.contract === 'official' ? 0.08 : 0.3));
        if (rnd() < 0.3) this.flag('chronic', true);
      } else {
        this.add('Мелкая травма на работе. Пару недель работали через боль.', 'work');
      }
    }

    /* увольнение: сокращения, конфликт с начальником, работа без договора */
    var pFire = clamp(0.012 + (w.boss < -1 ? 0.05 : 0) + (w.contract === 'none' ? 0.05 : 0) +
      (w.contract === 'grey' ? 0.02 : 0) + (w.rep < 30 ? 0.03 : 0) + (w.burnout > 80 ? 0.02 : 0) -
      (w.union ? 0.02 : 0) - (M.PUBLIC_JOBS[job.id] ? 0.008 : 0), 0, 0.2);
    if (this.age > 55) pFire += 0.012;
    if (rnd() < pFire) {
      this.career.fired++;
      this.add('Вас уволили: ' + (w.boss < -1 ? 'начальник давно искал повод' :
        w.contract === 'none' ? 'без договора это делается за один день' : 'сокращение штата') + '.', 'bad');
      this.addMoney(w.contract === 'official' ? this.need * 0.25 : 0);
      this.stat('happy', -8);
      this.job = null;
      this.unemployedYears = 0;
    }
  };

  /* Заработок супруга. У него своя работа и свой уровень дохода: люди сходятся
     с похожими (процентиль наполовину наследует ваш), но не с копиями себя.
     Работает супруг не всегда: в бедных и сельских странах чаще сидит дома,
     и маленькие дети тоже держат его дома. */
  Life.prototype.partnerWage = function () {
    var withPartner = (this.marital === 'married' || this.marital === 'partner') && this.partner;
    if (!withPartner) return 0;
    var p = this.partner;
    if (p.pct === undefined) {
      var mine = clamp(M.percentileOfIncome(this.c, Math.max(this.ownIncome || this.famIncome, 1)), 0.02, 0.98);
      p.pct = clamp(mine * 0.45 + this.rnd() * 0.55, 0.03, 0.97);
      p.works = this.rnd() < clamp(0.26 + this.c.urban / 260 + this.c.gdp / 70000, 0.2, 0.9);
    }
    var small = 0;
    for (var i = 0; i < this.children.length; i++) {
      if (this.age - (this.children[i].bornAt || this.children[i].born || this.age) < 6) small++;
    }
    var base = M.incomeAtPercentile(this.c, p.pct);
    if (!p.works) return base * 0.18;                 /* дом, огород, подработки */
    if (small) base *= clamp(1 - small * 0.22, 0.35, 1);
    if (this.abroad) base *= 1.6;
    return base;
  };

  Life.prototype.pension = function () {
    var base = this.c.gdp * 0.18;
    var worked = this.job ? this.job.years : 25;
    var grey = this.has('grey') ? 0.72 : 1;   /* зарплата в конверте — маленькая пенсия */
    var cut = this.has('pensionCut') ? 0.82 : 1;  /* реформа: позже и меньше */
    return base * clamp(0.5 + worked / 60, 0.4, 1.3) * (this.c.gdp > 12000 ? 1.2 : 0.6) * grey * cut;
  };

  /* эффект траты: при ratio = 1 (норма) ровно ноль, дальше — логарифм */
  function centered(ratio, k) {
    return k * Math.log((Math.max(ratio, 0) + 0.3) / 1.3);
  }

  /* --------------------------- деньги и траты -------------------------- */

  Life.prototype.moneyStep = function () {
    var a = this.age;
    var b = this.budget;
    var need = this.need;
    var household = 1 + (this.partner ? 0.7 : 0) + this.children.length * 0.5;

    /* Доход года. Свой заработок каждый год заново считает workStep() по
       профессии, ступени, стажу и знаниям — здесь он только собирается
       с доходом супруга и доходом с капитала. Складывать прошлогодний итог
       обратно в свою зарплату нельзя: получается снежный ком. */
    /* Ребёнок не зарабатывает. Его кормит, одевает и учит семья — это
       support, «на вас тратят», а не ваш доход. Своими у ребёнка могут
       быть только детские деньги: карманные, подарки, подработки. */
    var minor = a < 18 && !this.job && !this.homeless;
    this.minorYear = minor;        /* этот год человек прожил на деньги семьи */
    var own = 0, support = 0;
    var extra = this.payIncome || 0;
    if (this.homeless) own = need * (0.05 + this.rnd() * 0.07) + extra;
    else if (minor) { own = extra; support = this.famIncome * 0.9 + (this.paySupport || 0); }
    else if (a < 18 && !this.job) { own = extra; support = this.famIncome * 0.9; }
    else if (this.retired) own = this.pension() + extra;
    else if (!this.job) { own = extra; support = this.famIncome * 0.3; }
    else own = (this.income || 0) + extra;

    this.ownIncome = own;
    this.support = support;
    this.partnerIncome = this.partnerWage();
    var income = own + this.partnerIncome;
    this.laborIncome = income;                 /* заработанное трудом и семьёй */
    income += (this.capitalIncome || 0);       /* рента, купоны, прибыль своего дела */
    this.income = income;

    /* домохозяйство живёт на свой доход плюс то, что даёт семья */
    var spendable = Math.max(income + support, 0);
    var spent = {};
    BUDGET_META.forEach(function (m) { spent[m.id] = spendable * b[m.id]; });

    /* «типичный человек страны»: те же траты при медианном доходе и обычном бюджете.
       Базовая линия здоровья двигается вместе с ним, поэтому бедность страны
       не считается дважды — она уже заложена в таблицу смертности. */
    var baseFood = (spendable * DEFAULT_BUDGET.food) / (need * 0.42 * household);
    var baseCare = (spendable * DEFAULT_BUDGET.health) / (need * 0.1 * household);
    this.baseHealth = clamp(this.baseHealth
      + (baseFood < 1 ? -(1 - baseFood) * 9 : Math.min(2.2, (baseFood - 1) * 2))
      + clamp(centered(baseCare, 2.4), -3, 3.4), 4, 100);

    /* эффекты трат */
    var self = this;
    BUDGET_META.forEach(function (m) {
      var target = need * m.need * household;
      var ratio = target > 0 ? spent[m.id] / target : 1;
      switch (m.id) {
        case 'food':
          if (ratio < 1) { self.stat('health', -(1 - ratio) * 9); self.stat('happy', -(1 - ratio) * 6); }
          else self.stat('health', Math.min(2.2, (ratio - 1) * 2));
          break;
        case 'health':
          self.stat('health', clamp(centered(ratio, 2.4), -3, 3.4));
          break;
        case 'edu':
          if (a < 26 || self.children.length) self.stat('know', clamp(centered(ratio, 2.6), -2, 3.4));
          break;
        case 'home':
          self.stat('happy', clamp(centered(ratio, 2.2), -4, 3));
          if (ratio < 0.5) self.stat('health', -1.1);
          break;
        case 'fun':
          self.stat('happy', clamp(centered(ratio, 2.6), -3.5, 3.6));
          self.stat('bond', clamp(centered(ratio, 1.2), -1.5, 1.8));
          break;
        case 'family':
          self.stat('bond', clamp(centered(ratio, 2.4), -3, 3.2));
          break;
        case 'save':
          /* ребёнок откладывает только свои деньги, а не семейные */
          self.money += minor ? Math.max(own, 0) * b.save : spent.save;
          break;
      }
    });

    /* сто механик денежного шага: коммуналка, дорога, лекарства, мелочи */
    this.mechSpend = 0; this.mechEarn = 0;
    this.mechStep('money');
    var mechRaw = (this.mechSpend || 0) * 0.45;
    var mechGain = (this.mechEarn || 0) * 0.6;
    if (minor) { mechRaw = 0; mechGain *= 0.3; }      /* мелочи ребёнка оплачивает семья */
    /* Мелкие траты не висят поверх бюджета и не загоняют в долг: сперва
       они съедают то, что человек собирался отложить, а когда откладывать
       нечего — он просто урезает эти самые мелочи. */
    var mechCost = Math.min(mechRaw, spendable * 0.12, Math.max(this.money + mechGain, 0));
    this.mechCost = mechCost; this.mechGain = mechGain;
    this.money += mechGain - mechCost;

    /* долги и проценты */
    if (this.has('mortgage')) this.money -= need * 0.12;
    if (this.upkeep) this.money -= need * this.upkeep;      /* содержание купленного */
    if (this.has('deposit') && this.money > 0) this.money *= 1.035;
    /* у несовершеннолетнего не бывает долгов: счета семьи — не его счета */
    if (minor && this.money < 0) this.money = 0;
    if (this.money < 0) {
      this.money *= 1.08;
      this.stat('happy', -2);
      if (this.money < -need * 2 && !this.has('debtTrap')) {
        this.flag('debtTrap', true);
        this.add('Долги стали больше, чем годовой доход семьи.', 'bad');
      }
    }
  };

  /* ------------------------- вложения и своё дело ---------------------- */
  /* Весь расчёт живёт в src/invest.js: пока игрок ничего не вложил,
     метод просто обнуляет доход с капитала и ничего не меняет. */

  Life.prototype.investStep = function () {
    var IV = window.IN8B.invest;
    if (!IV) { this.capitalIncome = 0; return null; }
    try { return IV.tickYear(this); } catch (e) { this.capitalIncome = 0; return null; }
  };

  /* --------------------------- фокус года ------------------------------ */

  Life.prototype.focusStep = function () {
    switch (this.focus) {
      case 'study': this.stat('know', this.age < 30 ? 3.2 : 1.6); this.stat('happy', -0.6); break;
      case 'work': this.stat('happy', -1); this.stat('health', -0.8); break;
      case 'health': this.stat('health', 3.4); this.stat('happy', 0.8); break;
      case 'family': this.stat('bond', 3.2); this.stat('happy', 1.4); break;
      case 'friends': this.stat('bond', 3.6); this.stat('happy', 2.2); this.stat('know', 0.4); break;
      case 'rest': this.stat('happy', 3); this.stat('health', 1.4); break;
      case 'money': this.stat('happy', -1.2); this.stat('health', -1); break;
    }
  };

  /* --------------------- естественный ход показателей ------------------ */

  Life.prototype.driftStep = function () {
    var a = this.age;
    /* базовая кривая здоровья — одна для всех: рост до 18, плато, спад после 28.
       Смертность смотрит не на сам уровень здоровья, а на отклонение от этой кривой,
       иначе разница между странами считалась бы дважды (она уже в таблице смертности). */
    var baseDecay = a < 18 ? -0.9 : a < 28 ? 0.1 : (a - 26) * 0.036;
    this.baseHealth = clamp(this.baseHealth - baseDecay, 4, 100);

    var decay = baseDecay;
    /* работа после обычного пенсионного возраста изнашивает: тело уже не то,
       а отложить отдых пришлось не по своей воле */
    if (this.retireLate && !this.retired && this.job && a > 58) decay += 1.6;
    if (this.has('smoker')) decay += 0.55;
    if (this.has('chronic')) decay += 0.7;
    if (this.has('addiction')) decay += 0.9;
    if (this.has('untreated')) decay += 0.4;
    this.stat('health', -decay);

    /* счастье тянется к уровню страны и зависит от условий */
    var target = this.c.happy * 9.2
      + (M.percentileOfIncome(this.c, Math.max(this.income || this.famIncome, 1)) - 0.5) * 22
      + (this.stats.bond - 55) * 0.25
      + (this.stats.health - 60) * 0.2
      + (this.marital === 'married' || this.marital === 'partner' ? 5 : 0)
      + (this.money < 0 ? -8 : 0)
      + (this.job && this.job.dream ? 5 : 0);
    this.stats.happy += (clamp(target, 5, 95) - this.stats.happy) * 0.22;
    this.stats.happy = clamp(this.stats.happy, 0, 100);

    /* связи слабеют без вложений, крепнут в семье */
    this.stat('bond', -0.9 + (this.children.length ? 0.5 : 0) + (this.partner ? 0.5 : 0));

    /* знания забываются без применения */
    if (a > 25 && !this.edu.inSchool) this.stat('know', this.focus === 'study' ? 0 : -0.35);
  };

  /* ----------------------------- события ------------------------------- */

  Life.prototype.pickEvents = function () {
    var self = this;
    var x = this.ctx();
    var pool = E.auto.filter(function (ev) {
      if (ev.money) return false;              /* у денежных событий свой слот */
      if (self.age < ev.age[0] || self.age > ev.age[1]) return false;
      if (ev.once && self.seenEvents[ev.id]) return false;
      if (ev.heavy && self.settings.soft) return false;
      if (ev.cond && !ev.cond(x)) return false;
      return true;
    });
    if (!pool.length) return;
    var count = this.rnd() < 0.62 ? 1 : (this.rnd() < 0.78 ? 0 : 2);
    for (var i = 0; i < count; i++) {
      var chosen = this.rnd.weighted(pool, function (ev) {
        return typeof ev.w === 'function' ? ev.w(x) : (ev.w === undefined ? 1 : ev.w);
      });
      if (!chosen) return;
      this.seenEvents[chosen.id] = true;
      chosen.run(x);
      pool = pool.filter(function (e2) { return e2 !== chosen; });
      if (!this.alive) return;
    }
  };

  /* ----------------------- денежный слот года --------------------------
     Деньги живут своей чередой: цены, премии, счета, долги и переводы
     от уехавшей родни. У них отдельный жребий, поэтому новые события
     не вытесняют болезни и войны из основного потока и не сдвигают
     статистику жизни. */

  Life.prototype.moneyEvent = function () {
    if (this.age < 8) return null;
    var self = this;
    var x = this.ctx();
    var pool = E.auto.filter(function (ev) {
      if (!ev.money) return false;
      if (self.age < ev.age[0] || self.age > ev.age[1]) return false;
      if (ev.once && self.seenEvents[ev.id]) return false;
      if (ev.heavy && self.settings.soft) return false;
      if (ev.cond && !ev.cond(x)) return false;
      return true;
    });
    if (!pool.length) return null;
    if (this.rnd() > 0.27) return null;
    var chosen = this.rnd.weighted(pool, function (ev) {
      var w = typeof ev.w === 'function' ? ev.w(x) : (ev.w === undefined ? 1 : ev.w);
      if (self.seenEvents[ev.id]) w *= 0.5;   /* то же самое второй раз — реже */
      return w;
    });
    if (!chosen) return null;
    this.seenEvents[chosen.id] = true;
    chosen.run(x);
    return chosen;
  };

  /* ----------------------- рабочий слот года ---------------------------
     У работы свой жребий, отдельно от болезней, войн и денег: начальник,
     коллеги, график, разряды, проверки, слухи о сокращении. Поэтому сто
     рабочих событий ничего не вытесняют из остальной жизни. */

  Life.prototype.workEvent = function () {
    if (this.age < 13) return null;
    if (!this.job && !(this.unemployedYears > 0 && this.age < 66)) return null;
    var self = this;
    var x = this.ctx();
    var pool = W.auto.filter(function (ev) {
      if (self.age < ev.age[0] || self.age > ev.age[1]) return false;
      if (ev.once && self.seenEvents[ev.id]) return false;
      if (ev.heavy && self.settings.soft) return false;
      if (ev.needJob !== false && !self.job) return false;
      if (ev.cond && !ev.cond(x)) return false;
      return true;
    });
    if (!pool.length) return null;
    if (this.rnd() > 0.36) return null;
    var chosen = this.rnd.weighted(pool, function (ev) {
      var w = typeof ev.w === 'function' ? ev.w(x) : (ev.w === undefined ? 1 : ev.w);
      if (self.seenEvents[ev.id]) w *= 0.45;
      return w;
    });
    if (!chosen) return null;
    this.seenEvents[chosen.id] = true;
    chosen.run(x);
    return chosen;
  };

  /* ------------------- условия у вариантов решения --------------------
     req — что нужно иметь, чтобы вариант был доступен. Каждое требование
     возвращается наружу вместе с тем, что у человека есть сейчас: игрок
     видит и порог, и свой запас, а закрытый вариант не нажимается.      */

  var REQ_WORD = { know: 'знания', health: 'здоровье', bond: 'отношения', happy: 'счастье' };
  var EDU_WORD = ['без школы', 'начальная школа', 'неполная средняя школа', 'средняя школа',
    'специальность', 'высшее образование', 'учёная степень'];

  function reqVal(v, x) { return typeof v === 'function' ? v(x) : v; }

  /* чем реально можно заплатить: свои деньги, а пока вы молоды — и помощь семьи */
  Life.prototype.purse = function () {
    return this.money + (this.age < 23 && this.parentsAlive > 0 ? this.famIncome * 0.8 : 0);
  };

  /* список требований варианта: [{k, need, have, ok, word}] */
  Life.prototype.optionReqs = function (o, x) {
    var r = o.req, out = [], L = this;
    if (!r) return out;
    if (r.money !== undefined) {
      var needM = Math.max(0, Math.round(reqVal(r.money, x)));
      var have = Math.round(L.purse());
      out.push({ k: 'money', need: needM, have: have, ok: have >= needM });
    }
    ['know', 'health', 'bond', 'happy'].forEach(function (k) {
      if (r[k] === undefined) return;
      var n = Math.round(reqVal(r[k], x)), h = Math.round(L.stats[k]);
      out.push({ k: 'stat', word: REQ_WORD[k], need: n, have: h, ok: h >= n });
    });
    if (r.edu !== undefined) {
      out.push({
        k: 'text', ok: L.edu.level >= r.edu,
        text: 'нужно ' + (EDU_WORD[r.edu] || 'образование'),
        done: 'есть ' + (EDU_WORD[L.edu.level] || 'образование')
      });
    }
    if (r.job) out.push({ k: 'text', ok: !!L.job, text: 'нужна работа', done: 'работа есть' });
    if (r.kids) out.push({ k: 'text', ok: L.children.length > 0, text: 'нужны дети', done: 'дети есть' });
    if (r.partner) out.push({ k: 'text', ok: !!L.partner, text: 'нужна семья', done: 'семья есть' });
    /* особые условия: одно, два или список; текст может зависеть от жизни */
    var customs = [];
    if (r.custom) customs.push(r.custom);
    if (r.custom2) customs.push(r.custom2);
    if (r.customs && r.customs.length) customs = customs.concat(r.customs);
    customs.forEach(function (cu) {
      var why = typeof cu.why === 'function' ? cu.why(x) : cu.why;
      var done = cu.done === undefined ? why : (typeof cu.done === 'function' ? cu.done(x) : cu.done);
      out.push({ k: 'text', ok: !!cu.test(x), text: why, done: done });
    });
    return out;
  };

  /* вариант для показа: с условиями, ценой и шансом */
  Life.prototype.optionView = function (o, i, x) {
    var reqs = this.optionReqs(o, x);
    var locked = false;
    for (var k = 0; k < reqs.length; k++) if (!reqs[k].ok) locked = true;
    return {
      i: i, label: o.label, hint: o.hint, run: o.run, fail: o.fail, weight: o.w,
      reqs: reqs, locked: locked,
      price: o.cost && o.cost.money !== undefined ? Math.round(reqVal(o.cost.money, x)) : null,
      gain: o.cost && o.cost.gain !== undefined ? Math.round(reqVal(o.cost.gain, x)) : null,
      chance: typeof o.chance === 'function' ? clamp(o.chance(x), 0.01, 0.99) : null
    };
  };

  /* собрать карточку решения из описания события */
  Life.prototype.buildDecision = function (card, x) {
    var L = this;
    var options = (card.options || []).filter(function (o) { return !o.cond || o.cond(x); });
    if (!options.length) return null;
    var view = options.map(function (o, i) { return L.optionView(o, i, x); });
    /* тупика быть не должно: если закрыто всё, открываем самый лёгкий вариант */
    var open = view.filter(function (o) { return !o.locked; });
    if (!open.length) {
      var best = view[0], bestN = 99;
      view.forEach(function (o) {
        var n = o.reqs.filter(function (r) { return !r.ok; }).length;
        if (n < bestN) { bestN = n; best = o; }
      });
      best.locked = false;
      best.forced = true;
    }
    return {
      id: card.id,
      title: typeof card.title === 'function' ? card.title(x) : card.title,
      text: typeof card.text === 'function' ? card.text(x) : card.text,
      heavy: !!card.heavy,
      options: view
    };
  };

  /* ------------------------- цепочки решений ---------------------------
     Одно решение тянет за собой следующее: взял кредит — через год
     разговор о просрочке, оказался на улице — каждый год новый выбор.
     Отложенная карточка приходит в свой срок и обходит обычный жребий. */

  Life.prototype.schedule = function (id, years) {
    if (!this.queue) this.queue = [];
    for (var i = 0; i < this.queue.length; i++) if (this.queue[i].id === id) return;
    this.queue.push({ id: id, at: this.age + Math.max(0, years === undefined ? 1 : years) });
  };

  Life.prototype.unschedule = function (id) {
    if (!this.queue) return;
    for (var i = this.queue.length - 1; i >= 0; i--) if (this.queue[i].id === id) this.queue.splice(i, 1);
  };

  Life.prototype.dueCard = function () {
    if (!this.queue || !this.queue.length) return null;
    var x = this.ctx();
    for (var i = 0; i < this.queue.length; i++) {
      if (this.queue[i].at > this.age) continue;
      var id = this.queue[i].id;
      this.queue.splice(i, 1);
      var card = null;
      for (var k = 0; k < ALLCH.length; k++) if (ALLCH[k].id === id) card = ALLCH[k];
      if (!card) return null;
      if (card.heavy && this.settings.soft) return null;
      if (card.cond && !card.cond(x)) return null;   /* жизнь ушла вперёд — разговор отпал */
      this.seenEvents['c:' + card.id] = true;
      return this.buildDecision(card, x);
    }
    return null;
  };

  /* ---------------------------- улица ----------------------------------
     Бездомность — не ярлык, а состояние: без работы, без адреса, с другим
     риском умереть. Из него есть выходы, и каждый год приходится выбирать. */

  /* где зима по-настоящему опасна для того, кто ночует на улице */
  var COLD_REGION = { eue: 1, eun: 1, asc: 1, amn: 0.9, ase: 0.7, euw: 0.6, eus: 0.3 };
  Life.prototype.coldWinter = function () { return COLD_REGION[this.c.region] || 0; };

  Life.prototype.toStreet = function (why) {
    if (this.homeless) return;
    this.homeless = 1;
    this.lastEvict = this.age;
    this.flag('homeless', true);
    this.home = false;
    this.flag('mortgage', false);
    /* с человека без адреса взять нечего: производство закрывают, долг списывают */
    this.loan = null;
    this.microDebt = 0;
    this.flag('noPay', false); this.flag('inCourt', false);
    this.unschedule('loan-trouble'); this.unschedule('loan-court'); this.unschedule('evict');
    if (this.job) { this.job = null; this.unemployedYears = 0; }
    this.add(why || 'Вы остались без крыши над головой.', 'bad');
    this.stat('happy', -22); this.stat('bond', -10);
    /* семья выдерживает не всегда */
    if ((this.marital === 'married' || this.marital === 'partner') && this.rnd() < 0.45) {
      this.marital = 'single'; this.partner = null;
      this.add('Семья этого не выдержала: вы остались одни.', 'family');
      this.stat('happy', -8);
    }
    this.schedule('street-first', 0);
    this.helpLine();
  };

  Life.prototype.offStreet = function (text) {
    if (!this.homeless) return;
    this.streetTotal += this.homeless;
    this.homeless = 0;
    this.flag('homeless', false);
    this.flag('wasHomeless', true);
    this.lastEvict = this.age;
    if (this.money < 0) this.money = 0;   /* с улицы возвращаются без долгов и без всего */
    this.unschedule('street-day');
    this.unschedule('street-winter');
    if (text) this.add(text, 'good');
    this.stat('happy', 14);
  };

  /* год на улице: холод, болезни, редкий заработок — и шанс зацепиться */
  Life.prototype.streetStep = function () {
    if (!this.homeless) return;
    this.homeless++;
    this.stat('health', -(3 + this.coldWinter() * 1.8 + (this.age > 55 ? 1.4 : 0)));
    this.stat('happy', -4);
    this.stat('bond', -2);
    if (this.rnd() < 0.12 && !this.has('addiction')) {
      this.flag('addiction', true);
      this.add('На улице стало легче, когда выпьешь. Так и втянулись.', 'bad');
    }

    /* улица иногда отпускает сама: подобрали, пристроили, позвали обратно.
       Чем дольше человек на улице, тем реже — связи рвутся, навыки уходят. */
    /* первые год-два вернуться проще всего: есть связи, вещи, навык и силы */
    var fresh = this.homeless <= 2 ? 2.0 : this.homeless <= 4 ? 1.3 : this.homeless <= 8 ? 0.8 : 0.45;
    var out = (0.12 + this.stats.bond / 700 + (this.has('docs') ? 0.07 : 0) + (this.has('shelter') ? 0.05 : 0)) *
      fresh * (this.has('addiction') ? 0.6 : 1) * (this.stats.health > 45 ? 1 : 0.75);
    if (this.rnd() < out) {
      var how = this.rnd() < 0.5
        ? 'Знакомые пустили пожить, и вы зацепились за работу.'
        : 'Нашлась койка в общежитии при работе: это снова адрес.';
      this.offStreet(how);
      this.hire('hard');
      return;
    }

    /* каждый год улица задаёт свой вопрос */
    var r = this.rnd();
    if (this.coldWinter() > 0.45 && r < 0.45) this.schedule('street-winter', 0);
    else if (r < 0.45 && (this.has('docs') || this.stats.health > 45)) this.schedule('street-job', 0);
    else if (r < 0.58) this.schedule('street-help', 0);
    else this.schedule('street-day', 0);
  };

  /* ---------------------------- кредит ---------------------------------
     Настоящий заём: деньги сразу, платёж каждый год, просрочки и суд. */

  Life.prototype.takeLoan = function (sum, years, rate) {
    sum = Math.max(1, Math.round(sum));
    years = Math.max(2, Math.round(years || 5));
    rate = rate === undefined ? 0.14 : rate;
    var total = sum * (1 + rate * years);
    this.loan = { sum: sum, left: total, pay: total / years, miss: 0, years: years, since: this.age };
    this.money += sum;
    return this.loan;
  };

  Life.prototype.loanStep = function () {
    var L = this.loan;
    if (!L) return;
    /* небольшой минус банк терпит: люди залезают в долги, но платят */
    if (this.money - L.pay > -this.need * 0.3) {
      this.money -= L.pay;
      L.left -= L.pay;
      if (L.miss > 0) L.miss--;
      if (L.left <= 0.5) {
        this.loan = null;
        this.flag('goodCredit', true);
        this.add('Последний платёж по кредиту: долг закрыт.', 'money');
        this.stat('happy', 7);
      }
      return;
    }
    /* платить нечем: отдают, что наскребли, остальное обрастает пенями */
    var part = Math.max(0, Math.min(L.pay, this.money + this.need * 0.3));
    this.money -= part;
    L.left = Math.max(0, L.left - part + L.pay * 0.15);
    L.miss++;
    if (L.left <= 0.5) {                      /* даже с просрочками долг кончается */
      this.loan = null;
      this.flag('goodCredit', true);
      this.add('Долг закрыт — последние платежи дались тяжело.', 'money');
      this.stat('happy', 5);
      return;
    }
    if (L.miss === 1) this.add('Платёж по кредиту внесли не полностью: денег не хватило.', 'money');
    if (L.miss === 2) this.schedule('loan-trouble', 0);
    if (L.miss >= 4 && !this.has('inCourt')) {
      this.flag('inCourt', true);
      this.schedule('loan-court', 0);
    }
  };

  /* Карточка решения на этот год (или null).
     money:true — карточки про деньги. У них своя очередь: их показывают
     в годы, когда ничего другого не случилось, иначе они вытеснили бы
     решения о семье, работе и учёбе. */
  Life.prototype.pickDecision = function (kind) {
    if (kind === true) kind = 'money';
    var slot = kind || 'life';
    var self = this;
    var x = this.ctx();
    var pool = ALLCH.filter(function (ch) {
      if (ch.chain) return false;              /* продолжение истории приходит по расписанию */
      if ((ch.work ? 'work' : (ch.money ? 'money' : 'life')) !== slot) return false;
      if (slot === 'work' && ch.needJob !== false && !self.job) return false;
      if (self.age < ch.age[0] || self.age > ch.age[1]) return false;
      if (ch.once && self.seenEvents['c:' + ch.id]) return false;
      if (ch.heavy && self.settings.soft) return false;
      if (ch.cond && !ch.cond(x)) return false;
      return true;
    });
    if (!pool.length) return null;
    var priority = pool.filter(function (p) { return p.priority; });
    /* разговор о деньгах — не каждый год; беда спрашивает сразу */
    if (!priority.length && slot === 'money' && this.rnd() > 0.25) return null;
    if (!priority.length && slot === 'work' && this.rnd() > 0.3) return null;
    var card;
    if (priority.length) {
      card = priority[0];
    } else {
      var cand = this.rnd.pick(pool);
      var p = cand.chance ? cand.chance(x) : (slot === 'life' ? 0.28 : 0.18);
      if (this.rnd() < p) card = cand;
    }
    if (!card) return null;
    this.seenEvents['c:' + card.id] = true;
    return this.buildDecision(card, x);
  };

  /* Нейтральный выбор (авторежим и фоновые жизни): по весам вариантов,
     чтобы средние результаты совпадали со статистикой страны */
  Life.prototype.autoAnswer = function () {
    var d = this.pendingDecision;
    if (!d) return;
    var x = this.ctx();
    var open = d.options.filter(function (o) { return !o.locked; });
    var pick = this.rnd.weighted(open, function (o) {
      if (!o.weight) return 1;
      return Math.max(0.0001, typeof o.weight === 'function' ? o.weight(x) : o.weight);
    });
    this.answer(d.options.indexOf(pick || open[0] || d.options[0]));
  };

  /* Пересобрать карточку решения по её идентификатору (после загрузки сохранения) */
  Life.prototype.decisionById = function (id) {
    var card = null;
    for (var i = 0; i < ALLCH.length; i++) if (ALLCH[i].id === id) card = ALLCH[i];
    if (!card) return null;
    return this.buildDecision(card, this.ctx());
  };

  Life.prototype.answer = function (index) {
    var d = this.pendingDecision;
    if (!d) return;
    var opt = d.options[clamp(index, 0, d.options.length - 1)];
    /* закрытый вариант выбрать нельзя — берём первый доступный */
    if (opt && opt.locked) {
      for (var i = 0; i < d.options.length; i++) if (!d.options[i].locked) { opt = d.options[i]; break; }
    }
    this.pendingDecision = null;
    var x = this.ctx();
    var failed = false;
    if (opt) {
      if (opt.chance !== null && opt.chance !== undefined && opt.fail && this.rnd() >= opt.chance) {
        failed = true;
        opt.fail(x);
      } else if (opt.run) {
        opt.run(x);
      }
    }
    this.decisions = (this.decisions || 0) + 1;
    this.lastDecision = {
      age: this.age, title: d.title, choice: opt ? opt.label : '',
      failed: failed
    };
  };

  /* -------------------------- смертность ------------------------------- */

  Life.prototype.mortalityRisk = function (fromAge) {
    var a = clamp(fromAge === undefined ? this.age : fromAge, 0, M.maxAge);
    var q = this.table.qx[a];
    if (a < 5) {
      /* в первые годы решает не образ жизни, а достаток семьи и медицина */
      return clamp(q * clamp(1 + (0.5 - this.famPct) * 0.6 - (this.budget.health - 0.1) * 0.8, 0.55, 1.8), 0, 0.97);
    }
    /* отклонение от базовой кривой здоровья: хуже среднего — выше риск.
       Множители подобраны так, чтобы у «нейтральной» жизни их произведение
       было около единицы: тогда средний возраст смерти совпадает с таблицей. */
    var gap = this.baseHealth - this.stats.health;
    var r = Math.exp(gap / 62);
    r *= 1 + (0.45 - clamp(M.percentileOfIncome(this.c, Math.max(this.income || this.famIncome, 1)), 0, 1)) * 0.3;
    /* каждая зима без дома тяжелее предыдущей: сперва держишься,
       потом здоровье уходит быстрее, чем успеваешь его чинить */
    if (this.homeless) r *= (this.homeless > 3 ? 5.2 : 3.2) * (1 + (this.homeless - 1) * 0.06);
    if (this.has('smoker') && a > 30) r *= 1.22;
    if (this.has('chronic')) r *= 1.22;
    if (this.has('untreated')) r *= 1.2;
    if (this.has('addiction')) r *= 1.4;
    if (this.warUntil && a <= this.warUntil) r *= 1.7;
    if (this.job) r *= Math.pow(M.jobById[this.job.id].risk / 1.12, 0.5);
    if (this.budget.health > 0.16) r *= 0.92;
    if (this.budget.food < 0.2) r *= 1.08;
    /* Потолок множителя: иначе редкое совпадение бед даёт верную смерть.
       У человека без дома потолок выше — на улице четвёртая зима
       действительно опаснее первой, и это должно быть видно в числах. */
    var cap = this.homeless ? 11 + this.homeless : 6;
    return clamp(q * RISK_CAL * clamp(r, 0.5, cap), 0, 0.97);
  };

  /* ---------------------------- один год ------------------------------- */

  Life.prototype.stepYear = function () {
    if (!this.alive) return null;
    var fromAge = this.age;
    this.age++;
    this.year++;
    this.boughtThisYear = {};

    this.driftStep();
    this.focusStep();
    this.mechStep('early');
    this.schoolStep();
    this.workStep();
    this.payStep();
    this.investStep();
    this.moneyStep();
    this.loanStep();
    this.streetStep();
    this.mechStep('late');
    this.moneyEvent();
    this.workEvent();
    this.payEvent();
    this.pickEvents();

    if (this.alive && this.rnd() < this.mortalityRisk(fromAge)) {
      this.age = fromAge;
      this.die();
    }

    var decision = null;
    if (this.alive) {
      decision = this.dueCard();                           /* продолжение начатой истории — вне очереди */
      if (!decision) decision = this.pickDecision();
      if (!decision) decision = this.pickDecision('work');  /* разговор о работе — свой слот */
      if (!decision) decision = this.pickDecision('money'); /* год без событий — повод поговорить о деньгах */
      if (decision) this.pendingDecision = decision;
      var refl = E.reflections.filter(function (r) { return r.age === this.age; }, this)[0];
      if (refl && !this.silent) this.pendingReflection = refl;
    }

    /* хвосты года: форма оплаты без работы и доход супруга без супруга
       не должны пережить событие, которое их отменило */
    if (!this.job) { this.payWage = null; this.payJob = null; }
    if (!this.partner) this.partnerIncome = 0;

    this.history.push({
      age: this.age, year: this.year,
      health: Math.round(this.stats.health), happy: Math.round(this.stats.happy),
      know: Math.round(this.stats.know), bond: Math.round(this.stats.bond),
      income: Math.round(this.income), money: Math.round(this.money),
      support: Math.round(this.support || 0), pay: Math.round(this.payIncome || 0),
      job: this.job ? M.jobTitle(M.jobById[this.job.id], this.job.step) : (this.retired ? 'на пенсии' : ''),
      married: this.marital === 'married', kids: this.children.length,
      events: this.log.filter(function (e2) { return e2.age === this.age; }, this).length
    });

    return decision;
  };

  /* Полная жизнь без участия игрока (нейтральные решения) */
  Life.prototype.runToEnd = function (maxYears) {
    var guard = 0;
    while (this.alive && guard++ < (maxYears || 130)) {
      var d = this.stepYear();
      if (d) this.autoAnswer();
      this.pendingReflection = null;
    }
    if (this.alive) this.die('старость');
    return this;
  };

  /* --------------------------- итоги жизни ----------------------------- */

  Life.prototype.summary = function () {
    var parts = [];
    var s = this.sex === 'f' ? 'девочкой' : 'мальчиком';
    parts.push('Родились ' + s + ' в ' + (this.urban ? 'городе' : 'сельской местности') + ', ' + this.c.name + '.');
    var eduWord = ['без школы', 'с начальной школой', 'с неполной средней школой', 'со средней школой',
      'со специальностью', 'с высшим образованием', 'с учёной степенью'][this.edu.level];
    parts.push('Выросли ' + eduWord + '.');
    if (this.job) parts.push('Работали: ' + M.jobTitle(M.jobById[this.job.id], this.job.step) + '.');
    else if (this.retired) parts.push('Вышли на пенсию.');
    var cr = this.career;
    if (cr && cr.years > 0) {
      var line = 'Трудовая жизнь: ' + cr.years + ' ' + M.plural(cr.years, 'год', 'года', 'лет') + ' работы';
      if (cr.held.length > 1) line += ', ' + cr.held.length + ' ' + M.plural(cr.held.length, 'место', 'места', 'мест');
      if (cr.promos) line += ', повышений — ' + cr.promos;
      if (cr.fired) line += ', увольнений — ' + cr.fired;
      if (cr.injuries) line += ', травм на работе — ' + cr.injuries;
      parts.push(line + '.');
    }
    if (this.marital === 'married') parts.push('Были в браке.');
    if (this.marital === 'divorced') parts.push('Пережили развод.');
    if (this.marital === 'widowed') parts.push('Потеряли супруга.');
    if (this.children.length) parts.push('Детей: ' + this.children.length + '.');
    if (this.grandchildren) parts.push('Внуков: ' + this.grandchildren + '.');
    if (this.biz) parts.push('Своё дело (' + this.biz.name.toLowerCase() + ') пережило вас: ' +
      this.biz.age + ' ' + M.plural(this.biz.age, 'год', 'года', 'лет') + ' работы.');
    else if (this.bizFailed) parts.push('Своё дело пробовали, но оно не пошло.');
    var street = (this.streetTotal || 0) + (this.homeless || 0);
    if (street > 0) {
      parts.push(this.homeless
        ? 'Последние годы прожили без дома: всего на улице — ' + street + ' ' +
          M.plural(street, 'год', 'года', 'лет') + '.'
        : 'Были без дома ' + street + ' ' + M.plural(street, 'год', 'года', 'лет') + ', но вернулись.');
    }
    if (this.has('bankrupt')) parts.push('Долги закрывали через банкротство.');
    else if (this.has('goodCredit')) parts.push('Кредит выплатили до конца.');
    if (this.legacy) parts.push('После вас осталось: ' + this.legacy + '.');
    if (this.dead) parts.push('Ушли в ' + this.dead.age + ' ' + M.plural(this.dead.age, 'год', 'года', 'лет') + ': ' + this.dead.cause + '.');
    return parts.join(' ');
  };

  Life.prototype.achievements = function () {
    var out = [];
    var d = this.dead ? this.dead.age : this.age;
    if (d >= 100) out.push({ icon: '💯', t: 'Прожили сто лет' });
    else if (d >= 90) out.push({ icon: '🎂', t: 'Дожили до девяноста' });
    if (this.edu.level >= 5) out.push({ icon: '🎓', t: 'Высшее образование' });
    var IVa = window.IN8B.invest;
    if (IVa) {
      var pf = IVa.portfolio(this);
      if (pf.total > this.need * 12) out.push({ icon: '💼', t: 'Нажили состояние' });
      if (this.boomedBiz) out.push({ icon: '🚀', t: 'Дело пошло в гору' });
      if (this.biz && this.biz.age >= 20) out.push({ icon: '🏪', t: 'Дело всей жизни' });
      if (this.bizFailed >= 2) out.push({ icon: '🧱', t: 'Прогорали дважды и начинали снова' });
      var pz = this.assets && this.assets.ponzi;
      if (pz && pz.put > 0 && pz.val <= 0) out.push({ icon: '🕳', t: 'Поверили в 40 % годовых' });
    }
    var streetY = (this.streetTotal || 0) + (this.homeless || 0);
    if (this.homeless) out.push({ icon: '📦', t: 'Жизнь закончилась на улице' });
    else if (this.has('wasHomeless')) out.push({ icon: '🔑', t: 'Вернулись с улицы' });
    if (streetY >= 10) out.push({ icon: '🧊', t: 'Десять лет без адреса' });
    if (this.has('bankrupt')) out.push({ icon: '⚖️', t: 'Прошли через банкротство' });
    else if (this.has('goodCredit')) out.push({ icon: '🏦', t: 'Выплатили кредит до копейки' });
    if (this.has('exCon')) out.push({ icon: '🔒', t: 'Была судимость' });
    if (this.edu.level === 0) out.push({ icon: '📭', t: 'Ни одного года в школе' });
    if (this.children.length >= 4) out.push({ icon: '👨‍👩‍👧‍👦', t: 'Большая семья' });
    if (this.grandchildren >= 3) out.push({ icon: '🧓', t: 'Много внуков' });
    if (this.abroad) out.push({ icon: '✈️', t: 'Жизнь в другой стране' });
    if (this.business) out.push({ icon: '🏪', t: 'Своё дело' });
    if (this.council) out.push({ icon: '🏛', t: 'Местный совет' });
    if (this.legacy) out.push({ icon: '🕯', t: 'Оставили след' });
    if (this.awards.length) out.push({ icon: '🏅', t: 'Признание в профессии' });
    if (this.talents.length) out.push({ icon: '✨', t: 'Талант: ' + this.talents.join(', ') });
    if (this.money > this.need * 10) out.push({ icon: '💎', t: 'Состояние' });
    if (this.job && this.job.step >= 4) out.push({ icon: '📈', t: 'Вершина карьеры' });
    if (this.stats.happy > 80) out.push({ icon: '🌞', t: 'Счастливая жизнь' });
    if (this.marital === 'married' && d > 70) out.push({ icon: '💞', t: 'Долгий брак' });
    return out;
  };

  /* Эпитафия — одна строка о прожитом */
  Life.prototype.epitaph = function () {
    var d = this.dead ? this.dead.age : this.age;
    if (d < 1) return 'Жизнь длиной в несколько месяцев. Её всё равно кто-то ждал.';
    if (d < 6) return 'Успели только начать.';
    if (d < 18) return 'Детство, которое не стало взрослой жизнью.';
    if (this.homeless) return 'Умерли там, где людей не ищут. Имя всё равно было.';
    if (this.has('wasHomeless')) return 'Падали на самое дно — и всё-таки поднялись.';
    if (this.legacy) return 'После вас осталось больше, чем вы унесли.';
    if (this.children.length >= 3) return 'Жизнь, которая продолжилась в других.';
    if (this.job && this.job.step >= 3) return 'Жизнь, отданная делу, которое получалось.';
    if (this.stats.bond > 70) return 'Рядом всегда кто-то был.';
    if (this.stats.happy > 70) return 'Простая жизнь, в которой хватало света.';
    if (d > 80) return 'Долгая жизнь, прожитая до конца.';
    return 'Одна из восьми миллиардов.';
  };

  /* ------------------------ параллельные жизни ------------------------- */

  /* Четверо, родившихся в ту же секунду: живут по той же статистике */
  function siblingsOfSecond(seed, settings, count) {
    var out = [];
    for (var i = 0; i < (count || 4); i++) {
      var l = new Life({ seed: seed + '#' + i, settings: settings, silent: true });
      l.runToEnd();
      out.push({
        name: l.name, country: l.c.name, countryCode: l.c.code, sex: l.sex,
        deathAge: l.dead ? l.dead.age : l.age, cause: l.dead ? l.dead.cause : '',
        history: l.history, summary: l.summary(), log: l.log
      });
    }
    return out;
  }

  window.IN8B = window.IN8B || {};
  window.IN8B.engine = {
    Life: Life,
    budgetMeta: BUDGET_META,
    defaultBudget: DEFAULT_BUDGET,
    focusList: FOCUS,
    siblingsOfSecond: siblingsOfSecond
  };
})();
