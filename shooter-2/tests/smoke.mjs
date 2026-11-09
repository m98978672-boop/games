/* =============================================================================
   СЕКТОР «ПЕПЕЛ» — автотесты структуры и офлайн-запуска
   Запуск: node shooter-2/tests/smoke.mjs
   Проверяет файлы, подключения, отсутствие внешних CDN и целостность HTML.
   ============================================================================= */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repo = path.resolve(root, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(root, p));

const requiredFiles = [
  'index.html', 'style.css', 'three.min.js',
  'src/data.js', 'src/outline.js', 'src/gunblueprints.js', 'src/soldier.js', 'src/level.js',
  'src/model.js', 'src/anim.js', 'src/ik.js', 'src/ragdoll.js', 'src/world.js',
  'src/ai.js', 'src/agent.js', 'src/fx.js', 'src/viewmodel.js', 'src/audio.js',
  'src/perf.js', 'src/gamebot.js', 'src/game.js', 'src/ui.js', 'src/bugcodes.js'
];
for (const f of requiredFiles) assert.ok(exists(f), `нет файла ${f}`);

const html = read('index.html');
for (const f of requiredFiles.filter((f) => f.endsWith('.js'))) {
  assert.ok(html.includes(`src="${f}"`), `index.html должен подключать ${f}`);
}
assert.ok(html.includes('href="style.css"'), 'index.html должен подключать style.css');
assert.ok(html.includes('id="game"'), 'нужен canvas #game');
assert.ok(html.includes('id="lab-canvas"'), 'нужна лаборатория анимаций');
assert.ok(html.includes('id="scr-menu"') && html.includes('id="scr-brief"'), 'нужны экраны меню и брифа');
assert.ok(html.includes('id="scr-death"') && html.includes('id="scr-win"'), 'нужны экраны смерти и победы');
assert.ok(!/https?:\/\/(?!github)/.test(html.replace(/https:\/\/github\.com[^\s"]*/g, '')), 'внешних CDN быть не должно');
assert.ok(!html.includes('type="module"'), 'классические скрипты: работает и с file://');

// офлайн: никаких сетевых загрузок в коде игры
for (const f of requiredFiles.filter((f) => f.startsWith('src/'))) {
  const code = read(f);
  assert.ok(!/fetch\(|XMLHttpRequest|new Worker\(|import\s+\(/.test(code), `${f}: только офлайн, без сети`);
  assert.ok(!/https?:\/\/[a-z0-9.-]+\//i.test(code.replace(/github\.com|w3\.org/g, '')), `${f}: без внешних URL`);
}

// контуры: оружие и тело строятся по обведённым точкам, а не из кубов
const gunSrc = read('src/gunblueprints.js');
const soldierSrc = read('src/soldier.js');
const levelSrc = read('src/level.js');
const outlineSrc = read('src/outline.js');
const viewSrc = read('src/viewmodel.js');
assert.ok(!/BoxGeometry|CylinderGeometry/.test(viewSrc), 'viewmodel: руки по лофту, без примитивов');
assert.match(viewSrc, /loftSections/, 'viewmodel: предплечья и кулаки лофтом');
for (const [name, src] of [['gunblueprints', gunSrc], ['soldier', soldierSrc], ['level', levelSrc]]) {
  assert.ok(!/new\s+(THREE|T)\(\)\.BoxGeometry/.test(src) && !/BoxGeometry/.test(src),
    `${name}: без BoxGeometry — только контуры, лофт и тела вращения`);
}
assert.match(outlineSrc, /ExtrudeGeometry/, 'контур выдавливается в объём');
assert.match(outlineSrc, /function loftSections/, 'есть лофт по сечениям');
assert.match(outlineSrc, /LatheGeometry/, 'есть тела вращения');
assert.ok((gunSrc.match(/kind: 'outline'/g) || []).length >= 20, 'у стволов много обведённых контуров');
assert.match(soldierSrc, /loft\(/, 'тело строится лофтом по сечениям');
assert.match(levelSrc, /extrudePlan/, 'карта строится выдавливанием полигонов в плане');

// README и обложка
assert.ok(exists('README.md'), 'нужен README.md');
assert.ok(exists('cover.svg'), 'нужна cover.svg');
const readme = read('README.md');
assert.match(readme, /1760/, 'README должен указывать общее число клипов');
assert.match(readme, /22 части/, 'README должен указывать число частей');

// каталог сайта: игра добавлена в витрину
const catalog = JSON.parse(fs.readFileSync(path.join(repo, 'site/community-games.json'), 'utf8'));
const entry = catalog.games.find((g) => g.id === 'shooter-2');
assert.ok(entry, 'игра должна быть в каталоге site/community-games.json');
assert.equal(entry.play, '../shooter-2/index.html');
assert.equal(entry.cover, '../shooter-2/cover.svg');
assert.equal(entry.readme, '../shooter-2/README.md');
assert.ok(entry.features.length <= 4, 'не больше четырёх фич в каталоге');
for (const [key, rel] of [['cover', entry.cover], ['play', entry.play], ['readme', entry.readme]]) {
  assert.ok(fs.existsSync(path.join(repo, 'site', rel)), `каталог ${key} указывает на существующий файл`);
}

// размер: игра должна оставаться лёгкой
const total = requiredFiles.reduce((s, f) => s + fs.statSync(path.join(root, f)).size, 0);
assert.ok(total < 3_500_000, `размер игры слишком велик: ${total}`);
console.log(`shooter-2: структура в порядке (${requiredFiles.length} файлов, ${(total / 1024).toFixed(0)} КБ без three.min.js).`);
