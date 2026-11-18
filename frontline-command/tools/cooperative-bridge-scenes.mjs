// Paired comparison of shared-state proposal bridge with stock AI.
import {spawnSync} from 'node:child_process';import {writeFileSync} from 'node:fs';import {fileURLToPath} from 'node:url';
const scene=fileURLToPath(new URL('./opposing-columns.mjs',import.meta.url));
const settings=[{name:'3x3-separate',args:[],n:20},{name:'3x3-shared',args:['--shared-goal'],n:20},{name:'4x4-separate',args:['--door-index=1','--column-size=4','--seed-start=21'],n:10},{name:'4x4-shared',args:['--door-index=1','--column-size=4','--seed-start=21','--shared-goal'],n:10},{name:'Game.step',args:['--game-step'],n:10}];
const groups=[];
for(const s of settings){const variants=[];for(const on of [false,true]){
 const p=spawnSync(process.execPath,[scene,`--attempts=${s.n}`,'--flags=motion_wall_sweep_v1,motion_wall_exact_v1',...s.args,...(on?['--cooperative-bridge']:[])],{encoding:'utf8',maxBuffer:40*1024*1024});
 if(p.error||![0,1].includes(p.status)||!p.stdout)throw Error(`${s.name}: ${p.error||p.stderr}`);
 const data=JSON.parse(p.stdout),r=data.results,count=data.columnSize*2,sum=k=>r.reduce((n,x)=>n+x[k],0),aggregate={original:0,yuka:0,orca:0,hybrid:0,wait:0};
 for(const x of r)if(x.bridgeMetrics)for(const key in aggregate)aggregate[key]+=x.bridgeMetrics.selected[key];
 const summary={scenes:r.length,arrived:sum('arrived'),failed:sum('failed'),crossed:sum('crossed'),complete:r.filter(x=>x.arrived===count&&x.crossed===count&&!x.failed&&!x.walls&&!x.immediateSweepHits&&!x.speed&&!x.changedGoalSamples&&!x.overlapFrames).length,sweep:sum('immediateSweepHits'),overlap:sum('overlapFrames'),changedGoals:sum('changedGoalSamples'),selected:aggregate};
 if(on){summary.paired={better:0,equal:0,worse:0};r.forEach((x,i)=>{const b=variants[0].results[i];if(x.faction!==b.faction||x.seed!==b.seed)throw Error('unpaired');summary.paired[x.arrived>b.arrived?'better':x.arrived<b.arrived?'worse':'equal']++;});}
 console.log(s.name,on,JSON.stringify(summary));variants.push({on,summary,results:r});
}groups.push({name:s.name,variants});}
writeFileSync(fileURLToPath(new URL('../docs/COOPERATIVE_BRIDGE_SCENES.json',import.meta.url)),JSON.stringify({method:'Diagnostic only: original, Yuka, ORCA, hybrid propose local velocities, heuristic arbiter chooses. Actual game physics, occupancy, exact sweep; paired seeds. No language model. No combat; Game.step group has changing goals and disabled systems.',groups},null,2)+'\n');
