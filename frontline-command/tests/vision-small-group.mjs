import assert from 'node:assert/strict';import {loadConfig} from '../src/core/config.js';import {Game} from '../src/sim/game.js';
import {moveAlongFlow} from '../src/sim/units.js';import {chooseVisionNavigation} from '../src/sim/vision_nav_policy.js';
const cfg=await loadConfig();cfg.flags.movement_occupancy_v1=false; // isolate this legacy flag from occupancy
assert.equal(cfg.flag('group_nav_3to5_v1',false),false);
for(const faction of [0,1])for(const count of [3,4,5])for(const enabled of [false,true]){
 cfg.flags.vision_nav_policy_v1=true;cfg.flags.crowd_nav_v2=true;cfg.flags.group_nav_3to5_v1=enabled;
 const g=new Game({cfg,seed:7,aiVsAi:true});g.units.clear();g.unitGrid.clear();g.world.hasLOS=()=>true;
 const b=g.world.buildings.find(b=>b.type==='hq'&&b.faction===faction&&g.walls.state(b));
 const o=g.walls.state(b).outline.openings.find(o=>o.type==='door'),px=b.x+o.cx,py=b.y+o.cy;
 const units=Array.from({length:count},(_,i)=>{const u=g.spawnUnit(faction,'infantry',px+o.nx*(55+i*24),py+o.ny*(55+i*24));u.goal={x:px-o.nx*100,y:py-o.ny*100};return u;});
 assert.equal(chooseVisionNavigation(g,units[0]).mode,'group');moveAlongFlow(g,units[0],.05);
 assert.equal(!!units[0]._crowdActive,enabled,'only enabled small groups get group assignment');
 if(enabled){
  assert.ok(units.every(u=>u._crowdAssigned));
  for(let i=0;i<count;i++)for(let j=i+1;j<count;j++)assert.ok(Math.hypot(units[i]._crowdAssigned.x-units[j]._crowdAssigned.x,units[i]._crowdAssigned.y-units[j]._crowdAssigned.y)>18);
  units[0].perception.hasContact=true;moveAlongFlow(g,units[0],.05);assert.equal(units[0]._crowdActive,false,'contact cancels');
 }
}
console.log('small-group nav: 3-5 infantry, opt-in, distinct destinations and combat cancellation');
