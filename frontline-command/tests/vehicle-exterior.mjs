import assert from 'node:assert/strict';
import {loadConfig} from '../src/core/config.js';
import {Game} from '../src/sim/game.js';
const cfg=await loadConfig();assert(cfg.flag('vehicle_exterior_v1',true));
for(const faction of [0,1]){
 const g=new Game({cfg,seed:3,aiVsAi:true});
 for(const u of g.units.values())if(u.isVehicle){
   assert.equal(g.walls.buildingAtPoint(u.x,u.y),null,'initial vehicle outside walled building');
   assert.equal(g.walls.blocksMove(u.x,u.y,u.radius,u),false);
 }
 g.units.clear();g.unitGrid.clear();g.squads.clear();g.nearbyEnemies=()=>[];
 const hq=g.world.hqOf(faction),place=g.logistics.vehicleProductionSpot(hq,'truck',hq.x,hq.y);
 const a=g.spawnUnit(faction,'truck',place.x,place.y),b=g.spawnUnit(faction,'truck',place.x+90,place.y);
 const city=g.world.points.find(p=>p.type==='city'&&p.owner===faction);
 const req={faction,kind:'sector',sectorId:g.world.sectorAt(city.x,city.y).id,x:city.x,y:city.y,created:0,priority:1};
 g.logistics.requests=[req,req];g.time=1;g.logistics.moveTrucks(0);
 const active=[a,b].filter(t=>t.truckTask?.request===req);assert.equal(active.length,1,'request reserved once');
 const t=active[0],task=t.truckTask;assert(task.pickup && !g.walls.buildingAtPoint(task.pickup.x,task.pickup.y));
 t.x=task.pickup.x;t.y=task.pickup.y;g.logistics.moveTrucks(0);assert.equal(task.state,'toTarget');assert(t.cargo>0);
 g.logistics.moveTrucks(0);assert(task.dropoff && !g.walls.buildingAtPoint(task.dropoff.x,task.dropoff.y));
 // A moving destination may leave a building; cached dropoff must be forgotten.
 const previous={x:req.x,y:req.y};req.x=t.x+350;req.y=t.y+300;
 assert(!g.walls.buildingAtPoint(req.x,req.y));g.logistics.moveTrucks(0);
 assert.equal(task.dropoff,null);assert.deepEqual(t.goal,{x:req.x,y:req.y});
 Object.assign(req,previous);g.logistics.moveTrucks(0);assert(task.dropoff);
 const cargo=t.cargo;t.goal=null;t.pathFailed=true;g.time=10;g.logistics.moveTrucks(0);
 assert.equal(g.logistics.delivered[faction],0,'failed route is not a delivery');assert.equal(t.cargo,cargo);
 assert.equal(t.goal,null,'delayed retry');g.time=14;g.logistics.moveTrucks(0);assert.deepEqual(t.goal,task.dropoff);
 g.nearbyEnemies=()=>[{}];g.logistics.moveTrucks(0);assert.equal(t.truckTask,task);assert.equal(t.cargo,cargo);
 assert(t.goal && Number.isFinite(t.goal.x) && !g.walls.buildingAtPoint(t.goal.x,t.goal.y));
 g.nearbyEnemies=()=>[];g.logistics.moveTrucks(0);assert.deepEqual(t.goal,task.dropoff);
 t.x=task.dropoff.x;t.y=task.dropoff.y;g.logistics.moveTrucks(0);
 assert.equal(g.logistics.delivered[faction],1);assert.equal(t.cargo,0);assert.equal(t.cargoType,null);
 assert.equal(t.truckTask.state,'idleTruck');
 // An idle truck must retreat using real point coordinates too; it should not
 // discard cargo or run a NaN goal through the navigation field.
 g.logistics.requests=[];g.nearbyEnemies=()=>[{}];
 g.logistics.moveTrucks(0);
 assert(t.truckTask && t.truckTask.state==='idleTruck');
 assert(t.goal && Number.isFinite(t.goal.x) && Number.isFinite(t.goal.y));
 assert(!g.walls.buildingAtPoint(t.goal.x,t.goal.y));
 g.nearbyEnemies=()=>[];g.logistics.moveTrucks(0);
 assert.equal(t.goal,null);
 const next={...req,created:g.time};g.logistics.requests=[next];
 // Move the other vehicle away from selection to assert this particular truck is reusable.
 b.alive=false;g.logistics.moveTrucks(0);assert.equal(t.truckTask.request,next,'idleTruck is eligible for next assignment');
}
console.log('vehicle exterior: default spawns, exclusive request, pickup, dropoff, retry, retreat, reuse; both factions');
