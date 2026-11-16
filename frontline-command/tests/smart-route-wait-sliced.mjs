import assert from 'node:assert/strict';
import {loadConfig} from '../src/core/config.js';
import {Game} from '../src/sim/game.js';
import {updateTimers} from '../src/sim/units.js';
import {updateSmartRoute} from '../src/sim/smart_route.js';
async function scene(faction,wait){
  const cfg=await loadConfig();cfg.flags.smart_route_v2=true;cfg.flags.smart_route_wait_v1=wait;
  const game=new Game({cfg,seed:7,aiVsAi:true});game.units.clear();game.unitGrid.clear();
  const size=3000,inside=(x,y)=>x>0&&y>0&&x<size&&y<size;
  game.world={W:size,H:size,navVersion:1,isBaseWalkable:inside,isWalkable:inside,speedAt:()=>1};
  game.walls={enabled:()=>true,blocksMove:()=>false,buildingAtPoint:()=>null,navQueue:new Set()};
  const u=game.spawnUnit(faction,'infantry',400,400);u.goal={x:2100,y:2100};u.stuck=1;u.arrived=false;
  let ticks=0;
  for(;ticks<115 && !u.pathFailed && !u._smartRoute;ticks++){
    game.time+=.05;updateTimers(game,u,.05);if(u.goal)updateSmartRoute(game,u);
  }
  return {failed:u.pathFailed,found:!!u._smartRoute,seconds:ticks*.05,ops:game._smartRouteState?.active?.planner.operations};
}
for(const faction of [0,1]){
 const old=await scene(faction,false),now=await scene(faction,true);
 assert(old.failed&&!old.found,'legacy drops goal while search is building its grid');
 assert(now.found&&!now.failed && now.seconds<=6,'bounded search completes before its timeout');
 console.log(`faction ${faction}: legacy fails at ${old.seconds.toFixed(2)}s; search completes at ${now.seconds.toFixed(2)}s`);
}
