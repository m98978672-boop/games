// Диагностика отдельных входящих колонн: две геометрии, размеры, отклонения и стороны.
// Это не замена полной приёмки или встречных потоков.
import { loadConfig } from '../src/core/config.js';
import { Game } from '../src/sim/game.js';
import { moveAlongFlow, updateTimers } from '../src/sim/units.js';
const cfg=await loadConfig();
const enabled=!process.argv.includes('--flag-off');
cfg.flags.crowd_nav_v2=enabled;
function scenario(type,faction,seed,count,jitter) {
  const game=new Game({cfg,seed,aiVsAi:true});
  game.units.clear();game.unitGrid.clear();
  const building=game.world.buildings.find(b=>b.type===type&&b.faction===faction&&game.walls.state(b));
  const opening=building && game.walls.state(building).outline.openings.find(o=>o.type==='door');
  if(!opening) throw new Error(`missing ${type} door faction ${faction}`);
  const px=building.x+opening.cx,py=building.y+opening.cy;
  const units=Array.from({length:count},(_,i)=>{
    const side=(i%2 ? -1:1)*jitter, distance=55+i*24;
    const u=game.spawnUnit(faction,'infantry',px+opening.nx*distance-opening.ny*side,py+opening.ny*distance+opening.nx*side);
    u.goal={x:px-opening.nx*100,y:py-opening.ny*100};u.activity='advance';u.arrived=false;return u;
  });
  let collisions=0, speed=0, overlapFrames=0;const crossed=new Set();
  for(let tick=0;tick<600;tick++){
    game.time+=.05;game.nav.advance();game.walls.update(.05);
    for(const u of units){
      if(u.arrived||u.pathFailed)continue;
      const x=u.x,y=u.y,terrain=game.world.speedAt(x,y);
      updateTimers(game,u,.05);moveAlongFlow(game,u,.05);game.unitGrid.update(u);
      if((u.x-px)*opening.nx+(u.y-py)*opening.ny<0)crossed.add(u.id);
      if(Math.hypot(u.x-x,u.y-y)>Math.max(u.speed*terrain,30)*.05*1.5+1e-8)speed++;
      if(game.walls.blocksMove(u.x,u.y,u.radius,u))collisions++;
    }
    if(units.some((a,i)=>units.slice(i+1).some(b=>Math.hypot(a.x-b.x,a.y-b.y)<a.radius+b.radius)))overlapFrames++;
    if(units.every(u=>u.arrived||u.pathFailed))break;
  }
  const arrived=units.filter(u=>u.arrived&&!u.pathFailed).length;
  return {type,faction,seed,count,jitter,arrived,crossed:crossed.size,collisions,speed,overlapFrames,
    passed:arrived===count&&crossed.size===count&&!collisions&&!speed&&!overlapFrames};
}
const results=[];
for(const type of ['hq','city'])for(const faction of [0,1])for(const seed of [5,7,11])
  for(const count of [6,8,10])for(const jitter of [0,4,8,12,16]) results.push(scenario(type,faction,seed,count,jitter));
const passed=results.filter(r=>r.passed).length;
console.log(JSON.stringify({enabled,total:results.length,passed,results},null,2));
if(passed!==results.length)process.exitCode=1;
