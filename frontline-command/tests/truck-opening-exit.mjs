// Game.step at real factory gates, with ordinary and experimental logistics.
import assert from 'node:assert/strict';
import {loadConfig} from '../src/core/config.js';import {Game} from '../src/sim/game.js';import {unsafeRest, safeRestGoal} from '../src/sim/rest_positions.js';
import {Save} from '../src/core/save.js';import {Walls} from '../src/sim/walls.js';
const store=new Map();globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)};
async function setup(faction,mode,occupancy,on,state='none') {
 const cfg=await loadConfig();cfg.flags.safe_logistics_v2=mode;cfg.flags.movement_occupancy_v1=occupancy;cfg.flags.truck_clear_opening_v1=on;cfg.flags.alg_save=true;
 const g=new Game({cfg,seed:7,aiVsAi:true});g.units.clear();g.unitGrid.clear();g.occupancyGrid.clear();g.squads.clear();
 for(const obj of [g.squadAI,...g.strategic,g.autopilot,g.rules,g.build,g.influence,g.api])obj.update=()=>{};
 g.checkVictory=()=>{};g.logistics.update=dt=>g.logistics.moveTrucks(dt);g.nearbyEnemies=()=>[];
 const b=g.world.buildings.find(b=>b.type==='factory'&&g.walls.state(b)?.outline.openings.some(o=>o.type==='gate'));
 const st=g.walls.state(b),o=st.outline.openings.find(o=>o.type==='gate');g.walls.openDoor(b,o.id);g.walls.flushNav();
 const t=g.spawnUnit(faction,'truck',b.x+o.cx,b.y+o.cy);t.truckTask=state==='none'?null:{state};t.goal=null;
 assert.ok(unsafeRest(g,t.x,t.y,t.radius));assert.equal(g.walls.blocksMove(t.x,t.y,t.radius,t),false);
 return {cfg,g,t,b,o};
}
for(const faction of [0,1])for(const mode of [false,true])for(const occupancy of [false,true])for(const state of ['none','idleTruck']){
 const a=await setup(faction,mode,occupancy,false,state),before=[a.t.x,a.t.y];
 for(let i=0;i<40;i++)a.g.step(.05);assert.deepEqual([a.t.x,a.t.y],before,'baseline blocks the gate');
 const {g,t}=await setup(faction,mode,occupancy,true,state);g._openingMetrics={started:0,cleared:0};
 let maxStep=0;
 for(let i=0;i<240&&unsafeRest(g,t.x,t.y,t.radius);i++){
  const x=t.x,y=t.y;g.step(.05);maxStep=Math.max(maxStep,Math.hypot(t.x-x,t.y-y));
  assert.equal(g.walls.blocksMoveSweep(x,y,t.x,t.y,t.radius,t),false,'wall-free swept movement');
 }
 assert.equal(unsafeRest(g,t.x,t.y,t.radius),false,'idle truck vacates the opening');
 assert.ok(maxStep<=t.speed*.05*1.5+1e-8,'no teleport');
 assert.deepEqual(g._openingMetrics,{started:1,cleared:1});assert.equal(t.truckTask?.state??'none',state);assert.equal(t.cargo,0);
}
for(const faction of [0,1])for(const mode of [false,true]){
 const {g,t}=await setup(faction,mode,true,true);const x=t.x,y=t.y;
 g.nearbyEnemies=()=>[{}];g.step(.05);assert.deepEqual([t.x,t.y],[x,y],'unassigned truck does not move under threat');
 g.nearbyEnemies=()=>[];g.step(.05);assert(t._openingVacate,'maneuver starts after threat');
 g.nearbyEnemies=()=>[{}];g.step(.05);assert.equal(t._openingVacate,false,'threat cancels its temporary goal');
 g.nearbyEnemies=()=>[];g.step(.05);assert(t._openingVacate,'maneuver can resume');
 const req={faction,kind:'sector',x:x+200,y:y+200,sectorId:g.world.sectorAt(x,y).id,created:g.time,priority:1};
 g.logistics.assignTruck(t,req);assert.equal(t.truckTask.request,req);assert.equal(t._openingVacate,false,'assignment preempts maneuver');
 g.step(.05);assert.equal(t.truckTask.request,req,'active delivery is not cancelled');
}
// A nearby stationary body must not be crossed during the clearance. Once
// moved away, the same truck can leave; the artificial relocation is fixture
// control, not a game movement.
for(const faction of [0,1]) {
 const {g,t}=await setup(faction,false,true,true);const p=safeRestGoal(g,t,{x:t.x,y:t.y}),dx=p.x-t.x,dy=p.y-t.y,d=Math.hypot(dx,dy);
 const block=g.spawnUnit(faction,'infantry',t.x+dx/d*(t.radius+9+3),t.y+dy/d*(t.radius+9+3));
 block.playerControlled=true;block.input={mx:0,my:0,aim:0,fire:false};
 g._motionDiagnostic=(u,x1,y1,x2,y2)=>{if(u===t)assert.ok(Walls.distPointSegment(block.x,block.y,x1,y1,x2,y2).d>=t.radius+block.radius-1e-7,'no swept overlap');};
 const check=()=>assert.ok(Math.hypot(t.x-block.x,t.y-block.y)>=t.radius+block.radius-1e-7,'no physical overlap');
 for(let i=0;i<20;i++){g.step(.05);check();}
 block.x+=200;block.y+=200;g.occupancyGrid.update(block);
 for(let i=0;i<100&&unsafeRest(g,t.x,t.y,t.radius);i++){g.step(.05);check();}
 assert.equal(unsafeRest(g,t.x,t.y,t.radius),false,'truck clears after blocked area is released');
}
// Unrelated explicit goals and impossible terrain are not overwritten or
// bypassed; a failed placement is throttled rather than teleporting.
for(const faction of [0,1]) {
 const {g,t}=await setup(faction,false,false,true);const command={x:t.x+150,y:t.y+150};t.goal=command;
 g.step(.05);assert.equal(t.goal,command);assert.equal(t._openingVacate,undefined);
 t.goal=null;g.world.isBaseWalkable=()=>false;const xy=[t.x,t.y];g.step(.05);
 assert.deepEqual([t.x,t.y],xy);assert(!t._openingVacate);assert.ok(t._openingRetryAt>g.time+2.9);
}
// Mid-manoeuvre save discards only the ephemeral clearance goal; it will be
// recomputed after loading, instead of becoming a permanent non-task goal.
for(const faction of [0,1]){
 const {cfg,g,t}=await setup(faction,false,true,true);g.step(.05);assert(t._openingVacate);
 assert(Save.saveWar(g));const saved=Save.loadWar(),restored=new Game({cfg,seed:7,aiVsAi:true});assert(Save.applyWar(restored,saved));
 const u=restored.unitById(t.id);assert(u);assert.equal(u.goal,null);assert.equal(u.truckTask,null);
 restored.nearbyEnemies=()=>[];for(let i=0;i<80&&unsafeRest(restored,u.x,u.y,u.radius);i++){restored.time+=.05;restored.dt=.05;restored.logistics.moveTrucks(.05);}
 assert.equal(unsafeRest(restored,u.x,u.y,u.radius),false,'loaded truck clears gate');
}
// Replacing a temporary goal must neither be overwritten nor omitted if the
// user saves before the next logistics tick.
for(const faction of [0,1]) {
 const {cfg,g,t}=await setup(faction,false,false,true);g.step(.05);assert(t._openingVacate);
 const explicit={x:t.x+150,y:t.y+150};t.goal=explicit;
 assert(Save.saveWar(g));const saved=Save.loadWar(),restored=new Game({cfg,seed:7,aiVsAi:true});assert(Save.applyWar(restored,saved));
 assert.deepEqual(restored.unitById(t.id).goal,explicit,'explicit goal saved');
 g.step(.05);assert.equal(t.goal,explicit,'explicit goal is not replaced during clearance');
}
console.log('truck opening: 16 paired cases, real gate and Game.step; modes, occupancy, sides, threat, assignment, save and swept wall checks');
