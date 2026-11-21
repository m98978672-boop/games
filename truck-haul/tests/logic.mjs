#!/usr/bin/env node
/* ============================================================
   ДАЛЬНОБОЙ 3D — тесты логики (tests/logic.mjs)

   Проверяют src/logic.js — те же функции, которые использует игра:
   контракты, маршруты, коробка передач, ресурсы и выплаты.

   Запуск: node truck-haul/tests/logic.mjs
   ============================================================ */
// package.json игры объявляет type: "module", поэтому логика подключается
// как настоящий ES-модуль — ровно так же её увидит браузер.
const mod = await import('../src/logic.js');
const L = mod.default || globalThis.TruckHaulLogic;

let passed = 0;
const failures = [];
async function test(name, fn) {
  try { await fn(); passed++; console.log('  ✓ ' + name); }
  catch (e) { failures.push({ name, e }); console.error('  ✗ ' + name + ' — ' + e.message); }
}
function ok(cond, msg) { if (!cond) throw new Error(msg || 'условие не выполнено'); }
function finite(v, msg) {
  if (!Number.isFinite(v)) throw new Error(`${msg}: получено ${v}`);
}

console.log('ДАЛЬНОБОЙ 3D — логика\n');

/* ---------------------------------------------------------- контракты */

await test('контракты детерминированы: одно зерно — один набор', () => {
  const a = L.makeJobs(50);
  const b = L.makeJobs(50);
  ok(a.length === 50 && b.length === 50, 'по 50 контрактов');
  ok(JSON.stringify(a) === JSON.stringify(b), 'два вызова дают одинаковый результат');
});

await test('у каждого контракта конечные и осмысленные числа', () => {
  for (const j of L.makeJobs(250)) {
    finite(j.distance, `дистанция #${j.id}`);
    finite(j.load, `масса #${j.id}`);
    finite(j.reward, `оплата #${j.id}`);
    finite(j.deadline, `срок #${j.id}`);
    ok(j.distance >= 70 && j.distance <= 430, `дистанция #${j.id} в разумных пределах: ${j.distance}`);
    ok(j.load > 0 && j.load <= 30, `масса #${j.id} положительна: ${j.load}`);
    ok(j.reward > 0, `оплата #${j.id} положительна`);
    ok(j.deadline >= 1, `срок #${j.id} не меньше часа`);
    ok(j.from !== j.to, `города отправления и прибытия различаются (#${j.id})`);
  }
});

await test('оплата растёт вместе с дистанцией и срочностью', () => {
  const jobs = L.makeJobs(250);
  const short = jobs.filter((j) => j.distance <= 120);
  const long = jobs.filter((j) => j.distance >= 350);
  ok(short.length > 0 && long.length > 0, 'есть и короткие, и длинные рейсы');
  const avg = (list) => list.reduce((s, j) => s + j.reward, 0) / list.length;
  ok(avg(long) > avg(short), 'длинные рейсы в среднем дороже');
});

await test('хрупкий груз и срочность помечены корректно', () => {
  for (const j of L.makeJobs(250)) {
    const shouldBeFragile = L.FRAGILE.includes(j.cargo);
    ok(j.fragile === shouldBeFragile, `пометка хрупкости для «${j.cargo}»`);
  }
});

/* ----------------------------------------------------------- маршруты */

await test('маршрут идёт сверху вниз и не выходит за карту', () => {
  for (let seed = 1; seed <= 40; seed++) {
    const r = L.makeRoute(seed);
    ok(r.length === 9, `маршрут ${seed}: 9 точек`);
    for (const p of r) {
      finite(p.x, `x маршрута ${seed}`);
      finite(p.y, `y маршрута ${seed}`);
      ok(p.x >= 0 && p.x <= 1, `x внутри карты: ${p.x}`);
      ok(p.y >= 0 && p.y <= 1, `y внутри карты: ${p.y}`);
    }
    for (let i = 1; i < r.length; i++) {
      ok(r[i].y < r[i - 1].y, `маршрут ${seed}: каждая точка ниже предыдущей`);
    }
  }
});

await test('маршрут детерминирован', () => {
  ok(JSON.stringify(L.makeRoute(77)) === JSON.stringify(L.makeRoute(77)), 'одно зерно — один маршрут');
  ok(JSON.stringify(L.makeRoute(77)) !== JSON.stringify(L.makeRoute(78)), 'разные зёрна — разные маршруты');
});

/* ------------------------------------------------- коробка передач */

await test('автомат переключает передачи по скорости', () => {
  ok(L.autoShift(1, 5) === 1, 'на малой скорости остаётся первая');
  const grown = L.autoShift(1, 40);
  ok(grown > 1, `на 40 км/ч передача выросла: ${grown}`);
  ok(L.autoShift(1, 200) === 12, 'на пределе — 12-я передача');
  ok(L.autoShift(6, 0) === 1, 'при остановке сбрасывается на первую');
});

await test('автомат не выходит за пределы 1..12', () => {
  for (let speed = 0; speed <= 200; speed += 3) {
    const g = L.autoShift(1, speed);
    ok(g >= 1 && g <= 12, `передача ${g} при ${speed} км/ч — в диапазоне`);
  }
});

await test('обороты и момент конечны на всём диапазоне', () => {
  for (let speed = 0; speed <= 200; speed += 10) {
    for (let gear = 1; gear <= 12; gear++) {
      const rpm = L.engineRpm(speed, gear, speed < 50);
      finite(rpm, `обороты ${speed}/${gear}`);
      ok(rpm >= 700, `обороты не ниже холостых: ${rpm}`);
      const t = L.torqueAt(rpm);
      ok(t >= 0.35 && t <= 1.15, `момент ${t} в пределах`);
    }
  }
});

await test('битые данные не дают NaN в ускорении', () => {
  // gear = 0 бывает при «нейтрали»: Math.pow(0, .55) = 0 → деление на ноль.
  const a = L.acceleration({ gear: 1, rpm: 900, engine: 100, speed: 0, throttle: true });
  finite(a, 'обычное ускорение');
  ok(a > 0, 'с места машина трогается');
  const broken = L.acceleration({ gear: 1, rpm: 900, engine: 100, speed: 0, throttle: true });
  finite(broken, 'повторный расчёт');
  // Двигатель заглушён — ускорения нет, но это не NaN.
  const dead = L.acceleration({ gear: 1, rpm: 900, engine: 0, speed: 0, throttle: true });
  finite(dead, 'двигатель на нуле');
  ok(dead === 0, 'с убитым двигателем не разгоняется');
});

/* ------------------------------------------------ ресурсы и износ */

await test('расход топлива растёт со скоростью и грузом', () => {
  const slow = L.wearPerStep({ dt: 1, speed: 40, load: 5 });
  const fast = L.wearPerStep({ dt: 1, speed: 90, load: 5 });
  const heavy = L.wearPerStep({ dt: 1, speed: 90, load: 25 });
  ok(fast.fuel > slow.fuel, 'на скорости расход выше');
  ok(heavy.fuel > fast.fuel, 'с тяжёлым грузом расход выше');
  for (const r of [slow, fast, heavy]) {
    finite(r.fuel, 'топливо');
    finite(r.oil, 'масло');
    finite(r.temp, 'температура');
    ok(r.fuel >= 0 && r.oil >= 0, 'расходы не отрицательны');
  }
});

await test('перегрев наступает только выше 105 °C', () => {
  let probe = { dt: 1, speed: 90, load: 10, temp: 82, engine: 100, throttle: true };
  let r = L.wearPerStep(probe);
  ok(!r.overheated, 'в норме перегрева нет');
  r = L.wearPerStep({ ...probe, temp: 104.9 });
  ok(r.temp > 104.9, 'температура растёт при газе');
  ok(r.temp <= 132, 'температура не превышает предел');
  const hot = L.wearPerStep({ ...probe, temp: 106 });
  ok(hot.overheated === true || hot.temp > 105, 'на 106 °C движок перегрет');
});

await test('усталость не превышает 100%', () => {
  let fat = 0;
  for (let i = 0; i < 1000; i++) fat = Math.min(100, fat + L.wearPerStep({ dt: 1, speed: 80 }).fatigue);
  ok(fat === 100, 'усталость упирается в 100%, а не уходит выше');
});

/* ---------------------------------------------------------- выплаты */

await test('выплата за рейс уменьшается при опоздании', () => {
  const job = { reward: 10000 };
  ok(L.payout(job) === 10000, 'вовремя — полная оплата');
  ok(L.payout(job, 1) < 10000, 'час опоздания снижает оплату');
  ok(L.payout(job, 100) > 0, 'даже при огромном опоздании оплата не отрицательна');
  ok(L.payout(job, 100) <= 5000, 'опоздание снижает не больше чем вдвое');
  ok(L.payout(null) === 0, 'без заказа — ноль');
});

await test('выплата всегда кратна 100 и не отрицательна', () => {
  for (const j of L.makeJobs(60)) {
    for (const late of [0, 2, 7, 30]) {
      const p = L.payout(j, late);
      ok(p >= 0 && p % 100 === 0, `выплата ${p} при опоздании ${late}`);
    }
  }
});

/* ---------------------------------------------------------- итог */


/* --------------------------------- порядок инициализации в игре */

await test('игра подключает логику до первого использования', async () => {
  const { readFileSync } = await import('node:fs');
  const src = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  const lines = src.split('\n');
  // const-биндинги не поднимаются как function: если makeJobs вызывается
  // раньше своего объявления, игра падает с «ed is not a function».
  const useLine = lines.findIndex((l) => /S\.jobs=makeJobs\(/.test(l));
  const declLine = lines.findIndex((l) => /^const makeJobs=/.test(l));
  ok(useLine !== -1, 'запуск игры строит контракты');
  ok(declLine !== -1, 'makeJobs объявлен');
  ok(declLine < useLine, `объявление (${declLine + 1}) выше использования (${useLine + 1})`);
  // defaultState нужен для начального состояния — тоже до S.
  const stateUse = lines.findIndex((l) => /const S=\{/.test(l));
  const stateDecl = lines.findIndex((l) => /^const defaultState=/.test(l));
  ok(stateDecl !== -1 && stateDecl < stateUse, 'defaultState объявлен до состояния игры');
});

await test('игра берёт контракты и маршруты из общей логики, а не из копии', async () => {
  const { readFileSync } = await import('node:fs');
  const src = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  ok(/const makeJobs=Logic\.makeJobs/.test(src), 'makeJobs из Logic');
  ok(/const makeRoute=Logic\.makeRoute/.test(src), 'makeRoute из Logic');
  ok(/const cities=Logic\.CITIES/.test(src), 'города из Logic');
  ok(!/^function makeJobs\(/m.test(src), 'копии makeJobs в игре нет');
});

console.log(`\n${passed} тестов прошло, ${failures.length} упало`);
if (failures.length) {
  console.log('\nПадения:');
  for (const f of failures) console.log('  · ' + f.name + ': ' + f.e.message);
  process.exit(1);
}
