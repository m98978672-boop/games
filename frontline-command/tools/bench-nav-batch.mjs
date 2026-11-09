// Микрозамер flushNav, не FPS и не полный бюджет навигации.
import { loadConfig } from '../src/core/config.js';
import { Game } from '../src/sim/game.js';
const results = [];
for (const pathing of [false, true]) {
  const cfg = await loadConfig();
  cfg.flags.pathing_v2 = pathing;
  cfg.navBudget.maxChunksPerFrame = 2;
  const game = new Game({ cfg, seed: 15, aiVsAi: true });
  const walls = game.walls;
  const buildings = game.world.buildings.filter((b) => walls.state(b)).slice(0, 2);
  const times = [];
  for (let i = 0; i < 120; i++) {
    walls.navQueue.clear();
    for (const b of buildings) walls.queueNavRebuild(b);
    const start = performance.now();
    walls.flushNav();
    if (i >= 20) times.push(performance.now() - start);
  }
  times.sort((a, b) => a - b);
  results.push({ pathing_v2: pathing, frames: times.length,
    meanMs: +(times.reduce((a, b) => a + b, 0) / times.length).toFixed(3),
    p95Ms: +times[Math.floor(times.length * 0.95)].toFixed(3) });
}
console.log(JSON.stringify(results));
