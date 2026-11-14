import assert from 'node:assert/strict';import {loadConfig} from '../src/core/config.js';import {Game} from '../src/sim/game.js';
const cfg=await loadConfig();assert.equal(cfg.flag('safe_vehicle_spawn_v1',false),false);cfg.flags.safe_vehicle_spawn_v1=true;
for(const faction of [0,1]){
 const g=new Game({cfg,seed:3,aiVsAi:true});g.units.clear();g.unitGrid.clear();const hq=g.world.hqOf(faction);
 const crowd=g.spawnUnit(faction,'infantry',hq.x,hq.y),spot=g.logistics.vehicleProductionSpot(hq,'truck',hq.x,hq.y);
 assert.ok(spot);assert.equal(g.walls.buildingAtPoint(spot.x,spot.y),null);
 const radius=(cfg.unit('truck').size||44)*.42;assert.ok(Math.hypot(spot.x-crowd.x,spot.y-crowd.y)>=radius+crowd.radius+2);
 assert.equal(g.walls.blocksMove(spot.x,spot.y,radius,{isVehicle:true}),false);
 // No valid terrain: no spawn and no charge, including tank cooldown.
 const oldWalk=g.world.isBaseWalkable;g.world.isBaseWalkable=()=>false;
 assert.equal(g.logistics.vehicleProductionSpot(hq,'truck',hq.x,hq.y),null);
 const before=JSON.stringify(g.logistics.stock[faction]);const count=g.units.size;
 g.world.points.find(p=>p.type==='factory').owner=faction;
 g.logistics.maintainTrucks(faction);assert.equal(g.units.size,count);assert.equal(JSON.stringify(g.logistics.stock[faction]),before);
 g.time=100;g.logistics.autoProduction(faction);assert.equal(g.units.size,count);assert.equal(JSON.stringify(g.logistics.stock[faction]),before);assert.equal(g.logistics.lastTank?.[faction]||0,0);
 g.world.isBaseWalkable=oldWalk;
}
console.log('safe vehicle spawn: opt-in, clear exterior and unit clearance, no charge or cooldown on failure');
