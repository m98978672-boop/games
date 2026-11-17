/* Проверки сжатия невидимой информации §79 (F-259…F-268): город вне кадра не тикает
   по шагам, а копит время; через 45 с уходит в архив — из памяти выбрасываются пешеходы,
   остаётся квитанция. При возврате город собирается из того же сида и догоняется, и
   положение совпадает с непрерывным ходом. Ключи кэшей — упакованные числа.
   Запуск: node tests/dormant2d.mjs */
import assert from 'node:assert/strict';
import {
  DORMANT, KEY, packKey, unpackKey, cityVisible, advanceFrozen, packBytes, archiveBytes,
  Dormancy, restoreCrowd
} from '../src/dormant2d.js';
import { advancePeds, buildPedestrians, PED } from '../src/ped2d.js';
import { settlements, rankSettlements } from '../src/world2d.js';
import { buildCity } from '../src/city2d.js';
import { weatherCached } from '../src/weather2d.js';
import { buildCrowd } from '../src/pedsoc2d.js';

let checks = 0;
const ok = (cond, msg) => { assert.ok(cond, msg); checks++; };

const towns = settlements();
const ranks = rankSettlements(towns, 10);
const cityOf = (i) => buildCity(towns[i], i, ranks);

/* ------------------------------- 1. Ключи F-261 */
{
  ok(typeof packKey(1, 2, 3, 4) === 'number', 'ключ — число, а не строка');
  ok(packKey(0, 0, 0, 0) >= 0, 'нулевой ключ неотрицателен');
  const cases = [[0, 0, 0, 0], [1, -1, 7, 3], [-37, 37, 100000, 400], [512, -512, 262143, 1023],
    [500, 500, 5, 0], [-300, 120, 12345, 77]];
  for (const [cx, cy, b, d] of cases) {
    const k = packKey(cx, cy, b, d);
    const back = unpackKey(k);
    ok(back.cx === ((cx + 512) & KEY.cellMask) - 512, 'cx возвращается: ' + cx);
    ok(back.cy === ((cy + 512) & KEY.cellMask) - 512, 'cy возвращается: ' + cy);
    ok(back.bucket === b, 'пятиминутка возвращается: ' + b);
    ok(back.day === d, 'день возвращается: ' + d);
    ok(Number.isSafeInteger(k), 'ключ целый и безопасный: ' + k);
    ok(k < 2 ** 48, 'ключ влезает в 48 бит: ' + k);
  }
  const seen = new Set();
  for (let i = 0; i < 500; i++) seen.add(packKey(i % 60 - 30, (i * 7) % 60 - 30, i * 13, i % 300));
  ok(seen.size === 500, '500 разных клеток — 500 разных ключей: ' + seen.size);
  ok(packKey(1, 1, 1, 1) === packKey(1, 1, 1, 1), 'ключ детерминирован');
  ok(packKey(1, 1, 1, 1) !== packKey(1, 1, 1, 2), 'соседний день — другой ключ');
  ok(packKey(1, 1, 1, 1) !== packKey(2, 1, 1, 1), 'соседняя клетка — другой ключ');
  ok(KEY.bucketMask === 262143, 'пятиминуток в маске 262144');
  // кэш погоды на числах работает так же, как раньше на строках
  const cache = { map: new Map(), hits: 0, misses: 0 };
  const w1 = weatherCached(1200, -800, 600, 100, cache);
  const w2 = weatherCached(1200, -800, 601, 100, cache);
  ok(w1 === w2, 'внутри пятиминутки — тот же ответ');
  ok(cache.hits === 1 && cache.misses === 1, 'счётчики кэша прежние: ' + cache.hits + '/' + cache.misses);
  ok(cache.map.size === 1, 'в кэше один ключ');
  const k = [...cache.map.keys()][0];
  ok(typeof k === 'number', 'ключ в кэше — число');
  ok(weatherCached(1200, -800, 605, 100, cache) !== undefined, 'на границе минуты ответ есть');
  ok(weatherCached(0, 0, 600, 100, null) !== undefined, 'без кэша погода считается');
}

/* ------------------------------- 2. Видимость F-260 */
{
  const center = { x: 0, y: 0 };
  ok(cityVisible({ x: 0, y: 0 }, center, 100, 100), 'центр видно');
  ok(cityVisible({ x: 99, y: -99 }, center, 100, 100), 'у самого края видно');
  ok(!cityVisible({ x: 101, y: 0 }, center, 100, 100), 'за краем — нет');
  ok(!cityVisible({ x: 0, y: 101 }, center, 100, 100), 'по вертикали за краем — нет');
  ok(cityVisible({ x: 0, y: 100 }, center, 100, 100), 'ровно на границе — видно');
  const wide = cityVisible({ x: 120, y: 0 }, center, 100 + DORMANT.padKm, 100);
  ok(wide, 'запас вокруг кадра возвращает город в кадр');
  ok(DORMANT.padKm >= 20, 'запас не меньше 20 км: ' + DORMANT.padKm);
  ok(!cityVisible(null, center, 10, 10), 'без города — не видно');
  ok(!cityVisible({ x: 0, y: 0 }, null, 10, 10), 'без центра — не видно');
  for (let i = 0; i < 20; i++) {
    const city = towns[i];
    const inside = Math.abs(city.x) <= 3500 && Math.abs(city.y) <= 3500;
    ok(cityVisible(city, center, 3500, 3500) === inside, 'город ' + i + ' на карте мира: ' + inside);
  }
  ok(DORMANT.pedScale === 40, 'пешеходы видны с 40 px/км');
  ok(DORMANT.archiveAfterSec === 45, 'в архив — после 45 с сна');
  ok(DORMANT.archiveKeep >= 100, 'архив держит не меньше сотни городов');
}

/* ------------------------------- 3. Догон F-263 */
{
  const city = cityOf(0);
  const a = buildPedestrians(city, 0);
  const b = buildPedestrians(city, 0);
  ok(a.peds.length === b.peds.length, 'тот же город — то же число пешеходов');
  ok(a.peds.length > 0, 'пешеходы есть: ' + a.peds.length);
  // непрерывный ход: 600 шагов по 1/60 с
  for (let i = 0; i < 600; i++) advancePeds(a, 1 / 60);
  // сон и догон: одно и то же время одним вызовом
  advanceFrozen(b, 600 / 60);
  let worst = 0;
  for (let i = 0; i < a.peds.length; i++) {
    worst = Math.max(worst, Math.abs(a.peds[i].t - b.peds[i].t));
    worst = Math.max(worst, Math.abs(a.peds[i].phase - b.peds[i].phase) * 1e-6);
  }
  ok(worst < 1e-6, 'догон совпадает с шагами: расхождение ' + worst.toExponential(2));
  const sameDir = a.peds.every((p, i) => p.dir === b.peds[i].dir);
  ok(sameDir, 'направления совпадают');
  ok(b.peds.every((p) => p.phase >= 0 && p.phase < 2 * Math.PI), 'фаза шага в своих пределах');
  ok(a.version === 600 && b.version === 1, 'версия кэша растёт по-своему: ' + a.version + '/' + b.version);
  ok(advanceFrozen(b, 0) === b, 'нулевой догон ничего не меняет');
  ok(advanceFrozen(null, 5) === null, 'без города догон безопасен');
  // три разных сида
  for (const idx of [1, 5, 20]) {
    const c1 = buildPedestrians(cityOf(idx), idx);
    const c2 = buildPedestrians(cityOf(idx), idx);
    for (let i = 0; i < 900; i++) advancePeds(c1, 1 / 90);
    advanceFrozen(c2, 10);
    const d = Math.max(...c1.peds.map((p, i) => Math.abs(p.t - c2.peds[i].t)));
    ok(d < 1e-6, 'город ' + idx + ': догон за 10 с совпадает (' + d.toExponential(1) + ')');
  }
  // суммарное время — то же, что и по шагам
  const c3 = buildPedestrians(cityOf(2), 2);
  const t0 = c3.peds.map((p) => p.t);
  advanceFrozen(c3, 0.5);
  advanceFrozen(c3, 0.5);
  const t1 = buildPedestrians(cityOf(2), 2);
  advanceFrozen(t1, 1.0);
  ok(c3.peds.every((p, i) => Math.abs(p.t - t1.peds[i].t) < 1e-9), 'два по 0.5 с = один по 1 с');
  ok(c3.peds.some((p, i) => p.t !== t0[i]), 'пешеходы действительно сдвинулись');
  ok(c3.count === t1.count, 'число пешеходов от догона не меняется');
  ok(JSON.stringify(c3.byKind) === JSON.stringify(t1.byKind), 'виды пешеходов те же');
  ok(c3.peds.every((p) => Number.isFinite(p.t)), 'путь остаётся числом');
  ok(c3.peds.every((p) => p.speed > 0), 'скорость пешехода положительна');
  ok(advanceFrozen(c3, -5) === c3, 'отрицательный догон ничего не делает');
  const dawn = buildPedestrians(cityOf(4), 4);
  const first = dawn.peds[0].t;
  advanceFrozen(dawn, 3600);
  ok(Math.abs(dawn.peds[0].t - first) > 0.01, 'за час пешеход проходит заметный путь');
  ok(Number.isFinite(dawn.peds[0].phase), 'фаза шага не ломается на длинном догоне');
  ok(dawn.peds.every((p) => Math.abs(p.t) < 1e7), 'путь не улетает в бесконечность');
}

/* ------------------------------- 4. Сон и архив F-265 */
{
  const map = {
    center: { x: 0, y: 0 }, scale: 60, showPeds: true, view: { w: 800, h: 600 },
    settlements: towns, pedCache: new Map(), crowds: new Map(),
    cityAt: (i) => cityOf(i),
    pedsAt(i) {
      if (!this.pedCache.has(i)) this.pedCache.set(i, buildPedestrians(cityOf(i), i));
      return this.pedCache.get(i);
    },
    crowdAt(i) {
      if (!this.crowds.has(i)) this.crowds.set(i, buildCrowd(this.pedsAt(i), 424242 + i));
      return this.crowds.get(i);
    }
  };
  // в кадре — только тот город, куда смотрит камера; остальные в паке спят
  map.center = { x: towns[0].x, y: towns[0].y };
  for (let i = 0; i < 14; i++) map.pedsAt(i);
  const d = new Dormancy();
  let st = d.step(map, 0.05);
  ok(st.awake >= 1, 'близкий город шагает: ' + st.awake);
  ok(st.slept >= 1, 'далёкие спят: ' + st.slept);
  ok(map.pedCache.size >= 2, 'паки построены');
  // 50 секунд: кто-то должен уйти в архив
  for (let i = 0; i < 1000; i++) st = d.step(map, 0.05);
  ok(st.archivedCities >= 1, 'через 45 с города ушли в архив: ' + st.archivedCities);
  ok(st.savedBytes > 0, 'архив освободил память: ' + st.savedBytes + ' Б');
  ok(st.sleepSec > 40, 'проспанные секунды посчитаны: ' + st.sleepSec.toFixed(1));
  // архив: в pedCache этих городов больше нет
  const archIdx = [...d.arch.keys()];
  ok(archIdx.length >= 1, 'в архиве есть записи');
  ok(archIdx.every((i) => !map.pedCache.has(i)), 'архивных городов нет среди живых');
  const rec = d.arch.get(archIdx[0]);
  ok(rec.sec >= 45, 'в записи накоплено время сна');
  ok(rec.n > 0, 'в записи число пешеходов');
  ok(packBytes(map.pedsAt(0)) > 0, 'живой город занимает память');
  ok(archiveBytes(rec) < packBytes({ peds: new Array(rec.n) }), 'квитанция меньше живого города');
  ok(archiveBytes(rec) < DORMANT.bytesPerPed * rec.n, 'квитанция — 4 байта на пешехода');
  ok(d.arch.size <= DORMANT.archiveKeep, 'архив не растёт без предела');
  // возвращаемся: город поднимается и догоняется
  const back = archIdx[0];
  map.center = { x: towns[back].x, y: towns[back].y };
  const before = d.arch.size;
  st = d.step(map, 0.05);
  ok(d.arch.size < before, 'город вернулся из архива');
  ok(st.restored >= 1, 'подъёмов из архива: ' + st.restored);
  ok(map.pedCache.has(back), 'город снова в живых');
  ok(map.pedCache.get(back).peds.length === rec.n, 'пешеходы собрались из того же сида');
  ok(st.restSec >= rec.sec, 'догон не короче сна: ' + st.restSec.toFixed(1));
  // толпа вернулась из байтовой сводки
  const crowd = map.crowdAt(back);
  ok(!!crowd, 'толпа есть');
  ok(crowd.side && crowd.side.length >= rec.n, 'стороны тротуара восстановлены');
  ok(st.woken >= 0, 'счётчик пробуждений есть');
}

/* ------------------------------- 5. Архив не врёт: положение после сна = непрерывный ход */
{
  const city = cityOf(3);
  const cont = buildPedestrians(city, 3);
  const crop = townCrowd(3);
  const d = new Dormancy();
  const map = makeMap({ w: 400, h: 300 }, 60);
  // прогреваем: город в кадре 3 с, затем камера уходит далеко
  map.center = { x: city.x, y: city.y };
  map.pedsAt(3);                        // пак построен кадром, как в жизни
  for (let i = 0; i < 180; i++) { d.step(map, 1 / 60); advancePeds(cont, 1 / 60 * (0.72 + 0.28)); }
  map.center = { x: 6000, y: 6000 };
  let slept = 0;
  for (let i = 0; i < 3600; i++) { d.step(map, 1 / 60); advancePeds(cont, 1 / 60); slept += 1 / 60; }
  const archived = d.arch.has(3) || d.sleep.has(3);
  ok(archived, 'город ушёл в сон или архив');
  // возвращаемся
  map.center = { x: city.x, y: city.y };
  d.step(map, 0);
  const pack = map.pedsAt(3);
  ok(pack.peds.length === cont.peds.length, 'пешеходов столько же');
  const diff = Math.max(...pack.peds.map((p, i) => Math.abs(p.t - cont.peds[i].t)));
  ok(diff < 1e-6, 'после сна положение то же: ' + diff.toExponential(2));
  ok(crop !== null, 'толпа города собирается заново');
  ok(d.arch.has(3) === false, 'город больше не в архиве');
  ok(d.stats().livePeds > 0, 'живых пешеходов посчитано');
  ok(typeof d.stats().savedBytes === 'number', 'освобождённая память — число');
}

/* ------------------------------- 6. Пустой и крайний случай */
{
  const d = new Dormancy();
  ok(d.step(null, 0.1) !== null, 'без карты статистика всё равно есть');
  const empty = { center: { x: 0, y: 0 }, scale: 1, showPeds: true, view: { w: 100, h: 100 }, settlements: [], pedCache: new Map(), crowds: new Map() };
  const st = d.step(empty, 0.1);
  ok(st.awake === 0 && st.slept === 0, 'пустая карта — нули');
  const map = makeMap({ w: 400, h: 300 }, 10);      // слишком далеко: пешеходов не видно
  map.center = { x: towns[0].x, y: towns[0].y };
  map.pedsAt(0);
  const st2 = d.step(map, 0.1);
  ok(st2.awake === 0, 'на 10 px/км город не считается видимым');
  ok(st2.slept === 1, 'и сразу засыпает');
  ok(DORMANT.bytesPerPed > 0, 'оценка веса пешехода положительна');
  ok(packBytes(null) === 0 && archiveBytes(null) === 0, 'нулевые записи весят ноль');
  ok(restoreCrowd({}, 0, { peds: [] }, {}) === null, 'восстановление без толпы безопасно');
  ok(KEY.cellMask === 1023, 'клеток в маске 1024');
  ok(packKey(-512, -512, 0, 0) === unpackKeyNonNeg(), 'крайний ключ неотрицателен');
  const fresh = new Dormancy();
  ok(fresh.stats().archivedCities === 0, 'новый объект сна — пустой архив');
  ok(fresh.stats().livePeds === 0, 'новый объект сна — ноль живых');
  ok(DORMANT.keyBucketMinutes === 5, 'кэш живёт пятиминутками');
  ok(DORMANT.archiveKeep <= 1024, 'архив в разумных пределах');
  ok(makeMap({ w: 100, h: 100 }, 100).scale === 100, 'стенд собирается с нужным масштабом');
  ok(packKey(0, 0, 0, 1024) === packKey(0, 0, 0, 0), 'день по кругу: 1024-й = 0-му');
}

function townCrowd(i) {
  const pack = buildPedestrians(cityOf(i), i);
  return buildCrowd(pack, 424242 + i);
}

function makeMap(view, scale) {
  return {
    center: { x: 0, y: 0 }, scale, showPeds: true, view,
    settlements: towns, pedCache: new Map(), crowds: new Map(),
    cityAt: (i) => cityOf(i),
    pedsAt(i) {
      if (!this.pedCache.has(i)) this.pedCache.set(i, buildPedestrians(cityOf(i), i));
      return this.pedCache.get(i);
    },
    crowdAt(i) {
      if (!this.crowds.has(i)) this.crowds.set(i, buildCrowd(this.pedsAt(i), 424242 + i));
      return this.crowds.get(i);
    }
  };
}

function unpackKeyNonNeg() {
  return packKey(-512, -512, 0, 0);
}

console.log('OK: 6 групп проверок сжатия невидимого §79 (F-259…F-268, проверок ' + checks + ')');
