import assert from 'node:assert/strict';
import {loadConfig} from '../src/core/config.js';
import {Game} from '../src/sim/game.js';
import {updateSoldier} from '../src/sim/ai_soldier.js';
const cfg=await loadConfig();
assert.equal(cfg.flag('engineer_combat_priority_v2'),false,'experimental behavior is off by default');
cfg.flags.engineer_combat_priority_v2=true;
for(const faction of [0,1]) {
  const game=new Game({cfg,seed:7,aiVsAi:true});
  game.units.clear();game.unitGrid.clear();
  const hq=game.world.hqOf(faction);
  let placed=null;
  for(let r=150;r<900&&!placed;r+=40) for(let a=0;a<Math.PI*2&&!placed;a+=0.4) {
    const x=hq.x+Math.cos(a)*r,y=hq.y+Math.sin(a)*r;
    if(game.build.validate('sandbags',x,y,faction,{ignoreCost:true}).ok) {
      const result=game.build.place('sandbags',x,y,faction,{free:true});
      if(result.ok) placed=result.building;
    }
  }
  assert.ok(placed,'valid blueprint');
  const u=game.spawnUnit(faction,'engineer',placed.x+20,placed.y);
  u.thinkTimer=100;u.goal=null;u.perception.hasContact=true;u.buildBusy=true;
  game.logistics.supply(faction).materials=400;
  const before=placed.progress||0, materials=game.logistics.supply(faction).materials;
  updateSoldier(game,u,0.1);
  assert.equal(placed.progress||0,before,'no construction during visible enemy contact');
  assert.equal(game.logistics.supply(faction).materials,materials);
  assert.equal(u.buildBusy,false);
  u.perception.hasContact=false;
  updateSoldier(game,u,0.1);
  assert.ok(placed.progress>before,'construction resumes after contact');
  assert.ok(game.logistics.supply(faction).materials<materials);
  assert.equal(u.buildBusy,true);
  cfg.flags.engineer_combat_priority_v2=false;
  u.perception.hasContact=true;
  const legacyProgress=placed.progress;
  updateSoldier(game,u,0.1);
  assert.ok(placed.progress>legacyProgress,'off retains existing behavior');
  cfg.flags.engineer_combat_priority_v2=true;
}
console.log('engineers: visible combat interrupts construction; work resumes without contact for both factions');
