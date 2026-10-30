// Один и тот же набор объектов и запросов до и после оптимизации; не FPS.
import { performance } from 'node:perf_hooks';
const {ShellField}=await import(process.env.SHELL_MODULE || '../src/shells.js');
let seed=153;const rng=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/2**32);
const f=new ShellField(null);
for(let i=0;i<20000;i++) {const x=(rng()-.5)*360,z=(rng()-.5)*360,r=.08+rng()*.25;f.add('tree',[{x:x-r,z:z-r},{x:x+r,z:z-r},{x:x+r,z:z+r},{x:x-r,z:z+r}],0,2);}
const queries=Array.from({length:10000},()=>[(rng()-.5)*360,(rng()-.5)*360]);
for(let i=0;i<1000;i++)f.blocked(...queries[i],.4,0);
const times=[]; let hits=0;
for(let run=0;run<5;run++){const start=performance.now();let n=0;for(const [x,z] of queries)if(f.blocked(x,z,.4,0))n++;times.push(performance.now()-start);hits=n;}
times.sort((a,b)=>a-b);console.log(JSON.stringify({queries:queries.length,hits,median_ms:times[2],times}));
