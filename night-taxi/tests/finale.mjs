#!/usr/bin/env node
/* Тесты финала «НОЧНОГО ТАКСИ» (night-taxi/tests/finale.mjs)

   Пять сюжетных заказов раньше шли по кругу: смена никогда не
   заканчивалась, и «конца» у игры не было. Эти тесты проверяют, что
   финал есть, что он показывается один раз и что из него можно выйти
   двумя путями — бесконечная ночь или новая смена.

   Запуск: node night-taxi/tests/finale.mjs                            */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const mainPath = path.resolve(here, '../src/main.js');
const source = fs.readFileSync(mainPath, 'utf8');

let passed = 0;
let failed = 0;
function check(name, ok, detail = '') {
  if (ok) { passed++; console.log('  ✓', name); }
  else { failed++; console.log('  ✗', name, detail); }
}

console.log('Финал есть в коде');
{
  check('сценарий финала объявлен', /function\s+showFinale\s*\(/.test(source));
  check('финал вызывается после последней истории', /showFinale\(\)/.test(source));
  check('финал показывается один раз', /finaleSeen/.test(source));
  check('в итоге есть число поездок', /ПОЕЗДОК ВСЕГО/.test(source));
  check('в итоге есть деньги', /ЗАРАБОТАНО ЗА НОЧЬ/.test(source));
  check('в итоге есть рейтинг', /РЕЙТИНГ/.test(source));
  check('есть вердикт по итогу ночи', /Идеальная ночь|Спокойная ночь|Нервная ночь|Тяжёлая ночь/.test(source));
  check('можно остаться в бесконечной ночи', /БЕСКОНЕЧНАЯ НОЧЬ/.test(source));
  check('можно начать новую смену', /НОВАЯ СМЕНА/.test(source));
  check('в журнале виден прогресс истории', /историй \$\{Math\.min\(s\.journal\.length,jobs\.length\)\} из \$\{jobs\.length\}/.test(source));
}

console.log('Правила: когда наступает финал');
{
  const JOBS = 5;
  // Повторяем ветку из main.js: после завершения заказа order++ и проверка.
  function afterTrip(state) {
    const s = { ...state, order: state.order + 1 };
    // Порядок как в игре: бесконечность проверяется раньше финала.
    if (s.order >= JOBS && s.endless) {
      s.order = 0;
      s.shift += 1;
      s.shiftTrips = 0;
      s.shiftIncome = 0;
      s.journal = [];
      return { event: 'endless-turn', s };
    }
    if (s.order >= JOBS && !s.storyDone) {
      s.storyDone = true;
      return { event: 'finale', s };
    }
    return { event: 'trip', s };
  }

  let st = { order: 0, storyDone: false, endless: false, shift: 1, shiftTrips: 0, shiftIncome: 0, journal: [] };
  const events = [];
  for (let i = 0; i < 5; i++) {
    const r = afterTrip(st);
    events.push(r.event);
    st = r.s;
  }
  check('первые четыре поездки — обычные', events.slice(0, 4).every((e) => e === 'trip'), events.join(','));
  check('пятая поездка приводит к финалу', events[4] === 'finale', events.join(','));

  const again = afterTrip(st);
  check('после финала финал не повторяется', again.event === 'trip', again.event);

  // Бесконечный режим: счётчик сбрасывается, смена растёт.
  let end = { order: 4, storyDone: false, endless: true, shift: 2, shiftTrips: 3, shiftIncome: 900, journal: ['a'] };
  end = afterTrip(end).s;
  check('в бесконечной ночи счётчик историй сбрасывается', end.order === 0, String(end.order));
  check('в бесконечной ночи смена растёт', end.shift === 3, String(end.shift));
  check('в бесконечной ночи журнал очищается', end.journal.length === 0);

  // Обычный путь: финал срабатывает раньше ветки endless, storyDone снят кнопкой.
  let fresh = { order: 4, storyDone: false, endless: false, shift: 1 };
  fresh = afterTrip(fresh).s;
  check('финал срабатывает даже если игрок потом уйдёт в бесконечность', fresh.storyDone === true);
}

console.log('Сохранение');
{
  check('новые поля есть в состоянии по умолчанию',
    /storyDone:false/.test(source) && /endless:false/.test(source) && /finaleSeen:false/.test(source),
    'старое сохранение без этих полей получит их через {...defaults,...saved}');
  check('состояние сливается с сохранением', /\.\.\.defaults,\.\.\.saved/.test(source));
  check('после финала игру можно продолжить', /s\.endless=true/.test(source));
}

console.log('Сюжетные заказы не потерялись');
{
  check('заказов ровно пять',
    (source.match(/story:'/g) || []).length === 5,
    String((source.match(/story:'/g) || []).length));
  check('у каждого есть имя и оплата',
    (source.match(/name:'[^']+'.*?pay:\d+/g) || []).length >= 5,
    String((source.match(/name:'[^']+'.*?pay:\d+/g) || []).length));
}

console.log(`\n${passed} пройдено, ${failed} провалено`);
if (failed) process.exit(1);
