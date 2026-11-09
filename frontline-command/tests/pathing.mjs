// Дверь штаба: регрессия грубого тайлового слоя, отдельно от будущего pathfinding v2.
import assert from 'node:assert/strict';
import { loadConfig } from '../src/core/config.js';
import { Game } from '../src/sim/game.js';
import { Nav } from '../src/sim/nav.js';
import { moveAlongFlow, moveUnit, updateTimers } from '../src/sim/units.js';

async function setup(enabled) {
  const cfg = await loadConfig();
  cfg.flags.pathing_v2 = enabled;
  if (process.env.VEHICLE_DETOUR === '1') cfg.flags.vehicle_detour_v2 = true;
  if (enabled && process.env.WALL_NAV_LOCAL === '1') cfg.flags.wall_nav_local = true;
  const g = new Game({ cfg, seed: 5, difficulty: 'regular', aiVsAi: true });
  g.units.clear(); g.unitGrid.clear();
  return g;
}
async function passOpening(enabled, type, role, openingType, reverse) {
  const g = await setup(enabled);
  const b = g.world.buildings.find((b) => b.type === type && g.walls.state(b));
  const o = g.walls.state(b).outline.openings.find((o) => o.type === openingType);
  const px = b.x + o.cx, py = b.y + o.cy;
  const inward = reverse ? 1 : -1;
  const u = g.spawnUnit(0, role, px + inward * o.nx * 55, py + inward * o.ny * 55, {});
  u.goal = { x: px - inward * o.nx * 100, y: py - inward * o.ny * 100 };
  u.activity = 'advance';
  for (let i = 0; i < 400; i++) {
    g.time += 0.05; g.nav.advance(); g.walls.update(0.05); updateTimers(g, u, 0.05); moveAlongFlow(g, u, 0.05);
    if (u.arrived || u.pathFailed) break;
  }
  return u;
}
for (const reverse of [false, true]) {
  const legacy = await passOpening(false, 'hq', 'infantry', 'door', reverse);
  assert.equal(legacy.pathFailed, true, 'флаг off должен сохранять старое поведение');
  for (const type of ['hq', 'city']) {
    const fixed = await passOpening(true, type, 'infantry', 'door', reverse);
    assert.equal(fixed.arrived, true, `${type}: пехота проходит открытую дверь, reverse=${reverse}`);
  }
  for (const type of ['depot', 'factory']) {
    const fixed = await passOpening(true, type, 'truck', 'gate', reverse);
    assert.equal(fixed.arrived, true, `${type}: грузовик проходит открытые ворота, reverse=${reverse}`);
  }
}
const g = await setup(true);
const b = g.world.buildings.find((b) => b.type === 'hq' && g.walls.state(b));
const seg = g.walls.state(b).outline.segments.find((s) => s.length >= 80);
const [[ax, ay], [bx, by]] = seg.points;
const len = Math.hypot(bx - ax, by - ay), nx = -(by - ay) / len, ny = (bx - ax) / len;
const mx = b.x + (ax + bx) / 2, my = b.y + (ay + by) / 2;
const u = g.spawnUnit(0, 'infantry', mx + nx * 35, my + ny * 35, {});
for (let i = 0; i < 30; i++) moveUnit(g, u, -nx, -ny, 0.05);
const signed = (u.x - mx) * nx + (u.y - my) * ny;
assert.ok(signed > 0, `сплошная стена остановила юнита (signed=${signed})`);
const waterIndex = g.world.terrain.findIndex((v) => v === 3);
assert.ok(waterIndex >= 0, 'вода существует');
const wx = (waterIndex % g.world.cols + 0.5) * g.world.T;
const wy = (Math.floor(waterIndex / g.world.cols) + 0.5) * g.world.T;
assert.equal(g.world.isBaseWalkable(wx, wy), false, 'вода остаётся непроходимой');
// Поле запрещает диагональ через два закрытых ортогональных соседа;
// следователь тоже обязан её отвергнуть (исторически срезал угол).
const grid = new Nav({ W: 192, H: 192, navVersion: 0, isWalkable: () => true, terrainAt: () => 0 },
  { flag: (key) => key === 'pathing_v2' || key === 'wall_collision_v2' });
grid.openArr.fill(0);
grid.openArr[4] = 1; grid.openArr[8] = 1;
const field = { dist: new Float64Array(9).fill(Infinity) };
field.dist[4] = 2; field.dist[8] = 0;
assert.equal(grid.step(field, 96, 96), null, 'запрещённый диагональный срез не выбирается');
grid.cfg.flag = () => false;
assert.ok(grid.step(field, 96, 96), 'при выключенном флаге прежний выбор сохранён');
grid.cfg.flag = (key) => key === 'pathing_v2';
assert.ok(grid.step(field, 96, 96), 'отключение стен возвращает старую навигацию');
grid.cfg.flag = (key) => key === 'pathing_v2' || key === 'wall_collision_v2';
grid.openArr[5] = 1; grid.openArr[7] = 1;
assert.ok(grid.step(field, 96, 96), 'разрешённая диагональ остаётся доступна');
// Воспроизводим случай с чужой стеной на пути к далёкой двери. В обоих
// вариантах pathing_v2 включён, меняется только порог возврата к полю.
async function remoteDoorObstacle(flowAfter, contact = false) {
  const g = await setup(true);
  g.cfg.navBudget.antiStuck.doorFlowAfter = flowAfter;
  const u = g.spawnUnit(0, 'infantry', 382, 3251, {});
  u.goal = { x: 1678, y: 2546 };
  u.activity = 'advance';
  u.stuck = 1;
  u.perception.hasContact = contact;
  assert.ok(g.walls.doorWaypoint(u, u.goal.x, u.goal.y), 'цель ведёт к удалённому проёму');
  let maxStep = 0;
  for (let i = 0; i < 40; i++) {
    const x = u.x, y = u.y;
    g.time += 0.05;
    g.nav.advance(); g.walls.update(0.05);
    updateTimers(g, u, 0.05); moveAlongFlow(g, u, 0.05);
    maxStep = Math.max(maxStep, Math.hypot(u.x - x, u.y - y));
    assert.equal(g.walls.blocksMove(u.x, u.y, u.radius, u), false, 'юнит не прошёл сквозь стену');
  }
  return { x: u.x, y: u.y, maxStep };
}
const forcedDoor = await remoteDoorObstacle(9999);
const retryField = await remoteDoorObstacle(1);
const combat = await remoteDoorObstacle(1, true);
assert.ok(retryField.y - forcedDoor.y > 30, 'после упора поле меняет направление вдоль промежуточной стены');
assert.ok(Math.hypot(combat.x - forcedDoor.x, combat.y - forcedDoor.y) < 0.01, 'в бою приоритет двери не меняется');
assert.ok(retryField.maxStep <= 8.25, 'обычный шаг, без телепорта');
console.log(`промежуточная стена: дверь → (${forcedDoor.x.toFixed(1)}, ${forcedDoor.y.toFixed(1)}), поле → (${retryField.x.toFixed(1)}, ${retryField.y.toFixed(1)}) за 2 с`);
console.log('проходы: пехота входит и выходит, грузовик проходит ворота; стена, вода и флаг off проверены');
