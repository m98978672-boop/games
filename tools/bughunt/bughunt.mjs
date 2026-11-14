#!/usr/bin/env node
/* БОТ-БАГОИСКАТЕЛЬ — ищет ошибки во всём репозитории и складывает их
   в отчёт, который можно прочитать и раздать на исправление.

   Запуск:
     node tools/bughunt/bughunt.mjs                  быстрый обход (без тестов проектов)
     node tools/bughunt/bughunt.mjs --full           всё: статика + запуск игр + тесты проектов
     node tools/bughunt/bughunt.mjs --only 1in8b     только один проект
     node tools/bughunt/bughunt.mjs --tests          статика + тесты, без запуска игр
     node tools/bughunt/bughunt.mjs --play           статика + запуск игр, без тестов
     node tools/bughunt/bughunt.mjs --level важно    молчать о мелочах
     node tools/bughunt/bughunt.mjs --out путь       куда класть отчёт (по умолчанию tools/bughunt/report)

   Код выхода: 1, если нашлось хоть что-то важнее мелочи. */

import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { walk, projects, read } from './lib/scan.mjs';
import { STATIC_RULES } from './lib/rules.mjs';
import { playGame } from './lib/play.mjs';
import { runTests, runOwnBot } from './lib/tests.mjs';
import { write, printSummary, LEVELS, summary, withCodes } from './lib/report.mjs';
import { CODES, CATEGORIES, codeTable } from './lib/catalog.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(here, '../..');

function parseArgs(argv) {
  const a = {
    /* по умолчанию — полный прогон по всему репозиторию: статика, игры, тесты.
       `--static` оставляет только чтение файлов (быстро) */
    full: true, tests: true, play: true, only: null, level: 'мелочь',
    out: join(here, 'report'), quiet: false, lives: 300, testTimeout: 600000,
    list: null, failOn: 'важно',
  };
  for (let i = 0; i < argv.length; i++) {
    const x = argv[i];
    if (x === '--full') { a.full = true; a.tests = true; a.play = true; }
    else if (x === '--static' || x === '--quick') { a.full = false; a.tests = false; a.play = false; }
    else if (x === '--codes') a.list = [0, 999];
    else if (x === '--code') { const n = Number(argv[++i]) || 0; a.list = [n - (n % 100), n - (n % 100) + 99]; }
    else if (x === '--fail-on') a.failOn = argv[++i];
    else if (x === '--tests') a.tests = true;
    else if (x === '--play') a.play = true;
    else if (x === '--only') a.only = argv[++i];
    else if (x === '--level') a.level = argv[++i];
    else if (x === '--out') a.out = resolve(process.cwd(), argv[++i]);
    else if (x === '--lives') a.lives = Number(argv[++i]) || 300;
    else if (x === '--test-timeout') a.testTimeout = (Number(argv[++i]) || 600) * 1000;
    else if (x === '--quiet') a.quiet = true;
    else if (x === '--help' || x === '-h') { help(); process.exit(0); }
  }
  return a;
}

function help() {
  console.log(`БОТ-БАГОИСКАТЕЛЬ

  node tools/bughunt/bughunt.mjs [флаги]

  (по умолчанию)    статика + запуск игр + тесты проектов — весь репозиторий
  --static          только чтение файлов (быстро, ~30 с)
  --full            то же, что по умолчанию: оставлено для совместимости
  --play            статика + запуск игр в мини-браузере
  --tests           статика + запуск собственных тестов проектов
  --only <проект>   проверить один проект (например, 1in8b)
  --level <уровень> критично | важно | мелочь — что показывать (по умолчанию всё)
  --lives <число>   сколько жизней просить у играющих ботов проектов
  --test-timeout <с> сколько ждать один тест (по умолчанию 600)
  --out <путь>      куда писать report.md и report.json
  --quiet           без подробного вывода
  --codes           напечатать таблицу кодов 000–999 и выйти
  --code 412        то же, но только сотня с этим кодом (400–499)
  --fail-on <ур.>   с какого уровня считать прогон провальным (по умолчанию «важно»)

  Код выхода 1 — найдено что-то важнее мелочи.`);
}

/* Игра может уронить обещание уже после того, как бот отвёл от неё взгляд.
   Такие ошибки идут в отчёт, а бота не убивают. */
const lateErrors = [];
let currentProject = 'репозиторий';
/* чей это файл — видно по пути, и это вернее, чем «кого проверяли в тот миг» */
function blame(e) {
  const stack = String((e && e.stack) || '');
  const file = (stack.match(/([\w./-]+\.m?js):(\d+)/) || [])[1] || '';
  const line = Number((stack.match(/[\w./-]+\.m?js:(\d+)/) || [])[1]) || 1;
  const project = file && file.includes('/') ? file.slice(0, file.indexOf('/')) : currentProject;
  return { file: file || '—', line, project };
}
function late(e, what, hint) {
  const { file, line, project } = blame(e);
  lateErrors.push({
    rule: 'падение', severity: 'важно', project, file, line,
    msg: what + ': ' + String((e && e.message) || e).slice(0, 160), hint: hint || '',
  });
}
process.on('unhandledRejection', (e) => late(e, 'ошибка всплыла уже после хода',
  'необработанное обещание — в браузере это «Uncaught (in promise)»'));
process.on('uncaughtException', (e) => late(e, 'непойманная ошибка', ''));

/* Печать таблицы кодов: звёздочкой помечены те, у которых есть живой детектор. */
function printCodes(range) {
  const rows = codeTable(range);
  let block = null;
  for (const r of rows) {
    const b = CATEGORIES.find((c) => Number(r.code) >= c.base && Number(r.code) <= c.base + 99);
    if (b && b.title !== block) {
      block = b.title;
      console.log('\n=== ' + String(b.base).padStart(3, '0') + '–' + (b.base + 99) + ' · ' + b.title + ' ===');
    }
    console.log(' ' + r.code + '  ' + (r.live ? '* ' : '  ') + r.title);
  }
  const live = rows.filter((r) => r.live).length;
  console.log('\nкодов: ' + rows.length + ' · с живым детектором: ' + live +
    ' · слоты аудита: ' + (rows.length - live));
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.list) { printCodes(args.list); return; }
  const started = Date.now();
  const log = args.quiet ? () => {} : console.log;

  log('БОТ-БАГОИСКАТЕЛЬ');
  log('Репозиторий: ' + ROOT);

  const files = walk(ROOT);
  let list = projects(ROOT, files);
  if (args.only) {
    list = list.filter((p) => p.name === args.only);
    if (!list.length) { console.error('Нет такого проекта: ' + args.only); process.exit(2); }
  }

  const findings = [];
  const stubs = new Set();
  const skipped = [];
  const stats = {
    projects: list.length,
    files: list.reduce((n, p) => n + p.files.length, 0),
    scripts: list.reduce((n, p) => n + p.js.length, 0),
    rules: STATIC_RULES.length + 4,
    codes: CODES.length,
    testsRun: 0,
    played: 0,
  };

  /* ------------------------- 1. статика ------------------------------- */
  log('');
  log('1. Читаю файлы: ' + stats.files + ' в ' + stats.projects + ' проектах');

  /* Правила уровня репозитория: CI, workflow, тесты всех проектов сразу. */
  const repo = {
    name: 'репозиторий', kind: 'корень', dir: ROOT, files, tests: [],
    js: files.filter((f) => /\.(js|mjs|cjs)$/.test(f)),
    html: files.filter((f) => /\.html?$/.test(f)),
    css: files.filter((f) => /\.css$/.test(f)),
    json: files.filter((f) => /\.json$/.test(f)),
    md: files.filter((f) => /\.md$/.test(f)),
    hasPackage: false,
  };
  for (const rule of STATIC_RULES) {
    if (!rule.repo) continue;
    try {
      findings.push(...(rule.async ? await rule.fn(ROOT, repo) : rule.fn(ROOT, repo)));
    } catch (e) {
      findings.push({
        rule: 'правило-сломалось', severity: 'важно', project: 'репозиторий',
        file: 'tools/bughunt/lib/checks.mjs', line: 1,
        msg: 'правило «' + rule.id + '» упало: ' + e.message, hint: '',
      });
    }
  }

  for (const p of list) {
    for (const rule of STATIC_RULES) {
      if (rule.repo) continue;
      try {
        const got = rule.async ? await rule.fn(ROOT, p) : rule.fn(ROOT, p);
        findings.push(...got);
      } catch (e) {
        findings.push({
          rule: 'правило-сломалось', severity: 'мелочь', project: p.name,
          file: 'tools/bughunt/lib/rules.mjs', line: 1,
          msg: 'правило «' + rule.id + '» упало на проекте ' + p.name + ': ' + e.message, hint: '',
        });
      }
    }
  }
  log('   находок после статики: ' + findings.length);

  /* --------------------- 2. запуск игр в мини-браузере ----------------- */
  if (args.play || args.full) {
    log('');
    log('2. Запускаю игры и тыкаю в них');
    for (const p of list) {
      if (!p.html.length) continue;
      currentProject = p.name;
      let r;
      try {
        r = playGame(ROOT, p, {});
      } catch (e) {
        findings.push({
          rule: 'падение', severity: 'важно', project: p.name, file: p.html[0], line: 1,
          msg: 'бот не смог доиграть: ' + e.message, hint: '',
        });
        continue;
      }
      r.stubs.forEach((x) => stubs.add(p.name + ': ' + x));
      findings.push(...r.findings);
      if (r.skipped) { skipped.push({ test: p.name, why: r.skipped }); continue; }
      stats.played++;
      log('   ' + p.name.padEnd(22) + ' скриптов ' + String(r.loaded).padStart(2) +
        ' · кнопок ' + String(r.clicked).padStart(2) +
        ' · находок ' + r.findings.length);
    }
  }

  /* ------------------- 3. собственные тесты проектов ------------------- */
  if (args.tests || args.full) {
    log('');
    log('3. Запускаю тесты проектов');
    /* Проекты независимы: запускаем параллельно, но не больше четырёх сразу,
       иначе таймаут ловит очередь, а не зависание. */
    const queue = list.filter((p) => p.tests.length);
    const worker = async () => {
      while (queue.length) {
        const p = queue.shift();
        currentProject = p.name;
        const r = await runTests(ROOT, p, { timeout: args.testTimeout });
        findings.push(...r.findings);
        skipped.push(...r.skipped);
        stats.testsRun += r.ran.length;
        if (r.ran.length) {
          const bad = r.ran.filter((x) => !x.ok).length;
          log('   ' + p.name.padEnd(22) + ' тестов ' + String(r.ran.length).padStart(2) +
            (bad ? ' · упало ' + bad : ' · все прошли'));
        }
        const own = await runOwnBot(ROOT, p, args.lives, args.testTimeout);
        if (own) {
          findings.push(...own.findings);
          log('   ' + p.name.padEnd(22) + ' свой бот: ' + (own.ok ? 'нарушений нет' : 'НАШЁЛ НАРУШЕНИЯ'));
        }
      }
    };
    await Promise.all(Array.from({ length: Math.min(4, queue.length) }, worker));
  }

  /* --------------------------- 4. отчёт -------------------------------- */
  findings.push(...lateErrors);
  const keep = LEVELS.slice(0, LEVELS.indexOf(args.level) + 1);
  const shown = withCodes(findings).filter((x) => keep.includes(x.severity));
  const result = {
    started, finished: Date.now(),
    mode: args.full ? 'полный' : args.tests && args.play ? 'статика, игры и тесты'
      : args.tests ? 'статика и тесты' : args.play ? 'статика и запуск игр' : 'быстрый',
    findings: shown, stats, stubs: [...stubs], skipped,
  };
  write(result, args.out + '.md', args.out + '.json');
  if (!args.quiet) printSummary(result, log);
  log('');
  log('Отчёт: ' + args.out + '.md  и  ' + args.out + '.json');

  const s = summary(shown).by;
  const limit = Math.max(0, LEVELS.indexOf(args.failOn));
  const bad = LEVELS.slice(0, limit + 1).reduce((n, lvl) => n + (s[lvl] || 0), 0);
  log('Кодов в отчёте: ' + new Set(shown.filter((x) => x.code).map((x) => x.code)).size +
    ' из таблицы ' + CODES.length);
  process.exit(bad ? 1 : 0);
}

main().catch((e) => { console.error('Бот сам сломался:', e); process.exit(2); });
