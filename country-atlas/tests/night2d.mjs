/* Проверки ночи §74 (R-74.1…R-74.4, F-225…F-230): ночь — состояние мира, а не серая вуаль.
   Заодно доказывается, что кэш точек света ничего не меняет.
   Запуск: node tests/night2d.mjs */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  NIGHT, nightAmount, lightPoints, buildLightPoints, starField, headlightPoly,
  strobeOn, lighthouseAngle, lightsBudget, starsVisibility, nightVeilCss, h01
} from '../src/night2d.js';
import { lightAt, PHASE } from '../src/light2d.js';
import { settlements, rankSettlements } from '../src/world2d.js';
import { buildCity } from '../src/city2d.js';

let checks = 0;
const ok = (cond, msg) => { assert.ok(cond, msg); checks++; };
globalThis.window = globalThis.window || { addEventListener() {} };

const towns = settlements();
const ranks = rankSettlements(towns, 10);
const cities = [buildCity(towns[0], 0, ranks), buildCity(towns[3], 3, ranks), buildCity(towns[7], 7, ranks)];

/* F-225: сколько в кадре ночи */
{
  ok(nightAmount(null) === 0, 'без света ночи нет');
  ok(nightAmount({ strength: 1 }) === 0, 'день — ноль');
  for (let i = 0; i <= 20; i++) {
    const strength = i / 20;
    const n = nightAmount({ strength });
    ok(n >= 0 && n <= 1, 'ночь в пределах 0…1: ' + n.toFixed(3));
    ok(Math.abs(n - Math.min(1, (1 - strength) * 1.12)) < 1e-9, 'F-225 при силе ' + strength.toFixed(2));
  }
  const night = lightAt(23 * 60, 172);
  ok(night.phase.id === 'night', 'в 23:00 фаза — ночь');
  ok(nightAmount(night) > 0.9, 'ночью в кадре почти полная ночь: ' + nightAmount(night).toFixed(2));
  const noon = lightAt(12 * 60, 172);
  ok(nightAmount(noon) === 0, 'в полдень ночи нет');
  ok(nightVeilCss(0).includes('rgba(16,26,56,0.000)') || nightVeilCss(0).endsWith('0.000)'), 'нулевая ночь — прозрачная вуаль');
  ok(nightAmount({ strength: -5 }) === 1, 'сила света меньше нуля зажата');
}

/* F-226: точки света города и кэш */
{
  for (const [k, city] of cities.entries()) {
    const fresh = buildLightPoints(city, k);
    ok(fresh.windows.length === city.blocks.filter((b) => b.zone !== 'park').length,
      'на каждый непарковый квартал — запись о свете (' + fresh.windows.length + ')');
    ok(fresh.windows.every((w) => w.on >= 0 && w.on <= 1), 'жребий «горит» в пределах');
    ok(fresh.windows.every((w) => w.pts.length === 2 && w.pts.every((p) => p.h >= 0 && p.h <= 1)),
      'у квартала два окна со своим жребием');
    ok(fresh.lamps.length > 0, 'фонари на проспектах есть: ' + fresh.lamps.length);
    ok(fresh.windows.every((w) => w.pts.every((p) => p.x >= w.x0 - 1e-9 && p.x <= w.x1 + 1e-9 &&
      p.y >= w.y0 - 1e-9 && p.y <= w.y1 + 1e-9)), 'окно лежит внутри квартала');
  }
  const city = cities[0];
  const a = lightPoints(city, 0);
  const b = lightPoints(city, 0);
  ok(a === b, 'второй вызов отдаёт тот же объект');
  const fresh = buildLightPoints(city, 0);
  ok(JSON.stringify(a) === JSON.stringify(fresh), 'кэш совпадает со свежим расчётом побайтово');
  ok(a.windows.length > 20 && a.lamps.length > 20, 'город не пустой: ' + a.windows.length + ' окон, ' + a.lamps.length + ' фонарей');
  const other = buildLightPoints(cities[1], 3);
  ok(JSON.stringify(other) !== JSON.stringify(fresh), 'у разных городов разный свет');
  ok(h01(0) !== h01(1) && h01(0) >= 0 && h01(0) < 1, 'хеш даёт разные дроби в 0…1');
  // свет не мигает: один и тот же квартал — один и тот же жребий
  const again = buildLightPoints(city, 0);
  ok(again.windows[5].on === fresh.windows[5].on, 'жребий окна постоянен');
}

/* F-227: звёзды */
{
  const a = starField(20260101, 300);
  const b = starField(20260101, 300);
  ok(a.length === 300, 'звёзд ровно сколько просили');
  ok(JSON.stringify(a) === JSON.stringify(b), 'звёзды детерминированы');
  ok(starField(7, 300)[0].u !== a[0].u, 'другой сид — другое небо');
  for (let i = 0; i < 20; i++) {
    const st = a[i];
    ok(st.u >= 0 && st.u <= 1, 'u в 0…1');
    ok(st.v >= 0 && st.v <= 1, 'v в 0…1');
    ok(st.b >= 0.25 && st.b <= 1, 'яркость 0.25…1');
  }
  ok(NIGHT.starCount >= 200, 'звёзд в кадре много: ' + NIGHT.starCount);
  ok(starsVisibility(0) === 0, 'днём звёзд нет');
  ok(starsVisibility(1) === 1, 'в глухую ночь — все');
  ok(starsVisibility(NIGHT.starFrom) === 0, 'на пороге звёзд ещё нет');
  for (let i = 0; i <= 10; i++) {
    const n = NIGHT.starFrom + (1 - NIGHT.starFrom) * (i / 10);
    const v = starsVisibility(n);
    ok(v >= 0 && v <= 1, 'звёзды появляются плавно: ' + v.toFixed(2));
  }
}

/* F-228: конус фар */
{
  const poly = headlightPoly(100, 200, 0, 60);
  ok(poly.length === 4, 'луч — четырёхугольник');
  ok(Math.hypot(poly[0][0] - 100, poly[0][1] - 200) < 1.2, 'луч начинается у самой машины');
  ok(poly[3][0] === poly[0][0] && poly[3][1] === poly[0][1], 'контур луча замкнут');
  const far = (NIGHT.beamM / 1000) * 60;
  ok(Math.abs(poly[1][0] - (100 + Math.cos(NIGHT.beamHalf) * far)) < 1e-6, 'правый край луча');
  ok(Math.abs(poly[2][1] - (200 - Math.sin(NIGHT.beamHalf) * far)) < 1e-6, 'левый край луча');
  ok(Math.abs((poly[1][1] - 200) + (poly[2][1] - 200)) < 1e-6, 'луч симметричен относительно оси');
  for (let i = -2; i <= 2; i++) {
    const p = headlightPoly(0, 0, i * 0.7, 80, 100, 0.4);
    ok(p.length === 4, 'поворот на ' + (i * 0.7).toFixed(1) + ' рад не ломает луч');
    ok(Math.hypot(p[1][0], p[1][1]) > Math.hypot(p[0][0], p[0][1]), 'луч длиннее, чем ближняя кромка');
  }
  ok(headlightPoly(0, 0, 0, 1000)[1][0] > headlightPoly(0, 0, 0, 100)[1][0], 'масштаб растягивает луч');
  ok(NIGHT.beamM > 20 && NIGHT.beamM < 200, 'длина луча правдоподобна: ' + NIGHT.beamM + ' м');
}

/* F-229 и F-230: мигание и маяк */
{
  let on = 0;
  for (let i = 0; i < 20; i++) {
    const t = i * 0.3;
    ok(typeof strobeOn(t) === 'boolean', 'строб — булево в момент ' + t.toFixed(1));
    if (strobeOn(t)) on++;
    ok(strobeOn(t + NIGHT.strobeSec) === strobeOn(t), 'мигание повторяется через период');
  }
  ok(on > 0 && on < 20, 'строб и горит, и гаснет: ' + on + ' из 20');
  const angles = [];
  for (let i = 0; i < 20; i++) angles.push(lighthouseAngle(i * 0.7));
  ok(angles.every((a) => a >= 0 && a < Math.PI * 2), 'угол маяка в 0…2π');
  ok(angles[10] !== angles[0], 'луч вращается');
  ok(Math.abs(lighthouseAngle(NIGHT.lighthouseSec) - lighthouseAngle(0)) < 1e-9, 'оборот замыкается');
  ok(NIGHT.lighthouseM > 5, 'луч маяка виден издалека: ' + NIGHT.lighthouseM + ' км');
}

/* Бюджет огней и цвета */
{
  const day = lightsBudget({ windows: 0, lamps: 0 }, 10, 3);
  ok(day.windows === 0 && day.dotCount === 1, 'днём огней нет, но бюджет определён');
  const night = lightsBudget({ windows: 1, lamps: 1 }, 60, 2);
  ok(night.pools === true, 'в зуме включаются световые пятна');
  ok(night.radiusPx >= 1, 'точка света не меньше пикселя');
  ok(night.perCity >= 60, 'на город есть бюджет точек: ' + night.perCity);
  const many = lightsBudget({ windows: 1, lamps: 1 }, 60, 12);
  ok(many.perCity <= night.perCity, 'чем больше городов в кадре, тем меньше точек на город');
  ok(lightsBudget({ windows: 0.4, lamps: 1 }, 60, 1).dotCount === 1, 'на рассвете горит одна лампа из двух');
  ok(lightsBudget({ windows: 0.9, lamps: 1 }, 60, 1).dotCount === 2, 'в глухую ночь горят обе');
  for (let i = 0; i < 20; i++) {
    const n = i / 20;
    const css = nightVeilCss(n);
    ok(css.startsWith('rgba('), 'вуаль — rgba');
    const parts = css.slice(5, -1).split(',').map(Number);
    ok(parts[3] <= NIGHT.veilMax + 1e-9, 'плотность не выше предела: ' + parts[3]);
    ok(parts[2] > parts[0], 'ночью синий канал больше красного');
    ok(parts[2] <= 56 && parts[0] <= 16, 'цвет глубокий, а не серый');
  }
  const src = readFileSync(new URL('../src/night2d.js', import.meta.url), 'utf8');
  ok(!/Math\.random/.test(src), 'в ночи нет Math.random (R-16.1)');
  ok(PHASE.night.strength < 0.2, 'ночь в модели света тёмная: ' + PHASE.night.strength);
}

console.log('OK: 7 групп проверок ночи §74 (F-225…F-230, проверок ' + checks + ')');
