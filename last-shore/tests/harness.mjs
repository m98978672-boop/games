// Интеграционный прогон игры в jsdom с заглушкой рендерера.
import { JSDOM } from 'jsdom';
import fs from 'node:fs';
import path from 'node:path';

const dir = path.resolve(import.meta.dirname, '..');
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');

const dom = new JSDOM(html, { url: 'https://example.com/', pretendToBeVisual: true, runScripts: 'outside-only' });
const { window } = dom;

globalThis.window = window;
globalThis.document = window.document;
Object.defineProperty(globalThis, 'navigator', { value: window.navigator, configurable: true });
globalThis.HTMLElement = window.HTMLElement;
globalThis.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 16);
globalThis.localStorage = window.localStorage;
window.requestAnimationFrame = globalThis.requestAnimationFrame;

const errors = [];
window.addEventListener('error', (e) => errors.push(e.message));

// грузим собранный тестовый бандл (main.js + заглушка рендерера)
const code = fs.readFileSync(path.join(dir, 'tests/.harness-bundle.js'), 'utf8');
new Function(code)();

try {
  window.dispatchEvent(new window.Event('DOMContentLoaded'));
} catch (err) {
  console.error('startup error:', err);
}
console.log('game present:', !!window.__game);

const game = window.__game;
if (!game) throw new Error('game not created');
console.log('renderer ok, world children:', game.scene.children.length);

// клик по «Начать»
window.document.getElementById('btn-start').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
console.log('started:', game.running, 'paused:', game.paused);

// прокрутка времени: 600 кадров по 1/60 (10 секунд игры)
const keys = (code, type = 'keydown') => window.dispatchEvent(
  new window.KeyboardEvent(type, { code, bubbles: true })
);

keys('KeyW');
for (let i = 0; i < 300; i++) game.update(1 / 60);
keys('KeyW', 'keyup');
const moved = Math.hypot(game.player.position.x, game.player.position.z);
console.log('player after walk:', game.player.position.toArray().map(v => v.toFixed(1)).join(','), 'thirst:', game.state.thirst.toFixed(1));

// подбор: телепортируем к ближайшему предмету и жмём E
const p = game.world.pickups[0];
game.player.setPosition(p.mesh.position.x, p.mesh.position.z, game.world);
game.update(1 / 60);
console.log('prompt shown:', !window.document.getElementById('prompt').classList.contains('hidden'));
keys('KeyE');
console.log('inventory after E:', JSON.stringify(game.state.inventory));

// еда и питьё
game.state.inventory.coconut = 2;
game.state.inventory.berries = 3;
game.state.thirst = 40; game.state.hunger = 40;
keys('Digit1'); keys('Digit2');
console.log('after consume thirst/hunger:', game.state.thirst.toFixed(1), game.state.hunger.toFixed(1), 'inv:', JSON.stringify(game.state.inventory));

// инвентарь
keys('KeyI');
console.log('inventory panel open:', !window.document.getElementById('inventory').classList.contains('hidden'),
  'rows:', window.document.querySelectorAll('#inv-list li').length);
keys('KeyI');

// пауза / сохранение / продолжение
game.pause();
console.log('paused:', game.paused, 'save exists:', !!window.localStorage.getItem('lastshore.save.v1'));
game.resume();
console.log('resumed:', !game.paused);

// сутки: прогоняем 3 игровых часа крупными шагами
for (let i = 0; i < 900; i++) game.update(0.25);
console.log('clock:', game.sky.clockString(), 'day:', game.sky.day, 'weather:', game.weather, 'rain:', game.rainIntensity.toFixed(2));

// смерть
game.state.health = 0.01; game.state.thirst = 0;
for (let i = 0; i < 60; i++) game.update(1 / 60);
console.log('dead:', game.dead, 'death screen:', !window.document.getElementById('death').classList.contains('hidden'), 'save cleared:', !window.localStorage.getItem('lastshore.save.v1'));

// рендер-цикл не падает
game.frame();
console.log('renders:', game.renderer.renders, 'fps:', game.fpsValue);
console.log('errors:', errors.length ? errors : 'none');
console.log('HARNESS OK');
