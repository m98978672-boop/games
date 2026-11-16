import assert from 'node:assert/strict';import {loadConfig} from '../src/core/config.js';import {Game} from '../src/sim/game.js';import {Save} from '../src/core/save.js';
const storage=new Map();globalThis.localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)};
const cfg=await loadConfig();cfg.flags.movement_occupancy_v1=true;cfg.flags.alg_save=true;
const a=new Game({cfg,seed:7,mode:'soldier'}),u=[...a.units.values()].find(u=>!u.player&&!u.isVehicle);
Object.assign(u,{x:511.875,y:607.625});a.occupancyGrid.update(u);assert.ok(Save.saveWar(a));const saved=Save.loadWar();
const b=new Game({cfg,seed:7,mode:'soldier'});assert.ok(Save.applyWar(b,saved));
assert.equal(b.occupancyGrid.cellOf.size,b.units.size,'old pre-load entries removed');
for(const unit of b.units.values()){
 assert.equal(b.occupancyGrid.cellOf.get(unit),b.occupancyGrid.key(unit.x,unit.y));
 assert.ok(b.occupancyGrid.query(unit.x,unit.y,0).includes(unit));
}
assert.deepEqual([b.unitById(u.id).x,b.unitById(u.id).y],[u.x,u.y]);
console.log('movement occupancy: restored positions and live collision index, no stale entries');
