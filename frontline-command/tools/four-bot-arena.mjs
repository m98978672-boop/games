// Four controllers simultaneously fight as distinct mutually hostile factions.
import {writeFileSync} from 'node:fs';import {fileURLToPath} from 'node:url';
import {runArena} from './experiments/four-bot-arena.mjs';
const seeds=Number(process.argv.find(x=>x.startsWith('--seeds='))?.slice(8)||8),seconds=Number(process.argv.find(x=>x.startsWith('--seconds='))?.slice(10)||90);
if(!Number.isInteger(seeds)||seeds<1||seeds>100||!Number.isFinite(seconds)||seconds<=0||seconds>300)throw Error('invalid arguments');
const names=['original','yuka','orca','hybrid'],summary=Object.fromEntries(names.map(n=>[n,{wins:0,active:0,downsInflicted:0,downsTaken:0,shots:0,pathFailures:0,calls:0,yukaNonzero:0,orcaAdjusted:0,hybridBlends:0}]));
const matches=[];let timeout=0,draw=0,swept=0,overlapSamples=0,badFriendly=0,friendlyTargetSamples=0;
for(let seed=1;seed<=seeds;seed++)for(let rotation=0;rotation<4;rotation++){
 const m=await runArena({seed,rotation,seconds});matches.push(m);if(m.winner)summary[m.winner].wins++;else if(m.timeout)timeout++;else draw++;
 swept+=m.swept;overlapSamples+=m.overlap.overlapFrames;badFriendly+=m.badFriendly;friendlyTargetSamples+=m.friendlyTargetSamples;
 for(let f=0;f<4;f++){const s=summary[m.controllers[f]],mt=m.botMetrics[m.controllers[f]];s.active+=m.active[f];s.shots+=m.firing[f];s.pathFailures+=m.pathFailures[f];s.downsInflicted+=m.downBy[f].reduce((a,b)=>a+b,0);s.downsTaken+=m.downBy.reduce((a,row)=>a+row[f],0);s.calls+=mt.calls;s.yukaNonzero+=mt.yukaNonzero;s.orcaAdjusted+=mt.orcaAdjusted;s.hybridBlends+=mt.hybridBlends;}
 console.log(`seed ${seed} rotation ${rotation} winner ${m.winner||'none'} t=${m.seconds} active=${m.active.join('/')} shots=${m.firing.join('/')}`);
}
const report={method:'Four mutually hostile factions, six identical infantry each, actual Game.step and soldier combat. Four controller variants assigned to rotating slots. One equal scripted central objective per group. Original strategic, economic and two-faction victory systems disabled; arena eliminates at 0 standing agents. Exact sweep enabled. Fixed map at (1200,1200), 90 s max; no respawns or reinforcement.',seeds,seconds,games:matches.length,summary,timeout,draw,swept,overlapSamples,badFriendly,friendlyTargetSamples,matches};
console.log(JSON.stringify({games:matches.length,summary,timeout,draw,swept,overlapSamples,badFriendly,friendlyTargetSamples},null,2));
writeFileSync(fileURLToPath(new URL('../docs/FOUR_BOT_ARENA.json',import.meta.url)),JSON.stringify(report,null,2)+'\n');
