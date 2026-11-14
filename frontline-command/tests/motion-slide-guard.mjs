import assert from 'node:assert/strict';import {loadConfig} from '../src/core/config.js';import {Game} from '../src/sim/game.js';import {moveUnit} from '../src/sim/units.js';
const cfg=await loadConfig();assert.equal(cfg.flag('motion_slide_guard_v1',false),false);
for(const axis of ['x','y'])for(const on of [false,true]){
 cfg.flags.motion_slide_guard_v1=on;const g=new Game({cfg,seed:1,aiVsAi:true});g.units.clear();g.unitGrid.clear();
 const u=g.spawnUnit(0,'infantry',200,200);u.goal=axis==='y'?{x:200,y:300}:{x:300,y:200};
 g.world.speedAt=()=>1;g.world.isBaseWalkable=()=>true;g.world.isWalkable=()=>true;
 g.walls.enabled=()=>true;g.walls.doorWaypoint=()=>null;g.walls.doorsForUnit=()=>{};
 // Forward and the original-axis attempt fail; a rotated step is open.
 g.walls.blocksMove=axis==='y'?(x,y)=>y>200.001&&x<=201:(x,y)=>x>200.001&&y<=201;
 moveUnit(g,u,axis==='x'?1:0,axis==='y'?1:0,.05);
 if(on){assert.ok(Math.hypot(u.x-200,u.y-200)>0.01,'rotated step attempted');assert.ok(Math.hypot(u.x-200,u.y-200)<=u.speed*.05+1e-8);}
 else assert.equal(Math.hypot(u.x-200,u.y-200),0,'old zero-axis fallback reproduced');
}
console.log('motion slide: opt-in, zero-axis fallback reproduced and avoided in both directions');
