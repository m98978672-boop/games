// ============================================================
// RatCore — сборка браузерного бандла из ES-модулей.
// ------------------------------------------------------------
// Зачем: игры репозитория обязаны работать даже с file:// и без
// сборщиков, а RatCore написан как ES-модули (import/export).
// Этот инструмент собирает все 49 модулей в один классический
// скрипт ratcore/ratcore.bundle.js с глобальным объектом
// window.RatCore (и globalThis.RatCore в Node).
//
// Правила трансформации (модули написаны единообразно):
//   1. import { a, b as c } from './x.js'  ->  const { a, b: c } = __import('x.js')
//   2. export function/class/const Name    ->  убирается префикс "export ",
//                                              имя регистрируется в exports
//   3. export { a as b } from './x.js'     ->  exports.b = __import('x.js').a
//   4. Никаких default/star-экспортов в движке нет (проверяется).
//
// Запуск:
//   node ratcore/tools/build-browser-bundle.mjs          # собрать
//   node ratcore/tools/build-browser-bundle.mjs --check   # только проверить актуальность
// ============================================================
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, relative, posix } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ENTRY = 'ratcore.js';
const OUT_FILE = join(ROOT, 'ratcore.bundle.js');

const IMPORT_RE = /^[ \t]*import\s*\{([\s\S]*?)\}\s*from\s*'([^']+)'\s*;?[ \t]*$/gm;
const REEXPORT_RE = /^[ \t]*export\s*\{([\s\S]*?)\}\s*from\s*'([^']+)'\s*;?[ \t]*$/gm;
const EXPORT_DECL_RE = /^[ \t]*export\s+(?=(?:async\s+)?function\b|class\b|const\b|let\b|var\b)/gm;
const FORBIDDEN_RE = [
  [/^\s*export\s+default\b/m, 'export default'],
  [/^\s*export\s*\*\s*from\b/m, 'export * from'],
  [/^\s*import\s+\*\s+as\b/m, 'import * as'],
  [/^\s*import\s+[A-Za-z_$][\w$]*\s*(?:,|from)\b/m, 'default import'],
];

function listModules(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...listModules(full));
    else if (name.endsWith('.js')) out.push(full);
  }
  return out;
}

function moduleId(absPath) {
  return relative(ROOT, absPath).split('\\').join('/');
}

function resolveSpecifier(fromId, spec) {
  if (!spec.startsWith('.')) throw new Error(`Только относительные импорты разрешены: ${spec} (в ${fromId})`);
  const resolved = posix.normalize(posix.join(posix.dirname(fromId), spec));
  if (!existsSync(join(ROOT, resolved))) throw new Error(`Модуль не найден: ${spec} -> ${resolved}`);
  return resolved;
}

function parseSpecifiers(raw) {
  const out = [];
  for (const part of raw.split(',')) {
    const chunk = part.trim();
    if (!chunk) continue;
    const m = chunk.match(/^([A-Za-z_$][\w$]*)(?:\s+as\s+([A-Za-z_$][\w$]*))?$/);
    if (!m) throw new Error(`Не разобрать спецификатор: "${chunk}"`);
    out.push({ imported: m[1], local: m[2] || m[1] });
  }
  return out;
}

/** Разбирает один модуль в { imports, reexports, locals, body }. */
function parseModule(id, source) {
  for (const [re, label] of FORBIDDEN_RE) {
    if (re.test(source)) throw new Error(`Неподдерживаемая конструкция "${label}" в ${id} — допишите правило в сборщик.`);
  }
  const imports = [];
  const reexports = [];
  const locals = new Set();

  let body = source.replace(IMPORT_RE, (_, raw, spec) => {
    imports.push({ spec, names: parseSpecifiers(raw) });
    return '';
  });

  body = body.replace(REEXPORT_RE, (_, raw, spec) => {
    reexports.push({ spec, names: parseSpecifiers(raw) });
    return '';
  });

  body = body.replace(EXPORT_DECL_RE, (m, offset, str) => {
    // читаем имя объявления сразу после "export "
    const rest = str.slice(offset + m.length);
    const nm = rest.match(/^(?:async\s+)?(?:function|class|const|let|var)\s+([A-Za-z_$][\w$]*)/);
    if (!nm) throw new Error(`Не найдено имя экспорта после "export " в ${id}`);
    locals.add(nm[1]);
    return m.replace('export', '').replace(/^\s+/, '');
  });

  // Проверяем, что не осталось необработанных export/import
  if (/^\s*export\s/m.test(body)) {
    const bad = body.split('\n').find((l) => /^\s*export\s/.test(l));
    throw new Error(`Необработанный export в ${id}: ${bad.trim()}`);
  }
  if (/^\s*import\s/m.test(body)) {
    const bad = body.split('\n').find((l) => /^\s*import\s/.test(l));
    throw new Error(`Необработанный import в ${id}: ${bad.trim()}`);
  }

  return { id, imports, reexports, locals: [...locals], body };
}

function buildBundle() {
  const abs = [join(ROOT, ENTRY), ...listModules(join(ROOT, 'src'))];
  const seen = new Set();
  const parsed = [];
  for (const file of abs) {
    const id = moduleId(file);
    if (seen.has(id)) continue;
    seen.add(id);
    parsed.push(parseModule(id, readFileSync(file, 'utf8')));
  }

  // Проверяем, что все импорты разрешаются
  for (const mod of parsed) {
    for (const imp of mod.imports) resolveSpecifier(mod.id, imp.spec);
    for (const re of mod.reexports) resolveSpecifier(mod.id, re.spec);
  }

  const parts = [];
  parts.push(`/*!
 * RatCore v1.0.0 — браузерный бандл (ratcore.bundle.js)
 * ------------------------------------------------------------
 * АВТОМАТИЧЕСКИ СОБРАН из ${parsed.length} ES-модулей папки ratcore/
 * инструментом ratcore/tools/build-browser-bundle.mjs.
 * Руками не редактировать: правьте исходники в ratcore/src/* и
 * пересоберите: node ratcore/tools/build-browser-bundle.mjs
 *
 * Работает классическим <script src> (без type="module"), поэтому
 * подключается из любой игры репозитория даже с file://.
 * После загрузки доступен window.RatCore (createEngine, tools, версия).
 */`);

  parts.push(`(function (global) {
  'use strict';
  var __modules = Object.create(null);
  var __cache = Object.create(null);
  function __define(id, factory) { __modules[id] = factory; }
  function __import(id) {
    var cached = __cache[id];
    if (cached) return cached.exports;
    if (!__modules[id]) throw new Error('RatCore bundle: модуль не найден — ' + id);
    var module = { exports: {} };
    __cache[id] = module;
    __modules[id](module.exports, __import);
    return module.exports;
  }`);

  for (const mod of parsed) {
    const head = [];
    for (const imp of mod.imports) {
      const target = resolveSpecifier(mod.id, imp.spec);
      const pattern = imp.names.map((n) => (n.imported === n.local ? n.imported : `${n.imported}: ${n.local}`)).join(', ');
      head.push(`    var { ${pattern} } = __import(${JSON.stringify(target)});`);
    }
    const tail = [];
    for (const name of mod.locals) tail.push(`    exports[${JSON.stringify(name)}] = ${name};`);
    for (const re of mod.reexports) {
      const target = resolveSpecifier(mod.id, re.spec);
      for (const n of re.names) {
        tail.push(`    exports[${JSON.stringify(n.local)}] = __import(${JSON.stringify(target)})[${JSON.stringify(n.imported)}];`);
      }
    }
    parts.push(`
  __define(${JSON.stringify(mod.id)}, function (exports, __import) {
${head.join('\n')}
${mod.body.trim()}
${tail.join('\n')}
  });`);
  }

  parts.push(`
  var namespace = __import(${JSON.stringify(ENTRY)});
  var api = {
    VERSION: namespace.RATCORE_VERSION || '1.0.0',
    BUNDLE: 'ratcore.bundle.js',
    MODULE_COUNT: ${parsed.length},
    createEngine: namespace.createEngine,
    namespace: namespace,
  };
  // Пробрасываем прямые экспорты движка на верхний уровень
  for (var key in namespace) {
    if (!Object.prototype.hasOwnProperty.call(api, key)) api[key] = namespace[key];
  }
  global.RatCore = api;
  if (global.document && typeof global.document.dispatchEvent === 'function' && typeof global.CustomEvent === 'function') {
    try { global.document.dispatchEvent(new global.CustomEvent('ratcore:ready', { detail: { version: api.VERSION, modules: api.MODULE_COUNT } })); } catch (err) { void err; }
  }
})(typeof window !== 'undefined' ? window : globalThis);
`);

  return { code: parts.join('\n'), moduleCount: parsed.length };
}

const { code, moduleCount } = buildBundle();

if (process.argv.includes('--check')) {
  if (!existsSync(OUT_FILE)) {
    console.error('✗ ratcore/ratcore.bundle.js отсутствует — запустите: node ratcore/tools/build-browser-bundle.mjs');
    process.exit(1);
  }
  const current = readFileSync(OUT_FILE, 'utf8');
  if (current !== code) {
    console.error('✗ ratcore.bundle.js устарел: исходники ratcore/ изменились. Пересоберите бандл.');
    process.exit(1);
  }
  console.log(`✓ ratcore.bundle.js актуален (${moduleCount} модулей, ${(code.length / 1024).toFixed(0)} КБ, sha256 ${createHash('sha256').update(code).digest('hex').slice(0, 12)}).`);
} else {
  writeFileSync(OUT_FILE, code, 'utf8');
  console.log(`✓ Собран ratcore/ratcore.bundle.js: ${moduleCount} модулей, ${(code.length / 1024).toFixed(0)} КБ, sha256 ${createHash('sha256').update(code).digest('hex').slice(0, 12)}.`);
}
