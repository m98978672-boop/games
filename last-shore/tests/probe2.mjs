import * as THREE from 'three';
import { World } from '../src/world.js';
import { fbm, ridged, smoothstep } from '../src/noise.js';
const w = new World(new THREE.Scene());
const s = w.seed, SIZE = 360;
function parts(x,z){
  const r = Math.hypot(x,z)/(SIZE*0.5);
  const coast=(fbm(x*0.008+11.3,z*0.008-4.7,3,s+5)-0.5)*0.30;
  const edge=0.64+coast;
  const mass=smoothstep(edge+0.20,edge-0.34,r);
  const hills=fbm(x*0.013,z*0.013,4,s+7);
  const detail=fbm(x*0.055,z*0.055,2,s+21);
  const mask=smoothstep(0.36,0.72,fbm(x*0.006+40,z*0.006+9,2,s+3));
  const mtn=ridged(x*0.017,z*0.017,4,s+11)*27*mask;
  return {r:r.toFixed(2),mass:mass.toFixed(2),hills:hills.toFixed(2),detail:detail.toFixed(2),mask:mask.toFixed(2),mtn:mtn.toFixed(1)};
}
console.log(parts(-9,-69));
console.log(parts(0,0), parts(20,10), parts(-40,30));
