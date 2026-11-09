/* ============================================================
   1 ИЗ 8 МИЛЛИАРДОВ — графика: карта жизни, кривая выживаемости,
   столбики вероятностей рождения и карточка «поделиться».
   Всё рисуется кодом, без внешних библиотек.
   ============================================================ */
(function () {
  'use strict';

  var M = window.IN8B.model;
  var C = window.IN8B.countries;

  var KIND_COLOR = {
    life: '#8aa0b5', good: '#6fbf8b', bad: '#e2604f', health: '#5aa9e6',
    work: '#e8b45a', family: '#e78fa6', money: '#d7c27a', world: '#9b8cf0',
    death: '#6f6a5f', help: '#5aa9e6'
  };

  /* ------------------------- карта жизни ------------------------------- */
  /* одна клетка = один год; цвет — по настроению года */
  /* какой значок поставить на клетку года */
  var MARKS = [
    [/сыграли свадьбу|пожен|вышли замуж|женились|свадьб/i, '♡', 'свадьба'],
    [/родил(ся|ась)|родились|появил(ся|ась) на свет|стали родител/i, '♥', 'ребёнок'],
    [/умер|ушёл из жизни|ушла из жизни|похорон|не стало|хоронил|развод|расстал/i, '†', 'утрата'],
    [/больниц|операц|болезн|травм|диагноз|перелом/i, '+', 'здоровье'],
    [/школ|университет|учил|диплом|экзамен|курс|образован|класс/i, 'у', 'учёба'],
    [/работ|зарплат|должност|бизнес|уволен|повышен|нанял|подработ/i, '₽', 'деньги и работа'],
    [/переезд|переехал|уехал|перебрал|эмигр|страну/i, '⌂', 'переезд']
  ];

  function markFor(life, age) {
    if (age === 0) return null;
    var kids = (life.children || []).filter(function (k) { return k.bornAt === age; }).length;
    if (kids) return ['♥', kids > 1 ? 'дети' : 'ребёнок'];
    if (life.partner && life.partner.since === age) return ['♡', 'свадьба'];
    var texts = life.log.filter(function (e) { return e.age === age; });
    for (var i = 0; i < MARKS.length; i++) {
      for (var j = 0; j < texts.length; j++) {
        if (MARKS[i][0].test(texts[j].text)) return [MARKS[i][1], MARKS[i][2]];
      }
    }
    return null;
  }

  function lifeMap(el, life) {
    el.innerHTML = '';
    var hist = life.history;
    if (!hist.length) { el.textContent = 'Жизнь только началась.'; return; }
    hist.forEach(function (h) {
      var cell = document.createElement('i');
      var score = (h.happy * 0.5 + h.health * 0.3 + h.bond * 0.2) / 100;
      var hue = 10 + score * 115;              // красный → зелёный
      cell.style.background = 'hsl(' + hue.toFixed(0) + ' 44% ' + (18 + score * 26).toFixed(0) + '%)';
      var mk = markFor(life, h.age);
      if (mk) { cell.textContent = mk[0]; cell.className = 'mk'; }
      if (h.age === life.age) cell.className = (cell.className ? cell.className + ' ' : '') + 'now';
      cell.title = h.age + ' ' + (h.age % 10 === 1 && h.age % 100 !== 11 ? 'год' : 'лет') +
        ' (' + h.year + '): здоровье ' + h.health + ', счастье ' + h.happy +
        ', знания ' + h.know + ', отношения ' + h.bond + (mk ? ' · ' + mk[1] : '');
      el.appendChild(cell);
    });
  }

  /* --------------------- кривая выживаемости --------------------------- */
  function survival(canvas, life, compareCode) {
    var ctx = canvas && canvas.getContext && canvas.getContext('2d');
    if (!ctx) return;
    var dpr = window.devicePixelRatio || 1;
    var w = canvas.clientWidth || 320, h = canvas.clientHeight || 170;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    var pad = { l: 34, r: 10, t: 12, b: 22 };
    var iw = w - pad.l - pad.r, ih = h - pad.t - pad.b;
    var maxAge = 100;

    /* сетка */
    ctx.strokeStyle = 'rgba(242,236,223,0.10)';
    ctx.fillStyle = 'rgba(242,236,223,0.45)';
    ctx.font = '10px system-ui, sans-serif';
    ctx.lineWidth = 1;
    [0, 0.25, 0.5, 0.75, 1].forEach(function (p) {
      var y = pad.t + ih * (1 - p);
      ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(w - pad.r, y); ctx.stroke();
      ctx.fillText(Math.round(p * 100) + '%', 4, y + 3);
    });
    [0, 25, 50, 75, 100].forEach(function (a) {
      var x = pad.l + iw * (a / maxAge);
      ctx.fillText(String(a), x - 6, h - 6);
    });

    function drawCurve(table, color, width) {
      ctx.strokeStyle = color; ctx.lineWidth = width;
      ctx.beginPath();
      for (var a = 0; a <= maxAge; a++) {
        var x = pad.l + iw * (a / maxAge);
        var y = pad.t + ih * (1 - table.lx[a]);
        if (a === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    if (compareCode && C.byCode[compareCode]) {
      var cc = C.byCode[compareCode];
      drawCurve(M.lifeTable(life.sex === 'f' ? cc.leF : cc.leM, cc.u5mr, cc.imr), 'rgba(155,140,240,0.75)', 1.6);
    }
    drawCurve(life.table, '#e8b45a', 2.2);

    /* отметка возраста смерти */
    var age = life.dead ? life.dead.age : life.age;
    var mx = pad.l + iw * (Math.min(age, maxAge) / maxAge);
    var my = pad.t + ih * (1 - life.table.lx[Math.min(age, 110)]);
    ctx.fillStyle = '#f2ecdf';
    ctx.beginPath(); ctx.arc(mx, my, 4, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(242,236,223,0.35)';
    ctx.beginPath(); ctx.moveTo(mx, pad.t); ctx.lineTo(mx, pad.t + ih); ctx.stroke();
  }

  /* ---------------------- показатели по годам -------------------------- */
  function statLines(canvas, life) {
    var ctx = canvas && canvas.getContext && canvas.getContext('2d');
    if (!ctx) return;
    var dpr = window.devicePixelRatio || 1;
    var w = canvas.clientWidth || 320, h = canvas.clientHeight || 150;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    var hist = life.history;
    if (hist.length < 2) return;
    var pad = 8;
    var maxAge = Math.max(hist[hist.length - 1].age, 10);
    var keys = [['health', '#5aa9e6'], ['happy', '#e8b45a'], ['know', '#6fbf8b'], ['bond', '#e78fa6']];
    keys.forEach(function (k) {
      ctx.strokeStyle = k[1]; ctx.lineWidth = 1.8; ctx.beginPath();
      hist.forEach(function (p, i) {
        var x = pad + (w - pad * 2) * (p.age / maxAge);
        var y = pad + (h - pad * 2) * (1 - p[k[0]] / 100);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.stroke();
    });
  }

  /* ------------------- столбики вероятности рождения ------------------- */
  function birthBars(el, mode, limit) {
    el.innerHTML = '';
    var top = C.topByShare(limit || 9, mode);
    var totalShare = 0;
    top.forEach(function (c) {
      var share = mode === 'pop' ? C.popShare(c) : C.birthShare(c);
      totalShare += share;
      var row = document.createElement('div');
      row.className = 'bar-row';
      row.innerHTML = '<span class="bar-name">' + c.name + '</span>' +
        '<span class="bar-track"><i style="width:' + (share * 100 / 0.18 * 0.9).toFixed(1) + '%"></i></span>' +
        '<span class="bar-val">' + (share * 100).toFixed(1).replace('.', ',') + '%</span>';
      el.appendChild(row);
    });
    var rest = document.createElement('div');
    rest.className = 'bar-row bar-rest';
    rest.innerHTML = '<span class="bar-name">Ещё ' + (C.list.length - top.length) + ' стран и территорий</span>' +
      '<span class="bar-track"><i style="width:100%"></i></span>' +
      '<span class="bar-val">' + ((1 - totalShare) * 100).toFixed(1).replace('.', ',') + '%</span>';
    el.appendChild(rest);
  }

  /* ---------------------- карточка «поделиться» ------------------------ */
  function shareCard(life) {
    var W = 1080, H = 1350;
    var cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    var g = cv.getContext && cv.getContext('2d');
    if (!g) return cv;

    var grad = g.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#11161c');
    grad.addColorStop(1, '#0b0d0c');
    g.fillStyle = grad; g.fillRect(0, 0, W, H);

    g.fillStyle = '#e8b45a';
    g.font = '600 34px system-ui, sans-serif';
    g.fillText('1 ИЗ 8 МИЛЛИАРДОВ', 72, 110);

    g.fillStyle = '#f2ecdf';
    g.font = '700 74px system-ui, sans-serif';
    wrap(g, life.name, 72, 220, W - 144, 80);

    g.fillStyle = '#a9a294';
    g.font = '400 36px system-ui, sans-serif';
    var years = life.birthYear + ' – ' + (life.dead ? life.dead.year : life.year);
    g.fillText(years + ' · ' + life.c.name, 72, 320);

    g.font = '400 32px system-ui, sans-serif';
    g.fillStyle = '#d6cfc0';
    var y = wrap(g, life.summary(), 72, 400, W - 144, 46);

    /* карта жизни */
    var cols = 20, size = 36, gap = 8;
    var startY = y + 40;
    g.fillStyle = '#a9a294';
    g.font = '400 26px system-ui, sans-serif';
    g.fillText('КАРТА ЖИЗНИ · 1 КЛЕТКА = 1 ГОД', 72, startY);
    startY += 28;
    life.history.forEach(function (h, i) {
      var cx = 72 + (i % cols) * (size + gap);
      var cy = startY + Math.floor(i / cols) * (size + gap);
      var score = (h.happy * 0.5 + h.health * 0.3 + h.bond * 0.2) / 100;
      g.fillStyle = 'hsl(' + (10 + score * 115).toFixed(0) + ' 52% ' + (24 + score * 30).toFixed(0) + '%)';
      g.fillRect(cx, cy, size, size);
    });

    g.fillStyle = '#e8b45a';
    g.font = 'italic 400 34px system-ui, sans-serif';
    wrap(g, '«' + life.epitaph() + '»', 72, H - 190, W - 144, 46);

    g.fillStyle = '#6f6a5f';
    g.font = '400 24px system-ui, sans-serif';
    g.fillText('Игровая симуляция на открытой статистике. Статистика настоящая, человек — нет.', 72, H - 70);

    return cv;
  }

  function wrap(g, text, x, y, maxW, lh) {
    var words = String(text).split(' ');
    var line = '';
    for (var i = 0; i < words.length; i++) {
      var test = line ? line + ' ' + words[i] : words[i];
      if (g.measureText(test).width > maxW && line) {
        g.fillText(line, x, y); y += lh; line = words[i];
      } else line = test;
    }
    if (line) { g.fillText(line, x, y); y += lh; }
    return y;
  }

  window.IN8B = window.IN8B || {};
  window.IN8B.charts = {
    lifeMap: lifeMap,
    survival: survival,
    statLines: statLines,
    birthBars: birthBars,
    shareCard: shareCard,
    kindColor: KIND_COLOR
  };
})();
