// Квеня (белые) играет в шахматы через chess.js (BSD-2-Clause, Jeff Hlywa, npm/chess.js)
// против спарринг-скрипта «ФЕРЗЬ-3000» (чёрные). Оба — минимакс на 2 полухода
// с характером: у Квени аккуратнее, у ФЕРЗЯ жаднее и размашистее.
// Запуск: node chess_match.mjs scan | node chess_match.mjs run <seed>
import fs from 'node:fs';
import { Chess } from 'chess.js';

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
  kvenya: { greed: 0.55, jit: 0.5 },
  ferz: { greed: 0.95, jit: 1.5 },
};

function play(seed) {
  const rng = mulberry32(seed * 7919 + 13);
  const c = new Chess();
  const moves = [];
  const capsW = [], capsB = [];
  let ply = 0;
  while (!c.isGameOver() && ply < 200) {
    const P = c.turn() === 'w' ? PERSONAS.kvenya : PERSONAS.ferz;
    const m = pickMove(c, rng, P);
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
  return { moves, res, capsW, capsB, checks: moves.filter((m) => m.check).length, fen: c.fen() };
}

function summarize(seed, g) {
  const lostQ = g.capsB.filter((x) => x.piece !== 'p' && x.piece !== 'k').map((x) => `${x.n}:${x.piece}`);
  console.log(`seed ${seed}: ${g.moves.length} ply res=${g.res} capsW=${g.capsW.length} capsB=${g.capsB.length} checks=${g.checks} kvenyaLost=${lostQ.join(',') || '-'}`);
}

const [cmd, seed] = process.argv.slice(2);
if (cmd === 'scan') {
  for (let s = 1; s <= 10; s++) summarize(s, play(s));
} else {
  const s = Number(seed || 5);
  const g = play(s);
  summarize(s, g);
  fs.writeFileSync(OUT + 'moves.jsonl', g.moves.map((m) => JSON.stringify(m)).join('\n'));
  fs.writeFileSync(OUT + 'match.json', JSON.stringify({ seed, res: g.res, capsW: g.capsW, capsB: g.capsB, checks: g.checks, names: NAMES }, null, 1));
  console.log('last moves:', g.moves.slice(-8).map((m) => m.san).join(' '));
}
