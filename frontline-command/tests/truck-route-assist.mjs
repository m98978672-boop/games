import assert from 'node:assert/strict';import {loadConfig} from '../src/core/config.js';import {Game} from '../src/sim/game.js';
import {moveAlongFlow} from '../src/sim/units.js';import {truckRouteAssist} from '../src/sim/smart_route.js';
const cfg=await loadConfig();assert(cfg.flag('truck_route_assist_v1'));assert(cfg.flag('bot_obstacle_vision_v1'));
cfg.flags.bot_obstacle_vision_v1=false; // isolate truck-specific fallback and cancellation
for(const faction of [0,1]){
 const g=new Game({cfg,seed:5,aiVsAi:true});g.units.clear();g.unitGrid.clear();
 g.world={W:1024,H:1024,navVersion:1,isBaseWalkable:(x,y)=>x>0&&y>0&&x<1024&&y<1024,isWalkable:(x,y)=>x>0&&y>0&&x<1024&&y<1024,speedAt:()=>1};
 g.walls={enabled:()=>true,navQueue:new Set(),blocksMove:(x,y,r)=>x+r>=220&&x-r<=225,buildingAtPoint:()=>null,doorWaypoint:()=>null,doorsForUnit:()=>{}};g.nav={field:()=>null};
 const u=g.spawnUnit(faction,'truck',180,200);u.goal={x:600,y:200};u.arrived=false;u.activity='advance';u.stuck=0;g.time=1;
 assert(truckRouteAssist(g,u));moveAlongFlow(g,u,.05);const job=g._smartRouteState?.active;assert(job && job.unit===u,'truck starts bounded search');assert(job.planner.operations<=64);
 cfg.flags.truck_route_assist_v1=false;g.time+=.05;moveAlongFlow(g,u,.05);assert.equal(g._smartRouteState.active,null,'disabling assist frees planner');assert.equal(job.planner.status,'cancelled');
 cfg.flags.truck_route_assist_v1=true;g.time+=.05;u.goal={x:600,y:200};u._smartRetryAt=0;u._obstacleVisionNext=0;moveAlongFlow(g,u,.05);
 const next=g._smartRouteState.active;assert(next);u.goal=null;moveAlongFlow(g,u,.05);assert.equal(next.planner.status,'cancelled','cleared goal frees planner');
}
console.log('truck-only obstacle assist: bounded search and cancellation, both factions');
