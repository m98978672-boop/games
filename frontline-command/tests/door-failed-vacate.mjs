// A bot whose route fails while it is standing in an open doorway must move
// out of the passage, but that safety move is not success of its old order.
import assert from 'node:assert/strict';import {loadConfig} from '../src/core/config.js';import {Game} from '../src/sim/game.js';import {unsafeRest} from '../src/sim/rest_positions.js';
async function run(type,faction,door,side){
 const cfg=await loadConfig(),g=new Game({cfg,seed:7,aiVsAi:true});g.units.clear();g.unitGrid.clear();g.occupancyGrid.clear();g.squads.clear();
 for(const sys of [g.squadAI,...g.strategic,g.autopilot,g.rules,g.logistics,g.build,g.influence,g.api])sys.update=()=>{};g.checkVictory=()=>{};
 const b=g.world.buildings.find(v=>v.type===type&&v.faction===faction&&g.walls.state(v)),o=g.walls.state(b).outline.openings.filter(x=>x.type==='door')[door];
 const x=b.x+o.cx+side*o.nx*5,y=b.y+o.cy+side*o.ny*5;g.walls.openDoor(b,o.id);
 const u=g.spawnUnit(faction,'infantry',x,y);u.goal={x:b.x+o.cx-side*o.nx*105,y:b.y+o.cy-side*o.ny*105};u.arrived=false;u.thinkTimer=1000;
 assert.ok(unsafeRest(g,u.x,u.y,u.radius));assert.equal(g.walls.blocksMove(u.x,u.y,u.radius,u),false);
 // Force the regular stuck timer's failure, rather than directly assigning the
 // post-failure state. updateSoldier must subsequently vacate the opening.
 u.age=3;u.lastCheck={x:u.x,y:u.y,t:0};u.stuck=1;let neverCleared=true,moved=false,wall=false,speed=false;
 for(let i=0;i<300;i++){
  const p={x:u.x,y:u.y,terrain:g.world.speedAt(u.x,u.y)};g.step(.05);
  const d=Math.hypot(u.x-p.x,u.y-p.y);moved ||= d>0.01;
  if(d>1e-6&&g.walls.blocksMoveSweep(p.x,p.y,u.x,u.y,u.radius,u))wall=true;
  if(d>Math.max(u.speed*p.terrain,30)*.05*1.5+1e-8)speed=true;
  neverCleared &&= !!u.pathFailed;
  if(!unsafeRest(g,u.x,u.y,u.radius)&&u.arrived)break;
 }
 const vacated=!unsafeRest(g,u.x,u.y,u.radius),failed=!!u.pathFailed,safetyGoal=!!u.goal;
 // A second failure while vacating must also remain a failure. Emulate the
 // stuck timer at the opening and allow the ordinary evacuation to restart.
 u.x=x;u.y=y;g.unitGrid.update(u);g.occupancyGrid.update(u);
 u.arrived=false;u.age+=3;u.lastCheck={x,y,t:u.age-3};u.stuck=1;g.step(.05);
 const repeatedFailed=!!u.pathFailed&&u.goal===u._failedRestGoal;
 // A genuinely new goal, not an automatic safety move, must clear the flag.
 u.goal={x:u.x,y:u.y};u.arrived=false;g.step(.05);
 return {type,faction,door,side,neverCleared,vacated,failed,repeatedFailed,safetyGoal,moved,wall,speed,newGoalCleared:!u.pathFailed};
}
const results=[];for(const type of ['hq','city'])for(const f of [0,1])for(const d of [0,1])for(const side of [-1,1])results.push(await run(type,f,d,side));
console.log(JSON.stringify({results},null,2));
if(!process.argv.includes('--report'))for(const r of results){assert.ok(r.neverCleared&&r.failed&&r.repeatedFailed&&r.vacated&&r.moved&&!r.wall&&!r.speed&&r.newGoalCleared,JSON.stringify(r));}
