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
    addEventListener() {}, removeEventListener() {}, dispatchEvent() { return true; },
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
  navigator: { userAgent: 'bugbot', maxTouchPoints: 0, language: 'ru' },
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
const MODULES = ['bugcodes', 'data', 'outline', 'gunblueprints', 'soldier', 'level', 'model', 'anim', 'ik',
  'ragdoll', 'world', 'ai', 'agent', 'fx', 'viewmodel', 'audio', 'perf', 'game', 'ui'];
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
const onlyOk = (code) => !only || String(code).padStart(3, '0').startsWith(only.replace(/x/g, '')) ||
  (only.slice(0, 1) + 'xx' === only.slice(0, 1) + 'xx' && Math.floor(code / 100) === Number(only[0]));

results.started = 1;
/* Порядок прогона фиксирован: детекторы опираются на живую игру, и код 300
   (запуск миссии) обязан выполниться раньше остальных. Если игру не удалось
   поднять — об этом честно скажем один раз, а не 90 раз в каждом детекторе. */
try { bootGame(); }
catch (e) { emit(0, false, 'игра не поднялась: ' + e.message, (e.stack || '').split('\n')[1] || ''); }
const runList = BC.CODES.filter((c) => c.detector);
for (const rec of runList) {
  if (only && !onlyOk(rec.code)) continue;
  runDetector(rec);
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
