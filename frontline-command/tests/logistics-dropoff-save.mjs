import assert from 'node:assert/strict';import {loadConfig} from '../src/core/config.js';import {Game} from '../src/sim/game.js';import {Save} from '../src/core/save.js';
const store=new Map();globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)};
const cfg=await loadConfig();cfg.flags.alg_save=true;cfg.flags.safe_logistics_v2=true;cfg.flags.logistics_dropoff_v1=true;
for(const f of [0,1]){
 const options={cfg,seed:31,aiVsAi:true},g=new Game(options),u=g.logistics.trucksOf(f)[0],hq=g.world.hqOf(f);
 g.logistics.requests=[];const req={faction:f,kind:'sector',sectorId:g.world.sectorAt(hq.x,hq.y).id,x:hq.x,y:hq.y,created:0,priority:1};g.logistics.requests.push(req);
 u.x=hq.x+500;u.y=hq.y+300;g.unitGrid.update(u);u.cargo=120;u.cargoType='ammo';u.truckTask={state:'toTarget',source:hq,request:req,amount:120};u.goal=null;g.nearbyEnemies=()=>[];
 g.logistics.trucksOf=fac=>fac===f?[u]:[];g.logistics.moveTrucks(0);assert.ok(u.truckTask.dropoff);assert.equal(g.logistics.delivered[f],0);
 assert.equal(Save.saveWar(g),true);const copy=new Game(options);assert.equal(Save.applyWar(copy,Save.loadWar()),true);
 const restored=copy.unitById(u.id);assert.equal(restored.cargo,120);assert.strictEqual(restored.truckTask.request,copy.logistics.requests[0]);assert.equal(restored.truckTask.dropoff,undefined);
 copy.logistics.trucksOf=fac=>fac===f?[restored]:[];copy.nearbyEnemies=()=>[];copy.logistics.moveTrucks(0);
 assert.ok(restored.truckTask.dropoff,'recomputed exterior point after load');assert.equal(restored.cargo,120);assert.equal(copy.logistics.delivered[f],0);
 const p=restored.truckTask.dropoff;restored.x=p.x;restored.y=p.y;copy.logistics.moveTrucks(0);assert.equal(restored.cargo,0);assert.equal(copy.logistics.delivered[f],1);
}
console.log('logistics dropoff save: request, cargo and exterior point recovery for both factions with alg_save');
