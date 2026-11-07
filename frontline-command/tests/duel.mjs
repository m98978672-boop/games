// Тест «первого хода»: две зеркальные группы войск встречаются в центре карты.
// Если одна сторона системно выигрывает, значит в коде есть преимущество порядка обхода
// (раньше так и было: фракция, чьи юниты созданы первыми, стреляла первой и выигрывала 9 из 12).
import { loadConfig } from '../src/core/config.js';
import { Game } from '../src/sim/game.js';

const SEEDS = [1, 2, 3, 4, 5, 6, 7, 8];
const CENTER_A = { x: 1700, y: 2396 };
const CENTER_B = { x: 4096 - CENTER_A.x, y: 4096 - CENTER_A.y };

let w0 = 0, w1 = 0, draws = 0;
let fails = 0;

for (const seed of SEEDS) {
  const cfg = await loadConfig();
  cfg.factions[0].persona = 'balanced';
  cfg.factions[1].persona = 'balanced';
  const game = new Game({ cfg, seed, difficulty: 'regular', aiVsAi: true });

  // Никаких приказов и производства — только бой на месте.
  for (const st of game.autopilot.state.values()) for (const k of Object.keys(st.areas)) st.areas[k] = false;
  for (const sq of [...game.squads.values()]) game.squads.delete(sq.id);

  // Построение второй стороны — зеркальное (поворот на 180°), иначе тест сам создаёт перекос.
  const place = (faction, at, mirror) => {
    const mine = [...game.units.values()].filter((u) => u.faction === faction && u.alive);
    mine.forEach((u, i) => {
      const dx = (i % 5) * 24 - 48, dy = Math.floor(i / 5) * 24 - 48;
      u.x = at.x + (mirror ? -dx : dx);
      u.y = at.y + (mirror ? -dy : dy);
      u.squadId = null;
    });
  };
  place(0, CENTER_A, false);
  place(1, CENTER_B, true);

  const alive = (f) => [...game.units.values()].filter((u) => u.alive && u.faction === f).length;
  let steps = 0;
  while (steps < 6000 && alive(0) > 0 && alive(1) > 0) { game.step(0.1); steps++; }
  const n0 = alive(0), n1 = alive(1);
  if (n0 > n1) w0++; else if (n1 > n0) w1++; else draws++;
  console.log(`seed ${seed}: ${(steps / 10) | 0} с, живых ${n0}/${n1}`);
}

const decided = w0 + w1 + draws;
const worst = Math.max(w0, w1) / decided;
console.log(`\nдуэль: побед 0 — ${w0}, побед 1 — ${w1}, ничьих ${draws}; перекос ${(worst * 100).toFixed(0)}%`);
if (worst > 0.75) { fails++; console.log('ПРОВАЛ: у одной из сторон системное преимущество первого хода'); }
console.log(fails ? `ПРОВАЛЕНО: ${fails}` : 'преимущества первого хода нет');
process.exit(fails ? 1 : 0);
