// Мозг Квени для шахмат: альфа-бета с упорядочиванием ходов, таблицами
// позиций и «спокойным» поиском (quiescence). Раньше она смотрела на два
// полухода простым перебором и проигрывала даже спарринг-скрипту.
//
// Шахматы — первая из сложных игр, где дом учит её думать, а не угадывать:
// оценка позиции + поиск по дереву + проверка результата на партиях.
//
// chess.js (BSD-2-Clause, Jeff Hlywa) — правила, ходы и конец партии.

export const VAL = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };

// Таблицы позиций: насколько поле хорошо для фигуры (в сотых пешки).
// Маленькой модели и её движку это даёт главное — понимание, что центр
// и развитие важнее, чем просто «где стою».
const PST = {
  p: [
    0, 0, 0, 0, 0, 0, 0, 0,
    50, 50, 50, 50, 50, 50, 50, 50,
    10, 10, 20, 30, 30, 20, 10, 10,
    5, 5, 10, 25, 25, 10, 5, 5,
    0, 0, 0, 20, 20, 0, 0, 0,
    5, -5, -10, 0, 0, -10, -5, 5,
    5, 10, 10, -20, -20, 10, 10, 5,
    0, 0, 0, 0, 0, 0, 0, 0,
  ],
  n: [
    -50, -40, -30, -30, -30, -30, -40, -50,
    -40, -20, 0, 0, 0, 0, -20, -40,
    -30, 0, 10, 15, 15, 10, 0, -30,
    -30, 5, 15, 20, 20, 15, 5, -30,
    -30, 0, 15, 20, 20, 15, 0, -30,
    -30, 5, 10, 15, 15, 10, 5, -30,
    -40, -20, 0, 5, 5, 0, -20, -40,
    -50, -40, -30, -30, -30, -30, -40, -50,
  ],
  b: [
    -20, -10, -10, -10, -10, -10, -10, -20,
    -10, 0, 0, 0, 0, 0, 0, -10,
    -10, 0, 5, 10, 10, 5, 0, -10,
    -10, 5, 5, 10, 10, 5, 5, -10,
    -10, 0, 10, 10, 10, 10, 0, -10,
    -10, 10, 10, 10, 10, 10, 10, -10,
    -10, 5, 0, 0, 0, 0, 5, -10,
    -20, -10, -10, -10, -10, -10, -10, -20,
  ],
  r: [
    0, 0, 0, 0, 0, 0, 0, 0,
    5, 10, 10, 10, 10, 10, 10, 5,
    -5, 0, 0, 0, 0, 0, 0, -5,
    -5, 0, 0, 0, 0, 0, 0, -5,
    -5, 0, 0, 0, 0, 0, 0, -5,
    -5, 0, 0, 0, 0, 0, 0, -5,
    -5, 0, 0, 0, 0, 0, 0, -5,
    0, 0, 0, 5, 5, 0, 0, 0,
  ],
  q: [
    -20, -10, -10, -5, -5, -10, -10, -20,
    -10, 0, 0, 0, 0, 0, 0, -10,
    -10, 0, 5, 5, 5, 5, 0, -10,
    -5, 0, 5, 5, 5, 5, 0, -5,
    0, 0, 5, 5, 5, 5, 0, -5,
    -10, 5, 5, 5, 5, 5, 0, -10,
    -10, 0, 5, 0, 0, 0, 0, -10,
    -20, -10, -10, -5, -5, -10, -10, -20,
  ],
  k: [
    -30, -40, -40, -50, -50, -40, -40, -30,
    -30, -40, -40, -50, -50, -40, -40, -30,
    -30, -40, -40, -50, -50, -40, -40, -30,
    -30, -40, -40, -50, -50, -40, -40, -30,
    -20, -30, -30, -40, -40, -30, -30, -20,
    -10, -20, -20, -20, -20, -20, -20, -10,
    20, 20, 0, 0, 0, 0, 20, 20,
    20, 30, 10, 0, 0, 10, 30, 20,
  ],
};

/** Индекс поля в таблице: b[0] — 8-й ряд (чёрные), как отдаёт chess.js. */
function pst(type, color, r, f) {
  const row = color === 'w' ? r : 7 - r;
  const col = color === 'w' ? f : 7 - f;
  return PST[type][row * 8 + col];
}

const MATE = 100000;

/** Оценка позиции с точки зрения белых (положительно — хорошо Квени). */
export function evaluate(c) {
  const b = c.board();
  let score = 0;
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const p = b[r][f];
      if (!p) continue;
      const v = VAL[p.type] + pst(p.type, p.color, r, f);
      score += p.color === 'w' ? v : -v;
    }
  }
  return score;
}

function moveScore(c, m) {
  // Упорядочивание: сначала взятия (дешёвой фигурой дорогую), потом шахи.
  let s = 0;
  if (m.captured) s += 1000 + VAL[m.captured] * 10 - VAL[m.piece];
  if (m.promotion) s += 900;
  if (m.san && m.san.includes('+')) s += 60;
  return s;
}

function ordered(c, moves) {
  return moves.slice().sort((a, b) => moveScore(c, b) - moveScore(c, a));
}

/**
 * Спокойный поиск: когда взятия «в разгаре», добираем только взятия, чтобы
 * движок не отдавал фигуру по ошибке горизонта. Глубина добирания ограничена
 * (4 полухода): без ограничения цепочки разменов раздувают дерево в сотни
 * тысяч узлов, а chess.js медленный — на CPU это минуты на один ход.
 */
function quiesce(c, alpha, beta, st, qdepth = 4) {
  st.nodes++;
  const stand = c.turn() === 'w' ? evaluate(c) : -evaluate(c);
  if (qdepth <= 0 || st.expired()) return stand;
  const maximizing = c.turn() === 'w';
  if (maximizing) {
    if (stand >= beta) return beta;
    if (stand > alpha) alpha = stand;
  } else {
    if (stand <= alpha) return alpha;
    if (stand < beta) beta = stand;
  }
  const caps = c.moves({ verbose: true }).filter((m) => m.captured || m.promotion);
  if (!caps.length) return stand;
  for (const m of ordered(c, caps)) {
    c.move(m);
    const v = -quiesce(c, -beta, -alpha, st, qdepth - 1);
    c.undo();
    if (st.expired()) break;
    if (maximizing) {
      if (v >= beta) return beta;
      if (v > alpha) alpha = v;
    } else {
      if (v <= alpha) return alpha;
      if (v < beta) beta = v;
    }
  }
  return maximizing ? alpha : beta;
}

/** Альфа-бета поиск. Возвращает оценку с точки зрения того, чей ход. */
function search(c, depth, alpha, beta, st) {
  if (st.expired()) return c.turn() === 'w' ? evaluate(c) : -evaluate(c);
  if (c.isGameOver()) {
    if (c.isCheckmate()) return -MATE + (10 - depth) * 100; // мат тем ближе, чем глубже
    return 0;
  }
  if (depth <= 0) return quiesce(c, alpha, beta, st);
  st.nodes++;
  let best = -Infinity;
  for (const m of ordered(c, c.moves({ verbose: true }))) {
    c.move(m);
    const v = -search(c, depth - 1, -beta, -alpha, st);
    c.undo();
    if (v > best) best = v;
    if (best > alpha) alpha = best;
    if (alpha >= beta) break; // отсечение: остальное не может быть лучше
    if (st.expired()) break;
  }
  return best;
}

/**
 * Выбрать ход за отведённое время: итеративное углубление 1 → 2 → 3 → 4,
 * каждый следующий уровень только если время ещё есть. Так движок думает
 * ограниченно и предсказуемо, а не «сколько получится».
 */
export function pickMove(c, { rng = Math.random, persona = {}, timeMs = 700, maxDepth = 4 } = {}) {
  const st = { nodes: 0, deadline: Date.now() + timeMs, expired() { return Date.now() > this.deadline || this.nodes > 400000; } };
  let best = null;
  let reached = 0;
  for (let depth = 1; depth <= maxDepth; depth++) {
    const moves = ordered(c, c.moves({ verbose: true }));
    const scored = [];
    for (const m of moves) {
      c.move(m);
      let v = -search(c, depth - 1, -Infinity, Infinity, st);
      c.undo();
      // Характер: жадность и тяга к шахам — маленькие добавки, не ломающие
      // честную оценку; случайность — чтобы партии не совпадали.
      if (m.captured && persona.greed) v += VAL[m.captured] * persona.greed * 0.02;
      if (m.san && m.san.includes('+') && persona.check) v += persona.check;
      scored.push({ m, v: v + (persona.jit ? (rng() - 0.5) * persona.jit : 0), raw: v });
      if (st.expired()) break;
    }
    if (!scored.length) break;
    scored.sort((a, b) => b.v - a.v);
    // Итог уровня принимаем, только если он доигран целиком: недосчитанный
    // уровень может выбрать ход по половине дерева.
    if (!st.expired()) {
      best = { move: scored[0].m, score: scored[0].raw, nodes: st.nodes, depth, alternatives: scored.slice(0, 3) };
      reached = depth;
    }
    if (st.expired()) break;
  }
  if (!best) {
    // Время вышло уже на первом уровне — берём лучший из сосчитанного.
    const moves = ordered(c, c.moves({ verbose: true }));
    best = { move: moves[0], score: 0, nodes: st.nodes, depth: 0, alternatives: [] };
  }
  best.depth = reached || best.depth;
  return best;
}

/** Краткое объяснение хода — чтобы она могла объяснить свой выбор словами. */
export function explain(c, pick) {
  const m = pick.move;
  const piece = { p: 'пешка', n: 'конь', b: 'слон', r: 'ладья', q: 'ферзь', k: 'король' }[m.piece];
  const what = m.captured ? `беру ${m.captured === 'q' ? 'ферзя' : 'фигуру'} на ${m.to}` : `иду ${piece === 'пешка' ? 'пешкой' : piece} на ${m.to}`;
  const why = [];
  if (pick.score > 150) why.push('оценка в мою пользу');
  else if (pick.score < -150) why.push('отбиваюсь');
  else why.push('позиция ровная, наращиваю');
  if (m.captured) why.push('это взятие выгодно');
  if (m.san.includes('+')) why.push('ставлю шах');
  return `${what}, потому что ${why.join(', ')} (глубина ${pick.depth || 3}, узлов ${pick.nodes})`;
}
