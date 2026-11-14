import assert from 'node:assert/strict';import {loadConfig} from '../src/core/config.js';import {Game} from '../src/sim/game.js';import {motionWallSweepFree} from '../src/sim/motion_wall_sweep.js';
const cfg=await loadConfig();assert.equal(cfg.flag('motion_wall_exact_v1',false),false);
const g=new Game({cfg,seed:1,aiVsAi:true});let state=12345;const rand=()=>((state=Math.imul(state,1664525)+1013904223>>>0)/4294967296);
const b=g.world.buildings.find(b=>b.type==='hq'&&b.faction===0),st=g.walls.state(b),door=st.outline.openings.find(o=>o.type==='door');
// Vehicle / infantry, closed and open doors; exact cannot miss densely sampled geometry.
let checks=0;for(const open of [false,true]){
 if(open)g.walls.openDoor(b,door.id);else g.walls.closeDoor(b,door.id);
 for(const isVehicle of [false,true])for(let i=0;i<1500;i++){
  const x0=b.x+(rand()-.5)*320,y0=b.y+(rand()-.5)*320,x1=x0+(rand()-.5)*70,y1=y0+(rand()-.5)*70,r=isVehicle?18.48:9,u={isVehicle};
  const steps=Math.max(1,Math.ceil(Math.hypot(x1-x0,y1-y0)/.25));let sampled=false;
  for(let j=0;j<=steps;j++)if(g.walls.blocksMove(x0+(x1-x0)*j/steps,y0+(y1-y0)*j/steps,r,u)){sampled=true;break;}
  const exact=g.walls.blocksMoveSweep(x0,y0,x1,y1,r,u);assert.ok(!sampled||exact,'must not miss sampled collision');checks++;
 }
}
// A short sweep through a finite synthetic barrier with clear endpoints.
const calls=[];const fake={cfg:{flag:id=>id==='motion_wall_sweep_v1'||id==='motion_wall_exact_v1'},walls:{enabled:()=>true,blocksMove:()=>false,blocksMoveSweep:(...x)=>{calls.push(x);return true;}}};
assert.equal(motionWallSweepFree(fake,{x:0,y:0,radius:1},10,0),false);assert.equal(calls.length,1);
console.log(`exact wall sweep: ${checks} real-geometry sweeps vs dense samples, open/closed doors and vehicle/infantry`);
