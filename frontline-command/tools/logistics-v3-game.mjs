// 60s paired normal AI/autopilot runs. Event sampling covers post-construction spawns, not initialization.
import {loadConfig} from '../src/core/config.js';import {Game} from '../src/sim/game.js';
const n=Number(process.argv.find(x=>x.startsWith('--seeds='))?.slice(8)||20);if(!Number.isInteger(n)||n<1||n>100)throw Error('invalid seeds');
async function run(seed,on){
 const cfg=await loadConfig();for(const f of ['vision_nav_policy_v1','crowd_nav_v2','group_nav_3to5_v1','arrival_stuck_guard_v1','crowd_slot_avoid_v1','group_nav_pair_v1','vision_nav_fast_v1','motion_slide_guard_v1','near_goal_direct_v1','door_courtesy_v1','unit_solid_2d_v1'])cfg.flags[f]=true;
 cfg.flags.safe_vehicle_spawn_v1=true;cfg.flags.vehicle_pickup_exterior_v1=true;cfg.flags.vehicle_spawn_all_v1=true;
 cfg.flags.logistics_dropoff_v1=on;cfg.flags.motion_wall_sweep_v1=true;cfg.flags.motion_wall_exact_v1=true;cfg.flags.bot_obstacle_vision_v1=true;cfg.flags.vehicle_detour_v2=true;const g=new Game({cfg,seed,aiVsAi:true,difficulty:'regular'});
 const initialVehicles=[...g.units.values()].filter(u=>u.isVehicle&&u.alive).map(u=>({id:u.id,role:u.role,blocked:g.walls.blocksMove(u.x,u.y,u.radius,u),overlapping:[...g.units.values()].filter(v=>v!==u&&v.alive&&!v.downed&&Math.hypot(u.x-v.x,u.y-v.y)<u.radius+v.radius).map(v=>v.id)}));
 const deliveries=[];const unload=g.logistics.unloadTruck.bind(g.logistics);
 g.logistics.unloadTruck=(truck,task)=>{deliveries.push({role:truck.role,pathFailed:!!truck.pathFailed,distance:Math.hypot(truck.x-task.request.x,truck.y-task.request.y),targetDistance:Math.hypot(truck.x-(task.dropoff?.x??task.request.x),truck.y-(task.dropoff?.y??task.request.y)),physicalRange:task.dropoff?34:110,time:g.time});return unload(truck,task);};
 const spawned=[];g.events.on('unitSpawned',({unit:u})=>{
  if(!u.isVehicle)return;
  const overlapping=[...g.units.values()].filter(v=>v!==u&&v.alive&&!v.downed&&Math.hypot(u.x-v.x,u.y-v.y)<u.radius+v.radius).map(v=>v.id);
  spawned.push({role:u.role,faction:u.faction,t:g.time,x:u.x,y:u.y,overlapping,blocked:!!g.walls.blocksMove(u.x,u.y,u.radius,u),building:g.walls.buildingAtPoint(u.x,u.y)?.id??null});
 });
 let ticks=0;const observations={samples:0,loaded:0,loadedNearEnemy:0,source:0,target:0,failed:0};for(;ticks<1800&&!g.warOver;ticks++){
  g.step(.05);if(ticks%20===19)for(const u of g.units.values())if(u.alive&&u.role==='truck'){
   observations.samples++;if(u.cargo>0){observations.loaded++;if(g.nearbyEnemies(u,300).length)observations.loadedNearEnemy++;}
   if(u.truckTask?.state==='toSource')observations.source++;if(u.truckTask?.state==='toTarget')observations.target++;if(u.pathFailed)observations.failed++;
  }
 }
 return {seed,on,ticks,warOver:g.warOver,observations,initialVehicles,spawned,deliveries,delivered:g.logistics.delivered,stock:g.logistics.stock,
  aliveVehicles:[...g.units.values()].filter(u=>u.alive&&u.isVehicle).length,
  trucks:[...g.units.values()].filter(u=>u.role==='truck'&&u.alive).map(u=>({id:u.id,faction:u.faction,x:u.x,y:u.y,cargo:u.cargo,goal:u.goal,stuck:u.stuck,failed:!!u.pathFailed,nearEnemy:g.nearbyEnemies(u,300).length,task:u.truckTask&&{state:u.truckTask.state,request:u.truckTask.request&&{x:u.truckTask.request.x,y:u.truckTask.request.y,kind:u.truckTask.request.kind},dropoff:u.truckTask.dropoff}}))};
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
 offPhysicalDeliveries:sum('off',p=>p.deliveries.filter(d=>d.targetDistance<d.physicalRange).length),onPhysicalDeliveries:sum('on',p=>p.deliveries.filter(d=>d.targetDistance<d.physicalRange).length),
 offFailureUnloads:sum('off',p=>p.deliveries.filter(d=>d.pathFailed&&d.targetDistance>=d.physicalRange).length),onFailureUnloads:sum('on',p=>p.deliveries.filter(d=>d.pathFailed&&d.targetDistance>=d.physicalRange).length),
 offWarsEnded:pairs.filter(p=>p.off.warOver).length,onWarsEnded:pairs.filter(p=>p.on.warOver).length};
console.log(JSON.stringify({kind:'paired_dropoff_real_game_diagnostic',seeds:n,steps:1800,dt:.05,summary,pairs,caveats:['All vehicle unitSpawned events after initial game construction; may include non-logistics sources','Checks exact positions at spawn, not all later movement','90 simulated seconds with normal systems; not a complete war or logistics acceptance','Same seeds may diverge as actions consume random numbers differently','Only dropoff flag differs; safe transport, safe spawn, all vehicle spawn, obstacle planner, vehicle detour, sampled/exact wall sweep and other listed flags enabled in both runs']},null,2));
