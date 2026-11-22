"use strict";
// A small deterministic look-ahead player for the 4x4 2048 rules. This is not
// a general game-playing model and does not learn between sessions.
const DIRECTIONS = ["ArrowLeft", "ArrowDown", "ArrowRight", "ArrowUp"];

function collapse(line) {
  const tiles = line.filter(x => x !== 0);
  const result = [];
  for (let i = 0; i < tiles.length; i++) {
    if (i + 1 < tiles.length && tiles[i] === tiles[i + 1]) {
      result.push(tiles[i] * 2);
      i++;
    } else result.push(tiles[i]);
  }
  return [...result, ...Array(4 - result.length).fill(0)];
}

function move(board, direction) {
  if (!Array.isArray(board) || board.length !== 4 || board.some(row => !Array.isArray(row) || row.length !== 4 || row.some(x => !Number.isSafeInteger(x) || x < 0))) throw Error("invalid board");
  if (!DIRECTIONS.includes(direction)) throw Error("invalid direction");
  const result = Array.from({length: 4}, () => Array(4).fill(0));
  for (let i = 0; i < 4; i++) {
    const positions = Array.from({length: 4}, (_, j) => {
      if (direction === "ArrowLeft") return [i, j];
      if (direction === "ArrowRight") return [i, 3 - j];
      if (direction === "ArrowUp") return [j, i];
      return [3 - j, i];
    });
    const values = collapse(positions.map(([y, x]) => board[y][x]));
    positions.forEach(([y, x], n) => { result[y][x] = values[n]; });
  }
  return result;
}

function choose(board) {
  const weights = [[8,7,6,5],[1,2,3,4],[0,-1,-2,-3],[-7,-6,-5,-4]];
  let best = null, bestScore = -Infinity;
  for (const direction of DIRECTIONS) {
    const next = move(board, direction);
    if (JSON.stringify(next) === JSON.stringify(board)) continue;
    let score = 0;
    for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) {
      const tile = next[y][x];
      if (!tile) score += 300;
      else score += Math.log2(tile) * weights[y][x] * 3;
    }
    if (score > bestScore) { bestScore = score; best = direction; }
  }
  return best;
}
module.exports = { collapse, move, choose };
