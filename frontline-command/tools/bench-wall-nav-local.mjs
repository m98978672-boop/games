// Парный микрозамер: изменения двух дверей, flush + обновление nav и следующее поле.
// Не является измерением FPS, бюджета всего кадра или продолжительной войны.
import { loadConfig } from '../src/core/config.js';
import { Game } from '../src/sim/game.js';
const variants = [];
for (const local of [false, true]) {
  const cfg = await loadConfig();
  cfg.flags.wall_nav_local = local;
  cfg.navBudget.maxChunksPerFrame = 2;
  const game = new Game({ cfg, seed: 15, aiVsAi: true });
  const pairs = game.world.buildings.map((b) => [b, game.walls.state(b)])
    .filter(([, st]) => st && Object.keys(st.doors).length >= 1).slice(0, 2)
    .map(([b, st]) => [b, Object.keys(st.doors)[0]]);
  if (pairs.length !== 2) throw new Error('нет двух строений с дверьми');
  variants.push({ local, game, pairs, flush: [], field: [] });
}
for (let i = 0; i < 240; i++) {
  for (const item of i % 2 ? [...variants].reverse() : variants) {
    const { game, pairs } = item;
    for (const [b, door] of pairs) game.walls.toggleDoor(b, door);
    const start = performance.now();
    game.walls.flushNav(); game.nav.advance();
    const end = performance.now();
    game.nav.field(2048, 2048);
    const fieldEnd = performance.now();
    if (i >= 40) { item.flush.push(end - start); item.field.push(fieldEnd - end); }
  }
}
function stats(values) {
  const a = [...values].sort((x, y) => x - y);
  return { samples: a.length, meanMs: +(a.reduce((x, y) => x + y, 0) / a.length).toFixed(4),
    p95Ms: +a[Math.floor(a.length * .95)].toFixed(4), p99Ms: +a[Math.floor(a.length * .99)].toFixed(4),
    maxMs: +a[a.length - 1].toFixed(4) };
}
console.log(JSON.stringify({ seed: 15, doorsPerIteration: 2, warmups: 40, alternatingOrder: true,
  results: variants.map((v) => ({ local: v.local, flushAndGrid: stats(v.flush), nextField: stats(v.field) })) }, null, 2));
