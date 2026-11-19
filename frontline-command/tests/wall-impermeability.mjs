// Real Game.step, real HQ wall segments, explicit movement at the supported x4 speed.
import assert from 'node:assert/strict';
import {loadConfig} from '../src/core/config.js';
import {Game} from '../src/sim/game.js';
const cfg=await loadConfig();
for (const swapSides of [false,true]) for (const faction of [0,1]) for (const direction of [-1,1]) {
 const g=new Game({cfg,seed:7,aiVsAi:true,swapSides});g.units.clear();g.unitGrid.clear();g.occupancyGrid.clear();g.squads.clear();
 for(const obj of [g.squadAI,...g.strategic,g.autopilot,g.rules,g.logistics,g.build,g.influence,g.api])obj.update=()=>{};
 g.checkVictory=()=>{};
 const b=g.world.buildings.find(b=>b.type==='hq'&&b.faction===faction);
 const seg=g.walls.state(b).outline.segments.find(s=>s.id==='s0');
 const x=b.x+(seg.points[0][0]+seg.points[1][0])/2,y=b.y+seg.points[0][1];
 const u=g.spawnUnit(faction,'infantry',x,y-22*direction);u.playerControlled=true;u.input={mx:0,my:direction,aim:0,fire:false,reload:false,interact:false};
 assert.equal(g.walls.blocksMove(u.x,u.y,u.radius,u),false,'initial position outside wall');
 assert.equal(g.walls.blocksMoveSweep(u.x,u.y,x,y+22*direction,u.radius,u),true,'wall lies between free endpoints');
 const start={x:u.x,y:u.y};g.speed=4;g.step(.1);
 assert.ok((u.y-y)*direction<0,'must remain on the starting side of the solid wall');
 assert.equal(g.walls.blocksMoveSweep(start.x,start.y,u.x,u.y,u.radius,u),false,'movement does not cut the wall');
}
console.log('solid wall: Game.step at x4, both directions, factions and swapped starts');

// Issue an AI squad order from outside a real HQ into it. The solid wall is
// in the direct path; the unit has to go through the actual door opening.
const {Squad}=await import('../src/sim/squads.js');
for(const faction of [0,1]) for(const swapSides of [false,true]) for(const seed of [5,7]) {
 const g=new Game({cfg,seed,aiVsAi:true,swapSides});g.units.clear();g.unitGrid.clear();g.occupancyGrid.clear();g.squads.clear();g.api.orders=[];
 for(const obj of [...g.strategic,g.autopilot,g.rules,g.logistics,g.build,g.influence])obj.update=()=>{};
 g.checkVictory=()=>{};
 const b=g.world.buildings.find(b=>b.type==='hq'&&b.faction===faction),sq=new Squad(g,{faction});g.squads.set(sq.id,sq);
 const u=g.spawnUnit(faction,'infantry',b.x-76,b.y-170);sq.addUnit(u);sq.retreatTier='never';
 const o=g.api.issue({source:'enemyAI',type:'move',faction,squadIds:[sq.id],target:{x:b.x,y:b.y},reason:'door test'});
 let crossedWall=false;
 g._motionDiagnostic=(v,x0,y0,x1,y1,phase)=>{
  if(v===u && phase==='ordinary' && !g.walls.blocksMove(x0,y0,u.radius,u) && g.walls.blocksMoveSweep(x0,y0,x1,y1,u.radius,u))crossedWall=true;
 };
 for(let i=0;i<1200;i++){
  g.step(.05);
  if(Math.abs(u.x-b.x)<110&&Math.abs(u.y-b.y)<110)break;
 }
 assert.equal(o.status,'accepted','AI order delivered through the radio');
 assert.ok(Math.abs(u.x-b.x)<110&&Math.abs(u.y-b.y)<110,'soldier physically enters the building via a passage');
 assert.equal(crossedWall,false,'no ordinary step crosses a solid segment');
}
console.log('AI squad: delivered order and real HQ passage, both factions, swapped sides and two seeds');
