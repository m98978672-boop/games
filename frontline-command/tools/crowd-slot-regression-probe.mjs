// Replay the failures exactly as recorded and run controlled autopilot probes.
import {readFile} from 'node:fs/promises';import {loadConfig} from '../src/core/config.js';import {Game} from '../src/sim/game.js';
const original=JSON.parse(await readFile(new URL('../docs/VISION_SMALL_GROUP_AUTOPILOT.json',import.meta.url),'utf8'));
const limit=Number(process.argv.find(x=>x.startsWith('--limit='))?.slice(8)||0);
const cases=original.pairs.filter(p=>p.type==='hq'&&p.faction===1&&p.seed===4&&p.count===4&&p.jitter===8);const cfg=await loadConfig();
for(const name of ['crowd_nav_v2','vision_nav_policy_v1','group_nav_3to5_v1','arrival_stuck_guard_v1'])cfg.flags[name]=true;
const round=n=>+n.toFixed(2);
function run(p,mode){
 cfg.flags.crowd_slot_avoid_v1=mode==='slot-on';
 const g=new Game({cfg,seed:p.seed,aiVsAi:true});g.units.clear();g.unitGrid.clear();g.squads.clear();
 if(mode==='no-autopilot')g.autopilot.update=()=>{};
 if(mode==='no-formation'||mode==='no-production'){
   const area=g.autopilot.areaEnabled.bind(g.autopilot),disabled=mode.slice(3);g.autopilot.areaEnabled=(f,a)=>a===disabled?false:area(f,a);
 }
 const b=g.world.buildings.find(b=>b.type===p.type&&b.faction===p.faction&&g.walls.state(b));
 const o=g.walls.state(b).outline.openings.find(o=>o.type==='door'),px=b.x+o.cx,py=b.y+o.cy;
 const us=Array.from({length:p.count},(_,i)=>{const side=(i%2?-1:1)*p.jitter,dist=55+i*24;
  const u=g.spawnUnit(p.faction,'infantry',px+o.nx*dist-o.ny*side,py+o.ny*dist+o.nx*side);
  u.goal={x:px-o.nx*100,y:py-o.ny*100};u.activity='advance';u.arrived=false;u.thinkTimer=100;return u;});
 const ids=new Set(us.map(u=>u.id)),crossed=new Set(),changes=[],last=new Map();let overlap=0,speed=0,walls=0,maxOtherNear=0,otherOverlap=0,tick=0;
 function unitSnapshot(u){const other=[...g.units.values()].filter(v=>v!==u&&v.alive&&!v.downed&&Math.hypot(v.x-u.x,v.y-u.y)<u.radius+v.radius+2).map(v=>({id:v.id,tracked:ids.has(v.id),faction:v.faction,role:v.role,x:round(v.x),y:round(v.y),radius:round(v.radius),goal:v.goal&&{x:round(v.goal.x),y:round(v.goal.y)},d:round(Math.hypot(v.x-u.x,v.y-u.y)),arrived:!!v.arrived}));
  return {id:u.id,x:round(u.x),y:round(u.y),goal:u.goal&&{x:round(u.goal.x),y:round(u.goal.y)},
   arrived:!!u.arrived,failed:!!u.pathFailed,alive:u.alive,downed:u.downed,squadId:u.squadId,
   crowd:!!u._crowdActive,point:u._crowdPoint&&{x:round(u._crowdPoint.x),y:round(u._crowdPoint.y)},
   slot:u._crowdAssigned&&{x:round(u._crowdAssigned.x),y:round(u._crowdAssigned.y)},stuck:round(u.stuck||0),near:other};}
 for(;tick<600;tick++){
  const before=us.map(u=>({x:u.x,y:u.y,terrain:g.world.speedAt(u.x,u.y)}));g.step(.05);
  let nearOther=0;
  for(let i=0;i<us.length;i++){
   const u=us[i],old=before[i];if((u.x-px)*o.nx+(u.y-py)*o.ny<0)crossed.add(u.id);
   if(Math.hypot(u.x-old.x,u.y-old.y)>Math.max(u.speed*old.terrain,30)*.05*1.5+1e-8)speed++;
   if(g.walls.blocksMove(u.x,u.y,u.radius,u))walls++;
   const all=[...g.units.values()].filter(v=>!ids.has(v.id)&&v.alive&&!v.downed&&Math.hypot(v.x-u.x,v.y-u.y)<80);
   nearOther=Math.max(nearOther,all.length);if(all.some(v=>Math.hypot(v.x-u.x,v.y-u.y)<v.radius+u.radius))otherOverlap++;
   const snap=unitSnapshot(u),key=JSON.stringify({goal:snap.goal,arrived:snap.arrived,failed:snap.failed,squadId:snap.squadId,crowd:snap.crowd,slot:snap.slot});
   if(key!==last.get(u.id)){if(changes.length<100)changes.push({tick:tick+1,...snap});last.set(u.id,key);}
  }
  maxOtherNear=Math.max(maxOtherNear,nearOther);
  if(us.some((a,i)=>us.slice(i+1).some(v=>Math.hypot(a.x-v.x,a.y-v.y)<a.radius+v.radius)))overlap++;
  if(us.every(u=>u.arrived||u.pathFailed))break;
 }
 const arrived=us.filter(u=>u.arrived&&!u.pathFailed).length;
 return {passed:arrived===us.length&&crossed.size===us.length&&!walls&&!speed&&!overlap,arrived,crossed:crossed.size,walls,speed,overlap,otherOverlap,maxOtherNear,
  ticks:Math.min(tick+1,600),final:us.map(unitSnapshot),changes};
}
const results=[];for(const p of cases){const item={type:p.type,faction:p.faction,seed:p.seed,count:p.count,jitter:p.jitter};
 for(const mode of ['slot-off','slot-on'])item[mode]=run(p,mode);
 results.push(item);
}
console.log(JSON.stringify({kind:'crowd_slot_regression_probe',results},null,2));
