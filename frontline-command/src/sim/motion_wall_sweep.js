// Experimental bounded sampled sweep for each ordinary move. Initial wall
// penetration is left to the existing rescue code; this is not a proof for
// dynamic geometry or every position-changing path in the simulation.
export function motionWallSweepFree(game,u,x,y) {
  const walls=game.walls;
  if(!game.cfg.flag('motion_wall_sweep_v1',false)||!walls?.enabled())return true;
  const dx=x-u.x,dy=y-u.y,d=Math.hypot(dx,dy);if(d<1e-9)return true;
  if(walls.blocksMove(u.x,u.y,u.radius,u))return true;
  if(game.cfg.flag('motion_wall_exact_v1',false) && typeof walls.blocksMoveSweep==='function')
    return !walls.blocksMoveSweep(u.x,u.y,x,y,u.radius,u);
  const steps=Math.ceil(d);
  for(let i=1;i<=steps;i++)if(walls.blocksMove(u.x+dx*i/steps,u.y+dy*i/steps,u.radius,u))return false;
  return true;
}
