/* Отчёт бота: один файл для человека (Markdown) и один для машины (JSON).
   Находки сортируются по важности, одинаковые схлопываются. */

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

export const LEVELS = ['критично', 'важно', 'мелочь'];
const ICON = { критично: '🔴', важно: '🟡', мелочь: '⚪' };

export function sortFindings(list) {
  return [...list].sort((a, b) => {
    const d = LEVELS.indexOf(a.severity) - LEVELS.indexOf(b.severity);
    if (d) return d;
    const p = String(a.project).localeCompare(String(b.project), 'ru');
    if (p) return p;
    const f = String(a.file).localeCompare(String(b.file), 'ru');
    if (f) return f;
    return (a.line || 0) - (b.line || 0);
  });
}

/* одинаковое правило в одном файле много раз — сворачиваем в одну строку */
export function squash(list, limitPerFile = 3) {
  const out = [];
  const count = new Map();
  for (const x of sortFindings(list)) {
    const key = x.rule + '|' + x.project + '|' + x.file;
    const n = (count.get(key) || 0) + 1;
    count.set(key, n);
    if (n <= limitPerFile) out.push(x);
    else if (n === limitPerFile + 1) {
      out.push({ ...x, line: 0, msg: 'и ещё находки того же правила в этом файле', collapsed: true });
    }
  }
  return out;
}

export function summary(list) {
  const by = { критично: 0, важно: 0, мелочь: 0 };
  const byRule = new Map();
  const byProject = new Map();
  for (const x of list) {
    by[x.severity] = (by[x.severity] || 0) + 1;
    byRule.set(x.rule, (byRule.get(x.rule) || 0) + 1);
    byProject.set(x.project, (byProject.get(x.project) || 0) + 1);
  }
  return { by, byRule, byProject, total: list.length };
}

export function toMarkdown(result) {
  const { findings, stats, started, finished, mode } = result;
  const s = summary(findings);
  const lines = [];
  const date = new Date(finished).toISOString().slice(0, 16).replace('T', ' ');

  lines.push('# Отчёт бота-багоискателя');
  lines.push('');
  lines.push('Собран ' + date + ' UTC · режим: ' + mode + ' · ' +
    ((finished - started) / 1000).toFixed(1) + ' с');
  lines.push('');
  lines.push('| Важность | Сколько |');
  lines.push('|---|---:|');
  for (const lvl of LEVELS) lines.push('| ' + ICON[lvl] + ' ' + lvl + ' | ' + (s.by[lvl] || 0) + ' |');
  lines.push('| **всего** | **' + s.total + '** |');
  lines.push('');
  lines.push('Проверено: проектов ' + stats.projects + ', файлов ' + stats.files +
    ', скриптов ' + stats.scripts + ', правил ' + stats.rules +
    ', тестов запущено ' + stats.testsRun + ', игр сыграно ' + stats.played + '.');
  lines.push('');

  if (!findings.length) {
    lines.push('## Ничего не найдено');
    lines.push('');
    lines.push('Бот прошёл все проверки и не нашёл, к чему придраться.');
    return lines.join('\n') + '\n';
  }

  lines.push('## Находки');
  lines.push('');
  let project = null;
  for (const x of squash(findings)) {
    if (x.project !== project) {
      project = x.project;
      lines.push('');
      lines.push('### ' + project);
      lines.push('');
    }
    const where = x.file + (x.line ? ':' + x.line : '');
    lines.push('- ' + ICON[x.severity] + ' **' + x.rule + '** · `' + where + '` — ' + x.msg +
      (x.hint ? '  \n  _' + x.hint + '_' : ''));
    if (x.details && x.details.length) {
      lines.push('  ```');
      x.details.forEach((d) => lines.push('  ' + d));
      lines.push('  ```');
    }
  }
  lines.push('');
  lines.push('## По правилам');
  lines.push('');
  lines.push('| Правило | Находок |');
  lines.push('|---|---:|');
  [...s.byRule.entries()].sort((a, b) => b[1] - a[1])
    .forEach(([rule, n]) => lines.push('| ' + rule + ' | ' + n + ' |'));
  lines.push('');
  if (result.stubs && result.stubs.length) {
    lines.push('## Боту не хватило заглушек (это не баги игр)');
    lines.push('');
    result.stubs.slice(0, 20).forEach((x) => lines.push('- ' + x));
    lines.push('');
  }
  if (result.skipped && result.skipped.length) {
    lines.push('## Пропущено');
    lines.push('');
    result.skipped.slice(0, 40).forEach((x) => lines.push('- `' + x.test + '` — ' + x.why));
    lines.push('');
  }
  return lines.join('\n') + '\n';
}

export function write(result, mdPath, jsonPath) {
  mkdirSync(dirname(mdPath), { recursive: true });
  writeFileSync(mdPath, toMarkdown(result), 'utf8');
  writeFileSync(jsonPath, JSON.stringify({
    собран: new Date(result.finished).toISOString(),
    режим: result.mode,
    секунд: Number(((result.finished - result.started) / 1000).toFixed(1)),
    сводка: summary(result.findings).by,
    проверено: result.stats,
    находки: sortFindings(result.findings),
    заглушки: result.stubs || [],
    пропущено: result.skipped || [],
  }, null, 2) + '\n', 'utf8');
}

export function printSummary(result, log = console.log) {
  const s = summary(result.findings);
  log('');
  log('Проверено: проектов ' + result.stats.projects + ' · файлов ' + result.stats.files +
    ' · правил ' + result.stats.rules + ' · тестов ' + result.stats.testsRun +
    ' · игр сыграно ' + result.stats.played);
  log('Найдено: 🔴 критично ' + (s.by['критично'] || 0) +
    ' · 🟡 важно ' + (s.by['важно'] || 0) +
    ' · ⚪ мелочь ' + (s.by['мелочь'] || 0));
  const top = squash(result.findings, 1).filter((x) => x.severity !== 'мелочь').slice(0, 12);
  if (top.length) {
    log('');
    log('Самое важное:');
    for (const x of top) {
      log('  ' + ICON[x.severity] + ' ' + x.project + ' · ' + x.file + (x.line ? ':' + x.line : '') +
        ' — ' + x.msg.slice(0, 120));
    }
  }
}
