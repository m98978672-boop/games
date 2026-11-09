/* Третья часть бота: запустить собственные тесты проектов и записать,
   что именно упало. Тесты, которым нужен настоящий браузер или не
   установленные зависимости, честно помечаются как пропущенные. */

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const run = promisify(execFile);

/* эти тесты бот не запускает: им нужен настоящий браузер, видеокарта,
   картинки-эталоны или сеть */
const HEAVY = /(browser|render|preview|shot|screenshot|perf|view|texview|dashview|cabview|softview|diag|benchmark|device|autopilot|seams)/i;

export function testsOf(project) {
  return project.tests
    .filter((t) => !/\/_[^/]+\.mjs$/.test(t))     /* _файлы — вспомогательные */
    .filter((t) => !HEAVY.test(t.slice(t.lastIndexOf('/') + 1)))
    .sort();
}

export async function runTests(root, project, opts = {}) {
  const findings = [];
  const ran = [];
  const skipped = [];
  const list = testsOf(project);
  const needsDeps = project.hasPackage && !project.hasNodeModules;

  for (const test of list) {
    if (needsDeps) { skipped.push({ test, why: 'не установлены зависимости (npm i)' }); continue; }
    const started = Date.now();
    try {
      const { stdout } = await run(process.execPath, [join(root, test)], {
        cwd: root, timeout: opts.timeout || 240000, maxBuffer: 32 * 1024 * 1024,
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
  if (needsDeps && list.length) {
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
