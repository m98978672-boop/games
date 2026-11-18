// Narrow opt-in experiment: an entering allied infantryman yields to an
// allied infantryman already leaving the same doorway. Not a crowd scheduler.
export function courtesyYield(game,u,visibleIds=null) {
  if (!game.cfg.flag('door_courtesy_v1',false) || !game.cfg.flag('wall_collision_v2',false) ||
      !game.cfg.flag('pathing_v2',false) || !game.walls?.enabled() || !u.alive || u.downed ||
      u.isVehicle || u.playerControlled || u.perception?.hasContact || !u.goal) return null;
  const walls=game.walls,b=walls.buildingAtPoint(u.goal.x,u.goal.y);
  if(!b || walls.buildingAtPoint(u.x,u.y)) return null;
  const state=walls.state(b);if(!state)return null;
  const doors=state.outline.openings.filter(o=>o.type==='door'&&o.move);
  doors.sort((a,c)=>Math.hypot(u.x-b.x-a.cx,u.y-b.y-a.cy)+Math.hypot(u.goal.x-b.x-a.cx,u.goal.y-b.y-a.cy)-
    Math.hypot(u.x-b.x-c.cx,u.y-b.y-c.cy)-Math.hypot(u.goal.x-b.x-c.cx,u.goal.y-b.y-c.cy));
  const o=doors[0];if(!o)return null;
  const px=b.x+o.cx,py=b.y+o.cy,nx=o.nx,ny=o.ny;
  const along=v=>(v.x-px)*nx+(v.y-py)*ny, lateral=v=>-(v.x-px)*ny+(v.y-py)*nx;
  if(along(u)<0||along(u)>150||Math.abs(lateral(u))>80)return null;
  const exiting=game.unitGrid.query(px,py,200).some(v=>v!==u&&(!visibleIds||visibleIds.has(v.id))&&v.alive&&!v.downed&&!v.isVehicle&&!v.playerControlled&&
    v.faction===u.faction&&!v.perception?.hasContact&&v.goal&&walls.buildingAtPoint(v.goal.x,v.goal.y)!==b&&
    along(v)>-150&&along(v)<55&&Math.abs(lateral(v))<45&&
    (walls.buildingAtPoint(v.x,v.y)===b || (along(v)>=0&&along(v.goal)>along(v)+10)));
  if(!exiting)return null;
  // Move outside the central passage and wait; no teleport or forced overlap.
  const entering=game.unitGrid.query(px,py,240).filter(v=>(v===u||!visibleIds||visibleIds.has(v.id))&&v.alive&&!v.downed&&!v.isVehicle&&!v.playerControlled&&
    v.faction===u.faction&&!v.perception?.hasContact&&v.goal&&walls.buildingAtPoint(v.goal.x,v.goal.y)===b&&
    !walls.buildingAtPoint(v.x,v.y)&&along(v)>=0&&along(v)<200&&Math.abs(lateral(v))<80).sort((a,c)=>a.id-c.id);
  const rank=Math.max(0,entering.indexOf(u));
  const side=rank%2===0?1:-1, offset=42, distance=90+Math.floor(rank/2)*24;
  if (game._courtesyMetrics) game._courtesyMetrics.yields++;
  return {x:px+nx*distance-ny*offset*side,y:py+ny*distance+nx*offset*side};
}
