// Tangential recovery only when a non-combat bot is pushing against a wall on
// its way to a distant goal. All movement still uses the ordinary collision
// and speed checks; a blocked escape must not tunnel through a unit.
import assert from 'node:assert/strict';
import {loadConfig} from '../src/core/config.js';
import {Game} from '../src/sim/game.js';
import {moveUnit} from '../src/sim/units.js';
import {execFileSync} from 'node:child_process';

async function run({faction=0,contact=false,player=false,vehicle=false,near=false,occupancy=true,pathing=true,enabled=true,block=false,expired=false,newGoal=false,outsideGoal=false,insideStart=false}={}) {
 const cfg=await loadConfig();cfg.flags.movement_occupancy_v1=occupancy;cfg.flags.pathing_v2=pathing;cfg.flags.distant_building_wall_follow_v1=enabled;
 const g=new Game({cfg,seed:5,aiVsAi:true});g.units.clear();g.unitGrid.clear();g.occupancyGrid.clear();g.squads.clear();g._wallFollowMetrics={steps:0};
 const sign=faction?-1:1,wall=1000,role=vehicle?'tank':'infantry';
 const radius=vehicle?(cfg.unit(role).size||44)*.42:9;
 const x=wall-sign*(radius+.1),y=800;
 Object.assign(g.world,{W:2048,H:2048,isWalkable:()=>true,isBaseWalkable:()=>true,speedAt:()=>1});
 Object.assign(g.walls,{enabled:()=>true,buildingAtPoint:(px)=>sign*(px-wall)>300 ? (outsideGoal?null:{}) : (insideStart?{}:null),doorWaypoint:()=>null,doorsForUnit:()=>{},
  blocksMove:(x,y,r)=>sign*(x-wall)+r>=0,
  blocksMoveSweep:(x1,y1,x2,y2,r)=>sign*(Math.max(sign*x1,sign*x2)*sign-wall)+r>=0});
 const u=g.spawnUnit(faction,role,x,y);u.goal={x:x+sign*(near?100:800),y};u.perception.hasContact=contact;u.playerControlled=player;
 const others=[];if(block){for(const dy of [-20,20])others.push(g.spawnUnit(faction,'infantry',x,y+dy));}
 if(expired){g.time=30;u._wallFollowBudget={gx:u.goal.x-(newGoal?100:0),gy:u.goal.y,version:g.world.navVersion,x,y,since:0};}
 const before={x:u.x,y:u.y};moveUnit(g,u,sign,0,.05);
 return {dx:u.x-before.x,dy:u.y-before.y,steps:g._wallFollowMetrics.steps,speed:u.speed,
  noOverlap:others.every(v=>Math.hypot(v.x-u.x,v.y-u.y)>=u.radius+v.radius)};
}
for(const faction of [0,1]) {
 const r=await run({faction});assert.equal(r.steps,1,JSON.stringify(r));assert.ok(Math.abs(r.dy)>0.5&&Math.abs(r.dx)<1e-6,'move tangentially');assert.ok(Math.hypot(r.dx,r.dy)<=r.speed*.05+1e-8);
 for(const opts of [{contact:true},{player:true},{vehicle:true},{near:true},{occupancy:false},{pathing:false},{enabled:false},{outsideGoal:true},{insideStart:true}]) {
  const x=await run({faction,...opts});assert.equal(x.steps,0,JSON.stringify(opts));
 }
 const blocked=await run({faction,block:true});assert.ok(blocked.noOverlap&&Math.hypot(blocked.dx,blocked.dy)<=blocked.speed*.05+1e-8,'ordinary speed and no overlap with neighbors');
 const expired=await run({faction,expired:true});assert.equal(expired.steps,0,'budget expires in the same area');
 const fresh=await run({faction,expired:true,newGoal:true});assert.equal(fresh.steps,1,'new goal resets budget');
}
// Real squad decisions and Command API, actual HQ walls, both factions.
const r=JSON.parse(execFileSync(process.execPath,[new URL('../tools/wall-follow-building-orders.mjs',import.meta.url).pathname,'--quick'],{encoding:'utf8'})).results;
assert.ok(r.every(x=>x.accepted&&!x.initialInvalid&&!x.wall&&!x.overlap&&!x.swept&&!x.speed),'commands and safe movement');
assert.ok(r.reduce((s,x)=>s+x.steps,0)>0,'wall follow actually used');
assert.ok(r.reduce((s,x)=>s+x.nearTarget,0)>=26,'columns make progress to the ordered building');
console.log('distant wall follow: scoped recovery, budget, real orders, swept safety and guard cases');
