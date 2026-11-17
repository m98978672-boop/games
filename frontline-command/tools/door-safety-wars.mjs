// Paired observational wars; a time limit is not a draw or proof of balance.
import {loadConfig} from '../src/core/config.js';import {Game} from '../src/sim/game.js';
const get=n=>process.argv.find(x=>x.startsWith(`--${n}=`))?.slice(n.length+3);
const seeds=Number(get('seeds')||4),seconds=Number(get('seconds')||180);
if(!Number.isSafeInteger(seeds)||seeds<1||seeds>100||!Number.isFinite(seconds)||seconds<=0||seconds>1800)throw Error('invalid args');
async function run(seed,swap,on){const cfg=await loadConfig();cfg.flags.motion_slide_guard_v1=false;cfg.flags.door_occupied_guard_v1=on;cfg.flags.alg_deadlock=true;
 const g=new Game({cfg,seed,difficulty:'regular',aiVsAi:true,swapSides:swap});let blockedClose=0;
 g.events.on('doorCloseBlocked',()=>blockedClose++);
 for(let i=0;i<Math.ceil(seconds/.1)&&!g.warOver;i++)g.step(.1);
 return {on,seconds:+g.time.toFixed(2),warOver:g.warOver,outcome:g.outcome,failures:g.deadlockStats?.pathFailures||[0,0],kills:g.stats.kills,deliveries:g.stats.deliveries,blockedClose,
 alive:[0,1].map(f=>[...g.units.values()].filter(u=>u.alive&&u.faction===f).length)};}
const pairs=[];for(let seed=1;seed<=seeds;seed++){const swap=seed%2===0,first=seed%2===0,a=await run(seed,swap,first),b=await run(seed,swap,!first);const p={seed,swap,off:first?b:a,on:first?a:b};pairs.push(p);
 console.error(`seed ${seed}: path failures ${p.off.failures.join('+')}/${p.on.failures.join('+')}, blocked closes ${p.on.blockedClose}`);}
console.log(JSON.stringify({seeds,seconds,pairs,limitations:['Only the door occupied guard flag differs; motion_slide_guard_v1 is off in both runs',
 'Short observation horizon is not an adjudicated draw; random streams and game state diverge',
 'No guarantee of collision-free movement, victory balance, or browser FPS']},null,2));
