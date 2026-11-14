import assert from 'node:assert/strict';
import { EasyStarPlanner } from '../src/sim/easystar_route.js';

function scene(){
  const game={world:{W:1024,H:1024,navVersion:1,isBaseWalkable:(x,y)=>x>0&&y>0&&x<1024&&y<1024},
    walls:{blocksMove:(x,y,r)=>x+r>=500&&x-r<=506&&y+r>=80&&y-r<=750,navQueue:new Set()}};
  const unit={x:380,y:400,radius:9,goal:{x:630,y:400},alive:true,downed:false};return {game,unit};
}
function finish(p,budget=23){for(let i=0;i<5000;i++){const r=p.step(budget);assert.ok(r.used<=budget);if(r.status!=='running')return r;}throw Error('unbounded search');}
{
  const {game,unit}=scene(), p=new EasyStarPlanner(game,unit), result=finish(p);
  assert.equal(result.status,'found');assert.deepEqual(result.path.at(-1),unit.goal);
  let previous={x:unit.x,y:unit.y};
  for(const point of result.path){const steps=Math.ceil(Math.hypot(point.x-previous.x,point.y-previous.y)/4);
    for(let i=0;i<=steps;i++){const t=steps?i/steps:0;assert.equal(game.walls.blocksMove(previous.x+(point.x-previous.x)*t,previous.y+(point.y-previous.y)*t,unit.radius),false,'path crosses wall');}previous=point;}
  assert.equal(p.step(23).used,0);
}
for(const mutate of [({game})=>game.world.navVersion++,({game})=>game.walls.navQueue.add(1),
  ({unit})=>unit.goal.x+=5,({unit})=>unit.x+=33,({unit})=>unit.alive=false,({unit})=>unit.goal=null,
  ({unit})=>unit.radius++,({game})=>game.world={...game.world}]){
  const s=scene(),p=new EasyStarPlanner(s.game,s.unit);p.step(23);mutate(s);
  assert.equal(p.step(23).status,'cancelled');assert.equal(p.path,null);
}
for(const which of ['start','goal']){
  const {game,unit}=scene(),p=which==='start'?unit:unit.goal,x=p.x,y=p.y;
  const old=game.walls.blocksMove;game.walls.blocksMove=(a,b,r)=>Math.hypot(a-x,b-y)<1||old(a,b,r);
  assert.equal(finish(new EasyStarPlanner(game,unit)).status,'failed',`${which} must be free`);
}
{
  const {game,unit}=scene(),p=new EasyStarPlanner(game,unit);assert.throws(()=>p.step(0));assert.throws(()=>p.step(1.5));
  p.cancel();assert.equal(p.step(5).status,'cancelled');
  unit.goal={x:1e9,y:1e9}; game.world.W=1e9;game.world.H=1e9;
  assert.throws(()=>new EasyStarPlanner(game,unit),'large grid rejected');
}
console.log('EasyStar route: bounded search, wall clearance, cancellation, unreachable endpoints and size guard OK');
