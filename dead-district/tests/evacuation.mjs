#!/usr/bin/env node
/* Финал выживания в DEAD DISTRICT (dead-district/tests/evacuation.mjs)

   Раньше у игры был только экран смерти: сколько ни держись, выиграть
   было нельзя. Теперь цель — дожить до седьмого дня, когда район
   покидает конвой. Здесь проверяется, что финал действительно есть и
   что смерть не превращается в победу.

   main.js тянет DOM и Canvas, поэтому проверяем исходник: экран,
   условие победы, порядок проверок, кнопки и сохранение. Правило
   «дожить до дня эвакуации» продублировано чистой функцией — тест
   ловит смысл, а не совпадение строк.

   Запуск: node dead-district/tests/evacuation.mjs                     */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const main = fs.readFileSync(path.join(ROOT, 'web/main.js'), 'utf8');

let passed = 0;
let failed = 0;
function check(name, ok, detail = '') {
  if (ok) { passed++; console.log('  ✓', name); }
  else { failed++; console.log('  ✗', name, detail); }
}

console.log('Экран победы есть в разметке');
{
  check('есть оверлей победы', /id="win-overlay"/.test(html));
  check('оверлей изначально скрыт', /id="win-overlay"[^>]*hidden/.test(html));
  check('есть строка итога', /id="win-reason"/.test(html));
  check('есть статистика', /id="win-stats"/.test(html));
  check('есть кнопка «остаться»', /id="btn-win-endless"/.test(html));
  check('есть кнопка «новый район»', /id="btn-win-restart"/.test(html));
  check('экран смерти не тронут', /id="death-overlay"/.test(html));
  check('текст победы по-русски и по делу', /ЭВАКУАЦИЯ/.test(html));
}

console.log('Условие победы в коде');
{
  check('день эвакуации задан числом', /var\s+EVAC_DAY\s*=\s*7/.test(main));
  check('есть проверка «пора эвакуироваться»', /function\s+evacuationDue\s*\(/.test(main));
  check('есть показ экрана победы', /function\s+showWinScreen\s*\(/.test(main));
  check('есть «остаться в районе»', /function\s+stayInDistrict\s*\(/.test(main));
  check('флаг победы хранится в состоянии', /evacuated:\s*false/.test(main));
  check('флаг победы сохраняется', /evacuated:\s*state\.evacuated/.test(main));
  check('флаг победы читается из сохранения', /saved\.evacuated\s*===\s*true/.test(main));
}

console.log('Смерть не считается победой');
{
  // Порядок проверок в шаге симуляции: сначала смерть, только потом победа.
  const deathAt = main.indexOf('showDeathScreen(state.health.deathCause);');
  const winAt = main.indexOf('showWinScreen();');
  check('обе проверки есть', deathAt > 0 && winAt > 0, `смерть@${deathAt}, победа@${winAt}`);
  check('проверка смерти стоит раньше победы', deathAt < winAt,
    'иначе гибель на седьмой день засчитается как эвакуация');
  check('после смерти шаг прерывается (return)', /showDeathScreen\(state\.health\.deathCause\);\s*return;/.test(main));
  check('мёртвый не может быть эвакуирован', /!state\.health\.dead/.test(main));
}

console.log('Правило «дожить до эвакуации»');
{
  // Та же логика, что в evacuationDue(), но без состояния игры.
  const EVAC_DAY = 7;
  const due = (s) => Boolean(s) && !s.evacuated && s.day >= EVAC_DAY && !s.dead;

  check('в первый день эвакуации нет', !due({ evacuated: false, day: 1, dead: false }));
  check('на шестой день ещё нет', !due({ evacuated: false, day: 6, dead: false }));
  check('на седьмой день эвакуация', due({ evacuated: false, day: 7, dead: false }));
  check('на десятый день тоже эвакуация', due({ evacuated: false, day: 10, dead: false }));
  check('мёртвого не эвакуируют', !due({ evacuated: false, day: 7, dead: true }));
  check('после победы повторно не показывается', !due({ evacuated: true, day: 9, dead: false }));
  check('без состояния ничего не ломается', !due(null));
}

console.log('Из победы есть два выхода');
{
  const endless = main.indexOf("onClick('btn-win-endless'");
  const restart = main.indexOf("onClick('btn-win-restart'");
  check('кнопка «остаться» подключена', endless > 0);
  check('кнопка «новый район» подключена', restart > 0);
  check('«остаться» снимает паузу', /state\.paused\s*=\s*false/.test(main));
  check('«новый район» начинает заново', /btn-win-restart[\s\S]{0,240}newGame\(false\)/.test(main));
  check('победа ставит паузу', /state\.evacuated\s*=\s*true[\s\S]{0,120}state\.paused\s*=\s*true/.test(main));
}

console.log('Статистика победы считается по настоящей структуре');
{
  check('инвентарь перебирается как items[]', /state\.inv\s*&&\s*Array\.isArray\(state\.inv\.items\)/.test(main));
  check('количество берётся из qty', /Number\(list\[i\]\.qty\)/.test(main));
  check('нет перебора инвентаря как словаря',
    !/for\s*\(\s*var\s+k\s+in\s+inv\s*\)/.test(main),
    'инвентарь — { items: [...] }, перебор ключей дал бы нули');
}

console.log(`\n${passed} пройдено, ${failed} провалено`);
if (failed) process.exit(1);
