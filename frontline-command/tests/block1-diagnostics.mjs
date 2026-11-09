// Коды должны объяснять реальные ошибки, а отсутствие данных — не успех.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { catalog, diagnoseChecks, formatHuman } from '../tools/block1-diagnostics.mjs';
import { requiredChecks } from '../tools/block1-auditor.mjs';

const codes = Object.keys(catalog).map(Number);
assert.ok(codes.every((n) => Number.isInteger(n) && n >= 1 && n <= 999));
assert.equal(new Set(codes).size, codes.length);
assert.ok(codes.every((n) => catalog[n].name && catalog[n].action));
const allPass = requiredChecks.map((id) => ({ id, status: 'pass' }));
assert.deepEqual(diagnoseChecks(allPass, requiredChecks), []);
assert.equal(diagnoseChecks([], requiredChecks).filter((x) => x.code === 7).length, requiredChecks.length);
assert.ok(diagnoseChecks([...allPass, allPass[0]], requiredChecks).some((x) => x.code === 8));
const report = JSON.parse(readFileSync(new URL('../docs/BLOCK1_AUDIT_LOCAL_NAV.json', import.meta.url)));
const issues = diagnoseChecks(report.checks, requiredChecks);
for (const code of [101,110,111,112,201,202,203,204,205,206,207,209,301,302,303,304]) {
  assert.ok(issues.some((x) => x.code === code), `исторический результат должен объяснять код ${code}`);
}
for (const c of report.checks.filter((c) => c.status !== 'pass')) assert.ok(issues.some((e) => e.check === c.id), `${c.id}: причина есть`);
assert.ok(issues.filter((x) => x.code === 301).every((x) => x.target === 400 || x.target === 500));
assert.ok(issues.every((x) => Number.isInteger(x.code) && catalog[x.code] && x.message && x.action && x.status));
const human = formatHuman({ verdict: 'NOT_ACCEPTED', mode: 'full', issues });
assert.match(human, /\[101\].*U-ловушка/);
assert.match(human, /\[111\].*Наложения/);
assert.match(human, /\[209\]/);
assert.match(human, /NOT_ACCEPTED/);
assert.ok(human.includes('Действие:'));
const mk = (overrides = {}) => ({ id: 'doors', description: 'проходы', status: 'fail', exitCode: 1, error: null, ...overrides });
assert.equal(diagnoseChecks([mk({ status: 'not_run', reason: 'quick' })])[0].code, 3);
assert.equal(diagnoseChecks([mk({ status: 'missing', path: 'отсутствует' })])[0].code, 210);
assert.equal(diagnoseChecks([mk({ error: 'timed out', evidence: null })])[0].code, 4);
assert.equal(diagnoseChecks([mk({ evidence: null })])[0].code, 5);
assert.equal(diagnoseChecks([mk({ evidence: { passed: false } })])[0].code, 6);
assert.equal(diagnoseChecks([mk({ evidence: { passed: true } })])[0].code, 4, 'ошибочный процесс не маскируется положительным JSON');
assert.deepEqual(diagnoseChecks([mk({ status: 'pass' })]), []);
for (const status of ['fail', 'not_run', 'missing', 'unexpected']) assert.ok(diagnoseChecks([mk({ status })]).length > 0);
const opposing = spawnSync(process.execPath, ['tests/acceptance/block1-deadlocks.mjs', '--attempts=3'], { encoding: 'utf8', timeout: 60_000 });
assert.equal(opposing.status, 1);
const evidence = JSON.parse(opposing.stdout);
const opposingIssues = diagnoseChecks([{ id: 'deadlocks', status: 'fail', description: 'встречное движение', exitCode: 1, evidence }]);
assert.ok(opposingIssues.some((e) => e.code === 422), 'частичная сцена не является полным покрытием');
if (evidence.overlapFrames > 0) assert.ok(opposingIssues.some((e) => e.code === 420));
if (evidence.speedViolations > 0) assert.ok(opposingIssues.some((e) => e.code === 112));
if (evidence.arrived === evidence.scenarios * 2 && evidence.crossed === evidence.scenarios * 2)
  assert.ok(!opposingIssues.some((e) => e.code === 421), 'наложение не называется остановкой при достигнутых целях');
console.log(`диагностика блока 1: ${codes.length} устойчивых кодов, реальные причины, отсутствие данных и дубликаты проверены`);
