// Expanded held-out study only; scene physics/teacher uses the existing real
// Game.step, not observations from a normal match. No integration with the game.
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {simulate,modelObservation} from './collect-obstacle-game.mjs';

export const SYSTEM='Choose one reachable waypoint for the soldier. Soldier starts at (0,0). Positive x is forward and positive y is down. Walls are solid [x1,y1,x2,y2] segments that cannot be crossed. The goal and U/D are [x,y] points. The map spans x=-768 to 768 and cannot be left. Select U or D.';
const SCENES={
 train:{seeds:[101,103,107,109,113],sizes:[[160,192],[192,192],[224,224],[256,256],[288,192],[240,176],[272,256],[208,176]],offsets:[-48,-24,0,24,48]},
 dev:{seeds:[211,223],sizes:[[200,208],[280,224]],offsets:[-32,32]},
 test:{seeds:[307,311,313],sizes:[[216,200],[248,216],[304,240]],offsets:[-40,0,40]},
};
export function scenes(split){
 const conf=SCENES[split];if(!conf)throw Error('unknown split');const rows=[];
 for(const [width,height] of conf.sizes)for(const offset of conf.offsets)for(const faction of [0,1])for(const closed of ['U','D']){
  const n=rows.length,seed=conf.seeds[(Math.floor(n/4)+faction)%conf.seeds.length];
  rows.push({id:`${split}-${seed}-${width}-${height}-${offset}-${faction}-${closed}`,split,seed,width,height,offset,faction,closed});
 }
 return rows;
}
// Shuffle the order deterministically using properties independent of blocked
// side. Swapping factions keeps the same visible map and permutation.
export function visible(s){
 const obs=modelObservation(s);const shift=(s.width+3*s.height+5*s.offset+40000)%4;
 return {...obs,walls:obs.walls.slice(shift).concat(obs.walls.slice(0,shift))};
}
const hash=s=>createHash('sha256').update(s).digest('hex');
export async function collect(out){
 await mkdir(out,{recursive:true});const counts={},all={};
 for(const split of ['train','dev','test']){
  const rows=[],allRows=[];let rejected=0;
  for(const spec of scenes(split)){
   const runs=await Promise.all(['U','D'].map(c=>simulate(spec,c)));
   const good=runs.filter(r=>r.near&&!r.wallCross&&r.switched&&r.accepted===2&&r.maxStep<=r.limit+1e-8);
   const compact=r=>({choice:r.choice,near:r.near,wallCross:r.wallCross,switched:r.switched,accepted:r.accepted,seconds:r.seconds,maxStep:r.maxStep,limit:r.limit});
   allRows.push({spec,input:visible(spec),response:good.length===1?good[0].choice:null,candidates:runs.map(compact)});
   if(good.length!==1){rejected++;continue;}
   rows.push({spec,input:visible(spec),response:good[0].choice,teacher:{seconds:good[0].seconds},other:{choice:runs.find(r=>r!==good[0]).choice,near:runs.find(r=>r!==good[0]).near,switched:runs.find(r=>r!==good[0]).switched}});
  }
  const allContents=allRows.map(r=>JSON.stringify(r)).join('\n')+'\n';await writeFile(resolve(out,split+'-all.jsonl'),allContents);
  if(!rows.length)throw Error(`empty ${split}`);
  const contents=rows.map(r=>JSON.stringify(r)).join('\n')+'\n';await writeFile(resolve(out,split+'.jsonl'),contents);
  counts[split]={generated:scenes(split).length,kept:rows.length,rejected,sha256:hash(contents),allSha256:hash(allContents),labels:{U:rows.filter(r=>r.response==='U').length,D:rows.filter(r=>r.response==='D').length},uniqueInputs:new Set(rows.map(r=>JSON.stringify(r.input))).size};
  all[split]=rows;
  console.log('collection',split,JSON.stringify(counts[split]));
 }
 const seen=new Set();for(const [split,rows] of Object.entries(all)){
  const keys=new Set(rows.map(r=>JSON.stringify(r.input)));if([...keys].some(k=>seen.has(k)))throw Error(`split leakage in ${split}`);for(const k of keys)seen.add(k);
 }
 const manifest={schema:'frontline-obstacle-game-v2',system:SYSTEM,counts,settings:SCENES,description:'Artificial U-wall scenarios; one valid waypoint demonstrated with actual Game.step and CommandAPI; not normal maps or human play; disjoint sizes and seeds. Duplicates inside split remain because both factions are replayed.'};
 await writeFile(resolve(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');return manifest;
}
if(process.argv[1]&&resolve(process.argv[1])===new URL(import.meta.url).pathname){if(!process.argv[2])throw Error('output required');await collect(resolve(process.argv[2]));}
