#!/usr/bin/env node
// Баланс-прогон ИИ против ИИ: N сидов, статистика по длительности и победителям.
// Запуск: node tools/ai-war.mjs --seeds 31-50 [--cap 1200] [--swap] [--verbose]
import { loadConfig } from '../src/core/config.js';
import { Game } from '../src/sim/game.js';

const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : def;
};
const flag = (name) => args.includes(`--${name}`);

const seedsArg = String(opt('seeds', '31-50'));
const cap = Number(opt('cap', 1200));
const swap = flag('swap');
const verbose = flag('verbose');

const seeds = [];
for (const part of seedsArg.split(',')) {
  const m = part.match(/^(\d+)-(\d+)$/);
  if (m) for (let s = Number(m[1]); s <= Number(m[2]); s++) seeds.push(s);
  else seeds.push(Number(part));
}

const baseUrl = new URL('../data/', import.meta.url).pathname;
let wins = [0, 0], timeouts = 0, byHq = 0, byCities = 0, shortWars = 0, longWars = 0;
const durations = [];

for (const seed of seeds) {
  const cfg = await loadConfig({ baseUrl });
  cfg.factions[0].persona = 'balanced';
  cfg.factions[1].persona = 'balanced';
  const game = new Game({ cfg, seed, difficulty: 'regular', aiVsAi: true, swapSides: swap });
  let steps = 0;
  while (!game.warOver && steps < cap * 10) { game.step(0.1); steps++; }
  const dur = steps / 10;
  durations.push(dur);
  if (game.warOver) {
    wins[game.outcome.winner]++;
    if (game.outcome.reason.includes('Штаб')) byHq++; else byCities++;
    if (dur < 150) shortWars++;
    if (dur > 600) longWars++;
    if (verbose) console.log(`seed ${seed}: ${Math.round(dur)}s, победа ${game.outcome.winner} (${game.outcome.reason})`);
  } else {
    timeouts++;
    if (verbose) console.log(`seed ${seed}: тайм-аут ${cap}s`);
  }
}

const avg = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
const won = wins[0] + wins[1];
console.log(`сидов: ${seeds.length} (swap=${swap}, лимит ${cap}s)`);
console.log(`финалов: ${won}/${seeds.length}, тайм-аутов: ${timeouts}`);
console.log(`побед Альянса (F0): ${wins[0]}, Легиона (F1): ${wins[1]}`);
console.log(`финал по штабу: ${byHq}, по ключевым городам: ${byCities}`);
console.log(`длительность: средняя ${avg}s, мин ${Math.round(Math.min(...durations))}s, макс ${Math.round(Math.max(...durations))}s`);
console.log(`коротких (<150s): ${shortWars}, длинных (>600s): ${longWars}`);
if (timeouts > 0) {
  console.log('ТАЙМ-АУТЫ есть → война не сходится: смотреть finishUnitsBelow / allInPowerFactor / capture.seconds');
  process.exitCode = 0;
}
