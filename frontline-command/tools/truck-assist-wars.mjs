// Paired ordinary games, observation only. A time horizon is not a draw.
import {loadConfig} from '../src/core/config.js';import {Game} from '../src/sim/game.js';
const get=n=>process.argv.find(s=>s.startsWith(`--${n}=`))?.slice(n.length+3);
const seeds=Number(get('seeds')||4),seconds=Number(get('seconds')||180);
if(!Number.isSafeInteger(seeds)||seeds<1||seeds>100||!Number.isFinite(seconds)||seconds<=0||seconds>1800)throw Error('invalid arguments');
async function run(seed,swap,on){
 const cfg=await loadConfig();cfg.flags.truck_route_assist_v1=on;cfg.flags.alg_deadlock=true;
 const g=new Game({cfg,seed,aiVsAi:true,swapSides:swap});let failures=0,physical=0,falseDelivery=0,activeTicks=0;
 g.events.on('pathFailed',e=>{if(e.role==='truck')failures++;});
 const unload=g.logistics.unloadTruck.bind(g.logistics);
 g.logistics.unloadTruck=(t,task)=>{const p=task.dropoff||task.request,range=task.dropoff?34:110;
   if(!t.pathFailed&&Math.hypot(t.x-p.x,t.y-p.y)<range&&t.cargo>0)physical++;else falseDelivery++;unload(t,task);};
 for(let i=0;i<Math.ceil(seconds/.1)&&!g.warOver;i++){
   g.step(.1);if(g._smartRouteState?.active?.unit?.role==='truck')activeTicks++;
 }
 return {on,seconds:+g.time.toFixed(2),warOver:g.warOver,outcome:g.outcome,kills:g.stats.kills,captures:g.stats.captures,
   truckFailures:failures,physicalDeliveries:physical,falseDeliveries:falseDelivery,activeSearchTicks:activeTicks,
   alive:[0,1].map(f=>[...g.units.values()].filter(u=>u.alive&&u.faction===f).length)};
}
const pairs=[];for(let seed=1;seed<=seeds;seed++){
 const swap=seed%2===0,first=seed%2===0,a=await run(seed,swap,first),b=await run(seed,swap,!first);
 const p={seed,swap,off:a.on?b:a,on:a.on?a:b};pairs.push(p);
 console.error(`seed ${seed}: deliveries ${p.off.physicalDeliveries}/${p.on.physicalDeliveries}; failures ${p.off.truckFailures}/${p.on.truckFailures}; search ticks ${p.on.activeSearchTicks}`);
}
console.log(JSON.stringify({seeds,seconds,pairs,caveats:['normal game but short non-adjudicating horizon','random streams and battles may diverge between modes','not browser FPS, full balance, or a soak test','delivery counter excludes virtual backup delivery']},null,2));
