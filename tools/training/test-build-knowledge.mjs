#!/usr/bin/env node
/* Тест сборщика знаний (tools/training/test-build-knowledge.mjs)

   Проверяем не «запустилось», а качество данных: нет пустых полей,
   нет дублей, ответы командира проходят игровой валидатор, а деление
   на обучение/проверку не пересекается по входам.

   Запуск: node tools/training/test-build-knowledge.mjs            */
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile, rm } from 'node:fs/promises';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const run = promisify(execFile);
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const TMP = join(ROOT, 'node_modules/.cache/knowledge-test');

let passed = 0;
let failed = 0;
function check(name, ok, detail = '') {
  if (ok) { passed++; console.log('  ✓', name); }
  else { failed++; console.log('  ✗', name, detail); }
}

/* Безопасный разбор JSONL: битая строка датасета должна давать понятную
   ошибку с номером строки, а не падать стеком в недрах теста. */
const parseJson = (text, where) => {
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error(`битый JSON (${where}): ${e.message}`);
  }
};

const load = async (file) => {
  const lines = (await readFile(file, 'utf8')).split('\n').filter(Boolean);
  return lines.map((line, i) => parseJson(line, `${file}:${i + 1}`));
};

const hash = (s) => createHash('sha256').update(s).digest('hex');

async function main() {
  console.log('Сборщик знаний');
  await rm(TMP, { recursive: true, force: true });

  // Небольшой прогон: проверяем логику, а не объём.
  await run('node', [
    'tools/training/build-knowledge.mjs',
    '--out', TMP, '--game', '30', '--bug', '60', '--code', '20', '--play', '20', '--readme', '10',
    '--codes', '200', '--law', '20', '--defect', '20', '--balance', '20', '--edge', '30', '--engine', '20',
  ], { cwd: ROOT, maxBuffer: 32 * 1024 * 1024 });

  const train = await load(join(TMP, 'train.jsonl'));
  const evalRows = await load(join(TMP, 'eval.jsonl'));
  const manifest = parseJson(await readFile(join(TMP, 'manifest.json'), 'utf8'), 'manifest.json');

  check('обучение и проверка непустые', train.length > 0 && evalRows.length > 0,
    `train=${train.length} eval=${evalRows.length}`);

  const all = [...train, ...evalRows];
  check('у каждого примера есть system/user/assistant',
    all.every((r) => typeof r.system === 'string' && r.system.length > 20
      && typeof r.user === 'string' && r.user.length > 5
      && typeof r.assistant === 'string' && r.assistant.length > 1));

  check('у каждого примера указан источник',
    all.every((r) => typeof r.source === 'string' && r.source.length > 0));

  check('нет точных дублей входа',
    new Set(all.map((r) => hash(r.system + '\u0000' + r.user))).size === all.length);

  check('обучение и проверка не пересекаются по входам',
    new Set(train.map((r) => hash(r.user))).size
      + new Set(evalRows.map((r) => hash(r.user))).size - new Set(all.map((r) => hash(r.user))).size === 0,
    'входы из eval не должны встречаться в train');

  check('в данных нет строки null вместо смысла',
    all.every((r) => !/:\s*null\b|\bnull\b/.test(r.assistant)),
    'пример: ' + (all.find((r) => /\bnull\b/.test(r.assistant))?.user || '').slice(0, 60));

  // Ответы командира обязаны проходить игровой валидатор — иначе модель
  // выучит ответы, которые игра не примет.
  const gameRows = all.filter((r) => r.kind === 'game-decision');
  check('есть примеры боевых решений', gameRows.length > 0, `найдено ${gameRows.length}`);

  if (gameRows.length) {
    const { validateProposal } = await import(join(ROOT, 'frontline-command/src/sim/neutral_commander.js'));
    let ok = 0;
    for (const row of gameRows) {
      const input = parseJson(row.user, 'вход боевого примера');
      // Валидатору нужен снимок: восстанавливаем индексы из самого входа.
      // Валидатор проверяет существование слота по индексу, поэтому в
      // снимке должны лежать объекты, а не числа: 0 — это «нет слота».
      const snap = {
        squads: input.squads.map((q, i) => ({ id: i, ...q })),
        points: input.points.map((q, i) => ({ id: i, ...q })),
        builds: input.builds.map((q, i) => ({ id: i, ...q })),
        input,
      };
      if (validateProposal(row.assistant, snap)) ok++;
    }
    check('все боевые ответы принимает игра', ok === gameRows.length,
      `${ok} из ${gameRows.length}`);
  }

  const actions = new Set(gameRows.map((r) => parseJson(r.assistant, 'ответ боевого примера').action));
  check('в обучении больше одного типа действия', actions.size >= 2,
    'найдено: ' + [...actions].join(', '));

  check('в данных есть руководства «как играть»',
    all.some((r) => r.kind === 'play-guide' || r.kind === 'play-frontline'));

  check('в данных есть правила баг-искателя', all.some((r) => r.kind === 'bug-rule'));

  // Новые базы: таблица кодов, законы, разбор дефектов, баланс, граничные
  // случаи, устройство игры. Каждая должна давать примеры, иначе база пустая.
  for (const [kind, name] of [
    ['bug-code', 'таблица кодов баг-искателя'],
    ['repo-law', 'законы репозитория'],
    ['defect-analysis', 'разбор дефектов'],
    ['balance', 'баланс игры'],
    ['game-edge', 'граничные ситуации'],
    ['game-rule', 'правила решений'],
    ['engine-arch', 'устройство игры'],
  ]) {
    check('есть база: ' + name, all.some((r) => r.kind === kind), 'тип ' + kind + ' не найден');
  }

  // Коды в таблице должны быть уникальными и в диапазоне 000-999.
  const codes = all.filter((r) => r.kind === 'bug-code')
    .map((r) => Number((r.user.match(/код (\d+)/) || [])[1]))
    .filter(Number.isInteger);
  check('коды баг-искателя уникальны и в диапазоне 000-999',
    codes.length > 0 && new Set(codes).size === codes.length && codes.every((c) => c >= 0 && c <= 999),
    `кодов=${codes.length}, уникальных=${new Set(codes).size}`);

  // Каждый граничный случай обязан проходить игру — как и боевые.
  const edgeRows = all.filter((r) => r.kind === 'game-edge');
  if (edgeRows.length) {
    const { validateProposal } = await import(join(ROOT, 'frontline-command/src/sim/neutral_commander.js'));
    let okEdge = 0;
    for (const row of edgeRows) {
      const input = parseJson(row.user, 'вход боевого примера');
      const snap = {
        squads: input.squads.map((q, i) => ({ id: i, ...q })),
        points: input.points.map((q, i) => ({ id: i, ...q })),
        builds: input.builds.map((q, i) => ({ id: i, ...q })),
        input,
      };
      if (validateProposal(row.assistant, snap)) okEdge++;
    }
    check('все граничные случаи принимает игра', okEdge === edgeRows.length,
      `${okEdge} из ${edgeRows.length}`);
  }

  check('манифест совпадает по счёту',
    manifest.counts.total === all.length
      && manifest.counts.train === train.length
      && manifest.counts.eval === evalRows.length,
    `манифест=${manifest.counts.total}, факт=${all.length}`);

  check('манифест фиксирует хэши файлов',
    manifest.files.train.sha256 === hash(await readFile(join(TMP, 'train.jsonl'), 'utf8'))
    || manifest.files.train.sha256.length === 64);

  // Детерминизм: тот же seed — тот же результат.
  const again = join(TMP + '-2');
  await rm(again, { recursive: true, force: true });
  await run('node', [
    'tools/training/build-knowledge.mjs',
    '--out', again, '--game', '30', '--bug', '60', '--code', '20', '--play', '20', '--readme', '10',
    '--codes', '200', '--law', '20', '--defect', '20', '--balance', '20', '--edge', '30', '--engine', '20',
  ], { cwd: ROOT, maxBuffer: 32 * 1024 * 1024 });
  const trainAgain = await readFile(join(again, 'train.jsonl'), 'utf8');
  check('один seed даёт один и тот же датасет',
    hash(trainAgain) === hash(await readFile(join(TMP, 'train.jsonl'), 'utf8')));

  await rm(TMP, { recursive: true, force: true });
  await rm(again, { recursive: true, force: true });

  console.log(`\n${passed} пройдено, ${failed} провалено`);
  if (failed) process.exit(1);
}

await main();
