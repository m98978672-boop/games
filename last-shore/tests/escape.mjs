// Спасение с острова — финал LAST SHORE.
// Запуск: node tests/escape.mjs (нужен npm run test:build)
//
// До этой правки у игры не было конца вовсе: можно было умереть, но нельзя
// было победить. Теперь плот — настоящий выход: собрать ресурсы, поставить
// у воды, уплыть. Здесь проверяется весь путь и все отказы.
import { JSDOM } from 'jsdom';
import fs from 'node:fs';
import path from 'node:path';
import { ITEMS, RECIPES } from '../src/items.js';
import { waitReady } from './wait-ready.mjs';

const dir = path.resolve(import.meta.dirname, '..');
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');

let passed = 0;
let failed = 0;
function check(name, ok, detail = '') {
  if (ok) { passed++; console.log('  ✓', name); }
  else { failed++; console.log('  ✗', name, detail); }
}

console.log('Плот как предмет и рецепт');
{
  const raft = ITEMS.raft;
  check('плот есть в предметах', !!raft);
  check('плот ставится в хотбар', raft && raft.hotbar === true);
  check('у плота есть иконка', raft && typeof raft.icon === 'string' && raft.icon.length > 20);

  const rec = RECIPES.find((r) => r.id === 'raft');
  check('рецепт плота есть', !!rec);
  check('плот — последний рецепт (итог игры)',
    RECIPES[RECIPES.length - 1].id === 'raft', RECIPES[RECIPES.length - 1].id);
  check('рецепт помечен как цель', rec && rec.goal === true);
  check('нужно дерево', rec && rec.need.wood === 12, rec && String(rec.need.wood));
  check('нужны верёвки', rec && rec.need.rope === 4, rec && String(rec.need.rope));
  check('нужно железо', rec && rec.need.iron === 2, rec && String(rec.need.iron));
  check('плот не требует костра', rec && !rec.needFire);
  check('даёт ровно один плот', rec && rec.gives.raft === 1);

  // ни один ингредиент не выдуман
  const missing = Object.keys(rec.need).filter((id) => !ITEMS[id]);
  check('все ингредиенты существуют', missing.length === 0, missing.join(','));
  const chain = RECIPES.filter((r) => Object.keys(r.need).some((id) => !ITEMS[id]));
  check('во всех рецептах только известные предметы', chain.length === 0,
    chain.map((r) => r.id).join(','));
}

console.log('Разметка экрана спасения');
{
  check('есть экран #escape', /id="escape"/.test(html));
  check('есть текст итогов', /id="escape-text"/.test(html));
  check('есть таблица цифр', /id="escape-stats"/.test(html));
  check('есть вердикт', /id="escape-verdict"/.test(html));
  check('есть кнопка «Ещё раз»', /id="btn-escape-again"/.test(html));
  check('экран скрыт по умолчанию', /id="escape" class="overlay hidden"/.test(html));
  const css = fs.readFileSync(path.join(dir, 'style.css'), 'utf8');
  check('стиль заголовка спасения есть', /h1\.escaped/.test(css));
  check('сетка цифр адаптивна', /\.escape-stats[\s\S]{0,400}max-width: 620px/.test(css));
}

console.log('Игра: плот можно построить только у воды');
{
  const dom = new JSDOM(html, { url: 'https://example.com/', pretendToBeVisual: true, runScripts: 'outside-only' });
  const { window } = dom;
  globalThis.window = window;
  globalThis.document = window.document;
  Object.defineProperty(globalThis, 'navigator', { value: window.navigator, configurable: true });
  globalThis.HTMLElement = window.HTMLElement;
  globalThis.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 16);
  globalThis.localStorage = window.localStorage;
  window.requestAnimationFrame = globalThis.requestAnimationFrame;

  const code = fs.readFileSync(path.join(dir, 'tests/.harness-bundle.js'), 'utf8');
  new Function(code)();
  window.document.dispatchEvent(new window.Event('DOMContentLoaded', { bubbles: true }));
  window.document.getElementById('btn-start').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  await waitReady(window);

  const game = window.__game;
  check('игра поднялась', !!game);
  check('флаг спасения выключен', game.escaped === false);

  // без плота строить нечего
  game.state.inventory.raft = 0;
  const before = game.escaped;
  check('без плота спасения нет', game.buildRaft() === false && game.escaped === before);

  // в глубине острова строить нельзя
  const mid = game.world.heightAt(0, 0);
  check('в центре суши места нет', game.raftSpotOk(0, 0).ok === false,
    `высота ${mid.toFixed(2)}`);

  // ищем настоящую кромку воды в мире
  let shore = null;
  for (let r = 20; r < 170 && !shore; r += 3) {
    for (let a = 0; a < 24 && !shore; a++) {
      const x = Math.cos((a / 24) * Math.PI * 2) * r;
      const z = Math.sin((a / 24) * Math.PI * 2) * r;
      const h = game.world.heightAt(x, z);
      if (h >= 0.35 && h <= 1.6) shore = { x, z, h };
    }
  }
  check('на острове есть кромка воды', !!shore, shore ? `h=${shore.h.toFixed(2)}` : 'не нашли');
  if (shore) {
    check('у воды строить можно', game.raftSpotOk(shore.x, shore.z).ok === true);
  }
  check('под землёй строить нельзя', (() => {
    game.underground = true;
    const r = game.raftSpotOk(shore ? shore.x : 0, shore ? shore.z : 0);
    game.underground = false;
    return r.ok === false;
  })());

  // с плотом и у воды — спасение наступает
  if (shore) {
    game.player.setPosition(shore.x, shore.z, game.world);
    game.player.position.y = game.world.heightAt(shore.x, shore.z);
    game.state.inventory.raft = 1;
    game.state.inventory.wood = 8;
    game.state.inventory.stone = 5;
    game.state.inventory.iron = 3;
    const summary = game.escapeSummary();
    check('итоги считаются до спасения', summary && typeof summary.days === 'number');
    const ok = game.buildRaft();
    check('плот построен и герой уплыл', ok === true && game.escaped === true);
    check('плот израсходован', (game.state.inventory.raft || 0) === 0);
    check('игра остановлена', game.running === false);
    check('экран спасения показан', !window.document.getElementById('escape').classList.contains('hidden'));
    check('цифры заполнены', (window.document.getElementById('escape-stats').innerHTML || '').length > 30);
    check('вердикт не пуст', (window.document.getElementById('escape-verdict').textContent || '').length > 5);
    check('забег не сохраняется как живой', game.save() === false);

    // повторно уплыть нельзя
    game.state.inventory.raft = 1;
    check('второй раз не уплыть', game.buildRaft() === false);
  }
}

console.log(`\n${passed} пройдено, ${failed} провалено`);
if (failed) process.exit(1);
