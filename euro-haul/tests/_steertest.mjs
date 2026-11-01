// Проверка направления и плавности руля: node tests/_steertest.mjs
import { JSDOM } from 'jsdom';
const dom = new JSDOM('<!doctype html><html></html>', { pretendToBeVisual: true });
globalthis: {}
const { TruckSim } = await import('../src/core/physics.js');
const { TRUCK_MODELS } = await import('../src/data/trucks.js');
const model = TRUCK_MODELS.find((m) => m.id === 'auriga-3') || TRUCK_MODELS[0];
const t = new TruckSim(model, {});
t.speed = 20;
t.gear = 8;
t.engineOn = true;
const road = { curv: 0, grade: 0, speedLimit: 90 };
const log = [];
for (let i = 0; i < 90; i++) {
  t.step(1 / 90, { throttle: 0.6, brake: 0, steer: 1 }, road);
  if (i % 15 === 14) log.push({ t: +(i / 90).toFixed(2), lat: +t.lat.toFixed(3), yaw: +t.yawRel.toFixed(4), steer: +t.steer.toFixed(3) });
}
console.log('руль вправо (steer=+1):', JSON.stringify(log));
const t2 = new TruckSim(model, {});
t2.speed = 20; t2.gear = 8; t2.engineOn = true;
const log2 = [];
for (let i = 0; i < 90; i++) {
  t2.step(1 / 90, { throttle: 0.6, brake: 0, steer: -1 }, road);
  if (i % 15 === 14) log2.push({ t: +(i / 90).toFixed(2), lat: +t2.lat.toFixed(3), steer: +t2.steer.toFixed(3) });
}
console.log('руль влево (steer=-1):', JSON.stringify(log2));
console.log('знак: вправо lat должен уменьшаться (мир -x = экран справа)');
