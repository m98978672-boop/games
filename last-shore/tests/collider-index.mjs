// Сравнение с полным перебором: попадания, обзор, добавление/отключение.
import assert from 'node:assert/strict';
import { Mobs } from '../src/mobs.js';
let seed = 43791;
const rng = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 2 ** 32);
const world = {colliders: [], heightAt: () => 0, shells: {blocked: () => false}};
const mobs = Object.assign(Object.create(Mobs.prototype), {world});
for (let i = 0; i < 900; i++) world.colliders.push({
  x: rng() * 200 - 100, z: rng() * 200 - 100, r: rng() * 4,
  disabled: rng() < 0.08, fire: rng() < 0.05, kind: rng() < 0.05 ? 'den' : 'rock',
});
// Крупный коллайдер за несколько ячеек, в отрицательной области.
world.colliders.push({x:-31,z:-25,r:20});
function oldBlocked(x,z,r,strict) {
  const pad=strict?0:r*.2;
  return world.colliders.some(c => {
    if(c.disabled || c.fire || c.kind==='den' || (c.r<.3&&!strict)) return false;
    return (x-c.x)**2+(z-c.z)**2<(c.r+r+pad)**2;
  });
}
function oldSight(a,b) {
  return !world.colliders.some(c=>!c.disabled && c.r>=.3 && mobs._segmentHitsCircle(a,b,c,c.r*.85));
}
function check(n) {
  for(let i=0;i<n;i++) {
    const x=rng()*240-120,z=rng()*240-120,r=rng()*3,strict=rng()>.5;
    assert.equal(mobs._blocked(x,z,r,strict),oldBlocked(x,z,r,strict),`blocked ${x},${z}`);
    const b={x:x+(rng()-.5)*35,z:z+(rng()-.5)*35};
    assert.equal(mobs._hasLineOfSight({x,z},b),oldSight({x,z},b),`sight ${x},${z}`);
  }
}
check(10000);
world.colliders.push({x:230,z:230,r:5});
assert.equal(mobs._blocked(230,230,1),true, 'добавленный объект');
world.colliders.at(-1).disabled=true;
assert.equal(mobs._blocked(230,230,1),false, 'отключённый объект');
world.colliders=[{x:230,z:230,r:12}];
assert.equal(mobs._blocked(220,230,1),true, 'заменённый массив');
world.colliders.length=0;
assert.equal(mobs._blocked(220,230,1),false, 'очищенный массив');
world.shells.blocked=()=>true;
assert.equal(mobs._blocked(300,300,1),true, 'оболочки по-прежнему учитываются');
console.log('collider-index: 20000 сравнений с полным перебором + мутации, OK');
