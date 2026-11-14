import assert from 'node:assert/strict';import {loadConfig} from '../src/core/config.js';import {Game} from '../src/sim/game.js';
const cfg=await loadConfig();assert.equal(cfg.flag('vehicle_spawn_all_v1',false),false);cfg.flags.vehicle_spawn_all_v1=true;cfg.flags.safe_vehicle_spawn_v1=true;
function clear(g,u){assert.equal(g.walls.blocksMove(u.x,u.y,u.radius,u),false);assert.equal(g.walls.buildingAtPoint(u.x,u.y),null);for(const v of g.units.values())if(v!==u&&v.alive&&!v.downed)assert.ok(Math.hypot(u.x-v.x,u.y-v.y)>=u.radius+v.radius,`vehicle ${u.id} overlaps ${v.id}`);}
for(const faction of [0,1]){
 const g=new Game({cfg,seed:1,aiVsAi:true});for(const u of g.units.values())if(u.isVehicle)clear(g,u);
 g.units.clear();g.unitGrid.clear();g.squads.clear();const s=g.createSquadAtBase(faction,'armor');assert.equal(s.ok,true);const tanks=s.squad.units().filter(u=>u.isVehicle);assert.equal(tanks.length,2);for(const u of tanks)clear(g,u);
 const dead=tanks[0];dead.alive=false;g.unitGrid.clear();for(const u of g.units.values())if(u.alive)g.unitGrid.insert(u);
 const reinforced=g.reinforceSquad(s.squad);assert.equal(reinforced.ok,true);for(const u of s.squad.units())if(u.alive&&u.isVehicle)clear(g,u);
 const stock=JSON.stringify(g.logistics.stock[faction]),units=g.units.size,squads=g.squads.size,old=g.world.isBaseWalkable;
 g.world.isBaseWalkable=()=>false;const no=g.createSquadAtBase(faction,'armor');assert.equal(no.ok,false);assert.equal(g.units.size,units);assert.equal(g.squads.size,squads);assert.equal(JSON.stringify(g.logistics.stock[faction]),stock);
 g.world.isBaseWalkable=old;
}
{
 const g=new Game({cfg,seed:2,aiVsAi:true});g.playerFaction=0;const hq=g.world.hqOf(g.playerFaction);
 const u=g.spawnPlayerAt(hq,'tank');assert.ok(u?.isVehicle);clear(g,u);
 const existing=g.playerUnit,old=g.world.isBaseWalkable;g.world.isBaseWalkable=()=>false;
 assert.equal(g.spawnPlayerAt(hq,'tank'),null);assert.equal(g.playerUnit,existing,'failed respawn preserves existing player');
 g.world.isBaseWalkable=old;
 const spawnPos=g.spawnPos;g.spawnPos=()=>({x:existing.x,y:existing.y});
 assert.equal(g.spawnPlayerAt(hq,'sniper'),null,'infantry must not spawn on vehicle');assert.equal(g.playerUnit,existing);
 g.spawnPos=spawnPos;
}
console.log('vehicle spawn: opt-in initial army, atomic armor squad, reinforcement and player, no-cost failure');
