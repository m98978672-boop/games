// Paired real AI-vs-AI probe. The experiment is local to this script.
import {loadConfig} from '../src/core/config.js';import {Game} from '../src/sim/game.js';
import {emptyOverlapMetrics,observeOverlaps} from '../tests/acceptance/overlap-metrics.mjs';
import {installWarMix} from './experiments/external-crowd.mjs';import {writeFileSync} from 'node:fs';import {fileURLToPath} from 'node:url';
const seeds=Number(process.argv.find(x=>x.startsWith('--seeds='))?.slice(8)||4),seconds=Number(process.argv.find(x=>x.startsWith('--seconds='))?.slice(10)||90);
if(!Number.isInteger(seeds)||seeds<1||seeds>20||seconds<=0||seconds>600)throw Error('bad arguments');
async function run(seed,swap,on){
 const cfg=await loadConfig();cfg.flags.motion_wall_sweep_v1=true;cfg.flags.motion_wall_exact_v1=true;cfg.flags.alg_deadlock=true;
 const g=new Game({cfg,seed,swapSides:swap,difficulty:'regular',aiVsAi:true});
 const experiment=on?await installWarMix(g):null;const overlap=emptyOverlapMetrics();let sweep=0,moves=0;
 g._motionDiagnostic=(u,x,y,nx,ny)=>{if(Math.hypot(nx-x,ny-y)<1e-9)return;moves++;if(g.walls.blocksMoveSweep(x,y,nx,ny,u.radius,u))sweep++;};
 const t=performance.now();
 for(let i=0;i<Math.ceil(seconds/.1)&&!g.warOver;i++){
  g.step(.1);
  if(i%10===0)observeOverlaps([...g.units.values()].filter(u=>u.alive&&!u.downed),overlap);
 }
 return {on,seconds:+g.time.toFixed(2),wallClockMs:Math.round(performance.now()-t),warOver:g.warOver,failures:g.deadlockStats?.pathFailures||[0,0],
  kills:g.stats.kills,captures:g.stats.captures,deliveries:g.stats.deliveries,alive:[0,1].map(f=>[...g.units.values()].filter(u=>u.alive&&u.faction===f).length),
  experiment,moves,sweep,overlap};
}
const pairs=[];
for(let seed=1;seed<=seeds;seed++){
 const swap=seed%2===0,first=seed%2===0,a=await run(seed,swap,first),b=await run(seed,swap,!first),pair={seed,swap,off:first?b:a,on:first?a:b};
 pairs.push(pair);console.log('seed',seed,'off/on',JSON.stringify([pair.off,pair.on]));
}
writeFileSync(fileURLToPath(new URL('../docs/EXTERNAL_CROWD_WAR.json',import.meta.url)),JSON.stringify({seeds,seconds,pairs,
 caveats:['Only Yuka+ORCA enabled in on, for non-player infantry with a goal and no contact; all live units included as neighbors.','Experimental exact wall sweep enabled in both; does not cover every movement path.',
 'Real Game.step and AI, fixed horizon, no victory or balance conclusion. RNG diverges; outcomes not causal estimates.',
 'overlap sampled every 1 simulated second; may include spawning or existing overlap. Delivery count may be virtual. Timing includes probe and is not browser FPS.']},null,2)+'\n');
