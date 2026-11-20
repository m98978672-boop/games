#!/usr/bin/env node
/* Тач-управление шутером (shooter/tests/touch.mjs)

   Раньше игра требовала мышь с захватом курсора: на телефоне она не
   запускалась вообще — ни ходить, ни стрелять, ни вращать камеру.
   Теперь есть стик, свайп и кнопки.

   Тест не просто ищет строки в файле: он поднимает touch.js на
   минимальной странице и дёргает события пальцем, проверяя, что игра
   получает те же флаги, что и с клавиатуры.

   Запуск: node shooter/tests/touch.mjs                               */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const touchSrc = fs.readFileSync(path.join(ROOT, 'touch.js'), 'utf8');

let passed = 0;
let failed = 0;
function check(name, ok, detail = '') {
  if (ok) { passed++; console.log('  ✓', name); }
  else { failed++; console.log('  ✗', name, detail); }
}

console.log('Разметка тач-панели');
{
  check('есть контейнер управления', /id="touch-ui"/.test(html));
  check('есть стик', /id="touch-stick"/.test(html));
  check('есть кнопка огня', /id="touch-fire"/.test(html));
  check('есть кнопка перезарядки', /id="touch-reload"/.test(html));
  check('есть кнопка прыжка', /id="touch-jump"/.test(html));
  check('панель скрыта по умолчанию', /#touch-ui[^}]*display:\s*none/.test(html));
  check('панель показывается на тач-устройстве', /body\.touch\s+#touch-ui\s*\{[^}]*display:\s*block/.test(html));
  check('touch.js подключён после игры', html.indexOf('src="touch.js"') > html.indexOf('<script>'));
}

console.log('Игра не требует мышь на телефоне');
{
  check('мост флагов выставлен', /window\.__shooterKeys\s*=\s*keys/.test(html));
  check('мост обзора выставлен', /window\.__shooterLook\s*=/.test(html));
  check('мост перезарядки выставлен', /window\.__shooterReload\s*=/.test(html));
  check('захват курсора только без тача',
    /if\s*\(!touch\s*&&\s*canvas\.requestPointerLock\)/.test(html) ||
    /touchDevice\(\)/.test(html),
    'иначе на телефоне startGame остаётся без управления');
  check('есть определение тач-устройства', /touchDevice|ontouchstart/.test(html));
}

console.log('touch.js запускается и управляет игрой');
{
  // Минимальная страница: элементы панели и мосты игры в window.
  const listeners = new Map();
  function el(id, extra = {}) {
    return {
      id,
      style: {},
      _l: {},
      setAttribute() {},
      getBoundingClientRect: () => ({ left: 0, top: 0, width: 132, height: 132 }),
      setPointerCapture() {},
      closest: () => null,
      addEventListener(type, fn) { (this._l[type] ||= []).push(fn); },
      fire(type, ev) { for (const fn of this._l[type] || []) fn(ev); },
      ...extra,
    };
  }
  const stick = el('touch-stick');
  const knob = el('touch-knob');
  const fire = el('touch-fire');
  const reload = el('touch-reload');
  const jump = el('touch-jump');
  const ui = el('touch-ui');
  const nodes = { 'touch-stick': stick, 'touch-knob': knob, 'touch-fire': fire, 'touch-reload': reload, 'touch-jump': jump, 'touch-ui': ui };

  const docListeners = new Map();
  const keys = {};
  let lookCalls = 0;
  let reloadCalls = 0;
  let pauseCalls = 0;

  const sandbox = {
    navigator: { maxTouchPoints: 2 },
    document: {
      body: { classList: { add(cls) { sandbox.__touchClass = cls; } } },
      getElementById: (id) => nodes[id] || null,
      addEventListener(type, fn) { (docListeners.get(type) || docListeners.set(type, []).get(type) || []).push(fn); },
    },
    __touchClass: null,
  };
  sandbox.window = sandbox;
  sandbox.window.__shooterKeys = keys;
  sandbox.window.__shooterLook = () => { lookCalls++; };
  sandbox.window.__shooterReload = () => { reloadCalls++; };
  sandbox.window.__shooterPause = () => { pauseCalls++; };

  let bootError = null;
  try {
    new Function('window', 'navigator', 'document', touchSrc)(sandbox.window, sandbox.navigator, sandbox.document);
  } catch (e) {
    bootError = e;
  }
  check('touch.js выполнился без исключения', !bootError, bootError && bootError.message);
  check('на тач-устройстве включён режим .touch', sandbox.__touchClass === 'touch', String(sandbox.__touchClass));

  // Стик: тянем вверх — должен нажаться W.
  stick.fire('pointerdown', { pointerId: 1, clientX: 66, clientY: 66, preventDefault() {} });
  stick.fire('pointermove', { pointerId: 1, clientX: 66, clientY: 20, preventDefault() {} });
  check('стик вверх включает ходьбу вперёд', keys['KeyW'] === true);
  check('стик вверх не включает назад', keys['KeyS'] === false);

  stick.fire('pointermove', { pointerId: 1, clientX: 20, clientY: 66, preventDefault() {} });
  check('стик влево включает шаг влево', keys['KeyA'] === true);
  check('вперёд больше не нажато', keys['KeyW'] === false);

  stick.fire('pointerup', { pointerId: 1 });
  check('отпускание стика снимает все флаги',
    !keys['KeyW'] && !keys['KeyA'] && !keys['KeyS'] && !keys['KeyD']);

  // Огонь: держим — стреляем, отпускаем — нет.
  fire.fire('pointerdown', { pointerId: 2, preventDefault() {} });
  check('кнопка огня включает стрельбу', keys['MouseDown'] === true);
  fire.fire('pointerup', { pointerId: 2 });
  check('отпускание кнопки прекращает стрельбу', keys['MouseDown'] === false);

  // Прыжок.
  jump.fire('pointerdown', { pointerId: 3, preventDefault() {} });
  check('кнопка прыжка нажимает Space', keys['Space'] === true);
  jump.fire('pointerup', { pointerId: 3 });
  check('отпускание прыжка снимает Space', keys['Space'] === false);

  // Перезарядка — нажатие, а не удержание.
  reload.fire('pointerdown', { pointerId: 4, preventDefault() {} });
  check('кнопка перезарядки вызывает перезарядку', reloadCalls === 1, String(reloadCalls));

  // Свайп по экрану вращает камеру.
  const down = docListeners.get('pointerdown') || [];
  const move = docListeners.get('pointermove') || [];
  check('слушатели обзора установлены', down.length > 0 && move.length > 0);
  const ev = (x, y) => ({ pointerId: 9, clientX: x, clientY: y, target: { closest: () => null } });
  for (const fn of down) fn(ev(200, 200));
  for (const fn of move) fn(ev(240, 210));
  check('свайп вращает камеру', lookCalls > 0, String(lookCalls));

  // Свайп, начавшийся на стике, не должен крутить камеру.
  const before = lookCalls;
  for (const fn of down) fn({ pointerId: 10, clientX: 60, clientY: 60, target: { closest: () => ({}) } });
  for (const fn of move) fn({ pointerId: 10, clientX: 90, clientY: 90, target: { closest: () => ({}) } });
  check('свайп по стику не крутит камеру', lookCalls === before, `было ${before}, стало ${lookCalls}`);
}

console.log('На обычном компьютере ничего не меняется');
{
  const listeners = [];
  const sandbox = {
    navigator: { maxTouchPoints: 0 },
    document: {
      body: { classList: { add(cls) { sandbox.__touchClass = cls; } } },
      getElementById: () => null,
      addEventListener(t, fn) { listeners.push(fn); },
    },
    __touchClass: null,
  };
  sandbox.window = sandbox;
  let err = null;
  try {
    new Function('window', 'navigator', 'document', touchSrc)(sandbox.window, sandbox.navigator, sandbox.document);
  } catch (e) { err = e; }
  check('без тача скрипт молча выходит', !err && sandbox.__touchClass === null);
  check('без тача слушатели не ставятся', listeners.length === 0, `слушателей: ${listeners.length}`);

  // И даже без элементов панели скрипт не должен падать.
  const sandbox2 = {
    navigator: { maxTouchPoints: 5 },
    document: {
      body: { classList: { add() {} } },
      getElementById: () => null,
      addEventListener() {},
    },
  };
  sandbox2.window = sandbox2;
  let err2 = null;
  try {
    new Function('window', 'navigator', 'document', touchSrc)(sandbox2.window, sandbox2.navigator, sandbox2.document);
  } catch (e) { err2 = e; }
  check('без разметки панели не падает', !err2, err2 && err2.message);
}

console.log(`\n${passed} пройдено, ${failed} провалено`);
if (failed) process.exit(1);
