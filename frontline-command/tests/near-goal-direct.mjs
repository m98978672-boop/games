import assert from 'node:assert/strict';import {loadConfig} from '../src/core/config.js';import {Game} from '../src/sim/game.js';import {moveAlongFlow} from '../src/sim/units.js';
const cfg=await loadConfig();assert.equal(cfg.flag('near_goal_direct_v1',false),false);
for(const [on,blocked,contact] of [[false,false,false],[true,false,false],[true,true,false],[true,false,true]]){
 cfg.flags.near_goal_direct_v1=on;cfg.flags.crowd_nav_v2=false;cfg.flags.vision_nav_policy_v1=false;cfg.flags.motion_slide_guard_v1=false;
 const g=new Game({cfg,seed:1,aiVsAi:true});g.units.clear();g.unitGrid.clear();const u=g.spawnUnit(0,'infantry',200,200);
 u.goal={x:240,y:240};u.flowDir={x:1,y:0};u.flowTimer=1;u.perception.hasContact=contact;
 g.world.speedAt=()=>1;g.world.isBaseWalkable=()=>true;g.world.isWalkable=()=>true;g.walls.enabled=()=>true;
 g.walls.buildingAtPoint=()=>null;g.walls.doorWaypoint=()=>null;g.walls.doorsForUnit=()=>{};
 g.walls.blocksMove=(x,y)=>blocked&&x>215&&y>215;
 moveAlongFlow(g,u,.05);
 if(on&&!blocked&&!contact)assert.ok(u.y>200,'steers directly when clear');
 else assert.equal(u.y,200,'uses flow for off, blocked path, or combat');
 assert.ok(Math.hypot(u.x-200,u.y-200)<=u.speed*.05+1e-8);
}
console.log('near goal direct: opt-in, terrain/wall segment sampled, combat excluded, speed preserved');
