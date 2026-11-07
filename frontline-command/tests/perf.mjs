// Нагрузочный тест: 400+ юнитов и 500 шагов симуляции без браузера.
import { loadConfig } from '../src/core/config.js';
import { Game } from '../src/sim/game.js';

const cfg = await loadConfig();
const game = new Game({ cfg, seed: 5, difficulty: 'regular', aiVsAi: true });
// досыпаем юнитов вокруг баз, чтобы получить плотный бой
for (const f of [0, 1]) {
  const hq = game.world.hqOf(f);
  for (let i = 0; i < 170; i++) {
    const a = (i / 170) * Math.PI * 2;
    const r = 60 + (i % 7) * 22;
    game.spawnUnit(f, i % 11 === 0 ? 'mg' : 'infantry', hq.x + Math.cos(a) * r, hq.y + Math.sin(a) * r, {});
  }
}
const total = [...game.units.values()].filter((u) => u.alive).length;
const N = 500;
const t0 = Date.now();
for (let i = 0; i < N; i++) game.step(0.1);
const ms = Date.now() - t0;
const avg = ms / N;
console.log(`юнитов: ${total}, шагов: ${N}, всего ${ms} мс, средний тик ${avg.toFixed(2)} мс (${(1000 / avg).toFixed(0)} FPS только на симуляцию)`);
const heap = process.memoryUsage().heapUsed / 1048576;
console.log(`куча: ${heap.toFixed(0)} МБ, убито: ${game.stats.kills.join('/')}`);
if (avg > 16) { console.log('FAIL: тик симуляции дольше бюджета 16 мс'); process.exit(1); }
if (heap > 800) { console.log('FAIL: слишком большая куча'); process.exit(1); }
console.log('\nпроизводительность в порядке');
