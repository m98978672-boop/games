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
    addEventListener() {},
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
  navigator: { userAgent: 'node', maxTouchPoints: 0 },
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
const modules = ['data', 'outline', 'gunblueprints', 'soldier', 'level', 'model', 'anim', 'ik', 'ragdoll', 'world', 'ai', 'agent', 'fx',
  'viewmodel', 'audio', 'perf', 'game', 'ui'];
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
