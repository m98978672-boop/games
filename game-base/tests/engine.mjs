// ============================================================
// Движок RatCore — проверка, что он подключён ВЕЗДЕ.
// Запуск: node game-base/tests/engine.mjs
//
// Проверяет:
//   1. Бандл движка собран из исходников и не устарел.
//   2. Бандл исполняется и отдаёт рабочий движок (createEngine/tools).
//   3. Мост shared/engine.js работает без документа (rng + clock).
//   4. Каждый раздел из shared/engine-registry.json реально подключает
//      движок, порядок тегов правильный, а версия на странице — из ядра.
//   5. Новые разделы с index.html не остаются без движка (реестр полон).
// ============================================================
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
let failed = 0;
function ok(cond, msg) {
  if (cond) console.log('  ✓ ' + msg);
  else { console.error('  ✗ ' + msg); failed++; }
}
const read = (p) => readFileSync(join(ROOT, p), 'utf8');

console.log('ДВИЖОК RatCore — сквозная проверка подключения');

// ---------------------------------------------------------------- 1. Бандл
const bundlePath = 'ratcore/ratcore.bundle.js';
ok(existsSync(join(ROOT, bundlePath)), 'есть собранный бандл ' + bundlePath);
try {
  execFileSync(process.execPath, ['ratcore/tools/build-browser-bundle.mjs', '--check'], { cwd: ROOT, stdio: 'pipe' });
  ok(true, 'бандл актуален: собран из всех ES-модулей движка');
} catch (err) {
  ok(false, 'бандл устарел — пересоберите: node ratcore/tools/build-browser-bundle.mjs');
}

// ---------------------------------------------------------------- 2. Исполнение
const sandbox = {
  console, performance, TextEncoder, TextDecoder, setTimeout, clearTimeout,
  Uint8Array, Float32Array, Int32Array, Uint16Array, Uint32Array, Int16Array, Int8Array,
  Uint8ClampedArray, Float64Array, ArrayBuffer, DataView, navigator: { hardwareConcurrency: 4 },
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
vm.runInContext(read(bundlePath), sandbox, { filename: bundlePath });
const RC = sandbox.RatCore;
ok(Boolean(RC && typeof RC.createEngine === 'function'), 'бандл объявляет window.RatCore.createEngine');
ok(RC && RC.VERSION === '1.0.0', 'версия ядра — 1.0.0');
ok(RC && RC.MODULE_COUNT >= 48, 'в бандл собрано ' + (RC && RC.MODULE_COUNT) + ' модулей (≥ 48)');
ok(Boolean(RC && typeof RC.createRng === 'function' && typeof RC.createClock === 'function'), 'ядро отдаёт createRng и createClock');

if (RC && typeof RC.createEngine === 'function') {
  const engine = RC.createEngine({ preset: 'survival', packs: ['pack:studio'], seed: 2026, viewport: { width: 64, height: 36 } });
  const tower = engine.tools.build.fromRecipe({
    modelId: 'tower',
    ops: [{ tool: 'build.primitive', args: { shape: 'box', w: 2, h: 3, d: 2, color: '#e8b45a' } }],
  });
  ok(tower.ok === true, 'tools.build.fromRecipe строит меш через ToolGuard');
  const placed = engine.tools.build.placeEntity({ id: 'tower_1', mesh: tower.data, x: 0, y: 0, h: 1 });
  ok(placed.ok === true, 'tools.build.placeEntity ставит сущность в мир');
  const snap = engine.tools.watch.snapshot({ label: 'engine-test' });
  ok(snap.ok === true && snap.data.entities.length === 1, 'tools.watch.snapshot видит 1 сущность');
  const wire = engine.tools.save.exportWire2();
  ok(wire.ok === true && wire.data.wireBytes > 0, 'tools.save.exportWire2 отдаёт ratcore-wire/2 поток');
  const audit = engine.tools.watch.auditLog();
  ok(audit.ok === true, 'tools.watch.auditLog доступен (журнал ToolGuard)');
  ok(engine.getProfile().packs.includes('pack:studio'), 'опциональные пакеты включаются по требованию');
}

// ---------------------------------------------------------------- 3. Мост
const bridgeSandbox = { console, performance, setTimeout, clearTimeout, Promise, URL, TextEncoder, TextDecoder, navigator: { hardwareConcurrency: 4 } };
bridgeSandbox.window = bridgeSandbox;
bridgeSandbox.globalThis = bridgeSandbox;
vm.createContext(bridgeSandbox);
vm.runInContext(read('shared/engine.js'), bridgeSandbox, { filename: 'shared/engine.js' });
const GE = bridgeSandbox.GamesEngine;
ok(Boolean(GE), 'shared/engine.js объявляет window.GamesEngine');
ok(Boolean(GE && typeof GE.rng === 'function' && typeof GE.clock === 'function' && typeof GE.badge === 'function'), 'мост отдаёт rng/clock/badge');
if (GE) {
  const rand = GE.rng(1234);
  const values = [rand.next(), rand.next(), rand.next()];
  const core = RC.createRng(1234);
  const expected = [core.next(), core.next(), core.next()];
  ok(JSON.stringify(values) === JSON.stringify(expected), 'ГПСЧ моста совпадает с ядром бит-в-бит (сиды и сохранения целы)');
  const clock = GE.clock({ tickHz: 30 });
  let steps = 0;
  const res = clock.advance(0.1, () => { steps++; });
  ok(res.steps > 0 && steps === res.steps, 'часы моста дают фиксированный шаг симуляции');
}

// ---------------------------------------------------------------- 4. Реестр разделов
const registry = JSON.parse(read('shared/engine-registry.json'));
ok(Array.isArray(registry.sections) && registry.sections.length >= 20, 'в реестре ' + registry.sections.length + ' разделов');

for (const section of registry.sections) {
  const file = section.path;
  if (!existsSync(join(ROOT, file))) { ok(false, `${section.id}: файл ${file} не найден`); continue; }
  const html = read(file);
  const engineTag = `<script src="${section.engine}"`;
  ok(html.includes(engineTag), `${section.id}: подключает движок (${section.engine})`);
  ok(html.includes('shared/engine-bootstrap.js'), `${section.id}: подключает engine-bootstrap.js`);

  if (html.includes(engineTag) && section.kind === 'game') {
    const enginePos = html.indexOf(engineTag);
    const firstGameScript = html.search(/<script (?:type="module" )?src="(?:src\/|game\.bundle|bundle\.js|game3d\.bundle|showroom\.bundle)/);
    ok(firstGameScript === -1 || enginePos < firstGameScript, `${section.id}: движок подключён ДО игровых скриптов`);
  }

  ok(html.includes('data-engine-badge'), `${section.id}: есть место под плашку движка в HUD`);
}

// ---------------------------------------------------------------- 5. Полнота покрытия
const excluded = new Set((registry.excluded || []).map((e) => e.path));
const registered = new Set(registry.sections.map((s) => s.path));
const htmlFiles = [];
for (const entry of readdirSync(ROOT)) {
  if (entry.startsWith('.') || ['node_modules', 'tools', 'docs', 'site'].includes(entry)) continue;
  const full = join(ROOT, entry);
  if (!statSync(full).isDirectory()) continue;
  const candidate = join(full, 'index.html');
  if (existsSync(candidate)) htmlFiles.push(entry + '/index.html');
}
const missing = htmlFiles.filter((f) => !excluded.has(f) && !registered.has(f));
ok(missing.length === 0, 'нет разделов без движка' + (missing.length ? ': ' + missing.join(', ') : ' (' + htmlFiles.length + ' разделов проверено)'));

for (const section of registry.sections) {
  const html = read(section.path);
  if (section.kind === 'portal' || section.kind === 'department') {
    ok(html.includes('data-engine-version') || html.includes('data-engine-badge'),
      `${section.id}: версия движка берётся из ядра ([data-engine-version] или плашка)`);
  }
  ok(html.includes('data-engine-badge') || html.includes('data-engine-version'),
    `${section.id}: движок виден пользователю (плашка или версия в футере)`);
}

// ---------------------------------------------------------------- 6. Движок вместо копий ГПСЧ
for (const file of registry.engineCore || []) {
  if (!existsSync(join(ROOT, file))) { ok(false, `ядро: файл ${file} не найден`); continue; }
  const src = read(file);
  ok(/RatCore/.test(src) && /createRng/.test(src), `${file}: берёт ГПСЧ из ядра RatCore`);
}

// ---------------------------------------------------------------- 7. Изоляция движка сохранена
const siteHtml = read('site/index.html');
ok(!/ratcore\/src\//.test(siteHtml), 'витрина не тянет внутренние модули движка напрямую (только бандл)');

if (failed) {
  console.error(`\n✗ Провалено проверок: ${failed}`);
  process.exit(1);
}
console.log('\n✓ Движок подключён везде: витрина, новости, мессенджер, портал разработчиков и все игры.');
