import assert from 'node:assert/strict';import {loadConfig} from '../src/core/config.js';import {Game} from '../src/sim/game.js';
const cfg=await loadConfig();assert.equal(cfg.flag('logistics_dropoff_v1',false),false);cfg.flags.safe_logistics_v2=true;cfg.flags.logistics_dropoff_v1=true;
for(const faction of [0,1]){
 const g=new Game({cfg,seed:1,aiVsAi:true});g.units.clear();g.unitGrid.clear();g.squads.clear();g.nearbyEnemies=()=>[];
 const hq=g.world.hqOf(faction),u=g.spawnUnit(faction,'truck',hq.x+350,hq.y),req={faction,kind:'sector',sectorId:g.world.sectorAt(hq.x,hq.y).id,x:hq.x,y:hq.y,created:0,priority:1};
 g.logistics.requests=[req];u.cargo=150;u.cargoType='ammo';u.truckTask={state:'toTarget',source:hq,request:req,amount:150};u.pathFailed=true;u.goal=null;
 g.logistics.moveTrucks(0);const p=u.truckTask.dropoff;assert.ok(p);assert.equal(g.walls.buildingAtPoint(p.x,p.y),null);assert.equal(g.walls.blocksMove(p.x,p.y,u.radius,u),false);
 assert.equal(g.logistics.delivered[faction],0);assert.equal(u.cargo,150);
 const walls=g.walls.blocksMove.bind(g.walls);u.truckTask.dropoff=null;g.walls.blocksMove=()=>true;
 g.logistics.moveTrucks(0);assert.equal(u.cargo,150);assert.equal(g.logistics.delivered[faction],0);assert.equal(u.goal,null,'no fabricated destination when no exterior point');g.walls.blocksMove=walls;
 g.logistics.moveTrucks(0);assert.ok(u.truckTask.dropoff);
 g.nearbyEnemies=()=>[{}];g.logistics.moveTrucks(0);assert.equal(u.cargo,150);assert.equal(u.truckTask.request,req);assert.ok(Number.isFinite(u.goal.x));
 g.nearbyEnemies=()=>[];u.x=p.x;u.y=p.y;g.logistics.moveTrucks(0);assert.equal(g.logistics.delivered[faction],1);assert.equal(u.cargo,0);assert.ok(!g.logistics.requests.includes(req));
}
console.log('logistics dropoff: default off, external point, no failed-route delivery, retains cargo under threat');
