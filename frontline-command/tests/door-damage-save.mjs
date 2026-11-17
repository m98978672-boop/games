import assert from 'node:assert/strict';
import {loadConfig} from '../src/core/config.js';import {Game} from '../src/sim/game.js';import {Save} from '../src/core/save.js';
const store=new Map();globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)};
for(const extended of [false,true]){
 const cfg=await loadConfig();cfg.flags.alg_save=extended;
 const options={cfg,seed:7,aiVsAi:true},g=new Game(options);g.units.clear();g.unitGrid.clear();
 for(const faction of [0,1]){
  const b=g.world.buildings.find(b=>b.type==='hq'&&b.faction===faction&&g.walls.state(b));const st=g.walls.state(b),[damaged,broken]=st.outline.openings.filter(o=>o.type==='door');
  g.walls.closeDoor(b,damaged.id);g.walls.breakDoorHit(b,damaged,30);g.walls.closeDoor(b,broken.id);g.walls.breakDoorHit(b,broken,100000);
  assert.equal(st.doors[damaged.id].hp,(damaged.breakHp??90)-30);assert.equal(st.doors[broken.id].broken,true);
  assert.equal(g.walls.closeDoor(b,broken.id).reason,'broken');assert.equal(st.doors[broken.id].state,'open');
 }
 assert.equal(Save.saveWar(g),true);const data=Save.loadWar(),loaded=new Game(options);assert.equal(Save.applyWar(loaded,data),true);
 for(const faction of [0,1]){
  const b=loaded.world.buildings.find(b=>!b.dead&&b.type==='hq'&&b.faction===faction&&loaded.walls.state(b));const st=loaded.walls.state(b),[damaged,broken]=st.outline.openings.filter(o=>o.type==='door');
  assert.equal(st.doors[damaged.id].hp,(damaged.breakHp??90)-30);assert.equal(st.doors[damaged.id].state,'closed');
  assert.equal(st.doors[broken.id].broken,true);assert.equal(st.doors[broken.id].hp,0);assert.equal(st.doors[broken.id].state,'open');
  assert.equal(loaded.walls.closeDoor(b,broken.id).reason,'broken');assert.equal(loaded.walls.toggleDoor(b,broken.id).reason,'broken');
  assert.equal(loaded.walls.blocksMove(b.x+broken.cx,b.y+broken.cy,8,{isVehicle:false}),false);
  loaded.walls.breakDoorHit(b,damaged,st.doors[damaged.id].hp);assert.equal(st.doors[damaged.id].broken,true,'partial damage is not reset by load');
 }
 // Historical saves lack damage fields. They still restore the stored open/closed state.
 const old=structuredClone(data);for(const state of Object.values(old.walls))for(const d of Object.values(state.doors)){delete d.hp;delete d.broken;}
 const legacy=new Game(options);assert.equal(Save.applyWar(legacy,old),true);
 const b=legacy.world.buildings.find(b=>!b.dead&&b.type==='hq'&&b.faction===0&&legacy.walls.state(b));
 const st=legacy.walls.state(b),[damaged,broken]=st.outline.openings.filter(o=>o.type==='door');
 assert.equal(st.doors[damaged.id].state,'closed');assert.equal(st.doors[broken.id].state,'open');assert.equal(st.doors[broken.id].broken,false);
}
console.log('door damage: broken doors stay open; partial damage and breaks survive both save formats for both factions; old saves load');
