#!/usr/bin/env node
// Турнир Квени в сложные игры: шахматы и «Остров».
//
// Зачем отдельный инструмент: владелец попросил научить ИИ играть в сложные
// проекты. Обучение заканчивается не уроком, а проверкой — она должна играть
// сама, по расписанию, и оставлять честный счёт. Здесь это и происходит:
//   • шахматы — её мозг (альфа-бета, спокойный поиск) против спарринг-скрипта;
//   • «Остров» — её планировщик против простой эвристики.
// Результат пишется в дом (qwen-home/bridge/games.json) и на её страницу.
//
// Честность: не подкручиваем счёт. Если стало хуже — так и запишем.

import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const home = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repo = path.resolve(home, '..');
const letsplay = path.join(repo, 'kvenya', 'letsplay');
const out = path.join(home, 'bridge', 'games.json');

export function chessTournament({ depth = 3, games = 10 } = {}) {
  // Полный турнир запускаем только если установлен chess.js: без него
  // правила проверить нечем, а подделывать результат нельзя.
  if (!existsSync(path.join(letsplay, 'node_modules', 'chess.js'))) {
    return { ok: false, why: 'chess.js не установлен — шахматный турнир не проводился' };
  }
  const stdout = execFileSync(process.execPath, ['chess_match.mjs', 'scan'], {
    cwd: letsplay,
    // Бюджет времени проверен живьём: 200 мс даёт 10/10 даже на медленном
    // раннере, 700 мс там же давало 8/10 (времени не хватало на уровни).
    env: { ...process.env, KV_DEPTH: String(depth), KV_TIME_MS: process.env.KV_TIME_MS || '200' },
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  const line = stdout.split('\n').find((l) => l.startsWith('ИТОГ:')) || '';
  const n = (re) => Number((line.match(re) || [])[1] || 0);
  const f = (re) => Number((line.match(re) || [])[1] || 0);
  return {
    ok: true,
    depth,
    timeMs: Number(process.env.KV_TIME_MS || 200),
    avgDepth: f(/средняя глубина ([\d.]+)/) || 0,
    shallowMoves: n(/мелких ходов (\d+)/),
    wins: n(/побед (\d+)/),
    losses: n(/поражений (\d+)/),
    draws: n(/ничьих (\d+)/),
    unfinished: n(/недобитых (\d+)/),
    games,
    avgPlies: n(/средняя партия (\d+)/),
    lostPieces: n(/потеряно (\d+)/),
    opponent: 'ФЕРЗЬ-3000 (минимакс на 2 полухода)',
    raw: line,
  };
}

export async function islandTournament({ depth = 4, seeds = 6 } = {}) {
  const brain = await import(path.join(letsplay, 'island-brain.mjs'));
  const rules = await import(path.join(letsplay, 'island.mjs'));
  const run = (policy) => {
    const res = [];
    for (let seed = 1; seed <= seeds; seed++) {
      const g = brain.playGame({ seed, policy, maxTurns: 150 });
      res.push({ seed, win: g.win, turns: g.turns, why: g.why, built: g.world.built.length });
    }
    return res;
  };
  const mine = run((w) => brain.chooseAction(w, { depth }).action);
  const base = run((w) => rules.baselinePolicy(w));
  const avg = (a) => Math.round(a.reduce((s, x) => s + x.turns, 0) / Math.max(1, a.length));
  return {
    ok: true,
    depth,
    mine: { wins: mine.filter((x) => x.win).length, games: mine.length, avgTurns: avg(mine) },
    baseline: { wins: base.filter((x) => x.win).length, games: base.length, avgTurns: avg(base) },
    details: mine,
  };
}

/** Глубина против глубины: видно, растёт ли сила с более долгим думаньем. */
export async function depthCurve() {
  const brain = await import(path.join(letsplay, 'island-brain.mjs'));
  const rules = await import(path.join(letsplay, 'island.mjs'));
  const rows = [];
  for (const depth of [2, 3, 4]) {
    const turns = [];
    let wins = 0;
    for (let seed = 1; seed <= 3; seed++) {
      const g = brain.playGame({ seed, policy: (w) => brain.chooseAction(w, { depth }).action, maxTurns: 150 });
      if (g.win) wins++;
      turns.push(g.turns);
    }
    rows.push({ depth, wins, games: 3, avgTurns: Math.round(turns.reduce((a, b) => a + b, 0) / turns.length) });
  }
  return rows;
}

export async function main() {
  const started = new Date().toISOString();
  // Средняя глубина за прошлый турнир, чтобы сравнить «стало ли глубже».
  let prevDepth = null;
  try {
    prevDepth = JSON.parse(readFileSync(out, 'utf8')).chess?.avgDepth ?? null;
  } catch {}
  const chess = chessTournament({ depth: Number(process.env.KV_DEPTH || 3) });
  const island = await islandTournament({ depth: Number(process.env.KV_ISLAND_DEPTH || 4) });
  const curve = await depthCurve();
  const report = { schema: 'kvenya-games-v1', started, chess, island, depthCurve: curve, prevDepth };
  if (prevDepth !== null && chess.ok) {
    const delta = Math.round((chess.avgDepth - prevDepth) * 10) / 10;
    console.log(`Глубина против прошлого турнира: ${delta >= 0 ? '+' : ''}${delta} (${prevDepth} → ${chess.avgDepth})`);
  }
  mkdirSync(path.dirname(out), { recursive: true });
  let history = [];
  if (existsSync(out)) {
    try {
      history = JSON.parse(readFileSync(out, 'utf8')).history || [];
    } catch {
      history = [];
    }
  }
  history = [report, ...history].slice(0, 12);
  writeFileSync(out, JSON.stringify({ ...report, history }, null, 2) + '\n', { encoding: 'utf8' });
  console.log(`Шахматы: побед ${chess.wins ?? '—'}/${chess.games}, поражений ${chess.losses ?? '—'}; ` +
    `«Остров»: ${island.mine.wins}/${island.mine.games} против ${island.baseline.wins}/${island.baseline.games} у эвристики; ` +
    `записано в ${path.relative(repo, out)}`);
  return report;
}

if (process.argv[1] && import.meta.url === pathToFileURLSafe(process.argv[1])) {
  await main();
}

function pathToFileURLSafe(p) {
  return new URL(`file://${path.resolve(p)}`).href;
}
