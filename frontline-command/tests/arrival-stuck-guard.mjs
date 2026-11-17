import assert from 'node:assert/strict';import {loadConfig} from '../src/core/config.js';import {Game} from '../src/sim/game.js';import {updateTimers} from '../src/sim/units.js';
const cfg=await loadConfig();cfg.flags.movement_occupancy_v1=false; // isolate this legacy flag from occupancy
assert.equal(cfg.flag('arrival_stuck_guard_v1',false),false);
function make(enabled,faction=0){cfg.flags.arrival_stuck_guard_v1=enabled;const g=new Game({cfg,seed:1,aiVsAi:true});g.units.clear();g.unitGrid.clear();
 const u=g.spawnUnit(faction,'infantry',2000,2000);u.goal={x:2000,y:2000};u.arrived=true;return {g,u};}
function wait(g,u,seconds=8){for(let i=0;i<seconds*20;i++){g.time+=.05;updateTimers(g,u,.05);}}
for(const f of [0,1]){
 {const {g,u}=make(false,f);wait(g,u);assert.equal(u.pathFailed,true,'legacy failure reproduced');}
 {const {g,u}=make(true,f);wait(g,u);assert.equal(!!u.pathFailed,false);assert.ok(u.goal);assert.equal(u.stuck,0);}
 {const {g,u}=make(true,f);u.goal={x:2200,y:2000};wait(g,u);assert.equal(u.pathFailed,true,'stale arrival does not hide real stuck');}
 {const {g,u}=make(true,f);u._crowdActive=true;u._crowdPoint={x:2025,y:2000};wait(g,u);assert.equal(u.pathFailed,true,'unreached slot does not hide stuck');}
 {const {g,u}=make(true,f);u._crowdActive=true;u._crowdPoint={x:2001,y:2000};wait(g,u);assert.equal(!!u.pathFailed,false,'reached slot safe');}
 {const {g,u}=make(true,f);u.goal={x:2000,y:2000};wait(g,u,5);u.goal={x:2200,y:2000};wait(g,u);assert.equal(u.pathFailed,true,'new goal reinstates stuck checks');}
}
console.log('arrival stuck guard: default off, arrival validation and stale goals for both factions');
