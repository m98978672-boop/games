// Bounded graph comparison; NOT complete replay, save/load, or cross-browser proof.
import { loadConfig } from '../src/core/config.js';
import { Game } from '../src/sim/game.js';
import { captureGraph, graphId } from './block0-graph-state.mjs';
const number=(name,def)=>{const x=process.argv.find(a=>a.startsWith(`--${name}=`));const n=x?Number(x.slice(name.length+3)):def;if(!Number.isSafeInteger(n)||n<1||n>10000)throw Error(`invalid ${name}`);return n;};
const seeds=number('seeds',20),ticks=number('ticks',60),runs=[];
for(let seed=1;seed<=seeds;seed++){
  const a=new Game({cfg:await loadConfig(),seed,aiVsAi:true}),b=new Game({cfg:await loadConfig(),seed,aiVsAi:true});
  let divergence=null,lastId=null,limitations=[],compared=0,nodes=0;
  for(let tick=0;tick<=ticks;tick++){
    if(tick){a.step(1/60);b.step(1/60);}
    const sa=captureGraph(a),sb=captureGraph(b);compared++;lastId=graphId(sa.bytes);nodes=sa.nodes;
    limitations=[...new Set([...limitations,...sa.limitations,...sb.limitations])].sort();
    if(sa.bytes!==sb.bytes){let pos=0;const limit=Math.min(sa.bytes.length,sb.bytes.length);while(pos<limit&&sa.bytes[pos]===sb.bytes[pos])pos++;
      divergence={tick,idA:lastId,idB:graphId(sb.bytes),firstDifferenceOffset:pos,contextA:sa.bytes.slice(Math.max(0,pos-80),pos+100),contextB:sb.bytes.slice(Math.max(0,pos-80),pos+100)};break;}
  }
  runs.push({seed,compared,nodes,lastId,limitations,divergence});
  console.error(`seed ${seed}/${seeds}: ${divergence?'DIVERGED':'matched '+compared+' snapshots'}`);
}
const passed=runs.every(r=>r.compared===ticks+1&&!r.divergence);
console.log(JSON.stringify({passed,kind:'bounded_reachable_graph_diagnostic',node:process.version,dt:1/60,seeds,ticks,
  comparison:'Exact serialized graphs compared, FNV-1a 32-bit reported only as diagnostic identifier',
  limitations:['same process, Node only; not independent browsers or replay','no commands from player','function closure and external module state unavailable','prototype state and shared typed-array backing identity not fully represented','wall profiling clock fields intentionally excluded','not a complete save format'],runs},null,2));
if(!passed)process.exitCode=1;
