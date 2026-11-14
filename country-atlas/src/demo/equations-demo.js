/**
 * Демо уравнений (§33): три дороги между двумя городами, точки на них и диспетчер,
 * который считает загрузку и выбирает дорогу, где меньше точек.
 *
 * Здесь видно ровно то, ради чего уравнения: точки не телепортируются (каждая едет
 * с ограничением скорости), загрузка ребра считается по весам (бот весит 0.25),
 * а ИИ перекладывает поток на свободную дорогу и объясняет решение.
 */
import { Dispatcher, makeRoad, createPoint, vmaxOf, bpr } from "../sim/point-state.js";
import { mulberry32, hashString } from "../core/rng.js";

const $ = (s) => document.querySelector(s);
const speedKmh = (v) => Math.round(v * 3.6);

const ROADS = [
  { id: "R1", from: "A", to: "B", length: 3000, capacity: 100, freeSpeed: 25, name: "Прямая" },
  { id: "R2", from: "A", to: "B", length: 3600, capacity: 120, freeSpeed: 27, name: "Объездная" },
  { id: "R3", from: "A", to: "B", length: 4400, capacity: 160, freeSpeed: 30, name: "Трасса" }
];

const state = {
  running: true,
  simTime: 0,
  vehicles: [],
  nextId: 1,
  seed: 20261114,
  botShare: 30,
  alpha: 0.15,
  rnd: mulberry32(hashString("ratgrad|eq-demo")),
  dispatcher: null,
  arrived: 0,
  totalTime: 0,
  reroutes: 0,
  lastWhy: "—",
  log: []
};

function buildDispatcher(alpha) {
  const d = new Dispatcher({ alpha, beta: 4, saturated: 0.95 });
  for (const r of ROADS) d.addRoad(makeRoad(r));
  return d;
}

function reset() {
  state.dispatcher = buildDispatcher(state.alpha);
  state.vehicles = [];
  state.nextId = 1;
  state.simTime = 0;
  state.arrived = 0;
  state.totalTime = 0;
  state.reroutes = 0;
  state.log = [];
  state.lastWhy = "—";
  state.rnd = mulberry32(hashString(`ratgrad|eq-demo|${state.seed}`));
  renderRoads();
  renderLog();
  renderStats();
}

function spawn() {
  const d = state.dispatcher;
  const isBot = state.rnd() * 100 < state.botShare;
  const sym = isBot ? "B" : "V";
  const id = `${sym}${state.nextId++}`;

  const route = d.chooseRoute("A", "B");
  if (!route || !route.length) return;

  const point = createPoint({ id, sym, x: 0, y: 0 });
  point.mode = "move";
  point.edge = route[0];
  point.route = [route[0]];
  point.progress = 0;

  const road = d.road(route[0]);
  d.addPoint(point);

  const rho = d.load(road.id);
  const v = d.vEff(road.id);
  state.lastWhy = `${id} → ${road.name}: ρ=${rho.toFixed(2)}, v≈${speedKmh(v)} км/ч` +
    (route.length > 1 ? ` (дальше ${route.slice(1).join(" → ")})` : "");
  state.log.unshift({ t: state.simTime, text: state.lastWhy });
  state.log = state.log.slice(0, 7);
  state.vehicles.push(point);
}

function tick(dt = 0.5) {
  const d = state.dispatcher;
  state.simTime += dt;

  /* спавн: примерно 1.2 точки в секунду */
  if (state.rnd() < dt * 1.2) spawn();

  for (const p of state.vehicles.slice()) {
    const road = d.road(p.edge);
    const v = d.vEff(p.edge);
    p.progress += v * dt;
    p.pos.x = (p.progress / road.length) * 100;   // прогресс в процентах — только для отрисовки
    if (p.progress >= road.length) {
      const time = road.length / Math.max(0.1, v);
      state.arrived += 1;
      state.totalTime += time;
      d.command(p.id, "despawn", {}, "доехал");
      d.points.delete(p.id);
      state.vehicles = state.vehicles.filter((x) => x !== p);
    }
  }

  /* если дорога переполнена — перекидываем часть на свободную (решение ИИ) */
  for (const r of ROADS) {
    const rho = d.load(r.id);
    if (rho <= d.saturated) continue;
    const victims = state.vehicles.filter((p) => p.edge === r.id && p.progress < 0.6 * r.length);
    for (const p of victims.slice(0, 2)) {
      const alt = ROADS.filter((x) => x.id !== r.id).sort((a, b) => d.load(a.id) - d.load(b.id))[0];
      if (!alt) continue;
      d.command(p.id, "assignRoute", { edge: alt.id, route: [alt.id] }, `R1.. ρ=${rho.toFixed(2)} → ${alt.name}`);
      d.command(p.id, "reroute", {}, `ρ=${rho.toFixed(2)} → ${alt.name}`);
      p.edge = alt.id;
      p.route = [alt.id];
      p.progress = 0;
      p.pos.x = 0;
      state.reroutes += 1;
      const text = `${p.id} переложен на ${alt.name}: ${r.name} загружена ${rho.toFixed(2)}`;
      state.log.unshift({ t: state.simTime, text });
      state.log = state.log.slice(0, 7);
      state.lastWhy = text;
    }
  }

  renderRoads();
  renderStats();
  renderLog();
}

function renderRoads() {
  const d = state.dispatcher;
  $("#roads").innerHTML = ROADS.map((r) => {
    const rho = d.load(r.id);
    const v = d.vEff(r.id);
    const onRoad = state.vehicles.filter((p) => p.edge === r.id);
    const cars = onRoad
      .map((p) => `<span class="dot ${p.sym === "B" ? "bot" : "car"}" style="left:${Math.min(100, p.progress / r.length * 100).toFixed(2)}%"></span>`)
      .join("");
    const cls = rho > 0.95 ? "jam" : rho > 0.6 ? "warn" : "";
    return `<div class="road ${cls}">
      <div class="rhead"><b>${r.name}</b><span>${(r.length / 1000).toFixed(1)} км · γ ${r.capacity}</span></div>
      <div class="track" data-road="${r.id}">${cars}</div>
      <div class="rbar"><div style="width:${Math.min(100, rho * 100).toFixed(1)}%"></div></div>
      <div class="rfoot">
        <span>ρ = <b>${rho.toFixed(2)}</b></span>
        <span>v ≈ <b>${speedKmh(v)}</b> км/ч</span>
        <span>точек: <b>${onRoad.length}</b></span>
      </div>
    </div>`;
  }).join("");
}

function renderStats() {
  const d = state.dispatcher;
  const maxRho = Math.max(...ROADS.map((r) => d.load(r.id)));
  const avg = state.arrived ? state.totalTime / state.arrived : 0;
  $("#stats").innerHTML = [
    ["в пути", state.vehicles.length],
    ["доехало", state.arrived],
    ["переложено", state.reroutes],
    ["макс. ρ", maxRho.toFixed(2)],
    ["средний путь", avg ? `${Math.round(avg)} с` : "—"]
  ].map(([k, v]) => `<div class="stat"><span>${k}</span><b>${v}</b></div>`).join("");
  $("#why").textContent = state.lastWhy;
}

function renderLog() {
  $("#log").innerHTML = state.log
    .map((l) => `<li><span>${l.t.toFixed(1)} с</span> ${l.text}</li>`)
    .join("");
}

/* ---------- управление ---------- */

$("#toggle").addEventListener("click", () => {
  state.running = !state.running;
  $("#toggle").textContent = state.running ? "Пауза" : "Продолжить";
});
$("#step").addEventListener("click", () => tick(0.5));
$("#reset").addEventListener("click", reset);
$("#bots").addEventListener("input", (e) => {
  state.botShare = Number(e.target.value);
  $("#bots-val").textContent = state.botShare + "%";
});
$("#alpha").addEventListener("input", (e) => {
  state.alpha = Number(e.target.value);
  $("#alpha-val").textContent = state.alpha.toFixed(2);
  state.dispatcher.alpha = state.alpha;
});

reset();
setInterval(() => { if (state.running) tick(0.5); }, 250);

/* для теста: детерминированный шаг без таймеров */
window.eqDemo = { tick, reset, state, ROADS };
