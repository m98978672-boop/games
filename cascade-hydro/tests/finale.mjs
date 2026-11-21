// Финал каскада — все государственные вехи пройдены.
// Запуск: node cascade-hydro/tests/finale.mjs
//
// До этой правки последняя веха давала только тост и строчку в панели
// «все гранты получены». Игра продолжалась молча, будто ничего не
// случилось. Теперь есть экран финала с итогами партии.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const dir = path.resolve(import.meta.dirname, '..');

import { WORLD, applyMapScale, MILESTONES } from '../src/config.js';
import { HydroSimulation } from '../src/hydro.js';
import { EconomyAndCities } from '../src/economy.js';

let passed = 0;
let failed = 0;
function check(name, ok, detail = '') {
  if (ok) { passed++; console.log('  ✓', name); }
  else { failed++; console.log('  ✗', name, detail); }
}

console.log('Вехи и финал');
{
  check('вех ровно восемь', MILESTONES.length === 8, String(MILESTONES.length));
  check('последняя веха — флагман', MILESTONES[7].id === 'megacascade_master', MILESTONES[7].id);
  check('у каждой вехи есть награда', MILESTONES.every((m) => m.reward > 0));
  check('у каждой вехи есть проверка', MILESTONES.every((m) => typeof m.check === 'function'));
}

applyMapScale('km5');
const hydro = new HydroSimulation(208, 'bystritsa');
const eco = new EconomyAndCities(hydro);

console.log('Свежая партия');
{
  check('финал ещё не показан', eco.finaleShown === false);
  check('ни одна веха не взята', eco.completedMilestones.size === 0);
  const sum = eco.campaignSummary();
  check('итоги считаются', !!sum);
  check('городов в итогах восемь', sum.totalCities === 8, String(sum.totalCities));
  check('день первый', sum.day === 1, String(sum.day));
  check('вехи в итогах нулевые', sum.milestones === 0);
  check('звание присвоено', ['образцовый', 'надёжный', 'крепкий', 'трудный'].includes(sum.rank), sum.rank);
}

console.log('Финал наступает на последней вехе, а не тише');
{
  const calls = [];
  const eco2 = new EconomyAndCities(hydro, {
    onMilestone: (m) => calls.push(['milestone', m.id]),
    onFinale: (s) => calls.push(['finale', s]),
  });

  // прогоняем вехи по одной, подставляя нужное состояние
  const stage = {};
  hydro.excavatedNormM3 = 2000;   // объём берётся из гидрологии, не из экономики
  eco2.agroIrrigated = true;
  eco2.totalMW = 0;                 // мощность поднимем последней
  Object.assign(eco2, { reinforcedCellCount: 10 });
  eco2.cities.forEach((c) => { c.connected = false; c.population = 40000; });
  hydro.reinforcedCellCount = 10;
  hydro.substations = new Array(3).fill({});
  hydro.navLocks = new Array(2).fill({});
  hydro.fishFarms = new Array(2).fill({});
  eco2.cities.forEach((c) => { c.connected = true; });

  // первая волна вех закрывается при малой мощности
  eco2.totalMW = 0.5 * WORLD.powerScale;   // первый ток: 3.25 МВт при пороге 2.9
  eco2._checkMilestones();
  const firstRound = eco2.completedMilestones.size;
  check('часть вех закрывается сразу', firstRound >= 3, String(firstRound));

  // мощность выше всех порогов закрывает остальные, включая флагманскую
  eco2.cash = 500000;
  eco2.totalMW = 30 * WORLD.powerScale;
  eco2.totalCO2SavedTons = 90000;
  eco2._checkMilestones();

  check('все восемь вех взяты', eco2.completedMilestones.size === 8, String(eco2.completedMilestones.size));
  const finale = calls.find((c) => c[0] === 'finale');
  check('финал вызван', !!finale);
  check('в финал пришли итоги', finale && finale[1] && typeof finale[1].totalMW === 'number');
  check('в итогах все вехи', finale && finale[1].milestones === 8, finale && String(finale[1].milestones));
  check('флаг финала поднят', eco2.finaleShown === true);
  check('финал не повторяется', (() => {
    const before = calls.filter((c) => c[0] === 'finale').length;
    eco2._checkMilestones();
    return calls.filter((c) => c[0] === 'finale').length === before;
  })());
}

console.log('Экран финала');
{
  const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
  check('есть модалка финала', /id="finale-modal"/.test(html));
  check('модалка скрыта по умолчанию', /id="finale-modal" class="modal-backdrop hidden"/.test(html));
  check('есть сетка итогов', /id="finale-grid"/.test(html));
  check('есть вердикт', /id="finale-verdict"/.test(html));
  check('есть кнопка «продолжить»', /data-finale="continue"/.test(html));
  check('есть кнопка «новый бассейн»', /data-finale="restart"/.test(html));

  const css = fs.readFileSync(path.join(dir, 'style.css'), 'utf8');
  check('стиль карточки финала есть', /\.finale-card/.test(css));
  check('сетка адаптивна', /\.finale-grid[\s\S]{0,600}max-width: 640px/.test(css));
  check('есть градиентный заголовок', /\.finale-hero h2[\s\S]{0,300}gradient/.test(css));

  const main = fs.readFileSync(path.join(dir, 'src/main.js'), 'utf8');
  check('игра подписана на финал', /onFinale:\s*\(summary\)\s*=>\s*this\.showFinale\(summary\)/.test(main));
  check('экран умеет показываться', /showFinale\(summary\)\s*\{/.test(main));
  check('итоги попадают в сетку', /finale-grid/.test(main) && /grid\.innerHTML/.test(main));
  check('кнопки обрабатываются', /data-finale/.test(main));
  check('продолжение закрывает экран', /classList\.add\('hidden'\)/.test(main));

  const ecoSrc = fs.readFileSync(path.join(dir, 'src/economy.js'), 'utf8');
  check('финал не зависит от тоста', /onFinale/.test(ecoSrc));
  check('флаг финала в состоянии', /this\.finaleShown\s*=\s*false/.test(ecoSrc));
  check('итоги считаются из состояния', /campaignSummary\(\)\s*\{/.test(ecoSrc));
}

console.log(`\n${passed} пройдено, ${failed} провалено`);
if (failed) process.exit(1);
