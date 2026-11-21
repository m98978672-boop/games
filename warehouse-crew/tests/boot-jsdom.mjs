// Полный запуск игры в jsdom — так, как это делает браузер.
//
// Подключаются НАСТОЯЩИЕ shared/engine.js, shared/engine-bootstrap.js и
// ratcore/ratcore.bundle.js: заглушки запрещены (одна такая заглушка уже
// скрыла баг «GamesEngine.create(...).then is not a function»).
//
// Проверяются три сценария: GitHub Pages, file:// (fetch запрещён) и
// «данных нет вовсе» (запасной мозг). Плюс мобильная раскладка: нижняя
// шторка пульта, quickbar и масштаб --ui.
//
// Зависимости не входят в репозиторий. Установите их рядом:
//     npm install --no-save jsdom three
//     node warehouse-crew/tests/boot-jsdom.mjs
// Если пакетов нет — тест честно пропускается (exit 0), чтобы CI без
// node_modules оставался зелёным.

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const gameDir = path.resolve(here, '..');
const repoRoot = path.resolve(gameDir, '..');

function loadDep(name) {
  const roots = [process.env.WC_DEPS, path.join(repoRoot, 'node_modules'), path.join(gameDir, 'node_modules')]
    .filter(Boolean);
  for (const root of roots) {
    try {
      const req = createRequire(path.join(root, 'noop.js'));
      return req(name);
    } catch (err) { /* пробуем следующее место */ }
  }
  try { return createRequire(import.meta.url)(name); } catch (err) { return null; }
}

const { JSDOM } = (() => {
  const mod = loadDep('jsdom');
  return mod ? { JSDOM: mod.JSDOM || mod.default } : {};
})();
const THREE = loadDep('three');

if (!JSDOM || !THREE) {
  console.log('⚠ jsdom/three не установлены — тест запуска игры пропущен (npm install --no-save jsdom three)');
  process.exit(0);
}

const SCRIPTS = [
  'src/sim/model.js', 'src/ai/brain-net.js', 'src/sim/warehouse.js', 'src/sim/worker.js',
  'src/config.js', 'src/util.js', 'src/layout.js', 'src/save.js', 'src/audio.js',
  'src/render/meshes.js', 'src/render/world.js', 'src/render/bodyview.js',
  'src/render.js', 'src/game.js', 'src/ui.js', 'src/main.js',
];

class StubRenderer {
  constructor(opts = {}) {
    this.domElement = opts.canvas;
    this.shadowMap = { enabled: false };
    this.info = { render: { calls: 0, triangles: 0 } };
  }
  setPixelRatio() {}
  setClearColor() {}
  setSize() {}
  render() {}
  getContext() { return {}; }
  dispose() {}
}

let failures = 0;
function check(ok, label, extra) {
  if (ok) console.log('  ✓ ' + label);
  else {
    failures += 1;
    console.log('  ✗ ' + label + (extra ? ' — ' + JSON.stringify(extra) : ''));
  }
}

async function boot({ allowFetch, allowInline, label, width, height, touch }) {
  const html = fs.readFileSync(path.join(gameDir, 'index.html'), 'utf8');
  const dom = new JSDOM(html, {
    url: 'http://localhost/warehouse-crew/',
    pretendToBeVisual: true,
    runScripts: 'outside-only',
  });
  const { window } = dom;
  Object.defineProperty(window, 'innerWidth', { value: width, writable: true });
  Object.defineProperty(window, 'innerHeight', { value: height, writable: true });
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query) => ({ matches: touch && /coarse/.test(query), media: query, addEventListener() {}, removeEventListener() {} }),
  });
  window.THREE = Object.assign({}, THREE, { WebGLRenderer: StubRenderer });
  window.TextEncoder = TextEncoder;
  window.TextDecoder = TextDecoder;
  const errors = [];
  window.console = { log() {}, warn() {}, error: (...a) => errors.push(a.map(String).join(' ')) };
  window.fetch = (url) => {
    if (!allowFetch) return Promise.reject(new TypeError('Failed to fetch (file://)'));
    let rel = String(url).replace(/^https?:\/\/localhost\//, '').replace(/^\.\//, '');
    if (rel.startsWith('warehouse-crew/')) rel = rel.slice('warehouse-crew/'.length);
    const file = path.join(gameDir, rel);
    if (!fs.existsSync(file)) return Promise.resolve({ ok: false, status: 404, json: async () => ({}) });
    return Promise.resolve({ ok: true, status: 200, json: async () => JSON.parse(fs.readFileSync(file, 'utf8')) });
  };
  window.URL.createObjectURL = () => 'blob:test';
  window.requestAnimationFrame = () => 0;

  // Настоящий движок и настоящий мост — никаких заглушек API.
  window.eval(fs.readFileSync(path.join(repoRoot, 'ratcore/ratcore.bundle.js'), 'utf8'));
  window.eval(fs.readFileSync(path.join(repoRoot, 'shared/engine.js'), 'utf8'));
  if (!window.GamesEngine) throw new Error('shared/engine.js не объявил GamesEngine');

  for (const f of SCRIPTS) window.eval(fs.readFileSync(path.join(gameDir, f), 'utf8'));
  if (allowInline) window.eval(fs.readFileSync(path.join(gameDir, 'data/brain-data.js'), 'utf8'));
  window.eval(fs.readFileSync(path.join(repoRoot, 'shared/engine-bootstrap.js'), 'utf8'));

  const result = { label, errors };
  try {
    await window.WC.main.boot();
  } catch (err) {
    result.bootError = String(err && err.message ? err.message : err);
  }
  const game = window.WC.game;
  const body = window.document.body;
  const modal = window.document.getElementById('modal-root');
  Object.assign(result, {
    ready: Boolean(game.api && game.api.ready),
    fatalModal: /Не удалось запустить/.test(modal ? modal.textContent : ''),
    crew: game.api.crew.length,
    brainSource: game.api.brainSource,
    baseParams: game.api.baseBrain
      ? game.api.baseBrain.layers.reduce((n, l) => n + l.w.length + l.b.length, 0)
      : 0,
    engineTools: Boolean(game.api.engine && game.api.engine.tools),
    meshes: window.WC.meshes ? window.WC.meshes.stats.meshes : 0,
    bodyReady: body.classList.contains('ready'),
    sheet: body.getAttribute('data-sheet'),
    device: window.WC.layout ? window.WC.layout.state.device : null,
    uiScale: window.WC.layout ? window.WC.layout.state.ui : null,
    uiVar: window.document.documentElement.style.getPropertyValue('--ui'),
    sheetVar: window.document.documentElement.style.getPropertyValue('--sheet-h'),
    quickbar: Boolean(window.document.getElementById('quickbar')),
    haloRecipe: Boolean(window.WC.meshes.RECIPES.halo),
  });
  if (result.ready) {
    for (let i = 0; i < 900; i++) game.update(1 / 60);
    result.delivered = game.sim.state.stats.delivered;
    result.orders = game.sim.state.orders.length;

    // Карточки бригады и карточка выбранного не должны пересобираться:
    // иначе анимации и переходы полосок перезапускаются каждые 110 мс.
    const doc = window.document;
    const cards = doc.querySelectorAll('.crew-card');
    result.crewCards = cards.length;
    const firstCard = cards[0] || null;
    if (window.WC.ui) {
      window.WC.ui.renderSide();
      window.WC.ui.renderSide();
      window.WC.ui.renderSelected();
      window.WC.ui.renderSelected();
    }
    result.cardStable = Boolean(firstCard && doc.querySelectorAll('.crew-card')[0] === firstCard);
    result.crewCardsAfter = doc.querySelectorAll('.crew-card').length;
    const selectedCard = doc.getElementById('selected-card');
    result.selectedChildren = selectedCard ? selectedCard.children.length : 0;
    // Три камеры: 3-е лицо → сверху за рабочим → весь цех
    result.cameraButtons = doc.querySelectorAll('#camera-seg button').length;
    result.truckPanel = Boolean(doc.getElementById('truck-list'));
    result.truckButton = Boolean(doc.getElementById('btn-truck'));
    if (window.WC.world && window.WC.world.cycleMode) {
      const first = window.WC.world.cycleMode();
      const second = window.WC.world.cycleMode();
      result.cameraCycle = [first, second];
      window.WC.world.setMode('third');
    }
    if (window.WC.ui && window.WC.ui.setCamera) {
      window.WC.ui.setCamera('follow');
      result.followMode = window.WC.world.getMode();
      result.followClass = body.classList.contains('view-follow');
      window.WC.ui.setCamera('third');
    }
    // Фуры: вызов фуры из пульта создаёт её на доке
    if (window.WC.game && window.WC.game.sim) {
      const truck = window.WC.game.sim.spawnTruck('unload');
      result.truckSpawned = Boolean(truck);
      result.truckOrders = truck ? truck.total : 0;
      // Кадр с фурой: меши фуры обязаны собраться движком без ошибок
      try {
        window.WC.world.render(1 / 30, window.WC.game);
        result.truckRendered = true;
        result.truckMeshes = window.WC.world.scene.children.length;
      } catch (err) {
        result.truckRendered = false;
        result.truckError = String(err && err.message);
      }
    }
    // Плашка имени в quickbar должна переключать рабочего одним тапом
    const cycle = doc.getElementById('qb-cycle');
    if (cycle) {
      const before = window.WC.game.api.activeWorkerId;
      cycle.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
      result.cycleWorks = window.WC.game.api.activeWorkerId !== before;
      window.WC.game.selectWorker(before);
    }
    if (window.WC.ui && window.WC.ui.sheet) {
      window.WC.ui.sheet.set('full', true);
      result.sheetFull = body.getAttribute('data-sheet');
      window.WC.ui.sheet.set('hidden', true);
      result.sheetHidden = body.getAttribute('data-sheet');
    }

    // Коробки стоят на опоре: раньше их ставили на фиксированные 0.13 м,
    // из-за чего любая коробка висела в воздухе, а после переноски ещё и
    // улетала вслед за рабочим (оставалась ребёнком carryAnchor).
    const box3 = new THREE.Box3();
    let sunk = 0, hovering = 0, stray = 0, seen = 0;
    const slots = game.sim.state.slots;
    for (let i = 0; i < 60 * 30; i++) {
      game.update(1 / 30);
      window.WC.world.render(1 / 30, game);
      if (i % 12) continue;
      window.WC.world.scene.updateMatrixWorld(true);
      const byId = new Map(game.sim.state.orders.map((o) => [o.id, o]));
      window.WC.world.scene.traverse((obj) => {
        if (!obj.userData || !obj.userData.orderId) return;
        const order = byId.get(obj.userData.orderId);
        if (!order || !obj.visible) return;
        box3.setFromObject(obj);
        seen += 1;
        // Паллеты приёмки (0.12) и площадки доков (0.09) тоже держат коробку.
        let support = game.sim.supportHeight(order);
        if (order.status === 'stored') {
          const slot = slots.find((s) => s.id === order.slotId);
          support = slot ? slot.h + 0.025 : 0;
          if (obj.parent !== window.WC.world.scene) stray += 1;
        }
        if (order.status === 'carried') {
          const carrier = game.api.crew.find((w) => w.state.id === order.carrier);
          if (carrier) {
            const c = box3.getCenter(new THREE.Vector3());
            if (Math.hypot(c.x - carrier.state.pos.x, c.z - carrier.state.pos.y) > 1.6) stray += 1;
          }
        } else {
          if (box3.min.y < support - 0.06) sunk += 1;
          if (!order.physics && box3.min.y > support + 0.06) hovering += 1;
        }
      });
    }
    result.boxSamples = seen;
    result.boxSunk = sunk;
    result.boxHovering = hovering;
    result.boxStray = stray;
    // Новые режимы проходят через те же игровые и рендерные API.
    try {
      window.WC.ui.setCamera('map2d');
      window.WC.world.render(1 / 30, game);
      result.mapWorks = window.WC.world.camera.isOrthographicCamera && window.WC.world.getMode() === 'map2d';
      window.WC.ui.setCamera('third');
      game.sim.state.stats.score = 250;
      const medic = game.buyStaff('medic');
      const watch = game.buyStaff('watchman');
      result.staffBought = medic.ok && watch.ok && game.sim.state.stats.score === 30 && !game.buyStaff('medic').ok;
      const patient = game.api.crew[0];
      window.WarehouseModel.addInjury(patient.body, { type: 'muscle', part: 'back', severity: 0.3, cause: 'тест' });
      medic.member.state.pos.x = patient.state.pos.x;
      medic.member.state.pos.y = patient.state.pos.y;
      const beforeInjury = patient.body.injuries[0].severity;
      for (let k = 0; k < 30; k++) game.update(1 / 30);
      result.medicWorks = patient.body.injuries.length === 0 || patient.body.injuries[0].severity < beforeInjury;
      window.WC.world.render(1 / 30, game);
      result.staffRenders = game.api.staff.length === 2;
      const victim = game.api.crew[0];
      victim.body.vitality = 0;
      victim.body.deceased = true;
      game.update(1 / 30);
      result.deathWorks = game.api.crew.length === 2 && game.api.deaths.length === 1;
      game.sim.state.time = game.sim.state.day * game.sim.state.dayLength + 0.01;
      game.update(1 / 30);
      window.WC.world.render(1 / 30, game);
      window.WC.ui.renderSide();
      result.hireWorks = game.api.crew.length === 3 && game.sim.state.hires.length === 1;
      game.restart();
      window.WC.world.render(1 / 30, game);
      result.restartWorks = game.api.crew.length === 3 && game.api.staff.length === 0;
    } catch (err) { result.featureError = String(err && err.stack || err); }
  }
  window.close();
  return result;
}

console.log('Запуск игры в jsdom (настоящий движок, без заглушек)');

const modes = [
  { allowFetch: true, allowInline: true, label: 'Pages: fetch + мозги в коде', width: 1440, height: 900, touch: false },
  { allowFetch: false, allowInline: true, label: 'file://: fetch запрещён', width: 1440, height: 900, touch: false },
  { allowFetch: false, allowInline: false, label: 'без данных: запасной мозг', width: 1440, height: 900, touch: false },
  { allowFetch: true, allowInline: true, label: 'телефон 390×844 (touch)', width: 390, height: 844, touch: true },
];

for (const mode of modes) {
  const r = await boot(mode);
  console.log('\n' + r.label);
  check(r.ready && !r.bootError, 'игра дошла до готовности', { bootError: r.bootError });
  check(!r.fatalModal, 'нет модалки «Не удалось запустить склад»');
  check(r.crew === 3, 'трое рабочих', { crew: r.crew });
  check(r.baseParams === 958, '958 параметров обученного мозга', { baseParams: r.baseParams });
  check(r.engineTools, 'движок отдал tools');
  check(r.meshes > 100, 'меши собраны движком', { meshes: r.meshes });
  check(r.bodyReady, 'body.ready выставлен');
  check(Boolean(r.quickbar), 'есть панель быстрых приказов');
  check(r.haloRecipe, 'рецепт подсветки halo в движке');
  check(r.cycleWorks !== false, 'тап по имени в quickbar переключает рабочего');
  check(r.crewCards === 3 && r.crewCardsAfter === 3, 'три карточки бригады без дублей', { n: r.crewCards, after: r.crewCardsAfter });
  check(r.cardStable, 'карточки не пересобираются при обновлении HUD');
  check(r.selectedChildren === 9, 'карточка рабочего собрана один раз (3 строки + 4 полоски + характеры + травмы)', { children: r.selectedChildren });
  check(r.cameraButtons === 4, 'в пульте четыре режима камеры', { n: r.cameraButtons });
  check(r.truckPanel && r.truckButton, 'есть блок фур и кнопка вызова');
  check(Array.isArray(r.cameraCycle) && r.cameraCycle[0] === 'follow' && r.cameraCycle[1] === 'top', 'C переключает 3-е лицо → сверху за ним → весь цех', { cycle: r.cameraCycle });
  check(r.followMode === 'follow' && r.followClass, 'камера «сверху за рабочим» включается', { mode: r.followMode });
  check(r.truckSpawned && r.truckOrders > 0, 'фура приезжает на док с грузом', { orders: r.truckOrders });
  check(r.truckRendered === true, 'фура рисуется мешами движка без ошибок', { err: r.truckError });
  if (mode.touch) {
    check(r.device === 'phone', 'layout.js распознал телефон', { device: r.device });
    check(Number(r.uiVar) > 0.8 && Number(r.uiVar) < 1.3, '--ui посчитан', { ui: r.uiVar });
    check(r.sheet === 'hidden', 'на телефоне шторка стартует свёрнутой', { sheet: r.sheet });
    check(r.sheetFull === 'full' && r.sheetHidden === 'hidden', 'шторка переключает положения');
    check(Boolean(r.sheetVar), 'высота шторки уходит в --sheet-h', { sheetVar: r.sheetVar });
  }
  check(r.errors.length === 0, 'ни одной ошибки в консоли', { errors: r.errors.slice(0, 3) });
  if (r.ready) {
    check(r.orders > 0, 'заказы появляются на приёмке', { orders: r.orders });
  check(r.boxSamples > 200, 'коробки вообще рисуются', { samples: r.boxSamples });
  check(r.boxSunk === 0 && r.boxHovering === 0, 'коробки стоят на опоре (не тонут и не летают)',
    { sunk: r.boxSunk, hovering: r.boxHovering });
  check(r.boxStray === 0, 'коробку не уносит за рабочим после переноски', { stray: r.boxStray });
  check(!r.featureError && r.mapWorks && r.staffBought && r.medicWorks && r.staffRenders && r.deathWorks && r.hireWorks && r.restartWorks, '2D, магазин, медик, смерть и пополнение работают в игре', { error: r.featureError, map: r.mapWorks, staff: r.staffBought, medic: r.medicWorks, death: r.deathWorks, hire: r.hireWorks, restart: r.restartWorks });
    // У запасного (синтетического) мозга качество случайное — требуем доставку
    // только там, где загружены обученные веса.
    if (mode.allowInline) check(r.delivered > 0, 'смена идёт, заказы доставляются', { delivered: r.delivered });
  }
}

console.log('');
if (failures) {
  console.log('✗ Провалов: ' + failures);
  process.exit(1);
}
console.log('✓ Игра запускается во всех режимах, мобильная раскладка работает');
