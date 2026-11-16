import assert from 'node:assert/strict';
import {loadConfig} from '../src/core/config.js';
import {Game} from '../src/sim/game.js';
import {moveUnit} from '../src/sim/units.js';
import {solidUnitMoveFree} from '../src/sim/solid_units.js';
const cfg=await loadConfig();assert.equal(cfg.flag('crowd_swept_units_v1',false),false);
for(const faction of [0,1]){
 function fixture(on){
  cfg.flags.crowd_swept_units_v1=on;cfg.flags.crowd_nav_v2=true;cfg.flags.wall_collision_v2=false;
  const g=new Game({cfg,seed:7,aiVsAi:true});g.units.clear();g.unitGrid.clear();
  const u=g.spawnUnit(faction,'infantry',1000,1000),v=g.spawnUnit(faction,'infantry',1030,1000);
  u.goal={x:1100,y:1000};u._crowdActive=true;u.speed=600;
  g.world.isWalkable=()=>true;g.world.speedAt=()=>1;
  return {g,u,v};
 }
 const before=fixture(false);moveUnit(before.g,before.u,1,0,.1);
 assert.equal(before.u.x,1060,'without experiment endpoint-only crowd check permits tunnelling');
 const after=fixture(true);moveUnit(after.g,after.u,1,0,.1);
 const vx=after.u.x-1000,vy=after.u.y-1000,t=Math.max(0,Math.min(1,(30*vx)/(vx*vx+vy*vy||1)));
 assert.ok(Math.hypot(1000+vx*t-after.v.x,1000+vy*t-after.v.y)>=after.u.radius+after.v.radius,'entire chosen movement avoids the other unit');
 assert.ok(Math.hypot(after.u.x-1000,after.u.y-1000)<=60+1e-8);
 assert.equal(solidUnitMoveFree(after.g,after.u,1060,1000,.01),false,'swept path blocked');
 // Existing overlap must not lock units that are moving away.
 after.v.x=after.u.x+10;after.v.y=after.u.y;after.g.unitGrid.update(after.v);
 assert.equal(solidUnitMoveFree(after.g,after.u,after.u.x-1,after.u.y,.01),true);
 assert.equal(solidUnitMoveFree(after.g,after.u,after.u.x+1,after.u.y,.01),false);
 // Rescue also has to respect the guard: a stationary unit 23 px away
 // blocks the first 7.875 px rescue push when walls consider the start stuck.
 function rescue(on){
  const {g,u,v}=fixture(on);cfg.flags.wall_collision_v2=true;u.speed=105;v.x=1023;g.unitGrid.update(v);
  g.walls.enabled=()=>true;g.walls.doorWaypoint=()=>null;g.walls.doorsForUnit=()=>{};
  g.walls.blocksMove=(x,y)=>Math.abs(x-1000)<1e-8&&Math.abs(y-1000)<1e-8;
  g.world.isBaseWalkable=()=>true;
  moveUnit(g,u,0,0,.05);return {u,v};
 }
 const unchecked=rescue(false),guarded=rescue(true);
 assert.ok(Math.hypot(unchecked.u.x-unchecked.v.x,unchecked.u.y-unchecked.v.y)<unchecked.u.radius+unchecked.v.radius,'legacy rescue can overlap');
 assert.ok(Math.hypot(guarded.u.x-guarded.v.x,guarded.u.y-guarded.v.y)>=guarded.u.radius+guarded.v.radius,'guard checks rescue movement');
}
console.log('crowd swept unit guard: default off, no crossing and overlap recovery for both factions');
