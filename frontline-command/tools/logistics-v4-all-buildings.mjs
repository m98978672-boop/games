// Isolated physical round trips through real map geometry; no teleport or enemy threat.
import {loadConfig} from '../src/core/config.js';import {Game} from '../src/sim/game.js';
const n=Number(process.argv.find(x=>x.startsWith('--seeds='))?.slice(8)||20);if(!Number.isInteger(n)||n<1||n>100)throw Error('invalid seeds');
async function run(seed,faction,type,on,pointId){
 const cfg=await loadConfig();cfg.flags.safe_logistics_v2=true;cfg.flags.logistics_dropoff_v1=on;cfg.flags.motion_wall_sweep_v1=true;cfg.flags.bot_obstacle_vision_v1=true;cfg.flags.vehicle_detour_v2=true;
 const g=new Game({cfg,seed,aiVsAi:true});g.units.clear();g.unitGrid.clear();g.squads.clear();g.nearbyEnemies=()=>[];g.autopilot.update=()=>{};g.rules.update=()=>{};for(const ai of g.strategic)ai.update=()=>{};g.logistics.createDemand=()=>{};
 const hq=g.world.hqOf(faction), point=g.world.pointById(pointId);
 const spot=g.logistics.vehicleProductionSpot(hq,'truck',hq.x,hq.y);if(!spot||!point)throw Error('missing spot/point');
 const truck=g.spawnUnit(faction,'truck',spot.x,spot.y),req={faction,kind:'sector',sectorId:g.world.sectorAt(point.x,point.y).id,x:point.x,y:point.y,created:0,priority:1};
 g.logistics.requests=[req];let loaded=false,wall=0,speed=0,fails=0,unload=null;
 g.events.on('pathFailed',()=>fails++); const original=g.logistics.unloadTruck.bind(g.logistics);
 g.logistics.unloadTruck=(u,t)=>{unload={x:u.x,y:u.y,request:{x:t.request.x,y:t.request.y},dropoff:t.dropoff&&{...t.dropoff},targetDistance:Math.hypot(u.x-(t.dropoff?.x??t.request.x),u.y-(t.dropoff?.y??t.request.y)),pathFailed:!!u.pathFailed};original(u,t);};
 let tick=0;for(;tick<2000&&!unload;tick++){
  const x=truck.x,y=truck.y,terrain=g.world.speedAt(x,y);g.step(.05);
  if(truck.cargo>0)loaded=true;
  if(Math.hypot(truck.x-x,truck.y-y)>Math.max(truck.speed*terrain,30)*.05*1.5+1e-8)speed++;
  if(g.walls.blocksMove(truck.x,truck.y,truck.radius,truck))wall++;
 }
 return {seed,faction,type,on,ticks:tick,loaded,delivered:g.logistics.delivered[faction],unload,wall,speed,fails,final:{x:truck.x,y:truck.y,goal:truck.goal,failed:!!truck.pathFailed,task:truck.truckTask?.state,cargo:truck.cargo},
   passed:!!unload&&loaded&&unload.targetDistance<(unload.dropoff?34:110)&&!unload.pathFailed&&!wall&&!speed};
}
const sample=new Game({cfg:await loadConfig(),seed:1,aiVsAi:true});
const points=sample.world.points.filter(p=>[0,1].includes(p.owner)&&['hq','city','depot','factory'].includes(p.type)).map(p=>({id:p.id,faction:p.owner,type:p.type}));
let pairs=[];for(const {id,faction,type} of points)for(let seed=1;seed<=n;seed++){
 let off=await run(seed,faction,type,false,id),on=await run(seed,faction,type,true,id);pairs.push({id,type,faction,seed,off,on});console.error(id,seed,off.passed,on.passed);
}
const summary={cases:pairs.length,off:pairs.filter(p=>p.off.passed).length,on:pairs.filter(p=>p.on.passed).length,regressed:pairs.filter(p=>p.off.passed&&!p.on.passed).length,improved:pairs.filter(p=>!p.off.passed&&p.on.passed).length};
console.log(JSON.stringify({kind:'all_owned_building_points_isolated_game_step',seeds:n,summary,pairs,caveats:['one truck, one fixed request; autopilot, strategic AI, threat and new demand disabled','points owned at game start, not all map buildings','sampled collision and speed; not full war','obstacle vision and vehicle detour enabled in both']},null,2));
