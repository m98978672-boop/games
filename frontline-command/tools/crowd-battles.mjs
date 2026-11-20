// Observational short wars, not a win-rate or performance acceptance test.
import {loadConfig} from '../src/core/config.js';
import {Game} from '../src/sim/game.js';
const count=Number(process.argv.find(x=>x.startsWith('--seeds='))?.slice(8)||8);
if(!Number.isSafeInteger(count)||count<1||count>100)throw Error('bad seed count');
const results=[];
for(let seed=1;seed<=count;seed++){
 const cfg=await loadConfig(),g=new Game({cfg,seed,aiVsAi:true,difficulty:'regular'});
 const began=performance.now();let contactSamples=0,combatSearchSamples=0,combatRouteSamples=0,openGroupSamples=0,ticks=0;
 for(;ticks<1200&&!g.warOver;ticks++){
  g.step(.1);
  if(ticks%10===0){
   for(const u of g.units.values())if(u.alive&&!u.downed){if(u._crowdOpenGroup)openGroupSamples++;if(u.perception.hasContact)contactSamples++;if(u._smartRoute?.combatTarget)combatRouteSamples++;}
   if(g._smartRouteState?.active?.combatTarget)combatSearchSamples++;
  }
 }
 results.push({seed,ticks,warOver:g.warOver,winner:g.outcome?.winner??null,kills:g.stats.kills,losses:g.stats.losses,
  alive:[0,1].map(f=>[...g.units.values()].filter(u=>u.alive&&u.faction===f).length),contactSamples,combatSearchSamples,combatRouteSamples,openGroupSamples,elapsedMs:Math.round(performance.now()-began)});
 console.error(`seed ${seed}/${count} done`);
}
console.log(JSON.stringify({kind:'short_normal_war_diagnostic',secondsLimit:120,seeds:count,results,
 caveats:['Normal initial setup and game systems, Node only; each seed is paired externally with the same seed on the baseline source',
 'Decisions change RNG consumption after divergence; samples are once per second, not event counts',
 'Eight short wars do not establish balance, win rate, browser FPS or universal pathfinding reliability']},null,2));
