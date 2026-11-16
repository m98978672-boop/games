import assert from 'node:assert/strict';import {loadConfig} from '../src/core/config.js';import {Game} from '../src/sim/game.js';import {moveAlongFlow,killUnit} from '../src/sim/units.js';
for(const faction of [0,1])for(const enabled of [false,true]){
 const cfg=await loadConfig();assert.equal(cfg.flag('crowd_group_survivor_v1',false),false);
 for(const f of ['crowd_nav_v2','group_nav_3to5_v1','vision_nav_policy_v1','crowd_swept_units_v1'])cfg.flags[f]=true;cfg.flags.crowd_group_survivor_v1=enabled;
 const g=new Game({cfg,seed:7,aiVsAi:true});g.units.clear();g.unitGrid.clear();g.squads.clear();g.world.hasLOS=()=>true;
 const b=g.world.buildings.find(b=>b.type==='hq'&&b.faction===faction&&g.walls.state(b)),o=g.walls.state(b).outline.openings.find(o=>o.type==='door'),x=b.x+o.cx,y=b.y+o.cy;
 const us=Array.from({length:3},(_,i)=>{const u=g.spawnUnit(faction,'infantry',x+o.nx*(55+i*24),y+o.ny*(55+i*24));u.goal={x:x-o.nx*100,y:y-o.ny*100};u.arrived=false;return u;});
 moveAlongFlow(g,us[0],.05);assert.ok(us.every(u=>u._crowdGroupGoal&&u._crowdAssigned),'formed group');
 killUnit(g,us[2]);const slots=us.slice(0,2).map(u=>u._crowdAssigned);
 for(const u of us.slice(0,2))moveAlongFlow(g,u,.05);
 assert.equal(!!us[0]._crowdGroupGoal,enabled);assert.equal(!!us[1]._crowdGroupGoal,enabled);
 if(enabled){
  assert.equal(us[0]._crowdAssigned,slots[0]);assert.equal(us[1]._crowdAssigned,slots[1]);
  us[0].perception.hasContact=true;moveAlongFlow(g,us[0],.05);assert.equal(us[0]._crowdActive,false,'combat cancels');
  us[1].goal={x:us[1].goal.x+100,y:us[1].goal.y};moveAlongFlow(g,us[1],.05);assert.equal(us[1]._crowdActive,false,'new goal cancels');
 }
}
// A fresh unrelated pair must not be converted into a group by this flag.
{
 const cfg=await loadConfig();for(const f of ['crowd_nav_v2','group_nav_3to5_v1','vision_nav_policy_v1','crowd_group_survivor_v1'])cfg.flags[f]=true;
 const g=new Game({cfg,seed:7,aiVsAi:true});g.units.clear();g.unitGrid.clear();g.world.hasLOS=()=>true;
 const b=g.world.buildings.find(b=>b.type==='hq'&&b.faction===0&&g.walls.state(b)),o=g.walls.state(b).outline.openings.find(o=>o.type==='door'),x=b.x+o.cx,y=b.y+o.cy;
 const a=g.spawnUnit(0,'infantry',x+o.nx*55,y+o.ny*55),v=g.spawnUnit(0,'infantry',x+o.nx*79,y+o.ny*79);a.goal=v.goal={x:x-o.nx*100,y:y-o.ny*100};
 moveAlongFlow(g,a,.05);assert.equal(!!a._crowdGroupGoal,false);
}
console.log('group survivor: preserved pre-existing pair reservations, combat/goal cancellation and no new pairs; both factions');
