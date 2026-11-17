// Real Game.step, with controlled orders, no tactical AI or combat.
import assert from 'node:assert/strict';import {loadConfig} from '../src/core/config.js';import {Game} from '../src/sim/game.js';import {moveAlongFlow,updateTimers} from '../src/sim/units.js';
async function setup(faction,type,role,side,closed,on) {
 const cfg=await loadConfig();cfg.flags.vehicle_gate_access_v1=on;
 const g=new Game({cfg,seed:7,aiVsAi:true});g.units.clear();g.unitGrid.clear();g.occupancyGrid.clear();g.squads.clear();
 for(const obj of [g.squadAI,...g.strategic,g.autopilot,g.rules,g.build,g.influence,g.api])obj.update=()=>{};g.checkVictory=()=>{};
 const b=g.world.buildings.find(v=>v.type===type&&v.faction===faction&&g.walls.state(v)),st=b&&g.walls.state(b);assert(st,`${faction} ${type}`);
 const o=st.outline.openings.find(v=>v.type==='gate');assert(o);const x=b.x+o.cx,y=b.y+o.cy;
 if(closed)assert.equal(g.walls.closeDoor(b,o.id).ok,true);else g.walls.openDoor(b,o.id);g.walls.flushNav();
 const u=g.spawnUnit(faction,role,x+side*o.nx*55,y+side*o.ny*55);u.goal={x:x-side*o.nx*100,y:y-side*o.ny*100};u.activity='advance';u.arrived=false;u.thinkTimer=10000;
 g.logistics.update=role==='truck'?dt=>{updateTimers(g,u,dt);if(u.goal)moveAlongFlow(g,u,dt);}:()=>{};
 return {g,u,b,st,o,x,y};
}
for(const faction of [0,1])for(const type of ['depot','factory'])for(const role of ['truck','tank'])for(const side of [-1,1])for(const closed of [false,true]){
 const {g,u,b,st,o,x,y}=await setup(faction,type,role,side,closed,true);const target={...u.goal};let crossed=false,opened=!closed;
 for(let i=0;i<800&&!u.arrived&&!u.pathFailed;i++){
  const ox=u.x,oy=u.y;g.step(.05);opened||=st.doors[o.id].state==='open';
  if(((u.x-x)*o.nx+(u.y-y)*o.ny)*side<0)crossed=true;
  assert.equal(g.walls.blocksMoveSweep(ox,oy,u.x,u.y,u.radius,u),false,`${role} swept wall safety`);
  assert.ok(Math.hypot(u.x-ox,u.y-oy)<=u.speed*.05*1.5+1e-8,'bounded step');
 }
 assert.ok(opened&&crossed&&u.arrived&&!u.pathFailed,`${faction} ${type} ${role} ${side} closed=${closed}`);
 assert.deepEqual(u.goal,target,'real target preserved');assert.ok(Math.hypot(u.x-target.x,u.y-target.y)<34);
}
for(const faction of [0,1])for(const type of ['depot','factory']){
 const {g,u,b}=await setup(faction,type,'truck',1,false,false);const target={...u.goal};moveAlongFlow(g,u,.05);
 assert.notDeepEqual(u.goal,target,'legacy sends vehicle to exterior');assert.equal(g.walls.buildingAtPoint(u.goal.x,u.goal.y),null);
}
for(const faction of [0,1])for(const type of ['hq','city']){
 const cfg=await loadConfig();cfg.flags.vehicle_gate_access_v1=true;const g=new Game({cfg,seed:7,aiVsAi:true});g.units.clear();g.unitGrid.clear();g.occupancyGrid.clear();
 const b=g.world.buildings.find(v=>v.type===type&&v.faction===faction&&g.walls.state(v));const o=g.walls.state(b).outline.openings.find(v=>v.type==='door');
 const x=b.x+o.cx,y=b.y+o.cy,u=g.spawnUnit(faction,'tank',x+o.nx*100,y+o.ny*100);u.goal={x:b.x,y:b.y};moveAlongFlow(g,u,.05);
 assert(u.goal&&!g.walls.buildingAtPoint(u.goal.x,u.goal.y),'pedestrian-only doors remain exterior');
}
// Reject a too-narrow gate, and do not let waypoint selection pick one when
// a building has both a narrow and a usable gate.
{
 const {g,u,b,st,o}=await setup(0,'depot','tank',1,false,true);
 const narrow={...o,id:'narrow',p1:[-10,0],p2:[10,0],cx:o.cx,cy:o.cy};
 assert.equal(g.walls.vehicleFitsGate(u,narrow,st.outline),false);
 const saved=st.outline.openings;st.outline.openings=[narrow];
 const target={...u.goal};moveAlongFlow(g,u,.05);
 assert.notDeepEqual(u.goal,target,'narrow-only gate sends AI outside');
 st.outline.openings=[narrow,o];u.goal=target;
 const expected=g.walls.doorWaypoint(u,target.x,target.y);
 st.outline.openings=[o];assert.deepEqual(g.walls.doorWaypoint(u,target.x,target.y),expected,'wide gate chosen instead of narrow');
 st.outline.openings=saved;
}
console.log('vehicle gates: 32 actual Game.step scenes with open/closed gates, exits and entries; both vehicle types and factions; legacy/foot-only guards');
