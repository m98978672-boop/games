/* ИИ §16: мозги водителей (IDM, профили, пределы), очередь на светофоре, вес ребра от загрузки
   и мэры городов с utility-решениями и журналом «почему». Всё детерминировано: один сид —
   одно поведение, у каждого агента свой поток случайности (R-16.3), поэтому добавление нового
   агента не сдвигает остальных. */
import { ROAD_CLASS } from './roads2d.js';
import { cityPopulation, classFor } from './city2d.js';
import { rankSettlements } from './world2d.js';

/* F-189: свой поток случайности у агента. Хеш сида и номера — без глобального состояния. */
export function rngFork(seed, id) {
  let s = (seed ^ Math.imul(id + 1, 0x9e3779b9)) >>> 0;
  return function next() {
    s ^= s << 13; s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}

/* R-16.6: пять характеров. T — желаемый интервал, aMax — разгон, b — торможение,
   s0 — дистанция на месте, over — «неформальное превышение» лимита, км/ч. */
export const DRIVER = {
  calm:       { id: 'calm',       name: 'спокойный',  T: 2.0, aMax: 1.2, b: 2.4, s0: 2.6, over: 4,  key: 'спокойный' },
  normal:     { id: 'normal',     name: 'обычный',    T: 1.6, aMax: 1.6, b: 2.8, s0: 2.0, over: 9,  key: 'обычный' },
  aggressive: { id: 'aggressive', name: 'агрессивный', T: 1.0, aMax: 2.0, b: 3.2, s0: 1.4, over: 18, key: 'агрессивный' },
  novice:     { id: 'novice',     name: 'новичок',    T: 2.4, aMax: 1.1, b: 2.2, s0: 3.2, over: 2,  key: 'новичок' },
  truck:      { id: 'truck',      name: 'фура',       T: 2.2, aMax: 0.9, b: 2.0, s0: 4.0, over: 0,  key: 'фура' }
};

export const PROFILE_IDS = Object.keys(DRIVER);

/* F-190: Intelligent Driver Model (R-16.4). s — дистанция до переднего (м), dv — разность
   скоростей (м/с, положительная = догоняем), v0 — желаемая скорость. */
export function idmAccel(v, v0, s, dv, profile = DRIVER.normal) {
  const { T, aMax, b, s0 } = profile;
  const free = 1 - Math.pow(Math.max(0, v) / Math.max(0.1, v0), 4);
  const sStar = s0 + Math.max(0, v * T + (v * dv) / (2 * Math.sqrt(aMax * b)));
  const gap = Math.max(0.2, s);
  const brake = Math.pow(sStar / gap, 2);
  const a = aMax * (free - brake);
  // не разгоняемся сильнее предела и не тормозим сильнее комфортного -3·b
  return Math.max(-3 * b, Math.min(aMax, a));
}

/* F-191: желаемая скорость с «неформальным превышением» (R-16.7). */
export function speedLimitKmh(cls, profile = DRIVER.normal) {
  const base = (ROAD_CLASS[cls] || ROAD_CLASS.L).speed;
  return base + (profile.over || 0);
}

/* F-192: кто за рулём — детерминированно по номеру машины и типу. */
export function pickProfile(kind, id, rand) {
  if (kind === 'truck' || kind === 'bus') return DRIVER.truck;
  const r = rand ? rand() : rngFork(id + 1, id)();
  if (r < 0.22) return DRIVER.calm;
  if (r < 0.74) return DRIVER.normal;
  if (r < 0.9) return DRIVER.aggressive;
  return DRIVER.novice;
}

/* F-193: зелёный по очереди (R-16.14): 3·√очереди + 6, зажато в 8…34 с. */
export function greenTime(queue) {
  return Math.max(8, Math.min(34, 3 * Math.sqrt(Math.max(0, queue)) + 6));
}

/* F-194: вес ребра от загрузки (R-16.17): 1 + 2.5·(плотность/ёмкость)². */
export function edgeWeight(baseMin, density, capacity) {
  const k = capacity > 0 ? Math.max(0, density) / capacity : 0;
  return baseMin * (1 + 2.5 * k * k);
}

/* ---------- мэры §16.8 ---------- */

/* R-16.26: набор решений мэра. Каждое — с ценой и условием, при котором оно вообще имеет смысл. */
export const MAYOR_ACTIONS = [
  { id: 'housing', name: 'жилой квартал', cost: 0.22, need: (m) => m.housingDemand > 1.1 },
  { id: 'school', name: 'школа', cost: 0.18, need: (m) => m.socialLoad > 0.8 },
  { id: 'hospital', name: 'больница', cost: 0.24, need: (m) => m.socialLoad > 1.2 },
  { id: 'road', name: 'расширение дороги', cost: 0.2, need: (m) => m.jams > 0.55 },
  { id: 'bypass', name: 'объездная', cost: 0.34, need: (m) => m.jams > 0.8 },
  { id: 'park', name: 'парк', cost: 0.12, need: (m) => m.mood < 0.55 },
  { id: 'industry', name: 'промзона', cost: 0.26, need: (m) => m.unemployment > 0.12 },
  { id: 'bridge', name: 'ремонт моста', cost: 0.15, need: (m) => m.bridgeAge > 40 }
];

/* F-195: utility решения (R-16.27). Пять факторов: польза, цена, политический вес,
   доступное место, тренд. Возвращает score и вклад каждого фактора — это и есть «почему». */
export function utility(mayor, action) {
  const m = mayor;
  const benefit = {
    housing: (m.housingDemand - 1) * 1.6,
    school: m.socialLoad * 0.8,
    hospital: m.socialLoad * 0.75,
    road: m.jams * 1.2,
    bypass: m.jams * 0.9,
    park: (1 - m.mood) * 1.3,
    industry: m.unemployment * 4.0,
    bridge: (m.bridgeAge - 40) / 40
  }[action.id] || 0;
  const price = -action.cost * 1.8 * (1 - m.budget);          // чем пустее бюджет, тем больнее
  const politics = 0.22 * Math.sin((m.politics || 0) + action.cost * 6);
  const space = action.id === 'housing' || action.id === 'industry' ? (m.freeLand - 0.3) * 0.7 : 0.1;
  const trend = 0.16 * Math.cos((m.day || 0) / 9 + action.cost * 4);
  const score = benefit + price + politics + space + trend;
  return { score, parts: { benefit, price, politics, space, trend } };
}

/* F-196: почему — короткая строка с факторами, которые решили дело. */
export function whyText(mayor, action, u) {
  const parts = Object.entries(u.parts).sort((a, b) => b[1] - a[1]);
  const top = parts.slice(0, 2).map(([k, v]) => {
    const name = { benefit: 'польза', price: 'цена', politics: 'политика', space: 'место', trend: 'тренд' }[k];
    return name + ' ' + (v >= 0 ? '+' : '') + v.toFixed(2);
  }).join(', ');
  return mayor.name + ': ' + action.name + ' — ' + top + ' (итог ' + u.score.toFixed(2) + ')';
}

/* Мэр города: бюджет, жильё, занятость, пробки, настроение. Всё — из населения и номера. */
export function makeMayor(town, index, ranks, rand = rngFork(424242, index)) {
  const cls = classFor(town, index, ranks);
  const pop = Math.round(cityPopulation(cls, index));
  const r = rand();
  return {
    name: town.name, x: town.x, y: town.y, index, population: pop,
    budget: 0.35 + 0.5 * r,
    housingDemand: 0.9 + 0.4 * r,
    socialLoad: 0.5 + 0.6 * r,
    jams: 0.2 + 0.5 * r,
    mood: 0.45 + 0.4 * r,
    unemployment: 0.05 + 0.12 * r,
    bridgeAge: 10 + 45 * r,
    freeLand: 0.3 + 0.4 * r,
    politics: r * 6.28,
    day: 0,
    decisions: 0,
    log: []
  };
}

/* Сборка мэров: города от 25 000 жителей (R-16.26). */
export function buildMayors(towns, ranks) {
  const r = ranks || rankSettlements(towns, 10);
  const mayors = [];
  towns.forEach((t, i) => {
    const cls = classFor(t, i, r);
    const pop = cityPopulation(cls, i);
    if (pop < 25000) return;
    mayors.push(makeMayor(t, i, r, rngFork(424242 ^ (i * 7919), i)));
  });
  return mayors;
}

/* Один игровой день: 1–3 решения (R-16.26), каждое — по максимуму utility с малым шумом. */
export function advanceMayor(mayor, journal, rand = rngFork(424242, mayor.index)) {
  mayor.day++;
  const out = [];
  const n = 1 + (rand() < 0.45 ? 1 : 0) + (rand() < 0.15 ? 1 : 0);
  for (let k = 0; k < n; k++) {
    let best = null;
    for (const action of MAYOR_ACTIONS) {
      if (!action.need(mayor)) continue;
      if (action.cost > mayor.budget) continue;
      const u = utility(mayor, action);
      const noised = u.score + (rand() - 0.5) * 0.08;        // чтобы не было монотонности
      if (!best || noised > best.noised) best = { action, u, noised };
    }
    if (!best || best.u.score <= 0) break;   // невыгодно — бюджет копится до лучших времён
    mayor.budget = Math.max(0, mayor.budget - best.action.cost);
    mayor.decisions++;
    applyDecision(mayor, best.action);
    const why = whyText(mayor, best.action, best.u);
    mayor.log.push(why);
    if (mayor.log.length > 12) mayor.log.shift();
    pushWhy(journal, { day: mayor.day, city: mayor.name, text: why }, 40);
    out.push({ day: mayor.day, city: mayor.name, action: best.action.id, text: why });
  }
  // день прошёл: спрос, пробки и настроение ползут дальше
  mayor.housingDemand = Math.max(0.6, mayor.housingDemand + (rand() - 0.45) * 0.08);
  mayor.jams = Math.min(1, Math.max(0, mayor.jams + (rand() - 0.5) * 0.1));
  mayor.mood = Math.min(1, Math.max(0, mayor.mood + (rand() - 0.55) * 0.06));
  mayor.socialLoad = Math.min(2, mayor.socialLoad + (rand() - 0.5) * 0.05);
  mayor.bridgeAge += 1 / 12;
  mayor.budget = Math.min(1, mayor.budget + 0.04);            // налоги
  return out;
}

function applyDecision(mayor, action) {
  switch (action.id) {
    case 'housing': mayor.housingDemand = Math.max(0.8, mayor.housingDemand - 0.35); mayor.freeLand = Math.max(0, mayor.freeLand - 0.1); mayor.socialLoad += 0.05; break;
    case 'school': mayor.socialLoad = Math.max(0.3, mayor.socialLoad - 0.3); mayor.mood = Math.min(1, mayor.mood + 0.05); break;
    case 'hospital': mayor.socialLoad = Math.max(0.3, mayor.socialLoad - 0.45); mayor.mood = Math.min(1, mayor.mood + 0.08); break;
    case 'road': mayor.jams = Math.max(0, mayor.jams - 0.2); break;
    case 'bypass': mayor.jams = Math.max(0, mayor.jams - 0.35); mayor.freeLand = Math.max(0, mayor.freeLand - 0.08); break;
    case 'park': mayor.mood = Math.min(1, mayor.mood + 0.22); break;
    case 'industry': mayor.unemployment = Math.max(0.02, mayor.unemployment - 0.05); mayor.jams = Math.min(1, mayor.jams + 0.06); break;
    case 'bridge': mayor.bridgeAge = 0; break;
  }
}

/* Журнал «почему» — кольцо фиксированной длины (R-16.27). */
export function pushWhy(journal, entry, cap = 40) {
  journal.push(entry);
  while (journal.length > cap) journal.shift();
  return journal;
}

/* Продвинуть всех мэров на `days` игровых дней (экономика тикает раз в день). */
export function advanceMayors(mayors, journal, days, seed = 424242) {
  const out = [];
  for (let d = 0; d < days; d++) {
    for (const m of mayors) out.push(...advanceMayor(m, journal, rngFork(seed ^ (m.index * 31), m.day + d + 1)));
  }
  return out;
}

/* Сводка для HUD: сколько мэров, сколько решений, средние показатели. */
export function mayorStats(mayors) {
  if (!mayors.length) return { count: 0, decisions: 0, jams: 0, mood: 0, budget: 0 };
  let dec = 0, jams = 0, mood = 0, budget = 0;
  for (const m of mayors) { dec += m.decisions; jams += m.jams; mood += m.mood; budget += m.budget; }
  const n = mayors.length;
  return { count: n, decisions: dec, jams: jams / n, mood: mood / n, budget: budget / n };
}
