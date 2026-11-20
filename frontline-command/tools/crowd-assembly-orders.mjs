// Real Command API, squad AI and soldier AI, fixed HQ/city door approach.
// Other autonomous systems are disabled: this is not a complete battle.
import {loadConfig} from '../src/core/config.js';import {Game} from '../src/sim/game.js';import {Squad} from '../src/sim/squads.js';
const cfg=await loadConfig();
function run(type,faction,seed,n,kind){
 const g=new Game({cfg,seed,aiVsAi:true});g.units.clear();g.unitGrid.clear();g.occupancyGrid.clear();g.squads.clear();g.api.orders=[];
 for(const sys of [...g.strategic,g.autopilot,g.rules,g.logistics,g.build,g.influence])sys.update=()=>{};g.checkVictory=()=>{};
 const b=g.world.buildings.find(b=>b.type===type&&b.faction===faction&&g.walls.state(b));const o=g.walls.state(b).outline.openings.find(o=>o.type==='door'),x=b.x+o.cx,y=b.y+o.cy;
 const sq=new Squad(g,{faction});g.squads.set(sq.id,sq);sq.retreatTier='never';sq.strategyId='rush';
 const units=Array.from({length:n},(_,i)=>{const u=g.spawnUnit(faction,'infantry',x+o.nx*(55+i*24),y+o.ny*(55+i*24));sq.addUnit(u);return u});
 const target={x:x-o.nx*100,y:y-o.ny*100};const order=g.api.issue({source:'player',type:kind,faction,squadIds:[sq.id],target});let wall=0,overlap=0,speed=0,openSlots=0,crowd=0,holdAt=null;
 for(let tick=0;tick<1200;tick++){
  const before=units.map(u=>({x:u.x,y:u.y,terrain:g.world.speedAt(u.x,u.y)}));g.step(.05);
  for(let i=0;i<units.length;i++){const u=units[i],p=before[i],d=Math.hypot(u.x-p.x,u.y-p.y);if(d>1e-6&&g.walls.blocksMoveSweep(p.x,p.y,u.x,u.y,u.radius,u))wall++;if(d>Math.max(u.speed*p.terrain,30)*.05*1.5+1e-8)speed++;if(u._crowdOpenGroup)openSlots++;if(u._crowdActive)crowd++;}
  if(units.some((u,i)=>units.slice(i+1).some(v=>Math.hypot(u.x-v.x,u.y-v.y)<u.radius+v.radius-1e-6)))overlap++;
  if(holdAt===null&&sq.state==='hold')holdAt=g.time;
 }
 return {type,faction,seed,n,kind,accepted:order.status==='accepted',crossed:units.filter(u=>(u.x-x)*o.nx+(u.y-y)*o.ny<0).length,within90:units.filter(u=>Math.hypot(u.x-target.x,u.y-target.y)<90&&!g.walls.blocksMoveSweep(u.x,u.y,target.x,target.y,u.radius,u)).length,
   failed:units.filter(u=>u.pathFailed).length,holdAt,wall,overlap,speed,openSlots,crowd,positions:units.map(u=>({x:u.x,y:u.y,goal:u.goal,activity:u.activity,failed:u.pathFailed}))};
}
const results=[];for(const type of ['hq','city'])for(const f of [0,1])for(const n of [3,5,6,8,10])for(const seed of [2,3,11])for(const kind of ['move','hold'])results.push(run(type,f,seed,n,kind));console.log(JSON.stringify({results},null,2));
