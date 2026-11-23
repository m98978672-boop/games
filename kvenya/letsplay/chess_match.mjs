// Квеня (белые) играет в шахматы через chess.js (BSD-2-Clause, Jeff Hlywa, npm/chess.js)
// против спарринг-скрипта «ФЕРЗЬ-3000» (чёрные). Оба — минимакс на 2 полухода
// с характером: у Квени аккуратнее, у ФЕРЗЯ жаднее и размашистее.
// Запуск: node chess_match.mjs scan | node chess_match.mjs run <seed>
import fs from 'node:fs';
import { Chess } from 'chess.js';
import { pickMove as brainPick, explain as brainExplain } from './chess_brain.mjs';

const OUT = new URL('./build/', import.meta.url).pathname;
fs.mkdirSync(OUT, { recursive: true });
const VAL = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
const NAMES = { p: 'пешка', n: 'конь', b: 'слон', r: 'ладья', q: 'ферзь', k: 'король' };

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function evalBoard(c) {
  const b = c.board();
  let s = 0;
  for (let r = 0; r < 8; r++) for (let f = 0; f < 8; f++) {
    const p = b[r][f];
    if (!p) continue;
    let v = VAL[p.type];
    const cf = 3.5 - Math.max(Math.abs(f - 3.5), Math.abs(r - 3.5)) * 0.5;
    if (p.type === 'p' || p.type === 'n') v += cf * 0.06;
    s += (p.color === 'w' ? 1 : -1) * v;
  }
  return s;
}

function replyEval(c) {
  // лучший ответ соперника (1 полуход)
  if (c.isGameOver()) {
    if (c.isCheckmate()) return c.turn() === 'w' ? -99 : 99;
    return 0;
  }
  let best = c.turn() === 'w' ? -1e9 : 1e9;
  for (const m of c.moves()) {
    c.move(m);
    const v = c.isCheckmate() ? (c.turn() === 'w' ? -99 : 99) : evalBoard(c);
    c.undo();
    best = c.turn() === 'w' ? Math.max(best, v) : Math.min(best, v);
  }
  return best;
}

function pickMove(c, rng, P) {
  let best = -1e9, bm = null;
  for (const m of c.moves({ verbose: true })) {
    c.move(m);
    let v = replyEval(c) * (m.color === 'w' ? 1 : -1);
    c.undo();
    v += (m.captured ? VAL[m.captured] * P.greed : 0) + (m.san.includes('+') ? 0.3 : 0) + (rng() - 0.5) * P.jit;
    if (v > best) { best = v; bm = m; }
  }
  return bm;
}

const PERSONAS = {
  // Характер Квени: аккуратная, ищет на 3 полухода с отсечениями.
  kvenya: { greed: 0.55, jit: 20, depth: Number(process.env.KV_DEPTH || 3),
            timeMs: Number(process.env.KV_TIME_MS || 700) },
  ferz: { greed: 0.95, jit: 150 },
};

function play(seed) {
  const rng = mulberry32(seed * 7919 + 13);
  const c = new Chess();
  const moves = [];
  const capsW = [], capsB = [];
  const reasons = [];
  const depths = [];
  let shallow = 0;
  let ply = 0;
  while (!c.isGameOver() && ply < 200) {
    const P = c.turn() === 'w' ? PERSONAS.kvenya : PERSONAS.ferz;
    // Квеня думает мозгом (альфа-бета + спокойный поиск), ФЕРЗЬ остаётся
    // прежним спарринг-скриптом — так видно, чему она научилась.
    let m;
    if (c.turn() === 'w') {
      const pick = brainPick(c, { rng, persona: P, timeMs: P.timeMs || 700, maxDepth: P.depth || 4 });
      // Честная запись, на какой глубине она реально думала: на медленном
      // раннере бюджет времени съедается, и это должно быть видно в счёте,
      // а не превращаться в «она играет хорошо» без оговорок.
      if (pick.depth < 3) shallow++;
      depths.push(pick.depth);
      m = pick.move;
      const why = brainExplain(c, { ...pick, depth: pick.depth });
      reasons.push({ n: ply + 1, san: m.san, why });
      if (process.env.KV_EXPLAIN) console.log(`ход ${ply + 1}: ${why}`);
    } else {
      m = pickMove(c, rng, P);
    }
    const before = evalBoard(c);
    c.move(m);
    ply++;
    if (m.captured) (m.color === 'w' ? capsW : capsB).push({ n: ply, piece: m.captured, san: m.san });
    moves.push({
      n: ply, side: m.color, san: m.san, from: m.from, to: m.to, piece: m.piece,
      cap: m.captured || null, promo: m.promotion || null,
      check: c.isCheck(), mate: c.isCheckmate(), fen: c.fen(), mat: Math.round(evalBoard(c) * 10) / 10,
    });
  }
  const res = c.isCheckmate() ? (c.turn() === 'w' ? 'black' : 'white') : c.isStalemate() ? 'stalemate' : c.isDraw() ? 'draw' : 'cap';
  return { moves, res, capsW, capsB, checks: moves.filter((m) => m.check).length, fen: c.fen(), reasons,
           depths, shallow, avgDepth: depths.length ? Math.round((depths.reduce((a, b) => a + b, 0) / depths.length) * 10) / 10 : 0 };
}

function summarize(seed, g) {
  const lostQ = g.capsB.filter((x) => x.piece !== 'p' && x.piece !== 'k').map((x) => `${x.n}:${x.piece}`);
  console.log(`seed ${seed}: ${g.moves.length} ply res=${g.res} capsW=${g.capsW.length} capsB=${g.capsB.length} checks=${g.checks} kvenyaLost=${lostQ.join(',') || '-'} avgDepth=${g.avgDepth} shallow=${g.shallow}`);
}

/** Счёт турнира: сколько партий выиграно/проиграно/ничьих и сколько фигур потеряно. */
function tally(games) {
  const out = { wins: 0, losses: 0, draws: 0, unfinished: 0, lostPieces: 0, plies: 0 };
  for (const { g } of games) {
    if (g.res === 'white') out.wins++;
    else if (g.res === 'black') out.losses++;
    else if (g.res === 'draw' || g.res === 'stalemate') out.draws++;
    else out.unfinished++;
    out.lostPieces += g.capsB.filter((x) => x.piece !== 'p' && x.piece !== 'k').length;
    out.plies += g.moves.length;
    out.shallowMoves = (out.shallowMoves || 0) + (g.shallow || 0);
    out.depthSum = (out.depthSum || 0) + (g.avgDepth || 0);
  }
  out.games = games.length;
  out.avgPlies = Math.round(out.plies / Math.max(1, games.length));
  out.avgDepth = Math.round(((out.depthSum || 0) / Math.max(1, games.length)) * 10) / 10;
  return out;
}

const [cmd, seed] = process.argv.slice(2);
if (cmd === 'scan') {
  const games = [];
  for (let s = 1; s <= 10; s++) {
    const g = play(s);
    games.push({ seed: s, g });
    summarize(s, g);
  }
  const t = tally(games);
  console.log(`ИТОГ: побед ${t.wins}, поражений ${t.losses}, ничьих ${t.draws}, недобитых ${t.unfinished} из ${t.games}; ` +
    `средняя партия ${t.avgPlies} полуходов; своих фигур потеряно ${t.lostPieces}; ` +
    `средняя глубина ${t.avgDepth}; мелких ходов ${t.shallowMoves}`);
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(OUT + 'chess-tournament.json', JSON.stringify({
    schema: 'kvenya-chess-tournament-v1',
    opponent: 'ФЕРЗЬ-3000 (минимакс на 2 полухода)',
    depth: PERSONAS.kvenya.depth,
    ...t,
    games: games.map(({ seed, g }) => ({ seed, res: g.res, plies: g.moves.length, capsW: g.capsW.length, capsB: g.capsB.length })),
  }, null, 1));
} else {
  const s = Number(seed || 5);
  const g = play(s);
  summarize(s, g);
  fs.writeFileSync(OUT + 'moves.jsonl', g.moves.map((m) => JSON.stringify(m)).join('\n'));
  fs.writeFileSync(OUT + 'match.json', JSON.stringify({ seed, res: g.res, capsW: g.capsW, capsB: g.capsB, checks: g.checks, names: NAMES }, null, 1));
  fs.writeFileSync(OUT + 'reasons.json', JSON.stringify(g.reasons, null, 1));
  console.log('last moves:', g.moves.slice(-8).map((m) => m.san).join(' '));
}
