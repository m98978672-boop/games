// Неполный обзор всей игры не должен превращаться в приёмку.
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { parseAlgorithmAudit, validateAlgorithmEvidence, validatePng, validateVisualEvidence,
  validateProvenanceEvidence, inspectAssets, assessAlgorithms, auditGame, formatGameReport } from '../tools/game-auditor.mjs';

const rows = parseAlgorithmAudit(readFileSync(new URL('../ALGORITHMS_SPEC.md', import.meta.url), 'utf8'));
const contract = JSON.parse(readFileSync(new URL('../data/game_audit_contract.json', import.meta.url), 'utf8'));
assert.equal(rows.length, 40);
assert.deepEqual(rows.map((r) => Number(r.id)), Array.from({ length: 40 }, (_, i) => i + 1));
assert.throws(() => parseAlgorithmAudit('нет таблицы'));
const missing = assessAlgorithms(rows, contract, {}, (path) => ({ status: 'missing', path }));
assert.equal(missing.algorithms.length, 40);
assert.equal(missing.issues.length, 40);
assert.deepEqual(missing.issues.map((i) => i.code), Array.from({ length: 40 }, (_, i) => i + 500));
assert.ok(missing.issues.every((i) => i.status === 'unverified'));
const broken = structuredClone(contract); delete broken.algorithms['10'];
assert.throws(() => assessAlgorithms(rows, broken, {}, () => ({ status: 'missing' })));
const spec = rows[0], cases = [...contract.common, ...contract.algorithms['01']];
const proof = { status: 0, error: null, data: { passed: true, algorithm: '01', fullCoverage: true,
  cases: cases.map((id) => ({ id, passed: true, assertions: 1 })) } };
const flags = { [spec.flag]: true };
assert.equal(validateAlgorithmEvidence(spec, cases, proof, flags), true);
assert.equal(validateAlgorithmEvidence(spec, cases, { ...proof, status: 1 }, flags), false);
assert.equal(validateAlgorithmEvidence(spec, cases, proof, {}), false);
for (const bad of [[], proof.data.cases.slice(1), [...proof.data.cases, proof.data.cases[0]],
  [...proof.data.cases, { id: 'extra', passed: false, assertions: 1 }]]) {
  assert.equal(validateAlgorithmEvidence(spec, cases, { ...proof, data: { ...proof.data, cases: bad } }, flags), false);
}
const png = readFileSync(new URL('../assets/tiles/grass_0.png', import.meta.url));
assert.equal(validatePng(png), null);
assert.ok(validatePng(Buffer.from('not a png')));
assert.ok(validatePng(png.subarray(0, png.length - 3)));
const corrupted = Buffer.from(png); corrupted[40] ^= 1;
assert.match(validatePng(corrupted), /CRC/);
const shot = (faction) => ({ faction, reference: 'old.png', actual: 'new.png', pixels: 1000, changedPixels: 5 });
const visual = { status: 0, data: { passed: true, environment: 'browser', method: 'pixel_comparison',
  legacyFlagsOff: true, referenceVerified: true, pageErrors: [], screenshots: [shot(0), shot(1)] } };
assert.equal(validateVisualEvidence(visual), true);
assert.equal(validateVisualEvidence({ ...visual, data: { ...visual.data, screenshots: [shot(0)] } }), false);
assert.equal(validateVisualEvidence({ ...visual, data: { ...visual.data, screenshots: [shot(0), { ...shot(1), changedPixels: 6 }] } }), false);
assert.equal(validateVisualEvidence({ ...visual, data: { ...visual.data, environment: 'node' } }), false);
const provenance = { status: 0, data: { passed: true, entries: [{ name: 'tiles/a', origin: 'internal', source: 'создано в проекте', verified: true }] } };
assert.equal(validateProvenanceEvidence(provenance, ['tiles/a']), true);
assert.equal(validateProvenanceEvidence(provenance, ['tiles/a', 'tiles/b']), false);
assert.equal(validateProvenanceEvidence({ ...provenance, data: { ...provenance.data, entries: [
  { name: 'tiles/a', origin: 'external', source: 'source', verified: true, license: 'CC-BY-NC', url: 'https://example.org', attribution: 'author' } ] } }, ['tiles/a']), false);
const temp = mkdtempSync(join(tmpdir(), 'game-audit-'));
try {
  mkdirSync(join(temp, 'assets'), { recursive: true });
  writeFileSync(join(temp, 'assets/manifest.json'), '{}');
  const invalid = inspectAssets(temp, { run: () => ({ status: 'missing' }) });
  assert.ok(invalid.issues.some((i) => i.code === 590));
  writeFileSync(join(temp, 'assets/manifest.json'), JSON.stringify(['../outside','sprites/missing']));
  const unsafe = inspectAssets(temp, { run: () => ({ status: 'missing' }) });
  assert.ok(unsafe.issues.some((i) => i.code === 591));
} finally { rmSync(temp, { recursive: true, force: true }); }
const report = auditGame({ quick: true });
assert.equal(report.verdict, 'NOT_ACCEPTED');
assert.equal(report.summary.algorithms, 40);
assert.equal(report.summary.unverifiedAlgorithms, 40);
assert.equal(report.block1.verdict, 'NOT_ACCEPTED');
assert.equal(report.summary.manifestEntries, report.summary.pngChecked);
assert.ok(report.issues.some((i) => i.code === 580));
assert.ok(report.issues.some((i) => i.code === 592));
assert.ok(report.issues.some((i) => i.code === 593));
assert.ok(report.issues.some((i) => i.code === 594));
assert.ok(report.issues.some((i) => i.code === 597));
assert.ok(report.issues.some((i) => i.code === 598));
assert.ok(report.issues.every((i) => Number.isSafeInteger(i.code) && i.code >= 1 && i.code <= 999));
assert.match(formatGameReport(report), /ВСЯ ИГРА: NOT_ACCEPTED/);
console.log('общий проверяющий: 40 алгоритмов, статусы доказательств, PNG, графика, лицензии, S1–S10 и блок 1 проверены без ложной приёмки');
