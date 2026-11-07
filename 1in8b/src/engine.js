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
  var clamp = M.clamp;

  /* общая калибровка риска: подобрана так, чтобы средний возраст смерти
     в авторежиме совпадал с ожидаемой продолжительностью жизни страны */
  var RISK_CAL = 0.55;

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
    this.table = M.lifeTable(this.sex === 'f' ? this.c.leF : this.c.leM, this.c.u5mr);

    /* --- жизнь --- */
    this.age = 0;
    this.year = year;
    this.alive = true;
    this.dead = null;
    this.money = 0;
    this.income = 0;
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
    this.focus = 'family';
    this.notes = [];
    this.pendingDecision = null;
    this.pendingReflection = null;

    /* возраст вступления в брак — по стране */
    this.marriageAge = Math.round(clamp(
      17 + this.c.gdp / 9000 + (this.urban ? 1.6 : 0) - (this.c.tfr - 2) * 0.9 + (this.sex === 'f' ? -1.4 : 0.8) + rnd.normal(0, 2.4),
      16, 38));

    this.need = this.c.gdp * 0.3;              // базовая стоимость года жизни
    this.add('Родились ' + (this.sex === 'f' ? 'девочкой' : 'мальчиком') + ' в ' +
      (this.urban ? 'городе' : 'сельской местности') + '. ' + this.familyWord() + '.', 'life');
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

  Life.prototype.addMoney = function (delta) { this.money += delta; };

  Life.prototype.flag = function (k, v) { this.flags[k] = v; };
  Life.prototype.has = function (k) { return !!this.flags[k]; };

  /* ------------------------------ работа ------------------------------ */

  Life.prototype.hire = function (style) {
    var pool = M.jobsFor(this.c, this.edu.level, this.rnd);
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
    this.job = { id: chosen.job.id, step: 0, years: 0, risk: chosen.job.risk, dream: style === 'dream' };
    this.unemployedYears = 0;
    this.add('Вы начали работать: ' + M.jobTitle(chosen.job, 0) + '.', 'work');
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
    this.partner = { name: pname.full, age: this.age + Math.round(rnd.normal(this.sex === 'f' ? 3 : -2, 3)) };
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
    this.job.years++;
    var mult = (this.business ? 1.25 : 1) * clamp(this.incomeBoost || 1, 0.4, 3);
    if (this.abroad) mult *= 2.1;
    if (this.council) mult *= 1.03;
    this.income = M.wageFor(this.c, job, this.job.step, this.stats.know, this.job.years) * mult;

    /* рост по службе */
    var pUp = 0.08 + this.stats.know / 900 + (this.focus === 'work' ? 0.07 : 0) - (this.careerBrake ? 0.03 : 0);
    if (this.job.step < 4 && rnd() < pUp) {
      this.job.step++;
      this.add('Вас повысили: ' + M.jobTitle(job, this.job.step) + '.', 'work');
      this.stat('happy', 4);
    }
    /* риск профессии бьёт по здоровью */
    if (job.risk > 1.2 && rnd() < 0.1) this.stat('health', -2);
  };

  Life.prototype.pension = function () {
    var base = this.c.gdp * 0.18;
    var worked = this.job ? this.job.years : 25;
    return base * clamp(0.5 + worked / 60, 0.4, 1.3) * (this.c.gdp > 12000 ? 1.2 : 0.6);
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

    /* доход года */
    var income;
    if (a < 15 && !this.job) income = this.famIncome * 0.9;
    else if (this.retired) income = this.pension();
    else income = this.income || this.famIncome * 0.3;

    if (this.marital === 'married' || this.marital === 'partner') income += this.income ? this.income * 0.75 : this.famIncome * 0.5;
    this.income = income;

    var spendable = Math.max(income, 0);
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
          self.money += spent.save;
          break;
      }
    });

    /* долги и проценты */
    if (this.has('mortgage')) this.money -= need * 0.12;
    if (this.upkeep) this.money -= need * this.upkeep;      /* содержание купленного */
    if (this.has('deposit') && this.money > 0) this.money *= 1.035;
    if (this.money < 0) {
      this.money *= 1.08;
      this.stat('happy', -2);
      if (this.money < -need * 2 && !this.has('debtTrap')) {
        this.flag('debtTrap', true);
        this.add('Долги стали больше, чем годовой доход семьи.', 'bad');
      }
    }
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

  /* Карточка решения на этот год (или null) */
  Life.prototype.pickDecision = function () {
    var self = this;
    var x = this.ctx();
    var pool = E.choices.filter(function (ch) {
      if (self.age < ch.age[0] || self.age > ch.age[1]) return false;
      if (ch.once && self.seenEvents['c:' + ch.id]) return false;
      if (ch.heavy && self.settings.soft) return false;
      if (ch.cond && !ch.cond(x)) return false;
      return true;
    });
    if (!pool.length) return null;
    var priority = pool.filter(function (p) { return p.priority; });
    var card;
    if (priority.length) {
      card = priority[0];
    } else {
      var cand = this.rnd.pick(pool);
      var p = cand.chance ? cand.chance(x) : 0.28;
      if (this.rnd() < p) card = cand;
    }
    if (!card) return null;
    this.seenEvents['c:' + card.id] = true;
    var options = (card.options || []).filter(function (o) { return !o.cond || o.cond(x); });
    if (!options.length) return null;
    return {
      id: card.id,
      title: typeof card.title === 'function' ? card.title(x) : card.title,
      text: typeof card.text === 'function' ? card.text(x) : card.text,
      heavy: !!card.heavy,
      options: options.map(function (o, i) {
        return { i: i, label: o.label, hint: o.hint, run: o.run, weight: o.w };
      })
    };
  };

  /* Нейтральный выбор (авторежим и фоновые жизни): по весам вариантов,
     чтобы средние результаты совпадали со статистикой страны */
  Life.prototype.autoAnswer = function () {
    var d = this.pendingDecision;
    if (!d) return;
    var x = this.ctx();
    var pick = this.rnd.weighted(d.options, function (o) {
      return o.weight ? Math.max(0.0001, o.weight(x)) : 1;
    });
    this.answer(pick ? d.options.indexOf(pick) : 0);
  };

  /* Пересобрать карточку решения по её идентификатору (после загрузки сохранения) */
  Life.prototype.decisionById = function (id) {
    var card = null;
    for (var i = 0; i < E.choices.length; i++) if (E.choices[i].id === id) card = E.choices[i];
    if (!card) return null;
    var x = this.ctx();
    var options = (card.options || []).filter(function (o) { return !o.cond || o.cond(x); });
    if (!options.length) return null;
    return {
      id: card.id,
      title: typeof card.title === 'function' ? card.title(x) : card.title,
      text: typeof card.text === 'function' ? card.text(x) : card.text,
      heavy: !!card.heavy,
      options: options.map(function (o, i2) {
        return { i: i2, label: o.label, hint: o.hint, run: o.run, weight: o.w };
      })
    };
  };

  Life.prototype.answer = function (index) {
    var d = this.pendingDecision;
    if (!d) return;
    var opt = d.options[clamp(index, 0, d.options.length - 1)];
    this.pendingDecision = null;
    if (opt && opt.run) opt.run(this.ctx());
    this.decisions = (this.decisions || 0) + 1;
    this.lastDecision = { age: this.age, title: d.title, choice: opt ? opt.label : '' };
  };

  /* -------------------------- смертность ------------------------------- */

  Life.prototype.mortalityRisk = function (fromAge) {
    var a = clamp(fromAge === undefined ? this.age : fromAge, 0, M.maxAge);
    var q = this.table.qx[a];
    if (a < 5) {
      /* в первые годы решает не образ жизни, а достаток семьи и медицина */
      return clamp(q * clamp(1 + (0.5 - this.famPct) * 0.6 - this.budget.health * 0.8, 0.55, 1.8), 0, 0.97);
    }
    /* отклонение от базовой кривой здоровья: хуже среднего — выше риск.
       Множители подобраны так, чтобы у «нейтральной» жизни их произведение
       было около единицы: тогда средний возраст смерти совпадает с таблицей. */
    var gap = this.baseHealth - this.stats.health;
    var r = Math.exp(gap / 62);
    r *= 1 + (0.45 - clamp(M.percentileOfIncome(this.c, Math.max(this.income || this.famIncome, 1)), 0, 1)) * 0.3;
    if (this.has('smoker') && a > 30) r *= 1.22;
    if (this.has('chronic')) r *= 1.22;
    if (this.has('untreated')) r *= 1.2;
    if (this.has('addiction')) r *= 1.4;
    if (this.warUntil && a <= this.warUntil) r *= 1.7;
    if (this.job) r *= Math.pow(M.jobById[this.job.id].risk / 1.12, 0.5);
    if (this.budget.health > 0.16) r *= 0.92;
    if (this.budget.food < 0.2) r *= 1.08;
    return clamp(q * RISK_CAL * clamp(r, 0.5, 4), 0, 0.97);
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
    this.schoolStep();
    this.workStep();
    this.moneyStep();
    this.pickEvents();

    if (this.alive && this.rnd() < this.mortalityRisk(fromAge)) {
      this.age = fromAge;
      this.die();
    }

    var decision = null;
    if (this.alive) {
      decision = this.pickDecision();
      if (decision) this.pendingDecision = decision;
      var refl = E.reflections.filter(function (r) { return r.age === this.age; }, this)[0];
      if (refl && !this.silent) this.pendingReflection = refl;
    }

    this.history.push({
      age: this.age, year: this.year,
      health: Math.round(this.stats.health), happy: Math.round(this.stats.happy),
      know: Math.round(this.stats.know), bond: Math.round(this.stats.bond),
      income: Math.round(this.income), money: Math.round(this.money),
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
    if (this.marital === 'married') parts.push('Были в браке.');
    if (this.marital === 'divorced') parts.push('Пережили развод.');
    if (this.marital === 'widowed') parts.push('Потеряли супруга.');
    if (this.children.length) parts.push('Детей: ' + this.children.length + '.');
    if (this.grandchildren) parts.push('Внуков: ' + this.grandchildren + '.');
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
