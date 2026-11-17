import assert from 'node:assert/strict';
import {loadConfig} from '../src/core/config.js';
import {Game} from '../src/sim/game.js';
import {T_WATER, T_GRASS, T_CITY} from '../src/sim/world.js';
import {moveUnit, moveAlongFlow, updateTimers, killUnit} from '../src/sim/units.js';
import {thinkSoldier, updateSoldier, tacticalRetreatPoint} from '../src/sim/ai_soldier.js';
import {angleDiff} from '../src/core/mathx.js';

const cfg=await loadConfig();
function clean(g){g.units.clear();g.unitGrid.clear();g.occupancyGrid.clear();g.squads.clear();}
// Full Game.step and normal flow-field routing on real map bridges.
for(const id of ['bridge_north','bridge_south']) for(const role of ['infantry','tank','truck']) for(const side of [-1,1]) {
 const g=new Game({cfg,seed:7,aiVsAi:true});clean(g);
 for(const obj of [g.squadAI,...g.strategic,g.autopilot,g.rules,g.build,g.influence,g.api])obj.update=()=>{};
 g.checkVictory=()=>{};
 const b=g.world.buildings.find(b=>b.pointId===id), d=b.deck, y=(d.y0+d.y1)/2;
 const start=side>0?d.x0+25:d.x1-25, end=side>0?d.x1-25:d.x0+25;
 const u=g.spawnUnit(0,role,start,y);u.goal={x:end,y};u.arrived=false;u.thinkTimer=10000;u.activity='advance';
 if(role==='truck')g.logistics.update=dt=>{updateTimers(g,u,dt);if(u.goal)moveAlongFlow(g,u,dt);};
 else g.logistics.update=()=>{};
 for(let i=0;i<800&&!u.arrived&&!u.pathFailed;i++)g.step(.05);
 assert(u.arrived&&!u.pathFailed&&Math.abs(u.x-end)<36,`Game.step ${id} ${role} side=${side}: ${u.x},${u.y}`);
}
// The visible deck covers every water cell in each row and includes land on
// both banks; the same cells are used for movement and after destruction.
for(const id of ['bridge_north','bridge_south']){
 const g=new Game({cfg,seed:7,aiVsAi:true}), w=g.world,b=w.buildings.find(b=>b.pointId===id),deck=b.deck;
 for(let row=deck.y0/w.T;row<deck.y1/w.T;row++){
  const first=deck.x0/w.T,last=deck.x1/w.T-1;
  assert.notEqual(w.terrain[first+row*w.cols],T_WATER,`${id} west landing`);
  assert.notEqual(w.terrain[last+row*w.cols],T_WATER,`${id} east landing`);
  for(let col=first;col<=last;col++)assert.equal(w.baseWalk[col+row*w.cols],1,`${id} accessible deck`);
  assert.ok(Array.from({length:last-first+1},(_,i)=>w.terrain[first+i+row*w.cols]).includes(T_WATER),`${id} spans water`);
 }
 for(const role of ['infantry','tank','truck'])for(const dir of [-1,1]){
  clean(g);const y=(deck.y0+deck.y1)/2,start=dir===1?deck.x0+30:deck.x1-30,end=dir===1?deck.x1-30:deck.x0+30;
  const u=g.spawnUnit(0,role,start,y);u.facing=dir===1?0:Math.PI;
  for(let i=0;i<300 && (end-u.x)*dir>2;i++)moveUnit(g,u,dir,0,.05,null,{skipDoorWaypoint:true});
  assert.ok((end-u.x)*dir<=4,`${id} ${role} crosses direction ${dir}: ${u.x}, ${end}`);
 }
 w.damageBuilding(b,b.hp+1);assert(b.dead);
 const waterX=(deck.x0+deck.x1)/2,waterY=(deck.y0+deck.y1)/2;
 assert.equal(w.terrainAt(waterX,waterY),T_WATER);assert.equal(w.isBaseWalkable(waterX,waterY),false,'destroyed bridge returns river to water');
}
{
 const g=new Game({cfg,seed:2,aiVsAi:true});clean(g);const w=g.world;
 assert.equal([...w.baseWalk].filter((v,i)=>v!==w.baseWalk[w.baseWalk.length-1-i]).length,0,'mirrored navigation');
 const u=g.spawnUnit(0,'tank',1000,1000);u.facing=0;u.turretAngle=0;
 moveUnit(g,u,0,1,.05,null,{skipDoorWaypoint:true});assert.ok(u.facing>0&&u.facing<=.100001,'tank facing changes at bounded rate');
 updateTimers(g,u,.05);assert.ok(angleDiff(u.turretAngle,u.facing)<.001,'unoccupied turret follows chassis');
}
// Dead bodies disappear after their lifetime; only organic, dry-land blood
// leaves a bounded, time-limited visual stain. Effects never alter terrain.
{
 const g=new Game({cfg,seed:2,aiVsAi:true});clean(g);let {x,y}=g.world.hqOf(0);x+=300;
 const u=g.spawnUnit(0,'infantry',x,y),idx=g.world._idx(x,y),before=g.world.terrain[idx];g.rng.chance=()=>false;
 g.world.terrain[idx]=T_GRASS;g.addBloodAt(x,y);assert.equal(g.decals.length,1);assert.equal(g.decals[0].life,45);
 g.world.terrain[idx]=T_CITY;g.addBloodAt(x,y);assert.equal(g.decals[1].life,90);
 g.world.terrain[idx]=T_WATER;g.addBloodAt(x,y);g.addBloodAt(x,y,false);assert.equal(g.decals.length,2);
 g.world.terrain[idx]=before;killUnit(g,u);assert.equal(g.decals.length,3);assert(g.decals.every(d=>d.type==='blood'),'death leaves only a temporary blood mark');
 g.cleanup(13);assert(!g.units.has(u.id),'dead body cleaned up');
 g.time=91;g.cleanup(0);assert.equal(g.decals.length,0,'ground absorbs marks');
 g.fxAt('wreck',x,y);assert.equal(g.fx.at(-1).life,12,'wreck fire is short-lived');
 g.cleanup(13);assert(!g.fx.some(f=>f.type==='wreck'),'fire expires');
 for(let i=0;i<200;i++)g.addBloodAt(x,y);assert.ok(g.decals.length<=160,'bounded visual marks');
}
// Withdrawal is local, cannot cross walls, obstacles or water, respects hold,
// and is not triggered by unseen threats or healthy, unsuppressed soldiers.
for(const faction of [0,1]){
 const g=new Game({cfg,seed:2,aiVsAi:true});clean(g);const x=1000,y=2000;
 const u=g.spawnUnit(faction,'infantry',x,y),e=g.spawnUnit(1-faction,'infantry',x+90,y);u.hp=u.maxHp*.3;u.facing=0;g.dt=.05;
 thinkSoldier(g,u);assert.equal(u.state,'withdraw');assert(u.goal.x<x,'withdraw away from enemy');
 const before=Math.hypot(u.x-e.x,u.y-e.y);for(let i=0;i<20;i++){g.time+=.05;updateSoldier(g,u,.05);}
 assert.ok(Math.hypot(u.x-e.x,u.y-e.y)>before+10,'moves away, without teleport');
 clean(g);const healthy=g.spawnUnit(faction,'infantry',x,y),foe=g.spawnUnit(1-faction,'infantry',x+90,y);healthy.facing=0;
 thinkSoldier(g,healthy);assert.notEqual(healthy.state,'withdraw','healthy soldier stands and fights');
 healthy.hp=healthy.maxHp*.3;
 const oldLOS=g.world.hasLOS.bind(g.world), oldSweep=g.walls.blocksMoveSweep.bind(g.walls),oldWalk=g.world.isBaseWalkable.bind(g.world);
 g.world.hasLOS=()=>false;assert.equal(tacticalRetreatPoint(g,healthy,foe),null,'no withdrawal from threat behind wall');g.world.hasLOS=oldLOS;
 g.walls.blocksMoveSweep=()=>true;assert.equal(tacticalRetreatPoint(g,healthy,foe),null,'no path through walls');g.walls.blocksMoveSweep=oldSweep;
 g.world.isBaseWalkable=()=>false;assert.equal(tacticalRetreatPoint(g,healthy,foe),null,'no path through water');g.world.isBaseWalkable=oldWalk;
 const created=g.createSquadFromUnits([healthy.id]);assert(created.ok);created.squad.state='hold';created.squad.behavior='hold';
 thinkSoldier(g,healthy);assert.notEqual(healthy.state,'withdraw','explicit hold order is respected');
 created.squad.state='advance';created.squad.behavior='attack';cfg.flags.tactical_withdraw_v1=false;
 thinkSoldier(g,healthy);assert.notEqual(healthy.state,'withdraw','legacy opt-out');cfg.flags.tactical_withdraw_v1=true;

}
console.log('battlefield: bridge geometry/crossing/destruction; smooth turns; temporary blood/bodies; local withdrawal');
