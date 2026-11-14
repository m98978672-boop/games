import assert from 'node:assert/strict';import {motionSafetyProbe} from '../tools/motion-safety-probe.mjs';
const u={id:1,alive:true,radius:1},v={id:2,alive:true,radius:1,x:5,y:0};
const g={units:new Map([[1,u],[2,v]]),walls:{blocksMove:(x,y)=>x>=7&&x<=8}};
const {safety,callback}=motionSafetyProbe(g,()=>12);callback(u,0,0,10,0,'ordinary');
assert.equal(safety.moves,1);assert.equal(safety.newUnitSweeps,1,'detects swept collision even if endpoints clear');
assert.equal(safety.blockedWallEdges,1,'detects intermediate wall even if endpoints clear');
assert.equal(safety.examples[0].tick,12);
callback(u,5,0,5,1,'rescue');assert.equal(safety.existingOverlaps,1,'reports prior overlap separately');
console.log('motion safety probe: catches swept unit/wall hits, separates existing overlap');
