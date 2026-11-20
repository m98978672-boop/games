// Offline-only data for indexed command learning. Original scenarios are real
// side-isolated Game snapshots; permutations and removals are counterfactuals.
// The labeler is deliberately simple, so reproducing it is NOT combat skill.
import {mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {collect,teacher} from './collect-commander.mjs';
import {validateProposal} from '../../src/sim/neutral_commander.js';

const digest=s=>createHash('sha256').update(s).digest('hex');
function permute(items,salt){
 return items.map((item,i)=>({item,i,k:digest(`${salt}:${i}`)})).sort((a,b)=>a.k.localeCompare(b.k)||a.i-b.i).map(x=>x.item);
}
export function augment(input,variant){
 const squads=permute(input.squads,`s:${variant}`), points=permute(input.points,`p:${variant}`), builds=permute(input.builds,`b:${variant}`);
 // Counterfactual deletion only, no invented soldiers or altered ammo.
 switch(variant%5){
  case 1:return {squads,points,builds:[]};
  case 2:return {squads,points:[],builds};
  case 3:return {squads,points:[],builds:[]};
  case 4:return {squads:[],points,builds};
  default:return {squads,points,builds};
 }
}
function fakeSnapshot(input){return {input,squads:input.squads.map((_,i)=>i+1),points:input.points.map((_,i)=>i+1),builds:input.builds.map((_,i)=>i+1)};}
export async function collectBalanced({quick=false,variants=20}={}){
 if(!Number.isInteger(variants)||variants<1||variants>100)throw Error('invalid variants');
 const trainSeeds=quick?[901]:[901,902,903,904,905,906,907,908];
 const devSeeds=quick?[1201]:[1201,1202,1203];
 const testSeeds=quick?[1501]:[1501,1502,1503,1504];
 const opts={seconds:quick?10:120,interval:20,knowledge:true};
 const first=await collect({...opts,trainSeeds,evalSeeds:devSeeds});
 const second=await collect({...opts,trainSeeds:[1601],evalSeeds:testSeeds});
 const splits={train:first.data.train,dev:first.data.eval,test:second.data.eval},seen=new Map(),stats={},result={};
 for(const split of ['train','dev','test']){
  const rows=[],actions={},indexes={};let duplicates=0;
  for(const row of splits[split])for(let variant=0;variant<variants;variant++){
   const input=augment(row.input,variant),key=digest(JSON.stringify(input));
   if(seen.has(key)){duplicates++;continue;}
   const proposal=teacher(input);if(!validateProposal(JSON.stringify(proposal),fakeSnapshot(input)))throw Error('invalid teacher label');
   seen.set(key,split);const action=proposal.action;
   actions[action]=(actions[action]||0)+1;
   if(proposal.squad!==undefined)indexes[proposal.squad]=(indexes[proposal.squad]||0)+1;
   rows.push({seed:row.seed,swapSides:row.swapSides,input,response:JSON.stringify(proposal)});
  }
  if(!rows.length)throw Error(`empty ${split}`);
  result[split]=rows;stats[split]={count:rows.length,actions,indexes,duplicatesRemoved:duplicates,seeds:split==='train'?trainSeeds:split==='dev'?devSeeds:testSeeds};
 }
 return {schema:'frontline-commander-balanced-v1',description:'Side-isolated real-game snapshots with deterministic permutations and deletions; heuristic teacher, not a battle or proof of strategic skill.',prompt:first.prompt,variants,stats,data:result};
}
export async function writeBalanced(out,options){
 const {data,...manifest}=await collectBalanced(options);await mkdir(out,{recursive:true});
 for(const split of ['train','dev','test']){
  const raw=data[split].map(r=>JSON.stringify(r)).join('\n')+'\n';
  manifest.stats[split].sha256=digest(raw);await writeFile(resolve(out,`${split}.jsonl`),raw);
 }
 await writeFile(resolve(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');return manifest;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const out=process.argv[2],quick=process.argv.includes('--quick');if(!out)throw Error('usage: collect-commander-balanced.mjs OUTPUT [--quick]');
 console.log(JSON.stringify(await writeBalanced(resolve(out),{quick}),null,2));
}
