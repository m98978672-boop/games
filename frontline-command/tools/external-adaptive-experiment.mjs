// Exploratory density-based mix. Reuses both initial and previous holdout scenes
// for tuning, so this output is NOT an independent validation.
import {spawnSync} from 'node:child_process';import {writeFileSync} from 'node:fs';import {fileURLToPath} from 'node:url';
const scene=fileURLToPath(new URL('./opposing-columns.mjs',import.meta.url));
const groups=[];
for(const [name,args,n] of [['3x3-separate',[],20],['3x3-shared',['--shared-goal'],20],
 ['4x4-separate',['--column-size=4','--door-index=1','--seed-start=21'],10],['4x4-shared',['--column-size=4','--door-index=1','--seed-start=21','--shared-goal'],10]]){
 const variants=[];
 for(const max of [1,2,3]){
  const p=spawnSync(process.execPath,[scene,`--attempts=${n}`,'--flags=motion_wall_sweep_v1,motion_wall_exact_v1','--orca','--yuka-separation=10',`--yuka-max-neighbors=${max}`,...args],{encoding:'utf8',maxBuffer:20*1024*1024});
  if(p.error||![0,1].includes(p.status)||!p.stdout)throw Error(`${name}/${max}: ${p.error||p.stderr}`);
  const data=JSON.parse(p.stdout),r=data.results,size=name.startsWith('3')?6:8,sum=k=>r.reduce((n,x)=>n+x[k],0);
  const summary={scenes:r.length,complete:r.filter(x=>x.arrived===size&&x.crossed===size&&!x.failed&&!x.walls&&!x.immediateSweepHits&&!x.speed&&!x.changedGoalSamples&&!x.overlapFrames).length,
   arrived:sum('arrived'),failed:sum('failed'),crossed:sum('crossed'),sweeps:sum('immediateSweepHits'),overlaps:sum('overlapFrames'),
   suppressed:r.reduce((n,x)=>n+(x.steeringMetrics.suppressed||0),0),yukaForce:r.reduce((n,x)=>n+x.steeringMetrics.changed,0),orcaAdjusted:r.reduce((n,x)=>n+x.externalMetrics.orcaAdjusted,0)};
  console.log(name,max,JSON.stringify(summary));variants.push({max,summary,results:r});
 }
 groups.push({name,variants});
}
writeFileSync(fileURLToPath(new URL('../docs/EXTERNAL_ADAPTIVE_EXPERIMENT.json',import.meta.url)),JSON.stringify({method:'Exploratory tuning, Yuka separation applied only at <= max neighbors within 55px before ORCA; max 1/2/3. Reuses earlier scenes; exact sweep on.',groups},null,2)+'\n');
