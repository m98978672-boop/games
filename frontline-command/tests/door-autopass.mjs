// Controlled Game.step: closed door, automatically open, cross, and reach an
// exterior/interior destination without starting/ending inside the aperture.
import assert from 'node:assert/strict';import {loadConfig} from '../src/core/config.js';import {Game} from '../src/sim/game.js';
for(const faction of [0,1])for(const type of ['hq','city'])for(const index of [0,1])for(const side of [-1,1]){
 const cfg=await loadConfig(),g=new Game({cfg,seed:7,aiVsAi:true});g.units.clear();g.unitGrid.clear();g.squads.clear();
 g.autopilot.update=()=>{};for(const ai of g.strategic)ai.update=()=>{};g.rules.update=()=>{};g.logistics.update=()=>{};g.checkVictory=()=>{};
 const b=g.world.buildings.find(b=>b.type===type&&b.faction===faction&&g.walls.state(b)),st=g.walls.state(b),o=st.outline.openings.filter(o=>o.type==='door')[index];
 const x=b.x+o.cx,y=b.y+o.cy;assert.equal(g.walls.closeDoor(b,o.id).ok,true);g.walls.flushNav();
 const u=g.spawnUnit(faction,'infantry',x+side*o.nx*85,y+side*o.ny*85);u.goal={x:x-side*o.nx*105,y:y-side*o.ny*105};u.activity='advance';u.arrived=false;u.thinkTimer=10000;
 let opened=false,crossed=false,max=0;
 for(let i=0;i<1200&&!u.arrived&&!u.pathFailed;i++){
  const ox=u.x,oy=u.y;g.step(.05);max=Math.max(max,Math.hypot(u.x-ox,u.y-oy));
  if(st.doors[o.id].state==='open')opened=true;
  if(((u.x-x)*o.nx+(u.y-y)*o.ny)*side<0)crossed=true;
  assert.equal(g.walls.blocksMove(u.x,u.y,u.radius,u),false,'unit is not in a closed door or wall');
 }
 if(!(opened&&crossed&&u.arrived&&!u.pathFailed))console.log({type,faction,index,side,opened,crossed,arrived:u.arrived,failed:u.pathFailed,x:u.x,y:u.y,goal:u.goal,time:g.time});
 assert.ok(opened&&crossed&&u.arrived&&!u.pathFailed,`${type} ${faction} ${index} ${side}: opens, crosses, arrives`);
 assert.ok(max<=u.speed*.05*1.5+1e-6,'no teleport or overspeed');
}
console.log('closed doors: 16 controlled Game.step runs, both factions, two buildings, two doors, both directions');
