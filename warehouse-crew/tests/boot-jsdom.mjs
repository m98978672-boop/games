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
  'src/sim/model.js', 'src/ai/brain-net.js', 'vendor/cannon-es.min.js', 'src/sim/physics.js', 'src/sim/warehouse.js', 'src/sim/worker.js',
  'src/config.js', 'src/util.js', 'src/layout.js', 'src/save.js', 'src/audio.js', 'src/dialogue.js', 'src/safety.js', 'src/voice.js',
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

async function boot({ allowFetch, allowInline, label, width, height, touch, textureBridge }) {
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
  // jsdom has no image decoder or WebGL: verify the material's shader hook
  // with a local stand-in texture, while keeping the real Three material/mesh.
  window.eval(fs.readFileSync(path.join(repoRoot, 'shooter/three.min.js'), 'utf8'));
  const browserThree = window.THREE;
  window.THREE = Object.assign({}, browserThree, { WebGLRenderer: StubRenderer });
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
  if (textureBridge) {
    // Настоящий RatCore без новой функции, как в старом кэше браузера;
    // или движок, в котором экспорт текстуры неожиданно бросает исключение.
    const createEngine = window.RatCore.createEngine;
    window.RatCore.createEngine = function (...args) {
      const engine = createEngine(...args);
      if (textureBridge === 'missing') delete engine.tools.bridge.exportTexture;
      if (textureBridge === 'throws') engine.tools.bridge.exportTexture = () => { throw new Error('texture unavailable'); };
      return engine;
    };
  }
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
    const nightButton = doc.querySelector('[data-lighting="night"]');
    const dayButton = doc.querySelector('[data-lighting="day"]');
    if (nightButton && dayButton) {
      nightButton.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
      result.lightingWorks = game.api.shiftMode === 'night' && nightButton.getAttribute('aria-pressed') === 'true' &&
        game.api.crew.every(w => game.api.envs[w.id].shiftMode === 'night');
      dayButton.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
      result.lightingWorks = result.lightingWorks && game.api.shiftMode === 'day' && dayButton.getAttribute('aria-pressed') === 'true';
    }
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
        const vehicle = window.WC.world.scene.children.find(o => o.userData.vehicle === 'truck');
        const wheels = vehicle && vehicle.userData.wheels;
        const wheelRotation = wheels && wheels[0].rotation.z;
        game.update(0.1); window.WC.world.render(.1, game);
        const lift = window.WC.world.scene.children.find(o => o.userData.vehicle === 'forklift');
        result.transportDetails = !!vehicle && wheels.length === 6 && Math.abs(wheels[0].rotation.z - wheelRotation) > .01 &&
          !!lift && lift.userData.wheels.length === 4 && !!lift.userData.forks && !!lift.userData.beacon;
      } catch (err) {
        result.truckRendered = false;
        result.truckError = String(err && err.message);
      }
    }
    const shopBtn = doc.getElementById('btn-shop');
    if (shopBtn) {
      shopBtn.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
      result.shopShortcut = body.getAttribute('data-sheet') === 'full' && doc.activeElement === doc.getElementById('shop-heading');
    }
    window.WC.world.render(1 / 30, game);
    window.WC.world.scene.updateMatrixWorld(true);
    const rig = window.WC.world.scene.children.find(o => o.userData?.rig === game.api.crew[0].id);
    const armMeshes = [];
    rig.traverse(o => { if (['upperArm', 'forearm', 'shoulderPad', 'elbowPad', 'hand'].includes(o.userData?.recipe)) armMeshes.push(o); });
    result.opaqueArms = armMeshes.length >= 10 && armMeshes.every(o => !o.material.transparent && o.material.opacity === 1 && o.material.depthWrite &&
      (o.userData.recipe === 'hand' || o.material.side === browserThree.DoubleSide));
    const findPart = name => window.WC.world.scene.children.find(o => o.userData && o.userData.scenePart === name);
    const floor = findPart('floor'), yard = findPart('yard'), stripe = findPart('floorStripe');
    const floorTop = new THREE.Box3().setFromObject(floor).max.y;
    const yardTop = new THREE.Box3().setFromObject(yard).max.y;
    const stripeTop = new THREE.Box3().setFromObject(stripe).max.y;
    const heavyPadTop = new THREE.Box3().setFromObject(findPart('heavyPad')).max.y;
    const heavyStripeTop = new THREE.Box3().setFromObject(findPart('heavyStripe')).max.y;
    const roadTop = new THREE.Box3().setFromObject(findPart('streetSlab')).max.y;
    const dashTop = new THREE.Box3().setFromObject(findPart('roadDash')).max.y;
    const shader = { uniforms: {}, vertexShader: browserThree.ShaderLib.standard.vertexShader, fragmentShader: browserThree.ShaderLib.standard.fragmentShader };
    floor.material.onBeforeCompile(shader);
    result.textureFallback = !floor.material.userData.surfaceTexture && !yard.material.userData.surfaceTexture;
    result.textureMaterial = floor.material.userData.textureId?.startsWith('tex_') &&
      floor.material.userData.surfaceTexture?.image?.data?.length === 128 * 128 * 4 &&
      shader.uniforms.warehouseSurface.value === floor.material.userData.surfaceTexture && shader.vertexShader.includes('warehouseSurfacePos =') && shader.fragmentShader.includes('texture2D(warehouseSurface') &&
      yard.material.userData.textureId?.startsWith('tex_');
    result.floorSurfaces = { floorTop, yardTop, stripeTop, heavyPadTop, heavyStripeTop, roadTop, dashTop };
    result.floorSeparation = Math.abs(floorTop) < 1e-5 && yardTop < floorTop - 0.02 && stripeTop > floorTop + 0.01 && heavyStripeTop > heavyPadTop + .01 && dashTop > roadTop + .01;
    result.noCabinLetters = !doc.querySelector('[id^="cabin-sign-"]');
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
      game.api.envs[game.api.crew[0].id].onCaught(game.api.crew[0].state);
      result.caughtWorks = watch.member.state.stats.caught === 1;
      const patient = game.api.crew[0];
      window.WarehouseModel.addInjury(patient.body, { type: 'muscle', part: 'back', severity: 0.3, cause: 'тест' });
      medic.member.state.pos.x = patient.state.pos.x;
      medic.member.state.pos.y = patient.state.pos.y;
      const beforeInjury = patient.body.injuries[0].severity;
      for (let k = 0; k < 30; k++) game.update(1 / 30);
      result.medicWorks = patient.body.injuries.length === 0 || patient.body.injuries[0].severity < beforeInjury;
      window.WC.world.render(1 / 30, game);
      result.staffRenders = game.api.staff.length === 2;
      let staffCrossing = false;
      let staffDistance = 0;
      for (let k = 0; k < 450; k++) {
        const before = { ...watch.member.state.pos };
        game.update(1 / 30);
        const after = watch.member.state.pos;
        staffDistance += Math.hypot(after.x - before.x, after.y - before.y);
        if (window.WarehouseWorker.pathBlocked(before, after, 0.25)) staffCrossing = true;
      }
      result.staffNavigation = !staffCrossing && staffDistance > 1;
      game.api.envs[patient.id].onInjury(patient.state, { severity: 0.5, text: 'тестовая травма' });
      window.WC.world.render(1 / 30, game);
      result.bloodRendered = game.sim.state.bloodDrops.length > 0;

      const victim = game.api.crew[0];
      victim.state.pos.x = -5.6; victim.state.pos.y = 0;
      victim.state.inToilet = false; victim.state.privacy = false;
      victim.body.energy = 0; victim.body.collapsed = true;
      for (let k = 0; k < 30; k++) game.update(1 / 30);
      window.WC.world.render(1 / 30, game);
      const normalRig = window.WC.world.scene.children.find(o => o.userData && o.userData.rig === victim.id);
      result.ragdollWorks = !!victim.state.ragdoll && Object.keys(victim.state.ragdoll).length === 15 && normalRig && !normalRig.visible && victim.state.ragdoll.head.y < 1.5;
      victim.body.vitality = 0;
      victim.body.deceased = true;
      game.update(1 / 30);
      result.deathWorks = game.api.crew.length === 2 && game.api.deaths.length === 1 && game.api.deaths[0].name === victim.name;
      game.sim.state.time = game.sim.state.day * game.sim.state.dayLength + 0.01;
      game.update(1 / 30);
      window.WC.world.render(1 / 30, game);
      window.WC.ui.renderSide();
      result.hireWorks = game.api.crew.length === 3 && game.sim.state.hires.length === 1;
      game.restart();
      // Последний фоновой снимок включает паузу и свежие данные. На pagehide
      // сохранение выполняется и без visibilitychange (например, bfcache).
      game.api.crew[0].body.energy = .42;
      Object.defineProperty(doc, 'hidden', { configurable: true, value: true });
      doc.dispatchEvent(new window.Event('visibilitychange'));
      let background = JSON.parse(window.localStorage.getItem(window.WC.save.CHECKPOINT_KEY));
      result.backgroundSave = game.state.paused && background.checkpoint.runtime.paused && background.checkpoint.crew[0].state.body.energy === .42;
      game.api.crew[0].body.energy = .39;
      window.dispatchEvent(new window.Event('pagehide'));
      background = JSON.parse(window.localStorage.getItem(window.WC.save.CHECKPOINT_KEY));
      result.backgroundSave = result.backgroundSave && background.checkpoint.crew[0].state.body.energy === .39;
      Object.defineProperty(doc, 'hidden', { configurable: true, value: false });
      game.restart();
      window.WC.world.render(1 / 30, game);
      result.restartWorks = game.api.crew.length === 3 && game.api.staff.length === 0;
      // Сводка не изменяет симуляцию, остаётся стабильной и ведёт к нужному рабочему.
      const crew = game.api.crew;
      crew[0].body.energy = .18;
      crew[1].body.injuries.push({type:'muscle',part:'back',severity:.2,at:0,cause:'test'});
      crew[2].body.collapsed = true;
      const safetyBefore = JSON.stringify(game.captureCheckpoint());
      window.WC.ui.state.lastUiAt = -Infinity; window.WC.ui.frame(1/30);
      const safetyRows = [...doc.querySelectorAll('#safety-list .safety-row')];
      result.safetyDisplay = safetyRows.length === 3 && safetyRows[0].querySelector('.safety-name').textContent === crew[2].name &&
        safetyRows[0].classList.contains('critical') && safetyRows[0].textContent.includes('обморок') &&
        doc.getElementById('safety-count').textContent === '3' && JSON.stringify(game.captureCheckpoint()) === safetyBefore;
      window.WC.ui.state.lastUiAt = -Infinity; window.WC.ui.frame(1/30);
      result.safetyStable = doc.querySelector('#safety-list .safety-row') === safetyRows[0];
      safetyRows[1].querySelector('.safety-actions button').click();
      result.safetySelect = game.api.activeWorkerId === crew[0].id;
      safetyRows[2].querySelectorAll('button')[1].click();
      result.safetyInspect = window.WC.ui.state.inspectorOpen && window.WC.ui.state.inspectorWorkerId === crew[1].id;
      window.WC.ui.closeModal();
      const removedButton = safetyRows[0].querySelector('button'); removedButton.focus();
      crew[0].body.energy = .8; crew[1].body.injuries = []; crew[2].body.collapsed = false;
      window.WC.ui.state.lastUiAt = -Infinity; window.WC.ui.frame(1/30);
      result.safetyClear = doc.getElementById('safety-count').textContent === '0' &&
        !doc.getElementById('safety-empty').hidden && doc.activeElement === doc.getElementById('safety-heading');
      // Очередь сортируется по сроку, занятые заказы нельзя назначить;
      // после перезапуска клики работают с новыми объектами симуляции.
      game.api.crew.forEach(w => game.command(w.id, 'wait'));
      game.selectWorker(game.api.crew[0].id);
      const qLate = game.sim.spawnOrder(), qSoon = game.sim.spawnOrder();
      qLate.mass = qSoon.mass = 8; qLate.deadline = 100; qSoon.deadline = 20;
      window.WC.ui.state.lastUiAt = -Infinity; window.WC.ui.frame(1 / 30);
      const rows = [...doc.querySelectorAll('#order-list .order')];
      result.queueSorted = rows.length >= 2 && rows[0].querySelector('.o-code').textContent === qSoon.code;
      const priorityButton = rows[0].querySelector('.o-priority');
      priorityButton.click();
      result.priorityWorks = qSoon.dispatchPriority === true && priorityButton.getAttribute('aria-pressed') === 'true';
      priorityButton.click();
      result.priorityWorks = result.priorityWorks && qSoon.dispatchPriority === false && priorityButton.getAttribute('aria-pressed') === 'false';
      rows[0].querySelector('.o-take').click();
      window.WC.ui.state.lastUiAt = -Infinity; window.WC.ui.frame(1 / 30);
      result.queueAssigned = qSoon.status === 'claimed' && qSoon.carrier === game.api.crew[0].id && rows[0].querySelector('.o-take').disabled && rows[1].querySelector('.o-take').disabled;
      const filter = name => doc.querySelector('[data-order-filter="' + name + '"]');
      const visibleCodes = () => [...doc.querySelectorAll('#order-list .o-code')].map(e => e.textContent);
      const savedBeforeFilter = JSON.stringify(game.captureCheckpoint());
      filter('pending').click();
      result.queueFilters = visibleCodes().join() === qLate.code && filter('pending').getAttribute('aria-pressed') === 'true';
      filter('working').click(); result.queueFilters = result.queueFilters && visibleCodes().join() === qSoon.code;
      filter('soon').click(); result.queueFilters = result.queueFilters && visibleCodes().join() === qSoon.code;
      // Граница 30 секунд обновляется во время смены, просроченные тоже видны.
      qLate.deadline = game.sim.state.time + 30;
      window.WC.ui.state.lastUiAt = -Infinity; window.WC.ui.frame(1 / 30);
      result.queueFilters = result.queueFilters && visibleCodes().length === 2;
      qLate.deadline = game.sim.state.time - 5;
      window.WC.ui.state.lastUiAt = -Infinity; window.WC.ui.frame(1 / 30);
      result.queueFilters = result.queueFilters && visibleCodes()[0] === qLate.code;
      qLate.deadline = 100;
      filter('priority').click(); result.queueFilters = result.queueFilters && !doc.getElementById('queue-empty').hidden && visibleCodes().length === 0;
      result.queueFilters = result.queueFilters && savedBeforeFilter === JSON.stringify(game.captureCheckpoint());
      filter('all').click();
      const qLateRow = [...doc.querySelectorAll('#order-list .order')].find(row => row.querySelector('.o-code').textContent === qLate.code);
      qLateRow.querySelector('.o-priority').click(); filter('priority').click();
      const removePriority = doc.querySelector('#order-list .o-priority'); removePriority.focus(); removePriority.click();
      result.queueFocus = doc.activeElement === filter('priority') && !doc.getElementById('queue-empty').hidden;
      filter('all').click();
      const free = game.sim.state.slots.filter(slot => !slot.occupied).length;
      result.queueSummary = doc.getElementById('queue-summary').textContent.includes('ячеек: ' + free + '/') &&
        doc.getElementById('queue-summary').textContent.includes('≤ 30 с: 1');
      const occupancy = game.sim.state.slots.map(slot => slot.occupied);
      game.sim.state.slots.forEach(slot => slot.occupied = true);
      window.WC.ui.state.lastUiAt = -Infinity; window.WC.ui.frame(1 / 30);
      result.queueSummary = result.queueSummary && doc.getElementById('queue-summary').textContent.includes('ячеек: 0/36') && doc.getElementById('queue-summary').classList.contains('warning');
      game.sim.state.slots.forEach((slot,i) => slot.occupied = occupancy[i]);
      const additions = Array.from({length:15}, (_, i) => ({...qLate, id:'ui-test-' + i, code:'TEST-' + i, deadline:150 + i}));
      game.sim.state.orders.push(...additions);
      window.WC.ui.state.lastUiAt = -Infinity; window.WC.ui.frame(1 / 30);
      const more = doc.getElementById('queue-more');
      result.queueMore = visibleCodes().length === 14 && !more.hidden && doc.getElementById('queue-showing').textContent === 'Показано 14 из 17';
      more.click(); result.queueMore = result.queueMore && visibleCodes().length === 17 && more.hidden && doc.activeElement === filter('all');
      game.sim.state.orders.splice(-additions.length);
      game.restart(); game.api.crew.forEach(w => game.command(w.id, 'wait'));
      const newOrder = game.sim.spawnOrder(); newOrder.mass = 8;
      window.WC.ui.state.lastUiAt = -Infinity; window.WC.ui.frame(1 / 30);
      const newButton = doc.querySelector('#order-list .o-take');
      newButton.click();
      result.queueRestart = newOrder.status === 'claimed' && newOrder.carrier === game.api.crew[0].id;
      game.restart();
      const hireButton = doc.querySelector('[data-buy="worker"]');
      game.sim.state.stats.score = 400;
      window.WC.ui.state.lastUiAt = -Infinity;
      window.WC.ui.frame(1 / 30);
      for (let i = 0; i < 5; i++) hireButton.click();
      window.WC.ui.renderSide();
      result.extraCrew = game.api.crew.length === 8 && game.api.crewTarget === 8 && game.sim.state.stats.score === 0 && hireButton.disabled;
      result.extraTabs = doc.querySelectorAll('#crew-tabs [data-worker]').length === 8;
      const hire = game.api.crew[7];
      hire.body.energy = .19;
      window.WC.ui.state.lastUiAt = -Infinity; window.WC.ui.frame(1/30);
      const hiredAlert = [...doc.querySelectorAll('#safety-list .safety-row')].find(row => row.querySelector('.safety-name').textContent === hire.name);
      result.safetyHired = Boolean(hiredAlert);
      if (hiredAlert) { hiredAlert.querySelector('button').click(); result.safetyHired = result.safetyHired && game.api.activeWorkerId === hire.id; }
      hire.body.energy = .8;
      result.extraControllable = game.command(hire.id, 'auto').ok && game.api.envs[hire.id].brain === game.api.baseBrain;
      game.sim.state.stats.score = 80;
      result.maxCrew = !game.hireWorker().ok && game.sim.state.stats.score === 80;
      game.api.crew.forEach(w => game.command(w.id, 'wait'));
      const hireOrder = game.sim.spawnOrder();
      hireOrder.mass = 8;
      result.hireCommand = game.command(hire.id, 'pick', { orderId: hireOrder.id }).ok;
      for (let k = 0; k < 1200 && hire.state.stats.picked < 1; k++) game.update(1 / 30);
      result.hireActuallyWorks = hire.state.stats.picked > 0;
      const oldId = hire.id;
      hire.body.vitality = 0; hire.body.deceased = true;
      game.update(1 / 30);
      game.sim.state.time = game.sim.state.day * game.sim.state.dayLength + 0.01;
      game.update(1 / 30);
      result.extraReplaced = game.api.crew.length === 8 && !game.api.crew.some(w => w.id === oldId) && game.api.crew.every(w => game.api.envs[w.id].workers === game.api.crew);
      window.WC.ui.state.lastUiAt = -Infinity; window.WC.ui.frame(1/30);
      result.safetyHired = result.safetyHired && !window.WC.ui.state.safetyRows.has(oldId);
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
  { allowFetch: true, allowInline: true, label: 'старый движок без exportTexture', width: 844, height: 390, touch: true, textureBridge: 'missing' },
  { allowFetch: true, allowInline: true, label: 'ошибка экспорта текстуры', width: 1440, height: 900, touch: false, textureBridge: 'throws' },
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
  if (mode.textureBridge) check(r.textureFallback, 'игра работает без текстуры при несовместимом движке');
  else check(r.textureMaterial, 'текстуры RatCore подключены к полу и двору');
  check(r.opaqueArms, 'руки и суставы непрозрачны и видны с обеих сторон');
  check(r.safetyDisplay && r.safetyStable && r.safetySelect && r.safetyInspect && r.safetyClear && r.safetyHired, 'сводка бригады: состояние, выбор, инспектор и восстановление', {display:r.safetyDisplay, stable:r.safetyStable, select:r.safetySelect, inspect:r.safetyInspect, clear:r.safetyClear, hired:r.safetyHired, error:r.featureError});
  check(r.backgroundSave, 'сохранение при уходе в фон и pagehide', {error:r.featureError});
  check(r.priorityWorks, 'приоритет свободного заказа переключается в очереди');
  check(r.queueFilters && r.queueFocus && r.queueSummary && r.queueMore, 'фильтры, сводка, доступность и полная очередь', {filters:r.queueFilters, focus:r.queueFocus, summary:r.queueSummary, more:r.queueMore, error:r.featureError});
  check(r.queueSorted && r.queueAssigned && r.queueRestart, 'срочность, назначение заказов и перезапуск очереди', { sorted:r.queueSorted, assigned:r.queueAssigned, restart:r.queueRestart, error:r.featureError });
  check(r.floorSeparation, 'пол, двор и разметка не совпадают по глубине', r.floorSurfaces);
  check(r.shopShortcut && r.noCabinLetters, 'магазин открывается кнопкой, подписи кабинок убраны');
  check(r.haloRecipe, 'рецепт подсветки halo в движке');
  check(r.cycleWorks !== false, 'тап по имени в quickbar переключает рабочего');
  check(r.crewCards === 3 && r.crewCardsAfter === 3, 'три карточки бригады без дублей', { n: r.crewCards, after: r.crewCardsAfter });
  check(r.cardStable, 'карточки не пересобираются при обновлении HUD');
  check(r.selectedChildren === 9, 'карточка рабочего собрана один раз (3 строки + 4 полоски + характеры + травмы)', { children: r.selectedChildren });
  check(r.cameraButtons === 4, 'в пульте четыре режима камеры', { n: r.cameraButtons });
  check(r.lightingWorks, 'дневной и ночной свет переключаются на пульте');
  check(r.truckPanel && r.truckButton, 'есть блок фур и кнопка вызова');
  check(Array.isArray(r.cameraCycle) && r.cameraCycle[0] === 'follow' && r.cameraCycle[1] === 'top', 'C переключает 3-е лицо → сверху за ним → весь цех', { cycle: r.cameraCycle });
  check(r.followMode === 'follow' && r.followClass, 'камера «сверху за рабочим» включается', { mode: r.followMode });
  check(r.truckSpawned && r.truckOrders > 0, 'фура приезжает на док с грузом', { orders: r.truckOrders });
  check(r.transportDetails, 'фуры и погрузчик имеют детали и вращающиеся колёса');
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
  check(r.extraCrew && r.extraTabs && r.extraControllable && r.maxCrew && r.extraReplaced && r.hireCommand && r.hireActuallyWorks, 'найм до восьми, управление и замена дополнительных рабочих', { extraCrew: r.extraCrew, tabs: r.extraTabs, controllable: r.extraControllable, max: r.maxCrew, replaced: r.extraReplaced, command: r.hireCommand, works: r.hireActuallyWorks, error: r.featureError });
  check(r.ragdollWorks, 'обморок отображается физическим ragdoll', { ragdoll: r.ragdollWorks, error: r.featureError });
  check(r.staffNavigation && r.bloodRendered && r.caughtWorks, 'персонал обходит препятствия, частицы крови рисуются', { navigation: r.staffNavigation, blood: r.bloodRendered, error: r.featureError });
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
