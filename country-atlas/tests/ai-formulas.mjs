/**
 * Проверка формул ИИ (§34).
 *
 * Главное требование владельца: «проверять минимум 20 раз с разными значениями».
 * Поэтому тест не довольствуется одним примером на формулу — он гоняет весь реестр
 * FORMULAS: 40 формул × 20 значений, плюс свойства (монотонность, границы, сумма = 1),
 * плюс крайние случаи (ρ = 1, пустые массивы, NaN), плюс интеграционные сценарии
 * «выбор цели», «бюджет кадра», «журнал решений».
 *
 * Запуск: node tests/ai-formulas.mjs
 */
import {
  FORMULAS, FORMULA_BY_ID, formulaSmoke,
  needDecay, urgency, deficit, energyByTime, moodIndex, fatigueStep,
  utility, distanceCost, windowFit, goalScore, softmax, crowdFactor, novelty,
  hazardRisk, incidentChance, grip, brakingDistance, followingGap,
  trafficIndex, routeCost, queueWait, queueLength, spawnRate, serviceResponse, alarmPriority,
  constructionPriority, budgetShare, projectsPerDay, cityHappiness, tradePrice, trustUpdate,
  memory, fuelUse, attention, perceptionRadius, reactionTime, aiBudget, budgetFits,
  explainability, fairness, oversightLoad
} from "../src/sim/ai-formulas.js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import assert from "node:assert/strict";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const doc = readFileSync(join(root, "AI.md"), "utf8");
const spec = readFileSync(join(root, "SPEC.md"), "utf8");
const page = readFileSync(join(root, "formulas.html"), "utf8");
const src = readFileSync(join(root, "src", "sim", "ai-formulas.js"), "utf8");

let checks = 0;
const ok = (cond, msg) => {
  assert.ok(cond, msg);
  checks++;
};
const close = (a, b, eps = 1e-9) => Math.abs(a - b) <= eps;

/* ---------- 1. Реестр ---------- */
ok(FORMULAS.length === 40, `формул должно быть 40, а их ${FORMULAS.length}`);
FORMULAS.forEach((f, i) => {
  ok(f.id === `F-${i + 1}`, `id вне порядка: ${f.id} на месте ${i}`);
  ok(typeof f.name === "string" && f.name.length > 3, `у ${f.id} нет имени`);
  ok(typeof f.expr === "string" && f.expr.length > 3, `у ${f.id} нет записи`);
  ok(typeof f.unit === "string" && f.unit.length > 0, `у ${f.id} нет единиц`);
  ok(typeof f.range === "string" && f.range.length > 2, `у ${f.id} нет диапазона`);
  ok(typeof f.prop === "function", `у ${f.id} нет свойства для проверки`);

  const cases = f.cases();
  ok(cases.length >= 20, `${f.id}: ${cases.length} значений вместо 20`);
  const uniq = new Set(cases.map((c) => JSON.stringify(c)));
  ok(uniq.size === cases.length, `${f.id}: есть одинаковые наборы значений`);
});

/* ---------- 2. Формулы × 20 значений ---------- */
let formulaChecks = 0;
for (const f of FORMULAS) {
  for (const args of f.cases()) {
    const out = f.fn(...args);
    const finite = Array.isArray(out) ? out.every(Number.isFinite) : Number.isFinite(out);
    ok(finite, `${f.id}: результат не конечен на ${JSON.stringify(args)}`);
    ok(f.prop(out, args), `${f.id}: свойство нарушено на ${JSON.stringify(args)} → ${out}`);
    formulaChecks++;
  }
}
ok(formulaChecks === 800, `формульных проверок ${formulaChecks}, а должно быть 800`);
const smoke = formulaSmoke();
ok(smoke.failed === 0, `смоук формул дал ${smoke.failed} провалов`);
ok(smoke.checks === 800, `смоук прогнал ${smoke.checks} значений`);

/* ---------- 3. Монотонность: там, где она обязана быть ---------- */
const monotone = (fn, from, to, n, direction, msg) => {
  let prev = fn(from);
  for (let i = 1; i < n; i++) {
    const x = from + ((to - from) * i) / (n - 1);
    const v = fn(x);
    if (direction === "up") ok(v >= prev - 1e-12, `${msg}: не растёт при ${x.toFixed(3)}`);
    else ok(v <= prev + 1e-12, `${msg}: не падает при ${x.toFixed(3)}`);
    prev = v;
  }
};
monotone((t) => needDecay(1, 0.05, t), 0, 30, 20, "down", "F-1 убывание");
monotone((n) => urgency(n), 0, 1, 20, "down", "F-3 срочность");
monotone((t) => energyByTime(t, 5), 0, 6, 20, "down", "F-4 сытость");
monotone((L) => distanceCost(L, 10), 0, 5000, 20, "up", "F-8 цена пути");
monotone((n) => crowdFactor(n), 0, 20, 20, "down", "F-12 толпа");
monotone((v) => novelty(v), 0, 20, 20, "down", "F-13 новизна");
monotone((rho) => queueWait(rho), 0, 0.99, 20, "up", "F-21 очередь");
monotone((w) => projectsPerDay(w), 0, 200, 20, "up", "F-28 проекты");
monotone((a) => reactionTime(a), 0, 1, 20, "down", "F-36 реакция");
monotone((s) => trafficIndex(s, 30), 0, 30, 20, "up", "F-19 трафик");

/* ---------- 4. Крайние случаи: нули, единицы, пустые массивы ---------- */
ok(queueWait(1) === 1800, "при ρ = 1 очередь должна упираться в потолок");
ok(queueWait(0) === 0, "пустая очередь должна ждать 0");
ok(Number.isFinite(queueWait(1.5)), "ρ > 1 не должен давать бесконечность");
ok(grip(1, 1) === 0.2, "сцепление не должно падать ниже 0.2");
ok(grip(0, 0) === 1, "сухая дорога должна иметь сцепление 1");
ok(brakingDistance(0) === 0, "стоящая машина не имеет тормозного пути");
ok(followingGap(0) === 2, "минимальная дистанция должна быть s₀");
ok(hazardRisk([], 10) === 0, "без опасностей риск должен быть 0");
ok(utility([], [], []) === 0, "без потребностей полезность 0");
ok(hazardRisk([0], 10) === 1, "опасность вплотную даёт риск 1");
ok(Math.abs(hazardRisk([1e9], 10)) < 1e-6, "далёкая опасность почти не влияет");
ok(softmax([1, 1, 1]).every((p) => close(p, 1 / 3)), "равные баллы — равные вероятности");
ok(budgetShare([]).length === 0, "пустой бюджет — пустые доли");
ok(budgetShare([0, 0, 0]).every((s) => s === 0), "нулевые приоритеты — нулевые доли");
ok(cityHappiness([], []) === 0, "пустой город — счастье 0");
ok(cityHappiness([1, 0], [1, 1]) === 0.5, "среднее счастье считается неверно");
ok(explainability([]) === 1, "пустой журнал считается объяснимым");
ok(fairness([]) === 1, "пустое распределение честно");
ok(oversightLoad(0) === 0, "без ЧП надзор не нагружен");
ok(oversightLoad(1000) > 0.999, "много ЧП — полная нагрузка");

/* ---------- 5. Обязательные соотношения между формулами ---------- */
for (let i = 0; i <= 10; i++) {
  const n = i / 10;
  ok(close(deficit(n) + n, 1), "дефицит и потребность должны дополнять друг друга");
  ok(urgency(n) >= 0 && urgency(n) <= 1, "срочность вне [0,1]");
}
for (let i = 0; i < 20; i++) {
  const f = i * 0.5;
  ok(fatigueStep(f, 1.4, "move", 0.1) >= f, "движение не может уменьшать усталость");
  ok(fatigueStep(f, 0, "rest", 0.1) <= f, "отдых не может увеличивать усталость");
  ok(fatigueStep(10, 30, "move", 1) <= 10, "усталость вышла за 10");
  ok(fatigueStep(0, 0, "rest", 1) >= 0, "усталость ушла ниже 0");
}
for (let i = 0; i < 20; i++) {
  const load = i / 19;
  ok(close(attention(load) + load, 1), "внимание должно дополнять загрузку");
  ok(perceptionRadius(20, i * 1.7) >= 20, "радиус восприятия не может быть меньше r₀");
  ok(trafficIndex(i * 1.5, 30) <= 1, "TI не может быть больше 1");
}
for (let i = 0; i < 20; i++) {
  const t = i / 19;
  ok(trustUpdate(t, 0, 1) === 0, "полное недоверие должно обнулять доверие");
  ok(trustUpdate(t, 1, 1) === 1, "полное доверие должно давать 1");
  ok(memory(1, i * 3, 10) <= 1 && memory(1, i * 3, 10) > 0, "память вне (0,1]");
  ok(tradePrice(100, t) >= 100 - 1e-9 && tradePrice(100, t) <= 120 + 1e-9, "цена вышла за 100…120");
}

/* ---------- 6. Плохие входы не превращаются в NaN ---------- */
const badInputs = [NaN, Infinity, -Infinity];
for (const bad of badInputs) {
  for (const f of FORMULAS) {
    const args = f.cases()[0].map((a) => (typeof a === "number" ? bad : a));
    let out;
    try {
      out = f.fn(...args);
    } catch {
      checks++;                    // явная ошибка — допустимое поведение
      continue;
    }
    const finite = Array.isArray(out) ? out.every(Number.isFinite) : Number.isFinite(out);
    if (finite) checks++;          // clamp спас — тоже допустимо
    else ok(false, `${f.id} вернула не-число на входе ${bad}`);
  }
}

/* ---------- 7. Сценарий «выбор цели»: 20 наборов потребностей ---------- */
const goals = [
  { id: "eat", fits: [1, 0, 0, 0, 0, 0.2] },
  { id: "rest", fits: [0, 1, 0, 0, 0, 0.4] },
  { id: "work", fits: [0, 0, 1, 0, 0.3, 0] },
  { id: "shop", fits: [0.4, 0, 0, 1, 0, 0] },
  { id: "social", fits: [0, 0, 0, 0, 1, 0] },
  { id: "doctor", fits: [0, 0.2, 0, 0, 0, 1] }
];
const weights = [1, 1, 1, 0.8, 0.7, 1.2];
let decisions = 0;
for (let i = 0; i < 20; i++) {
  const needs = [0.2 + i * 0.04, 0.9 - i * 0.04, 0.5, 0.7 - i * 0.02, 0.1 + i * 0.03, 0.6].map((v) => Math.min(1, Math.max(0, v)));
  const scored = goals.map((g) => {
    const U = utility(needs, g.fits, weights);
    const u = Math.max(...needs.map((n) => urgency(n)));
    const fit = windowFit(0, 60, 20, 5 + i);
    const cost = distanceCost(200 + i * 100, 1.4);
    const risk = hazardRisk([10 + i * 5, 200], 20);
    return { id: g.id, S: goalScore({ U, u, fit, cost, risk }) };
  });
  const best = scored.reduce((a, b) => (b.S > a.S ? b : a));
  const max = Math.max(...scored.map((s) => s.S));
  ok(close(best.S, max), "argmax цели найден неверно");
  const probs = softmax(scored.map((s) => s.S));
  ok(close(probs.reduce((a, b) => a + b, 0), 1, 1e-9), "вероятности выбора не суммируются в 1");
  ok(probs[scored.indexOf(best)] === Math.max(...probs), "argmax и softmax расходятся");
  decisions++;
}
ok(decisions === 20, "прогнано не 20 решений");

/* ---------- 8. Бюджет кадра ---------- */
ok(budgetFits(aiBudget(64, 8)), "64 точки и 8 маршрутов не влезают в кадр");
ok(!budgetFits(aiBudget(1000, 400)), "1000 точек и 400 маршрутов влезли в кадр зря");
let fitsCount = 0;
for (let n = 0; n <= 190; n += 10) {
  const fits = budgetFits(aiBudget(n, 4));
  ok(fits === (n * 0.02 + 0.2 <= 3), `бюджет при ${n} точках посчитан неверно`);
  if (fits) fitsCount++;
}
ok(fitsCount === 14, `в кадр влезает ${fitsCount} наборов вместо 14`);

/* ---------- 9. Журнал решений ---------- */
const goodJournal = Array.from({ length: 20 }, (_, i) => ({ cmd: "setMode", why: `шаг ${i}` }));
ok(explainability(goodJournal) === 1, "все команды с why — но объяснимость не 1");
ok(explainability([...goodJournal, { cmd: "setMode" }]) < 1, "команда без why не снизила объяснимость");
ok(explainability([{ why: "   " }]) === 0, "пустой why должен считаться отсутствием");

/* ---------- 10. Распределение бюджета стройки ---------- */
const projects = [
  { need: 0.9, cost: 5000 },
  { need: 0.4, cost: 1000 },
  { need: 0.2, cost: 8000 }
];
const prio = projects.map((p) => constructionPriority(p.need, p.cost));
const shares = budgetShare(prio);
ok(close(shares.reduce((a, b) => a + b, 0), 1), "доли бюджета не суммируются в 1");
ok(prio[0] > prio[2], "нужное и дешёвое должно быть выше ненужного и дорогого");
ok(fairness(shares) >= 0 && fairness(shares) <= 1, "честность вне [0,1]");

/* ---------- 11. Детерминизм и отсутствие случайности ---------- */
ok(!/Math\.random\s*\(/.test(src), "в формулах ИИ есть Math.random");
const twice = FORMULAS.map((f) => f.cases().length);
const twice2 = FORMULAS.map((f) => f.cases().length);
ok(JSON.stringify(twice) === JSON.stringify(twice2), "реестр недетерминирован");

/* ---------- 12. Документ AI.md совпадает с реестром ---------- */
const detailsCount = (doc.match(/<details><summary>F-/g) || []).length;
ok(detailsCount === 40, `в AI.md ${detailsCount} таблиц проверок вместо 40`);
const rowsPerBlock = [...doc.matchAll(/<details><summary>F-\d+\. [^<]+<\/summary>([\s\S]*?)<\/details>/g)]
  .map((m) => (m[1].match(/^\| \d+ \|/gm) || []).length);
ok(rowsPerBlock.length === 40, "не все блоки проверок на месте");
ok(rowsPerBlock.every((n) => n >= 20), `есть блок с ${Math.min(...rowsPerBlock)} значениями`);
for (const f of FORMULAS) {
  ok(doc.includes(`| ${f.id} |`), `в AI.md нет строки формулы ${f.id}`);
  ok(doc.includes(f.name), `в AI.md нет названия «${f.name}»`);
}
ok((doc.match(/✓/g) || []).length >= 800, "в таблицах проверок меньше 800 галочек");
ok(doc.includes("20 значений"), "в AI.md не сказано про правило 20 значений");

/* ---------- 13. Закон промта: формулы записаны и в SPEC.md ---------- */
ok(spec.includes("Закон промта"), "в SPEC.md нет закона промта (0.4)");
const specRows = (spec.match(/^\| F-\d+ \|/gm) || []).length;
ok(specRows === 40, `в SPEC.md ${specRows} строк формул вместо 40`);
for (const f of FORMULAS) {
  ok(spec.includes(`| ${f.id} |`), `в промте нет формулы ${f.id}`);
  ok(spec.includes(f.expr), `в промте нет записи формулы ${f.id}: ${f.expr}`);
  ok(spec.includes(f.name), `в промте нет названия формулы ${f.id}`);
}
ok((spec.match(/\| 20\/20 \|/g) || []).length === 40, "в промте не у всех формул стоит «20/20»");
ok(spec.includes("## 34. ИИ и его инструменты"), "раздел §34 пропал из промта");

/* ---------- 14. Страница формул собирается из реестра ---------------- */
const pageCards = (page.match(/<section class="card"/g) || []).length;
ok(pageCards === 40, `на странице формул ${pageCards} карточек вместо 40`);
const pageRows = (page.match(/<tr><td>\d+<\/td>/g) || []).length;
ok(pageRows === 800, `на странице формул ${pageRows} строк значений вместо 800`);
for (const f of FORMULAS) {
  ok(page.includes(`id="${f.id}"`), `на странице нет якоря ${f.id}`);
  ok(page.includes(f.name), `на странице нет формулы «${f.name}»`);
}

console.log(`OK — ${checks} проверок (§34: ${FORMULAS.length} формул, ${formulaChecks} значений, промт и страница сверены)`);
console.log(`   формул: ${FORMULAS.length}, значений: ${formulaChecks}, с проверкой ≥ 20: ${FORMULAS.length}`);
console.log(`   в AI.md: ${detailsCount} таблиц проверок, ${rowsPerBlock.reduce((a, b) => a + b, 0)} строк значений`);
