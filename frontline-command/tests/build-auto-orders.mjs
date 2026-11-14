import assert from 'node:assert/strict';
import { loadConfig } from '../src/core/config.js';
import { Game } from '../src/sim/game.js';

const cfg = await loadConfig();
cfg.flags.ai_auto_plan = true;
cfg.ai.build = { ...cfg.ai.build, minArmy: 0, reserveMaterials: 0, cooldownSeconds: 25 };
const game = new Game({ cfg, seed: 7, aiVsAi: true });
game.autopilot.areaEnabled = () => true;
game.build.threatAt = () => 2;
game.world.buildings = [];
game.time = 40;

for (const faction of [0, 1]) {
  const point = game.world.points.find(p => p.owner === faction && ['city', 'depot', 'hq', 'factory'].includes(p.type));
  assert.ok(point, `point for faction ${faction}`);
  const prior = game.api.orders.length;
  assert.equal(game.build.autoPlan(faction), 1, 'newly queued order is counted');
  const order = game.api.orders.at(-1);
  assert.equal(order.status, 'queued');
  assert.equal(order.accepted, null, 'queueing is not acceptance');
  assert.equal(order.faction, faction);
  assert.equal(game.build.autoPlan(faction), 0, 'cooldown prevents duplicate queue entries');
  assert.equal(game.api.orders.length, prior + 1);
  assert.equal(game.build.buildCooldown[faction], 65);
  // Radio delivery may still reject; the cooldown remains to avoid retry spam.
  const execute = game.executeCommand;
  game.executeCommand = () => ({ accepted: false, reason: 'test rejection' });
  game.api.deliver(order);
  game.executeCommand = execute;
  assert.equal(order.status, 'refused');
  assert.equal(game.build.autoPlan(faction), 0);
}

for (const faction of [0, 1]) {
  game.time = 100;
  const own = game.world.points.find(p => p.owner === faction);
  const enemy = game.world.points.find(p => p.owner === 1 - faction);
  assert.ok(own && enemy);
  const before = game.api.orders.length;
  game.autopilot.onSectorSecured(faction, null);
  game.autopilot.onSectorSecured(faction, enemy);
  game.autopilot.onSectorSecured(faction, { ...own, owner: null });
  assert.equal(game.api.orders.length, before, 'neutral or enemy point must not trigger a build');
  game.autopilot.onSectorSecured(faction, own);
  assert.equal(game.api.orders.length, before + 1);
  assert.equal(game.api.orders.at(-1).status, 'queued');
  assert.equal(game.api.orders.at(-1).faction, faction);
  game.autopilot.onSectorSecured(faction, own);
  assert.equal(game.api.orders.length, before + 1, 'cooldown applies to sector orders too');
}
console.log('build auto orders: queue, refusal, cooldown and ownership for both factions OK');

// Сильно укреплённая точка не должна блокировать все следующие цели ИИ.
for (const faction of [0, 1]) {
  const g = new Game({ cfg, seed: 11, aiVsAi: true });
  g.time = 40;
  g.autopilot.areaEnabled = () => true;
  const points = g.world.points.filter(p => p.owner === faction && ['city','depot','hq','factory'].includes(p.type));
  const first = points[0];
  const second = points.find(p => Math.hypot(p.x-first.x,p.y-first.y) > 600);
  assert.ok(first && second, 'need two separate points');
  g.world.points = [first, second];
  g.build.threatAt = (_f,x,y) => x === first.x && y === first.y ? 3 : 2;
  const forts = p => Array.from({length:4}, () => ({type:'sandbags', faction, x:p.x, y:p.y, dead:false}));
  g.world.buildings = [...forts(first), {type:'hq', faction, x:second.x, y:second.y, dead:false}];
  assert.equal(g.build.autoPlan(faction),1);
  assert.equal(g.api.orders.at(-1).params.pointId, second.id, 'select next threatened point');
  g.time = 100;
  g.world.buildings.push(...forts(second));
  assert.equal(g.build.autoPlan(faction),0, 'both points fortified');
  g.world.buildings = [{type:'hq', faction, x:first.x, y:first.y, dead:false},
    {type:'factory', faction, x:first.x, y:first.y, dead:false},
    {type:'depot', faction, x:first.x, y:first.y, dead:false},
    {type:'city', faction, x:first.x, y:first.y, dead:false}];
  assert.equal(g.build.autoPlan(faction),1, 'civilian buildings are not defensive forts');
  assert.equal(g.api.orders.at(-1).params.pointId, first.id);
}
console.log('build auto orders: next threatened target and fort classification OK');
