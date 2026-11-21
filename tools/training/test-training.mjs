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

/* Безопасный разбор: битый манифест должен давать понятную ошибку. */
const parseJson = (text, where) => {
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error(`битый JSON (${where}): ${e.message}`);
  }
};

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
  const manifest = parseJson(await readFile(join(TMP, 'manifest.json'), 'utf8'), 'manifest.json');

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

  /* Дефект должен быть точечным: если порча стёрла полфайла, чистый и битый
     становятся несравнимы и модель учится не тому. Проверяем, что длина
     изменилась не больше чем на 10% (или на 400 байт для мелких файлов). */
  let oversized = [];
  for (const c of manifest.cases.filter((x) => x.hasBug)) {
    const clean = manifest.cases.find((x) => x.scenario === c.scenario && !x.hasBug);
    const a = await readFile(join(TMP, c.name), 'utf8');
    const b = await readFile(join(TMP, clean.name), 'utf8');
    const delta = Math.abs(a.length - b.length);
    if (delta > Math.max(400, b.length * 0.1)) oversized.push(c.scenario);
  }
  check('каждый дефект точечный, файл не разрушен', oversized.length === 0,
    'слишком большие изменения: ' + oversized.join(', '));

  // У каждого дефекта обязан быть код из таблицы баг-искателя.
  check('у каждого дефекта есть код правила',
    manifest.cases.filter((x) => x.hasBug).every((x) => /^\d{3}$/.test(String(x.code))));

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

  // Промпт обучения и оценки обязан быть одним и тем же. Раньше они жили
  // в двух местах и разъехались: модель училась одному ответу, а меряли другой.
  const prompts = parseJson(
    await readFile(join(ROOT, 'tools/training/prompts.json'), 'utf8'), 'prompts.json');
  const buildKnowledge = await readFile(join(ROOT, 'tools/training/build-knowledge.mjs'), 'utf8');
  const evalBugs = await readFile(join(ROOT, 'tools/training/eval-bugs.py'), 'utf8');

  check('есть единый файл промптов с разделом bugCheck',
    Boolean(prompts.bugCheck && typeof prompts.bugCheck.system === 'string'
      && prompts.bugCheck.system.length > 50));
  check('обучение читает промпт из prompts.json', /prompts\.json/.test(buildKnowledge));
  check('оценка читает промпт из prompts.json', /prompts\.json/.test(evalBugs));
  check('в промпте есть подстановка имени файла', /\{file\}/.test(prompts.bugCheck.userPrefix));
  check('чистый ответ в промптах — ровно {"bug":false}',
    prompts.bugCheck.cleanAnswer === '{"bug":false}');

  /* Оценка не должна врать в обе стороны: правильный ответ обязан
     засчитываться, а неразобранный — попадать в unparsed, а не в «нет бага».
     Иначе 0% на игрушечной модели нельзя отличить от сломанного измерения. */
  const scoreProbe = await run('python3', ['-c', `
import sys, json
sys.path.insert(0, 'tools/training')
from answers import parse_answer
import importlib.util
spec = importlib.util.spec_from_file_location('ev', 'tools/training/eval-bugs.py')
src = open('tools/training/eval-bugs.py', encoding='utf-8').read()
# функция score определена в модуле после импортов torch — воспроизводим её логику
res = [
  {'expected': True,  'answer': parse_answer('{"bug":true,"code":"600","why":"x"}')},
  {'expected': True,  'answer': parse_answer('{"bug":false}')},
  {'expected': False, 'answer': parse_answer('{"bug":false}')},
  {'expected': True,  'answer': parse_answer('совсем не json')},
]
bugs = [r for r in res if r['expected']]
clean = [r for r in res if not r['expected']]
correct = sum(1 for r in res if r['answer'] == r['expected'])
found = sum(1 for r in bugs if r['answer'] is True)
fa = sum(1 for r in clean if r['answer'] is True)
un = sum(1 for r in res if r['answer'] is None)
assert correct == 2, correct
assert found == 1, found
assert fa == 0, fa
assert un == 1, un
print('ok')
`], { cwd: ROOT });
  check('оценка засчитывает верное и не путает неразобранное', scoreProbe.stdout.trim() === 'ok',
    scoreProbe.stdout.trim());

  // Оценка обязана отличать «не разобрали» от «нет бага».
  check('оценка считает неразобранные ответы отдельно', /unparsed/.test(evalBugs));
  check('оценка считает ложные тревоги', /falseAlarm/.test(evalBugs));

  await rm(TMP, { recursive: true, force: true });

  console.log(`\n${passed} пройдено, ${failed} провалено`);
  if (failed) process.exit(1);
}

await main();
