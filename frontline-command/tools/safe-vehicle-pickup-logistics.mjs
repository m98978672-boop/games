// 60s paired normal AI/autopilot runs. Event sampling covers post-construction spawns, not initialization.
import {loadConfig} from '../src/core/config.js';import {Game} from '../src/sim/game.js';
const n=Number(process.argv.find(x=>x.startsWith('--seeds='))?.slice(8)||20);if(!Number.isInteger(n)||n<1||n>100)throw Error('invalid seeds');
async function run(seed,on){
 const cfg=await loadConfig();for(const f of ['vision_nav_policy_v1','crowd_nav_v2','group_nav_3to5_v1','arrival_stuck_guard_v1','crowd_slot_avoid_v1','group_nav_pair_v1','vision_nav_fast_v1','motion_slide_guard_v1','near_goal_direct_v1','door_courtesy_v1','unit_solid_2d_v1'])cfg.flags[f]=true;
 cfg.flags.safe_vehicle_spawn_v1=on;cfg.flags.vehicle_pickup_exterior_v1=on;const g=new Game({cfg,seed,aiVsAi:true,difficulty:'regular'});
 const deliveries=[];const unload=g.logistics.unloadTruck.bind(g.logistics);
 g.logistics.unloadTruck=(truck,task)=>{deliveries.push({role:truck.role,pathFailed:!!truck.pathFailed,distance:Math.hypot(truck.x-task.request.x,truck.y-task.request.y),time:g.time});return unload(truck,task);};
 const spawned=[];g.events.on('unitSpawned',({unit:u})=>{
  if(!u.isVehicle)return;
  const overlapping=[...g.units.values()].filter(v=>v!==u&&v.alive&&!v.downed&&Math.hypot(u.x-v.x,u.y-v.y)<u.radius+v.radius).map(v=>v.id);
  spawned.push({role:u.role,faction:u.faction,t:g.time,x:u.x,y:u.y,overlapping,blocked:!!g.walls.blocksMove(u.x,u.y,u.radius,u),building:g.walls.buildingAtPoint(u.x,u.y)?.id??null});
 });
 let ticks=0;for(;ticks<1200&&!g.warOver;ticks++)g.step(.05);
 return {seed,on,ticks,warOver:g.warOver,spawned,deliveries,delivered:g.logistics.delivered,stock:g.logistics.stock,
  aliveVehicles:[...g.units.values()].filter(u=>u.alive&&u.isVehicle).length};
}
const pairs=[];for(let seed=1;seed<=n;seed++){
 const first=seed%2===0,a=await run(seed,first),b=await run(seed,!first);pairs.push({seed,off:first?b:a,on:first?a:b});
 console.error('seed',seed,'vehicles',pairs.at(-1).off.spawned.length,pairs.at(-1).on.spawned.length);
}
const sum=(side,fn)=>pairs.reduce((s,p)=>s+fn(p[side]),0);
const summary={pairs:n,offVehicleSpawns:sum('off',p=>p.spawned.length),onVehicleSpawns:sum('on',p=>p.spawned.length),
 offSpawnOverlaps:sum('off',p=>p.spawned.filter(s=>s.overlapping.length).length),onSpawnOverlaps:sum('on',p=>p.spawned.filter(s=>s.overlapping.length).length),
 offWallBlocked:sum('off',p=>p.spawned.filter(s=>s.blocked).length),onWallBlocked:sum('on',p=>p.spawned.filter(s=>s.blocked).length),
 offDeliveries:sum('off',p=>p.delivered[0]+p.delivered[1]),onDeliveries:sum('on',p=>p.delivered[0]+p.delivered[1]),
 offPhysicalDeliveries:sum('off',p=>p.deliveries.filter(d=>d.distance<110).length),onPhysicalDeliveries:sum('on',p=>p.deliveries.filter(d=>d.distance<110).length),
 offFailureUnloads:sum('off',p=>p.deliveries.filter(d=>d.pathFailed&&d.distance>=110).length),onFailureUnloads:sum('on',p=>p.deliveries.filter(d=>d.pathFailed&&d.distance>=110).length),
 offWarsEnded:pairs.filter(p=>p.off.warOver).length,onWarsEnded:pairs.filter(p=>p.on.warOver).length};
console.log(JSON.stringify({kind:'paired_logistics_spawn_and_exterior_pickup_diagnostic',seeds:n,steps:1200,dt:.05,summary,pairs,caveats:['All vehicle unitSpawned events after initial game construction; may include non-logistics sources','Checks exact positions at spawn, not all later movement','60 simulated seconds with normal systems; not a complete war or logistics acceptance','Same seeds may diverge as actions consume random numbers differently','Off: legacy logistics; on: the existing experimental safe-logistics path is activated by the new flag pair, safe_logistics_v2 itself remains off']},null,2));
