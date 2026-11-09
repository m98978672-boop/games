// Приёмка «Коллизия стен зданий и укрытия за ними» (§11 ТЗ, 12 автопроверок).
// Каждый тест печатает измеренное значение, чтобы изменение было видно в логе.
import { readFile } from 'node:fs/promises';
import { loadConfig } from '../src/core/config.js';
import { Game } from '../src/sim/game.js';
import { Walls } from '../src/sim/walls.js';

let fails = 0, passes = 0;
const ok = (cond, msg) => { if (cond) { passes++; console.log('ok  ', msg); } else { fails++; console.log('FAIL', msg); } };

// Детерминированный ГПСЧ для статистических проверок
const mulberry32 = (a) => () => {
  a |= 0; a = (a + 0x6D2B79F5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const cfg = await loadConfig();
const game = new Game({ cfg, seed: 7, difficulty: 'regular', aiVsAi: true });
const walls = game.walls;
const world = game.world;
console.log('стены:', walls.instances.size, 'зданий,', [...walls.instances.values()].reduce((a, s) => a + s.segs.length, 0), 'сегментов');

const walledBuildings = (move = null) => world.buildings.filter((b) => {
  const st = walls.state(b);
  if (!st || b.dead || !b.built) return false;
  if (move === null) return true;
  return st.outline.segments.some((s) => !!s.blocksMove === move);
});
const segPts = (s) => ({ x1: s.points[0][0], y1: s.points[0][1], x2: s.points[1][0], y2: s.points[1][1] });
const openPts = (o) => ({ x1: o.p1[0], y1: o.p1[1], x2: o.p2[0], y2: o.p2[1] });

// ---------- 1. Замкнутость контура ----------
{
  let worst = 0, worstType = '';
  for (const [type, o] of Object.entries(cfg.outlines || {})) {
    if (o.mode !== 'ring') continue;
    const pieces = [
      ...o.segments.map((s) => ({ ...segPts(s), tag: 'seg' })),
      ...o.openings.map((op) => ({ ...openPts(op), tag: 'open' })),
    ];
    const h = o.size / 2, step = 0.25;
    let maxGap = 0;
    const probe = (x, y) => {
      let d = Infinity;
      for (const p of pieces) d = Math.min(d, Walls.distPointSegment(x, y, p.x1, p.y1, p.x2, p.y2).d);
      return d;
    };
    for (let t = -h; t <= h; t += step) {
      maxGap = Math.max(maxGap, probe(t, -h), probe(t, h), probe(-h, t), probe(h, t));
    }
    if (maxGap > worst) { worst = maxGap; worstType = type; }
  }
  ok(worst <= 0.5, `контур замкнут у всех типов: худший разрыв ${worst.toFixed(3)} px (${worstType})`);
}

// ---------- 2. Непроходимость: 1000 попыток ----------
{
  const bs = walledBuildings(true);
  const rnd = mulberry32(1234);
  let stopped = 0, attempts = 1000, leaked = null;
  for (let i = 0; i < attempts; i++) {
    const b = bs[Math.floor(rnd() * bs.length)];
    const st = walls.state(b);
    const seg = st.outline.segments.filter((s) => s.blocksMove)[Math.floor(rnd() * st.outline.segments.filter((s) => s.blocksMove).length)];
    const p = segPts(seg);
    const t = 0.1 + rnd() * 0.8;
    const px = b.x + p.x1 + (p.x2 - p.x1) * t, py = b.y + p.y1 + (p.y2 - p.y1) * t;
    const len = Math.hypot(p.x2 - p.x1, p.y2 - p.y1) || 1;
    const nx = -(p.y2 - p.y1) / len, ny = (p.x2 - p.x1) / len;
    // идём сквозь стену шагом 1 px: должен найтись запертый шаг
    let hit = false;
    for (let s = -20; s <= 20 && !hit; s += 1) {
      if (walls.blocksMove(px + nx * s, py + ny * s, 6, { isVehicle: false })) hit = true;
    }
    if (hit) stopped++; else if (!leaked) leaked = `${b.type}@${Math.round(px)},${Math.round(py)}`;
  }
  ok(stopped === attempts, `непроходимость: ${stopped}/${attempts} попыток прохода остановлено${leaked ? `, протечка ${leaked}` : ''}`);
}

// ---------- 3. Пробивание по материалам (отклонение ≤3 %) ----------
{
  const rnd = mulberry32(99);
  const byMat = new Map();
  for (const b of walledBuildings()) {
    const st = walls.state(b);
    for (const s of st.outline.segments) {
      if (!byMat.has(s.material)) byMat.set(s.material, { b, s });
    }
  }
  let worst = 0;
  for (const [mat, { b, s }] of byMat) {
    const p = segPts(s), len = Math.hypot(p.x2 - p.x1, p.y2 - p.y1) || 1;
    const nx = -(p.y2 - p.y1) / len, ny = (p.x2 - p.x1) / len;
    const mx = b.x + (p.x1 + p.x2) / 2, my = b.y + (p.y1 + p.y2) / 2;
    for (const weaponId of ['rifle', 'sniper']) {
      const shots = 4000;
      let through = 0;
      for (let i = 0; i < shots; i++) {
        const r = walls.bulletRay(mx + nx * 40, my + ny * 40, mx - nx * 40, my - ny * 40, weaponId, { next: rnd });
        if (!r.blocked) through++;
      }
      const emp = through / shots;
      const exp = walls.penetrationChance(mat, weaponId, 'intact');
      const dev = Math.abs(emp - exp);
      worst = Math.max(worst, dev);
      ok(dev <= 0.03, `пробивание ${mat}/${weaponId}: ожидалось ${exp.toFixed(3)}, получено ${emp.toFixed(3)} (отклонение ${dev.toFixed(3)})`);
    }
  }
  console.log('     худшее отклонение пробивания:', worst.toFixed(4));
}

// ---------- 4. Нет туннелирования на высокой скорости ----------
{
  const b = world.buildings.find((bb) => bb.type === 'hq' && walls.state(bb));
  const st = walls.state(b);
  const seg = st.outline.segments[0];
  const p = segPts(seg), len = Math.hypot(p.x2 - p.x1, p.y2 - p.y1) || 1;
  const nx = -(p.y2 - p.y1) / len, ny = (p.x2 - p.x1) / len;
  const mx = b.x + (p.x1 + p.x2) / 2, my = b.y + (p.y1 + p.y2) / 2;
  const far = 1400;
  const r = walls.bulletRay(mx + nx * far, my + ny * far, mx - nx * far, my - ny * far, 'sniper', { next: () => 0.99 });
  ok(r.blocked === true, `пуля 2800 px сквозь бетон не туннелирует (blocked=${r.blocked})`);
  const legacy = game.raycastBlocked(mx + nx * far, my + ny * far, mx - nx * far, my - ny * far, { id: 'sniper', range: 1000 });
  ok(!!legacy, 'raycastBlocked (старый код, шаг 14/46 px) тоже видит стену на 2800 px');
}

// ---------- 5. Логика проёмов ----------
{
  const hq = world.buildings.find((bb) => bb.type === 'hq' && walls.state(bb));
  const st = walls.state(hq);
  const door = st.outline.openings.find((o) => o.type === 'door');
  const win = st.outline.openings.find((o) => o.type === 'window');
  const embr = st.outline.openings.find((o) => o.type === 'embrasure');
  const dp = openPts(door), dcx = hq.x + door.cx, dcy = hq.y + door.cy;
  const dlen = Math.hypot(dp.x2 - dp.x1, dp.y2 - dp.y1) || 1;
  const dnx = -(dp.y2 - dp.y1) / dlen, dny = (dp.x2 - dp.x1) / dlen;
  const inf = { isVehicle: false }, veh = { isVehicle: true };
  walls.openDoor(hq, door.id);
  const openPass = !walls.blocksMove(dcx, dcy, 6, inf);
  walls.closeDoor(hq, door.id);
  const closedBlock = walls.blocksMove(dcx, dcy, 6, inf);
  const shotClosed = walls.bulletRay(dcx + dnx * 60, dcy + dny * 60, dcx - dnx * 60, dcy - dny * 60, 'rifle', { next: () => 0.99 });
  walls.openDoor(hq, door.id);
  ok(openPass && closedBlock, 'дверь: открыта — проходима, закрыта — запирает');
  ok(shotClosed.blocked === true && shotClosed.breakDoor === true, 'закрытая дверь останавливает пулю и помечается как выламываемая');

  const wcx = hq.x + win.cx, wcy = hq.y + win.cy;
  const wp = openPts(win), wlen = Math.hypot(wp.x2 - wp.x1, wp.y2 - wp.y1) || 1;
  const wnx = -(wp.y2 - wp.y1) / wlen, wny = (wp.x2 - wp.x1) / wlen;
  const winBlocksMove = walls.blocksMove(wcx, wcy, 6, inf);
  const winShot = walls.bulletRay(wcx + wnx * 60, wcy + wny * 60, wcx - wnx * 60, wcy - wny * 60, 'rifle', { next: () => 0.5 });
  ok(winBlocksMove === true && winShot.blocked === false && winShot.through === 'window', 'окно: не проходимо, но простреливается');

  if (embr) {
    const ecx = hq.x + embr.cx, ecy = hq.y + embr.cy;
    const ep = openPts(embr), elen = Math.hypot(ep.x2 - ep.x1, ep.y2 - ep.y1) || 1;
    const enx = -(ep.y2 - ep.y1) / elen, eny = (ep.x2 - ep.x1) / elen;
    const factor = walls.openingDefs.embrasure?.penetrationFactor ?? 0.15;
    let through = 0;
    const rnd = mulberry32(7);
    for (let i = 0; i < 2000; i++) {
      const r = walls.bulletRay(ecx + enx * 60, ecy + eny * 60, ecx - enx * 60, ecy - eny * 60, 'rifle', { next: rnd });
      if (!r.blocked) through++;
    }
    ok(Math.abs(through / 2000 - factor) <= 0.03, `бойница: доля прошедших пуль ${(through / 2000).toFixed(3)} при норме ${factor}`);
  }

  const gateB = world.buildings.find((bb) => walls.state(bb) && walls.state(bb).outline.openings.some((o) => o.type === 'gate'));
  if (gateB) {
    const gst = walls.state(gateB);
    const gate = gst.outline.openings.find((o) => o.type === 'gate');
    walls.openDoor(gateB, gate.id);
    const gx = gateB.x + gate.cx, gy = gateB.y + gate.cy;
    ok(!walls.blocksMove(gx, gy, 6, veh) && !walls.blocksMove(gx, gy, 6, inf), 'ворота открыты: проходят и техника, и пехота');
    walls.closeDoor(gateB, gate.id);
    ok(walls.blocksMove(gx, gy, 6, veh), 'ворота закрыты: техника заперта');
    walls.openDoor(gateB, gate.id);
  }
}

// ---------- 6. Ноль попаданий из-за сплошной стены ----------
{
  const b = world.buildings.find((bb) => bb.type === 'hq' && walls.state(bb));
  const st = walls.state(b);
  const seg = st.outline.segments[0];
  const p = segPts(seg), len = Math.hypot(p.x2 - p.x1, p.y2 - p.y1) || 1;
  const nx = -(p.y2 - p.y1) / len, ny = (p.x2 - p.x1) / len;
  const mx = b.x + (p.x1 + p.x2) / 2, my = b.y + (p.y1 + p.y2) / 2;
  const shooter = { x: mx + nx * 70, y: my + ny * 70 };
  const target = { x: mx - nx * 60, y: my - ny * 60 };
  const rnd = mulberry32(4242);
  let hits = 0;
  const flat = ['rifle', 'mg', 'pistol', 'smg'];
  for (let i = 0; i < 300; i++) {
    for (const wid of flat) {
      const r = walls.bulletRay(shooter.x, shooter.y, target.x, target.y, wid, { next: rnd });
      if (!r.blocked) hits++;
    }
  }
  ok(hits === 0, `из-за бетонной стены попаданий 0 (проверено ${300 * flat.length} выстрелов, прошло ${hits})`);
  // Проверяем пробитие снайпером по текущему коэффициенту материала.
  let sniperThrough = 0, lossSum = 0;
  for (let i = 0; i < 1000; i++) {
    const r = walls.bulletRay(shooter.x, shooter.y, target.x, target.y, 'sniper', { next: rnd });
    if (!r.blocked) { sniperThrough++; lossSum += r.damageMult ?? 0; }
  }
  const expSniper = walls.penetrationChance('concrete', 'sniper', 'intact');
  ok(Math.abs(sniperThrough / 1000 - expSniper) <= 0.03 && (sniperThrough === 0 || lossSum / sniperThrough < 1),
    `снайпер и бетон: прошло ${(sniperThrough / 1000).toFixed(3)} (норма ${expSniper}), урон после стены ×${(sniperThrough ? lossSum / sniperThrough : 0).toFixed(2)}`);
}

// ---------- 7. Стойки и высота укрытия ----------
{
  const hq = world.buildings.find((bb) => bb.type === 'hq' && walls.state(bb));
  const st = walls.state(hq);
  const cover = { x: hq.x + st.outline.size / 2 + 10, y: hq.y };
  const dir = { x: hq.x, y: hq.y };
  const c = walls.coverAt(cover.x, cover.y, dir.x, dir.y);
  const mult3 = walls.stanceMult(3), mult2 = walls.stanceMult(2), mult1 = walls.stanceMult(1);
  ok(c.value > 0.3, `укрытие у стены штаба даёт value ${c.value.toFixed(2)} (класс ${c.class})`);
  ok(mult3 >= mult2 && mult2 >= mult1 && mult1 >= 0.1, `стойки: класс 3/${mult3.toFixed(2)} ≥ класс 2/${mult2.toFixed(2)} ≥ класс 1/${mult1.toFixed(2)}`);
  const behind = walls.coverAt(hq.x, hq.y, cover.x, cover.y);
  console.log('     укрытие с обратной стороны:', behind.value.toFixed(2));
}

// ---------- 8. Разрушение → навигация не позже 1 с ----------
{
  const b = world.buildings.find((bb) => {
    const st = walls.state(bb);
    return st && st.outline.spec?.material === 'wood' && st.outline.mode === 'ring';
  });
  const st = walls.state(b);
  const seg = st.outline.segments[0];
  const p = segPts(seg), len = Math.hypot(p.x2 - p.x1, p.y2 - p.y1) || 1;
  const nx = -(p.y2 - p.y1) / len, ny = (p.x2 - p.x1) / len;
  const mx = b.x + (p.x1 + p.x2) / 2, my = b.y + (p.y1 + p.y2) / 2;
  const before = walls.blocksMove(mx, my, 2, null);
  walls.damageSegment(b, seg.id, 1e6, 'tank_cannon');
  const t0 = game.time;
  let waited = 0;
  while (waited < 2 && !world.isWalkable(mx, my)) {
    game.step(0.05); waited += 0.05;
  }
  const walkable = world.isWalkable(mx, my) && !walls.blocksMove(mx, my, 2, null);
  ok(before && walkable && waited <= 1.0,
    `пролом в дереве: стена была непроходима, через ${waited.toFixed(2)} с (${(game.time - t0).toFixed(2)} с симуляции) навигация свободна`);
}

// ---------- 9. Антизастревание: нет телепортов, застревания не растут ----------
{
  const run = async (wallsOn) => {
    const c = await loadConfig();
    if (!wallsOn) c.flags.wall_collision_v2 = false;
    const g = new Game({ cfg: c, seed: 11, difficulty: 'regular', aiVsAi: true });
    const prev = new Map();
    let jumps = 0, maxRatio = 0;
    for (let i = 0; i < 600; i++) {
      g.step(0.1);
      for (const u of g.units.values()) {
        if (!u.alive) continue;
        const p = prev.get(u.id);
        if (p) {
          const d = Math.hypot(u.x - p.x, u.y - p.y);
          const ratio = d / Math.max(1, u.speed * 0.1);
          maxRatio = Math.max(maxRatio, ratio);
          // физический предел: со стенами шаг ≤ 1.5× скорости, плюс двойной шаг логистики
          if (d > u.speed * 0.1 * 3 + 4) jumps++;
        }
        prev.set(u.id, { x: u.x, y: u.y });
      }
    }
    const alive = [...g.units.values()].filter((u) => u.alive);
    return { jumps, maxRatio, stuck: alive.filter((u) => u.stuck > 2).length, alive: alive.length };
  };
  const on = await run(true), off = await run(false);
  ok(on.jumps === 0 && on.maxRatio <= 3.2,
    `телепортов нет: скачков ${on.jumps}, максимум ${on.maxRatio.toFixed(2)}× скорости за тик (в игре без стен ${off.maxRatio.toFixed(2)}×)`);
  ok(on.stuck <= off.stuck + 2,
    `застрявших со стенами ${on.stuck} из ${on.alive}, без стен ${off.stuck} из ${off.alive} (разница ≤2)`);
}

// ---------- 10. Симметрия фракций ±5 % ----------
{
  const gSym = new Game({ cfg, seed: 7, difficulty: 'regular', aiVsAi: true });
  const wSym = gSym.walls;
  const byType = new Map();
  for (const b of gSym.world.buildings) {
    const st = wSym.state(b);
    if (!st) continue;
    const k = b.type;
    if (!byType.has(k)) byType.set(k, []);
    byType.get(k).push(b);
  }
  let worst = 0, compared = 0;
  for (const [type, list] of byType) {
    const f0 = list.find((b) => b.faction === 0), f1 = list.find((b) => b.faction === 1);
    if (!f0 || !f1) continue;
    const s0 = wSym.state(f0), s1 = wSym.state(f1);
    const sameGeom = s0.segs.length === s1.segs.length &&
      s0.outline.segments.every((s, i) => s.hp === s1.outline.segments[i].hp && s.material === s1.outline.segments[i].material);
    const seg = s0.outline.segments[0];
    const p = segPts(seg), len = Math.hypot(p.x2 - p.x1, p.y2 - p.y1) || 1;
    const nx = -(p.y2 - p.y1) / len, ny = (p.x2 - p.x1) / len;
    const rnd = mulberry32(555);
    const ratio = (b, s) => {
      const pp = segPts(s.outline.segments[0]);
      const l = Math.hypot(pp.x2 - pp.x1, pp.y2 - pp.y1) || 1;
      const nnx = -(pp.y2 - pp.y1) / l, nny = (pp.x2 - pp.x1) / l;
      const mx = b.x + (pp.x1 + pp.x2) / 2, my = b.y + (pp.y1 + pp.y2) / 2;
      let through = 0;
      for (let i = 0; i < 2000; i++) {
        if (!wSym.bulletRay(mx + nnx * 40, my + nny * 40, mx - nnx * 40, my - nny * 40, 'rifle', { next: rnd }).blocked) through++;
      }
      return through / 2000;
    };
    const r0 = ratio(f0, s0), r1 = ratio(f1, s1);
    const dev = Math.abs(r0 - r1);
    worst = Math.max(worst, dev);
    compared++;
    ok(sameGeom && dev <= 0.05, `симметрия ${type}: геометрия ${sameGeom ? 'совпала' : 'РАЗНАЯ'}, пробивание ${r0.toFixed(3)}/${r1.toFixed(3)} (Δ ${dev.toFixed(3)})`);
  }
  ok(compared > 0, `сравнено типов зданий по фракциям: ${compared}`);
}

// ---------- 11. Сохранение/загрузка, старые сейвы ----------
{
  const hq = world.buildings.find((bb) => bb.type === 'hq' && walls.state(bb));
  const st = walls.state(hq);
  walls.damageSegment(hq, st.outline.segments[1].id, 1e6, 'tank_cannon');
  walls.closeDoor(hq, st.outline.openings.find((o) => o.type === 'door').id);
  const saved = JSON.parse(JSON.stringify(walls.serialize()));
  const cfg2 = await loadConfig();
  const g3 = new Game({ cfg: cfg2, seed: 7, difficulty: 'regular', aiVsAi: true });
  const restored = g3.walls.applySaved(saved);
  const after = JSON.parse(JSON.stringify(g3.walls.serialize()));
  const key = Object.keys(after).find((k) => k.startsWith('hq:'));
  const sameSeg = saved[key] && JSON.stringify(after[key].segs) === JSON.stringify(saved[key].segs);
  const migrationOld = g3.walls.applySaved(undefined);
  ok(restored > 0 && sameSeg, `сейв стен: восстановлено ${restored} зданий, сегменты совпали: ${!!sameSeg}`);
  ok(migrationOld === 0, 'старый сейв без блока стен загружается без ошибок (applySaved(undefined) → 0)');
  const g4 = new Game({ cfg: cfg2, seed: 7, difficulty: 'regular', aiVsAi: true });
  ok(g4.walls.serialize() !== null, 'новый сейв содержит блок стен');
}

// ---------- 12. Флаг выключен = прежнее поведение ----------
{
  const cfgOff = await loadConfig();
  cfgOff.flags.wall_collision_v2 = false;
  const gOff = new Game({ cfg: cfgOff, seed: 7, difficulty: 'regular', aiVsAi: true });
  const w = gOff.walls;
  const b = gOff.world.buildings.find((bb) => bb.type === 'hq');
  const st = w.state(b);
  const seg = st.outline.segments[0];
  const p = segPts(seg), len = Math.hypot(p.x2 - p.x1, p.y2 - p.y1) || 1;
  const nx = -(p.y2 - p.y1) / len, ny = (p.x2 - p.x1) / len;
  const mx = b.x + (p.x1 + p.x2) / 2, my = b.y + (p.y1 + p.y2) / 2;
  const noMove = !w.blocksMove(mx, my, 8, null);
  const noShot = !w.bulletRay(mx + nx * 40, my + ny * 40, mx - nx * 40, my - ny * 40, 'rifle', { next: () => 0.99 }).blocked;
  const noVision = !w.blocksVision(mx + nx * 80, my + ny * 80, mx - nx * 80, my - ny * 80);
  const noCover = w.coverAt(mx + nx * 20, my + ny * 20, mx - nx * 40, my - ny * 40).value === 0;
  ok(noMove && noShot && noVision && noCover, 'флаг off: стены не блокируют движение/пули/обзор и не дают укрытия');
  // звук за стеной: приглушение включается флагом wall_sound_muffle
  const hqW = world.buildings.find((bb) => bb.type === 'hq');
  const stW = walls.state(hqW);
  const segW = stW.outline.segments[0];
  const midX = hqW.x + (segW.points[0][0] + segW.points[1][0]) / 2;
  const midY = hqW.y + (segW.points[0][1] + segW.points[1][1]) / 2;
  game.focus = { x: midX + 80, y: midY + 80 };
  game.soundQueue.length = 0;
  game.sound('hit_concrete', midX - 80, midY - 80);
  const muffleOn = game.soundQueue[0]?.muffle ?? 1;
  cfg.flags.wall_sound_muffle = false;
  game.soundQueue.length = 0;
  game.sound('hit_concrete', midX - 80, midY - 80);
  const muffleOff = game.soundQueue[0]?.muffle ?? 1;
  cfg.flags.wall_sound_muffle = true;
  ok(muffleOn < 1 && muffleOff === 1, `звук за стеной: muffle ${muffleOn} при включённом флаге, ${muffleOff} при выключенном`);

  // Совпадение с прежним кодом (эталон снят с коммита 9602bae, до стен v2)
  const fixture = JSON.parse(await readFile(new URL('./fixtures/legacy_walls_off_seed7.json', import.meta.url), 'utf8'));
  const gOff2 = new Game({ cfg: cfgOff, seed: fixture.seed, difficulty: 'regular', aiVsAi: true });
  for (let i = 0; i < Math.round(fixture.seconds / 0.1); i++) gOff2.step(0.1);
  const ref = new Map(fixture.units.map((u) => [u[0], u]));
  let maxDiff = 0, hpDiff = 0, missing = 0;
  for (const u of gOff2.units.values()) {
    if (!u.alive) continue;
    const r = ref.get(u.id);
    if (!r) { missing++; continue; }
    maxDiff = Math.max(maxDiff, Math.hypot(u.x - r[1], u.y - r[2]));
    if (Math.round(u.hp) !== Math.round(r[3])) hpDiff++;
  }
  ok(maxDiff < 0.01 && hpDiff === 0 && missing === 0,
    `флаг off = прежнее поведение: ${fixture.seconds} с, расхождение позиций ${maxDiff.toFixed(4)} px, отличий hp ${hpDiff}, лишних юнитов ${missing}`);
}

console.log(`\nстены: ${passes} ok, ${fails} fail`);
process.exit(fails ? 1 : 0);
