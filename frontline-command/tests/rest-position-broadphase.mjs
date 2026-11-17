// Exact broad-phase must preserve the old conservative scan for every rest
// query/goal, including after wall changes and near spatial-cell boundaries.
import assert from 'node:assert/strict';import {loadConfig} from '../src/core/config.js';import {Game} from '../src/sim/game.js';
import {unsafeRest,safeRestGoal} from '../src/sim/rest_positions.js';
const cfg=await loadConfig();const g=new Game({cfg,seed:7,aiVsAi:true}),walls=g.walls;
const fast=walls.refsInBox.bind(walls),buildings=g.world.buildings.filter(b=>walls.state(b));
let z=1234567;const rnd=()=>((z=(Math.imul(z,1664525)+1013904223)>>>0)/4294967296);
for(let i=0;i<4000;i++){
 const b=buildings[i%buildings.length],x=b.x+(rnd()-.5)*400,y=b.y+(rnd()-.5)*400,r=[0,9,20,40][i%4];
 walls.refsInBox=fast;const actual=unsafeRest(g,x,y,r);walls.refsInBox=undefined;const expected=unsafeRest(g,x,y,r);assert.equal(actual,expected,`rest query ${i}`);
 if(i<500){const u={x:x+(rnd()-.5)*100,y:y+(rnd()-.5)*100,radius:r};walls.refsInBox=fast;const a=safeRestGoal(g,u,{x,y});walls.refsInBox=undefined;const b=safeRestGoal(g,u,{x,y});assert.deepEqual(a,b,`rest goal ${i}`);}
}
walls.refsInBox=fast;
console.log('rest broad phase: 4000 positions and 500 goals match the conservative search');
