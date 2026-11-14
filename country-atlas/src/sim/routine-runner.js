/**
 * Раннер алгоритмов поведения.
 *
 * Идея (§32): в каталоге 1008 «случаев» — начальных состояний дня. Каждый случай
 * при исполнении получает СВОЙ алгоритм: раннер случайно, но детерминированно
 * собирает конкретный путь — какие необязательные шаги случились, какие развилки
 * попались и чем всё кончилось.
 *
 * Один случай → одно начало → много концов:
 *
 *     ролл = mulberry32(hash(id, seed, день, агент))
 *     шаги   = ядро (3–5) + 0–3 необязательных, вставленных в случайные места
 *     ветки  = 2–4 из пула цели (уникальные теги), факт мира важнее кубика
 *     конец  = взвешенный выбор; «да» по теме ветки повышает вес своей концовки
 *
 * Свойства: детерминизм (тот же сид — тот же путь), конечность (у любого пути есть
 * концовка), объяснимость (в run.because лежит, почему выбрана концовка).
 */
import { ACTORS, POOLS, ROUTINES } from "../../data/routines.js";
import { mulberry32, hashString, weightedIndex, randInt } from "../core/rng.js";

/** Подстановка места в шаблон: {home}, {work}, {stop}, {tool}, {good}, {gap}. */
export function fillTemplate(template, ctx) {
  return String(template).replace(/\{(\w+)\}/g, (_, key) => {
    const v = ctx[key];
    return v === undefined ? "" : v;
  });
}

/** Контекст агента: места и инструменты, с поправкой на вариант случая. */
export function contextFor(routine) {
  const actor = ACTORS[routine.actorId];
  if (!actor) throw new Error(`неизвестный исполнитель: ${routine.actorId}`);
  const ctx = {
    home: actor.home,
    work: actor.work,
    transit: actor.transit,
    stop: actor.stop,
    tool: actor.tool,
    good: actor.good
  };
  switch (routine.variant) {
    case 1: ctx.stop = "соседняя остановка"; break;
    case 2: ctx.work = actor.work + " (филиал)"; break;
    case 3: ctx.stop = actor.stop + " (дальний конец)"; break;
    case 4: ctx.tool = actor.tool + " (запасной)"; break;
    default: break;
  }
  const rnd = mulberry32(hashString(`${routine.id}|ctx`));
  ctx.gap = String(8 + Math.floor(rnd() * 25));
  return ctx;
}

/**
 * Собрать конкретный алгоритм для случая.
 *
 * @param {object} routine — запись из ROUTINES
 * @param {object} [opts]
 * @param {number} [opts.seed=1]    — сид мира
 * @param {number} [opts.day=1]     — номер игрового дня
 * @param {string} [opts.agent]     — id агента (разные люди — разные дни)
 * @param {object} [opts.facts]     — факты мира по темам: {weather:true, road:false, …}
 * @returns {{id:string, actor:string, goal:string, window:string,
 *            steps:string[], branches:{tag:string,q:string,yes:string,no:string,answer:boolean}[],
 *            ending:string, effects:object, because:string, path:string[]}}
 */
export function rollRoutine(routine, opts = {}) {
  const seed = opts.seed === undefined ? 1 : opts.seed;
  const day = opts.day === undefined ? 1 : opts.day;
  const agent = opts.agent || routine.actorId;
  const facts = opts.facts || {};

  const pool = POOLS[routine.goalId];
  const actor = ACTORS[routine.actorId];
  if (!pool || !actor) throw new Error(`сломанный случай: ${routine.id}`);

  const ctx = contextFor(routine);
  const rnd = mulberry32(hashString(`${routine.id}|${seed}|${day}|${agent}`));

  /* 1. Развилки: 2–4, разные темы; факт мира важнее броска кубика. */
  const take = 2 + Math.floor(rnd() * 3);
  const branchPool = pool.comps.slice();
  const chosen = [];
  const usedTags = new Set();
  let guard = 0;
  while (chosen.length < take && branchPool.length && guard < 200) {
    guard++;
    const idx = Math.floor(rnd() * branchPool.length);
    const [tag, q, yes, no] = branchPool[idx];
    if (usedTags.has(tag) && branchPool.length > take) continue;
    branchPool.splice(idx, 1);
    usedTags.add(tag);
    const answer = typeof facts[tag] === "boolean" ? facts[tag] : rnd() < 0.5;
    chosen.push({
      tag,
      q: fillTemplate(q, ctx),
      yes: fillTemplate(yes, ctx),
      no: fillTemplate(no, ctx),
      answer
    });
  }

  /* 2. Слова развилок — чтобы необязательный шаг не противоречил уже выпавшей развилке
   *    («проверил телефон» + «зазвонил телефон? → не взял трубку»). */
  const banned = new Set();
  for (const b of chosen) {
    for (const w of b.q.toLowerCase().match(/[а-яё]{5,}/g) || []) banned.add(w.slice(0, 5));
  }
  const clashes = (text) =>
    (text.toLowerCase().match(/[а-яё]{5,}/g) || []).some((w) => banned.has(w.slice(0, 5)));

  /* 3. Ядро случая + 0–3 необязательных шага в случайных местах (после первого). */
  const coreCount = Math.min(routine.core || 4, pool.steps.length);
  const steps = pool.steps.slice(0, coreCount).map((s) => fillTemplate(s, ctx));

  const extraRoll = rnd();
  const extraCount = extraRoll < 0.15 ? 0 : extraRoll < 0.6 ? 1 : extraRoll < 0.88 ? 2 : 3;
  const optPool = pool.opt.slice();
  for (let i = 0; i < extraCount && optPool.length; i++) {
    let pickIdx = -1;
    for (let t = 0; t < 6; t++) {
      const idx = Math.floor(rnd() * optPool.length);
      if (!clashes(optPool[idx]) || t === 5) { pickIdx = idx; break; }
    }
    if (pickIdx < 0) break;
    const text = fillTemplate(optPool.splice(pickIdx, 1)[0], ctx);
    const at = 1 + Math.floor(rnd() * Math.max(1, steps.length - 1));
    steps.splice(at, 0, text);
  }

  /* 4. Развилки встают в разные места между шагами — как в жизни, а не подряд. */
  const positions = chosen
    .map(() => 1 + Math.floor(rnd() * Math.max(1, steps.length - 1)))
    .sort((a, b) => a - b);
  chosen.forEach((b, i) => { b.at = positions[i]; });

  /* 5. Последствия развилок. Считаем ДО выбора концовки: концовка должна знать итог. */
  const effects = { mood: 0, money: 0, fatigue: 1, lateMin: 0, social: 0 };
  for (const b of chosen) {
    if (!b.answer) continue;
    if (b.tag === "weather") effects.fatigue += 1;
    if (b.tag === "road") effects.lateMin += 2;
    if (b.tag === "delay") effects.lateMin += 4;
    if (b.tag === "health") effects.fatigue += 2;
    if (b.tag === "social") effects.social += 1;
    if (b.tag === "work") effects.fatigue += 1;
    if (b.tag === "money") effects.money -= 100;
    if (b.tag === "sea") effects.fatigue += 1;
    if (b.tag === "field") effects.fatigue += 2;
    if (b.tag === "air") effects.lateMin += 3;
  }

  /* 6. Концовка: базовый вес × тема × накопленный итог × немного шума. */
  const weights = pool.ends.map(([, w, trigger], idx) => {
    let weight = w;
    if (idx === 0) {
      /* «Всё хорошо» не выигрывает, если день уже покатился не туда. */
      if (effects.lateMin >= 4) weight *= 0.2;
      if (effects.fatigue >= 4) weight *= 0.5;
      if (effects.money < 0) weight *= 0.7;
    }
    if (trigger && chosen.some((b) => b.answer && b.tag === trigger)) weight *= 2.4;
    if (trigger === "delay" && effects.lateMin > 0) weight *= 1.6;
    if (trigger === "health" && effects.fatigue >= 3) weight *= 1.5;
    if (trigger === "money" && effects.money < 0) weight *= 1.4;
    if (trigger === "social" && effects.social > 0) weight *= 1.8;
    return weight * (0.85 + rnd() * 0.3);
  });
  const endIdx = weightedIndex(rnd, weights);
  const ending = fillTemplate(pool.ends[endIdx][0], ctx);

  /* 7. Последствия концовки — по смыслу её текста, а не по тегу.
   *    «Заработал сверху» не может отнимать деньги, «опоздал» — не может дать ноль минут. */
  const says = (re) => re.test(ending);
  if (says(/опозд/)) effects.lateMin = Math.max(effects.lateMin, 8);
  if (says(/устал|вымот|выдох/)) effects.fatigue += 2;
  if (says(/заработал|чаев|преми|выгодн|дороже|сверху|прибыл/)) effects.money += 500;
  if (says(/потрат|лишн|штраф|заплатил|переплат|потерял деньг/)) effects.money -= 300;
  if (says(/помог|встрет|познаком|поговорил|сосед|друз/)) effects.social += 1;
  if (says(/заболел|простудил|травм|разболел/)) effects.fatigue += 2;
  const trig = pool.ends[endIdx][2];
  if (trig === "social") effects.social += 1;
  if (trig === "work") effects.mood -= 1;
  if (endIdx === 0) effects.mood += 1;

  const yesBranches = chosen.filter((b) => b.answer);
  const because = yesBranches.length
    ? "так вышло, потому что: " + yesBranches.map((b) => b.q.replace(/\?$/, "")).join("; ")
    : "всё прошло по плану, ни одна развилка не сработала";

  const path = [];
  path.push(`НАЧАЛО: ${routine.window} — ${actor.name.toLowerCase()}`);
  steps.forEach((s, i) => {
    path.push(`шаг ${i + 1}: ${s}`);
    for (const b of chosen) {
      if (b.at === i) path.push(`     ? ${b.q} → ${b.answer ? "да: " + b.yes : "нет: " + b.no}`);
    }
  });
  path.push(`КОНЕЦ: ${ending}`);

  return {
    id: routine.id,
    actor: actor.name,
    goal: pool.name,
    window: routine.window,
    steps,
    branches: chosen,
    ending,
    effects,
    because,
    path
  };
}

/** Найти случай по id и сразу прокатить. */
export function rollById(id, opts) {
  const routine = ROUTINES.find((r) => r.id === id);
  if (!routine) throw new Error(`нет случая ${id}`);
  return rollRoutine(routine, opts);
}

/**
 * Прогон дня: все 1008 случаев по одному разу с разными агентами.
 * Возвращает сводку — удобно для баланса и для теста «мир не зациклился».
 */
export function simulateDay(seed = 1, day = 1) {
  let endings = 0;
  const counter = new Map();
  const effects = { mood: 0, money: 0, fatigue: 0, lateMin: 0, social: 0 };

  for (const r of ROUTINES) {
    const run = rollRoutine(r, { seed, day, agent: `${r.actorId}-${day}` });
    endings += 1;
    counter.set(run.ending, (counter.get(run.ending) || 0) + 1);
    effects.mood += run.effects.mood;
    effects.money += run.effects.money;
    effects.fatigue += run.effects.fatigue;
    effects.lateMin += run.effects.lateMin;
    effects.social += run.effects.social;
  }

  const top = [...counter.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  return { endings, uniqueEndings: counter.size, top, effects };
}
