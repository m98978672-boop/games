// Дымовой тест в jsdom: поднимаем страницу, стартуем войну, жмём клавиши и кнопки.
// Требует jsdom (не часть CI-зависимостей): npm i --no-save jsdom
let JSDOM;
try {
  ({ JSDOM } = await import('jsdom'));
} catch (e) {
  console.log('jsdom не установлен — тест пропущен (npm i --no-save jsdom)');
  process.exit(0);
}
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = await readFile(path.join(root, 'index.html'), 'utf8');
const dom = new JSDOM(html, { url: 'http://localhost/', pretendToBeVisual: true, runScripts: 'outside-only' });
const { window } = dom;

// --- заглушка canvas 2D ---
const ctx2d = new Proxy({}, {
  get(target, prop) {
    if (prop === 'canvas') return null;
    if (prop === 'measureText') return () => ({ width: 10 });
    if (prop === 'createRadialGradient' || prop === 'createLinearGradient') return () => ({ addColorStop() {} });
    if (prop === 'getImageData') return () => ({ data: new Uint8ClampedArray(4) });
    if (typeof prop === 'string' && ['fillStyle', 'strokeStyle', 'lineWidth', 'font', 'globalAlpha', 'textAlign', 'imageSmoothingEnabled'].includes(prop)) return target[prop];
    return () => {};
  },
  set(target, prop, value) { target[prop] = value; return true; },
});
window.HTMLCanvasElement.prototype.getContext = () => ctx2d;
window.HTMLCanvasElement.prototype.toDataURL = () => 'data:image/png;base64,';

// Image: сразу «ошибка», чтобы проверить ветку с процедурными заглушками
window.Image = class { set src(v) { this._src = v; setTimeout(() => this.onerror && this.onerror(new Error('no image')), 0); } get src() { return this._src; } };
window.HTMLImageElement = window.Image;

const errors = [];
window.addEventListener('error', (e) => errors.push('error: ' + (e.message || e.error)));
window.addEventListener('unhandledrejection', (e) => errors.push('rejection: ' + (e.reason && e.reason.message)));
const origWarn = console.warn;
console.warn = (...a) => { origWarn(...a); };

// jsdom-объекты подставляем только там, где Node не мешает
global.window = window;
global.document = window.document;
try { Object.defineProperty(global, 'navigator', { value: window.navigator, configurable: true }); } catch (e) { /* уже есть */ }
global.localStorage = window.localStorage;
global.HTMLCanvasElement = window.HTMLCanvasElement;
global.Image = window.Image;
global.requestAnimationFrame = window.requestAnimationFrame.bind(window);
global.AudioContext = undefined;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const click = (el) => el && el.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
const key = (code) => {
  window.dispatchEvent(new window.KeyboardEvent('keydown', { code, bubbles: true }));
  window.dispatchEvent(new window.KeyboardEvent('keyup', { code, bubbles: true }));
};

let fails = 0;
const ok = (cond, msg) => { if (!cond) { fails++; console.log('FAIL', msg); } else console.log('ok  ', msg); };

await import(pathToFileURL(path.join(root, 'src/main.js')).href);
await sleep(300);

const doc = window.document;
ok(doc.querySelector('.menu-grid'), 'главное меню построено');
const cards = [...doc.querySelectorAll('[data-act]')].map((c) => c.dataset.act);
ok(cards.includes('new-soldier') && cards.includes('ai-vs-ai'), 'кнопки старта на месте');

// старт солдатской войны
click(doc.querySelector('[data-act="new-soldier"]'));
await sleep(700);
const game = window.__frontline.game;
ok(!!game, 'игра создана');
ok(window.__frontline.renderer && window.__frontline.hud, 'рендерер и HUD созданы');
ok(!doc.getElementById('hud').classList.contains('hidden'), 'HUD показан');
ok(doc.querySelectorAll('.squad-item').length > 0, 'список отрядов заполнен');
ok(doc.querySelector('#hud-res').textContent.length > 0, 'ресурсы отображаются');
ok(game.playerUnit && game.playerUnit.alive, 'боец игрока существует');

// клавиши и режимы
key('Tab');
await sleep(120);
ok(game.mode === 'commander', 'Tab переключает в командира');
key('Tab');
await sleep(120);
ok(game.mode === 'soldier', 'Tab возвращает в солдата');

key('KeyB');
await sleep(120);
ok(doc.getElementById('hud-build').classList.contains('show'), 'меню стройки открылось');
key('KeyB');
key('KeyT');
await sleep(120);
ok(doc.getElementById('hud-directive-panel').classList.contains('show'), 'панель директив открылась');
key('Escape');
await sleep(120);
ok(game.paused === false && !doc.getElementById('overlay').classList.contains('show'), `Esc закрывает панель, а не ставит паузу (paused=${game.paused}, dir=${window.__frontline.hud.directiveOpen}, overlay=${doc.getElementById('overlay').className})`);

// пауза через кнопку
click(doc.querySelector('[data-speed="0"]'));
await sleep(80);
ok(game.paused === true, 'кнопка паузы ставит игру на паузу');
click(doc.querySelector('[data-speed="2"]'));
await sleep(80);
ok(game.paused === false && game.speed === 2, 'скорость ×2 включается');

// экран паузы
click(doc.querySelector('#hud-menu'));
await sleep(150);
ok(window.document.getElementById('overlay').classList.contains('show'), 'меню паузы открылось');
click(window.document.querySelector('[data-act="resume"]'));
await sleep(150);
ok(!window.document.getElementById('overlay').classList.contains('show'), 'возврат из паузы');

// длинный прогон: 200 кадров
for (let i = 0; i < 200; i++) await sleep(8);
const simTime = window.__frontline.game.time;
ok(simTime > 0.5, `симуляция идёт (${simTime.toFixed(1)} с игрового времени)`);

// ИИ против ИИ
window.__frontline.newGame({ mode: 'commander', aiVsAi: true, seed: 5 });
await sleep(400);
ok(window.__frontline.game.aiVsAi === true, 'демо ИИ против ИИ стартует');
for (let i = 0; i < 120; i++) await sleep(8);
ok(window.__frontline.game.time > 0.2, 'демо ИИ против ИИ тикает');

console.log(errors.length ? `\nОшибки страницы:\n${errors.join('\n')}` : '\nошибок страницы нет');
if (errors.length) fails++;
console.log(fails ? `\nПРОВАЛЕНО: ${fails}` : '\nбраузерный дымовой тест пройден');
process.exit(fails ? 1 : 0);
