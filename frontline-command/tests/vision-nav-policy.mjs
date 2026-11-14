import assert from 'node:assert/strict';
import {loadConfig} from '../src/core/config.js';import {Game} from '../src/sim/game.js';
import {chooseVisionNavigation} from '../src/sim/vision_nav_policy.js';
import {courtesyYield} from '../src/sim/door_courtesy.js';
import {moveAlongFlow} from '../src/sim/units.js';
const cfg=await loadConfig();assert.equal(cfg.flag('vision_nav_policy_v1',false),false);
for(const faction of [0,1]){
 const g=new Game({cfg,seed:1,aiVsAi:true});g.units.clear();g.unitGrid.clear();
 const u=g.spawnUnit(faction,'infantry',2000,2000);u.goal={x:2250,y:2000};
 const los=g.world.hasLOS.bind(g.world);g.world.hasLOS=()=>true;
 assert.equal(chooseVisionNavigation(g,u).mode,'solo');
 const a=g.spawnUnit(faction,'infantry',2030,2000);a.goal={...u.goal};
 assert.equal(chooseVisionNavigation(g,u).mode,'pair');
 const c=g.spawnUnit(faction,'infantry',2060,2000);c.goal={...u.goal};
 assert.equal(chooseVisionNavigation(g,u).mode,'group');
 c.downed=true;assert.equal(chooseVisionNavigation(g,u).mode,'pair');c.downed=false;
 const enemy=g.spawnUnit(1-faction,'infantry',2070,2000);assert.equal(chooseVisionNavigation(g,u).mode,'combat');
 g.world.hasLOS=(x,y,x2,y2)=>x2!==enemy.x;assert.equal(chooseVisionNavigation(g,u).mode,'group','hidden enemy is not seen');
 u.perception.hasContact=true;assert.equal(chooseVisionNavigation(g,u).mode,'combat','contact guard');u.perception.hasContact=false;
 enemy.alive=false;g.world.hasLOS=(x,y,x2,y2)=>x2!==c.x;assert.equal(chooseVisionNavigation(g,u).mode,'pair','hidden ally not counted');
 u.playerControlled=true;assert.equal(chooseVisionNavigation(g,u),null);u.playerControlled=false;
 g.world.hasLOS=los;
 // Use a real HQ wall rather than assuming a distance implies visibility.
 const b=g.world.buildings.find(b=>b.type==='hq'&&b.faction===faction&&g.walls.state(b));
 const seg=g.walls.state(b).outline.segments.find(s=>s.blocksVision&&s.length>=80);const [[x1,y1],[x2,y2]]=seg.points;
 const len=Math.hypot(x2-x1,y2-y1),nx=-(y2-y1)/len,ny=(x2-x1)/len,mx=b.x+(x1+x2)/2,my=b.y+(y1+y2)/2;
 g.units.clear();g.unitGrid.clear();const one=g.spawnUnit(faction,'infantry',mx+nx*35,my+ny*35),two=g.spawnUnit(faction,'infantry',mx-nx*35,my-ny*35);
 one.goal={x:one.x+200,y:one.y};two.goal={x:two.x+200,y:two.y};
 assert.equal(g.world.hasLOS(one.x,one.y,two.x,two.y,true),false);assert.equal(chooseVisionNavigation(g,one).mode,'solo','wall hides ally');
 // Selection must stop an owned planner and clear old crowd state when combat starts.
 g.world.hasLOS=()=>true;cfg.flags.vision_nav_policy_v1=true;cfg.flags.bot_obstacle_vision_v1=true;
 one.goal={x:one.x+200,y:one.y};one.perception.hasContact=true;one._crowdActive=true;one._crowdGroupGoal={...one.goal};
 let cancelled=false;g._smartRouteState={active:{unit:one,planner:{cancel(){cancelled=true;}}}};moveAlongFlow(g,one,.05);
 assert.equal(cancelled,true);assert.equal(g._smartRouteState.active,null);assert.equal(one._crowdActive,false);
 cfg.flags.vision_nav_policy_v1=false;cfg.flags.bot_obstacle_vision_v1=false;
 // Vision-filtered door yielding cannot consult an unseen exiting soldier.
 const g2=new Game({cfg,seed:2,aiVsAi:true});g2.units.clear();g2.unitGrid.clear();cfg.flags.door_courtesy_v1=true;
 const b2=g2.world.buildings.find(b=>b.type==='hq'&&b.faction===faction&&g2.walls.state(b)),o=g2.walls.state(b2).outline.openings.find(o=>o.type==='door');
 const px=b2.x+o.cx,py=b2.y+o.cy,out=g2.spawnUnit(faction,'infantry',px-o.nx*85,py-o.ny*85),enter=g2.spawnUnit(faction,'infantry',px+o.nx*85,py+o.ny*85);
 out.goal={x:px+o.nx*105,y:py+o.ny*105};enter.goal={x:px-o.nx*105,y:py-o.ny*105};
 assert.ok(courtesyYield(g2,enter));assert.equal(courtesyYield(g2,enter,new Set()),null);assert.ok(courtesyYield(g2,enter,new Set([out.id])));
 cfg.flags.door_courtesy_v1=false;
}
// Active integration: the selector does not implicitly enable any other feature;
// with their own flags enabled it routes a pair and an eligible aligned group.
for(const faction of [0,1]) {
 const g=new Game({cfg,seed:3,aiVsAi:true});g.units.clear();g.unitGrid.clear();g.world.hasLOS=()=>true;
 cfg.flags.vision_nav_policy_v1=true;
 const b=g.world.buildings.find(b=>b.type==='hq'&&b.faction===faction&&g.walls.state(b)),o=g.walls.state(b).outline.openings.find(o=>o.type==='door');
 const px=b.x+o.cx,py=b.y+o.cy;
 const inside=g.spawnUnit(faction,'infantry',px-o.nx*85,py-o.ny*85),outside=g.spawnUnit(faction,'infantry',px+o.nx*85,py+o.ny*85);
 inside.goal={x:px+o.nx*105,y:py+o.ny*105};outside.goal={x:px-o.nx*105,y:py-o.ny*105};
 moveAlongFlow(g,inside,.05);assert.ok(!inside._doorPass,'selector does not turn on pair lanes');
 cfg.flags.door_pair_lanes_v1=true;moveAlongFlow(g,inside,.05);assert.ok(inside._doorPass,'visible pair selects pair algorithm');
 const third=g.spawnUnit(faction,'infantry',px+o.nx*130,py+o.ny*25);third.goal={...outside.goal};
 assert.equal(chooseVisionNavigation(g,inside).mode,'group');moveAlongFlow(g,inside,.05);
 assert.equal(inside._doorPass,null,'pair state abandoned in group');
 cfg.flags.door_pair_lanes_v1=false;
 g.units.clear();g.unitGrid.clear();const group=[];
 for(let i=0;i<6;i++){const u=g.spawnUnit(faction,'infantry',px+o.nx*(55+i*24),py+o.ny*(55+i*24));u.goal={x:px-o.nx*100,y:py-o.ny*100};group.push(u);}
 assert.equal(chooseVisionNavigation(g,group[0]).mode,'group');
 moveAlongFlow(g,group[0],.05);assert.ok(!group[0]._crowdActive,'selector does not turn on crowd feature');
 cfg.flags.crowd_nav_v2=true;moveAlongFlow(g,group[0],.05);assert.ok(group[0]._crowdActive,'eligible group uses group algorithm');
 cfg.flags.crowd_nav_v2=false;cfg.flags.vision_nav_policy_v1=false;
}
{
 // A visible obstacle starts the already-licensed route search for a solo bot;
 // a nearby group without an applicable crowd route keeps the obstacle route;
 // combat cancels that bot's active search.
 const g=new Game({cfg,seed:5,aiVsAi:true});g.units.clear();g.unitGrid.clear();
 g.world={W:1024,H:1024,navVersion:1,isBaseWalkable:(x,y)=>x>0&&y>0&&x<1024&&y<1024,
   isWalkable:(x,y)=>x>0&&y>0&&x<1024&&y<1024,speedAt:()=>1,hasLOS:()=>true};
 g.walls={enabled:()=>true,navQueue:new Set(),blocksMove:(x,y,r)=>x+r>=220&&x-r<=225,
   buildingAtPoint:()=>null,doorWaypoint:()=>null,doorsForUnit:()=>{}};g.nav={field:()=>null};
 const u=g.spawnUnit(0,'infantry',180,200);u.goal={x:600,y:200};u.stuck=0;g.time=1;
 cfg.flags.vision_nav_policy_v1=true;cfg.flags.bot_obstacle_vision_v1=true;
 assert.equal(chooseVisionNavigation(g,u).obstacle,true);moveAlongFlow(g,u,.05);
 const job=g._smartRouteState?.active;assert.ok(job);assert.ok(job.planner.operations>0);
 const a=g.spawnUnit(0,'infantry',180,260),b=g.spawnUnit(0,'infantry',180,300);a.goal=b.goal={x:600,y:200};
 g.time+=.05;assert.equal(chooseVisionNavigation(g,u).mode,'group');moveAlongFlow(g,u,.05);
 assert.equal(g._smartRouteState.active,job,'group without a crowd route retains obstacle search');
 u.perception.hasContact=true;g.time+=.05;moveAlongFlow(g,u,.05);
 assert.equal(job.planner.status,'cancelled');assert.equal(g._smartRouteState.active,null);
 cfg.flags.vision_nav_policy_v1=false;cfg.flags.bot_obstacle_vision_v1=false;
}
console.log('vision nav policy: solo/pair/group, LOS, obstacle, contact, cancellation, opt-in dispatch and visible-only courtesy for both factions');
