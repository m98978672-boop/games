import assert from 'node:assert/strict';import {loadConfig} from '../src/core/config.js';import {Game} from '../src/sim/game.js';import {moveAlongFlow} from '../src/sim/units.js';import {chooseVisionNavigation} from '../src/sim/vision_nav_policy.js';
const cfg=await loadConfig();assert.equal(cfg.flag('group_nav_pair_v1',false),false);
for(const f of [0,1])for(const on of [false,true]){
 cfg.flags.group_nav_pair_v1=on;cfg.flags.vision_nav_policy_v1=true;cfg.flags.crowd_nav_v2=true;cfg.flags.group_nav_3to5_v1=true;cfg.flags.door_courtesy_v1=true;
 const g=new Game({cfg,seed:1,aiVsAi:true});g.units.clear();g.unitGrid.clear();g.world.hasLOS=()=>true;
 const b=g.world.buildings.find(b=>b.type==='hq'&&b.faction===f&&g.walls.state(b)),o=g.walls.state(b).outline.openings.find(x=>x.type==='door'),px=b.x+o.cx,py=b.y+o.cy;
 const us=[55,79].map(d=>{const u=g.spawnUnit(f,'infantry',px+o.nx*d,py+o.ny*d);u.goal={x:px-o.nx*100,y:py-o.ny*100};return u;});
 const exiting=g.spawnUnit(f,'infantry',px-o.nx*85,py-o.ny*85);exiting.goal={x:px+o.nx*105,y:py+o.ny*105};
 assert.equal(chooseVisionNavigation(g,us[0]).mode,'group');moveAlongFlow(g,us[0],.05);assert.equal(!!us[0]._crowdActive,on);
 if(on){assert.ok(us.every(u=>u._crowdAssigned));assert.ok(Math.hypot(us[0]._crowdAssigned.x-us[1]._crowdAssigned.x,us[0]._crowdAssigned.y-us[1]._crowdAssigned.y)>18);
 us[0].perception.hasContact=true;moveAlongFlow(g,us[0],.05);assert.equal(us[0]._crowdActive,false);}
}
// A quiet pair must not be changed, and opposing traffic must not merge
// two incoming units with different orders.
for(const different of [false,true]){
 cfg.flags.group_nav_pair_v1=true;cfg.flags.vision_nav_policy_v1=true;cfg.flags.crowd_nav_v2=true;cfg.flags.group_nav_3to5_v1=true;cfg.flags.door_courtesy_v1=true;
 const g=new Game({cfg,seed:1,aiVsAi:true});g.units.clear();g.unitGrid.clear();g.world.hasLOS=()=>true;
 const b=g.world.buildings.find(b=>b.type==='hq'&&b.faction===0&&g.walls.state(b)),o=g.walls.state(b).outline.openings.find(x=>x.type==='door'),x=b.x+o.cx,y=b.y+o.cy;
 const us=[55,79].map(d=>{const u=g.spawnUnit(0,'infantry',x+o.nx*d,y+o.ny*d);u.goal={x:x-o.nx*100,y:y-o.ny*100};return u;});
 if(different){us[1].goal={x:us[1].goal.x+40,y:us[1].goal.y};const v=g.spawnUnit(0,'infantry',x-o.nx*85,y-o.ny*85);v.goal={x:x+o.nx*105,y:y+o.ny*105};}
 moveAlongFlow(g,us[0],.05);assert.equal(!!us[0]._crowdPairManaged,false);
}
console.log('group pair: off by default, opposing exit, common goal, separated slots, contact cancellation');
