/* §90: прогон настоящей страницы в мини-браузере — доказательство, что пролёт виден.
   Собирает index.html + engine.js + bundle.js, крутит кадры и смотрит на живую страницу:
   гаснет ли заставка раньше времени, идёт ли время пролёта, оживает ли кнопка.

   Запуск: node tools/check-start.mjs  (нужен собранный bundle.js) */
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { makeWindow, tick } from '../../tools/bughunt/lib/dom.mjs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const { win, sandbox, document, timers } = makeWindow(html, { href: 'http://localhost/country-atlas/index.html' });
const run = (file, name) => vm.runInContext(readFileSync(new URL(file, import.meta.url), 'utf8'), sandbox, { filename: name });

let pass = 0, fail = 0;
const ok = (name, cond, extra = '') => {
  if (cond) { pass++; return true; }
  fail++;
  console.log('  ✗ ' + name + (extra ? '  → ' + extra : ''));
  return false;
};
const $ = (id) => document.getElementById(id);

run('../../shared/engine.js', 'shared/engine.js');
run('../bundle.js', 'country-atlas/bundle.js');

const loading = $('loading');
const btn = $('intro-start');
const point = $('intro-point');
const lt = win.__ratgradIntro;

ok('движок загрузился на страницу', !!win.GamesEngine && typeof win.GamesEngine.clock === 'function');
ok('пролёт собрался и запустился', !!lt && lt.running === true);
ok('часы пролёта — от движка, а не свои', !!lt && lt.clock.fromEngine === true, lt && lt.clock.engine);
ok('шаг пролёта 1/60 с', !!lt && Math.abs(lt.clock.fixedDt - 1 / 60) < 1e-9, lt && lt.clock.fixedDt);
ok('после загрузки заставка на экране', !loading.classList.contains('done'), loading.classList.value);
ok('кнопка пока ждёт', btn.disabled === true);
ok('текст загрузки говорит про пролёт', /пролёт/.test($('loading-text').textContent), $('loading-text').textContent);

tick(timers, 30);                            // 0.5 с кадров
ok('время пролёта идёт', lt.t > 0.3, lt.t.toFixed(2) + ' с');
ok('кадр проявляется из темноты', lt.fade > 0.4 && lt.fade <= 1, lt.fade.toFixed(2));
ok('кадры рисуются', lt.frames >= 25, lt.frames);
ok('точка пролёта подписана', /точка \d+ из \d+/.test(point.textContent), point.textContent);
ok('заставку не погасило через полсекунды', !loading.classList.contains('done'));

const firstPoint = point.textContent;
for (let i = 0; i < 40; i++) tick(timers, 30); // ≈ 20 с кадров
ok('через 20 секунд пролёт всё ещё идёт', lt.running === true);
ok('заставка всё ещё видна — это и есть «где анимации»', !loading.classList.contains('done'));
ok('камера ушла дальше первой точки', point.textContent !== firstPoint, point.textContent);
ok('время пролёта больше 15 с', lt.t > 15, lt.t.toFixed(1) + ' с');
ok('проявление закончилось', lt.fade === 1);
ok('крен камеры в пределах настройки', Math.abs(lt.bank) <= 0.0351, lt.bank.toFixed(4));
ok('кадров больше сотни', lt.frames > 150, lt.frames);

for (let i = 0; i < 80; i++) tick(timers, 30); // ещё ≈ 40 с
ok('через минуту пролёт не оборвался', lt.running === true && lt.t > 55, lt.t.toFixed(1));
ok('заставка жива и на 60-й секунде', !loading.classList.contains('done'));
ok('полоска круга дошла до середины', (() => {
  const p = ((lt.t / 9.2) % lt.points.length) / lt.points.length;
  return p > 0.05 && p < 0.95;
})(), lt.t.toFixed(1));

// страховка: если мир не успел собраться, через 15 секунд кнопка всё равно оживает
const slow = timers.timeout.filter((t) => t.ms > 50);
timers.timeout = timers.timeout.filter((t) => t.ms <= 50);
slow.forEach((t) => t.fn());
ok('кнопка ожила после страховки', btn.disabled === false);
btn.click();
tick(timers, 2);
ok('после нажатия заставка уходит', loading.classList.contains('done'));
ok('пролёт остановлен', lt.running === false);
ok('пролёт не сломал карту мира', !!win.__ratgradIntro && typeof win.__ratgradIntro.draw === 'function');

// «карта мира»: кнопка обязана открывать экран сразу после загрузки страницы
const worldBtn = $('world-open');
ok('кнопка «карта мира» на месте', !!worldBtn);
let worldErr = null;
try { worldBtn.click(); } catch (err) { worldErr = err.message; }
tick(timers, 10);
const worldScreen = $('world-screen');
ok('клик по «карта мира» не падает', !worldErr, worldErr || '');
ok('экран мира открылся', !!(worldScreen && worldScreen.classList.contains('open')));
ok('карта мира не пустая', /стран \d+/.test(($('world-stats') || {}).textContent || ''), (($('world-stats') || {}).textContent || '').slice(0, 40));

console.log(`\nOK: живая страница · ${pass} проверок · пролёт ${lt.t.toFixed(1)} с, кадров ${lt.frames}`);
if (fail) { console.log(`FAIL: ${fail}`); process.exit(1); }
process.exit(0);
