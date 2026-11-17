// Paired AI games: only tactical_withdraw_v1 differs. Not a balance proof.
import {loadConfig} from '../src/core/config.js';import {Game} from '../src/sim/game.js';
const arg=n=>process.argv.find(x=>x.startsWith(`--${n}=`))?.slice(n.length+3);
const seeds=Number(arg('seeds')||8),seconds=Number(arg('seconds')||180);
if(!Number.isInteger(seeds)||seeds<1||seeds>50||!Number.isFinite(seconds)||seconds<=0||seconds>1800)throw Error('invalid arguments');
async function run(seed,swap,on){
 const cfg=await loadConfig();cfg.flags.tactical_withdraw_v1=on;cfg.flags.alg_deadlock=true;
 const g=new Game({cfg,seed,swapSides:swap,difficulty:'regular',aiVsAi:true});let withdrawals=0;
 g.events.on('tacticalWithdraw',()=>withdrawals++);
 for(let i=0;i<Math.ceil(seconds/.1)&&!g.warOver;i++)g.step(.1);
 return {on,seconds:+g.time.toFixed(2),warOver:g.warOver,outcome:g.outcome,withdrawals,failures:g.deadlockStats?.pathFailures||[0,0],kills:g.stats.kills,captures:g.stats.captures,deliveries:g.stats.deliveries,alive:[0,1].map(f=>[...g.units.values()].filter(u=>u.alive&&u.faction===f).length)};
}
const pairs=[];for(let seed=1;seed<=seeds;seed++){
 const swap=seed%2===0,first=seed%2===0,a=await run(seed,swap,first),b=await run(seed,swap,!first),p={seed,swap,off:first?b:a,on:first?a:b};pairs.push(p);
 console.error(`seed ${seed}: withdrawals=${p.on.withdrawals}; kills=${p.off.kills.join('+')}/${p.on.kills.join('+')}; failures=${p.off.failures.join('+')}/${p.on.failures.join('+')}`);
}
console.log(JSON.stringify({seeds,seconds,pairs,caveats:['Only tactical_withdraw_v1 differs; all other current flags unchanged','Withdrawals count starts, not successful completed retreats','RNG diverges after behavior changes; fixed horizon is not a draw','Delivery may be virtual; no causal or balance claim']},null,2));
