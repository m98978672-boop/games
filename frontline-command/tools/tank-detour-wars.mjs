// Observational paired ordinary games, not a balance acceptance.
import {loadConfig} from '../src/core/config.js';import {Game} from '../src/sim/game.js';
const get=n=>process.argv.find(x=>x.startsWith(`--${n}=`))?.slice(n.length+3);
const seeds=Number(get('seeds')||4),seconds=Number(get('seconds')||180);
if(!Number.isSafeInteger(seeds)||seeds<1||seeds>100||!Number.isFinite(seconds)||seconds<=0||seconds>1800)throw Error('invalid args');
async function run(seed,swap,on){const cfg=await loadConfig();cfg.flags.tank_detour_v1=on;cfg.flags.alg_deadlock=true;
 const g=new Game({cfg,seed,difficulty:'regular',aiVsAi:true,swapSides:swap});let tankFailures=0,truckFailures=0,detourSamples=0;g._detourMetrics={fieldDetours:0};
 g.events.on('pathFailed',e=>{if(e.role==='tank')tankFailures++;if(e.role==='truck')truckFailures++;});
 for(let i=0;i<Math.ceil(seconds/.1)&&!g.warOver;i++){
  g.step(.1);for(const u of g.units.values())if(u.alive&&u.role==='tank'&&u.detour)detourSamples++;
 }
 return {on,seconds:+g.time.toFixed(2),warOver:g.warOver,outcome:g.outcome,failures:g.deadlockStats?.pathFailures||[0,0],tankFailures,truckFailures,detourSamples,fieldDetours:g._detourMetrics.fieldDetours,kills:g.stats.kills,deliveries:g.stats.deliveries,
 alive:[0,1].map(f=>[...g.units.values()].filter(u=>u.alive&&u.faction===f).length)};}
const pairs=[];for(let seed=1;seed<=seeds;seed++){const swap=seed%2===0,first=seed%2===0,a=await run(seed,swap,first),b=await run(seed,swap,!first);const p={seed,swap,off:first?b:a,on:first?a:b};pairs.push(p);
 console.error(`seed ${seed}: tank fails ${p.off.tankFailures}/${p.on.tankFailures}, delivery ${p.off.deliveries.join('+')}/${p.on.deliveries.join('+')}, field detours ${p.on.fieldDetours}`);}
console.log(JSON.stringify({seeds,seconds,pairs,limitations:['Only tank_detour_v1 changed; detour samples count all active tank detours, not necessarily the new branch',
 'Short horizon is not a draw; divergent choices change random streams',
 'Stats deliveries may include virtual deliveries, not only physical truck unloading',
 'Not a proof of full balance, collision-free navigation, or browser FPS']},null,2));
