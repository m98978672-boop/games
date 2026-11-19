// Research-only timed fallback replay. Kept separate so older data collection
// stays byte-for-byte reproducible. Equivalence without fallback is tested.
import {loadConfig} from '../../src/core/config.js';
import {Game} from '../../src/sim/game.js';
import {Squad} from '../../src/sim/squads.js';
import {Nav} from '../../src/sim/nav.js';
import {Walls} from '../../src/sim/walls.js';
import {observation} from './collect-obstacle-game.mjs';

export async function simulateFallback(spec,choice=null,{fallbackAfter=null}={}){
 if(choice!==null&&!['U','D'].includes(choice))throw Error('invalid candidate');
 if(fallbackAfter!==null&&(!Number.isFinite(fallbackAfter)||fallbackAfter<=0))throw Error('invalid fallback timeout');
 const cfg=await loadConfig(); const obs=observation(spec), {faction,seed}=spec;
 const g=new Game({cfg,seed,aiVsAi:true});g.units.clear();g.unitGrid.clear();g.occupancyGrid.clear();g.squads.clear();g.api.orders=[];
 for(const obj of [...g.strategic,g.autopilot,g.rules,g.logistics,g.build,g.influence])obj.update=()=>{};
 g.checkVictory=()=>{};g.walls.update=()=>{};
 const inside=(x,y)=>x>0&&y>0&&x<1536&&y<1536;
 const blocked=(x,y,r)=>obs.walls.some(s=>Walls.distPointSegment(x,y,...s).d<=8+r);
 Object.assign(g.world,{W:1536,H:1536,navVersion:1,isWalkable:(x,y)=>inside(x,y)&&!blocked(x,y,0),isBaseWalkable:inside,speedAt:()=>1,terrainAt:()=>0});
 Object.assign(g.walls,{enabled:()=>true,doorWaypoint:()=>null,doorsForUnit:()=>{},blocksMove:blocked,buildingAtPoint:()=>null,refsNear:()=>[],refsInBox:()=>[],blocksMoveSweep:undefined});
 g.nav=new Nav(g.world,cfg);
 const sq=new Squad(g,{faction});g.squads.set(sq.id,sq);
 const u=g.spawnUnit(faction,'infantry',...obs.start);sq.addUnit(u);sq.retreatTier='never';sq.strategyId='rush';
 const goal={x:obs.goal[0],y:obs.goal[1]};
 const issue=target=>g.api.issue({source:'enemyAI',type:'move',faction,squadIds:[sq.id],target});
 let order=issue(choice?{x:obs.waypoints[choice][0],y:obs.waypoints[choice][1]}:goal);
 let switched=!choice, fallback=false, first=null,wallCross=false,maxStep=0,accepted=0;
 const sideX=obs.walls[1][0],top=obs.walls[0][1],bottom=obs.walls[2][1],dir=faction?-1:1;
 for(let i=0;i<1600;i++){
  const x=u.x,y=u.y;g.step(.05);const d=Math.hypot(u.x-x,u.y-y);maxStep=Math.max(maxStep,d);
  for(let k=0;k<=Math.ceil(d);k++){const t=k/Math.max(1,Math.ceil(d));if(blocked(x+(u.x-x)*t,y+(u.y-y)*t,u.radius))wallCross=true;}
  if(!first&&(u.x-sideX)*dir>u.radius+8){if(u.y<top-u.radius-8)first='U';else if(u.y>bottom+u.radius+8)first='D';}
  if(!switched&&Math.hypot(u.x-obs.waypoints[choice][0],u.y-obs.waypoints[choice][1])<35){
   if(order.status==='accepted')accepted++;order=issue(goal);switched=true;
  }
  // Research harness only: bound the time spent on a candidate, then return
  // to the ordinary goal. This is not wired into the live game.
  if(!switched&&fallbackAfter!==null&&g.time>=fallbackAfter){
   if(order.status==='accepted')accepted++;order=issue(goal);switched=true;fallback=true;
  }
  if(Math.hypot(u.x-goal.x,u.y-goal.y)<90)break;
 }
 if(order.status==='accepted')accepted++;
 return {obs,choice,first,near:Math.hypot(u.x-goal.x,u.y-goal.y)<90,wallCross,maxStep,limit:u.speed*.05*1.5,seconds:g.time,switched,accepted,fallback};
}
