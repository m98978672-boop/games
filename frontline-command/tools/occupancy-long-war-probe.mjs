// Diagnostic, sequential swept circles and frame positions in ordinary wars.
import {loadConfig} from '../src/core/config.js';import {Game} from '../src/sim/game.js';import {Walls} from '../src/sim/walls.js';
const arg=n=>process.argv.find(x=>x.startsWith(`--${n}=`))?.slice(n.length+3),seeds=Number(arg('seeds')||2),seconds=Number(arg('seconds')||120);
if(!Number.isSafeInteger(seeds)||seeds<1||seeds>20||!Number.isFinite(seconds)||seconds<=0||seconds>600)throw Error('bad arguments');
async function run(seed,swap,on){
 const cfg=await loadConfig();cfg.flags.movement_occupancy_v1=on;cfg.flags.alg_deadlock=true;
 const g=new Game({cfg,seed,swapSides:swap,difficulty:'regular',aiVsAi:true});
 let initial=0,overlapFrames=0,pairFrames=0,maxPairs=0,swept=0,segments=0,truckFailures=0;
 const pairs=()=>{const us=[...g.units.values()].filter(u=>u.alive&&!u.downed);let n=0;for(let i=0;i<us.length;i++)for(let j=i+1;j<us.length;j++)if(Math.hypot(us[i].x-us[j].x,us[i].y-us[j].y)<us[i].radius+us[j].radius-1e-7)n++;return n;};
 initial=pairs();g.events.on('pathFailed',e=>{if(e.role==='truck')truckFailures++;});
 g._motionDiagnostic=(u,x,y,nx,ny)=>{if(x===nx&&y===ny)return;segments++;for(const v of g.units.values())if(v!==u&&v.alive&&!v.downed){const r=u.radius+v.radius;
  if(Math.hypot(x-v.x,y-v.y)>=r-1e-7&&Walls.distPointSegment(v.x,v.y,x,y,nx,ny).d<r-1e-7)swept++;}};
 let steps=0;for(;steps<Math.ceil(seconds/.1)&&!g.warOver;steps++){g.step(.1);const count=pairs();if(count)overlapFrames++;pairFrames+=count;maxPairs=Math.max(count,maxPairs);}
 return {on,seconds:+g.time.toFixed(2),steps,warOver:g.warOver,outcome:g.outcome,initial,overlapFrames,pairFrames,maxPairs,swept,segments,truckFailures,
 failures:g.deadlockStats?.pathFailures||[0,0],kills:g.stats.kills,deliveries:g.stats.deliveries};
}
const pairs=[];for(let seed=1;seed<=seeds;seed++){
 const swap=seed%2===0,first=seed%2===0,a=await run(seed,swap,first),b=await run(seed,swap,!first),p={seed,swap,off:first?b:a,on:first?a:b};pairs.push(p);
 console.error(`seed ${seed}: overlap frames ${p.off.overlapFrames}/${p.on.overlapFrames}, swept ${p.off.swept}/${p.on.swept}, deliveries ${p.off.deliveries.join('+')}/${p.on.deliveries.join('+')}`);
}
console.log(JSON.stringify({seeds,seconds,pairs,caveats:['Only movement_occupancy_v1 differs; algorithm diagnostics on in both',
 'Sequential segments tested against live standing bodies, excluding pairs already overlapping at segment start',
 'At game-step boundaries alive standing overlaps are counted; events between moves that do not use moveUnit are not swept',
 'Different unit creation and RNG consumption change trajectories; limited seeds and horizon are not balance, progress or FPS acceptance',
 'Old saves and toggling mid-game can start with overlaps; downed and dead bodies are non-solid; deliveries can include virtual delivery']},null,2));
