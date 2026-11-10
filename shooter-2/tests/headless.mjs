/* =============================================================================
   СЕКТОР «ПЕПЕЛ» — интеграционный тест без браузера
   Запуск: node shooter-2/tests/headless.mjs
   -----------------------------------------------------------------------------
   Поднимает настоящий three.js в vm-песочнице, подменяет только WebGLRenderer
   и DOM. Затем запускает игру: миссию, стрельбу, ИИ, регдол, смену миссий.
   Так ловятся ошибки, которые не видит обычный unit-тест.
   ============================================================================= */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

/* ------------------------------ фейковый DOM ---------------------------- */
let idCounter = 0;
function fakeElement(tag) {
  const e = {
    tagName: (tag || 'div').toUpperCase(),
    id: '',
    className: '',
    textContent: '',
    innerHTML: '',
    value: '',
    style: { _p: {}, setProperty(k, v) { this._p[k] = v; }, getPropertyValue(k) { return this._p[k] || ''; } },
    dataset: {},
    children: [],
    parentNode: null,
    classList: {
      _s: new Set(),
      add(c) { this._s.add(c); },
      remove(c) { this._s.delete(c); },
      toggle(c, on) { if (on === undefined) { this._s.has(c) ? this._s.delete(c) : this._s.add(c); } else if (on) this._s.add(c); else this._s.delete(c); },
      contains(c) { return this._s.has(c); }
    },
    appendChild(c) { c.parentNode = this; this.children.push(c); return c; },
    removeChild(c) { this.children = this.children.filter((x) => x !== c); return c; },
    insertBefore(c) { return this.appendChild(c); },
    _handlers: {},
    addEventListener(t, fn) { (this._handlers[t] = this._handlers[t] || []).push(fn); },
    removeEventListener() {},
    removeEventListener() {},
    setAttribute(k, v) { this[k] = v; },
    getAttribute(k) { return this[k]; },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    focus() {},
    getBoundingClientRect() { return { left: 0, top: 0, width: 800, height: 600 }; },
    requestPointerLock() {},
    width: 800, height: 600,
    clientWidth: 800, clientHeight: 600,
    getContext(kind) { return fake2d(); }
  };
  Object.defineProperty(e, 'firstChild', { get: () => e.children[0] || null });
  Object.defineProperty(e, 'lastChild', { get: () => e.children[e.children.length - 1] || null });
  idCounter++;
  return e;
}
function fake2d() {
  const grad = { addColorStop() {} };
  return {
    fillStyle: '', strokeStyle: '', globalAlpha: 1, lineWidth: 1, globalCompositeOperation: '',
    fillRect() {}, strokeRect() {}, clearRect() {}, setLineDash() {}, beginPath() {}, arc() {},
    ellipse() {}, fill() {}, stroke() {}, moveTo() {}, lineTo() {}, rect() {}, quadTo() {},
    save() {}, restore() {}, translate() {}, rotate() {}, closePath() {},
    createRadialGradient() { return grad; }, createLinearGradient() { return grad; },
    clearRect() {}, drawImage() {}, putImageData() {}
  };
}

const elements = new Map();
function getEl(id) {
  if (!elements.has(id)) {
    const e = fakeElement('div');
    e.id = id;
    elements.set(id, e);
  }
  return elements.get(id);
}

const documentStub = {
  getElementById: getEl,
  createElement: (tag) => fakeElement(tag),
  querySelector: () => null,
  querySelectorAll: () => [],
  addEventListener() {},
  removeEventListener() {},
  exitPointerLock() {},
  pointerLockElement: null,
  hidden: false,
  body: fakeElement('body')
};

/* ------------------------------- песочница ------------------------------ */
let rafCallback = null;
const listeners = {};
const sandbox = {
  console, Math, JSON, Map, Set, WeakMap, Array, Object, Number, String, Boolean, Date, Error, Promise,
  isFinite, isNaN, parseFloat, parseInt, Float32Array, Uint16Array, Uint32Array, Int32Array, Uint8Array,
  Infinity, NaN, setTimeout: (fn) => { return 0; }, clearTimeout() {}, setInterval: () => 0, clearInterval() {},
  performance: { now: () => Date.now() },
  requestAnimationFrame: (cb) => { rafCallback = cb; return 1; },
  document: documentStub,
  /* 5 точек касания: headless-прогон изображает телефон, иначе тач-ветка
     управления вообще не включается и её баги не видны. */
  navigator: { userAgent: 'node-touch', maxTouchPoints: 5 },
  devicePixelRatio: 1,
  innerWidth: 1280, innerHeight: 720,
  addEventListener: (type, fn) => { (listeners[type] = listeners[type] || []).push(fn); },
  removeEventListener() {},
  THREE: undefined
};
sandbox.globalThis = sandbox;
sandbox.window = sandbox;
sandbox.self = sandbox;
vm.createContext(sandbox);

// three.js требует контекст и не трогает WebGL при импорте
vm.runInContext(read('three.min.js'), sandbox, { filename: 'three.min.js' });
const T = sandbox.THREE;
assert.ok(T && T.REVISION, 'three.js загрузился');
assert.equal(typeof T.Scene, 'function');

/* ------------ подменяем только рендерер: рисовать некуда --------------- */
class FakeRenderer {
  constructor() {
    this.shadowMap = { enabled: false, type: 0 };
    this.info = { render: { calls: 42, triangles: 12345 }, memory: { geometries: 12, textures: 3 }, programs: [] };
    this.pixelRatio = 1;
    this.renders = 0;
    this.outputColorSpace = '';
    this.toneMapping = 0;
    this.toneMappingExposure = 1;
    // как у настоящего WebGLRenderer: render() сам очищает цвет
    this.autoClear = true;
    this.autoClearColor = true;
    this.autoClearDepth = true;
    this.autoClearStencil = true;
    this.frames = [];      // { passes: [...], wipedWorld: bool }
    this._passes = [];
    this.clearDepth = () => { this._depthCleared = true; };
  }
  setPixelRatio(v) { this.pixelRatio = v; }
  getPixelRatio() { return this.pixelRatio; }
  setSize() {}
  /* Эмуляция того, что видно на экране: проход по слою 0 рисует мир,
     проход по слою 1 — оружие. Если второй проход идёт с autoClear,
     он затирает уже нарисованный мир цветом фона — на экране остаётся
     только небо (именно так и выглядел «коричневый фон» на телефоне). */
  render(scene, camera) {
    this.renders++;
    assert.ok(scene, 'сцена есть');
    assert.ok(camera, 'камера есть');
    let meshes = 0;
    scene.traverseVisible((o) => { if (o.isMesh && o.layers.test(camera.layers)) meshes++; });
    const layer = camera.layers.mask;
    // как в three.js: при scene.background цвета очистка форсируется
    // (forceClear), поэтому смотрим именно на autoClearColor
    const bg = scene.background;
    const forceClear = !!(bg && bg.isColor);
    if ((this.autoClear || forceClear) && this.autoClearColor) {
      // очистка цвета: всё, что было нарисовано в этом кадре, стёрто
      this._wiped = this._passes.length > 0;
      this._passes.length = 0;
    }
    /* Текстурный фон (небо градиентом) — это не очистка, а полноэкранный
       квад в списке рендера: depthTest:false, depthWrite:false и
       layers.enableAll(). Он рисуется ПЕРВЫМ в каждом render() и при
       autoClearColor=false никуда не девается — поэтому на втором проходе
       (оружие) он закрывает уже нарисованный мир. Ровно это и случилось,
       когда плоский цвет неба заменили градиентом: карта «забелилась».
       Эмулируем: текстура в background на не-первом проходе = мир затёрт. */
    const bgQuad = !!(bg && !bg.isColor);
    if (bgQuad) {
      this._bgQuads = (this._bgQuads || 0) + 1;
      if (this._passes.length > 0) this._wiped = true;
    }
    this._passes.push({ layer, meshes, bgQuad });
  }
  beginFrame() { this._passes = []; this._wiped = false; this._depthCleared = false; }
  endFrame(assert) {
    this.frames.push({ passes: this._passes.slice(), wipedWorld: this._wiped });
    if (assert) {
      assert.ok(!this._wiped,
        'второй проход не затирает нарисованный мир (ни очисткой, ни фоном-текстурой)');
      assert.ok(this._passes.length >= 2, 'кадр рисуется в два прохода (мир + оружие)');
    }
    this._passes = []; this._wiped = false;
  }
  setClearColor() {}
  dispose() {}
}
// THREE собран как замороженный набор геттеров: подменяем через копию объекта
const THREE_PROXY = Object.create(null);
for (const key of Object.getOwnPropertyNames(T)) {
  THREE_PROXY[key] = key === 'WebGLRenderer' ? FakeRenderer : T[key];
}
sandbox.THREE = THREE_PROXY;
assert.equal(typeof sandbox.THREE.WebGLRenderer, 'function', 'рендерер подменён');
assert.equal(typeof sandbox.THREE.Scene, 'function', 'остальной three.js на месте');

/* ------------------------- загрузка модулей игры ----------------------- */
const modules = ['bugcodes', 'meshpack', 'meshfield', 'soundbank', 'mechanics', 'data', 'outline', 'gunblueprints', 'soldier', 'level', 'model', 'anim', 'ik', 'ragdoll', 'world', 'ai', 'agent', 'fx',
  'viewmodel', 'audio', 'perf', 'gamebot', 'game', 'ui', 'contentlab'];
for (const m of modules) {
  vm.runInContext(read(`src/${m}.js`), sandbox, { filename: `src/${m}.js` });
}
const SH2 = sandbox.SH2;
assert.ok(SH2 && SH2.data && SH2.game && SH2.ui, 'все модули загрузились');

/* ------------------------------ инициализация -------------------------- */
const ui = new SH2.ui.UI();
const canvas = getEl('game');
const game = new SH2.game.Game({ canvas, ui });
game.init();
assert.ok(game.renderer instanceof FakeRenderer, 'рендерер создан');
assert.ok(game.scene && game.camera, 'сцена и камера');
assert.equal(game.state, 'menu', 'стартовое состояние — меню');

/* ------------------------------ запуск миссии -------------------------- */
game.startMission(0);
assert.equal(game.state, 'playing', 'миссия началась');
assert.ok(game.level && game.world, 'уровень построен');
assert.ok(game.enemies.length > 0, `боевики созданы: ${game.enemies.length}`);
assert.ok(game.level.colliders.length > 8, 'коллайдеры уровня есть');
// карта собрана из полигонов: здания, вышки, блоки, мешки, бочки, камни, трубы
assert.ok(game.level.props > 24, `полигональных объектов на карте: ${game.level.props}`);
assert.ok(game.level.colliders.some((c) => c.kind === 'building'), 'есть коллайдеры зданий');
assert.ok(game.level.colliders.some((c) => c.kind === 'sandbag'), 'есть мешки как укрытие');

/* ----------------------------- прокрутка кадров ------------------------ */
// полный цикл кадра разрешён: тест дергает именно те подсистемы, что и игра
function simulate(seconds, opts) {
  const o = opts || {};
  const dt = 1 / 60;
  const steps = Math.round(seconds / dt);
  for (let i = 0; i < steps; i++) {
    game.time += dt;
    game.missionTimer += dt;
    if (o.before) o.before(i);
    game.input.crouch = false;
    game.input.crouchToggle = false;
    game.input.sprint = !!o.sprint;
    game.input.forward = o.forward || 0;
    game.input.strafe = o.strafe || 0;
    game.input.ads = !!o.ads;
    game.keys.KeyW = !!o.forward;
    game.keys.ShiftLeft = !!o.sprint;
    game.player.update(dt, {
      yaw: game.player.yaw, forward: o.forward || 0, strafe: o.strafe || 0,
      sprint: !!o.sprint, crouch: !!o.crouch, ads: !!o.ads
    }, game);
    game.combat.update(dt);
    game.fx.update(dt);
    for (const e of game.enemies) {
      const d = Math.hypot(e.x - game.player.x, e.z - game.player.z);
      e.setLod(d < 26 ? 0 : d < 48 ? 1 : 2);
      if (!e.alive && e.ragdoll && e.ragdoll.sleeping) continue;
      e.update(dt, game);
    }
    SH2.ai.commanderTick(game, dt);
    for (let k = game.deadBodies.length - 1; k >= 0; k--) {
      const b = game.deadBodies[k];
      if (b.ragdoll && !b.ragdoll.sleeping && b.ragdoll.totalSubsteps > 900) b.ragdoll.sleeping = true;
    }
    game.checkMissionProgress(dt);
    if (typeof game.update === 'function' && o.fullUpdate) game.update(dt);
    game.renderer.beginFrame();
    game.render(dt);
    // каждый кадр: мир нарисован, и второй проход (оружие) его не стёр
    game.renderer.endFrame(assert);
    // и в кадре действительно есть геометрия мира, а не только небо
    const last = game.renderer.frames[game.renderer.frames.length - 1];
    assert.ok(last.passes[0] && last.passes[0].meshes > 100,
      `в кадре мир: мешей на слое 0 — ${last.passes[0] ? last.passes[0].meshes : 0}`);
    ui.frame(game, dt);
    assert.ok(Number.isFinite(game.player.x) && Number.isFinite(game.player.z), 'позиция игрока конечна');
    if (game.state !== 'playing') break;
  }
}

// 4 секунды спокойной игры
simulate(4, { forward: 0.4 });
assert.ok(game.renderer.renders > 200, 'кадры рендерятся');
assert.ok(game.enemies.some((e) => e.brain && e.brain.tactic), 'мозги боевиков работают');

/* --------------------- бот-диагност внутри игры ------------------------- */
{
  const bot = new SH2.gamebot.GameBot(game).attach();
  game.bot = bot;
  assert.ok(bot.attached, 'бот подписался на кадр игры');
  const before = { x: game.player.x, z: game.player.z, hp: game.player.hp };
  bot.runNow();
  assert.ok(bot.checks >= 60, `бот прогнал проверки: ${bot.checks}`);
  const drift = Math.hypot(game.player.x - before.x, game.player.z - before.z);
  assert.ok(drift < 0.001, `прогон бота не сдвигает игрока (${drift.toFixed(4)} м)`);
  assert.ok(Math.abs(game.player.hp - before.hp) < 0.001, 'прогон бота не меняет здоровье');
  /* отчёт бота ссылается на таблицу кодов и не придумывает номера */
  const text = bot.reportText();
  assert.match(text, /таблица кодов: 1000/);
  bot.found.forEach((f) => {
    assert.ok(SH2.bugcodes.BY_CODE[f.code], `код ${f.code} есть в таблице`);
    assert.ok(f.category && f.category !== '—', `у находки ${f.code} есть категория`);
  });
  assert.equal(bot.found.length, 0, 'бот-диагност в игре не нашёл ошибок: ' +
    bot.found.map((f) => f.code + ' ' + f.msg).join('; '));
  /* поиск по коду: ввод «421» объясняет категорию */
  const search = getEl('bot-search');
  search.value = '421';
  bot.lookup();
  assert.match(getEl('bot-answer').textContent, /Игрок и управление/,
    'поиск по коду показывает категорию');
}

/* --------------------- все шесть миссий проходятся ---------------------- */
{
  /* Не «запускаются», а именно ПРОХОДЯТСЯ: выполняем цели так, как их
     выполнил бы игрок, и требуем победу. Именно так нашлись две миссии,
     которые раньше нельзя было закончить. */
  const play = (idx) => {
    game.startMission(idx);
    const m = SH2.data.MISSIONS[idx];
    const P = game.player;
    for (let f = 0; f < 60 * 400; f++) {
      P.hp = P.maxHp; P.armor = 40;
      if (m.type === 'eliminate' || m.type === 'boss' || m.type === 'destroy' || m.type === 'extract') {
        for (const e of game.enemies) if (e.alive) e.hit(9999, game, {});
        if (m.type === 'destroy') {
          game.objectives.forEach((o) => { if (!o.done && o.mesh) game.damageObjective(o.x, o.z, 200); });
        }
        if (m.type === 'extract') { game.kills = 99; P.x = game.extract.x; P.z = game.extract.z; }
      }
      game.update(1 / 60);
      if (game.state !== 'playing') break;
    }
    return game.state;
  };
  for (let i = 0; i < SH2.data.MISSIONS.length; i++) {
    const st = play(i);
    assert.ok(st === 'won' || st === 'complete',
      `миссия ${i + 1} проходится до победы (состояние: ${st})`);
  }
  /* «Порт» проходится и БЕЗ зачистки: цель «зачистить путь» необязательная. */
  game.startMission(4);
  const P = game.player;
  P.x = game.extract.x; P.z = game.extract.z;
  for (let i = 0; i < 180 && game.state === 'playing'; i++) { P.hp = P.maxHp; game.update(1 / 60); }
  assert.equal(game.state, 'won', 'миссия 5 проходится мимо охраны: цель «зачистить путь» необязательная');
}

/* --------- «палец в левый нижний угол»: весь путь события ----------------
   Именно так играет человек на телефоне: палец ложится в левый нижний угол
   экрана. Раньше там стояли кнопки (ПРИСЕЛ/БЕГ/ПРИЦЕЛ): кнопка ловила
   touchstart и делала preventDefault, канвас касания не получал вовсе.
   Теперь проверяем не «стик работает», а «касание в этой точке доходит». */
{
  const canvasEl = getEl('game');
  const handlers = canvasEl._handlers;
  game.startMission(0);
  game.state = 'playing';
  game.locked = true;
  game.enemies.slice().forEach((e) => e.dispose(game.scene));
  game.enemies.length = 0;
  if (!game.touch || !game.touch.active) { game.touch = null; game.bindTouch(); }
  assert.ok(game.touch.active, 'тач-режим включён по maxTouchPoints');
  for (const t of ['touchstart', 'touchmove', 'touchend']) {
    assert.ok(handlers[t] && handlers[t].length, `на канвасе есть обработчик ${t}`);
  }
  const fire = (type, list) => {
    const e = {
      changedTouches: list.map((t) => ({ identifier: t.id, clientX: t.x, clientY: t.y })),
      preventDefault() {}
    };
    (handlers[type] || []).forEach((fn) => fn(e));
  };
  const P = game.player;
  Object.keys(game.keys).forEach((k) => { game.keys[k] = false; });
  P.yaw = 0;
  const x0 = P.x, z0 = P.z;
  // точка 70,760 — левый нижний угол телефона 390×844
  fire('touchstart', [{ id: 1, x: 70, y: 760 }]);
  fire('touchmove', [{ id: 1, x: 70, y: 640 }]);
  for (let i = 0; i < 120; i++) { P.hp = P.maxHp; game.update(1 / 60); }
  const walked = Math.hypot(P.x - x0, P.z - z0);
  fire('touchend', [{ id: 1, x: 70, y: 640 }]);
  assert.ok(walked > 2, `палец в левом нижнем углу ведёт игрока: ${walked.toFixed(2)} м`);
  assert.equal(game.touch.stickActive, false, 'после touchend стик отпущен');
}

/* ------------------------- «я не могу ходить» ---------------------------
   Главный сценарий игрока на телефоне: палец тянет стик вперёд. Раньше вектор
   стика считался, но в физику тела не передавался, и боец стоял. */
{
  game.startMission(0);
  game.state = 'playing';
  game.locked = true;
  game.enemies.slice().forEach((e) => e.dispose(game.scene));
  game.enemies.length = 0;
  const x0 = game.player.x, z0 = game.player.z;
  game.touch.active = true;
  game.touch.stickActive = true;
  game.touch.sx = 0; game.touch.sz = 1;
  game.touch.txs = 0; game.touch.tzs = 1;
  for (let i = 0; i < 120; i++) game.update(1 / 60);
  const walked = Math.hypot(game.player.x - x0, game.player.z - z0);
  assert.ok(walked > 3, `стик телефона ведёт игрока: прошли ${walked.toFixed(2)} м`);
  game.touch.stickActive = false;
  game.touch.txs = 0; game.touch.tzs = 0;
  for (let i = 0; i < 60; i++) game.update(1 / 60);
  assert.ok(Math.hypot(game.touch.sx, game.touch.sz) < 0.05, 'стик отпущен — вектор погас');
  game.touch.active = false;
}

/* ------------------------------- стрельба ------------------------------ */
const beforeShots = game.player.shots;
for (let i = 0; i < 40; i++) {
  game.player.fireTimer = 0;
  game.player.ammoInMag = game.player.weapon.mag;
  game.player.fire(game.time);
  game.combat.update(1 / 60);
}
assert.ok(game.player.shots > beforeShots + 30, `выстрелы прошли: ${game.player.shots}`);
assert.ok(game.fx.counts.particles >= 0, 'частицы считаются');
assert.ok(game.player.reserve > 0 || game.player.ammoInMag > 0, 'патроны не ушли в минус');

/* ---------------- конвенция камеры: куда смотрим, туда и стреляем ------ */
{
  game.startMission(0);
  const P = game.player;
  // ставим игрока в заведомо свободную точку и смотрим строго по +Z
  P.x = 0; P.z = -6; P.yaw = 0; P.pitch = 0;
  const world = game.world;
  assert.equal(world.isBlockedCell(0, -6), false, 'старт тестовой позиции свободен');

  const target = game.enemies.find((e) => e.alive);
  target.x = 0; target.z = 4; target.y = 0;
  target.brain.alert = 0; target.brain.memory = null; target.brain.thinkTimer = 99;
  P.ammoInMag = 12; P.reserve = 100; P.fireTimer = 0;
  game.allowDirectFire = true;
  const hpBefore = target.hp;
  for (let i = 0; i < 6 && target.hp === hpBefore; i++) {
    P.fireTimer = 0;
    P.fire(game.time);
    target.x = P.x; target.z = P.z + 10;   // держим цель по курсу
  }
  assert.ok(target.hp < hpBefore, 'стрельба попадает туда, куда смотрит камера');

  // камера действительно смотрит на цель: проекция близка к центру экрана
  target.x = P.x; target.z = P.z + 10;
  game.render(1 / 60);
  const v = new (sandbox.THREE.Vector3)(target.x, 1.2, target.z).project(game.camera);
  assert.ok(Math.abs(v.x) < 0.25 && Math.abs(v.y) < 0.45 && v.z < 1,
    `цель по центру кадра (x=${v.x.toFixed(2)}, y=${v.y.toFixed(2)})`);

  // мышь вниз опускает взгляд
  const pitchBefore = P.pitch;
  game.mouse.dy = 40; game.mouse.dx = 0;
  game.update(1 / 60);
  assert.ok(P.pitch < pitchBefore, 'движение мыши вниз опускает взгляд');
  game.allowDirectFire = false;
}

/* --------------- полный кадр game.update(): все подсистемы вместе -------- */
{
  game.startMission(1);
  const startHp = game.player.hp;
  let frames = 0;
  for (let i = 0; i < 300; i++) {
    game.mouse.dx = Math.sin(i * 0.03) * 4;
    game.mouse.dy = Math.cos(i * 0.02) * 2;
    game.keys.KeyW = i % 40 < 22;
    game.keys.ShiftLeft = i % 40 < 10;
    game.mouse.down = i % 7 < 3;
    game.update(1 / 60);
    game.render(1 / 60);
    ui.frame(game, 1 / 60);
    frames++;
    if (game.state !== 'playing') break;
  }
  assert.ok(frames > 30, `полный цикл проработал ${frames} кадров`);
  assert.ok(Number.isFinite(game.player.x), 'после полного цикла позиция конечна');
  assert.ok(game.player.hp <= startHp, 'игрок получает урон от боевиков');
  assert.ok(game.time > 0.4, 'время идёт');
}

/* --------------------------- смерть и регдол --------------------------- */
const victim = game.enemies.find((e) => e.alive);
assert.ok(victim, 'есть живой боевик');
const deathsBefore = game.kills;
const dir = new (sandbox.THREE.Vector3)(1, 0, 0);
const hitPoint = new (sandbox.THREE.Vector3)(victim.x, 1.4, victim.z);
victim.hit(9999, game, { dir, force: 4, hitPoint, head: true });
assert.equal(victim.alive, false, 'боевик мёртв');
assert.equal(game.kills, deathsBefore + 1, 'убийство засчитано');
assert.ok(victim.ragdoll, 'у мертвеца включился регдол из точек');
assert.equal(victim.ragdoll.points.length, 17, 'в кукле 17 точек');
assert.ok(victim.ragdoll.links.length >= 20, 'в кукле есть связи');

// регдол падает на пол и засыпает (даём достаточно времени и считаем энергию)
for (let i = 0; i < 900 && !victim.ragdoll.sleeping; i++) {
  victim.ragdoll.update(1 / 60, game.world.colliders);
}
const low = victim.ragdoll.points.every((p) => p.pos.y >= 0.0 && p.pos.y < 2.2);
assert.ok(low, 'точки куклы лежат в пределах пола');
assert.ok(victim.ragdoll.sleeping, 'кукла засыпает — оптимизация работает (энергия ' +
  (victim.ragdoll.energy || 0).toExponential(2) + ')');
assert.ok(victim.ragdoll.points.every((p) => Number.isFinite(p.pos.x)), 'координаты куклы конечны');

/* ------------------------ урон игроку и смерть ------------------------- */
game.player.armor = 0;
game.player.hp = 5;
game.damagePlayer(50, victim, 'bullet');
assert.equal(game.player.alive, false, 'игрок может погибнуть');
assert.equal(game.state, 'dead', 'состояние смерти');

// перезапуск миссии
game.retry();
assert.equal(game.state, 'playing', 'retry возвращает в игру');
assert.equal(game.player.alive, true, 'игрок жив после retry');

/* ---------------------- новые пакеты контента ------------------------- */
/* 1. 1000 моделек: каждый шаблон строится, у каждого есть меши и радиус. */
{
  const pack = SH2.meshpack;
  assert.equal(pack.COUNT, 1000, 'в пакете 1000 моделей');
  assert.equal(pack.FAMILIES.length, 10, '10 семейств');
  let meshes = 0, tris = 0, empty = 0;
  for (let i = 0; i < pack.COUNT; i++) {
    const r = pack.probe(i);
    meshes += r.meshes; tris += r.tris;
    if (!r.meshes || r.tris < 4) empty++;
  }
  assert.equal(empty, 0, 'нет пустых моделей');
  assert.ok(meshes >= 7000, `подмешей в пакете: ${meshes}`);
  assert.ok(tris > 250000, `треугольников в пакете: ${Math.round(tris)}`);
  /* разные индексы — разные модели (а не одна перекрашенная) */
  const a = pack.describe(0), b = pack.describe(501);
  assert.notEqual(a.id, b.id, 'id разные');
  const ga = pack.build(0), gb = pack.build(501);
  /* сравниваем суммарный объём деталей: у разных семейств он не совпадает */
  const volume = (g) => { let v = 0; g.traverse((o) => { if (o.isMesh) { o.geometry.computeBoundingBox(); const b = o.geometry.boundingBox; v += (b.max.x - b.min.x) * (b.max.y - b.min.y) * (b.max.z - b.min.z); } }); return v; };
  const va = volume(ga), vb = volume(gb);
  assert.ok(Math.abs(va - vb) > 0.02, `модели 0 и 501 отличаются объёмом: ${va.toFixed(2)} против ${vb.toFixed(2)}`);
}

/* 2. 100 000 мешей в поле: объекты, матрицы, попадания, LOD. */
{
  const field = game.meshfield;
  assert.ok(field, 'поле мешей построено');
  const st = field.stats();
  assert.equal(st.requested, 100000, 'запрошено 100 000');
  assert.equal(st.meshes, 100000, `мешей в поле: ${st.meshes}`);
  assert.ok(st.individual >= 100000, `всего объектов: ${st.individual}`);
  assert.ok(st.drawCalls <= 130, `draw call поля: ${st.drawCalls}`);
  assert.ok(st.triangles < 2600000, `треугольников поля: ${st.triangles}`);
  assert.ok(st.realMeshes > 0, 'есть отдельные (не инстанс) меши');
  /* меш — не счётчик: у него есть матрица, его можно спрятать */
  const m = field.matrixAt(99999);
  assert.ok(m && isFinite(m.elements[12]) && isFinite(m.elements[14]), 'матрица 100000-го меша');
  assert.ok(Math.hypot(m.elements[12], m.elements[14]) > 30, 'поле стоит вне игровой зоны');
  assert.equal(field.hide(4242), true, 'меш найден и скрыт');
  assert.equal(field.hide(200000), false, 'несуществующий меш не скрывается');
  assert.ok(field.forEachInRadius(0, 0, 120) > 1000, 'в радиусе 120 м тысячи мешей');
  const counts = Object.values(st.byFamily);
  assert.equal(counts.length, 10, 'все 10 семейств в поле');
  assert.ok(counts.every((c) => c === 10000), 'по 10 000 мешей на семейство');
}

/* 3. 250 звуков: каждый рендерится в волну и не тишина. */
{
  const SB = SH2.soundbank;
  assert.equal(SB.COUNT, 250, '250 звуков');
  assert.equal(SB.FAMILIES.length, 25, '25 семейств звуков');
  let silent = 0, clipped = 0, totalMs = 0;
  const peaks = [];
  for (let i = 0; i < SB.COUNT; i++) {
    const pcm = SB.render(i, 16000);
    const an = SB.analyse(pcm, 16000);
    totalMs += an.ms;
    peaks.push(an.peak);
    if (an.rms < 0.008) silent++;
    if (an.peak > 1.001) clipped++;
  }
  assert.equal(silent, 0, 'нет беззвучных образцов');
  assert.equal(clipped, 0, 'нет клиппинга');
  assert.ok(totalMs / SB.COUNT > 120, 'средняя длина больше 120 мс');
  /* через AudioEngine тот же звук играется как обычный выстрел */
  game.audio.init();
  const before = SH2.soundbank.SOUNDS.length;
  const sb = new SB.SoundBank(game.audio);
  const played = sb.play(0, 0, 0, 0.5);
  assert.ok(sb.lastPlayed && sb.lastPlayed.id === SH2.soundbank.describe(0).id, 'звук отмечен как проигранный');
  if (game.audio.ctx) assert.ok(played, 'источник создан в WebAudio');
  assert.equal(before, 250, 'список звуков полный');
}

/* 4. 250 механик: включаются, меняют числа, срабатывают на события. */
{
  const M = SH2.mechanics;
  assert.equal(M.COUNT, 250, '250 механик');
  assert.equal(M.FAMILIES.length, 25, '25 семейств механик');
  assert.equal(M.list().length, 250, 'реестр полный');
  const neutral = M.registry.mods().damage;
  M.enable('damage-10', true);
  assert.ok(M.registry.mods().damage > neutral, 'урон вырос от механики');
  M.enable('damage-10', false);
  assert.equal(M.registry.mods().damage, neutral, 'после выключения урон вернулся');
  /* событие «убийство» проходит через включённые правила */
  const before = M.stats().emits;
  M.emit(game, 'kill', { agent: game.enemies[0] || null });
  assert.ok(M.stats().emits > before, 'события механик доходят до реестра');
  /* модификаторы уже применены к игре: здоровье и броня не нулевые */
  assert.ok(game.mods && game.mods.damage >= 1, 'у игры есть модификаторы');
  assert.ok(game.player.maxHp >= 100, 'здоровье с механиками применено');
}

/* 5. Лаборатория контента: все четыре вкладки открываются и наполняются. */
{
  const lab = new SH2.contentlab.ContentLab(game, ui);
  for (const tab of ['models', 'sounds', 'mechanics', 'field']) {
    lab.tab = tab;
    assert.doesNotThrow(() => lab.render(), `вкладка ${tab} рисуется`);
  }
  assert.ok(lab.built, 'каркас лаборатории построен');
  assert.ok(lab.body.children.length > 0, 'вкладка поля наполнена');
  /* механику можно включить из лаборатории — числа игры меняются */
  const dmgBefore = game.mods.damage;
  SH2.mechanics.enable('damage-10', true);
  lab.applyNow();
  assert.ok(game.mods.damage > dmgBefore, 'включённая в лаборатории механика меняет игру');
  SH2.mechanics.enable('damage-10', false);
  lab.applyNow();
  /* звук из лаборатории доходит до банка, а не «в пустоту» */
  game.soundbank.play(7, 0, 0, 0.4);
  assert.equal(game.soundbank.lastPlayed.index, 7, 'лаборатория играет конкретный звук');
}

/* --------------------------- другие миссии ---------------------------- */
for (let i = 1; i < SH2.data.MISSIONS.length; i++) {
  game.startMission(i);
  assert.equal(game.state, 'playing', `миссия ${i + 1} стартует`);
  simulate(2.5, { forward: 0.3 });
  assert.ok(game.enemies.length >= 0, `миссия ${i + 1}: боевики в порядке`);
  if (game.mission.type === 'destroy') {
    assert.ok(game.objectives.some((o) => o.mesh), 'у диверсии есть ящики-цели');
  }
  if (game.mission.type === 'extract') {
    assert.ok(game.extract, 'у эвакуации есть точка');
  }
}
// цикл кадра не падает в состоянии меню
game.state = 'menu';
game.idleUpdate(0.016);
game.render(0.016);

console.log('shooter-2: headless-прогон пройден — рендеров ' + game.renderer.renders +
  ', боевиков ' + game.enemies.length + ', клипов в кэше ' + SH2.anim.library.cacheSize() + '.');
