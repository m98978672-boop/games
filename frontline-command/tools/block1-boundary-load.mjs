// Serial paired simulation load with alternating order. Not browser FPS.
import {performance} from 'node:perf_hooks';import {resolve,join} from 'node:path';import {pathToFileURL} from 'node:url';
import {loadConfig} from '../src/core/config.js';import {Game} from '../src/sim/game.js';
const arg=n=>process.argv.find(x=>x.startsWith(`--${n}=`))?.slice(n.length+3);
if(!arg('baseline'))throw Error('pass --baseline=/path/to/pre-change/project');
const base=resolve(arg('baseline')),n=Number(arg('seeds')||20),warmup=30,ticks=120;
if(!Number.isSafeInteger(n)||n<1||n>100)throw Error('bad seeds');
const oldCfg=await import(pathToFileURL(join(base,'src/core/config.js'))),oldGame=await import(pathToFileURL(join(base,'src/sim/game.js')));
async function run(target,seed,old){
 const cfg=await(old?oldCfg.loadConfig:loadConfig)(),g=new (old?oldGame.Game:Game)({cfg,seed,aiVsAi:true});
 const count=f=>[...g.units.values()].filter(u=>u.alive&&(f===null||u.faction===f)).length;
 for(const f of [0,1]){let i=0,hq=g.world.hqOf(f);while(count(f)<target/2){let a=i*2.399963229728653,r=150+(i%10)*20;g.spawnUnit(f,i%11===0?'mg':'infantry',hq.x+Math.cos(a)*r,hq.y+Math.sin(a)*r,{});i++;}}
 const initial=count(null);for(let i=0;i<warmup;i++)g.step(.1);const samples=[];let min=count(null),max=min;
 for(let i=0;i<ticks;i++){let t=performance.now();g.step(.1);samples.push(performance.now()-t);let c=count(null);min=Math.min(min,c);max=Math.max(max,c);}
 samples.sort((a,b)=>a-b);
 return {initial,minAlive:min,maxAlive:max,finalAlive:count(null),warOver:g.warOver,meanMs:samples.reduce((a,b)=>a+b,0)/ticks,p95Ms:samples[Math.ceil(.95*ticks)-1]};
}
const pairs=[];
for(const target of [400,500])for(let seed=1;seed<=n;seed++){
 const oldFirst=seed%2===1,a=await run(target,seed,oldFirst),b=await run(target,seed,!oldFirst);
 pairs.push({target,seed,before:oldFirst?a:b,after:oldFirst?b:a});
 console.error(target,seed,'before',pairs.at(-1).before.meanMs.toFixed(2),'after',pairs.at(-1).after.meanMs.toFixed(2));
}
const summary=[400,500].map(target=>{const ps=pairs.filter(p=>p.target===target);return {target,beforeMeanMs:ps.reduce((s,p)=>s+p.before.meanMs,0)/ps.length,afterMeanMs:ps.reduce((s,p)=>s+p.after.meanMs,0)/ps.length};});
console.log(JSON.stringify({summary,pairs,node:process.version,warmup,ticks,dt:.1,caveats:['Node simulation only, not FPS or browser GPU','Serial alternating order, no render or external input; workloads can evolve differently','Population changes during run; results are not acceptance or confidence intervals','Pre-change source snapshot supplied separately']},null,2));
