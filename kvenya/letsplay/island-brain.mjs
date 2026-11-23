// Как Квеня играет в «Остров»: планирование на несколько ходов вперёд.
//
// Маленькая модель не может держать в голове дерево вариантов, зато дом
// может дать ей честный расчёт: перебрать возможные ходы на N ходов вперёд
// и выбрать тот, что приближает победу. Она при этом учится ПРАВИЛУ выбора
// (приоритет еды, стройки и защиты), а не запоминает одну партию.
//
// Честность: игрок не подглядывает в скрытые данные — только observe(world).
// Волна видна заранее (nextWaveIn), ресурсы и постройки открыты.

import { step, observe, finished, BUILDINGS, snapshot, newWorld } from './island.mjs';

/** Насколько хороша позиция: запасы, прочность, стройка, близость к победе. */
export function score(world) {
  const o = observe(world);
  if (world.hp <= 0) return -100000;
  let s = 0;
  // Прочность — жизнь поселения.
  s += world.hp * 6;
  // Ресурсы с убывающей отдачей: первые важнее, излишек не ценен.
  s += Math.min(o.resources.food, 40) * 2;
  s += Math.min(o.resources.wood, 40) * 2;
  s += Math.min(o.resources.stone, 30) * 2.5;
  // Стройка и разнообразие зданий.
  const kinds = new Set(world.built);
  s += world.built.length * 12 + kinds.size * 18;
  // Башни — защита от волн.
  const towers = world.built.filter((x) => x === 'tower').length;
  s += Math.min(towers, 2) * 30;
  // Голод — почти смерть.
  if (world.food < 3) s -= 80;
  // Близость к цели победы.
  if (world.food >= 25) s += 40;
  if (world.wood >= 25) s += 40;
  if (world.stone >= 15) s += 50;
  if (towers > 0 && world.built.length >= 4) s += 100;
  return s;
}

function candidates(world) {
  const o = observe(world);
  // Ждать — тоже ход, но только если строить нечего.
  const acts = o.canBuild.length ? o.canBuild.slice() : [];
  if (!acts.includes('wait')) acts.push('wait');
  return acts;
}

/** Оценить действие перебором на несколько ходов вперёд (альфа-бета не нужна:
 *  ветвление маленькое, а противника-ответа нет — только среда). */
function lookahead(world, depth, memo) {
  const fin = finished(world);
  if (fin.over) return fin.win ? 100000 + world.turn : -100000;
  if (depth <= 0) return score(world);
  let best = -Infinity;
  for (const act of candidates(world)) {
    const key = `${world.turn}|${act}|${world.food},${world.wood},${world.stone},${world.hp},${world.built.length}|${depth}`;
    let v = memo?.get(key);
    if (v === undefined) {
      const { world: next } = step(world, act);
      v = lookahead(next, depth - 1, memo);
      memo?.set(key, v);
    }
    if (v > best) best = v;
  }
  return best;
}

/**
 * Выбрать ход. depth — на сколько ходов вперёд считаем (по умолчанию 4).
 * Поведение объяснимо: возвращаем и оценку каждого варианта — это и есть
 * то, чем она может объяснить свой выбор словами.
 */
export function chooseAction(world, { depth = 4 } = {}) {
  const acts = candidates(world);
  const memo = new Map();
  const scored = [];
  for (const act of acts) {
    const { world: next, events } = step(world, act);
    const v = lookahead(next, depth - 1, memo);
    scored.push({ action: act, value: v, events, after: snapshot(next) });
  }
  scored.sort((a, b) => b.value - a.value);
  return { action: scored[0].action, value: scored[0].value, options: scored };
}

export function explainChoice(world, choice) {
  const o = observe(world);
  const a = choice.action;
  const name = a === 'wait' ? 'подожду' : `построю ${BUILDINGS[a].name}`;
  const why = [];
  if (a === 'wait') {
    why.push('сейчас строить не на что или рано тратить запасы');
  } else {
    const gives = BUILDINGS[a].gives || {};
    if (gives.food) why.push('нужна еда, чтобы жители не голодали');
    if (gives.wood) why.push('нужно дерево для следующей стройки');
    if (gives.stone) why.push('нужен камень для прочных зданий');
    if (a === 'tower') why.push(`до волны ${o.nextWaveIn} ходов, а без башни она бьёт больно`);
    if (a === 'workshop') why.push('мастерская даёт и еду, и дерево');
  }
  if (o.resources.food < 6) why.push('еды в обрез');
  if (world.hp < 70) why.push(`прочность уже ${world.hp}`);
  return `${name}, потому что ${why.join('; ')} (цена ${JSON.stringify(BUILDINGS[a]?.cost || {})}, выгода ${choice.value})`;
}

/** Сыграть партию выбранным способом. policy(world) -> action. */
export function playGame({ seed = 1, policy, maxTurns = 120 } = {}) {
  let world = newWorld({ seed });
  const history = [];
  for (let i = 0; i < maxTurns; i++) {
    const fin = finished(world);
    if (fin.over) return { win: fin.win, why: fin.why, turns: world.turn - 1, world, history };
    const action = policy(world);
    const { world: next, events } = step(world, action);
    history.push({ turn: world.turn, action, events, before: snapshot(world), after: snapshot(next) });
    world = next;
  }
  const fin = finished(world);
  return { win: fin.win, why: fin.over ? fin.why : 'время вышло', turns: world.turn - 1, world, history };
}

export { lookahead };
