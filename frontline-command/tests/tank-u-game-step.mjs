// Synthetic wall geometry with actual Game.step and delayed tank decisions.
import assert from 'node:assert/strict';import {loadConfig} from '../src/core/config.js';import {Game} from '../src/sim/game.js';import {Nav} from '../src/sim/nav.js';import {Walls} from '../src/sim/walls.js';
async function scene(seed,mirrored,on) {
 const cfg=await loadConfig();cfg.flags.tank_detour_v1=on;cfg.flags.vehicle_detour_v2=false;cfg.flags.movement_occupancy_v1=false;cfg.flags.bot_obstacle_vision_v1=false;
 const g=new Game({cfg,seed,aiVsAi:true});g.units.clear();g.unitGrid.clear();g.squads.clear();
 for(const obj of [g.squadAI,...g.strategic,g.autopilot,g.rules,g.logistics,g.build,g.influence,g.api])obj.update=()=>{};g.checkVictory=()=>{};g.walls.update=()=>{};
 const mirror=x=>mirrored?1280-x:x,segments=[[320,352,672,352],[672,352,672,672],[672,672,320,672]].map(([x1,y1,x2,y2])=>[mirror(x1),y1,mirror(x2),y2]);
 const inside=(x,y)=>x>0&&y>0&&x<1280&&y<1280;const blocked=(x,y,r)=>segments.some(s=>Walls.distPointSegment(x,y,...s).d<=8+r);
 Object.assign(g.world,{W:1280,H:1280,navVersion:1,isWalkable:(x,y)=>inside(x,y)&&!blocked(x,y,0),isBaseWalkable:inside,speedAt:()=>1,terrainAt:()=>0});
 Object.assign(g.walls,{enabled:()=>true,doorWaypoint:()=>null,doorsForUnit:()=>{},blocksMove:blocked,buildingAtPoint:()=>null,refsNear:()=>[]});
 g.nav=new Nav(g.world,cfg);const u=g.spawnUnit(mirrored?1:0,'tank',mirror(512),512);u.goal={x:mirror(900),y:512};u.activity='advance';u.arrived=false;u.thinkTimer=10000;
 g._detourMetrics={fieldDetours:0};
 // Exact swept circle against each wall segment (all segments here are axis aligned).
 function sweptBlocked(x,y,nx,ny,r){
  for(const [a,b,c,d] of segments){
   const cross=(px,py,qx,qy,rx,ry)=>(qx-px)*(ry-py)-(qy-py)*(rx-px);
   const ab1=cross(x,y,nx,ny,a,b),ab2=cross(x,y,nx,ny,c,d),cd1=cross(a,b,c,d,x,y),cd2=cross(a,b,c,d,nx,ny);
   const intersects=ab1*ab2<0 && cd1*cd2<0;
   const distance=Math.min(Walls.distPointSegment(x,y,a,b,c,d).d,Walls.distPointSegment(nx,ny,a,b,c,d).d,
      Walls.distPointSegment(a,b,x,y,nx,ny).d,Walls.distPointSegment(c,d,x,y,nx,ny).d);
   if(intersects||distance<8+r-1e-8)return true;
  }return false;
 }
 let collision=false,maxStep=0,farther=false;const dist0=Math.hypot(u.x-u.goal.x,u.y-u.goal.y);
 for(let i=0;i<600&&!u.arrived&&!u.pathFailed;i++){const x=u.x,y=u.y;g.step(.05);collision||=sweptBlocked(x,y,u.x,u.y,u.radius);maxStep=Math.max(maxStep,Math.hypot(x-u.x,y-u.y));if(u.goal&&Math.hypot(u.x-u.goal.x,u.y-u.goal.y)>dist0+32)farther=true;}
 return {arrived:!!u.arrived,failed:!!u.pathFailed,collision,maxStep,limit:u.speed*.05*1.5,farther,fieldDetours:g._detourMetrics.fieldDetours,time:g.time};
}
for(const seed of [5,11])for(const mirrored of [false,true]){
 const off=await scene(seed,mirrored,false),on=await scene(seed,mirrored,true);
 console.log({seed,mirrored,off,on});
 assert.ok(!off.arrived&&off.failed,'baseline stuck in the test geometry');
 assert.ok(on.arrived&&!on.failed&&!on.collision&&on.farther&&on.fieldDetours>0&&on.maxStep<=on.limit+1e-8,'tank reaches goal safely in this controlled scene');
}
console.log('tank detour: four paired U scenes through Game.step passed');
