import assert from 'node:assert/strict';
import {layouts} from '../tools/training/collect-long-training.mjs';
import {visible} from '../tools/training/collect-obstacle-v2.mjs';
const splits=Object.fromEntries(['train','dev','test'].map(s=>[s,layouts(s)]));
for(const [a,b] of [['train','dev'],['train','test'],['dev','test']]){
 const ids=new Set(splits[a].map(s=>JSON.stringify(visible(s))));
 assert(!splits[b].some(s=>ids.has(JSON.stringify(visible(s)))),'observations separate');
 assert(!splits[a].some(s=>splits[b].some(t=>s.seed===t.seed)),'seeds separate');
 assert(!splits[a].some(s=>splits[b].some(t=>s.width===t.width&&s.height===t.height)),'sizes separate');
}
for(const a of splits.train.filter(s=>s.faction===0)){
 const b=splits.train.find(s=>s.width===a.width&&s.height===a.height&&s.offset===a.offset&&s.closed===a.closed&&s.faction===1);
 assert.deepEqual(visible(a),visible(b),'same observation rules for both sides');
}
console.log('Long training: disjoint navigation splits and identical mirrored observations');
