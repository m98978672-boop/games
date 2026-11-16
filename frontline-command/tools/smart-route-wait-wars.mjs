// Paired ordinary war observation. The horizon stops measurement; it is not a draw.
import {loadConfig} from '../src/core/config.js';
import {Game} from '../src/sim/game.js';
const arg=n=>process.argv.find(x=>x.startsWith(`--${n}=`))?.slice(n.length+3);
const seeds=Number(arg('seeds')||4),seconds=Number(arg('seconds')||180);
if(!Number.isSafeInteger(seeds)||seeds<1||seeds>100||!Number.isFinite(seconds)||seconds<=0||seconds>1800)throw Error('bad arguments');
async function run(seed,swap,wait){
  const cfg=await loadConfig();cfg.flags.smart_route_v2=true;cfg.flags.smart_route_wait_v1=wait;cfg.flags.alg_deadlock=true;
  cfg.factions[0].persona=cfg.factions[1].persona='balanced';
  const g=new Game({cfg,seed,difficulty:'regular',aiVsAi:true,swapSides:swap});
  const jobs=new Set();let activeTicks=0;
  for(let i=0;i<Math.ceil(seconds/.1)&&!g.warOver;i++){
    g.step(.1);const job=g._smartRouteState?.active;if(job){jobs.add(job);activeTicks++;}
  }
  return {wait,seconds:+g.time.toFixed(2),warOver:g.warOver,outcome:g.outcome,kills:g.stats.kills,
    captures:g.stats.captures,deliveries:g.stats.deliveries,pathFailures:g.deadlockStats?.pathFailures||[0,0],
    activeSearchesObserved:jobs.size,activeSearchTicks:activeTicks,
    alive:[0,1].map(f=>[...g.units.values()].filter(u=>u.alive&&u.faction===f).length)};
}
const pairs=[];
for(let seed=1;seed<=seeds;seed++){
  const swap=seed%2===0,first=seed%2===0,a=await run(seed,swap,first),b=await run(seed,swap,!first);
  const p={seed,swap,off:a.wait?b:a,on:a.wait?a:b};pairs.push(p);
  console.error(`seed ${seed}/${seeds}: failures ${p.off.pathFailures.join('/')} -> ${p.on.pathFailures.join('/')}, searches ${p.off.activeSearchesObserved}/${p.on.activeSearchesObserved}`);
}
console.log(JSON.stringify({kind:'smart_route_wait_paired_wars',seeds,seconds,pairs,
  limitations:['experimental smart_route_v2 enabled in both groups; waiting is the only toggled flag',
    'observation horizon is not an adjudicated draw; battle and RNG streams can diverge',
    'search counts are sampled after game steps, so short searches may not be counted',
    'not a full balance, browser FPS, save or soak acceptance']},null,2));
