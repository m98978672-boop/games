import assert from 'node:assert/strict';import {loadConfig} from '../src/core/config.js';import {Game} from '../src/sim/game.js';import {reviveUnit} from '../src/sim/units.js';
const cfg=await loadConfig();cfg.flags.movement_occupancy_v1=true;
function noOverlap(g){const us=[...g.units.values()].filter(u=>u.alive&&!u.downed);for(let i=0;i<us.length;i++)for(let j=i+1;j<us.length;j++)assert.ok(Math.hypot(us[i].x-us[j].x,us[i].y-us[j].y)>=us[i].radius+us[j].radius,`${us[i].id} ${us[j].id}`);}
for(let seed=1;seed<=20;seed++)for(const swapSides of [false,true]){
 const g=new Game({cfg,seed,aiVsAi:true,swapSides});assert.equal(g.squads.size,8);assert.equal(g.units.size,52);noOverlap(g);
 for(let i=0;i<20;i++)g.step(.05);noOverlap(g);
 for(const f of [0,1]){
  const sq=[...g.squads.values()].find(s=>s.faction===f);const u=sq.units()[0];u.alive=false;
  const result=g.reinforceSquad(sq);assert.equal(result.ok,true);noOverlap(g);
 }
}
for(let seed=1;seed<=10;seed++){
 const g=new Game({cfg,seed,mode:'soldier'});assert.ok(g.playerUnit?.alive);noOverlap(g);
}
for(const faction of [0,1]){
 const g=new Game({cfg,seed:7,aiVsAi:true});const hq=g.world.hqOf(faction);
 // Whole-squad preflight must be atomic if no valid spot exists.
 const old=g.occupancySpawnSpot;g.occupancySpawnSpot=()=>null;
 const before=[g.units.size,g.squads.size,JSON.stringify(g.logistics.stock[faction])];
 assert.equal(g.createSquadAtBase(faction,'assault').ok,false);
 assert.deepEqual([g.units.size,g.squads.size,JSON.stringify(g.logistics.stock[faction])],before);
 g.occupancySpawnSpot=old;
 // Vehicle production must not charge when no safe position is available.
 for(const v of g.units.values()) if(v.faction===faction && v.role==='truck')v.alive=false;
 const stock=JSON.stringify(g.logistics.stock[faction]),count=g.units.size;
 const factory=g.world.points.find(p=>p.type==='factory');factory.owner=faction;factory.hp=100;
 g.logistics.vehicleProductionSpot=()=>null;g.logistics.maintainTrucks(faction);
 assert.equal(JSON.stringify(g.logistics.stock[faction]),stock);assert.equal(g.units.size,count);
 const spot=g.occupancySpawnSpot(hq,'infantry');const injured=g.spawnUnit(faction,'infantry',spot.x,spot.y);injured.downed=true;
 const blocker=g.spawnUnit(faction,'infantry',spot.x,spot.y);
 assert.equal(reviveUnit(g,injured),false);assert.equal(injured.downed,true);
 blocker.x+=100;g.occupancyGrid.update(blocker);assert.equal(reviveUnit(g,injured),true);assert.equal(injured.downed,false);
 noOverlap(g);
}
console.log('occupancy spawns: 20 seeds, both sides and swaps; initial placements, reinforcements, atomic failure and blocked revive');
