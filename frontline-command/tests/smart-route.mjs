import assert from 'node:assert/strict';
import { updateSmartRoute } from '../src/sim/smart_route.js';
import { loadConfig } from '../src/core/config.js';
import { Game } from '../src/sim/game.js';
import { moveAlongFlow } from '../src/sim/units.js';

const cfg=await loadConfig();
assert.equal(cfg.flag('smart_route_v2'),false,'separate route trigger remains off');
cfg.flags.bot_obstacle_vision_v1=false; // isolate the alternative trigger under test
const game=new Game({cfg,seed:5,aiVsAi:true});
game.units.clear();game.unitGrid.clear();
const w=1024;
game.world={W:w,H:w,navVersion:1,isBaseWalkable:(x,y)=>x>0&&y>0&&x<w&&y<w,
  isWalkable:(x,y)=>x>0&&y>0&&x<w&&y<w,speedAt:()=>1};
game.walls={enabled:()=>true,blocksMove:()=>false,doorWaypoint:()=>null,doorsForUnit:()=>{},navQueue:new Set()};
game.nav={field:()=>null};
const a=game.spawnUnit(0,'infantry',150,150), b=game.spawnUnit(1,'infantry',200,200);
for(const u of [a,b]){u.goal={x:700,y:700};u.stuck=1;u.arrived=false;u.activity='advance';}
game.time=1;
moveAlongFlow(game,a,0.05);
assert.equal(game._smartRouteState,undefined,'off does not start planner');
cfg.flags.smart_route_v2=true;
updateSmartRoute(game,a);
let job=game._smartRouteState.active;
assert.ok(job && job.unit===a);
assert.ok(job.planner.operations<=64,'bounded work for first tick');
const operations=job.planner.operations;
updateSmartRoute(game,a);updateSmartRoute(game,b);
assert.equal(job.planner.operations,operations,'only one slice per tick');
assert.equal(game._smartRouteState.active.unit,a,'one active search per game');
for(let i=0;i<300&&!a._smartRoute;i++){game.time+=0.05;updateSmartRoute(game,a);updateSmartRoute(game,b);}
assert.ok(a._smartRoute,'first unit eventually receives a path');
assert.ok(b._smartRoute || game._smartRouteState.active?.unit===b,'second unit can use released slot');
assert.ok(a.detour && a._smartRoute.detour===a.detour);
const old=a.detour;
a.goal={x:650,y:700};a.stuck=0;game.time+=0.05;updateSmartRoute(game,a);
assert.equal(a._smartRoute,null,'changed goal invalidates path');
assert.notEqual(a.detour,old,'stale detour removed');
// Mid-search cancellation on a goal change cannot publish the old path.
const state=game._smartRouteState;
if(state.active) state.active.planner.cancel();
state.active=null;b._smartRoute=null;b.stuck=1;b._smartRetryAt=0;game.time+=0.05;
updateSmartRoute(game,b);job=state.active;assert.ok(job);
b.goal={x:600,y:700};game.time+=0.05;updateSmartRoute(game,b);
assert.equal(state.active,null);
assert.equal(job.planner.status,'cancelled');
assert.equal(b._smartRoute,null);
// Existing path invalidates immediately on a queued door/wall rebuild.
a._smartRoute={path:[{x:300,y:300}],index:0,gx:a.goal.x,gy:a.goal.y,world:game.world,walls:game.walls,version:game.world.navVersion,detour:{x:300,y:300,until:99}};
a.detour=a._smartRoute.detour;game.walls.navQueue.add(1);game.time+=0.05;updateSmartRoute(game,a);
assert.equal(a._smartRoute,null);assert.equal(a.detour,null);
console.log('smart route: opt-in, bounded scheduler, slot reuse and stale cancellation OK');
