// Controlled opposing allied foot traffic at real HQ/city doors; no combat.
// Default game flags unless --courtesy is explicitly passed. Delayed soldier
// decisions preserve fixed goals; this is not a full war or command test.
import {loadConfig} from '../src/core/config.js';import {Game} from '../src/sim/game.js';import {Walls} from '../src/sim/walls.js';import {clearFinalApproach} from '../src/sim/arrival.js';
const count=Number(process.argv.find(x=>x.startsWith('--seeds='))?.slice(8)||3),start=Number(process.argv.find(x=>x.startsWith('--start='))?.slice(8)||1);
if(!Number.isInteger(count)||count<1||count>100||!Number.isInteger(start)||start<1)throw Error('bad seed range');
const cfg=await loadConfig();if(process.argv.includes('--courtesy'))cfg.flags.door_courtesy_v1=true;
function run(type,faction,door,seed,insideCount,outsideCount){
 const g=new Game({cfg,seed,aiVsAi:true});g.units.clear();g.unitGrid.clear();g.occupancyGrid.clear();g.squads.clear();
 for(const sys of [g.squadAI,...g.strategic,g.autopilot,g.rules,g.logistics,g.build,g.influence,g.api])sys.update=()=>{};g.checkVictory=()=>{};
 const b=g.world.buildings.find(x=>x.type===type&&x.faction===faction&&g.walls.state(x)),o=g.walls.state(b).outline.openings.filter(x=>x.type==='door')[door];
 const x=b.x+o.cx,y=b.y+o.cy,us=[];
 for(const [side,n] of [[-1,insideCount],[1,outsideCount]])for(let i=0;i<n;i++){
  const u=g.spawnUnit(faction,'infantry',x+side*o.nx*(55+i*24),y+side*o.ny*(55+i*24));
  u.goal={x:x-side*o.nx*105,y:y-side*o.ny*105};u.activity='advance';u.arrived=false;u.thinkTimer=1000;us.push({u,side,original:{...u.goal}});
 }
 let invalid=us.some(({u,side})=>g.walls.blocksMove(u.x,u.y,u.radius,u)||!!g.walls.buildingAtPoint(u.x,u.y)!==(side===-1));
 let wall=0,overlap=0,swept=0,speed=0,failed=0,crossed=new Set(),moves=0;
 g._motionDiagnostic=(u,x1,y1,x2,y2)=>{if(!us.some(v=>v.u===u))return;for(const {u:v} of us){if(v===u||!v.alive||v.downed)continue;const r=u.radius+v.radius,start=Math.hypot(x1-v.x,y1-v.y),d=Walls.distPointSegment(v.x,v.y,x1,y1,x2,y2).d;if(start>=r-1e-7&&d<r-1e-7)swept++;}};
 for(let t=0;t<1200;t++){
  const before=us.map(({u})=>({x:u.x,y:u.y,terrain:g.world.speedAt(u.x,u.y)}));g.step(.05);
  for(let i=0;i<us.length;i++){const {u,side}=us[i],p=before[i],step=Math.hypot(u.x-p.x,u.y-p.y);if(step>1e-6){moves++;if(g.walls.blocksMoveSweep(p.x,p.y,u.x,u.y,u.radius,u))wall++;}if(step>Math.max(u.speed*p.terrain,30)*.05*1.5+1e-8)speed++;if(((u.x-x)*o.nx+(u.y-y)*o.ny)*side<0)crossed.add(u.id);}
  if(us.some(({u},i)=>us.slice(i+1).some(({u:v})=>Math.hypot(u.x-v.x,u.y-v.y)<u.radius+v.radius-1e-6)))overlap++;
  // A failed unit still completing doorway evacuation is physically active.
  if(us.every(({u})=>u.arrived||(u.pathFailed&&!u._failedRestGoal)))break;
 }
 const arrived=us.filter(({u})=>u.arrived&&!u.pathFailed).length;failed=us.filter(({u})=>u.pathFailed).length;
 const physicalOriginal=us.filter(({u,original})=>Math.hypot(u.x-original.x,u.y-original.y)<34&&clearFinalApproach(g,u,original.x,original.y)).length;
 const falseArrived=us.filter(({u,original})=>u.arrived&&!u.pathFailed&&(Math.hypot(u.x-original.x,u.y-original.y)>=34||!clearFinalApproach(g,u,original.x,original.y))).length;
 return {type,faction,door,seed,insideCount,outsideCount,invalid,count:us.length,crossed:crossed.size,arrived,physicalOriginal,falseArrived,failed,wall,overlap,swept,speed,moves,seconds:g.time,units:us.map(({u,side,original})=>({id:u.id,side,x:u.x,y:u.y,arrived:u.arrived,failed:u.pathFailed,goal:u.goal,original}))};
}
const results=[];for(const type of ['hq','city'])for(const faction of [0,1])for(const door of [0,1])for(const [a,b] of [[1,1],[1,2],[2,1],[2,2],[2,3]])for(let seed=start;seed<start+count;seed++)results.push(run(type,faction,door,seed,a,b));
console.log(JSON.stringify({count,start,courtesy:cfg.flag('door_courtesy_v1',false),results},null,2));
