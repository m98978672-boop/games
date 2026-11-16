import assert from 'node:assert/strict';import {SpatialHash} from '../src/core/spatial.js';
const g=new SpatialHash(128,4096,4096),items=[];
for(let i=0;i<1000;i++){const p={x:(i*499)%4096,y:(i*701)%4096};items.push(p);g.insert(p);}
for(let i=0;i<500;i++){
 const x=(i*293)%4096,y=(i*109)%4096,r=(i*23)%400;
 const actual=new Set(g.queryRange(x,y,r));
 for(const p of items)if(Math.abs(x-p.x)<=r&&Math.abs(y-p.y)<=r)assert.ok(actual.has(p),'no candidate in bounding box missed');
}
console.log('occupancy spatial range: all bounding box candidates found across cell boundaries');
