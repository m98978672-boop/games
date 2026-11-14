// Smoke-test the diagnostic, not save/replay acceptance.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const tool=fileURLToPath(new URL('../tools/block0-save-continuation.mjs',import.meta.url));
const run=spawnSync(process.execPath,[tool,'--seeds=1','--before=120','--after=2'],{encoding:'utf8',timeout:30000,maxBuffer:1024*1024});
assert.ok(!run.error,run.error?.message);
const data=JSON.parse(run.stdout);
assert.equal(data.outcomes.length,2);
for(const [i,record] of data.outcomes.entries()){
  assert.equal(record.seed,1);assert.equal(record.extended,!!i);
  assert.equal(record.controlMismatch,null,'control must match original sampled projection');
  assert.equal(record.saveDidNotChangeCapturedGraph,true);
  assert.deepEqual(record.graphCheckpoints.map(x=>x.tick),[0,1,2]);
  const matched=Object.keys(record.firstByCategory).length===0&&record.graphCheckpoints.every(c=>c.matched);
  assert.equal(record.matched,matched);
}
assert.equal(data.passed,data.outcomes.every(x=>x.matched));
assert.equal(run.status,data.passed?0:1,'a detected replay mismatch must not exit successfully');
console.log('Save-continuation diagnostic ran; mismatches remain failures, this test is not replay acceptance');
