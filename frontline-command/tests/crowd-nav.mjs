import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { loadConfig } from '../src/core/config.js';
import { Game } from '../src/sim/game.js';
import { prepareCrowdNavigation, setCrowdDetour, clearCrowdState, crowdPositionFree } from '../src/sim/crowd_nav.js';
const cfg=await loadConfig();cfg.flags.movement_occupancy_v1=false; // isolate this legacy flag from occupancy

assert.equal(cfg.flag('crowd_nav_v2'),false,'experiment is off by default');
const root=fileURLToPath(new URL('..',import.meta.url));
for(const [arg,expected] of [['--flag-off',false],[null,true]]) {
  const child=spawnSync(process.execPath,['tools/diagnose-column-variants.mjs',...(arg?[arg]:[])],{cwd:root,encoding:'utf8',timeout:120000});
  const report=JSON.parse(child.stdout);
  assert.equal(report.enabled,expected);assert.equal(report.total,180);
  assert.equal(child.status,expected?0:1,child.stderr);
  if(expected)assert.equal(report.passed,180);
  else assert.ok(report.passed<report.total,'disabled baseline must not be hidden');
}
cfg.flags.crowd_nav_v2=true;
for(const faction of [0,1]) {
  const game=new Game({cfg,seed:7,aiVsAi:true});game.units.clear();game.unitGrid.clear();
  const building=game.world.buildings.find(b=>b.type==='hq'&&b.faction===faction&&game.walls.state(b));
  const door=game.walls.state(building).outline.openings.find(o=>o.type==='door');
  const px=building.x+door.cx,py=building.y+door.cy,goal={x:px-door.nx*100,y:py-door.ny*100};
  const units=Array.from({length:6},(_,i)=>{
    const u=game.spawnUnit(faction,'infantry',px+door.nx*(55+i*24),py+door.ny*(55+i*24));
    u.goal={...goal};return u;
  });
  const first=units[0];
  prepareCrowdNavigation(game,first,155);
  assert.equal(first._crowdActive,true);
  assert.ok(units.every(u=>u._crowdAssigned && u._crowdGroupGoal),'whole group assigned once');
  const assigned=units.map(u=>u._crowdAssigned);
  for(let i=0;i<assigned.length;i++)for(let j=i+1;j<assigned.length;j++)
    assert.ok(Math.hypot(assigned[i].x-assigned[j].x,assigned[i].y-assigned[j].y)>18,'slots have unit clearance');
  first._crowdPoint=first._crowdAssigned;setCrowdDetour(game,first);
  const detour=first.detour;clearCrowdState(first);
  assert.equal(first.detour,null);assert.ok(detour);
  first.goal={x:goal.x+120,y:goal.y};prepareCrowdNavigation(game,first,200);
  assert.equal(first._crowdActive,false,'changed target invalidates assignment');
  // Already overlapping disks can only separate; normal moves cannot overlap.
  const a=units[1],b=units[2];a._crowdActive=true;
  const dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy);
  assert.equal(crowdPositionFree(game,a,b.x,b.y),false);
  b.x=a.x+5*dx/len;b.y=a.y+5*dy/len;game.unitGrid.update(b);
  assert.equal(crowdPositionFree(game,a,a.x-dx/len,a.y-dy/len),true);
  assert.equal(crowdPositionFree(game,a,a.x+dx/len,a.y+dy/len),false);
  a.perception.hasContact=true;prepareCrowdNavigation(game,a,200);
  assert.equal(a._crowdActive,false,'combat cancels experimental grouping');
}
console.log('crowd nav: 180 paired variants, clearance, collision, goal and combat invalidation OK');
