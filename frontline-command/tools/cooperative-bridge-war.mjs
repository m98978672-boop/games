import {loadConfig} from '../src/core/config.js';import {Game} from '../src/sim/game.js';import {installCooperativeBridge} from './experiments/cooperative-bridge.mjs';import {emptyOverlapMetrics,observeOverlaps} from '../tests/acceptance/overlap-metrics.mjs';import {writeFileSync} from 'node:fs';import {fileURLToPath} from 'node:url';
const seeds=Number(process.argv.find(s=>s.startsWith('--seeds='))?.slice(8)||2),seconds=Number(process.argv.find(s=>s.startsWith('--seconds='))?.slice(10)||180);if(!Number.isInteger(seeds)||seeds<1||seeds>20||seconds<=0||seconds>900)throw Error('invalid arguments');
const pairs=[];
for(let seed=1;seed<=seeds;seed++){
 let pair={seed,swap:seed%2===0};for(const on of (seed%2?[false,true]:[true,false])){
  const cfg=await loadConfig();cfg.flags.motion_wall_sweep_v1=true;cfg.flags.motion_wall_exact_v1=true;cfg.flags.alg_deadlock=true;
  const g=new Game({cfg,seed,swapSides:pair.swap,aiVsAi:true});const bridge=on?await installCooperativeBridge(g):null,overlap=emptyOverlapMetrics();let sweep=0,moves=0;
  g._motionDiagnostic=(u,x,y,nx,ny)=>{if(Math.hypot(nx-x,ny-y)<1e-9)return;moves++;if(g.walls.blocksMoveSweep(x,y,nx,ny,u.radius,u))sweep++;};const start=performance.now();
  for(let i=0;i<Math.ceil(seconds/.1)&&!g.warOver;i++){g.step(.1);if(i%10===0)observeOverlaps([...g.units.values()].filter(u=>u.alive&&!u.downed),overlap);}
  const result={seconds:+g.time.toFixed(1),ms:Math.round(performance.now()-start),outcome:g.outcome,alive:[0,1].map(f=>[...g.units.values()].filter(u=>u.alive&&u.faction===f).length),kills:g.stats.kills,captures:g.stats.captures,deliveries:g.stats.deliveries,pathFailures:g.deadlockStats?.pathFailures,moves,sweep,overlap,bridge};pair[on?'bridge':'original']=result;console.log(seed,on,JSON.stringify(result));
 }pairs.push(pair);
}
writeFileSync(fileURLToPath(new URL('../docs/COOPERATIVE_BRIDGE_WAR.json',import.meta.url)),JSON.stringify({seeds,seconds,caveats:['Experiment only, no deployment. Same seeds; RNG diverges.','Exact sweep enabled in both. Overlaps sampled once per second, not continuous.','Deliveries can still be automatic, not physical helper work.','One fixed horizon does not prove balance, victory or browser performance.'],pairs},null,2)+'\n');
