// БАЗА — логический тест ядра игры в Node (с заглушками браузера).
// Запуск: node tests/logic.mjs
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// --- минимальные заглушки браузерного окружения ---
const store = new Map();
const sandbox = {
  window: {},
  localStorage: {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  },
  performance: { now: () => 0 },
  document: { addEventListener() {}, readyState: 'complete', hidden: false },
  requestAnimationFrame() {},
  matchMedia: () => ({ matches: true }),
  console,
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
vm.createContext(sandbox);

for (const f of ['src/config.js', 'src/util.js', 'src/save.js', 'src/audio.js', 'src/game.js']) {
  vm.runInContext(readFileSync(join(root, f), 'utf8'), sandbox, { filename: f });
}

// заглушки UI, чтобы ядро не зависело от DOM
vm.runInContext(`GB.ui = { setNews(){}, flashCombo(){}, onRoundEnd(){}, setHint(){}, renderSide(){}, closeModal(){}, setPauseFlag(){} };`, sandbox);

const GB = sandbox.GB;
let failed = 0;
const ok = (c, m) => { if (c) console.log('  ✓ ' + m); else { console.error('  ✗ ' + m); failed++; } };

console.log('БАЗА — логика игры');

GB.game.newRound();
const s = GB.game.state;
ok(s.running && !s.over && s.score === 0 && s.combo === 1, 'раунд начался: running, 0 очков, комбо ×1');
ok(Math.round(s.timeLeftMs / 1000) === GB.CONFIG.roundSeconds, 'время раунда = ' + GB.CONFIG.roundSeconds + ' с');

// симулируем 5 секунд: светлячки должны появиться
for (let i = 0; i < 50; i++) GB.game.update(100, 1200, 800);
ok(s.flies.length > 0, 'светлячки появляются (на поле: ' + s.flies.length + ')');

// кликаем точно по первому светлячку
const f = s.flies[0];
const before = s.score;
ok(GB.game.click(f.x, f.y) === true, 'клик по светлячку засчитан');
ok(s.score === before + GB.CONFIG.pointsBase * 1, 'очки = base × комбо (было ×1): +' + (s.score - before));
ok(s.combo === 2 && s.caught === 1, 'комбо выросло до ×2, поймано 1');

// промах сбрасывает комбо
ok(GB.game.click(5, 5) === false || s.flies.length === 0, 'промах не ловит');
ok(s.combo === 1, 'промах сбросил комбо до ×1');

// докручиваем раунд до конца (60 с суммарно)
for (let i = 0; i < 600 && !s.over; i++) GB.game.update(100, 1200, 800);
ok(s.over === true, 'раунд завершился по таймеру');
ok(s.timeLeftMs === 0, 'таймер на нуле');
const saved = GB.save.load();
ok(typeof saved.best === 'number' && saved.best >= s.score, 'рекорд сохранён в localStorage: ' + saved.best);

// пауза
GB.game.restart();
GB.game.togglePause(true);
ok(GB.game.state.paused === true, 'пауза включается');
const t = GB.game.state.timeLeftMs;
GB.game.update(500, 1200, 800);
ok(GB.game.state.timeLeftMs === t, 'на паузе время не идёт');
GB.game.togglePause(false);
ok(GB.game.state.paused === false, 'пауза снимается');

if (failed) { console.error(`\n✗ Провалено: ${failed}`); process.exit(1); }
console.log('\n✓ Логика игры в порядке');
