// More varied but still synthetic U-wall waypoints plus normal-game commander
// snapshots. Every waypoint label comes from two actual Game.step trials.
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {simulate} from './collect-obstacle-game.mjs';
import {visible,SYSTEM} from './collect-obstacle-v2.mjs';
import {writeDataset as writeCommander} from './collect-commander.mjs';

// Sizes and seeds are disjoint between splits, including known previous tests.
const SIZES={
 train:[[144,176],[152,200],[168,184],[176,216],[184,192],[192,208],[208,192],[216,224],[224,184],[232,208],[240,216],[248,192],[256,208],[264,232],[272,184],[280,208],[288,216],[296,192],[304,208],[312,240],[320,224],[328,192],[336,216],[344,240]],
 dev:[[164,208],[236,200],[300,232]],test:[[172,208],[252,200],[316,216],[340,224]]};
const SEEDS={train:[1001,1003,1007,1009,1013,1019,1021,1031],dev:[2003,2011,2017],test:[3001,3011,3019,3023]};
const OFFSETS={train:[-60,-40,-20,0,20,40,60],dev:[-36,0,36],test:[-32,0,32]};
export function layouts(split,quick=false){
 if(!SIZES[split])throw Error('bad split');const arr=[];const sizes=quick?SIZES[split].slice(0,2):SIZES[split];const offsets=quick?[0]:OFFSETS[split];
 for(const [width,height] of sizes)for(const offset of offsets)for(const faction of [0,1])for(const closed of ['U','D']){
  const seed=SEEDS[split][Math.floor(arr.length/4)%SEEDS[split].length];
  arr.push({id:`${split}-${seed}-${width}-${height}-${offset}-${faction}-${closed}`,split,seed,width,height,offset,faction,closed});
 }
 return arr;
}
const hash=b=>createHash('sha256').update(b).digest('hex');
const key=o=>JSON.stringify(o);
async function waypointData(out,quick){
 await mkdir(out,{recursive:true});const counts={},splits={};
 for(const split of ['train','dev','test']){
  const all=[],kept=[];let rejected=0;
  for(const spec of layouts(split,quick)){
   const runs=await Promise.all(['U','D'].map(c=>simulate(spec,c)));
   const good=runs.filter(r=>r.near&&!r.wallCross&&r.switched&&r.accepted===2&&r.maxStep<=r.limit+1e-8);
   const compact=r=>({choice:r.choice,near:r.near,wallCross:r.wallCross,switched:r.switched,accepted:r.accepted,seconds:r.seconds,maxStep:r.maxStep,limit:r.limit});
   const row={spec,input:visible(spec),response:good.length===1?good[0].choice:null,candidates:runs.map(compact)};
   all.push(row);if(good.length===1)kept.push(row);else rejected++;
  }
  if(!kept.length)throw Error('empty '+split);
  const jsonl=x=>x.map(row=>JSON.stringify(row)).join('\n')+'\n';
  const k=jsonl(kept),a=jsonl(all);await writeFile(resolve(out,split+'.jsonl'),k);await writeFile(resolve(out,split+'-all.jsonl'),a);
  counts[split]={generated:all.length,kept:kept.length,rejected,sha256:hash(k),allSha256:hash(a),labels:{U:kept.filter(r=>r.response==='U').length,D:kept.filter(r=>r.response==='D').length},uniqueInputs:new Set(kept.map(r=>key(r.input))).size};
  splits[split]=new Set(all.map(r=>key(r.input)));
  console.log('waypoint dataset',split,JSON.stringify(counts[split]));
 }
 for(const [a,b] of [['train','dev'],['train','test'],['dev','test']])if([...splits[a]].some(k=>splits[b].has(k)))throw Error('waypoint split leakage');
 const m={schema:'frontline-obstacle-game-v2',system:SYSTEM,counts,settings:{SIZES,SEEDS,OFFSETS},description:'Artificial U-wall scenes: both candidate paths replayed in real isolated Game.step; one successful choice forms the training target. Not normal game maps.'};
 await writeFile(resolve(out,'manifest.json'),JSON.stringify(m,null,2)+'\n');return m;
}
export async function collectLong(out,quick=false){
 await mkdir(out,{recursive:true});
 const waypoint=await waypointData(resolve(out,'waypoint'),quick);
 // Regular simulation snapshots are strictly from each independent faction;
 // the same commanderPrompt(true) and rules apply to both sides.
 const commander=await writeCommander(resolve(out,'commander'),{trainSeeds:quick?[501]:[501,502,503,504,505,506,507,508,509,510,511,512],evalSeeds:quick?[601]:[601,602,603,604],seconds:quick?20:120,interval:20,knowledge:true});
 const manifest={schema:'frontline-long-training-v1',waypoint:waypoint.counts,commander:commander.files,notes:'Separate synthetic waypoint tasks and normal-game commander snapshots. Commander labels imitate a simple rule, not an expert. No enemy or opposing-side observations are passed to the model. Not evidence of better gameplay.'};
 await writeFile(resolve(out,'collection.json'),JSON.stringify(manifest,null,2)+'\n');return manifest;
}
if(process.argv[1]&&resolve(process.argv[1])===new URL(import.meta.url).pathname){
 if(!process.argv[2])throw Error('output required');await collectLong(resolve(process.argv[2]),process.argv.includes('--quick'));
}
