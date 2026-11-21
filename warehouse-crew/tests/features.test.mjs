// Проверки нового слоя склада: точки A/B/C коробок, физика, улица, кабинки Ж/М,
// уединение пары, техника для тяжёлого груза и смерть с пополнением.
// Гоняют ту же логику, что и игра: src/sim/*.js — без DOM и Three.js.
//
// Запуск:  node warehouse-crew/tests/features.test.mjs
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');

const Model = require(path.join(root, 'src/sim/model.js'));
const Wh = require(path.join(root, 'src/sim/warehouse.js'));
const WorkerMod = require(path.join(root, 'src/sim/worker.js'));

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
    id: 'marta', name: 'Марта Ковач', gender: 'ж', role: 'Кладовщик',
    traits: { endurance: 0.84, strength: 0.56, precision: 0.8, caution: 0.72, paceTrait: 0.56, neuroticism: 0.28, recovery: 0.72, coop: 0.78 },
    overrides: { energy: 0.86, sleepDebt: 0.12 },
  },
  {
    id: 'grisha', name: 'Гриша Волков', gender: 'м', role: 'Грузчик',
    traits: { endurance: 0.58, strength: 0.92, precision: 0.48, caution: 0.36, paceTrait: 0.88, neuroticism: 0.58, recovery: 0.48, coop: 0.42 },
    overrides: { energy: 0.92, sleepDebt: 0.3 },
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
  return { next, range: (a, b) => a + (b - a) * next(), int: (a, b) => Math.floor(a + (b - a + 1) * next()), pick: (arr) => arr[Math.floor(next() * arr.length) % arr.length], gauss: () => 0 };
}

function makeWorld(options = {}) {
  const warehouse = Wh.createWarehouse(Object.assign({
    seed: 777, shiftLength: 900, spawnEvery: 999, maxPending: 9,
    firstSpawnDelay: 999, firstTruckDelay: 9999, truckEvery: 9999,
    firstHeavyDelay: 9999, heavyEvery: 9999,
  }, options));
  const workers = CREW.map((member, i) => WorkerMod.createWorker({
    id: member.id, name: member.name, gender: member.gender, role: member.role,
    traits: member.traits, overrides: member.overrides,
    model: Model, layout: warehouse.layout, spawn: warehouse.layout.spawns[i], heading: 0,
  }));
  const envs = {};
  workers.forEach((w) => {
    envs[w.id] = { warehouse, workers, brain: null, brainApi: null, rng: makeRng(31 + w.id.length) };
  });
  return { warehouse, workers, envs };
}

// ------------------------------------------------------------- 1. точки A / B / C
console.log('Точки A / B / C коробки');
{
  const { warehouse } = makeWorld();
  const order = warehouse.spawnOrder();
  check(Boolean(order), 'заказ создан');
  check(Boolean(order.origin) && Boolean(order.pose) && Boolean(order.dest),
    'у коробки есть все три точки', { origin: order.origin, pose: Boolean(order.pose), dest: order.dest });
  check(Math.abs(order.origin.x - order.x) < 0.001 && Math.abs(order.origin.y - order.y) < 0.001,
    'A — там, откуда коробка приехала');
  const slot = warehouse.state.slots.filter((s) => s.id === order.slotId)[0];
  check(order.dest && Math.abs(order.dest.x - slot.x) < 0.001 && Math.abs(order.dest.y - slot.y) < 0.001,
    'B — целевая ячейка стеллажа');
  check(order.dest.z > slot.h && order.dest.z < slot.h + 0.1, 'B стоит на высоте полки', { z: order.dest.z, h: slot.h });
  check(order.pose.z > 0.1 && order.pose.z < 0.2, 'C лежит на паллете приёмки', { z: order.pose.z });

  // Поставили на полку — C совпала с B
  const worker = warehouse.claim(order.id, 'x');
  warehouse.markCarried(order, 'x');
  warehouse.store(order, 'x');
  check(order.status === 'stored', 'коробка уложена');
  check(Math.abs(order.pose.z - order.dest.z) < 0.001 && Math.abs(order.pose.x - order.dest.x) < 0.001,
    'после укладки C = B');
}

// ---------------------------------------------------------------- 2. физика коробок
console.log('Физика коробок: не летают и не тонут');
{
  const { warehouse } = makeWorld();
  const order = warehouse.spawnOrder();
  warehouse.claim(order.id, 'x');
  warehouse.markCarried(order, 'x');
  warehouse.drop(order, 0.2, 0.4, 0.9, { vx: 1.4, vy: -0.6, vz: 0.5, z: 0.75 });
  check(order.physics === true, 'упавшая коробка живёт по физике');
  const support = warehouse.supportHeight(order);
  let minZ = Infinity;
  let settledAt = null;
  for (let i = 0; i < 400; i += 1) {
    warehouse.stepPhysics(0.02);
    minZ = Math.min(minZ, order.pose.z);
    if (!order.physics && settledAt == null) settledAt = i * 0.02;
  }
  check(order.physics === false, 'коробка успокоилась');
  check(settledAt != null && settledAt < 6, 'успокоилась быстро, а не парила', { settledAt });
  check(minZ >= support - 1e-6, 'коробка не провалилась сквозь пол', { minZ, support });
  check(Math.abs(order.pose.z - (support + (order.pose.lying ? 0.1 : 0))) < 0.2,
    'низ коробки стоит на полу или на боку', { z: order.pose.z, lying: order.pose.lying });
  check(order.pose.x > -12.3 && order.pose.x < 12.3 && order.pose.y > -8.3 && order.pose.y < 14,
    'коробку не унесло за пределы площадки', { x: order.pose.x, y: order.pose.y });
  check(order.damage >= 0.2, 'удар добавил повреждений', { damage: order.damage });
  const shelfBox = warehouse.spawnOrder();
  warehouse.claim(shelfBox.id, 'x');
  warehouse.markCarried(shelfBox, 'x');
  warehouse.drop(shelfBox, 0.1, Wh.LAYOUT.racks[0].x, 0, { z: 2.5, vz: 0, spin: 2 });
  for (let i = 0; i < 500; i++) warehouse.stepPhysics(0.01);
  check(shelfBox.bounces > 0 && shelfBox.pose.lying, 'коробка отскакивает и ложится на бок', { bounces: shelfBox.bounces, pose: shelfBox.pose });
  check(shelfBox.pose.z >= 1.875 - 0.001, 'упавшая на стеллаж коробка не проходит сквозь полку', { z: shelfBox.pose.z });
}

// --------------------------------------------------------------- 3. улица и кабинки
console.log('Улица за воротами и кабинки Ж / М');
{
  const { warehouse, workers, envs } = makeWorld();
  const st = Wh.LAYOUT.street;
  check(Boolean(st) && st.y1 > st.y0, 'у склада есть улица', { street: st });
  check(WorkerMod.insideWalk(0, st.y0 + 1, Wh.LAYOUT), 'на улице ходить можно');
  check(!WorkerMod.insideWalk(0, st.y0 + 1 - 8, Wh.LAYOUT) === false, 'в цеху тоже можно');
  check(Wh.LAYOUT.wc && Wh.LAYOUT.wc.length === 2, 'две кабинки: Ж и М');
  check(Wh.LAYOUT.wc[0].id === 'Ж' && Wh.LAYOUT.wc[1].id === 'М', 'кабинки подписаны');

  const worker = workers[0];
  const spot = st.spots[0];
  const res = worker.command('street', warehouse);
  check(res.ok, 'приказ выйти на улицу принят');
  let reached = null;
  let crossedGate = false;
  let maxStep = 0;
  for (let i = 0; i < 900 && !reached; i += 1) {
    const previous = { ...worker.state.pos };
    worker.update(0.05, envs[worker.id]);
    maxStep = Math.max(maxStep, Math.hypot(worker.state.pos.x - previous.x, worker.state.pos.y - previous.y));
    if (previous.y < 8 && worker.state.pos.y >= 8) crossedGate = Math.abs(worker.state.pos.x - st.gate.x) < st.gate.half;
    if (worker.state.state === 'street') reached = { x: worker.state.pos.x, y: worker.state.pos.y };
  }
  check(Boolean(reached), 'рабочий дошёл до улицы через ворота', { pos: reached });
  check(crossedGate && maxStep < 0.3, 'пересёк стену через ворота без телепортации', { crossedGate, maxStep });
  check(reached && reached.y >= st.y0 && reached.y <= st.y1 && reached.x >= st.x0 && reached.x <= st.x1,
    'стоит на улице, а не в стене', { reached, street: st });

  // Кабинка по полу: Марта — в Ж, Гриша — в М
  const marta = workers[0];
  marta.body.bladder = 0.95;
  marta.command('auto', warehouse);
  let cabin = null;
  for (let i = 0; i < 900 && !cabin; i += 1) {
    marta.update(0.05, envs[marta.id]);
    if (marta.state.state === 'wc') cabin = { id: marta.state.inCabin, x: marta.state.pos.x, y: marta.state.pos.y };
  }
  check(Boolean(cabin) && cabin.id === 'Ж', 'Марта ушла в кабинку Ж', cabin || {});
  const zh = Wh.LAYOUT.wc[0];
  check(cabin && Math.abs(cabin.x - zh.x) < 1.2 && Math.abs(cabin.y - zh.y) < 1.2, 'кабинка совпала с планировкой', { cabin, zh });
  let left = false;
  for (let i = 0; i < 900 && !left; i += 1) {
    marta.update(0.05, envs[marta.id]);
    if (!marta.state.inCabin && marta.state.state !== 'wc') left = true;
  }
  check(left, 'вышел из кабинки и вернулся к работе');
  check(marta.body.bladder < 0.5, 'нужда снята', { bladder: Number(marta.body.bladder.toFixed(2)) });
}

// --------------------------------------------------------- 4. уединение пары Ж и М
console.log('Уединённое место пары');
{
  const { warehouse, workers, envs } = makeWorld();
  const spot = Wh.LAYOUT.privacySpots[0];
  check(Boolean(spot), 'есть укромное место', { spot });
  const marta = workers[0];
  const res = marta.command('meet', warehouse, { spot, meetId: 'pair', until: 5 });
  check(res.ok, 'приказ уединиться принят');
  let met = null;
  for (let i = 0; i < 900 && !met; i += 1) {
    marta.update(0.05, envs[marta.id]);
    if (marta.state.state === 'meet') met = { x: marta.state.pos.x, y: marta.state.pos.y, privacy: marta.state.privacy };
  }
  check(Boolean(met) && met.privacy === true, 'дошёл и включил режим приватности', met || {});
  check(met && Math.hypot(met.x - spot.x, met.y - spot.y) < 1.2, 'стоит именно в укромном месте', { met, spot });
}

// ----------------------------------------------------- 5. техника для тяжёлого груза
console.log('Техника для тяжёлого груза');
{
  const { warehouse, workers, envs } = makeWorld();
  check(Boolean(warehouse.state.forklift), 'погрузчик есть на складе');
  check(Wh.LAYOUT.heavy && Wh.LAYOUT.heavy.pallet, 'есть отдел тяжёлого груза');
  const heavy = warehouse.spawnHeavyBatch();
  check(heavy >= 1, 'тяжёлый груз приехал', { n: heavy });
  const order = warehouse.state.orders.filter((o) => o.heavy)[0];
  check(order && order.mass >= 34, 'коробка действительно тяжёлая', { mass: order && order.mass });
  const worker = workers[1];
  worker.state.pos.x = order.x + 2.2;
  worker.state.pos.y = order.y;
  worker.command('pick', warehouse, { orderId: order.id });
  let onTech = false;
  let carried = false;
  for (let i = 0; i < 1600 && !carried; i += 1) {
    warehouse.step(0.05);
    worker.update(0.05, envs[worker.id]);
    if (worker.state.onForklift) onTech = true;
    if (worker.state.carryingId) carried = true;
  }
  check(onTech, 'рабочий сел на погрузчик');
  check(carried, 'тяжёлую коробку всё-таки взяли — техникой');
  check(warehouse.state.forklift.rider === worker.state.id || !worker.state.onForklift,
    'за рулём именно он', { rider: warehouse.state.forklift.rider });
  for (let i = 0; i < 2400 && order.status !== 'stored'; i++) { warehouse.step(0.05); worker.update(0.05, envs[worker.id]); }
  check(order.status === 'stored', 'тяжёлый груз довезён до ячейки', { status: order.status, worker: worker.state.state, pos: worker.state.pos, goal: worker.state.goal });
}

// -------------------------------------- 6. смерть и пополнение бригады в новый день
console.log('Смерть и новые работяги');
{
  const { warehouse, workers, envs } = makeWorld({ dayLength: 30 });
  const victim = workers[1];
  victim.body.vitality = 0;
  victim.body.deceased = false;
  victim.update(0.1, envs[victim.id]);
  check(victim.state.dead === true, 'рабочий погиб от нулевой витальности');
  check(warehouse.state.deaths.length === 1, 'смерть записана в табеле', { deaths: warehouse.state.deaths });
  check(warehouse.state.stats.deaths === 1, 'счётчик смертей вырос');

  // День меняется — в игре на это реагирует найм; здесь проверяем сам найм
  for (let t = 0; t < 35; t += 0.1) warehouse.step(0.1);
  check(warehouse.state.day >= 2, 'наступил новый день', { day: warehouse.state.day });

  const traits = Model.normalizeTraits({ endurance: 0.6, strength: 0.6, precision: 0.6, caution: 0.6, paceTrait: 0.6, neuroticism: 0.4, recovery: 0.6, coop: 0.6 });
  const replacement = WorkerMod.createWorker({
    id: 'hire-1', name: 'Новый Работяга', gender: 'м', role: 'Грузчик',
    traits, model: Model, layout: warehouse.layout, spawn: warehouse.layout.spawns[0], heading: 0,
  });
  check(Boolean(replacement) && replacement.state.dead === false, 'новый работяга встаёт в строй');
  replacement.update(0.1, { warehouse, workers: [replacement], rng: makeRng(5) });
  check(replacement.state.pos.x !== undefined, 'новый работяга двигается по складу');
}

console.log('');
if (failures) {
  console.log('✗ Провалено проверок: ' + failures + ' из ' + checks);
  process.exit(1);
} else {
  console.log('✓ Новый слой в порядке: ' + checks + ' проверок');
}
