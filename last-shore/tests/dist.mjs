import { fbm, ridged } from '../src/noise.js';
function stats(fn, n=20000){
  const v=[]; for(let i=0;i<n;i++){const x=(Math.random()-0.5)*330,z=(Math.random()-0.5)*330; v.push(fn(x,z));}
  v.sort((a,b)=>a-b);
  const q=p=>v[Math.floor(p*n)].toFixed(2);
  return `min ${q(0)} p10 ${q(0.1)} p50 ${q(0.5)} p90 ${q(0.9)} max ${q(0.999)}`;
}
console.log('fbm4@0.013', stats((x,z)=>fbm(x*0.013,z*0.013,4,7)));
console.log('fbm4@0.02 ', stats((x,z)=>fbm(x*0.02,z*0.02,4,7)));
console.log('fbm4@0.035', stats((x,z)=>fbm(x*0.035,z*0.035,4,7)));
console.log('fbm2@0.006', stats((x,z)=>fbm(x*0.006,z*0.006,2,3)));
console.log('fbm3@0.01 ', stats((x,z)=>fbm(x*0.01,z*0.01,3,3)));
console.log('ridged@0.017', stats((x,z)=>ridged(x*0.017,z*0.017,4,11)));
console.log('ridged@0.03 ', stats((x,z)=>ridged(x*0.03,z*0.03,4,11)));
