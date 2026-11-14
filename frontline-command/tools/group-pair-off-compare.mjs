// Compare flag-off to an explicitly supplied pre-change source snapshot.
// This is not a complete state proof: see graph serializer limitations.
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { loadConfig } from '../src/core/config.js';
import { Game } from '../src/sim/game.js';
import { captureGraph } from './block0-graph-state.mjs';
const argv=process.argv.slice(2), value=name=>argv.find(x=>x.startsWith(`--${name}=`))?.slice(name.length+3);
if(!value('baseline'))throw Error('pass --baseline=/absolute/path/to/pre-change/project-snapshot');
const baseline=resolve(value('baseline')),seeds=Number(value('seeds')||20),ticks=Number(value('ticks')||60);
if(!Number.isSafeInteger(seeds)||seeds<1||seeds>1000||!Number.isSafeInteger(ticks)||ticks<1||ticks>10000)throw Error('invalid count');
const oldConfig=await import(pathToFileURL(join(baseline,'src/core/config.js')));
const oldGame=await import(pathToFileURL(join(baseline,'src/sim/game.js')));
const sha=s=>createHash('sha256').update(s).digest('hex');
const inputs={};for(const name of ['src/sim/ai_soldier.js','src/sim/units.js','data/feature_flags.json'])inputs[name]=sha(await readFile(join(baseline,name)));
const runs=[];
for(let seed=1;seed<=seeds;seed++){
  const old=await oldConfig.loadConfig(),cfg=await loadConfig();
  if(cfg.flags.group_nav_pair_v1!==false||cfg.flags.vision_nav_fast_v1!==false)throw Error('new flags not default-off');
  // The new configuration record itself is not simulation behavior. Remove it
  // from the current test copy so the rest of the graph is directly comparable.
  delete cfg.flags.group_nav_pair_v1;delete cfg.flags.vision_nav_fast_v1;
  cfg.raw.feature_flags.flags=cfg.raw.feature_flags.flags.filter(f=>f.id!=='group_nav_pair_v1'&&f.id!=='vision_nav_fast_v1');
  for(const name of ['vision_nav_policy_v1','crowd_nav_v2','group_nav_3to5_v1','arrival_stuck_guard_v1','crowd_slot_avoid_v1']){old.flags[name]=true;cfg.flags[name]=true;}
  const a=new oldGame.Game({cfg:old,seed,aiVsAi:true}),b=new Game({cfg,seed,aiVsAi:true});
  let mismatch=null,compared=0,lastSha=null;
  for(let tick=0;tick<=ticks;tick++){
    if(tick){a.step(1/60);b.step(1/60);}
    const x=captureGraph(a).bytes,y=captureGraph(b).bytes;compared++;lastSha=sha(x);
    if(x!==y){mismatch={tick,shaBefore:lastSha,shaAfter:sha(y)};break;}
  }
  runs.push({seed,compared,lastSha,mismatch});console.error(`seed ${seed}/${seeds}: ${mismatch?'DIVERGED':'matched'}`);
}
const passed=runs.every(r=>!r.mismatch&&r.compared===ticks+1);
console.log(JSON.stringify({passed,kind:'prechange_vs_new_flag_off_graph_comparison',seeds,ticks,dt:1/60,baselineFilesSha256:inputs,runs,
  caveats:['Same Node process and no user input or browser','Exact reachable graph strings compared; hashes are identifiers','New flag config entry removed from new test config; vision selector and crowd enabled on both sides','Function closures, module globals, prototypes and shared typed-array backing identity not fully captured','Two wall timing fields excluded','Pre-change source snapshot must be supplied separately']},null,2));
if(!passed)process.exitCode=1;
