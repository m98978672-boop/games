/* Третья часть бота: запустить собственные тесты проектов и записать,
   что именно упало. Тесты, которым нужен настоящий браузер или не
   установленные зависимости, честно помечаются как пропущенные. */

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { existsSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';

const run = promisify(execFile);

/* эти тесты бот не запускает: им нужен настоящий браузер, видеокарта,
   картинки-эталоны или сеть */
const HEAVY = /(browser|render|preview|shot|screenshot|perf|view|texview|dashview|cabview|softview|diag|benchmark|device|autopilot|seams|covers|phone-features|shaderlog|site-check|robust)/i;

/* Папка с package.json рядом с тестом: subir до первого найденного,
   но не выше корня репозитория. */
export function ownPackageDir(root, test) {
  let dir = dirname(join(root, test));
  for (let i = 0; i < 3; i++) {
    if (existsSync(join(dir, 'package.json'))) return dir;
    const up = dirname(dir);
    if (!up.startsWith(root) || up === dir) break;
    dir = up;
  }
  return null;
}

export function testsOf(project) {
  return project.tests
    /* Собранные бандлы (*.bundle.js, .harness-bundle.js) — это выход
       сборки, а не тест: они рассчитывают на браузер и падают
       «window is not defined». Запускать их напрямую в Node бессмысленно. */
    .filter((t) => !/\.bundle\.(m?js)$/i.test(t))
    .filter((t) => !/\/_[^/]+\.mjs$/.test(t))     /* _файлы — вспомогательные */
    .filter((t) => !HEAVY.test(t.slice(t.lastIndexOf('/') + 1)))
    .sort();
}

export async function runTests(root, project, opts = {}) {
  const findings = [];
  const ran = [];
  const skipped = [];
  const list = testsOf(project);
  /* Тест может лежать не в корне проекта, а в собственной папке со своим
     package.json (tools/razlom-web/test.mjs требует playwright). Тогда
     «нет node_modules» надо смотреть рядом с тестом, иначе бот падает
     ERR_MODULE_NOT_FOUND и записывает это как дефект игры. */
  /* Зависимости — вопрос отдельной папки, а не всего проекта: у проекта
     tools одни тесты самодостаточны, а tools/razlom-web требует
     playwright. Поэтому решаем для каждого теста отдельно, иначе один
     тяжёлый сосед утаскивает в пропуск все остальные. */
  const needsDepsFor = (test) => {
    const ownPkg = ownPackageDir(root, test);
    if (ownPkg) return !existsSync(join(ownPkg, 'node_modules'));
    return project.hasPackage && !project.hasNodeModules;
  };

  for (const test of list) {
    if (needsDepsFor(test)) { skipped.push({ test, why: 'не установлены зависимости (npm i)' }); continue; }
    const started = Date.now();
    try {
      /* Рабочая папка — папка самого теста, а не корень репозитория.
         Тесты игр читают файлы относительно себя (`assets/kenney/…`,
         `src/main.js`, `tests/.harness-bundle.js`), поэтому запуск из
         корня давал пачку ложных «тест не проходит: ENOENT» — так были
         оболганы night-taxi, last-shore и euro-haul. Путь к файлу
         остаётся абсолютным, меняется только cwd. */
      /* Рабочая папка — папка проекта, а не корень репозитория. Тесты игр
         читают файлы относительно себя (`assets/kenney/…`, `src/main.js`,
         `tests/.harness-bundle.js`), поэтому запуск из корня давал пачку
         ложных «тест не проходит: ENOENT» — так были оболганы night-taxi,
         last-shore и euro-haul. Берём папку из пути самого теста
         (`night-taxi/tests/ui.mjs` → `night-taxi`). */
      const testDir = dirname(join(root, test));
      const projectDir = basename(testDir) === 'tests' ? dirname(testDir) : testDir;
      const { stdout } = await run(process.execPath, [join(root, test)], {
        cwd: projectDir, timeout: opts.timeout || 240000, maxBuffer: 32 * 1024 * 1024,
        env: { ...process.env, BUGHUNT: '1' },
      });
      ran.push({ test, ms: Date.now() - started, ok: true, tail: tail(stdout) });
    } catch (e) {
      const out = String(e.stdout || '') + String(e.stderr || '');
      if (e.killed || /ETIMEDOUT/.test(String(e.code))) {
        findings.push({
          rule: 'тест-завис', severity: 'важно', project: project.name, file: test, line: 1,
          msg: 'тест не закончился за ' + Math.round((opts.timeout || 240000) / 1000) + ' с',
          hint: 'возможен бесконечный цикл: node ' + test,
        });
        ran.push({ test, ms: Date.now() - started, ok: false, tail: tail(out) });
        continue;
      }
      /* Тест, которому не хватило браузера, — это не дефект игры. В
         песочнице без libnspr4 Chromium падает с «Failed to launch the
         browser process: Code 127», и бот честно писал «тест не проходит»
         на пять браузерных тестов LAST SHORE. Различаем: не смогли
         запустить браузер → пропуск; тест упал по существу → находка. */
      if (/Failed to launch the browser process|error while loading shared libraries|Code: 127|browserType\.launch/i.test(out)) {
        skipped.push({ test, why: 'нужен браузер, а он в этой среде не запускается' });
        ran.push({ test, ms: Date.now() - started, ok: true, tail: 'пропуск: браузер недоступен' });
        continue;
      }
      const lines = out.split('\n').filter((l) => /✗|Error|error|провал|Провалено|AssertionError|not ok/.test(l));
      findings.push({
        rule: 'тест-падает', severity: 'критично', project: project.name, file: test, line: 1,
        msg: 'тест не проходит: ' + (lines[0] || 'код выхода ' + e.code).trim().slice(0, 200),
        hint: 'повторить: node ' + test,
        details: lines.slice(0, 12).map((l) => l.trim()),
      });
      ran.push({ test, ms: Date.now() - started, ok: false, tail: tail(out) });
    }
  }
  /* Отдельная строка про package.json — только если из-за зависимостей
     не запустился ни один тест. Иначе шум: часть тестов отработала. */
  if (list.length && !ran.length && skipped.length >= list.length) {
    skipped.push({ test: project.name + '/package.json', why: 'npm-зависимости не установлены' });
  }
  return { findings, ran, skipped };
}

function tail(text, n = 6) {
  return String(text || '').trim().split('\n').slice(-n).join('\n');
}

/* Есть ли у проекта свой играющий бот (как у 1in8b) — его запускаем с запасом. */
export async function runOwnBot(root, project, lives = 300, timeout = 300000) {
  const bot = project.tests.find((t) => /\/bot\.mjs$/.test(t));
  if (!bot) return null;
  try {
    const { stdout } = await run(process.execPath, [join(root, bot), String(lives)], {
      cwd: root, timeout, maxBuffer: 32 * 1024 * 1024,
    });
    return { bot, ok: true, out: stdout.trim().split('\n').slice(-8).join('\n'), findings: [] };
  } catch (e) {
    const out = String(e.stdout || '') + String(e.stderr || '');
    const lines = out.split('\n').filter((l) => /✗|нарушен|Error/.test(l)).slice(0, 10);
    return {
      bot, ok: false, out: out.trim().split('\n').slice(-12).join('\n'),
      findings: [{
        rule: 'бот-игры', severity: 'критично', project: project.name, file: bot, line: 1,
        msg: 'играющий бот нашёл нарушения: ' + (lines[0] || 'код выхода ' + e.code).trim().slice(0, 200),
        hint: 'повторить: node ' + bot + ' ' + lives,
        details: lines,
      }],
    };
  }
}

export function hasNodeModules(root, project) {
  return existsSync(join(root, project.name, 'node_modules'));
}
