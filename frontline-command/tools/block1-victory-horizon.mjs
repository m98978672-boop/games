// Observation-only horizon for the experimental victory rules; no adjudication.
import {loadConfig} from '../src/core/config.js';import {Game} from '../src/sim/game.js';
const arg=n=>process.argv.find(x=>x.startsWith(`--${n}=`))?.slice(n.length+3);
const n=Number(arg('seeds')||20),seconds=Number(arg('seconds')||900);
if(!Number.isSafeInteger(n)||n<1||n>100||!Number.isFinite(seconds)||seconds<=0||seconds>1800)throw Error('bad arguments');
for(let seed=1;seed<=n;seed++){
 const cfg=await loadConfig();cfg.flags.victory_hq_rules_v1=true;cfg.factions[0].persona=cfg.factions[1].persona='balanced';
 const swap=seed%2===0,g=new Game({cfg,seed,difficulty:'regular',aiVsAi:true,swapSides:swap});let steps=0;
 for(;steps<Math.ceil(seconds/.1)&&!g.warOver;steps++)g.step(.1);
 const record={seed,swap,steps,seconds:g.time,warOver:g.warOver,outcome:g.outcome,
  hq:[0,1].map(f=>{const p=g.world.homeHQ(f);return {home:f,owner:p?.owner??null,destroyed:!!p?.structure?.dead};}),
  kills:g.stats.kills,captures:g.stats.captures,alive:[0,1].map(f=>[...g.units.values()].filter(u=>u.alive&&u.faction===f).length)};
 console.log(JSON.stringify(record));console.error(`seed ${seed}/${n}: ${g.warOver?g.outcome.reason:'unfinished'}`);
}
