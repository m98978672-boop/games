// Proximity alone is not arrival when a wall or impassable terrain separates
// a unit from its destination. This checks only a short final approach, not a
// complete route; movement and the planner remain responsible for getting there.
export function clearFinalApproach(game, u, x, y) {
  if (!game.cfg.flag('pathing_v2', false) || !game.walls?.enabled()) return true;
  const w=game.world, r=u.radius || 0;
  if (![u.x,u.y,x,y,r].every(Number.isFinite)) return false;
  if (typeof game.walls.blocksMoveSweep === 'function' &&
      game.walls.blocksMoveSweep(u.x,u.y,x,y,r,u)) return false;
  const n=Math.max(1,Math.ceil(Math.hypot(x-u.x,y-u.y)/8));
  for(let i=0;i<=n;i++) {
    const px=u.x+(x-u.x)*i/n,py=u.y+(y-u.y)*i/n;
    if (!w.isBaseWalkable(px,py) || !w.isBaseWalkable(px-r,py-r) || !w.isBaseWalkable(px+r,py-r) ||
        !w.isBaseWalkable(px-r,py+r) || !w.isBaseWalkable(px+r,py+r)) return false;
    if (typeof game.walls.blocksMoveSweep !== 'function' && game.walls.blocksMove(px,py,r,u)) return false;
  }
  return true;
}

// Centroids can be on the far side of a wall, or even inside one. Verify an
// actual active member has a clear final approach rather than just a distance.
export function squadNearObjective(game, sq, target, radius, centroid=sq.centroid()) {
  if (Math.hypot(centroid.x-target.x,centroid.y-target.y)>=radius) return false;
  if (!game.cfg.flag('pathing_v2', false) || !game.walls?.enabled()) return true;
  return sq.units().some(u => u.alive && !u.downed && Math.hypot(u.x-target.x,u.y-target.y)<radius &&
    clearFinalApproach(game,u,target.x,target.y));
}
