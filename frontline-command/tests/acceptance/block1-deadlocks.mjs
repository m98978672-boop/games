// Блок 1: встречное движение пары через реальную дверь штаба. Изолированная
// стресс-сцена с обычной механикой движения, без ИИ отрядов, войны и боя.
import { loadConfig } from '../../src/core/config.js';
import { Game } from '../../src/sim/game.js';
import { moveAlongFlow, updateTimers } from '../../src/sim/units.js';

const arg = process.argv.find((s) => s.startsWith('--attempts='));
const attempts = arg ? Number(arg.slice('--attempts='.length)) : 100;
if (!Number.isInteger(attempts) || attempts < 1 || attempts > 1000) throw new Error('attempts: 1…1000');
const cfg = await loadConfig();
function scene(seed, faction) {
  const game = new Game({ cfg, seed, difficulty: 'regular', aiVsAi: true });
  game.units.clear(); game.unitGrid.clear();
  const building = game.world.buildings.find((b) => b.type === 'hq' && b.faction === faction && game.walls.state(b));
  if (!building) throw new Error(`hq ${faction} отсутствует`);
  const opening = game.walls.state(building).outline.openings.find((o) => o.type === 'door');
  if (!opening) throw new Error('дверь штаба отсутствует');
  const px = building.x + opening.cx, py = building.y + opening.cy;
  const units = [-1, 1].map((side) => {
    const u = game.spawnUnit(faction, 'infantry', px + side * opening.nx * 85, py + side * opening.ny * 85);
    u.goal = { x: px - side * opening.nx * 105, y: py - side * opening.ny * 105 };
    u.activity = 'advance'; u.arrived = false;
    return { u, side };
  });
  const crossed = new Set();
  let teleports = 0, speedViolations = 0, wallCollisions = 0, overlapFrames = 0, maxOverlap = 0;
  for (let tick = 0; tick < 1200; tick++) {
    game.time += 0.05; game.nav.advance(); game.walls.update(0.05);
    for (const { u, side } of units) {
      if (u.arrived || u.pathFailed) continue;
      const x = u.x, y = u.y;
      updateTimers(game, u, 0.05); moveAlongFlow(game, u, 0.05); game.unitGrid.update(u);
      if (((u.x - px) * opening.nx + (u.y - py) * opening.ny) * side < 0) crossed.add(u.id);
      const ratio = Math.hypot(u.x - x, u.y - y) /
        (Math.max(u.speed * game.world.speedAt(x, y), cfg.navBudget.antiStuck.pushSpeedFloor ?? 30) * 0.05);
      if (ratio > 10 + 1e-8) teleports++;
      if (ratio > 1.5 + 1e-8) speedViolations++;
      if (game.walls.blocksMove(u.x, u.y, u.radius, u)) wallCollisions++;
    }
    const a = units[0].u, b = units[1].u;
    const overlap = a.radius + b.radius - Math.hypot(a.x - b.x, a.y - b.y);
    if (overlap > 0) { overlapFrames++; maxOverlap = Math.max(maxOverlap, overlap); }
    if (units.every(({ u }) => u.arrived || u.pathFailed)) break;
  }
  const arrived = units.filter(({ u }) => u.arrived && !u.pathFailed).length;
  const pathFailed = units.filter(({ u }) => u.pathFailed).length;
  const ok = arrived === 2 && crossed.size === 2 && !pathFailed && !teleports && !speedViolations && !wallCollisions && !overlapFrames;
  return { seed, faction, ok, arrived, crossed: crossed.size, pathFailed, teleports, speedViolations,
    wallCollisions, overlapFrames, maxOverlap: +maxOverlap.toFixed(3), seconds: +game.time.toFixed(2) };
}
const factions = [];
let passed = 0, crossed = 0, arrived = 0, teleports = 0, speedViolations = 0, wallCollisions = 0, overlapFrames = 0, maxOverlap = 0;
const failures = [];
for (const faction of [0, 1]) {
  let factionPassed = 0;
  for (let seed = 1; seed <= attempts; seed++) {
    const result = scene(seed, faction);
    if (result.ok) { passed++; factionPassed++; }
    else if (failures.length < 8) failures.push(result);
    crossed += result.crossed; arrived += result.arrived; teleports += result.teleports;
    speedViolations += result.speedViolations; wallCollisions += result.wallCollisions; overlapFrames += result.overlapFrames;
    maxOverlap = Math.max(maxOverlap, result.maxOverlap);
  }
  factions.push({ id: faction, attempts, passed: factionPassed });
}
const scenarios = attempts * 2;
// Одна встречная пара не заменяет встречные колонны, технику и доки.
// Даже при успешной паре приёмка категории остаётся закрытой до расширения стенда.
const report = { passed: false, coverageComplete: false,
  coverage: [{ id: 'foot-door-opposing', scenarios, participants: 2, passed, factions, crossed, arrived,
    teleports, speedViolations, wallCollisions, overlapFrames }], method: 'встречная пара через дверь штаба; 100 seed на фракцию в полном режиме; 0,05 с шаг; до 60 с; без боя',
  scenarios, failed: scenarios - passed, factionsChecked: 2, factions, crossed, arrived, teleports, speedViolations, wallCollisions, overlapFrames, maxOverlap, failures };
console.log(JSON.stringify(report, null, 2));
if (!report.passed) process.exitCode = 1;
