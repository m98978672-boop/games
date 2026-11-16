import assert from 'node:assert/strict';
import { loadConfig } from '../src/core/config.js';
import { Game } from '../src/sim/game.js';
import { updateSoldier } from '../src/sim/ai_soldier.js';
import { vehicleHasCurrentSight } from '../src/sim/units.js';

const base=await loadConfig();assert.equal(base.flag('vehicle_visible_fire_v1'),false,'feature defaults off');
async function scene(faction,flag,wall,contact){
  const cfg=await loadConfig();cfg.flags.tank_tactical_v1=false;cfg.flags.vehicle_visible_fire_v1=flag;
  const g=new Game({cfg,seed:1,aiVsAi:true});g.units.clear();g.unitGrid.clear();g.dt=.05;
  let x=2000,y=2000,tx=2100,ty=2000;
  if(wall){
    const b=g.world.buildings.find(b=>b.type==='hq'&&g.walls.state(b));
    const s=g.walls.state(b).outline.segments.find(s=>s.length>=80&&s.blocksVision),[[a,b0],[c,d]]=s.points;
    const len=Math.hypot(c-a,d-b0),nx=-(d-b0)/len,ny=(c-a)/len,mx=b.x+(a+c)/2,my=b.y+(b0+d)/2;
    x=mx+nx*35;y=my+ny*35;tx=mx-nx*35;ty=my-ny*35;
    assert.equal(g.world.hasLOS(x,y,tx,ty,true),false,'HQ wall blocks vision');
  }else{g.world.hasLOS=()=>true;g.walls.enabled=()=>false;}
  const u=g.spawnUnit(faction,'tank',x,y),e=g.spawnUnit(1-faction,'infantry',tx,ty);
  u.targetId=e.id;u.perception.memory=4;u.perception.hasContact=contact;u.perception.enemies=contact?[e]:[];
  u.thinkTimer=100;u.facing=Math.atan2(ty-y,tx-x);u.aimAngle=u.turretAngle=u.facing;
  return {g,u,e};
}
for(const f of [0,1]){
  for(const contact of [false,true]){
    let {g,u,e}=await scene(f,false,true,contact);const n=u.mag;updateSoldier(g,u,.05);
    assert.equal(n-u.mag,1,'legacy shoots remembered enemy through wall');
    ({g,u,e}=await scene(f,true,true,contact));const before=u.mag;updateSoldier(g,u,.05);
    assert.equal(before-u.mag,0,'on: no shot across real wall, including stale positive contact');
    assert.equal(u.targetId,e.id,'memory is not erased');
  }
  // The perception update itself must not bypass the guard via close-awareness.
  for(const flag of [false,true]){
    const s=await scene(f,flag,true,false);s.g.cfg.flags.assault_forts=false;s.u.thinkTimer=0;
    const ammo=s.u.mag;updateSoldier(s.g,s.u,.05);
    assert.equal(ammo-s.u.mag,flag?0:1,'think-tick fire obeys the same visible-target gate');
  }
  const {g,u,e}=await scene(f,true,false,true);assert.equal(vehicleHasCurrentSight(g,u,e),true);
  const ammo=u.mag;updateSoldier(g,u,.05);assert.equal(ammo-u.mag,1,'visible enemy can still be fired on');
  e.x=u.x+u.vision+1;assert.equal(vehicleHasCurrentSight(g,u,e),false,'out-of-range target cannot be tracked');
  e.x=u.x+50;e.downed=true;assert.equal(vehicleHasCurrentSight(g,u,e),false,'downed target not tracked');
  e.downed=false;e.faction=f;assert.equal(vehicleHasCurrentSight(g,u,e),false,'ally not tracked');
}
// Turret must not track a remembered but currently unseen enemy.
{
  const {g,u}=await scene(0,true,true,false);u.turretAngle=0.7;const angle=u.turretAngle;
  updateSoldier(g,u,.05);assert.equal(u.turretAngle,angle);
}
console.log('Vehicle sight: no firing/tracking a hidden remembered target; visible targets and both factions checked');
