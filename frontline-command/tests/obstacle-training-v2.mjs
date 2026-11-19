import assert from 'node:assert/strict';
import {scenes,visible} from '../tools/training/collect-obstacle-v2.mjs';
import {simulate} from '../tools/training/collect-obstacle-game.mjs';
const sets=Object.fromEntries(['train','dev','test'].map(k=>[k,scenes(k)]));
for(const [a,b] of [['train','dev'],['train','test'],['dev','test']]){
 const ids=new Set(sets[a].map(s=>JSON.stringify(visible(s))));
 assert(!sets[b].some(s=>ids.has(JSON.stringify(visible(s)))),'no observation leakage');
 assert(!sets[a].some(s=>sets[b].some(t=>s.seed===t.seed)),'no seed leakage');
 assert(!sets[a].some(s=>sets[b].some(t=>s.width===t.width&&s.height===t.height)),'no size leakage');
}
for(const a of sets.train.filter(s=>s.faction===0)){
 const b=sets.train.find(s=>s.width===a.width&&s.height===a.height&&s.offset===a.offset&&s.closed===a.closed&&s.faction===1);
 assert.deepEqual(visible(a),visible(b),'mirrored inputs are identical');
 assert.deepEqual(Object.keys(visible(a)).sort(),['goal','walls','waypoints'],'observation excludes faction and answer');
}
for(const faction of [0,1])for(const closed of ['U','D']){
 const s=sets.train.find(x=>x.width===192&&x.height===192&&x.offset===-48&&x.faction===faction&&x.closed===closed);
 const wrong=await simulate(s,closed),correct=await simulate(s,closed==='U'?'D':'U');
 assert(!wrong.near&&!wrong.wallCross,'closed waypoint cannot cross wall or reach goal');
 assert(correct.near&&!correct.wallCross&&correct.accepted===2&&correct.switched,'valid waypoint actually reaches goal');
}
console.log('Expanded waypoint study: distinct splits, mirrored inputs, real ticks and wall safety verified');
