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

/* ------------------------------------------------ режимы мини-игры */

// В каждом режиме раунд запускается и спавнит объекты своего типа.
for (const mode of ['fireflies', 'stars', 'shadow']) {
  GB.game.newRound(mode);
  const st = GB.game.state;
  ok(st.mode === mode, `режим «${mode}» запускается`);
  st.spawnInMs = 0;
  GB.game.update(16, 1200, 800);
  ok(st.flies.length > 0, `режим «${mode}» создаёт цели`);
  ok(st.flies.every((f) => Number.isFinite(f.x) && Number.isFinite(f.y)), `режим «${mode}»: координаты конечны`);
}

// Падающая звезда уходит за нижний край — это пропуск, а не бесконечный отскок.
GB.game.newRound('stars');
const star = GB.game.state;
star.spawnInMs = 1e9; // больше не спавним, следим за одной
star.flies.push({ x: 600, y: 100, vx: 0, vy: 900, r: 6, age: 0, ttl: 999999, phase: 0 });
for (let i = 0; i < 40 && star.flies.length; i++) GB.game.update(100, 1200, 800);
ok(star.missed >= 1, 'звезда, ушедшая за край, считается пропущенной');

// Тень убегает от указателя.
GB.game.newRound('shadow');
const sh = GB.game.state;
sh.spawnInMs = 1e9;
sh.flies.push({ x: 600, y: 400, vx: 0, vy: 0, r: 8, age: 0, ttl: 999999, phase: 0 });
for (let i = 0; i < 30; i++) GB.game.dodgeShadows(610, 410, 1200, 800);
ok(Math.hypot(sh.flies[0].vx, sh.flies[0].vy) > 0, 'тень получает импульс от курсора');

// Серия растёт от попаданий и обнуляется промахом.
GB.game.newRound('fireflies');
const sr = GB.game.state;
sr.spawnInMs = 1e9;
sr.flies.push({ x: 300, y: 300, vx: 0, vy: 0, r: 10, age: 0, ttl: 999999, phase: 0 });
GB.game.click(300, 300);
ok(sr.streak === 1, 'попадание увеличило серию');
sr.flies.push({ x: 500, y: 300, vx: 0, vy: 0, r: 10, age: 0, ttl: 999999, phase: 0 });
GB.game.click(500, 300);
ok(sr.streak === 2, 'второе попадание — серия 2');
GB.game.click(10, 790);
ok(sr.streak === 0, 'промах обнулил серию');

// Битая отметка времени не останавливает игру.
GB.game.newRound('fireflies');
const g2 = GB.game.state;
const timeBefore = g2.timeLeftMs;
GB.game.update(NaN, 1200, 800);
GB.game.update(undefined, 1200, 800);
ok(Number.isFinite(g2.timeLeftMs) && g2.timeLeftMs === timeBefore, 'битый dt не ломает таймер');

// Лучшая серия сохраняется между раундами.
GB.game.newRound('fireflies');
const bs = GB.game.state;
bs.spawnInMs = 1e9;
for (let i = 0; i < 3; i++) {
  bs.flies.push({ x: 200 + i * 40, y: 300, vx: 0, vy: 0, r: 10, age: 0, ttl: 999999, phase: 0 });
  GB.game.click(200 + i * 40, 300);
}
GB.game.endRound();
const savedAfter = GB.save.load();
ok(savedAfter.bestStreak >= 3, 'лучшая серия сохраняется: ' + savedAfter.bestStreak);

if (failed) { console.error(`\n✗ Провалено: ${failed}`); process.exit(1); }
console.log('\n✓ Логика игры в порядке');
