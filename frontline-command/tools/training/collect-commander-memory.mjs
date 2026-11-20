// Offline training examples from real Game.step and real neutralAI orders.
// Narrow task: choose none rather than duplicate a queued hold command.
// The snapshots never include enemy facts. This is not battle training.
import {mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {loadConfig} from '../../src/core/config.js';
import {Game} from '../../src/sim/game.js';
import {commanderSnapshot,applyCommanderPair,validateProposal} from '../../src/sim/neutral_commander.js';
import {runtimeCommanderPrompt} from '../../src/ai/commander-prompts.js';
import {inputWithMemory,repeatsPending} from './commander-memory.mjs';
const hash=s=>createHash('sha256').update(s).digest('hex');
export const MEMORY_PROMPT=runtimeCommanderPrompt(true);
const hold={action:'hold',squad:0,point:0};
export async function collectMemory({quick=false,seconds=120,interval=20}={}){
 const seeds=quick?{train:[2101],dev:[2201],test:[2301]}:{train:[2101,2102,2103,2104,2105,2106,2107,2108],dev:[2201,2202,2203],test:[2301,2302,2303,2304]};
 if(!Number.isInteger(seconds)||seconds<20||!Number.isInteger(interval)||interval<10)throw Error('bad schedule');
 const cfg=await loadConfig();cfg.factions=cfg.factions.map(f=>({...f,persona:'balanced'}));cfg.faction=id=>cfg.factions[id]||cfg.factions[0];
 const result={train:[],dev:[],test:[]},baseOwners=new Map(),fullSeen=new Set(),stats={};
 for(const split of ['train','dev','test']){
  let duplicates=0,paired=0,skipped=0;const actions={};
  for(const seed of seeds[split])for(const swapSides of [false,true]){
   const game=new Game({cfg,seed,aiVsAi:true,swapSides});game.api.orders=[];
   for(let tick=0;tick<=seconds*10&&!game.warOver;tick++){
    if(tick%(interval*10)===0){
     const snapshots=[commanderSnapshot(game,0),commanderSnapshot(game,1)];
     if(snapshots.every(s=>s.squads.length&&s.points.length&&!repeatsPending(hold,inputWithMemory(game,s).memory.recent))){
      const before=snapshots.map(s=>inputWithMemory(game,s));
      const res=applyCommanderPair(game,snapshots,[JSON.stringify(hold),JSON.stringify(hold)]);
      if(res.ok){
       const after=[0,1].map(f=>inputWithMemory(game,commanderSnapshot(game,f)));
       for(let f=0;f<2;f++){
        // Game.state did not advance, so the only new fact is the actual order.
        const prior=before[f],next=after[f];
        if(JSON.stringify({...prior,memory:{recent:[],experience:[]}})!==JSON.stringify({...next,memory:{recent:[],experience:[]}}))throw Error('unexpected input mutation');
        if(repeatsPending(hold,prior.memory.recent)||!repeatsPending(hold,next.memory.recent))throw Error('missing pending order');
        const bare=JSON.stringify({squads:prior.squads,points:prior.points,builds:prior.builds}),key=hash(bare),owner=baseOwners.get(key);
        if(owner&&owner!==split){duplicates+=2;continue;}baseOwners.set(key,split);
        for(const [input,response] of [[prior,hold],[next,{action:'none'}]]){
         const k=hash(JSON.stringify(input));if(fullSeen.has(k)){duplicates++;continue;}fullSeen.add(k);
         const snapshot={input,squads:input.squads.map((_,i)=>i+1),points:input.points.map((_,i)=>i+1),builds:input.builds.map((_,i)=>i+1)};
         if(!validateProposal(JSON.stringify(response),snapshot))throw Error('invalid memory teacher command');
         actions[response.action]=(actions[response.action]||0)+1;
         result[split].push({seed,swapSides,input,response:JSON.stringify(response)});
        }
       }
       paired++;
      }else skipped++;
     }else skipped++;
    }
    if(tick<seconds*10)game.step(.1);
   }
  }
  if(!result[split].length||!actions.hold||!actions.none)throw Error(`no varied memory examples in ${split}`);
  stats[split]={count:result[split].length,actions,duplicatesRemoved:duplicates,seeds:seeds[split],pairedApplications:paired,skippedApplications:skipped};
 }
 return {schema:'frontline-commander-balanced-v1',description:'Narrow side-isolated memory task: normal simulation, actual orders and their real queue status; no enemy facts, no combat training.',prompt:MEMORY_PROMPT,stats,data:result};
}
export async function writeMemory(out,opts){
 const {data,...manifest}=await collectMemory(opts);await mkdir(out,{recursive:true});
 for(const split of ['train','dev','test']){const raw=data[split].map(r=>JSON.stringify(r)).join('\n')+'\n';manifest.stats[split].sha256=hash(raw);await writeFile(resolve(out,`${split}.jsonl`),raw);}
 await writeFile(resolve(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');return manifest;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const out=process.argv[2];if(!out)throw Error('usage: collect-commander-memory.mjs OUTPUT [--quick]');
 console.log(JSON.stringify(await writeMemory(resolve(out),{quick:process.argv.includes('--quick')}),null,2));
}
