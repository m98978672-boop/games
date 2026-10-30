import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import fs from 'node:fs';
import * as THREE from 'three';
import {notchTreeGeometry} from '../src/tree-cut.js';
// A genuine opening in a trunk: the near surface disappears for a ray in the notch.
const trunk=new THREE.CylinderGeometry(.4,.4,3,16,1);trunk.translate(0,1.5,0);
const cut=notchTreeGeometry(trunk,0,.85);const mat=new THREE.MeshBasicMaterial({side:THREE.DoubleSide});
const ray=new THREE.Raycaster(new THREE.Vector3(2,.8,0),new THREE.Vector3(-1,0,0));
const first=geo=>{const mesh=new THREE.Mesh(geo,mat);mesh.updateMatrixWorld();return ray.intersectObject(mesh)[0].distance;};
assert.ok(first(cut)>first(trunk)+.5);assert.ok(cut.attributes.position.count>0);assert.ok(cut.userData.notch.progress>.8);
const dom=new JSDOM(fs.readFileSync('index.html','utf8'),{url:'http://localhost/',pretendToBeVisual:true,runScripts:'outside-only'});
globalThis.window=dom.window;globalThis.document=dom.window.document;Object.defineProperty(globalThis,'navigator',{value:dom.window.navigator,configurable:true});globalThis.localStorage=dom.window.localStorage;globalThis.HTMLElement=dom.window.HTMLElement;globalThis.requestAnimationFrame=dom.window.requestAnimationFrame=()=>0;
new Function(fs.readFileSync('tests/.harness-bundle.js','utf8'))();document.dispatchEvent(new window.Event('DOMContentLoaded',{bubbles:true}));document.getElementById('btn-start').click();await new Promise(r=>setTimeout(r,300));
const game=window.__game,r=game.resources,m=game.mobs;
const tree=r.nodes.find(n=>n.alive&&n.type==='tree'&&n.item.parts.some(p=>p.layer==='bark'));const hit={x:tree.x+2,z:tree.z};
let result=r.strike(tree,{chop:3.2},hit);assert.equal(result.depleted,false);const model=r.cutTrees.get(tree);assert.ok(model);assert.ok(tree.hp>0);const p=model.progress;
r.update(.1);assert.ok(Math.abs(model.pivot.quaternion.z)+Math.abs(model.pivot.quaternion.x)>0);
r.strike(tree,{chop:3.2},hit);assert.ok(model.progress>p);const hp=tree.hp,angle=tree.cutAngle;assert.ok(game.save());game.loadGame();assert.equal(tree.hp,hp);assert.equal(tree.cutAngle,angle);assert.ok(r.cutTrees.has(tree));
let strikes=2;while(tree.alive&&strikes<12){result=r.strike(tree,{chop:3.2},hit);strikes++;}assert.ok(strikes>=4);assert.ok(result.depleted);assert.ok(tree.item.collider.disabled);const fallen=r.cutTrees.get(tree);assert.ok(fallen.falling);r.update(1);const a=fallen.pivot.quaternion.angleTo(new THREE.Quaternion());r.update(1);assert.ok(fallen.pivot.quaternion.angleTo(new THREE.Quaternion())>a);assert.ok(r.cutTrees.has(tree));r.update(8);assert.equal(r.cutTrees.has(tree),false);
// A wild duel has a windup, respects cooldown and does not call the player's damage handler.
const snake=m.list.find(x=>x.type==='snake');const boar=m.list.find(x=>x.type==='boar');const others=m.list,blocked=m._blocked,sight=m._hasLineOfSight;
m.list=[snake,boar];m._blocked=()=>false;m._hasLineOfSight=()=>true;snake.x=0;snake.z=0;boar.x=1;boar.z=0;snake.hp=snake.maxHp;boar.hp=boar.maxHp;snake.alive=boar.alive=true;snake.wildTarget=null;boar.wildTarget=null;snake.biteTimer=boar.biteTimer=0;
m._findWildTarget(boar);assert.equal(boar.wildTarget,snake);const start=snake.hp;let playerHits=0;const ctx={onHit:()=>playerHits++};
m._wildCombat(boar,.1,ctx);assert.equal(snake.hp,start);m._animate(boar,.1);assert.notEqual(boar.parts.head.position.x,boar.parts.head.userData.wildBaseX);
m._wildCombat(boar,.2,ctx);assert.ok(snake.hp<start);assert.equal(snake.wildTarget,boar);const after=snake.hp;m._wildCombat(boar,.1,ctx);assert.equal(snake.hp,after);assert.equal(playerHits,0);
// When a target dies the combat stops.
m.kill(snake);m._wildCombat(boar,.1,ctx);assert.equal(boar.wildTarget,null);
// Exercise the normal frame loop: targets are acquired without an explicit combat call.
const oldHeight=game.world.heightAt,oldWater=m._canMoveWater;game.world.heightAt=()=>3;m._canMoveWater=()=>true;
snake.alive=true;snake.hp=snake.maxHp;snake.x=0;snake.z=0;snake.wildTarget=null;snake.wildThreat=null;snake.biteTimer=0;snake.huntAt=0;
boar.alive=true;boar.hp=boar.maxHp;boar.x=1;boar.z=0;boar.wildTarget=null;boar.wildThreat=null;boar.biteTimer=0;boar.huntAt=0;
const player={position:{x:30,z:0,y:3},velocity:{x:0,z:0}};
for(let i=0;i<25;i++)m.update(.1,player,{onHit:()=>playerHits++,night:0});
assert.ok(snake.hp<snake.maxHp);assert.ok(boar.hp<boar.maxHp);assert.equal(playerHits,0);
game.world.heightAt=oldHeight;m._canMoveWater=oldWater;m.list=others;m._blocked=blocked;m._hasLineOfSight=sight;
console.log('TREE/COMBAT: actual notch geometry, gradual cuts, save/load, falling, animated duels and cooldown OK');process.exit(0);
