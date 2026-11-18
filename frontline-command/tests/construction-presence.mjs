import assert from 'node:assert/strict';import {loadConfig} from '../src/core/config.js';import {Game} from '../src/sim/game.js';import {playerInteract,updateSoldier} from '../src/sim/ai_soldier.js';
const cfg=await loadConfig();
for(const faction of [0,1]){
 const g=new Game({cfg,seed:7,aiVsAi:true});g.units.clear();g.unitGrid.clear();g.occupancyGrid.clear();
 const hq=g.world.hqOf(faction);let b;for(let r=150;r<900&&!b;r+=40)for(let i=0;i<20&&!b;i++){let a=2*Math.PI*i/20,x=hq.x+r*Math.cos(a),y=hq.y+r*Math.sin(a);if(g.build.validate('sandbags',x,y,faction,{ignoreCost:true}).ok){let p=g.build.place('sandbags',x,y,faction,{free:true});if(p.ok)b=p.building;}}
 assert.ok(b);const e=g.spawnUnit(faction,'engineer',b.x+20,b.y),other=g.spawnUnit(faction,'rifleman',b.x-20,b.y),enemy=g.spawnUnit(1-faction,'engineer',b.x,b.y+20),stock=g.logistics.supply(faction);stock.materials=100;
 const before=b.progress,materials=stock.materials;
 for(const unit of [undefined,other,enemy,{...e},])g.build.work(b,1,unit);
 e.x=b.x+100;g.build.work(b,1,e);e.x=b.x+20;e.downed=true;g.build.work(b,1,e);e.downed=false;e.alive=false;g.build.work(b,1,e);e.alive=true;
 assert.equal(b.progress,before);assert.equal(stock.materials,materials);
 other.interactCooldown=0;playerInteract(g,other);assert.equal(b.progress,before,'non-engineer cannot build interactively');
 g.build.work(b,1,e);assert.ok(b.progress>before);assert.ok(stock.materials<materials);
 // Exercise the real soldier action until the structure is complete.
 e.thinkTimer=100;e.perception.hasContact=false;e.goal=null;
 for(let i=0;i<1000&&!b.built;i++)updateSoldier(g,e,0.1);
 assert.ok(b.built,'a nearby bot engineer can finish construction');
 assert.ok(e.built>0);
}
console.log('construction requires a present living allied engineer for both factions');
