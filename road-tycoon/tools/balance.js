/* Балансовый прогон «ТРАССЫ» без браузера: бот играет по правилам Sim.
   Запуск: node tools/balance.js [дней] [seed]
   Показывает, за сколько игровых дней бот проходит цели, и печатает динамику. */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const DAYS = Number(process.argv[2]) || 60;
const SEED = Number(process.argv[3]) || 777;

const ROOT = path.join(__dirname, '..');
const ctx = { console };
ctx.window = ctx;
ctx.globalThis = ctx;
vm.createContext(ctx);
for (const f of ['config', 'util', 'world', 'sim']) {
  const file = path.join(ROOT, 'src', f + '.js');
  vm.runInContext(fs.readFileSync(file, 'utf8'), ctx, { filename: file });
}
const TR = ctx.TR;
const { CONFIG: C, Sim, Util: U } = TR;

const s = Sim.newGame(SEED);
const world = TR.World.build(SEED);
const dist = (a, b) => U.dist(C.cities[a].x, C.cities[a].y, C.cities[b].x, C.cities[b].y);
const activeProjects = () => s.roads.filter((r) => r.building).length + s.facilities.filter((f) => !f.ready).length;
const canStart = () => activeProjects() < Sim.maxProjects(s);

function planRoad() {
  const { comp } = Sim.connectedComponents(s);
  const main = comp[0];
  let best = null;
  for (let a = 0; a < C.cities.length; a++) {
    if (comp[a] !== main) continue;
    for (let b = 0; b < C.cities.length; b++) {
      if (comp[b] === main) continue;
      const d = dist(a, b);
      if (d < 60 || d > 780) continue;
      if (!best || d < best.d) best = { a, b, d };
    }
  }
  return best;
}

function placeFacilities() {
  for (const road of s.roads) {
    if (!road.open || road.building) continue;
    const facs = s.facilities.filter((f) => f.roadId === road.id);
    if (facs.length >= 3) continue;
    const pool = C.facilities.filter((f) => f.cat === 'service' && f.unlock <= s.level
      && (!f.minQuality || road.quality >= f.minQuality) && !f.edgeWide);
    if (!pool.length) continue;
    const key = facs.length === 0 ? (road.id % 2 ? 'cafe' : 'fuel') : pool[(road.id + facs.length * 3) % pool.length].key;
    const def = C.facilityByKey[key];
    if (s.money > def.cost * 1.25 && canStart()) {
      Sim.placeFacility(s, key, road.id, facs.length === 0 ? 0.3 : 0.3 + facs.length * 0.18, road.id % 2 ? 1 : -1);
    }
  }
}

function buildRoads() {
  const plan = planRoad();
  if (!plan) return;
  const quality = s.level >= 3 ? 2 : 1;
  const q = Sim.roadQuote(s, world, plan.a, plan.b, quality);
  if (q.ok && s.money > q.cost * 1.1 && canStart()) Sim.buildRoad(s, world, plan.a, plan.b, quality);
}

function upgradeRoads() {
  if (s.level < 2) return;
  const road = s.roads.filter((r) => r.open && !r.building && r.quality < 2)[0];
  if (!road) return;
  const cost = Sim.upgradeCost(road, 2);
  if (s.money > cost * 1.5 && canStart()) Sim.upgradeRoad(s, road.id, 2);
}

function buyUpgrades() {
  for (const key of ['crew', 'fleet', 'quality', 'marketing', 'maintenance']) {
    const info = Sim.upgradeInfo(s, key);
    if (!info.maxed && s.money > info.cost * 4) Sim.buyUpgrade(s, key);
  }
}

function beautify() {
  if (s.facilities.filter((f) => f.cat === 'city').length >= 3 || s.money < 40000) return;
  for (const road of s.roads) {
    if (!road.open || road.building || road.totalKm < 20) continue;
    for (const t of [0.1, 0.9, 0.2, 0.8, 0.5]) {
      const chk = Sim.canPlace(s, 'trees', road.id, t);
      if (chk.ok) { Sim.placeFacility(s, 'trees', road.id, t, 1); return; }
    }
  }
}

const milestones = {};
const rows = [];
let step = 0;
const maxSteps = Math.round(DAYS * 100);
for (;; step++) {
  if (step > 0) Sim.tick(s, 1);
  s.floats.length = 0;
  s.sfx.length = 0;
  s.notices.length = 0;
  const day = U.dayNumber(s.time);
  for (const o of C.objectives) {
    if (s.objDone.includes(o.id) && !milestones[o.id]) {
      milestones[o.id] = { day, money: Math.round(s.money), value: Math.round(Sim.companyValue(s)) };
    }
  }
  if (s.objDone.length === C.objectives.length) break;
  if (step >= maxSteps) break;
  if (step % 20 === 0) {
    placeFacilities();
    buildRoads();
    upgradeRoads();
    buyUpgrades();
    beautify();
  }
  if (step % 100 === 0) {
    rows.push({
      day,
      money: Math.round(s.money),
      value: Math.round(Sim.companyValue(s)),
      level: s.level,
      km: Math.round(s.roads.reduce((sum, r) => sum + (r.open ? r.totalKm : 0), 0)),
      roads: s.roads.filter((r) => r.open).length,
      facilities: s.facilities.length,
      income: Math.round(s.stats.incomeLastDay),
      expense: Math.round(s.stats.expenseLastDay),
      cars: s.vehicles.length,
    });
  }
}

const fmt = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
console.log('день  касса        стоимость    ур.  км    дорог  объектов  доход/день  расход/день  машин');
for (const r of rows) {
  console.log([
    String(r.day).padEnd(4),
    fmt(r.money).padStart(10),
    fmt(r.value).padStart(12),
    String(r.level).padStart(4),
    String(r.km).padStart(5),
    String(r.roads).padStart(6),
    String(r.facilities).padStart(9),
    fmt(r.income).padStart(11),
    fmt(r.expense).padStart(12),
    String(r.cars).padStart(6),
  ].join(' '));
}

console.log('\nцели:');
for (const o of C.objectives) {
  const m = milestones[o.id];
  console.log('  ' + (m ? '✓' : '·') + ' ' + o.title.padEnd(20) + (m ? 'день ' + m.day + ', касса ' + fmt(m.money) + ', стоимость ' + fmt(m.value) : 'не выполнена за ' + DAYS + ' дней'));
}
const done = s.objDone.length;
console.log('\nитог: ' + done + '/' + C.objectives.length + ' целей за ' + U.dayNumber(s.time) + ' дней, ' +
  'стоимость ' + fmt(Sim.companyValue(s)) + ' ₽, доход ' + fmt(s.stats.incomeLastDay) + ' ₽/день');
