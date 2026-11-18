import assert from 'node:assert/strict';
import {loadConfig} from '../src/core/config.js';import {Game} from '../src/sim/game.js';import {killUnit} from '../src/sim/units.js';import {Save} from '../src/core/save.js';import {Menus} from '../src/ui/menus.js';
const store=new Map();globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)};
async function make(on=true,swap=false,aiVsAi=true){const cfg=await loadConfig();assert.equal(cfg.flag('victory_hq_rules_v1',false),false);cfg.flags.victory_hq_rules_v1=on;return new Game({cfg,seed:7,aiVsAi,mode:'commander',swapSides:swap});}
for(const swap of [false,true])for(const loser of [0,1])for(const cause of ['capture','destruction']) {
 const g=await make(true,swap),p=g.world.homeHQ(loser);assert.ok(p&&p.structure&&!p.structure.dead);
 if(cause==='capture')p.owner=1-loser;else g.world.damageBuilding(p.structure,p.structure.hp+1,1-loser);
 g.checkVictory();assert.equal(g.warOver,true);assert.equal(g.outcome.winner,1-loser,`${swap} ${loser} ${cause}`);
 assert.match(g.outcome.reason,cause==='capture'?/захвачен/:/разрушен/);assert.equal(g.events.log.filter(e=>e.name==='warOver').length,1);g.checkVictory();assert.equal(g.events.log.filter(e=>e.name==='warOver').length,1);
}
for(const swap of [false,true])for(const actions of ['captures','destructions','mixed']){
 const g=await make(true,swap);for(const f of [0,1]){const p=g.world.homeHQ(f);if(actions==='captures'||actions==='mixed'&&f===0)p.owner=1-f;else g.world.damageBuilding(p.structure,p.structure.hp+1,1-f);}
 g.checkVictory();assert.equal(g.warOver,true);assert.equal(g.outcome.winner,null);assert.match(g.outcome.reason,/Оба штаба/);
}
for(const swap of [false,true]){
 const g=await make(true,swap);for(const p of g.world.points)if(p.type==='city'&&p.key&&p.home===0)p.owner=1;
 g.time=(g.cfg.ai.capture?.suddenDeathSeconds??900)+100;g.world.homeHQ(0).owner=-1;
 g.checkVictory();assert.equal(g.warOver,false,'city loss, time and neutral HQ do not end the experimental war');
 const ordinary=[...g.units.values()].find(u=>u.faction===0&&u.alive);killUnit(g,ordinary);g.checkVictory();assert.equal(g.warOver,false,'ordinary unit death is not commander death');
 const p=g.world.homeHQ(0),defense=g.world.addBuilding({type:'bunker',faction:0,x:p.x+300,y:p.y,pointId:p.id,instant:true});g.world.damageBuilding(defense,defense.hp+1,1);
 g.checkVictory();assert.equal(g.warOver,false,'an associated non-HQ building is not the HQ');assert.equal(p.structure.dead,false);
}
for(const loser of [0,1]){
 const g=await make();for(const u of g.units.values())if(u.faction===loser)u.alive=false;
 g.time=5;g.checkVictory();assert.equal(g.warOver,false);g.time=5+(g.cfg.ai.surrenderSeconds??90);g.checkVictory();assert.equal(g.outcome.winner,1-loser,'existing no-army approximation');
}
{
 const g=await make();for(const u of g.units.values())u.alive=false;g.time=5;g.checkVictory();g.time+=g.cfg.ai.surrenderSeconds??90;g.checkVictory();assert.equal(g.outcome.winner,null,'simultaneous no-army timeout is neutral');
}
for(const on of [false,true]){
 const g=await make(on);g.units.clear();for(const p of g.world.points)p.owner=-1;g.resolveByPoints();assert.equal(g.outcome.winner,on?null:0,'full score parity respects selected behavior');
}
for(const winner of [0,1])for(const criterion of ['key','pts','units','power']){
 const g=await make();g.units.clear();for(const p of g.world.points)p.owner=-1;
 if(criterion==='key')g.world.pointById(g.keyCities[winner][0]).owner=winner;
 if(criterion==='pts')g.world.points.find(p=>p.type!=='city').owner=winner;
 if(criterion==='units')g.spawnUnit(winner,'infantry',1000,1000);
 if(criterion==='power'){g.spawnUnit(winner,'tank',1000,1000);g.spawnUnit(1-winner,'infantry',1200,1000);}
 g.resolveByPoints();assert.equal(g.outcome.winner,winner,`${criterion}: unequal scores are not a draw`);
}
// Legacy loads used a dead, detached starter HQ reference. An active primary
// HQ must not be mistaken for a destroyed HQ; a truly destroyed HQ remains so.
for(const swap of [false,true])for(const algSave of [false,true])for(const destroyed of [false,true])for(const faction of [0,1]){
 const g=await make(true,swap);g.cfg.flags.alg_save=algSave;const p=g.world.homeHQ(faction);
 if(destroyed)g.world.damageBuilding(p.structure,p.structure.hp+1,1-faction);
 assert.ok(Save.saveWar(g));const data=Save.loadWar();const h=await make(true,swap);h.cfg.flags.alg_save=algSave;assert.ok(Save.applyWar(h,data));
 const restored=h.world.homeHQ(faction);assert.equal(restored.structure.dead,destroyed,`saved HQ state swap=${swap} algSave=${algSave} destroyed=${destroyed}`);
 h.checkVictory();assert.equal(h.warOver,destroyed);if(destroyed)assert.equal(h.outcome.winner,1-faction);
}
// The draw is distinct in the result UI, pays no configured win/loss XP and
// emits no loss sound. No draw reward is invented.
{
 const g=await make(true,false,false),xp=g.skills.xp,sounds=g.soundQueue.length;g.endWar(null,'тест');
 assert.equal(g.skills.xp,xp);assert.equal(g.soundQueue.length,sounds);assert.equal(g.events.log.at(-1).payload.winner,null);
 const overlay={};new Menus(overlay,g).result(g);assert.match(overlay.innerHTML,/<h1>Ничья<\/h1>/);
}
// Flag-off behavior for the existing city and timer endings is unchanged.
{
 const g=await make(false);for(const p of g.world.points)if(p.type==='city'&&p.key&&p.home===0)p.owner=1;g.checkVictory();assert.equal(g.outcome.winner,1);assert.match(g.outcome.reason,/ключевые города/);
}
{
 const g=await make(false);g.cfg.flags.sudden_death=true;g.time=(g.cfg.ai.capture?.suddenDeathSeconds??900)+1;g.checkVictory();assert.ok(g.warOver);assert.match(g.outcome.reason,/измор/);
}
console.log('experimental HQ rules: capture, destruction, symmetric simultaneous losses, legacy save, parity/draw UI, no city/timer; commander remains unimplemented');
