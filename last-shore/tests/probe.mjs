import * as THREE from 'three';
import { World } from '../src/world.js';
const w = new World(new THREE.Scene());
let mx=-1e9, mxx=0,mxz=0;
for (let x=-180;x<=180;x+=1) for (let z=-180;z<=180;z+=1){ const h=w._rawHeight(x,z); if(h>mx){mx=h;mxx=x;mxz=z;} }
console.log('raw max', mx.toFixed(2), 'at', mxx, mxz);
// разложение
const s=w.seed;
let stats={ridge:0, mask:0};
for (let i=0;i<5000;i++){const x=(Math.random()-0.5)*300,z=(Math.random()-0.5)*300;
  stats.ridge+=w._rawHeight(x,z);}
console.log('avg', (stats.ridge/5000).toFixed(2));
import { fbm, ridged } from '../src/noise.js';
let rmax=0, mmax=0, rs=0, ms=0;
for (let i=0;i<20000;i++){const x=(Math.random()-0.5)*300,z=(Math.random()-0.5)*300;
 const r=ridged(x*0.017,z*0.017,4,s+11), m=fbm(x*0.006+40,z*0.006+9,2,s+3);
 rmax=Math.max(rmax,r); mmax=Math.max(mmax,m); rs+=r; ms+=m;}
console.log('ridged max/avg', rmax.toFixed(2), (rs/20000).toFixed(2), 'mask max/avg', mmax.toFixed(2), (ms/20000).toFixed(2));
