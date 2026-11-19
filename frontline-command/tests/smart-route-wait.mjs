import assert from 'node:assert/strict';
import {loadConfig} from '../src/core/config.js';
import {Game} from '../src/sim/game.js';
import {updateTimers} from '../src/sim/units.js';
import {updateSmartRoute,smartRouteSearching} from '../src/sim/smart_route.js';

for (const faction of [0,1]) {
  const cfg=await loadConfig();cfg.flags.smart_route_v2=true;cfg.flags.bot_obstacle_vision_v1=false;
  const game=new Game({cfg,seed:7,aiVsAi:true});game.units.clear();game.unitGrid.clear();
  game.world={W:2048,H:2048,navVersion:1,isBaseWalkable:(x,y)=>x>0&&y>0&&x<2048&&y<2048,
    isWalkable:(x,y)=>x>0&&y>0&&x<2048&&y<2048,speedAt:()=>1};
  game.walls={enabled:()=>true,blocksMove:()=>false,buildingAtPoint:()=>null,navQueue:new Set()};
  const u=game.spawnUnit(faction,'infantry',150,150);
  u.goal={x:1500,y:1500};u.stuck=1;u.arrived=false;u.activity='advance';
  game.time=1;updateSmartRoute(game,u);const job=game._smartRouteState.active;
  assert(job && job.planner.status==='running');assert(smartRouteSearching(game,u));
  // Simulate a slowly sliced active job and two anti-stuck intervals.
  game.time=3.6;updateTimers(game,u,2.6);
  game.time=6.9;updateTimers(game,u,3.3);
  assert(u.goal && !u.pathFailed, 'active route search retains original goal');
  assert.equal(u.stuck,1,'waiting does not erase the indication of being stuck');
  // No perpetual waiting after timeout, nor for a changed destination or world.
  game.time=7.1;assert(!smartRouteSearching(game,u));updateTimers(game,u,2.6);
  assert.equal(u.goal,null);assert(u.pathFailed,'timed out planner cannot mask a deadlock');
  u.goal={x:1500,y:1500};u.pathFailed=false;u.arrived=false;game.time=2;
  assert(smartRouteSearching(game,u));
  u.goal={x:1490,y:1500};assert(!smartRouteSearching(game,u));
  u.goal={x:1500,y:1500};game.world.navVersion++;assert(!smartRouteSearching(game,u));
  game.world.navVersion--;u.perception.hasContact=true;assert(!smartRouteSearching(game,u));
  u.perception.hasContact=false;cfg.flags.smart_route_wait_v1=false;assert(!smartRouteSearching(game,u));
  cfg.flags.smart_route_wait_v1=true;cfg.flags.smart_route_v2=false;assert(!smartRouteSearching(game,u));
}
console.log('smart route wait: active, changed goal/world, combat, flag and bounded timeout; both factions');
