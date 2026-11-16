import assert from 'node:assert/strict';
import {loadConfig} from '../src/core/config.js';
import {Game} from '../src/sim/game.js';
const cfg=await loadConfig();
for(const seed of [1,5,7,11]){
 const normal=new Game({cfg,seed,aiVsAi:true}),swapped=new Game({cfg,seed,aiVsAi:true,swapSides:true});
 const reverse=f=>f===0||f===1?1-f:f;
 assert.equal(normal.world.points.length,swapped.world.points.length);
 for(const p of normal.world.points){
  const q=swapped.world.points.find(v=>v.id===p.id);assert.ok(q);
  assert.equal(q.owner,reverse(p.owner),p.id);assert.equal(q.home,reverse(p.home),`${p.id} home`);
  assert.equal(q.x,p.x);assert.equal(q.y,p.y);
  if(p.structure){assert.ok(q.structure);assert.equal(q.structure.faction,q.owner,`${p.id} structure ownership`);}
 }
 for(const b of normal.world.buildings){
  const q=swapped.world.buildings.find(v=>v.id===b.id);assert.ok(q);
  assert.equal(q.faction,reverse(b.faction),`building ${b.id}`);
  assert.equal(q.x,b.x);assert.equal(q.y,b.y);assert.equal(q.type,b.type);
 }
 for(const s of normal.world.sectors){const q=swapped.world.sectors[s.id];assert.equal(q.owner,reverse(s.owner));}
 for(const f of [0,1]){
  assert.equal(swapped.world.hqOf(f).id,normal.world.hqOf(1-f).id);
  assert.ok([...swapped.units.values()].some(u=>u.faction===f),'both factions spawn');
 }
}
console.log('swap sides: point, home, structures and building faction agree; neutral and geometry unchanged');
