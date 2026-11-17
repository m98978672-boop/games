// Paired real AI games, only vehicle_gate_access_v1 differs.
import {loadConfig} from '../src/core/config.js';import {Game} from '../src/sim/game.js';
const arg=n=>process.argv.find(x=>x.startsWith(`--${n}=`))?.slice(n.length+3),seeds=Number(arg('seeds')||4),seconds=Number(arg('seconds')||180);
if(!Number.isSafeInteger(seeds)||seeds<1||seeds>50||!Number.isFinite(seconds)||seconds<=0||seconds>1800)throw Error('invalid arguments');
async function run(seed,swap,on){
 const cfg=await loadConfig();cfg.flags.vehicle_gate_access_v1=on;cfg.flags.alg_deadlock=true;
 const g=new Game({cfg,seed,swapSides:swap,difficulty:'regular',aiVsAi:true});g._vehicleGateMetrics={preserved:0};let truckFailures=0,tankFailures=0;
 g.events.on('pathFailed',e=>{if(e.role==='truck')truckFailures++;if(e.role==='tank')tankFailures++;});
 for(let i=0;i<Math.ceil(seconds/.1)&&!g.warOver;i++)g.step(.1);
 return {on,seconds:+g.time.toFixed(2),warOver:g.warOver,outcome:g.outcome,gateGoalSamples:g._vehicleGateMetrics.preserved,truckFailures,tankFailures,failures:g.deadlockStats?.pathFailures||[0,0],kills:g.stats.kills,captures:g.stats.captures,deliveries:g.stats.deliveries,
 alive:[0,1].map(f=>[...g.units.values()].filter(u=>u.alive&&u.faction===f).length)};
}
const pairs=[];for(let seed=1;seed<=seeds;seed++){
 const swap=seed%2===0,first=seed%2===0,a=await run(seed,swap,first),b=await run(seed,swap,!first),p={seed,swap,off:first?b:a,on:first?a:b};pairs.push(p);
 console.error(`seed ${seed}: goal samples ${p.on.gateGoalSamples}, truck failures ${p.off.truckFailures}/${p.on.truckFailures}, deliveries ${p.off.deliveries.join('+')}/${p.on.deliveries.join('+')}`);
}
console.log(JSON.stringify({seeds,seconds,pairs,caveats:['Only vehicle_gate_access_v1 differs; diagnostics enabled in both','Goal samples count repeated moveAlongFlow checks, not completed gate crossings','Fixed horizon is not a draw, diverging decisions alter the RNG stream','Deliveries include virtual deliveries; no proof of balance, unimpeded routes or FPS']},null,2));
