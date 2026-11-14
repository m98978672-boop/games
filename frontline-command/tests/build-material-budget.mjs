import assert from 'node:assert/strict';
import {loadConfig} from '../src/core/config.js';
import {Game} from '../src/sim/game.js';
import {playerInteract} from '../src/sim/ai_soldier.js';

const cfg=await loadConfig();
for(const faction of [0,1]){
  const game=new Game({cfg,seed:7,aiVsAi:true});
  game.units.clear();game.unitGrid.clear();
  const hq=game.world.hqOf(faction);let blueprint;
  for(let r=150;r<900&&!blueprint;r+=40)for(let i=0;i<20&&!blueprint;i++){
    const a=2*Math.PI*i/20,x=hq.x+r*Math.cos(a),y=hq.y+r*Math.sin(a);
    if(!game.build.validate('sandbags',x,y,faction,{ignoreCost:true}).ok)continue;
    const result=game.build.place('sandbags',x,y,faction,{free:true});
    if(result.ok)blueprint=result.building;
  }
  assert.ok(blueprint);
  const unit=game.spawnUnit(faction,'engineer',blueprint.x+20,blueprint.y), stock=game.logistics.supply(faction);
  stock.materials=0.65;unit.interactCooldown=0;
  const before=blueprint.progress||0;
  playerInteract(game,unit);
  assert.equal(stock.materials,0.65,'player must not spend more than available');
  assert.equal(blueprint.progress||0,before);
  assert.equal(blueprint.pauseReason,'NO_MATERIALS');
  stock.materials=1;unit.interactCooldown=0;
  playerInteract(game,unit);
  assert.ok(blueprint.progress>before,'work resumes once funded');
  assert.ok(stock.materials>=0 && Math.abs(stock.materials-(1-0.55*1.2))<1e-9);
  const progress=blueprint.progress, materials=stock.materials;
  for(const dt of [-1,0,NaN,Infinity])game.build.work(blueprint,dt,unit);
  assert.equal(blueprint.progress,progress);assert.equal(stock.materials,materials);
  stock.materials=0.21;const damaged={hp:20,maxHp:100,paused:false};
  game.build.repair(damaged,2,unit);
  assert.equal(stock.materials,0.21);assert.equal(damaged.hp,20);assert.equal(damaged.pauseReason,'NO_MATERIALS');
  stock.materials=1;
  game.build.repair(damaged,2,unit);
  assert.ok(stock.materials>=0&&Math.abs(stock.materials-0.7)<1e-9);
  assert.ok(damaged.hp>20);
  assert.equal(damaged.paused,false,'repair resumes after materials are replenished');
  assert.equal(damaged.pauseReason,null);
  const hp=damaged.hp,left=stock.materials;
  for(const dt of [-1,0,NaN,Infinity])game.build.repair(damaged,dt,unit);
  assert.equal(stock.materials,left);assert.equal(damaged.hp,hp);
}
console.log('construction and repair: actual step cost, no overdraft, pause/resume for both factions OK');
