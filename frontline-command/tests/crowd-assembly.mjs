// Actual squad thinking and HQ geometry: do not stop a group across a wall.
import assert from 'node:assert/strict';
import {loadConfig} from '../src/core/config.js';
import {Game} from '../src/sim/game.js';
import {Squad} from '../src/sim/squads.js';
import {clearFinalApproach,squadNearObjective} from '../src/sim/arrival.js';
import {Save} from '../src/core/save.js';
const storage=new Map();globalThis.localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)};
for(const faction of [0,1])for(const kind of ['move','hold']){
 const cfg=await loadConfig(),g=new Game({cfg,seed:7,aiVsAi:true});g.units.clear();g.unitGrid.clear();g.occupancyGrid.clear();g.squads.clear();
 const b=g.world.buildings.find(b=>b.type==='hq'&&b.faction===faction&&g.walls.state(b)),seg=g.walls.state(b).outline.segments.find(s=>s.length>=80&&s.blocksMove);
 const [[ax,ay],[bx,by]]=seg.points,len=Math.hypot(bx-ax,by-ay),nx=-(by-ay)/len,ny=(bx-ax)/len,tx=(bx-ax)/len,ty=(by-ay)/len,mx=b.x+(ax+bx)/2,my=b.y+(ay+by)/2;
 const sign=g.walls.buildingAtPoint(mx+nx*35,my+ny*35)===b?1:-1,goal={x:mx+sign*nx*35,y:my+sign*ny*35};
 assert.equal(g.walls.buildingAtPoint(goal.x,goal.y),b,'real interior');
 const sq=new Squad(g,{faction});g.squads.set(sq.id,sq);sq.retreatTier='never';sq.strategyId='rush';
 const a=g.spawnUnit(faction,'infantry',goal.x,goal.y),c=g.spawnUnit(faction,'infantry',goal.x+tx*22,goal.y+ty*22),late=g.spawnUnit(faction,'infantry',mx-sign*nx*30,my-sign*ny*30);
 for(const u of [a,c,late])sq.addUnit(u);sq.objective={...goal,type:kind};sq.state='advance';
 assert.ok(squadNearObjective(g,sq,sq.objective,90));assert.equal(clearFinalApproach(g,late,goal.x,goal.y),false);
 g.squadAI.think(sq);assert.equal(sq.state,'advance','do not park while a member is on the wrong wall side');assert.ok(sq._assemblyWait);
 for(const saveV2 of [false,true]) {
  cfg.flags.alg_save=saveV2;assert.equal(Save.saveWar(g),true);const saved=Save.loadWar(),restored=new Game({cfg,seed:7,aiVsAi:true});
  assert.equal(Save.applyWar(restored,saved),true);const loaded=restored.squads.get(sq.id);assert.ok(loaded);assert.equal(loaded.state,'advance');
  restored.squadAI.think(loaded);assert.equal(loaded.state,'advance','rebuild transient assembly wait after load');assert.ok(loaded._assemblyWait);
 }
 // A fresh order must have a fresh bounded wait even with the same target.
 const first=sq._assemblyWait;g.time=7;sq.objective={...goal,type:kind};g.squadAI.think(sq);assert.notEqual(sq._assemblyWait,first);assert.equal(sq._assemblyWait.since,7);
 // Don't leave an impossible order waiting indefinitely.
 g.time=27.1;g.squadAI.think(sq);assert.equal(sq.state,'hold','bounded wait eventually permits the original decision');
 // Combat takes precedence over waiting for the remaining member.
 sq.state='advance';sq._assemblyWait=null;late.perception.hasContact=true;g.time=30;g.squadAI.think(sq);assert.equal(sq.state,'hold','contact cancels assembly wait');
 // When navigation is disabled the old arrival rule stays unchanged.
 sq.state='advance';late.perception.hasContact=false;cfg.flags.pathing_v2=false;g.squadAI.think(sq);assert.equal(sq.state,'hold','pathing off retains prior arrival behavior');cfg.flags.pathing_v2=true;
 // A laggard reaching the target side permits holding without waiting for the timeout.
 sq.state='advance';sq._assemblyWait=null;late.x=goal.x-tx*22;late.y=goal.y-ty*22;g.unitGrid.update(late);g.occupancyGrid.update(late);
 assert.equal(clearFinalApproach(g,late,goal.x,goal.y),true);g.squadAI.think(sq);assert.equal(sq.state,'hold','complete group can hold immediately');
}
console.log('squad assembly: real HQ wall, move/hold, new order, timeout and contact, both factions');
