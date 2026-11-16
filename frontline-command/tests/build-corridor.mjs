import assert from 'node:assert/strict';
import {loadConfig} from '../src/core/config.js';
import {Game} from '../src/sim/game.js';
const cfg=await loadConfig();
const g=new Game({cfg,seed:7,aiVsAi:true});
const def=cfg.building('sandbags'),defBig=cfg.building('bunker');
// Corridor walls are independently defined, with lengths exceeding the probe
// region. Angled channels and isolated obstacles exercise the same heuristic.
for (const angle of [0, Math.PI/4, Math.PI/2, 3*Math.PI/4]) {
  const nx=Math.cos(angle),ny=Math.sin(angle);
  g.world.isWalkable=(x,y)=>Math.abs(nx*x+ny*y)<=25;
  assert.equal(g.build.blocksPath(def,0,0),true,'50px corridor cannot fit a 32px footprint and pedestrian clearance');
  g.world.isWalkable=(x,y)=>Math.abs(nx*x+ny*y)<=45;
  assert.equal(g.build.blocksPath(def,0,0),false,'90px corridor remains usable for a 32px footprint');
  assert.equal(g.build.blocksPath(defBig,0,0),true,'the larger footprint blocks the same 90px corridor');
}
g.world.isWalkable=(x,y)=>x<25; // single wall, not a channel
assert.equal(g.build.blocksPath(def,0,0),false,'one-sided obstacle is not a corridor');
g.world.isWalkable=()=>true;
assert.equal(g.build.blocksPath(def,0,0),false,'open terrain');
// Exercise the real placement API as well: neither faction can spend resources
// or create a blueprint in a medium-width channel missed by the old 6/8 test.
for (const faction of [0,1]) {
  const game=new Game({cfg,seed:7,aiVsAi:true});
  let spot=null;
  for(let y=200;y<game.world.H-200&&!spot;y+=80) for(let x=200;x<game.world.W-200;x+=80) {
    if(game.build.validate('sandbags',x,y,faction,{ignoreCost:true,ignoreFog:true}).ok) {spot={x,y};break;}
  }
  assert(spot);
  game.world.isWalkable=(_x,y)=>Math.abs(y-spot.y)<=25;
  const check=game.build.validate('sandbags',spot.x,spot.y,faction,{ignoreCost:true,ignoreFog:true});
  assert.equal(check.code,'BLOCKS_PATH');
  const count=game.world.buildings.length, resources=game.logistics.supply(faction).materials;
  const result=game.build.place('sandbags',spot.x,spot.y,faction);
  assert(!result.ok && result.code==='BLOCKS_PATH');
  assert.equal(game.world.buildings.length,count);assert.equal(game.logistics.supply(faction).materials,resources);
}
console.log('build corridor: 4 orientations, footprint sizes, open ground and one wall');
