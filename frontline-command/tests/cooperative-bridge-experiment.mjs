import assert from 'node:assert/strict';import {spawnSync} from 'node:child_process';import {fileURLToPath} from 'node:url';
const file=fileURLToPath(new URL('../tools/opposing-columns.mjs',import.meta.url));const p=spawnSync(process.execPath,[file,'--attempts=1','--cooperative-bridge','--flags=motion_wall_sweep_v1,motion_wall_exact_v1'],{encoding:'utf8',maxBuffer:8*1024*1024});
assert.ok([0,1].includes(p.status),p.stderr);const d=JSON.parse(p.stdout);assert.equal(d.results.length,2);
for(const s of d.results){const m=s.bridgeMetrics;assert.ok(m.calls&&m.proposals&&m.yukaNonzero&&m.orcaCalls);assert.equal(m.proposals,(m.calls-m.skipped)*4);assert.equal(m.orcaCalls,(m.calls-m.skipped)*2);assert.equal(Object.values(m.selected).reduce((a,b)=>a+b,0),m.calls-m.skipped);assert.equal(s.immediateSweepHits,0);assert.equal(s.overlapFrames,0);}
console.log('cooperative bridge diagnostic: four proposals, real adapters, physical checks and metrics OK');
