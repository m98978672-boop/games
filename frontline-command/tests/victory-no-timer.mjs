import assert from 'node:assert/strict';import {loadConfig} from '../src/core/config.js';import {Game} from '../src/sim/game.js';
const cfg=await loadConfig();assert.equal(cfg.flag('sudden_death',true),false);
const game=new Game({cfg,seed:7,aiVsAi:true});game.time=(cfg.ai.capture.suddenDeathSeconds||900)*100;game.checkVictory();assert.equal(game.warOver,false,'time alone must not end war');
const hq=game.world.homeHQ(0);hq.owner=1;game.checkVictory();assert.equal(game.warOver,true,'normal HQ victory remains enabled');assert.equal(game.outcome.winner,1);
console.log('default war has no hard time limit; HQ victory remains');
