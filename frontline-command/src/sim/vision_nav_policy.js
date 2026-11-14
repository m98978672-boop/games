// Opt-in local navigation arbitration for infantry. It uses real line of sight
// within a bounded radius, not knowledge of units hidden behind walls. It does
// not enable any of the separately controlled experimental algorithms.
import { obstacleAhead } from './smart_route.js';
const LOOK_RADIUS=220;
export function chooseVisionNavigation(game,u) {
  if(!u || !u.alive || u.downed || u.isVehicle || u.playerControlled || !u.goal || !game.world?.hasLOS || !game.walls?.enabled())return null;
  const fast=game.cfg.flag('vision_nav_fast_v1',false), metrics=game._visionPolicyMetrics;
  // Combat already has priority; none of the peaceful navigation consumers
  // read visibleIds or obstacle in this branch. Do not claim an unsampled
  // obstacle is clear: return null for the unneeded observation.
  if(fast && u.perception?.hasContact) {
    if(metrics){metrics.combat=(metrics.combat||0)+1;metrics.skippedCombat=(metrics.skippedCombat||0)+1;}
    return {mode:'combat',visibleIds:new Set(),obstacle:null};
  }
  const range=Math.min(LOOK_RADIUS,u.vision),visible=[];let enemy=false;
  for(const other of game.unitGrid.query(u.x,u.y,range)) {
    if(other===u || !other.alive || other.downed || Math.hypot(other.x-u.x,other.y-u.y)>range)continue;
    if(!game.world.hasLOS(u.x,u.y,other.x,other.y,true))continue;
    if(other.faction!==u.faction){enemy=true;if(fast)break;}
    else if(!other.isVehicle&&!other.playerControlled)visible.push(other.id);
  }
  visible.sort((a,b)=>a-b);
  const count=1+visible.length;
  const mode=u.perception?.hasContact || enemy?'combat':count>=3?'group':count===2?'pair':'solo';
  // Contact memory is a conservative guard; visible enemies are rechecked at
  // movement time and do not change the combat AI's target selection.
  const stableCrowd=mode==='group' && u._crowdActive && u._crowdGroupGoal &&
    Math.hypot(u.goal.x-u._crowdGroupGoal.x,u.goal.y-u._crowdGroupGoal.y)<1 &&
    game.cfg.flag('crowd_nav_v2',false) && game.cfg.flag('pathing_v2',false) && game.cfg.flag('wall_collision_v2',false);
  const skipObstacle=fast && (mode==='combat'||stableCrowd);
  const obstacle=skipObstacle?null:obstacleAhead(game,u);
  if(metrics){metrics[mode]=(metrics[mode]||0)+1;if(obstacle)metrics.obstacle=(metrics.obstacle||0)+1;
    if(skipObstacle)metrics.skippedObstacle=(metrics.skippedObstacle||0)+1;}
  return {mode,visibleIds:new Set(visible),obstacle};
}
