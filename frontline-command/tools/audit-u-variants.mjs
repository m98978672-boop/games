// Расширенный синтетический стенд U-ловушки, не замена приёмки навигации.
import { loadConfig } from '../src/core/config.js';
import { Game } from '../src/sim/game.js';
import { Nav } from '../src/sim/nav.js';
import { Walls } from '../src/sim/walls.js';
import { moveAlongFlow, updateTimers } from '../src/sim/units.js';
const on = process.argv.includes('--vehicle-detour');
const cfg = await loadConfig(); cfg.flags.pathing_v2 = true; cfg.flags.vehicle_detour_v2 = on;
function run(role, seed, rotation, size, faction) {
  const game = new Game({ cfg, seed, aiVsAi: true }); game.units.clear(); game.unitGrid.clear();
  const width = 1536, c = width/2;
  const transform = (x, y) => {
    for (let i = 0; i < rotation; i++) [x, y] = [-y, x];
    return [c+x,c+y];
  };
  const s = size;
  const segments = [[-s,-s,s,-s],[s,-s,s,s],[s,s,-s,s]].map(([a,b,x,y]) => [...transform(a,b), ...transform(x,y)]);
  const inside = (x,y) => x > 0 && y > 0 && x < width && y < width;
  const blocked = (x,y,r) => segments.some((s) => Walls.distPointSegment(x,y,...s).d <= 8 + r);
  game.world = { W: width, H: width, navVersion: 1, isWalkable: (x,y) => inside(x,y) && !blocked(x,y,0),
    isBaseWalkable: inside, speedAt: () => 1, terrainAt: () => 0 };
  game.walls = { enabled: () => true, doorWaypoint: () => null, doorsForUnit: () => {}, blocksMove: blocked };
  game.world.walls = game.walls; game.nav = new Nav(game.world, cfg);
  const [x,y] = transform(0,0), [gx,gy] = transform(s+230,0);
  const u = game.spawnUnit(faction, role, x, y); u.goal = { x: gx, y: gy }; u.arrived = false; u.activity = 'advance';
  const goalDistance = Math.hypot(gx-x,gy-y); let maxStep = 0, collided = false, movesAway = false;
  for (let i=0; i<800; i++) {
    const ox=u.x,oy=u.y; game.time+=0.05; game.nav.advance(); updateTimers(game,u,0.05); moveAlongFlow(game,u,0.05);
    maxStep=Math.max(maxStep,Math.hypot(u.x-ox,u.y-oy)); collided ||= blocked(u.x,u.y,u.radius);
    movesAway ||= !!u.goal && Math.hypot(gx-u.x,gy-u.y)>goalDistance+32;
    if (u.arrived || u.pathFailed) break;
  }
  const noTeleport = maxStep <= u.speed * 0.05 * 1.5 + 1e-9;
  return { role, seed, rotation, size, faction, arrived: !!u.arrived, pathFailed: !!u.pathFailed, collided, noTeleport, movesAway,
    seconds: +game.time.toFixed(2), distanceToGoal: +Math.hypot(gx-u.x,gy-u.y).toFixed(2) };
}
const results=[];
for (const role of ['infantry','truck','tank']) for (const rotation of [0,1,2,3]) for (const size of [128,160,192])
  for (const seed of [5,7,11]) for (const faction of [0,1]) results.push(run(role,seed,rotation,size,faction));
const ok = (r) => r.arrived && !r.pathFailed && !r.collided && r.noTeleport && r.movesAway && r.distanceToGoal < 34;
const passed=results.filter(ok).length;
console.log(JSON.stringify({ vehicleDetour:on, method:'216 одиночных сцен: 4 поворота × 3 размера × 3 seed × 3 типа × 2 фракции, без боя и других юнитов', passed,total:results.length,results },null,2));
if (passed !== results.length) process.exitCode=1;
