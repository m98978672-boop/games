// Условия света, физиология и фактический шаг рабочего — без браузера.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const Model = require('../src/sim/model.js');
const Sim = require('../src/sim/warehouse.js');
const Worker = require('../src/sim/worker.js');
const Brain = require('../src/ai/brain-net.js');
const brain = require('../data/brain_weights.json');
assert.equal(Sim.illuminationAt('day', 0, 12),1);
assert(Sim.illuminationAt('night',-9.6,9.5) > Sim.illuminationAt('night',0,12));
assert(Sim.illuminationAt('night',-1.6,0) > Sim.illuminationAt('night',11,6));
for (const x of [-10,0,10]) for (const y of [-8,0,8,12]) {
  const value = Sim.illuminationAt('night',x,y);
  assert(value >= 0 && value <= 1);
}
const bright = Model.createBody({},{}), dark = Model.createBody({},{}), fallback = Model.createBody({},{});
for (let i=0;i<100;i++) {
  Model.stepBody(bright,.1,{intensity:.3, light:1});
  Model.stepBody(dark,.1,{intensity:.3, light:.38});
  Model.stepBody(fallback,.1,{intensity:.3});
}
assert(Math.abs(bright.vision-fallback.vision) < 1e-12, 'старое обучение работает как при дневном свете');
assert(bright.vision > dark.vision + .15, 'в темноте зрение постепенно снижается');
assert(Model.dropRisk(dark,{pace:.5,caution:.5,precision:.5},15) > Model.dropRisk(bright,{pace:.5,caution:.5,precision:.5},15));
const prev = dark.vision;
for (let i=0;i<100;i++) Model.stepBody(dark,.1,{intensity:.3, light:1});
assert(dark.vision > prev + .15, 'зрение восстанавливается на свету');
// Пропуск режима в окружении — дневной, для существующих обучающих скриптов.
const wh = Sim.createWarehouse({seed:42});
function create(id) { return Worker.createWorker({id, name:id, model:Model, layout:wh.layout, spawn:{x:0,y:12}, traits:{}}); }
const a = create('one'), b = create('two');
const rng = Sim.createRng(20);
for (const w of [a,b]) w.state.mode = 'manual';
for (let i=0;i<100;i++) {
  a.update(.1,{warehouse:wh, workers:[a], brain, brainApi:Brain, rng, shiftMode:'night'});
  b.update(.1,{warehouse:wh, workers:[b], brain, brainApi:Brain, rng, shiftMode:'day'});
}
assert(a.body.vision < b.body.vision - .1, 'освещённость передаётся в реальный шаг рабочего');
console.log('✓ Ночной свет: зоны фонарей, зрение, риск, восстановление и совместимость обучения');
