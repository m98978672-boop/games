#!/usr/bin/env node
/* Тест обучающего пайплайна (tools/training/test-training.mjs)

   Проверяет то, что можно проверить без torch и без интернета:
     * бенчмарк багов действительно вносит дефекты и делает чистые копии;
     * разбор ответов модели не путает «баг», «чисто» и «не понял»;
     * файлы обучения и оценки синтаксически корректны.

   Запуск: node tools/training/test-training.mjs                     */
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile, rm } from 'node:fs/promises';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const run = promisify(execFile);
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const TMP = join(ROOT, 'node_modules/.cache/training-test');

let passed = 0;
let failed = 0;
function check(name, ok, detail = '') {
  if (ok) { passed++; console.log('  ✓', name); }
  else { failed++; console.log('  ✗', name, detail); }
}

async function main() {
  console.log('Обучающий пайплайн');
  await rm(TMP, { recursive: true, force: true });

  // --- бенчмарк багов ---
  await run('node', ['tools/training/make-bug-bench.mjs', '--out', TMP], { cwd: ROOT });
  const manifest = JSON.parse(await readFile(join(TMP, 'manifest.json'), 'utf8'));

  check('бенчмарк содержит случаи с багом и чистые',
    manifest.counts.withBug > 0 && manifest.counts.clean > 0,
    `с багом=${manifest.counts.withBug} чистых=${manifest.counts.clean}`);
  check('число чистых и битых совпадает',
    manifest.counts.withBug === manifest.counts.clean,
    'иначе метрики смещены');
  check('у каждого случая свой файл',
    new Set(manifest.cases.map((c) => c.name)).size === manifest.cases.length);

  // Битый вариант обязан отличаться от чистого: иначе «дефект» не внесён.
  let differing = 0;
  for (const c of manifest.cases.filter((x) => x.hasBug)) {
    const clean = manifest.cases.find((x) => x.scenario === c.scenario && !x.hasBug);
    const a = await readFile(join(TMP, c.name), 'utf8');
    const b = await readFile(join(TMP, clean.name), 'utf8');
    if (a !== b) differing++;
  }
  check('каждый дефект реально меняет файл', differing === manifest.counts.withBug,
    `${differing} из ${manifest.counts.withBug}`);

  // Битые и чистые копии одного сценария должны различаться ровно дефектом,
  // а не полностью: иначе модель не сможет их сравнить.
  const lengths = manifest.cases.filter((c) => c.hasBug).map((c) => c.sha256.length);
  check('у случаев записаны хэши для сверки', lengths.every((l) => l === 64));

  // --- разбор ответов модели ---
  const py = `
import sys
sys.path.insert(0, 'tools/training')
from answers import parse_answer, parse_action
cases = [
    ('{"bug": true}', True),
    ('{"bug": false}', False),
    ('Баг есть: {"bug":true}', True),
    ('{"bug":false} — файл в порядке', False),
    ('нет багов', False),
    ('сломан', True),
    ('всё в порядке', False),
    ('не знаю', None),
]
bad = [(t, got, want) for t, want in cases for got in [parse_answer(t)] if got != want]
assert not bad, bad
assert parse_action('{"action":"supply","squad":1}') == {'action': 'supply', 'squad': 1}
assert parse_action('не знаю') is None
assert parse_action('{"action":"hold","squad":0,"point":0}')['action'] == 'hold'
print('ok')
`;
  const parsed = await run('python3', ['-c', py], { cwd: ROOT });
  check('разбор ответов модели верный', parsed.stdout.trim() === 'ok', parsed.stdout.trim());

  // --- файлы пайплайна целы ---
  for (const file of ['tools/training/finetune.py', 'tools/training/eval-bugs.py']) {
    let ok = true;
    try { await run('python3', ['-m', 'py_compile', file], { cwd: ROOT }); } catch { ok = false; }
    check(`синтаксис ${file}`, ok);
  }

  // Обучение не должно тихо «учить» без данных.
  const finetune = await readFile(join(ROOT, 'tools/training/finetune.py'), 'utf8');
  check('обучение падает на пустом датасете',
    /пустой train\.jsonl/.test(finetune));
  // Учим ровно на токенах ответа: logits_to_keep срезает вопрос, а метки —
  // только target. Если это убрать, модель начнёт заучивать и вопрос.
  check('обучение учит только на ответе ассистента',
    /logits_to_keep/.test(finetune) && /labels\s*=\s*torch\.tensor\(target/.test(finetune),
    'нужен срез логитов по длине ответа');
  check('префикс и ответ токенизируются отдельно',
    /encode\(prefix_text/.test(finetune) && /full_text\[len\(prefix_text\):\]/.test(finetune),
    'иначе BPE склеит границу вопроса и ответа');
  check('обучение фиксирует ревизию базовой модели',
    /REVISION\s*=\s*'[0-9a-f]{40}'/.test(finetune));

  // Оценка обязана отличать «не разобрали» от «нет бага».
  const evalBugs = await readFile(join(ROOT, 'tools/training/eval-bugs.py'), 'utf8');
  check('оценка считает неразобранные ответы отдельно', /unparsed/.test(evalBugs));
  check('оценка считает ложные тревоги', /falseAlarm/.test(evalBugs));

  await rm(TMP, { recursive: true, force: true });

  console.log(`\n${passed} пройдено, ${failed} провалено`);
  if (failed) process.exit(1);
}

await main();
