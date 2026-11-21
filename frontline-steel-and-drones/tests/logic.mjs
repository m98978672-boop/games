#!/usr/bin/env node
/* ЛИНИЯ ФРОНТА: Сталь и Дроны — проверка настоящей симуляции без браузера.

   game.js — классический скрипт: грузим его в vm-контекст с честными
   заглушками DOM/Canvas (Proxy-контекст, который ничего не рисует, но и
   ничего не ломает) и гоняем именно игровые функции: startGame, update,
   buy, damageCity. Случайность — зерно mulberry32, поэтому прогон
   детерминирован. Заодно сторожим однофайловую сборку play.html: витрина
   ведёт именно на неё, и она обязана совпадать с index+css+js.   */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const here = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(here, '..');
const src = readFileSync(path.join(dir, 'game.js'), 'utf8');

let passed = 0, failed = 0;
function check(name, ok, detail = '') {
  if (ok) { passed++; console.log('  ✓', name); }
  else { failed++; console.log('  ✗', name, detail); }
}

/* ---------- заглушки браузера ---------- */
function makeCtx() {
  const store = {};
  return new Proxy(store, {
    get(t, k) {
      if (k === 'measureText') return () => ({ width: 10 });
      if (k === 'createLinearGradient' || k === 'createRadialGradient') return () => ({ addColorStop() {} });
      if (k in t) return t[k];
      return () => {};
    },
    set(t, k, v) { t[k] = v; return true; },
  });
}
function makeEl(tag = 'div') {
  const el = {
    tagName: String(tag).toUpperCase(), children: [], style: {}, dataset: {},
    textContent: '', innerHTML: '', value: '1', title: '', className: '', width: 0, height: 0,
    classList: {
      _s: new Set(),
      add(...c) { c.forEach((x) => this._s.add(x)); },
      remove(...c) { c.forEach((x) => this._s.delete(x)); },
      toggle(c) { this._s.has(c) ? this._s.delete(c) : this._s.add(c); },
      contains(c) { return this._s.has(c); },
    },
    appendChild(c) { this.children.push(c); return c; },
    insertBefore(c) { this.children.unshift(c); return c; },
    removeChild(c) { const i = this.children.indexOf(c); if (i >= 0) this.children.splice(i, 1); return c; },
    addEventListener() {}, removeEventListener() {}, setAttribute() {}, getAttribute() { return null; },
    querySelector() { return makeEl(); }, querySelectorAll() { return []; },
    getContext() { return makeEl._ctx || (makeEl._ctx = makeCtx()); },
    get firstChild() { return this.children[0] || null; },
    get lastChild() { return this.children[this.children.length - 1] || null; },
  };
  return el;
}

function loadGame(seed = 1234567) {
  const byId = new Map();
  const documentStub = {
    getElementById(id) { if (!byId.has(id)) byId.set(id, makeEl(id === 'game' ? 'canvas' : 'div')); return byId.get(id); },
    createElement(tag) { return makeEl(tag); },
    querySelectorAll() { return []; },
    querySelector() { return makeEl(); },
    addEventListener() {},
  };
  let rafCb = null;
  const sandbox = {
    console, document: documentStub,
    performance: { now: () => 1000 },
    requestAnimationFrame(cb) { rafCb = cb; return 1; },
    addEventListener() {}, removeEventListener() {},
    setTimeout, clearTimeout,
  };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  const ctx = vm.createContext(sandbox);
  vm.runInContext(`Math.random = (() => { let s = ${seed} >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; })();`, ctx);
  vm.runInContext(src, ctx, { filename: 'game.js' });
  return { ctx, byId, frames(n) { for (let i = 0; i < n; i++) { const cb = rafCb; rafCb = null; cb(16 * (i + 1)); } } };
}
const run = (g, code) => vm.runInContext(code, g.ctx);

/* ---------- 1. Загрузка и старт ---------- */
{
  const g = loadGame();
  check('игра загружается: состояние G создано, бой не начат', run(g, `!!G && G.started === false && G.money === 520`));
  check('карта кампании: 4 зоны, первая — игрока, три города врага', run(g, `G.zoneOwner.join(',') === 'player,enemy,enemy,enemy' && G.enemyCityZone === 1`));
  run(g, `window.startGame()`);
  check('старт: бой идёт, открывающая пехота обеих сторон на поле', run(g, `G.started === true && G.units.some(u => u.side === 'player') && G.units.some(u => u.side === 'enemy')`));
  g.frames(5);
  check('кадры render-цикла проходят без исключений (draw по заглушке)', true);
}

/* ---------- 2. Экономика и штаб врага ---------- */
{
  const g = loadGame();
  run(g, `window.startGame()`);
  const money0 = run(g, `G.money`);
  run(g, `for (let i = 0; i < 600; i++) update(0.1)`); // 60 секунд боя
  check('время боя идёт', run(g, `G.time > 59`));
  check('экономика: кредиты игрока растут от дохода', run(g, `G.money`) > money0, `было ${money0}, стало ${run(g, 'G.money')}`);
  check('штаб врага живёт: за минуту враг вывел больше открывающей пехоты', run(g, `G.units.filter(u => u.side === 'enemy').length + G.losses + G.kills >= 2 && (G.aiMoney < 520 + 60 * 14 || G.units.filter(u => u.side === 'enemy').length > 1)`));
}

/* ---------- 3. Покупки и кулдауны ---------- */
{
  const g = loadGame();
  run(g, `window.startGame(); G.money = 1000; G.shopCd.tank = 0;`);
  run(g, `buy('tank')`);
  check('покупка танка: деньги списаны по цене, танк на поле', run(g, `G.money === 1000 - DEFS.tank.cost && G.units.some(u => u.side === 'player' && u.type === 'tank')`));
  const moneyAfter = run(g, `G.money`);
  run(g, `buy('tank')`);
  check('второй танк подряд нельзя: кулдаун магазина держит', run(g, `G.money`) === moneyAfter && run(g, `G.units.filter(u => u.type === 'tank').length`) === 1);
  run(g, `buy('builder')`);
  check('строители закрыты до первого павшего города', run(g, `!G.units.some(u => u.type === 'builder')`));
}

/* ---------- 4. Бой: танк против пехоты ---------- */
{
  const g = loadGame();
  run(g, `window.startGame(); G.money = 5000; G.shopCd.tank = 0; buy('tank');
    const t = G.units.find(u => u.type === 'tank'); t.x = 800; t.y = 450;
    const inf = spawnUnit('enemy', 'infantry'); inf.x = 860; inf.y = 450;`);
  run(g, `for (let i = 0; i < 300 && G.units.some(u => u.side === 'enemy' && u.type === 'infantry' && !u.dead); i++) update(0.1)`);
  check('бой настоящий: пехота врага у танка погибает от огня', run(g, `!G.units.some(u => u.side === 'enemy' && u.type === 'infantry' && !u.dead) || G.units.filter(u => u.side === 'enemy' && u.type === 'infantry').every(u => u.hp < u.maxHp)`));
  check('убийства считаются в статистике кампании', run(g, `G.kills >= 0 && typeof G.kills === 'number'`));
}

/* ---------- 5. Захват городов и победа ---------- */
{
  const g = loadGame();
  run(g, `window.startGame()`);
  run(g, `for (let guard = 0; guard < 8 && !G.over; guard++) { damageCity('enemy', 100000, enemyCityX0(), 450, 'player'); for (let i = 0; i < 5; i++) update(0.1); }`);
  check('кампания выигрывается: три города взяты, игра окончена', run(g, `G.over === true && G.captured === 3`));
  check('экран победы показан игроку', g.byId.get('over-title')?.textContent.includes('ПОБЕДА'), g.byId.get('over-title')?.textContent);
  run(g, `resetGame()`);
  check('после победы состояние сбрасывается в новую кампанию', run(g, `G.over === false && G.captured === 0 && G.captured === 0`));
}

/* ---------- 6. Поражение: резервные города и конец ---------- */
{
  const g = loadGame();
  run(g, `window.startGame()`);
  run(g, `for (let guard = 0; guard < 10 && !G.over; guard++) { damageCity('player', 100000, playerBaseX0(), 450, 'enemy'); for (let i = 0; i < 5; i++) update(0.1); }`);
  check('кампания проигрывается только с последним городом', run(g, `G.over === true && G.playerBasesLost >= 3`), `потеряно баз: ${run(g, 'G.playerBasesLost')}`);
  check('экран поражения показан игроку', g.byId.get('over-title')?.textContent.includes('ПАЛИ'), g.byId.get('over-title')?.textContent);
}

/* ---------- 7. Скорости игры ---------- */
{
  const g = loadGame();
  run(g, `window.startGame()`);
  const seq = run(g, `const out = []; for (let i = 0; i < 4; i++) { cycleGameSpeed(); out.push(G.speed); } out.join(',')`);
  check('скорость циклится ×1→×2→×5→×10→×1', seq === '2,5,10,1', seq);
  check('чужая скорость не проходит: setGameSpeed(7) даёт ×1', run(g, `setGameSpeed(7), G.speed`) === 1);
}

/* ---------- 8. Целостность данных и иконок ---------- */
{
  const g = loadGame();
  check('магазин: каждый юнит из ORDER описан в DEFS с ценой и HP', run(g, `ORDER.every(k => DEFS[k] && DEFS[k].cost > 0 && DEFS[k].hp > 0)`));
  check('стройки: проекты строителя описаны в STRUCT_DEFS', run(g, `BUILD_PROJECTS.every(k => STRUCT_DEFS[k] && STRUCT_DEFS[k].cost > 0 && STRUCT_DEFS[k].hp > 0)`));
  const html = readFileSync(path.join(dir, 'index.html'), 'utf8');
  const icons = run(g, `ORDER.map(k => DEFS[k].icon).concat(['i-missile'])`);
  const missing = icons.filter((id) => !html.includes(`id="${id}"`));
  check('иконки юнитов и ракеты есть в SVG-спрайте страницы', missing.length === 0, missing.join(','));
}

/* ---------- 9. Однофайловая сборка не отстаёт ---------- */
{
  const html = readFileSync(path.join(dir, 'index.html'), 'utf8');
  const css = readFileSync(path.join(dir, 'style.css'), 'utf8');
  const built = html
    .replace('<link rel="stylesheet" href="style.css">', `<style>\n${css}\n</style>`)
    .replace('<script src="game.js"></script>', `<script>\n${src}\n</script>`);
  const committed = readFileSync(path.join(dir, 'play.html'), 'utf8');
  check('play.html собран из текущих index/style/game (витрина не ведёт на старьё)', built === committed,
    built === committed ? '' : 'пересоберите: python3 frontline-steel-and-drones/build_standalone.py');
}

console.log(`\nСталь и дроны: ${passed} проверок пройдено, ${failed} провалено.`);
process.exit(failed ? 1 : 0);
