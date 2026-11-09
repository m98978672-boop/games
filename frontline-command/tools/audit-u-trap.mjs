// ALG-04: диагностический сценарий U-ловушки. Код выхода 1 при провале.
// Синтетическая геометрия без боёв и соседей; не массовая приёмка ИИ.
import { loadConfig } from '../src/core/config.js';
import { Game } from '../src/sim/game.js';
import { Nav } from '../src/sim/nav.js';
import { Walls } from '../src/sim/walls.js';
import { moveAlongFlow, updateTimers } from '../src/sim/units.js';
const vehicleDetour = process.argv.includes('--vehicle-detour');

async function scenario(role, seed, mirrored) {
  const cfg = await loadConfig();
  cfg.flags.pathing_v2 = true;
  cfg.flags.vehicle_detour_v2 = vehicleDetour;
  const game = new Game({ cfg, seed, aiVsAi: true });
  game.units.clear(); game.unitGrid.clear();
  const width = 1280;
  const mirrorX = (x) => mirrored ? width - x : x;
  const segments = [
    [320, 352, 672, 352], [672, 352, 672, 672], [672, 672, 320, 672],
  ].map(([x1,y1,x2,y2]) => [mirrorX(x1), y1, mirrorX(x2), y2]);
  const inside = (x,y) => x > 0 && y > 0 && x < width && y < width;
  const blocked = (x,y,r) => segments.some((s) => Walls.distPointSegment(x,y,...s).d <= 8 + r);
  game.world = { W: width, H: width, navVersion: 1,
    isWalkable: (x,y) => inside(x,y) && !blocked(x,y,0),
    isBaseWalkable: inside, speedAt: () => 1, terrainAt: () => 0 };
  game.walls = { enabled: () => true, doorWaypoint: () => null, doorsForUnit: () => {}, blocksMove: blocked };
  game.world.walls = game.walls;
  game.nav = new Nav(game.world, cfg);
  const unit = game.spawnUnit(mirrored ? 1 : 0, role, mirrorX(512), 512);
  unit.goal = { x: mirrorX(900), y: 512 };
  unit.activity = 'advance';
  let maxStep = 0;
  let movesAway = false, collided = false;
  const initialGoalDist = Math.hypot(unit.goal.x-unit.x,unit.goal.y-unit.y);
  for (let i = 0; i < 600; i++) {
    const x = unit.x, y = unit.y;
    game.time += 0.05; game.nav.advance(); updateTimers(game, unit, 0.05); moveAlongFlow(game, unit, 0.05);
    maxStep = Math.max(maxStep, Math.hypot(unit.x-x,unit.y-y));
    if (unit.goal && Math.hypot(unit.goal.x-unit.x,unit.goal.y-unit.y) > initialGoalDist + 32) movesAway = true;
    collided ||= blocked(unit.x,unit.y,unit.radius);
    if (unit.arrived || unit.pathFailed) break;
  }
  const noTeleport = maxStep <= unit.speed * 0.05 * 1.5 + 1e-9;
  return { role, seed, mirrored, seconds: +game.time.toFixed(2),
    arrived: !!unit.arrived, pathFailed: !!unit.pathFailed, collided, noTeleport, movesAway,
    x: +unit.x.toFixed(2), y: +unit.y.toFixed(2) };
}
const results = [];
for (const role of ['infantry','truck','tank']) {
  for (const mirrored of [false,true]) {
    for (const seed of [5,7,11]) results.push(await scenario(role,seed,mirrored));
  }
}
const ok = (r) => r.arrived && !r.pathFailed && !r.collided && r.noTeleport && r.movesAway;
const passed = results.filter(ok).length;
console.log(JSON.stringify({ vehicleDetour, passed, total: results.length, results }, null, 2));
if (passed !== results.length) process.exitCode = 1;
