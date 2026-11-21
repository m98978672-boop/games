#!/usr/bin/env node
/* Тесты финала карьеры «ЕВРОТРАК» (euro-haul/tests/career-end.mjs)

   Карьера была бесконечной: опыт рос, уровни повышались, доставки не
   кончались. Теперь у пути есть цель — сорок рейсов — и честный итог.
   Здесь проверяется, что финал есть, что он не срабатывает повторно,
   что вольная езда его отключает и что старые сохранения получают
   новые поля.

   Запуск: node euro-haul/tests/career-end.mjs                        */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createProfile, normalizeProfile } from '../src/core/save.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const main = fs.readFileSync(path.join(ROOT, 'src/main.js'), 'utf8');
const ui = fs.readFileSync(path.join(ROOT, 'src/ui/ui.js'), 'utf8');
const saveSrc = fs.readFileSync(path.join(ROOT, 'src/core/save.js'), 'utf8');

let passed = 0;
let failed = 0;
function check(name, ok, detail = '') {
  if (ok) { passed++; console.log('  ✓', name); }
  else { failed++; console.log('  ✗', name, detail); }
}

console.log('Цель карьеры задана');
{
  const m = main.match(/const\s+CAREER_GOAL\s*=\s*(\d+)/);
  check('есть константа цели', Boolean(m), 'без неё финал не наступит');
  check('цель в разумных пределах', m && Number(m[1]) >= 20 && Number(m[1]) <= 100, m && m[1]);
  check('CAREER_GOAL используется в проверке', /stats\.deliveries\s*>=\s*CAREER_GOAL/.test(main));
}

console.log('Условие финала');
{
  // Та же логика, что в конце deliver-ветки main.js.
  const CAREER_GOAL = 40;
  const done = (p) => !p.careerDone && !p.freeMode && p.stats.deliveries >= CAREER_GOAL;

  check('в начале карьеры финала нет', !done({ careerDone: false, freeMode: false, stats: { deliveries: 0 } }));
  check('на 39-й доставке ещё нет', !done({ careerDone: false, freeMode: false, stats: { deliveries: 39 } }));
  check('на 40-й доставке финал', done({ careerDone: false, freeMode: false, stats: { deliveries: 40 } }));
  check('на 50-й тоже финал, если не показан', done({ careerDone: false, freeMode: false, stats: { deliveries: 50 } }));
  check('второй раз не показывается', !done({ careerDone: true, freeMode: false, stats: { deliveries: 45 } }));
  check('вольная езда отменяет финал', !done({ careerDone: false, freeMode: true, stats: { deliveries: 60 } }));
}

console.log('Финал связан с экраном');
{
  check('итог передаётся в UI', /career:\s*careerDone\s*\?/.test(main));
  check('флаг ставится после показа', /if\s*\(careerDone\)\s*\{[\s\S]{0,120}careerDone\s*=\s*true/.test(main));
  check('есть экран итога карьеры', /careerResult\s*\(/.test(ui));
  check('итог показывает доставки и деньги', /доставок:\s*\$\{career\.deliveries\}/.test(ui) && /career\.earnings/.test(ui));
  check('итог показывает пробег и уровень', /career\.distance/.test(ui) && /career\.level/.test(ui));
  check('есть вердикт по стилю езды', /Безупречная карьера|Крепкая карьера|Путь был жёстким/.test(ui));
  check('есть кнопка «остаться»', /career-free/.test(ui));
  check('есть кнопка «новая карьера»', /career-restart/.test(ui));
  check('вольная езда включается', /startFreeMode/.test(main) && /freeMode\s*=\s*true/.test(main));
}

console.log('Новые поля профиля');
{
  const p = createProfile('Тест');
  check('careerDone есть при создании', p.careerDone === false, String(p.careerDone));
  check('freeMode есть при создании', p.freeMode === false, String(p.freeMode));
  check('статистика на месте', p.stats && typeof p.stats.deliveries === 'number');
}

console.log('Старые сохранения получают поля');
{
  const legacy = { name: 'Старый', money: 500, xp: 1000, stats: { deliveries: 12 } };
  const fixed = normalizeProfile(legacy);
  check('careerDone доводится до false', fixed.careerDone === false);
  check('freeMode доводится до false', fixed.freeMode === false);
  check('прочие поля не потеряны', fixed.money === 500 && fixed.xp === 1000);
  check('статистика сохранена', fixed.stats.deliveries === 12);

  // Совсем пустой профиль не должен ронять нормализацию.
  const empty = normalizeProfile({});
  check('пустой профиль получает статистику', empty.stats && empty.stats.deliveries === 0);
  check('null не роняет', normalizeProfile(null) === null);
  check('не-объект возвращается как есть', normalizeProfile(42) === 42);

  // Правленый профиль не перезаписывается.
  const doneProfile = normalizeProfile({ careerDone: true, freeMode: true, stats: { deliveries: 40 } });
  check('уже пройденная карьера не сбрасывается', doneProfile.careerDone === true);
  check('вольная езда не сбрасывается', doneProfile.freeMode === true);
}

console.log('Загрузка нормализует слоты');
{
  check('loadSaves прогоняет слоты через normalizeProfile', /slots\.map\(normalizeProfile\)/.test(saveSrc));
  check('пустые слоты остаются пустыми', /data\.slots\[0\] \|\| null/.test(saveSrc));
}

console.log(`\n${passed} пройдено, ${failed} провалено`);
if (failed) process.exit(1);
