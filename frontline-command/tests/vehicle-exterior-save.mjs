import assert from 'node:assert/strict';
import {loadConfig} from '../src/core/config.js';
import {Game} from '../src/sim/game.js';
import {Save} from '../src/core/save.js';
const store=new Map();globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)};
for(const faction of [0,1]) {
 const cfg=await loadConfig();cfg.flags.alg_save=true;cfg.flags.safe_logistics_v2=false;
 const options={cfg,seed:31,aiVsAi:true},g=new Game(options),u=g.logistics.trucksOf(faction)[0],hq=g.world.hqOf(faction);
 const city=g.world.points.find(p=>p.owner===faction && p.type==='city');
 const req={faction,kind:'sector',sectorId:g.world.sectorAt(city.x,city.y).id,x:city.x,y:city.y,created:0,priority:1};
 g.logistics.requests=[req];u.cargo=120;u.cargoType='ammo';u.truckTask={state:'toTarget',source:hq,request:req,amount:120};u.goal=null;
 g.nearbyEnemies=()=>[];g.logistics.trucksOf=fac=>fac===faction?[u]:[];g.logistics.moveTrucks(0);
 assert(u.truckTask.dropoff && !g.walls.buildingAtPoint(u.truckTask.dropoff.x,u.truckTask.dropoff.y));
 assert(Save.saveWar(g));const copy=new Game(options);assert(Save.applyWar(copy,Save.loadWar()));
 const restored=copy.unitById(u.id);assert.equal(restored.cargo,120);assert.strictEqual(restored.truckTask.request,copy.logistics.requests[0]);
 copy.logistics.trucksOf=fac=>fac===faction?[restored]:[];copy.nearbyEnemies=()=>[];copy.logistics.moveTrucks(0);
 assert(restored.truckTask.dropoff && !copy.walls.buildingAtPoint(restored.goal.x,restored.goal.y));
 assert.equal(copy.logistics.delivered[faction],0);assert.equal(restored.cargo,120);
 const p=restored.truckTask.dropoff;restored.x=p.x;restored.y=p.y;copy.logistics.moveTrucks(0);
 assert.equal(copy.logistics.delivered[faction],1);assert.equal(restored.cargo,0);
}
console.log('vehicle exterior save: recovered cargo, reservation, and physical delivery; both factions');
