import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import fs from 'node:fs';
const dom=new JSDOM(fs.readFileSync('index.html','utf8'),{url:'http://localhost/',pretendToBeVisual:true,runScripts:'outside-only'});
globalThis.window=dom.window;globalThis.document=dom.window.document;Object.defineProperty(globalThis,'navigator',{value:dom.window.navigator,configurable:true});globalThis.localStorage=dom.window.localStorage;globalThis.HTMLElement=dom.window.HTMLElement;globalThis.requestAnimationFrame=dom.window.requestAnimationFrame=()=>0;
new Function(fs.readFileSync('tests/.harness-bundle.js','utf8'))();document.dispatchEvent(new window.Event('DOMContentLoaded',{bubbles:true}));document.getElementById('btn-start').click();await new Promise(r=>setTimeout(r,300));
const g=window.__game,w=g.world,mobs=g.mobs,res=g.resources;
// Animals that cannot swim avoid both sea and flooded pits; they may escape.
const rabbit=mobs.list.find(m=>m.type==='rabbit');const heights=w.heightAt, pitAt=w.pitAt;
w.heightAt=(x,z)=>x<0?1:-1;w.pitAt=()=>null;rabbit.x=-1;rabbit.z=0;
assert.equal(mobs._canMoveWater(rabbit,1,0),false);
const fish=mobs.list.find(m=>m.type==='fish');fish.x=1;fish.z=0;assert.equal(mobs._canMoveWater(fish,-1,0),false);
w.heightAt=()=>1;w.pitAt=(x)=>x>0?{floorY:0,waterDepth:2,seaSource:false}:null;
assert.equal(mobs._canMoveWater(rabbit,1,0),false);w.heightAt=heights;w.pitAt=pitAt;
// Player wades and swims in a local pool above sea level, not in a dry depression.
const fakeWorld={ underground:false, heightAt:()=>2, waterLevelAt:()=>4, slopeAt:()=>0, resolveCollisions:()=>{} };
const controls={forward:false,back:false,left:false,right:false,sprint:false,jump:false,jumpHeld:false};
g.player.position.set(0,2,0);g.player.velocity.set(0,0,0);g.player.fly=false;g.player.update(.1,controls,fakeWorld);assert.equal(g.player.swimming,true);
fakeWorld.waterLevelAt=()=>null;g.player.position.set(0,2,0);g.player.grounded=true;g.player.update(.1,controls,fakeWorld);assert.equal(g.player.swimming,false);assert.equal(g.player.wading,0);
// Two adults produce a juvenile in a valid location; it matures and population is bounded.
const rabbits=mobs.list.filter(m=>m.type==='rabbit');const oldList=mobs.list, oldBlock=mobs._blocked, oldFree=w.isFree, oldSlope=w.slopeAt;
mobs.list=rabbits.slice(0,3);mobs._blocked=()=>false;w.heightAt=()=>3;w.pitAt=()=>null;w.isFree=()=>true;w.slopeAt=()=>0;
const [a,b,dead]=mobs.list;a.x=0;a.z=0;b.x=4;b.z=0;a.youngAt=undefined;b.youngAt=undefined;a.breedAt=0;b.breedAt=0;mobs.kill(dead);dead.deadTimer=3;dead.respawnAt=0;mobs.time=100;
mobs._ecologyStep();assert.ok(dead.alive);assert.equal(dead.youngAt,100);assert.equal(dead.group.scale.x,0.62);assert.ok(a.breedAt>mobs.time);
mobs.time=210;mobs._ecologyStep();assert.equal(dead.youngAt,undefined);assert.equal(dead.group.scale.x,1);
// Predator attacks appropriate prey only within reach.
const snake=oldList.find(m=>m.type==='snake');mobs.list=[snake,dead];snake.alive=true;snake.x=0;snake.z=0;dead.x=1;dead.z=0;dead.hp=2;dead.alive=true;
mobs._ecologyStep();assert.equal(dead.alive,false);
mobs.list=oldList;mobs._blocked=oldBlock;w.heightAt=heights;w.pitAt=pitAt;w.isFree=oldFree;w.slopeAt=oldSlope;
// Nearby plants seed depleted fixed slots faster and grow visibly.
const plants=res.nodes.filter(n=>n.type==='bush');const n=plants[0],parent=plants[1];const oldN={...n},oldP={...parent};parent.x=n.x+1;parent.z=n.z;parent.alive=true;n.alive=false;n.respawnAt=res.time+100;res.seedTimer=9;res._environmentStep(0);assert.ok(n.respawnAt<=res.time+90);
Object.assign(n,oldN);Object.assign(parent,oldP);
// Fire heats vegetation, damages it, then heavy rain extinguishes it.
const tree=res.nodes.find(n=>n.type==='tree'&&n.alive);const originalFire=res.campfires;res.campfires=[{x:tree.x,z:tree.z,fuel:100}];
for(let i=0;i<8;i++)res._environmentStep(0);assert.ok(res.burning.has(tree));const hp=tree.hp;res._environmentStep(0);assert.ok(tree.hp<hp);assert.ok(res.fireHazard({x:tree.x,z:tree.z}));for(let i=0;i<6;i++)res._environmentStep(1);assert.equal(res.burning.has(tree),false);res.campfires=originalFire;
// Player material gets wet and dries gradually.
const mat=g.player.environmentMaterials[0].mat;const before=mat.color.r;for(let i=0;i<20;i++)g.player.updateEnvironment(1,1,'soil',false);assert.ok(mat.color.r<before);const wet=g.player.environmentWet;g.player.updateEnvironment(10,0,'soil',false);assert.ok(g.player.environmentWet<wet);
// Existing deep mine leads to a new hell layer with safe arrival and actual damaging lava cells.
g.mine.enter(0,null);g.mine.digDown();assert.equal(g.mine.active,1);const spot=g.mine.digDown();assert.equal(g.mine.active,2);assert.ok(g.mine.level.hell);assert.equal(g.mine.level.y,-64);assert.equal(g.mine.inLava(spot.x,spot.z),false);
const idx=g.mine.level.grid.findIndex(c=>c?.type==='lava');assert.ok(idx>=0);const lx=g.mine._worldX(idx%34),lz=g.mine._worldZ(Math.floor(idx/34));assert.equal(g.mine.inLava(lx,lz),true);const mesh=g.mine.level.lavaGroup.children[0];const initial=mesh.material.emissiveIntensity;g.mine.update(.4);assert.notEqual(mesh.material.emissiveIntensity,initial);
console.log('ENVIRONMENT: land/water boundaries, reproduction, predation, seeds, fire/rain, wet model, hell and lava OK');process.exit(0);
