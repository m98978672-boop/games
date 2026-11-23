// Замер силы игры в «Остров»: её планировщик против простой эвристики.
import { playGame, chooseAction } from './island-brain.mjs';
import { baselinePolicy, observe } from './island.mjs';
import fs from 'node:fs';

const seeds = [1,2,3,4,5,6];
const res = { brain: [], baseline: [] };
for (const seed of seeds) {
  const b = playGame({ seed, policy: (w) => chooseAction(w, { depth: 4 }).action });
  res.brain.push({ seed, win: b.win, turns: b.turns, why: b.why, built: b.world.built.length });
  const s = playGame({ seed, policy: baselinePolicy });
  res.baseline.push({ seed, win: s.win, turns: s.turns, why: s.why, built: s.world.built.length });
}
const line = (n, a) => `${n}: побед ${a.filter(x=>x.win).length}/${a.length}, средняя длина ${Math.round(a.reduce((s,x)=>s+x.turns,0)/a.length)} ходов`;
console.log(line('планировщик Квени', res.brain));
console.log(line('эвристика', res.baseline));
for (const r of res.brain) console.log(`  seed ${r.seed}: ${r.win ? 'победа' : 'нет'} за ${r.turns} ходов (${r.why})`);
fs.mkdirSync('build', { recursive: true });
fs.writeFileSync('build/island-bench.json', JSON.stringify({ schema: 'kvenya-island-bench-v1', ...res }, null, 1));
