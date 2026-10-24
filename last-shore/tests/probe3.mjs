import * as THREE from 'three';
import { World } from '../src/world.js';
const w = new World(new THREE.Scene());
console.log('stats', w.stats);
let mx=-1e9, land=0, n=0, hist={};
for (let x=-180;x<=180;x+=2) for (let z=-180;z<=180;z+=2){
  const h=w.heightAt(x,z); n++; if(h>0.4) land++;
  mx=Math.max(mx,h);
  const b = h<0?'sea':h<2?'beach':h<6?'low':h<12?'mid':h<20?'high':'peak';
  hist[b]=(hist[b]||0)+1;
}
console.log('max', mx.toFixed(1), 'land%', (100*land/n).toFixed(1), hist);
