// 1 ИЗ 8 МИЛЛИАРДОВ — смоук-тест: проверяет, что игра собрана правильно.
// Запуск: node 1in8b/tests/smoke.mjs
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

console.log('1 ИЗ 8 МИЛЛИАРДОВ — смоук-тест');

// 1. Обязательные файлы
const files = ['index.html', 'style.css', 'cover.svg', 'README.md', 'PLAN.md', 'LICENSE.md',
  'src/algo.js', 'src/countries.js', 'src/names.js', 'src/model.js', 'src/events.js', 'src/work.js',
  'src/pay.js', 'src/mechanics.js', 'src/variations.js',
  'src/engine.js', 'src/purchases.js', 'src/invest.js', 'src/charts.js',
  'src/textures.js', 'src/models.js', 'src/portrait.js',
  'src/save.js', 'src/sound.js', 'src/ui.js', 'src/main.js', 'tests/bot.mjs'];
for (const f of files) ok(existsSync(join(root, f)), 'есть файл ' + f);
ok(existsSync(join(root, '../shared/theme.css')), 'есть общая тема ../shared/theme.css');

// 2. index.html ссылается только на существующие локальные ресурсы
const html = readFileSync(join(root, 'index.html'), 'utf8');
ok(html.includes('lang="ru"'), 'lang="ru"');
ok(/<meta name="viewport"/.test(html), 'есть meta viewport (телефоны)');
for (const m of html.matchAll(/(?:src|href)="([^"#]+?)"/g)) {
  const p = m[1];
  if (p.startsWith('data:') || p.startsWith('http') || p.startsWith('mailto:')) continue;
  ok(existsSync(join(root, p)), 'index.html -> ' + p + ' существует');
}
ok(!/https?:\/\/(?!www\.w3\.org)/.test(html.replace(/<!--[\s\S]*?-->/g, '')), 'в index.html нет внешних CDN-ссылок');

// 3. Единый дизайн подключён первой строкой
const css = readFileSync(join(root, 'style.css'), 'utf8');
ok(/^@import url\("\.\.\/shared\/theme\.css"\);/.test(css.trimStart()), 'style.css начинается с @import ../shared/theme.css');

// 3б. Сотни: алгоритмы, виды заработка, механики, вариации — ровно по сто
const hundreds = [
  ['src/algo.js', /A\.count = /, 'алгоритмы'],
  ['src/pay.js', /count: PAYS\.length/, 'виды заработка'],
  ['src/mechanics.js', /count: MECH\.length/, 'механики'],
  ['src/variations.js', /count: VARS\.length/, 'вариации'],
  ['src/textures.js', /count: TEX\.length/, 'текстуры'],
  ['src/models.js', /count: MODELS\.length/, 'модельки'],
];
for (const [f, re, name] of hundreds) {
  ok(re.test(readFileSync(join(root, f), 'utf8')), f + ' ведёт счёт: ' + name);
}

// 4. Все скрипты парсятся
for (const f of files.filter((f) => f.endsWith('.js') || f.endsWith('.mjs'))) {
  try { execFileSync(process.execPath, ['--check', join(root, f)], { stdio: 'pipe' }); ok(true, 'синтаксис ' + f); }
  catch (e) { ok(false, 'синтаксис ' + f + ': ' + e.stderr); }
}

// 5. Общий каркас интерфейса (классы из shared/theme.css)
for (const cls of ['topbar', 'brand', 'top-stats', 'panel', 'toasts', 'modal-root', 'btn-primary']) {
  ok(html.includes(cls), 'в index.html есть .' + cls);
}

// 6. Ключевые узлы интерфейса игры
for (const id of ['screen-start', 'screen-life', 'screen-end', 'btn-born', 'stat-bars', 'budget-list',
  'focus-list', 'log-list', 'peers-list', 'life-map', 'hud-age', 'btn-pause', 'btn-skip', 'end-map',
  'portrait', 'end-portrait', 'btn-spend', 'btn-spend-2', 'btn-invest', 'btn-invest-2', 'btn-things',
  'invest-note', 'money-capital', 'btn-anims', 'portrait-clip']) {
  ok(html.includes('id="' + id + '"'), 'в index.html есть #' + id);
}

// 6б. Порядок подключения скриптов: модули идут после тех, от кого зависят
const order = [...html.matchAll(/<script src="src\/([a-z]+)\.js"><\/script>/g)].map((m) => m[1]);
ok(order.join(',') === 'algo,countries,names,model,events,work,pay,mechanics,variations,engine,purchases,invest,' +
  'charts,textures,models,portrait,save,sound,ui,main',
  'скрипты подключены в правильном порядке: ' + order.join(' → '));

// 7. Обложка — валидный SVG 1440×810
const svg = readFileSync(join(root, 'cover.svg'), 'utf8');
ok(svg.trimStart().startsWith('<svg'), 'cover.svg начинается с <svg');
ok(/viewBox="0 0 1440 810"/.test(svg), 'cover.svg имеет viewBox 1440×810');
ok(/role="img"/.test(svg) && /aria-label=/.test(svg), 'cover.svg описан для скринридеров');

// 8. Запись в каталоге сообщества
const cat = JSON.parse(readFileSync(join(root, '../site/community-games.json'), 'utf8'));
const entry = cat.games.find((g) => g.id === '1in8b');
ok(!!entry, 'игра есть в site/community-games.json');
if (entry) {
  ok(entry.cover === '../1in8b/cover.svg', 'в каталоге верный путь к обложке');
  ok(entry.play === '../1in8b/index.html', 'в каталоге верный путь к игре');
  ok(entry.readme === '../1in8b/README.md', 'в каталоге верный путь к README');
  ok(Array.isArray(entry.features) && entry.features.length <= 4, 'не больше 4 пунктов features');
}

if (failed) { console.error(`\n✗ Провалено проверок: ${failed}`); process.exit(1); }
console.log('\n✓ Все проверки пройдены');
