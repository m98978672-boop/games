// Нагрузочный тест: 400+ юнитов и 500 шагов симуляции без браузера.
import { loadConfig } from '../src/core/config.js';
import { Game } from '../src/sim/game.js';

const cfg = await loadConfig();
const game = new Game({ cfg, seed: 5, difficulty: 'regular', aiVsAi: true });
const perf = (() => { const p = typeof performance !== 'undefined' ? performance : null; return p || { now: () => Date.now() }; })();
// досыпаем юнитов вокруг баз, чтобы получить плотный бой
for (const f of [0, 1]) {
  const hq = game.world.hqOf(f);
  for (let i = 0; i < 170; i++) {
    const a = (i / 170) * Math.PI * 2;
    const r = 60 + (i % 7) * 22;
    game.spawnUnit(f, i % 11 === 0 ? 'mg' : 'infantry', hq.x + Math.cos(a) * r, hq.y + Math.sin(a) * r, {});
  }
}
const total = [...game.units.values()].filter((u) => u.alive).length;
const N = 500;
const t0 = Date.now();
for (let i = 0; i < N; i++) game.step(0.1);
const ms = Date.now() - t0;
const avg = ms / N;
console.log(`юнитов: ${total}, шагов: ${N}, всего ${ms} мс, средний тик ${avg.toFixed(2)} мс (${(1000 / avg).toFixed(0)} FPS только на симуляцию)`);
const heap = process.memoryUsage().heapUsed / 1048576;
console.log(`куча: ${heap.toFixed(0)} МБ, убито: ${game.stats.kills.join('/')}`);
if (avg > 16) { console.log('FAIL: тик симуляции дольше бюджета 16 мс'); process.exit(1); }
if (heap > 800) { console.log('FAIL: слишком большая куча'); process.exit(1); }
// ---------- стены: бюджет кадра ----------
{
  const w = game.walls;
  const steps = w.stats.updates || 1;
  const updMs = w.stats.updateMs / steps;
  const moves = w.stats.calls.move, rays = w.stats.calls.ray, covers = w.stats.calls.cover;
  // замер цены одного запроса на текущей сцене
  const b = game.world.buildings.find((bb) => w.state(bb) && bb.type === 'hq');
  const st = w.state(b);
  const seg = st.outline.segments[0];
  const mx = b.x + (seg.points[0][0] + seg.points[1][0]) / 2, my = b.y + (seg.points[0][1] + seg.points[1][1]) / 2;
  const N2 = 20000;
  let t = perf.now();
  for (let i = 0; i < N2; i++) w.blocksMove(mx + (i % 40) - 20, my + ((i * 7) % 40) - 20, 8, null);
  const perMove = (perf.now() - t) / N2;
  t = perf.now();
  for (let i = 0; i < N2; i++) w.bulletRay(mx - 120, my - 120 + (i % 60), mx + 120, my + 120 - (i % 60), 'rifle', { next: () => 0.5 });
  const perRay = (perf.now() - t) / N2;
  const perTick = updMs + (moves * perMove + rays * perRay + covers * perRay * 2) / steps;
  console.log(`стены: update ${updMs.toFixed(3)} мс/тик, запросов за тик движение ${(moves / steps).toFixed(0)}, пули ${(rays / steps).toFixed(0)}, укрытия ${(covers / steps).toFixed(0)}`);
  console.log(`стены: blocksMove ${(perMove * 1000).toFixed(2)} мкс, bulletRay ${(perRay * 1000).toFixed(2)} мкс → всего ${perTick.toFixed(3)} мс/кадр`);
  if (perTick > 0.5) { console.log('FAIL: стены дороже бюджета 0.5 мс/кадр'); process.exit(1); }
}

// ---------- масштаб: 400 и 500 юнитов ----------
for (const target of [400, 500]) {
  const c2 = await loadConfig();
  const g2 = new Game({ cfg: c2, seed: 5, difficulty: 'regular', aiVsAi: true });
  const alive = () => [...g2.units.values()].filter((u) => u.alive).length;
  for (const f of [0, 1]) {
    const hq = g2.world.hqOf(f);
    let k = 0;
    // кольца вокруг базы плюс штурм центра, чтобы стены и двери были в работе
    while (alive() < target && k < 1200) {
      const a = (k / 130) * Math.PI * 2;
      const r = 70 + (k % 9) * 24;
      g2.spawnUnit(f, k % 11 === 0 ? 'mg' : 'infantry', hq.x + Math.cos(a) * r, hq.y + Math.sin(a) * r, {});
      k++;
    }
  }
  const n = alive();
  const steps2 = 200;
  const t1 = perf.now();
  for (let i = 0; i < steps2; i++) g2.step(0.1);
  const avg2 = (perf.now() - t1) / steps2;
  const fps = 1000 / avg2;
  const need = target <= 400 ? 60 : 45;
  console.log(`${n} юнитов: тик ${avg2.toFixed(2)} мс → ${fps.toFixed(0)} FPS симуляции (нужно ≥${need})`);
  if (fps < need) { console.log(`FAIL: ${n} юнитов не держат ${need} FPS`); process.exit(1); }
}

console.log('\nпроизводительность в порядке');
