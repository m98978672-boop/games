// Compare the tighter movement broad phase to the previous 5x5+ scan.
import assert from 'node:assert/strict';
import { loadConfig } from '../src/core/config.js';
import { Game } from '../src/sim/game.js';
import { Walls } from '../src/sim/walls.js';
const game = new Game({ cfg: await loadConfig(), seed: 5, difficulty: 'regular', aiVsAi: true });
const w = game.walls;
function legacy(x, y, radius, mover) {
  if (!w.enabled()) return false;
  const rc = Math.ceil((radius + 26) / 128) + 1;
  const cx = Math.floor(x / 128), cy = Math.floor(y / 128), isVeh = !!mover?.isVehicle;
  for (let i = -rc; i <= rc; i++) for (let j = -rc; j <= rc; j++) {
    const list = w.grid.get((cx + i) * 65536 + cy + j);
    if (!list) continue;
    for (const ref of list) {
      if (ref.breached) continue;
      const lim = radius + ref.thickness * 0.5;
      if (x < ref.bx0 - lim || x > ref.bx1 + lim || y < ref.by0 - lim || y > ref.by1 + lim) continue;
      if (ref.kind === 'segment') {
        if (!ref.blocksMove || (isVeh && !w.vehicleBlocked(ref))) continue;
        if (Walls.dist2PointSegment(x, y, ref.x1, ref.y1, ref.x2, ref.y2) <= lim * lim) return true;
        continue;
      }
      if (Walls.dist2PointSegment(x, y, ref.x1, ref.y1, ref.x2, ref.y2) > lim * lim) continue;
      const o = ref.opening;
      if (o.type === 'window' || o.type === 'embrasure') return true;
      if (o.type === 'door' || o.type === 'gate') {
        if ((isVeh && o.type !== 'gate') || !w.doorOpen(ref.bid, o.id)) return true;
      } else if (o.type === 'door_closed' && !w.doorOpen(ref.bid, o.id)) return true;
    }
  }
  return false;
}
let seed = 836471;
const rnd = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
const refs = [...new Set([...w.grid.values()].flat())];
let count = 0;
for (const mode of ['initial', 'doors-closed', 'breached']) {
  if (mode === 'doors-closed') for (const st of w.instances.values()) for (const door of Object.values(st.doors)) door.state = 'closed';
  if (mode === 'breached') for (let i = 0; i < refs.length; i += 3) if (refs[i].kind === 'segment') refs[i].breached = true;
  for (let i = 0; i < 12000; i++) {
    const ref = refs[Math.floor(rnd() * refs.length)], t = rnd();
    let x = ref.x1 + (ref.x2 - ref.x1) * t + (rnd() - 0.5) * 300;
    let y = ref.y1 + (ref.y2 - ref.y1) * t + (rnd() - 0.5) * 300;
    if (i % 10 === 0) x = Math.round(x / 128) * 128;
    if (i % 11 === 0) y = Math.round(y / 128) * 128;
    const radius = [0, 2, 6, 8, 15, 40, 128, 200][i % 8];
    const mover = i % 2 ? { isVehicle: true } : null;
    assert.equal(w.blocksMove(x, y, radius, mover), legacy(x, y, radius, mover), `${mode} query ${i} at ${x},${y}, radius ${radius}`);
    count++;
  }
}
console.log(`wall movement broad phase: ${count} legacy comparisons, cell boundaries, doors, breaches, infantry and vehicles`);
