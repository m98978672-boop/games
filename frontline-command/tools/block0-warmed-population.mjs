// Diagnostic candidate for an exact-population scene; does not disable spawns,
// deaths or AI. This is not a rendering benchmark or a gameplay fix.
import { loadConfig } from '../src/core/config.js';
import { Game } from '../src/sim/game.js';
import { createPopulationMonitor } from '../tests/acceptance/population-monitor.js';
const option=(name,def,max=10000)=>{const v=process.argv.slice(2).filter(x=>x.startsWith(`--${name}=`));if(v.length>1)throw Error(`duplicate ${name}`);const n=v.length?Number(v[0].slice(name.length+3)):def;if(!Number.isSafeInteger(n)||n<1||n>max)throw Error(`invalid ${name}`);return n;};
const seeds=option('seeds',20), warmup=option('warmup',300), ticks=option('ticks',600);
const runs=[];
for(const target of [400,500])for(let seed=1;seed<=seeds;seed++){
  const game=new Game({cfg:await loadConfig(),seed,aiVsAi:true,difficulty:'regular'});
  const count=f=>{let n=0;for(const u of game.units.values())if(u.alive&&(f===null||u.faction===f))n++;return n;};
  for(let i=0;i<warmup;i++)game.step(1/60);
  const warmupAlive=[count(0),count(1)];
  if(game.warOver||warmupAlive.some(n=>n>target/2))throw Error(`scene cannot reach exact initial population without removal: ${target}, seed ${seed}`);
  for(const f of [0,1]){
    const hq=game.world.hqOf(f);let k=0;
    while(count(f)<target/2){const a=k*2.399963229728653,r=150+(k%10)*20;game.spawnUnit(f,k%11===0?'mg':'infantry',hq.x+Math.cos(a)*r,hq.y+Math.sin(a)*r,{});k++;}
  }
  const initial=count(null), simStart=game.time, monitor=createPopulationMonitor(target,initial,{requireFrames:false});
  monitor.observe(initial,'start');
  let steps=0,warOverAt=null;
  for(let tick=1;tick<=ticks;tick++){
    monitor.observe(count(null),'before-step');game.step(1/60);monitor.observe(count(null),'after-step');steps++;
    if(game.warOver&&warOverAt===null)warOverAt=tick;
  }
  const population=monitor.summary();
  const pass=population.strictExact&&!game.warOver&&Math.abs((game.time-simStart)-ticks/60)<1e-8;
  runs.push({target,seed,warmupAlive,simStart,simEnd:game.time,steps,warOverAt,population,pass});
  console.error(`${target} seed ${seed}/${seeds}: ${population.minAlive}-${population.maxAlive}, exact=${pass}`);
}
const passed=runs.every(r=>r.pass);
console.log(JSON.stringify({passed,kind:'warmed_population_scenario_diagnostic',node:process.version,seeds,warmupTicks:warmup,measuredTicks:ticks,dt:1/60,
  limits:['Node only: no browser, draw, FPS or target device','Warmup occurs before scripted top-up to the exact target','All normal game spawning, deaths and AI remain enabled','Counts sampled before and after each step, not continuously inside it','No frame observations are performed in Node','This candidate scenario is not the original FPS workload'],runs},null,2));
if(!passed)process.exitCode=1;
