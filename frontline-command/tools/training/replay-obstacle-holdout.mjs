// Real Game.step replay, with and without deterministic 12-second fallback.
import {readFile,writeFile} from 'node:fs/promises';
import {simulate} from './collect-obstacle-game.mjs';
import {simulateFallback} from './obstacle-fallback-sim.mjs';
const [input,out]=process.argv.slice(2);if(!out)throw Error('usage: replay-obstacle-holdout.mjs IN OUT');
const report=JSON.parse(await readFile(input,'utf8'));if(report.results.length!==48)throw Error('unexpected holdout size');
const rows=[];
for(const r of report.results){
 const row={id:r.spec.id,faction:r.spec.faction,choices:{base:r.base.choice,adapter:r.adapter.choice}};
 const baseline=await simulate(r.spec);
 const pack=(s,needed=1)=>({success:s.near&&!s.wallCross&&s.accepted===needed&&s.maxStep<=s.limit+1e-8,near:s.near,wallCross:s.wallCross,seconds:s.seconds,accepted:s.accepted,fallback:!!s.fallback,switched:s.switched});
 row.baseline=pack(baseline);
 for(const type of ['base','adapter']){
  if(!['U','D'].includes(r[type].choice))throw Error('invalid output');
  row[type]=pack(await simulate(r.spec,r[type].choice),2);
  row[type+'Fallback']=pack(await simulateFallback(r.spec,r[type].choice,{fallbackAfter:12}),2);
 }
 rows.push(row);
}
function measure(group,k){return {total:group.length,success:group.filter(r=>r[k].success).length,wallCross:group.filter(r=>r[k].wallCross).length,fallback:group.filter(r=>r[k].fallback).length};}
const metrics={};for(const k of ['baseline','base','adapter','baseFallback','adapterFallback'])metrics[k]={all:measure(rows,k),faction0:measure(rows.filter(r=>r.faction===0),k),faction1:measure(rows.filter(r=>r.faction===1),k)};
const d=rows.map(r=>r.adapterFallback.seconds-r.baseline.seconds);
const slow=rows.filter(r=>r.adapterFallback.seconds>r.baseline.seconds+1).length;
const summary={metrics,adapterFallbackDelay:{meanSeconds:d.reduce((a,b)=>a+b,0)/d.length,maxSeconds:Math.max(...d),scenesMoreThan1sSlower:slow},gates:{allSyntheticScenesReach:metrics.adapterFallback.all.success===48,noWallCrossing:metrics.adapterFallback.all.wallCross===0,noMoreThan1sSlower:slow===0,deploymentReady:false},reason:'offline synthetic test only; no running-model latency, real battle, WebGPU, reliability or browser performance acceptance'};
await writeFile(out,JSON.stringify({summary,rows},null,2)+'\n');console.log(JSON.stringify(summary));
