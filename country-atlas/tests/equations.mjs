/**
 * Проверка уравнений состояния точки (§33).
 *
 * Тест отвечает на вопрос владельца «зачем уравнения»: он пробует сломать карту —
 * подсунуть NaN, отрицательный шаг, скорость больше максимальной, толпу на одно ребро —
 * и проверяет, что точка не телепортируется, не уезжает на бесконечность и остаётся
 * в мире, а ИИ выбирает менее загруженную дорогу.
 *
 * Запуск: node tests/equations.mjs
 */
import {
  SYMBOLS, MODES, WORLD, createPoint, stepPoint, setMode, speedOf, vmaxOf, azimuth,
  predict, isFiniteState, bpr, makeRoad, Dispatcher
} from "../src/sim/point-state.js";
import { mulberry32 } from "../src/core/rng.js";
import assert from "node:assert/strict";

let checks = 0;
const ok = (cond, msg) => {
  assert.ok(cond, msg);
  checks++;
};

/* 1. Справочники -------------------------------------------------------- */
ok(Object.keys(SYMBOLS).length === 10, "символов точки должно быть 10");
ok(Object.keys(MODES).length === 8, "режимов должно быть 8");
for (const [sym, s] of Object.entries(SYMBOLS)) {
  ok(s.vmax >= 0 && Number.isFinite(s.vmax), `у символа ${sym} битая скорость`);
  ok(s.p >= 0 && s.p <= 5, `у символа ${sym} битый вес`);
}
ok(SYMBOLS.B.p === 0.25, "бот должен весить 0.25");
ok(SYMBOLS.S.p > SYMBOLS.A.p, "служба должна быть важнее обычного агента");

/* 2. Состояние точки: вектор — не единственное состояние ----------------- */
const ped = createPoint({ id: "A:test-1", sym: "A", x: 10, y: 20, h: 3 });
ok(ped.mode === "rest" && speedOf(ped) === 0, "новая точка должна стоять");
ok(isFiniteState(ped), "состояние новой точки не конечно");
ok("heading" in ped && "t" in ped && "p" in ped, "в состоянии нет mode/heading/t/p");

const before = { ...ped.pos };
for (let i = 0; i < 100; i++) stepPoint(ped, 0.1);
ok(ped.pos.x === before.x && ped.pos.y === before.y, "точка в покое сдвинулась");
ok(Math.abs(ped.t - 10) < 1e-9, "время в покое не идёт");
ok(ped.mode === "rest", "покой сам сменился на другой режим");

/* 3. Раздумье: стоит, но не раньше задержки ----------------------------- */
const thinker = createPoint({ id: "A:think", sym: "A" });
const rec = setMode(thinker, "think", { why: "выбирает, что делать" });
ok(rec.cmd === "setMode" && rec.why.length > 3, "переход режима без объяснения");
ok(thinker.thinkUntil >= 0.4 && thinker.thinkUntil <= 3.0, `задержка раздумья ${thinker.thinkUntil}`);
const thinkPos = { ...thinker.pos };
stepPoint(thinker, 0.1);
ok(thinker.pos.x === thinkPos.x && thinker.mode === "think", "раздумье сдвинуло точку");
let woken = false;
for (let i = 0; i < 40 && !woken; i++) {
  stepPoint(thinker, 0.1, { onThinkDone: (p) => { p.mode = "rest"; woken = true; } });
}
ok(woken, "раздумье не закончилось за 4 секунды");

/* 4. Вектор и курс ------------------------------------------------------ */
const car = createPoint({ id: "V:test-1", sym: "V", x: 0, y: 0 });
car.mode = "move";
car.v = { vx: 10, vy: 0 };
ok(Math.abs(speedOf(car) - 10) < 1e-9, "скорость считается неверно");
ok(Math.abs(azimuth(car) - 90) < 1e-6, `курс на восток должен быть 90°, а он ${azimuth(car)}`);
car.v = { vx: 0, vy: 10 };
ok(Math.abs(azimuth(car) - 0) < 1e-9, "курс на север должен быть 0°");
car.v = { vx: 0, vy: 0 };
const headingBefore = car.heading;
stepPoint(car, 0.1);
ok(car.heading === headingBefore, "курс дёрнулся при нулевом векторе");
const pr = predict(car, 2);
ok(pr.x === car.pos.x && pr.y === car.pos.y, "прогноз при нулевом векторе должен стоять на месте");

/* 5. Инвариант «точка не телепортируется» ------------------------------- */
const fast = createPoint({ id: "V:fast", sym: "V" });
fast.mode = "move";
fast.v = { vx: 33, vy: 0 };
const r1 = stepPoint(fast, 0.1);
ok(r1.ok, "нормальный шаг заблокирован");
ok(r1.moved <= 33 * 0.1 + WORLD.eps, `шаг ${r1.moved} м больше предела`);

/* закон скорости: вектор больше vmax обрезается, а не «летит» */
const xBefore = fast.pos.x;
fast.v = { vx: 1e9, vy: 0 };
const r2 = stepPoint(fast, 0.1);
ok(r2.ok, "закон скорости должен обрезать вектор, а не блокировать шаг");
ok(r2.moved <= 33 * 0.1 + WORLD.eps, `обрезанный шаг ${r2.moved} м`);
ok(fast.pos.x - xBefore <= 3.31, "точка проехала больше, чем позволяет скорость");

/* «телепорт» — это когда позицию подвинули в обход уравнения */
const rx = fast.pos.x;
fast.pos.x += 1_000_000;
const r2b = stepPoint(fast, 0.1);
ok(!r2b.ok && r2b.reason === "teleport-blocked", "скачок позиции не пойман");
ok(isFiniteState(fast), "после скачка состояние не конечно");
ok(Math.abs(fast.pos.x - rx) < 1e-6, "точка не откатилась в lastGood");

/* 6. NaN / Infinity не проходят ---------------------------------------- */
const nan1 = createPoint({ id: "A:nan1", sym: "A" });
nan1.mode = "move";
nan1.v = { vx: NaN, vy: 0 };
const r3 = stepPoint(nan1, 0.1);
ok(!r3.ok, "NaN в векторе не пойман");
ok(isFiniteState(nan1), "NaN остался в состоянии");

const nan2 = createPoint({ id: "A:nan2", sym: "A" });
nan2.mode = "move";
nan2.v = { vx: Infinity, vy: -Infinity };
ok(!stepPoint(nan2, 0.1).ok, "Infinity в векторе не пойман");
ok(isFiniteState(nan2), "Infinity остался в состоянии");

/* NaN в координате не создаётся вообще: точка не рождается «на бесконечности» */
assert.throws(() => createPoint({ id: "A:nan3", sym: "A", x: NaN }), /некорректная координата/, "точка с NaN создалась");
checks++;
assert.throws(() => createPoint({ id: "A:inf", sym: "A", y: Infinity }), /некорректная координата/, "точка с Infinity создалась");
checks++;

/* NaN, подсунутый позже, откатывает точку в lastGood */
const nanLate = createPoint({ id: "A:nan-late", sym: "A", x: 5, y: 5 });
nanLate.mode = "move";
nanLate.v = { vx: 1, vy: 0 };
stepPoint(nanLate, 0.1);
nanLate.pos.x = NaN;
const rLate = stepPoint(nanLate, 0.1);
ok(!rLate.ok, "поздний NaN в позиции не пойман");
ok(isFiniteState(nanLate), "поздний NaN остался в состоянии");
ok(nanLate.pos.x === nanLate.lastGood.x, "точка не откатилась после позднего NaN");

/* отрицательный и нулевой dt не ломают уравнение */
const zero = createPoint({ id: "A:zero", sym: "A" });
zero.mode = "move";
zero.v = { vx: 1, vy: 0 };
const rZero = stepPoint(zero, -5);
ok(rZero.ok && zero.pos.x === 0, "отрицательный dt сдвинул точку");
const rNeg = stepPoint(zero, 0);
ok(rNeg.ok, "нулевой dt уронил шаг");

/* 7. Мир не выпускает --------------------------------------------------- */
const edgePoint = createPoint({ id: "A:edge", sym: "A", x: WORLD.xMax - 1, y: 0 });
edgePoint.mode = "move";
edgePoint.v = { vx: 1.4, vy: 0 };
let clampedSeen = false;
for (let i = 0; i < 100; i++) {
  const r = stepPoint(edgePoint, 0.1);
  if (r.clamped) clampedSeen = true;
  ok(edgePoint.pos.x <= WORLD.xMax + 1e-9, "точка вышла за восточную границу мира");
}
ok(clampedSeen, "кламп на границе мира не сработал");

/* 8. Фаззинг: 10 000 шагов, никаких телепортов ------------------------- */
const rnd = mulberry32(12345);
const fuzz = new Dispatcher();
fuzz.addRoad(makeRoad({ id: "R1", from: "A", to: "B", length: 5000, capacity: 200 }));
for (let i = 0; i < 50; i++) {
  const sym = ["A", "B", "V", "S"][Math.floor(rnd() * 4)];
  const p = createPoint({ id: `P${i}`, sym, x: (rnd() - 0.5) * 1000, y: (rnd() - 0.5) * 1000 });
  p.mode = "move";
  const sp = SYMBOLS[sym].vmax * (0.2 + rnd());
  p.v = { vx: Math.cos(rnd() * 6.28) * sp, vy: Math.sin(rnd() * 6.28) * sp };
  p.edge = "R1";
  p.route = ["R1"];
  fuzz.addPoint(p);
}
let maxMoved = 0;
let violations = 0;
let steps = 0;
for (let i = 0; i < 400; i++) {
  const dt = rnd() < 0.01 ? 0 : 0.05 + rnd() * 0.05;
  for (const p of fuzz.points.values()) {
    const vmax = vmaxOf(p);
    const before = { ...p.pos };
    const r = stepPoint(p, dt);
    const moved = Math.hypot(p.pos.x - before.x, p.pos.y - before.y);
    maxMoved = Math.max(maxMoved, moved);
    steps++;
    if (!r.ok && !r.reason) violations++;
    if (!isFiniteState(p)) violations++;
    if (moved > vmax * Math.min(dt, 0.5) + WORLD.eps + 1e-9) violations++;
    if (p.pos.x < WORLD.xMin || p.pos.x > WORLD.xMax) violations++;
    if (p.pos.y < WORLD.yMin || p.pos.y > WORLD.yMax) violations++;
  }
}
ok(violations === 0, `фаззинг дал ${violations} нарушений на ${steps} шагах`);
ok(steps === 400 * 50, `фаззинг прошёл ${steps} шагов вместо 20 000`);
ok(maxMoved < 30, `максимальный шаг ${maxMoved.toFixed(2)} м — это уже телепорт`);

/* 9. Загрузка ребра: инкрементально = полный пересчёт ------------------- */
const d = new Dispatcher();
d.addRoad(makeRoad({ id: "R1", from: "A", to: "B", length: 3000, capacity: 100, freeSpeed: 20 }));
d.addRoad(makeRoad({ id: "R2", from: "A", to: "B", length: 4200, capacity: 100, freeSpeed: 20 }));

for (let i = 0; i < 10; i++) {
  const bot = createPoint({ id: `B${i}`, sym: "B" });
  bot.edge = "R1";
  d.addPoint(bot);
}
for (let i = 0; i < 4; i++) {
  const ag = createPoint({ id: `A${i}`, sym: "A" });
  ag.edge = "R1";
  d.addPoint(ag);
}
ok(Math.abs(d.load("R1") - d.recount("R1")) < 1e-9, "инкрементальная загрузка ≠ полной");
ok(Math.abs(d.load("R1") - (10 * 0.25 + 4) / 100) < 1e-9, `боты весят не 0.25: ρ=${d.load("R1")}`);
ok(Math.abs(d.load("R2")) < 1e-9, "пустая дорога чем-то загружена");

d.command("A0", "despawn", {}, "уехал");
ok(Math.abs(d.load("R1") - d.recount("R1")) < 1e-9, "после despawn загрузка рассинхронилась");

/* 10. Скорость падает с загрузкой, но не ниже нуля --------------------- */
for (let i = 0; i < 200; i++) d.addPoint(Object.assign(createPoint({ id: `X${i}`, sym: "V" }), { edge: "R1" }));
const rho1 = d.load("R1");
const v1 = d.vEff("R1");
ok(v1 > 0 && v1 < 20, `v_eff при ρ=${rho1.toFixed(2)} равна ${v1}`);
ok(bpr(0, 20) === 20, "на пустой дороге скорость должна быть свободной");
ok(bpr(1, 20) < 20 && bpr(2, 20) < bpr(1, 20), "BPR не падает с ростом загрузки");
ok(bpr(10, 20) > 0, "BPR ушёл в ноль");

/* 11. Выбор дороги: менее загруженная и детерминированная -------------- */
const pick = new Dispatcher();
pick.addRoad(makeRoad({ id: "R1", from: "A", to: "B", length: 3000, capacity: 100, freeSpeed: 20 }));
pick.addRoad(makeRoad({ id: "R2", from: "A", to: "B", length: 3200, capacity: 100, freeSpeed: 20 }));
ok(pick.chooseRoute("A", "B")[0] === "R1", "на пустом графе должна выбираться короткая R1");

for (let i = 0; i < 300; i++) {
  pick.addPoint(Object.assign(createPoint({ id: `Q${i}`, sym: "V" }), { edge: "R1" }));
}
const route = pick.chooseRoute("A", "B");
ok(route[0] === "R2", `при загруженной R1 выбран ${route[0]}`);
ok(JSON.stringify(pick.chooseRoute("A", "B")) === JSON.stringify(route), "выбор маршрута недетерминирован");
ok(pick.chooseRoute("A", "Z") === null, "маршрут в несуществующий узел найден");

/* 12. Диспетчер: никакого setPosition ----------------------------------- */
ok(typeof d.setPosition === "undefined", "у диспетчера появился запрещённый setPosition");
assert.throws(() => d.command("A1", "setPosition", { x: 0, y: 0 }, "хочу"), /запрещена/, "setPosition прошёл!");
checks++;
assert.throws(() => d.command("A1", "assignRoute", {}, ""), /why/, "команда без why прошла");
checks++;
ok(d.journal.every((r) => typeof r.why === "string" && r.why.length > 0), "в журнале есть команда без why");

/* 13. Перегруз: маршрут меняется, а не стоит навсегда ------------------ */
const jam = new Dispatcher();
jam.addRoad(makeRoad({ id: "R1", from: "A", to: "B", length: 500, capacity: 10, freeSpeed: 10 }));
jam.addRoad(makeRoad({ id: "R2", from: "A", to: "B", length: 700, capacity: 10, freeSpeed: 10 }));
for (let i = 0; i < 40; i++) {
  const p = createPoint({ id: `J${i}`, sym: "V" });
  p.edge = "R1";
  p.route = ["R1"];
  p.mode = "move";
  p.v = { vx: 5, vy: 0 };
  jam.addPoint(p);
}
ok(jam.load("R1") > 0.95, "перегруз не создался");
jam.tick(0.1);
const rerouted = jam.journal.filter((r) => r.cmd === "reroute").length;
ok(rerouted > 0, "при перегрузе никто не перемаршрутизирован");
ok(jam.journal.some((r) => /загружено/.test(r.why)), "в журнале нет причины перегруза");

/* 14. Смена символа — только через диспетчера (нет прямой ручки) ------- */
const guest = createPoint({ id: "G:1", sym: "G" });
ok(Object.keys(guest).includes("sym"), "у точки нет символа");
ok(!("setSymbol" in guest), "у точки есть прямая ручка символа");

console.log(`OK — ${checks} проверок (§33: состояние, инварианты, загрузка, диспетчер)`);
console.log(`   символов ${Object.keys(SYMBOLS).length}, режимов ${Object.keys(MODES).length}, максимум шага в фаззинге ${maxMoved.toFixed(2)} м`);
console.log(`   бот весит ${SYMBOLS.B.p} агента; выбранный маршрут при перегрузе: ${route}`);
