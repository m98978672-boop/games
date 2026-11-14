import assert from 'node:assert/strict';
import { loadConfig } from '../src/core/config.js';
import { Game } from '../src/sim/game.js';
import { IncrementalPlanner } from '../tools/experiments/incremental-planner.mjs';
const cfg=await loadConfig();
for (const faction of [0,1]) {
  const game=new Game({cfg,seed:7,aiVsAi:true});
  const b=game.world.buildings.find(b=>b.type==='hq'&&b.faction===faction&&game.walls.state(b));
  const o=game.walls.state(b).outline.openings.find(o=>o.type==='door');
  assert.ok(o);
  assert.equal(game.walls.closeDoor(b,o.id).ok,true);
  game.walls.flushNav();
  const u=game.spawnUnit(faction,'infantry',b.x+o.cx-o.nx*80,b.y+o.cy-o.ny*80);
  u.goal={x:b.x+o.cx+o.nx*100,y:b.y+o.cy+o.ny*100};
  const p=new IncrementalPlanner(game,u);
  assert.equal(p.step(1).status,'running');
  const before=game.world.navVersion;
  assert.equal(game.walls.openDoor(b,o.id).ok,true);
  assert.equal(game.world.navVersion,before,'rebuild is deferred');
  assert.ok(game.walls.navQueue.size>0);
  assert.equal(p.step(1).status,'cancelled','invalidate before deferred rebuild');
  game.walls.flushNav();
  const p2=new IncrementalPlanner(game,u);
  assert.equal(p2.step(1).status,'running');
  assert.equal(game.walls.closeDoor(b,o.id).ok,true);
  assert.equal(p2.step(1).status,'cancelled');
}
console.log('incremental planner: real door changes cancel before deferred navigation rebuild for both factions OK');
