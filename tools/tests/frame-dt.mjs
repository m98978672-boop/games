#!/usr/bin/env node
/* ============================================================
   Страж игрового цикла (tools/tests/frame-dt.mjs)

   Почему этот тест существует.

   Игровой цикл почти в каждой игре репозитория выглядит так:

       function frame(now) { const dt = Math.min(0.05, (now - last) / 1000); ... }

   Если браузер отдаст `now` пустым (вкладка была свёрнута, устройство
   проснулось, отметка времени потерялась), выражение становится NaN.
   Дальше происходит самое неприятное: `Math.min` НЕ отсекает NaN, а
   проверка `dt <= 0` для NaN ложна. NaN уходит в аккумулятор времени
   или в физику и остаётся там навсегда — игра замирает или улетает в
   бесконечность, при этом в консоли тишина.

   Тест требует, чтобы в каждом игровом цикле отметка времени проверялась
   на конечность (Number.isFinite) до арифметики.

   Запуск: node tools/tests/frame-dt.mjs
   ============================================================ */
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
let failed = 0;

function ok(cond, msg) {
  if (cond) console.log('  ✓ ' + msg);
  else { console.error('  ✗ ' + msg); failed++; }
}

// Игры с настоящим игровым циклом. Список ведём руками: новые игры
// добавляются сюда вместе с защитой.
const GAMES = [
  ['1in8b/src/main.js', '1 ИЗ 8 МИЛЛИАРДОВ'],
  ['cascade-hydro/src/main.js', 'Каскад ГЭС'],
  ['country-atlas/src/main.js', 'РАТГРАД'],
  ['dead-district/web/main.js', 'DEAD DISTRICT'],
  ['euro-haul/src/main.js', 'Euro Haul (исходник)'],
  ['euro-haul/game.bundle.js', 'Euro Haul (сборка)'],
  ['game-base/src/main.js', 'БАЗА'],
  ['night-taxi/src/main.js', 'Ночное такси (исходник)'],
  ['night-taxi/game.bundle.js', 'Ночное такси (сборка)'],
  ['road-tycoon/src/main.js', 'ТРАССА'],
  ['road-tycoon/src/sim.js', 'ТРАССА (шаг симуляции)'],
  ['truck-haul/src/main.js', 'ДАЛЬНОБОЙ 3D (исходник)'],
  ['truck-haul/game3d.bundle.js', 'ДАЛЬНОБОЙ 3D (сборка)'],
  ['truck-showroom/src/app.js', 'ГАРАЖ 3D (исходник)'],
  ['truck-showroom/showroom.bundle.js', 'ГАРАЖ 3D (сборка)'],
];

console.log('Страж игрового цикла: dt не должен быть NaN\n');

for (const [rel, title] of GAMES) {
  const abs = join(root, rel);
  if (!existsSync(abs)) {
    ok(false, `${title}: файл ${rel} не найден`);
    continue;
  }
  const src = readFileSync(abs, 'utf8');
  // Игра может вообще не считать dt (статичная сцена): тогда проверять нечего.
  const usesDt = /(now|ts|t)\s*-\s*(this\.)?(_?last|lastTime|fm|prev)/.test(src)
    || /\.getDelta\(\)/.test(src)
    || /dt\s*\*\s*\w/.test(src);
  if (!usesDt) {
    console.log('  · ' + `${title}: ${rel} не считает dt — проверка не нужна`);
    continue;
  }
  // Минификатор переписывает `if (!Number.isFinite(x)) ...` в
  // `Number.isFinite(x)||(...)`, поэтому принимаем обе формы.
  const guarded = /Number\.isFinite\(\w+\)\s*\|\|/.test(src)
    || /Number\.isFinite\((now|t|ts|i|_d|raw|dt|_r|stamp)/.test(src);
  ok(guarded, `${title}: ${rel} проверяет отметку времени на конечность`);
}

// Ни один исходник игры не должен считать dt «в лоб».
const BAD = /Math\.min\(\s*0?\.\d+\s*,\s*\(\s*now\s*-\s*\w+\s*\)\s*\/\s*1000\s*\)/;
for (const [rel, title] of GAMES) {
  const abs = join(root, rel);
  if (!existsSync(abs)) continue;
  const src = readFileSync(abs, 'utf8');
  ok(!BAD.test(src), `${title}: нет прямого Math.min(…, (now - last) / 1000) без проверки`);
}

// Урок, ради которого всё делалось: NaN нельзя отсечь сравнением.
console.log('\n  Проверка правила: NaN <= 0 — ложь, поэтому сравнение не спасает');
ok(Math.min(0.05, NaN) !== Math.min(0.05, NaN), 'Math.min(0.05, NaN) даёт NaN');
ok((NaN <= 0) === false, 'NaN <= 0 ложно — проверка dt не срабатывает');
ok(Number.isFinite(NaN) === false, 'Number.isFinite(NaN) — надёжная проверка');

if (failed) { console.error(`\n✗ Провалено проверок: ${failed}`); process.exit(1); }
console.log(`\n✓ Все ${GAMES.length} игровых циклов защищены`);
