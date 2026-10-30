import assert from 'node:assert/strict';
import { FixedClock } from './clock.mjs';
import { planRules } from './scheduler.mjs';
import { burnFuel } from './fire.mjs';

const elapsed = chunks => {
  const clock = new FixedClock({step:1/30,maxSteps:4});
  let time=0; for (const dt of chunks) clock.advance(dt, delta=>{ time += delta; });
  while (clock.accumulator + 1e-9 >= clock.step) clock.advance(0, delta=>{ time += delta; });
  return {tick:clock.tick,time,remaining:clock.accumulator};
};
const a=elapsed(Array(60).fill(1/60));
const b=elapsed([.1,.2,.05,.15,.1,.1,.1,.1,.1]);
assert.equal(a.tick,30); assert.equal(b.tick,30); assert.ok(Math.abs(a.time-b.time)<1e-9);
const backlog = new FixedClock();
assert.equal(backlog.advance(.5,()=>{}).steps,4);
assert.ok(backlog.accumulator > .3, 'задолженное время не теряется');
const failing = new FixedClock();
assert.throws(()=>failing.advance(.04,()=>{throw Error('test');}),/test/);
assert.equal(failing.tick,0); assert.ok(failing.accumulator >= .04);
assert.throws(()=>failing.advance(-1,()=>{}),/Некорректный/);
const order=[]; const tasks=planRules([{id:'b',after:['a'],run:()=>order.push('b')},{id:'a',run:()=>order.push('a')}]); tasks.forEach(run=>run());
assert.deepEqual(order,['a','b']);
assert.throws(()=>planRules([{id:'a',after:['b'],run(){}},{id:'b',after:['a'],run(){}}]), /Цикл/);
assert.throws(()=>planRules([{id:'a',after:['unknown'],run(){}}]), /Неизвестная/);
const fires=[{x:1,z:2,fuel:2},{x:3,z:4,fuel:.01},{x:0,z:0,fuel:0}];
assert.deepEqual(burnFuel(fires, .1),[1.9,0,0]); assert.equal(fires[0].fuel,2);
assert.throws(()=>burnFuel([{x:0,z:0,fuel:NaN}],.1));
console.log('ПЕРЕПЛЁТ: ЧАСЫ, ЗАДАЧИ И ТОПЛИВО OK');
