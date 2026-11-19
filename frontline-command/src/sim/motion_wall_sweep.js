// A whole-step wall check. Initial wall penetration is left to the existing
// rescue code; this does not cover every position-changing path in simulation.
export function motionWallSweepFree(game,u,x,y) {
  const walls=game.walls;
  if(!game.cfg.flag('motion_wall_sweep_v1',false)||!walls?.enabled())return true;
  const dx=x-u.x,dy=y-u.y,d=Math.hypot(dx,dy);if(d<1e-9)return true;
  if(game.cfg.flag('motion_wall_exact_v1',false) && typeof walls.blocksMoveSweep==='function') {
    // Most moves are away from walls. Only test for an embedded starting
    // position if the swept circle actually intersects a wall.
    if(!walls.blocksMoveSweep(u.x,u.y,x,y,u.radius,u))return true;
    return walls.blocksMove(u.x,u.y,u.radius,u);
  }
  if(walls.blocksMove(u.x,u.y,u.radius,u))return true;
  const steps=Math.ceil(d);
  for(let i=1;i<=steps;i++)if(walls.blocksMove(u.x+dx*i/steps,u.y+dy*i/steps,u.radius,u))return false;
  return true;
}
