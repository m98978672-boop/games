import assert from 'node:assert/strict';import {loadConfig} from '../src/core/config.js';import {Game} from '../src/sim/game.js';
for(const swapSides of [false,true])for(const loser of [0,1])for(const mode of ['capture','destruction']){
 const cfg=await loadConfig();cfg.flags.victory_hq_rules_v1=true;
 const g=new Game({cfg,seed:7,aiVsAi:true,swapSides});g.units.clear();g.unitGrid.clear();g.squads.clear();
 g.autopilot.update=()=>{};g.strategic.forEach(a=>a.update=()=>{});g.rules.update=()=>{};g.logistics.update=()=>{};
 const p=g.world.homeHQ(loser);
 const a=g.spawnUnit(1-loser,'infantry',p.x,p.y),d=g.spawnUnit(loser,'infantry',g.world.W/2,g.world.H/2);
 for(const u of [a,d]){u.thinkTimer=10000;u.goal=null;}
 if(mode==='destruction')g.world.damageBuilding(p.structure,p.structure.hp+1,1-loser);
 const max=mode==='capture'?600:5;
 for(let i=0;i<max&&!g.warOver;i++)g.step(.1);
 assert.equal(g.warOver,true,`${mode} step ends war`);assert.equal(g.outcome.winner,1-loser);
 if(mode==='capture')assert.ok(g.events.log.some(e=>e.name==='pointCaptured'&&e.payload.point===p&&e.payload.faction===1-loser),'real capture event');
 else assert.ok(p.structure.dead,'real damage marks primary HQ destroyed');
 assert.equal(g.events.log.filter(e=>e.name==='warOver').length,1);
}
console.log('HQ rules: real Game.step with influence capture and world damage, both factions and swapped starts');
