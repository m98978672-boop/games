#!/usr/bin/env node
/* Финал дорожной империи — tests/victory.test.js

   В road-tycoon цель «Дорожная империя» была последней, но после неё
   не происходило ничего, кроме тоста. Экран итогов существовал, однако
   флаг «показан» жил в памяти модуля: стоило перезагрузить страницу —
   и победу было не вернуть.

   Здесь проверяется, что финал достигается, сохраняется в сейве,
   переживает перезагрузку и что после него можно играть свободно.

   Запуск: node road-tycoon/tests/victory.test.js                        */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
let passed = 0;
let failed = 0;
function check(name, ok, detail = '') {
  if (ok) { passed++; console.log('  ✓', name); }
  else { failed++; console.log('  ✗', name, detail); }
}

/* Мир-заглушка: sim.js требует TR.World и TR.Util, но для экономики
   достаточно городов из конфига. */
function makeSandbox() {
  const store = new Map();
  const sandbox = {
    console,
    localStorage: {
      getItem: (k) => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => store.set(k, String(v)),
      removeItem: (k) => store.delete(k),
    },
    document: { addEventListener() {}, querySelectorAll: () => [], getElementById: () => null },
    window: null,
    Math, Date, JSON, Object, Array, String, Number, Boolean, isNaN, isFinite, parseFloat, parseInt, Error, RegExp,
    setTimeout: () => 0, clearTimeout: () => {}, setInterval: () => 0, clearInterval: () => {},
    requestAnimationFrame: () => 0,
  };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  return vm.createContext(sandbox);
}

function load(ctx) {
  for (const f of ['src/util.js', 'src/config.js', 'src/world.js', 'src/sim.js']) {
    vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f });
  }
  return vm.runInContext('window.TR', ctx);
}

const ctx = makeSandbox();
const TR = load(ctx);
const { Sim, CONFIG } = TR;

console.log('Игра и её цели');
{
  check('есть девять целей кампании', CONFIG.objectives.length === 9, String(CONFIG.objectives.length));
  check('последняя цель — империя', CONFIG.objectives[CONFIG.objectives.length - 1].id === 'capital');
  const s = Sim.newGame(777);
  check('новая игра не пройдена', s.won === false && s.winShown === false);
  check('день победы пуст', s.wonDay === 0);
  check('свободный режим выключен', s.freeMode === false);
  check('есть итоги кампании', typeof Sim.campaignSummary === 'function');
}

console.log('Финал наступает и фиксируется');
{
  const s = Sim.newGame(4242);
  // все цели, кроме последней
  s.objDone = CONFIG.objectives.slice(0, -1).map((o) => o.id);
  s.money = 300000;           // капитал ниже порога последней цели
  Sim.checkObjectives(s);
  check('после восьмой цели игра ещё не пройдена', s.won === false);

  check('восемь целей закрыто', s.objDone.length === 8, String(s.objDone.length));
  s.money = 5000000;          // капитал заведомо выше порога
  Sim.checkObjectives(s);     // последняя цель закрывается по капиталу
  check('после последней цели игра пройдена', s.won === true, JSON.stringify(s.objDone.length));
  check('день победы записан', s.wonDay >= 1, String(s.wonDay));
  check('экран финала ещё не показан', s.winShown === false);
}

console.log('Итоги кампании');
{
  const s = Sim.newGame(99);
  s.won = true;
  s.wonDay = 42;
  s.objDone = CONFIG.objectives.map((o) => o.id);
  s.stats.totalServices = 3000;
  s.stats.totalIncome = 2500000;
  s.money = 1800000;
  s.level = 9;
  s.facilities = [
    { type: 'cafe', ready: true, level: 1 },
    { type: 'fuel', ready: true, level: 1 },
    { type: 'shop', ready: false, level: 1 },
  ];
  s.roads = [
    { open: true, totalKm: 120, quality: 2, a: 0, b: 1 },
    { open: true, totalKm: 80, quality: 2, a: 1, b: 2 },
    { open: false, totalKm: 50, quality: 2, a: 2, b: 3 },
  ];
  const r = Sim.campaignSummary(s);
  check('итоги считаются', !!r);
  check('день из финала, а не текущий', r.days === 42, String(r.days));
  check('дороги только открытые', r.roadsKm === 200, String(r.roadsKm));
  check('объекты только готовые', r.facilities === 2, String(r.facilities));
  check('услуги перенесены', r.services === 3000);
  check('уровень перенесён', r.level === 9);
  check('звание присвоено', ['безупречная', 'образцовая', 'крепкая', 'трудовая'].includes(r.rank), r.rank);
  check('без финала день берётся из времени',
    Sim.campaignSummary(Object.assign(Sim.newGame(5), { wonDay: 0 })).days >= 1);
  check('пустое состояние не падает', Sim.campaignSummary(null) === null);
}

console.log('Победа переживает перезагрузку');
{
  const s = Sim.newGame(31337);
  s.won = true;
  s.wonDay = 17;
  s.winShown = true;          // экран уже посмотрели
  s.objDone = CONFIG.objectives.map((o) => o.id);
  const raw = JSON.stringify(s);
  const back = Sim.deserialize(JSON.parse(raw));
  check('победа восстановлена', back.won === true);
  check('пометка об экране восстановлена', back.winShown === true,
    'иначе финал всплывал бы после каждой загрузки');
  check('день победы восстановлен', back.wonDay === 17, String(back.wonDay));

  // старый сейв: полей про финал нет вовсе
  const legacy = JSON.parse(raw);
  delete legacy.won; delete legacy.winShown; delete legacy.wonDay; delete legacy.freeMode;
  const old = Sim.deserialize(legacy);
  check('старый сейв грузится без ошибки', !!old);
  check('старый сейв не получает ложную победу', old.won === false);
  check('у старого сейва поля финала есть', typeof old.winShown === 'boolean' && typeof old.wonDay === 'number');
}

console.log('Свободная игра после финала');
{
  const s = Sim.newGame(8);
  s.won = true;
  s.winShown = true;
  s.objDone = CONFIG.objectives.map((o) => o.id);   // все цели действительно взяты
  const ok = Sim.startFreeMode(s);
  check('режим включается', ok === true && s.freeMode === true);
  check('экран больше не всплывёт', s.winShown === true);
  check('победа не отменяется', s.won === true);
  check('в итогах отмечен свободный режим', Sim.campaignSummary(s).freeMode === true);
  check('в новости есть отметка', s.news.some((n) => /свободн/i.test(n.text)));

  // экономика в свободном режиме продолжает жить
  const before = s.time;
  for (let i = 0; i < 30; i++) Sim.tick(s, 1 / 30, 1);
  check('время идёт дальше', s.time > before, `${before} → ${s.time}`);
  check('после финала цели не ищутся', Sim.currentObjective(s) === null);
}

console.log('Экран финала есть в интерфейсе');
{
  const ui = fs.readFileSync(path.join(ROOT, 'src/ui.js'), 'utf8');
  check('экран вызывает итоги кампании', /campaignSummary/.test(ui));
  check('кнопка свободной игры есть', /free-mode/.test(ui));
  check('свободная игра запускается из интерфейса', /Sim\.startFreeMode/.test(ui));
  check('экран не зависит от памяти модуля', /s\.winShown\s*=\s*true/.test(ui));
  check('звание выводится на экран', /rankText/.test(ui));
  const css = fs.readFileSync(path.join(ROOT, 'style.css'), 'utf8');
  check('стиль подписи со званием есть', /\.hero-note/.test(css));
}

console.log(`\n${passed} пройдено, ${failed} провалено`);
if (failed) process.exit(1);
