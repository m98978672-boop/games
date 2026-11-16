// Экспериментальная интеграция локального маршрута. Выключена по умолчанию.
// Один активный поиск на симуляцию и не больше одного среза на игровой тик.
import { EasyStarPlanner } from './easystar_route.js';

export function discardSmartRoute(u) {
  if (u._smartRoute?.detour === u.detour) u.detour = null;
  u._smartRoute = null;
}
export function cancelSelectedSmartRoute(game, u) {
  const state=game._smartRouteState;
  if(state?.active?.unit===u) {
    state.active.planner.cancel('vision navigation selection changed');
    state.active=null;
  }
  if(u._smartRoute)discardSmartRoute(u);
}
function eligible(game, u) {
  if (!u.goal || !u.alive || u.downed || u.arrived || u.playerControlled || u.perception?.hasContact || !game.walls?.enabled() ||
      !game.cfg.flag('pathing_v2', false) || !game.cfg.flag('wall_collision_v2', false)) return false;
  // Не подменяем штатные маршруты внутрь и из зданий (особенно дверные).
  return !game.walls.buildingAtPoint?.(u.x, u.y) && !game.walls.buildingAtPoint?.(u.goal.x, u.goal.y);
}
// Short-range geometric "eyes": look along the desired direction with the
// unit's real radius. This does not detect enemies or replace door logic.
export function obstacleAhead(game, u) {
  const goal=u.goal, r=u.radius, w=game.world;
  if (!goal || !w || !game.walls || ![u.x,u.y,r,goal.x,goal.y].every(Number.isFinite) || r<=0) return false;
  const dx=goal.x-u.x, dy=goal.y-u.y, length=Math.hypot(dx,dy);
  if (length<1) return false;
  const distance=Math.min(32,length), samples=Math.ceil(distance/8);
  for (let i=1;i<=samples;i++) {
    const x=u.x+dx/length*distance*i/samples, y=u.y+dy/length*distance*i/samples;
    if (!w.isBaseWalkable(x,y) || !w.isBaseWalkable(x-r,y-r) || !w.isBaseWalkable(x+r,y-r) ||
        !w.isBaseWalkable(x-r,y+r) || !w.isBaseWalkable(x+r,y+r) || game.walls.blocksMove(x,y,r,u)) return true;
  }
  return false;
}
function seesObstacle(game,u) {
  if (game.time < (u._obstacleVisionNext || 0)) return false;
  u._obstacleVisionNext=game.time+0.4;
  return obstacleAhead(game,u);
}
function validPath(game, u, route) {
  return eligible(game,u) && game.world === route.world && game.walls === route.walls &&
    game.world.navVersion === route.version && u.radius === route.radius && !game.walls.navQueue?.size &&
    Math.hypot(u.goal.x-route.gx,u.goal.y-route.gy) <= 1;
}
export function updateSmartRoute(game, u) {
  const route = u._smartRoute;
  if (route && !validPath(game,u,route)) discardSmartRoute(u);
  if (u._smartRoute) {
    const r = u._smartRoute;
    while (r.index < r.path.length && Math.hypot(u.x-r.path[r.index].x,u.y-r.path[r.index].y)<8) r.index++;
    if (r.index < r.path.length) {
      const p=r.path[r.index];
      r.detour = u.detour = {x:p.x,y:p.y,until:game.time+1};
      return;
    }
    discardSmartRoute(u);
  }
  const state = game._smartRouteState || (game._smartRouteState = { active:null, lastTick:null });
  if (state.active && (game.time-state.active.started>6 || !eligible(game,state.active.unit))) {
    state.active.planner.cancel('owner unavailable');
    state.active.unit._smartRetryAt=game.time+3;
    state.active=null;
  }
  if (!state.active && eligible(game,u) && game.time >= (u._smartRetryAt || 0) && !game.walls.navQueue?.size &&
      (((game.cfg.flag('smart_route_v2', false) || game.cfg.flag('bot_obstacle_vision_v1', false)) && (u.stuck || 0)>=1) ||
       (game.cfg.flag('bot_obstacle_vision_v1', false) && seesObstacle(game,u)))) {
    try { state.active={ unit:u, started:game.time, planner:new EasyStarPlanner(game,u) }; }
    catch { u._smartRetryAt=game.time+3; }
  }
  if (!state.active || state.active.unit!==u || state.lastTick===game.time) return;
  state.lastTick=game.time;
  const job=state.active, metrics=game._smartRouteMetrics;
  const start=metrics ? performance.now() : 0;
  const result=job.planner.step(64);
  if (metrics) {
    const ms=performance.now()-start;
    metrics.samples.push(ms);
    metrics.calls++;
    metrics.maxMs=Math.max(metrics.maxMs,ms);
  }
  if (result.status==='running') return;
  state.active=null;
  if (result.status==='found' && eligible(game,u)) {
    u._smartRoute={path:result.path,index:0,gx:u.goal.x,gy:u.goal.y,world:game.world,walls:game.walls,version:game.world.navVersion,radius:u.radius,detour:null};
    const r=u._smartRoute;
    while (r.index < r.path.length && Math.hypot(u.x-r.path[r.index].x,u.y-r.path[r.index].y)<8) r.index++;
    if (r.index < r.path.length) r.detour = u.detour = {...r.path[r.index],until:game.time+1};
    else discardSmartRoute(u);
  } else u._smartRetryAt=game.time+3;
}
