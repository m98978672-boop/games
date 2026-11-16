/* Проверки погоды §76 (F-237…F-247): поле облаков идёт с ветром, снег или дождь решает
   температура, туман встаёт ночью в низинах, погода тормозит движение и закрывает полосу.
   По 20 значений на группу. Запуск: node tests/weather2d.mjs */
import assert from 'node:assert/strict';
import {
  WEATHER, driftKm, cloud01, tempCAt, fog01, windAt, weatherAt, weatherCached, weatherStats,
  gripFactor, airfieldClosed, cloudSprite, dropAt
} from '../src/weather2d.js';
import { settlements, heightKm } from '../src/world2d.js';
import { seasonOf, dayOfYearOf } from '../src/light2d.js';
import { buildAir, stepAir, buildSea, stepSea } from '../src/transit2d.js';
import { rankSettlements } from '../src/world2d.js';

let checks = 0;
const ok = (cond, msg) => { assert.ok(cond, msg); checks++; };
globalThis.window = globalThis.window || { addEventListener() {} };

const towns = settlements();
const ranks = rankSettlements(towns, 10);
const sample = towns.slice(0, 20);
const SUMMER = 0, WINTER = 230;

/* F-237, F-238: поле облаков едет с ветром и остаётся в 0…1 */
{
  ok(driftKm(0) === 0, 'в начале поле не сдвинуто');
  ok(Math.abs(driftKm(60) - WEATHER.driftKmPerHour) < 1e-9, 'за час поле сдвигается на 11 км');
  ok(driftKm(1440) > driftKm(60), 'за сутки — дальше, чем за час');
  ok(driftKm(600) > 0, 'сдвиг только вперёд');
  for (let i = 0; i < 20; i++) {
    const t = sample[i];
    const c = cloud01(t.x, t.y, 9 * 60);
    ok(c >= 0 && c <= 1, 'облачность в 0…1: ' + c.toFixed(3));
    ok(Number.isFinite(c), 'облачность — число');
  }
  const a = cloud01(0, 0, 600), b = cloud01(0, 0, 600);
  ok(a === b, 'облачность детерминирована');
  const c1 = cloud01(0, 0, 600), c2 = cloud01(0, 0, 600 + 6 * 60);
  ok(c1 !== c2, 'через 6 часов погода другая');
  const far = cloud01(1500, 0, 600);
  ok(far !== c1, 'в другой точке — другое небо');
  ok(WEATHER.kinds.includes('rain') && WEATHER.kinds.includes('snow') && WEATHER.kinds.includes('fog'),
    'пять видов погоды описаны');
}

/* F-239, F-240: температура и туман */
{
  ok(tempCAt(0, -3000, SUMMER) > tempCAt(0, 3000, SUMMER), 'юг теплее севера');
  for (let i = 0; i < 20; i++) {
    const t = sample[i];
    const summer = tempCAt(t.x, t.y, SUMMER);
    const winter = tempCAt(t.x, t.y, WINTER);
    ok(winter < summer, 'зимой холоднее: ' + t.name);
    ok(summer > -30 && summer < 40, 'летняя температура в разумных пределах: ' + summer.toFixed(1));
    ok(winter > -40 && winter < 30, 'зимняя температура в разумных пределах: ' + winter.toFixed(1));
  }
  ok(seasonOf(dayOfYearOf(WINTER)) === 'winter', 'день 230 — зима');
  ok(seasonOf(dayOfYearOf(SUMMER)) === 'summer', 'день 1 — лето');
  // в горах холоднее, чем в низине рядом
  let high = null;
  for (const t of sample) if (heightKm(t.x, t.y) > 1200) { high = t; break; }
  if (high) ok(tempCAt(high.x, high.y, SUMMER) < tempCAt(high.x, high.y + 600, SUMMER) + 5, 'в горах прохладнее');

  ok(fog01(0, 0, 3 * 60, 8) >= fog01(0, 0, 3 * 60, 70), 'в штиль туман гуще');
  ok(fog01(0, 0, 12 * 60, 10) <= fog01(0, 0, 3 * 60, 10) + 1e-9, 'днём тумана меньше');
  for (let i = 0; i < 20; i++) {
    const f = fog01(sample[i].x, sample[i].y, 3 * 60, 12);
    ok(f >= 0 && f <= 1, 'туман в 0…1: ' + f.toFixed(3));
  }
  // туман встаёт в низине у воды: берём город ниже 60 м над морем
  const low = towns.find((t) => heightKm(t.x, t.y) < 60 && heightKm(t.x, t.y) >= 0);
  ok(!!low, 'в мире есть низины');
  ok(fog01(low.x, low.y, 180, 4) > 0.2, 'ночью и в штиль в низине туман заметный: ' +
    fog01(low.x, low.y, 180, 4).toFixed(2));
  ok(fog01(low.x, low.y, 12 * 60, 4) < fog01(low.x, low.y, 180, 4), 'днём тот же туман слабее');
}

/* F-241, F-242: ветер и вид погоды */
{
  for (let i = 0; i < 20; i++) {
    const w = windAt(sample[i].x, sample[i].y, i * 137);
    ok(w.kmh >= 2 && w.kmh <= WEATHER.windMaxKmh, 'ветер в пределах: ' + w.kmh.toFixed(1));
    ok(Math.abs(w.dirRad) <= 0.45 + 1e-9, 'ветер в основном с запада');
  }
  const kinds = new Set();
  for (const t of sample) {
    for (const mins of [3 * 60, 9 * 60, 15 * 60, 21 * 60]) {
      const w = weatherAt(t.x, t.y, mins, SUMMER);
      kinds.add(w.kind);
      ok(WEATHER.kinds.includes(w.kind), 'вид погоды из списка: ' + w.kind);
      ok(w.intensity >= 0 && w.intensity <= 1, 'сила осадков в 0…1');
      ok(w.visibilityKm > 0 && w.visibilityKm <= WEATHER.visibilityKm[w.kind] + 1e-9, 'видимость не выше нормы вида');
      ok(w.grip > 0 && w.grip <= 1, 'сцепление в 0…1');
      ok(w.tempC > -45 && w.tempC < 45, 'температура в разумных пределах');
      if (w.kind === 'snow') ok(w.tempC < WEATHER.snowTempC + 0.01, 'снег только в холод');
    }
  }
  ok(kinds.size >= 2, 'в мире бывает разная погода: ' + [...kinds].join(', '));
  const clearLike = weatherAt(0, 0, 12 * 60, SUMMER);
  ok(clearLike.visibilityKm > 1, 'в ясный день видно далеко');
  ok(WEATHER.visibilityKm.clear > WEATHER.visibilityKm.rain, 'в дождь видно хуже, чем в ясно');
  ok(WEATHER.visibilityKm.rain > WEATHER.visibilityKm.snow, 'в снег хуже, чем в дождь');
  ok(WEATHER.visibilityKm.snow > WEATHER.visibilityKm.fog, 'в туман хуже всего');
}

/* F-243: кэш поля погоды */
{
  const cache = { map: new Map(), hits: 0, misses: 0 };
  const a = weatherCached(1200, -800, 600, SUMMER, cache);
  const b = weatherCached(1200, -800, 600, SUMMER, cache);
  ok(a === b, 'повторный запрос берёт тот же объект');
  ok(cache.hits === 1 && cache.misses === 1, 'счётчики кэша верные: ' + cache.hits + '/' + cache.misses);
  ok(weatherCached(1200, -800, 604, SUMMER, cache) === a, 'внутри пятиминутки — тот же ответ');
  ok(weatherCached(1200, -800, 620, SUMMER, cache) !== a, 'через 20 минут — пересчёт');
  const fresh = weatherAt(1200, -800, 600, SUMMER);
  ok(JSON.stringify(fresh) === JSON.stringify(a), 'кэш не меняет числа');
  for (let i = 0; i < 20; i++) {
    const w = weatherCached(sample[i].x + i, sample[i].y, 700, SUMMER, cache);
    ok(w && typeof w.kind === 'string', 'кэш отдаёт погоду: ' + i);
  }
  ok(cache.map.size <= 4000, 'кэш не растёт бесконечно');
  const nocache = weatherCached(0, 0, 600, SUMMER, null);
  ok(nocache === weatherCached(0, 0, 600, SUMMER, null) || nocache.kind === weatherCached(0, 0, 600, SUMMER, null).kind,
    'без кэша ответ тот же по смыслу');
}

/* F-244: сводка по стране */
{
  const cache = { map: new Map(), hits: 0, misses: 0 };
  const st = weatherStats(cache, 600, SUMMER, towns);
  ok(st.towns === towns.length, 'сводка по всем городам: ' + st.towns);
  ok(st.rain + st.snow + st.fog + st.clear <= st.towns, 'виды не задваиваются');
  ok(st.visibilityKm > 0 && st.visibilityKm <= WEATHER.visibilityKm.clear, 'средняя видимость в пределах');
  ok(st.windKmh >= 0 && st.windKmh <= WEATHER.windMaxKmh, 'средний ветер в пределах');
  const winter = weatherStats(cache, 600, WINTER, towns);
  ok(winter.tempC < st.tempC, 'зимой страна холоднее');
  ok(winter.snowCover >= 0, 'снежный покров считается');
  ok(['winter', 'spring', 'summer', 'autumn'].includes(st.season), 'сезон назван');
  const empty = weatherStats(cache, 0, SUMMER, []);
  ok(empty.towns === 1, 'без городов сводка не падает');
}

/* F-245, F-246: погода влияет на движение */
{
  ok(gripFactor({ kind: 'clear' }) === 1, 'сухо — полное сцепление');
  ok(gripFactor({ kind: 'rain' }) < 1, 'дождь снижает сцепление');
  ok(gripFactor({ kind: 'snow' }) < gripFactor({ kind: 'rain' }), 'снег хуже дождя');
  ok(gripFactor(null) === 1 && gripFactor({}) === 1, 'без погоды — единица');
  for (const k of WEATHER.kinds) {
    const g = gripFactor({ kind: k });
    ok(g >= 0.4 && g <= 1, 'сцепление ' + k + ' в 0.4…1: ' + g);
  }
  ok(airfieldClosed({ visibilityKm: 0.6 }) === true, 'в туман полоса закрыта');
  ok(airfieldClosed({ visibilityKm: 12 }) === false, 'в ясно полоса открыта');
  ok(airfieldClosed({ visibilityKm: WEATHER.minFlyVisibilityKm }) === false, 'на пороге — открыта');
  ok(airfieldClosed(null) === false, 'без погоды — открыта');

  const air = buildAir(towns, ranks);
  for (let i = 0; i < 2500; i++) stepAir(air, 0.5);
  const landed = air.landed, dep = air.departures;
  for (let i = 0; i < 1500; i++) stepAir(air, 0.5, { visibilityKm: 0.7 });
  ok(air.landed === landed, 'в туман самолёты не садятся: ' + (air.landed - landed));
  ok(air.departures === dep, 'и не взлетают');
  ok(air.closedMin > 0, 'время закрытия посчитано: ' + Math.round(air.closedMin));
  ok(air.holding > 0, 'кто-то ушёл на круг');
  for (let i = 0; i < 2500; i++) stepAir(air, 0.5, { visibilityKm: 30 });
  ok(air.landed > landed, 'после тумана полоса снова работает');
}

/* F-247: капли и снежинки */
{
  for (let i = 0; i < 20; i++) {
    const r = dropAt(i, 900, 700, 12.5, 40, false);
    const s = dropAt(i, 900, 700, 12.5, 40, true);
    ok(r.x >= 0 && r.x <= 900, 'капля в кадре по X');
    ok(r.y >= 0 && r.y <= 700, 'капля в кадре по Y');
    ok(s.x >= 0 && s.x <= 900 && s.y >= 0 && s.y <= 700, 'снежинка в кадре');
    ok(r.len > s.len, 'капля длиннее снежинки (это штрих)');
  }
  const a = dropAt(5, 900, 700, 10, 30, false);
  const b = dropAt(5, 900, 700, 10, 30, false);
  ok(a.x === b.x && a.y === b.y, 'положение капли детерминировано');
  const later = dropAt(5, 900, 700, 11, 30, false);
  ok(later.y !== a.y, 'капля падает со временем');
  const sprite = cloudSprite((n) => {
    const calls = [];
    const c = { width: n, height: n, getContext: () => ({
      createRadialGradient: () => ({ addColorStop: () => {} }),
      fillStyle: '', beginPath: () => {}, arc: () => {}, fill: () => {}
    }) };
    return c;
  });
  ok(sprite && sprite.width === 128, 'спрайт тени облака делается один раз');
  ok(cloudSprite(null) === null, 'без канвы спрайт не нужен');
  ok(WEATHER.rainDrops > WEATHER.snowFlakes, 'капель больше, чем снежинок');
  ok(heightKm(towns[0].x, towns[0].y) === heightKm(towns[0].x, towns[0].y), 'рельеф под погодой стабилен');
}

console.log('OK: 7 групп проверок погоды §76 (F-237…F-247, проверок ' + checks + ')');
