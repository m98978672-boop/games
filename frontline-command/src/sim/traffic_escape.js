import { clearFinalApproach } from './arrival.js';
import { solidUnitMoveFree } from './solid_units.js';
import { Walls } from './walls.js';

// When a friendly body has blocked the intended step for a while, try a short
// lateral/backwards step rather than repeatedly pushing the same direction.
// This is only a temporary steering waypoint: the order and route are not
// changed. The normal movement collision and speed checks still run.
export function trafficEscape(game,u,dx,dy) {
  const wait=u._occupancyWait, goal=u.goal, w=game.world, walls=game.walls;
  if (!goal || u.isVehicle || u.playerControlled || u.perception?.hasContact || !wait ||
      wait.goalX!==goal.x || wait.goalY!==goal.y || game.time-wait.since<0.8 ||
      game.time-wait.lastBlocked>0.5 || !walls?.enabled() || !game.cfg.flag('pathing_v2',false) ||
      !game.cfg.flag('wall_collision_v2',false) || walls.buildingAtPoint?.(u.x,u.y) || walls.buildingAtPoint?.(goal.x,goal.y)) {
    u._trafficEscape=null;return null;
  }
  // Leave door traffic to the existing opening/queue logic, on both sides.
  if (walls.refsInBox?.(u.x,u.y,150).some(ref=>ref.kind==='opening' &&
      Walls.distPointSegment(u.x,u.y,ref.x1,ref.y1,ref.x2,ref.y2).d<150)) {
    u._trafficEscape=null;return null;
  }
  const blocker=game.units.get(wait.blockerId);
  if(!blocker?.alive || blocker.downed || blocker.faction!==u.faction ||
     Math.hypot(u.x-blocker.x,u.y-blocker.y)>80) {u._trafficEscape=null;return null;}
  // Repeated tiny sidesteps must not keep a permanently blocked order alive
  // forever. Stop trying after twenty seconds in the same 55px area while
  // the goal and navigation version remain unchanged; ordinary failure
  // handling then remains responsible for an impossible route.
  let budget=u._trafficEscapeBudget;
  if(budget && (budget.gx!==goal.x || budget.gy!==goal.y || budget.version!==w.navVersion ||
      Math.hypot(u.x-budget.x,u.y-budget.y)>55)) budget=u._trafficEscapeBudget=null;
  if(budget && game.time-budget.since>=20) {u._trafficEscape=null;return null;}
  // This radius covers the full candidate segment and every live body in the
  // occupancy grid; positions here are updated after each unit's movement.
  const reach=26+u.radius+(game.occupancyMaxRadius||0)+1;
  const neighbors=game.occupancyGrid.queryRange(u.x,u.y,reach);
  const valid=p=>clearFinalApproach(game,u,p.x,p.y) &&
    solidUnitMoveFree(game,u,p.x,p.y,0.1,game.occupancyGrid,neighbors);
  const prev=u._trafficEscape;
  if(prev && prev.gx===goal.x && prev.gy===goal.y && prev.version===w.navVersion && game.time<prev.until &&
     Math.hypot(u.x-prev.x,u.y-prev.y)>3 && valid(prev)) return prev;
  if(game.time<(u._trafficEscapeRetry||0))return null;
  const len=Math.hypot(dx,dy), fx=len?dx/len:0, fy=len?dy/len:0;
  let best=null,score=-Infinity;
  for(let k=0;k<16;k++) {
    const a=k*Math.PI/8, x=u.x+Math.cos(a)*26, y=u.y+Math.sin(a)*26, p={x,y};
    if(!valid(p))continue;
    let clearance=Infinity;
    for(const v of neighbors)if(v!==u && v.alive && !v.downed)
      clearance=Math.min(clearance,Math.hypot(x-v.x,y-v.y)-v.radius-u.radius);
    const candidate=Math.min(clearance,25)+7*(Math.cos(a)*fx+Math.sin(a)*fy);
    if(candidate>score){score=candidate;best=p;}
  }
  u._trafficEscapeRetry=game.time+1.2;
  if (best) {
    if (!budget) u._trafficEscapeBudget={gx:goal.x,gy:goal.y,version:w.navVersion,x:u.x,y:u.y,since:game.time};
    if (game._trafficEscapeMetrics) game._trafficEscapeMetrics.chosen++;
  }
  u._trafficEscape=best ? {...best,gx:goal.x,gy:goal.y,version:w.navVersion,until:game.time+1.3} : null;
  return u._trafficEscape;
}
