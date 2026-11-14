import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('..', import.meta.url));
const dir = mkdtempSync(join(tmpdir(), 'frontline-learning-'));
const out = join(dir, 'experience.json');
try {
  const run = () => spawnSync(process.execPath, ['tools/experiments/train-movement.mjs','--output',out], { cwd:root, encoding:'utf8', timeout:120000 });
  for (let count = 1; count <= 2; count++) {
    const p = run();
    assert.equal(p.status, 0, p.stderr);
    const data = JSON.parse(readFileSync(out, 'utf8'));
    assert.equal(data.history.length, count);
    const last = data.history.at(-1);
    assert.equal(last.productionEnabled, false);
    assert.equal(last.scenes.length, 216);
    assert.equal(last.training.scenes, 108);
    assert.equal(last.holdout.scenes, 108);
    assert.equal(last.training.baseline + last.training.improvements - last.training.regressions, last.training.candidate);
    assert.equal(last.holdout.baseline + last.holdout.improvements - last.holdout.regressions, last.holdout.candidate);
  }
  writeFileSync(out, '{"version":2}');
  const bad = run();
  assert.notEqual(bad.status, 0, 'unknown format must not be overwritten');
  assert.equal(readFileSync(out, 'utf8'), '{"version":2}');
  console.log('movement experiment: paired evaluation, persistence and fail-closed format OK');
} finally { rmSync(dir, {recursive:true, force:true}); }
