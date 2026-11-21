import {clearFinalApproach} from './arrival.js';
import {unsafeRest} from './rest_positions.js';
import {solidUnitMoveFree} from './solid_units.js';

// An entering infantryman blocked in an opening briefly steps aside so an
// allied unit actually coming out can pass. Never alter the original goal.
export function blockedDoorYield(game,u) {
 const clear=()=>{u._blockedDoorYield=null;return null;};
 if(!game.cfg.flag('blocked_door_yield_v1',true)||!game.cfg.flag('movement_occupancy_v1',false)||!game.cfg.flag('pathing_v2',false)||
    !game.cfg.flag('wall_collision_v2',false)||!game.walls?.enabled()||!u.goal||u.isVehicle||u.playerControlled||
    !u.alive||u.downed||u.perception?.hasContact)return clear();
 if(!u._blockedDoorYield&&!u._occupancyWait)return null;
 const w=game.walls,b=w.buildingAtPoint?.(u.goal.x,u.goal.y);
 if(!b || w.buildingAtPoint?.(u.x,u.y))return clear();
 const s=u._blockedDoorYield;
 if(s){
  const other=game.units.get(s.other);
  if(s.gx!==u.goal.x||s.gy!==u.goal.y||s.bid!==b.id||game.time>=s.until||s.version!==game.world.navVersion||
    !w.state(b)?.outline.openings.some(o=>o.id===s.door&&o.type==='door'&&o.move)||
    !other?.alive||other.downed||other.isVehicle||other.playerControlled||other.faction!==u.faction||other.perception?.hasContact||!other.goal||
    w.buildingAtPoint(other.goal.x,other.goal.y)===b||
    (other.x-s.px)*s.nx+(other.y-s.py)*s.ny>35){
   u._doorYieldCooldown=game.time+3;return clear();
  }
  return s;
 }
 const wait=u._occupancyWait;
 if(!wait||wait.goalX!==u.goal.x||wait.goalY!==u.goal.y||game.time-wait.since<.8||game.time-wait.lastBlocked>.5||game.time<(u._doorYieldCooldown||0))return null;
 let budget=u._doorYieldBudget;
 if(budget&&(budget.gx!==u.goal.x||budget.gy!==u.goal.y||budget.version!==game.world.navVersion||
    Math.hypot(u.x-budget.x,u.y-budget.y)>65)) budget=u._doorYieldBudget=null;
 if(budget&&game.time-budget.since>=20)return null;
 const other=game.units.get(wait.blockerId);
 if(!other?.alive||other.downed||other.isVehicle||other.playerControlled||other.faction!==u.faction||other.perception?.hasContact||
    !other.goal||w.buildingAtPoint(other.x,other.y)!==b||w.buildingAtPoint(other.goal.x,other.goal.y)===b)return null;
 const doors=w.state(b)?.outline.openings||[];let door=null,best=Infinity;
 for(const o of doors)if(o.type==='door'&&o.move){const d=Math.hypot(u.x-b.x-o.cx,u.y-b.y-o.cy);if(d<best){best=d;door=o;}}
 if(!door||best>50)return null;
 const px=b.x+door.cx,py=b.y+door.cy,nx=door.nx,ny=door.ny;
 const along=(v)=>(v.x-px)*nx+(v.y-py)*ny,side=(v)=>-(v.x-px)*ny+(v.y-py)*nx;
 if(along(u)<-5||along(u)>35||along(other)>5||along(other)<-45||Math.abs(side(u))>35||Math.abs(side(other))>35)return null;
 let point=null,score=-Infinity;
 for(let k=0;k<16;k++){
  const a=k*Math.PI/8,x=u.x+Math.cos(a)*35,y=u.y+Math.sin(a)*35;
  if((x-u.x)*nx+(y-u.y)*ny<5||unsafeRest(game,x,y,u.radius)||!clearFinalApproach(game,u,x,y)||
     !solidUnitMoveFree(game,u,x,y,.1,game.occupancyGrid))continue;
  const distance=Math.hypot(x-other.x,y-other.y),quality=distance+0.4*((x-u.x)*nx+(y-u.y)*ny);
  if(quality>score){point={x,y};score=quality;}
 }
 if(!point){u._doorYieldCooldown=game.time+1;return null;}
 if(!budget)u._doorYieldBudget={gx:u.goal.x,gy:u.goal.y,version:game.world.navVersion,x:u.x,y:u.y,since:game.time};
 const result=u._blockedDoorYield={...point,gx:u.goal.x,gy:u.goal.y,other:other.id,bid:b.id,door:door.id,version:game.world.navVersion,px,py,nx,ny,until:game.time+5};
 if(game._doorYieldMetrics)game._doorYieldMetrics.chosen++;
 return result;
}
