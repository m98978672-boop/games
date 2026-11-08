/* ============================================================
   1 ИЗ 8 МИЛЛИАРДОВ — сто алгоритмов.
   ------------------------------------------------------------
   Маленькая библиотека, на которой стоит вся остальная игра:
   статистика, случайность с зерном, деньги и проценты, кривые,
   поиск, текст, демография и принятие решений.

   Каждая функция чистая: одни и те же входы дают один и тот же
   результат, глобального состояния нет. Внизу файла — словарь
   DOC: сто имён с описанием на русском, по нему тесты проверяют,
   что ни один алгоритм не потерялся и все они считают числа.
   ============================================================ */
(function () {
  'use strict';

  var A = {};
  function num(v) { return typeof v === 'number' && isFinite(v); }

  /* ===================== 1. числа и статистика (20) ==================== */

  A.mean = function (a) { return a.length ? A.sum(a) / a.length : 0; };
  A.sum = function (a) { var s = 0; for (var i = 0; i < a.length; i++) s += a[i]; return s; };
  /* сумма Кэхана: складывает миллион мелких трат, не теряя копейки */
  A.kahanSum = function (a) {
    var s = 0, c = 0;
    for (var i = 0; i < a.length; i++) { var y = a[i] - c, t = s + y; c = (t - s) - y; s = t; }
    return s;
  };
  A.median = function (a) {
    if (!a.length) return 0;
    var b = a.slice().sort(function (x, y) { return x - y; }), m = b.length >> 1;
    return b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2;
  };
  A.percentile = function (a, p) {
    if (!a.length) return 0;
    var b = a.slice().sort(function (x, y) { return x - y; });
    var i = A.clamp(p, 0, 1) * (b.length - 1), lo = Math.floor(i), hi = Math.ceil(i);
    return b[lo] + (b[hi] - b[lo]) * (i - lo);
  };
  A.variance = function (a) {
    if (a.length < 2) return 0;
    var m = A.mean(a), s = 0;
    for (var i = 0; i < a.length; i++) s += (a[i] - m) * (a[i] - m);
    return s / (a.length - 1);
  };
  A.stdev = function (a) { return Math.sqrt(A.variance(a)); };
  /* медианное отклонение: устойчиво к одному миллионеру в выборке */
  A.mad = function (a) {
    var m = A.median(a);
    return A.median(a.map(function (x) { return Math.abs(x - m); }));
  };
  A.zScore = function (x, a) { var s = A.stdev(a); return s ? (x - A.mean(a)) / s : 0; };
  A.mode = function (a) {
    var c = {}, best = null, n = -1;
    for (var i = 0; i < a.length; i++) { var k = a[i]; c[k] = (c[k] || 0) + 1; if (c[k] > n) { n = c[k]; best = k; } }
    return best;
  };
  A.skew = function (a) {
    var m = A.mean(a), s = A.stdev(a); if (!s) return 0;
    return A.mean(a.map(function (x) { return Math.pow((x - m) / s, 3); }));
  };
  A.kurtosis = function (a) {
    var m = A.mean(a), s = A.stdev(a); if (!s) return 0;
    return A.mean(a.map(function (x) { return Math.pow((x - m) / s, 4); })) - 3;
  };
  /* неравенство по выборке доходов — тот же Джини, что в данных стран */
  A.gini = function (a) {
    var b = a.filter(num).sort(function (x, y) { return x - y; }), n = b.length;
    if (n < 2) return 0;
    var s = 0, t = A.sum(b);
    for (var i = 0; i < n; i++) s += (2 * (i + 1) - n - 1) * b[i];
    return t ? A.clamp(s / (n * t), 0, 1) : 0;
  };
  A.entropy = function (p) {
    var s = A.sum(p) || 1, e = 0;
    for (var i = 0; i < p.length; i++) { var q = p[i] / s; if (q > 0) e -= q * Math.log(q); }
    return e;
  };
  A.softmax = function (a, t) {
    t = t || 1;
    var mx = Math.max.apply(null, a), e = a.map(function (x) { return Math.exp((x - mx) / t); }), s = A.sum(e);
    return e.map(function (x) { return x / s; });
  };
  A.normalize = function (a) { var s = A.sum(a); return s ? a.map(function (x) { return x / s; }) : a.map(function () { return 1 / a.length; }); };
  /* скользящее среднее: настроение года помнит прошлый год */
  A.ewma = function (prev, x, k) { return prev + (x - prev) * A.clamp(k, 0, 1); };
  A.erf = function (x) {
    var s = x < 0 ? -1 : 1; x = Math.abs(x);
    var t = 1 / (1 + 0.3275911 * x);
    var y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
    return s * y;
  };
  A.normalCdf = function (x, mu, sd) { return 0.5 * (1 + A.erf(((x - (mu || 0)) / (sd || 1)) / Math.SQRT2)); };
  /* обратная нормаль (Акклам): из процентиля делает доход */
  A.normalQuantile = function (p) {
    p = A.clamp(p, 1e-9, 1 - 1e-9);
    var a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.3577518672690, -30.66479806614716, 2.506628277459239];
    var b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572];
    var c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
    var d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416];
    var pl = 0.02425, q, r;
    if (p < pl) { q = Math.sqrt(-2 * Math.log(p));
      return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
    if (p > 1 - pl) { q = Math.sqrt(-2 * Math.log(1 - p));
      return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
    q = p - 0.5; r = q * q;
    return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  };

  /* ====================== 2. случайность (15) ========================== */

  /* зерно из строки: одно имя — одна жизнь, всегда одинаковая */
  A.hashSeed = function (s) {
    var h = 2166136261;
    s = String(s);
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  };
  A.mulberry32 = function (seed) {
    var t = seed >>> 0;
    return function () {
      t = (t + 0x6D2B79F5) >>> 0;
      var r = Math.imul(t ^ (t >>> 15), 1 | t);
      r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  };
  A.xorshift32 = function (seed) {
    var x = (seed >>> 0) || 2463534242;
    return function () { x ^= x << 13; x >>>= 0; x ^= x >> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; };
  };
  A.splitmix32 = function (seed) {
    var x = seed >>> 0;
    return function () {
      x = (x + 0x9E3779B9) >>> 0;
      var z = x; z = Math.imul(z ^ (z >>> 16), 0x21F0AAAD); z = Math.imul(z ^ (z >>> 15), 0x735A2D97);
      return ((z ^ (z >>> 15)) >>> 0) / 4294967296;
    };
  };
  A.pick = function (rnd, a) { return a[Math.floor(rnd() * a.length) % a.length]; };
  A.weightedPick = function (rnd, items, weight) {
    var w = items.map(function (it, i) { return Math.max(0, weight ? weight(it, i) : (it.w || 1)); });
    var t = A.sum(w); if (t <= 0) return items[0];
    var x = rnd() * t;
    for (var i = 0; i < items.length; i++) { x -= w[i]; if (x <= 0) return items[i]; }
    return items[items.length - 1];
  };
  A.shuffle = function (rnd, a) {
    var b = a.slice();
    for (var i = b.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)); var t = b[i]; b[i] = b[j]; b[j] = t; }
    return b;
  };
  A.sampleN = function (rnd, a, n) { return A.shuffle(rnd, a).slice(0, Math.max(0, Math.min(n, a.length))); };
  A.chance = function (rnd, p) { return rnd() < A.clamp(p, 0, 1); };
  A.normalSample = function (rnd, mu, sd) {
    var u = 1 - rnd(), v = rnd();
    return (mu || 0) + (sd === undefined ? 1 : sd) * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
  A.lognormalSample = function (rnd, mu, sigma) { return Math.exp(A.normalSample(rnd, mu, sigma)); };
  A.poissonSample = function (rnd, lambda) {
    var l = Math.exp(-Math.max(0, lambda)), k = 0, p = 1;
    do { k++; p *= rnd(); } while (p > l && k < 400);
    return k - 1;
  };
  A.binomialSample = function (rnd, n, p) { var k = 0; for (var i = 0; i < n; i++) if (rnd() < p) k++; return k; };
  A.geometricSample = function (rnd, p) { p = A.clamp(p, 1e-6, 1); return Math.ceil(Math.log(1 - rnd()) / Math.log(1 - p)); };
  A.triangular = function (rnd, lo, mid, hi) {
    var u = rnd(), c = (mid - lo) / (hi - lo);
    return u < c ? lo + Math.sqrt(u * (hi - lo) * (mid - lo)) : hi - Math.sqrt((1 - u) * (hi - lo) * (hi - mid));
  };

  /* ========================= 3. деньги (15) ============================ */

  A.compound = function (sum, rate, years) { return sum * Math.pow(1 + rate, years); };
  A.npv = function (rate, flows) {
    var s = 0; for (var i = 0; i < flows.length; i++) s += flows[i] / Math.pow(1 + rate, i); return s;
  };
  A.irr = function (flows, guess) {
    var r = guess === undefined ? 0.1 : guess;
    for (var i = 0; i < 60; i++) {
      var f = A.npv(r, flows), d = (A.npv(r + 1e-5, flows) - f) / 1e-5;
      if (!d) break;
      var nr = r - f / d;
      if (!num(nr)) break;
      r = A.clamp(nr, -0.95, 10);
      if (Math.abs(f) < 1e-7) break;
    }
    return r;
  };
  /* годовой платёж по кредиту: столько придётся отдавать каждый год */
  A.annuity = function (sum, rate, years) {
    if (!rate) return years ? sum / years : sum;
    return sum * rate / (1 - Math.pow(1 + rate, -years));
  };
  A.amortLeft = function (sum, rate, years, paid) {
    var pay = A.annuity(sum, rate, years), left = sum;
    for (var i = 0; i < paid; i++) left = left * (1 + rate) - pay;
    return Math.max(0, left);
  };
  A.payoffYears = function (debt, rate, pay) {
    if (pay <= debt * rate) return Infinity;
    return Math.log(pay / (pay - debt * rate)) / Math.log(1 + rate);
  };
  A.realRate = function (nominal, inflation) { return (1 + nominal) / (1 + inflation) - 1; };
  A.inflate = function (sum, rate, years) { return sum * Math.pow(1 + rate, years); };
  A.deflate = function (sum, rate, years) { return sum / Math.pow(1 + rate, years); };
  /* перевод между валютами по паритету покупательной способности */
  A.pppConvert = function (sum, fromK, toK) { return fromK ? sum / fromK * toK : sum * toK; };
  /* прогрессивная шкала: массив [[порог, ставка], ...] */
  A.progressiveTax = function (income, brackets) {
    var t = 0, prev = 0;
    for (var i = 0; i < brackets.length; i++) {
      var lim = brackets[i][0], rate = brackets[i][1];
      if (income > prev) t += (Math.min(income, lim) - prev) * rate;
      prev = lim;
      if (income <= lim) break;
    }
    if (income > prev && brackets.length) t += (income - prev) * brackets[brackets.length - 1][1];
    return t;
  };
  A.netPay = function (gross, taxRate, social) { return gross * (1 - A.clamp(taxRate + (social || 0), 0, 0.95)); };
  A.savingsYears = function (goal, have, perYear, rate) {
    if (have >= goal) return 0;
    if (perYear <= 0) return Infinity;
    var y = 0, s = have;
    while (s < goal && y < 200) { s = s * (1 + (rate || 0)) + perYear; y++; }
    return y;
  };
  A.budgetNormalize = function (b) {
    var keys = Object.keys(b), s = 0, out = {};
    keys.forEach(function (k) { s += Math.max(0, b[k]); });
    keys.forEach(function (k) { out[k] = s ? Math.max(0, b[k]) / s : 1 / keys.length; });
    return out;
  };
  /* цена «как в жизни»: 1 970, а не 1 968,37 */
  A.roundNice = function (v) {
    var a = Math.abs(v); if (a < 10) return Math.round(v);
    var step = a < 100 ? 5 : a < 1000 ? 10 : a < 10000 ? 50 : a < 100000 ? 500 : 5000;
    return Math.round(v / step) * step;
  };

  /* ====================== 4. кривые и переходы (10) ==================== */

  A.clamp = function (v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; };
  A.lerp = function (a, b, t) { return a + (b - a) * A.clamp(t, 0, 1); };
  A.invLerp = function (a, b, v) { return b === a ? 0 : A.clamp((v - a) / (b - a), 0, 1); };
  A.remap = function (v, a, b, c, d) { return A.lerp(c, d, A.invLerp(a, b, v)); };
  A.smoothstep = function (t) { t = A.clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  A.easeInOut = function (t) { t = A.clamp(t, 0, 1); return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };
  A.logistic = function (x, k, x0) { return 1 / (1 + Math.exp(-(k === undefined ? 1 : k) * (x - (x0 || 0)))); };
  A.gompertz = function (x, a, b, c) { return (a || 1) * Math.exp(-(b || 1) * Math.exp(-(c || 1) * x)); };
  /* кривая насыщения: первые деньги меняют жизнь сильнее последних */
  A.hill = function (x, half, n) { var p = Math.pow(Math.max(0, x), n || 1); return p / (p + Math.pow(half || 1, n || 1)); };
  A.catmull = function (p0, p1, p2, p3, t) {
    var t2 = t * t, t3 = t2 * t;
    return 0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
  };

  /* ===================== 5. поиск и структуры (12) ===================== */

  A.binarySearch = function (a, x) {
    var lo = 0, hi = a.length - 1;
    while (lo <= hi) { var m = (lo + hi) >> 1; if (a[m] === x) return m; if (a[m] < x) lo = m + 1; else hi = m - 1; }
    return -1;
  };
  A.lowerBound = function (a, x) {
    var lo = 0, hi = a.length;
    while (lo < hi) { var m = (lo + hi) >> 1; if (a[m] < x) lo = m + 1; else hi = m; }
    return lo;
  };
  A.cumsum = function (a) { var s = 0; return a.map(function (x) { s += x; return s; }); };
  A.argmax = function (a, f) {
    var bi = -1, bv = -Infinity;
    for (var i = 0; i < a.length; i++) { var v = f ? f(a[i], i) : a[i]; if (v > bv) { bv = v; bi = i; } }
    return bi;
  };
  A.argmin = function (a, f) { return A.argmax(a, function (x, i) { return -(f ? f(x, i) : x); }); };
  A.topK = function (a, k, f) {
    return a.slice().sort(function (x, y) { return (f ? f(y) : y) - (f ? f(x) : x); }).slice(0, k);
  };
  A.groupBy = function (a, f) {
    var o = {};
    a.forEach(function (x, i) { var k = f(x, i); (o[k] = o[k] || []).push(x); });
    return o;
  };
  A.countBy = function (a, f) {
    var o = {};
    a.forEach(function (x, i) { var k = f ? f(x, i) : x; o[k] = (o[k] || 0) + 1; });
    return o;
  };
  A.uniq = function (a) { return a.filter(function (x, i) { return a.indexOf(x) === i; }); };
  A.chunk = function (a, n) {
    var out = []; for (var i = 0; i < a.length; i += n) out.push(a.slice(i, i + n)); return out;
  };
  A.zip = function (a, b) { return a.map(function (x, i) { return [x, b[i]]; }); };
  A.rotate = function (a, n) { var k = ((n % a.length) + a.length) % a.length; return a.slice(k).concat(a.slice(0, k)); };

  /* ========================== 6. текст (8) ============================= */

  A.plural = function (n, one, few, many) {
    var a = Math.abs(n) % 100, b = a % 10;
    if (a > 10 && a < 20) return many;
    if (b > 1 && b < 5) return few;
    if (b === 1) return one;
    return many;
  };
  A.fmtNum = function (v) { return String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); };
  A.fmtShort = function (v) {
    var a = Math.abs(v);
    if (a >= 1e9) return (v / 1e9).toFixed(1).replace('.', ',') + ' млрд';
    if (a >= 1e6) return (v / 1e6).toFixed(1).replace('.', ',') + ' млн';
    if (a >= 1e4) return Math.round(v / 1e3) + ' тыс';
    return A.fmtNum(v);
  };
  A.initials = function (full) {
    return String(full).split(/\s+/).filter(Boolean).map(function (w) { return w[0].toUpperCase() + '.'; }).join(' ');
  };
  A.levenshtein = function (a, b) {
    var m = a.length, n = b.length, prev = [], cur = [], i, j;
    for (j = 0; j <= n; j++) prev[j] = j;
    for (i = 1; i <= m; i++) {
      cur[0] = i;
      for (j = 1; j <= n; j++) {
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      }
      prev = cur.slice();
    }
    return prev[n];
  };
  A.slug = function (s) { return String(s).toLowerCase().replace(/[^a-zа-я0-9]+/gi, '-').replace(/^-|-$/g, ''); };
  A.truncate = function (s, n) { return String(s).length <= n ? String(s) : String(s).slice(0, Math.max(0, n - 1)) + '…'; };
  A.joinList = function (a, last) {
    if (a.length < 2) return a.join('');
    return a.slice(0, -1).join(', ') + ' ' + (last || 'и') + ' ' + a[a.length - 1];
  };

  /* ===================== 7. время и демография (10) ==================== */

  A.ageAt = function (birthYear, year) { return Math.max(0, year - birthYear); };
  A.decade = function (year) { return Math.floor(year / 10) * 10; };
  A.qxToHazard = function (q) { return -Math.log(1 - A.clamp(q, 0, 0.999999)); };
  A.hazardToQx = function (h) { return 1 - Math.exp(-Math.max(0, h)); };
  A.logit = function (p) { p = A.clamp(p, 1e-9, 1 - 1e-9); return 0.5 * Math.log(p / (1 - p)); };
  A.expit = function (y) { return 1 / (1 + Math.exp(-2 * y)); };
  /* модель Брасса: чужую таблицу смертности сдвигают к своей стране */
  A.brass = function (lx, alpha, beta) {
    return lx.map(function (v) { return A.expit(alpha + beta * A.logit(1 - A.clamp(v, 1e-9, 1 - 1e-9))); })
      .map(function (v) { return A.clamp(1 - v, 0, 1); });
  };
  A.lifeExp = function (lx, from) {
    var s = 0, l0 = lx[from || 0] || 1;
    for (var i = (from || 0); i < lx.length - 1; i++) s += (lx[i] + lx[i + 1]) / 2;
    return l0 ? s / l0 : 0;
  };
  A.survivalTo = function (lx, age) { return lx[Math.min(Math.max(0, age | 0), lx.length - 1)] || 0; };
  A.smoothSeries = function (a, k) {
    k = k === undefined ? 0.35 : k;
    var out = [], prev = a[0];
    for (var i = 0; i < a.length; i++) { prev = A.ewma(prev, a[i], k); out.push(prev); }
    return out;
  };

  /* ======================== 8. решения (10) ============================ */

  A.utility = function (parts, weights) {
    var s = 0;
    Object.keys(weights).forEach(function (k) { s += (parts[k] || 0) * weights[k]; });
    return s;
  };
  A.softmaxPick = function (rnd, options, score, temp) {
    var p = A.softmax(options.map(function (o, i) { return score(o, i); }), temp || 1);
    var x = rnd(), acc = 0;
    for (var i = 0; i < options.length; i++) { acc += p[i]; if (x <= acc) return options[i]; }
    return options[options.length - 1];
  };
  A.epsilonGreedy = function (rnd, options, score, eps) {
    if (rnd() < (eps === undefined ? 0.1 : eps)) return A.pick(rnd, options);
    return options[A.argmax(options, score)];
  };
  A.ucb1 = function (wins, tries, total) {
    if (!tries) return Infinity;
    return wins / tries + Math.sqrt(2 * Math.log(Math.max(2, total)) / tries);
  };
  A.elo = function (ra, rb, scoreA, k) {
    var e = 1 / (1 + Math.pow(10, (rb - ra) / 400));
    return ra + (k || 24) * (scoreA - e);
  };
  A.bayes = function (prior, likelihood, likelihoodNot) {
    var num2 = prior * likelihood, den = num2 + (1 - prior) * likelihoodNot;
    return den ? num2 / den : prior;
  };
  A.markovStep = function (rnd, matrix, state) {
    var row = matrix[state] || [];
    var x = rnd(), acc = 0;
    for (var i = 0; i < row.length; i++) { acc += row[i]; if (x <= acc) return i; }
    return state;
  };
  /* гистерезис: решение не дрожит от каждого колебания */
  A.hysteresis = function (on, v, lo, hi) { return on ? v > lo : v > hi; };
  A.cooldown = function (lastAge, age, years) { return lastAge === undefined || lastAge === null || age - lastAge >= years; };
  A.riskScore = function (base, mods) {
    var r = base;
    for (var i = 0; i < mods.length; i++) r *= mods[i];
    return A.clamp(r, 0, 1);
  };

  /* ===================== словарь: сто имён и смыслов =================== */
  var DOC = {
    mean: 'среднее', sum: 'сумма', kahanSum: 'точная сумма Кэхана', median: 'медиана',
    percentile: 'значение по процентилю', variance: 'дисперсия', stdev: 'стандартное отклонение',
    mad: 'медианное отклонение', zScore: 'насколько далеко от среднего', mode: 'самое частое значение',
    skew: 'перекос распределения', kurtosis: 'тяжесть хвостов', gini: 'неравенство по выборке',
    entropy: 'энтропия выбора', softmax: 'веса в вероятности', normalize: 'привести сумму к единице',
    ewma: 'скользящее среднее', erf: 'функция ошибок', normalCdf: 'нормальное распределение',
    normalQuantile: 'процентиль в значение',

    hashSeed: 'зерно из строки', mulberry32: 'генератор чисел по зерну', xorshift32: 'быстрый генератор',
    splitmix32: 'генератор для второго потока', pick: 'случайный элемент', weightedPick: 'выбор по весам',
    shuffle: 'перемешать', sampleN: 'выбрать несколько без повторов', chance: 'бросок с вероятностью',
    normalSample: 'нормальная случайность', lognormalSample: 'логнормальная случайность',
    poissonSample: 'сколько событий за год', binomialSample: 'сколько удач из попыток',
    geometricSample: 'сколько лет до события', triangular: 'оценка «мин-скорее-макс»',

    compound: 'сложный процент', npv: 'приведённая стоимость', irr: 'доходность вложения',
    annuity: 'годовой платёж по кредиту', amortLeft: 'остаток долга', payoffYears: 'за сколько лет выплатить',
    realRate: 'ставка за вычетом инфляции', inflate: 'цена через годы', deflate: 'цена в прежних деньгах',
    pppConvert: 'перевод валют по ППС', progressiveTax: 'налог по шкале', netPay: 'зарплата на руки',
    savingsYears: 'сколько копить до цели', budgetNormalize: 'свести бюджет к 100%', roundNice: 'круглая цена',

    clamp: 'удержать в границах', lerp: 'плавный переход', invLerp: 'доля между границами',
    remap: 'перенести в другой диапазон', smoothstep: 'сглаженный переход', easeInOut: 'мягкое начало и конец',
    logistic: 'логистическая кривая', gompertz: 'кривая старения', hill: 'кривая насыщения',
    catmull: 'гладкая кривая по точкам',

    binarySearch: 'двоичный поиск', lowerBound: 'первая позиция не меньше', cumsum: 'накопленные суммы',
    argmax: 'индекс максимума', argmin: 'индекс минимума', topK: 'лучшие k', groupBy: 'сгруппировать',
    countBy: 'посчитать по ключу', uniq: 'без повторов', chunk: 'разбить на куски', zip: 'пары из двух списков',
    rotate: 'сдвиг по кругу',

    plural: 'год, года, лет', fmtNum: 'число с пробелами', fmtShort: 'тыс и млн', initials: 'инициалы',
    levenshtein: 'похожесть слов', slug: 'строка в адрес', truncate: 'обрезать с многоточием',
    joinList: 'перечисление через и',

    ageAt: 'возраст в году', decade: 'десятилетие', qxToHazard: 'вероятность в интенсивность',
    hazardToQx: 'интенсивность в вероятность', logit: 'логит', expit: 'обратный логит',
    brass: 'сдвиг таблицы смертности', lifeExp: 'ожидаемая продолжительность жизни',
    survivalTo: 'доля доживших', smoothSeries: 'сгладить ряд',

    utility: 'полезность решения', softmaxPick: 'выбор по полезности', epsilonGreedy: 'иногда пробовать новое',
    ucb1: 'баланс опыта и риска', elo: 'рейтинг после встречи', bayes: 'обновить веру по факту',
    markovStep: 'переход между состояниями', hysteresis: 'решение без дрожания',
    cooldown: 'не чаще раза в N лет', riskScore: 'итоговый риск'
  };

  var IDS = Object.keys(DOC);

  window.IN8B = window.IN8B || {};
  window.IN8B.algo = A;
  A.doc = DOC;
  A.ids = IDS;
  A.count = IDS.length;
  /* самопроверка списка: имя без функции — ошибка сборки, а не загадка в игре */
  A.missing = IDS.filter(function (k) { return typeof A[k] !== 'function'; });
})();
