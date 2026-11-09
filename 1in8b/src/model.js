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

  /* Таблица смертности страны: подгонка под e0 и смертность до 5 лет.
     Третий довод — младенческая смертность на 1000. Сглаженная кривая
     растягивает детские смерти по первым пяти годам, а в жизни почти
     все они приходятся на первый год. Поэтому первый год задаём прямо
     по данным, а остальное перераспределяем внутри пятилетки: сколько
     детей доживает до пяти, не меняется. */
  function buildLifeTable(e0, u5mr, imr) {
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

    /* доля доживших до пяти лет — её трогать нельзя */
    var keep = 1;
    for (i = 0; i < 5; i++) keep *= 1 - qx[i];
    var q0 = clamp((imr === undefined || imr === null ? u5mr * 0.75 : imr) / 1000, 0, 0.9);
    q0 = Math.min(q0, 1 - keep);
    var rest = keep / Math.max(1 - q0, 1e-6);   /* доживают с года до пяти */
    var lo2 = 0, hi2 = 4, k = 1, a, p;
    for (i = 0; i < 40; i++) {                  /* подбираем общий множитель 1…4 лет */
      k = (lo2 + hi2) / 2;
      p = 1;
      for (a = 1; a < 5; a++) p *= 1 - clamp(qx[a] * k, 0, 0.99);
      if (p > rest) lo2 = k; else hi2 = k;
    }
    qx[0] = q0;
    for (i = 1; i < 5; i++) qx[i] = clamp(qx[i] * k, 0, 0.99);

    /* кривую дожития пересобираем по новым qx, чтобы она осталась цельной */
    var lx2 = new Array(MAX_AGE + 1);
    lx2[0] = 1;
    for (i = 1; i <= MAX_AGE; i++) lx2[i] = lx2[i - 1] * (1 - qx[i - 1]);
    return { alpha: alpha, beta: beta, lx: lx2, qx: qx, e0: expectancy(lx2) };
  }

  var tableCache = {};
  function lifeTable(e0, u5mr, imr) {
    var key = e0.toFixed(2) + '/' + u5mr.toFixed(2) + '/' + (imr === undefined ? '-' : imr.toFixed(2));
    if (!tableCache[key]) tableCache[key] = buildLifeTable(e0, u5mr, imr);
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
  /* Средний доход семьи в стране. В богатой стране на семью приходится больше
     долей ВВП (двое работающих, пособия, пенсии), в бедной часть продукта
     вообще не доходит до домохозяйств. Подогнано под заработки из wageFor. */
  function householdMean(country) {
    return country.gdp * clamp(0.68 + country.gdp / 200000, 0.68, 1.05);
  }
  function incomeAtPercentile(country, p) {
    var sigma = sigmaFromGini(country.gini);
    var mean = householdMean(country);
    var mu = Math.log(Math.max(mean, 200)) - sigma * sigma / 2;
    return Math.exp(mu + sigma * probit(clamp(p, 0.004, 0.996)));
  }

  /* Обратная задача: по доходу — его перцентиль в стране */
  function percentileOfIncome(country, income) {
    var sigma = sigmaFromGini(country.gini);
    var mean = householdMean(country);
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
  /* 260 профессий. wage — во сколько раз платят относительно СВОЕГО сектора
     (в среднем по сектору ≈ 1), а сам уровень сектора зависит от страны.
     from/to — годы, когда профессия существует; urban/rural — где она бывает;
     minGdp/maxGdp — в каких странах. */
  var JOBS = [
    /* --- земля и вода (8) --- */
    { id: 'farm', title: 'работник в поле', sector: 'agri', edu: 0, wage: 0.85, risk: 1.15, status: 1 },
    { id: 'fisher', title: 'рыбак', sector: 'agri', edu: 0, wage: 0.95, risk: 1.5, status: 1 },
    { id: 'herder', title: 'пастух', sector: 'agri', edu: 0, wage: 0.8, risk: 1.1, status: 1, rural: 1 },
    { id: 'planter', title: 'сборщик на плантации', sector: 'agri', edu: 0, wage: 0.78, risk: 1.2, status: 1, maxGdp: 20000 },
    { id: 'forester', title: 'лесоруб', sector: 'agri', edu: 1, wage: 1.15, risk: 1.7, status: 2, rural: 1 },
    { id: 'agromech', title: 'механизатор', sector: 'agri', edu: 2, wage: 1.3, risk: 1.3, status: 2, rural: 1 },
    { id: 'beekeeper', title: 'пчеловод', sector: 'agri', edu: 1, wage: 0.95, risk: 1.05, status: 2, rural: 1 },
    { id: 'greenhouse', title: 'работник теплиц', sector: 'agri', edu: 1, wage: 1.02, risk: 1.05, status: 1 },

    /* --- без оформления (10) --- */
    { id: 'market', title: 'продавец на рынке', sector: 'informal', edu: 0, wage: 0.95, risk: 1.0, status: 1 },
    { id: 'domestic', title: 'работник по дому', sector: 'informal', edu: 0, wage: 0.8, risk: 1.0, status: 1 },
    { id: 'streetfood', title: 'уличная еда', sector: 'informal', edu: 0, wage: 1.0, risk: 1.05, status: 1, urban: 1 },
    { id: 'porter', title: 'носильщик', sector: 'informal', edu: 0, wage: 0.88, risk: 1.35, status: 1, urban: 1 },
    { id: 'scrap', title: 'сборщик вторсырья', sector: 'informal', edu: 0, wage: 0.72, risk: 1.4, status: 1, urban: 1 },
    { id: 'rickshaw', title: 'извозчик', sector: 'informal', edu: 0, wage: 1.0, risk: 1.5, status: 1, maxGdp: 18000 },
    { id: 'laundry', title: 'прачка', sector: 'informal', edu: 0, wage: 0.82, risk: 1.05, status: 1 },
    { id: 'nanny', title: 'няня', sector: 'informal', edu: 1, wage: 0.95, risk: 0.95, status: 2 },
    { id: 'handyman', title: 'мастер на все руки', sector: 'informal', edu: 1, wage: 1.2, risk: 1.3, status: 2 },
    { id: 'trader', title: 'перекупщик', sector: 'informal', edu: 2, wage: 1.35, risk: 1.1, status: 2 },

    /* --- руки и производство (16) --- */
    { id: 'loader', title: 'грузчик', sector: 'manual', edu: 1, wage: 0.8, risk: 1.25, status: 1 },
    { id: 'builder', title: 'строитель', sector: 'manual', edu: 1, wage: 0.95, risk: 1.45, status: 2 },
    { id: 'miner', title: 'шахтёр', sector: 'manual', edu: 1, wage: 1.35, risk: 1.9, status: 2, rural: 1 },
    { id: 'factory', title: 'рабочий на производстве', sector: 'manual', edu: 2, wage: 1.0, risk: 1.2, status: 2 },
    { id: 'welder', title: 'сварщик', sector: 'manual', edu: 2, wage: 1.2, risk: 1.5, status: 2 },
    { id: 'carpenter', title: 'плотник', sector: 'manual', edu: 2, wage: 1.05, risk: 1.3, status: 2 },
    { id: 'painter', title: 'маляр', sector: 'manual', edu: 1, wage: 0.9, risk: 1.3, status: 1 },
    { id: 'roofer', title: 'кровельщик', sector: 'manual', edu: 1, wage: 1.05, risk: 1.75, status: 2 },
    { id: 'plumber', title: 'сантехник', sector: 'manual', edu: 2, wage: 1.1, risk: 1.2, status: 2, urban: 1 },
    { id: 'docker', title: 'портовый рабочий', sector: 'manual', edu: 1, wage: 1.15, risk: 1.5, status: 2, urban: 1 },
    { id: 'textile', title: 'швейное производство', sector: 'manual', edu: 1, wage: 0.78, risk: 1.15, status: 1 },
    { id: 'butcher', title: 'мясник', sector: 'manual', edu: 1, wage: 0.95, risk: 1.3, status: 2 },
    { id: 'baker', title: 'пекарь', sector: 'manual', edu: 2, wage: 0.92, risk: 1.1, status: 2 },
    { id: 'driller', title: 'буровик', sector: 'manual', edu: 2, wage: 1.6, risk: 1.75, status: 3 },
    { id: 'concrete', title: 'бетонщик', sector: 'manual', edu: 1, wage: 0.95, risk: 1.5, status: 1 },
    { id: 'machinist', title: 'станочник', sector: 'manual', edu: 3, wage: 1.15, risk: 1.25, status: 2 },

    /* --- люди и услуги (18) --- */
    { id: 'driver', title: 'водитель', sector: 'service', edu: 2, wage: 1.05, risk: 1.5, status: 2 },
    { id: 'cook', title: 'повар', sector: 'service', edu: 2, wage: 0.95, risk: 1.1, status: 2 },
    { id: 'shop', title: 'продавец в магазине', sector: 'service', edu: 2, wage: 0.88, risk: 1.0, status: 2 },
    { id: 'care', title: 'работник по уходу', sector: 'service', edu: 3, wage: 0.95, risk: 1.1, status: 2 },
    { id: 'soldier', title: 'военнослужащий', sector: 'service', edu: 3, wage: 1.15, risk: 1.9, status: 3 },
    { id: 'police', title: 'полицейский', sector: 'service', edu: 3, wage: 1.2, risk: 1.55, status: 3 },
    { id: 'waiter', title: 'официант', sector: 'service', edu: 2, wage: 0.85, risk: 1.0, status: 1, urban: 1 },
    { id: 'barista', title: 'бариста', sector: 'service', edu: 2, wage: 0.85, risk: 0.95, status: 1, urban: 1, from: 1990 },
    { id: 'stylist', title: 'парикмахер-стилист', sector: 'service', edu: 3, wage: 1.0, risk: 0.95, status: 2 },
    { id: 'guard', title: 'охранник', sector: 'service', edu: 2, wage: 0.85, risk: 1.3, status: 1 },
    { id: 'courier', title: 'курьер', sector: 'service', edu: 1, wage: 0.85, risk: 1.4, status: 1, urban: 1 },
    { id: 'cleaner', title: 'уборщик', sector: 'service', edu: 0, wage: 0.75, risk: 1.1, status: 1 },
    { id: 'postman', title: 'почтальон', sector: 'service', edu: 2, wage: 0.85, risk: 1.1, status: 2 },
    { id: 'busdriver', title: 'водитель автобуса', sector: 'service', edu: 3, wage: 1.1, risk: 1.4, status: 2, urban: 1 },
    { id: 'firefighter', title: 'пожарный', sector: 'service', edu: 3, wage: 1.15, risk: 1.7, status: 3 },
    { id: 'hotel', title: 'работник гостиницы', sector: 'service', edu: 2, wage: 0.9, risk: 1.0, status: 2, urban: 1 },
    { id: 'callcenter', title: 'оператор поддержки', sector: 'service', edu: 3, wage: 0.95, risk: 0.9, status: 2, urban: 1, from: 1995 },
    { id: 'agent', title: 'торговый представитель', sector: 'service', edu: 3, wage: 1.15, risk: 1.15, status: 3 },

    /* --- ремесло и техника (18) --- */
    { id: 'clerk', title: 'офисный служащий', sector: 'skilled', edu: 3, wage: 0.95, risk: 0.95, status: 3 },
    { id: 'tailor', title: 'швея-мастер', sector: 'skilled', edu: 3, wage: 0.82, risk: 1.0, status: 2 },
    { id: 'mechanic', title: 'автомеханик', sector: 'skilled', edu: 4, wage: 1.0, risk: 1.25, status: 3 },
    { id: 'electrician', title: 'электрик', sector: 'skilled', edu: 4, wage: 1.1, risk: 1.35, status: 3 },
    { id: 'nurse', title: 'медсестра / медбрат', sector: 'skilled', edu: 4, wage: 1.1, risk: 1.1, status: 4 },
    { id: 'railway', title: 'железнодорожник', sector: 'skilled', edu: 4, wage: 1.05, risk: 1.3, status: 3 },
    { id: 'technician', title: 'техник-наладчик', sector: 'skilled', edu: 4, wage: 1.1, risk: 1.15, status: 3 },
    { id: 'crane', title: 'крановщик', sector: 'skilled', edu: 3, wage: 1.15, risk: 1.5, status: 3 },
    { id: 'lab', title: 'лаборант', sector: 'skilled', edu: 4, wage: 0.9, risk: 1.05, status: 3 },
    { id: 'dental', title: 'зубной техник', sector: 'skilled', edu: 4, wage: 1.2, risk: 0.95, status: 3, urban: 1 },
    { id: 'optician', title: 'оптик', sector: 'skilled', edu: 4, wage: 1.05, risk: 0.9, status: 3, urban: 1 },
    { id: 'paramedic', title: 'фельдшер скорой', sector: 'skilled', edu: 4, wage: 1.05, risk: 1.35, status: 3 },
    { id: 'surveyor', title: 'геодезист', sector: 'skilled', edu: 4, wage: 1.15, risk: 1.2, status: 3 },
    { id: 'printer', title: 'печатник', sector: 'skilled', edu: 3, wage: 0.95, risk: 1.1, status: 2 },
    { id: 'jeweller', title: 'ювелир', sector: 'skilled', edu: 4, wage: 1.25, risk: 0.95, status: 3, urban: 1 },
    { id: 'locksmith', title: 'слесарь', sector: 'skilled', edu: 3, wage: 0.95, risk: 1.2, status: 2 },
    { id: 'conductor', title: 'проводник', sector: 'skilled', edu: 3, wage: 0.9, risk: 1.15, status: 2 },
    { id: 'chef', title: 'шеф-повар', sector: 'skilled', edu: 4, wage: 1.3, risk: 1.05, status: 4, urban: 1 },

    /* --- учёные, лечащие, считающие (20) --- */
    { id: 'teacher', title: 'учитель', sector: 'prof', edu: 5, wage: 0.88, risk: 0.9, status: 4 },
    { id: 'accountant', title: 'бухгалтер', sector: 'prof', edu: 5, wage: 0.9, risk: 0.85, status: 4 },
    { id: 'engineer', title: 'инженер', sector: 'prof', edu: 5, wage: 1.1, risk: 1.0, status: 5 },
    { id: 'it', title: 'программист', sector: 'prof', edu: 5, wage: 1.4, risk: 0.85, status: 5, urban: 1, from: 1975 },
    { id: 'designer', title: 'дизайнер', sector: 'prof', edu: 5, wage: 0.9, risk: 0.9, status: 4, urban: 1 },
    { id: 'lawyer', title: 'юрист', sector: 'prof', edu: 6, wage: 1.4, risk: 0.85, status: 5 },
    { id: 'doctor', title: 'врач', sector: 'prof', edu: 6, wage: 1.5, risk: 0.95, status: 6 },
    { id: 'scientist', title: 'научный сотрудник', sector: 'prof', edu: 6, wage: 0.95, risk: 0.85, status: 5, urban: 1 },
    { id: 'artist', title: 'художник / музыкант', sector: 'prof', edu: 3, wage: 0.7, risk: 1.05, status: 3 },
    { id: 'athlete', title: 'спортсмен', sector: 'prof', edu: 3, wage: 0.95, risk: 1.4, status: 4 },
    { id: 'architect', title: 'архитектор', sector: 'prof', edu: 6, wage: 1.15, risk: 0.9, status: 5, urban: 1 },
    { id: 'pharmacist', title: 'фармацевт', sector: 'prof', edu: 5, wage: 1.0, risk: 0.9, status: 4 },
    { id: 'journalist', title: 'журналист', sector: 'prof', edu: 5, wage: 0.85, risk: 1.15, status: 4, urban: 1 },
    { id: 'translator', title: 'переводчик', sector: 'prof', edu: 5, wage: 0.9, risk: 0.85, status: 4 },
    { id: 'psycho', title: 'психолог', sector: 'prof', edu: 6, wage: 0.95, risk: 0.85, status: 4, urban: 1, from: 1970 },
    { id: 'vet', title: 'ветеринар', sector: 'prof', edu: 5, wage: 0.95, risk: 1.1, status: 4 },
    { id: 'pilot', title: 'пилот', sector: 'prof', edu: 5, wage: 1.8, risk: 1.3, status: 6, urban: 1, from: 1950 },
    { id: 'officer', title: 'офицер', sector: 'prof', edu: 5, wage: 1.05, risk: 1.6, status: 5 },
    { id: 'analyst', title: 'аналитик', sector: 'prof', edu: 5, wage: 1.2, risk: 0.85, status: 5, urban: 1, from: 1985 },
    { id: 'agronomist', title: 'агроном', sector: 'prof', edu: 5, wage: 0.85, risk: 0.95, status: 4, rural: 1 },

    /* --- верхушка (10) --- */
    { id: 'manager', title: 'руководитель отдела', sector: 'elite', edu: 5, wage: 0.95, risk: 0.9, status: 6 },
    { id: 'owner', title: 'владелец своего дела', sector: 'elite', edu: 3, wage: 0.85, risk: 1.0, status: 5 },
    { id: 'banker', title: 'банковский работник', sector: 'elite', edu: 5, wage: 1.05, risk: 0.85, status: 5, urban: 1 },
    { id: 'director', title: 'директор предприятия', sector: 'elite', edu: 6, wage: 1.35, risk: 0.9, status: 6, urban: 1 },
    { id: 'surgeon', title: 'хирург', sector: 'elite', edu: 6, wage: 1.2, risk: 0.95, status: 6, urban: 1 },
    { id: 'judge', title: 'судья', sector: 'elite', edu: 6, wage: 1.1, risk: 0.9, status: 6, urban: 1 },
    { id: 'consultant', title: 'консультант', sector: 'elite', edu: 6, wage: 1.15, risk: 0.85, status: 5, urban: 1, from: 1980 },
    { id: 'diplomat', title: 'дипломат', sector: 'elite', edu: 6, wage: 1.0, risk: 1.0, status: 6, urban: 1 },
    { id: 'producer', title: 'продюсер', sector: 'elite', edu: 5, wage: 1.1, risk: 0.95, status: 5, urban: 1, from: 1970 },
    { id: 'devlead', title: 'технический директор', sector: 'elite', edu: 5, wage: 1.35, risk: 0.85, status: 6, urban: 1, from: 1995 },
    /* ======================= ещё 160 профессий (v1.8) =======================
       Мир больше, чем сотня занятий: ниже — поля и промыслы, стройки и цеха,
       сервис, ремёсла, кабинеты и вершина пирамиды. У каждой профессии свои
       годы (from/to), свои страны (minGdp/maxGdp) и своё место (urban/rural). */
    /* --- земля и вода (+13) --- */
    { id: 'vineyard', title: 'виноградарь', sector: 'agri', edu: 1, wage: 0.95, risk: 1.1, status: 2, rural: 1 },
    { id: 'ricefarm', title: 'рисовод', sector: 'agri', edu: 0, wage: 0.82, risk: 1.15, status: 1, maxGdp: 25000 },
    { id: 'cowman', title: 'скотник', sector: 'agri', edu: 0, wage: 0.85, risk: 1.2, status: 1, rural: 1 },
    { id: 'milkmaid', title: 'доярка', sector: 'agri', edu: 1, wage: 0.9, risk: 1.1, status: 1, rural: 1 },
    { id: 'poultry', title: 'птичник', sector: 'agri', edu: 1, wage: 0.88, risk: 1.1, status: 1 },
    { id: 'teapicker', title: 'сборщик чая', sector: 'agri', edu: 0, wage: 0.75, risk: 1.1, status: 1, maxGdp: 15000 },
    { id: 'cocoa', title: 'сборщик какао', sector: 'agri', edu: 0, wage: 0.76, risk: 1.25, status: 1, maxGdp: 12000 },
    { id: 'pearl', title: 'ловец жемчуга', sector: 'agri', edu: 0, wage: 1.0, risk: 2.2, status: 1, to: 1980, maxGdp: 20000 },
    { id: 'tractor', title: 'тракторист', sector: 'agri', edu: 2, wage: 1.05, risk: 1.3, status: 2, rural: 1, from: 1930 },
    { id: 'zootech', title: 'зоотехник', sector: 'agri', edu: 4, wage: 1.2, risk: 1.0, status: 3, rural: 1 },
    { id: 'irrigator', title: 'мираб, смотритель воды', sector: 'agri', edu: 1, wage: 0.9, risk: 1.05, status: 2, maxGdp: 20000 },
    { id: 'fishfarm', title: 'рыбовод', sector: 'agri', edu: 2, wage: 1.0, risk: 1.2, status: 2, from: 1970 },
    { id: 'orchard', title: 'садовод', sector: 'agri', edu: 1, wage: 0.95, risk: 1.05, status: 2, rural: 1 },
    /* --- улица и подработки (+15) --- */
    { id: 'shoeshine', title: 'чистильщик обуви', sector: 'informal', edu: 0, wage: 0.55, risk: 1.1, status: 1, urban: 1, maxGdp: 20000 },
    { id: 'waterseller', title: 'водонос', sector: 'informal', edu: 0, wage: 0.5, risk: 1.25, status: 1, maxGdp: 8000 },
    { id: 'ragpicker', title: 'старьёвщик', sector: 'informal', edu: 0, wage: 0.6, risk: 1.45, status: 1, urban: 1, maxGdp: 25000 },
    { id: 'busker', title: 'уличный музыкант', sector: 'informal', edu: 1, wage: 0.62, risk: 1.0, status: 1, urban: 1 },
    { id: 'newsboy', title: 'разносчик газет', sector: 'informal', edu: 1, wage: 0.6, risk: 1.0, status: 1, urban: 1, to: 2000 },
    { id: 'carwash', title: 'мойщик машин', sector: 'informal', edu: 0, wage: 0.68, risk: 1.1, status: 1, urban: 1, from: 1950 },
    { id: 'tuktuk', title: 'водитель мототакси', sector: 'informal', edu: 1, wage: 0.85, risk: 2.0, status: 1, urban: 1, maxGdp: 25000, from: 1960 },
    { id: 'shuttle', title: 'челнок-перекупщик', sector: 'informal', edu: 1, wage: 0.95, risk: 1.5, status: 2, from: 1970 },
    { id: 'changer', title: 'уличный меняла', sector: 'informal', edu: 2, wage: 0.95, risk: 1.3, status: 2, urban: 1, maxGdp: 30000 },
    { id: 'fortune', title: 'гадалка', sector: 'informal', edu: 0, wage: 0.7, risk: 1.0, status: 1 },
    { id: 'welldig', title: 'копатель колодцев', sector: 'informal', edu: 0, wage: 0.8, risk: 1.7, status: 1, rural: 1, maxGdp: 10000 },
    { id: 'charcoal', title: 'углежог', sector: 'informal', edu: 0, wage: 0.7, risk: 1.5, status: 1, rural: 1, maxGdp: 8000 },
    { id: 'phonefix', title: 'мастер по ремонту телефонов', sector: 'informal', edu: 2, wage: 0.95, risk: 1.0, status: 2, urban: 1, from: 1998 },
    { id: 'gigdriver', title: 'водитель такси по приложению', sector: 'informal', edu: 1, wage: 0.9, risk: 1.6, status: 2, urban: 1, from: 2012 },
    { id: 'daylabor', title: 'подёнщик', sector: 'informal', edu: 0, wage: 0.6, risk: 1.45, status: 1 },
    /* --- руки и цех (+24) --- */
    { id: 'steelworker', title: 'сталевар', sector: 'manual', edu: 2, wage: 1.25, risk: 1.8, status: 2, urban: 1 },
    { id: 'foundry', title: 'литейщик', sector: 'manual', edu: 2, wage: 1.15, risk: 1.7, status: 2 },
    { id: 'shipyard', title: 'судосборщик', sector: 'manual', edu: 2, wage: 1.2, risk: 1.6, status: 2, urban: 1 },
    { id: 'oilrig', title: 'нефтяник на вышке', sector: 'manual', edu: 2, wage: 1.7, risk: 1.9, status: 3, minGdp: 4000 },
    { id: 'quarry', title: 'рабочий карьера', sector: 'manual', edu: 1, wage: 1.0, risk: 1.75, status: 1 },
    { id: 'asphalt', title: 'дорожный рабочий', sector: 'manual', edu: 1, wage: 0.95, risk: 1.4, status: 1 },
    { id: 'tunnel', title: 'проходчик', sector: 'manual', edu: 2, wage: 1.3, risk: 1.95, status: 2, urban: 1 },
    { id: 'scaffold', title: 'монтажник лесов', sector: 'manual', edu: 1, wage: 1.05, risk: 1.85, status: 1, urban: 1 },
    { id: 'glazier', title: 'стекольщик', sector: 'manual', edu: 2, wage: 1.05, risk: 1.4, status: 2 },
    { id: 'tiler', title: 'плиточник', sector: 'manual', edu: 2, wage: 1.05, risk: 1.2, status: 2 },
    { id: 'plasterer', title: 'штукатур', sector: 'manual', edu: 1, wage: 0.95, risk: 1.25, status: 1 },
    { id: 'demolition', title: 'рабочий на сносе', sector: 'manual', edu: 1, wage: 1.0, risk: 1.8, status: 1, urban: 1 },
    { id: 'warehouse', title: 'кладовщик', sector: 'manual', edu: 2, wage: 0.95, risk: 1.1, status: 2 },
    { id: 'forklift', title: 'водитель погрузчика', sector: 'manual', edu: 2, wage: 1.0, risk: 1.35, status: 2, from: 1950 },
    { id: 'packer', title: 'упаковщик', sector: 'manual', edu: 1, wage: 0.85, risk: 1.0, status: 1 },
    { id: 'electroassm', title: 'сборщик электроники', sector: 'manual', edu: 2, wage: 0.95, risk: 1.05, status: 2, urban: 1, from: 1975, maxGdp: 45000 },
    { id: 'slaughter', title: 'рабочий бойни', sector: 'manual', edu: 1, wage: 1.0, risk: 1.55, status: 1 },
    { id: 'tanner', title: 'кожевник', sector: 'manual', edu: 1, wage: 0.9, risk: 1.5, status: 1 },
    { id: 'potter', title: 'гончар', sector: 'manual', edu: 1, wage: 0.85, risk: 1.05, status: 2 },
    { id: 'weaver', title: 'ткач', sector: 'manual', edu: 1, wage: 0.85, risk: 1.1, status: 1 },
    { id: 'railworker', title: 'путевой рабочий', sector: 'manual', edu: 1, wage: 1.0, risk: 1.6, status: 1, from: 1850 },
    { id: 'linesman', title: 'монтёр линий электропередачи', sector: 'manual', edu: 3, wage: 1.25, risk: 1.9, status: 2, from: 1900 },
    { id: 'sewerman', title: 'рабочий канализации', sector: 'manual', edu: 1, wage: 1.0, risk: 1.55, status: 1, urban: 1 },
    { id: 'mover', title: 'грузчик-перевозчик мебели', sector: 'manual', edu: 1, wage: 0.9, risk: 1.35, status: 1, urban: 1 },
    /* --- люди и услуги (+28) --- */
    { id: 'cashier', title: 'кассир', sector: 'service', edu: 2, wage: 0.85, risk: 0.9, status: 2, urban: 1 },
    { id: 'promoter', title: 'промоутер', sector: 'service', edu: 2, wage: 0.7, risk: 0.95, status: 1, urban: 1, from: 1995 },
    { id: 'manicure', title: 'мастер маникюра', sector: 'service', edu: 2, wage: 0.9, risk: 0.9, status: 2, urban: 1, from: 1975 },
    { id: 'masseur', title: 'массажист', sector: 'service', edu: 3, wage: 1.0, risk: 0.9, status: 3, urban: 1 },
    { id: 'fitness', title: 'фитнес-тренер', sector: 'service', edu: 3, wage: 1.0, risk: 1.0, status: 3, urban: 1, from: 1985 },
    { id: 'lifeguard', title: 'спасатель на воде', sector: 'service', edu: 2, wage: 0.85, risk: 1.3, status: 2 },
    { id: 'skiinstr', title: 'инструктор горных лыж', sector: 'service', edu: 2, wage: 0.95, risk: 1.4, status: 2, minGdp: 12000 },
    { id: 'guide', title: 'экскурсовод', sector: 'service', edu: 3, wage: 0.9, risk: 1.0, status: 3 },
    { id: 'flight', title: 'бортпроводник', sector: 'service', edu: 3, wage: 1.2, risk: 1.3, status: 3, urban: 1, from: 1945, minGdp: 6000 },
    { id: 'croupier', title: 'крупье', sector: 'service', edu: 2, wage: 1.0, risk: 1.0, status: 2, urban: 1, from: 1960 },
    { id: 'bartend', title: 'бармен', sector: 'service', edu: 2, wage: 0.95, risk: 1.15, status: 2, urban: 1 },
    { id: 'dishwash', title: 'посудомойщик', sector: 'service', edu: 0, wage: 0.6, risk: 1.0, status: 1, urban: 1 },
    { id: 'reception', title: 'администратор', sector: 'service', edu: 3, wage: 0.9, risk: 0.9, status: 3, urban: 1 },
    { id: 'concierge', title: 'консьерж', sector: 'service', edu: 2, wage: 0.85, risk: 0.9, status: 2, urban: 1 },
    { id: 'yardman', title: 'дворник', sector: 'service', edu: 0, wage: 0.7, risk: 1.05, status: 1 },
    { id: 'undertaker', title: 'работник похоронной службы', sector: 'service', edu: 2, wage: 1.0, risk: 1.1, status: 2 },
    { id: 'dogwalker', title: 'выгульщик собак', sector: 'service', edu: 1, wage: 0.72, risk: 1.0, status: 1, urban: 1, minGdp: 25000, from: 2000 },
    { id: 'socialwork', title: 'социальный работник', sector: 'service', edu: 4, wage: 0.9, risk: 1.1, status: 3, from: 1950 },
    { id: 'librarian', title: 'библиотекарь', sector: 'service', edu: 4, wage: 0.8, risk: 0.8, status: 3 },
    { id: 'museum', title: 'смотритель музея', sector: 'service', edu: 3, wage: 0.75, risk: 0.8, status: 2, urban: 1 },
    { id: 'moderator', title: 'модератор контента', sector: 'service', edu: 4, wage: 1.0, risk: 1.1, status: 3, urban: 1, from: 2008 },
    { id: 'fooddeliv', title: 'курьер доставки еды', sector: 'service', edu: 1, wage: 0.8, risk: 1.5, status: 1, urban: 1, from: 2013 },
    { id: 'dispatcher', title: 'диспетчер', sector: 'service', edu: 2, wage: 0.85, risk: 0.9, status: 2 },
    { id: 'bouncer', title: 'вышибала', sector: 'service', edu: 1, wage: 0.9, risk: 1.6, status: 1, urban: 1 },
    { id: 'tattoo', title: 'тату-мастер', sector: 'service', edu: 2, wage: 1.05, risk: 1.0, status: 2, urban: 1, from: 1990 },
    { id: 'florist', title: 'флорист', sector: 'service', edu: 2, wage: 0.8, risk: 0.9, status: 2, urban: 1 },
    { id: 'petgroom', title: 'грумер', sector: 'service', edu: 2, wage: 0.85, risk: 0.95, status: 2, urban: 1, minGdp: 20000, from: 1995 },
    { id: 'bathhouse', title: 'банщик', sector: 'service', edu: 1, wage: 0.8, risk: 1.0, status: 1 },
    /* --- ремесло и техника (+30) --- */
    { id: 'cncoper', title: 'оператор станка с ЧПУ', sector: 'skilled', edu: 4, wage: 1.2, risk: 1.2, status: 3, from: 1980 },
    { id: 'toolmaker', title: 'инструментальщик', sector: 'skilled', edu: 4, wage: 1.2, risk: 1.2, status: 3 },
    { id: 'autoelec', title: 'автоэлектрик', sector: 'skilled', edu: 4, wage: 1.1, risk: 1.2, status: 3, from: 1930 },
    { id: 'airmech', title: 'авиатехник', sector: 'skilled', edu: 4, wage: 1.35, risk: 1.4, status: 4, urban: 1, from: 1940, minGdp: 5000 },
    { id: 'shipeng', title: 'судовой механик', sector: 'skilled', edu: 4, wage: 1.4, risk: 1.6, status: 3 },
    { id: 'trainoper', title: 'машинист поезда', sector: 'skilled', edu: 4, wage: 1.3, risk: 1.4, status: 3, from: 1850 },
    { id: 'metro', title: 'машинист метро', sector: 'skilled', edu: 4, wage: 1.25, risk: 1.2, status: 3, urban: 1, from: 1900, minGdp: 8000 },
    { id: 'heating', title: 'слесарь-теплотехник', sector: 'skilled', edu: 3, wage: 1.05, risk: 1.3, status: 3 },
    { id: 'hvac', title: 'мастер по кондиционерам', sector: 'skilled', edu: 3, wage: 1.1, risk: 1.2, status: 3, urban: 1, from: 1970 },
    { id: 'elevator', title: 'механик лифтов', sector: 'skilled', edu: 4, wage: 1.15, risk: 1.5, status: 3, urban: 1, from: 1900 },
    { id: 'windtech', title: 'техник ветроустановок', sector: 'skilled', edu: 4, wage: 1.3, risk: 1.6, status: 3, from: 2005, minGdp: 12000 },
    { id: 'solartech', title: 'монтажник солнечных панелей', sector: 'skilled', edu: 3, wage: 1.1, risk: 1.4, status: 3, from: 2008 },
    { id: 'radiotech', title: 'радиотехник', sector: 'skilled', edu: 4, wage: 1.1, risk: 1.1, status: 3, from: 1930 },
    { id: 'tvrepair', title: 'телемастер', sector: 'skilled', edu: 3, wage: 1.0, risk: 1.0, status: 3, from: 1955, to: 2015 },
    { id: 'watchmaker', title: 'часовщик', sector: 'skilled', edu: 4, wage: 1.05, risk: 0.9, status: 3 },
    { id: 'prosthetist', title: 'техник-протезист', sector: 'skilled', edu: 4, wage: 1.2, risk: 1.0, status: 3, urban: 1, from: 1950 },
    { id: 'xraytech', title: 'рентген-лаборант', sector: 'skilled', edu: 4, wage: 1.15, risk: 1.3, status: 3, urban: 1, from: 1930 },
    { id: 'midwife', title: 'акушерка', sector: 'skilled', edu: 4, wage: 1.1, risk: 1.2, status: 3 },
    { id: 'brewer', title: 'пивовар', sector: 'skilled', edu: 3, wage: 1.1, risk: 1.0, status: 3 },
    { id: 'winemaker', title: 'винодел', sector: 'skilled', edu: 4, wage: 1.15, risk: 1.0, status: 3 },
    { id: 'cheesemaker', title: 'сыровар', sector: 'skilled', edu: 3, wage: 1.05, risk: 1.0, status: 3 },
    { id: 'confection', title: 'кондитер', sector: 'skilled', edu: 3, wage: 1.0, risk: 1.05, status: 3 },
    { id: 'sommelier', title: 'сомелье', sector: 'skilled', edu: 4, wage: 1.1, risk: 0.9, status: 3, urban: 1, minGdp: 18000, from: 1970 },
    { id: 'droneop', title: 'оператор дронов', sector: 'skilled', edu: 4, wage: 1.15, risk: 1.1, status: 3, from: 2014 },
    { id: 'powerop', title: 'оператор электростанции', sector: 'skilled', edu: 4, wage: 1.35, risk: 1.4, status: 4, minGdp: 6000 },
    { id: 'watertreat', title: 'оператор водоканала', sector: 'skilled', edu: 3, wage: 1.0, risk: 1.2, status: 3 },
    { id: 'gasman', title: 'газовщик', sector: 'skilled', edu: 3, wage: 1.1, risk: 1.6, status: 3, from: 1950 },
    { id: 'sound', title: 'звукорежиссёр', sector: 'skilled', edu: 4, wage: 1.1, risk: 1.0, status: 3, urban: 1, from: 1930 },
    { id: 'cameraman', title: 'оператор камеры', sector: 'skilled', edu: 4, wage: 1.1, risk: 1.2, status: 3, urban: 1, from: 1925 },
    { id: 'lightrig', title: 'осветитель', sector: 'skilled', edu: 3, wage: 0.95, risk: 1.3, status: 2, urban: 1, from: 1930 },
    /* --- кабинет и диплом (+25) --- */
    { id: 'dentistdoc', title: 'стоматолог', sector: 'prof', edu: 6, wage: 1.5, risk: 0.95, status: 5, urban: 1 },
    { id: 'psychiatrist', title: 'психиатр', sector: 'prof', edu: 6, wage: 1.4, risk: 1.1, status: 5, urban: 1, from: 1940 },
    { id: 'nutrition', title: 'диетолог', sector: 'prof', edu: 5, wage: 1.0, risk: 0.9, status: 4, urban: 1, from: 1980 },
    { id: 'epidem', title: 'эпидемиолог', sector: 'prof', edu: 6, wage: 1.15, risk: 1.1, status: 5, from: 1950 },
    { id: 'geologist', title: 'геолог', sector: 'prof', edu: 5, wage: 1.2, risk: 1.4, status: 4 },
    { id: 'meteorol', title: 'метеоролог', sector: 'prof', edu: 5, wage: 1.0, risk: 1.0, status: 4 },
    { id: 'ecologist', title: 'эколог', sector: 'prof', edu: 5, wage: 1.0, risk: 1.1, status: 4, from: 1975 },
    { id: 'chemeng', title: 'инженер-химик', sector: 'prof', edu: 5, wage: 1.25, risk: 1.3, status: 4 },
    { id: 'structeng', title: 'инженер-конструктор', sector: 'prof', edu: 5, wage: 1.3, risk: 1.0, status: 4 },
    { id: 'powereng', title: 'инженер-энергетик', sector: 'prof', edu: 5, wage: 1.3, risk: 1.1, status: 4 },
    { id: 'roboteng', title: 'инженер-робототехник', sector: 'prof', edu: 5, wage: 1.4, risk: 0.95, status: 5, from: 1990, minGdp: 12000 },
    { id: 'aero', title: 'авиаконструктор', sector: 'prof', edu: 6, wage: 1.45, risk: 1.0, status: 5, urban: 1, from: 1930, minGdp: 8000 },
    { id: 'datasci', title: 'специалист по данным', sector: 'prof', edu: 5, wage: 1.35, risk: 0.85, status: 5, urban: 1, from: 2010 },
    { id: 'sysadmin', title: 'системный администратор', sector: 'prof', edu: 4, wage: 1.2, risk: 0.9, status: 4, from: 1995 },
    { id: 'cyber', title: 'специалист по кибербезопасности', sector: 'prof', edu: 5, wage: 1.4, risk: 0.9, status: 5, urban: 1, from: 2000 },
    { id: 'gamedev', title: 'разработчик игр', sector: 'prof', edu: 5, wage: 1.2, risk: 0.9, status: 4, urban: 1, from: 1985 },
    { id: 'marketer', title: 'интернет-маркетолог', sector: 'prof', edu: 4, wage: 1.1, risk: 0.9, status: 4, urban: 1, from: 2000 },
    { id: 'hr', title: 'специалист по кадрам', sector: 'prof', edu: 5, wage: 1.05, risk: 0.85, status: 4, urban: 1 },
    { id: 'auditor', title: 'аудитор', sector: 'prof', edu: 5, wage: 1.25, risk: 0.85, status: 5, urban: 1 },
    { id: 'actuary', title: 'актуарий', sector: 'prof', edu: 6, wage: 1.35, risk: 0.8, status: 5, urban: 1, from: 1950, minGdp: 15000 },
    { id: 'taxman', title: 'налоговый инспектор', sector: 'prof', edu: 5, wage: 1.0, risk: 0.95, status: 4 },
    { id: 'notary', title: 'нотариус', sector: 'prof', edu: 6, wage: 1.3, risk: 0.8, status: 5, urban: 1 },
    { id: 'prosecutor', title: 'прокурор', sector: 'prof', edu: 6, wage: 1.3, risk: 1.1, status: 5, urban: 1 },
    { id: 'detective', title: 'следователь', sector: 'prof', edu: 5, wage: 1.15, risk: 1.5, status: 4, urban: 1 },
    { id: 'customs', title: 'таможенник', sector: 'prof', edu: 4, wage: 1.1, risk: 1.0, status: 4 },
    /* --- наука, слово и небо (+10) --- */
    { id: 'archivist', title: 'архивист', sector: 'prof', edu: 5, wage: 0.85, risk: 0.8, status: 3 },
    { id: 'archaeo', title: 'археолог', sector: 'prof', edu: 6, wage: 0.95, risk: 1.2, status: 4 },
    { id: 'historian', title: 'историк', sector: 'prof', edu: 6, wage: 0.9, risk: 0.8, status: 4 },
    { id: 'lecturer', title: 'преподаватель вуза', sector: 'prof', edu: 6, wage: 1.15, risk: 0.8, status: 5, urban: 1 },
    { id: 'musicteach', title: 'учитель музыки', sector: 'prof', edu: 4, wage: 0.85, risk: 0.8, status: 3 },
    { id: 'coachsport', title: 'тренер команды', sector: 'prof', edu: 4, wage: 1.0, risk: 1.1, status: 4 },
    { id: 'navigator', title: 'штурман дальнего плавания', sector: 'prof', edu: 5, wage: 1.3, risk: 1.5, status: 4 },
    { id: 'aircontrol', title: 'авиадиспетчер', sector: 'prof', edu: 5, wage: 1.4, risk: 1.2, status: 5, urban: 1, from: 1950, minGdp: 8000 },
    { id: 'nuclear', title: 'инженер-атомщик', sector: 'prof', edu: 6, wage: 1.5, risk: 1.3, status: 5, from: 1955, minGdp: 10000 },
    { id: 'linguist', title: 'лингвист', sector: 'prof', edu: 6, wage: 0.95, risk: 0.8, status: 4 },
    /* --- вершина пирамиды (+15) --- */
    { id: 'fundmanager', title: 'управляющий фондом', sector: 'elite', edu: 6, wage: 1.6, risk: 0.85, status: 6, urban: 1, minGdp: 15000, from: 1970 },
    { id: 'venture', title: 'венчурный инвестор', sector: 'elite', edu: 6, wage: 1.7, risk: 0.9, status: 6, urban: 1, from: 1985, minGdp: 20000 },
    { id: 'founder', title: 'основатель стартапа', sector: 'elite', edu: 5, wage: 1.5, risk: 1.1, status: 5, urban: 1, from: 1995 },
    { id: 'deputy', title: 'депутат', sector: 'elite', edu: 5, wage: 1.3, risk: 1.1, status: 6, urban: 1 },
    { id: 'mayor', title: 'мэр', sector: 'elite', edu: 5, wage: 1.25, risk: 1.1, status: 6, urban: 1 },
    { id: 'minister', title: 'министр', sector: 'elite', edu: 6, wage: 1.5, risk: 1.2, status: 7, urban: 1 },
    { id: 'general', title: 'генерал', sector: 'elite', edu: 5, wage: 1.35, risk: 1.45, status: 6 },
    { id: 'bishop', title: 'епископ', sector: 'elite', edu: 5, wage: 1.1, risk: 0.9, status: 5 },
    { id: 'filmdir', title: 'кинорежиссёр', sector: 'elite', edu: 5, wage: 1.3, risk: 1.0, status: 6, urban: 1, from: 1920 },
    { id: 'popstar', title: 'эстрадная звезда', sector: 'elite', edu: 2, wage: 1.8, risk: 1.3, status: 6, urban: 1, from: 1950 },
    { id: 'tvhost', title: 'телеведущий', sector: 'elite', edu: 5, wage: 1.3, risk: 0.9, status: 6, urban: 1, from: 1955 },
    { id: 'blogger', title: 'блогер-миллионник', sector: 'elite', edu: 3, wage: 1.4, risk: 1.0, status: 5, urban: 1, from: 2008 },
    { id: 'prostar', title: 'спортсмен высшей лиги', sector: 'elite', edu: 1, wage: 1.9, risk: 1.6, status: 6, urban: 1, from: 1950 },
    { id: 'shipowner', title: 'судовладелец', sector: 'elite', edu: 5, wage: 1.6, risk: 1.0, status: 6, minGdp: 8000 },
    { id: 'lawpartner', title: 'партнёр юридической фирмы', sector: 'elite', edu: 6, wage: 1.6, risk: 0.85, status: 6, urban: 1, minGdp: 15000 }
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

  /* Доступные профессии: образование, страна, город или село и сам год.
     Программиста не было в 1960-м, плантаций не бывает в Норвегии,
     а крановщика — в деревне. */
  function jobsFor(country, edu, rnd, opts) {
    opts = opts || {};
    var year = opts.year || 2000;
    var urban = opts.urban === undefined ? country.urban > 50 : !!opts.urban;
    var agriShare = clamp(0.9 - country.gdp / 30000, 0.02, 0.62);
    return JOBS.filter(function (j) {
      if (j.edu > edu) return false;
      if (j.from && year < j.from) return false;
      if (j.to && year > j.to) return false;
      if (j.minGdp && country.gdp < j.minGdp) return false;
      if (j.maxGdp && country.gdp > j.maxGdp) return false;
      if (j.urban && !urban) return false;
      if (j.rural && urban && rnd() > 0.25) return false;
      return true;
    }).map(function (j) {
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

  /* ------------------------- сколько платят ------------------------------
     Зарплата собирается из пяти множителей, и каждый из них — про страну:

     1. средний заработок в экономике — доля труда в ВВП на душу. В бедных
        странах эта доля меньше: много натурального хозяйства и своего дела,
        которое в зарплату не попадает;
     2. оплата сектора — в бедной стране врач получает не вдвое, а в пять раз
        больше продавца; с ростом ВВП разрыв сжимается;
     3. сама профессия внутри сектора;
     4. ступень карьеры, стаж и знания;
     5. поправки человека: город или село, пол, бюджетная работа.          */

  /* средний годовой заработок работающего человека, межд. $ ППС */
  function avgWage(country) {
    /* Чем беднее страна, тем большая часть ВВП — это прямой труд людей:
       в бедной стране на зарплаты уходит почти весь продукт, в богатой
       заметную часть забирают капитал, рента и налоги. */
    return country.gdp * clamp(0.55 - 0.24 * Math.pow(country.gdp / 40000, 0.5), 0.33, 0.58);
  }

  /* уровень развития: 0 — беднейшие, 1 — богатые, 1.2 — самые богатые */
  function devLevel(country) { return clamp(country.gdp / 60000, 0, 1.2); }

  /* во сколько раз сектор оплачивается относительно среднего по стране */
  function sectorPay(country, sector) {
    var d = devLevel(country);
    if (sector === 'agri') return 0.8 - d * 0.3;
    if (sector === 'informal') return 0.82 - d * 0.28;
    if (sector === 'manual') return 0.92 + d * 0.04;
    if (sector === 'service') return 0.86 + d * 0.1;
    if (sector === 'skilled') return 1.04 + d * 0.06;
    if (sector === 'prof') return 1.75 - d * 0.15;
    if (sector === 'elite') return 2.4 - d * 0.2;
    return 1;
  }

  /* бюджетная работа: в бедной стране это надёжно и даже выгодно,
     в богатой — заметно меньше частного сектора */
  var PUBLIC_JOBS = {
    teacher: 1, nurse: 1, doctor: 1, soldier: 1, police: 1, scientist: 1, clerk: 1,
    postman: 1, firefighter: 1, paramedic: 1, judge: 1, railway: 1, conductor: 1,
    vet: 1, officer: 1, diplomat: 1, busdriver: 1, lab: 1, agronomist: 1, surgeon: 1,
    midwife: 1, xraytech: 1, librarian: 1, museum: 1, socialwork: 1, archivist: 1,
    lecturer: 1, musicteach: 1, taxman: 1, customs: 1, prosecutor: 1, detective: 1,
    notary: 1, aircontrol: 1, meteorol: 1, epidem: 1, zootech: 1, watertreat: 1,
    metro: 1, trainoper: 1, deputy: 1, mayor: 1, minister: 1, general: 1,
    yardman: 1, sewerman: 1, railworker: 1, archaeo: 1, historian: 1, linguist: 1
  };

  /* Годовая зарплата профессии (межд. $ ППС).
     opts: { sex: 'm' | 'f', urban: bool } — поправки человека. */
  function wageFor(country, job, step, knowledge, years, opts) {
    opts = opts || {};
    var d = devLevel(country);
    var base = avgWage(country) * sectorPay(country, job.sector) * (job.wage || 1);
    /* стаж: быстро в начале, потом выходит на полку и после тридцати лет оседает */
    var y = clamp(years, 0, 45);
    var exp = 0.82 + 0.45 * (1 - Math.exp(-y / 9)) - y * 0.003;
    var know = 0.85 + clamp(knowledge, 0, 100) / 100 * 0.35;
    var w = base * CAREER_STEPS[clamp(step, 0, 4)].mult * exp * know;
    if (PUBLIC_JOBS[job.id]) w *= 1.06 - d * 0.1;
    if (opts.urban === false && job.sector !== 'agri') w *= 0.74;   /* в селе платят меньше */
    if (opts.urban === true && job.sector === 'agri') w *= 1.12;
    if (opts.sex === 'f') w *= 1 - (0.07 + 0.13 * (1 - clamp(d, 0, 1)));
    return w;
  }

  /* Вероятность подняться на ступень: карьера — пирамида, наверх проходят
     единицы. Без этого к сорока годам «главным» становится каждый второй. */
  function promoteOdds(step) {
    return [1, 0.2, 0.08, 0.03, 0][clamp(step, 0, 4)];
  }

  /* Потолок профессии: «главным грузчиком» не становятся. У простой работы
     две ступени, у ремесла и услуг — три, у учёной работы и начальства — все пять. */
  function topStep(job) {
    if (job.sector === 'agri' || job.sector === 'informal') return 1;
    if (job.sector === 'manual' || job.sector === 'service') return 2;
    if (job.sector === 'skilled') return 3;
    return 4;
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

  /* сумма внутри текста события — в той же валюте, что и весь интерфейс */
  function cash(v, country) {
    var G = typeof window !== 'undefined' ? window.IN8B : null;
    if (G && G.ui && G.ui.money) return G.ui.money(v);
    var CO = G && G.countries;
    var u = CO && CO.currencyOf ? CO.currencyOf(country) : null;
    return u ? fmtMoney(v * u.k) + ' ' + u.sym : fmtMoney(v);
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
    householdMean: householdMean,
    incomeAtPercentile: incomeAtPercentile,
    avgWage: avgWage, sectorPay: sectorPay, devLevel: devLevel, promoteOdds: promoteOdds, topStep: topStep,
    PUBLIC_JOBS: PUBLIC_JOBS,
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
    fmtMoney: fmtMoney, cash: cash,
    fmtNum: fmtNum,
    plural: plural
  };
})();
