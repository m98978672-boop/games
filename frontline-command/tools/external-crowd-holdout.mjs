// Candidate holdout: seeds 21-30, 4 vs 4 and the other HQ door.
import {spawnSync} from 'node:child_process';import {writeFileSync} from 'node:fs';import {fileURLToPath} from 'node:url';
const scene=fileURLToPath(new URL('./opposing-columns.mjs',import.meta.url));
const variants=[['baseline',[]],['yuka',['--yuka-separation=10']],['orca',['--orca']],['tree',['--behavior-tree']],
 ['yuka+orca',['--yuka-separation=10','--orca']],['yuka+tree',['--yuka-separation=10','--behavior-tree']],
 ['yuka+orca+tree',['--yuka-separation=10','--orca','--behavior-tree']]];
const groups=[];
for(const shared of [false,true]){const results=[];
 for(const [name,extra] of variants){
  const p=spawnSync(process.execPath,[scene,'--attempts=10','--seed-start=21','--column-size=4','--door-index=1','--flags=motion_wall_sweep_v1,motion_wall_exact_v1',...(shared?['--shared-goal']:[]),...extra],{encoding:'utf8',maxBuffer:32*1024*1024});
  if(p.error||![0,1].includes(p.status)||!p.stdout)throw Error(`${name}: ${p.error||p.stderr}`);
  const data=JSON.parse(p.stdout),r=data.results,sum=k=>r.reduce((n,x)=>n+x[k],0);
  const summary={scenes:r.length,complete:r.filter(x=>x.arrived===8&&x.crossed===8&&!x.failed&&!x.walls&&!x.immediateSweepHits&&!x.speed&&!x.changedGoalSamples&&!x.overlapFrames).length,
   arrived:sum('arrived'),failed:sum('failed'),crossed:sum('crossed'),walls:sum('walls'),sweeps:sum('immediateSweepHits'),speed:sum('speed'),overlaps:sum('overlapFrames'),
   orcaAdjusted:r.reduce((n,x)=>n+(x.externalMetrics?.orcaAdjusted||0),0),treeWaits:r.reduce((n,x)=>n+(x.externalMetrics?.treeWaits||0),0),yukaForce:r.reduce((n,x)=>n+x.steeringMetrics.changed,0)};
  if(results.length){summary.paired={better:0,equal:0,worse:0};r.forEach((v,i)=>{const b=results[0].results[i];if(b.seed!==v.seed||b.faction!==v.faction)throw Error('unpaired');summary.paired[v.arrived>b.arrived?'better':v.arrived<b.arrived?'worse':'equal']++;});}
  console.log(shared?'shared':'separate',name,JSON.stringify(summary));results.push({name,summary,results:r});
 }
 groups.push({shared,results});
}
writeFileSync(fileURLToPath(new URL('../docs/EXTERNAL_CROWD_HOLDOUT.json',import.meta.url)),JSON.stringify({method:'20 paired 4v4 HQ scenes, second door, seeds 21-30, exact sweep on, manual movement only, no combat.',groups},null,2)+'\n');
