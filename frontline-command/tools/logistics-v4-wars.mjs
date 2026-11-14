// Normal AI games, paired by seed. Optional synthetic building requests: no AI disabled.
import {loadConfig} from '../src/core/config.js';
import {Game} from '../src/sim/game.js';
const seeds=Number(process.argv.find(x=>x.startsWith('--seeds='))?.slice(8)||2);
const firstSeed=Number(process.argv.find(x=>x.startsWith('--first-seed='))?.slice(13)||1);
const seconds=Number(process.argv.find(x=>x.startsWith('--seconds='))?.slice(10)||900);
const inject=process.argv.includes('--building-requests');
if(!Number.isInteger(seeds)||seeds<1||seeds>100||!Number.isInteger(firstSeed)||firstSeed<1||!Number.isFinite(seconds)||seconds<=0||seconds>1800)throw Error('invalid options');
const flags=['vision_nav_policy_v1','crowd_nav_v2','group_nav_3to5_v1','arrival_stuck_guard_v1','crowd_slot_avoid_v1','group_nav_pair_v1','vision_nav_fast_v1','motion_slide_guard_v1','near_goal_direct_v1','door_courtesy_v1','unit_solid_2d_v1','safe_vehicle_spawn_v1','vehicle_pickup_exterior_v1','motion_wall_sweep_v1','bot_obstacle_vision_v1','vehicle_detour_v2'];
async function run(seed,on){
 const cfg=await loadConfig();for(const f of flags)cfg.flags[f]=true;
 for(const f of ['vehicle_spawn_all_v1','logistics_dropoff_v1','motion_wall_exact_v1'])cfg.flags[f]=on;
 const g=new Game({cfg,seed,aiVsAi:true,difficulty:'regular'});const deliveries=[];const injected=[];let pathFailures=0,wallBreaches=0;
 g.events.on('pathFailed',()=>pathFailures++);g.events.on('wallBreach',()=>wallBreaches++);
 const unload=g.logistics.unloadTruck.bind(g.logistics);
 g.logistics.unloadTruck=(u,t)=>{const p=t.dropoff||t.request; deliveries.push({time:g.time,building:!!g.walls.buildingAtPoint(t.request.x,t.request.y),injected:injected.includes(t.request),distance:Math.hypot(u.x-p.x,u.y-p.y),range:t.dropoff?34:110,failed:!!u.pathFailed,cargo:u.cargo});return unload(u,t);};
 let virtual=0,virtualInjected=0,physical=0;g.events.on('supplyDelivered',({req})=>{if(g._v4unloading)physical++;else {virtual++;if(injected.includes(req))virtualInjected++;}});
 const current=g.logistics.unloadTruck;g.logistics.unloadTruck=(u,t)=>{g._v4unloading=true;try{return current(u,t);}finally{g._v4unloading=false;}};
 let samples=0,loaded=0,nearEnemy=0;
 for(let i=0;i<Math.ceil(seconds/.1)&&!g.warOver;i++){
  if(inject&&i===100)for(const faction of [0,1]){
   const p=g.world.points.find(p=>p.type==='city'&&p.owner===faction),sector=g.world.sectorAt(p.x,p.y);
   const req={faction,kind:'sector',sectorId:sector.id,x:p.x,y:p.y,created:g.time,priority:3};injected.push(req);g.logistics.requests.push(req);
  }
  g.step(.1);if(i%10===0)for(const u of g.units.values())if(u.alive&&u.role==='truck'){samples++;if(u.cargo>0){loaded++;if(g.nearbyEnemies(u,300).length)nearEnemy++;}}
 }
 return {seed,on,seconds:g.time,warOver:g.warOver,outcome:g.outcome,kills:g.stats.kills,captures:g.stats.captures,deliveries,physical,virtual,virtualInjected,pathFailures,wallBreaches,samples,loaded,nearEnemy,pendingInjected:injected.filter(r=>g.logistics.requests.includes(r)).length,aliveTrucks:g.logistics.trucksOf(0).length+g.logistics.trucksOf(1).length};
}
for(let seed=firstSeed;seed<firstSeed+seeds;seed++){
 let a=await run(seed,seed%2===0),b=await run(seed,seed%2!==0);let pair={seed,off:a.on?b:a,on:a.on?a:b};
 console.log(JSON.stringify(pair));console.error(`seed ${seed} done, ended ${pair.off.warOver}/${pair.on.warOver}, deliveries ${pair.off.physical}/${pair.on.physical}`);
}
