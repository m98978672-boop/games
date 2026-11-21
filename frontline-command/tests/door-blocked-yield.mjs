import assert from 'node:assert/strict';
import {loadConfig} from '../src/core/config.js';import {Game} from '../src/sim/game.js';import {blockedDoorYield} from '../src/sim/door_yield_blocked.js';import {unsafeRest} from '../src/sim/rest_positions.js';import {clearFinalApproach} from '../src/sim/arrival.js';import {solidUnitMoveFree} from '../src/sim/solid_units.js';import {execFileSync} from 'node:child_process';
async function fixture(type,faction,index){
 const cfg=await loadConfig(),g=new Game({cfg,seed:7,aiVsAi:true});g.units.clear();g.unitGrid.clear();g.occupancyGrid.clear();g.squads.clear();
 const b=g.world.buildings.find(v=>v.type===type&&v.faction===faction&&g.walls.state(v)),o=g.walls.state(b).outline.openings.filter(o=>o.type==='door')[index],x=b.x+o.cx,y=b.y+o.cy;
 g.walls.openDoor(b,o.id);const enter=g.spawnUnit(faction,'infantry',x+o.nx*8,y+o.ny*8),exit=g.spawnUnit(faction,'infantry',x-o.nx*12,y-o.ny*12);
 enter.goal={x:x-o.nx*100,y:y-o.ny*100};exit.goal={x:x+o.nx*100,y:y+o.ny*100};enter.arrived=false;exit.arrived=false;g.time=2;
 enter._occupancyWait={goalX:enter.goal.x,goalY:enter.goal.y,since:0,lastBlocked:2,blockerId:exit.id};
 return {g,enter,exit,b,o,x,y};
}
for(const type of ['hq','city'])for(const f of [0,1])for(const door of [0,1]){
 let {g,enter,exit,b,o,x,y}=await fixture(type,f,door);const goal=enter.goal;
 let p=blockedDoorYield(g,enter);assert.ok(p,`${type}/${f}/${door}: must yield to blocked ally`);assert.equal(enter.goal,goal,'order preserved');
 assert.ok(!unsafeRest(g,p.x,p.y,enter.radius)&&clearFinalApproach(g,enter,p.x,p.y)&&solidUnitMoveFree(g,enter,p.x,p.y,.1,g.occupancyGrid));
 assert.equal(blockedDoorYield(g,enter),p,'active yield is stable');
 enter.perception.hasContact=true;assert.equal(blockedDoorYield(g,enter),null,'contact cancels');enter.perception.hasContact=false;
 ({g,enter,exit,b,o,x,y}=await fixture(type,f,door));p=blockedDoorYield(g,enter);enter.goal={x:enter.goal.x+4,y:enter.goal.y};assert.equal(blockedDoorYield(g,enter),null,'new order cancels');
 ({g,enter,exit,b,o,x,y}=await fixture(type,f,door));p=blockedDoorYield(g,enter);exit.x=x+o.nx*40;exit.y=y+o.ny*40;assert.equal(blockedDoorYield(g,enter),null,'release after other exits');
 ({g,enter,exit,b,o,x,y}=await fixture(type,f,door));p=blockedDoorYield(g,enter);g.time=p.until;assert.equal(blockedDoorYield(g,enter),null,'timeout releases the yield');
 ({g,enter,exit,b,o,x,y}=await fixture(type,f,door));p=blockedDoorYield(g,enter);g.world.navVersion++;assert.equal(blockedDoorYield(g,enter),null,'changed navigation cancels');
 ({g,enter,exit,b,o,x,y}=await fixture(type,f,door));p=blockedDoorYield(g,enter);exit.alive=false;assert.equal(blockedDoorYield(g,enter),null,'lost blocker cancels');
 ({g,enter,exit,b,o,x,y}=await fixture(type,f,door));p=blockedDoorYield(g,enter);exit.playerControlled=true;assert.equal(blockedDoorYield(g,enter),null,'player taking control cancels');
 ({g,enter,exit,b,o,x,y}=await fixture(type,f,door));g.time=25;enter._occupancyWait.since=24;enter._occupancyWait.lastBlocked=25;enter._doorYieldBudget={gx:enter.goal.x,gy:enter.goal.y,version:g.world.navVersion,x:enter.x,y:enter.y,since:0};assert.equal(blockedDoorYield(g,enter),null,'budget prevents repeated indefinite yielding');
 ({g,enter,exit,b,o,x,y}=await fixture(type,f,door));g.cfg.flags.blocked_door_yield_v1=false;assert.equal(blockedDoorYield(g,enter),null,'feature off');g.cfg.flags.blocked_door_yield_v1=true;exit.faction=1-f;assert.equal(blockedDoorYield(g,enter),null,'never yield to an enemy');
}
// A full movement loop with ordinary squad decisions, both factions and
// opposing orders, not just a function returning candidate coordinates.
const rs=JSON.parse(execFileSync(process.execPath,[new URL('../tools/door-opposing-orders.mjs',import.meta.url).pathname,'--seeds=1'],{encoding:'utf8'})).results;
assert.ok(rs.every(x=>x.accepted&&!x.invalid&&!x.wall&&!x.overlap&&!x.swept&&!x.speed),'safe accepted opposing squad orders');
const fixed=JSON.parse(execFileSync(process.execPath,[new URL('../tools/door-traffic-probe.mjs',import.meta.url).pathname,'--seeds=1'],{encoding:'utf8'})).results;
assert.ok(fixed.some(x=>x.yields>0),'Game.step uses the yield in opposing traffic');
assert.ok(fixed.every(x=>!x.invalid&&!x.wall&&!x.overlap&&!x.swept&&!x.speed),'traffic moves safely');
console.log('blocked-door yield: both factions, real doors and orders, safety, timeout and cancellation');
