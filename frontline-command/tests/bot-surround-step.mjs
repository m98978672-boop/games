// Live tick regression: both factions, rear and moving targets, walls and hold fire.
import assert from 'node:assert/strict';
import {loadConfig} from '../src/core/config.js';
import {Game} from '../src/sim/game.js';
import {Squad} from '../src/sim/squads.js';

async function fixture(faction, surround=true) {
  const cfg=await loadConfig();cfg.flags.bot_surround_vision_v1=surround;cfg.flags.assault_forts=false;
  const g=new Game({cfg,seed:17,aiVsAi:true});g.units.clear();g.unitGrid.clear();g.squads.clear();
  for(const sys of [g.squadAI,...g.strategic,g.autopilot,g.rules,g.logistics,g.build,g.influence,g.api]) sys.update=()=>{};
  g.checkVictory=()=>{};
  return g;
}
for (const faction of [0,1]) {
  for (const surround of [false,true]) {
    const g=await fixture(faction,surround);g.world.hasLOS=()=>true;g.walls.enabled=()=>false;
    const u=g.spawnUnit(faction,'infantry',2000,2000),e=g.spawnUnit(1-faction,'infantry',1800,2000,{player:true});
    u.facing=u.aimAngle=0;u.thinkTimer=0;e.input.fire=false;
    g.step(.05);
    assert.equal(u.perception.hasContact,surround,`rear contact faction ${faction}`);
    assert.equal(u.shotsFired||0,surround?1:0);
    if(surround){
      // Target moves into a different grid cell; the next actual thought tracks it.
      e.x=1660;e.y=2050;u.thinkTimer=0;g.step(.05);
      assert.equal(u.targetId,e.id);assert.equal(u.perception.hasContact,true);
      assert.deepEqual(u.perception.lastKnown,{x:e.x,y:e.y,id:e.id});
      // A remembered target is not a license for infantry to fire after LOS is lost.
      g.world.hasLOS=()=>false;u.cool=0;u.thinkTimer=0;const shots=u.shotsFired||0;g.step(.05);
      assert.equal(u.perception.hasContact,false);assert.equal(u.shotsFired||0,shots);
    }
  }
  {
    const g=await fixture(faction);g.world.hasLOS=()=>true;g.walls.enabled=()=>false;
    const sq=new Squad(g,{faction});g.squads.set(sq.id,sq);sq.fire='hold';
    const u=g.spawnUnit(faction,'infantry',2000,2000),e=g.spawnUnit(1-faction,'infantry',1800,2000,{player:true});sq.addUnit(u);
    u.facing=0;u.thinkTimer=0;g.step(.05);
    assert.equal(u.perception.hasContact,true);assert.equal(u.targetId,e.id);assert.equal(u.shotsFired||0,0,'hold fire must not shoot');
  }
  {
    const g=await fixture(faction);const b=g.world.buildings.find(x=>x.type==='hq'&&g.walls.state(x));
    const seg=g.walls.state(b).outline.segments.find(s=>s.length>=80&&s.blocksVision);
    const [[ax,ay],[bx,by]]=seg.points,len=Math.hypot(bx-ax,by-ay),nx=-(by-ay)/len,ny=(bx-ax)/len;
    const x=b.x+(ax+bx)/2,y=b.y+(ay+by)/2;
    const u=g.spawnUnit(faction,'infantry',x+nx*30,y+ny*30),e=g.spawnUnit(1-faction,'infantry',x-nx*30,y-ny*30,{player:true});
    u.thinkTimer=0;assert.equal(g.world.hasLOS(u.x,u.y,e.x,e.y,true),false);g.step(.05);
    assert.equal(u.perception.hasContact,false);assert.equal(u.shotsFired||0,0,'opaque wall blocks contact and fire');
  }
}
console.log('Game.step surround vision: rear, moving target, lost LOS, hold fire and real wall, both factions');
