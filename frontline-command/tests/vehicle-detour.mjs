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
