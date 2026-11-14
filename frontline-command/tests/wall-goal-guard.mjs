import assert from 'node:assert/strict';
import {loadConfig} from '../src/core/config.js';
import {Game} from '../src/sim/game.js';
import {moveAlongFlow} from '../src/sim/units.js';
const cfg=await loadConfig();assert.equal(cfg.flag('wall_goal_guard_v1',false),false);
for(const faction of [0,1])for(const role of ['infantry','tank'])for(const on of [false,true]) {
 cfg.flags.wall_goal_guard_v1=on;
 const g=new Game({cfg,seed:1,aiVsAi:true});g.units.clear();g.unitGrid.clear();
 const b=g.world.buildings.find(b=>b.faction===faction&&b.type==='hq'&&g.walls.state(b));
 const s=g.walls.state(b).outline.segments.find(s=>s.blocksMove&&s.length>=80);
 const [[x1,y1],[x2,y2]]=s.points,mx=b.x+(x1+x2)/2,my=b.y+(y1+y2)/2;
 const u=g.spawnUnit(faction,role,b.x,b.y);u.goal={x:mx,y:my};u.arrived=false;
 assert.equal(g.walls.blocksMove(mx,my,u.radius,u),true);
 let fields=0,fieldGoal=null;const field=g.nav.field.bind(g.nav);g.nav.field=(...a)=>{fields++;fieldGoal=a;return field(...a);};
 moveAlongFlow(g,u,.05);
 if(on){assert.ok(fields>0);assert.ok(u.goal);assert.equal(g.walls.blocksMove(u.goal.x,u.goal.y,u.radius,u),false);
   assert.equal(g.walls.blocksMove(fieldGoal[0],fieldGoal[1],u.radius,u),false);
   assert.ok(Math.hypot(u.goal.x-mx,u.goal.y-my)<=96);
   u.goal={x:b.x,y:b.y};u.arrived=false;moveAlongFlow(g,u,.05);assert.ok(!u.pathFailed);}
 else {assert.ok(fields>0,'legacy tries to plan to wall');assert.ok(u.goal);}
}
{
 cfg.flags.wall_goal_guard_v1=true;const g=new Game({cfg,seed:1,aiVsAi:true});g.units.clear();g.unitGrid.clear();
 const u=g.spawnUnit(0,'infantry',2000,2000);u.goal={x:2100,y:2100};g.walls.blocksMove=()=>true;
 let fields=0,reason;g.nav.field=()=>{fields++;};g.events.on('pathFailed',e=>reason=e.reason);moveAlongFlow(g,u,.05);
 assert.equal(fields,0);assert.equal(u.pathFailed,true);assert.equal(u.goal,null);assert.equal(reason,'goal_blocked_by_wall');
}
console.log('wall goal guard: blocked goal adjusted before field or rejected if no candidate; both factions and infantry/tank');
