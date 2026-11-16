// C6-inspired diagnostic, not full C6 acceptance. Real Game.step, controlled AI.
import {loadConfig} from '../src/core/config.js';import {Game} from '../src/sim/game.js';import {Walls} from '../src/sim/walls.js';import {killUnit} from '../src/sim/units.js';
import {emptyOverlapMetrics,observeOverlaps} from '../tests/acceptance/overlap-metrics.mjs';
const n=Number(process.argv.find(x=>x.startsWith('--seeds='))?.slice(8)||20);if(!Number.isSafeInteger(n)||n<1||n>100)throw Error('invalid seeds');
async function run(seed,faction,type,door,kind,on){
 const cfg=await loadConfig();cfg.flags.movement_occupancy_v1=on;
 const g=new Game({cfg,seed,aiVsAi:true});g.units.clear();g.unitGrid.clear();g.squads.clear();g.autopilot.update=()=>{};for(const a of g.strategic)a.update=()=>{};
 g.rules.update=()=>{};g.logistics.update=()=>{};g.checkVictory=()=>{};
 const b=g.world.buildings.find(b=>b.type===type&&b.faction===faction&&g.walls.state(b));
 const st=g.walls.state(b),o=st.outline.openings.filter(o=>o.type==='door')[door],px=b.x+o.cx,py=b.y+o.cy;
 const us=Array.from({length:kind==='group3'?3:5},(_,i)=>{const u=g.spawnUnit(faction,'infantry',px+o.nx*(55+i*24),py+o.ny*(55+i*24));
  u.goal={x:px-o.nx*105,y:py-o.ny*105};u.activity='advance';u.arrived=false;u.thinkTimer=10000;return u;});
 let victim=null,deathTick=null,swept=0,wall=0,speed=0,ticks=0;const crossed=new Set(),overlap=emptyOverlapMetrics();
 g._motionDiagnostic=(u,x1,y1,x2,y2)=>{if(!us.includes(u))return;for(const v of us)if(v!==u&&v.alive&&!v.downed){const r=u.radius+v.radius;
  if(Math.hypot(x1-v.x,y1-v.y)>=r&&Walls.distPointSegment(v.x,v.y,x1,y1,x2,y2).d<r-1e-9)swept++;}};
 for(;ticks<1200;ticks++){
  const before=us.map(u=>({x:u.x,y:u.y,speed:u.speed*g.world.speedAt(u.x,u.y)}));g.step(.05);
  for(let i=0;i<us.length;i++){const u=us[i],p=before[i];if(!u.alive)continue;
   if((u.x-px)*o.nx+(u.y-py)*o.ny<0)crossed.add(u.id);
   if(g.walls.blocksMove(u.x,u.y,u.radius,u))wall++;
   if(Math.hypot(u.x-p.x,u.y-p.y)>Math.max(p.speed,cfg.navBudget.antiStuck.pushSpeedFloor??30)*.05*1.5+1e-8)speed++;
  }
  observeOverlaps(us.filter(u=>u.alive),overlap);
  if(!victim){const candidate=us.find(u=>u.alive&&Walls.distPointSegment(u.x,u.y,b.x+o.p1[0],b.y+o.p1[1],b.x+o.p2[0],b.y+o.p2[1]).d<=u.radius+(st.outline.thickness||12)/2);
   if(candidate){victim=candidate;deathTick=ticks+1;killUnit(g,candidate);}}
  if(victim&&us.filter(u=>u.alive).every(u=>u.arrived||u.pathFailed))break;
 }
 const survivors=us.filter(u=>u.alive),arrived=survivors.filter(u=>u.arrived&&!u.pathFailed).length,failed=survivors.filter(u=>u.pathFailed).length;
 const crossedSurvivors=survivors.filter(u=>crossed.has(u.id)).length,event=victim&&g.events.log.some(e=>e.name==='unitKilled'&&e.payload.unit===victim);
 return {count:us.length,survivors:survivors.length,deathTick,event:!!event,arrived,failed,crossedSurvivors,ticks:Math.min(ticks+1,1200),wall,speed,swept,...overlap,
  ok:!!event&&survivors.length===us.length-1&&arrived===survivors.length&&crossedSurvivors===survivors.length&&!failed&&!wall&&!speed&&!swept&&!overlap.overlapFrames};
}
const pairs=[];for(const type of ['hq','city'])for(const door of [0,1])for(const kind of ['group3','group5'])for(const faction of [0,1])for(let seed=1;seed<=n;seed++)
 pairs.push({type,door,kind,faction,seed,off:await run(seed,faction,type,door,kind,false),on:await run(seed,faction,type,door,kind,true)});
const summary={};for(const p of pairs){const s=summary[p.kind]||={cases:0,offPassed:0,onPassed:0,regressions:0,improvements:0,offDeath:0,onDeath:0,offSwept:0,onSwept:0,offOverlapFrames:0,onOverlapFrames:0};
 s.cases++;if(p.off.ok)s.offPassed++;if(p.on.ok)s.onPassed++;if(p.off.ok&&!p.on.ok)s.regressions++;if(!p.off.ok&&p.on.ok)s.improvements++;
 if(p.off.event)s.offDeath++;if(p.on.event)s.onDeath++;s.offSwept+=p.off.swept;s.onSwept+=p.on.swept;s.offOverlapFrames+=p.off.overlapFrames;s.onOverlapFrames+=p.on.overlapFrames;}
console.log(JSON.stringify({seeds:n,summary,pairs,caveats:['Controlled Game.step with first two HQ and city doors, both factions; first entering unit killed','Only movement_occupancy_v1 differs; no combat, autopilot, strategy, logistics updates or victory; infantry groups only','Not full acceptance of all crowd, death, combat or map scenarios']},null,2));
if(pairs.some(p=>!p.on.ok)||pairs.some(p=>p.off.ok&&!p.on.ok))process.exitCode=1;
