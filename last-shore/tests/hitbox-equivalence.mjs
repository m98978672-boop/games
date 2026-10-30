// Сравнение с эталоном до оптимизации: 300 воспроизводимых сцен столкновений.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import * as THREE from 'three';
const { HitboxSystem } = await import(process.env.HITBOX_MODULE || '../src/hitboxes.js');
let seed=427923;
const rand=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/2**32);
const near=()=> (rand()-.5)*5;
const outcomes=[];
for(let i=0;i<300;i++) {
  const player={position:new THREE.Vector3(near(),0,near()),velocity:new THREE.Vector3(near(),0,near()),facing:rand()*Math.PI*2};
  const hitboxes=new HitboxSystem(new THREE.Scene(),player);
  const world={colliders:[],heightAt:()=>0};const mobs={list:[]};const extraBoxes=[];
  for(let j=0;j<12;j++) {
    const x=near(),z=near(),r=.15+rand();
    world.colliders.push({x,z,r,height:.8+rand(),disabled:rand()<.1,soft:rand()<.1});
    hitboxes.registerStatic('rock',{x,y:0,z,w:r*2,h:2,d:r*2,yaw:rand()*2},{physical:rand()<.8});
  }
  for(let j=0;j<7;j++) {
    const x=near(),z=near(),w=.2+rand(),d=.2+rand(),facing=rand()*Math.PI*2;
    const mob={x,z,y:0,facing,alive:rand()>.1,def:{flying:false},hitboxSize:{w,h:1.5,d}};mobs.list.push(mob);
    hitboxes.register('mob',()=>mob.alive?{x:mob.x,y:0,z:mob.z,w,h:1.5,d,yaw:facing}:null,{physical:true,ref:mob});
  }
  if(i%2===0) extraBoxes.push({minX:-.3,maxX:.3,minY:0,maxY:2,minZ:-.3,maxZ:.3,physical:true});
  const count=hitboxes.resolvePlayer(player,world,{mobs,extraBoxes});
  outcomes.push([player.position.x,player.position.z,player.velocity.x,player.velocity.z,count,hitboxes.lastPushes].map(v=>Math.round(v*1e8)/1e8));
}
const hash=createHash('sha256').update(JSON.stringify(outcomes)).digest('hex');
const expected='d292093767e55a2be238a2128226ba9b3bb3e52d64aa55336186bd121f82803a';
if(process.env.HITBOX_MODULE) console.log(hash);
else { assert.equal(hash,expected,'collision results changed'); console.log('HITBOX: 300 collision scenes match pre-optimization results'); }
