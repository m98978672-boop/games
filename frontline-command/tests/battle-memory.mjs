import assert from 'node:assert/strict';
import {loadConfig} from '../src/core/config.js';
import {Game} from '../src/sim/game.js';
import {killUnit} from '../src/sim/units.js';
import {Save} from '../src/core/save.js';
class Storage { constructor(){this.data=new Map();} getItem(k){return this.data.get(k)??null;} setItem(k,v){this.data.set(k,String(v));} removeItem(k){this.data.delete(k);} }
const storage=new Storage();globalThis.localStorage=storage;
const cfg=await loadConfig(), opts={cfg,seed:4,mode:'commander',aiVsAi:true,strategicMemoryStorage:storage};
const game=new Game(opts);game.time=50;
const point=game.world.points.find(p=>p.owner!==0&&game.world.sectorAt(p.x,p.y));
const sector=game.world.sectorAt(point.x,point.y), squad=[...game.squads.values()].find(s=>s.faction===0&&s.count()>=4);
for(const u of squad.units()){u.x=point.x;u.y=point.y;u.morale=100;game.unitGrid.update(u);}
const order=game.api.issue({source:'enemyAI',type:'directive',faction:0,squadIds:[squad.id],target:{x:point.x,y:point.y,pointId:point.id,sectorId:sector.id},params:{goalType:'capture'}});
game.api.deliver(order);assert.equal(order.status,'accepted');
const toKill=Math.ceil(squad.initialCount*.5);for(const u of squad.units().slice(0,toKill))killUnit(game,u);
game.squadAI.think(squad);
assert.equal(squad.state,'retreat');assert.ok(game.battleMemory.attackPenalty(0,sector.id)>0,'own retreat influences strategic target score');
assert.equal(game.battleMemory.attackPenalty(1,sector.id),0,'other faction does not inherit own event');
assert.equal(JSON.parse(storage.getItem('frontline.battle-memory.v1.side-0')).entries[0].retreats,1);
game.battleMemory.onRetreat(squad);assert.equal(game.battleMemory.history[0].get(sector.id).retreats,1,'same losses cannot be learned twice');
assert.equal(storage.getItem('frontline.battle-memory.v1.side-1'),null);
cfg.flags.alg_save=true;
assert.ok(Save.saveWar(game));const save=Save.loadWar();const loaded=new Game(opts);Save.applyWar(loaded,save);
assert.equal(loaded.battleMemory.attackPenalty(0,sector.id),game.battleMemory.attackPenalty(0,sector.id),'recent memory restored with saved battle');
assert.equal(loaded.battleMemory.recordedLosses[0].get(squad.id),squad.stats.losses,'deduplication continues across save/load');
const next=new Game(opts);assert.equal(next.battleMemory.recent[0].size,0,'recent events do not cross battles');
assert.equal(next.battleMemory.history[0].get(sector.id).retreats,1,'compressed faction history survives new game');
assert.equal(next.battleMemory.history[1].size,0);
game.influence.flipPoint(point,0);assert.equal(game.battleMemory.recent[0].size,0,'own capture clears recent warning');
assert.equal(game.battleMemory.history[0].get(sector.id).captures,1);
const bad=new Storage();bad.setItem('frontline.battle-memory.v1.side-0','{broken');
const corrupt=new Game({...opts,strategicMemoryStorage:bad});assert.equal(corrupt.battleMemory.history[0].size,0,'bad save ignored');assert.equal(corrupt.battleMemory.persistent,true,'corrupt data does not disable usable storage');
corrupt.battleMemory.record(0,sector.id,'captures');assert.equal(JSON.parse(bad.getItem('frontline.battle-memory.v1.side-0')).entries[0].captures,1);
const full={getItem(){return null;},setItem(){throw Error('full');}};
const quota=new Game({...opts,strategicMemoryStorage:full});quota.battleMemory.record(0,sector.id,'captures');assert.equal(quota.battleMemory.persistent,false);assert.equal(quota.battleMemory.history[0].get(sector.id).captures,1);assert.ok(quota.alertLog.some(x=>x.text.includes('Память ИИ не сохраняется')));
const denied={getItem(){throw Error('blocked');},setItem(){throw Error('blocked');}};
const fallback=new Game({...opts,strategicMemoryStorage:denied});assert.equal(fallback.battleMemory.persistent,false);fallback.battleMemory.record(0,sector.id,'retreats');assert.equal(fallback.battleMemory.history[0].get(sector.id).retreats,1);
const noMemory=new Game({...opts,strategicMemoryStorage:null,strategicMemoryEnabled:false});noMemory.battleMemory.record(0,sector.id,'retreats');assert.equal(noMemory.battleMemory.attackPenalty(0,sector.id),0);
const altered=new Game({...opts,strategicMemoryStorage:storage});altered.battleMemory.map='different';altered.battleMemory.history[0].clear();altered.battleMemory.load(0);assert.equal(altered.battleMemory.history[0].size,0,'different map cannot reuse sector IDs');
const restored=structuredClone(save.battleMemoryRecent);restored.sides[0].push({id:99999,count:1,at:0});restored.sides[1]=[{id:sector.id,count:9,at:0}];loaded.battleMemory.restoreRecent(restored);assert.equal(loaded.battleMemory.recent[1].size,0,'corrupt recent records ignored');
// Controlled planner scenario: force repeated own retreats on the highest-rated
// sector and verify a real directive changes its ordering, not just a counter.
const planned=new Game({cfg,seed:1,aiVsAi:true}),ai=planned.strategic[0];
ai.plan(cfg.ai.strategic);const first=planned.api.orders.filter(o=>o.type==='directive'),top=first[0].target.sectorId,firstTarget=first[0].target.pointId;
planned.battleMemory.recent[0].set(top,{count:4,at:0});planned.battleMemory.history[0].set(top,{retreats:10,captures:0});planned.api.orders=[];
ai.plan(cfg.ai.strategic);const after=planned.api.orders.filter(o=>o.type==='directive');
assert.notEqual(after[0].target.pointId,firstTarget,'remembered own danger changes the first real AI directive in a controlled scene');
assert.equal(planned.battleMemory.attackPenalty(1,top),0);planned.battleMemory.enabled[0]=false;planned.api.orders=[];ai.plan(cfg.ai.strategic);
assert.equal(planned.api.orders.find(o=>o.type==='directive').target.pointId,firstTarget,'baseline ordering returns with memory disabled');
// Repeat the real event path for the other faction after swapping the map.
const other=new Game({...opts,seed:8,swapSides:true,strategicMemoryStorage:null});other.time=50;
const p1=other.world.points.find(p=>p.owner!==1&&other.world.sectorAt(p.x,p.y)),s1=other.world.sectorAt(p1.x,p1.y),q1=[...other.squads.values()].find(s=>s.faction===1&&s.count()>=4);
for(const u of q1.units()){u.x=p1.x;u.y=p1.y;u.morale=100;other.unitGrid.update(u);}
const o1=other.api.issue({source:'enemyAI',type:'directive',faction:1,squadIds:[q1.id],target:{x:p1.x,y:p1.y,pointId:p1.id,sectorId:s1.id},params:{goalType:'capture'}});other.api.deliver(o1);assert.equal(o1.status,'accepted');
for(const u of q1.units().slice(0,Math.ceil(q1.initialCount*.5)))killUnit(other,u);other.squadAI.think(q1);
assert.ok(other.battleMemory.attackPenalty(1,s1.id)>0);assert.equal(other.battleMemory.attackPenalty(0,s1.id),0);
other.time+=181;assert.equal(other.battleMemory.attackPenalty(1,s1.id),0,'short-term warning expires');
other.battleMemory.record(1,s1.id,'retreats');assert.ok(other.battleMemory.attackPenalty(1,s1.id)>0,'repeated history contributes a small long-term warning');
console.log('Battle memory: accepted AI directive, actual casualties/retreat, both factions, capture, storage, save/load, fallback and changed controlled AI decision checked.');
