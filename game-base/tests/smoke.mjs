// БАЗА — смоук-тест: проверяет, что игра собрана правильно.
// Запуск: node tests/smoke.mjs
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
let failed = 0;

function ok(cond, msg) {
  if (cond) console.log('  ✓ ' + msg);
  else { console.error('  ✗ ' + msg); failed++; }
}

console.log('БАЗА — смоук-тест');

// 1. Обязательные файлы игры (структура как у всех игр репозитория)
const files = ['index.html', 'style.css', 'cover.svg', 'README.md', 'PLAN.md', 'TEMPLATE.md',
  'src/config.js', 'src/util.js', 'src/save.js', 'src/audio.js', 'src/game.js', 'src/render.js', 'src/ui.js', 'src/main.js'];
for (const f of files) ok(existsSync(join(root, f)), 'есть файл ' + f);
ok(existsSync(join(root, '../shared/theme.css')), 'есть общая тема ../shared/theme.css');

// 2. index.html ссылается только на существующие ресурсы
const html = readFileSync(join(root, 'index.html'), 'utf8');
ok(html.includes('lang="ru"'), 'lang="ru"');
for (const m of html.matchAll(/(?:src|href)="([^"#]+?)"/g)) {
  const p = m[1];
  if (p.startsWith('data:') || p.startsWith('http')) continue;
  ok(existsSync(join(root, p)), 'index.html -> ' + p + ' существует');
}

// 3. style.css подключает единый дизайн первой строкой
const css = readFileSync(join(root, 'style.css'), 'utf8');
ok(/^@import url\("\.\.\/shared\/theme\.css"\);/.test(css.trimStart()), 'style.css начинает с @import ../shared/theme.css');

// 4. Все скрипты парсятся (синтаксис)
for (const f of files.filter((f) => f.endsWith('.js'))) {
  try { execFileSync(process.execPath, ['--check', join(root, f)], { stdio: 'pipe' }); ok(true, 'синтаксис ' + f); }
  catch (e) { ok(false, 'синтаксис ' + f + ': ' + e.stderr); }
}

// 5. HUD-скелет на месте (общие классы из shared/theme.css)
for (const cls of ['topbar', 'brand', 'top-stats', 'top-actions', 'panel side', 'bottom-bar', 'pause-flag', 'toasts', 'modal-root', 'save-indicator']) {
  ok(html.includes(cls), 'в index.html есть .' + cls.split(' ')[0]);
}

if (failed) { console.error(`\n✗ Провалено проверок: ${failed}`); process.exit(1); }
console.log('\n✓ Все проверки пройдены');
