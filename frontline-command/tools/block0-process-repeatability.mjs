// Cross-process reachable-graph diagnostic, not a complete game replay or save format.
// Full serialized snapshots are compared, not only the SHA-256 identifiers.
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createHash } from 'node:crypto';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';
import { loadConfig } from '../src/core/config.js';
import { Game } from '../src/sim/game.js';
import { captureGraph } from './block0-graph-state.mjs';

const value=(name,fallback,min=1,max=10000)=>{
  const matches=process.argv.slice(2).filter(a=>a.startsWith(`--${name}=`));
  if(matches.length>1)throw Error(`duplicate ${name}`);
  const n=matches.length?Number(matches[0].slice(name.length+3)):fallback;
  if(!Number.isSafeInteger(n)||n<min||n>max)throw Error(`invalid ${name}`);
  return n;
};
const digest=s=>createHash('sha256').update(s,'utf8').digest('hex');
const worker=process.argv.includes('--worker');
const ticks=value('ticks',60), seeds=value('seeds',20);
// Test-only fault injection: a divergence must lead to a non-zero exit.
const fault=value('inject-divergence',0,0,ticks);

if(worker){
  const seed=value('seed',1);
  const g=new Game({cfg:await loadConfig(),seed,aiVsAi:true});
  for(let tick=0;tick<=ticks;tick++){
    if(tick)g.step(1/60);
    if(fault && tick===fault)g.time+=0.001;
    const snapshot=captureGraph(g);
    const line=JSON.stringify({seed,tick,bytes:snapshot.bytes,nodes:snapshot.nodes,limitations:snapshot.limitations})+'\n';
    if(!process.stdout.write(line))await once(process.stdout,'drain');
  }
}else{
  async function pair(seed){
    const path=fileURLToPath(import.meta.url);
    const launch=inject=>{
      const args=[path,'--worker',`--seed=${seed}`,`--ticks=${ticks}`];
      if(inject)args.push(`--inject-divergence=${inject}`);
      const p=spawn(process.execPath,args,{stdio:['ignore','pipe','pipe']});
      let stderr='';p.stderr.on('data',chunk=>{stderr+=chunk.toString();});
      // Always subscribe to close immediately, including if the worker exits early.
      const closed=new Promise((resolve,reject)=>{p.once('error',reject);p.once('close',(code,signal)=>resolve({code,signal}));});
      const lines=createInterface({input:p.stdout,crlfDelay:Infinity})[Symbol.asyncIterator]();
      return {p,lines,closed,getStderr:()=>stderr};
    };
    const a=launch(0),b=launch(fault);let mismatch=null,compared=0,lastSha256=null,nodes=0,limitations=[];
    try{
      // Keep reading after mismatch so both workers can finish without blocking on pipes.
      for(let tick=0;tick<=ticks;tick++){
        const [left,right]=await Promise.all([a.lines.next(),b.lines.next()]);
        if(left.done||right.done)throw Error(`worker ended before seed ${seed} tick ${tick}`);
        const x=JSON.parse(left.value),y=JSON.parse(right.value);
        if(x.seed!==seed||y.seed!==seed||x.tick!==tick||y.tick!==tick||typeof x.bytes!=='string'||typeof y.bytes!=='string')throw Error('invalid or out-of-order worker snapshot');
        compared++;nodes=x.nodes;lastSha256=digest(x.bytes);
        limitations=[...new Set([...limitations,...x.limitations,...y.limitations])].sort();
        if(!mismatch&&x.bytes!==y.bytes){
          let offset=0;const end=Math.min(x.bytes.length,y.bytes.length);while(offset<end&&x.bytes[offset]===y.bytes[offset])offset++;
          mismatch={tick,sha256A:lastSha256,sha256B:digest(y.bytes),firstDifferenceOffset:offset};
        }
      }
      const [extraA,extraB]=await Promise.all([a.lines.next(),b.lines.next()]);
      if(!extraA.done||!extraB.done)throw Error('worker produced extra snapshots');
      const [exitA,exitB]=await Promise.all([a.closed,b.closed]);
      if(exitA.code!==0||exitB.code!==0)throw Error(`worker failed: ${JSON.stringify([exitA,exitB])} ${a.getStderr()} ${b.getStderr()}`);
      return {seed,compared,nodes,lastSha256,limitations,mismatch};
    }finally{
      for(const w of [a,b])if(w.p.exitCode===null&&!w.p.killed)w.p.kill();
    }
  }
  const runs=[];
  for(let seed=1;seed<=seeds;seed++){
    const result=await pair(seed);runs.push(result);
    console.error(`seed ${seed}/${seeds}: ${result.mismatch?'DIVERGED at '+result.mismatch.tick:'matched '+result.compared+' snapshots'}`);
  }
  const passed=runs.every(r=>r.compared===ticks+1&&!r.mismatch);
  console.log(JSON.stringify({passed,kind:'independent_node_process_reachable_graph_diagnostic',node:process.version,seeds,ticks,dt:1/60,
    comparison:'Exact serialized snapshots compared; SHA-256 identifiers are reporting only',
    limitations:['Not a complete game state or save format','No player inputs or save/load','Node processes on one machine, not different browsers','Function closures and module globals are not captured','Prototype state and shared typed-array backing identity are not fully represented','Two wall profiling clock fields excluded'],runs},null,2));
  if(!passed)process.exitCode=1;
}
