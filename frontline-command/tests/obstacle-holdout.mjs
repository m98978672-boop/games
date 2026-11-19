import assert from 'node:assert/strict';
import {holdout} from '../tools/training/obstacle-holdout.mjs';
import {scenes} from '../tools/training/collect-obstacle-v2.mjs';
import {simulate} from '../tools/training/collect-obstacle-game.mjs';
import {simulateFallback} from '../tools/training/obstacle-fallback-sim.mjs';
const fresh=holdout().rows,old=['train','dev','test'].flatMap(s=>scenes(s));assert.equal(fresh.length,48);
for(const {spec,input} of fresh){
 assert(!old.some(s=>s.seed===spec.seed),'new seeds');
 assert(!old.some(s=>s.width===spec.width&&s.height===spec.height),'new sizes');
 assert.deepEqual(Object.keys(input).sort(),['goal','walls','waypoints']);
 const m=fresh.find(r=>r.spec.width===spec.width&&r.spec.height===spec.height&&r.spec.offset===spec.offset&&r.spec.closed===spec.closed&&r.spec.faction!==spec.faction);
 assert.deepEqual(input,m.input,'mirrored public inputs');
}
for(const faction of [0,1]){
 const s=fresh.find(r=>r.spec.faction===faction&&r.spec.closed==='U').spec;
 const plain=await simulate(s,'U'),same=await simulateFallback(s,'U');
 for(const k of ['near','wallCross','seconds','accepted','switched','maxStep','limit'])assert.equal(plain[k],same[k],'same physics without fallback');
 const r=await simulateFallback(s,'U',{fallbackAfter:12});
 assert(r.fallback&&r.switched&&r.near&&!r.wallCross&&r.accepted===2,'wrong candidate falls back safely in a test case');
}
console.log('Frozen-model holdout: fresh sizes and seeds, mirrored inputs, timed fallback via real game orders');
