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
  }

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
        U.el('span', { class: 'dot' }),
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

  function renderSelected() {
    var worker = game.activeWorker();
    if (!worker) return;
    var body = worker.body;
    var st = worker.state;
    var stateLabel = cfg.stateLabels[st.state] || st.state;
    dom.selectedCard.innerHTML = '';
    dom.selectedCard.appendChild(U.el('div', { class: 'sc-top' }, [
      U.el('b', { text: st.name }),
      U.el('span', { text: st.role }),
    ]));
    dom.selectedCard.appendChild(U.el('div', { class: 'sc-mode' }, [
      U.el('span', { text: 'режим: ' }),
      U.el('b', { text: st.mode === 'auto' ? 'автономия (нейросеть)' : 'ручной (пульт)' }),
    ]));
    dom.selectedCard.appendChild(U.el('div', { class: 'sc-state' }, [
      U.el('span', { text: 'сейчас: ' }),
      U.el('b', { text: st.carryingId ? 'несёт коробку' : stateLabel }),
    ]));
    dom.selectedCard.appendChild(metric('Энергия', body.energy, 'energy', U.pct(body.energy)));
    dom.selectedCard.appendChild(metric('Усталость', body.fatigue, 'fatigue', U.pct(body.fatigue)));
    dom.selectedCard.appendChild(metric('Стресс', body.stress, 'stress', U.pct(body.stress)));
    dom.selectedCard.appendChild(metric('Кислород', body.oxygen, 'oxygen', U.pct(body.oxygen)));
    dom.selectedCard.appendChild(U.el('div', { class: 'trait-row' }, [
      U.el('span', { class: 'trait-chip' }, [U.el('span', { text: 'сила ' }), U.el('b', { text: U.pctNum(st.traits.strength) })]),
      U.el('span', { class: 'trait-chip' }, [U.el('span', { text: 'точность ' }), U.el('b', { text: U.pctNum(st.traits.precision) })]),
      U.el('span', { class: 'trait-chip' }, [U.el('span', { text: 'выносл. ' }), U.el('b', { text: U.pctNum(st.traits.endurance) })]),
      U.el('span', { class: 'trait-chip' }, [U.el('span', { text: 'командн. ' }), U.el('b', { text: U.pctNum(st.traits.coop) })]),
    ]));
    U.$$('.tabs .tab', dom.crewTabs).forEach(function (tab) {
      tab.classList.toggle('on', tab.getAttribute('data-worker') === st.id);
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

  function renderSide() {
    dom.side.innerHTML = '';
    dom.side.appendChild(U.el('h3', { text: 'Бригада' }));
    game.api.crew.forEach(function (worker) {
      var st = worker.state;
      var body = worker.body;
      var stateLabel = cfg.stateLabels[st.state] || st.state;
      var card = U.el('div', {
        class: 'crew-card' + (st.id === game.api.activeWorkerId ? ' active' : '') + (body.energy < 0.22 || body.pain > 0.4 ? ' alarm' : ''),
        onclick: function () { select(st.id); },
      }, [
        U.el('div', { class: 'cc-head' }, [
          U.el('span', { class: 'cc-swatch', style: 'background:' + st.palette.vest }),
          U.el('div', {}, [
            U.el('div', { class: 'cc-name', text: st.name }),
            U.el('div', { class: 'cc-role', text: st.role }),
          ]),
        ]),
        U.el('div', { class: 'cc-state' }, [
          U.el('b', { text: st.carryingId ? 'несёт коробку' : stateLabel }),
          U.el('span', { text: st.mode === 'auto' ? 'авто' : 'ручной' }),
        ]),
        U.el('div', { class: 'cc-mini' }, [
          U.el('div', {}, [U.el('span', { text: 'энергия' }), U.el('b', { text: U.pctNum(body.energy) })]),
          U.el('div', {}, [U.el('span', { text: 'устал.' }), U.el('b', { text: U.pctNum(body.fatigue) })]),
          U.el('div', {}, [U.el('span', { text: 'сдал' }), U.el('b', { text: String(st.stats.delivered) })]),
        ]),
        U.el('div', { class: 'cc-actions' }, [
          U.el('button', { type: 'button', text: 'взять', onclick: function (e) { e.stopPropagation(); quick(st.id, 'pick'); } }),
          U.el('button', { type: 'button', text: 'нести', onclick: function (e) { e.stopPropagation(); quick(st.id, 'store'); } }),
          U.el('button', { type: 'button', text: 'перерыв', onclick: function (e) { e.stopPropagation(); quick(st.id, 'rest'); } }),
          U.el('button', { type: 'button', text: 'авто', class: st.mode === 'auto' ? 'on' : '', onclick: function (e) { e.stopPropagation(); quick(st.id, 'auto'); } }),
        ]),
      ]);
      dom.side.appendChild(card);
    });

    dom.side.appendChild(U.el('h3', { text: 'Журнал смены' }));
    var logBox = U.el('div', { class: 'log' });
    game.api.log.slice(-14).reverse().forEach(function (entry) {
      logBox.appendChild(U.el('div', {}, [
        U.el('time', { text: U.clockLabel(entry.t, cfg.shiftRealSeconds, cfg.shiftHours) }),
        U.el('span', { class: entry.tone, text: entry.text }),
      ]));
    });
    dom.side.appendChild(logBox);
  }

  function quick(id, cmd) {
    var res = game.command(id, cmd);
    if (!res.ok) U.toast(res.reason || 'Приказ не выполнен', 'bad');
    renderSelected();
    renderSide();
  }

  function renderHud() {
    var snap = game.snapshotForUi();
    dom.score.textContent = U.money(snap.score);
    dom.orders.textContent = snap.delivered + (snap.missed ? ' / −' + snap.missed : '');
    dom.quality.textContent = snap.quality + ' %';
    dom.time.textContent = U.clockLabel(snap.time, snap.shiftLength, cfg.shiftHours);
    dom.ctlTick.textContent = WC.world && WC.world.state ? (WC.meshes.stats.meshes + ' мешей · ' + WC.meshes.stats.triangles + ' тр.') : '';
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
        U.el('button', { class: 'icon-btn', type: 'button', text: '✕', onclick: closeModal, 'aria-label': 'Закрыть' }),
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
        U.el('h3', { text: 'Клавиши' }),
        U.el('p', { html: '<kbd>Пробел</kbd> пауза · <kbd>C</kbd> вид · <kbd>I</kbd> инспектор · <kbd>M</kbd> звук · <kbd>S</kbd> сохранить · <kbd>H</kbd> справка · <kbd>1</kbd><kbd>2</kbd><kbd>3</kbd> рабочий' }),
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
        U.el('button', { class: 'icon-btn', type: 'button', text: '✕', onclick: closeModal, 'aria-label': 'Закрыть' }),
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
        U.el('button', { class: 'icon-btn', type: 'button', text: '✕', onclick: closeModal, 'aria-label': 'Закрыть' }),
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
  }

  function setCamera(mode) {
    WC.world.setMode(mode);
    U.$$('#camera-seg button').forEach(function (button) {
      button.classList.toggle('on', button.getAttribute('data-view') === mode);
    });
    document.body.classList.toggle('view-top', mode === 'top');
    document.body.classList.toggle('view-third', mode === 'third');
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
      } else if (type === 'dropped') {
        U.toast('Уронил ' + payload.order.code + ' — брак ' + Math.round(payload.order.damage * 100) + '%', 'bad', 2200);
      } else if (type === 'body-event') {
        U.toast(payload.worker.state.name.split(' ')[0] + ': ' + payload.event.text, payload.event.tone === 'bad' ? 'bad' : 'info', 2000);
      }
    };
    game.api.onShiftEnd = function (summary) { openShiftEnd(summary); };
    U.toast('Смена началась. Пульт слева.', 'info', 2600);
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
    toggleSound: toggleSound,
    setCamera: setCamera,
  };
})(typeof window !== 'undefined' ? window : globalThis);
