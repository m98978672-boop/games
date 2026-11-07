/* ============================================================
   1 ИЗ 8 МИЛЛИАРДОВ — математическая модель.
   ------------------------------------------------------------
   • генератор случайных чисел с зерном (жизнь воспроизводима);
   • таблицы смертности (реляционная логит-модель Брасса),
     подогнанные под ожидаемую продолжительность жизни и
     смертность до 5 лет конкретной страны;
   • распределение доходов внутри страны (логнормальное,
     параметр — индекс Джини);
   • пересчёт показателей страны на прошлое и будущее;
   • профессии, зарплаты, образование, причины смерти.
   ============================================================ */
(function () {
  'use strict';

  /* ----------------------------- случайность ----------------------------- */

  function hashSeed(str) {
    var h = 2166136261 >>> 0;
    str = String(str);
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h >>> 0;
  }

  /* mulberry32 — быстрый детерминированный ГПСЧ */
  function makeRng(seed) {
    var a = (typeof seed === 'string' ? hashSeed(seed) : seed >>> 0) || 1;
    var fn = function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    fn.state = function () { return a; };
    fn.setState = function (v) { a = v | 0; };
    fn.int = function (n) { return Math.floor(fn() * n); };
    fn.range = function (a2, b2) { return a2 + fn() * (b2 - a2); };
    fn.chance = function (p) { return fn() < p; };
    fn.pick = function (arr) { return arr[Math.floor(fn() * arr.length)]; };
    fn.shuffle = function (arr) {
      var a2 = arr.slice();
      for (var i = a2.length - 1; i > 0; i--) {
        var j = Math.floor(fn() * (i + 1));
        var t = a2[i]; a2[i] = a2[j]; a2[j] = t;
      }
      return a2;
    };
    /* выбор по весам: items = [{w: число, ...}] */
    fn.weighted = function (items, weightOf) {
      var total = 0, i;
      for (i = 0; i < items.length; i++) total += Math.max(0, weightOf ? weightOf(items[i]) : items[i].w);
      if (total <= 0) return null;
      var x = fn() * total;
      for (i = 0; i < items.length; i++) {
        x -= Math.max(0, weightOf ? weightOf(items[i]) : items[i].w);
        if (x <= 0) return items[i];
      }
      return items[items.length - 1];
    };
    /* нормальное распределение (Бокс–Мюллер) */
    fn.normal = function (mean, sd) {
      var u = 1 - fn(), v = fn();
      return (mean || 0) + (sd === undefined ? 1 : sd) * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    };
    return fn;
  }

  function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }

  /* обратная функция нормального распределения (аппроксимация Акклама) */
  function probit(p) {
    if (p <= 0) return -8;
    if (p >= 1) return 8;
    var a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02,
      1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
    var b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02,
      6.680131188771972e+01, -1.328068155288572e+01];
    var c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00,
      -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
    var d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00];
    var plow = 0.02425, q, r;
    if (p < plow) {
      q = Math.sqrt(-2 * Math.log(p));
      return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
        ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
    }
    if (p > 1 - plow) {
      q = Math.sqrt(-2 * Math.log(1 - p));
      return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
        ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
    }
    q = p - 0.5; r = q * q;
    return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  }

  /* ---------------------------- таблицы смертности ------------------------ */

  /* Общий стандарт Брасса: доля доживших до возраста x */
  var STD_AGES = [0, 1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 110];
  var STD_LX = [1, 0.8499, 0.7900, 0.7692, 0.7527, 0.7313, 0.7060, 0.6790, 0.6509, 0.6200,
    0.5842, 0.5409, 0.4872, 0.4203, 0.3377, 0.2425, 0.1422, 0.0600, 0.0160, 0.0020, 0.0002, 0.00002, 0.000001];
  var MAX_AGE = 110;

  /* стандарт по одному году возраста (лог-линейная интерполяция) */
  var STD_YEAR = (function () {
    var out = new Array(MAX_AGE + 1);
    for (var x = 0; x <= MAX_AGE; x++) {
      var i = 0;
      while (i < STD_AGES.length - 2 && STD_AGES[i + 1] <= x) i++;
      var x0 = STD_AGES[i], x1 = STD_AGES[i + 1];
      var t = (x - x0) / (x1 - x0);
      out[x] = Math.exp(Math.log(STD_LX[i]) * (1 - t) + Math.log(STD_LX[i + 1]) * t);
    }
    out[0] = 1;
    return out;
  })();

  var STD_Y = STD_YEAR.map(function (l) {
    var v = clamp(l, 1e-7, 1 - 1e-7);
    return 0.5 * Math.log((1 - v) / v);
  });

  function lxFrom(alpha, beta) {
    var lx = new Array(MAX_AGE + 1);
    lx[0] = 1;
    for (var x = 1; x <= MAX_AGE; x++) {
      var y = alpha + beta * STD_Y[x];
      lx[x] = 1 / (1 + Math.exp(2 * y));
      if (lx[x] > lx[x - 1]) lx[x] = lx[x - 1] * 0.999;
    }
    return lx;
  }

  function expectancy(lx) {
    /* e0 = Σ средних чисел доживших; для первого года поправка a0 = 0.3 */
    var e = 0.3 * lx[0] + 0.7 * lx[1];
    for (var x = 1; x < MAX_AGE; x++) e += (lx[x] + lx[x + 1]) / 2;
    return e;
  }

  /* alpha, подогнанный под заданную l(5) при данном beta */
  function alphaForL5(l5, beta) {
    var target = 0.5 * Math.log((1 - l5) / l5);
    return target - beta * STD_Y[5];
  }

  /* Таблица смертности страны: подгонка под e0 и смертность до 5 лет */
  function buildLifeTable(e0, u5mr) {
    var l5 = clamp(1 - u5mr / 1000, 0.3, 0.9995);
    var lo = 0.25, hi = 3.2, beta = 1, lx = null, i;
    for (i = 0; i < 48; i++) {
      beta = (lo + hi) / 2;
      lx = lxFrom(alphaForL5(l5, beta), beta);
      if (expectancy(lx) > e0) lo = beta; else hi = beta;
    }
    beta = (lo + hi) / 2;
    var alpha = alphaForL5(l5, beta);
    lx = lxFrom(alpha, beta);
    var qx = new Array(MAX_AGE + 1);
    for (i = 0; i <= MAX_AGE; i++) {
      qx[i] = i >= MAX_AGE ? 1 : clamp(1 - lx[i + 1] / Math.max(lx[i], 1e-9), 0, 1);
    }
    return { alpha: alpha, beta: beta, lx: lx, qx: qx, e0: expectancy(lx) };
  }

  var tableCache = {};
  function lifeTable(e0, u5mr) {
    var key = e0.toFixed(2) + '/' + u5mr.toFixed(2);
    if (!tableCache[key]) tableCache[key] = buildLifeTable(e0, u5mr);
    return tableCache[key];
  }

  /* ---------------------------- эпохи (мир) ------------------------------ */

  var BASE_YEAR = 2024;

  /* Показатели страны, пересчитанные на год рождения */
  function countryAtYear(country, year) {
    var d = year - BASE_YEAR;              // <0 — прошлое, >0 — будущее
    var rich = clamp((country.gdp - 2000) / 50000, 0, 1);
    var c = Object.create(country);
    var leStep = 0.22 + 0.16 * (1 - rich);  // в бедных странах ОПЖ росла быстрее
    if (d < 0) {
      c.leM = Math.max(28, country.leM + d * leStep);
      c.leF = Math.max(30, country.leF + d * leStep);
      c.u5mr = Math.min(420, country.u5mr * Math.exp(-0.042 * d));
      c.gdp = Math.max(400, country.gdp * Math.exp(0.021 * d));
      c.school = Math.max(0.4, country.school + d * 0.072);
      c.urban = clamp(country.urban + d * 0.42, 4, 100);
      c.tfr = clamp(country.tfr * (1 - d * 0.013), country.tfr, 8.2);
      c.tertiary = clamp(country.tertiary * Math.exp(0.028 * d), 0.3, 150);
      c.homicide = country.homicide * (1 - d * 0.004);
      c.happy = clamp(country.happy + d * 0.004, 2, 8.2);
    } else if (d > 0) {
      var slow = 1 - clamp(d / 160, 0, 0.75);
      c.leM = Math.min(96, country.leM + d * 0.12 * slow * (1 + (1 - rich)));
      c.leF = Math.min(99, country.leF + d * 0.11 * slow * (1 + (1 - rich)));
      c.u5mr = Math.max(1.4, country.u5mr * Math.exp(-0.028 * d));
      c.gdp = Math.min(500000, country.gdp * Math.exp(0.017 * d));
      c.school = Math.min(16.5, country.school + d * 0.05);
      c.urban = clamp(country.urban + d * 0.3, 5, 99);
      c.tfr = country.tfr + (1.75 - country.tfr) * clamp(d / 60, 0, 0.85);
      c.tertiary = clamp(country.tertiary * Math.exp(0.012 * d), 0.5, 160);
      c.homicide = country.homicide * Math.exp(-0.006 * d);
      c.happy = clamp(country.happy + d * 0.004, 2, 8.6);
    }
    c.imr = Math.min(c.u5mr * 0.74, c.u5mr - 0.3);
    c.le = (c.leM + c.leF) / 2;
    c.year = year;
    return c;
  }

  /* ----------------------------- доходы ---------------------------------- */

  /* σ логнормального распределения доходов по индексу Джини */
  function sigmaFromGini(gini) {
    return clamp(Math.SQRT2 * probit((clamp(gini, 18, 70) / 100 + 1) / 2), 0.35, 1.9);
  }

  /* Годовой доход домохозяйства на человека (межд. $ ППС) по перцентилю */
  function incomeAtPercentile(country, p) {
    var sigma = sigmaFromGini(country.gini);
    var mean = country.gdp * 0.54;                       // доля домохозяйств в ВВП
    var mu = Math.log(Math.max(mean, 200)) - sigma * sigma / 2;
    return Math.exp(mu + sigma * probit(clamp(p, 0.004, 0.996)));
  }

  /* Обратная задача: по доходу — его перцентиль в стране */
  function percentileOfIncome(country, income) {
    var sigma = sigmaFromGini(country.gini);
    var mean = country.gdp * 0.54;
    var mu = Math.log(Math.max(mean, 200)) - sigma * sigma / 2;
    var z = (Math.log(Math.max(income, 1)) - mu) / sigma;
    /* нормальная функция распределения через приближение Зелена–Северо */
    var t = 1 / (1 + 0.2316419 * Math.abs(z));
    var d = 0.3989423 * Math.exp(-z * z / 2);
    var prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return clamp(z > 0 ? 1 - prob : prob, 0.001, 0.999);
  }

  /* Доля людей мира, которые живут беднее: по всем странам с весом населения */
  var WORLD_POP = 0;
  function worldPercentile(income) {
    var list = (window.IN8B.countries || {}).list || [];
    if (!list.length) return percentileOfIncome({ gini: 38, gdp: 22000 }, income);
    if (!WORLD_POP) WORLD_POP = list.reduce(function (s, c) { return s + c.pop; }, 0);
    var below = 0;
    for (var i = 0; i < list.length; i++) below += list[i].pop * percentileOfIncome(list[i], income);
    return clamp(below / WORLD_POP, 0.001, 0.999);
  }

  /* ---------------------------- профессии -------------------------------- */

  /* edu: 0 нет школы · 1 начальная · 2 неполная средняя · 3 средняя
         4 колледж/ПТУ · 5 бакалавр · 6 магистр/аспирантура            */
  var JOBS = [
    { id: 'farm', title: 'работник в поле', sector: 'agri', edu: 0, wage: 0.45, risk: 1.15, status: 1 },
    { id: 'fisher', title: 'рыбак', sector: 'agri', edu: 0, wage: 0.5, risk: 1.3, status: 1 },
    { id: 'herder', title: 'пастух', sector: 'agri', edu: 0, wage: 0.45, risk: 1.1, status: 1 },
    { id: 'market', title: 'продавец на рынке', sector: 'informal', edu: 0, wage: 0.6, risk: 1.0, status: 1 },
    { id: 'domestic', title: 'работник по дому', sector: 'informal', edu: 0, wage: 0.55, risk: 1.0, status: 1 },
    { id: 'loader', title: 'грузчик', sector: 'manual', edu: 1, wage: 0.7, risk: 1.2, status: 1 },
    { id: 'builder', title: 'строитель', sector: 'manual', edu: 1, wage: 0.85, risk: 1.35, status: 2 },
    { id: 'miner', title: 'шахтёр', sector: 'manual', edu: 1, wage: 1.15, risk: 1.8, status: 2 },
    { id: 'factory', title: 'рабочий на производстве', sector: 'manual', edu: 2, wage: 0.9, risk: 1.15, status: 2 },
    { id: 'driver', title: 'водитель', sector: 'service', edu: 2, wage: 0.95, risk: 1.4, status: 2 },
    { id: 'cook', title: 'повар', sector: 'service', edu: 2, wage: 0.85, risk: 1.05, status: 2 },
    { id: 'shop', title: 'продавец в магазине', sector: 'service', edu: 2, wage: 0.8, risk: 1.0, status: 2 },
    { id: 'care', title: 'работник по уходу', sector: 'service', edu: 3, wage: 0.9, risk: 1.05, status: 2 },
    { id: 'soldier', title: 'военнослужащий', sector: 'service', edu: 3, wage: 1.05, risk: 1.9, status: 3 },
    { id: 'police', title: 'полицейский', sector: 'service', edu: 3, wage: 1.1, risk: 1.5, status: 3 },
    { id: 'clerk', title: 'офисный служащий', sector: 'skilled', edu: 3, wage: 1.05, risk: 0.95, status: 3 },
    { id: 'tailor', title: 'швея-мастер', sector: 'skilled', edu: 3, wage: 0.9, risk: 1.0, status: 2 },
    { id: 'mechanic', title: 'автомеханик', sector: 'skilled', edu: 4, wage: 1.1, risk: 1.2, status: 3 },
    { id: 'electrician', title: 'электрик', sector: 'skilled', edu: 4, wage: 1.2, risk: 1.25, status: 3 },
    { id: 'nurse', title: 'медсестра / медбрат', sector: 'skilled', edu: 4, wage: 1.25, risk: 1.05, status: 4 },
    { id: 'railway', title: 'железнодорожник', sector: 'skilled', edu: 4, wage: 1.15, risk: 1.25, status: 3 },
    { id: 'stylist', title: 'парикмахер-стилист', sector: 'service', edu: 3, wage: 0.95, risk: 0.95, status: 2 },
    { id: 'teacher', title: 'учитель', sector: 'prof', edu: 5, wage: 1.3, risk: 0.9, status: 4 },
    { id: 'accountant', title: 'бухгалтер', sector: 'prof', edu: 5, wage: 1.5, risk: 0.85, status: 4 },
    { id: 'engineer', title: 'инженер', sector: 'prof', edu: 5, wage: 1.9, risk: 0.95, status: 5 },
    { id: 'it', title: 'программист', sector: 'prof', edu: 5, wage: 2.3, risk: 0.85, status: 5 },
    { id: 'designer', title: 'дизайнер', sector: 'prof', edu: 5, wage: 1.5, risk: 0.9, status: 4 },
    { id: 'lawyer', title: 'юрист', sector: 'prof', edu: 6, wage: 2.4, risk: 0.85, status: 5 },
    { id: 'doctor', title: 'врач', sector: 'prof', edu: 6, wage: 2.8, risk: 0.9, status: 6 },
    { id: 'scientist', title: 'научный сотрудник', sector: 'prof', edu: 6, wage: 1.7, risk: 0.85, status: 5 },
    { id: 'manager', title: 'руководитель отдела', sector: 'elite', edu: 5, wage: 2.6, risk: 0.9, status: 6 },
    { id: 'owner', title: 'владелец своего дела', sector: 'elite', edu: 3, wage: 2.2, risk: 1.0, status: 5 },
    { id: 'artist', title: 'художник / музыкант', sector: 'prof', edu: 3, wage: 0.9, risk: 1.0, status: 3 },
    { id: 'athlete', title: 'спортсмен', sector: 'prof', edu: 3, wage: 1.4, risk: 1.3, status: 4 }
  ];

  var JOB_BY_ID = {};
  JOBS.forEach(function (j) { JOB_BY_ID[j.id] = j; });

  /* Ступени карьеры: к названию добавляется приставка */
  var CAREER_STEPS = [
    { t: 0, pre: 'младший ', mult: 0.8 },
    { t: 1, pre: '', mult: 1 },
    { t: 2, pre: 'старший ', mult: 1.35 },
    { t: 3, pre: 'ведущий ', mult: 1.8 },
    { t: 4, pre: 'главный ', mult: 2.4 }
  ];

  /* Доступные профессии при данном образовании и стране */
  function jobsFor(country, edu, rnd) {
    var agriShare = clamp(0.9 - country.gdp / 30000, 0.02, 0.62);
    return JOBS.filter(function (j) { return j.edu <= edu; }).map(function (j) {
      var w = 1;
      if (j.sector === 'agri') w *= agriShare * 6;
      if (j.sector === 'informal') w *= clamp(1.4 - country.gdp / 25000, 0.15, 1.6) * 2.2;
      if (j.sector === 'manual') w *= 2.2;
      if (j.sector === 'service') w *= 1.1 + country.gdp / 40000;
      if (j.sector === 'skilled') w *= 0.7 + country.gdp / 35000;
      if (j.sector === 'prof') w *= (0.25 + country.gdp / 30000) * (j.edu >= 5 ? 1 : 0.6);
      if (j.sector === 'elite') w *= 0.2 + country.gdp / 60000;
      if (j.edu > edu - 2 && j.edu >= 4) w *= 1.4;         // свежий диплом ценится
      return { job: j, w: Math.max(0.02, w) };
    });
  }

  /* Годовая зарплата профессии (межд. $ ППС) */
  function wageFor(country, job, step, knowledge, years) {
    var base = country.gdp * 0.62;
    var exp = 1 + clamp(years, 0, 35) * 0.011;
    var know = 0.75 + clamp(knowledge, 0, 100) / 100 * 0.5;
    return base * job.wage * CAREER_STEPS[clamp(step, 0, 4)].mult * exp * know;
  }

  function jobTitle(job, step) {
    var s = CAREER_STEPS[clamp(step, 0, 4)];
    if (job.sector === 'elite' && step >= 3) return 'владелец компании';
    return s.pre + job.title;
  }

  /* --------------------------- причины смерти ----------------------------- */

  var CAUSES = {
    infant: [
      { t: 'осложнения при рождении', w: 3 },
      { t: 'недоношенность', w: 3 },
      { t: 'инфекция дыхательных путей', w: 2.4 },
      { t: 'кишечная инфекция', w: 2, poor: true },
      { t: 'врождённый порок', w: 1.6, rich: true },
      { t: 'малярия', w: 1.4, malaria: true }
    ],
    child: [
      { t: 'кишечная инфекция', w: 2.4, poor: true },
      { t: 'воспаление лёгких', w: 2.4 },
      { t: 'малярия', w: 2, malaria: true },
      { t: 'корь', w: 1, poor: true },
      { t: 'несчастный случай', w: 1.6 },
      { t: 'утопление', w: 1 },
      { t: 'онкологическое заболевание', w: 0.7, rich: true }
    ],
    youth: [
      { t: 'дорожная авария', w: 3 },
      { t: 'несчастный случай', w: 1.6 },
      { t: 'утопление', w: 0.8 },
      { t: 'насилие', w: 1.4, violent: true, heavy: true },
      { t: 'последствия конфликта', w: 0.8, war: true, heavy: true },
      { t: 'самоубийство', w: 1.2, heavy: true },
      { t: 'инфекционное заболевание', w: 1.2, poor: true },
      { t: 'онкологическое заболевание', w: 0.6 }
    ],
    adult: [
      { t: 'болезнь сердца', w: 3 },
      { t: 'инсульт', w: 1.8 },
      { t: 'онкологическое заболевание', w: 2.6 },
      { t: 'болезнь печени', w: 1, heavy: true },
      { t: 'дорожная авария', w: 1.4 },
      { t: 'туберкулёз', w: 1, poor: true },
      { t: 'ВИЧ-ассоциированное заболевание', w: 0.9, hiv: true },
      { t: 'диабет', w: 1.1 },
      { t: 'насилие', w: 1, violent: true, heavy: true },
      { t: 'последствия конфликта', w: 0.7, war: true, heavy: true },
      { t: 'самоубийство', w: 0.9, heavy: true },
      { t: 'осложнения при родах', w: 0.8, maternal: true }
    ],
    old: [
      { t: 'болезнь сердца', w: 4 },
      { t: 'инсульт', w: 2.6 },
      { t: 'онкологическое заболевание', w: 2.6 },
      { t: 'воспаление лёгких', w: 1.6 },
      { t: 'деменция', w: 1.6, rich: true },
      { t: 'болезнь почек', w: 1 },
      { t: 'хроническая болезнь лёгких', w: 1.4 },
      { t: 'старость', w: 2.2, veryOld: true }
    ]
  };

  var HIV_HIGH = ['za', 'ls', 'sz', 'bw', 'zw', 'mz', 'zm', 'mw', 'na', 'ke', 'ug', 'tz'];
  var MALARIA = ['ng', 'cd', 'ug', 'ml', 'ne', 'bf', 'tz', 'mz', 'ci', 'gn', 'bj', 'cm', 'td', 'ao', 'mw', 'zm', 'sl', 'lr', 'gh', 'tg', 'cf', 'ss', 'bi', 'rw', 'mg', 'pg'];

  function pickCause(rnd, person, country, age, opts) {
    var band = age < 1 ? 'infant' : age < 15 ? 'child' : age < 35 ? 'youth' : age < 65 ? 'adult' : 'old';
    var poor = country.gdp < 8000;
    var rich = country.gdp > 25000;
    var list = CAUSES[band].filter(function (c) {
      if (c.poor && !poor) return false;
      if (c.rich && !rich) return false;
      if (c.malaria && MALARIA.indexOf(country.code) < 0) return false;
      if (c.hiv && HIV_HIGH.indexOf(country.code) < 0) return false;
      if (c.war && !(opts && opts.war)) return false;
      if (c.violent && country.homicide < 6) return false;
      if (c.maternal && (person.sex !== 'f' || age > 45 || !(opts && opts.pregnant))) return false;
      if (c.veryOld && age < 85) return false;
      if (c.heavy && opts && opts.softMode) return false;
      return true;
    });
    if (!list.length) list = [{ t: 'болезнь', w: 1 }];
    var chosen = rnd.weighted(list);
    return chosen ? chosen.t : 'болезнь';
  }

  /* ------------------------------ форматы -------------------------------- */

  function fmtMoney(v) {
    var x = Math.round(v);
    if (Math.abs(x) >= 1e6) return (x / 1e6).toFixed(x >= 1e7 ? 0 : 1).replace('.', ',') + ' млн';
    return String(x).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  function fmtNum(v, digits) {
    return (Math.round(v * Math.pow(10, digits || 0)) / Math.pow(10, digits || 0))
      .toString().replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '\u2009');
  }

  function plural(n, one, few, many) {
    var m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
    return many;
  }

  window.IN8B = window.IN8B || {};
  window.IN8B.model = {
    makeRng: makeRng,
    hashSeed: hashSeed,
    clamp: clamp,
    probit: probit,
    lifeTable: lifeTable,
    buildLifeTable: buildLifeTable,
    expectancy: expectancy,
    countryAtYear: countryAtYear,
    baseYear: BASE_YEAR,
    maxAge: MAX_AGE,
    sigmaFromGini: sigmaFromGini,
    incomeAtPercentile: incomeAtPercentile,
    percentileOfIncome: percentileOfIncome,
    worldPercentile: worldPercentile,
    jobs: JOBS,
    jobById: JOB_BY_ID,
    jobsFor: jobsFor,
    wageFor: wageFor,
    jobTitle: jobTitle,
    careerSteps: CAREER_STEPS,
    pickCause: pickCause,
    hivHigh: HIV_HIGH,
    malaria: MALARIA,
    fmtMoney: fmtMoney,
    fmtNum: fmtNum,
    plural: plural
  };
})();
