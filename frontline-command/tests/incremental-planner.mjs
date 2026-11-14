import assert from 'node:assert/strict';
import { IncrementalPlanner } from '../tools/experiments/incremental-planner.mjs';
import { findRoute } from '../tools/experiments/u-planner.mjs';

function scene() {
  const game={world:{W:1024,H:1024,navVersion:1,isBaseWalkable:(x,y)=>x>0&&y>0&&x<1024&&y<1024},
    walls:{blocksMove:(x,y,r)=>x+r>=500&&x-r<=506&&y+r>=80&&y-r<=750}};
  const unit={x:380,y:400,radius:9,goal:{x:630,y:400},alive:true,downed:false};
  return {game,unit};
}
function finish(p,budget=7) {
  let result;
  for(let k=0;k<20000;k++) { result=p.step(budget);assert.ok(result.used<=budget);if(result.status!=='running')return result; }
  throw new Error('planner did not terminate');
}
{
  const {game,unit}=scene(), p=new IncrementalPlanner(game,unit);
  const result=finish(p);
  assert.equal(result.status,'found');
  assert.deepEqual(result.path,findRoute(game,unit).path,'sliced and monolithic searches agree');
  assert.ok(p.operations>7 && p.expanded>0);
  let previous={x:unit.x,y:unit.y};
  for(const waypoint of result.path){
    const length=Math.hypot(waypoint.x-previous.x,waypoint.y-previous.y), steps=Math.max(1,Math.ceil(length/4));
    for(let i=0;i<=steps;i++){const x=previous.x+(waypoint.x-previous.x)*i/steps,y=previous.y+(waypoint.y-previous.y)*i/steps;
      assert.equal(game.walls.blocksMove(x,y,unit.radius),false,'route crosses wall'); }
    previous=waypoint;
  }
  assert.deepEqual(result.path.at(-1),unit.goal);
  assert.equal(p.step(7).used,0);
}
for(const mutate of [
  ({game})=>game.world.navVersion++, ({unit})=>unit.goal.x+=3,
  ({unit})=>unit.x+=33, ({unit})=>unit.alive=false,
  ({unit})=>unit.goal=null, ({unit})=>unit.x=NaN, ({unit})=>unit.radius+=1,
  ({game})=>game.walls.navQueue=new Set([1]),
  ({game})=>game.world={...game.world}, ({game})=>game.walls={...game.walls},
]) {
  const s=scene(),p=new IncrementalPlanner(s.game,s.unit);p.step(10);mutate(s);
  assert.equal(p.step(10).status,'cancelled');assert.equal(p.path,null);assert.equal(p.reason,'stale');
}
{
  const {game,unit}=scene();game.walls.blocksMove=()=>true;
  assert.equal(finish(new IncrementalPlanner(game,unit)).status,'failed');
}
for (const which of ['start','goal']) {
  const {game,unit}=scene();
  const point=which==='start'?unit:unit.goal;
  const x=point.x,y=point.y;
  game.walls.blocksMove=(px,py)=>Math.hypot(px-x,py-y)<1;
  assert.equal(finish(new IncrementalPlanner(game,unit)).status,'failed',`blocked ${which} must not yield a path`);
}
{
  const {game,unit}=scene();const p=new IncrementalPlanner(game,unit);
  assert.throws(()=>p.step(0));assert.throws(()=>p.step(1.5));
  p.cancel();assert.equal(p.step(5).status,'cancelled');
  assert.throws(()=>new IncrementalPlanner({...game,world:{...game.world,W:1e9}},unit));
}
console.log('incremental planner: sliced search, path clearance, stale cancellation and bounds OK');
