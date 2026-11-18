// Opt-in research adapter smoke test, not a navigation acceptance test.
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const scene=fileURLToPath(new URL('../tools/opposing-columns.mjs',import.meta.url));
function run(...args){
 const p=spawnSync(process.execPath,[scene,'--attempts=2',...args],{encoding:'utf8'});
 assert.ok([0,1].includes(p.status),p.stderr);return JSON.parse(p.stdout);
}
const base=run(),identity=run('--steering-identity'),yuka=run('--yuka-separation=10');
assert.ok(identity.results.reduce((n,r)=>n+r.steeringMetrics.calls,0)>0);
assert.ok(yuka.results.reduce((n,r)=>n+r.steeringMetrics.changed,0)>0,'external separation was actually evaluated');
for(const d of [base,identity])for(const r of d.results)delete r.steeringMetrics;
assert.deepEqual(identity,base,'identity adapter must not change the observed baseline');
assert.ok(yuka.results.every(r=>r.speed===0&&r.overlapFrames===0),'smoke scenes retain speed and occupancy checks');
console.log('Yuka diagnostic: baseline parity, external force activation and smoke safety passed');
