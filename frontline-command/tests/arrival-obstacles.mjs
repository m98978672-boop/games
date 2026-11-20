import assert from 'node:assert/strict';
import {loadConfig} from '../src/core/config.js';
import {Game} from '../src/sim/game.js';
import {clearFinalApproach} from '../src/sim/arrival.js';
import {unsafeRest,safeRestGoal} from '../src/sim/rest_positions.js';
import {moveAlongFlow} from '../src/sim/units.js';

for(const faction of [0,1]){
  const cfg=await loadConfig(),g=new Game({cfg,seed:7,aiVsAi:true});g.units.clear();g.unitGrid.clear();
  const b=g.world.buildings.find(b=>b.faction===faction&&b.type==='hq'&&g.walls.state(b));
  const seg=g.walls.state(b).outline.segments.find(s=>s.length>=80&&s.blocksMove);
  const [[ax,ay],[bx,by]]=seg.points,len=Math.hypot(bx-ax,by-ay),nx=-(by-ay)/len,ny=(bx-ax)/len;
  const mx=b.x+(ax+bx)/2,my=b.y+(ay+by)/2;
  const u=g.spawnUnit(faction,'infantry',mx-nx*15,my-ny*15);u.radius=5;
  u.goal={x:mx+nx*15,y:my+ny*15};u.arrived=false;
  assert.equal(clearFinalApproach(g,u,u.goal.x,u.goal.y),false);
  moveAlongFlow(g,u,.05);assert.equal(u.arrived,false,'a destination 30px away behind a wall is not arrival');
  // A destination that is legal but too close to the wall must remain on its
  // original side when corrected for resting safety, not snap to the mover.
  u.radius=9;u.x=mx-nx*60;u.y=my-ny*60;
  const goal={x:mx+nx*19,y:my+ny*19};
  assert.equal(g.walls.blocksMove(goal.x,goal.y,u.radius,u),false);assert.equal(unsafeRest(g,goal.x,goal.y,u.radius),true);
  const safe=safeRestGoal(g,u,goal);assert.ok(safe);assert.equal(g.walls.buildingAtPoint(safe.x,safe.y),g.walls.buildingAtPoint(goal.x,goal.y));
  assert.equal(unsafeRest(g,safe.x,safe.y,u.radius),false);
  // A clear, reachable destination still permits normal arrival.
  u.x=safe.x;u.y=safe.y;assert.equal(clearFinalApproach(g,u,safe.x,safe.y),true);
}
{
  const cfg=await loadConfig(),g=new Game({cfg,seed:3,aiVsAi:true});
  const u={x:100,y:100,radius:5,isVehicle:false};
  g.world.isBaseWalkable=(x,y)=>!(x>110&&x<120);g.walls.blocksMoveSweep=()=>false;
  assert.equal(clearFinalApproach(g,u,130,100),false,'terrain blocks final approach');
  assert.equal(clearFinalApproach(g,u,104,100),true,'open terrain is allowed');
}
console.log('arrival: wall, terrain and safe destination side, both factions');
