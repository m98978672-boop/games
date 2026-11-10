/* ============================================================
   1 ИЗ 8 МИЛЛИАРДОВ — точка входа: экраны, ход времени, управление.
   ============================================================ */
(function () {
  'use strict';

  var M = window.IN8B.model;
  var C = window.IN8B.countries;
  var EN = window.IN8B.engine;
  var UI = window.IN8B.ui;
  var SAVE = window.IN8B.save;
  var PR = window.IN8B.portrait;
  var CH = window.IN8B.charts;
  var el = UI.el;

  var S = {
    settings: SAVE.loadSettings(),
    life: null,
    peers: [],
    speed: 1,
    paused: false,
    blocked: false,       // ждём ответа игрока
    skipping: false,
    acc: 0,
    last: 0,
    opened: Date.now(),
    view: null,       /* анимированный портрет */
    endView: null,
    capTimer: null
  };

  /* ======================= стартовый экран =========================== */

  function initStart() {
    UI.fillStartSelects(S.settings);
    CH.birthBars(el('birth-bars'), S.settings.drawMode, 9);
    UI.renderPastList();
    tickCounters();
    setInterval(tickCounters, 1000);

    segment('seg-era', S.settings.era, function (v) {
      S.settings.era = v;
      el('year-field').hidden = v !== 'past';
      el('era-hint').textContent = {
        past: 'Мир прошлого: статистика того года — ниже доходы, выше смертность, больше детей в семьях.',
        today: 'Проживите целую жизнь в сегодняшнем мире. Сегодняшняя статистика сохраняется до конца.',
        future: 'Мир будущего: продолжительность жизни выше, рождаемость ниже, доходы больше.',
        any: 'Год рождения выпадет случайно между 1950 и 2100.'
      }[v];
      saveSettings();
    });
    segment('seg-draw', S.settings.drawMode, function (v) {
      S.settings.drawMode = v;
      CH.birthBars(el('birth-bars'), v, 9);
      saveSettings();
    });
    segment('seg-len', String(S.settings.lifeMinutes), function (v) {
      S.settings.lifeMinutes = Number(v);
      saveSettings();
    });

    el('opt-soft').checked = !!S.settings.soft;
    el('opt-soft').addEventListener('change', function () {
      S.settings.soft = el('opt-soft').checked; saveSettings();
    });
    el('sel-home').addEventListener('change', function () {
      S.settings.homeCountry = el('sel-home').value; saveSettings();
    });
    el('sel-currency').addEventListener('change', function () {
      S.settings.currency = el('sel-currency').value;
      S.settings.curSet = true;
      UI.setCurrency(S.settings.currency);
      saveSettings();
    });
    el('sel-year').addEventListener('change', function () {
      S.settings.year = Number(el('sel-year').value); saveSettings();
    });

    el('btn-born').addEventListener('click', newLife);
    el('btn-batch').addEventListener('click', function () {
      UI.batchModal({
        era: S.settings.era,
        year: S.settings.era === 'past' ? (S.settings.year || Number(el('sel-year').value) || 2000) : null,
        drawMode: S.settings.drawMode,
        soft: S.settings.soft,
        homeCountry: el('sel-home') && el('sel-home').value ? el('sel-home').value : null
      });
    });
    el('btn-countries').addEventListener('click', function () { UI.countriesModal(S.settings.drawMode); });
    el('btn-who').addEventListener('click', UI.whoModal);
    el('btn-clear-past').addEventListener('click', function () {
      if (confirm('Удалить все записи о прошлых жизнях? Вернуть их нельзя.')) {
        SAVE.clearPast(); UI.renderPastList(); UI.toast('Записи удалены');
      }
    });

    var saved = SAVE.peekLife();
    if (saved && saved.alive) {
      var b = el('btn-continue');
      b.hidden = false;
      b.textContent = 'Продолжить: ' + saved.name + ', ' + saved.age + ' л.';
      b.addEventListener('click', continueLife);
    }
  }

  function segment(id, value, onPick) {
    var box = el(id);
    box.querySelectorAll('button').forEach(function (b) {
      b.classList.toggle('on', b.dataset.v === String(value));
      b.addEventListener('click', function () {
        box.querySelectorAll('button').forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        onPick(b.dataset.v);
      });
    });
    onPick(String(value));
  }

  function saveSettings() { SAVE.saveSettings(S.settings); }

  /* счётчики рождений и смертей с момента открытия страницы */
  function tickCounters() {
    var sec = (Date.now() - S.opened) / 1000;
    el('cnt-born').textContent = M.fmtNum(Math.floor(sec * 4.2));
    el('cnt-died').textContent = M.fmtNum(Math.floor(sec * 1.9));
  }

  /* ========================= запуск жизни ============================ */

  function newLife() {
    var seed = 'life-' + Date.now() + '-' + Math.floor(Math.random() * 1e6);
    var settings = {
      era: S.settings.era,
      year: S.settings.era === 'past' ? (S.settings.year || Number(el('sel-year').value) || 2000) : null,
      drawMode: S.settings.drawMode,
      soft: S.settings.soft,
      lifeMinutes: S.settings.lifeMinutes
    };
    var life = new EN.Life({ seed: seed, settings: settings });
    S.life = life;
    S.peers = EN.siblingsOfSecond(seed, settings, 4);
    UI.birthCard(life, function () { enterLife(true); });
  }

  function continueLife() {
    var life = SAVE.loadLife();
    if (!life) { UI.toast('Сохранение не читается', 'bad'); return; }
    S.life = life;
    S.peers = EN.siblingsOfSecond(life.seed, life.settings, 4);
    enterLife(false);
  }

  function enterLife(fresh) {
    el('screen-start').hidden = true;
    el('screen-end').hidden = true;
    el('screen-life').hidden = false;
    S.paused = false;
    S.blocked = false;
    S.acc = 0;
    S.last = performance.now();
    setSpeed(S.speed);
    paintPause();
    UI.renderAll(S.life, S.peers, onPlayerChange);
    startPortrait(fresh);
    if (S.life.pendingDecision) askDecision();
    if (fresh) UI.toast('Жизнь началась. Время идёт само — можно поставить паузу.', 'win');
    requestAnimationFrame(frame);
  }

  function onPlayerChange() {
    UI.renderPerson(S.life);
    UI.renderStats(S.life);
  }

  /* ============================ ход времени ========================== */

  function yearSeconds() {
    var life = S.life;
    var expect = life.sex === 'f' ? life.c.leF : life.c.leM;
    return (life.settings.lifeMinutes * 60) / Math.max(expect, 25);
  }

  function frame(now) {
    if (!S.life || el('screen-life').hidden) return;
    var dt = Math.min(250, now - S.last);
    S.last = now;

    var active = !S.paused && !S.blocked && S.life.alive;
    if (active) {
      var ys = yearSeconds() / (S.skipping ? 24 : S.speed);
      S.acc += dt / 1000;
      while (S.acc >= ys && S.life.alive && !S.blocked) {
        S.acc -= ys;
        advanceYear();
      }
      el('year-bar').style.width = Math.min(100, (S.acc / ys) * 100).toFixed(1) + '%';
    }
    requestAnimationFrame(frame);
  }

  /* события, ради которых стоит остановить время */
  var BIG_EVENT = /родил|свадьб|пожен|замуж|женил|развод|умер|ушёл из жизни|ушла из жизни|похорон|война|перееха|переезд|уволен|повышен|диплом|поступил|своё дело|больниц|операц|эмигр/i;

  function advanceYear() {
    var life = S.life;
    var before = life.log.length;
    var decision = life.stepYear();

    UI.renderPerson(life);
    UI.renderStats(life);
    UI.renderLog(life);
    UI.renderFamily(life);
    UI.renderFocus(life, onPlayerChange);
    UI.renderBudget(life, onPlayerChange);
    UI.renderPeers(S.peers, life.age);
    if (life.age % 2 === 0 || !life.alive) UI.renderLifeMap(life);
    if (S.view) { S.view.syncYear(life, life.log.slice(before)); paintPortraitCaption(); }

    if (S.skipping && life.log.length > before) {
      var fresh = life.log.slice(before).filter(function (e) { return e.kind !== 'life'; });
      if (fresh.length) S.skipping = false;
    }

    if (life.age % 5 === 0 && life.alive) SAVE.saveLife(life);

    if (!life.alive) { finishLife(); return; }

    if (decision) {
      S.skipping = false;
      if (S.settings.auto) {
        life.autoAnswer();
        UI.renderLog(life);
        UI.renderPerson(life);
      } else {
        askDecision();
      }
      return;
    }

    /* музыка: нота на год и отклик на событие */
    var SND = window.IN8B.sound;
    if (SND && SND.isOn()) {
      SND.year(life.age);
      var fresh3 = life.log.slice(before);
      for (var fi = 0; fi < fresh3.length; fi++) {
        if (fresh3[fi].kind === 'bad' || fresh3[fi].kind === 'good') { SND.event(fresh3[fi].kind); break; }
      }
    }

    /* появились ли новые доступные траты */
    if (window.IN8B.purchases) {
      var nb = window.IN8B.purchases.availableFor(life).length;
      S.newBuys = S.lastBuys != null && nb > S.lastBuys;
      S.lastBuys = nb;
    }

    /* паузы по настройке игрока */
    var on = S.settings.pauseOn || {};
    if (!S.paused && !S.skipping && life.alive) {
      var fresh2 = life.log.slice(before);
      var big = fresh2.filter(function (e) { return BIG_EVENT.test(e.text); });
      if (on.year) { S.paused = true; paintPause(); }
      else if (on.big && big.length) {
        S.paused = true; paintPause();
        UI.toast(big[0].text.slice(0, 90));
      } else if (on.buy && S.newBuys) { S.paused = true; paintPause(); UI.toast('В этом году есть на что потратить деньги'); }
    }
    S.newBuys = false;

    if (life.pendingReflection && !S.settings.auto) {
      S.skipping = false;
      var refl = life.pendingReflection;
      life.pendingReflection = null;
      S.blocked = true;
      UI.reflectionModal(life, refl, function () {
        S.blocked = false;
        UI.renderLog(life);
      });
    } else {
      life.pendingReflection = null;
    }
  }

  function askDecision() {
    var life = S.life;
    S.blocked = true;
    UI.decisionModal(life, life.pendingDecision, function (i) {
      life.answer(i);
      S.blocked = false;
      UI.renderAll(life, S.peers, onPlayerChange);
      SAVE.saveLife(life);
      if (!life.alive) finishLife();
    });
  }

  function finishLife() {
    var life = S.life;
    if (window.IN8B.sound && window.IN8B.sound.isOn()) window.IN8B.sound.farewell();
    SAVE.clearLife();
    SAVE.addPastLife(life);
    UI.renderPastList();
    setTimeout(function () {
      el('screen-life').hidden = true;
      el('screen-end').hidden = false;
      window.scrollTo(0, 0);
      UI.endScreen(life, S.peers, S.settings.homeCountry);
      stopPortrait();
      showEndPortrait(life);
    }, 900);
  }

  /* ============================ управление =========================== */

  /* ====================== ПОРТРЕТ И ТРАТЫ ============================ */

  function startPortrait(fresh) {
    if (!PR || !S.life) return;
    var cv = el('portrait');
    if (!cv || !cv.getContext) return;
    if (!S.view) {
      S.view = new PR.Portrait(cv);
      window.addEventListener('resize', function () { if (S.view) S.view.resize(); });
    }
    S.view.resize();
    S.view.setLife(S.life);
    S.view.play(fresh && S.life.age < 1 ? 'idle-newborn' : 'age-morph');
    S.view.start();
    paintPortraitCaption();
    if (!S.capTimer) S.capTimer = setInterval(paintPortraitCaption, 700);
  }

  function stopPortrait() {
    if (S.view) S.view.stop();
    if (S.capTimer) { clearInterval(S.capTimer); S.capTimer = null; }
  }

  var SCENE_RU = {
    home: 'дома', village: 'деревня', city: 'город', room: 'комната', school: 'школа',
    office: 'работа', factory: 'цех', field: 'поле', hospital: 'больница', park: 'улица', night: 'ночь'
  };

  function paintPortraitCaption() {
    if (!S.view || !S.life) return;
    var life = S.life;
    var cl = el('portrait-clip');
    if (cl) cl.textContent = S.view.currentName();

    var sc = el('portrait-scene');
    var mt = el('portrait-meta');
    if (!sc || !mt) return;
    var N = window.IN8B.names;
    var place = N && N.place ? N.place(life.base.code, life.seed, life.urban) : (life.urban ? 'город' : 'село');
    var home = life.age < 19 ? (life.urban ? 'квартира родителей' : 'дом родителей')
      : life.home ? 'свой дом' : life.urban ? 'съёмная квартира' : 'дом в селе';
    var fam = PR.familyInfo(life);
    var with1;
    if (life.age < 19) {
      with1 = fam.mom || fam.dad ? 'с ' + (fam.mom && fam.dad ? 'родителями' : fam.mom ? 'матерью' : 'отцом') : 'без родителей';
      if (life.siblings) with1 += ' и ' + life.siblings + ' ' +
        M.plural(life.siblings, 'братом или сестрой', 'братьями и сёстрами', 'братьями и сёстрами');
    } else if (fam.partner && fam.kids.length) {
      with1 = 'с ' + (life.sex === 'f' ? 'мужем' : 'женой') + ' и ' + fam.kids.length + ' ' +
        M.plural(fam.kids.length, 'ребёнком', 'детьми', 'детьми');
    } else if (fam.partner) {
      with1 = 'с ' + (life.sex === 'f' ? 'мужем' : 'женой');
    } else if (fam.kids.length) {
      with1 = 'с ' + fam.kids.length + ' ' + M.plural(fam.kids.length, 'ребёнком', 'детьми', 'детьми');
    } else {
      with1 = life.age < 30 && fam.mom ? 'с матерью' : 'один' + (life.sex === 'f' ? 'а' : '');
    }
    sc.textContent = place + ', ' + life.c.name + ' · ' + home + ' · ' + with1;

    var parts = ['Я, ' + life.age + ' ' + M.plural(life.age, 'год', 'года', 'лет')];
    if (fam.mom) parts.push('Мать, ' + fam.mom);
    if (fam.dad) parts.push('Отец, ' + fam.dad);
    if (fam.partner) parts.push((life.sex === 'f' ? 'Муж, ' : 'Жена, ') + fam.partner.age);
    if (life.age < 19 && life.siblings) parts.push('Братья и сёстры, ' + life.siblings);
    fam.kids.slice(0, 4).forEach(function (k) { parts.push(k.name + ', ' + k.age); });
    mt.textContent = parts.join(' · ');
  }

  function showEndPortrait(life) {
    if (!PR) return;
    var cv = el('end-portrait');
    if (!cv || !cv.getContext) return;
    if (!S.endView) S.endView = new PR.Portrait(cv);
    S.endView.resize();
    S.endView.setLife(life);
    S.endView.play('farewell');
    S.endView.start();
  }

  function openInvest() {
    if (!S.life || !S.life.alive || !UI.investModal) return;
    if (el('screen-life').hidden) return;
    var wasPaused = S.paused;
    S.blocked = true;
    S.paused = true;
    paintPause();
    var wrap = UI.investModal(S.life, function () {
      UI.renderPerson(S.life);
      UI.renderStats(S.life);
      UI.renderLog(S.life);
    });
    if (!wrap) { S.blocked = false; S.paused = wasPaused; paintPause(); return; }
    wrap.onClosed = function () {
      S.blocked = false;
      S.paused = wasPaused;
      paintPause();
      S.last = performance.now();
      S.acc = 0;
    };
  }

  /* сделка сразу видна на сцене */
  window.IN8B.onInvest = function (res) {
    if (!S.view) return;
    var id = res.kind === 'biz' ? 'open-business' : res.kind === 'sell' ? 'count-money' : 'count-money';
    S.view.play(PR.byId[id] ? id : 'smile-wide');
    paintPortraitCaption();
  };

  function openSpend() {
    if (!S.life || !S.life.alive || !UI.spendModal) return;
    if (el('screen-life').hidden) return;
    var wasPaused = S.paused;
    S.blocked = true;
    var wrap = UI.spendModal(S.life, function () {
      UI.renderPerson(S.life);
      UI.renderStats(S.life);
      UI.renderBudget(S.life, onPlayerChange);
      UI.renderLog(S.life);
      UI.renderFamily(S.life);
    });
    if (!wrap) { S.blocked = false; return; }
    wrap.onClosed = function () {
      S.blocked = false;
      S.paused = wasPaused;
      S.last = performance.now();
      S.acc = 0;
    };
  }

  /* покупка сразу видна на портрете */
  var BUY_CLIP = {
    edu: 'read-book', health: 'hospital', home: 'buy-house', move: 'walk',
    work: 'open-business', family: 'hold-hands', fun: 'dance', thing: 'carry-bag', give: 'volunteer'
  };

  window.IN8B.onPurchase = function (item) {
    if (!S.view) return;
    var id = BUY_CLIP[item.g];
    S.view.play(PR.byId[id] ? id : 'smile-wide');
    paintPortraitCaption();
  };

  /* скорость времени и подпись «1 год ≈ N сек» — как в оригинале */
  function setSpeed(v) {
    S.speed = v;
    var box = el('speeds');
    if (box) box.querySelectorAll('button[data-v]').forEach(function (b) {
      b.classList.toggle('on', Number(b.dataset.v) === v);
    });
    paintRate();
  }

  function paintRate() {
    var box = el('hud-rate');
    if (!box || !S.life) return;
    var sec = yearSeconds() / S.speed;
    box.textContent = '1 год ≈ ' + (sec >= 10 ? Math.round(sec) : sec.toFixed(1).replace('.', ',')) + ' сек';
  }

  function paintMusic() {
    var b = el('btn-music'), SND = window.IN8B.sound;
    if (!b) return;
    var now = !!(SND && SND.isOn());
    b.classList.toggle('on', now);
    b.textContent = now ? '♪ Музыка вкл.' : '♪ Музыка';
  }

  function paintPauseBtn() {
    var on = S.settings.pauseOn || {};
    var n = (on.big ? 1 : 0) + (on.year ? 1 : 0) + (on.buy ? 1 : 0);
    var b = el('btn-pauses');
    if (b) { b.textContent = n ? '✎ Паузы · ' + (n + 1) : '✎ Паузы'; b.classList.toggle('on', !!n); }
  }

  function paintPause() {
    var b = el('btn-pause');
    if (!b) return;
    b.textContent = S.paused ? '▶ Продолжить' : '❙❙ Пауза';
    b.classList.toggle('on', S.paused);
  }

  function initLifeControls() {
    el('btn-pause').addEventListener('click', togglePause);
    el('speeds').addEventListener('click', function (e) {
      var b = e.target.closest('button[data-v]');
      if (b) setSpeed(Number(b.dataset.v));
    });
    el('btn-auto').addEventListener('click', function () {
      S.settings.auto = !S.settings.auto;
      el('btn-auto').classList.toggle('on', S.settings.auto);
      saveSettings();
      UI.toast(S.settings.auto ? 'Авторежим: решения принимаются нейтрально' : 'Решения снова за вами');
      if (S.settings.auto && S.life && S.life.pendingDecision) {
        UI.closeTop();
        S.life.autoAnswer();
        S.blocked = false;
        UI.renderAll(S.life, S.peers, onPlayerChange);
      }
    });
    el('btn-skip').addEventListener('click', function () {
      S.skipping = true;
      S.paused = false;
      paintPause();
      UI.toast('Вперёд до следующего события');
    });
    el('btn-help').addEventListener('click', UI.helpModal);
    el('btn-spend').addEventListener('click', openSpend);
    el('btn-spend-2').addEventListener('click', openSpend);
    el('btn-invest').addEventListener('click', openInvest);
    el('btn-invest-2').addEventListener('click', openInvest);
    el('btn-anims').addEventListener('click', function () { UI.animsModal(S.view); });
    el('btn-things').addEventListener('click', function () { UI.thingsModal(); });
    el('btn-music').addEventListener('click', function () {
      var SND = window.IN8B.sound;
      if (!SND || !SND.available) { UI.toast('Браузер не умеет играть звук'); return; }
      var now = SND.toggle();
      S.settings.music = now;
      saveSettings();
      paintMusic();
      UI.toast(now ? 'Тихий фон и нота на каждый прожитый год' : 'Музыка выключена');
    });
    el('btn-more').addEventListener('click', function () { UI.moreModal(); });
    el('btn-pauses').addEventListener('click', function () {
      UI.pausesModal(S.settings, function () { saveSettings(); paintPauseBtn(); });
    });
    el('btn-scene-more').addEventListener('click', function () { UI.animsModal(S.view); });
    el('btn-quit').addEventListener('click', function () {
      if (S.life && S.life.alive) {
        SAVE.saveLife(S.life);
        UI.toast('Жизнь сохранена — можно продолжить позже', 'good');
      }
      toStart();
    });

    el('btn-new-life').addEventListener('click', function () {
      el('screen-end').hidden = true;
      newLife();
    });
    el('btn-share').addEventListener('click', function () { UI.downloadShare(S.life); });
    el('btn-to-start').addEventListener('click', toStart);

    el('mobile-tabs').querySelectorAll('button').forEach(function (b) {
      b.addEventListener('click', function () {
        el('mobile-tabs').querySelectorAll('button').forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        document.querySelectorAll('.life-grid .col').forEach(function (c) {
          c.classList.toggle('on', c.dataset.tab === b.dataset.tab);
        });
      });
    });
    document.querySelectorAll('.life-grid .col').forEach(function (c) {
      c.classList.toggle('on', c.dataset.tab === 'life');
    });

    document.addEventListener('keydown', function (e) {
      if (/input|textarea|select/i.test((e.target.tagName || ''))) return;
      if (el('screen-life').hidden) return;
      if (e.code === 'Space') { e.preventDefault(); togglePause(); }
      else if (e.key === '1') setSpeed(1);
      else if (e.key === '2') setSpeed(2);
      else if (e.key === '4') setSpeed(4);
      else if (e.key === '8') setSpeed(8);
      else if (e.key === 'h' || e.key === 'H' || e.key === 'р' || e.key === 'Р') UI.helpModal();
      else if (e.key === 'a' || e.key === 'A' || e.key === 'ф' || e.key === 'Ф') el('btn-auto').click();
      else if (e.key === 't' || e.key === 'T' || e.key === 'е' || e.key === 'Е') openSpend();
      else if (e.key === 'i' || e.key === 'I' || e.key === 'ш' || e.key === 'Ш') openInvest();
    });
  }

  function togglePause() {
    S.paused = !S.paused;
    paintPause();
  }

  function toStart() {
    stopPortrait();
    el('screen-life').hidden = true;
    el('screen-end').hidden = true;
    el('screen-start').hidden = false;
    S.life = null;
    window.scrollTo(0, 0);
    UI.renderPastList();
    var saved = SAVE.peekLife();
    var b = el('btn-continue');
    if (saved && saved.alive) {
      b.hidden = false;
      b.textContent = 'Продолжить: ' + saved.name + ', ' + saved.age + ' л.';
    } else b.hidden = true;
  }

  /* ============================== старт ============================== */

  function boot() {
    UI.setCurrency(S.settings.currency || 'local');
    initStart();
    initLifeControls();
    el('btn-auto').classList.toggle('on', !!S.settings.auto);
    paintPauseBtn();
    /* музыка включается только по жесту игрока — ждём первого клика */
    var SND0 = window.IN8B.sound;
    if (S.settings.music && SND0 && SND0.available) {
      var once = function () {
        document.removeEventListener('click', once);
        SND0.set(true);
        paintMusic();
      };
      document.addEventListener('click', once);
    }
    window.addEventListener('beforeunload', function () {
      if (S.life && S.life.alive) SAVE.saveLife(S.life);
    });
    window.addEventListener('resize', function () {
      if (S.life && !el('screen-life').hidden) UI.renderLifeMap(S.life);
      if (S.life && !el('screen-end').hidden) CH.survival(el('end-survival'), S.life, S.settings.homeCountry);
    });
  }

  /* доступ к состоянию для отладки и автотестов страницы */
  window.IN8B.state = S;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
