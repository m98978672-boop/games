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
      UI.setCurrency(S.settings.currency);
      saveSettings();
    });
    el('sel-year').addEventListener('change', function () {
      S.settings.year = Number(el('sel-year').value); saveSettings();
    });

    el('btn-born').addEventListener('click', newLife);
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
    var sc = el('portrait-scene');
    var cl = el('portrait-clip');
    if (sc) sc.textContent = (SCENE_RU[S.view.scene] || S.view.scene) + ' · ' + UI.stageName(S.life.age);
    if (cl) cl.textContent = S.view.currentName();
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

  function initLifeControls() {
    el('btn-pause').addEventListener('click', togglePause);
    el('btn-speed').addEventListener('click', function () {
      S.speed = S.speed === 1 ? 2 : S.speed === 2 ? 4 : S.speed === 4 ? 8 : 1;
      el('btn-speed').textContent = S.speed + '×';
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
      el('btn-pause').textContent = '⏸';
      UI.toast('Вперёд до следующего события');
    });
    el('btn-help').addEventListener('click', UI.helpModal);
    el('btn-spend').addEventListener('click', openSpend);
    el('btn-spend-2').addEventListener('click', openSpend);
    el('btn-anims').addEventListener('click', function () { UI.animsModal(S.view); });
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
      else if (e.key === '1') { S.speed = 1; el('btn-speed').textContent = '1×'; }
      else if (e.key === '2') { S.speed = 2; el('btn-speed').textContent = '2×'; }
      else if (e.key === '4') { S.speed = 4; el('btn-speed').textContent = '4×'; }
      else if (e.key === '8') { S.speed = 8; el('btn-speed').textContent = '8×'; }
      else if (e.key === 'h' || e.key === 'H' || e.key === 'р' || e.key === 'Р') UI.helpModal();
      else if (e.key === 'a' || e.key === 'A' || e.key === 'ф' || e.key === 'Ф') el('btn-auto').click();
      else if (e.key === 't' || e.key === 'T' || e.key === 'е' || e.key === 'Е') openSpend();
    });
  }

  function togglePause() {
    S.paused = !S.paused;
    el('btn-pause').textContent = S.paused ? '▶' : '⏸';
    el('btn-pause').classList.toggle('on', S.paused);
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
    UI.setCurrency(S.settings.currency || 'int');
    initStart();
    initLifeControls();
    el('btn-auto').classList.toggle('on', !!S.settings.auto);
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
