/**
 * Демо-страница раннера (§32.5): «крутилка алгоритмов».
 *
 * Показывает то, что просил владелец: один случай — одно начало, а каждый день
 * свой алгоритм. Слева список 1008 случаев с поиском, справа путь дня, развилки,
 * концовка, последствия и объяснение. Собирается esbuild'ом в один IIFE и
 * вклеивается в routines-demo.html, поэтому работает с диска (file://) без сервера.
 */
import { ACTORS, POOLS, ROUTINES } from "../../data/routines.js";
import { rollRoutine, simulateDay } from "../sim/routine-runner.js";

const $ = (sel) => document.querySelector(sel);
const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

const state = {
  caseId: "R-0001",
  seed: 1,
  day: 1,
  query: "",
  facts: {}
};

/* ---------- список случаев ---------- */

function caseMatches(r) {
  if (!state.query) return true;
  const q = state.query.toLowerCase();
  const hay = `${r.id} ${ACTORS[r.actorId].name} ${POOLS[r.goalId].name} ${r.window}`.toLowerCase();
  return hay.includes(q);
}

function renderList() {
  const list = $("#case-list");
  const items = ROUTINES.filter(caseMatches).slice(0, 400);
  const rows = items
    .map(
      (r) => `<button class="case${r.id === state.caseId ? " active" : ""}" data-id="${r.id}">
        <span class="cid">${r.id}</span>
        <span class="cname">${esc(ACTORS[r.actorId].name)} — ${esc(POOLS[r.goalId].name)}</span>
        <span class="cwin">${esc(r.window)}</span>
      </button>`
    )
    .join("");
  const more = ROUTINES.filter(caseMatches).length > 400 ? `<p class="hint">Показаны первые 400 из ${ROUTINES.length}. Уточните поиск.</p>` : "";
  list.innerHTML = rows + more;
  $("#case-count").textContent = String(ROUTINES.length);
  $("#found-count").textContent = String(ROUTINES.filter(caseMatches).length);
}

/* ---------- путь дня ---------- */

function renderRun() {
  const routine = ROUTINES.find((r) => r.id === state.caseId) || ROUTINES[0];
  const run = rollRoutine(routine, { seed: state.seed, day: state.day, agent: "demo", facts: state.facts });

  $("#run-title").textContent = `${run.id} — ${run.actor}: ${run.goal.toLowerCase()}`;
  $("#run-window").textContent = run.window;

  const branchEls = new Map();
  run.branches.forEach((b, i) => branchEls.set(b.at, (branchEls.get(b.at) || []).concat({ b, i })));

  const lines = [];
  lines.push(`<li class="start">НАЧАЛО · ${esc(run.window)} — ${esc(run.actor.toLowerCase())}</li>`);
  run.steps.forEach((step, idx) => {
    lines.push(`<li class="step"><b>шаг ${idx + 1}</b> ${esc(step)}</li>`);
    for (const { b } of branchEls.get(idx) || []) {
      const answer = b.answer ? b.yes : b.no;
      lines.push(
        `<li class="branch ${b.answer ? "yes" : "no"}">
          <span class="q">? ${esc(b.q)}</span>
          <span class="a">${b.answer ? "да" : "нет"} → ${esc(answer)}</span>
          <span class="tag">${esc(b.tag)}</span>
        </li>`
      );
    }
  });
  lines.push(`<li class="end">КОНЕЦ · ${esc(run.ending)}</li>`);
  $("#path").innerHTML = lines.join("");

  const e = run.effects;
  $("#effects").innerHTML = [
    ["настроение", e.mood, e.mood > 0 ? "good" : e.mood < 0 ? "bad" : ""],
    ["деньги", e.money + " ₽", e.money > 0 ? "good" : e.money < 0 ? "bad" : ""],
    ["усталость", "+" + e.fatigue, e.fatigue >= 3 ? "bad" : ""],
    ["опоздание", e.lateMin + " мин", e.lateMin > 0 ? "bad" : ""],
    ["общение", "+" + e.social, e.social > 0 ? "good" : ""]
  ]
    .map(([k, v, cls]) => `<div class="fx ${cls}"><span>${k}</span><b>${esc(v)}</b></div>`)
    .join("");

  $("#because").textContent = run.because;
  $("#raw").textContent = run.path.join("\n");

  /* «тот же день — тот же путь»: пересчитываем и сравниваем */
  const again = rollRoutine(routine, { seed: state.seed, day: state.day, agent: "demo", facts: state.facts });
  const same = JSON.stringify(again.path) === JSON.stringify(run.path);
  $("#determinism").textContent = same ? "пересчёт того же дня дал тот же путь ✓" : "путь нестабилен ✗";
  $("#determinism").className = "det " + (same ? "ok" : "bad");

  /* сколько разных путей даёт этот случай за 10 дней вперёд */
  const paths = new Set();
  const ends = new Set();
  for (let d = state.day; d < state.day + 10; d++) {
    const r = rollRoutine(routine, { seed: state.seed, day: d, agent: "demo" });
    paths.add(JSON.stringify(r.steps) + JSON.stringify(r.branches.map((b) => b.tag + b.answer)));
    ends.add(r.ending);
  }
  $("#variety").textContent = `10 дней вперёд: ${paths.size} разных путей, ${ends.size} разных концовок`;
}

/* ---------- день мира ---------- */

function renderDay() {
  const s = simulateDay(state.seed, state.day);
  $("#day-stats").innerHTML = `
    <p><b>${s.endings}</b> исполнений, <b>${s.uniqueEndings}</b> разных концовок за день.</p>
    <ul class="top">${s.top.map(([t, n]) => `<li>${esc(t)} <span>×${n}</span></li>`).join("")}</ul>
    <p class="hint">усталость дня: +${s.effects.fatigue}, деньги: ${s.effects.money} ₽, опоздания: ${s.effects.lateMin} мин</p>`;
}

/* ---------- события ---------- */

function selectCase(id) {
  state.caseId = id;
  renderList();
  renderRun();
}

document.addEventListener("click", (ev) => {
  const btn = ev.target.closest(".case");
  if (btn) selectCase(btn.dataset.id);
});

$("#search").addEventListener("input", (ev) => {
  state.query = ev.target.value.trim();
  renderList();
});

$("#next-day").addEventListener("click", () => {
  state.day += 1;
  $("#day").value = String(state.day);
  renderRun();
  renderDay();
});

$("#reseed").addEventListener("click", () => {
  state.seed = (state.seed * 7919 + 13) % 100000;
  state.day = 1;
  $("#seed").value = String(state.seed);
  $("#day").value = "1";
  renderRun();
  renderDay();
});

$("#seed").addEventListener("change", (ev) => {
  state.seed = Number(ev.target.value) || 1;
  renderRun();
  renderDay();
});

$("#day").addEventListener("change", (ev) => {
  state.day = Math.max(1, Number(ev.target.value) || 1);
  renderRun();
});

document.querySelectorAll("input[data-fact]").forEach((box) => {
  box.addEventListener("change", () => {
    state.facts[box.dataset.fact] = box.checked;
    renderRun();
  });
});

/* ---------- старт ---------- */

renderList();
renderRun();
renderDay();
