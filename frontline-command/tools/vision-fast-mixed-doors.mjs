// Isolated normal Game.step: fixed goals, both factions, real outlines.
import {loadConfig} from '../src/core/config.js';import {Game} from '../src/sim/game.js';
const n=Number(process.argv.find(x=>x.startsWith('--seeds='))?.slice(8)||20);
if(!Number.isSafeInteger(n)||n<1||n>100)throw Error('invalid seeds');
async function run(seed,faction,type,door,layout,on,autopilot){
 const cfg=await loadConfig();cfg.flags.door_courtesy_v1=true;cfg.flags.unit_solid_2d_v1=true;cfg.flags.crowd_nav_v2=true;cfg.flags.vision_nav_policy_v1=true;cfg.flags.group_nav_3to5_v1=true;cfg.flags.arrival_stuck_guard_v1=true;cfg.flags.crowd_slot_avoid_v1=true;cfg.flags.group_nav_pair_v1=true;cfg.flags.vision_nav_fast_v1=on;
 const g=new Game({cfg,seed,aiVsAi:true});g.units.clear();g.unitGrid.clear();g.squads.clear();if(!autopilot)g.autopilot.update=()=>{};
 const b=g.world.buildings.find(b=>b.type===type&&b.faction===faction&&g.walls.state(b));const o=g.walls.state(b).outline.openings.filter(o=>o.type==='door')[door];
 const px=b.x+o.cx,py=b.y+o.cy,tx=-o.ny,ty=o.nx;
 const placements=layout==='pair'?[[-1,85,0],[1,85,0]]:layout==='two-exit'?[[-1,85,0],[-1,50,0],[1,85,0]]:[[-1,85,0],[1,85,0],[1,120,0]];
 const us=placements.map(([side,d,lat],i)=>{const u=g.spawnUnit(faction,'infantry',px+side*o.nx*d+tx*lat,py+side*o.ny*d+ty*lat);
  const destLat=layout==='pair'?0:(i===0?-24:24);u.goal={x:px-side*o.nx*115+tx*destLat,y:py-side*o.ny*115+ty*destLat};u.activity='advance';u.thinkTimer=100;return {u,side};});
 let overlap=0,speed=0,walls=0;const crosses=new Map();let ticks=0;
 for(;ticks<1200;ticks++){
  const before=us.map(({u})=>({x:u.x,y:u.y,speed:u.speed*g.world.speedAt(u.x,u.y)}));g.step(.05);
  for(let i=0;i<us.length;i++){const {u,side}=us[i],p=before[i];
   if(!crosses.has(u.id)&&((u.x-px)*o.nx+(u.y-py)*o.ny)*side<0)crosses.set(u.id,ticks+1);
   if(Math.hypot(u.x-p.x,u.y-p.y)>Math.max(p.speed,cfg.navBudget.antiStuck.pushSpeedFloor??30)*.05*1.5+1e-8)speed++;
   if(g.walls.blocksMove(u.x,u.y,u.radius,u))walls++;
  }
  if(us.some(({u},i)=>us.slice(i+1).some(({u:v})=>Math.hypot(u.x-v.x,u.y-v.y)<u.radius+v.radius)))overlap++;
  if(us.every(({u})=>u.arrived||u.pathFailed)||g.warOver)break;
 }
 const out=us.filter(x=>x.side===-1),inside=us.filter(x=>x.side===1);
 const order=out.every(x=>crosses.has(x.u.id))&&inside.every(x=>crosses.has(x.u.id))&&Math.max(...out.map(x=>crosses.get(x.u.id)))<Math.min(...inside.map(x=>crosses.get(x.u.id)));
 const arrived=us.filter(x=>x.u.arrived&&!x.u.pathFailed).length,failed=us.filter(x=>x.u.pathFailed).length;
 return {ok:order&&arrived===us.length&&!overlap&&!speed&&!walls,order,arrived,failed,count:us.length,overlap,speed,walls,ticks:ticks+1,maxUnits:g.units.size,
  crossings:us.map(x=>({side:x.side,tick:crosses.get(x.u.id)??null}))};
}
const pairs=[];
for(const type of ['hq','city'])for(let faction=0;faction<2;faction++)for(let door=0;door<2;door++)for(const layout of ['pair','two-exit','two-enter'])for(let seed=1;seed<=n;seed++){
 const x={seed,faction,type,door,layout};pairs.push({...x,off:await run(seed,faction,type,door,layout,false,false),on:await run(seed,faction,type,door,layout,true,false)});
}
const groups={};for(const p of pairs){const g=groups[p.layout]||={cases:0,off:0,on:0,regressed:0,improved:0,orderOff:0,orderOn:0,overlapOff:0,overlapOn:0,failedOff:0,failedOn:0};g.cases++;if(p.off.ok)g.off++;if(p.on.ok)g.on++;if(p.off.ok&&!p.on.ok)g.regressed++;if(!p.off.ok&&p.on.ok)g.improved++;if(p.off.order)g.orderOff++;if(p.on.order)g.orderOn++;g.overlapOff+=p.off.overlap;g.overlapOn+=p.on.overlap;g.failedOff+=p.off.failed;g.failedOn+=p.on.failed;}
console.log(JSON.stringify({kind:'vision_fast_mixed_door_diagnostics',seeds:n,groups,pairs,caveats:['Vision fast flag off/on; pair group, vision selector, group nav, arrival guard, slot, courtesy, collider and crowd nav enabled in both runs','Autopilot disabled and unit thinking delayed to retain test orders; other systems active','Strict zero overlap, speed and wall checks at tick boundaries','Does not prove no transient inter-unit overlap in each unit update, or behavior in combat or mixed traffic']},null,2));
if(pairs.some(p=>!p.on.ok))process.exitCode=1;
