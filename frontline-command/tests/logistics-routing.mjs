import assert from 'node:assert/strict';
import { loadConfig } from '../src/core/config.js';
import { Game } from '../src/sim/game.js';
const cfg=await loadConfig();
assert.equal(cfg.flag('safe_logistics_v2'),false,'unproven routing is off by default');
cfg.flags.safe_logistics_v2=true;
for (const faction of [0,1]) {
  const game=new Game({cfg,seed:7,aiVsAi:true});
  game.units.clear();game.unitGrid.clear();game.nearbyEnemies=()=>[];
  const hq=game.world.hqOf(faction), a=game.spawnUnit(faction,'truck',hq.x,hq.y), b=game.spawnUnit(faction,'truck',hq.x+55,hq.y);
  const logistics=game.logistics, stock=logistics.supply(faction);
  stock.ammo=1000;stock.fuel=200;
  const sector=game.world.sectorAt(hq.x,hq.y);
  const req={faction,kind:'sector',sectorId:sector.id,x:hq.x+(faction===0?700:-700),y:hq.y,created:0,priority:1};
  logistics.requests=[req];game.time=1;
  logistics.moveTrucks(0);
  const active=[a,b].filter(u=>u.truckTask?.request===req);
  assert.equal(active.length,1,'one request must not be assigned to two trucks');
  const truck=active[0], other=active[0]===a?b:a;
  assert.equal(truck.truckTask.state,'toSource');
  const pickup=truck.truckTask.pickup;
  assert.ok(pickup && Number.isFinite(pickup.x) && Number.isFinite(pickup.y));
  assert.ok(Math.hypot(pickup.x-hq.x,pickup.y-hq.y)>120,'HQ pickup lies outside its walls');
  assert.equal(game.walls.blocksMove(pickup.x,pickup.y,truck.radius,truck),false);
  // Position set by test: exercise loading transition, not claim pathing works.
  truck.x=pickup.x;truck.y=pickup.y;
  logistics.moveTrucks(0);
  assert.equal(truck.truckTask.state,'toTarget','truck at pickup loads');
  assert.ok(truck.cargo>0);
  const cargo=truck.cargo, delivered=logistics.delivered[faction], ammo=stock.ammo;
  // Время истекло, но занятая заявка не должна доставляться резервом.
  game.time=121;truck.pathFailed=true;truck.goal=null;
  logistics.moveTrucks(0);
  assert.equal(logistics.delivered[faction],delivered,'failed path is not delivery');
  assert.equal(truck.cargo,cargo,'cargo remains on truck');
  assert.equal(stock.ammo,ammo,'no duplicate load');
  assert.equal(logistics.requests.filter(r=>r===req).length,1);
  assert.notEqual(other.truckTask?.request,req);
  assert.equal(truck.truckTask.state,'toTarget');
  // Угроза сохраняет груз и резервирование, движение к своей базе, затем продолжение.
  game.nearbyEnemies=()=>[{}];
  logistics.moveTrucks(0);
  assert.equal(truck.cargo,cargo);
  assert.equal(truck.truckTask.request,req);
  assert.ok(truck.goal && Number.isFinite(truck.goal.x) && Number.isFinite(truck.goal.y));
  assert.equal(logistics.requests.filter(r=>r===req).length,1);
  game.nearbyEnemies=()=>[];
  // Флаг отступления не сохраняется в старом формате: после загрузки цель
  // всё равно должна восстановиться по сохранённой задаче.
  truck._supplyRetreating=false;
  logistics.moveTrucks(0);
  assert.deepEqual(truck.goal,{x:req.x,y:req.y});
  // Проверка только перехода состояния у цели: позиция задана тестом, а не навигацией.
  truck.x=req.x;truck.y=req.y;
  logistics.moveTrucks(0);
  assert.equal(truck.cargo,0);assert.equal(truck.cargoType,null);
  assert.equal(logistics.delivered[faction],delivered+1);
  assert.equal(truck.truckTask.state,'idleTruck');
  assert.ok(!logistics.requests.includes(req));
  // Доставившая машина снова пригодна для рейса.
  const req2={...req,created:game.time,x:req.x+(faction===0?200:-200)};
  logistics.requests.push(req2);
  logistics.moveTrucks(0);
  assert.equal(truck.truckTask.request,req2,'idleTruck should accept a new request');
}
console.log('logistics: exclusive requests, failed path, threat, delivery and reuse verified for both factions');
// Незавершённый груз из повреждённого сохранения не назначается на новый рейс.
{
  const game=new Game({cfg,seed:5,aiVsAi:true});
  game.units.clear();game.unitGrid.clear();game.nearbyEnemies=()=>[];
  const hq=game.world.hqOf(0),u=game.spawnUnit(0,'truck',hq.x,hq.y);
  u.truckTask={state:'idleTruck'};u.cargo=100;u.cargoType='ammo';
  const s=game.world.sectorAt(hq.x,hq.y);
  const req={faction:0,kind:'sector',sectorId:s.id,x:hq.x+300,y:hq.y,created:game.time,priority:1};
  game.logistics.requests=[req];game.logistics.moveTrucks(0);
  assert.equal(u.cargo,100);assert.equal(u.cargoType,'ammo');
  assert.equal(u.truckTask.state,'idleTruck');assert.ok(game.logistics.requests.includes(req));
}
console.log('logistics: orphaned saved cargo is not overwritten');
// Реальное движение на геометрии игры: без принудительного перемещения между
// погрузкой и разгрузкой. Два одиночных рейса — не доказательство нагрузки.
for (const faction of [0,1]) {
  const game=new Game({cfg,seed:5,aiVsAi:true});
  game.units.clear();game.unitGrid.clear();game.nearbyEnemies=()=>[];
  const hq=game.world.hqOf(faction), u=game.spawnUnit(faction,'truck',hq.x,hq.y+240);
  const req={faction,kind:'sector',sectorId:game.world.sectorAt(hq.x,hq.y).id,x:hq.x,y:hq.y+380,created:0,priority:1};
  game.logistics.requests=[req];let loaded=false;
  for(let i=0;i<400&&!game.logistics.delivered[faction];i++) {
    const x=u.x,y=u.y,terrain=game.world.speedAt(x,y);
    game.time+=0.05;game.nav.advance();game.walls.update(0.05);
    game.logistics.moveTrucks(0.05);game.unitGrid.update(u);
    if(u.cargo>0) loaded=true;
    assert.ok(Math.hypot(u.x-x,u.y-y)<=Math.max(u.speed*terrain,30)*0.05*1.5+1e-8,'no speed violation');
    assert.equal(game.walls.blocksMove(u.x,u.y,u.radius,u),false,'no wall intersection');
  }
  assert.ok(loaded,'truck really loaded');
  assert.equal(game.logistics.delivered[faction],1,'truck actually arrived and delivered');
  assert.ok(Math.hypot(u.x-req.x,u.y-req.y)<110);
}
console.log('logistics: two isolated real-geometry trips complete without teleport or wall collisions');
// Явный откат и зависимости; ни один из выключенных флагов не должен
// частично включить экспериментальный путь.
for (const dep of ['safe_logistics_v2','pathing_v2','wall_collision_v2']) {
  const c=await loadConfig();c.flags.safe_logistics_v2=true;c.flags[dep]=false;
  const g=new Game({cfg:c,seed:7,aiVsAi:true});
  assert.equal(g.logistics.safeTransportEnabled(),false,`${dep} disables experiment`);
}
console.log('logistics: rollback and dependencies checked');
