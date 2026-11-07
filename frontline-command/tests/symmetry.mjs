// Тест симметрии §23: ИИ против ИИ, одинаковые правила, стороны местами.
// Проверяем, что ни одна сторона не получает преимущества от кода, и что война живая.
import { loadConfig } from '../src/core/config.js';
import { Game } from '../src/sim/game.js';

const cfg = await loadConfig();
cfg.factions[0].persona = 'balanced';
cfg.factions[1].persona = 'balanced';

const HORIZON = 1200; // секунд игрового времени
const results = [];
let fails = 0;

for (const seed of [11, 23]) {
  for (const swap of [false, true]) {
    const game = new Game({ cfg, seed, difficulty: 'regular', aiVsAi: true, swapSides: swap });
    const t0 = Date.now();
    let steps = 0;
    while (!game.warOver && steps < HORIZON * 10) { game.step(0.1); steps++; }
    const r = {
      seed, swap, seconds: steps / 10, winner: game.outcome ? game.outcome.winner : null,
      reason: game.outcome ? game.outcome.reason : 'истёк горизонт',
      kills: [...game.stats.kills], captures: [...game.stats.captures],
      deliveries: [...game.stats.deliveries], units: [0, 1].map((f) => [...game.units.values()].filter((u) => u.alive && u.faction === f).length),
      ms: Date.now() - t0,
    };
    results.push(r);
    console.log(JSON.stringify(r));
    if (r.kills[0] + r.kills[1] === 0) { fails++; console.log('FAIL: за весь прогон нет убитых'); }
    if (r.captures[0] + r.captures[1] === 0) { fails++; console.log('FAIL: точки не захватывались'); }
    if (r.units.some((n) => n === 0)) { fails++; console.log('FAIL: одна из сторон полностью уничтожена без завершения войны'); }
  }
}

// Перекос: если войны завершились, ни одна сторона не должна выигрывать больше 80%
const decided = results.filter((r) => r.winner != null);
if (decided.length >= 3) {
  const w0 = decided.filter((r) => r.winner === 0).length;
  const w1 = decided.length - w0;
  const share = Math.max(w0, w1) / decided.length;
  console.log(`решений: ${decided.length}, побед 0: ${w0}, побед 1: ${w1}, перекос ${(share * 100).toFixed(0)}%`);
  if (share > 0.8) { fails++; console.log('FAIL: перекос исходов выше порога 80%'); }
} else {
  console.log(`решений мало (${decided.length}/${results.length}) — проверяем только живость боя`);
}
const totalCaps = results.reduce((a, r) => a + r.captures[0] + r.captures[1], 0);
console.log(`суммарно захватов: ${totalCaps}, среднее время прогона: ${(results.reduce((a, r) => a + r.ms, 0) / results.length / 1000).toFixed(1)} с`);
console.log(fails ? `\nПРОВАЛЕНО: ${fails}` : '\nсимметрия в порядке');
process.exit(fails ? 1 : 0);
