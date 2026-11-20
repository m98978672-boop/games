import assert from 'node:assert/strict';
import {augment,collectBalanced} from '../tools/training/collect-commander-balanced.mjs';
import {teacher} from '../tools/training/collect-commander.mjs';
import {validateProposal} from '../src/sim/neutral_commander.js';
const input={squads:[{ammo:90,engineers:1},{ammo:10,engineers:0},{ammo:60,engineers:0}],points:[{kind:'city',key:true}],builds:[{progress:10}]};
assert.deepEqual(augment(input,0),augment(input,0));
const copies=new Set();for(let i=0;i<20;i++){
 const x=augment(input,i),json=JSON.stringify(x),p=teacher(x);copies.add(json);
 const s={input:x,squads:x.squads.map((_,i)=>i+1),points:x.points.map((_,i)=>i+1),builds:x.builds.map((_,i)=>i+1)};
 assert.ok(validateProposal(JSON.stringify(p),s));assert.doesNotMatch(json,/(faction|enemy|history|time)/i);
}
assert.ok(copies.size>4,'varied index and empty-list cases');assert.equal(input.squads.length,3,'no mutation');
const run=await collectBalanced({quick:true,variants:10}),seen=new Set();
for(const split of ['train','dev','test'])for(const row of run.data[split]){
 const key=JSON.stringify(row.input);assert.ok(!seen.has(key),'no observation duplication across splits');seen.add(key);
 assert.ok(run.stats[split].seeds.includes(row.seed));assert.deepEqual(JSON.parse(row.response),teacher(row.input));
}
for(const [a,b] of [['train','dev'],['train','test'],['dev','test']])assert.ok(run.stats[a].seeds.every(s=>!run.stats[b].seeds.includes(s)));
console.log('Balanced commander data: deterministic augmentation, separate seeds, valid proposals, no side leakage or input duplication.');
