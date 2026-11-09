// Микрозамер полной applyWar предыдущей и новой версии, только Node.
// git show 95db2fe:frontline-command/src/core/save.js > src/core/save-bench-previous-temp.js
// node tools/bench-save-structures.mjs src/core/save-bench-previous-temp.js
// rm src/core/save-bench-previous-temp.js
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { loadConfig } from '../src/core/config.js';
import { Game } from '../src/sim/game.js';
import { Save as current } from '../src/core/save.js';
const path = process.argv[2];
if (!path) throw new Error('Нужен путь к предыдущему save.js в src/core');
const { Save: previous } = await import(pathToFileURL(resolve(path)).href);
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => store.get(k) ?? null,
  setItem: (k, v) => store.set(k, v),
  removeItem: (k) => store.delete(k),
};
const results = [];
for (const target of [52, 400]) {
  const cfg = await loadConfig();
  cfg.flags.alg_save = true;
  const options = { cfg, seed: 71, aiVsAi: true };
  const source = new Game(options);
  while (source.units.size < target) {
    const f = source.units.size % 2, hq = source.world.hqOf(f);
    source.spawnUnit(f, 'infantry', hq.x + (source.units.size % 100), hq.y + (source.units.size % 80));
  }
  if (process.argv.includes('--blueprints')) {
    for (let i = 0; i < 10; i++) {
      const f = i % 2, hq = source.world.hqOf(f);
      const bp = source.world.addBuilding({ type: 'sandbags', faction: f, x: hq.x + 200 + i * 35,
        y: hq.y + 200, blueprint: true, progress: 0.35 });
      Object.assign(bp, { priority: 1, reason: 'fixture', createdAt: 10, stall: 'ok' });
      source.build.blueprints.push(bp);
    }
  }
  if (!current.saveWar(source)) throw new Error('save failed');
  const save = current.loadWar();
  const samples = [[], []], implementations = [previous, current];
  for (let i = 0; i < 24; i++) {
    for (const j of i % 2 ? [1, 0] : [0, 1]) {
      const game = new Game(options); // вне интервала замера
      const started = performance.now();
      if (!implementations[j].applyWar(game, save)) throw new Error('load failed');
      if (i >= 4) samples[j].push(performance.now() - started);
    }
  }
  const stats = samples.map((a) => {
    a.sort((x, y) => x - y);
    return { meanMs: +(a.reduce((x, y) => x + y, 0) / a.length).toFixed(3),
      p95Ms: +a[Math.floor(a.length * 0.95)].toFixed(3), samples: a.length };
  });
  results.push({ units: source.units.size, blueprints: source.build.blueprints.length, previous: stats[0], current: stats[1] });
}
console.log(JSON.stringify(results, null, 2));
