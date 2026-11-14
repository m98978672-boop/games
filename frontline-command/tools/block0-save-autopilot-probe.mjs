// Test-only causal probe: replay exactly one step from two independently loaded
// copies, differing only in an in-memory autopilot timer override. No production
// save format or game logic is changed; this is not a proposed complete fix.
import { loadConfig } from '../src/core/config.js';
import { Game } from '../src/sim/game.js';
import { Save } from '../src/core/save.js';
import { captureGraph } from './block0-graph-state.mjs';
const opt=process.argv.slice(2).filter(x=>x.startsWith('--seeds='));
if(opt.length>1)throw Error('duplicate seeds');
const seeds=opt.length?Number(opt[0].slice(8)):20;
if(!Number.isSafeInteger(seeds)||seeds<1||seeds>1000)throw Error('invalid seeds');
const storage=new Map();globalThis.localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)};
const results=[];
for(let seed=1;seed<=seeds;seed++){
  const cfgs=await Promise.all([loadConfig(),loadConfig(),loadConfig()]);cfgs.forEach(c=>c.flags.alg_save=true);
  const [source,a,b]=cfgs.map(cfg=>new Game({cfg,seed,aiVsAi:true,difficulty:'regular'}));
  for(let i=0;i<120;i++)source.step(1/60);
  if(source.warOver||!Save.saveWar(source))throw Error('save failed');
  const saved=Save.loadWar();
  if(!Save.applyWar(a,structuredClone(saved))||!Save.applyWar(b,structuredClone(saved)))throw Error('load failed');
  if(captureGraph(a).bytes!==captureGraph(b).bytes)throw Error(`loaded twins differ before intervention, seed ${seed}`);
  const loadedTimer=a.autopilot.timer??null,sourceTimer=source.autopilot.timer;
  if(!Number.isFinite(sourceTimer))throw Error('missing source timer');
  b.autopilot.timer=sourceTimer;
  const step=g=>{
    const issued=[];g.events.on('orderIssued',({order})=>issued.push({type:order.type,faction:order.faction,source:order.source}));
    const beforeRng=g.rng.s;g.step(1/60);
    return {beforeRng,afterRng:g.rng.s,timer:g.autopilot.timer,issued};
  };
  const normal=step(a),override=step(b);
  const creates=x=>x.issued.filter(o=>o.type==='create_squad');
  const ordinaryCreates=creates(normal),overrideCreates=creates(override);
  const reproduced=loadedTimer===null&&sourceTimer>1/60&&ordinaryCreates.length===2&&overrideCreates.length===0&&
    [0,1].every(f=>ordinaryCreates.some(x=>x.faction===f));
  results.push({seed,sourceTimer,loadedTimer,identicalLoadedGraphsBeforeIntervention:true,normal,override,reproduced});
  console.error(`seed ${seed}/${seeds}: loaded create_squad ${ordinaryCreates.length}, timer override ${overrideCreates.length}`);
}
const reproduced=results.every(r=>r.reproduced);
console.log(JSON.stringify({kind:'save_autopilot_timer_counterfactual',reproduced,seeds,saveFlag:true,saveAfterTicks:120,observedTicks:1,results,
  limitations:['Only alg_save=true AI-vs-AI scene in one Node process','Overrides only an in-memory value in one of two loaded twins, not a save-format change','Effects shown for first step only; other state remains unrestored','Captured graph cannot observe closures or all module globals','Does not establish a complete save/load fix or explain every later difference']},null,2));
if(!reproduced)process.exitCode=1;
