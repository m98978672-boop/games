/* Проверки газеты §82 (F-269…F-278): заметки собираются из того, что случилось,
   заголовок детерминирован, дубли склеиваются, лента не растёт старьём и не врёт
   про время и место. Запуск: node tests/news2d.mjs */
import assert from 'node:assert/strict';
import {
  NEWS, pickTemplate, fillTemplate, makeItem, mergeNews, trimNews, newsStats,
  newsFromEvents, weatherWord, newsTime
} from '../src/news2d.js';

let checks = 0;
const ok = (cond, msg) => { assert.ok(cond, msg); checks++; };

/* 1. F-269/F-270: шаблоны */
{
  ok(NEWS.max === 40, 'в ленте 40 заметок');
  ok(NEWS.maxAgeMin === 3 * 1440, 'старше трёх суток — не новость');
  ok(Object.keys(NEWS.kinds).length === 6, 'шесть видов новостей');
  for (const k of Object.keys(NEWS.kinds)) {
    ok(NEWS.kinds[k].name.length > 2, 'у вида «' + k + '» есть русское имя');
    ok(NEWS.kinds[k].weight >= 1, 'вес вида ' + k + ' положителен');
  }
  const t1 = pickTemplate('accident', 1000);
  const t2 = pickTemplate('accident', 1000);
  ok(t1 === t2, 'шаблон детерминирован');
  ok(t1.includes('{where}'), 'в шаблоне есть место');
  const seen = new Set();
  for (let i = 0; i < 300; i++) seen.add(pickTemplate('accident', i * 7));
  ok(seen.size >= 3, 'шаблоны аварий разные: ' + seen.size);
  for (const kind of ['weather', 'mayor', 'growth', 'traffic', 'record']) {
    const t = pickTemplate(kind, 500);
    ok(typeof t === 'string' && t.length > 5, 'шаблон ' + kind + ' не пустой');
  }
  ok(pickTemplate('нет-такого', 10).includes('{where}'), 'неизвестный вид берёт шаблон погоды');
  ok(fillTemplate('{where}: {name}', { where: 'Валград', name: 'удар' }) === 'Валград: удар', 'подстановка работает');
  ok(fillTemplate('{a}{b}', { a: 1 }) === '1—', 'чего нет — честный прочерк');
  ok(fillTemplate('ровно', {}) === 'ровно', 'шаблон без дырок не меняется');
  ok(fillTemplate('{x}', { x: 0 }) === '0', 'нуль подставляется, а не теряется');
}

/* 2. F-272: заметка */
{
  const it = makeItem('accident', 1234, 'Валград', { name: 'удар сзади', min: 12, tag: 'v7' });
  ok(!!it, 'заметка собралась');
  ok(it.kind === 'accident', 'вид записан');
  ok(it.at === 1234, 'минута записана');
  ok(it.where === 'Валград', 'место записано');
  ok(it.text.includes('Валград'), 'в тексте есть место');
  ok(it.text.includes('удар сзади'), 'в тексте есть что случилось');
  ok(!it.text.includes('{'), 'дырок в тексте нет');
  ok(!it.text.includes('{'), 'дырок в тексте нет');
  ok(it.weight === NEWS.kinds.accident.weight, 'вес вида перенесён');
  ok(it.id.includes('accident') && it.id.includes('1234'), 'у заметки есть ключ');
  const twin = makeItem('accident', 1234, 'Валград', { name: 'удар сзади', min: 12, tag: 'v7' });
  ok(twin.id === it.id && twin.text === it.text, 'одно событие — одна заметка');
  const other = makeItem('accident', 1234, 'Валград', { name: 'удар сзади', min: 12, tag: 'v8' });
  ok(other.id !== it.id, 'другое событие — другой ключ');
  ok(makeItem('нет', 1, '—') === null, 'неизвестный вид не рождает заметку');
  ok(it.text.length < 140, 'заголовок короткий');
  ok(typeof it.text === 'string' && it.text.trim() === it.text, 'в тексте нет лишних пробелов по краям');
  ok(makeItem('weather', 5, 'А', { kind: 'снег' }).text.includes('снег'), 'погода в тексте названа');
  ok(makeItem('mayor', 6, 'Б', { action: 'парк' }).text.includes('парк'), 'решение мэра названо');
  ok(makeItem('growth', 7, 'В', { what: 'дома' }).text.includes('дома'), 'стройка названа');
  ok(makeItem('traffic', 8, 'Г', { km: 2.5 }).text.includes('2.5'), 'затор в километрах');
  ok(makeItem('accident', 9, 'Д', { name: 'съезд', min: 7 }).where === 'Д', 'место сохраняется');
  ok(makeItem('weather', 10, null, { kind: 'дождь' }).where === '—', 'без места — прочерк');
}

/* 3. F-273/F-274: лента */
{
  const a = makeItem('accident', 100, 'Валград', { name: 'удар', min: 8, tag: 'a' });
  const b = makeItem('weather', 120, 'Речск', { kind: 'туман', vis: '2.1', grip: 82, wind: 12, tag: 'w' });
  const c = makeItem('mayor', 110, 'Камхейм', { action: 'парк', tag: 'm' });
  const feed = mergeNews([], [a, b, c]);
  ok(feed.length === 3, 'все три заметки в ленте');
  ok(feed[0].at >= feed[1].at && feed[1].at >= feed[2].at, 'свежее сверху');
  ok(feed[0].kind === 'weather', 'самая свежая — погода');
  const dup = mergeNews(feed, [makeItem('accident', 101, 'Валград', { name: 'удар', min: 8, tag: 'a' })]);
  ok(dup.length === 3, 'дубль того же события в пятиминутке склеен: ' + dup.length);
  const later = mergeNews(feed, [makeItem('accident', 140, 'Валград', { name: 'удар', min: 8, tag: 'a' })]);
  ok(later.length === 4, 'через полчаса то же событие — уже новое');
  ok(mergeNews([], []).length === 0, 'пустые списки — пустая лента');
  ok(mergeNews().length === 0, 'без аргументов лента пуста');
  ok(mergeNews(feed, [null, feed[0]]).length === 3, 'тот же объект второй раз не дублируется');
  ok(feed.every((it) => typeof it.at === 'number'), 'у всех заметок время числом');
  ok(feed.length < NEWS.max, 'короткая лента не добивается до предела');
  ok(mergeNews([null, undefined, a]).length === 1, 'мусор в ленту не попадает');
  const many = [];
  for (let i = 0; i < 100; i++) many.push(makeItem('traffic', i * 30, 'Т' + i, { km: i, tag: 'x' + i }));
  ok(mergeNews([], many).length === NEWS.max, 'лента не длиннее 40');
  ok(trimNews(feed, 120).length === 3, 'свежие заметки остаются');
  ok(trimNews(feed, 120 + 3 * 1440 + 1).length === 0, 'через трое суток лента пустеет');
  ok(trimNews([], 0).length === 0, 'пустая лента чистится без ошибок');
  const tied = [makeItem('growth', 200, 'А', { what: 'дом', tag: '1' }), makeItem('accident', 200, 'Б', { name: 'удар', min: 5, tag: '2' })];
  ok(mergeNews([], tied)[0].weight >= mergeNews([], tied)[1].weight, 'при равном времени выше важное');
}

/* 4. F-275/F-278: сводка и время */
{
  const feed = [
    makeItem('accident', 100, 'Валград', { name: 'удар', min: 8, tag: 'a' }),
    makeItem('accident', 200, 'Речск', { name: 'съезд', min: 10, tag: 'b' }),
    makeItem('weather', 300, 'Валград', { kind: 'снег', vis: '1.2', grip: 56, wind: 30, tag: 'w' })
  ];
  const s = newsStats(feed);
  ok(s.count === 3, 'сводка считает заметки');
  ok(s.accidents === 2, 'две аварии');
  ok(s.weather === 1, 'одна погода');
  ok(s.towns === 2, 'два города');
  ok(s.newest.at === 300, 'самая свежая — 300-я минута');
  ok(s.byKind.growth === 0, 'чего не было — нуль');
  ok(newsStats([]).count === 0 && newsStats([]).newest === null, 'пустая сводка пуста');
  ok(s.byKind.accident === 2 && s.byKind.weather === 1, 'разбивка по видам верна');
  ok(Object.keys(s.byKind).length === 6, 'в разбивке все шесть видов');
  ok(newsStats(feed).towns === s.towns, 'города считаются одинаково');
  ok(newsTime({ at: 60 }) === 'день 1 · 01:00', 'час ночи первого дня');
  ok(newsTime({ at: 2 * 1440 + 1 }) === 'день 3 · 00:01', 'первая минута третьего дня');
  ok(newsTime({ at: 7 * 1440 }) === 'день 8 · 00:00', 'начало восьмого дня');
  ok(newsTime({ at: 1440 }) === 'день 2 · 00:00', 'полночь второго дня');
  ok(newsTime({ at: 0 }) === 'день 1 · 00:00', 'начало игры');
  ok(newsTime({ at: 8 * 60 + 5 }) === 'день 1 · 08:05', 'утро с минутами');
  ok(newsTime({ at: 1439 }) === 'день 1 · 23:59', 'последняя минута дня');
  ok(newsTime(null) === '—', 'без времени — прочерк');
  ok(newsTime({ at: 3 * 1440 + 725 }) === 'день 4 · 12:05', 'четвёртый день, полдень');
}

/* 5. F-276/F-277: сборка из событий */
{
  const items = newsFromEvents({
    accidents: [{ name: 'удар сзади', at: 100, minutes: 9, where: 'Валград' }],
    wx: [{ kind: 'rain', at: 110, where: 'Речск', visibilityKm: 4.2, grip: 0.82, windKmh: 36 }],
    mayors: [{ where: 'Камхейм', action: 'школа', at: 120 }],
    growth: [{ where: 'Камхейм', what: 'новые дома', at: 130 }],
    traffic: [{ where: 'Речск', km: 1.4, at: 140 }]
  });
  ok(items.length === 5, 'пять событий — пять заметок');
  const kinds = items.map((i) => i.kind);
  ok(kinds.includes('accident') && kinds.includes('weather'), 'есть авария и погода');
  ok(kinds.includes('mayor') && kinds.includes('growth') && kinds.includes('traffic'), 'есть город, стройка и дорога');
  const w = items.find((i) => i.kind === 'weather');
  ok(w.where === 'Речск', 'погода — в Речске');
  ok(/дождь/.test(w.text), 'дождь назван по-русски');
  ok(!/rain/.test(w.text), 'английских слов в газете нет');
  const t = items.find((i) => i.kind === 'traffic');
  ok(t.text.includes('1.4'), 'в заметке о заторе есть километры');
  const empty = newsFromEvents({});
  ok(empty.length === 0, 'нет событий — нет заметок');
  ok(newsFromEvents().length === 0, 'без аргументов тоже пусто');
  ok(newsFromEvents({ accidents: [] }).length === 0, 'пустой список аварий — тишина');
  ok(newsFromEvents({ wx: [{ kind: 'fog', at: 5, where: 'А', visibilityKm: 1, grip: 0.88, windKmh: 3 }] })
    .every((i) => i.kind === 'weather'), 'погода даёт только погоду');
  ok(items.every((i) => i.at >= 100 && i.at <= 140), 'время событий сохранено');
  ok(items.every((i) => i.where && i.where !== '—'), 'у всех событий есть место');
  ok(newsFromEvents({ mayors: [{ where: 'А', action: 'школа', at: 3 }] }).length === 1, 'одно решение — одна заметка');
  const limited = newsFromEvents({
    accidents: Array.from({ length: 20 }, (_, i) => ({ name: 'удар', at: i, minutes: 5, where: 'Т' + i }))
  });
  ok(limited.length <= NEWS.freshPerHour, 'за час берём не больше четырёх: ' + limited.length);
  ok(weatherWord('fog') === 'туман' && weatherWord('snow') === 'снег', 'погода переводится');
  ok(weatherWord('clear') === 'ясно' && weatherWord('cloudy') === 'облачно', 'ясно и облачно переведены');
  ok(weatherWord(undefined) === '—', 'без вида — прочерк');
  const feed = mergeNews([], items);
  ok(feed.length === 5 && feed[0].at === 140, 'лента из событий отсортирована');
}

/* 6. Газета не выдумывает: одна и та же сцена — одни и те же слова */
{
  const scene = () => ({
    accidents: [{ name: 'боковой', at: 500, minutes: 12, where: 'Валград' }],
    wx: [{ kind: 'snow', at: 505, where: 'Валград', visibilityKm: 1.1, grip: 0.56, windKmh: 44 }],
    mayors: [{ where: 'Валград', action: 'park', at: 510 }]
  });
  const a = mergeNews([], newsFromEvents(scene()));
  const b = mergeNews([], newsFromEvents(scene()));
  ok(JSON.stringify(a) === JSON.stringify(b), 'та же сцена — те же заметки');
  ok(a.length === 3, 'три заметки на сцену');
  ok(a.every((i) => i.text.length > 10), 'все заметки не короче десяти символов');
  ok(a.every((i) => i.where === 'Валград'), 'все про Валград');
  ok(a.every((i) => typeof i.at === 'number'), 'у всех есть время');
  ok(a.every((i) => i.text.length < 120), 'заголовок короткий');
  const texts = new Set(a.map((i) => i.text));
  ok(texts.size === 3, 'заголовки не повторяются');
  const other = mergeNews([], newsFromEvents({ accidents: [{ name: 'боковой', at: 500, minutes: 12, where: 'Речск' }] }));
  ok(other[0].text !== a[0].text, 'другой город — другой заголовок');
  ok(NEWS.kinds.accident.weight > NEWS.kinds.record.weight, 'происшествие важнее рекорда');
  ok(a[0].id !== b[1].id, 'заметки разных видов не слипаются');
  ok(a.every((i) => !/\{/.test(i.text)), 'дырок нет ни в одной заметке');
  ok(a.every((i) => i.at >= 500 && i.at <= 510), 'время в пределах сцены');
  ok(mergeNews(a, newsFromEvents(scene())).length === 3, 'повторный сбор сцены не удваивает ленту');
  const long = mergeNews([], Array.from({ length: 60 }, (_, i) => makeItem('mayor', i * 40, 'Т' + i, { action: 'парк', tag: 't' + i })));
  ok(long.length === NEWS.max, 'длинная сцена обрезается до 40');
  ok(long[0].at === 59 * 40, 'сверху самая свежая');
}

console.log('OK: 6 групп проверок газеты §82 (F-269…F-278, проверок ' + checks + ')');
