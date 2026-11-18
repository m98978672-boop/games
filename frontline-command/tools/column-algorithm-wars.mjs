// Paired unmodified AI games: compare baseline to courtesy, smart route
// and obstacle-vision routing. One fixed flag set per candidate, no forced events.
import {loadConfig} from '../src/core/config.js';import {Game} from '../src/sim/game.js';
const arg=n=>process.argv.find(s=>s.startsWith(`--${n}=`))?.slice(n.length+3);
const seeds=Number(arg('seeds')||8),seconds=Number(arg('seconds')||180);
if(!Number.isInteger(seeds)||seeds<1||seeds>50||!Number.isFinite(seconds)||seconds<=0||seconds>1800)throw Error('invalid arguments');
const presets={courtesy:['door_courtesy_v1'],smart:['smart_route_v2'],obstacle:['bot_obstacle_vision_v1']};
async function run(seed,swap,flags){
 const cfg=await loadConfig();for(const flag of flags)cfg.flags[flag]=true;cfg.flags.alg_deadlock=true;
 const g=new Game({cfg,seed,swapSides:swap,difficulty:'regular',aiVsAi:true});g._courtesyMetrics={yields:0};
 let infantryFailures=0,truckFailures=0,tankFailures=0;
 g.events.on('pathFailed',e=>{if(e.role==='truck')truckFailures++;else if(e.role==='tank')tankFailures++;else infantryFailures++;});
 for(let i=0;i<Math.ceil(seconds/.1)&&!g.warOver;i++)g.step(.1);
 return {flags,seconds:+g.time.toFixed(2),warOver:g.warOver,outcome:g.outcome,yields:g._courtesyMetrics.yields,infantryFailures,truckFailures,tankFailures,failures:g.deadlockStats?.pathFailures||[0,0],kills:g.stats.kills,captures:g.stats.captures,deliveries:g.stats.deliveries,alive:[0,1].map(f=>[...g.units.values()].filter(u=>u.alive&&u.faction===f).length)};
}
const results={};for(const [name,flags] of Object.entries(presets)){
 const pairs=[];for(let seed=1;seed<=seeds;seed++){
  const swap=seed%2===0,first=seed%2===0,a=await run(seed,swap,first?flags:[]),b=await run(seed,swap,first?[]:flags);
  const pair={seed,swap,off:first?b:a,on:first?a:b};pairs.push(pair);
  console.error(`${name} ${seed}: yields=${pair.on.yields} failures=${pair.off.failures.join('+')}/${pair.on.failures.join('+')} deliveries=${pair.off.deliveries.join('+')}/${pair.on.deliveries.join('+')}`);
 }
 results[name]={flags,pairs};
}
console.log(JSON.stringify({seeds,seconds,results,caveats:['Each pair differs only by listed experimental flags, diagnostics enabled in both',
 'Yield decisions are repeated function returns, not necessarily actual movement or success',
 'Fixed horizon is not a draw. Diverging decisions alter RNG, so differences are not causal proof',
 'Deliveries can be virtual; no claim of balance, absence of congestion or universal safety']},null,2));
