// One physical truck, real map, both factions, no combat/autopilot. Diagnostic only.
import {loadConfig} from '../src/core/config.js';import {Game} from '../src/sim/game.js';
const n=Number(process.argv.find(x=>x.startsWith('--seeds='))?.slice(8)||4);
if(!Number.isSafeInteger(n)||n<1||n>100)throw Error('invalid seeds');
async function run(seed,faction,type,on){
 const cfg=await loadConfig();cfg.flags.vehicle_exterior_v1=on;cfg.flags.tank_tactical_v1=false;cfg.flags.alg_deadlock=true;
 if(process.argv.includes('--detour'))cfg.flags.vehicle_detour_v2=true;
 if(process.argv.includes('--vision'))cfg.flags.bot_obstacle_vision_v1=true;
 if(process.argv.includes('--truck-assist'))cfg.flags.truck_route_assist_v1=true;
 const g=new Game({cfg,seed,aiVsAi:true});g.units.clear();g.unitGrid.clear();g.squads.clear();g.nearbyEnemies=()=>[];
 const hq=g.world.hqOf(faction),p=type==='hq'?hq:g.world.points.find(p=>p.type===type&&p.owner===faction);
 const spot=g.logistics.vehicleProductionSpot(hq,'truck',hq.x,hq.y);if(!spot||!p)throw Error('missing point');
 const u=g.spawnUnit(faction,'truck',spot.x,spot.y),req={faction,kind:'sector',sectorId:g.world.sectorAt(p.x,p.y).id,x:p.x,y:p.y,created:0,priority:1};
 g.logistics.requests=[req];let loaded=false,unloaded=null,wall=0,speed=0,failed=0;
 g.events.on('pathFailed',e=>{if(e.unitId===u.id)failed++;});const original=g.logistics.unloadTruck.bind(g.logistics);
 g.logistics.unloadTruck=(t,task)=>{const dest=task.dropoff||task.request;unloaded={x:t.x,y:t.y,distance:Math.hypot(t.x-dest.x,t.y-dest.y),range:task.dropoff?34:110,pathFailed:!!t.pathFailed};original(t,task);};
 for(let tick=0;tick<2000&&!unloaded;tick++){
   const x=u.x,y=u.y,v=Math.max(u.speed*g.world.speedAt(x,y),30)*.05*1.5;g.time+=.05;g.nav.advance();g.walls.update(.05);g.logistics.moveTrucks(.05);g.unitGrid.update(u);
   loaded ||= u.cargo>0;if(g.walls.blocksMove(u.x,u.y,u.radius,u))wall++;if(Math.hypot(u.x-x,u.y-y)>v+1e-8)speed++;
 }
 return {on,loaded,unloaded,wall,speed,failed,seconds:+g.time.toFixed(2),remainingCargo:u.cargo,
  physical:!!unloaded&&loaded&&unloaded.distance<unloaded.range&&!unloaded.pathFailed&&!wall&&!speed,
  falseDelivery:!!unloaded&&(unloaded.distance>=unloaded.range||unloaded.pathFailed)};
}
const pairs=[];for(const type of ['hq','city','depot'])for(const faction of [0,1])for(let seed=1;seed<=n;seed++)pairs.push({type,faction,seed,off:await run(seed,faction,type,false),on:await run(seed,faction,type,true)});
const summary={total:pairs.length,offPhysical:pairs.filter(p=>p.off.physical).length,onPhysical:pairs.filter(p=>p.on.physical).length,offFalse:pairs.filter(p=>p.off.falseDelivery).length,onFalse:pairs.filter(p=>p.on.falseDelivery).length,offLoaded:pairs.filter(p=>p.off.loaded).length,onLoaded:pairs.filter(p=>p.on.loaded).length,onWallFrames:pairs.reduce((s,p)=>s+p.on.wall,0),onSpeedFrames:pairs.reduce((s,p)=>s+p.on.speed,0),regressions:pairs.filter(p=>p.off.physical&&!p.on.physical).length};
console.log(JSON.stringify({seeds:n,summary,pairs,caveats:['isolated truck and fixed destination; no combat, other units, production or complete Game.step','100 simulated seconds; no proof of global pathfinding or real-game balance']},null,2));
