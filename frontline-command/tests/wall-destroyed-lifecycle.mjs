import assert from 'node:assert/strict';
import {loadConfig} from '../src/core/config.js';
import {Game} from '../src/sim/game.js';
import {moveUnit} from '../src/sim/units.js';
import {Save} from '../src/core/save.js';
const store=new Map();globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)};
const cfg=await loadConfig();assert.equal(cfg.flag('wall_remove_destroyed_v1',false),false);
cfg.flags.wall_remove_destroyed_v1=true;
function segment(g,b){
 const geo=g.walls.state(b).outline.segments.find(s=>s.blocksMove&&s.blocksVision&&Math.hypot(s.points[1][0]-s.points[0][0],s.points[1][1]-s.points[0][1])>35);
 assert.ok(geo);const [[a,c],[d,e]]=geo.points,l=Math.hypot(d-a,e-c);
 return {x:b.x+(a+d)/2,y:b.y+(c+e)/2,nx:-(e-c)/l,ny:(d-a)/l};
}
function probe(g,p){const {x,y,nx,ny}=p;return {
 move:g.walls.blocksMove(x,y,2,{isVehicle:false}),
 sweep:g.walls.blocksMoveSweep(x+nx*30,y+ny*30,x-nx*30,y-ny*30,2,{isVehicle:false}),
 vision:g.walls.blocksVision(x+nx*30,y+ny*30,x-nx*30,y-ny*30),
 bullet:g.walls.bulletRay(x+nx*30,y+ny*30,x-nx*30,y-ny*30,'rifle',{next:()=>1}).blocked,
 cover:g.walls.coverAt(x-nx*30,y-ny*30,x+nx*30,y+ny*30).blockedCount,
};}
for(const faction of [0,1])for(const method of ['damage','demolish']){
 const g=new Game({cfg,seed:7,aiVsAi:true}),b=g.world.hqOf(faction).structure,p=segment(g,b);
 const other=g.world.hqOf(1-faction).structure,op=segment(g,other),before=probe(g,p);
 assert.equal(before.move,true);assert.equal(before.sweep,true);assert.equal(before.vision,true);assert.equal(before.bullet,true);assert.ok(before.cover>0);
 const door=g.walls.state(b).outline.openings.find(o=>o.type==='door');assert.ok(door);
 g.walls.closeDoor(b,door.id);const doorX=b.x+door.cx,doorY=b.y+door.cy;
 assert.equal(g.walls.blocksMove(doorX,doorY,1,{isVehicle:false}),true,'closed door blocks movement before destruction');
 g.walls.queueNavRebuild(b);const version=g.world.navVersion;
 if(method==='damage')g.world.damageBuilding(b,b.hp+1,1-faction);else g.build.demolish(b);
 assert.ok(b.dead&&!b.built);assert.equal(g.walls.state(b),null);assert.equal(b.wall,null);
 assert.ok(!g.walls.navQueue.has(b.id));assert.ok(g.world.navVersion>version);
 assert.equal(g.walls.blocksMove(doorX,doorY,1,{isVehicle:false}),false,'removed door cannot turn into a ghost barrier');
 const after=probe(g,p);assert.equal(after.move,false);assert.equal(after.sweep,false);assert.equal(after.vision,false);assert.equal(after.bullet,false);assert.equal(after.cover,0,'cached cover invalidated immediately');
 assert.equal(probe(g,op).move,true,'other building wall unaffected');
 assert.ok(![...g.walls.grid.values()].flat().some(r=>r.bid===b.id));
 // Actual ordinary motion across the former wall, with no nearby units.
 g.units.clear();g.unitGrid.clear();
 const walker=g.spawnUnit(faction,'infantry',p.x+p.nx*35,p.y+p.ny*35);
 for(let i=0;i<25;i++){moveUnit(g,walker,-p.nx,-p.ny,.05);g.unitGrid.update(walker);}
 assert.ok((walker.x-p.x)*p.nx+(walker.y-p.y)*p.ny<0,'unit crosses the former wall normally');
 g.walls.build();assert.equal(g.walls.state(b),null,'dead wall not resurrected on rebuild');
 assert.equal(probe(g,p).move,false);
 // Legacy and extended formats both rebuild the wall index on applyWar.
 cfg.flags.alg_save=method==='damage';
 assert.equal(Save.saveWar(g),true);const saved=Save.loadWar(),loaded=new Game({cfg,seed:7,aiVsAi:true});
 assert.equal(Save.applyWar(loaded,saved),true);
 for(const [id] of loaded.walls.instances){const live=loaded.world.buildings.find(v=>v.id===id);assert.ok(live&&!live.dead&&live.built,'load never indexes a dead structure');}
 assert.equal(loaded.walls.blocksMove(p.x,p.y,2,{isVehicle:false}),false,'destroyed wall absent after load');
 cfg.flags.alg_save=false;
}
// External mutations bypass public destruction methods. The periodic wall
// update removes stale references and forces a nav rebuild when it notices.
for(const state of ['dead','unbuilt','removed']){
 const g=new Game({cfg,seed:7,aiVsAi:true}),b=g.world.hqOf(0).structure,p=segment(g,b),v=g.world.navVersion;
 g.walls.queueNavRebuild(b);
 if(state==='dead')b.dead=true;else if(state==='unbuilt')b.built=false;else g.world.buildings.splice(g.world.buildings.indexOf(b),1);
 g.walls.doorTimer=0;g.walls.update(.05);
 assert.equal(g.walls.instances.has(b.id),false);assert.ok(![...g.walls.grid.values()].flat().some(r=>r.bid===b.id));
 assert.ok(g.world.navVersion>v);assert.equal(g.walls.blocksMove(p.x,p.y,2,{isVehicle:false}),false);
}
console.log('wall destruction lifecycle: both factions, damage/demolition, movement/vision/bullets/cover, nav and save');
