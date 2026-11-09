/* ============================================================
   1 ИЗ 8 МИЛЛИАРДОВ — 250 алгоритмов.
   ------------------------------------------------------------
   Маленькая библиотека, на которой стоит вся остальная игра:
   статистика, случайность с зерном, деньги и проценты, кривые,
   поиск, текст, демография и принятие решений.

   Каждая функция чистая: одни и те же входы дают один и тот же
   результат, глобального состояния нет. Внизу файла — словарь
   DOC: все имена с описанием на русском, по нему тесты проверяют,
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


  /* ======================================================================
     ВТОРАЯ СОТНЯ С ПОЛОВИНОЙ (v1.8): ещё 150 алгоритмов.
     Те же правила: чистые функции, никакого состояния, всё считается
     из входных данных. Ниже — связи и регрессия, ещё пять генераторов
     случайности, деньги на каждый день, кривые и волны, списки, текст
     по-русски, демография, здоровье и принятие решений.
     ====================================================================== */

  /* --------------------- 8. связи и разброс (25) ---------------------- */

  A.harmonicMean = function (a) {
    var s = 0, n = 0;
    for (var i = 0; i < a.length; i++) if (a[i] > 0) { s += 1 / a[i]; n++; }
    return n ? n / s : 0;
  };
  A.geoMean = function (a) {
    var s = 0, n = 0;
    for (var i = 0; i < a.length; i++) if (a[i] > 0) { s += Math.log(a[i]); n++; }
    return n ? Math.exp(s / n) : 0;
  };
  A.rms = function (a) {
    var s = 0;
    for (var i = 0; i < a.length; i++) s += a[i] * a[i];
    return a.length ? Math.sqrt(s / a.length) : 0;
  };
  A.covariance = function (x, y) {
    var n = Math.min(x.length, y.length);
    if (n < 2) return 0;
    var mx = A.mean(x.slice(0, n)), my = A.mean(y.slice(0, n)), s = 0;
    for (var i = 0; i < n; i++) s += (x[i] - mx) * (y[i] - my);
    return s / (n - 1);
  };
  A.correlation = function (x, y) {
    var sx = A.stdev(x), sy = A.stdev(y);
    return sx && sy ? A.clamp(A.covariance(x, y) / (sx * sy), -1, 1) : 0;
  };
  A.linregSlope = function (x, y) { var v = A.variance(x); return v ? A.covariance(x, y) / v : 0; };
  A.linregIntercept = function (x, y) { return A.mean(y) - A.linregSlope(x, y) * A.mean(x); };
  A.linregPredict = function (x, y, at) { return A.linregIntercept(x, y) + A.linregSlope(x, y) * at; };
  A.rSquared = function (x, y) { var r = A.correlation(x, y); return r * r; };
  A.trimmedMean = function (a, p) {
    if (!a.length) return 0;
    var s = a.slice().sort(function (u, v) { return u - v; });
    var k = Math.floor(s.length * A.clamp(p === undefined ? 0.1 : p, 0, 0.45));
    var cut = s.slice(k, s.length - k);
    return cut.length ? A.mean(cut) : A.mean(s);
  };
  A.winsorize = function (a, p) {
    if (!a.length) return [];
    var lo = A.percentile(a, A.clamp(p === undefined ? 0.05 : p, 0, 0.5));
    var hi = A.percentile(a, 1 - A.clamp(p === undefined ? 0.05 : p, 0, 0.5));
    return a.map(function (v) { return A.clamp(v, lo, hi); });
  };
  A.iqr = function (a) { return A.percentile(a, 0.75) - A.percentile(a, 0.25); };
  A.spread = function (a) {
    if (!a.length) return 0;
    var lo = a[0], hi = a[0];
    for (var i = 1; i < a.length; i++) { if (a[i] < lo) lo = a[i]; if (a[i] > hi) hi = a[i]; }
    return hi - lo;
  };
  A.cv = function (a) { var m = A.mean(a); return m ? A.stdev(a) / Math.abs(m) : 0; };
  A.sem = function (a) { return a.length ? A.stdev(a) / Math.sqrt(a.length) : 0; };
  A.ci95 = function (a) { return 1.96 * A.sem(a); };
  A.weightedMean = function (a, w) {
    var s = 0, sw = 0;
    for (var i = 0; i < a.length; i++) { var k = w && w[i] !== undefined ? w[i] : 1; s += a[i] * k; sw += k; }
    return sw ? s / sw : 0;
  };
  A.rankOf = function (a, v) {
    if (!a.length) return 0;
    var less = 0, eq = 0;
    for (var i = 0; i < a.length; i++) { if (a[i] < v) less++; else if (a[i] === v) eq++; }
    return (less + eq / 2) / a.length;
  };
  A.spearman = function (x, y) {
    var n = Math.min(x.length, y.length);
    if (n < 2) return 0;
    var rx = [], ry = [];
    for (var i = 0; i < n; i++) { rx.push(A.rankOf(x.slice(0, n), x[i])); ry.push(A.rankOf(y.slice(0, n), y[i])); }
    return A.correlation(rx, ry);
  };
  A.histogram = function (a, bins, lo, hi) {
    bins = Math.max(1, Math.floor(bins || 10));
    if (lo === undefined) lo = Math.min.apply(null, a.length ? a : [0]);
    if (hi === undefined) hi = Math.max.apply(null, a.length ? a : [1]);
    var out = [], i;
    for (i = 0; i < bins; i++) out.push(0);
    if (hi <= lo) { out[0] = a.length; return out; }
    for (i = 0; i < a.length; i++) {
      var k = Math.floor((a[i] - lo) / (hi - lo) * bins);
      out[A.clamp(k, 0, bins - 1)]++;
    }
    return out;
  };
  A.bucket = function (v, edges) {
    for (var i = 0; i < edges.length; i++) if (v < edges[i]) return i;
    return edges.length;
  };
  A.theil = function (a) {
    var m = A.mean(a);
    if (m <= 0) return 0;
    var s = 0, n = 0;
    for (var i = 0; i < a.length; i++) if (a[i] > 0) { s += (a[i] / m) * Math.log(a[i] / m); n++; }
    return n ? s / n : 0;
  };
  A.palma = function (a) {
    if (a.length < 10) return 1;
    var s = a.slice().sort(function (u, v) { return u - v; });
    var bot = A.sum(s.slice(0, Math.floor(s.length * 0.4)));
    var top = A.sum(s.slice(Math.ceil(s.length * 0.9)));
    return bot > 0 ? top / bot : Infinity;
  };
  A.atkinson = function (a, eps) {
    eps = eps === undefined ? 0.5 : eps;
    var m = A.mean(a);
    if (m <= 0) return 0;
    var pos = a.filter(function (v) { return v > 0; });
    if (!pos.length) return 0;
    if (eps === 1) return A.clamp(1 - A.geoMean(pos) / m, 0, 1);
    var s = 0;
    for (var i = 0; i < pos.length; i++) s += Math.pow(pos[i] / m, 1 - eps);
    return A.clamp(1 - Math.pow(s / pos.length, 1 / (1 - eps)), 0, 1);
  };
  A.herfindahl = function (a) {
    var t = A.sum(a);
    if (t <= 0) return 0;
    var s = 0;
    for (var i = 0; i < a.length; i++) s += (a[i] / t) * (a[i] / t);
    return s;
  };

  /* ------------------- 9. ещё случайность (18) ------------------------ */

  A.pcg32 = function (seed) {
    var s = (seed >>> 0) || 1;
    return function () {
      s = (Math.imul(s, 747796405) + 2891336453) >>> 0;
      var w = Math.imul(s ^ (s >>> ((s >>> 28) + 4)), 277803737) >>> 0;
      return ((w ^ (w >>> 22)) >>> 0) / 4294967296;
    };
  };
  A.lcg32 = function (seed) {
    var s = (seed >>> 0) || 1;
    return function () { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
  };
  A.jsf32 = function (seed) {
    var a = 0xf1ea5eed, b = (seed >>> 0) || 1, c = b, d = b;
    return function () {
      var t = (a - ((b << 27) | (b >>> 5))) >>> 0;
      a = (b ^ ((c << 17) | (c >>> 15))) >>> 0;
      b = (c + d) >>> 0;
      c = (d + t) >>> 0;
      d = (t + a) >>> 0;
      return d / 4294967296;
    };
  };
  A.randInt = function (rnd, lo, hi) { return lo + Math.floor(rnd() * (hi - lo + 1)); };
  A.randRange = function (rnd, lo, hi) { return lo + rnd() * (hi - lo); };
  A.randSign = function (rnd) { return rnd() < 0.5 ? -1 : 1; };
  A.bernoulli = function (rnd, p) { return rnd() < A.clamp(p, 0, 1) ? 1 : 0; };
  A.exponentialSample = function (rnd, rate) {
    var r = rate > 0 ? rate : 1;
    return -Math.log(1 - rnd() * 0.999999) / r;
  };
  A.gammaSample = function (rnd, shape, scale) {
    shape = Math.max(0.05, shape || 1); scale = scale === undefined ? 1 : scale;
    if (shape < 1) return A.gammaSample(rnd, shape + 1, scale) * Math.pow(rnd() + 1e-9, 1 / shape);
    var d = shape - 1 / 3, c = 1 / Math.sqrt(9 * d);
    for (var i = 0; i < 100; i++) {
      var x = A.normalSample(rnd, 0, 1), v = 1 + c * x;
      if (v <= 0) continue;
      v = v * v * v;
      var u = rnd();
      if (u < 1 - 0.0331 * x * x * x * x) return d * v * scale;
      if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v * scale;
    }
    return d * scale;
  };
  A.betaSample = function (rnd, a, b) {
    var x = A.gammaSample(rnd, a, 1), y = A.gammaSample(rnd, b, 1);
    return x + y > 0 ? x / (x + y) : 0.5;
  };
  A.paretoSample = function (rnd, xm, alpha) {
    var al = alpha > 0 ? alpha : 1.5;
    return (xm || 1) / Math.pow(1 - rnd() * 0.999999, 1 / al);
  };
  A.weibullSample = function (rnd, shape, scale) {
    var k = shape > 0 ? shape : 1;
    return (scale || 1) * Math.pow(-Math.log(1 - rnd() * 0.999999), 1 / k);
  };
  A.multinomial = function (rnd, weights, n) {
    var out = weights.map(function () { return 0; });
    var total = A.sum(weights);
    if (total <= 0) return out;
    for (var i = 0; i < n; i++) {
      var r = rnd() * total, acc = 0;
      for (var k = 0; k < weights.length; k++) { acc += weights[k]; if (r <= acc) { out[k]++; break; } }
    }
    return out;
  };
  A.reservoirSample = function (rnd, list, k) {
    var res = [];
    for (var i = 0; i < list.length; i++) {
      if (res.length < k) res.push(list[i]);
      else { var j = Math.floor(rnd() * (i + 1)); if (j < k) res[j] = list[i]; }
    }
    return res;
  };
  A.pickExcept = function (rnd, list, skip) {
    var pool = list.filter(function (v) { return v !== skip; });
    return pool.length ? pool[Math.floor(rnd() * pool.length) % pool.length] : skip;
  };
  A.dice = function (rnd, sides, count) {
    var s = 0;
    for (var i = 0; i < (count || 1); i++) s += 1 + Math.floor(rnd() * (sides || 6));
    return s;
  };
  A.hashCombine = function (a, b) {
    var h = (a >>> 0) ^ (Math.imul((b >>> 0) + 0x9e3779b9, 2654435761) >>> 0);
    h = Math.imul(h ^ (h >>> 16), 2246822507) >>> 0;
    return (h ^ (h >>> 13)) >>> 0;
  };
  A.jitter = function (rnd, v, frac) { return v * (1 + (rnd() * 2 - 1) * (frac === undefined ? 0.1 : frac)); };

  /* --------------------- 10. деньги на каждый день (22) --------------- */

  A.futureValue = function (pv, rate, years) { return pv * Math.pow(1 + rate, years); };
  A.presentValue = function (fv, rate, years) { return fv / Math.pow(1 + rate, years); };
  A.rule72 = function (rate) { return rate > 0 ? 72 / (rate * 100) : Infinity; };
  A.cagr = function (from, to, years) {
    if (from <= 0 || years <= 0) return 0;
    return Math.pow(to / from, 1 / years) - 1;
  };
  A.payback = function (cost, perYear) { return perYear > 0 ? cost / perYear : Infinity; };
  A.breakEven = function (fixed, price, unitCost) {
    var m = price - unitCost;
    return m > 0 ? fixed / m : Infinity;
  };
  A.markup = function (cost, pct) { return cost * (1 + pct); };
  A.margin = function (price, cost) { return price > 0 ? (price - cost) / price : 0; };
  A.discountPrice = function (price, pct) { return price * (1 - A.clamp(pct, 0, 1)); };
  A.vatAdd = function (net, rate) { return net * (1 + rate); };
  A.vatExtract = function (gross, rate) { return gross * rate / (1 + rate); };
  A.tip = function (bill, pct) { return bill * (pct === undefined ? 0.1 : pct); };
  A.splitBill = function (total, people) { return people > 0 ? total / people : total; };
  A.installment = function (price, months, monthRate) {
    if (months <= 0) return price;
    if (!monthRate) return price / months;
    var q = Math.pow(1 + monthRate, months);
    return price * monthRate * q / (q - 1);
  };
  A.overdraft = function (amount, dailyRate, days) { return amount * dailyRate * days; };
  A.minPayment = function (balance, pct, floor) {
    return Math.min(balance, Math.max(balance * (pct || 0.05), floor || 0));
  };
  A.debtRatio = function (debt, income) { return income > 0 ? debt / income : Infinity; };
  A.savingsRate = function (income, spend) { return income > 0 ? A.clamp((income - spend) / income, -1, 1) : 0; };
  A.emergencyFund = function (monthSpend, months) { return monthSpend * (months || 6); };
  A.retirementNeed = function (yearSpend, years, realRate) {
    if (!realRate) return yearSpend * years;
    return yearSpend * (1 - Math.pow(1 + realRate, -years)) / realRate;
  };
  A.safeWithdraw = function (pot, rate) { return pot * (rate === undefined ? 0.04 : rate); };
  A.effectiveRate = function (nominal, periods) {
    var p = Math.max(1, periods || 1);
    return Math.pow(1 + nominal / p, p) - 1;
  };

  /* ------------------- 11. кривые, волны и сглаживание (18) ----------- */

  A.smootherstep = function (t) { t = A.clamp(t, 0, 1); return t * t * t * (t * (t * 6 - 15) + 10); };
  A.easeIn = function (t, p) { return Math.pow(A.clamp(t, 0, 1), p === undefined ? 2 : p); };
  A.easeOut = function (t, p) { return 1 - Math.pow(1 - A.clamp(t, 0, 1), p === undefined ? 2 : p); };
  A.bezier2 = function (a, b, c, t) {
    var u = 1 - t;
    return u * u * a + 2 * u * t * b + t * t * c;
  };
  A.bezier3 = function (a, b, c, d, t) {
    var u = 1 - t;
    return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d;
  };
  A.expDecay = function (v0, rate, t) { return v0 * Math.exp(-rate * t); };
  A.halfLife = function (v0, half, t) { return half > 0 ? v0 * Math.pow(0.5, t / half) : v0; };
  A.saturate = function (v, cap) { return cap > 0 ? cap * v / (cap + Math.abs(v)) : v; };
  A.pulse = function (t, period, width) {
    if (period <= 0) return 0;
    var ph = ((t % period) + period) % period;
    return ph < period * A.clamp(width === undefined ? 0.5 : width, 0, 1) ? 1 : 0;
  };
  A.triangleWave = function (t, period) {
    if (period <= 0) return 0;
    var ph = ((t % period) + period) % period / period;
    return ph < 0.5 ? ph * 2 : 2 - ph * 2;
  };
  A.sawWave = function (t, period) {
    if (period <= 0) return 0;
    return ((t % period) + period) % period / period;
  };
  A.sineWave = function (t, period, amp) {
    if (period <= 0) return 0;
    return (amp === undefined ? 1 : amp) * Math.sin(2 * Math.PI * t / period);
  };
  A.noise1d = function (x, seed) {
    var i = Math.floor(x), f = x - i;
    function h(n) {
      var s = Math.sin(n * 127.1 + (seed || 0) * 311.7) * 43758.5453;
      return s - Math.floor(s);
    }
    return A.lerp(h(i), h(i + 1), A.smoothstep(f));
  };
  A.pingpong = function (t, len) {
    if (len <= 0) return 0;
    var p = ((t % (len * 2)) + len * 2) % (len * 2);
    return p < len ? p : len * 2 - p;
  };
  A.wrapAround = function (v, lo, hi) {
    var span = hi - lo;
    if (span <= 0) return lo;
    return lo + (((v - lo) % span) + span) % span;
  };
  A.approach = function (cur, target, step) {
    if (cur < target) return Math.min(target, cur + Math.abs(step));
    return Math.max(target, cur - Math.abs(step));
  };
  A.damp = function (cur, target, lambda, dt) {
    return target + (cur - target) * Math.exp(-Math.abs(lambda) * (dt === undefined ? 1 : dt));
  };
  A.deadzone = function (v, dz) {
    if (Math.abs(v) <= dz) return 0;
    return v > 0 ? v - dz : v + dz;
  };

  /* ---------------------- 12. списки и поиск (16) --------------------- */

  A.upperBound = function (a, v) {
    var lo = 0, hi = a.length;
    while (lo < hi) { var mid = (lo + hi) >> 1; if (a[mid] <= v) lo = mid + 1; else hi = mid; }
    return lo;
  };
  A.insertSorted = function (a, v) { var out = a.slice(); out.splice(A.upperBound(a, v), 0, v); return out; };
  A.minBy = function (a, f) {
    var best = null, bv = Infinity;
    for (var i = 0; i < a.length; i++) { var v = f(a[i]); if (v < bv) { bv = v; best = a[i]; } }
    return best;
  };
  A.maxBy = function (a, f) {
    var best = null, bv = -Infinity;
    for (var i = 0; i < a.length; i++) { var v = f(a[i]); if (v > bv) { bv = v; best = a[i]; } }
    return best;
  };
  A.sumBy = function (a, f) { var s = 0; for (var i = 0; i < a.length; i++) s += f(a[i]); return s; };
  A.meanBy = function (a, f) { return a.length ? A.sumBy(a, f) / a.length : 0; };
  A.partition = function (a, f) {
    var yes = [], no = [];
    for (var i = 0; i < a.length; i++) (f(a[i]) ? yes : no).push(a[i]);
    return [yes, no];
  };
  A.flatten = function (a) {
    var out = [];
    for (var i = 0; i < a.length; i++) {
      if (Object.prototype.toString.call(a[i]) === '[object Array]') out = out.concat(A.flatten(a[i]));
      else out.push(a[i]);
    }
    return out;
  };
  A.seq = function (from, to, step) {
    var s = step || 1, out = [];
    if (s === 0) return out;
    for (var v = from; s > 0 ? v < to : v > to; v += s) out.push(v);
    return out;
  };
  A.repeatN = function (v, n) { var out = []; for (var i = 0; i < n; i++) out.push(v); return out; };
  A.intersect = function (a, b) { return a.filter(function (v) { return b.indexOf(v) >= 0; }); };
  A.difference = function (a, b) { return a.filter(function (v) { return b.indexOf(v) < 0; }); };
  A.windowed = function (a, size) {
    var out = [];
    for (var i = 0; i + size <= a.length; i++) out.push(a.slice(i, i + size));
    return out;
  };
  A.pairwise = function (a) { return A.windowed(a, 2); };
  A.sortBy = function (a, f) {
    return a.slice().sort(function (u, v) { var x = f(u), y = f(v); return x < y ? -1 : x > y ? 1 : 0; });
  };
  A.takeWhile = function (a, f) {
    var out = [];
    for (var i = 0; i < a.length && f(a[i]); i++) out.push(a[i]);
    return out;
  };

  /* -------------------------- 13. слова (12) -------------------------- */

  A.capitalize = function (s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; };
  A.titleCase = function (s) {
    return String(s || '').split(' ').map(function (w) { return A.capitalize(w); }).join(' ');
  };
  A.padLeft = function (s, len, ch) {
    s = String(s); ch = ch || ' ';
    while (s.length < len) s = ch + s;
    return s;
  };
  A.padNum = function (n, len) { return A.padLeft(Math.floor(n), len, '0'); };
  A.ordinal = function (n) { return Math.floor(n) + '-й'; };
  A.roman = function (n) {
    n = Math.floor(n);
    if (n <= 0 || n >= 4000) return String(n);
    var v = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
    var s = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];
    var out = '';
    for (var i = 0; i < v.length; i++) while (n >= v[i]) { out += s[i]; n -= v[i]; }
    return out;
  };
  A.translit = function (s) {
    var map = {
      'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e', 'ж': 'zh', 'з': 'z',
      'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r',
      'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'c', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
      'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
    };
    return String(s || '').toLowerCase().split('').map(function (ch) {
      return map[ch] !== undefined ? map[ch] : ch;
    }).join('');
  };
  A.wordCount = function (s) {
    var m = String(s || '').trim();
    return m ? m.split(/\s+/).length : 0;
  };
  A.ellipsisMiddle = function (s, len) {
    s = String(s || '');
    if (s.length <= len || len < 4) return s;
    var head = Math.ceil((len - 1) / 2), tail = Math.floor((len - 1) / 2);
    return s.slice(0, head) + '…' + s.slice(s.length - tail);
  };
  A.spellNumber = function (n) {
    n = Math.floor(Math.abs(n || 0));
    if (n === 0) return 'ноль';
    var ones = ['', 'один', 'два', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять',
      'десять', 'одиннадцать', 'двенадцать', 'тринадцать', 'четырнадцать', 'пятнадцать',
      'шестнадцать', 'семнадцать', 'восемнадцать', 'девятнадцать'];
    var tens = ['', '', 'двадцать', 'тридцать', 'сорок', 'пятьдесят', 'шестьдесят', 'семьдесят', 'восемьдесят', 'девяносто'];
    var hund = ['', 'сто', 'двести', 'триста', 'четыреста', 'пятьсот', 'шестьсот', 'семьсот', 'восемьсот', 'девятьсот'];
    function trio(v, fem) {
      var out = [];
      if (v >= 100) { out.push(hund[Math.floor(v / 100)]); v %= 100; }
      if (v >= 20) { out.push(tens[Math.floor(v / 10)]); v %= 10; }
      if (v > 0) {
        if (fem && v === 1) out.push('одна');
        else if (fem && v === 2) out.push('две');
        else out.push(ones[v]);
      }
      return out.join(' ');
    }
    var parts = [];
    var mil = Math.floor(n / 1000000) % 1000, th = Math.floor(n / 1000) % 1000, rest = n % 1000;
    if (Math.floor(n / 1000000000) > 0) parts.push(trio(Math.floor(n / 1000000000)) + ' ' + A.plural(Math.floor(n / 1000000000), 'миллиард', 'миллиарда', 'миллиардов'));
    if (mil) parts.push(trio(mil) + ' ' + A.plural(mil, 'миллион', 'миллиона', 'миллионов'));
    if (th) parts.push(trio(th, true) + ' ' + A.plural(th, 'тысяча', 'тысячи', 'тысяч'));
    if (rest) parts.push(trio(rest));
    return parts.join(' ').replace(/\s+/g, ' ').trim();
  };
  A.fmtPercent = function (v, digits) { return (v * 100).toFixed(digits === undefined ? 1 : digits) + '%'; };
  A.fmtRange = function (lo, hi) { return A.fmtNum(Math.round(lo)) + '–' + A.fmtNum(Math.round(hi)); };

  /* ------------------- 14. люди, годы и тело (20) --------------------- */

  A.crudeBirthRate = function (births, pop) { return pop > 0 ? births / pop * 1000 : 0; };
  A.crudeDeathRate = function (deaths, pop) { return pop > 0 ? deaths / pop * 1000 : 0; };
  A.naturalGrowth = function (cbr, cdr) { return (cbr - cdr) / 10; };
  A.doublingTime = function (growthPct) { return growthPct > 0 ? 70 / growthPct : Infinity; };
  A.popAtYear = function (pop0, growthPct, years) { return pop0 * Math.pow(1 + growthPct / 100, years); };
  A.dependencyRatio = function (young, old, working) { return working > 0 ? (young + old) / working * 100 : 0; };
  A.infantFromU5 = function (u5) { return Math.min(u5 * 0.74, Math.max(0, u5 - 0.3)); };
  A.u5FromInfant = function (imr) { return imr / 0.74; };
  A.yearsLost = function (ageAtDeath, expectancy) { return Math.max(0, expectancy - ageAtDeath); };
  A.healthIndex = function (le) { return A.clamp((le - 20) / 65, 0, 1); };
  A.eduIndex = function (meanYears, expectedYears) {
    return A.clamp((A.clamp(meanYears / 15, 0, 1) + A.clamp((expectedYears === undefined ? meanYears * 1.4 : expectedYears) / 18, 0, 1)) / 2, 0, 1);
  };
  A.incomeIndex = function (gni) {
    if (gni <= 100) return 0;
    return A.clamp((Math.log(gni) - Math.log(100)) / (Math.log(75000) - Math.log(100)), 0, 1);
  };
  A.hdi = function (le, meanYears, gni) {
    return Math.pow(A.healthIndex(le) * A.eduIndex(meanYears) * A.incomeIndex(gni), 1 / 3);
  };
  A.inequalityAdjust = function (index, gini) { return index * (1 - A.clamp(gini, 0, 100) / 100); };
  A.migrationRate = function (inflow, outflow, pop) { return pop > 0 ? (inflow - outflow) / pop * 1000 : 0; };
  A.urbanAtYear = function (urbanPct, ratePct, years) {
    var u = A.clamp(urbanPct / 100, 0.001, 0.999);
    var odds = u / (1 - u) * Math.exp(ratePct / 100 * years);
    return A.clamp(odds / (1 + odds) * 100, 0, 100);
  };
  A.cohortSurvival = function (qxList) {
    var s = 1;
    for (var i = 0; i < qxList.length; i++) s *= 1 - A.clamp(qxList[i], 0, 1);
    return s;
  };
  A.bmi = function (kg, cm) { return cm > 0 ? kg / ((cm / 100) * (cm / 100)) : 0; };
  A.bmr = function (kg, cm, age, sex) {
    return 10 * kg + 6.25 * cm - 5 * age + (sex === 'f' ? -161 : 5);
  };
  A.caloriesNeed = function (bmrValue, activity) { return bmrValue * (activity === undefined ? 1.4 : activity); };

  /* ------------- 15. решения, привычки и окружающий мир (19) ---------- */

  A.kelly = function (p, odds) {
    var o = odds > 0 ? odds : 1;
    return A.clamp((p * (o + 1) - 1) / o, 0, 1);
  };
  A.expectedValue = function (values, probs) {
    var s = 0;
    for (var i = 0; i < values.length; i++) s += values[i] * (probs[i] || 0);
    return s;
  };
  A.regret = function (got, best) { return Math.max(0, best - got); };
  A.riskAdjusted = function (gain, variance, aversion) {
    return gain - (aversion === undefined ? 0.5 : aversion) * variance;
  };
  A.thresholdDecide = function (score, threshold, inertia) {
    return score > threshold + (inertia || 0) ? 1 : score < threshold - (inertia || 0) ? -1 : 0;
  };
  A.learningCurve = function (reps, rate) {
    return 1 - Math.exp(-(rate === undefined ? 0.12 : rate) * Math.max(0, reps));
  };
  A.forgetting = function (strength, days) {
    return Math.exp(-Math.max(0, days) / Math.max(0.1, strength));
  };
  A.habitUpdate = function (level, didIt, speed) {
    var k = speed === undefined ? 0.2 : speed;
    return A.clamp(level + (didIt ? k * (1 - level) : -k * level), 0, 1);
  };
  A.fatigue = function (hoursWorked, sleepHours) {
    return A.clamp((hoursWorked / 8) * 0.5 + (8 - A.clamp(sleepHours, 0, 12)) * 0.12, 0, 2);
  };
  A.burnoutRisk = function (load, control, support) {
    return A.clamp(load * 0.6 - control * 0.25 - support * 0.2 + 0.1, 0, 1);
  };
  A.trustUpdate = function (trust, kept, weight) {
    var w = weight === undefined ? 0.25 : weight;
    return A.clamp(trust + (kept ? w * (1 - trust) : -w * 1.5 * trust), 0, 1);
  };
  A.moraleUpdate = function (morale, events) {
    var s = morale;
    for (var i = 0; i < events.length; i++) s = A.clamp(s + events[i] * (1 - Math.abs(s) * 0.4), -1, 1);
    return s;
  };
  A.matchScore = function (a, b, weights) {
    var s = 0, w = 0;
    for (var k in a) {
      if (!Object.prototype.hasOwnProperty.call(a, k) || b[k] === undefined) continue;
      var kw = weights && weights[k] !== undefined ? weights[k] : 1;
      s += kw * (1 - Math.abs(a[k] - b[k]));
      w += kw;
    }
    return w ? A.clamp(s / w, 0, 1) : 0;
  };
  A.degToRad = function (d) { return d * Math.PI / 180; };
  A.radToDeg = function (r) { return r * 180 / Math.PI; };
  A.haversine = function (lat1, lon1, lat2, lon2) {
    var R = 6371;
    var dLat = A.degToRad(lat2 - lat1), dLon = A.degToRad(lon2 - lon1);
    var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(A.degToRad(lat1)) * Math.cos(A.degToRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
  };
  A.heatIndex = function (tempC, humidity) {
    var h = A.clamp(humidity, 0, 100);
    return tempC + 0.33 * (h / 100 * 6.105 * Math.exp(17.27 * tempC / (237.7 + tempC))) - 4;
  };
  A.windChill = function (tempC, windKmh) {
    if (tempC > 10 || windKmh < 4.8) return tempC;
    var v = Math.pow(windKmh, 0.16);
    return 13.12 + 0.6215 * tempC - 11.37 * v + 0.3965 * tempC * v;
  };
  A.sleepDebt = function (hoursList, need) {
    var n = need === undefined ? 8 : need, s = 0;
    for (var i = 0; i < hoursList.length; i++) s += Math.max(0, n - hoursList[i]);
    return s;
  };

  /* ============ словарь: двести пятьдесят имён и смыслов ============== */
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
    cooldown: 'не чаще раза в N лет', riskScore: 'итоговый риск',
    harmonicMean: 'среднее гармоническое', geoMean: 'среднее геометрическое', rms: 'среднеквадратичное',
    covariance: 'ковариация двух рядов', correlation: 'связь двух рядов', linregSlope: 'наклон прямой',
    linregIntercept: 'сдвиг прямой', linregPredict: 'предсказание по прямой', rSquared: 'качество прямой',
    trimmedMean: 'среднее без краёв', winsorize: 'подрезать выбросы', iqr: 'межквартильный размах',
    spread: 'разброс от мин до макс', cv: 'относительный разброс', sem: 'ошибка среднего',
    ci95: 'доверительный интервал', weightedMean: 'среднее с весами', rankOf: 'место в ряду',
    spearman: 'связь по рангам', histogram: 'гистограмма', bucket: 'номер корзины',
    theil: 'неравенство по Тейлу', palma: 'отношение Пальмы', atkinson: 'неравенство по Аткинсону',
    herfindahl: 'концентрация рынка',

    pcg32: 'генератор PCG', lcg32: 'линейный генератор', jsf32: 'генератор JSF',
    randInt: 'целое в диапазоне', randRange: 'число в диапазоне', randSign: 'плюс или минус',
    bernoulli: 'ноль или один', exponentialSample: 'сколько ждать до события',
    gammaSample: 'гамма-случайность', betaSample: 'доля от нуля до единицы',
    paretoSample: 'правило Парето', weibullSample: 'срок службы вещи',
    multinomial: 'разложить попытки по корзинам', reservoirSample: 'выбрать из потока',
    pickExcept: 'любой, кроме этого', dice: 'бросок костей', hashCombine: 'смешать два зерна',
    jitter: 'немного сдвинуть значение',

    futureValue: 'сколько станет через годы', presentValue: 'сколько это стоит сегодня',
    rule72: 'правило 72: за сколько удвоится', cagr: 'среднегодовой рост', payback: 'за сколько окупится',
    breakEven: 'точка безубыточности', markup: 'цена с наценкой', margin: 'маржа',
    discountPrice: 'цена со скидкой', vatAdd: 'цена с налогом', vatExtract: 'налог внутри цены',
    tip: 'чаевые', splitBill: 'счёт на всех', installment: 'платёж по рассрочке',
    overdraft: 'переплата за овердрафт', minPayment: 'минимальный платёж', debtRatio: 'долг к доходу',
    savingsRate: 'норма сбережений', emergencyFund: 'подушка безопасности',
    retirementNeed: 'сколько нужно к пенсии', safeWithdraw: 'сколько можно снимать в год',
    effectiveRate: 'ставка с учётом капитализации',

    smootherstep: 'очень мягкий переход', easeIn: 'медленное начало', easeOut: 'мягкое окончание',
    bezier2: 'кривая по трём точкам', bezier3: 'кривая по четырём точкам', expDecay: 'затухание',
    halfLife: 'период полураспада', saturate: 'насыщение с потолком', pulse: 'импульс',
    triangleWave: 'треугольная волна', sawWave: 'пилообразная волна', sineWave: 'синусоида',
    noise1d: 'плавный шум', pingpong: 'туда и обратно', wrapAround: 'закольцевать значение',
    approach: 'шаг к цели', damp: 'плавно подтянуть к цели', deadzone: 'мёртвая зона',

    upperBound: 'первая позиция больше', insertSorted: 'вставить по порядку', minBy: 'наименьший по признаку',
    maxBy: 'наибольший по признаку', sumBy: 'сумма по признаку', meanBy: 'среднее по признаку',
    partition: 'разделить надвое', flatten: 'разгладить вложенность', seq: 'ряд чисел',
    repeatN: 'повторить n раз', intersect: 'общие элементы', difference: 'что есть только здесь',
    windowed: 'скользящее окно', pairwise: 'соседние пары', sortBy: 'сортировка по признаку',
    takeWhile: 'брать, пока верно',

    capitalize: 'с большой буквы', titleCase: 'каждое слово с большой', padLeft: 'дополнить слева',
    padNum: 'число с нулями', ordinal: 'порядковый номер', roman: 'римские цифры',
    translit: 'кириллица латиницей', wordCount: 'сколько слов', ellipsisMiddle: 'сократить середину',
    spellNumber: 'число прописью', fmtPercent: 'доля в процентах', fmtRange: 'диапазон чисел',

    crudeBirthRate: 'рождаемость на тысячу', crudeDeathRate: 'смертность на тысячу',
    naturalGrowth: 'естественный прирост', doublingTime: 'за сколько удвоится население',
    popAtYear: 'население через годы', dependencyRatio: 'нагрузка на работающих',
    infantFromU5: 'младенческая из детской смертности', u5FromInfant: 'детская из младенческой',
    yearsLost: 'сколько лет жизни потеряно', healthIndex: 'индекс здоровья',
    eduIndex: 'индекс образования', incomeIndex: 'индекс дохода', hdi: 'индекс развития человека',
    inequalityAdjust: 'поправка на неравенство', migrationRate: 'сальдо миграции',
    urbanAtYear: 'городское население через годы', cohortSurvival: 'доля доживших по когорте',
    bmi: 'индекс массы тела', bmr: 'основной обмен', caloriesNeed: 'сколько калорий нужно',

    kelly: 'ставка по Келли', expectedValue: 'ожидаемый выигрыш', regret: 'сожаление о выборе',
    riskAdjusted: 'выигрыш с поправкой на риск', thresholdDecide: 'решение с порогом',
    learningCurve: 'кривая обучения', forgetting: 'кривая забывания', habitUpdate: 'привычка крепнет или тает',
    fatigue: 'усталость за день', burnoutRisk: 'риск выгорания', trustUpdate: 'доверие после поступка',
    moraleUpdate: 'настроение после событий', matchScore: 'насколько подходят друг другу',
    degToRad: 'градусы в радианы', radToDeg: 'радианы в градусы', haversine: 'расстояние по земле',
    heatIndex: 'как ощущается жара', windChill: 'как ощущается мороз', sleepDebt: 'недосып за неделю'
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
