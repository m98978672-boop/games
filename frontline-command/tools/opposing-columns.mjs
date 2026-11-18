// Diagnostic only: two opposing 3-person columns through one HQ door. Does
// not cover ten-person opposing columns, vehicles, docks or combat AI.
import {loadConfig} from '../src/core/config.js';
import {Game} from '../src/sim/game.js';
import {moveAlongFlow,updateTimers} from '../src/sim/units.js';
import {emptyOverlapMetrics,observeOverlaps} from '../tests/acceptance/overlap-metrics.mjs';
const arg=process.argv.find(s=>s.startsWith('--attempts='));const n=arg?Number(arg.slice(11)):20;
if(!Number.isInteger(n)||n<1||n>100)throw Error('attempts 1..100');
const seedStart=Number(process.argv.find(s=>s.startsWith('--seed-start='))?.slice(13)||1);
if(!Number.isInteger(seedStart)||seedStart<1||seedStart>100000)throw Error('seed-start 1..100000');
const allowed = ['door_courtesy_v1','door_pair_lanes_v1','crowd_nav_v2','vision_nav_policy_v1',
 'vision_nav_fast_v1','smart_route_v2','bot_obstacle_vision_v1','group_nav_pair_v1','group_nav_3to5_v1',
 'crowd_slot_avoid_v1','arrival_stuck_guard_v1','wall_goal_guard_v1','motion_wall_sweep_v1','motion_wall_exact_v1'];
const raw=process.argv.find(s=>s.startsWith('--flags='))?.slice(8)||'';
const flags=raw?raw.split(','):[];
if(flags.some(f=>!allowed.includes(f))||new Set(flags).size!==flags.length)throw Error('unsupported or duplicate flag');
const gameStep=process.argv.includes('--game-step');
const sharedGoal=process.argv.includes('--shared-goal');
const columnSize=Number(process.argv.find(s=>s.startsWith('--column-size='))?.slice(14)||3);
const doorIndex=Number(process.argv.find(s=>s.startsWith('--door-index='))?.slice(13)||0);
if(![3,4].includes(columnSize)||![0,1].includes(doorIndex))throw Error('column-size 3 or 4; door-index 0 or 1');
// Yuka is a dev dependency, loaded only by this opt-in diagnostic.
const weightArg=process.argv.find(s=>s.startsWith('--yuka-separation='));
const yukaWeight=weightArg?Number(weightArg.slice('--yuka-separation='.length)):0;
const maxNeighborsArg=process.argv.find(s=>s.startsWith('--yuka-max-neighbors='));
const yukaMaxNeighbors=maxNeighborsArg?Number(maxNeighborsArg.slice('--yuka-max-neighbors='.length)):Infinity;
if(!Number.isFinite(yukaWeight)||yukaWeight<0||yukaWeight>100||yukaMaxNeighbors<0||(!Number.isInteger(yukaMaxNeighbors)&&yukaMaxNeighbors!==Infinity))throw Error('invalid Yuka parameters');
const Yuka=yukaWeight?await import('yuka'):null;
const orca=process.argv.includes('--orca');
const tree=process.argv.includes('--behavior-tree');
const recast=process.argv.includes('--recast');
const pibt=process.argv.includes('--pibt');
const bridge=process.argv.includes('--cooperative-bridge');
const identity=process.argv.includes('--steering-identity');
if(bridge&&(orca||tree||pibt||recast||yukaWeight||identity))throw Error('bridge cannot be combined with other diagnostic steering');
if(pibt && (sharedGoal || gameStep || recast))throw Error('PIBT diagnostic supports fixed separate goals and no Recast only');
const pibtAdapter=pibt?await import('./experiments/pibt-adapter.mjs'):null;
const recastAdapter=recast?await import('./experiments/recast-adapter.mjs'):null;
const external=(orca||tree)?await import('./experiments/external-crowd.mjs'):null;
const bridgeAdapter=bridge?await import('./experiments/cooperative-bridge.mjs'):null;
if(identity&&Yuka)throw Error('choose either identity or Yuka');
const cfg=await loadConfig();for(const flag of flags)cfg.flags[flag]=true;
const results=[];
for(const faction of [0,1])for(let seed=seedStart;seed<seedStart+n;seed++){
 const g=new Game({cfg,seed,aiVsAi:true});g.units.clear();g.unitGrid.clear();g.occupancyGrid.clear();g.squads.clear();
 g._courtesyMetrics={yields:0};
 const steeringMetrics={calls:0,withNeighbors:0,changed:0};
 if(identity)g._experimentalSteering=(_u,dx,dy)=>{steeringMetrics.calls++;return {x:dx,y:dy};};
 if(Yuka){
  const behavior=new Yuka.SeparationBehavior(), vehicle=new Yuka.Vehicle(), force=new Yuka.Vector3();
  g._experimentalSteering=(u,dx,dy)=>{
   steeringMetrics.calls++;
   vehicle.position.set(u.x,0,u.y);
   vehicle.neighbors=g.unitGrid.queryRange(u.x,u.y,55).filter(v=>v!==u&&v.alive&&!v.downed&&Math.hypot(v.x-u.x,v.y-u.y)<55)
    .map(v=>({position:new Yuka.Vector3(v.x,0,v.y)}));
   if(vehicle.neighbors.length)steeringMetrics.withNeighbors++;
   if(vehicle.neighbors.length>yukaMaxNeighbors){steeringMetrics.suppressed=(steeringMetrics.suppressed||0)+1;return {x:dx,y:dy};}
   force.set(0,0,0);behavior.calculate(vehicle,force);
   if(Math.hypot(force.x,force.z)>1e-9)steeringMetrics.changed++;
   return {x:dx+force.x*yukaWeight,y:dy+force.z*yukaWeight};
  };
 }
 if(gameStep){
  for(const sys of [g.squadAI,...g.strategic,g.autopilot,g.rules,g.build,g.influence,g.api,g.logistics])sys.update=()=>{};
  g.checkVictory=()=>{};
 }
 const b=g.world.buildings.find(b=>b.type==='hq'&&b.faction===faction&&g.walls.state(b)),o=g.walls.state(b).outline.openings.filter(o=>o.type==='door')[doorIndex];
 const x=b.x+o.cx,y=b.y+o.cy,units=[];
 for(const side of [-1,1])for(let i=0;i<columnSize;i++){
  const u=g.spawnUnit(faction,'infantry',x+side*o.nx*(45+i*22),y+side*o.ny*(45+i*22));
  const targetDistance=sharedGoal?85:58+i*20;
  u.goal={x:x-side*o.nx*targetDistance,y:y-side*o.ny*targetDistance};u.activity='advance';u.arrived=false;u.thinkTimer=10000;units.push({u,side,goal:{...u.goal}});
 }
 const externalMetrics=external?await external.installExternalSteering(g,{orca,tree,units,door:{x,y,nx:o.nx,ny:o.ny}}):null;
 const recastExperiment=recast?recastAdapter.installRecast(g,units,{x,y},b,o):null;
 const pibtExperiment=pibt?pibtAdapter.installPibt(g,units,{x,y},b,o,seed):null;
 const bridgeMetrics=bridge?await bridgeAdapter.installCooperativeBridge(g):null;
 const crossed=new Set(),overlaps=emptyOverlapMetrics();let walls=0,speed=0,sweptWalls=0,changedGoals=0,crowdFrames=0,pairFrames=0,routeFrames=0;
 let immediateSweepHits=0,immediateSweepMoves=0;const immediateSweepExamples=[],sweptExamples=[];
 // Observe each normal/rescue move immediately, before another unit can change a door.
 g._motionDiagnostic=(u,fromX,fromY,toX,toY,stage)=>{
  if(Math.hypot(toX-fromX,toY-fromY)<1e-9)return;
  immediateSweepMoves++;
  if(g.walls.blocksMoveSweep(fromX,fromY,toX,toY,u.radius,u)){
   immediateSweepHits++;if(immediateSweepExamples.length<3)immediateSweepExamples.push({id:u.id,stage,from:[fromX,fromY],to:[toX,toY],door:g.walls.state(b).doors[o.id].state});
  }
 };
 for(let tick=0;tick<1200;tick++){
  pibtExperiment?.advance();
  const before=units.map(({u})=>({x:u.x,y:u.y,speed:u.speed*g.world.speedAt(u.x,u.y)}));
  if(gameStep) g.step(.05);
  else {
   g.time+=.05;g.nav.advance();g.walls.update(.05);
   for(const {u} of units){if(u.arrived||u.pathFailed)continue;updateTimers(g,u,.05);moveAlongFlow(g,u,.05);g.unitGrid.update(u);}
  }
  for(let i=0;i<units.length;i++){
   const {u,side,goal}=units[i],old=before[i];
   if(((u.x-x)*o.nx+(u.y-y)*o.ny)*side<0)crossed.add(u.id);
   if(g.walls.blocksMove(u.x,u.y,u.radius,u))walls++;
   if(g.walls.blocksMoveSweep(old.x,old.y,u.x,u.y,u.radius,u)){sweptWalls++;if(sweptExamples.length<3)sweptExamples.push({tick,id:u.id,from:[old.x,old.y],to:[u.x,u.y],door:g.walls.state(b).doors[o.id].state});}
   if(Math.hypot(u.x-old.x,u.y-old.y)>Math.max(old.speed,30)*.05*1.5+1e-8)speed++;
   if(u.goal && (u.goal.x!==goal.x||u.goal.y!==goal.y))changedGoals++;
   if(u._crowdActive)crowdFrames++;if(u._doorPass)pairFrames++;if(u._smartRoute)routeFrames++;
  }
  observeOverlaps(units.map(v=>v.u),overlaps);
  if(units.every(v=>v.u.arrived||v.u.pathFailed))break;
 }
 const arrived=units.filter(v=>v.u.arrived&&!v.u.pathFailed).length,failed=units.filter(v=>v.u.pathFailed).length;
 results.push({faction,seed,arrived,failed,crossed:crossed.size,walls,sweptWalls,sweptExamples,immediateSweepMoves,immediateSweepHits,immediateSweepExamples,speed,changedGoalSamples:changedGoals,crowdFrames,pairFrames,routeFrames,courtesyYields:g._courtesyMetrics.yields,steeringMetrics,externalMetrics,recastMetrics:recastExperiment?.metrics||null,pibtMetrics:pibtExperiment?.metrics||null,bridgeMetrics,overlapFrames:overlaps.overlapFrames,seconds:+g.time.toFixed(2)});
 recastExperiment?.dispose();
}
const passed=results.filter(r=>r.arrived===columnSize*2&&r.crossed===columnSize*2&&!r.failed&&!r.walls&&!r.sweptWalls&&!r.speed&&!r.changedGoalSamples&&!r.overlapFrames).length;
console.log(JSON.stringify({method:`two opposing ${columnSize}-person infantry columns, HQ door ${doorIndex}, ${gameStep?'Game.step with other systems disabled and thinking frozen':'manual movement ticks'}, no combat`,flags,sharedGoal,columnSize,doorIndex,yukaSeparationWeight:yukaWeight,scenes:results.length,passed,coverageComplete:false,results},null,2));
if(passed!==results.length)process.exitCode=1;
