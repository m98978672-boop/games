// Смоук-тест «СЕВЕРНОГО УЗЛА»: структура, локальные ресурсы, синтаксис, HUD, движок.
// Запуск: node warehouse-crew/tests/smoke.mjs
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
let failed = 0;
function ok(cond, msg) {
  console.log((cond ? '  ✓ ' : '  ✗ ') + msg);
  if (!cond) failed += 1;
}

console.log('СЕВЕРНЫЙ УЗЕЛ — смоук-тест');

// 1. Обязательные файлы игры
const files = ['index.html', 'style.css', 'cover.svg', 'README.md', 'PLAN.md', 'TEMPLATE.md',
  'src/config.js', 'src/util.js', 'src/save.js', 'src/audio.js', 'src/game.js', 'src/render.js',
  'src/ui.js', 'src/main.js', 'src/ai/brain-net.js', 'src/sim/model.js', 'src/sim/warehouse.js',
  'src/sim/worker.js', 'src/render/meshes.js', 'src/render/world.js', 'src/render/bodyview.js',
  'training/train-brain.mjs', 'data/brain_weights.json', 'data/brain_dataset.json', 'data/brain-data.js',
  'data/brain_training_log.json', 'data/brains/marta.json', 'data/brains/grisha.json',
  'data/brains/timur.json'];
for (const f of files) ok(existsSync(join(root, f)), 'есть файл ' + f);

// 2. index.html: локальные ресурсы, без CDN
const html = readFileSync(join(root, 'index.html'), 'utf8');
ok(html.includes('lang="ru"'), 'lang="ru"');
ok(!/https?:\/\/(?!localhost)[^"' ]+\.(js|css)/i.test(html), 'нет внешних JS/CSS (CDN запрещён)');
for (const m of html.matchAll(/(?:src|href)="([^"#]+?)"/g)) {
  const p = m[1];
  if (p.startsWith('data:') || p.startsWith('http')) continue;
  ok(existsSync(join(root, p)), 'index.html -> ' + p + ' существует');
}
ok(html.includes('../shared/engine.js'), 'подключён общий движок ../shared/engine.js');
ok(html.includes('../ratcore/ratcore.bundle.js'), 'подключён RatCore');
ok(html.includes('../shooter/three.min.js'), 'подключён локальный Three.js');
ok(html.indexOf('shared/engine.js') < html.indexOf('src/main.js'), 'движок подключён до игровых скриптов');

// 2б. Контракт движка: GamesEngine.create() отдаёт «держатель» (holder), а не промис.
// Обратный код ронял игру на телефоне: «GE.create(...).then is not a function».
const gameSrc = readFileSync(join(root, 'src/game.js'), 'utf8');
ok(!/GamesEngine\s*\.\s*create\s*\([^;]*?\)\s*\.\s*then/.test(gameSrc), 'GamesEngine.create() не используется как промис');
ok(/\.promise|onReady/.test(gameSrc), 'bootEngine ждёт holder.promise / onReady');

// 3. style.css наследует общую тему
const css = readFileSync(join(root, 'style.css'), 'utf8');
ok(/^@import url\("\.\.\/shared\/theme\.css"\);/.test(css.trimStart()), 'style.css начинается с @import ../shared/theme.css');

// 4. Синтаксис всех скриптов
const jsFiles = [];
(function walk(dir) {
  for (const entry of readdirSync(join(root, dir), { withFileTypes: true })) {
    if (entry.name === 'node_modules') continue;
    const rel = dir + '/' + entry.name;
    if (entry.isDirectory()) walk(rel);
    else if (/\.(js|mjs)$/.test(entry.name)) jsFiles.push(rel);
  }
})('src');
for (const extra of ['training/train-brain.mjs', 'tests/smoke.mjs']) jsFiles.push(extra);
for (const f of jsFiles) {
  try { execFileSync(process.execPath, ['--check', join(root, f)], { stdio: 'pipe' }); ok(true, 'синтаксис ' + f); }
  catch (e) { ok(false, 'синтаксис ' + f + ': ' + String(e.stderr).split('\n')[0]); }
}

// 5. HUD-скелет из shared/theme.css
for (const cls of ['topbar', 'brand', 'top-stats', 'top-actions', 'panel side', 'bottom-bar', 'pause-flag', 'toasts', 'modal-root', 'save-indicator']) {
  ok(html.includes(cls), 'в index.html есть .' + cls.split(' ')[0]);
}

// 6. Пульт управления: личные и бригадные приказы + переключатель вида
for (const cmd of ['pick', 'store', 'rest', 'wait', 'auto', 'help']) {
  ok(html.includes('data-command="' + cmd + '"'), 'приказ рабочему: ' + cmd);
}
for (const team of ['intake', 'store', 'rest', 'auto']) {
  ok(html.includes('data-team="' + team + '"'), 'приказ бригаде: ' + team);
}
ok(html.includes('data-view="third"') && html.includes('data-view="top"'), 'оба режима камеры на пульте');
for (const speed of ['1', '2', '4']) ok(html.includes('data-speed="' + speed + '"'), 'скорость ×' + speed);

// 7. Мозги «в коде» — чтобы игра шла и без fetch (file://, архив)
const inlineSrc = readFileSync(join(root, 'data/brain-data.js'), 'utf8');
ok(inlineSrc.includes('window.WC_BRAINS'), 'data/brain-data.js объявляет window.WC_BRAINS');
ok(html.indexOf('data/brain-data.js') > 0, 'index.html подключает data/brain-data.js');
ok(html.indexOf('data/brain-data.js') < html.indexOf('src/game.js'), 'мозги подключены до игрового ядра');
const bundle = JSON.parse(inlineSrc.slice(inlineSrc.indexOf('{'), inlineSrc.lastIndexOf('}') + 1));
ok(bundle.base && bundle.base.architecture && bundle.base.architecture.join('-') === '18-24-16-6', 'в brain-data.js базовая сеть 18-24-16-6');
ok(Object.keys(bundle.brains || {}).length === 3, 'в brain-data.js три личных мозга');
const jsonBase = JSON.parse(readFileSync(join(root, 'data/brain_weights.json'), 'utf8'));
ok(JSON.stringify(bundle.base.layers) === JSON.stringify(jsonBase.layers), 'brain-data.js совпадает с data/brain_weights.json (нужен пересбор: node tools/embed-brains.mjs)');

// 8. Мозг и данные
const weights = JSON.parse(readFileSync(join(root, 'data/brain_weights.json'), 'utf8'));
ok(weights.architecture && weights.architecture.join('-') === '18-24-16-6', 'сеть 18-24-16-6');
ok(weights.layers && weights.layers.length === 3, 'три весовых слоя');
const params = weights.layers.reduce((n, l) => n + l.w.length + l.b.length, 0);
ok(params === 958, '958 параметров (нашли ' + params + ')');

const dataset = JSON.parse(readFileSync(join(root, 'data/brain_dataset.json'), 'utf8'));
const rows = (dataset.episodes || []).reduce((a, e) => a + (e.rows || []).length, 0);
ok(rows >= 200, 'датасет: ' + rows + ' наблюдений');

const log = JSON.parse(readFileSync(join(root, 'data/brain_training_log.json'), 'utf8'));
ok(log.architecture && log.architecture.join('-') === '18-24-16-6', 'в логе обучения та же архитектура');
ok(log.base && Number.isFinite(log.base.fitness), 'в логе есть фитнес обученной модели');

// 9. Модели через RatCore: в рендере нет ручной геометрии (Барьер 4)
const meshesSrc = readFileSync(join(root, 'src/render/meshes.js'), 'utf8');
ok(!/new THREE\.(BufferGeometry|BoxGeometry|SphereGeometry|CylinderGeometry)/.test(meshesSrc), 'в meshes.js нет запрещённых конструкторов геометрии');
ok(meshesSrc.includes('fromRecipe'), 'модели строятся через tools.build.fromRecipe');
ok(meshesSrc.includes('exportMesh'), 'меш забирается через tools.bridge.exportMesh');
// Логика (симуляция, мозг, игра) должна быть детерминированной — ГПСЧ только из ядра
const logicSrc = jsFiles
  .filter((f) => f.startsWith('src/sim/') || f.startsWith('src/ai/') || f === 'src/game.js')
  .map((f) => readFileSync(join(root, f), 'utf8')).join('\n');
ok(!/Math\.random\(/.test(logicSrc.replace(/\/\/.*$/gm, '')), 'в логике нет Math.random (ГПСЧ из ядра)');
const allSrc = jsFiles.map((f) => readFileSync(join(root, f), 'utf8')).join('\n');
ok(!/getContext\(['"]2d['"]\)/.test(allSrc), 'нет 2D-канваса (Барьер 4)');

// 10. Скриншоты
for (const shot of ['stage-third.png', 'stage-top.png', 'stage-body.png', 'rig-lineup.png']) {
  ok(existsSync(join(root, 'screenshots', shot)), 'есть скриншот screenshots/' + shot);
}

if (failed) {
  console.error('\n✗ Провалено проверок: ' + failed);
  process.exit(1);
}
console.log('\n✓ Все проверки пройдены');
