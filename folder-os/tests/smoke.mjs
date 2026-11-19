#!/usr/bin/env node
/* ============================================================
   Folder OS — смоук-тест (folder-os/tests/smoke.mjs)

   Проверяет, что обещанное в PLAN.md действительно есть:
   калькулятор, блокнот, права доступа, автодополнение по Tab,
   история команд и экспорт/импорт виртуального диска.

   Запуск: node folder-os/tests/smoke.mjs
   ============================================================ */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
let failed = 0;

function ok(cond, msg) {
  if (cond) console.log('  ✓ ' + msg);
  else { console.error('  ✗ ' + msg); failed++; }
}

const html = readFileSync(join(root, 'index.html'), 'utf8');

// --- инлайн-скрипт обязан компилироваться: опечатка в строке ломает всю ОС
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
ok(scripts.length === 1, 'ровно один инлайн-скрипт');
try {
  new vm.Script(scripts[0]);
  ok(true, 'инлайн-скрипт компилируется без ошибок');
} catch (err) {
  ok(false, 'инлайн-скрипт компилируется без ошибок — ' + err.message);
}

// --- приложения из PLAN.md
for (const [id, title] of [['calc', 'Калькулятор'], ['notes', 'Блокнот'], ['access', 'Права доступа']]) {
  ok(scripts[0].includes(`{id:'${id}',title:'${title}'`), `в меню есть приложение «${title}»`);
  ok(scripts[0].includes(`function open${id[0].toUpperCase() + id.slice(1)}(`), `реализована open${id[0].toUpperCase() + id.slice(1)}()`);
  ok(html.includes(`/usr/apps/${id}.app`), `в /usr/apps лежит ${id}.app`);
}

// --- калькулятор: все четыре действия и защита от деления на ноль
ok(/o==='\+'\)return a\+b/.test(scripts[0]), 'калькулятор складывает');
ok(/o==='÷'\)return b===0\?NaN:a\/b/.test(scripts[0]), 'калькулятор не делит на ноль');

// --- блокнот хранит заметки в файловой системе, а не в памяти окна
ok(scripts[0].includes("const dir='/home/user/notes'"), 'заметки блокнота лежат в /home/user/notes');
ok(scripts[0].includes('vfs.write(current,body.value)'), 'блокнот сохраняет через VFS');

// --- права доступа пишутся в файл, а не в переменную
ok(scripts[0].includes("const ACL='/etc/access.json'"), 'права доступа хранятся в /etc/access.json');

// --- терминал: Tab и история команд
ok(scripts[0].includes("e.key==='Tab'"), 'Tab обрабатывается в терминале');
ok(scripts[0].includes('function completeCmd('), 'есть автодополнение путей и команд');
ok(scripts[0].includes("e.key==='ArrowUp'"), 'история команд по стрелке вверх');

// --- диск переносится файлом
ok(html.includes('id="st-export"'), 'есть кнопка «Экспорт диска»');
ok(html.includes('id="st-import"'), 'есть кнопка «Импорт диска»');
ok(scripts[0].includes("app:'folder-os'"), 'в файле диска указано приложение');
ok(/if\(!keys\.length\)\{diskMsg\.textContent='Диск в файле пуст/.test(scripts[0]),
  'пустой файл диска не затирает систему');

// --- давние требования: никаких блокирующих alert в интерфейсе ОС
const alerts = (scripts[0].match(/\balert\s*\(/g) || []).length;
ok(alerts === 0, `в ОС нет блокирующих alert (найдено ${alerts})`);

if (failed) { console.error(`\n✗ Провалено проверок: ${failed}`); process.exit(1); }
console.log('\n✓ Все проверки пройдены');
