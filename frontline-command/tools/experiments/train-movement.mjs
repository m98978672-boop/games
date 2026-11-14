// Offline policy selection on a fixed, paired synthetic suite. Never changes game flags.
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, renameSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const files = ['tools/audit-u-variants.mjs', 'tools/experiments/u-planner-audit.mjs', 'tools/experiments/u-planner.mjs', 'src/sim/units.js', 'src/sim/nav.js', 'src/sim/walls.js', 'data/nav_budget.json'];
const hash = p => createHash('sha256').update(readFileSync(resolve(root,p))).digest('hex');
const key = r => [r.role,r.seed,r.rotation,r.size,r.faction].join('/');
const ok = r => r.arrived === true && r.pathFailed === false && r.collided === false && r.noTeleport === true && r.movesAway === true && r.distanceToGoal < 34;
function run(file) {
  const child = spawnSync(process.execPath, [file], { cwd: root, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024, timeout: 120000 });
  if (child.error || child.signal || ![0, 1].includes(child.status)) throw new Error(`audit failed: ${file}: ${child.error || child.stderr || child.signal || child.status}`);
  let result;
  try { result = JSON.parse(child.stdout); } catch { throw new Error(`invalid audit output: ${file}`); }
  if (result.vehicleDetour !== false || result.total !== 216 || !Array.isArray(result.results) || result.results.length !== 216) throw new Error(`incomplete audit: ${file}`);
  const map = new Map(result.results.map(r => [key(r),r]));
  for (const role of ['infantry','truck','tank']) for (const rotation of [0,1,2,3]) for (const size of [128,160,192])
    for (const seed of [5,7,11]) for (const faction of [0,1]) {
      const k = [role,seed,rotation,size,faction].join('/');
      const r = map.get(k);
      if (!r || !Number.isFinite(r.distanceToGoal) || ['arrived','pathFailed','collided','noTeleport','movesAway'].some(v => typeof r[v] !== 'boolean')) throw new Error(`invalid scene ${k}`);
    }
  if (map.size !== 216 || result.passed !== result.results.filter(ok).length || (child.status === 0) !== (result.passed === 216)) throw new Error(`inconsistent audit: ${file}`);
  return map;
}

const baseline = run('tools/audit-u-variants.mjs');
const candidate = run('tools/experiments/u-planner-audit.mjs');
function score(rotations) {
  const rows = [...baseline].filter(([,r]) => rotations.includes(r.rotation));
  let base = 0, trial = 0, regressions = 0, improvements = 0;
  for (const [k,r] of rows) {
    const a = ok(r), b = ok(candidate.get(k));
    base += Number(a); trial += Number(b);
    regressions += Number(a && !b); improvements += Number(!a && b);
  }
  return { scenes: rows.length, baseline: base, candidate: trial, regressions, improvements };
}
// Rotation groups are held out; neither suite covers real doors/crowds.
const training = score([0,2]), holdout = score([1,3]);
const winner = training.candidate > training.baseline && training.regressions === 0 && holdout.regressions === 0 && holdout.candidate > holdout.baseline ? 'experimental_planner' : 'baseline';
const times = [...candidate.values()].filter(r => r.plans > 0).map(r => r.planTime).sort((a,b) => a-b);
const experience = {
  version: 1, experiment: 'synthetic-u-planner', recordedAt: new Date().toISOString(),
  runtime: process.version, platform: `${process.platform}-${process.arch}`,
  inputsSha256: Object.fromEntries(files.map(p => [p,hash(p)])),
  trainRotations: [0,2], holdoutRotations: [1,3], training, holdout,
  selectedForExperimentOnly: winner, productionEnabled: false,
  durationMs: { calls: times.length, mean: times.length ? +(times.reduce((a,b) => a+b,0)/times.length).toFixed(3) : null,
    p95: times.length ? times[Math.ceil(times.length*0.95)-1] : null, max: times.at(-1) ?? null },
  limitations: ['single units, static synthetic U walls, no combat', 'not tested for doors, moving obstacles, crowds or browser frame time', 'no game-side learning or automatic sync', 'selection is not a production acceptance'],
  scenes: [...baseline].map(([k,r]) => ({ key:k, baseline:ok(r), candidate:ok(candidate.get(k)) }))
};
const outputIndex = process.argv.indexOf('--output');
if (outputIndex >= 0 && (!process.argv[outputIndex+1] || process.argv[outputIndex+1].startsWith('--'))) throw new Error('missing --output path');
const out = resolve(root, outputIndex >= 0 ? process.argv[outputIndex+1] : 'data/ai_movement_experience.json');
let history = [];
if (existsSync(out)) {
  const previous = JSON.parse(readFileSync(out, 'utf8'));
  // Upgrade the initial one-run format, otherwise fail closed on unknown formats.
  if (previous?.version === 1 && previous.experiment === 'synthetic-u-planner') history = [previous];
  else if (previous?.version === 1 && Array.isArray(previous.history) && previous.history.length <= 20 &&
           previous.history.every(x => x?.version === 1 && x.experiment === 'synthetic-u-planner' && x.productionEnabled === false)) history = previous.history;
  else throw new Error('unknown or invalid experience file');
}
history = [...history, experience].slice(-20);
const temp = `${out}.${process.pid}.tmp`;
writeFileSync(temp, JSON.stringify({version:1, history},null,2)+'\n');
renameSync(temp,out);
console.log(JSON.stringify({ training, holdout, selectedForExperimentOnly:winner, durationMs:experience.durationMs, saved:out, runs:history.length, productionEnabled:false },null,2));
