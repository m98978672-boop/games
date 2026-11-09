// Приёмочная диагностика проходов: отдельные повторяемые сцены с реальной
// геометрией игры, но без боя. Выдаёт JSON и код 1 при любом провале.
import { loadConfig } from '../../src/core/config.js';
import { Game } from '../../src/sim/game.js';
import { moveAlongFlow, updateTimers } from '../../src/sim/units.js';

const arg = process.argv.find((s) => s.startsWith('--attempts='));
const attempts = arg ? Number(arg.slice('--attempts='.length)) : 100;
if (!Number.isInteger(attempts) || attempts < 1 || attempts > 1000) throw new Error('attempts: 1…1000');
const cfg = await loadConfig();
const definitions = [
  ['foot-hq-enter','hq','infantry','door',true], ['foot-hq-exit','hq','infantry','door',false],
  ['foot-city-enter','city','infantry','door',true], ['foot-city-exit','city','infantry','door',false],
  ['truck-depot-enter','depot','truck','gate',true], ['truck-depot-exit','depot','truck','gate',false],
  ['truck-factory-enter','factory','truck','gate',true], ['truck-factory-exit','factory','truck','gate',false],
  ['column','hq','infantry','door',true],
];
function run(definition, seed, faction) {
  const [kind, type, role, openingType, reverse] = definition;
  const game = new Game({ cfg, seed, difficulty: 'regular', aiVsAi: true });
  game.units.clear(); game.unitGrid.clear();
  const b = game.world.buildings.find((b) => b.type === type && b.faction === faction && game.walls.state(b));
  if (!b) return { ok: false, seed, faction, reason: 'building_missing', teleports: 0 };
  const o = game.walls.state(b).outline.openings.find((o) => o.type === openingType);
  if (!o) return { ok: false, seed, faction, reason: 'opening_missing', teleports: 0 };
  const px = b.x + o.cx, py = b.y + o.cy, inward = reverse ? 1 : -1;
  const count = kind === 'column' ? 10 : 1;
  const units = [];
  for (let i = 0; i < count; i++) {
    const startDistance = 55 + i * 24;
    const u = game.spawnUnit(faction, role, px + inward * o.nx * startDistance, py + inward * o.ny * startDistance);
    u.goal = { x: px - inward * o.nx * 100, y: py - inward * o.ny * 100 };
    u.activity = 'advance';
    u.arrived = false;
    units.push(u);
  }
  // Отслеживаем пересечение плоскости проёма, а не только флаг arrived:
  // у нового Unit он изначально true даже до первого шага к новой цели.
  const crossed = new Set();
  let teleports = 0, speedViolations = 0, wallCollisions = 0, maxStepRatio = 0, overlapFrames = 0, maxOverlap = 0;
  for (let tick = 0; tick < 600; tick++) {
    game.time += 0.05; game.nav.advance(); game.walls.update(0.05);
    for (const u of units) {
      if (u.arrived || u.pathFailed) continue;
      const x = u.x, y = u.y;
      updateTimers(game, u, 0.05); moveAlongFlow(game, u, 0.05);
      game.unitGrid.update(u);
      if (((u.x - px) * o.nx + (u.y - py) * o.ny) * inward < 0) crossed.add(u.id);
      const step = Math.hypot(u.x - x, u.y - y);
      const base = Math.max(u.speed * game.world.speedAt(x, y), cfg.navBudget.antiStuck.pushSpeedFloor ?? 30) * 0.05;
      const ratio = step / base;
      maxStepRatio = Math.max(maxStepRatio, ratio);
      // Большой скачок — только эвристика; превышение 1.5 отдельно не
      // называем телепортом: его может вызвать steering + выталкивание.
      if (ratio > 10 + 1e-8) teleports++;
      if (ratio > 1.5 + 1e-8) speedViolations++;
      if (game.walls.blocksMove(u.x, u.y, u.radius, u)) wallCollisions++;
    }
    let anyOverlap = false;
    for (let i = 0; i < units.length; i++) for (let j = i + 1; j < units.length; j++) {
      const overlap = units[i].radius + units[j].radius - Math.hypot(units[i].x - units[j].x, units[i].y - units[j].y);
      if (overlap > 0) { anyOverlap = true; maxOverlap = Math.max(maxOverlap, overlap); }
    }
    if (anyOverlap) overlapFrames++;
    if (units.every((u) => u.arrived || u.pathFailed)) break;
  }
  const arrived = units.filter((u) => u.arrived).length;
  const failed = units.filter((u) => u.pathFailed).length;
  return { ok: arrived === count && crossed.size === count && failed === 0 && teleports === 0 && speedViolations === 0 && wallCollisions === 0 && overlapFrames === 0,
    seed, faction, arrived, crossed: crossed.size, failed, count, teleports, speedViolations, wallCollisions, maxStepRatio: +maxStepRatio.toFixed(3),
    overlapFrames, maxOverlap: +maxOverlap.toFixed(3), seconds: +game.time.toFixed(2) };
}
const scenarios = [];
for (const definition of definitions) {
  const [kind] = definition;
  let passed = 0, reached = 0, crossedAll = 0, teleports = 0, speedViolations = 0, wallCollisions = 0, overlapFrames = 0, maxOverlap = 0, crossed = 0;
  const failures = [], factions = [];
  for (const faction of [0, 1]) {
    let factionPassed = 0, factionReached = 0;
    for (let i = 0; i < attempts; i++) {
      const result = run(definition, i + 1, faction);
      if (Number.isInteger(result.count) && result.arrived === result.count && result.failed === 0) { reached++; factionReached++; }
      if (Number.isInteger(result.count) && result.crossed === result.count) crossedAll++;
      if (result.ok) { passed++; factionPassed++; }
      else if (failures.length < 8) failures.push(result);
      teleports += result.teleports;
      speedViolations += result.speedViolations || 0;
      crossed += result.crossed || 0;
      wallCollisions += result.wallCollisions || 0;
      overlapFrames += result.overlapFrames || 0;
      maxOverlap = Math.max(maxOverlap, result.maxOverlap || 0);
    }
    factions.push({ id: faction, attempts, passed: factionPassed, reached: factionReached });
  }
  scenarios.push({ name: kind, kind, attempts: attempts * 2, passed, reached, crossedAll, teleports, speedViolations, wallCollisions, overlapFrames, maxOverlap, crossed, factions, failures });
}
const passed = scenarios.every((s) => s.passed === s.attempts && s.teleports === 0 && s.speedViolations === 0 && s.wallCollisions === 0 && s.overlapFrames === 0);
console.log(JSON.stringify({ passed, method: 'independent scenes; both factions; seeds 1..N each; simulation 0.05s; max 30s; no combat', scenarios }, null, 2));
if (!passed) process.exitCode = 1;
