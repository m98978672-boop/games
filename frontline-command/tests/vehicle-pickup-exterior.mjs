import assert from 'node:assert/strict';import {loadConfig} from '../src/core/config.js';import {Game} from '../src/sim/game.js';
const cfg=await loadConfig();assert.equal(cfg.flag('vehicle_pickup_exterior_v1',false),false);
cfg.flags.safe_vehicle_spawn_v1=true;cfg.flags.vehicle_pickup_exterior_v1=true;
for(const faction of [0,1]){
 const g=new Game({cfg,seed:1,aiVsAi:true});g.units.clear();g.unitGrid.clear();g.squads.clear();g.nearbyEnemies=()=>[];
 const hq=g.world.hqOf(faction),u=g.spawnUnit(faction,'truck',hq.x,hq.y);const pt=g.logistics.pickupPoint(u,hq);assert.ok(pt);
 assert.equal(g.walls.blocksMove(pt.x,pt.y,u.radius,u),false);const req={faction,x:pt.x+300,y:pt.y,kind:'sector',sectorId:0};
 u.truckTask={state:'toSource',source:hq,request:req,pickup:pt,pickupVersion:g.world.navVersion};u.goal={...pt};u.x=pt.x+40;u.y=pt.y;
 g.logistics.moveTrucks(0);assert.equal(u.truckTask.state,'toSource','no load while remote');
 u.x=pt.x;u.y=pt.y;g.logistics.moveTrucks(0);assert.equal(u.truckTask.state,'toTarget','load after physical pickup');assert.ok(u.cargo>0);
 const cargo=u.cargo;u.goal=null;u.pathFailed=true;g.logistics.moveTrucks(0);assert.equal(u.truckTask.state,'toTarget','failure is not delivery');assert.equal(u.cargo,cargo);assert.equal(g.logistics.delivered[faction],0);
 g.nearbyEnemies=()=>[{}];g.logistics.moveTrucks(0);assert.equal(u.cargo,cargo);assert.equal(u.truckTask.request,req);assert.ok(Number.isFinite(u.goal.x)&&Number.isFinite(u.goal.y),'finite retreat goal and reserved cargo');
}
console.log('vehicle pickup: opt-in exterior point, loads only on proximity');
