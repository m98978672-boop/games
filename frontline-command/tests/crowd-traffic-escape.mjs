import assert from 'node:assert/strict';
import {loadConfig} from '../src/core/config.js';
import {Game} from '../src/sim/game.js';
import {trafficEscape} from '../src/sim/traffic_escape.js';
import {solidUnitMoveFree} from '../src/sim/solid_units.js';
import {clearFinalApproach} from '../src/sim/arrival.js';
import {execFileSync} from 'node:child_process';

for(const faction of [0,1]){
  const cfg=await loadConfig(),g=new Game({cfg,seed:7,aiVsAi:true});g.units.clear();g.unitGrid.clear();g.occupancyGrid.clear();g.squads.clear();
  const u=g.spawnUnit(faction,'infantry',750,500),v=g.spawnUnit(faction,'infantry',770,500);u.goal={x:1100,y:500};u.arrived=false;g.time=2;
  g.walls.refsInBox=()=>[];g.walls.buildingAtPoint=()=>null;
  const wait={goalX:u.goal.x,goalY:u.goal.y,since:0,lastBlocked:2,blockerId:v.id};u._occupancyWait=wait;g._trafficEscapeMetrics={chosen:0};
  const goal=u.goal,point=trafficEscape(g,u,1,0);
  assert.ok(point,'a blocked friendly has a safe side-step');assert.equal(u.goal,goal,'original order unchanged');
  assert.equal(g._trafficEscapeMetrics.chosen,1);assert.ok(clearFinalApproach(g,u,point.x,point.y));assert.ok(solidUnitMoveFree(g,u,point.x,point.y,0.1,g.occupancyGrid));
  assert.equal(trafficEscape(g,u,1,0),point,'short waypoint remains stable while still safe');
  g.time=22.1;wait.lastBlocked=g.time;assert.equal(trafficEscape(g,u,1,0),null,'local attempt budget eventually stops dithering');
  g.time=2;wait.lastBlocked=2;u._trafficEscapeBudget=null;
  u.perception.hasContact=true;assert.equal(trafficEscape(g,u,1,0),null,'combat has priority');u.perception.hasContact=false;
  u.goal={x:1200,y:500};assert.equal(trafficEscape(g,u,1,0),null,'new goal invalidates wait and escape');u.goal=goal;
  v.faction=1-faction;assert.equal(trafficEscape(g,u,1,0),null,'not an ally');v.faction=faction;
  u.playerControlled=true;assert.equal(trafficEscape(g,u,1,0),null,'player control is not altered');u.playerControlled=false;
  cfg.flags.pathing_v2=false;assert.equal(trafficEscape(g,u,1,0),null,'requires safe terrain checking');cfg.flags.pathing_v2=true;
  cfg.flags.wall_collision_v2=false;assert.equal(trafficEscape(g,u,1,0),null,'requires walls');cfg.flags.wall_collision_v2=true;
  u._trafficEscapeRetry=0;g.walls.refsInBox=()=>[{kind:'opening',x1:745,y1:500,x2:755,y2:500}];
  assert.equal(trafficEscape(g,u,1,0),null,'doorway traffic stays under door logic');g.walls.refsInBox=()=>[];
  // All candidate trajectories through an impassable ring must be rejected.
  const walk=g.world.isBaseWalkable.bind(g.world);g.world.isBaseWalkable=(x,y)=>Math.hypot(x-u.x,y-u.y)<12&&walk(x,y);
  assert.equal(trafficEscape(g,u,1,0),null,'no movement through terrain when no candidate is available');
}
// Run real Game.step for both factions, groups of 6, 8 and 10. The 3–5 group
// behavior is independently covered by crowd-open-arrival.mjs. This checks
// physical safety, not a universal requirement that all units arrive.
const r=JSON.parse(execFileSync(process.execPath,[new URL('../tools/crowd-u-probe.mjs',import.meta.url).pathname],{encoding:'utf8'})).results;
for(const v of r.filter(x=>x.n>=6))assert.ok(!v.cross&&!v.overlap&&!v.speed,JSON.stringify(v));
assert.ok(r.filter(x=>x.n>=6).reduce((s,v)=>s+v.arrived,0)>=70,'paired fixed-goal congestion scenario retains progress');
console.log('traffic escape: bounded safe candidates, goal/contact/door guards and Game.step large groups');
