// Actual radio orders and Game.step against the game's HQ walls and doors.
// The destination is near in Euclidean distance, but lies across a solid wall.
import assert from 'node:assert/strict';
import {loadConfig} from '../src/core/config.js';
import {Game} from '../src/sim/game.js';
import {Squad} from '../src/sim/squads.js';

async function run(faction,dir,kind,seed){
  const cfg=await loadConfig(),g=new Game({cfg,seed,aiVsAi:true});
  g.units.clear();g.unitGrid.clear();g.squads.clear();g.api.orders=[];
  for(const system of [...g.strategic,g.autopilot,g.rules,g.logistics,g.build,g.influence])system.update=()=>{};
  g.checkVictory=()=>{};
  const b=g.world.buildings.find(b=>b.faction===faction&&b.type==='hq'&&g.walls.state(b));
  const seg=g.walls.state(b).outline.segments.find(s=>s.length>=80&&s.blocksMove);
  const [[ax,ay],[bx,by]]=seg.points,len=Math.hypot(bx-ax,by-ay),nx=-(by-ay)/len,ny=(bx-ax)/len;
  const mx=b.x+(ax+bx)/2,my=b.y+(ay+by)/2;
  const u=g.spawnUnit(faction,'infantry',mx+dir*nx*28,my+dir*ny*28),goal={x:mx-dir*nx*28,y:my-dir*ny*28};
  const sq=new Squad(g,{faction});g.squads.set(sq.id,sq);sq.addUnit(u);sq.retreatTier='never';sq.strategyId='rush';
  assert.equal(g.walls.blocksMoveSweep(u.x,u.y,goal.x,goal.y,u.radius,u),true,'a real solid wall separates start and goal');
  const order=g.api.issue({source:'player',type:kind,faction,squadIds:[sq.id],target:goal});
  let wallCross=false,maxStep=0,arrived=false,falseArrival=false;
  for(let i=0;i<1200;i++){
    const x=u.x,y=u.y;g.step(.05);
    const step=Math.hypot(x-u.x,y-u.y);maxStep=Math.max(maxStep,step);
    if(step>1e-8 && g.walls.blocksMoveSweep(x,y,u.x,u.y,u.radius,u))wallCross=true;
    if(order.status==='accepted'&&sq.state==='hold'){
      const d=Math.hypot(u.x-goal.x,u.y-goal.y);
      falseArrival=d>=90||g.walls.blocksMoveSweep(u.x,u.y,goal.x,goal.y,u.radius,u);
      arrived=!falseArrival;break;
    }
  }
  return {faction,dir,kind,seed,accepted:order.status==='accepted',arrived,falseArrival,wallCross,maxStep,limit:u.speed*.05*1.5,seconds:g.time};
}
const results=[];
for(const faction of [0,1])for(const dir of [-1,1])for(const kind of ['move','hold'])for(const seed of [5,7])results.push(await run(faction,dir,kind,seed));
console.log(JSON.stringify({total:results.length,arrived:results.filter(r=>r.arrived).length,falseArrival:results.filter(r=>r.falseArrival).length,wallCross:results.filter(r=>r.wallCross).length,results},null,2));
if(!process.argv.includes('--report'))for(const r of results){
  assert.ok(r.accepted&&r.arrived&&!r.falseArrival,`order must reach correct wall side: ${JSON.stringify(r)}`);
  assert.ok(!r.wallCross&&r.maxStep<=r.limit+1e-8,`no wall crossing or teleport: ${JSON.stringify(r)}`);
}
