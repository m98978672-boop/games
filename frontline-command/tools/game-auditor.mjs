// Общий проверяющий всей игры. Он не превращает исторический аудит кода в
// пройденные тесты: отсутствующее доказательство каждого ALG блокирует PASS.
import { readFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { inflateSync } from 'node:zlib';
import { audit as auditBlock1 } from './block1-auditor.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const signature = Buffer.from([137,80,78,71,13,10,26,10]);
const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n; for (let i = 0; i < 8; i++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1); return c >>> 0;
});
function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = crcTable[(crc ^ byte) & 255] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}
// Проверяет структуру PNG, CRC и zlib, не качество рисунка и не все пиксели.
export function validatePng(bytes) {
  if (!Buffer.isBuffer(bytes) || bytes.length < 45 || !bytes.subarray(0,8).equals(signature)) return 'неверная сигнатура PNG';
  let pos = 8, chunks = 0, width, height, ihdr = false, iend = false;
  const idat = [];
  while (pos + 12 <= bytes.length) {
    const len = bytes.readUInt32BE(pos);
    if (len > bytes.length - pos - 12) return 'обрезанный блок PNG';
    const type = bytes.toString('ascii', pos + 4, pos + 8), data = bytes.subarray(pos + 8, pos + 8 + len);
    const expected = bytes.readUInt32BE(pos + 8 + len);
    if (crc32(bytes.subarray(pos + 4, pos + 8 + len)) !== expected) return `ошибка CRC ${type}`;
    if (!chunks && type !== 'IHDR') return 'первый блок не IHDR';
    if (type === 'IHDR') {
      if (ihdr || len !== 13) return 'неверный IHDR';
      width = data.readUInt32BE(0); height = data.readUInt32BE(4);
      if (!width || !height || width > 16384 || height > 16384) return 'неверный размер PNG';
      ihdr = true;
    }
    if (type === 'IDAT') idat.push(data);
    if (type === 'IEND') { if (len !== 0) return 'неверный IEND'; iend = true; pos += len + 12; break; }
    pos += len + 12; chunks++;
  }
  if (!ihdr || !iend || !idat.length || pos !== bytes.length) return 'неполная структура PNG';
  try { if (!inflateSync(Buffer.concat(idat), { maxOutputLength: 64 * 1024 * 1024 }).length) return 'пустые данные PNG'; }
  catch { return 'ошибка сжатых данных PNG'; }
  return null;
}

export function parseAlgorithmAudit(text) {
  const rows = [...text.matchAll(/^\| (\d\d) `([^`]+)` \| ([^|]+) \| ([^|]+) \|/gm)].map((m) =>
    ({ id: m[1], flag: m[2], historicalStatus: m[3].trim(), historicalNotes: m[4].trim() }));
  if (rows.length !== 40 || rows.some((r, i) => r.id !== String(i+1).padStart(2,'0'))) throw new Error('аудит должен содержать ALG-01…40 по порядку');
  return rows;
}

export function validateAlgorithmEvidence(spec, requirements, result, flags) {
  if (!result || result.status !== 0 || result.error || !result.data || result.data.passed !== true ||
      result.data.algorithm !== spec.id || result.data.fullCoverage !== true || flags[spec.flag] !== true ||
      !Array.isArray(result.data.cases) || !result.data.cases.every((c) => c && typeof c.id === 'string' && c.passed === true &&
        Number.isSafeInteger(c.assertions) && c.assertions > 0) ||
      new Set(result.data.cases.map((c) => c.id)).size !== result.data.cases.length) return false;
  return requirements.every((id) => result.data.cases.filter((c) => c?.id === id && c.passed === true &&
    Number.isSafeInteger(c.assertions) && c.assertions > 0).length === 1);
}

function runTest(relative, quick) {
  if (!existsSync(resolve(root, relative))) return { status: 'missing', path: relative };
  if (quick) return { status: 'not_run', path: relative };
  const r = spawnSync(process.execPath, [relative], { cwd: root, encoding: 'utf8', timeout: 600_000, maxBuffer: 8 * 1024 * 1024 });
  let data = null; try { data = JSON.parse(r.stdout); } catch { /* invalid JSON is not evidence */ }
  return { status: r.status, error: r.error?.message ?? null, signal: r.signal ?? null, path: relative, data,
    ...(data ? {} : { outputTail: (r.stdout + r.stderr).trim().slice(-1500) }) };
}

export function validateVisualEvidence(result) {
  const e = result?.data;
  if (result?.status !== 0 || result.error || e?.passed !== true || e.environment !== 'browser' ||
      e.method !== 'pixel_comparison' || e.legacyFlagsOff !== true || e.referenceVerified !== true ||
      !Array.isArray(e.pageErrors) || e.pageErrors.length || !Array.isArray(e.screenshots) || e.screenshots.length < 2) return false;
  return [0, 1].every((f) => e.screenshots.some((shot) => shot?.faction === f)) && e.screenshots.every((shot) =>
    (shot.faction === 0 || shot.faction === 1) && typeof shot.reference === 'string' && shot.reference &&
    typeof shot.actual === 'string' && shot.actual && Number.isSafeInteger(shot.pixels) && shot.pixels > 0 &&
    Number.isSafeInteger(shot.changedPixels) && shot.changedPixels >= 0 && shot.changedPixels <= shot.pixels &&
    shot.changedPixels / shot.pixels <= 0.005);
}
export function validateProvenanceEvidence(result, manifest) {
  const e = result?.data;
  if (result?.status !== 0 || result.error || e?.passed !== true || !Array.isArray(manifest) || !manifest.length ||
      !Array.isArray(e.entries) || e.entries.length !== manifest.length ||
      new Set(e.entries.map((x) => x?.name)).size !== e.entries.length) return false;
  return manifest.every((name) => e.entries.some((x) => x?.name === name && x.verified === true &&
    typeof x.source === 'string' && x.source && (x.origin === 'internal' ||
      (x.origin === 'external' && ['CC0-1.0', 'CC-BY-4.0'].includes(x.license) &&
        typeof x.url === 'string' && /^https:\/\//.test(x.url) && typeof x.attribution === 'string' && x.attribution))));
}

export function inspectAssets(base = root, { quick = false, run = runTest } = {}) {
  const issues = [], counts = { manifestEntries: 0, pngChecked: 0, invalidPng: 0 };
  const add = (code, title, message, observed, action, status = 'fail') => issues.push({
    code, check: 'assets', status, title, message, observed, expected: null, action,
  });
  let manifest;
  try {
    manifest = JSON.parse(readFileSync(resolve(base, 'assets/manifest.json'), 'utf8'));
    if (!Array.isArray(manifest) || !manifest.length || new Set(manifest).size !== manifest.length) throw new Error('список пуст или содержит повторы');
    counts.manifestEntries = manifest.length;
  } catch (e) { manifest = null; add(590, 'Повреждён манифест PNG', 'Не удалось прочитать список графических ресурсов.', String(e), 'Восстановить и проверить манифест.'); }
  if (manifest) {
    const bad = [];
    for (const name of manifest) {
      if (typeof name !== 'string' || !/^[a-zA-Z0-9_/-]+$/.test(name) || name.split('/').some((v) => !v || v === '..')) {
        bad.push({ name, error: 'недопустимый путь' }); continue;
      }
      const path = resolve(base, 'assets', `${name}.png`), assetDir = resolve(base, 'assets') + sep;
      if (!path.startsWith(assetDir)) { bad.push({ name, error: 'выход из каталога' }); continue; }
      try { const error = validatePng(readFileSync(path)); counts.pngChecked++; if (error) bad.push({ name, error }); }
      catch (e) { bad.push({ name, error: e.code || String(e) }); }
    }
    counts.invalidPng = bad.length;
    if (bad.length) add(591, 'Некорректный PNG или отсутствующий файл', `Проблемных ресурсов: ${bad.length}.`, bad, 'Исправить перечисленные файлы и повторить структурную проверку.');
  }
  try {
    const credits = readFileSync(resolve(base, 'docs/ASSETS_CREDITS.md'), 'utf8');
    if (credits.includes('PLACEHOLDER_REPLACE')) add(592, 'Артовые заглушки', 'В реестре игровые изображения помечены как PLACEHOLDER_REPLACE.', 'docs/ASSETS_CREDITS.md', 'Подготовить и проверить итоговые PNG с документированными правами.', 'unverified');
  } catch (e) { add(595, 'Реестр происхождения ассетов недоступен', 'Не удалось прочитать реестр ассетов.', String(e), 'Восстановить реестр и проверить происхождение каждого ресурса.'); }
  try {
    const renderer = readFileSync(resolve(base, 'src/render/renderer.js'), 'utf8');
    const start = renderer.indexOf('  drawWalls() {'), end = renderer.indexOf('  drawWallsDebug()', start);
    if (start >= 0 && end > start && /\bctx\.stroke\s*\(/.test(renderer.slice(start, end)))
      add(593, 'Стены рисуются линиями', 'В игровой функции drawWalls обнаружена отрисовка линиями Canvas, а не только растровыми PNG.', 'src/render/renderer.js: drawWalls', 'Реализовать и проверить согласованные растровые стены, не меняя legacy при выключенном флаге.');
    if (/Math\.round\(a\s*\/\s*\(Math\.PI\s*\/\s*2\)\)/.test(renderer))
      add(594, 'Не подтверждены восемь направлений моделей', 'Текущий выбор направления основан на четырёх углах; согласованные четыре дополнительные предрисованные диагонали не подтверждены.', 'src/render/renderer.js: unitDir', 'Добавить согласованные PNG-направления под отдельным флагом и проверить обе фракции.', 'unverified');
  } catch (e) { add(596, 'Не удалось проверить рендерер', 'Исходник рендерера недоступен.', String(e), 'Восстановить рендерер и повторить проверку.'); }
  // Реальная проверка и права не выводятся из расширения файла и заявления
  // об авторстве; их нельзя объявить пройденными без отдельных доказательств.
  const visual = run('tests/acceptance/visual-regression.mjs', quick);
  if (!validateVisualEvidence(visual)) add(597, 'Регрессия скриншотов не подтверждена',
    'Не подтверждено браузерное сравнение снимков с порогом 0,5% для обеих фракций.',
    visual, 'Провести реальное сравнение снимков с документированной средой.', visual.status === 'missing' ? 'missing' : 'unverified');
  const provenance = run('tests/acceptance/asset-provenance.mjs', quick);
  if (!validateProvenanceEvidence(provenance, manifest)) add(598, 'Права отдельных изображений не подтверждены',
    'Структурная проверка PNG не устанавливает происхождение и конкретную лицензию каждого ассета.',
    provenance, 'Подтвердить происхождение каждого нового ресурса и, для внешних, конкретную допустимую лицензию.', provenance.status === 'missing' ? 'missing' : 'unverified');
  return { counts, issues };
}

export function assessAlgorithms(rows, contract, flags, run) {
  if (!contract || contract.version !== 1 || !Array.isArray(contract.common) || !contract.common.length || !contract.algorithms) throw new Error('отсутствует контракт охвата');
  const issues = [], algorithms = [];
  for (const row of rows) {
    const required = contract.algorithms[row.id];
    if (!Array.isArray(required) || !required.length || [...required, ...contract.common].some((c) => typeof c !== 'string' || !c) ||
        new Set([...required, ...contract.common]).size !== required.length + contract.common.length) throw new Error(`неполный контракт ALG-${row.id}`);
    const cases = [...contract.common, ...required];
    const test = run(`tests/acceptance/alg-${row.id}.mjs`);
    const accepted = validateAlgorithmEvidence(row, cases, test, flags);
    const flagState = !(row.flag in flags) ? 'missing' : flags[row.flag] ? 'enabled' : 'disabled';
    algorithms.push({ ...row, flagState, requiredCases: cases, test, accepted });
    if (!accepted) issues.push({ code: 499 + Number(row.id), check: `ALG-${row.id}`, status: 'unverified',
      title: `ALG-${row.id}: полная приёмка не подтверждена`,
      message: `Флаг ${row.flag}: ${flagState}; приёмочный тест: ${test.status}. Прежний аудит: ${row.historicalStatus}.`,
      observed: { flag: row.flag, flagState, test: test.status, historicalNotes: row.historicalNotes, source: 'ALGORITHMS_SPEC.md (исторический аудит)' },
      expected: { flag: 'enabled', cases }, action: 'Реализовать недостающее, проверить все требования и повторить приёмочный сценарий; старый аудит сам по себе не является тестом.' });
  }
  return { algorithms, issues };
}

export function auditGame({ quick = false } = {}) {
  const issues = []; let algorithms = [], assets = { counts: {}, issues: [] };
  try {
    const rows = parseAlgorithmAudit(readFileSync(resolve(root, 'ALGORITHMS_SPEC.md'), 'utf8'));
    const contract = JSON.parse(readFileSync(resolve(root, 'data/game_audit_contract.json'), 'utf8'));
    const rawFlags = JSON.parse(readFileSync(resolve(root, 'data/feature_flags.json'), 'utf8')).flags;
    if (!Array.isArray(rawFlags) || new Set(rawFlags.map((v) => v.id)).size !== rawFlags.length) throw new Error('неверный список флагов');
    const flags = Object.fromEntries(rawFlags.map((v) => [v.id, v.enabled === true]));
    const result = assessAlgorithms(rows, contract, flags, (p) => runTest(p, quick));
    algorithms = result.algorithms; issues.push(...result.issues);
  } catch (e) {
    issues.push({ code: 599, check: 'algorithm_registry', status: 'fail', title: 'Не удалось проверить все алгоритмы',
      message: String(e), observed: null, expected: '40 корректных алгоритмов и контрактов', action: 'Восстановить реестр и повторить проверку.' });
  }
  assets = inspectAssets(root, { quick }); issues.push(...assets.issues);
  const scenarioTest = runTest('tests/acceptance/game-scenarios.mjs', quick);
  const scenariosOk = scenarioTest.status === 0 && !scenarioTest.error && scenarioTest.data?.passed === true &&
    Array.isArray(scenarioTest.data.scenarios) && scenarioTest.data.scenarios.every((s) => s?.passed === true &&
      Number.isSafeInteger(s.assertions) && s.assertions > 0) && Array.from({ length: 10 }, (_, i) => `S${i+1}`).every((id) =>
      scenarioTest.data.scenarios.filter((s) => s?.id === id && s.passed === true && Number.isSafeInteger(s.assertions) && s.assertions > 0).length === 1);
  if (!scenariosOk) issues.push({ code: 580, check: 'S1-S10', status: scenarioTest.status === 'missing' ? 'missing' : 'unverified',
    title: 'Не подтверждены все интеграционные сценарии', message: 'Для всей игры нужны проверенные S1–S10, а не только блок 1.',
    observed: scenarioTest, expected: 'все S1–S10 с проверяемыми утверждениями', action: 'Реализовать и выполнить интеграционные испытания.' });
  const block1 = auditBlock1({ quick });
  issues.push(...block1.issues.map((i) => ({ ...i, scope: 'block1' })));
  const accepted = !quick && block1.verdict === 'PASS' && algorithms.length === 40 && algorithms.every((a) => a.accepted) && issues.length === 0;
  return { version: 1, mode: quick ? 'quick' : 'full', verdict: accepted ? 'PASS' : 'NOT_ACCEPTED',
    summary: { algorithms: algorithms.length, acceptedAlgorithms: algorithms.filter((a) => a.accepted).length,
      unverifiedAlgorithms: algorithms.filter((a) => !a.accepted).length, ...assets.counts,
      block1Verdict: block1.verdict, issues: issues.length }, algorithms, assets: assets.counts, scenarioTest, block1, issues };
}

export function formatGameReport(report) {
  const s = report.summary;
  const lines = [`ВСЯ ИГРА: ${report.verdict}`, `Режим: ${report.mode}. Алгоритмы: ${s.acceptedAlgorithms}/${s.algorithms} подтверждены. PNG проверено: ${s.pngChecked}, проблем: ${s.invalidPng}.`,
    `Блок 1: ${s.block1Verdict}. Всего блокирующих замечаний и непроверенных пунктов: ${s.issues}.`,
    'Неподтверждённое — не обязательно дефект; исторические выводы не заменяют актуальные тесты.'];
  for (const i of report.issues) {
    lines.push('', `[${String(i.code).padStart(3,'0')}] ${i.title} — ${i.check}`, i.message);
    if (i.observed != null) lines.push(`Факт: ${typeof i.observed === 'string' ? i.observed : JSON.stringify(i.observed)}`);
    if (i.expected != null) lines.push(`Требование: ${typeof i.expected === 'string' ? i.expected : JSON.stringify(i.expected)}`);
    lines.push(`Действие: ${i.action}`);
  }
  return lines.join('\n');
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const result = auditGame({ quick: process.argv.includes('--quick') });
  console.log(process.argv.includes('--human') ? formatGameReport(result) : JSON.stringify(result, null, 2));
  if (result.verdict !== 'PASS') process.exitCode = 1;
}
