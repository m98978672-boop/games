// Локальный маршрут для замеченного препятствия. Датчик включён в обычной игре.
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
export function combatRouteAllowed(game, u) {
  const sq=u.squad;
  return !!(game.cfg.flag('bot_obstacle_vision_v1', false) && !u.isVehicle && u.perception?.hasContact &&
    u.activity === 'fight' && u.targetId != null && game.unitById(u.targetId)?.alive &&
    (!sq || (sq.fire !== 'hold' && sq.state !== 'hold' && sq.behavior !== 'hold' &&
      sq.state !== 'retreat' && sq.state !== 'regroup')));
}
function eligible(game, u) {
  if (!u.goal || !u.alive || u.downed || u.arrived || u.playerControlled ||
      (u.perception?.hasContact && !combatRouteAllowed(game,u)) || !game.walls?.enabled() ||
      !game.cfg.flag('pathing_v2', false) || !game.cfg.flag('wall_collision_v2', false)) return false;
  // Не подменяем штатные маршруты внутрь и из зданий (особенно дверные).
  return !game.walls.buildingAtPoint?.(u.x, u.y) && !game.walls.buildingAtPoint?.(u.goal.x, u.goal.y);
}
// Scoped alternative: only logistics trucks can opt into the same short-range
// obstacle sensor without enabling the experiment for every combat unit.
export function truckRouteAssist(game, u) {
  return u.role === 'truck' && game.cfg.flag('vehicle_exterior_v1', true) && game.cfg.flag('truck_route_assist_v1', false) &&
    !!game.walls?.enabled() && game.cfg.flag('pathing_v2', false);
}
// A bounded active search may need several seconds to build its grid. Do not
// let the legacy stuck timer discard the very goal it is searching for. A
// stale, cancelled or timed-out job never grants this grace period.
export function smartRouteSearching(game, u) {
  if (!game.cfg.flag('smart_route_wait_v1', true) ||
      (!game.cfg.flag('smart_route_v2', false) && !game.cfg.flag('bot_obstacle_vision_v1', false) && !truckRouteAssist(game,u))) return false;
  const job = game._smartRouteState?.active, p = job?.planner;
  return !!(job?.unit === u && p?.status === 'running' && eligible(game,u) &&
    targetStillValid(u,job.combatTarget,game.unitById(u.targetId)) &&
    game.time >= job.started && game.time - job.started <= 6 &&
    p.world === game.world && p.walls === game.walls && p.version === game.world.navVersion &&
    !game.walls.navQueue?.size && p.radius === u.radius && p.goal && p.start &&
    Math.hypot(p.goal.x-u.goal.x,p.goal.y-u.goal.y) <= 1 &&
    Math.hypot(p.start.x-u.x,p.start.y-u.y) <= (p.maxStartDrift ?? 32));
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
function targetStillValid(u, marker, target) {
  return !marker || (!!u.perception?.hasContact && u.activity === 'fight' && target?.alive &&
    target.id === marker.id && Math.hypot(target.x-marker.x,target.y-marker.y)<=24);
}
// Do not send a fighting unit on a detour that immediately loses the target.
// This conservative check can reject a usable route; combat can then use the
// existing local movement instead. The target may move up to 24px before the
// route is invalidated, so reserve that much of the vision radius.
function keepsTargetVisible(game,u,path,marker) {
  if (!marker) return true;
  const maxDistance=Math.max(0,u.vision-24);
  return path.every(p => Math.hypot(p.x-marker.x,p.y-marker.y)<=maxDistance &&
    game.world.hasLOS(p.x,p.y,marker.x,marker.y,true));
}
// Keep a stable tactical destination while going around an obstacle, but
// abandon it immediately if the opponent moves substantially or contact ends.
export function keepCombatRouteGoal(game,u,target) {
  const route=u._smartRoute, job=game._smartRouteState?.active;
  const marker=route?.combatTarget || (job?.unit===u ? job.combatTarget : null);
  return !!(marker && u.goal && combatRouteAllowed(game,u) && targetStillValid(u,marker,target));
}
function validPath(game, u, route) {
  return eligible(game,u) && targetStillValid(u,route.combatTarget,game.unitById(u.targetId)) &&
    game.world === route.world && game.walls === route.walls &&
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
  if (state.active && (game.time-state.active.started>6 || !eligible(game,state.active.unit) ||
      !targetStillValid(state.active.unit,state.active.combatTarget,game.unitById(state.active.unit.targetId)))) {
    state.active.planner.cancel('owner unavailable');
    state.active.unit._smartRetryAt=game.time+3;
    state.active=null;
  }
  // Avoid expensive building-geometry lookups on every frame when the sensor
  // is still cooling down and this unit has not become stuck.
  const vision = game.cfg.flag('bot_obstacle_vision_v1', false) || truckRouteAssist(game,u);
  const stuck = (game.cfg.flag('smart_route_v2', false) || vision) && (u.stuck || 0)>=1;
  const sensorReady = vision && game.time >= (u._obstacleVisionNext || 0);
  if (!state.active && (stuck || sensorReady) && game.time >= (u._smartRetryAt || 0) &&
      !game.walls.navQueue?.size && eligible(game,u) && (stuck || seesObstacle(game,u))) {
    try {
      const target=combatRouteAllowed(game,u) ? game.unitById(u.targetId) : null;
      const combatTarget=target ? {id:target.id,x:target.x,y:target.y} : null;
      state.active={ unit:u, started:game.time, planner:new EasyStarPlanner(game,u,{maxStartDrift:combatTarget?160:32}), combatTarget };
    } catch { u._smartRetryAt=game.time+3; }
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
  // A fighter may move while the incremental search runs. Join its route at
  // the closest safely reachable early waypoint, never by cutting through a
  // wall or terrain. Non-combat searches retain the old start behavior.
  let joinIndex=0;
  if (result.status==='found' && job.combatTarget) {
    let best=Infinity;joinIndex=-1;
    for(let i=0;i<Math.min(result.path.length,16);i++) {
      const p=result.path[i], d=Math.hypot(u.x-p.x,u.y-p.y);
      if(d<best && d<=192 && job.planner.edge({x:u.x,y:u.y},p)){best=d;joinIndex=i;}
    }
  }
  if (result.status==='found' && joinIndex>=0 && eligible(game,u) &&
      targetStillValid(u,job.combatTarget,game.unitById(u.targetId)) &&
      keepsTargetVisible(game,u,result.path.slice(joinIndex),job.combatTarget)) {
    u._smartRoute={path:result.path,index:joinIndex,gx:u.goal.x,gy:u.goal.y,world:game.world,walls:game.walls,version:game.world.navVersion,radius:u.radius,detour:null,combatTarget:job.combatTarget};
    const r=u._smartRoute;
    while (r.index < r.path.length && Math.hypot(u.x-r.path[r.index].x,u.y-r.path[r.index].y)<8) r.index++;
    if (r.index < r.path.length) r.detour = u.detour = {...r.path[r.index],until:game.time+1};
    else discardSmartRoute(u);
  } else u._smartRetryAt=game.time+3;
}
