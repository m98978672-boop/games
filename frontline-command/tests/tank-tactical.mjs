import assert from 'node:assert/strict';
import {loadConfig} from '../src/core/config.js';
import {Game} from '../src/sim/game.js';
import {thinkSoldier,updateSoldier} from '../src/sim/ai_soldier.js';
import {moveAlongFlow} from '../src/sim/units.js';
const cfg=await loadConfig();assert(cfg.flag('tank_tactical_v1',true));
for(const faction of [0,1]){
 const g=new Game({cfg,seed:7,aiVsAi:true});g.units.clear();g.unitGrid.clear();g.squads.clear();
 const hq=g.world.hqOf(faction),spot=g.logistics.vehicleProductionSpot(hq,'tank',hq.x,hq.y);
 const u=g.spawnUnit(faction,'tank',spot.x,spot.y);u.goal=null;u.thinkTimer=0;
 g.nearbyEnemies=()=>[];g.dt=.05;thinkSoldier(g,u);
 assert(u.goal,'idle tank acquires objective');const objective=g.world.pointById(u._tankPatrolPoint);
 assert(objective && objective.owner!==faction,'idle tank selects a non-owned point');
 assert(!g.walls.buildingAtPoint(u.goal.x,u.goal.y),'tank aims outside a walled target');
 // Issuing a separate building-centre goal must not point a vehicle at a foot-only door.
 u.goal={x:hq.x,y:hq.y};moveAlongFlow(g,u,.05);
 assert(u.goal && !g.walls.buildingAtPoint(u.goal.x,u.goal.y),'vehicle goal adjusted to exterior');
 // A remembered target behind a wall is not shot at or used as a reason to freeze.
 const b=g.world.buildings.find(b=>b.type==='hq'&&b.faction===faction&&g.walls.state(b));
 const s=g.walls.state(b).outline.segments.find(s=>s.blocksVision&&s.length>=80);
 const [[x1,y1],[x2,y2]]=s.points,dx=x2-x1,dy=y2-y1,len=Math.hypot(dx,dy),nx=-dy/len,ny=dx/len;
 const mx=b.x+(x1+x2)/2,my=b.y+(y1+y2)/2;
 u.x=mx+nx*60;u.y=my+ny*60;
 const e=g.spawnUnit(1-faction,'infantry',mx-nx*60,my-ny*60);
 u.targetId=e.id;u.perception.hasContact=false;u.perception.enemies=[];u.goal={x:u.x+ny*140,y:u.y-nx*140};u.thinkTimer=100;
 const ammo=u.mag;updateSoldier(g,u,.05);assert.equal(u.mag,ammo,'no shot at unseen remembered enemy');
 assert(u.goal,'a hidden memory does not discard existing goal');
}
console.log('tank tactics: two factions, objectives outside buildings and no freeze/fire on hidden memory');
