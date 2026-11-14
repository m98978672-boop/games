import assert from 'node:assert/strict';
import {loadConfig} from '../src/core/config.js';
import {Game} from '../src/sim/game.js';
const cfg=await loadConfig();const g=new Game({cfg,seed:7,aiVsAi:true});
assert.ok(g.walls.destructionEnabled());
let state=93845;const rand=()=>((state=Math.imul(state,1664525)+1013904223>>>0)/4294967296);
let checks=0,misses=0,breaches=0,repairs=0;const types=new Set();
const buildings=[];for(const b of g.world.buildings){if(!g.walls.state(b)||buildings.some(x=>x.type===b.type))continue;buildings.push(b);if(buildings.length===5)break;}
assert.ok(buildings.length>=3);
function sample(b){
 for(const isVehicle of [false,true])for(let i=0;i<700;i++){
  const x0=b.x+(rand()-.5)*340,y0=b.y+(rand()-.5)*340,x1=x0+(rand()-.5)*90,y1=y0+(rand()-.5)*90,r=isVehicle?18.48:9,u={isVehicle};
  const steps=Math.max(1,Math.ceil(Math.hypot(x1-x0,y1-y0)/.25));let hit=false;
  for(let j=0;j<=steps;j++)if(g.walls.blocksMove(x0+(x1-x0)*j/steps,y0+(y1-y0)*j/steps,r,u)){hit=true;break;}
  const exact=g.walls.blocksMoveSweep(x0,y0,x1,y1,r,u);checks++;if(hit&&!exact)misses++;
 }
}
for(const b of buildings){
 const st=g.walls.state(b);types.add(b.type);sample(b);
 const seg=st.segs[0];assert.ok(seg);
 const geo=st.outline.segments.find(x=>x.id===seg.id),[[ax,ay],[bx,by]]=geo.points;
 const dx=bx-ax,dy=by-ay,len=Math.hypot(dx,dy),nx=-dy/len,ny=dx/len;
 const x=b.x+(ax+bx)/2,y=b.y+(ay+by)/2;
 const crossing=()=>g.walls.blocksMoveSweep(x-30*nx,y-30*ny,x+30*nx,y+30*ny,1,{isVehicle:false});
 assert.equal(crossing(),true,'intact segment blocks sweep');assert.equal(g.walls.damageSegment(b,seg.id,1e9,'tank_cannon').breached,true);breaches++;
 assert.equal(crossing(),false,`breached segment ${b.type} must not block sweep`);sample(b);
 assert.ok(g.walls.repair(b,1e9)>0);assert.equal(seg.breached,false);repairs++;
 assert.equal(crossing(),true,`repaired segment ${b.type} must block sweep`);sample(b);
}
assert.equal(misses,0,`sweep missed ${misses} densely sampled collisions`);
console.log(JSON.stringify({buildings:buildings.map(b=>({id:b.id,type:b.type})),checks,misses,breaches,repairs,spacing:.25}));
