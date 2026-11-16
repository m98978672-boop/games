/* Проверки автономной жизни §98 и кэшей §98 (F-218…F-220): пока окна нет, страна живёт
   числами; ничего из нарисованного не меняется от кэшей.
   Запуск: node tests/offline2d.mjs */
import assert from 'node:assert/strict';
import {
  OFFLINE, snapshot, saveTo, loadFrom, elapsedMinutes, catchUp, formatReport, hiddenTick
} from '../src/offline2d.js';
import { buildMayors, advanceMayors } from '../src/ai2d.js';
import { buildGrowth, applyGrowth, growthStats } from '../src/growth2d.js';
import { buildCity } from '../src/city2d.js';
import { settlements, rankSettlements } from '../src/world2d.js';
import { buildPedestrians, advancePeds, pedPositions } from '../src/ped2d.js';
import { buildPlay, stepPlay, playStats } from '../src/play2d.js';

let checks = 0;
const ok = (cond, msg) => { assert.ok(cond, msg); checks++; };
globalThis.window = globalThis.window || { addEventListener() {} };

const towns = settlements();
const ranks = rankSettlements(towns, 10);

function fakeStorage() {
  const m = new Map();
  return {
    setItem: (k, v) => m.set(k, String(v)),
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    removeItem: (k) => m.delete(k),
    _m: m
  };
}

/* F-218: сколько времени прошло без нас */
{
  const base = 1_700_000_000_000;
  const snap = { v: 1, savedAt: base, minutes: 8 * 60, day: 0 };
  ok(elapsedMinutes(null).minutes === 0, 'без сейва догонять нечего');
  ok(elapsedMinutes(snap, base + 10_000).minutes === 0, 'короче 45 с — не отсутствие');
  ok(elapsedMinutes(snap, base + 60_000).minutes === 6 * 60, 'минута реального времени — 6 игровых часов');
  for (let i = 1; i <= 20; i++) {
    const realSec = i * 60;
    const r = elapsedMinutes(snap, base + realSec * 1000);
    ok(Math.abs(r.minutes - realSec * OFFLINE.gameMinPerRealSec) < 1e-6, 'F-120: ' + realSec + ' с → ' + r.minutes + ' мин');
    ok(r.days === Math.floor(r.minutes / 1440), 'дни считаются от минут');
  }
  const capped = elapsedMinutes(snap, base + 30 * 24 * 3600 * 1000);
  ok(capped.minutes === OFFLINE.maxDays * 1440, 'дальше 14 дней не догоняем: ' + capped.minutes);
  ok(capped.capped === true, 'флаг упора выставлен');
  ok(elapsedMinutes(snap, base + 600_000, { maxDays: 1 }).minutes === 1440, 'предел задаётся снаружи');
  ok(elapsedMinutes(snap, base + 10 * 3600 * 1000).minutes > 0, 'через 10 часов мир жил');
  ok(elapsedMinutes(snap, base + 10 * 3600 * 1000).days >= 2, 'и это уже пара дней');
  ok(elapsedMinutes(snap, base - 5000).minutes === 0, 'часы назад — не догоняем');
}

/* Сейв: сотня байт, версия, приватный режим */
{
  const storage = fakeStorage();
  const transport = { minutes: 3 * 1440 + 620 };
  const snap = saveTo(storage, transport);
  ok(snap && snap.minutes === transport.minutes, 'сейв взял игровые минуты');
  ok(snap.day === 3, 'и день посчитал');
  ok(JSON.stringify(snap).length < 200, 'сейв крошечный: ' + JSON.stringify(snap).length + ' байт');
  const back = loadFrom(storage);
  ok(back && back.minutes === transport.minutes, 'сейв читается');
  ok(loadFrom(fakeStorage()) === null, 'пустое хранилище — нет сейва');
  storage.setItem(OFFLINE.key, '{"v":0,"savedAt":1,"minutes":1}');
  ok(loadFrom(storage) === null, 'старая версия сейва не подходит');
  storage.setItem(OFFLINE.key, 'не json');
  ok(loadFrom(storage) === null, 'битый сейв не роняет игру');
  storage.setItem(OFFLINE.key, '{"v":1,"savedAt":null,"minutes":1}');
  ok(loadFrom(storage) === null, 'сейв без времени не годится');
  ok(saveTo(null, transport) === null, 'без хранилища просто молчим');
  const throwing = { setItem() { throw new Error('private'); }, getItem() { return null; } };
  ok(saveTo(throwing, transport) && saveTo(throwing, transport).minutes === transport.minutes, 'приватный режим не ломает игру');
  ok(snapshot(transport, 1000).savedAt === 1000, 'время сейва записывается');
  ok(snapshot(null).minutes === 8 * 60, 'без транспорта — стартовые 8:00');
  ok(OFFLINE.autosaveSec > 0 && OFFLINE.hiddenTickSec > 0, 'периоды заданы');
}

/* F-219: догон числами — без кадров, но с решениями и стройкой */
{
  const transport = { minutes: 1440 + 60 };
  const economy = { population: 100, days: 0 };
  const mayors = buildMayors(towns, ranks);
  const city = buildCity(towns[0], 0, ranks);
  const growths = new Map();
  const journal = [];
  const applyG = (index, action) => {
    if (!growths.has(index)) {
      const r = 1 + (index % 5) * 0.4;
      growths.set(index, buildGrowth(towns[index], null, r));
    }
    return applyGrowth(growths.get(index), action, index + growths.size, 3);
  };
  const state = {
    transport,
    economy,
    advanceEconomy: (e, d) => { e.days += d; },
    mayors,
    journal,
    advanceMayors,
    applyGrowth: applyG
  };
  const before = transport.minutes;
  const rep = catchUp(state, 7);
  ok(rep.days === 7, 'семь дней прожито');
  ok(rep.minutes === 7 * 1440, 'минуты догнаны');
  ok(transport.minutes === before + 7 * 1440, 'часы мира сдвинулись');
  ok(economy.days === 7, 'экономика шагнула на неделю');
  ok(rep.decisions > 0, 'мэры решали: ' + rep.decisions);
  ok(rep.houses > 0, 'дома выросли: ' + rep.houses);
  ok(growths.size > 10, 'застройка появилась в десятках городов: ' + growths.size);
  ok(journal.length > 0 && journal.length <= 40, 'журнал «почему» заполнен');
  ok(rep.ms >= 0 && rep.ms < 500, 'догон быстрый: ' + rep.ms + ' мс');
  ok(rep.days <= OFFLINE.maxDays, 'предел соблюдён');
  const rep2 = catchUp(state, 0);
  ok(rep2.days === 0 && rep2.decisions === 0, 'нулевой догон ничего не делает');
  const repCapped = catchUp({ transport: { minutes: 0 } }, 99);
  ok(repCapped.days === OFFLINE.maxDays, 'больше предела не считаем: ' + repCapped.days);
  ok(catchUp({}, 3).days === 3, 'без систем догон не падает');
  ok(formatReport(rep).includes('+7 дней'), 'в отчёте есть срок');
  ok(formatReport(rep).includes('решений ' + rep.decisions), 'в отчёте есть решения');
  ok(formatReport({ days: 1, decisions: 2 }).includes('+1 день'), 'один день — «день»');
  ok(formatReport({ days: 3 }).includes('+3 дня'), 'три дня — «дня»');
  ok(formatReport({ days: 9 }).includes('+9 дней'), 'девять — «дней»');
  ok(formatReport(null) === '', 'пустой отчёт — пустая строка');
  ok(hiddenTick() === OFFLINE.hiddenTickSec, 'скрытый тик — секунда');
  ok(hiddenTick(10) === 5, 'скрытый тик не больше 5 с');
  ok(hiddenTick(-1) === 0, 'отрицательный тик зажат');
  // детерминизм догона: тот же сид и те же дни — те же решения
  const mk = () => {
    const m = buildMayors(towns, ranks);
    const j = [];
    catchUp({ transport: { minutes: 0 }, mayors: m, journal: j, advanceMayors, economy: null }, 5);
    return JSON.stringify(j.slice(0, 5));
  };
  ok(mk() === mk(), 'догон детерминирован');
  ok(!globalThis.__catchUpReport, 'глобальных переменных не завели');
}

/* §98: кэши ничего не меняют */
{
  const city = buildCity(towns[0], 0, ranks);
  const pack = buildPedestrians(city, 0);
  const fresh = pedPositions(pack);
  const cached = pedPositions(pack);
  ok(fresh === cached, 'вторая выборка — тот же массив');
  ok(cached.length === pack.peds.length, 'и то же число точек');
  advancePeds(pack, 0.5);
  const after = pedPositions(pack);
  ok(after !== cached, 'после шага кэш сброшен');
  ok(after.length === fresh.length, 'число пешеходов не изменилось');
  ok(after.some((p, i) => Math.abs(p.x - fresh[i].x) > 1e-9), 'и точки сдвинулись');

  const play = buildPlay(424242);
  stepPlay(play, 0.1);
  const s1 = playStats(play);
  const s2 = playStats(play);
  ok(s1 === s2, 'статистика полигона кэшируется');
  stepPlay(play, 0.1);
  ok(playStats(play) !== s1, 'после шага — пересчёт');
  ok(playStats(play).passed === s1.passed || playStats(play).passed >= s1.passed, 'счёт не уменьшается');

  const g = buildGrowth(towns[0], city);
  const first = growthStats(g, 5);
  ok(g.statsCache && g.statsCache.key, 'кэш сводки появляется после первого вызова');
  ok(g.statsCache.stats === first, 'в кэше тот же объект');
  ok(growthStats(g, 5) === first, 'второй вызов не пересчитывает');
  applyGrowth(g, 'housing', 1, 5);
  const afterHouse = growthStats(g, 5);
  ok(afterHouse !== first, 'после решения сводка пересчитана');
  ok(afterHouse.houses === g.houses.length, 'данные сводки верные');
  ok(growthStats(g, 6) !== afterHouse, 'смена дня тоже сбрасывает кэш');
}

console.log('OK: 4 группы проверок автономной жизни и кэшей (F-218…F-220, проверок ' + checks + ')');
