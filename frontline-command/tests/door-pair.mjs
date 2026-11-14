import assert from 'node:assert/strict';
import {loadConfig} from '../src/core/config.js';
import {Game} from '../src/sim/game.js';
import {doorPairWaypoint} from '../src/sim/door_pair.js';
import {moveUnit} from '../src/sim/units.js';
const cfg=await loadConfig();assert.equal(cfg.flag('door_pair_lanes_v1',false),false);
cfg.flags.door_pair_lanes_v1=true;
function fixture(faction=0){
 const g=new Game({cfg,seed:1,aiVsAi:true});g.units.clear();g.unitGrid.clear();
 const b=g.world.buildings.find(b=>b.type==='hq'&&b.faction===faction&&g.walls.state(b));
 const o=g.walls.state(b).outline.openings.find(o=>o.type==='door');const px=b.x+o.cx,py=b.y+o.cy;
 const [a,z]=[-1,1].map(s=>{const u=g.spawnUnit(faction,'infantry',px+s*o.nx*85,py+s*o.ny*85);
 u.goal={x:px-s*o.nx*105,y:py-s*o.ny*105};return u;});return {g,a,z,b,px,py};
}
for(const f of [0,1]){
 for(const [name,change] of [
  ['own goal',({a})=>a.goal.x+=4],['partner goal',({z})=>z.goal.y+=4],
  ['own contact',({a})=>a.perception.hasContact=true],['partner contact',({z})=>z.perception.hasContact=true],
  ['partner dies',({z})=>z.alive=false],['partner removed',({g,z})=>g.units.delete(z.id)],
  ['partner downed',({z})=>z.downed=true],['player controlled',({a})=>a.playerControlled=true],
  ['building destroyed',({b})=>b.dead=true],['new detour',({a})=>a.detour={x:0,y:0,until:100}],
  ['partner route',({z})=>z._smartRoute={}],
  ['new ally',({g,a})=>g.spawnUnit(a.faction,'infantry',a.x+50,a.y)],
  ['new enemy',({g,a})=>g.spawnUnit(1-a.faction,'infantry',a.x+50,a.y)],
 ]){
  const t=fixture(f);assert.ok(doorPairWaypoint(t.g,t.a),name);change(t);
  assert.equal(doorPairWaypoint(t.g,t.a),null,name);assert.equal(t.a._doorPass,null,name);
 }
 {const t=fixture(f);t.g.spawnUnit(f,'infantry',t.a.x+50,t.a.y);assert.equal(doorPairWaypoint(t.g,t.a),null,'no pairing in crowd');}
 {const t=fixture(f);assert.ok(doorPairWaypoint(t.g,t.a));cfg.flags.door_pair_lanes_v1=false;
 moveUnit(t.g,t.a,1,0,.05);assert.equal(t.a._doorPass,null,'off clears when next moved');
 assert.equal(doorPairWaypoint(t.g,t.z),null);cfg.flags.door_pair_lanes_v1=true;}
}
console.log('door-pair: default off, cancellation and third-unit guards checked for both factions');
