// Эксперимент для небольших групп пехоты с общей целью внутри здания.
// Не является решением всех встречных потоков и выключен по умолчанию.
const MAX_GROUP = 10;
const SLOT_ORDER = [0, 1, -1, 2, -2, null, 3, -3, 4, -4];

export function clearCrowdState(u) {
  if (u._crowdDetour && u.detour === u._crowdDetour) u.detour = null;
  u._crowdActive = false;
  u._crowdPoint = null;
  u._crowdDetour = null;
  u._crowdGroupGoal = null;
  u._crowdAssigned = null;
  if ('_crowdPairManaged' in u) delete u._crowdPairManaged;
}

export function prepareCrowdNavigation(game, u, distance, maxMembers=MAX_GROUP, allowPair=false) {
  if (!game.cfg.flag('crowd_nav_v2', false) || !game.cfg.flag('pathing_v2', false) ||
      !game.cfg.flag('wall_collision_v2', false) || !u.goal || !u.alive || u.downed ||
      u.isVehicle || u.playerControlled || u.perception.hasContact) {
    if (u._crowdActive || u._crowdGroupGoal) clearCrowdState(u);
    return;
  }
  const sameGoal = o => o.goal && Math.hypot(o.goal.x-u.goal.x,o.goal.y-u.goal.y) < 1;
  if (u._crowdGroupGoal && Math.hypot(u._crowdGroupGoal.x-u.goal.x,u._crowdGroupGoal.y-u.goal.y) >= 1) clearCrowdState(u);
  if (!u._crowdGroupGoal) {
    // Сначала дешёвая проверка соседа: одиночные юниты не сканируют здания.
    const near = game.unitGrid.query(u.x,u.y,160).some(o => o !== u && o.alive && !o.downed &&
      !o.isVehicle && o.faction === u.faction && sameGoal(o) && Math.hypot(o.x-u.x,o.y-u.y) < 160);
    if (near && game.walls?.buildingAtPoint?.(u.goal.x,u.goal.y)) {
      const members=game.unitGrid.query(u.x,u.y,450).filter(o => o.alive && !o.downed && !o.isVehicle &&
        !o.playerControlled && !o.perception.hasContact && o.faction === u.faction && sameGoal(o) &&
        Math.hypot(o.x-u.x,o.y-u.y) < 450)
        .sort((a,b) => Math.hypot(a.x-u.goal.x,a.y-u.goal.y)-Math.hypot(b.x-u.goal.x,b.y-u.goal.y) || a.id-b.id);
      const first=members[0], length=first ? (Math.hypot(first.x-u.goal.x,first.y-u.goal.y)||1) : 1;
      const nx=first ? (first.x-u.goal.x)/length : 0, ny=first ? (first.y-u.goal.y)/length : 0;
      const aligned=members.every(o => Math.abs((o.x-u.goal.x)*ny-(o.y-u.goal.y)*nx) < 32);
      // Не переназначаем уже сформированную группу из-за опоздавшего бойца.
      const unassigned=members.every(o => !o._crowdGroupGoal || Math.hypot(o._crowdGroupGoal.x-u.goal.x,o._crowdGroupGoal.y-u.goal.y) >= 1);
      const minimum = allowPair && game.cfg.flag('group_nav_pair_v1', false) ? 2 : game.cfg.flag('group_nav_3to5_v1', false) ? 3 : 6;
      if (members.length >= minimum && members.length <= Math.min(MAX_GROUP,maxMembers) && aligned && unassigned) {
        for (let i=0;i<members.length;i++) {
          const k=SLOT_ORDER[i]; let point={...u.goal};
          if (k !== null) {
            const angle=k*2*Math.PI/9, cs=Math.cos(angle), sn=Math.sin(angle);
            point={x:u.goal.x-30*(nx*cs-ny*sn),y:u.goal.y-30*(nx*sn+ny*cs)};
          }
          members[i]._crowdGroupGoal={...u.goal};
          members[i]._crowdAssigned=point;
          if (game.cfg.flag('group_nav_pair_v1', false) && members.length===2) members[i]._crowdPairManaged=true;
        }
      }
    }
  }
  u._crowdActive=!!u._crowdGroupGoal && Math.hypot(u._crowdGroupGoal.x-u.goal.x,u._crowdGroupGoal.y-u.goal.y) < 1;
  u._crowdPoint=u._crowdActive && distance < 75 ? u._crowdAssigned : null;
  if (u._crowdPoint && game.cfg.flag('crowd_slot_avoid_v1', false)) adjustBlockedCrowdSlot(game,u);
}

// A stationary unit can occupy an assigned destination after the group has
// been formed (for example, a truck spawned at HQ). Find a clear, reachable
// alternative inside the *existing* arrival radius, preserving the other
// members' assigned slots. No teleport, and no arbitrary change when clear.
export function adjustBlockedCrowdSlot(game,u) {
  if (!game.cfg.flag('crowd_slot_avoid_v1', false) || !u._crowdActive || !u._crowdPoint || !u.goal || !game.walls?.enabled()) return false;
  const w=game.world, walls=game.walls, goal=u.goal, slot=u._crowdPoint;
  // Do not invalidate a completed arrival merely because a later spawn overlaps it.
  if (u.arrived && Math.hypot(u.x-slot.x,u.y-slot.y)<2) return false;
  const others=game.unitGrid.query(goal.x,goal.y,150).filter(v=>v!==u && v.alive && !v.downed);
  const tooClose=(x,y,v,point)=>Math.hypot(x-point.x,y-point.y)<u.radius+v.radius+1;
  const sameGroup=v=>v.faction===u.faction && v._crowdGroupGoal &&
    Math.hypot(v._crowdGroupGoal.x-goal.x,v._crowdGroupGoal.y-goal.y)<1;
  // Other members already have coordinated reserved slots; reshuffling them
  // can turn a safe column into a deadlock. Handle only external occupants.
  if (!others.some(v=>!sameGroup(v) && (v.arrived || !v.goal) && tooClose(slot.x,slot.y,v,v))) return false;
  const radius=(game.cfg.navBudget?.arriveRadius?.walls ?? 34)-1;
  let best=null,bestDistance=Infinity;
  for(let r=0;r<=30 && r<radius;r+=6)for(let k=0;k<(r===0?1:16);k++) {
    const angle=k*Math.PI/8,x=goal.x+r*Math.cos(angle),y=goal.y+r*Math.sin(angle),q={x,y};
    if(x-u.radius<0||y-u.radius<0||x+u.radius>w.W||y+u.radius>w.H||
       !w.isBaseWalkable(x,y)||!w.isBaseWalkable(x-u.radius,y-u.radius)||!w.isBaseWalkable(x+u.radius,y-u.radius)||
       !w.isBaseWalkable(x-u.radius,y+u.radius)||!w.isBaseWalkable(x+u.radius,y+u.radius)||walls.blocksMove(x,y,u.radius,u))continue;
    if(others.some(v=>tooClose(x,y,v,v)||(v._crowdGroupGoal&&v._crowdAssigned&&tooClose(x,y,v,v._crowdAssigned))))continue;
    const d=Math.hypot(x-u.x,y-u.y);if(d>=bestDistance)continue;
    const steps=Math.max(1,Math.ceil(d/8));let clear=true;
    for(let i=1;i<=steps;i++){
      const sx=u.x+(x-u.x)*i/steps,sy=u.y+(y-u.y)*i/steps;
      if(!w.isBaseWalkable(sx,sy)||!w.isBaseWalkable(sx-u.radius,sy-u.radius)||!w.isBaseWalkable(sx+u.radius,sy-u.radius)||
         !w.isBaseWalkable(sx-u.radius,sy+u.radius)||!w.isBaseWalkable(sx+u.radius,sy+u.radius)||
         walls.blocksMove(sx,sy,u.radius,u)){clear=false;break;}
    }
    if(clear){best=q;bestDistance=d;}
  }
  if(!best)return false;
  u._crowdAssigned=best;u._crowdPoint=best;return true;
}

export function setCrowdDetour(game, u) {
  if (!u._crowdPoint) return;
  u._crowdDetour=u.detour={...u._crowdPoint,until:game.time+1};
}

// Нельзя создавать новое пересечение радиусов; при уже существующем
// пересечении разрешено только удаление, иначе исправление само запирает юнит.
export function crowdPositionFree(game, u, x, y) {
  if (!u._crowdActive) return true;
  return !game.unitGrid.query(u.x,u.y,80).some(o => {
    if (o===u || !o.alive || o.downed) return false;
    const current=Math.hypot(u.x-o.x,u.y-o.y), next=Math.hypot(x-o.x,y-o.y), min=u.radius+o.radius+0.01;
    return current >= min ? next < min : next < current;
  });
}
