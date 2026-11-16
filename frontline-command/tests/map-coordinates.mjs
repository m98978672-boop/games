import assert from 'node:assert/strict';
import {worldToMap,mapToWorld,mapVector,gridStep,scaleBarStep,visibleGrid,zoomCamera,fitCamera,MAP_STEPS} from '../src/core/map_coordinates.js';
const world={W:4096,H:4096};
assert.deepEqual(worldToMap(world,2048,2048),{x:0,y:0});
assert.deepEqual(worldToMap(world,0,0),{x:-2048,y:2048});assert.deepEqual(worldToMap(world,4096,4096),{x:2048,y:-2048});
for(let i=0;i<1000;i++){
 const a={x:(i*683)%4096,y:(i*373)%4096},b={x:(i*971)%4096,y:(i*193)%4096};
 const m=worldToMap(world,a.x,a.y),w=mapToWorld(world,m.x,m.y),v=mapVector(a,b);
 assert.deepEqual(w,a);assert.equal(v.x,b.x-a.x);assert.equal(v.y,a.y-b.y);assert.equal(v.length,Math.hypot(b.x-a.x,b.y-a.y));
 if(v.length)assert.ok(Math.abs(Math.hypot(v.unitX,v.unitY)-1)<1e-12);else assert.equal(v.unitX+v.unitY,0);
}
for(const zoom of [.1,.28,.32,.72,1,1.8,4])for(const [step,limit] of [[gridStep(zoom),220],[scaleBarStep(zoom),160]]) {
 assert.ok(MAP_STEPS.includes(step));assert.ok(step*zoom<=limit);const next=MAP_STEPS[MAP_STEPS.indexOf(step)+1];assert.ok(!next||next*zoom>limit);
}
assert.throws(()=>gridStep(0),RangeError);assert.throws(()=>gridStep(NaN),RangeError);
for(const camera of [{x:2048,y:2048,zoom:.32},{x:0,y:0,zoom:.72},{x:4096,y:4096,zoom:1.8}]){
 const r=visibleGrid(world,camera,1280,900);assert.ok(r.bounds);
 for(const l of r.vertical){assert.ok(l.world>=r.bounds.x0&&l.world<=r.bounds.x1);assert.equal(l.value,l.world-world.W/2);assert.ok(l.value%r.step===0);}
 for(const l of r.horizontal){assert.ok(l.world>=r.bounds.y0&&l.world<=r.bounds.y1);assert.equal(l.value,world.H/2-l.world);assert.ok(l.value%r.step===0);}
 assert.ok(r.vertical.length<100&&r.horizontal.length<100,'only visible lines are enumerated');
}
assert.equal(visibleGrid(world,{x:10000,y:10000,zoom:1},400,400).bounds,null);
const rectangular={W:1000,H:800};assert.deepEqual(worldToMap(rectangular,500,400),{x:0,y:0});assert.deepEqual(mapToWorld(rectangular,-500,400),{x:0,y:0});
const camera={x:2048,y:2048,zoom:.72},view={width:1280,height:900},anchor={x:900,y:350};
const original={x:camera.x+(anchor.x-view.width/2)/camera.zoom,y:camera.y+(anchor.y-view.height/2)/camera.zoom};
for(const next of [.3,1.8]){const z=zoomCamera(camera,view,world,next,anchor);const actual={x:z.x+(anchor.x-view.width/2)/z.zoom,y:z.y+(anchor.y-view.height/2)/z.zoom};
 assert.ok(Math.abs(actual.x-original.x)<1e-9&&Math.abs(actual.y-original.y)<1e-9,'zoom keeps anchor');}
const edge=zoomCamera({x:0,y:0,zoom:1},view,world,.1,{x:1280,y:900});assert.ok(edge.x>=0&&edge.x<=world.W&&edge.y>=0&&edge.y<=world.H);
const fit=fitCamera(view,world);assert.deepEqual([fit.x,fit.y],[2048,2048]);assert.ok(world.W*fit.zoom<=view.width&&world.H*fit.zoom<=view.height);
const smallFit=fitCamera({width:390,height:844},world);assert.ok(world.W*smallFit.zoom<=390&&world.H*smallFit.zoom<=844);
console.log('coordinate map: centred north-up transforms, vectors, visible grid, scale, anchor zoom and fit passed');
