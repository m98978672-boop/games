/* Проверка самой таблицы кодов бота: 000–999, без дыр и дублей.
   -----------------------------------------------------------------------------
   Таблица кодов — такой же инструмент, как и детекторы: если в ней дыра или
   два одинаковых номера, отчёт начинает врать. Здесь проверяется:

     1. ровно 1000 кодов, 000…999 без пропусков;
     2. у каждого кода есть категория и название;
     3. у каждой сотни есть слоты аудита и живые проверки;
     4. имя правила из каталога совпадает с тем, что возвращают детекторы,
        и наоборот — ни один детектор не остался без кода;
     5. документация (docs/bugcodes-bughunt.md) не разъехалась с каталогом.

   Запуск: node tools/bughunt/tests/codes.mjs */

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { CODES, CATEGORIES, CODE_BY_RULE, codeOf } from '../lib/catalog.mjs';
import { STATIC_RULES } from '../lib/rules.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(here, '../../..');

let failed = 0;
const ok = (cond, msg, extra) => {
  if (cond) console.log('  ✓ ' + msg);
  else { console.error('  ✗ ' + msg + (extra ? ': ' + extra : '')); failed++; }
};

console.log('ТАБЛИЦА КОДОВ БОТА-БАГОИСКАТЕЛЯ');
console.log('Каталог: tools/bughunt/lib/catalog.mjs');

/* ---------------------------- 1. диапазон ------------------------------ */
{
  ok(CODES.length === 1000, 'в таблице ровно 1000 кодов', 'их ' + CODES.length);
  const nums = CODES.map((c) => c.code);
  const gaps = [];
  for (let i = 0; i < 1000; i++) if (!nums.includes(i)) gaps.push(i);
  ok(gaps.length === 0, 'нет пропущенных номеров', gaps.slice(0, 8).join(', '));
  const dup = nums.filter((n, i) => nums.indexOf(n) !== i);
  ok(dup.length === 0, 'нет повторяющихся номеров', [...new Set(dup)].slice(0, 8).join(', '));
  ok(nums[0] === 0 && nums[999] === 999, 'таблица начинается с 000 и кончается 999');
}

/* --------------------------- 2. заполненность -------------------------- */
{
  const empty = CODES.filter((c) => !c.category || !c.title || !c.title.trim());
  ok(empty.length === 0, 'у каждого кода есть категория и название',
    empty.map((c) => codeOf(c.code)).slice(0, 8).join(', '));
  ok(CODES.every((c) => c.named === false ? c.audit === true : true),
    'код — это либо живая проверка, либо слот аудита');
  const long = CODES.filter((c) => c.title.length > 90);
  ok(long.length === 0, 'названия не длиннее 90 символов',
    long.slice(0, 3).map((c) => codeOf(c.code)).join(', '));
}

/* ----------------------------- 3. по сотням ---------------------------- */
{
  ok(CATEGORIES.length === 10, 'десять категорий по сотням', 'их ' + CATEGORIES.length);
  for (const cat of CATEGORIES) {
    const rows = CODES.filter((c) => c.code >= cat.base && c.code <= cat.base + 99);
    const live = rows.filter((c) => c.rule).length;
    const audit = rows.filter((c) => c.audit).length;
    ok(rows.length === 100, 'сотня ' + String(cat.base).padStart(3, '0') + ' полная',
      rows.length + ' кодов');
    ok(live > 0, 'в сотне ' + String(cat.base).padStart(3, '0') + ' есть живые проверки',
      String(live));
    ok(audit > 0, 'в сотне ' + String(cat.base).padStart(3, '0') + ' есть слоты аудита',
      String(audit));
  }
}

/* ------------------- 4. каталог ↔ детекторы (в обе стороны) ------------ */
{
  /* правила, которые бот выдаёт не из каталога статики, а изнутри себя */
  const runtime = ['падение', 'нечисло-после-игры', 'тест-падает', 'тест-завис',
    'бот-игры', 'правило-сломалось'];

  const catalogRules = new Set([...CODE_BY_RULE.keys()]);
  const unknown = [...catalogRules].filter((r) => !runtime.includes(r));
  ok(unknown.every((r) => typeof r === 'string' && r.length > 0),
    'у каждого живого кода есть имя правила');

  /* все имена правил, которые реально способны появиться в отчёте */
  const produced = new Set(runtime);
  const srcs = ['lib/rules.mjs', 'lib/checks.mjs', 'lib/play.mjs', 'lib/tests.mjs', 'bughunt.mjs']
    .map((f) => join(here, '..', f))
    .filter((f) => existsSync(f))
    .map((f) => readFileSync(f, 'utf8'))
    .join('\n');
  /* только «похожие на имя правила» строки: строчные, через дефис */
  for (const m of srcs.matchAll(/(?:rule|f)\(\s*'([a-zа-яё0-9][a-zа-яё0-9_-]+)'/g)) produced.add(m[1]);
  for (const m of srcs.matchAll(/rule:\s*'([^']+)'/g)) produced.add(m[1]);

  const missing = [...produced].filter((r) => !catalogRules.has(r) && !runtime.includes(r));
  ok(missing.length === 0, 'каждое правило бота есть в таблице кодов',
    missing.slice(0, 8).join(', '));

  /* обратное: живой код, чьё правило никто не выдает — мёртвая запись */
  const dead = [...catalogRules].filter((r) => !produced.has(r));
  ok(dead.length === 0, 'нет живых кодов без детектора', dead.slice(0, 8).join(', '));

  ok(STATIC_RULES.length >= 20, 'статических правил не меньше двадцати',
    String(STATIC_RULES.length));
}

/* ------------------------- 5. документация ---------------------------- */
{
  const path = join(ROOT, 'docs/bugcodes-bughunt.md');
  if (!existsSync(path)) {
    console.log('  · docs/bugcodes-bughunt.md ещё не создан — генерация не требуется');
  } else {
    const doc = readFileSync(path, 'utf8');
    const live = CODES.filter((c) => c.rule);
    const absent = live.filter((c) => !doc.includes('| ' + codeOf(c.code) + ' |'));
    ok(absent.length === 0, 'в документации есть все живые коды',
      absent.slice(0, 6).map((c) => codeOf(c.code)).join(', '));
    const count = (doc.match(/^\| \d{3} \|/gm) || []).length;
    ok(count === 1000, 'в документации 1000 строк таблицы', 'их ' + count);
  }
}

console.log('');
if (failed) { console.error('✗ Провалено проверок: ' + failed); process.exit(1); }
console.log('✓ Таблица кодов полна, категории на месте, детекторы и документация совпадают');
