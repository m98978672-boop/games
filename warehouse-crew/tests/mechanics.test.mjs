// Проверки механик склада: досягаемость коробки, фуры, травмы и правила.
// Гоняют ту же логику, что и игра: src/sim/*.js — без DOM и Three.js.
//
// Запуск:  node warehouse-crew/tests/mechanics.test.mjs
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');

const Model = require(path.join(root, 'src/sim/model.js'));
const Wh = require(path.join(root, 'src/sim/warehouse.js'));
const WorkerMod = require(path.join(root, 'src/sim/worker.js'));
const Brain = require(path.join(root, 'src/ai/brain-net.js'));

let failures = 0;
let checks = 0;
function check(ok, label, extra) {
  checks += 1;
  if (ok) {
    console.log('  ✓ ' + label);
  } else {
    failures += 1;
    console.log('  ✗ ' + label + (extra ? ' — ' + JSON.stringify(extra) : ''));
  }
}

const CREW = [
  {
    id: 'marta', name: 'Марта', role: 'Кладовщик',
    traits: { endurance: 0.84, strength: 0.56, precision: 0.8, caution: 0.72, paceTrait: 0.56, neuroticism: 0.28, recovery: 0.72, coop: 0.78 },
    overrides: { energy: 0.86, sleepDebt: 0.12 },
  },
  {
    id: 'grisha', name: 'Гриша', role: 'Грузчик',
    traits: { endurance: 0.58, strength: 0.92, precision: 0.48, caution: 0.36, paceTrait: 0.88, neuroticism: 0.58, recovery: 0.48, coop: 0.42 },
    overrides: { energy: 0.92, sleepDebt: 0.3 },
  },
  {
    id: 'timur', name: 'Тимур', role: 'Комплектовщик',
    traits: { endurance: 0.66, strength: 0.63, precision: 0.88, caution: 0.66, paceTrait: 0.5, neuroticism: 0.22, recovery: 0.6, coop: 0.9 },
    overrides: { energy: 0.78, sleepDebt: 0.18 },
  },
];

function makeRng(seed) {
  let s = (seed >>> 0) || 1;
  const next = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return { next, range: (a, b) => a + (b - a) * next(), gauss: () => 0 };
}

function makeWorld(options = {}) {
  const warehouse = Wh.createWarehouse(Object.assign({
    seed: 4242, shiftLength: 600, spawnEvery: 12, maxPending: 9, firstSpawnDelay: 3,
  }, options));
  const workers = CREW.map((member, i) => WorkerMod.createWorker({
    id: member.id, name: member.name, role: member.role,
    traits: member.traits, overrides: member.overrides,
    model: Model, layout: warehouse.layout, spawn: warehouse.layout.spawns[i], heading: 0,
  }));
  const brain = JSON.parse(readFileSync(path.join(root, 'data/brain_weights.json'), 'utf8'));
  const envs = {};
  workers.forEach((w) => {
    envs[w.id] = { warehouse, workers, brain, brainApi: Brain, rng: makeRng(99 + w.id.length) };
  });
  return { warehouse, workers, envs };
}

// ------------------------------------------------------------------ 1. досягаемость
console.log('Досягаемость коробки');
{
  const { warehouse, workers, envs } = makeWorld();
  const worker = workers[0];
  const order = warehouse.spawnOrder();
  check(Boolean(order), 'заказ на приёмке создан');
  // Ставим рабочего в 3 метра от коробки и просим взять: тянуться «резиновой рукой» нельзя
  worker.state.pos.x = order.x + 3.0;
  worker.state.pos.y = order.y;
  worker.command('pick', warehouse, { orderId: order.id });
  const samples = [];
  let took = null;
  for (let i = 0; i < 300 && !took; i += 1) {
    worker.update(0.1, envs[worker.id]);
    samples.push(Math.hypot(order.x - worker.state.pos.x, order.y - worker.state.pos.y));
    if (worker.state.carryingId) took = { distance: samples[samples.length - 1] };
  }
  check(Boolean(took), 'рабочий всё-таки взял коробку (дошёл)', { tried: samples.length });
  check(took && took.distance <= 1.6, 'взял вплотную, а не с двух метров', { distance: took && Number(took.distance.toFixed(2)) });
  check(!samples.some((d) => d > 3.2 && d < 2.0), 'дистанция уменьшалась плавно, без телепорта');
}

// ------------------------------------------------------------------ 2. фуры
console.log('Фуры: разгрузка и загрузка');
{
  // Автоматические фуры отключаем: доки нужны под ручные проверки
  const { warehouse, workers, envs } = makeWorld({ firstTruckDelay: 9999, truckEvery: 9999 });
  const truck = warehouse.spawnTruck('unload');
  check(Boolean(truck), 'фура на разгрузку приехала');
  const inbound = warehouse.ordersOfTruck(truck);
  check(inbound.length >= 3, 'из фуры выгружается несколько мест', { n: inbound.length });
  check(inbound.every((o) => o.direction === 'in' && o.stand), 'у коробок из фуры есть точка подхода у борта');
  check(inbound.every((o) => Math.hypot(o.stand.x - o.x, o.stand.y - o.y) <= 1.45), 'точка подхода в пределах вытянутой руки');

  // Дадим бригаде поработать: часть коробок должна уехать на стеллажи
  for (let t = 0; t < 240; t += 0.1) {
    warehouse.step(0.1);
    workers.forEach((w) => w.update(0.1, envs[w.id]));
  }
  const storedFromTruck = warehouse.state.orders.filter((o) => o.truckId === truck.id && o.status === 'stored').length;
  check(storedFromTruck > 0, 'коробки из фуры разложены по стеллажам', { n: storedFromTruck });
  check(warehouse.state.stats.unloaded >= inbound.length, 'статистика разгрузки считается');

  // Загрузка: берём то, что уже лежит на полке
  const stored = warehouse.state.orders.filter((o) => o.status === 'stored');
  check(stored.length >= 1, 'есть что грузить в обратный рейс', { n: stored.length });
  const loading = warehouse.spawnTruck('load');
  check(Boolean(loading), 'фура на загрузку приехала');
  const outbound = warehouse.ordersOfTruck(loading);
  check(outbound.length >= 1 && outbound.every((o) => o.direction === 'out'), 'загрузка собирается из стеллажей', { n: outbound.length });
  const points = warehouse.loadTruck(outbound[0], 'timur');
  check(points.points > 0, 'за погрузку дают очки', { points: points.points });
  check(warehouse.state.stats.loaded >= 1, 'статистика загрузки считается');
  check(outbound[0].status === 'loaded', 'коробка помечена как уехавшая в фуру');
}

// ------------------------------------------------------------------ 3. травмы
console.log('Травмы и правила');
{
  const body = Model.createBody(Model.normalizeTraits(CREW[1].traits), CREW[1].overrides);
  const safe = Model.safeLift(body);
  check(safe > 0 && safe < Model.carryCapacity(body), 'безопасный вес ниже физического предела', { safe: Math.round(safe) });
  const breach = Model.ruleBreach(body, { mass: safe * 1.6, carrying: true, pace: 0.9 });
  check(Boolean(breach), 'подъём сверх предела — нарушение правила');
  check(breach.rule === 'r-lift' && breach.part === 'back', 'за тяжёлый подъём отвечает спина', { rule: breach && breach.rule });
  const runBreach = Model.ruleBreach(body, { mass: safe * 0.4, carrying: true, pace: 0.95 });
  check(runBreach && runBreach.rule === 'r-run' && runBreach.part === 'knee', 'бег с коробкой бьёт по колену');

  const capacityBefore = Model.carryCapacity(body);
  const injury = Model.addInjury(body, { type: 'muscle', part: 'back', severity: 0.5, cause: 'тест' });
  check(body.injuries.length === 1, 'травма записана в тело');
  check(body.pain > 0.2, 'от травмы болит', { pain: Number(body.pain.toFixed(2)) });
  check(Model.carryCapacity(body) < capacityBefore, 'травма спины снижает переносимый вес',
    { before: Math.round(capacityBefore), after: Math.round(Model.carryCapacity(body)) });
  check(Model.mobilityOf(body) < 1, 'травма снижает подвижность');
  check(Model.ruleCompliance(body) > 0 && Model.ruleCompliance(body) <= 1, 'соблюдение правил считается');
  Model.noteViolation(body, breach);
  check(Model.ruleCompliance(body) < 1, 'нарушение снижает соблюдение правил');

  // Заживление: в покое травма уходит быстрее
  const copy = Model.createBody(Model.normalizeTraits(CREW[1].traits), CREW[1].overrides);
  Model.addInjury(copy, { type: 'limb', part: 'knee', severity: 0.3, cause: 'тест' });
  for (let i = 0; i < 200; i += 1) Model.healInjuries(copy, 1, true);
  check(copy.injuries.length === 0, 'в покое травма заживает');
  check(injury.part === 'back' && injury.severity > 0, 'тяжесть травмы записана', { severity: injury.severity });
}

// ------------------------------------------------------------------ 4. рабочий бережётся
console.log('После травмы рабочий соблюдает правила');
{
  const { warehouse, workers, envs } = makeWorld();
  const worker = workers[1];
  worker.state.safety.fear = 0.8;
  const order = warehouse.spawnOrder();
  worker.state.orderId = order.id;
  warehouse.claim(order.id, worker.id);
  warehouse.markCarried(order, worker.id);
  worker.state.carryingId = order.id;
  worker.state.state = 'toDrop';
  for (let i = 0; i < 12; i += 1) worker.update(0.1, envs[worker.id]);
  check(worker.decision.pace < 0.7, 'испуганный рабочий не бежит с грузом', { pace: Number(worker.decision.pace.toFixed(2)) });
  check(worker.decision.caution > 0.4, 'осторожность повышена', { caution: Number(worker.decision.caution.toFixed(2)) });
}

// ------------------------------------------------------------------ 5. отказ от слишком тяжёлого
console.log('Отказ от неподъёмного');
{
  const { warehouse, workers, envs } = makeWorld();
  const worker = workers[0]; // Марта — не силач
  const order = warehouse.spawnOrder();
  order.mass = 90; // заведомо больше предела
  order.x = worker.state.pos.x + 0.6;
  order.y = worker.state.pos.y;
  worker.command('pick', warehouse, { orderId: order.id });
  for (let i = 0; i < 40; i += 1) worker.update(0.1, envs[worker.id]);
  check(!worker.state.carryingId, 'неподъёмную коробку не взял');
  check(worker.state.safety.refusals >= 1, 'отказ зафиксирован как соблюдение правил', { refusals: worker.state.safety.refusals });
  check(warehouse.state.orders.find((o) => o.id === order.id).refusedBy != null, 'заказ помечен «отказался»');
}

console.log('Завершённые рейсы не блокируют приёмку');
{
  const { warehouse } = makeWorld({ maxPending: 2 });
  const old = warehouse.spawnOrder();
  old.status = 'loaded';
  const second = warehouse.spawnOrder();
  check(Boolean(second), 'после загрузки остаётся место для нового заказа');
  second.status = 'loaded';
  check(Boolean(warehouse.spawnOrder()), 'загруженные в фуру коробки не занимают лимит очереди');
}

console.log('Безопасное назначение заказов');
{
  const { warehouse, workers } = makeWorld();
  const first = warehouse.spawnOrder(), second = warehouse.spawnOrder();
  first.mass = 8; second.mass = 8;
  const owner = workers[0], other = workers[1];
  check(owner.command('pick', warehouse, { orderId: first.id }).ok, 'первый заказ закреплён за работником');
  const mode = owner.state.mode;
  const attempt = owner.command('pick', warehouse, { orderId: second.id });
  check(!attempt.ok && owner.state.orderId === first.id && owner.state.mode === mode && second.status === 'pending', 'занятый работник не подменяет выбранный заказ');
  first.mass = 90;
  const steal = other.command('pick', warehouse, { orderId: first.id });
  check(!steal.ok && first.status === 'claimed' && first.carrier === owner.id && other.state.safety.refusals === 0, 'чужой заказ не освобождается при отказе по весу');
  first.mass = 8;
  warehouse.markCarried(first, owner.id); owner.state.carryingId = first.id;
  const carryingAttempt = owner.command('pick', warehouse, { orderId: second.id });
  check(!carryingAttempt.ok && owner.state.carryingId === first.id && first.status === 'carried', 'нельзя подменить заказ с коробкой в руках');
}

console.log('Приоритет диспетчера');
{
  const { warehouse, workers, envs } = makeWorld();
  const w = workers[0], a = warehouse.spawnOrder(), b = warehouse.spawnOrder();
  a.mass = b.mass = 8; a.priority = b.priority = .5; a.deadline = b.deadline = 100;
  a.x = w.pos.x + 4; b.x = w.pos.x + 1; a.y = b.y = w.pos.y;
  check(w.chooseOrder(warehouse,[w]).id === b.id, 'без метки учитывается близость');
  a.dispatchPriority = true;
  check(w.chooseOrder(warehouse,[w]).id === a.id && warehouse.nearestPending(w.pos).id === a.id,
    'метка учитывается при автономии и общем выборе заказа');
  b.deadline = warehouse.state.time; a.deadline = warehouse.state.time + 200;
  check(w.chooseOrder(warehouse,[w]).id === b.id, 'очень срочный заказ может обогнать отмеченный');
  a.deadline = b.deadline = 100;
  a.mass = 90;
  check(w.chooseOrder(warehouse,[w]).id === b.id, 'метка не отменяет ограничения веса');
  a.mass = 8; w.body.energy = .2;
  w.update(.1, envs[w.id]);
  check(w.state.state === 'toRest' && !w.orderId, 'усталый рабочий отдыхает даже при приоритете');
  const expected = 12 + Math.round(a.priority * 14);
  const result = warehouse.store(a, w.id);
  check(result.points === expected && a.dispatchPriority === undefined, 'метка не меняет оплату и снимается после доставки');
  const truck = warehouse.spawnTruck('load');
  check(Boolean(truck) && a.status === 'pending' && !a.dispatchPriority, 'старая метка не переходит на погрузку той же коробки');
  a.dispatchPriority = true; warehouse.loadTruck(a,w.id);
  check(!a.dispatchPriority, 'метка снимается после погрузки');
}
{
  const { warehouse } = makeWorld();
  const a = warehouse.spawnOrder(); a.dispatchPriority = true;
  warehouse.drop(a, .1, a.x, a.y);
  check(a.status === 'pending' && a.dispatchPriority, 'метка остаётся после падения пригодной коробки');
  warehouse.drop(a, .9, a.x, a.y);
  check(a.status === 'ruined' && !a.dispatchPriority, 'метка снимается после порчи');
  const returned = warehouse.spawnOrder(); returned.dispatchPriority = true; warehouse.restock(returned);
  check(returned.status === 'stored' && !returned.dispatchPriority, 'метка снимается после возврата на полку');
  const b = warehouse.spawnOrder(); b.dispatchPriority = true; b.deadline = -36;
  warehouse.step(.1);
  check(b.status === 'missed' && !b.dispatchPriority, 'метка снимается после пропуска');
}

console.log('Автономия: усталость, срочность и обход');
{
  const { warehouse, workers, envs } = makeWorld();
  const worker = workers[0]; worker.body.energy = .2;
  const order = warehouse.spawnOrder(); order.mass = 8;
  worker.update(.1, envs[worker.id]);
  check(worker.state.state === 'toRest' && !worker.orderId && order.status === 'pending', 'сильно уставший сначала идёт отдыхать');
}
{
  const { warehouse, workers, envs } = makeWorld();
  const worker = workers[0];
  const a = warehouse.spawnOrder(), b = warehouse.spawnOrder();
  a.mass = b.mass = 8; a.priority = b.priority = .5;
  a.deadline = warehouse.state.time + 15; b.deadline = warehouse.state.time + 100;
  a.x = -8; a.y = 0; b.x = -7; b.y = 0;
  worker.update(.1, envs[worker.id]);
  check(worker.orderId === a.id, 'срочный заказ выбирается раньше обычного');
}
{
  const { warehouse, workers } = makeWorld();
  const w = workers[0], peer = workers[1];
  w.state.pos = {x:-5,y:0}; peer.state.pos = {x:-9,y:0};
  workers[2].command('wait', warehouse);
  const a = warehouse.spawnOrder(), b = warehouse.spawnOrder();
  a.mass = b.mass = 8; a.priority = b.priority = .5; a.deadline = b.deadline = 100;
  a.x = -9; a.y = 0; b.x = -8; b.y = 5;
  check(w.chooseOrder(warehouse,[w]).id === a.id && w.chooseOrder(warehouse,workers).id === b.id,
    'свободному соседу оставляют ближайший обычный заказ');
}
{
  const { warehouse, workers, envs } = makeWorld();
  const w = workers[0], blocker = workers[1];
  w.state.pos = { x: -5.7, y: 0 }; blocker.state.pos = { x: -7.1, y: 0 };
  workers[2].state.pos = { x: -5, y: 4 }; blocker.command('wait', warehouse);
  const order = warehouse.spawnOrder(); order.mass = 8; order.x = -9.4; order.y = 0;
  w.command('pick', warehouse, {orderId:order.id});
  let min = Infinity;
  for (let i=0; i<150 && !w.carryingId; i++) {
    w.update(.05, envs[w.id]);
    min = Math.min(min, Math.hypot(w.pos.x-blocker.pos.x,w.pos.y-blocker.pos.y));
  }
  check(Boolean(w.carryingId), 'рабочий обходит стоящего коллегу и берёт коробку', {x:w.pos.x,y:w.pos.y,min});
  check(min > .65, 'обход сохраняет дистанцию', {min});
}

{
  const { warehouse, workers, envs } = makeWorld();
  const w = workers[0];
  w.state.pos = {x:-5.7,y:0}; workers[1].state.pos = {x:-5,y:4}; workers[2].state.pos = {x:-5,y:-4};
  warehouse.state.forklift.x = -7.1; warehouse.state.forklift.y = 0;
  const order = warehouse.spawnOrder(); order.mass = 8; order.x = -9.4; order.y = 0;
  w.command('pick', warehouse, {orderId: order.id});
  let min = Infinity;
  for (let i=0; i<200 && !w.carryingId; i++) {
    w.update(.05, envs[w.id]);
    min = Math.min(min, Math.hypot(w.pos.x+7.1,w.pos.y));
  }
  check(Boolean(w.carryingId) && min > 1.05, 'рабочий обходит стоящий погрузчик', {min,x:w.pos.x,y:w.pos.y});
}


console.log('Обморок и владение заказами');
{
  const { warehouse, workers, envs } = makeWorld();
  const [a, b] = workers;
  const order = warehouse.spawnOrder(); order.mass = 8;
  a.command('pick', warehouse, { orderId: order.id });
  a.body.collapsed = true; a.body.energy = 0;
  a.update(0.1, envs[a.id]);
  check(a.state.state === 'down' && !a.orderId && order.status === 'pending' && !order.carrier,
    'обморок по пути освобождает резерв');
  check(b.command('pick', warehouse, { orderId: order.id }).ok, 'коллега может занять освобождённый заказ');
  for (const cmd of ['pick', 'wait', 'rest', 'tech', 'meet', 'toilet']) {
    check(!a.command(cmd, warehouse, { orderId: order.id }).ok && a.state.state === 'down',
      'команда ' + cmd + ' не поднимает упавшего');
  }
  check(a.command('auto', warehouse).ok && a.state.state === 'down', 'автономию можно включить на потом');
  a.body.collapsed = false; a.body.energy = 0.6; a.state.timers.down = 0.2;
  a.update(0.1, envs[a.id]);
  check(a.state.state === 'down' && order.carrier === b.id, 'пауза восстановления не перехватывает чужой заказ');
  a.update(0.1, envs[a.id]); a.update(0.1, envs[a.id]);
  check(a.state.state !== 'down' && order.carrier === b.id, 'после восстановления чужой заказ остаётся у владельца');
}
{
  const { warehouse, workers, envs } = makeWorld();
  const a = workers[0], order = warehouse.spawnOrder(); order.mass = 8;
  warehouse.claim(order.id, a.id); warehouse.markCarried(order, a.id);
  a.state.orderId = order.id; a.state.carryingId = order.id; a.state.state = 'toDrop';
  a.state.onForklift = true; warehouse.state.forklift.rider = a.id;
  let drops = 0; envs[a.id].onDropped = () => drops++;
  a.body.collapsed = true; a.body.energy = 0;
  a.update(0.1, envs[a.id]);
  check(order.status === 'pending' && order.physics && !order.carrier && !a.orderId && !a.carryingId,
    'груз падает в физический мир и заказ освобождён');
  check(!a.state.onForklift && !warehouse.state.forklift.rider && drops === 1 && a.state.stats.dropped === 1,
    'водитель освобождает погрузчик; падение учитывается один раз');
  a.update(0.1, envs[a.id]);
  check(drops === 1 && order.drops === 1, 'пока без сознания, груз не падает повторно');
  for (let i = 0; i < 300; i++) warehouse.stepPhysics(0.02);
  check(!order.physics && order.pose.z >= warehouse.supportHeight(order) - 0.01, 'упавший груз действительно приземляется');
}
{
  const { warehouse, workers, envs } = makeWorld();
  const [a, b] = workers, order = warehouse.spawnOrder(); order.mass = 8;
  warehouse.claim(order.id, b.id);
  a.state.mode = 'manual'; a.state.orderId = order.id; a.state.state = 'toPick';
  a.update(0.1, envs[a.id]);
  check(order.status === 'claimed' && order.carrier === b.id && !a.orderId, 'устаревший маршрут не перехватывает чужой заказ');
  a.state.orderId = order.id; a.state.techOrderId = order.id; a.state.state = 'toTech';
  warehouse.state.forklift.rider = b.id;
  a.update(0.1, envs[a.id]);
  check(order.status === 'claimed' && order.carrier === b.id && !a.orderId, 'путь к технике не освобождает чужой заказ');
  a.state.orderId = order.id; a.state.carryingId = order.id; a.state.state = 'toDrop';
  a.update(0.1, envs[a.id]);
  check(order.status === 'claimed' && order.carrier === b.id && !a.carryingId, 'устаревший груз не перемещает чужой заказ');
}
{
  const { warehouse, workers, envs } = makeWorld();
  const a = workers[0], order = warehouse.spawnOrder();
  order.mass = 33; order.heavy = false; a.body.fatigue = 0.95; a.state.safety.fear = 1;
  const res = a.command('pick', warehouse, { orderId: order.id });
  check(res.ok && res.tech && a.state.state === 'toTech' && order.carrier === a.id,
    'груз выше личного предела, но ниже общего порога, направляется на погрузчик');
  a.body.collapsed = true; a.body.energy = 0; a.update(0.1, envs[a.id]);
  check(!a.state.techOrderId && order.status === 'pending', 'при обмороке по пути к технике заказ освобождается');
}


{
  const { warehouse, workers, envs } = makeWorld();
  const a = workers[0], order = warehouse.spawnOrder(); order.mass = 8;
  warehouse.claim(order.id, a.id); warehouse.markCarried(order, a.id);
  a.state.orderId = order.id; a.state.carryingId = order.id; a.state.state = 'toDrop'; a.state.mode = 'manual';
  for (let i = 0; i < 1200 && !a.state.timers.place; i++) a.update(0.05, envs[a.id]);
  check(a.state.timers.place > 0 && a.carryingId === order.id, 'работник подошёл к ячейке с грузом');
  a.state.timers.place = 100; a.state.lastDropAt = -100;
  envs[a.id].rng = { next: () => 0, range: (x, y) => (x + y) / 2, gauss: () => 0 };
  a.update(0.01, envs[a.id]);
  check(order.status === 'stored' && order.drops === 0 && !a.carryingId,
    'после успешной укладки груз не падает в том же тике', {status: order.status, drops: order.drops});
}


{
  const { warehouse, workers, envs } = makeWorld();
  const a = workers[0], room = warehouse.layout.toilet;
  a.state.pos.x = room.x; a.state.pos.y = room.y; a.state.inToilet = true;
  a.state.state = 'toilet'; warehouse.state.toiletOccupant = a.id;
  a.body.collapsed = true; a.body.energy = 0; a.update(0.1, envs[a.id]);
  check(warehouse.state.toiletOccupant === a.id && a.state.state === 'down', 'занятый туалет сохраняет упавшего человека внутри');
  a.body.collapsed = false; a.body.energy = 0.6; a.state.timers.down = 0;
  a.update(0.1, envs[a.id]);
  check(a.state.state === 'fromToilet' && warehouse.state.toiletOccupant === a.id, 'после восстановления работник выходит из туалета');
  for (let i = 0; i < 500 && warehouse.state.toiletOccupant; i++) a.update(0.1, envs[a.id]);
  check(!warehouse.state.toiletOccupant && !a.state.inToilet, 'туалет освобождается после выхода');
}

console.log('');
if (failures) {
  console.log(`✗ Провалов: ${failures} из ${checks}`);
  process.exit(1);
}
console.log(`✓ Механики в порядке: ${checks} проверок`);
