// Paired research-only external steering experiments, including combinations.
import {spawnSync} from 'node:child_process';
import {writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const scene=fileURLToPath(new URL('./opposing-columns.mjs',import.meta.url));
const planners=process.argv.includes('--planners');
const crowdVariants=[['baseline',[]],['yuka',['--yuka-separation=10']],['orca',['--orca']],['behavior-tree',['--behavior-tree']],
 ['yuka+orca',['--yuka-separation=10','--orca']],['yuka+tree',['--yuka-separation=10','--behavior-tree']],
 ['orca+tree',['--orca','--behavior-tree']],['yuka+orca+tree',['--yuka-separation=10','--orca','--behavior-tree']]];
const plannerVariants=[['baseline',[]],['recast',['--recast']],['recast+yuka',['--recast','--yuka-separation=10']],
 ['recast+orca',['--recast','--orca']],['recast+yuka+orca',['--recast','--yuka-separation=10','--orca']],
 ['recast+tree',['--recast','--behavior-tree']],['pibt',['--pibt']],['pibt+yuka',['--pibt','--yuka-separation=10']],
 ['pibt+orca',['--pibt','--orca']],['pibt+tree',['--pibt','--behavior-tree']]];
const variants=planners?plannerVariants:crowdVariants;
const settings=[{name:'separate',args:[],attempts:20},{name:'shared',args:['--shared-goal'],attempts:20},
 ...(!planners?[{name:'game-step-separate',args:['--game-step'],attempts:10}]:[])];
const sum=(r,key)=>r.reduce((n,x)=>n+x[key],0);
const groups=[];
for(const s of settings){const results=[];
 for(const [name,args] of variants){
  if(s.name==='shared'&&args.includes('--pibt'))continue; // MAPF requires distinct goal cells.
  const p=spawnSync(process.execPath,[scene,`--attempts=${s.attempts}`,'--flags=motion_wall_sweep_v1,motion_wall_exact_v1',...s.args,...args],{encoding:'utf8',maxBuffer:32*1024*1024});
  if(p.error||![0,1].includes(p.status)||!p.stdout)throw Error(`${s.name}/${name} ${p.error||p.stderr}`);
  const data=JSON.parse(p.stdout),r=data.results;
  const summary={scenes:r.length,arrived:sum(r,'arrived'),failed:sum(r,'failed'),crossed:sum(r,'crossed'),
   complete:r.filter(x=>x.arrived===6&&x.crossed===6&&!x.failed&&!x.walls&&!x.immediateSweepHits&&!x.speed&&!x.changedGoalSamples&&!x.overlapFrames).length,
   wallSamples:sum(r,'walls'),sweeps:sum(r,'immediateSweepHits'),speedSamples:sum(r,'speed'),overlapFrames:sum(r,'overlapFrames'),goalChangeSamples:sum(r,'changedGoalSamples'),
   orcaAdjusted:r.reduce((n,x)=>n+(x.externalMetrics?.orcaAdjusted||0),0),treeWaits:r.reduce((n,x)=>n+(x.externalMetrics?.treeWaits||0),0),
   yukaForce:r.reduce((n,x)=>n+x.steeringMetrics.changed,0),
   recastPaths:r.reduce((n,x)=>n+(x.recastMetrics?.paths||0),0),recastUsed:r.reduce((n,x)=>n+(x.recastMetrics?.used||0),0),
   pibtPlans:r.filter(x=>x.pibtMetrics?.planSolved&&x.pibtMetrics?.planValid).length,pibtSteering:r.reduce((n,x)=>n+(x.pibtMetrics?.steering||0),0)};
  if(results.length){const base=results[0].results;summary.paired={better:0,equal:0,worse:0};r.forEach((x,i)=>{if(x.seed!==base[i].seed||x.faction!==base[i].faction)throw Error('unpaired');let delta=x.arrived-base[i].arrived;summary.paired[delta>0?'better':delta<0?'worse':'equal']++;});}
  results.push({name,args,summary,results:r});console.log(s.name,name,JSON.stringify(summary));
 }
 groups.push({name:s.name,results});
}
const out=fileURLToPath(new URL(planners?'../docs/EXTERNAL_PLANNERS_MATRIX.json':'../docs/EXTERNAL_CROWD_MATRIX.json',import.meta.url));
writeFileSync(out,JSON.stringify({method:'Paired fixed spawns/goals, game door and movement code. Exact wall sweep enabled for ALL variants. No combat. game-step group other systems disabled, goals can change. ORCA is sequential local adapter, tree policy custom; detailed caveats in report.',groups},null,2)+'\n');
console.log(`saved ${out}`);
