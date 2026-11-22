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
    truckRows: new Map(),
    stockRows: new Map(),
    safetyRows: new Map(),
    orderFilter: 'all',
    orderVisibleLimit: 14,
    journalFilter: 'all',
    journalVisibleLimit: 12,
    journalLast: null,
    journalKey: '',
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
    dom.safetyList = q('safety-list');
    dom.safetyEmpty = q('safety-empty');
    dom.safetyCount = q('safety-count');
    dom.orderList = q('order-list');
    dom.queueCount = q('queue-count');
    dom.queueSummary = q('queue-summary');
    dom.queueShowing = q('queue-showing');
    dom.queueEmpty = q('queue-empty');
    dom.queueMore = q('queue-more');
    dom.journalList = q('journal-list');
    dom.journalCount = q('journal-count');
    dom.journalShowing = q('journal-showing');
    dom.journalEmpty = q('journal-empty');
    dom.journalMore = q('journal-more');
    dom.side = q('side');
    dom.pauseFlag = q('pause-flag');
    dom.modalRoot = q('modal-root');
    dom.hint = q('hint');
    dom.news = q('news');
    dom.ctlTick = q('ctl-tick');
    dom.cameraSeg = q('camera-seg');
    dom.truckList = q('truck-list');
    dom.truckCount = q('truck-count');
    dom.dockSummary = q('dock-summary');
    dom.stockList = q('stock-list');
    dom.stockCount = q('stock-count');
    dom.stockEmpty = q('stock-empty');
    dom.speedSeg = q('speed-seg');
    dom.qbName = q('qb-name');
    dom.qbState = q('qb-state');
    dom.shiftFill = q('shift-fill');
    dom.sheetHandle = q('sheet-handle');
    dom.viewFlash = q('view-flash');
    dom.panel = q('control-panel');
    dom.shopBalance = q('shop-balance');
    dom.shopList = q('shop-list');
    dom.staffList = q('staff-list');
    dom.contractsList = q('contracts-list');
    dom.contractsCount = q('contracts-count');
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
      // Pointerup уже обрабатывает тап и перетаскивание; click без detail
      // приходит при активации клавиатурой и не должен теряться.
      handle.addEventListener('click', function (event) {
        if (event.detail === 0) self.toggle();
      });
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
      var opener = document.getElementById('btn-panel-open');
      if (opener) opener.setAttribute('aria-expanded', name === 'hidden' ? 'false' : 'true');
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
    nodes.injuries = U.el('b', { text: 'нет' });
    nodes.rules = U.el('b', { text: '100%' });
    nodes.needs = U.el('span', { class: 'sc-needs', text: '' });
    nodes.healthRow = U.el('div', { class: 'sc-health' }, [
      U.el('span', { class: 'sc-inj' }, [U.el('span', { text: 'травмы: ' }), nodes.injuries]),
      U.el('span', { class: 'sc-rule' }, [U.el('span', { text: 'правила: ' }), nodes.rules]), nodes.needs,
    ]);
    dom.selectedCard.appendChild(nodes.healthRow);

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
    n.needs.textContent = 'нужда: ' + U.pctNum(body.bladder) + ' · настроение: ' + U.pctNum(body.fun) + ' · здоровье: ' + U.pctNum(body.vitality);
    var injuries = body.injuries || [];
    if (n.injuries) {
      var Parts = global.WarehouseModel.BODY_PARTS;
      n.injuries.textContent = injuries.length
        ? injuries.map(function (inj) { return (Parts[inj.part] || inj.part) + ' ' + U.pctNum(inj.severity); }).join(', ')
        : 'нет';
      n.healthRow.classList.toggle('bad', injuries.length > 0);
      var compliance = Math.round(global.WarehouseModel.ruleCompliance(body) * 100);
      n.rules.textContent = compliance + '%' + (st.safety && st.safety.fear > 0.15 ? ' · осторожен' : '');
      n.rules.parentNode.classList.toggle('warn', compliance < 85);
    }
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

  function renderSafety() {
    var alerts = WC.safety.assess(game.api.crew, global.WarehouseModel.BODY_PARTS);
    var live = Object.create(null);
    dom.safetyCount.textContent = String(alerts.length);
    dom.safetyEmpty.hidden = alerts.length !== 0;
    alerts.forEach(function (alert, index) {
      live[alert.id] = true;
      var row = uiState.safetyRows.get(alert.id);
      if (!row) {
        var id = alert.id;
        var name = U.el('b', { class: 'safety-name' });
        var badge = U.el('span', { class: 'safety-badge' });
        var details = U.el('div', { class: 'safety-details' });
        var choose = U.el('button', { type: 'button', text: 'Выбрать', onclick: function () {
          var worker = game.workerById(id);
          if (!worker || worker.state.dead) return;
          select(id); renderSelected();
        } });
        var inspect = U.el('button', { type: 'button', text: 'Осмотреть', onclick: function () {
          var worker = game.workerById(id);
          if (worker && !worker.state.dead) openInspector(id);
        } });
        var node = U.el('div', { class: 'safety-row' }, [
          U.el('div', { class: 'safety-head' }, [name, badge]), details,
          U.el('div', { class: 'safety-actions' }, [choose, inspect]),
        ]);
        row = { node: node, name: name, badge: badge, details: details, choose: choose, inspect: inspect };
        uiState.safetyRows.set(id, row);
        dom.safetyList.appendChild(node);
      }
      if (dom.safetyList.children[index] !== row.node) {
        var focused = row.node.contains(document.activeElement) ? document.activeElement : null;
        dom.safetyList.insertBefore(row.node, dom.safetyList.children[index] || null);
        if (focused) focused.focus({ preventScroll: true });
      }
      row.name.textContent = alert.name;
      row.badge.textContent = alert.rank === 3 ? 'критично' : alert.rank === 2 ? 'важно' : 'внимание';
      row.node.classList.toggle('critical', alert.rank === 3);
      row.details.textContent = alert.reasons.join(' · ');
      row.choose.setAttribute('aria-label', 'Выбрать: ' + alert.name);
      row.inspect.setAttribute('aria-label', 'Осмотреть: ' + alert.name);
    });
    uiState.safetyRows.forEach(function (row, id) {
      if (live[id]) return;
      if (row.node.contains(document.activeElement)) {
        var heading = q('safety-heading');
        if (heading) heading.focus({ preventScroll: true });
      }
      if (row.node.parentNode) row.node.parentNode.removeChild(row.node);
      uiState.safetyRows.delete(id);
    });
  }

  function renderTrucks() {
    if (!dom.truckList || !game.sim) return;
    if (uiState.trucksSim !== game.sim) {
      dom.truckList.innerHTML = '';
      uiState.truckRows.clear();
      uiState.trucksSim = game.sim;
    }
    var all = game.sim.state.trucks || [];
    var active = all.filter(function (t) { return t.status === 'working'; }).reverse();
    // Работающие доки всегда видны, даже если за их время другие фуры ушли.
    var recent = all.filter(function (t) { return t.status !== 'working'; }).reverse();
    var trucks = active.concat(recent.slice(0, Math.max(0, 3 - active.length)));
    if (dom.truckCount) dom.truckCount.textContent = String(active.length);
    if (dom.dockSummary) {
      var freeSlots = game.sim.state.slots.filter(function (s) { return !s.occupied; }).length;
      var stock = game.sim.state.orders.filter(function (o) { return o.status === 'stored'; }).length;
      dom.dockSummary.textContent = 'Свободных ячеек: ' + freeSlots + ' · грузов на полках: ' + stock;
    }
    U.$$('[data-call-truck]').forEach(function (button) { button.disabled = game.state.shiftEnded; });
    var empty = dom.truckList.querySelector('.truck.empty');
    if (!trucks.length && !empty) dom.truckList.appendChild(U.el('div', { class: 'truck empty', text: 'Доки свободны — ждём фуру' }));
    else if (trucks.length && empty) empty.remove();
    var visible = Object.create(null);
    trucks.forEach(function (truck, index) {
      visible[truck.id] = true;
      var row = uiState.truckRows.get(truck.id);
      if (!row) {
        var title = U.el('b'), plate = U.el('span', { class: 't-plate' });
        var route = U.el('span'), count = U.el('span', { class: 't-num' });
        var bar = U.el('i'), status = U.el('div', { class: 't-state' });
        var button = U.el('button', { class: 'btn truck-depart', type: 'button', 'data-depart-truck': truck.id, text: 'Отправить досрочно', onclick: function () { openTruckDeparture(truck.id); } });
        var node = U.el('div', { class: 'truck' }, [
          U.el('div', { class: 't-head' }, [title, plate]),
          U.el('div', { class: 't-line' }, [route, count]),
          U.el('div', { class: 'track' }, [bar]), status, button,
        ]);
        row = { node: node, title: title, plate: plate, route: route, count: count, bar: bar, status: status, button: button };
        uiState.truckRows.set(truck.id, row);
      }
      if (dom.truckList.children[index] !== row.node) {
        var focus = row.node.contains(document.activeElement) ? document.activeElement : null;
        dom.truckList.insertBefore(row.node, dom.truckList.children[index] || null);
        if (focus) focus.focus({ preventScroll: true });
      }
      var unloading = truck.kind === 'unload';
      var progress = truck.status === 'working' ? game.sim.truckProgress(truck) : { done: truck.done, total: truck.total };
      row.node.classList.toggle('live', truck.status === 'working');
      row.node.classList.toggle('load', !unloading);
      row.title.textContent = unloading ? 'Разгрузка' : 'Загрузка';
      row.plate.textContent = truck.plate;
      row.route.textContent = unloading ? 'из фуры → стеллаж' : 'стеллаж → в фуру';
      row.count.textContent = progress.done + '/' + progress.total;
      row.bar.style.width = Math.round(100 * progress.done / Math.max(1, progress.total)) + '%';
      var remaining = Math.max(0, Math.ceil(game.sim.truckWindow - (game.sim.state.time - truck.arrivedAt)));
      row.status.textContent = truck.status === 'working' ? 'У дока · окно: ' + remaining + ' с' : 'Уехала';
      row.status.classList.toggle('warning', truck.status === 'working' && remaining <= 30);
      var hideButton = truck.status !== 'working' || game.state.shiftEnded;
      if (hideButton && document.activeElement === row.button) { var dockHeading = q('dock-heading'); if (dockHeading) dockHeading.focus({ preventScroll: true }); }
      row.button.hidden = hideButton;
      row.button.setAttribute('aria-label', 'Отправить досрочно фуру ' + truck.plate);
    });
    uiState.truckRows.forEach(function (row, id) {
      if (visible[id]) return;
      if (row.node.contains(document.activeElement)) { var heading = q('dock-heading'); if (heading) heading.focus({ preventScroll: true }); }
      row.node.remove(); uiState.truckRows.delete(id);
    });
  }

  // Список остатков строится по реальным stored-заказам, а не по занятым
  // (в том числе зарезервированным) ячейкам. Узлы кнопок сохраняют фокус.
  function renderStock() {
    if (!dom.stockList || !game.sim) return;
    if (uiState.stockSim !== game.sim) {
      if (dom.stockList.contains(document.activeElement)) { var stockHeading = q('stock-heading'); if (stockHeading) stockHeading.focus({ preventScroll: true }); }
      dom.stockList.innerHTML = '';
      uiState.stockRows.clear();
      uiState.stockSim = game.sim;
    }
    var items = game.sim.state.orders.filter(function (o) { return o.status === 'stored'; });
    items.sort(function (a, b) { return String(a.slotId).localeCompare(String(b.slotId)); });
    var marked = items.filter(function (o) { return o.shippingPriority === true; }).length;
    dom.stockCount.textContent = items.length + (marked ? ' · ★ ' + marked : '');
    dom.stockEmpty.hidden = items.length > 0;
    var live = Object.create(null);
    items.forEach(function (order, index) {
      live[order.id] = true;
      var row = uiState.stockRows.get(order.id);
      if (!row) {
        var title = U.el('b'), detail = U.el('div', { class: 'stock-item-detail' });
        var button = U.el('button', { class: 'o-priority stock-mark', type: 'button', 'data-shipping-order': order.id, onclick: function () {
          var current = game.sim.state.orders.find(function (o) { return o.id === order.id; });
          var result = game.setShippingPriority(order.id, !(current && current.shippingPriority === true));
          if (!result.ok) U.toast(result.reason, 'warn', 2400);
          renderStock();
        } });
        var node = U.el('div', { class: 'stock-item' }, [title, detail, button]);
        row = { node: node, title: title, detail: detail, button: button };
        uiState.stockRows.set(order.id, row);
      }
      if (dom.stockList.children[index] !== row.node) {
        var focused = row.node.contains(document.activeElement) ? document.activeElement : null;
        dom.stockList.insertBefore(row.node, dom.stockList.children[index] || null);
        if (focused) focused.focus({ preventScroll: true });
      }
      var priority = order.shippingPriority === true;
      row.node.classList.toggle('marked', priority);
      row.title.textContent = order.code + ' · ' + order.slotId;
      row.detail.textContent = order.goods + ' · ' + order.mass + ' кг' + (order.damage > 0.02 ? ' · брак ' + Math.round(order.damage * 100) + '%' : '');
      row.button.disabled = game.state.shiftEnded;
      row.button.textContent = priority ? '★ К отгрузке' : '☆ Отметить';
      row.button.setAttribute('aria-pressed', priority ? 'true' : 'false');
      row.button.setAttribute('aria-label', (priority ? 'Снять отметку отгрузки: ' : 'Отметить для отгрузки: ') + order.code);
    });
    uiState.stockRows.forEach(function (row, id) {
      if (live[id]) return;
      if (row.node.contains(document.activeElement)) { var heading = q('stock-heading'); if (heading) heading.focus({ preventScroll: true }); }
      row.node.remove(); uiState.stockRows.delete(id);
    });
    dom.stockList.hidden = items.length === 0;
  }

  function renderOrders() {
    // После новой смены идентификаторы заказов начинаются заново: старые
    // обработчики кнопок и подписи нельзя переносить в другую симуляцию.
    if (uiState.ordersSim !== game.sim) {
      uiState.orderRows.forEach(function (row) { if (row.parentNode) row.parentNode.removeChild(row); });
      uiState.orderRows.clear();
      uiState.orderVisibleLimit = 14;
      uiState.ordersSim = game.sim;
    }
    // Ближайший дедлайн сверху — срочные заказы не теряются в очереди.
    var active = game.sim.activeOrders().slice().sort(function (a, b) {
      return (a.direction === 'return') - (b.direction === 'return') || a.deadline - b.deadline || a.createdAt - b.createdAt;
    });
    var now = game.sim.state.time;
    var slots = game.sim.state.slots;
    var free = slots.filter(function (slot) { return !slot.occupied; }).length;
    var soon = active.filter(function (order) { return order.direction !== 'return' && order.deadline - now <= 30; }).length;
    dom.queueSummary.textContent = 'Свободных ячеек: ' + free + '/' + slots.length + ' · срок ≤ 30 с: ' + soon;
    dom.queueSummary.title = 'Свободные ячейки не включают места, зарезервированные для заказов';
    dom.queueSummary.classList.toggle('warning', free === 0 || soon > 0);
    var filtered = active.filter(function (order) {
      if (uiState.orderFilter === 'pending') return order.status === 'pending';
      if (uiState.orderFilter === 'working') return order.status === 'claimed' || order.status === 'carried';
      if (uiState.orderFilter === 'priority') return order.dispatchPriority === true;
      if (uiState.orderFilter === 'soon') return order.direction !== 'return' && order.deadline - now <= 30;
      return true;
    });
    var visible = filtered.slice(0, uiState.orderVisibleLimit);
    var live = {};
    dom.queueCount.textContent = String(active.length);
    dom.queueShowing.textContent = 'Показано ' + visible.length + ' из ' + filtered.length;
    dom.queueEmpty.hidden = filtered.length > 0;
    dom.queueEmpty.textContent = active.length ? 'Нет заказов для этого фильтра' : 'Активных заказов пока нет';
    dom.queueMore.hidden = visible.length >= filtered.length;
    dom.queueMore.textContent = 'Показать ещё (' + (filtered.length - visible.length) + ')';
    visible.forEach(function (order, index) {
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
          U.el('div', { class: 'o-abc', text: '' }),
          U.el('div', { class: 'o-line' }, [
            U.el('button', {
              class: 'o-take', type: 'button', text: 'взять',
              onclick: function () {
                var worker = game.activeWorker();
                if (!worker) { U.toast('В бригаде пока никого нет', 'bad'); return; }
                var res = game.command(worker.id, 'pick', { orderId: order.id });
                if (!res.ok) U.toast(res.reason || 'Не получилось', 'bad');
                else U.toast(worker.state.name + ' идёт за ' + order.code, 'good');
              },
            }),
            U.el('span', { class: 'o-rack', text: 'ячейка ' + order.slotId }),
          ]),
          U.el('div', { class: 'o-line' }, [
            U.el('button', {
              class: 'o-priority', type: 'button', text: '☆ В приоритет',
              onclick: function () {
                var res = game.setOrderPriority(order.id, !order.dispatchPriority);
                if (!res.ok) U.toast(res.reason || 'Не получилось', 'bad');
                renderOrders();
              },
            }),
          ]),
        ]);
        uiState.orderRows.set(order.id, row);
        dom.orderList.appendChild(row);
      }
      // Переставляем существующие карточки, сохраняя кнопки и их фокус.
      if (dom.orderList.children[index] !== row) dom.orderList.insertBefore(row, dom.orderList.children[index] || null);
      var take = row.querySelector('.o-take');
      var selected = game.activeWorker();
      var busy = selected && (selected.state.orderId || selected.state.carryingId);
      take.disabled = order.status !== 'pending' || !selected || Boolean(busy);
      take.textContent = order.status !== 'pending' ? 'в работе' : busy ? 'рабочий занят' : 'взять';
      take.title = order.status !== 'pending' ? 'Заказ уже назначен' : busy ? 'Сначала завершите текущий заказ' : 'Назначить выбранному рабочему';
      var priority = row.querySelector('.o-priority');
      var marked = order.dispatchPriority === true;
      priority.disabled = order.status !== 'pending' || game.state.shiftEnded;
      priority.textContent = marked ? '★ Приоритет' : '☆ В приоритет';
      priority.setAttribute('aria-pressed', marked ? 'true' : 'false');
      priority.setAttribute('aria-label', (marked ? 'Снять приоритет с заказа ' : 'Отметить приоритет заказа ') + order.code);
      priority.title = priority.disabled ? 'Метка доступна только для свободного заказа' : 'Предпочтение при выборе бригадой; правила безопасности сохраняются';
      row.classList.toggle('dispatch-priority', marked);
      row.classList.toggle('urgent', Boolean(order.urgent) && order.status !== 'stored');
      row.classList.toggle('carried', order.status === 'carried');
      var who = order.status === 'carried' ? 'несёт: ' + nameOf(order.carrier)
        : order.status === 'claimed' ? (order.physics ? 'ждёт остановки: ' : 'в работе: ') + nameOf(order.carrier) : 'свободен';
      row.querySelector('.o-who').textContent = who;
      row.querySelector('.o-info').textContent = order.goods + ' · ' + order.mass + ' кг' + (order.direction === 'return' ? ' · возврат на полку' : '') + (order.shippingPriority === true ? ' · ★ отгрузка' : '') + (order.damage > 0.02 ? ' · брак ' + Math.round(order.damage * 100) + '%' : '');
      // Точки коробки: A — откуда, C — где лежит, B — куда едет
      var abc = row.querySelector('.o-abc');
      if (abc) {
        var from = order.source === 'truck' ? 'фура' : order.source === 'rack' ? 'стеллаж' : order.source === 'heavy' ? 'тяжёлый отдел' : 'приёмка';
        var poseText = order.status === 'carried' ? 'в руках'
          : order.physics ? 'движется'
            : (order.pose && order.pose.lying) ? 'на боку'
            : (order.pose && order.pose.z > 0.7) ? 'на полке' : 'на полу';
        var to = order.direction === 'out' ? 'фура' : order.slotId;
        abc.innerHTML = '';
        abc.appendChild(U.el('span', { text: 'A ' + from }));
        abc.appendChild(U.el('span', { class: 'abc-c', text: '→ C ' + poseText }));
        abc.appendChild(U.el('span', { class: 'abc-b', text: '→ B ' + to }));
      }
      var left = order.deadline - now;
      var timer = row.querySelector('.o-timer');
      timer.textContent = order.direction === 'return' ? 'без срока' : left > 0 ? 'до ' + U.timeLeft(left) : 'просрочен ' + U.timeLeft(-left);
      timer.classList.toggle('late', order.direction !== 'return' && left <= 0);
      timer.classList.toggle('soon', order.direction !== 'return' && left > 0 && left < 18);
    });
    uiState.orderRows.forEach(function (row, id) {
      if (!live[id]) {
        // При исчезновении карточки удерживаем фокус внутри управления очередью.
        if (row.contains(document.activeElement)) {
          var filterButton = document.querySelector('[data-order-filter="' + uiState.orderFilter + '"]');
          if (filterButton) filterButton.focus({ preventScroll: true });
        }
        if (row.parentNode) row.parentNode.removeChild(row);
        uiState.orderRows.delete(id);
      }
    });
  }

  // Журнал — представление уже существующих записей, без новых событий и
  // влияния на симуляцию. Показаны максимум 80 последних записей смены.
  function renderJournal() {
    var log = game.api.log;
    var latest = log[log.length - 1];
    var key = log.length + ':' + uiState.journalFilter + ':' + uiState.journalVisibleLimit;
    if (uiState.journalLast === latest && uiState.journalKey === key) return;
    uiState.journalLast = latest;
    uiState.journalKey = key;
    var filtered = log.slice().reverse().filter(function (entry) {
      if (uiState.journalFilter === 'warning') return entry.tone === 'warn' || entry.tone === 'bad';
      if (uiState.journalFilter === 'good') return entry.tone === 'good';
      return true;
    });
    var visible = filtered.slice(0, uiState.journalVisibleLimit);
    dom.journalCount.textContent = String(log.length);
    dom.journalShowing.textContent = 'Показано ' + visible.length + ' из ' + filtered.length + ' · всего в журнале ' + log.length + '/80';
    dom.journalEmpty.hidden = filtered.length > 0;
    dom.journalEmpty.textContent = log.length ? 'Нет записей для этого фильтра' : 'Пока нет событий';
    if (document.activeElement === dom.journalMore && visible.length >= filtered.length) {
      var filter = document.querySelector('[data-journal-filter="' + uiState.journalFilter + '"]');
      if (filter) filter.focus({ preventScroll: true });
    }
    dom.journalMore.hidden = visible.length >= filtered.length;
    dom.journalMore.textContent = 'Показать ещё (' + (filtered.length - visible.length) + ')';
    dom.journalList.innerHTML = '';
    visible.forEach(function (entry) {
      var tone = entry.tone === 'bad' ? 'bad' : entry.tone === 'warn' ? 'warn' : entry.tone === 'good' ? 'good' : 'info';
      var label = tone === 'bad' ? 'Проблема' : tone === 'warn' ? 'Внимание' : tone === 'good' ? 'Успех' : 'Событие';
      dom.journalList.appendChild(U.el('div', { class: 'journal-entry ' + tone }, [
        U.el('time', { text: U.clockLabel(entry.t, cfg.shiftRealSeconds, cfg.shiftHours) }),
        U.el('span', {}, [ U.el('b', { class: 'journal-tone', text: label + ' · ' }), U.el('span', { text: entry.text }) ]),
      ]));
    });
  }

  function nameOf(id) {
    var worker = game.workerById(id);
    return worker ? worker.state.name.split(' ')[0] : '—';
  }

  // Правая колонка: карточки бригады и журнал. Собираются один раз —
  // иначе анимация появления карточек играла бы заново каждую секунду.
  var side = { built: false, cards: new Map(), lastLogEntry: null, logBox: null };

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
    if ((game.api.staff || []).length) {
      dom.side.appendChild(U.el('h3', { text: 'Персонал' }));
      game.api.staff.forEach(function (member) {
        dom.side.appendChild(U.el('div', { class: 'crew-card staff' }, [
          U.el('div', { class: 'cc-head' }, [
            U.el('span', { class: 'cc-swatch', style: 'background:' + member.state.palette.shirt }),
            U.el('div', {}, [
              U.el('div', { class: 'cc-name', text: member.name }),
              U.el('div', { class: 'cc-role', text: member.role }),
            ]),
          ]),
          U.el('div', { class: 'cc-mini' }, [
            U.el('div', {}, [U.el('span', { text: 'смена' }), U.el('b', { text: member.kind === 'medic' ? 'лечит' : 'обходит' })]),
            U.el('div', {}, [U.el('span', { text: 'дел' }), U.el('b', { text: String(member.state.stats.healed + member.state.stats.caught) })]),
          ]),
        ]));
      });
    }
    dom.side.appendChild(U.el('h3', { text: 'Журнал смены' }));
    side.logBox = U.el('div', { class: 'log' });
    dom.side.appendChild(side.logBox);
    side.built = true;
    side.lastLogEntry = null;
  }

  function renderSide() {
    if (!dom.side) return;
    var crewKey = game.api.crew.map(function (w) { return w.state.id; }).join('|') + '|' + (game.api.staff || []).length;
    if (!side.built || side.crewKey !== crewKey) {
      side.crewKey = crewKey;
      buildSide();
      buildCrewTabs();
    }
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
    var latestLogEntry = game.api.log[game.api.log.length - 1];
    if (side.lastLogEntry !== latestLogEntry) {
      side.lastLogEntry = latestLogEntry;
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
    var shiftLabel = document.getElementById('hud-shift-label');
    if (shiftLabel) shiftLabel.textContent = game.api.shiftMode === 'night' ? 'Смена · ночь' : 'Смена';
    dom.time.textContent = 'День ' + game.sim.state.day + ' · ' + U.clockLabel(snap.time, snap.shiftLength, cfg.shiftHours);

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
  var reportReturnFocus = null;
  var truckReturnFocus = null;
  function closeModal() {
    var wasReport = Boolean(dom.modalRoot.querySelector('.shift-report'));
    var wasTruck = Boolean(dom.modalRoot.querySelector('.truck-confirm'));
    dom.modalRoot.classList.remove('open');
    dom.modalRoot.innerHTML = '';
    uiState.inspectorOpen = false;
    uiState.helpOpen = false;
    if (wasReport && reportReturnFocus && reportReturnFocus.isConnected) reportReturnFocus.focus({ preventScroll: true });
    if (wasReport) reportReturnFocus = null;
    if (wasTruck) {
      var target = truckReturnFocus && truckReturnFocus.isConnected && !truckReturnFocus.hidden && !truckReturnFocus.disabled ? truckReturnFocus : q('dock-heading');
      if (target) target.focus({ preventScroll: true });
      truckReturnFocus = null;
    }
  }

  function openModal(node) {
    dom.modalRoot.innerHTML = '';
    // Клик по подложке закрывает окно, клик внутри — нет (иначе любая кнопка
    // внутри модалки закрывала бы её всплытием события).
    node.addEventListener('click', function (event) { event.stopPropagation(); });
    dom.modalRoot.appendChild(U.el('div', { class: 'modal-backdrop', onclick: closeModal }, [node]));
    dom.modalRoot.classList.add('open');
  }

  function openTruckDeparture(id) {
    var sim = game.sim, truck = sim && sim.truckById(id);
    if (!truck || truck.status !== 'working' || game.state.shiftEnded) { U.toast('Эта фура уже уехала', 'warn'); return; }
    truckReturnFocus = document.activeElement;
    var progress = sim.truckProgress(truck);
    var hint = truck.kind === 'load'
      ? 'Незагруженные коробки останутся на складе: груз в руках и на полу придётся вернуть на полку. Бонус за полный рейс не начисляется.'
      : 'Уже разгруженные коробки останутся на складе и в очереди; их можно будет разложить. Бонус за полный рейс не начисляется.';
    var cancel = U.el('button', { class: 'btn', type: 'button', text: 'Не отправлять', onclick: closeModal });
    var confirm = U.el('button', { class: 'btn truck-confirm-send', type: 'button', text: 'Отправить фуру', onclick: function () {
      // Игра продолжается под диалогом: фура могла уехать или смена смениться.
      var result = game.sim === sim ? game.dispatchTruck(id) : { ok: false, reason: 'Смена изменилась' };
      renderTrucks();
      closeModal();
      U.toast(result.ok ? 'Фура отправлена досрочно' : result.reason, result.ok ? 'info' : 'warn', 2400);
    } });
    var modal = U.el('div', { class: 'inspector truck-confirm', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'truck-confirm-title', 'aria-describedby': 'truck-confirm-description' }, [
      U.el('div', { class: 'insp-head' }, [U.el('h2', { id: 'truck-confirm-title', text: 'Отправить фуру ' + truck.plate + '?' })]),
      U.el('div', { class: 'help-doc' }, [
        U.el('p', { id: 'truck-confirm-description', text: 'На момент открытия обработано ' + progress.done + ' из ' + progress.total + '. ' + hint }),
        U.el('p', { text: 'Окно не меняет паузу: если смена идёт, данные могут измениться до подтверждения.' }),
      ]),
      U.el('div', { class: 'help-actions' }, [cancel, confirm]),
    ]);
    modal.addEventListener('keydown', function (event) {
      if (event.key !== 'Tab') return;
      if (event.shiftKey && document.activeElement === cancel) { event.preventDefault(); confirm.focus(); }
      else if (!event.shiftKey && document.activeElement === confirm) { event.preventDefault(); cancel.focus(); }
    });
    openModal(modal); cancel.focus({ preventScroll: true });
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
        U.el('p', { html: 'Слева — <b>пульт</b>. Выбери рабочего вкладкой или цифрой <kbd>1</kbd>…<kbd>8</kbd>, затем жми приказ: «Взять коробку», «Нести к стеллажу», «Перерыв», «Ждать», «Автономия», «Помочь бригаде». Приказы бригаде действуют на всех сразу.' }),
        U.el('h3', { text: 'Два взгляда на склад' }),
        U.el('p', { html: '<kbd>C</kbd> переключает <b>3-е лицо</b> (работа руками) и <b>тактический вид сверху</b> (приказы бригаде). Мышью вращай камеру, колесом — приближай.' }),
        U.el('h3', { text: 'Тела и мозги' }),
        U.el('p', { html: '<kbd>I</kbd> открывает <b>инспектор тела</b> с 3D-разрезом: видно сердце, лёгкие, ЖКТ, печень, почки, мозг, мышцы и гормоны. Кнопка «Разрез» раздвигает кожу.' }),
        U.el('p', { html: 'Каждый рабочий думает <b>своей обученной нейросетью</b> (18 признаков → 24 → 16 → 6 решений). Она учитывает энергию, боль, стресс, груз и срочность заказа.' }),
        U.el('h3', { text: 'Доки и просроченные грузы' }),
        U.el('p', { text: 'В пульте можно вызвать фуру на разгрузку (нужны свободные ячейки) или на загрузку (нужен груз на полках), следить за окном и отправить её досрочно с подтверждением. Спустя 35 секунд после срока заказ штрафуется один раз: коробка не исчезает, её нужно вернуть на полку без награды.' }),
        U.el('h3', { text: 'Что приносит очки' }),
        U.el('p', { html: 'Коробка доставлена в ячейку вовремя и без повреждений — плюс. Упала и разбилась — минус и травма у рабочего. Просроченный заказ — тоже минус.' }),
        U.el('h3', { text: 'На телефоне' }),
        U.el('p', { html: 'Пульт — <b>нижняя шторка</b>: потяни за «язычок» вверх или тапни по нему. Снизу всегда висят <b>быстрые приказы</b> (Взять · Нести · Перерыв · Авто) — один тап, без меню. Тап по <b>метке над рабочим</b> выбирает его. Кнопка <b>⤢</b> разворачивает игру на весь экран.' }),
        U.el('h3', { text: 'Клавиши' }),
        U.el('p', { html: '<kbd>Пробел</kbd> пауза · <kbd>C</kbd> вид · <kbd>I</kbd> инспектор · <kbd>M</kbd> звук · <kbd>S</kbd> сохранить · <kbd>F</kbd> полный экран · <kbd>H</kbd> справка · <kbd>1</kbd><kbd>2</kbd><kbd>3</kbd> рабочий' }),
        U.el('h3', { text: 'Состояние бригады' }),
        U.el('p', { text: 'Сводка в пульте показывает рабочих с обмороком, травмами, низкой энергией или здоровьем, высокой усталостью и болью либо низким запасом воды. Выбери рабочего или открой его инспектор. Это предупреждения по игровым показателям, а не автоматические приказы.' }),
        U.el('h3', { text: 'Журнал смены' }),
        U.el('p', { text: 'В пульте видны последние 80 событий и реплик. Фильтры показывают все записи, предупреждения или успехи; «Показать ещё» открывает более ранние записи. Журнал не влияет на симуляцию.' }),
        U.el('h3', { text: 'Обзор очереди' }),
        U.el('p', { text: 'Фильтры показывают все заказы, свободные, занятые, приоритетные или те, у которых осталось не больше 30 секунд (включая просроченные). Сводка показывает число свободных ячеек без зарезервированных мест. Если заказов много, нажми «Показать ещё».' }),
        U.el('h3', { text: 'Приоритет заказа' }),
        U.el('p', { text: 'В очереди отметьте свободный заказ кнопкой «В приоритет». Бригада будет чаще выбирать его в автономном режиме; метка не переназначает занятый груз, не отменяет технику безопасности и не меняет награду. Её можно снять до назначения.' }),
        U.el('h3', { text: 'Реплики рабочих' }),
        U.el('p', { text: 'Рабочие отвечают на приказы и иногда разговаривают рядом друг с другом. Текст виден над сценой и в журнале. В пульте можно включить озвучку: используется только установленный на устройстве локальный русский голос. Если его нет, остаются текстовые реплики. Общая кнопка звука отключает и озвучку.' }),
        U.el('h3', { text: 'День и ночь' }),
        U.el('p', { text: 'В пульте можно переключить освещение на день или ночь в любой момент. Ночью фонари освещают улицу, а лампы — стеллажи. В темноте зрение рабочих постепенно снижается, особенно при усталости, и восстанавливается на свету.' }),
        U.el('h3', { text: 'Отчёт смены' }),
        U.el('p', { text: 'В пульте можно открыть отчёт о грузах, очках и бригаде в любой момент. Он показывает снимок на момент открытия и не останавливает игру. Кнопка «Обновить» получает новые данные, JSON-отчёт не заменяет сохранение.' }),
        U.el('h3', { text: 'Сохранение смены' }),
        U.el('p', { text: 'Смена сохраняется в браузере каждые 25 секунд, при сворачивании и уходе со страницы, если браузер позволяет запись. При следующем запуске она продолжится с прежней бригадой, грузами и состоянием здоровья. Кнопка сохранения и клавиша S записывают смену сразу.' }),
        U.el('h3', { text: 'Движок' }),
        U.el('p', { text: 'Игра работает на RatCore v1.0.0: логика, ГПСЧ, время и вся геометрия (меши запечатаны ToolGuard и экспортированы мостом bridge.exportMesh) — из движка. Ни одного внешнего CDN.' }),
      ]),
      U.el('div', { class: 'help-actions' }, [
        U.el('button', { class: 'btn', type: 'button', text: 'Новая смена', onclick: function () {
          if (!window.confirm('Начать новую смену? Текущее сохранение будет заменено.')) return;
          closeModal(); game.restart();
        } }),
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
          vital('Свет', U.pctNum(game.sim.illuminationAt(game.api.shiftMode, st.pos.x, st.pos.y)) + ' %', 'условная освещённость'),
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
      content.appendChild(U.el('div', { class: 'insp-section' }, [
        U.el('h4', { text: 'Травмы и техника безопасности' }),
        U.el('div', { class: 'injuries' }, (body.injuries || []).length
          ? body.injuries.map(function (inj) {
            var preset = global.WarehouseModel.INJURY_TYPES[inj.type] || { label: 'ткани' };
            return U.el('div', { class: 'injury' }, [
              U.el('b', { text: (global.WarehouseModel.BODY_PARTS[inj.part] || inj.part) + ' · ' + preset.label }),
              U.el('span', { text: U.pctNum(inj.severity) + ' · ' + inj.cause }),
              U.el('div', { class: 'track' }, [U.el('i', { class: 'bad', style: 'width:' + Math.round(U.clamp01(inj.severity) * 100) + '%' })]),
            ]);
          })
          : [U.el('div', { class: 'inj-clean', text: 'Травм нет — тело целое' })]),
        U.el('div', { class: 'rule-list' }, global.WarehouseModel.RULES.map(function (rule) {
          var hits = (body.ruleViolations || {})[rule.id] || 0;
          return U.el('div', { class: 'rule' + (hits ? ' hit' : '') }, [
            U.el('span', { class: 'r-dot' }),
            U.el('span', { class: 'r-text', text: rule.title + ' — ' + rule.text }),
            U.el('b', { text: hits ? String(hits) : '✓' }),
          ]);
        })),
        U.el('div', { class: 'rule-note', text: 'Соблюдение правил: ' + Math.round(global.WarehouseModel.ruleCompliance(body) * 100) +
          '% · страх после травм ' + U.pctNum(st.safety ? st.safety.fear : 0) }),
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

  // Отчёт — снимок при открытии. Игра продолжает работать, если не на паузе.
  function openShiftEnd(summary) { openShiftReport(summary, true); }

  function openShiftReport(summary, ended) {
    if (!dom.modalRoot.querySelector('.shift-report')) {
      reportReturnFocus = dom.modalRoot.contains(document.activeElement) ? q('btn-report') : document.activeElement;
    }
    var crewRows = summary.crew.map(function (member) {
      return U.el('div', { class: 'report-person' }, [
        U.el('div', { class: 'report-person-head' }, [
          U.el('b', { text: member.name }), U.el('span', { text: member.role }),
        ]),
        U.el('div', { text: 'На стеллаж: ' + member.delivered + ' · в фуру: ' + member.loaded + ' · уронил: ' + member.dropped }),
        U.el('div', { text: 'Энергия: ' + member.energy + '% · усталость: ' + member.fatigue + '% · путь: ' + member.metres + ' м' }),
        U.el('div', { text: 'Травмы: ' + (member.injuries.length ? member.injuries.join(', ') : 'нет') }),
        U.el('button', { class: 'btn report-inspect', type: 'button', text: 'Осмотреть', 'aria-label': 'Осмотреть: ' + member.name, onclick: function () {
          if (!game.workerById(member.id) || game.workerById(member.id).state.dead) { U.toast('Рабочий больше не в бригаде', 'warn'); return; }
          closeModal(); openInspector(member.id);
        } }),
      ]);
    });
    var staffRows = summary.staff.map(function (member) {
      return U.el('div', { class: 'report-person', text: member.name + ' · ' + (member.kind === 'medic' ? 'вылечено травм: ' + member.healed : 'остановлено нарушений: ' + member.caught) });
    });
    var actions = [];
    if (ended) actions.push(U.el('button', { class: 'btn', type: 'button', text: 'Новая смена', onclick: function () { closeModal(); game.restart(); } }));
    else actions.push(U.el('button', { class: 'btn', type: 'button', text: 'Обновить', onclick: function () { openShiftReport(game.summary(), game.state.shiftEnded); } }));
    actions.push(U.el('button', { class: 'btn', type: 'button', text: 'Скачать отчёт', onclick: function () { WC.save.download(game); } }));
    actions.push(U.el('button', { class: 'btn', type: 'button', text: 'Закрыть', onclick: closeModal }));
    var modal = U.el('div', { class: 'inspector shift-report', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'report-title' }, [
      U.el('div', { class: 'insp-head' }, [
        U.el('h2', { id: 'report-title', text: ended ? 'Смена закрыта' : 'Отчёт смены' }),
        U.el('span', { class: 'spacer' }),
        U.el('button', { class: 'icon-btn', type: 'button', html: '<svg class="ico"><use href="#i-close"/></svg>', onclick: closeModal, 'aria-label': 'Закрыть' }),
      ]),
      U.el('div', { class: 'report-content', tabindex: '0', 'aria-label': 'Показатели смены' }, [
        U.el('p', { class: 'report-note', text: ended ? 'Итоги завершённой смены.' : 'Снимок на момент открытия. Смена не ставится на паузу; нажмите «Обновить» для новых данных.' }),
        U.el('div', { class: 'vitals-grid' }, [
          vital('Очки', U.money(summary.score), 'баланс после покупок'),
          vital('Контракты', String(summary.contracts.filter(function (c) { return c.status === 'completed'; }).length), 'выполнено за смену'),
          vital('На стеллаж', String(summary.delivered), 'доставлено'),
          vital('Качество', summary.quality + ' %', 'повреждения и срок'),
          vital('Падения', String(summary.dropped), 'все грузы'),
          vital('Испорчено', String(summary.ruined), 'списано'),
          vital('Пропущено', String(summary.missed), 'заказы с истёкшим сроком'),
          vital('Из фур', String(summary.unloaded), 'выгружено коробок'),
          vital('В фуры', String(summary.loaded), 'загружено коробок'),
          vital('Фуры уехали', String(summary.truckShifts), 'включая незавершённые рейсы'),
          vital('Погибли', String(summary.deaths), 'за смену'),
          vital('Лучшая серия', String(summary.bestStreak), 'без ошибок'),
          vital('Освещение', summary.lighting === 'night' ? 'Ночь' : 'День', ended ? 'в конце смены' : 'при открытии'),
        ]),
        U.el('p', { class: 'report-note', text: 'Качество учитывает повреждения и срок у учитываемых уложенных и испорченных заказов. Если таких нет, показывается 100%. Отчёт JSON — не сохранение для продолжения игры.' }),
        WC.save.isProtected() ? U.el('p', { class: 'report-note report-warning', text: 'Сохранение защищено от перезаписи: текущая смена не записывается в браузер.' }) : null,
        U.el('h3', { class: 'report-heading', text: 'Контракты смены' }),
        U.el('div', { class: 'report-people' }, summary.contracts.map(function (c) { return U.el('p', { class: 'report-note', text: c.title + ': ' + ({available:'не взят', active:'в работе', completed:'выполнен', failed:'не выполнен', cancelled:'отменён'})[c.status] + ' · ' + c.progress + '/' + c.goal + (c.reward ? ' · +' + c.reward + ' очков' : '') + (c.reason ? ' · ' + c.reason : '') }); })),
        U.el('h3', { class: 'report-heading', text: 'Бригада сейчас (' + summary.crew.length + ')' }),
        U.el('div', { class: 'report-people' }, crewRows.length ? crewRows : [U.el('p', { class: 'report-note', text: 'Рабочих в бригаде нет.' })]),
        U.el('h3', { class: 'report-heading', text: 'Персонал (' + summary.staff.length + ')' }),
        U.el('div', { class: 'report-people' }, staffRows.length ? staffRows : [U.el('p', { class: 'report-note', text: 'Персонал не нанят.' })]),
        U.el('p', { class: 'report-note', text: 'В списке показаны работники, оставшиеся в бригаде на момент отчёта.' }),
      ]),
      U.el('div', { class: 'help-actions report-actions' }, actions),
    ]);
    openModal(modal);
    modal.addEventListener('keydown', function (event) {
      if (event.key !== 'Tab') return;
      var focusable = Array.prototype.slice.call(modal.querySelectorAll('button:not([disabled]), [tabindex="0"]'));
      if (!focusable.length) return;
      var first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });
    modal.querySelector('.insp-head button').focus({ preventScroll: true });
  }

  // ------------------------------------------------------------------ init
  // ---------------------------------------------------------- магазин смены
  function renderContracts() {
    if (!dom.contractsList || !game.api.contracts || !game.sim) return;
    var now = game.sim.state.time, items = game.api.contracts.items;
    dom.contractsCount.textContent = items.filter(function (i) { return i.status === 'active'; }).length + ' / ' + WC.contracts.maxActive;
    // Не пересоздаём кнопки на каждом кадре: сохраняем фокус и положение прокрутки.
    var key = JSON.stringify(items) + ':' + Math.floor(now) + ':' + game.state.shiftEnded;
    if (uiState.contractKey === key) return;
    uiState.contractKey = key;
    var focused = document.activeElement && document.activeElement.getAttribute('data-contract');
    dom.contractsList.innerHTML = '';
    items.forEach(function (i) {
      var d = WC.contracts.definitions.find(function (x) { return x.id === i.id; });
      var labels = { available: 'Доступен', active: 'В работе', completed: 'Выполнен', failed: 'Не выполнен', cancelled: 'Отменён' };
      var detail = i.status === 'active' ? 'осталось ' + Math.max(0, Math.ceil(i.deadline - now)) + ' с' : (i.status === 'available' ? 'до ' + d.duration + ' с' : i.reason);
      var children = [U.el('div', { class: 'contract-head' }, [U.el('b', { text: d.title }), U.el('span', { text: '+' + d.reward + ' очков' })]),
        U.el('p', { text: d.description }),
        U.el('div', { class: 'contract-progress', text: labels[i.status] + ' · ' + i.progress + ' / ' + d.goal + (detail ? ' · ' + detail : '') })];
      if (!game.state.shiftEnded && (i.status === 'available' || i.status === 'active')) {
        children.push(U.el('button', { type: 'button', class: 'queue-more', 'data-contract': i.id, text: i.status === 'active' ? 'Отменить' : 'Взять контракт', onclick: function () {
          var res = i.status === 'active' ? game.cancelContract(i.id) : game.acceptContract(i.id);
          if (!res.ok) U.toast(res.reason, 'bad', 2400);
          renderContracts();
        } }));
      }
      dom.contractsList.appendChild(U.el('article', { class: 'contract-card contract-' + i.status }, children));
    });
    if (focused) { var button = dom.contractsList.querySelector('[data-contract="' + focused + '"]'); if (button) button.focus({ preventScroll: true }); }
  }

  function renderShop() {
    if (!game.sim || !game.sim.state) return;
    var score = Math.round(game.sim.state.stats.score);
    if (dom.shopBalance) dom.shopBalance.textContent = String(score);
    U.$$('[data-buy]').forEach(function (card) {
      var kind = card.getAttribute('data-buy');
      var isWorker = kind === 'worker';
      var bought = isWorker ? game.api.crewTarget >= cfg.shop.worker.max : game.hasStaff(kind);
      var cost = isWorker ? cfg.shop.worker.cost : game.staffCost(kind);
      card.classList.toggle('bought', bought);
      card.classList.toggle('broke', !bought && score < cost);
      var price = card.querySelector('.shop-price');
      if (price) price.textContent = bought ? (isWorker ? 'максимум' : 'нанят') : String(cost);
      card.disabled = bought || score < cost;
    });
    if (!dom.staffList) return;
    var staff = game.api.staff || [];
    var key = staff.map(function (m) { return m.kind + ':' + m.state.stats.healed + ':' + m.state.stats.caught; }).join('|');
    if (uiState.staffKey === key) return;
    uiState.staffKey = key;
    dom.staffList.innerHTML = '';
    staff.forEach(function (member) {
      var line = member.kind === 'medic'
        ? 'залечил травм: ' + member.state.stats.healed
        : 'поймал за техникой: ' + member.state.stats.caught;
      dom.staffList.appendChild(U.el('div', { class: 'staff-row' }, [
        U.el('b', { text: member.name }),
        U.el('span', { text: member.role + ' · ' + line }),
      ]));
    });
  }

  function wireShop() {
    U.$$('[data-buy]').forEach(function (card) {
      card.addEventListener('click', function () {
        var kind = card.getAttribute('data-buy');
        var res = kind === 'worker' ? game.hireWorker() : game.buyStaff(kind);
        if (!res.ok) {
          U.toast(res.reason || 'Не получилось', 'bad', 2400);
          buzz([16, 40, 16]);
          return;
        }
        U.toast((kind === 'worker' ? res.worker.state.name : kind === 'medic' ? 'Медик' : 'Сторож') + ' нанят за ' + res.cost + ' очков', 'good', 2400);
        buzz(14);
        renderShop();
        renderSide();
      });
    });
  }

  function wireControls() {
    wireShop();
    U.$$('[data-order-filter]').forEach(function (button) {
      button.addEventListener('click', function () {
        uiState.orderFilter = button.getAttribute('data-order-filter');
        uiState.orderVisibleLimit = 14;
        U.$$('[data-order-filter]').forEach(function (item) {
          item.setAttribute('aria-pressed', item === button ? 'true' : 'false');
        });
        renderOrders();
      });
    });
    if (dom.queueMore) dom.queueMore.addEventListener('click', function () {
      uiState.orderVisibleLimit += 14;
      renderOrders();
      if (dom.queueMore.hidden) {
        var filterButton = document.querySelector('[data-order-filter="' + uiState.orderFilter + '"]');
        if (filterButton) filterButton.focus({ preventScroll: true });
      }
    });
    U.$$('[data-journal-filter]').forEach(function (button) {
      button.addEventListener('click', function () {
        uiState.journalFilter = button.getAttribute('data-journal-filter');
        uiState.journalVisibleLimit = 12;
        U.$$('[data-journal-filter]').forEach(function (item) {
          item.setAttribute('aria-pressed', item === button ? 'true' : 'false');
        });
        renderJournal();
      });
    });
    dom.journalMore.addEventListener('click', function () {
      uiState.journalVisibleLimit += 12;
      renderJournal();
    });
    q('btn-report').addEventListener('click', function () { openShiftReport(game.summary(), game.state.shiftEnded); });
    var shopButton = q('btn-shop');
    if (shopButton) shopButton.addEventListener('click', function () {
      sheet.set('full', true);
      var scroller = dom.panel && dom.panel.querySelector('.ctl-scroll');
      var heading = q('shop-heading');
      if (scroller && heading) {
        scroller.scrollTop += heading.getBoundingClientRect().top - scroller.getBoundingClientRect().top - 12;
        heading.setAttribute('tabindex', '-1');
        heading.focus({ preventScroll: true });
      }
    });
    U.$$('[data-command]').forEach(function (button) {
      button.addEventListener('click', function () {
        var cmd = button.getAttribute('data-command');
        var res = game.command(game.api.activeWorkerId, cmd);
        if (!res.ok) U.toast(res.reason || 'Приказ не выполнен', 'bad');
        else U.toast((game.activeWorker() ? game.activeWorker().state.name : 'Рабочий') + ': ' + button.querySelector('b').textContent.toLowerCase(), 'good', 1800);
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
    U.$$('#lighting-seg button').forEach(function (button) {
      button.addEventListener('click', function () {
        var mode = button.getAttribute('data-lighting');
        if (!game.setShiftMode(mode)) return;
        syncLightingControls();
        if (WC.world && WC.world.setShiftLighting) WC.world.setShiftLighting(mode);
        U.toast(mode === 'night' ? 'Ночной свет: в тёмных местах зрению труднее' : 'Дневное освещение', 'info', 2400);
      });
    });
    U.$$('#speed-seg button').forEach(function (button) {
      button.addEventListener('click', function () {
        var speed = Number(button.getAttribute('data-speed'));
        game.setSpeed(speed);
        U.$$('#speed-seg button').forEach(function (b) { b.classList.toggle('on', Number(b.getAttribute('data-speed')) === speed); });
      });
    });
    var voiceButton = q('btn-voice');
    if (voiceButton) voiceButton.addEventListener('click', function () {
      var next = !WC.voice.isEnabled();
      if (!WC.voice.setEnabled(next)) {
        U.toast('Нет локального русского голоса: реплики остаются в тексте', 'warn', 3500);
        return;
      }
      syncVoiceButton();
      U.toast(next ? 'Озвучка включена: локальный голос устройства' : 'Озвучка выключена', 'info', 2200);
    });
    q('btn-pause').addEventListener('click', function () { game.setPaused(!game.state.paused); });
    U.$$('[data-call-truck]').forEach(function (button) {
      button.addEventListener('click', function () {
        var result = game.callTruck(button.getAttribute('data-call-truck'));
        if (!result.ok) U.toast(result.reason, 'warn', 2400);
        else U.toast('Фура ' + result.truck.plate + ' у дока: ' + (result.truck.kind === 'unload' ? 'разгрузка' : 'загрузка'), 'good', 2400);
        renderTrucks();
        renderStock();
      });
    });
    q('btn-camera').addEventListener('click', function () { setCamera(WC.world.getMode() === 'third' ? 'top' : 'third'); });
    var mapButton = q('btn-map');
    if (mapButton) {
      mapButton.addEventListener('click', function () {
        var applied = WC.world.toggleMap2d();
        setCamera(applied);
        mapButton.classList.toggle('on', applied === 'map2d');
      });
    }
    q('btn-inspector').addEventListener('click', function () { openInspector(); });
    q('btn-help').addEventListener('click', openHelp);
    q('btn-save').addEventListener('click', function () {
      var ok = WC.save.save(game);
      U.toast(ok ? 'Смена сохранена' : 'Не удалось сохранить', ok ? 'good' : 'bad', 1800);
    });
    q('btn-sound').addEventListener('click', function () { toggleSound(); });

    var collapseButton = document.getElementById('btn-panel-collapse');
    var openPanelButton = q('btn-panel-open');
    if (openPanelButton) openPanelButton.addEventListener('click', function () {
      sheet.set('half');
      if (collapseButton) collapseButton.focus({ preventScroll: true });
    });
    if (collapseButton) collapseButton.addEventListener('click', function () {
      sheet.toggle();
      if (uiState.sheet === 'hidden') {
        // Кнопка закрытия оказалась за экраном; возвращаем фокус на видимый способ открыть пульт.
        var target = openPanelButton && window.getComputedStyle(openPanelButton).display !== 'none' ? openPanelButton : dom.sheetHandle;
        if (target && window.getComputedStyle(target).display !== 'none') target.focus({ preventScroll: true });
      }
    });

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

  var VIEW_HINTS = {
    third: 'Вид от третьего лица: работа руками',
    follow: 'Сверху за рабочим: следи за ним и бригадой',
    top: 'Тактический вид: весь цех и приказы бригаде',
    map2d: '2D-вид сверху: склад как чертёж, точки A · C · B',
  };

  function setCamera(mode) {
    var applied = WC.world.setMode(mode);
    U.$$('#camera-seg button').forEach(function (button) {
      button.classList.toggle('on', button.getAttribute('data-view') === applied);
    });
    document.body.classList.toggle('view-top', applied === 'top');
    document.body.classList.toggle('view-third', applied === 'third');
    document.body.classList.toggle('view-follow', applied === 'follow');
    document.body.classList.toggle('view-map', applied === 'map2d');
    flashView();
    buzz(8);
    U.toast(VIEW_HINTS[applied] || VIEW_HINTS.third, 'good', 1600);
    return applied;
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
      if (event.code === 'Space' && event.target && event.target.closest && event.target.closest('button')) return;
      if (event.code === 'Space') {
        event.preventDefault();
        game.setPaused(!game.state.paused);
      } else if (key === 'c') {
        setCamera(WC.world.cycleMode ? WC.world.cycleMode() : 'third');
      } else if (key === 't') {
        var mapMode = WC.world.toggleMap2d ? WC.world.toggleMap2d() : 'third';
        setCamera(mapMode);
      } else if (key === 'i') {
        if (uiState.inspectorOpen) closeModal(); else openInspector();
      } else if (key === 'h') {
        if (uiState.helpOpen) closeModal(); else openHelp();
      } else if (key === 'm') {
        toggleSound();
      } else if (key === 'f') {
        toggleFullscreen();
      } else if (key === 's') {
        var saved = WC.save.save(game);
        U.toast(saved ? 'Смена сохранена' : 'Не удалось сохранить', saved ? 'good' : 'bad', 1600);
      } else if (key === 'escape') {
        closeModal();
      } else if (/^[1-9]$/.test(key)) {
        var index = Number(key) - 1;
        var member = game.api.crew[index];
        if (member) select(member.id);
      }
    });
  }

  function syncVoiceButton() {
    var button = q('btn-voice');
    if (!button) return;
    var enabled = WC.voice.isEnabled();
    button.classList.toggle('on', enabled);
    button.setAttribute('aria-pressed', enabled ? 'true' : 'false');
    button.querySelector('b').textContent = 'Озвучка: ' + (enabled ? 'вкл' : 'выкл');
  }

  var subtitleTimer = null;
  function showDialogue(line) {
    var box = q('dialogue-subtitle');
    if (box) {
      box.textContent = line.name + ': «' + line.text + '»';
      box.hidden = false;
      clearTimeout(subtitleTimer);
      subtitleTimer = setTimeout(function () { box.hidden = true; }, 4500);
    }
    if (WC.voice) WC.voice.speak(line);
  }

  function syncLightingControls() {
    U.$$('#lighting-seg button').forEach(function (button) {
      var active = button.getAttribute('data-lighting') === game.api.shiftMode;
      button.classList.toggle('on', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  function init() {
    cacheDom();
    syncLightingControls();
    syncVoiceButton();
    if (WC.layout) WC.layout.init();
    sheet.init();
    wireRipple();
    buildCrewTabs();
    wireControls();
    wireKeys();
    renderSelected();
    renderSide();
    renderSafety();
    renderJournal();
    renderOrders();
    renderTrucks();
    renderStock();
    renderShop();
    renderNews(true);
    U.$$('[data-view]').forEach(function (button) {
      button.classList.toggle('on', button.getAttribute('data-view') === WC.world.getMode());
    });
    game.api.onEvent = function (type, payload) {
      if (type === 'dialogue') {
        showDialogue(payload);
      } else if (type === 'restart') {
        uiState.journalFilter = 'all';
        uiState.journalVisibleLimit = 12;
        U.$$('[data-journal-filter]').forEach(function (item) { item.setAttribute('aria-pressed', item.getAttribute('data-journal-filter') === 'all' ? 'true' : 'false'); });
        renderJournal();
        renderTrucks();
        renderStock();
        var subtitle = q('dialogue-subtitle');
        if (subtitle) subtitle.hidden = true;
        clearTimeout(subtitleTimer);
      } else if (type === 'delivered') {
        var points = payload.result.points;
        U.toast('+' + points + ' · ' + payload.order.code + ' уложен', 'good', 1800);
        if (payload.order.urgent) WC.audio.urgent();
        if (WC.world && WC.world.kick) WC.world.kick(0.18);
        buzz(12);
      } else if (type === 'dropped') {
        U.toast('Уронил ' + payload.order.code + ' — брак ' + Math.round(payload.order.damage * 100) + '%', 'bad', 2200);
        if (WC.world && WC.world.kick) WC.world.kick(0.85);
        buzz([24, 50, 24]);
      } else if (type === 'death') {
        U.toast(payload.worker.state.name + ' погиб: ' + payload.cause, 'bad', 3600);
        buzz([40, 60, 40]);
        renderSide();
      } else if (type === 'hire') {
        U.toast('Новый работяга: ' + payload.worker.state.name, 'good', 3000);
        renderSide();
      } else if (type === 'privacy') {
        if (payload.on) U.toast('Рабочие уединились — там приватно', 'info', 2600);
      } else if (type === 'staff') {
        renderShop();
      } else if (type === 'caught') {
        U.toast('Сторож поймал ' + payload.worker.state.name.split(' ')[0] + ' на погрузчике', 'warn', 2400);
      } else if (type === 'body-event') {
        U.toast(payload.worker.state.name.split(' ')[0] + ': ' + payload.event.text, payload.event.tone === 'bad' ? 'bad' : 'info', 2000);
      }
    };
    game.api.onShiftEnd = function (summary) { openShiftEnd(summary); };
    startToast();
  }

  function startToast() {
    if (game.api.resumeStatus !== 'new') return;
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
    renderSafety();
    renderJournal();
    renderTrucks();
    renderStock();
    renderOrders();
    renderShop();
    renderContracts();
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
