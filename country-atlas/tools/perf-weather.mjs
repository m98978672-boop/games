/* Замер §76: погода спрашивается каждый кадр для каждого города и для каждой клетки облаков.
   Считаем, сколько стоит без кэша и с кэшем, и проверяем, что числа те же.
   Запуск: node tools/perf-weather.mjs */
import { settlements } from '../src/world2d.js';
import { weatherAt, weatherCached, cloud01, WEATHER } from '../src/weather2d.js';

globalThis.window = globalThis.window || { addEventListener() {} };
const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
const towns = settlements().slice(0, 40);

/* 1. поле погоды: 40 городов на кадр */
{
  const N = 300;
  let t0 = now();
  let cold = 0, ref = null;
  for (let k = 0; k < N; k++) {
    for (const t of towns) ref = weatherAt(t.x, t.y, 600 + k, 0), cold++;
  }
  const withoutCache = (now() - t0) / N;

  const cache = { map: new Map(), hits: 0, misses: 0 };
  t0 = now();
  let warm = null;
  for (let k = 0; k < N; k++) {
    for (const t of towns) warm = weatherCached(t.x, t.y, 600 + k, 0, cache);
  }
  const withCache = (now() - t0) / N;
  const same = JSON.stringify(ref) === JSON.stringify(weatherAt(towns[towns.length - 1].x, towns[towns.length - 1].y, 600 + N - 1, 0));
  console.log('погода в 40 городах: без кэша ' + withoutCache.toFixed(2) + ' мс, с кэшем ' +
    withCache.toFixed(3) + ' мс, ускорение ' + (withoutCache / Math.max(1e-6, withCache)).toFixed(1) + '×');
  console.log('последний город, кэш и свежий расчёт совпали: ' + (same ? 'да' : 'НЕТ'));
  if (!same) process.exitCode = 1;
}

/* 2. облака на кадр: сетка тени */
{
  const cols = 9, rows = 7;
  const step = WEATHER.cellKm * 0.55;
  const N = 400;
  const t0 = now();
  let sum = 0;
  for (let k = 0; k < N; k++) {
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) sum += cloud01(i * step, j * step, 600 + k);
  }
  const ms = (now() - t0) / N;
  console.log('облака ' + cols + '×' + rows + ': ' + ms.toFixed(3) + ' мс на кадр (сумма ' + sum.toFixed(0) + ')');
  if (!(ms < 1.5)) { console.error('облака дороже 1.5 мс — это уже заметно'); process.exitCode = 1; }
}
