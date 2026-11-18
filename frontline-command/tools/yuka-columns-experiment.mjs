// Reproducible paired experiment; failed scenes are expected diagnostics, not a test failure.
import {spawnSync} from 'node:child_process';
import {writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const scene=fileURLToPath(new URL('./opposing-columns.mjs',import.meta.url));
const output=fileURLToPath(new URL('../docs/YUKA_COLUMNS_EXPERIMENT.json',import.meta.url));
const configs=[{name:'separate',args:[],attempts:20},{name:'shared',args:['--shared-goal'],attempts:20},
 {name:'separate-exact-sweep',args:['--flags=motion_wall_sweep_v1,motion_wall_exact_v1'],attempts:20},
 {name:'shared-exact-sweep',args:['--shared-goal','--flags=motion_wall_sweep_v1,motion_wall_exact_v1'],attempts:20},
 {name:'game-step-separate',args:['--game-step'],attempts:10}];
const sum=(rs,k)=>rs.reduce((n,r)=>n+r[k],0);
const groups=[];
for(const c of configs){
 const variants=[];
 for(const weight of [0,10,30]){
  const args=[scene,`--attempts=${c.attempts}`,...c.args,`--yuka-separation=${weight}`];
  const p=spawnSync(process.execPath,args,{encoding:'utf8',maxBuffer:20*1024*1024});
  if(p.error || ![0,1].includes(p.status) || !p.stdout)throw Error(`scene failed ${c.name}/${weight}: ${p.error||p.stderr}`);
  const data=JSON.parse(p.stdout),rs=data.results;
  variants.push({weight,summary:{scenes:rs.length,strictRetrospectivePass:data.passed,
   completeImmediate:rs.filter(r=>r.arrived===6&&r.crossed===6&&!r.failed&&!r.walls&&!r.immediateSweepHits&&!r.speed&&!r.changedGoalSamples&&!r.overlapFrames).length,
   arrived:sum(rs,'arrived'),failed:sum(rs,'failed'),crossed:sum(rs,'crossed'),wallSamples:sum(rs,'walls'),
   retrospectiveSweeps:sum(rs,'sweptWalls'),immediateSweeps:sum(rs,'immediateSweepHits'),observedMoves:sum(rs,'immediateSweepMoves'),
   speedSamples:sum(rs,'speed'),overlapFrames:sum(rs,'overlapFrames'),goalChangeSamples:sum(rs,'changedGoalSamples'),
   steeringCalls:rs.reduce((n,r)=>n+r.steeringMetrics.calls,0),steeringNonzero:rs.reduce((n,r)=>n+r.steeringMetrics.changed,0)},results:rs});
 }
 const base=variants[0].results;
 for(const v of variants.slice(1)){
  v.paired={better:0,equal:0,worse:0};
  v.results.forEach((r,i)=>{if(r.seed!==base[i].seed||r.faction!==base[i].faction)throw Error('unpaired scenes');
   const d=r.arrived-base[i].arrived;v.paired[d>0?'better':d<0?'worse':'equal']++;});
 }
 groups.push({name:c.name,variants});
 console.log(c.name,variants.map(v=>({weight:v.weight,...v.summary,paired:v.paired})));
}
writeFileSync(output,JSON.stringify({library:'Yuka 0.7.8, SeparationBehavior',source:'https://github.com/Mugen87/yuka',license:'MIT',
 method:'Same game seeds, spawn positions and requested goals; Yuka separation force added to existing desired motion after internal steering; existing physics and wall/occupancy checks remain. Weight is a hand-picked multiplier; 55px neighbor radius. Manual ticks except game-step group. No combat. 1200 ticks max at 0.05 s. Retrospective sweep uses later door state; immediate sweep observes ordinary/rescue moves at movement time.',groups},null,2)+'\n');
console.log(`saved ${output}`);
