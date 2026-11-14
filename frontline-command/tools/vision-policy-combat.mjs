// Bounded paired AI encounter; not a full war or a win-rate acceptance test.
import { performance } from 'node:perf_hooks';
import { loadConfig } from '../src/core/config.js';
import { Game } from '../src/sim/game.js';
const seeds=Number(process.env.SEEDS||20),firstSeed=Number(process.env.FIRST_SEED||1),steps=600,dt=.05;
if(!Number.isSafeInteger(seeds)||seeds<1||seeds>100||!Number.isSafeInteger(firstSeed)||firstSeed<1)throw Error('invalid seed range');

async function run(seed,on){
  const cfg=await loadConfig();cfg.flags.vision_nav_policy_v1=on;cfg.flags.bot_obstacle_vision_v1=true;cfg.flags.crowd_nav_v2=true;cfg.flags.door_courtesy_v1=true;cfg.flags.unit_solid_2d_v1=true;
  cfg.factions[0].persona=cfg.factions[1].persona='balanced';
  const g=new Game({cfg,seed,aiVsAi:true,difficulty:'regular'});if(on)g._visionPolicyMetrics={};
  // Match the existing symmetric duel placement. Normal game systems remain active.
  g.squads.clear();
  for(const faction of [0,1]){
    const cx=faction?2396:1700,cy=faction?1700:2396,sign=faction?-1:1;
    [...g.units.values()].filter(u=>u.faction===faction&&u.alive).forEach((u,i)=>{
      u.x=cx+sign*((i%5)*24-48);u.y=cy+sign*(Math.floor(i/5)*24-48);u.squadId=null;
    });
  }
  let contactSamples=0,observations=0,pathFailures=0,wallGoalFailures=0,firstWallGoalFailure=null;
  g.events.on('pathFailed',e=>{pathFailures++;if(e.reason==='goal_blocked_by_wall'){wallGoalFailures++;if(!firstWallGoalFailure)firstWallGoalFailure=e;}});const start=performance.now();let ticks=0;
  for(;ticks<steps&&!g.warOver;ticks++){
    g.step(dt);
    if(ticks%10===9)for(const u of g.units.values())if(u.alive&&!u.downed&&!u.playerControlled){observations++;if(u.perception.hasContact)contactSamples++;}
  }
  const sumUnits=fn=>[...g.units.values()].reduce((sum,u)=>sum+fn(u),0);
  return {seed,on,ticks,time:g.time,warOver:g.warOver,outcome:g.outcome,alive:[0,1].map(f=>[...g.units.values()].filter(u=>u.alive&&u.faction===f).length),
    policyMetrics:g._visionPolicyMetrics||null,pathFailures,wallGoalFailures,firstWallGoalFailure,kills:g.stats.kills,losses:g.stats.losses,shots:sumUnits(u=>u.shotsFired||0),contactSamples,observations,
    elapsedMs:performance.now()-start};
}
const pairs=[];
for(let seed=firstSeed;seed<firstSeed+seeds;seed++){
  const first=seed%2===0,a=await run(seed,first),b=await run(seed,!first);
  pairs.push({seed,off:first?b:a,on:first?a:b});console.error(`seed ${seed}/${seeds}: shots off/on ${pairs.at(-1).off.shots}/${pairs.at(-1).on.shots}`);
}
const summary={pairs:pairs.length,offShots:pairs.reduce((a,p)=>a+p.off.shots,0),onShots:pairs.reduce((a,p)=>a+p.on.shots,0),
  offKills:pairs.reduce((a,p)=>a+p.off.kills[0]+p.off.kills[1],0),onKills:pairs.reduce((a,p)=>a+p.on.kills[0]+p.on.kills[1],0),
  offContacts:pairs.reduce((a,p)=>a+p.off.contactSamples,0),onContacts:pairs.reduce((a,p)=>a+p.on.contactSamples,0),
  offPathFailures:pairs.reduce((a,p)=>a+p.off.pathFailures,0),onPathFailures:pairs.reduce((a,p)=>a+p.on.pathFailures,0),onWallGoalFailures:pairs.reduce((a,p)=>a+p.on.wallGoalFailures,0),endedOff:pairs.filter(p=>p.off.warOver).length,endedOn:pairs.filter(p=>p.on.warOver).length};
console.log(JSON.stringify({kind:'paired_vision_policy_short_encounter_diagnostic',seeds,firstSeed,steps,dt,summary,pairs,
  caveats:['Vision selector off/on; obstacle, crowd, courtesy and solid flags enabled in both runs','One symmetric placement, 30 seconds, 20 seeds; not 100 complete wars','Same seed but shared RNG consumption can differ after decisions diverge','Counts are descriptive, not a confidence interval, equivalence test or balance proof','Contact sampled every 10 steps','Node execution time includes instrumentation and is not browser FPS','Normal production/strategic/autopilot remain enabled; no published game is changed']},null,2));
if(pairs.length!==seeds||pairs.some(p=>p.off.ticks!==steps||p.on.ticks!==steps))process.exitCode=1;
