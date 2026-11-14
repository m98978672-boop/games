// Diagnostic only: natural spawns remain enabled, so this is NOT the exact 400/500 acceptance test.
// Instrumentation itself adds overhead; nested categories overlap and must not be summed.
import { performance } from 'node:perf_hooks';
import { loadConfig } from '../src/core/config.js';
import { Game } from '../src/sim/game.js';
const parse=(name,fallback)=>{const x=process.argv.find(a=>a.startsWith(`--${name}=`));const n=x?Number(x.slice(name.length+3)):fallback;if(!Number.isInteger(n)||n<1||n>1000)throw Error(`invalid ${name}`);return n;};
const seeds=parse('seeds',20),warmup=parse('warmup',30),ticks=parse('ticks',120);
const cfg=await loadConfig();
const measures=[];
for(const target of [400,500])for(let seed=1;seed<=seeds;seed++){
  const game=new Game({cfg,seed,difficulty:'regular',aiVsAi:true});
  const count=f=>[...game.units.values()].filter(u=>u.alive&&(f===null||u.faction===f)).length;
  for(const f of [0,1]){let i=0;const hq=game.world.hqOf(f);while(count(f)<target/2){const a=i*2.399963229728653,r=150+(i%10)*20;game.spawnUnit(f,i%11===0?'mg':'infantry',hq.x+Math.cos(a)*r,hq.y+Math.sin(a)*r,{});i++;}}
  const initial=count(null), totals={}, calls={}; let measuring=false;
  const wrap=(object,method,label)=>{const original=object[method];if(typeof original!=='function')throw Error(`missing ${label}.${method}`);object[method]=function(...args){const begin=performance.now();try{return original.apply(this,args);}finally{if(measuring){totals[label]=(totals[label]||0)+performance.now()-begin;calls[label]=(calls[label]||0)+1;}}};};
  for(const [object,method,label] of [
    [game.nav,'advance','nav_advance'],[game.nav,'step','nav_step'],
    [game.unitGrid,'clear','grid_clear'],[game.unitGrid,'insert','grid_insert'],[game.unitGrid,'query','grid_query'],[game.unitGrid,'update','grid_update'],
    [game.squadAI,'update','squad_ai'],...[...game.strategic].map(x=>[x,'update','strategic_ai']),
    [game.autopilot,'update','autopilot'],[game.logistics,'update','logistics'],[game.build,'update','build'],[game.walls,'update','walls'],[game.influence,'update','influence'],[game.api,'update','commands']
  ])wrap(object,method,label);
  for(let i=0;i<warmup;i++)game.step(.1);
  let min=count(null),max=min;const samples=[];measuring=true;
  for(let i=0;i<ticks;i++){const start=performance.now();game.step(.1);samples.push(performance.now()-start);const n=count(null);min=Math.min(min,n);max=Math.max(max,n);}
  measuring=false;const sum=samples.reduce((a,b)=>a+b,0),sorted=[...samples].sort((a,b)=>a-b);
  measures.push({target,seed,initial,minAlive:min,maxAlive:max,finalAlive:count(null),warOver:game.warOver,simTime:game.time,ticks,
    tickMs:{mean:sum/ticks,p95:sorted[Math.ceil(ticks*.95)-1],max:sorted.at(-1)},
    instrumentedMsPerTick:Object.fromEntries(Object.keys(totals).sort().map(k=>[k,totals[k]/ticks])),calls});
}
console.log(JSON.stringify({kind:'simulation_profile_diagnostic',environment:'Node '+process.version,dt:.1,warmupTicks:warmup,measuredTicks:ticks,seeds,
  caveats:['No rendering or GPU; not FPS acceptance.','Natural spawns and deaths enabled; target is only initial.','Timers add overhead; some categories are nested and overlap.','Soldier AI and physics/bullets are not isolated.','No paired before/after comparison.'],measures},null,2));
