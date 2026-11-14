// Bounded adjustment of a destination embedded in exact wall geometry.
// Intermediate flow-field edges still require separate validation.
export function wallSafeGoal(game,u) {
  const goal=u.goal,w=game.world,walls=game.walls;
  if(!walls.blocksMove(goal.x,goal.y,u.radius,u))return goal;
  const r=u.radius,originBuilding=walls.buildingAtPoint(u.x,u.y);
  let best=null,bestScore=Infinity;
  for(let distance=8;distance<=96;distance+=8)for(let k=0;k<16;k++){
    const angle=2*Math.PI*k/16,x=goal.x+Math.cos(angle)*distance,y=goal.y+Math.sin(angle)*distance;
    if(x-r<0||y-r<0||x+r>w.W||y+r>w.H||!w.isBaseWalkable(x,y)||!w.isBaseWalkable(x-r,y-r)||
      !w.isBaseWalkable(x+r,y-r)||!w.isBaseWalkable(x-r,y+r)||!w.isBaseWalkable(x+r,y+r)||walls.blocksMove(x,y,r,u))continue;
    // Prefer the same side of a building as the mover when candidates are
    // similarly close; door handling remains the normal movement's job.
    const same=walls.buildingAtPoint(x,y)===originBuilding;
    const score=distance+(same?0:12);
    if(score<bestScore){bestScore=score;best={...goal,x,y};}
  }
  return best;
}
