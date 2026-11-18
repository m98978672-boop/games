// Fixed paired seeds/factions, same scene and default flags; enable only listed
// existing experimental algorithms. This is a diagnostic, not acceptance.
import {spawnSync} from 'node:child_process';
const arg=process.argv.find(s=>s.startsWith('--attempts='));const n=arg?Number(arg.slice(11)):20;
if(!Number.isInteger(n)||n<1||n>100)throw Error('attempts 1..100');
const gameStep=process.argv.includes('--game-step');const sharedGoal=process.argv.includes('--shared-goal');
const presets={
 baseline:[],
 courtesy:['door_courtesy_v1'],
 pair:['door_pair_lanes_v1'],
 crowd:['crowd_nav_v2'],
 smart:['smart_route_v2'],
 obstacle:['bot_obstacle_vision_v1'],
 visionCourtesy:['vision_nav_policy_v1','door_courtesy_v1'],
 visionGroup:['vision_nav_policy_v1','crowd_nav_v2','group_nav_3to5_v1','group_nav_pair_v1','door_courtesy_v1'],
 courtesySmart:['door_courtesy_v1','smart_route_v2'],
};
const runs={};
for(const [name,flags] of Object.entries(presets)){
 const a=['tools/opposing-columns.mjs',`--attempts=${n}`,`--flags=${flags.join(',')}`];if(gameStep)a.push('--game-step');if(sharedGoal)a.push('--shared-goal');
 const p=spawnSync(process.execPath,a,{encoding:'utf8',timeout:180000,maxBuffer:8*1024*1024});
 if(p.error || ![0,1].includes(p.status))throw Error(`${name}: ${p.error||p.stderr}`);
 const r=JSON.parse(p.stdout);if(r.scenes!==2*n || r.sharedGoal!==sharedGoal || r.flags.join(',')!==flags.join(','))throw Error(`${name}: invalid report`);
 runs[name]=r;
 console.error(`${name}: ${r.passed}/${r.scenes}, arrived=${r.results.reduce((s,x)=>s+x.arrived,0)}, yields=${r.results.reduce((s,x)=>s+x.courtesyYields,0)}`);
}
const baseline=runs.baseline.results;
const summaries={};for(const [name,run] of Object.entries(runs)){
 const xs=run.results;
 const sum=k=>xs.reduce((n,x)=>n+x[k],0);
 summaries[name]={flags:run.flags,scenes:run.scenes,passed:run.passed,arrived:sum('arrived'),crossed:sum('crossed'),failed:sum('failed'),unfinished:6*run.scenes-sum('arrived')-sum('failed'),
  overlapFrames:sum('overlapFrames'),wallEndpointViolations:sum('walls'),wallSweepViolations:sum('sweptWalls'),speedViolations:sum('speed'),
  changedGoalSamples:sum('changedGoalSamples'),courtesyYields:sum('courtesyYields'),crowdFrames:sum('crowdFrames'),pairFrames:sum('pairFrames'),routeFrames:sum('routeFrames'),
  improvedScenes:xs.filter((x,i)=>x.arrived>baseline[i].arrived).length,regressedScenes:xs.filter((x,i)=>x.arrived<baseline[i].arrived).length};
}
console.log(JSON.stringify({attemptsPerFaction:n,gameStep,sharedGoal,summaries,runs,caveats:['Fixed 3 vs 3 infantry, one HQ door, either close distinct goals or a common goal per side; no combat, vehicles or docks',
 'Game.step freezes thinking and disables other subsystems; manual mode advances movement in a fixed order',
 'Safety is sampled after each full tick; sweep is checked retrospectively against the current door state',
 'Goal changes are counted as samples, not events; courtesy counts returned yield decisions, not successful passage',
 'Per-algorithm comparisons share initial seed, but RNG streams can diverge after decisions change']},null,2));
