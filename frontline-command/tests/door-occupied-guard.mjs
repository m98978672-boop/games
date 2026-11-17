import assert from 'node:assert/strict';
import {loadConfig} from '../src/core/config.js';
import {Game} from '../src/sim/game.js';

for(const faction of [0,1]) for(const kind of ['door','gate']) {
 const cfg=await loadConfig();cfg.flags.door_occupied_guard_v1=true;
 const g=new Game({cfg,seed:7,aiVsAi:true});g.units.clear();g.unitGrid.clear();g.squads.clear();
 const b=g.world.buildings.find(b=>b.faction===faction&&g.walls.state(b)?.outline.openings.some(o=>o.type===kind));
 const st=g.walls.state(b),o=st.outline.openings.find(o=>o.type===kind),cx=b.x+o.cx,cy=b.y+o.cy;
 const u=g.spawnUnit(faction,kind==='gate'?'truck':'infantry',cx,cy);
 // Simulate a unit moving since the tick's spatial index was built.
 u.x=cx+512;u.y=cy+512;g.unitGrid.update(u);u.x=cx;u.y=cy;
 const d=st.doors[o.id];d.state='open';d.closeAt=99;const queue=g.walls.navQueue.size;
 assert.equal(g.walls.blocksMove(u.x,u.y,u.radius,u),false,'open aperture is usable');
 const r=g.walls.closeDoor(b,o.id);assert.equal(r.ok,false);assert.equal(r.reason,'occupied');assert.equal(r.unitId,u.id);
 assert.equal(d.state,'open');assert.equal(d.closeAt,99);assert.equal(g.walls.navQueue.size,queue);
 const event=g.events.log.at(-1);assert.equal(event.name,'doorCloseBlocked');assert.equal(event.payload.unit,u);
 assert.equal(g.walls.toggleDoor(b,o.id).reason,'occupied');
 u.x=cx+o.nx*180;u.y=cy+o.ny*180;
 assert.equal(g.walls.closeDoor(b,o.id).ok,true);assert.equal(d.state,'closed');
 g.walls.openDoor(b,o.id);u.x=cx;u.y=cy;u.alive=false;
 assert.equal(g.walls.closeDoor(b,o.id).ok,true,'dead bodies do not reserve aperture');
}
// Wide gate edge: distance to centre exceeds the old 52px check. An infantry
// circle intersects the door segment; auto-close must defer even with stale grid.
{
 const cfg=await loadConfig();cfg.flags.door_occupied_guard_v1=true;
 const g=new Game({cfg,seed:7,aiVsAi:true});g.units.clear();g.unitGrid.clear();
 const b=g.world.buildings.find(b=>b.type==='factory'&&g.walls.state(b));const st=g.walls.state(b),o=st.outline.openings.find(o=>o.type==='gate');
 const x=b.x+o.p1[0],y=b.y+o.p1[1];const u=g.spawnUnit(0,'infantry',x+o.nx*180,y+o.ny*180);
 // Just beyond the endpoint and outside the conservative building box:
 // the circle still overlaps the segment even though its centre is >52px away.
 const len=Math.hypot(o.p1[0]-o.cx,o.p1[1]-o.cy);
 u.x=x+o.nx*16+(o.p1[0]-o.cx)/len*6;u.y=y+o.ny*16+(o.p1[1]-o.cy)/len*6;u.radius=13;
 assert.ok(Math.hypot(u.x-(b.x+o.cx),u.y-(b.y+o.cy))>52);
 assert.ok(Math.abs(u.x-b.x)>st.outline.size/2+12 || Math.abs(u.y-b.y)>st.outline.size/2+12);
 const d=st.doors[o.id];d.state='open';d.closeAt=1;g.time=2;g.walls.doorTimer=0;g.walls.update(.05);
 assert.equal(d.state,'open');assert.equal(d.closeAt,5);assert.ok(g.events.log.some(e=>e.name==='doorCloseBlocked'&&e.payload.unit===u));
 u.alive=false;g.time=6;g.walls.doorTimer=0;g.walls.update(.05);assert.equal(d.state,'closed');
}
// Controlled C7-like scene: request closure after the walker enters the
// aperture, then verify ordinary stepping continues across it to the goal.
for(const faction of [0,1]) {
 const cfg=await loadConfig();cfg.flags.door_occupied_guard_v1=true;
 const g=new Game({cfg,seed:7,aiVsAi:true});g.units.clear();g.unitGrid.clear();g.squads.clear();
 g.autopilot.update=()=>{};for(const ai of g.strategic)ai.update=()=>{};g.rules.update=()=>{};g.logistics.update=()=>{};g.checkVictory=()=>{};
 const b=g.world.buildings.find(b=>b.type==='city'&&b.faction===faction&&g.walls.state(b));
 const st=g.walls.state(b),o=st.outline.openings.find(o=>o.type==='door'),x=b.x+o.cx,y=b.y+o.cy;
 const u=g.spawnUnit(faction,'infantry',x+o.nx*60,y+o.ny*60);u.goal={x:x-o.nx*105,y:y-o.ny*105};u.activity='advance';u.arrived=false;u.thinkTimer=10000;
 let attempted=false,crossed=false;
 for(let i=0;i<1200&&!u.arrived&&!u.pathFailed;i++) {
  g.step(.05);
  if(!attempted&&g.walls.doorOccupant(b,o,st.outline.thickness||12)===u) {
   attempted=true;assert.equal(g.walls.closeDoor(b,o.id).reason,'occupied');assert.equal(st.doors[o.id].state,'open');
  }
  if((u.x-x)*o.nx+(u.y-y)*o.ny<0)crossed=true;
 }
 assert.ok(attempted&&crossed&&u.arrived&&!u.pathFailed,'closure blocked, unit crosses and arrives');
}
// Legacy behavior remains available when the experimental guard is off.
{
 const cfg=await loadConfig();assert.equal(cfg.flag('door_occupied_guard_v1',false),true);cfg.flags.door_occupied_guard_v1=false;
 const g=new Game({cfg,seed:7,aiVsAi:true});g.units.clear();g.unitGrid.clear();
 const b=g.world.buildings.find(b=>g.walls.state(b)?.outline.openings.some(o=>o.type==='door'));
 const o=g.walls.state(b).outline.openings.find(o=>o.type==='door');g.spawnUnit(0,'infantry',b.x+o.cx,b.y+o.cy);
 assert.equal(g.walls.closeDoor(b,o.id).ok,true);
}
console.log('door occupied guard: manual, toggle, auto, live positions, both factions, infantry/vehicle, dead and legacy passed');
