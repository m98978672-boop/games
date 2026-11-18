// Research dataset only. Captures real game states, labels them with a simple
// hand-written teacher (NOT expert play and NOT neural-network inference).
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {loadConfig} from '../../src/core/config.js';
import {Game} from '../../src/sim/game.js';
import {commanderSnapshot,validateProposal} from '../../src/sim/neutral_commander.js';
import {commanderPrompt} from '../../src/ai/commander-prompts.js';

export function teacher(input){
 if(!input.squads.length)return {action:'none'};
 const low=input.squads.findIndex(s=>s.ammo<70);
 if(low>=0)return {action:'supply',squad:low};
 const engineer=input.squads.findIndex(s=>s.engineers>0);
 if(input.builds.length&&engineer>=0)return {action:'build',squad:engineer,build:0};
 if(input.points.length)return {action:'hold',squad:0,point:0};
 return {action:'none'};
}
const hash=x=>createHash('sha256').update(x).digest('hex');
export async function collect({trainSeeds=[101,102,103,104],evalSeeds=[201,202],seconds=120,interval=20,knowledge=false}={}){
 if(!trainSeeds.length||!evalSeeds.length||new Set([...trainSeeds,...evalSeeds]).size!==trainSeeds.length+evalSeeds.length)throw Error('Train and evaluation seeds must be nonempty and disjoint');
 if(!Number.isInteger(seconds)||seconds<1||!Number.isInteger(interval)||interval<1)throw Error('Invalid simulation duration');
 const prompt=commanderPrompt(knowledge===true),cfg=await loadConfig();cfg.factions=cfg.factions.map(f=>({...f,persona:'balanced'}));cfg.faction=id=>cfg.factions[id]||cfg.factions[0];
 const data={train:[],eval:[]},seen=new Set(),counts={train:{},eval:{}},duplicates={train:0,eval:0};
 for(const [split,seeds] of [['train',trainSeeds],['eval',evalSeeds]])for(const seed of seeds)for(const swapSides of [false,true]){
  const game=new Game({cfg,seed,aiVsAi:true,swapSides});let next=0;
  const capture=()=>{
   for(const faction of [0,1]){
    const snapshot=commanderSnapshot(game,faction),input=snapshot.input,response=JSON.stringify(teacher(input)),key=hash(JSON.stringify(input));
    if(!validateProposal(response,snapshot))throw Error('Teacher produced an invalid command');
    // Exact duplicate inputs, including between splits, never occur twice.
    if(seen.has(key)){duplicates[split]++;continue;}seen.add(key);
    const action=JSON.parse(response).action;counts[split][action]=(counts[split][action]||0)+1;
    data[split].push({seed,swapSides,input,response});
   }
  };
  capture();next=interval;
  for(let i=0;i<seconds*10&&!game.warOver;i++){
   game.step(.1);
   if(game.time+1e-6>=next){capture();next+=interval;}
  }
  console.error(`${split} seed=${seed} swapped=${swapSides} time=${game.time.toFixed(1)} examples=${data[split].length}`);
 }
 if(!data.train.length||!data.eval.length)throw Error('No examples in train or eval after deduplication');
 return {prompt,data,counts,duplicates,trainSeeds,evalSeeds,seconds,interval};
}
export async function writeDataset(out,options){
 const result=await collect(options);await mkdir(out,{recursive:true});
 const files={};for(const split of ['train','eval']){
  const contents=result.data[split].map(row=>JSON.stringify(row)).join('\n')+'\n';
  await writeFile(resolve(out,`${split}.jsonl`),contents);files[split]={count:result.data[split].length,sha256:hash(contents),actions:result.counts[split],duplicatesRemoved:result.duplicates[split]};
 }
 const manifest={schema:'frontline-commander-teacher-v1',description:'Real simulation snapshots with heuristic labels; not expert play or model inference. Split by seed and exact snapshot deduplication.',prompt:result.prompt,trainSeeds:result.trainSeeds,evalSeeds:result.evalSeeds,seconds:result.seconds,interval:result.interval,files};
 await writeFile(resolve(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');return manifest;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const out=process.argv[2],flags=process.argv.slice(3);if(!out||flags.some(x=>x!=='--knowledge'))throw Error('usage: node tools/training/collect-commander.mjs OUTPUT_DIRECTORY [--knowledge]');
 console.log(JSON.stringify(await writeDataset(resolve(out),{knowledge:flags.includes('--knowledge')}),null,2));
}
