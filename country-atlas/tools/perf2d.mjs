/* Замер §98: что дали кэши и сколько стоит автономная жизнь. Ничего не меняет в картинке:
   рядом с каждой строкой проверяется, что кэшированный результат побайтово тот же.
   Запуск: node tools/perf2d.mjs */
import { settlements, rankSettlements } from '../src/world2d.js';
import { buildCity } from '../src/city2d.js';
import { buildPedestrians, advancePeds, pedPositions } from '../src/ped2d.js';
import { buildPlay, stepPlay, playStats } from '../src/play2d.js';
import { buildGrowth, growthStats, applyGrowth } from '../src/growth2d.js';
import { buildMayors, advanceMayors } from '../src/ai2d.js';
import { catchUp } from '../src/offline2d.js';

globalThis.window = globalThis.window || { addEventListener() {} };
const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
const fmt = (v) => (v >= 1 ? v.toFixed(2) : v.toFixed(4)).padStart(9) + ' мкс';
const rows = [];

const towns = settlements();
const ranks = rankSettlements(towns, 10);
const city = buildCity(towns[0], 0, ranks);
const pack = buildPedestrians(city, 0);
advancePeds(pack, 0.5);

/* пешеходы: позиции нужны и слою, и социальным силам */
{
  pedPositions(pack);                                  // прогрев
  const N = 2000;
  let t0 = now();
  for (let i = 0; i < N; i++) { pedPositions(pack); pedPositions(pack); pedPositions(pack); }
  const cached = ((now() - t0) / N) * 1000 / 3;        // микросекунды на кадр (три вызова)
  t0 = now();
  let coldList = null;
  for (let i = 0; i < N; i++) {
    pack.posCache = null; pedPositions(pack);
    pack.posCache = null; pedPositions(pack);
    pack.posCache = null; coldList = pedPositions(pack);
  }
  const cold = ((now() - t0) / N) * 1000 / 3;
  const same = JSON.stringify(coldList) === JSON.stringify(pedPositions(pack));
  rows.push(['позиции пешеходов (' + pack.peds.length + ' чел.)', cached, cold, same]);
}

/* полигон: статистика спрашивается дважды за кадр (панель и HUD) */
{
  const play = buildPlay(424242);
  stepPlay(play, 0.5);
  const N = 200000;
  let t0 = now();
  for (let i = 0; i < N; i++) playStats(play);
  const cached = (now() - t0) / N;                      // микросекунды на вызов
  t0 = now();
  let coldList = null;
  for (let i = 0; i < N; i++) { play.statsCache = null; coldList = playStats(play); }
  const cold = (now() - t0) / N;
  play.statsCache = null;
  const same = JSON.stringify(coldList) === JSON.stringify(playStats(play));
  rows.push(['статистика полигона (12 машин)', cached, cold, same]);
}

/* сводка стройки */
{
  const g = buildGrowth(towns[0], city);
  for (let i = 0; i < 60; i++) applyGrowth(g, i % 3 ? 'housing' : 'park', i, i);
  const N = 3000;
  let t0 = now();
  for (let i = 0; i < N; i++) { growthStats(g, 30); growthStats(g, 30); growthStats(g, 30); }
  const cached = ((now() - t0) / N) * 1000 / 3;
  t0 = now();
  let last = null;
  for (let i = 0; i < N; i++) {
    g.statsCache = null; growthStats(g, 30);
    g.statsCache = null; growthStats(g, 30);
    g.statsCache = null; last = growthStats(g, 30);
  }
  const cold = ((now() - t0) / N) * 1000 / 3;
  const same = JSON.stringify(last) === JSON.stringify(growthStats(g, 30));
  rows.push(['сводка стройки города', cached, cold, same]);
}

/* автономная жизнь: 14 дней без кадров */
{
  const transport = { minutes: 10 * 1440 };
  const economy = { days: 0 };
  const mayors = buildMayors(towns, ranks);
  const journal = [];
  const growths = new Map();
  const state = {
    transport, economy,
    advanceEconomy: (e, d) => { e.days += d; },
    mayors, journal, advanceMayors,
    applyGrowth: (index, action) => {
      if (!growths.has(index)) growths.set(index, buildGrowth(towns[index], null, 1 + (index % 5) * 0.4));
      return applyGrowth(growths.get(index), action, index, 10);
    }
  };
  const t0 = now();
  const rep = catchUp(state, 14);
  const ms = now() - t0;
  console.log('\nавтономная жизнь: 14 дней за ' + ms.toFixed(1) + ' мс — решений ' + rep.decisions +
    ', домов ' + rep.houses + ', парков ' + rep.parks + ', общественных ' + rep.civic +
    ', городов ' + growths.size);
}

console.log('\n' + 'слой'.padEnd(34) + 'кэш'.padStart(11) + 'без кэша'.padStart(11) + '  одинаково');
for (const [name, cached, cold, same] of rows) {
  console.log(name.padEnd(34) + fmt(cached) + fmt(cold) + '  ' + (same ? 'да' : 'НЕТ'));
}
const gain = rows.map(([, a, b]) => (a > 1e-4 ? b / a : 0));
console.log('ускорение: ' + gain.map((g) => (g > 0 ? g.toFixed(0) + '×' : 'сразу')).join(' · '));
if (rows.some(([, , , same]) => !same)) {
  console.error('кэш изменил результат — так нельзя');
  process.exitCode = 1;
}
