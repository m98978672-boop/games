// Focused activation and safety smoke checks; not game acceptance tests.
import assert from 'node:assert/strict';import {spawnSync} from 'node:child_process';import {fileURLToPath} from 'node:url';
const script=fileURLToPath(new URL('../tools/opposing-columns.mjs',import.meta.url));
function run(...extra){const p=spawnSync(process.execPath,[script,'--attempts=1','--flags=motion_wall_sweep_v1,motion_wall_exact_v1',...extra],{encoding:'utf8',maxBuffer:10*1024*1024});assert.ok([0,1].includes(p.status),p.stderr);return JSON.parse(p.stdout).results;}
const mix=run('--orca','--yuka-separation=10');
assert.ok(mix.every(x=>x.steeringMetrics.changed>0&&x.externalMetrics.orcaAdjusted>0));
const tree=run('--behavior-tree');assert.ok(tree.every(x=>x.externalMetrics.treeWaits>0));
const recast=run('--recast');assert.ok(recast.every(x=>x.recastMetrics.paths>0&&x.recastMetrics.used>0));
for(const r of [...mix,...tree,...recast])assert.ok(!r.speed&&!r.overlapFrames&&!r.immediateSweepHits);
if(process.env.PYPIBT_PYTHON){const pibt=run('--pibt');assert.ok(pibt.every(x=>x.pibtMetrics.planSolved&&x.pibtMetrics.planValid&&x.pibtMetrics.steering>0));}
console.log('External algorithms: activation and smoke movement checks passed');
