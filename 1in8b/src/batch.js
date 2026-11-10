/* ============================================================
   1 ИЗ 8 МИЛЛИАРДОВ — тысяча жизней.
   ------------------------------------------------------------
   Одна жизнь — это судьба. Тысяча жизней — это уже статистика,
   и её интересно сравнить с настоящей: столько же людей умирает
   в младенчестве? так же часто выпадает Индия? сколько народу
   доживает до девяноста?

   Модуль прогоняет пачку жизней тем же движком, что и обычная
   игра, только молча и без пауз. Браузер при этом не должен
   застывать, поэтому прогон идёт кусками: runner.step(мс)
   проживает столько жизней, сколько влезает в отведённое время,
   и возвращает управление обратно.

   Каждая прожитая жизнь сжимается в короткую запись (возраст,
   причина, страна, образование, работа, дети), а summarize()
   собирает из записей сводку: средние, доли, кривая дожития,
   страны, причины смерти, профессии.
   ============================================================ */
(function () {
  'use strict';

  var C = window.IN8B.countries;
  var M = window.IN8B.model;

  var MAX_AGE = 120;

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  /* ----------------------- одна запись о жизни ---------------------- */

  /* Из прожитой жизни оставляем только то, что нужно сводке:
     тысяча жизней целиком заняла бы десятки мегабайт. */
  function rowOf(life, peak) {
    var job = null;
    if (life.career && life.career.held && life.career.held.length) {
      job = life.career.held[life.career.held.length - 1];
    } else if (life.job) {
      job = life.job.id;
    }
    return {
      age: life.dead ? life.dead.age : life.age,
      cause: life.dead ? life.dead.cause : 'ещё жив',
      code: life.base ? life.base.code : life.c.code,
      sex: life.sex,
      urban: !!life.urban,
      edu: life.edu ? life.edu.level : 0,
      job: job,
      kids: life.children ? life.children.length : 0,
      married: life.marital === 'married' || life.marital === 'widow' ||
        life.marital === 'divorced' || life.marital === 'partner',
      street: !!(life.homeless || life.streetTotal),
      abroad: !!life.abroad,
      money: Math.round(life.money || 0),
      income: Math.round(peak || life.ownIncome || 0),
      gdp: Math.round((life.c && life.c.gdp) || 0)
    };
  }

  /* Прожить одну жизнь целиком. Решения выбирает сам движок —
     так же, как в тесте-боте: по весам вариантов. */
  function runOne(EN, seed, opts) {
    var life = new EN.Life({
      seed: seed,
      countryCode: opts.countryCode || undefined,
      silent: true,
      settings: opts.settings || {}
    });
    var peak = 0, guard = 0;
    while (life.alive && life.age < MAX_AGE && guard++ < MAX_AGE + 4) {
      if (life.stepYear()) life.autoAnswer();
      if (life.ownIncome > peak) peak = life.ownIncome;
    }
    return rowOf(life, peak);
  }

  /* ------------------------- пачка прогонов ------------------------- */

  /* opts: { count, settings, countryCode, seed }
     Зерно общее на всю пачку, так что один и тот же прогон всегда
     даёт одни и те же тысячу жизней — результат можно повторить. */
  function make(opts) {
    opts = opts || {};
    var EN = window.IN8B.engine;
    var total = clamp(Math.round(opts.count || 300), 1, 20000);
    var seed = opts.seed || ('пачка-' + Date.now());
    var settings = opts.settings || {};
    var rows = [];
    var errors = 0;

    var runner = {
      total: total,
      seed: seed,
      rows: rows,
      errors: 0,
      done: 0,
      finished: false,
      /* Прожить столько жизней, сколько влезет в budget миллисекунд. */
      step: function (budget) {
        var t0 = Date.now();
        var b = budget === undefined ? 12 : budget;
        while (runner.done < total) {
          try {
            rows.push(runOne(EN, seed + '-' + runner.done,
              { countryCode: opts.countryCode, settings: settings }));
          } catch (e) {
            errors++;
            runner.errors = errors;
            if (!runner.lastError) runner.lastError = String(e && e.message || e);
          }
          runner.done++;
          if (Date.now() - t0 >= b) break;
        }
        runner.finished = runner.done >= total;
        return runner.done;
      },
      /* Прожить всё разом: так удобно в тестах и в консоли. */
      all: function () {
        while (!runner.finished) runner.step(1e9);
        return summarize(rows);
      },
      stats: function () { return summarize(rows); }
    };
    return runner;
  }

  /* ----------------------------- сводка ----------------------------- */

  function median(list) {
    if (!list.length) return 0;
    var a = list.slice().sort(function (x, y) { return x - y; });
    var m = Math.floor(a.length / 2);
    return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
  }

  function topOf(map, limit, name) {
    var out = [];
    for (var k in map) if (Object.prototype.hasOwnProperty.call(map, k)) {
      out.push({ key: k, name: name ? name(k) : k, n: map[k].n !== undefined ? map[k].n : map[k],
        sum: map[k].sum || 0 });
    }
    out.sort(function (a, b) { return b.n - a.n; });
    return out.slice(0, limit || 12);
  }

  /* Чего ждать по данным: мир, взвешенный по числу рождений. */
  function expected(countryCode) {
    if (countryCode && C.byCode[countryCode]) {
      var c = C.byCode[countryCode];
      return { le: (c.leM + c.leF) / 2, imr: c.imr, u5: c.u5mr, name: c.name };
    }
    var le = 0, imr = 0, u5 = 0;
    C.list.forEach(function (x) {
      var sh = C.birthShare(x);
      le += sh * (x.leM + x.leF) / 2; imr += sh * x.imr; u5 += sh * x.u5mr;
    });
    return { le: le, imr: imr, u5: u5, name: 'весь мир' };
  }

  function summarize(rows) {
    var n = rows.length;
    var out = {
      count: n, meanAge: 0, medianAge: 0, imr: 0, u5: 0, to90: 0, to60: 0,
      survival: [], byCountry: [], byCause: [], byJob: [], edu: [0, 0, 0, 0, 0, 0, 0],
      homeless: 0, married: 0, kids: 0, urban: 0, abroad: 0, noJob: 0,
      oldest: null, youngest: null, income: 0, countries: 0
    };
    if (!n) return out;

    var ages = [], incomes = [], kids = [], cMap = {}, dMap = {}, jMap = {};
    var sum = 0, inf = 0, u5 = 0, old90 = 0, old60 = 0;
    for (var i = 0; i < n; i++) {
      var r = rows[i];
      ages.push(r.age); sum += r.age;
      if (r.age < 1) inf++;
      if (r.age < 5) u5++;
      if (r.age >= 90) old90++;
      if (r.age >= 60) old60++;
      out.edu[clamp(r.edu, 0, 6)]++;
      if (r.street) out.homeless++;
      if (r.married) out.married++;
      if (r.urban) out.urban++;
      if (r.abroad) out.abroad++;
      if (!r.job) out.noJob++;
      kids.push(r.kids);
      if (r.income > 0) incomes.push(r.income);
      if (!cMap[r.code]) cMap[r.code] = { n: 0, sum: 0 };
      cMap[r.code].n++; cMap[r.code].sum += r.age;
      dMap[r.cause] = dMap[r.cause] || { n: 0 };
      dMap[r.cause].n++;
      if (r.job) { jMap[r.job] = jMap[r.job] || { n: 0 }; jMap[r.job].n++; }
      if (!out.oldest || r.age > out.oldest.age) out.oldest = r;
      if (!out.youngest || r.age < out.youngest.age) out.youngest = r;
    }

    out.meanAge = sum / n;
    out.medianAge = median(ages);
    out.imr = inf / n * 1000;
    out.u5 = u5 / n * 1000;
    out.to90 = old90 / n * 100;
    out.to60 = old60 / n * 100;
    out.homeless = out.homeless / n * 100;
    out.married = out.married / n * 100;
    out.urban = out.urban / n * 100;
    out.abroad = out.abroad / n * 100;
    out.noJob = out.noJob / n * 100;
    out.kids = kids.reduce(function (a, b) { return a + b; }, 0) / n;
    out.income = median(incomes);

    /* кривая дожития: какая доля пачки ещё жива в каждом возрасте */
    var alive = n, byAge = new Array(MAX_AGE + 2);
    for (var a = 0; a <= MAX_AGE + 1; a++) byAge[a] = 0;
    for (i = 0; i < n; i++) byAge[clamp(rows[i].age, 0, MAX_AGE + 1)]++;
    for (a = 0; a <= MAX_AGE; a++) {
      out.survival.push(alive / n);
      alive -= byAge[a];
    }

    out.byCountry = topOf(cMap, 12, function (k) {
      return C.byCode[k] ? C.byCode[k].name : k;
    }).map(function (x) {
      x.share = x.n / n * 100;
      x.meanAge = x.sum / x.n;
      return x;
    });
    out.countries = Object.keys(cMap).length;
    out.byCause = topOf(dMap, 12).map(function (x) { x.share = x.n / n * 100; return x; });
    out.byJob = topOf(jMap, 12, function (k) {
      return M.jobById[k] ? M.jobById[k].title : k;
    }).map(function (x) { x.share = x.n / n * 100; return x; });
    return out;
  }

  window.IN8B = window.IN8B || {};
  window.IN8B.batch = {
    make: make,
    runOne: runOne,
    summarize: summarize,
    expected: expected,
    rowOf: rowOf,
    median: median,
    maxAge: MAX_AGE
  };
})();
