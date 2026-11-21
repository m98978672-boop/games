import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require = createRequire(import.meta.url);
const {assess} = require('../src/safety.js');
const model = require('../src/sim/model.js');
function person(id) {
  return {state:{id,name:'Рабочий ' + id,state:'idle',dead:false},body:{energy:.8,fatigue:.2,vitality:1,hydration:.8,pain:0,collapsed:false,injuries:[]}};
}
const a=person('a'), b=person('b'), c=person('c'), d=person('d');
assert.deepEqual(assess([a,b,c,d],model.BODY_PARTS),[]);
a.body.energy=.24; a.body.fatigue=.83; a.body.hydration=.3; a.body.pain=.4; a.body.injuries=[{part:'back',severity:.02}];
assert.deepEqual(assess([a],model.BODY_PARTS),[]);
a.body.energy=.239; a.body.fatigue=.84; a.body.hydration=.29; a.body.pain=.41;
a.body.injuries=[{part:'back',severity:.2},{part:'head',severity:.5}];
b.body.collapsed=true; c.body.injuries=[{part:'knee',severity:.1}]; d.body.vitality=.29;
const before=JSON.stringify([a,b,c,d]);
const alerts=assess([a,b,c,d],model.BODY_PARTS);
assert.equal(JSON.stringify([a,b,c,d]),before, 'показатели не меняют здоровье или физику');
assert.deepEqual(alerts.map(x=>x.id),['b','d','a','c']);
assert.deepEqual(alerts.map(x=>x.rank),[3,3,2,1]);
assert(alerts[2].reasons.some(r=>r.includes('голова 50% (всего 2)')));
assert(alerts[2].reasons.some(r=>r.includes('энергия 24%')));
assert(alerts[2].reasons.some(r=>r.includes('вода 29%')));
assert(alerts[2].reasons.some(r=>r.includes('боль 41%')));
b.body.collapsed=false; b.state.state='down';
assert(assess([b],model.BODY_PARTS)[0].reasons.includes('восстановление после обморока'));
b.state.dead=true; assert.deepEqual(assess([b],model.BODY_PARTS),[]);
assert.deepEqual(assess([],model.BODY_PARTS),[]);
console.log('✓ Сводка бригады: пороги, несколько причин, тяжесть, восстановление и отсутствие влияния на симуляцию');
