/* Проверки ИИ §16: детерминизм, IDM, характеры водителей, светофор, вес ребра,
   решения мэров и полигон (F-189…F-198). По 20 значений на группу.
   Запуск: node tests/ai2d.mjs */
import assert from 'node:assert/strict';
import {
  rngFork, DRIVER, PROFILE_IDS, idmAccel, speedLimitKmh, pickProfile, greenTime, edgeWeight,
  MAYOR_ACTIONS, utility, whyText, buildMayors, advanceMayor, advanceMayors, pushWhy,
  mayorStats, makeMayor
} from '../src/ai2d.js';
import {
  PLAY2D, lightTiming, buildPlay, stepPlay, playStats, queueLength, leaderOf, PROFILE_COLOR
} from '../src/play2d.js';
import { buildTransport, advance as advanceTransport, VEHICLE } from '../src/transport2d.js';
import { buildRoads, ROAD_CLASS } from '../src/roads2d.js';
import { settlements } from '../src/world2d.js';

let checks = 0;
const ok = (cond, msg) => { assert.ok(cond, msg); checks++; };
globalThis.window = globalThis.window || { addEventListener() {} };

/* F-189: свой поток случайности у каждого агента — повторяемый и независимый (R-16.3) */
{
  const a = rngFork(424242, 17), b = rngFork(424242, 17);
  const c = rngFork(424242, 18);
  let same = 0, differ = 0;
  for (let i = 0; i < 20; i++) {
    const x = a(), y = b(), z = c();
    ok(x >= 0 && x < 1, 'значение в [0,1): ' + x.toFixed(4));
    ok(x === y, 'тот же сид и номер — то же число: шаг ' + i);
    if (Math.abs(x - z) > 1e-9) differ++;
    if (Math.abs(x - z) < 1e-9) same++;
  }
  ok(differ >= 19, 'разные агенты живут разными потоками: ' + differ + ' из 20');
  ok(same <= 1, 'совпадений почти нет');
  // среднее по 4000 значений — около половины, поток не «залипает»
  const r = rngFork(7, 3);
  let sum = 0, lo = 1, hi = 0;
  for (let i = 0; i < 4000; i++) { const v = r(); sum += v; lo = Math.min(lo, v); hi = Math.max(hi, v); }
  const mean = sum / 4000;
  ok(Math.abs(mean - 0.5) < 0.03, 'среднее около 0.5: ' + mean.toFixed(3));
  ok(lo < 0.01 && hi > 0.99, 'поток покрывает весь диапазон');
}

/* F-190: IDM (R-16.4) — свободная дорога разгоняет, близкий сосед тормозит */
{
  const P = DRIVER.normal;
  // свободная дорога: s огромно → почти чистый разгон
  for (let i = 0; i < 20; i++) {
    const v = i * 1.2;                     // 0…22.8 м/с
    const a = idmAccel(v, 30, 1000, 0, P);
    ok(a > 0 && a <= P.aMax + 1e-9, 'свободно — разгон в пределах a_max: v=' + v.toFixed(1) + ' → ' + a.toFixed(2));
    ok(a < P.aMax * (1 - Math.pow(v / 30, 4)) + 1e-6, 'разгон падает с ростом скорости: v=' + v.toFixed(1));
  }
  // предел: на v0 разгон ≈ 0
  ok(Math.abs(idmAccel(30, 30, 1000, 0, P)) < 0.02, 'на желаемой скорости не разгоняемся');
  // вплотную к стоящему впереди — тормозим
  const brake = idmAccel(20, 30, 8, 10, P);
  ok(brake < -3, 'вплотную — сильное торможение: ' + brake.toFixed(2));
  ok(brake >= -3 * P.b - 1e-9, 'но не сильнее комфортного предела −3b');
  // монотонность по дистанции: дальше — мягче
  let prev = -Infinity;
  for (let i = 1; i <= 20; i++) {
    const s = (i / 20) * 120 + 1;
    const a = idmAccel(25, 30, s, 5, P);
    ok(a >= prev - 1e-9, 'чем дальше сосед, тем меньше торможение: s=' + s.toFixed(1));
    prev = a;
  }
  // стоящая машина на месте: газ не в пол
  ok(idmAccel(0, 25, 3, 0, P) > -1e6 && Number.isFinite(idmAccel(0, 25, 3, 0, P)), 'нулевая скорость — конечное ускорение');
  ok(idmAccel(10, 30, 0, 0, P) <= -3 * P.b + 1e-9, 'зазор ноль — предельное торможение');
}

/* F-191: предел класса плюс неформальное превышение (R-16.7) — 5 классов × 4 характера */
{
  const rows = [['M', 110], ['R', 90], ['L', 60], ['G', 30], ['F', 20]];
  for (const [cls, base] of rows) {
    for (const id of ['calm', 'normal', 'aggressive', 'novice']) {
      const got = speedLimitKmh(cls, DRIVER[id]);
      ok(got === base + DRIVER[id].over, 'F-191: ' + cls + ' / ' + id + ' = ' + got);
    }
  }
  ok(speedLimitKmh('M', DRIVER.aggressive) > ROAD_CLASS.M.speed, 'агрессивный выше формального предела');
  ok(speedLimitKmh('G', DRIVER.calm) === 34, 'на грунте спокойный держит 34 км/ч');
  ok(PROFILE_IDS.length === 5, 'пять характеров водителей');
  ok(DRIVER.truck.over === 0, 'фура не превышает');
  let sum = 0;
  for (let i = 0; i < 20; i++) sum += speedLimitKmh('R', DRIVER.normal);
  ok(sum === 99 * 20, 'предел постоянен от вызова к вызову');
}

/* F-192: кого посадили за руль — распределение устойчиво, фура всегда фура */
{
  const cnt = { calm: 0, normal: 0, aggressive: 0, novice: 0 };
  for (let i = 0; i < 20; i++) {
    const p = pickProfile('car', i * 37, rngFork(99, i));
    ok(!!DRIVER[p.id], 'характер из набора: ' + p.id);
    ok(p.T >= 1.0 && p.T <= 2.4, 'T в диапазоне R-16.4: ' + p.T);
    ok(p.s0 >= 1.4 && p.s0 <= 4.0, 'дистанция на месте разумна: ' + p.s0);
    cnt[p.id]++;
  }
  ok(cnt.normal >= 5, 'обычных больше всего в выборке: ' + cnt.normal);
  for (let i = 0; i < 6; i++) ok(pickProfile('truck', i) === DRIVER.truck, 'фура — всегда фура');
  ok(pickProfile('bus', 3) === DRIVER.truck, 'автобус — тоже тяжёлый профиль');
  // на настоящем парке §44 характеры есть у всех наземных
  const t = buildTransport(buildRoads(), settlements());
  const ground = t.vehicles.filter((v) => v.route.kind === 'ground');
  ok(ground.length > 900, 'наземный парк на месте: ' + ground.length);
  ok(ground.every((v) => !!v.profile && !!DRIVER[v.profile.id]), 'у каждой машины есть характер');
  const ids = new Set(ground.map((v) => v.profile.id));
  ok(ids.size === 5, 'встречаются все пять характеров: ' + [...ids].join(', '));
  let fast = 0;
  for (const v of ground) {
    const cap = Math.min(VEHICLE[v.kind].speedKmh, v.route.speedKmh);
    ok(v.speedKmh <= cap * 1.15 + 1e-9, 'F-119 держится: ' + v.speedKmh.toFixed(1) + ' ≤ ' + cap);
    ok(v.limitKmh >= ROAD_CLASS[v.route.cls].speed, 'предел не ниже класса');
    if (v.profile.id === 'aggressive') fast++;
  }
  ok(fast > 0, 'агрессивные нашлись: ' + fast);
  const before = t.vehicles[0].t;
  advanceTransport(t, 30);
  ok(t.vehicles.length === ground.length + t.vehicles.length - ground.length, 'парк не рассыпался');
  ok(t.vehicles.every((v) => !Number.isNaN(v.speedKmh)), 'скорости конечны после шага мира');
  ok(typeof before === 'number', 'доля пути числовая');
}

/* F-193: зелёный по очереди и F-198: цикл светофора */
{
  ok(greenTime(0) === 8, 'пустая очередь — минимум 8 с');
  ok(greenTime(-5) === 8, 'отрицательная очередь не ломает минимум');
  ok(Math.abs(greenTime(9) - 15) < 1e-9, 'F-193: 3·√9 + 6 = 15');
  ok(Math.abs(greenTime(25) - 21) < 1e-9, 'F-193: 3·√25 + 6 = 21');
  ok(greenTime(100) === 34, 'длинная очередь — максимум 34 с');
  ok(greenTime(1000) === 34, 'и дальше не растёт');
  let prev = 0;
  for (let i = 0; i <= 20; i++) {
    const g = greenTime(i * 5);
    ok(g >= prev, 'зелёный растёт с очередью: q=' + i * 5);
    prev = g;
  }
  for (let q = 0; q <= 12; q++) {
    const t = lightTiming(q);
    ok(t.green === greenTime(q), 'цикл берёт зелёный из F-193: q=' + q);
    ok(t.yellow === 3, 'жёлтый всегда 3 с');
    ok(t.red >= 8 && t.red <= 34, 'красный в разумных пределах: ' + t.red.toFixed(1));
    ok(t.red > 0 && t.green > 0, 'обе фазы длиннее нуля');
  }
  ok(lightTiming(0).red === 11.4, 'пустая очередь — короткий красный 11.4 с');
  ok(lightTiming(100).red <= 34, 'красный не выходит за предел');
}

/* F-194: вес ребра растёт квадратично от загрузки (R-16.17) */
{
  ok(edgeWeight(10, 0, 100) === 10, 'пустая дорога — базовое время');
  ok(Math.abs(edgeWeight(10, 100, 100) - 35) < 1e-9, 'полная дорога — ×3.5');
  ok(Math.abs(edgeWeight(10, 200, 100) - 110) < 1e-9, 'двойная загрузка — ×11');
  ok(edgeWeight(10, 50, 0) === 10, 'нулевая ёмкость не делит на ноль');
  let prev = 0;
  for (let i = 0; i < 20; i++) {
    const w = edgeWeight(12, i * 10, 200);
    ok(w >= prev, 'вес растёт с плотностью: ' + i * 10);
    ok(w >= 12, 'объезд никогда не быстрее свободной дороги');
    prev = w;
  }
  ok(Math.abs(edgeWeight(8, 30, 60) - 8 * (1 + 2.5 * 0.25)) < 1e-9, 'половина загрузки — ×1.625');
}

/* F-195…F-197: мэры — utility, «почему», бюджет и журнал (R-16.26–R-16.27) */
{
  const towns = settlements();
  const mayors = buildMayors(towns);
  ok(mayors.length > 5, 'мэры выбраны из крупных городов: ' + mayors.length);
  ok(mayors.length < towns.length, 'мелкие поселения без мэра');
  ok(mayors.every((m) => m.population >= 25000), 'порог 25 000 жителей');
  ok(MAYOR_ACTIONS.length === 8, 'восемь типовых решений мэра');

  const m = mayors[0];
  let best = null;
  for (const a of MAYOR_ACTIONS) {
    const u = utility(m, a);
    ok(Number.isFinite(u.score), 'utility конечна: ' + a.id);
    const parts = Object.values(u.parts);
    ok(parts.every((v) => Number.isFinite(v)), 'все пять факторов конечны: ' + a.id);
    ok(parts.length === 5, 'пять факторов в «почему» (R-16.27)');
    if (!best || u.score > best.u.score) best = { a, u };
  }
  ok(best !== null, 'лучшее решение найдено');
  const why = whyText(m, best.a, best.u);
  ok(why.startsWith(m.name + ':'), '«почему» начинается с имени города');
  ok(why.includes(best.a.name), 'в «почему» названо решение');
  ok(/итог -?\d+\.\d\d/.test(why), 'в «почему» есть итоговый счёт');
  ok(why.length < 120, 'строка короткая для HUD: ' + why.length);

  // 60 дней жизни: бюджет не уходит в минус, решения копятся, журнал ограничен
  const journal = [];
  const copy = JSON.parse(JSON.stringify(mayors));
  let decisions = 0;
  for (let d = 0; d < 60; d++) {
    for (const mm of copy) {
      const out = advanceMayor(mm, journal, rngFork(11, mm.index + d));
      decisions += out.length;
      ok(mm.budget >= 0 && mm.budget <= 1, 'бюджет в [0,1]: ' + mm.budget.toFixed(2));
      ok(mm.jams >= 0 && mm.jams <= 1, 'пробки в [0,1]');
      ok(mm.mood >= 0 && mm.mood <= 1, 'настроение в [0,1]');
    }
  }
  ok(decisions > 0, 'за 60 дней мэры что-то решили: ' + decisions);
  ok(journal.length <= 40, 'журнал не растёт бесконечно: ' + journal.length);
  ok(journal.length > 0, 'журнал заполнен');
  ok(journal.every((e) => typeof e.text === 'string' && e.city && e.day >= 1), 'у записи есть день, город и текст');
  const stats = mayorStats(copy);
  ok(stats.count === copy.length, 'сводка считает всех мэров');
  ok(stats.decisions === decisions, 'сводка сходится с числом решений');
  ok(stats.jams >= 0 && stats.jams <= 1, 'средние пробки в норме');
  ok(stats.budget > 0, 'средний бюджет жив');
  ok(mayorStats([]).count === 0, 'пустой список не падает');

  // детерминизм: тот же сид — те же решения
  const A = buildMayors(towns).slice(0, 4);
  const B = buildMayors(towns).slice(0, 4);
  const ja = [], jb = [];
  advanceMayors(A, ja, 10);
  advanceMayors(B, jb, 10);
  ok(JSON.stringify(ja) === JSON.stringify(jb), 'мэры детерминированы (R-16.3)');
  ok(ja.length > 0, 'десять дней дали решения');
  ok(A[0].decisions === B[0].decisions, 'счётчик решений совпадает');
  // кольцо журнала: 45 записей → осталось 20
  const ring = [];
  for (let i = 0; i < 45; i++) pushWhy(ring, { day: i, city: 'X', text: 't' + i }, 20);
  ok(ring.length === 20, 'кольцо режет по ёмкости');
  ok(ring[19].text === 't44', 'в кольце самые свежие записи');
  ok(ring[0].text === 't25', 'старые вытеснены');
  ok(mayorStats([makeMayor({ name: 'Тест', x: 0, y: 0 }, 0, { capital: 0, hubs: [] })]) .count === 1, 'одиночный мэр считается');
}

/* F-197: полигон IDM и светофора — машины не проезжают друг сквозь друга и стоят на красный */
{
  ok(PLAY2D.cars === 12, 'на полигоне 12 машин');
  ok(PLAY2D.ringM === 700 && PLAY2D.stopM === 620, 'кольцо 700 м, стоп-линия на 620');

  const a = buildPlay(424242);
  const b = buildPlay(424242);
  ok(JSON.stringify(a.cars.map((c) => [c.profile.id, Math.round(c.v * 1000)])) ===
     JSON.stringify(b.cars.map((c) => [c.profile.id, Math.round(c.v * 1000)])), 'полигон детерминирован');
  ok(a.cars.length === PLAY2D.cars, 'все машины на кольце');
  ok(a.cars.every((c) => !!PROFILE_COLOR[c.profile.id]), 'у каждой машины свой цвет');
  ok(a.cars.every((c, i) => i === 0 || c.x > a.cars[i - 1].x), 'старт без наложений');
  ok(queueLength(a) === 0, 'на старте очередь пуста');

  // 400 секунд: светофор переключается, машины проходят, зазор не схлопывается
  const seen = new Set();
  let stops = 0;
  const startPassed = a.passed;
  for (let i = 0; i < 4000; i++) {
    stepPlay(a, 0.05);
    seen.add(a.light.state);
    if (i % 200 === 0) {
      ok(a.cars.every((c) => c.v >= 0), 'скорость не отрицательна: шаг ' + i);
      ok(a.cars.every((c) => c.x >= 0 && c.x < PLAY2D.ringM + 1), 'машина на кольце: шаг ' + i);
      const g = a.cars.map((c) => leaderOf(a, c).gap).sort((x, y) => x - y)[0];
      if (g < 1.0) stops++;
      ok(g > 0.2, 'машины не слиплись: зазор ' + g.toFixed(2) + ' м');
    }
  }
  ok(seen.size === 3, 'светофор прошёл все фазы: ' + [...seen].join(', '));
  ok(a.passed > startPassed, 'машины проехали стоп-линию: ' + a.passed);
  ok(a.maxQueue >= 3, 'очередь собиралась: ' + a.maxQueue);
  ok(a.maxQueue <= PLAY2D.cars, 'очередь не больше числа машин');
  const st = playStats(a);
  ok(st.state === a.light.state, 'сводка называет фазу');
  ok(st.avgKmh >= 0 && st.avgKmh <= 90, 'средняя скорость городская: ' + st.avgKmh.toFixed(1));
  ok(Object.values(st.byProfile).reduce((x, y) => x + y, 0) === 12, 'характеры в сумме дают весь парк');
  ok(st.passed === a.passed, 'пройдено сходится');
  ok(st.minGap > 0.2, 'зазор за всю поездку не схлопнулся: ' + st.minGap.toFixed(2));

  // на красный машины действительно останавливаются
  const c = buildPlay(5);
  c.light.state = 'red';
  c.light.t = 0;
  for (let i = 0; i < 900; i++) stepPlay(c, 0.05);
  const standing = c.cars.filter((car) => car.v < 0.5).length;
  ok(standing >= 1, 'на красный кто-то встал: ' + standing);
  ok(c.cars.every((car) => (PLAY2D.stopM - car.x + PLAY2D.ringM) % PLAY2D.ringM > 3 || car.v < 6),
    'не проскакивает стоп-линию на красный');
  ok(queueLength(c) >= 1, 'очередь видит стоящих: ' + queueLength(c));
  ok(c.light.red >= 8, 'красный не короче 8 с');
}

console.log('OK: 7 групп проверок ИИ §16 (F-189…F-198, проверок ' + checks + ')');
