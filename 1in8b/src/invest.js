/* ============================================================
   1 ИЗ 8 МИЛЛИАРДОВ — вложения: деньги, которые работают сами.
   ------------------------------------------------------------
   Здесь живут два разных способа превратить накопленное во
   что-то большее — и оба могут закончиться ничем:

   • ИНСТРУМЕНТЫ (вклад, облигации, акции, мировой индекс, золото,
     земля, квартира под сдачу, криптовалюта и «надёжные 40 %»).
     У каждого свой ожидаемый рост, свой разброс и своя беда:
     банк лопается, государство объявляет дефолт, золото крадут,
     биржа исчезает, пирамида рушится.

   • СВОЁ ДЕЛО: лоток, магазин, мастерская, кафе, ферма, дело в
     интернете, фирма с работниками. Каждый год дело приносит
     прибыль или убыток, может прогореть — и может выстрелить.

   Доходность считается «реальной», то есть сверх инфляции, и
   делится на две части: рост стоимости (виден только при продаже)
   и выплаты наличными (рента, купоны, дивиденды, прибыль дела).
   Рынок один на всех: в кризисный год падает почти всё, кроме
   золота. Кризис определяется зерном жизни, а не броском кубика,
   поэтому сохранение и загрузка ничего не ломают.

   Авто-жизни (соседи по секунде, тесты, статистика) сюда не
   заходят: пока игрок ничего не вложил, модуль просто молчит.
   ============================================================ */
(function () {
  'use strict';

  var M = window.IN8B.model;
  var clamp = M.clamp;

  function num(v, life) { return typeof v === 'function' ? v(life) : v; }
  function pct(v) { return Math.round(v * 1000) / 10; }

  /* ------------------------------------------------------------------ */
  /*                             РЫНОК ГОДА                              */
  /* ------------------------------------------------------------------ */
  /* Настроение рынка — число вроде стандартного отклонения: 0 — обычный
     год, −2 — обвал, +1,5 — всеобщий подъём. Берётся из зерна жизни,
     поэтому у всех бумаг один и тот же год и никакой бросок не тратится. */

  function market(life, year) {
    var r = life.roll('market-' + year);
    var r2 = life.roll('market-mood-' + year);
    var crisis = r < 0.085;                       /* примерно раз в 12 лет */
    var boom = r > 0.93;
    var mood = crisis ? -(1.7 + (0.085 - r) * 7)
      : boom ? (1.1 + (r - 0.93) * 6)
        : (r2 - 0.5) * 2;
    return { year: year, crisis: crisis, boom: boom, mood: mood };
  }

  /* реальная ставка по вкладу: в богатых странах чуть выше инфляции,
     в бедных сбережения тихо тают */
  function depoRate(life) {
    var g = life.c.gdp;
    if (g > 25000) return 0.011;
    if (g > 12000) return 0.006;
    if (g > 5000) return 0.0;
    if (g > 2000) return -0.013;
    return -0.026;
  }

  function bankRisk(life) {
    var g = life.c.gdp;
    return g > 15000 ? 0.003 : g > 5000 ? 0.008 : g > 2000 ? 0.016 : 0.026;
  }

  /* ------------------------------------------------------------------ */
  /*                            ИНСТРУМЕНТЫ                              */
  /* ------------------------------------------------------------------ */
  /* mean  — ожидаемый рост стоимости за год (реальный)
     pay   — выплата наличными за год, доля от стоимости
     sigma — разброс: примерно столько доходность гуляет в обе стороны
     corr  — насколько бумага связана с рынком (1 — повторяет, −1 — против)
     min   — минимальный взнос в долях need (стоимости года жизни)
     bad   — редкая беда: { p, loss, text }                              */

  var ASSETS = [
    {
      id: 'depo', icon: '🏦', name: 'Вклад в банке', risk: 'тихо',
      desc: 'Деньги лежат под процент. В богатой стране процент чуть обгоняет инфляцию, в бедной — нет.',
      mean: depoRate, pay: 0, sigma: 0.008, corr: 0.05, min: 0.05,
      bad: { p: bankRisk, loss: 0.55, text: 'Банк лопнул. Вернули чуть меньше половины вклада.' },
      avail: function (L) {
        return [
          { ok: L.age >= 16, text: 'с 16 лет' },
          { ok: L.c.gdp > 800, text: 'в стране есть банки для обычных людей' }
        ];
      }
    },
    {
      id: 'bond', icon: '📜', name: 'Гособлигации', risk: 'тихо',
      desc: 'Вы даёте в долг государству. Купон приходит каждый год, но и государства иногда не платят.',
      mean: 0.002, pay: function (L) { return depoRate(L) + 0.028; }, sigma: 0.045, corr: 0.3, min: 0.2,
      bad: {
        p: function (L) { return L.c.gdp > 12000 ? 0.004 : L.c.gdp > 3000 ? 0.012 : 0.026; },
        loss: 0.45, text: 'Государство не расплатилось по облигациям: половина денег пропала.'
      },
      avail: function (L) {
        return [
          { ok: L.age >= 18, text: 'с 18 лет' },
          { ok: L.year >= 1970, text: 'после 1970 года' },
          { ok: L.c.gdp > 2000 || L.stats.know > 45, text: 'нужен доступ к бирже или знания 45' }
        ];
      }
    },
    {
      id: 'stock', icon: '📈', name: 'Акции своей страны', risk: 'качает',
      desc: 'Доли в компаниях вашей страны. В хорошие годы растут быстрее всего, в кризис теряют треть.',
      mean: 0.067, pay: 0.021, sigma: 0.21, corr: 0.9, min: 0.15,
      avail: function (L) {
        return [
          { ok: L.age >= 18, text: 'с 18 лет' },
          { ok: L.year >= 1985, text: 'после 1985 года' },
          { ok: L.c.gdp > 2500 || L.stats.know > 50, text: 'нужна биржа в стране или знания 50' }
        ];
      }
    },
    {
      id: 'world', icon: '🌍', name: 'Мировой индекс', risk: 'качает',
      desc: 'Понемногу во все крупные компании мира. Падает реже, чем одна страна, и почти не зависит от неё.',
      mean: 0.053, pay: 0.017, sigma: 0.16, corr: 0.75, min: 0.2,
      avail: function (L) {
        return [
          { ok: L.age >= 18, text: 'с 18 лет' },
          { ok: L.year >= 1998, text: 'после 1998 года' },
          { ok: L.stats.know >= 40, text: 'знания 40 — нужен счёт у брокера' },
          { ok: L.c.gdp > 3000 || L.stats.know > 60, text: 'страна с доступом к мировым рынкам' }
        ];
      }
    },
    {
      id: 'gold', icon: '🪙', name: 'Золото', risk: 'тихо',
      desc: 'Почти не растёт, но в кризис дорожает, а в войну его можно унести с собой. Дома его крадут.',
      mean: 0.022, pay: 0, sigma: 0.13, corr: -0.3, min: 0.08,
      bad: {
        p: function (L) { return (L.c.gdp < 3000 ? 0.009 : 0.003) * (L.warUntil && L.age <= L.warUntil ? 2.5 : 1); },
        loss: 1, text: 'Золото украли. Дома деньги тоже не в безопасности.'
      },
      avail: function (L) { return [{ ok: L.age >= 14, text: 'с 14 лет' }]; }
    },
    {
      id: 'land', icon: '🌾', name: 'Земля или надел', risk: 'качает',
      desc: 'Земля кормит и сдаётся в аренду. Засуха и война могут отнять и урожай, и саму землю.',
      mean: 0.015, pay: 0.042, sigma: 0.08, corr: 0.15, min: 0.8,
      drought: 0.08,
      avail: function (L) {
        return [
          { ok: L.age >= 18, text: 'с 18 лет' },
          { ok: !L.urban || L.c.gdp < 9000, text: 'земля доступна в селе или в небогатой стране' }
        ];
      }
    },
    {
      id: 'rent', icon: '🏘', name: 'Квартира под сдачу', risk: 'качает',
      desc: 'Самое понятное вложение: жильё, за которое платят другие. Входит дорого, иногда стоит пустой.',
      mean: 0.022, pay: 0.042, sigma: 0.09, corr: 0.5, min: 3.5,
      empty: 0.12,
      avail: function (L) {
        return [
          { ok: L.age >= 20, text: 'с 20 лет' },
          { ok: L.c.gdp > 1200, text: 'есть рынок аренды' }
        ];
      }
    },
    {
      id: 'crypto', icon: '₿', name: 'Криптовалюта', risk: 'опасно',
      desc: 'Может вырасти в несколько раз и может обнулиться. Биржа иногда просто исчезает вместе с деньгами.',
      mean: 0.26, pay: 0, sigma: 0.6, corr: 0.4, min: 0.03,
      bad: { p: 0.035, loss: 1, text: 'Биржа исчезла вместе с кошельком. Жаловаться некому.' },
      avail: function (L) {
        return [
          { ok: L.age >= 16, text: 'с 16 лет' },
          { ok: L.year >= 2011, text: 'после 2011 года' },
          { ok: L.stats.know >= 25, text: 'знания 25' }
        ];
      }
    },
    {
      id: 'ponzi', icon: '⚠️', name: '«Надёжные 40 % в год»', risk: 'опасно',
      desc: 'Контора обещает 40 % годовых и показывает отзывы. Так выглядит финансовая пирамида: пока люди несут деньги, она платит.',
      mean: 0.4, pay: 0, sigma: 0, corr: 0, min: 0.2,
      bad: { p: 0.38, loss: 1, text: 'Контора с «надёжными 40 %» закрылась за ночь. Деньги ушли вместе с ней.' },
      avail: function (L) { return [{ ok: L.age >= 18, text: 'с 18 лет' }]; }
    }
  ];

  var ASSET_BY_ID = {};
  ASSETS.forEach(function (a) { ASSET_BY_ID[a.id] = a; });

  /* ------------------------------------------------------------------ */
  /*                             СВОЁ ДЕЛО                               */
  /* ------------------------------------------------------------------ */
  /* cost   — сколько стоит открыть, в долях need
     margin — обычная прибыль за год, доля от вложенного
     sigma  — разброс прибыли (чем больше, тем чаще убытки и удачи)
     fail   — базовый шанс прогореть за год (в первые годы выше)
     boom   — шанс, что дело выстрелит                                   */

  var BIZ = [
    {
      id: 'stall', icon: '🛒', name: 'Лоток на рынке', cost: 0.6,
      margin: 0.22, sigma: 0.34, fail: 0.11, boom: 0.008,
      desc: 'Товар, место и ваши руки. Начать можно почти с нуля, разбогатеть — почти никогда.',
      avail: function (L) { return [{ ok: L.age >= 16, text: 'с 16 лет' }]; }
    },
    {
      id: 'shop', icon: '🏪', name: 'Маленький магазин', cost: 2.2,
      margin: 0.17, sigma: 0.28, fail: 0.09, boom: 0.012,
      desc: 'Прилавок, витрина и постоянные покупатели из соседних домов.',
      avail: function (L) {
        return [{ ok: L.age >= 18, text: 'с 18 лет' }, { ok: L.stats.know >= 25, text: 'знания 25' }];
      }
    },
    {
      id: 'workshop', icon: '🔧', name: 'Мастерская', cost: 3.0,
      margin: 0.19, sigma: 0.31, fail: 0.085, boom: 0.013,
      desc: 'Вы чините, шьёте или делаете вещи сами. Руки важнее вывески.',
      avail: function (L) {
        return [{ ok: L.age >= 18, text: 'с 18 лет' }, { ok: L.stats.know >= 30, text: 'знания 30' }];
      }
    },
    {
      id: 'cafe', icon: '🍲', name: 'Кафе', cost: 4.5,
      margin: 0.16, sigma: 0.42, fail: 0.14, boom: 0.015,
      desc: 'Самое заметное и самое смертное дело: аренда, повар, проверки и ни одного выходного.',
      avail: function (L) {
        return [{ ok: L.age >= 20, text: 'с 20 лет' }, { ok: L.stats.know >= 25, text: 'знания 25' }];
      }
    },
    {
      id: 'farm', icon: '🚜', name: 'Ферма', cost: 3.4,
      margin: 0.14, sigma: 0.44, fail: 0.10, boom: 0.010,
      desc: 'Земля, скот и погода, которая решает всё за вас.',
      avail: function (L) {
        return [
          { ok: L.age >= 18, text: 'с 18 лет' },
          { ok: !L.urban || L.c.gdp < 9000, text: 'нужна земля: село или небогатая страна' }
        ];
      }
    },
    {
      id: 'online', icon: '💻', name: 'Дело в интернете', cost: 0.9,
      margin: 0.24, sigma: 0.85, fail: 0.16, boom: 0.035,
      desc: 'Магазин, курс или приложение. Вложить нужно мало, но девять из десяти так и остаются незамеченными.',
      avail: function (L) {
        return [
          { ok: L.age >= 16, text: 'с 16 лет' },
          { ok: L.year >= 2005, text: 'после 2005 года' },
          { ok: L.stats.know >= 45, text: 'знания 45' }
        ];
      }
    },
    {
      id: 'firm', icon: '🏢', name: 'Фирма с работниками', cost: 9,
      margin: 0.14, sigma: 0.38, fail: 0.085, boom: 0.025,
      desc: 'Вы больше не работаете руками — вы платите зарплату и отвечаете за чужие семьи.',
      avail: function (L) {
        return [
          { ok: L.age >= 24, text: 'с 24 лет' },
          { ok: L.stats.know >= 55, text: 'знания 55' },
          { ok: L.edu.level >= 4, text: 'нужна специальность или диплом' }
        ];
      }
    }
  ];

  var BIZ_BY_ID = {};
  BIZ.forEach(function (b) { BIZ_BY_ID[b.id] = b; });

  /* умение хозяина: знания, образование, здоровье и фокус года */
  function skillOf(life) {
    var s = 0.62 + life.stats.know / 150;
    if (life.edu.level >= 4) s += 0.06;
    if (life.edu.level >= 5) s += 0.05;
    if (life.stats.health < 40) s -= 0.12;
    if (life.focus === 'work') s += 0.10;
    else if (life.focus === 'money') s += 0.06;
    else if (life.focus === 'rest') s -= 0.05;
    if (life.has('legal')) s += 0.04;
    return clamp(s, 0.3, 1.6);
  }

  function countryFactor(life) {
    var g = life.c.gdp;
    var f = g > 20000 ? 1.08 : g > 8000 ? 1.02 : g > 3000 ? 0.96 : 0.9;
    if (life.warUntil && life.age <= life.warUntil) f *= 0.6;
    return f;
  }

  /* какую долю от вложенного дело приносит в этот год (без случайности) */
  function bizMargin(life, type, bizAge) {
    var stage = bizAge <= 1 ? 0.55 : bizAge === 2 ? 0.82 : bizAge > 25 ? 0.9 : 1;
    return type.margin * skillOf(life) * countryFactor(life) * stage;
  }

  /* шанс прогореть в этом году */
  function bizHazard(life, type, bizAge, lossYear) {
    var h = type.fail;
    /* первые годы — «долина смерти», пережившее десять лет дело живёт долго */
    h *= bizAge <= 1 ? 1.8 : bizAge === 2 ? 1.35 : bizAge <= 4 ? 1.05
      : bizAge <= 8 ? 0.75 : bizAge <= 15 ? 0.5 : 0.38;
    h *= life.has('legal') ? 0.85 : 1.1;
    h *= life.stats.health < 35 ? 1.35 : 1;
    h *= life.stats.know > 60 ? 0.85 : 1;
    h *= life.c.gdp < 3000 ? 1.2 : 1;
    if (life.warUntil && life.age <= life.warUntil) h *= 1.8;
    if (lossYear) h *= 1.6;
    if (life.money < 0) h *= 1.3;
    return clamp(h, 0.01, 0.6);
  }

  function bizBoom(life, type, bizAge, already) {
    var p = type.boom * (1 + life.stats.know / 220) * (bizAge >= 2 ? 1 : 0.4);
    if (already) p *= 0.25;          /* второй раз в гору дело идёт редко */
    return clamp(p, 0, 0.25);
  }

  /* ------------------------------------------------------------------ */
  /*                      ЧТО ДОСТУПНО И ПО ЧЁМ                          */
  /* ------------------------------------------------------------------ */

  function minOf(life, def) { return Math.max(1, Math.round(life.need * def.min)); }
  function bizCost(life, type) { return Math.max(1, Math.round(life.need * type.cost * (life.c.gdp < 6000 ? 1.2 : 1))); }

  function reqsOf(life, def) {
    var list = [];
    try { list = def.avail(life) || []; } catch (e) { list = []; }
    return list;
  }

  function assetState(life, def) {
    var reqs = reqsOf(life, def);
    var bad = reqs.filter(function (r) { return !r.ok; });
    var min = minOf(life, def);
    var held = holdingOf(life, def.id);
    return {
      ok: !bad.length && life.money >= min,
      reqs: reqs,
      min: min,
      held: held,
      why: bad.length ? bad[0].text : (life.money < min ? 'не хватает денег на минимальный взнос' : '')
    };
  }

  function bizState(life, type) {
    var reqs = reqsOf(life, type);
    var bad = reqs.filter(function (r) { return !r.ok; });
    var cost = bizCost(life, type);
    return {
      ok: !bad.length && !life.biz && life.money >= cost,
      reqs: reqs,
      cost: cost,
      why: life.biz ? 'у вас уже есть своё дело'
        : bad.length ? bad[0].text
          : life.money < cost ? 'не хватает денег' : ''
    };
  }

  /* честная табличка шансов — её же видит игрок */
  function odds(life, type, bizAge, lossYear) {
    var a = bizAge || 0;
    var m = bizMargin(life, type, a);
    var h = bizHazard(life, type, a, !!lossYear);
    /* в убыточный год дело закрывается чаще — это надо учесть в прогнозе */
    var lp = lossChance(bizMargin(life, type, 2), type.sigma);
    var k = 1 + lp * 0.6;
    var h1 = clamp(bizHazard(life, type, 1, false) * k, 0.01, 0.75);
    var h2 = clamp(bizHazard(life, type, 2, false) * k, 0.01, 0.75);
    var h3 = clamp(bizHazard(life, type, 3, false) * k, 0.01, 0.75);
    return {
      margin: m,                                  /* ожидаемая прибыль, доля вложенного */
      sigma: type.sigma,
      fail: h,                                    /* шанс закрыться в этом году */
      fail3: 1 - (1 - h1) * (1 - h2) * (1 - h3),  /* шанс не пережить три года */
      boom: bizBoom(life, type, Math.max(a, 2), false),
      lossP: lossChance(m, type.sigma)            /* шанс закончить год в минусе */
    };
  }

  /* грубая оценка доли лет с убытком: прибыль ~ margin + sigma·z */
  function lossChance(margin, sigma) {
    if (sigma <= 0) return margin < 0 ? 1 : 0;
    var z = margin / sigma;
    /* приближение нормального распределения */
    var p = 1 / (1 + Math.exp(1.702 * z));
    return clamp(p, 0.01, 0.95);
  }

  /* ------------------------------------------------------------------ */
  /*                         ПОРТФЕЛЬ И СДЕЛКИ                           */
  /* ------------------------------------------------------------------ */

  function holdingOf(life, id) {
    return (life.assets && life.assets[id]) || null;
  }

  function holdings(life) {
    var out = [];
    Object.keys(life.assets || {}).forEach(function (id) {
      var h = life.assets[id];
      if (!h || h.val <= 0.5) return;
      if (!ASSET_BY_ID[id]) return;
      out.push({ def: ASSET_BY_ID[id], h: h, id: id, val: h.val, put: h.put, since: h.since, got: h.got || 0 });
    });
    return out;
  }

  function portfolio(life) {
    var val = 0, put = 0, got = 0;
    holdings(life).forEach(function (o) { val += o.val; put += o.put; got += o.got; });
    var bizVal = life.biz ? life.biz.val : 0;
    return {
      val: val, put: put, got: got, biz: bizVal, total: val + bizVal,
      income: life.capitalIncome || 0,
      lifetime: (life.capitalTotal || 0) + val + bizVal - (life.investedTotal || 0)
    };
  }

  function put(life, id, amount) {
    var def = ASSET_BY_ID[id];
    if (!def) return { ok: false, why: 'Нет такого вложения' };
    var st = assetState(life, def);
    var bad = st.reqs.filter(function (r) { return !r.ok; });
    if (bad.length) return { ok: false, why: bad[0].text };
    var sum = Math.round(amount || 0);
    if (sum < st.min) return { ok: false, why: 'Минимальный взнос больше' };
    if (sum > life.money) return { ok: false, why: 'Столько денег нет' };

    life.assets = life.assets || {};
    var h = life.assets[id] || (life.assets[id] = { put: 0, val: 0, got: 0, since: life.age });
    life.money -= sum;
    h.put += sum;
    h.val += sum;
    life.investedTotal = (life.investedTotal || 0) + sum;
    life.add('Вложение: ' + def.name.toLowerCase() + '.', 'money');
    return { ok: true, sum: sum };
  }

  /* имущество, доставшееся не за деньги: наследство, подарок, доля в семье */
  function grant(life, id, value) {
    var def = ASSET_BY_ID[id];
    var sum = Math.round(value || 0);
    if (!def || sum <= 0) return { ok: false, why: 'Нечего записывать' };
    life.assets = life.assets || {};
    var h = life.assets[id] || (life.assets[id] = { put: 0, val: 0, got: 0, since: life.age });
    h.val += sum;
    h.since = Math.min(h.since, life.age);
    return { ok: true, sum: sum };
  }

  function take(life, id, amount) {
    var h = holdingOf(life, id);
    var def = ASSET_BY_ID[id];
    if (!h || !def || h.val <= 0) return { ok: false, why: 'Нечего забирать' };
    var sum = Math.round(Math.min(amount == null ? h.val : amount, h.val));
    if (sum <= 0) return { ok: false, why: 'Нечего забирать' };
    var share = sum / h.val;
    h.val -= sum;
    h.put -= h.put * share;
    life.money += sum;
    life.capitalTotal = (life.capitalTotal || 0) + sum;
    if (h.val <= 0.5) { h.val = 0; h.put = 0; }
    life.add('Забрали вложенное: ' + def.name.toLowerCase() + '.', 'money');
    return { ok: true, sum: sum };
  }

  function openBiz(life, typeId, amount) {
    var type = BIZ_BY_ID[typeId];
    if (!type) return { ok: false, why: 'Нет такого дела' };
    if (life.biz) return { ok: false, why: 'У вас уже есть своё дело' };
    var st = bizState(life, type);
    var bad = st.reqs.filter(function (r) { return !r.ok; });
    if (bad.length) return { ok: false, why: bad[0].text };
    var sum = Math.max(st.cost, Math.round(amount || st.cost));
    if (sum > life.money) return { ok: false, why: 'Не хватает денег' };

    life.money -= sum;
    life.investedTotal = (life.investedTotal || 0) + sum;
    life.biz = {
      type: type.id, name: type.name, icon: type.icon,
      put: sum, val: sum, age: 0, since: life.age,
      profit: 0, best: 0, loss: false, offer: 0, boomed: false,
      had: !!life.business            /* было ли дело до этого (по решению или покупке) */
    };
    life.business = true;
    life.bizCount = (life.bizCount || 0) + 1;
    life.stat('happy', 6);
    life.add('Вы открыли своё дело: ' + type.name.toLowerCase() + '.', 'work');
    return { ok: true, sum: sum };
  }

  function investBiz(life, amount) {
    if (!life.biz) return { ok: false, why: 'Дела пока нет' };
    var sum = Math.round(amount || 0);
    if (sum <= 0) return { ok: false, why: 'Нечего вкладывать' };
    if (sum > life.money) return { ok: false, why: 'Столько денег нет' };
    life.money -= sum;
    life.investedTotal = (life.investedTotal || 0) + sum;
    life.biz.put += sum;
    life.biz.val += Math.round(sum * 0.9);   /* часть денег съедают переделки и простой */
    life.add('Вложили в развитие дела.', 'money');
    return { ok: true, sum: sum };
  }

  function sellPrice(life) {
    if (!life.biz) return 0;
    return Math.round(life.biz.offer || life.biz.val * 0.85);
  }

  function sellBiz(life) {
    if (!life.biz) return { ok: false, why: 'Дела пока нет' };
    var sum = sellPrice(life);
    var b = life.biz;
    life.money += sum;
    life.capitalTotal = (life.capitalTotal || 0) + sum;
    life.add('Вы продали своё дело: ' + b.name.toLowerCase() + '.', 'money');
    life.stat('happy', sum > b.put ? 4 : -3);
    life.business = !!b.had;
    life.biz = null;
    return { ok: true, sum: sum };
  }

  /* ------------------------------------------------------------------ */
  /*                            ГОД ВЛОЖЕНИЙ                             */
  /* ------------------------------------------------------------------ */

  function tickAssets(life, mk, cash) {
    var rnd = life.rnd;
    var notes = [];
    holdings(life).forEach(function (o) {
      var def = o.def, h = o.h;
      /* редкая беда: банк, дефолт, кража, биржа, пирамида */
      if (def.bad && rnd() < num(def.bad.p, life)) {
        var lost = Math.round(h.val * def.bad.loss);
        h.val -= lost;
        if (h.val < 0.5) { h.val = 0; h.put = 0; }
        life.stat('happy', -5);
        notes.push({ text: def.bad.text, kind: 'bad' });
        return;
      }
      var mean = num(def.mean, life);
      var sigma = num(def.sigma, life);
      var corr = def.corr || 0;
      var z = mk.mood * corr + rnd.normal(0, 1) * Math.sqrt(Math.max(0, 1 - corr * corr));
      var grow = mean + sigma * z;
      var payRate = num(def.pay, life) || 0;

      /* засуха на земле и простой в квартире */
      if (def.drought && rnd() < def.drought) {
        payRate = 0; grow -= 0.07;
        notes.push({ text: 'Засуха: земля в этом году не дала почти ничего.', kind: 'bad' });
      }
      if (def.empty && rnd() < def.empty) {
        payRate *= 0.45;
        notes.push({ text: 'Квартира полгода стояла пустой.', kind: 'money' });
      }

      var pay = Math.round(h.val * payRate);
      var before = h.val;
      h.val = Math.max(0, h.val * (1 + grow));
      if (pay > 0) { cash.sum += pay; h.got = (h.got || 0) + pay; life.capitalTotal = (life.capitalTotal || 0) + pay; }
      cash.grow += h.val - before;
      if (def.id === 'stock' || def.id === 'world' || def.id === 'crypto') cash.market = true;
    });
    return notes;
  }

  function tickBiz(life, mk, cash) {
    var b = life.biz;
    if (!b) return [];
    var type = BIZ_BY_ID[b.type];
    if (!type) return [];
    var rnd = life.rnd;
    var notes = [];
    b.age++;
    b.offer = 0;

    /* прибыль года: обычная доля плюс разброс, слегка привязанный к рынку */
    var m = bizMargin(life, type, b.age);
    var z = mk.mood * 0.45 + rnd.normal(0, 1) * 0.89;
    var rate = m + type.sigma * z;
    var profit = Math.round(b.val * rate);
    b.profit = profit;
    b.loss = profit < 0;
    if (profit > b.best) b.best = profit;

    if (profit >= 0) {
      cash.sum += profit;
      life.capitalTotal = (life.capitalTotal || 0) + profit;
    } else {
      life.money += profit;                       /* убыток платится из своего кармана */
      life.stat('happy', -2);
    }
    /* стоимость дела медленно тянется за прибылью; быстро растёт только то,
       во что хозяин вкладывает деньги сам */
    b.val = Math.max(0, Math.round(b.val * (1 + clamp(rate * 0.18, -0.3, 0.08))));

    /* выстрел */
    if (rnd() < bizBoom(life, type, b.age, b.boomed)) {
      var k = 1.6 + rnd() * 1.0;
      b.val = Math.round(b.val * k);
      b.boomed = true;
      life.boomedBiz = true;
      life.stat('happy', 9);
      notes.push({
        text: 'Дело пошло в гору: ' + b.name.toLowerCase() + ' выросло в ' +
          (Math.round(k * 10) / 10).toString().replace('.', ',') + ' раза.', kind: 'good'
      });
    }

    /* прогорело */
    if (rnd() < bizHazard(life, type, b.age, b.loss)) {
      var left = Math.round(b.val * (0.1 + rnd() * 0.25));
      life.money += left;
      life.capitalTotal = (life.capitalTotal || 0) + left;
      if (rnd() < 0.4) {
        var debt = Math.round(life.need * (0.3 + rnd() * 0.7));
        life.money -= debt;
        notes.push({ text: 'Дело закрылось и оставило долги: ' + b.name.toLowerCase() + '.', kind: 'bad' });
      } else {
        notes.push({ text: 'Дело прогорело: ' + b.name.toLowerCase() + '. Распродали что осталось.', kind: 'bad' });
      }
      life.stat('happy', -10);
      life.stat('health', -2);
      life.bizFailed = (life.bizFailed || 0) + 1;
      life.business = !!b.had;
      life.biz = null;
      return notes;
    }

    /* иногда дело хотят купить */
    if (b.age >= 3 && rnd() < 0.05) {
      b.offer = Math.round(b.val * (1.3 + rnd() * 0.9));
      notes.push({ text: 'Вашим делом заинтересовался покупатель — предложение в меню вложений.', kind: 'money' });
    }

    /* в летопись попадают только заметные годы, иначе дело заслонит всю жизнь */
    if (!notes.length && (profit > life.need * 0.9 || profit < -life.need * 0.4)) {
      notes.push({
        text: profit > 0
          ? 'Дело принесло прибыль: ' + b.name.toLowerCase() + ', ' + Math.round(rate * 100) + '% на вложенное.'
          : 'Год в минусе: ' + b.name.toLowerCase() + ' съело ' + Math.abs(Math.round(rate * 100)) + '% вложенного.',
        kind: profit > 0 ? 'money' : 'bad'
      });
    }
    return notes;
  }

  /* главный вход: вызывается движком каждый год до подсчёта денег */
  function tickYear(life) {
    life.capitalIncome = 0;
    life.capitalDelta = 0;
    var hasAssets = life.assets && Object.keys(life.assets).some(function (k) {
      return life.assets[k] && life.assets[k].val > 0;
    });
    if (!hasAssets && !life.biz) return null;

    var mk = market(life, life.year);
    var cash = { sum: 0, grow: 0, market: false };
    var notes = tickAssets(life, mk, cash).concat(tickBiz(life, mk, cash));

    life.capitalIncome = Math.max(0, Math.round(cash.sum));
    life.capitalDelta = Math.round(cash.grow);

    if (mk.crisis && cash.market) {
      notes.unshift({ text: 'Кризис на рынках: вложения разом подешевели.', kind: 'bad' });
    } else if (mk.boom && cash.market && life.roll('boom-note-' + life.year) < 0.5) {
      notes.push({ text: 'Хороший год на рынках: вложения подорожали.', kind: 'good' });
    }
    notes.slice(0, 2).forEach(function (n) { life.add(n.text, n.kind); });
    return { market: mk, cash: cash, notes: notes };
  }

  /* короткая строка для панели денег */
  function note(life) {
    var p = portfolio(life);
    if (!p.total && !life.biz) return 'деньги лежат без дела';
    var parts = [];
    if (life.biz) parts.push(life.biz.icon + ' ' + life.biz.name.toLowerCase());
    if (p.val > 0) parts.push(holdings(life).length + ' ' +
      M.plural(holdings(life).length, 'вложение', 'вложения', 'вложений'));
    return parts.join(' · ');
  }

  window.IN8B = window.IN8B || {};
  window.IN8B.invest = {
    assets: ASSETS, assetById: ASSET_BY_ID,
    biz: BIZ, bizById: BIZ_BY_ID,
    market: market, depoRate: depoRate,
    minOf: minOf, bizCost: bizCost,
    assetState: assetState, bizState: bizState, odds: odds,
    holdings: holdings, holdingOf: holdingOf, portfolio: portfolio,
    put: put, take: take, grant: grant,
    openBiz: openBiz, investBiz: investBiz, sellBiz: sellBiz, sellPrice: sellPrice,
    bizMargin: bizMargin, bizHazard: bizHazard, bizBoom: bizBoom, skillOf: skillOf,
    tickYear: tickYear, note: note, pct: pct,
    count: ASSETS.length + BIZ.length
  };
})();
