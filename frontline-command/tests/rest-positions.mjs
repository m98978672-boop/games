import assert from 'node:assert/strict';
import { loadConfig } from '../src/core/config.js';
import { Game } from '../src/sim/game.js';
import { moveAlongFlow } from '../src/sim/units.js';
import { updateSoldier } from '../src/sim/ai_soldier.js';
import { unsafeRest, safeRestGoal, footprintTouchesWalls, segmentIntersectsRect } from '../src/sim/rest_positions.js';

const cfg = await loadConfig();
for (const faction of [0, 1]) {
  const g = new Game({cfg, seed: 4, aiVsAi: true});
  g.units.clear(); g.unitGrid.clear();
  const b = g.world.buildings.find(b => b.type === 'hq' && b.faction === faction && g.walls.state(b));
  const st = g.walls.state(b);
  const opening = st.outline.openings.find(o => o.type === 'door' || o.type === 'gate');
  const wall = st.outline.segments.find(s => s.blocksMove && s.length > 60);
  const window = st.outline.openings.find(o => o.type === 'window');
  assert(window, 'HQ has a window');
  for (const [p1, p2] of [[opening.p1, opening.p2], [window.p1, window.p2], wall.points]) {
    const x = b.x+(p1[0]+p2[0])/2, y = b.y+(p1[1]+p2[1])/2;
    const u = g.spawnUnit(faction,'infantry',b.x,b.y);
    assert(unsafeRest(g,x,y,u.radius));
    assert(footprintTouchesWalls(g,x,y,16));
    const safe = safeRestGoal(g,u,{x,y});
    assert(safe && !unsafeRest(g,safe.x,safe.y,u.radius), 'destination has clearance');
    u.goal={x,y}; u.arrived=false; moveAlongFlow(g,u,.05);
    assert(u.goal && !unsafeRest(g,u.goal.x,u.goal.y,u.radius), 'bot goal moved off wall/opening');
    g.units.delete(u.id);
  }
  const slot = g.walls.garrisonSlotsNear(b.x,b.y,10).find(s => s.building === b);
  assert(slot, 'HQ has garrison slots');
  const adjusted = safeRestGoal(g, {x:slot.x,y:slot.y,radius:9}, slot);
  assert(adjusted && g.walls.buildingAtPoint(adjusted.x,adjusted.y) === b && !unsafeRest(g,adjusted.x,adjusted.y,9), 'window post stays inside and clear');
  // Even if the structure's centre and corners are outside the doorway,
  // an edge crossing the opening must be rejected before cost/fog checks.
  const x=b.x+(opening.p1[0]+opening.p2[0])/2, y=b.y+(opening.p1[1]+opening.p2[1])/2;
  assert.equal(g.build.validate('sandbags',x,y,faction,{ignoreCost:true,ignoreFog:true}).code,'WALL_OPENING');
  const u = g.spawnUnit(faction,'infantry',x,y); u.goal=null; u.arrived=false; u.thinkTimer=9999;
  g.world.isBaseWalkable=()=>true; // fixture isolates the parking behaviour
  for(let i=0;i<80 && unsafeRest(g,u.x,u.y,u.radius);i++) updateSoldier(g,u,.05);
  assert(!unsafeRest(g,u.x,u.y,u.radius), 'idle infantry leaves the doorway');
  const engineer = g.spawnUnit(faction,'engineer',x,y);
  engineer.goal = {x:x+100,y:y+100}; engineer.arrived=false; engineer.thinkTimer=9999;
  let workChecks=0; g.build.nearestWork=()=>{workChecks++;return null;};
  updateSoldier(g,engineer,.05);
  assert.equal(workChecks,0,'engineer does not start work in an opening while travelling');
}
assert(segmentIntersectsRect({x1:-20,y1:0,x2:20,y2:0,thickness:2},0,0,5));
assert(!segmentIntersectsRect({x1:-20,y1:30,x2:20,y2:30,thickness:2},0,0,5));
console.log('rest positions: both factions, doorway, wall, footprint and idle escape');
