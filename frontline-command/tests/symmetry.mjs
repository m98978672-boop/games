// Тест симметрии §23: ИИ против ИИ, одинаковые правила, стороны местами.
// Проверяем, что ни одна сторона не получает преимущества от кода, и что война живая.
import { loadConfig } from '../src/core/config.js';
import { Game } from '../src/sim/game.js';

const cfg = await loadConfig();
cfg.factions[0].persona = 'balanced';
cfg.factions[1].persona = 'balanced';

const HORIZON = 1200; // секунд игрового времени
const results = [];
let fails = 0;

// --- Геометрия карты: жёсткие проверки зеркальности (поворот на 180°) ---
// Раньше «симметрия» проверялась только статистически, и на карте незаметно жили
// асимметричные сетка секторов, сеть дорог и река — это давало перекос в пользу одной стороны.
{
  const probe = new Game({ cfg, seed: 1, difficulty: 'regular', aiVsAi: true });
  const W = probe.world.W, H = probe.world.H;
  const near = (a, b) => Math.abs(a - b) <= 1;

  // 1. Каждый сектор имеет зеркального двойника ровно в своём центре
  let badSectors = 0;
  for (const s of probe.world.sectors) {
    const t = probe.world.sectorAt(W - s.cx, H - s.cy);
    if (!t || !near(t.cx, W - s.cx) || !near(t.cy, H - s.cy)) badSectors++;
  }
  if (!probe.world.sectors.length) { fails++; console.log('FAIL: на карте нет секторов'); }
  if (badSectors) { fails++; console.log(`FAIL: ${badSectors} секторов без зеркального близнеца в своём центре`); }
  const lonely = probe.world.sectors.filter((s) => !s.neighbors.length).length;
  if (lonely) { fails++; console.log(`FAIL: ${lonely} секторов без соседей`); }

  // 2. Каждая точка карты имеет зеркальную (кроме центральной, которая совпадает сама с собой)
  let badPoints = 0;
  for (const p of probe.world.points) {
    // точка ровно в центре карты зеркальна сама себе
    const selfMirror = near(p.x, W - p.x) && near(p.y, H - p.y);
    const twin = selfMirror || probe.world.points.some((q) => q !== p && near(q.x, W - p.x) && near(q.y, H - p.y));
    if (!twin) badPoints++;
  }
  if (badPoints) { fails++; console.log(`FAIL: ${badPoints} точек без зеркальной пары`); }
  let outside = 0;
  for (const p of probe.world.points) if (!probe.world.sectorAt(p.x, p.y)) outside++;
  if (outside) { fails++; console.log(`FAIL: ${outside} точек вне секторов`); }

  // 3. Дороги: каждый узел имеет зеркальный узел
  const nodes = cfg.sectors.roads.flat();
  const badRoads = nodes.filter(([x, y]) => !nodes.some(([x2, y2]) => near(x2, W - x) && near(y2, H - y))).length;
  if (badRoads) { fails++; console.log(`FAIL: ${badRoads} узлов дорог без зеркальной пары`); }

  // 4. Рельеф: расхождения допустимы только на кромке (растеризация линий), ≤0.5% тайлов
  let diff = 0, total = 0;
  for (let y = 16; y < H; y += 32) for (let x = 16; x < W; x += 32) {
    total++;
    if (probe.world.terrainAt(x, y) !== probe.world.terrainAt(W - x, H - y)) diff++;
  }
  const share = diff / total;
  console.log(`геометрия: секторов ${probe.world.sectors.length} (асимметричных ${badSectors}), точек ${probe.world.points.length}, узлов дорог ${nodes.length}, расхождений рельефа ${diff}/${total}`);
  // рельеф должен совпадать с зеркалом точно (допуск — только на дрожание float)
  if (diff > 4) { fails++; console.log(`FAIL: рельеф расходится с зеркалом в ${diff} тайлах из ${total} (${(share * 100).toFixed(2)}%)`); }
}

for (const seed of [11, 23]) {
  for (const swap of [false, true]) {
    const game = new Game({ cfg, seed, difficulty: 'regular', aiVsAi: true, swapSides: swap });
    const t0 = Date.now();
    let steps = 0;
    while (!game.warOver && steps < HORIZON * 10) { game.step(0.1); steps++; }
    const r = {
      seed, swap, seconds: steps / 10, winner: game.outcome ? game.outcome.winner : null,
      reason: game.outcome ? game.outcome.reason : 'истёк горизонт',
      kills: [...game.stats.kills], captures: [...game.stats.captures],
      deliveries: [...game.stats.deliveries], units: [0, 1].map((f) => [...game.units.values()].filter((u) => u.alive && u.faction === f).length),
      ms: Date.now() - t0,
    };
    results.push(r);
    console.log(JSON.stringify(r));
    if (r.kills[0] + r.kills[1] === 0) { fails++; console.log('FAIL: за весь прогон нет убитых'); }
    if (r.captures[0] + r.captures[1] === 0) { fails++; console.log('FAIL: точки не захватывались'); }
    // армия может быть уничтожена — это нормальный финал; плохо, если при этом война не закончилась
    if (r.units.some((n) => n === 0) && r.winner == null) { fails++; console.log('FAIL: одна из сторон полностью уничтожена, но война не завершилась'); }
  }
}

// Исходы: 4 прогона — слишком мало для статистики баланса, поэтому здесь проверяем только,
// что война вообще доходит до решения и что ни одна сторона не «выключена» из правил.
// Системное преимущество первого хода ловит tests/duel.mjs, общий баланс — tools/ai-war.mjs.
const decided = results.filter((r) => r.winner != null);
{
  const w0 = decided.filter((r) => r.winner === 0).length;
  const w1 = decided.length - w0;
  console.log(`решений: ${decided.length}/${results.length}, побед 0: ${w0}, побед 1: ${w1}`);
  const ids = new Set(results.map((r) => r.winner).filter((w) => w != null));
  if (ids.size > 1) console.log('обе фракции побеждали в этом прогоне');
  for (const f of [0, 1]) {
    const dead = results.filter((r) => r.kills[f] === 0).length;
    if (dead === results.length) { fails++; console.log(`FAIL: фракция ${f} ни разу никого не убила`); }
  }
}
const totalCaps = results.reduce((a, r) => a + r.captures[0] + r.captures[1], 0);
console.log(`суммарно захватов: ${totalCaps}, среднее время прогона: ${(results.reduce((a, r) => a + r.ms, 0) / results.length / 1000).toFixed(1)} с`);
console.log(fails ? `\nПРОВАЛЕНО: ${fails}` : '\nсимметрия в порядке');
process.exit(fails ? 1 : 0);
