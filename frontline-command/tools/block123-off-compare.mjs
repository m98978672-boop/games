// Exact reachable graph, flag-off vs explicit pre-turn source snapshot.
import {readFile} from 'node:fs/promises';import {createHash} from 'node:crypto';import {resolve,join} from 'node:path';import {pathToFileURL} from 'node:url';
import {loadConfig} from '../src/core/config.js';import {Game} from '../src/sim/game.js';import {captureGraph} from './block0-graph-state.mjs';
const arg=n=>process.argv.find(x=>x.startsWith(`--${n}=`))?.slice(n.length+3);
if(!arg('baseline'))throw Error('pass --baseline=/path/to/pre-turn/project');
const base=resolve(arg('baseline')),n=Number(arg('seeds')||20),ticks=Number(arg('ticks')||60);
if(!Number.isSafeInteger(n)||n<1||n>100||!Number.isSafeInteger(ticks)||ticks<1||ticks>1000)throw Error('bad arguments');
const oldCfg=await import(pathToFileURL(join(base,'src/core/config.js'))),oldGame=await import(pathToFileURL(join(base,'src/sim/game.js')));
const sha=x=>createHash('sha256').update(x).digest('hex'),files={};
for(const f of ['src/sim/game.js','src/sim/ai_soldier.js','src/sim/units.js','src/sim/walls.js','src/sim/world.js','src/sim/build.js','src/sim/solid_units.js','src/sim/crowd_nav.js','data/feature_flags.json'])files[f]=sha(await readFile(join(base,f)));
const flags=['wall_remove_destroyed_v1','crowd_swept_units_v1','crowd_slot_exchange_v1','door_occupied_guard_v1','crowd_group_survivor_v1','victory_hq_rules_v1'],runs=[];
for(const mode of ['default','existing-movement-experiments'])for(let seed=1;seed<=n;seed++){
 const a=await oldCfg.loadConfig(),b=await loadConfig();
 const absent=[];
 for(const id of flags){if(b.flags[id]!==false)throw Error(`unexpected ${id}`);if(!(id in a.flags)){delete b.flags[id];absent.push(id);}else if(a.flags[id]!==false)throw Error(`baseline ${id} must be off`);}
 b.raw.feature_flags.flags=b.raw.feature_flags.flags.filter(x=>!absent.includes(x.id));
 if(mode==='existing-movement-experiments')for(const id of ['crowd_nav_v2','vision_nav_policy_v1','group_nav_3to5_v1','arrival_stuck_guard_v1','crowd_slot_avoid_v1','group_nav_pair_v1','door_pair_lanes_v1','unit_solid_2d_v1','wall_engineer_repair_v1'])a.flags[id]=b.flags[id]=true;
 const ga=new oldGame.Game({cfg:a,seed,aiVsAi:true}),gb=new Game({cfg:b,seed,aiVsAi:true});let mismatch=null,compared=0;
 for(let t=0;t<=ticks;t++){if(t){ga.step(1/60);gb.step(1/60);}const x=captureGraph(ga).bytes,y=captureGraph(gb).bytes;compared++;if(x!==y){mismatch={tick:t,before:sha(x),after:sha(y)};break;}}
 runs.push({mode,seed,compared,mismatch});console.error(mode,seed,mismatch?'DIVERGED':'matched');
}
const passed=runs.every(r=>!r.mismatch&&r.compared===ticks+1);
console.log(JSON.stringify({passed,seeds:n,ticks,dt:1/60,baselineFilesSha256:files,runs,caveats:['Node, no render or external input, 60 short fixed steps','Only off flags absent from the baseline are removed from the new test config and raw metadata; both game graphs otherwise compared in full','Wall timing fields excluded; closures, module globals, prototypes and shared buffers not fully represented','Pre-turn baseline snapshot must be supplied separately; not proof for every possible game']},null,2));
if(!passed)process.exitCode=1;
