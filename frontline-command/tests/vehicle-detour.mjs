// ALG-04/19: пробный локальный обход техники. По умолчанию выключен.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { loadConfig } from '../src/core/config.js';
import { Game } from '../src/sim/game.js';

const tool = fileURLToPath(new URL('../tools/audit-u-trap.mjs', import.meta.url));
const run = (...args) => spawnSync(process.execPath, [tool, ...args], { encoding: 'utf8' });
const off = run();
const legacy = JSON.parse(off.stdout);
assert.equal(legacy.vehicleDetour, false);
assert.equal(legacy.total, 18);
assert.equal(off.status, legacy.passed === legacy.total ? 0 : 1, 'код соответствует результату базового прогона');
const on = run('--vehicle-detour');
assert.equal(on.status, 0, on.stderr);
const improved = JSON.parse(on.stdout);
assert.equal(improved.vehicleDetour, true);
assert.equal(improved.passed, 18);
assert.equal(improved.total, 18);
assert.ok(improved.passed >= legacy.passed, 'эксперимент не хуже базового сценария');
for (const r of improved.results) assert.ok(r.noTeleport && !r.collided && r.arrived && !r.pathFailed);
const gateTool = fileURLToPath(new URL('./pathing.mjs', import.meta.url));
const gate = spawnSync(process.execPath, [gateTool], { encoding: 'utf8', env: { ...process.env, VEHICLE_DETOUR: '1' } });
assert.equal(gate.status, 0, `проходы при включённом флаге: ${gate.stdout} ${gate.stderr}`);
const cfg = await loadConfig();
assert.equal(cfg.flag('vehicle_detour_v2'), false, 'по умолчанию оставлен legacy');
for (const dep of ['pathing_v2','wall_collision_v2']) {
  const c = await loadConfig();
  c.flags.vehicle_detour_v2 = true;
  c.flags[dep] = false;
  const warnings = [];
  const warn = console.warn;
  try { console.warn = (message) => warnings.push(message); new Game({ cfg: c, seed: 5, aiVsAi: true }); }
  finally { console.warn = warn; }
  assert.ok(warnings.some((w) => w.includes('vehicle_detour_v2')), `${dep}: есть предупреждение о зависимости`);
}
console.log(`экспериментальный обход техники: off ${legacy.passed}/18, on ${improved.passed}/18 в U-сцене; зависимости предупреждают`);

// Условие срабатывания узкого варианта: поле направлено строго от цели;
// нулевое/отсутствующее направление и движение к цели не запускают обход.
const { moveUnit } = await import('../src/sim/units.js');
for (const faction of [0, 1]) for (const direction of ['back', 'forward', 'none']) {
  const c = await loadConfig(); c.flags.vehicle_detour_v2 = true;
  const game = new Game({ cfg: c, seed: 5, aiVsAi: true });
  game.units.clear(); game.unitGrid.clear();
  const u = game.spawnUnit(faction, 'truck', 1000, 1000);
  u.goal = { x: faction === 0 ? 1400 : 600, y: 1000 }; u.stuck = 1;
  const toward = faction === 0 ? 1 : -1;
  game.world = { W: 4096, H: 4096, speedAt: () => 1, isBaseWalkable: () => true, isWalkable: () => true };
  game.walls = { enabled: () => true, doorWaypoint: () => null, doorsForUnit: () => {}, blocksMove: () => false };
  game.nav = { field: () => ({ dist: [0] }), idxOf: () => 0,
    step: () => direction === 'none' ? null : { dx: direction === 'back' ? -toward : toward, dy: 0 } };
  const x = u.x, y = u.y;
  moveUnit(game, u, toward, 0, 0.05);
  assert.equal(!!u.detour, direction === 'back', `фракция ${faction}, поле ${direction}`);
  assert.ok(Math.hypot(u.x - x, u.y - y) <= u.speed * .05 * 1.5, 'контроль шага');
}
console.log('условия обхода: только направление поля от цели для обеих фракций, обычная скорость');
