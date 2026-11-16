import assert from 'node:assert/strict';
import {loadConfig} from '../src/core/config.js';
import {Game} from '../src/sim/game.js';
import {moveAlongFlow} from '../src/sim/units.js';
import {updateSmartRoute} from '../src/sim/smart_route.js';

for(const faction of [0,1]) {
 const cfg=await loadConfig();cfg.flags.smart_route_v2=true;
 const game=new Game({cfg,seed:7,aiVsAi:true});game.units.clear();game.unitGrid.clear();
 const size=1024;
 game.world={W:size,H:size,navVersion:1,isBaseWalkable:(x,y)=>x>0&&y>0&&x<size&&y<size,
  isWalkable:(x,y)=>x>0&&y>0&&x<size&&y<size,speedAt:()=>1};
 game.walls={enabled:()=>true,blocksMove:()=>false,doorWaypoint:()=>null,doorsForUnit:()=>{},navQueue:new Set()};
 game.nav={field:()=>null};
 const a=game.spawnUnit(faction,'infantry',150,150),b=game.spawnUnit(faction,'infantry',200,200);
 for(const u of [a,b]){u.goal={x:700,y:700};u.stuck=1;u.arrived=false;u.activity='advance';}
 game.time=1;updateSmartRoute(game,a);const job=game._smartRouteState.active;
 assert.ok(job&&job.unit===a);
 // Arrive during the search: do not leave a no-longer-updated owner holding
 // the single global search slot until its timeout.
 a.goal={x:a.x,y:a.y};moveAlongFlow(game,a,.05);
 assert.equal(a.arrived,true);assert.equal(game._smartRouteState.active,null);assert.equal(job.planner.status,'cancelled');
 game.time+=.05;updateSmartRoute(game,b);assert.equal(game._smartRouteState.active?.unit,b);
 // An already-arrived owner must also be cleaned up by another caller.
 b.arrived=true;game.time+=.05;updateSmartRoute(game,a);assert.equal(game._smartRouteState.active,null);
 // A route is validated for the geometry/radius it was built for.
 a.arrived=false;a.goal={x:700,y:700};a.stuck=0;
 const detour={x:400,y:400,until:99};
 a.detour=detour;a._smartRoute={path:[{x:400,y:400}],index:0,gx:700,gy:700,world:game.world,walls:game.walls,version:game.world.navVersion,radius:a.radius,detour};
 game.time+=.05;updateSmartRoute(game,a);assert.ok(a._smartRoute,'unchanged radius keeps path');
 a.radius+=1;game.time+=.05;updateSmartRoute(game,a);
 assert.equal(a._smartRoute,null);assert.equal(a.detour,null,'stale waypoint cancelled');
}
console.log('smart route: arrival releases active search and radius change invalidates route, both factions');
