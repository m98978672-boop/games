import assert from 'node:assert/strict';
import { loadConfig } from '../src/core/config.js';
import { Game } from '../src/sim/game.js';
import { updatePerception } from '../src/sim/units.js';
import { thinkSoldier } from '../src/sim/ai_soldier.js';

const cfg=await loadConfig();
assert.equal(cfg.flag('bot_surround_vision_v1'),true,'surround vision must be active in normal play');
const g=new Game({cfg,seed:1,aiVsAi:true});g.units.clear();g.unitGrid.clear();
const u=g.spawnUnit(0,'infantry',2000,2000),enemy=g.spawnUnit(1,'infantry',2200,2000);
u.facing=0;g.world.hasLOS=()=>true;
for(const enabled of [false,true]){
  cfg.flags.bot_surround_vision_v1=enabled;
  for(let i=0;i<8;i++){
    const angle=i*Math.PI/4;enemy.x=u.x+200*Math.cos(angle);enemy.y=u.y+200*Math.sin(angle);g.unitGrid.update(enemy);
    u.perception.memory=0;updatePerception(g,u,.05);
    const expected=enabled||i===0||i===1||i===7;
    assert.equal(u.perception.hasContact,expected,`angle ${i}, flag ${enabled}`);
    if(expected)assert.equal(u.targetId,enemy.id);
  }
}
// Radius and health/faction filtering are not expanded by the new feature.
cfg.flags.bot_surround_vision_v1=true;enemy.x=u.x+u.vision+1;enemy.y=u.y;g.unitGrid.update(enemy);
u.perception.memory=0;updatePerception(g,u,.05);assert.equal(u.perception.hasContact,false);
enemy.x=u.x+50;g.unitGrid.update(enemy);enemy.downed=true;updatePerception(g,u,.05);assert.equal(u.perception.hasContact,false);
enemy.downed=false;enemy.alive=false;updatePerception(g,u,.05);assert.equal(u.perception.hasContact,false);
enemy.alive=true;enemy.faction=0;updatePerception(g,u,.05);assert.equal(u.perception.hasContact,false);enemy.faction=1;
// Memory retains only last seen coordinates when direct LOS is lost.
g.world.hasLOS=()=>true;updatePerception(g,u,.05);const last={...u.perception.lastKnown};
enemy.x+=10;g.unitGrid.update(enemy);g.world.hasLOS=()=>false;updatePerception(g,u,.05);
assert.equal(u.perception.hasContact,false);assert.deepEqual(u.perception.lastKnown,last);
assert.ok(u.perception.memory>0);assert.equal(u.targetId,enemy.id,'existing remembered target ID is preserved');
u.perception.memory=0;updatePerception(g,u,.05);assert.equal(u.targetId,null);
// Real HQ wall, close enough for legacy close-awareness to ignore obstruction.
for(const f of [0,1]){
  const c=await loadConfig(),game=new Game({cfg:c,seed:7,aiVsAi:true});game.units.clear();game.unitGrid.clear();
  const b=game.world.buildings.find(b=>b.type==='hq'&&game.walls.state(b));
  const seg=game.walls.state(b).outline.segments.find(s=>s.length>=80&&s.blocksVision);
  assert.ok(seg,'opaque HQ wall exists');const [[ax,ay],[bx,by]]=seg.points,len=Math.hypot(bx-ax,by-ay),nx=-(by-ay)/len,ny=(bx-ax)/len;
  const mx=b.x+(ax+bx)/2,my=b.y+(ay+by)/2;
  const a=game.spawnUnit(f,'infantry',mx+nx*30,my+ny*30),e=game.spawnUnit(1-f,'infantry',mx-nx*30,my-ny*30);
  assert.equal(game.world.hasLOS(a.x,a.y,e.x,e.y,true),false,'actual wall occludes sight');
  c.flags.bot_surround_vision_v1=false;updatePerception(game,a,.05);assert.equal(a.perception.hasContact,true,'legacy close-awareness sees across wall');
  c.flags.bot_surround_vision_v1=true;a.perception.memory=0;updatePerception(game,a,.05);
  assert.equal(a.perception.hasContact,false,'no visual contact through wall');assert.equal(a.targetId,null);
}
// A live AI decision responds to a visible rear enemy in the isolated scene.
for(const faction of [0,1]){
  const c=await loadConfig();c.flags.bot_surround_vision_v1=true;c.flags.assault_forts=false;
  const game=new Game({cfg:c,seed:1,aiVsAi:true});game.units.clear();game.unitGrid.clear();game.world.hasLOS=()=>true;game.walls.enabled=()=>false;game.dt=.05;
  const actor=game.spawnUnit(faction,'infantry',2000,2000),target=game.spawnUnit(1-faction,'infantry',1800,2000);
  actor.facing=0;actor.aimAngle=0;const before=actor.mag;thinkSoldier(game,actor);
  assert.equal(actor.perception.hasContact,true);assert.equal(actor.targetId,target.id);assert.equal(actor.activity,'fight');
  assert.ok(actor.mag<before,'AI chooses to fire in an unobstructed rear-contact scene');
}
console.log('Surround vision: 8 directions, factions, range, actual wall LOS, memory and AI response');
