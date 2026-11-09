/* Обход репозитория: какие тут проекты и какие в них файлы.
   Ничего не исполняет — только читает каталоги. */

import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative, extname, basename } from 'node:path';

/* каталоги, в которые заходить бессмысленно или опасно */
export const SKIP_DIRS = new Set([
  '.git', 'node_modules', 'dist', 'build', 'out', 'coverage', '.cache', '.venv',
  '__pycache__', '.next', '.turbo', '.playwright-cli', 'Unselected files',
]);

/* расширения, которые бот умеет читать как текст */
const TEXT_EXT = new Set(['.js', '.mjs', '.cjs', '.json', '.html', '.htm', '.css', '.md',
  '.svg', '.txt', '.yml', '.yaml', '.gd', '.tscn', '.cfg']);

export function isTextFile(path) {
  return TEXT_EXT.has(extname(path).toLowerCase());
}

/* все файлы репозитория, кроме пропущенных каталогов */
export function walk(root, dir = root, out = []) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    if (e.name.startsWith('.') && e.name !== '.github') continue;
    if (SKIP_DIRS.has(e.name)) continue;
    const full = join(dir, e.name);
    if (e.isDirectory()) walk(root, full, out);
    else if (e.isFile()) out.push(relative(root, full));
  }
  return out;
}

/* Проект — это папка первого уровня со своим index.html, src/ или tests/.
   Корневые файлы репозитория собираются в псевдопроект «корень». */
export function projects(root, files) {
  const byDir = new Map();
  for (const f of files) {
    const top = f.includes('/') ? f.slice(0, f.indexOf('/')) : '.';
    if (!byDir.has(top)) byDir.set(top, []);
    byDir.get(top).push(f);
  }
  const list = [];
  for (const [name, fs] of byDir) {
    if (name === '.github') continue;
    const has = (suffix) => fs.some((f) => f.endsWith(suffix));
    const kind = name === '.' ? 'корень'
      : has('/index.html') || fs.some((f) => f.startsWith(name + '/src/')) ? 'игра'
        : fs.some((f) => f.startsWith(name + '/tests/')) ? 'проект' : 'папка';
    list.push({
      name,
      kind,
      dir: name === '.' ? root : join(root, name),
      files: fs,
      js: fs.filter((f) => /\.(js|mjs|cjs)$/.test(f)),
      html: fs.filter((f) => /\.html?$/.test(f)),
      css: fs.filter((f) => f.endsWith('.css')),
      json: fs.filter((f) => f.endsWith('.json')),
      md: fs.filter((f) => f.endsWith('.md')),
      tests: fs.filter((f) => /\/tests\/[^/]+\.mjs$/.test(f) || /\/(test|tests)\.mjs$/.test(f)),
      hasPackage: fs.includes(name + '/package.json'),
      hasNodeModules: existsSync(join(root, name, 'node_modules')),
    });
  }
  return list.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
}

export function read(root, file) {
  try { return readFileSync(join(root, file), 'utf8'); } catch { return null; }
}

export function sizeOf(root, file) {
  try { return statSync(join(root, file)).size; } catch { return 0; }
}

export function fileName(path) { return basename(path); }

/* номер строки по индексу символа — чтобы находку можно было открыть в редакторе */
export function lineAt(text, index) {
  let line = 1;
  for (let i = 0; i < index && i < text.length; i++) if (text.charCodeAt(i) === 10) line++;
  return line;
}

/* Вырезать из кода строковые литералы, шаблоны, регулярки и комментарии,
   заменив их пробелами. Длина текста сохраняется, поэтому номера строк
   и позиции остаются верными. */
/* стоит ли на этом месте регулярное выражение, а не деление */
function isRegexStart(src, i) {
  for (let k = i - 1; k >= 0; k--) {
    const ch = src[k];
    if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') continue;
    if ('(,=:[!&|?{};+-*%~^<>'.includes(ch)) return true;
    const word = src.slice(Math.max(0, k - 9), k + 1);
    return /\b(return|typeof|case|in|of|new|delete|void|do|else|yield|await)$/.test(word);
  }
  return true;
}

export function stripCode(src) {
  const out = src.split('');
  const n = src.length;
  let i = 0;
  const blank = (from, to) => {
    for (let k = from; k < to && k < n; k++) if (out[k] !== '\n') out[k] = ' ';
  };
  while (i < n) {
    const c = src[i], c2 = src[i + 1];
    /* комментарии */
    if (c === '/' && c2 === '/') { const e = src.indexOf('\n', i); blank(i, e < 0 ? n : e); i = e < 0 ? n : e; continue; }
    if (c === '/' && c2 === '*') { const e = src.indexOf('*/', i + 2); blank(i, e < 0 ? n : e + 2); i = e < 0 ? n : e + 2; continue; }
    /* регулярные выражения */
    if (c === '/' && isRegexStart(src, i)) {
      let j = i + 1, cls = false, ok = false;
      while (j < n) {
        const ch = src[j];
        if (ch === '\\') { j += 2; continue; }
        if (ch === '\n') break;
        if (ch === '[') cls = true;
        else if (ch === ']') cls = false;
        else if (ch === '/' && !cls) { ok = true; break; }
        j++;
      }
      if (ok) { blank(i, j + 1); i = j + 1; continue; }
    }
    /* обычные строки: в JS они не переходят на новую строку без \ в конце */
    if (c === '"' || c === "'") {
      let j = i + 1, closed = false;
      while (j < n) {
        const ch = src[j];
        if (ch === '\\') { j += 2; continue; }
        if (ch === '\n') break;
        if (ch === c) { closed = true; break; }
        j++;
      }
      if (closed) { blank(i, j + 1); i = j + 1; continue; }
      i++; continue;                       /* одинокая кавычка — не строка */
    }
    /* шаблоны: с учётом вложенных ${ } */
    if (c === '`') {
      let j = i + 1, depth = 0, closed = false;
      while (j < n) {
        const ch = src[j];
        if (ch === '\\') { j += 2; continue; }
        if (ch === '$' && src[j + 1] === '{') { depth++; j += 2; continue; }
        if (ch === '}' && depth > 0) { depth--; j++; continue; }
        if (ch === '`' && depth === 0) { closed = true; break; }
        j++;
      }
      blank(i, closed ? j + 1 : n);
      i = closed ? j + 1 : n;
      continue;
    }
    i++;
  }
  return out.join('');
}

