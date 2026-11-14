// Paired smoke test in real Game.step AI-vs-AI, not win-rate acceptance.
import { performance } from 'node:perf_hooks';
import { loadConfig } from '../src/core/config.js';
import { Game } from '../src/sim/game.js';
const seeds=20,ticks=600,dt=.05;
async function run(seed,on){
  const cfg=await loadConfig();cfg.flags.bot_obstacle_vision_v1=on;cfg.flags.smart_route_v2=false;
  const g=new Game({cfg,seed,aiVsAi:true,difficulty:'regular'});
  let failures=0,jobStarts=0,lastJob=null;const routed=new Set(), jobs=new Set();
  g.events.on('pathFailed',()=>failures++);
  const begin=performance.now();let steps=0;
  for(;steps<ticks&&!g.warOver;steps++){
    g.step(dt);
    const active=g._smartRouteState?.active;
    if(active&&active!==lastJob)jobStarts++;
    if(active)jobs.add(active);
    lastJob=active||null;
    for(const u of g.units.values())if(u._smartRoute)routed.add(u.id);
  }
  const elapsed=performance.now()-begin;
  return {seed,on,steps,seconds:g.time,warOver:g.warOver,outcome:g.outcome,
    alive:[0,1].map(f=>[...g.units.values()].filter(u=>u.faction===f&&u.alive).length),
    kills:g.stats.kills,losses:g.stats.losses,orders:g.api.stats.issued,failures,jobStarts,routedUnits:routed.size,
    observedJobs:[...jobs].reduce((m,j)=>{const k=j.planner.status+(j.planner.reason?`:${j.planner.reason}`:'');m[k]=(m[k]||0)+1;return m;},{}),
    stock:g.logistics.stock,elapsedMs:elapsed,meanMs:elapsed/(steps||1)};
}
const pairs=[];
for(let seed=1;seed<=seeds;seed++){
  // Alternate order to reduce, not eliminate, warmup bias.
  const first=seed%2===0, a=await run(seed,first),b=await run(seed,!first);
  pairs.push({seed,off:first?b:a,on:first?a:b});console.error(`seed ${seed}/${seeds}: on routes=${pairs.at(-1).on.routedUnits} jobs=${pairs.at(-1).on.jobStarts}`);
}
const sums={onActiveSeeds:pairs.filter(p=>p.on.jobStarts>0).length,onRoutedSeeds:pairs.filter(p=>p.on.routedUnits>0).length,
  warEndedOff:pairs.filter(p=>p.off.warOver).length,warEndedOn:pairs.filter(p=>p.on.warOver).length,
  offMeanMs:pairs.reduce((n,p)=>n+p.off.meanMs,0)/seeds,onMeanMs:pairs.reduce((n,p)=>n+p.on.meanMs,0)/seeds};
console.log(JSON.stringify({kind:'paired_battle_smoke',seeds,ticks,dt,summary:sums,pairs,
  limitations:['short AI-vs-AI runs; not 100 complete wars or win-rate/confidence intervals','common RNG means different decisions can shift random draws','one machine Node timing includes measurement and route counters, not stable FPS or device acceptance','no keyboard/player or save/load','Jobs only observed at tick boundaries; same-tick starts and completions can be missed','not an equivalence or non-inferiority test']},null,2));
if(pairs.length!==seeds||pairs.some(p=>p.off.steps!==ticks||p.on.steps!==ticks||p.off.warOver||p.on.warOver))process.exitCode=1;
