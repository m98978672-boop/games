/* Проверки §14 (2D): время суток, сезоны и огни. Пять групп по 20 значений. */
import assert from 'node:assert/strict';
import {
  PHASE, LATITUDE, DAY_MINUTES, SEASON_DAYS, START_DAY_OF_YEAR, dayOfYearOf, hourWithPhase,
  declinationDeg, sunAltitudeDeg, phaseAt, artificialLight, lightAt,
  seasonOf, snowCover01, clockText, overlayCss, cityLights
} from '../src/light2d.js';

const near = (a, b, eps = 1e-9) => Math.abs(a - b) <= eps;

/* F-157: высота солнца — симметрична относительно полудня, максимум в 12:00, ночью ниже нуля */
{
  let n = 0;
  for (let i = 0; i < 20; i++) {
    const hour = i * 1.2;                        // 0…22.8
    const m = hour * 60;
    const alt = sunAltitudeDeg(m, 172);
    assert.ok(alt >= -90 && alt <= 90, 'высота в −90…90°: ' + alt.toFixed(1));
    // симметрия: 12:00 ± час даёт ту же высоту
    if (Math.abs(hour - 12) < 11.9) {
      const sym = sunAltitudeDeg((24 - hour) * 60, 172);
      assert.ok(Math.abs(alt - sym) < 0.5, 'симметрия вокруг полудня при ' + hour.toFixed(1) + ' ч');
    }
    n++;
  }
  assert.equal(n, 20, 'двадцать значений высоты солнца');
  assert.ok(sunAltitudeDeg(720, 172) > sunAltitudeDeg(600, 172), 'в полдень выше, чем в 10:00');
  assert.ok(sunAltitudeDeg(720, 172) < 90 - LATITUDE + 23.5 + 1, 'полдень не выше зенита');
  assert.ok(sunAltitudeDeg(60, 172) < 0, 'в час ночи солнце под горизонтом');
}

/* F-158: склонение по дню года: летом +23.4°, зимой −23.4° */
{
  const summer = declinationDeg(172), winter = declinationDeg(352);
  assert.ok(summer > 20 && summer < 24, 'июньское склонение: ' + summer.toFixed(2));
  assert.ok(winter < -20 && winter > -24, 'декабрьское склонение: ' + winter.toFixed(2));
  let n = 0;
  for (let i = 0; i < 20; i++) {
    const d = i * 18;
    const dec = declinationDeg(d);
    assert.ok(dec >= -23.5 && dec <= 23.5, 'склонение в пределах тропиков: день ' + d);
    assert.ok(near(dec, declinationDeg(d + 360), 1e-9), 'склонение повторяется через год');
    n++;
  }
  assert.equal(n, 20, 'двадцать значений склонения');
}

/* F-159: фазы суток: день, рассвет, закат, сумерки, ночь — и сила света по R-14.1 */
{
  const want = {
    0: 'night', 3: 'night', 7: 'day', 12: 'day', 17: 'day',
    19.9: 'dusk', 20.2: 'twilight', 21.5: 'night', 4.6: 'dawn', 9: 'day'
  };
  let n = 0;
  for (const [hour, id] of Object.entries(want)) {
    const ph = phaseAt(Number(hour) * 60, 172);
    assert.equal(ph.id, id, 'фаза в ' + hour + ':00 — ' + id);
    n++;
  }
  for (let i = 0; i < 10; i++) {
    const s = lightAt(i * 144, 172);
    assert.ok(s.strength >= PHASE.night.strength - 1e-9 && s.strength <= 1 + 1e-9, 'сила света в 0…1');
    assert.ok(s.strength >= 0.06 && s.strength <= 1, 'ночь не темнее 0.06');
    n++;
  }
  assert.equal(n, 20, 'двадцать значений фазы и силы света');
  assert.ok(lightAt(720, 172).strength > lightAt(120, 172).strength, 'днём светлее, чем ночью');
}

/* F-160: расписание огней R-14.3: < 4° — фонари 30 %, окна 40 %; < −2° — всё горит */
{
  let n = 0;
  for (let i = 0; i < 20; i++) {
    const alt = 8 - i * 0.7;                     // 8…−5.3°
    const a = artificialLight(alt);
    if (alt >= 4) assert.equal(a.windows, 0, 'выше 4° свет выключен');
    else if (alt < -2) {
      assert.equal(a.windows, 1, 'ниже −2° окна горят полностью');
      assert.equal(a.lamps, 1, 'ниже −2° фонари горят полностью');
      assert.ok(a.full, 'полный свет');
    } else {
      assert.ok(a.lamps >= 0.3 && a.lamps <= 1, 'фонари 30…100 %');
      assert.ok(a.windows >= 0.4 && a.windows <= 1, 'окна 40…100 %');
    }
    n++;
  }
  assert.equal(n, 20, 'двадцать значений расписания огней');
  assert.ok(artificialLight(0).windows > artificialLight(3).windows, 'у горизонта окна ярче');
}

/* F-161: сезоны и снег — четыре сезона по 90 дней, снег с 15-го по 80-й день */
{
  let n = 0;
  for (let i = 0; i < 20; i++) {
    const day = i * 18;                          // 0…342
    const season = seasonOf(day);
    assert.ok(['winter', 'spring', 'summer', 'autumn'].includes(season), 'сезон определён: день ' + day);
    assert.equal(seasonOf(day + 360), season, 'сезон повторяется через год');
    const snow = snowCover01(day);
    assert.ok(snow >= 0 && snow <= 1, 'покров в 0…1');
    if (season !== 'winter') assert.equal(snow, 0, 'снег только зимой');
    n++;
  }
  assert.equal(n, 20, 'двадцать значений сезона и покрова');
  assert.equal(seasonOf(0), 'winter');
  assert.equal(seasonOf(SEASON_DAYS * 3 + 1), 'autumn');
  assert.equal(seasonOf(START_DAY_OF_YEAR), 'summer', 'игра начинается летом');
  assert.equal(dayOfYearOf(0), START_DAY_OF_YEAR, 'первый день игры — лето');
  assert.ok(snowCover01(10) > 0.6, 'в начале зимы снег ложится');
  assert.ok(snowCover01(40) > 0.5, 'в середине зимы покров держится');
  assert.ok(snowCover01(89) < 0.15, 'к весне снег почти сошёл');
  assert.equal(snowCover01(SEASON_DAYS), 0, 'весной снега нет');
}

/* F-162: кнопки «утро» и «вечер» находят час рассвета и заката в любом сезоне */
{
  let n = 0;
  for (let i = 0; i < 20; i++) {
    const doy = i * 18;
    const dawn = hourWithPhase('dawn', doy), dusk = hourWithPhase('dusk', doy);
    assert.ok(dawn >= 0 && dawn < 24, 'час рассвета существует: ' + doy);
    assert.ok(dusk > dawn, 'закат позже рассвета');
    assert.equal(phaseAt(dawn * 60 + 30, doy).id, 'dawn', 'в найденный час действительно рассвет');
    assert.equal(phaseAt(dusk * 60 + 30, doy).id, 'dusk', 'в найденный час действительно закат');
    if (i > 0) assert.ok(dayOfYearOf(i * 18) >= 0 && dayOfYearOf(i * 18) < 360, 'день года в 0…360');
    n++;
  }
  assert.equal(n, 20, 'двадцать значений часов рассвета и заката');
  assert.ok(hourWithPhase('dawn', 172) < 5, 'летом светает рано');
  assert.ok(hourWithPhase('dawn', 0) > 7, 'зимой светает поздно');
}

/* Связка: часы в текст, наложение на карту и огни города */
{
  assert.equal(clockText(0), 'день 1 · 00:00 · ночь');
  assert.equal(clockText(DAY_MINUTES * 2 + 13 * 60 + 5), 'день 3 · 13:05 · день');
  // фаза в часах берётся от дня года: летом 07:00 — уже день, зимой ещё ночь
  assert.equal(clockText(7 * 60, START_DAY_OF_YEAR), 'день 1 · 07:00 · день');
  assert.equal(clockText(7 * 60, 0), 'день 1 · 07:00 · ночь', 'зимой в 07:00 темно');
  const dawnMin = hourWithPhase('dawn', START_DAY_OF_YEAR) * 60;
  assert.ok(clockText(dawnMin + 10, START_DAY_OF_YEAR).endsWith('рассвет'), 'час рассвета подписан рассветом');
  assert.equal(overlayCss(1, PHASE.day.tone), 'rgba(0,0,0,0)', 'днём наложения нет');
  const night = overlayCss(0.06, PHASE.night.tone);
  assert.ok(/rgba\(/.test(night) && !/0\.000\)/.test(night), 'ночью карта синеет: ' + night);
  assert.equal(cityLights(artificialLight(10), 90).windows, 0, 'днём огней нет');
  const lit = cityLights(artificialLight(-5), 90);
  assert.ok(lit.windows === 1 && lit.radiusPx > 0, 'ночью окна горят');
  assert.ok(cityLights(artificialLight(-5), 600).radiusPx > cityLights(artificialLight(-5), 20).radiusPx,
    'в зуме окно крупнее');
}

console.log('OK: 6 групп проверок времени суток §14 (F-157…F-162 по 20 значений)');
