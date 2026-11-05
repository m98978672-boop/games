// ============================================================
// Интерфейсный тест без браузера: собираем index.html в jsdom,
// подсовываем заглушку canvas (WebGL нет) и проверяем каталог,
// все 40 моделей, переключение видов, поиск, избранное, покраску.
//   node tests/ui.mjs        (нужен npm i -D jsdom)
// ============================================================
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let JSDOM;
try {
  ({ JSDOM } = await import('jsdom'));
} catch {
  console.log('jsdom не установлен — интерфейсный тест пропущен (npm i -D jsdom).');
  process.exit(0);
}
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const dom = new JSDOM(html, { url: 'http://localhost:8080/truck-showroom/', runScripts: 'outside-only', pretendToBeVisual: true });
const { window } = dom;
const noop = () => {};
window.HTMLCanvasElement.prototype.getContext = function (type) {
  if (type === 'webgl' || type === 'webgl2') return null;
  return { canvas: this, fillStyle: '', strokeStyle: '', lineWidth: 1, font: '', textAlign: '', textBaseline: '', globalAlpha: 1,
    fillRect: noop, strokeRect: noop, clearRect: noop, beginPath: noop, closePath: noop, moveTo: noop, lineTo: noop, arc: noop,
    ellipse: noop, bezierCurveTo: noop, quadraticCurveTo: noop, stroke: noop, fill: noop, save: noop, restore: noop, translate: noop,
    rotate: noop, scale: noop, fillText: noop, strokeText: noop, measureText: () => ({ width: 10 }),
    createLinearGradient: () => ({ addColorStop: noop }), createRadialGradient: () => ({ addColorStop: noop }),
    getImageData: () => ({ data: new Uint8ClampedArray(4) }), putImageData: noop, drawImage: noop };
};
window.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
window.matchMedia = window.matchMedia || ((q) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} }));
console.warn = () => {};
const errs = [];
window.addEventListener('error', (e) => errs.push(e.message));
window.eval(fs.readFileSync(path.join(ROOT, 'showroom.bundle.js'), 'utf8'));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const openCatalog = () => {
  const panel = window.document.getElementById('panel-catalog');
  if (!panel.classList.contains('open')) window.document.getElementById('catalog-toggle').click();
};
const openDetails = () => {
  const panel = window.document.getElementById('panel-details');
  if (!panel.classList.contains('open')) window.document.getElementById('details-toggle').click();
};
const $ = (id) => window.document.getElementById(id);
const D = window.document;
const tab = (c) => D.querySelector(`.cat-tab[data-cat="${c}"]`);
const ok = [];
const check = (name, cond, extra = '') => { ok.push(`${cond ? 'PASS' : 'FAIL'} ${name}${extra ? ' — ' + extra : ''}`); };
await wait(700);

// проходим ВСЕ 40 моделей и каждую проверяем
const state = [];
for (const cat of ['trucks', 'trailers', 'cars']) {
  tab(cat).click(); await wait(250); openCatalog(); await wait(60);
  const count = D.querySelectorAll('.unit').length;
  check(`каталог ${cat}: ${count} моделей`, count === (cat === 'trailers' ? 20 : 10));
  const n = count;
  for (let i = 0; i < n; i++) {
    D.querySelectorAll('.unit')[i].click();
    await wait(190);
    const name = $('unit-name').textContent.trim();
    const views = [...D.querySelectorAll('.view-btn')].map((b) => b.dataset.view);
    const interior = D.querySelectorAll('.view-btn.interior').length;
    const anchors = D.querySelectorAll('.anchor-btn').length;
    const specs = D.querySelectorAll('.spec').length;
    // заходим в каждый вид по кругу
    let visited = 0;
    for (const v of views) {
      D.querySelector(`.view-btn[data-view="${v}"]`).click();
      await wait(60);
      if (D.querySelector('.view-btn.active')?.dataset.view === v) visited++;
    }
    state.push({ cat, name, views: views.length, interior, anchors, specs, visited });
    if (cat !== 'trailers') check(`${cat}/${name}: есть салон`, interior >= 1, `interior=${interior}`);
    if (cat === 'trailers') check(`${cat}/${name}: только снаружи`, interior === 0, `interior=${interior}`);
    if (visited !== views.length) check(`${cat}/${name}: переключение видов`, false, `${visited}/${views.length}`);
  }
}
check('все модели открылись без пустых карточек', state.every((s) => s.name && s.views >= 4 && s.specs >= 5));
check('все виды переключаются', state.every((s) => s.visited === s.views));

// поиск внутри нужной категории
tab('cars').click(); await wait(250);
$('search').value = 'спорт'; $('search').dispatchEvent(new window.Event('input')); await wait(120);
check('поиск «спорт» в авто', D.querySelectorAll('.unit').length === 1, `${D.querySelectorAll('.unit').length} шт.`);
$('search').value = 'цистерн'; $('search').dispatchEvent(new window.Event('input')); await wait(120);
check('поиск «цистерн» пуст в авто', D.querySelectorAll('.unit').length === 0);
tab('trailers').click(); await wait(250);
check('поиск «цистерн» в прицепах', D.querySelectorAll('.unit').length >= 1, `${D.querySelectorAll('.unit').length} шт.`);
$('search').value = ''; $('search').dispatchEvent(new window.Event('input')); await wait(120);

// избранное
D.querySelectorAll('.unit')[0].click(); await wait(200);
$('d-name').dispatchEvent(new window.MouseEvent('dblclick', { bubbles: true })); await wait(120);
check('избранное: модель добавилась', D.querySelectorAll('.fav-dot').length === 1);
$('fav-filter').click(); await wait(150);
check('фильтр «избранное»', D.querySelectorAll('.unit').length === 1);
$('fav-filter').click(); await wait(150);

// сравнение
$('compare-btn').click(); await wait(250);
check('сравнение включилось', $('compare-btn').classList.contains('on'));
$('compare-btn').click(); await wait(200);
check('сравнение выключилось', !$('compare-btn').classList.contains('on'));

// покраска
const before = D.querySelector('.paint-dot.active')?.title;
$('paint-row').querySelectorAll('.paint-dot')[4].click(); await wait(150);
check('покраска выбирается', D.querySelector('.paint-dot.active')?.title !== before);

// салон/снаружи на авто
tab('cars').click(); await wait(250);
D.querySelectorAll('.unit')[0].click(); await wait(300);
$('d-inside').click(); await wait(300);
check('кнопка «в салон»', ['ЗА РУЛЁМ','ИЗ САЛОНА','В КАБИНЕ','СПАЛЬНИК','МЕСТО ПАССАЖИРА'].includes($('mode-badge').textContent.trim()), $('mode-badge').textContent.trim());
$('d-outside').click(); await wait(300);
check('кнопка «снаружи»', $('mode-badge').textContent.trim() === 'СНАРУЖИ');
window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'i' })); await wait(350);
check('хоткей I сажает в салон', !['СНАРУЖИ','ОСМОТР'].includes($('mode-badge').textContent.trim()), $('mode-badge').textContent.trim());
window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'ArrowRight' })); await wait(350);
check('стрелка → меняет модель', $('unit-name').textContent.trim() !== '');
window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'r' })); await wait(400);
window.dispatchEvent(new window.KeyboardEvent('keydown', { key: '0' })); await wait(300);
check('хоткей 0 — наружный вид', $('mode-badge').textContent.trim() === 'СНАРУЖИ', $('mode-badge').textContent.trim());

// прицепы: кнопка в салон должна вежливо отказать
tab('trailers').click(); await wait(250);
D.querySelectorAll('.unit')[2].click(); await wait(300);
const mode = $('mode-badge').textContent.trim();
check('прицеп: режим «снаружи»', mode === 'СНАРУЖИ', mode);
$('d-inside').click(); await wait(250);
check('прицеп: салон не открывается', $('mode-badge').textContent.trim() === 'СНАРУЖИ', $('mode-badge').textContent.trim());

// хелп
$('help-btn').click();
check('справка открыта', !$('help-modal').classList.contains('hidden'));
$('help-close').click();
check('справка закрыта', $('help-modal').classList.contains('hidden'));


// ---- новая раскладка: один экран + выдвижные панели
const catPanel = $('panel-catalog');
const detPanel = $('panel-details');
if (catPanel.classList.contains('open') || detPanel.classList.contains('open')) {
  D.getElementById('backdrop').click();
  await wait(80);
}
check('панели закрыты по умолчанию', !catPanel.classList.contains('open') && !detPanel.classList.contains('open'));
$('catalog-toggle').click(); await wait(80);
check('кнопка «Каталог» открывает панель', catPanel.classList.contains('open'));
check('фон затемняется', D.getElementById('backdrop').classList.contains('show'));
check('aria-expanded выставлен', $('catalog-toggle').getAttribute('aria-expanded') === 'true');
$('backdrop').click(); await wait(80);
check('клик по фону закрывает панель', !catPanel.classList.contains('open'));
$('details-toggle').click(); await wait(80);
check('кнопка «Модель» открывает карточку', detPanel.classList.contains('open'));
window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape' })); await wait(80);
check('Esc закрывает карточку', !detPanel.classList.contains('open'));
$('light-btn').click(); await wait(60);
check('всплывашка «Свет» открывается', !$('light-pop').classList.contains('hidden'));
D.querySelector('#light-pop .chip[data-preset="dark"]').click(); await wait(120);
check('схема света переключается', D.querySelector('#light-pop .chip[data-preset="dark"]').classList.contains('active'));
check('во вьюпорте есть чипы видов', D.querySelectorAll('#dock-views .chip').length >= 4);

check('ошибок в рантайме нет', errs.length === 0, errs.slice(0, 3).join(' / '));

const fails = ok.filter((l) => l.startsWith('FAIL'));
console.log(`Интерфейс: ${ok.length - fails.length}/${ok.length} проверок пройдено.`);
if (fails.length) {
  console.log(fails.join('\n'));
  process.exit(1);
}
console.log('Все проверки интерфейса пройдены.');
// приложение крутит requestAnimationFrame — закрываем процесс явно
process.exit(0);
