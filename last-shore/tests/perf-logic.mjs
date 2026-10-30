// Локальный воспроизводимый замер CPU-логики (Three.js renderer заглушен).
// Он не измеряет FPS экрана или GPU. Перед запуском: npm run test:build
import { JSDOM } from 'jsdom';
import fs from 'node:fs';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
const dir = path.resolve(import.meta.dirname, '..');
const dom = new JSDOM(fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), {url:'http://localhost/', pretendToBeVisual:true, runScripts:'outside-only'});
globalThis.window=dom.window; globalThis.document=dom.window.document;
Object.defineProperty(globalThis,'navigator',{value:dom.window.navigator,configurable:true});
globalThis.localStorage=dom.window.localStorage; globalThis.sessionStorage=dom.window.sessionStorage;
globalThis.HTMLElement=dom.window.HTMLElement;
globalThis.requestAnimationFrame=dom.window.requestAnimationFrame=()=>0;
new Function(fs.readFileSync(path.join(dir,'tests/.harness-bundle.js'),'utf8'))();
document.dispatchEvent(new window.Event('DOMContentLoaded',{bubbles:true}));
document.getElementById('btn-start').click(); await new Promise(r=>setTimeout(r,350));
const game=window.__game; if(!game?.running) throw new Error('Игра не запустилась');
const timings={};
for (const [label,obj,name] of [['mobs',game.mobs,'update'],['mob_blocked',game.mobs,'_blocked'],['hitbox',game.hitboxes,'resolvePlayer'],['aim',game.hitboxes,'raycast'],['collisions',game.world,'resolveCollisions'],['resources',game.resources,'update'],['chunks',game.world,'updateChunks']]) {
  const old=obj[name]; timings[label]={ms:0,calls:0};
  obj[name]=function(...args){ const t=performance.now(); try { return old.apply(this,args); } finally {timings[label].ms+=performance.now()-t;timings[label].calls++;} };
}
for(let i=0;i<50;i++) game.update(1/120);
for(const t of Object.values(timings)){t.ms=0;t.calls=0;}
const samples=[];
for(let i=0;i<300;i++){const t=performance.now();game.update(1/120);samples.push(performance.now()-t);}
samples.sort((a,b)=>a-b);
console.log(JSON.stringify({environment:'jsdom + stub renderer, 300 updates, not display FPS',median_ms:samples[150],p95_ms:samples[285],subsystems:timings,objects:{colliders:game.world.colliders.length,mobs:game.mobs.list.length}},null,2));
process.exit(0);
