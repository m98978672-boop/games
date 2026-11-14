// Initial armies and explicit armor squad/reinforcement, 20 seed, both factions.
import {loadConfig} from '../src/core/config.js';import {Game} from '../src/sim/game.js';
const n=Number(process.argv.find(x=>x.startsWith('--seeds='))?.slice(8)||20);if(!Number.isInteger(n)||n<1||n>100)throw Error('invalid seeds');
async function run(seed,on){
 const cfg=await loadConfig();cfg.flags.vehicle_spawn_all_v1=on;cfg.flags.safe_vehicle_spawn_v1=true;
 const g=new Game({cfg,seed,aiVsAi:true}),initial=[...g.units.values()].filter(u=>u.alive&&u.isVehicle).map(u=>({id:u.id,blocked:g.walls.blocksMove(u.x,u.y,u.radius,u),overlap:[...g.units.values()].filter(v=>v!==u&&v.alive&&!v.downed&&Math.hypot(u.x-v.x,u.y-v.y)<u.radius+v.radius).map(v=>v.id)}));
 const events=[];g.events.on('unitSpawned',({unit:u})=>{const near=[...g.units.values()].filter(v=>v!==u&&v.alive&&!v.downed&&(u.isVehicle||v.isVehicle)&&Math.hypot(u.x-v.x,u.y-v.y)<u.radius+v.radius);events.push({role:u.role,isVehicle:u.isVehicle,overlap:near.map(v=>v.id),blocked:u.isVehicle&&g.walls.blocksMove(u.x,u.y,u.radius,u)});});
 const actions=[];for(const f of [0,1]){
  const a=g.createSquadAtBase(f,'armor',{free:true});actions.push({f,create:a.ok,reinforce:null});
  if(a.ok){const v=a.squad.units().find(u=>u.isVehicle);if(v){v.alive=false;actions.at(-1).reinforce=g.reinforceSquad(a.squad).ok;}}
 }
 return {seed,on,initial,actions,events};
}
const pairs=[];for(let seed=1;seed<=n;seed++)pairs.push({seed,off:await run(seed,false),on:await run(seed,true)});
const sum=(m,fn)=>pairs.reduce((a,p)=>a+fn(p[m]),0);
const summary={pairs:n,offInitialOverlap:sum('off',x=>x.initial.filter(u=>u.overlap.length).length),onInitialOverlap:sum('on',x=>x.initial.filter(u=>u.overlap.length).length),offInitialWalls:sum('off',x=>x.initial.filter(u=>u.blocked).length),onInitialWalls:sum('on',x=>x.initial.filter(u=>u.blocked).length),offSpawnOverlap:sum('off',x=>x.events.filter(u=>u.overlap.length).length),onSpawnOverlap:sum('on',x=>x.events.filter(u=>u.overlap.length).length),offSpawnWalls:sum('off',x=>x.events.filter(u=>u.blocked).length),onSpawnWalls:sum('on',x=>x.events.filter(u=>u.blocked).length),offCreated:sum('off',x=>x.actions.filter(a=>a.create).length),onCreated:sum('on',x=>x.actions.filter(a=>a.create).length),offReinforced:sum('off',x=>x.actions.filter(a=>a.reinforce).length),onReinforced:sum('on',x=>x.actions.filter(a=>a.reinforce).length)};
console.log(JSON.stringify({kind:'vehicle_spawn_source_tests',seeds:n,summary,pairs,caveats:['Initial overlaps sampled after constructor; later events capture both newly spawned infantry and newly spawned vehicles','Two armor squads and reinforcements per seed, no ordinary Game.step; explicitly induced losses','Initial infantry overlaps not involving vehicles excluded','Flag-off RNG and placements may diverge after initial spawn']},null,2));
if(summary.onInitialOverlap||summary.onInitialWalls||summary.onSpawnOverlap||summary.onSpawnWalls||summary.onCreated!==n*2||summary.onReinforced!==n*2)process.exitCode=1;
