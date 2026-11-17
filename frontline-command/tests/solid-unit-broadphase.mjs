import assert from 'node:assert/strict';import {blockingUnit} from '../src/sim/solid_units.js';
// The original exhaustive calculation is an independent reference. Include
// existing overlap, exact tangencies, varied radii, zero and long steps.
function ref(u,x,y,clearance,units){
 const dx=x-u.x,dy=y-u.y,den=dx*dx+dy*dy;
 for(const o of units){if(o===u||!o.alive||o.downed)continue;
  const ox=u.x-o.x,oy=u.y-o.y,r=u.radius+o.radius+clearance,start2=ox*ox+oy*oy,end2=(x-o.x)**2+(y-o.y)**2;
  if(start2<r*r){if(end2<start2||ox*dx+oy*dy<0)return o;}
  else{const t=den?Math.max(0,Math.min(1,-(ox*dx+oy*dy)/den)):0;if((ox+dx*t)**2+(oy+dy*t)**2<r*r)return o;}
 }return null;
}
let z=76123;const rnd=()=>((z=(Math.imul(z,1664525)+1013904223)>>>0)/4294967296);
for(let i=0;i<15000;i++){
 const u={x:rnd()*512,y:rnd()*512,radius:2+rnd()*45},x=u.x+(rnd()-.5)*300,y=u.y+(rnd()-.5)*300,c=i%2?.01:0;
 const a=Array.from({length:12},()=>({x:u.x+(rnd()-.5)*500,y:u.y+(rnd()-.5)*500,radius:1+rnd()*45,alive:rnd()>.04,downed:rnd()<.04}));
 if(i%5===0)a[0]={x:u.x+u.radius+10+c,y:u.y,radius:10,alive:true,downed:false};
 assert.equal(blockingUnit({},u,x,y,c,null,a),ref(u,x,y,c,a),`random swept query ${i}`);
}
console.log('unit sweep broad phase: 15000 queries match the original exhaustive test');
