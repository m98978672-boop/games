// Paired ordinary wars with a non-adjudicating observation horizon.
// The cap is a measurement stop, not an in-game victory or a draw.
import {loadConfig} from '../src/core/config.js';import {Game} from '../src/sim/game.js';
const arg=n=>process.argv.find(x=>x.startsWith(`--${n}=`))?.slice(n.length+3);
const n=Number(arg('seeds')||20),seconds=Number(arg('seconds')||300);
if(!Number.isSafeInteger(n)||n<1||n>100||!Number.isFinite(seconds)||seconds<=0||seconds>1800)throw Error('bad arguments');
async function run(seed,swap,on){
 const cfg=await loadConfig();cfg.flags.victory_hq_rules_v1=on;cfg.factions[0].persona=cfg.factions[1].persona='balanced';
 const g=new Game({cfg,seed,difficulty:'regular',aiVsAi:true,swapSides:swap});let steps=0;
 for(;steps<Math.ceil(seconds/.1)&&!g.warOver;steps++)g.step(.1);
 const hq=[0,1].map(f=>{const h=g.world.homeHQ(f);return {home:f,owner:h?.owner??null,destroyed:!!h?.structure?.dead};});
 return {on,swap,steps,seconds:g.time,warOver:g.warOver,outcome:g.outcome,hq,kills:g.stats.kills,captures:g.stats.captures,
  deliveries:g.stats.deliveries,alive:[0,1].map(f=>[...g.units.values()].filter(u=>u.alive&&u.faction===f).length)};
}
for(let seed=1;seed<=n;seed++){
 const swap=seed%2===0,first=seed%2===0;const a=await run(seed,swap,first),b=await run(seed,swap,!first);
 const pair={seed,swap,off:a.on?b:a,on:a.on?a:b};console.log(JSON.stringify(pair));
 console.error(`seed ${seed}/${n}: legacy ${pair.off.warOver?pair.off.outcome.reason:'unfinished'}, HQ ${pair.on.warOver?pair.on.outcome.reason:'unfinished'}`);
}
