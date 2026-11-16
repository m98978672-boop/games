import assert from 'node:assert/strict';
import {loadConfig} from '../src/core/config.js';
import {Game} from '../src/sim/game.js';
const cfg=await loadConfig();let crossings=0;
for(const seed of [5,7,11]){
 const g=new Game({cfg,seed,aiVsAi:true});
 for(let t=0;t<60;t++){
  const prev=new Map([...g.units.values()].filter(u=>u.alive).map(u=>[u,g.unitGrid.key(u.x,u.y)]));
  g.step(.1);
  const alive=[...g.units.values()].filter(u=>u.alive);
  for(const u of alive){
   const actual=g.unitGrid.key(u.x,u.y);
   if(prev.has(u)&&prev.get(u)!==actual)crossings++;
   assert.equal(g.unitGrid.cellOf.get(u),actual,`seed ${seed} tick ${t} unit ${u.id}`);
   assert.ok(g.unitGrid.query(u.x,u.y,0).includes(u));
  }
  assert.equal(g.unitGrid.cellOf.size,alive.length);
  const bucketUnits=[...g.unitGrid.buckets.values()].flat();
  assert.equal(bucketUnits.length,alive.length);
  assert.equal(new Set(bucketUnits).size,alive.length);
  assert.ok(bucketUnits.every(u=>u.alive&&g.units.get(u.id)===u));
 }
 // A dead soldier and a freshly spawned logistics vehicle must not leave
 // missing or duplicate entries at the boundary.
 const casualty=[...g.units.values()].find(u=>u.alive&&!u.playerControlled);
 assert.ok(casualty);casualty.alive=false;
 const truck=g.spawnUnit(0,'truck',g.world.hqOf(0).x,g.world.hqOf(0).y);
 g.step(.1);
 assert.equal(g.unitGrid.cellOf.has(casualty),false);
 assert.equal(g.unitGrid.cellOf.get(truck),g.unitGrid.key(truck.x,truck.y));
 assert.equal([...g.unitGrid.buckets.values()].flat().filter(u=>u===truck).length,1);
}
assert.ok(crossings>0,'exercise actual cell crossings');
console.log(`unit grid: ${crossings} crossings; boundary index agrees with live positions`);
