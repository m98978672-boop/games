// Real CommandAPI, squad/soldier decisions and Game.step; synthetic U walls.
import assert from 'node:assert/strict';
import {loadConfig} from '../src/core/config.js';
import {Game} from '../src/sim/game.js';
import {Squad} from '../src/sim/squads.js';
import {Nav} from '../src/sim/nav.js';
import {Walls} from '../src/sim/walls.js';
async function run(faction,seed,enabled) {
 const cfg=await loadConfig();cfg.flags.bot_obstacle_vision_v1=enabled;
 const g=new Game({cfg,seed,aiVsAi:true});g.units.clear();g.unitGrid.clear();g.occupancyGrid.clear();g.squads.clear();g.api.orders=[];
 for(const obj of [...g.strategic,g.autopilot,g.rules,g.logistics,g.build,g.influence])obj.update=()=>{};
 g.checkVictory=()=>{};g.walls.update=()=>{};
 const mirror=x=>faction?1536-x:x,segments=[[640,640,896,640],[896,640,896,896],[896,896,640,896]].map(([x,y,x2,y2])=>[mirror(x),y,mirror(x2),y2]);
 const inside=(x,y)=>x>0&&y>0&&x<1536&&y<1536,blocked=(x,y,r)=>segments.some(s=>Walls.distPointSegment(x,y,...s).d<=8+r);
 Object.assign(g.world,{W:1536,H:1536,navVersion:1,isWalkable:(x,y)=>inside(x,y)&&!blocked(x,y,0),isBaseWalkable:inside,speedAt:()=>1,terrainAt:()=>0});
 Object.assign(g.walls,{enabled:()=>true,doorWaypoint:()=>null,doorsForUnit:()=>{},blocksMove:blocked,buildingAtPoint:()=>null,refsNear:()=>[],refsInBox:()=>[],blocksMoveSweep:undefined});
 g.nav=new Nav(g.world,cfg);
 const sq=new Squad(g,{faction});g.squads.set(sq.id,sq);const u=g.spawnUnit(faction,'infantry',mirror(768),768);sq.addUnit(u);sq.retreatTier='never';sq.strategyId='rush';
 const target={x:mirror(1126),y:768};const order=g.api.issue({source:'enemyAI',type:'move',faction,squadIds:[sq.id],target});
 let maxStep=0,wallCross=false,away=false;const initial=Math.hypot(u.x-target.x,u.y-target.y);
 for(let i=0;i<1600;i++){
  const x=u.x,y=u.y;g.step(.05);const d=Math.hypot(u.x-x,u.y-y);maxStep=Math.max(maxStep,d);
  for(let k=0;k<=Math.ceil(d);k++){const t=k/Math.max(1,Math.ceil(d));if(blocked(x+(u.x-x)*t,y+(u.y-y)*t,u.radius))wallCross=true;}
  if(Math.hypot(u.x-target.x,u.y-target.y)>initial+32)away=true;
  if(Math.hypot(u.x-target.x,u.y-target.y)<90)break;
 }
 return {accepted:order.status==='accepted',near:Math.hypot(u.x-target.x,u.y-target.y)<90,wallCross,maxStep,limit:u.speed*.05*1.5,away,seconds:g.time};
}
const cfg=await loadConfig();assert(cfg.flag('bot_obstacle_vision_v1'),'obstacle routing is active in normal play');
for(const faction of [0,1])for(const seed of [5,7]) {
 const off=await run(faction,seed,false),on=await run(faction,seed,true);
 console.log({faction,seed,off,on});
 assert(off.accepted&&!off.near,'baseline was stuck despite the accepted order');
 assert(on.accepted&&on.near&&!on.wallCross&&on.maxStep<=on.limit+1e-8&&on.away,'AI follows radio order safely around a U-shaped barrier');
}
console.log('squad obstacle routing: both factions, mirrored geometry and two seeds, sampled swept-wall safety');
