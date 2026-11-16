// Paired live games with one deliberately destroyed starting city. The
// destruction is injected; all normal game systems continue to run.
import {loadConfig} from '../src/core/config.js';import {Game} from '../src/sim/game.js';
const n=Number(process.argv.find(s=>s.startsWith('--seeds='))?.slice(8)||20);
if(!Number.isSafeInteger(n)||n<1||n>100)throw Error('invalid seeds');
async function run(seed,faction,on){
 const cfg=await loadConfig();cfg.flags.wall_remove_destroyed_v1=on;
 const g=new Game({cfg,seed,aiVsAi:true}),b=g.world.buildings.find(b=>b.type==='city'&&b.faction===faction&&g.walls.state(b));
 if(!b)throw Error('missing city');const st=g.walls.state(b),geo=st.outline.segments.find(s=>s.blocksMove&&Math.hypot(s.points[1][0]-s.points[0][0],s.points[1][1]-s.points[0][1])>35);
 if(!geo)throw Error('missing segment');const [[a,c],[d,e]]=geo.points,x=b.x+(a+d)/2,y=b.y+(c+e)/2;
 const blocked=()=>g.walls.blocksMove(x,y,2,{isVehicle:false});
 let before=null,immediate=null,oneSecond=null,end=null,injected=false;
 for(let tick=0;tick<300&&!g.warOver;tick++){
  if(tick===50&&!b.dead&&b.built){before=blocked();g.world.damageBuilding(b,b.hp+1,1-faction);immediate=blocked();injected=true;}
  g.step(.1);if(tick===60&&injected)oneSecond=blocked();
 }
 if(injected)end=blocked();
 return {seed,faction,on,injected,before,immediate,oneSecond,end,seconds:g.time,warOver:g.warOver,outcome:g.outcome,kills:g.stats.kills,captures:g.stats.captures,deliveries:g.stats.deliveries};
}
const pairs=[];for(let seed=1;seed<=n;seed++)for(const faction of [0,1])pairs.push({seed,faction,off:await run(seed,faction,false),on:await run(seed,faction,true)});
const summary={cases:pairs.length,bothInjected:pairs.filter(p=>p.off.injected&&p.on.injected).length,blockedBefore:pairs.filter(p=>p.off.before&&p.on.before).length,
 offImmediate:pairs.filter(p=>p.off.immediate===true).length,onImmediate:pairs.filter(p=>p.on.immediate===true).length,
 offAfterOneSecond:pairs.filter(p=>p.off.oneSecond===true).length,onAfterOneSecond:pairs.filter(p=>p.on.oneSecond===true).length,
 offAtEnd:pairs.filter(p=>p.off.end===true).length,onAtEnd:pairs.filter(p=>p.on.end===true).length};
console.log(JSON.stringify({seeds:n,summary,pairs,caveats:['Normal Game.step and all systems active, but one starting city is forcibly destroyed at 5 seconds','One segment and two starting cities, 30 seconds maximum, not full war or complete destruction acceptance','Shared RNG trajectories may diverge; counts are descriptive, not causal balance estimates','Only wall_remove_destroyed_v1 changes; it remains off by default']},null,2));
if(summary.bothInjected!==pairs.length||summary.blockedBefore!==pairs.length||summary.onImmediate||summary.onAfterOneSecond||summary.onAtEnd)process.exitCode=1;
