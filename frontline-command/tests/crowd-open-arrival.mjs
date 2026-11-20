import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {loadConfig} from '../src/core/config.js';
import {Game} from '../src/sim/game.js';
import {moveAlongFlow,updateTimers} from '../src/sim/units.js';
const results=JSON.parse(execFileSync(process.execPath,[new URL('../tools/crowd-u-probe.mjs',import.meta.url).pathname],{encoding:'utf8'})).results;
for(const r of results.filter(x=>x.n<=5))assert.ok(r.arrived===r.n&&!r.failed&&!r.cross&&!r.overlap&&!r.speed,JSON.stringify(r));
const large=results.filter(x=>x.n>=6);
assert.ok(large.every(r=>!r.cross&&!r.overlap&&!r.speed),'large-group movement keeps wall and occupancy guards');
assert.ok(large.reduce((s,r)=>s+r.arrived,0)>=120,'large U-wall columns retain progress');
async function fixture(faction){
 const cfg=await loadConfig(),g=new Game({cfg,seed:7,aiVsAi:true});g.units.clear();g.unitGrid.clear();g.occupancyGrid.clear();g.squads.clear();
 const goal={x:900,y:500};const units=Array.from({length:3},(_,i)=>{const u=g.spawnUnit(faction,'infantry',750-i*24,500);u.goal={...goal};u.arrived=false;u.activity='advance';return u});return {cfg,g,units,goal};
}
for(const f of [0,1]){
 let {cfg,g,units,goal}=await fixture(f);moveAlongFlow(g,units[0],.05);
 assert.ok(units.every(u=>u._crowdOpenGroup&&u._crowdAssigned),'group formed on clear open terrain');
 const assigned=units.map(u=>u._crowdAssigned);for(let i=0;i<units.length;i++)for(let j=i+1;j<units.length;j++)assert.ok(Math.hypot(assigned[i].x-assigned[j].x,assigned[i].y-assigned[j].y)>units[i].radius+units[j].radius);
 units[0].goal={x:goal.x+120,y:goal.y};moveAlongFlow(g,units[0],.05);assert.ok(!units[0]._crowdGroupGoal,'new goal cancels');
 units[1].perception.hasContact=true;moveAlongFlow(g,units[1],.05);assert.ok(!units[1]._crowdGroupGoal,'contact cancels');
 // A member properly at its farther slot must not be marked stuck.
 const u=units[2];u.x=u._crowdAssigned.x;u.y=u._crowdAssigned.y;u._crowdActive=true;u._crowdPoint=u._crowdAssigned;u.arrived=true;u.age=4;u.lastCheck={x:u.x,y:u.y,t:0};u.stuck=1;updateTimers(g,u,.05);assert.ok(!u.pathFailed);assert.equal(u.stuck,0);
 ({cfg,g,units}=await fixture(f));cfg.flags.movement_occupancy_v1=false;moveAlongFlow(g,units[0],.05);assert.ok(units.every(v=>!v._crowdGroupGoal),'occupancy off leaves open-ground behavior unchanged');
 ({cfg,g,units}=await fixture(f));units[1].arrived=true;moveAlongFlow(g,units[0],.05);assert.ok(units.every(v=>!v._crowdGroupGoal),'parked ally is not moved into a new group');
 ({cfg,g,units,goal}=await fixture(f));const base=g.world.isBaseWalkable.bind(g.world);g.world.isBaseWalkable=(x,y)=>Math.hypot(x-goal.x,y-goal.y)>35&&base(x,y);moveAlongFlow(g,units[0],.05);assert.ok(units.every(v=>!v._crowdGroupGoal),'blocked planned slot rejects open group');
 for(const n of [6,8,10,11]){
  ({cfg,g,units,goal}=await fixture(f));for(let i=3;i<n;i++){const v=g.spawnUnit(f,'infantry',750-i*24,500);v.goal={...goal};v.arrived=false;v.activity='advance';units.push(v);}
  moveAlongFlow(g,units[0],.05);
  if(n===11) assert.ok(units.every(v=>!v._crowdGroupGoal),'oversized column is left alone');
  else {
   assert.ok(units.every(v=>v._crowdOpenLarge&&v._crowdAssigned),`${n}-person group formed`);
   for(let i=0;i<n;i++)for(let j=i+1;j<n;j++)assert.ok(Math.hypot(units[i]._crowdAssigned.x-units[j]._crowdAssigned.x,units[i]._crowdAssigned.y-units[j]._crowdAssigned.y)>units[i].radius+units[j].radius);
   units[0].perception.hasContact=true;moveAlongFlow(g,units[0],.05);assert.ok(!units[0]._crowdOpenLarge,'contact cancels large group');
  }
 }
}
console.log('open-group arrival: U movement, off/contact/goal/parked/blocked guards, both factions');
