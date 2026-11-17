// Diagnostic only: two opposing 3-person columns through one HQ door. Does
// not cover ten-person opposing columns, vehicles, docks or combat AI.
import {loadConfig} from '../src/core/config.js';
import {Game} from '../src/sim/game.js';
import {moveAlongFlow,updateTimers} from '../src/sim/units.js';
import {emptyOverlapMetrics,observeOverlaps} from '../tests/acceptance/overlap-metrics.mjs';
const arg=process.argv.find(s=>s.startsWith('--attempts='));const n=arg?Number(arg.slice(11)):20;
if(!Number.isInteger(n)||n<1||n>100)throw Error('attempts 1..100');
const cfg=await loadConfig();const results=[];
for(const faction of [0,1])for(let seed=1;seed<=n;seed++){
 const g=new Game({cfg,seed,aiVsAi:true});g.units.clear();g.unitGrid.clear();g.occupancyGrid.clear();g.squads.clear();
 const b=g.world.buildings.find(b=>b.type==='hq'&&b.faction===faction&&g.walls.state(b)),o=g.walls.state(b).outline.openings.find(o=>o.type==='door');
 const x=b.x+o.cx,y=b.y+o.cy,units=[];
 for(const side of [-1,1])for(let i=0;i<3;i++){
  const u=g.spawnUnit(faction,'infantry',x+side*o.nx*(45+i*22),y+side*o.ny*(45+i*22));
  u.goal={x:x-side*o.nx*(58+i*20),y:y-side*o.ny*(58+i*20)};u.activity='advance';u.arrived=false;units.push({u,side});
 }
 const crossed=new Set(),overlaps=emptyOverlapMetrics();let walls=0,speed=0;
 for(let tick=0;tick<1200;tick++){
  g.time+=.05;g.nav.advance();g.walls.update(.05);
  for(const {u,side} of units){
   if(u.arrived||u.pathFailed)continue;const ox=u.x,oy=u.y;
   updateTimers(g,u,.05);moveAlongFlow(g,u,.05);g.unitGrid.update(u);
   if(((u.x-x)*o.nx+(u.y-y)*o.ny)*side<0)crossed.add(u.id);
   if(g.walls.blocksMove(u.x,u.y,u.radius,u))walls++;
   if(Math.hypot(u.x-ox,u.y-oy)>Math.max(u.speed*g.world.speedAt(ox,oy),30)*.05*1.5+1e-8)speed++;
  }
  observeOverlaps(units.map(v=>v.u),overlaps);
  if(units.every(v=>v.u.arrived||v.u.pathFailed))break;
 }
 const arrived=units.filter(v=>v.u.arrived&&!v.u.pathFailed).length,failed=units.filter(v=>v.u.pathFailed).length;
 results.push({faction,seed,arrived,failed,crossed:crossed.size,walls,speed,overlapFrames:overlaps.overlapFrames,seconds:+g.time.toFixed(2)});
}
const passed=results.filter(r=>r.arrived===6&&r.crossed===6&&!r.failed&&!r.walls&&!r.speed&&!r.overlapFrames).length;
console.log(JSON.stringify({method:'two opposing 3-person infantry columns, separate HQ scene, manual movement ticks, no combat',scenes:results.length,passed,coverageComplete:false,results},null,2));
if(passed!==results.length)process.exitCode=1;
