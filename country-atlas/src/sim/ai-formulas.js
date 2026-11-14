/**
 * Формулы ИИ Ратграда (§34).
 *
 * Правило проекта: формула попадает в ИИ только после того, как её проверили
 * **минимум 20 раз с разными значениями**. Поэтому здесь не «набор функций», а реестр
 * FORMULAS: у каждой записи есть id, человеческая запись, единицы, диапазон, генератор
 * 20 значений и свойство, которое обязано выполняться на каждом значении.
 *
 * `node tests/ai-formulas.mjs` прогоняет реестр и падает, если у формулы меньше 20
 * значений или свойство нарушено. `node tools/gen-ai-doc.mjs` печатает по этому же
 * реестру таблицу проверок в AI.md — то есть таблицы в документе не «написаны руками»,
 * а посчитаны тем же кодом, что и работает в игре.
 *
 * Единицы: СИ (метры, секунды, рубли), доли — 0…1, если не сказано иное.
 */

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
const num = (v, name = "значение") => {
  if (!Number.isFinite(v)) throw new Error(`${name} должно быть числом, а оно ${v}`);
  return v;
};

/* ================================================================== *
 * 1. Потребности: как они убывают и как превращаются в срочность
 * ================================================================== */

/** F-1. Убывание потребности: n(t) = clamp(n0 − δ·t, 0, 1). */
export const needDecay = (n0, delta, t) => clamp01(num(n0) - num(delta) * Math.max(0, num(t)));

/** F-2. Дефицит: d = 1 − n. Удобно, потому что «хочу» — это то, чего не хватает. */
export const deficit = (n) => clamp01(1 - num(n));

/** F-3. Срочность с порогом: u = d^γ, γ = 1.7. Пустой желудок давит сильнее, чем полный. */
export const urgency = (n, gamma = 1.7) => Math.pow(deficit(n), num(gamma, "gamma"));

/** F-4. Голод по времени: energy(t) = clamp(1 − t/T, 0, 1), T — сколько часов сыт. */
export const energyByTime = (t, T = 5) => clamp01(1 - Math.max(0, num(t)) / Math.max(0.1, num(T, "T")));

/** F-5. Настроение как свёртка: mood = clamp(0.6·sat + 0.3·social + 0.1·health, −1, 1). */
export const moodIndex = (sat, social, health) =>
  clamp(0.6 * num(sat, "sat") + 0.3 * num(social, "social") + 0.1 * num(health, "health"), -1, 1);

/** F-6. Усталость за шаг: f' = clamp(f + k_move·v·dt + k_work·dt − k_rest·dt, 0, 10). */
export const fatigueStep = (f, v, mode, dt, k = { move: 0.004, work: 0.02, rest: 0.08 }) => {
  const h = clamp(num(dt, "dt"), 0, 1);
  const speed = Math.max(0, num(v, "v"));
  let d = 0;
  if (mode === "move" || mode === "ride") d += k.move * speed * h;
  else if (mode === "work") d += k.work * h;
  else if (mode === "rest") d -= k.rest * h;
  return clamp(num(f, "f") + d, 0, 10);
};

/* ================================================================== *
 * 2. Оценка цели: что делать прямо сейчас (utility AI)
 * ================================================================== */

/** F-7. Полезность цели: U = Σ w_k · d_k · fit(g,k). */
export const utility = (needs, fits, weights) =>
  needs.reduce((s, n, i) => s + (weights[i] ?? 1) * deficit(n) * (fits[i] ?? 0), 0);

/** F-8. Цена расстояния: C_dist = L / v_eff (то же уравнение, что в §33). */
export const distanceCost = (L, vEff) => Math.max(0, num(L, "L")) / Math.max(0.1, num(vEff, "vEff"));

/** F-9. Попадание в окно времени: fit = clamp((end − now − travel)/duration, 0, 1). */
export const windowFit = (now, end, duration, travel) => {
  const slack = num(end, "end") - num(now, "now") - num(travel, "travel");
  const d = Math.max(0.1, num(duration, "duration"));
  return clamp01(slack / d);
};

/** F-10. Итоговый балл цели: S = U·u·fit − λ·(C/600) − μ·R, C в секундах, 600 с = 1 «цена-единица».
 * Выбор — максимум, ничья по id. */
export const goalScore = ({ U, u, fit, cost, risk, lambda = 0.35, mu = 2 }) =>
  num(U, "U") * num(u, "u") * num(fit, "fit") - lambda * (num(cost, "cost") / 600) - mu * num(risk, "risk");

/** F-11. Мягкий выбор для объяснения: P_i = exp(S_i/τ) / Σ exp(S_j/τ). */
export const softmax = (scores, tau = 0.3) => {
  const t = Math.max(0.01, num(tau, "tau"));
  const m = Math.max(...scores.map((s) => num(s)));
  const ex = scores.map((s) => Math.exp((s - m) / t));
  const sum = ex.reduce((a, b) => a + b, 0);
  return ex.map((e) => e / sum);
};

/** F-12. Толпа отталкивает: crowd = 1 / (1 + k·n_near). Не идти туда, где уже тесно. */
export const crowdFactor = (nNear, k = 0.35) => 1 / (1 + Math.max(0, num(nNear)) * num(k, "k"));

/** F-13. Новизна места: novelty = 1 / (1 + visits). */
export const novelty = (visits) => 1 / (1 + Math.max(0, num(visits)));

/* ================================================================== *
 * 3. Риск и безопасность
 * ================================================================== */

/** F-14. Риск как средняя близость опасностей: R = (1/n)·Σ 1/(1 + d_i/d₀), в [0, 1]. */
export const hazardRisk = (distances, d0 = 20) => {
  if (!distances.length) return 0;
  const sum = distances.reduce((s, d) => s + 1 / (1 + Math.max(0, num(d)) / Math.max(0.1, num(d0))), 0);
  return clamp01(sum / distances.length);
};

/** F-15. Вероятность ДТП за час: p = p0·(1 + α·v²)·(1 + β·weather)·(1 + γ·ρ), потолок 0.05. */
export const incidentChance = (p0, speed, weather = 0, rho = 0, { alpha = 0.0006, beta = 0.7, gamma = 0.4 } = {}) =>
  Math.min(0.05, Math.max(0, num(p0, "p0")) * (1 + alpha * Math.pow(Math.max(0, num(speed)), 2))
    * (1 + beta * clamp01(num(weather))) * (1 + gamma * Math.max(0, num(rho))));

/** F-16. Сцепление: grip = 1 − 0.3·rain − 0.5·snow, в [0.2, 1]. */
export const grip = (rain = 0, snow = 0) => clamp(1 - 0.3 * clamp01(num(rain)) - 0.5 * clamp01(num(snow)), 0.2, 1);

/** F-17. Тормозной путь: d = v² / (2·a·grip). */
export const brakingDistance = (v, a = 6, g = 1) =>
  Math.pow(Math.max(0, num(v, "v")), 2) / (2 * Math.max(0.1, num(a, "a")) * Math.max(0.1, num(g, "g")));

/** F-18. Дистанция следования: s* = s0 + v·T + v·Δv / (2√(a·b)). */
export const followingGap = (v, dv = 0, T = 1.2, a = 3, b = 4, s0 = 2) =>
  s0 + Math.max(0, num(v)) * Math.max(0, num(T)) +
  (Math.max(0, num(v)) * num(dv)) / (2 * Math.sqrt(Math.max(0.1, num(a)) * Math.max(0.1, num(b))));

/* ================================================================== *
 * 4. Дороги, очередь, время
 * ================================================================== */

/** F-19. Индекс трафика: TI = v_eff / v_free, 0 — стоит, 1 — свободно. */
export const trafficIndex = (vEff, vFree) => clamp01(num(vEff) / Math.max(0.1, num(vFree, "vFree")));

/** F-20. Обобщённая стоимость маршрута: G = Σ L/v_eff + w_t·повороты + w_s·штрафы. */
export const routeCost = (legs, turns = 0, penalties = 0, { wt = 3, ws = 1 } = {}) =>
  legs.reduce((s, [L, v]) => s + distanceCost(L, v), 0) + wt * Math.max(0, num(turns)) + ws * Math.max(0, num(penalties));

/** F-21. Ожидание в очереди (M/M/1): W = ρ / (μ·(1−ρ)), при ρ ≥ 1 — потолок. */
export const queueWait = (rho, mu = 0.5, capSeconds = 1800) => {
  const r = clamp(num(rho), 0, 0.999);
  return Math.min(capSeconds, r / Math.max(1e-6, num(mu, "mu") * (1 - r)));
};

/** F-22. Длина очереди по Литтлу: L_q = λ·W. */
export const queueLength = (lambda, W) => Math.max(0, num(lambda)) * Math.max(0, num(W));

/** F-23. Интенсивность появления: λ = λ0·(1 + demand)·(1 − ρ), но не меньше нуля. */
export const spawnRate = (lambda0, demand = 0, rho = 0) =>
  Math.max(0, num(lambda0, "lambda0") * (1 + num(demand)) * (1 - clamp01(num(rho))));

/** F-24. Время отклика службы: T = t_alert + L/v_eff + t_prep. */
export const serviceResponse = (tAlert, L, vEff, tPrep = 45) =>
  Math.max(0, num(tAlert)) + distanceCost(L, vEff) + Math.max(0, num(tPrep));

/** F-25. Приоритет тревоги: A = urgency·severity·affected. */
export const alarmPriority = (u, severity, affected) =>
  clamp01(num(u)) * clamp01(num(severity)) * Math.max(0, num(affected));

/* ================================================================== *
 * 5. Экономика, город, граница
 * ================================================================== */

/** F-26. Приоритет стройки: P = need^1.5 / cost (§31.6). */
export const constructionPriority = (need, cost) =>
  Math.pow(clamp01(num(need, "need")), 1.5) / Math.max(0.01, num(cost, "cost"));

/** F-27. Доля бюджета: share_i = P_i / Σ P. */
export const budgetShare = (priorities) => {
  const sum = priorities.reduce((s, p) => s + Math.max(0, num(p)), 0);
  return priorities.map((p) => (sum <= 0 ? 0 : Math.max(0, num(p)) / sum));
};

/** F-28. Сколько проектов в день: N = 1 + floor(workers / 40), потолок 4. */
export const projectsPerDay = (workers) => clamp(1 + Math.floor(Math.max(0, num(workers)) / 40), 1, 4);

/** F-29. Счастье города: H = Σ w_i·sat_i / Σ w_i. */
export const cityHappiness = (sats, weights) => {
  const w = weights || sats.map(() => 1);
  const sw = w.reduce((s, x) => s + Math.max(0, num(x)), 0);
  if (sw <= 0) return 0;
  return clamp01(sats.reduce((s, v, i) => s + clamp01(num(v)) * Math.max(0, w[i]), 0) / sw);
};

/** F-30. Цена с учётом доверия: price = base·(1 + t_rate·(1 − trust)). */
export const tradePrice = (base, trust, tRate = 0.2) =>
  Math.max(0, num(base, "base")) * (1 + clamp01(num(tRate)) * (1 - clamp01(num(trust))));

/** F-31. Доверие обновляется как EMA: T' = clamp(T + α·(outcome − T), 0, 1). */
export const trustUpdate = (trust, outcome, alpha = 0.25) =>
  clamp01(num(trust) + Math.max(0, num(alpha)) * (clamp01(num(outcome)) - num(trust)));

/** F-32. Забывание: M(t) = M0·exp(−t/τ). */
export const memory = (m0, t, tau = 30) =>
  clamp01(num(m0, "m0") * Math.exp(-Math.max(0, num(t)) / Math.max(0.1, num(tau, "tau"))));

/** F-33. Расход топлива: fuel = rate·v·dt·(1 + 0.0002·v²). */
export const fuelUse = (rate, v, dt) =>
  Math.max(0, num(rate, "rate")) * Math.max(0, num(v)) * Math.max(0, num(dt)) * (1 + 0.0002 * Math.pow(Math.max(0, num(v)), 2));

/* ================================================================== *
 * 6. Внимание, восприятие, бюджет ИИ
 * ================================================================== */

/** F-34. Внимание: A = clamp(1 − load, 0, 1), load — доля занятости P0. */
export const attention = (load) => clamp01(1 - clamp01(num(load)));

/** F-35. Радиус восприятия: r = r0·(1 + 0.1·log2(1 + v)). Быстрее — видит дальше. */
export const perceptionRadius = (r0, speed) =>
  Math.max(0, num(r0, "r0")) * (1 + 0.1 * Math.log2(1 + Math.max(0, num(speed))));

/** F-36. Время реакции: t = 0.4 + 2.6·(1 − alert), в [0.4, 3.0]. */
export const reactionTime = (alert) => 0.4 + 2.6 * (1 - clamp01(num(alert)));

/** F-37. Бюджет кадра: B = n·c_point + m·c_route, должно быть ≤ 3 мс. */
export const aiBudget = (nPoints, nRoutes, cPoint = 0.02, cRoute = 0.05) =>
  Math.max(0, num(nPoints)) * Math.max(0, num(cPoint)) + Math.max(0, num(nRoutes)) * Math.max(0, num(cRoute));

export const budgetFits = (ms, frameBudget = 3) => ms <= frameBudget;

/** F-38. Объяснимость: E = доля команд с why; обязана быть 1. */
export const explainability = (commands) => {
  if (!commands.length) return 1;
  const withWhy = commands.filter((c) => typeof c.why === "string" && c.why.trim().length > 0).length;
  return withWhy / commands.length;
};

/** F-39. Честность распределения: F = 1 − max_share. */
export const fairness = (shares) => {
  const list = shares.map((s) => Math.max(0, num(s)));
  const sum = list.reduce((a, b) => a + b, 0);
  if (sum <= 0) return 1;
  return clamp01(1 - Math.max(...list) / sum);
};

/** F-40. Нагрузка на надзор: S = 1 − exp(−incidents/τ), сколько внимания съедают ЧП. */
export const oversightLoad = (incidents, tau = 5) =>
  clamp01(1 - Math.exp(-Math.max(0, num(incidents)) / Math.max(0.1, num(tau, "tau"))));

/* ================================================================== *
 * 7. Реестр: здесь формула становится «разрешённой»
 * ================================================================== */

const seq = (from, to, n = 20) => Array.from({ length: n }, (_, i) => from + ((to - from) * i) / (n - 1));

/**
 * Запись реестра:
 *   id, name, expr — человеческая запись
 *   unit, range     — что на выходе
 *   fn              — сама функция
 *   cases()         — ровно 20 наборов аргументов (разные значения!)
 *   prop(out, args) — свойство, которое обязано выполняться на каждом значении
 */
export const FORMULAS = [
  {
    id: "F-1", name: "Убывание потребности",
    expr: "n(t) = clamp(n₀ − δ·t, 0, 1)", unit: "доля", range: "[0, 1]",
    fn: (n0, d, t) => needDecay(n0, d, t),
    cases: () => seq(0, 0.95, 20).map((n0, i) => [n0, 0.02 + i * 0.004, i * 0.7]),
    prop: (out) => out >= 0 && out <= 1
  },
  {
    id: "F-2", name: "Дефицит", expr: "d = 1 − n", unit: "доля", range: "[0, 1]",
    fn: (n) => deficit(n),
    cases: () => seq(0, 1, 20).map((n) => [n]),
    prop: (out, [n]) => Math.abs(out - (1 - n)) < 1e-12
  },
  {
    id: "F-3", name: "Срочность с порогом", expr: "u = d^γ, γ = 1.7", unit: "доля", range: "[0, 1]",
    fn: (n, g) => urgency(n, g),
    cases: () => seq(0, 1, 20).map((n, i) => [n, 1 + i * 0.05]),
    prop: (out, [n]) => out >= 0 && out <= 1 && (n >= 0.999 ? out < 1e-9 : true)
  },
  {
    id: "F-4", name: "Сытость по времени", expr: "energy = clamp(1 − t/T, 0, 1)", unit: "доля", range: "[0, 1]",
    fn: (t, T) => energyByTime(t, T),
    cases: () => seq(0, 10, 20).map((t, i) => [t, 2 + i * 0.4]),
    prop: (out) => out >= 0 && out <= 1
  },
  {
    id: "F-5", name: "Настроение", expr: "mood = clamp(0.6·sat + 0.3·social + 0.1·health, −1, 1)", unit: "доля", range: "[−1, 1]",
    fn: (s, so, h) => moodIndex(s, so, h),
    cases: () => seq(-1, 1, 20).map((s, i) => [s, (i % 5) / 2 - 0.5, ((i % 3) - 1)]),
    prop: (out) => out >= -1 && out <= 1
  },
  {
    id: "F-6", name: "Усталость за шаг", expr: "f' = clamp(f + k_move·v·dt + k_work·dt − k_rest·dt, 0, 10)", unit: "баллы", range: "[0, 10]",
    fn: (f, v, mode, dt) => fatigueStep(f, v, mode, dt),
    cases: () => seq(0, 9.5, 20).map((f, i) => [f, i * 1.6, ["move", "work", "rest"][i % 3], 0.1 + (i % 4) * 0.2]),
    prop: (out) => out >= 0 && out <= 10
  },
  {
    id: "F-7", name: "Полезность цели", expr: "U = Σ w_k·d_k·fit(g,k)", unit: "баллы", range: "[0, Σw]",
    fn: (needs, fits, weights) => utility(needs, fits, weights),
    cases: () => seq(0, 1, 20).map((n) => [[n, 1 - n, 0.5], [1, 0.5, 0], [1, 1, 1]]),
    prop: (out) => out >= 0 && out <= 3.0000001
  },
  {
    id: "F-8", name: "Цена расстояния", expr: "C = L / v_eff", unit: "секунды", range: "[0, ∞)",
    fn: (L, v) => distanceCost(L, v),
    cases: () => seq(50, 5000, 20).map((L, i) => [L, 1 + i * 1.5]),
    prop: (out) => out >= 0 && Number.isFinite(out)
  },
  {
    id: "F-9", name: "Попадание в окно", expr: "fit = clamp((end − now − travel)/duration, 0, 1)", unit: "доля", range: "[0, 1]",
    fn: (now, end, dur, travel) => windowFit(now, end, dur, travel),
    cases: () => seq(0, 19, 20).map((now) => [now, 20, 2, 0.5]),
    prop: (out) => out >= 0 && out <= 1
  },
  {
    id: "F-10", name: "Итоговый балл цели", expr: "S = U·u·fit − λ·(C/600) − μ·R", unit: "баллы", range: "(−∞, Σw]",
    fn: (o) => goalScore(o),
    cases: () => seq(0, 1, 20).map((x) => [{ U: 1.5, u: x, fit: 1, cost: 100 * (1 - x), risk: 0.1 * x }]),
    prop: (out) => Number.isFinite(out) && out <= 1.5
  },
  {
    id: "F-11", name: "Мягкий выбор (softmax)", expr: "P_i = softmax(S/τ), ΣP = 1", unit: "доля", range: "[0, 1]",
    fn: (s, tau) => softmax(s, tau),
    cases: () => seq(0, 1.9, 20).map((x) => [[0, x, 0.5], 0.2 + x * 0.5]),
    prop: (out) => Math.abs(out.reduce((a, b) => a + b, 0) - 1) < 1e-9
  },
  {
    id: "F-12", name: "Отталкивание толпой", expr: "crowd = 1/(1 + k·n)", unit: "доля", range: "(0, 1]",
    fn: (n, k) => crowdFactor(n, k),
    cases: () => seq(0, 19, 20).map((n, i) => [n, 0.1 + i * 0.06]),
    prop: (out) => out > 0 && out <= 1
  },
  {
    id: "F-13", name: "Новизна места", expr: "novelty = 1/(1 + visits)", unit: "доля", range: "(0, 1]",
    fn: (v) => novelty(v),
    cases: () => seq(0, 19, 20).map((v) => [v]),
    prop: (out) => out > 0 && out <= 1
  },
  {
    id: "F-14", name: "Риск по близости опасностей", expr: "R = (1/n)·Σ 1/(1 + d_i/d₀)", unit: "доля", range: "[0, 1]",
    fn: (d, d0) => hazardRisk(d, d0),
    cases: () => seq(0, 19, 20).map((x, i) => [[x, x * 2, 100 - x], 5 + i]),
    prop: (out) => out >= 0 && out <= 1
  },
  {
    id: "F-15", name: "Вероятность ДТП за час", expr: "p = min(0.05, p₀(1+αv²)(1+βw)(1+γρ))", unit: "доля", range: "[0, 0.05]",
    fn: (p0, v, w, rho) => incidentChance(p0, v, w, rho),
    cases: () => seq(0, 1, 20).map((x, i) => [0.001 + i * 0.0004, x * 120, x, x * 2]),
    prop: (out) => out >= 0 && out <= 0.05
  },
  {
    id: "F-16", name: "Сцепление с дорогой", expr: "grip = clamp(1 − 0.3·rain − 0.5·snow, 0.2, 1)", unit: "доля", range: "[0.2, 1]",
    fn: (r, s) => grip(r, s),
    cases: () => seq(0, 1, 20).map((x) => [x > 0.5 ? 1 : x, x <= 0.5 ? 0 : x - 0.5]),
    prop: (out) => out >= 0.2 && out <= 1
  },
  {
    id: "F-17", name: "Тормозной путь", expr: "d = v²/(2·a·grip)", unit: "метры", range: "[0, ∞)",
    fn: (v, a, g) => brakingDistance(v, a, g),
    cases: () => seq(0, 33, 20).map((v, i) => [v, 3 + (i % 4), 0.2 + (i % 5) * 0.2]),
    prop: (out) => out >= 0 && Number.isFinite(out)
  },
  {
    id: "F-18", name: "Дистанция следования", expr: "s* = s₀ + v·T + v·Δv/(2√(a·b))", unit: "метры", range: "[s₀, ∞)",
    fn: (v, dv, T) => followingGap(v, dv, T),
    cases: () => seq(0, 33, 20).map((v, i) => [v, (i % 5) - 1, 0.8 + (i % 3) * 0.3]),
    prop: (out) => out >= 2
  },
  {
    id: "F-19", name: "Индекс трафика", expr: "TI = v_eff / v_free", unit: "доля", range: "[0, 1]",
    fn: (v, vf) => trafficIndex(v, vf),
    cases: () => seq(0, 1, 20).map((x) => [x * (10 + x * 20), 30]),
    prop: (out) => out >= 0 && out <= 1
  },
  {
    id: "F-20", name: "Стоимость маршрута", expr: "G = Σ L/v_eff + w_t·повороты + w_s·штрафы", unit: "секунды", range: "[0, ∞)",
    fn: (legs, turns, pen) => routeCost(legs, turns, pen),
    cases: () => seq(0, 19, 20).map((x) => [[[1000, 10 + x], [500, 20]], x % 4, x % 3]),
    prop: (out) => out >= 0 && Number.isFinite(out)
  },
  {
    id: "F-21", name: "Ожидание в очереди (M/M/1)", expr: "W = min(cap, ρ/(μ(1−ρ)))", unit: "секунды", range: "[0, cap]",
    fn: (rho, mu) => queueWait(rho, mu),
    cases: () => seq(0, 0.99, 20).map((r, i) => [r, 0.2 + i * 0.05]),
    prop: (out) => out >= 0 && out <= 1800
  },
  {
    id: "F-22", name: "Длина очереди (Литтл)", expr: "L_q = λ·W", unit: "точки", range: "[0, ∞)",
    fn: (l, W) => queueLength(l, W),
    cases: () => seq(0, 1.9, 20).map((l) => [l, 10 + l * 30]),
    prop: (out) => out >= 0
  },
  {
    id: "F-23", name: "Интенсивность появления", expr: "λ = max(0, λ₀(1+demand)(1−ρ))", unit: "точек/с", range: "[0, ∞)",
    fn: (l0, d, rho) => spawnRate(l0, d, rho),
    cases: () => seq(0, 1, 20).map((x) => [0.5 + x * 2, x, x * 0.9]),
    prop: (out) => out >= 0
  },
  {
    id: "F-24", name: "Время отклика службы", expr: "T = t_alert + L/v_eff + t_prep", unit: "секунды", range: "[0, ∞)",
    fn: (ta, L, v, tp) => serviceResponse(ta, L, v, tp),
    cases: () => seq(0, 19, 20).map((x) => [x, 1000 + x * 100, 10 + x, 30 + x]),
    prop: (out) => out >= 0
  },
  {
    id: "F-25", name: "Приоритет тревоги", expr: "A = u·severity·affected", unit: "баллы", range: "[0, ∞)",
    fn: (u, s, a) => alarmPriority(u, s, a),
    cases: () => seq(0, 0.95, 20).map((u, i) => [u, i / 20 + 0.05, 1 + (i % 10)]),
    prop: (out) => out >= 0
  },
  {
    id: "F-26", name: "Приоритет стройки", expr: "P = need^1.5 / cost", unit: "баллы/₽", range: "[0, ∞)",
    fn: (need, cost) => constructionPriority(need, cost),
    cases: () => seq(0, 1, 20).map((n, i) => [n, 1000 + i * 900]),
    prop: (out) => out >= 0
  },
  {
    id: "F-27", name: "Доля бюджета", expr: "share_i = P_i / ΣP", unit: "доля", range: "[0, 1]",
    fn: (p) => budgetShare(p),
    cases: () => seq(0, 1, 20).map((x, i) => [[x, 1 - x, 0.5 + i * 0.01]]),
    prop: (out) => Math.abs(out.reduce((a, b) => a + b, 0) - 1) < 1e-9
  },
  {
    id: "F-28", name: "Проектов в день", expr: "N = clamp(1 + floor(workers/40), 1, 4)", unit: "штук", range: "[1, 4]",
    fn: (w) => projectsPerDay(w),
    cases: () => seq(0, 200, 20).map((w) => [w]),
    prop: (out) => out >= 1 && out <= 4 && Number.isInteger(out)
  },
  {
    id: "F-29", name: "Счастье города", expr: "H = Σ w·sat / Σ w", unit: "доля", range: "[0, 1]",
    fn: (s, w) => cityHappiness(s, w),
    cases: () => seq(0, 1, 20).map((x, i) => [[x, 1 - x * 0.5], [1, 2 + (i % 3)]]),
    prop: (out) => out >= 0 && out <= 1
  },
  {
    id: "F-30", name: "Цена с учётом доверия", expr: "price = base·(1 + 0.2(1 − trust))", unit: "₽", range: "[base, 1.2·base]",
    fn: (b, t) => tradePrice(b, t),
    cases: () => seq(0, 1, 20).map((t, i) => [100 + i * 50, t]),
    prop: (out, [b]) => out >= b - 1e-9 && out <= b * 1.2 + 1e-9
  },
  {
    id: "F-31", name: "Обновление доверия", expr: "T' = clamp(T + α(outcome − T), 0, 1)", unit: "доля", range: "[0, 1]",
    fn: (t, o, a) => trustUpdate(t, o, a),
    cases: () => seq(0, 1, 20).map((x, i) => [x, i / 19, 0.1 + (i % 4) * 0.1]),
    prop: (out) => out >= 0 && out <= 1
  },
  {
    id: "F-32", name: "Забывание", expr: "M = M₀·exp(−t/τ)", unit: "доля", range: "[0, 1]",
    fn: (m, t, tau) => memory(m, t, tau),
    cases: () => seq(0, 19, 20).map((t, i) => [1 - i * 0.03, t, 5 + i]),
    prop: (out) => out >= 0 && out <= 1
  },
  {
    id: "F-33", name: "Расход топлива", expr: "fuel = rate·v·dt·(1 + 0.0002v²)", unit: "литры", range: "[0, ∞)",
    fn: (r, v, dt) => fuelUse(r, v, dt),
    cases: () => seq(0, 33, 20).map((v, i) => [0.05 + i * 0.01, v, 0.1 + (i % 3) * 0.2]),
    prop: (out) => out >= 0 && Number.isFinite(out)
  },
  {
    id: "F-34", name: "Внимание", expr: "A = clamp(1 − load, 0, 1)", unit: "доля", range: "[0, 1]",
    fn: (l) => attention(l),
    cases: () => seq(0, 1, 20).map((l) => [l]),
    prop: (out) => out >= 0 && out <= 1
  },
  {
    id: "F-35", name: "Радиус восприятия", expr: "r = r₀(1 + 0.1·log₂(1+v))", unit: "метры", range: "[r₀, 1.7·r₀]",
    fn: (r0, v) => perceptionRadius(r0, v),
    cases: () => seq(0, 33, 20).map((v, i) => [20 + i, v]),
    prop: (out, [r0]) => out >= r0 && out <= r0 * 1.7
  },
  {
    id: "F-36", name: "Время реакции", expr: "t = 0.4 + 2.6(1 − alert)", unit: "секунды", range: "[0.4, 3.0]",
    fn: (a) => reactionTime(a),
    cases: () => seq(0, 1, 20).map((a) => [a]),
    prop: (out) => out >= 0.4 && out <= 3.0
  },
  {
    id: "F-37", name: "Бюджет кадра ИИ", expr: "B = n·c_point + m·c_route", unit: "мс", range: "[0, ∞)",
    fn: (n, m) => aiBudget(n, m),
    cases: () => seq(0, 640, 20).map((n, i) => [n, i * 4]),
    prop: (out) => out >= 0 && Number.isFinite(out)
  },
  {
    id: "F-38", name: "Объяснимость", expr: "E = доля команд с why", unit: "доля", range: "[0, 1]",
    fn: (cmds) => explainability(cmds),
    cases: () => seq(0, 19, 20).map((k) => [Array.from({ length: 20 }, (_, i) => ({ why: i < k ? "так" : "" }))]),
    prop: (out) => out >= 0 && out <= 1
  },
  {
    id: "F-39", name: "Честность распределения", expr: "F = 1 − max_share", unit: "доля", range: "[0, 1]",
    fn: (s) => fairness(s),
    cases: () => seq(0, 1, 20).map((x) => [[x, 1 - x, 0.2 * x + 0.05]]),
    prop: (out) => out >= 0 && out <= 1
  },
  {
    id: "F-40", name: "Нагрузка на надзор", expr: "S = 1 − exp(−incidents/τ)", unit: "доля", range: "[0, 1]",
    fn: (n, tau) => oversightLoad(n, tau),
    cases: () => seq(0, 19, 20).map((n, i) => [n, 2 + i]),
    prop: (out) => out >= 0 && out <= 1
  }
];

export const FORMULA_BY_ID = new Map(FORMULAS.map((f) => [f.id, f]));

/** Средний балл всех формул за 20 значений — нужен только для сводки в документе. */
export function formulaSmoke() {
  let checks = 0;
  let failed = 0;
  for (const f of FORMULAS) {
    for (const args of f.cases()) {
      checks++;
      try {
        if (!f.prop(f.fn(...args), args)) failed++;
      } catch {
        failed++;
      }
    }
  }
  return { formulas: FORMULAS.length, checks, failed };
}
