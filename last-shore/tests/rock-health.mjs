import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import fs from 'node:fs';
import path from 'node:path';
const dir = path.resolve(import.meta.dirname, '..');
const dom = new JSDOM(fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), {url:'http://localhost/', pretendToBeVisual:true, runScripts:'outside-only'});
globalThis.window=dom.window; globalThis.document=dom.window.document;
Object.defineProperty(globalThis, 'navigator', {value:dom.window.navigator,configurable:true});
globalThis.localStorage=dom.window.localStorage; globalThis.sessionStorage=dom.window.sessionStorage;
globalThis.HTMLElement=dom.window.HTMLElement;
globalThis.requestAnimationFrame=dom.window.requestAnimationFrame=()=>0;
new Function(fs.readFileSync(path.join(dir, 'tests/.harness-bundle.js'), 'utf8'))();
document.dispatchEvent(new window.Event('DOMContentLoaded',{bubbles:true}));
document.getElementById('btn-start').click();
await new Promise(r => setTimeout(r, 300));
const game=window.__game; assert.ok(game?.running);
const rocks=game.resources.nodes.filter(n=>n.type==='rock');
for (const [type, hp] of [['sandstone',10],['granite',14],['basalt',18],['ore',16]]) {
  const rock=rocks.find(n=>n.rockType===type); assert.ok(rock, type); assert.equal(rock.hp,hp);
  game.aim={target:{kind:'node',node:rock}}; assert.match(game.aimPromptHtml(),new RegExp(`HP ${hp}/${hp}`));
  game.resources.strike(rock,{mine:0}); assert.ok(rock.hp < hp);
  // После перезагрузки восстановление узла использует HP своей породы.
  game.resources.strike(rock,{mine:100}); assert.equal(rock.alive,false); assert.equal(rock.hp,hp);
}
assert.ok(game.save());
const dead=rocks.find(n=>n.rockType==='basalt'); dead.alive=true; game.loadGame();
assert.equal(dead.alive,false); assert.equal(dead.hp,dead.maxHp);
const world=game.world;
let spot;
for(let x=-100; x<100 && !spot; x+=5) for(let z=-100; z<100; z+=5) if(world.surfaceOf(x,z).surface==='soil' && world.heightAt(x,z)>1) {spot={x,z}; break;}
assert.ok(spot);
const key=world._digKey(spot.x,spot.z);
for (const [depth, type, hp] of [[1.35,'sandstone',12],[1.95,'granite',20],[2.65,'basalt',30],[3.3,'obsidian',46]]) {
  world.digStore.set(key,depth+0.01); const probe=world.probeAt(spot.x,spot.z);
  assert.equal(probe.rock.id,type); assert.equal(probe.maxHp,hp); assert.ok(probe.hp>0 && probe.hp<hp);
  game.aim={target:{kind:'ground',point:{...spot,y:world.heightAt(spot.x,spot.z)}}};
  assert.match(game.aimPromptHtml(), new RegExp(`HP .*${hp}`));
}
world.digStore.set(key,2.66); const before=world.probeAt(spot.x,spot.z);
const result=world.dig(spot.x,spot.z,{radius:1.2,depth:0.1,mine:3});
assert.equal(result.hard,false); assert.ok(world.probeAt(spot.x,spot.z).hp<before.hp);
const mine=game.mine; mine.enter(0,mine.entrances[0]); const lvl=mine.level;
let target;
for(let cz=1;cz<33&&!target;cz++) for(let cx=1;cx<33&&!target;cx++) {
  if(!lvl.grid[mine._cellKey(cx,cz)]?.open) continue;
  for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]) {
    const key=mine._cellKey(cx+dx,cz+dz);
    if(!lvl.grid[key]?.open && cx+dx>0 && cx+dx<33 && cz+dz>0 && cz+dz<33) {target={cx,cz,dx,dz};break;}
  }
}
assert.ok(target);
// Внутренние закрытые клетки превращаются в доступные стены после проходки.
// Эмулируем такую клетку, которая изначально не входила в список жил.
const exposedKey=mine._cellKey(target.cx+target.dx,target.cz+target.dz); lvl.veins.delete(exposedKey);
const origin={x:mine._worldX(target.cx),z:mine._worldZ(target.cz)};
let probe=mine.probe(origin,target.dx,target.dz,4); assert.equal(probe.type,'stone'); assert.equal(probe.hp,2.6);
const first=mine.strike(origin,target.dx,target.dz,0,4); assert.equal(first.broken,false);
probe=mine.probe(origin,target.dx,target.dz,4); assert.ok(Math.abs(probe.hp-1.6)<1e-9);
const second=mine.strike(origin,target.dx,target.dz,0,4); assert.equal(second.broken,false);
const third=mine.strike(origin,target.dx,target.dz,0,4); assert.equal(third.broken,true);
const types={}; for(const level of mine.levels) for(const v of level.veins.values()) types[v.type] ??= v.hp;
assert.equal(types.stone,2.6); assert.equal(types.ore,3.4); assert.equal(types.crystal,3.8); assert.equal(types.obsidian,4.2);
console.log('HP ПОРОД: СЛОИ, ВАЛУНЫ И ШАХТА OK'); process.exit(0);
