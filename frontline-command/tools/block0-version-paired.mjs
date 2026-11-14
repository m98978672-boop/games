// Paired UI flag diagnostic. The UI flag itself and documented wall profiling
// clocks are excluded from the graph; all other reachable data is compared.
import { loadConfig } from '../src/core/config.js';
import { Game } from '../src/sim/game.js';
import { captureGraph, graphId } from './block0-graph-state.mjs';
const id='build_version_badge_v1',seeds=20,ticks=60,runs=[];
for(let seed=1;seed<=seeds;seed++){
  const off=await loadConfig(),on=await loadConfig();off.flags[id]=false;on.flags[id]=true;
  const a=new Game({cfg:off,seed,aiVsAi:true}),b=new Game({cfg:on,seed,aiVsAi:true});
  let divergence=null,compared=0;
  for(let tick=0;tick<=ticks;tick++){
    if(tick){a.step(1/60);b.step(1/60);}
    const aa=captureGraph(a,{excludeFlagIds:[id]}),bb=captureGraph(b,{excludeFlagIds:[id]});compared++;
    if(aa.bytes!==bb.bytes){divergence={tick,idOff:graphId(aa.bytes),idOn:graphId(bb.bytes)};break;}
  }
  runs.push({seed,compared,divergence});
  console.error(`seed ${seed}/${seeds}: ${divergence?'DIVERGED':'matched'}`);
}
const passed=runs.every(x=>!x.divergence&&x.compared===ticks+1);
console.log(JSON.stringify({passed,seeds,ticks,dt:1/60,mode:'20 paired seeds; flag off vs on; exact reachable-graph comparison',
  exclusions:['cfg.flags.build_version_badge_v1','wall performance clock fields'],
  limitations:['Node, no render/input','function closures/module globals/prototypes and shared backing buffers not fully represented','no performance confidence intervals','not proof of bitwise legacy before this code change'],runs},null,2));
if(!passed)process.exitCode=1;
