import assert from 'node:assert/strict';
import {loadConfig} from '../src/core/config.js';import {Game} from '../src/sim/game.js';import {moveUnit,updateTimers} from '../src/sim/units.js';
const cfg=await loadConfig();cfg.flags.movement_occupancy_v1=true;
function setup(on,faction){cfg.flags.movement_queue_wait_v1=on;const g=new Game({cfg,seed:7,aiVsAi:true});g.units.clear();g.unitGrid.clear();g.occupancyGrid.clear();
 g.walls.enabled=()=>false;g.walls.doorWaypoint=()=>null;g.walls.doorsForUnit=()=>{};g.world.isWalkable=(x,y)=>y>=991&&y<=1009;g.world.speedAt=()=>1;
 const a=g.spawnUnit(faction,'infantry',1000,1000),b=g.spawnUnit(faction,'infantry',1020,1000);a.goal={x:1200,y:1000};a.arrived=false;a.speed=55;return {g,a,b};}
function step(g,a,dt=.05){g.time+=dt;g.dt=dt;updateTimers(g,a,dt);if(a.goal)moveUnit(g,a,1,0,dt);}
for(const faction of [0,1]){
 {const {g,a}=setup(false,faction);for(let i=0;i<170;i++)step(g,a);assert.equal(a.pathFailed,true,'old stuck logic cancels a temporary queue');}
 {const {g,a,b}=setup(true,faction);for(let i=0;i<170;i++){step(g,a);assert.ok(Math.hypot(a.x-b.x,a.y-b.y)>=a.radius+b.radius-1e-8);}
  assert.ok(a.goal&&!a.pathFailed,'temporary wait retains the objective');assert.ok(a._occupancyWait);
  b.y=1050;g.occupancyGrid.update(b);for(let i=0;i<35;i++)step(g,a);
  assert.ok(a.x>1020,'moves forward when the occupied area clears');assert.equal(a._occupancyWait,null);
 }
 {const {g,a}=setup(true,faction);for(let i=0;i<330;i++)step(g,a);assert.equal(a.pathFailed,true,'permanent blockage is not hidden forever');}
 {const {g,a,b}=setup(true,faction);for(let i=0;i<100;i++)step(g,a);b.alive=false;for(let i=0;i<20;i++)step(g,a);assert.ok(a.x>1020,'dead blocker releases queue');}
 {const {g,a,b}=setup(true,faction);for(let i=0;i<100;i++)step(g,a);a.goal={x:1000,y:1200};b.y=1050;g.occupancyGrid.update(b);for(let i=0;i<170;i++){g.time+=.05;g.dt=.05;updateTimers(g,a,.05);if(a.goal)moveUnit(g,a,0,1,.05);}
  assert.equal(a.pathFailed,true,'changed goal and wall-only obstruction are not masked');}
}
console.log('queue coordination: temporary wait, release, dead blocker, expiry and changed goal; both factions');
