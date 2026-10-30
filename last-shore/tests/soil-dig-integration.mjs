import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';import fs from 'node:fs';import * as THREE from 'three';
const dom=new JSDOM(fs.readFileSync('index.html','utf8'),{url:'http://localhost/',pretendToBeVisual:true,runScripts:'outside-only'});
globalThis.window=dom.window;globalThis.document=dom.window.document;Object.defineProperty(globalThis,'navigator',{value:dom.window.navigator,configurable:true});globalThis.localStorage=dom.window.localStorage;globalThis.HTMLElement=dom.window.HTMLElement;globalThis.requestAnimationFrame=dom.window.requestAnimationFrame=()=>0;
new Function(fs.readFileSync('tests/.harness-bundle.js','utf8'))();document.dispatchEvent(new window.Event('DOMContentLoaded',{bubbles:true}));document.getElementById('btn-start').click();await new Promise(r=>setTimeout(r,300));
const game=window.__game,w=game.world;let spot;
for(let x=-100;x<100&&!spot;x+=5)for(let z=-100;z<100;z+=5)if(w.surfaceOf(x+.25,z+.35).surface==='soil'&&w.heightAt(x+.25,z+.35)>3){spot={x:x+.25,z:z+.35};break;}
assert.ok(spot);const ray=(x,z)=>{w.terrain.updateMatrixWorld(true);return new THREE.Raycaster(new THREE.Vector3(x,500,z),new THREE.Vector3(0,-1,0)).intersectObject(w.terrain).length;};
assert.ok(ray(spot.x,spot.z));const before=w.terrain.geometry.attributes.position.count;
w.dig(spot.x,spot.z,{radius:.5,depth:.45,mine:99});const pit=w.pitAt(spot.x,spot.z);assert.ok(pit);assert.equal(pit.rect.x1-pit.rect.x0,1);assert.equal(pit.rect.z1-pit.rect.z0,1);assert.equal(ray(spot.x,spot.z),0);assert.ok(ray(pit.rect.x1+0.3,spot.z));assert.ok(w.terrain.geometry.attributes.position.count>before);
// Terrain modifications after a cut must preserve the opening and aligned geometry.
w.levelSpot(pit.rect.x1+5,pit.rect.z1+5,1);assert.equal(ray(spot.x,spot.z),0);
assert.ok(w._dropPit(pit));w._rebuildTerrainIndex();assert.ok(ray(spot.x,spot.z));assert.equal(w.terrain.geometry.attributes.position.count,before);
console.log('SOIL DIG: 1m² real mesh hole, surrounding ground, later terrain update and restore OK');process.exit(0);
