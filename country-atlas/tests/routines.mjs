/**
 * Проверка каталога алгоритмов поведения (§32, ALGORITHMS.md).
 *
 * Устроено так: 1008 «случаев» хранят только начало (актор, цель, окно, вариант,
 * длина ядра). Конкретный алгоритм — шаги, развилки и концовку — собирает
 * src/sim/routine-runner.js на каждый день. Поэтому тест проверяет не «готовые
 * тексты», а две вещи сразу: (1) пулы целы и из них вообще можно собрать
 * алгоритм; (2) раннер действительно рандомизирует — разные дни дают разные пути,
 * один и тот же день даёт один и тот же путь.
 *
 * Тест ловит то, что обычно ломается: дубли id, пустые пулы, незаполненные
 * плейсхолдеры, недостижимые концовки, детерминизм, «мир зациклился».
 *
 * Запуск: node tests/routines.mjs
 */
import { ACTORS, POOLS, ROUTINES } from "../data/routines.js";
import { rollRoutine, rollById, simulateDay, contextFor } from "../src/sim/routine-runner.js";
import { mulberry32, hashString } from "../src/core/rng.js";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import assert from "node:assert/strict";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const html = readFileSync(join(root, "ALGORITHMS.md"), "utf8");

let checks = 0;
const ok = (cond, msg) => {
  assert.ok(cond, msg);
  checks++;
};

/* 1. Случаи: количество, порядок, состав ---------------------------------- */
ok(ROUTINES.length === 1008, `ожидалось 1008 случаев, а их ${ROUTINES.length}`);

const ids = new Set();
ROUTINES.forEach((r, i) => {
  ok(/^R-\d{4}$/.test(r.id), `битый id: ${r.id}`);
  ok(!ids.has(r.id), `дубль id: ${r.id}`);
  ids.add(r.id);
  ok(r.id === "R-" + String(i + 1).padStart(4, "0"), `id вне порядка: ${r.id} на месте ${i}`);
  ok(typeof r.actorId === "string" && ACTORS[r.actorId], `нет исполнителя у ${r.id}`);
  ok(typeof r.goalId === "string" && POOLS[r.goalId], `нет цели у ${r.id}: ${r.goalId}`);
  ok(typeof r.window === "string" && r.window.length > 2, `нет окна времени у ${r.id}`);
  ok(Number.isInteger(r.variant) && r.variant >= 0 && r.variant <= 7, `битый вариант у ${r.id}`);
  ok(r.core >= 3 && r.core <= 5, `ядро вне 3–5 шагов у ${r.id}: ${r.core}`);
  ok(r.branches === undefined, `случай ${r.id} всё ещё хранит готовые ветки`);
});

/* 2. Пулы: из каждой цели можно собрать алгоритм ------------------------- */
const actorIds = Object.keys(ACTORS);
const goalIds = Object.keys(POOLS);
ok(actorIds.length === 24, `ожидалось 24 исполнителя, а их ${actorIds.length}`);
ok(goalIds.length === 16, `ожидалось 16 целей, а их ${goalIds.length}`);

let sumComps = 0;
let sumEnds = 0;
let sumOpts = 0;

for (const [goalId, pool] of Object.entries(POOLS)) {
  ok(pool.name && pool.name.length > 2, `у цели ${goalId} нет имени`);
  ok(pool.steps.length >= 3, `у цели ${goalId} меньше 3 шагов`);
  ok(pool.opt.length >= 3, `у цели ${goalId} меньше 3 необязательных шагов`);
  ok(pool.comps.length >= 6, `у цели ${goalId} меньше 6 развилок`);
  ok(pool.ends.length >= 4, `у цели ${goalId} меньше 4 концовок`);

  sumComps += pool.comps.length;
  sumEnds += pool.ends.length;
  sumOpts += pool.opt.length;

  const tags = new Set();
  for (const comp of pool.comps) {
    ok(Array.isArray(comp) && comp.length === 4, `развилка цели ${goalId} не [тег, вопрос, да, нет]`);
    const [tag, q, yes, no] = comp;
    ok(typeof tag === "string" && tag.length >= 2, `пустой тег развилки в ${goalId}`);
    ok(q.endsWith("?"), `вопрос без «?» в ${goalId}: ${q}`);
    ok(q.length > 4 && yes.length > 2 && no.length > 2, `короткая развилка в ${goalId}`);
    ok(q !== yes && q !== no, `ответ повторяет вопрос в ${goalId}`);
    tags.add(tag);
  }
  ok(tags.size >= 3, `у цели ${goalId} меньше 3 разных тем развилок`);

  const ends = new Set();
  for (const [text, weight, trigger] of pool.ends) {
    ok(typeof text === "string" && text.length > 2, `пустая концовка в ${goalId}`);
    ok(!ends.has(text), `дубль концовки в ${goalId}: ${text}`);
    ends.add(text);
    ok(Number.isFinite(weight) && weight > 0, `битый вес концовки в ${goalId}: ${text}`);
    ok(trigger === null || typeof trigger === "string", `битый триггер в ${goalId}`);
  }
  ok(pool.ends.some(([, , t]) => t === null), `у цели ${goalId} нет концовки «без условий»`);
}

/* Тексты пулов — шаблоны, в них разрешены только известные места. */
const allowed = new Set(["home", "work", "stop", "tool", "good", "transit", "gap"]);
for (const [goalId, pool] of Object.entries(POOLS)) {
  for (const text of [...pool.steps, ...pool.opt, ...pool.ends.map((e) => e[0]),
                      ...pool.comps.flatMap(([, q, y, n]) => [q, y, n])]) {
    for (const m of String(text).matchAll(/\{(\w+)\}/g)) {
      ok(allowed.has(m[1]), `неизвестный плейсхолдер {${m[1]}} в цели ${goalId}`);
    }
  }
}

/* 3. Раннер: каждый случай вообще исполняется ---------------------------- */
const noPlaceholder = (text) => !/\{\w+\}/.test(text);

for (const r of ROUTINES) {
  const run = rollRoutine(r, { seed: 1, day: 1, agent: "test" });
  ok(run.id === r.id, `раннер вернул чужой случай для ${r.id}`);
  ok(run.steps.length >= 3 && run.steps.length <= 8, `${r.id}: шагов ${run.steps.length}`);
  ok(run.branches.length >= 2 && run.branches.length <= 4, `${r.id}: развилок ${run.branches.length}`);
  ok(new Set(run.branches.map((b) => b.tag)).size === run.branches.length, `${r.id}: две развилки одной темы`);
  for (const b of run.branches) {
    ok(Number.isInteger(b.at) && b.at >= 1 && b.at < run.steps.length, `${r.id}: развилка вне пути`);
    ok(typeof b.answer === "boolean", `${r.id}: развилка без ответа`);
  }
  ok(typeof run.ending === "string" && run.ending.length > 2, `${r.id}: нет концовки`);
  ok(noPlaceholder(run.ending), `${r.id}: плейсхолдер в концовке`);
  ok(run.steps.every(noPlaceholder) && run.branches.every((b) => noPlaceholder(b.q + b.yes + b.no)),
     `${r.id}: плейсхолдер в пути`);
  ok(run.path.length >= run.steps.length + 3, `${r.id}: путь короче, чем должен`);
  ok(run.path[0].startsWith("НАЧАЛО:") && run.path[run.path.length - 1].startsWith("КОНЕЦ:"),
     `${r.id}: путь без начала или конца`);

  for (const k of ["mood", "money", "fatigue", "lateMin", "social"]) {
    ok(Number.isFinite(run.effects[k]), `${r.id}: эффект ${k} не число`);
  }
  ok(run.effects.fatigue >= 1 && run.effects.fatigue <= 12, `${r.id}: усталость ${run.effects.fatigue}`);
  ok(run.effects.lateMin >= 0 && run.effects.lateMin <= 40, `${r.id}: опоздание ${run.effects.lateMin}`);
  ok(typeof run.because === "string" && run.because.length > 5, `${r.id}: нет объяснения`);
}

/* 3a. Концовка и последствия не противоречат друг другу ----------------- */
for (const r of ROUTINES) {
  for (const [seed, day] of [[1, 1], [2, 5], [3, 9]]) {
    const run = rollRoutine(r, { seed, day, agent: "c" });
    const t = run.ending;
    if (/опозд/.test(t)) ok(run.effects.lateMin >= 8, `${r.id}: «опоздал», а минут ${run.effects.lateMin}`);
    if (/заработал|чаев|преми|сверху/.test(t)) ok(run.effects.money > 0, `${r.id}: «заработал», а деньги ${run.effects.money}`);
    if (/потрат|лишн|штраф/.test(t)) ok(run.effects.money < 0, `${r.id}: «потратил», а деньги ${run.effects.money}`);
    if (/устал/.test(t)) ok(run.effects.fatigue >= 3, `${r.id}: «устал», а усталость ${run.effects.fatigue}`);
  }
}

/* 4. Детерминизм: один сид — один путь ----------------------------------- */
const sig = (run) =>
  createHash("sha256")
    .update(JSON.stringify([run.steps, run.branches.map((b) => [b.tag, b.answer]), run.ending]))
    .digest("hex");

for (const id of ["R-0001", "R-0420", "R-1008"]) {
  const a = sig(rollById(id, { seed: 7, day: 3, agent: "same" }));
  const b = sig(rollById(id, { seed: 7, day: 3, agent: "same" }));
  ok(a === b, `${id}: один сид дал разные пути`);
}

/* 5. Рандомизация: разные дни — разные пути ------------------------------ */
for (const id of ["R-0001", "R-0420", "R-1008"]) {
  const paths = new Set();
  const endings = new Set();
  for (let day = 1; day <= 60; day++) {
    const run = rollById(id, { seed: 3, day, agent: "same" });
    paths.add(JSON.stringify([run.steps, run.branches.map((b) => b.tag + b.answer)]));
    endings.add(run.ending);
  }
  ok(paths.size >= 45, `${id}: за 60 дней всего ${paths.size} разных путей — рандома мало`);
  ok(endings.size >= 3, `${id}: за 60 дней всего ${endings.size} концовок`);
}

/* 6. Факты мира важнее кубика -------------------------------------------- */
const rainRun = (() => {
  const r = ROUTINES.find((x) => POOLS[x.goalId].comps.some(([t]) => t === "weather"));
  const run = rollRoutine(r, { seed: 5, day: 5, agent: "f", facts: { weather: true } });
  return run.branches.filter((b) => b.tag === "weather");
})();
ok(rainRun.length > 0, "развилка о погоде не выпала даже при факте «погода плохая»");
ok(rainRun.every((b) => b.answer === true), "факт мира проигнорирован: погода «да», а ответ «нет»");

/* 7. Все концовки достижимы: за 400 дней пул выдаёт ≥ 80 % концовок ----- */
for (const goalId of ["commute", "haul", "service", "harvest"]) {
  const pool = POOLS[goalId];
  const routine = ROUTINES.find((r) => r.goalId === goalId);
  const seen = new Set();
  for (let day = 1; day <= 400; day++) {
    seen.add(rollRoutine(routine, { seed: 9, day, agent: "m" }).ending);
  }
  ok(seen.size >= Math.ceil(pool.ends.length * 0.8),
     `у цели ${goalId} достижимо ${seen.size} концовок из ${pool.ends.length}`);
}

/* 8. День целиком: 1008 случаев, все с концовкой, разнообразие ----------- */
const day1 = simulateDay(1, 1);
const day2 = simulateDay(1, 2);
ok(day1.endings === 1008 && day2.endings === 1008, "в дне не 1008 исполнений");
ok(day1.uniqueEndings >= 40, `за день всего ${day1.uniqueEndings} разных концовок — мир однообразен`);
ok(day1.uniqueEndings !== day2.uniqueEndings || day1.effects.fatigue !== day2.effects.fatigue,
   "день 1 и день 2 совпали — сид не влияет");
ok(day1.effects.fatigue > 0 && day1.effects.money <= 0, "эффекты дня выглядят невероятно");

/* 9. Генератор детерминирован: повторный прогон даёт байт-в-байт тот же файл */
const dataBefore = readFileSync(join(root, "data", "routines.js"), "utf8");
execFileSync(process.execPath, [join(root, "tools", "gen-routines.mjs")], { stdio: "pipe" });
const dataAfter = readFileSync(join(root, "data", "routines.js"), "utf8");
ok(dataBefore === dataAfter, "генератор недетерминирован: файл изменился после повторного запуска");

/* 10. Таблица в ALGORITHMS.md совпадает с каталогом ---------------------- */
const rows = (html.match(/^\| R-\d{4} \|/gm) || []).length;
ok(rows === 1008, `в таблице ALGORITHMS.md ${rows} строк вместо 1008`);

/* 11. Раннер не зависит от Math.random ---------------------------------- */
const runnerSrc = readFileSync(join(root, "src", "sim", "routine-runner.js"), "utf8");
ok(!/Math\.random\s*\(/.test(runnerSrc), "в раннере есть Math.random — детерминизм сломан");

/* 12. Мелочь: mulberry32 стабилен и в [0,1) ----------------------------- */
const rnd = mulberry32(hashString("ratgrad"));
let prev = null;
for (let i = 0; i < 1000; i++) {
  const v = rnd();
  ok(v >= 0 && v < 1, `mulberry32 выдал ${v}`);
  prev = v;
}
ok(prev !== null, "mulberry32 не выдал ни одного числа");

console.log(`OK — ${checks} проверок (§32, 1008 случаев, раннер, детерминизм)`);
console.log(`   пулы: ${goalIds.length} целей, ${sumComps} развилок, ${sumEnds} концовок, ${sumOpts} необязательных шагов`);
console.log(`   за день: ${day1.uniqueEndings} разных концовок на 1008 исполнений`);
