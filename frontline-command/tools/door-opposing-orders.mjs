// Controlled opposite squad orders through real HQ/city doors. Uses the real
// command, squad and soldier AI; other strategic systems and combat are off.
import {loadConfig} from '../src/core/config.js';import {Game} from '../src/sim/game.js';import {Squad} from '../src/sim/squads.js';import {Walls} from '../src/sim/walls.js';import {clearFinalApproach} from '../src/sim/arrival.js';
const count=Number(process.argv.find(x=>x.startsWith('--seeds='))?.slice(8)||3),start=Number(process.argv.find(x=>x.startsWith('--start='))?.slice(8)||1);
if(!Number.isInteger(count)||count<1||count>100||!Number.isInteger(start)||start<1)throw Error('bad seeds');
const cfg=await loadConfig();if(process.argv.includes('--disable'))cfg.flags.blocked_door_yield_v1=false;
function run(type,faction,door,seed,insideCount,outsideCount){
 const g=new Game({cfg,seed,aiVsAi:true});g.units.clear();g.unitGrid.clear();g.occupancyGrid.clear();g.squads.clear();g.api.orders=[];
 for(const sys of [...g.strategic,g.autopilot,g.rules,g.logistics,g.build,g.influence])sys.update=()=>{};g.checkVictory=()=>{};
 const b=g.world.buildings.find(x=>x.type===type&&x.faction===faction&&g.walls.state(x)),o=g.walls.state(b).outline.openings.filter(x=>x.type==='door')[door];
 const px=b.x+o.cx,py=b.y+o.cy,us=[],orders=[];g._doorYieldMetrics={chosen:0};
 for(const [side,n] of [[-1,insideCount],[1,outsideCount]]){
  const sq=new Squad(g,{faction});g.squads.set(sq.id,sq);sq.retreatTier='never';sq.strategyId='rush';
  for(let i=0;i<n;i++){const u=g.spawnUnit(faction,'infantry',px+side*o.nx*(55+i*24),py+side*o.ny*(55+i*24));sq.addUnit(u);us.push({u,side});}
  const target={x:px-side*o.nx*110,y:py-side*o.ny*110};orders.push({order:g.api.issue({source:'player',type:'move',faction,squadIds:[sq.id],target}),target,side});
 }
 let invalid=us.some(({u,side})=>g.walls.blocksMove(u.x,u.y,u.radius,u)||!!g.walls.buildingAtPoint(u.x,u.y)!==(side===-1));
 let wall=0,overlap=0,swept=0,speed=0,crossed=new Set();
 g._motionDiagnostic=(u,x1,y1,x2,y2)=>{if(!us.some(v=>v.u===u))return;for(const {u:v} of us){if(v===u||!v.alive||v.downed)continue;const r=u.radius+v.radius,start=Math.hypot(x1-v.x,y1-v.y);if(start>=r-1e-7&&Walls.distPointSegment(v.x,v.y,x1,y1,x2,y2).d<r-1e-7)swept++;}};
 for(let t=0;t<1200;t++){
  const before=us.map(({u})=>({x:u.x,y:u.y,terrain:g.world.speedAt(u.x,u.y)}));g.step(.05);
  for(let i=0;i<us.length;i++){const {u,side}=us[i],p=before[i],d=Math.hypot(u.x-p.x,u.y-p.y);if(d>1e-6&&g.walls.blocksMoveSweep(p.x,p.y,u.x,u.y,u.radius,u))wall++;if(d>Math.max(u.speed*p.terrain,30)*.05*1.5+1e-8)speed++;if(((u.x-px)*o.nx+(u.y-py)*o.ny)*side<0)crossed.add(u.id);}
  if(us.some(({u},i)=>us.slice(i+1).some(({u:v})=>Math.hypot(u.x-v.x,u.y-v.y)<u.radius+v.radius-1e-6)))overlap++;
 }
 return {type,faction,door,seed,insideCount,outsideCount,invalid,count:us.length,accepted:orders.every(x=>x.order.status==='accepted'),crossed:crossed.size,
  near:us.filter(({u,side})=>{const t=orders.find(o=>o.side===side).target;return Math.hypot(u.x-t.x,u.y-t.y)<100&&clearFinalApproach(g,u,t.x,t.y)}).length,
  failed:us.filter(({u})=>u.pathFailed).length,wall,overlap,swept,speed,yields:g._doorYieldMetrics.chosen};
}
const results=[];for(const type of ['hq','city'])for(const faction of [0,1])for(const door of [0,1])for(const [a,b] of [[1,1],[1,2],[2,1],[2,2],[2,3]])for(let seed=start;seed<start+count;seed++)results.push(run(type,faction,door,seed,a,b));console.log(JSON.stringify({results},null,2));
