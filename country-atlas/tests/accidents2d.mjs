/* Проверки ошибок водителя и ДТП §78 (F-248…F-258): риск зависит от характера, скорости
   и сцепления; авария закрывает полосу и тормозит тех, кто сзади; событие детерминировано
   и не хранится в сейве. По 20 значений на группу. Запуск: node tests/accidents2d.mjs */
import assert from 'node:assert/strict';
import { buildTransport, advance, vehiclePosition, TIME_SCALE } from '../src/transport2d.js';
import {
  ACCIDENT, hash01, carelessOf, weatherRisk, riskPerMinute, pickKind, blockMinutes,
  stepAccidents, applyJam, accidentStats, fleetRisk, idToInt
} from '../src/accidents2d.js';

let checks = 0;
const ok = (cond, msg) => { assert.ok(cond, msg); checks++; };

/* Маленький маршрут-стенд: три машины в одной полосе, одна из них «попала». */
const route = (lenKm = 100) => ({ lengthKm: lenKm, kind: 'ground', cls: 'M', speedKmh: 110 });
const car = (id, t, extra = {}) => ({
  id, route: route(), dir: 1, t, fuel: 1, refuelMin: 0, speedKmh: 90, blockedMin: 0,
  profile: { id: 'normal', T: 1.6, name: 'обычный' }, kind: 'car', lengthM: 4.5, ...extra
});
const truckOf = (tr) => ({ vehicles: tr, minutes: 480, accidents: null, counts: { byKind: {} } });

/* 1. F-248/F-252: хеш и характер водителя */
{
  const seen = new Set();
  let min = 1, max = 0, sum = 0;
  for (let i = 0; i < 2000; i++) {
    const u = hash01(i, i * 7 + 3);
    ok(u >= 0 && u < 1, 'хеш в [0,1): ' + i);
    seen.add(u);
    min = Math.min(min, u); max = Math.max(max, u); sum += u;
  }
  ok(seen.size > 1900, 'хеш почти без повторов: ' + seen.size);
  ok(min < 0.01, 'есть значения у нуля: ' + min.toFixed(4));
  ok(max > 0.99, 'есть значения у единицы: ' + max.toFixed(4));
  ok(Math.abs(sum / 2000 - 0.5) < 0.03, 'среднее около 0.5: ' + (sum / 2000).toFixed(3));
  ok(hash01(7, 9) === hash01(7, 9), 'хеш детерминирован');
  ok(hash01(7, 9) !== hash01(9, 7), 'порядок входа важен');
  ok(idToInt('v12') === idToInt('v12'), 'номер машины считается одинаково');
  ok(idToInt('v12') !== idToInt('v13'), 'разные номера — разные числа');
  const cs = [];
  for (let i = 0; i < 300; i++) cs.push(carelessOf('v' + i));
  const cMin = Math.min(...cs), cMax = Math.max(...cs);
  ok(cMin >= 1 - ACCIDENT.carelessSpread - 1e-9, 'невнимательность не ниже 0.3: ' + cMin.toFixed(2));
  ok(cMax <= 1 + ACCIDENT.carelessSpread + 1e-9, 'невнимательность не выше 1.7: ' + cMax.toFixed(2));
  ok(cMax - cMin > 1.0, 'разброс характеров есть: ' + (cMax - cMin).toFixed(2));
  ok(carelessOf('v5') === carelessOf('v5'), 'характер не меняется от вызова к вызову');
  ok(Number.isFinite(carelessOf(0)), 'характер по числу тоже работает');
  ok(ACCIDENT.perMinute > 0 && ACCIDENT.perMinute < 1e-3, 'базовый шанс — редкое событие');
  ok(ACCIDENT.kinds.length === 5, 'видов ДТП пять');
  ok(ACCIDENT.kinds.reduce((a, k) => a + k.weight, 0) === 100, 'веса видов дают 100');
  ok(ACCIDENT.kinds.every((k) => k.min < k.max), 'у каждого вида есть срок от…до');
  ok(ACCIDENT.jamSlow > 0 && ACCIDENT.jamSlow < 1, 'в заторе едем медленнее нормы');
}

/* 2. F-251/F-255: риск от скорости, характера и погоды */
{
  const base = car('v1', 0.3);
  const slow = car('v2', 0.3, { speedKmh: 20 });
  const fast = car('v3', 0.3, { speedKmh: 120 });
  ok(riskPerMinute(slow) < riskPerMinute(base), 'в городе риск ниже, чем на трассе');
  ok(riskPerMinute(fast) > riskPerMinute(base), 'на быстром ходу риск выше');
  ok(riskPerMinute(car('v4', 0.3, { speedKmh: 0 })) === 0, 'стоящая машина в ДТП не попадает');
  ok(riskPerMinute(car('v5', 0.3, { speedKmh: 1 })) === 0, 'почти стоящая — тоже ноль');
  const aggressive = car('v6', 0.3, { profile: { id: 'aggressive', T: 1.0 } });
  const calm = car('v7', 0.3, { profile: { id: 'calm', T: 2.0 } });
  ok(riskPerMinute(aggressive) > riskPerMinute(base), 'агрессивный рискует больше обычного');
  ok(riskPerMinute(calm) < riskPerMinute(base), 'спокойный — меньше');
  ok(riskPerMinute(aggressive) / riskPerMinute(calm) > 2, 'агрессивный и спокойный расходятся вдвое');
  const heavy = car('v8', 0.3, { kind: 'truck' });
  ok(riskPerMinute(heavy) < riskPerMinute(base), 'фура едет осмотрительнее легковой');
  const careful = car('v9', 0.3, { careless: 0.5 });
  const wild = car('v10', 0.3, { careless: 1.6 });
  ok(riskPerMinute(wild) > riskPerMinute(careful) * 3, 'невнимательный рискует втрое больше');
  const wx = {
    clear: { kind: 'clear' }, cloudy: { kind: 'cloudy' }, rain: { kind: 'rain' },
    snow: { kind: 'snow' }, fog: { kind: 'fog' }
  };
  ok(weatherRisk(null) === 1, 'без погоды множитель 1');
  ok(weatherRisk(wx.rain) > weatherRisk(wx.clear), 'дождь опаснее ясной погоды');
  ok(weatherRisk(wx.snow) > weatherRisk(wx.rain), 'снег опаснее дождя');
  ok(weatherRisk(wx.fog) > weatherRisk(wx.clear), 'туман опаснее ясной погоды');
  ok(weatherRisk(wx.snow) === ACCIDENT.gripRisk.snow, 'множитель снега из таблицы');
  ok(riskPerMinute(base, wx.snow) > riskPerMinute(base, wx.rain), 'по снегу риск выше, чем по дождю');
  ok(riskPerMinute(base, wx.rain) / riskPerMinute(base) > 2, 'дождь поднимает риск больше двух раз');
  ok(riskPerMinute(base) < 1e-3, 'на одну машину шанс всё-таки маленький');
  ok(fleetRisk(truckOf([base, fast]), wx.snow) > fleetRisk(truckOf([base, fast])), 'риск парка растёт в снег');
  ok(fleetRisk(truckOf([])) === 0, 'пустой парк — нулевой риск');
  ok(pickKind(0.0).id === 'rear', 'на нуле — удар сзади');
  ok(pickKind(0.999).id === 'cargo', 'в конце весов — упавший груз');
}

/* 3. F-249/F-250: вид и срок закрытия полосы */
{
  const counts = {};
  for (let i = 0; i < 1000; i++) {
    const k = pickKind(i / 1000);
    counts[k.id] = (counts[k.id] || 0) + 1;
  }
  for (const k of ACCIDENT.kinds) ok(counts[k.id] > 0, 'вид «' + k.name + '» встречается');
  ok(counts.rear > counts.cargo, 'удар сзади встречается чаще падения груза');
  ok(Math.abs(counts.rear / 1000 - 0.44) < 0.03, 'доля ударов сзади ≈ 44 %: ' + counts.rear);
  const kinds = ACCIDENT.kinds;
  ok(blockMinutes(kinds[0], 60) >= kinds[0].min, 'срок не меньше минимума');
  ok(blockMinutes(kinds[0], 60) <= kinds[0].max, 'срок не больше максимума');
  ok(blockMinutes(kinds[0], 120) > blockMinutes(kinds[0], 20), 'на быстром ходу закрыто дольше');
  ok(blockMinutes(kinds[0], 400) <= kinds[0].max, 'даже на 400 км/ч есть предел');
  ok(blockMinutes(kinds[0], 5) >= kinds[0].min, 'на медленном ходу всё равно не меньше минимума');
  ok(Number.isInteger(blockMinutes(kinds[1], 75)), 'срок — целое число минут');
  for (const k of kinds) ok(blockMinutes(k, 90) >= 6 && blockMinutes(k, 90) <= 30, 'срок «' + k.name + '» в разумных минутах');
}

/* 4. F-256: событие, блокировка и возврат в поток */
{
  const tr = truckOf([car('a', 0.2), car('b', 0.5), car('c', 0.8)]);
  let fresh = 0;
  for (let s = 0; s < 240; s++) {
    advance(tr, 1);
    fresh += stepAccidents(tr, 1, null, Math.floor(tr.minutes / 1440));
  }
  const st = accidentStats(tr);
  ok(fresh === st.total, 'все события посчитаны: ' + fresh);
  ok(st.total >= 0, 'события могут и не случиться');
  ok(tr.accidents.events.length <= 200, 'журнал не растёт без предела');
  const t2 = truckOf([car('a', 0.2), car('b', 0.5)]);
  for (let s = 0; s < 240; s++) { advance(t2, 1); stepAccidents(t2, 1, null, 0); }
  const same = t2.vehicles.every((v, i) => v.t === tr.vehicles[i].t);
  ok(same, 'тот же сид — те же позиции: детерминизм');
  // ручная авария: полоса закрыта, машина стоит, бак не тратится
  const one = car('x', 0.4);
  const tr2 = truckOf([one]);
  one.blockedMin = 20;
  one.accident = { kind: 'rear', name: 'сзади в бампер', min: 480, minutes: 20 };
  const t0 = one.t, fuel0 = one.fuel;
  advance(tr2, 1);
  ok(one.t === t0, 'закрытая полоса — машина не движется');
  ok(one.fuel === fuel0, 'стоя в ДТП, бак не тратится');
  ok(one.blockedMin < 20, 'срок стоянки уменьшается');
  for (let i = 0; i < 10; i++) advance(tr2, 1);
  ok(one.blockedMin === 0, 'стоянка заканчивается');
  ok(one.accident === null, 'метка ДТП снимается');
  ok(one.slow === 1, 'после стоянки машина снова едет нормально');
  ok(one.t !== t0, 'после ДТП машина поехала');
  // пока стоит — новых ДТП у ней нет
  const tr3 = truckOf([car('y', 0.4)]);
  tr3.vehicles[0].blockedMin = 5;
  const f3 = stepAccidents(tr3, 1, null, 0);
  ok(f3 === 0, 'стоящая в ДТП второй раз не попадает');
  ok(stepAccidents(tr3, 0, null, 0) === 0, 'нулевой шаг ничего не рождает');
  ok(stepAccidents(null, 1) === 0, 'без транспорта шаг безопасен');
  ok(stepAccidents({ vehicles: [] }, 1) === 0, 'пустой парк — тишина');
  // счётчики по дням
  const tr4 = truckOf([car('z', 0.3)]);
  tr4.accidents = { events: [], today: 3, total: 3, day: 1, kinds: { rear: 3 } };
  stepAccidents(tr4, 1, null, 2);
  ok(tr4.accidents.today === 0, 'новый день — новый счёт');
  ok(tr4.accidents.total === 3, 'общий счёт не сбрасывается');
  ok(tr4.accidents.day === 2, 'день запомнен');
}

/* 5. F-253/F-254: затор позади аварии */
{
  const r = route(100);
  const blockedCar = { ...car('a', 0.5), route: r, blockedMin: 15 };
  const near = { ...car('b', 0.49), route: r };       // 1 км позади
  const far = { ...car('c', 0.30), route: r };        // 20 км позади
  const ahead = { ...car('d', 0.60), route: r };      // впереди, ему всё равно
  const other = { ...car('e', 0.49), route: route(80) };  // другая дорога
  const tr = truckOf([blockedCar, near, far, ahead, other]);
  applyJam(tr, new Map([[r, [blockedCar.t]]]));
  ok(near.slow === ACCIDENT.jamSlow, 'машина в километре позади — тормозит');
  ok(far.slow === 1, 'машина в 20 км позади едет как обычно');
  ok(ahead.slow === 1, 'машина впереди не тормозит');
  ok(other.slow === 1, 'на другой дороге затора нет');
  ok(blockedCar.slow === ACCIDENT.jamSlow, 'сама разбитая стоит');
  // встречное направление: при dir = −1 «позади» — больший t
  const r2 = route(100);
  const b2 = { ...car('f', 0.5), route: r2, dir: -1, blockedMin: 10 };
  const n2 = { ...car('g', 0.505), route: r2, dir: -1 };
  const n3 = { ...car('h', 0.495), route: r2, dir: -1 };
  applyJam(truckOf([b2, n2, n3]), new Map([[r2, [b2.t]]]));
  ok(n2.slow === ACCIDENT.jamSlow, 'во встречном направлении тормозит тот, кто дальше по t');
  ok(n3.slow === 1, 'и не тормозит тот, кто уже проехал');
  // затор реально снижает проезд
  const trA = truckOf([{ ...car('p', 0.1), slow: 1 }]);
  const trB = truckOf([{ ...car('q', 0.1), slow: ACCIDENT.jamSlow }]);
  for (let i = 0; i < 5; i++) { advance(trA, 1); advance(trB, 1); }
  ok(trB.vehicles[0].t < trA.vehicles[0].t, 'в заторе проезжаешь меньше');
  ok(trB.vehicles[0].t > 0.1, 'но всё-таки едешь, а не стоишь');
  const speedA = (trA.vehicles[0].t - 0.1) * 100 / (5 * TIME_SCALE / 3600);   // км/ч
  ok(Math.abs(speedA - 90) < 1, 'без затора скорость держится 90 км/ч: ' + speedA.toFixed(1));
  // в километрах затор считается от длины маршрута
  const short = route(2);
  const bs = { ...car('s', 0.5), route: short, blockedMin: 5 };
  const ns = { ...car('t', 0.4), route: short };      // 0.1 * 2 км = 0.2 км позади
  applyJam(truckOf([bs, ns]), new Map([[short, [bs.t]]]));
  ok(ns.slow === ACCIDENT.jamSlow, 'на короткой дороге близкий тоже тормозит');
  ok(ACCIDENT.jamMinGapKm < ACCIDENT.jamKm, 'минимальный зазор меньше длины затора');
  ok(ACCIDENT.jamKm > 1, 'затор тянется больше километра');
}

/* 6. F-257/F-258: сводка и влияние на мир */
{
  const tr = truckOf([car('a', 0.2), car('b', 0.5), car('c', 0.8)]);
  const empty = accidentStats(tr);
  ok(empty.active === 0 && empty.today === 0 && empty.total === 0, 'пустая сводка — нули');
  ok(empty.worstKind === null, 'худшего вида ещё нет');
  ok(empty.recent.length === 0, 'журнал пуст');
  ok(empty.jamKm === 0, 'затора нет');
  tr.vehicles[0].blockedMin = 12;
  tr.vehicles[1].slow = ACCIDENT.jamSlow;
  tr.accidents = { events: [{ id: 'a', kind: 'rear', name: 'сзади в бампер', at: 500, minutes: 12 }], today: 4, total: 9, day: 0, kinds: { rear: 5, side: 4 } };
  const st = accidentStats(tr);
  ok(st.active === 1, 'одна машина стоит');
  ok(st.jammed === 1, 'одна в заторе');
  ok(st.today === 4 && st.total === 9, 'счёт сегодня и всего');
  ok(st.worstKind === 'rear', 'чаще всего — удар сзади');
  ok(st.avgBlockMin === 12, 'средняя стоянка 12 минут');
  ok(st.worstBlockMin === 12, 'худшая стоянка 12 минут');
  ok(st.jamKm > 0, 'длина затора посчитана: ' + st.jamKm);
  ok(st.recent.length === 1, 'последнее событие в сводке');
  ok(st.kinds.rear === 5, 'разбивка по видам сохранена');
  // влияние на мир: с ДТП парк проходит меньше
  const build = () => { const t = buildTransport(); return t; };
  const withA = build(), without = build();
  let airA = 0, airB = 0;
  for (let s = 0; s < 480; s++) {
    advance(withA, 1); stepAccidents(withA, 1, null, Math.floor(withA.minutes / 1440));
    advance(without, 1);
  }
  for (const v of withA.vehicles) airA += v.t;
  for (const v of without.vehicles) airB += v.t;
  ok(withA.accidents.total > 0, 'за 2 дня в стране были ДТП: ' + withA.accidents.total);
  ok(airA < airB, 'с авариями парк проходит меньше пути');
  ok((airB - airA) / airB < 0.05, 'но мир не встаёт: потеря меньше 5 %');
  ok(withA.vehicles.length === without.vehicles.length, 'парк не меняется от аварий');
  ok(withA.vehicles.every((v) => v.t >= 0 && v.t <= 1), 'все машины на своих маршрутах');
  const risky = fleetRisk(withA, { kind: 'snow' });
  ok(risky > fleetRisk(without, null), 'риск парка в снег выше, чем в ясный день');
  ok(vehiclePosition(withA.vehicles[0]).x !== undefined, 'место ДТП можно нарисовать');
}

console.log('OK: 6 групп проверок ДТП §78 (F-248…F-258, проверок ' + checks + ')');
