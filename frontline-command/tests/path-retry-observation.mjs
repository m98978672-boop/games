import assert from 'node:assert/strict';
import { loadConfig } from '../src/core/config.js';
import { Game } from '../src/sim/game.js';
import { updateTimers, moveAlongFlow } from '../src/sim/units.js';
import { MovementObserver } from '../src/inspector.js';
const cfg=await loadConfig();
for (const faction of [0,1]) {
  const game=new Game({cfg,seed:7,aiVsAi:true});
  const u=[...game.units.values()].find(x=>x.faction===faction && !x.isVehicle);
  u.goal={x:u.x+160,y:u.y};u.stuck=1;u.age=4;u.lastCheck={x:u.x,y:u.y,t:0};u.arrived=false;u.perception.hasContact=false;
  updateTimers(game,u,0.05);
  assert.equal(u.goal,null);assert.equal(u.pathFailed,true,'failure remains recorded');
  moveAlongFlow(game,u,0.05);
  assert.equal(u.pathFailed,true,'failure is not cleared before another goal');
  u.goal={x:u.x+160,y:u.y};
  moveAlongFlow(game,u,0.05);
  assert.equal(u.pathFailed,false,'new attempt resets old failure status');
  assert.equal(new MovementObserver().eligible(u),true,'F8 can observe the retried movement');
}
console.log('path retry: old failure remains visible until a new goal; retried units return to observation');
