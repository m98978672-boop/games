import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import fs from 'node:fs';
import { advancePitWater } from '../src/ground-physics.js';
const pitModel = { floorY: -1, exitY: 1, surface: 'sand' };
for (let i = 0; i < 50; i++) advancePitWater(pitModel, 0.2, 0, 0);
assert.ok(pitModel.waterDepth > 0.95 && pitModel.waterDepth <= 1);
assert.ok(pitModel.wetness > 0.3);
const rainModel = { floorY: 3, exitY: 4, surface: 'soil' };
for (let i = 0; i < 100; i++) advancePitWater(rainModel, 0.2, 1, 0);
assert.ok(rainModel.waterDepth > 0.4 && rainModel.waterDepth < 0.5);
const prior = rainModel.waterDepth;
for (let i = 0; i < 100; i++) advancePitWater(rainModel, 0.2, 0, 0);
assert.ok(rainModel.waterDepth < prior);
const dom = new JSDOM(fs.readFileSync('index.html','utf8'),{url:'http://localhost/',pretendToBeVisual:true,runScripts:'outside-only'});
globalThis.window=dom.window;globalThis.document=dom.window.document;Object.defineProperty(globalThis,'navigator',{value:dom.window.navigator,configurable:true});globalThis.localStorage=dom.window.localStorage;globalThis.HTMLElement=dom.window.HTMLElement;globalThis.requestAnimationFrame=dom.window.requestAnimationFrame=()=>0;
new Function(fs.readFileSync('tests/.harness-bundle.js','utf8'))();document.dispatchEvent(new window.Event('DOMContentLoaded',{bubbles:true}));document.getElementById('btn-start').click();await new Promise(r=>setTimeout(r,300));
const game=window.__game,w=game.world;let spot;
for(let x=-100;x<100&&!spot;x+=5)for(let z=-100;z<100;z+=5)if(w.surfaceOf(x+.25,z+.35).surface==='soil'&&w.surfaceOf(x+1.25,z+.35).surface==='soil'&&w.heightAt(x+.25,z+.35)>3){spot={x:x+.25,z:z+.35};break;}
assert.ok(spot);
const {x,z}=spot;const start=w.heightAt(x,z);
for(let i=0;i<5;i++){const r=w.strikeGround(x,z,{power:1});assert.ok(r.pending);assert.equal(w.heightAt(x,z),start);assert.equal(w.groundDamageAt(x,z).remaining,5-i);}
let r=w.strikeGround(x,z,{power:1});assert.equal(r.pending,false);assert.ok(w.heightAt(x,z)<start);const p=w.pitAt(x,z);assert.equal(p.rect.x1-p.rect.x0,1);assert.equal(w.groundDamageAt(x,z).remaining,6);
const adjacent={x:x+1,z};for(let i=0;i<6;i++)r=w.strikeGround(adjacent.x,adjacent.z,{power:1});assert.ok(r.collapse);const merged=w.pitAt(x,z);assert.ok(merged.debrisMotion.some(v=>v.active));const y=merged.debrisMotion[0].mesh.position.y;
w.updatePitPhysics(0.2,1);assert.notEqual(merged.debrisMotion[0].mesh.position.y,y);
for(let i=0;i<30;i++)w.updatePitPhysics(0.2,1);assert.ok(merged.debrisMotion.every(v=>!v.active));
for(let i=0;i<3;i++)w.dig(x,z,{radius:.5,depth:.45,mine:99});
for(let i=0;i<100;i++)w.updatePitPhysics(0.2,1);assert.ok(merged.waterMesh.visible);assert.ok(merged.wetness>0.1);assert.equal(w.probeAt(x,z).layer,'stone');const hard=w.strikeGround(x,z,{power:100,mine:0});assert.ok(hard.hard);const status=w.groundDamageAt(x,z);const hit=w.strikeGround(x,z,{power:100,mine:2});assert.ok(hit.pending);assert.ok(w.groundDamageAt(x,z).remaining<status.remaining);
// One game frame while paused must not advance the dedicated pit simulation.
const depth=merged.waterDepth;game.pause();game.frame();assert.equal(merged.waterDepth,depth);
console.log('GROUND: cumulative 1m hits, rock tools, collapse debris, rainfall, sea fill, drying and pause OK');process.exit(0);
