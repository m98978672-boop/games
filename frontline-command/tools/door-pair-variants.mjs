// Paired doorway stress cases: two allied infantry, no combat/vehicles.
import { loadConfig } from '../src/core/config.js';
import { Game } from '../src/sim/game.js';
import { moveAlongFlow,updateTimers } from '../src/sim/units.js';
const arg=process.argv.find(x=>x.startsWith('--seeds='));const seeds=arg?Number(arg.slice(8)):20;
if(!Number.isSafeInteger(seeds)||seeds<1||seeds>100)throw Error('invalid seed count');
const cfg=await loadConfig();
const configs=[{label:'symmetric',dist:[85,85],offset:[0,0]},{label:'staggered',dist:[55,105],offset:[0,0]},
  {label:'cross-lanes',dist:[85,85],offset:[-8,8]}];
function scene({seed,faction,type,doorIndex,layout,reverse},on){
  cfg.flags.door_pair_lanes_v1=on;
  const g=new Game({cfg,seed,aiVsAi:true});g.units.clear();g.unitGrid.clear();
  const b=g.world.buildings.find(b=>b.type===type&&b.faction===faction&&g.walls.state(b));
  const o=b&&g.walls.state(b).outline.openings.filter(o=>o.type==='door')[doorIndex];
  if(!o)throw Error(`missing ${type} door ${doorIndex} faction ${faction}`);
  const px=b.x+o.cx,py=b.y+o.cy;
  const units=[-1,1].map((side,i)=>{
    const u=g.spawnUnit(faction,'infantry',px+side*o.nx*layout.dist[i]-o.ny*layout.offset[i],py+side*o.ny*layout.dist[i]+o.nx*layout.offset[i]);
    u.goal={x:px-side*o.nx*105,y:py-side*o.ny*105};u.activity='advance';u.arrived=false;return {u,side};
  });
  const crossed=new Set();let overlapFrames=0,speed=0,walls=0,teleports=0,activeFrames=0;
  for(let tick=0;tick<1200;tick++){
    g.time+=.05;g.nav.advance();g.walls.update(.05);
    for(const {u,side} of (reverse?[...units].reverse():units)){
      if(u.arrived||u.pathFailed)continue;
      const x=u.x,y=u.y,terrain=g.world.speedAt(x,y);updateTimers(g,u,.05);moveAlongFlow(g,u,.05);g.unitGrid.update(u);
      if(u._doorPass)activeFrames++;
      if(((u.x-px)*o.nx+(u.y-py)*o.ny)*side<0)crossed.add(u.id);
      const ratio=Math.hypot(u.x-x,u.y-y)/(Math.max(u.speed*terrain,cfg.navBudget.antiStuck.pushSpeedFloor??30)*.05);
      if(ratio>1.5+1e-8)speed++;if(ratio>10+1e-8)teleports++;
      if(g.walls.blocksMove(u.x,u.y,u.radius,u))walls++;
    }
    if(Math.hypot(units[0].u.x-units[1].u.x,units[0].u.y-units[1].u.y)<units[0].u.radius+units[1].u.radius)overlapFrames++;
    if(units.every(({u})=>u.arrived||u.pathFailed))break;
  }
  const arrived=units.filter(({u})=>u.arrived&&!u.pathFailed).length,failed=units.filter(({u})=>u.pathFailed).length;
  return {ok:arrived===2&&crossed.size===2&&!failed&&!overlapFrames&&!speed&&!teleports&&!walls,
    arrived,crossed:crossed.size,failed,overlapFrames,speed,teleports,walls,activeFrames,seconds:+g.time.toFixed(2)};
}
const pairs=[];
for(const type of ['hq','city'])for(let faction=0;faction<2;faction++)for(let doorIndex=0;doorIndex<2;doorIndex++)
for(const layout of configs)for(const reverse of [false,true])for(let seed=1;seed<=seeds;seed++){
  const input={seed,faction,type,doorIndex,layout,reverse};pairs.push({seed,faction,type,doorIndex,layout:layout.label,reverse,off:scene(input,false),on:scene(input,true)});
}
const groups={};for(const p of pairs){const k=`${p.type}/${p.layout}/${p.reverse?'reverse':'forward'}`,x=groups[k]||={cases:0,off:0,on:0,regressed:0};x.cases++;if(p.off.ok)x.off++;if(p.on.ok)x.on++;if(p.off.ok&&!p.on.ok)x.regressed++;}
const summary={pairs:pairs.length,offPassed:pairs.filter(x=>x.off.ok).length,onPassed:pairs.filter(x=>x.on.ok).length,
  improved:pairs.filter(x=>!x.off.ok&&x.on.ok).length,regressed:pairs.filter(x=>x.off.ok&&!x.on.ok).length,
  activeCases:pairs.filter(x=>x.on.activeFrames>0).length,groups};
console.log(JSON.stringify({kind:'paired_door_pair_variants',seeds,summary,pairs,
  limitations:['Two allied infantry, no combat; not a crowd, vehicle or dock acceptance','Frame-level overlap and movement checks; query index refreshed after each movement in this test','Real two door outlines for HQ/city, one geometry per faction; three layouts','Order reversed in the test but real Game.step uses shuffled order and a start-of-tick grid','No FPS, full balance or replay proof']},null,2));
if(summary.onPassed!==pairs.length||summary.regressed)process.exitCode=1;
