// Интерфейс: пульт управления, карточки бригады, очередь заказов,
// инспектор тела (3D-разрез + органы + мозг), справка и итоги смены.
window.WC = window.WC || {};
(function bootUiFactory(global) {
  'use strict';

  if (!global || !global.document) {
    // В Node (тесты логики) интерфейс не нужен — отдаём пустую заглушку.
    global.WC = global.WC || {};
    global.WC.ui = { init: function () {}, frame: function () {}, openInspector: function () {}, openHelp: function () {}, openShiftEnd: function () {} };
    return;
  }

  var U = global.WC.util;
  var game = global.WC.game;
  var cfg = global.WC.CONFIG;

  var dom = {};
  var uiState = {
    inspectorOpen: false,
    inspectorTab: 'body',
    inspectorWorkerId: null,
    helpOpen: false,
    lastUiAt: 0,
    newsIndex: 0,
    orderRows: new Map(),
    nums: {},
    sheet: 'half',
  };

  var NEWS = [
    'Совет смены: у Гриши больше всех силы — кидай его на тяжёлые коробки.',
    'Марта вынослива: держит темп всю смену, но берёт не всё.',
    'Тимур аккуратен: у него меньше всего порчи груза.',
    'Загляни в инспектор (I): там видно, как бьётся сердце и что делает мозг.',
    'Стресс растёт от срочных заказов. Перерыв дешевле, чем упавшая коробка.',
    'Автономия — это не «без управления»: нейросеть решает, но приказы главнее.',
  ];

  function q(id) { return document.getElementById(id); }

  function cacheDom() {
    dom.score = q('hud-score');
    dom.orders = q('hud-orders');
    dom.quality = q('hud-quality');
    dom.time = q('hud-time');
    dom.crewTabs = q('crew-tabs');
    dom.selectedCard = q('selected-card');
    dom.orderList = q('order-list');
    dom.queueCount = q('queue-count');
    dom.side = q('side');
    dom.pauseFlag = q('pause-flag');
    dom.modalRoot = q('modal-root');
    dom.hint = q('hint');
    dom.news = q('news');
    dom.ctlTick = q('ctl-tick');
    dom.cameraSeg = q('camera-seg');
    dom.speedSeg = q('speed-seg');
    dom.qbName = q('qb-name');
    dom.qbState = q('qb-state');
    dom.shiftFill = q('shift-fill');
    dom.sheetHandle = q('sheet-handle');
    dom.viewFlash = q('view-flash');
    dom.panel = q('control-panel');
  }

  // --------------------------------------------------- мелочи «на ощупь»
  function buzz(pattern) {
    if (!document.body.classList.contains('is-touch')) return;
    if (navigator && typeof navigator.vibrate === 'function') {
      try { navigator.vibrate(pattern); } catch (err) { /* iOS не умеет — молчим */ }
    }
  }

  // Волна от точки нажатия: работает на любом button/.cmd/.qb/.tab
  var rippleSelector = 'button, .cmd, .qb, .tab, .cc-actions button, .o-take';
  function wireRipple() {
    document.addEventListener('pointerdown', function (event) {
      var target = event.target && event.target.closest ? event.target.closest(rippleSelector) : null;
      if (!target || target.disabled) return;
      var rect = target.getBoundingClientRect();
      if (!rect.width) return;
      var size = Math.max(rect.width, rect.height) * 0.9;
      var wave = document.createElement('span');
      wave.className = 'ripple';
      wave.style.width = wave.style.height = size + 'px';
      wave.style.left = (event.clientX - rect.left - size / 2) + 'px';
      wave.style.top = (event.clientY - rect.top - size / 2) + 'px';
      if (getComputedStyle(target).position === 'static') target.style.position = 'relative';
      target.appendChild(wave);
      setTimeout(function () { if (wave.parentNode) wave.parentNode.removeChild(wave); }, 600);
    }, { passive: true });
  }

  function flashView() {
    if (!dom.viewFlash) return;
    dom.viewFlash.classList.remove('go');
    // перезапуск анимации: читаем layout принудительно
    void dom.viewFlash.offsetWidth;
    dom.viewFlash.classList.add('go');
  }

  // Плавные числа: каждый кадр интерфейса (110 мс) подтягиваем к цели.
  function stepNumber(key, target) {
    var current = uiState.nums[key];
    if (current == null) current = target;
    var diff = target - current;
    if (Math.abs(diff) < 1) current = target;
    else current += diff * 0.42;
    uiState.nums[key] = current;
    return Math.round(current);
  }

  function bump(node, down) {
    if (!node) return;
    var host = node.parentNode;
    if (!host) return;
    host.classList.remove('bump', 'down');
    void host.offsetWidth;
    host.classList.add(down ? 'down' : 'bump');
    clearTimeout(host.__bumpTimer);
    host.__bumpTimer = setTimeout(function () { host.classList.remove('bump', 'down'); }, 700);
  }

  // ------------------------------------------------------- нижняя шторка
  // Три положения: hidden (только язычок), half (пол-экрана), full (почти весь).
  // На десктопе шторки нет — панель просто стоит слева, CSS это учитывает.
  var sheet = {
    heights: { half: 380, full: 620 },
    min: 120,
    init: function () {
      var self = this;
      this.measure();
      var isPhone = document.body.classList.contains('is-phone');
      this.set(isPhone ? 'hidden' : 'half', true);
      if (WC.layout) {
        WC.layout.onChange(function () {
          self.measure();
          if (uiState.sheet !== 'hidden') self.set(uiState.sheet, true);
        });
      }
      var handle = dom.sheetHandle;
      if (!handle) return;
      var drag = null;
      handle.addEventListener('pointerdown', function (event) {
        if (!document.body.classList.contains('is-phone') && !document.body.classList.contains('is-tablet')) return;
        drag = { y: event.clientY, h: self.currentHeight(), moved: 0 };
        dom.panel.classList.add('dragging');
        handle.setPointerCapture && handle.setPointerCapture(event.pointerId);
      });
      handle.addEventListener('pointermove', function (event) {
        if (!drag) return;
        var dy = drag.y - event.clientY;
        drag.moved = Math.max(drag.moved, Math.abs(dy));
        var next = Math.max(self.min, Math.min(self.heights.full, drag.h + dy));
        self.applyHeight(next);
        document.body.setAttribute('data-sheet', next > self.heights.half * 0.72 ? 'full' : 'half');
      });
      var finish = function () {
        if (!drag) return;
        dom.panel.classList.remove('dragging');
        var wasDrag = drag.moved > 6;
        var h = self.currentHeight();
        drag = null;
        if (!wasDrag) {
          self.set(uiState.sheet === 'hidden' ? 'half' : 'hidden');
          return;
        }
        if (h < self.heights.half * 0.72) self.set(h < self.heights.half * 0.45 ? 'hidden' : 'half');
        else self.set('full');
      };
      handle.addEventListener('pointerup', finish);
      handle.addEventListener('pointercancel', finish);
      handle.addEventListener('pointerleave', function () { if (!drag) return; });
    },
    measure: function () {
      var box = WC.layout ? WC.layout.sheetHeights() : null;
      var h = WC.layout ? WC.layout.state.h : window.innerHeight;
      this.heights.half = box ? box.half : Math.round(h * 0.56);
      this.heights.full = box ? box.full : Math.round(h - 70);
      this.min = Math.round(120 * (WC.layout ? WC.layout.state.ui : 1));
      if (uiState.sheet !== 'hidden') this.applyHeight(this.heights[uiState.sheet] || this.heights.half);
    },
    currentHeight: function () {
      if (dom.panel && dom.panel.getBoundingClientRect) {
        var h = dom.panel.getBoundingClientRect().height;
        if (h > 0) return h;
      }
      return this.heights[uiState.sheet] || this.heights.half;
    },
    applyHeight: function (px) {
      document.documentElement.style.setProperty('--sheet-h', Math.round(px) + 'px');
    },
    set: function (name, silent) {
      uiState.sheet = name;
      document.body.setAttribute('data-sheet', name);
      if (name !== 'hidden') this.applyHeight(this.heights[name] || this.heights.half);
      var collapse = document.getElementById('btn-panel-collapse');
      var handle = dom.sheetHandle;
      if (collapse) collapse.setAttribute('aria-expanded', name === 'hidden' ? 'false' : 'true');
      if (handle) handle.setAttribute('aria-expanded', name === 'hidden' ? 'false' : 'true');
      if (!silent) {
        buzz(8);
        if (name === 'hidden') U.toast('Пульт свёрнут — приказы в панели снизу', 'info', 1800);
      }
    },
    toggle: function () {
      this.set(uiState.sheet === 'hidden' ? 'half' : 'hidden');
    },
  };

  // ------------------------------------------------------------------ пульт
  function buildCrewTabs() {
    dom.crewTabs.innerHTML = '';
    game.api.crew.forEach(function (worker, index) {
      var tab = U.el('button', {
        class: 'tab' + (worker.id === game.api.activeWorkerId ? ' on' : ''),
        'data-worker': worker.id,
        type: 'button',
        onclick: function () { select(worker.id); },
      }, [
        U.el('span', { class: 'dot', style: 'background:' + worker.state.palette.vest }),
        U.el('span', { text: worker.state.name.split(' ')[0] }),
        U.el('span', { class: 'key', text: String(index + 1) }),
      ]);
      dom.crewTabs.appendChild(tab);
    });
  }

  function select(id) {
    game.selectWorker(id);
    WC.world.setFocus(id);
    buildCrewTabs();
    renderSide();
  }

  function metric(label, value, cls, text) {
    return U.el('div', { class: 'metric ' + cls }, [
      U.el('span', { text: label }),
      U.el('div', { class: 'track' }, [U.el('i', { style: 'width:' + Math.round(U.clamp01(value) * 100) + '%' })]),
      U.el('span', { class: 'val', text: text }),
    ]);
  }

  // Карточка выбранного рабочего собирается ОДИН раз и потом только
  // обновляется: иначе переходы полосок и анимации перезапускались бы
  // каждые 110 мс и выглядели бы дёргано.
  var selected = { id: null, nodes: null };

  function buildSelectedCard(st) {
    var nodes = {};
    nodes.name = U.el('b', { text: st.name });
    nodes.role = U.el('span', { text: st.role });
    nodes.mode = U.el('b', { text: '' });
    nodes.state = U.el('b', { text: '' });
    nodes.energy = metric('Энергия', 0, 'energy', '0%').querySelector('i');
    nodes.energyVal = nodes.energy.parentNode.parentNode.querySelector('.val');
    nodes.fatigue = metric('Усталость', 0, 'fatigue', '0%').querySelector('i');
    nodes.fatigueVal = nodes.fatigue.parentNode.parentNode.querySelector('.val');
    nodes.stress = metric('Стресс', 0, 'stress', '0%').querySelector('i');
    nodes.stressVal = nodes.stress.parentNode.parentNode.querySelector('.val');
    nodes.oxygen = metric('Кислород', 0, 'oxygen', '0%').querySelector('i');
    nodes.oxygenVal = nodes.oxygen.parentNode.parentNode.querySelector('.val');
    nodes.traits = ['сила', 'точность', 'выносл.', 'командн.'].map(function (label) {
      var value = U.el('b', { text: '0' });
      var chip = U.el('span', { class: 'trait-chip' }, [U.el('span', { text: label + ' ' }), value]);
      return { chip: chip, value: value };
    });

    dom.selectedCard.innerHTML = '';
    dom.selectedCard.appendChild(U.el('div', { class: 'sc-top' }, [nodes.name, nodes.role]));
    dom.selectedCard.appendChild(U.el('div', { class: 'sc-mode' }, [U.el('span', { text: 'режим: ' }), nodes.mode]));
    dom.selectedCard.appendChild(U.el('div', { class: 'sc-state' }, [U.el('span', { text: 'сейчас: ' }), nodes.state]));
    [nodes.energy, nodes.fatigue, nodes.stress, nodes.oxygen].forEach(function (bar) {
      dom.selectedCard.appendChild(bar.parentNode.parentNode);
    });
    dom.selectedCard.appendChild(U.el('div', { class: 'trait-row' }, nodes.traits.map(function (t) { return t.chip; })));

    dom.selectedCard.classList.remove('swap');
    void dom.selectedCard.offsetWidth;
    dom.selectedCard.classList.add('swap');
    return nodes;
  }

  function setBar(bar, valNode, value, text) {
    if (!bar) return;
    bar.style.width = Math.round(U.clamp01(value) * 100) + '%';
    if (valNode) valNode.textContent = text;
  }

  function renderSelected() {
    var worker = game.activeWorker();
    if (!worker) return;
    var body = worker.body;
    var st = worker.state;
    var stateLabel = cfg.stateLabels[st.state] || st.state;

    if (selected.id !== st.id) {
      selected.nodes = buildSelectedCard(st);
      selected.id = st.id;
    }
    var n = selected.nodes;
    n.mode.textContent = st.mode === 'auto' ? 'автономия (нейросеть)' : 'ручной (пульт)';
    n.state.textContent = st.carryingId ? 'несёт коробку' : stateLabel;
    setBar(n.energy, n.energyVal, body.energy, U.pct(body.energy));
    setBar(n.fatigue, n.fatigueVal, body.fatigue, U.pct(body.fatigue));
    setBar(n.stress, n.stressVal, body.stress, U.pct(body.stress));
    setBar(n.oxygen, n.oxygenVal, body.oxygen, U.pct(body.oxygen));
    var traitValues = [st.traits.strength, st.traits.precision, st.traits.endurance, st.traits.coop];
    n.traits.forEach(function (trait, i) { trait.value.textContent = U.pctNum(traitValues[i]); });

    U.$$('.tabs .tab', dom.crewTabs).forEach(function (tab) {
      tab.classList.toggle('on', tab.getAttribute('data-worker') === st.id);
    });
    if (dom.qbName) dom.qbName.textContent = st.name.split(' ')[0];
    if (dom.qbState) {
      dom.qbState.textContent = (st.carryingId ? 'несёт коробку' : stateLabel) +
        ' · ' + (st.mode === 'auto' ? 'авто' : 'ручной');
    }
    U.$$('.qb').forEach(function (button) {
      button.classList.toggle('on', st.mode === 'auto' && button.getAttribute('data-quick') === 'auto');
    });
  }

  function renderOrders() {
    var active = game.sim.activeOrders();
    var now = game.sim.state.time;
    var live = {};
    dom.queueCount.textContent = String(active.length);
    active.slice(0, 14).forEach(function (order) {
      live[order.id] = true;
      var row = uiState.orderRows.get(order.id);
      if (!row) {
        row = U.el('div', { class: 'order' }, [
          U.el('div', { class: 'o-code', text: order.code }),
          U.el('div', { class: 'o-who', text: '' }),
          U.el('div', { class: 'o-line' }, [
            U.el('span', { class: 'o-info', text: '' }),
            U.el('span', { class: 'o-timer', text: '' }),
          ]),
          U.el('div', { class: 'o-line' }, [
            U.el('button', {
              class: 'o-take', type: 'button', text: 'взять',
              onclick: function () {
                var worker = game.activeWorker();
                var res = game.command(worker.id, 'pick', { orderId: order.id });
                if (!res.ok) U.toast(res.reason || 'Не получилось', 'bad');
                else U.toast(worker.state.name + ' идёт за ' + order.code, 'good');
              },
            }),
            U.el('span', { class: 'o-rack', text: 'ячейка ' + order.slotId }),
          ]),
        ]);
        uiState.orderRows.set(order.id, row);
        dom.orderList.appendChild(row);
      }
      row.classList.toggle('urgent', Boolean(order.urgent) && order.status !== 'stored');
      row.classList.toggle('carried', order.status === 'carried');
      var who = order.status === 'carried' ? 'несёт: ' + nameOf(order.carrier)
        : order.status === 'claimed' ? 'в работе: ' + nameOf(order.carrier) : 'на приёмке';
      row.querySelector('.o-who').textContent = who;
      row.querySelector('.o-info').textContent = order.goods + ' · ' + order.mass + ' кг' + (order.damage > 0.02 ? ' · брак ' + Math.round(order.damage * 100) + '%' : '');
      var left = order.deadline - now;
      var timer = row.querySelector('.o-timer');
      timer.textContent = left > 0 ? 'до ' + U.timeLeft(left) : 'просрочен ' + U.timeLeft(-left);
      timer.classList.toggle('late', left <= 0);
      timer.classList.toggle('soon', left > 0 && left < 18);
    });
    uiState.orderRows.forEach(function (row, id) {
      if (!live[id]) {
        if (row.parentNode) row.parentNode.removeChild(row);
        uiState.orderRows.delete(id);
      }
    });
  }

  function nameOf(id) {
    var worker = game.workerById(id);
    return worker ? worker.state.name.split(' ')[0] : '—';
  }

  // Правая колонка: карточки бригады и журнал. Собираются один раз —
  // иначе анимация появления карточек играла бы заново каждую секунду.
  var side = { built: false, cards: new Map(), logLen: -1, logBox: null };

  function buildSide() {
    dom.side.innerHTML = '';
    dom.side.appendChild(U.el('h3', { text: 'Бригада' }));
    game.api.crew.forEach(function (worker) {
      var st = worker.state;
      var nodes = {
        state: U.el('b', { text: '' }),
        mode: U.el('span', { text: '' }),
        energy: U.el('b', { text: '0' }),
        fatigue: U.el('b', { text: '0' }),
        delivered: U.el('b', { text: '0' }),
        auto: null,
      };
      var autoButton = U.el('button', {
        type: 'button', text: 'авто',
        onclick: function (event) { event.stopPropagation(); quick(st.id, 'auto'); },
      });
      nodes.auto = autoButton;
      var card = U.el('div', {
        class: 'crew-card',
        onclick: function () { select(st.id); },
      }, [
        U.el('div', { class: 'cc-head' }, [
          U.el('span', { class: 'cc-swatch', style: 'background:' + st.palette.vest }),
          U.el('div', {}, [
            U.el('div', { class: 'cc-name', text: st.name }),
            U.el('div', { class: 'cc-role', text: st.role }),
          ]),
        ]),
        U.el('div', { class: 'cc-state' }, [nodes.state, nodes.mode]),
        U.el('div', { class: 'cc-mini' }, [
          U.el('div', {}, [U.el('span', { text: 'энергия' }), nodes.energy]),
          U.el('div', {}, [U.el('span', { text: 'устал.' }), nodes.fatigue]),
          U.el('div', {}, [U.el('span', { text: 'сдал' }), nodes.delivered]),
        ]),
        U.el('div', { class: 'cc-actions' }, [
          U.el('button', { type: 'button', text: 'взять', onclick: function (event) { event.stopPropagation(); quick(st.id, 'pick'); } }),
          U.el('button', { type: 'button', text: 'нести', onclick: function (event) { event.stopPropagation(); quick(st.id, 'store'); } }),
          U.el('button', { type: 'button', text: 'перерыв', onclick: function (event) { event.stopPropagation(); quick(st.id, 'rest'); } }),
          autoButton,
        ]),
      ]);
      dom.side.appendChild(card);
      side.cards.set(st.id, { card: card, nodes: nodes });
    });
    dom.side.appendChild(U.el('h3', { text: 'Журнал смены' }));
    side.logBox = U.el('div', { class: 'log' });
    dom.side.appendChild(side.logBox);
    side.built = true;
    side.logLen = -1;
  }

  function renderSide() {
    if (!dom.side) return;
    if (!side.built) buildSide();
    game.api.crew.forEach(function (worker) {
      var entry = side.cards.get(worker.state.id);
      if (!entry) return;
      var st = worker.state;
      var body = worker.body;
      var stateLabel = cfg.stateLabels[st.state] || st.state;
      entry.nodes.state.textContent = st.carryingId ? 'несёт коробку' : stateLabel;
      entry.nodes.mode.textContent = st.mode === 'auto' ? 'авто' : 'ручной';
      entry.nodes.energy.textContent = U.pctNum(body.energy);
      entry.nodes.fatigue.textContent = U.pctNum(body.fatigue);
      entry.nodes.delivered.textContent = String(st.stats.delivered);
      entry.nodes.auto.classList.toggle('on', st.mode === 'auto');
      entry.card.classList.toggle('active', st.id === game.api.activeWorkerId);
      entry.card.classList.toggle('alarm', body.energy < 0.22 || body.pain > 0.4);
    });
    if (side.logLen !== game.api.log.length) {
      side.logLen = game.api.log.length;
      side.logBox.innerHTML = '';
      game.api.log.slice(-14).reverse().forEach(function (entry) {
        side.logBox.appendChild(U.el('div', {}, [
          U.el('time', { text: U.clockLabel(entry.t, cfg.shiftRealSeconds, cfg.shiftHours) }),
          U.el('span', { class: entry.tone, text: entry.text }),
        ]));
      });
    }
  }

  function quick(id, cmd) {
    var res = game.command(id, cmd);
    if (!res.ok) U.toast(res.reason || 'Приказ не выполнен', 'bad');
    renderSelected();
    renderSide();
  }

  function renderHud() {
    var snap = game.snapshotForUi();
    var score = stepNumber('score', snap.score);
    if (uiState.lastScore != null && snap.score > uiState.lastScore) bump(dom.score, false);
    if (uiState.lastScore != null && snap.score < uiState.lastScore) bump(dom.score, true);
    uiState.lastScore = snap.score;
    dom.score.textContent = U.money(score);

    var delivered = stepNumber('delivered', snap.delivered);
    if (uiState.lastDelivered != null && snap.delivered > uiState.lastDelivered) bump(dom.orders, false);
    uiState.lastDelivered = snap.delivered;
    dom.orders.textContent = delivered + (snap.missed ? ' / −' + snap.missed : '');
    if (uiState.lastQuality != null && snap.quality < uiState.lastQuality) bump(dom.quality, true);
    uiState.lastQuality = snap.quality;
    dom.quality.textContent = snap.quality + ' %';
    dom.time.textContent = U.clockLabel(snap.time, snap.shiftLength, cfg.shiftHours);

    if (dom.shiftFill) {
      var progress = U.clamp01(snap.time / Math.max(1, snap.shiftLength));
      dom.shiftFill.style.width = (progress * 100).toFixed(1) + '%';
    }
    if (dom.ctlTick) {
      dom.ctlTick.textContent = WC.meshes && WC.meshes.stats
        ? (WC.meshes.stats.meshes + ' мешей · ' + WC.meshes.stats.triangles + ' тр.')
        : '';
    }
    var pauseBtn = document.getElementById('btn-pause');
    if (pauseBtn) {
      var use = pauseBtn.querySelector('use');
      if (use) use.setAttribute('href', snap.paused ? '#i-play' : '#i-pause');
      pauseBtn.classList.toggle('on', Boolean(snap.paused));
      pauseBtn.setAttribute('aria-label', snap.paused ? 'Продолжить' : 'Пауза');
    }
    if (dom.pauseFlag) dom.pauseFlag.classList.toggle('show', Boolean(snap.paused));
  }

  function renderNews(force) {
    if (!dom.news) return;
    var now = U.now();
    if (!force && uiState.newsAt && now - uiState.newsAt < 14000) return;
    uiState.newsAt = now;
    dom.news.textContent = NEWS[uiState.newsIndex % NEWS.length];
    uiState.newsIndex += 1;
  }

  // ------------------------------------------------------------------ модалки
  function closeModal() {
    dom.modalRoot.classList.remove('open');
    dom.modalRoot.innerHTML = '';
    uiState.inspectorOpen = false;
    uiState.helpOpen = false;
  }

  function openModal(node) {
    dom.modalRoot.innerHTML = '';
    // Клик по подложке закрывает окно, клик внутри — нет (иначе любая кнопка
    // внутри модалки закрывала бы её всплытием события).
    node.addEventListener('click', function (event) { event.stopPropagation(); });
    dom.modalRoot.appendChild(U.el('div', { class: 'modal-backdrop', onclick: closeModal }, [node]));
    dom.modalRoot.classList.add('open');
  }

  function openHelp() {
    uiState.helpOpen = true;
    var doc = U.el('div', { class: 'inspector' }, [
      U.el('div', { class: 'insp-head' }, [
        U.el('h2', { text: 'Как управлять складом' }),
        U.el('span', { class: 'who', text: 'Клавиатура — помощник, пульт — главный' }),
        U.el('span', { class: 'spacer' }),
        U.el('button', { class: 'icon-btn', type: 'button', html: '<svg class="ico"><use href="#i-close"/></svg>', onclick: closeModal, 'aria-label': 'Закрыть' }),
      ]),
      U.el('div', { class: 'help-doc' }, [
        U.el('h3', { text: 'Пульт управления' }),
        U.el('p', { html: 'Слева — <b>пульт</b>. Выбери рабочего вкладкой или цифрой <kbd>1</kbd>…<kbd>3</kbd>, затем жми приказ: «Взять коробку», «Нести к стеллажу», «Перерыв», «Ждать», «Автономия», «Помочь бригаде». Приказы бригаде действуют на всех сразу.' }),
        U.el('h3', { text: 'Два взгляда на склад' }),
        U.el('p', { html: '<kbd>C</kbd> переключает <b>3-е лицо</b> (работа руками) и <b>тактический вид сверху</b> (приказы бригаде). Мышью вращай камеру, колесом — приближай.' }),
        U.el('h3', { text: 'Тела и мозги' }),
        U.el('p', { html: '<kbd>I</kbd> открывает <b>инспектор тела</b> с 3D-разрезом: видно сердце, лёгкие, ЖКТ, печень, почки, мозг, мышцы и гормоны. Кнопка «Разрез» раздвигает кожу.' }),
        U.el('p', { html: 'Каждый рабочий думает <b>своей обученной нейросетью</b> (18 признаков → 24 → 16 → 6 решений). Она учитывает энергию, боль, стресс, груз и срочность заказа.' }),
        U.el('h3', { text: 'Что приносит очки' }),
        U.el('p', { html: 'Коробка доставлена в ячейку вовремя и без повреждений — плюс. Упала и разбилась — минус и травма у рабочего. Просроченный заказ — тоже минус.' }),
        U.el('h3', { text: 'На телефоне' }),
        U.el('p', { html: 'Пульт — <b>нижняя шторка</b>: потяни за «язычок» вверх или тапни по нему. Снизу всегда висят <b>быстрые приказы</b> (Взять · Нести · Перерыв · Авто) — один тап, без меню. Тап по <b>метке над рабочим</b> выбирает его. Кнопка <b>⤢</b> разворачивает игру на весь экран.' }),
        U.el('h3', { text: 'Клавиши' }),
        U.el('p', { html: '<kbd>Пробел</kbd> пауза · <kbd>C</kbd> вид · <kbd>I</kbd> инспектор · <kbd>M</kbd> звук · <kbd>S</kbd> сохранить · <kbd>F</kbd> полный экран · <kbd>H</kbd> справка · <kbd>1</kbd><kbd>2</kbd><kbd>3</kbd> рабочий' }),
        U.el('h3', { text: 'Движок' }),
        U.el('p', { text: 'Игра работает на RatCore v1.0.0: логика, ГПСЧ, время и вся геометрия (меши запечатаны ToolGuard и экспортированы мостом bridge.exportMesh) — из движка. Ни одного внешнего CDN.' }),
      ]),
      U.el('div', { class: 'help-actions' }, [
        U.el('button', { class: 'btn', type: 'button', text: 'Понятно', onclick: closeModal }),
      ]),
    ]);
    openModal(doc);
  }

  function openInspector(workerId) {
    var worker = game.workerById(workerId || game.api.activeWorkerId);
    if (!worker) return;
    uiState.inspectorOpen = true;
    uiState.inspectorWorkerId = worker.state.id;
    if (uiState.inspectorTab == null) uiState.inspectorTab = 'body';

    var cutBtn = U.el('button', { class: 'cmd', type: 'button', onclick: function () {
      var on = !WC.bodyview.isCut();
      WC.bodyview.setCut(on);
      cutBtn.classList.toggle('on', on);
      cutBtn.querySelector('b').textContent = on ? 'Свести кожу' : 'Разрез: открыть';
    } }, [
      U.el('b', { text: WC.bodyview.isCut() ? 'Свести кожу' : 'Разрез: открыть' }),
      U.el('i', { text: 'передние пластины кожи' }),
    ]);

    var side = U.el('div', { class: 'insp-side' }, [
      U.el('div', { class: 'insp-tabs' }, [
        U.el('button', { type: 'button', class: uiState.inspectorTab === 'body' ? 'on' : '', text: 'Тело', onclick: function () { switchTab('body'); } }),
        U.el('button', { type: 'button', class: uiState.inspectorTab === 'organs' ? 'on' : '', text: 'Органы', onclick: function () { switchTab('organs'); } }),
        U.el('button', { type: 'button', class: uiState.inspectorTab === 'brain' ? 'on' : '', text: 'Мозг', onclick: function () { switchTab('brain'); } }),
      ]),
      U.el('div', { id: 'insp-content' }),
    ]);

    var modal = U.el('div', { class: 'inspector' }, [
      U.el('div', { class: 'insp-head' }, [
        U.el('h2', { text: 'Инспектор тела · R16' }),
        U.el('span', { class: 'who', id: 'insp-who', text: worker.state.name + ' · ' + worker.state.role }),
        U.el('span', { class: 'spacer' }),
        U.el('button', { class: 'icon-btn', type: 'button', html: '<svg class="ico"><use href="#i-close"/></svg>', onclick: closeModal, 'aria-label': 'Закрыть' }),
      ]),
      U.el('div', { class: 'insp-body' }, [
        U.el('div', { class: 'insp-stage', id: 'insp-stage' }, [
          U.el('div', { class: 'cut-badge', text: '3D-разрез · мышью вращай' }),
          U.el('div', { class: 'insp-tools' }, [cutBtn]),
        ]),
        side,
      ]),
    ]);

    openModal(modal);
    var stage = document.getElementById('insp-stage');
    WC.bodyview.mount(stage, game.api.engine);
    WC.bodyview.setCut(false);
    renderInspector();
  }

  function switchTab(tab) {
    uiState.inspectorTab = tab;
    var root = dom.modalRoot;
    U.$$('.insp-tabs button', root).forEach(function (button, index) {
      button.classList.toggle('on', ['body', 'organs', 'brain'][index] === tab);
    });
    renderInspector();
  }

  function renderInspector() {
    var content = document.getElementById('insp-content');
    if (!content) return;
    var worker = game.workerById(uiState.inspectorWorkerId) || game.activeWorker();
    if (!worker) return;
    var body = worker.body;
    var st = worker.state;
    content.innerHTML = '';

    if (uiState.inspectorTab === 'body') {
      content.appendChild(U.el('div', { class: 'insp-section' }, [
        U.el('h4', { text: 'Витамины смены' }),
        U.el('div', { class: 'vitals-grid' }, [
          vital('Пульс', Math.round(body.heartRate) + ' уд/мин', 'норма 60–90'),
          vital('Дыхание', Math.round(body.breathing) + ' /мин', 'объём ' + U.pctNum(body.lungCapacity)),
          vital('Кислород', U.pctNum(body.oxygen) + ' %', 'SpO₂'),
          vital('Температура', body.coreTemp.toFixed(1) + ' °C', 'пот ' + U.pctNum(body.sweat)),
          vital('Глюкоза', U.pctNum(body.energy) + ' %', 'гликоген ' + U.pctNum(body.glycogen)),
          vital('Лактат', U.pctNum(body.lactate) + ' %', 'закисление мышц'),
          vital('Боль', U.pctNum(body.pain) + ' %', 'травма ' + U.pctNum(body.injury)),
          vital('Стресс', U.pctNum(body.stress) + ' %', 'кортизол ' + U.pctNum(body.cortisol)),
          vital('Зрение', U.pctNum(body.vision) + ' %', 'слух ' + U.pctNum(body.hearing)),
          vital('Мозг', U.pctNum(body.cognition) + ' %', 'решения: ' + st.stats.brainTicks),
          vital('Сон', U.pctNum(1 - body.sleepDebt) + ' %', 'долг ' + U.pctNum(body.sleepDebt)),
          vital('Вода', U.pctNum(body.hydration) + ' %', 'жажда ' + U.pctNum(body.thirst)),
        ]),
      ]));
      content.appendChild(U.el('div', { class: 'insp-section' }, [
        U.el('h4', { text: 'Гормоны' }),
        U.el('div', { class: 'organs' }, [
          organRow('Кортизол', body.cortisol),
          organRow('Адреналин', body.adrenaline),
          organRow('Дофамин', body.dopamine),
          organRow('Серотонин', body.serotonin),
          organRow('Окситоцин', body.oxytocin),
          organRow('Инсулин', body.insulin),
        ]),
      ]));
      content.appendChild(eventsBlock(st));
    } else if (uiState.inspectorTab === 'organs') {
      content.appendChild(U.el('div', { class: 'insp-section' }, [
        U.el('h4', { text: 'Органы' }),
        U.el('div', { class: 'organs' }, [
          organRow('Сердце (пульс)', U.clamp01((body.heartRate - 55) / 130)),
          organRow('Лёгкие', body.oxygen),
          organRow('Желудок (голод)', body.hunger),
          organRow('Кишечник', body.digestion),
          organRow('Печень (энергия)', body.energy),
          organRow('Почки (вода)', 1 - U.clamp01(body.kidneyLoad)),
          organRow('Мозг', body.cognition),
        ]),
      ]));
      content.appendChild(U.el('div', { class: 'insp-section' }, [
        U.el('h4', { text: 'Мышцы' }),
        U.el('div', { class: 'muscles' }, global.WarehouseModel.MUSCLE_GROUPS.map(function (group) {
          var muscle = body.muscles[group.id];
          return U.el('div', { class: 'muscle' }, [
            U.el('span', { text: group.name }),
            U.el('div', { class: 'track' }, [U.el('i', { style: 'width:' + Math.round(U.clamp01(muscle.condition) * 100) + '%' })]),
            U.el('span', { class: 'val', text: 'нагр. ' + U.pctNum(muscle.load) }),
          ]);
        })),
      ]));
      content.appendChild(U.el('div', { class: 'insp-section' }, [
        U.el('h4', { text: 'Характер (входы нейросети)' }),
        U.el('div', { class: 'trait-row' }, global.WarehouseModel.TRAITS.map(function (trait) {
          return U.el('span', { class: 'trait-chip', title: trait.hint }, [
            U.el('span', { text: trait.label + ' ' }),
            U.el('b', { text: U.pctNum(st.traits[trait.id]) }),
          ]);
        })),
      ]));
      content.appendChild(eventsBlock(st));
    } else {
      var features = st.features || [];
      var decision = st.decision;
      content.appendChild(U.el('div', { class: 'insp-section' }, [
        U.el('h4', { text: 'Входы сети (18)' }),
        U.el('div', { class: 'brain-grid' }, global.WarehouseBrain.FEATURES.map(function (feature, i) {
          var value = features[i] == null ? 0 : features[i];
          return U.el('div', { class: 'brain-row', title: feature.hint }, [
            U.el('span', { text: feature.label }),
            U.el('div', { class: 'bar' }, [U.el('i', { style: 'width:' + Math.round(U.clamp01(Math.abs(value)) * 100) + '%' })]),
            U.el('span', { class: 'val', text: value.toFixed(2) }),
          ]);
        })),
      ]));
      content.appendChild(U.el('div', { class: 'insp-section' }, [
        U.el('h4', { text: 'Решения сети (6)' }),
        U.el('div', { class: 'brain-grid' }, global.WarehouseBrain.OUTPUTS.map(function (output) {
          var value = decision ? decision[output.id] : 0;
          return U.el('div', { class: 'brain-row out', title: output.hint }, [
            U.el('b', { text: output.label }),
            U.el('div', { class: 'bar' }, [U.el('i', { style: 'width:' + Math.round(U.clamp01(value) * 100) + '%' })]),
            U.el('span', { class: 'val', text: value.toFixed(2) }),
          ]);
        })),
        U.el('div', { class: 'brain-note', text: brainNote() }),
      ]));
      content.appendChild(eventsBlock(st));
    }
  }

  function brainNote() {
    var meta = game.api.brainMeta;
    var model = game.api.brains[game.api.activeWorkerId] || game.api.baseBrain;
    var parts = [];
    if (model && model.architecture) parts.push('архитектура ' + model.architecture.join(' → '));
    if (model && model.person) parts.push('личная модель: ' + model.person.name);
    if (meta && meta.base) parts.push('обучение: ' + meta.base.generations + ' поколений × ' + meta.population + ' особей');
    if (meta && meta.base) parts.push('fitness ' + meta.base.fitness + ' против ' + meta.base.baseline + ' у необученной сети');
    return parts.join(' · ');
  }

  function vital(label, value, sub) {
    return U.el('div', { class: 'vital' }, [
      U.el('span', { text: label }),
      U.el('b', { text: value }),
      U.el('small', { text: sub || '' }),
    ]);
  }

  function organRow(label, value) {
    var cls = value > 0.66 ? 'ok' : value > 0.33 ? 'warn' : 'bad';
    return U.el('div', { class: 'organ ' + cls }, [
      U.el('span', { text: label }),
      U.el('div', { class: 'track' }, [U.el('i', { style: 'width:' + Math.round(U.clamp01(value) * 100) + '%' })]),
      U.el('span', { class: 'val', text: U.pctNum(value) }),
    ]);
  }

  function eventsBlock(st) {
    var box = U.el('div', { class: 'insp-section' }, [U.el('h4', { text: 'Что чувствовал' })]);
    var list = U.el('div', { class: 'events' });
    (st.events || []).slice(-8).reverse().forEach(function (event) {
      list.appendChild(U.el('div', { class: event.tone, text: event.text }));
    });
    if (!st.events || !st.events.length) list.appendChild(U.el('div', { text: 'Пока тихо: коробки ровные, спина цела.' }));
    box.appendChild(list);
    return box;
  }

  /* Оценка смены: цифры без вердикта — не финал, а бухгалтерия.
     Смена считается крепкой, когда качество высокое и ничего не
     разбито; тяжёлой — когда брак и просрочка съели результат. */
  function shiftVerdict(summary) {
    if (summary.delivered === 0) return 'Смена пустая: ни одного заказа не дошло до стеллажа.';
    if (summary.quality >= 90 && summary.ruined === 0 && summary.missed === 0) {
      return 'Образцовая смена: всё в срок и без брака. Так держать.';
    }
    if (summary.quality >= 70 && summary.ruined <= 1) {
      return 'Смена закрыта достойно: склад работал, бригада справилась.';
    }
    return 'Тяжёлая смена: брак и просрочка съели результат. Следующая будет лучше.';
  }

  function openShiftEnd(summary) {
    var modal = U.el('div', { class: 'inspector' }, [
      U.el('div', { class: 'insp-head' }, [
        U.el('h2', { text: 'Смена закрыта' }),
        U.el('span', { class: 'who', text: 'склад «Северный узел»' }),
        U.el('span', { class: 'spacer' }),
        U.el('button', { class: 'icon-btn', type: 'button', html: '<svg class="ico"><use href="#i-close"/></svg>', onclick: closeModal, 'aria-label': 'Закрыть' }),
      ]),
      U.el('div', { class: 'insp-side', style: 'max-height:60vh' }, [
        U.el('div', { class: 'vitals-grid' }, [
          vital('Очки', U.money(summary.score), 'за смену'),
          vital('Заказы', String(summary.delivered), 'доставлено'),
          vital('Качество', summary.quality + ' %', 'без брака'),
          vital('Лучшая серия', String(summary.bestStreak), 'без ошибок'),
          vital('Разбито', String(summary.ruined), 'списание'),
          vital('Просрочено', String(summary.missed), 'штрафы'),
        ]),
        U.el('h4', { text: 'Бригада' }),
        U.el('div', { class: 'organs' }, summary.crew.map(function (member) {
          return U.el('div', { class: 'organ ok' }, [
            U.el('span', { text: member.name.split(' ')[0] }),
            U.el('div', { class: 'track' }, [U.el('i', { style: 'width:' + member.energy + '%' })]),
            U.el('span', { class: 'val', text: member.delivered + ' шт' }),
          ]);
        })),
        U.el('div', { class: 'brain-note', text: shiftVerdict(summary) }),
        U.el('div', { class: 'brain-note', text: 'Прогресс сохранён автоматически. Хочешь — скачай отчёт смены в JSON.' }),
      ]),
      U.el('div', { class: 'help-actions' }, [
        U.el('button', { class: 'btn', type: 'button', text: 'Новая смена', onclick: function () { closeModal(); game.restart(); } }),
        U.el('button', { class: 'btn', type: 'button', text: 'Скачать отчёт', onclick: function () { WC.save.download(game); } }),
        U.el('button', { class: 'btn', type: 'button', text: 'Инспектор', onclick: function () { closeModal(); openInspector(); } }),
      ]),
    ]);
    openModal(modal);
  }

  // ------------------------------------------------------------------ init
  function wireControls() {
    U.$$('[data-command]').forEach(function (button) {
      button.addEventListener('click', function () {
        var cmd = button.getAttribute('data-command');
        var res = game.command(game.api.activeWorkerId, cmd);
        if (!res.ok) U.toast(res.reason || 'Приказ не выполнен', 'bad');
        else U.toast(cfg.crew.filter(function (c) { return c.id === game.api.activeWorkerId; })[0].name + ': ' + button.querySelector('b').textContent.toLowerCase(), 'good', 1800);
        renderSelected();
        renderSide();
      });
    });
    U.$$('[data-team]').forEach(function (button) {
      button.addEventListener('click', function () {
        var kind = button.getAttribute('data-team');
        game.teamCommand(kind);
        U.toast('Приказ бригаде: ' + button.querySelector('b').textContent, 'good', 2000);
        renderSide();
      });
    });
    U.$$('#camera-seg button').forEach(function (button) {
      button.addEventListener('click', function () { setCamera(button.getAttribute('data-view')); });
    });
    U.$$('#speed-seg button').forEach(function (button) {
      button.addEventListener('click', function () {
        var speed = Number(button.getAttribute('data-speed'));
        game.setSpeed(speed);
        U.$$('#speed-seg button').forEach(function (b) { b.classList.toggle('on', Number(b.getAttribute('data-speed')) === speed); });
      });
    });
    q('btn-pause').addEventListener('click', function () { game.setPaused(!game.state.paused); });
    q('btn-camera').addEventListener('click', function () { setCamera(WC.world.getMode() === 'third' ? 'top' : 'third'); });
    q('btn-inspector').addEventListener('click', function () { openInspector(); });
    q('btn-help').addEventListener('click', openHelp);
    q('btn-save').addEventListener('click', function () {
      var ok = WC.save.save(game);
      U.toast(ok ? 'Смена сохранена' : 'Не удалось сохранить', ok ? 'good' : 'bad', 1800);
    });
    q('btn-sound').addEventListener('click', function () { toggleSound(); });

    var collapseButton = document.getElementById('btn-panel-collapse');
    if (collapseButton) collapseButton.addEventListener('click', function () { sheet.toggle(); });

    var fullscreenButton = q('btn-fullscreen');
    if (fullscreenButton) fullscreenButton.addEventListener('click', toggleFullscreen);

    // Быстрые приказы в один тап (телефон/планшет)
    U.$$('.qb').forEach(function (button) {
      button.addEventListener('click', function () {
        var cmd = button.getAttribute('data-quick');
        var res = game.command(game.api.activeWorkerId, cmd);
        if (!res.ok) {
          U.toast(res.reason || 'Приказ не выполнен', 'bad', 1800);
          buzz([12, 40, 12]);
        } else {
          buzz(10);
        }
        renderSelected();
        renderSide();
      });
    });

    // Плашка с именем в quickbar переключает рабочего — без открытия шторма
    var cycleButton = q('qb-cycle');
    if (cycleButton) {
      cycleButton.addEventListener('click', function () {
        var crew = game.api.crew;
        var index = 0;
        for (var i = 0; i < crew.length; i++) if (crew[i].id === game.api.activeWorkerId) index = i;
        var next = crew[(index + 1) % crew.length];
        if (next) { select(next.id); buzz(8); }
      });
    }

    // Тап по метке над рабочим = выбрать его (мышью и пальцем одинаково)
    var markersHost = document.getElementById('markers');
    if (markersHost) {
      markersHost.addEventListener('click', function (event) {
        var node = event.target && event.target.closest ? event.target.closest('.marker') : null;
        if (!node) return;
        var id = String(node.id || '').replace('marker-', '');
        if (!id) return;
        select(id);
        buzz(6);
      });
    }

    // На телефоне касание сцены закрывает шторку, чтобы видеть склад
    var stage = document.getElementById('stage');
    if (stage) {
      stage.addEventListener('pointerdown', function (event) {
        if (event.target && event.target.id === 'scene' && document.body.classList.contains('is-phone') && uiState.sheet === 'full') {
          sheet.set('half');
        }
      });
    }
  }

  function toggleFullscreen() {
    var doc = document;
    var el = doc.documentElement;
    var isFull = doc.fullscreenElement || doc.webkitFullscreenElement;
    if (isFull) {
      var exit = doc.exitFullscreen || doc.webkitExitFullscreen;
      if (exit) exit.call(doc);
      return;
    }
    var request = el.requestFullscreen || el.webkitRequestFullscreen;
    if (!request) {
      U.toast('Браузер не умеет полный экран — сверните адресную строку вручную', 'info', 2400);
      return;
    }
    try {
      var result = request.call(el, { navigationUI: 'hide' });
      if (result && result.catch) result.catch(function () {
        U.toast('Полный экран не разрешён браузером', 'info', 2000);
      });
    } catch (err) {
      U.toast('Полный экран не разрешён браузером', 'info', 2000);
    }
  }

  function setCamera(mode) {
    WC.world.setMode(mode);
    U.$$('#camera-seg button').forEach(function (button) {
      button.classList.toggle('on', button.getAttribute('data-view') === mode);
    });
    document.body.classList.toggle('view-top', mode === 'top');
    document.body.classList.toggle('view-third', mode === 'third');
    flashView();
    buzz(8);
    U.toast(mode === 'top' ? 'Тактический вид: приказы бригаде' : 'Вид от третьего лица', 'good', 1600);
  }

  function toggleSound() {
    var muted = WC.audio.setMuted(!WC.audio.isMuted());
    q('btn-sound').textContent = muted ? '🔇' : '🔊';
    q('btn-sound').classList.toggle('on', muted);
    return muted;
  }

  function wireKeys() {
    window.addEventListener('keydown', function (event) {
      if (event.target && /INPUT|TEXTAREA|SELECT/.test(event.target.tagName)) return;
      var key = event.key.toLowerCase();
      if (event.code === 'Space') {
        event.preventDefault();
        game.setPaused(!game.state.paused);
      } else if (key === 'c') {
        setCamera(WC.world.getMode() === 'third' ? 'top' : 'third');
      } else if (key === 'i') {
        if (uiState.inspectorOpen) closeModal(); else openInspector();
      } else if (key === 'h') {
        if (uiState.helpOpen) closeModal(); else openHelp();
      } else if (key === 'm') {
        toggleSound();
      } else if (key === 'f') {
        toggleFullscreen();
      } else if (key === 's') {
        WC.save.save(game);
        U.toast('Смена сохранена', 'good', 1600);
      } else if (key === 'escape') {
        closeModal();
      } else if (/^[1-9]$/.test(key)) {
        var index = Number(key) - 1;
        var member = cfg.crew[index];
        if (member && game.workerById(member.id)) select(member.id);
      }
    });
  }

  function init() {
    cacheDom();
    if (WC.layout) WC.layout.init();
    sheet.init();
    wireRipple();
    buildCrewTabs();
    wireControls();
    wireKeys();
    renderSelected();
    renderSide();
    renderOrders();
    renderNews(true);
    U.$$('[data-view]').forEach(function (button) {
      button.classList.toggle('on', button.getAttribute('data-view') === WC.world.getMode());
    });
    game.api.onEvent = function (type, payload) {
      if (type === 'delivered') {
        var points = payload.result.points;
        U.toast('+' + points + ' · ' + payload.order.code + ' уложен', 'good', 1800);
        if (payload.order.urgent) WC.audio.urgent();
        if (WC.world && WC.world.kick) WC.world.kick(0.18);
        buzz(12);
      } else if (type === 'dropped') {
        U.toast('Уронил ' + payload.order.code + ' — брак ' + Math.round(payload.order.damage * 100) + '%', 'bad', 2200);
        if (WC.world && WC.world.kick) WC.world.kick(0.85);
        buzz([24, 50, 24]);
      } else if (type === 'body-event') {
        U.toast(payload.worker.state.name.split(' ')[0] + ': ' + payload.event.text, payload.event.tone === 'bad' ? 'bad' : 'info', 2000);
      }
    };
    game.api.onShiftEnd = function (summary) { openShiftEnd(summary); };
    startToast();
  }

  function startToast() {
    var touch = document.body.classList.contains('is-phone') || document.body.classList.contains('is-tablet');
    if (touch) {
      U.toast('Смена началась. Приказы — на панели снизу, потяни «пульт» вверх.', 'info', 3200);
    } else {
      U.toast('Смена началась. Пульт слева.', 'info', 2600);
    }
  }

  function frame(dt) {
    var now = U.now();
    if (!WC.bodyview.state.ready && uiState.inspectorOpen) {
      // инспектор инициализируется в openInspector
    }
    if (uiState.inspectorOpen) {
      var worker = game.workerById(uiState.inspectorWorkerId) || game.activeWorker();
      if (worker && WC.bodyview.state.ready) {
        WC.bodyview.update(dt, worker.body, worker.state.palette);
      }
    }
    if (now - uiState.lastUiAt < 110) return;
    uiState.lastUiAt = now;
    renderHud();
    renderSelected();
    renderOrders();
    renderNews(false);
    if (uiState.inspectorOpen) renderInspector();
    if (uiState.sideAt == null || now - uiState.sideAt > 900) {
      uiState.sideAt = now;
      renderSide();
    }
  }

  global.WC.ui = {
    init: init,
    frame: frame,
    openInspector: openInspector,
    openHelp: openHelp,
    openShiftEnd: openShiftEnd,
    closeModal: closeModal,
    select: select,
    renderSide: renderSide,
    renderSelected: renderSelected,
    state: uiState,
    sheet: sheet,
    toggleSound: toggleSound,
    setCamera: setCamera,
  };
})(typeof window !== 'undefined' ? window : globalThis);
