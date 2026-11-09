// Проверка самого независимого аудита: отсутствие доказательств — не успех.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { requirements, validateEvidence, verdict } from '../tools/block1-auditor.mjs';

assert.equal(verdict([]), 'NOT_ACCEPTED');
assert.equal(verdict([{ id: 'full_suite', status: 'pass' }]), 'NOT_ACCEPTED');
const complete = ['full_suite', 'production_flags', 'u_trap', ...requirements.map((r) => r.id)]
  .map((id) => ({ id, status: 'pass' }));
assert.equal(verdict(complete), 'PASS');
assert.equal(verdict([...complete, { id: 'other', status: 'fail' }]), 'NOT_ACCEPTED');
assert.equal(verdict([...complete, { id: 'cards', status: 'pass' }]), 'NOT_ACCEPTED', 'дублирование обязательного результата не разрешает приёмку');
assert.ok(requirements.every((r) => !validateEvidence(r.id, { passed: true })));
assert.equal(validateEvidence('unknown', { passed: true }), false);
assert.equal(validateEvidence('cards', { passed: true, cards: ['04','18','19','21','22'].map((id) => ({ id, checks: 1, failed: 0 })) }), true);
assert.equal(validateEvidence('cards', { passed: true, cards: [{ id: '04', checks: 0, failed: 0 }] }), false);
const scenarios = ['foot-hq-enter','foot-hq-exit','foot-city-enter','foot-city-exit',
  'truck-depot-enter','truck-depot-exit','truck-factory-enter','truck-factory-exit','column']
  .map((kind) => ({ name: kind, kind, attempts: 200, passed: 200, teleports: 0, speedViolations: 0, wallCollisions: 0, overlapFrames: 0, crossed: kind === 'column' ? 2000 : 200,
    factions: [0,1].map((id) => ({ id, attempts: 100, passed: 100 })) }));
assert.equal(validateEvidence('doors', { passed: true, scenarios }), true);
assert.equal(validateEvidence('doors', { passed: true, scenarios: scenarios.slice(0, -1) }), false);
assert.equal(validateEvidence('doors', { passed: true, scenarios: scenarios.map((s) => s.kind === 'column' ? { ...s, overlapFrames: 1 } : s) }), false);
assert.equal(validateEvidence('doors', { passed: true, scenarios: scenarios.map((s) => ({ ...s, crossed: 0 })) }), false);
assert.equal(validateEvidence('doors', { passed: true, scenarios: scenarios.map((s) => ({ ...s, factions: [{ id: 0, attempts: 99, passed: 99 }] })) }), false);
const runs = [1,2,3].flatMap((seed) => [100,300,400].map((units) => ({ seed, units, before: 100, after: 30, simulationSeconds: 60 })));
assert.equal(validateEvidence('navigation', { passed: true, runs }), true);
assert.equal(validateEvidence('navigation', { passed: true, runs: runs.map((r) => ({ ...r, after: 31 })) }), false);
assert.equal(validateEvidence('navigation', { passed: true, runs: runs.map((r) => ({ ...r, seed: 1 })) }), false);
assert.equal(validateEvidence('navigation', { passed: true, runs: runs.filter((r) => !(r.seed === 2 && r.units === 400)) }), false,
  'каждый seed проверяется на каждой нагрузке');
const makeFpsRun = (target, frames, low1) => {
  const worstCount = Math.ceil(frames * 0.01);
  return { target, initial: target, minAlive: target, maxAlive: target, elapsedMs: 12000, frames,
    worstCount, worstTimeMs: worstCount * 1000 / low1, averageFps: frames * 1000 / 12000, low1Fps: low1,
    drawFrames: frames, canvas: { width: 1280, height: 900 }, canvasDataLength: 1001,
    spritesReady: true, minVisible: target / 4,
    screen: 'game', sameGame: true, warOver: false, gameTimeStart: 0, gameSeconds: 1,
    timings: { step: { samples: 1 } }, pageErrors: [] };
};
const a = makeFpsRun(400, 720, 45), b = makeFpsRun(500, 540, 45);
const fps = { passed: true, environment: 'browser', measurement: 'requestAnimationFrame', rendered: true,
  browser: 'test', quick: false, frames400: a.frames, frames500: b.frames, average400: a.averageFps,
  low1_400: a.low1Fps, average500: b.averageFps, measurements: [a, b] };
assert.equal(validateEvidence('browser_fps', fps, 24000), true);
assert.equal(validateEvidence('browser_fps', fps, 1000), false, 'суммарное время измерения реально прошло');
assert.equal(validateEvidence('browser_fps', { ...fps, environment: 'node' }, 24000), false);
assert.equal(validateEvidence('browser_fps', { ...fps, low1_400: 44.99 }, 24000), false);
assert.equal(validateEvidence('browser_fps', { ...fps, quick: true }, 24000), false);
for (const bad of [{ minAlive: 399 }, { maxAlive: 401 }, { elapsedMs: 11999 }, { drawFrames: 0 },
  { gameSeconds: 0 }, { sameGame: false }, { pageErrors: ['error'] }, { worstTimeMs: 1 },
  { spritesReady: false }, { minVisible: 0 }]) {
  assert.equal(validateEvidence('browser_fps', { ...fps, measurements: [{ ...a, ...bad }, b] }, 24000), false);
}
const deadlockCoverage = ['foot-door-opposing','vehicle-opposing','column-opposing','dock-opposing'].map((id) => ({
  id, scenarios: 200, participants: 2, passed: 200, crossed: 400, arrived: 400,
  teleports: 0, speedViolations: 0, wallCollisions: 0, overlapFrames: 0,
  factions: [0, 1].map((id) => ({ id, attempts: 100, passed: 100 })) }));
const deadlocks = { passed: true, scenarios: 800, failed: 0, crossed: 1600, arrived: 1600, teleports: 0,
  speedViolations: 0, wallCollisions: 0, overlapFrames: 0, factionsChecked: 2, coverageComplete: true, coverage: deadlockCoverage };
assert.equal(validateEvidence('deadlocks', deadlocks), true);
for (const bad of [{ scenarios: 1 }, { crossed: 1599 }, { arrived: 1599 }, { teleports: 1 },
  { speedViolations: 1 }, { wallCollisions: 1 }, { overlapFrames: 1 }, { coverageComplete: false },
  { coverage: deadlockCoverage.slice(0, 1) }, { coverage: deadlockCoverage.map((c) => ({ ...c, factions: [c.factions[0]] })) }]) {
  assert.equal(validateEvidence('deadlocks', { ...deadlocks, ...bad }), false);
}
const soak = { passed: true, clock: 'wall', wallSeconds: 1800, memoryGrowthPercent: 5,
  objectChangePercent: -2, stuck: 0, forgottenBlueprints: 0 };
assert.equal(validateEvidence('soak', soak, 1_800_000), true);
assert.equal(validateEvidence('soak', soak, 1000), false, 'заявленные 30 минут не подменяют реально прошедшее время');
assert.equal(validateEvidence('soak', { ...soak, stuck: 1 }, 1_800_000), false);
const quick = spawnSync(process.execPath, ['tools/block1-auditor.mjs', '--quick'], { encoding: 'utf8', timeout: 60_000 });
assert.equal(quick.status, 1);
const report = JSON.parse(quick.stdout);
assert.equal(report.verdict, 'NOT_ACCEPTED');
assert.ok(report.checks.some((x) => x.id === 'full_suite' && x.status === 'not_run'));
assert.ok(report.checks.some((x) => x.id === 'soak' && ['missing', 'not_run'].includes(x.status)));
const trap = report.checks.find((x) => x.id === 'u_trap');
assert.ok(trap && ['pass', 'fail', 'not_run'].includes(trap.status));
if (trap.status !== 'not_run') assert.ok(Number.isInteger(trap.passed) && trap.total === 18);
// Прогоняет реальный маршрут хотя бы один раз: все юниты должны сначала
// пересечь плоскость, а не засчитаться по начальному Unit.arrived=true.
const doors = spawnSync(process.execPath, ['tests/acceptance/block1-doorways.mjs', '--attempts=1'], { encoding: 'utf8', timeout: 60_000 });
assert.ok(doors.status === 0 || doors.status === 1);
const doorReport = JSON.parse(doors.stdout);
assert.equal(doorReport.scenarios.length, 9);
for (const s of doorReport.scenarios) {
  assert.equal(s.attempts, 2);
  assert.ok(s.crossed >= s.passed * (s.kind === 'column' ? 10 : 1), 'успех без пересечения проёма невозможен');
  assert.equal(s.factions.length, 2);
}
assert.equal(doors.status, doorReport.passed ? 0 : 1);
const opposing = spawnSync(process.execPath, ['tests/acceptance/block1-deadlocks.mjs', '--attempts=1'], { encoding: 'utf8', timeout: 60_000 });
assert.ok(opposing.status === 0 || opposing.status === 1);
const opposingReport = JSON.parse(opposing.stdout);
assert.equal(opposingReport.scenarios, 2);
assert.equal(opposingReport.factions.length, 2);
assert.equal(opposing.status, opposingReport.passed ? 0 : 1);
assert.equal(validateEvidence('deadlocks', { ...opposingReport, passed: true }), false, 'короткий тест не является приёмкой');
console.log('проверяющий блока 1: отсутствующие проверки, фальшивый soak, FPS симуляции и быстрый режим не дают PASS');
