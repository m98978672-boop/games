// Диагностика отдельных входящих колонн: две геометрии, размеры, отклонения и стороны.
// Это не замена полной приёмки или встречных потоков.
import { loadConfig } from '../src/core/config.js';
import { Game } from '../src/sim/game.js';
const cfg=await loadConfig();
const autopilot=process.argv.includes('--autopilot');
const n=Number(process.argv.find(x=>x.startsWith('--seeds='))?.slice(8)||20);if(!Number.isSafeInteger(n)||n<1||n>100)throw Error('invalid seeds');
cfg.flags.crowd_nav_v2=true;
function scenario(type,faction,seed,count,jitter,on) {
  cfg.flags.vision_nav_policy_v1=true;cfg.flags.group_nav_3to5_v1=true;cfg.flags.arrival_stuck_guard_v1=true;cfg.flags.crowd_slot_avoid_v1=true;cfg.flags.group_nav_pair_v1=true;cfg.flags.vision_nav_fast_v1=true;cfg.flags.safe_vehicle_spawn_v1=true;cfg.flags.motion_slide_guard_v1=true;cfg.flags.near_goal_direct_v1=true;cfg.flags.motion_wall_sweep_v1=true;cfg.flags.vehicle_pickup_exterior_v1=true;cfg.flags.logistics_dropoff_v1=on;cfg.flags.motion_wall_exact_v1=on;cfg.flags.vehicle_spawn_all_v1=on;
  const game=new Game({cfg,seed,aiVsAi:true});
  game.units.clear();game.unitGrid.clear();game.squads.clear();if(!autopilot)game.autopilot.update=()=>{};if(on)game._visionPolicyMetrics={};
  const building=game.world.buildings.find(b=>b.type===type&&b.faction===faction&&game.walls.state(b));
  const opening=building && game.walls.state(building).outline.openings.find(o=>o.type==='door');
  if(!opening) throw new Error(`missing ${type} door faction ${faction}`);
  const px=building.x+opening.cx,py=building.y+opening.cy;
  const units=Array.from({length:count},(_,i)=>{
    const side=(i%2 ? -1:1)*jitter, distance=55+i*24;
    const u=game.spawnUnit(faction,'infantry',px+opening.nx*distance-opening.ny*side,py+opening.ny*distance+opening.nx*side);
    u.goal={x:px-opening.nx*100,y:py-opening.ny*100};u.activity='advance';u.arrived=false;u.thinkTimer=100;return u;
  });
  let collisions=0, speed=0, overlapFrames=0, otherOverlapFrames=0;const crossed=new Set(),ids=new Set(units.map(u=>u.id));
  for(let tick=0;tick<600;tick++){
    const before=units.map(u=>({x:u.x,y:u.y,terrain:game.world.speedAt(u.x,u.y)}));game.step(.05);
    for(let i=0;i<units.length;i++){
      const u=units[i],p=before[i];
      if((u.x-px)*opening.nx+(u.y-py)*opening.ny<0)crossed.add(u.id);
      if(Math.hypot(u.x-p.x,u.y-p.y)>Math.max(u.speed*p.terrain,30)*.05*1.5+1e-8)speed++;
      if(game.walls.blocksMove(u.x,u.y,u.radius,u))collisions++;
    }
    if(units.some((a,i)=>units.slice(i+1).some(b=>Math.hypot(a.x-b.x,a.y-b.y)<a.radius+b.radius)))overlapFrames++;
    const others=[...game.units.values()].filter(v=>!ids.has(v.id)&&v.alive&&!v.downed);
    if(units.some(a=>others.some(b=>Math.hypot(a.x-b.x,a.y-b.y)<a.radius+b.radius)))otherOverlapFrames++;
    if(units.every(u=>u.arrived||u.pathFailed))break;
  }
  const arrived=units.filter(u=>u.arrived&&!u.pathFailed).length;
  return {type,faction,seed,count,jitter,arrived,crossed:crossed.size,collisions,speed,overlapFrames,otherOverlapFrames,policyMetrics:game._visionPolicyMetrics||null,
    passed:arrived===count&&crossed.size===count&&!collisions&&!speed&&!overlapFrames};
}
const pairs=[];
for(const type of ['hq','city'])for(const faction of [0,1])for(let seed=1;seed<=n;seed++)
  for(const count of [3,4,5])for(const jitter of [0,8,16]) {
    const off=scenario(type,faction,seed,count,jitter,false),on=scenario(type,faction,seed,count,jitter,true);
    pairs.push({type,faction,seed,count,jitter,off,on});
  }
const summary={total:pairs.length,offPassed:pairs.filter(p=>p.off.passed).length,onPassed:pairs.filter(p=>p.on.passed).length,
  regressed:pairs.filter(p=>p.off.passed&&!p.on.passed).length,improved:pairs.filter(p=>!p.off.passed&&p.on.passed).length,
  offArrived:pairs.reduce((s,p)=>s+p.off.arrived,0),onArrived:pairs.reduce((s,p)=>s+p.on.arrived,0),
  offOverlap:pairs.reduce((s,p)=>s+p.off.overlapFrames,0),onOverlap:pairs.reduce((s,p)=>s+p.on.overlapFrames,0),
  offOtherOverlapCases:pairs.filter(p=>p.off.otherOverlapFrames>0).length,onOtherOverlapCases:pairs.filter(p=>p.on.otherOverlapFrames>0).length,
  offAllUnitSafePass:pairs.filter(p=>p.off.passed&&!p.off.otherOverlapFrames).length,onAllUnitSafePass:pairs.filter(p=>p.on.passed&&!p.on.otherOverlapFrames).length};
console.log(JSON.stringify({kind:'logistics_v3_all_group_step_paired',seeds:n,summary,pairs,caveats:['Dropoff, exact wall sweep and all-source vehicle spawn off/on; wall sweep, pickup, motion slide and near goal on; safe spawn, vision-fast, pair-group, crowd-nav, vision selector, small-group, arrival guard and slot avoidance on in both runs',
 autopilot?'Real doors, full Game.step and shuffled order; unit think timers delayed, autopilot remains enabled':'Real doors, full Game.step and shuffled order; unit think timers and autopilot disabled, no combat','Goals fixed and 3-5 aligned entrants; tracked-other-unit overlap reported separately and not hidden in the original criterion','No combat or full game acceptance']},null,2));
if(summary.regressed||summary.onPassed!==pairs.length)process.exitCode=1;
