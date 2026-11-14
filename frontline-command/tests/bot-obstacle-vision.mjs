import assert from 'node:assert/strict';
import { loadConfig } from '../src/core/config.js';
import { Game } from '../src/sim/game.js';
import { moveAlongFlow } from '../src/sim/units.js';
import { obstacleAhead, updateSmartRoute } from '../src/sim/smart_route.js';
const cfg=await loadConfig();
assert.equal(cfg.flag('bot_obstacle_vision_v1',false),false,'experimental sensor must be off by default');
const g=new Game({cfg,seed:5,aiVsAi:true});g.units.clear();g.unitGrid.clear();
let wall=false, terrain=false;
g.world={W:1024,H:1024,navVersion:1,isBaseWalkable:(x,y)=>x>0&&y>0&&x<1024&&y<1024&&!(terrain&&x>=210&&x<=230),
  isWalkable:(x,y)=>x>0&&y>0&&x<1024&&y<1024,speedAt:()=>1};
g.walls={enabled:()=>true,navQueue:new Set(),blocksMove:(x,y,r)=>wall&&x+r>=220&&x-r<=225,
  doorWaypoint:()=>null,doorsForUnit:()=>{}};
g.nav={field:()=>null};
const u=g.spawnUnit(0,'infantry',180,200);u.goal={x:600,y:200};u.arrived=false;u.activity='advance';u.stuck=0;
assert.equal(obstacleAhead(g,u),false,'clear path');
wall=true;assert.equal(obstacleAhead(g,u),true,'wall in front');
wall=false;terrain=true;assert.equal(obstacleAhead(g,u),true,'impassable terrain in front');
terrain=false;wall=true;u.goal={x:140,y:200};assert.equal(obstacleAhead(g,u),false,'wall behind is ignored');
u.goal={x:600,y:200};g.time=1;
moveAlongFlow(g,u,0.05);assert.equal(g._smartRouteState,undefined,'off does not start an eye-driven planner');
cfg.flags.bot_obstacle_vision_v1=true;
u.perception.hasContact=true;updateSmartRoute(g,u);assert.equal(g._smartRouteState.active,null,'no route search during combat');
u.perception.hasContact=false;u.playerControlled=true;updateSmartRoute(g,u);assert.equal(g._smartRouteState.active,null,'no route search for manually controlled player');
u.playerControlled=false;g.walls.buildingAtPoint=x=>x>500?{}:null;
updateSmartRoute(g,u);assert.equal(g._smartRouteState.active,null,'building goal keeps normal door handling');
g.walls.buildingAtPoint=()=>null;u.stuck=0;updateSmartRoute(g,u);
const job=g._smartRouteState.active;assert.ok(job,'sees nearby obstacle without waiting to get stuck');
assert.ok(job.planner.operations>0&&job.planner.operations<=64,'search work per tick is bounded');
const ops=job.planner.operations;updateSmartRoute(g,u);assert.equal(job.planner.operations,ops,'one slice per game tick');
u.goal={x:600,y:300};g.time+=0.05;updateSmartRoute(g,u);
assert.equal(job.planner.status,'cancelled','goal change cancels the search');assert.ok(!u._smartRoute);
// Toggling both route flags off must discard an existing owned route.
u._smartRoute={detour:{x:230,y:300,until:99}};u.detour=u._smartRoute.detour;
cfg.flags.bot_obstacle_vision_v1=false;moveAlongFlow(g,u,0.05);
assert.equal(u._smartRoute,null);assert.equal(u.detour,null);
console.log('Bot obstacle vision: wall and terrain sensing, opt-in, combat/door guard and stale route cancellation');
