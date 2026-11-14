import assert from 'node:assert/strict';import {loadConfig} from '../src/core/config.js';import {Game} from '../src/sim/game.js';
import {solidUnitMoveFree} from '../src/sim/solid_units.js';
const cfg=await loadConfig();assert.equal(cfg.flag('unit_solid_2d_v1',false),false);
for(const faction of [0,1]){
 const g=new Game({cfg,seed:1,aiVsAi:true});g.units.clear();g.unitGrid.clear();
 const u=g.spawnUnit(faction,'infantry',2000,2000),v=g.spawnUnit(1-faction,'infantry',2030,2000);
 assert.equal(solidUnitMoveFree(g,u,2015,2000),false,'final overlap');
 assert.equal(solidUnitMoveFree(g,u,2045,2000),false,'swept through');
 assert.equal(solidUnitMoveFree(g,u,2000,2020),true,'free direction');
 v.x=2010;g.unitGrid.update(v);
 assert.equal(solidUnitMoveFree(g,u,1999,2000),true,'escape overlap');
 assert.equal(solidUnitMoveFree(g,u,2001,2000),false,'no deeper overlap');
 v.downed=true;assert.equal(solidUnitMoveFree(g,u,2001,2000),true,'downed bodies excluded');
}
console.log('solid units: off by default, endpoint/sweep and overlap recovery');
