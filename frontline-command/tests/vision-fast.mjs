import assert from 'node:assert/strict';import {loadConfig} from '../src/core/config.js';import {Game} from '../src/sim/game.js';import {chooseVisionNavigation} from '../src/sim/vision_nav_policy.js';
const cfg=await loadConfig();assert.equal(cfg.flag('vision_nav_fast_v1',false),false);
for(const f of [0,1]){
 const g=new Game({cfg,seed:1,aiVsAi:true});g.units.clear();g.unitGrid.clear();let los=0,wallChecks=0;
 g.world={W:1024,H:1024,isBaseWalkable:()=>true,hasLOS:()=>{los++;return true;}};
 g.walls={enabled:()=>true,blocksMove:()=>{wallChecks++;return true;}};
 const u=g.spawnUnit(f,'infantry',200,200);u.goal={x:500,y:200};
 const a=g.spawnUnit(f,'infantry',240,200),b=g.spawnUnit(f,'infantry',260,200);a.goal=b.goal={...u.goal};
 cfg.flags.crowd_nav_v2=true;cfg.flags.vision_nav_fast_v1=false;u._crowdActive=true;u._crowdGroupGoal={...u.goal};
 const slow=chooseVisionNavigation(g,u);assert.equal(slow.mode,'group');assert.equal(slow.obstacle,true);
 cfg.flags.vision_nav_fast_v1=true;wallChecks=0;const fast=chooseVisionNavigation(g,u);
 assert.equal(fast.mode,'group');assert.equal(fast.obstacle,null);assert.equal(wallChecks,0);assert.deepEqual([...fast.visibleIds],[...slow.visibleIds]);
 u._crowdGroupGoal={x:900,y:900};wallChecks=0;assert.equal(chooseVisionNavigation(g,u).obstacle,true);assert.ok(wallChecks>0,'changed goal samples obstacle');
 u.perception.hasContact=true;los=0;wallChecks=0;const combat=chooseVisionNavigation(g,u);assert.equal(combat.mode,'combat');assert.equal(combat.obstacle,null);assert.equal(los,0);assert.equal(wallChecks,0);
 u.perception.hasContact=false;g.units.clear();g.unitGrid.clear();const u2=g.spawnUnit(f,'infantry',200,200);u2.goal={x:500,y:200};
 g.spawnUnit(1-f,'infantry',220,200);los=0;wallChecks=0;const seen=chooseVisionNavigation(g,u2);assert.equal(seen.mode,'combat');assert.equal(seen.obstacle,null);assert.equal(wallChecks,0);
 cfg.flags.vision_nav_fast_v1=false;cfg.flags.crowd_nav_v2=false;
}
console.log('vision fast: off by default, skips only unused sensing, preserves changed-goal sampling');
