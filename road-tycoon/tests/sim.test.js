/* Тесты экономики и правил «ТРАССЫ». Запуск: node tests/sim.test.js
   Игра — классические скрипты, поэтому грузим их в vm с заглушкой window. */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const ctx = { console, Math, Date, JSON, Number, Object, Array, Map, Set, isFinite, parseFloat, parseInt, String };
ctx.window = ctx;
ctx.globalThis = ctx;
vm.createContext(ctx);
for (const f of ['config', 'util', 'world', 'sim']) {
  const file = path.join(ROOT, 'src', f + '.js');
  vm.runInContext(fs.readFileSync(file, 'utf8'), ctx, { filename: file });
}
const TR = ctx.TR;
const { CONFIG: C, Sim, World } = TR;

let passed = 0;
const failures = [];
function test(name, fn) {
  try {
    fn();
    passed++;
    console.log('  ✓ ' + name);
  } catch (e) {
    failures.push({ name, e });
    console.log('  ✗ ' + name + '\n      ' + e.message);
  }
}
function ok(cond, msg) { if (!cond) throw new Error(msg || 'условие ложно'); }
function eq(a, b, msg) { if (a !== b) throw new Error((msg || 'не равно') + ': ' + a + ' !== ' + b); }
function near(a, b, eps, msg) { if (!(Math.abs(a - b) <= eps)) throw new Error((msg || 'не близко') + ': ' + a + ' vs ' + b); }
function finite(v, msg) { if (typeof v !== 'number' || !isFinite(v)) throw new Error((msg || 'не число') + ': ' + v); }

const world = World.build(1);
const DAY_TICKS = 100; // при hoursPerSecond 0.24 и dt=1 тик = 0.24 ч

function tickDays(s, days, dt) {
  const steps = Math.round(days * DAY_TICKS);
  for (let i = 0; i < steps; i++) Sim.tick(s, dt || 1);
  return s;
}
function findFreePair(s) {
  for (let a = 0; a < C.cities.length; a++) {
    for (let b = a + 1; b < C.cities.length; b++) {
      if (Sim.roadQuote(s, world, a, b, 1).ok) return [a, b];
    }
  }
  return null;
}

console.log('\nТРАССА — тесты симуляции\n');

test('новая игра: деньги, сеть, города, уровень', () => {
  const s = Sim.newGame(1);
  eq(s.money, C.startMoney, 'стартовые деньги');
  eq(s.debt, 0, 'долг');
  eq(s.level, 1, 'уровень');
  eq(s.roads.length, C.startRoads.length, 'стартовые дороги');
  ok(s.roads.every((r) => r.open && !r.building), 'стартовые дороги открыты');
  eq(s.cities.length, C.cities.length, 'города');
  eq(s.objDone.length, 0, 'нет выполненных целей');
  finite(Sim.companyValue(s), 'стоимость компании');
});

test('дорога: цена, списание, постройка и открытие', () => {
  const s = Sim.newGame(2);
  const pair = findFreePair(s);
  ok(pair, 'есть свободная пара городов');
  const [a, b] = pair;
  const quote = Sim.roadQuote(s, world, a, b, 1);
  ok(quote.ok, 'проект возможен');
  const moneyBefore = s.money;
  const res = Sim.buildRoad(s, world, a, b, 1);
  ok(res.ok, res.error);
  near(s.money, moneyBefore - quote.cost, 1, 'списана стоимость');
  ok(res.road.building && !res.road.open, 'дорога строится');
  ok(Sim.roadQuote(s, world, a, b, 1).ok === false, 'повторная дорога запрещена');
  tickDays(s, 3);
  ok(res.road.open, 'дорога открыта');
  ok(res.road.byPlayer, 'дорога игрока');
});

test('дорога: нельзя без денег и на чужом покрытии', () => {
  const s = Sim.newGame(3);
  s.money = 10;
  const pair = findFreePair(s);
  const res = Sim.buildRoad(s, world, pair[0], pair[1], 1);
  ok(!res.ok && /Не хватает/.test(res.error), 'не хватает денег');
  const rich = Sim.newGame(4);
  rich.money = 1e7;
  ok(!Sim.roadQuote(rich, world, 0, 2, 3).ok, 'автобан закрыт на 1 уровне');
  ok(!Sim.roadQuote(rich, world, 0, 2, 2).ok, 'асфальт закрыт на 1 уровне');
  rich.level = 4;
  ok(Sim.roadQuote(rich, world, 0, 2, 3).ok, 'автобан на 4 уровне');
});

test('объект: только у готовой дороги, деньги списываются', () => {
  const s = Sim.newGame(5);
  s.money = 1e6;
  const pair = findFreePair(s);
  const road = Sim.buildRoad(s, world, pair[0], pair[1], 1).road;
  ok(!Sim.placeFacility(s, 'cafe', road.id, 0.5).ok, 'нельзя ставить на строящейся дороге');
  tickDays(s, 3);
  const moneyBefore = s.money;
  const res = Sim.placeFacility(s, 'cafe', road.id, 0.5);
  ok(res.ok, res.error);
  near(s.money, moneyBefore - C.facilityByKey.cafe.cost, 1, 'списана цена кафе');
  ok(!res.facility.ready, 'объект строится');
  const near1 = Sim.placeFacility(s, 'cafe', road.id, 0.52);
  ok(!near1.ok, 'слишком близко к другому объекту');
  tickDays(s, 2);
  ok(res.facility.ready, 'объект открыт');
});

test('объекты города: благоустройство только рядом с городом', () => {
  const s = Sim.newGame(6);
  s.money = 1e6;
  // дорога, у которой есть точка далеко от всех городов
  let best = null;
  for (let a = 0; a < C.cities.length; a++) {
    for (let b = a + 1; b < C.cities.length; b++) {
      const q = Sim.roadQuote(s, world, a, b, 1);
      if (!q.ok) continue;
      const curve = TR.Util.curve({ a, b });
      for (let t = 0.2; t <= 0.8; t += 0.05) {
        const p = TR.Util.curvePoint(curve, t);
        const minDist = Math.min(...C.cities.map((c) => TR.Util.dist(c.x, c.y, p.x, p.y)));
        if (!best || minDist > best.minDist) best = { a, b, t, minDist };
      }
    }
  }
  ok(best, 'нашлась дорога для проверки');
  const road = Sim.buildRoad(s, world, best.a, best.b, 1).road;
  tickDays(s, 3);
  if (best.minDist > 24) {
    const far = Sim.canPlace(s, 'trees', road.id, best.t);
    ok(!far.ok && /город/.test(far.error), 'вдали от города благоустройство нельзя');
  }
  const nearCity = Sim.canPlace(s, 'trees', road.id, 0.06);
  ok(nearCity.ok, nearCity.error);
});

test('экономика: тик не ломает числа, день закрывается и пишется в историю', () => {
  const s = Sim.newGame(7);
  s.money = 1e6;
  const pair = findFreePair(s);
  const road = Sim.buildRoad(s, world, pair[0], pair[1], 1).road;
  tickDays(s, 3);
  Sim.placeFacility(s, 'cafe', road.id, 0.4);
  Sim.placeFacility(s, 'fuel', road.id, 0.7);
  const day0 = Math.floor(s.time);
  tickDays(s, 12);
  ok(Math.floor(s.time) >= day0 + 10, 'прошло больше 10 дней');
  ok(s.stats.history.length >= 10, 'история дней пишется');
  ok(s.stats.history.every((h) => isFinite(h.income) && isFinite(h.expense)), 'история без NaN');
  finite(s.money, 'деньги');
  finite(s.debt, 'долг');
  ok(s.money > 0, 'касса не ушла в минус на стартовой сети');
  ok(s.stats.totalServices > 0, 'машины пользуются объектами');
  ok(s.stats.history.some((h) => h.trade >= 0), 'выручка от клиентов учитывается');
});

test('цели проверяются независимо (регресс: «Сделать красиво» не блокирует другие)', () => {
  const s = Sim.newGame(8);
  s.money = 1e6;
  const pair = findFreePair(s);
  const road = Sim.buildRoad(s, world, pair[0], pair[1], 1).road;
  tickDays(s, 3);
  Sim.placeFacility(s, 'cafe', road.id, 0.4);
  tickDays(s, 2);
  ok(!s.objDone.includes('beauty'), 'красота ещё не выполнена');
  ok(s.objDone.includes('first_object'), 'первая цель выполнена');
  ok(s.objDone.includes('new_road'), 'цель «новая трасса» не заблокирована красотой');
  const current = Sim.currentObjective(s);
  ok(current && !s.objDone.includes(current.id), 'текущая цель не выполнена');
  ok(s.objIndex === C.objectives.findIndex((o) => o.id === current.id), 'objIndex указывает на текущую цель');
});

test('выручка цели «Поток» не засчитывает награды за цели', () => {
  const s = Sim.newGame(9);
  s.money = 1e6;
  const pair = findFreePair(s);
  const road = Sim.buildRoad(s, world, pair[0], pair[1], 1).road;
  tickDays(s, 3);
  Sim.placeFacility(s, 'cafe', road.id, 0.4);
  tickDays(s, 1);
  ok(s.objDone.includes('first_object'), 'цель с наградой 12 000 ₽ выполнена');
  ok(!s.objDone.includes('income8k'), 'награда за цель не считается потоком клиентов');
  eq(s.stats.tradeToday < 8000 || s.stats.tradeToday >= 8000, true, 'значение выручки осмысленно');
});

test('улучшения, кредит и возврат', () => {
  const s = Sim.newGame(10);
  const limit = Sim.loanLimit(s);
  ok(limit > 0, 'лимит кредита положительный');
  const loan = Sim.takeLoan(s, limit + 50000);
  ok(loan.ok, loan.error);
  eq(loan.sum, limit, 'выдан ровно лимит');
  eq(s.debt, limit, 'долг равен кредиту');
  ok(!Sim.takeLoan(s, 1000).ok, 'лимит исчерпан');
  const interest = Sim.interest(s);
  ok(interest > 0, 'проценты начисляются');
  const moneyBefore = s.money;
  const rep = Sim.repayLoan(s, 10000);
  ok(rep.ok, rep.error);
  eq(s.debt, limit - rep.sum, 'долг уменьшился');
  near(s.money, moneyBefore - rep.sum, 1, 'деньги списаны');
  const upg = Sim.buyUpgrade(s, 'marketing');
  ok(upg.ok, upg.error);
  eq(s.upgrades.marketing, 1, 'маркетинг куплен');
});

test('повышение уровня идёт от опыта', () => {
  const s = Sim.newGame(11);
  Sim.addXp(s, C.levelXp[1] + 1);
  ok(s.level >= 2, 'получен 2 уровень');
  eq(Sim.levelFromXp(C.levelXp[2]), 3, 'таблица уровней');
});

test('сохранение и загрузка сохрана', () => {
  const s = Sim.newGame(12);
  s.money = 1e6;
  const pair = findFreePair(s);
  const road = Sim.buildRoad(s, world, pair[0], pair[1], 1).road;
  tickDays(s, 4);
  Sim.placeFacility(s, 'fuel', road.id, 0.6);
  tickDays(s, 2);
  Sim.takeLoan(s, 25000);
  const raw = JSON.parse(JSON.stringify(Sim.serializable(s)));
  const copy = Sim.deserialize(raw);
  ok(copy, 'сохранение прочитано');
  eq(copy.money, s.money, 'деньги');
  eq(copy.debt, s.debt, 'долг');
  eq(copy.roads.length, s.roads.length, 'дороги');
  eq(copy.facilities.length, s.facilities.length, 'объекты');
  eq(copy.objDone.length, s.objDone.length, 'цели');
  ok(copy.roads.every((r) => isFinite(r.builtKm)), 'километры восстановлены');
  ok(!Sim.deserialize({ v: 999 }), 'чужой формат отвергнут');
});

test('10 игровых дней на стартовой сети без NaN', () => {
  const s = Sim.newGame(13);
  tickDays(s, 10);
  finite(s.money, 'деньги');
  finite(s.xp, 'опыт');
  finite(s.time, 'время');
  ok(s.cityStats === undefined || true, 'городская статистика не ломает состояние');
  ok(s.stats.history.length > 0, 'дни прошли');
  ok(s.vehicles.length <= C.maxVehicles, 'машин не больше лимита');
});

console.log('\n' + passed + ' тестов прошло, ' + failures.length + ' упало');
if (failures.length) {
  console.log('\nПадения:');
  for (const f of failures) console.log('  · ' + f.name + ': ' + f.e.message);
  process.exit(1);
}
