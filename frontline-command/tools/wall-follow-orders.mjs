// Real Command API, squad and soldier AI in a mirrored synthetic U obstacle.
// Other strategic systems and combat are disabled. Compare identical seeds
// on two revisions; this does not represent a complete battle.
import {loadConfig} from '../src/core/config.js';import {Game} from '../src/sim/game.js';import {Squad} from '../src/sim/squads.js';import {Nav} from '../src/sim/nav.js';import {Walls} from '../src/sim/walls.js';
const cfg=await loadConfig();
function run(faction,seed,n){
 const g=new Game({cfg,seed,aiVsAi:true});g.units.clear();g.unitGrid.clear();g.occupancyGrid.clear();g.squads.clear();g.api.orders=[];
 for(const s of [...g.strategic,g.autopilot,g.rules,g.logistics,g.build,g.influence])s.update=()=>{};g.checkVictory=()=>{};g.walls.update=()=>{};
 const mirror=x=>faction?2048-x:x,segments=[[640,640,896,640],[896,640,896,896],[896,896,640,896]].map(([x,y,x2,y2])=>[mirror(x),y,mirror(x2),y2]);
 const inside=(x,y)=>x>0&&y>0&&x<2048&&y<2048,blocked=(x,y,r)=>segments.some(s=>Walls.distPointSegment(x,y,...s).d<=8+r);
 Object.assign(g.world,{W:2048,H:2048,navVersion:1,isWalkable:(x,y)=>inside(x,y)&&!blocked(x,y,0),isBaseWalkable:inside,speedAt:()=>1,terrainAt:()=>0});
 Object.assign(g.walls,{enabled:()=>true,doorWaypoint:()=>null,doorsForUnit:()=>{},blocksMove:blocked,buildingAtPoint:()=>null,refsNear:()=>[],refsInBox:()=>[],blocksMoveSweep:(x,y,xx,yy,r)=>{const steps=Math.max(1,Math.ceil(Math.hypot(xx-x,yy-y)));for(let i=0;i<=steps;i++)if(blocked(x+(xx-x)*i/steps,y+(yy-y)*i/steps,r))return true;return false;}});
 g.nav=new Nav(g.world,cfg);g._wallFollowMetrics={steps:0};const sq=new Squad(g,{faction});g.squads.set(sq.id,sq);sq.retreatTier='never';sq.strategyId='rush';
 const us=Array.from({length:n},(_,i)=>{const u=g.spawnUnit(faction,'infantry',mirror(750+(i%2)*25),720+Math.floor(i/2)*24);sq.addUnit(u);return u});
 const target={x:mirror(1450),y:768},order=g.api.issue({source:'enemyAI',type:'move',faction,squadIds:[sq.id],target});let wall=0,overlap=0,speed=0,swept=0;
 g._motionDiagnostic=(u,x1,y1,x2,y2)=>{if(!us.includes(u))return;for(const v of us){if(v===u||!v.alive||v.downed)continue;const r=u.radius+v.radius,start=Math.hypot(x1-v.x,y1-v.y);if(start>=r-1e-7&&Walls.distPointSegment(v.x,v.y,x1,y1,x2,y2).d<r-1e-7)swept++;}};
 for(let t=0;t<1600;t++){const before=us.map(u=>({x:u.x,y:u.y}));g.step(.05);for(let i=0;i<n;i++){const u=us[i],p=before[i],d=Math.hypot(u.x-p.x,u.y-p.y);if(d>1e-6&&g.walls.blocksMoveSweep(p.x,p.y,u.x,u.y,u.radius,u))wall++;if(d>u.speed*.05*1.5+1e-8)speed++;}if(us.some((u,i)=>us.slice(i+1).some(v=>Math.hypot(u.x-v.x,u.y-v.y)<u.radius+v.radius-1e-6)))overlap++;}
 return {faction,seed,n,accepted:order.status==='accepted',escaped:us.filter(u=>(faction?2048-u.x:u.x)>910).length,within90:us.filter(u=>Math.hypot(u.x-target.x,u.y-target.y)<90).length,wall,overlap,swept,speed,steps:g._wallFollowMetrics.steps};
}
const results=[];for(const f of [0,1])for(const n of [1,3,6,8])for(const seed of [1,5,7,11,23])results.push(run(f,seed,n));console.log(JSON.stringify({results},null,2));
