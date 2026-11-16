import assert from 'node:assert/strict';import {loadConfig} from '../src/core/config.js';import {Game} from '../src/sim/game.js';
const cfg=await loadConfig();cfg.flags.movement_occupancy_v1=true;
function make(enabled,faction){cfg.flags.movement_queue_wait_v1=enabled;const g=new Game({cfg,seed:7,aiVsAi:true});g.units.clear();g.unitGrid.clear();g.occupancyGrid.clear();g.squads.clear();
 g.walls.enabled=()=>false;g.walls.doorWaypoint=()=>null;g.walls.doorsForUnit=()=>{};g.walls.update=()=>{};g.world.isWalkable=(x,y)=>y>=991&&y<=1009;g.world.speedAt=()=>1;
 g.nav.advance=()=>{};g.nav.field=()=>({});g.nav.step=()=>({dx:1,dy:0});
 g.autopilot.update=()=>{};for(const ai of g.strategic)ai.update=()=>{};g.squadAI.update=()=>{};g.rules.update=()=>{};g.logistics.update=()=>{};g.build.update=()=>{};g.influence.update=()=>{};g.api.update=()=>{};g.checkVictory=()=>{};
 const a=g.spawnUnit(faction,'infantry',1000,1000),b=g.spawnUnit(faction,'infantry',1020,1000);
 a.goal={x:1200,y:1000};a.arrived=false;a.activity='advance';a.speed=55;a.thinkTimer=10000;b.speed=55;b.thinkTimer=10000;return {g,a,b};}
for(const faction of [0,1]){
 const legacy=make(false,faction);for(let i=0;i<170;i++)legacy.g.step(.05);assert.equal(legacy.a.pathFailed,true,'old queue loses its objective');
 const {g,a,b}=make(true,faction);for(let i=0;i<170;i++){g.step(.05);assert.ok(Math.hypot(a.x-b.x,a.y-b.y)>=a.radius+b.radius-1e-8);}
 assert.ok(a.goal&&!a.pathFailed,'queue persists through Game.step');b.goal={x:1300,y:1000};b.arrived=false;b.activity='advance';
 for(let i=0;i<60;i++){g.step(.05);assert.ok(Math.hypot(a.x-b.x,a.y-b.y)>=a.radius+b.radius-1e-8);}
 assert.ok(a.x>1100&&b.x>1120,'both bots proceed after the leader starts moving');
}
console.log('queue coordination: actual Game.step and leader release, both factions');
