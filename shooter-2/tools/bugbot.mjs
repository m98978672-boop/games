/* =============================================================================
   tools/bugbot.mjs — бот-искатель багов для СЕКТОРА «ПЕПЕЛ»
   -----------------------------------------------------------------------------
   Что делает бот:
     1. Читает таблицу кодов (src/bugcodes.js): 000–999, у каждого кода своя
        категория и название проверки.
     2. Поднимает настоящую игру в vm-песочнице (как tests/headless.mjs):
        three.js, все модули, фейковый WebGL ровно в одном месте.
     3. Гоняет детекторы по реальным подсистемам: файлы, данные, карты,
        коллизии, кадр в два прохода, игрок, бой, ИИ, анимация, UI, рестарт.
     4. Добавляет «обезьяньи» прогоны: случайные миссии, случайный ввод,
        большие/нулевые dt, стрельба во все стороны — то, что руками не
        проверишь.
     5. Пишет отчёт: консоль + docs/bugbot-report.md, выходит с кодом 1,
        если найдено хоть что-то уровня error.

   Запуск:
     node tools/bugbot.mjs                # полный прогон
     node tools/bugbot.mjs --seed 42      # воспроизводимый «обезьяний» прогон
     node tools/bugbot.mjs --only 3xx     # только категория рендера
     node tools/bugbot.mjs --list         # напечатать таблицу кодов
     node tools/bugbot.mjs --json out.json
   ============================================================================= */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(root, p));
const argv = process.argv.slice(2);
const flag = (n) => argv.indexOf(n) >= 0;
const opt = (n, d) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : d; };

/* =============================== DOM-заглушка ============================ */
function fake2d() {
  const grad = { addColorStop() {} };
  const noop = () => {};
  return {
    fillStyle: '', strokeStyle: '', globalAlpha: 1, lineWidth: 1, font: '',
    globalCompositeOperation: '', textAlign: '', textBaseline: '',
    fillRect: noop, strokeRect: noop, clearRect: noop, setLineDash: noop,
    beginPath: noop, closePath: noop, arc: noop, ellipse: noop, fill: noop,
    stroke: noop, moveTo: noop, lineTo: noop, rect: noop, roundRect: noop, quadTo: noop,
    save: noop, restore: noop, translate: noop, rotate: noop, scale: noop,
    fillText: noop, strokeText: noop, drawImage: noop, putImageData: noop, measureText: () => ({ width: 10 }),
    createRadialGradient: () => grad, createLinearGradient: () => grad, createPattern: () => null
  };
}
function fakeElement(tag) {
  const el = {
    tagName: (tag || 'div').toUpperCase(), id: '', className: '', textContent: '', innerHTML: '', value: '',
    style: { _p: {}, setProperty(k, v) { this._p[k] = v; }, getPropertyValue(k) { return this._p[k] || ''; } },
    dataset: {}, children: [], parentNode: null, checked: false, disabled: false,
    classList: {
      _s: new Set(),
      add(...c) { c.forEach((x) => this._s.add(x)); },
      remove(...c) { c.forEach((x) => this._s.delete(x)); },
      toggle(c, on) { if (on === undefined) { this._s.has(c) ? this._s.delete(c) : this._s.add(c); } else if (on) this._s.add(c); else this._s.delete(c); },
      contains(c) { return this._s.has(c); }
    },
    appendChild(c) { c.parentNode = this; this.children.push(c); return c; },
    removeChild(c) { this.children = this.children.filter((x) => x !== c); return c; },
    insertBefore(c) { return this.appendChild(c); },
    _handlers: {},
    addEventListener(t, fn) { (this._handlers[t] = this._handlers[t] || []).push(fn); },
    removeEventListener() {}, dispatchEvent() { return true; },
    setAttribute() {}, getAttribute() { return null; }, removeAttribute() {},
    querySelector() { return null; }, querySelectorAll() { return []; },
    focus() {}, blur() {}, click() {},
    getBoundingClientRect() { return { left: 0, top: 0, width: 800, height: 600, right: 800, bottom: 600 }; },
    requestPointerLock() {}, closest() { return null; },
    width: 800, height: 600, clientWidth: 800, clientHeight: 600,
    getContext() { return fake2d(); }, toDataURL() { return 'data:,'; }
  };
  Object.defineProperty(el, 'firstChild', { get: () => el.children[0] || null });
  Object.defineProperty(el, 'lastChild', { get: () => el.children[el.children.length - 1] || null });
  return el;
}
const elementCache = new Map();
const getEl = (id) => {
  if (!elementCache.has(id)) { const e = fakeElement('div'); e.id = id; elementCache.set(id, e); }
  return elementCache.get(id);
};
const documentStub = {
  getElementById: getEl, createElement: (t) => fakeElement(t),
  querySelector() { return null; }, querySelectorAll() { return []; },
  addEventListener() {}, removeEventListener() {}, exitPointerLock() {},
  pointerLockElement: null, hidden: false, body: fakeElement('body'),
  documentElement: fakeElement('html')
};

/* =============================== песочница =============================== */
const sandbox = {
  console, Math, JSON, Map, Set, WeakMap, WeakSet, Array, Object, Number, String, Boolean, Date, Error, Promise,
  RegExp, Function, Symbol, Proxy, Reflect, TypeError, RangeError,
  isFinite, isNaN, parseFloat, parseInt, Float32Array, Uint16Array, Uint32Array, Int32Array, Uint8Array, Uint8ClampedArray,
  Infinity, NaN,
  setTimeout: () => 0, clearTimeout() {}, setInterval: () => 0, clearInterval() {},
  performance: { now: () => Date.now() },
  requestAnimationFrame: () => 1, cancelAnimationFrame() {},
  document: documentStub,
  navigator: { userAgent: 'bugbot', maxTouchPoints: 5, language: 'ru' },
  location: { href: 'http://localhost/shooter-2/', protocol: 'http:' },
  devicePixelRatio: 1, innerWidth: 1280, innerHeight: 720,
  addEventListener() {}, removeEventListener() {},
  matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }),
  localStorage: { _d: {}, getItem(k) { return this._d[k] === undefined ? null : this._d[k]; }, setItem(k, v) { this._d[k] = String(v); }, removeItem(k) { delete this._d[k]; } },
  THREE: undefined
};
sandbox.globalThis = sandbox;
sandbox.window = sandbox;
sandbox.self = sandbox;
vm.createContext(sandbox);
vm.runInContext(read('three.min.js'), sandbox, { filename: 'three.min.js' });
const T = sandbox.THREE;

/* Фейковый рендерер: единственное место, где эмулируется кадр.
   Важная часть — фон. Цвет фона = очистка (autoClearColor), текстура =
   полноэкранный квад в списке рендера: на втором проходе он закрывает мир. */
class FakeRenderer {
  constructor() {
    this.shadowMap = { enabled: false, type: 0 };
    this.info = { render: { calls: 42, triangles: 12345 }, memory: { geometries: 12, textures: 3 }, programs: [] };
    this.pixelRatio = 1; this.renders = 0;
    this.outputColorSpace = ''; this.toneMapping = 0; this.toneMappingExposure = 1;
    this.autoClear = true; this.autoClearColor = true; this.autoClearDepth = true; this.autoClearStencil = true;
    this.frames = []; this._passes = []; this._depthCleared = false;
    this.clearDepth = () => { this._depthCleared = true; };
  }
  setPixelRatio(v) { this.pixelRatio = v; }
  getPixelRatio() { return this.pixelRatio; }
  setSize() {}
  setClearColor() {}
  dispose() {}
  render(scene, camera) {
    this.renders++;
    let meshes = 0;
    scene.traverseVisible((o) => { if (o.isMesh && o.layers.test(camera.layers)) meshes++; });
    const bg = scene.background;
    const forceClear = !!(bg && bg.isColor);
    if ((this.autoClear || forceClear) && this.autoClearColor) {
      this._wiped = this._passes.length > 0;
      this._wipedBy = forceClear ? 'forceClear(цвет фона)' : 'autoClear';
      this._passes.length = 0;
    }
    const bgQuad = !!(bg && !bg.isColor);
    if (bgQuad) {
      this._bgQuads = (this._bgQuads || 0) + 1;
      if (this._passes.length > 0) { this._wiped = true; this._wipedBy = 'фон-текстура'; }
    }
    this._passes.push({ layer: camera.layers.mask, meshes, bgQuad });
  }
  beginFrame() { this._passes = []; this._wiped = false; this._wipedBy = ''; this._depthCleared = false; this._bgQuads = 0; }
  endFrame() {
    const f = { passes: this._passes.slice(), wipedWorld: this._wiped, wipedBy: this._wipedBy, bgQuads: this._bgQuads || 0, depthCleared: this._depthCleared };
    this.frames.push(f);
    this._passes = []; this._wiped = false; this._wipedBy = ''; this._bgQuads = 0; this._depthCleared = false;
    return f;
  }
}
const THREE_PROXY = Object.create(null);
for (const key of Object.getOwnPropertyNames(T)) THREE_PROXY[key] = key === 'WebGLRenderer' ? FakeRenderer : T[key];
sandbox.THREE = THREE_PROXY;

/* ============================ загрузка модулей =========================== */
const MODULES = ['bugcodes', 'meshpack', 'meshfield', 'soundbank', 'mechanics', 'data', 'outline', 'gunblueprints', 'soldier', 'level', 'model', 'anim', 'ik',
  'ragdoll', 'world', 'ai', 'agent', 'fx', 'viewmodel', 'audio', 'perf', 'gamebot', 'game', 'ui', 'contentlab'];
const bootErrors = [];
for (const m of MODULES) {
  try { vm.runInContext(read(`src/${m}.js`), sandbox, { filename: `src/${m}.js` }); }
  catch (e) { bootErrors.push({ file: m, error: e }); }
}
const SH2 = sandbox.SH2;
const BC = SH2.bugcodes;
const D = SH2.data;

if (flag('--list')) {
  console.log('#  категория                                 проверка');
  BC.CODES.forEach((c) => console.log(c.id + '  ' + c.category.padEnd(40) + c.title));
  process.exit(0);
}

/* ============================== каркас отчёта =========================== */
const findings = [];     // { code, level, message, detail }
const checks = [];       // { code, ok }
let currentCode = null;

function emit(code, ok, message, detail) {
  checks.push({ code, ok });
  if (!ok) {
    findings.push({
      code, level: 'error',
      category: BC.category(code), title: BC.title(code),
      message: message || BC.title(code), detail: detail || ''
    });
  }
  return ok;
}
function warn(code, message, detail) {
  findings.push({
    code, level: 'warning', category: BC.category(code), title: BC.title(code),
    message: message || BC.title(code), detail: detail || ''
  });
}
function info(code, message, detail) {
  findings.push({ code, level: 'info', category: BC.category(code), title: BC.title(code), message, detail: detail || '' });
}
/* Регистрирует детектор под кодом таблицы. Возвращает обёртку. */
function det(code, fn) {
  BC.bind(code, fn);
  return code;
}
const safe = async (code, fn) => {
  try { return await fn(); }
  catch (e) {
    emit(code, false, 'исключение в проверке: ' + (e && e.message), String((e && e.stack || '').split('\n')[1] || ''));
    return false;
  }
};

/* ================================ ЗАПУСК ИГРЫ =========================== */
let game = null, ui = null, booted = false;
function bootGame() {
  ui = new SH2.ui.UI();
  game = new SH2.game.Game({ canvas: getEl('game'), ui, difficulty: 1 });
  game.init();
  booted = true;
  return game;
}
/* Симуляция кадра: ровно то, что делает loop() у игры, но без rAF. */
function simulate(g, seconds, o) {
  const opt2 = o || {};
  const dt = opt2.dt || 1 / 60;
  const steps = Math.max(1, Math.round(seconds / dt));
  const wrongTurns = [];
  const wiped = [];
  for (let i = 0; i < steps; i++) {
    g.time += dt;
    g.missionTimer += dt;
    if (opt2.before) opt2.before(i);
    g.input.crouch = !!opt2.crouch;
    g.input.sprint = !!opt2.sprint;
    g.input.forward = opt2.forward || 0;
    g.input.strafe = opt2.strafe || 0;
    g.keys.KeyW = !!opt2.forward;
    g.keys.ShiftLeft = !!opt2.sprint;
    const yaw0 = g.player.yaw;
    g.player.update(dt, { yaw: yaw0, forward: opt2.forward || 0, strafe: opt2.strafe || 0, sprint: !!opt2.sprint, crouch: !!opt2.crouch, ads: !!opt2.ads }, g);
    if (opt2.faceYaw !== undefined) g.player.yaw = opt2.faceYaw;
    g.combat.update(dt);
    g.fx.update(dt);
    for (const e of g.enemies) {
      const d = Math.hypot(e.x - g.player.x, e.z - g.player.z);
      e.setLod(d < 26 ? 0 : d < 48 ? 1 : 2);
      if (!e.alive && e.ragdoll && e.ragdoll.sleeping) continue;
      e.update(dt, g);
    }
    SH2.ai.commanderTick(g, dt);
    g.checkMissionProgress(dt);
    if (opt2.fullUpdate && typeof g.update === 'function') g.update(dt);
    g.renderer.beginFrame();
    g.render(dt);
    const frame = g.renderer.endFrame();
    if (frame.wipedWorld) wiped.push({ i, by: frame.wipedBy });
    ui.frame(g, dt);
    if (g.state !== 'playing') break;
    if (opt2.faceYaw !== undefined && g.player.yaw !== opt2.faceYaw) wrongTurns.push(i);
  }
  return { steps, wiped, wrongTurns };
}

const results = { started: 0, checks: 0, errors: 0, warnings: 0, codes: 0 };

/* =============================== 0xx: ФАЙЛЫ ============================= */
const modFiles = MODULES.map((m) => `src/${m}.js`);
det(0, () => {
  const missing = modFiles.filter((f) => !exists(f));
  ['index.html', 'style.css', 'three.min.js', 'README.md', 'cover.svg'].forEach((f) => { if (!exists(f)) missing.push(f); });
  return { missing };
});
det(1, () => {
  const bad = [];
  for (const f of modFiles) {
    try { new Function(read(f)); } catch (e) { bad.push(f + ': ' + e.message); }
  }
  return { bad };
});
det(2, () => {
  const html = read('index.html');
  return { missing: MODULES.filter((m) => !html.includes(`src="src/${m}.js"`) && !html.includes(`src="src/${m}.js"`)).filter((m) => m !== 'bugcodes' && !html.includes(m + '.js')) };
});
det(3, () => ({ okHtml: read('index.html').includes('href="style.css"') }));
det(4, () => {
  const html = read('index.html');
  const stripped = html.replace(/https:\/\/github\.com[^\s"']*/g, '').replace(/https:\/\/m98978672-boop\.github\.io[^\s"']*/g, '');
  return { external: /https?:\/\//.test(stripped) };
});
det(5, () => ({ local: exists('three.min.js') && fs.statSync(path.join(root, 'three.min.js')).size > 500000 }));
det(6, () => {
  const hits = [];
  for (const f of modFiles) {
    if (f === 'src/bugcodes.js') continue;      // это код самой проверки
    read(f).split('\n').forEach((line, i) => {
      if (/console\.(log|debug|warn)\(/.test(line) && !/^\s*\/[/*]/.test(line)) hits.push(`${f}:${i + 1}`);
    });
  }
  return { hits };
});
det(7, () => {
  /* Слово-триггер ищем только в комментариях кода игры. Сам чекер и бот
     упоминают его по делу — их пропускаем, иначе проверка ловит себя. */
  const hits = [];
  for (const f of modFiles) {
    if (f === 'src/bugcodes.js') continue;
    read(f).split('\n').forEach((line, i) => {
      if (!/^\s*(\/\/|\/\*|\*)/.test(line)) return;
      if (/\b(TODO|FIXME|XXX)\b/.test(line) && !/TODO\/FIXME/.test(line)) hits.push(`${f}:${i + 1}`);
    });
  }
  return { hits };
});
det(8, () => {
  /* Дубль объявления в ОДНОМ блоке — это уже ломало сборку
     (Identifier 'pack' has already been declared). Поэтому идём по тексту,
     ведём стек областей по фигурным скобкам и ищем повтор имени в той же
     области: в разных функциях `const T = THREE()` — норма, в одной — баг. */
  const dups = [];
  for (const f of modFiles) {
    const src = read(f).replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
      .replace(/(^|[^:])\/\/.*$/gm, '$1');
    const stack = [new Map()];
    let i = 0;
    while (i < src.length) {
      const ch = src[i];
      if (ch === '{') { stack.push(new Map()); i++; continue; }
      if (ch === '}') { if (stack.length > 1) stack.pop(); i++; continue; }
      /* `for (let i = ...)` — это заголовок цикла, его инициализация живёт в
         своей области на каждой итерации, дублем не является. */
      const before = src.slice(Math.max(0, i - 12), i);
      const inForHeader = /(for|while)\s*\($/.test(before.replace(/\s+$/, '')) || /for\s*\($/.test(before.trim());
      const m = /^(const|let)\s+([A-Za-z_$][\w$]*)\s*=/.exec(src.slice(i, i + 120));
      if (m && !inForHeader && (i === 0 || /[\s;{}(]/.test(src[i - 1]))) {
        const name = m[2];
        const scope = stack[stack.length - 1];
        if (scope.has(name)) dups.push(`${f}: ${name} (строка ${src.slice(0, i).split('\n').length})`);
        else scope.set(name, true);
        i += m[0].length;
        continue;
      }
      i++;
    }
  }
  return { dups: [...new Set(dups)] };
});
det(9, () => {
  const html = read('index.html');
  const order = [];
  const re = /src="src\/([a-z0-9_-]+)\.js"/g;
  let m;
  while ((m = re.exec(html))) order.push(m[1]);
  const required = ['data', 'outline', 'model', 'anim', 'ai', 'agent', 'fx', 'viewmodel', 'game', 'ui'];
  const idx = (n) => order.indexOf(n);
  const broken = [];
  required.forEach((n) => { if (idx(n) < 0) broken.push(n + ': не подключён'); });
  if (idx('outline') > idx('model')) broken.push('outline должен идти до model');
  if (idx('data') > idx('model')) broken.push('data должен идти до model');
  if (idx('game') > idx('ui')) broken.push('game должен идти до ui');
  return { order, broken };
});
det(10, () => {
  /* каталог сайта (site/index.html или корневой index.html) знает об игре */
  const candidates = ['index.html', 'site/index.html'];
  let ok = false;
  for (const c of candidates) {
    if (!exists(c)) continue;
    const src = read(c);
    if (/shooter-2/.test(src)) ok = true;
  }
  return { ok };
});
det(11, () => ({ readme: exists('README.md') && read('README.md').length > 2000 }));
det(12, () => {
  /* Ссылки на превью ищем только в таблице файлов (`| \`docs/x.png\` |`):
     в примерах команд встречаются пути вроде docs/fp.png, которые просто
     результат запуска и файлами быть не обязаны. */
  const missing = [];
  read('README.md').split('\n').forEach((line) => {
    if (!/^\s*\|/.test(line)) return;
    const m = /`docs\/([a-zA-Z0-9._-]+\.png)`/.exec(line);
    if (m && !exists('docs/' + m[1])) missing.push(m[1]);
  });
  return { missing };
});
det(13, () => {
  const readme = read('README.md');
  const claims = [];
  if (readme.includes('1760')) {
    const total = D.TOTALS ? D.TOTALS.total : null;
    if (total !== 1760) claims.push(`README: 1760 клипов, в данных ${total} (${D.PARTS.length}×${D.CLIPS.length}×${D.VARIANTS.length})`);
  }
  if (readme.includes('22 част')) {
    if (D.PARTS.length !== 22) claims.push('README: 22 части, в данных ' + D.PARTS.length);
  }
  return { claims };
});
det(14, () => ({ tools: fs.readdirSync(path.join(root, 'tools')).filter((f) => !/\.(mjs|js)$/.test(f)) }));
det(15, () => ({ junk: fs.readdirSync(path.join(root, 'docs')).filter((f) => !/\.(png|md|svg)$/.test(f)) }));
det(16, () => ({ license: read('README.md').match(/MIT|лиценз/i) !== null }));
det(17, () => {
  const html = read('index.html');
  const cdn = /<(script|link)[^>]+(cdn\.|unpkg|jsdelivr|googleapis)/i.test(html);
  return { cdn };
});
det(18, () => {
  const size = modFiles.reduce((s, f) => s + fs.statSync(path.join(root, f)).size, 0);
  return { size, tooBig: size > 3 * 1024 * 1024 };
});
det(19, () => {
  const bad = modFiles.filter((f) => read(f).charCodeAt(0) === 0xfeff);
  return { bad };
});

/* =============================== 1xx: ДАННЫЕ =========================== */
det(100, () => {
  const ids = D.WEAPONS.map((w) => w.id);
  return { dups: ids.filter((id, i) => ids.indexOf(id) !== i) };
});
det(101, () => {
  const guns = SH2.gunblueprints.GUNS;
  return { missing: D.WEAPONS.map((w) => w.id).filter((id) => !guns[id]) };
});
det(102, () => ({ missing: D.WEAPONS.map((w) => w.id).filter((id) => !D.GRIPS[id]) }));
det(103, () => {
  const bad = [];
  for (const w of D.WEAPONS) {
    const fields = ['damage', 'rpm', 'mag', 'reserve', 'reload', 'range', 'spread', 'adsSpread', 'recoil', 'kick', 'weight', 'adsFov'];
    for (const f of fields) {
      if (!Number.isFinite(w[f])) bad.push(`${w.id}.${f} = ${w[f]}`);
      else if (w[f] < 0) bad.push(`${w.id}.${f} < 0`);
    }
    if (w.rpm <= 0 || w.rpm > 1500) bad.push(`${w.id}.rpm = ${w.rpm}`);
    if (w.damage <= 0 || w.damage > 400) bad.push(`${w.id}.damage = ${w.damage}`);
    if (w.adsFov < 10 || w.adsFov > 80) bad.push(`${w.id}.adsFov = ${w.adsFov}`);
  }
  return { bad };
});
det(104, () => ({ bad: D.WEAPONS.filter((w) => w.adsSpread > w.spread).map((w) => w.id) }));
det(105, () => ({ bad: D.WEAPONS.filter((w) => !(w.mag > 0) || !(w.reserve >= 0)).map((w) => w.id) }));
det(106, () => ({ bad: D.WEAPONS.filter((w) => !(w.pellets >= 1) || w.pellets > 30).map((w) => `${w.id}: ${w.pellets} пуль`) }));
det(107, () => {
  const guns = SH2.gunblueprints.GUNS;
  const bad = [];
  for (const id of Object.keys(guns)) {
    const bp = guns[id];
    if (!bp.muzzle || bp.muzzle.length !== 3 || !bp.muzzle.every(Number.isFinite)) bad.push(id + ': muzzle');
  }
  return { bad };
});
det(108, () => ({ bad: Object.keys(SH2.gunblueprints.GUNS).filter((id) => !(SH2.gunblueprints.GUNS[id].sightY > 0)) }));
det(109, () => {
  const ids = D.ENEMY_TYPES.map((e) => e.id);
  return { dups: ids.filter((id, i) => ids.indexOf(id) !== i) };
});
det(110, () => ({ bad: D.ENEMY_TYPES.filter((e) => !(e.hp > 0) || !(e.armor >= 0)).map((e) => e.id) }));
det(111, () => ({ bad: D.ENEMY_TYPES.filter((e) => !e.preferRange || !(e.preferRange[0] < e.preferRange[1])).map((e) => e.id) }));
det(112, () => ({ bad: D.ENEMY_TYPES.filter((e) => !D.WEAPON_BY_ID[e.weapon]).map((e) => `${e.id} → ${e.weapon}`) }));
det(113, () => {
  /* Тактика из данных должна либо исполняться мозгом напрямую, либо иметь
     псевдоним (rush→advance, peek→hold, order→hold). Слово без поведения —
     это боец, который на «своей» тактике не двигается и не стреляет. */
  const play = new Set(SH2.ai.PLAYABLE_TACTICS);
  const alias = SH2.ai.TACTIC_ALIASES || {};
  const bad = [];
  D.ENEMY_TYPES.forEach((e) => (e.tactics || []).forEach((t) => {
    if (!play.has(t) && !alias[t]) bad.push(`${e.id}: ${t}`);
  }));
  return { bad, playable: [...play], aliases: Object.keys(alias) };
});
det(114, () => ({ bad: D.MISSIONS.filter((m) => !D.MAPS[m.map]).map((m) => `${m.id} → ${m.map}`) }));
det(115, () => {
  const set = new Set(D.WEAPONS.map((w) => w.id));
  const bad = [];
  D.MISSIONS.forEach((m) => (m.loadout || []).forEach((id) => { if (!set.has(id)) bad.push(`${m.id}: ${id}`); }));
  return { bad };
});
det(116, () => {
  const set = new Set(D.ENEMY_TYPES.map((e) => e.id));
  const bad = [];
  D.MISSIONS.forEach((m) => (m.enemies || []).forEach((id) => { if (!set.has(id)) bad.push(`${m.id}: ${id}`); }));
  return { bad };
});
det(117, () => {
  const bad = [];
  D.MISSIONS.forEach((m) => {
    const list = (m.enemies || []).length;
    if (m.type === 'eliminate' && m.count !== list) bad.push(`${m.id}: count ${m.count} ≠ ${list}`);
  });
  return { bad };
});
det(118, () => {
  const need = ['size', 'fog', 'sky', 'ground', 'accent', 'playerSpawn', 'extracts'];
  const bad = [];
  Object.keys(D.MAPS).forEach((k) => need.forEach((f) => { if (D.MAPS[k][f] === undefined) bad.push(`${k}.${f}`); }));
  return { bad };
});
det(119, () => {
  const bad = [];
  Object.keys(D.MAPS).forEach((k) => {
    const m = D.MAPS[k], half = m.size / 2;
    const p = m.playerSpawn;
    if (!p || Math.abs(p.x) > half || Math.abs(p.z) > half) bad.push(`${k}: спавн вне карты`);
    (m.extracts || []).forEach((e, i) => { if (Math.abs(e.x) > half || Math.abs(e.z) > half) bad.push(`${k}: эвакуация ${i} вне карты`); });
  });
  return { bad };
});

/* ============================== 2xx: КАРТЫ ============================== */
const levels = {};
det(200, () => {
  const bad = [];
  Object.keys(D.MAPS).forEach((k) => {
    try {
      levels[k] = SH2.model.buildLevel(k);
      if (!levels[k].group) bad.push(k + ': нет группы');
    } catch (e) { bad.push(k + ': ' + e.message); }
  });
  return { bad, maps: Object.keys(levels) };
});
det(201, () => ({ bad: Object.keys(levels).filter((k) => !(levels[k].props > 24)).map((k) => `${k}: ${levels[k].props}`) }));
det(202, () => ({ bad: Object.keys(levels).filter((k) => !levels[k].colliders.some((c) => c.kind === 'building')).map((k) => k) }));
det(203, () => ({ bad: Object.keys(levels).filter((k) => !levels[k].colliders.some((c) => c.kind === 'sandbag')).map((k) => k) }));
det(204, () => {
  const bad = [];
  Object.keys(levels).forEach((k) => levels[k].colliders.forEach((c, i) => {
    if (![c.x, c.z, c.hw, c.hd, c.h].every(Number.isFinite)) bad.push(`${k}[${i}] ${c.kind}`);
  }));
  return { bad };
});
det(205, () => {
  const bad = [];
  Object.keys(levels).forEach((k) => levels[k].colliders.forEach((c, i) => {
    if (!(c.hw > 0) || !(c.hd > 0)) bad.push(`${k}[${i}] ${c.kind} hw=${c.hw} hd=${c.hd}`);
  }));
  return { bad };
});
det(206, () => {
  const bad = [];
  Object.keys(levels).forEach((k) => {
    const half = D.MAPS[k].size / 2 + 2;
    levels[k].colliders.forEach((c, i) => {
      if (Math.abs(c.x) > half || Math.abs(c.z) > half) bad.push(`${k}[${i}] ${c.kind} (${c.x.toFixed(1)}, ${c.z.toFixed(1)})`);
    });
  });
  return { bad };
});
det(207, () => {
  const bad = [];
  Object.keys(levels).forEach((k) => {
    const W = new SH2.world.World(D.MAPS[k], levels[k].colliders);
    const p = D.MAPS[k].playerSpawn;
    if (!W.isFreeSpot(p.x, p.z, 0.45, 1.62)) bad.push(k + ': спавн в геометрии');
  });
  return { bad };
});
det(208, () => {
  const bad = [];
  Object.keys(levels).forEach((k) => {
    const W = new SH2.world.World(D.MAPS[k], levels[k].colliders);
    (D.MAPS[k].extracts || []).forEach((e, i) => {
      if (!W.isFreeSpot(e.x, e.z, 0.5, 1.62)) bad.push(`${k}: эвакуация ${i} в геометрии`);
    });
  });
  return { bad };
});
det(209, () => {
  /* Тонкая стенка мешков. Полутощина AABB — это половина ДЛИНЫ ряда, поэтому
     меряем не её: смотрим, насколько близко тело подходит к контуру мешков
     (код 210), а здесь проверяем, что для мешков включён низкий профиль —
     именно он пускает игрока вплотную. */
  const bad = [];
  Object.keys(levels).forEach((k) => levels[k].colliders.forEach((c) => {
    if (c.kind !== 'sandbag') return;
    if (!c.standLow) bad.push(`${k}: мешки без standLow`);
    if (!(Math.min(c.hw, c.hd) > 0.1)) bad.push(`${k}: нулевой коллайдер`);
  }));
  return { bad };
});
det(210, () => {
  /* Идём на мешки с юга маленькими шагами и смотрим, где тело упрётся.
     resolveCircle(pos, radius) мутирует переданный объект, поэтому шагаем
     настоящим телом, а не считаем «в один вызов». */
  const bad = [];
  Object.keys(levels).forEach((k) => {
    const W = new SH2.world.World(D.MAPS[k], levels[k].colliders);
    const sb = levels[k].colliders.find((c) => c.kind === 'sandbag');
    if (!sb) return;
    const pos = { x: sb.x, z: sb.z + sb.hd + 4, y: 0 };
    for (let i = 0; i < 200; i++) W.resolveCircle({ x: pos.x, z: pos.z + 0.02, y: 0 }, 0.46);
    // шагаем вручную: двигаем и разрешаем на каждом шаге
    /* Ставим тело в 1.2 м от мешка (это уже «подошёл») и упираемся в него
       коротким шагом. Так проверяется именно реакция на мешок, а не умение
       бота обходить здания на полпути. */
    const body = { x: sb.x, z: sb.z + sb.hd + 1.2, y: 0 };
    for (let i = 0; i < 200; i++) {
      body.z -= 0.02;
      W.resolveCircle(body, 0.46);
    }
    const gap = body.z - (sb.z + sb.hd);
    if (gap > 0.40) bad.push(`${k}: зазор до мешков ${gap.toFixed(2)} м`);
  });
  return { bad };
});
det(211, () => {
  const bad = [];
  Object.keys(levels).forEach((k) => {
    const W = new SH2.world.World(D.MAPS[k], levels[k].colliders);
    const p = D.MAPS[k].playerSpawn;
    const half = D.MAPS[k].size / 2;
    const body = { x: p.x, z: p.z, y: 0 };
    for (let i = 0; i < 400; i++) { body.z += 0.1; W.resolveCircle(body, 0.46); }
    if (body.z > half) bad.push(`${k}: вышел за границу z=${body.z.toFixed(1)}`);
  });
  return { bad };
});
det(212, () => {
  const bad = [];
  Object.keys(levels).forEach((k) => levels[k].colliders.forEach((c) => {
    if (c.kind === 'building' && !(c.h > 1)) bad.push(`${k}: здание высотой ${c.h}`);
  }));
  return { bad };
});
det(213, () => {
  /* Декор не должен стоять ровно на спавне игрока */
  const bad = [];
  Object.keys(levels).forEach((k) => {
    const p = D.MAPS[k].playerSpawn;
    levels[k].colliders.forEach((c) => {
      if (Math.hypot(c.x - p.x, c.z - p.z) < 0.9) bad.push(`${k}: ${c.kind} на спавне`);
    });
  });
  return { bad };
});
det(214, () => ({ bad: Object.keys(D.MAPS).filter((k) => !((D.MAPS[k].brightness || 1) >= 0.9)).map((k) => `${k}: ${D.MAPS[k].brightness}`) }));
det(215, () => ({ bad: Object.keys(D.MAPS).filter((k) => (D.MAPS[k].fogDensity || 0) > 0.006).map((k) => `${k}: ${D.MAPS[k].fogDensity}`) }));
det(216, () => {
  const lum = (c) => {
    const r = (c >> 16) & 255, g = (c >> 8) & 255, b = c & 255;
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  };
  return { bad: Object.keys(D.MAPS).filter((k) => lum(D.MAPS[k].ground) < 0.25).map((k) => `${k}: ${lum(D.MAPS[k].ground).toFixed(2)}`) };
});
det(217, () => {
  /* Кровельные швы и прочие детали не должны вылезать за пятно здания */
  const bad = [];
  Object.keys(levels).forEach((k) => {
    const M = D.MAPS[k];
    levels[k].group.traverse((o) => {
      if (!o.isMesh || !o.geometry) return;
      if (!o.geometry.boundingSphere) o.geometry.computeBoundingSphere();
      const r = o.geometry.boundingSphere ? o.geometry.boundingSphere.radius : 0;
      if (r > M.size) bad.push(`${k}: меш радиусом ${r.toFixed(0)} м`);
    });
  });
  return { bad };
});
det(218, () => {
  let cells = 0;
  Object.keys(levels).forEach((k) => {
    const W = new SH2.world.World(D.MAPS[k], levels[k].colliders);
    cells += W.gridN || 0;
  });
  return { cells, bad: cells === 0 };
});
det(219, () => {
  /* Стрельба в стену не должна проходить уровень насквозь */
  const bad = [];
  Object.keys(levels).forEach((k) => {
    const W = new SH2.world.World(D.MAPS[k], levels[k].colliders);
    const b = levels[k].colliders.find((c) => c.kind === 'building');
    if (!b) return;
    const hit = W.rayColliders(b.x - b.hw - 6, 1.5, b.z, 1, 0, 0, 40);
    // 6 м до грани: попадание должно быть почти сразу за ней, а не за центром
    if (!hit || hit.t > 6.35) bad.push(`${k}: луч прошёл сквозь здание (t=${hit ? hit.t.toFixed(1) : 'нет'})`);
  });
  return { bad };
});

/* ============================== 3xx: РЕНДЕР ============================= */
det(300, () => {
  game.startMission(0);
  return { state: game.state };
});
det(301, () => {
  const r = simulate(game, 0.5, { forward: 0.3 });
  return { frames: game.renderer.frames.length, wiped: r.wiped.length };
});
det(302, () => {
  const f = game.renderer.frames[game.renderer.frames.length - 1];
  return { wipedBy: f.wipedBy, wiped: f.wipedWorld };
});
det(303, () => {
  const frames = game.renderer.frames;
  const bad = frames.filter((f) => f.bgQuads > 1);
  return { bad: bad.length, last: frames[frames.length - 1] };
});
det(304, () => ({ restored: !!game.scene.background }));
det(305, () => ({ layer: game.camera.layers.mask }));
det(306, () => {
  const bad = [];
  game.scene.traverse((o) => {
    if (o.isMesh && o.parent && /viewmodel/.test(o.parent.name || '')) {
      if (o.layers.mask !== 2) bad.push(o.name || o.type);
    }
  });
  const vmRoot = game.viewmodel && game.viewmodel.root;
  if (vmRoot) vmRoot.traverse((o) => { if (o.isMesh && o.layers.mask !== 2) bad.push('vm:' + (o.name || o.type)); });
  return { bad };
});
det(307, () => {
  const w = game.viewmodel && game.viewmodel.mounted;
  if (!w) return { bad: true };
  const box = new sandbox.THREE.Box3().setFromObject(w);
  return { z: [box.min.z, box.max.z] };
});
det(308, () => {
  const vm = game.viewmodel;
  let lights = 0;
  if (vm && vm.lights) vm.lights.traverse((o) => { if (o.isLight) lights++; });
  return { lights };
});
det(309, () => {
  const vm = game.viewmodel;
  const bad = [];
  if (vm && vm.lights) vm.lights.traverse((o) => { if (o.isLight && o.layers.mask !== 2) bad.push(o.type); });
  return { bad };
});
det(310, () => {
  const f = game.renderer.frames[game.renderer.frames.length - 1];
  return { meshes: f.passes[0] ? f.passes[0].meshes : 0 };
});
det(311, () => {
  const bg = game.scene.background;
  if (!bg) return { bad: true };
  if (bg.isColor) {
    const c = bg.getHex();
    return { bad: c === 0x000000, hex: c };
  }
  return { bad: false, texture: true };
});
det(312, () => {
  /* Текстура фона поддерживается рендерером: это обязательное условие для
     второго прохода (см. 303). Проверяем, что она не Color-массив и живёт. */
  const bg = game.scene.background;
  return { type: bg && bg.isColor ? 'color' : (bg && bg.isTexture ? 'texture' : 'unknown') };
});
det(313, () => {
  const before = SH2.model.matCacheSize();
  for (const k of Object.keys(levels)) SH2.model.buildLevel(k);
  const after = SH2.model.matCacheSize();
  return { before, after, bad: after > before * 3 + 50 };
});
det(314, () => ({ size: SH2.model.matCacheSize(), bad: SH2.model.matCacheSize() > 4000 }));
det(315, () => ({ enabled: game.renderer.shadowMap.enabled }));
det(316, () => {
  game.player.alive = false;
  game.viewmodel.update(1 / 60, { moving: 0, sprint: false, ads: false, hidden: true });
  const vis = game.viewmodel.root.visible;
  game.player.alive = true;
  return { visible: vis };
});
det(317, () => ({ ratio: game.renderer.pixelRatio, bad: !(game.renderer.pixelRatio > 0) }));
det(318, () => {
  /* Мушка на прицеле обязана стоять в центре кадра у ВСЕХ 15 стволов.
     Иначе игрок целится мимо, а ствол «смотрит» в угол. Проверяем честно:
     проецируем дульный срез в экранные координаты и смотрим отклонение. */
  const bad = [];
  const cam = new sandbox.THREE.PerspectiveCamera(48, 960 / 560, 0.05, 320);
  cam.position.set(0, 1.62, 0);
  cam.rotation.order = 'YXZ';
  cam.rotation.set(0, Math.PI, 0);
  const vm = new SH2.viewmodel.ViewModel(cam);
  for (const w of D.WEAPONS) {
    cam.fov = 48;
    cam.updateProjectionMatrix();
    cam.updateMatrixWorld(true);
    vm.setWeapon(w.id);
    for (let i = 0; i < 90; i++) vm.update(1 / 60, { moving: 0, sprint: false, ads: true });
    cam.updateMatrixWorld(true);
    if (!vm.muzzleLocal) { bad.push(w.id + ': нет мушки'); continue; }
    const p = new sandbox.THREE.Vector3();
    vm.muzzleLocal.getWorldPosition(p);
    p.applyMatrix4(cam.matrixWorldInverse);
    const depth = -p.z;
    const ndc = p.applyMatrix4(cam.projectionMatrix);
    if (!Number.isFinite(ndc.x) || !Number.isFinite(ndc.y)) { bad.push(w.id + ': мушка за камерой'); continue; }
    if (Math.abs(ndc.x) > 0.06 || Math.abs(ndc.y) > 0.06) {
      bad.push(`${w.id}: мушка в (${ndc.x.toFixed(2)}, ${ndc.y.toFixed(2)})`);
    }
    if (!(depth > 0.15) || depth > 2) bad.push(`${w.id}: глубина мушки ${depth.toFixed(2)} м`);
  }
  return { bad };
});
det(319, () => {
  /* Портрет: оружие поджимается, центр кадра остаётся свободным */
  game.camera.aspect = 390 / 844;
  game.camera.updateProjectionMatrix();
  game.viewmodel.setWeapon('rifle');
  game.viewmodel.update(1 / 60, { moving: 0, sprint: false, ads: true });
  const y = game.viewmodel.rig.position.y;
  game.camera.aspect = 16 / 9;
  game.camera.updateProjectionMatrix();
  return { y, bad: y > -0.05 };
});

/* =========================== 4xx: ИГРОК =============================== */
det(400, () => {
  game.startMission(0);
  const r = simulate(game, 1, { forward: 1 });
  return { x: game.player.x, z: game.player.z, bad: !Number.isFinite(game.player.x) || !Number.isFinite(game.player.z) };
});
det(401, () => {
  /* Игрок не проходит сквозь здание: шагаем в стену и смотрим, где упёрлись */
  const b = game.level.colliders.find((c) => c.kind === 'building');
  const body = { x: b.x - b.hw - 2.0, z: b.z, y: 0 };
  for (let i = 0; i < 400; i++) { body.x += 0.02; game.world.resolveCircle(body, game.player.radius); }
  const gap = (b.x - b.hw) - body.x;
  return { gap, bad: gap < -0.02 };
});
det(402, () => ({ bad: game.player.y < -0.5, y: game.player.y }));
det(403, () => {
  game.startMission(0);
  const before = { x: game.player.x, z: game.player.z };
  const yaw = game.player.yaw;
  simulate(game, 0.6, { forward: 1, faceYaw: yaw });
  const dx = game.player.x - before.x, dz = game.player.z - before.z;
  const len = Math.hypot(dx, dz);
  const dirX = -Math.sin(yaw), dirZ = -Math.cos(yaw);
  const dot = len > 0.05 ? (dx / len) * dirX + (dz / len) * dirZ : 1;
  return { dot, moved: len };
});
det(404, () => {
  game.startMission(0);
  game.player.stamina = 100;
  simulate(game, 2.0, { forward: 1, sprint: true });
  return { stamina: game.player.stamina };
});
det(405, () => {
  game.player.stamina = 5;
  game.player.exhausted = true;
  simulate(game, 2.0, { forward: 0 });
  return { stamina: game.player.stamina };
});
det(406, () => {
  game.startMission(0);
  const eyeRun = game.player.eyeHeight;
  simulate(game, 0.8, { crouch: true });
  const eyeCrouch = game.player.eyeHeight;
  return { eyeRun, eyeCrouch, bad: !(eyeCrouch < eyeRun) };
});
det(407, () => {
  game.startMission(0);
  game.player.grounded = false;
  const ok = game.player.jump();
  return { jumped: ok, bad: ok === true };
});
det(408, () => {
  game.player.grounded = true;
  game.player.exhausted = true;
  game.player.stamina = 100;
  const ok = game.player.jump();
  return { jumped: ok, bad: ok === true };
});
det(409, () => {
  game.startMission(0);
  game.player.ammoInMag = 10;
  game.player.fireTimer = 0;
  game.player.fire(game.time);
  return { ammo: game.player.ammoInMag };
});
det(410, () => {
  game.player.weapon && (game.player.fireTimer = 0);
  game.player.ammoInMag = 5;
  game.player.fire(game.time);
  const t1 = game.player.fireTimer;
  const fired = game.player.fire(game.time);
  return { timer: t1, secondBlocked: game.player.ammoInMag === 4 || fired === undefined };
});
det(411, () => {
  game.startMission(0);
  game.player.ammoInMag = 1;
  game.player.reserve = 3;
  game.player.startReload();
  game.player.finishReload();
  return { mag: game.player.ammoInMag, reserve: game.player.reserve, bad: game.player.ammoInMag < 0 || game.player.reserve < 0 };
});
det(412, () => {
  const need = game.player.weapon.mag - game.player.ammoInMag;
  return { ok: game.player.ammoInMag + game.player.reserve >= 0 && need >= 0 };
});
det(413, () => {
  game.startMission(0);
  game.player.ammoInMag = 7;
  game.player.slot = 0;
  const w0 = game.player.weapon.id;
  game.player.selectSlot(Math.min(1, game.player.slots.length - 1));
  game.player.selectSlot(0);
  return { weapon: game.player.weapon.id, same: game.player.weapon.id === w0, ammo: game.player.ammoInMag };
});
det(414, () => {
  game.startMission(0);
  const p0 = game.player.pitch;
  game.player.fireTimer = 0;
  game.player.ammoInMag = 10;
  game.player.fire(game.time);
  return { p0, p1: game.player.pitch, bad: !(game.player.pitch >= p0) };
});
det(415, () => {
  const spreadAtRest = game.player.weapon.spread;
  game.player.vx = 4; game.player.vz = 4;
  game.player.spreadHeat = 1.0;
  const moving = spreadAtRest * (1 + 1.8 * 0.9 + 1.0 * 0.55);
  return { spreadAtRest, moving, bad: !(moving > spreadAtRest) };
});
det(416, () => {
  /* Тач-стик: мёртвая зона 12% — берём ту же формулу, что в bindTouch */
  const shape = (mag) => (mag <= 0.12 ? 0 : (mag - 0.12) / (1 - 0.12));
  return { dead: shape(0.11), live: shape(0.5), bad: shape(0.11) !== 0 || !(shape(0.5) > 0) };
});
det(417, () => {
  const norm = (vx, vy) => {
    const len = Math.hypot(vx, vy);
    if (len > 1) { vx /= len; vy /= len; }
    return Math.hypot(vx, vy);
  };
  return { long: norm(3, 4), bad: norm(3, 4) > 1.0001 };
});
det(418, () => {
  const src = read('src/game.js');
  return { autoSprint: /stickMag > 0\.9/.test(src) };
});
det(419, () => ({ bad: game.player.radius <= 0.2 || game.player.radius > 1 }));

/* ======================= 420–429: «я не могу ходить» ====================
   Прошлые проверки смотрели на формулу стика (мёртвая зона, нормировка,
   радиус), поэтому и пропустили главный баг: вектор стика считался, но в
   физику тела не передавался. Теперь каждый детектор честно жмёт клавишу
   или тянет стик и смотрит, сдвинулся ли игрок в мире. */
function walkReset(mission) {
  game.startMission(mission === undefined ? 0 : mission);
  game.state = 'playing';
  game.locked = true;
  game.enemies.slice().forEach((e) => e.dispose(game.scene));
  game.enemies.length = 0;
  Object.keys(game.keys).forEach((k) => { game.keys[k] = false; });
  game.input.crouchToggle = false;
  game.input.analog = null;
  game.mouse.dx = 0; game.mouse.dy = 0;
  if (game.touch) {
    game.touch.active = true;
    game.touch.stickActive = false;
    game.touch.sx = 0; game.touch.sz = 0;
    game.touch.txs = 0; game.touch.tzs = 0;
  }
  game.player.yaw = 0;
  game.player.pitch = 0;
  return { x: game.player.x, z: game.player.z };
}
function walkFrames(n) {
  for (let i = 0; i < (n || 90); i++) {
    if (!game.player.alive) break;
    game.player.hp = game.player.maxHp;
    game.update(1 / 60);
  }
}
function stickTo(x, z) {
  game.touch.active = true;
  game.touch.stickActive = true;
  game.touch.txs = x; game.touch.tzs = z;
}
const dist = (a) => Math.hypot(game.player.x - a.x, game.player.z - a.z);

det(420, () => {
  /* Клавиши WASD: каждая из четырёх обязана сдвинуть тело. Это первое, что
     проверяет живой человек, и первое, что должно падать, если ввод сломан. */
  const bad = [];
  const dirs = { KeyW: 'вперёд', KeyS: 'назад', KeyA: 'влево', KeyD: 'вправо' };
  Object.keys(dirs).forEach((code) => {
    const a = walkReset(0);
    game.keys[code] = true;
    walkFrames(90);
    const d = dist(a);
    if (!(d > 1.5)) bad.push(`${code} (${dirs[code]}): сдвиг ${d.toFixed(2)} м`);
  });
  return { bad };
});

det(421, () => {
  /* Стик телефона: палец вверх до упора = идём вперёд. Ровно этот сценарий
     и был сломан — стик двигался на экране, а боец стоял. */
  const a = walkReset(0);
  stickTo(0, 1);
  walkFrames(120);
  const d = dist(a);
  return { moved: +d.toFixed(2), bad: d > 1.5 ? [] : [`стик вперёд: сдвиг ${d.toFixed(2)} м`] };
});

det(422, () => {
  /* Статическая страховка от той же регрессии: вектор стика обязан уходить
     в вызов update() игрока параметром analog, а не только в inp. */
  const src = read('src/game.js');
  const call = (src.match(/P\.update\(dt,\s*\{[\s\S]{0,320}?\}, this\)/) || [''])[0];
  const bad = [];
  if (!call) bad.push('не найден вызов P.update(dt, {...}, this)');
  else if (!/analog:\s*inp\.analog/.test(call)) bad.push('в P.update не передаётся analog');
  if (!/inp\.analog\s*=/.test(src)) bad.push('inp.analog нигде не заполняется');
  return { bad };
});

det(423, () => {
  /* Стик идёт туда, куда смотрит камера: повернулись на 90° — и «вперёд»
     обязан стать другим направлением, а не мировой осью +Z. */
  const a = walkReset(0);
  game.player.yaw = Math.PI / 2;
  stickTo(0, 1);
  walkFrames(90);
  const dx = game.player.x - a.x, dz = game.player.z - a.z;
  const bad = [];
  if (!(Math.abs(dx) > 1.5) || Math.abs(dx) < Math.abs(dz)) {
    bad.push(`при yaw=90° ушли в (${dx.toFixed(2)}, ${dz.toFixed(2)}) — ожидали движение по X`);
  }
  return { bad };
});

det(424, () => {
  /* «Вправо» по экрану при yaw=0 — это −X (камера смотрит в +Z). Здесь
     раньше стоял перевёрнутый знак, и управление было зеркальным. */
  const a = walkReset(0);
  stickTo(1, 0);
  walkFrames(90);
  const dx = game.player.x - a.x;
  return { dx: +dx.toFixed(2), bad: dx < -1.5 ? [] : [`стик вправо увёл в ${dx.toFixed(2)} м по X`] };
});

det(425, () => {
  /* Половина наклона стика — примерно половина скорости: аналоговый шаг. */
  const a = walkReset(0);
  stickTo(0, 0.5);
  walkFrames(60);
  const slow = dist(a);
  const b = walkReset(0);
  stickTo(0, 1);
  walkFrames(60);
  const fast = dist(b);
  const bad = [];
  if (!(slow > 0.5)) bad.push(`полунаклон не двигает: ${slow.toFixed(2)} м`);
  if (!(fast > slow * 1.3)) bad.push(`полунаклон ${slow.toFixed(2)} м против полного ${fast.toFixed(2)} м`);
  return { slow: +slow.toFixed(2), fast: +fast.toFixed(2), bad };
});

det(426, () => {
  /* Отпустили палец — тормозим. Инерция есть, но за полсекунды она обязана
     погаснуть, иначе боец «уезжает» сам по себе. */
  const a = walkReset(0);
  stickTo(0, 1);
  walkFrames(60);
  game.touch.stickActive = false;
  game.touch.txs = 0; game.touch.tzs = 0;
  walkFrames(30);
  const stop = { x: game.player.x, z: game.player.z };
  walkFrames(60);
  const drift = Math.hypot(game.player.x - stop.x, game.player.z - stop.z);
  return { drift: +drift.toFixed(2), bad: drift > 0.4 ? [`после отпускания проехал ${drift.toFixed(2)} м`] : [] };
});

det(427, () => {
  /* Движение на всех шести картах: спавн на harbor был внутри башни, и
     человек честно не мог выйти с точки старта. */
  const bad = [];
  const report = [];
  for (let m = 0; m < D.MISSIONS.length; m++) {
    const a = walkReset(m);
    game.keys.KeyW = true;
    walkFrames(90);
    const d = dist(a);
    report.push(`м${m + 1}:${d.toFixed(1)}`);
    if (!(d > 1.2)) bad.push(`миссия ${m + 1}: со спавна прошли ${d.toFixed(2)} м`);
  }
  return { report: report.join(' '), bad };
});

det(428, () => {
  /* Спавн свободен во все четыре стороны: если игрок зажат в углу, ходьба
     есть только в одном направлении и это ощущается как «не ходит». */
  const bad = [];
  for (let m = 0; m < D.MISSIONS.length; m++) {
    walkReset(m);
    const P = game.player;
    const blocked = game.world.isFreeSpot(P.x, P.z, P.radius + 0.02, P.eyeHeight);
    if (!blocked) bad.push(`миссия ${m + 1}: спавн (${P.x.toFixed(1)}, ${P.z.toFixed(1)}) занят`);
  }
  return { bad };
});

det(429, () => {
  /* Мышь двигает только взгляд: без клавиш и стика тело стоит. Если оно
     ползёт от поворота камеры — это «самоход», его тоже видно как поломку. */
  const a = walkReset(0);
  for (let i = 0; i < 60; i++) {
    game.mouse.dx = 12; game.mouse.dy = 3;
    game.update(1 / 60);
  }
  const d = dist(a);
  return { drift: +d.toFixed(3), bad: d > 0.25 ? [`от поворота мыши уехал на ${d.toFixed(2)} м`] : [] };
});

/* ============================ 5xx: БОЙ ================================ */
det(500, () => {
  game.startMission(0);
  const b = game.level.colliders.find((c) => c.kind === 'building');
  const o = { x: b.x - b.hw - 5, y: 1.5, z: b.z };
  const hit = game.world.rayColliders(o.x, o.y, o.z, 1, 0, 0, 30);
  return { t: hit ? hit.t : null };
});
det(501, () => {
  const b = game.level.colliders.find((c) => c.kind === 'building');
  const hit = game.world.rayColliders(b.x - b.hw - 5, 1.5, b.z, 1, 0, 0, 30);
  return { through: !hit || hit.t > 6.2 };
});
det(502, () => {
  game.startMission(0);
  const e = game.enemies[0];
  if (!e) return { bad: true };
  game.player.x = e.x; game.player.z = e.z - 40; game.player.y = 0;
  game.player.yaw = 0; game.player.pitch = 0;
  const los = game.world.hasLOS(game.player.x, 1.6, game.player.z, e.x, 1.2, e.z);
  return { los: typeof los };
});
det(503, () => ({ tracers: game.fx.tracers ? game.fx.tracers.count : 0 }));
det(504, () => {
  const w = game.player.weapon;
  return { headshot: w.headshot > 1 };
});
det(505, () => {
  const heavy = D.ENEMY_BY_ID.heavy;
  return { armor: heavy.armor > 0 };
});
det(506, () => {
  game.startMission(0);
  const e = game.enemies.find((x) => x.alive);
  if (!e) return { bad: true };
  const hp0 = e.hp;
  e.hp -= 10000;
  e.alive = false;
  return { hp0, alive: e.alive };
});
det(507, () => {
  game.startMission(0);
  // убиваем всех, смотрим лимит трупов
  game.enemies.forEach((e) => { e.hp = 0; e.alive = false; });
  simulate(game, 1, {});
  return { bodies: game.deadBodies.length, limit: 12 };
});
det(508, () => {
  game.startMission(0);
  const g = game.combat.grenades;
  game.combat.throwGrenade ? game.combat.throwGrenade() : null;
  return { count: g.length };
});
det(509, () => {
  game.startMission(0);
  const e = game.enemies.find((x) => x.alive);
  const hp0 = e.hp;
  game.combat.grenades.length = 0;
  game.combat.spawnGrenade ? game.combat.spawnGrenade(e.x, 1, e.z, { radius: 7, damage: 150, fuse: 0.05 }) : null;
  for (let i = 0; i < 40; i++) game.combat.update(1 / 60);
  return { hp0, hp1: e.hp };
});
det(510, () => ({ shards: game.fx.counts ? game.fx.counts.shards : null }));
det(511, () => ({ pool: game.fx.shards ? game.fx.shards.length : 0 }));
det(512, () => {
  if (!game.fx.shards) return { bad: true };
  const anyDown = game.fx.shards.some((s) => s.mesh && s.mesh.position.y <= 0.2);
  return { anyDown };
});
det(513, () => {
  const src = read('src/game.js');
  return { los: /hasLOS/.test(src) };
});
det(514, () => {
  const src = read('src/game.js');
  const bad = /g\.hurt\(/.test(src);
  return { bad };
});
det(515, () => {
  game.startMission(0);
  game.damagePlayer(10, { x: 0, z: 0 });
  return { hp: game.player.hp, bad: !Number.isFinite(game.player.hp) };
});
det(516, () => ({ bullets: game.combat.bullets.length }));
det(517, () => ({ grenades: game.combat.grenades.length }));
det(518, () => {
  game.startMission(0);
  const e = game.enemies[0];
  if (!e || !e.ragdoll) return { bad: false, skipped: true };
  return { has: !!e.ragdoll };
});
det(519, () => {
  const e = game.enemies.find((x) => x.ragdoll);
  if (!e) return { skipped: true, bad: false };
  return { sleeping: !!e.ragdoll.sleeping };
});

/* ============================== 6xx: ИИ =============================== */
det(600, () => {
  game.startMission(0);
  simulate(game, 1.5, {});
  const withTactic = game.enemies.filter((e) => e.brain && e.brain.tactic);
  return { total: game.enemies.length, withTactic: withTactic.length };
});
det(601, () => {
  game.startMission(0);
  simulate(game, 6, {});
  const stuck = game.enemies.filter((e) => e.alive && e.brain && !e.brain.tactic && !e.brain.thinking);
  return { stuck: stuck.length };
});
det(602, () => {
  /* Две вещи сразу:
     1) боец не должен бегать с тактикой, которой нет в исполнимом наборе;
     2) подсказки из данных обязаны проходить через playableTactic — иначе
        слово «peek» тихо кладётся в очки и ни во что не превращается, а
        боец на этой тактике просто медленнее реагирует (так и было). */
  const play = new Set(SH2.ai.PLAYABLE_TACTICS);
  const bad = [];
  game.enemies.forEach((e) => {
    const t = e.brain && e.brain.tactic;
    if (t && !play.has(t)) bad.push(`${e.type}: ${t}`);
  });
  const aiSrc = read('src/ai.js');
  const thinkBlock = (aiSrc.match(/if \(this\.rng\(\) > cfg\.thinkQuality\)[\s\S]{0,260}/) || [''])[0];
  if (thinkBlock && !/playableTactic\(/.test(thinkBlock)) bad.push('подсказка тактики не проходит через playableTactic');
  const orderBlock = (aiSrc.match(/this\.order && game\.time[\s\S]{0,220}/) || [''])[0];
  if (orderBlock && !/playableTactic\(/.test(orderBlock)) bad.push('приказ командира не проходит через playableTactic');
  return { bad };
});
det(603, () => {
  const src = read('src/ai.js');
  return { losCheck: /hasLOS|lineOfSight/.test(src) };
});
det(604, () => {
  const src = read('src/ai.js');
  return { cover: /cover/i.test(src) };
});
det(605, () => ({ flank: /flank/i.test(read('src/ai.js')) }));
det(606, () => ({ retreat: /retreat|flee/i.test(read('src/ai.js')) }));
det(607, () => {
  game.startMission(0);
  const officers = game.enemies.filter((e) => e.type === 'officer' || e.type === 'boss');
  return { officers: officers.length };
});
det(608, () => {
  const src = read('src/ai.js');
  return { orders: /orders|command/i.test(src) };
});
det(609, () => {
  game.startMission(0);
  simulate(game, 6, {});
  const near = [];
  for (let i = 0; i < game.enemies.length; i++) {
    for (let j = i + 1; j < game.enemies.length; j++) {
      const a = game.enemies[i], b = game.enemies[j];
      if (a.alive && b.alive && Math.hypot(a.x - b.x, a.z - b.z) < 0.55) near.push(`${i}-${j}`);
    }
  }
  return { near };
});
det(610, () => {
  const half = game.level.map.size / 2;
  const out = game.enemies.filter((e) => Math.abs(e.x) > half + 2 || Math.abs(e.z) > half + 2);
  return { out: out.length };
});
det(611, () => {
  const W = game.world;
  const inside = game.enemies.filter((e) => e.alive && !W.isFreeSpot(e.x, e.z, 0.3, 1.0));
  return { inside: inside.length };
});
det(612, () => ({ bad: game.enemies.some((e) => !Number.isFinite(e.x) || !Number.isFinite(e.z)) }));
det(613, () => ({ memory: game.enemies.some((e) => e.brain && e.brain.memory !== undefined) }));
det(614, () => {
  const diff = D.ENEMY_TYPES.map((e) => e.thinkQuality);
  return { min: Math.min(...diff), max: Math.max(...diff), spread: Math.max(...diff) - Math.min(...diff) };
});
det(615, () => {
  const boss = D.ENEMY_BY_ID.boss;
  const maxHp = Math.max(...D.ENEMY_TYPES.map((e) => e.hp));
  return { bossHp: boss.hp, maxHp };
});
det(616, () => {
  const boss = D.ENEMY_BY_ID.boss;
  const w = D.WEAPON_BY_ID[boss.weapon];
  return { dps: w.damage * (w.rpm / 60) };
});
det(617, () => ({ bad: D.ENEMY_TYPES.some((e) => !(e.reaction >= 0)) }));
det(618, () => {
  const t0 = Date.now();
  simulate(game, 2, {});
  return { ms: Date.now() - t0 };
});
det(619, () => {
  const before = game.enemies.length;
  game.startMission(0);
  return { before, after: game.enemies.length };
});

/* ========================= 7xx: АНИМАЦИЯ И МОДЕЛИ ===================== */
det(700, () => {
  /* clipCurve отдаёт не массив, а объект каналов: { rx: [[t, v], ...], ... }.
     Поэтому идём по каналам и проверяем конечность и времени, и значения. */
  const bad = [];
  D.PARTS.forEach((p) => {
    D.CLIPS.forEach((c) => {
      const curve = D.clipCurve(p.id, c.id, 0);
      if (!curve) { bad.push(`${p.id}/${c.id}: нет кривой`); return; }
      for (const ch of Object.keys(curve)) {
        for (const frame of curve[ch]) {
          if (!Number.isFinite(frame[0]) || !Number.isFinite(frame[1])) { bad.push(`${p.id}/${c.id}/${ch}`); break; }
        }
      }
    });
  });
  return { bad: bad.slice(0, 10), count: bad.length };
});
det(701, () => {
  let maxAmp = 0;
  D.PARTS.forEach((p) => D.CLIPS.forEach((c) => {
    const curve = D.clipCurve(p.id, c.id, 0);
    if (!curve) return;
    for (const ch of Object.keys(curve)) curve[ch].forEach((f) => { maxAmp = Math.max(maxAmp, Math.abs(f[1])); });
  }));
  return { maxAmp, bad: maxAmp > 3 };
});
det(702, () => ({ clips: D.CLIPS.length, parts: D.PARTS.length, variants: D.VARIANTS.length }));
det(703, () => {
  /* Варианты ходьбы обязаны отличаться: «стандарт» и «хромая» не могут быть
     одной и той же кривой, иначе выбор варианта в игре ничего не меняет. */
  const a = D.clipCurve(D.PARTS[0].id, D.CLIPS[0].id, 0);
  const b = D.clipCurve(D.PARTS[0].id, D.CLIPS[0].id, Math.min(1, D.VARIANTS.length - 1));
  if (!a || !b) return { bad: true };
  let diff = 0;
  for (const ch of Object.keys(a)) {
    a[ch].forEach((f, i) => { diff += Math.abs(f[1] - (b[ch] ? b[ch][i][1] : 0)); });
  }
  return { diff, bad: diff < 1e-6 };
});
det(704, () => ({ parts: D.PARTS.length }));
det(705, () => {
  const rig = SH2.model.buildRig('grunt');
  let bones = 0;
  rig.root.traverse((o) => { if (o.isObject3D && o.name && rig.bones && rig.bones[o.name]) bones++; });
  return { bones, hasParts: !!(rig.parts || rig.bones) };
});
det(706, () => ({ built: !!SH2.model.buildRig('grunt').root }));
det(707, () => {
  const rig = SH2.model.buildRig('grunt');
  const box = new sandbox.THREE.Box3().setFromObject(rig.root);
  return { minY: box.min.y, bad: box.min.y < -1.2 || box.min.y > 1.2 };
});
det(708, () => {
  const bad = [];
  for (const id of D.WEAPONS.map((w) => w.id)) {
    try {
      const g = SH2.model.buildWeaponModel(id);
      let n = 0;
      g.traverse((o) => { if (o.isMesh) n++; });
      if (n < 5) bad.push(`${id}: ${n} мешей`);
    } catch (e) { bad.push(`${id}: ${e.message}`); }
  }
  return { bad };
});
det(709, () => {
  const bad = [];
  for (const id of D.WEAPONS.map((w) => w.id)) {
    const g = SH2.model.buildWeaponModel(id);
    const box = new sandbox.THREE.Box3().setFromObject(g);
    const size = box.getSize(new sandbox.THREE.Vector3());
    if (size.z < 0.1 || size.z > 1.6) bad.push(`${id}: длина ${size.z.toFixed(2)} м`);
    if (size.y < 0.05 || size.y > 0.8) bad.push(`${id}: высота ${size.y.toFixed(2)} м`);
  }
  return { bad };
});
det(710, () => {
  const g = SH2.model.buildWeaponModel('rifle');
  const mz = g.userData.muzzle.position;
  const box = new sandbox.THREE.Box3().setFromObject(g);
  return { muzzleZ: mz.z, maxZ: box.max.z, bad: mz.z < box.max.z - 0.06 };
});
det(711, () => {
  const vm = new SH2.viewmodel.ViewModel(new sandbox.THREE.PerspectiveCamera(78, 16 / 9, 0.05, 320));
  const bad = [];
  for (const id of D.WEAPONS.map((w) => w.id)) {
    try { vm.setWeapon(id); if (!vm.mounted) bad.push(id); } catch (e) { bad.push(id + ': ' + e.message); }
  }
  return { bad };
});
det(712, () => {
  const cam = new sandbox.THREE.PerspectiveCamera(78, 16 / 9, 0.05, 320);
  cam.position.set(0, 1.6, 0);
  const vm = new SH2.viewmodel.ViewModel(cam);
  vm.setWeapon('rifle');
  vm.update(1 / 60, { moving: 0, sprint: false, ads: false });
  return { z: vm.rig.position.z, bad: vm.rig.position.z > -0.1 };
});
det(713, () => {
  const cam = new sandbox.THREE.PerspectiveCamera(78, 16 / 9, 0.05, 320);
  const vm = new SH2.viewmodel.ViewModel(cam);
  vm.setWeapon('rifle');
  for (let i = 0; i < 60; i++) vm.update(1 / 60, { moving: 0, sprint: false, ads: true });
  return { z: vm.rig.position.z, bad: vm.rig.position.z > -0.1 };
});
det(714, () => ({ hands: !!(game.viewmodel && game.viewmodel.armR && game.viewmodel.armL) }));
det(715, () => {
  const src = read('src/ik.js');
  return { twoBone: /two-bone|twoBone|clamp/i.test(src) };
});
det(716, () => ({ anim: /playReload/.test(read('src/viewmodel.js')) }));
det(717, () => {
  const cam = new sandbox.THREE.PerspectiveCamera(78, 16 / 9, 0.05, 320);
  const vm = new SH2.viewmodel.ViewModel(cam);
  vm.setWeapon('shotgun');
  for (let i = 0; i < 20; i++) { vm.addRecoil(0.05, {}); vm.update(1 / 60, { moving: 1, sprint: false, ads: false }); }
  return { z: vm.rig.position.z, bad: vm.rig.position.z > -0.05 };
});
det(718, () => {
  const rig = SH2.model.buildRig('grunt');
  const box = new sandbox.THREE.Box3().setFromObject(rig.root);
  return { height: box.max.y - box.min.y };
});
det(719, () => {
  const rig = SH2.model.buildRig('grunt');
  if (!rig.lod) return { hasLod: false, bad: false };
  return { hasLod: true };
});

/* =============================== 8xx: UI ============================== */
det(800, () => {
  game.startMission(0);
  ui.frame(game, 1 / 60);
  return { ok: true };
});
det(801, () => {
  const html = read('index.html');
  return { menu: html.includes('scr-menu'), brief: html.includes('scr-brief') };
});
det(802, () => {
  const html = read('index.html');
  return { death: html.includes('scr-death'), win: html.includes('scr-win') };
});
det(803, () => {
  game.startMission(0);
  game.pause();
  const paused = game.state === 'paused';
  game.resume();
  return { paused, resumed: game.state === 'playing' };
});
det(804, () => {
  game.kills = 3; game.score = 1200;
  game.missionTimer = 12;
  try { ui.showMissionComplete(game, game.mission, { time: 12, accuracy: 0.5, kills: 3, damageTaken: 10, timeBonus: 100, last: false }); }
  catch (e) { return { error: e.message }; }
  return { ok: true };
});
det(805, () => ({ lab: read('index.html').includes('lab-canvas') }));
det(806, () => {
  const html = read('index.html');
  return { buttons: ['btn-fire', 'btn-ads', 'btn-reload'].map((id) => ({ id, found: html.includes(id) })) };
});
det(807, () => ({ touchStick: read('index.html').includes('touch-stick') && read('style.css').includes('touch-stick') }));
det(808, () => ({ hud: /hudAmmo/.test(read('src/ui.js')) }));
det(809, () => ({ crosshair: /crosshair|прицел/i.test(read('style.css')) }));
det(810, () => {
  game.camera.aspect = 390 / 844;
  try { ui.frame(game, 1 / 60); } catch (e) { return { error: e.message }; }
  game.camera.aspect = 16 / 9;
  return { ok: true };
});
det(811, () => {
  const bad = [];
  const html = read('index.html');
  if (/\ufffd/.test(html)) bad.push('битые символы в index.html');
  MODULES.forEach((m) => { if (/\ufffd/.test(read(`src/${m}.js`))) bad.push('битые символы в src/' + m); });
  return { bad };
});
det(812, () => ({ audio: !!game.audio }));
det(813, () => {
  try { game.audio && game.audio.gunshot('rifle', 0, 0, 1); } catch (e) { return { error: e.message }; }
  return { ok: true };
});
det(814, () => ({ volume: game.audio && game.audio.master !== undefined ? game.audio.master : 'n/a' }));
det(815, () => ({ toasts: elementCache.get('toasts') ? elementCache.get('toasts').children.length : 0 }));
det(816, () => ({ offline: !/https?:\/\//.test(read('index.html').replace(/https:\/\/(github|m98978672)[^\s"']*/g, '')) }));
det(817, () => ({ fonts: !/fonts\.googleapis/.test(read('index.html')) }));
det(818, () => {
  const src = read('src/game.js');
  const help = read('src/ui.js');
  return { keys: /KeyR|перезарядк/i.test(help) };
});
det(819, () => {
  game.startMission(0);
  game.pause();
  return { state: game.state };
});

/* =========================== 9xx: УСТОЙЧИВОСТЬ ========================= */
det(900, () => {
  game.startMission(0);
  simulate(game, 3, { forward: 0.6 });
  const P = game.player;
  const bad = ['x', 'z', 'y', 'yaw', 'pitch', 'hp', 'stamina', 'vx', 'vz'].filter((k) => !Number.isFinite(P[k]));
  const badE = game.enemies.filter((e) => !Number.isFinite(e.x) || !Number.isFinite(e.z)).length;
  return { bad, badEnemies: badE };
});
det(901, () => {
  const f = game.frameTime;
  return { frameTime: f, bad: f !== undefined && !Number.isFinite(f) };
});
det(902, () => ({ particles: game.fx.counts ? game.fx.counts.particles : 0, pools: game.fx.sparks ? game.fx.sparks.count : 0 }));
det(903, () => ({ shards: game.fx.shards ? game.fx.shards.length : 0, bad: (game.fx.shards ? game.fx.shards.length : 0) > 400 }));
det(904, () => {
  game.startMission(0);
  game.kills = 5; game.missionTimer = 30;
  game.startMission(0);
  return { kills: game.kills, timer: game.missionTimer };
});
det(905, () => {
  const before = game.scene.children.length;
  game.startMission(0);
  game.startMission(0);
  const after = game.scene.children.length;
  return { before, after, growth: after - before };
});
det(906, () => ({ geometries: game.renderer.info.memory.geometries }));
det(907, () => {
  const bad = [];
  for (let i = 0; i < D.MISSIONS.length; i++) {
    try {
      game.startMission(i);
      simulate(game, 0.5, { forward: 0.2 });
      if (game.state === 'playing' || game.state === 'won' || game.state === 'dead') continue;
      bad.push(`${i}: состояние ${game.state}`);
    } catch (e) { bad.push(`${i}: ${e.message}`); }
  }
  return { bad };
});
det(908, () => {
  const bad = [];
  for (let i = 0; i < D.MISSIONS.length; i++) {
    try { game.startMission(i); } catch (e) { bad.push(`${i}: ${e.message}`); continue; }
    if (!game.enemies.length && D.MISSIONS[i].type !== 'boss') bad.push(`${i}: нет врагов`);
  }
  return { bad };
});
det(909, () => {
  game.startMission(3);   // волны
  const t0 = Date.now();
  simulate(game, 8, { forward: 0.3 });
  return { ms: Date.now() - t0, wave: game.waveIndex };
});
det(910, () => {
  game.startMission(2);
  const t0 = Date.now();
  simulate(game, 2, {});
  const ms = Date.now() - t0;
  return { ms, perFrame: ms / 120, bad: ms / 120 > 40 };
});
det(911, () => {
  game.startMission(0);
  simulate(game, 4, {});
  const t0 = Date.now();
  for (let i = 0; i < 120; i++) SH2.ai.commanderTick(game, 1 / 60);
  return { ms: Date.now() - t0 };
});
det(912, () => {
  game.startMission(0);
  simulate(game, 2, {});
  return { enemies: game.enemies.length };
});
det(913, () => {
  game.startMission(0);
  const a = game.enemies.length;
  game.startMission(1);
  const b = game.enemies.length;
  return { m1: a, m2: b };
});
det(914, () => {
  game.startMission(0);
  const before = game.enemies.length;
  game.startMission(0);
  return { before, after: game.enemies.length };
});
det(915, () => {
  /* большие dt не должны ломать физику */
  game.startMission(0);
  simulate(game, 0.5, { dt: 0.25, forward: 1 });
  return { x: game.player.x, z: game.player.z };
});
det(916, () => {
  game.startMission(0);
  const x0 = game.player.x;
  try { game.player.update(0, { yaw: 0, forward: 1, strafe: 0, sprint: false, crouch: false, ads: false }, game); }
  catch (e) { return { error: e.message }; }
  return { moved: game.player.x !== x0 };
});
det(917, () => {
  game.startMission(0);
  const x0 = game.player.x, z0 = game.player.z;
  game.player.update(-0.5, { yaw: 0, forward: 1, strafe: 0, sprint: false, crouch: false, ads: false }, game);
  return { moved: game.player.x !== x0 || game.player.z !== z0 };
});
det(918, () => ({ pools: Object.keys(game.fx).filter((k) => game.fx[k] && game.fx[k].parts) }));

/* ============================ ОБЕЗЬЯНИЙ ПРОГОН =========================
   Случайные миссии, случайный ввод, случайные dt: так ловятся состояния,
   до которых руками не добраться (стрельба во все стороны, бег в стену,
   прыжки в текстуру, рестарт посреди боя). Сид фиксируется флагом --seed,
   поэтому любой найденный баг воспроизводим командой из отчёта. */
function makeRng(seed) {
  let s = seed >>> 0 || 1;
  return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
}
const monkeySeed = Number(opt('--seed', 7));
const monkeyRuns = Number(opt('--monkey', 3));
det(919, () => {
  const rng = makeRng(monkeySeed);
  const bad = [];
  for (let run = 0; run < monkeyRuns; run++) {
    const mission = Math.floor(rng() * D.MISSIONS.length);
    try {
      game.startMission(mission);
      const dirs = [1, -1];
      for (let i = 0; i < 240; i++) {
        const dt = rng() < 0.08 ? 0.2 : 1 / 60;
        game.input.forward = rng() < 0.6 ? 1 : 0;
        game.input.strafe = dirs[Math.floor(rng() * 2)] * (rng() < 0.5 ? 1 : 0);
        game.input.sprint = rng() < 0.3;
        game.input.ads = rng() < 0.3;
        game.player.yaw += (rng() - 0.5) * 0.6;
        game.player.pitch = Math.max(-1.4, Math.min(1.4, game.player.pitch + (rng() - 0.5) * 0.3));
        game.player.update(dt, { yaw: game.player.yaw, forward: game.input.forward, strafe: game.input.strafe,
          sprint: game.input.sprint, crouch: rng() < 0.2, ads: game.input.ads }, game);
        if (rng() < 0.5) { game.player.fireTimer = 0; game.player.ammoInMag = game.player.weapon.mag; game.player.fire(game.time); }
        if (rng() < 0.05) { game.player.startReload(); }
        if (rng() < 0.05) game.player.jump();
        if (rng() < 0.03) game.player.selectSlot(Math.floor(rng() * game.player.slots.length));
        game.combat.update(dt);
        game.fx.update(dt);
        for (const e of game.enemies) e.update(dt, game);
        SH2.ai.commanderTick(game, dt);
        game.checkMissionProgress(dt);
        ui.frame(game, dt);
      }
      const P = game.player;
      const nonFinite = ['x', 'z', 'y', 'yaw', 'pitch', 'hp', 'stamina'].filter((k) => !Number.isFinite(P[k]));
      if (nonFinite.length) bad.push(`прогон ${run} (миссия ${mission + 1}): NaN в ${nonFinite.join(', ')}`);
      if (game.enemies.some((e) => !Number.isFinite(e.x) || !Number.isFinite(e.z))) bad.push(`прогон ${run}: NaN у боевиков`);
      if (game.combat.bullets.length > 500) bad.push(`прогон ${run}: пуль в мире ${game.combat.bullets.length}`);
      if (game.combat.grenades.length > 40) bad.push(`прогон ${run}: гранат ${game.combat.grenades.length}`);
    } catch (e) {
      bad.push(`прогон ${run} (миссия ${mission + 1}): ${e.message}`);
    }
  }
  return { bad, seed: monkeySeed, runs: monkeyRuns };
});

/* Самопроверка таблицы: все 1000 кодов существуют, категории замкнуты,
   название у каждого кода своё, и ни один детектор не висит на дырке. */
det(999, () => {
  const bad = [];
  if (BC.CODES.length !== 1000) bad.push('кодов ' + BC.CODES.length);
  const seen = new Set();
  BC.CODES.forEach((c) => {
    const key = c.category + '|' + c.title;
    if (seen.has(key)) bad.push('дубль ' + c.id);
    seen.add(key);
    if (!c.title || !c.category) bad.push('пустая строка ' + c.id);
  });
  for (let i = 0; i < 1000; i++) if (!BC.BY_CODE[i]) bad.push('нет кода ' + i);
  BC.CODES.forEach((c) => { if (c.detector && typeof c.detector !== 'function') bad.push('детектор не функция: ' + c.id); });
  return { bad: bad.slice(0, 8), detectors: BC.detectors(), total: BC.TOTAL };
});

/* =================== 920–929: бот-диагност внутри игры ================== */
det(920, () => {
  const bad = [];
  if (!SH2.gamebot || !SH2.gamebot.GameBot) bad.push('нет модуля src/gamebot.js');
  if (!game.bot) bad.push('бот не подключён к живой игре');
  else if (!game.bot.attached) bad.push('бот не подписан на кадр');
  const html = read('index.html');
  if (!/src\/gamebot\.js/.test(html)) bad.push('index.html не подключает src/gamebot.js');
  if (!/new SH2\.gamebot\.GameBot/.test(html)) bad.push('бот не создаётся при запуске игры');
  return { bad };
});
det(921, () => {
  const bad = [];
  if (!SH2.bugcodes || SH2.bugcodes.TOTAL !== 1000) bad.push('таблица кодов неполная');
  const bot = game.bot;
  if (!bot || !bot.lookup) bad.push('в игре нет поиска по коду');
  return { bad };
});
det(922, () => {
  /* Поиск по коду в панели бота: вводим реальный номер и смотрим ответ. */
  const bot = game.bot;
  const bad = [];
  if (!bot) return { bad: ['нет бота'] };
  const ui = sandbox.document.getElementById('bot-search');
  const answer = sandbox.document.getElementById('bot-answer');
  if (!ui || !answer) return { bad: ['нет поля поиска или ответа в разметке'] };
  ui.value = '421';
  bot.lookup();
  const text = String(answer.textContent || '');
  if (!/Игрок и управление/.test(text)) bad.push('поиск по 421 не показал категорию: ' + text);
  if (!/стик/.test(text)) bad.push('поиск по 421 не показал проверку: ' + text);
  ui.value = '999';
  bot.lookup();
  if (!/Устойчивость/.test(String(answer.textContent))) bad.push('поиск по 999 не показал категорию');
  return { bad };
});
det(923, () => {
  /* Пассивный режим обязан поймать «намерение есть, движения нет». Подсовываем
     боту ситуацию: игрок жив, клавиша нажата, а тело не двигается. */
  const bot = game.bot;
  if (!bot) return { bad: ['нет бота'] };
  const bad = [];
  const keepState = game.state, keepFound = bot.found.length;
  const P = game.player;
  const keep = { x: P.x, z: P.z };
  game.state = 'playing';
  game.keys.KeyW = true;
  bot.watch.lastX = P.x; bot.watch.lastZ = P.z;
  bot.watch.stillFrames = 60;
  bot.tick(1 / 60, 1);
  const caught = bot.found.some((f) => f.code === 420 || f.code === 421);
  if (!caught) bad.push('пассивный режим не заметил, что игрок стоит при нажатой клавише');
  /* Убираем искусственную находку, чтобы не портить отчёт. */
  for (let i = bot.found.length - 1; i >= 0; i--) {
    if (bot.found[i].code === 420 || bot.found[i].code === 421) bot.found.splice(i, 1);
  }
  bot.badges = bot.found.length;
  game.keys.KeyW = false;
  P.x = keep.x; P.z = keep.z;
  game.state = keepState;
  if (bot.found.length !== keepFound) bad.push('после проверки в находках остался мусор');
  bot.watch.stillFrames = 0;
  return { bad };
});
det(924, () => {
  /* Прогон бота не должен менять мир: снимаем состояние до и после. */
  const bot = game.bot;
  if (!bot) return { bad: ['нет бота'] };
  const a = { x: game.player.x, z: game.player.z, hp: game.player.hp, stamina: game.player.stamina };
  bot.busy = false;
  bot.runNow();
  const bad = [];
  const drift = Math.hypot(game.player.x - a.x, game.player.z - a.z);
  if (drift > 0.001) bad.push(`игрок сместился на ${drift.toFixed(3)} м`);
  if (Math.abs(game.player.hp - a.hp) > 0.001) bad.push('здоровье изменилось');
  if (Math.abs(game.player.stamina - a.stamina) > 0.001) bad.push('выносливость изменилась');
  if (!bot.lastRun) bad.push('прогон не оставил отчёт');
  /* В игре прогон идёт порциями по кадрам (requestAnimationFrame), поэтому
     стенное время здесь ничего не говорит: в headless RAF нет, и весь набор
     исполняется сразу. Смотрим размер порции в коде, а не секундомер. */
  const pumpSrc = String(bot.pump || '');
  if (!/requestAnimationFrame/.test(pumpSrc)) bad.push('прогон не разбит на кадры');
  if (!/< 8\b/.test(pumpSrc)) bad.push('порция прогона не ограничена по времени');
  return { bad, checks: bot.checks, ms: bot.lastRun ? bot.lastRun.ms : 0 };
});
det(925, () => {
  const bot = game.bot;
  if (!bot) return { bad: ['нет бота'] };
  const text = bot.reportText();
  const bad = [];
  if (!/таблица кодов: 1000/.test(text)) bad.push('в отчёте нет таблицы кодов');
  if (!/проверок выполнено/.test(text)) bad.push('в отчёте нет числа проверок');
  if (!/Бот-диагност/.test(text)) bad.push('отчёт не подписан');
  if (text.length < 80) bad.push('отчёт пустой');
  return { bad, bytes: text.length };
});
det(926, () => {
  const need = ['bot-panel', 'bot-list', 'bot-summary', 'bot-search', 'bot-answer',
    'bot-run', 'bot-copy', 'bot-save', 'bot-clear', 'bot-close', 'bot-badge'];
  const html = read('index.html');
  const miss = need.filter((id) => !html.includes('id="' + id + '"'));
  const css = read('style.css');
  const noStyle = ['bot-panel', 'bot-row', 'bot-code'].filter((c) => !css.includes('#' + c) && !css.includes('.' + c));
  const bad = [];
  if (miss.length) bad.push('нет элементов: ' + miss.join(', '));
  if (noStyle.length) bad.push('нет стилей: ' + noStyle.join(', '));
  if (!/KeyB/.test(read('src/game.js'))) bad.push('клавиша B не открывает бота');
  return { bad };
});
det(927, () => {
  /* Панель рисуется быстро и не теряет находки при перерисовке. */
  const bot = game.bot;
  if (!bot) return { bad: ['нет бота'] };
  const n = bot.found.length;
  const t0 = Date.now();
  for (let i = 0; i < 20; i++) bot.render();
  const ms = (Date.now() - t0) / 20;
  const bad = [];
  if (bot.found.length !== n) bad.push('перерисовка меняет находки');
  if (ms > 8) bad.push(`перерисовка ${ms.toFixed(1)} мс`);
  return { bad, ms: +ms.toFixed(2) };
});
det(928, () => {
  const html = read('index.html');
  const bad = [];
  if (!/id="bot-btn-hud"/.test(html)) bad.push('нет кнопки бота в HUD');
  if (!/bot-btn-hud/.test(read('style.css'))) bad.push('кнопка бота без стилей');
  if (!/media \(max-width: 700px\)[\s\S]{0,120}bot-btn-hud/.test(read('style.css'))) {
    bad.push('кнопка не поджата на телефоне');
  }
  return { bad };
});
det(929, () => {
  /* Каждая находка обязана ссылаться на существующий код и категорию. */
  const bot = game.bot;
  if (!bot) return { bad: ['нет бота'] };
  const bad = [];
  bot.found.forEach((f) => {
    if (!SH2.bugcodes.BY_CODE[f.code]) bad.push('код ' + f.code + ' вне таблицы');
    if (!f.category || f.category === '—') bad.push('у находки ' + f.code + ' нет категории');
    if (!f.title) bad.push('у находки ' + f.code + ' нет названия проверки');
  });
  return { bad };
});
det(430, () => {
  /* Направление стика: «вправо» на экране — это −X при yaw=0, «вперёд» — +Z.
     Ошибка знака здесь ощущается как зеркальное управление. */
  const bot = game.bot;
  const bad = [];
  const keepState = game.state;
  game.state = 'playing';
  game.startMission(0);
  game.state = 'playing';
  game.locked = true;
  game.enemies.slice().forEach((e) => e.dispose(game.scene));
  game.enemies.length = 0;
  const P = game.player;
  Object.keys(game.keys).forEach((k) => { game.keys[k] = false; });
  P.yaw = 0;
  const x0 = P.x, z0 = P.z;
  game.touch.active = true; game.touch.stickActive = true;
  game.touch.sx = 1; game.touch.sz = 0; game.touch.txs = 1; game.touch.tzs = 0;
  for (let i = 0; i < 60 && P.alive; i++) { P.hp = P.maxHp; game.update(1 / 60); }
  const dx = P.x - x0;
  if (!(dx < -0.8)) bad.push(`стик «вправо» увёл в ${dx.toFixed(2)} м по X`);
  game.touch.stickActive = false; game.touch.active = false;
  game.touch.sx = 0; game.touch.sz = 0; game.touch.txs = 0; game.touch.tzs = 0;
  game.state = keepState;
  return { bad, dx: +dx.toFixed(2), bot: !!bot };
});
det(431, () => {
  /* Отпустили стик — игрок останавливается: инерция не должна нести тело. */
  game.startMission(0);
  game.state = 'playing';
  game.enemies.slice().forEach((e) => e.dispose(game.scene));
  game.enemies.length = 0;
  const P = game.player;
  Object.keys(game.keys).forEach((k) => { game.keys[k] = false; });
  P.yaw = 0;
  game.touch.active = true; game.touch.stickActive = true;
  game.touch.sx = 0; game.touch.sz = 1; game.touch.txs = 0; game.touch.tzs = 1;
  for (let i = 0; i < 60; i++) { P.hp = P.maxHp; game.update(1 / 60); }
  game.touch.stickActive = false; game.touch.txs = 0; game.touch.tzs = 0;
  const stop = { x: P.x, z: P.z };
  for (let i = 0; i < 60; i++) { P.hp = P.maxHp; game.update(1 / 60); }
  const drift = Math.hypot(P.x - stop.x, P.z - stop.z);
  game.touch.active = false;
  return { drift: +drift.toFixed(2), bad: drift > 0.5 ? [`после отпускания проехал ${drift.toFixed(2)} м`] : [] };
});

det(432, () => {
  /* Тач-управление обязано включаться по любому признаку пальца. На webview
     `pointer: coarse` не срабатывает — и тогда стика нет вовсе. */
  const src = read('src/game.js');
  const bad = [];
  if (!/ontouchstart' in root/.test(src)) bad.push('нет проверки ontouchstart');
  if (!/maxTouchPoints/.test(src)) bad.push('нет проверки maxTouchPoints');
  return { bad, touchEnabled: !!(game.touch && game.touch.active) };
});
det(433, () => {
  /* Кнопки тача должны дублировать игровые действия, а не быть декорацией:
     у каждой кнопки из разметки есть обработчик в bindTouch. */
  const src = read('src/game.js');
  const html = read('index.html');
  const ids = (html.match(/id="t-[a-z]+"/g) || []).map((x) => x.slice(4, -1));
  const unbound = ids.filter((id) => !src.includes("hook('" + id + "'"));
  return { buttons: ids.length, bad: unbound.length ? ['без обработчика: ' + unbound.join(', ')] : [] };
});

/* ============ 434–437: «палец попадает в кнопку, а не в стик» ============
   Настоящая причина «ходьба не работает» на телефоне: левый нижний угол был
   заставлен кнопками (ПРИЦЕЛ/ПЕРЕЗАРЯДКА/ПРИСЕД/БЕГ/ПРЫЖОК). Кнопка ловит
   touchstart, делает preventDefault — и канвас со стиком касания не видит.
   Палец «ходит» по кнопкам, персонаж стоит. */
const TOUCH_BUTTONS = ['t-ads', 't-reload', 't-crouch', 't-jump', 't-sprint', 't-grenade', 't-fire'];

/* Селектор для кнопки: в разметке у неё id и класс (tc tl), а стили — по
   классу. Берём класс из index.html, чтобы проверка смотрела настоящую CSS. */
function selectorFor(id) {
  const html = read('index.html');
  const m = html.match(new RegExp('id="' + id + '"[^>]*class="([^"]+)"'));
  if (!m) return null;
  return '.' + m[1].trim().split(/\s+/).join('.');
}
function cssBlock(sel) {
  const css = read('style.css');
  const esc = sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = css.match(new RegExp(esc + '\\s*\\{([^}]*)\\}'));
  return m ? m[1] : '';
}
function cssRect(sel, W, H) {
  const b = cssBlock(sel);
  if (!b) return null;
  const num = (k, d) => {
    const m = b.match(new RegExp(k + ':\\s*(-?\\d+(?:\\.\\d+)?)px'));
    return m ? parseFloat(m[1]) : d;
  };
  const w = num('width', 64), h = num('height', 64);
  const left = b.includes('left:') ? num('left', 0) : (b.includes('right:') ? W - num('right', 0) - w : 0);
  const top = b.includes('top:') ? num('top', 0) : (b.includes('bottom:') ? H - num('bottom', 0) - h : 0);
  return { id: sel, x0: left, y0: top, x1: left + w, y1: top + h, w, h };
}
/* Геометрия стика повторяет bindTouch: левые 45% ширины и весь низ. */
function stickZone(W, H) {
  return { x0: 0, x1: W * 0.45, y0: H * 0.42, y1: H };
}
function overlaps(a, b) {
  return a.x0 < b.x1 - 0.5 && a.x1 > b.x0 + 0.5 && a.y0 < b.y1 - 0.5 && a.y1 > b.y0 + 0.5;
}

det(434, () => {
  /* Кнопки не должны стоять в зоне стика. Проверяем на трёх реальных
     размерах экрана: узкий телефон, обычный телефон, планшет. */
  const screens = [[360, 780], [390, 844], [844, 390]];
  const bad = [];
  const report = [];
  screens.forEach(([W, H]) => {
    const zone = stickZone(W, H);
    TOUCH_BUTTONS.forEach((id) => {
      const sel = selectorFor(id);
      const r = sel ? cssRect(sel, W, H) : null;
      if (!r) { bad.push('нет стилей для #' + id); return; }
      if (overlaps(r, zone)) {
        bad.push(`${W}×${H}: #${id} лежит в зоне стика (${Math.round(r.x0)},${Math.round(r.y0)})`);
      }
    });
    report.push(`${W}×${H}: зона ${Math.round(zone.x1)}px`);
  });
  return { bad, report: report.join(' · ') };
});

det(435, () => {
  /* В зоне стика кнопки не только не должны стоять — там вообще не должно
     быть интерактивных элементов, иначе палец снова попадёт не туда. */
  const W = 390, H = 844;
  const zone = stickZone(W, H);
  const css = read('style.css');
  const pos = [...css.matchAll(/\.tc\.[a-z0-9]+\s*\{([^}]*)\}/g)].map((m) => m[0]);
  const bad = [];
  pos.forEach((block) => {
    const name = (block.match(/\.tc\.([a-z0-9]+)/) || [])[1];
    if (name !== 'tl4' && name !== 'tl5' && !/\.tc\.[a-z0-9]+\s*\{[^}]*left:/.test(block)) return;
  });
  /* Настоящая проверка — общая площадь: сумма площадей кнопок внутри зоны. */
  let area = 0;
  TOUCH_BUTTONS.forEach((id) => {
    const sel = selectorFor(id);
    const r = sel ? cssRect(sel, W, H) : null;
    if (!r) return;
    const x0 = Math.max(r.x0, zone.x0), x1 = Math.min(r.x1, zone.x1);
    const y0 = Math.max(r.y0, zone.y0), y1 = Math.min(r.y1, zone.y1);
    if (x1 > x0 && y1 > y0) area += (x1 - x0) * (y1 - y0);
  });
  if (area > 1) bad.push(`в зоне стика ${Math.round(area)} px² кнопок`);
  return { bad, area: Math.round(area) };
});

det(436, () => {
  /* Путь события целиком: палец в зоне стика → touchstart на канвасе →
     touchmove → тело поехало. Это ловит и «кнопка съела касание», и потерю
     analog между вводом и физикой. */
  const canvas = getEl('game');
  const handlers = canvas._handlers || {};
  const bad = [];
  /* Обработчики на канвасе появляются только когда игра решила, что это
     тач-устройство. Заглушка сообщает maxTouchPoints=5, но bindTouch мог
     выйти раньше — тогда сами зовём его и смотрим, что он привяжет. */
  if (!game.touch || !game.touch.active) {
    game.touch = null;
    game.bindTouch();
  }
  ['touchstart', 'touchmove', 'touchend'].forEach((t) => {
    if (!handlers[t] || !handlers[t].length) bad.push('на канвасе нет обработчика ' + t);
  });
  if (!game.touch || !game.touch.active) bad.push('bindTouch не включил тач-режим при maxTouchPoints=5');
  if (bad.length) return { bad };
  const fire = (type, list) => {
    const e = {
      changedTouches: list.map((t) => ({ identifier: t.id, clientX: t.x, clientY: t.y })),
      preventDefault() {}
    };
    (handlers[type] || []).forEach((fn) => fn(e));
  };
  game.startMission(0);
  game.state = 'playing';
  game.locked = true;
  game.enemies.slice().forEach((e) => e.dispose(game.scene));
  game.enemies.length = 0;
  const P = game.player;
  Object.keys(game.keys).forEach((k) => { game.keys[k] = false; });
  P.yaw = 0;
  const x0 = P.x, z0 = P.z;
  /* касание в левом нижнем углу — ровно туда, куда кладёт палец человек */
  fire('touchstart', [{ id: 1, x: 70, y: 760 }]);
  fire('touchmove', [{ id: 1, x: 70, y: 640 }]);
  for (let i = 0; i < 120; i++) { P.hp = P.maxHp; game.update(1 / 60); }
  const d = Math.hypot(P.x - x0, P.z - z0);
  fire('touchend', [{ id: 1, x: 70, y: 640 }]);
  if (!game.touch || !game.touch.active) bad.push('тач-управление не включилось');
  if (!(d > 2)) bad.push(`палец в левом нижнем углу сдвинул на ${d.toFixed(2)} м`);
  return { bad, moved: +d.toFixed(2) };
});

det(437, () => {
  /* Игра объявляет, что понимает жесты: без touch-action браузер сам
     скроллит/зумит страницу и гасит touchmove. */
  const css = read('style.css');
  const bad = [];
  if (!/touch-action/.test(css)) bad.push('в style.css нет touch-action');
  if (!/#game[^{]*\{[^}]*touch-action/.test(css) && !/canvas[^{]*\{[^}]*touch-action/.test(css)) {
    bad.push('touch-action не задан для канваса');
  }
  const html = read('index.html');
  if (!/user-scalable=no/.test(html)) bad.push('нет запрета масштабирования');
  return { bad };
});

det(438, () => {
  /* Кнопки не должны перекрывать друг друга: на старой раскладке ПРЫЖОК
     стоял вплотную к ПЕРЕЗАРЯДКЕ, и часть нажатий уходила «не туда». */
  const W = 390, H = 844;
  const rects = TOUCH_BUTTONS.map((id) => {
    const sel = selectorFor(id);
    return { id, r: sel ? cssRect(sel, W, H) : null };
  }).filter((x) => x.r);
  const bad = [];
  for (let i = 0; i < rects.length; i++) {
    for (let j = i + 1; j < rects.length; j++) {
      if (overlaps(rects[i].r, rects[j].r)) bad.push(rects[i].id + ' × ' + rects[j].id);
    }
    const r = rects[i].r;
    if (r.x1 > W + 1 || r.y1 > H + 1 || r.x0 < -1 || r.y0 < -1) {
      bad.push(rects[i].id + ' выходит за экран');
    }
  }
  return { bad, buttons: rects.length };
});

/* ============ 930–934: игру можно ПРОЙТИ, а не только запустить =========
   Проверки 907/908 запускают миссии, но не доводят их до победы. Здесь бот
   играет каждую миссию до конца: цели выполняются так, как их выполнил бы
   игрок (убить охрану, взорвать груз, дойти до эвакуации, продержаться),
   и отчёт говорит, доходит ли дело до победы. Именно так ловится миссия,
   которую нельзя закончить: цель висит, состояние остаётся 'playing'. */
function playMissionToEnd(idx, maxSeconds) {
  game.startMission(idx);
  const m = D.MISSIONS[idx];
  const P = game.player;
  const limit = Math.round((maxSeconds || 400) * 60);
  for (let f = 0; f < limit; f++) {
    /* «игрок не умирает» — проверяем выполнимость целей, а не стрельбу. */
    P.hp = P.maxHp; P.armor = 40;
    if (m.type === 'eliminate' || m.type === 'boss' || m.type === 'destroy' || m.type === 'extract') {
      for (const e of game.enemies) if (e.alive) e.hit(9999, game, {});
      if (m.type === 'destroy') {
        game.objectives.forEach((o) => { if (!o.done && o.mesh) game.damageObjective(o.x, o.z, 200); });
      }
      if (m.type === 'extract') {
        game.kills = Math.max(game.kills, 99);
        if (game.extract) { P.x = game.extract.x; P.z = game.extract.z; }
      }
    }
    game.update(1 / 60);
    if (game.state !== 'playing') break;
  }
  return {
    state: game.state,
    time: +game.missionTimer.toFixed(1),
    objectives: game.objectives.map((o) => `${o.id}:${o.current}/${o.max}${o.done ? '✓' : '✗'}`).join(' ')
  };
}

det(930, () => {
  /* Каждая миссия доходит до победы. Победа для последней — 'complete'. */
  const bad = [];
  const report = [];
  for (let i = 0; i < D.MISSIONS.length; i++) {
    const r = playMissionToEnd(i);
    const won = r.state === 'won' || r.state === 'complete';
    report.push(`м${i + 1}:${r.state} ${r.time}с`);
    if (!won) bad.push(`миссия ${i + 1}: состояние «${r.state}» за ${r.time} с (${r.objectives})`);
  }
  return { bad, report: report.join(' · ') };
});

det(931, () => {
  /* Ни одна цель не должна остаться невыполнимой после того, как все условия
     выполнены: иначе миссия висит. */
  const bad = [];
  game.startMission(2);                     // «Караван»: ящики + охрана
  const boxes = game.objectives.filter((o) => o.id !== 'killall');
  for (const e of game.enemies) if (e.alive) e.hit(9999, game, {});
  game.update(1 / 60);
  boxes.forEach((o) => game.damageObjective(o.x, o.z, 200));
  for (let i = 0; i < 40; i++) { game.player.hp = game.player.maxHp; game.update(1 / 60); }
  const stuck = game.objectives.filter((o) => !o.done);
  if (stuck.length) {
    bad.push('после зачистки не закрылись: ' + stuck.map((o) => `${o.id} ${o.current}/${o.max}`).join(', '));
  }
  return { bad, state: game.state };
});

det(932, () => {
  /* Счётчик охраны совпадает с числом бойцов на карте. Раньше max брался из
     данных, а спавн мог поставить меньше — цель становилась невыполнимой. */
  const bad = [];
  for (let i = 0; i < D.MISSIONS.length; i++) {
    game.startMission(i);
    const killAll = game.objectives.find((o) => o.id === 'killall');
    if (!killAll) continue;
    const alive = game.enemies.filter((e) => e.alive).length;
    if (killAll.max > alive) bad.push(`миссия ${i + 1}: цель ${killAll.max}, бойцов ${alive}`);
  }
  return { bad };
});

det(933, () => {
  /* Победа начисляет очки и открывает следующую миссию — прогресс кампании. */
  const bad = [];
  game.startMission(0);
  const score0 = game.score;
  playMissionToEnd(0);
  if (!(game.score > score0)) bad.push('за победу не начислены очки');
  if (game.state !== 'won') bad.push('первая миссия не завершилась победой: ' + game.state);
  return { bad, score: game.score };
});

det(935, () => {
  /* Необязательная цель не должна блокировать победу. «Порт» (эвакуация):
     игрок дошёл до точки, никого не убив. Раньше optional игнорировался,
     и миссия оставалась в 'playing' навсегда. */
  const bad = [];
  let checked = 0;
  for (let i = 0; i < D.MISSIONS.length; i++) {
    game.startMission(i);
    const opt = game.objectives.filter((o) => o.optional);
    if (!opt.length) continue;
    checked++;
    const P = game.player;
    /* обнуляем все ОБЯЗАТЕЛЬНЫЕ цели по-настоящему, необязательные — нет */
    game.objectives.forEach((o) => { if (!o.optional) { o.current = o.max; o.done = true; } });
    game.update(1 / 60);
    if (game.state !== 'won' && game.state !== 'complete') {
      bad.push(`миссия ${i + 1}: optional-цель держит миссию (${game.state})`);
    }
  }
  return { bad, missionsWithOptional: checked };
});

/* ============ 936–943: новый контент (меши / звуки / механики) ========= */
det(936, () => {
  const P = SH2.meshpack;
  if (!P || P.COUNT !== 1000) return 'пакет моделей не загружен';
  const bad = [];
  /* память не должна расти: все 1000 моделей прогоняются и освобождаются */
  const before = game.renderer && game.renderer.info ? game.renderer.info.memory.geometries : 0;
  for (let i = 0; i < P.COUNT; i++) {
    const r = P.probe(i);
    if (!r.meshes) bad.push(i + ': нет мешей');
    else if (r.tris < 4) bad.push(i + ': ' + r.tris + ' треугольников');
    else if (!(r.radius > 0)) bad.push(i + ': радиус ' + r.radius);
  }
  const after = game.renderer && game.renderer.info ? game.renderer.info.memory.geometries : 0;
  if (before && after > before + 4) return `после обхода 1000 моделей геометрий ${before} → ${after} (течёт память)`;
  return bad.length ? bad.slice(0, 3).join(' | ') : null;
});

det(937, () => {
  /* смотрим ПЕРВЫЙ построенный экземпляр: другие детекторы могли пересобрать
     поле, и проверка «сколько просили» должна относиться к игре, а не к ним */
  const f = (game._fieldBuilt || game.meshfield);
  if (!f) return 'поле мешей не построено при старте миссии';
  const st = f.stats();
  /* контракт модуля: DEFAULTS.count обязан быть 100 000, а поле — столько и
     строить. Проверяем оба, иначе правка одной цифры в игре проходила молча. */
  const want = (game.settings && game.settings.meshfield) ||
    (SH2.meshfield.DEFAULTS ? SH2.meshfield.DEFAULTS.count : 100000);
  if (want !== 100000) return 'поле настраивается на ' + want + ' вместо 100 000';
  if (st.requested !== want) return 'поле собрано на ' + st.requested + ' вместо ' + want;
  /* И поле ИГРЫ тоже: детектор обязан падать, если игру настроили на меньшее. */
  if (game.meshfield && game.meshfield !== f) {
    const live = game.meshfield.stats();
    if (live.requested !== 100000) return 'поле игры собрано на ' + live.requested;
  }
  if (st.meshes !== 100000) return 'мешей в поле ' + st.meshes + ' вместо 100 000';
  if (st.individual < 100000) return 'объектов меньше, чем мешей: ' + st.individual;
  return null;
});

det(938, () => {
  const f = game.meshfield;
  if (!f) return 'нет поля мешей';
  const st = f.stats();
  const B = (SH2.perf && SH2.perf.BUDGETS) || {};
  const maxBuckets = B.fieldBuckets || 40;
  const maxField = B.fieldDrawCalls || 200;
  const maxTris = B.fieldTriangles || 2600000;
  if (!(st.fieldDrawCalls > 0)) return 'поле не сообщает, сколько стоит в кадре';
  if (st.drawCalls > maxBuckets) return 'корзин поля ' + st.drawCalls + ' > ' + maxBuckets;
  if (st.fieldDrawCalls > maxField) return 'поле стоит ' + st.fieldDrawCalls + ' draw call > ' + maxField;
  if (st.triangles > maxTris) return 'треугольников в поле ' + st.triangles + ' > ' + maxTris;
  if (!(st.lodTris && st.lodTris.length === 3)) return 'нет разбиения по LOD';
  if (!(st.lodTris[0] > 0)) return 'ближний пояс LOD пуст';
  return null;
});

det(939, () => {
  const f = game.meshfield;
  if (!f) return 'нет поля мешей';
  const bad = [];
  [0, 1, 12345, 54321, 99999].forEach((i) => {
    const m = f.matrixAt(i);
    if (!m) return bad.push(i + ': нет матрицы');
    if (!isFinite(m.elements[12]) || !isFinite(m.elements[14])) bad.push(i + ': матрица не число');
    if (Math.hypot(m.elements[12], m.elements[14]) < 20) bad.push(i + ': меш внутри игровой зоны');
  });
  if (f.matrixAt(100000)) bad.push('за границей поля вернулась матрица');
  return bad.length ? bad.slice(0, 3).join(' | ') : null;
});

det(940, () => {
  const SB = SH2.soundbank;
  if (!SB || SB.COUNT !== 250) return 'банк звуков не загружен';
  const bad = [];
  for (let i = 0; i < SB.COUNT; i++) {
    const an = SB.analyse(SB.render(i, 12000), 12000);
    if (!(an.rms > 0.005)) bad.push(SB.describe(i).id + ': тишина');
    else if (an.peak > 1.001) bad.push(SB.describe(i).id + ': клиппинг');
  }
  return bad.length ? bad.slice(0, 3).join(' | ') : null;
});

det(941, () => {
  const SB = SH2.soundbank;
  if (!SB) return 'нет банка звуков';
  if (!game.soundbank) return 'у игры нет банка звуков';
  const src = game.soundbank.play(3, 0, 0, 0.5);
  if (!game.soundbank.lastPlayed || game.soundbank.lastPlayed.index !== 3) return 'звук не отмечен как проигранный';
  const A = game.audio;
  if (A && A.ctx && A.enabled && !src) return 'WebAudio не создал источник';
  return null;
});

det(942, () => {
  const M = SH2.mechanics;
  if (!M || M.COUNT !== 250) return 'реестр механик не загружен';
  const base = M.registry.mods();
  const dmg = base.damage;
  const bad = [];
  M.enable('damage-10', true);
  if (!(M.registry.mods().damage > dmg)) bad.push('урон не вырос');
  M.enable('damage-10', false);
  if (M.registry.mods().damage !== dmg) bad.push('урон не вернулся');
  /* каждое правило либо меняет числа, либо подписано на событие */
  const stub = { score: 0, player: { alive: true, hp: 1, maxHp: 10 }, mechRng: () => 0.001,
    soundbank: { play() { return {}; } }, meshfield: { buildReal() { return null; } },
    scene: {}, level: { map: { fog: 1 }, sun: { intensity: 1 } } };
  /* База сравнения — состояние БЕЗ этого правила. Иначе механики, включённые
     по умолчанию (CORE), выглядели бы «без эффекта»: они уже в базе. */
  const enabledNow = M.active();
  M.list().forEach((e) => {
    const was = e.on;
    M.enable(e.id, true);
    enabledNow.forEach((id) => { if (id !== e.id) M.enable(id, true); });
    M.enable(e.id, false);
    const neutral = JSON.stringify(M.registry.mods());
    M.enable(e.id, true);
    const changed = JSON.stringify(M.registry.mods()) !== neutral;
    let fired = false;
    /* `mechRng` у критов решает вероятность: 0.001 < любого порога, поэтому
       крит обязан сработать на первом же событии */
    /* свежий игрок и НЕНУЛЕВОЙ счёт на каждое правило: вампиризм лечит только
       раненого, а «добыча» умножает только ненулевые очки — на нулях эффект
       невидим, и правило ошибочно попадало в «без эффекта» */
    const spy = { score: 100, player: { alive: true, hp: 10, maxHp: 100 }, mechRng: () => 0.001,
      soundbank: { play() { fired = true; return {}; } },
      meshfield: { buildReal() { fired = true; return null; } },
      scene: {}, level: { map: { fog: 1 }, sun: { intensity: 1 } } };
    ['beforeHit', 'kill', 'playerHurt', 'missionStart'].forEach((t) => {
      /* событие может изменить ПЕРЕДАННЫЕ данные (крит поднимает урон) —
         это тоже эффект правила, поэтому данные держим и сверяем */
      const data = { attacker: { hit() { fired = true; } }, damage: 1 };
      const out = M.emit(spy, t, data);
      if (out && (out.crit || out.damage > 1 || out.healed > 0)) fired = true;
    });
    /* погодные правила подменяют туман сцены — это тоже видимый эффект */
    if (spy.scene && spy.scene.fog) fired = true;
    if (spy.score !== 100 || spy.level.sun.intensity !== 1) fired = true;
    if (!changed && !fired) bad.push(e.id + ': без эффекта');
    /* вернуть исходное состояние и восстановить остальные правила */
    M.enable(e.id, was);
    enabledNow.forEach((id) => M.enable(id, true));
  });
  return bad.length ? bad.slice(0, 3).join(' | ') : null;
});

det(943, () => {
  if (!SH2.contentlab) return 'нет лаборатории контента';
  if (root.document && root.document.getElementById && !root.document.getElementById('scr-content')) {
    return 'в разметке нет экрана лаборатории';
  }
  const lab = new SH2.contentlab.ContentLab(game, game.ui);
  const bad = [];
  ['models', 'sounds', 'mechanics', 'field'].forEach((tab) => {
    lab.tab = tab;
    try { lab.render(); } catch (e) { bad.push(tab + ': ' + e.message); }
    if (!lab.body || !lab.body.children.length) bad.push(tab + ': пустая вкладка');
  });
  return bad.length ? bad.join(' | ') : null;
});

det(934, () => {
  /* Смерть игрока заканчивает миссию поражением, а не подвешивает её. */
  game.startMission(0);
  game.damagePlayer(9999, null, 'bullet');
  return {
    state: game.state,
    bad: game.state === 'dead' ? [] : ['после смерти состояние ' + game.state]
  };
});

/* =============================== ОТЧЁТ ================================= */
function runDetector(rec) {
  if (!rec.detector) return null;
  const fn = rec.detector;
  let out;
  try { out = fn(); }
  catch (e) {
    emit(rec.code, false, 'исключение: ' + (e && e.message), (e && e.stack || '').split('\n').slice(1, 3).join(' | '));
    return false;
  }
  if (out === undefined || out === null) { emit(rec.code, true, '');
    return true; }
  if (out === true) { emit(rec.code, true, ''); return true; }
  /* Строка — это ПРИГОВОР, а не пройденная проверка. Раньше строка просто
     проваливалась мимо всех разборов ниже, и детектор, который нашёл баг и
     вернул «поле собрано на 99999», считался успешным. */
  if (typeof out === 'string') {
    if (out.length) { emit(rec.code, false, out, ''); return false; }
    emit(rec.code, true, '');
    return true;
  }

  /* Расшифровка результата: конкретные «плохие» поля → ошибка. */
  const decode = (res) => {
    if (res.bad === undefined) return null;
    if (Array.isArray(res.bad)) return res.bad.length ? res.bad.join('; ') : null;
    if (res.bad) return 'условие не выполнено';
    return null;
  };
  const problems = [];
  const direct = decode(out);
  if (direct) problems.push(direct);
  if (out.missing && out.missing.length) problems.push('нет: ' + out.missing.join(', '));
  if (out.dups && out.dups.length) problems.push('дубли: ' + out.dups.join(', '));
  if (out.broken && out.broken.length) problems.push('сломано: ' + out.broken.join(', '));
  if (out.thick && out.thick.length) problems.push('толстые коллайдеры: ' + out.thick.join(', '));
  if (out.wiped) problems.push('кадр затёрт: ' + out.wiped);
  if (out.hits && out.hits.length) problems.push('найдено: ' + out.hits.slice(0, 6).join(', '));
  if (out.claims && out.claims.length) problems.push(out.claims.join('; '));
  if (out.wrongTurns && out.wrongTurns.length) problems.push('камера сбита: ' + out.wrongTurns.length);
  if (out.stuck) problems.push('застряло: ' + out.stuck);
  if (out.near && out.near.length) problems.push('толпятся: ' + out.near.join(', '));
  if (out.out) problems.push('вне карты: ' + out.out);
  if (out.inside) problems.push('в геометрии: ' + out.inside);

  if (problems.length) { emit(rec.code, false, problems.join(' | '), ''); return false; }
  emit(rec.code, true, '');
  return true;
}

/* Привязываем детекторы, считаем статистику */
if (bootErrors.length) {
  bootErrors.forEach((e) => emit(0, false, `модуль ${e.file} не загрузился: ${e.error.message}`, ''));
}
const only = opt('--only', '');
/* --only 93 — диапазон; --only 9xx — вся категория; --only 937 — один код.
   Раньше третье условие было тавтологией (x === x), и фильтр не фильтровал. */
const onlyOk = (code) => {
  if (!only) return true;
  const s = String(code).padStart(3, '0');
  if (/^\dxx$/i.test(only)) return s[0] === only[0];
  return s.startsWith(only.replace(/x/gi, ''));
};

results.started = 1;
/* Порядок прогона фиксирован: детекторы опираются на живую игру, и код 300
   (запуск миссии) обязан выполниться раньше остальных. Если игру не удалось
   поднять — об этом честно скажем один раз, а не 90 раз в каждом детекторе. */
try { bootGame(); }
catch (e) { emit(0, false, 'игра не поднялась: ' + e.message, (e.stack || '').split('\n')[1] || ''); }
/* Арбитр для детекторов бота-диагноста: настоящий прогон его проверок по
   живой игре. Проверки обращаются к game.bot, иначе они честно скажут «бот не
   подключён». Ставим бота туда же, где он живёт в index.html. */
let inGameBot = null;
try {
  if (game && SH2.gamebot) {
    inGameBot = new SH2.gamebot.GameBot(game).attach();
    game.bot = inGameBot;
    if (typeof game.startMission === 'function') game.startMission(0);
  }
} catch (e) {
  emit(920, false, 'бот-диагност не поднялся: ' + e.message, (e.stack || '').split('\n')[1] || '');
}

const runList = BC.CODES.filter((c) => c.detector);
for (const rec of runList) {
  if (only && !onlyOk(rec.code)) continue;
  runDetector(rec);
}
/* Сводка результатов: без неё «провалено 0» в таблице категорий ничего не
   доказывает — таблица печатается по числу зарегистрированных детекторов,
   а не по тому, что реально выполнилось. */
if (flag('--results') || only) {
  const failed = checks.filter((c) => !c.ok).map((c) => c.code);
  console.log('выполнено ' + checks.length + ', провалено ' + failed.length +
    (failed.length ? ': ' + failed.join(', ') : ''));
}
results.checks = checks.length;
results.errors = findings.filter((f) => f.level === 'error').length;
results.warnings = findings.filter((f) => f.level === 'warning').length;
results.codes = BC.detectors();

/* ------------------------------ вывод ---------------------------------- */
const byCategory = {};
BC.CODES.forEach((c) => {
  const cat = c.category;
  byCategory[cat] = byCategory[cat] || { total: 0, checked: 0, failed: 0, named: 0 };
  byCategory[cat].total++;
  if (c.named) byCategory[cat].named++;
  if (c.detector) byCategory[cat].checked++;
});
findings.filter((f) => f.level === 'error').forEach((f) => {
  if (byCategory[f.category]) byCategory[f.category].failed++;
});

console.log('');
console.log('БОТ-ИСКАТЕЛЬ БАГОВ · СЕКТОР «ПЕПЕЛ»');
console.log('─────────────────────────────────────────────────────────────');
console.log(`таблица кодов: ${BC.TOTAL} (000–999), категорий ${BC.BLOCKS.length}, живых детекторов ${BC.detectors()}`);
console.log(`проверок выполнено: ${results.checks}, ошибок: ${results.errors}, предупреждений: ${results.warnings}`);
console.log('─────────────────────────────────────────────────────────────');
BC.BLOCKS.forEach((b) => {
  const row = byCategory[b.category];
  const bar = '█'.repeat(Math.min(20, Math.round((row.checked / row.total) * 20)));
  console.log(`${String(b.base).padStart(3, '0')}–${b.base + 99} ${b.category.padEnd(24)} ${bar.padEnd(20)} детекторов ${String(row.checked).padStart(2)} / ${row.total}  провалено ${row.failed}`);
});
if (findings.length) {
  console.log('─────────────────────────────────────────────────────────────');
  console.log('НАЙДЕНО:');
  findings.forEach((f) => {
    const tag = f.level === 'error' ? 'ОШИБКА' : f.level === 'warning' ? 'ВНИМАНИЕ' : 'ИНФО';
    console.log(`  [${String(f.code).padStart(3, '0')}] ${tag} · ${f.category} · ${f.title}`);
    console.log(`         ${f.message}`);
    if (f.detail) console.log(`         ${f.detail}`);
  });
}
console.log('─────────────────────────────────────────────────────────────');
console.log(results.errors ? `итог: НАЙДЕНО ${results.errors} ошибок` : 'итог: ошибок не найдено');

/* ------------------------------ отчёт ---------------------------------- */
const md = [];
md.push('# Отчёт бота-искателя багов');
md.push('');
md.push('Автоматический прогон `tools/bugbot.mjs` по таблице кодов `src/bugcodes.js` (000–999).');
md.push('');
md.push(`- проверок выполнено: **${results.checks}**`);
md.push(`- ошибок: **${results.errors}**, предупреждений: ${results.warnings}`);
md.push(`- живых детекторов: ${BC.detectors()} из ${BC.TOTAL} кодов`);
md.push('');
md.push('## Покрытие по категориям');
md.push('');
md.push('| Коды | Категория | Детекторов | Провалено |');
md.push('|---|---|---|---|');
BC.BLOCKS.forEach((b) => {
  const row = byCategory[b.category];
  md.push(`| ${String(b.base).padStart(3, '0')}–${b.base + 99} | ${b.category} | ${row.checked} / ${row.total} | ${row.failed} |`);
});
md.push('');
md.push('## Находки');
md.push('');
if (!findings.length) { md.push('Ошибок не найдено.'); md.push(''); }
findings.forEach((f) => {
  md.push(`### \`${String(f.code).padStart(3, '0')}\` — ${f.title}`);
  md.push('');
  md.push(`- уровень: **${f.level}**`);
  md.push(`- категория: ${f.category}`);
  md.push(`- что не так: ${f.message}`);
  if (f.detail) md.push(`- где искать: \`${f.detail}\``);
  md.push('');
});
md.push('## Как воспроизвести');
md.push('');
md.push('```bash');
md.push('node shooter-2/tools/bugbot.mjs            # полный прогон');
md.push('node shooter-2/tools/bugbot.mjs --only 3xx # только рендер');
md.push('node shooter-2/tools/bugbot.mjs --list     # таблица кодов');
md.push('```');
fs.writeFileSync(path.join(root, 'docs', 'bugbot-report.md'), md.join('\n') + '\n');

/* Таблица кодов пишется ботом, а не отдельным скриптом: только здесь у
   записей уже проставлены живые детекторы, поэтому колонка «Детектор»
   в docs/bugcodes.md честная. */
{
  const desc = {
    'Структура проекта': 'файлы, разбор, подключения, офлайн, README и превью',
    'Данные и таблицы': 'оружие, боевики, миссии, карты, хваты, чертежи, баланс',
    'Карты и коллизии': 'геометрия уровня, коллайдеры, спавн, проходы, свет',
    'Рендер и кадр': 'два прохода, фон, слои, материалы, камера, портрет',
    'Игрок и управление': 'движение, выносливость, патроны, отдача, тач-стик',
    'Бой и физика': 'пули, видимость, урон, гранаты и осколки, регдол',
    'ИИ': 'мозг, тактики, укрытия, приказы, навигация, босс',
    'Анимация и модели': 'клипы, риг, оружие, IK, позы, LOD',
    'Интерфейс и UX': 'HUD, экраны, кнопки, тексты, звук, загрузка',
    'Устойчивость': 'NaN, пулы, рестарт, бюджет кадра, обезьяний прогон'
  };
  const md2 = [];
  const pad = (n) => String(n).padStart(3, '0');
  md2.push('# Таблица кодов ошибок (000–999)');
  md2.push('');
  md2.push('Каждому коду соответствует одна категория и одна проверка. Бот `tools/bugbot.mjs`');
  md2.push('ссылается на эти коды в отчёте (`docs/bugbot-report.md`), поэтому по номеру сразу видно,');
  md2.push('что именно сломалось и в какой подсистеме искать.');
  md2.push('');
  md2.push('- всего кодов: **' + BC.TOTAL + '** (000–999)');
  md2.push('- категорий: **' + BC.BLOCKS.length + '**');
  md2.push('- живых детекторов: **' + BC.detectors() + '**');
  md2.push('');
  md2.push('## Диапазоны');
  md2.push('');
  md2.push('| Коды | Категория | Что проверяется |');
  md2.push('|---|---|---|');
  BC.BLOCKS.forEach((b) => md2.push(`| ${pad(b.base)}–${pad(b.base + 99)} | ${b.category} | ${desc[b.category] || ''} |`));
  md2.push('');
  md2.push('Внутри диапазона: **слоты 0–19** — именованные проверки, которые бот реально выполняет;');
  md2.push('**слоты 20–99** — слоты аудита по аспектам подсистемы (название собирается из аспекта и шага аудита).');
  md2.push('');
  BC.BLOCKS.forEach((b) => {
    md2.push('## ' + pad(b.base) + ' — ' + b.category);
    md2.push('');
    md2.push('| Код | Проверка | Детектор |');
    md2.push('|---|---|---|');
    BC.CODES.filter((c) => c.block === b.key && c.named).forEach((c) => {
      md2.push(`| ${c.id} | ${c.title} | ${c.detector ? 'да' : '—'} |`);
    });
    const extra = BC.CODES.filter((c) => c.block === b.key && !c.named);
    if (extra.length) {
      const aspect = (extra[0].title.match(/«([^»]+)»/) || [])[1] || b.key;
      md2.push(`| ${extra[0].id}–${extra[extra.length - 1].id} | слоты аудита «${aspect}» и других аспектов | — |`);
    }
    md2.push('');
  });
  fs.writeFileSync(path.join(root, 'docs', 'bugcodes.md'), md2.join('\n') + '\n');
  console.log('таблица кодов: docs/bugcodes.md');
}

if (flag('--json')) fs.writeFileSync(path.resolve(opt('--json')), JSON.stringify({ results, findings, checks }, null, 2));
console.log('отчёт: docs/bugbot-report.md');
process.exit(results.errors ? 1 : 0);
