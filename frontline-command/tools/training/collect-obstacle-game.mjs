// Collect small research-only demonstrations from real Game.step/CommandAPI.
// Geometry is synthetic: this is NOT gameplay from a normal procedural map.
import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { loadConfig } from '../../src/core/config.js';
import { Game } from '../../src/sim/game.js';
import { Squad } from '../../src/sim/squads.js';
import { Nav } from '../../src/sim/nav.js';
import { Walls } from '../../src/sim/walls.js';

// Seed groups and widths/heights are disjoint. Side parity is balanced in each.
export function layouts(split){
 const specs=split==='train' ? {seeds:[11,13,17,19], sizes:[[192,192],[224,224],[256,256],[288,192]], offsets:[-48,0,48]} :
  split==='eval' ? {seeds:[31,37],sizes:[[208,208],[272,224]], offsets:[-32,32]} : null;
 if(!specs) throw Error('unknown split');
 const result=[];
 for(const [width,height] of specs.sizes)for(const offset of specs.offsets)for(const faction of [0,1])for(const closed of ['U','D']){
  const seed=specs.seeds[result.length%specs.seeds.length];
  result.push({id:`${split}-${seed}-${width}-${height}-${offset}-${faction}-${closed}`,split,seed,width,height,offset,faction,closed});
 }
 return result;
}

export function observation(spec){
 const {width,height,offset,faction,closed}=spec;
 if(!['U','D'].includes(closed))throw Error('closed side must be U or D');
 const mirror=x=>faction?1536-x:x;
 const left=768-width/2, right=768+width/2, top=768-height/2, bottom=768+height/2;
 const upper={x:mirror(right+64),y:top-64},lower={x:mirror(right+64),y:bottom+64};
 const barrierY=closed==='U'?top-40:bottom+40;
 const segments=[[left,top,right,top],[right,top,right,bottom],[right,bottom,left,bottom],[0,barrierY,1536,barrierY]].map(([a,b,c,d])=>[mirror(a),b,mirror(c),d]);
 return {start:[mirror(768),768+offset],goal:[mirror(1130),768+offset],walls:segments,waypoints:{U:[upper.x,upper.y],D:[lower.x,lower.y]}};
}

export async function simulate(spec,choice=null){
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
 let switched=!choice, first=null,wallCross=false,maxStep=0,accepted=0;
 const sideX=obs.walls[1][0],top=obs.walls[0][1],bottom=obs.walls[2][1],dir=faction?-1:1;
 for(let i=0;i<1600;i++){
  const x=u.x,y=u.y;g.step(.05);const d=Math.hypot(u.x-x,u.y-y);maxStep=Math.max(maxStep,d);
  for(let k=0;k<=Math.ceil(d);k++){const t=k/Math.max(1,Math.ceil(d));if(blocked(x+(u.x-x)*t,y+(u.y-y)*t,u.radius))wallCross=true;}
  if(!first&&(u.x-sideX)*dir>u.radius+8){if(u.y<top-u.radius-8)first='U';else if(u.y>bottom+u.radius+8)first='D';}
  if(!switched&&Math.hypot(u.x-obs.waypoints[choice][0],u.y-obs.waypoints[choice][1])<35){
   if(order.status==='accepted')accepted++;order=issue(goal);switched=true;
  }
  if(Math.hypot(u.x-goal.x,u.y-goal.y)<90)break;
 }
 if(order.status==='accepted')accepted++;
 return {obs,choice,first,near:Math.hypot(u.x-goal.x,u.y-goal.y)<90,wallCross,maxStep,limit:u.speed*.05*1.5,seconds:g.time,switched,accepted};
}

const SYSTEM='You are selecting a waypoint for one soldier. Walls are solid line segments. Given start, goal, walls and two waypoint coordinates, choose U or D to reach the goal safely. Reply with exactly U or D.';
export async function collect(out,{quick=false}={}){
 await mkdir(out,{recursive:true}); const all={};
 for(const split of ['train','eval']){
  const specs=layouts(split); const selected=quick?specs.slice(0,4):specs; const rows=[];let failed=0;
  for(const spec of selected){
   // The teacher executes BOTH options, rather than assuming an observed exit
   // side proves that its waypoint is physically reachable.
   const runs=await Promise.all(['U','D'].map(c=>simulate(spec,c)));
   const valid=r=>r.near&&!r.wallCross&&r.switched&&r.accepted===2&&r.maxStep<=r.limit+1e-8;
   const good=runs.filter(valid).sort((a,b)=>a.seconds-b.seconds);
   if(good.length!==1){failed++;console.error('rejected',spec.id,'valid candidates',good.length);continue;}
   const run=good[0];
   rows.push({spec,input:run.obs,response:run.choice,teacher:{seconds:run.seconds,maxStep:run.maxStep},other:{near:runs.find(r=>r!==run).near,switched:runs.find(r=>r!==run).switched}});
   console.error(split,spec.id,'label',run.choice,'seconds',run.seconds.toFixed(2));
  }
  if(!rows.length)throw Error(`empty ${split}`);
  all[split]=rows;await writeFile(resolve(out,`${split}.jsonl`),rows.map(r=>JSON.stringify(r)).join('\n')+'\n');
  console.error(split,'kept',rows.length,'rejected',failed);
 }
 const manifest={schema:'frontline-obstacle-game-v1',system:SYSTEM,method:'Real CommandAPI and Game.step in synthetic mirrored U-wall scenes; both waypoints are tried; keep examples only if exactly one reaches the goal safely. This is not a human expert or normal game map. Each input only describes this unit and synthetic geometry.',train:all.train.length,eval:all.eval.length,trainIds:all.train.map(x=>x.spec.id),evalIds:all.eval.map(x=>x.spec.id)};
 await writeFile(resolve(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');return manifest;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const out=process.argv[2];if(!out)throw Error('usage: node collect-obstacle-game.mjs OUTPUT [--quick]');
 console.log(JSON.stringify(await collect(out,{quick:process.argv.includes('--quick')})));
}
