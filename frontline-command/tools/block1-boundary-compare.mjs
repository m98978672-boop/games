// Compare simulation state except the deliberately refreshed unitGrid against
// an explicitly supplied pre-change checkout; not a complete replay proof.
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {loadConfig} from '../src/core/config.js';
import {Game} from '../src/sim/game.js';
import {captureGraph} from './block0-graph-state.mjs';
const arg=name=>process.argv.find(x=>x.startsWith(`--${name}=`))?.slice(name.length+3);
if(!arg('baseline'))throw Error('pass --baseline=/path/to/pre-change/project');
const base=resolve(arg('baseline')),seeds=Number(arg('seeds')||20),ticks=Number(arg('ticks')||60);
if(!Number.isSafeInteger(seeds)||seeds<1||seeds>100||!Number.isSafeInteger(ticks)||ticks<1||ticks>1000)throw Error('invalid count');
const oldConfig=await import(pathToFileURL(join(base,'src/core/config.js'))),oldGame=await import(pathToFileURL(join(base,'src/sim/game.js')));
const sha=x=>createHash('sha256').update(x).digest('hex');
const files={};for(const f of ['src/sim/game.js','src/sim/units.js','src/sim/ai_soldier.js','data/feature_flags.json'])files[f]=sha(await readFile(join(base,f)));
const runs=[];
for(let seed=1;seed<=seeds;seed++){
 const a=new oldGame.Game({cfg:await oldConfig.loadConfig(),seed,aiVsAi:true}),b=new Game({cfg:await loadConfig(),seed,aiVsAi:true});
 let divergence=null,compared=0;
 for(let t=0;t<=ticks;t++){
  if(t){a.step(1/60);b.step(1/60);}
  const x=captureGraph(a,{excludeUnitGrid:true}).bytes,y=captureGraph(b,{excludeUnitGrid:true}).bytes;compared++;
  if(x!==y){divergence={tick:t,before:sha(x),after:sha(y)};break;}
 }
 runs.push({seed,compared,divergence});console.error(`seed ${seed}: ${divergence?'DIVERGED':'matched'}`);
}
const passed=runs.every(x=>!x.divergence&&x.compared===ticks+1);
console.log(JSON.stringify({passed,seeds,ticks,dt:1/60,baselineFilesSha256:files,runs,
 caveats:['Node with no render or external input, default feature flags','Unit grid excluded intentionally; external queries may differ','Wall profiling clocks excluded','Function closures, module globals, prototypes and shared typed-array backing identity not fully represented','Pre-change checkout supplied separately']},null,2));
if(!passed)process.exitCode=1;
