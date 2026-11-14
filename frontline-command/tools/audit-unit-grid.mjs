// Проверка согласованности пространственного индекса после реальных шагов игры.
import {loadConfig} from '../src/core/config.js';
import {Game} from '../src/sim/game.js';
const cfg=await loadConfig();const runs=[];
for(const seed of [5,7,11]) {
  const game=new Game({cfg,seed,aiVsAi:true});let mismatches=0,crossings=0,observations=0;const examples=[];
  for(let tick=0;tick<60;tick++){
    const previous=new Map([...game.units.values()].filter(u=>u.alive).map(u=>[u,game.unitGrid.key(u.x,u.y)]));
    game.step(.1);
    for(const u of game.units.values())if(u.alive){
      const actual=game.unitGrid.key(u.x,u.y),indexed=game.unitGrid.cellOf.get(u);
      if(previous.has(u)&&previous.get(u)!==actual)crossings++;
      observations++;
      if(indexed!==actual||!game.unitGrid.query(u.x,u.y,0).includes(u)){
        mismatches++;if(examples.length<3)examples.push({tick,id:u.id,faction:u.faction,role:u.role,x:u.x,y:u.y,indexed:indexed??null,actual});
      }
    }
  }
  runs.push({seed,ticks:60,crossings,observations,mismatches,examples});
}
const passed=runs.every(r=>r.crossings>0&&r.observations>0&&r.mismatches===0);
console.log(JSON.stringify({passed,method:'3 seeds × 60 live Game.step ticks; cell and bucket compared with current position',runs},null,2));
if(!passed)process.exitCode=1;
