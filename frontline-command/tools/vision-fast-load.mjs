// Paired simulation-only workload. Runs serially, alternating order; not browser FPS.
import {performance} from 'node:perf_hooks';
import {loadConfig} from '../src/core/config.js';
import {Game} from '../src/sim/game.js';
const seeds=Number(process.argv.find(x=>x.startsWith('--seeds='))?.slice(8)||3),warmup=30,ticks=120;
if(!Number.isInteger(seeds)||seeds<1||seeds>20)throw Error('invalid seeds');
async function run(target,seed,on){
 const cfg=await loadConfig();for(const f of ['vision_nav_policy_v1','group_nav_3to5_v1','arrival_stuck_guard_v1','crowd_slot_avoid_v1','group_nav_pair_v1','bot_obstacle_vision_v1','crowd_nav_v2','door_courtesy_v1','unit_solid_2d_v1'])cfg.flags[f]=true;cfg.flags.vision_nav_fast_v1=on;
 const g=new Game({cfg,seed,difficulty:'regular',aiVsAi:true});
 const count=f=>[...g.units.values()].filter(u=>u.alive&&(f===null||u.faction===f)).length;
 for(const f of [0,1]){let i=0;const hq=g.world.hqOf(f);while(count(f)<target/2){const a=i*2.399963229728653,r=150+(i%10)*20;g.spawnUnit(f,i%11===0?'mg':'infantry',hq.x+Math.cos(a)*r,hq.y+Math.sin(a)*r,{});i++;}}
 const initial=count(null);g._visionPolicyMetrics={};
 for(let i=0;i<warmup;i++)g.step(.1);
 g._visionPolicyMetrics={};let min=count(null),max=min;const samples=[];
 for(let i=0;i<ticks;i++){const start=performance.now();g.step(.1);samples.push(performance.now()-start);const n=count(null);min=Math.min(min,n);max=Math.max(max,n);}
 const sum=samples.reduce((a,b)=>a+b,0),sorted=[...samples].sort((a,b)=>a-b), units=[...g.units.values()];
 return {target,seed,on,initial,minAlive:min,maxAlive:max,finalAlive:count(null),warOver:g.warOver,ticks,meanMs:sum/ticks,p95Ms:sorted[Math.ceil(.95*ticks)-1],maxMs:sorted.at(-1),shots:units.reduce((s,u)=>s+(u.shotsFired||0),0),kills:g.stats.kills,metrics:g._visionPolicyMetrics};
}
const pairs=[];for(const target of [400,500])for(let seed=1;seed<=seeds;seed++){
 const first=seed%2===0,a=await run(target,seed,first),b=await run(target,seed,!first);pairs.push({target,seed,off:first?b:a,on:first?a:b});console.error(target,seed,'ms',pairs.at(-1).off.meanMs,pairs.at(-1).on.meanMs);
}
console.log(JSON.stringify({kind:'vision_fast_paired_node_load',node:process.version,seeds,warmup,ticks,dt:.1,pairs,caveats:['Serial, alternating order, warmed simulation; Node, no rendering or GPU, not browser FPS','Target is initial population; production and deaths may change it','Fast vs slow use all listed experimental flags; shared RNG may diverge','Elapsed times include instrumentation and noise; few seeds, not acceptance']},null,2));
