/**
 * Инспектор ИИ (§34.8): потребности, баллы целей, выбор и журнал инструментов.
 *
 * Страница показывает ИИ не «магией», а числами: у каждого агента видно, чего ему не хватает,
 * какой балл получила каждая цель (по F-7…F-10), что выбрано и почему, какие инструменты
 * вызваны и сколько это стоит в кадре (F-37). Внизу — доля объяснённых команд (F-38).
 */
import {
  needDecay, urgency, utility, distanceCost, windowFit, goalScore, softmax,
  hazardRisk, aiBudget, budgetFits, explainability
} from "../sim/ai-formulas.js";
import { Dispatcher, makeRoad, createPoint } from "../sim/point-state.js";
import { mulberry32, hashString } from "../core/rng.js";

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

const NEED_NAMES = ["еда", "отдых", "деньги", "общение", "работа", "здоровье"];
const DECAY = [0.035, 0.02, 0.01, 0.012, 0.005, 0.004];
const GOALS = [
  { id: "eat", name: "Поесть", fits: [1, 0, 0, 0, 0, 0.2], weight: 1 },
  { id: "rest", name: "Отдохнуть", fits: [0, 1, 0, 0, 0, 0.4], weight: 1 },
  { id: "work", name: "Отработать смену", fits: [0, 0, 1, 0, 0.3, 0], weight: 1 },
  { id: "shop", name: "Купить нужное", fits: [0.4, 0, 0, 1, 0, 0], weight: 0.8 },
  { id: "social", name: "Увидеться с людьми", fits: [0, 0, 0, 0, 1, 0], weight: 0.7 },
  { id: "doctor", name: "Пойти к врачу", fits: [0, 0.2, 0, 0, 0, 1], weight: 1.2 }
];

const state = {
  t: 0,
  mu: 2,
  crowd: 3,
  hear: 12,
  agents: [],
  dispatcher: null,
  selected: 0,
  journal: [],
  tact: 0
};

function reset() {
  const rnd = mulberry32(hashString("ratgrad|ai-demo"));
  state.t = 0;
  state.tact = 0;
  state.journal = [];
  state.selected = 0;
  state.dispatcher = new Dispatcher({ alpha: 0.15, beta: 4 });
  state.dispatcher.addRoad(makeRoad({ id: "R1", from: "A", to: "B", length: 900, capacity: 60, freeSpeed: 10, name: "Центр" }));
  state.dispatcher.addRoad(makeRoad({ id: "R2", from: "A", to: "B", length: 1400, capacity: 90, freeSpeed: 12, name: "Объезд" }));

  state.agents = Array.from({ length: 6 }, (_, i) => {
    const needs = NEED_NAMES.map((_, k) => 0.25 + rnd() * 0.6);
    const id = `A-${i + 1}`;
    const point = createPoint({ id, sym: "A", x: i * 40, y: 0 });
    state.dispatcher.addPoint(point);
    return { id, needs, mood: 0.5, fatigue: 1, point, choice: null, scores: [], why: "", seen: 0, lastNeed: 0 };
  });
  step(false);
  render();
}

function decide(agent) {
  const index = state.agents.indexOf(agent);
  const distances = [120 + index * 90, 300, 800];
  const scored = GOALS.map((g, gi) => {
    const U = utility(agent.needs, g.fits, GOALS.map((x) => x.weight));
    const u = Math.max(...agent.needs.map((n) => urgency(n)));
    const travel = 60 + gi * 90;
    const fit = windowFit(state.t, state.t + 8 * 3600, 3600, travel);
    const cost = distanceCost(distances[gi % distances.length], 1.4);
    /* риск на дороге: близость толпы и перекрёстка, но не «постоянная опасность» —
     * в спокойном городе это 0.05–0.12, иначе риск съел бы любую выгоду */
    const risk = hazardRisk([state.crowd * 8, 60 + gi * 20, 400], 20) * 0.45;
    const S = goalScore({ U, u, fit, cost, risk, mu: state.mu });
    return { ...g, U, u, fit, cost, risk, S };
  }).sort((a, b) => b.S - a.S);

  const best = scored[0];
  const probs = softmax(scored.map((s) => s.S));
  agent.scores = scored;
  agent.choice = best;
  agent.choiceP = probs[0];
  agent.why =
    `голод ${(1 - agent.needs[0]).toFixed(2)}, ${best.name.toLowerCase()} в ${Math.round(distances[0])} м — ` +
    `U=${best.U.toFixed(2)}, u=${best.u.toFixed(2)}, fit=${best.fit.toFixed(2)}, ` +
    `стоимость ${best.cost.toFixed(0)} с, риск ${best.risk.toFixed(2)} → S=${best.S.toFixed(2)}`;

  const edge = state.dispatcher.load("R1") <= state.dispatcher.load("R2") ? "R1" : "R2";
  state.dispatcher.command(agent.id, "setMode", { mode: "think" }, "выбирает, что делать");
  state.dispatcher.command(agent.id, "assignRoute", { edge, route: [edge] }, agent.why);
  state.dispatcher.command(agent.id, "setTarget", { target: { x: 900 + index * 50, y: 0 } }, `цель: ${best.name.toLowerCase()}`);
  agent.edge = edge;
}

function step(paint = true) {
  state.tact += 1;
  state.t += 0.5;
  for (const a of state.agents) {
    a.needs = a.needs.map((n, k) => needDecay(n, DECAY[k], 0.5));
    a.lastNeed = a.needs[0];
    if (state.tact % 4 === 1) decide(a);
  }
  state.journal = state.dispatcher.journal.slice(-12);
  state.dispatcher.tick(0.5);
  if (paint) render();
  return state;
}

function render() {
  const agent = state.agents[state.selected] || state.agents[0];

  $("#agents").innerHTML = state.agents
    .map((a, i) => {
      const bars = a.needs
        .map((n, k) => `<span class="bar" title="${NEED_NAMES[k]}"><i style="height:${Math.round(n * 100)}%"></i></span>`)
        .join("");
      return `<button class="agent${i === state.selected ? " active" : ""}" data-i="${i}">
        <div class="ahead"><b>${a.id}</b><span>${a.choice ? esc(a.choice.name) : "—"}</span></div>
        <div class="needs">${bars}</div>
      </button>`;
    })
    .join("");

  $("#need-labels").innerHTML = `<span>потребности (${NEED_NAMES.join(" · ")})</span>`;
  $("#choice").innerHTML = `<b>${esc(agent.id)}</b> выбирает <b>${esc(agent.choice ? agent.choice.name : "—")}</b>
    <span class="pill">P = ${(agent.choiceP ?? 0).toFixed(2)}</span>`;

  $("#scores").innerHTML = agent.scores
    .map((s) => `<tr class="${s === agent.choice ? "best" : ""}">
      <td>${esc(s.name)}</td>
      <td>${s.U.toFixed(2)}</td>
      <td>${s.u.toFixed(2)}</td>
      <td>${s.fit.toFixed(2)}</td>
      <td>${s.cost.toFixed(0)}</td>
      <td>${s.risk.toFixed(2)}</td>
      <td><b>${s.S.toFixed(2)}</b></td>
    </tr>`)
    .join("");

  $("#why").textContent = agent.why || "—";

  $("#norms").innerHTML = `
    <p>Потребности: ${NEED_NAMES.map((n, k) => `${n} ${agent.needs[k].toFixed(2)}`).join(" · ")}</p>
    <p>Балл: <code>S = U·u·fit − λ·(C/600) − μ·R</code>, λ = 0.35, μ = ${state.mu.toFixed(1)}</p>
    <p>Толпа рядом: ${state.crowd} — риск растёт по F-14</p>`;

  $("#journal").innerHTML = state.journal
    .slice()
    .reverse()
    .map((r) => `<li><span>${r.cmd}</span> <b>${esc(r.point || "")}</b> — ${esc(r.why)}</li>`)
    .join("");

  const budget = aiBudget(state.agents.length * 10, 8);
  const E = explainability(state.dispatcher.journal);
  $("#budget").textContent = `${budget.toFixed(2)} мс — ${budgetFits(budget) ? "влезает" : "НЕ влезает"} в кадр`;
  $("#explain").textContent = `объяснено ${(E * 100).toFixed(0)} % команд`;
  $("#clock").textContent = `такт ${state.tact}, ${state.t.toFixed(1)} с игрового времени`;
  $("#stats").textContent = `${state.dispatcher.stats().points} точек, ${state.dispatcher.teleports} телепортов`;
}

/* ---------- события ---------- */
document.addEventListener("click", (ev) => {
  const btn = ev.target.closest(".agent");
  if (btn) {
    state.selected = Number(btn.dataset.i);
    render();
  }
});
$("#tick").addEventListener("click", () => step());
$("#tick10").addEventListener("click", () => { for (let i = 0; i < 10; i++) step(false); render(); });
$("#reset").addEventListener("click", () => reset());
$("#risk").addEventListener("input", (e) => {
  state.mu = Number(e.target.value);
  $("#risk-val").textContent = state.mu.toFixed(1);
  for (const a of state.agents) decide(a);   // вес риска меняет решения, а не только подпись
  render();
});
$("#crowd").addEventListener("input", (e) => {
  state.crowd = Number(e.target.value);
  $("#crowd-val").textContent = state.crowd;
  for (const a of state.agents) decide(a);
  render();
});

reset();
window.aiDemo = { step, reset, state };
