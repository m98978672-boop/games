// Обзор ВСЕГО git-репозитория: синтаксис JS/JSON и структурная проверка PNG.
// Это не запуск игр, не статический анализ безопасности и не полная приёмка.
import { spawnSync } from 'node:child_process';
import { existsSync, lstatSync, readFileSync } from 'node:fs';
import { dirname, extname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { validatePng } from './game-auditor.mjs';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
export function listRepositoryFiles(root = repoRoot) {
  const r = spawnSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'],
    { cwd: root, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
  if (r.error || r.status !== 0) throw new Error(`git ls-files: ${r.error?.message || r.stderr}`);
  return [...new Set(r.stdout.split('\0').filter(Boolean))].sort();
}
export function scanRepository(root, files) {
  const counts = { files: files.length, json: 0, javascript: 0, png: 0, html: 0, htmlReferences: 0, other: 0, symlinks: 0, missing: 0 };
  const issues = [];
  const add = (code, file, message, observed, action) => issues.push({ code, file, status: 'fail', message, observed, action });
  for (const file of files) {
    const absolute = resolve(root, file), rel = relative(root, absolute);
    if (isAbsolute(file) || rel === '..' || rel.startsWith('..' + sep)) {
      add(800, file, 'Путь выходит за границы репозитория', file, 'Исключить недопустимый путь.'); continue;
    }
    let info;
    try { info = lstatSync(absolute); }
    catch (e) { counts.missing++; add(801, file, 'Файл отсутствует или недоступен', e.code || String(e), 'Восстановить файл или исправить индекс git.'); continue; }
    if (info.isSymbolicLink()) { counts.symlinks++; continue; }
    if (!info.isFile()) { counts.other++; continue; }
    const ext = extname(file).toLowerCase();
    if (ext === '.json') {
      counts.json++;
      try { JSON.parse(readFileSync(absolute, 'utf8')); }
      catch (e) { add(802, file, 'Неверный JSON или ошибка чтения', e.message, 'Исправить JSON и повторить проверку.'); }
    } else if (ext === '.js' || ext === '.mjs' || ext === '.cjs') {
      counts.javascript++;
      const result = spawnSync(process.execPath, ['--check', absolute], { cwd: root, encoding: 'utf8', timeout: 20_000, maxBuffer: 1024 * 1024 });
      if (result.status !== 0 || result.error) add(803, file, 'Не пройдена проверка синтаксиса Node.js',
        (result.stderr || result.error?.message || `код ${result.status}, сигнал ${result.signal}`).trim().slice(0, 2000),
        'Проверить синтаксис и окружение этого файла; проверка не запускает программу.');
    } else if (ext === '.html') {
      counts.html++;
      try {
        const html = readFileSync(absolute, 'utf8').replace(/<!--[\s\S]*?-->/g, '');
        // Только буквальные ссылки script/src, img/src и link/href; динамику,
        // root-relative и внешние адреса этот ограниченный разбор не проверяет.
        for (const tag of html.matchAll(/<(script|img|link)\b([^>]*?)>/gi)) {
          const attr = tag[1].toLowerCase() === 'link' ? 'href' : 'src';
          const match = tag[2].match(new RegExp(`(?:^|\\s)${attr}\\s*=\\s*(["'])(.*?)\\1`, 'i'));
          if (!match) continue;
          const raw = match[2], value = raw.split(/[?#]/, 1)[0];
          if (!value || value.startsWith('/') || /^[a-z][a-z0-9+.-]*:/i.test(value) || value.includes('${')) continue;
          counts.htmlReferences++;
          let dest;
          try { dest = resolve(dirname(absolute), decodeURIComponent(value)); }
          catch { add(805, file, 'Некорректный адрес локального ресурса HTML', raw, 'Исправить ссылку.'); continue; }
          const target = relative(root, dest);
          if (target === '..' || target.startsWith('..' + sep) || !existsSync(dest))
            add(805, file, 'Локальный ресурс HTML отсутствует или выходит за пределы репозитория', raw, 'Восстановить ресурс или исправить ссылку.');
        }
      } catch (e) { add(805, file, 'HTML не удалось прочитать', e.message, 'Восстановить файл.'); }
    } else if (ext === '.png') {
      counts.png++;
      try { const error = validatePng(readFileSync(absolute)); if (error) add(804, file, 'Некорректная структура PNG', error, 'Восстановить файл и проверить его в целевой игре.'); }
      catch (e) { add(804, file, 'PNG недоступен', e.code || e.message, 'Восстановить файл.'); }
    } else counts.other++;
  }
  return { version: 1, scope: 'entire_repository', mode: 'static', complete: false, counts, issues,
    limitations: ['Учтены отслеживаемые и неигнорируемые новые файлы git, но не игнорируемые файлы и зависимости.',
      'JS: только синтаксис Node.js; JSON: только разбор; PNG: только частичная структура, CRC и распаковка.',
      'HTML: только буквальные относительные ссылки script, link и img; динамические и абсолютные ссылки не проверяются.',
      'Другие форматы, символические ссылки, запуск каждой игры, UI, механики, лицензии и безопасность не проверяются.',
      'Отсутствие обнаруженных ошибок не означает исправность всего репозитория.'] };
}
export function formatRepositoryReport(report) {
  const c = report.counts;
  const lines = ['ОБЗОР ВСЕГО РЕПОЗИТОРИЯ — ЧАСТИЧНЫЙ',
    `Файлов в списке git: ${c.files}; JSON: ${c.json}, JS/MJS/CJS: ${c.javascript}, PNG: ${c.png}, HTML: ${c.html} (${c.htmlReferences} ссылок), прочие: ${c.other}, ссылки: ${c.symlinks}, недоступно: ${c.missing}.`,
    `Найдено замечаний: ${report.issues.length}. Полная проверка всех игр не выполнена.`, ...report.limitations.map((s) => `• ${s}`)];
  for (const issue of report.issues) lines.push('', `[${issue.code}] ${issue.file}: ${issue.message}`, `Факт: ${issue.observed}`, `Действие: ${issue.action}`);
  return lines.join('\n');
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const report = scanRepository(repoRoot, listRepositoryFiles());
    console.log(process.argv.includes('--human') ? formatRepositoryReport(report) : JSON.stringify(report, null, 2));
    if (report.issues.length) process.exitCode = 1;
  } catch (e) { console.error(`Репозиторий не проверен: ${e.message}`); process.exitCode = 2; }
}
