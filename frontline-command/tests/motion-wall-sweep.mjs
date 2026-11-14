import assert from 'node:assert/strict';import {motionWallSweepFree} from '../src/sim/motion_wall_sweep.js';
const u={x:0,y:0,radius:1},g={cfg:{flag:(name)=>name==='motion_wall_sweep_v1'},walls:{enabled:()=>true,blocksMove:(x)=>x>=4&&x<=5}};
assert.equal(g.walls.blocksMove(0),false);assert.equal(g.walls.blocksMove(10),false);
assert.equal(motionWallSweepFree(g,u,10,0),false,'sampled intermediate wall');
assert.equal(motionWallSweepFree(g,u,3,0),true);
g.cfg.flag=()=>false;assert.equal(motionWallSweepFree(g,u,10,0),true,'disabled mode unchanged');
g.cfg.flag=()=>true;u.x=4;assert.equal(motionWallSweepFree(g,u,10,0),true,'already embedded uses separate rescue');
console.log('wall sweep: opt-in detects intermediate wall, preserves rescue when starting embedded');
