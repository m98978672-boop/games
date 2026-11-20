#!/usr/bin/env node
/* Проверка собранного бандла (mesh-studio/tests/browser.mjs)

   Браузера в песочнице нет, поэтому проверяем главное, что ломается
   молча: бандл вообще запускается, находит движок, рисует сцену и
   реагирует на нажатия. Для этого подсовываем минимальную страницу:
   список элементов HTML, canvas с ловушкой вместо контекста и движок
   из настоящего ratcore.bundle.js.

   Запуск: node mesh-studio/tests/browser.mjs                          */
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');

let passed = 0;
let failed = 0;
function check(name, ok, detail = '') {
  if (ok) { passed++; console.log('  ✓', name); }
  else { failed++; console.log('  ✗', name, detail); }
}

const bundlePath = path.join(root, 'mesh-studio/studio.bundle.js');
check('бандл собран', fs.existsSync(bundlePath), bundlePath);
const bundle = fs.readFileSync(bundlePath, 'utf8');

check('бандл — один файл без импортов',
  !/^\s*(import|export)\s/m.test(bundle),
  'иначе браузер не выполнит его как обычный скрипт');

/* ---------- минимальная страница ---------- */

const elements = new Map();
function makeEl(tag = 'div', id = '') {
  const el = {
    tagName: tag.toUpperCase(),
    id,
    className: '',
    style: {},
    dataset: {},
    children: [],
    _text: '',
    get textContent() { return this._text; },
    set textContent(v) { this._text = String(v); if (v === '') this.children.length = 0; },
    innerHTML: '',
    hidden: false,
    disabled: false,
    value: '',
    type: '',
    title: '',
    tabIndex: 0,
    width: 0,
    height: 0,
    _listeners: {},
    classList: { add() {}, remove() {}, toggle() {} },
    setAttribute(k, v) { this[k] = String(v); },
    get innerHTML() { return this._html || ''; },
    set innerHTML(v) { this._html = String(v); if (v === '') this.children.length = 0; },
    getAttribute(k) { return this[k]; },
    appendChild(child) { this.children.push(child); child.parentElement = this; return child; },
    append(...kids) { for (const k of kids) this.appendChild(k); },
    removeChild(child) {
      const i = this.children.indexOf(child);
      if (i >= 0) this.children.splice(i, 1);
      return child;
    },
    addEventListener(type, fn) { (this._listeners[type] ||= []).push(fn); },
    removeEventListener() {},
    dispatch(type, ev = {}) { for (const fn of this._listeners[type] || []) fn(ev); },
    getBoundingClientRect() { return { width: 640, height: 420, left: 0, top: 0 }; },
    getContext(kind) {
      if (kind !== '2d') return null;
      return {
        createImageData: (w, h) => ({ width: w, height: h, data: new Uint8ClampedArray(w * h * 4) }),
        putImageData() {},
        drawImage() {},
        clearRect() {},
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
      };
    },
    hasPointerCapture: () => false,
    releasePointerCapture() {},
    setPointerCapture() {},
    click() { this.dispatch('click', { preventDefault() {} }); },
    focus() {},
    get firstChild() { return this.children[0] || null; },
  };
  return el;
}

// Поля, кнопки и контейнеры, которые ищет studio.js.
const ids = [
  'stat-meshes', 'stat-tris', 'stat-scene-tris', 'primitive-list',
  'lathe-profile', 'lathe-segments', 'btn-lathe', 'extrude-shape',
  'extrude-depth', 'btn-extrude', 'layer-expr', 'layer-voxel', 'btn-layer',
  'color-row', 'color-custom', 'view', 'viewport-hint', 'viewport-error',
  'viewport-error-text', 'view-front', 'view-side', 'view-top', 'view-reset',
  'scene-list', 'scene-count', 'btn-undo', 'btn-redo', 'btn-duplicate',
  'btn-delete', 'btn-export-obj', 'btn-export-json', 'export-note',
  'engine-note', 'status-text', 'hint-keys',
];
for (const id of ids) elements.set(id, makeEl(id === 'view' ? 'canvas' : 'div', id));

elements.get('lathe-profile').value = '0,0; 0.6,0; 0.6,0.4; 0.35,1.2; 0.15,1.6; 0,1.6';
elements.get('lathe-segments').value = '16';
elements.get('extrude-shape').value = '0,0; 1,0; 1,0.6; 0.5,1; 0,0.6';
elements.get('extrude-depth').value = '1';
elements.get('layer-expr').value = '(0;0)h3(1,0;0,1)';
elements.get('layer-voxel').value = '0.25';
elements.get('color-custom').value = '#8fb8d8';

const body = makeEl('body');
const viewParent = makeEl('div');
viewParent.appendChild(elements.get('view'));

global.window = global;
global.document = {
  readyState: 'complete',
  body,
  querySelector(sel) {
    if (!sel.startsWith('#')) return null;
    const id = sel.slice(1);
    if (id === 'view') return elements.get('view');
    return elements.get(id) || null;
  },
  querySelectorAll: () => [],
  createElement(tag) {
    if (tag === 'canvas') {
      const c = makeEl('canvas');
      // Промежуточный канвас: putImageData в него просто не падает.
      return c;
    }
    return makeEl(tag);
  },
  createElementNS: () => makeEl('div'),
  addEventListener() {},
  removeEventListener() {},
};

const windowListeners = {};
global.addEventListener = (type, fn) => { (windowListeners[type] ||= []).push(fn); };
global.removeEventListener = () => {};
global.requestAnimationFrame = (fn) => { setTimeout(fn, 0); return 1; };
global.cancelAnimationFrame = () => {};
global.ResizeObserver = class { observe() {} disconnect() {} };
global.devicePixelRatio = 1;
global.URL = { createObjectURL: () => 'blob:x', revokeObjectURL() {} };
global.Blob = class { constructor(parts) { this.parts = parts; } };
const downloads = [];
const origCreate = global.document.createElement;

/* ---------- запуск ---------- */

console.log('Движок подключается страницей');
require(path.join(root, 'ratcore/ratcore.bundle.js'));
check('RatCore доступен в window', Boolean(global.window.RatCore && global.window.RatCore.createEngine));

console.log('Бандл выполняется');
let bootError = null;
try {
  // Бандл — IIFE: выполняем его как обычный скрипт страницы.
  new Function(bundle)();
} catch (err) {
  bootError = err;
}
check('бандл запустился без исключения', !bootError, bootError && bootError.message);

console.log('Стартовая сцена');
const sceneList = elements.get('scene-list');
await new Promise((r) => setTimeout(r, 20));
check('стартовая модель появилась в списке', sceneList.children.length >= 1,
  `элементов: ${sceneList.children.length}`);
check('статистика обновилась',
  /модел/.test(elements.get('stat-meshes').innerHTML),
  elements.get('stat-meshes').innerHTML);
check('счётчик сцены не пустой', elements.get('scene-count').textContent === '1',
  elements.get('scene-count').textContent);
check('подпись движка заполнена',
  /RatCore/.test(elements.get('engine-note').textContent),
  elements.get('engine-note').textContent);

console.log('Кнопки создают модели');
{
  const shapes = elements.get('primitive-list');
  check('кнопки форм построены', shapes.children.length >= 5, `кнопок: ${shapes.children.length}`);

  const before = sceneList.children.length;
  shapes.children[1].click();
  await new Promise((r) => setTimeout(r, 10));
  check('нажатие формы добавляет модель', sceneList.children.length === before + 1,
    `${before} → ${sceneList.children.length}`);

  elements.get('btn-lathe').click();
  await new Promise((r) => setTimeout(r, 10));
  check('тело вращения добавилось', sceneList.children.length === before + 2,
    String(sceneList.children.length));

  elements.get('btn-extrude').click();
  await new Promise((r) => setTimeout(r, 10));
  check('экструзия добавилась', sceneList.children.length === before + 3,
    String(sceneList.children.length));

  elements.get('btn-layer').click();
  await new Promise((r) => setTimeout(r, 10));
  check('воксельный слой добавился', sceneList.children.length === before + 4,
    String(sceneList.children.length));
}

console.log('Отмена и удаление');
{
  const before = sceneList.children.length;
  elements.get('btn-undo').click();
  await new Promise((r) => setTimeout(r, 10));
  check('отмена убрала последнюю модель', sceneList.children.length === before - 1,
    `${before} → ${sceneList.children.length}`);

  elements.get('btn-redo').click();
  await new Promise((r) => setTimeout(r, 10));
  check('повтор вернул модель', sceneList.children.length === before,
    String(sceneList.children.length));

  // Выбираем первый элемент списка и удаляем.
  const first = sceneList.children[0];
  first.dispatch('click', { preventDefault() {} });
  elements.get('btn-delete').click();
  await new Promise((r) => setTimeout(r, 10));
  check('удаление убрало выбранную модель', sceneList.children.length === before - 1,
    `${before} → ${sceneList.children.length}`);
}

console.log('Ошибка ввода не роняет редактор');
{
  const before = sceneList.children.length;
  elements.get('extrude-shape').value = 'каша';
  elements.get('btn-extrude').click();
  await new Promise((r) => setTimeout(r, 10));
  check('негодный контур не добавил модель', sceneList.children.length === before,
    String(sceneList.children.length));
  check('показана причина ошибки', /точк|разобрать|контур/i.test(elements.get('status-text').textContent),
    elements.get('status-text').textContent);
  elements.get('extrude-shape').value = '0,0; 1,0; 1,0.6; 0.5,1; 0,0.6';
}

console.log('Кадр действительно рисуется');
{
  // Перехватываем, что попало на canvas: движок отдаёт пиксели, а мы их
  // переносим. Если перенос сломан, на экране будет пусто при живых моделях.
  const drawn = [];
  const view = elements.get('view');
  const realGet = view.getContext.bind(view);
  view.getContext = (kind) => {
    const ctx = realGet(kind);
    if (!ctx) return ctx;
    return {
      ...ctx,
      drawImage(img) { drawn.push({ w: img.width, h: img.height }); },
    };
  };

  // Перезапускаем бандл, чтобы он взял canvas с перехватом.
  const sceneList2 = elements.get('scene-list');
  sceneList2.children.length = 0;
  new Function(bundle)();
  await new Promise((r) => setTimeout(r, 40));

  check('кадр перенесён на canvas', drawn.length > 0, `вызовов drawImage: ${drawn.length}`);
  check('у кадра разумный размер',
    drawn.length > 0 && drawn[0].w >= 64 && drawn[0].h >= 64,
    drawn.length ? `${drawn[0].w}x${drawn[0].h}` : 'нет кадра');
  const beforeRotate = drawn.length;
  const canvas = elements.get('view');
  canvas.dispatch('pointerdown', { clientX: 100, clientY: 100, pointerId: 1 });
  canvas.dispatch('pointermove', { clientX: 160, clientY: 120, pointerId: 1 });
  canvas.dispatch('pointerup', { pointerId: 1 });
  await new Promise((r) => setTimeout(r, 60));
  check('вращение мышью вызвало новую отрисовку',
    drawn.length > beforeRotate, `кадров было ${beforeRotate}, стало ${drawn.length}`);

  const beforeZoom = drawn.length;
  canvas.dispatch('wheel', { deltaY: -100, preventDefault() {} });
  await new Promise((r) => setTimeout(r, 60));
  check('колесо мыши перерисовывает сцену',
    drawn.length > beforeZoom, `кадров было ${beforeZoom}, стало ${drawn.length}`);
}

console.log('Статус и плашка движка');
{
  check('статус не пустой', elements.get('status-text').textContent.length > 0,
    elements.get('status-text').textContent);
  check('нет сообщения о недоступности 3D', elements.get('viewport-error').hidden === true);
}

console.log(`\n${passed} пройдено, ${failed} провалено`);
if (failed) process.exit(1);
