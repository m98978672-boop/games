import assert from 'node:assert/strict';
import {loadConfig} from '../src/core/config.js';
import {Game} from '../src/sim/game.js';
const cfg=await loadConfig();cfg.flags.safe_logistics_v2=true;cfg.flags.logistics_dropoff_v1=true;
for(const faction of [0,1]){
 const g=new Game({cfg,seed:3,aiVsAi:true});g.units.clear();g.unitGrid.clear();g.squads.clear();g.nearbyEnemies=()=>[];
 const hq=g.world.hqOf(faction),city=g.world.points.find(p=>p.type==='city'&&p.owner===faction),spot=g.logistics.vehicleProductionSpot(hq,'truck',hq.x,hq.y);
 const u=g.spawnUnit(faction,'truck',spot.x,spot.y),req={faction,kind:'sector',sectorId:g.world.sectorAt(city.x,city.y).id,x:city.x,y:city.y,created:0,priority:1};
 g.logistics.requests=[req];u.cargo=150;u.cargoType='ammo';u.truckTask={state:'toTarget',request:req,source:hq,amount:150};
 // Simulate the navigation failure contract: updateTimers discards goal and sets pathFailed.
 u.goal=null;u.pathFailed=true;g.logistics.moveTrucks(0);
 const task=u.truckTask,drop=task.dropoff;assert.ok(drop);assert.deepEqual(u.goal,drop);assert.equal(u.pathFailed,false);assert.equal(u.cargo,150);assert.equal(g.logistics.delivered[faction],0);assert.ok(g.logistics.requests.includes(req));
 // An actual route remains reserved while retreating and is reissued afterward.
 g.nearbyEnemies=()=>[{}];g.logistics.moveTrucks(0);assert.equal(u.truckTask,task);assert.equal(u.cargo,150);assert.ok(g.logistics.requests.includes(req));
 g.nearbyEnemies=()=>[];g.logistics.moveTrucks(0);assert.deepEqual(u.goal,drop);assert.equal(u.cargo,150);
 // Destination moves to a second building; cached exterior point must change.
 const next=g.world.points.find(p=>p.type==='depot'&&p.owner===faction);req.x=next.x;req.y=next.y;req.sectorId=g.world.sectorAt(next.x,next.y).id;
 g.logistics.moveTrucks(0);assert.notDeepEqual(task.dropoff,drop);assert.deepEqual(u.goal,task.dropoff);assert.equal(u.cargo,150);assert.equal(g.logistics.delivered[faction],0);
}
console.log('logistics dropoff: failed route reissued; threat preserves reservation; moved destination invalidates cached point');
