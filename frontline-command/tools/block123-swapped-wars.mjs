// War outcomes after fixing swapped starting ownership. Checkpoint one pair
// per line. Existing victory rules are still legacy, so not final acceptance.
import {loadConfig} from '../src/core/config.js';import {Game} from '../src/sim/game.js';
const arg=n=>process.argv.find(x=>x.startsWith(`--${n}=`))?.slice(n.length+3);
const n=Number(arg('seeds')||50),first=Number(arg('first-seed')||1),seconds=Number(arg('seconds')||900);
if(!Number.isSafeInteger(n)||n<1||n>100||!Number.isSafeInteger(first)||first<1||!Number.isFinite(seconds)||seconds<=0||seconds>1800)throw Error('bad arguments');
async function run(seed,swap){
 const cfg=await loadConfig();cfg.factions[0].persona=cfg.factions[1].persona='balanced';
 const g=new Game({cfg,seed,aiVsAi:true,difficulty:'regular',swapSides:swap});
 let steps=0;for(;steps<Math.ceil(seconds/.1)&&!g.warOver;steps++)g.step(.1);
 return {swap,steps,seconds:g.time,warOver:g.warOver,outcome:g.outcome,kills:g.stats.kills,captures:g.stats.captures,
 deliveries:g.stats.deliveries,alive:[0,1].map(f=>[...g.units.values()].filter(u=>u.alive&&u.faction===f).length)};
}
for(let seed=first;seed<first+n;seed++){
 const a=await run(seed,seed%2===0),b=await run(seed,seed%2!==0),pair={seed,normal:a.swap?b:a,swapped:a.swap?a:b};
 console.log(JSON.stringify(pair));console.error(`seed ${seed}: normal=${pair.normal.outcome?.winner??'unfinished'}, swapped=${pair.swapped.outcome?.winner??'unfinished'}`);
}
