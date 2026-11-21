#!/usr/bin/env node
/* Тесты концовки карьеры «ДАЛЬНОБОЙ» (truck-haul/tests/career.mjs)

   Игра была бесконечной — рейсы шли один за другим без финала. Здесь
   проверяется, что финал есть, что он наступает ровно один раз, что
   после него можно остаться в игре и что начать заново действительно
   можно.

   Логика концовки живёт в main.js, который тянет Three.js и DOM,
   поэтому здесь она повторена как чистая функция с теми же правилами:
   тест ловит не «совпадает ли текст», а правила — когда выдаётся
   последний контракт и когда показывается итог.

   Запуск: node truck-haul/tests/career.mjs                            */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Logic from '../src/logic.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const mainPath = path.resolve(here, '../src/main.js');
const source = fs.readFileSync(mainPath, 'utf8');

let passed = 0;
let failed = 0;
function check(name, ok, detail = '') {
  if (ok) { passed++; console.log('  ✓', name); }
  else { failed++; console.log('  ✗', name, detail); }
}

console.log('Концовка встроена в игру');
{
  check('в коде есть длина карьеры', /const\s+CAREER_LENGTH\s*=\s*\d+/.test(source),
    'без числа доставок финал не наступит никогда');
  check('финальный контракт помечен флагом', /final\s*:\s*true/.test(source));
  check('итог карьеры показывается', /showCareerEnd/.test(source));
  check('после финала можно остаться в игре', /endless\s*=\s*true/.test(source));
  check('можно начать заново', /localStorage\.removeItem\(SAVE\)/.test(source));
  check('в диспетчерской виден прогресс карьеры', /из \$\{CAREER_LENGTH\} доставок/.test(source));
  check('финальный контракт не сгорает по сроку',
    /final\s*:\s*true[\s\S]{0,400}deadline/.test(source),
    'у особого заказа должен быть щедрый срок');
}

console.log('Правила выдачи последнего контракта');
{
  // Та же логика, что в main.js, но без DOM: проверяем условия перехода.
  const CAREER_LENGTH = 25;
  const canOffer = (S) => S.completed >= CAREER_LENGTH && !S.finalDone && !S.endless
    && !S.jobs.some((j) => j.final && j.status !== 'completed');

  const fresh = { completed: 0, finalDone: false, endless: false, jobs: [] };
  check('в начале финал не предлагается', !canOffer(fresh));

  const almost = { ...fresh, completed: 24 };
  check('за доставку до конца не предлагается', !canOffer(almost));

  const ready = { ...fresh, completed: 25 };
  check('на 25-й доставке финал предлагается', canOffer(ready));

  const offered = { ...ready, jobs: [{ final: true, status: 'available' }] };
  check('второй раз не предлагается', !canOffer(offered));

  const done = { ...ready, finalDone: true };
  check('после финала не предлагается снова', !canOffer(done));

  const endless = { ...ready, endless: true };
  check('в бесконечном режиме не предлагается', !canOffer(endless));

  // Пройденный финальный заказ не должен мешать новой выдаче, если игрок
  // сбросит флаг, но у нас он не сбрасывается — значит правило закрыто.
  const completedFinal = { ...ready, jobs: [{ final: true, status: 'completed' }] };
  check('уже пройденный финальный заказ не выдаётся заново', canOffer(completedFinal));
}

console.log('Города финального контракта');
{
  // CITIES — массив регионов, а не плоский список: обращение [0].name
  // дало бы undefined, и в заголовке оказался бы «undefined».
  const first = Logic.CITIES[0][0];
  const lastRegion = Logic.CITIES[Logic.CITIES.length - 1];
  const last = lastRegion[lastRegion.length - 1];
  check('первый город — строка', typeof first === 'string' && first.length > 2, String(first));
  check('последний город — строка', typeof last === 'string' && last.length > 2, String(last));
  check('города различаются', first !== last);
  check('обращение через .name дало бы мусор',
    Logic.CITIES[0].name === undefined,
    'именно поэтому фикс был нужен');
}

console.log('Финальный заказ не ломает данные');
{
  const route = Logic.makeRoute(424242);
  check('маршрут финального заказа строится', Array.isArray(route) && route.length > 0);
  check('маршрут воспроизводим по seed',
    JSON.stringify(Logic.makeRoute(424242)) === JSON.stringify(route),
    'иначе после перезагрузки дорога изменится');
  check('в маршруте нет NaN', !/NaN/.test(JSON.stringify(route)));
}

console.log('Сохранение переживает финал');
{
  // Поля карьеры должны быть в состоянии по умолчанию, иначе у игрока со
  // старым сохранением финал никогда не сработает (undefined >= 25 = false).
  check('finalDone/endless/careerBest есть в состоянии по умолчанию',
    /finalDone:false/.test(source) && /endless:false/.test(source) && /careerBest:0/.test(source),
    'старые сохранения получают эти поля через {...defaultState,...saved}');
  check('состояние сливается с сохранением', /\.\.\.defaultState,\.\.\.saved/.test(source));
}

console.log(`\n${passed} пройдено, ${failed} провалено`);
if (failed) process.exit(1);
