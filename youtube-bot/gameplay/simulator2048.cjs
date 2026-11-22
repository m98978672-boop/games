"use strict";
// Offline, bounded, game-specific self-play. No downloaded code or credentials.
const {move, choose} = require("./solver2048.cjs");
const BASE = Object.freeze({emptyWeight: 300, positionalWeight: 3});
const CANDIDATES = [BASE, {emptyWeight: 150, positionalWeight: 3},
  {emptyWeight: 500, positionalWeight: 3}, {emptyWeight: 300, positionalWeight: 6}];

function rng(seed) {
  let state = seed >>> 0;
  return () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 4294967296; };
}
function spawn(board, random) {
  const empty = [];
  for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) if (!board[y][x]) empty.push([y, x]);
  if (!empty.length) return false;
  const [y, x] = empty[Math.floor(random() * empty.length)];
  board[y][x] = random() < 0.9 ? 2 : 4;
  return true;
}
// Potential increases by the merge score and is unchanged by a slide.
function potential(board) { return board.flat().reduce((s, x) => s + (x ? x * Math.log2(x) : 0), 0); }
function simulate(seed, params, maxMoves = 800) {
  const random = rng(seed), board = Array.from({length: 4}, () => Array(4).fill(0));
  spawn(board, random); spawn(board, random);
  let current = board, score = 0, moves = 0;
  for (; moves < maxMoves; moves++) {
    const direction = choose(current, params);
    if (!direction) break;
    const next = move(current, direction);
    score += potential(next) - potential(current);
    spawn(next, random); current = next;
    if (Math.max(...current.flat()) >= 2048) { moves++; break; }
  }
  return {score, moves, maxTile: Math.max(...current.flat())};
}
function mean(params, seeds) {
  return seeds.reduce((sum, seed) => sum + simulate(seed, params).score, 0) / seeds.length;
}
function train() {
  const training = [11, 22, 33, 44], validation = [135, 246, 357, 468];
  const ranked = CANDIDATES.map(params => ({params, score: mean(params, training)}));
  ranked.sort((a, b) => b.score - a.score);
  const candidate = ranked[0].params;
  const baseline = mean(BASE, validation), trial = mean(candidate, validation);
  // Small fixed holdout only guards against obvious overfitting, not a guarantee.
  const accepted = candidate !== BASE && trial > baseline;
  return {parameters: accepted ? candidate : BASE, accepted, trainingScore: ranked[0].score,
    validationScore: trial, baselineValidationScore: baseline, metric: "mean simulated score"};
}
module.exports = {BASE, rng, spawn, potential, simulate, train};
if (require.main === module) console.log(JSON.stringify(train()));
