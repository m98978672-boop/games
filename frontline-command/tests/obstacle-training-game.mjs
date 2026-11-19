import assert from 'node:assert/strict';
import {layouts,observation,simulate} from '../tools/training/collect-obstacle-game.mjs';
const train=layouts('train'),evals=layouts('eval');
const key=s=>JSON.stringify(observation(s));
const ts=new Set(train.map(key)),es=new Set(evals.map(key));
assert.equal(ts.size,train.length);assert.equal(es.size,evals.length);
assert(![...ts].some(x=>es.has(x)),'train/eval observations must differ');
assert(!train.some(a=>evals.some(b=>a.seed===b.seed)),'train/eval seeds must differ');
assert(!train.some(a=>evals.some(b=>a.width===b.width&&a.height===b.height)),'train/eval size families must differ');
for(const faction of [0,1])for(const closed of ['U','D']){
 const s=evals.find(r=>r.width===208&&r.offset===-32&&r.faction===faction&&r.closed===closed);
 const good=await simulate(s,closed==='U'?'D':'U'),bad=await simulate(s,closed);
 assert(good.near&&!good.wallCross&&good.switched&&good.accepted===2&&good.maxStep<=good.limit+1e-8,'open waypoint executed safely');
 assert(!bad.switched&&!bad.near&&!bad.wallCross,'blocked waypoint is not executed through wall');
 assert.deepEqual(Object.keys(good.obs).sort(),['goal','start','walls','waypoints']);
}
console.log('Game-based obstacle demonstrations: split isolation, both factions, two blocked sides, safe physical replay');
