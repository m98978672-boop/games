// Diagnostic only: compare original vs save/load continuation. No game code changed.
// 'passed' means the bounded sampled projections and checkpoint graphs matched;
// it cannot prove a full replay or correctness for other scenarios.
import { createHash } from 'node:crypto';
import { loadConfig } from '../src/core/config.js';
import { Game } from '../src/sim/game.js';
import { Save } from '../src/core/save.js';
import { captureGraph } from './block0-graph-state.mjs';
const arg=(name,def)=>{const x=process.argv.slice(2).filter(s=>s.startsWith(`--${name}=`));if(x.length>1)throw Error(`duplicate ${name}`);const n=x.length?Number(x[0].slice(name.length+3)):def;if(!Number.isSafeInteger(n)||n<1||n>10000)throw Error(`invalid ${name}`);return n;};
const seeds=arg('seeds',20),before=arg('before',120),after=arg('after',120);
const storage=new Map();globalThis.localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)};
const hash=s=>createHash('sha256').update(s,'utf8').digest('hex');
const unitKeys=['id','faction','role','x','y','vx','vy','hp','alive','downed','bleed','squadId','state','activity','targetId','goal','arrived','pathFailed','facing','aimAngle','mag','reserve','cool','reloadT','reloading','morale','suppression','stuck','cargo','cargoType'];
const squadKeys=['id','faction','commanderId','state','objective','holdsAt','anchor','strategyId','behavior','fire','formation','directiveId','retreatPoint','thinkTimer','supplyTimer','leapfrogTimer','phaseIndex','contact'];
const fields=(o,keys)=>Object.fromEntries(keys.map(k=>[k,o[k]??null]));
// Object order here is fixed; arrays of entities are deliberately sorted by ID.
// These are interpretable samples, not a claim that other state is irrelevant.
function project(g){return JSON.parse(JSON.stringify({
  time:g.time,rng:g.rng.s,identifiers:{unit:g.nextUnitId,squad:g.nextSquadId,order:g.api.nextId},
  units:[...g.units.values()].sort((a,b)=>a.id-b.id).map(u=>fields(u,unitKeys)),
  unitPositions:[...g.units.values()].sort((a,b)=>a.id-b.id).map(u=>fields(u,['id','alive','x','y'])),
  unitHealthAndAmmo:[...g.units.values()].sort((a,b)=>a.id-b.id).map(u=>fields(u,['id','alive','hp','downed','mag','reserve'])),
  squads:[...g.squads.values()].sort((a,b)=>a.id-b.id).map(s=>fields(s,squadKeys)),
  points:[...g.world.points].sort((a,b)=>a.id-b.id).map(p=>fields(p,['id','owner','hp','capture','progress'])),
  stocks:g.logistics.stock,delivered:g.logistics.delivered,stats:g.stats,
  orders:g.api.orders,over:g.warOver,outcome:g.outcome
}));}
function firstDiff(a,b,path=''){
  if(Object.is(a,b))return null;
  if(a===null||b===null||typeof a!=='object'||typeof b!=='object'||Array.isArray(a)!==Array.isArray(b))return {path,original:a??null,loaded:b??null};
  if(Array.isArray(a)&&a.length!==b.length)return {path:path+'.length',original:a.length,loaded:b.length};
  const keys=[...new Set([...Object.keys(a),...Object.keys(b)])];
  for(const k of keys){if(!Object.hasOwn(a,k)||!Object.hasOwn(b,k))return {path:`${path}.${k}`,original:Object.hasOwn(a,k)?a[k]:'<missing>',loaded:Object.hasOwn(b,k)?b[k]:'<missing>'};const d=firstDiff(a[k],b[k],`${path}.${k}`);if(d)return d;}
  return null;
}
const outcomes=[];
for(const extended of [false,true])for(let seed=1;seed<=seeds;seed++){
  const configs=await Promise.all([loadConfig(),loadConfig(),loadConfig()]);for(const cfg of configs)cfg.flags.alg_save=extended;
  const [source,control,loaded]=configs.map(cfg=>new Game({cfg,seed,aiVsAi:true,difficulty:'regular'}));
  for(let i=0;i<before;i++){source.step(1/60);control.step(1/60);}
  if(source.warOver||control.warOver)throw Error(`war ended before save at seed ${seed}`);
  const beforeSource=captureGraph(source).bytes,beforeControl=captureGraph(control).bytes;
  if(beforeSource!==beforeControl)throw Error(`controls diverged before save, seed ${seed}`);
  storage.clear();if(!Save.saveWar(source))throw Error(`save failed seed ${seed}`);
  const afterSave=captureGraph(source).bytes;
  if(beforeSource!==afterSave)throw Error(`save operation changed graph seed ${seed}`);
  const saved=Save.loadWar();if(!saved||!Save.applyWar(loaded,saved))throw Error(`load failed seed ${seed}`);
  const firstByCategory={},graphCheckpoints=[];let controlMismatch=null;
  for(let tick=0;tick<=after;tick++){
    if(tick){source.step(1/60);control.step(1/60);loaded.step(1/60);}
    const p=project(source),q=project(loaded),c=project(control);
    if(!controlMismatch){const d=firstDiff(p,c);if(d)controlMismatch={tick,...d};}
    for(const k of Object.keys(p))if(!firstByCategory[k]){const d=firstDiff(p[k],q[k],k);if(d)firstByCategory[k]={tick,...d};}
    if(tick===0||tick===1||tick===after){const a=captureGraph(source).bytes,b=captureGraph(loaded).bytes;graphCheckpoints.push({tick,matched:a===b,sha256Original:hash(a),sha256Loaded:hash(b)});}
  }
  const matched=!controlMismatch&&!Object.keys(firstByCategory).length&&graphCheckpoints.every(x=>x.matched);
  outcomes.push({extended,seed,matched,controlMismatch,saveDidNotChangeCapturedGraph:true,firstByCategory,graphCheckpoints});
  console.error(`alg_save=${extended} seed ${seed}/${seeds}: ${matched?'MATCH':'DIVERGED'}; categories=${Object.keys(firstByCategory).join(',')||'-'}`);
}
const passed=outcomes.every(x=>x.matched);
console.log(JSON.stringify({passed,kind:'bounded_save_load_continuation_diagnostic',node:process.version,seeds,beforeTicks:before,afterTicks:after,dt:1/60,outcomes,
  caveats:['AI-vs-AI only, same Node process; no browser input','Existing alg_save flag set in the test only; it remains default-off','Exact sampled projections compared every tick; reachable graph compared only at ticks 0, 1 and final','Graph excludes wall profiling clock fields and cannot capture closures, module globals, all prototype and buffer identity state','Save itself is checked against its pre-save graph; control projection checked for continuation','Save/load may legitimately rebuild caches and indexes; not every graph difference is a gameplay defect','No attempt to modify save format or claim complete replay']},null,2));
if(!passed)process.exitCode=1;
