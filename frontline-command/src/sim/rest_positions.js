// Rest positions exclude the full width of walls and openings; traversing an
// opening is still governed by normal movement/door collision, not this test.
import { Walls } from './walls.js';

function unsafeInRefs(refs, x, y, radius) {
  for (const ref of refs) {
    if (ref.kind === 'segment' && ref.breached) continue;
    const limit = radius + (ref.thickness || 12) / 2 + 3;
    if (x < ref.bx0-limit || x > ref.bx1+limit || y < ref.by0-limit || y > ref.by1+limit) continue;
    if (Walls.dist2PointSegment(x, y, ref.x1, ref.y1, ref.x2, ref.y2) <= limit * limit) return true;
  }
  return false;
}

export function unsafeRest(game, x, y, radius = 0) {
  const walls = game.walls;
  if (!walls?.enabled() || !walls.refsNear) return false;
  const refs = walls.refsInBox ? walls.refsInBox(x, y, radius + 24) : walls.refsNear(x, y, radius + 24);
  return unsafeInRefs(refs, x, y, radius);
}

export function safeRestGoal(game, u, goal) {
  const walls = game.walls, w = game.world, r = u.radius || 0;
  if (!walls?.enabled() || !walls.refsNear) return goal;
  // One broad phase for the entire bounded search; do not allocate and scan
  // the spatial grid anew for every one of the candidate positions.
  const refs = walls.refsInBox ? walls.refsInBox(goal.x, goal.y, 120 + r + 24) : walls.refsNear(goal.x, goal.y, 120 + r + 24);
  if (!unsafeInRefs(refs, goal.x, goal.y, r)) return goal;
  const origin = walls.buildingAtPoint(u.x, u.y);
  const fromGoal = Math.hypot(goal.x-u.x,goal.y-u.y);
  let best = null, bestScore = Infinity;
  for (let d = 8; d <= 120; d += 8) {
    // Every remaining candidate has at least this score; preserves the same
    // optimum while avoiding needless outer rings.
    if (d + Math.max(0, fromGoal - d) * 0.01 > bestScore) break;
    for (let k = 0; k < 16; k++) {
      const a = k * Math.PI / 8, x = goal.x + Math.cos(a) * d, y = goal.y + Math.sin(a) * d;
      if (x-r < 0 || y-r < 0 || x+r > w.W || y+r > w.H ||
          !w.isBaseWalkable(x,y) || !w.isBaseWalkable(x-r,y-r) || !w.isBaseWalkable(x+r,y-r) ||
          !w.isBaseWalkable(x-r,y+r) || !w.isBaseWalkable(x+r,y+r) || unsafeInRefs(refs,x,y,r)) continue;
      const base = d + Math.hypot(x-u.x,y-u.y)*0.01;
      if (base >= bestScore) continue;
      const score = base + (walls.buildingAtPoint(x,y) === origin ? 0 : 32);
      if (score < bestScore) { bestScore = score; best = { ...goal, x, y }; }
    }
  }
  return best;
}

// Exact segment vs expanded footprint rectangle (Liang–Barsky clipping).
export function segmentIntersectsRect(ref, x, y, half) {
  const pad = (ref.thickness || 12) / 2 + 3, h = half + pad;
  let lo = 0, hi = 1;
  const dx = ref.x2-ref.x1, dy = ref.y2-ref.y1;
  for (const [p,q] of [[-dx,ref.x1-(x-h)],[dx,x+h-ref.x1],[-dy,ref.y1-(y-h)],[dy,y+h-ref.y1]]) {
    if (!p) { if (q < 0) return false; continue; }
    const t = q/p;
    if (p < 0) lo = Math.max(lo,t); else hi = Math.min(hi,t);
    if (lo > hi) return false;
  }
  return true;
}

export function footprintTouchesWalls(game, x, y, half) {
  const walls = game.walls;
  if (!walls?.enabled() || !walls.refsNear) return false;
  return walls.refsNear(x,y,half * Math.SQRT2 + 24).some(ref =>
    !(ref.kind === 'segment' && ref.breached) && segmentIntersectsRect(ref,x,y,half));
}
