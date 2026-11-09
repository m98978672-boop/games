// ALG-19: диагностика не меняет сброс цели; по выключенному флагу событий нет.
import assert from 'node:assert/strict';
import { loadConfig } from '../src/core/config.js';
import { Game } from '../src/sim/game.js';
import { Renderer } from '../src/render/renderer.js';
import { updateTimers } from '../src/sim/units.js';

async function run(enabled) {
  const cfg = await loadConfig();
  cfg.flags.alg_deadlock = enabled;
  cfg.navBudget.antiStuck.failureLogLimit = 2;
  const game = new Game({ cfg, seed: 39, aiVsAi: true });
  const events = [];
  game.events.on('pathFailed', (event) => events.push(event));
  const units = [0, 1, 0].map((f) => [...game.units.values()].find((u) => u.faction === f && !u.isVehicle));
  const beforeRng = game.rng.s;
  for (const u of units) {
    u.goal = { x: u.x + 100, y: u.y + 100 };
    u.flowDir = { x: 1, y: 0 };
    u.age = 4; u.stuck = 1; u.lastCheck = { x: u.x, y: u.y, t: 0 };
    updateTimers(game, u, 0.05);
    assert.equal(u.pathFailed, true);
    assert.equal(u.goal, null);
    assert.equal(u.flowDir, null);
    assert.equal(u.stuck, 0);
  }
  assert.equal(game.rng.s, beforeRng, 'наблюдение не потребляет RNG');
  return { game, events, units };
}
const off = await run(false);
assert.equal(off.events.length, 0);
assert.equal(off.game.deadlockStats, undefined, 'off не создаёт новую диагностику');
const on = await run(true);
assert.equal(on.events.length, 3);
assert.deepEqual(on.game.deadlockStats.pathFailures, [2, 1]);
assert.equal(on.game.deadlockStats.recent.length, 2, 'журнал ограничен конфигом');
assert.deepEqual(on.game.deadlockStats.recent, on.events.slice(-2));
assert.deepEqual(on.events.map((e) => e.faction), [0, 1, 0]);
assert.ok(on.events.every((e) => Number.isFinite(e.x) && Number.isFinite(e.goalX)));
assert.deepEqual(on.units.map((u) => [u.x,u.y,u.stuck,u.pathFailed]), off.units.map((u) => [u.x,u.y,u.stuck,u.pathFailed]));
function debugLines(game) {
  const lines = [];
  const renderer = {
    game, camera: { x: 0, y: 0, zoom: 1 }, fps: 60, viewW: 100, viewH: 100,
    ctx: { fillRect() {}, strokeRect() {}, fillText(text) { lines.push(text); } },
    worldToScreen(x, y) { return { x, y }; }, isVisible() { return false; },
  };
  Renderer.prototype.drawDebug.call(renderer);
  return lines;
}
assert.ok(debugLines(on.game).includes('сбросы пути A/Л 2/1'), 'счётчик отображается в F3');
assert.ok(!debugLines(off.game).some((line) => line.startsWith('сбросы пути')), 'при off F3 не меняется');
console.log('deadlock-наблюдение: off 0 событий; on 3, фракции 2/1, журнал 2; RNG, сброс целей и счётчик F3 проверены');
