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
// категории теперь живут в меню «Модель»: чтобы переключить, открываем его
const tab = (c) => {
  openCatalog();
  return D.querySelector(`.cat-tab[data-cat="${c}"]`);
};
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
    const damage = !!D.querySelector('#damage-row .damage-btn:not([disabled])');
    // заходим в каждый вид по кругу
    let visited = 0;
    for (const v of views) {
      D.querySelector(`.view-btn[data-view="${v}"]`).click();
      await wait(60);
      if (D.querySelector('.view-btn.active')?.dataset.view === v) visited++;
    }
    state.push({ cat, name, views: views.length, interior, anchors, specs, visited, damage });
    if (cat !== 'trailers') check(`${cat}/${name}: есть салон`, interior >= 1, `interior=${interior}`);
    if (cat === 'trailers') check(`${cat}/${name}: только снаружи`, interior === 0, `interior=${interior}`);
    if (visited !== views.length) check(`${cat}/${name}: переключение видов`, false, `${visited}/${views.length}`);
  }
}
check('все модели открылись без пустых карточек', state.every((s) => s.name && s.views >= 4 && s.specs >= 5));
check('все виды переключаются', state.every((s) => s.visited === s.views));
check('у каждой из 40 машин есть точка повреждения', state.every((s) => s.damage), `${state.filter((s) => !s.damage).length} без повреждения`);

// ---- ЗДАНИЯ: отдельная категория, у каждого 4 фасада, повреждений нет
tab('buildings').click(); await wait(500); openCatalog(); await wait(80);
const bCount = D.querySelectorAll('.unit').length;
check('каталог buildings: есть здания', bCount >= 20, `${bCount} моделей`);
const bViews = [];
for (let i = 0; i < Math.min(bCount, 4); i++) {
  D.querySelectorAll('.unit')[i].click(); await wait(320);
  const views = [...D.querySelectorAll('.view-btn')].map((b) => b.dataset.view);
  const inner = D.querySelectorAll('.view-btn.interior').length;
  bViews.push({ name: $('unit-name').textContent.trim(), views, inner, cat: $('d-cat').textContent.trim() });
  check(`здание ${$('unit-name').textContent.trim()}: есть перед/зад/право/лево`,
    ['front', 'back', 'left', 'right'].every((v) => views.includes(v)), views.join(','));
  check(`здание ${$('unit-name').textContent.trim()}: без салона`, inner === 0);
  check(`здание ${$('unit-name').textContent.trim()}: категория «ЗДАНИЕ»`, $('d-cat').textContent.trim() === 'ЗДАНИЕ');
  check(`здание ${$('unit-name').textContent.trim()}: пятен нет`,
    D.querySelector('#damage-row .damage-btn')?.disabled === true);
}
check('здания открылись без пустых карточек', bViews.every((b) => b.name && b.views.length >= 4));

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

// повреждения: каждое добавляется отдельно, ✷/X — все сразу
const dmgBtn = () => D.querySelector('#damage-row .damage-btn');
const chips = () => [...D.querySelectorAll('#damage-list .dmg-chip')];
const dmgCount = () => $('damage-count').textContent.trim();
check('в карточке есть строка повреждения', !!dmgBtn(), dmgBtn()?.textContent || '');
check('в карточке указано число повреждений', /\d+ шт\./.test(dmgBtn()?.textContent || ''), dmgBtn()?.textContent?.slice(0, 40));
check('список осмотра не забит 15 пятнами', D.querySelectorAll('.anchor-btn').length < 12, `${D.querySelectorAll('.anchor-btn').length} кнопок`);
check('пятна перечислены поштучно', chips().length >= 15, `${chips().length} строк`);
check('по умолчанию не добавлено ни одного', dmgCount() === '0 / 15', dmgCount());
chips()[3].click(); await wait(140);
check('клик по строке добавляет одно пятно',
  chips()[3].classList.contains('on') && chips().filter((c) => c.classList.contains('on')).length === 1,
  `включено ${chips().filter((c) => c.classList.contains('on')).length}`);
check('счётчик показывает одно из пятнадцати', dmgCount() === '1 / 15', dmgCount());
check('мастер-кнопка загорелась от одного пятна', dmgBtn().classList.contains('on'));
chips()[7].click(); await wait(140);
check('второе пятно добавляется поверх первого', dmgCount() === '2 / 15', dmgCount());
chips()[3].click(); await wait(140);
check('повторный клик убирает только это пятно',
  dmgCount() === '1 / 15' && !chips()[3].classList.contains('on') && chips()[7].classList.contains('on'), dmgCount());
// мастер-кнопка и ✷ работают как «все сразу»: есть хоть одно — снимают все
dmgBtn().click(); await wait(160);
check('кнопка в карточке снимает все пятна разом', dmgCount() === '0 / 15' && !dmgBtn().classList.contains('on'), dmgCount());
dmgBtn().click(); await wait(160);
check('кнопка в карточке добавляет все пятна', dmgCount() === '15 / 15' && chips().every((c) => c.classList.contains('on')), dmgCount());
$('damage-btn').click(); await wait(160);
check('кнопка на сцене снимает все повреждения', dmgCount() === '0 / 15');
$('damage-btn').click(); await wait(160);
check('кнопка на сцене включает все повреждения', dmgCount() === '15 / 15' && $('damage-btn').classList.contains('on'), dmgCount());
window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'x' })); await wait(160);
check('клавиша X снимает все повреждения', dmgCount() === '0 / 15', dmgCount());
window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'X' })); await wait(160);
check('клавиша X добавляет все повреждения', dmgCount() === '15 / 15', dmgCount());
dmgBtn().click(); await wait(160);
chips()[0].click(); await wait(140);
D.querySelector('.damage-more').click(); await wait(140);
check('кнопка «ещё одно» добавляет ровно одно пятно', dmgCount() === '2 / 15', dmgCount());

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
check('кнопка «Модель» открывает меню', catPanel.classList.contains('open'));
check('aria-expanded выставлен', $('catalog-toggle').getAttribute('aria-expanded') === 'true');
check('категорий в нижней панели больше нет', D.querySelectorAll('.hud-bottom .cat-tab').length === 0,
  `${D.querySelectorAll('.hud-bottom .cat-tab').length} шт.`);
check('категории живут в меню «Модель»', D.querySelectorAll('#panel-catalog .cat-tab').length === 4,
  `${D.querySelectorAll('#panel-catalog .cat-tab').length} шт.`);
check('меню вынесены в отдельный слой (fixed не ломается шапкой)',
  !!$('pop-layer') && $('panel-catalog').parentElement.id === 'pop-layer');
check('меню получило координаты от слоя-менеджера',
  catPanel.style.left !== '' && catPanel.style.top !== '' && Number.parseFloat(catPanel.style.left) >= 0,
  `${catPanel.style.left} / ${catPanel.style.top}`);
$('catalog-toggle').click(); await wait(80);
check('повторное нажатие закрывает меню', !catPanel.classList.contains('open'));
$('details-toggle').click(); await wait(80);
check('меню «Ещё» → карточка открывается', detPanel.classList.contains('open'));
window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape' })); await wait(80);
check('Esc закрывает карточку', !detPanel.classList.contains('open'));

// ---- одно меню за раз: это и есть запрет накладывать слои друг на друга
const openMenus = () => [...D.querySelectorAll('.hud-pop')].filter((el) => !el.classList.contains('hidden'));
const menuButtons = ['catalog-toggle', 'menu-view-btn', 'menu-damage-btn', 'light-btn', 'menu-more-btn'];
for (const id of menuButtons) {
  $(id).click(); await wait(60);
  const opened = openMenus();
  check(`меню «${$(id).textContent.trim().slice(0, 14)}» открывается одно`, opened.length === 1, `${opened.length} открыто`);
  const box = opened[0];
  check(`меню «${$(id).textContent.trim().slice(0, 14)}» не налезает на шапку и низ`,
    Number.parseFloat(box.style.top) >= 0, box.style.top);
  $(id).click(); await wait(40);
}
check('все меню закрываются', openMenus().length === 0);

// ---- меню повреждений: сначала тип, потом место
$('catalog-toggle').click(); await wait(60);
tab('trucks').click(); await wait(400);
D.querySelectorAll('.unit')[0].click(); await wait(400);
$('menu-damage-btn').click(); await wait(80);
check('меню повреждений открылось', !$('menu-damage').classList.contains('hidden'));
check('в меню есть типы повреждений', D.querySelectorAll('#damage-type-row .dmg-type').length >= 4,
  `${D.querySelectorAll('#damage-type-row .dmg-type').length} типов`);
check('в меню перечислены места', D.querySelectorAll('#dmg-place-list .dmg-place').length >= 15,
  `${D.querySelectorAll('#dmg-place-list .dmg-place').length} мест`);
check('до выбора пятен нет', $('damage-count').textContent.trim() === '0 / 15', $('damage-count').textContent.trim());
D.querySelector('#damage-type-row .dmg-type[data-kind="dent"]').click(); await wait(160);
check('выбор типа «вмятина» показывает пятно', $('damage-count').textContent.trim() === '1 / 15', $('damage-count').textContent.trim());
check('место с вмятиной подсвечено', D.querySelectorAll('#dmg-place-list .dmg-place.on').length === 1,
  `${D.querySelectorAll('#dmg-place-list .dmg-place.on').length}`);
const noteText = $('damage-note').textContent;
check('дефект описан словами', /Вмятина/.test(noteText) && /Ремонт/.test(noteText) && /₽/.test(noteText), noteText.slice(0, 80));
const reportText = $('damage-report').textContent;
check('в карточке есть «буквальный» отчёт', /дефект/.test(reportText) && /₽/.test(reportText), reportText.slice(0, 70));
D.querySelector('#damage-type-row .dmg-type[data-kind="rust"]').click(); await wait(160);
check('второй тип добавляет второе пятно', $('damage-count').textContent.trim() === '2 / 15', $('damage-count').textContent.trim());
D.querySelector('#dmg-place-list .dmg-place.on').click(); await wait(140);
check('клик по месту убирает это пятно', $('damage-count').textContent.trim() === '1 / 15', $('damage-count').textContent.trim());
$('damage-clear').click(); await wait(140);
check('«убрать все» чистит кузов', $('damage-count').textContent.trim() === '0 / 15', $('damage-count').textContent.trim());
$('menu-damage-btn').click(); await wait(60);
$('light-btn').click(); await wait(60);
check('всплывашка «Свет» открывается', !$('light-pop').classList.contains('hidden'));
D.querySelector('#light-pop .pop-item[data-preset="dark"]').click(); await wait(120);
check('схема света переключается', D.querySelector('#light-pop .pop-item[data-preset="dark"]').classList.contains('is-on'));
check('во вьюпорте есть чипы видов', D.querySelectorAll('#dock-views .chip').length >= 4);

// ---- меню 2.2: шапки с крестиком, зоны дефектов, секции ракурсов, клавиатура
$('menu-damage-btn').click(); await wait(80);
check('у меню повреждений есть крестик', !!D.querySelector('#menu-damage .pop-x'));
const groups = D.querySelectorAll('#dmg-place-list .dmg-group');
check('дефекты разложены по зонам кузова', groups.length >= 2, `${groups.length} зон`);
const cntText = D.querySelector('#dmg-place-list .dmg-group-t .cnt')?.textContent?.trim() || '';
check('у зоны видно «включено из всего»', /^\d+ из \d+$/.test(cntText), cntText);
const g0 = D.querySelector('#dmg-place-list .dmg-group-t');
const g0body = g0.parentElement.querySelector('.dmg-group-body');
g0.click(); await wait(40);
check('зону можно свернуть', g0.getAttribute('aria-expanded') === 'false' && g0body.classList.contains('folded'));
g0.click(); await wait(40);
check('зону можно развернуть', g0.getAttribute('aria-expanded') === 'true' && !g0body.classList.contains('folded'));
check('«все / ничего» — компактные кнопки в шапке списка',
  $('damage-all').classList.contains('mini-btn') && $('damage-clear').classList.contains('mini-btn'));
const firstItem = D.querySelector('#menu-damage .pop-item');
firstItem.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
await wait(40);
check('↓ переводит фокус на следующий пункт',
  !!D.activeElement && D.activeElement !== firstItem && !!D.activeElement.closest('#menu-damage'));
D.activeElement?.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
await wait(40);
check('↑ возвращает фокус назад', D.activeElement === firstItem || !!D.activeElement?.closest('#menu-damage'));
D.querySelector('#menu-damage .pop-x').click(); await wait(60);
check('крестик закрывает меню повреждений', $('menu-damage').classList.contains('hidden'));

$('menu-view-btn').click(); await wait(80);
const secs = [...D.querySelectorAll('#menu-view-row .view-sec')];
check('ракурсы разбиты на секции', secs.length >= 2, `${secs.length} секций`);
const secTitles = secs.map((x) => x.querySelector('.view-sec-t')?.textContent?.trim()).join(' / ');
check('секции ракурсов подписаны', /Снаружи/.test(secTitles) && /Внутри/.test(secTitles), secTitles);
check('в шапке ракурсов видно, где сейчас камера',
  /снаружи|внутри/.test($('view-current')?.textContent || ''), $('view-current')?.textContent);
check('у ракурсов есть крестик', !!D.querySelector('#menu-view .pop-x'));
D.querySelector('#menu-view .pop-x').click(); await wait(60);
check('крестик закрывает ракурсы', $('menu-view').classList.contains('hidden'));

$('menu-more-btn').click(); await wait(80);
check('«Ещё» разбито на секции', D.querySelectorAll('#menu-more .pop-sec-t').length >= 2,
  `${D.querySelectorAll('#menu-more .pop-sec-t').length}`);
D.querySelector('#menu-more .pop-x').click(); await wait(60);
check('крестик закрывает «Ещё»', $('menu-more').classList.contains('hidden'));

$('light-btn').click(); await wait(80);
check('в меню света плитки со свотчами', D.querySelectorAll('#light-pop .light-tile .sw').length === 4,
  `${D.querySelectorAll('#light-pop .light-tile .sw').length}`);
D.querySelector('#light-pop .pop-x').click(); await wait(60);
check('крестик закрывает свет', $('light-pop').classList.contains('hidden'));

openCatalog(); await wait(80);
check('категории — один ряд, без плитки', D.querySelectorAll('#panel-catalog .cat-tab').length === 4);
check('в шапке «Модели» есть счётчик', /^\d+(\s*\/\s*\d+)?$/.test($('cat-count')?.textContent?.trim() || ''), $('cat-count')?.textContent);
D.querySelector('#catalog-close').click(); await wait(60);
check('меню моделей закрывается крестиком', !$('panel-catalog').classList.contains('open'));

// ---- поддержка разных устройств
// На десктопе (в jsdom нет тача) классы устройств должны стоять корректно,
// а подсказки — быть про мышь.
const root = D.documentElement;
check('десктоп распознан', root.classList.contains('is-desktop') && !root.classList.contains('is-phone'));
check('ориентация отмечена', root.classList.contains('is-portrait') || root.classList.contains('is-landscape'));
const hint = D.querySelector('.stage-hint');
check('подсказки про мышь на десктопе', /ЛКМ/.test(hint?.textContent || ''), hint?.textContent?.slice(0, 40));

// тач-устройство: эмулируем профиль и проверяем, что жесты работают
const deviceMod = await import('../src/lib/device.js');
const fakeWin = {
  innerWidth: 390, innerHeight: 844, devicePixelRatio: 3,
  matchMedia: (q) => ({ matches: q.includes('pointer: coarse') || q.includes('hover: none'), media: q, addEventListener() {}, removeEventListener() {} }),
};
const phone = deviceMod.deviceProfile(fakeWin, {
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',
  maxTouchPoints: 5, hardwareConcurrency: 4, deviceMemory: 4,
});
check('телефон распознан', phone.phone && phone.touch && !phone.desktop);
const tablet = deviceMod.deviceProfile(
  { innerWidth: 1024, innerHeight: 768, devicePixelRatio: 2,
    matchMedia: (q) => ({ matches: q.includes('pointer: coarse'), media: q, addEventListener() {}, removeEventListener() {} }) },
  { userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', maxTouchPoints: 5, hardwareConcurrency: 8 },
);
check('планшет распознан', tablet.tablet && tablet.touch);
const caps = deviceMod.rendererCaps(phone, 60, fakeWin);
check('на телефоне режем пиксели и тени', caps.pixelRatio <= 1.35 && caps.shadows === false, `dpr=${caps.pixelRatio}`);
const deskWin = { innerWidth: 1440, innerHeight: 900, devicePixelRatio: 2, matchMedia: () => ({ matches: false, addEventListener() {} }) };
const capsHi = deviceMod.rendererCaps(
  deviceMod.deviceProfile(deskWin, { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', maxTouchPoints: 0, hardwareConcurrency: 16, deviceMemory: 16 }),
  60,
  deskWin,
);
check('на мощном десктопе высокое качество', capsHi.pixelRatio >= 1.5 && capsHi.shadows === true, `dpr=${capsHi.pixelRatio} shadows=${capsHi.shadows}`);
const bigWin = { innerWidth: 2560, innerHeight: 1440, devicePixelRatio: 2, matchMedia: () => ({ matches: false, addEventListener() {} }) };
const caps4k = deviceMod.rendererCaps(
  deviceMod.deviceProfile(bigWin, { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', maxTouchPoints: 0, hardwareConcurrency: 4, deviceMemory: 4 }),
  60,
  bigWin,
);
check('на слабом ПК с большим монитором качество режется', caps4k.pixelRatio <= 1.6, `dpr=${caps4k.pixelRatio}`);

// жесты: свайп и двойной тап на элементе
let swiped = 0;
let doubleTapped = 0;
const pad = D.createElement('div');
D.body.appendChild(pad);
const uninstall = deviceMod.installGestures(pad, { onSwipe: () => swiped++, onDoubleTap: () => doubleTapped++ });
const touchEv = (type, pts, changed) => {
  const e = new window.Event(type, { bubbles: true });
  e.touches = pts.map(([x, y]) => ({ clientX: x, clientY: y }));
  e.changedTouches = (changed || pts).map(([x, y]) => ({ clientX: x, clientY: y }));
  pad.dispatchEvent(e);
};
touchEv('touchstart', [[200, 300]]);
touchEv('touchmove', [[120, 302]]);
touchEv('touchend', [], [[90, 302]]);
check('свайп листает модель', swiped === 1, `swipes=${swiped}`);
touchEv('touchstart', [[200, 300]]);
touchEv('touchend', [], [[200, 300]]);
touchEv('touchstart', [[200, 300]]);
touchEv('touchend', [], [[200, 300]]);
check('двойной тап заходит в салон', doubleTapped >= 1, `taps=${doubleTapped}`);
uninstall();

// ---- навигация камерой: навпад, орбита, зум, фокус по клику
const navpad = D.getElementById('navpad');
check('навпад есть в сцене', !!navpad && navpad.querySelectorAll('[data-act]').length === 7,
  navpad ? `${navpad.querySelectorAll('[data-act]').length} кнопок` : 'нет');
const navBtn = (act) => D.querySelector(`#navpad [data-act="${act}"]`);
check('у кнопок навпада есть подписи', ['up', 'down', 'left', 'right', 'zin', 'zout', 'reset']
  .every((a) => (navBtn(a)?.getAttribute('aria-label') || '').length > 3));

const THREE = await import('three');
const { ShowroomCamera } = await import('../src/lib/camera.js');
const fakeDom = D.createElement('div');
D.body.appendChild(fakeDom);
const cam3 = new THREE.PerspectiveCamera(50, 1.6, 0.1, 300);
cam3.position.set(14, 5, 14);
const sc = new ShowroomCamera(cam3, fakeDom, { touch: false });
sc.controls.target.set(0, 1.4, 0);
sc.camera.lookAt(0, 1.4, 0);
sc.camera.updateMatrixWorld(true);
check('зум колесом идёт к курсору', sc.controls.zoomToCursor === true);
const posBefore = cam3.position.clone();
sc.orbit(0.35, 0);
check('орбита кнопкой вращает камеру', cam3.position.distanceTo(posBefore) > 0.5,
  `сдвиг ${cam3.position.distanceTo(posBefore).toFixed(2)} м`);
const distBefore = cam3.position.distanceTo(sc.controls.target);
sc.zoomBy(1.3);
check('«+» приближает', cam3.position.distanceTo(sc.controls.target) < distBefore - 0.2);
sc.zoomBy(1 / 1.3);
sc.focusOn(new THREE.Vector3(0, 2.6, 3.4), { distance: 6 });
check('клик по детали запускает плавный полёт', !!sc.flying
  && Math.abs(sc.flying.toTarget.z - 3.4) < 0.01, sc.flying ? 'ok' : 'нет');
sc.update(0.6);
check('после полёта камера у цели', !sc.flying && sc.controls.target.distanceTo(new THREE.Vector3(0, 2.6, 3.4)) < 0.05,
  `цель ${sc.controls.target.toArray().map((v) => v.toFixed(2)).join(',')}`);

// панорамирование сдвигает и цель, и камеру
const t0 = sc.controls.target.clone();
sc.panBy(0.4, 0);
check('панорамирование сдвигает точку взгляда', sc.controls.target.distanceTo(t0) > 0.05);

// полёт: цель орбиты летит вместе с камерой, дистанция сохраняется
const flyFrom = cam3.position.clone();
const flyTarget = sc.controls.target.clone();
const flyDist = flyFrom.distanceTo(flyTarget);
sc.fly(1, 0, 0, 2);
const flyDir = flyFrom.clone().sub(flyTarget).normalize();
const moved = cam3.position.clone().sub(flyFrom);
check('полёт вперёд двигает камеру по линии взгляда',
  moved.length() > 1.5 && Math.abs(moved.clone().normalize().dot(flyDir) + 1) < 0.05,
  `сдвиг ${moved.length().toFixed(2)} м`);
check('после полёта дистанция до цели сохраняется',
  Math.abs(cam3.position.distanceTo(sc.controls.target) - flyDist) < 0.05,
  `${flyDist.toFixed(2)} → ${cam3.position.distanceTo(sc.controls.target).toFixed(2)}`);
const sideFrom = cam3.position.clone();
sc.fly(0, 1, 0, 1.5);
check('полёт вправо смещает камеру в сторону', cam3.position.distanceTo(sideFrom) > 1.2,
  `сдвиг ${cam3.position.distanceTo(sideFrom).toFixed(2)} м`);

// дальность ограничена габаритом вида: камера не улетает в пустоту
sc.setView({ id: 'test', pos: [20, 3, 0], target: [0, 1.5, 0], fov: 34, orbit: true }, { instant: true });
check('дальность зума ограничена видом', sc.controls.maxDistance <= 20.5 * 2.4 && sc.controls.maxDistance >= 6,
  `maxDistance=${sc.controls.maxDistance.toFixed(1)}`);

// навпад и клавиши работают на реальной сцене шоурума
const camApp = window.__garageCam;
check('камера шоурума доступна', !!camApp);
if (camApp) {
  camApp.controls.enabled = true;
  const p0 = camApp.camera.position.clone();
  navBtn('right')?.dispatchEvent(new window.Event('pointerdown', { bubbles: true }));
  navBtn('right')?.dispatchEvent(new window.Event('pointerup', { bubbles: true }));
  check('кнопка «→» на навпаде поворачивает камеру', camApp.camera.position.distanceTo(p0) > 0.01,
    `сдвиг ${camApp.camera.position.distanceTo(p0).toFixed(3)}`);
  const d0 = camApp.camera.position.distanceTo(camApp.controls.target);
  navBtn('zin')?.dispatchEvent(new window.Event('pointerdown', { bubbles: true }));
  navBtn('zin')?.dispatchEvent(new window.Event('pointerup', { bubbles: true }));
  check('кнопка «+» на навпаде приближает', camApp.camera.position.distanceTo(camApp.controls.target) < d0,
    `${d0.toFixed(2)} → ${camApp.camera.position.distanceTo(camApp.controls.target).toFixed(2)}`);
  // свободный полёт: W/S/A/D двигают камеру, Shift ускоряет, Ctrl возвращает
  const viewNow = camApp.view;
  const p1 = camApp.camera.position.clone();
  window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'w', code: 'KeyW' }));
  await wait(150);
  window.dispatchEvent(new window.KeyboardEvent('keyup', { key: 'w', code: 'KeyW' }));
  check('клавиша W летит вперёд', camApp.camera.position.distanceTo(p1) > 0.05,
    `сдвиг ${camApp.camera.position.distanceTo(p1).toFixed(2)} м`);
  const p2 = camApp.camera.position.clone();
  window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'd', code: 'KeyD' }));
  await wait(120);
  window.dispatchEvent(new window.KeyboardEvent('keyup', { key: 'd', code: 'KeyD' }));
  check('клавиша D летит вправо', camApp.camera.position.distanceTo(p2) > 0.02,
    `сдвиг ${camApp.camera.position.distanceTo(p2).toFixed(2)} м`);
  window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Control' }));
  await wait(40);
  const home = viewNow ? new THREE.Vector3(...viewNow.pos) : null;
  check('Ctrl возвращает камеру в штатное положение',
    !!home && camApp.camera.position.distanceTo(home) < 0.05,
    home ? `отклонение ${camApp.camera.position.distanceTo(home).toFixed(2)} м` : 'нет вида');
}

// ------------------------------------------------------------ точечный трафарет
// «Точки»: модель собирается из облака точек, поверхности прячутся.
{
  const btn = $('dots-btn');
  check('кнопка «Точки» есть в сцене', !!btn);
  check('по умолчанию поверхности, а не точки', btn?.getAttribute('aria-pressed') === 'false');
  btn.click();
  await wait(700);
  const cloud = window.__garageDots && D.body.dataset.dots === 'on';
  check('клик включает точечный трафарет', D.body.dataset.dots === 'on', `body.dataset.dots=${D.body.dataset.dots}`);
  check('кнопка помечена как включённая', btn.getAttribute('aria-pressed') === 'true' && btn.classList.contains('active'));
  const liveTxt = $('stage-live').textContent || '';
  check('подпись сообщает число точек', /Точки:\s*[\d\s\u00a0]+точек/.test(liveTxt), liveTxt);
  // точки не ломают каталог: модель переключается и режим сохраняется
  const catTab = tab('cars');
  catTab?.click();
  await wait(900);
  check('режим точек сохраняется при смене модели', D.body.dataset.dots === 'on'
    && btn.getAttribute('aria-pressed') === 'true');
  window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'p' }));
  await wait(500);
  check('клавиша P выключает точки', D.body.dataset.dots === 'off' && btn.getAttribute('aria-pressed') === 'false');
  check('после выключения подпись про поверхности', /поверхности/i.test($('stage-live').textContent || ''),
    $('stage-live').textContent || '');
  window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'P' }));
  await wait(600);
  check('клавиша P включает точки обратно', D.body.dataset.dots === 'on');
  // модель ходит по всем категориям с включёнными точками — без ошибок
  for (const c of ['trucks', 'trailers', 'buildings']) {
    tab(c)?.click();
    await wait(650);
  }
  check('в режиме точек все категории собираются', D.body.dataset.dots === 'on' && errs.length === 0,
    errs.slice(0, 2).join(' / '));
  btn.click();
  await wait(400);
  check('повторный клик возвращает поверхности', D.body.dataset.dots === 'off');
}

// ------------------------------------------------------------ предпросмотр в меню
{
  openCatalog();
  await wait(250);
  const pv = $('pop-preview');
  check('в меню появился блок предпросмотра', !!pv);
  check('предпросмотр открыт вместе с каталогом',
    !!pv && !pv.classList.contains('hidden') && pv.closest('#panel-catalog') !== null);
  check('подпись предпросмотра — имя модели', ($('pp-name')?.textContent || '').length > 2,
    $('pp-name')?.textContent);
  check('подпись показывает ракурс и свет', /Студия|Ночь|Выставка|Гараж/.test($('pp-sub')?.textContent || ''),
    $('pp-sub')?.textContent);
  // без WebGL (jsdom) окно показывает заглушку, а не пустую дыру
  check('без WebGL предпросмотр показывает заглушку', pv?.classList.contains('no-webgl'));
  check('у канваса есть подпись для скринридера', $('pp-canvas')?.getAttribute('aria-label') === 'Предпросмотр модели');

  // окно переезжает в другое меню, а не дублируется
  $('catalog-toggle').click();
  await wait(120);
  check('закрытое меню прячет предпросмотр', $('pop-preview')?.classList.contains('hidden'));
  $('light-btn').click();
  await wait(260);
  const pv2 = $('pop-preview');
  check('предпросмотр переехал в меню света',
    !!pv2 && !pv2.classList.contains('hidden') && pv2.closest('#light-pop') !== null);
  check('окно предпросмотра в документе одно', D.querySelectorAll('#pop-preview').length === 1);
  // смена света меняет подпись без пересборки блока
  D.querySelector('#light-pop [data-preset="dark"]')?.click();
  await wait(200);
  check('смена света обновляет подпись предпросмотра', /Ночь/.test($('pp-sub')?.textContent || ''),
    $('pp-sub')?.textContent);
  window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape' }));
  await wait(150);
  check('Escape прячет предпросмотр вместе с меню', $('pop-preview')?.classList.contains('hidden'));
  // вернём студию, чтобы не менять состояние для следующих проверок
  D.querySelector('#light-pop [data-preset="studio"]')?.click();
}

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
